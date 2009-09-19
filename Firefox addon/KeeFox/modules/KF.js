/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
  The KeeFox object will handle communication with the KeeFox XPCOM objects,
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

var Application = Components.classes["@mozilla.org/fuel/application;1"].getService(Components.interfaces.fuelIApplication);

// just in case this gets used during development...
function alert(msg)
{
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                       .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser");

    // get a reference to the prompt service component.
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);

    promptService.alert(window,"Alert",msg);
}

// constructor
function KeeFox()
{
    this._keeFoxExtension = Application.extensions.get('chris.tomlinson@keefox');
    this._keeFoxStorage = this._keeFoxExtension.storage;
    this._KeeICEminVersion = 0.67;
    this._KeeFoxVersion = 0.67;
    var prefs = this._keeFoxExtension.prefs;
    
    // register preference change handlers so we can react to altered
    // preferences while Firefox is running (actually most of the time we
    // query the current preference value when we need it but this is for completeness)
    if (prefs.has("notifyBarWhenLoggedOut"))
        prefs.get("notifyBarWhenLoggedOut").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("notifyBarWhenKeeICEInactive"))
        prefs.get("notifyBarWhenKeeICEInactive").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("flashIconWhenLoggedOut"))
        prefs.get("flashIconWhenLoggedOut").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("flashIconWhenKeeICEInactive"))
        prefs.get("flashIconWhenKeeICEInactive").events.addListener("change", this.preferenceChangeHandler);
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
    if (prefs.has("keeICEInstalledLocation"))
        prefs.get("keeICEInstalledLocation").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("keePassInstalledLocation"))
        prefs.get("keePassInstalledLocation").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("keePassMRUDB"))
        prefs.get("keePassMRUDB").events.addListener("change", this.preferenceChangeHandler);  
    if (prefs.has("saveFavicons"))
        prefs.get("saveFavicons").events.addListener("change", this.preferenceChangeHandler);      
          

    this._checkForConflictingExtensions();
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

    // The KeeFox XPCOM object which links this javascript code to the ICE transport
    // engine and then onward to the KeeICE KeePass plugin
    _KeeFoxXPCOMobj: null,
    
    // This indirectly polls the ICE transport port so we can discover when
    // KeePass has been opened
    activeICEconnector: null,
    
    // a thread for the above object to run in
    activeICEconnectorThread: null,
    
    _installerTabLoaded: false,
    treeViewGroupChooser: null,

    // initialise the XPCOM object and launch the installation routine if we fail
    _initKeeFox: function(currentKFToolbar,currentWindow) {
        this._KFLog.info("KeeFox initialising");
        try {
            var cid = "@christomlinson.name/keefox;1";
            if (!(cid in Components.classes)) {
                this._KFLog.warn("Couldn't find KeeFox XPCOM (installation corrupt?)");
                this._launchInstaller(currentKFToolbar,currentWindow);
                return false;
            } else {
                this._KFLog.debug("Trying to createInstance of KeeFox XPCOM extension component");
                var KeeFoxXPCOMobjService = Components.classes[cid].getService();
                if (KeeFoxXPCOMobjService == null) {
                    this._KFLog.warn("Couldn't create instance of KeeFox XPCOM (installation corrupt?)");
                    this._launchInstaller(currentKFToolbar,currentWindow);
                    return false;
                } else {
                    this._KFLog.info("KeeFox binary component seems to be installed so omens look good...");
                    this._KeeFoxXPCOMobj = KeeFoxXPCOMobjService.QueryInterface(Components.interfaces.IKeeFox);
                    return true;
                }
            }
        } catch (err) {
            this._KFLog.error(err);
        }
        return false;
    },
/*
    // executed when a firefox window has loaded (chrome)
    _keeFoxBrowserStartupListener: {
        _kf: null,
        _currentKFToolbar: null,

        QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIDOMEventListener,   Components.interfaces.nsISupportsWeakReference]),

        handleEvent: function(event) {
            this._KFLog.debug("keeFoxBrowserStartupListener: got event " + event.type);

            var doc, inputElement;
            switch (event.type) {
                case "load":
                    doc = event.target;
                    this._kf._keeFoxBrowserStartup(this._currentKFToolbar, doc.defaultView);
                    return;

                default:
                    this._KFLog.warn("This event was unexpected and has been ignored.");
                    return;
            }
        }
    },
*/
    // notify all interested objects and functions of changes in preference settings
    // (lots of references to preferences will not be cached so there's not lots to do here)
    preferenceChangeHandler: function(event) {
    
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");

        // get a reference to the prompt service component.
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);

        switch (event.data) {
            case "notifyBarWhenLoggedOut": break;
            case "notifyBarWhenKeeICEInactive": break;
            case "rememberMRUDB": 
                if (this._keeFoxExtension.prefs.getValue("rememberMRUDB",false)) 
                    keeFoxInst._keeFoxExtension.prefs.setValue("keePassMRUDB","");
                break;
            default: break;
        }
    },

    // holding function in case there are any corrective actions we can
    // take if certain extensions cause problems in future
    _checkForConflictingExtensions: function() {
        //if (Application.extensions.has("{22119944-ED35-4ab1-910B-E619EA06A115}"))
        //{
        //    this._KFLog.warn("Roboform found.");
            //TODO: warning? - disable one?
        //}
    },

    _registerUninstallListeners: function() {
        //TODO: get my extension and add event listener for uninstall so we can explain 
        //to user what will be uninstaleld and offer extra options for related apps (i.e. "Uninstall KeePass too?")
    },

    _registerPlacesListeners: function() {
        //TODO: listener for bookmark add/edit events and prompt if URL found in KeePass db...
    },

    _keeFoxBrowserStartup: function(currentKFToolbar, currentWindow) {
        
        this._KFLog.debug("testing to see if KeeFox has already been setup (e.g. just a second ago by a different window scope)");
        //TODO: confirm multi-threading setup. i assume firefox has one event dispatcher thread so seperate windows
        // can't be calling this function concurrently. if that's wrong, need to rethink or at least lock from here onwards
        if (this._keeFoxStorage.get("KeeICEActive", false))
        {
            this._KFLog.debug("yeah, it looks like setup has already been done but since we've been asked to do it, we will now make sure that the window that this scope is a part of has been set up to properly reflect the KeeFox status");
            currentKFToolbar.setupButton_ready(currentWindow);
            currentKFToolbar.setAllLogins();
            currentWindow.addEventListener("TabSelect", this._onTabSelected, false);
            return;
        }
        //TODO: handle case where we know keeice is disabled so just jump straight
        // to configuring the timer to re-call this function every x seconds
        
        this._KFLog.info("starting initial KeeFox startup routines");
        var KeeFoxInitSuccess;
        KeeFoxInitSuccess = this._initKeeFox(currentKFToolbar,currentWindow);

        if (KeeFoxInitSuccess) {
        
            this._KFLog.info("KeeFox initialised OK");
            this._KFLog.info("Running a quick check to see if we can contact KeeICE through the KeeICE IPC channel");

            if (this._KeeFoxXPCOMobj != null)
            {
                // check version of KeeICE
                this._KFLog.info("Verifying KeeICE version is valid for this KeeFox extension version");
                var versionCheckResult = {};
                var version = null;

                // false only if ICE connection fault or KeeICE internal error
                if (!this._KeeFoxXPCOMobj.checkVersion(this._KeeFoxVersion, this._KeeICEminVersion, versionCheckResult))
                {
                    this._KFLog.info("Couldn't test version becuase KeeICE not available");
                } else
                {
                    version = versionCheckResult.value
                }
                this._keeFoxVariableInit(currentKFToolbar, currentWindow, version);
                
                this._keeFoxInitialToolBarSetup(currentKFToolbar, currentWindow);
            }
        
        } // end if "keefox has loaded its binary components correctly"
    },
    
    _keeFoxInitialToolBarSetup : function (currentKFToolbar, currentWindow)
    {
    
        // set toolbar
        if (this._keeFoxStorage.get("KeeICEActive", false))
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
            this._configureKeeICECallbacks(); // seems to work but should it be delayed via an event listener?
            currentWindow.addEventListener("TabSelect", this._onTabSelected, false);

        } else if (this._keeFoxStorage.get("KeeICEInstalled", false))
        {
            // update toolbar etc to say "launch KeePass"
            currentKFToolbar.setupButton_ready(currentWindow);
            currentKFToolbar.setAllLogins();
            //this._configureKeeICECallbacks(); // seems to work but should it be delayed via an event listener?
            // not needed cos above function will run it if needed (expect it won't!)...
            // and probably shouldn't run anyway if ICE is not established?
            // what use is it to know we can communicate with our XPCOM DLL?
            this.startICEcallbackConnector();
          
        }
    },
    
    _keeFoxVariableInit : function(currentKFToolbar, currentWindow, versionCheckResult)
    {
    
        //var KeeICEComOpen = false;
        if (versionCheckResult != undefined && versionCheckResult != null)
        {
            this._keeFoxStorage.set("KeeVersionCheckResult", versionCheckResult);
            
            if (versionCheckResult == 1) {
                this._KFLog.error("This version of KeeFox is too old to work with the installed version of KeeICE. You need to upgrade KeeFox (or downgrade KeeICE)");
                //TODO: trigger an auto-update of the KeeFox extension?
                this._launchInstaller(currentKFToolbar,currentWindow);
                //return;
            } else if (versionCheckResult == -1) {
                this._KFLog.error("The installed version of KeeICE is too old to work with this version of KeeFox. You need to upgrade to the new version of KeeICE. Please follow the instructions on the next page...");
                this._launchInstaller(currentKFToolbar,currentWindow, true);
                //return;
            } else {
                this._KFLog.debug("KeeICE and KeeFox version match OK.");
                //KeeICEComOpen = true;
            }
        }
        
        var KeePassEXEfound;
        var KeeICEDLLfound;
        
        var keePassLocation;
        keePassLocation = "not installed";
        var keeICELocation;
        keeICELocation = "not installed";
        
        keePassLocation = this._discoverKeePassInstallLocation();
        if (keePassLocation != "not installed")
        {
            KeePassEXEfound = this._confirmKeePassInstallLocation(keePassLocation);
            if (KeePassEXEfound)
            {
                keeICELocation = this._discoverKeeICEInstallLocation();
                KeeICEDLLfound = this._confirmKeeICEInstallLocation(keeICELocation);
                if (!KeeICEDLLfound)
                    this._keeFoxExtension.prefs.setValue("keeICEInstalledLocation",""); //TODO: set this to "not installed"?
                
            } else
            {
                this._keeFoxExtension.prefs.setValue("keePassInstalledLocation",""); //TODO: set this to "not installed"?
            }
        }

        if (this._keeFoxStorage.get("KeeVersionCheckResult", -1) == 0) // KeeICEComOpen && // version check succeeded
        //if (2==1)
        {
            this._KFLog.info("Successfully established connection with KeeICE");
            // remember this across all windows
            this._keeFoxStorage.set("KeeICEActive", true);
            this._keeFoxStorage.set("KeeICEInstalled", true);

        } else { 
            this._KFLog.info("Couldn't communicate with KeeICE");
            // if it fails KeeICE is either not running or not installed - let's find out which...
            // (we've already set up the information we need to construct the installation wizzard if required)

            if (keeICELocation == "not installed")
            {
                this._KFLog.info("KeeICE location was not found");
                this._launchInstaller(currentKFToolbar,currentWindow);
            } else
            {
                
                if (!KeePassEXEfound)
                {
                    this._KFLog.info("KeePass EXE not present in expected location");
                    this._launchInstaller(currentKFToolbar,currentWindow);
                } else
                {
                    if (!KeeICEDLLfound) {
                        this._KFLog.info("KeeICE plugin DLL not present in KeePass plugins directory so needs to be installed");
                        this._launchInstaller(currentKFToolbar,currentWindow);
                    } else {
                        this._KFLog.info("KeePass is not running or plugin is disabled.");
                        this._keeFoxStorage.set("KeeICEInstalled", true);
                    }
                }
            }
            this._KFLog.info("KeeICE is inactive. We'll remember that so we don't have to do this again when another window is opened.");
            this._keeFoxStorage.set("KeeICEActive", false);
        }

    },
    
    // works out where KeePass is installed and records it in a Firefox preference
    _discoverKeePassInstallLocation: function() {
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
    
    // works out where KeeICE is installed and records it in a Firefox preference
    _discoverKeeICEInstallLocation: function() {
        var keeICELocation = "not installed";
        var keePassLocation = "not installed";
        //return keeICELocation; //HACK: debug (forces install process to start)
        
        if (this._keeFoxExtension.prefs.has("keeICEInstalledLocation"))
        {
            keeICELocation = this._keeFoxExtension.prefs.getValue("keeICEInstalledLocation","not installed");
            if (keeICELocation != "")
                if (this._KFLog.logSensitiveData)
                    this._KFLog.info("KeeICE install location found in preferences: " + keeICELocation);
                else
                    this._KFLog.info("KeeICE install location found in preferences.");
            else
                keeICELocation = "not installed";
        }
        
        if (keeICELocation == "not installed" 
            && this._keeFoxExtension.prefs.has("keePassInstalledLocation") 
            && this._keeFoxExtension.prefs.getValue("keePassInstalledLocation","") != "")
        {
            keePassLocation = this._keeFoxExtension.prefs.getValue("keePassInstalledLocation","not installed");
            keeICELocation = keePassLocation + "plugins\\";
            this._keeFoxExtension.prefs.setValue("keeICEInstalledLocation",keeICELocation);
            if (this._KFLog.logSensitiveData)
                this._KFLog.debug("KeeICE install location inferred: " + keeICELocation);
            else
                this._KFLog.debug("KeeICE install location inferred.");
        }
        
        return keeICELocation;
    },
    
    _confirmKeePassInstallLocation: function(keePassLocation) {
        var KeePassEXEfound;
        KeePassEXEfound = false;

        this._KFLog.debug("Looking for the KeePass EXE in " + keePassLocation);

        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        try {
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
    
    _confirmKeeICEInstallLocation: function(keeICELocation) {
        var KeeICEDLLfound;
        KeeICEDLLfound = false;

        if (this._KFLog.logSensitiveData)
            this._KFLog.info("Looking for the KeeICE plugin DLL in " + keeICELocation);
        else
            this._KFLog.info("Looking for the KeeICE plugin DLL in " + keeICELocation);
        this._KFLog.info("Looking for the KeeICE plugin DLL in " + keeICELocation);

        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        try {
            file.initWithPath(keeICELocation);
            if (file.isDirectory())
            {
                file.append("KeeICE.dll");
                if (file.isFile())
                {
                    KeeICEDLLfound = true;
                    this._KFLog.info("KeeICE DLL found in correct location.");
                }
            }
        } catch (ex)
        {
            /* no need to do anything */
        }
        
        return KeeICEDLLfound;
    },
    
    // check to see if KeeICE has been enabled once every 10 seconds
    // (this can lead to a small delay in KeeFox reporting the change in state
    // but in most cases the user will be busy entering their master password
    // anyway)
    startICEcallbackConnector: function() {
    
    // what if the ice connector is already active? i guess in most cases we 
    // want to avoid calling this function in that situation but realistically 
    // there will probably always be unexpected orders of events from external 
    // processes which cause it to happen so we need to concern ourselves with it here.
    // can i find out if there is already a running thread attached to this variable and just leave it there?
    
    // I am assuming that a completed thread will result in null values for these two variables but I am doubtful.
    // at least this way the worse that could happen is that KeePass startup is not correctly detected which
    // is a vast improvement on the alternative of random application crashes
        this._KFLog.debug("Considering whether to start the KeeICEconnector thread...");
        if (((this.activeICEconnector == undefined || this.activeICEconnector == null)
            && (this.activeICEconnectorThread == undefined || this.activeICEconnectorThread == null)
            )// || this.activeICEconnector.timerStillUseful == null //TODO: is this really thread safe? if not, HOW do we fix it? Do we need to clean up the old vars or does JS GC do that for us?
           )
        {
            this._KFLog.info("Starting the KeeICEconnector thread.");
            this.activeICEconnector = new KeeFoxICEconnector();
            this.activeICEconnectorThread = 
              Components.classes["@mozilla.org/thread-manager;1"].
              getService().newThread(0);
           
            this.activeICEconnectorThread.dispatch(this.activeICEconnector, this.activeICEconnectorThread.DISPATCH_NORMAL);
            
         }   else
         {
         this._KFLog.debug("Poking the KeeICEconnector thread.");
         this.activeICEconnector.KeeFoxICEconnectorTimer.ICEneedsChecking = true;
         
         }
    },

    // Temporarilly disable KeeFox. Used (for e.g.) when KeePass is shut down.
    // starts a regular check for KeeICE becoming available again.
    //TODO: test more thoroughly, especially multiple windows aspect
    _pauseKeeFox: function() {
        this._KFLog.debug("Pausing KeeFox.");
        this._keeFoxStorage.set("KeeICEActive", false);
        this._keeFoxStorage.set("KeePassDatabaseOpen", false); // grrr. This was HOPEFULLY the missing statement that led to the deadlocks (actually a slowly executing infinite recursive loop that would take a long time to exhast the stack - win.keeFoxToolbar.setupButton_ready calls KF.getSatabaseName calls KF._pauseKeeFox). This note remains as a painful reminder and maybe a clue for future debugging!
        
        var wm = Cc["@mozilla.org/appshell/window-mediator;1"].
                 getService(Ci.nsIWindowMediator);
        var enumerator = wm.getEnumerator("navigator:browser");
        var tabbrowser = null;

        while (enumerator.hasMoreElements()) {
            var win = enumerator.getNext();
            win.keeFoxToolbar.removeLogins();
            //win.keeFoxToolbar.setupButton_loadKeePass(win);
            win.keeFoxToolbar.setupButton_ready(win);
            win.keeFoxUI._removeOLDKFNotifications();
            win.removeEventListener("TabSelect", this._onTabSelected, false);
            //TODO: try this. will it know the DB is offline already? win.keeFoxToolbar.setAllLogins();

        }
        // clean up the old ICE client connection (now done in C++)
        this._KeeFoxXPCOMobj.shutdownICE();
        
        // fire off a new thread every x seconds (until successful thread callback cancels the timer)
        this.startICEcallbackConnector();
        this._KFLog.info("KeeFox paused.");
    },
    
    //TODO: test more, especially multiple windows and multiple databases at the same time
    _refreshKPDB: function () {
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

        while (enumerator.hasMoreElements()) {
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
        
        if (this._keeFoxStorage.get("KeePassDatabaseOpen",false) && this._keeFoxExtension.prefs.getValue("rememberMRUDB",false))
        {
            var MRUFN = this.getDatabaseFileName();
            if (MRUFN != null && MRUFN != undefined)
                this._keeFoxExtension.prefs.setValue("keePassMRUDB",MRUFN);
        }

        this._KFLog.info("KeeFox feels very refreshed now.");
    },
    
    getDatabaseName: function() {
        try {
            return this._KeeFoxXPCOMobj.getDBName();
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    getDatabaseFileName: function () {
        try {
            return this._KeeFoxXPCOMobj.getDBFileName();
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
        return "";
    },
    
    getAllDatabaseFileNames: function () {
        try {
            return this._KeeFoxXPCOMobj.getMRUdatabases({});
          
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
        return "";
    },
    
    changeDatabase: function (fileName, closeCurrent) {
        try {
            this._KeeFoxXPCOMobj.ChangeDB(fileName, closeCurrent);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    addLogin: function (login, parentUUID) {
        try {
            return this._KeeFoxXPCOMobj.addLogin(login, parentUUID);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    addGroup: function (title, parentUUID) {
        try {
            return this._KeeFoxXPCOMobj.addGroup(title, parentUUID);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    removeLogin: function (uniqueID) {
        try {
            return this._KeeFoxXPCOMobj.deleteLogin(uniqueID);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    removeGroup: function (uniqueID) {
        try {
            return this._KeeFoxXPCOMobj.deleteGroup(uniqueID);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    getParentGroup: function (uniqueID) {
        try {
            return this._KeeFoxXPCOMobj.getParentGroup(uniqueID);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    getRootGroup: function () {
        try {
            return this._KeeFoxXPCOMobj.getRootGroup();
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    getChildGroups: function (count, uniqueID) {
        try {
            return this._KeeFoxXPCOMobj.getChildGroups(count, uniqueID);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    getChildEntries: function (count, uniqueID) {
        try {
            return this._KeeFoxXPCOMobj.getChildEntries(count, uniqueID);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },

    
    modifyLogin: function (oldLogin, newLogin) {
        try {
            return this._KeeFoxXPCOMobj.modifyLogin(oldLogin, newLogin);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    getAllLogins: function (count) {
        try {
            return this._KeeFoxXPCOMobj.getAllLogins(count);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    findLogins: function (count, hostname, formSubmitURL, httpRealm, uniqueID) {
        try {
            return this._KeeFoxXPCOMobj.findLogins(count, hostname, formSubmitURL, httpRealm, uniqueID);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    countLogins: function (hostName,actionURL,loginSearchType) {
        try {
            return this._KeeFoxXPCOMobj.countLogins(hostName,actionURL,loginSearchType);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    launchKeePass: function (params) {
        if (!this._keeFoxExtension.prefs.has("keePassInstalledLocation"))
        {
            return; // TODO: work it out, prompt user or just bomb out with notification why
        }
        
        if (this._keeFoxExtension.prefs.has("ICE.port"))
        {
            if (params != "")
                params = params + " ";
            params = "-KeeICEPort:" +
                this._keeFoxExtension.prefs.getValue("ICE.port",12535);
        }
        
        var fileName = this._keeFoxExtension.prefs.getValue("keePassInstalledLocation","C:\\Program files\\KeePass Password Safe 2\\") + "KeePass.exe";
        var clps = (params != "") ? (params + " " + '"' + this._keeFoxExtension.prefs.getValue("keePassMRUDB","") + '"') : ('"' + this._keeFoxExtension.prefs.getValue("keePassMRUDB","") + '"');
        this._KeeFoxXPCOMobj.LaunchKeePass('"' + fileName + '"', clps);
    
    },
    
    launchLoginEditor: function (uuid) {
        try {
            var thread = Components.classes["@mozilla.org/thread-manager;1"]
                                    .getService(Components.interfaces.nsIThreadManager)
                                    .newThread(0);
             thread.dispatch(new launchLoginEditorThread(uuid), thread.DISPATCH_NORMAL);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },

    launchGroupEditor: function (uuid) {
        try {
             var thread = Components.classes["@mozilla.org/thread-manager;1"]
                                    .getService(Components.interfaces.nsIThreadManager)
                                    .newThread(0);
             thread.dispatch(new launchGroupEditorThread(uuid), thread.DISPATCH_NORMAL);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }
        }
    },
    
    // this runs in a secondary thread - don't access the UI!
    runAnInstaller: function (fileName, params) {
        this._KeeFoxXPCOMobj.RunAnInstaller('"' + fileName + '"', '"' + params + '"');
    },
    
    // if the MRU database is known, open that but otherwise send empty string which will cause user
    // to be prompted to choose a DB to open
    loginToKeePass: function () {
        this.changeDatabase(this._keeFoxExtension.prefs.getValue("keePassMRUDB",""), true);
    },
    
    IsUserAdministrator: function () {
        return this._KeeFoxXPCOMobj.IsUserAdministrator();
    },

    // Helper for making nsURI from string
    _convert_url: function(spec) {
        var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        return ios.newURI(spec, null, null);
    },

    _openAndReuseOneTabPerURL: function(url) {
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
    
    _myDepsDir: function() {
        var file = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(keeFoxInst._myInstalledDir());
        file.append("deps");
        return file.path;
    },

    _myInstalledDir: function() {
        this._KFLog.debug("establishing the directory that KeeFox is installed in");

        var MY_ID = "chris.tomlinson@keefox";
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

    KeeFox_MainButtonClick_install: function(event, temp) {
        this._KFLog.debug("install button clicked. Loading (and focusing) install page.");
        // always run it if user requests
        installTab = this._openAndReuseOneTabPerURL("chrome://keefox/content/install.xul");
        // remember the installation state (until it might have changed...)
        this._keeFoxStorage.set("KeeICEInstalled", false);
    },

    _launchInstaller: function(currentKFToolbar,currentWindow, upgrade) {
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
        
        // load page in new tab called KeeFox installer with install button (linked to same action as toolbar button) (and screenshot of button? - maybe not needed - just have a massive "install" graphic?)
        //installTab = this._openAndReuseOneTabPerURL("chrome://keefox/content/install.xul");

        // remember the installation state (until it might have changed...)
        this._keeFoxStorage.set("KeeICEInstalled", false);

        this._KFLog.debug("Setting up a button for user to launch installer (also make a massive one on page in future)");
        currentKFToolbar.setupButton_install(currentWindow);
    },

    /***********************************************
    *
    * Main routine. Run every time the script loads (i.e. a new Firefox window is opened)
    *
    * registers an event listener for when the window finishes loading but only
    * if window is not ready and this hasn't already been done in this session
    **********************************************/
    //TODO: this is registering an object in this KF object to be the event listener and passing the current KFtoolbar
    // but that means that a 2nd window opened in quick succession will overwrite the toolbar and only one will ever get updated
    // i presume this will happen occasionally when sessions are being restored or scripts/add-ons are opening multiple
    // windows in one go so it needs to be fixed but will probably get away with it in the short-term
    // longer term, we need to be registering the startup events only on objects that understand different window scopes
    init: function(currentKFToolbar, currentWindow) {
        this._KFLog = currentWindow.KFLog;

        this._KFLog.info("Testing to see if we've already established whether KeeICE is running.");

        //TODO: hmmm... if it is active, why would it not be installed?... need to review this logic - may be affecting startup in some cases
        if (!this._keeFoxStorage.has("KeeICEActive")) {
            this._KFLog.info("Nope, it's not running");
            
            
            var observerService = Cc["@mozilla.org/observer-service;1"].
                              getService(Ci.nsIObserverService);
            this._observer._kf = this;
            this._observer._currentKFToolbar = currentKFToolbar;
                            
            observerService.addObserver(this._observer, "sessionstore-windows-restored", false);
        
        } else if (!this._keeFoxStorage.get("KeeICEInstalled", false)) {
            this._KFLog.debug("Updating the toolbar becuase KeeICE install is needed.");

            if (currentWindow.document)
            {
                this._KFLog.debug("setting up the toolbar");
                currentKFToolbar.setupButton_install(currentWindow);
            } else
            {
                this._KFLog.debug("registering an event listener so we can configure the toolbar when Firefox is ready for us");
                currentWindow.addEventListener("load", currentKFToolbar.setupButton_installListener, false);
            }
            
        } else if (this._keeFoxStorage.get("KeeICEInstalled", false) && !this._keeFoxStorage.get("KeeICEActive", false)) {
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
            
         } else if (this._keeFoxStorage.get("KeeICEActive", true)) {
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
        observe : function (subject, topic, data) {
            switch(topic) {
                case "sessionstore-windows-restored":
                    this._kf._keeFoxBrowserStartup(this._currentKFToolbar, this._currentKFToolbar._currentWindow);
                    break;
            }

        },
        
        notify : function (subject, topic, data) {
            

        }
    },

    _configureKeeICECallbacks: function() {
        this._KFLog.debug("Setting up a way to receive notification of KeeICE status changes.");
        //netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        
        try {
            this._KeeFoxXPCOMobj.addObserver(this.CallBackToKeeFoxJS); // this should have no effect if observer is already registered
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this._KFLog.warn("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this.startICEcallbackConnector();
                break;
             default:
                this._KFLog.error("Unexpected exception while connecting to KeeICE. Please inform the KeeFox team that they should consider handling an exception with this code: " + e.result);
                throw e;
            }

  
        }
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
            case 0: keeFoxInst._KFLog.info("Javascript callbacks from KeeFox XPCOM DLL are now disabled."); keeFoxInst._pauseKeeFox(); break;
            case 1: keeFoxInst._KFLog.info("Javascript callbacks from KeeFox XPCOM DLL are now enabled."); break;
            case 2: keeFoxInst._KFLog.info("KeeICE callbacks from KeePass to KeeFox XPCOM are now enabled."); break;
            case 3: keeFoxInst._KFLog.info("KeePass' currently active DB is about to be opened."); break;
            case 4: keeFoxInst._KFLog.info("KeePass' currently active DB has just been opened."); keeFoxInst._refreshKPDB(); break;
            case 5: keeFoxInst._KFLog.info("KeePass' currently active DB is about to be closed."); break;
            case 6: keeFoxInst._KFLog.info("KeePass' currently active DB has just been closed."); keeFoxInst._refreshKPDB(); break;
            case 7: keeFoxInst._KFLog.info("KeePass' currently active DB is about to be saved."); break;
            case 8: keeFoxInst._KFLog.info("KeePass' currently active DB has just been saved."); keeFoxInst._refreshKPDB(); break;
            case 9: keeFoxInst._KFLog.info("KeePass' currently active DB is about to be deleted."); break;
            case 10: keeFoxInst._KFLog.info("KeePass' currently active DB has just been deleted."); break;
            case 11: keeFoxInst._KFLog.info("KeePass' active DB has been changed/selected."); keeFoxInst._refreshKPDB(); break;
            case 12: keeFoxInst._KFLog.info("KeePass is shutting down."); keeFoxInst._pauseKeeFox(); break;
            default: keeFoxInst._KFLog.error("Invalid signal received by CallBackToKeeFoxJS (" + sig + ")"); break;
        }
    },

//TODO: this seems the wrong place for this function - needs to be in a window-specific section such as KFUI or KFILM
    _onTabSelected: function(event) {
        event.target.ownerDocument.defaultView.keeFoxToolbar.setLogins(null, null);
  
        event.target.ownerDocument.defaultView.keeFoxILM._fillAllFrames(event.target.contentWindow,false);
    },
    
    
    // TODO: put this somewhere sensible, maybe a utils file, depending on what else we come up over the next few months...
    kfLoginFieldsConstructor : function () {
                     
        var fieldsArray = null;

        if ( arguments.length > 0 ) // we're being given some custom fields to deal with...
        {
            fieldsArray = Components.classes["@mozilla.org/array;1"]
                        .createInstance(Components.interfaces.nsIMutableArray);
            
            for (i = 0; i+1 < arguments.length; i=i+5)
            {
                var kfLoginField = new Components.Constructor(
            "@christomlinson.name/kfLoginField;1", Ci.kfILoginField);
            
                var field = new kfLoginField;
                field.init( arguments[i], arguments[i+1], arguments[i+2], arguments[i+3], arguments[i+4]);
                fieldsArray.appendElement(field,false);
            }
        }
        
        return fieldsArray;
    }

};

var keeFoxInst = new KeeFox;





// THIS RUNS IN A WORKER THREAD
//TODO: it seems possible for this run function to be called during the KeeICE shutdown procedure but while ICE is still accepting new connections. This means that the vesion check succeeds and the main thread is told that ICE has returned, thereby cancelling the regular check. This probably happens more frequently while debugging delays are included in KeeICE but may happen in the wild too.
// Could something similar happen to cause the deadlock after the KeePass window closed?
//TODO: logging in this class is only via dump to stdout. I presume the features used in KFLogger make it non-thread safe
// so there's probably not a great alternative option at the moment. Will probably just remove the dumps before 1.0
// since no-one will be able to see them or report them so they're only useful in the development environment.
function KeeFoxICEconnector() {
}

KeeFoxICEconnector.prototype = {
    ICEconnectorTimer: null,
    KeeFoxICEconnectorTimer: null,
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsIRunnable) ||
        iid.equals(Components.interfaces.nsISupports))
      return this;
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },
  
        
        
  run: function() {
    dump("start running");
    this.ICEconnectorTimer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
    dump("w]");
    this.KeeFoxICEconnectorTimer = new KeeFoxICEconnectorTimer();
    dump("x]"+this.ICEconnectorTimer+"]");
    // crash here sometimes. Can only replicate when loading debug symbols and only when FF first starts.
    this.ICEconnectorTimer.initWithCallback(this.KeeFoxICEconnectorTimer, 10000, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
    dump("y]");
    var thread = Components.classes["@mozilla.org/thread-manager;1"]
                        .getService(Components.interfaces.nsIThreadManager)
                        .currentThread;
    dump("z]");

    while (true) // this thread never ends
        thread.processNextEvent(true);
       
    dump("end running");
  }
};


function KeeFoxICEconnectorTimer() {
    this.ICEneedsChecking = true;
}

KeeFoxICEconnectorTimer.prototype = {
    main: null,
    ICEneedsChecking: null,
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsISupports))
      return this;
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },
  
  notify: function(timer) { 

        dump("started");
 
/* temp note: removing the whole storage check thing...
1) keeice should always be installed if this is running becuase it's always called from parts of code that
require it to be installed. if it is uninstalled at some later point then whatever - we'll just keep trying to connect
but that's just wasteful rather than a big disaster.
2) if we need to enforce that keeice is inactive then we can do that on the main thread callback, but we may not even need to bother.
*/
        var versionCheckResult = {};
        KeeICEComOpen = false;

        
        if (this.ICEneedsChecking)
        {
            dump("working");
        
            // false only if ICE connection fault or KeeICE internal error
            //TODO: is it even safe to call my own XPCOM obejcts from this different thread? one option is to get the xpcom service seperately here and in other worker thread locations.
            if (keeFoxInst._KeeFoxXPCOMobj.checkVersion(keeFoxInst._KeeFoxVersion, keeFoxInst._KeeICEminVersion, versionCheckResult)) {
                dump("result");
                this.main = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;

                this.main.dispatch(new KFmoduleMainThreadHandler("ICEversionCheck", "finished", versionCheckResult.value, null , null, this), this.main.DISPATCH_NORMAL);
                dump("dispatched to main");

            }
            dump("finished");
        }
        dump("alldone");
        }
};

var KFmoduleMainThreadHandler = function(source, reason, result, mainWindow, browserWindow, otherThread) {
  this.source = source;
  this.reason = reason;
  this.result = result;
  this.mainWindow = mainWindow;
  this.browserWindow = browserWindow;
  this.otherThread = otherThread;
};

KFmoduleMainThreadHandler.prototype = {
    run: function() {
        try {
            keeFoxInst._KFLog.debug(this.source + ' thread signalled "' + this.reason + '" with result: ' + this.result);
        
            switch (this.source) {
                case "ICEversionCheck":

                    dump("inswitch");
                    
                    if (!keeFoxInst._keeFoxStorage.get("KeeICEActive", false) && this.reason == "finished") {
                    //dump("e]");
                    //if ( && this.result.value != 0)
                    //{
                    
                    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                       .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser");
    
                        keeFoxInst._keeFoxVariableInit(window.keeFoxToolbar,
                             window, this.result);
                             keeFoxInst._configureKeeICECallbacks();
                             keeFoxInst._refreshKPDB();
                             
                    /*
                        return;
                        }
                        
                        keeFoxInst._keeFoxStorage.set("KeeVersionCheckResult", this.result);
                        
                        //TODO: set up variables, etc. as per if it were an initial startup
 
                        keeFoxInst._KFLog.info("Successfully established connection with KeeICE");
                        // remember this across all windows
                        keeFoxInst._keeFoxStorage.set("KeeICEActive", true);
                        keeFoxInst._keeFoxStorage.set("KeeICEInstalled", true);
                        dump("f]");
                        //keeFoxInst._refreshKPDB();
                        keeFoxInst._configureKeeICECallbacks();
                        dump("g]");
                        keeFoxInst._refreshKPDB();
                        dump("h]");                    */
                    }
                    break;

            }

        } catch (err) {
            keeFoxInst._KFLog.error(err);
        }
        dump("m]");  
        this.otherThread.ICEneedsChecking = false; //TODO: this could crash if it's not thread safe? maybe ignore it if causes problem? or set from the global var for the ICE thread?
        dump("n]");  
    },

    QueryInterface: function(iid) {
        if (iid.equals(Components.interfaces.nsIRunnable) ||
        iid.equals(Components.interfaces.nsISupports)) {
            return this;
        }
        throw Components.results.NS_ERROR_NO_INTERFACE;
    }
};


var launchGroupEditorThread = function(uuid) {
  this.uniqueID = uuid;
};

launchGroupEditorThread.prototype = {
  run: function() {
    try {
      keeFoxInst._KeeFoxXPCOMobj.launchGroupEditor(this.uniqueID);
   
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
      keeFoxInst._KeeFoxXPCOMobj.launchLoginEditor(this.uniqueID);
  
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