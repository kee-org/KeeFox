/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2013 Chris Tomlinson <keefox@christomlinson.name>

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

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cu = Components.utils;

var EXPORTED_SYMBOLS = ["utils"];
Cu.import("resource://kfmod/KFLogger.js");
Cu.import("resource://kfmod/KFExtension.js");
Cu.import("resource://kfmod/biginteger.js");

// constructor
function Utils()
{
    this._KFLog = KFLog;
}

Utils.prototype = {

    // holding function in case there are any corrective actions we can
    // take if certain extensions cause problems in future
    _checkForConflictingExtensions: function()
    {
        return true;
    },

    // Checks whether the user's sensitive data is being logged for debugging purposes
    oneOffSensitiveLogCheckHandler: function()
    {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
        var sensistiveLoggingEnabled = window.keefox_org._keeFoxExtension.prefs.getValue("logSensitiveData", false);
        if (sensistiveLoggingEnabled)
            window.keefox_win.UI._showSensitiveLogEnabledNotification();
    },

    //TODO2: make this work with FF4 (maybe earlier versions just don't support it properly anyway)
    uninstallHandler: function()
    {
    //TODO2: this doesn't work. dunno how to catch the secret FUEL notifications yet...
    
        //TODO2: explain to user what will be uninstalled and offer extra
        // options (e.g. "Uninstall KeePass too?")
        
        // Reset prefs to pre-KeeFox settings
        //var rs = prefs.getValue("originalPreferenceRememberSignons", false);
        //Application.prefs.setValue("signon.rememberSignons", rs);
    },

    // works out where KeePass is installed and records it in a Firefox preference
    _discoverKeePassInstallLocation: function()
    {
        var keePassLocation = "not installed";
 
        if (KFExtension.prefs.has("keePassInstalledLocation"))
        {
            keePassLocation = KFExtension.prefs.getValue("keePassInstalledLocation","not installed");
            if (keePassLocation != "")
                this._KFLog.info("KeePass install location found in preferences: " + keePassLocation);
            else
                keePassLocation = "not installed";
        }

        if (keePassLocation == "not installed")
        {
          if (!this.useMono)
          {
            this._KFLog.debug("Reading KeePass installation location from Windows registry");

            var wrk = Components.classes["@mozilla.org/windows-registry-key;1"]
                            .createInstance(Components.interfaces.nsIWindowsRegKey);
            var locations = ["SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall", "SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall"];
			var foundInRegistry = false;
            for (var i = 0; i < locations.length; i++)
            {
				this._KFLog.info("Checking KeePass install location in registry key: HKLM\\" + locations[i]);
                try
                {
                    wrk.open(wrk.ROOT_KEY_LOCAL_MACHINE,
                           locations[i],
                           wrk.ACCESS_READ);
                    if (wrk.hasChild("KeePassPasswordSafe2_is1"))
                    {
                        var subkey = wrk.openChild("KeePassPasswordSafe2_is1", wrk.ACCESS_READ);
                        if (subkey.hasValue("InstallLocation"))
                        {
                            keePassLocation = subkey.readStringValue("InstallLocation");
                            KFExtension.prefs.setValue("keePassInstalledLocation",keePassLocation);
                            foundInRegistry = true;
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
                            KFExtension.prefs.setValue("keePassInstalledLocation",keePassLocation);
                            foundInRegistry = true;
                            if (this._KFLog.logSensitiveData)
                                this._KFLog.info("KeePass install location found: " + keePassLocation);
                            else
                                this._KFLog.info("KeePass install location found.");
                        }
                        subkey.close();
                    }
                    wrk.close();
                } catch (ex)
                {
                    // Probably just running on an x86 platform so ignore
                }
                if (foundInRegistry)
                    break;
            }

            // If still not found...
            // TODO2: try "HKEY_CLASSES_ROOT\kdbxfile\shell\open\command" and some guesses?
//            if (keePassLocation == "not installed")
//            {
//                var wrko = Components.classes["@mozilla.org/windows-registry-key;1"]
//                                .createInstance(Components.interfaces.nsIWindowsRegKey);
//                wrko.open(wrk.ROOT_KEY_CLASSES_ROOT,
//                       "kdbxfile\\shell\\open",
//                       wrko.ACCESS_READ);
//                                       
//                wrko.close();
//            }
            
          }
          else
          {
            this._KFLog.debug("Checking KeePass installation location from filesystem");

            // Get the users home directory
            var dirService = Components.classes["@mozilla.org/file/directory_service;1"].  
              getService(Components.interfaces.nsIProperties);   
            var keePassFolder = dirService.get("Home", Components.interfaces.nsIFile); // returns an nsIFile object
            keePassFolder.append("KeePass");
            var keePassFile = keePassFolder.clone();
            keePassFile.append("KeePass.exe");
            if (keePassFile.exists())
            {
              keePassLocation = keePassFolder.path;
              KFExtension.prefs.setValue("keePassInstalledLocation",keePassLocation);              
              this._KFLog.debug("***Found "+keePassFolder.path);
            }
            else
            {
              this._KFLog.debug("Did not find "+keePassFile.path);
            }
          }
        }
        
        return keePassLocation;
    },
    
    // if the KeePassRPC install location has been customised, we'll return that. If not, we assume 
    // it is installed in the default location and allow the confirmation step to check if it can be found there.
    _discoverKeePassRPCInstallLocation: function()
    {
        var keePassRPCLocation = "not installed";
        var keePassLocation = "not installed";
        //return keePassRPCLocation; //HACK: debug (forces install process to start)
        
        if (KFExtension.prefs.has("keePassRPCInstalledLocation"))
        {
            keePassRPCLocation = KFExtension.prefs.getValue("keePassRPCInstalledLocation","not installed");
            if (keePassRPCLocation != "")
            {
                if (this._KFLog.logSensitiveData)
                    this._KFLog.info("keePassRPC install location found in preferences: " + keePassRPCLocation);
                else
                    this._KFLog.info("keePassRPC install location found in preferences.");
                
                try
                {
                    var defaultFolder = Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);
                    defaultFolder.initWithPath(KFExtension.prefs.getValue("keePassInstalledLocation","not installed"));
                    defaultFolder.append("plugins");

                    if (keePassRPCLocation == defaultFolder.path || keePassRPCLocation.slice(0,-1) == defaultFolder.path)
                    {
                        KFExtension.prefs.setValue("keePassRPCInstalledLocation","");
                    }
                } catch (ex)
                {
                    this._KFLog.debug("Failed to tidy up old KPRPC plugin preference.");
                }
                
            }
            else
                keePassRPCLocation = "not installed";
        }
        
        if (keePassRPCLocation == "not installed" 
            && KFExtension.prefs.has("keePassInstalledLocation") 
            && KFExtension.prefs.getValue("keePassInstalledLocation","") != "")
        {
            keePassLocation = KFExtension.prefs.getValue("keePassInstalledLocation","not installed");

            var folder = Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);
            folder.initWithPath(keePassLocation);
            folder.append("plugins");
            keePassRPCLocation = folder.path;
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

        if (this._KFLog.logSensitiveData)
            this._KFLog.debug("Looking for the KeePass EXE in " + keePassLocation);
        else
            this._KFLog.debug("Looking for the KeePass EXE.");

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
    
    _confirmKeePassRPCInstallLocation: function(keePassLocation, keePassRPCLocation)
    {
        var KeePassRPCfound;
        KeePassRPCfound = false;

        if (this._KFLog.logSensitiveData)
            this._KFLog.info("Looking for the KeePassRPC plugin plgx in " + keePassRPCLocation + " and " + keePassLocation);
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
                    this._KFLog.info("KeePassRPC plgx found in specified or default location.");
                }
            }
            
        } catch (ex)
        {
            this._KFLog.debug("KeePassRPC PLGX search threw an exception: " + ex);
        }

        if (!KeePassRPCfound)
        {
            try
            {
                file.initWithPath(keePassLocation);
                if (file.isDirectory())
                {
                    file.append("KeePassRPC.plgx");
                    if (file.isFile())
                    {
                        KeePassRPCfound = true;
                        this._KFLog.info("KeePassRPC plgx found in KeePass location.");
                    }
                }
            
            } catch (ex)
            {
                this._KFLog.debug("KeePassRPC PLGX search threw an exception: " + ex);
            }
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

    // works out where Mono is installed and records it in a Firefox preference
    // As far as I know, Mono is typically installed at /usr/bin/mono for Fedora, Debian, Ubuntu, etc.
    _discoverMonoLocation: function(defaultMonoExec)
    {
        var monoLocation = "not installed";
        
        if (KFExtension.prefs.has("monoLocation"))
        {
            monoLocation = KFExtension.prefs.getValue("monoLocation", "not installed");
            if (monoLocation != "")
              this._KFLog.info("Mono install location found in preferences: " + monoLocation);
            else
              monoLocation = "not installed";
        }
        
        if (monoLocation == "not installed")
        {
            var mono_exec = Components.classes["@mozilla.org/file/local;1"]
                             .createInstance(Components.interfaces.nsILocalFile);
            mono_exec.initWithPath(defaultMonoExec);
            if (mono_exec.exists())
            {
              monoLocation = mono_exec.path;            
              KFExtension.prefs.setValue("monoLocation",monoLocation);
              this._KFLog.debug("Mono install location inferred: " + monoLocation);
            }
            else
            {
              this._KFLog.debug("Mono install location " + defaultMonoExec + " does not exist!");
            }
        }        
        return monoLocation;
    },
    
    _confirmMonoLocation: function(monoLocation)
    {
        var monoExecFound;
        monoExecFound = false;

        this._KFLog.debug("Looking for the Mono executable in " + monoLocation);

        var file = Components.classes["@mozilla.org/file/local;1"]
                    .createInstance(Components.interfaces.nsILocalFile);
        try
        {
            file.initWithPath(monoLocation);
            if (file.isFile())
            {
              monoExecFound = true;
              this._KFLog.info("Mono executable found in correct location.");
            }
        } catch (ex)
        {
            /* no need to do anything */
        }
        return monoExecFound;
    },
    
    
    
    /*******************************************
    / General utility functions
    /*******************************************/
    
    IsUserAdministrator: function()
    {
        var file = Components.classes["@mozilla.org/file/local;1"]
                   .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(this.myDepsDir() + "\\CheckForAdminRights.exe");

        var process = Components.classes["@mozilla.org/process/util;1"]
                      .createInstance(Components.interfaces.nsIProcess);
        this._KFLog.debug("file path: " + file.path);
        try {
            process.init(file);
            process.run(true, [], 0); //TODO2: make async?
        } catch (ex)
        {
            // assume failure means they are not admin
            return false;
        }
        return process.exitValue;
    },

    _openAndReuseOneTabPerURL: function(url)
    {
        if (this._KFLog.logSensitiveData)
            this._KFLog.debug("trying to find an already open tab with this url:" + url);
        else
            this._KFLog.debug("trying to find an already open tab with the requested url");
        var found = false;
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
        try
        {
            var browserEnumerator = wm.getEnumerator("navigator:browser");

            // Check each browser instance for our URL
            while (!found && browserEnumerator.hasMoreElements())
            {
                var browserWin = browserEnumerator.getNext();
                var tabbrowser = browserWin.gBrowser;

                // Check each tab of this browser instance
                var numTabs = tabbrowser.browsers.length;
                for (var index = 0; index < numTabs; index++)
                {
                    var currentBrowser = tabbrowser.getBrowserAtIndex(index);
                    if (url == currentBrowser.currentURI.spec)
                    {
                        // The URL is already opened. Select this tab.
                        tabbrowser.selectedTab = tabbrowser.tabContainer.childNodes[index];

                        // Focus *this* browser-window
                        browserWin.focus();

                        found = true;
                        break;
                    }
                }
            }

            if (!found)
            {
                this._KFLog.debug("tab with this URL not already open so opening one and focussing it now");
                var newWindow = wm.getMostRecentWindow("navigator:browser") ||
                    wm.getMostRecentWindow("mail:3pane");
                var b = newWindow.getBrowser();
                var newTab = b.loadOneTab( url, null, null, null, false, null );
                return newTab;
            }
        } catch (ex)
        {
            // if this fails, it's probably because we are setting up the JS module before FUEL is ready (can't find a way to test it so will just have to try and catch)
            this._KFLog.debug("browser window not ready yet: " + ex); 
            var currentWindow = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            if (currentWindow == null)
            {
                this._KFLog.error("No windows open yet");
                return;
            } else
            {
                this.urlToOpenOnStartup = url;
            }
            return;
        }
    },
    
    myDepsDir: function()
    {
        var file = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(this.myInstalledDir());
        file.append("deps");
        return file.path;
    },

    myInstalledDir: function()
    {
        this._KFLog.debug("establishing the directory that KeeFox is installed in");

        // Mozilla rightly says that this approach is rather short-sighted - 
        // unfortuantely from FF4 onwards, they only provide an async
        // function as an alternative which won't work for KeeFox
        var directoryService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
        var dir = directoryService.get("ProfD", Components.interfaces.nsIFile);
        dir.append("extensions");
        dir.append("keefox@chris.tomlinson");

        if (this._KFLog.logSensitiveData)
            this._KFLog.debug("installed in this directory: " + dir.path);
        else
            this._KFLog.debug("Found installation directory");
        return dir.path;
    },

    myProfileDir: function()
    {
        var directoryService = Components.classes["@mozilla.org/file/directory_service;1"].  
                    getService(Components.interfaces.nsIProperties);
        var dir = directoryService.get("ProfD", Components.interfaces.nsIFile);
    
        var folder = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
        folder.initWithPath(dir.path);
        folder.append("keefox");

        if (!folder.exists())
            folder.create(folder.DIRECTORY_TYPE, parseInt("0775", 8));

        return folder;
    },

    versionAsInt: function(versionArray)
    {
        var value = 0;
        for ( var i = 0; i < versionArray.length; i++) {
            value = (value * 256) + versionArray[i];
        }

        return value;
    },

    versionAsArray: function(versionInt)
    {
        var byteArray = [0, 0, 0];

        for (var i = byteArray.length -1; i >= 0; i--) {
            var byte = versionInt & 0xff;
            byteArray[i] = byte;
            versionInt = (versionInt - byte) / 256;
        }

        return byteArray;
    },

    versionAsString: function(versionInt)
    {
        var value = "";
        var versionArray = this.versionAsArray(versionInt);
        for ( var i = 0; i < versionArray.length; i++) {
            if (i > 0)
                value += ".";
            value += versionArray[i].toString();
        }

        return value;
    },

    // return the two-digit hexadecimal code for a byte
    toHexString: function(charCode)
    {
        return ("0" + charCode.toString(16)).slice(-2);
    },

    BigIntFromRandom: function(bytes)
    {
        let buffer = '';
        let prng = Components.classes['@mozilla.org/security/random-generator;1'];
        let bytebucket = prng.getService(Components.interfaces.nsIRandomGenerator).generateRandomBytes(bytes, buffer);
    
        let hex = [this.toHexString(bytebucket[i]) for (i in bytebucket)].join("");
        return BigInteger.parse(hex, 16);
    },

    
    // input can be either UTF8 formatted string or a byte array
    //TODO2: might be more useful to accept UTF16 by default?
    // default output format is hex string and algorithm is SHA256
    //TODO2: Maybe shouldn't use byteArray output at all - seems a bit buggy RE different encodings and maybe negative ints
    hash: function(data, outFormat, algorithm)
    {
        var converterUTF8 =
            Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
            createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
 
        converterUTF8.charset = "UTF-8";

        var converterUTF16 =
            Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
            createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
 
        converterUTF16.charset = "UTF-16";

        // result is an out parameter,
        // result.value will contain the array length
        var result = {};

        if (typeof data === "string")
        {
            // data is now an array of bytes
            data = converterUTF8.convertToByteArray(data, result);
        }
        var ch = Components.classes["@mozilla.org/security/hash;1"]
                           .createInstance(Components.interfaces.nsICryptoHash);
        if (algorithm == "SHA1")
            ch.init(ch.SHA1);
        else
            ch.init(ch.SHA256);
        ch.update(data, data.length);

        if (outFormat === "base64")
            return ch.finish(true);
        else
            var hash = ch.finish(false);
 
        if (outFormat === "binary")
            return hash;
        else if (outFormat === "byteArray")
            return converterUTF16.convertToByteArray(hash, result);

        // convert the binary hash data to a hex string.
        var s = [utils.toHexString(hash.charCodeAt(i)) for (i in hash)].join("");

        return s;
    },

    intToByteArray: function(int) {
        var byteArray = [0, 0, 0, 0];

        for ( var index = byteArray.length -1; index >= 0; index-- ) {
            var byte = int & 0xff;
            byteArray [ index ] = byte;
            int = (int - byte) / 256 ;
        }

        return byteArray;
    },
    
    intArrayToByteArray: function(intArray) {
        var byteArray = new Array(intArray.length*4);

        for ( var index = 0; index < intArray.length; index ++ ) {
            var int = intArray[index];
            for ( var j = 3; j >= 0; j-- ) {
                var byte = int & 0xff;
                byteArray [ (index * 4) + j ] = byte;
                int = (int - byte) / 256 ;
            }
        }

        return byteArray;
    },

    stringToByteArray: function(str)
    {
        var sBytes = new Uint8Array(str.length);
        for (var i=0; i<str.length; i++) {
            sBytes[i] = str.charCodeAt(i);
        }
        return sBytes;
    },

    // A variation of base64toByteArray which allows us to calculate a HMAC far
    // more efficiently than with seperate memory buffers
    base64toByteArrayForHMAC: function (input, extraLength, view) {
        var binary = atob(input);
        var len = binary.length;
        var offset = 0;
        if (!view)
        {
            var buffer = new ArrayBuffer(len + extraLength);
            view = new Uint8Array(buffer);
            offset = 20;
        }
        for (var i = 0; i < len; i++)
        {
            view[(i+offset)] = binary.charCodeAt(i);
        }
        return view;
    },
    
    base64toByteArray: function (input) {
        var binary = atob(input);
        var len = binary.length;
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++)
        {
            view[i] = binary.charCodeAt(i);
        }
        return view;
    },

    byteArrayToBase64: function (arrayBuffer) {
        let base64 = '';
        let encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; 
        let bytes = new Uint8Array(arrayBuffer);
        let byteLength = bytes.byteLength;
        let byteRemainder = byteLength % 3;
        let mainLength = byteLength - byteRemainder; 
        let a, b, c, d;
        let chunk;
 
        // Main loop deals with bytes in chunks of 3
        for (let i = 0; i < mainLength; i = i + 3)
        {
            // Combine into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
 
            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
            c = (chunk & 4032) >>  6; // 4032 = (2^6 - 1) << 6
            d = chunk & 63; // 63 = 2^6 - 1
 
            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
        }
 
        // Deal with the remaining bytes and padding
        if (byteRemainder == 1)
        {
            chunk = bytes[mainLength];
 
            a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
 
            // Set the 4 least significant bits to zero
            b = (chunk & 3) << 4; // 3 = 2^2 - 1
 
            base64 += encodings[a] + encodings[b] + '==';
        } else if (byteRemainder == 2)
        {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
 
            a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4
 
            // Set the 2 least significant bits to zero
            c = (chunk & 15) << 2; // 15 = 2^4 - 1
 
            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
        }
  
        return base64;
    },
    
    hexStringToByteArray: function (hexString, byteArray) {
        if (hexString.length % 2 !== 0) {
            throw Error("Must have an even number of hex digits to convert to bytes");
        }
        var numBytes = hexString.length / 2;
        if (!byteArray)
            byteArray = new Uint8Array(numBytes);
        for (var i=0; i<numBytes; i++) {
            byteArray[i] = parseInt(hexString.substr(i*2, 2), 16);
        }
        return byteArray;
    },
    
    getWindow: function()
    {
        let wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
        return wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
    },

    newGUID: function()
    {
        let uuidGenerator = Components.classes["@mozilla.org/uuid-generator;1"]
                        .getService(Components.interfaces.nsIUUIDGenerator);
        let uuid = uuidGenerator.generateUUID();
        let guid = uuid.toString();
        return guid.substr(1,guid.length-2);
    },

    
    copyStringToClipboard: function(value)
    {
        let gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].
                    getService(Components.interfaces.nsIClipboardHelper);
        gClipboardHelper.copyString(value);
    }
    
};

var utils = new Utils();