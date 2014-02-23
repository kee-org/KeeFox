/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2013 Chris Tomlinson <keefox@christomlinson.name>
  
  KFExtension.js provides meta functions including things like extension preferences and storage
  
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

var EXPORTED_SYMBOLS = ["KFExtension"];
Cu.import("resource://kfmod/KFLogger.js");

// constructor
function KFE()
{
    this._KFLog = KFLog;

    this.legacyUI = false; //TODO: browser version detection

    this._myProfileDir = function()
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
    };

    this.storage = {
        _storage: {},
        has: function ss_has(aName) {
            return this._storage.hasOwnProperty(aName);
        },

        set: function ss_set(aName, aValue) {
            this._storage[aName] = aValue;
        },

        get: function ss_get(aName, aDefaultValue) {
            return this.has(aName) ? this._storage[aName] : aDefaultValue;
        }
    };

    //TODO2: abstract database access away from main KeeFox features in order to provide cached representation of critical and oft-requested data?
    this.db = {};

    var folder = this._myProfileDir();

    this.db.file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
    this.db.file.initWithFile(folder);
    this.db.file.append("keefox.sqlite");

    this.db.storageService = Components.classes["@mozilla.org/storage/service;1"]
                            .getService(Components.interfaces.mozIStorageService);
    this.db.conn = this.db.storageService
                            .openDatabase(this.db.file); // Will also create the file if it does not exist
                        
    this.prefs = {};
    this.prefs._prefService = 
        Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Ci.nsIPrefService);
    this.prefs._prefBranch = 
        this.prefs._prefService
        .getBranch("extensions.keefox@chris.tomlinson.");
    this.prefs._prefBranchRoot = 
        this.prefs._prefService
        .getBranch("");
    this.prefs.has = function(name)
    {
        var prefType = this._prefBranch.getPrefType(name);
        if (prefType == 32 || prefType == 64 || prefType == 128)
            return true;
        return false;
    };
    this.prefs.getValue = function(name, defaultValue)
    {
        var prefType = this._prefBranch.getPrefType(name);

        var gotValue = null;
        if (prefType == 32)
            gotValue = this._getStringValue(name);
        if (prefType == 64)
            gotValue = this._getIntValue(name);
        if (prefType == 128)
            gotValue = this._getBoolValue(name);
 
        if (gotValue != null)
            return gotValue;
        return defaultValue;
    };
    this.prefs._getStringValue = function(name)
    {
        try { return this._prefBranch.getComplexValue(name, Components.interfaces.nsISupportsString).data;
        } catch (ex) { return null; }
    };
    this.prefs._getIntValue = function(name)
    {
        try { return this._prefBranch.getIntPref(name);
        } catch (ex) { return null; }
    };
    this.prefs._getBoolValue = function(name)
    {
        try { return this._prefBranch.getBoolPref(name);
        } catch (ex) { return null; }
    };
    this.prefs.setValue = function(name,value)
    {
        if (typeof value == "string")
            return this._setStringValue(name, value);
        if (typeof value == "number")
            return this._setIntValue(name, value);
        if (typeof value == "boolean")
            return this._setBoolValue(name, value);
    };
    this.prefs._setStringValue = function(name, value)
    {
        try { 
            var str = Components.classes["@mozilla.org/supports-string;1"]
                .createInstance(Components.interfaces.nsISupportsString);
            str.data = value;
            this._prefBranch.setComplexValue(name, 
                Components.interfaces.nsISupportsString, str);
        } catch (ex) {}
    };
    this.prefs._setIntValue = function(name, value)
    {
        try { this._prefBranch.setIntPref(name, value);
        } catch (ex) {}
    };
    this.prefs._setBoolValue = function(name, value)
    {
        try { this._prefBranch.setBoolPref(name, value);
        } catch (ex) {}
    };
    
    if (!this.prefs.getValue("install-event-fired", false)) {
        this.prefs.setValue("install-event-fired", true);
        this.firstRun = true;
    }

}

var KFExtension = new KFE();