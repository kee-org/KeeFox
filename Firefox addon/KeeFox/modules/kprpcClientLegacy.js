/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
Copyright 2008-2013 Chris Tomlinson <keefox@christomlinson.name>

kprpcClientLegacy.js provides functionality for
communication using the KeePassRPC protocol < version 1.3.
Only basic features are supported - just enough to establish a
connection to allow KeeFox and KeePass to determine the need
for the user to upgrade to a newer protocol version.

This file alone will not be sufficient to connect to any version of 
KPRPC but when extended by the new (and occasionally shared) features 
of kprpcClient.js, legacy connections will be enabled.

Legacy connection features can be removed by extending kprpcClient
from session instead of kprpcClientLegacy.

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

let Ci = Components.interfaces;
let Cu = Components.utils;

var EXPORTED_SYMBOLS = ["kprpcClientLegacy"];

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

Cu.import("resource://kfmod/session.js");
Cu.import("resource://kfmod/KFLogger.js");
Cu.import("resource://kfmod/utils.js");

var log = KFLog;

function kprpcClientLegacy() {
    this.partialData = {};
    this.parsingStringContents = false;
    this.tokenCurlyCount = 0;
    this.tokenSquareCount = 0;
    this.adjacentBackslashCount = 0;
    this.firewalledConnectionCount = 0;
}

kprpcClientLegacy.prototype = new session();
kprpcClientLegacy.prototype.constructor = kprpcClientLegacy;

(function() {

    //[deprecated]
    this.getClientIdSignatureBase64 = function()
    {
        return "hUiPbbPln4TIl+/RCsl5pjL0QOeEN7OqBmkz68ZMz7tGZOUxb7BCaQ==";
    }
    
    //[deprecated]
    this.getUniqueClientIdBase64 = function()
    {
        var bytes = this.getUniqueClientId(this.getClientIdSignatureBase64());
        return bytes;
    }
    
    //[deprecated]
    this.getUniqueClientId = function(clientIdSig)
    {
        //TODO2: get/create a unique private key?
        // encrypt public clientIdSig using private key?
        // probably no point since we can't store it securely for next session anyway :-(
        var sig = "";
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
                        
        if (window.keefox_org._keeFoxExtension.prefs.has("uniqueProfileId"))
            sig = window.keefox_org._keeFoxExtension.prefs.getValue("uniqueProfileId","");
        
        if (sig == "")
        {
            sig = (Math.random() * (4294967296 - 1) + 1) + clientIdSig + (Math.random() * (4294967296 - 1) + 1);
            window.keefox_org._keeFoxExtension.prefs.setValue("uniqueProfileId",sig);
        }
        
        return btoa(sig);
    }

    //[deprecated]
    this.onNotify = function(topic, message) {
        if (topic == "transport-status-connected")
        {
        //TODO2: what thread is this calback called on? if not main, then need to call back to that thread to avoid GUI DOM update crashes

            // Only old KPRPC servers will send us the request for authentication
            // which leads to this point so we do things the old way
            this.deprecatedRequest(this, "Authenticate",
              [this.clientVersion, "KeeFox Firefox add-on",
                this.getClientIdSignatureBase64(), this.getUniqueClientIdBase64()],
              function rpc_callback(resultWrapper) {
                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
                var window = wm.getMostRecentWindow("common-dialog") ||
                             wm.getMostRecentWindow("navigator:browser") ||
                             wm.getMostRecentWindow("mail:3pane");

                // New clients can't successfully authenticate against the old server version
                if (resultWrapper.result.result == 4 || resultWrapper.result == 4) // KF and KPRPC capable of SRP auth but have not acheived it for some reason
                {
                    // We make sure this happens a few times just in case it's a transient problem due
                    // to webSocket connection attempts occurring while KeePassRPC server was starting up
                    window.keefox_org.KeePassRPC.firewalledConnectionCount++;
                    if (window.keefox_org.KeePassRPC.firewalledConnectionCount >= 3)
                    {
                        window.keefox_org.KeePassRPC.firewalledConnectionCount = 0;
                        window.keefox_win.Logger.warn("Problem authenticating with KeePass. Firewall or other problem preventing SRP protocol negotiation.");
                        window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-firewall-problem"));
                    }
                } else
                if (resultWrapper.result.result == 3 || resultWrapper.result == 3) // version mismatch (including backwards compatible test)
                {
                    window.keefox_win.Logger.info("Problem authenticating with KeePass. KeePassRPC version upgrade (or downgrade) required.");
                    window.keefox_org._launchInstaller(null,null,true);
                } else
                {
                    window.keefox_win.Logger.warn("Problem authenticating with KeePass. The error code is: " + resultWrapper.result.result);
                }
                window.keefox_org._pauseKeeFox();
            }, this.requestId);
        } else if (topic == "connect-failed")
        {
        try {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                 .getService(Components.interfaces.nsIWindowMediator);
                        var window = wm.getMostRecentWindow("navigator:browser") ||
                            wm.getMostRecentWindow("mail:3pane");
            window.keefox_win.Logger.warn("Problem connecting to KeePass: " + message);
            } catch(e) {}
        }
    }

    //[deprecated]
    this.deprecatedRequest = function(session, method, params, callback, requestId, callbackData)
    {
        if (requestId == undefined || requestId == null || requestId < 0)
            throw("JSON-RPC communciation requested with no requestID provided.");
 
        this.callbacks[requestId] = callback;
        if (callbackData != null)
            this.callbacksData[requestId] = callbackData;
            
        var data = JSON.stringify({ "params": params, "method": method, "id": requestId });
        if (log.logSensitiveData)
            log.debug("Sending a JSON-RPC request: " + data);
        else
            log.debug("Sending a JSON-RPC request");
            
        var writeResult = session.writeData(data);
        if (writeResult <=0)
        {
            log.warn("JSON-RPC request could not be sent.");
            delete this.callbacks[requestId];
            delete this.callbacksData[requestId];
        }
    }

    //[deprecated]
    this.onDataAvailable = function(request, ctx, inputStream, offset, count)
    {
        var data = this.readData(); // don't care about the number of bytes, we'll just read all the UTF8 characters available
        var lastPacketEndIndex = 0;
        
        for (var i = 0; i < data.length; i++)
        {
            var incrementAdjacentBackslashCount = false;
            
            switch (data[i])
            {
                case '"': if (this.adjacentBackslashCount%2 == 0) { 
                    this.parsingStringContents = this.parsingStringContents ? false : true; } break;
                case '\\': incrementAdjacentBackslashCount = true; break;
                case '{': if (!this.parsingStringContents) this.tokenCurlyCount++; break;
                case '}': if (!this.parsingStringContents) this.tokenCurlyCount--; break;
                case '[': if (!this.parsingStringContents) this.tokenSquareCount++; break;
                case ']': if (!this.parsingStringContents) this.tokenSquareCount--; break;
            }
            
            if (incrementAdjacentBackslashCount)
                this.adjacentBackslashCount++;
            else
                this.adjacentBackslashCount = 0;
            
            // when the token counts reach 0 we know that we have received a complete object in JSON format
            if (this.tokenCurlyCount == 0 && this.tokenSquareCount == 0)
            {
                var obj = null;
                var fullData = data.substr(lastPacketEndIndex,i-lastPacketEndIndex+1);
                
                // if we're looking at only part of the full message we'll patch the previous bit together now
                if (session in this.partialData)
                    fullData = this.partialData[session] + fullData;
                
                
                if (log.logSensitiveData)
                    log.debug("Processing fullData we just recieved: " + fullData);
            
                lastPacketEndIndex = i+1;
                
                // we have consumed any previous data
                if (session in this.partialData)
                    delete this.partialData[session];
                    
                obj = JSON.parse(fullData);
                
                // if we failed to parse an object from the JSON    
                if (!obj)
                    continue;
            
                if ("result" in obj && obj.result !== false)
                {
                    try
                    {
                        if (this.callbacks[obj.id] != null)
                            this.callbacks[obj.id](obj, this.callbacksData[obj.id]);
                        delete this.callbacks[obj.id];
                        delete this.callbacksData[obj.id];
                    } catch (e)
                    {
                        delete this.callbacks[obj.id];
                        delete this.callbacksData[obj.id];
                        log.warn("An error occurred when processing the result callback for JSON-RPC object id " + obj.id + ": " + e);
                    }
                } else if ("error" in obj)
                {
                    try
                    {
                        log.error("An error occurred in KeePassRPC object id: " + obj.id + " with this message: " + obj.message + " and this error: " + obj.error + " and this error message: " + obj.error.message);
                        if (this.callbacks[obj.id] != null)
                            this.callbacks[obj.id](obj, this.callbacksData[obj.id]);
                        delete this.callbacks[obj.id];
                        delete this.callbacksData[obj.id];
                    } catch (e)
                    {
                        delete this.callbacks[obj.id];
                        delete this.callbacksData[obj.id];
                        log.warn("An error occurred when processing the error callback for JSON-RPC object id " + obj.id + ": " + e);
                    }
                } else if ("method" in obj)
                {
                    var result = {"id": obj.id};
            
                    try {
                        result.result = this.evalJson(obj.method, obj.params);
                        if (!result.result)
                            result.result = null;
                    } catch(e)
                    {
                        result.error = e;
                        log.error("An error occurred when processing a JSON-RPC request: " + e);
                    }
                    // json rpc not specific about notifications, other than the fact
                    // they do not have the id in the request.  do not respond to
                    // notifications
                    
                    // not serving anything interesting from Firefox...
                    //if ("id" in obj)
                    //    session.writeData(JSON.stringify(result));
                } else {
                    if (log.logSensitiveData)
                        log.error("Unexpected error processing onDataAvailable:" + data);
                    else
                        log.error("Unexpected error processing onDataAvailable");
                }
            }
        }
        
        // if any data was left un-handled we store it ready for use when the next TCP packet arrives
        if (lastPacketEndIndex < data.length-1)
        {
            log.debug("partial data received" + lastPacketEndIndex + ":"  + data.length);
            if (this.partialData[session] != undefined)
                this.partialData[session] += data.substr(lastPacketEndIndex,data.length-lastPacketEndIndex);
            else
                this.partialData[session] = data.substr(lastPacketEndIndex,data.length-lastPacketEndIndex);
        }
    }
    //[deprecated]
    this.onStartRequest = function(request, ctx) {}
    //[deprecated]
    this.onStopRequest = function(request, ctx, status) {}


    // send a notification to the current RPC server
    //[deprecated]
    this.notify = function(session, method, params, callback)
    {
        if (log.logSensitiveData)
            log.debug("Preparing a JSON-RPC notification object: " + method + ":" + params);
        else
            log.debug("Preparing a JSON-RPC notification object.");
        var data = JSON.stringify({ "params": params, "method": method });
        session.writeData(data);
    }

}).apply(kprpcClientLegacy.prototype);
