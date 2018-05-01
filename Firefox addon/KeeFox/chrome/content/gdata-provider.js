/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
Copyright 2008-2013 Chris Tomlinson <keefox@christomlinson.name>

gdata-provider.js
Copyright 2015-2016 David Lechner <david@lechnology.com>

Based on commonDialog.js

Hooks into the browser authentication dialog used by the "Provider for Google
Calendar" extension for Thunderbird.

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

if (!Cc)
    var Cc = Components.classes;
if (!Ci)
    var Ci = Components.interfaces;
if (!Cu)
    var Cu = Components.utils;

Cu.import("resource://kfmod/KF.js");

var keeFoxGDataProviderHelper = {
    scriptLoader : Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
        .getService(Components.interfaces.mozIJSSubScriptLoader),

    __messengerBundle : null, // string bundle for thunderbird l10n
    get _messengerBundle() {    
        if (!this.__messengerBundle) {
            var bunService = Components.classes["@mozilla.org/intl/stringbundle;1"].
                getService(Components.interfaces.nsIStringBundleService);
            this.__messengerBundle = bunService.createBundle(
                "chrome://messenger/locale/messenger.properties");
            if (!this.__messengerBundle)
                throw "Messenger string bundle not present!";
        }        
        return this.__messengerBundle;
    },
    
    __gdataBundle : null, // String bundle for L10N
    get _gdataBundle() {
        if (!this.__gdataBundle) {
            var bunService = Components.classes["@mozilla.org/intl/stringbundle;1"].
                getService(Components.interfaces.nsIStringBundleService);
            this.__gdataBundle = bunService.createBundle(
                "chrome://gdata-provider/locale/gdata.properties");
            if (!this.__gdataBundle)
                throw "GData string bundle not present!";
        }
        return this.__gdataBundle;
    },

    dialogInit : function(e) {
        window.removeEventListener("load", keeFoxGDataProviderHelper.dialogInit);

        // None of the DOM listener functions seem to work on this embedded browser window,
        // so we use a timer to keep trying until the page is loaded.

        try {
            var contentDocument = document.getElementById("requestFrame").contentDocument;
            var emailInput = contentDocument.getElementById("Email");
            var email = emailInput.value
            keeFoxGDataProviderHelper.dialogInit2();
        } catch (exception) {
            window.setTimeout(keeFoxGDataProviderHelper.dialogInit, 100);
        }
    },

    dialogInit2 : function(e) {
        try {
            keeFoxGDataProviderHelper.prepareFill();
        } catch (exception) {
            try {
                keefox_org._KFLog.error(exception);
            } catch (e) {
                // don't want missing keefox.org object to break standard dialogs
            }
        }
    },

    autoFill2 : function(resultWrapper, dialogFindLoginStorage) {
        // None of the DOM listener functions seem to work on this embedded browser window,
        // so we use a timer to keep trying until the second page is loaded.

        try {
            var contentDocument = document.getElementById("requestFrame").contentDocument;
            var passwdInput = contentDocument.getElementById("Passwd");
            var passwd = passwdInput.value
            keeFoxGDataProviderHelper.autoFill(resultWrapper, dialogFindLoginStorage);
        } catch (exception) {
            window.setTimeout(keeFoxGDataProviderHelper.autoFill2, 100,
                resultWrapper, dialogFindLoginStorage);
        }
    },

    realm: null,
    host: null,
    username: null,

    prepareFill : function() {
        keefox_org._KFLog.debug("gdata-provider prepareFill accepted");

        var mustAutoSubmit = false;
        var host = "", realm = "", username = "";

        // see if this is the built-in oauth dialog
        if (this._messengerBundle) {
            try {
                let oauth2WindowTitle = this._messengerBundle.GetStringFromName("oauth2WindowTitle");
                keefox_org._KFLog.debug("oauth2WindowTitle: " + oauth2WindowTitle);
                const hostIsFirst = oauth2WindowTitle.indexOf("%2$S") < oauth2WindowTitle.indexOf("%1$S");

                // escape regex chars, if any
                const regexChars = /[\[\{\(\)\*\+\?\.\\\^\$\|]/g;
                oauth2WindowTitle = oauth2WindowTitle.replace(regexChars, "\\$&");

                // replace placeholders with regex capture
                oauth2WindowTitle = oauth2WindowTitle.replace(/%[12]\\\$S/g, "(.*)");

                // scrape the host and username from the title
                let title = document.getElementById("browserRequest").getAttribute("title");
                keefox_org._KFLog.debug("title: " + title);
                [, username, host] = title.match(oauth2WindowTitle);
                if (hostIsFirst) {
                    [host, username] = [username, host];
                }
                keefox_org._KFLog.debug("username: " + username);
                keefox_org._KFLog.debug("host: " + host);
            } catch (exception) {
                keefox_org._KFLog.debug("Error while parsing oauth2WindowTitle: " + exception);
            }
        }

        // if not, it might be the gdata-provider addon dialog
        if (!host && this._gdataBundle) {
            try {
                var requestWindowDescription = this._gdataBundle.GetStringFromName("requestWindowDescription").split("%1$S");
                keefox_org._KFLog.debug(requestWindowDescription);
                var split = requestWindowDescription;
                var description = document.getElementById("dialogMessage").innerHTML;
                keefox_org._KFLog.debug(description);
                username = description.replace(split[0], "").replace(split[1], "");
                keefox_org._KFLog.debug(username);
                host = username.split("@")[1];
                keefox_org._KFLog.debug(host);
            } catch (exception) {
                keefox_org._KFLog.debug("Error while getting Email input element: " + exception);
            }
        }

        if (!host) {
            // we don't know what this is
            return;
        }

        // try to pick out the host from the full protocol, host and port
        this.originalHost = host;
        this.host = this.getURIHostAndPort(host) || host;
        this.realm = realm;
        this.username = username;
        this.mustAutoSubmit = mustAutoSubmit;

        /* add ui elements to dialog */

        // this box displays labels and also the list of entries when fetched
        var box = document.getElementById("keefox-hbox");

        var loadingPasswords = document.createElement("description");
        loadingPasswords.setAttribute("id","keefox-autoauth-description");
        var loadingPasswordsVBox = document.createElement("vbox");
        loadingPasswordsVBox.setAttribute("id", "keefox-autoauth-box");
        loadingPasswordsVBox.appendChild(loadingPasswords);
        loadingPasswordsVBox.setAttribute("flex", "1");
        loadingPasswordsVBox.setAttribute("pack", "center");
        box.appendChild(loadingPasswordsVBox);

        // button to launch KeePass
        var launchKeePassButton = document.createElement("button");
        launchKeePassButton.setAttribute("id", "keefox-launch-kp-button");
        launchKeePassButton.setAttribute("label", keefox_org.locale.$STR("launchKeePass.label"));
        launchKeePassButton.addEventListener("command", function (event) { keefox_org.launchKeePass(''); }, false);
        box.appendChild(launchKeePassButton);

        this.prepareFillComplete = true;
        this.updateDialog();
    },

    updateDialog : function() {
        if (this.prepareFillComplete) {

            var loadingPasswords = document.getElementById("keefox-autoauth-description");

            // if we're not logged in to KeePass then we can't go on
            if (!keefox_org._keeFoxStorage.get("KeePassRPCActive", false) ||
                !keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false))
            {
                if (keeFoxGDataProviderHelper.updateTimer) {
                  return;
                }
                loadingPasswords.setAttribute("value", keefox_org.locale.$STR("httpAuth.default"));
                keeFoxGDataProviderHelper.updateTimer = setInterval(function() { keeFoxGDataProviderHelper.updateDialog(); }, 1000);
                return;
            }

            if (keeFoxGDataProviderHelper.updateTimer) {
              clearTimeout(keeFoxGDataProviderHelper.updateTimer);
              delete keeFoxGDataProviderHelper.updateTimer;
            }

            loadingPasswords.setAttribute("value", keefox_org.locale.$STR("httpAuth.loadingPasswords") + "...");

            var launchKeePassButton = document.getElementById("keefox-launch-kp-button");
            launchKeePassButton.setAttribute("hidden", "true");

            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");

            var dialogFindLoginStorage = {};
            dialogFindLoginStorage.host = keeFoxGDataProviderHelper.host;
            dialogFindLoginStorage.realm = keeFoxGDataProviderHelper.realm;
            dialogFindLoginStorage.username = keeFoxGDataProviderHelper.username;
            dialogFindLoginStorage.document = document;
            dialogFindLoginStorage.mustAutoSubmit = keeFoxGDataProviderHelper.mustAutoSubmit;
            // find all the logins
            var requestId = keefox_org.findLogins(keeFoxGDataProviderHelper.originalHost,
                null, keeFoxGDataProviderHelper.realm, null, null, null,
                keeFoxGDataProviderHelper.username, keeFoxGDataProviderHelper.autoFill, dialogFindLoginStorage);
        }
    },

    // fill in the dialog with the first matched login found and/or the list of all matched logins
    autoFill : function(resultWrapper, dialogFindLoginStorage)
    {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
                     wm.getMostRecentWindow("mail:3pane");
        window.keefox_org._KFLog.info("callback fired!");

        var foundLogins = null;
        var convertedResult = [];

        if ("result" in resultWrapper && resultWrapper.result !== false && resultWrapper.result != null)
        {
            let logins = resultWrapper.result;

            for (var i in logins)
            {
                var kfl = window.keeFoxLoginInfo();
                kfl.initFromEntry(logins[i]);
                convertedResult.push(kfl);
            }
        }

        if (convertedResult.length == 0)
        {
            // set "no passwords" message
            document.getElementById("keefox-autoauth-description").setAttribute("value",keefox_org.locale.$STR("httpAuth.noMatches"));
            return;
        }

        foundLogins = convertedResult;

        // auto fill the dialog by default unless a preference or tab variable tells us otherwise
        var autoFill = keefox_org._keeFoxExtension.prefs.getValue("autoFillDialogs",true);

        // do not auto submit the dialog by default unless a preference or tab variable tells us otherwise
        var autoSubmit = keefox_org._keeFoxExtension.prefs.getValue("autoSubmitDialogs",false);

        // overwrite existing username by default unless a preference or tab variable tells us otherwise
        var overWriteFieldsAutomatically = keefox_org._keeFoxExtension.prefs.getValue("overWriteFieldsAutomatically",true);

        // this protects against infinite loops when the auto-submitted details are rejected
        if (keefox_org._keeFoxExtension.prefs.has("lastProtocolAuthAttempt"))
        {
            if (Math.round(new Date().getTime() / 1000) - keefox_org._keeFoxExtension.prefs.get("lastProtocolAuthAttempt") <= 3)
            {
                autoFill = false;
                autoSubmit = false;
            }
        }

        var contentDocument = dialogFindLoginStorage.document.getElementById("requestFrame").contentDocument;
        var passwdInput = contentDocument.getElementById("Passwd")
            || contentDocument.getElementById("Passwd-hidden");
        if (passwdInput.getAttribute("value") != '' && !overWriteFieldsAutomatically)
        {
            autoFill = false;
            autoSubmit = false;
        }

        if (keefox_org._KFLog.logSensitiveData)
            keefox_org._KFLog.info("dialog: found " + foundLogins.length + " matching logins for '"+ dialogFindLoginStorage.realm + "' realm.");
        else
            keefox_org._KFLog.info("dialog: found " + foundLogins.length + " matching logins for a realm.");

        if (foundLogins.length <= 0)
            return;

        var matchedLogins = [];
        var showList;

        // for every login
        for (var i = 0; i < foundLogins.length; i++)
        {
            try {
                var username = foundLogins[i].otherFields[foundLogins[i].usernameIndex];
                var password = foundLogins[i].passwords[0];
                var title = foundLogins[i].title;
                var displayGroupPath = foundLogins[i].database.name + '/' + foundLogins[i].parentGroup.path;
                matchedLogins.push({ 'username' : ((username !== undefined) ? username.value : ''),
                    'password' : ((password !== undefined) ? password.value : ''),
                    'host' : dialogFindLoginStorage.host,
                    'title' : title,
                    'displayGroupPath' : displayGroupPath,
                    'alwaysAutoFill' : foundLogins[i].alwaysAutoFill,
                    'neverAutoFill' : foundLogins[i].neverAutoFill,
                    'alwaysAutoSubmit' : foundLogins[i].alwaysAutoSubmit,
                    'neverAutoSubmit' : foundLogins[i].neverAutoSubmit,
                    'httpRealm' : foundLogins[i].httpRealm,
                    'priority' : foundLogins[i].priority,
                    'matchAccuracy' : foundLogins[i].matchAccuracy,
                    'uniqueID' : foundLogins[i].uniqueID
                });
                showList = true;

            } catch (e) {
                keefox_org._KFLog.error(e);
            }
        }

        let bestMatch = 0;
        let bestMatchScore = -1;

        // create a drop down box with all matched logins
        if (showList) {
            var box = dialogFindLoginStorage.document.getElementById("keefox-autoauth-box");

            var list = dialogFindLoginStorage.document.createElement("menulist");
            list.setAttribute("id","autoauth-list");
            var popup = dialogFindLoginStorage.document.createElement("menupopup");
            var done = false;

            for (var i = 0; i < matchedLogins.length; i++){
                var item = dialogFindLoginStorage.document.createElement("menuitem");
                item.setAttribute("label", keefox_org.locale.$STRF("matchedLogin.label",
                    [matchedLogins[i].username, matchedLogins[i].host]));
                item.setAttribute("tooltiptext", keefox_org.locale.$STRF("matchedLogin.tip",
                    [matchedLogins[i].title, matchedLogins[i].displayGroupPath, matchedLogins[i].username]));
                item.addEventListener("command", function (event) {
                    keeFoxGDataProviderHelper.fill(this.username, this.password);
                }, false);
                item.username = matchedLogins[i].username;
                item.password = matchedLogins[i].password;
                popup.appendChild(item);

                let loginMatchScore = keeFoxGDataProviderHelper.calculateRelevanceScore(matchedLogins[i], dialogFindLoginStorage);
                if (loginMatchScore > bestMatchScore)
                {
                    bestMatchScore = loginMatchScore;
                    bestMatch = i;
                }
            }

            list.appendChild(popup);
            // Remove all of the existing children
            for (i = box.childNodes.length; i > 0; i--) {
                box.removeChild(box.childNodes[0]);
            }
            box.appendChild(list);
        }

        if (matchedLogins[bestMatch] === undefined)
            return;

        if (matchedLogins[bestMatch].alwaysAutoFill)
            autoFill = true;
        if (matchedLogins[bestMatch].neverAutoFill)
            autoFill = false;
        if (matchedLogins[bestMatch].alwaysAutoSubmit)
            autoSubmit = true;
        if (matchedLogins[bestMatch].neverAutoSubmit)
            autoSubmit = false;

        if (autoFill)
        {
            // fill in the best matching login
            keefox_org.metricsManager.pushEvent ("feature", "AutoFillDialog");
            var emailInput = contentDocument.getElementById("Email")
                || contentDocument.getElementById("Email-hidden");
            emailInput.value = matchedLogins[bestMatch].username;
            passwdInput.value = matchedLogins[bestMatch].password;
        }
        if (autoSubmit || dialogFindLoginStorage.mustAutoSubmit)
        {
            keefox_org.metricsManager.pushEvent ("feature", "AutoSubmitDialog");
            var nextButton = contentDocument.getElementById("next");
            if (nextButton) {
                nextButton.click();
                window.setTimeout(keeFoxGDataProviderHelper.autoFill2, 100,
                    resultWrapper, dialogFindLoginStorage);
            }
            var signInButton = contentDocument.getElementById("signIn");
            if (signInButton) {
                signInButton.click();
            }
        }
    },

    calculateRelevanceScore: function (login, dialogFindLoginStorage) {
        let score = 0;

        // entry priorities provide a large score such that no other combination of relevance
        // can override them
        if (login.priority > 0)
            score = 1000000000 - login.priority * 1000;

        // We never know the exact URL but this can be matched on domain, hostname or hostname+port (once #358 is done)
        score += login.matchAccuracy;

        // A realm match is important (but there is no meaningful way of determining an "almost" match)
        if (dialogFindLoginStorage.realm == login.httpRealm)
            score += 50;

        keefox_org._KFLog.info("Relevance for " + login.uniqueID + " is: " + score);
        return score;
    },

    fill : function (username, password)
    {
        keefox_org.metricsManager.pushEvent ("feature", "MatchedSubmitDialog");
        var contentDocument = document.getElementById("requestFrame").contentDocument;
        var emailInput = contentDocument.getElementById("Email");
        if (emailInput) {
            emailInput.value = username;
        }
        var passwdInput = contentDocument.getElementById("Passwd");
        if (passwdInput) {
            passwdInput.value = password;
        }
        var nextButton = contentDocument.getElementById("next");
        if (nextButton) {
            nextButton.click();
        }
        var signInButton = contentDocument.getElementById("signIn");
        if (signInButton) {
            signInButton.click();
        }
    },
};

keeFoxGDataProviderHelper.scriptLoader.loadSubScript(
    "chrome://keefox/content/shared/uriUtils.js", keeFoxGDataProviderHelper);
window.addEventListener("load", keeFoxGDataProviderHelper.dialogInit, false);
