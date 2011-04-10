/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
Copyright 2008-2011 Chris Tomlinson <keefox@christomlinson.name>
  
This install.js file helps manage the installation of .NET, KeePass and KeePassRPC.

See install.xul for a description of each of the ICs (Install Cases)

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

const KF_KPZIP_DOWNLOAD_PATH = "http://ovh.dl.sourceforge.net/project/keepass/KeePass%202.x/2.15/";
const KF_KPZIP_FILE_NAME = "KeePass-2.15.zip";
const KF_KPZIP_SAVE_NAME = "KeePass-2.15.zip";
const KF_KPZIP_FILE_CHECKSUM = "3f1f8da59e410e973a4dfb2f5a5342d1";
const KF_KP_DOWNLOAD_PATH = "http://ovh.dl.sourceforge.net/project/keepass/KeePass%202.x/2.15/";
const KF_KP_FILE_NAME = "KeePass-2.15-Setup.exe";//KeePass-2.10-Setup.exe?use_mirror=kent
const KF_KP_SAVE_NAME = "KeePass-2.15-Setup.exe";
const KF_KP_FILE_CHECKSUM = "db105d13f7b18286b625375d435f729f";
const KF_NET_DOWNLOAD_PATH = "http://download.microsoft.com/download/5/6/7/567758a3-759e-473e-bf8f-52154438565a/";
const KF_NET_FILE_NAME = "dotnetfx.exe"
const KF_NET_FILE_CHECKSUM = "93a13358898a54643adbca67d1533462";
const KF_NET35_DOWNLOAD_PATH = "http://download.microsoft.com/download/7/0/3/703455ee-a747-4cc8-bd3e-98a615c3aedb/";
const KF_NET35_FILE_NAME = "dotNetFx35setup.exe";
const KF_NET35_FILE_CHECKSUM = "c626670633ddcc2a66b0d935195cf2a1";
const KF_KRPC_FILE_NAME = "KeePassRPCCopier.exe";


const KF_INSTALL_STATE_SELECTED_PRI = 1; // user has asked to run default installation routine
const KF_INSTALL_STATE_NET_DOWNLOADING = 2;
const KF_INSTALL_STATE_NET_DOWNLOADED = 4;
const KF_INSTALL_STATE_NET_EXECUTING = 8;
const KF_INSTALL_STATE_NET_EXECUTED = 16; // .NET installer has been executed or .NET was already installed
const KF_INSTALL_STATE_KP_DOWNLOADING = 32;
const KF_INSTALL_STATE_KP_DOWNLOADED = 64;
const KF_INSTALL_STATE_KP_EXECUTING = 128;
const KF_INSTALL_STATE_KP_EXECUTED = 256;  // KeePass installer has been executed or KeePass was already installed
const KF_INSTALL_STATE_KRPC_DOWNLOADING = 512;
const KF_INSTALL_STATE_KRPC_DOWNLOADED = 1024; // KeePassRPC files have been downloaded (actually we will bundle them with XPI for time being at least)
const KF_INSTALL_STATE_KRPC_EXECUTING = 2048; // KeePassRPC files are being copied
const KF_INSTALL_STATE_KRPC_EXECUTED = 4096;  // KeePassRPC files have been copied

const KF_INSTALL_STATE_SELECTED_SEC = 8192; // user has asked to run secondary installation routine
const KF_INSTALL_STATE_SELECTED_TER = 16384; // user has asked to run tertiary installation routine
const KF_INSTALL_STATE_NET35_DOWNLOADING = 32768;
const KF_INSTALL_STATE_NET35_DOWNLOADED = 65536;
const KF_INSTALL_STATE_NET35_EXECUTING = 131072;
const KF_INSTALL_STATE_NET35_EXECUTED = 262144; // .NET35 installer has been executed
const KF_INSTALL_STATE_KPZIP_DOWNLOADING = 524288;
const KF_INSTALL_STATE_KPZIP_DOWNLOADED = 1048576;
const KF_INSTALL_STATE_KPZIP_EXECUTING = 2097152;
const KF_INSTALL_STATE_KPZIP_EXECUTED = 4194304;  // KeePass zip has been extracted

// tracks progress of the various installation stages, using KF_INSTALL_STATE_* constants
var installState = 0;

// whether we're upgrading from a previous version
var KFupgradeMode = false;

// threads to launch KeePass and .NET installers on (the installer execution
// blocks the Firefox thread it's run from so this keeps the UI responsive)
var setupKPThread;
var setupNETThread;

// The nsWebBrowserPersist object used to download installation content from the internet
var persist;

var mainWin = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIWebNavigation)
.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
.rootTreeItem
.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIDOMWindow);

var mainWindow = mainWin.keefox_org.ILM._currentWindow;

function prepareInstallPage()
{
    var qs = "";
    var args = new Object();
    var query = location.search.substring(1);
    var pairs = query.split("&");
    for(var i = 0; i < pairs.length; i++)
    {
        var pos = pairs[i].indexOf('=');
        if (pos == -1) continue;
        var argname = pairs[i].substring(0,pos);
        var value = pairs[i].substring(pos+1);
        args[argname] = unescape(value); 
    }
    if (args.upgrade == "1")
    {
        KFupgradeMode = true;
        mainWindow.keeFoxInst._KFLog.debug("Install system starting in upgrade mode");
    }
    else
    {
        mainWindow.keeFoxInst._KFLog.debug("Install system starting in install mode");
    }
        
    // One of 8 installation options. The user only needs to see information relevant
    // to their starting state.
    var installCase; 
    
    var keePassLocation = "not installed";

    // prevent reinstallation if KeeFox is already working
    if (mainWindow.keeFoxInst._keeFoxStorage.get("KeePassRPCActive", false))
    {
        document.getElementById('KFInstallNotRequired').setAttribute('hidden', false);
        resetInstallation();
        return;
    }
    
    // only let this install script run once per firefox session unless user cancels it
    if (mainWindow.keeFoxInst._keeFoxStorage.get("KFinstallProcessStarted", false))
    {
        document.getElementById('KFInstallAlreadyInProgress').setAttribute('hidden', false);
        showSection('restartInstallationOption');
        return;
    }
    mainWindow.keeFoxInst._keeFoxStorage.set("KFinstallProcessStarted",true);

    if (mainWindow.keeFoxInst._keeFoxExtension.prefs.has("keePassInstalledLocation")) {
        if (!KFupgradeMode)
            showSection('installationFoundWarning');
        keePassLocation = mainWindow.keeFoxInst._keeFoxExtension.prefs.getValue("keePassInstalledLocation", "not installed");
        if (keePassLocation == "")
            keePassLocation = "not installed";
    }
    if (userHasAdminRights(mainWindow))
        if (KFupgradeMode)
            installCase = 7;
        else if (keePassLocation != "not installed")
            installCase = 3;
        else if (checkDotNetFramework(mainWindow))
            installCase = 2;
        else
            installCase = 1;
    else
        if (KFupgradeMode)
            installCase = 8;
        else if (keePassLocation != "not installed")
            installCase = 6;
        else if (checkDotNetFramework(mainWindow))
            installCase = 5;
        else
            installCase = 4;

    mainWindow.KFLog.info("applying installation case " + installCase);
 
    // comment this out to enable normal operation or uncomment to specify a test case
    //installCase = 5; mainWindow.KFLog.warn("Overriding with installation case " + installCase);

// configure the current installation state and trigger any relevant pre-emptive file
// downloads to keep the end user experience as fast as possible
//TODO 0.9: support cancellation of pre-emptive downloading in case advanced user chooses unusual option
    switch (installCase)
    {
        case 1:
            showSection('setupExeInstallButtonMain');
            showSection('adminNETInstallExpander');
            installState = KF_INSTALL_STATE_NET_DOWNLOADING | KF_INSTALL_STATE_KRPC_DOWNLOADED;
            persist = mainWindow.KFdownloadFile("IC1PriDownload",
                KF_NET_DOWNLOAD_PATH + KF_NET_FILE_NAME, KF_NET_FILE_NAME, mainWindow, window, persist);
            break;
        case 2: 
            showSection('KPsetupExeSilentInstallButtonMain');
            showSection('adminSetupKPInstallExpander');
            installState = KF_INSTALL_STATE_NET_EXECUTED 
                | KF_INSTALL_STATE_KP_DOWNLOADING | KF_INSTALL_STATE_KRPC_DOWNLOADED;
            persist = mainWindow.KFdownloadFile("IC2PriDownload",
                KF_KP_DOWNLOAD_PATH + KF_KP_FILE_NAME, KF_KP_SAVE_NAME, mainWindow, window, persist);
            break;
        case 3: 
            showSection('copyKRPCToKnownKPLocationInstallButtonMain');            
            showSection('admincopyKRPCToKnownKPLocationInstallExpander');
            installState = KF_INSTALL_STATE_NET_EXECUTED | KF_INSTALL_STATE_KP_EXECUTED 
                | KF_INSTALL_STATE_KRPC_DOWNLOADED;
            break;
        case 4: 
            showSection('setupExeInstallButtonMain');
            showSection('nonAdminNETInstallExpander');
            installState = KF_INSTALL_STATE_NET_DOWNLOADING | KF_INSTALL_STATE_KRPC_DOWNLOADED;
            persist = mainWindow.KFdownloadFile("IC1PriDownload",
                KF_NET_DOWNLOAD_PATH + KF_NET_FILE_NAME, KF_NET_FILE_NAME, mainWindow, window, persist);
                // using IC1 since same process is followed from now on...
            break;
        case 5: 
            showSection('copyKPToSpecificLocationInstallButtonMain'); 
            showSection('nonAdminSetupKPInstallExpander');
            installState = KF_INSTALL_STATE_NET_EXECUTED | KF_INSTALL_STATE_KPZIP_DOWNLOADING 
                | KF_INSTALL_STATE_KRPC_DOWNLOADED;
            persist = mainWindow.KFdownloadFile("IC5PriDownload",
                KF_KPZIP_DOWNLOAD_PATH + KF_KPZIP_FILE_NAME, KF_KPZIP_SAVE_NAME, mainWindow, window, persist);
            break;
        case 6: 
            showSection('copyKRPCToKnownKPLocationInstallButtonMain');
            showSection('nonAdmincopyKRPCToKnownKPLocationInstallExpander');
            installState = KF_INSTALL_STATE_NET_EXECUTED | KF_INSTALL_STATE_KP_EXECUTED 
                | KF_INSTALL_STATE_KRPC_DOWNLOADED;
            break;
        case 7: 
            showSection('copyKRPCToKnownKPLocationUpgradeButtonMain');
            showSection('admincopyKRPCToKnownKPLocationInstallExpander');
            installState = KF_INSTALL_STATE_NET_EXECUTED | KF_INSTALL_STATE_KP_EXECUTED 
                | KF_INSTALL_STATE_KRPC_DOWNLOADED;
            break;
        case 8: 
            showSection('copyKRPCToKnownKPLocationUpgradeButtonMain');
            showSection('nonAdmincopyKRPCToKnownKPLocationInstallExpander');
            installState = KF_INSTALL_STATE_NET_EXECUTED | KF_INSTALL_STATE_KP_EXECUTED 
                | KF_INSTALL_STATE_KRPC_DOWNLOADED;
            break;   
            //TODO2:? update 7 and 8 to show Upgrade text, etc.       
        default: document.getElementById('ERRORInstallButtonMain').setAttribute('hidden', false); break;
    }
}

function installationError(error)
{
    if (error == "ERRORInstallDownloadFailed")
    {
        showSection('ERRORInstallDownloadFailed');
    } else if (error == "ERRORInstallDownloadChecksumFailed")
    {
        showSection('ERRORInstallDownloadFailed');
    } else
    {
        showSection('ERRORInstallButtonMain');
    }
    showSection('restartInstallationOption');
    resetInstallation();
}

function resetInstallation()
{
    mainWindow.keeFoxInst._keeFoxStorage.set("KFinstallProcessStarted",false);
    
}

function cancelCurrentDownload()
{
    hideSection("installProgressView");
    persist.cancelSave();
    showSection("ERRORInstallDownloadCanceled");
    showSection('restartInstallationOption');
    resetInstallation();    
}

function hideInstallView() {
    document.getElementById('installationStartView').setAttribute('hidden', true);
}

function showProgressView() {
    document.getElementById('installProgressView').setAttribute('hidden', false);
}

function expandSection(id, callingId) {
    hideSection(callingId);
    showSection(id);
}
function showSection(id) {
    document.getElementById(id).setAttribute('hidden', false);
}

function hideSection(id) {
    document.getElementById(id).setAttribute('hidden', true);
}

function checksumFailed() {
mainWindow.KFLog.error("File checksum failed. Download corrupted?");
showSection("ERRORInstallDownloadChecksumFailed");
showSection('restartInstallationOption');
}

/********************
START:
functions to support the execution of Install Case 1
********************/
function IC1finished(mainWindow)
{
    hideSection('IC1KRPCdownloaded');
    showSection('InstallFinished');
    launchAndConnectToKeePass();
}

function IC1setupKRPC(mainWindow)
{
    try
    {
        if ((installState & KF_INSTALL_STATE_KRPC_DOWNLOADED) 
            && (installState & KF_INSTALL_STATE_KP_EXECUTED))
        {
            // we don't checksum bundled DLLs since if they are compromised the
            // whole XPI, including this file, could be too
            hideSection('IC1setupKPdownloaded');
            showSection('IC1KRPCdownloaded');
            
            installState |= KF_INSTALL_STATE_KRPC_EXECUTING;

            // we've just run the official KeePass installer so can be pretty
            // confident that we can automatically find the installation directory
            // (though if we get time, we should handle exceptions too...)
            var keePassLocation;
            var KeePassEXEfound;
            KeePassEXEfound = false;
            keePassLocation = "not installed";

            keePassLocation = mainWindow.keeFoxInst._discoverKeePassInstallLocation();
            if (keePassLocation != "not installed")
            {
                KeePassEXEfound = mainWindow.keeFoxInst._confirmKeePassInstallLocation(keePassLocation);
            }
            
            if (KeePassEXEfound && copyKeePassRPCFilesTo(keePassLocation))
            {
                installState ^= KF_INSTALL_STATE_KRPC_EXECUTING; // we can
                    // safely assume this bit is already set since no other threads are involved
                installState |= KF_INSTALL_STATE_KRPC_EXECUTED;
                IC1finished(mainWindow);
            } else
            {
                hideSection('IC1KRPCdownloaded');
                showSection('ERRORInstallButtonMain');
            }
        }
    } catch (err) {
        mainWindow.keeFoxInst._KFLog.error(err);
    }
}

function IC1setupKP(mainWindow)
{
    try
    {
        if ((installState & KF_INSTALL_STATE_KP_DOWNLOADED) 
            && (installState & KF_INSTALL_STATE_NET_EXECUTED 
                || installState & KF_INSTALL_STATE_NET35_EXECUTED))
        {
            if (installState & KF_INSTALL_STATE_NET_EXECUTED)
                hideSection('IC1setupNETdownloaded');
            else if (installState & KF_INSTALL_STATE_NET35_EXECUTED)
                hideSection('IC1setupNET35downloaded');
                
            var checkTest = mainWindow.KFMD5checksumVerification(KF_KP_SAVE_NAME,KF_KP_FILE_CHECKSUM);
            
            hideSection('IC1setupKPdownloading'); // if applicable (probably this was never shown)
            if (checkTest)
                mainWindow.KFLog.info("File checksum succeeded.");
            else
            {
                checksumFailed();
                return;
            }            
            showSection('IC1setupKPdownloaded');
            
            var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(mainWindow.keeFoxInst._myDepsDir());
            file.append(KF_KP_SAVE_NAME);            

            installState |= KF_INSTALL_STATE_KP_EXECUTING;

            mainWindow.keeFoxInst.runAnInstaller(file.path,"/silent",
                {
                    observe : function () {
                        var mainWin = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIWebNavigation)
                            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                            .rootTreeItem
                            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIDOMWindow);
                        var mainWindow = mainWin.keefox_org.ILM._currentWindow;
                        var kth = new mainWindow.KFmainThreadHandler("executableInstallerRunner", "IC1KPSetupFinished", '', mainWindow, window);
                        kth.run(); 
                    }
                }
            );
            
        } else if (installState & KF_INSTALL_STATE_KP_DOWNLOADING)
        {
            hideSection('IC1setupNETdownloaded');
            showSection('IC1setupKPdownloading');
        }
    } catch (err) {
        mainWindow.keeFoxInst._KFLog.error(err);
    }    
}

function IC1setupNET(mainWindow)
{
    try
    {
        if ((installState & KF_INSTALL_STATE_NET_DOWNLOADED)
            && (installState & KF_INSTALL_STATE_SELECTED_PRI))
        {
            var checkTest = mainWindow.KFMD5checksumVerification(KF_NET_FILE_NAME,KF_NET_FILE_CHECKSUM);
            
            hideSection('IC1setupNETdownloading');
            if (checkTest)
                mainWindow.KFLog.info("File checksum succeeded.");
            else
            {
                checksumFailed();
                return;
            }            
            showSection('IC1setupNETdownloaded');
            
            // start the pre-download of the KeePass setup file (while user installs .Net...)
            installState |= KF_INSTALL_STATE_KP_DOWNLOADING;
            persist = mainWindow.KFdownloadFile("IC1PriDownload",
                KF_KP_DOWNLOAD_PATH + KF_KP_FILE_NAME, KF_KP_SAVE_NAME, mainWindow, window, persist);
            
            installState |= KF_INSTALL_STATE_NET_EXECUTING;

            var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(mainWindow.keeFoxInst._myDepsDir());
            file.append(KF_NET_FILE_NAME);
                                
            mainWindow.keeFoxInst.runAnInstaller(file.path,"", 
                {
                    observe : function () {
                        var mainWin = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIWebNavigation)
                            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                            .rootTreeItem
                            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIDOMWindow);
                        var mainWindow = mainWin.keefox_org.ILM._currentWindow;
                        var kth = new mainWindow.KFmainThreadHandler("executableInstallerRunner", "IC1NETSetupFinished", '', mainWindow, window);
                        kth.run(); 
                    }
                }
            );           
        }
    } catch (err) {
        mainWindow.keeFoxInst._KFLog.error(err);
    }
}


function IC1setupNET35(mainWindow)
{
    try
    {
        if ((installState & KF_INSTALL_STATE_NET35_DOWNLOADED) 
            && (installState & KF_INSTALL_STATE_SELECTED_SEC))
        {
            var checkTest = mainWindow.KFMD5checksumVerification(KF_NET35_FILE_NAME,KF_NET35_FILE_CHECKSUM);
            
            hideSection('IC1setupNET35downloading');
            if (checkTest)
                mainWindow.KFLog.info("File checksum succeeded.");
            else
            {
                checksumFailed();
                return;
            }            
            showSection('IC1setupNET35downloaded');
            
            // start the pre-download of the KeePass setup file (while user installs .Net...)
            installState |= KF_INSTALL_STATE_KP_DOWNLOADING;
            persist = mainWindow.KFdownloadFile("IC1SecDownload",
                KF_KP_DOWNLOAD_PATH + KF_KP_FILE_NAME, KF_KP_SAVE_NAME, mainWindow, window, persist);
            
            installState |= KF_INSTALL_STATE_NET_EXECUTING;

            var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(mainWindow.keeFoxInst._myDepsDir());
            file.append(KF_NET35_FILE_NAME);
            mainWindow.keeFoxInst.runAnInstaller(file.path,"",
                {
                    observe : function () {
                        var mainWin = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIWebNavigation)
                            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                            .rootTreeItem
                            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIDOMWindow);
                        var mainWindow = mainWin.keefox_org.ILM._currentWindow;
                        var kth = new mainWindow.KFmainThreadHandler("executableInstallerRunner", "IC1NET35SetupFinished", '', mainWindow, window);
                        kth.run(); 
                    }
                }
            );
        }
    } catch (err) {
        mainWindow.keeFoxInst._KFLog.error(err);
    }
}
/********************
END:
functions to support the execution of Install Case 1
********************/



/********************
START:
functions to support the execution of Install Case 2
(including administrative upgrade)
********************/
function IC2finished(mainWindow) {

//TODO2: customise this for upgrades?)

    hideSection('IC2KRPCdownloaded');
    showSection('InstallFinished');
    launchAndConnectToKeePass();
}

function IC2setupKRPC(mainWindow)
{
    try
    {
        if ((installState & KF_INSTALL_STATE_KRPC_DOWNLOADED)
            && (installState & KF_INSTALL_STATE_KP_EXECUTED))
        {
            // we don't checksum bundled DLLs since if they are compromised
            // the whole XPI, including this file, could be too
            hideSection('IC2setupKPdownloaded');
            showSection('IC2KRPCdownloaded');
            
            installState |= KF_INSTALL_STATE_KRPC_EXECUTING;

            // we've just run the official KeePass installer so can be pretty
            // confident that we can automatically find the installation directory
            // (though if we get time, we should handle exceptions too...)
            var keePassLocation;
            var KeePassEXEfound;
            KeePassEXEfound = false;
            keePassLocation = "not installed";

            keePassLocation = mainWindow.keeFoxInst._discoverKeePassInstallLocation();
            if (keePassLocation != "not installed")
            {
                KeePassEXEfound = mainWindow.keeFoxInst._confirmKeePassInstallLocation(keePassLocation);
            }
            
            if (KeePassEXEfound && copyKeePassRPCFilesTo(keePassLocation))
            {
                installState ^= KF_INSTALL_STATE_KRPC_EXECUTING; // we can safely
                    // assume this bit is already set since no other threads are involved
                installState |= KF_INSTALL_STATE_KRPC_EXECUTED;
                IC2finished(mainWindow);
            } else
            {
                hideSection('IC2KRPCdownloaded');
                showSection('ERRORInstallButtonMain');
            }
        }
    } catch (err) {
        mainWindow.keeFoxInst._KFLog.error(err);
    }
}

function IC2setupKP(mainWindow)
{
    try
    {
        if ((installState & KF_INSTALL_STATE_KP_DOWNLOADED)
            && (installState & KF_INSTALL_STATE_SELECTED_PRI))
        {
            var checkTest = mainWindow.KFMD5checksumVerification(KF_KP_SAVE_NAME,KF_KP_FILE_CHECKSUM);
            
            hideSection('IC2setupKPdownloading'); // if applicable
            if (checkTest)
                mainWindow.KFLog.info("File checksum succeeded.");
            else
            {
                checksumFailed();
                return;
            }            
            showSection('IC2setupKPdownloaded');

            installState |= KF_INSTALL_STATE_KP_EXECUTING;

            var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(mainWindow.keeFoxInst._myDepsDir());
            file.append(KF_KP_SAVE_NAME);
            
            mainWindow.keeFoxInst.runAnInstaller(file.path,"/silent",
                {
                    observe : function () {
                        var mainWin = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIWebNavigation)
                            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                            .rootTreeItem
                            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIDOMWindow);
                        var mainWindow = mainWin.keefox_org.ILM._currentWindow;
                        var kth = new mainWindow.KFmainThreadHandler("executableInstallerRunner", "IC2KPSetupFinished", '', mainWindow, window);
                        kth.run(); 
                    }
                }
            );
            
        } else if (installState & KF_INSTALL_STATE_KP_DOWNLOADING)
        {
            showSection('IC2setupKPdownloading');
        }
    } catch (err) {
        mainWindow.keeFoxInst._KFLog.error(err);
    }    
}

function IC2setupCustomKP(mainWindow)
{
    try
    {
        if ((installState & KF_INSTALL_STATE_KP_DOWNLOADED)
            && (installState & KF_INSTALL_STATE_SELECTED_SEC))
        {
            var checkTest = mainWindow.KFMD5checksumVerification(KF_KP_SAVE_NAME,KF_KP_FILE_CHECKSUM);
            
            hideSection('IC2setupKPdownloading'); // if applicable (probably this was never shown)
            if (checkTest)
                mainWindow.KFLog.info("File checksum succeeded.");
            else
            {
                checksumFailed();
                return;
            }            
            showSection('IC2setupKPdownloaded');

            installState |= KF_INSTALL_STATE_KP_EXECUTING;

            var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(mainWindow.keeFoxInst._myDepsDir());
            file.append(KF_KP_SAVE_NAME);
            
            mainWindow.keeFoxInst.runAnInstaller(file.path,"",
                {
                    observe : function () {
                        var mainWin = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIWebNavigation)
                            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                            .rootTreeItem
                            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIDOMWindow);
                        var mainWindow = mainWin.keefox_org.ILM._currentWindow;
                        var kth = new mainWindow.KFmainThreadHandler("executableInstallerRunner", "IC2KPSetupFinished", '', mainWindow, window);
                        kth.run(); 
                    }
                }
            );
            
        } else if (installState & KF_INSTALL_STATE_KP_DOWNLOADING)
        {
            showSection('IC2setupKPdownloading');
        }
    } catch (err) {
        mainWindow.keeFoxInst._KFLog.error(err);
    }    
}
/********************
END:
functions to support the execution of Install Case 2
********************/




/********************
START:
functions to support the execution of IC5 (and IC2 tertiary)
********************/
/*
 IC5 (and IC2 tertiary)
 test to see if KeePass is installed in specified location, if
 it isn't, extract the portable zip file there
 then in either case we will copy the KeePassRPC files into the plugin folder
 */
 //TODO2: rearrange this install process so that the folder is chosen
 // first (before download - or during?) just in case user cancels
 // first (so minimal bandwidth wasted)
function IC5zipKP()
{
    if ((installState & KF_INSTALL_STATE_KPZIP_DOWNLOADED)
        && (installState & KF_INSTALL_STATE_SELECTED_TER))
    {
        var checkTest = mainWindow.KFMD5checksumVerification(KF_KPZIP_SAVE_NAME, KF_KPZIP_FILE_CHECKSUM);
        
        hideSection('IC5zipKPdownloading');
        if (checkTest)
            mainWindow.KFLog.info("File checksum succeeded.");
        else
        {
            checksumFailed()
            return;
        }            
        showSection('IC5installing');

        installState |= KF_INSTALL_STATE_KPZIP_EXECUTING;

        const nsIFilePicker = Components.interfaces.nsIFilePicker;

        var fp = Components.classes["@mozilla.org/filepicker;1"]
                       .createInstance(nsIFilePicker);
        fp.init(window, "Choose a directory for KeePass", nsIFilePicker.modeGetFolder);
        //fp.appendFilters(nsIFilePicker.filterAll);

        var rv = fp.show();
        if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace)
        {
            var folder = fp.file;
            // Get the path as string. Note that you usually won't 
            // need to work with the string paths.
            var path = fp.file.path;
            var KeePassEXEfound;
            
            mainWindow.keeFoxInst._keeFoxExtension.prefs
                .setValue("keePassInstalledLocation",path+"\\");
                    //TODO2: probably should store the file object
                    // itself rather than string version (X-Plat)
            KeePassEXEfound = mainWindow.keeFoxInst._confirmKeePassInstallLocation(path+"\\");
            mainWindow.KFLog.info("KeePass install location set to: " + path+"\\");
            if (!KeePassEXEfound)
            {
                //TODO2: permissions, failures, missing directories, etc. etc.
                extractKPZip (KF_KPZIP_SAVE_NAME, folder);
                       
                mainWindow.keeFoxInst._keeFoxExtension.prefs
                    .setValue("keePassInstalledLocation",path+"\\");
                        //TODO2: probably should store the file object
                        // itself rather than string version (X-Plat)
                KeePassEXEfound = mainWindow.keeFoxInst._confirmKeePassInstallLocation(path+"\\");
                mainWindow.KFLog.info("KeePass install location set to: " + path+"\\");
                if (!KeePassEXEfound)
                {
                    mainWindow.keeFoxInst._keeFoxExtension.prefs.setValue("keePassInstalledLocation","");
                }
            }
            
            if (KeePassEXEfound)
            {
                if (!copyKeePassRPCFilesTo(path))
                {
                    hideSection('IC5installing');
                    showSection('ERRORInstallButtonMain');
                    return;
                }
            }
                
            hideSection('IC5installing');
            showSection('InstallFinished');
            launchAndConnectToKeePass();
        } else
        {
            hideSection('installProgressView');
            showSection('installationStartView');
            hideSection('IC5installing');
        }        
        
    } else if (installState & KF_INSTALL_STATE_KPZIP_DOWNLOADING)
    {
        showSection('IC5zipKPdownloading');
    }
 
}
/********************
END:
functions to support the execution of IC5 (and IC2 tertiary)
********************/


/********************
START:
functions initiated by user choice in UI
********************/
/*
 IC1 and IC4
 run (with admin rights escalation) the .NET 2 installer 
 */
function setupExeInstall()
{
    hideInstallView();
    showProgressView();
    
    if (installState & KF_INSTALL_STATE_NET_DOWNLOADING)
        showSection('IC1setupNETdownloading');
 
    // call this now and let it decide if it is the right time to run
    // the installer or wait until it's called again by progress listener
    installState |= KF_INSTALL_STATE_SELECTED_PRI;
    IC1setupNET(mainWindow);
}

/*
 IC2
 run (quietly and with admin rights escalation) the keepass 2.x exe installer
 and copy the KeePassRPC files into place
 */
function KPsetupExeSilentInstall()
{
    hideInstallView();
    showProgressView();
    
    if (installState & KF_INSTALL_STATE_KP_DOWNLOADING)
        showSection('IC2setupKPdownloading');
 
    // call this now and let it decide if it is the right time to run
    // the installer or wait until it's called again by progress listener
    installState |= KF_INSTALL_STATE_SELECTED_PRI;
    IC2setupKP(mainWindow);
}


/*
 IC3 and IC6
 copy KeePassRPC files to the known KeePass 2.x location
 TODO: detect access denied failures and prompt user accordingly
 (this could happen if an admin installed KeePass at an earlier time)
 */
function copyKRPCToKnownKPLocationInstall()
{
    hideInstallView();
    
    keePassLocation = mainWindow.keeFoxInst._keeFoxExtension.prefs
                    .getValue("keePassInstalledLocation", "not installed");

    if (keePassLocation == "not installed")
    {
        mainWindow.keeFoxInst._KFLog.error("We seem to have forgetton where KeePass is installed!");
        showSection('ERRORInstallButtonMain');
    } else
    {
        showProgressView();
        showSection('IC3installing');
      
        if (!copyKeePassRPCFilesTo(keePassLocation))
        {
            hideSection('IC3installing');
            showSection('ERRORInstallButtonMain');
            return;
        }
  
        hideSection('IC3installing');
        showSection('InstallFinished');
        launchAndConnectToKeePass();
    }
}


/*
 IC5 (and IC2 tertiary)
 test to see if KeePass is installed in specified location,
 if it isn't, extract the portable zip file there
 then in either case we will copy the KeePassRPC files into the plugin folder
 */
function copyKPToSpecificLocationInstall()
{
    // Cancel any automatically started downloads
    try {
        persist.cancelSave();
    }
    catch (ex) { // being a bit lazy - don't understand what might cause this call to fail so playing it safe
    }
    
    // start the download if it hasn't already been done
    if (!(installState & KF_INSTALL_STATE_KPZIP_DOWNLOADING) 
        && !(installState & KF_INSTALL_STATE_KPZIP_DOWNLOADED))
    {
        installState |= KF_INSTALL_STATE_KPZIP_DOWNLOADING | KF_INSTALL_STATE_KRPC_DOWNLOADED;
        persist = mainWindow.KFdownloadFile("IC5PriDownload",
            KF_KPZIP_DOWNLOAD_PATH + KF_KPZIP_FILE_NAME,
            KF_KPZIP_SAVE_NAME, mainWindow, window, persist);
    }
    
    hideInstallView();
    showProgressView();
    
    showSection('IC5zipKPdownloading');
 
    // call this now and let it decide if it is the right time to run
    // the installer or wait until it's called again by progress listener
    installState |= KF_INSTALL_STATE_SELECTED_TER; // mini-cheat: this state
        // is also applied even when the true state is IC5 primary
        // but this is the quick way to identify this varient of the installation
    
    IC5zipKP(mainWindow);
}


/*
 IC1 and IC4
 run (with admin rights escalation) the .NET 3.5 installer 
 */
function setupNET35ExeInstall()
{
    // Cancel any automatically started downloads
    try {
        persist.cancelSave();
    }
    catch (ex) { // being a bit lazy - don't understand what might cause this call to fail so playing it safe
    }
    
    installState = KF_INSTALL_STATE_NET35_DOWNLOADING | KF_INSTALL_STATE_KRPC_DOWNLOADED;
            persist = mainWindow.KFdownloadFile("IC1SecDownload",
                KF_NET35_DOWNLOAD_PATH + KF_NET35_FILE_NAME,
                KF_NET35_FILE_NAME, mainWindow, window, persist);
    hideInstallView();
    showProgressView();
    
    showSection('IC1setupNET35downloading');
 
    // call this now and let it decide if it is the right time to run
    // the installer or wait until it's called again by progress listener
    installState |= KF_INSTALL_STATE_SELECTED_SEC;
    
    // we just call IC1 straight away since we currently treat
    // IC1 and IC4 as the same situation
    IC1setupNET35(mainWindow);
}


/*
 (IC2 secondary and IC5 secondary)
 run (with admin rights escalation) the keepass 2.x exe installer
 and copy the KeePassRPC.plgx file into place
 */
function KPsetupExeInstall()
{
    hideInstallView();
    showProgressView();
    
    if (installState & KF_INSTALL_STATE_KP_DOWNLOADING)
        showSection('IC2setupKPdownloading');
 
    // call this now and let it decide if it is the right time to run
    // the installer or wait until it's called again by progress listener
    installState |= KF_INSTALL_STATE_SELECTED_SEC;
    IC2setupCustomKP(mainWindow);
}

/********************
END:
functions initiated by user choice in UI
********************/



/********************
START:
utility functions
********************/
function launchAndConnectToKeePass()
{
    // Tell KeeFox that KeePassRPC has been installed so it will reguarly
    // attempt to connect to KeePass when the timer goes off.
    var Application = Components.classes["@mozilla.org/fuel/application;1"]
        .getService(Components.interfaces.fuelIApplication);
    var keeFoxStorage = mainWindow.keeFoxInst._keeFoxExtension.storage;

    keeFoxStorage.set("KeePassRPCInstalled", true);
    
    if (mainWindow.keeFoxInst.KeePassRPC.reconnectTimer != null)
        mainWindow.keeFoxInst.KeePassRPC.reconnectTimer.cancel();
    
    mainWindow.keeFoxInst.KeePassRPC.reconnectVerySoon();
    
    // launch KeePass and then try to connect to KeePassRPC
    mainWindow.keeFoxInst.launchKeePass();
}

function userHasAdminRights(mainWindow)
{
    var isAdmin;
    isAdmin = false;

    isAdmin = mainWindow.keeFoxInst.IsUserAdministrator();
    if (isAdmin)
    {
        mainWindow.KFLog.info("User has administrative rights");
        return true;
    } else
    {
        mainWindow.KFLog.info("User does not have administrative rights");
        return false;
    }
}

function checkDotNetFramework(mainWindow)
{
    var dotNetFrameworkFound;
    dotNetFrameworkFound = false;
      
    // platform is a string with one of the following values: "Win32",
    // "Linux i686", "MacPPC", "MacIntel", or other.
    if (window.navigator.platform == "Win32")
    {
        var wrk = Components.classes["@mozilla.org/windows-registry-key;1"]
            .createInstance(Components.interfaces.nsIWindowsRegKey);
        wrk.open(wrk.ROOT_KEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft",
            wrk.ACCESS_READ);
        if (wrk.hasChild(".NETFramework"))
        {
            var subkey = wrk.openChild(".NETFramework", wrk.ACCESS_READ);
            if (subkey.hasChild("policy"))
            {
                var subkey2 = subkey.openChild("policy", subkey.ACCESS_READ);
                if (subkey2.hasChild("v2.0"))
                {
                    var subkey3 = subkey2.openChild("v2.0", subkey2.ACCESS_READ);
                    if (subkey3.hasValue("50727"))
                    {
                        if (subkey3.readStringValue("50727") == "50727-50727")
                        {
                            dotNetFrameworkFound = true;
                            mainWindow.KFLog.info(".NET framework has been found");
                        }
                    }
                    subkey3.close();
                }
                subkey2.close();
            }
            subkey.close();
        }
        wrk.close();
    }
    return dotNetFrameworkFound;
}

// Even admins can't make changes to the Program Files directory on
// Windows Vista / 7 so this function will increasingly become
// useless... might as well at least try it though
function copyKeePassRPCFilesTo(keePassLocation)
{
    var removeExistingPluginFailed = true;
    removeExistingPluginFailed = false;
    var destFolder = Components.classes["@mozilla.org/file/local;1"]
    .createInstance(Components.interfaces.nsILocalFile);
    destFolder.initWithPath(keePassLocation);
    destFolder.append("plugins");
    
    var destFileKeePassRPC = Components.classes["@mozilla.org/file/local;1"]
    .createInstance(Components.interfaces.nsILocalFile);
    destFileKeePassRPC.initWithPath(keePassLocation);
    destFileKeePassRPC.append("plugins");
    destFileKeePassRPC.append("KeePassRPC.plgx");
    
    try
    {
        if (!destFolder.exists())
            destFolder.create(destFolder.DIRECTORY_TYPE, 0775);
        var KeePassRPCfile = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
        KeePassRPCfile.initWithPath(mainWindow.keeFoxInst._myDepsDir());
        KeePassRPCfile.append("KeePassRPC.plgx");
        if (destFileKeePassRPC.exists())
        {
            removeExistingPluginFailed = true;
            destFileKeePassRPC.remove(false);
            removeExistingPluginFailed = false;
        }
        KeePassRPCfile.copyTo(destFolder,"");
    } catch (ex)
    {
        mainWindow.keeFoxInst._KFLog.error(ex);
    }

    var KeePassRPCfound;
    
    var keePassRPCLocation;
    try
    {
        keePassRPCLocation = "not installed";
        keePassRPCLocation = mainWindow.keeFoxInst._discoverKeePassRPCInstallLocation(); // this also stores the preference
        KeePassRPCfound = mainWindow.keeFoxInst._confirmKeePassRPCInstallLocation(keePassRPCLocation);
    } catch (ex)
    {
        mainWindow.keeFoxInst._KFLog.error(ex);
    }
    
    // if we can't find KeePassRPC, it was probably not copied because of
    // a permissions fault so lets try a fully escalated executable
    // to get it put into place
    if (!KeePassRPCfound || removeExistingPluginFailed)
    {
        mainWindow.keeFoxInst._keeFoxExtension.prefs.setValue("keePassRPCInstalledLocation","");
        runKeePassRPCExecutableInstaller(keePassLocation);
        keePassRPCLocation = "not installed";

        keePassRPCLocation = mainWindow.keeFoxInst._discoverKeePassRPCInstallLocation(); // this also stores the preference
        KeePassRPCfound = mainWindow.keeFoxInst._confirmKeePassRPCInstallLocation(keePassRPCLocation);
        
        // still not found! Have to give up :-(
        if (!KeePassRPCfound)
        {
            mainWindow.keeFoxInst._keeFoxExtension.prefs.setValue("keePassRPCInstalledLocation","");
            var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
            promptService.alert(mainWindow,"Something went wrong","Sorry, KeeFox could not automatically install the KeePassRPC"
                + " plugin for KeePass Password Safe 2, which is required for KeeFox to function."
                + " This is usually becuase you are trying to install to a location into which you are"
                + " not permitted to add new files. You may be able to restart Firefox and"
                + " try the installation again choosing different options or you could ask your"
                + " computer administrator for assistance."); 
            return false;          
        }
    }
    return true;
}

function runKeePassRPCExecutableInstaller(keePassLocation)
{
    var destFolder = Components.classes["@mozilla.org/file/local;1"]
    .createInstance(Components.interfaces.nsILocalFile);
    destFolder.initWithPath(keePassLocation);
    destFolder.append("plugins");
    
    var file = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(mainWindow.keeFoxInst._myDepsDir());
        file.append(KF_KRPC_FILE_NAME);

    mainWindow.keeFoxInst.runAnInstaller(file.path, '"'
        + mainWindow.keeFoxInst._myDepsDir() + '" "' + destFolder.path + '"');
}

// TODO2: would be nice if this could go in a seperate
// thread but my guess is that would be masochistic
// in the mean time I've tried sticking some
// thread.processNextEvent calls in at strategic points...
// TODO2: revisit threaded approach now that we can
// rely on FF 3.5 thread workers to simplify things
// TODO2: ... or not, if FF4 has removed the required features!
function extractKPZip (zipFilePath, storeLocation)
{
    var zipFile = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
        zipFile.initWithPath(mainWindow.keeFoxInst._myDepsDir());

        zipFile.append(zipFilePath);
        
    var thread = Components.classes["@mozilla.org/thread-manager;1"]
                        .getService(Components.interfaces.nsIThreadManager)
                        .currentThread;

    var zipReader = Components.classes["@mozilla.org/libjar/zip-reader;1"]
                     .createInstance(Components.interfaces.nsIZipReader);
    zipReader.open(zipFile);
    
    // create directories first
    var entries = zipReader.findEntries("*/");
    while (entries.hasMore())
    {
        thread.processNextEvent(true); // should this be false instead?
        var entryName = entries.getNext();
        var target = getItemFile(entryName);
        if (!target.exists())
        {
            try
            {
                target.create(Components.interfaces.nsILocalFile.DIRECTORY_TYPE, 0744);
            }
            catch (e)
            {
                var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
                promptService.alert("Installation failure. Could not extract the KeePass Password"
                    + " Safe 2 files. More information: Failed to create target directory for"
                    + "extraction file = " + target.path + ", exception = " + e + "\n");
            }
        }
    }

    entries = zipReader.findEntries(null);
    while (entries.hasMore())
    {
        var entryName = entries.getNext();
        target = getItemFile(entryName);
        if (target.exists())
            continue;

        thread.processNextEvent(true); // should this be false instead?

        try
        {
            target.create(Components.interfaces.nsILocalFile.NORMAL_FILE_TYPE, 0744);
            //TODO2: different permissions for special files on linux. e.g. 755
            // for main executable? not sure how it works with Mono though
            // so needs much more reading...
        }
        catch (e)
        {
            var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
                promptService.alert("Installation failure. Could not extract the KeePass"
                    + " Password Safe 2 files. More information: Failed to create target"
                    + " file for extraction "
                    + " file = " + target.path + ", exception = " + e + "\n");
        }
        zipReader.extract(entryName, target);
    }
    zipReader.close();    

    function getItemFile(filePath)
    {
        var itemLocation = storeLocation.clone();
        var parts = filePath.split("/");
        for (var i = 0; i < parts.length; ++i)
          itemLocation.append(parts[i]);
        return itemLocation;
    }
}

/********************
END:
utility functions
********************/
