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
    this.reconnectionAttemptFrequency = 10000;
    this.connectionTimeout = 10000; // short timeout for connections
    this.activityTimeout = 3600000; // long timeout for activity
    this.connectLock = false; // protect the connect function so only one event
                        // thread (e.g. timer) can execute it at the same time
    this.fastRetries = 0;
                        //this.pendingConnection = false;
    this.webSocketPort = 12546;
    this.webSocketURI = "ws://127.0.0.1";
    this.webSocket = null;
    this.connectFailCount = 0;
}

session.prototype = new sessionLegacy();
session.prototype.constructor = session;

(function() {

    this.reconnectTimer = null;
    this.onConnectDelayTimer = null;
    
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
        
        this.fastRetries = 30; // 15 seconds of more frequent connection attempts
        
         // Create a timer 
         this.reconnectTimer = Components.classes["@mozilla.org/timer;1"]
                    .createInstance(Components.interfaces.nsITimer);
         
         this.reconnectTimer.initWithCallback(this.reconnectNow,
            500,
            Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
    }
    
    // Initiates a connection to the KPRPC server. First we try a webSocket then legacy TCP connection.
    // Could do that but what about if KP starts up in between waiting for a webSocket connection timeout and initiating a legacy connection? KP will be connected using old connection method... must be a way to track and avoid this?
    // failed legacy connect with auth_legacy signal will cause user to see upgrade assistence message. will count those messages and not display until 3 have occurred - in case there is a timing issue and random fault with 2nd attempt.
    this.connect = function()
    {
        if (this.connectLock)
            return "locked";
        if (this.webSocket !== undefined && this.webSocket !== null && this.webSocket.readyState != 3)
            return "alive";

        log.debug("Trying to open a webSocket connection");

        this.connectLock = true;
        try
        {
            //TODO1.3: Test if this hidden window approach actually works - might be a way to avoid the smell.
            // This smells.
            // Don't know whether a websocket created from a given window will hold a ref to that
            // window. Hopefully not but I can't find any docs on alternative approaches anyway.
//            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
//                           .getService(Components.interfaces.nsIWindowMediator);
//            var window = wm.getMostRecentWindow("navigator:browser") ||
//                        wm.getMostRecentWindow("mail:3pane");
            var window = Components.classes["@mozilla.org/appshell/appShellService;1"]
                             .getService(Components.interfaces.nsIAppShellService)
                             .hiddenDOMWindow;
            this.webSocket = new window.WebSocket(this.webSocketURI + ":" + this.webSocketPort);
        } catch (ex)
        {
            // This shouldn't happen much - most errors will be caught in the onerror function below

            this.connectLock = false;
            this.connectFailCount++;

            // webSocket spec says that we can't know why there was an error so we must
            // always attempt to establish a legacy connection
            if (this.connectFailCount >= 3)
            {
                log.debug("Failed to open a webSocket connection so will try legacy connection instead. Exception: " + ex);
            
                // We run the legacy connection attempts at a lower rate since they are very unlikely to work
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
            if (window.keefox_org.KeePassRPC.connectFailCount >= 3)
            {
                log.debug("Websocket connection failed a few times so going to try legacy connection");
                
                // We run the legacy connection attempts at a lower rate since they are very unlikely to work
                window.keefox_org.KeePassRPC.connectFailCount = 0;
                window.keefox_org.KeePassRPC.connectLegacy(); // scope wrong?
            }
            log.debug("Websocket connection error end");
        };
        this.webSocket.onclose = function (event) {
            log.debug("Websocket connection closed");
        };

    };

    this.reconnectNow = { 
        notify: function(timer) 
        { 
            log.debug("Connection attempt is now due.");
            
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            //window.keefox_org.KeePassRPC.reconnectSoon.next();
            var rpc = window.keefox_org.KeePassRPC;
            
            if (rpc.fastRetries > 0)
            {
                rpc.fastRetries--; // count this as a fast retry even if it was triggered from standard retry timer and even if we are already connected
            
                if (rpc.fastRetries <= 0)
                {
                    if (rpc.reconnectTimer != null)
                        rpc.reconnectTimer.cancel();
                    
                    rpc.reconnectSoon();
                
                }
            
            }
                
            log.debug("Attempting to connect to RPC server.");
            var connectResult = rpc.connect();
            if (connectResult == "alive")
                log.debug("Connection already established.");
            if (connectResult == "locked")
                log.debug("Connection attempt already underway.");
            
        } 
    };

}).apply(session.prototype);


