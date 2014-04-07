/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
  Copyright 2008-2014 Chris Tomlinson <keefox@christomlinson.name>
  
  This panel.js file contains functions and data related to the visible
  user interface panel.
  
  It contains significant amounts of code duplicated (and usually slightly tweaked) from KFToolbar. We have no intention of modifying the legacy code in KFToolbar so while the code may diverge over time, it is prety independent of the rest of the addon and we'll eventually just delete the old version.

  KFtoolbar also contains the code for in-page context menus but this will also not be modified - hopefully in 1.4 or 1.5 I'll update it but only after refactoring into a seperate file.
  
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
        
        this.buildPanel();

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
//                    onClick: function()
//                    {
//                        //Maybe track cumulative interaction metrics here?
//                    }
                    onViewShowing: function (evt)
                    {
                        // This is called before the view is moved to the DOM location ready for
                        // display so events attached here will be deleted before the view is 
                        // actually displayed. The hack below wraps the creation of the event 
                        // listener in a timeout which will (most of the time) allow us to work 
                        // around this Firefox bug
                        var targetDoc = evt.target.ownerDocument;
                        let panel = evt.target.ownerGlobal.keefox_win.panel;
                        panel.viewShowingHackTimer = Components.classes["@mozilla.org/timer;1"]
                                .createInstance(Components.interfaces.nsITimer);
                        panel.viewShowingHackTimer.initWithCallback(
                                function () { targetDoc.getElementById('KeeFox-PanelSection-searchbox').focus(); },
                            50, Components.interfaces.nsITimer.TYPE_ONE_SHOT);

                    },
                    onViewHiding: function (evt)
                    {
                        //TODO: Re-enable these hiding events once dev work is finished
                        // Clear search terms
                        //evt.target.ownerDocument.getElementById('KeeFox-PanelSection-searchbox').value = "";
                        // Clear search results
                        //evt.target.ownerGlobal.keefox_win.panel.onSearchComplete([]);
                        // Close subpanels
                        //evt.target.ownerGlobal.keefox_win.panel.hideSubSections();
                    }
                });
                keefox_win.Logger.info("Created KeeFox widget");
            }
            this._widget = wrapperGroup.forWindow(this._currentWindow);
            keefox_win.Logger.debug("KeeFox widget instance found");
        }
        catch (e)
        {
            // We only create the panel in FF > Australis so should be able to rely on it working... but just in case...
            keefox_win.Logger.error("Failed to create KeeFox widget because: " + e);
        }


        // Listen for mouseup and mousedown events so we can fire command events ala XUL
        //this.currentWindow.document.addEventListener("mouseup",this.accurateClickTracker,false);
        //this.currentWindow.document.addEventListener("mousedown",this.accurateClickTracker,false);

        this._observerService = Components.classes["@mozilla.org/observer-service;1"]
                    .getService(Components.interfaces.nsIObserverService);
        this._observerService.addObserver(this,"keefox_matchedLoginsChanged",false);

    },

    observe: function (aSubject, aTopic, aData)
    {
        if (aTopic == "keefox_matchedLoginsChanged")
        {
            // Don't want to do anything if this window is not displaying 
            // the URL for which the matched logins have changed
            if (this._currentWindow.content.document.location.href == aSubject.wrappedJSObject.uri) 
                this.setLogins(aSubject.wrappedJSObject.logins, aSubject.wrappedJSObject.uri);
        }
    },

    _currentWindow: null,

    shutdown: function () { },

    buildPanel: function () {
        let panelview = this._currentWindow.document.createElement('panelview');
        panelview.id = 'keefox-panelview';
        //panelview.className = 'testClass';
        
        this.populatePanel(panelview);

        // Inject our panel view into the multiView panel
        let multiview = this._currentWindow.document.getElementById('PanelUI-multiView');
        multiview.appendChild(panelview);
        keefox_win.Logger.debug("Injected KeeFox widget");
    },
    
    populatePanel: function (panel) {
        let closure = this;
        // starting with each main component in a div with a button to invoke the main
        // action. After some design work, I expect this will look significantly different
        
        // May contain optional extra text at some point but basically this replicates the functionaility of the main toolbar button from previous versions so we have something to click on to setup, launch KeePass, etc.
        let status = this.createPanelSection(
            'KeeFox-PanelSection-status',
            null,
            'do-a-thing'
        );
        this.disableUIElement('KeeFox-PanelSection-status');
        let statusTextContainer = this.createUIElement('div', [
            ['id','KeeFox-PanelSection-status-text']
        ]);
        status.insertBefore(statusTextContainer,status.lastChild);
        
        // This close panel will be displayed only when a subpanel is being displayed
        let subPanelCloser = this.createPanelSection(
            'KeeFox-PanelSection-close',
            function () { closure.hideSubSections(); },
            'close-sub-panel'
        );
//        let subPanelCloserTextContainer = this.createUIElement('div', [
//            ['id','KeeFox-PanelSection-close-text']
//        ]);
//        subPanelCloser.insertBefore(subPanelCloserTextContainer,subPanelCloser.lastChild);
        
        

        // For some reason it's impossible to focus on this box when first opening the panel through the javascript below. manually clicking on it seems to work fine though so we can live with that bug at least for the time being
        let searchPanel = this.createUIElement('div', [
            ['class','KeeFox-PanelSection enabled'],
            ['id','KeeFox-PanelSection-search']
        ]);
        let searchBox = this.createUIElement('input', [
            ['class','KeeFox-Search'],
            ['id','KeeFox-PanelSection-searchbox'],
            ['type','text'],
            ['placeholder','Search...'],
            ['title','Do a search']
        ]);
        searchBox.addEventListener('input',function(e){
         console.log("keyup event detected! coming from this element:", e.target);
         //TODO: rate limit searches?
         keefox_org.search.execute(e.target.value, closure.onSearchComplete);
        }, false);
        searchPanel.appendChild(searchBox);
        let searchResultsContainer = this.createUIElement('div', [
            ['class','KeeFox-PanelInlineSection KeeFox-SearchResults enabled'],
            ['id','KeeFox-PanelSubSection-SearchResults']
        ]);
        searchPanel.appendChild(searchResultsContainer);
        
        
        // although strangly, even textbox no longer allows interaction despite creating it using exactly the same code as earlier. maybe the containing panel is somehow different?
        //let searchBox = this._currentWindow.document.createElement('textbox');
        
        // The main action for the list of matched logins will display the list of matched logins, but this behaviour is
        // not required in most cases (since the discovery of any matched logins will automatically
        // result in the list being displayed in the main panel)
        let matchedLogins = this.createPanelSection(
            'KeeFox-PanelSection-matchedLogins',
            function () { closure.showSubSectionMatchedLogins(); },
            'KeeFox_Matched-Logins-Button'
        );
        this.disableUIElement('KeeFox-PanelSection-matchedLogins-main-action');
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
        this.disableUIElement('KeeFox-PanelSection-allLogins-main-action');
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
        
        // This will become a new submenu one day
        let generatePassword = this.createPanelSection(
            'KeeFox-PanelSection-generatePassword', 
            function () { closure.showSubSectionGeneratePassword(); },
            'KeeFox_Menu-Button.copyNewPasswordToClipboard'
        );
        this.disableUIElement('KeeFox-PanelSection-generatePassword-main-action');
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
        this.disableUIElement('KeeFox-PanelSection-changeDatabase-main-action');
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
        this.disableUIElement('KeeFox-PanelSection-detectForms-main-action');
        
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
                //TODO: Make this actually load help instead of hack the resize test
                closure.resizePanel();
//                keefox_org.utils._openAndReuseOneTabPerURL('http://keefox.org/help'); 
//                closure.CustomizableUI.hidePanelForNode(
//                    closure._currentWindow.document.getElementById('keefox-panelview'));
            },
            'KeeFox_Help-Centre-Button'
        );
        
        //var element3 = this.createUIElement('hr',[]);
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
            button.addEventListener("mouseup", onCommand, false);
            //TODO: onKeyboard enter key
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
        let elem = this._currentWindow.document.getElementById('keefox-panelview');
        elem.classList.remove('subpanel-enabled');
        let toHide = elem.getElementsByClassName('enabled KeeFox-PanelSubSection');
        if (toHide.length > 0)
            toHide[0].parentNode.classList.remove('subpanel-enabled');
        while (toHide.length)
            this.disableUIElementNode(toHide[0]); // remove's enabled class and thus deletes from the toHide list
        this.resizePanel();
    },

    showSubSection: function (id)
    {
        let elem = this._currentWindow.document.getElementById(id);
        this.enableUIElementNode(elem);
        elem.parentNode.classList.add('subpanel-enabled');
        let panel = this._currentWindow.document.getElementById('keefox-panelview');
        panel.classList.add('subpanel-enabled');
        this.resizePanel();
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
        this.generatePassword();
        this.CustomizableUI.hidePanelForNode(this._currentWindow.document.getElementById('keefox-panelview'));
        //TODO1.5: Immediately fire a generate password request using the most recent profile (& update growl message?)
        // we might not have time to implement this for v1.4: this.showSubSection('KeeFox-SubSection-generatePassword');
    },
    
    showSubSectionChangeDatabase: function ()
    {
        let dbcontainer = this._currentWindow.document.getElementById('KeeFox-PanelSubSection-DatabaseList');
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
                    for (var i=0; i<keefox_org.KeePassDatabases.length; i++)
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
                                if (i == keefox_org._keeFoxExtension.prefs.getValue("maxAllLoginsInMainPanel",0))
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
        for (var i = container.childNodes.length; i > 0; i--) {
            container.removeChild(container.childNodes[0]);
        }

        var foundGroups = group.childGroups;
        var foundLogins = group.childLightEntries;
        //keefox_win.Logger.debug("loga");
        if ((foundGroups == null || foundGroups.length == 0) && (foundLogins == null || foundLogins.length == 0)) {
            let noItemsButton = null;
            noItemsButton = this.createUIElement('li', [
                ['class',''],
                ['data-fileName',dbFileName],
             //   ['data-uuid',rootGroup.uniqueID],
            //    ['id', 'KeeFox_Group-' + rootGroup.uniqueID],
                ['title',keefox_org.locale.$STR("loginsButtonEmpty.tip")]
            ]);
            noItemsButton.textContent = keefox_org.locale.$STR("loginsButtonEmpty.label");

            // Unless we are allowed to display one or more logins in the main panel, we need to switch to the overflow panel now
            if (isTopLevelContainer && keefox_org._keeFoxExtension.prefs.getValue("maxAllLoginsInMainPanel",0) == 0)
                container = this.getEmptyContainerFor("KeeFox-PanelSubSection-AllLoginsList-Overflow");
            container.appendChild(noItemsButton);
            return;
        }

        for (var i = 0; i < foundGroups.length; i++) {
            let group = foundGroups[i];
            let groupItem = this.createGroupItem(group,dbFileName);

            if (isTopLevelContainer && i == keefox_org._keeFoxExtension.prefs.getValue("maxAllLoginsInMainPanel",0))
                container = this.getEmptyContainerFor("KeeFox-PanelSubSection-AllLoginsList-Overflow");
            container.appendChild(groupItem);
        }

        for (var i = 0; i < foundLogins.length; i++) {
            //keefox_win.Logger.debug("logi: " + i);
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
                "loginsButtonLogin.tip", [login.uRLs[0], usernameDisplayValue])]
            ]);
            if (keefox_org._keeFoxExtension.prefs.getValue("alwaysDisplayUsernameWhenTitleIsShown",false))
                loginItem.textContent = keefox_org.locale.$STRF("matchedLogin.label", [usernameDisplayValue, login.title]);
            else
                loginItem.textContent = login.title;
            
            //tempButton.addEventListener("command", function (event) { keefox_win.ILM.loadAndAutoSubmit(0, event.ctrlKey, this.getAttribute('usernameName'), this.getAttribute('usernameValue'), this.getAttribute('url'), null, null, this.getAttribute('uuid'), this.getAttribute('fileName')); event.stopPropagation(); }, false); //ael: works
            loginItem.addEventListener("mouseup", function (event) {
                keefox_win.Logger.debug("mouseup fired: " + event.button);

                // Make sure no parent groups override the actions of this handler
                event.stopPropagation();

                if (event.button == 0 || event.button == 1)
                {
                    keefox_win.ILM.loadAndAutoSubmit(event.button,
                                                     event.ctrlKey,
                                                     this.getAttribute('data-usernameName'), 
                                                     this.getAttribute('data-usernameValue'),
                                                     this.getAttribute('data-url'),
                                                     null,
                                                     null,
                                                     this.getAttribute('data-uuid'), 
                                                     this.getAttribute('data-fileName')
                                                    );
                    event.stopPropagation();
                    keefox_win.panel.CustomizableUI.hidePanelForNode(
                        keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
                    keefox_win.panel.hideSubSections();
                } 
                if (event.button == 2)
                {
                //TODO: effing mouse position 
                //keefox_win.Logger.debug("mouseup fired: " + event.screenX + " : "  + event.screenY + " : "  + event.clientX + " : "  + event.clientY ); //+ " : "  + keefox_win.panel._currentWindow.document.top + " : "  + event.screenX + " : "  + event.screenX + " : "  + event.screenX + " : " );

                    //TODO: support keyboard context menu button too
//                    keefox_win.panel._currentWindow.document.getElementById('KeeFox-login-context').openPopup(null,null,event.clientX, event.clientY, true, false, event);
//keefox_win.panel._currentWindow.document.getElementById('KeeFox-login-context').openPopupAtScreen(event.screenX -keefox_win.panel._currentWindow.mozInnerScreenX, event.screenY, true);
keefox_win.panel._currentWindow.document.getElementById('KeeFox-login-context').openPopup(event.target,"after_pointer",0,0, true, false, event);
                }
            },
            false);

            // If the combined total of all groups and the current login index exceeds 
            // our allowed number of items in the main panel, we must switch to the overflow container
            if (isTopLevelContainer && (i + foundGroups.length) == keefox_org._keeFoxExtension.prefs.getValue("maxAllLoginsInMainPanel",0))
                container = this.getEmptyContainerFor("KeeFox-PanelSubSection-AllLoginsList-Overflow");
            container.appendChild(loginItem);
        }
    },

    createGroupItem: function (group, dbFileName, extraCSSClasses, displayName)
    {
        let groupItem = this.createUIElement('li', [
            ['class','group-item'],
            ['data-fileName',dbFileName],
            ['data-uuid',group.uniqueID],
            ['style','background-image:url(data:image/png;base64,' + group.iconImageData + ')'],
            //   ['id', 'KeeFox_Group-' + rootGroup.uniqueID],
            ['title',keefox_org.locale.$STR("loginsButtonGroup.tip")]
        ]);
        groupItem.textContent = displayName || group.title;
            
        groupItem.addEventListener("mouseup", function (event) {
            keefox_win.Logger.debug("mouseup fired: " + event.button);
            
            // Make sure no parent groups override the actions of this handler
            event.stopPropagation();

            if (event.button == 0 || event.button == 1)
            {
                // Find the currently displayed subgroup (if any)
                let currentGroup = document.getElementById("KeeFox-PanelSection-allLogins")
                                    .querySelector(".active-group");
                
                // Mark it as no longer active
                if (currentGroup != null)
                    currentGroup.classList.remove("active-group");
                
                // If user clicked on the active group, make sure that it's direct parent (if any) is activated
                if (currentGroup == event.target)
                {
                    // ignore the containing ul node, but note that we may end up selecting some higher part of the panel rather than a group
                    let parentGroup = currentGroup.parentNode.parentNode;
                    if (parentGroup != null && parentGroup.classList.contains("group-item"))
                    {
                        parentGroup.classList.remove("active-group-parent");
                        parentGroup.classList.add("active-group");
                    }
                } else
                {
                    //TODO: Maybe a more efficient way to do this so we don't un-neccesarilly 
                    // remove and re-add the class for minor leaf node alterations

                    let parent;

                    // remove active marker from all parents
                    if (currentGroup)
                    {
                        parent = currentGroup.parentNode;
                        while (parent.nodeName == "ul" || parent.nodeName == "li")
                        {
                            if (parent.nodeName == "li")
                                parent.classList.remove("active-group-parent");
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

                    //TODO: If user clicked on something in the same active hierachy, we should close the one they clicked on and activate its parent (if it exists)
                }
                keefox_win.panel.resizePanel();
            } 
            if (event.button == 2)
            {
            //TODO: effing mouse position 
            //keefox_win.Logger.debug("mouseup fired: " + event.screenX + " : "  + event.screenY + " : "  + event.clientX + " : "  + event.clientY ); //+ " : "  + keefox_win.panel._currentWindow.document.top + " : "  + event.screenX + " : "  + event.screenX + " : "  + event.screenX + " : " );

                //TODO: support keyboard context menu button too
//                    keefox_win.panel._currentWindow.document.getElementById('KeeFox-login-context').openPopup(null,null,event.clientX, event.clientY, true, false, event);
//keefox_win.panel._currentWindow.document.getElementById('KeeFox-login-context').openPopupAtScreen(event.screenX -keefox_win.panel._currentWindow.mozInnerScreenX, event.screenY, true);
keefox_win.panel._currentWindow.document.getElementById('KeeFox-group-context').openPopup(event.target,"after_pointer",0,0, true, false, event);
            }
        },
        false); //ael: works
                    
        let groupContainer = this.createUIElement('ul', [
            ['class',' ' + extraCSSClasses],
            ['id', 'KeeFox_Group-' + group.uniqueID]
        ]);
        this.setOneLoginsMenu(groupContainer,group,dbFileName);
        groupItem.appendChild(groupContainer);
        return groupItem;
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
    setLogins: function (logins, documentURI)
    {
        keefox_win.Logger.debug("panel setLogins started");
        // Get the container that we want to add our matched logins to.
        // We don't care whether we have already added content to the container before
        // Other parts of KeeFox code will remove the contents of the container when we know
        // that don't want them anymore.
        // Dealing with additional entries being added (e.g. from an iframe) used to
        // be much more complex but now all we need to do is make sure that we don't
        // add duplicate entries. Actually, in KeeFox 1.5+ we might adjust this again 
        // so that we can store information about which iframe and specific form should 
        // be filled in so determining duplicates would get more complex again at that point.

        var container = this.getContainerFor("KeeFox-PanelSubSection-MatchedLoginsList");
        if (container === undefined || container == null)
            return;

        // if the matched logins container is locked (because it's currently open) we don't
        // make any changes. In future, maybe we could delay the change rather than
        // completely ignore it but for now, the frequent "dynamic form polling"
        // feature will ensure a minimal wait for update once the lock is released.
        //if (container.getAttribute('KFLock') == "enabled")
        //    return;

        // Disable all matched logins UI elements, perhaps just for a jiffy while 
        // we work out which ones need to be revealed again
        this.disableUIElement("KeeFox-PanelSection-matchedLogins");
        this.disableUIElement("KeeFox-PanelSubSection-MatchedLoginsList");
        this.disableUIElement("KeeFox-PanelSubSection-MatchedLoginsList-Overflow");
        this.disableUIElement("KeeFox-PanelSection-matchedLogins-main-action");
        
        if (logins == null || logins.length == 0) {
            this.removeLogins();
            this.setupButton_ready(null, this._currentWindow);
            return;
        //} else {
            //this.removeNonMatchingEventHandlers(container);
        }
        //this.removeMatchingEventHandlers(container);

        logins.sort(this.compareRelevanceScores);

        keefox_win.Logger.debug("setting or merging " + logins.length + " matched logins");

        //this.setLoginsTopMatch(logins, documentURI, container, merging);
        this.setLoginsAllMatches(logins, documentURI, container);
        
        // Update the UI state to reflect the number of matches found and where they are displayed

        var overflowPanelContainer = this.getContainerFor("KeeFox-PanelSubSection-MatchedLoginsList-Overflow");

        if (container.childElementCount > 0 || overflowPanelContainer.childElementCount > 0)
            this.enableUIElement("KeeFox-PanelSection-matchedLogins");
        if (container.childElementCount > 0)
            this.enableUIElement("KeeFox-PanelSubSection-MatchedLoginsList");
        if (overflowPanelContainer.childElementCount > 0)
        {
            //TODO: enable this subpanel? or maybe that's done when we try to show the subpanel each time? this.enableUIElement("KeeFox-PanelSubSection-MatchedLoginsList-Overflow");
            this.enableUIElement("KeeFox-PanelSection-matchedLogins-main-action");
        }
        
        // Set icon overlay on main panel widget button icon to say how many matches there were
        this.setWidgetNotificationForMatchedLogins(container.childElementCount + overflowPanelContainer.childElementCount);

        keefox_win.Logger.debug(logins.length + " matched panel logins set!");
    },

    setLoginsAllMatches: function (logins, documentURI, container) {
        keefox_win.Logger.debug("setLoginsAllMatches started");
        
        // Sometimes we need to refer to the original container even
        // if we have started adding extra logins to the overflow container
        let mainPanelContainer = container;
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


            // check for duplicates in the main panel and subview containers
            var addLoginToPopup = true;

            if (mainPanelContainer.childElementCount > 0) {
                for (let j = 0, n = mainPanelContainer.children.length; j < n; j++) {
                    var child = mainPanelContainer.children[j];
                    let valAttr = child.hasAttribute('data-uuid') ? child.getAttribute('data-uuid') : null;
                    if (valAttr == login.uniqueID) {
                        addLoginToPopup = false;
                        break;
                    }
                }
            }

            // If we've not already found a duplicate, look at the overflow container too
            if (addLoginToPopup && overflowPanelContainer != null && overflowPanelContainer.childElementCount > 0) {
                for (let j = 0, n = overflowPanelContainer.children.length; j < n; j++) {
                    var child = overflowPanelContainer.children[j];
                    let valAttr = child.hasAttribute('data-uuid') ? child.getAttribute('data-uuid') : null;
                    if (valAttr == login.uniqueID) {
                        addLoginToPopup = false;
                        break;
                    }
                }
            }

            if (addLoginToPopup)
            {

                var loginItem = this.createUIElement('li', [
                    ['class',''],
                    ['style','background-image:url(data:image/png;base64,' + login.iconImageData + ')'],
                    ['data-fileName',login.database.fileName],
                    ['data-usernameName',usernameName],
                    ['data-usernameValue',usernameValue],
                    ['data-usernameId',usernameId],
                    ['data-formActionURL',login.formActionURL],
                    ['data-documentURI',documentURI],
                    ['data-uuid',login.uniqueID],
                    ['title',keefox_org.locale.$STRF("matchedLogin.tip", [login.title, displayGroupPath, usernameDisplayValue])]
                ]);
                loginItem.textContent = keefox_org.locale.$STRF("matchedLogin.label", [usernameDisplayValue, login.title]);
            
                //loginItem.addEventListener("command", this.mainButtonCommandMatchHandler, false);
                loginItem.addEventListener("mouseup", this.MatchedLoginOnInvokeHandler, false);

                //tempButton.setAttribute("class", "menuitem-iconic");
                //tempButton.setAttribute("context", "KeeFox-login-context");
                //tempButton.setAttribute("image", "data:image/png;base64," + login.iconImageData);
                //tempButton.setAttribute("uuid", login.uniqueID);

                // If we've exceeded our allowed number of items in the main panel, we must switch to the overflow container
                if ((i + mainPanelContainer.childElementCount) >= keefox_org._keeFoxExtension.prefs.getValue("maxMatchedLoginsInMainPanel",5))
                {
                    container = this.getContainerFor("KeeFox-PanelSubSection-MatchedLoginsList-Overflow");
                    overflowPanelContainer = container;
                }
                container.appendChild(loginItem);
            }
        }
    },

    onSearchComplete: function (logins)
    {
        keefox_win.panel.showSearchResults.call(keefox_win.panel,logins);
        keefox_win.panel.resizePanel();
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

        for (var i = 0; i < logins.length; i++) {
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
                //['data-fileName',dbFileName],
                ['data-usernameName',usernameName],
                ['data-usernameValue',usernameValue],
                ['data-url',login.url],
                ['data-uuid',login.uniqueID],
                ['style','background-image:url(data:image/png;base64,' + login.iconImageData + ')'],
            //    ['id', 'KeeFox_Group-' + rootGroup.uniqueID],
                ['title',keefox_org.locale.$STRF(
                "loginsButtonLogin.tip", [login.url, usernameDisplayValue])]
            ]);
            if (keefox_org._keeFoxExtension.prefs.getValue("alwaysDisplayUsernameWhenTitleIsShown",false))
                loginItem.textContent = keefox_org.locale.$STRF("matchedLogin.label", [usernameDisplayValue, login.title]);
            else
                loginItem.textContent = login.title;
            
            loginItem.addEventListener("mouseup", function (event) {
                keefox_win.Logger.debug("mouseup fired: " + event.button);

                // Make sure no parent groups override the actions of this handler
                event.stopPropagation();

                if (event.button == 0 || event.button == 1)
                {
                    keefox_win.ILM.loadAndAutoSubmit(event.button,
                                                     event.ctrlKey,
                                                     this.getAttribute('data-usernameName'), 
                                                     this.getAttribute('data-usernameValue'),
                                                     this.getAttribute('data-url'),
                                                     null,
                                                     null,
                                                     this.getAttribute('data-uuid')//, 
                                                     //this.getAttribute('data-fileName')
                                                    );
                    event.stopPropagation();
                    keefox_win.panel.CustomizableUI.hidePanelForNode(
                        keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
                    keefox_win.panel.hideSubSections();
                } 
                if (event.button == 2)
                {
                //TODO: effing mouse position 
                //keefox_win.Logger.debug("mouseup fired: " + event.screenX + " : "  + event.screenY + " : "  + event.clientX + " : "  + event.clientY ); //+ " : "  + keefox_win.panel._currentWindow.document.top + " : "  + event.screenX + " : "  + event.screenX + " : "  + event.screenX + " : " );

                    //TODO: support keyboard context menu button too
//                    keefox_win.panel._currentWindow.document.getElementById('KeeFox-login-context').openPopup(null,null,event.clientX, event.clientY, true, false, event);
//keefox_win.panel._currentWindow.document.getElementById('KeeFox-login-context').openPopupAtScreen(event.screenX -keefox_win.panel._currentWindow.mozInnerScreenX, event.screenY, true);
keefox_win.panel._currentWindow.document.getElementById('KeeFox-login-context').openPopup(event.target,"after_pointer",0,0, true, false, event);
                }
            },
            false); //ael: works
            
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

        // We can't know if this is going to be called just once (usual) or multiple times 
        // (e.g. for iframes) so we must make sure any race conditions are avoided or at least benign
        this._currentWindow.document.getElementById("keefox-button").setAttribute("keefox-match-count",count);
    },

    // Sets the overall widget status including the status panel
    // reports to the user the state of KeeFox and the KeePassRPC connection
    setWidgetStatus: function (enabled, buttonLabel, tooltip, detailedInfo, buttonAction)
    {
        let widgetButton = this._currentWindow.document.getElementById("keefox-button");
        let statusPanel = this._currentWindow.document.getElementById("KeeFox-PanelSection-status");
        let statusPanelText = this._currentWindow.document.getElementById("KeeFox-PanelSection-status-text");
        let statusPanelButton = this._currentWindow.document.getElementById("KeeFox-PanelSection-status-main-action");
        
        if (widgetButton === undefined || widgetButton == null 
            || statusPanel === undefined || statusPanel == null
            || statusPanelButton === undefined || statusPanelButton == null)
            return;

        widgetButton.classList.remove(enabled ? "disabled" : "enabled");
        widgetButton.classList.add(enabled ? "enabled" : "disabled");
        statusPanel.classList.remove(!enabled ? "disabled" : "enabled");
        statusPanel.classList.add(!enabled ? "enabled" : "disabled");

        widgetButton.removeAttribute("keefox-match-count");

        // Remove all known possible event handlers
        statusPanelButton.removeEventListener("mouseup", this.mainButtonCommandInstallHandler, false);
        statusPanelButton.removeEventListener("mouseup", this.mainButtonCommandLaunchKPHandler, false);
        statusPanelButton.removeEventListener("mouseup", this.mainButtonCommandLoginKPHandler, false);
//        statusPanelButton.removeEventListener("command", this.mainButtonCommandInstallHandler, false);
//        statusPanelButton.removeEventListener("command", this.mainButtonCommandLaunchKPHandler, false);
//        statusPanelButton.removeEventListener("command", this.mainButtonCommandLoginKPHandler, false);

        if (enabled)
        {
            statusPanel.classList.remove("enabled");
            statusPanel.classList.add("disabled");
            widgetButton.setAttribute("tooltiptext","KeeFox enabled"); //TODO: widget API?
        } else
        {
            statusPanel.classList.add("enabled");
            statusPanel.classList.remove("disabled");
            widgetButton.setAttribute("tooltiptext",tooltip); //TODO: widget API?
            statusPanelText.textContent = detailedInfo;
            statusPanelButton.setAttribute("value", buttonLabel);
            statusPanelButton.setAttribute("tooltip",tooltip);
            statusPanelButton.addEventListener("mouseup", buttonAction, false);
    //        statusPanelButton.addEventListener("command", buttonAction, false);
        }
    },
    
    setupButton_install: function (targetWindow) {
        keefox_win.Logger.debug("setupButton_install start");
        
        //TODO: Remove all of the existing logins, etc.? already done elsewhere?

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
    //TODO: Why targetWindow? just use this.currentWindow?
    setupButton_ready: function (targetWindow) {
        keefox_win.Logger.debug("setupButton_ready start");
        var mainButton;
        var mainWindow = this._currentWindow;
        mainButton = mainWindow.document.getElementById("keefox-button");
        if (mainButton === undefined || mainButton == null)
            return;

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
                //TODO:1.4: We used to just return like this but maybe we need to set 
                // up some kind of state? Not sure why we'd end up in this situation, nor how to describe it to users anyway!

//                this.setWidgetStatus(false,
//                    keefox_org.locale.$STR("installKeeFox.label"), 
//                    keefox_org.locale.$STR("installKeeFox.tip"),
//                    keefox_org.locale.$STR("installKeeFox.tip"),
//                    this.mainButtonCommandInstallHandler);
//                this.disableUIElement("KeeFox-PanelSection-search");
//                this.disableUIElement("KeeFox-PanelSection-matchedLogins");
//                this.disableUIElement("KeeFox-PanelSection-allLogins");
//                this.disableUIElement("KeeFox-PanelSection-generatePassword");
//                this.disableUIElement("KeeFox-PanelSection-changeDatabase");
//                this.disableUIElement("KeeFox-PanelSection-detectForms");
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
            this.setupButton_install(targetWindow);
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
                ['title',keefox_org.locale.$STR("changeDBButtonEmpty.tip")]
            ]);
            noItemsButton.textContent = keefox_org.locale.$STR("changeDBButtonEmpty.label");
            container.appendChild(noItemsButton);
            return;
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
                    ['title',keefox_org.locale.$STRF("changeDBButtonListItem.tip", [mruArray[i]])]
                ]);
                loginItem.textContent = displayName;
                loginItem.addEventListener("mouseup", function (event) { 
                    if (event.button == 0 || event.button == 1)
                    {
                        keefox_org.changeDatabase(this.getAttribute('mruToUse'), false); 
                        event.stopPropagation();
                        keefox_win.panel.CustomizableUI.hidePanelForNode(keefox_win.document.getElementById('keefox-panelview'));
                        keefox_win.panel.hideSubSections();
                    }
                }, false);

                container.appendChild(loginItem);
            }
        }

    },

    generatePassword: function () {
        let kf = this._currentWindow.keefox_org;
        kf.metricsManager.pushEvent ("feature", "generatePassword");
        kf.generatePassword();
    },

    

    removeNonMatchingEventHandlers: function (node) {
        // only one should be set but we don't know which one so try to remove all
        node.removeEventListener("command", this.mainButtonCommandInstallHandler, false);
        node.removeEventListener("command", this.mainButtonCommandLaunchKPHandler, false);
        node.removeEventListener("command", this.mainButtonCommandLoginKPHandler, false);
    },

    removeMatchingEventHandlers: function (node) {
        node.removeEventListener("command", this.MatchedLoginOnInvokeHandler, false);
        node.setAttribute('uuid', '', null);
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
    

    MatchedLoginOnInvokeHandler: function (event) {

        keefox_win.Logger.debug("MatchedLoginOnInvokeHandler fired: " + event.button);

        // Make sure no parent groups override the actions of this handler
        event.stopPropagation();

        if (event.button == 0 || event.button == 1)
        {
                    

            keefox_win.ILM.fill(
                this.hasAttribute('data-usernameName') ? this.getAttribute('data-usernameName') : null,
                this.hasAttribute('data-usernameValue') ? this.getAttribute('data-usernameValue') : null,
                this.hasAttribute('data-formActionURL') ? this.getAttribute('data-formActionURL') : null,
                this.hasAttribute('data-usernameId') ? this.getAttribute('data-usernameId') : null,
                this.hasAttribute('data-formId') ? this.getAttribute('data-formId') : null,
                this.hasAttribute('data-uuid') ? this.getAttribute('data-uuid') : null,
                this.hasAttribute('data-documentURI') ? this.getAttribute('data-documentURI') : null,
                this.hasAttribute('data-fileName') ? this.getAttribute('data-fileName') : null
            );
            keefox_win.panel.CustomizableUI.hidePanelForNode(
                keefox_win.panel._currentWindow.document.getElementById('keefox-panelview'));
            keefox_win.panel.hideSubSections();
        } 
        if (event.button == 2)
        {
        //TODO: effing mouse position 
        //keefox_win.Logger.debug("mouseup fired: " + event.screenX + " : "  + event.screenY + " : "  + event.clientX + " : "  + event.clientY ); //+ " : "  + keefox_win.panel._currentWindow.document.top + " : "  + event.screenX + " : "  + event.screenX + " : "  + event.screenX + " : " );

            //TODO: support keyboard context menu button too
//                    keefox_win.panel._currentWindow.document.getElementById('KeeFox-login-context').openPopup(null,null,event.clientX, event.clientY, true, false, event);
//keefox_win.panel._currentWindow.document.getElementById('KeeFox-login-context').openPopupAtScreen(event.screenX -keefox_win.panel._currentWindow.mozInnerScreenX, event.screenY, true);
keefox_win.panel._currentWindow.document.getElementById('KeeFox-login-context').openPopup(event.target,"after_pointer",0,0, true, false, event);
        }

    },

//    accurateClickTracker: function (event) {
//        if (event.type=="mousedown")
//            this.mouseIsDownOnElement = event.target; //TODO: correct target?
//        else if (event.type == "mouseup")
//        {
//            if (this.mouseIsDownOnElement == event.target)
//            {
//                keefox_win.Logger.debug("Mouse click detected. Button: " + event.button);
//                event.target.raiseEvent("command");
//            }
//        }
//    },

    keyboardNavTracker: function (event) {

    },

    resizePanelCallback: function () {
        let pv = this._currentWindow.document.getElementById('keefox-panelview');
        pv.style.height = pv.parentNode.parentNode.parentNode.clientHeight + "px";
    },

    resizePanelTimer: null,

    // For an unknown reason, bug or limitation, we must tell Firefox to recalculate
    // the size of the panel container so that it matches the size that the outer 
    // panel has reserved for us. This process occurs when the panel first opens
    // but fails to occur when the size of the panel changes once its open. Maybe
    // there is some kind of mutation observer I should subscribe to but until that
    // is documented somewhere, this setTimeout hack seems to do the trick.
    resizePanel: function () {
        let pv = this._currentWindow.document.getElementById('keefox-panelview');
        if (!pv || !pv.parentNode)
            return;

        pv.style.height = "";

        this.resizePanelTimer = Components.classes["@mozilla.org/timer;1"]
                                .createInstance(Components.interfaces.nsITimer);
        this.resizePanelTimer.initWithCallback(
                this.resizePanelCallback.bind(this),
            10, Components.interfaces.nsITimer.TYPE_ONE_SHOT);

    }

};

