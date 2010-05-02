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

var EXPORTED_SYMBOLS = ["jsonrpcClient"];

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

Components.utils.import("resource://kfmod/session.js");
Components.utils.import("resource://kfmod/KFLogger.js");
Components.utils.import("resource://kfmod/kfDataModel.js");

var log = KFLog;

function jsonrpcClient() {
    this.requestId = 1;
    this.callbacks = {}; //TODO: does FF JS engine leak memory if I use high indexed, mostly empty arrays?
    this.syncRequestResults = {}; // ditto
    this.partialData = {};
    //this.syncRequestComplete = false;
    this.parsingStringContents = false;
    this.tokenCurlyCount = 0;
    this.tokenSquareCount = 0;
    this.adjacentBackslashCount = 0;
    this.clientVersion = [0,7,6];
}

jsonrpcClient.prototype = new session();
jsonrpcClient.prototype.constructor = jsonrpcClient;

(function() {

    this.shutdown = function()
    {
        log.debug("Shutting down JSON-RPC...");
        // Make sure any synchronous communications with KeePass are cancelled
        for (var i = 0; i < this.syncRequestResults.length; i++)
            this.syncRequestResults[i] = new Error("JSON-RPC client shutting down");
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
        return "SBgL3aeB37Mnmy94+s3J3KAL/1EkSgiCVEkfp3Otm04tQtKBDDtaIw==";
    }
    
    this.getUniqueClientIdBase64 = function()
    {
        var bytes = this.getUniqueClientId(this.getClientIdSignatureBase64());
        return bytes;
    }
    
    this.getUniqueClientId = function(clientIdSig)
    {
        //TODO: get/create a unique private key
        // encrypt public clientIdSig using private key
        return btoa("this is not secure yet"+clientIdSig);
    }

    this.onNotify = function(topic, message) {
        if (topic == "transport-status-connected")
        {
        //TODO: what thread is this calback called on? if not main, then need to call back to that thread to avoid GUI DOM update crashes
        //TODO: calculate base64 representations of the security codes required to identify this RPC client
            this.request(this, "Authenticate",
              [this.clientVersion, "KeeFox Firefox add-on",
                this.getClientIdSignatureBase64(), this.getUniqueClientIdBase64()],
              function rpc_callback(resultWrapper) {
                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
                var window = wm.getMostRecentWindow("navigator:browser");

                if (resultWrapper.result == 0) // successfully authorised by remote RPC server
                {
                    window.setTimeout(function () {
                    
                        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                 .getService(Components.interfaces.nsIWindowMediator);
                        var window = wm.getMostRecentWindow("navigator:browser");
                        window.keeFoxInst._keeFoxStorage.set("KeePassRPCActive", true); // is this the right place to do this?
                        window.keeFoxInst._keeFoxVariableInit();//window.keeFoxToolbar, window);
                        window.keeFoxInst._refreshKPDB();//_keeFoxInitialToolBarSetup(window.keeFoxToolbar, window);
                    }, 100); // 0.1 second delay before we try to do the KeeFox connection startup stuff
                } else
                { //TODO: handle error codes better
                    window.keeFoxInst.KFLog.warn("Problem authenticating with KeePass. The error code is: " + resultWrapper.result);
                    window.keeFoxInst._pauseKeeFox();
                } 
                //TODO: set confirmation that the connection is established and authenticated?
            }, this.requestId);
        }
    }

    this.onDataAvailable = function(request, ctx, inputStream, offset, count)
    {
        //var data = this.readData(count);
        var data = this.readData(); // don't care about the number of bytes, we'll just read all the UTF8 characters available
        var lastPacketEndIndex = 0;
        
        //TODO: handle whitespace between json packets? (although KeePassRPC should never send them)
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
                fullData = data.substr(lastPacketEndIndex,i-lastPacketEndIndex+1);
                
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
                        this.callbacks[obj.id](obj);
                        delete this.callbacks[obj.id];
                    } catch (e)
                    {
                        delete this.callbacks[obj.id];
                        log.warn("An error occurred when processing the callback for JSON-RPC object id " + obj.id);
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
                        log.error("Error processing onDataAvailable:" + data);
                    else
                        log.error("Error processing onDataAvailable");
                }
            }
        }
        
        // if any data was left un-handled we store it ready for use when the next TCP packet arrives
        if (lastPacketEndIndex < data.length-1)
        {
            log.warn("partial data received - not well tested! " + lastPacketEndIndex + ":"  + data.length);
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
    this.request = function(session, method, params, callback, requestId)
    {
        if (requestId == undefined || requestId == null || requestId < 0)
            throw("JSON-RPC communciation requested with no requestID provided.");
 
        this.callbacks[requestId] = callback;
        var data = JSON.stringify({ "params": params, "method": method, "id": requestId });
        if (log.logSensitiveData)
            log.debug("Sending a JSON-RPC request: " + data);
        else
            log.debug("Sending a JSON-RPC request");
            
        var writeResult = session.writeData(data);
        if (writeResult <=0)
        {
            log.warn("JSON-RPC request could not be sent.");
            this.callbacks[requestId] = null;
            this.syncRequestResults[requestId] = new Error("JSON-RPC request could not be sent");
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
        
        // We only really need one method to be callable
        if (method=="callBackToKeeFoxJS")
            this.callBackToKeeFoxJS(data);
    }

    // send a synchronous request to the JSON server
    this.syncRequest = function(session, method, params)
    {
        if (log.logSensitiveData)
            log.debug("Preparing a synchronous request to the JSON-RPC server:" + method + ":" + params);
        else
            log.debug("Preparing a synchronous request to the JSON-RPC server.");
        
        //ASSUMPTION: this operation is atomic (if not, very unfortunate
        // multi-thread timing could lead to two requests with the same ID)
        var myRequestId = ++this.requestId;
        
        this.syncRequestResults[myRequestId] = null; //TODO: can the JSON parser ever
        // return null? if so, change this or else we might deadlock
        // TODO: set a timeout on this sync event (set above to a JS Error object)

        this.request(session, method, params, function rpc_callback(resultWrapper) {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser");
            window.keeFoxInst.KeePassRPC.syncRequestResults[resultWrapper.id] = resultWrapper.result;            
        }, myRequestId);
        
        if (log.logSensitiveData)
            log.debug("Waiting for the synchronous request to the JSON-RPC server to end:" + method + ":" + params);
        else
            log.debug("Waiting for the synchronous request to the JSON-RPC server to end.");
        
        var thread = Components.classes["@mozilla.org/thread-manager;1"]
                     .getService(Components.interfaces.nsIThreadManager)
                     .currentThread;
                            
        while (this.syncRequestResults[myRequestId] == null)
            thread.processNextEvent(true);
        
        if (log.logSensitiveData)    
            log.debug("Synchronous request to the JSON-RPC server has returned:" + method + ":" + params);                  
        else
            log.debug("Synchronous request to the JSON-RPC server has returned."); 
        
        var result = this.syncRequestResults[myRequestId];
        
        // we won't ever use this array slot again but I
        // suspect clearing it will help with JS memory recovery  
        this.syncRequestResults[myRequestId] = null;
                    
        return result;
    }

    this.callBackToKeeFoxJS = function (signal)
    {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");
        
        // call this async so that json reader can get back to listening ASAP and prevent deadlocks
        window.setTimeout(function () {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser");
            window.keeFoxInst.CallBackToKeeFoxJS(signal);
        },5);
    }

    //***************************************
    // Functions below can be thought of as proxies to the RPC
    // methods exposed in the KeePassRPC server.
    // See KeePassRPCService.cs for more detail
    // TODO: pull these out into a more specific prototype
    //***************************************

    this.launchGroupEditor = function(uniqueID)
    {
        var result = this.syncRequest(this, "LaunchGroupEditor", [uniqueID]);
        return;
    }

    this.launchLoginEditor = function(uniqueID)
    {
        var result = this.syncRequest(this, "LaunchLoginEditor", [uniqueID]);
        return;
    }

    this.getDBName = function()
    {
        var result = this.syncRequest(this, "GetDatabaseName");
        return result;
    }

    this.getDBFileName = function()
    {
        var result = this.syncRequest(this, "GetDatabaseFileName");
        return result;
    }

    this.getRootGroup = function()
    {
        var result = this.syncRequest(this, "GetRoot");
        return result;
    }

    this.changeDB = function(fileName, closeCurrent)
    {
        this.syncRequest(this, "ChangeDatabase", [fileName, closeCurrent]);
        return;
    }

    this.getMRUdatabases = function()
    {
        var result = this.syncRequest(this, "GetCurrentKFConfig");
        return result.knownDatabases;
    }

    this.addLogin = function(login, parentUUID)
    {
        var jslogin = login.asEntry();
        var result = this.syncRequest(this, "AddLogin", [jslogin, parentUUID]);
        return;
    }

    this.findLogins = function(hostname, formSubmitURL, httpRealm, uniqueID)
    {
        var lst = "LSTall";
        if (httpRealm == undefined || httpRealm == null || httpRealm == "")
            lst = "LSTnoRealms";
        else if (formSubmitURL == undefined || formSubmitURL == null || formSubmitURL == "")
            lst = "LSTnoForms";       
        var result = this.syncRequest(this, "FindLogins", [hostname, formSubmitURL, httpRealm, lst, false, uniqueID]);

        var convertedResult = [];
        for (var i in result)
        {
            var kfl = newkfLoginInfo();
            kfl.initFromEntry(result[i]);
            convertedResult.push(kfl);
        }
        return convertedResult; // an array of logins
    }

    this.getChildEntries = function(uniqueID)
    {      
        var result = this.syncRequest(this, "GetChildEntries", [uniqueID]);

        var convertedResult = [];
        for (var i in result)
        {
            var kfl = newkfLoginInfo();
            kfl.initFromEntry(result[i]);
            convertedResult.push(kfl);
        }
        if (log.logSensitiveData)
            log.debug("converted logins: " + JSON.stringify(convertedResult));
        return convertedResult; // an array of logins
    }

    this.getAllLogins = function()
    {      
        var result = this.syncRequest(this, "GetAllLogins");

        var convertedResult = [];
        for (var i in result)
        {
            var kfl = newkfLoginInfo();
            kfl.initFromEntry(result[i]);
            convertedResult.push(kfl);
        }
        return convertedResult; // an array of logins
    }

    this.countLogins = function(hostname, formSubmitURL, httpRealm)
    {
        var lst = "LSTall";
        if (httpRealm == undefined || httpRealm == null || httpRealm == "")
            lst = "LSTnoRealms";
        else if (formSubmitURL == undefined || formSubmitURL == null || formSubmitURL == "")
            lst = "LSTnoForms";       
        var result = this.syncRequest(this, "CountLogins", [hostname, formSubmitURL, httpRealm, lst, false]);

        return result; // an integer
    }

    this.getChildGroups = function(uniqueID)
    {
        var result = this.syncRequest(this, "GetChildGroups", [uniqueID]);
        return result; // an array of groups
    }
    
    this.generatePassword = function()
    {
        var result = this.syncRequest(this, "GeneratePassword", [""]);
        return result; // a string
    }
    
    


    // these probably need implementing one day...
    //addGroup(title, parentUUID)
    //.deleteLogin(uniqueID)
    //.deleteGroup(uniqueID)
    //.getParentGroup(uniqueID)
    //.modifyLogin(oldLogin, newLogin)

}).apply(jsonrpcClient.prototype);
