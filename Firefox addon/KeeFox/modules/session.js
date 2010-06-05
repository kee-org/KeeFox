/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
Copyright 2008-2010 Chris Tomlinson <keefox@christomlinson.name>

session.js manages the low-level connection between Firefox and KeePassRPC
  
Some implementation ideas extended from code written by Shane
Caraveo, ActiveState Software Inc

Secure certificate exception code used under GPL2 license from:
MitM Me (Johnathan Nightingale)

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

var EXPORTED_SYMBOLS = ["session"];

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://kfmod/KFLogger.js");

var log = KFLog;

function session()
{
    this.transport = null;
    this.reconnectionAttemptFrequency = 10000;
    this.port = 12537;
    this.address = "127.0.0.1";
    this.connectionTimeout = 10000; // short timeout for connections
    this.activityTimeout = 3600000; // long timeout for activity
    this.connectLock = false; // protect the connect function so only one event
                        // thread (e.g. timer) can execute it at the same time
    this.fastRetries = 0;
                        //this.pendingConnection = false;
}

session.prototype =
{
    reconnectTimer: null,
    certFailedReconnectTimer: null,
    onConnectDelayTimer: null,
    onConnectDelayTimerAction: function()
    {    
     log.debug("onConnectDelayTimerAction started");
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser");
            //window.keeFoxInst.KeePassRPC.reconnectSoon.next();
            var rpc = window.keeFoxInst.KeePassRPC;
            
        if (rpc.transport == undefined || rpc.transport == null)
        {
            log.error("Transport invalid!");    
        } else if (rpc.transport != null && rpc.transport.isAlive())
        {
        log.debug("onConnectDelayTimerAction connected");
            rpc.onConnect();
        }
           //  else handle stream errors without risking double reaction to legitimate disconnection
        else
        {
            window.keeFoxInst._pauseKeeFox();
            rpc.disconnect(); // tidy up so future connection attempts can succeed
            log.error("Connection attempt failed. Is The KeePassRPC server running?");
        }
        log.debug("onConnectDelayTimerAction ended");
    },
    
    reconnectSoon: function()
    {
        log.debug("Creating a reconnection timer.");
         // Create a timer 
         this.reconnectTimer = Components.classes["@mozilla.org/timer;1"]
                    .createInstance(Components.interfaces.nsITimer);
         
         this.reconnectTimer.initWithCallback(this.reconnectNow,
            this.reconnectionAttemptFrequency,
            Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
    },
    
    reconnectVerySoon: function()
    {
        log.debug("Creating a fast reconnection timer.");
        
        this.fastRetries = 30; // 15 seconds of more frequent connection attempts
        
         // Create a timer 
         this.reconnectTimer = Components.classes["@mozilla.org/timer;1"]
                    .createInstance(Components.interfaces.nsITimer);
         
         this.reconnectTimer.initWithCallback(this.reconnectNow,
            500,
            Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
    },
    
    connect: function()
    {
        try
        {
            if (this.transport != null && this.transport.isAlive())
                return "alive";
            if (this.connectLock)
                return "locked";
            this.connectLock = true;
            
            var transportService =
                Components.classes["@mozilla.org/network/socket-transport-service;1"].
                getService(Components.interfaces.nsISocketTransportService);
            //var transport = transportService.createTransport(["ssl"], 1, this.address, this.port, null);
            var transport = transportService.createTransport(["tcp"], 1, this.address, this.port, null);
            if (!transport) {
                this.onNotify("connect-failed", "Unable to create transport for "+this.address+":"+this.port); 
                return;
            }
            
            // we want to be told about security certificate problems so we can suppress them
            transport.securityCallbacks = this;
            //transport.connectionFlags = 1; //ANONYMOUS_CONNECT - no SSL client certs
            
            transport.setTimeout(Components.interfaces.nsISocketTransport.TIMEOUT_CONNECT, this.connectionTimeout);
            transport.setTimeout(Components.interfaces.nsISocketTransport.TIMEOUT_READ_WRITE, this.activityTimeout);
            this.setTransport(transport);
        } catch(ex)
        {
            this.onNotify("connect-failed", "Unable to connect to "+this.address+":"+this.port+"; Exception occured "+ex);
            this.disconnect();
        }
        this.connectLock = false;
    },
    
    setTransport: function(transport)
    {
        try
        {
            this.transport = transport;
            this.raw_istream = this.transport.openInputStream(0, 512, 0);
            this.raw_ostream = this.transport.openOutputStream(0, 512, 0);            // change these all to 0 once seen if 512 causes more problems
            const replacementChar = Components.interfaces
                .nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
            var charset = "UTF-8";

            this.ostream = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                               .createInstance(Components.interfaces.nsIConverterOutputStream);

            this.ostream.init(this.raw_ostream, charset, 0, replacementChar);

            this.istream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                               .createInstance(Components.interfaces.nsIConverterInputStream);
            this.istream.init(this.raw_istream, charset, 0, replacementChar);
            
            
            if (!this.transport.isAlive())
            {
                log.debug("transport stream is not alive yet");
                var mainThread = Components.classes["@mozilla.org/thread-manager;1"]
                                 .getService(Components.interfaces.nsIThreadManager).mainThread;
                var asyncOutputStream = this.raw_ostream.QueryInterface(Components.interfaces.nsIAsyncOutputStream);
                // We need to be able to write at least one byte.
                asyncOutputStream.asyncWait(this, 0, 1, mainThread);
                log.debug("async input wait begun.");
            } else
            {
                log.debug("transport stream is already alive");
                this.onConnect();
            }
        } catch (ex)
        {
            log.error("setTransport failed: " + ex);
            this.onNotify("connect-failed", "setTransport failed, Unable to connect; Exception " + ex);            
            this.disconnect(); 
        }
    },
    
    reconnectNow: { 
        notify: function(timer) 
        { 
            log.debug("Connection attempt is now due.");
            
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser");
            //window.keeFoxInst.KeePassRPC.reconnectSoon.next();
            var rpc = window.keeFoxInst.KeePassRPC;
            
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
    },
    
    onOutputStreamReady: function()
    {
    //this.pendingConnection = true;
    //return;
    
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser");
            //window.keeFoxInst.KeePassRPC.reconnectSoon.next();
            var rpc = window.keeFoxInst.KeePassRPC;
            
        log.debug("Creating an onConnectDelayTimer. " + rpc.transport);
         // Create a timer 
         rpc.onConnectDelayTimer = Components.classes["@mozilla.org/timer;1"]
                    .createInstance(Components.interfaces.nsITimer);
         log.debug("onConnectDelayTimer instance created");
         rpc.onConnectDelayTimer.initWithCallback(rpc.onConnectDelayTimerAction,
            1000,
            Components.interfaces.nsITimer.TYPE_ONE_SHOT); //TODO: does the timer stay in scope?
            log.debug("onConnectDelayTimer ended");
    },

    onConnect: function()
    {
        try
        {
            log.debug("Setting up the async reading pump");
            // start the async read
            this.pump = Components.classes["@mozilla.org/network/input-stream-pump;1"]
                        .createInstance(Components.interfaces.nsIInputStreamPump);
            this.pump.init(this.raw_istream, -1, -1, 0, 0, false);
            this.pump.asyncRead(this, null);
            this.onNotify("transport-status-connected", null);
        } catch(ex) {
            log.error(ex, "Session::onConnect failed: ");
            this.onNotify("connect-failed", "Unable to connect; Exception occured "+ex);
            this.disconnect();
            //this.reconnectSoon();  
        }
    },
    
    disconnect: function()
    {
        log.info("Disconnecting from RPC server");
        if ("istream" in this && this.istream)
            this.istream.close();
        if ("ostream" in this && this.ostream)
            this.ostream.close();
        if ("raw_ostream" in this && this.raw_ostream)
            this.raw_ostream.close();
        if ("transport" in this && this.transport)
          this.transport.close(Components.results.NS_OK);
    
        this.pump = null;
        this.istream = null;
        this.ostream = null;
        this.raw_ostream = null;
        this.transport = null;
        this.onNotify("connect-closed", null);
    },

    readData: function() 
    {
        var fullString = "";
        var str = {};
        while (this.istream.readString(4096, str) != 0)
            fullString += str.value;

        return fullString;
        //return this.istream.readBytes(count);
    },
    
    //TODO: try to recover from dead connections...
    writeData: function(data, dataLen)
    {
        try {
            if (!this.transport || !this.transport.isAlive()) {
                log.error("Session.transport is not available");
                this.disconnect();
                this.connect();
                return -1;
            }
            if (arguments.length == 0) {
                log.debug("Session.writeData called with no args");
                return -1;
            } else if (arguments.length == 1) {
                dataLen = data.length;
            }
    
            var str1 = this.expand(data);
            //log.debug("writeData: [" + str1 + "]");
            
            var num_written = this.ostream.writeString(data);
            return num_written;
        } catch(ex) {
            log.debug("writeData failed: " + ex);
        }
        return -1;
    },

    expand: function(s)
    {
        // JS doesn't have foo ||= val
        if (!this._hexEscape) {
            this._hexEscape = function(str) {
                var res1 = parseInt(str.charCodeAt(0)).toString(16);
                var leader = res1.length == 1 ? "0" : "";
                return "%" + leader + res1;
            };
        }
        return s.replace(/[\x00-\x09\x11-\x1f]/g, this._hexEscape);
    },

    // This is needed to allow us to get security certificate error notifications
    getInterface: function (aIID) {
        return this.QueryInterface(aIID);
      },

    handleFailedCertificate: function (gSSLStatus)
    {
        gCert = gSSLStatus.QueryInterface(Components.interfaces.nsISSLStatus).serverCert;
          
        log.warn("Adding security certificate exception for " + this.address + ":" + this.port
            + " <-- This should be the address and port of the KeePassRPC server."
            + " If it is not localhost:12536 or 127.0.0.1:12536 and you have"
            + " not configured KeeFox to use alternative connection details"
            + " you should investigate this possible security problem, otherwise everything is probably OK."
            + " Note: The security certificate exception is required because KeePassRPC has"
            + " created a custom security certificate unique to your installation."
            + " This certificate is not authenticated by the organisations that Firefox"
            + " automatically trusts so an exception is required for this special case. "
            + "Please see the KeeFox website if you would like more information about this topic."
            );
            
        // Add the exception
        var overrideService = Components.classes["@mozilla.org/security/certoverride;1"]
                              .getService(Components.interfaces.nsICertOverrideService);
        var flags = 0;
        if(gSSLStatus.isUntrusted)
            flags |= overrideService.ERROR_UNTRUSTED;
        if(gSSLStatus.isDomainMismatch)
            flags |= overrideService.ERROR_MISMATCH;

        overrideService.rememberValidityOverride(this.address, this.port, gCert, flags, false);
        
        log.info("Exception added to Firefox");
        
        //Try to connect again immediately (well, after a tiny wait which should
        //be enough to ensure this failed attempt has given up before we try again)
        log.debug("Creating a reconnection timer.");
        this.certFailedReconnectTimer = Components.classes["@mozilla.org/timer;1"]
                    .createInstance(Components.interfaces.nsITimer);
         
        this.certFailedReconnectTimer.initWithCallback(this.reconnectNow,
            500,
            Components.interfaces.nsITimer.TYPE_ONE_SHOT); //TODO: does the timer stay in scope?
        log.debug("Timer created.");
    },
    
    notifyCertProblem: function MSR_notifyCertProblem(socketInfo, sslStatus, targetHost)
    {
        log.info("A security certification error was encountered while"
            + " negotiating the initial connection to KeePassRPC.");
        if (sslStatus)
            this.handleFailedCertificate(sslStatus);
        return true; // suppress error UI
    },
    
    // Shutdown this session, releasing all resources
    shutdown: function()
    {
    log.debug("Shutting down sess...");
        if (this.reconnectTimer)
            this.reconnectTimer.cancel();
        if (this.certFailedReconnectTimer)
            this.certFailedReconnectTimer.cancel();
        if (this.onConnectDelayTimer)
            this.onConnectDelayTimer.cancel();
        this.disconnect();    
        

    },
      
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIBadCertListener2,
                                           Ci.nsIInterfaceRequestor,
                                           Ci.nsIStreamListener,
                                           Ci.nsITransportEventSink,
                                           Ci.nsIOutputStreamCallback])
};
