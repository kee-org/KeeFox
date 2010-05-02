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
        //TODO: see if we can remove this successfully: this.setupButton_ready(null,this._currentWindow);
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
        container.setAttribute("type", "menu-button");
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
            
            if (login.usernameIndex != null && login.usernameIndex != undefined && login.usernameIndex >= 0 && login.otherFields != null && login.otherFields.length > 0)
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
                container.setAttribute("label", login.title);
                container.setAttribute("value", doc.documentURI);
                container.setAttribute("tooltiptext", usernameDisplayValue + " in " +  displayGroupPath);
                container.setAttribute("oncommand", "keeFoxILM.fill('" +
                    usernameName + "','" + usernameValue + "','" + login.formActionURL + "','"+usernameId+"',null,'" + login.uniqueID + "','" + doc.documentURI + "'); event.stopPropagation();");
            
            }

            var tempButton = null;
            tempButton = this._currentWindow.document.createElement("menuitem");
            tempButton.setAttribute("label", login.title);
            tempButton.setAttribute("class", "menuitem-iconic");
            tempButton.setAttribute("image", "data:image/png;base64,"+login.iconImageData);
            tempButton.setAttribute("value", doc.documentURI);
            tempButton.setAttribute("tooltiptext", usernameDisplayValue + " in " + displayGroupPath);
            tempButton.setAttribute("oncommand", "keeFoxILM.fill('" +
                usernameName + "','" + usernameValue + "','" + login.formActionURL + "','"+usernameId+"','null','" + login.uniqueID + "','" + doc.documentURI + "'); event.stopPropagation();");
            menupopup.appendChild(tempButton);

        }
        
        container.appendChild(menupopup);
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
                var rootGroup = this._currentWindow.keeFoxILM.getRootGroup();
                
                if (rootGroup != null && rootGroup != undefined && rootGroup.uniqueID)
                    this.setOneLoginsMenu("KeeFox_Logins-Button-root", rootGroup.uniqueID);
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
    setOneLoginsMenu: function(containerID, groupUniqueID)
    {
        KFLog.debug("setOneLoginsMenu called for [" + containerID + "] with uniqueRef: " + groupUniqueID);

        // get the popup menu for this list of logins and subgroups
        var container = this._currentWindow.document.getElementById(containerID);
        if (container === undefined || container == null)
            return;
            
        // Remove all of the existing buttons
        for (i = container.childNodes.length; i > 0; i--) {
            container.removeChild(container.childNodes[0]);
        }
        
        var foundGroups = this._currentWindow.keeFoxILM.getChildGroups({}, groupUniqueID);
        var foundLogins = this._currentWindow.keeFoxILM.getChildEntries({}, groupUniqueID);

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

        for (var i = 0; i < foundGroups.length; i++)
        {
            var group = foundGroups[i];
            
            // maybe this duplicated oncommand, etc. is un-needed?
            var newMenu = null;
            newMenu = this._currentWindow.document.createElement("menu");
            newMenu.setAttribute("label", group.title);
            newMenu.setAttribute("tooltiptext", this.strbundle.getString("loginsButtonGroup.tip"));
            newMenu.setAttribute("onpopupshowing", "keeFoxToolbar.setOneLoginsMenu('KeeFox_Group-" +
                group.uniqueID + "','" + group.uniqueID + "'); event.stopPropagation();");
            newMenu.setAttribute("class", "menu-iconic");
            newMenu.setAttribute("value", group.uniqueID);
            newMenu.setAttribute("context", "KeeFox-group-context");
            //newMenu.setAttribute("image", "chrome://mozapps/skin/passwordmgr/key.png");
            newMenu.setAttribute("image", "data:image/png;base64,"+group.iconImageData);
            container.appendChild(newMenu);
            
            var newMenuPopup = null;
            newMenuPopup = this._currentWindow.document.createElement("menupopup");
            newMenuPopup.setAttribute("id", "KeeFox_Group-" + group.uniqueID);
            newMenu.appendChild(newMenuPopup);

        }
        
        for (var i = 0; i < foundLogins.length; i++)
        {
            var login = foundLogins[i];
            var usernameValue = "";
            var usernameName = "";
            var usernameId = "";
            var usernameDisplayValue = "["+this.strbundle.getString("noUsername.partial-tip")+"]";
            
            if (login.usernameIndex != null && typeof(login.usernameIndex) != "undefined" 
                && login.usernameIndex >= 0 && login.usernameIndex >= 0 && login.otherFields != null 
                && login.otherFields.length > 0)
            {
                KFLog.debug("otherfields length: "+login.otherFields.length);
                KFLog.debug("login.usernameIndex: "+login.usernameIndex);

                var field = login.otherFields[login.usernameIndex];

                usernameValue = field.value;
                if (usernameValue != undefined && usernameValue != null && usernameValue != "")
                    usernameDisplayValue = usernameValue;
                usernameName = field.name;
                usernameId = field.fieldId;
            }

            var tempButton = null;
            tempButton = this._currentWindow.document.createElement("menuitem");
            tempButton.setAttribute("label", login.title);
            tempButton.setAttribute("tooltiptext", this.strbundle.getFormattedString(
                "loginsButtonLogin.tip", [login.URLs[0], usernameDisplayValue]));
            tempButton.setAttribute("oncommand", "keeFoxILM.loadAndAutoSubmit(0,event.ctrlKey,'" +
                usernameName + "','" + usernameValue + "','" + login.URLs[0] 
                + "',null,null,'" + login.uniqueID + "');  event.stopPropagation();");
            tempButton.setAttribute("onclick", "if (event.button == 1) { keeFoxILM.loadAndAutoSubmit(event.button,event.ctrlKey,'" +
                usernameName + "','" + usernameValue + "','" + login.URLs[0] 
                + "',null,null,'" + login.uniqueID + "'); } event.stopPropagation(); if (event.button == 1) keeFoxUI.closeMenus(event.target);");// var container = this._currentWindow.document.getElementById('KeeFox_Logins-Button-root'); container.setAttribute('visible', 'false');");
            tempButton.setAttribute("class", "menuitem-iconic");
            tempButton.setAttribute("value", login.uniqueID);
            tempButton.setAttribute("context", "KeeFox-login-context");
            tempButton.setAttribute("image", "data:image/png;base64,"+login.iconImageData);

            container.appendChild(tempButton);
        }
        
    },

//    setupButton_installListener: {
//        _KFToolBar: null,
//        QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIDOMEventListener, Components.interfaces.nsISupportsWeakReference]),

//        handleEvent: function(event) {
//            KFLog.debug("setupButton_installListener: got event " + event.type);

//            var doc, inputElement;
//            switch (event.type) {
//                case "load":
//                    doc = event.target;
//                    this._KFToolBar.setupButton_install(doc.defaultView);
//                    return;

//                default:
//                    KFLog.warn("This event was unexpected and has been ignored.");
//                    return;
//            }
//        }

//    },
//    
//    setupButton_readyListener: {
//        _KFToolBar: null,
//        QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIDOMEventListener, Components.interfaces.nsISupportsWeakReference]),

//        handleEvent: function(event) {
//            KFLog.debug("setupButton_readyListener: got event " + event.type);

//            var doc, inputElement;
//            switch (event.type) {
//                case "load":
//                    doc = event.target;
//                    this._KFToolBar.setupButton_ready(doc.defaultView);
//                    return;

//                default:
//                    KFLog.warn("This event was unexpected and has been ignored.");
//                    return;
//            }
//        }

//    },
//    
//    setupButton_loadKeePassListener: {
//        _KFToolBar: null,
//        QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIDOMEventListener, Components.interfaces.nsISupportsWeakReference]),

//        handleEvent: function(event) {
//            KFLog.debug("setupButton_loadKeePassListener: got event " + event.type);

//            var doc, inputElement;
//            switch (event.type) {
//                case "load":
//                    doc = event.target;
//                    this._KFToolBar.setupButton_loadKeePass(doc.defaultView);
//                    return;

//                default:
//                    KFLog.warn("This event was unexpected and has been ignored.");
//                    return;
//            }
//        }

//    },

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
        //mainButton.setAttribute("type", "");
        mainButton.removeAttribute("type");
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
        //mainButton.setAttribute("type", "");
        mainButton.removeAttribute("type");
        
        var changeDBButton = mainWindow.document.getElementById("KeeFox_ChangeDB-Button");
        
        if (keeFoxInst._keeFoxStorage.get("KeePassDatabaseOpen", false))
        {
            var DBname = mainWindow.keeFoxInst.getDatabaseName();
            if (DBname == null || DBname == "")
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
            changeDBButton.setAttribute("onpopupshowing", "keeFoxToolbar.setMRUdatabases(); event.stopPropagation();");
            changeDBButton.setAttribute("disabled", "false");
            //changeDBButton.setAttribute("onpopuphiding", "keeFoxToolbar.detachMRUpopup(); event.stopPropagation();");
            
            
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
               

                var tempButton = null;
                tempButton = this._currentWindow.document.createElement("menuitem");
                tempButton.setAttribute("label", mruArray[i]);
                tempButton.setAttribute("tooltiptext", this.strbundle.getString("changeDBButtonListItem.tip"));
                tempButton.setAttribute("oncommand", "keeFoxInst.changeDatabase('" +
                    mruArray[i].replace(/[\\]/g,'\\\\') + "',false);  event.stopPropagation();");
                tempButton.setAttribute("class", "menuitem-iconic");
                //tempButton.setAttribute("context", "KeeFox-login-context"); in future this could enable "set to default for this location..." etc. ?
                tempButton.setAttribute("image", "chrome://mozapps/skin/passwordmgr/key.png"); //TODO: use KeePass database icon

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
            /*
            TODO:
            Error: uncaught exception: [Exception... "'Illegal value' when calling method: [nsISessionStore::deleteTabValue]"  nsresult: "0x80070057 (NS_ERROR_ILLEGAL_VALUE)"  location: "JS frame :: chrome://keefox/content/keefox.js -> resource://kfscripts/KFToolBar.js :: anonymous :: line 587"  data: no]
            */
        }
        
        var currentStateMain = ss.getTabValue(currentTab, "KF_recordFormCurrentStateMain");

        if (currentStateMain != undefined && currentStateMain != null && currentStateMain != "")
        {
            ss.deleteTabValue(currentTab, "KF_recordFormCurrentStateMain");
        }
        
        var currentStatePasswords = ss.getTabValue(currentTab, "KF_recordFormCurrentStatePasswords");

        if (currentStatePasswords != undefined && currentStatePasswords != null && currentStatePasswords != "")
        {
            ss.deleteTabValue(currentTab, "KF_recordFormCurrentStatePasswords");
        }
        
        var currentStateOtherFields = ss.getTabValue(currentTab, "KF_recordFormCurrentStateOtherFields");

        if (currentStateOtherFields != undefined && currentStateOtherFields != null && currentStateOtherFields != "")
        {
            ss.deleteTabValue(currentTab, "KF_recordFormCurrentStateOtherFields");
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
        
        
            
    },
    
    
    fillCurrentDocument : function ()
    {
        var currentGBrowser = this._currentWindow.gBrowser;
        //var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];
        this.setLogins(null, null);
        this._currentWindow.keeFoxILM._fillDocument(currentGBrowser.selectedBrowser.contentDocument, false);
        
    },
    
    generatePassword : function ()
    {
        var currentGBrowser = this._currentWindow.gBrowser;
        //var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];
        this.setLogins(null, null);
        var newPassword = this._currentWindow.keeFoxInst.generatePassword();
        
        const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].
        getService(Components.interfaces.nsIClipboardHelper);
        gClipboardHelper.copyString(newPassword);
        
        this._currentWindow.alert("A new password has been copied to your clipboard.");//TODO: replace with a growl if FF supports such a thing
    }    

};


