/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
  Copyright 2008-2010 Chris Tomlinson <keefox@christomlinson.name>
  
  This KFToolBar.js file contains functions and data related to the visible
  toolbar buttons that kefox.xul defines. It also contains some other related
  functions such as displaying popup menus and serves as a known access
  point for a given window's KeeFox features.
  
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

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://kfmod/kfDataModel.js");

function KFToolbar(currentWindow) {
    this._currentWindow = currentWindow;
    this.strbundle = currentWindow.document.getElementById("KeeFox-strings");
}

KFToolbar.prototype = {

    _currentWindow : null,
    strbundle : null,
    
    shutdown: function()
    {
        var container = this._currentWindow.document.getElementById("KeeFox_Main-Button");
        if (container != undefined || container != null)
            container.setAttribute("disabled", "true");
        container = this._currentWindow.document.getElementById("KeeFox_Logins-Button");
        if (container != undefined || container != null)
            container.setAttribute("disabled", "true");
        container = this._currentWindow.document.getElementById("KeeFox_Menu-Button");
        if (container != undefined || container != null)
            container.setAttribute("disabled", "true");
            
        
    },
 
    // remove matched logins from the menu
    removeLogins: function() {
        // Get the toolbaritem "container" that we added to our XUL markup
        var container = this._currentWindow.document.getElementById("KeeFox_Main-Button");
        if (container === undefined || container == null)
            return;
            
        // Remove all of the existing buttons
        for (i = container.childNodes.length; i > 0; i--) {
            container.removeChild(container.childNodes[0]);
        }
        this.setupButton_ready(null,this._currentWindow);
    },
    
    compareRelevanceScores: function (a , b)
    {
        return b.relevanceScore - a.relevanceScore;
    },
    
    // add all matched logins to the menu
    setLogins: function(logins, doc)
    {
        KFLog.debug("setLogins started");
        // Get the toolbaritem "container" that we added to our XUL markup
        var container = this._currentWindow.document.getElementById("KeeFox_Main-Button");
        if (container === undefined || container == null)
            return;
            
        // if the matched logins container is locked (becuase it's currently open) we don't
        // make any changes. In future, maybe we could delay the change rather than
        // completely ignore it but for now, the frequent "dynamic form polling"
        // feature will ensure a minimal wait for update once the lock is released.
        if (container.getAttribute('KFLock') == "enabled")
            return;

        // TODO: merge logins into existing ones to prevent duplicates if more than
        // one frame has same matching login

        if (logins == null || logins.length == 0)
        {
            this.setupButton_ready(null,this._currentWindow);
            return;
        }
        
        logins.sort(this.compareRelevanceScores);
        
        // set up the main button
        container.setAttribute("class", "login-found");
        container.setAttribute("disabled", "false");
        container.setAttribute("onpopupshowing", "this.setAttribute('KFLock','enabled');");
        container.setAttribute("onpopuphiding", "this.setAttribute('KFLock','disabled');");
        
        // create a popup menu to hold the logins        
        menupopup = this._currentWindow.document.createElement("menupopup");

        KFLog.debug("setting " + logins.length + " toolbar logins");
        
        // add every matched login to the popup menu
        for (var i = 0; i < logins.length; i++) {
            var login = logins[i];
            var usernameValue = "";
            var usernameDisplayValue = "["+this.strbundle.getString("noUsername.partial-tip")+"]";
            var usernameName = "";
            var usernameId = "";
            var displayGroupPath = login.parentGroup.path;
//            var groupDivider = this.strbundle.getString("groupDividerCharacter");
//            if (groupDivider != ".")
//                displayGroupPath = displayGroupPath.replace(/\./g,groupDivider);
            
            if (login.usernameIndex != null && login.usernameIndex != undefined && login.usernameIndex >= 0 
                && login.otherFields != null && login.otherFields.length > 0)
            {
                var field = login.otherFields[login.usernameIndex];

                usernameValue = field.value;
                if (usernameValue != undefined && usernameValue != null && usernameValue != "")
                    usernameDisplayValue = usernameValue;
                usernameName = field.name;
                usernameId = field.fieldId;
            }
                        
            if (i==0)
            {
                container.setAttribute("label", this.strbundle.getFormattedString("matchedLogin.label",[usernameDisplayValue, login.title]));                
                container.setAttribute("value", login.uniqueID);
                //container.setUserData("login", login, null);
                container.setAttribute("context", "KeeFox-login-toolbar-context");
                container.setAttribute("tooltiptext", this.strbundle.getFormattedString("matchedLogin.tip",[login.title, displayGroupPath, usernameDisplayValue]));
                container.setAttribute("oncommand", "keefox_org.ILM.fill('" +
                    usernameName + "','" + usernameValue + "','" + login.formActionURL + "','"+usernameId+"',null,'" + login.uniqueID + "','" + doc.documentURI + "'); event.stopPropagation();");
                container.setAttribute("class", "menuitem-iconic");
                container.setAttribute("image", "data:image/png;base64,"+login.iconImageData);
            }
            
            if (logins.length > 1)
            {
                var tempButton = null;
                tempButton = this._currentWindow.document.createElement("menuitem");
                tempButton.setAttribute("label", this.strbundle.getFormattedString("matchedLogin.label",[usernameDisplayValue, login.title]));
                tempButton.setAttribute("class", "menuitem-iconic");
                tempButton.setAttribute("image", "data:image/png;base64,"+login.iconImageData);
                tempButton.setAttribute("value", login.uniqueID);
                //tempButton.setUserData("login", login, null);
                tempButton.setAttribute("context", "KeeFox-login-context");
                tempButton.setAttribute("tooltiptext", this.strbundle.getFormattedString("matchedLogin.tip",[login.title, displayGroupPath, usernameDisplayValue]));
                tempButton.setAttribute("oncommand", "keefox_org.ILM.fill('" +
                    usernameName + "','" + usernameValue + "','" + login.formActionURL + "','"+usernameId+"','null','" + login.uniqueID + "','" + doc.documentURI + "'); event.stopPropagation();");
                menupopup.appendChild(tempButton);
            }
        }
        
        if (logins.length > 1)
        {
            container.setAttribute("type", "menu-button");
            container.appendChild(menupopup);
        }
        KFLog.debug(logins.length + " toolbar logins set!");
    },
    
    // populate the "all logins" menu with every login in this database
    setAllLogins: function()
    {
        KFLog.debug("setAllLogins start");
        
        var loginButton = this._currentWindow.document.getElementById("KeeFox_Logins-Button");
        if (loginButton === undefined || loginButton == null)
            return;

        if (keeFoxInst._keeFoxStorage.get("KeePassDatabaseOpen", false))
        {
            // start with the current root group uniqueID
            try
            {
                var rootGroup = keeFoxInst.KeePassDatabases[keeFoxInst.ActiveKeePassDatabaseIndex].root;
                
                if (rootGroup != null && rootGroup != undefined && rootGroup.uniqueID)
                {
                    // get the popup menu for this list of logins and subgroups
                    var container = this._currentWindow.document.getElementById("KeeFox_Logins-Button-root");
                    if (container === undefined || container == null)
                        return;
                    this.setOneLoginsMenu(container, rootGroup);
                }
            } catch (e)
            {
                KFLog.error("setAllLogins exception: " + e);
                return;
            }
            loginButton.setAttribute("disabled","false");
        } else
        {
            loginButton.setAttribute("disabled","true");
            //loginButton.setAttribute("disabled","false");
            var container = this._currentWindow.document.getElementById("KeeFox_Logins-Button-root");

            // Remove all of the existing buttons
            for (i = container.childNodes.length; i > 0; i--) {
                container.removeChild(container.childNodes[0]);
            }
        }
        KFLog.debug("setAllLogins end");
        return;
    },
    
    // add all the logins and subgroups for one KeePass group
    setOneLoginsMenu: function(container, group)
    {
        //KFLog.debug("setOneLoginsMenu called for [" + container.id + "] with uniqueRef: " + group.uniqueID);
    
        // Remove all of the existing buttons
        for (i = container.childNodes.length; i > 0; i--) {
            container.removeChild(container.childNodes[0]);
        }
        
        var foundGroups = group.childGroups;
        var foundLogins = group.childLightEntries;
//KFLog.debug("loga");
        if ((foundGroups == null || foundGroups.length == 0) && (foundLogins == null || foundLogins.length == 0))
        {
            var noItemsButton = null;
            noItemsButton = this._currentWindow.document.createElement("menuitem");
            noItemsButton.setAttribute("label", this.strbundle.getString("loginsButtonEmpty.label"));
            noItemsButton.setAttribute("disabled", "true");
            noItemsButton.setAttribute("tooltiptext", this.strbundle.getString("loginsButtonEmpty.tip"));
            container.appendChild(noItemsButton);
            return;
        }
//KFLog.debug("logb");
        for (var i = 0; i < foundGroups.length; i++)
        {
            var group = foundGroups[i];
            
            // maybe this duplicated oncommand, etc. is un-needed?
            var newMenu = null;
            newMenu = this._currentWindow.document.createElement("menu");
            newMenu.setAttribute("label", group.title);
            newMenu.setAttribute("tooltiptext", this.strbundle.getString("loginsButtonGroup.tip"));
            //newMenu.setAttribute("onpopupshowing", "keefox_org.toolbar.setOneLoginsMenu('KeeFox_Group-" +
            //    group.uniqueID + "','" + group.uniqueID + "'); event.stopPropagation();");
            newMenu.setAttribute("class", "menu-iconic");
            newMenu.setAttribute("value", group.uniqueID);
            newMenu.setAttribute("context", "KeeFox-group-context");
            //newMenu.setAttribute("image", "chrome://mozapps/skin/passwordmgr/key.png");
            newMenu.setAttribute("image", "data:image/png;base64,"+group.iconImageData);
            container.appendChild(newMenu);
            
            var newMenuPopup = null;
            newMenuPopup = this._currentWindow.document.createElement("menupopup");
            newMenuPopup.setAttribute("id", "KeeFox_Group-" + group.uniqueID);
            this.setOneLoginsMenu(newMenuPopup,group);
            newMenu.appendChild(newMenuPopup);

        }
        //KFLog.debug("logc");
        for (var i = 0; i < foundLogins.length; i++)
        {
        //KFLog.debug("logi: " + i);
            var login = foundLogins[i];
            var usernameValue = "";
            var usernameName = "";
            var usernameDisplayValue = "["+this.strbundle.getString("noUsername.partial-tip")+"]";
            usernameValue = login.usernameValue;
            if (usernameValue != undefined && usernameValue != null && usernameValue != "")
                usernameDisplayValue = usernameValue;
            usernameName = login.usernameName;

            var tempButton = null;
            tempButton = this._currentWindow.document.createElement("menuitem");
            tempButton.setAttribute("label", login.title);
            tempButton.setAttribute("tooltiptext", this.strbundle.getFormattedString(
                "loginsButtonLogin.tip", [login.uRLs[0], usernameDisplayValue]));
            tempButton.setAttribute("oncommand", "keefox_org.ILM.loadAndAutoSubmit(0,event.ctrlKey,'" +
                usernameName + "','" + usernameValue + "','" + login.uRLs[0] 
                + "',null,null,'" + login.uniqueID + "');  event.stopPropagation();");
            tempButton.setAttribute("onclick", "if (event.button == 1) { keefox_org.ILM.loadAndAutoSubmit(event.button,event.ctrlKey,'" +
                usernameName + "','" + usernameValue + "','" + login.uRLs[0] 
                + "',null,null,'" + login.uniqueID + "'); } event.stopPropagation(); if (event.button == 1) keefox_org.UI.closeMenus(event.target);");// var container = this._currentWindow.document.getElementById('KeeFox_Logins-Button-root'); container.setAttribute('visible', 'false');");
            tempButton.setAttribute("class", "menuitem-iconic");
            tempButton.setAttribute("value", login.uniqueID);
            tempButton.setAttribute("context", "KeeFox-login-context");
            tempButton.setAttribute("image", "data:image/png;base64,"+login.iconImageData);

            container.appendChild(tempButton);
        }
    },

    setupButton_install: function(targetWindow) {
        KFLog.debug("setupButton_install start");
        var mainWindow = targetWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);

        mainButton = mainWindow.document.getElementById("KeeFox_Main-Button");
        if (mainButton === undefined || mainButton == null)
            return;
            
        // Remove all of the existing buttons
        for (i = mainButton.childNodes.length; i > 0; i--) {
            mainButton.removeChild(mainButton.childNodes[0]);
        }
        mainButton.setAttribute("class", "");
        mainButton.removeAttribute("type");
        //mainButton.setAttribute("value", "");
        //mainButton.removeAttribute("context");
        mainButton.setAttribute("label", this.strbundle.getString("installKeeFox.label"));
        mainButton.setAttribute("disabled", "false");
        mainButton.setAttribute("tooltiptext", this.strbundle.getString("installKeeFox.tip"));
        mainButton.setAttribute("oncommand", "keeFoxInst.KeeFox_MainButtonClick_install()");
    },

// I think this will gradually become a generic "update toolbar status" method sicne it makes more sense to
// decide what state the toolbar needs to show when this function is executing rather than calling
// one of many different ones from other locations
    setupButton_ready: function(targetWindow, mainWindowIN) {
        KFLog.debug("setupButton_ready start");
        var mainButton;
        var mainWindow;
        
        if (mainWindowIN != null)
            mainWindow = mainWindowIN;
        else
        {
            mainWindow = targetWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);
        }
        
        mainButton = mainWindow.document.getElementById("KeeFox_Main-Button");
        if (mainButton === undefined || mainButton == null)
            return;
            
        mainButton.setAttribute("disabled", "false");
        // Remove all of the existing buttons
        for (var i = mainButton.childNodes.length; i > 0; i--) {
            mainButton.removeChild(mainButton.childNodes[0]);
        }
        mainButton.setAttribute("class", "");
        mainButton.removeAttribute("type");
        mainButton.removeAttribute("image");
        //mainButton.setAttribute("value", "");
        //mainButton.removeAttribute("context");
        
        var changeDBButton = mainWindow.document.getElementById("KeeFox_ChangeDB-Button");
        
        if (keeFoxInst._keeFoxStorage.get("KeePassDatabaseOpen", false))
        {
            var DBname = mainWindow.keeFoxInst.getDatabaseName();
            if (DBname === null)
                return; // KeePassRPC suddenly dissapeared - toolbar will have been updated from deeper in the stack? maybe not since removal of ICE?
            mainButton.setAttribute("label", this.strbundle.getString("loggedIn.label"));
            mainButton.setAttribute("tooltiptext", this.strbundle.getFormattedString("loggedIn.tip",[DBname]) );
           // mainButton.setAttribute("oncommand", "alert('blah')");
            mainButton.setAttribute("disabled", "true");
            mainButton.removeAttribute("oncommand");
        } else if (!keeFoxInst._keeFoxStorage.get("KeePassRPCInstalled", false))
        {
            mainButton.setAttribute("label", this.strbundle.getString("installKeeFox.label"));
            mainButton.setAttribute("tooltiptext", this.strbundle.getString("installKeeFox.tip"));
            mainButton.setAttribute("oncommand", "keeFoxInst.KeeFox_MainButtonClick_install()");
        
        } else if (!keeFoxInst._keeFoxStorage.get("KeePassRPCActive", false))
        {
            mainButton.setAttribute("label", this.strbundle.getString("launchKeePass.label"));
            mainButton.setAttribute("tooltiptext", this.strbundle.getString("launchKeePass.tip"));
            mainButton.setAttribute("oncommand", "keeFoxInst.launchKeePass('')");
        } else
        {
            mainButton.setAttribute("label", this.strbundle.getString("loggedOut.label"));
            mainButton.setAttribute("tooltiptext", this.strbundle.getString("loggedOut.tip") );
            mainButton.setAttribute("oncommand", "keeFoxInst.loginToKeePass()");
        }

            
        if (keeFoxInst._keeFoxStorage.get("KeePassDatabaseOpen", false) || keeFoxInst._keeFoxStorage.get("KeePassRPCActive", false))
        {    
            changeDBButton.setAttribute("label", this.strbundle.getString("changeDBButton.label"));
            changeDBButton.setAttribute("tooltiptext", this.strbundle.getString("changeDBButton.tip") );
            changeDBButton.setAttribute("onpopupshowing", "keefox_org.toolbar.setMRUdatabases(); event.stopPropagation();");
            changeDBButton.setAttribute("disabled", "false");
            //changeDBButton.setAttribute("onpopuphiding", "keefox_org.toolbar.detachMRUpopup(); event.stopPropagation();");
            
            
        } else
        {
            changeDBButton.setAttribute("label", this.strbundle.getString("changeDBButtonDisabled.label"));
            changeDBButton.setAttribute("tooltiptext", this.strbundle.getString("changeDBButtonDisabled.tip") );
            changeDBButton.setAttribute("onpopupshowing", "");
            //changeDBButton.setAttribute("onpopuphiding", "");
            changeDBButton.setAttribute("disabled", "true");
        }
        KFLog.debug("setupButton_ready end");
    },

    setupButton_loadKeePass: function(targetWindow) {
        KFLog.debug("setupButton_loadKeePass start");
        var mainWindow = targetWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);

        mainButton = mainWindow.document.getElementById("KeeFox_Main-Button");
        if (mainButton === undefined || mainButton == null)
            return;
            
        mainButton.setAttribute("label", this.strbundle.getString("launchKeePass.label"));
        mainButton.setAttribute("disabled", "false");
        // Remove all of the existing buttons
        for (i = mainButton.childNodes.length; i > 0; i--) {
            mainButton.removeChild(mainButton.childNodes[0]);
        }
        mainButton.setAttribute("class", "");
       // mainButton.setAttribute("type", "");
       mainButton.removeAttribute("type");
        mainButton.setAttribute("tooltiptext", this.strbundle.getString("launchKeePass.tip"));
        mainButton.setAttribute("oncommand", "keeFoxInst.launchKeePass('')");
    },
    
    KeeFox_RunSelfTests: function(event, KFtester) {
 
        this._alert("Please load KeePass and create a new empty database (no sample data). Then click OK and wait for the tests to complete. Follow the test progress in the Firefox error console. WARNING: While running these tests do not load any KeePass database which contains data you want to keep.");
        var outMsg = "";
        try {
            KFtester._KeeFoxTestErrorOccurred = false;
            outMsg = KFtester.do_tests();
        }
        catch (err) {
            KFLog.error(err);
            KFLog._alert("Tests failed. View the Firefox error console for further details. This may be a clue: " + err);
            return;
        }

        KFLog.info(outMsg);
        KFLog._alert(outMsg);
    },
    
    flashItem: function (flashyItem, numberOfTimes, theWindow)
    {
        if (flashyItem === undefined || flashyItem == null)
            return;
            
        if (numberOfTimes < 1)
            return;
        
        if (numberOfTimes % 2 == 1)
            flashyItem.setAttribute("class", "");  
        else
            flashyItem.setAttribute("class", "highlight");
        
        theWindow.setTimeout(arguments.callee, 600 - (numberOfTimes * 40), flashyItem, numberOfTimes-1, theWindow);
    },
    
    detachMRUpopup: function () {
    alert("detach");
        var container = this._currentWindow.document.getElementById("KeeFox_ChangeDB-Button");
        if (container === undefined || container == null)
            return;

        //var popupContainer = this._currentWindow.document.getElementById("KeeFox_ChangeDB-Popup");
                // Remove all of the existing popup containers
        for (i = container.childNodes.length; i > 0; i--) {
            container.removeChild(container.childNodes[0]);
        }
        
        
    },
    
    setMRUdatabases: function() {
    //return;
   //     alert("set");
        // get the popup menu for this list of logins and subgroups
   //     var container = this._currentWindow.document.getElementById("KeeFox_ChangeDB-Button");

        var popupContainer = this._currentWindow.document.getElementById("KeeFox_ChangeDB-Popup");
        if (popupContainer === undefined || popupContainer == null)
            return;

        // Remove all of the existing buttons
        for (i = popupContainer.childNodes.length; i > 0; i--) {
            popupContainer.removeChild(popupContainer.childNodes[0]);
        }
        
        var mruArray = this._currentWindow.keeFoxInst.getAllDatabaseFileNames();
        
        
           
        if (mruArray == null || mruArray.length == 0)
        {
            var noItemsButton = null;
            noItemsButton = this._currentWindow.document.createElement("menuitem");
            noItemsButton.setAttribute("label", this.strbundle.getString("changeDBButtonEmpty.label"));
            noItemsButton.setAttribute("disabled", "true");
            noItemsButton.setAttribute("tooltiptext", this.strbundle.getString("changeDBButtonEmpty.tip"));
            popupContainer.appendChild(noItemsButton);
            return;
        } else
        {
        
            for (i = 0; i < mruArray.length; i++)
            {
                var displayName = mruArray[i];
                if (displayName.length > 50)
                {
                    var fileNameStartLocation = displayName.lastIndexOf('\\');
                    var spareChars = 50 - (displayName.length - fileNameStartLocation);
                    if (spareChars > 10)
                    {
                        var path = displayName.substr(0,fileNameStartLocation);
                        var parentStartLocation = path.lastIndexOf('\\');
                        var preferredSpareChars = 50 - (displayName.length - parentStartLocation);
                        if (preferredSpareChars > 10)
                        {
                            suffix = displayName.substr(parentStartLocation);
                            prefix = displayName.substr(0,preferredSpareChars);
                        }
                        else
                        {
                            suffix = displayName.substr(fileNameStartLocation);
                            prefix = displayName.substr(0,spareChars);
                        }
                        displayName = prefix + ' ... ' + suffix;
                    } // otherwise there's not much we can do anyway so just leave it to truncate the end of the file name
                }
                    

                var tempButton = null;
                tempButton = this._currentWindow.document.createElement("menuitem");
                tempButton.setAttribute("label", displayName);
                tempButton.setAttribute("tooltiptext", this.strbundle.getFormattedString("changeDBButtonListItem.tip", [mruArray[i]]) );
                tempButton.setAttribute("oncommand", "keeFoxInst.changeDatabase('" +
                    mruArray[i].replace(/[\\]/g,'\\\\') + "',false);  event.stopPropagation();");
                tempButton.setAttribute("class", "menuitem-iconic");
                //tempButton.setAttribute("context", "KeeFox-login-context"); in future this could enable "set to default for this location..." etc. ?
                tempButton.setAttribute("image", "chrome://keefox/skin/KeeLock.png");

                popupContainer.appendChild(tempButton);


            }
        }
        
    },
    
    // wipe any session data relating to saving login forms that we
    // have associated with the most recent tab.
    clearTabFormRecordingData : function ()
    {
        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
            .getService(Components.interfaces.nsISessionStore);
        var currentGBrowser = this._currentWindow.gBrowser;
        var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];

        var currentPage = ss.getTabValue(currentTab, "KF_recordFormCurrentPage");

        if (currentPage != undefined && currentPage != null && currentPage != "")
        {
            ss.deleteTabValue(currentTab, "KF_recordFormCurrentPage");
        }
        
        var currentStateJSON = ss.getTabValue(currentTab, "KF_recordFormCurrentStateJSON");

        if (currentStateJSON != undefined && currentStateJSON != null && currentStateJSON != "")
        {
            ss.deleteTabValue(currentTab, "KF_recordFormCurrentStateJSON");
        }
        
    },
    
    // prepare the most recent tab for recording a login procedure
    setTabFormRecordingData : function ()
    {
    
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
            .getService(Components.interfaces.nsISessionStore);
        var currentGBrowser = this._currentWindow.gBrowser;
        var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];

//this.log(currentGBrowser.mTabs.selectedIndex);
        var currentPage = ss.getTabValue(currentTab, "KF_recordFormCurrentPage");
        
        if (currentPage == undefined || currentPage == null)
        {
            currentPage = 0; // or 1?
        }
        
        ss.setTabValue(currentTab, "KF_recordFormCurrentPage", currentPage+1);

    },
    
    // wipe any session data relating to filling login forms that we
    // have associated with the most recent tab.
    clearTabFormFillData : function ()
    {
        KFLog.debug("clearTabFormFillData start");
        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
            .getService(Components.interfaces.nsISessionStore);
        var currentGBrowser = this._currentWindow.gBrowser;
        var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];

        var autoSubmit = ss.getTabValue(currentTab, "KF_autoSubmit");

        if (autoSubmit != undefined && autoSubmit != null && autoSubmit != "")
        {
            ss.deleteTabValue(currentTab, "KF_autoSubmit");
        }
        
        var uniqueID = ss.getTabValue(currentTab, "KF_uniqueID");

        if (uniqueID != undefined && uniqueID != null && uniqueID != "")
        {
            ss.deleteTabValue(currentTab, "KF_uniqueID");
        }
        
        var numberOfTabFillsTarget = ss.getTabValue(currentTab, "KF_numberOfTabFillsTarget");

        if (numberOfTabFillsTarget != undefined && numberOfTabFillsTarget != null && numberOfTabFillsTarget != "")
        {
            ss.deleteTabValue(currentTab, "KF_numberOfTabFillsTarget");
        }
        
        var numberOfTabFillsRemaining = ss.getTabValue(currentTab, "KF_numberOfTabFillsRemaining");

        if (numberOfTabFillsRemaining != undefined && numberOfTabFillsRemaining != null && numberOfTabFillsRemaining != "")
        {
            ss.deleteTabValue(currentTab, "KF_numberOfTabFillsRemaining");
        }
        
        
        KFLog.debug("clearTabFormFillData end");    
    },
    
    
    fillCurrentDocument : function ()
    {
        KFLog.debug("fillCurrentDocument start");
        var currentGBrowser = this._currentWindow.gBrowser;
        //var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];
        this.setLogins(null, null);
        this._currentWindow.keefox_org.ILM._fillDocument(currentGBrowser.selectedBrowser.contentDocument, false);        
    },
    
    generatePassword : function ()
    {
        var currentGBrowser = this._currentWindow.gBrowser;
        //var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];
        // no idea why I did this: this.setLogins(null, null);
        var newPassword = this._currentWindow.keeFoxInst.generatePassword();
        if (newPassword.constructor.name == "Error") // Can't use instanceof here becuase the Error object was created in a different scope
        {
            this._currentWindow.alert("Please launch KeePass first.");
        }            
        else
        {
            const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].
            getService(Components.interfaces.nsIClipboardHelper);
            gClipboardHelper.copyString(newPassword);
            
            this._currentWindow.alert("A new password has been copied to your clipboard.");//TODO2: replace with a growl if FF supports such a thing
        }
    }    

};


