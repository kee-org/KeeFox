/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
Copyright 2008-2013 Chris Tomlinson <keefox@christomlinson.name>

jsonrpcClient.js provides a JSON-RPC client and method proxies for
communication between KeeFox and a KeePassRPC server.
It only works when extending a kprpcClient object.

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

Cu.import("resource://kfmod/kprpcClient.js");
Cu.import("resource://kfmod/KFLogger.js");
Cu.import("resource://kfmod/kfDataModel.js");
Cu.import("resource://kfmod/utils.js");

var log = KeeFoxLog;

function jsonrpcClient() {
}

jsonrpcClient.prototype = new kprpcClient();
jsonrpcClient.prototype.constructor = jsonrpcClient;

(function() {
    //***************************************
    // Functions below can be thought of as proxies to the RPC
    // methods exposed in the KeePassRPC server.
    // See KeePassRPCService.cs for more detail
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
                    window.keefox_win.mainUI.setMRUdatabasesCallback(resultWrapper.result);
                
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

    this.updateLogin = function (login, oldLoginUUID, urlMergeMode, dbFileName) {
        var jslogin = login.asEntry();
        // fire and forget
        this.request(this, "UpdateLogin", [jslogin, oldLoginUUID, urlMergeMode, dbFileName], null, ++this.requestId);
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

    this.getApplicationMetadata = function()
    {
        var result = this.request(this, "GetApplicationMetadata", null,function rpc_callback(resultWrapper) {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            
            if ("result" in resultWrapper && resultWrapper.result !== false)
            {
                if (resultWrapper.result !== null)
                {
                    let netRuntimeVersion = "";
                    if (resultWrapper.result.isMono)
                        netRuntimeVersion = "Mono " + resultWrapper.result.monoVersion;
                    else
                        netRuntimeVersion = ".NET " + resultWrapper.result.nETversion;
                
                }

            } 
        }, ++this.requestId);
        
        return;
    }

    this.getPasswordProfiles = function () {
        var result = this.request(this, "GetPasswordProfiles", null, function rpc_callback(resultWrapper) {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");

            if ("result" in resultWrapper && resultWrapper.result !== false) {
                if (resultWrapper.result !== null)
                    window.keefox_win.mainUI.setPasswordProfilesCallback(resultWrapper.result);

            }
        }, ++this.requestId);

        return;
    }

    this.generatePassword = function (profileName, url)
    {
        this.request(this, "GeneratePassword", [profileName, url], function rpc_callback(resultWrapper) {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            
            var passwordGenerated = false;
            
            if ("result" in resultWrapper && resultWrapper.result !== false)
            {
                if (resultWrapper.result !== null)
                {
                    passwordGenerated = true;
                    window.keefox_org.utils.copyStringToClipboard(resultWrapper.result);
                    window.keefox_win.UI.growl("KeeFox", window.keefox_org.locale.$STR("generatePassword.copied"));
                }
            }
            if (!passwordGenerated)
            {
                window.keefox_win.UI.growl("KeeFox", window.keefox_org.locale.$STR("generatePassword.launch"));
            }
        }, ++this.requestId);
    }
    
    /*
    
    maybe a standard timeout could be put in place for some functions so if their async response comes back after some recorded deadline we can ignore it.
    
    */
    

}).apply(jsonrpcClient.prototype);

