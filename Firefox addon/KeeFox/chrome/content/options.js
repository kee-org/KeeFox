function addExcludedItem()
{
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser");
    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
        .getService(Components.interfaces.nsIPromptService);

    var input = {value: "http://"};
    var result = prompts.prompt(null, "Block a site", "Which site do you want to block?", input, null, {});

    // result is true if OK is pressed, false if Cancel. input.value holds the value of the edit field if "OK" was pressed.
    
    if (result && input.value.length > 0)
    {
        document.getElementById('excludedSitesList').appendItem(input.value, input.value);

        //add new item to database
        var statement = window.keefox_org.ILM._kf._keeFoxExtension.db.conn.createStatement(
            "INSERT OR REPLACE INTO sites (id,url,tp,preventSaveNotification) VALUES ( (select id from sites where url = :url), :url, coalesce((select tp from sites where url = :url),0), 1  )");
        statement.params.url = input.value;
        statement.executeAsync();
    }
}

function removeExcludedItem()
{
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser");
        
    var list = document.getElementById('excludedSitesList');
    var count = list.selectedCount;
    while (count--)
    {
        var item = list.selectedItems[0];
        var statement = window.keefox_org.ILM._kf._keeFoxExtension.db.conn.createStatement(
            "UPDATE sites SET preventSaveNotification = 0 WHERE url = :url");
        statement.params.url = item.value;
        statement.executeAsync();
        list.removeItemAt(list.getIndexOfItem(item));
    }
}

function onLoad(){
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                 .getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow("navigator:browser");
        
    // find all URLs we want to excluded
    var statement = window.keefox_org.ILM._kf._keeFoxExtension.db.conn.createStatement(
        "SELECT * FROM sites WHERE tp = 0 AND preventSaveNotification = 1");

    // add those URLs to the listbox
    while (statement.executeStep())
    {
        var url = statement.row.url;
        document.getElementById('excludedSitesList').appendItem(url, url);
    }
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

// This section allows selection of the root group of the currently active
// KeePass database. It may be useful to aid selecting root group status per
// location? Though I would prefer to leave that in the hands of KeePass
// wherever practical.
//Components.utils.import("resource://kfmod/ClassTreeView.jsm");
//var keePassGroupTree = null;

//function getObjectChildren(aObject) {
//  return aObject.childGroups;
//}

//function init() {
//  var tree = document.getElementById("keePassGroupTree");
//  keePassGroupTree = new ClassTreeView(getObjectChildren);
//var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
//                 .getService(Components.interfaces.nsIWindowMediator);
//        var window = wm.getMostRecentWindow("navigator:browser");
//        var rootGroup = window.keefox_org.ILM._kf.KeePassDatabases[window.keefox_org.ILM._kf.ActiveKeePassDatabaseIndex].root;
//keePassGroupTree.addTopObject(rootGroup, true);

//  tree.view = keePassGroupTree;
//}

//function onTreeSelected(){
//   var tree = document.getElementById("keePassGroupTree");
//   var cellIndex = 1;
//   var cellText = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(cellIndex));
//   dump(cellText);
// }
