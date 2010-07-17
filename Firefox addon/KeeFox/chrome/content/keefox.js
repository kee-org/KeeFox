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

var keefox_org = {};

keefox_org.shouldLoad = true;

//StartupTestApplication stuff can be skipped for Firefox > 3.6 becuase
// the old version was never published as compatible for newer versions

// assuming we're running under Firefox
keefox_org.appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                        .getService(Components.interfaces.nsIXULAppInfo);
keefox_org.versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                               .getService(Components.interfaces.nsIVersionComparator);
                               
if (keefox_org.versionChecker.compare(keefox_org.appInfo.version, "3.7") >= 0)
{
    // running under Firefox 3.7 (4) or later

    keefox_org.StartupTestApplication = Components.classes["@mozilla.org/fuel/application;1"]
                    .getService(Components.interfaces.fuelIApplication);
                    
    if (keefox_org.StartupTestApplication.extensions.has("chris.tomlinson@keefox"))
    {
        // uninstall the old version of KeeFox (never published on AMO)
        keefox_org.em = Components.classes["@mozilla.org/extensions/manager;1"]  
            .getService(Components.interfaces.nsIExtensionManager);  
        keefox_org.em.uninstallItem("chris.tomlinson@keefox");
        
    //    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    //                   .getService(Components.interfaces.nsIWindowMediator);
    //    var window = wm.getMostRecentWindow("navigator:browser");

        // get a reference to the prompt service component.
        keefox_org.promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                    .getService(Components.interfaces.nsIPromptService);
       keefox_org.promptService.alert(null,"KeeFox upgrade", "An old version of KeeFox has been detected and automatically uninstalled. You must restart your browser again before the new version will work!");
    //window.alert("Old KeeFox found! An old version of KeeFox has been detected and automatically uninstalled. You must restart your browser again before the new version will work.");
       keefox_org.shouldLoad = false;
    }
}

// also prevent startup if this version is too old        
//if (((new Date()).getMonth() > 6 && (new Date()).getFullYear == 2011) || (new Date()).getFullYear > 2011)
if ((new Date()).getMonth() > 9 || (new Date()).getFullYear > 2010)
    keefox_org.shouldLoad = false;


if (keefox_org.shouldLoad)
{
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
    keefox_org.scriptLoader.loadSubScript("resource://kfscripts/KFtest.js"); 

    // This object listens for the "window loaded" event, fired after
    // Firefox finishes loading a window
    keefox_org.mainEventHandler =
    {
        // a reference to this scope's KF object
        _kf: null,
        
        //???
        _currentKFToolbar : null,
        
        // the window we are interested in (see below for performance improvement option)
        _assignedWindow : null,

        QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIObserver,
                            Components.interfaces.nsIDOMEventListener,   
                            Components.interfaces.nsISupportsWeakReference]),

        // nsObserver
        observe : function (subject, topic, data)
        {
            //var doc;
            switch(topic)
            {
                case "sessionstore-windows-restored":
                    KFLog.debug("got sessionstore-windows-restored");
                    if (keeFoxInst.urlToOpenOnStartup != null && keeFoxInst.urlToOpenOnStartup.length > 0)
                    {
                        var toOpen = keeFoxInst.urlToOpenOnStartup;
                        keeFoxInst.urlToOpenOnStartup = null;
                        keeFoxInst._openAndReuseOneTabPerURL(toOpen);
                    }
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
            
            if (currentWindow != this._assignedWindow && event.type != "KeeFoxClearTabFormFillData")
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
                    keefox_org.toolbar = new KFToolbar(currentWindow);
                    
                    // an event listener on the toolbar clears session data relating to
                    // the form filling process. ATOW only called in response to user
                    // editing form field contents.
                    document.addEventListener("KeeFoxClearTabFormFillData", keefox_org.mainEventHandler, false, true);
                        
                    // the improved login manager which acts (a bit) like a bridge
                    // between the user visible code and the KeeFox module / JSON-RPC    
                    keefox_org.ILM = new KFILM(keeFoxInst,keefox_org.toolbar,currentWindow);
                    
                    // the main UI code including things like
                    // the generation of notification boxes
                    keefox_org.UI = new KFUI();
                    keefox_org.UI.init(keeFoxInst, keefox_org.ILM);
                    
                    //keeFoxInst.init(keefox_org.toolbar,currentWindow);
                    this.startupKeeFox(keefox_org.toolbar,currentWindow);
                    

                    // Used to aid testing of various KeeFox features
                    // (arguably is not needed in version 1.0 but I may keep it
                    // just in case unless performance is noticably worse with it)
                    //KFtester = new KFtests(keefox_org.ILM);
                    
//                    if (keeFoxInst.urlToOpenOnStartup != null && keeFoxInst.urlToOpenOnStartup.length > 0)
//                    {
//                        var toOpen = keeFoxInst.urlToOpenOnStartup;
//                        keeFoxInst.urlToOpenOnStartup = null;
//                        keeFoxInst._openAndReuseOneTabPerURL(toOpen);
//                    }

                    return;
                case "unload": 
                    KFLog.info("Window shutting down...");                    
                    
                    window.removeEventListener("load", this, false);
                    window.removeEventListener("unload", this, false);
                    //remove://observerService.addObserver(keefox_org.mainEventHandler, "sessionstore-windows-restored", false);
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
        
        startupKeeFox : function(currentKFToolbar, currentWindow)
        {
            keefox_org.Logger.info("Testing to see if we've already established whether KeePassRPC is connected.");

            if (keeFoxInst._keeFoxStorage.get("KeePassRPCActive", false))
            {
                keeFoxInst._KFLog.debug("Setup has already been done but we will make sure that the window that this scope is a part of has been set up to properly reflect KeeFox status");
                keeFoxInst._refreshKPDB();
                //currentKFToolbar.setupButton_ready(currentWindow);
                //currentKFToolbar.setAllLogins();
                //currentWindow.addEventListener("TabSelect", keeFoxInst._onTabSelected, false); //TODO: Move tab selected out here rather than in the module!
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
        //keefox_org.mainEventHandler._kf = this;
                //keefox_org.mainEventHandler._currentKFToolbar = currentKFToolbar;                            
        observerService.addObserver(keefox_org.mainEventHandler, "sessionstore-windows-restored", false);
        
        //observerService.addObserver(keefox_org.mainEventHandler, "quit-application", false);        
        
    } else
    {
        KFLog.warn("KeeFox module startup was NOT ATTEMPTED. Maybe there is a conflicting extension that prevents startup?");
    }
}

// TODO: we actually end up creating a new listener for each Firefox window and 
// just ignoring the notifications sent by unrelated windows. I think that removing
// the event listener after initial setup is finished will keep things more efficient

