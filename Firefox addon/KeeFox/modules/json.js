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
    this.callbacks = {};
    this.partialData = {};
    this.syncRequestComplete = false;
    this.parsingStringContents = false;
    this.tokenCurlyCount = 0;
    this.tokenSquareCount = 0;
    this.clientVersion = [0,7,6];
}

jsonrpcClient.prototype = new session();
jsonrpcClient.prototype.constructor = jsonrpcClient;

(function() {

    this.onNotify = function(topic, message) {
        if (topic == "transport-status-connected")
        {
        //TODO: what thread is this calback called on? if not main, then need to call back to that thread to avoid GUI DOM update crashes
        //TODO: calculate base64 representations of the security codes required to identify this RPC client
            this.request(this, "Authenticate", [this.clientVersion, "base64enc1", "base64enc2"], function rpc_callback(result) {
                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
                var window = wm.getMostRecentWindow("navigator:browser");

                if (result == 0) // successfully authorised by remote RPC server
                {
                    window.setTimeout(function () {
                    
                        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                 .getService(Components.interfaces.nsIWindowMediator);
                        var window = wm.getMostRecentWindow("navigator:browser");
                        window.keeFoxInst._keeFoxStorage.set("KeePassRPCActive", true); // is this the right place to do this?
                        window.keeFoxInst._keeFoxVariableInit(window.keeFoxToolbar, window);
                        window.keeFoxInst._keeFoxInitialToolBarSetup(window.keeFoxToolbar, window);
                    }, 100); // 0.1 second delay before we try to do the KeeFox connection startup stuff
                } else { //TODO: handle error codes
                } 
                //TODO: set confirmation that the connection is established and authenticated?
            });
        }
    }

    this.onDataAvailable = function(request, ctx, inputStream, offset, count)
    {
        var data = this.readData(count);
        var lastPacketEndIndex = 0;
        
        //TODO: handle whitespace between json packets?
        for (var i = 0; i < data.length; i++)
        {
            switch (data[i])
            {
                case '"': this.parsingStringContents = this.parsingStringContents ? false : true; break;
                case '{': if (!this.parsingStringContents) this.tokenCurlyCount++; break;
                case '}': if (!this.parsingStringContents) this.tokenCurlyCount--; break;
                case '[': if (!this.parsingStringContents) this.tokenSquareCount++; break;
                case ']': if (!this.parsingStringContents) this.tokenSquareCount--; break;
            }
            
            // when the token counts reach 0 we know that we have received a complete object in JSON format
            if (this.tokenCurlyCount == 0 && this.tokenSquareCount == 0)
            {
                var obj = null;
                fullData = data.substr(lastPacketEndIndex,i-lastPacketEndIndex+1);
                
                // if we're looking at only part of the full message we'll patch the previous bit together now
                if (session in this.partialData)
                    fullData = this.partialData[session] + fullData;
                    
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
                    this.callbacks[obj.id](obj.result);
                    delete this.callbacks[obj.id];
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
                    }
                    // json rpc not specific about notifications, other than the fact
                    // they do not have the id in the request.  do not respond to
                    // notifications
                    
                    // not serving anything interesting from Firefox...
                    //if ("id" in obj)
                    //    session.writeData(JSON.stringify(result));
                } else {
                    log.error(data);
                }
            }
        }
        
        // if any data was left un-handled we store it ready for use when the next TCP packet arrives
        if (lastPacketEndIndex < data.length-1)
        {
            if (this.partialData[session] != undefined)
                this.partialData[session] += data.substr(lastPacketEndIndex,data.length-1-lastPacketEndIndex);
            else
                this.partialData[session] = data.substr(lastPacketEndIndex,data.length-1-lastPacketEndIndex);
        }
    }
    this.onStartRequest = function(request, ctx) {}
    this.onStopRequest = function(request, ctx, status) {}

    // send a request to the current RPC server
    this.request = function(session, method, params, callback)
    {
        this.callbacks[this.requestId] = callback;
        var data = JSON.stringify({ "params": params, "method": method, "id": this.requestId });
        this.requestId++;
        session.writeData(data);
    }

    // send a notification to the current RPC server
    this.notify = function(session, method, params, callback)
    {
        var data = JSON.stringify({ "params": params, "method": method });
        session.writeData(data);
    }

    // interpret the message from the RPC server
    this.evalJson = function(method, params)
    {
        var data = JSON.stringify(params);
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
        this.syncRequestComplete = false;

        this.request(session, method, params, function rpc_callback(result) {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser");
            
            window.keeFoxInst.KeePassRPC.syncRequestComplete = true;
            window.keeFoxInst.KeePassRPC.syncRequestResult = result;
        });
                          
        var thread = Components.classes["@mozilla.org/thread-manager;1"]
                     .getService(Components.interfaces.nsIThreadManager)
                     .currentThread;
                            
        while (!this.syncRequestComplete)
            thread.processNextEvent(true);
            
        this.syncRequestComplete = false;
        return this.syncRequestResult;
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
        var jslogin = login; // TODO: translate?
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


    // these probably need implementing one day...
    //addGroup(title, parentUUID)
    //.deleteLogin(uniqueID)
    //.deleteGroup(uniqueID)
    //.getParentGroup(uniqueID)
    //.modifyLogin(oldLogin, newLogin)

}).apply(jsonrpcClient.prototype);
