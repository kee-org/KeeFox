/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
  The KFLog object manages logging KeeFox activity, used for debugging purposes.
  
  There are four cumulative log levels. Change the current level in about:config:
    extensions.chris.tomlinson@keefox.logLevel
  
  Off = 0
  Error = 1
  Warn = 2
  Info = 3
  Debug = 4
  
  The default level will be set as part of the installation process. The exact
  level that will be used as a defualt will probably drop as the beta testing
  process continues. For 0.7, Info will be default.
  
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

var Application = Components.classes["@mozilla.org/fuel/application;1"].getService(Components.interfaces.fuelIApplication);


// constructor
function KeeFoxLogger()
{
    this.keeFoxExtension = Application.extensions.get('chris.tomlinson@keefox');
    
    this.configureFromPreferences();
    
    this._log("Logging system initialised at " + Date());
}

KeeFoxLogger.prototype = {

    levelError: false,
    levelWarn: false,
    levelInfo: false,
    levelDebug: false,
    keeFoxExtension: null,
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

    // logs a message to a file
    _logToFile : function(msg)
    {
        var file = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
        
        
        var MY_ID = "chris.tomlinson@keefox";
        var em = Components.classes["@mozilla.org/extensions/manager;1"].
             getService(Components.interfaces.nsIExtensionManager);
        var dir = em.getInstallLocation(MY_ID).getItemLocation(MY_ID);
        
        file.initWithPath(dir.path);
        
        file.append("log.txt");

        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                                 createInstance(Components.interfaces.nsIFileOutputStream);

        foStream.init(file, 0x02 | 0x08 | 0x10, 0666, 0); 
        // write, create if doesn't already exist, append to end

        var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                                  createInstance(Components.interfaces.nsIConverterOutputStream);
        converter.init(foStream, "UTF-8", 0, 0);
        converter.writeString(msg);
        converter.close(); // this closes foStream
    },
    
    // creates an alert message on teh most recently used Firefox window
    // (probably too annoying to be used reguarly but nice to have the option)
    _alert : function(msg)
    {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");

        // get a reference to the prompt service component.
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                            .getService(Components.interfaces.nsIPromptService);

        promptService.alert(window,"Alert",msg);
    },
    
    // Logs a message using the currently enabled methods
    _log : function (message)
    {
        if (this.methodFile)
            this._logToFile(message+"\n");
        if (this.methodStdOut)
            dump(message+"\n");
        if (this.methodConsole)
            this._logService.logStringMessage(message);
        if (this.methodAlert)
            this._alert(message);
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
    // (these preferences could be set from about:config or an options panel)
    configureFromPreferences : function ()
    {
        var prefLevel = this.keeFoxExtension.prefs.getValue("logLevel",0);
        
        switch (prefLevel)
        {
            case 4: this.levelDebug = true;
            case 3: this.levelInfo = true;
            case 2: this.levelWarn = true;
            case 1: this.levelError = true;
        }
            
        if (this.keeFoxExtension.prefs.getValue("logMethodAlert",false))
            this.methodAlert = true;
        if (this.keeFoxExtension.prefs.getValue("logMethodConsole",false))
            this.methodConsole = true;
        if (this.keeFoxExtension.prefs.getValue("logMethodStdOut",false))
            this.methodStdOut = true;
        if (this.keeFoxExtension.prefs.getValue("logMethodFile",false))
            this.methodFile = true;
            
        if (this.keeFoxExtension.prefs.getValue("logSensitiveData",false))
            this.logSensitiveData = true;
    }

};

var KFLog = new KeeFoxLogger;