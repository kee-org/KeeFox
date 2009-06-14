/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
  This is pretty much just a copy of the LoginInfo object that Mozilla provide
  but it has been modified to  support some of the extra features
  that KeeFox can support above the built-in login manager.
  
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
    
    
    URL      : null,
    formActionURL : null,
    httpRealm     : null,
    usernameIndex      : null,
    passwords      : null,
    uniqueID : null,
    title : null,
    otherFields : null,
    relevanceScore : null,
    
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

    init : function (aURL, aFormActionURL, aHttpRealm,
                     aUsernameIndex,      aPasswords,
                     aUniqueID, aTitle, otherFieldsArray) {

        this.otherFields = otherFieldsArray;   
        this.URL      = aURL;
        this.formActionURL = aFormActionURL;
        this.httpRealm     = aHttpRealm;
        this.usernameIndex      = aUsernameIndex;
        this.passwords      = aPasswords;
        this.uniqueID = aUniqueID;
        this.title = aTitle;
    },
        
    // the order of password fields must also match
    // TODO: do we need to relax this test so order is irrelevant?
    _allPasswordsMatch : function (passwords)
    {
        if (this.passwords.length != passwords.length)
            return false;
            
        for (i = 0; i < this.passwords.length; i++)
        {
            if (passwords.queryElementAt(i,Components.interfaces.kfILoginField).value !=
                this.passwords.queryElementAt(i,Components.interfaces.kfILoginField).value)
                return false;
        }
        return true;
    },

    _usernamesMatch : function (login)
    {
        if (this.otherFields.length != login.otherFields.length)
            return false;
            
        var loginUsername = null;
        if (login.usernameIndex >= 0 && login.otherFields != null && login.otherFields.length > login.usernameIndex && login.otherFields[login.usernameIndex] != undefined)
        {
            var temp = login.otherFields.queryElementAt(login.usernameIndex,Components.interfaces.kfILoginField);
            loginUsername = temp.value;
        }
        
        var thisUsername = null;
        if (this.usernameIndex >= 0 && this.otherFields != null && this.otherFields.length > this.usernameIndex && this.otherFields[this.usernameIndex] != undefined)
        {
            var temp = this.otherFields.queryElementAt(this.usernameIndex,Components.interfaces.kfILoginField);
            thisUsername = temp.value;
        }
        
        if (thisUsername != loginUsername)
            return false;
        
        return true;
    },
    
    

//CPT: had to hack this a bit. might come back to bite later. now if either httprealm is empty string we will not test for equality.
// maybe want to do the same for URL, or maybe it'll cause probs down the line. it's all becuase ICE can't distinguish
// between null and empty string but there may be nicer ways to workaround...
    matches : function (aLogin, ignorePasswords, ignoreURIPaths, ignoreURIPathsAndSchemes, ignoreUsernames) {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");
        
        window.keeFoxILM.log("match1:"+ignoreURIPaths+":"+ignoreURIPathsAndSchemes);
        if (ignoreURIPathsAndSchemes && window.keeFoxILM._getURISchemeHostAndPort(aLogin.URL) != window.keeFoxILM._getURISchemeHostAndPort(this.URL))
            return false;
        else if (!ignoreURIPathsAndSchemes && ignoreURIPaths && window.keeFoxILM._getURIHostAndPort(aLogin.URL) != window.keeFoxILM._getURIHostAndPort(this.URL))
            return false;
        else if (!ignoreURIPathsAndSchemes && !ignoreURIPaths && this.URL != aLogin.URL)
            return false;
        window.keeFoxILM.log("match2");
        if ((this.httpRealm     != aLogin.httpRealm && !(this.httpRealm == "" || aLogin.httpRealm == "")   ))
            return false;
            
        if (!ignoreUsernames && !this._usernamesMatch(aLogin))
            return false;

        if (!ignorePasswords && !this._allPasswordsMatch(aLogin.passwords))
            return false;

        // If either formActionURL is blank (but not null), then match.
        if (this.formActionURL != "" && aLogin.formActionURL != "")
        {
            if (ignoreURIPathsAndSchemes && window.keeFoxILM._getURISchemeHostAndPort(aLogin.formActionURL) != window.keeFoxILM._getURISchemeHostAndPort(this.formActionURL))
            return false;
        else if (!ignoreURIPathsAndSchemes && ignoreURIPaths && window.keeFoxILM._getURIHostAndPort(aLogin.formActionURL) != window.keeFoxILM._getURIHostAndPort(this.formActionURL))
            return false;
        else if (!ignoreURIPathsAndSchemes && !ignoreURIPaths && this.formActionURL != aLogin.formActionURL)
            return false;
        }

        // The .usernameField and .passwordField values are ignored.

        return true;
    },

//TODO: compare all other fields for equality 
//(though maybe matching on just the uniqueID is a better way to move towards?)
//TODO: I don't think this is used but if it is we need to add ability to compare all passwords and custom fields
    equals : function (aLogin) {
        if (this.URL      != aLogin.URL      ||
            this.formActionURL != aLogin.formActionURL ||
            this.httpRealm     != aLogin.httpRealm     ||
            this.usernameIndex      != aLogin.usernameIndex      ||
            //this.password.value      != aLogin.password.value      ||
            this.uniqueID != aLogin.uniqueID ||
            this.title != aLogin.title)
            return false;

        return true;
    }
  
};

var component = [kfLoginInfo];
function NSGetModule(compMgr, fileSpec) {
    return XPCOMUtils.generateModule(component);
}
