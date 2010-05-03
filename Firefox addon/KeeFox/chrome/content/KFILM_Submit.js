/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2010 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the javascript file containing functions directly used to handle submitted forms.
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

Components.utils.import("resource://kfmod/kfDataModel.js");

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
    var currentGBrowser = keeFoxToolbar._currentWindow.gBrowser;
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
    
    // This variable is set originally by user via menu "start recording" or notification bar "make multi-page"
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
        for(i=0;i<passwords.length && twoPasswordsMatchIndex == -1;i++)
            for(j=i+1;j<passwords.length && twoPasswordsMatchIndex == -1;j++)
                if(passwords[j].value==passwords[i].value) twoPasswordsMatchIndex=j;
            
        if (twoPasswordsMatchIndex == -1) // either mis-typed password change form, single password change box form or multi-password login/signup, assuming latter.
        {    
            KFLog.debug("multiple passwords found (with no identical values)");
                    
            for (i=0; i < passwords.length; i++)
                passwordFields.push(passwords[i]);
                
            //TODO: try to distingish between multi-password login/signup and typo. maybe: if username exists and matches existing password it is a typo, else multi-password
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
                //TODO: it is also reasonably likely that this indicates a sign-up form rather than a password change form. decide which here and flag which one it is
                // for now, we just assume it's a sign-up form becuase that is more useful for the user in many cases
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
                for(i=0;i<passwords.length;i++)
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
    var formLogin = newkfLoginInfo();
    
    var loginURLs = [];
    loginURLs.push(URL);
    
    formLogin.init(loginURLs, formActionURL, null,
        usernameIndex,
        passwordFields, null, title, otherFields, currentPage);
    
    // if we still don't think this is an existing loging and the user is logged in,
    // we might as well check to see if the form they have filled in 
    // matches any existing password and not bother showing the notification bar if that's the case.
    // This will still be tripped up by multi-page logins becuase no single page can match the entire
    // stored login but hopefully people will generally be using KeeFox to fill entire
    //  multi-page logins so the uniqueID will be set
    if (!existingLogin && keeFoxInst._keeFoxStorage.get("KeePassDatabaseOpen", false))
    {
        var logins = this.findLogins(URL, formActionURL, null, null);

        if (logins != undefined && logins != null)
        {
            KFLog.debug("matching test: "+logins.length);
                
            for (var i = 0; i < logins.length; i++)
            {
                if (formLogin.matches(logins[i],false,false,false,false))
                    existingLogin = true;
            }
        }
    }
    
    // discover the usernames for the submitted form
    var formLoginUsername = null;
    if (formLogin.usernameIndex >= 0 && formLogin.otherFields != null && formLogin.otherFields.length > formLogin.usernameIndex && formLogin.otherFields[formLogin.usernameIndex] != undefined)
    {
        var temp = formLogin.otherFields[formLogin.usernameIndex];
        formLoginUsername = temp.value;
        if (KFLog.logSensitiveData) KFLog.debug("formLoginUsername: " + formLoginUsername);
    }

    //if (oldPasswordField != null) // we are changing the password
    //TODO: implement password change support if it doesn't impact the more important log-in and registration features
    if (isPasswordChangeForm)
    {
        
        if (existingLogin) // as long as we have previously stored a login for this site...
        {
            KFLog.info("we are changing the password");
            keeFoxUI.setWindow(win);
            keeFoxUI.setDocument(doc);

            if (logins.length == 1) { // only one option so update username details from old login (in case they weren't included in the form) // TODO: is this needed?
                //var oldLogin = logins[0];
                //formLogin.usernameIndex      = oldLogin.usernameIndex;

                keeFoxUI.promptToChangePassword(oldLogin, formLogin);
            } else {
                keeFoxUI.promptToChangePasswordWithUsernames(
                                    logins, logins.length, formLogin);
            } // TODO: allow option to override change password option and instead save as a new password. (need a new prompt function)
        }
        return;
    
    } else if (isRegistrationForm)
    {
        KFLog.info("Looks like this is a registration form so doing nothing (not implemented yet).");
        return;
    } else if (existingLogin) // it's already in the database so ignore
    {
        KFLog.info("we are logging in with a known password so doing nothing.");
        // this could miss some cases. e.g.
        // password previously changed outside of this password management system (maybe matching algorithm above needs to compare passwords too in cases like this?)
        return;
    }
        
    // if we get to this stage, we are faced with a new login or signup submission so prompt user to save details
    KFLog.info("password is not recognised so prompting user to save it");
    
    // set the tab value ready for the next time the page loads
    var nextPage = currentPage + 1;
   
    // If this is the 2nd (or later) part of a multi-page login form, we need to combine the new field items with the previous login data
    if (nextPage > 2)
    {
        KFLog.info("This form submission is part of a multi-page login process.");
        
        var previousStageLoginJSON = ss.getTabValue(currentTab, "KF_recordFormCurrentStateJSON");
//        var previousStageLoginMain = ss.getTabValue(currentTab, "KF_recordFormCurrentStateMain");
//        var previousStageLoginURLs = ss.getTabValue(currentTab, "KF_recordFormCurrentStateURLs");
//        var previousStageLoginPasswords = ss.getTabValue(currentTab, "KF_recordFormCurrentStatePasswords");
//        var previousStageLoginOtherFields = ss.getTabValue(currentTab, "KF_recordFormCurrentStateOtherFields");
        
        //var kfLoginField = newkfLoginField();
        //var kfURL;
//        var deserialisedOutputOtherFields = [];
//        var deserialisedOutputPasswords = [];
//        var deserialisedOutputURLs = [];
        var previousStageLogin = newkfLoginInfo();
        previousStageLogin.fromJSON(previousStageLoginJSON);
                  
//        if (previousStageLoginOtherFields != undefined && previousStageLoginOtherFields != null)
//            eval (previousStageLoginOtherFields);

//        if (previousStageLoginPasswords != undefined && previousStageLoginPasswords != null)
//            eval (previousStageLoginPasswords);
//       
//        if (previousStageLoginURLs != undefined && previousStageLoginURLs != null)
//            eval (previousStageLoginURLs);
//  
//        if (previousStageLoginMain != undefined && previousStageLoginMain != null)
//            eval ("previousStageLogin.init"+previousStageLoginMain);
    
        // set the tab value ready for the next time the page loads
        //TODO: how do we "cancel" this so that the page count is reset when the next login/signup process begins?
        if (previousStageLogin != undefined && previousStageLogin != null)
        {   
            previousStageLogin.mergeWith(formLogin);
            formLogin = previousStageLogin;
        }
    }
    // Prompt user to save login (via dialog or notification bar)
    keeFoxUI.setWindow(win);
    keeFoxUI.setDocument(topDoc);
    
//    KFLog.debug("formLogin.otherFields.length:" + formLogin.otherFields.length);
//    KFLog.debug("formLogin.passwords.length:" + formLogin.passwords.length);
//    
//    var otherFieldsSerialsed = "";            
//    for (j = 0; j < formLogin.otherFields.length; j++)
//    {
//        var matchedField = formLogin.otherFields[j];
//        otherFieldsSerialsed += "var tempOutputOtherField"+ j + " = newkfLoginField(); tempOutputOtherField"+ j + ".init" + matchedField.toSource() + "; deserialisedOutputOtherFields.push(tempOutputOtherField"+ j + "); ";
//    }
//                  
//    var passwordsSerialsed = "";            
//    for (j = 0; j < formLogin.passwords.length; j++)
//    {
//        var matchedField = formLogin.passwords[j];
//        passwordsSerialsed += "var tempOutputPassword"+ j + " = newkfLoginField(); tempOutputPassword"+ j + ".init" + matchedField.toSource() + "; deserialisedOutputPasswords.push(tempOutputPassword"+ j + "); ";
//    }

//    var URLsSerialsed = "";            
//    for (j = 0; j < formLogin.URLs.length; j++)
//    {
//        var matchedURL = formLogin.URLs[j];
//        URLsSerialsed += "var tempOutputURL"+ j + " ='" + matchedURL + "'; deserialisedOutputURLs.push(tempOutputURL"+ j + "); ";
//    }
   
//   finalEval = formLogin.toSource();
//    KFLog.debug("test1");
//    var tempJSON = JSON.stringify(formLogin);
//     KFLog.debug("test2:" + tempJSON);
//    KFLog.debug("test3:" + passwordsSerialsed);
//    var tempTestLogin = newkfLoginInfo();
//    tempTestLogin.fromJSON(tempJSON);
//    var tempJSON2 = JSON.stringify(tempTestLogin);
//     KFLog.debug("test4:" + tempJSON2);
     
    // we save the current state no matter what, just in case user
    // does decide to convert this into a multi-page login
//    ss.setTabValue(currentTab, "KF_recordFormCurrentStateURLs", URLsSerialsed);
//    ss.setTabValue(currentTab, "KF_recordFormCurrentStatePasswords", passwordsSerialsed);
//    ss.setTabValue(currentTab, "KF_recordFormCurrentStateOtherFields", otherFieldsSerialsed);
//    ss.setTabValue(currentTab, "KF_recordFormCurrentStateMain", finalEval);
    ss.setTabValue(currentTab, "KF_recordFormCurrentStateJSON", JSON.stringify(formLogin));    
    
    if (savePageCountToTab)
    {
        ss.setTabValue(currentTab, "KF_recordFormCurrentPage", nextPage);
    } 
    
    if (nextPage > 2)
        keeFoxUI.promptToSavePassword(formLogin, true);
    else
        keeFoxUI.promptToSavePassword(formLogin, false);
    
};