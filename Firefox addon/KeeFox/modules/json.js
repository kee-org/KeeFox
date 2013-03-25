/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
Copyright 2008-2010 Chris Tomlinson <keefox@christomlinson.name>

json.js provides a JSON-RPC client and method proxies for
communication between Firefox and KeePassRPC
  
Partially based on code by Shane Caraveo, ActiveState Software Inc

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

var EXPORTED_SYMBOLS = ["jsonrpcClient"];

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

Cu.import("resource://kfmod/session.js");
Cu.import("resource://kfmod/KFLogger.js");
Cu.import("resource://kfmod/kfDataModel.js");

var log = new KeeFoxLogger(); // can't share logging system any more due to complete change of architecture. importing KF.js = loop: keefox_org._KFLog;

function jsonrpcClient() {
    this.requestId = 1;
    this.callbacks = {};
    this.callbacksData = {};
    this.partialData = {};
    this.parsingStringContents = false;
    this.tokenCurlyCount = 0;
    this.tokenSquareCount = 0;
    this.adjacentBackslashCount = 0;
    this.clientVersion = [1,2,2];
}

jsonrpcClient.prototype = new session();
jsonrpcClient.prototype.constructor = jsonrpcClient;

(function() {

    this.shutdown = function()
    {
        log.debug("Shutting down JSON-RPC...");
        if (this.reconnectTimer)
            this.reconnectTimer.cancel();
        if (this.certFailedReconnectTimer)
            this.certFailedReconnectTimer.cancel();
        if (this.onConnectDelayTimer)
            this.onConnectDelayTimer.cancel();
        this.disconnect();     
        log.debug("JSON-RPC shut down.");
    }
    
    this.getClientIdSignatureBase64 = function()
    {
        return "hUiPbbPln4TIl+/RCsl5pjL0QOeEN7OqBmkz68ZMz7tGZOUxb7BCaQ==";
    }
    
    this.getUniqueClientIdBase64 = function()
    {
        var bytes = this.getUniqueClientId(this.getClientIdSignatureBase64());
        return bytes;
    }
    
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

    this.onNotify = function(topic, message) {
        if (topic == "transport-status-connected")
        {
        //TODO2: what thread is this calback called on? if not main, then need to call back to that thread to avoid GUI DOM update crashes
            this.request(this, "Authenticate",
              [this.clientVersion, "KeeFox Firefox add-on",
                this.getClientIdSignatureBase64(), this.getUniqueClientIdBase64()],
              function rpc_callback(resultWrapper) {
                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
                var window = wm.getMostRecentWindow("common-dialog") ||
                             wm.getMostRecentWindow("navigator:browser") ||
                             wm.getMostRecentWindow("mail:3pane");

                if (resultWrapper.result.result == 0) // successfully authorised by remote RPC server
                {
                    window.setTimeout(function () {
                    
                        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                 .getService(Components.interfaces.nsIWindowMediator);
                        var window = wm.getMostRecentWindow("navigator:browser") ||
                                     wm.getMostRecentWindow("mail:3pane");
                        window.keefox_org._keeFoxStorage.set("KeePassRPCActive", true); // is this the right place to do this?
                        window.keefox_org._keeFoxVariableInit();
                        if (window.keefox_org._keeFoxExtension.prefs.has("currentLocation")) //TODO2: set up preference change listener for ease of location based changes in future
                        {
                            var currentLocation = window.keefox_org._keeFoxExtension.prefs.getValue("currentLocation","");
                            window.keefox_win.Logger.info("Setting KeePassRPC location to " + currentLocation + ".");
                            window.keefox_org.changeLocation(currentLocation);
                        }
                        window.keefox_org._refreshKPDB();
                    }, 100); // 0.1 second delay before we try to do the KeeFox connection startup stuff
                } else
                {
                    if (resultWrapper.result.result == 3 || resultWrapper.result == 3) // version mismatch (including backwards compatible test)
                    {
                        window.keefox_win.Logger.info("Problem authenticating with KeePass. KeePassRPC version upgrade (or downgrade) required.");
                        window.keefox_org._launchInstaller(null,null,true);
                    } else
                    {
                        window.keefox_win.Logger.warn("Problem authenticating with KeePass. The error code is: " + resultWrapper.result.result);
                    }
                    window.keefox_org._pauseKeeFox();
                } 
                //TODO2: ? set confirmation that the connection is established and authenticated?
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

    //TODO2: what thread is this calback called on? if not main, then need to call back to that thread to avoid GUI DOM update crashes
    // talk of moving it to an off-main thread back in 2009 implies it is on main so no problem
    // but worth experimenting if crashes occur? Also, should I use different UTF8 decoding
    // routines that can allow adherence to the "count" parameter rather than just reading
    // everything we can get our potentially dirty paws on.
    this.onDataAvailable = function(request, ctx, inputStream, offset, count)
    {
        var data = this.readData(); // don't care about the number of bytes, we'll just read all the UTF8 characters available
        var lastPacketEndIndex = 0;
        
        //TODO2: handle whitespace between json packets? (although KeePassRPC should never send them)
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
    this.onStartRequest = function(request, ctx) {}
    this.onStopRequest = function(request, ctx, status) {}

    // send a request to the current RPC server.
    // calling functions MUST manage the requestID to limit thread concurrency errors
    this.request = function(session, method, params, callback, requestId, callbackData)
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

    // send a notification to the current RPC server
    this.notify = function(session, method, params, callback)
    {
        if (log.logSensitiveData)
            log.debug("Preparing a JSON-RPC notification object: " + method + ":" + params);
        else
            log.debug("Preparing a JSON-RPC notification object.");
        var data = JSON.stringify({ "params": params, "method": method });
        session.writeData(data);
    }

    // interpret the message from the RPC server
    this.evalJson = function(method, params)
    {
        var data = JSON.stringify(params);
        if (log.logSensitiveData)
            log.debug("Evaluating a JSON-RPC object we just recieved: " + data);
        else
            log.debug("Evaluating a JSON-RPC object we just recieved.");
            
        if (data)
        {
            data = data.match(/\s*\[(.*)\]\s*/)[1];
        }
        
        // We only really need one method to be callable... but we'll keep the
        // old name to enable Authentication attempts to fail with older
        // RPC server versions
        if (method=="KPRPCListener" || method=="callBackToKeeFoxJS")
            this.KPRPCListener(data);
    }

    this.KPRPCListener = function (signal)
    {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("common-dialog") ||
                     wm.getMostRecentWindow("navigator:browser") ||
                     wm.getMostRecentWindow("mail:3pane");
        
        // call this async so that json reader can get back to listening ASAP and prevent deadlocks
        window.setTimeout(function () {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                         wm.getMostRecentWindow("mail:3pane");
            window.keefox_org.KPRPCListener(signal);
        },5);
    }

    //***************************************
    // Functions below can be thought of as proxies to the RPC
    // methods exposed in the KeePassRPC server.
    // See KeePassRPCService.cs for more detail
    // TODO2: pull these out into a more specific prototype
    //***************************************

    this.launchGroupEditor = function(uniqueID, dbFileName)
    {
        // fire and forget
        this.request(this, "LaunchGroupEditor", [uniqueID, dbFileName], null, ++this.requestId);
        return;
    }

    this.launchLoginEditor = function(uniqueID, dbFileName)
    {
        // fire and forget
        this.request(this, "LaunchLoginEditor", [uniqueID, dbFileName], null, ++this.requestId);
        return;
    }

    this.changeDB = function(fileName, closeCurrent)
    {
        // fire and forget
        this.request(this, "ChangeDatabase", [fileName, closeCurrent], null, ++this.requestId);
        return;
    }
    
    this.changeLocation = function(locationId)
    {
        // fire and forget
        this.request(this, "ChangeLocation", [locationId], null, ++this.requestId);
        return;
    }

    this.getMRUdatabases = function()
    {
        this.request(this, "GetCurrentKFConfig", null, function rpc_callback(resultWrapper) {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            
            if ("result" in resultWrapper && resultWrapper.result !== false)
            {
                if (resultWrapper.result !== null)
                    window.keefox_win.toolbar.setMRUdatabasesCallback(resultWrapper.result);
                
            } 
        }, ++this.requestId); 
    }

    this.addLogin = function(login, parentUUID, dbFileName)
    {
        var jslogin = login.asEntry();
        // fire and forget
        this.request(this, "AddLogin", [jslogin, parentUUID, dbFileName], null, ++this.requestId);        
        return;
    }

    this.findLogins = function(fullURL, formSubmitURL, httpRealm, uniqueID, dbFileName, freeText, username, callback, callbackData)
    {
        // returns ID of async JSON-RPC request so calling functions can track if desired
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
            
        var lst = "LSTall";
        if (httpRealm == undefined || httpRealm == null || httpRealm == "")
            lst = "LSTnoRealms";
        else if (formSubmitURL == undefined || formSubmitURL == null || formSubmitURL == "")
            lst = "LSTnoForms";     
            
        if (dbFileName == undefined || dbFileName == null || dbFileName == "")
        {
            //if (window.keefox_org._keeFoxExtension.prefs.has("searchAllOpenDatabases"))
            //    sig = ;
            
            if (!window.keefox_org._keeFoxExtension.prefs.getValue("searchAllOpenDBs",false))
                dbFileName = window.keefox_org.KeePassDatabases[window.keefox_org.ActiveKeePassDatabaseIndex].fileName;
            else
                dbFileName = "";
        }
        
        var newId = ++this.requestId;
        // slight chance IDs may be sent out of order but at least this way
        // they are consistent for any given request/response cycle
        this.request(this, "FindLogins", [[fullURL], formSubmitURL, httpRealm, lst, false, uniqueID, dbFileName, freeText, username], callback, newId, callbackData);        
        return newId;
    }

    this.getAllDatabases = function()
    {
        var result = this.request(this, "GetAllDatabases", null,function rpc_callback(resultWrapper) {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            
            if ("result" in resultWrapper && resultWrapper.result !== false)
            {
                if (resultWrapper.result !== null)
                    window.keefox_org.updateKeePassDatabases(resultWrapper.result);
                
                //else
                //    log something? window.keefox_org.rror("Null return result received");
            } //else
              //log something?    
        }, ++this.requestId);
        
        return;
    }

    this.generatePassword = function()
    {
        this.request(this, "GeneratePassword", [""], function rpc_callback(resultWrapper) {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            
            var passwordGenerated = false;
            var tb = window.keefox_win.toolbar;
            
            if ("result" in resultWrapper && resultWrapper.result !== false)
            {
                if (resultWrapper.result !== null)
                {
                    passwordGenerated = true;
                    
                    const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].
                    getService(Components.interfaces.nsIClipboardHelper);
                    gClipboardHelper.copyString(resultWrapper.result);
                    
                    window.keefox_win.UI.growl(window.keefox_org.locale.$STR("generatePassword.copied"));
                }
            }
            if (!passwordGenerated)
            {
                window.keefox_win.UI.growl(window.keefox_org.locale.$STR("generatePassword.launch"));
            }
        }, ++this.requestId);
    }
    
    /*
    
    maybe a standard timeout could be put in place for some functions so if their async response comes back after some recorded deadline we can ignore it.
    
    */
    
}).apply(jsonrpcClient.prototype);
