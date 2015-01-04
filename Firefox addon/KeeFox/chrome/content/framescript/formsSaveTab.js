/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This contains code related to the handling of submitted forms.

  It runs in a tab scope so has direct access to the DOM of the current site.
  
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
"use strict";

let Cu = Components.utils;

Cu.import("resource://kfmod/kfDataModel.js");

var formSubmitObserver = {
    notify: function (form, domWin, actionURI, cancelSubmit) {
        try
        {
            // For some reason this observer is called in every tab when a form in any
            // tab is submitted. I imagine this will have to be fixed when Firefox eventually
            // moves to more than one content process (or at least we'll only get notifications 
            // for tabs in our same process) but in the mean time we have to work around the bug 
            // with this check. The alternative of handling the observer in the chrome process
            // isn't valid because:
            // 1) The notifications are not raised when e10s is enabled
            // 2) We need access to the DOM of the form before its submitted so I can't
            // imagine the async messaging process working (the form could have been destroyed
            // before we get to run our "early" submit handling code!)
            if (domWin.top != content)
                return;

            Logger.debug("observer notified for form submission.");
            if (_getSaveOnSubmitForSite(form.ownerDocument.documentURI))
                _onFormSubmit(form);
        } catch (e)
        {
            try
            {
                Logger.error("Caught error in onFormSubmit: " + e + ". Stack: " + e.stack 
                    + ". Number: " + e.number + ". Description: " + e.description);
            }
            catch (ex)
            {}
        }
        // Always return true, or form submit will be cancelled. (At least that used to be
        // the case, I wonder if by 2015 the presence of the cancelSubmit parameter means 
        // this is no longer essential - doesn't do any harm though)
        return true;
    },
    register: function () {
        var observerService = Components.classes["@mozilla.org/observer-service;1"]
                              .getService(Components.interfaces.nsIObserverService);
        observerService.addObserver(this, "earlyformsubmit", false);
    },
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver,
        Ci.nsIFormSubmitObserver,
        Ci.nsISupportsWeakReference])
};

/*
 * _onFormSubmit
 *
 * Called by the our observer when notified of a form submission.
 * [Note that this happens before any DOM onsubmit handlers are invoked.]
 * Looks for a password change in the submitted form, so we can update
 * our stored password.
 */
var _onFormSubmit = function (form)
{
    Logger.debug("Form submit handler started");
    
    let KeeFoxTriggeredThePendingFormSubmission = tabState.KeeFoxTriggeredThePendingFormSubmission;
    tabState.KeeFoxTriggeredThePendingFormSubmission = false;
    
    // Increment our page count now that the form has been submitted.
    tabState.currentPage++;
    Logger.debug("currentPage of next page load will be: " + tabState.currentPage);

    // If we have just submitted the last expected page in this form, we'll reset our page count 
    // tracker on the assumption that this current submission is unrelated to the previous form 
    // fill. Site failures might lead to problems here but probably not big ones very often.
    if (tabState.currentPage > tabState.maximumPage)
    {
        tabState.currentPage = 0;
        tabState.maximumPage = 0;
        tabState.forceAutoSubmit = null;
        tabState.userRecentlyDemandedAutoSubmit = false;
        Logger.debug("Reset form-filling session (page = 0 and cancelled any forced autosubmit).");
    }

    // do nothing if KeeFox auto-submitted the form
    if (KeeFoxTriggeredThePendingFormSubmission)
        return;

    //do nothing if KeePass is not connected
    if (!sendSyncMessage("keefox:isKeePassDatabaseOpen")[0])
    {
        Logger.info("Form submit handler skipped (no active KeePass database available)");
        return;
    }

    var doc = form.ownerDocument;

    var URL = doc.documentURI;
    if (Logger.logSensitiveData) Logger.info("URL: " + URL);
    var title = doc.title;
    var isPasswordChangeForm = false;
    var isRegistrationForm = false;
    
    // under no circumstances will we cancel the form
    // submit so we can set this value now to help us 
    // track when pages are being navigated without form
    // submissions and hence aid automatic cancellation
    // of multi-page login forms 
    tabState.formSubmitTrackerCount = 1;
    tabState.pageLoadSinceSubmitTrackerCount = 0;
    
    var currentPage = tabState.recordFormCurrentPage;
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
        tabState.recordFormCurrentPage = -1;
        tabState.recordFormCurrentStateJSON = null;
        currentPage = 1;
        savePageCountToTab = false;
    }
    
    // Get the appropriate fields from the form.
    var newPasswordField, oldPasswordField;
    var passwordFields = [];
    
    // there must be at least one password or otherField
    var [usernameIndex, passwords, otherFields] =
        this._getFormFields(form, true, currentPage);
        
    var conf = config.getConfigForURL(URL);

    // We want to save this form if we find a password field but first
    // we check whether any whitelist or blacklist entries must override that behaviour
    var interestingForm = null;

    interestingForm = config.valueAllowed(form.id,conf.interestingForms.id_w,conf.interestingForms.id_b,interestingForm);
    interestingForm = config.valueAllowed(form.name,conf.interestingForms.name_w,conf.interestingForms.name_b,interestingForm);
        
    if (interestingForm === false)
    {
        Logger.debug("Lost interest in this form after inspecting form name and ID");
        return;
    }

    for (var f in otherFields)
    {
        interestingForm = config.valueAllowed(otherFields[f].id,conf.interestingForms.f_id_w,conf.interestingForms.f_id_b,interestingForm);
        interestingForm = config.valueAllowed(otherFields[f].name,conf.interestingForms.f_name_w,conf.interestingForms.f_name_b,interestingForm);
        //TODO1.6: interestingForm = config.xpathAllowed(otherFields[f].id,conf.interestingForms.f_id_w,conf.interestingForms.f_id_b,interestingForm);
    }
        
    if (interestingForm === false)
    {
        Logger.debug("Lost interest in this form after inspecting field names and IDs");
        return;
    }
        
    if (passwords == null || passwords[0] == null || passwords[0] == undefined)
    {
        Logger.debug("No password field found in form submission.");
        // so we now only want to save the form if it has been whitelisted
            if (interestingForm !== true)
                return;
    }
    
    if (passwords.length > 1) // could be password change form or multi-password login form or sign up form
    {
        // naive duplicate finder - more than sufficient for the number of passwords per domain
        let twoPasswordsMatchIndex=-1;
        for(let i=0;i<passwords.length && twoPasswordsMatchIndex == -1;i++)
            for(let j=i+1;j<passwords.length && twoPasswordsMatchIndex == -1;j++)
                if(passwords[j].value==passwords[i].value) twoPasswordsMatchIndex=j;
            
        if (twoPasswordsMatchIndex == -1) // either mis-typed password change form, single password change box form or multi-password login/signup, assuming latter.
        {    
            Logger.debug("multiple passwords found (with no identical values)");
                    
            for (let i=0; i < passwords.length; i++)
                passwordFields.push(passwords[i]);
                
            //TODO2: try to distingish between multi-password login/signup and typo. maybe: if username exists and matches existing password it is a typo, else multi-password
            //return;
        } else // it's probably a password change form, but may be a sign-up form
        {
            // we need to ignore any fields that were presented to the
            // user as either "old password" or "retype new password"
                    
            Logger.debug("Looks like a password change form or new registration form has been submitted");
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
    } else if (passwords != null && passwords[0] != null && passwords[0] != undefined)
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
    
    formLogin.init(loginURLs, null, null,
        usernameIndex,
        passwordFields, null, title, otherFields, currentPage);
    
    var submitDocumentDataStorage = {};
    submitDocumentDataStorage.formLogin = formLogin;
    submitDocumentDataStorage.URL = URL;
    submitDocumentDataStorage.isPasswordChangeForm = isPasswordChangeForm;
    submitDocumentDataStorage.isRegistrationForm = isRegistrationForm;
    submitDocumentDataStorage.currentPage = currentPage;
    submitDocumentDataStorage.savePageCountToTab = savePageCountToTab;
    
    // We check to see if the form the user has filled in matches any existing login entry
    // and not bother showing the save password notification if that's the case. This request
    // is synchronous to the KeeFox chrome layer but the upstream request to KeePass is asynchronous.
    let callbackData = {
        savePageCountToTab: submitDocumentDataStorage.savePageCountToTab,
        isRegistrationForm: submitDocumentDataStorage.isRegistrationForm,
        isPasswordChangeForm: submitDocumentDataStorage.isPasswordChangeForm,
        currentPage: submitDocumentDataStorage.currentPage,
        formLogin: JSON.stringify(submitDocumentDataStorage.formLogin.asJSONifiable()),
    };
    sendSyncMessage("keefox:findLogins", { "url": submitDocumentDataStorage.URL,
        "callbackData": callbackData, "formSubmitted": true });
};

/*
 * _onFormSubmitFindLoginsComplete
 *
 * Called in response to a JSON-RPC reply to a request to find logins
 */
var _onFormSubmitFindLoginsComplete = function (resultWrapper, submitDocumentDataStorage)
{
    Logger.debug("_onFormSubmitFindLoginsComplete started");
     
    var logins = null;
    var convertedResult = [];
    var existingLogin = false;
            
    // if no resultWrapper is provided, we just go ahead anyway assuming it's a new login
    if (resultWrapper !== undefined && resultWrapper != null && "result" in resultWrapper 
        && resultWrapper.result !== false && resultWrapper.result != null)
    {
        logins = resultWrapper.result; 
        
        for (var i in logins)
        {
            var kfl = keeFoxLoginInfo();
            kfl.initFromEntry(logins[i]);
            convertedResult.push(kfl);
        }
        logins = convertedResult;
        
        if (logins != undefined && logins != null)
        {
            for (var i = 0; i < logins.length; i++)
            {
                //TODO:1.6: Should be able to extend the search in containedIn() so we take into 
                // account the current page information and therefore can detect that the submitted 
                // form data is part of a larger multi-page login form. That situation should only 
                // come up very rarely though (e.g. maybe when user has navigated back to the 
                // non-first page of a multi-page login form, or when their credentials have been 
                // invalidated remotely and they end up on one of the non-first pages to 
                // submit updated credentials)
                if (submitDocumentDataStorage.formLogin.containedIn(logins[i],false,true,false,false,this))
                    existingLogin = true;
            }
        }
    }
    
    //TODO2: implement password change support if it doesn't impact the more important log-in and registration features
    // discover the usernames for the submitted form
    //var formLoginUsername = null;
    //if (submitDocumentDataStorage.formLogin.usernameIndex >= 0 
    //&& submitDocumentDataStorage.formLogin.otherFields != null 
    //&& submitDocumentDataStorage.formLogin.otherFields.length > submitDocumentDataStorage.formLogin.usernameIndex 
    //&& submitDocumentDataStorage.formLogin.otherFields[submitDocumentDataStorage.formLogin.usernameIndex] != undefined)
    //{
    //    var temp = submitDocumentDataStorage.formLogin.otherFields[submitDocumentDataStorage.formLogin.usernameIndex];
    //    formLoginUsername = temp.value;
    //    if (Logger.logSensitiveData) Logger.debug("formLoginUsername: " + formLoginUsername);
    //}

    //if (oldPasswordField != null) // we are changing the password
//        if (submitDocumentDataStorage.isPasswordChangeForm)
//        {
//            
//            if (submitDocumentDataStorage.existingLogin) // as long as we have previously stored a login for this site...
//            {
//                Logger.info("we are changing the password");

//                if (logins.length == 1) { // only one option so update username details from old login (in case they weren't included in the form) // TODO2: is this needed?
//                    //var oldLogin = logins[0];
//                    //formLogin.usernameIndex      = oldLogin.usernameIndex;

//                    keefox_win.UI.promptToChangePassword(submitDocumentDataStorage.oldLogin, submitDocumentDataStorage.formLogin);
//                } else {
//                    keefox_win.UI.promptToChangePasswordWithUsernames(
//                                        logins, logins.length, formLogin);
//                } // TODO2: allow option to override change password option and instead save as a new password. (need a new prompt function)
//            }
//            return;
//        
//        } else 
    if (submitDocumentDataStorage.isRegistrationForm)
    {
        Logger.info("Looks like this is a registration form so doing nothing (not implemented yet).");
        return;
    } else if (existingLogin) // it's already in the database so ignore
    {
        Logger.info("we are logging in with a known password so doing nothing.");
        return;
    }
        
    // if we get to this stage, we are faced with a new login or signup submission so prompt user to save details
    Logger.info("password is not recognised so prompting user to save it");
    
    // set the tab value ready for the next time the page loads
    var nextPage = submitDocumentDataStorage.currentPage + 1;
   
    // If this is the 2nd (or later) part of a multi-page login form, we need to combine the new field items with the previous login data
    if (nextPage > 2)
    {
        Logger.info("This form submission is part of a multi-page login process.");
        
        var previousStageLoginJSON = tabState.recordFormCurrentStateJSON;
        var previousStageLogin = keeFoxLoginInfo();
        previousStageLogin.fromJSON(previousStageLoginJSON);
        
        // set the tab value ready for the next time the page loads
        if (previousStageLogin != undefined && previousStageLogin != null)
        {   
            previousStageLogin.mergeWith(submitDocumentDataStorage.formLogin);
            submitDocumentDataStorage.formLogin = previousStageLogin;
        }
    }
    
    tabState.recordFormCurrentStateJSON = JSON.stringify(submitDocumentDataStorage.formLogin);    
    
    if (submitDocumentDataStorage.savePageCountToTab)
    {
        tabState.recordFormCurrentPage = nextPage;
    } 

    let messageData = {
        login: JSON.stringify(submitDocumentDataStorage.formLogin.asJSONifiable()),
        isMultiPage: nextPage > 2 ? true : false
    };
    sendAsyncMessage("keefox:promptToSavePassword", messageData);
};

var findLoginsForSubmittedFormResultHandler = function (message)
{
    let resultWrapper = message.data.resultWrapper;
    let submitDocumentDataStorage = message.data.submitDocumentDataStorage;

    let formLogin = new keeFoxLoginInfo();
    formLogin.fromJSON(submitDocumentDataStorage.formLogin);
    submitDocumentDataStorage.formLogin = formLogin;

    _onFormSubmitFindLoginsComplete(resultWrapper, submitDocumentDataStorage);
};

var cancelFormRecordingHandler = function (message)
{
    tabState.recordFormCurrentPage = -1;
    tabState.recordFormCurrentStateJSON = null;
};
