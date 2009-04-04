/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
  The KeeFox object will handle 
  communication with the KeeFox XPCOM objects, including situations such as
  partially installed components and KeePass not running. The object is mainly
  concerned with low-level extension fucntionality rather than user-visible
  behaviour or actual use of the data in the active KeePass database.
  
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

//TODO: delete or put this inside keeFox prototype
function error(aMsg)
{
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage("ERROR: " + aMsg);
}

function KeeFox()
{
    this._keeFoxExtension = Application.extensions.get('chris.tomlinson@keefox');
    this._keeFoxStorage = this._keeFoxExtension.storage;
    this.ICEconnectorTimer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
    this._KeeICEminVersion = 0.5;
    this._KeeFoxVersion = 0.5;
    this.temp = 1;
    var prefs = this._keeFoxExtension.prefs;
    
    if (prefs.has("notifyBarWhenLoggedOut"))
        prefs.get("notifyBarWhenLoggedOut").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("notifyBarWhenKeeICEInactive"))
        prefs.get("notifyBarWhenKeeICEInactive").events.addListener("change", this.preferenceChangeHandler);
    if (prefs.has("rememberMRUDB"))
        prefs.get("rememberMRUDB").events.addListener("change", this.preferenceChangeHandler);

//TODO: not ideal place to call these since they should happen only once per firefox session, not every time keefox wakes up
        this._checkForConflictingExtensions();
        this._registerUninstallListeners();
        this._registerPlacesListeners();
        
}

KeeFox.prototype = {

temp : null,
_test : null,
editTest : function (numb)
{
this._test = numb;
},
    strbundle: null,

    _KeeFoxXPCOMobj: null,
    ICEconnectorTimer: null,
    ICEconnectorEvent: null,
    _kfilm: null, // The KeeFox Improved Login Manager (probably not used any more)
    _toolbar: null,
    _kfui: null,
    _KeeFoxTestErrorOccurred: false,
    keePassLocation: null,
    _installerTabLoaded: false,
    
    __logService : null, // Console logging service, used for debugging.
    get _logService() {
        if (!this.__logService)
            this.__logService = Cc["@mozilla.org/consoleservice;1"].
                                getService(Ci.nsIConsoleService);
        return this.__logService;
    },
    
    // Internal function for logging debug messages to the Error Console window
    log : function (message) {
        this._logService.logStringMessage(message);
    },

    _initKeeFox: function(currentKFToolbar,currentWindow) {
        this.log("KeeFox initialising");
        try {
            var cid = "@christomlinson.name/keefox;1";
            if (!(cid in Components.classes)) {
                this.log("Couldn't find KeeFox XPCOM (installation corrupt?)");
                this._launchInstaller(currentKFToolbar,currentWindow);
                return false;
            } else {
                this.log("Trying to createInstance of KeeFox XPCOM extension component");
                var KeeFoxXPCOMobjService = Components.classes[cid].getService();
                if (KeeFoxXPCOMobjService == null) {
                    this.log("Couldn't create instance of KeeFox XPCOM (installation corrupt?)");
                    this._launchInstaller(currentKFToolbar,currentWindow);
                    return false;
                } else {
                    this.log("KeeFox binary component seems to be installed so omens look good...");
                    this._KeeFoxXPCOMobj = KeeFoxXPCOMobjService.QueryInterface(Components.interfaces.IKeeFox);
                    return true;
                }
            }
        } catch (err) {
            error(err);
        }
        return false;
    },

    _keeFoxBrowserStartupListener: {
        _kf: null,
        _currentKFToolbar: null,

        QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIDOMEventListener,   Components.interfaces.nsISupportsWeakReference]),


        handleEvent: function(event) {
            this._kf.log("keeFoxBrowserStartupListener: got event " + event.type);

            var doc, inputElement;
            switch (event.type) {
                case "load":
                    doc = event.target;
                    this._kf._keeFoxBrowserStartup(this._currentKFToolbar, doc.defaultView);
                    return;

                default:
                    this._kf.log("This event was unexpected and has been ignored.");
                    return;
            }
        }
    },

// notify all interested objects and functions of changes in preference settings
// (lots of references to preferences will not be cached so there's not lots to do here)
    preferenceChangeHandler: function(event) {
    
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                       .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser");

    // get a reference to the prompt service component.
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);

    //promptService.alert(window,"Alert",msg);
    
        switch (event.data) {
            case "notifyBarWhenLoggedOut": break;
            case "notifyBarWhenKeeICEInactive": break;
            case "rememberMRUDB": if (this._keeFoxExtension.prefs.getValue("rememberMRUDB",false)) keeFoxInst._keeFoxExtension.prefs.setValue("keePassMRUDB",""); break;
            default: break;
        }
    },

    _checkForConflictingExtensions: function() {
        if (Application.extensions.has("{22119944-ED35-4ab1-910B-E619EA06A115}"))
        {
            this.log("Roboform found.");
            //TODO: warning? - disable one?
        }
    },

    _registerUninstallListeners: function() {
        //TODO: get my extension and add event listener for uninstall so we can explain 
        //to user what will be uninstaleld and offer extra options for related apps
    },

    _registerPlacesListeners: function() {
        //TODO: listener for bookmark add/edit events and prompt if URL found in KeePass db...
    },

    _keeFoxBrowserStartup: function(currentKFToolbar, currentWindow) {
        
        this.log("testing to see if KeeFox has already been setup (e.g. just a second ago by a different window scope)");
        //TODO: confirm multi-threading setup. i assume firefox has one event dispatcher thread so seperate windows
        // can't be calling this function concurrently. if that's wrong, need to rethink or at least lock from here onwards
        if (this._keeFoxStorage.get("KeeICEActive", false))
        {
            this.log("yeah, it looks like setup has already been done but since we've been asked to do it, we will now make sure that the window that this scope is a part of has been set up to properly reflect the KeeFox status");
            currentKFToolbar.setupButton_ready(currentWindow);
            currentKFToolbar.setAllLogins();
            currentWindow.addEventListener("TabSelect", this._onTabSelected, false);
            return;
        }
        //TODO: handle case where we know keeice is disabled so just jump straight
        // to configuring the timer to re-call this function every x seconds
        
        this.log("starting initial KeeFox startup routines");
        var KeeFoxInitSuccess;
        KeeFoxInitSuccess = this._initKeeFox(currentKFToolbar,currentWindow);



        if (KeeFoxInitSuccess) {
            this.log("KeeFox initialised OK");
            this.log("Running a quick check to see if we can contact KeeICE through the KeeICE IPC channel");

            var KeeICEComOpen = false;

            if (this._KeeFoxXPCOMobj != null) {
                // check version of KeeICE
                this.log("Verifying KeeICE version is valid for this KeeFox extension version");
                var versionCheckResult = {};

                // false only if ICE connection fault or KeeICE internal error
                if (this._KeeFoxXPCOMobj.checkVersion(this._KeeFoxVersion, this._KeeICEminVersion, versionCheckResult)) {
                    this._keeFoxStorage.set("KeeVersionCheckResult", versionCheckResult.value);
                    if (versionCheckResult.value == 1) {
                        this.log("This version of KeeFox is too old to work with the installed version of KeeICE.");
                        alert("You need to upgrade KeeFox (or downgrade KeeICE)");
                        //TODO: trigger an auto-update of the KeeFox extension?
                        //return;
                    } else if (versionCheckResult.value == -1) {
                        this.log("The installed version of KeeICE is too old to work with this version of KeeFox.");
                        alert("You need to upgrade to the new version of KeeICE. Please follow the instructions on the next page...");
                        this._launchInstaller(currentKFToolbar,currentWindow);
                        //return;
                    } else {
                        this.log("KeeICE and KeeFox version match OK.");
                        KeeICEComOpen = true;
                    }
                } else {
                    this.log("Couldn't test version becuase KeeICE not available");
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

            if (KeeICEComOpen && this._keeFoxStorage.get("KeeVersionCheckResult", -1) == 0) // version check succeeded
            //if (2==1)
            {
                this.log("Successfully established connection with KeeICE");
                // remember this across all windows
                this._keeFoxStorage.set("KeeICEActive", true);
                this._keeFoxStorage.set("KeeICEInstalled", true);

            } else { 
                this.log("Couldn't communicate with KeeICE");
                // if it fails KeeICE is either not running or not installed - let's find out which...
                // (we've already set up the information we need to construct the installation wizzard if required)

                if (keeICELocation == "not installed")
                {
                    this.log("KeeICE location was not found");
                    this._launchInstaller(currentKFToolbar,currentWindow);
                } else
                {
                    
                    if (!KeePassEXEfound)
                    {
                        this.log("KeePass EXE not present in expected location");
                        this._launchInstaller(currentKFToolbar,currentWindow);
                    } else
                    {
                        if (!KeeICEDLLfound) {
                            this.log("KeeICE plugin DLL not present in KeePass plugins directory so needs to be installed");
                            this._launchInstaller(currentKFToolbar,currentWindow);
                        } else {
                            this.log("KeePass is not running or plugin is disabled.");
                            this._keeFoxStorage.set("KeeICEInstalled", true);
                        }
                    }
                }
                this.log("KeeICE is inactive. We'll remember that so we don't have to do this again when another window is opened.");
                this._keeFoxStorage.set("KeeICEActive", false);
            }

            // set toolbar
            if (this._keeFoxStorage.get("KeeICEActive", false))
            {
                var dbName = this.getDatabaseName();
                
                if (dbName == "")
                {
                    this.log("Everything has started correctly but no database has been opened yet.");
                    this._keeFoxStorage.set("KeePassDatabaseOpen", false);
                } else
                {
                    this.log("Everything has started correctly and the '" + dbName + "' database has been opened.");
                    this._keeFoxStorage.set("KeePassDatabaseOpen", true);
                }
                    
                
                currentKFToolbar.setupButton_ready(currentWindow);
                currentKFToolbar.setAllLogins();
                this._configureKeeICECallbacks(); // seems to work but should it be delayed via an event listener?
                currentWindow.addEventListener("TabSelect", this._onTabSelected, false);

            } else if (this._keeFoxStorage.get("KeeICEInstalled", false))
            {
                // update toolbar etc to say "launch KeePass" (flash this every time a page loads with forms on and KeePass still not running?)
                //currentKFToolbar.setupButton_loadKeePass(currentWindow);
                currentKFToolbar.setupButton_ready(currentWindow);
                currentKFToolbar.setAllLogins();
                this._configureKeeICECallbacks(); // seems to work but should it be delayed via an event listener?
                
                //TODO: only look for new ICE server, not run the entire startup sequence...
                // register next ICE ping / listener
                
                // fire off a new thread every x seconds (until the thread cancels the timer)
                //this.ICEconnectorEvent = { notify: function(timer) { 
                /*
                var mainWin = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIWebNavigation)
.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
.rootTreeItem
.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIDOMWindow);*/

//var mainWindow = keeFoxInst._currentWindow;
                
             /*       var target = 
                      Components.classes["@mozilla.org/thread-manager;1"].
                      getService().newThread(0);
                   
                    target.dispatch(new KeeFoxICEconnector(), target.DISPATCH_NORMAL);
                    
                 } }
                
                this.ICEconnectorTimer.initWithCallback(this.ICEconnectorEvent, 5000, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
                */
                
                var observerService = Cc["@mozilla.org/observer-service;1"].
                              getService(Ci.nsIObserverService);
                this._observer._kf = this;

                this.ICEconnectorTimer.init(this._observer, 5000, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
              
            } else
            {
                // register next ICE ping / listener (we only do it every 30 seconds to minimise impact if user never bothers to install KeeICE plugin)
                // TODO: should we even do this at all? Maybe successfull install process could load a chrome page which triggers the startup routines.
                //var event = { notify: function(timer) { keeFoxInst._keeFoxBrowserStartup(currentKFToolbar,currentWindow); } }
                //var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
                //timer.initWithCallback(event, 30000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
            }
        } // end if "keefox has loaded its binary components correctly"
    },
    
    // works out where KeePass is installed and records it in a Firefox preference
    _discoverKeePassInstallLocation: function() {
        keePassLocation = "not installed";
 
        if (this._keeFoxExtension.prefs.has("keePassInstalledLocation"))
        {
            keePassLocation = this._keeFoxExtension.prefs.getValue("keePassInstalledLocation","not installed");
            if (keePassLocation != "")
                this.log("KeePass install location found in preferences: " + keePassLocation);
            else
                keePassLocation = "not installed";
        }

        if (keePassLocation == "not installed")
        {
            this.log("Reading KeePass installation location from Windows registry");

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
                    this.log("KeePass install location found: " + keePassLocation);
                }
                subkey.close();
            } else if (wrk.hasChild("{2CBCF4EC-7D5F-4141-A3A6-001090E029AC}"))
            {
                var subkey = wrk.openChild("{2CBCF4EC-7D5F-4141-A3A6-001090E029AC}", wrk.ACCESS_READ);
                if (subkey.hasValue("InstallLocation"))
                {
                    keePassLocation = subkey.readStringValue("InstallLocation");
                    this._keeFoxExtension.prefs.setValue("keePassInstalledLocation",keePassLocation);
                    this.log("KeePass install location found: " + keePassLocation);
                } // TODO: install location not found here - try "HKEY_CLASSES_ROOT\KeePass Database\shell\open\command" and some guesses?
                subkey.close();
            }

            wrk.close();
        }
        
        return keePassLocation;
    },
    
    // works out where KeeICE is installed and records it in a Firefox preference
    _discoverKeeICEInstallLocation: function() {
        keeICELocation = "not installed";
        keePassLocation = "not installed";
        //return keeICELocation; //HACK: debug
        
        if (this._keeFoxExtension.prefs.has("keeICEInstalledLocation"))
        {
            keeICELocation = this._keeFoxExtension.prefs.getValue("keeICEInstalledLocation","not installed");
            if (keeICELocation != "")
                this.log("KeeICE install location found in preferences: " + keeICELocation);
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
            this.log("KeeICE install location inferred: " + keeICELocation);
        }
        
        return keeICELocation;
    },
    
    _confirmKeePassInstallLocation: function(keePassLocation) {
        var KeePassEXEfound;
        KeePassEXEfound = false;

        this.log("Looking for the KeePass EXE in " + keePassLocation);

        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        try {
            file.initWithPath(keePassLocation);
            if (file.isDirectory())
            {
                file.append("KeePass.exe");
                if (file.isFile())
                {
                    KeePassEXEfound = true;
                    this.log("KeePass EXE found in correct location.");
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

        this.log("Looking for the KeeICE plugin DLL in " + keeICELocation);

        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        try {
            file.initWithPath(keeICELocation);
            if (file.isDirectory())
            {
                file.append("KeeICE.dll");
                if (file.isFile())
                {
                    KeeICEDLLfound = true;
                    this.log("KeeICE DLL found in correct location.");
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
    var event = { notify: function(timer) { 
        
            var target = 
              Components.classes["@mozilla.org/thread-manager;1"].
              getService().newThread(0);
           
            target.dispatch(new KeeFoxICEconnector(), target.DISPATCH_NORMAL);
            
         } }
        
        this.ICEconnectorTimer.initWithCallback(event, 10000, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
    },

    // temporarilly disable KeeFox. Used (for e.g.) when KeePass is shut down.
    // starts a regular check for KeeICE becoming available again.
    //TODO: test more thoroughly, especially multiple windows aspect
    _pauseKeeFox: function() {
        this.log("Pausing KeeFox.");
        this._keeFoxStorage.set("KeeICEActive", false);
        
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
            
            // register next ICE ping / listener
            //var event = { notify: function(timer) { keeFoxInst._keeFoxBrowserStartup(win.keeFoxToolbar,win); } }
            //var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
            //timer.initWithCallback(event, 20000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
            
        }
        // clean up the old ICE client connection
        this._KeeFoxXPCOMobj.shutdownICE();
        
        // fire off a new thread every x seconds (until successful thread callback cancels the timer)
        this.startICEcallbackConnector();
        this.log("KeeFox paused.");
    },
    
    //TODO: test more, especially multiple windows and multiple databases at the same time
    _refreshKPDB: function () {
        this.log("Refreshing KeeFox's view of the KeePass database.");

        var dbName = this.getDatabaseName();
                
        if (dbName == "")
        {
            this.log("No database is currently open.");
            this._keeFoxStorage.set("KeePassDatabaseOpen", false);
        } else
        {
            this.log("The '" + dbName + "' database is open.");
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
                //win.keeFoxToolbar.setAllLogins(); // calling this from the JS callback causes a crash. why? not enough ICE threads? GC unable to understand? we need to update this view after each callback so what other possiblities are there? run it in a different thread? but then can't access UI... although could always call back to main thread AGAIN. run it as an event that is fired some time after the callback has left the JS scope? or just increase number of ICE threads available? or is it only happening on the 2nd JS callback in quick succession? if so could we skip one or delay an event or something? why does it sometimes think DB is closed? is the callback from a callback catching KeePass in an odd state?
                win.keeFoxILM._fillDocument(win.content.document);
            }
        }
        
        if (this._keeFoxStorage.get("KeePassDatabaseOpen",false) && this._keeFoxExtension.prefs.getValue("rememberMRUDB",false))
        {
            var MRUFN = this.getDatabaseFileName();
            if (MRUFN != null && MRUFN != undefined)
                this._keeFoxExtension.prefs.setValue("keePassMRUDB",MRUFN);
        }

        this.log("KeeFox feels very refreshed now.");
    },
    
    getDatabaseName: function() {
        try {
            return this._KeeFoxXPCOMobj.getDBName();
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                throw e;
            }
        }
    },
    
    launchKeePass: function (params) {
        if (!this._keeFoxExtension.prefs.has("keePassInstalledLocation"))
        {
            return; // TODO: work it out, prompt user or just bomb out with notification why
        }
        var fileName = this._keeFoxExtension.prefs.getValue("keePassInstalledLocation","C:\\Program files\\KeePass\\") + "KeePass.exe";
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
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
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this._pauseKeeFox();
                break;
             default:
                throw e;
            }
        }
    },
    
    // run in a secondary thread - don't access the UI!
    runAnInstaller: function (fileName, params) {
        this._KeeFoxXPCOMobj.RunAnInstaller('"' + fileName + '"', '"' + params + '"');
    },
    
    
    // if the MRU database is known, open that but otherwise send empty string which will cause user
    // to be prompted to choose a DB to open
    loginToKeePass: function () {
        
        //if (this._keeFoxExtension.prefs.has("keePassMRUDB"))
      //  {
            this.changeDatabase(this._keeFoxExtension.prefs.getValue("keePassMRUDB",""), true);
       /* } else
        {
            this._KeeFoxXPCOMobj.ChangeDB("", true);
        }*/
    
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
        this.log("trying to find an already open tab with this url:" + url);
        found = false;

        Application.windows.forEach(function(b) {
            // look at each open browser window (not tab)
            //this.log("Looking at a browser window");
            Application.activeWindow.tabs.forEach(function(t) {
                // look at each open tab in browser window b
                //this.log("Looking at a tab in the browser window:" + t.uri.spec);
                if (url == t.uri.spec) {
                    //this.log("suitable tab already open - focussing it now");
                    // The URL is already opened. Select this tab.
                    t.focus();

                    // TODO: Focus *this* browser-window?

                    found = true;
                    this._installerTabLoaded = true;
                    return t;
                }
            });
        });

        if (!found) {
            this.log("tab with this URL not already open so opening one and focussing it now");

            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                        .getService(Components.interfaces.nsIWindowMediator);
            var newWindow = wm.getMostRecentWindow("navigator:browser");
            var b = newWindow.getBrowser();
            var newTab = b.loadOneTab( url, null, null, null, false, null );

            this._installerTabLoaded = true;
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
        this.log("establishing the directory that KeeFox is installed in");

        var MY_ID = "chris.tomlinson@keefox";
        var em = Components.classes["@mozilla.org/extensions/manager;1"].
             getService(Components.interfaces.nsIExtensionManager);
        // the path may use forward slash ("/") as the delimiter
        var dir = em.getInstallLocation(MY_ID).getItemLocation(MY_ID);

        this.log("installed in this directory: " + dir.path);
        return dir.path;
    },

    KeeFox_MainButtonClick_install: function(event, temp) {
        this.log("install button clicked. Loading (and focusing) install page.");
        installTab = this._openAndReuseOneTabPerURL("chrome://keefox/content/install.xul");
    },

    _launchInstaller: function(currentKFToolbar,currentWindow) {
        if (this._installerTabLoaded)
            return; // only want to do this once per session to avoid irritation!
            
        this.log("KeeFox not installed correctly. Going to try to launch the install page.");
        
        //NB: FF < 3.0.5 may fail to open the tab due to bug where "session loaded" event fires too soon.
        // load page in new tab called KeeFox installer with install button (linked to same action as toolbar button) (and screenshot of button? - maybe not needed - just have a massive "install" graphic?)
        installTab = this._openAndReuseOneTabPerURL("chrome://keefox/content/install.xul");
        //installTab = this._openAndReuseOneTabPerURL("chrome://keefox/content/installKeeICE.html");


        // remember the installation state (until it might have changed...)
        this._keeFoxStorage.set("KeeICEInstalled", false);

        this.log("Setting up a button for user to launch installer (also make a massive one on page in future)");
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
        
        this.strbundle = currentWindow.document.getElementById("KeeFox-strings");

        this.log("Testing to see if we've already established whether KeeICE is running.");

        if (!this._keeFoxStorage.has("KeeICEActive")) {
            this.log("Nope, it's not running");
            
            
            var observerService = Cc["@mozilla.org/observer-service;1"].
                              getService(Ci.nsIObserverService);
            this._observer._kf = this;
            this._observer._currentKFToolbar = currentKFToolbar;
            
            this.log("debug:" + currentKFToolbar._currentWindow);
                
            observerService.addObserver(this._observer, "sessionstore-windows-restored", false);
        
        
        /*
            if (currentWindow.document)
            {
                this.log("running the KeeFox object startup routine");
                this._keeFoxBrowserStartup(currentKFToolbar, currentWindow);
            } else
            {
                this.log("registering an event listener so we can run the KeeFox startup routine when Firefox is ready for us");
                this._keeFoxBrowserStartupListener._kf = this;
                this._keeFoxBrowserStartupListener._currentKFToolbar = currentKFToolbar;
                currentWindow.addEventListener("load", this._keeFoxBrowserStartupListener, false); // this doesn't wait until the home page or session is loaded
            }
            
            */
            
        } else if (!this._keeFoxStorage.get("KeeICEInstalled", false)) {
            this.log("Updating the toolbar becuase KeeICE install is needed.");

            if (currentWindow.document)
            {
                this.log("setting up the toolbar");
                currentKFToolbar.setupButton_install(currentWindow);
            } else
            {
                this.log("registering an event listener so we can configure the toolbar when Firefox is ready for us");
                //currentKFToolbar.setupButton_installListener._KFToolBar = currentKFToolbar;
                currentWindow.addEventListener("load", currentKFToolbar.setupButton_installListener, false);
            }
            
        } else if (this._keeFoxStorage.get("KeeICEInstalled", false) && !this._keeFoxStorage.get("KeeICEActive", false)) {
            this.log("Updating the toolbar becuase user needs to load KeePass.");

            if (currentWindow.document)
            {
                this.log("setting up the toolbar");
                //currentKFToolbar.setupButton_loadKeePass(currentWindow);
                currentKFToolbar.setupButton_ready(currentWindow);
            } else
            {
                this.log("registering an event listener so we can configure the toolbar when Firefox is ready for us");
                //currentKFToolbar.setupButton_loadKeePassListener._KFToolBar = currentKFToolbar;
                currentWindow.addEventListener("load", currentKFToolbar.setupButton_loadKeePassListener, false);
            }
            
         } else if (this._keeFoxStorage.get("KeeICEActive", true)) {
            this.log("Updating the toolbar becuase everything has started correctly.");
            
            if (currentWindow.document)
            {
                this.log("setting up the toolbar");
                currentKFToolbar.setupButton_ready(currentWindow);
            } else
            {
                this.log("registering an event listener so we can configure the toolbar when Firefox is ready for us");
                //currentKFToolbar.setupButton_readyListener._KFToolBar = currentKFToolbar;
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
                    this._kf.log("sessionstore-windows-restored message recieved");
                    this._kf._keeFoxBrowserStartup(this._currentKFToolbar, this._currentKFToolbar._currentWindow);
                    this._kf.log("sessionstore-windows-restored message processed");
                    break;
                case "timer-callback":    
                    var target = 
                      Components.classes["@mozilla.org/thread-manager;1"].
                      getService().newThread(0);
                   
                    target.dispatch(new KeeFoxICEconnector(), target.DISPATCH_NORMAL);
                    //target.dispatch(this.ICEconnectorEvent, target.DISPATCH_NORMAL);
                    break;

            }

        },
        
        notify : function (subject, topic, data) {
            

        }
    },

    _configureKeeICECallbacks: function() {
        this.log("Setting up a way to receive notification of KeeICE status changes.");
        //netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        
        try {
            this._KeeFoxXPCOMobj.addObserver(this.CallBackToKeeFoxJS);
        } catch (e)
        {
             switch (e.result) {
             case 0x80040111:
                this.log("Connection to KeeICE has been lost. We will now try to reconnect at regular intervals.");
                this.startICEcallbackConnector();
                break;
             default:
                throw e;
            }

  
        }
    },

    // we could define multiple callback functions but that looks like it needs 
    // really messy xpcom code so we'll stick with the one and just switch...
    //TODO?: will we need optional extra data parameter?
    //TODO: handle difference between KeeICE going away and just the open
    // DB going away. (not necessarilly just in this function)
    // this is only called once no matter how many windows are open. so functions within need to handle all open windows
    // for now, that just means every window although in future maybe there could be a need to store a list of relevant
    // windows and call those instead
    CallBackToKeeFoxJS: function(sig) {

        var logService = Cc["@mozilla.org/consoleservice;1"].
                                getService(Ci.nsIConsoleService);

        logService.logStringMessage("Signal received by CallBackToKeeFoxJS (" + sig + ")");
        switch (sig) {
            case 0: logService.logStringMessage("Javascript callbacks from KeeFox XPCOM DLL are now disabled."); keeFoxInst._pauseKeeFox(); break;
            case 1: logService.logStringMessage("Javascript callbacks from KeeFox XPCOM DLL are now enabled."); break;
            case 2: logService.logStringMessage("KeeICE callbacks from KeePass to KeeFox XPCOM are now enabled."); break;
            case 3: logService.logStringMessage("KeePass' currently active DB is about to be opened."); break;
            case 4: logService.logStringMessage("KeePass' currently active DB has just been opened."); keeFoxInst._refreshKPDB(); break;
            case 5: logService.logStringMessage("KeePass' currently active DB is about to be closed."); break;
            case 6: logService.logStringMessage("KeePass' currently active DB has just been closed."); keeFoxInst._refreshKPDB(); break;
            case 7: logService.logStringMessage("KeePass' currently active DB is about to be saved."); break;
            case 8: logService.logStringMessage("KeePass' currently active DB has just been saved."); keeFoxInst._refreshKPDB(); break;
            case 9: logService.logStringMessage("KeePass' currently active DB is about to be deleted."); break;
            case 10: logService.logStringMessage("KeePass' currently active DB has just been deleted."); break;
            case 11: logService.logStringMessage("KeePass' active DB has been changed/selected."); keeFoxInst._refreshKPDB(); break;
            case 12: logService.logStringMessage("KeePass is shutting down."); keeFoxInst._pauseKeeFox(); break;
            default: logService.logStringMessage("ERROR: Invalid signal received by CallBackToKeeFoxJS (" + sig + ")"); break;
        }

    },

//TODO: this seems the wrong place for this function - needs to be in a window-specific section such as KFUI or KFILM
    _onTabSelected: function(event) {
        event.target.ownerDocument.defaultView.keeFoxToolbar.setLogins(null);
        event.target.ownerDocument.defaultView.keeFoxILM._fillDocument(event.target.contentWindow.document);
    },
    
    
    // TODO: put this somewhere sensible, maybe a utils file, depending on what else we come up over the next few months...
    kfLoginInfoCustomFieldsWrapper : function () {
                     
        var customFieldsArray = null;

        if ( arguments.length > 0 ) // we're being given some custom fields to deal with...
        {
            customFieldsArray = Components.classes["@mozilla.org/array;1"]
                        .createInstance(Components.interfaces.nsIMutableArray);
            
            for (i = 0; i+1 < arguments.length; i=i+2)
            {
                var kfLoginField = new Components.Constructor(
            "@christomlinson.name/kfLoginField;1", Ci.kfILoginField);
            
                var customField = new kfLoginField;
                customField.init( arguments[i], arguments[i+1]);
                customFieldsArray.appendElement(customField,false);
            }
        }
        
        return customFieldsArray;
    }

};

var keeFoxInst = new KeeFox;





function KeeFoxICEconnector() {
}
KeeFoxICEconnector.prototype = {
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsIRunnable) ||
        iid.equals(Components.interfaces.nsISupports))
      return this;
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },
  run: function() {

    if (keeFoxInst._keeFoxStorage.get("KeeICEInstalled", false) && !keeFoxInst._keeFoxStorage.get("KeeICEActive", false))
    {
        var versionCheckResult = {};
        KeeICEComOpen = false;
        
        // false only if ICE connection fault or KeeICE internal error
        if (keeFoxInst._KeeFoxXPCOMobj.checkVersion(keeFoxInst._KeeFoxVersion, keeFoxInst._KeeICEminVersion, versionCheckResult) && versionCheckResult.value == 0) {
            
            var main = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;
            main.dispatch(new KFmoduleMainThreadHandler("ICEversionCheck", "finished", versionCheckResult.value, null , null), main.DISPATCH_NORMAL);

            
        }
    }
  }
};



var KFmoduleMainThreadHandler = function(source, reason, result, mainWindow, browserWindow) {
  this.source = source;
  this.reason = reason;
  this.result = result;
  this.mainWindow = mainWindow;
  this.browserWindow = browserWindow;
};

KFmoduleMainThreadHandler.prototype = {
    run: function() {
        try {
            keeFoxInst.log(this.source + ' thread signalled "' + this.reason + '" with result: ' + this.result);
            switch (this.source) {
                case "ICEversionCheck":
                    if (this.reason == "finished") {
                        keeFoxInst._keeFoxStorage.set("KeeVersionCheckResult", this.result);
                        //TODO: set up variables, etc. as per if it were an initial startup
                        keeFoxInst.ICEconnectorTimer.cancel();

                        keeFoxInst.log("Successfully established connection with KeeICE");
                        // remember this across all windows
                        keeFoxInst._keeFoxStorage.set("KeeICEActive", true);
                        keeFoxInst._keeFoxStorage.set("KeeICEInstalled", true);

                        //keeFoxInst._refreshKPDB();
                        keeFoxInst._configureKeeICECallbacks();
                        keeFoxInst._refreshKPDB();
                    }
                    break;

            }

        } catch (err) {
            Components.utils.reportError(err);
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


var launchGroupEditorThread = function(uuid) {
  this.uniqueID = uuid;
};

launchGroupEditorThread.prototype = {
  run: function() {
    try {
      keeFoxInst._KeeFoxXPCOMobj.launchGroupEditor(this.uniqueID);
      
    // var main = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;
    //        main.dispatch(new KFmoduleMainThreadHandler("ICEversionCheck", "finished", versionCheckResult.value, null , null), main.DISPATCH_NORMAL);
            
    } catch(err) {
      Components.utils.reportError(err);
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
      
    // var main = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;
    //        main.dispatch(new KFmoduleMainThreadHandler("ICEversionCheck", "finished", versionCheckResult.value, null , null), main.DISPATCH_NORMAL);
            
    } catch(err) {
      Components.utils.reportError(err);
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


/*
flashing icon should be optional


*/