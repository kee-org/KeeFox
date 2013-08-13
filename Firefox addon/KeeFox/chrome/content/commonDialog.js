/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
Copyright 2008-2011 Chris Tomlinson <keefox@christomlinson.name>
  
This hooks onto every common dialog in Firefox and for any dialog that contains one
username and one password (with the usual Firefox field IDs) it will discover
any matching logins and depending on preferences, etc. it will fill in the
dialog fields and/or populate a drop down box containing all of the matching logins.

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
"can't use strict"; // no errors - it just doesn't work

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cu = Components.utils;

Cu.import("resource://kfmod/KF.jsm");

var keeFoxDialogManager = {

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
            var versionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"].
                getService(Components.interfaces.nsIVersionComparator);
            this.__imapBundleUsesStrings = versionComparator.compare(Application.version, "25.0a1") >= 0;
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
        try
        {
            document.getElementById("commonDialog").setAttribute("windowtype","common-dialog");
            keeFoxDialogManager.prepareFill();
        } catch (exception) {
            keefox_org._KFLog.error(exception);
        }
    },
    
    realm: null,
    host: null,
    
    prepareFill : function()
    {
        if (Dialog.args.promptType == "prompt" || // username only
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
            
            /* handle cases for username only prompt */
            if (Dialog.args.promptType == "prompt") {
                // are there any cases where we are asked for username only?
            }
            
            if (parentWindow.gBrowser)
            { // firefox (or other application that understands gBrowser)
                var currentGBrowser = parentWindow.gBrowser;
                var domWin = parentWindow;
                var domDoc = currentGBrowser.contentDocument;                    
                var mainWindow = domWin.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                        .getInterface(Components.interfaces.nsIWebNavigation)
                        .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                        .rootTreeItem
                        .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                        .getInterface(Components.interfaces.nsIDOMWindow); 
                               
                var currentTab = currentGBrowser.selectedTab;
                var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                        .getService(Components.interfaces.nsISessionStore);
                    
                // we always remove this - multi-page HTTP Auth forms are not supported.
                var removeTabSessionStoreData = true;                            
                                    
                // see if this tab has our special attributes and promote them to session data
                //TODO2: Some of this block is probably redundant
                // unless we add support for multi-page logins
                if (currentTab.hasAttribute("KF_uniqueID"))
                {
                    keefox_org._KFLog.debug("has uid");                
                    ss.setTabValue(currentTab, "KF_uniqueID", currentTab.getAttribute("KF_uniqueID"));
                    ss.setTabValue(currentTab, "KF_dbFileName", currentTab.getAttribute("KF_dbFileName"));
                    ss.setTabValue(currentTab, "KF_autoSubmit", "yes");
                    mustAutoSubmit = true;
                    currentTab.removeAttribute("KF_uniqueID");
                    currentTab.removeAttribute("KF_dbFileName");
                }
                    
                ss.setTabValue(currentTab, "KF_formSubmitTrackerCount", 0);
                ss.setTabValue(currentTab, "KF_pageLoadSinceSubmitTrackerCount", 0);       
                
                if (removeTabSessionStoreData)
                {
                    // remove the data that helps us track multi-page logins, etc.
                    keefox_org._KFLog.debug("Removing the data that helps us track multi-page logins, etc.");
                    parentWindow.keefox_win.toolbar.clearTabFormRecordingData();
                    parentWindow.keefox_win.toolbar.clearTabFormFillData();                
                }
            } // end if (parentWindow.gBrowser)
            
            host = "";
            realm = "";
            username = ""; // currently not used in FireFox, but may be in future
            
            /* handle cases for password only prompt in thunderbird */
            if (Application.id == "{3550f703-e582-4d05-9a08-453d09bdfdc6}")
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
                        protocols[aDialogType] = aDialogType.split("-")[0];
                        titles[aDialogType] = aStringBundle.GetStringFromName(aTitlePropertyName);
                        prompts[aDialogType] = aStringBundle.GetStringFromName(aPromptPropertyName);
                        // use null as a flag to indicate that there was only one
                        // placeholder and hostIsFirst and secondIsUserName are not applicable
                        hostIsFirst[aDialogType] = null;
                        if (aUserPlaceholder != null)
                        {
                            hostIsFirst[aDialogType] = prompts[aDialogType].indexOf(aHostPlaceholder) <
                                prompts[aDialogType].indexOf(aUserPlaceholder);
                            secondIsUserName[aDialogType] = true;
                        }
                        if (aRealmPlaceholder != null)
                        {
                            hostIsFirst[aDialogType] = prompts[aDialogType].indexOf(aHostPlaceholder) <
                                prompts[aDialogType].indexOf(aRealmPlaceholder);
                            secondIsUserName[aDialogType] = false;
                        }
                        prompts[aDialogType] = prompts[aDialogType].replace(aHostPlaceholder, "(.+)");
                        if (aUserPlaceholder != null)
                        {
                            prompts[aDialogType] = prompts[aDialogType].replace(aUserPlaceholder, "(.+)");
                        }
                        if (aRealmPlaceholder != null)
                        {
                            prompts[aDialogType] = prompts[aDialogType].replace(aRealmPlaceholder, "(.+)");
                        }
                        extractUserFromHost[aDialogType] = aExtractUserFromHost;
                    }
                }
                  
                LoadDialogData(this._composeBundle, "smtp", "smtpEnterPasswordPromptTitle",
                    "smtpEnterPasswordPromptWithUsername", "%1$S", null, "%2$S");
                LoadDialogData(this._imapMsgsBundle, "imap",
                    this._imapBundleUsesStrings ? "imapEnterPasswordPromptTitle" : "5051",
                    this._imapBundleUsesStrings ? "imapEnterPasswordPrompt" : "5047",
                    "%S", null, null, true);
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
                    currentRealmL10nPattern = this._promptBundle.GetStringFromName("EnterLoginForRealm");
                }

                var realmFirst = false;
                if (currentRealmL10nPattern.indexOf("%2$S") > currentRealmL10nPattern.indexOf("%1$S"))
                    realmFirst = true;

                currentRealmL10nPattern = currentRealmL10nPattern.replace("%2$S","(.+)").replace("%1$S","(.+)");
                regEx = new RegExp(currentRealmL10nPattern);

                matches = document.getElementById("info.body").firstChild.nodeValue.match(regEx);
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
                    currentProxyL10nPattern = this._cdBundle.GetStringFromName("EnterLoginForProxy");
                } catch (exception)
                {
                    currentProxyL10nPattern = this._promptBundle.GetStringFromName("EnterLoginForProxy");
                }

                realmFirst = false;
                if (currentProxyL10nPattern.indexOf("%2$S") > currentProxyL10nPattern.indexOf("%1$S"))
                    realmFirst = true;

                currentProxyL10nPattern = currentProxyL10nPattern.replace("%2$S","(.+)").replace("%1$S","(.+)");
                regEx = new RegExp(currentProxyL10nPattern);

                matches = document.getElementById("info.body").firstChild.nodeValue.match(regEx);
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
                    currentProxyL10nPattern = this._cdBundle.GetStringFromName("EnterUserPasswordFor");
                } catch (exception)
                {
                    currentProxyL10nPattern = this._promptBundle.GetStringFromName("EnterUserPasswordFor");
                }

                currentProxyL10nPattern = currentProxyL10nPattern.replace("%1$S","(.+)");
                regEx = new RegExp(currentProxyL10nPattern);

                matches = document.getElementById("info.body").firstChild.nodeValue.match(regEx);
                if (matches !== null && typeof matches[1] !== "undefined")  {
                        host = matches[1];
                }
            }
            
            if (host.length < 1) {
              return;
            }
                
            // try to pick out the host from the full protocol, host and port
            this.originalHost = host;
            try
            {
                var ioService = Components.classes["@mozilla.org/network/io-service;1"].
                    getService(Components.interfaces.nsIIOService);
                var uri = ioService.newURI(host, null, null);
                host = uri.host;            
            } catch (exception) {
                if (keefox_org._KFLog.logSensitiveData)
                    keefox_org._KFLog.debug("Exception occured while trying to extract the host from this string: " + host + ". " + exception);
                else
                    keefox_org._KFLog.debug("Exception occured while trying to extract the host from a string");
            }
            
            this.realm = realm;
            this.host = host;
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
            // find all the logins
            var requestId = keefox_org.findLogins(keeFoxDialogManager.originalHost,
                null, keeFoxDialogManager.realm, null, null, null,
                keeFoxDialogManager.username, keeFoxDialogManager.autoFill);
            window.keefox_win.ILM.dialogFindLoginStorages[requestId] = dialogFindLoginStorage;
        }
    },
    
    // fill in the dialog with the first matched login found and/or the list of all matched logins
    autoFill : function(resultWrapper)
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
            logins = resultWrapper.result; 
            
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
        var dialogFindLoginStorage = window.keefox_win.ILM.dialogFindLoginStorages[resultWrapper.id];
        
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
                    'httpRealm' : foundLogins[i].httpRealm });
                showList = true;                

            } catch (e) {
                keefox_org._KFLog.error(e);
            }
        }
        
        var bestMatch = 0;      
        
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
                item.addEventListener("command", function (event) { keeFoxDialogManager.fill(this.username, this.password); }, false);
                item.username = matchedLogins[i].username;
                item.password = matchedLogins[i].password;
                popup.appendChild(item);
                
                // crude attempt to find the best match for this realm
                //TODO2: Improve accuracy here for when multiple logins have the correct or no realm 
                if (dialogFindLoginStorage.realm == matchedLogins[i].httpRealm)
                    bestMatch = i;
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
    
    fill : function (username, password)
    {
        document.getElementById("loginTextbox").value = username;
        document.getElementById("password1Textbox").value = password;        
        Dialog.onButton0();
        close();
    },
    
    kfCommonDialogOnAccept : function ()
    {
        try
        {
            if (Dialog.args.promptType == "prompt" ||
                Dialog.args.promptType == "promptUserAndPass" ||
                Dialog.args.promptType == "promptPassword")
            {
                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
                var parentWindow = wm.getMostRecentWindow("navigator:browser") ||
                    wm.getMostRecentWindow("mail:3pane");
                if (parentWindow.keefox_win.ILM._getSaveOnSubmitForSite(this.host))
                    parentWindow.keefox_win.ILM._onHTTPAuthSubmit(parentWindow,document.getElementById("loginTextbox").value,
                        document.getElementById("password1Textbox").value, this.host, this.realm);
            }
        } catch (ex)
        {
            // Do nothing (probably KeeFox has not initialised yet / properly)
        }
        Dialog.onButton0();
    }
};

window.addEventListener("load", keeFoxDialogManager.dialogInit, false); //ael - does this need to be removed, if so where from?