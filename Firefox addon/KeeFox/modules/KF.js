/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008 Chris Tomlinson <keefox@christomlinson.name>
  
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
    this._KeeICEminVersion = 0.4;
    this._KeeFoxVersion = 0.4;
    this.temp = 1;
}

KeeFox.prototype = {

temp : null,
_test : null,
editTest : function (numb)
{
this._test = numb;
},

    _KeeFoxXPCOMobj: null,

    _kfilm: null, // The KeeFox Improved Login Manager (probably not used any more)
    _toolbar: null,
    _kfui: null,
    _KeeFoxTestErrorOccurred: false,
    
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
                this.log("Couldn't find KeeFox XPCOM - probably ICE DLLs not in path (not installed)");
                this._launchInstaller(currentKFToolbar,currentWindow);
                return false;
            } else {
                this.log("Trying to createInstance of KeeFox XPCOM extension component");
                var KeeFoxXPCOMobjService = Components.classes[cid].getService();
                if (KeeFoxXPCOMobjService == null) {
                    this.log("Couldn't create instance of KeeFox XPCOM - probably ICE DLLs not in path (not installed)");
                    this._launchInstaller(currentKFToolbar,currentWindow);
                    return false;
                } else {
                    this.log("KeeFox seems to be installed and ICE DLLs are present in system path so omens look good...");
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

    _checkForConflictingExtensions: function() {
        //if (Application.extensions.has("roboform"))?
        //TODO: warning? - disable one?
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
            return;
        }
        //TODO: handle case where we know keeice is disabled so just jump straight
        // to configuring the timer to re-call this function every x seconds
        
        this.log("starting initial KeeFox startup routines");
        var KeeFoxInitSuccess;
        KeeFoxInitSuccess = this._initKeeFox(currentKFToolbar,currentWindow);

//TODO: not ideal place to call these since they should happen only once per firefox session, not every time keefox wakes up
        this._checkForConflictingExtensions();
        this._registerUninstallListeners();
        this._registerPlacesListeners();

        this.log("testing KeeFox initialisation success");

        if (KeeFoxInitSuccess) {
            this.log("KeeFox initialised OK");
            this.log("Running a quick check to see if we can contact KeeICE through the KeeICE IPC channel");

            var KeeICEComOpen = false;

            if (this._KeeFoxXPCOMobj != null) {
                // check version of KeeICE
                this.log("Verifying KeeICE version is valid for this KeeFox extension version");
                var versionCheckResult = {};

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


            if (KeeICEComOpen && this._keeFoxStorage.get("KeeVersionCheckResult", -1) == 0) // version check succeeded
            {
                this.log("Successfully established connection with KeeICE");
                // remember this across all windows
                this._keeFoxStorage.set("KeeICEActive", true);
                this._keeFoxStorage.set("KeeICEInstalled", true);


                //} else if (this._keeFoxStorage.get("KeeVersionCheckResult", -2) == 0) {
            } else { //TODO: temporary hack
                this.log("Couldn't communicate with KeeICE");
                // if it fails KeeICE is either not running or some other ICE application is
                // installed on this machine in the system path - let's try to find out which...

                // read KeePass entry from registry
                var keePassLocation;
                keePassLocation = "not installed";
                this.log("Reading KeePass installation location from Windows registry");

                var wrk = Components.classes["@mozilla.org/windows-registry-key;1"]
                                .createInstance(Components.interfaces.nsIWindowsRegKey);
                wrk.open(wrk.ROOT_KEY_LOCAL_MACHINE,
                       "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
                       wrk.ACCESS_READ);
                if (wrk.hasChild("KeePassPasswordSafe2_is1")) {
                    var subkey = wrk.openChild("KeePassPasswordSafe2_is1", wrk.ACCESS_READ);
                    if (subkey.hasValue("InstallLocation")) {
                        keePassLocation = subkey.readStringValue("InstallLocation");
                        this.log("KeePass install location found: " + keePassLocation);
                    }
                    subkey.close();
                } else if (wrk.hasChild("{2CBCF4EC-7D5F-4141-A3A6-001090E029AC}")) {
                    var subkey = wrk.openChild("{2CBCF4EC-7D5F-4141-A3A6-001090E029AC}", wrk.ACCESS_READ);
                    if (subkey.hasValue("InstallLocation")) {
                        keePassLocation = subkey.readStringValue("InstallLocation");
                        this.log("KeePass install location found: " + keePassLocation);
                    } // TODO: install location not found here - try "HKEY_CLASSES_ROOT\KeePass Database\shell\open\command"
                    subkey.close();
                }

                wrk.close();

                if (keePassLocation == "not installed") {
                    this.log("KeePass location not found in registry");
                    //TODO: alternative location finding mechanisms for technical windows users and other OSes

                    this._launchInstaller(currentKFToolbar,currentWindow);

                    //TODO: should we register to know when the reg value has changed under any circumstances?...

                } else {
                    // if success, check that the KeeFox dll is in place - if fail: launchInstaller();
                    var KeeFoxDLLfound;
                    KeeFoxDLLfound = false;

                    this.log("Looking for the KeeICE plugin DLL");

                    var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                    file.initWithPath(keePassLocation);
                    file.append("plugins");
                    if (file.isDirectory()) {
                        file.append("KeeICE.dll");
                        if (file.isFile())
                            KeeFoxDLLfound = true;
                    }

                    if (!KeeFoxDLLfound) {
                        this.log("KeeICE plugin DLL not present in KeePass plugins directory");
                        this._launchInstaller(currentKFToolbar,currentWindow);
                    } else {
                        this.log("KeeICE plugin found in correct location. KeePass is not running or plugin is disabled.");
                        this._keeFoxStorage.set("KeeICEInstalled", true);
                    }
                }
                this.log("KeeICE is inactive. We'll remember that so we don't have to do this again when another window is opened.");
                this._keeFoxStorage.set("KeeICEActive", false);
            }

            // set toolbar
            if (this._keeFoxStorage.get("KeeICEActive", false)) {
                this.log("Updating the toolbar becuase everything has started correctly.");
                currentKFToolbar.setupButton_ready(currentWindow);
                this._configureKeeICECallbacks(); // seems to work but should it be delayed via an event listener?
            } else if (this._keeFoxStorage.get("KeeICEInstalled", false)) {
                // update toolbar etc to say "launch KeePass" (flash this every time a page loads with forms on and KeePass still not running?)
                currentKFToolbar.setupButton_loadKeePass(currentWindow);
                this._configureKeeICECallbacks(); // seems to work but should it be delayed via an event listener?
            }

            if (!this._keeFoxStorage.get("KeeICEActive", true)) {
                //TODO: be more clever - only do required tests based on why startup failed, maybe only on demand
                // rather than timer and look out for crashed KeeICE

                // register next ICE ping / listener
                var event = { notify: function(timer) { keeFoxInst._keeFoxBrowserStartup(currentKFToolbar,currentWindow); } }
                var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
                timer.initWithCallback(event, 20000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
            }
        }
    },

    // temporarilly disable KeeFox. Used (for e.g.) when KeePass is shut down.
    // starts a regular check for KeeICE becoming available again.
    //TODO: this hasn't been tested, especially multiple windows aspect
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
            win.keeFoxToolbar.setupButton_loadKeePass(win);
            
            // register next ICE ping / listener
            var event = { notify: function(timer) { keeFoxInst._keeFoxBrowserStartup(win.keeFoxToolbar,win); } }
            var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
            timer.initWithCallback(event, 20000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
        }

        this.log("KeeFox paused.");
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

            return newTab;
        }
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
        this.log("install button clicked");

        // create an nsILocalFile for the executable
        var file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);
        var fileDir = this._myInstalledDir();
        this.log("about to launch::" + fileDir + "\\KeeICEInstaller\\Setup.exe");
        file.initWithPath(fileDir + "\\KeeICEInstaller\\Setup.exe");

        if (!file.exists() || !file.isExecutable()) {
            this.log("Setup file not found. Is the KeeFox XPI package correctly installed? Do you have permission to execute the file?");
            return;
        }

        // create an nsIProcess
        //var process = Components.classes["@mozilla.org/process/util;1"]
        //                    .createInstance(Components.interfaces.nsIProcess);
        //process.init(file);

        // Run the process.
        // If first param is true, calling thread will be blocked until
        // called process terminates.
        // Second and third params are used to pass command-line arguments
        // to the process.
        //var args = ["argument1", "argument2"];
        //process.run(false, args, args.length);



//  var f = getLocalFileFromNativePathOrUrl(aDownload.getAttribute("file"));
  //if (f.isExecutable()) {
    //var dontAsk = false;
 //   var pref = Cc["@mozilla.org/preferences-service;1"].
  //             getService(Ci.nsIPrefBranch);
 //   try {
  //    dontAsk = !pref.getBoolPref(PREF_BDM_ALERTONEXEOPEN);
  //  } catch (e) { }
/*
    if (!dontAsk) {
      var strings = document.getElementById("downloadStrings");
      var name = aDownload.getAttribute("target");
      var message = strings.getFormattedString("fileExecutableSecurityWarning", [name, name]);

      let title = gStr.fileExecutableSecurityWarningTitle;
      let dontAsk = gStr.fileExecutableSecurityWarningDontAsk;

      var promptSvc = Cc["@mozilla.org/embedcomp/prompt-service;1"].
                      getService(Ci.nsIPromptService);
      var checkbox = { value: false };
      var open = promptSvc.confirmCheck(window, title, message, dontAsk, checkbox);

      if (!open)
        return;
      pref.setBoolPref(PREF_BDM_ALERTONEXEOPEN, !checkbox.value);
    }
  }*/
  try {
    file.launch();
  } catch (ex) {
    // if launch fails, try sending it through the system's external
    // file: URL handler
    var uri = Cc["@mozilla.org/network/io-service;1"].
             getService(Ci.nsIIOService).newFileURI(file);
 
   var protocolSvc = Cc["@mozilla.org/uriloader/external-protocol-service;1"].
                     getService(Ci.nsIExternalProtocolService);
   protocolSvc.loadUrl(uri);

    
    //openExternal(file);
  }







        this.log("Installer launched.");

    },

    _launchInstaller: function(currentKFToolbar,currentWindow) {
        this.log("KeeFox not installed correctly. Going to try to launch the install page (maybe do this automatically or timed or something in future?)");

        //TODO: remember when we've done this so we don't do it every 20 seconds!
        //TODO: handle situation where (generally at startup) any kind of session manager or other extension over-writes the single about:blank page
        // becuase we end up loading a URL and then having it over-written by the restored session. 
        // need to wait until session is restored before loading the installation page but no FF documentation on that

        // load page in new tab called KeeFox installer with install button (linked to same action as toolbar button) (and screenshot of button? - maybe not needed - just have a massive "install" graphic?)
        installTab = this._openAndReuseOneTabPerURL("chrome://keefox/content/installKeeICE.html");

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
        this.log("Testing to see if we've already established whether KeeICE is running.");

        if (!this._keeFoxStorage.has("KeeICEActive")) {
            this.log("Nope, it's not running");
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
                currentKFToolbar.setupButton_loadKeePass(currentWindow);
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

        }
    },

    _configureKeeICECallbacks: function() {
        this.log("Setting up a way to receive notification of KeeICE status changes.");
        //netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        this._KeeFoxXPCOMobj.addObserver(this.CallBackToKeeFoxJS);
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
            case 4: logService.logStringMessage("KeePass' currently active DB has just been opened."); break;
            case 5: logService.logStringMessage("KeePass' currently active DB is about to be closed."); break;
            case 6: logService.logStringMessage("KeePass' currently active DB has just been closed."); /*keeFoxInst._pauseKeeFox();*/ break;
            case 7: logService.logStringMessage("KeePass' currently active DB is about to be saved."); break;
            case 8: logService.logStringMessage("KeePass' currently active DB has just been saved."); break;
            case 9: logService.logStringMessage("KeePass' currently active DB is about to be deleted."); break;
            case 10: logService.logStringMessage("KeePass' currently active DB has just been deleted."); break;
            default: logService.logStringMessage("ERROR: Invalid signal received by CallBackToKeeFoxJS (" + sig + ")"); break;
        }

    },

//TODO: this seems the wrong place for this function - needs to be in a window-specific section such as KFUI or KFILM
    _onTabSelected: function(event) {
        this.log("tab selected");
        var browser = gBrowser.selectedTab.linkedBrowser;
        // browser is the XUL element of the browser that's just been selected
        keeFoxToolbar.setLogins(null);
        keeFoxILM._fillDocument(browser.contentDocument);
    }

};


/* could be useful...

function TutTB_AddDynamicButtons()
{
    // Get the toolbaritem "container" that we added to our XUL markup
    var container = document.getElementById("TutTB-DynButtonContainer");

    // Remove all of the existing buttons
    for(i=container.childNodes.length; i > 0; i--) {
        container.removeChild(container.childNodes[0]);
    }

    // Add 5 dynamic buttons
    for(var i=0; i<5; i++) {
        var tempButton = null;
        tempButton = document.createElement("toolbarbutton");
        tempButton.setAttribute("label", "Button " + i);
        tempButton.setAttribute("tooltiptext", "Button " + i);
        tempButton.setAttribute("oncommand", "TutTB_SomeFunction()");
        container.appendChild(tempButton);
    }
}

*/


var keeFoxInst = new KeeFox;
