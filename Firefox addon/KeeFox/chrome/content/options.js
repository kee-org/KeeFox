"can't use strict"; // global/binding/preferences.xul can't handle events in strict mode

let Cu = Components.utils;

function onLoad(){
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser") ||
        wm.getMostRecentWindow("mail:3pane");

    window.keefox_org.locale.internationaliseElements(document,
      ['KeeFox-prefs','tab-FindingEntries','tab-Notifications','tab-Logging','tab-Advanced','tab-KeePass','tab-ConnectionSecurity','tab-AuthorisedConnections','tab-Commands','desc-when-user-chooses','mi-FillForm','mi-FillAndSubmitForm',
      'desc-when-keefox-chooses','desc-a-standard-form','desc-a-prompt','desc-keefox-should','mi-do-nothing','mi-FillForm2','mi-FillAndSubmitForm2',
      'mi-do-nothing2','mi-FillForm3','mi-FillAndSubmitForm3','desc-fill-note','check-autoFillFormsWithMultipleMatches','check-searchAllOpenDBs','check-listAllOpenDBs','check-alwaysDisplayUsernameWhenTitleIsShown',
      'notifyBarRequestPasswordSave','desc-exclude-saved-sites','excludedSitesRemoveButton','notifyBarWhenKeePassRPCInactive','notifyBarWhenLoggedOut',
      'famsOptionsButton','desc-log-method','check-log-method-alert','check-log-method-console','check-log-method-stdout','check-log-method-file',
      'desc-log-level','KeeFox-pref-logLevel-debug','KeeFox-pref-logLevel-info','KeeFox-pref-logLevel-warn','KeeFox-pref-logLevel-error','dynamicFormScanning',
      'lab-dynamicFormScanningExplanation','lab-keePassRPCPort','lab-keePassRPCPortWarning','saveFavicons','lab-keePassDBToOpen','keePassDBToOpenBrowseButton',
      'rememberMRUDB','lab-keePassRPCInstalledLocation','keePassRPCInstalledLocationBrowseButton','lab-keePassInstalledLocation','keePassInstalledLocationBrowseButton',
      'lab-monoLocation','monoLocationBrowseButton','keePassRememberInstalledLocation','lab-keePassLocation',
      'desc-site-specific','desc-site-specific-savepass','desc-site-specific-link','desc-site-specific-savepass-link','desc-ConnSL','desc-ConnSL-ManualLink-link','desc-conn-sl-client','slc-Low','slc-Medium','slc-High','sls-Low','sls-Medium','sls-High','desc-conn-sl-client-detail','desc-conn-sl-server','desc-conn-sl-server-detail','desc-conn-sl-low','desc-conn-sl-high','desc-commands-intro','desc-metrics','desc-metrics-link','lab-sendUsageMetrics'
      ],
      ['title','label','tooltiptext','accesskey','value']);

      createCommandPanel();
}

function createCommandPanel()
{
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
             .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");

    var commandPanelContainer = document.getElementById("tab-Commands-Panel");
    var grid = document.createElement("grid");
    grid.setAttribute("id","commands-grid");
    var gcols = document.createElement("columns");
    gcols.setAttribute("id","commands-columns");
    var grows = document.createElement("rows");
    grows.setAttribute("id","commands-rows");
    var gcol1 = document.createElement("column");
    gcol1.setAttribute("flex","2");
    var gcol2 = document.createElement("column");
    gcol2.setAttribute("flex","1");
    gcols.appendChild(gcol1);
    gcols.appendChild(gcol2);
    grid.appendChild(gcols);
    grid.setAttribute("flex", "1");

    //TODO2: Allow fine grained control over every possible command.
    // To start with, we'll just do the simplest approach for the
    // user by showing three combined commands
    //var commands = window.keefox_org.commandManager.commands;
    var key1, key2, key3, key4, key5, key6, modifiers1, modifiers2, modifiers3, modifiers4, modifiers5, modifiers6;

    for (var i=0; i < window.keefox_org.commandManager.commands.length; i++)
    {
        if (window.keefox_org.commandManager.commands[i].name == "showMenuKeeFox")
        {
            key1 = window.keefox_org.commandManager.commands[i].key;
            modifiers1 = window.keefox_org.commandManager.commands[i].keyboardModifierFlags;
        }
        if (window.keefox_org.commandManager.commands[i].name == "installKeeFox")
        {
            key2 = window.keefox_org.commandManager.commands[i].key;
            modifiers2 = window.keefox_org.commandManager.commands[i].keyboardModifierFlags;
        }
        if (window.keefox_org.commandManager.commands[i].name == "showMenuLogins")
        {
            key3 = window.keefox_org.commandManager.commands[i].key;
            modifiers3 = window.keefox_org.commandManager.commands[i].keyboardModifierFlags;
        }
        if (window.keefox_org.commandManager.commands[i].name == "generatePassword")
        {
            key4 = window.keefox_org.commandManager.commands[i].key;
            modifiers4 = window.keefox_org.commandManager.commands[i].keyboardModifierFlags;
        }
        if (window.keefox_org.commandManager.commands[i].name == "showMenuChangeDatabase")
        {
            key5 = window.keefox_org.commandManager.commands[i].key;
            modifiers5 = window.keefox_org.commandManager.commands[i].keyboardModifierFlags;
        }
        if (window.keefox_org.commandManager.commands[i].name == "detectForms")
        {
            key6 = window.keefox_org.commandManager.commands[i].key;
            modifiers6 = window.keefox_org.commandManager.commands[i].keyboardModifierFlags;
        }
    }
 
    var commands = [{
        tooltip: "KeeFox-KB-shortcut-simple-1.tip",
        description: "KeeFox-KB-shortcut-simple-1.desc",
        key: key1,
        keyboardModifierFlags: modifiers1
    },
    {
        tooltip: "KeeFox-KB-shortcut-simple-2.tip",
        description: "KeeFox-KB-shortcut-simple-2.desc",
        key: key2,
        keyboardModifierFlags: modifiers2
    },
    {
        tooltip: "KeeFox-KB-shortcut-simple-3.tip",
        description: "KeeFox-KB-shortcut-simple-3.desc",
        key: key3,
        keyboardModifierFlags: modifiers3
    },
    {
        tooltip: "KeeFox_Menu-Button.copyNewPasswordToClipboard.tip",
        description: "KeeFox_Menu-Button.copyNewPasswordToClipboard.label",
        key: key4,
        keyboardModifierFlags: modifiers4
    },
    {
        tooltip: "KeeFox_Menu-Button.changeDB.tip",
        description: "KeeFox_Menu-Button.changeDB.label",
        key: key5,
        keyboardModifierFlags: modifiers5
    },
    {
        tooltip: "KeeFox_Menu-Button.fillCurrentDocument.tip",
        description: "KeeFox_Menu-Button.fillCurrentDocument.label",
        key: key6,
        keyboardModifierFlags: modifiers6
    }];

    for (var i=0; i < commands.length; i++)
    {
        //TODO2: Allow listing of commands that don't yet have a keyboard shortcut
        if (commands[i].key)
        {
            var labelDesc = document.createElement("label");
            var labelKey = document.createElement("label");
            labelDesc.setAttribute("id","commands-desc-"+i);
            labelDesc.setAttribute("tooltip",window.keefox_org.locale.$STR(commands[i].tooltip));
            labelDesc.setAttribute("value",window.keefox_org.locale.$STR(commands[i].description));

            labelKey.setAttribute("id","commands-key-"+i);
            labelKey.setAttribute("value", getKeyboardShortcutDisplayValue(commands[i].keyboardModifierFlags, commands[i].key));
            labelKey.addEventListener("click", onCommandClick, false);
            var grow = document.createElement("row");
            grow.appendChild(labelDesc);
            grow.appendChild(labelKey);
            grows.appendChild(grow);
        }
    }

    grid.appendChild(grows);
    //TODO1.5: Find a way to cancel inline editing if user clicks somewhere else. below line causes problems.
    //grid.addEventListener("click", onCommandBlur, false);
    commandPanelContainer.appendChild(grid);
}

function getKeyboardShortcutDisplayValue(modifierFlags, keyCode)
{
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
             .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");

    let modifierText = "";
    if ((modifierFlags & window.keefox_org.commandManager.MOD_CTRL) > 0)
        modifierText = modifierText == "" ? "Ctrl" : (modifierText + " + Ctrl");
    if ((modifierFlags & window.keefox_org.commandManager.MOD_ALT) > 0)
        modifierText = modifierText == "" ? "Alt" : (modifierText + " + Alt");
    if ((modifierFlags & window.keefox_org.commandManager.MOD_SHIFT) > 0)
        modifierText = modifierText == "" ? "Shift" : (modifierText + " + Shift");
    if ((modifierFlags & window.keefox_org.commandManager.MOD_META) > 0)
        modifierText = modifierText == "" ? "Meta" : (modifierText + " + Meta");
    return  modifierText + " + " + String.fromCharCode(keyCode);
}

// Invoked when user clicks on the keyboard shortcut label
//TODO2: Probably not that intuitive that the label can be selected. Might want
// to review usability in future although technical nature of many keyboard
// shortcut users probably reduces importance of this
function onCommandClick(evt)
{
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
    //window.keefox_org._KFLog.debug(evt.target.id + " clicked");

    // swap label for a textbox
    var label = document.getElementById(evt.target.id);
    var textbox = document.createElement("textbox");
    textbox.setAttribute("placeholder",window.keefox_org.locale.$STR("KeeFox-type-new-shortcut-key.placeholder"));
    textbox.setAttribute("id",evt.target.id+"-textbox");
    textbox.addEventListener("keydown", onCommandKeyDown, false);
    textbox.addEventListener("blur", onCommandBlur, false);
    label.setAttribute("hidden","true");
    label.parentNode.appendChild(textbox);
    textbox.focus();
}

// Invoked when user presses a new key inside the "new shortcut" text box
// We set the new command key if applicable and then tidy up as if focus was blurred
function onCommandKeyDown(evt)
{
    var newKey = evt.keyCode;

    // Exclude these keys (they're modifiers so user has not yet selected an actual key)
    if (newKey == 16 || newKey == 17 || newKey == 18 || newKey == 91 || newKey == 224)
        return;

    if (newKey == 27) // escape
    {
        onCommandBlur(evt);
        return;
    }

    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser") ||
        wm.getMostRecentWindow("mail:3pane");
    window.keefox_org._KFLog.debug(evt.target.id + " clicked");

    var newModifiers = (evt.ctrlKey ? window.keefox_org.commandManager.MOD_CTRL : 0) | 
                        (evt.altKey ? window.keefox_org.commandManager.MOD_ALT : 0) | 
                        (evt.shiftKey ? window.keefox_org.commandManager.MOD_SHIFT : 0) | 
                        (evt.metaKey ? window.keefox_org.commandManager.MOD_META : 0);
    var names = [];

    if (evt.target.id=="commands-key-0-textbox")
    {
        names.push("showMenuKeeFox");
    }
    else if (evt.target.id=="commands-key-1-textbox")
    {
        names.push("installKeeFox");
        names.push("launchKeePass");
        names.push("loginToKeePass");
        names.push("showMenuMatchedLogins");
        names.push("fillMatchedLogin");
    }
    else if (evt.target.id=="commands-key-2-textbox")
    {
        names.push("showMenuLogins");
    }
    else if (evt.target.id=="commands-key-3-textbox")
    {
        names.push("generatePassword");
    }
    else if (evt.target.id=="commands-key-4-textbox")
    {
        names.push("showMenuChangeDatabase");
    }
    else if (evt.target.id=="commands-key-5-textbox")
    {
        names.push("detectForms");
    }

    for (var i=0; i < window.keefox_org.commandManager.commands.length; i++)
    {
        if (names.indexOf(window.keefox_org.commandManager.commands[i].name) >= 0)
        {
            window.keefox_org.commandManager.commands[i].key = newKey;
            window.keefox_org.commandManager.commands[i].keyboardModifierFlags = newModifiers;
        }
    }


    // We've not checked if there was an actual change or if the user just retyped
    // the same key combination but re-initialising is cheap

    // persist changes to storage
    window.keefox_org.commandManager.save();

    // rebuild our key map to ensure correct and fast responses with this new configuration
    window.keefox_org.commandManager.resolveConfiguration();
        
    var label = document.getElementById(evt.target.id.replace("-textbox",""));

    // update label display with new key mapping
    label.setAttribute("value", getKeyboardShortcutDisplayValue(newModifiers, newKey));

    onCommandBlur(evt);
}

// invoked after user sets a new key or when they click away from the textbox to cancel edit mode
function onCommandBlur(evt)
{
    var textbox = document.getElementById(evt.target.id);
    textbox.removeEventListener("keydown", onCommandKeyDown, false);
    textbox.removeEventListener("blur", onCommandBlur, false);
    textbox.parentNode.removeChild(textbox);

    var label = document.getElementById(evt.target.id.replace("-textbox",""));
    label.setAttribute("hidden","false");
}

function onsyncfrompreferenceMatchSelected()
{
    var prefSubmit = document.getElementById("KeeFox-pref-autoSubmitMatchedForms");
    // .value === undefined means the preference is set to the default value
    var actualSubmitValue = prefSubmit.value !== undefined ?
        prefSubmit.value : prefSubmit.defaultValue;
    // actualValue may be |null| here if the pref didn't have the default value.

    if (actualSubmitValue == true)
        return "FillAndSubmit";
    else
        return "Fill";
}

function onsynctopreferenceMatchSelected()
{
    var valElement = document.getElementById("KeeFox-pref-matchSelected-list").selectedItem;

    document.getElementById("KeeFox-pref-matchSelected-list").value = valElement.label;
    switch (valElement.value)
    {
        case "FillAndSubmit": return true;
        default: return false;
    }
}

function onsyncfrompreferenceMatchStandard()
{
    var prefFill = document.getElementById("KeeFox-pref-autoFillForms");
    var prefSubmit = document.getElementById("KeeFox-pref-autoSubmitForms");
    // .value === undefined means the preference is set to the default value
    var actualFillValue = prefFill.value !== undefined ?
        prefFill.value : prefFill.defaultValue;
    var actualSubmitValue = prefSubmit.value !== undefined ?
        prefSubmit.value : prefSubmit.defaultValue;
    // actualValue may be |null| here if the pref didn't have the default value.

    if (actualSubmitValue == true)
        return "FillAndSubmit";
    else if (actualFillValue == true)
        return "Fill";
    else
        return "DoNothing";
}

function onsynctopreferenceMatchStandard()
{
    switch (document.getElementById("KeeFox-pref-matchStandard-list").selectedItem.getAttribute("value"))
    {
        case "FillAndSubmit": document.getElementById("KeeFox-pref-autoFillForms").value = true; return true;
        case "Fill": document.getElementById("KeeFox-pref-autoFillForms").value = true; return false;
        default: document.getElementById("KeeFox-pref-autoFillForms").value = false; return false;
    }
}

function onsyncfrompreferenceMatchHTTP()
{
    var prefFill = document.getElementById("KeeFox-pref-autoFillDialogs");
    var prefSubmit = document.getElementById("KeeFox-pref-autoSubmitDialogs");
    // .value === undefined means the preference is set to the default value
    var actualFillValue = prefFill.value !== undefined ?
        prefFill.value : prefFill.defaultValue;
    var actualSubmitValue = prefSubmit.value !== undefined ?
        prefSubmit.value : prefSubmit.defaultValue;
    // actualValue may be |null| here if the pref didn't have the default value.

    if (actualSubmitValue == true)
        return "FillAndSubmit";
    else if (actualFillValue == true)
        return "Fill";
    else
        return "DoNothing";
}

function onsynctopreferenceMatchHTTP()
{
    switch (document.getElementById("KeeFox-pref-matchHTTP-list").selectedItem.getAttribute("value"))
    {
        case "FillAndSubmit": document.getElementById("KeeFox-pref-autoFillDialogs").value = true; return true;
        case "Fill": document.getElementById("KeeFox-pref-autoFillDialogs").value = true; return false;
        default: document.getElementById("KeeFox-pref-autoFillDialogs").value = false; return false;
    }
}

function onsyncfrompreferenceLogLevel()
{
    var preference = document.getElementById("KeeFox-pref-logLevel");
    // .value === undefined means the preference is set to the default value
    var actualValue = preference.value !== undefined ?
        preference.value : preference.defaultValue;
    // actualValue may be |null| here if the pref didn't have the default value.

    if (actualValue == 4)
        return "Debugging";
    else if (actualValue == 3)
        return "Information";
    else if (actualValue == 2)
        return "Warnings";
    else
        return "Errors";
}

function onsynctopreferenceLogLevel()
{
    var valElement = document.getElementById("KeeFox-pref-logLevel-list").selectedItem;
    document.getElementById("KeeFox-pref-logLevel-list").value = valElement.label;
    switch (valElement.label)
    {
        case "Debugging": return 4;
        case "Information": return 3;
        case "Warnings": return 2;
        case "Errors": return 1;
        default: return 0;
    }
}

//TODO2: allow users to choose seperate plugins folder OR automatically detect from a few standard locations
function browseForKeePassLocation(currentLocationPath)
{
    var location = browseForLocation(currentLocationPath, 
                                     Components.interfaces.nsIFilePicker.modeGetFolder, 'selectKeePassLocation', 'NoFilter');
    document.getElementById("keePassInstalledLocation").value = location;
    document.getElementById("KeeFox-pref-keePassInstalledLocation").value = location;
}

function browseForKPRPCLocation(currentLocationPath)
{
    var location = browseForLocation(currentLocationPath, 
                                     Components.interfaces.nsIFilePicker.modeGetFolder, 'selectKeePassLocation', 'NoFilter');
    document.getElementById("keePassRPCInstalledLocation").value = location;
    document.getElementById("KeeFox-pref-keePassRPCInstalledLocation").value = location;
}

function browseForMonoLocation(currentLocationPath)
{
    var location = browseForLocation(currentLocationPath, 
                                     Components.interfaces.nsIFilePicker.modeOpen, 'selectMonoLocation', 'NoFilter');
    document.getElementById("monoLocation").value = location;
    document.getElementById("KeeFox-pref-monoLocation").value = location;
}

function browseForDefaultKDBXLocation(currentLocationPath)
{
    var location = browseForLocation(currentLocationPath, 
                                     Components.interfaces.nsIFilePicker.modeOpen, 'selectDefaultKDBXLocation', 'DBFilter');
    document.getElementById("keePassDBToOpen").value = location;
    document.getElementById("KeeFox-pref-keePassDBToOpen").value = location;
}

function browseForLocation(currentLocationPath, pickerMode, captionStringKey, filterMode)
{
    const nsIFilePicker = Components.interfaces.nsIFilePicker;

    var fp = Components.classes["@mozilla.org/filepicker;1"]
                   .createInstance(nsIFilePicker);                   
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser") ||
        wm.getMostRecentWindow("mail:3pane");
            
    var dialogName = window.keefox_org.locale.$STR(captionStringKey);
    
    fp.init(window, dialogName, pickerMode);
    
    if ((filterMode == "DBFilter") && (pickerMode == nsIFilePicker.modeOpen))
    {
        fp.appendFilter("KeePass databases","*.kdbx");
        fp.appendFilters(nsIFilePicker.filterAll);
    }
    
    if (currentLocationPath != null && currentLocationPath.length > 0)
    {
        try {
            var currentLocation = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsILocalFile);
            currentLocation.initWithPath(currentLocationPath);
            if (currentLocation.exists())
                fp.displayDirectory = currentLocation;
        } catch (ex) {
        // ignore
        }
    }
    
    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace)
    {
        var path = fp.file.path;
        return path;
    }
    return currentLocationPath;
}

function openSiteConfig()
{
    window.openDialog("chrome://keefox/content/siteOptions.xul",
    "siteoptions", "chrome,centerscreen", 
    onOK,
    onCancel,
    null);
}