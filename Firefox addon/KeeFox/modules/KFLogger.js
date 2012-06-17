/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2011 Chris Tomlinson <keefox@christomlinson.name>
  
  The KFLog object manages logging KeeFox activity, used for debugging purposes.
  
  There are four cumulative log levels. Change the current level in about:config:
    extensions.keefox@chris.tomlinson.logLevel
  
  Off = 0
  Error = 1
  Warn = 2
  Info = 3
  Debug = 4
  
  The default level will be set as part of the installation process. The exact
  level that will be used as a defualt will probably drop as the beta testing
  process continues. For 0.8, Info will be default. For 0.9+, Warn will be default.
  
  There are four log methods:
  
  Alert
  Console
  StdOut
  File
  
  To successfully use some of these methods, the local client needs to be configured appropriately.
  This is left as a task for the user (though instructions should appear here one day).
  Logging to File is the default method (and works without any user intervention).  
  
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

var EXPORTED_SYMBOLS = ["KFLog"];
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

// constructor
function KeeFoxLogger()
{
    this._prefService =  
        Components.classes["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
    this.prefBranch = this._prefService.getBranch("extensions.keefox@chris.tomlinson.");
    this.configureFromPreferences();
    this._log("Logging system initialised at " + Date());
    if (this.logSensitiveData)
        this._log("WARNING: KeeFox Sensitive logging ENABLED. See: https://sourceforge.net/apps/trac/keefox/wiki/Manual/Configuration/Logging/Sensitive");
}

KeeFoxLogger.prototype = {

    levelError: false,
    levelWarn: false,
    levelInfo: false,
    levelDebug: false,
    methodAlert: false,
    methodConsole: false,
    methodStdOut: false,
    methodFile: false,
    logSensitiveData: false,
    
    // Console logging service
    __logService : null, 
    
    get _logService()
    {
        if (!this.__logService)
            this.__logService = Cc["@mozilla.org/consoleservice;1"].
                                getService(Ci.nsIConsoleService);
        return this.__logService;
    },
    
    // the file we'll use for logging
    __logFile : null,
    
    get _logFile()
    {
        if (!this.__logFile)
        {
            var directoryService = Components.classes["@mozilla.org/file/directory_service;1"].  
                getService(Components.interfaces.nsIProperties);
            var dir = directoryService.get("ProfD", Components.interfaces.nsIFile);
            
            var folder = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsILocalFile);
            folder.initWithPath(dir.path);
            folder.append("keefox");
        
            if (!folder.exists())
                folder.create(folder.DIRECTORY_TYPE, 0775);
                
            var file = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsILocalFile);

            file.initWithPath(dir.path);
            file.append("keefox");
            file.append("log.txt");
            this.__logFile = file;
        }
        return this.__logFile;
    },    
    

    // logs a message to a file
    _logToFile : function(msg)
    {
        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                                 createInstance(Components.interfaces.nsIFileOutputStream);

        // write, create if doesn't already exist, append to end
        foStream.init(this._logFile, 0x02 | 0x08 | 0x10, 0666, 0);
        var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                                  createInstance(Components.interfaces.nsIConverterOutputStream);
        converter.init(foStream, "UTF-8", 0, 0);
        converter.writeString(msg);
        converter.close(); // this closes foStream
    },
    
    // creates an alert message on the most recently used Firefox window
    // (probably too annoying to be used reguarly but nice to have the option?)
    _alert : function(msg)
    {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");

        // get a reference to the prompt service component.
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                            .getService(Components.interfaces.nsIPromptService);

        promptService.alert(window,"Alert",msg);
    },
    
    // Logs a message using the currently enabled methods
    _log : function (message)
    {
        // Don't log anything if user is in private browsing mode, just in case!
        
        // I don't understand why Firefox complains about this check for private
        // browsing mode but I will ignore its complaints becuase I'm
        // uncomfortable leaving users with a risk of recording URL data unexpectedly
        try
        {
            var pbs = Components.classes["@mozilla.org/privatebrowsing;1"]
                        .getService(Components.interfaces.nsIPrivateBrowsingService);
            if (pbs.privateBrowsingEnabled)
                return;
        } catch (nothing) {
        // log if private browsing feature is unavailable
        }
        
        //timestamp the message
        var ts = Date();
        message = ts + ":" + message;
        
        // prefix logs in sensitive mode
        if (this.logSensitiveData)
            message = "!! " + message;

        try
        {
            if (this.methodFile)
                this._logToFile(message+"\n");
        } catch (nothing) {
        this._logService.logStringMessage(nothing);
        // don't let failed logging break anything else
        }
        try
        {
            if (this.methodStdOut)
                dump(message+"\n");
        } catch (nothing) {
        // don't let failed logging break anything else
        }
        try
        {
            if (this.methodConsole)
                this._logService.logStringMessage(message);
        } catch (nothing) {
        // don't let failed logging break anything else
        }
        try
        {
            if (this.methodAlert)
                this._alert(message);
        } catch (nothing) {
        // don't let failed logging break anything else
        }
    },
    
    debug : function (message)
    {
        if (this.levelDebug) this._log("DEBUG: " + message);
    },
    
    info : function (message)
    {
        if (this.levelInfo) this._log("INFO:  " + message);
    },
    
    warn : function (message)
    {
        if (this.levelWarn) this._log("WARN:  " + message);
    },
    
    error : function (message)
    {
        if (this.levelError) this._log("ERROR: " + message);
    },
        
    // set current logger configuration to whatever is described in the Firefox preferences system
    // (these preferences can be set from about:config or the options panel)
    configureFromPreferences : function ()
    {
        var prefLevel = 0;
        this.levelDebug = false;
        this.levelInfo = false;
        this.levelWarn = false;
        this.levelError = false;
        
        try {
            prefLevel = this.prefBranch.getIntPref("logLevel");
            } catch (ex) {  }
        
        switch (prefLevel)
        {
            case 4: this.levelDebug = true;
            case 3: this.levelInfo = true;
            case 2: this.levelWarn = true;
            case 1: this.levelError = true;
        }
        
        try {
            this.methodAlert = this.prefBranch.getBoolPref("logMethodAlert");
            } catch (ex) { this.methodAlert = false; }
        try {
            this.methodConsole = this.prefBranch.getBoolPref("logMethodConsole");
            } catch (ex) { this.methodConsole = false; }
        try {
            this.methodStdOut = this.prefBranch.getBoolPref("logMethodStdOut");
            } catch (ex) { this.methodStdOut = false; }
        try {
            this.methodFile = this.prefBranch.getBoolPref("logMethodFile");
            } catch (ex) { this.methodFile = false; }
        try {
            this.logSensitiveData = this.prefBranch.getBoolPref("logSensitiveData");
            } catch (ex) { this.logSensitiveData = false; }  
              
    }

};

var KFLog = new KeeFoxLogger;