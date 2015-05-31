/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the KeeFox User Interface javascript file. The KFUI object
  is concerned with user-visible interface behaviour.

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

let Cc = Components.classes;
let Ci = Components.interfaces;



keefox_win.UI = {

    __ioService: null, // IO service for string -> nsIURI conversion
    get _ioService()
    {
        if (!this.__ioService)
            this.__ioService = Cc["@mozilla.org/network/io-service;1"].
                               getService(Ci.nsIIOService);
        return this.__ioService;
    },
        
    fillCurrentDocument: function () {
        keefox_win.Logger.debug("fillCurrentDocument start");

        // remove all the old logins from the main UI element and context menus
        keefox_win.mainUI.removeLogins();
        keefox_win.context.removeLogins();

        window.gBrowser.selectedBrowser.messageManager.sendAsyncMessage("keefox:findMatches", {
            autofillOnSuccess: true,
            autosubmitOnSuccess: false,
            notifyUserOnSuccess: false
        });
    },

    promptToSavePassword : function (message)
    {
        let browser = message.target;
        let login;
        if (browser) {
            login = new keeFoxLoginInfo();
            login.fromJSON(message.data.login);
        } else
        {
            // We don't always know which browser because this might have been 
            // called from a modal dialog
            browser = gBrowser.selectedBrowser;
            login = message.data.login;
        }
        let isMultiPage = message.data.isMultiPage;
        let notifyBox = keefox_win.UI._getNotificationManager();

        if (notifyBox)
            keefox_win.UI._showSaveLoginNotification(notifyBox, login, isMultiPage, browser);
    },
    
    _showKeeFoxNotification: function (notifyBox, name, notificationText, buttons, thisTabOnly, priority, persist)
    {
        let notification = {
            name: name,
            render: function (container) {
                     
                // We will append the rendered view of our own notification information to the
                // standard notification container that we have been supplied
                var doc = container.ownerDocument;
                container = doc.ownerGlobal.keefox_win.notificationManager
                    .renderStandardMessage(container, notificationText);
                    
                // We might customise other aspects of the notifications but when we want
                // to display buttons we can treat them all the same
                container = doc.ownerGlobal.keefox_win.notificationManager
                    .renderButtons(buttons, doc, notifyBox, name, container);

                return container;
            },
            onClose: function(browser) {
            },
            thisTabOnly: thisTabOnly,
            priority: priority,
            persist: persist
        };
        notifyBox.add(notification);
        return;
    },

    // Displays a notification, to allow the user to save the specified login.
    _showSaveLoginNotification: function (aNotifyBox, aLogin, isMultiPage, browser) {
        var notificationText = "";
            
        var neverButtonText =
              keefox_org.locale.$STR("notifyBarNeverForSiteButton.label");
        var neverButtonAccessKey =
              keefox_org.locale.$STR("notifyBarNeverForSiteButton.key");
        var rememberButtonText =
              keefox_org.locale.$STR("notifyBarRememberButton.label");
        var rememberButtonAccessKey =
              keefox_org.locale.$STR("notifyBarRememberButton.key");
              
        var urlSchemeHostPort=keefox_win.getURISchemeHostAndPort(aLogin.URLs[0]);
        
        if (isMultiPage)
        {
            notificationText = keefox_org.locale.$STR("saveMultiPagePasswordText");
        } else
        {
            notificationText = keefox_org.locale.$STR("savePasswordText");
        }

        var buttons = [
            // "Save" button
            {
                label:     rememberButtonText,
                accessKey: rememberButtonAccessKey,
                callback: function (evt) {
                    evt.stopPropagation();
                    browser.messageManager.sendAsyncMessage("keefox:cancelFormRecording");
                    keefox_org.metricsManager.pushEvent("feature", "addLogin");
                  
                    saveData.getLogin(function (login, urlMergeMode) {
                        if (saveData.update)
                        {
                            var result = keefox_org.updateLogin(login, saveData.oldLoginUUID, urlMergeMode, saveData.db);
                        }
                        else {
                            var result = keefox_org.addLogin(login, saveData.group, saveData.db);
                            if (keefox_org._keeFoxExtension.prefs.getValue("rememberMRUGroup",false))
                                keefox_org._keeFoxExtension.prefs.setValue("MRUGroup-"+saveData.db,saveData.group);
                        }
                    });
                    
                }
            },
            
            // "Never" button
            {
                label:     neverButtonText,
                accessKey: neverButtonAccessKey,
                popup:     null,
                callback:  function() {
                    try 
                    {
                        let newConfig = keefox_org.config.applyMoreSpecificConfig(JSON.parse(JSON.stringify(keefox_org.config.getConfigDefinitionForURL(urlSchemeHostPort))),{"preventSaveNotification": true}); //TODO:2: faster clone? https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm ?
                        keefox_org.config.setConfigForURL(urlSchemeHostPort, newConfig);
                        keefox_org.config.save();
                    } finally
                    {
                        browser.messageManager.sendAsyncMessage("keefox:cancelFormRecording");
                        keefox_org.metricsManager.pushEvent("feature", "SaveNever");
                    }
                } 
            }
        ];
        
        let saveData = {};      
        saveData.getLogin = function (callback) {
            let login = aLogin;

            let urlMergeMode = browser.passwordSaver.getCurrentUrlMergeMode();

            var primaryURL = login.URLs[0];
        
            if (keefox_org._keeFoxExtension.prefs.getValue("saveFavicons",false))
            {
                try
                {
                    // Ask Firefox to give us the favicon data async
                    var faviconLoader = {
                        onComplete: function (aURI, aDataLen, aData, aMimeType)
                        {
                            if (aURI == null || aDataLen <= 0)
                            {
                                keefox_win.Logger.info("No favicon found");
                            } else
                            {
                                // Convert the favicon data into a form that KPRPC will understand
                                var faviconBytes = String.fromCharCode.apply(null, aData);
                                login.iconImageData = btoa(faviconBytes);
                            }
                            callback(login, urlMergeMode);
                        }
                    };
                    keefox_org.loadFavicon(primaryURL, faviconLoader);
                } catch (ex) 
                {
                    keefox_win.Logger.info("Failed to process add login request");
                }
            } else
            {
                callback(login, urlMergeMode);
            }
        }
  
        let name="password-save";
  
        let notification = {
            name: name,
            render: function (container) {
                     
                // We will append the rendered view of our own notification information to the
                // standard notification container that we have been supplied
                var doc = container.ownerDocument;
                container = doc.ownerGlobal.keefox_win.notificationManager
                    .renderStandardMessage(container, notificationText);

                browser.passwordSaver = new doc.ownerGlobal.keefox_win.PasswordSaver(doc, saveData, aLogin.URLs);
                container = browser.passwordSaver.generateUI(container);
              
                // We might customise other aspects of the notifications but when we want
                // to display buttons we can treat them all the same
                container = doc.ownerGlobal.keefox_win.notificationManager
                    .renderButtons(buttons, doc, aNotifyBox, name, container);

                return container;
            },
            onClose: function(browser) {
                browser.messageManager.sendAsyncMessage("keefox:cancelFormRecording");
                browser.passwordSaver = null;
            },
            onAttached: function (browser, doc) {
                keefox_org.search.execute(doc.getElementById('KeeFox-SaveLogin-searchbox').value,
                browser.passwordSaver.onSearchComplete.bind(browser.passwordSaver),
                doc.getElementById('KeeFox-SaveLogin-searchfilter').selectedOptions[0].value.split(','));
            },
            thisTabOnly: true,
            priority: null,
            persist: true
        };
        aNotifyBox.add(notification);
    },


    showConnectionMessage : function (message)
    {
        var notifyBox = this._getNotificationManager();

        if (notifyBox)
        {
            var buttons = [];
            keefox_win.Logger.debug("Adding keefox-connection-message notification");
            this._showKeeFoxNotification(notifyBox, "keefox-connection-message",
                 message, buttons, false);
        }
    },

    removeConnectionMessage : function ()
    {
        keefox_win.Logger.debug("Removing keefox-connection-message notification");
        keefox_win.notificationManager.remove("keefox-connection-message");
    },

    _showLaunchKFNotification : function ()
    {
        // We don't show a special message anymore but just open the main KeeFox
        // panel to reveal the current status to the user
        keefox_win.panel.displayPanel();
        keefox_win.panel.hideSubSections();
    },
    
    _showLoginToKFNotification : function ()
    {
        // We don't show a special message anymore but just open the main KeeFox
        // panel to reveal the current status to the user
        keefox_win.panel.displayPanel();
        keefox_win.panel.hideSubSections();
    },

    showMainKeeFoxPanel: function ()
    {
        keefox_win.panel.displayPanel();
        keefox_win.panel.hideSubSections();
    },

    _showSensitiveLogEnabledNotification : function ()
    {
        var notifyBox = this._getNotificationManager();
        if (notifyBox)
        {
            var notificationText  = 
                this._getLocalizedString("notifyBarLogSensitiveData.label");

            var buttons = [
            // "More info" button
            {
                label:     this._getLocalizedString("KeeFox-FAMS-NotifyBar-A-LearnMore-Button.label"),
                accessKey: this._getLocalizedString("KeeFox-FAMS-NotifyBar-A-LearnMore-Button.key"),
                popup:     null,
                callback: function(aNotificationBar, aButton) {
                    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                             .getService(Components.interfaces.nsIWindowMediator);
                    var newWindow = wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");
                    var b = newWindow.getBrowser();
                    var newTab = b.loadOneTab( "https://github.com/luckyrat/KeeFox/wiki/en-|-Options-|-Logging-|-Sensitive", null, null, null, false, null );
                }
            }];
            this._showKeeFoxNotification(notifyBox, "keefox-sensitivelog",
                 notificationText, buttons, false, notifyBox.PRIORITY_WARNING_HIGH);
        }
    },
    
    _getNotificationManager : function ()
    {
        return keefox_win.notificationManager;

        /* If possible, we should find out whether this browser was opened from another
        one so that we can use the old approach of attaching the notification to its
        opener rather than itself. I have never seen this login form behaviour in
        practice though so if e10s makes this impossible, it's probably not the end
        of the world. See old _getNotifyBox code for initial implementation ideas. */
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
            return keefox_org.locale.$STRF(key, formatArgs);
        else
            return keefox_org.locale.$STR(key);
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
    },

    growl : function(title, text, clickToShowPanel) {
        try {
            let callback = null;
            let enableClick = false;
            if (clickToShowPanel) {
                callback = {
                    observe: function (subject, topic, data) {
                        if (topic == "alertclickcallback")
                            // We have to delay the panel display due to wierdness/bugs
                            // with Firefox's panelUI and notification service which
                            // prevent panel display from directly within the callback
                            setTimeout(function () {
                                keefox_win.panel.displayPanel();
                                keefox_win.panel.hideSubSections();
                            }, 150);
                    }
                };
                enableClick = true;
            }

            Components.classes['@mozilla.org/alerts-service;1'].
                      getService(Components.interfaces.nsIAlertsService).
                      showAlertNotification("chrome://keefox/skin/KeeFox24.png", title, text, enableClick, '', callback);
        } catch(e) {
            // prevents runtime error on platforms that don't implement nsIAlertsService
        }
    }

};
