/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
Copyright 2008-2013 Chris Tomlinson <keefox@christomlinson.name>

kprpcClient.js provides functionality for
communication using the KeePassRPC protocol >= version 1.3.

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

var EXPORTED_SYMBOLS = ["kprpcClient"];

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

Cu.import("resource://kfmod/kprpcClientLegacy.js");
Cu.import("resource://kfmod/KFLogger.js");
Cu.import("resource://kfmod/biginteger.js");
Cu.import("resource://kfmod/sjcl.js");
Cu.import("resource://kfmod/utils.js");
Cu.import("resource://kfmod/SRP.js");

var log = KFLog;

function kprpcClient() {
    this.requestId = 1;
    this.callbacks = {};
    this.callbacksData = {};
    this.clientVersion = [1,2,4];
    
    // We manually create HMACs to protect the integrity of our AES encrypted messages
    sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."](); 
}

kprpcClient.prototype = new kprpcClientLegacy();
kprpcClient.prototype.constructor = kprpcClient;

(function() {


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
        
        try {
            this.sendJSONRPC(data);
        } catch (ex)
        {
            log.warn("JSON-RPC request could not be sent.");
            delete this.callbacks[requestId];
            delete this.callbacksData[requestId];
        }
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
    };

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
    };

    this.sendJSONRPC = function(data) {
        let encryptedContainer = this.encrypt(data);

        var data2server = 
  		{
  			protocol: "jsonrpc",
	        srp: null,
            key: null,
            error: null,
            jsonrpc: encryptedContainer,
	        version: utils.versionAsInt(this.clientVersion)
    	};

    	this.send(JSON.stringify(data2server));
  	};

    this.send = function(data) {
  		this.webSocket.send(data);
  	};
  	
    this.srpClientInternals = null;
  	this.secretKey = null;
    this.securityLevel = 3;
    this.securityLevelServerMinimum = 3;
    this.authenticated = false;

    // Close the current connection and reset those variables that are shared at the moment (e.g. secret key + authenticated status)
    // NB: Legacy support complicates the situation at the moment but in a future KeeFox release we'll
    // probably create a more concrete representation for an existing connection so it's clearer 
    // what we have to reset and what is just boilerplate around every connection
    this.resetConnection = function() {
        this.authenticated = false;
        this.srpClientInternals = null;
        this.secretKey = null;
        
        // Close the websocket connection if there is one (if it's already closed, nothing will happen)
        if (this.webSocket)
            this.webSocket.close();
    };

  	// data = JSON (underlying network/transport layer must have already formed incoming message(s) into JSON objects)
  	this.receive = function(data) {
  		if (data === undefined || data === null)
  			return;
  		if (data.protocol === undefined || data.protocol === null)
  			return;
  		switch (data.protocol)
  		{
  			case "setup": this.receiveSetup(data); break;
  			case "jsonrpc": this.receiveJSONRPC(data); break;
            case "error": 
                if (data.error)
                {
                    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                        .getService(Components.interfaces.nsIWindowMediator);
                    var window = wm.getMostRecentWindow("navigator:browser") ||
                                 wm.getMostRecentWindow("mail:3pane");

                    let extra = [];
                    if (data.error.messageParams && data.error.messageParams.length >= 1)
                        extra[0] = data.error.messageParams[0];

                    if (data.error.code == "VERSION_CLIENT_TOO_HIGH")
                    {
                        log.error(window.keefox_org.locale.$STRF("KeeFox-conn-client-v-high", extra));
                        window.keefox_org._launchInstaller(null,null,true);
                    } else if (data.error.code == "VERSION_CLIENT_TOO_LOW")
                    {
                        log.error(window.keefox_org.locale.$STRF("KeeFox-conn-client-v-low", extra));
                        window.keefox_org._launchInstaller(null,null,true,utils.versionAsString(extra),this.versionAsString(utils.versionAsInt(this.clientVersion)));
                    } else if (data.error.code == "UNRECOGNISED_PROTOCOL")
                    {
                        log.error(window.keefox_org.locale.$STR("KeeFox-conn-unknown-protocol") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra));
                    } else if (data.error.code == "INVALID_MESSAGE")
                    {
                        log.error(window.keefox_org.locale.$STR("KeeFox-conn-invalid-message") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra));
                    } else if (data.error.code == "AUTH_RESTART")
                    {
                        log.error(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart") + " "
                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra));
                        this.removeStoredKey(this.getUsername(this.getSecurityLevel())); //TODO1.3: Check that it's OK to call this from outside of setup protocols
                        window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart") 
                            + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
                    } else
                    {
                        log.error(window.keefox_org.locale.$STR("KeeFox-conn-unknown-error") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra)); 
                        window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-unknown-error") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", ["See KeeFox log"]));
                    }
                }
                this.resetConnection();
                break;
  			default: return;
  		}
  		
  	};
  	
  	this.receiveSetup = function(data) {
  		// double check
  		if (data.protocol != "setup")
  			return;
  		  		
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                    .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");

        if (this.authenticated)
        {
            log.warn(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart"));
            this.removeStoredKey(this.getUsername(this.getSecurityLevel()));
            window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart") 
                + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
            this.resetConnection();
  			return; // already authenticated so something went wrong. Do the full Auth process again to be safe.
        }

        if (data.error)
        {
            let extra = [];
            if (data.error.messageParams && data.error.messageParams.length >= 1)
                extra[0] = data.error.messageParams[0];
            switch (data.error.code)
            {
                case "AUTH_CLIENT_SECURITY_LEVEL_TOO_LOW": log.warn(window.keefox_org.locale.$STRF("KeeFox-conn-setup-client-sl-low", extra));
                                        window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STRF("KeeFox-conn-setup-client-sl-low", extra));
                                        break;
                case "AUTH_FAILED": log.warn(window.keefox_org.locale.$STR("KeeFox-conn-setup-failed") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra));
                                        window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-failed") 
                                            + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
                                        // There may be a stored key that has become corrupt through a change of security level, etc.
                                        this.removeStoredKey(this.getUsername(this.getSecurityLevel()));
                                        break;
                case "AUTH_RESTART": log.warn(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra));
                                        this.removeStoredKey(this.getUsername(this.getSecurityLevel()));
                                        window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart") 
                                            + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
                                        break;
                case "AUTH_EXPIRED": log.warn(window.keefox_org.locale.$STRF("KeeFox-conn-setup-expired", extra));
                                        this.removeStoredKey(this.getUsername(this.getSecurityLevel()));
                                        window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-expired") 
                                            + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
                                        break;
                case "AUTH_INVALID_PARAM": log.error(window.keefox_org.locale.$STRF("KeeFox-conn-setup-invalid-param", extra)); break;
                case "AUTH_MISSING_PARAM": log.error(window.keefox_org.locale.$STRF("KeeFox-conn-setup-missing-param", extra)); break;
                default: log.error(window.keefox_org.locale.$STR("KeeFox-conn-unknown-error") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra)); 
                            window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-unknown-error") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", ["See KeeFox log"]));
                            break;
            }
            this.resetConnection();
            return;
        }
  		
        // We use key authentication when we have a pre-agreed secret key
  		if (data.key !== undefined && data.key !== null)
  		{
            if (this.checkServerSecurityLevel(data.key.securityLevel))
            {
  		        if (data.key.sc)
  		        {
  			        this.keyChallengeResponse1(data);
  		        } else if (data.key.sr)
                {
                    this.keyChallengeResponse2(data);
                } else
                {

                }
            } else
            {
                log.warn(window.keefox_org.locale.$STRF("KeeFox-conn-setup-server-sl-low", [this.getSecurityLevelServerMinimum()]));
                this.sendError("AUTH_SERVER_SECURITY_LEVEL_TOO_LOW", [this.getSecurityLevelServerMinimum()]);
                window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STRF("KeeFox-conn-setup-server-sl-low", [this.getSecurityLevelServerMinimum()]));
            }
        }

  		// We use SRP when we have no knowledge of a pre-agreed secret key
  		if (data.srp !== undefined && data.srp !== null)
  		{
            if (this.checkServerSecurityLevel(data.srp.securityLevel))
            {
  		        switch (data.srp.stage)
  		        {
  			        case "identifyToClient": this.identifyToClient(data); break;
  			        case "proofToClient": this.proofToClient(data); break;
  			        default: return;
  		        }
            } else
            {
                log.warn(window.keefox_org.locale.$STRF("KeeFox-conn-setup-server-sl-low", [this.getSecurityLevelServerMinimum()]));
                this.sendError("AUTH_SERVER_SECURITY_LEVEL_TOO_LOW", [this.getSecurityLevelServerMinimum()]);
                window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STRF("KeeFox-conn-setup-server-sl-low", [this.getSecurityLevelServerMinimum()]));
            }
        }
  	};

    this.sendError = function (errCode, errParams)
    {
        var data2server = 
  		{
  			protocol: "setup",
	        srp: null,
            key: null,
            error: {
                code: errCode,
                params: errParams
            },
	        version: utils.versionAsInt(this.clientVersion)
    	};
    
    	this.send(JSON.stringify(data2server));
    };

    this.checkServerSecurityLevel = function(serverSecurityLevel)
    {
        if (serverSecurityLevel >= this.getSecurityLevelServerMinimum())
            return true;
        return false;
    };

    this.keyChallengeResponse1 = function(data) {
  		
        this.sc = data.key.sc;

        this.cc = utils.BigIntFromRandom(32).toString(16).toLowerCase();

        let cr = utils.hash("1" + this.getStoredKey() + this.sc + this.cc).toLowerCase();

    	var data2server = 
  		{
  			protocol: "setup",
	        key:
	        {
	        	cc: this.cc,
                cr: cr,
                securityLevel: this.getSecurityLevel()
	        },
	        version: utils.versionAsInt(this.clientVersion)
    	};
    
    	this.send(JSON.stringify(data2server));
  	};

    this.keyChallengeResponse2 = function(data) {
        let sr = utils.hash("0" + this.getStoredKey() + this.sc + this.cc).toLowerCase();

        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                        .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("common-dialog") ||
                        wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");

        if (sr != data.key.sr)
        {
            log.warn(window.keefox_org.locale.$STR("KeeFox-conn-setup-failed"));
            window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-failed") 
                + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
            this.removeStoredKey(this.getUsername(this.getSecurityLevel()));
            this.resetConnection();
            return;
        }
        else
        {
            // note down our agreed secret key somewhere that we can find it easily later
            this.secretKey = this.getStoredKey();

            
            window.setTimeout(function () {
                    
                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                            .getService(Components.interfaces.nsIWindowMediator);
                var window = wm.getMostRecentWindow("navigator:browser") ||
                                wm.getMostRecentWindow("mail:3pane");
                window.keefox_win.UI.removeConnectionMessage(); // if any errors were shown, they are now resolved
                window.keefox_org._keeFoxStorage.set("KeePassRPCActive", true); // is this the right place to do this?
                window.keefox_org._keeFoxVariableInit();
                if (window.keefox_org._keeFoxExtension.prefs.has("currentLocation")) //TODO2: set up preference change listener for ease of location based changes in future
                {
                    var currentLocation = window.keefox_org._keeFoxExtension.prefs.getValue("currentLocation","");
                    window.keefox_win.Logger.info("Setting KeePassRPC location to " + currentLocation + ".");
                    window.keefox_org.changeLocation(currentLocation);
                }
                window.keefox_org._refreshKPDB();
            }, 50); // 0.05 second delay before we try to do the KeeFox connection startup stuff
        }
  	};
  	
  	this.identifyToClient = function(data) {
  		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                    .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("common-dialog") ||
                        wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");

        // get the user to type in the one-time password
        let password = window.prompt(window.keefox_org.locale.$STR("KeeFox-conn-setup-enter-password"));

  		this.srpClientInternals.p = password;
  		this.srpClientInternals.receive_salts(data.srp.s, data.srp.B);
  		
    	var data2server = 
  		{
  			protocol: "setup",
	        srp:
	        {
	        	stage: "proofToServer",
	            M: this.srpClientInternals.M,
                securityLevel: this.getSecurityLevel()
	        },
	        version: utils.versionAsInt(this.clientVersion)
    	};
    
    	this.send(JSON.stringify(data2server));
  	};
  	
  	this.proofToClient = function(data) {
  		this.srpClientInternals.confirm_authentication(data.srp.M2);

        //TODO1.4: DRY - getMostRecentWindow into KFUtils
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                    .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("common-dialog") ||
                        wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");

  		if (!this.srpClientInternals.authenticated)
        {
            log.warn(window.keefox_org.locale.$STR("KeeFox-conn-setup-failed"));
            window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-failed") 
                + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
            this.removeStoredKey(this.getUsername(this.getSecurityLevel()));
            this.resetConnection();
            return;
        }
        else
        {
            // note down our agreed secret key somewhere that we can find it easily later
            this.secretKey = this.srpClientInternals.key();

            // store the key somewhere persistent (according to the security level rules)
            this.setStoredKey(this.srpClientInternals.I, this.getSecurityLevel(), this.srpClientInternals.key());

            window.setTimeout(function () {
                    
                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                            .getService(Components.interfaces.nsIWindowMediator);
                var window = wm.getMostRecentWindow("navigator:browser") ||
                                wm.getMostRecentWindow("mail:3pane");
                window.keefox_win.UI.removeConnectionMessage(); // if any errors were shown, they are now resolved
                window.keefox_org._keeFoxStorage.set("KeePassRPCActive", true); // is this the right place to do this?
                window.keefox_org._keeFoxVariableInit();
                if (window.keefox_org._keeFoxExtension.prefs.has("currentLocation")) //TODO2: set up preference change listener for ease of location based changes in future
                {
                    var currentLocation = window.keefox_org._keeFoxExtension.prefs.getValue("currentLocation","");
                    window.keefox_win.Logger.info("Setting KeePassRPC location to " + currentLocation + ".");
                    window.keefox_org.changeLocation(currentLocation);
                }
                window.keefox_org._refreshKPDB();
            }, 50); // 0.05 second delay before we try to do the KeeFox connection startup stuff
                
        } 
        
  	};
  	
  	this.receiveJSONRPC = function(data) {
        let fullData = this.decrypt(data.jsonrpc);
        if (fullData === null)
            return; // decryption failed; connection has been reset and user will re-enter password for fresh authentication credentials

        let obj = JSON.parse(fullData);
                
        // if we failed to parse an object from the JSON    
        if (!obj)
            return;
            
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
                log.error("Unexpected error processing receiveJSONRPC:" + data);
            else
                log.error("Unexpected error processing receiveJSONRPC");
        }

    };


        
  	this.setup = function() {
  		let setupKey = null;
        let setupSRP = null;

        
        //this.getSecurityLevelServerMinimum();
        
    //this.securityLevel = 3;
    //this.securityLevelServerMinimum = 3;
        let securityLevel = this.getSecurityLevel();
        
  		let username = this.getUsername(securityLevel);

        // If we find a secure key already, lets send the unique username for this client instead of the srp object. Server will then enter challenge-response handshake phase
        let storedKey = this.getStoredKey(username, securityLevel);

        
        if (storedKey)
        {
            // send a setup message asking to mutally authenticate using the shared key
            setupKey =
            {
	        	username: username,
                securityLevel: securityLevel
	        };
        } else
        {
            // start the SRP authentication procedure
  		    this.srpClientInternals = new SRPc();
            this.srpClientInternals.setup(username);
            setupSRP = 
            {
	        	stage: "identifyToServer",
	            I: this.srpClientInternals.I,
	            A: this.srpClientInternals.Astr,
                securityLevel: securityLevel
	        };
        }
  		
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");

  		var data2server = 
  		{
  			protocol: "setup",
	        srp: setupSRP,
            key: setupKey,
	        version: utils.versionAsInt(this.clientVersion),
	        
            // these parameters allows KPRPC to identify which type of client is making
            // this request. We can't trust it but it can help the user to understand what's going on.
            clientTypeId: "keefox", 
	        clientDisplayName: "KeeFox",
            clientDisplayDescription: window.keefox_org.locale.$STR("KeeFox-conn-display-description")
    	}
    	
    	this.send(JSON.stringify(data2server));
    	
    	
  	};

    this.getUsername = function(securityLevel)
    {
        let username = "";
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");

        // if we expect client to be able to retrieve a password from a stored location, we'll re-use the most recent username if we can find it. Otherwise we'll start from scratch
        if (securityLevel <= 2)
        {
            if (window.keefox_org._keeFoxExtension.prefs.has("KPRPCUsername"))
                username = window.keefox_org._keeFoxExtension.prefs.getValue("KPRPCUsername","");
            else
                username = "";
        }

        if (username.length <= 0)
        {
            var uuidGenerator = Components.classes["@mozilla.org/uuid-generator;1"]
                            .getService(Components.interfaces.nsIUUIDGenerator);
            var uuid = uuidGenerator.generateUUID();
            username = uuid.toString();
            username = username.substr(1,username.length-2);
            window.keefox_org._keeFoxExtension.prefs.setValue("KPRPCUsername",username);
        }
        return username;
    };

    this.getSecurityLevel = function()
    {
        // read these from about:config. Attacker could change about:config to a lower security level but in doing so, a new SRP auth will be triggered during which the server has opportunity to reject the client becuase its security level is too low.
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
                        
        if (window.keefox_org._keeFoxExtension.prefs.has("connSLClient"))
            return window.keefox_org._keeFoxExtension.prefs.getValue("connSLClient",2);
        else
            return 2;
    };

    this.getSecurityLevelServerMinimum = function()
    {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
                        
        if (window.keefox_org._keeFoxExtension.prefs.has("connSLServerMin"))
            return window.keefox_org._keeFoxExtension.prefs.getValue("connSLServerMin",2);
        else
            return 2;
    };

    this.getNSILMpassword = function(username)
    {
        let myLoginManager = Components.classes["@mozilla.org/login-manager;1"].
            getService(Components.interfaces.nsILoginManager);
        let logins = myLoginManager.findLogins({}, 'chrome://keefox', "", 'KPRPC key');
        for (let i=0; i < logins.length; i++)
            if (logins[i].username == username)
                return logins[i].password;
    };

    this.removeNSILMpassword = function(username)
    {
        let myLoginManager = Components.classes["@mozilla.org/login-manager;1"].
            getService(Components.interfaces.nsILoginManager);
        let logins = myLoginManager.findLogins({}, 'chrome://keefox', "", 'KPRPC key');
        for (let i=0; i < logins.length; i++)
            if (logins[i].username == username)
                myLoginManager.removeLogin(logins[i]);
    };

    this.addNSILMpassword = function(loginInfo)
    {
        let myLoginManager = Components.classes["@mozilla.org/login-manager;1"].
            getService(Components.interfaces.nsILoginManager);
        myLoginManager.addLogin(loginInfo);
    };
    
    this.getStoredKey = function(username, securityLevel)
    {
        if (username === undefined)
        {
            securityLevel = this.getSecurityLevel();
            username = this.getUsername(securityLevel);
        }

        if (securityLevel >= 3 || securityLevel <= 0)
            return null;
        if (securityLevel == 2)
        {
            // find key
            return this.getNSILMpassword(username);

        } else if (securityLevel == 1)
        {
            // get the key from about:config
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
                        
            if (window.keefox_org._keeFoxExtension.prefs.has("KPRPCStoredKey-"+username))
                return window.keefox_org._keeFoxExtension.prefs.getValue("KPRPCStoredKey-"+username,null);
            else
                return null;
        }
    };

    
    this.setStoredKey = function(username, securityLevel, key)
    {
        if (securityLevel >= 3 || securityLevel <= 0)
            return;
        if (securityLevel == 2)
        {
            // add/change key
            this.removeNSILMpassword(username);
            var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                            Components.interfaces.nsILoginInfo, "init");
            this.addNSILMpassword(new nsLoginInfo('chrome://keefox', null, 'KPRPC key', username, key, "", ""));
        } else if (securityLevel == 1)
        {
            // set the key in about:config
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
                        
            window.keefox_org._keeFoxExtension.prefs.setValue("KPRPCStoredKey-"+username,key);
        }
    };

    this.removeStoredKey = function(username, securityLevel)
    {
        if (!securityLevel || securityLevel == 2)
        {
            this.removeNSILMpassword(username);
        }
        if (!securityLevel || securityLevel == 1)
        {
            // set the key in about:config
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            window.keefox_org._keeFoxExtension.prefs.setValue("KPRPCStoredKey-"+username,"");
        }
    };
    
    //[deprecated]?
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
    
    //TODO1.3: put some try/catches around many of the function calls in encrypt/decrypt functions
    // Encrypt plaintext
    this.encrypt = function(plaintext)
    {
        let secKeyArray = sjcl.codec.hex.toBits(this.secretKey);
        let aes = new sjcl.cipher.aes(secKeyArray);
        let ivHex = utils.BigIntFromRandom(16).toString(16).toLowerCase(); //TODO1.3: This randomly creates ints > 32 bytes which corrupts the IV and AES process
        let ivArray = sjcl.codec.hex.toBits(ivHex); //TODO1.3: Or maybe this
        let encryptedPayload = sjcl.mode.cbc.encrypt(aes, sjcl.codec.utf8String.toBits(plaintext), ivArray);
        
        // need to convert all out int arrays (confusingly called bitarrays in sjcl) into byte arrays so we can pass it to our main hash function rather than use sjcl's (should be faster overall and possibly more secure)
        let a1 = utils.intArrayToByteArray(sjcl.codec.base64.toBits(utils.hash(utils.intArrayToByteArray(secKeyArray),"base64","SHA1")));
        let a2 = utils.intArrayToByteArray(encryptedPayload);
        let a3 = utils.intArrayToByteArray(ivArray);
        let hmac = utils.hash(a1.concat(a2).concat(a3),"base64","SHA1");

        return {
                message: sjcl.codec.base64.fromBits(encryptedPayload),
                iv: sjcl.codec.base64.fromBits(ivArray),
                hmac: hmac
                }
    };

    this.decrypt = function(encryptedContainer)
    {
        let messageArray = sjcl.codec.base64.toBits(encryptedContainer.message);
        let ivArray = sjcl.codec.base64.toBits(encryptedContainer.iv);
        let hmac = encryptedContainer.hmac;
        
        let secKeyArray = sjcl.codec.hex.toBits(this.secretKey);
        let a1 = utils.intArrayToByteArray(sjcl.codec.base64.toBits(utils.hash(utils.intArrayToByteArray(secKeyArray),"base64","SHA1")));
        let a2 = utils.intArrayToByteArray(messageArray);
        let a3 = utils.intArrayToByteArray(ivArray);
        let ourHmac = utils.hash(a1.concat(a2).concat(a3),"base64","SHA1");

        if (ourHmac !== hmac)
        {
            log.warn(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart"));
            window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart") 
                + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
            this.removeStoredKey(this.getUsername(this.getSecurityLevel()));
            this.resetConnection();
            return null;
        }

        let encryptedPayload = messageArray;
        let aes = new sjcl.cipher.aes(secKeyArray);
        let decryptedPayload = sjcl.mode.cbc.decrypt(aes, encryptedPayload, ivArray);
        let plainText = sjcl.codec.utf8String.fromBits(decryptedPayload);

        return plainText;
    };
    
}).apply(kprpcClient.prototype);

