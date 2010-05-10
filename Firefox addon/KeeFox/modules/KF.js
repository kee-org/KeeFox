/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2010 Chris Tomlinson <keefox@christomlinson.name>
  
  The KeeFox object will handle communication with the KeeFox JSON-RPC objects,
  including situations such as partially installed components and KeePass
  not running. The object is mainly concerned with low-level extension 
  functionality rather than user-visible behaviour or actual use of the data
  in the active KeePass database.
  
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

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

var EXPORTED_SYMBOLS = ["keeFoxInst"];
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://kfmod/json.js");
Components.utils.import("resource://kfmod/KFLogger.js");
//var KFLogger = KFLog;

var Application = Components.classes["@mozilla.org/fuel/application;1"]
                .getService(Components.interfaces.fuelIApplication);

// constructor
function KeeFox()
{
    this._KFLog = KFLog;
    this._keeFoxExtension = Application.extensions.get('keefox@chris.tomlinson');
    this._keeFoxStorage = this._keeFoxExtension.storage;
    var prefs = this._keeFoxExtension.prefs;
    
    if (this._keeFoxExtension.firstRun)
    {
        prefs.setValue("originalPreferenceRememberSignons", Application.prefs.getValue("signon.rememberSignons", false));
        Application.prefs.setValue("signon.rememberSignons", false);
    }
    
    this._keeFoxExtension.events.addListener("uninstall", this.uninstallHandler);
    
    this._registerPlacesListeners();
    
    var observerService = Components.classes["@mozilla.org/observer-service;1"].
                              getService(Ci.nsIObserverService);
    this._observer._kf = this;    
    observerService.addObserver(this._observer, "quit-application", false);   
        
    this._prefService =  
        Components.classes["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);        
    this._prefService.QueryInterface(Ci.nsIPrefBranch2);
    this._prefService.addObserver("signon.rememberSignons", this._observer, false);
    this._prefService.QueryInterface(Ci.nsIPrefBranch);
        
    // Create a timer 
    this.regularCallBackToKeeFoxJSQueueHandlerTimer = Components.classes["@mozilla.org/timer;1"]
            .createInstance(Components.interfaces.nsITimer);

    this.regularCallBackToKeeFoxJSQueueHandlerTimer.initWithCallback(
    this.RegularCallBackToKeeFoxJSQueueHandler, 5000,
    Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
    
    //TODO: set some/all of my tab session state to be persistent so it survives crashes/restores?
    
    this.lastKeePassRPCRefresh = 0;
    KFLog.debug("test1111");
    this._keeFoxBrowserStartup();
    KFLog.debug("test1112");
}

KeeFox.prototype = {

    regularCallBackToKeeFoxJSQueueHandlerTimer: null,

    // localisation string bundle
    strbundle: null,
    
    // our logging object (held locally becuase this is a seperate module)
    _KFLog: null,

    // Our link to the JSON-RPC objects required for communication with KeePass
    KeePassRPC: null,
    
    _installerTabLoaded: false,
    treeViewGroupChooser: null,
    
    //callbackQueue: [],
    processingCallback: false,
    pendingCallback: "",
    
    urlToOpenOnStartup: null,

    // notify all interested objects and functions of changes in preference settings
    // (lots of references to preferences will not be cached so there's not lots to do here)
    preferenceChangeHandler: function(event)
    {    
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");

        // get a reference to the prompt service component.
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);

        switch (event.data)
        {
            case "notifyBarWhenLoggedOut": break;
            case "notifyBarWhenKeePassRPCInactive": break;
            case "rememberMRUDB": 
                if (this._keeFoxExtension.prefs.getValue("rememberMRUDB",false)) 
                    keeFoxInst._keeFoxExtension.prefs.setValue("keePassMRUDB","");
                break;
//            case "signon.rememberSignons":
//                if (promptService.confirm(window, "Password management",
//                    "The KeeFox extension may not work correctly if you allow"
//                    + " Firefox to manage your passwords. Should KeeFox disable"
//                    + " the built-in Firefox password manager?"))
//                {
//                  Application.prefs.setValue("signon.rememberSignons", false);
//                }
//                break;
                
            default: break;
        }
    },

    // holding function in case there are any corrective actions we can
    // take if certain extensions cause problems in future
    _checkForConflictingExtensions: function()
    {
        // {22119944-ED35-4ab1-910B-E619EA06A115} - roboform
//        if (Application.extensions.has("chris.tomlinson@keefox"))
//        {
//            // uninstall the old version of KeeFox (never published on AMO)
//            var em = Components.classes["@mozilla.org/extensions/manager;1"]  
//                .getService(Components.interfaces.nsIExtensionManager);  
//            em.uninstallItem("chris.tomlinson@keefox");
//            
//            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
//                           .getService(Components.interfaces.nsIWindowMediator);
//            var window = wm.getMostRecentWindow("navigator:browser");

//            // get a reference to the prompt service component.
//            var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
//                        .getService(Components.interfaces.nsIPromptService);
//           promptService.alert("Old KeeFox found! An old version of KeeFox has been detected and automatically uninstalled. You must restart your browser again before the new version will work.");
//           return false;
//        }
        
        // also prevent startup if this version is too old        
//        if ((new Date()).getMonth() > 6 || (new Date()).getFullYear > 2010)
//            return false;
            
        return true;
    },

    uninstallHandler: function()
    {
    //TODO: this doesn't work. dunno how to catch the secret FUEL notifications yet...
    
        //TODO: explain to user what will be uninstalled and offer extra
        // options (e.g. "Uninstall KeePass too?")
        
        // Reset prefs to pre-KeeFox settings
        var rs = prefs.getValue("originalPreferenceRememberSignons", false);
        Application.prefs.setValue("signon.rememberSignons", rs);
    },

    _registerPlacesListeners: function()
    {
        //TODO: listener for bookmark add/edit events and prompt if URL found in KeePass db...
    },
    
    shutdown: function()
    {
        this._KFLog.debug("KeeFox module shutting down...");
        if (this.KeePassRPC != undefined && this.KeePassRPC != null)
            this.KeePassRPC.shutdown();
        if (this.regularCallBackToKeeFoxJSQueueHandlerTimer != undefined && this.regularCallBackToKeeFoxJSQueueHandlerTimer != null)
            this.regularCallBackToKeeFoxJSQueueHandlerTimer.cancel();
        this.KeePassRPC = null;
        
        this._KFLog.debug("KeeFox module shut down.");
        this._KFLog = null;
    },

    _keeFoxBrowserStartup: function()//currentKFToolbar, currentWindow)
    {        
        //this._KFLog.debug("Testing to see if KeeFox has already been setup (e.g. just a second ago by a different window scope)");
        //TODO: confirm multi-threading setup. I assume firefox has
        // one event dispatcher thread so seperate windows can't be calling
        // this function concurrently. if that's wrong, need to rethink
        // or at least lock from here onwards
//        if (this._keeFoxStorage.get("KeePassRPCActive", false))
//        {
//            this._KFLog.debug("Setup has already been done but we will make sure that the window that this scope is a part of has been set up to properly reflect KeeFox status");
//            currentKFToolbar.setupButton_ready(currentWindow);
//            currentKFToolbar.setAllLogins();
//            currentWindow.addEventListener("TabSelect", this._onTabSelected, false);
//            return;
//        }
        
        this._KFLog.info("KeeFox initialising");
        
        // Set up UI (TODO: Pre-KeePassRPC system did this after attempting
        // a connection so test that this has no bad side-effects)        
        
        this._keeFoxVariableInit();//currentKFToolbar, currentWindow);
        // not doing this - leave it until first connection attempt has happened... this._refreshKPDB();//this._keeFoxInitialToolBarSetup(currentKFToolbar, currentWindow);
        
        this.KeePassRPC = new jsonrpcClient();
        if (this._keeFoxExtension.prefs.has("KeePassRPC.port"))
            this.KeePassRPC.port = this._keeFoxExtension.prefs.getValue("KeePassRPC.port",12536);
        
        // make the initial connection to KeePassRPC
        // (fails silently if KeePassRPC is not reachable)
        this.KeePassRPC.connect();
        
        // start regular attempts to reconnect to KeePassRPC
        // NB: overheads here include a test whether a socket is alive
        // and regular timer scheduling overheads - hopefully that's insignificant
        // but if not we can try more complicated connection strategies
        this.KeePassRPC.reconnectSoon();
        
        this._KFLog.info("KeeFox initialised OK although the connection to KeePass may not be established just yet...");            
    },
    
//    _keeFoxInitialToolBarSetup : function (currentKFToolbar, currentWindow)
//    {    
//        // set toolbar
//        if (this._keeFoxStorage.get("KeePassRPCActive", false))
//        {
//            var dbName = this.getDatabaseName();
//            
//            if (dbName == "")
//            {
//                this._KFLog.info("Everything has started correctly but no database has been opened yet.");
//                this._keeFoxStorage.set("KeePassDatabaseOpen", false);
//            } else
//            {
//                if (this._KFLog.logSensitiveData)
//                    this._KFLog.info("Everything has started correctly and the '" + dbName + "' database has been opened.");
//                else
//                    this._KFLog.info("Everything has started correctly and a database has been opened.");
//                    this._keeFoxStorage.set("KeePassDatabaseOpen", true);
//            }
//            currentKFToolbar.setupButton_ready(currentWindow);
//            currentKFToolbar.setAllLogins();
//            currentWindow.addEventListener("TabSelect", this._onTabSelected, false);
//        } else if (this._keeFoxStorage.get("KeePassRPCInstalled", false))
//        {
//            // update toolbar etc to say "launch KeePass"
//            currentKFToolbar.setupButton_ready(currentWindow);
//            currentKFToolbar.setAllLogins();
//        }
//    },
    
    _keeFoxVariableInit : function()//currentKFToolbar, currentWindow)
    {
        var KeePassEXEfound;
        var KeePassRPCfound;
        
        var keePassLocation;
        keePassLocation = "not installed";
        var keePassRPCLocation;
        keePassRPCLocation = "not installed";        
        
        var keePassRememberInstalledLocation = 
            this._keeFoxExtension.prefs.getValue("keePassRememberInstalledLocation",false);
        if (!keePassRememberInstalledLocation)
        {
            keePassLocation = this._discoverKeePassInstallLocation();
            if (keePassLocation != "not installed")
            {
                KeePassEXEfound = this._confirmKeePassInstallLocation(keePassLocation);
                if (KeePassEXEfound)
                {
                    keePassRPCLocation = this._discoverKeePassRPCInstallLocation();
                    KeePassRPCfound = this._confirmKeePassRPCInstallLocation(keePassRPCLocation);
                    if (!KeePassRPCfound)
                        this._keeFoxExtension.prefs.setValue("keePassRPCInstalledLocation",""); //TODO: set this to "not installed"?
                } else
                {
                    this._keeFoxExtension.prefs.setValue("keePassInstalledLocation",""); //TODO: set this to "not installed"?
                }
            }
        }

        if (keePassRememberInstalledLocation)
        {
            this._keeFoxStorage.set("KeePassRPCInstalled", true);
        } else
        { 
            this._KFLog.info("Checking and updating KeePassRPC installation settings");
            
            if (keePassRPCLocation == "not installed")
            {
                this._KFLog.info("KeePassRPC location was not found");
                this._launchInstaller();//currentKFToolbar,currentWindow);
            } else
            {
                if (!KeePassEXEfound)
                {
                    this._KFLog.info("KeePass EXE not present in expected location");
                    this._launchInstaller();//currentKFToolbar,currentWindow);
                } else
                {
                    if (!KeePassRPCfound)
                    {
                        this._KFLog.info("KeePassRPC plugin DLL not present in KeePass plugins directory so needs to be installed");
                        this._launchInstaller();//currentKFToolbar,currentWindow);
                    } else
                    {
                        this._KFLog.info("KeePass is not running or the connection might be established in a second...");
                        this._keeFoxStorage.set("KeePassRPCInstalled", true);
                    }
                }
            }
        }
    },
    
    // works out where KeePass is installed and records it in a Firefox preference
    _discoverKeePassInstallLocation: function()
    {
        var keePassLocation = "not installed";
 
        if (this._keeFoxExtension.prefs.has("keePassInstalledLocation"))
        {
            keePassLocation = this._keeFoxExtension.prefs.getValue("keePassInstalledLocation","not installed");
            if (keePassLocation != "")
                this._KFLog.info("KeePass install location found in preferences: " + keePassLocation);
            else
                keePassLocation = "not installed";
        }

        if (keePassLocation == "not installed")
        {
            this._KFLog.debug("Reading KeePass installation location from Windows registry");

            var wrk = Components.classes["@mozilla.org/windows-registry-key;1"]
                            .createInstance(Components.interfaces.nsIWindowsRegKey);
            wrk.open(wrk.ROOT_KEY_LOCAL_MACHINE,
                   "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
                   wrk.ACCESS_READ);
            if (wrk.hasChild("KeePassPasswordSafe2_is1"))
            {
                var subkey = wrk.openChild("KeePassPasswordSafe2_is1", wrk.ACCESS_READ);
                if (subkey.hasValue("InstallLocation"))
                {
                    keePassLocation = subkey.readStringValue("InstallLocation");
                    this._keeFoxExtension.prefs.setValue("keePassInstalledLocation",keePassLocation);
                    if (this._KFLog.logSensitiveData)
                        this._KFLog.info("KeePass install location found: " + keePassLocation);
                    else
                        this._KFLog.info("KeePass install location found.");
                }
                subkey.close();
            } else if (wrk.hasChild("{2CBCF4EC-7D5F-4141-A3A6-001090E029AC}"))
            {
                var subkey = wrk.openChild("{2CBCF4EC-7D5F-4141-A3A6-001090E029AC}", wrk.ACCESS_READ);
                if (subkey.hasValue("InstallLocation"))
                {
                    keePassLocation = subkey.readStringValue("InstallLocation");
                    this._keeFoxExtension.prefs.setValue("keePassInstalledLocation",keePassLocation);
                    if (this._KFLog.logSensitiveData)
                        this._KFLog.info("KeePass install location found: " + keePassLocation);
                    else
                        this._KFLog.info("KeePass install location found.");
                } // TODO: install location not found here - try "HKEY_CLASSES_ROOT\KeePass Database\shell\open\command" and some guesses?
                subkey.close();
            }
            wrk.close();
        }
        return keePassLocation;
    },
    
    // works out where KeePassRPC is installed and records it in a Firefox preference
    _discoverKeePassRPCInstallLocation: function()
    {
        var keePassRPCLocation = "not installed";
        var keePassLocation = "not installed";
        //return keePassRPCLocation; //HACK: debug (forces install process to start)
        
        if (this._keeFoxExtension.prefs.has("keePassRPCInstalledLocation"))
        {
            keePassRPCLocation = this._keeFoxExtension.prefs.getValue("keePassRPCInstalledLocation","not installed");
            if (keePassRPCLocation != "")
                if (this._KFLog.logSensitiveData)
                    this._KFLog.info("keePassRPC install location found in preferences: " + keePassRPCLocation);
                else
                    this._KFLog.info("keePassRPC install location found in preferences.");
            else
                keePassRPCLocation = "not installed";
        }
        
        if (keePassRPCLocation == "not installed" 
            && this._keeFoxExtension.prefs.has("keePassInstalledLocation") 
            && this._keeFoxExtension.prefs.getValue("keePassInstalledLocation","") != "")
        {
            keePassLocation = this._keeFoxExtension.prefs.getValue("keePassInstalledLocation","not installed");
            keePassRPCLocation = keePassLocation + "plugins\\";
            this._keeFoxExtension.prefs.setValue("keePassRPCInstalledLocation",keePassRPCLocation);
            if (this._KFLog.logSensitiveData)
                this._KFLog.debug("KeePassRPC install location inferred: " + keePassRPCLocation);
            else
                this._KFLog.debug("KeePassRPC install location inferred.");
        }        
        return keePassRPCLocation;
    },
    
    _confirmKeePassInstallLocation: function(keePassLocation)
    {
        var KeePassEXEfound;
        KeePassEXEfound = false;

        if (this._KFLog.logSensitiveData)
            this._KFLog.debug("Looking for the KeePass EXE in " + keePassLocation);
        else
            this._KFLog.debug("Looking for the KeePass EXE.");

        var file = Components.classes["@mozilla.org/file/local;1"]
                    .createInstance(Components.interfaces.nsILocalFile);
        try
        {
            file.initWithPath(keePassLocation);
            if (file.isDirectory())
            {
                file.append("KeePass.exe");
                if (file.isFile())
                {
                    KeePassEXEfound = true;
                    this._KFLog.info("KeePass EXE found in correct location.");
                }
            }
        } catch (ex)
        {
            /* no need to do anything */
        }
        return KeePassEXEfound;
    },
    
    _confirmKeePassRPCInstallLocation: function(keePassRPCLocation)
    {
        var KeePassRPCfound;
        KeePassRPCfound = false;

        if (this._KFLog.logSensitiveData)
            this._KFLog.info("Looking for the KeePassRPC plugin plgx in " + keePassRPCLocation);
        else
            this._KFLog.info("Looking for the KeePassRPC plugin plgx");

        var file = Components.classes["@mozilla.org/file/local;1"]
                    .createInstance(Components.interfaces.nsILocalFile);
        try
        {
            file.initWithPath(keePassRPCLocation);
            if (file.isDirectory())
            {
                file.append("KeePassRPC.plgx");
                if (file.isFile())
                {
                    KeePassRPCfound = true;
                    this._KFLog.info("KeePassRPC plgx found in correct location.");
                }
            }
            
        } catch (ex)
        {
            this._KFLog.debug("KeePassRPC PLGX search threw an exception: " + ex);
        }
        
        try
        {
            // if we don't find the PLGX, search for the old-style DLL
            // just in case this is a development installation of KeeFox
            // (where a DLL is used rather than PLGX)
            if (!KeePassRPCfound)
            {
                file = Components.classes["@mozilla.org/file/local;1"].
                    createInstance(Components.interfaces.nsILocalFile)
                file.initWithPath(keePassRPCLocation);
                if (file.isDirectory())
                {
                    file.append("KeePassRPC.dll");
                    if (file.isFile())
                    {
                        KeePassRPCfound = true;
                        this._KFLog.info("KeePassRPC DLL found in correct location.");
                    }
                }
            }
        } catch (ex)
        {
            this._KFLog.debug("KeePassRPC DLL search threw an exception: " + ex);
        }        
        return KeePassRPCfound;
    },

    // Temporarilly disable KeeFox. Used (for e.g.) when KeePass is shut down.
    //TODO: test more thoroughly, especially multiple windows aspect
    _pauseKeeFox: function()
    {
        this._KFLog.debug("Pausing KeeFox.");
        //var wasConnected = this._keeFoxStorage.get("KeePassRPCActive", false);
        //var wasLoggedIn = this._keeFoxStorage.get("KeePassDatabaseOpen", false);
        this._keeFoxStorage.set("KeePassRPCActive", false);
        this._keeFoxStorage.set("KeePassDatabaseOpen", false); // grrr. This was HOPEFULLY the missing statement that led to the deadlocks (actually a slowly executing infinite recursive loop that would take a long time to exhast the stack - win.keeFoxToolbar.setupButton_ready calls KF.getSatabaseName calls KF._pauseKeeFox). This note remains as a painful reminder and maybe a clue for future debugging!
        
        var wm = Cc["@mozilla.org/appshell/window-mediator;1"].
                 getService(Ci.nsIWindowMediator);
        var enumerator = wm.getEnumerator("navigator:browser");
        var tabbrowser = null;

        while (enumerator.hasMoreElements())
        {
            var win = enumerator.getNext();
            win.keefox_org.toolbar.removeLogins(); // remove matched logins           
            win.keefox_org.toolbar.setAllLogins(); // remove list of all logins
            //win.keefox_org.toolbar.setupButton_loadKeePass(win);
            win.keefox_org.toolbar.setupButton_ready(win);
            win.keefox_org.UI._removeOLDKFNotifications(true);
            win.removeEventListener("TabSelect", this._onTabSelected, false);
            //TODO: try this. will it know the DB is offline already? win.keefox_org.toolbar.setAllLogins();
        }
        this.KeePassRPC.disconnect();
        this._KFLog.info("KeeFox paused.");
    },
    
    //TODO: test more, especially multiple windows and multiple databases at the same time
    // This is now intended to be called on all occasions when the toolbar or UI need updating
    // If KeePass is unavailable then this will call _pauseKeeFox instead but
    // it's more efficient to just call the pause function straight away if you know KeePass is disconnected
    _refreshKPDB: function ()
    {
        this._KFLog.debug("Refreshing KeeFox's view of the KeePass database.");
        var dbName = this.getDatabaseName();  
        if (dbName.constructor.name == "Error") // Can't use instanceof here becuase the Error object was created in a different scope
        {
            this._pauseKeeFox();
            return;
        }            
        else if (dbName == "")
        {
            this._KFLog.debug("No database is currently open.");
            this._keeFoxStorage.set("KeePassDatabaseOpen", false);
        } else
        {
            if (this._KFLog.logSensitiveData)
                this._KFLog.info("The '" + dbName + "' database is open.");
            else
                this._KFLog.info("The database is open.");
            this._keeFoxStorage.set("KeePassDatabaseOpen", true);
        }
                
        var wm = Cc["@mozilla.org/appshell/window-mediator;1"].
                 getService(Ci.nsIWindowMediator);
        var enumerator = wm.getEnumerator("navigator:browser");
        var tabbrowser = null;

        while (enumerator.hasMoreElements())
        {
            var win = enumerator.getNext();
            win.keefox_org.toolbar.removeLogins();
            win.keefox_org.toolbar.setAllLogins();
            win.keefox_org.toolbar.setupButton_ready(win);
            win.keefox_org.UI._removeOLDKFNotifications();
            win.addEventListener("TabSelect", this._onTabSelected, false);
            if (this._keeFoxStorage.get("KeePassDatabaseOpen",false))
            {
                win.keefox_org.ILM._fillDocument(win.content.document,false);
            }
        }
        
        if (this._keeFoxStorage.get("KeePassDatabaseOpen",false) 
            && this._keeFoxExtension.prefs.getValue("rememberMRUDB",false))
        {
            var MRUFN = this.getDatabaseFileName();
            if (MRUFN != null && MRUFN != undefined && !(MRUFN instanceof Error))
                this._keeFoxExtension.prefs.setValue("keePassMRUDB",MRUFN);
        }

        this._KFLog.info("KeeFox feels very refreshed now.");
    },    
    
    /*******************************************
    / Launching and installing
    /*******************************************/    
    
    launchKeePass: function(params)
    {
        if (!this._keeFoxExtension.prefs.has("keePassInstalledLocation"))
        {
            return; // TODO: work it out, prompt user or just bomb out with notification why
        }
        
        if (this._keeFoxExtension.prefs.has("KeePassRPC.port"))
        {
            if (params != "")
                params = params + " ";
            params = "-KeePassRPCPort:" +
                this._keeFoxExtension.prefs.getValue("KeePassRPC.port",12536);
        }
        var args = [];
        var fileName = this._keeFoxExtension.prefs.getValue("keePassInstalledLocation",
                        "C:\\Program files\\KeePass Password Safe 2\\") + "KeePass.exe";
        var mruparam = this._keeFoxExtension.prefs.getValue("keePassDBToOpen","");
        if (mruparam == "")
            mruparam = this._keeFoxExtension.prefs.getValue("keePassMRUDB","");
            
        if (params != "" && mruparam != "")
            args = [params, '' + mruparam + ''];
        else if (params != "")
            args = [params];
        else if (mruparam != "")
            args = ['' + mruparam + ''];
        
        var file = Components.classes["@mozilla.org/file/local;1"]
                   .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(fileName);

        var process = Components.classes["@mozilla.org/process/util;1"]
                      .createInstance(Components.interfaces.nsIProcess);
        process.init(file);
        process.run(false, args, args.length);
    },   
    
    // this runs in a secondary thread - don't access the UI!
    runAnInstaller: function (fileName, params)
    {
        var args = [fileName, params];                
        var file = Components.classes["@mozilla.org/file/local;1"]
                   .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(this._myDepsDir() + "\\KeeFoxElevate.exe");

        var process = Components.classes["@mozilla.org/process/util;1"]
                      .createInstance(Components.interfaces.nsIProcess);
                      
        this._KFLog.info("about to execute: " + file.path + " " + args.join(' '));
        process.init(file);
        process.run(true, args, 2);
    },
    
    _launchInstaller: function(currentKFToolbar,currentWindow, upgrade)
    {
        if (this._installerTabLoaded)
            return; // only want to do this once per session to avoid irritation!
        
        this._installerTabLoaded = true;
        
        if (upgrade)
        {
            this._KFLog.info("KeeFox not installed correctly. Going to try to launch the upgrade page.");
            installTab = this._openAndReuseOneTabPerURL("chrome://keefox/content/install.xul?upgrade=1");
        } else
        {
            this._KFLog.info("KeeFox not installed correctly. Going to try to launch the install page.");
            installTab = this._openAndReuseOneTabPerURL("chrome://keefox/content/install.xul");
        }
        
        //NB: FF < 3.0.5 may fail to open the tab due to bug where "session loaded" event fires too soon.
        
        // remember the installation state (until it might have changed...)
        this._keeFoxStorage.set("KeePassRPCInstalled", false);

        //TODO: might need to put this elsewhere...
        //this._KFLog.debug("Setting up install KeeFox button.");
        //currentKFToolbar.setupButton_install(currentWindow);
    },
    
    // if the MRU database is known, open that but otherwise send empty string which will cause user
    // to be prompted to choose a DB to open
    loginToKeePass: function()
    {
        var databaseFileName = this._keeFoxExtension.prefs.getValue("keePassDBToOpen","");
        if (databaseFileName == "")
            databaseFileName = this._keeFoxExtension.prefs.getValue("keePassMRUDB","");
            
        this.changeDatabase(databaseFileName, true);
    },    
    
    KeeFox_MainButtonClick_install: function(event, temp) {
        this._KFLog.debug("install button clicked. Loading (and focusing) install page.");
        installTab = this._openAndReuseOneTabPerURL("chrome://keefox/content/install.xul");
        // remember the installation state (until it might have changed...)
        this._keeFoxStorage.set("KeePassRPCInstalled", false);
    },
    
    /*******************************************
    / These functions are essentially wrappers for the actions that
    / KeeFox needs to take against KeePass via the KeePassRPC plugin connection.
    /*******************************************/
    
    getDatabaseName: function()
    {
        try
        {
            var result = this.KeePassRPC.getDBName();              
            return result;
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    getDatabaseFileName: function()
    {
        try
        {
            return this.KeePassRPC.getDBFileName();
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
        return "";
    },
    
    getAllDatabaseFileNames: function()
    {
        try
        {
            return this.KeePassRPC.getMRUdatabases({});
          
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
        return "";
    },
    
    changeDatabase: function(fileName, closeCurrent)
    {
        try
        {
            this.KeePassRPC.changeDB(fileName, closeCurrent);
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    addLogin: function(login, parentUUID)
    {
        try
        {
            return this.KeePassRPC.addLogin(login, parentUUID);
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    addGroup: function(title, parentUUID)
    {
        try
        {
            return this.KeePassRPC.addGroup(title, parentUUID);
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    removeLogin: function (uniqueID)
    {
        try
        {
            return this.KeePassRPC.deleteLogin(uniqueID);
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    removeGroup: function (uniqueID)
    {
        try
        {
            return this.KeePassRPC.deleteGroup(uniqueID);
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    getParentGroup: function(uniqueID)
    {
        try
        {
            return this.KeePassRPC.getParentGroup(uniqueID);
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    getRootGroup: function()
    {
        try
        {
            return this.KeePassRPC.getRootGroup();
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    getChildGroups: function(count, uniqueID)
    {
        try
        {
            return this.KeePassRPC.getChildGroups(uniqueID);
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    getChildEntries: function(count, uniqueID)
    {
        try
        {
            return this.KeePassRPC.getChildEntries(uniqueID);
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },

    
    modifyLogin: function (oldLogin, newLogin)
    {
        try
        {
            return this.KeePassRPC.modifyLogin(oldLogin, newLogin);
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    getAllLogins: function (count)
    {
        try
        {
            return this.KeePassRPC.getAllLogins();
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    findLogins: function(hostname, formSubmitURL, httpRealm, uniqueID)
    {
        try
        {
            return this.KeePassRPC.findLogins(hostname, formSubmitURL, httpRealm, uniqueID);
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    countLogins: function(hostName,actionURL,httpRealm)
    {
        try
        {
            return this.KeePassRPC.countLogins(hostName,actionURL,httpRealm);
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    
    launchLoginEditor: function(uuid)
    {
        try
        {
            var thread = Components.classes["@mozilla.org/thread-manager;1"]
                                    .getService(Components.interfaces.nsIThreadManager)
                                    .newThread(0);
             thread.dispatch(new launchLoginEditorThread(uuid), thread.DISPATCH_NORMAL);
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },

    launchGroupEditor: function(uuid)
    {
        try
        {
             var thread = Components.classes["@mozilla.org/thread-manager;1"]
                                    .getService(Components.interfaces.nsIThreadManager)
                                    .newThread(0);
             thread.dispatch(new launchGroupEditorThread(uuid), thread.DISPATCH_NORMAL);
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    generatePassword: function()
    {
        try
        {
            return this.KeePassRPC.generatePassword();
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling this exception: " + e);
            throw e;
        }
    },
    
    
    /*******************************************
    / General utility functions
    /*******************************************/
    
    IsUserAdministrator: function()
    {
        var file = Components.classes["@mozilla.org/file/local;1"]
                   .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(this._myDepsDir() + "\\CheckForAdminRights.exe");

        var process = Components.classes["@mozilla.org/process/util;1"]
                      .createInstance(Components.interfaces.nsIProcess);
        process.init(file);
        process.run(true, [], 0);
        return process.exitValue;
    },

    // Helper for making nsURI from string
    _convert_url: function(url)
    {
        var ios = Components.classes["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService);
        return ios.newURI(url, null, null);
    },

    _openAndReuseOneTabPerURL: function(url)
    {
        if (this._KFLog.logSensitiveData)
            this._KFLog.debug("trying to find an already open tab with this url:" + url);
        else
            this._KFLog.debug("trying to find an already open tab with the requested url");
        var found = false;
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
        try
        {
        
            var browserEnumerator = wm.getEnumerator("navigator:browser");

            // Check each browser instance for our URL
            while (!found && browserEnumerator.hasMoreElements())
            {
                var browserWin = browserEnumerator.getNext();
                var tabbrowser = browserWin.gBrowser;

                // Check each tab of this browser instance
                var numTabs = tabbrowser.browsers.length;
                for (var index = 0; index < numTabs; index++)
                {
                    var currentBrowser = tabbrowser.getBrowserAtIndex(index);
                    if (url == currentBrowser.currentURI.spec)
                    {
                        // The URL is already opened. Select this tab.
                        tabbrowser.selectedTab = tabbrowser.tabContainer.childNodes[index];

                        // Focus *this* browser-window
                        browserWin.focus();

                        found = true;
                        break;
                    }
                }
            }

            if (!found)
            {
                this._KFLog.debug("tab with this URL not already open so opening one and focussing it now");
                var newWindow = wm.getMostRecentWindow("navigator:browser");
                var b = newWindow.getBrowser();
                var newTab = b.loadOneTab( url, null, null, null, false, null );
                return newTab;
            }
        } catch (ex)
        {
            // if this fails, it's probably because we are setting up the JS module before FUEL is ready (can't find a way to test it so will just have to try and catch)
            this._KFLog.debug("browser window not ready yet: " + ex);
            this.urlToOpenOnStartup = url;            
            var currentWindow = wm.getMostRecentWindow("navigator:browser");
            if (currentWindow == null)
            {
                this._KFLog.error("No windows open yet");
                return;
            }
            return;
        }
    },
    
    _myDepsDir: function()
    {
        var file = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(this._myInstalledDir());
        file.append("deps");
        return file.path;
    },

    _myInstalledDir: function()
    {
        this._KFLog.debug("establishing the directory that KeeFox is installed in");

        var MY_ID = "keefox@chris.tomlinson";
        var em = Components.classes["@mozilla.org/extensions/manager;1"].
             getService(Components.interfaces.nsIExtensionManager);
        // the path may use forward slash ("/") as the delimiter
        var dir = em.getInstallLocation(MY_ID).getItemLocation(MY_ID);

        if (this._KFLog.logSensitiveData)
            this._KFLog.debug("installed in this directory: " + dir.path);
        else
            this._KFLog.debug("Found installation directory");
        return dir.path;
    },

    _observer :
    {
        _kf : null,

        QueryInterface : XPCOMUtils.generateQI([Ci.nsIObserver, 
                                                Ci.nsISupportsWeakReference]),
        // nsObserver
        observe : function (subject, topic, data)
        {
            KFLog.debug("Observed an event: " + subject + "," + topic + "," + data);
            switch(topic)
            {
                case "quit-application":
                    KFLog.info("Application is shutting down...");
                    _kf.shutdown();
                    KFLog.info("KeeFox has nearly shut down.");
                    var observerService = Cc["@mozilla.org/observer-service;1"].
                                  getService(Ci.nsIObserverService);
                    observerService.removeObserver(this, "quit-application");
                    
                    this._prefService.QueryInterface(Ci.nsIPrefBranch2);
                    this._prefService.removeObserver("signon.rememberSignons", this);
                    
                    KFLog.info("KeeFox has shut down. Sad times; come back soon!");
                    break;
                case "nsPref:changed":
                    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                       .getService(Components.interfaces.nsIWindowMediator);
                    var window = wm.getMostRecentWindow("navigator:browser");

                    // get a reference to the prompt service component.
                    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                    .getService(Components.interfaces.nsIPromptService);
                    subject.QueryInterface(Components.interfaces.nsIPrefBranch);
                    
                    this.preferenceChangeResponder(subject, data, window, promptService);
                    break;
            }          
        },
        
        preferenceChangeResponder : function (prefBranch, prefName, window, promptService)
        {
            switch (prefName)
            {
                case "signon.rememberSignons":
                    var newValue = prefBranch.getBoolPref(prefName);
                    var flags = promptService.BUTTON_POS_0 * promptService.BUTTON_TITLE_YES +
                        promptService.BUTTON_POS_1 * promptService.BUTTON_TITLE_NO;

                    if (newValue && promptService.confirmEx(window, "Password management",
                        "The KeeFox add-on may not work correctly if you allow"
                        + " Firefox to manage your passwords. Should KeeFox disable"
                        + " the built-in Firefox password manager?",
                               flags, "", "", "", null, {}) == 0)
                    {
                      Application.prefs.setValue("signon.rememberSignons", false);
                    }
                    break;
            }
        },
        
        notify : function (subject, topic, data) { }
    },

    // we could define multiple callback functions but that looks like it needs 
    // really messy xpcom code so we'll stick with the one and just switch...
    //TODO?: will we need optional extra data parameter?
    // this is only called once no matter how many windows are open. so functions within need to handle all open windows
    // for now, that just means every window although in future maybe there could be a need to store a list of relevant
    // windows and call those instead
    CallBackToKeeFoxJS: function(sig)
    {
        var sigTime = Date();
        
        keeFoxInst._KFLog.debug("Signal received by CallBackToKeeFoxJS (" + sig + ") @" + sigTime);
        
        var executeNow = false;
        var pause = false;
        var refresh = false;
        
        switch (sig) {
            // deprecated case "0": keeFoxInst._KFLog.info("Javascript callbacks from KeeFox XPCOM DLL are now disabled."); keeFoxInst._pauseKeeFox(); break;
            // deprecated case "1": keeFoxInst._KFLog.info("Javascript callbacks from KeeFox XPCOM DLL are now enabled."); break;
            // deprecated case "2": keeFoxInst._KFLog.info("KeeICE callbacks from KeePass to KeeFox XPCOM are now enabled."); break;
            case "3": keeFoxInst._KFLog.info("KeePass' currently active DB is about to be opened."); break;
            case "4": keeFoxInst._KFLog.info("KeePass' currently active DB has just been opened.");
                refresh = true;
                break;
            case "5": keeFoxInst._KFLog.info("KeePass' currently active DB is about to be closed."); break;
            case "6": keeFoxInst._KFLog.info("KeePass' currently active DB has just been closed."); 
                refresh = true;
                break;
            case "7": keeFoxInst._KFLog.info("KeePass' currently active DB is about to be saved."); break;
            case "8": keeFoxInst._KFLog.info("KeePass' currently active DB has just been saved."); 
                refresh = true;
                break;
            case "9": keeFoxInst._KFLog.info("KeePass' currently active DB is about to be deleted."); break;
            case "10": keeFoxInst._KFLog.info("KeePass' currently active DB has just been deleted."); break;
            case "11": keeFoxInst._KFLog.info("KeePass' active DB has been changed/selected."); 
                refresh = true;
                break;
            case "12": keeFoxInst._KFLog.info("KeePass is shutting down."); 
                pause = true;
                break;
            default: keeFoxInst._KFLog.error("Invalid signal received by CallBackToKeeFoxJS (" + sig + ")"); break;
        }
        
        if (!pause && !refresh)
            return;
            
        var now = (new Date()).getTime();
        
        // avoid refreshing more frequently than every half second
//        if (refresh && keeFoxInst.lastKeePassRPCRefresh > now-5000)
//        {    
//            keeFoxInst._KFLog.info("Signal ignored. @" + sigTime);
//            return;
//        }
        
        // If there is nothing in the queue at the moment we can process this callback straight away
        if (!keeFoxInst.processingCallback && keeFoxInst.pendingCallback == "")
        {
            keeFoxInst._KFLog.debug("Signal executing now. @" + sigTime); 
            keeFoxInst.processingCallback = true;
            executeNow = true;
        }
        // Otherwise we need to add the action for this callback to a queue and leave it up to the regular callback processor to execute the action
        
        // if we want to pause KeeFox then we do it immediately or make sure it's the next (and only) pending task after the current task has finished
        if (pause)
        {
            
            if (executeNow) keeFoxInst._pauseKeeFox(); else keeFoxInst.pendingCallback = "_pauseKeeFox";
        }
        
        if (refresh)
        {
            
            if (executeNow) {keeFoxInst.lastKeePassRPCRefresh = now; keeFoxInst._refreshKPDB();} else keeFoxInst.pendingCallback = "_refreshKPDB";
        }
        
        keeFoxInst._KFLog.info("Signal handled or queued. @" + sigTime); 
        if (executeNow)
        {
            
            //trigger any pending callback handler immediately rather than waiting for the timed handler to pick it up
            if (keeFoxInst.pendingCallback=="_pauseKeeFox")
                keeFoxInst._pauseKeeFox();
            else if (keeFoxInst.pendingCallback=="_refreshKPDB")
                keeFoxInst._refreshKPDB();
            else
                keeFoxInst._KFLog.info("A pending signal was found and handled.");
            keeFoxInst.pendingCallback = "";
            keeFoxInst.processingCallback = false;
            keeFoxInst._KFLog.info("Signal handled. @" + sigTime); 
        }
    },
    
    RegularCallBackToKeeFoxJSQueueHandler: function()
    {
        // If there is nothing in the queue at the moment or we are already processing a callback, we give up for now
        if (keeFoxInst.processingCallback || keeFoxInst.pendingCallback == "")
            return;
            
        keeFoxInst._KFLog.debug("RegularCallBackToKeeFoxJSQueueHandler will execute the pending item now");
        keeFoxInst.processingCallback = true;
        if (keeFoxInst.pendingCallback=="_pauseKeeFox")
            keeFoxInst._pauseKeeFox();
        else if (keeFoxInst.pendingCallback=="_refreshKPDB")
            keeFoxInst._refreshKPDB();
        keeFoxInst.pendingCallback = "";
        keeFoxInst.processingCallback = false;
        keeFoxInst._KFLog.debug("RegularCallBackToKeeFoxJSQueueHandler has finished executing the item");
    },

//TODO: this seems the wrong place for this function - needs to be in a window-specific section such as KFUI or KFILM
    _onTabSelected: function(event) {
        event.target.ownerDocument.defaultView.keefox_org.Logger.debug("_onTabSelected:" + event.target.ownerDocument.defaultView.keefox_org.ILM._loadingKeeFoxLogin);
        if (event.target.ownerDocument.defaultView.keefox_org.ILM._loadingKeeFoxLogin != undefined
        && event.target.ownerDocument.defaultView.keefox_org.ILM._loadingKeeFoxLogin != null)
        {
//            event.target.addEventListener("load", function () {
//  event.target.setAttribute("KF_uniqueID", event.target.ownerDocument.defaultView.keefox_org.ILM._loadingKeeFoxLogin);
//}, true);

//            event.target.setAttribute("KF_uniqueID", event.target.ownerDocument.defaultView.keefox_org.ILM._loadingKeeFoxLogin);
            //event.target.ownerDocument.setAttribute("KF_uniqueID", event.target.ownerDocument.defaultView.keefox_org.ILM._loadingKeeFoxLogin);
            //event.target.ownerDocument.defaultView.setAttribute("KF_uniqueID", event.target.ownerDocument.defaultView.keefox_org.ILM._loadingKeeFoxLogin);
//            event.target.KF_uniqueID = event.target.ownerDocument.defaultView.keefox_org.ILM._loadingKeeFoxLogin;
            //event.target.setAttribute("KF_uniqueID", event.target.ownerDocument.defaultView.keefox_org.ILM._loadingKeeFoxLogin);
            //event.target.setAttribute("KF_autoSubmit", "yes"); 
            event.target.ownerDocument.defaultView.keefox_org.ILM._loadingKeeFoxLogin = null;
        } else
        {            
            event.target.ownerDocument.defaultView.keefox_org.toolbar.setLogins(null, null);  
            event.target.ownerDocument.defaultView.keefox_org.ILM._fillAllFrames(event.target.contentWindow,false);
        }
    },
    
    loadFavicon: function(url)
    {
        try
        {
            var faviconService = 
                Components.classes["@mozilla.org/browser/favicon-service;1"]
                    .getService(Components.interfaces.nsIFaviconService);

            var ioservice = Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService);
                
            var pageURI = ioservice.newURI(url, null, null);
        
            var favIconURI = faviconService.getFaviconForPage(pageURI);
            if (!faviconService.isFailedFavicon(favIconURI))
            {
                var datalen = {};
                var mimeType = {};
                var data = faviconService.getFaviconData(favIconURI, mimeType, datalen);
                var faviconBytes = String.fromCharCode.apply(null, data);
                return btoa(faviconBytes);
            }
            if (this._KFLog.logSensitiveData)
                throw "We couldn't find a favicon for this URL: " + url;
            else
                throw "We couldn't find a favicon";
        } catch (ex) 
        {
            // something failed so we can't get the favicon. We don't really mind too much...
            if (this._KFLog.logSensitiveData)
            {
                this._KFLog.info("favicon load failed for " + url + " : " + ex);
                throw "We couldn't find a favicon for this URL: " + url + " BECAUSE: " + ex;
            } else
            {
                this._KFLog.info("favicon load failed: " + ex);
                throw "We couldn't find a favicon BECAUSE: " + ex;
            }
        }
    }
};

var keeFoxInst = new KeeFox;

// abort if we find a conflict
if (!keeFoxInst._checkForConflictingExtensions())
    keeFoxInst = null;

var launchGroupEditorThread = function(uuid) {
  this.uniqueID = uuid;
};

launchGroupEditorThread.prototype = {
  run: function() {
    try {
      keeFoxInst.KeePassRPC.launchGroupEditor(this.uniqueID);
   
    } catch(err) {
      dump(err);
    }
  },
  
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsIRunnable) ||
        iid.equals(Components.interfaces.nsISupports)) {
            return this;
    }
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};


var launchLoginEditorThread = function(uuid) {
  this.uniqueID = uuid;
};

launchLoginEditorThread.prototype = {
  run: function() {
    try {
      keeFoxInst.KeePassRPC.launchLoginEditor(this.uniqueID);
  
    } catch(err) {
      dump(err);
    }
  },
  
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsIRunnable) ||
        iid.equals(Components.interfaces.nsISupports)) {
            return this;
    }
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};

