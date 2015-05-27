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
        //keefox_win.tempLogin = aLogin;
        var notificationText = "";
            
        var neverButtonText =
              keefox_org.locale.$STR("notifyBarNeverForSiteButton.label");
        var neverButtonAccessKey =
              keefox_org.locale.$STR("notifyBarNeverForSiteButton.key");
        var rememberButtonText =
              keefox_org.locale.$STR("notifyBarRememberButton.label");
        var rememberButtonAccessKey =
              keefox_org.locale.$STR("notifyBarRememberButton.key");
              
        //var url=aLogin.URLs[0];
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
            //TODO:1.6: Create a new login based on potentially modified field data

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

                browser.passwordSaver = new PasswordSaver(doc, saveData);
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


function PasswordSaver(doc, saveData)
{
    //this._keefox_org = keefox_org;
    //this._KFLog = KFLog;
    this.doc = doc;
    this.saveData = saveData;

    Cu.import("resource://kfmod/search.js", this);

    this.search = new this.Search(keefox_org, {
        version: 1,
        searchAllDatabases: true,
        maximumResults: 50
    });
}

PasswordSaver.prototype = 
{
    generateUI: function(container) {
        let saveTypeChooser = this.createSaveTypeChooser();
        container.appendChild(saveTypeChooser);
        let saveTypeContainer = this.createSaveTypeContainer();
        container.appendChild(saveTypeContainer);
        return container;
    },
    
    createDBSelect: function () {
  
        let dbOptions = [];
              
        for (var dbi = 0; dbi < keefox_org.KeePassDatabases.length; dbi++)
        {
            var db = keefox_org.KeePassDatabases[dbi];
            let opt = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'option');
            opt.setAttribute("value", db.fileName);
            opt.textContent = db.name;
            if (dbi == keefox_org.ActiveKeePassDatabaseIndex)
                opt.selected = true;
            opt.style.backgroundImage = "url(data:image/png;base64," + db.iconImageData + ")";
            dbOptions.push(opt);
        }
              
        let changeHandler = function (event) {
            let opt = event.target.selectedOptions[0];
            event.target.style.backgroundImage = opt.style.backgroundImage;
            this.updateGroups(keefox_org.getDBbyFilename(event.target.value),
                this.doc.getElementById('keefox-save-password-group-select'));
            this.saveData.db = opt.value;
        };

        let sel = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'select');
        sel.setAttribute("id","keefox-save-password-db-select");
        sel.addEventListener("change", changeHandler, false);
        for (let o of dbOptions)
          sel.appendChild(o);

        this.saveData.db = sel.selectedOptions[0].value;
  
        return sel;
    },
    
    createGroupSelect: function () {
  
        let changeHandler = function (event) {
            let opt = event.target.selectedOptions[0];
            event.target.style.backgroundImage = opt.style.backgroundImage;
            event.target.style.paddingLeft = (opt.style.paddingLeft.substring(0,
                opt.style.paddingLeft.length - 2) - 5) + "px";
            event.target.style.backgroundPosition = opt.style.backgroundPosition;
            this.saveData.group = opt.value;
        };
              
        let sel = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'select');
        sel.addEventListener("change", changeHandler.bind(this), false);
        sel.setAttribute("id","keefox-save-password-group-select");
  
        return sel;
    },

    updateGroups: function (db, sel) {
  
        let groupOptions = [];
        let mruGroup = "";
        if (keefox_org._keeFoxExtension.prefs.getValue("rememberMRUGroup",false))
        {
            mruGroup = keefox_org._keeFoxExtension.prefs.getValue("MRUGroup-"+db.fileName,"");
        }
  
        function generateGroupOptions (group, depth) {
    
            let opt = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'option');
            opt.setAttribute("value", group.uniqueID);
            opt.textContent = group.title;
    
            if (mruGroup == group.uniqueID)
                opt.setAttribute("selected", "true");
    
            let indent = 20 + depth * 16;
            opt.style.paddingLeft = (indent+5) + "px";
            opt.style.backgroundPosition = (indent-15) + "px 7px";
            opt.style.backgroundImage = "url(data:image/png;base64," + group.iconImageData + ")";
    
            groupOptions.push(opt);
    
            for (let c of group.childGroups)
            generateGroupOptions.call(this, c, depth+1);
        }
  
        generateGroupOptions.call(this, db.root, 0);
  
        for (var opt in sel){
            sel.remove(opt);
        }
        for (let o of groupOptions)
          sel.appendChild(o);
  
        let currentOpt = sel.selectedOptions[0];
        sel.style.backgroundImage = currentOpt.style.backgroundImage;
        sel.style.paddingLeft = (currentOpt.style.paddingLeft.substring(0,
            currentOpt.style.paddingLeft.length - 2) - 5) + "px";
        sel.style.backgroundPosition = currentOpt.style.backgroundPosition;

        this.saveData.group = currentOpt.value;
    },

    getCurrentUrlMergeMode: function()  {
        let radioOptions = this.doc.getElementById("KeeFox-loginURLsUpdateRadioGroup");
        return radioOptions.selectedIndex;
    },

    createSaveTypeChooser: function ()
    {
        let saveTypeChooser = this.doc.createElement('hbox');
        let createButton = this.doc.createElement('button');
        createButton.setAttribute("id","keefox-save-password-new-button");
        createButton.setAttribute("label","(LOC:) Create new entry");
        createButton.addEventListener("command", this.enableNewEntry.bind(this));
        createButton.classList.add("selected");
        let updateButton = this.doc.createElement('button');
        updateButton.setAttribute("id","keefox-save-password-update-button");
        updateButton.setAttribute("label","(LOC:) Update existing entry");
        updateButton.addEventListener("command", this.enableEditEntry.bind(this));
        updateButton.classList.add("unselected");

        saveTypeChooser.appendChild(createButton);
        saveTypeChooser.appendChild(updateButton);
        return saveTypeChooser;
    },

    createSaveTypeContainer: function ()
    {
        let saveTypeContainer = this.doc.createElement('vbox');
        saveTypeContainer.setAttribute("id","keefox-save-password-saveTypeContainer");

        let typeNew = this.createSaveTypeNew();
        let typeUpdate1 = this.createSaveTypeUpdate1();
        let typeUpdate2 = this.createSaveTypeUpdate2();

        saveTypeContainer.appendChild(typeNew);
        saveTypeContainer.appendChild(typeUpdate1);
        saveTypeContainer.appendChild(typeUpdate2);
        return saveTypeContainer;
    },

    createSaveTypeNew: function ()
    {
        let panel = this.doc.createElement('vbox');
        panel.setAttribute("id", "keefox-save-password-new-panel");
        panel.classList.add("enabled");
        
        let dbSel = this.createDBSelect();
        dbSel.style.backgroundImage = dbSel.selectedOptions[0].style.backgroundImage;
              
        let dbSelContainer = this.doc.createElement('hbox');
        dbSelContainer.setAttribute('class', 'keeFox-save-password');
        let dbSelLabel = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'label');
        dbSelLabel.setAttribute('for', dbSel.id);
        dbSelLabel.textContent = keefox_org.locale.$STR("database.label");
              
        dbSelContainer.appendChild(dbSelLabel);
        dbSelContainer.appendChild(dbSel);
                            
        if (dbSel.options.length <= 1)
            dbSelContainer.classList.add('disabled');
              
        panel.appendChild(dbSelContainer);
              
        let groupSelContainer = this.createGroupSelector();
        panel.appendChild(groupSelContainer);
        return panel;
    },

    createSaveTypeUpdate1: function ()
    {
        let panel = this.doc.createElement('vbox');
        panel.classList.add("disabled");
        panel.setAttribute("id", "keefox-save-password-update-panel1");
        //let whichEntryLabel = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'label');
        let whichEntryLabel = this.doc.createElement('label');
        whichEntryLabel.textContent = keefox_org.locale.$STR("whichEntry.label");
        whichEntryLabel.classList.add("KeeFox-message");
        panel.appendChild(whichEntryLabel);

        let searchResultspanel = this.doc.createElement('vbox');
        let searchBox = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'input');
        searchBox.setAttribute("placeholder", keefox_org.locale.$STR("KeeFox_Search.label"));
        searchBox.setAttribute("type", "text");
        searchBox.setAttribute("id", "KeeFox-SavePassword-searchbox");
        searchBox.setAttribute("title", keefox_org.locale.$STR("KeeFox_Search.tip")); //TODO:1.5: Same as main search box? Change both for new auto-domain search feature?
        searchBox.classList.add("KeeFox-Search");
        searchBox.addEventListener('input',function(e){
            //TODO:1.5: domain search ["dom.ain"] etc. 
            this.search.execute(e.target.value, this.onSearchComplete.bind(this));
        }.bind(this), false);

        let searchResults = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'div');
        //searchResults.classList.add("enabled");
        searchResults.setAttribute("id", "KeeFox-SavePassword-SearchResults");
        
        searchResultspanel.appendChild(searchBox);
        searchResultspanel.appendChild(searchResults);
        panel.appendChild(searchResultspanel);

        return panel;
    },
    
    createSaveTypeUpdate2: function ()
    {
        let panel = this.doc.createElement('vbox');
        panel.classList.add("disabled");
        panel.setAttribute("id", "keefox-save-password-update-panel2");
        
        let selectedEntryContainer = this.doc.createElement('hbox');
        let selectedEntryList = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'ul');
        selectedEntryList.setAttribute("id","KeeFox-SaveLogin-selectedEntryList");
        // added by script on change to this view
        // let selectedEntryListItem = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'li');
        // selectedEntryList.appendChild(selectedEntryListItem);
        let selectedEntryChangeButton = this.doc.createElement('button');
        selectedEntryChangeButton.setAttribute("label", "(LOC:) CHANGE...");
        selectedEntryChangeButton.classList.add("KeeFox-SaveLogin-Change-Setting");
        selectedEntryChangeButton.addEventListener("command", this.enableSelectEntryToUpdate.bind(this));
        selectedEntryContainer.appendChild(selectedEntryList);
        selectedEntryContainer.appendChild(selectedEntryChangeButton);
        panel.appendChild(selectedEntryContainer);

        let loginFieldsUpdateStatusContainer = this.doc.createElement('hbox');
        let loginFieldsUpdateStatus = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'label');
        loginFieldsUpdateStatus.textContent = "(LOC:) The selected entry will have all username, password and other form fields updated to the values you have just entered.";
        loginFieldsUpdateStatus.classList.add("KeeFox-message");
        loginFieldsUpdateStatusContainer.appendChild(loginFieldsUpdateStatus);
        let loginFieldsUpdateButton = this.doc.createElement('button');
        loginFieldsUpdateButton.setAttribute("label", "(LOC:) CHANGE...");
        loginFieldsUpdateButton.setAttribute("id","KeeFox-loginFieldsUpdateButton");
        loginFieldsUpdateButton.classList.add("KeeFox-SaveLogin-Change-Setting");
        loginFieldsUpdateButton.addEventListener("command", this.enableEditFields.bind(this));
        loginFieldsUpdateStatusContainer.appendChild(loginFieldsUpdateButton);
        panel.appendChild(loginFieldsUpdateStatusContainer);

        let loginFieldsUpdateActionContainer = this.doc.createElement('vbox');
        loginFieldsUpdateActionContainer.classList.add("disabled");
        loginFieldsUpdateActionContainer.setAttribute("id","KeeFox-loginFieldsUpdateActionContainer");
        let loginFieldsUpdateActionExplanation = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'label');
        loginFieldsUpdateActionExplanation.textContent = "(LOC:) KeeFox can only perform simple adjustments to your password entries.";
        loginFieldsUpdateActionExplanation.classList.add("KeeFox-message");
        loginFieldsUpdateActionContainer.appendChild(loginFieldsUpdateActionExplanation);
        let loginFieldsUpdateAbortButton = this.doc.createElement('button');
        loginFieldsUpdateAbortButton.setAttribute("label", "(LOC:) Abort this update and open the entry for manual editing");
        loginFieldsUpdateAbortButton.classList.add("KeeFox-SaveLogin-Abort");
        loginFieldsUpdateAbortButton.addEventListener("command", this.abortAndLaunchManualEdit.bind(this));
        loginFieldsUpdateActionContainer.appendChild(loginFieldsUpdateAbortButton);
        panel.appendChild(loginFieldsUpdateActionContainer);

        let loginURLsUpdateStatusContainer = this.doc.createElement('hbox');
        loginURLsUpdateStatusContainer.setAttribute("id","KeeFox-loginURLsUpdateStatusContainer");
        let loginURLsUpdateStatus = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'label');
        loginURLsUpdateStatus.textContent = "(LOC:) The entry's web page address (URL) will be updated with the latest URL.";
        loginURLsUpdateStatus.classList.add("KeeFox-message");
        loginURLsUpdateStatusContainer.appendChild(loginURLsUpdateStatus);
        let loginURLsUpdateButton = this.doc.createElement('button');
        loginURLsUpdateButton.setAttribute("label", "(LOC:) CHANGE...");
        loginURLsUpdateButton.classList.add("KeeFox-SaveLogin-Change-Setting");
        loginURLsUpdateButton.addEventListener("command", this.enableEditURLs.bind(this));
        loginURLsUpdateStatusContainer.appendChild(loginURLsUpdateButton);
        panel.appendChild(loginURLsUpdateStatusContainer);

        let loginURLsUpdateRadioGroup = this.doc.createElement('radiogroup');
        loginURLsUpdateRadioGroup.classList.add("disabled");
        loginURLsUpdateRadioGroup.setAttribute("id","KeeFox-loginURLsUpdateRadioGroup");
        let loginURLsUpdateRadio1 = this.doc.createElement('radio');
        loginURLsUpdateRadio1.setAttribute("label", "(LOC:) Replace the entry's URL (but still fill forms if you visit the old URL)");
        loginURLsUpdateRadio1.setAttribute("selected", "true");
        loginURLsUpdateRadioGroup.appendChild(loginURLsUpdateRadio1);
        let loginURLsUpdateRadio2 = this.doc.createElement('radio');
        loginURLsUpdateRadio2.setAttribute("label", "(LOC:) Replace the entry's URL (delete the old URL completely)");
        loginURLsUpdateRadio2.setAttribute("selected", "false");
        loginURLsUpdateRadioGroup.appendChild(loginURLsUpdateRadio2);
        let loginURLsUpdateRadio3 = this.doc.createElement('radio');
        loginURLsUpdateRadio3.setAttribute("label", "(LOC:) Keep the old entry's URL (but still fill forms if you visit the new URL)");
        loginURLsUpdateRadio3.setAttribute("selected", "false");
        loginURLsUpdateRadioGroup.appendChild(loginURLsUpdateRadio3);
        let loginURLsUpdateRadio4 = this.doc.createElement('radio');
        loginURLsUpdateRadio4.setAttribute("label", "(LOC:) Keep the old entry's URL (don't add the new URL to the entry)");
        loginURLsUpdateRadio4.setAttribute("selected", "false");
        loginURLsUpdateRadioGroup.appendChild(loginURLsUpdateRadio4);
        panel.appendChild(loginURLsUpdateRadioGroup);

        return panel;
    },

    createGroupSelector: function ()
    { 
        let groupSel = this.createGroupSelect();
        this.updateGroups(
           keefox_org.KeePassDatabases[keefox_org.ActiveKeePassDatabaseIndex],groupSel);
                
        let groupSelContainer = this.doc.createElement('hbox');
        groupSelContainer.setAttribute('class', 'keeFox-save-password');
        let groupSelLabel = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'label');
        groupSelLabel.setAttribute('for', groupSel.id);
        groupSelLabel.textContent = keefox_org.locale.$STR("group.label");
                
        groupSelContainer.appendChild(groupSelLabel);
        groupSelContainer.appendChild(groupSel);
        return groupSelContainer;
    },

    enableEditEntry: function () {
        // If we've already chosen an entry to edit, clicking on this tab takes
        // us back to the 2nd stage of the update process
        if (this.saveData.oldLoginUUID)
            this.enableUpdateEntryDetails();
        else
            this.enableSelectEntryToUpdate();
    },

    enableEditURLs: function ()
    {
        let loginURLsUpdateStatusContainer = this.doc.getElementById("KeeFox-loginURLsUpdateStatusContainer");
        let loginURLsUpdateRadioGroup = this.doc.getElementById("KeeFox-loginURLsUpdateRadioGroup");
        loginURLsUpdateStatusContainer.classList.add("disabled");
        loginURLsUpdateStatusContainer.classList.remove("enabled");
        loginURLsUpdateRadioGroup.classList.add("enabled");
        loginURLsUpdateRadioGroup.classList.remove("disabled");
    },

    enableEditFields: function ()
    {
        let loginFieldsUpdateButton = this.doc.getElementById("KeeFox-loginFieldsUpdateButton");
        let loginFieldsUpdateActionContainer = this.doc.getElementById("KeeFox-loginFieldsUpdateActionContainer");
        loginFieldsUpdateButton.classList.add("disabled");
        loginFieldsUpdateButton.classList.remove("enabled");
        loginFieldsUpdateActionContainer.classList.add("enabled");
        loginFieldsUpdateActionContainer.classList.remove("disabled");
    },

    enableNewEntry: function ()
    {
        let panel1 = this.doc.getElementById("keefox-save-password-new-panel");
        let panel2 = this.doc.getElementById("keefox-save-password-update-panel1");
        let panel3 = this.doc.getElementById("keefox-save-password-update-panel2");
        panel1.classList.add("enabled");
        panel2.classList.add("disabled");
        panel3.classList.add("disabled");
        panel1.classList.remove("disabled");
        panel2.classList.remove("enabled");
        panel3.classList.remove("enabled");
        this.saveData.update = false;

        this.setTypeChooserButtonState("keefox-save-password-new-button", "keefox-save-password-update-button");
    },

    enableSelectEntryToUpdate: function ()
    {
        let panel1 = this.doc.getElementById("keefox-save-password-new-panel");
        let panel2 = this.doc.getElementById("keefox-save-password-update-panel1");
        let panel3 = this.doc.getElementById("keefox-save-password-update-panel2");
        panel1.classList.add("disabled");
        panel2.classList.add("enabled");
        panel3.classList.add("disabled");
        panel1.classList.remove("enabled");
        panel2.classList.remove("disabled");
        panel3.classList.remove("enabled");
        this.saveData.update = true;
        let selectedEntryList = this.doc.getElementById("KeeFox-SaveLogin-selectedEntryList");
        while (selectedEntryList.firstChild)
            selectedEntryList.removeChild(selectedEntryList.firstChild); 
        this.saveData.oldLoginUUID = null;
        this.saveData.db = null;

        this.setTypeChooserButtonState("keefox-save-password-update-button", "keefox-save-password-new-button");
    },

    enableUpdateEntryDetails: function ()
    {
        let panel1 = this.doc.getElementById("keefox-save-password-new-panel");
        let panel2 = this.doc.getElementById("keefox-save-password-update-panel1");
        let panel3 = this.doc.getElementById("keefox-save-password-update-panel2");
        panel1.classList.add("disabled");
        panel2.classList.add("disabled");
        panel3.classList.add("enabled");
        panel1.classList.remove("enabled");
        panel2.classList.remove("enabled");
        panel3.classList.remove("disabled");
        this.saveData.update = true;

        this.setTypeChooserButtonState("keefox-save-password-update-button", "keefox-save-password-new-button");
    },

    setTypeChooserButtonState: function (selectedId, unselectedId)
    {
        let selectedButton = this.doc.getElementById(selectedId);
        let otherButton = this.doc.getElementById(unselectedId);
        selectedButton.classList.add("selected");
        otherButton.classList.add("unselected");
        selectedButton.classList.remove("unselected");
        otherButton.classList.remove("selected");
    },

    abortAndLaunchManualEdit: function ()
    {
        //let selectedLogin = this.doc.getElementById("KeeFox-SaveLogin-selectedEntryList").firstChild;
        keefox_org.launchLoginEditor(this.saveData.oldLoginUUID, this.saveData.db);
        keefox_win.notificationManager.remove("password-save");
    },
    
    onSearchComplete: function (logins)
    {
        logins = logins.sort(function(a,b) {
            if (a.relevanceScore > b.relevanceScore)
                return -1;
            if (a.relevanceScore < b.relevanceScore)
                return 1;
            return 0;
        });
        this.showSearchResults(logins);
    },
    
    // Calling this function with null or empty logins array will clear all existing search results
    showSearchResults: function (logins)
    {
        keefox_win.Logger.debug("passwordSaver showSearchResults started");
        
        let ps = this;

        // The container that we want to add our search results to.
        var container = this.getEmptyContainerFor("KeeFox-SavePassword-SearchResults");
        //this.disableUIElement("KeeFox-PanelSubSection-SearchResults");
        if (container === undefined || container == null || logins == null || logins.length == 0)
            return;
            
        keefox_win.Logger.debug(logins.length + " search results found");

        for (let i = 0; i < logins.length; i++) {
            var login = logins[i];
            var usernameValue = "";
            var usernameName = "";
            var usernameDisplayValue = "[" + keefox_org.locale.$STR("noUsername.partial-tip") + "]";
            usernameValue = login.usernameValue;
            if (usernameValue != undefined && usernameValue != null && usernameValue != "")
                usernameDisplayValue = usernameValue;
            usernameName = login.usernameName;

            var loginItem = ps.doc.createElementNS('http://www.w3.org/1999/xhtml', 'li');
            loginItem.setAttribute("class","login-item");
            loginItem.setAttribute("data-fileName",login.dbFileName);
            loginItem.setAttribute("data-usernameName",usernameName);
            loginItem.setAttribute("data-usernameValue",usernameValue);
            loginItem.setAttribute("data-url",login.url);
            loginItem.setAttribute("data-uuid",login.uniqueID);
            loginItem.setAttribute("style",'background-image:url(data:image/png;base64,' + login.iconImageData + ')');
            loginItem.setAttribute("title",keefox_org.locale.$STRF(
                "loginsButtonLogin.tip", [login.url, usernameDisplayValue]));
            loginItem.setAttribute("tabindex","-1");
            
            if (keefox_org._keeFoxExtension.prefs.getValue("alwaysDisplayUsernameWhenTitleIsShown",false))
                loginItem.textContent = keefox_org.locale.$STRF("matchedLogin.label", [usernameDisplayValue, login.title]);
            else
                loginItem.textContent = login.title;
            //TODO:1.5: Keyboard nav?
            //loginItem.addEventListener("keydown", this.keyboardNavHandler, false);
            loginItem.addEventListener("mouseup", function (event) { 
                // Make sure no parent groups override the actions of this handler
                event.stopPropagation();

                if (event.button == 0 || event.button == 1)
                {
                    this.dispatchEvent(new CustomEvent("keefoxCommand", { 'detail': { 'button': event.button, 'ctrlKey': event.ctrlKey }}));
                } 
            }, false);
            loginItem.addEventListener("keefoxCommand", function (event) { 
                ps.saveData.oldLoginUUID = this.getAttribute('data-uuid');
                ps.saveData.db = this.getAttribute('data-fileName');

                var loginItem = ps.doc.createElementNS('http://www.w3.org/1999/xhtml', 'li');
                loginItem.setAttribute("class","login-item");
                loginItem.setAttribute("style",this.getAttribute("style"));
                loginItem.setAttribute("title",this.getAttribute("title"));
                loginItem.setAttribute("tabindex","-1");
                loginItem.textContent = this.textContent;
                ps.doc.getElementById("KeeFox-SaveLogin-selectedEntryList").appendChild(loginItem);

                ps.enableUpdateEntryDetails();
            }, false);
            
            container.appendChild(loginItem);
        }
        
        // Update the UI state to reflect the number of logins found
        //if (container.childElementCount > 0)
        //    this.enableUIElement("KeeFox-PanelSubSection-SearchResults");
        
        keefox_win.Logger.debug(logins.length + " search results set.");
    },

    getEmptyContainerFor: function (id)
    {
        let panelSection = this.doc.getElementById(id);
        if (panelSection === undefined || panelSection == null)
            return null;
        
        // Remove all of the existing items by removing the top-level list
        // if it has been created earlier
        if (panelSection.childNodes.length > 0)
            panelSection.removeChild(panelSection.childNodes[0]);
        
        // Create the ul menu top level container        
        let groupContainer = this.doc.createElement('ul');
        groupContainer.setAttribute("id",id + '-Container');
        panelSection.appendChild(groupContainer);
        return groupContainer;
    }

};

