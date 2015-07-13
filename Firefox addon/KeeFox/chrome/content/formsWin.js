/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This contains code related to the management and manipulation of forms and form fields.

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

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cu = Components.utils;

// For tracking which KPRPC requests belong to which tab/framescript
keefox_win.requestorMap = [];

/*
 * findLogins
 *
 * Search for the known logins for entries matching the specified criteria.
 */
keefox_win.findLogins = function (url, formSubmitURL, httpRealm, uniqueID,
    dbFileName, freeText, username, callback, callbackData)
{
    keefox_win.Logger.info("Searching for logins", " matching URL: " + url +
        ", formSubmitURL: " + formSubmitURL + ", httpRealm: " + httpRealm
         + ", uniqueID: " + uniqueID);

    return keefox_org.findLogins(url, formSubmitURL, httpRealm, uniqueID,
        dbFileName, freeText, username, callback, callbackData);
};
    
// Listen for requests to find logins and forward them up the chain towards KeePass
keefox_win.findLoginsListener = function (message)
{
    // Send results to the right place...
    let resultHandler = keefox_win.findLoginsResultDispatcher;
    if (message.data.formSubmitted)
        resultHandler = keefox_win.findLoginsForSubmittedFormResultDispatcher;

    let requestId = keefox_win.findLogins(message.data.url, message.data.realm,
        null, null, null, null, null, resultHandler, message.data.callbackData);
    keefox_win.requestorMap[requestId] = message.target;
    return requestId;
};

// Send the results of the findLogins request to the tab that requested the search
keefox_win.findLoginsResultDispatcher = function (resultWrapper)
{
    
    keefox_win.requestorMap[resultWrapper.id].messageManager.sendAsyncMessage(
        "keefox:findLoginsResult", { "resultWrapper": resultWrapper });
    // no need to keep the reference lying around once we've recieved our result
    delete keefox_win.requestorMap[resultWrapper.id];
};

// Send the results of the findLogins request to the tab that requested the search
keefox_win.findLoginsForSubmittedFormResultDispatcher = function (resultWrapper, callbackData)
{
    
    keefox_win.requestorMap[resultWrapper.id].messageManager.sendAsyncMessage(
        "keefox:findLoginsForSubmittedFormResult", {
            "resultWrapper": resultWrapper,
            "submitDocumentDataStorage": callbackData
        });
    // no need to keep the reference lying around once we've recieved our result
    delete keefox_win.requestorMap[resultWrapper.id];
};

window.messageManager.addMessageListener("keefox:findLogins", keefox_win.findLoginsListener);

keefox_win.loadAndAutoSubmit = function (button, ctrlClick, URL, uniqueID, dbFileName)
{
    if (keefox_win.Logger.logSensitiveData)
        keefox_win.Logger.debug("loading and auto submitting button " + button + ctrlClick + ":" + URL);
    else
        keefox_win.Logger.debug("loading and auto submitting button " + button + ctrlClick + "..."); 

    keefox_org.metricsManager.pushEvent ("feature", "loadAndAutoSubmit");
               
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
             .getService(Components.interfaces.nsIWindowMediator);
    var newWindow = wm.getMostRecentWindow("navigator:browser") ||
        wm.getMostRecentWindow("mail:3pane");
    var b = newWindow.getBrowser();
       
    if (button == 1 || (button == 0 && ctrlClick)) {
        this._loadingKeeFoxLogin = uniqueID;
        this._loadingKeeFoxLoginDBFileName = dbFileName;
        b.loadOneTab(URL, null, null, null, false, null);
    }
    else {
        gBrowser.selectedBrowser.messageManager.sendAsyncMessage("keefox:prepareForOneClickLogin", {
            stateOverride: {
                "UUID": uniqueID,
                "dbFileName": dbFileName,
                "autoSubmit": true
            }
        });
        //TODO:1.6: This doesn't usually work because Firefox deletes our framescript
        // code when navigating from about:newtab
        b.loadURI(URL, null, null);
    }
};

// Forward request to content scope of current tab
keefox_win.fillAndSubmit = function (automated, frameKey, formIndex, loginIndex)
{
    gBrowser.selectedBrowser.messageManager.sendAsyncMessage(
            "keefox:fillAndSubmit", { "automated": automated, "frameKey": frameKey, "formIndex": formIndex, "loginIndex": loginIndex });
}
    
keefox_win._getSaveOnSubmitForSite = function (siteURL) {
    var showSaveNotification = false;
    if (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false)) {
        // We don't do this unless we think we have a KeePassRPC connection
        let conf = keefox_org.config.getConfigForURL(siteURL);
        if (!conf.preventSaveNotification)
            showSaveNotification = true;
    }
    return showSaveNotification;
};
