/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
  Copyright 2008-2010 Chris Tomlinson <keefox@christomlinson.name>
  
  This KFToolBar.js file contains functions and data related to the visible
  toolbar buttons that kefox.xul defines. It also contains some other related
  functions such as displaying popup menus and serves as a known access
  point for a given window's KeeFox features.
  
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
"use non-strict";

let Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://kfmod/kfDataModel.js");

keefox_win.toolbar = {
    construct : function (currentWindow) {
        this._currentWindow = currentWindow;

        // Lock menu updates when menu is visible
        var container = this._currentWindow.document.getElementById("KeeFox_Main-Button");
        if (container != undefined && container != null) {
            container.addEventListener("popupshowing", function (event) {
                this.setAttribute('KFLock', 'enabled');
            }, false);  //AET: OK
            container.addEventListener("popuphiding", function (event) {
                this.setAttribute('KFLock', 'disabled');
            }, false); //AET: OK

        }
    },
    _currentWindow: null,

    shutdown: function () {
        var container = this._currentWindow.document.getElementById("KeeFox_Main-Button");
        if (container != undefined || container != null)
            container.setAttribute("disabled", "true");
        container = this._currentWindow.document.getElementById("KeeFox_Logins-Button");
        if (container != undefined || container != null)
            container.setAttribute("disabled", "true");
        container = this._currentWindow.document.getElementById("KeeFox_Menu-Button");
        if (container != undefined || container != null)
            container.setAttribute("disabled", "true");


    },

    // remove matched logins from the menu
    removeLogins: function () {
        // Get the toolbaritem "container" that we added to our XUL markup
        var container = this._currentWindow.document.getElementById("KeeFox_Main-Button");
        if (container === undefined || container == null)
            return;

        // Remove all of the existing buttons
        for (var i = container.childNodes.length; i > 0; i--) {
            container.removeChild(container.childNodes[0]);
        }
        this.setupButton_ready(null, this._currentWindow);
    },

    compareRelevanceScores: function (a, b) {
        return b.relevanceScore - a.relevanceScore;
    },

    // add all matched logins to the menu
    setLogins: function (logins, doc) {
        keefox_win.Logger.debug("setLogins started");
        // Get the toolbaritem "container" that we added to our XUL markup
        var container = this._currentWindow.document.getElementById("KeeFox_Main-Button");
        if (container === undefined || container == null)
            return;

        // if the matched logins container is locked (becuase it's currently open) we don't
        // make any changes. In future, maybe we could delay the change rather than
        // completely ignore it but for now, the frequent "dynamic form polling"
        // feature will ensure a minimal wait for update once the lock is released.
        if (container.getAttribute('KFLock') == "enabled")
            return;

        if (logins == null || logins.length == 0) {
            this.setupButton_ready(null, this._currentWindow);
            return;
        } else {
            this.removeNonMatchingEventHandlers(container);
        }
        this.removeMatchingEventHandlers(container);

        logins.sort(this.compareRelevanceScores);

        // set up the main button
        container.setAttribute("class", "login-found");
        container.setAttribute("disabled", "false");

        var merging = true;
        // find or create a popup menu to hold the logins
        var menupopup = this._currentWindow.document.getElementById("KeeFox_Main-ButtonPopup");
        if (menupopup == undefined || menupopup == null) {
            menupopup = this._currentWindow.document.createElement("menupopup");
            menupopup.id = "KeeFox_Main-ButtonPopup";
            merging = false;
        }

        if (merging)
            keefox_win.Logger.debug("merging " + logins.length + " toolbar logins");
        else
            keefox_win.Logger.debug("setting " + logins.length + " toolbar logins");

        // add every matched login to the popup menu
        for (let i = 0; i < logins.length; i++) {
            var login = logins[i];
            var usernameValue = "";
            var usernameDisplayValue = "[" + keefox_org.locale.$STR("noUsername.partial-tip") + "]";
            var usernameName = "";
            var usernameId = "";
            var displayGroupPath = login.database.name + '/' + login.parentGroup.path;
            //            var groupDivider = this.strbundle.getString("groupDividerCharacter");
            //            if (groupDivider != ".")
            //                displayGroupPath = displayGroupPath.replace(/\./g,groupDivider);

            if (login.usernameIndex != null && login.usernameIndex != undefined && login.usernameIndex >= 0
                && login.otherFields != null && login.otherFields.length > 0) {
                var field = login.otherFields[login.usernameIndex];

                usernameValue = field.value;
                if (usernameValue != undefined && usernameValue != null && usernameValue != "")
                    usernameDisplayValue = usernameValue;
                usernameName = field.name;
                usernameId = field.fieldId;
            }

            if (!merging && i == 0) // we don't re-assess which shoudl be the primary button action upon merging results from multiple frames (or duplicates of the same frame in the case of initial login where KeePass sends too many notifications)
            {
                container.setAttribute("label", keefox_org.locale.$STRF("matchedLogin.label", [usernameDisplayValue, login.title]));
                container.setAttribute('uuid', login.uniqueID, null);
                container.setAttribute('fileName', login.database.fileName, null);
                //container.setAttribute("login", login, null);
                container.setAttribute("context", "KeeFox-login-toolbar-context");
                container.setAttribute("tooltiptext", keefox_org.locale.$STRF("matchedLogin.tip", [login.title, displayGroupPath, usernameDisplayValue]));
                //container.setAttribute("oncommand", "keefox_win.ILM.fill('" +
                //    usernameName + "','" + usernameValue + "','" + login.formActionURL + "','" + usernameId + "',null,'" + login.uniqueID + "','" + doc.documentURI + "'); event.stopPropagation();");
                container.setAttribute('usernameName', usernameName);
                container.setAttribute('usernameValue', usernameValue);
                container.setAttribute('formActionURL', login.formActionURL);
                container.setAttribute('usernameId', usernameId);
                container.setAttribute('documentURI', doc.documentURI);
                container.addEventListener("command", this.mainButtonCommandMatchHandler, false);

                container.setAttribute("class", "menuitem-iconic");
                container.setAttribute("image", "data:image/png;base64," + login.iconImageData);
            } else if (i == 0)
            {
                // re-establish the event listener we deleted at the start of the function
                container.addEventListener("command", this.mainButtonCommandMatchHandler, false);
            }

            var addLoginToPopup = (logins.length > 1);
            if (merging && addLoginToPopup) {
                // find any existing item in the popup menu
                if (menupopup.childElementCount > 0) {
                    for (let j = 0, n = menupopup.children.length; j < n; j++) {
                        var child = menupopup.children[j];
                        valAttr = child.hasAttribute('uuid') ? child.getAttribute('uuid') : null;
                        if (valAttr == login.uniqueID) {
                            addLoginToPopup = false;
                            break;
                        }
                    }
                }
            }

            if (addLoginToPopup) {
                var tempButton = null;
                tempButton = this._currentWindow.document.createElement("menuitem");
                tempButton.setAttribute("label", keefox_org.locale.$STRF("matchedLogin.label", [usernameDisplayValue, login.title]));
                tempButton.setAttribute("class", "menuitem-iconic");
                tempButton.setAttribute("image", "data:image/png;base64," + login.iconImageData);
                tempButton.setAttribute('uuid', login.uniqueID, null);
                tempButton.setAttribute('fileName', login.database.fileName, null);
                //tempButton.setAttribute("login", login, null);
                tempButton.setAttribute("context", "KeeFox-login-context");
                tempButton.setAttribute("tooltiptext", keefox_org.locale.$STRF("matchedLogin.tip", [login.title, displayGroupPath, usernameDisplayValue]));

                tempButton.setAttribute('usernameName', usernameName);
                tempButton.setAttribute('usernameValue', usernameValue);
                tempButton.setAttribute('formActionURL', login.formActionURL);
                tempButton.setAttribute('usernameId', usernameId);
                tempButton.setAttribute('documentURI', doc.documentURI);
                tempButton.addEventListener("command", this.mainButtonCommandMatchHandler, false);
                menupopup.appendChild(tempButton);
            }
        }

        if (!merging && logins.length > 1) {
            container.setAttribute("type", "menu-button");
            container.appendChild(menupopup);
        }

        if (merging)
            keefox_win.Logger.debug(logins.length + " toolbar logins merged!");
        else
            keefox_win.Logger.debug(logins.length + " toolbar logins set!");
    },

    // populate the "all logins" menu with every login in this database
    setAllLogins: function () {
        keefox_win.Logger.debug("setAllLogins start");

        var loginButton = this._currentWindow.document.getElementById("KeeFox_Logins-Button");
        if (loginButton === undefined || loginButton == null)
            return;
            
        // get and reset the popup menu for the complete list of logins
        var container = this._currentWindow.document.getElementById("KeeFox_Logins-Button-root");
        if (container === undefined || container == null)
            return;
            
        // Remove all of the existing buttons
        for (i = container.childNodes.length; i > 0; i--)
            container.removeChild(container.childNodes[0]);
            
        if (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false)) {
            // start with the current root group uniqueID
            try {
                if (!window.keefox_org._keeFoxExtension.prefs.getValue("listAllOpenDBs",false))
                {
                    var rootGroup = keefox_org.KeePassDatabases[keefox_org.ActiveKeePassDatabaseIndex].root;
                    if (rootGroup != null && rootGroup != undefined && rootGroup.uniqueID)
                    {
                        var dbFileName = keefox_org.KeePassDatabases[keefox_org.ActiveKeePassDatabaseIndex].fileName;
                        this.setOneLoginsMenu(container, rootGroup, dbFileName);
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
                                var dbName = keefox_org.KeePassDatabases[i].name;
                                
                                var newMenu = null;
                                newMenu = this._currentWindow.document.createElement("menu");
                                newMenu.setAttribute("label", dbName + ' / ' + rootGroup.title);
                                newMenu.setAttribute("tooltiptext", keefox_org.locale.$STR("loginsButtonGroup.tip"));
                                newMenu.setAttribute("class", "menu-iconic");
                                //newMenu.setAttribute("value", rootGroup.uniqueID);
                                newMenu.setAttribute('uuid', rootGroup.uniqueID, null);
                                newMenu.setAttribute('fileName', dbFileName, null);
                                newMenu.setAttribute("context", "KeeFox-group-context");
                                newMenu.setAttribute("image", "data:image/png;base64,"+rootGroup.iconImageData);
                                container.appendChild(newMenu);
                                
                                var newMenuPopup = null;
                                newMenuPopup = this._currentWindow.document.createElement("menupopup");
                                newMenuPopup.setAttribute("id", "KeeFox_Group-" + rootGroup.uniqueID);
                                this.setOneLoginsMenu(newMenuPopup,rootGroup, dbFileName);
                                newMenu.appendChild(newMenuPopup);
                            } else
                            {
                                this.setOneLoginsMenu(container, rootGroup, dbFileName);
                            }
                        }
                    }
                }
            } catch (e) {
                keefox_win.Logger.error("setAllLogins exception: " + e);
                return;
            }
            loginButton.setAttribute("disabled", "false");
        } else {
            loginButton.setAttribute("disabled", "true");
        }
        keefox_win.Logger.debug("setAllLogins end");
        return;
    },

    // add all the logins and subgroups for one KeePass group
    setOneLoginsMenu: function(container, group, dbFileName)
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
            var noItemsButton = null;
            noItemsButton = this._currentWindow.document.createElement("menuitem");
            noItemsButton.setAttribute("label", keefox_org.locale.$STR("loginsButtonEmpty.label"));
            noItemsButton.setAttribute("disabled", "true");
            noItemsButton.setAttribute("tooltiptext", keefox_org.locale.$STR("loginsButtonEmpty.tip"));
            container.appendChild(noItemsButton);
            return;
        }
        //keefox_win.Logger.debug("logb");
        for (var i = 0; i < foundGroups.length; i++) {
            var group = foundGroups[i];

            // maybe this duplicated oncommand, etc. is un-needed?
            var newMenu = null;
            newMenu = this._currentWindow.document.createElement("menu");
            newMenu.setAttribute("label", group.title);
            newMenu.setAttribute("tooltiptext", keefox_org.locale.$STR("loginsButtonGroup.tip"));
            newMenu.setAttribute("class", "menu-iconic");
            newMenu.setAttribute('uuid', group.uniqueID, null);
            newMenu.setAttribute('fileName', dbFileName, null);
            newMenu.setAttribute("context", "KeeFox-group-context");
            //newMenu.setAttribute("image", "chrome://mozapps/skin/passwordmgr/key.png");
            newMenu.setAttribute("image", "data:image/png;base64," + group.iconImageData);
            container.appendChild(newMenu);

            var newMenuPopup = null;
            newMenuPopup = this._currentWindow.document.createElement("menupopup");
            newMenuPopup.setAttribute("id", "KeeFox_Group-" + group.uniqueID);
            this.setOneLoginsMenu(newMenuPopup,group,dbFileName);
            newMenu.appendChild(newMenuPopup);

        }
        //keefox_win.Logger.debug("logc");
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

            var tempButton = null;
            tempButton = this._currentWindow.document.createElement("menuitem");
            tempButton.setAttribute("label", login.title);
            tempButton.setAttribute("tooltiptext", keefox_org.locale.$STRF(
                "loginsButtonLogin.tip", [login.uRLs[0], usernameDisplayValue]));
            tempButton.addEventListener("command", function (event) { keefox_win.ILM.loadAndAutoSubmit(0, event.ctrlKey, this.getAttribute('usernameName'), this.getAttribute('usernameValue'), this.getAttribute('url'), null, null, this.getAttribute('uuid'), this.getAttribute('fileName')); event.stopPropagation(); }, false); //ael: works
            tempButton.addEventListener("click", function (event) { if (event.button == 1) { keefox_win.ILM.loadAndAutoSubmit(event.button, event.ctrlKey, this.getAttribute('usernameName'), this.getAttribute('usernameValue'), this.getAttribute('url'), null, null, this.getAttribute('uuid'), this.getAttribute('fileName')); event.stopPropagation(); keefox_win.UI.closeMenus(event.target); } }, false); //ael: works

            tempButton.setAttribute("class", "menuitem-iconic");
            tempButton.setAttribute('fileName', dbFileName, null);
            tempButton.setAttribute("context", "KeeFox-login-context");
            tempButton.setAttribute("image", "data:image/png;base64," + login.iconImageData);
            tempButton.setAttribute("uuid", login.uniqueID);
            tempButton.setAttribute("usernameName", usernameName);
            tempButton.setAttribute("usernameValue", usernameValue);
            tempButton.setAttribute("url", login.uRLs[0]);

            container.appendChild(tempButton);
        }
    },

    setupButton_install: function (targetWindow) {
        keefox_win.Logger.debug("setupButton_install start");
        var mainWindow = targetWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);

        mainButton = mainWindow.document.getElementById("KeeFox_Main-Button");
        if (mainButton === undefined || mainButton == null)
            return;

        // Remove all of the existing buttons
        for (var i = mainButton.childNodes.length; i > 0; i--) {
            mainButton.removeChild(mainButton.childNodes[0]);
        }
        mainButton.setAttribute("class", "");
        mainButton.removeAttribute("type");
        mainButton.setAttribute("label", keefox_org.locale.$STR("installKeeFox.label"));
        mainButton.setAttribute("disabled", "false");
        mainButton.setAttribute("tooltiptext", keefox_org.locale.$STR("installKeeFox.tip"));
        this.removeNonMatchingEventHandlers(mainButton);
        this.removeMatchingEventHandlers(mainButton);
        mainButton.addEventListener("command", this.mainButtonCommandInstallHandler, false);
    },

    // I think this will gradually become a generic "update toolbar status" method sicne it makes more sense to
    // decide what state the toolbar needs to show when this function is executing rather than calling
    // one of many different ones from other locations
    setupButton_ready: function (targetWindow, mainWindowIN) {
        keefox_win.Logger.debug("setupButton_ready start");
        var mainButton;
        var mainWindow;

        if (mainWindowIN != null)
            mainWindow = mainWindowIN;
        else {
            mainWindow = targetWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);
        }

        mainButton = mainWindow.document.getElementById("KeeFox_Main-Button");
        if (mainButton === undefined || mainButton == null)
            return;

        mainButton.setAttribute("disabled", "false");
        // Remove all of the existing buttons
        for (var i = mainButton.childNodes.length; i > 0; i--) {
            mainButton.removeChild(mainButton.childNodes[0]);
        }
        mainButton.setAttribute("class", "");
        mainButton.removeAttribute("type");
        mainButton.removeAttribute("image");

        this.removeNonMatchingEventHandlers(mainButton);
        this.removeMatchingEventHandlers(mainButton);

        // apparently this (And other IDs) are not always available (e.g. when buttons are removed from all toolbars)
        var changeDBButton = mainWindow.document.getElementById("KeeFox_ChangeDB-Button");
        var generatePasswordButton = mainWindow.document.getElementById("KeeFox_CopyNewPasswordToClipboard-Button");

        if (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false)) {

            //var DBname = mainWindow.keefox_org.getDatabaseName();
            //if (DBname === null)
            //    return; // KeePassRPC suddenly dissapeared - toolbar will have been updated from deeper in the stack? maybe not since removal of ICE?

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
                return;
            }

            mainButton.setAttribute("label", keefox_org.locale.$STR("loggedIn.label"));
            mainButton.setAttribute("tooltiptext", loggedInText);
            mainButton.setAttribute("disabled", "true");
        } else if (!keefox_org._keeFoxStorage.get("KeePassRPCInstalled", false)) {
            mainButton.setAttribute("label", keefox_org.locale.$STR("installKeeFox.label"));
            mainButton.setAttribute("tooltiptext", keefox_org.locale.$STR("installKeeFox.tip"));
            mainButton.addEventListener("command", this.mainButtonCommandInstallHandler, false);
        } else if (!keefox_org._keeFoxStorage.get("KeePassRPCActive", false)) {
            mainButton.setAttribute("label", keefox_org.locale.$STR("launchKeePass.label"));
            mainButton.setAttribute("tooltiptext", keefox_org.locale.$STR("launchKeePass.tip"));
            mainButton.addEventListener("command", this.mainButtonCommandLaunchKPHandler, false);
        } else {
            mainButton.setAttribute("label", keefox_org.locale.$STR("loggedOut.label"));
            mainButton.setAttribute("tooltiptext", keefox_org.locale.$STR("loggedOut.tip"));
            mainButton.addEventListener("command", this.mainButtonCommandLoginKPHandler, false);
        }


        if (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false) || keefox_org._keeFoxStorage.get("KeePassRPCActive", false)) {
            if (changeDBButton !== undefined && changeDBButton != null) {
                changeDBButton.setAttribute("label", keefox_org.locale.$STR("changeDBButton.label"));
                changeDBButton.setAttribute("tooltiptext", keefox_org.locale.$STR("changeDBButton.tip"));
                changeDBButton.removeEventListener("popupshowing", this.setMRUdatabases, false);
                changeDBButton.addEventListener("popupshowing", this.setMRUdatabases, false);  //AET: OK; but remove event listeners for memory?
                changeDBButton.setAttribute("disabled", "false");
            }
            //TODO1.3: make generate password popupshowing event do something useful or remove it
            if (generatePasswordButton !== undefined && generatePasswordButton != null) {
                generatePasswordButton.addEventListener("popupshowing", function (event) { keefox_win.toolbar.generatePassword(); event.stopPropagation(); }, false);  //AET: OK; but remove event listeners for memory?
                generatePasswordButton.setAttribute("disabled", "false");
            }
        } else {
            if (changeDBButton !== undefined && changeDBButton != null) {
                changeDBButton.setAttribute("label", keefox_org.locale.$STR("changeDBButtonDisabled.label"));
                changeDBButton.setAttribute("tooltiptext", keefox_org.locale.$STR("changeDBButtonDisabled.tip"));
                //changeDBButton.setAttribute("onpopupshowing", "");
                //changeDBButton.addEventListener("popupshowing", function (event) { return; }, false);  //AET: OK; but remove event listeners for memory?
                changeDBButton.setAttribute("disabled", "true");
            }
            if (generatePasswordButton !== undefined && generatePasswordButton != null) {
                //generatePasswordButton.setAttribute("label", this.strbundle.getString("changeDBButtonDisabled.label"));
                //generatePasswordButton.setAttribute("tooltiptext", this.strbundle.getString("changeDBButtonDisabled.tip") );
                //generatePasswordButton.setAttribute("onpopupshowing", "");
                generatePasswordButton.addEventListener("popupshowing", function (event) { return; }, false);  //AET: OK; but remove event listeners for memory?
                generatePasswordButton.setAttribute("disabled", "true");
            }
        }
        keefox_win.Logger.debug("setupButton_ready end");
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

        theWindow.setTimeout(keefox_win.toolbar.flashItem, 600 - (numberOfTimes * 40), flashyItem, numberOfTimes - 1, theWindow);
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

        var popupContainer = keefox_win.toolbar._currentWindow.document.getElementById("KeeFox_ChangeDB-Popup");
        if (popupContainer === undefined || popupContainer == null)
            return;

        // Remove all of the existing buttons
        for (var i = popupContainer.childNodes.length; i > 0; i--) {
            popupContainer.removeChild(popupContainer.childNodes[0]);
        }

        // Set up a loading message while we wait
        var noItemsButton = null;
        noItemsButton = keefox_win.toolbar._currentWindow.document.createElement("menuitem");
        noItemsButton.setAttribute("label", keefox_org.locale.$STR("loading") + '...');
        noItemsButton.setAttribute("disabled", "true");
        popupContainer.appendChild(noItemsButton);

        // calls setMRUdatabasesCallback after KeePassRPC responds
        keefox_win.toolbar._currentWindow.keefox_org.getAllDatabaseFileNames();
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

    // wipe any session data relating to saving login forms that we
    // have associated with the most recent tab.
    clearTabFormRecordingData: function () {
        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
            .getService(Components.interfaces.nsISessionStore);
        var currentGBrowser = this._currentWindow.gBrowser;
        var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];

        var currentPage = ss.getTabValue(currentTab, "KF_recordFormCurrentPage");

        if (currentPage != undefined && currentPage != null && currentPage != "") {
            ss.deleteTabValue(currentTab, "KF_recordFormCurrentPage");
        }

        var currentStateJSON = ss.getTabValue(currentTab, "KF_recordFormCurrentStateJSON");

        if (currentStateJSON != undefined && currentStateJSON != null && currentStateJSON != "") {
            ss.deleteTabValue(currentTab, "KF_recordFormCurrentStateJSON");
        }

    },

    // prepare the most recent tab for recording a login procedure
    setTabFormRecordingData: function () {

        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
            .getService(Components.interfaces.nsISessionStore);
        var currentGBrowser = this._currentWindow.gBrowser;
        var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];

        //this.log(currentGBrowser.mTabs.selectedIndex);
        var currentPage = ss.getTabValue(currentTab, "KF_recordFormCurrentPage");

        if (currentPage == undefined || currentPage == null) {
            currentPage = 0; // or 1?
        }

        ss.setTabValue(currentTab, "KF_recordFormCurrentPage", currentPage + 1);

    },

    // wipe any session data relating to filling login forms that we
    // have associated with the most recent tab.
    clearTabFormFillData: function () {
        keefox_win.Logger.debug("clearTabFormFillData start");
        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
            .getService(Components.interfaces.nsISessionStore);
        var currentGBrowser = this._currentWindow.gBrowser;
        var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];

        var autoSubmit = ss.getTabValue(currentTab, "KF_autoSubmit");

        if (autoSubmit != undefined && autoSubmit != null && autoSubmit != "") {
            ss.deleteTabValue(currentTab, "KF_autoSubmit");
        }

        var uniqueID = ss.getTabValue(currentTab, "KF_uniqueID");

        if (uniqueID != undefined && uniqueID != null && uniqueID != "") {
            ss.deleteTabValue(currentTab, "KF_uniqueID");
        }

        var dbFileName = ss.getTabValue(currentTab, "KF_dbFileName");

        if (dbFileName != undefined && dbFileName != null && dbFileName != "")
        {
            ss.deleteTabValue(currentTab, "KF_dbFileName");
        }
        
        var numberOfTabFillsTarget = ss.getTabValue(currentTab, "KF_numberOfTabFillsTarget");

        if (numberOfTabFillsTarget != undefined && numberOfTabFillsTarget != null && numberOfTabFillsTarget != "") {
            ss.deleteTabValue(currentTab, "KF_numberOfTabFillsTarget");
        }

        var numberOfTabFillsRemaining = ss.getTabValue(currentTab, "KF_numberOfTabFillsRemaining");

        if (numberOfTabFillsRemaining != undefined && numberOfTabFillsRemaining != null && numberOfTabFillsRemaining != "") {
            ss.deleteTabValue(currentTab, "KF_numberOfTabFillsRemaining");
        }


        keefox_win.Logger.debug("clearTabFormFillData end");
    },


    fillCurrentDocument: function () {
        keefox_win.Logger.debug("fillCurrentDocument start");
        var currentGBrowser = this._currentWindow.gBrowser;
        //var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];
        this.setLogins(null, null);
        this._currentWindow.keefox_win.ILM._fillAllFrames(currentGBrowser.selectedBrowser.contentDocument.defaultView, false);
    },

    generatePassword: function () {
        this._currentWindow.keefox_org.generatePassword();
    },

    removeNonMatchingEventHandlers: function (node) {
        // only one should be set but we don't know which one so try to remove all
        node.removeEventListener("command", this.mainButtonCommandInstallHandler, false);
        node.removeEventListener("command", this.mainButtonCommandLaunchKPHandler, false);
        node.removeEventListener("command", this.mainButtonCommandLoginKPHandler, false);
    },

    removeMatchingEventHandlers: function (node) {
        node.removeEventListener("command", this.mainButtonCommandMatchHandler, false);
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

    mainButtonCommandMatchHandler: function (event) {
        keefox_win.ILM.fill(
            this.hasAttribute('usernameName') ? this.getAttribute('usernameName') : null,
            this.hasAttribute('usernameValue') ? this.getAttribute('usernameValue') : null,
            this.hasAttribute('formActionURL') ? this.getAttribute('formActionURL') : null,
            this.hasAttribute('usernameId') ? this.getAttribute('usernameId') : null,
            this.hasAttribute('formId') ? this.getAttribute('formId') : null,
            this.hasAttribute('uuid') ? this.getAttribute('uuid') : null,
            this.hasAttribute('documentURI') ? this.getAttribute('documentURI') : null,
            this.hasAttribute('fileName') ? this.getAttribute('fileName') : null
        );
        event.stopPropagation();
    }

};


