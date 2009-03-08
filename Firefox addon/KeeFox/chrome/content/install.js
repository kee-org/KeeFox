/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
This install.js file helps manage the installation of .NET, KeePass and KeeICE.
  
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

function prepareInstallPage()
{
//TODO: detect if admin by calling C++ code...

//TODO: if not admin:
/*

if not admin put same but with a warning message afterwards:

"If you can't privide adminisrative password above then please click here to attempt a non-administrative install."

on next page ("click here"), detect .net framework:

 If you already have the .NET framework 2.0 or higher instaleld on your system you should be able to install
...
*/

    var adminBox = document.getElementById('adminInstallButton');
    adminBox.setAttribute('hidden',false);

}

  function checkDotNetFramework() {

      var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);

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

        var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);
                   
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
            // TODO: download the file from the keefox website? and retest
            // TODO: verify checksum of downloaded setup file
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
    
    
    
    
    function nonAdminInstall()
    {
        var dotNetFrameworkFound;
        dotNetFrameworkFound = checkDotFramework();
            
            
            
        if (!dotNetFrameworkFound)
        {
            alert('TODO: use the zip KeePass (if needed) (or prompt user for install location if not found...) and copy the KeeICE files into place');
            // if KeePass not found, prompt user for zip file extract location
            
            
            // if KePass.exe is found, move the KeeICE DLL and ICE DLL in to the plugins directory - record success or failure (permissions?) and display manual install instructions if it fails.


        } else
        {
            alert('TODO: show a nice message saying that .NET is needed first if you are not an admin');
            
        }
    
    
    }
    
    
    
    
    function adminInstall()
    {
    // just run the full setup.exe ... maybe we could try to be more clever in future but this is likely to be more reliable for now.
    
        runInstaller();

        keeFoxInst.log("Installer launched.");
    
    
    }
    
    
    function finaliseInstall()
    {
    }
   
    /*

    KeeFox needs to conect to KeePass for the first time. This will happen within 30 seconds of KeePass starting. You may want to set up your password database while you wait. If you have not already started KeePass, click here to launch it. For help configuring your database click here.
    * maybe need alternative option too: "you need to restart KeePass if it was running in the background...."

    show waiting spinner, looking out for changes to storage or preferences


    */

    

    
    /*       
            
            
            // what happens when someone creates a new firefox profile? (or moves stuff to a temporary/new machine, etc.)? i guess the detection scripts will find out what's going on and record it in the preferences again.

  
*/

