/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2015 Chris Tomlinson <keefox@christomlinson.name>
  
  The KeeFoxLog object manages logging KeeFox activity, used for debugging purposes.
  
  There are four cumulative log levels. Change the current level in about:config:
    extensions.keefox@chris.tomlinson.logLevel
  
  Off = 0
  Error = 1
  Warn = 2
  Info = 3
  Debug = 4
  
  The default level (Warn) will be set as part of the installation process.
  
  There are three log methods:
  
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
"use strict";

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cu = Components.utils;

var EXPORTED_SYMBOLS = ["KeeFoxLog"];
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// constructor
function KeeFoxLogger()
{
    this._prefService =  
        Components.classes["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
    this.prefBranch = this._prefService.getBranch("extensions.keefox@chris.tomlinson.");
    this.configureFromPreferences();

    let globalMM = Cc["@mozilla.org/globalmessagemanager;1"].getService(Ci.nsIMessageListenerManager);
    globalMM.addMessageListener("keefox:log-debug", function (message) { KeeFoxLog.debug(message.data); });
    globalMM.addMessageListener("keefox:log-info", function (message) { KeeFoxLog.info(message.data); });
    globalMM.addMessageListener("keefox:log-warn", function (message) { KeeFoxLog.warn(message.data); });
    globalMM.addMessageListener("keefox:log-error", function (message) { KeeFoxLog.error(message.data); });

    this._log("Logging system initialised at " + Date());
    if (this.logSensitiveData)
        this._log("WARNING: KeeFox Sensitive logging ENABLED. See: https://github.com/luckyrat/KeeFox/wiki/en-|-Options-|-Logging-|-Sensitive");
}

KeeFoxLogger.prototype = {

    levelError: false,
    levelWarn: false,
    levelInfo: false,
    levelDebug: false,
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
                folder.create(folder.DIRECTORY_TYPE, parseInt("0775", 8));
                
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
        foStream.init(this._logFile, 0x02 | 0x08 | 0x10, parseInt("0666", 8), 0);
        var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                                  createInstance(Components.interfaces.nsIConverterOutputStream);
        converter.init(foStream, "UTF-8", 0, 0);
        converter.writeString(msg);
        converter.close(); // this closes foStream
    },
        
    // Logs a message using the currently enabled methods
    _log : function (message)
    {
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
    },
    
    getMessage : function (data)
    {
        if (!data)
            return "";

        if (typeof data == "string")
        {
            return data;
        }
        else
        {
            let message = data.m;
            let sensitiveMessage = data.sm;
            let replace = data.r;

            if (!message)
                return data;

            if (!this.logSensitiveData && message.length <= 0)
                return "";
            if (this.logSensitiveData)
            {
                if (replace)
                    return sensitiveMessage;
                else
                    return message + sensitiveMessage;
            } else
            {
                return message;
            }
        }
    },

    debug : function (data)
    {
        if (this.levelDebug)
        {
            let message = this.getMessage(data);
            if (message.length > 0) this._log("DEBUG: " + message);
        }
    },
    
    info : function (data)
    {
        if (this.levelInfo)
        {
            let message = this.getMessage(data);
            if (message.length > 0) this._log("INFO: " + message);
        }
    },
    
    warn : function (data)
    {
        if (this.levelWarn)
        {
            let message = this.getMessage(data);
            if (message.length > 0) this._log("WARN: " + message);
        }
    },
    
    error : function (data)
    {
        if (this.levelError)
        {
            let message = this.getMessage(data);
            if (message.length > 0) this._log("ERROR: " + message);
        }
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

var KeeFoxLog = new KeeFoxLogger();