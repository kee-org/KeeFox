/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
Copyright 2008-2015 Chris Tomlinson <keefox@christomlinson.name>
  
This hooks onto every common dialog in Firefox and for any dialog that contains one
username and one password (with the usual Firefox field IDs) it will discover
any matching logins and depending on preferences, etc. it will fill in the
dialog fields and/or populate a drop down box containing all of the matching logins.

Also looks for a dialog with a single text box which has the same text description
content as the KeeFox Authorisation dialog popup so that we can cancel the dialog
if the underlying KPRPC connection is dropped while we are blocked on this modal dialog.

Some ideas and code snippets from AutoAuth Firefox extension:
https://addons.mozilla.org/en-US/firefox/addon/4949

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

var keeFoxDialogManager = {
    scriptLoader : Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
        .getService(Components.interfaces.mozIJSSubScriptLoader),

    __promptBundle : null, // String bundle for L10N
    get _promptBundle() {
        if (!this.__promptBundle) {
            var bunService = Components.classes["@mozilla.org/intl/stringbundle;1"].
                getService(Components.interfaces.nsIStringBundleService);
            this.__promptBundle = bunService.createBundle(
                "chrome://global/locale/prompts.properties");
            if (!this.__promptBundle)
                throw "Prompt string bundle not present!";
        }
        return this.__promptBundle;
    },
    
    __cdBundle : null, // String bundle for L10N
    get _cdBundle() {
        if (!this.__cdBundle) {
            var bunService = Components.classes["@mozilla.org/intl/stringbundle;1"].
                             getService(Components.interfaces.nsIStringBundleService);
            this.__cdBundle = bunService.createBundle(
                        "chrome://global/locale/commonDialogs.properties");
            if (!this.__cdBundle)
                throw "Common Dialogs string bundle not present!";
        }
        return this.__cdBundle;
    },
    
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
    
    __localMsgsBundle : null, // string bundle for thunderbird l10n
    get _localMsgsBundle() {    
        if (!this.__localMsgsBundle) {
            var bunService = Components.classes["@mozilla.org/intl/stringbundle;1"].
                getService(Components.interfaces.nsIStringBundleService);
            this.__localMsgsBundle = bunService.createBundle(
                "chrome://messenger/locale/localMsgs.properties");
            if (!this.__localMsgsBundle)
                throw "localMsgs string bundle not present!";
        }        
        return this.__localMsgsBundle;
    },
    
    __imapMsgsBundle : null, // string bundle for thunderbird l10n
    get _imapMsgsBundle() {    
        if (!this.__imapMsgsBundle) {
            var bunService = Components.classes["@mozilla.org/intl/stringbundle;1"].
                getService(Components.interfaces.nsIStringBundleService);
            this.__imapMsgsBundle = bunService.createBundle(
                "chrome://messenger/locale/imapMsgs.properties");
            if (!this.__imapMsgsBundle)
                throw "imapMsgs string bundle not present!";
        }        
        return this.__imapMsgsBundle;
    },

    __imapBundleUsesStrings : null, // specifies whether imap bundle uses string
                                    // identifiers (true) or numeric identifiers
                                    // (false). Change was made in Thunderbird 25
    get _imapBundleUsesStrings() {
        if (this.__imapBundleUsesStrings === null) {
            try {
                // GetStringFromName will throw an exception if the numeric id is not found
                this._imapMsgsBundle.GetStringFromName("5051");
                this.__imapBundleUsesStrings = false;
            } catch (exception) {
                this.__imapBundleUsesStrings = true;
            }
        }
        return this.__imapBundleUsesStrings;
    },

    __newsBundle : null, // string bundle for thunderbird l10n
    get _newsBundle() {    
        if (!this.__newsBundle) {
            var bunService = Components.classes["@mozilla.org/intl/stringbundle;1"].
                getService(Components.interfaces.nsIStringBundleService);
            this.__newsBundle = bunService.createBundle(
                "chrome://messenger/locale/news.properties");
            if (!this.__newsBundle)
                throw "news string bundle not present!";
        }
        return this.__newsBundle;
    },
    
    __composeBundle : null, // string bundle for thunderbird l10n
    get _composeBundle() {    
        if (!this.__composeBundle) {
            var bunService = Components.classes["@mozilla.org/intl/stringbundle;1"].
                getService(Components.interfaces.nsIStringBundleService);
            this.__composeBundle = bunService.createBundle(
                "chrome://messenger/locale/messengercompose/composeMsgs.properties");
            if (!this.__composeBundle)
                throw "Compose Message string bundle not present!";
        }
        return this.__composeBundle;
    },
    
    appInfo: Components.classes["@mozilla.org/xre/app-info;1"]
        .getService(Components.interfaces.nsIXULAppInfo),
    
    dialogInit : function(e) {
        window.removeEventListener("load", keeFoxDialogManager.dialogInit);
        try
        {
            document.getElementById("commonDialog").setAttribute("windowtype","common-dialog");
            keeFoxDialogManager.prepareFill();
        } catch (exception) {
            try {
                keefox_org._KFLog.error(exception);
            } catch (e)
            {
                // don't want missing keefox.org object to break standard dialogs
            }
        }
    },
    
    realm: null,
    host: null,
    
    prepareFill : function()
    {
        if (Dialog.args.promptType == "prompt" || // username only (or other single text box dialog)
            Dialog.args.promptType == "promptUserAndPass" || // user and pass
            Dialog.args.promptType == "promptPassword") // password only
        {        
            keefox_org._KFLog.debug("prepareFill accepted"); 
            
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                .getService(Components.interfaces.nsIWindowMediator);
            var parentWindow = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            
            var mustAutoSubmit = false;            
            var host, realm, username;
            
            if (Dialog.args.promptType == "prompt") {
                //This assumes there are no cases where we are asked for username
                // only. Haven't come across any for 5 years so hopefully this was
                // a safe assumption.

                keefox_org._KFLog.debug("Looking for KeeFox Authorisation description text"); 
                // find out if this is KeePassRPC authentication popup
                let authTextString = keefox_org.locale.$STR("KeeFox-conn-setup-enter-password");
                if (document.getElementById("info.body").firstChild.nodeValue == authTextString)
                {
                    keefox_org._KFLog.debug("Starting KPRPCConnectionObserver"); 
                    // Start listening for notifications that the KPRPC connection has been closed
                    this.kprpcConnObserver = new KPRPCConnectionObserver();
                    window.addEventListener("unload", this.KPRPCAuthDialogClosing, false);
                    return;
                }
            }
            
            if (parentWindow.gBrowser)
            { // firefox (or other application that understands gBrowser)

                // e10s: I've removed loads of code here that might have used to allow
                // one-click logins via a HTTP auth dialog. Looks like e10s prevents
                // us from doing that now :-(
                  
            } // end if (parentWindow.gBrowser)
            
            host = "";
            realm = "";
            username = ""; // currently not used in FireFox, but may be in future
            
            var xulAppInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                 .getService(Components.interfaces.nsIXULAppInfo);

            /* handle cases for password only prompt in thunderbird */
            if (xulAppInfo.ID == "{3550f703-e582-4d05-9a08-453d09bdfdc6}")
            {                
                let protocols = {};
                let titles = {};
                let prompts = {};
                let hostIsFirst = {};
                let secondIsUserName = {};
                let extractUserFromHost = {};
                
                /* this function is used to get localized strings and setup a regex
                 * and other parameters for each type of dialog.
                 *
                 * @param {nsIStringBundle} aStringBundle 
                 * String bundle that contains localized strings for a dialog.
                 *
                 * @param {string} aDialogType
                 * The type of dialog. For dialogs that do not contain a protocol
                 * aDialogType should be the name of the protocol. If a protocol
                 * has more than one possible dialog, suffix it with -1, -2 etc.
                 * The '-' and everthing after it will be stripped.
                 *
                 * @param {string}aTitlePropertyName
                 * The name of the dialog title property to lookup in the string bundle.
                 *
                 * @param {string}aPromptPropertyName
                 * The name of the dialog message prompt property to lookup in the string bundle.
                 *
                 * @param {string} aHostPlaceholder
                 * The placeholder being used for the host name in the localized string.
                 * Should be "%S" if there is only one parameter in the string or 
                 * "%1$S" where 1 is the index of the parameter if there is more than one.
                 *
                 * @param {string} aRealmPlaceholder
                 * The placeholder for the parameter to use as the realm in the localized string.
                 * See aHostPlaceholder. Can also be null if the parameter is not present.
                 *
                 * @param {string} aUserPlaceholder
                 * The placeholder for the parameter to use as the user name in the localized string.
                 * See aHostPlaceholder. Can also be null if the parameter is not present.
                 * aUserPlaceholder and aRealPlaceholder are optional and mutually exclusive
                 * so, you can have one, the other or neither, but not both
                 *
                 * @param {boolean} aExtractUserFromHost
                 * Set to true when username is combined with hostname as in "username@www.example.com"
                 */
                let LoadDialogData = function (aStringBundle, aDialogType, aTitlePropertyName,
                    aPromptPropertyName, aHostPlaceholder, aRealmPlaceholder, aUserPlaceholder,
                    aExtractUserFromHost)
                {
                    if (aStringBundle != null)
                    {
                        let regexChars = /[\[\{\(\)\*\+\?\.\\\^\$\|]/g;
                        protocols[aDialogType] = aDialogType.split("-")[0];
                        titles[aDialogType] = aStringBundle.GetStringFromName(aTitlePropertyName);
                        prompts[aDialogType] = aStringBundle.GetStringFromName(aPromptPropertyName);
                        prompts[aDialogType] = prompts[aDialogType].replace(regexChars, "\\$&");
                        aHostPlaceholder = aHostPlaceholder.replace(regexChars, "\\$&");
                        // use null as a flag to indicate that there was only one
                        // placeholder and hostIsFirst and secondIsUserName are not applicable
                        hostIsFirst[aDialogType] = null;
                        if (aUserPlaceholder != null)
                        {
                            aUserPlaceholder = aUserPlaceholder.replace(regexChars, "\\$&");
                            hostIsFirst[aDialogType] = prompts[aDialogType].indexOf(aHostPlaceholder) <
                                prompts[aDialogType].indexOf(aUserPlaceholder);
                            secondIsUserName[aDialogType] = true;
                        }
                        if (aRealmPlaceholder != null)
                        {
                            aRealmPlaceholder = aRealmPlaceholder.replace(regexChars, "\\$&");
                            hostIsFirst[aDialogType] = prompts[aDialogType].indexOf(aHostPlaceholder) <
                                prompts[aDialogType].indexOf(aRealmPlaceholder);
                            secondIsUserName[aDialogType] = false;
                        }
                        prompts[aDialogType] = prompts[aDialogType].replace(aHostPlaceholder, "([^\\s]+)");
                        if (aUserPlaceholder != null)
                        {
                            prompts[aDialogType] = prompts[aDialogType].replace(aUserPlaceholder, "([^\\s]+)");
                        }
                        if (aRealmPlaceholder != null)
                        {
                            prompts[aDialogType] = prompts[aDialogType].replace(aRealmPlaceholder, "([^\\s]+)");
                        }
                        extractUserFromHost[aDialogType] = aExtractUserFromHost;
                    }
                }
                  
                LoadDialogData(this._composeBundle, "smtp", "smtpEnterPasswordPromptTitle",
                    "smtpEnterPasswordPromptWithUsername", "%1$S", null, "%2$S");
                var imapEnterPasswordPromptTitle = this._imapBundleUsesStrings
                    ? "imapEnterPasswordPromptTitle" : "5051";
                var imapEnterPasswordPrompt = this._imapBundleUsesStrings
                    ? "imapEnterPasswordPrompt" : "5047";
                var isPreTB40ImapStrings = true;
                try {
                    // Take a peek at imapEnterPasswordPrompt
                    this._imapMsgsBundle.GetStringFromName(imapEnterPasswordPrompt);
                } catch (e) {
                    // The string identifier changed again in TB 40
                    imapEnterPasswordPrompt = "imapEnterServerPasswordPrompt";
                    isPreTB40ImapStrings = false;
                }
                // The prompt changed from using one parameter to using two in TB40
                LoadDialogData(this._imapMsgsBundle, "imap",
                    imapEnterPasswordPromptTitle, imapEnterPasswordPrompt,
                    isPreTB40ImapStrings ? "%S" : "%2$S", null,
                    isPreTB40ImapStrings ? null : "%1$S", isPreTB40ImapStrings);
                LoadDialogData(this._localMsgsBundle, "pop3", "pop3EnterPasswordPromptTitle",
                    "pop3EnterPasswordPrompt", "%2$S", null, "%1$S");
                LoadDialogData(this._newsBundle, "nntp-1", "enterUserPassTitle",
                    "enterUserPassServer", "%S");
                LoadDialogData(this._newsBundle, "nntp-2", "enterUserPassTitle",
                    "enterUserPassGroup", "%2$S", "%1$S");
                LoadDialogData(this._messengerBundle, "mail", "passwordTitle",
                    "passwordPrompt", "%2$S", null, "%1$S");
                
                for (let type in titles)
                {                  
                    if (Dialog.args.title == titles[type])
                    {
                        // some types have the same title, so we have more checking to do
                        let regEx = new RegExp(prompts[type]);
                        let matches = Dialog.args.text.match(regEx);
                        if (!matches)
                        {
                            continue;
                        }
                        if (hostIsFirst[type] === null) {
                            // there is only one parameter, so nothing is first
                            if (matches.length == 2) {
                                if (extractUserFromHost[type])
                                {
                                    // user and host are separated by @ character
                                    let lastAtSym = matches[1].lastIndexOf("@");                            
                                    username = matches[1].substring(0, lastAtSym);
                                    host = protocols[type] + "://" +
                                        matches[1].substring(lastAtSym + 1, matches[1].length);
                                } else {
                                    host = protocols[type] + "://" + matches[1];
                                }
                                break;
                            }
                        } else
                        {
                            if (matches.length == 3) {
                                if (hostIsFirst[type]) {
                                    host = protocols[type] + "://" + matches[1];
                                    username = matches[2];
                                } else {
                                    host = protocols[type] + "://" + matches[2];
                                    username = matches[1];
                                }
                                break;
                            }
                        }
                    }
                }
            } // end if Thunderbird
            
            if (host.length < 1)
            {
                // e.g. en-US:
                // A username and password are being requested by %2$S. The site says: "%1$S"
                var currentRealmL10nPattern = "";            
                try 
                {
                    currentRealmL10nPattern = this._cdBundle.GetStringFromName("EnterLoginForRealm");
                } catch (exception)
                {
                    // Exception expected in Firefox >= 50 and Thunderbird
                    try
                    {
                        currentRealmL10nPattern = this._cdBundle.GetStringFromName("EnterLoginForRealm2");
                    } catch (exception2)
                    {
                        // And again in Firefox >= 51 and Thunderbird
                        try
                        {
                            currentRealmL10nPattern = this._cdBundle.GetStringFromName("EnterLoginForRealm3");
                        } catch (exception3)
                        {
                            currentRealmL10nPattern = this._promptBundle.GetStringFromName("EnterLoginForRealm");
                        }
                    }
                }

                var realmFirst = false;
                if (currentRealmL10nPattern.indexOf("%2$S") > currentRealmL10nPattern.indexOf("%1$S"))
                    realmFirst = true;

                // Due to https://bugzilla.mozilla.org/show_bug.cgi?id=1277895,
                // Firefox is replacing newline characters with a space on the
                // strings that are actually displayed in the dialog box, so we
                // need to do the same.
                currentRealmL10nPattern = currentRealmL10nPattern.replace(/\n{1,}/g,' ');

                currentRealmL10nPattern = currentRealmL10nPattern.replace("%2$S","(.+)").replace("%1$S","(.+)");
                let regEx = new RegExp(currentRealmL10nPattern);

                let matches = document.getElementById("info.body").firstChild.nodeValue.match(regEx);
                if (matches !== null && typeof matches[1] !== "undefined" && typeof matches[2] !== "undefined")
                {
                    if (realmFirst)
                    {
                        host = matches[2];
                        realm = matches[1];
                    } else
                    {
                        host = matches[1];
                        realm = matches[2];
                    }
                }
            }
                
            if (host.length < 1)
            {
                // e.g. en-US:
                // The proxy %2$S is requesting a username and password. The site says: "%1$S"
                var currentProxyL10nPattern = "";            
                try 
                {
                    // Name changed again in Firefox 50 or so
                    currentProxyL10nPattern = this._cdBundle.GetStringFromName("EnterLoginForProxy3");
                } catch (exception)
                {
                    try 
                    {
                        // Name changed in Firefox 49
                        currentProxyL10nPattern = this._cdBundle.GetStringFromName("EnterLoginForProxy2");
                    } catch (exception)
                    {
                        try
                        {
                            currentProxyL10nPattern = this._cdBundle.GetStringFromName("EnterLoginForProxy");
                        } catch (exception)
                        {
                            currentProxyL10nPattern = this._promptBundle.GetStringFromName("EnterLoginForProxy");
                        }
                    }
                }

                realmFirst = false;
                if (currentProxyL10nPattern.indexOf("%2$S") > currentProxyL10nPattern.indexOf("%1$S"))
                    realmFirst = true;

                // Due to https://bugzilla.mozilla.org/show_bug.cgi?id=1277895,
                // Firefox is replacing newline characters with a space on the
                // strings that are actually displayed in the dialog box, so we
                // need to do the same.
                currentProxyL10nPattern = currentProxyL10nPattern.replace(/\n{1,}/g,' ');

                currentProxyL10nPattern = currentProxyL10nPattern.replace("%2$S","(.+)").replace("%1$S","(.+)");
                let regEx = new RegExp(currentProxyL10nPattern);

                let matches = document.getElementById("info.body").firstChild.nodeValue.match(regEx);
                if (matches !== null && typeof matches[1] !== "undefined" && typeof matches[2] !== "undefined") {
                    if (realmFirst)
                    {
                        host = matches[2];
                        realm = matches[1];
                    } else
                    {
                        host = matches[1];
                        realm = matches[2];
                    }
                }
            }
                
            // check for NTLM auth dialog
            if (host.length < 1) 
            {
                // e.g. en-US:
                // Enter username and password for %1$S
                var currentProxyL10nPattern = "";            
                try 
                {
                    try 
                    {
                        currentProxyL10nPattern = this._cdBundle.GetStringFromName("EnterUserPasswordFor2");
                    } catch (exception)
                    {
                        currentProxyL10nPattern = this._cdBundle.GetStringFromName("EnterUserPasswordFor");
                    }
                } catch (exception)
                {
                    currentProxyL10nPattern = this._promptBundle.GetStringFromName("EnterUserPasswordFor");
                }

                // Due to https://bugzilla.mozilla.org/show_bug.cgi?id=1277895,
                // Firefox is replacing newline characters with a space on the
                // strings that are actually displayed in the dialog box, so we
                // need to do the same.
                currentProxyL10nPattern = currentProxyL10nPattern.replace(/\n{1,}/g,' ');

                currentProxyL10nPattern = currentProxyL10nPattern.replace("%1$S","(.+)");
                let regEx = new RegExp(currentProxyL10nPattern);

                let matches = document.getElementById("info.body").firstChild.nodeValue.match(regEx);
                if (matches !== null && typeof matches[1] !== "undefined")  {
                        host = matches[1];
                }
            }
            
            if (host.length < 1) {
              return;
            }

            this.originalHost = host;
            this.host = this.getURIHostAndPort(host) || host;
            this.realm = realm;
            this.username = username;
            this.mustAutoSubmit = mustAutoSubmit;

            /* add ui elements to dialog */
            
            var row = document.createElement("row");
            row.setAttribute("id","keefox-autoauth-row");
            row.setAttribute("flex", "1");

            // spacer to take up first column in layout
            var spacer = document.createElement("spacer");
            spacer.setAttribute("flex", "1");
            row.appendChild(spacer);

            // this box displays labels and also the list of entries when fetched
            var box = document.createElement("hbox");
            box.setAttribute("id","keefox-autoauth-box");
            box.setAttribute("align", "center");
            box.setAttribute("flex", "1");
            box.setAttribute("pack", "start");

            var loadingPasswords = document.createElement("description");
            loadingPasswords.setAttribute("id","keefox-autoauth-description");
            loadingPasswords.setAttribute("align", "start");
            loadingPasswords.setAttribute("flex", "1");
            box.appendChild(loadingPasswords);
            row.appendChild(box);

            // button to lauch KeePass
            var launchKeePassButton = document.createElement("button");
            launchKeePassButton.setAttribute("id", "keefox-launch-kp-button");
            launchKeePassButton.setAttribute("label", keefox_org.locale.$STR("launchKeePass.label"));
            launchKeePassButton.addEventListener("command", function (event) { keefox_org.launchKeePass(''); }, false);
            box.appendChild(launchKeePassButton);

            document.getElementById("loginContainer").parentNode.appendChild(row);

            this.updateDialog();
        }
    },

    updateDialog : function()
    {
        // check to make sure prepareFill was called
        var row = document.getElementById("keefox-autoauth-row");
        if (row) {

            var loadingPasswords = document.getElementById("keefox-autoauth-description");

            // if we're not logged in to KeePass then we can't go on
            if (!keefox_org._keeFoxStorage.get("KeePassRPCActive", false) ||
                !keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false))
            {
                if (keeFoxDialogManager.updateTimer) {
                  return;
                }
                loadingPasswords.setAttribute("value", keefox_org.locale.$STR("httpAuth.default"));
                keeFoxDialogManager.updateTimer = setInterval(function() { keeFoxDialogManager.updateDialog(); }, 1000);
                return;
            }
            
            if (keeFoxDialogManager.updateTimer) {
              clearTimeout(keeFoxDialogManager.updateTimer);
              delete keeFoxDialogManager.updateTimer;
            }

            loadingPasswords.setAttribute("value", keefox_org.locale.$STR("httpAuth.loadingPasswords") + "...");

            var launchKeePassButton = document.getElementById("keefox-launch-kp-button");
            launchKeePassButton.setAttribute("hidden", "true");

            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");

            var dialogFindLoginStorage = {};
            dialogFindLoginStorage.host = keeFoxDialogManager.host;
            dialogFindLoginStorage.realm = keeFoxDialogManager.realm;
            dialogFindLoginStorage.username = keeFoxDialogManager.username;
            dialogFindLoginStorage.document = document;
            dialogFindLoginStorage.mustAutoSubmit = keeFoxDialogManager.mustAutoSubmit;

            var requestId = keefox_org.findLogins(keeFoxDialogManager.originalHost,
                null, keeFoxDialogManager.realm, null, null, null,
                keeFoxDialogManager.username, keeFoxDialogManager.autoFill, dialogFindLoginStorage);
        }
    },
    
    // fill in the dialog with the first matched login found and/or the list of all matched logins
    autoFill: function (resultWrapper, dialogFindLoginStorage)
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
            document.getElementById("keefox-autoauth-description")
                .setAttribute("value", keefox_org.locale.$STR("httpAuth.noMatches"));
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
        
        if (dialogFindLoginStorage.document.getElementById("loginTextbox").getAttribute("value") != ''
            && dialogFindLoginStorage.document.getElementById("password1Textbox").getAttribute("value") != ''
            && !overWriteFieldsAutomatically)
        {    
            autoFill = false;
            autoSubmit = false;
        }        

        if (keefox_org._KFLog.logSensitiveData)
            keefox_org._KFLog.info("dialog: found " + foundLogins.length
                + " matching logins for '" + dialogFindLoginStorage.realm + "' realm.");
        else
            keefox_org._KFLog.info("dialog: found " + foundLogins.length
                + " matching logins for a realm.");
        
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

                // We display the URL of the match, if available. In some cases this won't be the
                // actual URL that KeePass matched which might be a little confusing for users but
                // we can't change that without passing lots more data back over the KPRPC link
                // which comes with its own set of drawbacks.
                var displayHost = dialogFindLoginStorage.host;
                if (foundLogins[i].URLs.length && foundLogins[i].URLs[0].length)
                    displayHost = foundLogins[i].URLs[0];

                matchedLogins.push({ 'username' : ((username !== undefined) ? username.value : ''),
                    'password' : ((password !== undefined) ? password.value : ''),
                    'host': displayHost,
                    'title' : title,
                    'displayGroupPath' : displayGroupPath,
                    'alwaysAutoFill' : foundLogins[i].alwaysAutoFill,
                    'neverAutoFill' : foundLogins[i].neverAutoFill, 
                    'alwaysAutoSubmit' : foundLogins[i].alwaysAutoSubmit,
                    'neverAutoSubmit' : foundLogins[i].neverAutoSubmit,
                    'httpRealm': foundLogins[i].httpRealm,
                    'priority': foundLogins[i].priority,
                    'matchAccuracy': foundLogins[i].matchAccuracy,
                    'uniqueID': foundLogins[i].uniqueID
                });
                showList = true;                

            } catch (e) {
                keefox_org._KFLog.error(e);
            }
        }
        
        const bestMatch = 0;

        // create a drop down box with all matched logins
        if (showList) {
            var box = dialogFindLoginStorage.document.getElementById("keefox-autoauth-box");

            var list = dialogFindLoginStorage.document.createElement("menulist");
            list.setAttribute("id","autoauth-list");
            var popup = dialogFindLoginStorage.document.createElement("menupopup");
            var done = false;            
            
            for (var i = 0; i < matchedLogins.length; i++) {
                matchedLogins[i].relevanceScore = keeFoxDialogManager.calculateRelevanceScore(matchedLogins[i], dialogFindLoginStorage);
            }

            matchedLogins.sort(function (a, b) {
                if (a.relevanceScore > b.relevanceScore)
                    return -1;
                if (a.relevanceScore < b.relevanceScore)
                    return 1;
                return 0;
            });

            for (var i = 0; i < matchedLogins.length; i++){
                var item = dialogFindLoginStorage.document.createElement("menuitem");
                item.setAttribute("label", keefox_org.locale.$STRF("matchedLogin.label",
                    [matchedLogins[i].username, matchedLogins[i].host]));
                item.setAttribute("tooltiptext", keefox_org.locale.$STRF("matchedLogin.tip",
                    [matchedLogins[i].title, matchedLogins[i].displayGroupPath, matchedLogins[i].username]));
                item.addEventListener("command", function (event) {
                    keeFoxDialogManager.fill(this.username, this.password);
                }, false);
                item.username = matchedLogins[i].username;
                item.password = matchedLogins[i].password;
                popup.appendChild(item);
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
            dialogFindLoginStorage.document.getElementById("loginTextbox").value = matchedLogins[bestMatch].username;
            dialogFindLoginStorage.document.getElementById("password1Textbox").value = matchedLogins[bestMatch].password;
        }
        if (autoSubmit || dialogFindLoginStorage.mustAutoSubmit)
        {            
            Dialog.onButton0();            
            close();
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
        document.getElementById("loginTextbox").value = username;
        document.getElementById("password1Textbox").value = password;        
        Dialog.onButton0();
        close();
    },
    
    kfCommonDialogOnAccept : function ()
    {
        keefox_org._KFLog.debug("kfCommonDialogOnAccept started");
        try
        {
            if (Dialog.args.promptType == "prompt" ||
                Dialog.args.promptType == "promptUserAndPass" ||
                Dialog.args.promptType == "promptPassword")
            {
                //if (this.host === undefined || this.host === null || this.host.length < 1)
                //    return;

                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
                var parentWindow = wm.getMostRecentWindow("navigator:browser") ||
                    wm.getMostRecentWindow("mail:3pane");

                if (parentWindow.keefox_win._getSaveOnSubmitForSite(this.originalHost)) {
                    keefox_org._KFLog.debug("kfCommonDialogOnAccept5");

                    parentWindow.keefox_win.onHTTPAuthSubmit(
                        parentWindow, document.getElementById("loginTextbox").value,
                        document.getElementById("password1Textbox").value, this.originalHost, this.realm);
                }
            }
        } catch (ex)
        {
            keefox_org._KFLog.warn("KeeFox failed to process the data submitted to a dialog. Exception: " + ex);
            // Do nothing (probably KeeFox has not initialised yet / properly)
        }
        keefox_org._KFLog.debug("kfCommonDialogOnAccept finished");
        Dialog.onButton0();
    },

    KPRPCAuthDialogClosing : function ()
    {
        //TODO:1.6: why doesn't this work? Is it needed?
        //this.kprpcConnObserver.unregister();
    }

};

function KPRPCConnectionObserver()
{
  this.register();
}
KPRPCConnectionObserver.prototype = {
  observe: function(subject, topic, data) {
     if (topic == "KPRPCConnectionClosed")
     {
        // Just close the dialog, SRP protocol will handle the cancellation process
        // but we need to tell it why we are closing
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
        var parentWindow = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
        parentWindow.keefox_org.KeePassRPC.authPromptAborted = true;
        close();
     }
  },
  register: function() {
    var observerService = Components.classes["@mozilla.org/observer-service;1"]
                          .getService(Components.interfaces.nsIObserverService);
    observerService.addObserver(this, "KPRPCConnectionClosed", false);
  },
  unregister: function() {
    var observerService = Components.classes["@mozilla.org/observer-service;1"]
                            .getService(Components.interfaces.nsIObserverService);
    observerService.removeObserver(this, "KPRPCConnectionClosed");
  }
}

keeFoxDialogManager.Logger = keefox_org._KFLog;
keeFoxDialogManager.scriptLoader.loadSubScript(
    "chrome://keefox/content/shared/uriUtils.js", keeFoxDialogManager);
window.addEventListener("load", keeFoxDialogManager.dialogInit, false);
