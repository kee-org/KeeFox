/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2013 Chris Tomlinson <keefox@christomlinson.name>
  
  This is a file with utility functions to aid with a variety of tasks such as
  downloading files from the internet and running executable installers on the local system.

  This runs in per-window scope. See modules/utils.js for add-on scoped utilities.

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

let Cu = Components.utils;

var KeeFoxMainThreadHandler = function(source, reason, result, mainWindow, browserWindow)
{
  this.source = source;
  this.reason = reason;
  this.result = result;
  this.mainWindow = mainWindow;
  this.browserWindow = browserWindow;
};

KeeFoxMainThreadHandler.prototype =
{
    run: function()
    {
        try
        {
            this.mainWindow.keefox_win.Logger.debug(this.source + ' thread signalled "' + this.reason + '" with result: ' + this.result);
            switch (this.source)
            {
                case "executableInstallerRunner":
                    if (this.reason == "IC1NETSetupFinished") {
                        this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_NET_EXECUTING;
                        this.browserWindow.installState |= this.browserWindow.KF_INSTALL_STATE_NET_EXECUTED;
                        this.browserWindow.IC1setupKP(this.mainWindow);
                    } else if (this.reason == "IC1KPSetupFinished") {
                        this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_EXECUTING;
                        this.browserWindow.installState |= this.browserWindow.KF_INSTALL_STATE_KP_EXECUTED;
                        this.browserWindow.IC1setupKRPC(this.mainWindow);
                    } else if (this.reason == "IC2KPSetupFinished") {
                        this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_EXECUTING;
                        this.browserWindow.installState |= this.browserWindow.KF_INSTALL_STATE_KP_EXECUTED;
                        this.browserWindow.IC2setupKRPC(this.mainWindow);
                    }
                    break;
                case "IC1PriDownload": this.handleIC1PriDownload(); break;
                case "IC1SecDownload": this.handleIC1SecDownload(); break;
                case "IC2PriDownload": this.handleIC2PriDownload(); break;
                case "IC5PriDownload": this.handleIC5PriDownload(); break;
            }
        } catch (err) {
            Cu.reportError(err);
        }
    },
        
    handleIC1PriDownload: function ()
    {
        // if we've just finished downloading NET
        if (this.reason == "finished" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_NET_DOWNLOADING) {
        
            this.mainWindow.keefox_win.Logger.info("Finished downloading IC1setupNET");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_NET_DOWNLOADING;
            this.browserWindow.installState |= this.browserWindow.KF_INSTALL_STATE_NET_DOWNLOADED;
            this.browserWindow.IC1setupNET(this.mainWindow);
        }
        // if we've just finished downloading KP
        else if (this.reason == "finished" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("Finished downloading IC1setupKP");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING;
            this.browserWindow.installState |= this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADED;
            this.browserWindow.IC1setupKP(this.mainWindow);
        }
        
        // if we're still downloading NET
        else if (this.reason == "progress" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_NET_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.debug(this.result + "% of IC1setupNETdownloaded");
            this.browserWindow.document.getElementById('IC1setupNETdownloadingProgressBar').value = this.result;
        }
        // if we're still downloading KP
        else if (this.reason == "progress" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.debug(this.result + "% of IC1setupKPdownloaded");
            this.browserWindow.document.getElementById('IC1setupKPdownloadingProgressBar').value = this.result;
        }
        
        // if NET download was cancelled
        else if (this.reason == "cancelled" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_NET_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("IC1setupNET download cancelled");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_NET_DOWNLOADING;
            // No need to take further action
        }
        // if KP download was cancelled
        else if (this.reason == "cancelled" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("IC1setupKP download cancelled");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING;
            // No need to take further action
        }
        
        // if NET download failed
        else if (this.reason == "failed" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_NET_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("IC1setupNET download failed");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_NET_DOWNLOADING;
            this.browserWindow.installationError("ERRORInstallDownloadFailed");
        }
        // if KP download failed
        else if (this.reason == "failed" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("IC1setupKP download failed");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING;
            this.browserWindow.installationError("ERRORInstallDownloadFailed");
        }
    
    },
    
    handleIC1SecDownload: function()
    {
        // if we've just finished downloading KP
        if (this.reason == "finished" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("Finished downloading IC1setupKP");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING;
            this.browserWindow.installState |= this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADED;
            this.browserWindow.IC1setupKP(this.mainWindow);
        }
        
        // if we're still downloading KP
        else if (this.reason == "progress" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.debug(this.result + "% of IC1setupKPdownloaded");
            this.browserWindow.document.getElementById('IC1setupKPdownloadingProgressBar').value = this.result;
        }
        
        // if KP download was cancelled
        else if (this.reason == "cancelled" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("IC1setupKP download cancelled");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING;
            // No need to take further action
        }
        
        // if KP download failed
        else if (this.reason == "failed" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("IC1setupKP download failed");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING;
            this.browserWindow.installationError("ERRORInstallDownloadFailed");
        }
    },
    
    handleIC2PriDownload: function()
    {
        // The IC2SecDownload just uses the same file as IC1Pri so we just check below whether we run silent or not
        
        // if we've just finished downloading KP
        if (this.reason == "finished" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("Finished downloading IC2setupKP");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING;
            this.browserWindow.installState |= this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADED;
            if (this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_SELECTED_PRI)
                this.browserWindow.IC2setupKP(this.mainWindow);
            else
                this.browserWindow.IC2setupCustomKP(this.mainWindow);
        }
        
        // if we're still downloading KP
        else if (this.reason == "progress" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.debug(this.result + "% of IC2setupKPdownloaded");
            this.browserWindow.document.getElementById('IC2setupKPdownloadingProgressBar').value = this.result;
        }
        
        // if KP download was cancelled
        else if (this.reason == "cancelled" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("IC2setupKP download cancelled");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING;
            // No need to take further action
        }
        
        // if KP download failed
        else if (this.reason == "failed" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("IC2setupKP download failed");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KP_DOWNLOADING;
            this.browserWindow.installationError("ERRORInstallDownloadFailed");
        }
    },
    
    handleIC5PriDownload: function()
    {
        // if we've just finished downloading KP ZIP file
        if (this.reason == "finished" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KPZIP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("Finished downloading IC5zipKP");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KPZIP_DOWNLOADING;
            this.browserWindow.installState |= this.browserWindow.KF_INSTALL_STATE_KPZIP_DOWNLOADED;
            this.browserWindow.IC5zipKP(this.mainWindow);
        }
        
        // if we're still downloading KP ZIP file
        else if (this.reason == "progress" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KPZIP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.debug(this.result + "% of IC5zipKPdownloaded");
            this.browserWindow.document.getElementById('IC5zipKPdownloadingProgressBar').value = this.result;
        }
        
        // if KP ZIP download was cancelled
        else if (this.reason == "cancelled" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KPZIP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("IC2setupKP download cancelled");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KPZIP_DOWNLOADING;
            // No need to take further action
        }
        
        // if KP ZIP download failed
        else if (this.reason == "failed" && this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KPZIP_DOWNLOADING) {
            this.mainWindow.keefox_win.Logger.info("IC2setupKP download failed");
            this.browserWindow.installState ^= this.browserWindow.installState & this.browserWindow.KF_INSTALL_STATE_KPZIP_DOWNLOADING;
            this.browserWindow.installationError("ERRORInstallDownloadFailed");
        }
    }
};


/* download listener. decides what to do and if desired, we'll update the main thread
by calling the generic keefox main thread handler (maybe this listener is just called in
the main thread anyway but might as well play it safe and make sure we definitely only
 let the main thread touch the UI
 dec 2010: think it's all on the main thread... cos it still works in FF4!
*/
function KeeFoxFileDownloaderListener(source, URL, destinationFile, mainWindow, browserWindow, persist)
{
    this.source = source;
    this.URL = URL;
    this.destinationFile = destinationFile;
    this.mainWindow = mainWindow;
    this.browserWindow = browserWindow;
    this.lastPerCom = 0;
    this.persist = persist;
}

KeeFoxFileDownloaderListener.prototype =
{
    QueryInterface: function(aIID) {
        if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
            aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
            aIID.equals(Components.interfaces.nsISupports))
            return this;
        throw Components.results.NS_NOINTERFACE;
    },

    onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress)
    {
        var percentComplete = Math.floor((aCurTotalProgress / aMaxTotalProgress) * 100);

        if (percentComplete > this.lastPerCom)
        {
            var kfMTH = new KeeFoxMainThreadHandler(this.source, "progress", percentComplete, this.mainWindow, this.browserWindow);
            kfMTH.run();
        }

        this.lastPerCom = percentComplete;
    },
    
    onStateChange: function(aWebProgress, aRequest, aStatus, aMessage)
    {
        if (aStatus & Components.interfaces.nsIWebProgressListener.STATE_STOP) {
        
            if (this.persist.result == 0) 
            { // NS_OK
                var kfMTH = new KeeFoxMainThreadHandler(this.source, "finished", "", this.mainWindow, this.browserWindow);
                kfMTH.run();
            } else if (this.persist.result == 2152398850)
            { //NS_BINDING_ABORTED: 0x804b0002
                var kfMTH = new KeeFoxMainThreadHandler(this.source, "cancelled", "", this.mainWindow, this.browserWindow);
                kfMTH.run();
            } else 
            {
                var kfMTH = new KeeFoxMainThreadHandler(this.source, "failed", "", this.mainWindow, this.browserWindow);
                kfMTH.run();
            }
        }
    }
}

/*
download a file - saveURI function is asyncronous so I don't think this needs to be called away from the main thread
*/
keefox_win.KFdownloadFile = function(source, URL, destinationFile, mainWindow, browserWindow, persist)
{
    persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
        .createInstance(Components.interfaces.nsIWebBrowserPersist);
    var file = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
    file.initWithFile(keefox_org.utils.myProfileDir());

    file.append(destinationFile);

    var obj_URI = Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService)
        .newURI(URL, null, null);
    persist.progressListener = new KeeFoxFileDownloaderListener(source, URL, destinationFile, mainWindow, browserWindow, persist);
    persist.persistFlags = persist.persistFlags | persist.PERSIST_FLAGS_CLEANUP_ON_FAILURE 
                         | persist.PERSIST_FLAGS_REPLACE_EXISTING_FILES | persist.PERSIST_FLAGS_BYPASS_CACHE;

    // FF36 breaks backwards compatibility
    let versionComparator = Cc["@mozilla.org/xpcom/version-comparator;1"].
        getService(Ci.nsIVersionComparator);
    if (versionComparator.compare(Application.version, "36.0a1") < 0)
        persist.saveURI(obj_URI, null, null, null, "", file, null);
    else
        persist.saveURI(obj_URI, null, null, null, null, "", file, null);
    
    return persist;
};

keefox_win.KFMD5checksumVerification = function(path, testMD5)
{
    try
    {
        var f = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
        f.initWithFile(keefox_org.utils.myProfileDir());
        f.append(path);
        var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]           
                                .createInstance(Components.interfaces.nsIFileInputStream);
        // open for reading
        istream.init(f, 0x01, 292, 0);
        var ch = Components.classes["@mozilla.org/security/hash;1"]
                           .createInstance(Components.interfaces.nsICryptoHash);
        // we want to use the MD5 algorithm
        ch.init(ch.MD5);
        // this tells updateFromStream to read the entire file
        const PR_UINT32_MAX = 0xffffffff;
        ch.updateFromStream(istream, PR_UINT32_MAX);
        // pass false here to get binary data back
        var hash = ch.finish(false);

        // convert the binary hash data to a hex string.
        var s = [keefox_org.utils.toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
        if (s == testMD5)
            return true;
            
    } catch (err) {
        this.Logger.error("Error calculating checksums: " + err);
        Cu.reportError(err);
    }
    return false;
};