/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2012 Chris Tomlinson <keefox@christomlinson.name>

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
"use non-strict";

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cu = Components.utils;

Cu.import("resource://kfmod/ClassTreeView.jsm");

var configMan = null;

var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
var prefBranch = prefService.getBranch("extensions.keefox@chris.tomlinson.");

var siteURLTreeView = null;

function stop()
{
    var container = window.document.getElementById("msgGroupContainer");
    while(container.hasChildNodes())
        container.removeChild(container.firstChild);
}

function getQS ()
{
    var qs = window.location.href.split("?");
    if (qs.length == 1)
        return {};
    var a = qs[1].split("&");
    var o = {};
    a.forEach(function(e) {
      o[e.split("=")[0]] = e.split("=")[1];
    });
    return o;
}

function onLoad()
{
    var o = getQS();
    var selectURL = o['selectURL'];
    var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
        .getService(Ci.nsIWindowMediator);
    var mainWindow = wm.getMostRecentWindow("navigator:browser") ||
    wm.getMostRecentWindow("mail:3pane");
        
    mainWindow.keefox_org.locale.internationaliseElements(document,
        ['siteIntro','notifyBarRequestPasswordSave','monitorTime','validFormIntro','listExplain','invisibleTip','gb-form-name-caption','gb-form-name-wl-lab','gb-form-name-bl-lab'
        ,'gb-form-id-caption','gb-form-id-wl-lab','gb-form-id-bl-lab','gb-field-name-caption','gb-field-name-wl-lab','gb-field-name-bl-lab'
        ,'gb-field-id-caption','gb-field-id-wl-lab','gb-field-id-bl-lab','addSite','saveSite'
        ],
        ['title','label','tooltiptext','accesskey','value']);

    configMan = mainWindow.keefox_org.config;
    document.title = mainWindow.keefox_org.locale.$STR("KeeFox-site-options-title");

    go(selectURL);
}
function setTreeViewURLChooser ()
{
    var tree = document.getElementById("siteURLTree");
    siteURLTreeView = new ClassTreeView(this.getObjectChildren);
    var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
    var mainWindow = wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");
        
    var rootURL = "*"; // defaults
    siteURLTreeView.addTopObject(getURLTree(), true);
    tree.view = siteURLTreeView;
    //TODO1.3: open tree on load if needed - "auto expand"
}

function getURLTree()
{
    var tree = {
        url: "*",
        childURLs: []
    }

    // TODO1.3: Group entries by domain and maybe directory
    for (let i=1; i<configMan.current.length; i++) // Skip "*"
    {
        let conf = configMan.current[i];
        tree.childURLs.push({url: conf.url, childURLs: []});
    }

    return tree;
}

function getObjectChildren (aObject)
{
    return aObject.childURLs;
}

function onTreeSelected ()
{
    var tree = document.getElementById("siteURLTree");
    var selectedURL = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));

    for (let i=0; i<configMan.current.length; i++)
    {
        if (selectedURL == configMan.current[i].url)
            setMainPanelConfig(selectedURL,configMan.current[i].config,configMan.getConfigForURL(selectedURL));
    }
}

function go(urlToSelect) {
    setTreeViewURLChooser();
    var tree = document.getElementById("siteURLTree");
    if (urlToSelect)
    {
        for (let i = 0; i < tree.view.rowCount; i++)
        {
            if (tree.view.getCellText(i,tree.columns.getColumnAt(0)) == urlToSelect)
            {
                tree.view.selection.select(i);
                break;
            }
        }
    } else 
    {
        tree.view.selection.select(0);
    }
    window.sizeToContent();
}

function onSettingEnableChange(id, enabled)
{
    let itemsToEnable = [];
    let itemsToDisable = [];

    switch (id)
    {
        case "notifyBarRequestPasswordSave-enabled": 
            if (enabled) itemsToEnable.push("notifyBarRequestPasswordSave"); 
            else itemsToDisable.push("notifyBarRequestPasswordSave"); 
            break;
        case "monitorTime-enabled": 
            if (enabled) itemsToEnable.push("monitorTime"); 
            else itemsToDisable.push("monitorTime"); 
            break;
        case "gb-field-name-wl-enabled": 
            if (enabled) itemsToEnable.push("gb-field-name-wl","gb-field-name-wl-lab"); 
            else itemsToDisable.push("gb-field-name-wl","gb-field-name-wl-lab"); 
            break;
        case "gb-field-name-bl-enabled": 
            if (enabled) itemsToEnable.push("gb-field-name-bl","gb-field-name-bl-lab"); 
            else itemsToDisable.push("gb-field-name-bl","gb-field-name-bl-lab"); 
            break;
        case "gb-field-id-bl-enabled": 
            if (enabled) itemsToEnable.push("gb-field-id-bl","gb-field-id-bl-lab"); 
            else itemsToDisable.push("gb-field-id-bl","gb-field-id-bl-lab"); 
            break;
        case "gb-field-id-wl-enabled": 
            if (enabled) itemsToEnable.push("gb-field-id-wl","gb-field-id-wl-lab"); 
            else itemsToDisable.push("gb-field-id-wl","gb-field-id-wl-lab"); 
            break;
        case "gb-form-name-bl-enabled": 
            if (enabled) itemsToEnable.push("gb-form-name-bl","gb-form-name-bl-lab"); 
            else itemsToDisable.push("gb-form-name-bl","gb-form-name-bl-lab"); 
            break;
        case "gb-form-name-wl-enabled": 
            if (enabled) itemsToEnable.push("gb-form-name-wl","gb-form-name-wl-lab"); 
            else itemsToDisable.push("gb-form-name-wl","gb-form-name-wl-lab"); 
            break;
        case "gb-form-id-bl-enabled": 
            if (enabled) itemsToEnable.push("gb-form-id-bl","gb-form-id-bl-lab"); 
            else itemsToDisable.push("gb-form-id-bl","gb-form-id-bl-lab"); 
            break;
        case "gb-form-id-wl-enabled": 
            if (enabled) itemsToEnable.push("gb-form-id-wl","gb-form-id-wl-lab"); 
            else itemsToDisable.push("gb-form-id-wl","gb-form-id-wl-lab"); 
            break;
    }

    for (let i=0; i<itemsToEnable.length;i++)
    {
        let el = document.getElementById(itemsToEnable[i]);
        el.disabled = false;
    }
    
    for (let i=0; i<itemsToDisable.length;i++)
    {
        let el = document.getElementById(itemsToDisable[i]);
        el.disabled = true;
    }
}

function setOverrideChoice(enable)
{
    var ids = ["notifyBarRequestPasswordSave-enabled","monitorTime-enabled","gb-field-name-wl-enabled",
                "gb-field-name-bl-enabled","gb-field-id-wl-enabled","gb-field-id-bl-enabled",
            "gb-form-name-wl-enabled","gb-form-name-bl-enabled","gb-form-id-wl-enabled","gb-form-id-bl-enabled"];
    
    for (var i=0; i<ids.length;i++)
    {
        let el = document.getElementById(ids[i]);
        if (enable)
        {
            el.checked = false;
            el.hidden = false;
        } else
        {
            el.checked = true;
            el.hidden = true;
        }
        el.addEventListener("command", function (event) { onSettingEnableChange(this.id, this.checked); }, false);
    }
}

// Sets the UI state on the main config panel to represent the configuration of a particular URL
// If a setting is not defined in the specific URL being displayed for modification, the effective
// configuration is used in order to demonstrate to the user what behaviour to expect if they
// do not override with a new setting
function setMainPanelConfig(url, newConfig, effectiveConfig)
{
    var panel = document.getElementById("site");
    var siteDetail = document.getElementById("siteDetail");

    var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
        .getService(Ci.nsIWindowMediator);
    var mainWindow = wm.getMostRecentWindow("navigator:browser") ||
        wm.getMostRecentWindow("mail:3pane");
    
    if (url == "*")
    {
        siteDetail.textContent = "";
        document.getElementById("siteIntro").textContent =
            mainWindow.keefox_org.locale.$STR("KeeFox-site-options-default-intro.desc");
        document.getElementById("siteEnabledExplanation").textContent = "";
        setOverrideChoice(false);
    }
    else
    {
        siteDetail.textContent = url;
        document.getElementById("siteIntro").textContent =
            mainWindow.keefox_org.locale.$STR("KeeFox-site-options-intro.desc");
        document.getElementById("siteEnabledExplanation").textContent =
            mainWindow.keefox_org.locale.$STR("KeeFox-site-options-siteEnabledExplanation.desc");
        setOverrideChoice(true);
    }

    if (newConfig.preventSaveNotification != undefined)
    {
        document.getElementById("notifyBarRequestPasswordSave-enabled").checked = true;
        onSettingEnableChange("notifyBarRequestPasswordSave-enabled", true);
        document.getElementById("notifyBarRequestPasswordSave").checked = !newConfig.preventSaveNotification;
    } else
    {
        document.getElementById("notifyBarRequestPasswordSave-enabled").checked = false;
        onSettingEnableChange("notifyBarRequestPasswordSave-enabled", false);
        document.getElementById("notifyBarRequestPasswordSave").checked = !effectiveConfig.preventSaveNotification;
    }
        
    if (newConfig.rescanFormDelay != undefined)
    {
        document.getElementById("monitorTime-enabled").checked = true;
        onSettingEnableChange("monitorTime-enabled", true);
        document.getElementById("monitorTime").checked = (newConfig.rescanFormDelay > 0) ? true : false;
    } else
    {
        document.getElementById("monitorTime-enabled").checked = false;
        onSettingEnableChange("monitorTime-enabled", false);
        document.getElementById("monitorTime").checked = (effectiveConfig.rescanFormDelay > 0) ? true : false;
    }

    listNames = ["gb-field-name-wl","gb-field-name-bl","gb-field-id-wl","gb-field-id-bl",
                "gb-form-name-wl","gb-form-name-bl","gb-form-id-wl","gb-form-id-bl"];
    let ifConfig = newConfig.interestingForms;
    listConfigs = ["f_name_w","f_name_b","f_id_w","f_id_b","name_w","name_b","id_w","id_b"];

    for (let i=0; i<listNames.length; i++)
    {
        let listName = listNames[i];
        let listConfig = listConfigs[i];

        if (ifConfig != undefined && ifConfig[listConfig] != undefined)
        {
            document.getElementById(listName+"-enabled").checked = true;
            onSettingEnableChange(listName+"-enabled", true);
            document.getElementById(listName).value = ifConfig[listConfig].join();
        } else
        {
            document.getElementById(listName+"-enabled").checked = false;
            onSettingEnableChange(listName+"-enabled", false);
            document.getElementById(listName).value = effectiveConfig.interestingForms[listConfig].join();
        }
    }
}

function addSite()
{
    let newURL = window.prompt("Type the new URL, remembering the http:// or https:// at the start");
    configMan.setConfigForURL(newURL,{});
    configMan.save();
    go(newURL);
}

function saveSite()
{
    var siteDetail = document.getElementById("siteDetail");
    let url = siteDetail.textContent;
    if (url == "")
    {
        url = "*";
    }
    configMan.setConfigForURL(url,getMainPanelConfig());
    configMan.save();
}

function getMainPanelConfig()
{
    var newConfig = {};
    var possibleConfigSettings = {
        booleansInversed: ["notifyBarRequestPasswordSave"],
        interestingFormsArrays: ["gb-field-name-wl","gb-field-name-bl","gb-field-id-wl","gb-field-id-bl",
                                "gb-form-name-wl","gb-form-name-bl","gb-form-id-wl","gb-form-id-bl"],
        other: ["monitorTime"]
    };

    for (var i=0; i<possibleConfigSettings.booleansInversed.length;i++)
    {
        let settingEnabled = document.getElementById(possibleConfigSettings.booleansInversed[i]+"-enabled");
        if (settingEnabled.checked)
            newConfig[getConfigNameFromUIId(possibleConfigSettings.booleansInversed[i])] =
                !document.getElementById(possibleConfigSettings.booleansInversed[i]).checked;
    }

    newConfig.interestingForms = {};
    for (var i=0; i<possibleConfigSettings.interestingFormsArrays.length;i++)
    {
        let settingEnabled = document.getElementById(possibleConfigSettings.interestingFormsArrays[i]+"-enabled");
        if (settingEnabled.checked)
            newConfig.interestingForms[getConfigNameFromUIId(possibleConfigSettings.interestingFormsArrays[i])] = 
                document.getElementById(possibleConfigSettings.interestingFormsArrays[i]).value.split(",");
    }

    for (var i=0; i<possibleConfigSettings.other.length;i++)
    {
        let settingEnabled = document.getElementById(possibleConfigSettings.other[i]+"-enabled");
        if (settingEnabled.checked)
        {
            switch (possibleConfigSettings.other[i])
            {
                case "monitorTime": newConfig[getConfigNameFromUIId("monitorTime")] = 
                    document.getElementById("monitorTime").checked ? 2500 : -1; break;
            }
        }
    }
    return newConfig;
}

function getConfigNameFromUIId(name)
{
    switch (name)
    {
        case "monitorTime": return "rescanFormDelay";
        case "notifyBarRequestPasswordSave": return "preventSaveNotification";
        case "gb-field-name-wl": return "f_name_w";
        case "gb-field-name-bl": return "f_name_b";
        case "gb-field-id-wl": return "f_id_w";
        case "gb-field-id-bl": return "f_id_b";
        case "gb-form-name-wl": return "name_w";
        case "gb-form-name-bl": return "name_b";
        case "gb-form-id-wl": return "id_w";
        case "gb-form-id-bl": return "id_b";
        default: return name;
    }
}