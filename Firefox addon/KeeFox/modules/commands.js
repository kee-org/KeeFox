/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2012 Chris Tomlinson <keefox@christomlinson.name>
  
  Draft notes for new command system...


  some sort of registration system?

  could hardcode stuff but cos we want it to be configurable (using "*" config?)
  we should make it more clever

  do we really want the extra complexity of per-site command changes? Don't think it will possible for many commands and invocations anyway.

  read whole lot from config json

  foreach feature (name, keyboard shortcut modifiers+key, rightclick location flags)
  go through each of those certain types of data and register relevant listeners and menus
  changing any config setting will trigger entire re-assignment but would be good to allow
  option for being more delicate in future in case performance is too poor


  e.g. of migration script approach for commands and config updates in future releases:

  where [i] goes up with each new config version and each config migration is applied in order, starting from the current version number

  migrations[i]: [
    {
        url: "*", // or some other kind of id
        config:{
            rescanFormDelay: { 
            action: edit, // add, delete
            equals: -1, // lessthan, greaterthan, notequals, etc.
            becomes: 1000, 
            force: false  // force controls whether user modifications since the previous migration will be overridden
            }
            interestingForms: {
                   name_w: {
                   action: delete
                   }
                   }
            }
    }
    ];


  example of keyboard shortcuts:

window.addEventListener("keydown", function(e)
    {
        if (e.ctrlKey && e.shiftKey)
        {
            if (e.keyCode == 70)
                doSomething();
            else if (e.keyCode == 68)
                doSomethingElse();
        }
    }, false);











  
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
//"use strict";

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cu = Components.utils;

keefox_org.commandManager = {

    default_commands: [
    {
        
    }
    ],

    cloneObj: function (obj)
    {
        //TODO: improve speed? See http://jsperf.com/clone/5
        //TODO: Might be useful in a utils location, not just for config manipulation
        return JSON.parse(JSON.stringify(obj));
    },

    getConfigForURL: function(url)
    {
        var workingConf;
        if (this.configCache[url] === undefined)
        {
            if (this.current[0].url != "*")
                throw "invalid config";

            workingConf = this.cloneObj(this.current[0].config);

            for (var i=1; i<this.current.length; i++) // skip first which is always "*"
            {
                if (url.indexOf(this.current[i].url) == 0)
                {
                    workingConf = this.applyMoreSpecificConfig(workingConf, this.current[i].config);
                }
            }
            keefox_org._KFLog.debug("Adding configuration to cache");
            this.configCache[url] = workingConf;
        } else
        {
            keefox_org._KFLog.debug("Returning configuration from cache");
            workingConf = this.configCache[url];
        }
        return workingConf;
    },

    applyMoreSpecificConfig: function(workingConfig, extraConfig)
    {
        for (var prop in extraConfig)
        {
            if (extraConfig.hasOwnProperty(prop))
            {
                try
                {
                    if (extraConfig[prop].constructor == Object || typeof(extraConfig[prop]) == "object")
                    {
                        workingConfig[prop] = this.applyMoreSpecificConfig(workingConfig[prop], extraConfig[prop]);
//                    } else if (typeof(extraConfig[prop].length) != "undefined")
//                    {
//                        for (let a in extraConfig[prop])
//                        {
//                            workingConfig[prop][a] = this.applyMoreSpecificConfig(workingConfig[prop][a], extraConfig[prop][a]);
//                        }
                    } else
                    {
                        workingConfig[prop] = extraConfig[prop];
                    }
                } catch(ex)
                {
                    workingConfig[prop] = extraConfig[prop];
                }
            }
        }
        return workingConfig;
    },

    load: function()
    {
        keefox_org._KFLog.debug("Loading configuration");
        //TODO: parse json from storage. If not found in storage assume it's first time run and load default config before calling save()
        var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
        var prefBranch = prefService.getBranch("extensions.keefox@chris.tomlinson.");

        try
        {
            var prefData = prefBranch.getComplexValue("config", Ci.nsISupportsString).data;
            var conf = JSON.parse(prefData);
            //TODO: In future check version here
            this.current = conf;
        } catch (ex) {
            var conf = JSON.parse(JSON.stringify(this.default_config)); //TODO: faster clone?
            this.current = conf;
            this.save();
        }
    },

    save: function()
    {
        keefox_org._KFLog.debug("Saving configuration");
        
        var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
        var prefBranch = prefService.getBranch("extensions.keefox@chris.tomlinson.");

        var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
        str.data = JSON.stringify(this.current);
        prefBranch.setComplexValue("config", Ci.nsISupportsString, str);

    },

    setConfigForURL: function(url,newConfig)
    {
        keefox_org._KFLog.debug("setConfigForURL");

        // Clear the curernt config cache.
        //TODO: would be more efficient to only remove affected URLs
        this.configCache = {};

        if (url == "*")
        {
            this.current[0].config = newConfig;
            return;
        }
        // example.com/page.htm
        // example.com/longerpage
        // example.com/longerpage2
        // example.com/dir/page.htm
        // example.com/dir/page2.htm
        // example.com/longerpage.htm

        // if above url is exact prefix of currently visited url we want to apply the config.
        // order is important cos we assume a match that occurs later must be more specific
        // think that will always be the case

        var insertionPoint = this.current.length;

        for (var i=1; i<this.current.length; i++) // skip the first default "*"
        {
            if (url.length > this.current[i].url.length)
            {
                //insertionPoint = i+1;
                continue;
            }
            if (url.length <= this.current[i].url.length)
            {
                insertionPoint = i;
                if (url == this.current[i].url)
                {
                    this.current[i].config = newConfig;
                    return;
                }
                break;
            }

        }

        if (insertionPoint == this.current.length)
            this.current = this.current.push({"url": url, "config": newConfig});
        else
            this.current.splice(insertionPoint,0,{"url": url, "config": newConfig});
        keefox_org._KFLog.debug(JSON.stringify(this.current));
    },

};

// initialise the command system (maybe do this from somewhere else?)
keefox_org.commandManager.load();
