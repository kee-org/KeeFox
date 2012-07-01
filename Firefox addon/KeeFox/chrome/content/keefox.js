/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2012 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the main KeeFox javascript file. It is executed once for each firefox
  window (with a different scope each time). javascript files included using 
  Components.utils.import() are shared across all scopes (windows) while those
  included using loadSubScript() are not. The overall aim is to keep data and
  functions relating to KeePass and other global settings in a shared
  objects while those objects which interact with specific windows and toolbars are
  loaded and initialised in each scope.

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

var keefox_org = {};

keefox_org.shouldLoad = true;
// Currently nothing that should prevent KeeFox loading - there was in the past
// and maybe will be again in future so keeping this check in place
if (keefox_org.shouldLoad)
{
    Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

    // Load our logging subsystem
    Components.utils.import("resource://kfmod/KFLogger.js");
    keefox_org.Logger = KFLog;
    // Load our other javascript
    keefox_org.scriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                           .getService(Components.interfaces.mozIJSSubScriptLoader); 
    Components.utils.import("resource://kfmod/kfDataModel.js");
    keefox_org.scriptLoader.loadSubScript("resource://kfscripts/KFToolBar.js"); 
    keefox_org.scriptLoader.loadSubScript("resource://kfscripts/KFILM.js"); 
    keefox_org.scriptLoader.loadSubScript("resource://kfscripts/KFUI.js"); 
    Components.utils.import("resource://kfmod/KF.js");
    keefox_org.scriptLoader.loadSubScript("resource://kfscripts/KFUtils.js"); 

    Components.utils.import("resource://kfmod/FAMS.js");

    // This object listens for the "window loaded" event, fired after
    // Firefox finishes loading a window
    keefox_org.mainEventHandler =
    {
        // a reference to this scope's KF object
        _kf: null,

        //TODO2:???
        _currentKFToolbar: null,

        // the window we are interested in (see below for performance improvement option)
        _assignedWindow: null,

        QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIObserver,
                            Components.interfaces.nsIDOMEventListener,
                            Components.interfaces.nsISupportsWeakReference]),

        // nsObserver
        observe: function (subject, topic, data) {
            //var doc;
            switch (topic) {
                case "sessionstore-windows-restored":
                    KFLog.debug("got sessionstore-windows-restored");
                    if (keeFoxInst.urlToOpenOnStartup != null && keeFoxInst.urlToOpenOnStartup.length > 0) {
                        var toOpen = keeFoxInst.urlToOpenOnStartup;
                        keeFoxInst.urlToOpenOnStartup = null;
                        keeFoxInst._openAndReuseOneTabPerURL(toOpen);
                    }
                    break;
            }
        },

        notify: function (subject, topic, data) { },

        handleEvent: function (event) {
            KFLog.debug("handleEvent: got event " + event.type);

            var currentWindow, inputElement;
            currentWindow = event.target.defaultView;

            // proving we can get to the navigator for future use...
            // this._kf.log(currentWindow.navigator.buildID);

            if (currentWindow != this._assignedWindow && event.type != "KeeFoxClearTabFormFillData") {
                KFLog.debug("not the right window");
                return;
            }
            KFLog.debug("it's the right window");

            // we only care about "load" events for the moment at least
            switch (event.type) {
                case "load":
                    // We don't need to know about load events anymore for the life of this window
                    window.removeEventListener("load", this, false);

                    // our toolbar (+ a bit more, maybe needs renaming
                    // in future if I can think of something better)
                    keefox_org.toolbar = new KFToolbar(currentWindow);

                    // an event listener on the toolbar clears session data relating to
                    // the form filling process. ATOW only called in response to user
                    // editing form field contents.
                    document.addEventListener("KeeFoxClearTabFormFillData", keefox_org.mainEventHandler, false, true); //ael OK

                    // the improved login manager which acts (a bit) like a bridge
                    // between the user visible code and the KeeFox module / JSON-RPC    
                    keefox_org.ILM = new KFILM(keeFoxInst, keefox_org.toolbar, currentWindow);

                    // the main UI code including things like
                    // the generation of notification boxes
                    keefox_org.UI = new KFUI();
                    keefox_org.UI.init(keeFoxInst, keefox_org.ILM);

                    if (window.gBrowser) { // Firefox only
                        // Set up tab change event listeners
                        window.gBrowser.tabContainer.addEventListener("TabSelect", keeFoxInst._onTabSelected, false);
                        window.gBrowser.tabContainer.addEventListener("TabOpen", keeFoxInst._onTabOpened, false);
                    }
                    this.startupKeeFox(keefox_org.toolbar, currentWindow);
                    keefox_org.FAMS = keeFoxGetFamsInst("KeeFox", FirefoxAddonMessageService.prototype.defaultConfiguration, function (msg) { KFLog.info.call(this, msg); });
                                                            
                    return;
                case "unload":
                    KFLog.info("Window shutting down...");

                    if (window.gBrowser) { // Firefox only
                        // Remove tab change event listeners
                        window.gBrowser.tabContainer.removeEventListener("TabSelect", keeFoxInst._onTabSelected, false);
                        window.gBrowser.tabContainer.removeEventListener("TabOpen", keeFoxInst._onTabOpened, false);
                    }

                    window.removeEventListener("unload", this, false);
                    var observerService = Cc["@mozilla.org/observer-service;1"].
                                  getService(Ci.nsIObserverService);
                    observerService.removeObserver(this, "sessionstore-windows-restored", false);

                    keefox_org.ILM.shutdown();
                    document.removeEventListener("KeeFoxClearTabFormFillData", keefox_org.mainEventHandler, false);
                    keefox_org.toolbar.shutdown();
                    KFLog.info("Window shut down.");
                    return;
                case "KeeFoxClearTabFormFillData":
                    keefox_org.toolbar.clearTabFormFillData(event);
                    return;
                default:
                    KFLog.warn("This event was unexpected and has been ignored.");
                    return;
            }
        },

        startupKeeFox: function (currentKFToolbar, currentWindow) {
            keefox_org.Logger.info("Testing to see if we've already established whether KeePassRPC is connected.");

            if (keeFoxInst._keeFoxStorage.get("KeePassRPCActive", false)) {
                keeFoxInst._KFLog.debug("Setup has already been done but we will make sure that the window that this scope is a part of has been set up to properly reflect KeeFox status");
                keeFoxInst._refreshKPDB();
                //currentKFToolbar.setupButton_ready(currentWindow);
                //currentKFToolbar.setAllLogins();
                return;
            }
        }
    };

    // keeFoxInst has been setup already (at the end of KF.js) but the window-specific
    // setup has to wait until Firefox triggers an event listener to say that the
    // window is ready to be used
    // ... unless creation of KF object failed for some reason (conflicting extension?)
    if (keeFoxInst != null)
    {    
        keefox_org.mainEventHandler._kf = keeFoxInst;
        keefox_org.mainEventHandler._assignedWindow = window;
        window.addEventListener("load", keefox_org.mainEventHandler, false);
        window.addEventListener("unload", keefox_org.mainEventHandler, false);
        
        var observerService = Cc["@mozilla.org/observer-service;1"].
                                  getService(Ci.nsIObserverService);                          
        observerService.addObserver(keefox_org.mainEventHandler, "sessionstore-windows-restored", false);        
    } else
    {
        KFLog.warn("KeeFox module startup was NOT ATTEMPTED. Maybe there is a conflicting extension that prevents startup?");
    }
}