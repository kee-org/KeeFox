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
//"use strict";

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cu = Components.utils;

keefox_org.commandManager = {
  
    MOD_SHIFT: 1,
    MOD_ALT: 2,
    MOD_CTRL: 4,
    MOD_META: 8,
    CONTEXT_MAIN: 1,
    CONTEXT_SUB: 2,
    CONTEXT_INPUT: 4,
    CONTEXT_BUTTON: 8,

    MOD_DEFAULT: 5,

    default_commands: [],

    setDefaultCommands: function()
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
            "keyboardModifierFlags": 0,
            "key": null,
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
            "keyboardModifierFlags": 0,
            "key": null,
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
            "keyboardModifierFlags": 0,
            "key": null,
            "contextLocationFlags": this.CONTEXT_SUB | this.CONTEXT_INPUT | this.CONTEXT_MAIN,
            "speech": {},
            "gesture": {},
            "label": "KeeFox_Menu-Button.copyNewPasswordToClipboard.label",
            "tooltip": "KeeFox_Menu-Button.copyNewPasswordToClipboard.tip",
            "accesskey": ""
        },
        /* Not intending to support these features until at least 1.4
        {
            "name": "showMenuGeneratePassword",
            "description": keefox_org.locale.$STR("KeeFox_Menu-Button.generatePasswordFromProfile.label"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": this.CONTEXT_SUB | this.CONTEXT_INPUT,
            "speech": {},
            "gesture": {},
            "label": keefox_org.locale.$STR("KeeFox_Menu-Button.generatePasswordFromProfile.label"),
            "tooltip": keefox_org.locale.$STR("KeeFox_Menu-Button.generatePasswordFromProfile.tip"),
            "accesskey": ""
        },
        {
            "name": "showPanelOptions",
            "description": keefox_org.locale.$STR("KeeFox_Menu-Button.options.label"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": this.CONTEXT_SUB,
            "speech": {},
            "gesture": {},
            "label": keefox_org.locale.$STR("KeeFox_Menu-Button.options.label"),
            "tooltip": keefox_org.locale.$STR("KeeFox_Menu-Button.options.tip"),
            "accesskey": ""
        },
        {
            "name": "showPanelSiteOptions",
            "description": keefox_org.locale.$STR("KeeFox-site-options-title"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": keefox_org.locale.$STR("KeeFox-site-options-title"),
            "tooltip": keefox_org.locale.$STR("KeeFox-site-options-title"),
            "accesskey": ""
        },
        {
            "name": "showPanelSiteOptionsCurrentHost",
            "description": keefox_org.locale.$STR("someKindOfKey"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": keefox_org.locale.$STR("someKindOfKey"),
            "tooltip": keefox_org.locale.$STR("someKindOfKey"),
            "accesskey": ""
        },
        {
            "name": "showPanelSiteOptionsCurrentPage",
            "description": keefox_org.locale.$STR("someKindOfKey"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": keefox_org.locale.$STR("someKindOfKey"),
            "tooltip": keefox_org.locale.$STR("someKindOfKey"),
            "accesskey": ""
        },
        {
            "name": "showMenuHelp",
            "description": keefox_org.locale.$STR("someKindOfKey"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": 0,
            "speech": {},
            "gesture": {},
            "label": keefox_org.locale.$STR("someKindOfKey"),
            "tooltip": keefox_org.locale.$STR("someKindOfKey"),
            "accesskey": ""
        },
        {
            "name": "showGettingStartedTutorial",
            "description": keefox_org.locale.$STR("KeeFox_Help-GettingStarted-Button.label"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": this.CONTEXT_SUB,
            "speech": {},
            "gesture": {},
            "label": keefox_org.locale.$STR("KeeFox_Help-GettingStarted-Button.label"),
            "tooltip": keefox_org.locale.$STR("KeeFox_Help-GettingStarted-Button.tip"),
            "accesskey": ""
        },
        {
            "name": "showHelpCenter",
            "description": keefox_org.locale.$STR("KeeFox_Help-Centre-Button.label"),
            "keyboardModifierFlags": 0,
            "key": "",
            "contextLocationFlags": this.CONTEXT_SUB,
            "speech": {},
            "gesture": {},
            "label": keefox_org.locale.$STR("KeeFox_Help-Centre-Button.label"),
            "tooltip": keefox_org.locale.$STR("KeeFox_Help-Centre-Button.tip"),
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
//            "description": keefox_org.locale.$STR("KeeFox-auto-type-here.label"),
//            "keyboardModifierFlags": this.MOD_DEFAULT,
//            "key": "4",
//            "contextLocationFlags": this.CONTEXT_INPUT,
//            "speech": {},
//            "gesture": {},
//            "label": keefox_org.locale.$STR("KeeFox-auto-type-here.label"),
//            "tooltip": keefox_org.locale.$STR("KeeFox-auto-type-here.tip"),
//            "accesskey": ""
//        }
        ];
    },

    // Hard coded set of command conditions that can determine whether a given command is
    // allowed to run (or whether a possibly lower priority command can run instead)
    // sanity checks for valid state should be performed in the main action if you don't
    // want an alternative action to execute instead
    // If a condition evaluates to false then it won't be displayed on a context menu
    conditions: {
        launchKeePass: function()
        {
            return (!keefox_org._keeFoxStorage.get("KeePassRPCActive", false)
                    && keefox_org._keeFoxStorage.get("KeePassRPCInstalled", false)
                    && !keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false));
        },
        loginToKeePass: function()
        {
            return (keefox_org._keeFoxStorage.get("KeePassRPCActive", false)
                    && keefox_org._keeFoxStorage.get("KeePassRPCInstalled", false)
                    && !keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false));
        },
        installKeeFox: function()
        {
            if (!keefox_org._keeFoxStorage.get("KeePassRPCInstalled", false))
                return true;
            return false;
        },
        fillMatchedLogin: function()
        {
            if (!(keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keefox_org._keeFoxStorage.get("KeePassRPCActive", false)))
                return false;

            let win = keefox_org.commandManager.getWindow();
            if (!win) return false;
            var container = win.document.getElementById("KeeFox_Main-Button");
            if (!container)
                return false;
            if (!container.getAttribute('uuid'))
                return false;

            return true;
        },
        showMenuMatchedLogins: function(target)
        {
            if (!(keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keefox_org._keeFoxStorage.get("KeePassRPCActive", false)))
                return false;

            let win = keefox_org.commandManager.getWindow();
            if (!win) return false;
            var loginsPopup = win.document.getElementById("KeeFox_Main-ButtonPopup");
            if (!loginsPopup)
                return false;
            if (loginsPopup.childNodes.length <= 1)
                return false;

            return true;
        },
        generatePassword: function()
        {
            return (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keefox_org._keeFoxStorage.get("KeePassRPCActive", false));
        },
        showMenuChangeDatabase: function()
        {
            return (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keefox_org._keeFoxStorage.get("KeePassRPCActive", false));
        },
        detectForms: function()
        {
            return (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keefox_org._keeFoxStorage.get("KeePassRPCActive", false));
        },
        showMenuGeneratePassword: function()
        {
            return (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keefox_org._keeFoxStorage.get("KeePassRPCActive", false));
        },
        showMenuLogins: function()
        {
            if (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false) 
                && keefox_org._keeFoxStorage.get("KeePassRPCActive", false))
            {
                let win = keefox_org.commandManager.getWindow();
                if (!win) return false;
                var loginsPopup = win.document.getElementById("KeeFox_Logins-Button-root");
                if (!loginsPopup)
                    return false;
                if (loginsPopup.childNodes.length < 1)
                    return false;
                return true;
            }
            return false;
        }
    },

    getWindow: function()
    {
        let wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
        return wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
    },

    // Hard coded set of command functions that don't care how they were invoked
    actions: {
        showMenuKeeFox: function()
        {
            let win = keefox_org.commandManager.getWindow();
            if (!win) return;

            var loginsPopup = win.document.getElementById("KeeFox_Menu-Button-Popup");
            if (!loginsPopup)
                return;

            loginsPopup.openPopup(win.document.getElementById("KeeFox_Menu-Button"), "after_start", 0, 0, false, false);
        },
        launchKeePass: function()
        {
            keefox_org._KFLog.debug("woooo");
            keefox_org.launchKeePass('');
        },
        loginToKeePass: function()
        {
            keefox_org.loginToKeePass();
        },
        showMenuChangeDatabase: function(target)
        {
            //target = id of element to attach to. if needed, attachment behaviour can vary based on the id.

        },
        detectForms: function()
        {
            let win = keefox_org.commandManager.getWindow();
            if (!win) return;

            keefox_org._KFLog.debug("context detectForms start");
            var currentGBrowser = win.gBrowser;
            win.keefox_win.toolbar.setLogins(null, null);
            win.keefox_win.ILM._fillAllFrames(currentGBrowser.selectedBrowser.contentDocument.defaultView, false);
        },
        generatePassword: function()
        {
            keefox_org.generatePassword();
        },
        /* Not intending to support these features until at least 1.4
        showMenuGeneratePassword: function(target)
        {

        },
        showPanelOptions: function()
        {
            let win = keefox_org.commandManager.getWindow();
            if (!win) return;
        },
        showPanelSiteOptions: function()
        {
            let win = keefox_org.commandManager.getWindow();
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
            let win = keefox_org.commandManager.getWindow();
            if (!win) return;
            var container = win.document.getElementById("KeeFox_Help-GettingStarted-Button");
            if (!container)
                return;
            container.doCommand();
        },
        showHelpCenter: function()
        {
            let win = keefox_org.commandManager.getWindow();
            if (!win) return;
            var container = win.document.getElementById("KeeFox_Help-Centre-Button");
            if (!container)
                return;
            container.doCommand();
        },
        installKeeFox: function()
        {
            keefox_org.KeeFox_MainButtonClick_install();
        },
        showMenuLogins: function()// could target in future (e.g. if we want to include all logins in a submenu of the context menu?))
        {
            if (keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false) 
                && keefox_org._keeFoxStorage.get("KeePassRPCActive", false))
            {
                let win = keefox_org.commandManager.getWindow();
                if (!win) return;
                var loginsPopup = win.document.getElementById("KeeFox_Logins-Button-root");
                if (!loginsPopup)
                    return;
                loginsPopup.openPopup(win.document.getElementById("KeeFox_Logins-Button"), "after_start", 0, 0, false, false);
                
                return;
            }
        },
        fillMatchedLogin: function()
        {
            if (!(keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keefox_org._keeFoxStorage.get("KeePassRPCActive", false)))
                return;

            let win = keefox_org.commandManager.getWindow();
            if (!win) return;
            var container = win.document.getElementById("KeeFox_Main-Button");
            if (!container)
                return;
            if (!container.getAttribute('uuid'))
                return;
            container.doCommand();
            return;
        },
        showMenuMatchedLogins: function(target)
        {
            if (!(keefox_org._keeFoxStorage.get("KeePassDatabaseOpen", false) 
                || keefox_org._keeFoxStorage.get("KeePassRPCActive", false)))
                return;

            let win = keefox_org.commandManager.getWindow();
            if (!win) return;
            var loginsPopup = win.document.getElementById("KeeFox_Main-ButtonPopup");
            if (!loginsPopup)
                return;

            if (target == "context")
            {
                loginsPopup.openPopup(win.document.getElementById("keefox-command-context-showMenuMatchedLogins"), "after_start", 0, 0, true, false);
            } else {
                loginsPopup.openPopup(win.document.getElementById("KeeFox_Main-Button"), "after_start", 0, 0, false, false);
            }
        },
        autoTypeHere: function()
        {
            
        }
    },

    init: function ()
    {
        this.setDefaultCommands();
        this.load();
        this.resolveConfiguration();
    },

    kbEventHandler: function (e)
    {
        // establish which key was pressed
        let key = e.keyCode;

        let modifierIndex = (e.ctrlKey ? keefox_org.commandManager.MOD_CTRL : 0) | 
                            (e.altKey ? keefox_org.commandManager.MOD_ALT : 0) | 
                            (e.shiftKey ? keefox_org.commandManager.MOD_SHIFT : 0) | 
                            (e.metaKey ? keefox_org.commandManager.MOD_META : 0);
        let keyConfig = keefox_org.commandManager.activeKeys[modifierIndex][key];
        keefox_org._KFLog.debug("keys: " + key + ":" + modifierIndex);
        if (keyConfig)
        {
            for (let i=0; i<keyConfig.length; i++)
            {
                let commandName = keyConfig[i];
                if (typeof keefox_org.commandManager.conditions[commandName] === 'function')
                    if (!keefox_org.commandManager.conditions[commandName]())
                        continue;
                keefox_org._KFLog.debug("Executing command action: " + commandName);
                //TODO: Pass event target information to action
                keefox_org.commandManager.actions[commandName]();
                break;
            }
        }
    },

    // set of keys we are interested in listening to. KB listening events are always passed through to our event handler so we use this 2d "array" to quickly determine if we are interested in the particular key combination the user has just fired. The array is initialised in setupListeners()
    activeKeys: [],

    // No point in registering a listener if we end up not wanting to respond to any events
    listenToKeyboard: false,

    resolveConfiguration: function ()
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
    },

    contextSubPopupShowing: function(event)
    {
        let children = event.target.ownerDocument.getElementById('keefox-command-context-sub-popup').children;
        for (let i=0; i < children.length; i++)
        {
            let mi = children[i];
            if (mi.id.indexOf("keefox-command-context-") != 0)
                continue;

            // Set default visibility for this menu item
            // Should always be false but just in case...
            mi.hidden = !(mi.keeFoxValidContexts & keefox_org.commandManager.CONTEXT_SUB);

            // Update visibility for this menu item based upon the current KeeFox state
            if (typeof keefox_org.commandManager.conditions[mi.keeFoxCommandName] === 'function')
                mi.hidden = mi.hidden || !keefox_org.commandManager.conditions[mi.keeFoxCommandName]();
        }
    },

    contextMainPopupShowing: function(event)
    {
        if (event.target.ownerDocument.defaultView.gContextMenu == null)
            return; // not a context menu (e.g. tooltip)

        let children = event.target.ownerDocument.getElementById('contentAreaContextMenu').children;
        for (let i=0; i < children.length; i++)
        {
            let mi = children[i];
            if (mi.id.indexOf("keefox-command-context-") != 0)
                continue;

            // Set default visibility for this menu item
            let textEnabled = mi.keeFoxValidContexts & keefox_org.commandManager.CONTEXT_INPUT;
            let mainEnabled = mi.keeFoxValidContexts & keefox_org.commandManager.CONTEXT_MAIN;
            mi.hidden = !((event.target.ownerDocument.defaultView.gContextMenu.onTextInput && textEnabled) 
                        || (!event.target.ownerDocument.defaultView.gContextMenu.onTextInput && mainEnabled));

            // Update visibility for this menu item based upon the current KeeFox state
            if (typeof keefox_org.commandManager.conditions[mi.keeFoxCommandName] === 'function')
                mi.hidden = mi.hidden || !keefox_org.commandManager.conditions[mi.keeFoxCommandName]();
        }
    },

    // Setup listeners and context menus for the supplied window object
    setupListeners: function (win)
    {
        for (let i=0; i<this.commands.length; i++)
        {
            //TODO: Need to work on what constitutes a disabled/hidden menu item. need to be invisible and detached in an ideal world.
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
                item.setAttribute("label", keefox_org.locale.$STR(this.commands[i].label));
                item.setAttribute("tooltip", keefox_org.locale.$STR(this.commands[i].tooltip));
                //item.setAttribute("accesskey", this.commands[i].accesskey);                
                item.keeFoxCommandName = this.commands[i].name;
                item.keeFoxValidContexts = this.commands[i].contextLocationFlags;
                item.addEventListener("command", function(event) { keefox_org.commandManager.actions[this.keeFoxCommandName](); }, false);
            }

            //TODO1.4: repeat for submenu context type

        }

        if (this.listenToKeyboard)
        {
            // attach our keyboard listener
            keefox_org._KFLog.debug("Attaching keyboard listener");
            win.addEventListener("keydown", this.kbEventHandler, false);
        } else
        {
            keefox_org._KFLog.debug("No need to attach keyboard listener");
        }

    },

    cloneObj: function (obj)
    {
        //TODO2: improve speed? See http://jsperf.com/clone/5
        //TODO2: Might be useful in a utils location, not just for config manipulation
        return JSON.parse(JSON.stringify(obj));
    },

    commands: [],

    load: function()
    {
        keefox_org._KFLog.debug("Loading commands");
        var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
        var prefBranch = prefService.getBranch("extensions.keefox@chris.tomlinson.");

        try
        {
            var prefData = prefBranch.getComplexValue("commands", Ci.nsISupportsString).data;
            var coms = JSON.parse(prefData);
            //TODO1.4: In future check version here and apply migrations if needed
            //var currentVersion = prefBranch.getIntPref("commandsVersion");
            this.commands = coms;
        } catch (ex) {
            var coms = JSON.parse(JSON.stringify(this.default_commands)); //TODO2: faster clone?
            this.commands = coms;
            this.save();
        }
    },

    save: function()
    {
        keefox_org._KFLog.debug("Saving commands");
        
        var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
        var prefBranch = prefService.getBranch("extensions.keefox@chris.tomlinson.");

        var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
        str.data = JSON.stringify(this.commands);
        prefBranch.setComplexValue("commands", Ci.nsISupportsString, str);
        
        //TODO1.4: Stop forcing this to 1 when we release the first new version
        prefBranch.setIntPref("commandsVersion",1);
    }

};

// initialise the command system
keefox_org.commandManager.init();
