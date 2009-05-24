/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
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

//TODO: disable built-in login manager

function KFILM(kf,keeFoxToolbar,currentWindow) {

    this._kf = kf;
    this._toolbar = keeFoxToolbar;
    this._currentWindow = currentWindow;
    this._refillTimer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);

    this.init();
    this.log("currentWindowName:" + currentWindow.name);
    this.log ("KFILM constructor finished");
}

KFILM.prototype = {
    _test : null,
    _currentWindow : null,
    _remember : true,  // (eventually) mirrors extension.keeFox.rememberSignons preference
    _kf : null, // KeeFox object (e.g. for xpcom service access)
    _toolbar : null, // the keefox toolbar in this scope
    _kfLoginInfo : null, // Constructor for kfILoginInfo implementation
    _refillTimer : null,

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
        dump(message+"\n");
        if (this._kf._keeFoxExtension.prefs.getValue("debugToConsole",false))
            this._logService.logStringMessage(message);
    },
    
    
    //TODO: improve weighting of matches to reflect real world tests
    _calculateRelevanceScore : function (login, form, usernameField, passwordField) {

        var score = 0;
        var actionURL = this._getActionOrigin(form);
        var URL = form.baseURI;
        
        if (actionURL == login.formActionURL)
            score += 20;
            
        if (this._getURIExcludingQS(actionURL) == this._getURIExcludingQS(login.formActionURL))
            score += 15;
            
        if (this._getURISchemeHostAndPort(actionURL) == this._getURISchemeHostAndPort(login.formActionURL))
            score += 10;
            
        if (this._getURIHostAndPort(actionURL) == this._getURIHostAndPort(login.formActionURL))
            score += 8;

        if (URL == login.URL)
            score += 7;
            
        if (this._getURIExcludingQS(URL) == this._getURIExcludingQS(login.URL))
            score += 6;
            
        if (this._getURISchemeHostAndPort(URL) == this._getURISchemeHostAndPort(login.URL))
            score += 5;
            
        if (this._getURIHostAndPort(URL) == this._getURIHostAndPort(login.URL))
            score += 4;

        // TODO: username and password field test unlikely to help much but shouldn't harm either so will leave it in for testing for a bit
        if (usernameField == login.usernameField)
            score += 3;
            
        if (passwordField == login.passwordField)
            score += 2;
        
        this.log("Relevance for " + login.username + " is: "+score);
        return score;
    },
    

    init : function () {
        this.log("ILM init start");
        
        // Cache references to current |this| in utility objects
        this._webProgressListener._domEventListener = this._domEventListener;
        this._webProgressListener._pwmgr = this;
        
        this._domEventListener._pwmgr    = this;
        this._observer._pwmgr            = this;

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

            /*if (topic == "nsPref:changed") {
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
            } else */if (topic == "xpcom-shutdown") {
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
                return this._pwmgr._fillDocument(domDoc,true);
            }

            // Add event listener to process page when DOM is complete.
            domDoc.addEventListener("DOMContentLoaded",
                                    this._domEventListener, false);
            
            // Add event listener to process page when DOM is complete.
            //TODO: this doesn't work. Would be interesting to see what happens if we get it working but what we really want is an event that's guaranteed to run after all site onload code has finished - not sure if that's possible... plus we get support for fully dynamic websites with the workaround anyway.
            // domDoc.addEventListener("load",
            //                        this._domEventListener, false);
            
            // attempt to refill the forms on the current tab in this window at a regular interval
            // This is to enable manual form filling of sites which generate forms dynamically
            // (i.e. after initial DOM load)
            if (this._pwmgr._kf._keeFoxExtension.prefs.getValue("dynamicFormScanning",false))
                this._pwmgr._refillTimer.init(this._domEventListener, 500, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
                                    
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

        QueryInterface : XPCOMUtils.generateQI([Ci.nsIObserver, 
                                                Ci.nsIDOMEventListener,
                                                Ci.nsISupportsWeakReference]),

        // nsObserver
        observe : function (subject, topic, data) {
            var doc;
            switch(topic) {
                case "sessionstore-windows-restored":

                    break;
                case "timer-callback":    
                    //this._pwmgr.log("timer fired");
                    doc = this._pwmgr._currentWindow.content.document;
                    this._pwmgr._fillDocument(doc,false); //TODO: find some ways of deciding that there is no need to call this function in some cases. E.g. DOMMutation events? but just having those events on a page drops all other DOM performance by > 50% so will be too slow for DOM heavy sites. maybe do one every 2 seconds regardless and some others more frequently only if # of forms has changed?
                    break;

            }

        },

        handleEvent : function (event) {
            this._pwmgr.log("domEventListener: got event " + event.type);

            var doc, inputElement;
            switch (event.type) {
                case "DOMContentLoaded":
                    doc = event.target;
                    /*
                    var KFTabState = {
        docFillAttemptCount: null
        //TODO: store this to help improve refill feature:
        // number of forms in document
        // form.length = number of control items in a form
        }
        
        KFTabState.docFillAttemptCount = 0;
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                        .getService(Components.interfaces.nsIWindowMediator);
        var newWindow = wm.getMostRecentWindow("navigator:browser");
        var b = newWindow.getBrowser();
        var newTab = b.loadOneTab( actionURL, null, null, null, false, null );
        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                .getService(Components.interfaces.nsISessionStore);

        ss.setTabValue(newTab, "KF_uniqueID", uniqueID);
        ss.setTabValue(newTab, "KF_autoSubmit", "yes");*/
        
                    this._pwmgr._fillDocument(doc,true);
                    /*for (var i = 0; i < doc.forms.length; i++) {
                        var form = doc.forms[i];
                        for (var j = 0; j < form.elements.length; j++) {
                            alert(form.elements[j].value);
                        }
                    }*/
                    return;
                    
                //case "load":
                    //doc = event.target;
                    //this._pwmgr._fillDocument(doc,true);
                    /*for (var i = 0; i < doc.forms.length; i++) {
                        var form = doc.forms[i];
                        for (var j = 0; j < form.elements.length; j++) {
                            alert(form.elements[j].value);
                        }
                    }*/
                 //   return;

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
            if (form.elements[i].type.toLowerCase() != "password")
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

this.log("testingaaa");
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

this.log("testingbbb:"+pwFields.length);
        // If we're not submitting a form (it's a page load), there are no
        // password field values for us to use for identifying fields. So,
        // just assume the first password field is the one to be filled in.
        // blah, just do it anyway. caller can make the decision - it shouldn't
        // be down to this function to interpret the situation since it may be 
        // easier to do based on knowledge of the circumstances that led to the function being called
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
            return this._kf.getDatabaseName();
        }
    },
    
    /*
     * addLogin
     *
     * Add a new login to login storage.
     */
    addLogin : function (login, parentUUID) {
        // Sanity check the login
        if (login.URL == null || login.URL.length == 0)
            throw "Can't add a login with a null or empty hostname.";

        // For logins w/o a username, set to "", not null.
        if (login.username == null)
            throw "Can't add a login with a null username.";

        if (login.password == null || login.password.length == 0)
            throw "Can't add a login with a null or empty password.";

        if (login.formActionURL || login.formActionURL == "") {
            // We have a form submit URL. Can't have a HTTP realm.
            if (login.httpRealm != null)
                throw "Can't add a login with both a httpRealm and formSubmitURL.";
        } else if (login.httpRealm) {
            // We have a HTTP realm. Can't have a form submit URL.
            if (login.formActionURL != null)
                throw "Can't add a login with both a httpRealm and formSubmitURL.";
        } else {
            // Need one or the other!
            throw "Can't add a login without a httpRealm or formSubmitURL.";
        }


        // Look for an existing entry.
        var logins = this.findLogins({}, login.URL, login.formActionURL,
                                     login.httpRealm);

        if (logins.some(function(l) login.matches(l, true, false, false)))
            throw "This login already exists.";

        this.log("Adding login: " + login + " to group: " + parentUUID);
        return this._kf.addLogin(login, parentUUID);
    },
    
    /*
     * addGroup
     *
     * Add a new group to the KeePass database
     */
    addGroup : function (title, parentUUID) {
        // Sanity check the login
        if (title == null || title.length == 0)
            throw "Can't add a group with no title.";


        this.log("Adding group: " + title + " to group: " + parentUUID);
        return this._kf.addGroup(title, parentUUID);
    },
    
    getParentGroup : function (uniqueID) {
        this.log("Getting parent group of: " + uniqueID);
        return this._kf.getParentGroup(uniqueID);
    },
    
    getRootGroup : function () {
        this.log("Getting root group");
        return this._kf.getRootGroup();
    },
    
    getChildGroups : function (count, uniqueID) {
        this.log("Getting all child groups of: " + uniqueID);
        return this._kf.getChildGroups(count, uniqueID);
    },
    
    getChildEntries : function (count, uniqueID) {
        this.log("Getting all child entries of: " + uniqueID);
        return this._kf.getChildEntries(count, uniqueID);
    },
    
    

    /*
     * removeLogin
     *
     * Remove the specified login from the stored logins.
     */
    removeLogin : function (uniqueID) {
        this.log("Removing login: " + uniqueID);
        return this._kf.removeLogin(uniqueID);
    },
    
    /*
     * removeGroup
     *
     * Remove the specified group and its contents from the KeePass DB.
     */
    removeGroup : function (uniqueID) {
        this.log("Removing group: " + uniqueID);
        return this._kf.removeGroup(uniqueID);
    },


    /*
     * modifyLogin
     *
     * Change the specified login to match the new login.
     */
    modifyLogin : function (oldLogin, newLogin) {
        this.log("Modifying oldLogin: " + oldLogin + " newLogin: " + newLogin);
        return this._kf.modifyLogin(oldLogin, newLogin);
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
        return this._kf.getAllLogins(count);
    },
        
    /*
     * findLogins
     *
     * Search for the known logins for entries matching the specified criteria.
     */
    findLogins : function (count, URL, formSubmitURL, httpRealm, uniqueID) {
        this.log("Searching for logins matching URL: " + URL +
            ", formSubmitURL: " + formSubmitURL + ", httpRealm: " + httpRealm
             + ", uniqueID: " + uniqueID);

        return this._kf.findLogins(count, URL, formSubmitURL, httpRealm, uniqueID);
    },
    
    countLogins : function (hostName,actionURL,loginSearchType)
    {
        
        if (this._kf._keeFoxStorage.get("KeeICEActive",false))
        {
            return this._kf.countLogins(hostName,actionURL,loginSearchType);
        }
    },

    /*
     * _getURIExcludingQS
     *
     * Get a string that incldues all but a URI's query string
     */
    _getURIExcludingQS : function (uriString) {

        var realm = "";
        try {
            var uri = this._ioService.newURI(uriString, null, null);

            realm = uri.scheme + "://" + uri.host;

            // If the URI explicitly specified a port, only include it when
            // it's not the default. (We never want "http://foo.com:80")
            var port = uri.port;
            if (port != -1) {
                var handler = this._ioService.getProtocolHandler(uri.scheme);
                if (port != handler.defaultPort)
                    realm += ":" + port;
            }
            
            var QSbreak = uri.path.indexOf('?');
            
            realm += uri.path.substring(1,QSbreak > 1 ? QSbreak : uri.path.length);

        } catch (e) {
            this.log("Couldn't parse origin for " + uriString);
            realm = null;
        }
        return realm;
    },
    
    /*
     * _getURIHostAndPort
     *
     * Get a string that includes only a URI's host and port
     */
    _getURIHostAndPort : function (uriString) {

        var realm = "";
        try {
            var uri = this._ioService.newURI(uriString, null, null);

            realm = uri.host;

            // If the URI explicitly specified a port, only include it when
            // it's not the default. (We never want "http://foo.com:80")
            var port = uri.port;
            if (port != -1) {
                var handler = this._ioService.getProtocolHandler(uri.scheme);
                if (port != handler.defaultPort)
                    realm += ":" + port;
            }

        } catch (e) {
            this.log("Couldn't parse origin for " + uriString);
            realm = null;
        }
        return realm;
    },
    
    /*
     * _getURISchemeHostAndPort
     *
     * Get a string that includes only a URI's scheme, host and port
     */
    _getURISchemeHostAndPort : function (uriString) {

        var realm = "";
        try {
            var uri = this._ioService.newURI(uriString, null, null);

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
            this.log("Couldn't parse origin for " + uriString);
            realm = null;
        }
        this.log("_getURISchemeHostAndPort:"+realm);
        return realm;
    },
    
    /*
     * _getPasswordOrigin
     *
     * Get the parts of the URL we want for identification.
     */
    _getPasswordOrigin : function (uriString, allowJS) {
    
        // temporarily(?) returning the URI string as is - if it needs to
        // be trimmed to host and port this will be done in KeeICE
        return uriString;
    
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
this.log("realm:"+realm);
        return realm;
    },
    
    
    _getActionOrigin : function (form) {
        var uriString = form.action;

        // A blank or mission action submits to where it came from.
        if (uriString == "")
            uriString = form.baseURI;
//this.log("uri:"+uriString);
        return this._getPasswordOrigin(uriString, true);
    },
    
    //TODO: something in here may be the trigger for the deadlock bug when closing KeePass (when JS bug in this function stops it working, I've struggled to reproduce the intermittent deadlock). Top suspect is the getDatabaseName call in TB.setupButton_ready via TB.setLogins
    /*
     * _fillDocument
     *
     * Called when a page has loaded. For each form in the document,
     * we check to see if it can be filled with a stored login.
     */
    _fillDocument : function (doc, initialPageLoad)
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
            
            // we defiitely want to fill the form with this data
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
        var usernameFields = [];
        var passwordFields = [];

        for (var i = 0; i < forms.length; i++) {
            var form = forms[i];
            var loginRelevanceScores = [];
            logins[i] = [];
            
this.log("test:"+i);
            // Heuristically determine what the user/pass fields are
            // We do this before checking to see if logins are stored,
            // so that the user isn't prompted for a master password
            // without need.
            //TODO: is this Mozilla stuff useful or should we change it?
            var [usernameField, passwords] =
                this._getFormFields(form, false);
            var passwordField = null;
            
            if (passwords != null && passwords.length > 0 && passwords[0] != null)
            {
            this.log("pwfound");
                passwordField = passwords[0].element;
                }
                
            // Need a valid password field to do anything.
            if (passwordField == null || passwordField == undefined)
            {
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


            // Nothing to do if we have no matching logins available.
            if (logins[i].length == 0)
                continue;
            
            this.log("match found!");
            
            usernameFields[i] = usernameField;
            passwordFields[i] = passwordField;
            
            // determine the relevance of each login entry to this form
            // we could skip this when autofilling based on uniqueID but we would have to check for
            // matches first or else we risk no match and no alternative matching logins on the toolbar
           for (var v = 0; v < logins[i].length; v++)
            logins[i][v].relevanceScore = this._calculateRelevanceScore (logins[i][v],form,usernameField,passwordField);
            
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
        var passwordField = passwordFields[mostRelevantFormIndex];
        var usernameField = usernameFields[mostRelevantFormIndex];

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
                    passwordField.value = matchingLogin.password;
                    //alert(passwordField.value);
                    if (usernameField)
                        usernameField.value = matchingLogin.username;
                    formsReadyForSubmit++;
                }
                else
                {
                    this.log("Password not filled. None of the stored " +
                             "logins match the uniqueID provided. Maybe it is not this form we want to fill...");
                }
            
            } else if (!overWriteUsernameAutomatically && usernameField && usernameField.value) {
                // If username was specified in the form, only fill in the
                // password if we find a matching login.

                var username = usernameField.value;
                
                this.log("username found: " + username);

                var matchingLogin;
                var found = logins[mostRelevantFormIndex].some(function(l) {
                                            matchingLogin = l;
                                            return (l.username == username);
                                        });
                if (found)
                {
                    passwordField.value = matchingLogin.password;
                    formsReadyForSubmit++;
                }
                else
                {
                    this.log("Password not filled. None of the stored " +
                             "logins match the username already present.");
                }
             } /* else if (usernameField && logins.length == 2) {
            //TODO: this needs reworking RE KeePass storage options
                // Special case, for sites which have a normal user+pass
                // login *and* a password-only login (eg, a PIN)...
                // When we have a username field and 1 of 2 available
                // logins is password-only, go ahead and prefill the
                // one with a username.
                if (!logins[0].username && logins[1].username) {
                    usernameField.value = logins[1].username;
                    passwordField.value = logins[1].password;
                    formsReadyForSubmit++;
                    formToAutoSubmit = form;
                } else if (!logins[1].username && logins[0].username) {
                    usernameField.value = logins[0].username;
                    passwordField.value = logins[0].password;
                    formsReadyForSubmit++;
                    formToAutoSubmit = form;
                }
                
            } */
            
            //TODO: more scope to improve here - control over default login to autofill rather than just pick the first?
            
            else if (logins[mostRelevantFormIndex].length == 1) {
            
                if (usernameField)
                    usernameField.value = logins[mostRelevantFormIndex][0].username;
                passwordField.value = logins[mostRelevantFormIndex][0].password;
                formsReadyForSubmit++;
            } else {
                this.log("Multiple logins for form, so estimating most relevant.");
                var mostRelevantLoginIndex = 0;
                
                for (var count = 0; count < logins[mostRelevantFormIndex].length; count++)
                    if (logins[mostRelevantFormIndex][count].relevanceScore > logins[mostRelevantFormIndex][mostRelevantLoginIndex].relevanceScore)
                        mostRelevantLoginIndex = count;
                    
                    if (usernameField)
                        usernameField.value = logins[mostRelevantFormIndex][mostRelevantLoginIndex].username;
                    passwordField.value = logins[mostRelevantFormIndex][mostRelevantLoginIndex].password;
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
    },
    
    loadAndAutoSubmit : function (usernameName,usernameValue,actionURL,usernameID,formID,uniqueID) {
        this.log("loadAndAutoSubmit");
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                        .getService(Components.interfaces.nsIWindowMediator);
        var newWindow = wm.getMostRecentWindow("navigator:browser");
        var b = newWindow.getBrowser();
        var newTab = b.loadOneTab( actionURL, null, null, null, false, null );
        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                .getService(Components.interfaces.nsISessionStore);

        ss.setTabValue(newTab, "KF_uniqueID", uniqueID);
        ss.setTabValue(newTab, "KF_autoSubmit", "yes");
    },
    
    // login to be used is indentified via KeePass uniqueID (GUID)
    // TODO: handle situations where either forms fields or logins have dissapeared in the mean time.
    // TODO: formID innacurate (so not used yet)
    // TODO: extend so more than one form can be filled, with option to automatically submit form that matches most accuratly
        fill : function (usernameName,usernameValue,actionURL,usernameID,formID,uniqueID) {
        this.log("fill login details from username field: " + usernameName + ":" + usernameValue);
        
        var doc = Application.activeWindow.activeTab.document;
        
        var form;
        var usernameField;
        var passwordField;
        var ignored;
        
        var autoSubmitForm = this._kf._keeFoxExtension.prefs.getValue("autoSubmitMatchedForms",true);
        
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
        {this.log("0");
            for (var i = 0; i < doc.forms.length; i++) {
                var formi = doc.forms[i];
                //this.log("1:"+actionURL+":"+this._getActionOrigin(formi));
                
                // only fill in forms that match the host and port of the selected login
                // and only if the scheme is the same (i.e. don't submit to http forms when https was expected)
                if (this._getURISchemeHostAndPort(this._getActionOrigin(formi)) == this._getURISchemeHostAndPort(actionURL))                {
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

        var URL = this._getPasswordOrigin(doc.documentURI);
        
        var title = doc.title;
        
        // Temporary LoginInfo with the info we know.
        var currentLogin = new this._kfLoginInfo();
        this.log("titleA:"+title);
        currentLogin.init(URL, actionURL, null,
                          usernameValue, null,
                          (usernameField ? usernameField.name  : ""),
                          passwordField.name, uniqueID, title);

        // Look for a existing login and use its password.
        var match = null;
        var logins = this.findLogins({}, URL, actionURL, null, uniqueID);
        this.log(logins.length);
        this.log(logins[0]);
        
        if (uniqueID && logins.length == 1)
        {
            match = logins[0];
        } else
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
        }
        
        if (match == null)
        {
            this.log("Can't find a login for this autocomplete result.");
            return;
        }

        this.log("Found a matching login, filling in password.");
        // TODO: this whole function could be improved if there's a way to support filling of multiple password fields (either with different or the same password)
        passwordField.value = match.password;
        if (usernameField != null && (usernameField.value.length == 0 || this._kf._keeFoxExtension.prefs.getValue("overWriteUsernameAutomatically",true)))
            usernameField.value = match.username;
            
        if (autoSubmitForm)
            form.submit();
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

        var URL      = this._getPasswordOrigin(doc.documentURI);
        var formActionURL = this._getActionOrigin(form);
        var title = doc.title;

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
                //TODO: try to distingish between multi-password login/signup and typo. maybe: if username exists and matches existing password it is a typo, else multi-password
                return;
            } else // it's probably a password change form
            {
                this.log("Looks like a password change form has been submitted");
                // there may be more than one pair of matches - though, we're plucking for the first one
                // we know the index of one matching password
                
                // if there are only two passwords
                if (passwords.length == 2)
                {
                    newPasswordField = passwords[0].element;
                } else
                {
                    newPasswordField = passwords[twoPasswordsMatchIndex].element;
                    for(i=0;i<passwords.length;i++)
                        if(newPasswordField.value != passwords[i].element.value)
                            oldPasswordField = passwords[i].element;
                }
            
            }
        

        
        } else
        {
            newPasswordField = passwords[0].element;
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
            
            formLogin.initCustom(URL, formActionURL, null,
                    (usernameField ? usernameField.value : ""),
                    newPasswordField.value,
                    (usernameField ? usernameField.name  : ""),
                    newPasswordField.name, null, title, customWrapper);
            this.log("login object initialised with custom data");
        } else
        {
            formLogin.init(URL, formActionURL, null,
                    (usernameField ? usernameField.value : ""),
                    newPasswordField.value,
                    (usernameField ? usernameField.name  : ""),
                    newPasswordField.name, null, title);
            this.log("login object initialised without custom data");
        }
        
        // Look for an existing login that matches the form login.
        var existingLogin = null;
        var logins = this.findLogins({}, URL, formActionURL, null, null);
        
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
        
        for (var i = 0; i < logins.length; i++)
        {
            var same, login = logins[i];

            // If one login has a username but the other doesn't, ignore
            // the username when comparing and only match if they have the
            // same password. Otherwise, compare the logins and match even
            // if the passwords differ.
            // CPT: this seems flawed. maybe i put it in the wrong place now but it
            // doesn't make sense to match passwords under any circumstances when we're
            // on the lookout for changed passwords.
            //TODO maybe: handle seperate cases based on existance of oldPasswordField
            if (!login.username && formLogin.username) {
                var restoreMe = formLogin.username;
                formLogin.username = ""; 
                same = formLogin.matches(login, true, true, true);
                formLogin.username = restoreMe;
            } else if (!formLogin.username && login.username) {
                formLogin.username = login.username;
                same = formLogin.matches(login, true, true, true);
                formLogin.username = ""; // we know it's always blank.
            } else {
                same = formLogin.matches(login, true, true, true);
            }

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