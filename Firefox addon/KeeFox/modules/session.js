/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
Copyright 2008-2013 Chris Tomlinson <keefox@christomlinson.name>

session.js manages the low-level transport connection between this
client and an KeePassRPC server.

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
"use strict";

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cu = Components.utils;

var EXPORTED_SYMBOLS = ["session"];

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://kfmod/KFLogger.js");
Cu.import("resource://kfmod/sessionLegacy.js");

var log = KFLog;

function session()
{
    this.reconnectionAttemptFrequency = 2000;
    this.connectionTimeout = 10000; // short timeout for connections
    this.activityTimeout = 3600000; // long timeout for activity
    this.connectLock = false; // protect the connect function so only one event
                        // thread (e.g. timer) can execute it at the same time
    this.fastRetries = 0;

    this.webSocketPort = 12546;
    this.webSocketHost = "127.0.0.1";
    this.webSocketURI = "ws://" + this.webSocketHost + ":" + this.webSocketPort;
    this.webSocket = null;

    // The connectFailCount can be incremented by failed HTTP or WS connections
    this.connectFailCount = 0;
    
    // We use a HTTP channel for basic polling of the port listening status of
    // the KPRPC server because it's quick and not subject to the rate limiting
    // of webSocket connections as per Firefox bug #711793 and RFC 7.2.3:
    // http://tools.ietf.org/html/rfc6455#section-7.2.3
    // See KeeFox issue #189 for connection algorithm overview:
    // https://github.com/luckyrat/KeeFox/issues/189#issuecomment-23635771
    this.httpChannel = null;
    this.httpChannelURI = "http://" + this.webSocketHost + ":" + this.webSocketPort;
}

session.prototype = new sessionLegacy();
session.prototype.constructor = session;

(function() {

    this.reconnectTimer = null;
    this.onConnectDelayTimer = null;
    this.connectionProhibitedUntil = new Date(0);

    // It would be neater to pause this timer when we know we are connected
    // but the overhead is so minimal (and so essential in most cases - i.e.
    // all times when the user does not have KeePass open) that we just
    // leave it running to avoid complications that would come from trying
    // to synchronise the state of the timer with the connection state.
    this.reconnectSoon = function()
    {
        log.debug("Creating a reconnection timer.");
         // Create a timer 
         this.reconnectTimer = Components.classes["@mozilla.org/timer;1"]
                    .createInstance(Components.interfaces.nsITimer);
         
         this.reconnectTimer.initWithCallback(this.reconnectNow,
            this.reconnectionAttemptFrequency,
            Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
    }
    
    this.reconnectVerySoon = function()
    {
        log.debug("Creating a fast reconnection timer.");
        
        this.fastRetries = 40; // 10 seconds of more frequent connection attempts
        
         // Create a timer 
         this.reconnectTimer = Components.classes["@mozilla.org/timer;1"]
                    .createInstance(Components.interfaces.nsITimer);
         
         this.reconnectTimer.initWithCallback(this.reconnectNow,
            250,
            Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
    }

    //TODO1.3: Is it OK to call this directly from the close event of the old HTTP connection?
    // If not, we might need to setTimeout around this function to force it onto another thread
    // rpc is essentially "this"
    this.httpConnectionAttemptCallback = function(attemptWebSocket) {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                    .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
        var rpc = window.keefox_org.KeePassRPC;

        if (attemptWebSocket)
        {
            log.debug("Attempting to connect to RPC server webSocket.");
            var connectResult = rpc.connect();
            if (connectResult == "alive")
                log.debug("Connection already established.");
            if (connectResult == "locked")
                log.debug("Connection attempt already underway.");
        } else
        {
            rpc.connectFailCount++;

            // It is possible that the initial HTTP connection failed because
            // only a legacy KPRPC server is listening. However, it's far more
            // likely that the user has just not got KeePass open at the
            // moment so we will cut down on some un-necessary legacy connection
            // attempts at the expense of a longer delay when each user
            // upgrades from KeeFox 1.2.x
            //TODO2: Remove this when KeeFox 1.3+ usage is sufficiently high (first check in Jan 2015)
            if (rpc.connectFailCount >= 10)
            {
                log.debug("Failed to init a HTTP connection many times so will try legacy connection instead.");
                rpc.connectFailCount = 0;
                rpc.connectLegacy();
            }
        }
    }
    
    // Initiates a connection to the KPRPC server. First we try a webSocket
    // then (eventually) a legacy TCP connection.
    this.connect = function()
    {
        if (this.connectLock)
            return "locked";
        if (this.webSocket !== undefined && this.webSocket !== null && this.webSocket.readyState != 3)
            return "alive";
        if (this.connectionProhibitedUntil.getTime() > (new Date()).getTime())
            return "locked";

        log.debug("Trying to open a webSocket connection");

        this.connectLock = true;
        try
        {
            // Use the app's hidden window to establish the webSocket.
            // One day we should be able to use a worker instead but webSocket
            // support in workers is not an option as of FF17 ESR and I suspect
            // that a websocket created from a specific window will leak a ref to that window. 
            var window = Components.classes["@mozilla.org/appshell/appShellService;1"]
                             .getService(Components.interfaces.nsIAppShellService)
                             .hiddenDOMWindow;
            this.webSocket = new window.WebSocket(this.webSocketURI);
        } catch (ex)
        {
            // This shouldn't happen much - most errors will be caught in the onerror function below

            this.connectLock = false;
            this.connectFailCount++;

            // webSocket spec says that we can't know why there was an error so we must
            // always attempt to establish a legacy connection
            // but we can be extra conservative here because it is highly unlikely that
            // the initial HTTP connection attempt status code led us to this point if
            // a legacy server is listening
            if (this.connectFailCount >= 30)
            {
                log.debug("Failed to open a webSocket connection many times so will try legacy connection instead. Exception: " + ex);
                this.connectFailCount = 0;
                return this.connectLegacy();
            }
            return;
        }

        this.webSocket.onopen = function (event) {
            log.info("Websocket connection opened");
            
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");
            window.keefox_org.KeePassRPC.connectLock = false;
            window.keefox_org.KeePassRPC.connectFailCount = 0;

            //TODO1.3: track auth attempts so we can be sensible about repeatedly trying when there are permenant faults - set up and use various error codes from srp protocol, etc.
            // prob. don't want to actually do that here...
            
            // Start the SRP or shared key negotiation
            window.keefox_org.KeePassRPC.setup();
        };
        this.webSocket.onmessage = function (event) {
            log.debug("received message from web socket");

            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");

            let obj = JSON.parse(event.data);
                
            // if we failed to parse an object from the JSON    
            if (!obj)
            {
                log.error("received bad message from web socket. Can't parse from JSON.");
                return;
            }
            window.keefox_org.KeePassRPC.receive(obj);
        };
        this.webSocket.onerror = function (event) {
            log.debug("Websocket connection error");
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");
            window.keefox_org.KeePassRPC.connectLock = false;
            window.keefox_org.KeePassRPC.connectFailCount++;

            // webSocket spec says that we can't know why there was an error so we must
            // always attempt to establish a legacy connection
            // but we can be extra conservative here because it is highly unlikely that
            // the initial HTTP connection attempt status code led us to this point if
            // a legacy server is listening
            if (window.keefox_org.KeePassRPC.connectFailCount >= 30)
            {
                log.debug("Websocket connection failed many times so going to try legacy connection");
                window.keefox_org.KeePassRPC.connectFailCount = 0;
                window.keefox_org.KeePassRPC.connectLegacy(); // scope wrong?
            }
            log.debug("Websocket connection error end");
        };
        this.webSocket.onclose = function (event) {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");
            
            log.debug("Notifying interested observers that the websocket has closed");
            Components.classes["@mozilla.org/observer-service;1"]
              .getService(Components.interfaces.nsIObserverService)
              .notifyObservers(null, "KPRPCConnectionClosed", null);
            window.keefox_org._pauseKeeFox();
            log.debug("Websocket connection closed");
        };

    };

    this.reconnectNow = { 
        notify: function(timer) 
        { 
            //TODO1.3: remove this debug log?
            //log.debug("Connection attempt is now due.");
            
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            var rpc = window.keefox_org.KeePassRPC;
            
            if (rpc.fastRetries > 0)
            {
                // count this as a fast retry even if it was triggered from
                // standard retry timer and even if we are already connected
                rpc.fastRetries--; 
            
                if (rpc.fastRetries <= 0)
                {
                    if (rpc.reconnectTimer != null)
                        rpc.reconnectTimer.cancel();
                    rpc.reconnectSoon();
                }
            }

            // Check we are allowed to connect
            if (rpc.connectionProhibitedUntil.getTime() > (new Date()).getTime())
                return;

            // Check current websocket connection state. No point in trying the
            // HTTP connection if we know we're already successfully connected
            if (rpc.webSocket !== undefined && rpc.webSocket !== null && rpc.webSocket.readyState != 3)
                return;

            var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                                      .getService(Components.interfaces.nsIIOService);
            var uri = ioService.newURI(rpc.httpChannelURI, null, null);

            // get a channel for that nsIURI
            rpc.httpChannel = ioService.newChannelFromURI(uri);

            var listener = new KPRPCHTTPStreamListener(rpc.httpConnectionAttemptCallback);
            rpc.httpChannel.notificationCallbacks = listener;

            // Try to connect
            // There may be more than one concurrent attempted connection.
            //TODO1.3: Looks like default timeout is <5 seconds but maybe check that
            // If more than one attempted connection returns the correct status code,
            // we will see a batch of "alive" or "locked" states for subsequent callbacks
            // That should be fine but we could implement a more complex request ID
            // tracking system in future if it becomes a problem
            rpc.httpChannel.asyncOpen(listener, null);
        } 
    };

}).apply(session.prototype);


function KPRPCHTTPStreamListener(aCallbackFunc) {
  this.mCallbackFunc = aCallbackFunc;
}

KPRPCHTTPStreamListener.prototype = {

  // nsIStreamListener
  onStartRequest: function (aRequest, aContext) { },

  // don't expect to receive any data but just in case, we want to handle it properly
  onDataAvailable: function (aRequest, aContext, aStream, aSourceOffset, aLength) {
    var scriptableInputStream = 
      Components.classes["@mozilla.org/scriptableinputstream;1"]
        .createInstance(Components.interfaces.nsIScriptableInputStream);
    scriptableInputStream.init(aStream);
    scriptableInputStream.read(aLength);
  },

  onStopRequest: function (aRequest, aContext, aStatus) {
    // Unless connection has been refused, we want to try connecting with the websocket protocol
    if (aStatus !== 2152398861)
    {
        log.info("HTTP connection not refused. We will now attempt a web socket connection.");
        this.mCallbackFunc(true);
    }
    else
    {
        log.debug("HTTP connection refused. Will not attempt web socket connection.");
        this.mCallbackFunc(false);
    }
  },

  // nsIInterfaceRequestor
  getInterface: function (aIID) {
    try {
      return this.QueryInterface(aIID);
    } catch (e) {
      throw Components.results.NS_NOINTERFACE;
    }
  },

  // nsIChannelEventSink (not implementing - no need)
  onChannelRedirect: function (aOldChannel, aNewChannel, aFlags) { },

  // nsIProgressEventSink (not implementing will cause annoying exceptions)
  onProgress : function (aRequest, aContext, aProgress, aProgressMax) { },
  onStatus : function (aRequest, aContext, aStatus, aStatusArg) { },

  // nsIHttpEventSink (not implementing will cause annoying exceptions)
  onRedirect : function (aOldChannel, aNewChannel) { },

  // we are faking an XPCOM interface, so we need to implement QI
  QueryInterface : function(aIID) {
    if (aIID.equals(Components.interfaces.nsISupports) ||
        aIID.equals(Components.interfaces.nsIInterfaceRequestor) ||
        aIID.equals(Components.interfaces.nsIChannelEventSink) || 
        aIID.equals(Components.interfaces.nsIProgressEventSink) ||
        aIID.equals(Components.interfaces.nsIHttpEventSink) ||
        aIID.equals(Components.interfaces.nsIStreamListener))
      return this;

    throw Components.results.NS_NOINTERFACE;
  }
};
