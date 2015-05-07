/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
  Copyright 2008-2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This panel.js file contains functions and data related to the visible
  user interface panel.

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

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://kfmod/kfDataModel.js");

keefox_win.panel = {

    _observerService : null,

    // The Firefox CustomisableUI widget that our panel is attached to
    _widget : null,

    viewShowingHackTimer : null,

    construct : function (currentWindow) {
        this._currentWindow = currentWindow;
        this.panelContainerId = "keefox-panelview";

        try
        {
            // Get or create the main KeeFox widget (it's shared across windows)
            Components.utils.import("resource:///modules/CustomizableUI.jsm", this);
            let wrapperGroup = this.CustomizableUI.getWidget('keefox-button');
            if (wrapperGroup == null || wrapperGroup.type == 'custom')
            {
                keefox_win.Logger.debug("Didn't find KeeFox widget");
                wrapperGroup = this.CustomizableUI.createWidget({
                    id: "keefox-button",
                    type:"view",
                    viewId:"keefox-panelview",
                    defaultArea: "nav-bar",
                    removable: true,
                    label: "KeeFox",
                    tooltiptext: "KeeFox",
                    onViewShowing: function (evt)
                    {
                        var targetDoc = evt.target.ownerDocument;

                        // Make sure our notifications are visible here instead of the persistent
                        // panel (in case user clicks on KeeFox menu button while persistent panel
                        // is still visible). We achieve that by closing the persistent panel and
                        // letting its onhiding code tidy up after itself
                        targetDoc.getElementById('keefox-persistent-panel').hidePopup();

                        // We need this delay because the _findFirstFocusableChildItem code needs
                        // to consider only elements that are currently visible and the only way
                        // to do this is to allow the view to be rendered before inspecting it.
                        // What we really want is something like an onViewShown event, fired when
                        // we know that the user is already seeing the finished rendered view.
                        let panel = evt.target.ownerGlobal.keefox_win.panel;
                        panel.viewShowingHackTimer = Components.classes["@mozilla.org/timer;1"]
                                .createInstance(Components.interfaces.nsITimer);
                        panel.viewShowingHackTimer.initWithCallback(
                            function () {
                                let pv = targetDoc.getElementById('keefox-panelview');
                                //evt.target.ownerGlobal.keefox_win.Logger.debug("Found panelview: " + pv);
                                panel._findFirstFocusableChildItem(pv).focus();
                            },
                            50, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
                    },
                    onViewHiding: function (evt)
                    {
                        // Clear search terms
                        evt.target.ownerDocument.getElementById('KeeFox-PanelSection-searchbox').value = "";
                        // Clear search results
                        evt.target.ownerGlobal.keefox_win.panel.onSearchComplete([]);
                        // Close subpanels
                        evt.target.ownerGlobal.keefox_win.panel.hideSubSections();
                    },
                    onBeforeCreated: function (doc)
                    {
                        // This sometimes gets called before KeeFox has been initialised.
                        // Most notably, the panel object defined in this file may not exist.
                        // We pass the panel object in as 'this' to make calling further
                        // functions easier but we must not rely on having access to any 
                        // data or state (such as the _currentWindow)
                        let win = doc.ownerGlobal;
                        win.keefox_win.panel.buildPanel.call(win.keefox_win.panel, win);
                    }
                });
                keefox_win.Logger.info("Created KeeFox widget");
            }
            this._widget = wrapperGroup.forWindow(this._currentWindow);
            keefox_win.Logger.debug("KeeFox widget instance found");
        }
        catch (e)
        {
            // We only create the panel in FF >= Australis so should be able to rely on it working... but just in case...
            keefox_win.Logger.error("Failed to create KeeFox widget because: " + e);
        }

        this._observerService = Components.classes["@mozilla.org/observer-service;1"]
                    .getService(Components.interfaces.nsIObserverService);
        
        currentWindow.messageManager.addMessageListener("keefox:matchedLoginsChanged", this.matchedLoginsChangedListener);

    },

    // Listen for notifications that we've decided on a new list of new matched logins and forward them to other interested observers in the main chrome process
    matchedLoginsChangedListener: function (message)
    {
        keefox_win.Logger.debug("panel matchedLoginsChangedListener called");
        // Make sure we only process messages from the currently displayed tab
        if (message.target === window.gBrowser.selectedBrowser)
            keefox_win.panel.setLogins(message.data.logins, message.data.notifyUserOnSuccess);
    },
    
    _currentWindow: null,

    shutdown: function () { },

    buildPanel: function (win) {
        this._currentWindow = win;

        let panelview = win.document.createElement('panelview');
        panelview.id = 'keefox-panelview';
        panelview.setAttribute('tooltip', 'aHTMLTooltip');
        panelview.setAttribute('flex', '1');
        
        // wrapping the content avoids the scrollbar most of the time but when it is really needed, we get given double scrollbars
        //this.wrapPanelContents(panelview);
        this.populatePanel(panelview);

        // Inject our panel view into the multiView panel
        let multiview = win.document.getElementById('PanelUI-multiView');
        multiview.appendChild(panelview);
        try { keefox_win.Logger.debug("Injected KeeFox panel"); } catch (e) {}
    },

    wrapPanelContents: function (panel) {
        let panelContentsWrapper = this.createUIElement('div', [
            ['id','KeeFox-PanelSection-div-wrapper']
        ]);
        
        this.populatePanel(panelContentsWrapper);

        // Inject our content wrapper into the panelview
        panel.appendChild(panelContentsWrapper);
        try { keefox_win.Logger.debug("Wrapped KeeFox panel"); } catch (e) {}
    },
    
    populatePanel: function (panel) {
        let closure = this;

        // Each main "panel section" component is a div with a button to invoke the main action.
        
        let notificationsTab = this.createUIElement('div', [
            ['class', 'KeeFox-PanelSection enabled'],
            ['id','KeeFox-PanelSection-notifications-tab']
        ]);

        let notificationsWindow = this.createUIElement('div', [
            ['class','KeeFox-PanelSection enabled'],
            ['id', 'KeeFox-PanelSection-notifications-window']
        ]);

        let statusTextContainer = this.createUIElement('div', [
            ['class','KeeFox-PanelSection disabled'],
            ['id','KeeFox-PanelSection-status-text']
        ]);

        let status = this.createPanelSection(
            'KeeFox-PanelSection-status',
            null,
            // This localisation key won't exist but that's OK because we'll always 
            // set it to something relevant before displaying the status panel section
            'do-a-thing' 
        );
        this.disableUIElementNode(status);
        
        // This close panel will be displayed only when a subpanel is being displayed
        let subPanelCloser = this.createPanelSection(
            'KeeFox-PanelSection-close',
            function () { closure.hideSubSections(); },
            'KeeFox_Back'
        );        
        
        let searchPanel = this.createUIElement('div', [
            ['class','KeeFox-PanelSection enabled'],
            ['id','KeeFox-PanelSection-search']
        ]);
        let searchBox = this.createUIElement('input', [
            ['class','KeeFox-Search'],
            ['id','KeeFox-PanelSection-searchbox'],
            ['type','text'],
            ['placeholder',keefox_org.locale.$STR('KeeFox_Search.label')],
            ['title',keefox_org.locale.$STR('KeeFox_Search.tip')]
        ]);
        searchBox.addEventListener('input',function(e){
            //TODO1.5: rate limit searches?
            keefox_org.search.execute(e.target.value, closure.onSearchComplete);
        }, false);

        searchBox.addEventListener("keydown", this.keyboardNavHandler, false);
        searchBox.addEventListener("keefoxEscape", function (event) {
            //console.log("keefoxEscape event detected! coming from this element:", e.target);
            if (event.target.value.length > 0)
                event.target.value = "";
            else
                keefox_win.panel.CustomizableUI.hidePanelForNode(
                    keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
        }, false);



        searchPanel.appendChild(searchBox);
        let searchResultsContainer = this.createUIElement('div', [
            ['class','KeeFox-PanelInlineSection KeeFox-SearchResults enabled'],
            ['id','KeeFox-PanelSubSection-SearchResults']
        ]);
        searchPanel.appendChild(searchResultsContainer);
        
        // The main action for the list of matched logins will display the list of matched logins, but this behaviour is
        // not required in most cases (since the discovery of any matched logins will automatically
        // result in the list being displayed in the main panel)
        let matchedLogins = this.createPanelSection(
            'KeeFox-PanelSection-matchedLogins',
            function () { closure.showSubSectionMatchedLogins(); },
            'KeeFox_Matched-Logins-Button'
        );
        this.disableUIElementNode(matchedLogins);
        let matchedLoginsListContainer = this.createUIElement('div', [
            ['class','KeeFox-PanelInlineSection KeeFox-LoginList enabled'],
            ['id','KeeFox-PanelSubSection-MatchedLoginsList']
        ]);
        matchedLogins.insertBefore(matchedLoginsListContainer,matchedLogins.lastChild);
        let matchedLoginsListOverflowContainer = this.createUIElement('div', [
            ['class','KeeFox-PanelSubSection KeeFox-LoginList overflow enabled'],
            ['id','KeeFox-PanelSubSection-MatchedLoginsList-Overflow']
        ]);
        matchedLogins.insertBefore(matchedLoginsListOverflowContainer,matchedLogins.lastChild);

        // similar deal to the matchedLogins section
        let allLogins = this.createPanelSection(
            'KeeFox-PanelSection-allLogins', 
            function () { closure.showSubSectionAllLogins(); },
            'KeeFox_Logins-Button'
        );

        // is it really an PanelInlineSection? what about when user changes setting from 0 to 1+ items to display? then it will ahve to start behaving differently...
        this.disableUIElementNode(allLogins);
        let allLoginsListContainer = this.createUIElement('div', [
            ['class','KeeFox-PanelInlineSection KeeFox-LoginList enabled'],
            ['id','KeeFox-PanelSubSection-AllLoginsList']
        ]);
        allLogins.insertBefore(allLoginsListContainer,allLogins.lastChild);
        let allLoginsListOverflowContainer = this.createUIElement('div', [
            ['class','KeeFox-PanelSubSection KeeFox-LoginList overflow enabled'],
            ['id','KeeFox-PanelSubSection-AllLoginsList-Overflow']
        ]);
        allLogins.insertBefore(allLoginsListOverflowContainer,allLogins.lastChild);
        
        let generatePassword = this.createPanelSection(
            'KeeFox-PanelSection-generatePassword', 
            function () { closure.showSubSectionGeneratePassword(); },
            'KeeFox_Menu-Button.copyNewPasswordToClipboard'
        );
        this.disableUIElementNode(generatePassword);
        let generatePasswordListContainer = this.createUIElement('div', [
            ['class','KeeFox-PanelSubSection KeeFox-PasswordProfileList enabled'],
            ['id','KeeFox-PanelSubSection-PasswordProfileList']
        ]);
        generatePassword.appendChild(generatePasswordListContainer);
        
        let changeDatabase = this.createPanelSection(
            'KeeFox-PanelSection-changeDatabase', 
            function () { closure.showSubSectionChangeDatabase(); },
            'KeeFox_Menu-Button.changeDB'
        );
        this.disableUIElementNode(changeDatabase);
        let changeDatabaseListContainer = this.createUIElement('div', [
            ['class','KeeFox-PanelSubSection KeeFox-DatabaseList enabled'],
            ['id','KeeFox-PanelSubSection-DatabaseList']
        ]);
        changeDatabase.appendChild(changeDatabaseListContainer);
        
        
        let detectForms = this.createPanelSection(
            'KeeFox-PanelSection-detectForms', 
            function () {
                keefox_win.UI.fillCurrentDocument();
                closure.CustomizableUI.hidePanelForNode(
                    closure._currentWindow.document.getElementById('keefox-panelview'));
            },
            'KeeFox_Menu-Button.fillCurrentDocument'
        );
        this.disableUIElementNode(detectForms);
        
        let options = this.createPanelSection(
            'KeeFox-PanelSection-options', 
            function () { openDialog(
               "chrome://keefox/content/options.xul",
               "",
               "centerscreen,dialog=no,chrome,resizable,dependent,modal"
              ); },
            'KeeFox_Menu-Button.options'
        );
        let help = this.createPanelSection(
            'KeeFox-PanelSection-help', 
            function () {
                keefox_org.utils._openAndReuseOneTabPerURL('http://keefox.org/help'); 
                closure.CustomizableUI.hidePanelForNode(
                    closure._currentWindow.document.getElementById('keefox-panelview'));
            },
            'KeeFox_Help-Centre-Button'
        );

        panel.appendChild(notificationsTab);
        panel.appendChild(notificationsWindow);
        panel.appendChild(statusTextContainer);
        panel.appendChild(status);
        panel.appendChild(subPanelCloser);
        panel.appendChild(searchPanel);
        panel.appendChild(matchedLogins);
        panel.appendChild(allLogins);
        panel.appendChild(generatePassword);
        panel.appendChild(changeDatabase);
        panel.appendChild(detectForms);
        panel.appendChild(options);
        panel.appendChild(help);
    },
    
    createPanelSection: function (id, onCommand, stringKeyBase)
    {
        // A panel section is a div that contains a variety of user interface items.
        // Some interface items will be displayed only under certain circumstances and others may be displayed 
        //but disabled in some circumstances, although my initial preference is to hide all items that 
        //can't be interacted with to keep things tidy.
        
        // All sections contain at least one button to trigger the section's primary action, other contents will be defined elsewhere
        
        let elem = this.createUIElement('div', [
            ['class','KeeFox-PanelSection enabled'],
            ['id',id]
        ]);
        let button = this.createUIElement('input', [
            ['class','KeeFox-Action enabled'],
            ['id',id+'-main-action'],
            ['type','button'],
            ['value',keefox_org.locale.$STR(stringKeyBase + '.label')],
            ['title',keefox_org.locale.$STR(stringKeyBase + '.tip')]
        ]);
        
        if (onCommand)
        {
            button.addEventListener("mouseup", function (event) { 
                if (event.button == 0 || event.button == 1) onCommand(event); }, false);
            button.addEventListener("keydown", this.keyboardNavHandler, false);
            button.addEventListener("keefoxCommand", onCommand, false);
        }
        elem.appendChild(button);
        return elem;
    },
    
    // elements that are neither enabled nor disabled should inherit the state of their parent
    enableUIElement: function (id)
    {
    //return;
        let elem = this._currentWindow.document.getElementById(id);
        if (!elem)
            return;
        this.enableUIElementNode(elem);
    },
    disableUIElement: function (id)
    {
    //return;
        let elem = this._currentWindow.document.getElementById(id);
        if (!elem)
            return;
        this.disableUIElementNode(elem);
    },

    enableUIElementNode: function (elem)
    {
        elem.classList.add('enabled');
        elem.classList.remove('disabled');
    },
    disableUIElementNode: function (elem)
    {
        elem.classList.remove('enabled');
        elem.classList.add('disabled');
    },

    createUIElement: function (tag, attrs)
    {
        let elem = this._currentWindow.document.createElementNS('http://www.w3.org/1999/xhtml', tag);
        for (let i=0; i<attrs.length; i++)
            elem.setAttribute(attrs[i][0], attrs[i][1]);
        return elem;
    },
    
    hideSubSections: function ()
    {
        let elem = this._currentWindow.document.getElementById(this.panelContainerId);
        elem.classList.remove('subpanel-enabled');
        let toHide = elem.getElementsByClassName('enabled KeeFox-PanelSubSection');
        if (toHide.length > 0)
            toHide[0].parentNode.classList.remove('subpanel-enabled');
        while (toHide.length)
            this.disableUIElementNode(toHide[0]); // removes enabled class and thus deletes from the toHide list

        //TODO1.5: Might make more sense to remember which subpanel was just closed and focus that button instead
        this._currentWindow.document.getElementById('KeeFox-PanelSection-searchbox').focus();
    },

    showSubSection: function (id)
    {
        let elem = this._currentWindow.document.getElementById(id);
        this.enableUIElementNode(elem);
        elem.parentNode.classList.add('subpanel-enabled');
        let panel = this._currentWindow.document.getElementById(this.panelContainerId);
        panel.classList.add('subpanel-enabled');
        
        // Try to focus on the first item in the newly displayed sub section
        let matches = elem.getElementsByTagName('li');
        if (!matches)
            return;
        let firstMatch = matches[0];
        if (firstMatch)
            firstMatch.focus();
    },
    
    showSubSectionMatchedLogins: function ()
    {
        this.showSubSection('KeeFox-PanelSubSection-MatchedLoginsList-Overflow');
    },
    
    showSubSectionAllLogins: function ()
    {
        this.showSubSection('KeeFox-PanelSubSection-AllLoginsList-Overflow');
    },
    
    showSubSectionGeneratePassword: function ()
    {
        let profileContainer = this._currentWindow.document.getElementById('KeeFox-PanelSubSection-PasswordProfileList');
        // Remove all of the existing profiles
        for (let i = profileContainer.childNodes.length; i > 0; i--) {
            profileContainer.removeChild(profileContainer.childNodes[0]);
        }

        profileContainer.setAttribute("loading", "true");

        keefox_win.mainUI.generatePassword();

        this.showSubSection('KeeFox-PanelSubSection-PasswordProfileList');
        keefox_org.getPasswordProfiles();
    },
    
    showSubSectionChangeDatabase: function ()
    {
        let dbcontainer = this._currentWindow.document.getElementById('KeeFox-PanelSubSection-DatabaseList');
        
        // Remove all of the existing databases
        for (let i = dbcontainer.childNodes.length; i > 0; i--) {
            dbcontainer.removeChild(dbcontainer.childNodes[0]);
        }

        dbcontainer.setAttribute("loading", "true");
        keefox_win.mainUI._currentWindow.keefox_org.getAllDatabaseFileNames();
        this.showSubSection('KeeFox-PanelSubSection-DatabaseList');
    },
    

    // remove matched logins from the menu
    removeLogins: function () {
        keefox_win.Logger.debug("Removing all matched logins");
        // Get the toolbaritem "container" that we added to our XUL markup
        var container = this._currentWindow.document.getElementById("KeeFox-PanelSubSection-MatchedLoginsList");
        if (container === undefined || container == null)
            return;

        // Remove all of the existing buttons
        for (let i = container.childNodes.length; i > 0; i--) {
            container.removeChild(container.childNodes[0]);
        }

        var containeroverflow = this._currentWindow.document.getElementById("KeeFox-PanelSubSection-MatchedLoginsList-Overflow");
        if (containeroverflow === undefined || containeroverflow == null)
            return;

        // Remove all of the existing buttons
        for (let i = containeroverflow.childNodes.length; i > 0; i--) {
            containeroverflow.removeChild(containeroverflow.childNodes[0]);
        }

        this.disableUIElement("KeeFox-PanelSection-matchedLogins-main-action");

        // get the context menu popup
        var contextPopup = this._currentWindow.document.getElementById("keefox-command-context-showMenuMatchedLogins-popup");
        if (contextPopup === undefined || contextPopup == null)
            return;

        // Remove all of the existing buttons
        // the node list changes as we remove items so we always just get rid of the first one
        for (let i = contextPopup.childNodes.length; i > 0; i--) {
            contextPopup.removeChild(contextPopup.childNodes[0]);
        }

        this.setupButton_ready(null, this._currentWindow);
    },

    compareRelevanceScores: function (a, b) {
        return b.relevanceScore - a.relevanceScore;
    },

    // populate the "all logins" menu with every login in this database
    setAllLogins: function () {
        keefox_win.Logger.debug("setAllLogins start");

        // get and reset the popup menu for the complete list of logins
        var container = this.getEmptyContainerFor("KeeFox-PanelSubSection-AllLoginsList");
        
        if (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false)) {
            // start with the current root group uniqueID
            try {
                if (!window.keefox_org._keeFoxExtension.prefs.getValue("listAllOpenDBs",false))
                {
                    var rootGroup = keefox_org.KeePassDatabases[keefox_org.ActiveKeePassDatabaseIndex].root;
                    if (rootGroup != null && rootGroup != undefined && rootGroup.uniqueID)
                    {
                        var dbFileName = keefox_org.KeePassDatabases[keefox_org.ActiveKeePassDatabaseIndex].fileName;
                        this.setOneLoginsMenu(container, rootGroup, dbFileName, true);
                    }
                } else
                {
                    for (let i=0; i<keefox_org.KeePassDatabases.length; i++)
                    {
                        var rootGroup = keefox_org.KeePassDatabases[i].root;
                        if (rootGroup != null && rootGroup != undefined && rootGroup.uniqueID)
                        {
                            var dbFileName = keefox_org.KeePassDatabases[i].fileName;
                            
                            if (keefox_org.KeePassDatabases.length > 1)
                            {
                                // We have more than one database opened so the list of databases becomes our top-level view
                                // we still need to respect the list of max entries to be listed at the top level

                                // Switch to the overflow container if we reach the limit of the main panel container
                                // By default, we won't show any items in the main panel
                                if (container.id != "KeeFox-PanelSubSection-AllLoginsList-Overflow-Container" 
                                    && i >= keefox_org._keeFoxExtension.prefs.getValue("maxAllLoginsInMainPanel",0))
                                    container = this.getEmptyContainerFor("KeeFox-PanelSubSection-AllLoginsList-Overflow");

                                var dbName = keefox_org.KeePassDatabases[i].name;

                                let groupItem = this.createGroupItem(rootGroup,dbFileName, null, dbName + ' / ' + rootGroup.title);
                                container.appendChild(groupItem);

                            } else
                            {
                                this.setOneLoginsMenu(container, rootGroup, dbFileName, true);
                            }
                        }
                    }
                }
            } catch (e) {
                keefox_win.Logger.error("setAllLogins exception: " + e);
                return;
            }
            //loginButton.setAttribute("disabled", "false");
        } else {
            //loginButton.setAttribute("disabled", "true");
        }
        keefox_win.Logger.debug("setAllLogins end");
        return;
    },

    // add all the logins and subgroups for one KeePass group
    setOneLoginsMenu: function(container, group, dbFileName, isTopLevelContainer)
    {
        //keefox_win.Logger.debug("setOneLoginsMenu called for [" + container.id + "] with uniqueRef: " + group.uniqueID);

        // Remove all of the existing buttons
        for (let i = container.childNodes.length; i > 0; i--) {
            container.removeChild(container.childNodes[0]);
        }

        var foundGroups = group.childGroups;
        var foundLogins = group.childLightEntries;

        if ((foundGroups == null || foundGroups.length == 0) && (foundLogins == null || foundLogins.length == 0)) {
            let noItemsButton = null;
            noItemsButton = this.createUIElement('li', [
                ['class',''],
                ['data-fileName',dbFileName],
             //   ['data-uuid',rootGroup.uniqueID],
            //    ['id', 'KeeFox_Group-' + rootGroup.uniqueID],
                ['title',keefox_org.locale.$STR("loginsButtonEmpty.tip")],
                ['tabindex','-1']
            ]);
            noItemsButton.textContent = keefox_org.locale.$STR("loginsButtonEmpty.label");

            // Unless we are allowed to display one or more logins in the main panel, we need to switch to the overflow panel now
            if (isTopLevelContainer && keefox_org._keeFoxExtension.prefs.getValue("maxAllLoginsInMainPanel",0) == 0)
                container = this.getEmptyContainerFor("KeeFox-PanelSubSection-AllLoginsList-Overflow");
            container.appendChild(noItemsButton);
            return;
        }

        for (let i = 0; i < foundGroups.length; i++) {
            let group = foundGroups[i];
            
            if ((group.childGroups != null && group.childGroups.length > 0) 
                || (group.childLightEntries != null && group.childLightEntries.length > 0))
            {
                let groupItem = this.createGroupItem(group,dbFileName);
                if (isTopLevelContainer 
                    && container.id != "KeeFox-PanelSubSection-AllLoginsList-Overflow-Container" 
                    && i >= keefox_org._keeFoxExtension.prefs.getValue("maxAllLoginsInMainPanel",0))
                    container = this.getEmptyContainerFor("KeeFox-PanelSubSection-AllLoginsList-Overflow");
                container.appendChild(groupItem);
            }
        }

        for (let i = 0; i < foundLogins.length; i++) {
            var login = foundLogins[i];
            var usernameValue = "";
            var usernameName = "";
            var usernameDisplayValue = "[" + keefox_org.locale.$STR("noUsername.partial-tip") + "]";
            usernameValue = login.usernameValue;
            if (usernameValue != undefined && usernameValue != null && usernameValue != "")
                usernameDisplayValue = usernameValue;
            usernameName = login.usernameName;

            var loginItem = this.createUIElement('li', [
                ['class','login-item'],
                ['data-fileName',dbFileName],
                ['data-usernameName',usernameName],
                ['data-usernameValue',usernameValue],
                ['data-url',login.uRLs[0]],
                ['data-uuid',login.uniqueID],
                ['style','background-image:url(data:image/png;base64,' + login.iconImageData + ')'],
            //    ['id', 'KeeFox_Group-' + rootGroup.uniqueID],
                ['title',keefox_org.locale.$STRF(
                "loginsButtonLogin.tip", [login.uRLs[0], usernameDisplayValue])],
                ['tabindex','-1']
            ]);
            if (keefox_org._keeFoxExtension.prefs.getValue("alwaysDisplayUsernameWhenTitleIsShown",false))
                loginItem.textContent = keefox_org.locale.$STRF("matchedLogin.label", [usernameDisplayValue, login.title]);
            else
                loginItem.textContent = login.title;
            
            loginItem.addEventListener("keydown", this.keyboardNavHandler, false);
            loginItem.addEventListener("mouseup", function (event) { 
                // Make sure no parent groups override the actions of this handler
                event.stopPropagation();

                if (event.button == 0 || event.button == 1)
                {
                    this.dispatchEvent(new CustomEvent("keefoxCommand", { 'detail': { 'button': event.button, 'ctrlKey': event.ctrlKey }}));
                } 
                if (event.button == 2)
                {
                    //TODO1.5: support keyboard context menu button too.
                    
                    keefox_win.panel.addLoginContextActions(document, this.getAttribute('data-uuid'), this.getAttribute('data-fileName'));
                    keefox_win.panel.displayContextMenu(keefox_win.panel._currentWindow.document,event,'KeeFox-login-context');
                }
            }, false);
            loginItem.addEventListener("keefoxCommand", function (event) { 
                keefox_win.loadAndAutoSubmit(event.detail.button,
                                                     event.detail.ctrlKey,
                                                     this.getAttribute('data-url'),
                                                     this.getAttribute('data-uuid'), 
                                                     this.getAttribute('data-fileName')
                                                    );
                keefox_win.panel.CustomizableUI.hidePanelForNode(
                    keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
                keefox_win.panel.hideSubSections();
            }, false);
            
            // If the combined total of all groups and the current login index exceeds 
            // our allowed number of items in the main panel, we must switch to the overflow container
            if (isTopLevelContainer 
                && container.id != "KeeFox-PanelSubSection-AllLoginsList-Overflow-Container" 
                && (i + foundGroups.length) >= keefox_org._keeFoxExtension.prefs.getValue("maxAllLoginsInMainPanel",0))
                container = this.getEmptyContainerFor("KeeFox-PanelSubSection-AllLoginsList-Overflow");
            container.appendChild(loginItem);
        }
    },

    addLoginContextActions: function (document, uuid, fileName)
    {
        let context = document.getElementById('KeeFox-login-context');
        let loadingMessage = document.createElement('menuitem');
        loadingMessage.setAttribute("label", keefox_org.locale.$STR("loading") + "...");
        loadingMessage.id = "KeeFox-login-context-loading";
        loadingMessage.setAttribute("data-uuid", uuid);
        loadingMessage.setAttribute("data-fileName", fileName);
        context.appendChild(loadingMessage);
        keefox_org.findLogins(null, null, null, uuid, fileName, null, null, keefox_win.panel.setLoginActions);
                    
        context.addEventListener("popuphidden", keefox_win.panel.removeLoginContextActions);
    },

    removeLoginContextActions: function (event) {
        if (event.target.id != "KeeFox-login-context")
            return;

        let context = document.getElementById('KeeFox-login-context');
        context.removeEventListener("popuphidden", keefox_win.panel.removeLoginContextActions);

        let loading = document.getElementById('KeeFox-login-context-loading');
        let copyUser = document.getElementById('KeeFox-login-context-copyuser');
        let copyPass = document.getElementById('KeeFox-login-context-copypass');
        let copyOther = document.getElementById('KeeFox-login-context-copyother');

        if (loading) context.removeChild(loading);
        if (copyUser) context.removeChild(copyUser);
        if (copyPass) context.removeChild(copyPass);
        if (copyOther) context.removeChild(copyOther);
    },

    createGroupItem: function (group, dbFileName, extraCSSClasses, displayName)
    {
        let groupItem = this.createUIElement('li', [
            ['class','group-item'],
            ['data-fileName',dbFileName],
            ['data-uuid',group.uniqueID],
            ['style','background-image:url(data:image/png;base64,' + group.iconImageData + ')'],
            //   ['id', 'KeeFox_Group-' + rootGroup.uniqueID],
            ['title',keefox_org.locale.$STR("loginsButtonGroup.tip")],
            ['tabindex','-1']
        ]);
        groupItem.textContent = displayName || group.title;
        
        groupItem.addEventListener("keydown", this.keyboardNavHandler, false);
        groupItem.addEventListener("mouseup", function (event) { 
            // Make sure no parent groups override the actions of this handler
            event.stopPropagation();

            if (event.button == 0 || event.button == 1)
            {
                this.dispatchEvent(new CustomEvent("keefoxCommand", { 'detail': { 'button': event.button, 'ctrlKey': event.ctrlKey }}));
            } 
            if (event.button == 2)
            {
                keefox_win.panel.displayContextMenu(keefox_win.panel._currentWindow.document,event,'KeeFox-group-context');
            }
        }, false);

        groupItem.addEventListener("keefoxCommand", this.navigateGroupHierachy, false);
                    
        let groupContainer = this.createUIElement('ul', [
            ['class',' ' + extraCSSClasses],
            ['id', 'KeeFox_Group-' + group.uniqueID]
        ]);
        this.setOneLoginsMenu(groupContainer,group,dbFileName);
        groupItem.appendChild(groupContainer);
        return groupItem;
    },

    navigateGroupHierachy: function (event) { 
        // Find the currently displayed subgroup (if any)
        let currentGroup = document.getElementById("KeeFox-PanelSection-allLogins")
                            .querySelector(".active-group");
                
        // Mark it as no longer active
        if (currentGroup != null)
            currentGroup.classList.remove("active-group");
                
        // If user clicked on the active group or any of its parents, make sure that its direct parent (if any) is activated
        if (currentGroup == event.target)
        {
            // ignore the containing ul node, but note that we may end up selecting some higher part of the panel rather than a group
            let parentGroup = currentGroup.parentNode.parentNode;
            if (parentGroup != null && parentGroup.classList.contains("group-item"))
            {
                parentGroup.classList.remove("active-group-parent");
                parentGroup.classList.add("active-group");
            }
            currentGroup.focus();
        } else
        {
            let parent;

            // remove active marker from all parents. If we find the target node in the parent list, we'll set its parent as active (if it has one) and finish
            if (currentGroup)
            {
                parent = currentGroup.parentNode;
                while (parent.nodeName == "ul" || parent.nodeName == "li")
                {
                    if (parent.nodeName == "li")
                    {
                        parent.classList.remove("active-group-parent");
                        if (parent == event.target)
                        {
                            if (parent.parentNode && parent.parentNode.parentNode && parent.parentNode.parentNode.nodeName == "li")
                            {
                                parent.parentNode.parentNode.classList.remove("active-group-parent");
                                parent.parentNode.parentNode.classList.add("active-group");
                                parent.parentNode.parentNode.focus();
                                return;
                            }
                        }
                    }
                    parent = parent.parentNode;
                }
            }

            // add active marker to all parents of new node
            parent = event.target.parentNode;
            while (parent.nodeName == "ul" || parent.nodeName == "li")
            {
                if (parent.nodeName == "li")
                    parent.classList.add("active-group-parent");
                parent = parent.parentNode;
            }

            // Set our new active group
            event.target.classList.add("active-group");

            // Focus keyboard on first child
            let fc = event.target.firstElementChild;
            if (fc) fc = fc.firstElementChild;
            if (fc) fc.focus();
                
        }
    },

    setLoginActions: function (resultWrapper)
    {
        let isError = false;

        try
        {
            if ("result" in resultWrapper && resultWrapper.result !== false && resultWrapper.result != null)
            {
                let foundLogin = resultWrapper.result[0]; 
                    
                var kfl = keeFoxLoginInfo();
                kfl.initFromEntry(foundLogin);

                let context = document.getElementById('KeeFox-login-context');
                let loadingMessage = document.getElementById('KeeFox-login-context-loading');

                if (kfl.uniqueID == loadingMessage.getAttribute('data-uuid')
                    && kfl.database.fileName == loadingMessage.getAttribute('data-fileName'))
                {
                    // We got an answer for the correct login

                    // later we'll ignore the one marked as username
                    let otherFieldCount = (kfl.otherFields != null && kfl.otherFields.length > 0) ? kfl.otherFields.length : 0;
                    let usernameField = (otherFieldCount > 0) ? kfl.otherFields[kfl.usernameIndex] : null;

                    // later we'll ignore the first password in the list
                    let passwordFieldCount = (kfl.passwords != null && kfl.passwords.length > 0) ? kfl.passwords.length : 0;
                    let passwordField = (passwordFieldCount > 0) ? kfl.passwords[0] : null;

                    if (usernameField != null)
                    {
                        let copyUsername = document.createElement('menuitem');
                        copyUsername.setAttribute("label", keefox_org.locale.$STR("copy-username.label"));
                        copyUsername.id = "KeeFox-login-context-copyuser";
                        copyUsername.addEventListener("command", function (event) {
                            keefox_org.utils.copyStringToClipboard(usernameField.value);
                            keefox_win.panel.CustomizableUI.hidePanelForNode(keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
                        });
                        context.appendChild(copyUsername);
                    }
                    if (passwordField != null) {
                        let copyPassword = document.createElement('menuitem');
                        copyPassword.setAttribute("label", keefox_org.locale.$STR("copy-password.label"));
                        copyPassword.id = "KeeFox-login-context-copypass";
                        copyPassword.addEventListener("command", function (event) {
                            keefox_org.utils.copyStringToClipboard(passwordField.value);
                            keefox_win.panel.CustomizableUI.hidePanelForNode(keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
                        });
                        context.appendChild(copyPassword);
                    }
                    if (otherFieldCount > 1 || passwordFieldCount > 1) {
                        let copyOther = document.createElement('menu');
                        copyOther.setAttribute("label", keefox_org.locale.$STR("copy-other.label"));
                        copyOther.id = "KeeFox-login-context-copyother";
                        let copyOtherPopup = document.createElement('menupopup');
                        copyOther.appendChild(copyOtherPopup);

                        if (otherFieldCount > 1) {
                            kfl.otherFields.forEach(function (o, i) {
                                if (i != kfl.usernameIndex && o.type != "checkbox") {
                                    let other = document.createElement('menuitem');
                                    other.setAttribute("label", o.name + " (" + o.fieldId + ")");
                                    other.addEventListener("command", function (event) {
                                        keefox_org.utils.copyStringToClipboard(o.value);
                                        keefox_win.panel.CustomizableUI.hidePanelForNode(keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
                                    });
                                    copyOtherPopup.appendChild(other);
                                }
                            });
                        }
                        if (passwordFieldCount > 1) {
                            kfl.passwords.forEach(function (p, i) {
                                if (i != 0 && p.type != "checkbox") {
                                    let pass = document.createElement('menuitem');
                                    pass.setAttribute("label", p.name + " (" + p.fieldId + ")");
                                    pass.addEventListener("command", function (event) {
                                        keefox_org.utils.copyStringToClipboard(p.value);
                                        keefox_win.panel.CustomizableUI.hidePanelForNode(keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
                                    });
                                    copyOtherPopup.appendChild(pass);
                                }
                            });
                        }
                        context.appendChild(copyOther);
                    }

                    context.removeChild(loadingMessage);
                } else
                {
                    isError = true;
                }
            } else
            {
                isError = true;
            }
        } catch (e) {
            isError = true;
        }
        return;
    },

    getContainerFor: function (id)
    {
        let panelSection = this._currentWindow.document.getElementById(id);
        if (panelSection === undefined || panelSection == null)
            return null;
        
        if (panelSection.childNodes.length > 0)
            return panelSection.childNodes[0];
        
        // Create the ul menu top level container        
        let groupContainer = this.createUIElement('ul', [
            ['class',''],
            ['id', id + '-Container']]);
        panelSection.appendChild(groupContainer);
        return groupContainer;
    },

    getEmptyContainerFor: function (id)
    {
        let panelSection = this._currentWindow.document.getElementById(id);
        if (panelSection === undefined || panelSection == null)
            return null;
        
        // Remove all of the existing items by removing the top-level list
        // if it has been created earlier
        if (panelSection.childNodes.length > 0)
            panelSection.removeChild(panelSection.childNodes[0]);
        
        // Create the ul menu top level container        
        let groupContainer = this.createUIElement('ul', [
            ['class',''],
            ['id', id + '-Container']
                                                  ]);
        panelSection.appendChild(groupContainer);
        return groupContainer;
    },

    // Calling this function with null or empty logins array will clear all existing logins (e.g. from iframes)
    setLogins: function (logins, notifyUserOnSuccess)
    {
        keefox_win.Logger.debug("panel setLogins started");
        
        // Get the container that we want to add our matched logins to.
        var container = this.getContainerFor("KeeFox-PanelSubSection-MatchedLoginsList");
        if (container === undefined || container == null)
            return;
        var overflowPanelContainer = this.getContainerFor("KeeFox-PanelSubSection-MatchedLoginsList-Overflow");

        // Force the panel to close before modifying the contents
        keefox_win.panel.CustomizableUI.hidePanelForNode(
                    keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
        keefox_win.panel.hideSubSections();
        
        if (logins == null || logins.length == 0) {
            // Disable all matched logins UI elements
            this.disableUIElement("KeeFox-PanelSection-matchedLogins");
            this.disableUIElement("KeeFox-PanelSubSection-MatchedLoginsList");
            this.disableUIElement("KeeFox-PanelSubSection-MatchedLoginsList-Overflow");
            this.disableUIElement("KeeFox-PanelSection-matchedLogins-main-action");
            this.removeLogins();
            this.setupButton_ready(null, this._currentWindow);
            return;
        }

        logins.sort(this.compareRelevanceScores);

        keefox_win.Logger.debug("setting " + logins.length + " matched logins");

        let loginsHaveBeenChanged = this.checkAllMatchedLoginsForChanges(logins, container, overflowPanelContainer);

        if (!loginsHaveBeenChanged)
        {
            keefox_win.Logger.debug("setLogins found no changes");
            return;
        }

        // Disable all matched logins UI elements, perhaps just for a jiffy while 
        // we work out which ones need to be revealed again
        this.disableUIElement("KeeFox-PanelSection-matchedLogins");
        this.disableUIElement("KeeFox-PanelSubSection-MatchedLoginsList");
        this.disableUIElement("KeeFox-PanelSubSection-MatchedLoginsList-Overflow");
        this.disableUIElement("KeeFox-PanelSection-matchedLogins-main-action");

        this.removeLogins();

        // Get the container again (it has been deleted by removeLogins()
        // so this creates and returns it)
        container = this.getContainerFor("KeeFox-PanelSubSection-MatchedLoginsList");

        this.setLoginsAllMatches(logins, container);        

        // Update the UI state to reflect the number of matches found and where they are displayed

        overflowPanelContainer = this.getContainerFor("KeeFox-PanelSubSection-MatchedLoginsList-Overflow");

        if (container.childElementCount > 0 || overflowPanelContainer.childElementCount > 0)
            this.enableUIElement("KeeFox-PanelSection-matchedLogins");
        if (container.childElementCount > 0)
            this.enableUIElement("KeeFox-PanelSubSection-MatchedLoginsList");
        if (overflowPanelContainer.childElementCount > 0)
        {
            this.enableUIElement("KeeFox-PanelSection-matchedLogins-main-action");
        }
        
        // Set icon overlay on main panel widget button icon to say how many matches there were
        this.setWidgetNotificationForMatchedLogins(container.childElementCount + overflowPanelContainer.childElementCount);

        // notify user if necessary
        if (notifyUserOnSuccess)
            keefox_win.UI.growl("Matched logins found", "View them in the main KeeFox panel", true);

        keefox_win.Logger.debug(logins.length + " matched panel logins set!");
    },

    // also used by context.js
    checkAllMatchedLoginsForChanges: function (logins, container, overflowPanelContainer) {
        keefox_win.Logger.debug("checkAllMatchedLoginsForChanges started");
        
        // If the logins already present in the main panel and subview containers
        // are identical to the current list, we leave them be.
        // We assume the number of items in the main menu vs overflow container
        // are the same since when we added the current set of logins (user is
        // unlikely to be able to change this during a form search operation)
        var loginsListUnchanged = logins.length ===
            container.childElementCount + overflowPanelContainer.childElementCount;

        if (loginsListUnchanged)
            loginsListUnchanged = this.areLoginsInContainerUnchanged(logins, container, 0);

        // If we've not already found a mismatch, look at the overflow container too
        if (loginsListUnchanged && overflowPanelContainer != null && overflowPanelContainer.childElementCount > 0)
            loginsListUnchanged = this.areLoginsInContainerUnchanged(logins, overflowPanelContainer, container.children.length);

        return !loginsListUnchanged;
    },

    // also used by context.js
    areLoginsInContainerUnchanged: function (logins, container, searchOffset)
    {        
        for (let j = 0, n = container.children.length; j < n; j++) {
            var child = container.children[j];
            let login = logins[j + searchOffset];
            if (typeof (login) === 'undefined')
                return false;
            let uuid = child.hasAttribute('data-uuid') ? child.getAttribute('data-uuid') : null;
            let formIndex = child.hasAttribute('data-formIndex') ? child.getAttribute('data-formIndex') : null;
            let loginIndex = child.hasAttribute('data-loginIndex') ? child.getAttribute('data-loginIndex') : null;
            let frameKey = child.hasAttribute('data-frameKey') ? child.getAttribute('data-frameKey') : null;
            if (uuid != login.uniqueID || formIndex != login.formIndex
                || loginIndex != login.loginIndex || frameKey != login.frameKey)
                return false;
        }
        return true;
    },

    setLoginsAllMatches: function (logins, container) {
        keefox_win.Logger.debug("setLoginsAllMatches started");
        
        // Sometimes we need to refer to the original container even
        // if we have started adding extra logins to the overflow container
        let mainPanelContainer = container;

        // This allows us to track when we've switched into the overflow mode
        let overflowPanelContainer = null;

        // add every matched login to the container(s)
        for (let i = 0; i < logins.length; i++) {
            var login = logins[i];
            var usernameValue = "";
            var usernameDisplayValue = "[" + keefox_org.locale.$STR("noUsername.partial-tip") + "]";
            var usernameName = "";
            var usernameId = "";
            var displayGroupPath = login.database.name + '/' + login.parentGroup.path;

            if (login.usernameIndex != null && login.usernameIndex != undefined && login.usernameIndex >= 0
                && login.otherFields != null && login.otherFields.length > 0) {
                var field = login.otherFields[login.usernameIndex];

                usernameValue = field.value;
                if (usernameValue != undefined && usernameValue != null && usernameValue != "")
                    usernameDisplayValue = usernameValue;
                usernameName = field.name;
                usernameId = field.fieldId;
            }


            var loginItem = this.createUIElement('li', [
                ['class',''],
                ['style','background-image:url(data:image/png;base64,' + login.iconImageData + ')'],
                ['data-fileName',login.database.fileName],
                ['data-frameKey', login.frameKey],
                ['data-formIndex', login.formIndex],
                ['data-loginIndex', login.loginIndex],
                ['data-uuid',login.uniqueID],
                ['title',keefox_org.locale.$STRF("matchedLogin.tip", [login.title, displayGroupPath, usernameDisplayValue])],
                ['tabindex','-1']
            ]);
            loginItem.textContent = keefox_org.locale.$STRF("matchedLogin.label", [usernameDisplayValue, login.title]);
            loginItem.addEventListener("keydown", this.keyboardNavHandler, false);
            loginItem.addEventListener("mouseup", function (event) { 
                event.stopPropagation();
                if (event.button == 0 || event.button == 1)
                    this.dispatchEvent(new Event("keefoxCommand"));
                else if (event.button == 2) {
                    keefox_win.panel.addLoginContextActions(document, this.getAttribute('data-uuid'), this.getAttribute('data-fileName'));
                    keefox_win.panel.displayContextMenu(keefox_win.panel._currentWindow.document, event, 'KeeFox-login-context');
                }
            }, false);
            loginItem.addEventListener("keefoxCommand", function (event) { 
                keefox_win.fillAndSubmit(false,
                    this.hasAttribute('data-frameKey') ? this.getAttribute('data-frameKey') : null,
                    this.hasAttribute('data-formIndex') ? this.getAttribute('data-formIndex') : null,
                    this.hasAttribute('data-loginIndex') ? this.getAttribute('data-loginIndex') : null
                );
                keefox_win.panel.CustomizableUI.hidePanelForNode(
                    keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
                keefox_win.panel.hideSubSections();
            }, false);

            // If we've exceeded our allowed number of items in the main panel, we must switch to the overflow container
            if (mainPanelContainer.childElementCount >= keefox_org._keeFoxExtension.prefs.getValue("maxMatchedLoginsInMainPanel",5))
            {
                container = this.getContainerFor("KeeFox-PanelSubSection-MatchedLoginsList-Overflow");
                overflowPanelContainer = container;
            }
            container.appendChild(loginItem);
        }
        keefox_win.Logger.debug("setLoginsAllMatches ended");
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
        keefox_win.panel.showSearchResults.call(keefox_win.panel,logins);
    },

    // Calling this function with null or empty logins array will clear all existing search results
    showSearchResults: function (logins)
    {
        keefox_win.Logger.debug("panel showSearchResults started");
        // Get the container that we want to add our search results to.

        var container = this.getEmptyContainerFor("KeeFox-PanelSubSection-SearchResults");
        this.disableUIElement("KeeFox-PanelSubSection-SearchResults");
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

            var loginItem = this.createUIElement('li', [
                ['class','login-item'],
                ['data-fileName',login.dbFileName],
                ['data-usernameName',usernameName],
                ['data-usernameValue',usernameValue],
                ['data-url',login.url],
                ['data-uuid',login.uniqueID],
                ['style','background-image:url(data:image/png;base64,' + login.iconImageData + ')'],
            //    ['id', 'KeeFox_Group-' + rootGroup.uniqueID],
                ['title',keefox_org.locale.$STRF(
                "loginsButtonLogin.tip", [login.url, usernameDisplayValue])],
                ['tabindex','-1']
            ]);
            if (keefox_org._keeFoxExtension.prefs.getValue("alwaysDisplayUsernameWhenTitleIsShown",false))
                loginItem.textContent = keefox_org.locale.$STRF("matchedLogin.label", [usernameDisplayValue, login.title]);
            else
                loginItem.textContent = login.title;
            loginItem.addEventListener("keydown", this.keyboardNavHandler, false);
            loginItem.addEventListener("mouseup", function (event) { 
                // Make sure no parent groups override the actions of this handler
                event.stopPropagation();

                if (event.button == 0 || event.button == 1)
                {
                    this.dispatchEvent(new CustomEvent("keefoxCommand", { 'detail': { 'button': event.button, 'ctrlKey': event.ctrlKey }}));
                } 
                if (event.button == 2)
                {
                    // TODO1.5: When accessing layerX and layerY here, they are always 0, however, when accessed from the
                    // function to which the event is passed next, they have a value that is relative to the main widget
                    // panel top left corner. This is probably a Firefox bug but it currently only prevents the use of
                    // the keyboard context menu button so I'll investigate further once 1.4 is in beta testing
                    keefox_win.panel.addLoginContextActions(document, this.getAttribute('data-uuid'), this.getAttribute('data-fileName'));
                    keefox_win.panel.displayContextMenu(keefox_win.panel._currentWindow.document,event,'KeeFox-login-context');
                }
            }, false);
            loginItem.addEventListener("keefoxCommand", function (event) { 
                keefox_win.loadAndAutoSubmit(event.detail.button,
                                                    event.detail.ctrlKey,
                                                    this.getAttribute('data-url'),
                                                    this.getAttribute('data-uuid'), 
                                                    this.getAttribute('data-fileName')
                                                );
                keefox_win.panel.CustomizableUI.hidePanelForNode(
                    keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
                keefox_win.panel.hideSubSections();
            }, false);
            loginItem.addEventListener("keefoxContext", function (event) {
                keefox_win.panel.addLoginContextActions(document, this.getAttribute('data-uuid'), this.getAttribute('data-fileName'));
                keefox_win.panel.displayContextMenu(keefox_win.panel._currentWindow.document,event,'KeeFox-login-context');
            }, false);
            
            container.appendChild(loginItem);
        }
        
        // Update the UI state to reflect the number of logins found
        if (container.childElementCount > 0)
            this.enableUIElement("KeeFox-PanelSubSection-SearchResults");
        
        keefox_win.Logger.debug(logins.length + " search results set.");
    },
    
    setWidgetNotificationForMatchedLogins: function (count)
    {
        keefox_win.Logger.debug("Going to notify that we have matched " + count + " logins");

        // This fails if called during startup and the widget is in the main panel (the node
        // has not been added to the DOM yet, pending user menu panel activation).
        //TODO1.5: Is this still a problem now that we create the panel earlier? If so, maybe set some kind of on-main-menu-panel-open listener to retry this operation later

        // We can't know if this is going to be called just once (usual) or multiple times 
        // (e.g. for iframes) so we must make sure any race conditions are avoided or at least benign
        let widget = this._currentWindow.document.getElementById("keefox-button");
        if (widget)
            widget.setAttribute("keefox-match-count",count);
    },

    // Sets the overall widget status including the status panel
    // reports to the user the state of KeeFox and the KeePassRPC connection
    setWidgetStatus: function (enabled, buttonLabel, tooltip, detailedInfo, buttonAction)
    {
        keefox_win.Logger.debug("Setting widget status");
        let widgetButton = this._currentWindow.document.getElementById("keefox-button");
        let statusPanel = this._currentWindow.document.getElementById("KeeFox-PanelSection-status");
        let statusPanelText = this._currentWindow.document.getElementById("KeeFox-PanelSection-status-text");
        let statusPanelButton = this._currentWindow.document.getElementById("KeeFox-PanelSection-status-main-action");
        
        if (widgetButton === undefined || widgetButton == null)
            widgetButton = this._widget.node;
        if (statusPanel === undefined || statusPanel == null)
            statusPanel = widgetButton.querySelector("#KeeFox-PanelSection-status");
        if (statusPanelText === undefined || statusPanelText == null)
            statusPanelText = widgetButton.querySelector("#KeeFox-PanelSection-status-text");
        if (statusPanelButton === undefined || statusPanelButton == null)
            statusPanelButton = widgetButton.querySelector("#KeeFox-PanelSection-status-main-action");
        if (widgetButton === undefined || widgetButton == null 
            || statusPanel === undefined || statusPanel == null
            || statusPanelText === undefined || statusPanelText == null
            || statusPanelButton === undefined || statusPanelButton == null)
            return;

        widgetButton.classList.remove(enabled ? "disabled" : "enabled");
        widgetButton.classList.add(enabled ? "enabled" : "disabled");
        statusPanel.classList.remove(!enabled ? "disabled" : "enabled");
        statusPanel.classList.add(!enabled ? "enabled" : "disabled");
        statusPanelText.classList.remove(!enabled ? "disabled" : "enabled");
        statusPanelText.classList.add(!enabled ? "enabled" : "disabled");

        widgetButton.removeAttribute("keefox-match-count");

        // Remove all known possible event handlers
        statusPanelButton.removeEventListener("mouseup", this.mainButtonCommandInstallHandler, false);
        statusPanelButton.removeEventListener("mouseup", this.mainButtonCommandLaunchKPHandler, false);
        statusPanelButton.removeEventListener("mouseup", this.mainButtonCommandLoginKPHandler, false);
        statusPanelButton.removeEventListener("keefoxCommand", this.mainButtonCommandInstallHandler, false);
        statusPanelButton.removeEventListener("keefoxCommand", this.mainButtonCommandLaunchKPHandler, false);
        statusPanelButton.removeEventListener("keefoxCommand", this.mainButtonCommandLoginKPHandler, false);
        statusPanelButton.removeEventListener("keydown", this.keyboardNavHandler, false);

        if (enabled)
        {
            widgetButton.setAttribute("tooltiptext","KeeFox enabled");
        } else
        {
            widgetButton.setAttribute("tooltiptext",tooltip);
            statusPanelText.textContent = detailedInfo;
            statusPanelButton.setAttribute("value", buttonLabel);
            statusPanelButton.setAttribute("tooltip",tooltip);
            statusPanelButton.addEventListener("mouseup", buttonAction, false);
            statusPanelButton.addEventListener("keefoxCommand", buttonAction, false);
            statusPanelButton.addEventListener("keydown", this.keyboardNavHandler, false);
        }
    },
    
    setupButton_install: function () {
        keefox_win.Logger.debug("setupButton_install start");

        this.setWidgetStatus(false,
            keefox_org.locale.$STR("installKeeFox.label"), 
            keefox_org.locale.$STR("installKeeFox.tip"),
            keefox_org.locale.$STR("installKeeFox.tip"),
            this.mainButtonCommandInstallHandler);
        this.disableUIElement("KeeFox-PanelSection-search");
        this.disableUIElement("KeeFox-PanelSection-matchedLogins");
        this.disableUIElement("KeeFox-PanelSection-allLogins");
        this.disableUIElement("KeeFox-PanelSection-generatePassword");
        this.disableUIElement("KeeFox-PanelSection-changeDatabase");
        this.disableUIElement("KeeFox-PanelSection-detectForms");
        keefox_win.Logger.debug("setupButton_install end");
    },

    // This is a generic "update panel status" method which will ensure the main widget icon
    // and overall panel configuration matches the current KeeFox state. In future we might
    // want to refactor this a little bit to use observers but the gain is not huge at this stage.
    setupButton_ready: function () {
        keefox_win.Logger.debug("setupButton_ready start");
        var mainButton;
        var mainWindow = this._currentWindow;
        mainButton = this._widget.node;
        if (mainButton === undefined || mainButton == null)
        {
            keefox_win.Logger.warn("widget node missing.");
            return;
        }

        if (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false)) {

            var loggedInText = "";
            var activeDBIndex = mainWindow.keefox_org.ActiveKeePassDatabaseIndex;

            if (mainWindow.keefox_org.KeePassDatabases != null
                && mainWindow.keefox_org.KeePassDatabases.length > 0
                && mainWindow.keefox_org.KeePassDatabases[activeDBIndex] != null 
                && mainWindow.keefox_org.KeePassDatabases[activeDBIndex].root != null)
            {
                var numberOfDBs = mainWindow.keefox_org.KeePassDatabases.length;
                if (numberOfDBs == 1)
                    loggedInText = keefox_org.locale.$STRF("loggedIn.tip", [mainWindow.keefox_org.KeePassDatabases[activeDBIndex].name]);
                else
                    loggedInText = keefox_org.locale.$STRF("loggedInMultiple.tip", [numberOfDBs,mainWindow.keefox_org.KeePassDatabases[activeDBIndex].name]);
            } else
            {
                keefox_win.Logger.warn("KeePass database open but details unavailable.");
                return;
            }

            this.setWidgetStatus(true,
                keefox_org.locale.$STR("loggedIn.label"), 
                loggedInText,
                loggedInText,
                null);
            this.enableUIElement("KeeFox-PanelSection-search");
            this.enableUIElement("KeeFox-PanelSection-allLogins");
            this.enableUIElement("KeeFox-PanelSection-generatePassword");
            this.enableUIElement("KeeFox-PanelSection-changeDatabase");
            this.enableUIElement("KeeFox-PanelSection-detectForms");
        } else if (!keefox_org._keeFoxStorage.get("KeePassRPCInstalled", false)) {
            this.setupButton_install(mainWindow);
        } else if (!keefox_org._keeFoxStorage.get("KeePassRPCActive", false)) {
            this.setWidgetStatus(false,
                keefox_org.locale.$STR("launchKeePass.label"), 
                keefox_org.locale.$STR("notifyBarLaunchKeePassButton.tip"), 
                keefox_org.locale.$STR("notifyBarLaunchKeePass.label") + " " 
                    + keefox_org.locale.$STR("notifyBarLaunchKeePassButton.tip"), 
                this.mainButtonCommandLaunchKPHandler);
            this.disableUIElement("KeeFox-PanelSection-search");
            this.disableUIElement("KeeFox-PanelSection-matchedLogins");
            this.disableUIElement("KeeFox-PanelSection-allLogins");
            this.disableUIElement("KeeFox-PanelSection-generatePassword");
            this.disableUIElement("KeeFox-PanelSection-changeDatabase");
            this.disableUIElement("KeeFox-PanelSection-detectForms");
            this.hideSubSections();
        } else {
            this.setWidgetStatus(false,
                keefox_org.locale.$STR("loginToKeePass.label"), 
                keefox_org.locale.$STR("notifyBarLoginToKeePassButton.tip"), 
                keefox_org.locale.$STR("notifyBarLaunchKeePass.label") + " " 
                    + keefox_org.locale.$STR("notifyBarLoginToKeePassButton.tip"), 
                this.mainButtonCommandLoginKPHandler);
            this.disableUIElement("KeeFox-PanelSection-search");
            this.disableUIElement("KeeFox-PanelSection-matchedLogins");
            this.disableUIElement("KeeFox-PanelSection-allLogins");
            this.enableUIElement("KeeFox-PanelSection-generatePassword");
            this.enableUIElement("KeeFox-PanelSection-changeDatabase");
            this.disableUIElement("KeeFox-PanelSection-detectForms");
            this.hideSubSections();
        }

        keefox_win.Logger.debug("setupButton_ready end");
    },

    setMRUdatabasesCallback: function (result) {

        let container = this.getEmptyContainerFor("KeeFox-PanelSubSection-DatabaseList");
        if (container === undefined || container == null)
            return;

        // Remove the loading message
        container.parentNode.removeAttribute("loading");

        let mruArray = result.knownDatabases;
        let noItemsButton;
        if (mruArray == null || mruArray.length == 0) {
            noItemsButton = this.createUIElement('li', [
                ['class',''],
                ['title',keefox_org.locale.$STR("changeDBButtonEmpty.tip")],
                ['tabindex','-1']
            ]);
            noItemsButton.textContent = keefox_org.locale.$STR("changeDBButtonEmpty.label");
            container.appendChild(noItemsButton);
        } else {

            for (let i = 0; i < mruArray.length; i++)
            {
                let displayName = mruArray[i];
                let suffix, prefix;
                if (displayName.length > 50) {
                    var fileNameStartLocation = displayName.lastIndexOf('\\');
                    var spareChars = 50 - (displayName.length - fileNameStartLocation);
                    if (spareChars > 10) {
                        var path = displayName.substr(0, fileNameStartLocation);
                        var parentStartLocation = path.lastIndexOf('\\');
                        var preferredSpareChars = 50 - (displayName.length - parentStartLocation);
                        if (preferredSpareChars > 10) {
                            suffix = displayName.substr(parentStartLocation);
                            prefix = displayName.substr(0, preferredSpareChars);
                        }
                        else {
                            suffix = displayName.substr(fileNameStartLocation);
                            prefix = displayName.substr(0, spareChars);
                        }
                        displayName = prefix + ' ... ' + suffix;
                    } // otherwise there's not much we can do anyway so just leave it to truncate the end of the file name
                }
            
                let mruToUse = mruArray[i].replace(/[\\]/g, '\\');
                let loginItem = this.createUIElement('li', [
                    ['class',''],
                    ['mruToUse',mruToUse],
                    ['title',keefox_org.locale.$STRF("changeDBButtonListItem.tip", [mruArray[i]])],
                    ['tabindex','-1']
                ]);
                loginItem.textContent = displayName;
                loginItem.addEventListener("keydown", this.keyboardNavHandler, false);
                loginItem.addEventListener("mouseup", function (event) { 
                    if (event.button == 0 || event.button == 1)
                    {
                        event.stopPropagation();
                        this.dispatchEvent(new Event("keefoxCommand"));
                    }
                }, false);
                loginItem.addEventListener("keefoxCommand", function (event) { 
                    keefox_org.changeDatabase(this.getAttribute('mruToUse'), false);
                    keefox_win.panel.CustomizableUI.hidePanelForNode(
                        keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
                    keefox_win.panel.hideSubSections();
                }, false);

                container.appendChild(loginItem);
            }
        }
        
        // Try to focus on the first item in the newly displayed sub section
        let matches = container.getElementsByTagName('li');
        if (!matches)
            return;
        let firstMatch = matches[0];
        if (firstMatch)
            firstMatch.focus();
    },

    setPasswordProfilesCallback: function (result) {

        let container = this.getEmptyContainerFor("KeeFox-PanelSubSection-PasswordProfileList");
        if (container === undefined || container == null)
            return;

        // Remove the loading message
        container.parentNode.removeAttribute("loading");

        let passwordProfilesExplanation = this.createUIElement('div', [
                ['class', '']
        ]);
        passwordProfilesExplanation.textContent = keefox_org.locale.$STR("generatePassword.copied")
            + " " + keefox_org.locale.$STR("PasswordProfilesExplanation.label");
        container.appendChild(passwordProfilesExplanation);

        let profileArray = result;
        let noItemsButton;
        if (profileArray == null || profileArray.length == 0) {
            noItemsButton = this.createUIElement('li', [
                ['class',''],
                ['tabindex','-1']
            ]);
            // This shouldn't ever happen since KeePass has built in profiles. So we won't bother localising
            // this string but it's here just in case some weird change is made to KeePass in future.
            noItemsButton.textContent = "There are no password profiles. Use KeePass to save new profiles.";
            container.appendChild(noItemsButton);
        } else {

            for (let i = 0; i < profileArray.length; i++)
            {
                let displayName = profileArray[i];
            
                let loginItem = this.createUIElement('li', [
                    ['class',''],
                    ['tabindex','-1']
                ]);
                loginItem.textContent = displayName;
                loginItem.addEventListener("keydown", this.keyboardNavHandler, false);
                loginItem.addEventListener("mouseup", function (event) { 
                    if (event.button == 0 || event.button == 1)
                    {
                        event.stopPropagation();
                        this.dispatchEvent(new Event("keefoxCommand"));
                    }
                }, false);
                loginItem.addEventListener("keefoxCommand", function (event) { 
                    let kf = keefox_org;
                    kf.metricsManager.pushEvent ("feature", "generatePasswordFromProfile");
                    kf.generatePassword(this.textContent);
                    keefox_win.panel.CustomizableUI.hidePanelForNode(
                        keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
                    keefox_win.panel.hideSubSections();
                }, false);

                container.appendChild(loginItem);
            }
        }
        
        // Try to focus on the first item in the newly displayed sub section
        let matches = container.getElementsByTagName('li');
        if (!matches)
            return;
        let firstMatch = matches[0];
        if (firstMatch)
            firstMatch.focus();
    },

    generatePassword: function () {
        let kf = this._currentWindow.keefox_org;
        kf.metricsManager.pushEvent ("feature", "generatePassword");
        kf.generatePassword();
    },

    mainButtonCommandInstallHandler: function (event) {
        keefox_org.KeeFox_MainButtonClick_install();
    },

    mainButtonCommandLaunchKPHandler: function (event) {
        keefox_org.launchKeePass('');
    },

    mainButtonCommandLoginKPHandler: function (event) {
        keefox_org.loginToKeePass();
    },

    displayPanel: function () {
        // Show our main viewpanel (might not work if its placed inside the main Firefox menu)
        let buttonPlacement = CustomizableUI.getPlacementOfWidget('keefox-button');
        if (!buttonPlacement)
            return; // Widget is not available (in the customisation pallette instead?)
        
        if (buttonPlacement.area == CustomizableUI.TYPE_MENU_PANEL)
        {
            // We're in the main Firefox menu so we need to make that appear first

        }

        this._currentWindow.document.defaultView.PanelUI.showSubView('keefox-panelview',
                    this._widget.anchor,
                    buttonPlacement.area);


    },
    
    displayContextMenu: function (doc, event, id)
    {
        // This rather odd popup code is the only way to get Firefox to display a dynamically
        // created popup menu near the mouse cursor when using XHTML nodes rather than XUL.
        // Many of the dimensions associated with the event are buggy, it could be dev tools 
        // bugs but that doesn't quite add up. Being in the main Firefox menu automatically 
        // adds a slight position shift for some reason (enforced padding somewhere in 
        // Australis?) but a couple of pixels extra here shouldn't be a big deal and it gets 
        // the popup shifted just a little bit away from the cursor when we're on the 
        // toolbar instead

        // Our event is custom so not sure if it makes sense to pass it through to openPopup

        doc.popupNode = event.target;
        doc.getElementById(id)
            .openPopup(doc.getElementById('keefox-panelview')
                ,"topleft topleft",event.layerX+2,event.layerY+2, true, false);
//    doc.getElementById(id)
//            .openPopup(event.target
        //                ,"topleft topleft",0,0, true, false, event);
    },

    keyboardNavHandler: function (event) {
        // If arrow, enter, esc, etc. do stuff. e.g. focusAdjacentPanelItem(event.target,false)
        // prevent propergation and default if action has been taken
        if (event.keyCode == 13) // enter
        {
            event.preventDefault();
            event.stopPropagation();
            this.dispatchEvent(new CustomEvent("keefoxCommand", { 'detail': { 'button': 0, 'ctrlKey': event.ctrlKey }} ));
        } else if (event.keyCode == 40) // down
        {
            event.preventDefault();
            event.stopPropagation();
            keefox_win.panel.focusAdjacentPanelItem(event.target, false);
        } else if (event.keyCode == 38) // up
        {
            event.preventDefault();
            event.stopPropagation();
            keefox_win.panel.focusAdjacentPanelItem(event.target, true);
        } else if (event.keyCode == 37) // left
        {
            // if the focussed element is a group or item
            if (event.target.classList.contains("group-item") || event.target.classList.contains("login-item"))
            {
                event.preventDefault();
                event.stopPropagation();

                // if it has a parent group, behave as if the user had clicked on the parent and then focus the keyboard on the parent group item
                if (event.target.parentNode && event.target.parentNode.parentNode 
                    && event.target.parentNode.parentNode.nodeName == "li")
                    event.target.parentNode.parentNode.dispatchEvent(new CustomEvent("keefoxCommand", { 'detail': { 'button': 0, 'ctrlKey': event.ctrlKey }} ));
            }
        } else if (event.keyCode == 39) // right
        {
            // if the focussed element is a group
            if (event.target.classList.contains("group-item"))
            {
                // if it has any child items, behave as if the user had clicked on the focussed group and then focus the keyboard on the first child item
                // actually both things should be handed by the standard command. maybe need to ensure keyboard focus is set right depending on wheher the active group has child items or not.
                
                
                event.preventDefault();
                event.stopPropagation();
                // Only issue the toggle command if the target element is not the active-group
                if (!event.target.classList.contains("active-group"))
                    this.dispatchEvent(new CustomEvent("keefoxCommand", { 'detail': { 'button': 0, 'ctrlKey': event.ctrlKey }} ));
                else
                {
                    let fc = event.target.firstElementChild;
                    if (fc) fc = fc.firstElementChild;
                    if (fc) fc.focus();
                }

            }
        } else if (event.keyCode == 27) // esc
        {
            event.preventDefault();
            event.stopPropagation();
            this.dispatchEvent(new CustomEvent("keefoxEscape", { 'detail': { 'button': 0, 'ctrlKey': event.ctrlKey }} ));
        } else if (event.keyCode == 93) // context
        {
            event.preventDefault();
            event.stopPropagation();
            this.dispatchEvent(new CustomEvent("keefoxContext", { 'detail': { 'layerX': 10, 'layerY': 10 }} ));
        }

    },
    
    focusAdjacentPanelItem: function (startNode, reverse) {
        let node = startNode;
        let isVisible = false;

        // if current element is a group item and it is active (open), we find the first child of the group list and focus that.
        if (!reverse && node.classList.contains("group-item") && (node.classList.contains("active-group") || node.classList.contains("active-group-parent")))
        {
            let fc = this._findFirstFocusableChildItem(node.firstElementChild, reverse);
            if (fc != null)
                fc.focus();
            return;
        }

        let maxParentNodeHeight = 100;
        if (reverse && node && node.parentNode && node.parentNode.parentNode && node.parentNode.parentNode.classList.contains("group-item") )
            maxParentNodeHeight = 2;

        while (true)
        {
            node = reverse ? this._getPreviousSiblingOrParent(node,maxParentNodeHeight) : this._getNextSiblingOrParent(node);

            if (node != null)
            {
                // If we're going backwards and have found a sibling node that is an active (open) group
                if (reverse && node.parentNode == startNode.parentNode && node.classList.contains("group-item") 
                    && (node.classList.contains("active-group") || node.classList.contains("active-group-parent")))
                {
                    // we need to find the last child in the group's heirachy (because it will be visually displayed directly above our start node)
                    let childNode = node;
                    while (true)
                    {
                        childNode = this._findFirstFocusableChildItem(childNode.firstElementChild, true);
                        if (childNode.classList.contains("group-item") 
                            && (childNode.classList.contains("active-group") || childNode.classList.contains("active-group-parent")))
                            continue;
                        node = childNode;
                        break;
                    }
                }

                let focusableNode = this._findFirstFocusableChildItem(node, reverse);
                if (focusableNode != null)
                {
                    node = focusableNode;
                    break;
                }
                // else try the next sibling or parent
            } else
                break;

        }

        if (node != null)
        {
            // We found a node to focus to
            node.focus();
        }
    },

    _findFirstFocusableChildItem: function (startNode, reverse)
    {
        // search all children and focus on the first one we find that can be interacted with (i.e. li, button, input)
        // Note that this is a bit of a quick hack so will actually return
        // items prioritised by the order of the tags. I think this is fine 
        // for our initial panel design (only one input field and all buttons 
        // are at the bottom apart from "back" buttons which arguably
        // shouldn't be the subject of initial focus anyway).
        let tags = ['input','li','button'];
        if (tags.indexOf(startNode.tagName) < 0)
        {
            for (let i=0; i < tags.length; i++)
            {
                let list = startNode.getElementsByTagName(tags[i]);
                let start = reverse ? list.length-1 : 0;
                let incr = reverse ? -1 : 1;
                for (let j = start; (reverse && j >= 0) || (!reverse && j < list.length); j += incr)
                {
                    let isVisible = list[j].offsetWidth > 0 || list[j].offsetHeight > 0;
                    if (isVisible)
                        return list[j];
                }
            }
        } else
        {
            let isVisible = startNode.offsetWidth > 0 || startNode.offsetHeight > 0;
            if (isVisible)
                return startNode;
        }
        return null;
    },
    
    _getPreviousSiblingOrParent: function (startNode, height) {
        // If our height tracker goes below 0 we know we've now gone too far up the heirachy
        if (height <= 0)
           return startNode;
        if (startNode.tagName == 'ul')
           return this._getPreviousSiblingOrParent(startNode.parentNode, --height);
        let node = startNode;

        if (node == null)
            return null;

        node = node.previousElementSibling;

        if (node == null)
        {
            node = startNode.parentNode;

            // As long as we've gone too far up the DOM tree, keep going until we find a previous element sibling
            if (node.id != this.panelContainerId)
                node = this._getPreviousSiblingOrParent(node, --height);
            else
                node = null;
        }
        // Either the next sibling or null if we couldn't find a sibling before we got to the top of the DOM tree 
        return node;
    },
    
    //loop through all following siblings and check if its visible. go to parents siblings after nodes siblings are exhausted.
    // ignore all ul nodes (we only care about the li that contains it and those contained within)
    _getNextSiblingOrParent: function (startNode) {
        if (startNode.tagName == 'ul')
            return this._getNextSiblingOrParent(startNode.parentNode);
        let node = startNode;

        if (node == null)
            return null;

        node = node.nextElementSibling;

        if (node == null)
        {
            node = startNode.parentNode;

            // As long as we've not gone too far up the DOM tree, keep going until we find a next element sibling
            if (node.id != this.panelContainerId)
                node = this._getNextSiblingOrParent(node);
            else
                node = null;
        }
        // Either the next sibling or null if we couldn't find a sibling before we got to the top of the DOM tree 
        return node;
    }

};
