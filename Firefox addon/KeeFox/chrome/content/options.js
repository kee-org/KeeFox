"can't use strict"; // global/binding/preferences.xul can't handle events in strict mode

let Cu = Components.utils;

function onLoad(){
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser") ||
        wm.getMostRecentWindow("mail:3pane");

    window.keefox_org.locale.internationaliseElements(document,
      ['KeeFox-prefs','tab-FindingEntries','tab-Notifications','tab-Logging','tab-Advanced','tab-KeePass','desc-when-user-chooses','mi-FillForm','mi-FillAndSubmitForm',
      'desc-when-keefox-chooses','desc-a-standard-form','desc-a-prompt','desc-keefox-should','mi-do-nothing','mi-FillForm2','mi-FillAndSubmitForm2',
      'mi-do-nothing2','mi-FillForm3','mi-FillAndSubmitForm3','desc-fill-note','check-autoFillFormsWithMultipleMatches','check-searchAllOpenDBs','check-listAllOpenDBs',
      'notifyBarRequestPasswordSave','desc-exclude-saved-sites','excludedSitesRemoveButton','notifyBarWhenKeePassRPCInactive','notifyBarWhenLoggedOut','flashIconWhenKeePassRPCInactive',
      'flashIconWhenLoggedOut','famsOptionsButton','desc-log-method','check-log-method-alert','check-log-method-console','check-log-method-stdout','check-log-method-file',
      'desc-log-level','KeeFox-pref-logLevel-debug','KeeFox-pref-logLevel-info','KeeFox-pref-logLevel-warn','KeeFox-pref-logLevel-error','dynamicFormScanning',
      'lab-dynamicFormScanningExplanation','lab-keePassRPCPort','lab-keePassRPCPortWarning','saveFavicons','lab-keePassDBToOpen','keePassDBToOpenBrowseButton',
      'rememberMRUDB','lab-keePassRPCInstalledLocation','keePassRPCInstalledLocationBrowseButton','lab-keePassInstalledLocation','keePassInstalledLocationBrowseButton',
      'lab-monoLocation','monoLocationBrowseButton','keePassRememberInstalledLocation','lab-keePassLocation',
      'desc-site-specific','desc-site-specific-savepass','desc-site-specific-link','desc-site-specific-savepass-link'
      ],
      ['title','label','tooltiptext','accesskey','value']);

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
    var valElement = document.getElementById("KeeFox-pref-matchStandard-list").selectedItem;

    document.getElementById("KeeFox-pref-matchStandard-list").value = valElement.label;
    switch (valElement.value)
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
    var valElement = document.getElementById("KeeFox-pref-matchHTTP-list").selectedItem;
    document.getElementById("KeeFox-pref-matchHTTP-list").value = valElement.label;
    switch (valElement.value)
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