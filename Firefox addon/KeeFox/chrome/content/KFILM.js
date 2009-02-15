/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the KeeFox Improved Login Manager javascript file. The KFILM object
  is mainly concerned with user-visible behaviour and actual use of the data
  in the active KeePass database. Eventually this should have enough options
  and features to allow the user fine control over their password management
  experience.
  
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

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

var Application = Components.classes["@mozilla.org/fuel/application;1"].getService(Components.interfaces.fuelIApplication);

//TODO: setup listeners, etc., disable built-in login manager, use example code to build
// basic form and/or http detection, call test function from interface, make seperate JS file
// to handle interface / notification bar stuff? or just set of functions in that same file to
// handle stuff like xpcom calls, marshalling, etc. refer to bookmarks

function KFILM(kf,keeFoxToolbar,currentWindow) {
    this.log ("KFILM constructor started");
    this.log("currentWindowName:" + currentWindow.name);

    this._kf = kf;
    this._toolbar = keeFoxToolbar;
    this._currentWindow = currentWindow;

    this.init();
    this.log ("KFILM constructor finished");
}

KFILM.prototype = {
    _test : null,
    _currentWindow : null,
    _remember : true,  // (eventually) mirrors extension.keeFox.rememberSignons preference
    _kf : null, // KeeFox object (e.g. for xpcom service access)
    _toolbar : null, // the keefox toolbar in this scope
    _kfLoginInfo : null, // Constructor for kfILoginInfo implementation

    __logService : null, // Console logging service, used for debugging.
    get _logService() {
        if (!this.__logService)
            this.__logService = Cc["@mozilla.org/consoleservice;1"].
                                getService(Ci.nsIConsoleService);
        return this.__logService;
    },
    
    __ioService: null, // IO service for string -> nsIURI conversion
    get _ioService() {
        if (!this.__ioService)
            this.__ioService = Cc["@mozilla.org/network/io-service;1"].
                               getService(Ci.nsIIOService);
        return this.__ioService;
    },


    __formFillService : null, // FormFillController, for username autocompleting
    get _formFillService() {
        if (!this.__formFillService)
            this.__formFillService =
                            Cc["@mozilla.org/satchel/form-fill-controller;1"].
                            getService(Ci.nsIFormFillController);
        return this.__formFillService;
    },
    
    // Internal function for logging debug messages to the Error Console window
    log : function (message) {
        this._logService.logStringMessage(message);
    },

    init : function () {
        this.log("ILM init start");
        //if (this._test != null)
        //this.log("test:" + this._test);

        //this.log("currentWindowName:" + this._currentWindow.name);
        
        // Cache references to current |this| in utility objects
        this._webProgressListener._domEventListener = this._domEventListener;
        this._webProgressListener._pwmgr = this;
        
        this._domEventListener._pwmgr    = this;
        this._observer._pwmgr            = this;
        
        // Preferences. Add observer so we get notified of changes.
        //this._prefBranch = Cc["@mozilla.org/preferences-service;1"].
        //                   getService(Ci.nsIPrefService).getBranch("signon.");
        //this._prefBranch.QueryInterface(Ci.nsIPrefBranch2);
        //this._prefBranch.addObserver("", this._observer, false);

        // Get current preference values.
        //this._debug = this._prefBranch.getBoolPref("debug");

        //this._remember = this._prefBranch.getBoolPref("rememberSignons");

        // Get constructor for kfILoginInfo
        this._kfLoginInfo = new Components.Constructor(
            "@christomlinson.name/kfLoginInfo;1", Ci.kfILoginInfo);

        // Form submit observer checks forms for new logins and pw changes.
        var observerService = Cc["@mozilla.org/observer-service;1"].
                              getService(Ci.nsIObserverService);
        observerService.addObserver(this._observer, "earlyformsubmit", false);
        observerService.addObserver(this._observer, "xpcom-shutdown", false);

        // WebProgressListener for getting notification of new doc loads.
        var progress = Cc["@mozilla.org/docloaderservice;1"].
                       getService(Ci.nsIWebProgress);

        try {
            progress.addProgressListener(this._webProgressListener,
                     Ci.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
        
        } catch (e) {
            this.log("couldn't add nsIWebProgress listener: " + e);
        }

            
        
// During initialisation
//TODO: why? should we really do anything like this duing init?
// well, at some point we need to clear the toolbar settings when changing between tabs... 
// remove all the old logins from the toolbar
            //this._toolbar.removeLogins();
        
        this.log("ILM init complete");
    },
    
    /*
     * _observer object
     *
     * Internal utility object, implements the nsIObserver interface.
     * Used to receive notification for: form submission, preference changes.
     */
    _observer : {
        _pwmgr : null,

        QueryInterface : XPCOMUtils.generateQI([Ci.nsIObserver, 
                                                Ci.nsIFormSubmitObserver,
                                                Ci.nsISupportsWeakReference]),

        // nsFormSubmitObserver
        notify : function (formElement, aWindow, actionURI) {
            this._pwmgr.log("observer notified for form submission.");

            try {
                this._pwmgr._onFormSubmit(formElement);
            } catch (e) {
                this._pwmgr.log("Caught error in onFormSubmit: " + e);
            }

            return true; // Always return true, or form submit will be canceled.
        },

        // nsObserver
        observe : function (subject, topic, data) {

            if (topic == "nsPref:changed") {
                var prefName = data;
                this._pwmgr.log("got change to " + prefName + " preference");

                if (prefName == "debug") {
                    this._pwmgr._debug = 
                        this._pwmgr._prefBranch.getBoolPref("debug");
                } else if (prefName == "rememberSignons") {
                    this._pwmgr._remember =
                        this._pwmgr._prefBranch.getBoolPref("rememberSignons");
                } else {
                    this._pwmgr.log("Oops! Pref not handled, change ignored.");
                }
            } else if (topic == "xpcom-shutdown") {
                for (let i in this._pwmgr) {
                  try {
                    this._pwmgr[i] = null;
                  } catch(ex) {}
                }
                this._pwmgr = null;
            } else {
                this._pwmgr.log("Oops! Unexpected notification: " + topic);
            }
        }
    },


    /*
     * _webProgressListener object
     *
     * Internal utility object, implements nsIWebProgressListener interface.
     * This is attached to the document loader service, so we get
     * notifications about all page loads.
     */
    _webProgressListener : {
        _pwmgr : null,
        _domEventListener : null,

        QueryInterface : XPCOMUtils.generateQI([Ci.nsIWebProgressListener,
                                                Ci.nsISupportsWeakReference]),


        onStateChange : function (aWebProgress, aRequest,
                                  aStateFlags,  aStatus) {

            // STATE_START is too early, doc is still the old page.
            if (!(aStateFlags & Ci.nsIWebProgressListener.STATE_TRANSFERRING))
                return;

            //if (!this._pwmgr._remember)
            //    return;

            var domWin = aWebProgress.DOMWindow;
            var domDoc = domWin.document;
            //this._pwmgr.log("winName:" + this._pwmgr._currentWindow.name);
            //this._pwmgr.log(this._pwmgr._test);
            //aWebProgress.DOMWindow.top.alert("test");
            //aWebProgress.alert("test");
            
            var mainWindow = domWin.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow); 

            if (mainWindow != this._pwmgr._currentWindow)
                return;
                
            // Only process things which might have HTML forms.
            if (!(domDoc instanceof Ci.nsIDOMHTMLDocument))
                return;

            this._pwmgr.log("onStateChange accepted: req = " +
                            (aRequest ?  aRequest.name : "(null)") +
                            ", flags = 0x" + aStateFlags.toString(16));

            // remove all the old logins from the toolbar
            keeFoxToolbar.removeLogins();
            
            // Fastback doesn't fire DOMContentLoaded, so process forms now.
            if (aStateFlags & Ci.nsIWebProgressListener.STATE_RESTORING) {
                this._pwmgr.log("onStateChange: restoring document");
                return this._pwmgr._fillDocument(domDoc);
            }

            // Add event listener to process page when DOM is complete.
            domDoc.addEventListener("DOMContentLoaded",
                                    this._domEventListener, false);
            return;
        },

        // stubs for the nsIWebProgressListener interfaces which we don't use.
        onProgressChange : function() { throw "Unexpected onProgressChange"; },
        onLocationChange : function() { throw "Unexpected onLocationChange"; },
        onStatusChange   : function() { throw "Unexpected onStatusChange";   },
        onSecurityChange : function() { throw "Unexpected onSecurityChange"; }
    },


    /*
     * _domEventListener object
     *
     * Internal utility object, implements nsIDOMEventListener
     * Used to catch certain DOM events needed to properly implement form fill.
     */
    _domEventListener : {
        _pwmgr : null,

        QueryInterface : XPCOMUtils.generateQI([Ci.nsIDOMEventListener,
                                                Ci.nsISupportsWeakReference]),


        handleEvent : function (event) {
            this._pwmgr.log("domEventListener: got event " + event.type);

            var doc, inputElement;
            switch (event.type) {
                case "DOMContentLoaded":
                    doc = event.target;
                    this._pwmgr._fillDocument(doc);
                    return;

                default:
                    this._pwmgr.log("Oops! This event unexpected.");
                    return;
            }
        }
    },
    
    
    /*
     * _getPasswordFields
     *
     * Returns an array of password field elements for the specified form.
     * If no pw fields are found, or if more than 10 are found, then null
     * is returned.
     *
     * skipEmptyFields can be set to ignore password fields with no value.
     */
    _getPasswordFields : function (form, skipEmptyFields) {
        // Locate the password fields in the form.
        var pwFields = [];
        for (var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].type != "password")
                continue;

            if (skipEmptyFields && !form.elements[i].value)
                continue;

            pwFields[pwFields.length] = {
                                            index   : i,
                                            element : form.elements[i]
                                        };
        }

        // If too few or too many fields, bail out.
        if (pwFields.length == 0) {
            this.log("(form ignored -- no password fields.)");
            return null;
        } else if (pwFields.length > 10) {
            this.log("(form ignored -- too many password fields. [got " +
                        pwFields.length + "])");
            return null;
        }

        return pwFields;
    },


    /*
     * _getFormFields
     *
     * Returns the username and password fields found in the form.
     * Can handle complex forms by trying to figure out what the
     * relevant fields are.
     *
     * Returns: [usernameField, passwords, ...]
     *
     * usernameField may be null.
     */
    _getFormFields : function (form, isSubmission) {
        var usernameField = null;

        // Locate the password field(s) in the form. Up to 3 supported.
        // If there's no password field, there's nothing for us to do.
        var pwFields = this._getPasswordFields(form, isSubmission);
        if (!pwFields)
            return [null, null];


        // Locate the username field in the form by searching backwards
        // from the first passwordfield, assume the first text field is the
        // username. If this fails, try to find a hidden field with one of a number of names.
        // We might not find a username field if the user is
        // already logged in to the site. 
        // could be extended to consider name of text fields too in order to make better
        // judgement rather than just pick first one we find.
        for (var i = pwFields[0].index - 1; i >= 0; i--) {
            if (form.elements[i].type == "text") {
                usernameField = form.elements[i];
                break;
            }
        }
        if (!usernameField)
            for (var i = 0; i < form.elements.length; i++) {
                if (form.elements[i].type == "hidden" && form.elements[i].name == "j_username") { // TODO: array of username field names
                    usernameField = form.elements[i];
                    break;
                }
            }

        if (!usernameField)
            this.log("(form -- no username field found)");


        // If we're not submitting a form (it's a page load), there are no
        // password field values for us to use for identifying fields. So,
        // just assume the first password field is the one to be filled in.
        // blah, just do it anyway. caller can make the decision - it shouldn't
        // be down to this function to interpret the situation since it may be 
        // easier to do basde on knowledge of circumstances that led to the function being called
        //if (!isSubmission || pwFields.length == 1)
            return [usernameField, pwFields];

/*
        // Try to figure out WTF is in the form based on the password values.
        var oldPasswordField, newPasswordField;
        var pw1 = pwFields[0].element.value;
        var pw2 = pwFields[1].element.value;
        var pw3 = (pwFields[2] ? pwFields[2].element.value : null);

        if (pwFields.length == 3) {
            // Look for two identical passwords, that's the new password

            if (pw1 == pw2 && pw2 == pw3) {
                // All 3 passwords the same? Weird! Treat as if 1 pw field.
                newPasswordField = pwFields[0].element;
                oldPasswordField = null;
            } else if (pw1 == pw2) {
                newPasswordField = pwFields[0].element;
                oldPasswordField = pwFields[2].element;
            } else if (pw2 == pw3) {
                oldPasswordField = pwFields[0].element;
                newPasswordField = pwFields[2].element;
            } else  if (pw1 == pw3) {
                // A bit odd, but could make sense with the right page layout.
                newPasswordField = pwFields[0].element;
                oldPasswordField = pwFields[1].element;
            } else {
                // We can't tell which of the 3 passwords should be saved.
                this.log("(form ignored -- all 3 pw fields differ)");
                return [null, null, null];
            }
        } else { // pwFields.length == 2
            if (pw1 == pw2) {
                // Treat as if 1 pw field
                newPasswordField = pwFields[0].element;
                oldPasswordField = null;
            } else {
                // Just assume that the 2nd password is the new password
                oldPasswordField = pwFields[0].element;
                newPasswordField = pwFields[1].element;
            }
        }

        return [usernameField, newPasswordField, oldPasswordField];
        */
    },
    
    
    _testKeePassConnection : function ()
    {
        //this._kf._KeeFoxXPCOMobj.getDBName(new WrapperClass(theObject));
        if (this._kf._keeFoxStorage.get("KeeICEActive",false))
        {
            return this._kf._KeeFoxXPCOMobj.getDBName();
        }
    },
    
    /*
     * addLogin
     *
     * Add a new login to login storage.
     */
    addLogin : function (login) {
        // Sanity check the login
        if (login.hostname == null || login.hostname.length == 0)
            throw "Can't add a login with a null or empty hostname.";

        // For logins w/o a username, set to "", not null.
        if (login.username == null)
            throw "Can't add a login with a null username.";

        if (login.password == null || login.password.length == 0)
            throw "Can't add a login with a null or empty password.";

        if (login.formSubmitURL || login.formSubmitURL == "") {
            // We have a form submit URL. Can't have a HTTP realm.
            if (login.httpRealm != null)
                throw "Can't add a login with both a httpRealm and formSubmitURL.";
        } else if (login.httpRealm) {
            // We have a HTTP realm. Can't have a form submit URL.
            if (login.formSubmitURL != null)
                throw "Can't add a login with both a httpRealm and formSubmitURL.";
        } else {
            // Need one or the other!
            throw "Can't add a login without a httpRealm or formSubmitURL.";
        }


        // Look for an existing entry.
        var logins = this.findLogins({}, login.hostname, login.formSubmitURL,
                                     login.httpRealm);

        if (logins.some(function(l) login.matches(l, true)))
            throw "This login already exists.";

        this.log("Adding login: " + login);
        return this._kf._KeeFoxXPCOMobj.addLogin(login);
    },


    /*
     * removeLogin
     *
     * Remove the specified login from the stored logins.
     */
    removeLogin : function (login) {
        this.log("Removing login: " + login);
        return this._kf._KeeFoxXPCOMobj.removeLogin(login);
    },


    /*
     * modifyLogin
     *
     * Change the specified login to match the new login.
     */
    modifyLogin : function (oldLogin, newLogin) {
        this.log("Modifying oldLogin: " + oldLogin + " newLogin: " + newLogin);
        return this._kf._KeeFoxXPCOMobj.modifyLogin(oldLogin, newLogin);
    },


    /*
     * getAllLogins
     *
     * Get a dump of all stored logins. Used by the login manager UI.
     *
     * |count| is only needed for XPCOM.
     *
     * Returns an array of logins. If there are no logins, the array is empty.
     */
    getAllLogins : function (count) {
        this.log("Getting a list of all logins");
        return this._kf._KeeFoxXPCOMobj.getAllLogins(count);
    },
        
    /*
     * findLogins
     *
     * Search for the known logins for entries matching the specified criteria.
     */
    findLogins : function (count, hostname, formSubmitURL, httpRealm, uniqueID) {
        this.log("Searching for logins matching host: " + hostname +
            ", formSubmitURL: " + formSubmitURL + ", httpRealm: " + httpRealm
             + ", uniqueID: " + uniqueID);

        return this._kf._KeeFoxXPCOMobj.findLogins(count, hostname, formSubmitURL, httpRealm, uniqueID);
    },
    
    countLogins : function (hostName,actionURL,loginSearchType)
    {
        
        if (this._kf._keeFoxStorage.get("KeeICEActive",false))
        {
            return this._kf._KeeFoxXPCOMobj.countLogins(hostName,actionURL,loginSearchType);
        }
    },
    
    /*
     * _getPasswordOrigin
     *
     * Get the parts of the URL we want for identification.
     */
    _getPasswordOrigin : function (uriString, allowJS) {
        var realm = "";
        try {
            var uri = this._ioService.newURI(uriString, null, null);

            if (allowJS && uri.scheme == "javascript")
                return "javascript:"

            realm = uri.scheme + "://" + uri.host;

            // If the URI explicitly specified a port, only include it when
            // it's not the default. (We never want "http://foo.com:80")
            var port = uri.port;
            if (port != -1) {
                var handler = this._ioService.getProtocolHandler(uri.scheme);
                if (port != handler.defaultPort)
                    realm += ":" + port;
            }

        } catch (e) {
            // bug 159484 - disallow url types that don't support a hostPort.
            // (although we handle "javascript:..." as a special case above.)
            this.log("Couldn't parse origin for " + uriString);
            realm = null;
        }

        return realm;
    },
    
    
    _getActionOrigin : function (form) {
        var uriString = form.action;

        // A blank or mission action submits to where it came from.
        if (uriString == "")
            uriString = form.baseURI;

        return this._getPasswordOrigin(uriString, true);
    },
    
    /*
     * _fillDocument
     *
     * Called when a page has loaded. For each form in the document,
     * we check to see if it can be filled with a stored login.
     */
    _fillDocument : function (doc)
    {
    this.log(doc.defaultView);
    
    var mainWindow = doc.defaultView.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);

        if (mainWindow.content.document != doc)// TODO: check this is a valid way to come to this decision
        {
            this.log("skipping document fill (this is not the currently active tab)");
            return;
        }

        this.log("attempting document fill");
        
        //temp = this._testKeePassConnection();
        //this.log ("if it's running, this should be the KeePass DB name: " + temp);
    
    
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
            
            if (notifyBarWhenKeeICEInactive)
            {
                keeFoxUI.setWindow(doc.defaultView);
                keeFoxUI.setDocument(doc);
                keeFoxUI._showLaunchKFNotification();
            }
            keeFoxToolbar._currentWindow.setTimeout(keeFoxToolbar.flashItem, 10, keeFoxToolbar._currentWindow.document.getElementById('KeeFox_Main-Button'), 12, keeFoxToolbar._currentWindow);
            return;
        } else if (!keeFoxInst._keeFoxStorage.get("KeePassDatabaseOpen", false))
        {
            notifyBarWhenLoggedOut = keeFoxInst._keeFoxExtension.prefs.getValue("notifyBarWhenLoggedOut",false);
            
            if (notifyBarWhenLoggedOut)
            {
                keeFoxUI.setWindow(doc.defaultView);
                keeFoxUI.setDocument(doc);
                keeFoxUI._showLoginToKFNotification();
            }
            keeFoxToolbar._currentWindow.setTimeout(keeFoxToolbar.flashItem, 10, keeFoxToolbar._currentWindow.document.getElementById('KeeFox_Main-Button'), 12, keeFoxToolbar._currentWindow);
            return;
        }

        var formOrigin = this._getPasswordOrigin(doc.documentURI);

        // If there are no logins for this site, bail out now.
        if (!this.countLogins(formOrigin, "", null))
        {
            this.log("No logins found for this site");
            return;
        }

        this.log("fillDocument processing " + forms.length +
                 " forms on " + doc.documentURI);

        var previousActionOrigin = null;

        for (var i = 0; i < forms.length; i++) {
            var form = forms[i];

            // Heuristically determine what the user/pass fields are
            // We do this before checking to see if logins are stored,
            // so that the user isn't prompted for a master password
            // without need.
            //TODO: is this Mozilla stuff useful or should we change it?
            var [usernameField, passwords] =
                this._getFormFields(form, false);
            var passwordField;
            
            if (passwords != null && passwords[0] != null)
                passwordField = passwords[0];
                
            // Need a valid password field to do anything.
            if (passwordField == null)
            {
                this.log("no password field found in this form");
                continue;
            }


            // Only the actionOrigin might be changing, so if it's the same
            // as the last form on the page we can reuse the same logins.
            var actionOrigin = this._getActionOrigin(form);
            if (actionOrigin != previousActionOrigin) {
                var foundLogins =
                    this.findLogins({}, formOrigin, actionOrigin, null);

                this.log("form[" + i + "]: found " + foundLogins.length +
                        " matching logins.");

                previousActionOrigin = actionOrigin;
            } else {
                this.log("form[" + i + "]: reusing logins from last form.");
            }


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

            logins = foundLogins.filter(function (l) {
                    var fit = (l.username.length <= maxUsernameLen &&
                               l.password.length <= maxPasswordLen);
                    if (!fit)
                        this.log("Ignored " + l.username + " login: won't fit");

                    return fit;
                }, this);


            // Nothing to do if we have no matching logins available.
            if (logins.length == 0)
                continue;
            
            this.log("match found!");
            
            var autofillForm = true;//this._prefBranch.getBoolPref("autofillForms");
        
            if (autofillForm) {

                if (usernameField && usernameField.value) {
                    // If username was specified in the form, only fill in the
                    // password if we find a matching login.

                    var username = usernameField.value;

                    var matchingLogin;
                    var found = logins.some(function(l) {
                                                matchingLogin = l;
                                                return (l.username == username);
                                            });
                    if (found)
                        passwordField.value = matchingLogin.password;
                    else
                        this.log("Password not filled. None of the stored " +
                                 "logins match the username already present.");

                } else if (usernameField && logins.length == 2) {
                //TODO: this needs reworking RE KeePass storage options
                    // Special case, for sites which have a normal user+pass
                    // login *and* a password-only login (eg, a PIN)...
                    // When we have a username field and 1 of 2 available
                    // logins is password-only, go ahead and prefill the
                    // one with a username.
                    if (!logins[0].username && logins[1].username) {
                        usernameField.value = logins[1].username;
                        passwordField.value = logins[1].password;
                    } else if (!logins[1].username && logins[0].username) {
                        usernameField.value = logins[0].username;
                        passwordField.value = logins[0].password;
                    }
                } 
                
                //TODO: more scope to improve here - control over default login to autofill rather than just pick the first?
                // or make this the point where we look for exactURL matches, etc.
                
                else if (logins.length == 1) {
                
                    if (usernameField)
                        usernameField.value = logins[0].username;
                    passwordField.value = logins[0].password;
                } else {
                    this.log("Multiple logins for form, so not filling any."); //TODO: weak! We can do better soon...
                }
                
            }// else
            //{
                this.log("Using toolbar password fill.");

                this._toolbar.setLogins(logins);
                
                
            //}
        } // foreach form

    },
    
    // TODO: how do we know which login the user wants filled in? could use form id or username input id but what if
    // there is not one of those? form action could work? I guess we can only be as accurate as the data held in KeePass
    // anyway. ultimately, if a form has a username and password field and submits to the same action as the one in 
    // KeePass, we should be safe. maybe breaks if same form action used but just with hidden ids to change the mode 
    // of the resulting page. maybe try form and/or input field id match first and fall abck to action URL?
    
    // login to be used is indentified via KeePass uniqueID (GUID)
    // can we call this function after deciding to autofill (to share code)?
    
    // TODO: handle situations where either forms fields or logins have dissapeared in the mean time.

    //TODO: formID innacurate (so not used yet)
    fill : function (usernameName,usernameValue,actionURL,usernameID,formID,uniqueID) {
        this.log("fill login details from username field: " + usernameName + ":" + usernameValue);
        
        var doc = Application.activeWindow.activeTab.document;
        
        var form;
        var usernameField;
        var passwordField;
        var ignored;
        
        
        
        if ((form == undefined || form == null) && usernameID != null)
        {
            usernameField = doc.getElementById(usernameID);
            
            if (usernameField != null)
            {
                form = usernameField.form;
            
                // Find the password field. We should always have at least one,
                // or else something has gone rather wrong.
                var pwFields = this._getPasswordFields(form, false);
                if (!pwFields) {
                    const err = "No password field for autocomplete password fill.";

                    // We want to know about this even if debugging is disabled.
                    if (!this._debug)
                        dump(err);
                    else
                        this.log(err);

                    return;
                }

                // If there are multiple passwords fields, we can't really figure
                // out what each field is for, so just fill out the last field.
                var passwordField = pwFields[0].element;
            }
            
        }
        
        /*if ((form == undefined || form == null) && formID != null)
        {
            form = usernameField.form;
            if (form != null)
            {
                [usernameField, passwords] = this._getFormFields(form, false);
                var passwordField = passwords[0].element;
            }
        }*/
        
        if (form == undefined || form == null)
        {
            for (var i = 0; i < doc.forms.length; i++) {
                var formi = doc.forms[i];
                if (this._getActionOrigin(formi) == actionURL)
                {
                    form = formi;
                    [usernameField, passwords] = this._getFormFields(form, false);
                    
                    if (passwords == null || passwords.length == 0)
                        continue;
                    
                    var passwordField = passwords[0].element;
                    break;
                }
            }
            
        }
        
        if (passwordField == null)
        {
            this.log("Can't find any form with a password field. This could indicate that this page uses some odd javascript to delete forms dynamically after the page has loaded.");
            return;
        }

        var hostname = this._getPasswordOrigin(doc.documentURI);
       // var formSubmitURL = this._getActionOrigin(form)

//TODO: initCustom then extend search function to weight the id of form items
        // Temporary LoginInfo with the info we know.
        var currentLogin = new this._kfLoginInfo();
        currentLogin.init(hostname, actionURL, null,
                          usernameValue, null,
                          (usernameField ? usernameField.name  : ""),
                          passwordField.name, uniqueID);

        // Look for a existing login and use its password.
        var match = null;
        var logins = this.findLogins({}, hostname, actionURL, null, uniqueID);
        this.log(logins.length);
        this.log(logins[0]);
        
        if (uniqueID && logins.length == 1)
        {
            match = logins[0];
        } else
        {
            for (var i=0; i < logins.length; i++)
            {
                if (currentLogin.matches(logins[i], true))
                {
                    match = logins[i];
                    this.log(logins[i]);
                    break;
                }
            }
        }
        
        if (match == null)
        {
            this.log("Can't find a login for this autocomplete result.");
            return;
        }

        this.log("Found a matching login, filling in password.");
        // TODO: this whole function could be improved if there's a way to support filling of multiple password fields (either with different or the same password)
        passwordField.value = match.password;
        if (usernameField != null)
            usernameField.value = match.username;
    },
    
    /*
     * _onFormSubmit
     *
     * Called by the our observer when notified of a form submission.
     * [Note that this happens before any DOM onsubmit handlers are invoked.]
     * Looks for a password change in the submitted form, so we can update
     * our stored password.
     */
    _onFormSubmit : function (form) {

        this.log("Form submit handler started");

        var doc = form.ownerDocument;
        var win = doc.defaultView;

        // If password saving is disabled (globally or for host), bail out now.
        //if (!this._remember)
        //    return;

        var hostname      = this._getPasswordOrigin(doc.documentURI);
        var formSubmitURL = this._getActionOrigin(form)
        //if (!this.getLoginSavingEnabled(hostname)) {
        //    this.log("(form submission ignored -- saving is " +
        //             "disabled for: " + hostname + ")");
        //    return;
        //}


/* this is where we have to really improve built in stuff...
 we know what form has been submitted but everything else has to be inferred
 
 1 password & optional username = login
 2 password & optional username = login including PIN
 3 password & optional username = login including multiple PINs
 etc.
 
 2 password & text or hidden username = sign up
 2 password = second stage sign up
 2 password = second stage log in
 
 doesn't matter if login or signup - in both cases we need to check if details 
 already stored and if different we prompt for update?
 
 password change is important difference. this will be if ?...
 
 */
        // Get the appropriate fields from the form.
        
        var newPasswordField, oldPasswordField;
        
        // all except passwords are optional. must be at least one password in the array
        //potentially extend with another Array of custom fields in future (e.g. profile details, sign-in options)
        var [usernameField, passwords] =
            this._getFormFields(form, true);

        // Need at least 1 valid password field to do anything.
        if (passwords == null || passwords[0] == null || passwords[0] == undefined)
        {
            this.log("No password field found in form submission.");
            return;
        }
        
        
        if (passwords.length > 1) // could be password change form or multi-password login form or sign up form
        {
            
            // naive duplicate finder - more than sufficient for the number of passwords per domain
            twoPasswordsMatchIndex=-1;
            for(i=0;i<passwords.length && twoPasswordsMatchIndex == -1;i++)
                for(j=i+1;j<passwords.length && twoPasswordsMatchIndex == -1;j++)
                    if(passwords[j].element.value==passwords[i].element.value) twoPasswordsMatchIndex=j;
            
            if (twoPasswordsMatchIndex == -1) // either mis-typed password change form, single password change box form or multi-password login/signup
            {
                // we don't support these situations yet
                this.log("unsupported situation");
                return;
            } else // it's probably a password change form
            {
                this.log("Looks like a password change form has been submitted");
                // there may be more than one pair of matches - tough, we're plucking for the first one
                // we know the index of one matching password
                
                // if there are only two passwords
                if (passwords.length == 2)
                {
                    newPasswordField = passwords[0].element;
                    this.log("test1:" + newPasswordField.value);
                } else
                {
                    newPasswordField = passwords[twoPasswordsMatchIndex].element;
                    this.log("test2:" + newPasswordField.value);
                    for(i=0;i<passwords.length;i++)
                        if(newPasswordField.value != passwords[i].element.value)
                            oldPasswordField = passwords[i].element;
                }
            
            }
        

        
        } else
        {
            newPasswordField = passwords[0].element;
            this.log("test3a:" + newPasswordField.value);
            //this.log("test3b:" + newPasswordField.element);
            //this.log("test3c:" + newPasswordField.element.value);
        }
        
        // at this point, newPasswordField has been chosen and oldPasswordField has been chosen if applicable

        var formLogin = new this._kfLoginInfo();
        
        if ((usernameField != null && usernameField.id != null) || (newPasswordField != null && newPasswordField.id != null))
        {
            var customWrapper;
            if (newPasswordField == null || newPasswordField.id == null)
                customWrapper = keeFoxInst.kfLoginInfoCustomFieldsWrapper("special_form_username_ID",usernameField.id);
            else if (usernameField == null || usernameField.id == null)
                customWrapper = keeFoxInst.kfLoginInfoCustomFieldsWrapper("special_form_password_ID",newPasswordField.id);
            else
                customWrapper = keeFoxInst.kfLoginInfoCustomFieldsWrapper("special_form_username_ID",usernameField.id,"special_form_password_ID",newPasswordField.id);
            
            this.log("test:" + newPasswordField.value);
            
            formLogin.initCustom(hostname, formSubmitURL, null,
                    (usernameField ? usernameField.value : ""),
                    newPasswordField.value,
                    (usernameField ? usernameField.name  : ""),
                    newPasswordField.name, null, customWrapper);
            this.log("login object initialised with custom data");
        } else
        {
            formLogin.init(hostname, formSubmitURL, null,
                    (usernameField ? usernameField.value : ""),
                    newPasswordField.value,
                    (usernameField ? usernameField.name  : ""),
                    newPasswordField.name, null);
            this.log("login object initialised without custom data");
        }
        
        // Look for an existing login that matches the form login.
        var existingLogin = null;
        var logins = this.findLogins({}, hostname, formSubmitURL, null, null);
        
        // if user was not logged in and cancelled the login process, we can't
        // proceed (becuase all passwords will appear to be new)
        // rather than use the normal storage variable, I'm going to the source (KeICE)
        // just to cover situations where this thread reaches this point before the usual
        // variable has been updated.
        var dbName = this._kf._KeeFoxXPCOMobj.getDBName();
                
        if (dbName == "")
        {
            this.log("User did not successfully open a KeePass database. Aborting password save procedure.");
            return;
        }
        
        
this.log("temp1");
        for (var i = 0; i < logins.length; i++)
        {this.log("temp1a");
            var same, login = logins[i];

            // If one login has a username but the other doesn't, ignore
            // the username when comparing and only match if they have the
            // same password. Otherwise, compare the logins and match even
            // if the passwords differ.
            // CPT: this seems flawed. maybe i put it in the wrong place now but it
            // doesn't make sence to match passwords under any circumstances when we're
            // on the lookout for changed passwords.
            //TODO maybe: handle seperate cases based on existance of oldPasswordField
            if (!login.username && formLogin.username) {
                var restoreMe = formLogin.username;
                formLogin.username = ""; 
                same = formLogin.matches(login, true);
                formLogin.username = restoreMe;
            } else if (!formLogin.username && login.username) {
                formLogin.username = login.username;
                same = formLogin.matches(login, true);
                formLogin.username = ""; // we know it's always blank.
            } else {
                same = formLogin.matches(login, true);
            }

            if (same) {
                this.log("login object matches with a stored login");
                existingLogin = login;
                break;
            }
        }
this.log("temp2");
        

        if (oldPasswordField != null) // we are changing the password
        {
            
            if (existingLogin) // as long as we have previously stored a login for this site...
            {
                this.log("we are changing the password");
                keeFoxUI.setWindow(win);
                keeFoxUI.setDocument(doc);

                if (logins.length == 1) { // only one option so update username details from old login (in case they weren't included in the form)
                    var oldLogin = logins[0];
                    formLogin.username      = oldLogin.username;
                    formLogin.usernameField = oldLogin.usernameField;

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
        this.log("details1:" + formLogin.username + ":" + formLogin.password + ":" );
        keeFoxUI.promptToSavePassword(formLogin);
        this.log("details2:" + formLogin.username + ":" + formLogin.password + ":" );
        
        
        
        

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

    }
    
    
   };
   
   
   
   
   
   
   /*
   
   
        // Try to figure out WTF is in the form based on the password values.
        var oldPasswordField, newPasswordField;
        var pw1 = pwFields[0].element.value;
        var pw2 = pwFields[1].element.value;
        var pw3 = (pwFields[2] ? pwFields[2].element.value : null);

        if (pwFields.length == 3) {
            // Look for two identical passwords, that's the new password

            if (pw1 == pw2 && pw2 == pw3) {
                // All 3 passwords the same? Weird! Treat as if 1 pw field.
                newPasswordField = pwFields[0].element;
                oldPasswordField = null;
            } else if (pw1 == pw2) {
                newPasswordField = pwFields[0].element;
                oldPasswordField = pwFields[2].element;
            } else if (pw2 == pw3) {
                oldPasswordField = pwFields[0].element;
                newPasswordField = pwFields[2].element;
            } else  if (pw1 == pw3) {
                // A bit odd, but could make sense with the right page layout.
                newPasswordField = pwFields[0].element;
                oldPasswordField = pwFields[1].element;
            } else {
                // We can't tell which of the 3 passwords should be saved.
                this.log("(form ignored -- all 3 pw fields differ)");
                return [null, null, null];
            }
        } else { // pwFields.length == 2
            if (pw1 == pw2) {
                // Treat as if 1 pw field
                newPasswordField = pwFields[0].element;
                oldPasswordField = null;
            } else {
                // Just assume that the 2nd password is the new password
                oldPasswordField = pwFields[0].element;
                newPasswordField = pwFields[1].element;
            }
        }

        return [usernameField, newPasswordField, oldPasswordField];
        
        */