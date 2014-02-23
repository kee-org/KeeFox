/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
  Copyright 2008-2014 Chris Tomlinson <keefox@christomlinson.name>
  
  This context.js file contains functions and data related to the displaying popup menus.

  It currently duplicates functions from the legacy KFToolbar.js but we'll tidy
  that up as v1.4 and v1.5 progresses (depending on Australis release schedule, etc.)
  
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

keefox_win.context = {

    _observerService : null,

    construct : function (currentWindow) {
        this._currentWindow = currentWindow;

        this._observerService = Components.classes["@mozilla.org/observer-service;1"]
                    .getService(Components.interfaces.nsIObserverService);
        this._observerService.addObserver(this,"keefox_matchedLoginsChanged",false);

    },

    observe: function (aSubject, aTopic, aData)
    {
        if (aTopic == "keefox_matchedLoginsChanged")
        {
            this.setLoginsContext(aSubject.wrappedJSObject.logins, aSubject.wrappedJSObject.uri);
        }
    },

    _currentWindow: null,

    shutdown: function () {
    },

    // remove matched logins from the menu
    removeLogins: function () {

        // get the context menu popup
        var contextPopup = this._currentWindow.document.getElementById("keefox-command-context-showMenuMatchedLogins-popup");
        if (contextPopup === undefined || contextPopup == null)
            return;

        // Remove all of the existing buttons
        // the node list changes as we remove items so we always just get rid of the first one
        for (let i = contextPopup.childNodes.length; i > 0; i--) {
            contextPopup.removeChild(contextPopup.childNodes[0]);
        }
    },

    compareRelevanceScores: function (a, b) {
        return b.relevanceScore - a.relevanceScore;
    },

    
    setLoginsContext: function (logins, documentURI) {
        keefox_win.Logger.debug("setLoginsContext started");

        var container = this._currentWindow.document.getElementById("keefox-command-context-fillMatchedLogin");
        if (container === undefined || container == null)
            return;
            
        if (logins == null || logins.length == 0)
            return;

        logins.sort(this.compareRelevanceScores);
        
        var merging = true;
        // find or create a popup menu to hold the logins
        var menupopup = this._currentWindow.document.getElementById("keefox-command-context-showMenuMatchedLogins-popup");
        if (menupopup.childNodes.length <= 0) {
            //menupopup = this._currentWindow.document.createElement("menupopup");
            //menupopup.id = "KeeFox_Main-ButtonPopup";
            merging = false;
        }
        
        if (merging)
            keefox_win.Logger.debug("merging " + logins.length + " matched logins");
        else
            keefox_win.Logger.debug("setting " + logins.length + " matched logins");

        this.setLoginsTopMatch(logins, documentURI, container, merging);
        this.setLoginsAllMatches(logins, documentURI, menupopup, merging);

        // Only attach the menupopup to the main button if there is more than one matched item
        //TODO1.3:?need test case: change this so it inspects length of popup items (allowing for multiple single matched logins merged together)
//        if (!merging && logins.length > 1) {
//            container.setAttribute("type", "menu-button");
//            container.appendChild(menupopup);
//        }

        if (merging)
            keefox_win.Logger.debug(logins.length + " matched logins merged!");
        else
            keefox_win.Logger.debug(logins.length + " matched logins set!");
    },

    // add all matched logins to the menu
    setLoginsTopMatch: function (logins, documentURI, container, merging) {
        keefox_win.Logger.debug("setLoginsTopMatch started");

        // set up the main button
        container.setAttribute("class", "login-found");
        container.setAttribute("disabled", "false");


        var login = logins[0];
        var usernameValue = "";
        var usernameDisplayValue = "[" + keefox_org.locale.$STR("noUsername.partial-tip") + "]";
        var usernameName = "";
        var usernameId = "";
        var displayGroupPath = login.database.name + '/' + login.parentGroup.path;

        if (login.usernameIndex != null && login.usernameIndex != undefined && login.usernameIndex >= 0
            && login.otherFields != null && login.otherFields.length > 0)
        {
            var field = login.otherFields[login.usernameIndex];

            usernameValue = field.value;
            if (usernameValue != undefined && usernameValue != null && usernameValue != "")
                usernameDisplayValue = usernameValue;
            usernameName = field.name;
            usernameId = field.fieldId;
        }

        if (!merging) // we don't re-assess which shoudl be the primary button action upon merging results from multiple frames (or duplicates of the same frame in the case of initial login where KeePass sends too many notifications)
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
            container.setAttribute('documentURI', documentURI);

            container.setAttribute("class", "menuitem-iconic");
            container.setAttribute("image", "data:image/png;base64," + login.iconImageData);
        }
    },

    // add all matched logins to the menu
    setLoginsAllMatches: function (logins, documentURI, menupopup, merging) {
        keefox_win.Logger.debug("setLoginsAllMatches started");

        // add every matched login to the popup menu
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


            // prepare toolbar menu popup
            var addLoginToPopup = true;
            if (merging && addLoginToPopup) {
                // find any existing item in the popup menu
                if (menupopup.childElementCount > 0) {
                    for (let j = 0, n = menupopup.children.length; j < n; j++) {
                        var child = menupopup.children[j];
                        let valAttr = child.hasAttribute('uuid') ? child.getAttribute('uuid') : null;
                        if (valAttr == login.uniqueID) {
                            addLoginToPopup = false;
                            break;
                        }
                    }
                }
            }


            var tempButton = null;

            //if (addLoginToContextPopup || addLoginToPopup)
            if (addLoginToPopup)
            {
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
                tempButton.setAttribute('documentURI', documentURI);
            }
            
            // attach to toolbar drop down menu (assuming not a duplicate)
            if (addLoginToPopup) {
                tempButton.addEventListener("command", this.mainButtonCommandMatchHandler, false);
                menupopup.appendChild(tempButton);
            }
        }
    }

    /*
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
        node.removeEventListener("command", this.mainButtonCommandMatchHandler, false);
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
    }*/

};


