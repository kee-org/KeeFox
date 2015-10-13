/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
  Copyright 2008-2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This context.js file contains functions and data related to the displaying popup menus.
  
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

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://kfmod/kfDataModel.js");

keefox_win.context = {

    _observerService : null,

    construct : function (currentWindow) {
        this._currentWindow = currentWindow;

        this._observerService = Components.classes["@mozilla.org/observer-service;1"]
                    .getService(Components.interfaces.nsIObserverService);
        
        currentWindow.messageManager.addMessageListener(
            "keefox:matchedLoginsChanged", this.matchedLoginsChangedListener);

    },

    // Listen for notifications that we've decided on a new list of new matched logins
    // and forward them to other interested observers in the main chrome process
    matchedLoginsChangedListener: function (message) {
        keefox_win.Logger.debug("context matchedLoginsChangedListener called");
        // Make sure we only process messages from the currently displayed tab
        if (message.target === window.gBrowser.selectedBrowser)
            keefox_win.context.setLoginsContext(message.data.logins, message.data.notifyUserOnSuccess);
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

    setLoginsContext: function (logins) {
        keefox_win.Logger.debug("setLoginsContext started");

        // Get the container that we want to add our matched logins to.
        var container = this._currentWindow.document.getElementById("keefox-command-context-fillMatchedLogin");
        if (container === undefined || container == null)
            return;
        
        if (logins == null || logins.length == 0) {
            this.removeLogins();
            return;
        }

        logins.sort(this.compareRelevanceScores);

        keefox_win.Logger.debug("setting " + logins.length + " matched logins");

        // find a popup menu to hold the overflow logins
        var menupopup = this._currentWindow.document.getElementById("keefox-command-context-showMenuMatchedLogins-popup");

        let loginsHaveBeenChanged = keefox_win.mainUI.checkAllMatchedLoginsForChanges(logins, container, menupopup);

        if (!loginsHaveBeenChanged) {
            keefox_win.Logger.debug("setLoginsContext found no changes");
            return;
        }

        this.removeLogins();

        this.setLoginsAllMatches(logins, container, menupopup);

        keefox_win.Logger.debug(logins.length + " matched context logins set!");
    },

    // add all matched logins to the menu
    setLoginsAllMatches: function (logins, container, menupopup) {
        keefox_win.Logger.debug("context setLoginsAllMatches started");

        // set up the main button
        container.setAttribute("class", "login-found");
        container.setAttribute("disabled", "false");

        // add every matched login to the container and popup menu
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

            var tempButton = i == 0 ? 
                                    container : 
                                    this._currentWindow.document.createElement("menuitem");
            tempButton.setAttribute("label", keefox_org.locale.$STRF("matchedLogin.label"
                , [usernameDisplayValue, login.title]));
            tempButton.setAttribute("class", "menuitem-iconic");
            tempButton.setAttribute("image", "data:image/png;base64," + login.iconImageData);
            tempButton.setAttribute('data-uuid', login.uniqueID, null);
            tempButton.setAttribute('data-fileName', login.database.fileName, null);
            tempButton.setAttribute("context",
                i == 0 ? "KeeFox-login-toolbar-context" : "KeeFox-login-context");
            tempButton.setAttribute("tooltiptext", keefox_org.locale.$STRF("matchedLogin.tip"
                , [login.title, displayGroupPath, usernameDisplayValue]));

            // Record the unique address to the details of this login as stored in the content scope
            tempButton.setAttribute('data-frameKey', login.frameKey);
            tempButton.setAttribute('data-formIndex', login.formIndex);
            tempButton.setAttribute('data-loginIndex', login.loginIndex);
            
            // Not needed for i == 0 because the KeeFox commands.js module manages
            // the visibility and execution of that command via the entry added to the main UI panel
            if (i > 0) {
                tempButton.addEventListener("command", this.mainButtonCommandMatchHandler, false);
                menupopup.appendChild(tempButton);
            }
        }
    },

    mainButtonCommandMatchHandler: function (event) {
        keefox_win.fillAndSubmit(false,
            this.hasAttribute('data-frameKey') ? this.getAttribute('data-frameKey') : null,
            this.hasAttribute('data-formIndex') ? this.getAttribute('data-formIndex') : null,
            this.hasAttribute('data-loginIndex') ? this.getAttribute('data-loginIndex') : null
        );
        event.stopPropagation();
    }

};


