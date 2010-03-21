/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
Copyright 2008-2010 Chris Tomlinson <keefox@christomlinson.name>

session.js manages the low-level connection between Firefox and KeePassRPC
  
Some implementation ideas extended from code written by Shane
Caraveo, ActiveState Software Inc

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
    this.port = 12536;
    this.address = "127.0.0.1";
    this.connectionTimeout = 3600000;
}

session.prototype =
{
    connect: function()
    {
        try {
            if (this.transport != null && this.transport.isAlive())
                return "alive";
            
            var transportService =
                Components.classes["@mozilla.org/network/socket-transport-service;1"].
                getService(Components.interfaces.nsISocketTransportService);
            var transport = transportService.createTransport(null, 0, this.address, this.port, null);
            if (!transport) {
                this.onNotify("connect-failed", "Unable to create transport for "+this.address+":"+this.port);
                this.reconnectSoon();  
                return;
            }
            // long timeout for connections
            transport.setTimeout(Components.interfaces.nsISocketTransport.TIMEOUT_CONNECT, this.connectionTimeout);
            this.setTransport(transport);
        } catch(ex) {
            this.onNotify("connect-failed", "Unable to connect to "+this.address+":"+this.port+"; Exception occured "+ex);
            this.disconnect();
            this.reconnectSoon();  
        }
    },
    
    setTransport: function(transport)
    {
        try {
            this.transport = transport;
            this.raw_istream = this.transport.openInputStream(0, 0, 0);
            this.ostream = this.transport.openOutputStream(0,0,0);
            this.istream = Components.classes["@mozilla.org/binaryinputstream;1"]
                           .createInstance(Components.interfaces.nsIBinaryInputStream);
            this.istream.setInputStream(this.raw_istream);
            if (!this.transport.isAlive()) {
                var mainThread = Components.classes["@mozilla.org/thread-manager;1"]
                                 .getService(Components.interfaces.nsIThreadManager).mainThread;
                var asyncOutputStream = this.ostream.QueryInterface(Components.interfaces.nsIAsyncOutputStream);
                // We need to be able to write at least one byte.
                asyncOutputStream.asyncWait(this, 0, 1, mainThread);
            } else {
                this.onConnect();
            }
        } catch(ex) {
            this.onNotify("connect-failed", "setTransport failed, Unable to connect; Exception "+ex);
            log.error(ex, "setTransport failed: ");
            this.disconnect();
            this.reconnectSoon();  
        }
    },
    
    tryReconnect: function(originalObject)
    {
        // we try to connect and then schedule another attempt. 
        // If the first attempt was successful then the latter will just return immediately
        // and we can then stop making connection attempts
        if (originalObject.connect(this.address, this.port) == "alive")
            return;
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");
        window.setTimeout(originalObject.tryReconnect, this.reconnectionAttemptFrequency, originalObject);
    },
    
    reconnectSoon: function()
    {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                            .getService(Components.interfaces.nsIPromptService);
        window.setTimeout(this.tryReconnect, this.reconnectionAttemptFrequency, this);
    },

    onOutputStreamReady: function()
    {
        if (this.transport != null && this.transport.isAlive())
            this.onConnect();
           //  else handle stream errors without risking double reaction to legitimate disconnection
        else
            this.reconnectSoon();    
    },

    onConnect: function()
    {
        try {
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
            this.reconnectSoon();  
        }
    },
    
    disconnect: function()
    {
        if ("istream" in this && this.istream)
            this.istream.close();
        if ("ostream" in this && this.ostream)
            this.ostream.close();
        if ("transport" in this && this.transport)
          this.transport.close(Components.results.NS_OK);
    
        this.pump = null;
        this.istream = null;
        this.ostream = null;
        this.transport = null;
        this.onNotify("connect-closed", null);
    },

    readData: function(count) 
    {
        return this.istream.readBytes(count);
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
            if (str1.length > 1000) {
                str1 = str1.substr(0, 1000) + "...";
            }
            log.debug("writeData: [" + str1 + "]");
            
            var num_written = this.ostream.write(data, dataLen);
            if (num_written != dataLen) {
                log.debug("Expected to write "
                          + dataLen
                          + " chars, but wrote only "
                          + num_written);
                if (num_written == 0) {
                    log.debug("bailing out...");
                    this.disconnect();
                }
            }
            return num_written;
        } catch(ex) {
            log.debug(ex, "writeData failed: ");
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
    
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIStreamListener,
                                           Ci.nsITransportEventSink,
                                           Ci.nsIOutputStreamCallback])
};