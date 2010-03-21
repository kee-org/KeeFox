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

var Application = Components.classes["@mozilla.org/fuel/application;1"]
                .getService(Components.interfaces.fuelIApplication);

// constructor
function KeeFox()
{
    this._keeFoxExtension = Application.extensions.get('keefox@chris.tomlinson');
    this._keeFoxStorage = this._keeFoxExtension.storage;
    var prefs = this._keeFoxExtension.prefs;
    
    // register preference change handlers so we can react to altered
    // preferences while Firefox is running (actually most of the time we
    // query the current preference value when we need it but this is for completeness)
    if (prefs.has("notifyBarWhenLoggedOut"))
        prefs.get("notifyBarWhenLoggedOut").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("notifyBarWhenKeePassRPCInactive"))
        prefs.get("notifyBarWhenKeePassRPCInactive").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("flashIconWhenLoggedOut"))
        prefs.get("flashIconWhenLoggedOut").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("flashIconWhenKeePassRPCInactive"))
        prefs.get("flashIconWhenKeePassRPCInactive").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("rememberMRUDB"))
        prefs.get("rememberMRUDB").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("dynamicFormScanning"))
        prefs.get("dynamicFormScanning").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("autoFillForms"))
        prefs.get("autoFillForms").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("autoSubmitForms"))
        prefs.get("autoSubmitForms").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("autoFillDialogs"))
        prefs.get("autoFillDialogs").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("autoSubmitDialogs"))
        prefs.get("autoSubmitDialogs").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("overWriteFieldsAutomatically"))
        prefs.get("overWriteFieldsAutomatically").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("autoSubmitMatchedForms"))
        prefs.get("autoSubmitMatchedForms").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("keePassRPCInstalledLocation"))
        prefs.get("keePassRPCInstalledLocation").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("keePassInstalledLocation"))
        prefs.get("keePassInstalledLocation").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("keePassMRUDB"))
        prefs.get("keePassMRUDB").events.addListener("change", this.preferenceChangeHandler);  
    if (prefs.has("saveFavicons"))
        prefs.get("saveFavicons").events.addListener("change", this.preferenceChangeHandler);      
          
    this._registerUninstallListeners();
    this._registerPlacesListeners();
    
    // make sure that Firefox preferences won't interfere with successful add-on operation.
    Application.prefs.setValue("signon.rememberSignons", false);
    Application.prefs.setValue("browser.sessionstore.enabled", true);
     
    //TODO: set some/all of my tab session state to be persistent so it survives crashes/restores?
}

KeeFox.prototype = {

    // localisation string bundle
    strbundle: null,
    
    // our logging object (held locally becuase this is a seperate module)
    _KFLog: null,

    // Our link to the JSON-RPC objects required for communication with KeePass
    KeePassRPC: null,
    
    _installerTabLoaded: false,
    treeViewGroupChooser: null,

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
            default: break;
        }
    },

    // holding function in case there are any corrective actions we can
    // take if certain extensions cause problems in future
    _checkForConflictingExtensions: function()
    {
        // {22119944-ED35-4ab1-910B-E619EA06A115} - roboform
        if (Application.extensions.has("{ec8030f7-c20a-464f-9b0e-13a3a9e97384}"))
        {
            // uninstall the old version of KeeFox (never published on AMO)
            var em = Components.classes["@mozilla.org/extensions/manager;1"]  
                .getService(Components.interfaces.nsIExtensionManager);  
            em.uninstallItem("{ec8030f7-c20a-464f-9b0e-13a3a9e97384}");
            
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser");

            // get a reference to the prompt service component.
            var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
           promptService.alert("Old KeeFox found! An old version of KeeFox has been detected and automatically uninstalled. You must restart your browser again before the new version will work.");
           return false;
        }
    },

    _registerUninstallListeners: function()
    {
        //TODO: get my extension and add event listener for uninstall so we can explain 
        //to user what will be uninstaleld and offer extra options for related apps (i.e. "Uninstall KeePass too?")
    },

    _registerPlacesListeners: function()
    {
        //TODO: listener for bookmark add/edit events and prompt if URL found in KeePass db...
    },

    _keeFoxBrowserStartup: function(currentKFToolbar, currentWindow)
    {        
        this._KFLog.debug("Testing to see if KeeFox has already been setup (e.g. just a second ago by a different window scope)");
        //TODO: confirm multi-threading setup. I assume firefox has
        // one event dispatcher thread so seperate windows can't be calling
        // this function concurrently. if that's wrong, need to rethink
        // or at least lock from here onwards
        if (this._keeFoxStorage.get("KeePassRPCActive", false))
        {
            this._KFLog.debug("Setup has already been done but we will make sure that the window that this scope is a part of has been set up to properly reflect KeeFox status");
            currentKFToolbar.setupButton_ready(currentWindow);
            currentKFToolbar.setAllLogins();
            currentWindow.addEventListener("TabSelect", this._onTabSelected, false);
            return;
        }
        
        this._KFLog.info("KeeFox initialising");
        
        // Set up UI (TODO: Pre-KeePassRPC system did this after attempting
        // a connection so test that this has no bad side-effects)        
        this._keeFoxVariableInit(currentKFToolbar, currentWindow);
        this._keeFoxInitialToolBarSetup(currentKFToolbar, currentWindow);
        
        this.KeePassRPC = new jsonrpcClient();
        if (this._keeFoxExtension.prefs.has("KeePassRPC.port"))
            this.KeePassRPC.port = this._keeFoxExtension.prefs.getValue("KeePassRPC.port",12536);
        
        this.KeePassRPC.connect();
        this._KFLog.info("KeeFox initialised OK - the connection to KeePass may not be established just yet...");            
    },
    
    _keeFoxInitialToolBarSetup : function (currentKFToolbar, currentWindow)
    {    
        // set toolbar
        if (this._keeFoxStorage.get("KeePassRPCActive", false))
        {
            var dbName = this.getDatabaseName();
            
            if (dbName == "")
            {
                this._KFLog.info("Everything has started correctly but no database has been opened yet.");
                this._keeFoxStorage.set("KeePassDatabaseOpen", false);
            } else
            {
                if (this._KFLog.logSensitiveData)
                    this._KFLog.info("Everything has started correctly and the '" + dbName + "' database has been opened.");
                else
                    this._KFLog.info("Everything has started correctly and a database has been opened.");
                    this._keeFoxStorage.set("KeePassDatabaseOpen", true);
            }
            currentKFToolbar.setupButton_ready(currentWindow);
            currentKFToolbar.setAllLogins();
            currentWindow.addEventListener("TabSelect", this._onTabSelected, false);
        } else if (this._keeFoxStorage.get("KeePassRPCInstalled", false))
        {
            // update toolbar etc to say "launch KeePass"
            currentKFToolbar.setupButton_ready(currentWindow);
            currentKFToolbar.setAllLogins();
        }
    },
    
    _keeFoxVariableInit : function(currentKFToolbar, currentWindow)
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
                this._launchInstaller(currentKFToolbar,currentWindow);
            } else
            {
                if (!KeePassEXEfound)
                {
                    this._KFLog.info("KeePass EXE not present in expected location");
                    this._launchInstaller(currentKFToolbar,currentWindow);
                } else
                {
                    if (!KeePassRPCfound)
                    {
                        this._KFLog.info("KeePassRPC plugin DLL not present in KeePass plugins directory so needs to be installed");
                        this._launchInstaller(currentKFToolbar,currentWindow);
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

        this._KFLog.debug("Looking for the KeePass EXE in " + keePassLocation);

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
        this._keeFoxStorage.set("KeePassRPCActive", false);
        this._keeFoxStorage.set("KeePassDatabaseOpen", false); // grrr. This was HOPEFULLY the missing statement that led to the deadlocks (actually a slowly executing infinite recursive loop that would take a long time to exhast the stack - win.keeFoxToolbar.setupButton_ready calls KF.getSatabaseName calls KF._pauseKeeFox). This note remains as a painful reminder and maybe a clue for future debugging!
        
        var wm = Cc["@mozilla.org/appshell/window-mediator;1"].
                 getService(Ci.nsIWindowMediator);
        var enumerator = wm.getEnumerator("navigator:browser");
        var tabbrowser = null;

        while (enumerator.hasMoreElements())
        {
            var win = enumerator.getNext();
            win.keeFoxToolbar.removeLogins();
            //win.keeFoxToolbar.setupButton_loadKeePass(win);
            win.keeFoxToolbar.setupButton_ready(win);
            win.keeFoxUI._removeOLDKFNotifications();
            win.removeEventListener("TabSelect", this._onTabSelected, false);
            //TODO: try this. will it know the DB is offline already? win.keeFoxToolbar.setAllLogins();
        }
        this.KeePassRPC.disconnect();
        this._KFLog.info("KeeFox paused.");
    },
    
    //TODO: test more, especially multiple windows and multiple databases at the same time
    _refreshKPDB: function ()
    {
        this._KFLog.debug("Refreshing KeeFox's view of the KeePass database.");
        var dbName = this.getDatabaseName();                
        if (dbName == "")
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
            win.keeFoxToolbar.removeLogins();
            win.keeFoxToolbar.setAllLogins();
            win.keeFoxToolbar.setupButton_ready(win);
            win.keeFoxUI._removeOLDKFNotifications();
            win.addEventListener("TabSelect", this._onTabSelected, false);
            if (this._keeFoxStorage.get("KeePassDatabaseOpen",false))
            {
                win.keeFoxILM._fillDocument(win.content.document,false);
            }
        }
        
        if (this._keeFoxStorage.get("KeePassDatabaseOpen",false) 
            && this._keeFoxExtension.prefs.getValue("rememberMRUDB",false))
        {
            var MRUFN = this.getDatabaseFileName();
            if (MRUFN != null && MRUFN != undefined)
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
        if (params != "")
            args = [params, '"' + this._keeFoxExtension.prefs.getValue("keePassMRUDB","") + '"'];
        else
            args = ['"' + this._keeFoxExtension.prefs.getValue("keePassMRUDB","") + '"'];
        
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
        file.initWithPath("batch script that calls VBS elevation routines...");

        var process = Components.classes["@mozilla.org/process/util;1"]
                      .createInstance(Components.interfaces.nsIProcess);
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

        this._KFLog.debug("Setting up a button for user to launch installer (also make a massive one on page in future)");
        currentKFToolbar.setupButton_install(currentWindow);
    },
    
    // if the MRU database is known, open that but otherwise send empty string which will cause user
    // to be prompted to choose a DB to open
    loginToKeePass: function()
    {
        this.changeDatabase(this._keeFoxExtension.prefs.getValue("keePassMRUDB",""), true);
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
            return this.KeePassRPC.getDBName();
        } catch (e)
        {
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
            this._KFLog.error("Unexpected exception while connecting to KeePassRPC. Please inform the KeeFox team that they should be handling an exception with this code: " + e.result);
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
        file.initWithPath(_myDepsDir() + "\\CheckForAdminRights.exe");

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
        found = false;

        Application.windows.forEach(function(b) {
            // look at each open browser window (not tab)
            Application.activeWindow.tabs.forEach(function(t) {
                // look at each open tab in browser window b
                if (url == t.uri.spec) {
                    this._KFLog.debug("suitable tab already open - focussing it now");
                    // The URL is already opened. Select this tab.
                    t.focus();

                    // TODO: Focus *this* browser-window?

                    found = true;
                    return t;
                }
            });
        });

        if (!found) {
            this._KFLog.debug("tab with this URL not already open so opening one and focussing it now");

            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                        .getService(Components.interfaces.nsIWindowMediator);
            var newWindow = wm.getMostRecentWindow("navigator:browser");
            var b = newWindow.getBrowser();
            var newTab = b.loadOneTab( url, null, null, null, false, null );
            return newTab;
        }
    },
    
    _myDepsDir: function()
    {
        var file = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(keeFoxInst._myInstalledDir());
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

    /***********************************************
    * Main routine. Run every time the script loads (i.e. a new Firefox window is opened)
    *
    * registers an event listener for when the window finishes loading but only
    * if window is not ready and that hasn't already been done in this session
    **********************************************/
    //TODO: this is registering an object in this KF object to be the event listener and passing the current KFtoolbar
    // but that means that a 2nd window opened in quick succession will overwrite the toolbar and only one will ever get updated
    // i presume this will happen occasionally when sessions are being restored or scripts/add-ons are opening multiple
    // windows in one go so it needs to be fixed but will probably get away with it in the short-term
    // longer term, we need to be registering the startup events only on objects that understand different window scopes
    init: function(currentKFToolbar, currentWindow)
    {
        this._KFLog = currentWindow.KFLog;

        this._KFLog.info("Testing to see if we've already established whether KeePassRPC is connected.");

        //TODO: hmmm... if it is active, why would it not be installed?...
        // need to review this logic - may be affecting startup in some cases
        if (!this._keeFoxStorage.has("KeePassRPCActive"))
        {
            this._KFLog.info("Nope, it's not running"); 
            var observerService = Cc["@mozilla.org/observer-service;1"].
                              getService(Ci.nsIObserverService);
            this._observer._kf = this;
            this._observer._currentKFToolbar = currentKFToolbar;                            
            observerService.addObserver(this._observer, "sessionstore-windows-restored", false);
        
        } else if (!this._keeFoxStorage.get("KeePassRPCInstalled", false))
        {
            this._KFLog.debug("Updating the toolbar becuase KeePassRPC install is needed.");

            if (currentWindow.document)
            {
                this._KFLog.debug("setting up the toolbar");
                currentKFToolbar.setupButton_install(currentWindow);
            } else
            {
                this._KFLog.debug("registering an event listener so we can configure the toolbar when Firefox is ready for us");
                currentWindow.addEventListener("load", currentKFToolbar.setupButton_installListener, false);
            }
            
        } else if (this._keeFoxStorage.get("KeePassRPCInstalled", false) && !this._keeFoxStorage.get("KeePassRPCActive", false))
        {
            this._KFLog.debug("Updating the toolbar becuase user needs to load KeePass.");

            if (currentWindow.document)
            {
                this._KFLog.debug("setting up the toolbar");
                currentKFToolbar.setupButton_ready(currentWindow);
            } else
            {
                this._KFLog.debug("registering an event listener so we can configure the toolbar when Firefox is ready for us");
                currentWindow.addEventListener("load", currentKFToolbar.setupButton_loadKeePassListener, false);
            }
            
         } else if (this._keeFoxStorage.get("KeePassRPCActive", true))
         {
            this._KFLog.debug("Updating the toolbar becuase everything has started correctly.");
            
            if (currentWindow.document)
            {
                this._KFLog.debug("setting up the toolbar");
                currentKFToolbar.setupButton_ready(currentWindow);
                currentKFToolbar.setAllLogins();
            } else
            {
                this._KFLog.debug("registering an event listener so we can configure the toolbar when Firefox is ready for us");
                currentWindow.addEventListener("load", currentKFToolbar.setupButton_readyListener, false);
            }
            currentWindow.addEventListener("TabSelect", this._onTabSelected, false);
        }
    },
    
    _observer : {
        _kf : null,
        _currentKFToolbar : null,

        QueryInterface : XPCOMUtils.generateQI([Ci.nsIObserver, 
                                                Ci.nsISupportsWeakReference]),
        // nsObserver
        observe : function (subject, topic, data)
        {
            switch(topic)
            {
                case "sessionstore-windows-restored":
                    this._kf._keeFoxBrowserStartup(this._currentKFToolbar, this._currentKFToolbar._currentWindow);
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
    CallBackToKeeFoxJS: function(sig) {

        keeFoxInst._KFLog.debug("Signal received by CallBackToKeeFoxJS (" + sig + ")");
        
        switch (sig) {
            // deprecated case "0": keeFoxInst._KFLog.info("Javascript callbacks from KeeFox XPCOM DLL are now disabled."); keeFoxInst._pauseKeeFox(); break;
            // deprecated case "1": keeFoxInst._KFLog.info("Javascript callbacks from KeeFox XPCOM DLL are now enabled."); break;
            // deprecated case "2": keeFoxInst._KFLog.info("KeeICE callbacks from KeePass to KeeFox XPCOM are now enabled."); break;
            case "3": keeFoxInst._KFLog.info("KeePass' currently active DB is about to be opened."); break;
            case "4": keeFoxInst._KFLog.info("KeePass' currently active DB has just been opened."); keeFoxInst._refreshKPDB(); break;
            case "5": keeFoxInst._KFLog.info("KeePass' currently active DB is about to be closed."); break;
            case "6": keeFoxInst._KFLog.info("KeePass' currently active DB has just been closed."); keeFoxInst._refreshKPDB(); break;
            case "7": keeFoxInst._KFLog.info("KeePass' currently active DB is about to be saved."); break;
            case "8": keeFoxInst._KFLog.info("KeePass' currently active DB has just been saved."); keeFoxInst._refreshKPDB(); break;
            case "9": keeFoxInst._KFLog.info("KeePass' currently active DB is about to be deleted."); break;
            case "10": keeFoxInst._KFLog.info("KeePass' currently active DB has just been deleted."); break;
            case "11": keeFoxInst._KFLog.info("KeePass' active DB has been changed/selected."); keeFoxInst._refreshKPDB(); break;
            case "12": keeFoxInst._KFLog.info("KeePass is shutting down."); keeFoxInst._pauseKeeFox(); break;
            default: keeFoxInst._KFLog.error("Invalid signal received by CallBackToKeeFoxJS (" + sig + ")"); break;
        }
    },

//TODO: this seems the wrong place for this function - needs to be in a window-specific section such as KFUI or KFILM
    _onTabSelected: function(event) {
        event.target.ownerDocument.defaultView.keeFoxToolbar.setLogins(null, null);
  
        event.target.ownerDocument.defaultView.keeFoxILM._fillAllFrames(event.target.contentWindow,false);
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
            throw "We couldn't find a favicon for this URL: " + url;
        } catch (ex) 
        {
            // something failed so we can't get the favicon. We don't really mind too much...
            this._KFLog.info("favicon load failed for " + url + " : " + ex);
            throw "We couldn't find a favicon for this URL: " + url + " BECAUSE: " + ex;
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




































// THIS RUNS IN A WORKER THREAD
//TODO: it seems possible for this run function to be called during the KeeICE shutdown procedure but while ICE is still accepting new connections. This means that the vesion check succeeds and the main thread is told that ICE has returned, thereby cancelling the regular check. This probably happens more frequently while debugging delays are included in KeeICE but may happen in the wild too.
// Could something similar happen to cause the deadlock after the KeePass window closed?
//TODO: logging in this class is only via dump to stdout. I presume the features used in KFLogger make it non-thread safe
// so there's probably not a great alternative option at the moment. Will probably just remove the dumps before 1.0
// since no-one will be able to see them or report them so they're only useful in the development environment.
//function KeeFoxICEconnector() {
//}

//KeeFoxICEconnector.prototype = {
//    ICEconnectorTimer: null,
//    KeeFoxICEconnectorTimer: null,
//  QueryInterface: function(iid) {
//    if (iid.equals(Components.interfaces.nsIRunnable) ||
//        iid.equals(Components.interfaces.nsISupports))
//      return this;
//    throw Components.results.NS_ERROR_NO_INTERFACE;
//  },
//  
//        
//        
//  run: function() {
//    dump("start running");
//    this.ICEconnectorTimer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
//    dump("w]");
//    this.KeeFoxICEconnectorTimer = new KeeFoxICEconnectorTimer();
//    dump("x]"+this.ICEconnectorTimer+"]");
//    // crash here sometimes. Can only replicate when loading debug symbols and only when FF first starts.
//    this.ICEconnectorTimer.initWithCallback(this.KeeFoxICEconnectorTimer, 10000, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
//    dump("y]");
//    var thread = Components.classes["@mozilla.org/thread-manager;1"]
//                        .getService(Components.interfaces.nsIThreadManager)
//                        .currentThread;
//    dump("z]");

//    while (true) // this thread never ends
//        thread.processNextEvent(true);
//       
//    dump("end running");
//  }
//};


//function KeeFoxICEconnectorTimer() {
//    this.ICEneedsChecking = true;
//}

//TODO: redo all of this... is there any need for a seperate object callback now? can't
// we just set up a thread sleep on the connect callback thread 
// and then keep trying until we connect... or until stack is full! need to make sure the
// new connection attempts are async so we don't get into a lengthy recursive loop

//KeeFoxICEconnectorTimer.prototype = {
//    main: null,
//    ICEneedsChecking: null,
//  QueryInterface: function(iid) {
//    if (iid.equals(Components.interfaces.nsISupports))
//      return this;
//    throw Components.results.NS_ERROR_NO_INTERFACE;
//  },
//  
//  notify: function(timer) { 

//        dump("started");
// 
///* temp note: removing the whole storage check thing...
//1) keeice should always be installed if this is running becuase it's always called from parts of code that
//require it to be installed. if it is uninstalled at some later point then whatever - we'll just keep trying to connect
//but that's just wasteful rather than a big disaster.
//2) if we need to enforce that keeice is inactive then we can do that on the main thread callback, but we may not even need to bother.
//*/
//        var versionCheckResult = {};
//        KeeICEComOpen = false;

//        
//        if (this.ICEneedsChecking)
//        {
//            dump("working");
//        
//            // false only if ICE connection fault or KeeICE internal error
//            //TODO: is it even safe to call my own XPCOM obejcts from this different thread? one option is to get the xpcom service seperately here and in other worker thread locations.
//            if (keeFoxInst._KeeFoxXPCOMobj.checkVersion(keeFoxInst._KeeFoxVersion, keeFoxInst._KeeICEminVersion, versionCheckResult)) {
//                dump("result");
//                this.main = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;

//                this.main.dispatch(new KFmoduleMainThreadHandler("ICEversionCheck", "finished", versionCheckResult.value, null , null, this), this.main.DISPATCH_NORMAL);
//                dump("dispatched to main");

//            }
//            dump("finished");
//        }
//        dump("alldone");
//        }
//};


//KFmoduleMainThreadHandler.prototype = {
//    run: function() {
//        try {
//            keeFoxInst._KFLog.debug(this.source + ' thread signalled "' + this.reason + '" with result: ' + this.result);
//        
//            switch (this.source) {
//                case "ICEversionCheck":

//                    dump("inswitch");
//                    
//                    if (!keeFoxInst._keeFoxStorage.get("KeePassRPCActive", false) && this.reason == "finished") {
//                    //dump("e]");
//                    //if ( && this.result.value != 0)
//                    //{
//                    
//                    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
//                       .getService(Components.interfaces.nsIWindowMediator);
//    var window = wm.getMostRecentWindow("navigator:browser");
//    
////                        keeFoxInst._keeFoxVariableInit(window.keeFoxToolbar,
////                             window, this.result);
////                             keeFoxInst._configureKeeICECallbacks();
////                             keeFoxInst._refreshKPDB();
//                             
//                    /*
//                        return;
//                        }
//                        
//                        keeFoxInst._keeFoxStorage.set("KeeVersionCheckResult", this.result);
//                        
//                        //TODO: set up variables, etc. as per if it were an initial startup
// 
//                        keeFoxInst._KFLog.info("Successfully established connection with KeeICE");
//                        // remember this across all windows
//                        keeFoxInst._keeFoxStorage.set("KeePassRPCActive", true);
//                        keeFoxInst._keeFoxStorage.set("KeePassRPCInstalled", true);
//                        dump("f]");
//                        //keeFoxInst._refreshKPDB();
//                        keeFoxInst._configureKeeICECallbacks();
//                        dump("g]");
//                        keeFoxInst._refreshKPDB();
//                        dump("h]");                    */
//                    }
//                    break;

//            }

//        } catch (err) {
//            keeFoxInst._KFLog.error(err);
//        }
//        dump("m]");  
//        this.otherThread.ICEneedsChecking = false; //TODO: this could crash if it's not thread safe? maybe ignore it if causes problem? or set from the global var for the ICE thread?
//        dump("n]");  
//    },

//    QueryInterface: function(iid) {
//        if (iid.equals(Components.interfaces.nsIRunnable) ||
//        iid.equals(Components.interfaces.nsISupports)) {
//            return this;
//        }
//        throw Components.results.NS_ERROR_NO_INTERFACE;
//    }
//};





//var KFmoduleMainThreadHandler = function(source, reason, result, mainWindow, browserWindow, otherThread) {
//  this.source = source;
//  this.reason = reason;
//  this.result = result;
//  this.mainWindow = mainWindow;
//  this.browserWindow = browserWindow;
//  this.otherThread = otherThread;
//};


