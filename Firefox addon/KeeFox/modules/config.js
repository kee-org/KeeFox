/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2012 Chris Tomlinson <keefox@christomlinson.name>

  Configuration of KeeFox behaviour occurs in several places. This config
  file is the newest as of Oct 2012. Ultimately other configuration will be
  added to this config file, either directly or via abstractions to existing
  config data stores. For other configuration look to the standard Firefox
  preferences system and a keefox.sqlite file.
  Entry-specific configuration is stored in KeePass but in future maybe
  we'll still make it available from this interface.

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

var EXPORTED_SYMBOLS = ["KFConfig"];
Cu.import("resource://kfmod/KFLogger.js");

// constructor
function config()
{
    this._KFLog = KFLog;

    this.default_config = [
    {
        url: "*",
        config:{
            rescanFormDelay: -1, // to +INTMAX, // if old "rescan forms" set to true - configure to whatever that default was (5 seconds?)
            /* TODO:2: ? (Might be redundant since changes for e10s). In future we can give finer control of form rescanning behaviour from here
            rescanDOMevents:
            [{

                // /html/body/div[3]/div/h1/small

                type: "click" | "mutation" | "hover" | etc,
                xpath: "/html/body/div[3]/div/h1/small", // we should do a sanity check on returned items and limit to max of ~a hundred DOM nodes
                id: "someID",
                //something else to limit mutation events to create one (e.g. creation of new child item matching certain xpath? etc.)
            }],
            */
            interestingForms: {
                /*
                Forms will be scanned iff they have a password (type) field
                UNLESS one of the interestingForms arrays matches the form in question.
                All (w)hitelists will force the form to be scanned for matching passwords.
                (b)lacklists will prevent the form being scanned.
                (b)lacklists have priority over whitelists of the same type but the priorities
                of different types of check are undefined here - you'll have to look at the
                behaviour of the form matching code which is subject to change.
                */
                name_w: ["login"],
                name_b: ["search"],
                id_w: ["login"],
                id_b: ["search"],
                //f_type_w: ["password"],
                //f_type_b: [],
                f_name_w: ["username","j_username","user_name","user","user-name","login","vb_login_username","name","user name","user id","user-id","userid","email","e-mail","id","form_loginname","wpname","mail","loginid","login id","login_name","openid_identifier","authentication_email","openid","auth_email","auth_id","authentication_identifier","authentication_id","customer_number","customernumber","onlineid"],
                f_name_b: ["search","q","query"],
                f_id_w: ["username","j_username","user_name","user","user-name","login","vb_login_username","name","user-id","userid","email","e-mail","id","form_loginname","wpname","mail","loginid","login_name","openid_identifier","authentication_email","openid","auth_email","auth_id","authentication_identifier","authentication_id","customer_number","customernumber","onlineid"],
                f_id_b: ["search","q"],

                // simple string comparisons won't work here becuase multiple
                // xpaths could lead to the same element. Each xpath listed here
                // will have to be found and any discovered element's parent
                // form then compared against the potentially interesting form
                xpath_w: [],
                xpath_b: [],
                f_xpath_w: [],
                f_xpath_b: []
            },
            preventSaveNotification: false
        }
    },
    {
        url:"https://login.live.com/",
        config:{
            rescanFormDelay: 2500
        }
    },
    {
        url:"https://login.microsoftonline.com/",
        config:{
            rescanFormDelay: 2500
        }
    },
    {
        url:"http://www.bild.de/",
        config:{
            rescanFormDelay: 2500
        }
    },
    {
        url:"https://www.bild.de/",
        config:{
            rescanFormDelay: 2500
        }
    }

    /*,
    {
        url:"http://domain.name/page.html?...",
        config:{
            ...
        }
    }
    */
    ];

    this.valueAllowed = function(val,whitelist,blacklist,def)
    {
        if (val === undefined || val === null)
            return def;

        for (var b in blacklist)
            if (blacklist[b].toLowerCase() == val.toLowerCase())
            {
                this._KFLog.debug("Value found in blacklist");
                // a blacklist match always overrides the existing default behaviour
                return false;
            }
        for (var w in whitelist)
            if (whitelist[w].toLowerCase() == val.toLowerCase())
            {
                this._KFLog.debug("Value found in whitelist");
                // a whitelist match only overrides an unspecified default behaviour
                if (def == null)
                    return true;
            }
        return def;
    };

    this.configCache = {};

    this.cloneObj = function (obj)
    {
        //TODO:2: improve speed? See http://jsperf.com/clone/5 https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm ?
        //TODO:2: Might be useful in a utils location, not just for config manipulation
        return JSON.parse(JSON.stringify(obj));
    };

    this.getConfigDefinitionForURL = function(url)
    {
        for (var i=1; i<this.current.length; i++) // skip first which is always "*"
        {
            if (url == this.current[i].url)
            {
                return this.current[i].config;
            }
        }

        // No config defined yet
        return {};
    };

    this.getConfigForURL = function(url)
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
            this._KFLog.debug("Adding configuration to cache");
            this.configCache[url] = workingConf;
        } else
        {
            this._KFLog.debug("Returning configuration from cache");
            workingConf = this.configCache[url];
        }
        return workingConf;
    };

    this.removeURLFromCache = function(url){
        for(var curl in this.configCache)
        {
            if(curl.startsWith(url))
            {
                delete this.configCache[curl];
                this._KFLog.debug("Remove config cache entry '"+curl+"' for URL '"+url+"'");
            }
        }
    };

    this.applyMoreSpecificConfig = function(workingConfig, extraConfig)
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
    };

    this.load = function()
    {
        this._KFLog.debug("Loading configuration");
        // Parse json from storage. If not found in storage assume it's first time run and load default config before calling save()
        var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
        var prefBranch = prefService.getBranch("extensions.keefox@chris.tomlinson.");

        try
        {
            var prefData = prefBranch.getComplexValue("config", Ci.nsISupportsString).data;
            var conf = JSON.parse(prefData);
            //TODO:2: In future check version here and apply migrations if needed
            //var currentVersion = prefBranch.getIntPref("configVersion");
            this.current = conf;
        } catch (ex) {
            var conf = JSON.parse(JSON.stringify(this.default_config)); //TODO:2: faster clone? https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm ?
            this.current = conf;
            this.save();
        }
    };

    this.save = function()
    {
        this._KFLog.debug("Saving configuration");

        var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
        var prefBranch = prefService.getBranch("extensions.keefox@chris.tomlinson.");

        var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
        str.data = JSON.stringify(this.current);
        prefBranch.setComplexValue("config", Ci.nsISupportsString, str);

        //TODO:1.5: Stop forcing this to 1 when we release the first new version
        //TODO:1.5: Update to 2 required so we can remove page monitoring option? (Probably just remove it from UI and leave this unchanged).
        prefBranch.setIntPref("configVersion",1);
    };

    this.setConfigForURL = function(url,newConfig)
    {
        this._KFLog.debug("setConfigForURL");

        // Clear the current config cache.
        //TODO:2: would be more efficient to only remove affected URLs
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
            this.current.push({"url": url, "config": newConfig});
        else
            this.current.splice(insertionPoint,0,{"url": url, "config": newConfig});
        this._KFLog.debug(JSON.stringify(this.current));
    };

    this.removeUrl = function(url)
    {
        if(url == "*") return;
        for (var i=0; i<this.current.length; i++)
        {
            if (url == this.current[i].url)
            {
                this.current.splice(i, 1);
                this.removeURLFromCache(url);
                this._KFLog.debug("URL '"+url+"' removed");
                break;
            }
        }
    };

    this.migrateListOfNoSavePromptURLs = function(urls)
    {
        // We know that no custom config has already been set when this is called so that keeps things simple

        for (let i=0; i<urls.length; i++)
        {
            let newConfig = this.applyMoreSpecificConfig(JSON.parse(JSON.stringify(this.getConfigDefinitionForURL(urls[i]))), { "preventSaveNotification": true }); //TODO:2: faster clone? https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm ?
            this.setConfigForURL(urls[i],newConfig);
        }
        this.save();
    };

    this.migrateRescanFormTimeFromFFPrefs = function(enabled)
    {
        // We know that no custom config has already been set when this is called so that keeps things simple
        // this migration only affects the default behaviour "*"
        let newConfig = this.current[0].config;
        newConfig.rescanFormDelay = enabled ? 2500 : -1;
        this.setConfigForURL("*",newConfig);
        this.save();
    };
}

var KFConfig = new config;

let globalMM = Cc["@mozilla.org/globalmessagemanager;1"].getService(Ci.nsIMessageListenerManager);
globalMM.addMessageListener("keefox:config-valueAllowed", function (message) { 
    return KFConfig.valueAllowed(message.data.val, message.data.whitelist, message.data.blacklist, message.data.def); });
globalMM.addMessageListener("keefox:config-getConfigForURL", function (message) { 
    return KFConfig.getConfigForURL(message.data.url); });