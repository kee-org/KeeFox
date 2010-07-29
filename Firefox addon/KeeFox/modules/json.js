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
    this.clientVersion = [0,8,0];
    //this.syncFixupTimer = null;
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
        return "hUiPbbPln4TIl+/RCsl5pjL0QOeEN7OqBmkz68ZMz7tGZOUxb7BCaQ==";
    }
    
    this.getUniqueClientIdBase64 = function()
    {
        var bytes = this.getUniqueClientId(this.getClientIdSignatureBase64());
        return bytes;
    }
    
    this.getUniqueClientId = function(clientIdSig)
    {
        //TODO: get/create a unique private key?
        // encrypt public clientIdSig using private key?
        // probably no point since we can't store it securely for next session anyway :-(
        var sig = "";
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");
                        
        if (window.keeFoxInst._keeFoxExtension.prefs.has("uniqueProfileId"))
            sig = window.keeFoxInst._keeFoxExtension.prefs.getValue("uniqueProfileId","");
        
        if (sig == "")
        {
            sig = (Math.random() * (4294967296 - 1) + 1) + clientIdSig + (Math.random() * (4294967296 - 1) + 1);
            window.keeFoxInst._keeFoxExtension.prefs.setValue("uniqueProfileId",sig);
        }
        
        return btoa(sig);
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
                        window.keeFoxInst._keeFoxVariableInit();//window.keefox_org.toolbar, window);
                        window.keeFoxInst._refreshKPDB();//_keeFoxInitialToolBarSetup(window.keefox_org.toolbar, window);
                    }, 100); // 0.1 second delay before we try to do the KeeFox connection startup stuff
                } else
                { //TODO: handle error codes better
                    if (resultWrapper.result == 3) // version mismatch
                    {
                        window.keefox_org.Logger.info("Problem authenticating with KeePass. KeePassRPC version upgrade (or downgrade) required.");
                        window.keeFoxInst._launchInstaller(null,null,true);
                    } else
                    {
                        window.keefox_org.Logger.warn("Problem authenticating with KeePass. The error code is: " + resultWrapper.result);
                    }
                    window.keeFoxInst._pauseKeeFox();
                } 
                //TODO: set confirmation that the connection is established and authenticated?
            }, this.requestId);
        } else if (topic == "connect-failed")
        {
            //var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            //         .getService(Components.interfaces.nsIWindowMediator);
            //var window = wm.getMostRecentWindow("navigator:browser");
            //window.keeFoxInst.KFLog.warn("Problem connecting to KeePass: " + message);
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
                        if (this.callbacks[obj.id] != null)
                            this.callbacks[obj.id](obj);
                        delete this.callbacks[obj.id];
                    } catch (e)
                    {
                        delete this.callbacks[obj.id];
                        log.warn("An error occurred when processing the result callback for JSON-RPC object id " + obj.id + ": " + e);
                    }
                } else if ("error" in obj)
                {
                    try
                    {
                        log.error("An error occurred in KeePassRPC object id: " + obj.id + " with this message: " + obj.message + " and this error: " + obj.error + " and this error message: " + obj.error.message);
                        if (this.callbacks[obj.id] != null)
                            this.callbacks[obj.id](obj);
                        delete this.callbacks[obj.id];
                    } catch (e)
                    {
                        delete this.callbacks[obj.id];
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
        // return null? if so, change this or else we might deadlock YES! And we do deadlock!
        // TODO: set a timeout on this sync event (set above to a JS Error object)

        this.request(session, method, params, function rpc_callback(resultWrapper) {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser");
            
            if ("result" in resultWrapper && resultWrapper.result !== false)
            {
                if (resultWrapper.result !== null)
                    window.keeFoxInst.KeePassRPC.syncRequestResults[resultWrapper.id] = resultWrapper.result;
                else
                    window.keeFoxInst.KeePassRPC.syncRequestResults[resultWrapper.id] = new Error("Null return result received");
            } else
                window.keeFoxInst.KeePassRPC.syncRequestResults[resultWrapper.id] = new Error(resultWrapper.error);    
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
        // fire and forget
        this.request(this, "LaunchGroupEditor", [uniqueID], null, ++this.requestId);
        return;
    }

    this.launchLoginEditor = function(uniqueID)
    {
        // fire and forget
        this.request(this, "LaunchLoginEditor", [uniqueID], null, ++this.requestId);
        return;
    }

    this.getDBName = function()
    {  
        /*ASYNC review: KF.js(547)
        KFToolBar.js(427)
        1) blocks _refreshKPDB (name required before can decide if we're logged in, etc.)
        2) blocks setupButton_ready toolbar (same reason); function later creates MRU DB 
        button but this is just another call (potentially async) and won't fail if this
        function hasn't returned yet
        
        1) move all contents of _refreshKPDB into a callback function. tabselect event
        listener timing may be fragile (but if so, needs fixing anyway)
        2) create a loggedInAs call back to recieve the name and do the work currently 
        in the if statement on line 427+
        
        **** callbacks need to happen on main thread (GUI access)
        
        3 hours
        
        */
        var result = this.syncRequest(this, "GetDatabaseName");
        return result;
    }

    this.getDBFileName = function()
    {
        /*ASYNC review: 
        called only from within _refreshKPDB method. only to update MRU preference
        so no problem pulling it into a callback function
        
        1 hour
        
        */
        var result = this.syncRequest(this, "GetDatabaseFileName");
        return result;
    }

    this.getRootGroup = function()
    {
        /*ASYNC review: KFToolBar.js(174) only
        blocks start of loading all logins onto toolbar
        
        logins button enabled after logins menu populated but login menu 
        population could be started from a callback
        
        !!! calling functions assume that calls to those functions have completed and hence 
        sometimes make a second call shortly after (e.g. logins cleared
         and then updated list added)
         
        shouldn't be a problem dealing with two concurrent requests to this function
        but related function calls need more thought...
        
        ? hours
        
        */
        var result = this.syncRequest(this, "GetRoot");
        return result;
    }

    this.changeDB = function(fileName, closeCurrent)
    {
        // fire and forget
        this.request(this, "ChangeDatabase", [fileName, closeCurrent], null, ++this.requestId);
        return;
    }

    this.getMRUdatabases = function()
    {
        /*ASYNC review: called only in response to popup menu showing on MRU menu
        
        need to add support for "please wait" in menu drop down/out but otherwise
        straightforward
                
        */
        var result = this.syncRequest(this, "GetCurrentKFConfig");
        return result.knownDatabases;
    }

    this.addLogin = function(login, parentUUID)
    {
        var jslogin = login.asEntry();
        // fire and forget
        this.request(this, "AddLogin", [jslogin, parentUUID], null, ++this.requestId);        
        return;
    }

    this.findLogins = function(hostname, formSubmitURL, httpRealm, uniqueID)
    {
        /*ASYNC review: 
        1) commonDialog.js(180)
        2) KFILM.js(634)
        3) KFILM_Fill.js(488)
        4) ...
        5) 
        
        1) Not benefit to user if result is handled asyncronously - they'll just see
         a momentary delay before everything gets shuffled around just as they are
         trying to interact with the dialog. Only transport layer failure or KeePass 
         crash could cause long delay at this point but find operation should be pretty 
         quick for all databases and computers so a 10 second timeout should give us a
         way to recover from such an exceptional event.
         Alternative is to design placeholders saying "loading" to user. Not sure we can
         calculate the size in advance but if so this could be a neater thing to aim for
        2) Only called from notification bar so no need for callback feedback to user.
        Will need to create a callback function that incorporates the addLogin() 
        call referred to above
        3) called for every form on a page load; currently skips call if previous call was
        for same criteria. could maybe yield at each iteration? BUT information stored in 
        tab (for passing on to next page) can't be done until function calls to all forms
        have returned - what if one doesn't? need to do some things ASAP but only after 
        we know the result - e.g. setting form contents change listeners (can't do this
         before autofill has happened)
        
        Massive task - many days at least.
        
        */
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
        /*ASYNC review: 
        used only via user interaction with Logins menu. as with getRoot, we could put up some sort 
        of "loading" sign and make all these requests async. but maybe we're better off just developing
        the getAllLogins feature so that the entire DB structure is stored in the main module and toolbar Logins
        updates consist of locking user interaction with the menu, transferring data from the module into a toolbar
        structure and then unlocking UI. This cuold be forced upon the toolbar as per current _refreshKPDB system
        or it could be intiated by the toolbar (e.g. in response to a notification from the module that the logins
        structure has changed). Latter could be far more efficient if actual changes to DB are rare? Maybe module
        could cache DB contents for each database? but how do we know we need to clear it when that DB is locked / closed?
        */   
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
        /*ASYNC review: 
        never used; could be useful in re-worked "all logins" storage in shared module rather than getChildEntries/Groups
        */
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
        /*ASYNC review: 
        deprecating this function anyway.
        */
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
        /*ASYNC review: 
        could easily make async but might be better for user to see a slight pause
         rather than risk dodgy connections causing clipboard to be overwritten
          long after user thinks operation failed
        */
        var result = this.syncRequest(this, "GeneratePassword", [""]);
        return result; // a string
    }
    
    /*
    
    maybe a standard timeout could be put in place for some functions so if their async response comes back after some recorded deadline we can ignore it.
    
    
    
    DEBUG: setupButton_ready start
DEBUG: Preparing a synchronous request to the JSON-RPC server.
DEBUG: Sending a JSON-RPC request
DEBUG: Waiting for the synchronous request to the JSON-RPC server to end.
    
    
    */
    


    // these probably need implementing one day...
    //addGroup(title, parentUUID)
    //.deleteLogin(uniqueID)
    //.deleteGroup(uniqueID)
    //.getParentGroup(uniqueID)
    //.modifyLogin(oldLogin, newLogin)

}).apply(jsonrpcClient.prototype);
