
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
            main.dispatch(new KFmainThreadHandler("ICEversionCheck", "finished", versionCheckResult.value, null , null), main.DISPATCH_NORMAL);

            
        }
    }
  }
};

function KFexecutableInstallerRunner(path, params, reason, mainWindow, browserWindow) {
    this.path = path;
    this.params = params;
    this.reason = reason;
    this.mainWindow = mainWindow;
    this.browserWindow = browserWindow;
}
KFexecutableInstallerRunner.prototype = {
    QueryInterface: function(iid) {
        if (iid.equals(Components.interfaces.nsIRunnable) ||
        iid.equals(Components.interfaces.nsISupports))
            return this;
        throw Components.results.NS_ERROR_NO_INTERFACE;
    },
    run: function() {
//try {
var file = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(keeFoxInst._myDepsDir());
    
  //  var f = keeFoxInst._myDepsDir();
        file.append(this.path);
  //      f.append("notepad.exe");
  
  keeFoxInst._KeeFoxXPCOMobj.RunAnInstaller(file.path, this.params);
        
// create an nsIProcess
//var process = Components.classes["@mozilla.org/process/util;1"]
//.createInstance(Components.interfaces.nsIProcess);
//process.init(f);

// Run the process.
// If first param is true, calling thread will be blocked until
// called process terminates.
// Second and third params are used to pass command-line arguments
// to the process.

//var args = ["argument1", "argument2"];
//process.run(true, args, args.length);


    //keeFoxInst.runAnInstaller(f.path, this.params);

        var main = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;
        main.dispatch(new KFmainThreadHandler("executableInstallerRunner", this.reason, '', this.mainWindow, this.browserWindow), main.DISPATCH_NORMAL);
        //var temp = new KFmainThreadHandler("executableInstallerRunner", this.reason, this.params, this.mainWindow, this.browserWindow);
        //temp.run();
        
        //this.mainWindow.KFtempComplete = true;
//} catch (err) {
 //           Components.utils.reportError(err);
 //       }
 
    }
};






var KFmainThreadHandler = function(source, reason, result, mainWindow, browserWindow) {
  this.source = source;
  this.reason = reason;
  this.result = result;
  this.mainWindow = mainWindow;
  this.browserWindow = browserWindow;
};

KFmainThreadHandler.prototype = {
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

                case "executableInstallerRunner":
                    if (this.reason == "IC1NETSetupFinished") {
                        this.browserWindow.IC1InstallState ^= this.browserWindow.IC1InstallState & this.browserWindow.KF_INSTALL_STATE_NET_EXECUTING;
                        this.browserWindow.IC1InstallState |= this.browserWindow.KF_INSTALL_STATE_NET_EXECUTED;
                        this.browserWindow.IC1setupKP(this.mainWindow);
                    } else if (this.reason == "IC1KPSetupFinished") {
                        this.browserWindow.IC1InstallState ^= this.browserWindow.IC1InstallState & this.browserWindow.KF_INSTALL_STATE_KP_EXECUTING;
                        this.browserWindow.IC1InstallState |= this.browserWindow.KF_INSTALL_STATE_KP_EXECUTED;
                        this.browserWindow.IC1setupKI(this.mainWindow);
                    } // TODO:... other ICs
                    break;

                case "installCase1Download":
                    // if we've just finished downloading NET
                    if (this.reason == "finished" && this.browserWindow.IC1InstallState & this.browserWindow.KF_INSTALL_STATE_NET_DOWNLOADING) {
                    
                        keeFoxInst.log("Finished downloading IC1setupNET");
                        this.browserWindow.IC1InstallState ^= this.browserWindow.IC1InstallState & this.browserWindow.KF_INSTALL_STATE_NET_DOWNLOADING;
                        this.browserWindow.IC1InstallState |= this.browserWindow.KF_INSTALL_STATE_NET_DOWNLOADED;
                        this.browserWindow.IC1setupNET(this.mainWindow);
                    }
                    // if we've just finished downloading KP
                    else if (this.reason == "finished" && this.browserWindow.IC1InstallState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
                        keeFoxInst.log("Finished downloading IC1setupKP");
                        this.browserWindow.IC1InstallState ^= this.browserWindow.IC1InstallState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING;
                        this.browserWindow.IC1InstallState |= this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADED;
                        this.browserWindow.IC1setupKP(this.mainWindow);
                    }
                    // if we're still downloading NET
                    else if (this.reason == "progress" && this.browserWindow.IC1InstallState & this.browserWindow.KF_INSTALL_STATE_NET_DOWNLOADING) {
                        keeFoxInst.log(this.result + "% of IC1setupNETdownloaded");
                        this.browserWindow.document.getElementById('IC1setupNETdownloadingProgressBar').value = this.result;
                    }
                    // if we're still downloading KP
                    else if (this.reason == "progress" && this.browserWindow.IC1InstallState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
                        keeFoxInst.log(this.result + "% of IC1setupKPdownloaded");
                        this.browserWindow.document.getElementById('IC1setupKPdownloadingProgressBar').value = this.result;
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



/* download listener. decides what to do and if desired, we'll update the main thread
by calling the generic keefox main thread handler (maybe this listener is just called in
the main thread anyway but might as well play it safe and make sure we definitely only
 let the main thread touch the UI
*/
function KeeFoxFileDownloaderListener(source, URL, destinationFile, mainWindow, browserWindow) {
    this.source = source;
    this.URL = URL;
    this.destinationFile = destinationFile;
    this.mainWindow = mainWindow;
    this.browserWindow = browserWindow;
    this.lastPerCom = 0;
}
KeeFoxFileDownloaderListener.prototype = {
    QueryInterface: function(aIID) {
        if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
            aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
            aIID.equals(Components.interfaces.nsISupports))
            return this;
        throw Components.results.NS_NOINTERFACE;
    },

    onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {

        var percentComplete = Math.floor((aCurTotalProgress / aMaxTotalProgress) * 100);

//TODO: only send message to main thread once per second or if it = 100%
        if (percentComplete > this.lastPerCom) {
            //var main = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;
            //main.dispatch(new KFmainThreadHandler(this.source, "progress", percentComplete, this.mainWindow, this.browserWindow), main.DISPATCH_NORMAL);
            var kfMTH = new KFmainThreadHandler(this.source, "progress", percentComplete, this.mainWindow, this.browserWindow);
            kfMTH.run();
        }

        this.lastPerCom = percentComplete;
    },
    onStateChange: function(aWebProgress, aRequest, aStatus, aMessage) {
        if (aStatus & Components.interfaces.nsIWebProgressListener.STATE_STOP) {
            //var main = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;
            //main.dispatch(new KFmainThreadHandler(this.source, "finished", "", this.mainWindow, this.browserWindow), main.DISPATCH_NORMAL);
            var kfMTH = new KFmainThreadHandler(this.source, "finished", "", this.mainWindow, this.browserWindow);
            kfMTH.run();
        }
    }
}


/*
download a file - saveURI function is asyncronous so I don't think this needs to be called away from the main thread
*/
function KFdownloadFile(source, URL, destinationFile, mainWindow, browserWindow) {

    var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
    .createInstance(Components.interfaces.nsIWebBrowserPersist);
    var file = keeFoxInst._myDepsDir();
    file.append(destinationFile);
     //Components.classes["@mozilla.org/file/local;1"]
    //.createInstance(Components.interfaces.nsILocalFile);
    //file.initWithPath(keeFoxInst._myDepsDir() + destinationFile); // download destination
    
    
    var obj_URI = Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService)
    .newURI(URL, null, null);
    persist.progressListener = new KeeFoxFileDownloaderListener(source, URL, destinationFile, mainWindow, browserWindow);
    persist.persistFlags = persist.persistFlags | persist.PERSIST_FLAGS_BYPASS_CACHE;

    //var KF_mainThread = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;
    //KF_mainThread.dispatch(new KFmainThread(this.source, "progress", persist.persistFlags, this.mainWindow, this.browserWindow), KF_mainThread.DISPATCH_NORMAL);

    persist.saveURI(obj_URI, null, null, null, "", file);

    //var thread = Components.classes["@mozilla.org/thread-manager;1"]
    //            .getService(Components.interfaces.nsIThreadManager)
    //            .currentThread;
    //while (persist.currentState != persist.PERSIST_STATE_FINISHED)
    //    thread.processNextEvent(true);

    //KF_mainThread.dispatch(new KFmainThread(this.source, "progress", 10000, this.mainWindow, this.browserWindow), KF_mainThread.DISPATCH_NORMAL);
}

function KFMD5checksumVerification(path, testMD5) {

    try {
        var f = keeFoxInst._myDepsDir();
        f.append(path);
    //var f = Components.classes["@mozilla.org/file/local;1"]
    //                      .createInstance(Components.interfaces.nsILocalFile);
    //    f.initWithPath(keeFoxInst._myDepsDir() + path);
        var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]           
                                .createInstance(Components.interfaces.nsIFileInputStream);
        // open for reading
        istream.init(f, 0x01, 0444, 0);
        var ch = Components.classes["@mozilla.org/security/hash;1"]
                           .createInstance(Components.interfaces.nsICryptoHash);
        // we want to use the MD5 algorithm
        ch.init(ch.MD5);
        // this tells updateFromStream to read the entire file
        const PR_UINT32_MAX = 0xffffffff;
        ch.updateFromStream(istream, PR_UINT32_MAX);
        // pass false here to get binary data back
        var hash = ch.finish(false);

        // return the two-digit hexadecimal code for a byte
        function toHexString(charCode)
        {
          return ("0" + charCode.toString(16)).slice(-2);
        }

        // convert the binary hash data to a hex string.
        var s = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
        
        if (s == testMD5)
            return true;
            
    } catch (err) {
        Components.utils.reportError(err);
    }
    return false;
}


//var KF_mainThread;
/* this is probably useless...

function KeeFoxFileDownloader(source, URL, destinationFile, mainWindow, browserWindow) {
this.source = source;
this.URL = URL;
this.destinationFile = destinationFile;
this.mainWindow = mainWindow;
this.browserWindow = browserWindow;
}
KeeFoxFileDownloader.prototype = {
QueryInterface: function(iid) {
if (iid.equals(Components.interfaces.nsIRunnable) ||
iid.equals(Components.interfaces.nsISupports))
return this;
throw Components.results.NS_ERROR_NO_INTERFACE;
},

run: function() {
{
var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
.createInstance(Components.interfaces.nsIWebBrowserPersist);
var file = Components.classes["@mozilla.org/file/local;1"]
.createInstance(Components.interfaces.nsILocalFile);
file.initWithPath("C:\\temp\\" + this.destinationFile); // download destination
var obj_URI = Components.classes["@mozilla.org/network/io-service;1"]
.getService(Components.interfaces.nsIIOService)
.newURI(this.URL, null, null);
persist.progressListener = new KeeFoxFileDownloaderListener(this.source, this.URL, this.destinationFile, this.mainWindow, this.browserWindow);
persist.persistFlags = persist.persistFlags | persist.PERSIST_FLAGS_BYPASS_CACHE;

var KF_mainThread = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;
KF_mainThread.dispatch(new KFmainThread(this.source, "progress", persist.persistFlags, this.mainWindow, this.browserWindow), KF_mainThread.DISPATCH_NORMAL);

persist.saveURI(obj_URI, null, null, null, "", file);

var thread = Components.classes["@mozilla.org/thread-manager;1"]
.getService(Components.interfaces.nsIThreadManager)
.currentThread;
while (persist.currentState != persist.PERSIST_STATE_FINISHED)
thread.processNextEvent(true);

KF_mainThread.dispatch(new KFmainThread(this.source, "progress", 10000, this.mainWindow, this.browserWindow), KF_mainThread.DISPATCH_NORMAL);
}
}
};


*/


