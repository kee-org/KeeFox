/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This contains code related to the handling of submitted dialogs (e.g. HTTPAuth).

  It runs in a window scope so does not have direct access to the DOM of any given site.

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

/*
 * Called after an HTTP auth (or similar dialog) submission.
 */
keefox_win.onHTTPAuthSubmit = function (win, username, password, schemeAndHost, realm) {
    //do nothing if KeePass is not connected
    if (!keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false)) {
        keefox_win.Logger.info("Form submit handler skipped (no active KeePass database available)");
        return;
    }

    // ignore if there is no URL (this was probably called accidentally
    // from one of the other uses of commonDialog that we can't avoid)
    if (schemeAndHost === undefined || schemeAndHost === null || schemeAndHost === "") {
        keefox_win.Logger.debug("Form submit handler skipped (no URL found)");
        return;
    }

    // We need gBrowser to work out what data needs to be saved
    //TODO:1.6: Do we really? Don't see it used here so maybe we can relax this restraint
    // and find a way to enable password saving in other applications like Thunderbird?
    if (!win.gBrowser)
        return;
    
    // always reset for HTTP Auth dialogs - multi-page logins not supported.
    var currentPage = 1;

    // create a kfLoginInfo object to represent all relevant login details
    var formLogin = keeFoxLoginInfo();

    var loginURLs = [];
    loginURLs.push(schemeAndHost);

    var passwordFields = [];
    var otherFields = [];
    passwordFields[0] = keeFoxLoginField();
    otherFields[0] = keeFoxLoginField();
    otherFields[0].init(
                "username", username, "", "text", currentPage);
    passwordFields[0].init(
                "password", password, "", "password", currentPage);

    formLogin.init(loginURLs, null, realm, 0,
        passwordFields, null, realm, otherFields, currentPage);

    var submitDocumentDataStorage = {};
    submitDocumentDataStorage.formLogin = formLogin;
    submitDocumentDataStorage.formActionURL = "";
    submitDocumentDataStorage.URL = schemeAndHost;
    submitDocumentDataStorage.existingLogin = false;
    submitDocumentDataStorage.currentPage = currentPage;

    // We check to see if the form the user has filled in matches any existing login entry
    // and not bother showing the save password notification if that's the case.
    keefox_org.findLogins(submitDocumentDataStorage.URL, null, realm, null, null, null, null,
        keefox_win._onFormSubmitFindLoginsComplete, submitDocumentDataStorage);
};

/*
 * _onFormSubmitFindLoginsComplete
 *
 * Called in response to a JSON-RPC reply to a request to find logins
 */
keefox_win._onFormSubmitFindLoginsComplete = function (resultWrapper, submitDocumentDataStorage) {
    keefox_win.Logger.debug("_onFormSubmitFindLoginsComplete called");

    var logins = null;
    var convertedResult = [];

    // if no resultWrapper is provided, we just go ahead anyway assuming it's a new login
    if (resultWrapper !== undefined && resultWrapper != null && "result" in resultWrapper
        && resultWrapper.result !== false && resultWrapper.result != null)
    {
        logins = resultWrapper.result;

        for (var i in logins) {
            var kfl = keeFoxLoginInfo();
            kfl.initFromEntry(logins[i]);
            convertedResult.push(kfl);
        }
        logins = convertedResult;

        if (logins != undefined && logins != null) {
            for (var i = 0; i < logins.length; i++) {
                if (submitDocumentDataStorage.formLogin.containedIn(logins[i], false, true, false, false, keefox_win))
                    submitDocumentDataStorage.existingLogin = true;
            }
        }
    }
    
    if (submitDocumentDataStorage.existingLogin) // it's already in the database so ignore
    {
        keefox_win.Logger.info("we are logging in with a known password so doing nothing.");
        return;
    }

    // if we get to this stage, we are faced with a new login or signup submission so prompt user to save details
    keefox_win.Logger.info("password is not recognised so prompting user to save it");

    let messageData = {
        login: submitDocumentDataStorage.formLogin,
        isMultiPage: false
    };
    keefox_win.UI.promptToSavePassword({ data: messageData });
};
