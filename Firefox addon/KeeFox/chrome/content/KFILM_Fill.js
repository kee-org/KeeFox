/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the javascript file containing functions directly used to fill in forms.
  It defines functions on the KFILM object defined in KFILM.js
  
  Some of the code is based on Mozilla's nsLoginManager.js, used under
  GPL 2.0 terms. Lots of the functions are currently unused and really just
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


//pagefields is array, matchFields is nsImutableArray
    KFILM.prototype._fillManyFormFields = function (pageFields, matchFields, currentTabPage)
    {
        KFLog.debug("_fillManyFormFields started");
        
        if (pageFields == null || pageFields == undefined || matchFields == null || matchFields == undefined)
            return;
        
        KFLog.debug("We've received the data we need");
        
        var validTabPage = true;
        
        if (currentTabPage <= 0)
            validTabPage = false;
            
        KFLog.info("Filling form fields for page "+currentTabPage);
        
        // we try to fill every form field. We try to match by id first and then name before just guessing.
        // Generally we'll only fill if the matched field is of the same type as the form field but
        // we are flexible RE text and username fields because that's an artificial difference
        // for the sake of the password management software
        for (i = 0; i < pageFields.length; i++)
        {
            matchedValue = "";
            
            KFLog.info("Trying to find suitable data field match based on form field "+i+"'s id: "+pageFields[i].fieldId);
            
            for (j = 0; j < matchFields.length; j++)
            {
                // Unfortunately the container is declared to have elements
                // that are generic nsIMutableArray. So, we must QI...
                var matchedField = 
                matchFields.queryElementAt(j,Components.interfaces.kfILoginField);
                
                if (pageFields[i].fieldId != null && pageFields[i].fieldId != undefined 
                    && pageFields[i].fieldId == matchedField.fieldId && 
                    (pageFields[i].type == "select" 
                     || pageFields[i].type == "radio" 
                     || pageFields[i].type == "checkbox" 
                     || pageFields[i].value.length == 0 
                     || this._kf._keeFoxExtension.prefs.getValue("overWriteFieldsAutomatically",true)
                    )
                    && (!validTabPage || matchedField.formFieldPage == currentTabPage)
                    && (pageFields[i].type == matchedField.type
                        || (pageFields[i].type == "text" && matchedField.type == "username")
                        || (pageFields[i].type == "username" && matchedField.type == "text")
                       )
                   )
                {
                    matchedValue = matchedField.value;
                    KFLog.debug("Data field "+j+" is a match for this form field");
                    break;
                }
            }
            
            // find by name instead (except for radio buttons which we know have multiple fields per name)
            if (matchedValue == "" && pageFields[i].type != "radio")
            {
                KFLog.info("We didn't find a match so trying to match by form field name: "+pageFields[i].name);
                for (j = 0; j < matchFields.length; j++)
                {
                    var matchedField = 
                    matchFields.queryElementAt(j,Components.interfaces.kfILoginField);
                    
                    if (pageFields[i].name != null && pageFields[i].name != undefined 
                        && pageFields[i].name == matchedField.name && 
                        (pageFields[i].type == "select" 
                         || pageFields[i].type == "radio" 
                         || pageFields[i].type == "checkbox" 
                         || pageFields[i].value.length == 0 
                         || this._kf._keeFoxExtension.prefs.getValue("overWriteFieldsAutomatically",true)
                        )
                        && (!validTabPage || matchedField.formFieldPage == currentTabPage)
                        && (pageFields[i].type == matchedField.type
                            || (pageFields[i].type == "text" && matchedField.type == "username")
                            || (pageFields[i].type == "username" && matchedField.type == "text")
                           )
                       )
                    {
                        matchedValue = matchedField.value;
                        KFLog.debug("Data field "+j+" is a match for this form field");
                        break;
                    }
                }
            }
            
            if (matchedValue == "" && pageFields[i].type != "radio" && (pageFields[i].type == "select" 
                 || pageFields[i].type == "checkbox" 
                 || pageFields[i].value.length == 0 
                 || this._kf._keeFoxExtension.prefs.getValue("overWriteFieldsAutomatically",true)
               ))
            {
                KFLog.info("We could not find a good field match so just filling in this field with the first value of this type: "+pageFields[i].type);
                
                for (j = 0; j < matchFields.length; j++)
                {
                    var matchedField = 
                    matchFields.queryElementAt(j,Components.interfaces.kfILoginField);
                    
                    if (pageFields[i].type == matchedField.type
                        || (pageFields[i].type == "text" && matchedField.type == "username")
                        || (pageFields[i].type == "username" && matchedField.type == "text")
                       )
                    {
                        matchedValue = matchedField.value;
                        KFLog.debug("Data field "+j+" is a match for this form field");
                        break;
                    }
                }
            }
                
            if (matchedValue == "")
            {
                KFLog.info("We could not find a suitable match so not filling this field");
            } else
            {
                if (KFLog.logSensitiveData)
                    KFLog.info("We will populate this field with: "+matchedValue);
                else
                    KFLog.info("We will populate this field.");
                
                if (pageFields[i].type == "select")
                {
                    //TODO: select relevant form option
                    //pageFields[i].DOMSelectElement.value = matchedValue; 
                } else if (pageFields[i].type == "checkbox" || pageFields[i].type == "radio")
                {
                    pageFields[i].DOMInputElement.checked = true;
                } else
                {    
                    pageFields[i].DOMInputElement.value = matchedValue; 
                }
                
            }
        }
    };
    
//TODO: something in here may be the trigger for the deadlock bug when closing KeePass (when JS bug in this function stops it working, I've struggled to reproduce the intermittent deadlock). Top suspect is the getDatabaseName call in TB.setupButton_ready via TB.setLogins... also could have been the clipboard issue on UI update from KP? maybe that fixed it?
    /*
     * _fillDocument
     *
     * Called when a page has loaded. For each form in the document,
     * we check to see if it can be filled with a stored login.
     */
    KFILM.prototype._fillDocument = function (doc, initialPageLoad)
    {
    
        KFLog.info("Filling document");
        
        // We'll do things differently if this is a fill operation some time after the page has alread loaded (e.g. don't auto-fill or auto-submit in case we overwrite user's data)
        if ( initialPageLoad === undefined )
            initialPageLoad = false;
        
        var passwords;
        var mainWindow = doc.defaultView.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);

        if (mainWindow.content.document != doc)
        {
            var frameDoc = doc;
            if (doc.defaultView.frameElement) {
                while (frameDoc.defaultView.frameElement) {
                    frameDoc=frameDoc.defaultView.frameElement.ownerDocument;
                }
            } else
            {
                KFLog.debug("skipping document fill (this is not the currently active tab and it is not within a frame)");
                return;
            }
            
            if (mainWindow.content.document != frameDoc)
            {
                KFLog.debug("skipping document fill (this is within a frame but it is not the currently active tab)");
                return;
            }
        }

        KFLog.info("attempting document fill");
        
        var uniqueID = "";
        var logins = [];
        
        // auto fill the form by default unless a preference or tab variable tells us otherwise
        var autoFillForm = this._kf._keeFoxExtension.prefs.getValue("autoFillForms",true);
 
        // do not auto submit the form by default unless a preference or tab variable tells us otherwise
        var autoSubmitForm = this._kf._keeFoxExtension.prefs.getValue("autoSubmitForms",false);
        
        // overwrite existing username by default unless a preference or tab variable tells us otherwise
        var overWriteFieldsAutomatically = this._kf._keeFoxExtension.prefs.getValue("overWriteFieldsAutomatically",true);
        
        //TODO: maybe want to make this decision here rather than further down in some cases - risks auto-submit loop
        /*
        if (!initialPageLoad)
        {
            autoFillForm = false;
            autoSubmitForm = false;
            overWriteFieldsAutomatically = false;
        }
        */
        
        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                    .getService(Components.interfaces.nsISessionStore);
        var currentGBrowser = keeFoxToolbar._currentWindow.gBrowser;
        var topDoc = doc;
        if (doc.defaultView.frameElement) {
            while (topDoc.defaultView.frameElement) {
                topDoc=topDoc.defaultView.frameElement.ownerDocument;
            }
        }
        //var win = topDoc.defaultView;
        var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(topDoc)];
        var currentTabUniqueID = ss.getTabValue(currentTab, "KF_uniqueID");
        var numberOfTabFillsRemaining = ss.getTabValue(currentTab, "KF_numberOfTabFillsRemaining");
        var numberOfTabFillsTarget = ss.getTabValue(currentTab, "KF_numberOfTabFillsTarget");
        var currentTabPage = null;
        
        
        if (currentTabUniqueID != undefined && currentTabUniqueID != null && currentTabUniqueID != "")
        {
            KFLog.info("Found this KeePass uniqueID in the tab: " + currentTabUniqueID);
            
                
            uniqueID = currentTabUniqueID;
            
            // we want to fill the form with this data
            autoFillForm = true;
            overWriteFieldsAutomatically = true;
            
            // but need to check whether we want to autosubmit it too
            var localAutoSubmitPref = ss.getTabValue(currentTab, "KF_autoSubmit");

            if (localAutoSubmitPref != undefined && localAutoSubmitPref != null && localAutoSubmitPref == "yes")
            {
                KFLog.debug("We want to auto-submit this form.");
                autoSubmitForm = true;
            }
            
            //if (numberOfTabFillsRemaining != undefined && numberOfTabFillsRemaining != null && numberOfTabFillsRemaining.length > 0 && numberOfTabFillsRemaining <= 1)
            //{
            // Deleting these bits of info no matter what, so future uses of this tab are unaffected by previous uses.
            // (if we actually go ahead with the form fill we will add them back in then)
                ss.deleteTabValue(currentTab, "KF_uniqueID");
                ss.deleteTabValue(currentTab, "KF_autoSubmit"); // problem if this has not been set previously?
            //}
            KFLog.debug("deleted some tab values");
        }
        
        // If we have exceeded the maximum number of expected pages during this form filling session, we reset the record of those fills
        // and ensure that we don't auto-fill or auto-submit the form (chances are high that password or server fault occured)
        if (numberOfTabFillsRemaining != undefined && numberOfTabFillsRemaining != null && numberOfTabFillsRemaining.length > 0)
        {
            KFLog.info("Found this numberOfTabFillsRemaining in the tab: " + numberOfTabFillsRemaining);
            if (numberOfTabFillsRemaining == "0")
            {
                autoSubmitForm = false;
                autoFillForm = false;
                ss.deleteTabValue(currentTab, "KF_numberOfTabFillsRemaining");
                KFLog.debug("Not auto-filling or auto-submiting this form.");
                KFLog.debug("KF_numberOfTabFillsRemaining deleted");
            }
        }
        
        // If we haven't been told whether this is a multi-page login yet, we'll set relevant variables to -1
        // so that future stages of the login choosing process know we are on the first page and they need
        // to find out whether the best matching form is a multi-page login or not
        
        if ((numberOfTabFillsRemaining != undefined && numberOfTabFillsRemaining != null && numberOfTabFillsRemaining.length > 0 && numberOfTabFillsRemaining > 0) || (numberOfTabFillsTarget != undefined && numberOfTabFillsTarget != null && numberOfTabFillsTarget.length > 0 && numberOfTabFillsTarget > 0))
        {
            currentTabPage = numberOfTabFillsTarget - numberOfTabFillsRemaining + 1;
        } else
        {
            numberOfTabFillsRemaining = -1;
            numberOfTabFillsTarget = -1;
            currentTabPage = -1;
        }
        
    
        var forms = doc.forms;
        if (!forms || forms.length == 0)
        {
            KFLog.info("No forms found on this page");
            return;
        }
        
        // if we're not logged in to KeePass then we should prompt user (or not)
        if (!keeFoxInst._keeFoxStorage.get("KeeICEActive", false))
        {
            notifyBarWhenKeeICEInactive = keeFoxInst._keeFoxExtension.prefs.getValue("notifyBarWhenKeeICEInactive",false);
            
            if (notifyBarWhenKeeICEInactive && initialPageLoad)
            {
                keeFoxUI.setWindow(doc.defaultView);
                keeFoxUI.setDocument(doc);
                keeFoxUI._showLaunchKFNotification();
            }
            
            flashIconWhenKeeICEInactive = keeFoxInst._keeFoxExtension.prefs.getValue("flashIconWhenKeeICEInactive",true);
 
            if (flashIconWhenKeeICEInactive && initialPageLoad)
                keeFoxToolbar._currentWindow.setTimeout(keeFoxToolbar.flashItem, 10, keeFoxToolbar._currentWindow.document.getElementById('KeeFox_Main-Button'), 12, keeFoxToolbar._currentWindow);
            return;
        } else if (!keeFoxInst._keeFoxStorage.get("KeePassDatabaseOpen", false))
        {
            notifyBarWhenLoggedOut = keeFoxInst._keeFoxExtension.prefs.getValue("notifyBarWhenLoggedOut",false);
            
            if (notifyBarWhenLoggedOut && initialPageLoad)
            {
                keeFoxUI.setWindow(doc.defaultView);
                keeFoxUI.setDocument(doc);
                keeFoxUI._showLoginToKFNotification();
            }
            
            flashIconWhenLoggedOut = keeFoxInst._keeFoxExtension.prefs.getValue("flashIconWhenLoggedOut",true);
            
            if (flashIconWhenLoggedOut && initialPageLoad)
                keeFoxToolbar._currentWindow.setTimeout(keeFoxToolbar.flashItem, 10, keeFoxToolbar._currentWindow.document.getElementById('KeeFox_Main-Button'), 12, keeFoxToolbar._currentWindow);
            return;
        }

        var formOrigin = this._getURIHostAndPort(doc.documentURI);

        // If there are no logins for this site, bail out now.
        if (!this.countLogins(formOrigin, "", null))
        {
            KFLog.info("No logins found for this site");
            return;
        }

        if (KFLog.logSensitiveData)
            KFLog.debug("fillDocument processing " + forms.length +
                 " forms on " + doc.documentURI);
        else
            KFLog.debug("fillDocument processing " + forms.length + " forms");

        var previousActionOrigin = null;
        var formsReadyForSubmit = 0; // tracks how many forms we auto-fill on this page
        
        var allMatchingLogins = [];
        var formToAutoSubmit;
        var formRelevanceScores = [];
        var usernameIndexArray = [];
        var passwordFieldsArray = [];
        var otherFieldsArray = [];

        for (var i = 0; i < forms.length; i++) {
            var form = forms[i];
            logins[i] = [];

            // the overall relevance of this form is the maximum of it's
            // matching entries (so we fill the most relevant form)
            formRelevanceScores[i] = 0;
            
            var [usernameIndex, passwordFields, otherFields] =
                this._getFormFields(form, false);
                
            //var passwordField = null;
            
            //TODO: remove this restriction as long as we don't get problems with search fields, etc.
            // maybe only if we are doing a multi-page login?
            if (passwordFields == null || passwordFields.length <= 0 || passwordFields[0] == null)
            {
            //    this.log("pwfound");
            //    passwordField = passwords[0].element;
            //    }
                
            // Need a valid password field to do anything.
            //if (passwordField == null || passwordField == undefined)
            //{
                KFLog.debug("no password field found in this form");
                continue;
            }

            // Only the actionOrigin might be changing, so if it's the same
            // as the last form on the page we can reuse the same logins.
            var actionOrigin = this._getURIHostAndPort(this._getActionOrigin(form));
            if (actionOrigin != previousActionOrigin) {
                var foundLogins =
                    this.findLogins({}, formOrigin, actionOrigin, null);

                KFLog.info("form[" + i + "]: found " + foundLogins.length +
                        " matching logins.");

                previousActionOrigin = actionOrigin;
            } else {
                KFLog.info("form[" + i + "]: reusing logins from last form.");
            }

/* this bit needs to be re-worked for multi-password and multi-page situations but skipping it for now since it's not essential...
            // Discard logins which have username/password values that don't
            // fit into the fields (as specified by the maxlength attribute).
            // The user couldn't enter these values anyway, and it helps
            // with sites that have an extra PIN to be entered (bug 391514)
            var maxUsernameLen = Number.MAX_VALUE;
            var maxPasswordLen = Number.MAX_VALUE;

            // If attribute wasn't set, default is -1.
            if (usernameField && usernameField.maxLength >= 0)
                maxUsernameLen = usernameField.maxLength;
            if (passwordField.maxLength >= 0)
                maxPasswordLen = passwordField.maxLength;

            logins[i] = foundLogins.filter(function (l) {
                    var fit = (l.username.length <= maxUsernameLen &&
                               l.password.length <= maxPasswordLen);
                    if (!fit)
                        this.log("Ignored " + l.username + " login: won't fit");

                    return fit;
                }, this);
*/
            logins[i] = foundLogins;

            // Nothing to do if we have no matching logins available.
            if (logins[i].length == 0)
                continue;
            
            KFLog.info("match found!");
            
            usernameIndexArray[i] = usernameIndex;
            passwordFieldsArray[i] = passwordFields;
            otherFieldsArray[i] = otherFields;
            
            // determine the relevance of each login entry to this form
            // we could skip this when autofilling based on uniqueID but we would have to check for
            // matches first or else we risk no match and no alternative matching logins on the toolbar
           for (var v = 0; v < logins[i].length; v++)
            logins[i][v].relevanceScore = this._calculateRelevanceScore (logins[i][v],form,usernameIndex,passwordFields, currentTabPage);
            
            logins[i].forEach(function(c) { if (c.relevanceScore > formRelevanceScores[i])
                                            formRelevanceScores[i] = c.relevanceScore; } );
             KFLog.debug("RRRRelevance of form is " + formRelevanceScores[i]);
            // only remember the logins which are not already in our list of matching logins
            var newUniqueLogins = logins[i].filter(function(d) {
                                                //matchingLogin = l;
                                                return (allMatchingLogins.every(function(e) {
                                                    //matchingLogin = l;
                                                    return (d.uniqueid != e.uniqueid);
                                                }));
                                            });
            allMatchingLogins = allMatchingLogins.concat(newUniqueLogins);
            
            
        }  // end of form for loop
        
        var mostRelevantFormIndex = 0;
        formRelevanceScores.forEach(function(c, index) { KFLog.debug("Relevance of form is " + c); if (c > formRelevanceScores[mostRelevantFormIndex])
                                            mostRelevantFormIndex = index; } );
        
        KFLog.debug("The most relevant form is #" + mostRelevantFormIndex);
        
        // from now on we concentrate on just the most relevant form and the fields we found earlier
        form = forms[mostRelevantFormIndex];
        var passwordFields = passwordFieldsArray[mostRelevantFormIndex];
        var usernameIndex = usernameIndexArray[mostRelevantFormIndex];
        var otherFields = otherFieldsArray[mostRelevantFormIndex];
        
        // this records the login that we eventually choose as the one to fill the chosen form from
        var matchingLogin;
        
        // If this is a "refill" we won't auto-fill/complete/overwrite.
        if (!initialPageLoad)
        {
            autoFillForm = false;
            autoSubmitForm = false;
            overWriteFieldsAutomatically = false;
            KFLog.debug("Not auto-filling or auto-submiting this form. Not overwriting exsisting contents either.");
        }

        if (autoFillForm) {

            // first, if we have been instructed to load a specific login on this page, do that
            //TODO: this may not work if requested login can't be exactly matched to a form but another login can
            if (uniqueID.length > 0)
            {
                
                var found = logins[mostRelevantFormIndex].some(function(l) {
                                            matchingLogin = l;
                                            return (l.uniqueID == uniqueID);
                                        });
                if (found)
                {
                    //if (usernameField && matchingLogin.username != null)
                    //    usernameField.DOMelement.value = matchingLogin.username.value;
                    this._fillManyFormFields(passwordFields, matchingLogin.passwords, currentTabPage);
                    this._fillManyFormFields(otherFields, matchingLogin.otherFields, currentTabPage);
                    formsReadyForSubmit++;
                }
                else
                {
                    KFLog.info("Password not filled. None of the stored " +
                             "logins match the uniqueID provided. Maybe it is not this form we want to fill...");
                }
            
            //TODO: I don't think this works correctly... 
            } /* TODO: This is utter rubbish. Needs completely re-writing but in the mean-time only down side is the do not overwrite logins option does not work.
            
            else if (!overWriteFieldsAutomatically && logins[mostRelevantFormIndex][usernameIndex] && logins[mostRelevantFormIndex][usernameIndex].value) {
                // If username was specified in the form, only fill in the
                // password if we find a matching login.

                var username = logins[mostRelevantFormIndex][usernameIndex].value;
                
                this.log("username found: " + logins[mostRelevantFormIndex][usernameIndex].value);

                //var matchingLogin;
                //var found = logins[mostRelevantFormIndex].some(function(l) {
                //                            matchingLogin = l;
                //                            return (l.username != null && l.username.value == username);
                // 
                //});
                
                //TODO: this can't be working correctly...                       
                if (logins[mostRelevantFormIndex][usernameIndex] == username)
                {
                    this._fillManyFormFields(passwordFields, matchingLogin.passwords, currentTabPage);
                    this._fillManyFormFields(otherFields, matchingLogin.otherFields, currentTabPage);
                    formsReadyForSubmit++;
                }
                else
                {
                    this.log("Password not filled. None of the stored " +
                             "logins match the username already present.");
                }
             }*/
            
            //TODO: more scope to improve here - control over default login to autofill rather than just pick the first?
            
            else if (logins[mostRelevantFormIndex].length == 1) {
                //if (usernameField && logins[mostRelevantFormIndex][0].username!= null)
                //    usernameField.DOMelement.value = logins[mostRelevantFormIndex][0].username.value;
                this._fillManyFormFields(passwordFields, logins[mostRelevantFormIndex][0].passwords, currentTabPage);
                this._fillManyFormFields(otherFields, logins[mostRelevantFormIndex][0].otherFields, currentTabPage);
                formsReadyForSubmit++;
                matchingLogin = logins[mostRelevantFormIndex][0];
            } else {
                KFLog.debug("Multiple logins for form, so estimating most relevant.");
                var mostRelevantLoginIndex = 0;
                
                for (var count = 0; count < logins[mostRelevantFormIndex].length; count++)
                    if (logins[mostRelevantFormIndex][count].relevanceScore > logins[mostRelevantFormIndex][mostRelevantLoginIndex].relevanceScore)
                        mostRelevantLoginIndex = count;
                    
                KFLog.info("We think login " + mostRelevantLoginIndex + " is most relevant.");
                    
                this._fillManyFormFields(passwordFields, logins[mostRelevantFormIndex][mostRelevantLoginIndex].passwords, currentTabPage); //TODO: sometimes undefined: logins[mostRelevantFormIndex][mostRelevantLoginIndex]
                this._fillManyFormFields(otherFields, logins[mostRelevantFormIndex][mostRelevantLoginIndex].otherFields, currentTabPage);
                formsReadyForSubmit++;
                matchingLogin = logins[mostRelevantFormIndex][mostRelevantLoginIndex];
            }
            
        }

        // record / update the info attached to this tab regarding the number of pages of forms we want to fill in
        // NB: we do this even if we know this is a single form submission becauase then if the user gets dumped
        // back to the form (password error?) then we know not to auto-submit again and get stuck in a loop
        
        // We only do this if any forms were auto-filled successfully (filling via the "matched logins" toolbar button
        // could result in these values being recalculated anyway so no point in wasting time here)
        if (formsReadyForSubmit >= 1)
        {
            // first we make sure we have some valid values to start with - i.e. if this was a stnadard page load
            // then we need to assign the page details from the best login match
            if (currentTabPage < 0)
            {
                var maximumPageCount = 1;
                for (var i = 0; i < matchingLogin.passwords.length; i++)
                {
                    var passField = 
                        matchingLogin.passwords.queryElementAt(i,Components.interfaces.kfILoginField);
                    if (passField.formFieldPage > maximumPageCount)
                        maximumPageCount = passField.formFieldPage;
                }
                for (var i = 0; i < matchingLogin.otherFields.length; i++)
                {
                    var otherField = 
                        matchingLogin.otherFields.queryElementAt(i,Components.interfaces.kfILoginField);
                    if (otherField.formFieldPage > maximumPageCount)
                        maximumPageCount = otherField.formFieldPage;
                }
                numberOfTabFillsRemaining = maximumPageCount;
                numberOfTabFillsTarget = maximumPageCount;
            }
           
            //consume one of our permitted form fills (because next time we read
            // this value it will be as the next page is loading)
            numberOfTabFillsRemaining -= 1;
            if (numberOfTabFillsRemaining < 0)
                numberOfTabFillsRemaining = 0;
            
            // next we update (or set for the first time) the values attached to this tab
            ss.setTabValue(currentTab, "KF_numberOfTabFillsRemaining", numberOfTabFillsRemaining);
            ss.setTabValue(currentTab, "KF_numberOfTabFillsTarget", numberOfTabFillsTarget);
            KFLog.debug("Set KF_numberOfTabFillsRemaining to: " + numberOfTabFillsRemaining);
            KFLog.debug("Set KF_numberOfTabFillsTarget to: " + numberOfTabFillsTarget);
            
            // if we didn't already define a uniqueID, we set it up now
            if (uniqueID == undefined || uniqueID == null || uniqueID == "")
            {
                uniqueID = matchingLogin.uniqueID;
            }
            
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
                if (passField.DOMInputElement != null)
                {
                    passField.DOMInputElement.setAttribute("onchange","var evt = document.createEvent('Events'); evt.initEvent('KeeFoxClearTabFormFillData', true, false); this.dispatchEvent(evt);");
                }
            }
            
            for (var i = 0; i < otherFields.length; i++)
            {
                var otherField = otherFields[i];
                if (otherField.DOMInputElement != null)
                {
                    otherField.DOMInputElement.setAttribute("onchange","var evt = document.createEvent('Events'); evt.initEvent('KeeFoxClearTabFormFillData', true, false); this.dispatchEvent(evt);");
                } else if (otherField.DOMSelectElement != null)
                {
                    otherField.DOMSelectElement.setAttribute("onchange","var evt = document.createEvent('Events'); evt.initEvent('KeeFoxClearTabFormFillData', true, false); this.dispatchEvent(evt);");
                }
            }
        }
        
        // if we know we are only interested in filling one specific uniqueID or that
        // we have knowledge of whether we want to autofill when the next page is
        // loaded then we can (re)populate these values now
        if (uniqueID != undefined && uniqueID != null && uniqueID != "")
        {
            ss.setTabValue(currentTab, "KF_autoSubmit", "yes");
            ss.setTabValue(currentTab, "KF_uniqueID", uniqueID);
            KFLog.debug("Set KF_autoSubmit to: yes");
            KFLog.debug("Set KF_uniqueID to: " + uniqueID);
        }
        
        if (autoSubmitForm && formsReadyForSubmit == 1)
        {
        //  for (var j = 0; j < form.elements.length; j++) {
        //      alert(formToAutoSubmit.elements[j].value);
        //  }

            KFLog.info("Auto-submitting form...");
            form.submit();
        } else if (allMatchingLogins.length > 0)
        {
            KFLog.info("Using toolbar password fill.");
            this._toolbar.setLogins(allMatchingLogins, doc);
        } else 
        {
            KFLog.info("Nothing to fill.");
        }
    };
    
    // login to be used is indentified via KeePass uniqueID (GUID)
    // actionURL and other fields help identify which form we should submit to
    // TODO: we previously calculated the preferred form when the page loaded so maybe we
    // should pass along that information and use it to decide which form to submit to?
    // OTOH this would perclude the user from over-riding the automatic form choice in 
    // situations where it makes an incorrect decision.
    // TODO: handle situations where forms fields have dissapeared in the mean time.
    // TODO: formID innacurate (so not used yet)
    // TODO: extend so more than one form can be filled, with option to automatically submit
    // form that matches most accuratly (currently we just pick the first match - this may not be ideal)
KFILM.prototype.fill = function (usernameName,usernameValue,actionURL,usernameID,formID,uniqueID,docURI) {
        if (KFLog.logSensitiveData)
            KFLog.info("fill login details from username field: " + usernameName + ":" + usernameValue);
        else
            KFLog.info("fill login details");
        
        var doc = this._findDocumentByURI(Application.activeWindow.activeTab.document.defaultView, docURI);

        var form;
        var usernameField;
        var usernameIndex;
        var passwordField;
        var ignored;
        var passwords;
        var otherFields;
        
        var autoSubmitForm = this._kf._keeFoxExtension.prefs.getValue("autoSubmitMatchedForms",true);
        
        if ((form == undefined || form == null) && usernameID != null && usernameID.length > 0)
        {
            usernameField = doc.getElementById(usernameID);
            
            if (usernameField != null)
            {
                form = usernameField.form;
                [usernameIndex, passwords, otherFields] = this._getFormFields(form, false, 1);
            }
            
        }
        
        if (form == undefined || form == null)
        {
            for (var i = 0; i < doc.forms.length; i++) {
                var formi = doc.forms[i];
                
                // only fill in forms that match the host and port of the selected login
                // and only if the scheme is the same (i.e. don't submit to http forms when https was expected)
                if (!(actionURL != undefined && actionURL != null && actionURL.length > 0) || this._getURISchemeHostAndPort(this._getActionOrigin(formi)) == this._getURISchemeHostAndPort(actionURL))                {
                    form = formi;
                    [usernameIndex, passwords, otherFields] = this._getFormFields(form, false, 1);
                    
                    if (passwords == null || passwords.length == 0)
                        continue;
                    
                    //var passwordField = passwords[0].element;
                    break;
                }
            }
            
        }
        
        if (passwords == null || passwords.length == 0)
        {
            //TODO: can we improve here so that forms without password fields can also be handled?
            KFLog.info("Can't find any form with a password field. This could indicate that this page uses some odd javascript to delete forms dynamically after the page has loaded.");
            return;
        }

        var URL = this._getPasswordOrigin(doc.documentURI);
        
        var title = doc.title;
        
        // Look for a existing login and use its password.
        var match = null;
        var logins = this.findLogins({}, URL, actionURL, null, uniqueID);
        KFLog.info("Found " + logins.length + " logins.");
        
        // Ensure the entry has not been deleted between page load and fill request
        if (uniqueID && logins.length == 1)
        {
            match = logins[0];
        }
        
        if (match == null)
        {
            KFLog.warn("Can't find a login for this matched login fill request.");
            return;
        }

        KFLog.debug("Found a matching login, filling in passwords, etc.");
            
        this._fillManyFormFields(passwords, match.passwords, 1);
        this._fillManyFormFields(otherFields, match.otherFields, 1);

        // Attach information to this tab which describes what we know about the number of pages this form covers
        // this allows us to automatically submit multiple page forms with one click and helps avoid repeating
        // loops of form submission in case the password is rejected.
        var maximumPageCount = 1;
        
        for (var i = 0; i < match.passwords.length; i++)
        {
            var passField = 
                match.passwords.queryElementAt(i,Components.interfaces.kfILoginField);
            if (passField.formFieldPage > maximumPageCount)
                maximumPageCount = passField.formFieldPage;
        }
        for (var i = 0; i < match.otherFields.length; i++)
        {
            var otherField = 
                match.otherFields.queryElementAt(i,Components.interfaces.kfILoginField);
            if (otherField.formFieldPage > maximumPageCount)
                maximumPageCount = otherField.formFieldPage;
        }
        
        var numberOfTabFillsRemaining = maximumPageCount - 1;
        var numberOfTabFillsTarget = maximumPageCount;
        
        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                    .getService(Components.interfaces.nsISessionStore);
        var currentGBrowser = keeFoxToolbar._currentWindow.gBrowser;
        var topDoc = doc;
        if (doc.defaultView.frameElement) {
            while (topDoc.defaultView.frameElement) {
                topDoc=topDoc.defaultView.frameElement.ownerDocument;
            }
        }
        //var win = topDoc.defaultView;
        var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(topDoc)];
        
        ss.setTabValue(currentTab, "KF_numberOfTabFillsRemaining", numberOfTabFillsRemaining);
        ss.setTabValue(currentTab, "KF_numberOfTabFillsTarget", numberOfTabFillsTarget);
        ss.setTabValue(currentTab, "KF_autoSubmit", "yes");
        ss.setTabValue(currentTab, "KF_uniqueID", uniqueID);
        KFLog.debug("Set KF_numberOfTabFillsRemaining to: " + numberOfTabFillsRemaining);
        KFLog.debug("Set KF_numberOfTabFillsTarget to: " + numberOfTabFillsTarget);
        KFLog.debug("Set KF_autoSubmit to: yes");
        KFLog.debug("Set KF_uniqueID to: " + uniqueID);
        
        // now we can submit the form (or just leave it up to the user if that is their preference)    
        if (autoSubmitForm)
            form.submit();
    };
    
    
    KFILM.prototype._fillAllFrames = function (window, initialPageLoad)
    {
        this._fillDocument(window.document,false);
        
        if (window.frames.length > 0)
        {
            KFLog.debug("Filling " + window.frames.length + " sub frames");
            var frames = window.frames;
            for (var i = 0; i < frames.length; i++) { 
              this._fillAllFrames (frames[i], initialPageLoad);
            }
        }
        
    };
    
    KFILM.prototype._findDocumentByURI = function (window, URI)
    {

        if (window.frames.length > 0)
        {
            KFLog.debug("Searching through " + window.frames.length + " sub frames");
            var frames = window.frames;
            for (var i = 0; i < frames.length; i++) { 
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
        
   
   
   