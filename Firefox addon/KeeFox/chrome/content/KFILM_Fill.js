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



    KFILM.prototype._fillManyFormFields = function (pageFields, matchFields)
    {
        this.log("_fillManyFormFields started");
        
        if (pageFields == null || pageFields == undefined || matchFields == null || matchFields == undefined)
            return;
        
        this.log("We've received the data we need");
        
        for (i = 0; i < pageFields.length; i++)
        {
            matchedValue = "";
            
            this.log("Trying to find suitable data field match based on form field "+i+"'s id");
            
            for (j = 0; j < matchFields.length; j++)
            {
                // Unfortunately the container is decared to have elements
                // that are generic nsIMutableArray. So, we must QI...
                var matchedField = 
                matchFields.queryElementAt(j,Components.interfaces.kfILoginField);
                
                if (pageFields[i].id != null && pageFields[i].id != undefined && pageFields[i].id == matchedField.fieldId && (pageFields[i].value.length == 0 || this._kf._keeFoxExtension.prefs.getValue("overWriteUsernameAutomatically",true)))
                {
                    matchedValue = matchedField.value;
                    this.log("Data field "+j+" is a match for this form field");
                    break;
                }
            }
            
            if (matchedValue == "")
            {
                this.log("We didn't find a match so trying to match by form field name");
                for (j = 0; j < matchFields.length; j++)
                {
                    var matchedField = 
                    matchFields.queryElementAt(j,Components.interfaces.kfILoginField);
                    
                    if (pageFields[i].name != null && pageFields[i].name != undefined && pageFields[i].name == matchedField.name && (pageFields[i].value.length == 0 || this._kf._keeFoxExtension.prefs.getValue("overWriteUsernameAutomatically",true)))
                    {
                        matchedValue = matchedField.value;
                        this.log("Data field "+j+" is a match for this form field");
                        break;
                    }
                }
            }
            
            if (matchedValue == "")
            {
                var matchedField = 
                    matchFields.queryElementAt(0,Components.interfaces.kfILoginField);
                this.log("We could not find a good field match so just filling in this field with the first value we find: "+matchedValue);
                    
                pageFields[i].DOMelement.value = matchedField.value;   
            } else
            {
                this.log("We will populate this field with: "+matchedValue);
                pageFields[i].DOMelement.value = matchedValue; 
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
            this.log("skipping document fill (this is not the currently active tab)");
            return;
        }

        this.log("attempting document fill");
        
        var uniqueID = "";
        var logins = [];
        
        // auto fill the form by default unless a preference or tab variable tells us otherwise
        var autoFillForm = this._kf._keeFoxExtension.prefs.getValue("autoFillForms",true);
        if (!initialPageLoad)
            autoFillForm = false;
        
        // do not auto submit the form by default unless a preference or tab variable tells us otherwise
        var autoSubmitForm = this._kf._keeFoxExtension.prefs.getValue("autoSubmitForms",false);
        if (!initialPageLoad)
            autoSubmitForm = false;
        
        // overwrite existing username by default unless a preference or tab variable tells us otherwise
        var overWriteUsernameAutomatically = this._kf._keeFoxExtension.prefs.getValue("overWriteUsernameAutomatically",true);
        if (!initialPageLoad)
            overWriteUsernameAutomatically = false;
        
        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                    .getService(Components.interfaces.nsISessionStore);
        var currentGBrowser = keeFoxToolbar._currentWindow.gBrowser;
        var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(doc)];
        var retrievedData = ss.getTabValue(currentTab, "KF_uniqueID");
        var numberOfTabFillsRemaining = ss.getTabValue(currentTab, "KF_numberOfTabFillsRemaining");
        
        // If we have exceeded the maximum number of expected pages during this form filling session, we reset the record of those fills
        // and ensure that we don't auto-fill or auto-submit the form (chances are high that password or server fault occured)
        if (numberOfTabFillsRemaining != undefined && numberOfTabFillsRemaining != null && numberOfTabFillsRemaining.length > 0)
        {
            this.log("Found this numberOfTabFillsRemaining in the tab: " + numberOfTabFillsRemaining);
            if (numberOfTabFillsRemaining == "0")
            {
                autoSubmitForm = false;
                autoFillForm = false;
                ss.deleteTabValue(currentTab, "KF_numberOfTabFillsRemaining");
            }
        }
        
        if (retrievedData != undefined && retrievedData != null && retrievedData != "")
        {
            this.log("Found this KeePass uniqueID in the tab: " + retrievedData);
            ss.deleteTabValue(currentTab, "KF_uniqueID"); //TODO: for multi-page logins, will need to do this selectively based on number of fills remaining
            uniqueID = retrievedData;
            
            // we definitely want to fill the form with this data
            autoFillForm = true;
            overWriteUsernameAutomatically = true;
            
            // but need to check whether we want to autosubmit it too
            var localAutoSubmitPref = ss.getTabValue(currentTab, "KF_autoSubmit");

            if (localAutoSubmitPref != undefined && localAutoSubmitPref != null && localAutoSubmitPref == "yes")
            {
                this.log("We want to auto-submit this form.");
                autoSubmitForm = true;
            }
        }
    
        var forms = doc.forms;
        if (!forms || forms.length == 0)
        {
            this.log("No forms found on this page");
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
            this.log("No logins found for this site");
            return;
        }

        this.log("fillDocument processing " + forms.length +
                 " forms on " + doc.documentURI);

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
            var loginRelevanceScores = [];
            logins[i] = [];
            
            this.log("test:"+i);

            var [usernameIndex, passwordFields, otherFields] =
                this._getFormFields(form, false);
                
            //var passwordField = null;
            
            if (passwordFields == null || passwordFields.length <= 0 || passwordFields[0] == null)
            {
            //    this.log("pwfound");
            //    passwordField = passwords[0].element;
            //    }
                
            // Need a valid password field to do anything.
            //if (passwordField == null || passwordField == undefined)
            //{
                this.log("no password field found in this form");
                continue;
            }

            // Only the actionOrigin might be changing, so if it's the same
            // as the last form on the page we can reuse the same logins.
            var actionOrigin = this._getURIHostAndPort(this._getActionOrigin(form));
            if (actionOrigin != previousActionOrigin) {
                var foundLogins =
                    this.findLogins({}, formOrigin, actionOrigin, null);

                this.log("form[" + i + "]: found " + foundLogins.length +
                        " matching logins.");

                previousActionOrigin = actionOrigin;
            } else {
                this.log("form[" + i + "]: reusing logins from last form.");
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
            
            this.log("match found!");
            
            usernameIndexArray[i] = usernameIndex;
            passwordFieldsArray[i] = passwordFields;
            otherFieldsArray[i] = otherFields;
            
            // determine the relevance of each login entry to this form
            // we could skip this when autofilling based on uniqueID but we would have to check for
            // matches first or else we risk no match and no alternative matching logins on the toolbar
           for (var v = 0; v < logins[i].length; v++)
            logins[i][v].relevanceScore = this._calculateRelevanceScore (logins[i][v],form,usernameIndex,passwordFields);
            
            // the overall relevance of this form is the maximum of it's matching entries (so we fill the most relevant form)
            formRelevanceScores[i] = 0;
            logins[i].forEach(function(c) { if (c.relevanceScore > formRelevanceScores[i])
                                            formRelevanceScores[i] = c.relevanceScore; } );
             
            // only remember the logins which are not already in our list of matching logins
            // (not sure yet if this will happen in a completely bug free final version - it depends on how I design the comparison of form action URL - but it's handy in my currently buggy version anyway!)
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
        formRelevanceScores.forEach(function(c) { if (c.relevanceScore > formRelevanceScores[mostRelevantFormIndex])
                                            mostRelevantFormIndex = index; } );
        
        // from now on we concentrate on just the most relevant form and the fields we found earlier
        form = forms[mostRelevantFormIndex];
        var passwordFields = passwordFieldsArray[mostRelevantFormIndex];
        var usernameIndex = usernameIndexArray[mostRelevantFormIndex];
        var otherFields = otherFieldsArray[mostRelevantFormIndex];

        if (autoFillForm) {

            // first, if we have been instructed to load a specific login on this page, do that
            //TODO: this may not work if requested login can't be exactly matched to a form but another login can
            if (uniqueID.length > 0)
            {
                var matchingLogin;
                var found = logins[mostRelevantFormIndex].some(function(l) {
                                            matchingLogin = l;
                                            return (l.uniqueID == uniqueID);
                                        });
                if (found)
                {
                    //if (usernameField && matchingLogin.username != null)
                    //    usernameField.DOMelement.value = matchingLogin.username.value;
                    this._fillManyFormFields(passwordFields, matchingLogin.passwords);
                    this._fillManyFormFields(otherFields, matchingLogin.otherFields);
                    formsReadyForSubmit++;
                }
                else
                {
                    this.log("Password not filled. None of the stored " +
                             "logins match the uniqueID provided. Maybe it is not this form we want to fill...");
                }
            
            } else if (!overWriteUsernameAutomatically && logins[mostRelevantFormIndex][usernameIndex] && logins[mostRelevantFormIndex][usernameIndex].value) {
                // If username was specified in the form, only fill in the
                // password if we find a matching login.

                var username = logins[mostRelevantFormIndex][usernameIndex].value;
                
                this.log("username found: " + logins[mostRelevantFormIndex][usernameIndex].value);

                var matchingLogin;
                //var found = logins[mostRelevantFormIndex].some(function(l) {
                //                            matchingLogin = l;
                //                            return (l.username != null && l.username.value == username);
                //                        });
                if (logins[mostRelevantFormIndex][usernameIndex] == username)
                {
                    this._fillManyFormFields(passwordFields, matchingLogin.passwords);
                    this._fillManyFormFields(otherFields, matchingLogin.otherFields);
                    formsReadyForSubmit++;
                }
                else
                {
                    this.log("Password not filled. None of the stored " +
                             "logins match the username already present.");
                }
             }
            
            //TODO: more scope to improve here - control over default login to autofill rather than just pick the first?
            
            else if (logins[mostRelevantFormIndex].length == 1) {
                //if (usernameField && logins[mostRelevantFormIndex][0].username!= null)
                //    usernameField.DOMelement.value = logins[mostRelevantFormIndex][0].username.value;
                this._fillManyFormFields(passwordFields, logins[mostRelevantFormIndex][0].passwords);
                this._fillManyFormFields(otherFields, logins[mostRelevantFormIndex][0].otherFields);
                formsReadyForSubmit++;
            } else {
                this.log("Multiple logins for form, so estimating most relevant.");
                var mostRelevantLoginIndex = 0;
                
                for (var count = 0; count < logins[mostRelevantFormIndex].length; count++)
                    if (logins[mostRelevantFormIndex][count].relevanceScore > logins[mostRelevantFormIndex][mostRelevantLoginIndex].relevanceScore)
                        mostRelevantLoginIndex = count;
                    
                this.log("We think login " + mostRelevantLoginIndex + " is most relevant.");
                    
                //if (usernameField && logins[mostRelevantFormIndex][mostRelevantLoginIndex].username != null)
                //    usernameField.DOMelement.value = logins[mostRelevantFormIndex][mostRelevantLoginIndex].username.value;
                this._fillManyFormFields(passwordFields, logins[mostRelevantFormIndex][mostRelevantLoginIndex].passwords);
                this._fillManyFormFields(otherFields, logins[mostRelevantFormIndex][mostRelevantLoginIndex].otherFields);
                formsReadyForSubmit++;
                    
            }
            
        }
       
        //alert(passwordField.value);
       
        // if any forms were auto-filled successfully, consume one of our permitted form fills
        if (formsReadyForSubmit >= 1)
            ss.setTabValue(currentTab, "KF_numberOfTabFillsRemaining", "0"); //TODO: number of pages expected for this login - 1
        
        if (autoSubmitForm && formsReadyForSubmit == 1)
        {
        //  for (var j = 0; j < form.elements.length; j++) {
        //      alert(formToAutoSubmit.elements[j].value);
        //  }

            this.log("Auto-submitting form...");
            form.submit();
        } else
        {
            this.log("Using toolbar password fill.");

            this._toolbar.setLogins(allMatchingLogins);
        } 
    };
    
    // login to be used is indentified via KeePass uniqueID (GUID)
    // TODO: handle situations where either forms fields or logins have dissapeared in the mean time.
    // TODO: formID innacurate (so not used yet)
    // TODO: extend so more than one form can be filled, with option to automatically submit form that matches most accuratly
KFILM.prototype.fill = function (usernameName,usernameValue,actionURL,usernameID,formID,uniqueID) {
        this.log("fill login details from username field: " + usernameName + ":" + usernameValue);
        
        var doc = Application.activeWindow.activeTab.document;
        
        var form;
        var usernameField;
        var usernameIndex;
        var passwordField;
        var ignored;
        
        var autoSubmitForm = this._kf._keeFoxExtension.prefs.getValue("autoSubmitMatchedForms",true);
        
        if ((form == undefined || form == null) && usernameID != null)
        {
            usernameField = doc.getElementById(usernameID);
            
            if (usernameField != null)
            {
                form = usernameField.form;
                [usernameIndex, passwords, otherFields] = this._getFormFields(form, false);
            }
        }
        
        if (form == undefined || form == null)
        {this.log("0");
            for (var i = 0; i < doc.forms.length; i++) {
                var formi = doc.forms[i];
                //this.log("1:"+actionURL+":"+this._getActionOrigin(formi));
                
                // only fill in forms that match the host and port of the selected login
                // and only if the scheme is the same (i.e. don't submit to http forms when https was expected)
                if (this._getURISchemeHostAndPort(this._getActionOrigin(formi)) == this._getURISchemeHostAndPort(actionURL))                {
                    form = formi;
                    [usernameIndex, passwords, otherFields] = this._getFormFields(form, false);
                    
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
            this.log("Can't find any form with a password field. This could indicate that this page uses some odd javascript to delete forms dynamically after the page has loaded.");
            return;
        }

        var URL = this._getPasswordOrigin(doc.documentURI);
        
        var title = doc.title;
        
        // NB: lots of commented bits below are hangover from before uniqueIDs were used
        // shouldn't need to keep them for very long...
        
        /*
        // Temporary LoginInfo with the info we know.
        var currentLogin = new this._kfLoginInfo();
        this.log("titleA:"+title);
        currentLogin.init(URL, actionURL, null,
                          usernameValue, null,
                          (usernameField ? usernameField.name  : ""),
                          passwordField.name, uniqueID, title);
        */
        
        // Look for a existing login and use its password.
        var match = null;
        var logins = this.findLogins({}, URL, actionURL, null, uniqueID);
        this.log(logins.length);
        this.log(logins[0]);
        
        if (uniqueID && logins.length == 1)
        {
            match = logins[0];
        }/* else
        {
            for (var i=0; i < logins.length; i++)
            {
                if (currentLogin.matches(logins[i], true, false, false))
                {
                    match = logins[i];
                    this.log(logins[i]);
                    break;
                }
            }
        }*/
        
        if (match == null)
        {
            this.log("Can't find a login for this autocomplete result.");
            return;
        }

        this.log("Found a matching login, filling in passwords, etc.");
            
        // for both passwords and all other fields, go through every element on the page form
        // and match against the database contents in this order:
        // id
        // name
        // if neither matches, just choose the first database result
        this._fillManyFormFields(passwords, match.passwords);
        this._fillManyFormFields(otherFields, match.otherFields);
            
        if (autoSubmitForm)
            form.submit();
    };
   
   
   