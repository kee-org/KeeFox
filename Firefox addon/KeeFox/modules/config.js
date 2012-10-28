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
//"use strict";

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cu = Components.utils;

keefox_org.config = {

    default_config: [
    {
        url: "*",
        config:{
            rescanFormDelay: -1, // to +INTMAX, // if old "rescan forms" set to true - configure to whatever that default was (5 seconds?)
            /* TODO: In future we can give finer control of form rescanning behaviour from here
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
                f_name_w: ["username","j_username","user_name","user","user-name","login","vb_login_username","name","user name","user id","user-id","userid","email","e-mail","id","form_loginname","wpname","mail","loginid","login id","login_name"],
                f_name_b: ["search","q","query"],
                f_id_w: ["username","j_username","user_name","user","user-name","login","vb_login_username","name","user-id","userid","email","e-mail","id","form_loginname","wpname","mail","loginid","login_name"],
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
            /*
            TODO: In future we can migrate other preferences to here
            ,
            flashOnLoggedOut: true,
            flashOnNotRunning: true,
            notifyOnLoggedOut: true,
            notifyOnNotRunning: true
            */
        }
    },
    {
        url:"https://login.live.com/",
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
    ],

    valueAllowed: function(val,whitelist,blacklist,def)
    {
        for (var b in blacklist)
            if (blacklist[b] == val)
            {
                keefox_org._KFLog.debug("Value found in blacklist");
                return false;
            }
        for (var w in whitelist)
            if (whitelist[w] == val)
            {
                keefox_org._KFLog.debug("Value found in whitelist");
                return true;
            }
        return def;
    },

    configCache: {},

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
                    if (extraConfig[prop].constructor == Object)
                    {
                        workingConfig[prop] = applyMoreSpecificConfig(workingConfig[prop], extraConfig[prop]);
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
        this.current = this.default_config;
    },

    save: function()
    {
        keefox_org._KFLog.debug("Saving configuration");
        //TODO: write json to storage
    },

    setConfigForURL: function(url,newConfig)
    {
        //TODO: insert or update to relevant current config entry. make sure insertion occurs in key length order (iterate looking for spot to insert and then do some array split and joins)
    },

    migrateFromSqliteSchema1: function()
    {
        // We know that no custom config has already been set when this is called so that keeps things simple
        //TODO: Although not this simple
    },

    migrateRescanFormTimeFromFFPrefs: function()
    {
        // We know that no custom config has already been set when this is called so that keeps things simple
        //TODO: Although not this simple
    }

};

// initialise the configuration (usually from some kind of local storage TBD)
keefox_org.config.load();
