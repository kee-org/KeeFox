/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2010 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the javascript file containing functions directly used to fill in forms.
  It appends functions onto the KFILM object defined in KFILM.js
  
  Some of the code is based on Mozilla's nsLoginManager.js, used under
  GPL 2.0 terms. A few functions are currently unused and really just
  there in case they prove useful in the future.

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
"use non-strict";

let Cu = Components.utils;

Cu.import("resource://kfmod/kfDataModel.js");

keefox_win.ILM._fillManyFormFields = function 
    (pageFields, matchFields, currentTabPage, overWriteFieldsAutomatically)
{
    keefox_win.Logger.debug("_fillManyFormFields started");
    
    if (pageFields == null || pageFields == undefined || matchFields == null || matchFields == undefined)
        return;
    
    keefox_win.Logger.debug("We've received the data we need");
    
    var validTabPage = true;
    
    if (currentTabPage <= 0)
        validTabPage = false;
        
    keefox_win.Logger.info("Filling form fields for page "+currentTabPage);
    
    if (overWriteFieldsAutomatically)
        keefox_win.Logger.info("Auto-overwriting fields");
    else
        keefox_win.Logger.info("Not auto-overwriting fields");
    
    var matchedValues = []; // value of the matched field (so we don't have to go through XPCOM again)
    var backupMatchedValues = []; // used to keep track of a less preferred option just in case we don't find any suitable matches.
    
    var matchedIds = []; // index = corresponding matchField index and value = pageFieldId that the matchField would like to fill in
    var backupMatchedIds = [];
    
    var fieldFilled = []; // tracks whether a certain form field has already had a value put into it (so we don't over-write it with a less-ideal value)
    
    // we try to fill every form field. We try to match by id first and then name before just guessing.
    // Generally we'll only fill if the matched field is of the same type as the form field but
    // we are flexible RE text and username fields because that's an artificial difference
    // for the sake of the KeeFox password management software. However, usernames will be chosen above
    // text fields if all else is equal
    for (var i = 0; i < pageFields.length; i++)
    {
        var foundADefiniteMatch = false;
        keefox_win.Logger.info("Trying to find suitable data field match based on form field "+i+"'s id: "+pageFields[i].fieldId);
        
        for (var j = 0; j < matchFields.length; j++)
        {
            // if we have already identified a form field that we want
            // to fill with the value in this field, skip on to the next possibility...
            if (matchedValues[j] != undefined && matchedValues[j] != null && matchedValues[j] != "")
                continue;
                
            var matchedField = matchFields[j];
            
            if (pageFields[i].fieldId != null && pageFields[i].fieldId != undefined 
                && pageFields[i].fieldId != "" && pageFields[i].fieldId == matchedField.fieldId && 
                (pageFields[i].type == "select-one" 
                 || pageFields[i].type == "radio" 
                 || pageFields[i].type == "checkbox" 
                 || pageFields[i].value.length == 0 
                 || overWriteFieldsAutomatically
                )
                && (!validTabPage || matchedField.formFieldPage == currentTabPage)
                && (pageFields[i].type == matchedField.type
                    || (this.isATextFormFieldType(pageFields[i].type)
                            && (matchedField.type == "username" || matchedField.type == "text")
                       )
                   )
               )
            {
                matchedValues[j] = matchedField.value;
                matchedIds[j] = i;
                foundADefiniteMatch = true;
                keefox_win.Logger.debug("Data field "+j+" is a match for form field " + i);
                break;
            }
        }
        
        // find by name instead (except for radio buttons which we know have multiple fields per name)
        if (!foundADefiniteMatch && pageFields[i].type != "radio")
        {
            keefox_win.Logger.info("We didn't find a match so trying to match by form field name: "+pageFields[i].name);
            for (j = 0; j < matchFields.length; j++)
            {
                // if we have already identified a form field that we want
                // to fill with the value in this field, skip on to the next possibility...
                if (matchedValues[j] != undefined && matchedValues[j] != null && matchedValues[j] != "")
                    continue;
                    
                var matchedField = matchFields[j];
                
                if (pageFields[i].name != null && pageFields[i].name != undefined 
                    && pageFields[i].name != "" && pageFields[i].name == matchedField.name && 
                    (pageFields[i].type == "select-one" 
                     || pageFields[i].type == "radio" 
                     || pageFields[i].type == "checkbox" 
                     || pageFields[i].value.length == 0 
                     || overWriteFieldsAutomatically
                    )
                    && (!validTabPage || matchedField.formFieldPage == currentTabPage)
                    && (pageFields[i].type == matchedField.type
                        || (this.isATextFormFieldType(pageFields[i].type)
                                && (matchedField.type == "username" || matchedField.type == "text")
                           )
                       )
                   )
                {
                    matchedValues[j] = matchedField.value;
                    matchedIds[j] = i;
                    foundADefiniteMatch = true;
                    keefox_win.Logger.debug("Data field "+j+" is a match for form field " + i);
                    break;
                }
            }
        }
        
        if (!foundADefiniteMatch && pageFields[i].type != "radio" && (pageFields[i].type == "select-one" 
             || pageFields[i].type == "checkbox" 
             || pageFields[i].value.length == 0 
             || overWriteFieldsAutomatically
           ))
        {
            // Look for 2nd-best match. Need to pick the first suitable value we come across
            keefox_win.Logger.info("We could not find a good field match so just looking for the next best option (first value of this type: "+pageFields[i].type + ")");
            for (j = 0; j < matchFields.length; j++)
            {
                // if we have already identified a form field that we want
                // to fill with the value in this field, skip on to the next possibility...
                if (matchedValues[j] != undefined && matchedValues[j] != null && matchedValues[j] != "")
                    continue;
                    
                // if this is not a potential text field we ignore it (not so
                // important to try to match with innacurate names for
                // non-text fields and there are some bad side-effects so best avoided) 
                if (!(this.isATextFormFieldType(pageFields[i].type)
                        || pageFields[i].type == "password")) //TODO2: don't think this is possible; plus simplify logic in later if statements cos we know something about the field type now
                    continue;
                    
                var matchedField = matchFields[j];
                
                if ((
                    (this.isATextFormFieldType(pageFields[i].type)
                          && (matchedField.type == "username" || matchedField.type == "text"))
                    || (pageFields[i].type == "password" && matchedField.type == "password")
                    )
                    && (backupMatchedValues[j] == undefined || backupMatchedValues[j] == null )
                    )
                {
                    // all of these matches are considered backup options only...
                    backupMatchedValues[j] = matchedField.value;
                    backupMatchedIds[j] = i;
                    keefox_win.Logger.debug("Data field "+j+" is almost a match for form field " + i + " - we'll use it if we find no better option.");
                }
            }
        }
    }
     
    // OK, now we know which values we want to fill so let's actually apply them to the form...
    for (i = 0; i < matchedIds.length; i++)
    {   
        if (fieldFilled[matchedIds[i]] != undefined && fieldFilled[matchedIds[i]] != null && fieldFilled[matchedIds[i]] == true)
            continue;

        if (matchedValues[i] != undefined && matchedValues[i] != null && matchedValues[i] != "")
        {
            if (keefox_win.Logger.logSensitiveData)
                keefox_win.Logger.info("We will populate field "+matchedIds[i]+" with: "+matchedValues[i]);
            else
                keefox_win.Logger.info("We will populate field "+matchedIds[i]+".");
            
            if (pageFields[matchedIds[i]].type == "select-one")
            {
                pageFields[matchedIds[i]].DOMSelectElement.value = matchedValues[i]; 
            } else if (pageFields[matchedIds[i]].type == "checkbox" || pageFields[matchedIds[i]].type == "radio")
            {
                pageFields[matchedIds[i]].DOMInputElement.checked = true;
            } else
            {    
                pageFields[matchedIds[i]].DOMInputElement.value = matchedValues[i]; 
            }
            fieldFilled[matchedIds[i]] = true;
        }
    }
    
    for (i = 0; i < backupMatchedIds.length; i++)
    {   
        if (fieldFilled[backupMatchedIds[i]] != undefined && fieldFilled[backupMatchedIds[i]] != null && fieldFilled[backupMatchedIds[i]] == true)
            continue;
            
        if (backupMatchedValues[i] == undefined || backupMatchedValues[i] == null || backupMatchedValues[i] == "")
        {
            keefox_win.Logger.info("We could not find a suitable match so not filling any field with supplied login field id " + i);
        } else
        {
            if (keefox_win.Logger.logSensitiveData)
                keefox_win.Logger.info("We will populate field "+backupMatchedIds[i]+" with our backup choice: "+backupMatchedValues[i]);
            else
                keefox_win.Logger.info("We will populate field "+backupMatchedIds[i]+" with our backup choice.");
            
            if (pageFields[backupMatchedIds[i]].type == "select-one")
            {
                pageFields[backupMatchedIds[i]].DOMSelectElement.value = backupMatchedValues[i]; 
            } else if (pageFields[backupMatchedIds[i]].type == "checkbox" || pageFields[backupMatchedIds[i]].type == "radio")
            {
                pageFields[backupMatchedIds[i]].DOMInputElement.checked = true;
            } else
            {    
                pageFields[backupMatchedIds[i]].DOMInputElement.value = backupMatchedValues[i]; 
            }
            fieldFilled[backupMatchedIds[i]] = true;
        }
    }
    
};

/*
 * _fillDocument
 *
 * Called when a page has loaded. For each form in the document,
 * we check to see if it can be filled with a stored login.
 */
keefox_win.ILM._fillDocument = function (doc, initialPageLoad)
{
    keefox_win.Logger.info("Filling document. Initial page load: " + initialPageLoad);
    
    //TODO2: maybe need to attach this var to somewhere in case it gets GCd?
    var findLoginDoc = {};
    
    // We'll do things differently if this is a fill operation some time
    // after the page has alread loaded (e.g. don't auto-fill or
    // auto-submit in case we overwrite user's data)
    if ( initialPageLoad === undefined )
        initialPageLoad = false;
    
    //?/var passwords;
    var mainWindow = doc.defaultView.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
               .getInterface(Components.interfaces.nsIWebNavigation)
               .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
               .rootTreeItem
               .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
               .getInterface(Components.interfaces.nsIDOMWindow);

    if (mainWindow.content.document != doc)
    {
        var frameDoc = doc;
        if (doc.defaultView.frameElement)
        {
            while (frameDoc.defaultView.frameElement)
                frameDoc=frameDoc.defaultView.frameElement.ownerDocument;
        } else
        {
            keefox_win.Logger.debug("skipping document fill (this is not the currently active tab and it is not within a frame)");
            return;
        }
        
        if (mainWindow.content.document != frameDoc)
        {
            keefox_win.Logger.debug("skipping document fill (this is within a frame but it is not the currently active tab)");
            return;
        }
    }

    keefox_win.Logger.info("attempting document fill");
    
    findLoginDoc.uniqueID = "";
    findLoginDoc.logins = [];
    
    // auto fill the form by default unless a preference or tab variable tells us otherwise
    findLoginDoc.wantToAutoFillForm = this._kf._keeFoxExtension.prefs.getValue("autoFillForms",true);
    findLoginDoc.mustAutoFillForm = false;
    findLoginDoc.cannotAutoFillForm = false;

    // do not auto submit the form by default unless a preference or tab variable tells us otherwise
    findLoginDoc.wantToAutoSubmitForm = this._kf._keeFoxExtension.prefs.getValue("autoSubmitForms",false);
    findLoginDoc.mustAutoSubmitForm = false;
    findLoginDoc.cannotAutoSubmitForm = false;
    
    // Allow user to override automatic behaviour if multiple logins match this URL
    findLoginDoc.wantToAutoFillFormWithMultipleMatches = 
        this._kf._keeFoxExtension.prefs.getValue("autoFillFormsWithMultipleMatches",true);
    findLoginDoc.wantToAutoSubmitFormWithMultipleMatches = 
        this._kf._keeFoxExtension.prefs.getValue("autoSubmitFormsWithMultipleMatches",true);
    
    
    // overwrite existing username by default unless a preference or tab variable tells us otherwise
    findLoginDoc.overWriteFieldsAutomatically = this._kf._keeFoxExtension.prefs.getValue("overWriteFieldsAutomatically",true);

    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                .getService(Components.interfaces.nsISessionStore);
    findLoginDoc.ss = ss;
    findLoginDoc.currentGBrowser = keefox_win.toolbar._currentWindow.gBrowser;
    var topDoc = doc;
    if (doc.defaultView.frameElement)
        while (topDoc.defaultView.frameElement)
            topDoc=topDoc.defaultView.frameElement.ownerDocument;
    findLoginDoc.topDoc = topDoc;

    findLoginDoc.currentTab = findLoginDoc.currentGBrowser.mTabs[findLoginDoc.currentGBrowser.getBrowserIndexForDocument(findLoginDoc.topDoc)];
    findLoginDoc.currentTabUniqueID = ss.getTabValue(findLoginDoc.currentTab, "KF_uniqueID");
    findLoginDoc.currentTabDbFileName = ss.getTabValue(findLoginDoc.currentTab, "KF_dbFileName");
    findLoginDoc.numberOfTabFillsRemaining = ss.getTabValue(findLoginDoc.currentTab, "KF_numberOfTabFillsRemaining");
    findLoginDoc.numberOfTabFillsTarget = ss.getTabValue(findLoginDoc.currentTab, "KF_numberOfTabFillsTarget");
    findLoginDoc.currentTabPage = null;    

    if (findLoginDoc.currentTabUniqueID != undefined && findLoginDoc.currentTabUniqueID != null && findLoginDoc.currentTabUniqueID != "")
    {
        keefox_win.Logger.info("Found this KeePass uniqueID in the tab: " + findLoginDoc.currentTabUniqueID);
        keefox_win.Logger.info("Found this KeePass DB root ID in the tab: " + findLoginDoc.currentTabDbFileName);
        findLoginDoc.uniqueID = findLoginDoc.currentTabUniqueID;
        findLoginDoc.dbFileName = findLoginDoc.currentTabDbFileName;
        
        // we want to fill the form with this data
        findLoginDoc.mustAutoFillForm = true;
        findLoginDoc.overWriteFieldsAutomatically = true;
        
        // but need to check whether we want to autosubmit it too
        findLoginDoc.localAutoSubmitPref = ss.getTabValue(findLoginDoc.currentTab, "KF_autoSubmit");

        if (findLoginDoc.localAutoSubmitPref != undefined && findLoginDoc.localAutoSubmitPref != null && findLoginDoc.localAutoSubmitPref == "yes")
        {
            keefox_win.Logger.debug("We must auto-submit this form.");
            findLoginDoc.mustAutoSubmitForm = true;
        }

        // Deleting these bits of info no matter what, so future uses of this tab are unaffected by previous uses.
        // (if we actually go ahead with the form fill we will add them back in then)
        var SSautoSubmit = ss.getTabValue(findLoginDoc.currentTab, "KF_autoSubmit");

        if (SSautoSubmit != undefined && SSautoSubmit != null && SSautoSubmit != "")
        {
            ss.deleteTabValue(findLoginDoc.currentTab, "KF_autoSubmit");
        }
        
        var SSuniqueID = ss.getTabValue(findLoginDoc.currentTab, "KF_uniqueID");

        if (SSuniqueID != undefined && SSuniqueID != null && SSuniqueID != "")
        {
            ss.deleteTabValue(findLoginDoc.currentTab, "KF_uniqueID");
        }
        
        var SSdbFileName = ss.getTabValue(findLoginDoc.currentTab, "KF_dbFileName");

        if (SSdbFileName != undefined && SSdbFileName != null && SSdbFileName != "")
        {
            ss.deleteTabValue(findLoginDoc.currentTab, "KF_dbFileName");
        }
        
        keefox_win.Logger.debug("deleted some tab values");
    }

    // If we have exceeded the maximum number of expected pages during
    // this form filling session, we reset the record of those fills
    // and ensure that we don't auto-fill or auto-submit the form (chances
    // are high that password or server fault occured)
    if (findLoginDoc.numberOfTabFillsRemaining != undefined && findLoginDoc.numberOfTabFillsRemaining != null && findLoginDoc.numberOfTabFillsRemaining.length > 0)
    {
        keefox_win.Logger.info("Found this numberOfTabFillsRemaining in the tab: " + findLoginDoc.numberOfTabFillsRemaining);
        if (findLoginDoc.numberOfTabFillsRemaining == "0")
        {
            findLoginDoc.cannotAutoSubmitForm = true;
            findLoginDoc.cannotAutoFillForm = true;
            ss.deleteTabValue(findLoginDoc.currentTab, "KF_numberOfTabFillsRemaining");
            keefox_win.Logger.debug("Not auto-filling or auto-submiting this form.");
            keefox_win.Logger.debug("KF_numberOfTabFillsRemaining deleted");
        }
    }

    // If we haven't been told whether this is a multi-page login yet,
    // we'll set relevant variables to -1
    // so that future stages of the login choosing process know we
    // are on the first page and they need
    // to find out whether the best matching form is a multi-page login or not
    
    if ((findLoginDoc.numberOfTabFillsRemaining != undefined && findLoginDoc.numberOfTabFillsRemaining != null 
            && findLoginDoc.numberOfTabFillsRemaining.length > 0 && findLoginDoc.numberOfTabFillsRemaining > 0) 
        || (findLoginDoc.numberOfTabFillsTarget != undefined && findLoginDoc.numberOfTabFillsTarget != null 
            && findLoginDoc.numberOfTabFillsTarget.length > 0 && findLoginDoc.numberOfTabFillsTarget > 0))
    {
        findLoginDoc.currentTabPage = findLoginDoc.numberOfTabFillsTarget - findLoginDoc.numberOfTabFillsRemaining + 1;
    } else
    {
        findLoginDoc.numberOfTabFillsRemaining = -1;
        findLoginDoc.numberOfTabFillsTarget = -1;
        findLoginDoc.currentTabPage = -1;
    }    

    var forms = doc.forms;
    findLoginDoc.forms = forms;
    findLoginDoc.doc = doc;
    
    if (!forms || forms.length == 0)
    {
        keefox_win.Logger.info("No forms found on this page");
        return;
    }

    //TODO: Establish config given this page URL (may need to do it earlier but definitley by here)
    // see also ln 572 in KFILM
    var config = kf.config.getConfigForURL("");

    // if we're not logged in to KeePass then we should prompt user (or not)
    if (!keefox_org._keeFoxStorage.get("KeePassRPCActive", false))
    {
        var notifyBarWhenKeePassRPCInactive = keefox_org._keeFoxExtension.prefs.getValue("notifyBarWhenKeePassRPCInactive",false);
        
        if (notifyBarWhenKeePassRPCInactive && initialPageLoad)
        {
            keefox_win.UI.setWindow(doc.defaultView);
            keefox_win.UI.setDocument(doc);
            keefox_win.UI._showLaunchKFNotification();
        }
        
        var flashIconWhenKeePassRPCInactive = keefox_org._keeFoxExtension.prefs.getValue("flashIconWhenKeePassRPCInactive",true);

        if (flashIconWhenKeePassRPCInactive && initialPageLoad)
            keefox_win.toolbar._currentWindow.setTimeout(keefox_win.toolbar.flashItem, 10,
                keefox_win.toolbar._currentWindow.document.getElementById('KeeFox_Main-Button'), 12, keefox_win.toolbar._currentWindow);
        return;
    } else if (!keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false))
    {
        var notifyBarWhenLoggedOut = keefox_org._keeFoxExtension.prefs.getValue("notifyBarWhenLoggedOut",false);
        
        if (notifyBarWhenLoggedOut && initialPageLoad)
        {
            keefox_win.UI.setWindow(doc.defaultView);
            keefox_win.UI.setDocument(doc);
            keefox_win.UI._showLoginToKFNotification();
        }
        
        var flashIconWhenLoggedOut = keefox_org._keeFoxExtension.prefs.getValue("flashIconWhenLoggedOut",true);
        
        if (flashIconWhenLoggedOut && initialPageLoad)
            keefox_win.toolbar._currentWindow.setTimeout(keefox_win.toolbar.flashItem, 10,
                keefox_win.toolbar._currentWindow.document.getElementById('KeeFox_Main-Button'), 12, keefox_win.toolbar._currentWindow);
        return;
    }

    if (keefox_win.Logger.logSensitiveData)
        keefox_win.Logger.debug("fillDocument processing " + forms.length +
             " forms on " + doc.documentURI);
    else
        keefox_win.Logger.debug("fillDocument processing " + forms.length + " forms");

    var previousActionOrigin = null;
    findLoginDoc.formsReadyForSubmit = 0; // tracks how many forms we auto-fill on this page
    
    
    
    findLoginDoc.initialPageLoad = initialPageLoad;
    findLoginDoc.formOrigin = doc.documentURI;
    findLoginDoc.wrappers = [];
    findLoginDoc.allMatchingLogins = [];
    findLoginDoc.formToAutoSubmit;
    findLoginDoc.formRelevanceScores = [];
    findLoginDoc.usernameIndexArray = [];
    findLoginDoc.passwordFieldsArray = [];
    findLoginDoc.otherFieldsArray = [];
    findLoginDoc.requestCount = 0;
    findLoginDoc.responseCount = 0;
    findLoginDoc.requestIds = []; // the JSONRPC request Ids that reference this findLoginDoc object (to allow deletion after async callback processing)
    
    var previousRequestId = 0;

    for (var i = 0; i < forms.length; i++)
    {
        var form = forms[i];
        findLoginDoc.logins[i] = [];

        // the overall relevance of this form is the maximum of it's
        // matching entries (so we fill the most relevant form)
        findLoginDoc.formRelevanceScores[i] = 0;
        
        keefox_win.Logger.debug("about to get form fields");
        var [usernameIndex, passwordFields, otherFields] =
            this._getFormFields(form, false);
            
        //TODO2: remove this restriction as long as we don't get problems with search fields, etc.
        // maybe only if we are doing a multi-page login?
        if (passwordFields == null || passwordFields.length <= 0 || passwordFields[0] == null)
        {
            keefox_win.Logger.debug("no password field found in this form");
            continue;
        }
        
        findLoginDoc.usernameIndexArray[i] = usernameIndex;
        findLoginDoc.passwordFieldsArray[i] = passwordFields;
        findLoginDoc.otherFieldsArray[i] = otherFields;
        
        //TODO: Don't think this assumption holds anymore - e.g. on pages with javascript actions to modify actionOrigin onsubmit, etc. - need to ALWAYS talk to KPRPC!
        // Only the actionOrigin might be changing, so if it's the same
        // as the last form on the page we can reuse the same logins.
        var actionOrigin = this._getURIHostAndPort(this._getActionOrigin(form));
        if (actionOrigin != previousActionOrigin)
        {
            var findLoginOp = {};
            findLoginOp.forms = forms;
            findLoginOp.formIndexes = [i];
            findLoginOp.wrappedBy = findLoginDoc;
            findLoginOp.callback = function (resultWrapper) // the above vars are missing when callback occurs, dunno why but workaround in place anyway
            {
                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
                var window = wm.getMostRecentWindow("navigator:browser") ||
                    wm.getMostRecentWindow("mail:3pane");
                window.keefox_org._KFLog.info("callback fired!");
                 
                var foundLogins = null;
                var convertedResult = [];
                
                if ("result" in resultWrapper && resultWrapper.result !== false && resultWrapper.result != null)
                {
                    foundLogins = resultWrapper.result; 
                    
                    for (var i in foundLogins)
                    {
                        var kfl = keeFoxLoginInfo();
                        kfl.initFromEntry(foundLogins[i]);
                        convertedResult.push(kfl);
                    }
                } else
                    return;
                    
                var findLoginOp = window.keefox_win.ILM.findLoginOps[resultWrapper.id];
                var findLoginDoc = window.keefox_win.ILM.findLoginDocs[resultWrapper.id];
     
                for (var i=0; i < findLoginOp.forms.length; i++)
                {
                    // Skip any form that we don't want to match against this set of logins
                    if (findLoginOp.formIndexes.indexOf(i) == -1)
                        continue;
                        
                    findLoginDoc.logins[i] = convertedResult;

                    // Nothing to do if we have no matching logins available.
                    if (findLoginDoc.logins[i].length == 0)
                        continue;
                    
                    window.keefox_org._KFLog.info("match found!");
                    
                    // determine the relevance of each login entry to this form
                    // we could skip this when autofilling based on uniqueID but we would have to check for
                    // matches first or else we risk no match and no alternative matching logins on the toolbar
                    for (var v = 0; v < findLoginDoc.logins[i].length; v++)
                    {
                        findLoginDoc.logins[i][v].relevanceScore = window.keefox_win.ILM.
                            _calculateRelevanceScore(findLoginDoc.logins[i][v],
                                findLoginOp.forms[i],findLoginDoc.usernameIndexArray[i],
                                findLoginDoc.passwordFieldsArray[i], findLoginDoc.currentTabPage,
                                findLoginDoc.otherFieldsArray[i]);
                    }
                    
                    findLoginDoc.logins[i].forEach(function(c) {
                        if (c.relevanceScore > findLoginDoc.formRelevanceScores[i])
                            findLoginDoc.formRelevanceScores[i] = c.relevanceScore;
                        } );
                    keefox_win.Logger.debug("Relevance of form " + i + " is " + findLoginDoc.formRelevanceScores[i]);
                    
                    // only remember the logins which are not already in our list of matching logins
                    var newUniqueLogins = findLoginDoc.logins[i].filter(function(d) {
                                            return (findLoginDoc.allMatchingLogins.every(function(e) {
                                                return (d.uniqueid != e.uniqueid);
                                            }));
                                        });
                    findLoginDoc.allMatchingLogins = findLoginDoc.allMatchingLogins.concat(newUniqueLogins);
                }
                findLoginDoc.responseCount++;
                window.keefox_win.ILM.allSearchesComplete(findLoginDoc); // see if we're ready to do the next stage of form processing...
                
            };
            findLoginDoc.wrappers[i] = findLoginOp;
            findLoginDoc.requestCount++;
            
            var requestId = this.findLogins(findLoginDoc.formOrigin, actionOrigin, null, null, null, null, findLoginOp.callback);
            findLoginDoc.requestIds.push(requestId);
            this.findLoginOps[requestId] = findLoginOp;
            this.findLoginDocs[requestId] = findLoginDoc;
            previousActionOrigin = actionOrigin;
            previousRequestId = requestId;
        } else {
            keefox_win.Logger.debug("form[" + i + "]: reusing logins from last form.");
            if (previousRequestId > 0)
                this.findLoginOps[previousRequestId].formIndexes.push(i);
        }


    }  // end of form for loop
    
    
};

// this happens after each findLogins call has run its callback so we can see if we have received all the answers we need to fill the form now
keefox_win.ILM.allSearchesComplete = function (findLoginDoc)
{
//return; // test mem leak 2
    
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
             .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser") ||
        wm.getMostRecentWindow("mail:3pane");
    
    // ensure we only assess the best matching form once all async callbacks have been received
    if (findLoginDoc.responseCount != findLoginDoc.requestCount)
        return;
    
    var mostRelevantFormIndex = 0;
    findLoginDoc.formRelevanceScores.forEach(function(c, index) { 
        keefox_win.Logger.debug("Relevance of form is " + c);
        if (c > findLoginDoc.formRelevanceScores[mostRelevantFormIndex])
            mostRelevantFormIndex = index;
        } );
    
    keefox_win.Logger.debug("The most relevant form is #" + mostRelevantFormIndex);
    
    // from now on we concentrate on just the most relevant form and the fields we found earlier
    var form = findLoginDoc.forms[mostRelevantFormIndex];
    var passwordFields = findLoginDoc.passwordFieldsArray[mostRelevantFormIndex];
    var usernameIndex = findLoginDoc.usernameIndexArray[mostRelevantFormIndex];
    var otherFields = findLoginDoc.otherFieldsArray[mostRelevantFormIndex];
    
    // this records the login that we eventually choose as the one to fill the chosen form with
    var matchingLogin = null;
    
    // If this is a "refill" we won't auto-fill/complete/overwrite.
    if (!findLoginDoc.initialPageLoad)
    {
        findLoginDoc.cannotAutoFillForm = true;
        findLoginDoc.cannotAutoSubmitForm = true;
        findLoginDoc.overWriteFieldsAutomatically = false;
        keefox_win.Logger.debug("Not auto-filling or auto-submiting this form. Not overwriting exsisting contents either.");
    }

    // No point looking at login specific preferences if we are not allowed to auto-fill
    if (!findLoginDoc.cannotAutoFillForm)
    {
        // first, if we have been instructed to load a specific login on this page, do that
        //TODO2: this may not work if requested login can't be exactly matched to a form but another login can
        if (findLoginDoc.uniqueID.length > 0)
        {
            var found = findLoginDoc.logins[mostRelevantFormIndex].some(function(l) {
                                        matchingLogin = l;
                                        return (l.uniqueID == findLoginDoc.uniqueID);
                                    });
            if (!found)
            {
                keefox_win.Logger.info("Password not filled. None of the stored " +
                         "logins match the uniqueID provided. Maybe it is not this form we want to fill...");
            }
        } else if (findLoginDoc.logins[mostRelevantFormIndex].length == 1) {
            matchingLogin = findLoginDoc.logins[mostRelevantFormIndex][0];
        } else {
            keefox_win.Logger.debug("Multiple logins for form, so estimating most relevant.");
            var mostRelevantLoginIndex = 0;
            
            for (var count = 0; count < findLoginDoc.logins[mostRelevantFormIndex].length; count++)
                if (findLoginDoc.logins[mostRelevantFormIndex][count].relevanceScore > findLoginDoc.logins[mostRelevantFormIndex][mostRelevantLoginIndex].relevanceScore)
                    mostRelevantLoginIndex = count;
                
            keefox_win.Logger.info("We think login " + mostRelevantLoginIndex + " is most relevant.");
            matchingLogin = findLoginDoc.logins[mostRelevantFormIndex][mostRelevantLoginIndex];
            
            // If user has specified, prevent automatic fill / submit due to multiple matches
            if (!findLoginDoc.wantToAutoFillFormWithMultipleMatches)
                findLoginDoc.wantToAutoFillForm = false; //false by default
            //if (!findLoginDoc.wantToAutoSubmitFormWithMultipleMatches)
            //    findLoginDoc.wantToAutoSubmitForm = false; // wanttosubmtiforms will always be false for multiple matched entries
        }

        if (matchingLogin != null)
        {
            // update fill and submit preferences from per-entry configuration options
            if (matchingLogin.alwaysAutoFill)
                findLoginDoc.wantToAutoFillForm = true;
            if (matchingLogin.neverAutoFill)
                findLoginDoc.wantToAutoFillForm = false;
            if (matchingLogin.alwaysAutoSubmit)
                findLoginDoc.wantToAutoSubmitForm = true;
            if (matchingLogin.neverAutoSubmit)
                findLoginDoc.wantToAutoSubmitForm = false;

            if (findLoginDoc.wantToAutoFillForm || findLoginDoc.mustAutoFillForm)
            {
                window.keefox_win.ILM._fillManyFormFields(passwordFields, matchingLogin.passwords,
                    findLoginDoc.currentTabPage, findLoginDoc.overWriteFieldsAutomatically);
                window.keefox_win.ILM._fillManyFormFields(otherFields, matchingLogin.otherFields,
                    findLoginDoc.currentTabPage, findLoginDoc.overWriteFieldsAutomatically);
                findLoginDoc.formsReadyForSubmit++; //TODO2: could we fill more than one form before? i don't think so but why is it a count rather than bool?!
            }            
        }
    }

    // record / update the info attached to this tab regarding
    // the number of pages of forms we want to fill in
    // NB: we do this even if we know this is a single form
    // submission becauase then if the user gets dumped
    // back to the form (password error?) then we know not
    // to auto-submit again (to avoid getting stuck in a loop)
    
    // We only do this if any forms were auto-filled successfully
    // (filling via the "matched logins" toolbar button
    // could result in these values being recalculated
    // anyway so no point in wasting time here)
    if (findLoginDoc.formsReadyForSubmit >= 1)
    {
        // first we make sure we have some valid values to start with - i.e. if this was a stnadard page load
        // then we need to assign the page details from the best login match
        if (findLoginDoc.currentTabPage < 0)
        {
            var maximumPageCount = 1;
            for (var i = 0; i < matchingLogin.passwords.length; i++)
            {
                var passField = matchingLogin.passwords[i];
                if (passField.formFieldPage > maximumPageCount)
                    maximumPageCount = passField.formFieldPage;
            }
            for (var i = 0; i < matchingLogin.otherFields.length; i++)
            {
                var otherField = matchingLogin.otherFields[i];
                if (otherField.formFieldPage > maximumPageCount)
                    maximumPageCount = otherField.formFieldPage;
            }
            findLoginDoc.numberOfTabFillsRemaining = maximumPageCount;
            findLoginDoc.numberOfTabFillsTarget = maximumPageCount;
        }
       
        //consume one of our permitted form fills (because next time we read
        // this value it will be as the next page is loading)
        findLoginDoc.numberOfTabFillsRemaining -= 1;
        if (findLoginDoc.numberOfTabFillsRemaining < 0)
            findLoginDoc.numberOfTabFillsRemaining = 0;
        
        // next we update (or set for the first time) the values attached to this tab
        findLoginDoc.ss.setTabValue(findLoginDoc.currentTab, "KF_numberOfTabFillsRemaining", findLoginDoc.numberOfTabFillsRemaining);
        findLoginDoc.ss.setTabValue(findLoginDoc.currentTab, "KF_numberOfTabFillsTarget", findLoginDoc.numberOfTabFillsTarget);
        keefox_win.Logger.debug("Set KF_numberOfTabFillsRemaining to: " + findLoginDoc.numberOfTabFillsRemaining);
        keefox_win.Logger.debug("Set KF_numberOfTabFillsTarget to: " + findLoginDoc.numberOfTabFillsTarget);
        
        // if we didn't already define a uniqueID, we set it up now
        if (findLoginDoc.uniqueID == undefined || findLoginDoc.uniqueID == null || findLoginDoc.uniqueID == "")
        {
            findLoginDoc.uniqueID = matchingLogin.uniqueID;
        }
                
    }
    
    if (passwordFields || otherFields)
    {
        // we register listeners so that if the user modifies the form contents,
        // we break the spell (i.e. we no longer link this form to a specific login.
        // In most cases this won't make a difference but for multi-page logins it
        // will result in problems - not much we can do about that though.) One 
        // possible enhancement in future is to track the original values of just
        // these form fields and compare against them when submitted - can't 
        // just compare against enitre login objects becuase we can't be certain
        // if we are just on one particular page in a multi-page login sequence)
        for (var i = 0; i < passwordFields.length; i++)
        {
            var passField = passwordFields[i];
            //keefox_win.Logger.debug("testi:"+passField.DOMInputElement);
            if (passField.DOMInputElement != null)
            {
            //TODO: test mem leak 3 // skip event listener registration
    
                passField.DOMInputElement.addEventListener("change",function(event) { var evt = document.createEvent('Events'); evt.initEvent('KeeFoxClearTabFormFillData', true, false); this.dispatchEvent(evt); },false,true);
            } //TODO2: Do I need to remove these 3 change listeners? When? Where? How?
        }
        
        for (var i = 0; i < otherFields.length; i++)
        {
            var otherField = otherFields[i];
            //keefox_win.Logger.debug("testi:"+otherField.DOMInputElement);
            if (otherField.DOMInputElement != null)
                otherField.DOMInputElement.addEventListener("change",function(event) { var evt = document.createEvent('Events'); evt.initEvent('KeeFoxClearTabFormFillData', true, false); this.dispatchEvent(evt); },false,true);
            else if (otherField.DOMSelectElement != null)
                otherField.DOMSelectElement.addEventListener("change",function(event) { var evt = document.createEvent('Events'); evt.initEvent('KeeFoxClearTabFormFillData', true, false); this.dispatchEvent(evt); },false,true);
        }
    }                
    
    // if we know we are only interested in filling one specific uniqueID or that
    // we have knowledge of whether we want to autofill when the next page is
    // loaded then we can (re)populate these values now
    if (findLoginDoc.uniqueID != undefined && findLoginDoc.uniqueID != null && findLoginDoc.uniqueID != "")
    {
        findLoginDoc.ss.setTabValue(findLoginDoc.currentTab, "KF_uniqueID", findLoginDoc.uniqueID);
        keefox_win.Logger.debug("Set KF_uniqueID to: " + findLoginDoc.uniqueID);
        findLoginDoc.ss.setTabValue(findLoginDoc.currentTab, "KF_dbFileName", findLoginDoc.dbFileName);
        keefox_win.Logger.debug("Set KF_dbFileName to: " + findLoginDoc.dbFileName);
        
        // only auto fill / submit if we expect another page for this login.
        // This may fail in some cases, not sure yet but it should reduce
        // the chances of auto-submit loops occuring, especially confusing
        // on pages where multiple forms are present regardless of login state
        // (and get displayed to user when appropriate).
        if (findLoginDoc.numberOfTabFillsRemaining > 0)
        {
            findLoginDoc.ss.setTabValue(findLoginDoc.currentTab, "KF_autoSubmit", "yes");
            keefox_win.Logger.debug("Set KF_autoSubmit to: yes");
        }
    }
    
    if (!findLoginDoc.cannotAutoSubmitForm && (findLoginDoc.wantToAutoSubmitForm || findLoginDoc.mustAutoSubmitForm)
        && findLoginDoc.formsReadyForSubmit == 1)
    {
        keefox_win.Logger.info("Auto-submitting form...");
        keefox_win.ILM.submitForm(form);
    } else if (findLoginDoc.allMatchingLogins.length > 0)
    {
    //TODO: test mem leak 4 // comment out this toolbar fill
    
        keefox_win.Logger.info("Using toolbar password fill.");
        keefox_win.toolbar.setLogins(findLoginDoc.allMatchingLogins, findLoginDoc.doc);
    } else 
    {
        keefox_win.Logger.info("Nothing to fill.");
    }
    
    // delete un-needed array entries.
    // hoping it is OK to delete the underlying array property while still referencing
    // it from this function. Assuming normal OO reference GC but don't know the JS
    // internals well enough to be sure so this is a potential crash cause

    // the code below appears to enable cleanup of these resources ONE window load
    // after they are finished with (assuming the window has a form on it). FAR
    // from ideal but a vast improvement on leaking the resources forever as was
    // happening with earlier versions so it will do suffice until more detailed
    // help from Firefox can tell me what is going on (e.g. bug #722749)

    var rids = findLoginDoc.requestIds.slice(0);
    findLoginDoc = null;
    keefox_win.Logger.debug("Deleting login data for recently completed async find logins call.");
    for (var ridc = 0, l = rids.length; ridc < l; ridc++)
    {
        keefox_win.Logger.debug("Deleting for request #" + ridc + " (id: " + rids[ridc] + ")");
        delete window.keefox_win.ILM.findLoginOps[rids[ridc]];
        delete window.keefox_win.ILM.findLoginDocs[rids[ridc]];
    }
};

// login to be used is indentified via KeePass uniqueID (GUID)
// actionURL and other fields help identify which form we should submit to
// TODO2: we previously calculated the preferred form when the page loaded so maybe we
// should pass along that information and use it to decide which form to submit to?
// OTOH this would prevent the user from over-riding the automatic form choice in 
// situations where it makes an incorrect decision.
// TODO2: formID innacurate (so not used yet)
// TODO2: extend so more than one form can be filled, with option to automatically submit
// form that matches most accuratly (currently we just pick the first match - this may not be ideal)
keefox_win.ILM.fill = function (usernameName,usernameValue,
    actionURL,usernameID,formID,uniqueID,docURI,dbFileName)
{
    var fillDocumentDataStorage = {};
    fillDocumentDataStorage.usernameName = usernameName;
    fillDocumentDataStorage.usernameValue = usernameValue;
    fillDocumentDataStorage.actionURL = actionURL;
    fillDocumentDataStorage.usernameID = usernameID;
    fillDocumentDataStorage.formID = formID;
    fillDocumentDataStorage.uniqueID = uniqueID;
    fillDocumentDataStorage.docURI = docURI;
    fillDocumentDataStorage.gBrowser = keefox_win.toolbar._currentWindow.gBrowser;
    fillDocumentDataStorage.doc = this._findDocumentByURI(
            gBrowser.contentDocument.defaultView, docURI);
    fillDocumentDataStorage.dbFileName = dbFileName;
            
    this.findLogins(fillDocumentDataStorage.URL, fillDocumentDataStorage.actionURL, null,
     fillDocumentDataStorage.uniqueID, fillDocumentDataStorage.dbFileName, null, this.fillFindLoginsComplete, fillDocumentDataStorage);
};

keefox_win.ILM.fillFindLoginsComplete = function (resultWrapper, fillDocumentDataStorage)
{                
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
             .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser") ||
        wm.getMostRecentWindow("mail:3pane");
    window.keefox_org._KFLog.info("callback fired!");
     
    var logins = null;
    var convertedResult = [];
    var form;
    var usernameField;
    var usernameIndex;
    var passwordField;
    var ignored;
    var passwords;
    var otherFields;        
    var autoSubmitForm = window.keefox_win.ILM._kf._keeFoxExtension.prefs.getValue("autoSubmitMatchedForms",true);
    var overWriteFields = true; // TODO2: create a new preference for this?
    
    if ("result" in resultWrapper && resultWrapper.result !== false && resultWrapper.result != null)
    {
        logins = resultWrapper.result; 
        
        for (var i in logins)
        {
            var kfl = keeFoxLoginInfo();
            kfl.initFromEntry(logins[i]);
            convertedResult.push(kfl);
        }
    } else
        return;
    logins = convertedResult;
              
    if (keefox_win.Logger.logSensitiveData)
        keefox_win.Logger.info("fill login details from username field: " + fillDocumentDataStorage.usernameName + ":" + fillDocumentDataStorage.usernameValue);
    else
        keefox_win.Logger.info("fill login details");
    
        
    
// not really used or tested yet
//        if ((form == undefined || form == null)
//            && usernameID != null && usernameID.length > 0)
//        {
//            usernameField = doc.getElementById(usernameID);
//            
//            if (usernameField != null)
//            {
//                form = usernameField.form;
//                [usernameIndex, passwords, otherFields] = this._getFormFields(form, false, 1);
//            }
//            
//        }
    
    if (form == undefined || form == null)
    {
        var formRelevanceScores = [];
        var usernameIndexList = [];
        var passwordsList = [];
        var otherFieldsList = [];
        
        for (var i = 0; i < fillDocumentDataStorage.doc.forms.length; i++)
        {
            var formi = fillDocumentDataStorage.doc.forms[i];
            formRelevanceScores[i] = 0;
            
            //TODO2:? only fill in forms that match the host and port of the selected login
            // and only if the scheme is the same (i.e. don't submit to http forms when https was expected)
            form = formi;
            [usernameIndex, passwords, otherFields] = window.keefox_win.ILM._getFormFields(form, false, 1);
            
            if (passwords == null || passwords.length == 0)
                continue;
            
            // determine the relevance of the selected login entry to this form
            //NB: Assuming only one login returned from search (should be by GUID so OK)
            var relevanceScore = window.keefox_win.ILM._calculateRelevanceScore(logins[0],
                    form,usernameIndex, passwords, 1, otherFields); //TODO2: Compare page too?
            formRelevanceScores[i] = relevanceScore;
            usernameIndexList[i] = usernameIndex;
            passwordsList[i] = passwords;
            otherFieldsList[i] = otherFields;            
            keefox_win.Logger.debug("Relevance of form " + i + " is " + formRelevanceScores[i]);                
        }
        
        //TODO2: form should be considered more relevant if it actually had a password field... extend to comparing correct quantity of fields?
        
        // Find the most relevant form
        var mostRelevantFormIndex = 0;
        formRelevanceScores.forEach(function(c, index) {
            if (c > formRelevanceScores[mostRelevantFormIndex])
                mostRelevantFormIndex = index;
        }); 
        keefox_win.Logger.debug("Most releveant form is " + mostRelevantFormIndex);
        
        form = fillDocumentDataStorage.doc.forms[mostRelevantFormIndex];
        usernameIndex = usernameIndexList[mostRelevantFormIndex];
        passwords = passwordsList[mostRelevantFormIndex];
        otherFields = otherFieldsList[mostRelevantFormIndex];
    }
    
    if (passwords == null || passwords.length == 0)
    {
        //TODO2: can we improve here so that forms without password fields can also be handled?
        keefox_win.Logger.info("Can't find any form with a password field. This could indicate that this page uses some odd javascript to delete forms dynamically after the page has loaded.");
        return;
    }

    var URL = window.keefox_win.ILM._getPasswordOrigin(fillDocumentDataStorage.doc.documentURI);
    
    var title = fillDocumentDataStorage.doc.title;
    
    var match = null;
    keefox_win.Logger.info("Found " + logins.length + " logins.");
    
    // Ensure the entry has not been deleted between page load and fill request
    if (fillDocumentDataStorage.uniqueID && logins.length == 1)
        match = logins[0];
    
    if (match == null)
    {
        keefox_win.Logger.warn("Can't find a login for this matched login fill request.");
        return;
    }

    keefox_win.Logger.debug("Found a matching login, filling in passwords, etc.");
        
    window.keefox_win.ILM._fillManyFormFields(passwords, match.passwords, 1, overWriteFields);
    window.keefox_win.ILM._fillManyFormFields(otherFields, match.otherFields, 1, overWriteFields);

    // Attach information to this tab which describes what
    // we know about the number of pages this form covers
    // this allows us to automatically submit multiple page
    // forms with one click and helps avoid repeating
    // loops of form submission in case the password is rejected.
    var maximumPageCount = 1;
    
    for (var i = 0; i < match.passwords.length; i++)
    {
        var passField = match.passwords[i];
        if (passField.formFieldPage > maximumPageCount)
            maximumPageCount = passField.formFieldPage;
    }
    for (var i = 0; i < match.otherFields.length; i++)
    {
        var otherField = match.otherFields[i];
        if (otherField.formFieldPage > maximumPageCount)
            maximumPageCount = otherField.formFieldPage;
    }
    
    var numberOfTabFillsRemaining = maximumPageCount - 1;
    var numberOfTabFillsTarget = maximumPageCount;
    
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                .getService(Components.interfaces.nsISessionStore);
    var currentGBrowser = fillDocumentDataStorage.gBrowser;
    var topDoc = fillDocumentDataStorage.doc;
    if (fillDocumentDataStorage.doc.defaultView.frameElement)
        while (topDoc.defaultView.frameElement)
            topDoc=topDoc.defaultView.frameElement.ownerDocument;
    var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(topDoc)];
    
    ss.setTabValue(currentTab, "KF_numberOfTabFillsRemaining", numberOfTabFillsRemaining);
    ss.setTabValue(currentTab, "KF_numberOfTabFillsTarget", numberOfTabFillsTarget);
    ss.setTabValue(currentTab, "KF_autoSubmit", "yes");
    ss.setTabValue(currentTab, "KF_uniqueID", fillDocumentDataStorage.uniqueID);
    ss.setTabValue(currentTab, "KF_dbFileName", fillDocumentDataStorage.dbFileName);
    keefox_win.Logger.debug("Set KF_numberOfTabFillsRemaining to: " + numberOfTabFillsRemaining);
    keefox_win.Logger.debug("Set KF_numberOfTabFillsTarget to: " + numberOfTabFillsTarget);
    keefox_win.Logger.debug("Set KF_autoSubmit to: yes");
    keefox_win.Logger.debug("Set KF_uniqueID to: " + fillDocumentDataStorage.uniqueID);
    keefox_win.Logger.debug("Set KF_dbFileName to: " + fillDocumentDataStorage.dbFileName);
    
    // now we can submit the form if desired    
    if (autoSubmitForm)
        window.keefox_win.ILM.submitForm(form);
};

keefox_win.ILM._fillAllFrames = function (window, initialPageLoad)
{
    keefox_win.Logger.debug("_fillAllFrames start");
    this._fillDocument(window.document,false);
    
    if (window.frames.length > 0)
    {
        keefox_win.Logger.debug("Filling " + window.frames.length + " sub frames");
        var frames = window.frames;
        for (var i = 0; i < frames.length; i++)
          this._fillAllFrames (frames[i], initialPageLoad);
    }    
};

keefox_win.ILM._findDocumentByURI = function (window, URI)
{
    if (window.frames.length > 0)
    {
        keefox_win.Logger.debug("Searching through " + window.frames.length + " sub frames");
        var frames = window.frames;
        for (var i = 0; i < frames.length; i++)
        { 
            var subResult = this._findDocumentByURI (frames[i], URI);
            if ( subResult != null)
                return subResult;
        }
    }
    
    if (window.document.documentURI == URI)
        return window.document;
    else
        return null;
};

// Submit a form
keefox_win.ILM.submitForm = function (form)
{
    var inputElements = form.getElementsByTagName("input");
    var submitElement = null;
    
    // Find the first submit button    
    for(var i = 0; i < inputElements.length; i++)
	{
		if(inputElements[i].type != null && inputElements[i].type == "submit")
		{
			submitElement = inputElements[i];
			break;
	    }
	}
    //TODO2: more accurate searching of submit buttons, etc. to avoid password resets if possible
    // maybe special cases for common HTML output patterns (e.g. javascript-only ASP.NET forms)
    
    // if no submit button found, try to find an image button
    if(submitElement != null)
    {
        for(var i = 0; i < inputElements.length; i++)
		{
		    if(inputElements[i].type != null && inputElements[i].type == "image")
		    {
			    submitElement = inputElements[i];
			    break;
		    }
	    }
    }    
    
    // If we've found a button to click, use that; if not, just submit the form.  
    if(submitElement != null)
		submitElement.click();
    else
		form.submit();
		
		//TODO2: maybe something like this might be useful? Dunno why a click()
		// above wouldn't be sufficient but maybe some custom event raising might be handy...
		/*
		function simulateClick() {
  var evt = document.createEvent("MouseEvents");
  evt.initMouseEvent("click", true, true, window,
    0, 0, 0, 0, 0, false, false, false, false, 0, null);
  var cb = document.getElementById("checkbox"); 
  var canceled = !cb.dispatchEvent(evt);
  if(canceled) {
    // A handler called preventDefault
    alert("canceled");
  } else {
    // None of the handlers called preventDefault
    alert("not canceled");
  }
}
*/
};