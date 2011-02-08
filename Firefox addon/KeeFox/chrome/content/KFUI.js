/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2010 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the KeeFox Improved Login Manager javascript file. The KFUI object
  is concerned only with user-visible interface behaviour.

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

function KFUI() {}

KFUI.prototype = {
    _window        : null,
    setWindow : function (win)
    {
        this._window = window;
    },
    _document : null,
    setDocument : function (doc)
    {
        this._document = doc;
    },
    
    _debug         : false, // mirrors signon.debug (eventually)

    _kf : null,
    _kfilm : null,
        
    __logService : null, // Console logging service, used for debugging.
    get _logService()
    {
        if (!this.__logService)
            this.__logService = Cc["@mozilla.org/consoleservice;1"].
                                getService(Ci.nsIConsoleService);
        return this.__logService;
    },

    __promptService : null, // Prompt service for user interaction
    get _promptService()
    {
        if (!this.__promptService)
            this.__promptService =
                Cc["@mozilla.org/embedcomp/prompt-service;1"].
                getService(Ci.nsIPromptService2);
        return this.__promptService;
    },

    strbundle: null,

    __brandBundle : null, // String bundle for L10N
    get _brandBundle()
    {
        if (!this.__brandBundle) {
            var bunService = Cc["@mozilla.org/intl/stringbundle;1"].
                             getService(Ci.nsIStringBundleService);
            this.__brandBundle = bunService.createBundle(
                        "chrome://branding/locale/brand.properties");
            if (!this.__brandBundle)
                throw "Branding string bundle not present!";
        }

        return this.__brandBundle;
    },

    __ioService: null, // IO service for string -> nsIURI conversion
    get _ioService()
    {
        if (!this.__ioService)
            this.__ioService = Cc["@mozilla.org/network/io-service;1"].
                               getService(Ci.nsIIOService);
        return this.__ioService;
    },

    init : function (kf,kfilm)
    {
        
        this._kf = kf;
        this._kfilm = kfilm;
        this._window = this._kfilm._currentWindow;
        this.strbundle = this._kfilm._currentWindow.document.getElementById("KeeFox-strings");
    },

    promptToSavePassword : function (aLogin, isMultiPage)
    {
        var notifyBox = this._getNotifyBox();

        if (notifyBox)
            this._showSaveLoginNotification(notifyBox, aLogin, isMultiPage);
        else
            this._showSaveLoginDialog(aLogin);
    },


    /*
     * _showLoginNotification
     *
     * Displays a notification bar.
     *
     */
    _showLoginNotification : function (aNotifyBox, aName, aText, aButtons)
    {
        var oldBar = aNotifyBox.getNotificationWithValue(aName);
        const priority = aNotifyBox.PRIORITY_INFO_MEDIUM;

        KFLog.debug("Adding new " + aName + " notification bar");
        var newBar = aNotifyBox.appendNotification(
                                aText, aName,
                                "chrome://keefox/skin/KeeFox16.png",
                                priority, aButtons);

        // The page we're going to hasn't loaded yet, so we want to persist
        // across the first location change.
        newBar.persistence++;

        // Sites like Gmail perform a funky redirect dance before you end up
        // at the post-authentication page. I don't see a good way to
        // heuristically determine when to ignore such location changes, so
        // we'll try ignoring location changes based on a time interval.
        newBar.timeout = Date.now() + 20000; // 20 seconds

        if (oldBar) {
            KFLog.debug("(...and removing old " + aName + " notification bar)");
            aNotifyBox.removeNotification(oldBar);
        }
        return newBar;
    },


    /*
     * _showSaveLoginNotification
     *
     * Displays a notification bar (rather than a popup), to allow the user to
     * save the specified login. This allows the user to see the results of
     * their login, and only save a login which they know worked.
     *
     */
    _showSaveLoginNotification : function (aNotifyBox, aLogin, isMultiPage) {

        //var DBname = null;//_kf.getDatabaseName();
        var notificationText = "";
            
        // Ugh. We can't use the strings from the popup window, because they
        // have the access key marked in the string (eg "Mo&zilla"), along
        // with some weird rules for handling access keys that do not occur
        // in the string, for L10N. See commonDialog.js's setLabelForNode().
        var neverButtonText =
              this._getLocalizedString("notifyBarNeverForSiteButton.label");
        var neverButtonAccessKey =
              this._getLocalizedString("notifyBarNeverForSiteButton.key");
        var rememberButtonText =
              this._getLocalizedString("notifyBarRememberButton.label");
        var rememberButtonAccessKey =
              this._getLocalizedString("notifyBarRememberButton.key");
        var rememberAdvancedButtonText =
              this._getLocalizedString("notifyBarRememberAdvancedButton.label");
        var rememberAdvancedButtonAccessKey =
              this._getLocalizedString("notifyBarRememberAdvancedButton.key");
        var notNowButtonText =
              this._getLocalizedString("notifyBarNotNowButton.label");
        var notNowButtonAccessKey =
              this._getLocalizedString("notifyBarNotNowButton.key");

        // The callbacks in |buttons| have a closure to access the variables
        // in scope here; set one to |this._pwmgr| so we can get back to pwmgr
        // without a getService() call.
        var kfilm = this._kfilm;
        var url=aLogin.URLs[0];
        var urlSchemeHostPort=this._kfilm._getURISchemeHostAndPort(aLogin.URLs[0]);
        
        var popupName = "rememberAdvancedButtonPopup";
        if (isMultiPage)
        {
            popupName = "rememberAdvancedButtonPopup2";
            notificationText = this._getLocalizedString("saveMultiPagePasswordText");
        } else
        {
            notificationText = this._getLocalizedString("savePasswordText");
        }

        var buttons = [
            // "Remember" button
            {
                label:     rememberButtonText,
                accessKey: rememberButtonAccessKey,
                popup:     null,
                callback: function(aNotificationBar, aButton) {
                    var result = kfilm.addLogin(aLogin, null);
                    if (result == "This login already exists.")
                    {
                        //TODO2: create a new notification bar for 2 seconds with an error message?
                    }
                    //TODO: copy completed to multi-page menu, etc.
                
                    keefox_org.toolbar.clearTabFormRecordingData();
                    //aNotificationBar.parentNode.removeCurrentNotification();
                }
            },
            // "Remember (advanced)" button
            {
                label:     rememberAdvancedButtonText,
                accessKey: rememberAdvancedButtonAccessKey,
                popup:     null,
                callback: function(aNotificationBar, aButton) {
                    function onCancel() {
                      alert("Operation canceled!");
                    };
                    
                    function onOK(uuid) {
                        var result = kfilm.addLogin(aLogin, uuid);
                        if (result == "This login already exists.")
                        {
                            //TODO2: create a new notification bar for 2 seconds with an error message?
                        }
                    };
                    
                    keefox_org.toolbar.clearTabFormRecordingData();
                    window.openDialog("chrome://keefox/content/groupChooser.xul",
                  "group", "chrome,centerscreen", 
                  onOK,
                  onCancel);
                  
                }
            },
            
            
            // "Not now" button
            {
                label:     notNowButtonText,
                accessKey: notNowButtonAccessKey,
                popup:     null,
                callback:  function() { 
                    keefox_org.toolbar.clearTabFormRecordingData();
                } 
            },
            
            // "Never" button
            {
                label:     neverButtonText,
                accessKey: neverButtonAccessKey,
                popup:     null,
                callback:  function() {
                try {
                //kfilm._kf.
                
                //var url = ;
                var statement = kfilm._kf._keeFoxExtension.db.conn.createStatement("INSERT OR REPLACE INTO sites (id,url,tp,preventSaveNotification) VALUES ( (select id from sites where url = :url), :url, coalesce((select tp from sites where url = :url),0), 1  )");
                statement.params.url = urlSchemeHostPort;
                statement.executeAsync();
        
                } finally {
                    keefox_org.toolbar.clearTabFormRecordingData();
                    }
                } 
            }
        ];
        
         this._showLoginNotification(aNotifyBox, "password-save",
             notificationText, buttons);
    },

    _removeSaveLoginNotification : function (aNotifyBox)
    {

        var oldBar = aNotifyBox.getNotificationWithValue("password-save");

        if (oldBar)
        {
            KFLog.debug("Removing save-password notification bar.");
            aNotifyBox.removeNotification(oldBar);
        }
    },

    /*
     * promptToChangePassword
     *
     * Called when we think we detect a password change for an existing
     * login, when the form being submitted contains multiple password
     * fields.
     *
     */
    promptToChangePassword : function (aOldLogin, aNewLogin)
    {
        var notifyBox = this._getNotifyBox();

        if (notifyBox)
            this._showChangeLoginNotification(notifyBox, aOldLogin, aNewLogin);
    },


    /*
     * _showChangeLoginNotification
     *
     * Shows the Change Password notification bar.
     *
     */
    _showChangeLoginNotification : function (aNotifyBox, aOldLogin, aNewLogin)
    {
        var notificationText;
        var oldUsernameValue = "";
        
        if (aOldLogin.usernameIndex >= 0 && aOldLogin.otherFields != null && aOldLogin.otherFields.length > 0)
        {
            oldUsernameValue = aOldLogin.otherFields[aOldLogin.usernameIndex].value;
        }
        
        if (oldUsernameValue.length > 0)
            notificationText  = this._getLocalizedString(
                                          "passwordChangeText",
                                          [oldUsernameValue]);
        else
            notificationText  = this._getLocalizedString(
                                          "passwordChangeTextNoUser");

        var changeButtonText =
              this._getLocalizedString("notifyBarChangeButton.label");
        var changeButtonAccessKey =
              this._getLocalizedString("notifyBarChangeButton.key");
        var dontChangeButtonText =
              this._getLocalizedString("notifyBarDontChangeButton.label");
        var dontChangeButtonAccessKey =
              this._getLocalizedString("notifyBarDontChangeButton.key");

        // The callbacks in |buttons| have a closure to access the variables
        // in scope here; set one to |this._pwmgr| so we can get back to pwmgr
        // without a getService() call.
        var kfilm = this._kfilm;

        var buttons = [
            // "Yes" button
            {
                label:     changeButtonText,
                accessKey: changeButtonAccessKey,
                popup:     null,
                callback:  function(aNotificationBar, aButton) {
                    kfilm.modifyLogin(aOldLogin, aNewLogin);
                }
            },

            // "No" button
            {
                label:     dontChangeButtonText,
                accessKey: dontChangeButtonAccessKey,
                popup:     null,
                callback:  function(aNotificationBar, aButton) {
                    // do nothing
                }
            }
        ];

        this._showLoginNotification(aNotifyBox, "password-change",
             notificationText, buttons);
    },

    _showLaunchKFNotification : function ()
    {
        var notifyBox = this._getNotifyBox();

        var loginButtonText =
              this._getLocalizedString("notifyBarLaunchKeePassButton.label");
        var loginButtonAccessKey =
              this._getLocalizedString("notifyBarLaunchKeePassButton.key");
        var notNowButtonText =
              this._getLocalizedString("notifyBarNotNowButton.label");
        var notNowButtonAccessKey =
              this._getLocalizedString("notifyBarNotNowButton.key");

        var notificationText  = 
            this._getLocalizedString("notifyBarLaunchKeePass.label");
        var kfilm = this._kfilm;
        var kf = this._kf;

        var buttons = [
            // "Remember" button
            {
                label:     loginButtonText,
                accessKey: loginButtonAccessKey,
                popup:     null,
                callback: function(aNotificationBar, aButton) {
                    kf.launchKeePass('');
                }
            },

            // "Not now" button
            {
                label:     notNowButtonText,
                accessKey: notNowButtonAccessKey,
                popup:     null,
                callback:  function() { /* NOP */ } 
            }
        ];

        this._showLoginNotification(notifyBox, "keefox-launch",
             notificationText, buttons);
    },
    
    _showLoginToKFNotification : function ()
    {
        var notifyBox = this._getNotifyBox();

        var loginButtonText =
              this._getLocalizedString("notifyBarLoginToKeePassButton.label");
        var loginButtonAccessKey =
              this._getLocalizedString("notifyBarLoginToKeePassButton.key");
        var notNowButtonText =
              this._getLocalizedString("notifyBarNotNowButton.label");
        var notNowButtonAccessKey =
              this._getLocalizedString("notifyBarNotNowButton.key");

        var notificationText  = 
            this._getLocalizedString("notifyBarLoginToKeePass.label");

        var kfilm = this._kfilm;
        var kf = this._kf;

        var buttons = [
            // "Remember" button
            {
                label:     loginButtonText,
                accessKey: loginButtonAccessKey,
                popup:     null,
                callback: function(aNotificationBar, aButton) {
                    kf.loginToKeePass();
                }
            },

            // "Not now" button
            {
                label:     notNowButtonText,
                accessKey: notNowButtonAccessKey,
                popup:     null,
                callback:  function() { /* NOP */ } 
            }
        ];

        this._showLoginNotification(notifyBox, "keefox-login",
             notificationText, buttons);
    },
    
    _removeOLDKFNotifications : function (keepLaunchBar)
    {
        var notifyBox = this._getNotifyBox();
        
        if (notifyBox)
        {
            var oldBar = notifyBox.getNotificationWithValue("password-save");

            if (oldBar) {
                KFLog.debug("Removing save-password notification bar.");
                notifyBox.removeNotification(oldBar);
            }
            
            oldBar = notifyBox.getNotificationWithValue("keefox-login");

            if (oldBar) {
                KFLog.debug("Removing keefox-login notification bar.");
                notifyBox.removeNotification(oldBar);
            }
            
            if (!keepLaunchBar)
            {
                oldBar = notifyBox.getNotificationWithValue("keefox-launch");

                if (oldBar) {
                    KFLog.debug("Removing keefox-launch notification bar.");
                    notifyBox.removeNotification(oldBar);
                }
            }
        }
    },
    
    /*
     * _getNotifyBox
     *
     * Returns the notification box to this prompter, or null if there isn't
     * a notification box available.
     */
    _getNotifyBox : function ()
    {
        try
        {
            // Get topmost window, in case we're in a frame.
            var notifyWindow = this._window.top
            
            // Some sites pop up a temporary login window, when disappears
            // upon submission of credentials. We want to put the notification
            // bar in the opener window if this seems to be happening.
            if (notifyWindow.opener)
            {
                var webnav = notifyWindow
                                    .QueryInterface(Ci.nsIInterfaceRequestor)
                                    .getInterface(Ci.nsIWebNavigation);
                var chromeWin = webnav
                                    .QueryInterface(Ci.nsIDocShellTreeItem)
                                    .rootTreeItem
                                    .QueryInterface(Ci.nsIInterfaceRequestor)
                                    .getInterface(Ci.nsIDOMWindow);
                var chromeDoc = chromeWin.document.documentElement;

                // Check to see if the current window was opened with chrome
                // disabled, and if so use the opener window. But if the window
                // has been used to visit other pages (ie, has a history),
                // assume it'll stick around and *don't* use the opener.
                if (chromeDoc.getAttribute("chromehidden") &&
                    webnav.sessionHistory.count == 1)
                {
                    KFLog.debug("Using opener window for notification bar.");
                    notifyWindow = notifyWindow.opener; //not convinced this will work - maybe change this._document
                }
            }


            // Find the <browser> which contains notifyWindow, by looking
            // through all the open windows and all the <browsers> in each.
            var wm = Cc["@mozilla.org/appshell/window-mediator;1"].
                     getService(Ci.nsIWindowMediator);
            var enumerator = wm.getEnumerator("navigator:browser");
            var tabbrowser = null;
            var foundBrowser = null;
            while (!foundBrowser && enumerator.hasMoreElements())
            {
                var win = enumerator.getNext();
                KFLog.debug("found window with name:" + win.name);
                tabbrowser = win.getBrowser(); 
                foundBrowser = tabbrowser.getBrowserForDocument(
                                                  this._document);
            }

            // Return the notificationBox associated with the browser.
            if (foundBrowser)
            {
                KFLog.debug("found a browser for this window.");
                return tabbrowser.getNotificationBox(foundBrowser)
            }

        } catch (e) {
            // If any errors happen, just assume no notification box.
            KFLog.error("No notification box available: " + e)
        }

        return null;
    },


    /*
     * _getLocalizedString
     *
     * Can be called as:
     *   _getLocalizedString("key1");
     *   _getLocalizedString("key2", ["arg1"]);
     *   _getLocalizedString("key3", ["arg1", "arg2"]);
     *   (etc)
     *
     * Returns the localized string for the specified key,
     * formatted if required.
     *
     */ 
    _getLocalizedString : function (key, formatArgs)
    {
        if (formatArgs)
            return this.strbundle.getFormattedString(key, formatArgs);
        else
            return this.strbundle.getString(key);
    },


    /*
     * _getFormattedHostname
     *
     * The aURI parameter may either be a string uri, or an nsIURI instance.
     *
     * Returns the hostname to use in a nsILoginInfo object (for example,
     * "http://example.com").
     */
    _getFormattedHostname : function (aURI)
    {
        var uri;
        if (aURI instanceof Ci.nsIURI)
        {
            uri = aURI;
        } else {
            uri = this._ioService.newURI(aURI, null, null);
        }
        var scheme = uri.scheme;

        var hostname = scheme + "://" + uri.host;

        // If the URI explicitly specified a port, only include it when
        // it's not the default. (We never want "http://foo.com:80")
        port = uri.port;
        if (port != -1)
        {
            var handler = this._ioService.getProtocolHandler(scheme);
            if (port != handler.defaultPort)
                hostname += ":" + port;
        }

        return hostname;
    },

// Closes all popups that are ancestors of the node.
closeMenus : function(node)
{
  if ("tagName" in node) {
    if (node.namespaceURI == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
    && (node.tagName == "menupopup" || node.tagName == "popup"))
      node.hidePopup();

    closeMenus(node.parentNode);
  }
}


};
