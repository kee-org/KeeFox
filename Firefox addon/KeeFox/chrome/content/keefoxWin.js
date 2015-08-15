/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the main KeeFox javascript file. It is executed once for each firefox
  window (with a different scope each time). javascript files included using 
  Cu.import() are shared across all scopes (windows) while those
  included using loadSubScript() are not. The overall aim is to keep data and
  functions relating to KeePass and other global settings in shared
  objects while those objects which interact with specific windows and UI
  elements are loaded and initialised in each scope. Note that interactions
  with the content DOM are managed from framescript/keefoxTab.js

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

var keefox_win = {};

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Timer.jsm");

// Load our logging subsystem
Cu.import("resource://kfmod/KFLogger.js");
keefox_win.Logger = KeeFoxLog;

// Load our other javascript
keefox_win.scriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                       .getService(Components.interfaces.mozIJSSubScriptLoader);
keefox_win.scriptLoader.loadSubScript("chrome://keefox/content/shared/uriUtils.js", keefox_win);
Cu.import("resource://kfmod/kfDataModel.js");
keefox_win.scriptLoader.loadSubScript("chrome://keefox/content/SearchFilter.js");
keefox_win.scriptLoader.loadSubScript("chrome://keefox/content/panel.js");
keefox_win.scriptLoader.loadSubScript("chrome://keefox/content/context.js");
keefox_win.scriptLoader.loadSubScript("chrome://keefox/content/formsWin.js");
keefox_win.scriptLoader.loadSubScript("chrome://keefox/content/formsSaveWin.js");
keefox_win.scriptLoader.loadSubScript("chrome://keefox/content/notificationManagerWin.js");
keefox_win.scriptLoader.loadSubScript("chrome://keefox/content/persistentPanelWin.js");
keefox_win.scriptLoader.loadSubScript("chrome://keefox/content/PasswordSaver.js");
keefox_win.scriptLoader.loadSubScript("chrome://keefox/content/KFUI.js");
Cu.import("resource://kfmod/KF.js");
keefox_win.scriptLoader.loadSubScript("chrome://keefox/content/KFUtils.js");
Cu.import("resource://kfmod/FAMS.js", keefox_org);

keefox_win.scriptLoader.loadSubScript("chrome://keefox/content/UninstallHelper.js");
keefox_win.uninstallHelper = new keefox_win.UninstallHelper();

// This object listens for the "window loaded" event, fired after
// Firefox finishes loading a window
keefox_win.mainEventHandler =
{
    // the window we are interested in (to prevent events being handled by the wrong instance of keefox_win).
    _assignedWindow: null,

    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIObserver,
                        Components.interfaces.nsIDOMEventListener,
                        Components.interfaces.nsISupportsWeakReference]),

    // nsObserver
    observe: function (subject, topic, data) {
        switch (topic) {
            case "sessionstore-windows-restored":
                keefox_win.Logger.debug("got sessionstore-windows-restored");
                if (keefox_org.utils.urlToOpenOnStartup != null
                    && keefox_org.utils.urlToOpenOnStartup.length > 0) {
                    var toOpen = keefox_org.utils.urlToOpenOnStartup;
                    keefox_org.utils.urlToOpenOnStartup = null;
                    keefox_org.utils._openAndReuseOneTabPerURL(toOpen);
                }
                break;
        }
    },

    notify: function (subject, topic, data) { },

    handleEvent: function (event) {
        keefox_win.Logger.debug("handleEvent: got event " + event.type);

        var currentWindow, inputElement;
        currentWindow = event.target.defaultView;

        if (currentWindow != this._assignedWindow) {
            keefox_win.Logger.debug("not the right window");
            return;
        }
        keefox_win.Logger.debug("it's the right window");

        switch (event.type) {
            case "load":
                // We don't need to know about load events anymore for the life of this window
                window.removeEventListener("load", this, false);

                if (window.gBrowser) { // Firefox only
                    keefox_org.commandManager.setupListeners(currentWindow);

                    // load our user interface panel for FF >= Australis
                    keefox_win.panel.construct(currentWindow);
                    keefox_win.mainUI = keefox_win.panel;

                    // our context menu handler
                    keefox_win.context.construct(currentWindow);

                    // a persistent panel (e.g. for save password notifications)
                    keefox_win.persistentPanel.init();
                }

                
                this.startupKeeFox();
                keefox_win.FAMS = keefox_org.keeFoxGetFamsInst("KeeFox",
                    keefox_org.FirefoxAddonMessageService.prototype.defaultConfiguration,
                    function (msg) { keefox_win.Logger.info.call(this, msg); },
                    window.gBrowser ? // Old-skool notifications if we're not running in Firefox
                        function() { return keefox_win.notificationManager; } :
                        keefox_org.FirefoxAddonMessageService.prototype.getNotifyBox
                    );

                // Load our frame scripts into each tab created by this window
                let windowMM = window.messageManager;
                windowMM.loadFrameScript("chrome://keefox/content/framescript/keefoxTab.js", true);
                windowMM.addMessageListener("keefox:growl", keefox_win.growlListener);
                windowMM.addMessageListener("keefox:isKeePassDatabaseOpen", keefox_win.isKeePassDatabaseOpenListener);
                windowMM.addMessageListener("keefox:DOMContentLoadedHack", keefox_win.DOMContentLoadedHackHandler);
                windowMM.addMessageListener("keefox:isForegroundTab", keefox_win.isForegroundTabListener);
                windowMM.addMessageListener("keefox:promptToSavePassword", keefox_win.UI.promptToSavePassword);
                windowMM.addMessageListener("keefox:showMainKeeFoxPanel", keefox_win.UI.showMainKeeFoxPanel);
                
                if (window.gBrowser) { // Firefox only
                    // Listen for network progress on each tab in this window (maybe some has
                    // already occurred before we get to this point so the auto-fill/submit
                    // behaviour on window startup / session restore could be a bit unpredictable
                    // but we're not offering a "single-click from desktop on Firefox will log you
                    // into your faviourite sites" feature so the impact of this potential race
                    // condition should be limited to a curiosity).
                    window.gBrowser.addTabsProgressListener(keefox_win.progressListener);

                    // Set up tab change event listeners
                    window.gBrowser.tabContainer.addEventListener("TabSelect", keefox_win._onTabSelected, false);
                    window.gBrowser.tabContainer.addEventListener("TabOpen", keefox_win._onTabOpened, false);
                    window.gBrowser.tabContainer.addEventListener("TabSelect", keefox_win.notificationManager.tabSelected, false);
                    window.gBrowser.tabContainer.addEventListener("TabClose", keefox_win.notificationManager.tabClosing, false);
                }

                return;
            case "unload":
                keefox_win.Logger.info("Window shutting down...");

                if (window.gBrowser) { // Firefox only
                    // Remove tab change event listeners
                    window.gBrowser.tabContainer.removeEventListener("TabSelect", keefox_win._onTabSelected, false);
                    window.gBrowser.tabContainer.removeEventListener("TabOpen", keefox_win._onTabOpened, false);
                    window.gBrowser.tabContainer.removeEventListener("TabSelect", keefox_win.notificationManager.tabSelected, false);
                    window.gBrowser.tabContainer.removeEventListener("TabClose", keefox_win.notificationManager.tabClosing, false);
                }

                window.removeEventListener("unload", this, false);
                var observerService = Cc["@mozilla.org/observer-service;1"].
                              getService(Ci.nsIObserverService);
                observerService.removeObserver(this, "sessionstore-windows-restored", false);

                keefox_win.mainUI.shutdown();
                keefox_win.Logger.info("Window shut down.");
                return;
            default:
                keefox_win.Logger.warn("This event was unexpected and has been ignored.");
                return;
        }
    },

    startupKeeFox: function () {
        keefox_win.Logger.info("Testing to see if we've already established whether KeePassRPC is connected.");

        if (keefox_org._keeFoxStorage.get("KeePassRPCActive", false)) {
            keefox_org._KFLog.debug("KeePassRPC is active. Refreshing KeeFox status...");
            keefox_org._refreshKPDB();
            return;
        }
    }
};

keefox_win.progressListener = {
    onLocationChange: function (aBrowser, aWebProgress, aReq, aLoc, aFlags) {
        keefox_win.Logger.debug("onLocationChange keefox_win: " + aFlags);

        // Seems that this is called twice when a page loads at startup. Once automatically
        // during startup and once when tab is first selected (including automatically
        // for the most recently used tab)
        // Also fires (with aFlags=1) for back, forward and refresh (not sure if they can be
        // differentiated yet or if we want to...)

        if (aLoc.spec.startsWith("about:") || aLoc.spec.startsWith("chrome:"))
            return;

        if (window.gBrowser && window.gBrowser.selectedBrowser != aBrowser) {
            keefox_win.Logger.debug("Ignoring a location change because it is not the foreground tab.");
            return;
        }

        // remove all the old logins from the main UI element and context menus
        keefox_win.mainUI.resetSearchInterface();
        keefox_win.mainUI.removeLogins();
        keefox_win.context.removeLogins();
    }
};

keefox_win.DOMContentLoadedHackHandler = function (message)
{
    var browser = message.target;        
    browser.messageManager.sendAsyncMessage("keefox:DOMContentLoaded");
};

keefox_win._onTabOpened = function(event)
{
    //event.target.ownerDocument.defaultView.keefox_win.Logger.debug("_onTabOpened.");
};

keefox_win._onTabSelected = function(event)
{
    var browser = event.target.linkedBrowser;
        
    if (keefox_win.Logger.logSensitiveData)
        keefox_win.Logger.debug("_onTabSelected:" + keefox_win._loadingKeeFoxLogin);
    else
        keefox_win.Logger.debug("_onTabSelected.");

    keefox_win.persistentPanel.onTabSelected();

    // remove all the old logins from the main UI element and context menus
    keefox_win.mainUI.resetSearchInterface();
    keefox_win.mainUI.removeLogins();
    keefox_win.context.removeLogins();

    // If the tab has been selected as part of a one-click login operation we
    // know the usual onLoad form detection will happen
    if (keefox_win._loadingKeeFoxLogin != undefined
    && keefox_win._loadingKeeFoxLogin != null)
    {
        if (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false)) {
            browser.messageManager.sendAsyncMessage("keefox:prepareForOneClickLogin", {
                stateOverride: {
                    "UUID": keefox_win._loadingKeeFoxLogin,
                    "dbFileName": keefox_win._loadingKeeFoxLoginDBFileName,
                    "autoSubmit": true
                }
            });
        }
        // we can clear this information straight away because the framescript now
        // has it available for its own use
        keefox_win._loadingKeeFoxLogin = null;
        keefox_win._loadingKeeFoxLoginDBFileName = null;
    } else
    {
        // We don't notify the user following a tab change since they would
        // have to look at the main KeeFox panel to find matched login results anyway
        if (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false))
        {
                browser.messageManager.sendAsyncMessage("keefox:findMatches", {
                    autofillOnSuccess: false,
                    autosubmitOnSuccess: false,
                    notifyUserOnSuccess: false
                });
        }
    }
};

// Listen for requests to deliver foreground tab status to frame scripts
keefox_win.isForegroundTabListener = function (message) {
    if (window.gBrowser) {
        let isForegroundTab = window.gBrowser.selectedBrowser == message.target;
        return isForegroundTab;
    }
    return false;
};

// Listen for requests to deliver logged-in status to frame scripts
keefox_win.isKeePassDatabaseOpenListener = function (message) {
    let isOpen = keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false);
    keefox_win.Logger.debug("Database is open: " + isOpen);
    return isOpen;
};

// Listen for requests to display a growl to the user
keefox_win.growlListener = function (message) {
    keefox_win.UI.growl(message.data.title, message.data.text, message.data.clickToShowPanel);
};

// keefox_org has been setup already (at the end of KF.js) but the window-specific
// setup has to wait until Firefox triggers an event listener to say that the
// window is ready to be used
// ... unless creation of KF object failed for some reason (conflicting extension?)
if (keefox_org != null) {
    keefox_win.mainEventHandler._assignedWindow = window;
    window.addEventListener("load", keefox_win.mainEventHandler, false);
    window.addEventListener("unload", keefox_win.mainEventHandler, false);

    Cc["@mozilla.org/observer-service;1"].
        getService(Ci.nsIObserverService).
        addObserver(keefox_win.mainEventHandler, "sessionstore-windows-restored", false);
} else {
    keefox_win.Logger.error("KeeFox module startup was NOT ATTEMPTED. Maybe there is a conflicting extension that prevents startup?");
}
