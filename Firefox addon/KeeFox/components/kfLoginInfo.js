/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008 Chris Tomlinson <keefox@christomlinson.name>
  
  This is pretty much just a copy of the LoginInfo object that Mozilla provide
  but it will end up being modified to the support some of the extra features
  that KeeFox will support above the built-in login manager.
  
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

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function kfLoginInfo() {}

kfLoginInfo.prototype = {

    classDescription  : "KFLoginInfo",
    contractID : "@christomlinson.name/kfLoginInfo;1",
    classID : Components.ID("{7ed5ba34-1375-4887-86fd-0682ddfaa870}"),
    QueryInterface: XPCOMUtils.generateQI([Ci.kfILoginInfo]), 
    
    
    hostname      : null,
    formSubmitURL : null,
    httpRealm     : null,
    username      : null,
    password      : null,
    usernameField : null,
    passwordField : null,
    uniqueID : null,
    customFields : null,
    
    _alert : function (msg) {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");

        // get a reference to the prompt service component.
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                            .getService(Components.interfaces.nsIPromptService);

        // show an alert. For the first argument, supply the parent window. The second
        // argument is the dialog title and the third argument is the message
        // to display.
        promptService.alert(window,"Alert",msg);
    },

    init : function (aHostname, aFormSubmitURL, aHttpRealm,
                     aUsername,      aPassword,
                     aUsernameField, aPasswordField,
                     aUniqueID) {
                     //this._alert(arguments.length);
        this.hostname      = aHostname;
        this.formSubmitURL = aFormSubmitURL;
        this.httpRealm     = aHttpRealm;
        this.username      = aUsername;
        this.password      = aPassword;
        this.usernameField = aUsernameField;
        this.passwordField = aPasswordField;
        this.uniqueID = aUniqueID;
        
    },
    
    initCustom : function (aHostname, aFormSubmitURL, aHttpRealm,
                     aUsername,      aPassword,
                     aUsernameField, aPasswordField,
                     aUniqueID, customFieldsArray) {
                     
        this.init(aHostname, aFormSubmitURL, aHttpRealm,
                     aUsername,      aPassword,
                     aUsernameField, aPasswordField,
                     aUniqueID);
        
        this.customFields = customFieldsArray;   
       
    },

//CPT: had to hack this a bit. might come back to bite later. now if either httprealm is empty string we will not test for equality.
// maybe want to do the same for hostname, or maybe it'll cause probs down the line. it's all becuase ICE can't distinguish
// between null and empty string but there may be nicer ways to workaround...
    matches : function (aLogin, ignorePassword) {
        if (this.hostname      != aLogin.hostname      ||
            (this.httpRealm     != aLogin.httpRealm && !(this.httpRealm == "" || aLogin.httpRealm == "")   ) ||
            this.username      != aLogin.username)
            return false;

        if (!ignorePassword && this.password != aLogin.password)
            return false;

        // If either formSubmitURL is blank (but not null), then match.
        if (this.formSubmitURL != "" && aLogin.formSubmitURL != "" &&
            this.formSubmitURL != aLogin.formSubmitURL)
            return false;

        // The .usernameField and .passwordField values are ignored.

        return true;
    },

//TODO: compare all custom fields for equality 
//(though maybe matching on just the uniqueID is a better way to move towards?)
    equals : function (aLogin) {
        if (this.hostname      != aLogin.hostname      ||
            this.formSubmitURL != aLogin.formSubmitURL ||
            this.httpRealm     != aLogin.httpRealm     ||
            this.username      != aLogin.username      ||
            this.password      != aLogin.password      ||
            this.usernameField != aLogin.usernameField ||
            this.passwordField != aLogin.passwordField ||
            this.uniqueID != aLogin.uniqueID)
            return false;

        return true;
    }
  
};

var component = [kfLoginInfo];
function NSGetModule(compMgr, fileSpec) {
    return XPCOMUtils.generateModule(component);
}
