/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
This install.js file helps manage the installation of .NET, KeePass and KeeICE.

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

const KF_INSTALL_STATE_SELECTED = 1; // user has acknowledged that we need to install stuff
const KF_INSTALL_STATE_NET_DOWNLOADING = 2;
const KF_INSTALL_STATE_NET_DOWNLOADED = 4;
const KF_INSTALL_STATE_NET_EXECUTING = 8;
const KF_INSTALL_STATE_NET_EXECUTED = 16; // .NET installer has been executed or .NET was already installed
const KF_INSTALL_STATE_KP_DOWNLOADING = 32;
const KF_INSTALL_STATE_KP_DOWNLOADED = 64;
const KF_INSTALL_STATE_KP_EXECUTING = 128;
const KF_INSTALL_STATE_KP_EXECUTED = 256;  // KeePass installer has been executed or KeePass was already installed
const KF_INSTALL_STATE_KI_DOWNLOADING = 512;
const KF_INSTALL_STATE_KI_DOWNLOADED = 1024; // KeeICE files have been downloaded (actually we will bundle them with XPI for time being at least)
const KF_INSTALL_STATE_KI_EXECUTING = 2048; // KeeICE files are being copied
const KF_INSTALL_STATE_KI_EXECUTED = 4096;  // KeeICE files have been copied


var IC1InstallState = 0;
var IC2InstallState = 0;
var IC3InstallState = 0;
var IC4InstallState = 0;
var IC5InstallState = 0;
var IC6InstallState = 0;

var target1;
var target2;

var mainWin = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIWebNavigation)
.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
.rootTreeItem
.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIDOMWindow);

var mainWindow = mainWin.keeFoxILM._currentWindow;

function prepareInstallPage() {

    var installCase; // one of 6 options. although it could probaly be inferred from use of install state flags, I want to know where we are starting from becuase user only needs to see info relevant to starting state rather than experiencing a walk through the entire state machine
    var keePassLocation;

    

// only let this install script run once per firefox session
if (mainWindow.keeFoxInst._keeFoxStorage.get("KFinstallProcessStarted", false))
{
    document.getElementById('KFInstallAlreadyInProgress').setAttribute('hidden', false);
    return;
}
mainWindow.keeFoxInst._keeFoxStorage.set("KFinstallProcessStarted",true);

/*


if:

admin and no .net:
"install [run setupWithNET3.5.exe] OR quick install[D] [run setup.exe]"

admin, .net and no keepass:
"install [run keepasssetup.exe and then copy KeeICE files to plugin folder] OR quick install[D] [run keepasssetup.exe /silent and then copy KeeICE files to plugin folder] OR manual installation of KeeICE plugin using file browser form field"

admin, .net and keepass:
"quick install[D] [copy KeeICE files to plugin folder]"

nonadmin and no .net:
"install [run setupWithNet3.5.exe OR quick install[D] [run setup.exe]. You must provide administrative password. if you can't, you will need to ask your system administrator to help you. This is becuase we require .NET version 2.0 or higher to be installed. The Microsoft .NET framework is an established platform (version 3.5 is the latest) which is required by a growing number of software applications but your administrator must install it for you before applications such as KeePass will work. KeePass is the password manager application which KeeFox uses to securely store your passwords."

nonadmin, .net and no keepass:
"Install location form field + install button[D] [extract keepasssetup.zip and then copy KeeICE files to plugin folder] OR Administrative installation [run keepasssetup.exe and then copy KeeICE files to plugin folder] (you must provide admin password to use the second option - it will allow all users on this computer to use KeeFox if they want) OR manual installation of KeeICE plugin using file browser form field"

nonadmin, .net and keepass:
"quick install[D] [copy KeeICE files to plugin folder]"

[D] = default.

*/

//userHasAdminRights(mainWindow);

    if (mainWindow.keeFoxInst._keeFoxExtension.prefs.has("keePassInstalledLocation")) {
        keePassLocation = mainWindow.keeFoxInst._keeFoxExtension.prefs.getValue("keePassInstalledLocation", "not installed");
    }

    // if KeePass location is known then only KeeICE setup needs to be done
    // we could give the user different feedback upon errors based on whether they are
    // an admin or not but not sure the benefit of that outweighs the cost of doing all the other tests
    if (keePassLocation != "not installed") {
        installCase = 3; // although choosing IC6 should make no difference
    }
    else {
        if (userHasAdminRights(mainWindow))
            if (checkDotFramework(mainWindow))
                installCase = 2;
            else
                installCase = 1;
        else
            if (checkDotFramework(mainWindow))
                installCase = 5;
            else
                installCase = 4;
    }

    mainWindow.keeFoxInst.log("applying installation case " + installCase);
 
    // comment this out to enable normal operation or specify a test case
    installCase = 1;

// configure the current installation state and trigger any relevant pre-emptive file downloads to give the impression of speed to end user
//TODO: support cancellation of pre-emptive downloading in case advanced user chooses unusual option
    switch (installCase) {
        case 1:
            document.getElementById('setupExeInstallButtonMain').setAttribute('hidden', false);
            IC1InstallState = KF_INSTALL_STATE_NET_DOWNLOADING | KF_INSTALL_STATE_KI_DOWNLOADED;
            mainWindow.KFdownloadFile("installCase1Download", "http://christomlinson.name/dl/dotnetfx.exe", "dotnetfx.exe", mainWindow, window);
            break;
        case 2: 
            document.getElementById('KPsetupExeSilentInstallButtonMain').setAttribute('hidden', false);
            IC2InstallState = KF_INSTALL_STATE_NET_EXECUTED | KF_INSTALL_STATE_KP_DOWNLOADING | KF_INSTALL_STATE_KI_DOWNLOADED;
            mainWindow.KFdownloadFile("installCase2Download", "http://christomlinson.name/dl/KeePass-2.06-Beta-Setup.exe", "KeePass-2.06-Beta-Setup.exe", mainWindow, window);
            break;
        case 3: 
            document.getElementById('copyKIToKnownKPLocationInstallButtonMain').setAttribute('hidden', false);
            IC3InstallState = KF_INSTALL_STATE_NET_EXECUTED | KF_INSTALL_STATE_KP_EXECUTED | KF_INSTALL_STATE_KI_DOWNLOADED;
            break;
        case 4: 
            document.getElementById('setupExeInstallButtonMain').setAttribute('hidden', false);
            IC4InstallState = KF_INSTALL_STATE_NET_DOWNLOADING | KF_INSTALL_STATE_KI_DOWNLOADED;
            mainWindow.KFdownloadFile("installCase4Download", "http://christomlinson.name/dl/dotnetfx.exe", "dotnetfx.exe", mainWindow, window);
            break;
        case 5: 
            document.getElementById('copyKPToSpecificLocationInstallButtonMain').setAttribute('hidden', false); 
            IC5InstallState = KF_INSTALL_STATE_NET_EXECUTED | KF_INSTALL_STATE_KP_DOWNLOADING | KF_INSTALL_STATE_KI_DOWNLOADED;
            mainWindow.KFdownloadFile("installCase5Download", "http://christomlinson.name/dl/KeePass-2.06-Beta.zip", "KeePass-2.06-Beta.zip", mainWindow, window);
            break;
        case 6: 
            document.getElementById('copyKIToKnownKPLocationInstallButtonMain').setAttribute('hidden', false);
            IC6InstallState = KF_INSTALL_STATE_NET_EXECUTED | KF_INSTALL_STATE_KP_EXECUTED | KF_INSTALL_STATE_KI_DOWNLOADED;
            break;            
        default: document.getElementById('ERRORInstallButtonMain').setAttribute('hidden', false); break;
    }


}

function hideInstallView() {
    document.getElementById('installationStartView').setAttribute('hidden', true);
}

function showProgressView() {
    document.getElementById('installProgressView').setAttribute('hidden', false);
}

function showSection(id) {
    document.getElementById(id).setAttribute('hidden', false);
}

function hideSection(id) {
    document.getElementById(id).setAttribute('hidden', true);
}

function IC1finished(mainWindow) {

    hideSection('IC1KIdownloaded');
    showSection('IC1Finished');
    
}

function IC1setupKI(mainWindow) {
try {
    if ((IC1InstallState & KF_INSTALL_STATE_KI_DOWNLOADED) && (IC1InstallState & KF_INSTALL_STATE_KP_EXECUTED))
    {
        // we don't checksum bundled DLLs since if they are compomised the whole XPI, including this file, could be too
        hideSection('IC1setupKPdownloaded');
        showSection('IC1KIdownloaded');
        
        IC1InstallState |= KF_INSTALL_STATE_KI_EXECUTING;

        //TODO: copy KeeICE files into relevant location
        
        IC1InstallState ^= KF_INSTALL_STATE_KI_EXECUTING; // we can safely assume this bit is already set since no other threads are involved
        IC1InstallState |= KF_INSTALL_STATE_KI_EXECUTED;
        IC1finished(mainWindow);
    }
    } catch (err) {
            Components.utils.reportError(err);
        }
}

function IC1setupKP(mainWindow) {
try {
    hideSection('IC1setupNETdownloaded');
    
    if ((IC1InstallState & KF_INSTALL_STATE_KP_DOWNLOADED) && (IC1InstallState & KF_INSTALL_STATE_NET_EXECUTED))
    {
        var checkTest = mainWindow.KFMD5checksumVerification("KeePass-2.06-Beta-Setup.exe","");
        
        if (checkTest)
            mainWindow.keeFoxInst.log("File checksum succeeded.");
        else
            mainWindow.keeFoxInst.log("File checksum failed. Download corrupted?");
        // TODO: kick user back to start if it fails
        
        hideSection('IC1setupKPdownloading'); // if applicable (probably this was never shown)
        showSection('IC1setupKPdownloaded');

        IC1InstallState |= KF_INSTALL_STATE_KP_EXECUTING;

        target2 = Components.classes["@mozilla.org/thread-manager;1"].getService().newThread(0);
                   
        target2.dispatch(new mainWindow.KFexecutableInstallerRunner("KeePass-2.06-Beta-Setup.exe","","IC1KPSetupFinished", mainWindow, window), target2.DISPATCH_NORMAL);
      // var temp = new mainWindow.KFexecutableInstallerRunner("KeePass-2.06-Beta-Setup.exe","","IC1KPSetupFinished", mainWindow, window);
      // temp.run();
        
    } else if (IC1InstallState & KF_INSTALL_STATE_KP_DOWNLOADING)
    {
        showSection('IC1setupKPdownloading');
    }
} catch (err) {
            Components.utils.reportError(err);
        }    
}

function IC1setupNET(mainWindow) {
try {
    if ((IC1InstallState & KF_INSTALL_STATE_NET_DOWNLOADED) && (IC1InstallState & KF_INSTALL_STATE_SELECTED))
    {
        var checkTest = mainWindow.KFMD5checksumVerification("dotnetfx.exe","");
        
        if (checkTest)
            mainWindow.keeFoxInst.log("File checksum succeeded.");
        else
            mainWindow.keeFoxInst.log("File checksum failed. Download corrupted?");
        // TODO: kick user back to start if it fails
        
        hideSection('IC1setupNETdownloading');
        showSection('IC1setupNETdownloaded');
        
        // start the pre-download of the KeePass setup file (while user installs .Net...)
        IC1InstallState |= KF_INSTALL_STATE_KP_DOWNLOADING;
        mainWindow.KFdownloadFile("installCase1Download", "http://christomlinson.name/dl/KeePass-2.06-Beta-Setup.exe", "KeePass-2.06-Beta-Setup.exe", mainWindow, window);
        
        IC1InstallState |= KF_INSTALL_STATE_NET_EXECUTING;

        target1 = Components.classes["@mozilla.org/thread-manager;1"].getService().newThread(0);
                   
        target1.dispatch(new mainWindow.KFexecutableInstallerRunner("dotnetfx.exe","","IC1NETSetupFinished", mainWindow, window), target1.DISPATCH_NORMAL);
        //var temp = new mainWindow.KFexecutableInstallerRunner("dotnetfx.exe","","IC1NETSetupFinished", mainWindow, window);
        //temp.run();
        
    //     var thread = Components.classes["@mozilla.org/thread-manager;1"]
    //                    .getService(Components.interfaces.nsIThreadManager)
    //                    .currentThread;
 //TODO: think of a nother way to avoid the multiple recursive thread calls?
 // remove all install code out from the DOM window into a seperate class? then DOM stuff just calls it via mainWindow... doubt that will work.
 //try FF3.5 thread worker stuff
 // or work out how to launch threads from C++ and do that along with a callback to the main KPJS callback object after app has executed.
 
 // lame idea. not sure why it's even listed on MDC
 //while (!mainWindow.KFtempComplete)
   //thread.processNextEvent(true);

        
    //    IC1InstallState ^= IC1InstallState & KF_INSTALL_STATE_NET_EXECUTING;
      //                  IC1InstallState |= KF_INSTALL_STATE_NET_EXECUTED;
        //                IC1setupKP(mainWindow);
        
    }
} catch (err) {
            Components.utils.reportError(err);
        }
}

/*
 IC1 and IC4
 run (with admin rights escalation) the .NET 2 installer 
 */
//TODO: make two versions of setup exe, each with embedded .NET and KeePass installer
function setupExeInstall() {
 /*   var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIWebNavigation)
.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
.rootTreeItem
.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIDOMWindow);
*/
    hideInstallView();
    showProgressView();
    
    if (IC1InstallState & KF_INSTALL_STATE_NET_DOWNLOADING)
    {
        
        showSection('IC1setupNETdownloading');
    }
 
    // call this now and let it decide if it is the right time to run the installer or wait until it's called again by progress listener
    IC1InstallState |= KF_INSTALL_STATE_SELECTED;
    IC1setupNET(mainWindow);

}

/*
 IC2
 run (quietly and with admin rights escalation) the keepass 2.x exe installer
 and copy the KeeICE files into place
 */
function KPsetupExeSilentInstall() {

}

/*
 IC3 and IC6
 copy KeeICE files to the known KeePass 2.x location
 TODO: detect access denied failures and prompt user accordingly (this could happen if an admin installed KeePass at an earlier time)
 */
function copyKIToKnownKPLocationInstall() {

}

/*
 IC5
 test to see if KeePass is installed in specified location, if it isn't, extract the portable zip file there
 then in either case we will copy the KeeICE files into the plugin folder
 */
function copyKPToSpecificLocationInstall() {

}


function userHasAdminRights(mainWindow) {

    var isAdmin;
    isAdmin = false;

    isAdmin = mainWindow.keeFoxInst.IsUserAdministrator();
    if (isAdmin)
        mainWindow.keeFoxInst.log("User has administrative rights");
    else
        mainWindow.keeFoxInst.log("User does not have administrative rights");
    return true;
}

function checkDotNetFramework(mainWindow) {

var dotNetFrameworkFound;
dotNetFrameworkFound = false;
  
// platform is a string with one of the following values: "Win32", "Linux i686", "MacPPC", "MacIntel", or other.
//TODO: some bits of this will no doubt be shared with other platforms
if (window.navigator.platform == "Win32") {
var wrk = Components.classes["@mozilla.org/windows-registry-key;1"].createInstance(Components.interfaces.nsIWindowsRegKey);
wrk.open(wrk.ROOT_KEY_LOCAL_MACHINE,
"SOFTWARE\\Microsoft\\.NETFramework\\policy\\v2.0",
wrk.ACCESS_READ);
if (wrk.hasChild("50727")) {
var subkey = wrk.openChild("50727", wrk.ACCESS_READ);
if (subkey.hasValue("50727-50727")) {
dotNetFrameworkFound = true;
mainWindow.keeFoxInst.log(".NET framework has been found");
}
subkey.close();
}
wrk.close();
}
return dotNetFrameworkFound;
}

function runInstaller() {
/*
var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIWebNavigation)
.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
.rootTreeItem
.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIDOMWindow);
  */
                   
var locale = "en-GB";
var setupLocale = "";
        
if (locale.substring(0,1) == "en")
setupLocale = "en-GB";
else if (locale.substring(0,1) == "es")
setupLocale = "es";
else
setupLocale = "en-GB";
        
var setupFileName = "Setup_" + setupLocale + ".exe";
        
// create an nsILocalFile for the executable
var file = Components.classes["@mozilla.org/file/local;1"]
.createInstance(Components.interfaces.nsILocalFile);
var fileDir = mainWindow.keeFoxInst._myInstalledDir();
mainWindow.keeFoxInst.log("about to launch::" + fileDir + "\\KeeICEInstaller\\" + setupFileName);
file.initWithPath(fileDir + "\\KeeICEInstaller\\" + setupFileName);

if (!file.exists() || !file.isExecutable())
{
mainWindow.keeFoxInst.log("Setup file not found. Is the KeeFox XPI package correctly installed? Do you have permission to execute the file?");
return true;

}

try
{
file.launch();
} catch (ex)
{
// if launch fails, try sending it through the system's external
// file: URL handler
var uri = Cc["@mozilla.org/network/io-service;1"].
getService(Ci.nsIIOService).newFileURI(file);
     
var protocolSvc = Cc["@mozilla.org/uriloader/external-protocol-service;1"].
getService(Ci.nsIExternalProtocolService);
protocolSvc.loadUrl(uri);

}
return true;
}
    

    
    
function finaliseInstall()
{
}
   
/*

KeeFox needs to conect to KeePass for the first time. This will happen within 30 seconds of KeePass starting. You may want to set up your password database while you wait. If you have not already started KeePass, click here to launch it. For help configuring your database click here.
* maybe need alternative option too: "you need to restart KeePass if it was running in the background...."

show waiting spinner, looking out for changes to storage or preferences


*/

