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

var EXPORTED_SYMBOLS = ["KFCommands"];
Cu.import("resource://kfmod/KFLogger.js");
Cu.import("resource://kfmod/utils.js");
Cu.import("resource://kfmod/KFExtension.js");

function commandManager () {
    this._KFLog = KFLog;
  
    this.MOD_SHIFT = 1;
    this.MOD_ALT = 2;
    this.MOD_CTRL = 4;
    this.MOD_META = 8;
    this.CONTEXT_MAIN = 1;
    this.CONTEXT_SUB = 2;
    this.CONTEXT_INPUT = 4;
    this.CONTEXT_BUTTON = 8;

    this.MOD_DEFAULT = 5;

    this.default_commands = [];
    this.commandsConfigVersion = 2;

    this.setDefaultCommands = function()
    {
        this.default_commands = [
        {
            "name": "installKeeFox",
            "description": "installKeeFox.label",
            "keyboardModifierFlags": this.MOD_DEFAULT,
            "key": 50, // '2'
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": "installKeeFox.label",
            "tooltip": "installKeeFox.tip",
            "accesskey": ""
        },
        {
            "name": "launchKeePass",
            "description": "launchKeePass.label",
            "keyboardModifierFlags": this.MOD_DEFAULT,
            "key": 50,
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": "launchKeePass.label",
            "tooltip": "launchKeePass.tip",
            "accesskey": ""
        },
        {
            "name": "loginToKeePass",
            "description": "loggedOut.label",
            "keyboardModifierFlags": this.MOD_DEFAULT,
            "key": 50,
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": "loggedOut.label",
            "tooltip": "loggedOut.tip",
            "accesskey": ""
        },
        {
            "name": "showMenuMatchedLogins",
            "description": "KeeFox-matched-logins.label",
            "keyboardModifierFlags": this.MOD_DEFAULT,
            "key": 50,
            "contextLocationFlags": this.CONTEXT_SUB | this.CONTEXT_MAIN,
            "speech": {},
            "gesture": {},
            "label": "KeeFox-matched-logins.label",
            "tooltip": "", // No tooltip for a menu
            "accesskey": ""
        },
        {
            "name": "fillMatchedLogin",
            "description": "KeeFox-placeholder-for-best-match",
            "keyboardModifierFlags": this.MOD_DEFAULT,
            "key": 50,
            "contextLocationFlags": this.CONTEXT_SUB | this.CONTEXT_MAIN,
            "speech": {},
            "gesture": {},
            "label": "", // will be replaced with content from the best matched login
            "tooltip": "", // will be replaced with content from the best matched login
            "accesskey": ""
        },
        {
            "name": "showMenuKeeFox",
            "description": "KeeFox_Menu-Button.tip",
            "keyboardModifierFlags": this.MOD_DEFAULT,
            "key": 49, // '1'
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": "KeeFox_Menu-Button.label",
            "tooltip": "KeeFox_Menu-Button.tip",
            "accesskey": ""
        },
        {
            "name": "showMenuChangeDatabase",
            "description": "KeeFox_Menu-Button.changeDB.label",
            "keyboardModifierFlags": this.MOD_DEFAULT,
            "key": 53, // '5'
            "contextLocationFlags": this.CONTEXT_SUB,
            "speech": {},
            "gesture": {},
            "label": "KeeFox_Menu-Button.changeDB.label",
            "tooltip": "KeeFox_Menu-Button.changeDB.tip",
            "accesskey": ""
        },
        {
            "name": "detectForms",
            "description": "KeeFox_Menu-Button.fillCurrentDocument.label",
            "keyboardModifierFlags": this.MOD_DEFAULT,
            "key": 54, // '6'
            "contextLocationFlags": this.CONTEXT_SUB | this.CONTEXT_INPUT,
            "speech": {},
            "gesture": {},
            "label": "KeeFox_Menu-Button.fillCurrentDocument.label",
            "tooltip": "KeeFox_Menu-Button.fillCurrentDocument.tip",
            "accesskey": ""
        },
        {
            "name": "generatePassword",
            "description": "KeeFox_Menu-Button.copyNewPasswordToClipboard.label",
            "keyboardModifierFlags": this.MOD_DEFAULT,
            "key": 52, // '4'
            "contextLocationFlags": this.CONTEXT_SUB | this.CONTEXT_INPUT | this.CONTEXT_MAIN,
            "speech": {},
            "gesture": {},
            "label": "KeeFox_Menu-Button.copyNewPasswordToClipboard.label",
            "tooltip": "KeeFox_Menu-Button.copyNewPasswordToClipboard.tip",
            "accesskey": ""
        },
        /* Not intending to support these features until at least 1.4
        {
            "name": "showPanelOptions",
            "description": this.locale.$STR("KeeFox_Menu-Button.options.label"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": this.CONTEXT_SUB,
            "speech": {},
            "gesture": {},
            "label": this.locale.$STR("KeeFox_Menu-Button.options.label"),
            "tooltip": this.locale.$STR("KeeFox_Menu-Button.options.tip"),
            "accesskey": ""
        },
        {
            "name": "showPanelSiteOptions",
            "description": this.locale.$STR("KeeFox-site-options-title"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": this.locale.$STR("KeeFox-site-options-title"),
            "tooltip": this.locale.$STR("KeeFox-site-options-title"),
            "accesskey": ""
        },
        {
            "name": "showPanelSiteOptionsCurrentHost",
            "description": this.locale.$STR("someKindOfKey"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": this.locale.$STR("someKindOfKey"),
            "tooltip": this.locale.$STR("someKindOfKey"),
            "accesskey": ""
        },
        {
            "name": "showPanelSiteOptionsCurrentPage",
            "description": this.locale.$STR("someKindOfKey"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": this.locale.$STR("someKindOfKey"),
            "tooltip": this.locale.$STR("someKindOfKey"),
            "accesskey": ""
        },
        {
            "name": "showMenuHelp",
            "description": this.locale.$STR("someKindOfKey"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": this.locale.$STR("someKindOfKey"),
            "tooltip": this.locale.$STR("someKindOfKey"),
            "accesskey": ""
        },
        {
            "name": "showGettingStartedTutorial",
            "description": this.locale.$STR("KeeFox_Help-GettingStarted-Button.label"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": this.CONTEXT_SUB,
            "speech": {},
            "gesture": {},
            "label": this.locale.$STR("KeeFox_Help-GettingStarted-Button.label"),
            "tooltip": this.locale.$STR("KeeFox_Help-GettingStarted-Button.tip"),
            "accesskey": ""
        },
        {
            "name": "showHelpCenter",
            "description": "KeeFox_Help-Centre-Button.label",
            "keyboardModifierFlags": this.MOD_DEFAULT,
            "key": 54, // '6'
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": "KeeFox_Help-Centre-Button.label",
            "tooltip": "KeeFox_Help-Centre-Button.tip",
            "accesskey": ""
        },*/
        {
            "name": "showMenuLogins",
            "description": "KeeFox_Logins-Button.label",
            "keyboardModifierFlags": this.MOD_DEFAULT,
            "key": 51, // '3'
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": "KeeFox_Logins-Button.label",
            "tooltip": "KeeFox_Logins-Button.tip",
            "accesskey": ""
        }
//        {
//            "name": "autoTypeHere",
//            "description": this.locale.$STR("KeeFox-auto-type-here.label"),
//            "keyboardModifierFlags": this.MOD_DEFAULT,
//            "key": "4",
//            "contextLocationFlags": this.CONTEXT_INPUT,
//            "speech": {},
//            "gesture": {},
//            "label": this.locale.$STR("KeeFox-auto-type-here.label"),
//            "tooltip": this.locale.$STR("KeeFox-auto-type-here.tip"),
//            "accesskey": ""
//        }
        ];
    };

    // Hard coded set of command conditions that can determine whether a given command is
    // allowed to run (or whether a possibly lower priority command can run instead)
    // sanity checks for valid state should be performed in the main action if you don't
    // want an alternative action to execute instead
    // If a condition evaluates to false then it won't be displayed on a context menu
    this.conditions = {
        launchKeePass: function()
        {
            let keeFoxStorage = utils.getWindow().keefox_org._keeFoxStorage;
            return (!keeFoxStorage.get("KeePassRPCActive", false)
                    && keeFoxStorage.get("KeePassRPCInstalled", false)
                    && !keeFoxStorage.get("KeePassDatabaseOpen", false));
        },
        loginToKeePass: function()
        {
            let keeFoxStorage = utils.getWindow().keefox_org._keeFoxStorage;
            return (keeFoxStorage.get("KeePassRPCActive", false)
                    && keeFoxStorage.get("KeePassRPCInstalled", false)
                    && !keeFoxStorage.get("KeePassDatabaseOpen", false));
        },
        installKeeFox: function()
        {
            let keeFoxStorage = utils.getWindow().keefox_org._keeFoxStorage;
            if (!keeFoxStorage.get("KeePassRPCInstalled", false))
                return true;
            return false;
        },
        fillMatchedLogin: function()
        {
            let win = utils.getWindow();
            let keeFoxStorage = win.keefox_org._keeFoxStorage;
            if (!(keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keeFoxStorage.get("KeePassRPCActive", false)))
                return false;
            let container;

            container = win.document.getElementById("KeeFox-PanelSubSection-MatchedLoginsList");
            if (!container)
                return false;
            let matches = container.getElementsByTagName('li');
            if (!matches)
                return false;
            let firstMatch = matches[0];
            if (!firstMatch)
                return false;
            if (!firstMatch.getAttribute('data-uuid'))
                return false;

            return true;
        },
        showMenuMatchedLogins: function(target)
        {
            let win = utils.getWindow();
            let keeFoxStorage = win.keefox_org._keeFoxStorage;
            if (!(keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keeFoxStorage.get("KeePassRPCActive", false)))
                return false;

            //TODO:1.6: Needs more work to support alternative matched logins configuration that puts all logins into the overflow div
            let container = win.document.getElementById("KeeFox-PanelSubSection-MatchedLoginsList");
            if (!container)
                return false;
            let matches = container.getElementsByTagName('li');
            if (!matches)
                return false;
            if (matches.length <= 1)
                return false;

            return true;
        },
        generatePassword: function()
        {
            let keeFoxStorage = utils.getWindow().keefox_org._keeFoxStorage;
            return (keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keeFoxStorage.get("KeePassRPCActive", false));
        },
        showMenuChangeDatabase: function()
        {
            let keeFoxStorage = utils.getWindow().keefox_org._keeFoxStorage;
            return (keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keeFoxStorage.get("KeePassRPCActive", false));
        },
        detectForms: function()
        {
            let keeFoxStorage = utils.getWindow().keefox_org._keeFoxStorage;
            return (keeFoxStorage.get("KeePassDatabaseOpen", false) 
                && keeFoxStorage.get("KeePassRPCActive", false));
        },
        showMenuGeneratePassword: function()
        {
            let keeFoxStorage = utils.getWindow().keefox_org._keeFoxStorage;
            return (keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keeFoxStorage.get("KeePassRPCActive", false));
        },
        showMenuLogins: function()
        {
            let win = utils.getWindow();
            let keeFoxStorage = win.keefox_org._keeFoxStorage;
            if (keeFoxStorage.get("KeePassDatabaseOpen", false) 
                && keeFoxStorage.get("KeePassRPCActive", false))
                return true;
            else
                return false;
        }
    };

    // Hard coded set of command functions that don't care how they were invoked
    this.actions = {
        showMenuKeeFox: function()
        {
            let win = utils.getWindow();
            if (!win) return;

            win.keefox_win.panel.displayPanel();
            win.keefox_win.panel.hideSubSections();
        },
        launchKeePass: function()
        {
            let win = utils.getWindow();
            win.keefox_org.launchKeePass('');
        },
        loginToKeePass: function()
        {
            utils.getWindow().keefox_org.loginToKeePass();
        },
        showMenuChangeDatabase: function(target)
        {
            let win = utils.getWindow();
            if (!win) return;
            win.keefox_win.panel.displayPanel();
            win.keefox_win.panel.hideSubSections();
            win.keefox_win.panel.showSubSectionChangeDatabase();
        },
        detectForms: function()
        {
            let win = utils.getWindow();
            if (!win) return;

            win.keefox_org.metricsManager.pushEvent ("feature", "detectForms");
            var currentGBrowser = win.gBrowser;
            // Notify all parts of the UI that might need to clear their matched logins data
            win.keefox_win.mainUI.removeLogins();
            win.gBrowser.selectedBrowser.messageManager.sendAsyncMessage("keefox:findMatches", {
                autofillOnSuccess: true,
                autosubmitOnSuccess: false,
                notifyUserOnSuccess: false
            });
        },
        generatePassword: function()
        {
            let win = utils.getWindow();
            if (!win) return;
            win.keefox_win.panel.displayPanel();
            win.keefox_win.panel.hideSubSections();
            win.keefox_win.panel.showSubSectionGeneratePassword();
        },
        /* Not intending to support these features until at least 1.4
        showPanelOptions: function()
        {
            let win = utils.getWindow();
            if (!win) return;
        },
        showPanelSiteOptions: function()
        {
            let win = utils.getWindow();
            if (!win) return;
            var container = win.document.getElementById("menu_ToolsPopup-options");
            if (!container)
                return;
            container.doCommand();
        },
        showPanelSiteOptionsCurrentHost: function()
        {

        },
        showPanelSiteOptionsCurrentPage: function()
        {

        },
        showMenuHelp: function(target)
        {

        },
        */
        showGettingStartedTutorial: function()
        {
            let win = utils.getWindow();
            if (!win) return;
            var container = win.document.getElementById("KeeFox_Help-GettingStarted-Button");
            if (!container)
                return;
            container.doCommand();
        },
        showHelpCenter: function()
        {
            let win = utils.getWindow();
            if (!win) return;

            if (win.keefox_win.legacyUI)
            {
                var container = win.document.getElementById("KeeFox_Help-Centre-Button");
                if (!container)
                    return;
                container.doCommand();
            } else
            {
                win.keefox_org.utils._openAndReuseOneTabPerURL('http://keefox.org/help'); 
            }
        },
        installKeeFox: function()
        {
            utils.getWindow().keefox_org.KeeFox_MainButtonClick_install();
        },
        showMenuLogins: function()// could target in future (e.g. if we want to include all logins in a submenu of the context menu?))
        {
            let win = utils.getWindow();
            let keeFoxStorage = win.keefox_org._keeFoxStorage;
            if (keeFoxStorage.get("KeePassDatabaseOpen", false) 
                && keeFoxStorage.get("KeePassRPCActive", false))
            {
                win.keefox_win.panel.displayPanel();
                win.keefox_win.panel.hideSubSections();
                win.keefox_win.panel.showSubSectionAllLogins();
            }
        },
        fillMatchedLogin: function()
        {
            let win = utils.getWindow();
            let keeFoxStorage = win.keefox_org._keeFoxStorage;
            if (!(keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keeFoxStorage.get("KeePassRPCActive", false)))
                return;
                
            //TODO:1.6: Make this work when matched logins are displayed in the KeeFox-PanelSubSection-MatchedLoginsList-Overflow instead
            var container = win.document.getElementById("KeeFox-PanelSubSection-MatchedLoginsList");
            if (!container)
                return;
            let matches = container.getElementsByTagName('li');
            if (!matches)
                return;
            let firstMatch = matches[0];
            if (!firstMatch)
                return;
            if (!firstMatch.getAttribute('data-uuid'))
                return;

            firstMatch.dispatchEvent(new Event("keefoxCommand"));
            return;
        },
        showMenuMatchedLogins: function(target)
        {
            let win = utils.getWindow();
            let keeFoxStorage = win.keefox_org._keeFoxStorage;

            if (!(keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keeFoxStorage.get("KeePassRPCActive", false)))
                return;

            //TODO:1.6: Make this work when matched logins are displayed in the KeeFox-PanelSubSection-MatchedLoginsList-Overflow instead
            win.keefox_win.panel.displayPanel();
            win.keefox_win.panel.hideSubSections();
            let container = win.document.getElementById("KeeFox-PanelSubSection-MatchedLoginsList");
            if (!container)
                return;
            let matches = container.getElementsByTagName('li');
            if (!matches)
                return;
            let firstMatch = matches[0];
            if (!firstMatch)
                return;
            firstMatch.focus();
        },
        autoTypeHere: function()
        {
            
        }
    };

    this.init = function (locale)
    {
        this.locale = locale;
        this.keeFoxStorage = KFExtension.storage;
        this.setDefaultCommands();
        this.load();
        this.resolveConfiguration();
    };

    this.kbEventHandler = function (e)
    {
        //TODO:2: Can we find the context from the event?
        let win = utils.getWindow();
        let keefox_org = win.keefox_org;

        // establish which key was pressed
        let key = e.keyCode;

        let modifierIndex = (e.ctrlKey ? keefox_org.commandManager.MOD_CTRL : 0) | 
                            (e.altKey ? keefox_org.commandManager.MOD_ALT : 0) | 
                            (e.shiftKey ? keefox_org.commandManager.MOD_SHIFT : 0) | 
                            (e.metaKey ? keefox_org.commandManager.MOD_META : 0);
        let keyConfig = keefox_org.commandManager.activeKeys[modifierIndex][key];
        if (keyConfig)
        {
            for (let i=0; i<keyConfig.length; i++)
            {
                let commandName = keyConfig[i];
                if (typeof keefox_org.commandManager.conditions[commandName] === 'function')
                    if (!keefox_org.commandManager.conditions[commandName]())
                        continue;
                keefox_org._KFLog.debug("Executing command action: " + commandName);
                keefox_org.metricsManager.adjustAggregate("keyboardShortcutsPressed", 1);
                //TODO:2: Pass event target information to action
                keefox_org.commandManager.actions[commandName]();
                break;
            }
        }
    }

    // set of keys we are interested in listening to. KB listening events are always passed through to our event handler so we use this 2d "array" to quickly determine if we are interested in the particular key combination the user has just fired. The array is initialised in setupListeners()
    this.activeKeys = [],

    // No point in registering a listener if we end up not wanting to respond to any events
    this.listenToKeyboard = false;

    this.resolveConfiguration = function ()
    {
        // initialise every possible modifier key combination (saves us time and complication when processing a key event)
        this.activeKeys = [];

        for (let i=0; i<(this.MOD_SHIFT | this.MOD_ALT | this.MOD_CTRL | this.MOD_META); i++)
            this.activeKeys[i] = {};

        for (let i=0; i<this.commands.length; i++)
        {
            // Not interested in keyboard events for this command unless we have a keyboard key configured
            if (this.commands[i].key != undefined && this.commands[i].key != null && this.commands[i].key > 0)
            {
                if (!(this.activeKeys[this.commands[i].keyboardModifierFlags][this.commands[i].key] instanceof Array))
                    this.activeKeys[this.commands[i].keyboardModifierFlags][this.commands[i].key] = [];
                this.activeKeys[this.commands[i].keyboardModifierFlags][this.commands[i].key].push(this.commands[i].name);
                this.listenToKeyboard = true;
            }
        }
    };

    this.contextSubPopupShowing = function(event)
    {
        let children = event.target.ownerDocument.getElementById('keefox-command-context-sub-popup').children;
        for (let i=0; i < children.length; i++)
        {
            let mi = children[i];
            if (mi.id.indexOf("keefox-command-context-") != 0)
                continue;

            let keefox_org = utils.getWindow().keefox_org;

            // Set default visibility for this menu item
            // Should always be false but just in case...
            mi.hidden = !(mi.keeFoxValidContexts & keefox_org.commandManager.CONTEXT_SUB);

            // Update visibility for this menu item based upon the current KeeFox state
            if (typeof keefox_org.commandManager.conditions[mi.keeFoxCommandName] === 'function')
                mi.hidden = mi.hidden || !keefox_org.commandManager.conditions[mi.keeFoxCommandName]();
        }
    };

    this.contextMainPopupShowing = function(event)
    {
        if (event.target.ownerDocument.defaultView.gContextMenu == null)
            return; // not a context menu (e.g. tooltip)

        let children = event.target.ownerDocument.getElementById('contentAreaContextMenu').children;
        for (let i=0; i < children.length; i++)
        {
            let mi = children[i];
            if (mi.id.indexOf("keefox-command-context-") != 0)
                continue;
                
            let keefox_org = utils.getWindow().keefox_org;

            // Set default visibility for this menu item
            let textEnabled = mi.keeFoxValidContexts & keefox_org.commandManager.CONTEXT_INPUT;
            let mainEnabled = mi.keeFoxValidContexts & keefox_org.commandManager.CONTEXT_MAIN;
            mi.hidden = !((event.target.ownerDocument.defaultView.gContextMenu.onTextInput && textEnabled) 
                        || (!event.target.ownerDocument.defaultView.gContextMenu.onTextInput && mainEnabled));

            // Update visibility for this menu item based upon the current KeeFox state
            if (typeof keefox_org.commandManager.conditions[mi.keeFoxCommandName] === 'function')
                mi.hidden = mi.hidden || !keefox_org.commandManager.conditions[mi.keeFoxCommandName]();
        }
    };

    // Setup listeners and context menus for the supplied window object
    this.setupListeners = function (win)
    {
        for (let i=0; i<this.commands.length; i++)
        {
            //TODO:1.6: ? Need to work on what constitutes a disabled/hidden menu item. need to be invisible and detached in an ideal world.
            if (this.commands[i].contextLocationFlags & this.CONTEXT_MAIN 
                || this.commands[i].contextLocationFlags & this.CONTEXT_INPUT
                || this.commands[i].contextLocationFlags & this.CONTEXT_BUTTON)
            {
                // Find any existing node with this command's ID and enable it.
                // nodes can't be disabled again afterwards but that's not a feature we
                // directly expose to the user so a browser restart is an acceptable compromise
                let item = win.document.getElementById("keefox-command-context-" + this.commands[i].name);
                if (!item)
                {
                    // not found in existing dom structure so lets add it
                    // we only support adding menuitems dynamically like this
                    // i.e. adding sub menu elements needs to be done by ensuring
                    // they are already in the dom before this init happens (e.g. via XUL config)
                    let mi = win.document.createElement("menuitem");
                    mi.setAttribute("id","keefox-command-context-" + this.commands[i].name);
                    win.document.getElementById('contentAreaContextMenu').appendChild(mi);
                    item = mi;
                }
                item.setAttribute("disabled", false);
                item.setAttribute("label", this.locale.$STR(this.commands[i].label));
                item.setAttribute("tooltip", this.locale.$STR(this.commands[i].tooltip));
                //item.setAttribute("accesskey", this.commands[i].accesskey);                
                item.keeFoxCommandName = this.commands[i].name;
                item.keeFoxValidContexts = this.commands[i].contextLocationFlags;
                item.addEventListener("command", function(event) {
                        let kf = utils.getWindow().keefox_org;
                        kf.metricsManager.adjustAggregate("contextMenuItemsPressed", 1);
                        kf.commandManager.actions[this.keeFoxCommandName]();
                    }, false);
            }

            //TODO:1.6: repeat for submenu context type

        }

        if (this.listenToKeyboard)
        {
            // attach our keyboard listener
            this._KFLog.debug("Attaching keyboard listener");
            win.addEventListener("keydown", this.kbEventHandler, false);
        } else
        {
            this._KFLog.debug("No need to attach keyboard listener");
        }

    };

    this.cloneObj = function (obj)
    {
        //TODO:2: improve speed? See http://jsperf.com/clone/5 https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm ?
        //TODO:2: Might be useful in a utils location, not just for config manipulation
        return JSON.parse(JSON.stringify(obj));
    };

    this.commands = [];

    this.load = function()
    {
        this._KFLog.debug("Loading commands");
        var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
        var prefBranch = prefService.getBranch("extensions.keefox@chris.tomlinson.");

        try
        {
            var prefData = prefBranch.getComplexValue("commands", Ci.nsISupportsString).data;
            var coms = JSON.parse(prefData);
            var currentVersion = prefBranch.getIntPref("commandsVersion");
            // Backwards migrations are not supported
            if (currentVersion < this.commandsConfigVersion)
                this.migrateConfig(currentVersion, this.commandsConfigVersion, coms);
            else
                this.commands = coms;
        } catch (ex) {
            var coms = JSON.parse(JSON.stringify(this.default_commands)); //TODO:2: faster clone? https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm ?
            this.commands = coms;
            this.save();
        }
    };

    this.save = function()
    {
        this._KFLog.debug("Saving commands");
        
        var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
        var prefBranch = prefService.getBranch("extensions.keefox@chris.tomlinson.");

        var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
        str.data = JSON.stringify(this.commands);
        prefBranch.setComplexValue("commands", Ci.nsISupportsString, str);
        
        prefBranch.setIntPref("commandsVersion",this.commandsConfigVersion);
    };

    this.migrateConfig = function(currentVersion, newVersion, currentConfig)
    {
        // If anything goes wrong with the migration, we just let the catch 
        // in load() deal with it (reset to the latest defaults)

        // Nice and easy to start with; we have only one possible migration path ...
        if (currentVersion == 1 && newVersion == 2)
        {
            // ... and that migration path makes no modifications to the default
            // configuration of the handful of commands that were supported in 
            // version 1 so we just start with the default v2 config and overwrite
            // some select objects from the existing configuration
            let newConfig = this.default_commands;
            let commandsToMigrate = ["installKeeFox","launchKeePass","loginToKeePass",
                "showMenuMatchedLogins","fillMatchedLogin","showMenuKeeFox","showMenuLogins"];
            let mergedConfig = newConfig.map(function (newItem) { 
                if (commandsToMigrate.indexOf(newItem.name) >= 0)
                    return currentConfig.filter(function (currentItem) { 
                        return currentItem.name === newItem.name;
                    })[0];
                else
                    return newItem;
            });
            // need to debug this. for some reason, the new config is identical to the old one, although i've checked that the new data is available in the default config array
            this.commands = mergedConfig;
            this.save();
        }
    };

}

var KFCommands = new commandManager;
