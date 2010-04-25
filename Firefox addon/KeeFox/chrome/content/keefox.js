/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2010 Chris Tomlinson <keefox@christomlinson.name>
  
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

// Load our logging subsystem
Components.utils.import("resource://kfmod/KFLogger.js");
var KFLogger = KFLog;
// Load our other javascript
var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                       .getService(Components.interfaces.mozIJSSubScriptLoader); 
Components.utils.import("resource://kfmod/kfDataModel.js");
loader.loadSubScript("resource://kfscripts/KFToolBar.js"); 
loader.loadSubScript("resource://kfscripts/KFILM.js"); 
loader.loadSubScript("resource://kfscripts/KFUI.js"); 
Components.utils.import("resource://kfmod/KF.js");
loader.loadSubScript("resource://kfscripts/KFUtils.js"); 
loader.loadSubScript("resource://kfscripts/KFtest.js"); 

// These variables are accessible from (and specific to) the current
// window scope.
var keeFoxToolbar, keeFoxILM, keeFoxUI, KFtester;

// This object listens for the "window loaded" event, fired after
// Firefox finishes loading a window
var keeFoxEventHandler =
{
    // a reference to this scope's KF object
    _kf: null,
    
    //???
    _currentKFToolbar : null,
    
    // the window we are interested in (see below for performance improvement option)
    _assignedWindow : null,

    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIDOMEventListener,   
                        Components.interfaces.nsISupportsWeakReference,
                        Ci.nsIObserver, Ci.nsISupportsWeakReference]),
       
    // nsObserver
    observe : function (subject, topic, data)
    {
        switch(topic)
        {
            //case "sessionstore-windows-restored":
               // this._kf._keeFoxBrowserStartup(this._currentKFToolbar, this._currentKFToolbar._currentWindow);
              //  break;
            case "quit-application":
                KFLog.info("Application is shutting down...");
                _kf.shutdown();
                KFLog.info("KeeFox has nearly shut down.");
                var observerService = Cc["@mozilla.org/observer-service;1"].
                              getService(Ci.nsIObserverService);
                observerService.removeObserver(this, "quit-application"); 
                
                KFLog.info("KeeFox has shut down.");
                break;
        }

    },
    
    notify : function (subject, topic, data) { },
    
    handleEvent: function(event)
    {
        KFLog.debug("handleEvent: got event " + event.type);

        var currentWindow, inputElement;
        currentWindow = event.target.defaultView;
        
        // proving we can get to the navigator for future use...
        // this._kf.log(currentWindow.navigator.buildID);
        
        if (currentWindow != this._assignedWindow)
        {
            KFLog.debug("not the right window");
            return;
        }
        KFLog.debug("it's the right window");
        
        // we only care about "load" events for the moment at least
        switch (event.type)
        {
            case "load":            
                // our toolbar (+ a bit more, maybe needs renaming
                // in future if I can think of something better)
                keeFoxToolbar = new KFToolbar(currentWindow);
                
                // an event listener on the toolbar clears session data relating to
                // the form filling process. ATOW only called in response to user
                // editing form field contents.
                document.addEventListener("KeeFoxClearTabFormFillData", this, false, true);
//                document.addEventListener("KeeFoxClearTabFormFillData", function(e)
//                    { keeFoxToolbar.clearTabFormFillData(e); }, false, true);
                    
                // the improved login manager which acts (a bit) like a bridge
                // between the user visible code and the KeeFox module / JSON-RPC    
                keeFoxILM = new KFILM(keeFoxInst,keeFoxToolbar,currentWindow);
                
                // the main UI code including things like
                // the generation of notification boxes
                keeFoxUI = new KFUI();
                keeFoxUI.init(keeFoxInst, keeFoxILM);
                
                //keeFoxInst.init(keeFoxToolbar,currentWindow);
                this.startupKeeFox(keeFoxToolbar,currentWindow);
                

                // Used to aid testing of various KeeFox features
                // (arguably is not needed in version 1.0 but I may keep it
                // just in case unless performance is noticably worse with it)
                //KFtester = new KFtests(keeFoxILM);

                return;
            case "unload": 
                KFLog.info("Window shutting down...");
                
                
                window.removeEventListener("load", this, false);
                window.removeEventListener("unload", this, false);
                keeFoxILM.shutdown();
                document.removeEventListener("KeeFoxClearTabFormFillData", this, false);
                keeFoxToolbar.shutdown();
                KFLog.info("Window shut down.");
                return;
            case "KeeFoxClearTabFormFillData":    
                keeFoxToolbar.clearTabFormFillData(event);
            default:
                KFLog.warn("This event was unexpected and has been ignored.");
                return;
        }
    },
    
    startupKeeFox : function(currentKFToolbar, currentWindow)
    {
        //keeFoxInst._KFLog = KFLogger;

        KFLogger.info("Testing to see if we've already established whether KeePassRPC is connected.");


        if (keeFoxInst._keeFoxStorage.get("KeePassRPCActive", false))
        {
            keeFoxInst._KFLog.debug("Setup has already been done but we will make sure that the window that this scope is a part of has been set up to properly reflect KeeFox status");
            keeFoxInst._refreshKPDB();
            //currentKFToolbar.setupButton_ready(currentWindow);
            //currentKFToolbar.setAllLogins();
            //currentWindow.addEventListener("TabSelect", keeFoxInst._onTabSelected, false); //TODO: Move tab selected out here rather than in the module!
            return;
        }


//        //TODO: hmmm... if it is active, why would it not be installed?...
//        // need to review this logic - may be affecting startup in some cases
////        if (!this._keeFoxStorage.has("KeePassRPCActive"))
////        {
////            this._KFLog.info("Nope, it's not running"); 
////            //var observerService = Cc["@mozilla.org/observer-service;1"].
////            //                  getService(Ci.nsIObserverService);
////            //this._observer._kf = this;
////            //this._observer._currentKFToolbar = currentKFToolbar;                            
////            //observerService.addObserver(this._observer, "sessionstore-windows-restored", false);
////        
////        }
////         else if (!this._keeFoxStorage.get("KeePassRPCInstalled", false))
////        {
////            this._KFLog.debug("Updating the toolbar becuase KeePassRPC install is needed.");

////            if (currentWindow.document)
////            {
////                this._KFLog.debug("setting up the toolbar");
////                currentKFToolbar.setupButton_install(currentWindow);
////            } else
////            {
////                this._KFLog.debug("registering an event listener so we can configure the toolbar when Firefox is ready for us");
////                currentWindow.addEventListener("load", currentKFToolbar.setupButton_installListener, false);
////            }
////            
////        }
//         else if (keeFoxInst._keeFoxStorage.get("KeePassRPCInstalled", false) && !keeFoxInst._keeFoxStorage.get("KeePassRPCActive", false))
//        {
//            keeFoxInst._KFLog.debug("Updating the toolbar becuase user needs to load KeePass.");

//            if (currentWindow.document)
//            {
//                keeFoxInst._KFLog.debug("setting up the toolbar");
//                currentKFToolbar.setupButton_ready(currentWindow);
//            } else
//            {
//                keeFoxInst._KFLog.debug("registering an event listener so we can configure the toolbar when Firefox is ready for us");
//                currentWindow.addEventListener("load", currentKFToolbar.setupButton_loadKeePassListener, false);
//            }
//            
//         } else if (keeFoxInst._keeFoxStorage.get("KeePassRPCActive", true))
//         {
//            keeFoxInst._KFLog.debug("Updating the toolbar becuase everything has started correctly.");
//            
//            if (currentWindow.document)
//            {
//                keeFoxInst._KFLog.debug("setting up the toolbar");
//                currentKFToolbar.setupButton_ready(currentWindow);
//                currentKFToolbar.setAllLogins();
//            } else
//            {
//                keeFoxInst._KFLog.debug("registering an event listener so we can configure the toolbar when Firefox is ready for us");
//                currentWindow.addEventListener("load", currentKFToolbar.setupButton_readyListener, false);
//            }
//            //currentWindow.addEventListener("TabSelect", keeFoxInst._onTabSelected, false);
//        }
    
    
    }
};

// keeFoxInst has been setup already (at the end of KF.js) but the window-specific
// setup has to wait until Firefox triggers an event listener to say that the
// window is ready to be used
// ... unless creation of KF object failed for some reason (conflicting extension?)
if (keeFoxInst != null)
{    
    keeFoxEventHandler._kf = keeFoxInst;
    keeFoxEventHandler._assignedWindow = window;
    window.addEventListener("load", keeFoxEventHandler, false);
    window.addEventListener("unload", keeFoxEventHandler, false);
    
    var observerService = Cc["@mozilla.org/observer-service;1"].
                              getService(Ci.nsIObserverService);
    keeFoxEventHandler._kf = this;
            //keeFoxEventHandler._currentKFToolbar = currentKFToolbar;                            
            //observerService.addObserver(keeFoxEventHandler, "sessionstore-windows-restored", false);
    
    observerService.addObserver(keeFoxEventHandler, "quit-application", false);        
    
} else
{
    KFLog.warn("KeeFox startup was NOT ATTEMPTED. Maybe there is a conflicting extension that prevents startup?");
}
    
// TODO: we actually end up creating a new listener for each Firefox window and 
// just ignoring the notifications sent by unrelated windows. I think that removing
// the event listener after initial setup is finished will keep things more efficient