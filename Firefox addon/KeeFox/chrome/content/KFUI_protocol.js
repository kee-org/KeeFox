/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the KeeFox Improved Login Manager protocol authentication javascript file.
  This extends the KFILM object with functions that support the fill and sort
  features in protocol authentication login boxes.
  
  Some of the code is based on Mozilla's LoginManagerPrompt.js, used under
  GPL 2.0 terms. Lots of the functions are currently unused and really just
  there in case they prove useful in the future.

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

/* ==================== LoginManagerPrompter ==================== */

/*
 * LoginManagerPrompter
 *
 * Implements interfaces for prompting the user to enter/save/change auth info.
 *
 * nsIAuthPrompt: Used by SeaMonkey, Thunderbird, but not Firefox.
 *
 * nsIAuthPrompt2: Is invoked by a channel for protocol-based authentication
 * (eg HTTP Authenticate, FTP login).
 *
 * nsILoginManagerPrompter: Used by Login Manager for saving/changing logins
 * found in HTML forms.
 */


    /* ---------- nsIAuthPrompt2 prompts ---------- */




    /*
     * promptAuth
     *
     * Implementation of nsIAuthPrompt2.
     *
     * nsIChannel aChannel
     * int        aLevel
     * nsIAuthInformation aAuthInfo
     */
    KFUI.prototype.promptAuth = function (aChannel, aLevel, aAuthInfo) {
        var selectedLogin = null;
        var checkbox = { value : false };
        var checkboxLabel = null;
        var epicfail = false;

        try {

            // If the user submits a login but it fails, we need to remove the
            // notification bar that was displayed. Conveniently, the user will
            // be prompted for authentication again, which brings us here.
            var notifyBox = this._getNotifyBox();
            if (notifyBox)
                this._removeSaveLoginNotification(notifyBox);

            var [hostname, httpRealm] = this._getAuthTarget(aChannel, aAuthInfo);


            // Looks for existing logins to prefill the prompt with.
            var foundLogins = this._pwmgr.findLogins({},
                                        hostname, null, httpRealm);
            KFLog.info("found " + foundLogins.length + " matching logins.");

            // XXX Can't select from multiple accounts yet. (bug 227632)
            if (foundLogins.length > 0) {
                selectedLogin = foundLogins[0];
                this._SetAuthInfo(aAuthInfo, selectedLogin.username,
                                             selectedLogin.password);
                checkbox.value = true;
            }

            var canRememberLogin = this._pwmgr.getLoginSavingEnabled(hostname);
        
            // if checkboxLabel is null, the checkbox won't be shown at all.
            if (canRememberLogin && !notifyBox)
                checkboxLabel = this._getLocalizedString("rememberPassword");
        } catch (e) {
            // Ignore any errors and display the prompt anyway.
            epicfail = true;
            Components.utils.reportError("LoginManagerPrompter: " +
                "Epic fail in promptAuth: " + e + "\n");
        }

        var ok = this._promptService.promptAuth(this._window, aChannel,
                                aLevel, aAuthInfo, checkboxLabel, checkbox);

        // If there's a notification box, use it to allow the user to
        // determine if the login should be saved. If there isn't a
        // notification box, only save the login if the user set the
        // checkbox to do so.
        var rememberLogin = notifyBox ? canRememberLogin : checkbox.value;
        if (!ok || !rememberLogin || epicfail)
            return ok;

        try {
            var [username, password] = this._GetAuthInfo(aAuthInfo);
            var title = doc.title;
            var loginURLs = Components.classes["@mozilla.org/array;1"]
                        .createInstance(Components.interfaces.nsIMutableArray);
            var loginURL = Components.classes["@christomlinson.name/kfURL;1"]
                        .createInstance(Components.interfaces.kfIURL);
            loginURL.URL = hostname;
            loginURLs.appendElement(loginURL,false);
            var newLogin = Cc["@mozilla.org/login-manager/loginInfo;1"].
                           createInstance(Ci.nsILoginInfo);
            newLogin.init(loginURLs, null, httpRealm,
                          username, password, "", "", null, title);

            // XXX We can't prompt with multiple logins yet (bug 227632), so
            // the entered login might correspond to an existing login
            // other than the one we originally selected.
            selectedLogin = this._repickSelectedLogin(foundLogins, username);

            // If we didn't find an existing login, or if the username
            // changed, save as a new login.
            if (!selectedLogin) {
                // add as new
                if (KFLog.logSensitiveData)
                    KFLog.info("New login seen for " + username +
                         " @ " + hostname + " (" + httpRealm + ")");
                else
                    KFLog.info("New login seen for a HTTP protocol auth request");
                if (notifyBox)
                    this._showSaveLoginNotification(notifyBox, newLogin, isMultiPage);
                else
                    this._pwmgr.addLogin(newLogin, null);

            } else if (password != selectedLogin.password) {
                if (KFLog.logSensitiveData)
                    KFLog.info("Updating password for " + username +
                         " @ " + hostname + " (" + httpRealm + ")");
                else
                    KFLog.info("Updating password for a HTTP protocol auth request");
                // update password
                this._pwmgr.modifyLogin(selectedLogin, newLogin);

            } else {
                KFLog.info("Login unchanged, no further action needed.");
            }
        } catch (e) {
            Components.utils.reportError("LoginManagerPrompter: " +
                "Fail2 in promptAuth: " + e + "\n");
        }

        return ok;
    }

    KFUI.prototype.asyncPromptAuth = function () {
        return NS_ERROR_NOT_IMPLEMENTED;
    }



    /* ---------- Internal Methods ---------- */



    /*
     * _getAuthTarget
     *
     * Returns the hostname and realm for which authentication is being
     * requested, in the format expected to be used with nsILoginInfo.
     */
    KFUI.prototype._getAuthTarget = function (aChannel, aAuthInfo) {
        var hostname, realm;

        // If our proxy is demanding authentication, don't use the
        // channel's actual destination.
        if (aAuthInfo.flags & Ci.nsIAuthInformation.AUTH_PROXY) {
            KFLog.debug("getAuthTarget is for proxy auth");
            if (!(aChannel instanceof Ci.nsIProxiedChannel))
                throw "proxy auth needs nsIProxiedChannel";

            var info = aChannel.proxyInfo;
            if (!info)
                throw "proxy auth needs nsIProxyInfo";

            // Proxies don't have a scheme, but we'll use "moz-proxy://"
            // so that it's more obvious what the login is for.
            var idnService = Cc["@mozilla.org/network/idn-service;1"].
                             getService(Ci.nsIIDNService);
            hostname = "moz-proxy://" +
                        idnService.convertUTF8toACE(info.host) +
                        ":" + info.port;
            realm = aAuthInfo.realm;
            if (!realm)
                realm = hostname;

            return [hostname, realm];
        }

        hostname = this._getFormattedHostname(aChannel.URI);

        // If a HTTP WWW-Authenticate header specified a realm, that value
        // will be available here. If it wasn't set or wasn't HTTP, we'll use
        // the formatted hostname instead.
        realm = aAuthInfo.realm;
        if (!realm)
            realm = hostname;

        return [hostname, realm];
    }


    /**
     * Returns [username, password] as extracted from aAuthInfo (which
     * holds this info after having prompted the user).
     *
     * If the authentication was for a Windows domain, we'll prepend the
     * return username with the domain. (eg, "domain\user")
     */
    KFUI.prototype._GetAuthInfo = function (aAuthInfo) {
        var username, password;

        var flags = aAuthInfo.flags;
        if (flags & Ci.nsIAuthInformation.NEED_DOMAIN && aAuthInfo.domain)
            username = aAuthInfo.domain + "\\" + aAuthInfo.username;
        else
            username = aAuthInfo.username;

        password = aAuthInfo.password;

        return [username, password];
    }


    /**
     * Given a username (possibly in DOMAIN\user form) and password, parses the
     * domain out of the username if necessary and sets domain, username and
     * password on the auth information object.
     */
    KFUI.prototype._SetAuthInfo = function (aAuthInfo, username, password) {
        var flags = aAuthInfo.flags;
        if (flags & Ci.nsIAuthInformation.NEED_DOMAIN) {
            // Domain is separated from username by a backslash
            var idx = username.indexOf("\\");
            if (idx == -1) {
                aAuthInfo.username = username;
            } else {
                aAuthInfo.domain   =  username.substring(0, idx);
                aAuthInfo.username =  username.substring(idx+1);
            }
        } else {
            aAuthInfo.username = username;
        }
        aAuthInfo.password = password;
    }

