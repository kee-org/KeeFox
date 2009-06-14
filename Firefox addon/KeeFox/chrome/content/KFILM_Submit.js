/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the javascript file containing functions directly used to handle submitted forms.
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

    /*
     * _onFormSubmit
     *
     * Called by the our observer when notified of a form submission.
     * [Note that this happens before any DOM onsubmit handlers are invoked.]
     * Looks for a password change in the submitted form, so we can update
     * our stored password.
     */
    KFILM.prototype._onFormSubmit = function (form) {

        this.log("Form submit handler started");
this.log(form);

        var doc = form.ownerDocument;
        var win = doc.defaultView;
        //this.log(doc);
        //this.log(win);
        this.log(doc.documentURI);
        //var formLogin = new this._kfLoginInfo();

        // If password saving is disabled (globally or for host), bail out now.
        //if (!this._remember)
        //    return;

        var URL      = this._getPasswordOrigin(doc.documentURI);
        this.log(URL);
        var formActionURL = this._getActionOrigin(form);
        var title = doc.title;

        //if (!this.getLoginSavingEnabled(hostname)) {
        //    this.log("(form submission ignored -- saving is " +
        //             "disabled for: " + hostname + ")");
        //    return;
        //}

        // Get the appropriate fields from the form.
        
        var newPasswordField, oldPasswordField;
        var passwordFields = Components.classes["@mozilla.org/array;1"]
                        .createInstance(Components.interfaces.nsIMutableArray);

        
        // there must be at least one password or otherField
        var [usernameIndex, passwords, otherFields] =
            this._getFormFields(form, true);
        this.log(URL);
        if (false) //TODO: implement test for "is a multi-page login"
        {
            this.log("This form submission is part of a multi-page login process.");
            //TODO: store current formfield data
            
            // ask the user if they want to save currently stored data (or discard it all)
            
            return;
        }
        
        // Need at least 1 valid password field to handle a single page submision.
        if (passwords == null || passwords[0] == null || passwords[0] == undefined)
        {
            this.log("No password field found in form submission.");
            return;
        }
        this.log(URL);
        
        if (passwords.length > 1) // could be password change form or multi-password login form or sign up form
        {
            
            // naive duplicate finder - more than sufficient for the number of passwords per domain
            twoPasswordsMatchIndex=-1;
            for(i=0;i<passwords.length && twoPasswordsMatchIndex == -1;i++)
                for(j=i+1;j<passwords.length && twoPasswordsMatchIndex == -1;j++)
                    if(passwords[j].value==passwords[i].value) twoPasswordsMatchIndex=j;
            
            if (twoPasswordsMatchIndex == -1) // either mis-typed password change form, single password change box form or multi-password login/signup
            {
                
                this.log("multiple passwords found (with no identical values)");
                
                for (i=0; i < passwords.length; i++)
                    passwordFields.appendElement(passwords[i],false);
                
                //TODO: try to distingish between multi-password login/signup and typo. maybe: if username exists and matches existing password it is a typo, else multi-password
                //return;
            } else // it's probably a password change form
            {
                // we need to ignore any fields that were presented to the
                // user as either "old password" or "retype new password"
                
                this.log("Looks like a password change form has been submitted");
                // there may be more than one pair of matches - though, we're plucking for the first one
                // we know the index of one matching password
                
                // if there are only two passwords
                if (passwords.length == 2)
                {
                    passwordFields.appendElement(passwords[0],false);
                } else
                {
                    passwordFields.appendElement(passwords[twoPasswordsMatchIndex],false);
                    for(i=0;i<passwords.length;i++)
                        if(passwordFields[0].value != passwords[i].value)
                            oldPasswordField = passwords[i];
                }
            }
        } else
        {
            passwordFields.appendElement(passwords[0],false);
        }
        this.log(URL);
        // at this point, at least one passwordField has been chosen and an
        // oldPasswordField has been chosen if applicable

        // create a kfLoginInfo object to represent all relevant form elements
        //formLogin = this._generateFormLogin(URL, formActionURL, title, usernameField, passwordFields, otherFields);
        
        var kfLoginInfo = new Components.Constructor(
                      "@christomlinson.name/kfLoginInfo;1",
                      Components.interfaces.kfILoginInfo);
                      
        var formLogin = new kfLoginInfo;
    
      /*  if (otherFields != null && otherFields != undefined)
        {
            formLogin.initOther(URL, formActionURL, null,
                usernameIndex,
                passwordFields, null, title, otherFields);
            this.log("login object initialised with custom data");
        } else
        {*/
        
        var otherFieldsNSMutableArray = Components.classes["@mozilla.org/array;1"]
                        .createInstance(Components.interfaces.nsIMutableArray);
        for (i=0; i < otherFields.length; i++)
            otherFieldsNSMutableArray.appendElement(otherFields[i],false);
        
            formLogin.init(URL, formActionURL, null,
                usernameIndex,
                passwordFields, null, title, otherFieldsNSMutableArray);
                
        this.log(URL);
        // Look for an existing login that matches the form login.
        var existingLogin = null;
        var logins = this.findLogins({}, URL, formActionURL, null, null);
        this.log(URL);
        // if user was not logged in and cancelled the login process, we can't
        // proceed (becuase all passwords will appear to be new)
        // rather than use the normal storage variable, I'm going to the source (KeICE)
        // just to cover situations where this thread reaches this point before the usual
        // variable has been updated.
        var dbName = this._kf.getDatabaseName();
                
        if (dbName == "")
        {
            this.log("User did not successfully open a KeePass database. Aborting password save procedure.");
            return;
        }
        
        // discover the usernames for the submitted form
        var formLoginUsername = null;
        if (formLogin.usernameIndex >= 0 && formLogin.otherFields != null && formLogin.otherFields.length > formLogin.usernameIndex && formLogin.otherFields[formLogin.usernameIndex] != undefined)
        {
            var temp = formLogin.otherFields.queryElementAt(formLogin.usernameIndex,Components.interfaces.kfILoginField);
            formLoginUsername = temp.value;
            this.log("formLoginUsername: " + formLoginUsername);
        }
                    
        for (var i = 0; i < logins.length; i++)
        {
            var same, login = logins[i];
            
            // discover the username for the stored form
            var loginUsername = null;
            if (login.usernameIndex >= 0 && login.otherFields != null && login.otherFields.length > login.usernameIndex && login.otherFields[login.usernameIndex] != undefined)
            {
                var temp = login.otherFields.queryElementAt(login.usernameIndex,Components.interfaces.kfILoginField);
                loginUsername = temp.value;
            }
            
            //var temp2 = formLogin.passwords.queryElementAt(0,Components.interfaces.kfILoginField);
            //    this.log("password value: " + temp2.value);
             
            // if the submitted or stored username is missing, ignore it and match on the rest of the data
            
            if (oldPasswordField != null)
                 same = formLogin.matches(login, true, true, true, true);
            /*if (!login.usernameIndex && formLogin.username) {
                var restoreMe = formLogin.username;
                formLogin.username = ""; 
                same = formLogin.matches(login, true, true, true);
                formLogin.username = restoreMe;
            } else if (!formLogin.username && login.username) {
                formLogin.username = login.username;
                same = formLogin.matches(login, true, true, true);
                formLogin.username = null; // we know it's always null.
            } else {*/
            else if (loginUsername == null || formLoginUsername == null)
                 same = formLogin.matches(login, false, true, true, true);
            else
                same = formLogin.matches(login, false, true, true, false);
            //}

            if (same) {
                this.log("login object matches with a stored login");
                existingLogin = login;
                break;
            }
        }

        if (oldPasswordField != null) // we are changing the password
        {
            
            if (existingLogin) // as long as we have previously stored a login for this site...
            {
                this.log("we are changing the password");
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
        
        } else // maybe it is new...
        {
            if (existingLogin) // no, it's already in the database so ignore
            {
                this.log("we are logging in with a known password so doing nothing.");
                // this could miss some cases. e.g.
                // password previously changed outside of this password management system (maybe matching algorithm above needs to compare passwords too in cases like this?)
                return;
            }
            
        
        }
        
        // if we get to this stage, we are faced with a new login or signup submission so prompt user to save details
        this.log("password is not recognised so prompting user to save it");

        // Prompt user to save login (via dialog or notification bar)
        //this.log("orig window has name:" + win.name);
        keeFoxUI.setWindow(win);
        keeFoxUI.setDocument(doc);
        // why is forLogin.password broken here? look at dos console? original input? form field identification?
        //this.log("details1:" + formLogin.username + ":" + formLogin.password + ":" );
        keeFoxUI.promptToSavePassword(formLogin);
        //this.log("details2:" + formLogin.username + ":" + formLogin.password + ":" );
        
        
        
        

/* this Mozilla code is effectively ehre just to enable automatic updating of passwords.
Neat, but I'm not convinced that it is 100% fool-proof and essential. maybe it will
 help me implement a similar feature in the future.
        // Look for an existing login that matches the form login.
        var existingLogin = null;
        var logins = this.findLogins({}, hostname, formSubmitURL, null);

        for (var i = 0; i < logins.length; i++) {
            var same, login = logins[i];

            // If one login has a username but the other doesn't, ignore
            // the username when comparing and only match if they have the
            // same password. Otherwise, compare the logins and match even
            // if the passwords differ.
            if (!login.username && formLogin.username) {
                var restoreMe = formLogin.username;
                formLogin.username = ""; 
                same = formLogin.matches(login, false);
                formLogin.username = restoreMe;
            } else if (!formLogin.username && login.username) {
                formLogin.username = login.username;
                same = formLogin.matches(login, false);
                formLogin.username = ""; // we know it's always blank.
            } else {
                same = formLogin.matches(login, true);
            }

            if (same) {
                existingLogin = login;
                break;
            }
        }

        if (existingLogin) {
            this.log("Found an existing login matching this form submission");

            /*
             * Change password if needed.
             *
             * If the login has a username, change the password w/o prompting
             * (because we can be fairly sure there's only one password
             * associated with the username). But for logins without a
             * username, ask the user... Some sites use a password-only "login"
             * in different contexts (enter your PIN, answer a security
             * question, etc), and without a username we can't be sure if
             * modifying an existing login is the right thing to do.
             *
            if (existingLogin.password != formLogin.password) {
                if (formLogin.username) {
                    this.log("...Updating password for existing login.");
                    this.modifyLogin(existingLogin, formLogin);
                } else {
                    this.log("...passwords differ, prompting to change.");
                    keeFoxUI.setWindow(win);
                    keeFoxUI.setDocument(doc);
                    keeFoxUI.promptToChangePassword(existingLogin, formLogin);
                }
            }

            return;
        }
        */

    };