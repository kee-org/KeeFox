/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
Copyright 2008-2015 Chris Tomlinson <keefox@christomlinson.name>

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
Cu.import("resource://gre/modules/Timer.jsm");

Cu.import("resource://kfmod/kprpcClientLegacy.js");
Cu.import("resource://kfmod/KFLogger.js");
Cu.import("resource://kfmod/biginteger.js");

let scriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                           .getService(Components.interfaces.mozIJSSubScriptLoader); 
scriptLoader.loadSubScript("resource://kfmod/sjcl.js");

Cu.import("resource://kfmod/utils.js");
Cu.import("resource://kfmod/SRP.js");
Cu.import("resource://gre/modules/Timer.jsm");
Cu.import("resource://gre/modules/ISO8601DateUtils.jsm");

try
{
    // Only works in FF37+ (but we work around it later if it fails)
    Cu.importGlobalProperties(['crypto']);
}
catch (e) { }

var log = KeeFoxLog;

function kprpcClient() {
    this.requestId = 1;
    this.callbacks = {};
    this.callbacksData = {};
    this.clientVersion = [1,5,4];
    this.authPromptAborted = false;
    
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
            log.warn("JSON-RPC request could not be sent. Expect an async error soon.");
            setTimeout(function () {
                this.processJSONRPCresponse({
                    "id": requestId,
                    "error": {
                        "message": "Send failure. Maybe the server went away?"
                    },
                    "message": "error"
                });
            }.bind(this),50);
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
        // call this async so that json reader can get back to listening ASAP and prevent deadlocks
        setTimeout(function () {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                         wm.getMostRecentWindow("mail:3pane");
            window.keefox_org.KPRPCListener(signal);
        },5);
    };

    
    // No need to return anything from this function so sync or async implementation is fine
    this.sendJSONRPC = function (data) {
        // async webcrypto:
        if (typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined') {
            this.encrypt(data, this.sendJSONRPCDecrypted);
            return;
        }

        // legacy Javascript approach
        let encryptedContainer = this.encrypt_JS(data);
        this.sendJSONRPCDecrypted(encryptedContainer);
    };

    this.sendJSONRPCDecrypted = function(encryptedContainer) {

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

    this.send = function (data) {
        // I have seen this throw NS_ERROR_UNEXPECTED while testing cycling KeePass open/closed
        // using Nightly 40 so now try/catch in case I can learn more about what might have
        // caused that. See #400
        try
        {
            this.webSocket.send(data);
        } catch (ex)
        {
            log.error("Failed to send a websocket message. Exception details: " + ex + ", stack: " + ex.stack);
        }
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
                        window.keefox_org.latestConnectionError = "VERSION_CLIENT_TOO_HIGH";
                        window.keefox_org._launchInstaller(null,null,true);
                    } else if (data.error.code == "VERSION_CLIENT_TOO_LOW")
                    {
                        log.error(window.keefox_org.locale.$STRF("KeeFox-conn-client-v-low", extra));
                        window.keefox_org.latestConnectionError = "VERSION_CLIENT_TOO_LOW";
                        window.keefox_org._launchInstaller(null,null,true,utils.versionAsString(extra),utils.versionAsString(utils.versionAsInt(this.clientVersion)));
                    } else if (data.error.code == "UNRECOGNISED_PROTOCOL")
                    {
                        log.error(window.keefox_org.locale.$STR("KeeFox-conn-unknown-protocol") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra));
                        window.keefox_org.latestConnectionError = "UNRECOGNISED_PROTOCOL";
                    } else if (data.error.code == "INVALID_MESSAGE")
                    {
                        log.error(window.keefox_org.locale.$STR("KeeFox-conn-invalid-message") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra));
                        window.keefox_org.latestConnectionError = "INVALID_MESSAGE";
                    } else if (data.error.code == "AUTH_RESTART")
                    {
                        log.error(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart") + " "
                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra));
                        window.keefox_org.latestConnectionError = "AUTH_RESTART";
                        this.removeStoredKey(this.getUsername(this.getSecurityLevel()));
                        window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart") 
                            + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
                    } else
                    {
                        log.error(window.keefox_org.locale.$STR("KeeFox-conn-unknown-error") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra));
                        window.keefox_org.latestConnectionError = "UNKNOWN_JSONRPC";
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
            window.keefox_org.latestConnectionError = "ALREADY_AUTHENTICATED";
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
                                        window.keefox_org.latestConnectionError = "AUTH_CLIENT_SECURITY_LEVEL_TOO_LOW";
                                        window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STRF("KeeFox-conn-setup-client-sl-low", extra));
                                        break;
                case "AUTH_FAILED": log.warn(window.keefox_org.locale.$STR("KeeFox-conn-setup-failed") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra));
                                        window.keefox_org.latestConnectionError = "AUTH_FAILED";
                                        window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-failed") 
                                            + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
                                        // There may be a stored key that has become corrupt through a change of security level, etc.
                                        this.removeStoredKey(this.getUsername(this.getSecurityLevel()));
                                        break;
                case "AUTH_RESTART": log.warn(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra));
                                        window.keefox_org.latestConnectionError = "AUTH_RESTART";
                                        this.removeStoredKey(this.getUsername(this.getSecurityLevel()));
                                        window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart") 
                                            + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
                                        break;
                case "AUTH_EXPIRED": log.warn(window.keefox_org.locale.$STRF("KeeFox-conn-setup-expired", extra));
                                        window.keefox_org.latestConnectionError = "AUTH_EXPIRED";
                                        this.removeStoredKey(this.getUsername(this.getSecurityLevel()));
                                        window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-expired") 
                                            + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
                                        break;
                case "AUTH_INVALID_PARAM": log.error(window.keefox_org.locale.$STRF("KeeFox-conn-setup-invalid-param", extra));
                                        window.keefox_org.latestConnectionError = "AUTH_INVALID_PARAM";
                                        break;
                case "AUTH_MISSING_PARAM": log.error(window.keefox_org.locale.$STRF("KeeFox-conn-setup-missing-param", extra));
                                        window.keefox_org.latestConnectionError = "AUTH_MISSING_PARAM";
                                        break;
                default: log.error(window.keefox_org.locale.$STR("KeeFox-conn-unknown-error") + " "
                                            + window.keefox_org.locale.$STRF("KeeFox-further-info-may-follow", extra));
                            window.keefox_org.latestConnectionError = "UNKNOWN_SETUP";
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
                window.keefox_org.latestConnectionError = "AUTH_SERVER_SECURITY_LEVEL_TOO_LOW";
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
                window.keefox_org.latestConnectionError = "AUTH_SERVER_SECURITY_LEVEL_TOO_LOW";
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
            window.keefox_org.latestConnectionError = "CHALLENGE_RESPONSE_MISMATCH";
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

            // 0.025 second delay before we try to do the KeeFox connection startup stuff
            setTimeout(this.onConnectStartup, 50, "CR", this.onConnectStartup);
        }
  	};
  	
  	this.identifyToClient = function(data) {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                    .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("common-dialog") ||
                        wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");

        // get the user to type in the one-time password
        let prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
        let input = {value: null};
        this.authPromptAborted = false;
        let result = prompts.prompt(null, 
            window.keefox_org.locale.$STR("KeeFox-conn-setup-enter-password-title"), 
            window.keefox_org.locale.$STR("KeeFox-conn-setup-enter-password"), input, null, {});
        let password = input.value;
        if (!result)
        {
            let minutesToDelay = 2;

            // if any errors were shown, they are now superseeded by this new one
            window.keefox_win.UI.removeConnectionMessage();
            
            window.keefox_org.latestConnectionError = "USER_ABORTED";
            window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STRF("KeeFox-conn-setup-aborted",[minutesToDelay]));
            // Make sure that the regular reconnection timer and any other
            // connection attempts are blocked until minutesToDelay has passed
            this.connectionProhibitedUntil = new Date();
            this.connectionProhibitedUntil.setTime(
                    this.connectionProhibitedUntil.getTime() + 60000 * minutesToDelay);
            // Cancel the current connection (unless it has already be cancelled,
            // in which case, the observer within the prompt has already been unregistered)
            if (!this.authPromptAborted)
                this.resetConnection();
            return;
        }
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

        //TODO:1.6: DRY - getMostRecentWindow into KFUtils
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                    .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("common-dialog") ||
                        wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");

  		if (!this.srpClientInternals.authenticated)
        {
  		    log.warn(window.keefox_org.locale.$STR("KeeFox-conn-setup-failed"));
  		    window.keefox_org.latestConnectionError = "SRP_AUTH_FAILURE";
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

  		    // 0.025 second delay before we try to do the KeeFox connection startup stuff
            setTimeout(this.onConnectStartup, 50, "SRP", this.onConnectStartup);
        } 
        
  	};

  	this.onConnectStartup = function (type, thisFunction, timeout) {
  	    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                            .getService(Components.interfaces.nsIWindowMediator);
  	    var window = wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");

  	    // I think that sometimes the main application interface has not been loaded by
  	    // this point so we check and then try again later if not ready
  	    if (window == undefined || window == null
        || window.keefox_org == undefined || window.keefox_org == null
            || window.keefox_win == undefined || window.keefox_win == null) {
  	        let newTimeout = timeout * 1.2;
  	        log.warn("Could not find initialised window. Will try again in " + newTimeout + "ms");
  	        setTimeout(thisFunction, newTimeout, type, thisFunction, newTimeout);
  	        return;
  	    }

  	    // if any errors were shown, they are now resolved
  	    window.keefox_win.UI.removeConnectionMessage();
  	    window.keefox_org.latestConnectionError = "";

  	    window.keefox_org._keeFoxStorage.set("KeePassRPCActive", true);
  	    window.keefox_org._keeFoxVariableInit();
  	    if (window.keefox_org._keeFoxExtension.prefs.has("currentLocation")) //TODO:2: set up preference change listener for ease of location based changes in future
  	    {
  	        var currentLocation = window.keefox_org._keeFoxExtension.prefs.getValue("currentLocation", "");
  	        window.keefox_win.Logger.info("Setting KeePassRPC location to " + currentLocation + ".");
  	        window.keefox_org.changeLocation(currentLocation);
  	    }
  	    window.keefox_org._keeFoxExtension.prefs.setValue("lastConnectedToKeePass", ISO8601DateUtils.create(new Date()));
  	    window.keefox_org.metricsManager.pushEvent("KeePass", "connected", { "type": type });
  	    window.keefox_org._refreshKPDB();
  	    window.keefox_org.getApplicationMetadata();
  	};

    // No need to return anything from this function so sync or async implementation is fine
  	this.receiveJSONRPC = function (data) {
  	    // async webcrypto:
  	    if (typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined') {
  	        this.decrypt(data.jsonrpc, this.receiveJSONRPCDecrypted);
  	        return;
  	    }

  	    // legacy Javascript approach
  	    let fullData = this.decrypt_JS(data.jsonrpc);
  	    return this.receiveJSONRPCDecrypted(fullData);
  	};

  	this.receiveJSONRPCDecrypted = function(data) {
        
  	    if (data === null)
  	        return; // decryption failed; connection has been reset and user will re-enter password for fresh authentication credentials

  	    let obj = JSON.parse(data);

  	    // if we failed to parse an object from the JSON    
  	    if (!obj)
  	        return;

  	    this.processJSONRPCresponse(obj);
  	};

    this.processJSONRPCresponse = function(obj) {
                    
        if ("result" in obj && obj.result !== false)
        {
            // quick hack test
            if (obj.result == null)
                return;

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
  		// Sometimes things go wrong (e.g. user cancels master password
        // dialog box; maybe startup windows disappear)
        try
        {
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
    	} catch (ex)
        {
            // Need to make sure that the underlying web socket connection has been
            // closed so we are able to retry the connection a bit later but we'll
            // enforce a little delay just in case the reason for the problem is 
            // that the application startup is progressing very slowly for some other reason
            log.warn("An attempt to setup the KPRPC secure channel has failed. It will not be retried for at least 10 seconds. If you see this message regularly and are not sure why, please ask on the help forum. Technical detail about the problem follows: " + ex);
            this.connectionProhibitedUntil = new Date();
            this.connectionProhibitedUntil.setTime(
                    this.connectionProhibitedUntil.getTime() + 10000);
            this.resetConnection();
            log.debug("Connection state reset ready for next attempt in at least 10 seconds");
        }
    	
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
            username = window.keefox_org.utils.newGUID();
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
    

    // Encrypt plaintext using web crypto api
    this.encrypt = function (plaintext, callback) {

        log.debug("starting webcrypto encryption");

        let KPRPC = this;
        let wc = crypto.subtle;
        let iv = crypto.getRandomValues(new Uint8Array(16));
        let secretKey = this.secretKey;
        let messageAB = utils.stringToByteArray(plaintext);

        // get our secret key
        let secretKeyAB = utils.hexStringToByteArray(secretKey);

        wc.importKey(
            "raw",                            // Exported key format
            secretKeyAB,                      // The exported key
            { name: "AES-CBC", length: 256 }, // Algorithm the key will be used with
            true,                             // Can extract key value to binary string
            ["encrypt", "decrypt"]            // Use for these operations
        )
        .then(function (pwKey) {
            let alg = { name: "AES-CBC", iv: iv };
            return wc.encrypt(alg, pwKey, messageAB);
        })
        .then(function (encrypted) {
            
            wc.digest({ name: "SHA-1" }, secretKeyAB).then(function (secretkeyHash) {

                let hmacData = new Uint8Array(20 + encrypted.byteLength + 16);
                let len = hmacData.byteLength;

                // fill the hmacData bytearray with the data
                hmacData.set(new Uint8Array(secretkeyHash));
                hmacData.set(new Uint8Array(encrypted), 20);
                hmacData.set(iv, encrypted.byteLength + 20);

                // We could get a promise from crypto.subtle.digest({name: "SHA-1"}, hmacData)
                // but that takes quite a lot longer than our existing hash utility
                // presumably because the base64 implementation within the Firefox
                // XPCOM hash component is native rather than running in Javascript
                // when the promise completes
                let ourHMAC = utils.hash(hmacData, "base64", "SHA1");

                let ivAB = hmacData.subarray(len - 16);
                let encryptedMessage = {
                    message: utils.byteArrayToBase64(encrypted),
                    iv: utils.byteArrayToBase64(ivAB),
                    hmac: ourHMAC
                }

                let callbackTarget = function (func, data) {
                    func(data);
                };

                // Do the callback async because we don't want exceptions in
                // JSONRPC handling being treated as encryption errors
                setTimeout(callbackTarget, 1, callback.bind(KPRPC), encryptedMessage);
            })
            .catch(function (e) {
                log.error("Failed to calculate HMAC. Exception: " + e);
                callback(null);
            });

        })
        .catch(function (e) {
            log.error("Failed to encrypt. Exception: " + e);
            callback(null);
        });
    };

    // Encrypt plaintext using sjcl.
    this.encrypt_JS = function(plaintext)
    {
        let secKeyArray = sjcl.codec.hex.toBits(this.secretKey);
        let aes = new sjcl.cipher.aes(secKeyArray);
        let ivHexRaw = utils.BigIntFromRandom(16).toString(16);

        // Something isn't quite right with SJCL (possibly bug or docs fail
        // relating to use of bitArray.clamp within hex code toBits(str)).

        // Whatever the cause, the effect is that we must supply a hex string
        // with length divisble by 8 in order to ensure the ivArray contains
        // only 32bit ints.

        // Since the ivHexRaw could be a string with
        // length anywhere from 1 to 32 characters, we need to zero-pad
        // before passing the string to the SJCL codec
        let ivHex = ivHexRaw;
        for (var i=ivHexRaw.length; i < 32; i++)
            ivHex = "0" + ivHex;

        let ivArray = sjcl.codec.hex.toBits(ivHex);

        let encryptedPayload = sjcl.mode.cbc.encrypt(aes, sjcl.codec.utf8String.toBits(plaintext), ivArray);
        
        // need to convert all out int arrays (confusingly called bitarrays in sjcl) into byte arrays so we can pass
        // it to our main hash function rather than use sjcl's (should be faster overall and possibly more secure)
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

    // Decrypt incoming data from KeePassRPC using AES-CBC and a separate HMAC
    this.decrypt = function(encryptedContainer, callback)
{
        log.debug("starting webcrypto decryption");
        
        var KPRPC = this;
        var t = (new Date()).getTime();
        let wc = crypto.subtle;
            
        let message = encryptedContainer.message;        
        let iv = encryptedContainer.iv;       
        let hmac = encryptedContainer.hmac;        
        let secretKey = this.secretKey;
            
        // get our secret key
        var secretKeyAB = utils.hexStringToByteArray(secretKey);

        // Put our encrypted message into an array that includes space at the start
        // for holding the other data we'll want to run our HMAC hash over (this
        // means we can store the message just once in memory - probably won't
        // make a difference for small messages but when the entire KeePass
        // database contents is being shifted around we should save a fair few ms)
        var hmacData = utils.base64toByteArrayForHMAC(message, 36);
        var len = hmacData.length;

        // create views for use in the decryption routines
        var secretkeyHashAB = hmacData.subarray(0, 20);
        var messageAB = hmacData.subarray(20, len - 16);
        var ivAB = hmacData.subarray(len - 16);

        var tn = (new Date()).getTime();
        log.debug("decryption stage 'data prep 1' took: " + (tn-t));
        t = tn;

        wc.digest({ name: "SHA-1" }, secretKeyAB).then(function (secretkeyHash) {
            tn = (new Date()).getTime();
            log.debug("decryption stage 'key hash' took: " + (tn-t));
            t = tn;

            // fill the hmacData bytearray with the rest of the data
            secretkeyHashAB.set(new Uint8Array(secretkeyHash));
            utils.base64toByteArrayForHMAC(iv, 0, ivAB);

            tn = (new Date()).getTime();
            log.debug("decryption stage 'data prep 2' took: " + (tn-t));
            t = tn;

            // We could get a promise from crypto.subtle.digest({name: "SHA-1"}, hmacData)
            // but that takes quite a lot longer than our existing hash utility
            // presumably because the base64 implementation within the Firefox
            // XPCOM hash component is native rather than running in Javascript
            // when the promise completes
            let ourHMAC = utils.hash(hmacData, "base64", "SHA1");

            tn = (new Date()).getTime();
            log.debug("decryption stage 'generate HMAC' took: " + (tn-t));
            t = tn;

            if (ourHMAC == hmac)
            {
                wc.importKey(
                "raw",                            // Exported key format
                secretKeyAB,                      // The exported key
                { name: "AES-CBC", length: 256 }, // Algorithm the key will be used with
                true,                             // Can extract key value to binary string
                ["encrypt", "decrypt"]            // Use for these operations
                )
                .then(function (pwKey) {
                    tn = (new Date()).getTime();
                    log.debug("decryption stage 'import key' took: " + (tn-t));
                    t = tn;
                    let alg = { name: "AES-CBC", iv: ivAB };
                    return wc.decrypt(alg, pwKey, messageAB);
                })
                .then(function (decrypted) {
                    tn = (new Date()).getTime();
                    log.debug("decryption stage 'aes-cbc' took: " + (tn - t));
                    t = tn;
                    let plainText = new TextDecoder("utf-8").decode(decrypted);
                    tn = (new Date()).getTime();
                    log.debug("decryption stage 'utf-8 conversion' took: " + (tn - t));
                    t = tn;

                    var callbackTarget = function (func, data) {
                        func(data);
                    };

                    // Do the callback async because we don't want exceptions in
                    // JSONRPC handling being treated as connection errors
                    setTimeout(callbackTarget, 1, callback.bind(KPRPC), plainText);
                })
                .catch(function (e) {
                    log.error("Failed to decrypt. Exception: " + e);

                    let wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                                    .getService(Components.interfaces.nsIWindowMediator);
                    let window = wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");
                    log.warn(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart"));
                    window.keefox_org.latestConnectionError = "DECRYPTION_FAILED";
                    window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart")
                        + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
                    KPRPC.removeStoredKey(KPRPC.getUsername(KPRPC.getSecurityLevel()));
                    KPRPC.resetConnection();
                    callback(null);
                });
            }
        })
        .catch(function (e) {
            log.error("Failed to hash secret key. Exception: " + e);

            let wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                         .getService(Components.interfaces.nsIWindowMediator);
            let window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            log.warn(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart"));
            window.keefox_org.latestConnectionError = "SECRET_KEY_HASH_FAILED";
            window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart")
                + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
            KPRPC.removeStoredKey(KPRPC.getUsername(KPRPC.getSecurityLevel()));
            KPRPC.resetConnection();
            callback(null);
        });
    };

    // A legacy decryption routine that uses sjcl to do the AES decryption.
    // Typically 5x slower than the current WebCrypto based implementation but we
    // can't do WebCrypto on versions earlier than FF37
    // (https://bugzilla.mozilla.org/show_bug.cgi?id=1116269)
    this.decrypt_JS = function(encryptedContainer)
    {
        log.debug("starting decryption using JS");
        var t = (new Date()).getTime();
        
        let wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                     .getService(Components.interfaces.nsIWindowMediator);
        let window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
            
        let binary = window.atob(encryptedContainer.message);
        let len = binary.length;
        log.debug("decryption data length: " + len);
        let buffer = new ArrayBuffer(len);
        let messageArray = new Uint8Array(buffer);
        for (let i=0; i < len; i++) {
            messageArray[i] = binary.charCodeAt(i);
        }
        var tn = (new Date()).getTime();
        log.debug("decryption stage 1a took: " + (tn-t));
        t = tn;
        let arrayBuffer = messageArray.buffer;

        var tn = (new Date()).getTime();
        log.debug("decryption stage 1b took: " + (tn-t));
        t = tn;
        let encryptedPayload = sjcl.codec.bytes.toBits(messageArray);
        
        var tn = (new Date()).getTime();
        log.debug("decryption stage 1c took: " + (tn-t));
        t = tn;
        let ivArray = sjcl.codec.base64.toBits(encryptedContainer.iv);
        var tn = (new Date()).getTime();
        log.debug("decryption stage 2 took: " + (tn-t));
        t = tn;
        let hmac = encryptedContainer.hmac;
        
        var tn = (new Date()).getTime();
        log.debug("decryption stage 3 took: " + (tn-t));
        t = tn;
        let secKeyArray = sjcl.codec.hex.toBits(this.secretKey);
        var tn = (new Date()).getTime();
        log.debug("decryption stage 4 took: " + (tn-t));
        t = tn;
        let a1 = utils.intArrayToByteArray(sjcl.codec.base64.toBits(
                    utils.hash(utils.intArrayToByteArray(secKeyArray),"base64","SHA1")));
        var tn = (new Date()).getTime();
        log.debug("decryption stage 5 took: " + (tn-t));
        t = tn;

        let a2 = messageArray;
        var tn = (new Date()).getTime();
        log.debug("decryption stage 6 took: " + (tn-t));
        t = tn;
        let a3 = utils.intArrayToByteArray(ivArray);
        var tn = (new Date()).getTime();
        log.debug("decryption stage 7 took: " + (tn-t));
        t = tn;
        let tmp = new Uint8Array(a1.length + a2.byteLength + a3.length);
        tmp.set(a1, 0);
        tmp.set(a2, a1.length);
        tmp.set(a3, a1.length + a2.byteLength);
        let ourHmac = utils.hash(tmp,"base64","SHA1");

        var tn = (new Date()).getTime();
        log.debug("decryption stage 8 took: " + (tn-t));
        t = tn;
        if (ourHmac !== hmac)
        {
            log.warn(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart"));
            window.keefox_org.latestConnectionError = "HMAC_MISMATCH";
            window.keefox_win.UI.showConnectionMessage(window.keefox_org.locale.$STR("KeeFox-conn-setup-restart") 
                + " " + window.keefox_org.locale.$STR("KeeFox-conn-setup-retype-password"));
            this.removeStoredKey(this.getUsername(this.getSecurityLevel()));
            this.resetConnection();
            return null;
        }

        var tn = (new Date()).getTime();
        log.debug("decryption stage 9 took: " + (tn-t));
        t = tn;
        let aes = new sjcl.cipher.aes(secKeyArray);
        var tn = (new Date()).getTime();
        log.debug("decryption stage 10 took: " + (tn-t));
        t = tn;
        let decryptedPayload = sjcl.mode.cbc.decrypt(aes, encryptedPayload, ivArray);
        var tn = (new Date()).getTime();
        log.debug("decryption stage 11 took: " + (tn-t));
        t = tn;
        let plainText = sjcl.codec.utf8String.fromBits(decryptedPayload);
        var tn = (new Date()).getTime();
        log.debug("decryption stage 12 took: " + (tn-t));
        t = tn;
        log.debug("decryption finished");
        return plainText;
    };
}).apply(kprpcClient.prototype);

