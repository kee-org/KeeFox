/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This contains code related to the management and manipulation of forms and form fields.

  It runs in a tab scope so has direct access to the DOM of the current site.

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

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

var findLoginOps = [];
var matchResults = [];
tabState.latestFindMatchesResults = [];
tabState.latestFindMatchesResultsByURI = [];

var countAllDocuments = function (frame) {
    var localDocCount = 1;

    if (frame.frames.length > 0) {
        var frames = frame.frames;
        for (var i = 0; i < frames.length; i++)
            localDocCount += this.countAllDocuments(frames[i]);
    }
    return localDocCount;
};

var isATextFormFieldType = function (type)
{
    if (type=="checkbox" || type=="select-one" || type=="radio" || type=="password" || type=="hidden"
        || type=="submit" || type=="button" || type=="file" || type=="image" || type=="reset")
        return false;
    else
        return true;
};

var _isAKnownUsernameString = function (fieldNameIn) {
    var fieldName = fieldNameIn.toLowerCase();
    if (fieldName == "username" || fieldName == "j_username" || fieldName == "user_name"
        || fieldName == "user" || fieldName == "user-name" || fieldName == "login"
        || fieldName == "vb_login_username" || fieldName == "name" || fieldName == "user name"
        || fieldName == "user id" || fieldName == "user-id" || fieldName == "userid"
        || fieldName == "email" || fieldName == "e-mail" || fieldName == "id"
        || fieldName == "form_loginname" || fieldName == "wpname" || fieldName == "mail"
        || fieldName == "loginid" || fieldName == "login id" || fieldName == "login_name"
        || fieldName == "openid_identifier" || fieldName == "authentication_email" || fieldName == "openid"
        || fieldName == "auth_email" || fieldName == "auth_id" || fieldName == "authentication_identifier"
        || fieldName == "authentication_id" || fieldName == "customer_number" || fieldName == "customernumber"
        || fieldName == "onlineid") // etc. etc.
        return true;
    return false;
};

/*
* _getFormFields
*
* Returns the usernameIndex and password fields found in the form.
* Can handle complex forms by trying to figure out what the
* relevant fields are.
*
* Returns: [usernameIndex, passwords, ...]
* all arrays are standard javascript arrays
* usernameField may be null.
*/
var _getFormFields = function (form, isSubmission, currentPage)
{
    var DOMusernameField = null;
    var pwFields = [];
    var otherFields = [];
    var allFields = [];
    var firstPasswordIndex = -1;
    var firstPossibleUsernameIndex = -1;
    var usernameIndex = -1;
    var usernameField = null;        
    var kfLoginField = keeFoxLoginField();

    // search the DOM for any form fields we might be interested in
    for (var i = 0; i < form.elements.length; i++)
    {        
        if (form.elements[i].localName.toLowerCase() == "object"
            || form.elements[i].localName.toLowerCase() == "keygen"
            || form.elements[i].localName.toLowerCase() == "output"
            || (form.elements[i].localName.toLowerCase() != "input" 
            && (form.elements[i].type == undefined || form.elements[i].type == null)))
            continue; // maybe it's something un-interesting
 
        var DOMtype = form.elements[i].type.toLowerCase();
            
        Logger.debug("domtype: "+ DOMtype );
            
        if (DOMtype == "fieldset")
            continue; // not interested in fieldsets
            
        if (DOMtype != "password" && !this.isATextFormFieldType(DOMtype) && DOMtype != "checkbox" 
            && DOMtype != "radio" && DOMtype != "select-one")
            continue; // ignoring other form types
            
        if (DOMtype == "radio" && isSubmission && form.elements[i].checked == false) continue;            
        if (DOMtype == "password" && isSubmission && !form.elements[i].value) continue;
        if (DOMtype == "select-one" && isSubmission && !form.elements[i].value) continue;
            
        Logger.debug("proccessing...");
        allFields[allFields.length] =
        {
            index   : i,
            element : keeFoxLoginField(),
            type    : DOMtype
        };
        let fieldValue = form.elements[i].value;
        if (DOMtype == "checkbox")
        {
            if (form.elements[i].checked)
                fieldValue = "KEEFOX_CHECKED_FLAG_TRUE";
            else
                fieldValue = "KEEFOX_CHECKED_FLAG_FALSE";
        }
        allFields[allFields.length-1].element.init(
            form.elements[i].name, fieldValue, form.elements[i].id, DOMtype, currentPage);
        if (DOMtype == "select-one")
            allFields[allFields.length-1].element.DOMSelectElement = form.elements[i];
        else
            allFields[allFields.length-1].element.DOMInputElement = form.elements[i];
            
        if (DOMtype == "password" && firstPasswordIndex == -1)
            firstPasswordIndex = allFields.length-1;
        if (this.isATextFormFieldType(DOMtype) && firstPossibleUsernameIndex == -1 
            && this._isAKnownUsernameString(form.elements[i].name))
            firstPossibleUsernameIndex = allFields.length-1;
    }
        
    // Work out which DOM form element is most likely to be the username field.
    // This information is only used to display the username to the user so an inaccurate
    // choice won't impact the form detection or filling behaviour.
    //TODO:2: Extend this to inspect more than just the name of the field. E.g. max length?
    //TODO:2: For form filling (not submitting) we might want to select based upon found data in KeePass?
    if (firstPossibleUsernameIndex != -1)
        usernameIndex = firstPossibleUsernameIndex;
    else if (firstPasswordIndex > 0)
        usernameIndex = firstPasswordIndex - 1;
    Logger.debug("usernameIndex: "+ usernameIndex );

    var otherCount = 0;
    var actualUsernameIndex = 0;
        
    // seperate the field data into appropriate variables
    for (var i = 0; i < allFields.length; i++)
    {            
        if (allFields[i].type == "password")
            pwFields[pwFields.length] = allFields[i].element;
        else if (this.isATextFormFieldType(allFields[i].type) || allFields[i].type == "checkbox"
            || allFields[i].type == "radio"  || allFields[i].type == "select-one")
        {
            otherFields[otherFields.length] = allFields[i].element;
            if (i == usernameIndex) 
                actualUsernameIndex = otherCount;
            else
                otherCount++;
        }
    }
        
    Logger.debug("actualUsernameIndex: " + actualUsernameIndex);
    Logger.debug("otherFields.length:" + otherFields.length);

    return [actualUsernameIndex, pwFields, otherFields];
};

var _getSaveOnSubmitForSite = function (siteURL)
{
    var showSaveNotification = false;
    if (sendSyncMessage("keefox:isKeePassDatabaseOpen")[0])
    {
        // We don't do this unless we think we have a KeePassRPC connection
        let conf = config.getConfigForURL(siteURL);
        if (!conf.preventSaveNotification)
            showSaveNotification = true;
    }
    return showSaveNotification;
};

//TODO:e10s: Do we need to clear UUID and DBfilename here too?
var resetFormFillSession = function () {
    if (resetFormFillTimer != null) {
        clearTimeout(resetFormFillTimer);
        resetFormFillTimer = null;
    }
    tabState.currentPage = 0;
    tabState.maximumPage = 0;
    tabState.forceAutoSubmit = null;
    tabState.userRecentlyDemandedAutoSubmit = false;
    Logger.debug("Reset form-filling session (page = 0 and cancelled any forced autosubmit).");
};

var resetFormFillTimer = null;