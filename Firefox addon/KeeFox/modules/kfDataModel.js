/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2010 Chris Tomlinson <keefox@christomlinson.name>
  
  keeFoxLoginInfo:
  This was loosly based on the LoginInfo object that Mozilla provided with Firefox 3.0
  but it has been heavily modified to support some of the extra features
  that KeeFox can support compared to the built-in Firefox login manager.
  
  keeFoxLoginField:
  Represents an individual form field
  
  keeFoxFormFieldType:
  enumeration of form field type (e.g. text, checkbox, password, etc.)
  
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
const Cr = Components.results;

var EXPORTED_SYMBOLS = ["keeFoxLoginInfo","keeFoxLoginField","keeFoxFormFieldType"];
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://kfmod/KFLogger.js");

var log = KFLog;



keeFoxFormFieldType =
{
    radio   : "FFTradio",
    username: "FFTusername",
    text    : "FFTtext",
    password: "FFTpassword",
    select  : "FFTselect",
    checkbox: "FFTcheckbox"
}	

// this feels a bit odd but I can't seem to export class
// constructors any other way and it seems to work...
function keeFoxLoginInfo() { return new kfLoginInfo();}
function keeFoxLoginField() { return new kfLoginField();}

function kfLoginInfo() {}

kfLoginInfo.prototype =
{    
    // array of URL strings (normally just one is needed
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
    
    // array of kfLoginField objects representing all passwords
    // on this (potentially multi-page) form
    passwords      : null,
    
    // The KeePass entry's uniqueID (if known)
    uniqueID : null,
    
    // The title of the KeePass entry (auto-generated from the page title by default)
    title : null,
    
    // array of kfLoginField objects representing all non-passwords
    // on this (potentially multi-page) form
    otherFields : null,
    
    // How relevant this login entry is to the current form in
    // the browser - transient (not stored in KeePass)
    relevanceScore : null,
    
    // The total number of pages the login entry will fill (usually 1; transient)
    maximumPage : null,
    
    // A base64 encoding of the icon for this entry. It will always be a 
    // PNG when populated from KeePass but could be other formats when first 
    // loading a favicon from a website. (Hopefully this will be an easy exception 
    // to deal with but if not we can add a mime type field to this object too)
    iconImageData : null,

    parentGroup : null,
    
    priority : 0,
	alwaysAutoFill : false,
	alwaysAutoSubmit : false,
	neverAutoFill : false,
	neverAutoSubmit : false,
	
	database : null,
		
	toJSON : function ()
    {
        var intermediateObject = {};
        intermediateObject.URLs = this.URLs;
        intermediateObject.formActionURL = this.formActionURL;
        intermediateObject.httpRealm = this.httpRealm;
        intermediateObject.usernameIndex = this.usernameIndex;
        intermediateObject.passwords = this.passwords;
        intermediateObject.uniqueID = this.uniqueID;
        intermediateObject.title = this.title;
        intermediateObject.otherFields = this.otherFields;//this.otherFields.map(function(item) { return item.toJSONifiable(); });
        intermediateObject.relevanceScore = this.relevanceScore;
        intermediateObject.maximumPage = this.maximumPage;
        intermediateObject.iconImageData = this.iconImageData;
        intermediateObject.parentGroup = this.parentGroup;
        intermediateObject.priority = this.priority;
        intermediateObject.alwaysAutoFill = this.alwaysAutoFill;
        intermediateObject.alwaysAutoSubmit = this.alwaysAutoSubmit;
        intermediateObject.neverAutoFill = this.neverAutoFill;
        intermediateObject.neverAutoSubmit = this.neverAutoSubmit;
        intermediateObject.database = this.database;
        
        //var json = JSON.stringify(intermediateObject);
        return intermediateObject;
    },
    
    fromJSON : function (json)
    {
        var intermediateObject = JSON.parse(json);
        this.URLs = intermediateObject.URLs;
        this.formActionURL = intermediateObject.formActionURL;
        this.httpRealm = intermediateObject.httpRealm;
        this.usernameIndex = intermediateObject.usernameIndex;
        this.passwords = intermediateObject.passwords.map(function(item) { var newField = new kfLoginField(); newField.fromJSONifiable(item); return newField; });
        this.uniqueID = intermediateObject.uniqueID;
        this.title = intermediateObject.title;
        this.otherFields = intermediateObject.otherFields.map(function(item) { var newField = new kfLoginField(); newField.fromJSONifiable(item); return newField; });
        this.relevanceScore = intermediateObject.relevanceScore;
        this.maximumPage = intermediateObject.maximumPage;
        this.iconImageData = intermediateObject.iconImageData;
        this.parentGroup = intermediateObject.parentGroup;
        this.priority = intermediateObject.priority;
        this.alwaysAutoFill = intermediateObject.alwaysAutoFill;
        this.alwaysAutoSubmit = intermediateObject.alwaysAutoSubmit;
        this.neverAutoFill = intermediateObject.neverAutoFill;
        this.neverAutoSubmit = intermediateObject.neverAutoSubmit;
        this.database = intermediateObject.database;
    },
    
    // assists with serialisation of this object to a string
    // (for attachment to the current tab session)
    // currently used only for recording potentially half-finished new entries after
    // user has submitted a form, hence not all info. needs to be persisted
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
        this.priority = 0;
	    this.alwaysAutoFill = false;
	    this.alwaysAutoSubmit = false;
	    this.neverAutoFill = false;
	    this.neverAutoSubmit = false;
    },
    
    initFromEntry : function (entry)
    {
        var passwords = [];
        var otherFields = [];
        var usernameIndex = 0;
        var maximumPage = 1;

        for (var j = 0; j < entry.formFieldList.length; j++) 
        {
            var kpff = entry.formFieldList[j];
            if (kpff.type == keeFoxFormFieldType.password)
            {
	            if (kpff.page > maximumPage)
		            maximumPage = kpff.page;

	            newField = new kfLoginField();
	            newField.init(kpff.name, kpff.value, kpff.id, "password", kpff.page);
	            passwords.push(newField);

            } else if (kpff.type == keeFoxFormFieldType.text || kpff.type == keeFoxFormFieldType.username
	             || kpff.type == keeFoxFormFieldType.select || kpff.type == keeFoxFormFieldType.radio
	              || kpff.type == keeFoxFormFieldType.checkbox)
            {
	            var otherLength = otherFields.length;
	            var type = "unknown";

	            switch (kpff.type)
	            {
		            case keeFoxFormFieldType.username: usernameIndex = otherLength; type = "text"; break; // may 2010: should be "text"? // may 2011: trying it out...
		            case keeFoxFormFieldType.text: type = "text"; break;
		            case keeFoxFormFieldType.radio: type = "radio"; break;
		            case keeFoxFormFieldType.checkbox: type = "checkbox"; break;
		            case keeFoxFormFieldType.select: type = "select-one"; break;
	            }

	            if (kpff.page > maximumPage)
		            maximumPage = kpff.page;
            	
	            newField = new kfLoginField();
	            newField.init(kpff.name, kpff.value, kpff.id, type, kpff.page);
	            otherFields.push(newField);
            }
        }

        this.init(entry.uRLs, entry.formActionURL, entry.hTTPRealm, usernameIndex,
                  passwords, entry.uniqueID, entry.title, otherFields, maximumPage);
        this.parentGroup = entry.parent;
        this.iconImageData = entry.iconImageData;
        this.alwaysAutoFill = entry.alwaysAutoFill;
        this.alwaysAutoSubmit = entry.alwaysAutoSubmit;
        this.neverAutoFill = entry.neverAutoFill;
        this.neverAutoSubmit = entry.neverAutoSubmit;
        this.priority = entry.priority;
        this.database = entry.db;
    },
        
    _allURLsMatch : function (URLs, ignoreURIPathsAndSchemes, ignoreURIPaths, keeFoxILM)
    {    
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
    //window.keefox_org.Logger.debug("aa");
        if (this.URLs.length != URLs.length)
            return false;
            //window.keefox_org.Logger.debug("ab");
        for (let i = 0; i < URLs.length; i++)
        {
            var url1 = URLs[i];
            for (let j = 0; j < this.URLs.length; j++)
            {
                var url2 = this.URLs[j];
            //window.keefox_org.Logger.debug("ac:"+url1+":"+url2);
                if (!ignoreURIPathsAndSchemes && keeFoxILM._getURISchemeHostAndPort(url1) != keeFoxILM._getURISchemeHostAndPort(url2))
                    return false;
                else if (ignoreURIPathsAndSchemes && !ignoreURIPaths && keeFoxILM._getURIHostAndPort(url1) != keeFoxILM._getURIHostAndPort(url2))
                    return false;
                else if (!ignoreURIPathsAndSchemes && !ignoreURIPaths && keeFoxILM._getURIExcludingQS(url1) != keeFoxILM._getURIExcludingQS(url2))
                    return false;
            }
        }
        return true;
    },

    _allPasswordsMatch : function (passwords)
    {
        var matches = 0;
        if (this.passwords.length != passwords.length)
            return false;
            
        for (let i = 0; i < this.passwords.length; i++)
            for (let j = 0; j < passwords.length; j++)
                if (passwords[i].value == this.passwords[i].value)
                {
                    matches++;
                    break; // leave only the inner loop
                }
                
        if (matches != passwords.length)
            return false;
                    
        return true;
    },

    _usernamesMatch : function (login)
    {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
	wm.getMostRecentWindow("mail:3pane");
        
        if (this.otherFields.length != login.otherFields.length)
            return false;
         
        var loginUsername = null;
        if (login.usernameIndex >= 0 && login.otherFields != null && login.otherFields.length > login.usernameIndex)
        {
            var temp = login.otherFields[login.usernameIndex];
            loginUsername = temp.value;
        }
        
        var thisUsername = null;
        if (this.usernameIndex >= 0 && this.otherFields != null && this.otherFields.length > this.usernameIndex)
        {
            var temp = this.otherFields[this.usernameIndex];
            thisUsername = temp.value;
        }
        
        if (thisUsername != loginUsername)
            return false;
        
        return true;
    },

    // determines if this matches another supplied login object, with a number
    // of controllable definitions of "match" to support various use cases
    matches : function (aLogin, ignorePasswords, ignoreURIPaths,
         ignoreURIPathsAndSchemes, ignoreUsernames)
    {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");

        if (!this._allURLsMatch(aLogin.URLs, ignoreURIPathsAndSchemes, ignoreURIPaths, window.keefox_org.ILM))
            return false;

        if (this.httpRealm != aLogin.httpRealm && !(this.httpRealm == "" || aLogin.httpRealm == ""))
            return false;

        if (!ignoreUsernames && !this._usernamesMatch(aLogin))
            return false;

        if (!ignorePasswords && !this._allPasswordsMatch(aLogin.passwords))
            return false;

        // If either formActionURL is blank (but not null), then match.
        if (this.formActionURL != "" && aLogin.formActionURL != "")
        {
            if (ignoreURIPathsAndSchemes 
                && window.keefox_org.ILM._getURISchemeHostAndPort(aLogin.formActionURL)
                    != window.keefox_org.ILM._getURISchemeHostAndPort(this.formActionURL))
                return false;
            else if (!ignoreURIPathsAndSchemes 
                && ignoreURIPaths && window.keefox_org.ILM._getURIHostAndPort(aLogin.formActionURL) 
                    != window.keefox_org.ILM._getURIHostAndPort(this.formActionURL))
                return false;
            else if (!ignoreURIPathsAndSchemes 
                && !ignoreURIPaths 
                && this.formActionURL != aLogin.formActionURL)
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
                this.URLs = [];
                        
            for (let i = 0; i < previousStageLogin.URLs.length; i++)
            {
                var URL = previousStageLogin.URLs[i];
                this.URLs.push(URL);
            }
        }

        if (previousStageLogin.passwords != undefined && previousStageLogin.passwords != null 
            && previousStageLogin.passwords.length > 0)
        {
            if (this.passwords == undefined || this.passwords == null)
                this.passwords = [];
                        
            for (let i = 0; i < previousStageLogin.passwords.length; i++)
            {
                var passField = previousStageLogin.passwords[i];
                this.passwords.push(passField);
            }
        }
        
        if (previousStageLogin.otherFields != undefined && previousStageLogin.otherFields != null
            && previousStageLogin.otherFields.length > 0)
        {
            if (this.otherFields == undefined || this.otherFields == null)
                this.otherFields = [];
                        
            for (let i = 0; i < previousStageLogin.otherFields.length; i++)
            {
                var otherField = previousStageLogin.otherFields[i];
                this.otherFields.push(otherField);
            }
        }
        
        this.maximumPage = Math.max(this.maximumPage, previousStageLogin.maximumPage);
    },
    
    asEntry : function ()
    {
        var entry = {};
        
        entry.db = this.database;
        entry.parent = this.parentGroup;
        entry.iconImageData = this.iconImageData;
        entry.alwaysAutoFill = this.alwaysAutoFill;
        entry.alwaysAutoSubmit = this.alwaysAutoSubmit;
        entry.neverAutoFill = this.neverAutoFill;
        entry.neverAutoSubmit = this.neverAutoSubmit;
        entry.priority = this.priority;
        entry.uRLs = this.URLs;
        entry.formActionURL = this.formActionURL;
        entry.hTTPRealm = this.httpRealm;
        entry.uniqueID = this.uniqueID;
        entry.title = this.title;
        entry.formFieldList = [];
        for (var i in this.passwords)
            entry.formFieldList.push(this.passwords[i].asFormField(false));
        for (var i in this.otherFields)
            if (this.usernameIndex == i)
                entry.formFieldList.push(this.otherFields[i].asFormField(true));
            else
                entry.formFieldList.push(this.otherFields[i].asFormField(false));
        
        return entry;    
    }
  
};
	  
	
function kfLoginField() {}

kfLoginField.prototype = {
    // "name" attribute on the HTML form element
    name      : null,
    
    // "value" attribute on the HTML form element
    value : null,
    
    // "id" attribute on the HTML form element
    fieldId : null,
    
    // The HTML form element DOM objects - transient (not sent to KeePass)
    DOMInputElement : null,
    DOMSelectElement : null,
    
    // "type" attribute on the HTML form element
    type : null,
    
    // on which page of a login procedure this field can be found
    formFieldPage : -1,
    
    toJSON : function ()
    {
        var intermediateObject = {};
        intermediateObject.name = this.name;
        intermediateObject.value = this.value;
        intermediateObject.fieldId = this.fieldId;
        //intermediateObject.DOMInputElement = this.DOMInputElement;
        //intermediateObject.DOMSelectElement = this.DOMSelectElement;
        intermediateObject.type = this.type;
        intermediateObject.formFieldPage = this.formFieldPage;
        
        //var json = JSON.stringify(intermediateObject);
        //return json;
        return intermediateObject;
    },
    
    toJSONKF : function ()
    {
        //var intermediateObject = this.toJSONifiable();        
        //var json = JSON.stringify(intermediateObject);
        //return json;
    },
    
    fromJSONifiable : function (intermediateObject)
    {
        this.name = intermediateObject.name;
        this.value = intermediateObject.value;
        this.fieldId = intermediateObject.fieldId;
        //this.DOMInputElement = intermediateObject.DOMInputElement;
        //this.DOMSelectElement = intermediateObject.DOMSelectElement;
        this.type = intermediateObject.type;
        this.formFieldPage = intermediateObject.formFieldPage;
    },
    
    // assists with deserialisation of this object to a string
    // (for attachment to the current tab session)
    toSource : function ()
    {
        var fieldIdParam = (this.fieldId == null) ? "null" : ("'"+this.fieldId+"'");
        var fieldNameParam = (this.name == null) ? "null" : ("'"+this.name.replace("'","\\'")+"'"); // replace("\\","\\\\")
        var fieldValueParam = (this.value == null) ? "null" : ("'"+this.value.replace("'","\\'")+"'"); // replace("\\","\\\\")
        
        return "( "+fieldNameParam+", "+fieldValueParam+" , "+fieldIdParam+" , '"+this.type+"' , "+this.formFieldPage+" )";
    },
    
    init : function ( aName, aValue, aID, aType, aFormFieldPage )
    {
        var logService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
        logService.logStringMessage("Initialising kfLoginField [name: " + aName + ", value: " + aValue + ", ID: " + aID + ", type: " + aType + ", page: " + aFormFieldPage + "]");
        
        //dump("Initialising kfLoginField [name: " + aName + ", value: " + aValue + ", ID: " + aID + ", type: " + aType + ", page: " + aFormFieldPage + "]\n");
        
        this.name = aName;
        this.value = aValue;
        if (aID == null || aID == undefined)
            this.fieldId = "";
        else
            this.fieldId = aID;
        this.type = aType;
        this.formFieldPage = aFormFieldPage;
    },
    
    asFormField : function (isUsername)
    {
        formField = {};
        
        formField.name = this.name;
        formField.value = this.value;
        formField.id = this.fieldId;
        formField.page = this.formFieldPage;
        
        switch (this.type)
        {
            case "password": formField.type = keeFoxFormFieldType.password; break;            
            case "radio": formField.type = keeFoxFormFieldType.radio; break;
            case "checkbox": formField.type = keeFoxFormFieldType.checkbox; break;
            case "select-one": formField.type = keeFoxFormFieldType.select; break;
            default: formField.type = isUsername ? keeFoxFormFieldType.username : keeFoxFormFieldType.text; break;
        }
    
		return formField;
    }
  
};
	  
			  
			  