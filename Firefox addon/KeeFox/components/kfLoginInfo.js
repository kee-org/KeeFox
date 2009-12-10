/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
  This is based on the LoginInfo object that Mozilla provide
  but it has been heavily modified to support some of the extra features
  that KeeFox can support above the built-in Firefox login manager.
  
  Defined in the KeeFox project / comp.idl
  
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
    
    
    // nsIMutableArray of kfURL objects (normally just one is needed
    // but a given login can be associated with more than one site
    // or with multiple pages on that site)
    URLs      : null,
    
    // The "action" parameter of the form (for multi-page
    // logins, this is always the first page)
    formActionURL : null,
    
    // The realm of a HTTP athentication request
    httpRealm     : null,
    
    // The index of the otherField which we will treat as the username in KeePass
    usernameIndex      : null,
    
    // nsIMutableArray of kfLoginField objects representing all passwords
    // on this (potentially multi-page) form
    passwords      : null,
    
    // The KeePass entry's uniqueID (if known)
    uniqueID : null,
    
    // The title of the KeePass entry (auto-generated from the page title by default)
    title : null,
    
    // nsIMutableArray of kfLoginField objects representing all non-passwords
    // on this (potentially multi-page) form
    otherFields : null,
    
    // How relevant this login entry is to the current form in
    // the browser - transient (not stored in KeePass)
    relevanceScore : null,
    
    // The total number of pages the login entry will fill (usually 1; transient)
    maximumPage : null,
    
    // A base64 encoding of the icon for this entry. It will always be a 
    // PNG when populated from eePass but could be other formats when first 
    // loading a favicon from a website. (Hopefully this will be an easy exception 
    // to deal with but if not we can add a mime type field to this object too)
    iconImageData : null,
    
    // these fields record information about the parent group of this entry.
    // It would be nicer to link to an object representing the group itself
    // but I can't get that to work reliably across .NET, ICE, XPCOM and javascript boundaries
    parentGroupName : null,
    parentGroupUUID : null,
    parentGroupPath : null,
    
    // assists with serialisation of this object to a string
    // (for attachment to the current tab session)
    toSource : function ()
    {
        var formActionURLParam = (this.formActionURL == null) ? "null" : ("'"+this.formActionURL+"'");
        var httpRealmParam = (this.httpRealm == null) ? "null" : ("'"+this.httpRealm+"'");
        var uniqueIDParam = (this.uniqueID == null) ? "null" : ("'"+this.uniqueID+"'");
        var titleParam = (this.title == null) ? "null" : ("'"+this.title+"'");
    
        return "( deserialisedOutputURLs , "+ formActionURLParam +", "+httpRealmParam+" , "+this.usernameIndex
            +" , deserialisedOutputPasswords , "+uniqueIDParam+" , "+titleParam+" , deserialisedOutputOtherFields , "+this.maximumPage+" )";
    },

    init : function (aURLs, aFormActionURL, aHttpRealm,
                     aUsernameIndex,      aPasswords,
                     aUniqueID, aTitle, otherFieldsArray, aMaximumPage) {

        this.otherFields = otherFieldsArray;   
        this.URLs      = aURLs;
        this.formActionURL = aFormActionURL;
        this.httpRealm     = aHttpRealm;
        this.usernameIndex      = aUsernameIndex;
        this.passwords      = aPasswords;
        this.uniqueID = aUniqueID;
        this.title = aTitle;
        this.maximumPage = aMaximumPage;
        this.iconImageData = "";
        this.parentGroupName = "";
        this.parentGroupUUID = "";
        this.parentGroupPath = "";
    },
        
    // the order of URLs must also match
    // TODO: do we need to relax this test so order is irrelevant?
    _allURLsMatch : function (URLs, ignoreURIPathsAndSchemes, ignoreURIPaths, keeFoxILM)
    {
        if (this.URLs.length != URLs.length)
            return false;
            
        for (i = 0; i < this.URLs.length; i++)
        {
            var url1 = URLs.queryElementAt(i,Components.interfaces.kfIURL).URL;
            var url2 = this.URLs.queryElementAt(i,Components.interfaces.kfIURL).URL;
        
            if (ignoreURIPathsAndSchemes && keeFoxILM._getURISchemeHostAndPort(url1) != keeFoxILM._getURISchemeHostAndPort(url2))
                return false;
            else if (!ignoreURIPathsAndSchemes && ignoreURIPaths && keeFoxILM._getURIHostAndPort(url1) != keeFoxILM._getURIHostAndPort(url2))
                return false;
            else if (!ignoreURIPathsAndSchemes && !ignoreURIPaths && url1 != url2)
                return false;
        }
        return true;
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
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");
        
        if (this.otherFields.length != login.otherFields.length)
            return false;
         
        var loginUsername = null;
        if (login.usernameIndex >= 0 && login.otherFields != null && login.otherFields.length > login.usernameIndex)
        {
            var temp = login.otherFields.queryElementAt(login.usernameIndex,Components.interfaces.kfILoginField);
            loginUsername = temp.value;
        }
        
        var thisUsername = null;
        if (this.usernameIndex >= 0 && this.otherFields != null && this.otherFields.length > this.usernameIndex)
        {
            var temp = this.otherFields.queryElementAt(this.usernameIndex,Components.interfaces.kfILoginField);
            thisUsername = temp.value;
        }
        
        if (thisUsername != loginUsername)
            return false;
        
        return true;
    },
    
    
//CPT: had to hack this a bit. might come back to bite later. now if either
// httprealm is empty string we will not test for equality.
// It's all becuase ICE can't distinguish between null and empty string but
// there may be nicer ways to workaround...
// do we care if fields are moved around onto different pages?
// should we match then or not?...
    // determines if this matches another supplied login object, with a number
    // of controllable definitions of "match" to support various use cases
    matches : function (aLogin, ignorePasswords, ignoreURIPaths, ignoreURIPathsAndSchemes, ignoreUsernames) {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");
        
        if (!this._allURLsMatch(aLogin.URLs, ignoreURIPathsAndSchemes, ignoreURIPaths, window.keeFoxILM))
            return false;

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

        return true;
    },

    // merge another login into this one. Only certain fields are merged
    // - URLs, passwords and usernames
    mergeWith : function (previousStageLogin) {
 
        if (previousStageLogin.URLs != undefined && previousStageLogin.URLs != null 
            && previousStageLogin.URLs.length > 0)
        {
            if (this.URLs == undefined || this.URLs == null)
                this.URLs = Components.classes["@mozilla.org/array;1"]
                        .createInstance(Components.interfaces.nsIMutableArray);
                        
            for (i = 0; i < previousStageLogin.URLs.length; i++)
            {
                var URL = 
                    previousStageLogin.URLs.queryElementAt(i,Components.interfaces.kfIURL);
                this.URLs.appendElement(URL,false);
            }
        }

        if (previousStageLogin.passwords != undefined && previousStageLogin.passwords != null 
            && previousStageLogin.passwords.length > 0)
        {
            if (this.passwords == undefined || this.passwords == null)
                this.passwords = Components.classes["@mozilla.org/array;1"]
                        .createInstance(Components.interfaces.nsIMutableArray);
                        
            for (i = 0; i < previousStageLogin.passwords.length; i++)
            {
                var passField = 
                    previousStageLogin.passwords.queryElementAt(i,Components.interfaces.kfILoginField);
                this.passwords.appendElement(passField,false);
            }
        }
        
        if (previousStageLogin.otherFields != undefined && previousStageLogin.otherFields != null
            && previousStageLogin.otherFields.length > 0)
        {
            if (this.otherFields == undefined || this.otherFields == null)
                this.otherFields = Components.classes["@mozilla.org/array;1"]
                        .createInstance(Components.interfaces.nsIMutableArray);
                        
            for (i = 0; i < previousStageLogin.otherFields.length; i++)
            {
                var otherField = 
                    previousStageLogin.otherFields.queryElementAt(i,Components.interfaces.kfILoginField);
                this.otherFields.appendElement(otherField,false);
            }
        }
        
        this.maximumPage = Math.max(this.maximumPage, previousStageLogin.maximumPage);
    }
  
};

var component = [kfLoginInfo];
function NSGetModule(compMgr, fileSpec) {
    return XPCOMUtils.generateModule(component);
}
