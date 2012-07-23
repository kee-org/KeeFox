/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2011 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the javascript file containing functions directly used to handle submitted forms.
  It appends functions onto the KFILM object defined in KFILM.js
  
  Little bits of the code is based on Mozilla's nsLoginManager.js, used under
  GPL 2.0 terms.

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

let Cu = Components.utils;

Cu.import("resource://kfmod/kfDataModel.js");

/*
 * _onFormSubmit
 *
 * Called by the our observer when notified of a form submission.
 * [Note that this happens before any DOM onsubmit handlers are invoked.]
 * Looks for a password change in the submitted form, so we can update
 * our stored password.
 */
KFILM.prototype._onFormSubmit = function (form)
{
    KFLog.info("Form submit handler started");
    
    //do nothing if KeePass is not connected
    if (!keeFoxInst._keeFoxStorage.get("KeePassRPCActive", false) || !keeFoxInst._keeFoxStorage.get("KeePassDatabaseOpen", false))
    {
        KFLog.info("Form submit handler skipped (no active KeePass database available)");
        return;
    }

    var doc = form.ownerDocument;
    var win = doc.defaultView;

    var URL = this._getPasswordOrigin(doc.documentURI);
    if (KFLog.logSensitiveData) KFLog.info("URL: " + URL);
    var formActionURL = this._getActionOrigin(form);
    var title = doc.title;
    var isPasswordChangeForm = false;
    var isRegistrationForm = false;
    
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
             .getService(Components.interfaces.nsISessionStore);
    var currentGBrowser = keefox_org.toolbar._currentWindow.gBrowser;
    var topDoc = doc;
    if (doc.defaultView.frameElement)
        while (topDoc.defaultView.frameElement)
            topDoc=topDoc.defaultView.frameElement.ownerDocument;

    var tabIndex = currentGBrowser.getBrowserIndexForDocument(topDoc);
    if (tabIndex == undefined || tabIndex == null || tabIndex < 0)
    {
        KFLog.error("Invalid tab index for current document.");
        return;
    }
    
    var currentTab = currentGBrowser.mTabs[tabIndex];
    
    // under no circumstances will we cancel the form
    // submit so we can set this value now to help us 
    // track when pages are being navigated without form
    // submissions and hence aid automatic cancellation
    // of multi-page login forms 
    ss.setTabValue(currentTab, "KF_formSubmitTrackerCount", 1);
    ss.setTabValue(currentTab, "KF_pageLoadSinceSubmitTrackerCount", 0);
    
    var currentPage = ss.getTabValue(currentTab, "KF_recordFormCurrentPage");
    var savePageCountToTab = true;
    
    // If this tab has not already recorded the page count, we continue ignoring it.
    // User can start the count by selecting "multi-page login" on the notification bar
    // User cancels (removes TabValue) by cancelling or saving from the notification bar
    // Also cancelled automatically if form count goes beyond 10 (in case user
    // ignores notification bar and starts filling in search forms or something)
    if (currentPage == undefined || currentPage == null || currentPage.length <= 0 || currentPage <= 0)
    {
        currentPage = 1;
    } else if (currentPage >= 10)
    {
        ss.deleteTabValue(currentTab, "KF_recordFormCurrentPage");
        ss.deleteTabValue(currentTab, "KF_recordFormCurrentStateJSON");
//        ss.deleteTabValue(currentTab, "KF_recordFormCurrentStateMain");
//        ss.deleteTabValue(currentTab, "KF_recordFormCurrentStateOtherFields");
//        ss.deleteTabValue(currentTab, "KF_recordFormCurrentStatePasswords");
        currentPage = 1;
        savePageCountToTab = false;
    }
    
    // if this tab has an uniqueID associated with it, we know that the only
    // way we could be dealing with a new password / login is if the user selected
    // a matched login and edited the form before submitting the change (e.g. using it
    // as a template to create a similar login). I can't see an easy way to produce
    // a fool-proof decision in this area so this rare situation will have to
    // remain an unsupported behaviour for the time being at least.
    // Previously we have compared the submitted data with that already stored in the
    // database but this is more dificult now that users may be submitting only part of the form
    
    var currentTabUniqueID = ss.getTabValue(currentTab, "KF_uniqueID");
    var existingLogin = false;    
    
    if (currentTabUniqueID != undefined && currentTabUniqueID != null && currentTabUniqueID.length > 0)
        existingLogin = true;
    
    // Get the appropriate fields from the form.
    
    var newPasswordField, oldPasswordField;
    var passwordFields = [];
    
    // there must be at least one password or otherField
    var [usernameIndex, passwords, otherFields] =
        this._getFormFields(form, true, currentPage);
    
    // Need at least 1 valid password field to handle a submision unless the user has
    // stated that the form should be captured. Otherwise we will end up prompting
    // the user to create entries every time they search google, etc.
    if (passwords == null || passwords[0] == null || passwords[0] == undefined)
    {
        KFLog.info("No password field found in form submission.");
        return;
    }
    
    if (passwords.length > 1) // could be password change form or multi-password login form or sign up form
    {
        // naive duplicate finder - more than sufficient for the number of passwords per domain
        twoPasswordsMatchIndex=-1;
        for(let i=0;i<passwords.length && twoPasswordsMatchIndex == -1;i++)
            for(let j=i+1;j<passwords.length && twoPasswordsMatchIndex == -1;j++)
                if(passwords[j].value==passwords[i].value) twoPasswordsMatchIndex=j;
            
        if (twoPasswordsMatchIndex == -1) // either mis-typed password change form, single password change box form or multi-password login/signup, assuming latter.
        {    
            KFLog.debug("multiple passwords found (with no identical values)");
                    
            for (let i=0; i < passwords.length; i++)
                passwordFields.push(passwords[i]);
                
            //TODO2: try to distingish between multi-password login/signup and typo. maybe: if username exists and matches existing password it is a typo, else multi-password
            //return;
        } else // it's probably a password change form, but may be a sign-up form
        {
            // we need to ignore any fields that were presented to the
            // user as either "old password" or "retype new password"
                    
            KFLog.debug("Looks like a password change form or new registration form has been submitted");
            // there may be more than one pair of matches - though, we're plucking for the first one
            // we know the index of one matching password
                    
            // if there are only two passwords we already know that they match
            if (passwords.length == 2)
            {
                passwordFields.push(passwords[0]);
                //TODO2: it is also reasonably likely that this indicates a
                // sign-up form rather than a password change form. decide
                // which here and flag which one it is for now, we just assume
                // it's a sign-up form becuase that is more useful for the user in many cases
                isPasswordChangeForm = false;
                isRegistrationForm = true;
            } else
            {
                // Here we assume that any form with 3 passwords on it
                // is much more likely to be a change password form than
                // a sign-up form (obviously there will be exceptions but
                // this is the best we can do for now)
                // BUT: have not yet implemented reliable password change feature...
                isPasswordChangeForm = false;
                isRegistrationForm = false;
                
                passwordFields.push(passwords[twoPasswordsMatchIndex]);
                
                // find the first password that is different from the one that has been typed twice
                for(let i=0;i<passwords.length;i++)
                    if(passwordFields[0].value != passwords[i].value)
                        oldPasswordField = passwords[i];
            }
        }
    } else
    {
        passwordFields.push(passwords[0]);
    }
    // at this point, at least one passwordField has been chosen and an
    // oldPasswordField has been chosen if applicable.
    // we have also determined whether this form fill is likely to
    // be a new registration form or password change form

    // create a kfLoginInfo object to represent all relevant form elements
    var formLogin = keeFoxLoginInfo();
    
    var loginURLs = [];
    loginURLs.push(URL);
    
    formLogin.init(loginURLs, formActionURL, null,
        usernameIndex,
        passwordFields, null, title, otherFields, currentPage);
    
    
    var submitDocumentDataStorage = {};
    submitDocumentDataStorage.formLogin = formLogin;
    submitDocumentDataStorage.formActionURL = formActionURL;
    submitDocumentDataStorage.URL = URL;
    submitDocumentDataStorage.isPasswordChangeForm = isPasswordChangeForm;
    submitDocumentDataStorage.isRegistrationForm = isRegistrationForm;
    submitDocumentDataStorage.existingLogin = existingLogin;
    submitDocumentDataStorage.win = win;
    submitDocumentDataStorage.currentPage = currentPage;
    submitDocumentDataStorage.ss = ss;
    submitDocumentDataStorage.currentTab = currentTab;
    submitDocumentDataStorage.doc = doc;
    submitDocumentDataStorage.topDoc = topDoc;
    submitDocumentDataStorage.savePageCountToTab = savePageCountToTab;            
    
    
    // if we still don't think this is an existing loging and the user is logged in,
    // we might as well check to see if the form they have filled in 
    // matches any existing password and not bother showing the notification bar if that's the case.
    // This will still be tripped up by multi-page logins becuase no single page can match the entire
    // stored login but hopefully people will generally be using KeeFox to fill entire
    //  multi-page logins so the uniqueID will be set
    if (!submitDocumentDataStorage.existingLogin && keeFoxInst._keeFoxStorage.get("KeePassDatabaseOpen", false))
    {
        this.findLogins(submitDocumentDataStorage.URL, submitDocumentDataStorage.formActionURL, null, null, null, null, this._onFormSubmitFindLoginsComplete, submitDocumentDataStorage);
        
    } else // no need to wait for async response from KeePassRPC
    {
        this._onFormSubmitFindLoginsComplete(null,submitDocumentDataStorage);
    }
    
};

/*
 * _onHTTPAuthSubmit
 *
 * Called after an HTTP auth (or similar dialog) submission.
 * Tries to identify new passwords
 */
KFILM.prototype._onHTTPAuthSubmit = function (window, username, password, schemeAndHost, realm)
{
    //do nothing if KeePass is not connected
    if (!keeFoxInst._keeFoxStorage.get("KeePassRPCActive", false) ||
        !keeFoxInst._keeFoxStorage.get("KeePassDatabaseOpen", false))
    {
        KFLog.info("Form submit handler skipped (no active KeePass database available)");
        return;
    }

    // TODO handle case for Thunderbird
    if (window.gBrowser) {
        var currentGBrowser = window.gBrowser;
        var win = window;
        var doc = currentGBrowser.contentDocument;
        
        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                 .getService(Components.interfaces.nsISessionStore);

        var tabIndex = currentGBrowser.getBrowserIndexForDocument(doc);
        if (tabIndex == undefined || tabIndex == null || tabIndex < 0)
        {
            KFLog.error("Invalid tab index for current document.");
            return;
        }
        
        var currentTab = currentGBrowser.mTabs[tabIndex];
        
        //TODO2: do we actually need to do this for HTTPAuth saving?
        // under no circumstances will we cancel the form
        // submit so we can set this value now to help us 
        // track when pages are being navigated without form
        // submissions and hence aid automatic cancellation
        // of multi-page login forms 
        ss.setTabValue(currentTab, "KF_formSubmitTrackerCount", 1);
        ss.setTabValue(currentTab, "KF_pageLoadSinceSubmitTrackerCount", 0);    
        
        // always reset for HTTP Auth dialogs - multi-page logins not supported.
        var currentPage = 1;
        
        // create a kfLoginInfo object to represent all relevant login details
        var formLogin = keeFoxLoginInfo();
        
        var loginURLs = [];
        loginURLs.push(schemeAndHost);
            
        var passwordFields = [];
        var otherFields = [];    
        passwordFields[0] = keeFoxLoginField();
        otherFields[0] = keeFoxLoginField();    
        otherFields[0].init(
                    "username", username, "", "text", currentPage);
        passwordFields[0].init(
                    "password", password, "", "password", currentPage);
             
        formLogin.init(loginURLs, null, realm, 0,
            passwordFields, null, realm, otherFields, currentPage);
        
        var submitDocumentDataStorage = {};
        submitDocumentDataStorage.formLogin = formLogin;
        submitDocumentDataStorage.formActionURL = "";
        submitDocumentDataStorage.URL = schemeAndHost;
        submitDocumentDataStorage.isPasswordChangeForm = false;
        submitDocumentDataStorage.isRegistrationForm = false;
        submitDocumentDataStorage.existingLogin = false;
        submitDocumentDataStorage.win = win;
        submitDocumentDataStorage.currentPage = currentPage;
        submitDocumentDataStorage.ss = ss;
        submitDocumentDataStorage.currentTab = currentTab;
        submitDocumentDataStorage.doc = doc;
        submitDocumentDataStorage.topDoc = doc;
        submitDocumentDataStorage.savePageCountToTab = true;
        
        // if we still don't think this is an existing loging and the user is logged in,
        // we might as well check to see if the dialog info they have filled in 
        // matches any existing password and not bother showing the notification bar if that's the case.
        if (!submitDocumentDataStorage.existingLogin && keeFoxInst._keeFoxStorage.get("KeePassDatabaseOpen", false))
        {
            this.findLogins(submitDocumentDataStorage.URL, null, realm, null, null, null, this._onFormSubmitFindLoginsComplete, submitDocumentDataStorage);
            
        } else // no need to wait for async response from KeePassRPC
        {
            this._onFormSubmitFindLoginsComplete(null,submitDocumentDataStorage);
        }
    }
};

/*
 * _onFormSubmitFindLoginsComplete
 *
 * Called in response to a JSON-RPC reply to a request to find logins
 */
KFILM.prototype._onFormSubmitFindLoginsComplete = function (resultWrapper, submitDocumentDataStorage)
{                
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
             .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser") ||
        wm.getMostRecentWindow("mail:3pane");
    window.keeFoxInst._KFLog.info("callback fired!");
     
    var logins = null;
    var convertedResult = [];
            
    // if no resultWrapper is provided, we just go ahead anyway assuming it's a new login
    if (resultWrapper !== undefined && resultWrapper != null && "result" in resultWrapper && resultWrapper.result !== false && resultWrapper.result != null)
    {
        logins = resultWrapper.result; 
        
        for (var i in logins)
        {
            var kfl = keeFoxLoginInfo();
            kfl.initFromEntry(logins[i]);
            convertedResult.push(kfl);
        }
        logins = convertedResult;
        //submitDocumentDataStorage = window.keefox_org.ILM.submitDocumentDataStorages[resultWrapper.id];
        
        if (logins != undefined && logins != null)
        {
            for (var i = 0; i < logins.length; i++)
            {
                if (submitDocumentDataStorage.formLogin.matches(logins[i],false,true,false,false))
                    submitDocumentDataStorage.existingLogin = true;
            }
        }
    }
    
    // discover the usernames for the submitted form
    var formLoginUsername = null;
    if (submitDocumentDataStorage.formLogin.usernameIndex >= 0 
    && submitDocumentDataStorage.formLogin.otherFields != null 
    && submitDocumentDataStorage.formLogin.otherFields.length > submitDocumentDataStorage.formLogin.usernameIndex 
    && submitDocumentDataStorage.formLogin.otherFields[submitDocumentDataStorage.formLogin.usernameIndex] != undefined)
    {
        var temp = submitDocumentDataStorage.formLogin.otherFields[submitDocumentDataStorage.formLogin.usernameIndex];
        formLoginUsername = temp.value;
        if (KFLog.logSensitiveData) KFLog.debug("formLoginUsername: " + formLoginUsername);
    }

    //if (oldPasswordField != null) // we are changing the password
    //TODO2: implement password change support if it doesn't impact the more important log-in and registration features
//        if (submitDocumentDataStorage.isPasswordChangeForm)
//        {
//            
//            if (submitDocumentDataStorage.existingLogin) // as long as we have previously stored a login for this site...
//            {
//                KFLog.info("we are changing the password");
//                keefox_org.UI.setWindow(submitDocumentDataStorage.win);
//                keefox_org.UI.setDocument(submitDocumentDataStorage.doc);

//                if (logins.length == 1) { // only one option so update username details from old login (in case they weren't included in the form) // TODO2: is this needed?
//                    //var oldLogin = logins[0];
//                    //formLogin.usernameIndex      = oldLogin.usernameIndex;

//                    keefox_org.UI.promptToChangePassword(submitDocumentDataStorage.oldLogin, submitDocumentDataStorage.formLogin);
//                } else {
//                    keefox_org.UI.promptToChangePasswordWithUsernames(
//                                        logins, logins.length, formLogin);
//                } // TODO2: allow option to override change password option and instead save as a new password. (need a new prompt function)
//            }
//            return;
//        
//        } else 
    if (submitDocumentDataStorage.isRegistrationForm)
    {
        KFLog.info("Looks like this is a registration form so doing nothing (not implemented yet).");
        return;
    } else if (submitDocumentDataStorage.existingLogin) // it's already in the database so ignore
    {
        KFLog.info("we are logging in with a known password so doing nothing.");
        // this could miss some cases. e.g.
        // password previously changed outside of this password management system (maybe matching algorithm above needs to compare passwords too in cases like this?)
        return;
    }
        
    // if we get to this stage, we are faced with a new login or signup submission so prompt user to save details
    KFLog.info("password is not recognised so prompting user to save it");
    
    // set the tab value ready for the next time the page loads
    var nextPage = submitDocumentDataStorage.currentPage + 1;
   
    // If this is the 2nd (or later) part of a multi-page login form, we need to combine the new field items with the previous login data
    if (nextPage > 2)
    {
        KFLog.info("This form submission is part of a multi-page login process.");
        
        var previousStageLoginJSON = submitDocumentDataStorage.ss.getTabValue(submitDocumentDataStorage.currentTab, "KF_recordFormCurrentStateJSON");
        var previousStageLogin = keeFoxLoginInfo();
        previousStageLogin.fromJSON(previousStageLoginJSON);
        
        // set the tab value ready for the next time the page loads
        if (previousStageLogin != undefined && previousStageLogin != null)
        {   
            previousStageLogin.mergeWith(submitDocumentDataStorage.formLogin);
            submitDocumentDataStorage.formLogin = previousStageLogin;
        }
    }
    // Prompt user to save login (via dialog or notification bar)
    keefox_org.UI.setWindow(submitDocumentDataStorage.win);
    keefox_org.UI.setDocument(submitDocumentDataStorage.topDoc);
    
    submitDocumentDataStorage.ss.setTabValue(submitDocumentDataStorage.currentTab, "KF_recordFormCurrentStateJSON", JSON.stringify(submitDocumentDataStorage.formLogin));    
    
    if (submitDocumentDataStorage.savePageCountToTab)
    {
        submitDocumentDataStorage.ss.setTabValue(submitDocumentDataStorage.currentTab, "KF_recordFormCurrentPage", nextPage);
    } 
    
    if (nextPage > 2)
        keefox_org.UI.promptToSavePassword(submitDocumentDataStorage.formLogin, true);
    else
        keefox_org.UI.promptToSavePassword(submitDocumentDataStorage.formLogin, false);
};