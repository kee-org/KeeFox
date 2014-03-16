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

    construct : function (currentWindow) {
        this._currentWindow = currentWindow;

        try
        {
            // Get or create the main KeeFox widget (it's shared across windows)
            Components.utils.import("resource:///modules/CustomizableUI.jsm");
            let wrapperGroup = CustomizableUI.getWidget('keefox-toolbarbutton');
            if (wrapperGroup == null)
            {
                wrapperGroup = CustomizableUI.createWidget({
                    id: "keefox-toolbarbutton",
                    type:"view",
                    viewId:"keefox-viewpanel",
                    defaultArea: "nav-bar",
                    removable: true,
                    label: "KeeFox",
                    tooltiptext: "KeeFox",
                    onClick: function()
                    {
                        //TODO: track cumulative interaction metrics here?
                        //alert("Clicked2");
                    }
                    //onViewShowing - do some init or localisation checks in here?
                });
            }
            this._widget = wrapperGroup.forWindow(this._currentWindow);
        }
        catch (e)
        {
            // We only create the panel in FF > Australis so should be able to rely on it working... but just in case...
            keefox_win.Logger.error("Failed to create KeeFox widget because: " + e);
        }

        this.buildPanel();

        // Lock menu updates when menu is visible
        //TODO: container will need to be changed, probably after creating the basic panel in this constructor (attach the viewpanel to that list of view panels and then create the widget... need to find out how to do that in a way that respects user's previous choice of where the widget goes... might happen automatically?)
        var container = this._currentWindow.document.getElementById("KeeFox_Main-Button");
        if (container != undefined && container != null) {
            container.addEventListener("popupshowing", function (event) {
                this.setAttribute('KFLock', 'enabled');
            }, false);
            container.addEventListener("popuphiding", function (event) {
                this.setAttribute('KFLock', 'disabled');
            }, false);

        }
        this._observerService = Components.classes["@mozilla.org/observer-service;1"]
                    .getService(Components.interfaces.nsIObserverService);
        this._observerService.addObserver(this,"keefox_matchedLoginsChanged",false);

    },

    observe: function (aSubject, aTopic, aData)
    {
        if (aTopic == "keefox_matchedLoginsChanged")
        {
            //keefox_win.Logger.debug("observed");
            this.setLogins(aSubject.wrappedJSObject.logins, aSubject.wrappedJSObject.uri);
        }
    },

    _currentWindow: null,

    shutdown: function () { },

    buildPanel: function () {
        let panelview = this._currentWindow.document.createElement('panelview');
        panelview.id = 'keefox-viewpanel';
        //panelview.className = 'testClass';
        
        this.populatePanel(panelview);

        // Inject our panel view into the multiView panel
        let multiview = this._currentWindow.document.getElementById('PanelUI-multiView');
        multiview.appendChild(panelview);
    },
    
    populatePanel: function (panel) {
        let closure = this;
        // starting with each main component in a div with a button to invoke the main
        // action. After some design work, I expect this will look significantly different
        
        //TODO: Lots of default disabling going on here. Probably want to consolidate to a seperate function

        // May contain optional extra text at some point but basically this replicates the functionaility of the main toolbar button from previous versions so we have something to click on to setup, launch KeePass, etc.
        let status = this.createPanelSection(
            'KeeFox-PanelSection-status',
            null,
            'whatever'
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
            'whatever'
        );
//        let subPanelCloserTextContainer = this.createUIElement('div', [
//            ['id','KeeFox-PanelSection-close-text']
//        ]);
//        subPanelCloser.insertBefore(subPanelCloserTextContainer,subPanelCloser.lastChild);
        
        

        // For some reason it's impossible to focus on this box when first opening the panel through the javascript below. manually clicking on it seems to work fine though so we can live with that bug at least for the time being
        //TODO: change to div panel containing input field
        let searchBox = this.createUIElement('input', [
            ['class','KeeFox-Search'],
            ['id','KeeFox-PanelSection-search'],
            ['type','text'],
            ['value','Search...'],
            ['title','Do a search']
        ]);
        
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
            ['class','KeeFox-PanelSubSection KeeFox-LoginList enabled'],
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
        this.disableUIElement('KeeFox-PanelSection-allLogins-main-action');
        let allLoginsListContainer = this.createUIElement('div', [
            ['class','KeeFox-PanelSubSection KeeFox-LoginList enabled'],
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
            ['id','KeeFox-PasswordProfileList']
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
            ['id','KeeFox-DatabaseList']
        ]);
        changeDatabase.appendChild(changeDatabaseListContainer);
        
        
        let detectForms = this.createPanelSection(
            'KeeFox-PanelSection-detectForms', 
            function () { keefox_win.UI.fillCurrentDocument(); },
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
            function () { keefox_org.utils._openAndReuseOneTabPerURL('http://keefox.org/help'); 
                         //TODO: close panel
                        },
            'KeeFox_Help-Centre-Button'
        );
        
        //var element3 = this.createUIElement('hr',[]);
        panel.appendChild(status);
        panel.appendChild(subPanelCloser);
        panel.appendChild(searchBox);
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
        //TODO: onCommand instead of onClick so Keyboard nav works (assuming australis supports this)
        if (onCommand)
            button.addEventListener("click", onCommand, false);
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
        elem.classList.add('enabled');
        elem.classList.remove('disabled');
    },
    disableUIElement: function (id)
    {
    //return;
        let elem = this._currentWindow.document.getElementById(id);
        if (!elem)
            return;
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
        let elem = this._currentWindow.document.getElementById('keefox-viewpanel');
        elem.classList.remove('subpanel-enabled');
        let toHide = elem.getElementsByClassName('enabled KeeFox-PanelSubSection');
        for (let i=0; i<toHide.length; i++)
            toHide[i].classList.remove('enabled');
    },

    showSubSection: function (id)
    {
        enableUIElement(id);
        let elem = this._currentWindow.document.getElementById('keefox-viewpanel');
        elem.classList.add('subpanel-enabled');
    },
    
    showSubSectionMatchedLogins: function ()
    {
        this.showSubSection('KeeFox-SubSection-matchedLogins');
    },
    
    showSubSectionAllLogins: function ()
    {
        this.showSubSection('KeeFox-SubSection-allLogins');
    },
    
    showSubSectionGeneratePassword: function ()
    {
        this.generatePassword();
        //TODO: Immediately fire a generate password request using the most recent profile (& update growl message?)
        // we might not have time to implement this for v1.4: this.showSubSection('KeeFox-SubSection-generatePassword');
    },
    
    showSubSectionChangeDatabase: function ()
    {
        //TODO: Show spinner, fire off usual KPRPC request and update the callback code to ensure the results get put into a new subpanel rather than a submenu
        let dbcontainer = this._currentWindow.document.getElementById('KeeFox-DatabaseList');
        dbcontainer.spinner = true;
        this.showSubSection('KeeFox-DatabaseList');
    },
    

    // remove matched logins from the menu

    //TODO1.3:?need test case: think this removes the whole popup menu so we don't get the annoying square effect but we need to change it so it is still somewhere in the document. maybe just set to disabled or hidden?
    // actually above may not be problem for toolbar and i think we do it differently for the context menu anyway
    removeLogins: function () {
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

                                let groupItem = this.createGroupItem(rootGroup,dbFileName);
                                groupItem.innerHTML = dbName + ' / ' + rootGroup.title;
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
            noItemsButton.innerHTML = keefox_org.locale.$STR("loginsButtonEmpty.label");

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
                ['class',''],
                ['data-fileName',dbFileName],
                ['data-usernameName',usernameName],
                ['data-usernameValue',usernameValue],
                ['data-url',login.uRLs[0]],
                ['data-uuid',login.uniqueID],
            //    ['id', 'KeeFox_Group-' + rootGroup.uniqueID],
                ['title',keefox_org.locale.$STRF(
                "loginsButtonLogin.tip", [login.uRLs[0], usernameDisplayValue])]
            ]);
            loginItem.innerHTML = login.title;
            
            //tempButton.addEventListener("command", function (event) { keefox_win.ILM.loadAndAutoSubmit(0, event.ctrlKey, this.getAttribute('usernameName'), this.getAttribute('usernameValue'), this.getAttribute('url'), null, null, this.getAttribute('uuid'), this.getAttribute('fileName')); event.stopPropagation(); }, false); //ael: works
            loginItem.addEventListener("click", function (event) {
                keefox_win.Logger.debug("click");
                if (event.button == 1)
                { alert("asfsadf");
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
                    //keefox_win.UI.closeMenus(event.target);
                } 
            },
            false); //ael: works

            //tempButton.setAttribute("class", "menuitem-iconic");
            //tempButton.setAttribute("context", "KeeFox-login-context");
            //tempButton.setAttribute("image", "data:image/png;base64," + login.iconImageData);
            //tempButton.setAttribute("uuid", login.uniqueID);

            // If the combined total of all groups and the current login index exceeds 
            // our allowed number of items in the main panel, we must switch to the overflow container
            if (isTopLevelContainer && (i + foundGroups.length) == keefox_org._keeFoxExtension.prefs.getValue("maxAllLoginsInMainPanel",0))
                container = this.getEmptyContainerFor("KeeFox-PanelSubSection-AllLoginsList-Overflow");
            container.appendChild(loginItem);
        }
    },

    createGroupItem: function (group, dbFileName, extraCSSClasses)
    {
        let groupItem = this.createUIElement('li', [
            ['class',''],
            ['data-fileName',dbFileName],
            ['data-uuid',group.uniqueID],
            //   ['id', 'KeeFox_Group-' + rootGroup.uniqueID],
            ['title',keefox_org.locale.$STR("loginsButtonGroup.tip")]
        ]);
        groupItem.innerHTML = group.title;
            
        //newMenu.setAttribute("context", "KeeFox-group-context");
        //newMenu.setAttribute("image", "data:image/png;base64," + group.iconImageData);
            
            
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
        if (container.getAttribute('KFLock') == "enabled")
            return;

            
        if (logins == null || logins.length == 0) {
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
        
        //TODO: Set icon overlay on main panel widget button icon to say how many matches there were

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
                    ['data-fileName',login.database.fileName],
                    ['data-usernameName',usernameName],
                    ['data-usernameValue',usernameValue],
                    ['data-usernameId',usernameId],
                    ['data-formActionURL',login.formActionURL],
                    ['data-documentURI',documentURI],
                    ['data-uuid',login.uniqueID],
                    ['title',keefox_org.locale.$STRF("matchedLogin.tip", [login.title, displayGroupPath, usernameDisplayValue])]
                ]);
                loginItem.innerHTML = keefox_org.locale.$STRF("matchedLogin.label", [usernameDisplayValue, login.title]);
            
                //loginItem.addEventListener("command", this.mainButtonCommandMatchHandler, false);
                loginItem.addEventListener("click", this.MatchedLoginOnInvokeHandler, false);

                //tempButton.setAttribute("class", "menuitem-iconic");
                //tempButton.setAttribute("context", "KeeFox-login-context");
                //tempButton.setAttribute("image", "data:image/png;base64," + login.iconImageData);
                //tempButton.setAttribute("uuid", login.uniqueID);

                // If we've exceeded our allowed number of items in the main panel, we must switch to the overflow container
                if ((i + mainPanelContainer.childElementCount) >= keefox_org._keeFoxExtension.prefs.getValue("maxMatchedLoginsInMainPanel",5))
                {
                    container = this.getContainerFor("KeeFox-PanelSubSection-AllLoginsList-Overflow");
                    overflowPanelContainer = container;
                }
                container.appendChild(loginItem);
            }


        }
    },

    // Sets the overall widget status including the status panel
    // reports to the user the state of KeeFox and the KeePassRPC connection
    setWidgetStatus: function (enabled, buttonLabel, tooltip, detailedInfo, buttonAction)
    {
        let widgetButton = this._currentWindow.document.getElementById("keefox-toolbarbutton");
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

        // Remove all known possible event handlers
        statusPanelButton.removeEventListener("click", this.mainButtonCommandInstallHandler, false);
        statusPanelButton.removeEventListener("click", this.mainButtonCommandLaunchKPHandler, false);
        statusPanelButton.removeEventListener("click", this.mainButtonCommandLoginKPHandler, false);
//        statusPanelButton.removeEventListener("command", this.mainButtonCommandInstallHandler, false);
//        statusPanelButton.removeEventListener("command", this.mainButtonCommandLaunchKPHandler, false);
//        statusPanelButton.removeEventListener("command", this.mainButtonCommandLoginKPHandler, false);

        if (enabled)
        {
            statusPanel.classList.remove("enabled");
            statusPanel.classList.add("disabled");
            //widgetButton.setAttribute("tooltiptext","KeeFox enabled"); //TODO: widget API?
        } else
        {
            statusPanel.classList.add("enabled");
            statusPanel.classList.remove("disabled");
            //widgetButton.setAttribute("tooltiptext",tooltip); //TODO: widget API?
            statusPanelText.innerHTML = detailedInfo;
            statusPanelButton.setAttribute("value", buttonLabel);
            statusPanelButton.setAttribute("tooltip",tooltip);
            statusPanelButton.addEventListener("click", buttonAction, false);
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
        mainButton = mainWindow.document.getElementById("keefox-toolbarbutton");
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
        }

        keefox_win.Logger.debug("setupButton_ready end");
    },

    detachMRUpopup: function () {
        alert("detach");
        var container = this._currentWindow.document.getElementById("KeeFox_ChangeDB-Button");
        if (container === undefined || container == null)
            return;

        //var popupContainer = this._currentWindow.document.getElementById("KeeFox_ChangeDB-Popup");
        // Remove all of the existing popup containers
        for (var i = container.childNodes.length; i > 0; i--) {
            container.removeChild(container.childNodes[0]);
        }


    },

    setMRUdatabases: function (event) {
        if (event != undefined && event != null)
            event.stopPropagation();

        var popupContainer = keefox_win.mainUI._currentWindow.document.getElementById("KeeFox_ChangeDB-Popup");
        if (popupContainer === undefined || popupContainer == null)
            return;

        // Remove all of the existing buttons
        for (var i = popupContainer.childNodes.length; i > 0; i--) {
            popupContainer.removeChild(popupContainer.childNodes[0]);
        }

        // Set up a loading message while we wait
        var noItemsButton = null;
        noItemsButton = keefox_win.mainUI._currentWindow.document.createElement("menuitem");
        noItemsButton.setAttribute("label", keefox_org.locale.$STR("loading") + '...');
        noItemsButton.setAttribute("disabled", "true");
        popupContainer.appendChild(noItemsButton);

        // calls setMRUdatabasesCallback after KeePassRPC responds
        keefox_win.mainUI._currentWindow.keefox_org.getAllDatabaseFileNames();
    },

    setMRUdatabasesCallback: function (result) {

        var popupContainer = this._currentWindow.document.getElementById("KeeFox_ChangeDB-Popup");
        if (popupContainer === undefined || popupContainer == null)
            return;

        // Remove the loading message
        for (var i = popupContainer.childNodes.length; i > 0; i--) {
            popupContainer.removeChild(popupContainer.childNodes[0]);
        }

        var mruArray = result.knownDatabases;
        if (mruArray == null || mruArray.length == 0) {
            var noItemsButton = null;
            noItemsButton = this._currentWindow.document.createElement("menuitem");
            noItemsButton.setAttribute("label", keefox_org.locale.$STR("changeDBButtonEmpty.label"));
            noItemsButton.setAttribute("disabled", "true");
            noItemsButton.setAttribute("tooltiptext", keefox_org.locale.$STR("changeDBButtonEmpty.tip"));
            popupContainer.appendChild(noItemsButton);
            return;
        } else {

            for (let i = 0; i < mruArray.length; i++) {
                var displayName = mruArray[i];
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

                var tempButton = null;
                tempButton = this._currentWindow.document.createElement("menuitem");
                tempButton.setAttribute("label", displayName);
                tempButton.setAttribute("tooltiptext", keefox_org.locale.$STRF("changeDBButtonListItem.tip", [mruArray[i]]));
                var mruToUse = mruArray[i].replace(/[\\]/g, '\\');
                //tempButton.setAttribute("oncommand", "keefox_org.changeDatabase('" +
                //    mruArray[i].replace(/[\\]/g, '\\\\') + "',false);  event.stopPropagation();");
                tempButton.addEventListener("command", function (event) { keefox_org.changeDatabase(this.getAttribute('mruToUse'), false); event.stopPropagation(); }, false); //AET: OK
                tempButton.setAttribute("class", "menuitem-iconic");
                //tempButton.setAttribute("context", "KeeFox-login-context"); in future this could enable "set to default for this location..." etc. ?
                tempButton.setAttribute("image", "chrome://keefox/skin/KeeLock.png");
                tempButton.setAttribute("mruToUse", mruToUse);

                popupContainer.appendChild(tempButton);
            }
        }

    },












































    generatePassword: function () {
        let kf = this._currentWindow.keefox_org;
        kf.metricsManager.pushEvent ("feature", "generatePassword");
        kf.generatePassword();
    },













































    

    flashItem: function (flashyItem, numberOfTimes, theWindow) {
        if (flashyItem === undefined || flashyItem == null)
            return;

        if (numberOfTimes < 1)
            return;

        if (numberOfTimes % 2 == 1)
            flashyItem.setAttribute("class", "");
        else
            flashyItem.setAttribute("class", "highlight");

        theWindow.setTimeout(keefox_win.mainUI.flashItem, 600 - (numberOfTimes * 40), flashyItem, numberOfTimes - 1, theWindow);
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
        event.stopPropagation();
    }

};


