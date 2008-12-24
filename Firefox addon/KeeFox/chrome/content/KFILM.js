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
//var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
//                 .getService(Components.interfaces.nsIWindowMediator);
//var window = wm.getMostRecentWindow("navigator:browser");
//var gBrowser = window.getBrowser();
//var container = gBrowser.tabContainer;
//container.addEventListener("TabSelect", keeFoxInst._onTabSelected, false);
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

                case "DOMAutoComplete":
                case "blur":
                    inputElement = event.target;
                    this._pwmgr._fillPassword(inputElement);
                    return;

                default:
                    this._pwmgr.log("Oops! This event unexpected.");
                    return;
            }
        }
    },
    
    /*
     * autoCompleteSearch
     *
     * Yuck. This is called directly by satchel:
     * nsFormFillController::StartSearch()
     * [toolkit/components/satchel/src/nsFormFillController.cpp]
     *
     * We really ought to have a simple way for code to register an
     * auto-complete provider, and not have satchel calling pwmgr directly.
     *
     yes, I agree, this is shit. How can I get FF to call this function rather
     than the login manager version as per cpp file above?
     maybe have to repeat a ton of mozilla code to implement autocomplete
     stuff myself becuase of this limitation? :-(
     
     */
    autoCompleteSearch : function (aSearchString, aPreviousResult, aElement) {
        // aPreviousResult & aResult are nsIAutoCompleteResult,
        // aElement is nsIDOMHTMLInputElement

        //if (!this._remember)
        //    return false;

        this.log("AutoCompleteSearch invoked. Search is: " + aSearchString);

        var result = null;

        if (aPreviousResult) {
            this.log("Using previous autocomplete result");
            result = aPreviousResult;

            // We have a list of results for a shorter search string, so just
            // filter them further based on the new search string.
            // Count backwards, because result.matchCount is decremented
            // when we remove an entry.
            for (var i = result.matchCount - 1; i >= 0; i--) {
                var match = result.getValueAt(i);

                // Remove results that are too short, or have different prefix.
                if (aSearchString.length > match.length ||
                    aSearchString.toLowerCase() !=
                        match.substr(0, aSearchString.length).toLowerCase())
                {
                    this.log("Removing autocomplete entry '" + match + "'");
                    result.removeValueAt(i, false);
                }
            }
        } else {
            this.log("Creating new autocomplete search result.");

            var doc = aElement.ownerDocument;
            var origin = this._getPasswordOrigin(doc.documentURI);
            var actionOrigin = this._getActionOrigin(aElement.form);

            var logins = this.findLogins({}, origin, actionOrigin, null);
            var matchingLogins = [];

            for (i = 0; i < logins.length; i++) {
                var username = logins[i].username.toLowerCase();
                if (aSearchString.length <= username.length &&
                    aSearchString.toLowerCase() ==
                        username.substr(0, aSearchString.length))
                {
                    matchingLogins.push(logins[i]);
                }
            }
            this.log(matchingLogins.length + " autocomplete logins avail.");
            result = new UserAutoCompleteResult(aSearchString, matchingLogins);
        }

        return result;
    },
    
    /*
     * _isAutoCompleteDisabled
     *
     * Returns true if the page requests autocomplete be disabled for the
     * specified form input.
     */
    _isAutocompleteDisabled :  function (element) {
        if (element && element.hasAttribute("autocomplete") &&
            element.getAttribute("autocomplete").toLowerCase() == "off")
            return true;

        return false;
    },
    
    /*
     * _fillPassword
     *
     * The user has autocompleted a username field, so fill in the password.
     */
    _fillPassword : function (usernameField) {
        this.log("fillPassword autocomplete username: " + usernameField.value);

        var form = usernameField.form;
        var doc = form.ownerDocument;

        var hostname = this._getPasswordOrigin(doc.documentURI);
        var formSubmitURL = this._getActionOrigin(form)

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

        // Temporary LoginInfo with the info we know.
        var currentLogin = new this._kfLoginInfo();
        currentLogin.init(hostname, formSubmitURL, null,
                          usernameField.value, null,
                          usernameField.name, passwordField.name);

        // Look for a existing login and use its password.
        var match = null;
        var logins = this.findLogins({}, hostname, formSubmitURL, null);
        this.log(logins.count);
        if (!logins.some(function(l) {
                                match = l;
                                return currentLogin.matches(l, true);
                        }))
        {
            this.log("Can't find a login for this autocomplete result.");
            return;
        }

        this.log("Found a matching login, filling in password.");
        passwordField.value = match.password;
    },
    
    
    
    /*
     * _getPasswordFields
     *
     * Returns an array of password field elements for the specified form.
     * If no pw fields are found, or if more than 3 are found, then null
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
        } else if (pwFields.length > 3) {
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
     * Returns: [usernameField, newPasswordField, oldPasswordField]
     *
     * usernameField may be null.
     * newPasswordField will always be non-null.
     * oldPasswordField may be null. If null, newPasswordField is just
     * "theLoginField". If not null, the form is apparently a
     * change-password field, with oldPasswordField containing the password
     * that is being changed.
     */
    _getFormFields : function (form, isSubmission) {
        var usernameField = null;

        // Locate the password field(s) in the form. Up to 3 supported.
        // If there's no password field, there's nothing for us to do.
        var pwFields = this._getPasswordFields(form, isSubmission);
        if (!pwFields)
            return [null, null, null];


        // Locate the username field in the form by searching backwards
        // from the first passwordfield, assume the first text field is the
        // username. We might not find a username field if the user is
        // already logged in to the site. 
        for (var i = pwFields[0].index - 1; i >= 0; i--) {
            if (form.elements[i].type == "text") {
                usernameField = form.elements[i];
                break;
            }
        }

        if (!usernameField)
            this.log("(form -- no username field found)");


        // If we're not submitting a form (it's a page load), there are no
        // password field values for us to use for identifying fields. So,
        // just assume the first password field is the one to be filled in.
        if (!isSubmission || pwFields.length == 1)
            return [usernameField, pwFields[0].element, null];


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
    findLogins : function (count, hostname, formSubmitURL, httpRealm) {
        this.log("Searching for logins matching host: " + hostname +
            ", formSubmitURL: " + formSubmitURL + ", httpRealm: " + httpRealm);

        return this._kf._KeeFoxXPCOMobj.findLogins(count, hostname, formSubmitURL, httpRealm);
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
     * _attachToInput
     *
     * Hooks up autocomplete support to a username field, to allow
     * a user editing the field to select an existing login and have
     * the password field filled in.
     */
    _attachToInput : function (element) {
        this.log("attaching autocomplete stuff");
        element.addEventListener("blur",
                                this._domEventListener, false);
        element.addEventListener("DOMAutoComplete",
                                this._domEventListener, false);
        this._formFillService.markAsLoginManagerField(element);
    },
    
    /*
     * _fillDocument
     *
     * Called when a page has loaded. For each form in the document,
     * we check to see if it can be filled with a stored login.
     */
    _fillDocument : function (doc)
    {
    
        this.log("attempting document fill");
        
        temp = this._testKeePassConnection();
        this.log ("if it's running, this should be the KeePass DB name: " + temp);
    
    
        var forms = doc.forms;
        if (!forms || forms.length == 0)
        {
            this.log("No forms found on this page");
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

        var autofillForm = true;//this._prefBranch.getBoolPref("autofillForms");
        var previousActionOrigin = null;

        for (var i = 0; i < forms.length; i++) {
            var form = forms[i];

            // Heuristically determine what the user/pass fields are
            // We do this before checking to see if logins are stored,
            // so that the user isn't prompted for a master password
            // without need.
            //TODO: is this Mozilla stuff useful or should we change it?
            var [usernameField, passwordField, ignored] =
                this._getFormFields(form, false);
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
        
            var useMozillaFillMethod = false; // getPref
            
            if (useMozillaFillMethod)
            {
                this.log("Using Mozilla-style autocomplete password fill");
                // Attach autocomplete stuff to the username field, if we have
                // one. This is normally used to select from multiple accounts,
                // but even with one account we should refill if the user edits.
                if (usernameField)
                    this._attachToInput(usernameField);

                // If the form has an autocomplete=off attribute in play, don't
                // fill in the login automatically. We check this after attaching
                // the autocomplete stuff to the username field, so the user can
                // still manually select a login to be filled in.
                var isFormDisabled = false;
                if (this._isAutocompleteDisabled(form) ||
                    this._isAutocompleteDisabled(usernameField) ||
                    this._isAutocompleteDisabled(passwordField)) {

                    isFormDisabled = true;
                    this.log("form[" + i + "]: not filled, has autocomplete=off");
                }

                if (autofillForm && !isFormDisabled) {

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
                //} else
                //{
                //TODO: lots of code shared between the fill options - once we know what we're
                // doing we can combine and then branch more selectively
                
                //    this.log("Using yellow bar password fill");
                
                // actually, not sure how great this option would be... could be a bit annoying!
                
               
                }
            } else
            {
                this.log("Using toolbar password fill.");

                this._toolbar.setLogins(logins);
                
                
                
                
                
                
                
                
                
                
                
                
                
                
            }
        } // foreach form

    },
    
    // TODO: how do we know which login the user wants filled in? could use form id or username input id but what if
    // there is not one of those? form action could work? I guess we can only be as accurate as the data held in KeePass
    // anyway. ultimately, if a form has a username and password field and submits to the same action as the one in 
    // KeePass, we should be safe. maybe breaks if same form action used but just with hidden ids to change the mode 
    // of the resulting page. maybe try form and/or input field id match first and fall abck to action URL?
    
    // so, how idetify the login to be used? could use session storage to link a given login object with a given form/tab
    // but could be nice for security to not store unencrypted passwords anywhere that might persist (e.g. be restored
    // by session manager, tab mix plus, etc.). so maybe performance hit of accessing the logins from keepass every time
    // is worthwhile. so we just need a way to be sure we find exactly the right password when we re-run the search.
    // username field, username value, action url / http realm - all required. optionally pass on id of form and username
    // field too so we know exactly where to place the form details when they are found.
    
    // can call this function after deciding to autofill to share code?
    
    // TODO: handle situations where either forms fields or logins have dissapeared in the mean time.
    
    fill : function (usernameName,usernameValue,actionURL,usernameID,formID) {
        this.log("fill login details from username field: " + usernameName + ":" + usernameValue);
        
        var doc = Application.activeWindow.activeTab.document;
        
        var form;
        var usernameField;
        var passwordField;
        var ignored;
        
        if (usernameID != null)
        {
            usernameField = doc.getElementById(usernameID);
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
            
        } else if (formID != null)
        {
            form = usernameField.form;
            [usernameField, passwordField, ignored] = this._getFormFields(form, false);
        } else
        {
            for (var i = 0; i < doc.forms.length; i++) {
                var formi = doc.forms[i];
                if (this._getActionOrigin(formi) == actionURL)
                {
                    form = formi;
                    break;
                }
            }
            [usernameField, passwordField, ignored] = this._getFormFields(form, false);
        }

        var hostname = this._getPasswordOrigin(doc.documentURI);
       // var formSubmitURL = this._getActionOrigin(form)

        

        // Temporary LoginInfo with the info we know.
        var currentLogin = new this._kfLoginInfo();
        currentLogin.init(hostname, actionURL, null,
                          usernameValue, null,
                          usernameField.name, passwordField.name);

        // Look for a existing login and use its password.
        var match = null;
        var logins = this.findLogins({}, hostname, actionURL, null);
        this.log(logins.length);
        this.log(logins[0]);
        if (!logins.some(function(l) {
                                match = l;
                                return currentLogin.matches(l, true);
                        }))
        {
            this.log("Can't find a login for this autocomplete result.");
            return;
        }

        this.log("Found a matching login, filling in password.");
        passwordField.value = match.password;
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


        // Get the appropriate fields from the form.
        var [usernameField, newPasswordField, oldPasswordField] =
            this._getFormFields(form, true);

        // Need at least 1 valid password field to do anything.
        if (newPasswordField == null)
        {
            this.log("No new password field found in form submission.");
            return;
        }

        // Check for autocomplete=off attribute. We don't use it to prevent
        // autofilling (for existing logins), but won't save logins when it's
        // present.
        //if (this._isAutocompleteDisabled(form) ||
        //    this._isAutocompleteDisabled(usernameField) ||
        //    this._isAutocompleteDisabled(newPasswordField) ||
        //    this._isAutocompleteDisabled(oldPasswordField)) {
        //        this.log("(form submission ignored -- autocomplete=off found)");
        //        return;
        //}


        var formLogin = new this._kfLoginInfo();
        formLogin.init(hostname, formSubmitURL, null,
                    (usernameField ? usernameField.value : ""),
                    newPasswordField.value,
                    (usernameField ? usernameField.name  : ""),
                    newPasswordField.name);

        // If we didn't find a username field, but seem to be changing a
        // password, allow the user to select from a list of applicable
        // logins to update the password for.
        if (!usernameField && oldPasswordField) {

            var logins = this.findLogins({}, hostname, formSubmitURL, null);

            if (logins.length == 0) {
                // Could prompt to save this as a new password-only login.
                // This seems uncommon, and might be wrong, so ignore.
                this.log("(no logins for this host -- pwchange ignored)");
                return;
            }

            keeFoxUI.setWindow(win);
            keeFoxUI.setDocument(doc);

            if (logins.length == 1) {
                var oldLogin = logins[0];
                formLogin.username      = oldLogin.username;
                formLogin.usernameField = oldLogin.usernameField;

                keeFoxUI.promptToChangePassword(oldLogin, formLogin);
            } else {
                keeFoxUI.promptToChangePasswordWithUsernames(
                                    logins, logins.length, formLogin);
            }

            return;
        }


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
             */
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


        // Prompt user to save login (via dialog or notification bar)
        //this.log("orig window has name:" + win.name);
        keeFoxUI.setWindow(win);
        keeFoxUI.setDocument(doc);
        keeFoxUI.promptToSavePassword(formLogin);
    }
    
    
   };