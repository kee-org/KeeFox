/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
Copyright 2008-2015 Chris Tomlinson <keefox@christomlinson.name>
  
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
"use strict";

var KF_KPZIP_DOWNLOAD_PATH = "https://downloads.sourceforge.net/project/keepass/KeePass%202.x/2.35/";
var KF_KPZIP_FILE_NAME = "KeePass-2.35.zip?r=&ts=";
var KF_KPZIP_SAVE_NAME = "KeePass-2.35.zip";
var KF_KPZIP_FILE_CHECKSUM = "15e642262cef0ee583ff40a9e8f49a6f";
var KF_KP_DOWNLOAD_PATH = "https://downloads.sourceforge.net/project/keepass/KeePass%202.x/2.35/";
var KF_KP_FILE_NAME = "KeePass-2.35-Setup.exe?r=&ts=";
var KF_KP_SAVE_NAME = "KeePass-2.35-Setup.exe";
var KF_KP_FILE_CHECKSUM = "39452f91e52307455d0907fa8bcc2109";
var KF_NET_DOWNLOAD_PATH = "https://download.microsoft.com/download/B/4/1/B4119C11-0423-477B-80EE-7A474314B347/";
var KF_NET_FILE_NAME = "NDP452-KB2901954-Web.exe";
var KF_NET_FILE_CHECKSUM = "ca41dba55a727f01104871b160cd5b1d";
var KF_KRPC_FILE_NAME = "KeePassRPCCopier.exe";

var KF_INSTALL_STATE_SELECTED_PRI = 1; // user has asked to run default installation routine
var KF_INSTALL_STATE_NET_DOWNLOADING = 2;
var KF_INSTALL_STATE_NET_DOWNLOADED = 4;
var KF_INSTALL_STATE_NET_EXECUTING = 8;
var KF_INSTALL_STATE_NET_EXECUTED = 16; // .NET installer has been executed or .NET was already installed
var KF_INSTALL_STATE_KP_DOWNLOADING = 32;
var KF_INSTALL_STATE_KP_DOWNLOADED = 64;
var KF_INSTALL_STATE_KP_EXECUTING = 128;
var KF_INSTALL_STATE_KP_EXECUTED = 256;  // KeePass installer has been executed or KeePass was already installed
var KF_INSTALL_STATE_KRPC_DOWNLOADING = 512;
var KF_INSTALL_STATE_KRPC_DOWNLOADED = 1024; // KeePassRPC files have been downloaded (actually we will bundle them with XPI for time being at least)
var KF_INSTALL_STATE_KRPC_EXECUTING = 2048; // KeePassRPC files are being copied
var KF_INSTALL_STATE_KRPC_EXECUTED = 4096;  // KeePassRPC files have been copied

var KF_INSTALL_STATE_SELECTED_SEC = 8192; // user has asked to run secondary installation routine
var KF_INSTALL_STATE_SELECTED_TER = 16384; // user has asked to run tertiary installation routine
var KF_INSTALL_STATE_KPZIP_DOWNLOADING = 524288;
var KF_INSTALL_STATE_KPZIP_DOWNLOADED = 1048576;
var KF_INSTALL_STATE_KPZIP_EXECUTING = 2097152;
var KF_INSTALL_STATE_KPZIP_EXECUTED = 4194304;  // KeePass zip has been extracted

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

var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIWebNavigation)
.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
.rootTreeItem
.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIDOMWindow);

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

    let downgradeWarning = "desc_Install_monoManualDowngradeWarning";
    if (args.upgrade == "1")
    {
        KFupgradeMode = true;
        mainWindow.keefox_org._KFLog.debug("Install system starting in upgrade mode");
        if (args.downWarning == "1" && args.currentKPRPCv && args.newKPRPCv)
        {
            document.getElementById('desc_Install_ManualDowngradeWarning').setAttribute('hidden', false);
            downgradeWarning = ['desc_Install_ManualDowngradeWarning', [args.newKPRPCv,args.currentKPRPCv]];
        }
    }
    else
    {
        mainWindow.keefox_org._KFLog.debug("Install system starting in install mode");
    }

    mainWindow.keefox_org.locale.internationaliseElements(document,
    ['KeeFoxInstallWizard', 'KFInstallPageTitle', 'desc_KFInstallAlreadyInProgress', 'desc_KFInstallNotRequired', 'lab_KFInstallNotRequired',
    'desc_ERRORInstallButtonMain','desc_ERRORInstallDownloadFailed','desc_ERRORInstallDownloadChecksumFailed','desc_ERRORInstallDownloadCanceled',
    'but_restartInstallationOption','desc_installationFoundWarning','but_setupExeInstallButtonMain','but_KPsetupExeSilentInstallButtonMain',
    'but_copyKRPCToKnownKPLocationInstallButtonMain','but_copyKPToSpecificLocationInstallButtonMain','desc_copyKRPCToKnownKPLocationUpgradeButtonMain',
    'but_copyKRPCToKnownKPLocationUpgradeButtonMain','setupNET35ExeInstallExpandeeOverview','setupNET35ExeInstallExpandeeKeePass',
    'setupNET35ExeInstallExpandeeManual','setupNET35ExeInstallExpandeeManualStep1','setupNET35ExeInstallExpandeeManualStep2',
    'setupNET35ExeInstallExpandeeManualStep3','setupNET35ExeInstallExpandeeManualStep4','desc_adminSetupKPInstallExpander',
    'adminSetupKPInstallExpanderButton','desc_admincopyKRPCToKnownKPLocationInstallExpander','desc_nonAdminSetupKPInstallExpander',
    'desc_nonAdmincopyKRPCToKnownKPLocationInstallExpander','nonAdmincopyKRPCToKnownKPLocationInstallExpanderButton',
    'desc_adminSetupKPInstallExpandee','but_KPsetupExeInstallButton','desc_adminSetupKPInstallExpandee2','but_copyKPToSpecificLocationInstallButton',
    'desc_nonAdminSetupKPInstallExpandee','but_KPsetupExeSilentInstallButton','but_KPsetupExeInstallButton',
    'desc_nonAdmincopyKRPCToKnownKPLocationInstallExpandee','but_nonAdmincopyKRPCToKnownKPLocationInstallButton','desc_IC1setupNETdownloading',
    'but_IC1setupNETdownloading','desc_IC1setupNETdownloaded','desc_IC1setupKPdownloading','but_IC1setupKPdownloading','desc_IC1setupKPdownloaded',
    'desc_IC1KRPCdownloaded','desc_IC2setupKPdownloading','but_IC2setupKPdownloading','desc_IC2setupKPdownloaded','desc_IC2KRPCdownloaded',
    'desc_IC3installing','desc_IC5zipKPdownloading','lab_IC5zipKPdownloading','desc_IC5zipKPdownloaded','desc_IC5installing',
    'desc_InstallFinished', 'nextStepsIntro', 'desc_nextStep1', 'nextStepsTutorialLink', 'nextStepsImportLink', 'nextStepsFinally',
    'KFInstallPageTitle_description', downgradeWarning, 'desc_netUpgradeRequired', 'desc_netUpgradeRequired_XP', 'desc_netUpgradeRequired_KeePass',
    'desc_UpgradeFinished', 'nextStepsUpgradeFinally'
    ],
    ['title', 'label', 'tooltiptext', 'accesskey', 'value']);
        
    // One of 9 installation options. The user only needs to see information relevant
    // to their starting state.
    var installCase; 
    
    var keePassLocation = "not installed";

    // prevent reinstallation if KeeFox is already working
    if (mainWindow.keefox_org._keeFoxStorage.get("KeePassRPCActive", false))
    {
        document.getElementById('KFInstallNotRequired').setAttribute('hidden', false);
        resetInstallation();
        return;
    }
    
    // only let this install script run once per firefox session unless user cancels it
    if (mainWindow.keefox_org._keeFoxStorage.get("KFinstallProcessStarted", false))
    {
        document.getElementById('KFInstallAlreadyInProgress').setAttribute('hidden', false);
        showSection('restartInstallationOption');
        return;
    }
    mainWindow.keefox_org._keeFoxStorage.set("KFinstallProcessStarted",true);

    if (mainWindow.keefox_org._keeFoxExtension.prefs.has("keePassInstalledLocation")) {
        keePassLocation = mainWindow.keefox_org._keeFoxExtension.prefs.getValue("keePassInstalledLocation", "not installed");
        if (keePassLocation == "")
            keePassLocation = "not installed";
        if (!KFupgradeMode && keePassLocation != "not installed")
            showSection('installationFoundWarning');
    }

    // Special case for users that are upgrading to a version of KeeFox that indirectly depends on .NET 4.0 or higher. 
    // Older versions of KeeFox were satisfied by .NET 2.0 but now the checkDotNetFramework
    // could return false even if KeePass is installed.
    // This will also trigger if the user has uninstalled .NET since installing KeeFox but that
    // probably won't ever happen (and the need for manual resolution of that problem is identical anyway)
    if (KFupgradeMode && keePassLocation != "not installed" && !checkDotNetFramework(mainWindow)) {
        installCase = 9;
    } else {
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
    }

    mainWindow.keefox_win.Logger.info("applying installation case " + installCase);
 
    // comment this out to enable normal operation or uncomment to specify a test case
    //installCase = 5; mainWindow.keefox_win.Logger.warn("Overriding with installation case " + installCase);

// configure the current installation state and trigger any relevant pre-emptive file
// downloads to keep the end user experience as fast as possible
    switch (installCase)
    {
        case 1:
            showSection('setupExeInstallButtonMain');
            showSection('setupNET35ExeInstallExpandee');
            installState = KF_INSTALL_STATE_NET_DOWNLOADING | KF_INSTALL_STATE_KRPC_DOWNLOADED;
            persist = mainWindow.keefox_win.KFdownloadFile("IC1PriDownload",
                KF_NET_DOWNLOAD_PATH + KF_NET_FILE_NAME, KF_NET_FILE_NAME, mainWindow, window, persist);
            break;
        case 2: 
            showSection('KPsetupExeSilentInstallButtonMain');
            showSection('adminSetupKPInstallExpander');
            installState = KF_INSTALL_STATE_NET_EXECUTED 
                | KF_INSTALL_STATE_KP_DOWNLOADING | KF_INSTALL_STATE_KRPC_DOWNLOADED;
                var d = new Date();
            persist = mainWindow.keefox_win.KFdownloadFile("IC2PriDownload",
                KF_KP_DOWNLOAD_PATH + KF_KP_FILE_NAME + Math.round((d.getTime()/1000)-10), KF_KP_SAVE_NAME, mainWindow, window, persist);
            break;
        case 3: 
            showSection('copyKRPCToKnownKPLocationInstallButtonMain');            
            showSection('admincopyKRPCToKnownKPLocationInstallExpander');
            installState = KF_INSTALL_STATE_NET_EXECUTED | KF_INSTALL_STATE_KP_EXECUTED 
                | KF_INSTALL_STATE_KRPC_DOWNLOADED;
            break;
        case 4: 
            showSection('setupExeInstallButtonMain');
            //showSection('nonAdminNETInstallExpander');
            installState = KF_INSTALL_STATE_NET_DOWNLOADING | KF_INSTALL_STATE_KRPC_DOWNLOADED;
            persist = mainWindow.keefox_win.KFdownloadFile("IC1PriDownload",
                KF_NET_DOWNLOAD_PATH + KF_NET_FILE_NAME, KF_NET_FILE_NAME, mainWindow, window, persist);
                // using IC1 since same process is followed from now on...
            break;
        case 5: 
            showSection('copyKPToSpecificLocationInstallButtonMain'); 
            showSection('nonAdminSetupKPInstallExpander');
            installState = KF_INSTALL_STATE_NET_EXECUTED | KF_INSTALL_STATE_KPZIP_DOWNLOADING 
                | KF_INSTALL_STATE_KRPC_DOWNLOADED;
            var d = new Date();
            persist = mainWindow.keefox_win.KFdownloadFile("IC5PriDownload",
                KF_KPZIP_DOWNLOAD_PATH + KF_KPZIP_FILE_NAME + Math.round((d.getTime()/1000)-10), KF_KPZIP_SAVE_NAME, mainWindow, window, persist);
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
            //TODO:2:? update 7 and 8 to show Upgrade text, etc.  
        case 9:
            showSection('netUpgradeRequired');
            break;
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
    mainWindow.keefox_org._keeFoxStorage.set("KFinstallProcessStarted",false);
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
mainWindow.keefox_win.Logger.error("File checksum failed. Download corrupted?");
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

            keePassLocation = mainWindow.keefox_org.utils._discoverKeePassInstallLocation();
            if (keePassLocation != "not installed")
            {
                KeePassEXEfound = mainWindow.keefox_org.utils._confirmKeePassInstallLocation(keePassLocation);
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
        mainWindow.keefox_org._KFLog.error(err);
    }
}

function IC1setupKP(mainWindow)
{
    try
    {
        if ((installState & KF_INSTALL_STATE_KP_DOWNLOADED) 
            && (installState & KF_INSTALL_STATE_NET_EXECUTED))
        {
            if (installState & KF_INSTALL_STATE_NET_EXECUTED)
                hideSection('IC1setupNETdownloaded');
                
            var checkTest = mainWindow.keefox_win.KFMD5checksumVerification(KF_KP_SAVE_NAME,KF_KP_FILE_CHECKSUM);
            
            hideSection('IC1setupKPdownloading'); // if applicable (probably this was never shown)
            if (checkTest)
                mainWindow.keefox_win.Logger.info("File checksum succeeded.");
            else
            {
                checksumFailed();
                return;
            }            
            showSection('IC1setupKPdownloaded');
            
            var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
            file.initWithFile(mainWindow.keefox_org.utils.myProfileDir());
            file.append(KF_KP_SAVE_NAME);            

            installState |= KF_INSTALL_STATE_KP_EXECUTING;

            mainWindow.keefox_org.runAnInstaller(file.path,"/silent",
                {
                    observe : function () {
                        var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIWebNavigation)
                            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                            .rootTreeItem
                            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIDOMWindow);
                        var kth = new mainWindow.KeeFoxMainThreadHandler("executableInstallerRunner", "IC1KPSetupFinished", '', mainWindow, window);
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
        mainWindow.keefox_org._KFLog.error(err);
    }    
}

function IC1setupNET(mainWindow)
{
    try
    {
        if ((installState & KF_INSTALL_STATE_NET_DOWNLOADED)
            && (installState & KF_INSTALL_STATE_SELECTED_PRI))
        {
            var checkTest = mainWindow.keefox_win.KFMD5checksumVerification(KF_NET_FILE_NAME,KF_NET_FILE_CHECKSUM);
            
            hideSection('IC1setupNETdownloading');
            if (checkTest)
                mainWindow.keefox_win.Logger.info("File checksum succeeded.");
            else
            {
                checksumFailed();
                return;
            }            
            showSection('IC1setupNETdownloaded');
            
            // start the pre-download of the KeePass setup file (while user installs .Net...)
            installState |= KF_INSTALL_STATE_KP_DOWNLOADING;
            var d = new Date();
            persist = mainWindow.keefox_win.KFdownloadFile("IC1PriDownload",
                KF_KP_DOWNLOAD_PATH + KF_KP_FILE_NAME + Math.round((d.getTime()/1000)-10), KF_KP_SAVE_NAME, mainWindow, window, persist);
            
            installState |= KF_INSTALL_STATE_NET_EXECUTING;

            var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
            file.initWithFile(mainWindow.keefox_org.utils.myProfileDir());
            file.append(KF_NET_FILE_NAME);
                                
            mainWindow.keefox_org.runAnInstaller(file.path,"", 
                {
                    observe : function () {
                        var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIWebNavigation)
                            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                            .rootTreeItem
                            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIDOMWindow);
                        var kth = new mainWindow.KeeFoxMainThreadHandler("executableInstallerRunner", "IC1NETSetupFinished", '', mainWindow, window);
                        kth.run(); 
                    }
                }
            );           
        }
    } catch (err) {
        mainWindow.keefox_org._KFLog.error(err);
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

//TODO:2: customise this for upgrades?)

    hideSection('IC2KRPCdownloaded');
    let upgrade = KFupgradeMode !== undefined ? KFupgradeMode : this.KFupgradeMode;
    upgrade ? showSection('UpgradeFinished') : showSection('InstallFinished');
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

            keePassLocation = mainWindow.keefox_org.utils._discoverKeePassInstallLocation();
            if (keePassLocation != "not installed")
            {
                KeePassEXEfound = mainWindow.keefox_org.utils._confirmKeePassInstallLocation(keePassLocation);
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
        mainWindow.keefox_org._KFLog.error(err);
    }
}

function IC2setupKP(mainWindow)
{
    try
    {
        if ((installState & KF_INSTALL_STATE_KP_DOWNLOADED)
            && (installState & KF_INSTALL_STATE_SELECTED_PRI))
        {
            var checkTest = mainWindow.keefox_win.KFMD5checksumVerification(KF_KP_SAVE_NAME,KF_KP_FILE_CHECKSUM);
            
            hideSection('IC2setupKPdownloading'); // if applicable
            if (checkTest)
                mainWindow.keefox_win.Logger.info("File checksum succeeded.");
            else
            {
                checksumFailed();
                return;
            }            
            showSection('IC2setupKPdownloaded');

            installState |= KF_INSTALL_STATE_KP_EXECUTING;

            var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
            file.initWithFile(mainWindow.keefox_org.utils.myProfileDir());
            file.append(KF_KP_SAVE_NAME);
            
            mainWindow.keefox_org.runAnInstaller(file.path,"/silent",
                {
                    observe : function () {
                        var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIWebNavigation)
                            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                            .rootTreeItem
                            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIDOMWindow);
                        var kth = new mainWindow.KeeFoxMainThreadHandler("executableInstallerRunner", "IC2KPSetupFinished", '', mainWindow, window);
                        kth.run(); 
                    }
                }
            );
            
        } else if (installState & KF_INSTALL_STATE_KP_DOWNLOADING)
        {
            showSection('IC2setupKPdownloading');
        }
    } catch (err) {
        mainWindow.keefox_org._KFLog.error(err);
    }    
}

function IC2setupCustomKP(mainWindow)
{
    try
    {
        if ((installState & KF_INSTALL_STATE_KP_DOWNLOADED)
            && (installState & KF_INSTALL_STATE_SELECTED_SEC))
        {
            var checkTest = mainWindow.keefox_win.KFMD5checksumVerification(KF_KP_SAVE_NAME,KF_KP_FILE_CHECKSUM);
            
            hideSection('IC2setupKPdownloading'); // if applicable (probably this was never shown)
            if (checkTest)
                mainWindow.keefox_win.Logger.info("File checksum succeeded.");
            else
            {
                checksumFailed();
                return;
            }            
            showSection('IC2setupKPdownloaded');

            installState |= KF_INSTALL_STATE_KP_EXECUTING;

            var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
            file.initWithFile(mainWindow.keefox_org.utils.myProfileDir());
            file.append(KF_KP_SAVE_NAME);
            
            mainWindow.keefox_org.runAnInstaller(file.path,"",
                {
                    observe : function () {
                        var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIWebNavigation)
                            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                            .rootTreeItem
                            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIDOMWindow);
                        var kth = new mainWindow.KeeFoxMainThreadHandler("executableInstallerRunner", "IC2KPSetupFinished", '', mainWindow, window);
                        kth.run(); 
                    }
                }
            );
            
        } else if (installState & KF_INSTALL_STATE_KP_DOWNLOADING)
        {
            showSection('IC2setupKPdownloading');
        }
    } catch (err) {
        mainWindow.keefox_org._KFLog.error(err);
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
 //TODO:2: rearrange this install process so that the folder is chosen
 // first (before download - or during?) just in case user cancels
 // first (so minimal bandwidth wasted)
function IC5zipKP()
{
    if ((installState & KF_INSTALL_STATE_KPZIP_DOWNLOADED)
        && (installState & KF_INSTALL_STATE_SELECTED_TER))
    {
        var checkTest = mainWindow.keefox_win.KFMD5checksumVerification(KF_KPZIP_SAVE_NAME, KF_KPZIP_FILE_CHECKSUM);
        
        hideSection('IC5zipKPdownloading');
        if (checkTest)
            mainWindow.keefox_win.Logger.info("File checksum succeeded.");
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
            
            mainWindow.keefox_org._keeFoxExtension.prefs
                .setValue("keePassInstalledLocation",path+"\\");
                    //TODO:2: probably should store the file object
                    // itself rather than string version (X-Plat)
            KeePassEXEfound = mainWindow.keefox_org.utils._confirmKeePassInstallLocation(path+"\\");
            mainWindow.keefox_win.Logger.info("KeePass install location set to: " + path+"\\");
            if (!KeePassEXEfound)
            {
                //TODO:2: permissions, failures, missing directories, etc. etc.
                extractKPZip (KF_KPZIP_SAVE_NAME, folder);
                       
                mainWindow.keefox_org._keeFoxExtension.prefs
                    .setValue("keePassInstalledLocation",path+"\\");
                        //TODO:2: probably should store the file object
                        // itself rather than string version (X-Plat)
                KeePassEXEfound = mainWindow.keefox_org.utils._confirmKeePassInstallLocation(path+"\\");
                mainWindow.keefox_win.Logger.info("KeePass install location set to: " + path+"\\");
                if (!KeePassEXEfound)
                {
                    mainWindow.keefox_org._keeFoxExtension.prefs.setValue("keePassInstalledLocation","");
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
 TODO:2: detect access denied failures and prompt user accordingly
 (this could happen if an admin installed KeePass at an earlier time)
 */
function copyKRPCToKnownKPLocationInstall()
{
    hideInstallView();
    
    let keePassLocation = mainWindow.keefox_org._keeFoxExtension.prefs
                    .getValue("keePassInstalledLocation", "not installed");

    if (keePassLocation == "not installed")
    {
        mainWindow.keefox_org._KFLog.error("We seem to have forgetton where KeePass is installed!");
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
        let upgrade = KFupgradeMode !== undefined ? KFupgradeMode : this.KFupgradeMode;
        upgrade ? showSection('UpgradeFinished') : showSection('InstallFinished');
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
        var d = new Date();
        persist = mainWindow.keefox_win.KFdownloadFile("IC5PriDownload",
            KF_KPZIP_DOWNLOAD_PATH + KF_KPZIP_FILE_NAME + Math.round((d.getTime()/1000)-10),
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
    
    var keeFoxStorage = mainWindow.keefox_org._keeFoxExtension.storage;

    keeFoxStorage.set("KeePassRPCInstalled", true);
    
    if (mainWindow.keefox_org.KeePassRPC.reconnectTimer != null)
        mainWindow.keefox_org.KeePassRPC.reconnectTimer.cancel();
    
    mainWindow.keefox_org.KeePassRPC.reconnectVerySoon();
    
    // launch KeePass and then try to connect to KeePassRPC
    mainWindow.keefox_org.launchKeePass();
}

function userHasAdminRights(mainWindow)
{
    var isAdmin;
    isAdmin = false;

    isAdmin = mainWindow.keefox_org.utils.IsUserAdministrator();
    if (isAdmin)
    {
        mainWindow.keefox_win.Logger.info("User has administrative rights");
        return true;
    } else
    {
        mainWindow.keefox_win.Logger.info("User does not have administrative rights");
        return false;
    }
}

// determine if .NET framework version 4 is installed
function checkDotNetFramework(mainWindow)
{
    var dotNetFrameworkFound;
    dotNetFrameworkFound = false;
      
    // platform is a string with one of the following values: "Win32",
    // "Linux i686", "MacPPC", "MacIntel", or other.
    if (window.navigator.platform == "Win32" || window.navigator.platform == "Win64")
    {
        var wrk = Components.classes["@mozilla.org/windows-registry-key;1"]
            .createInstance(Components.interfaces.nsIWindowsRegKey);
        wrk.open(wrk.ROOT_KEY_LOCAL_MACHINE, "",
            wrk.ACCESS_READ);
             
        if (wrk.hasChild("Software"))
        {
            var subkey = wrk.openChild("Software", wrk.ACCESS_READ);
            if (subkey.hasChild("Microsoft"))
            {
                var subkey2 = subkey.openChild("Microsoft", subkey.ACCESS_READ);
                if (subkey2.hasChild("NET Framework Setup"))
                {
                    var subkey3 = subkey2.openChild("NET Framework Setup", subkey2.ACCESS_READ);
                    if (subkey3.hasChild("NDP"))
                    {
                        var subkey4 = subkey3.openChild("NDP", subkey3.ACCESS_READ);
                        if (subkey4.hasChild("v4"))
                        {
                            var subkey4b = subkey4.openChild("v4", subkey4.ACCESS_READ);
                            if (subkey4b.hasChild("Client"))
                            {
                                var subkey4b1 = subkey4b.openChild("Client", subkey4b.ACCESS_READ);
                                if (subkey4b1.hasValue("Install"))
                                {
                                    if (subkey4b1.readIntValue("Install") == 1)
                                    {
                                        dotNetFrameworkFound = true;
                                        mainWindow.keefox_win.Logger.info(".NET framework has been found");
                                    }
                                }
                                subkey4b1.close();
                            }
                            if (subkey4b.hasChild("Full"))
                            {
                                var subkey4b2 = subkey4b.openChild("Full", subkey4b.ACCESS_READ);
                                if (subkey4b2.hasValue("Install"))
                                {
                                    if (subkey4b2.readIntValue("Install") == 1)
                                    {
                                        dotNetFrameworkFound = true;
                                        mainWindow.keefox_win.Logger.info(".NET framework has been found");
                                    }
                                }
                                subkey4b2.close();
                            }
                            subkey4b.close();
                        }
                        subkey4.close();
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

function copyKeePassRPCFilesTo(keePassLocation)
{
    var KeePassRPCfound;
    var keePassRPCLocation;
    
    // We have to use a fully escalated executable to get the plgx file into place
    mainWindow.keefox_org._keeFoxExtension.prefs.setValue("keePassRPCInstalledLocation","");
    runKeePassRPCExecutableInstaller(keePassLocation);
    keePassRPCLocation = "not installed";

    keePassRPCLocation = mainWindow.keefox_org.utils._discoverKeePassRPCInstallLocation(); // this also stores the preference
    KeePassRPCfound = mainWindow.keefox_org.utils._confirmKeePassRPCInstallLocation(keePassRPCLocation);
        
    // still not found! Have to give up :-(
    if (!KeePassRPCfound)
    {
        mainWindow.keefox_org._keeFoxExtension.prefs.setValue("keePassRPCInstalledLocation","");
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                    .getService(Components.interfaces.nsIPromptService);
        promptService.alert(mainWindow, mainWindow.keefox_org.locale.$STR("install.somethingsWrong"),mainWindow.keefox_org.locale.$STR("install.KPRPCNotInstalled")); 
        return false;
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
        file.initWithPath(mainWindow.keefox_org.utils.myDepsDir());
        file.append(KF_KRPC_FILE_NAME);

    mainWindow.keefox_org.runAnInstaller(file.path, '"'
        + mainWindow.keefox_org.utils.myDepsDir() + '" "' + destFolder.path + '"');
}

// TODO:2: would be nice if this could go in a seperate
// thread
// TODO:2: revisit threaded approach now that we can
// rely on FF 3.5 thread workers to simplify things
// TODO:2: ... or not, if FF4 has removed the required features!
function extractKPZip (zipFilePath, storeLocation)
{
    var zipFile = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
        zipFile.initWithFile(mainWindow.keefox_org.utils.myProfileDir());

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
        var entryName = entries.getNext();
        var target = getItemFile(entryName);
        if (!target.exists())
        {
            try
            {
                target.create(Components.interfaces.nsILocalFile.DIRECTORY_TYPE, 484);
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

        try
        {
            target.create(Components.interfaces.nsILocalFile.NORMAL_FILE_TYPE, 484);
            //TODO:2: different permissions for special files on linux. e.g. 755
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
