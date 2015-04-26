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
                            
                var text = doc.createElementNS('http://www.w3.org/1999/xhtml', 'div');
                text.textContent = notificationText;
                text.setAttribute('class', 'KeeFox-message');
                container.appendChild(text);
                    
                // We might customise other aspects of the notifications but when we want
                // to display buttons we can treat them all the same
                container = doc.ownerGlobal.keefox_win.notificationManager
                    .renderButtons(buttons, doc, notifyBox, name, container);

                return container;
            },
            onClose: function(browser) {
                browser.messageManager.sendAsyncMessage("keefox:cancelFormRecording");
            },
            thisTabOnly: thisTabOnly,
            priority: priority,
            persist: persist
        };
        notifyBox.add(notification);
        return;
    },

    _prepareNotificationMenuItem : function (nmi, itemDef, notifyBox, name)
    {
        ////<vbox><input type="button" class="KeeFox-Action enabled" value="Launch KeePass1" title="do-a-thing.tip" tooltip="Launch KeePass to enable KeeFox"/></vbox>
        nmi.setAttribute("label", itemDef.label);
        nmi.setAttribute("accesskey", itemDef.accessKey);
        if (itemDef.tooltip != undefined) nmi.setAttribute("tooltiptext", itemDef.tooltip);
        nmi.setAttribute("class", "menuitem-iconic");
        if (itemDef.image != undefined)
            nmi.setAttribute("image", itemDef.image);
        var callbackWrapper = function(fn, name){
            return function() {
                try
                {
                    var returnValue = 0;
                    if (fn != null)
                        returnValue = fn.apply(this, arguments);
                    
                    notifyBox.remove(name);
                } catch(ex)
                {
                    keefox_win.Logger.error("Exception occurred in menu item callback: " + ex);
                }
            };
        };

        var callback = callbackWrapper(itemDef.callback, name);
        nmi.addEventListener('command', callback, false);
        if (itemDef.id != null)
            nmi.setAttribute("id", itemDef.id);
        if (itemDef.values != null)
        {
            for(var pi=0; pi < itemDef.values.length; pi++)
            {
                var key = itemDef.values[pi].key;
                var val = itemDef.values[pi].value;
                nmi.setUserData(key, val, null);
            }                  
        }
        return nmi;    
    },
    
    /*
     * _showSaveLoginNotification
     *
     * Displays a notification bar (rather than a popup), to allow the user to
     * save the specified login. This allows the user to see the results of
     * their login, and only save a login which they know worked.
     *
     */
    _showSaveLoginNotification : function (aNotifyBox, aLogin, isMultiPage, browser) {
        var notificationText = "";
            
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
        
        
        var rememberButtonTooltip =
              this._getLocalizedString("notifyBarRememberButton.tooltip",
                [keefox_org.KeePassDatabases[keefox_org.ActiveKeePassDatabaseIndex].name]);
        var rememberAdvancedButtonTooltip =
              this._getLocalizedString("notifyBarRememberAdvancedButton.tooltip",
                [keefox_org.KeePassDatabases[keefox_org.ActiveKeePassDatabaseIndex].name]);
        var rememberButtonDBTooltip =
              this._getLocalizedString("notifyBarRememberDBButton.tooltip");
        var rememberAdvancedDBButtonTooltip =
              this._getLocalizedString("notifyBarRememberAdvancedDBButton.tooltip");
              
        var url=aLogin.URLs[0];
        var urlSchemeHostPort=keefox_win.getURISchemeHostAndPort(aLogin.URLs[0]);
        
        var popupName = "rememberAdvancedButtonPopup";
        if (isMultiPage)
        {
            popupName = "rememberAdvancedButtonPopup2";
            notificationText = this._getLocalizedString("saveMultiPagePasswordText");
        } else
        {
            notificationText = this._getLocalizedString("savePasswordText");
        }
        var popupSave = [];
        var popupSaveToGroup = [];        
        for (var dbi = 0; dbi < keefox_org.KeePassDatabases.length; dbi++)
        {
            var db = keefox_org.KeePassDatabases[dbi];
            popupSave[dbi] = {
                label:     this._getLocalizedString("notifyBarRememberDBButton.label", [db.name]),
                accessKey: "",
                popup:     null,
                callback: function (evt) {
                    evt.stopPropagation();
                    browser.messageManager.sendAsyncMessage("keefox:cancelFormRecording");
                    keefox_org.addLogin(evt.currentTarget.getUserData('login'), null, evt.currentTarget.getUserData('filename'));
                },
                tooltip: this._getLocalizedString("notifyBarRememberDBButton.tooltip", [db.name]),
                image: "data:image/png;base64,"+db.iconImageData,
                values: [ { key: "login", value: aLogin }, { key: "filename", value: keefox_org.KeePassDatabases[dbi].fileName } ]
            };
            popupSaveToGroup[dbi] = {
                label:     this._getLocalizedString("notifyBarRememberAdvancedDBButton.label", [db.name]),
                accessKey: "",
                popup:     null,
                callback:  function(evt) { 
                    function onCancel() {
                    };
                        
                    function onOK(uuid, filename) {
                        var result = keefox_org.addLogin(aLogin, uuid, filename);
                        if (result == "This login already exists.")
                        {
                            //TODO2: create a new notification bar for 2 seconds with an error message?
                        }
                    };

                    browser.messageManager.sendAsyncMessage("keefox:cancelFormRecording");
                    keefox_org.metricsManager.pushEvent ("feature", "SaveGroupChooser");
                    window.openDialog("chrome://keefox/content/groupChooser.xul",
                      "group", "chrome,centerscreen", 
                      onOK,
                      onCancel,
                      evt.currentTarget.getUserData('filename'));
                    
                    evt.stopPropagation();
                },
                tooltip: this._getLocalizedString("notifyBarRememberAdvancedDBButton.tooltip", [db.name]),
                image: "data:image/png;base64,"+db.iconImageData,
                values: [ { key: "login", value: aLogin }, { key: "filename", value: keefox_org.KeePassDatabases[dbi].fileName } ]
            };
        }    
        if (popupSave.length == 0)
            popupSave = null;    
        if (popupSaveToGroup.length == 0)
            popupSaveToGroup = null;

        var buttons = [
            // "Save" button
            {
                label:     rememberButtonText,
                accessKey: rememberButtonAccessKey,
                popup: popupSave,
                callback: function (evt) {
                    evt.stopPropagation();
                    browser.messageManager.sendAsyncMessage("keefox:cancelFormRecording");
                    var result = keefox_org.addLogin(evt.currentTarget.getUserData('login'), null, null);
                },
                tooltip: rememberButtonTooltip,
                image: "data:image/png;base64,"+ keefox_org.KeePassDatabases[keefox_org.ActiveKeePassDatabaseIndex].iconImageData,
                values: [ { key: "login", value: aLogin } ]
            },
            {
                label:     rememberAdvancedButtonText,
                accessKey: rememberAdvancedButtonAccessKey,
                popup: popupSaveToGroup,
                callback: function(evt) { 
                    function onCancel() {
                    };
                        
                    function onOK(uuid) {
                        var result = keefox_org.addLogin(aLogin, uuid, null);
                        if (result == "This login already exists.")
                        {
                            //TODO2: create a new notification bar for 2 seconds with an error message?
                        }
                    };
                        
                    browser.messageManager.sendAsyncMessage("keefox:cancelFormRecording");
                    keefox_org.metricsManager.pushEvent("feature", "SaveGroupChooser");
                    window.openDialog("chrome://keefox/content/groupChooser.xul",
                      "group", "chrome,centerscreen", 
                      onOK,
                      onCancel,
                      null);                  
                    
                    evt.stopPropagation();
                },
                tooltip: rememberAdvancedButtonTooltip,
                image: "data:image/png;base64,"+ keefox_org.KeePassDatabases[keefox_org.ActiveKeePassDatabaseIndex].iconImageData,
                values: [ { key: "login", value: aLogin } ]
            },
            
            // Not now
            {
                label:     notNowButtonText,
                accessKey: notNowButtonAccessKey,
                callback: function (evt) {
                    browser.messageManager.sendAsyncMessage("keefox:cancelFormRecording");
                    keefox_org.metricsManager.pushEvent("feature", "SaveNotNow");
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
                        let newConfig = keefox_org.config.applyMoreSpecificConfig(JSON.parse(JSON.stringify(keefox_org.config.getConfigDefinitionForURL(urlSchemeHostPort))),{"preventSaveNotification": true}); //TODO1.5: faster clone?
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
        
        
        this._showKeeFoxNotification(aNotifyBox, "password-save",
            notificationText, buttons, true, null, true);
    },

    showConnectionMessage : function (message)
    {
        var notifyBox = this._getNotificationManager();

        if (notifyBox)
        {
            var buttons = [
//                // "OK" button
//                {
//                    label:     this._getLocalizedString("KeeFox_Dialog_OK_Button.label"),
//                    accessKey: this._getLocalizedString("KeeFox_Dialog_OK_Button.key"),
//                    popup:     null,
//                    callback:  function() { /* NOP */ } 
//                }
            ];
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
