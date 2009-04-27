/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
  This KFToolBar.js file contains functions and data related to the visible
  toolbar buttons that kefox.xul defines.
  
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

function KFToolbar(currentWindow) {
    this._currentWindow = currentWindow;
}

KFToolbar.prototype = {

    _currentWindow : null,
    
    _alert : function (msg) {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");

        // get a reference to the prompt service component.
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                            .getService(Components.interfaces.nsIPromptService);

        // show an alert. For the first argument, supply the parent window. The second
        // argument is the dialog title and the third argument is the message
        // to display.
        promptService.alert(window,"Alert",msg);
    },
    
    __logService : null, // Console logging service, used for debugging.
    get _logService() {
        if (!this.__logService)
            this.__logService = Cc["@mozilla.org/consoleservice;1"].
                                getService(Ci.nsIConsoleService);
        return this.__logService;
    },
    
    // Internal function for logging debug messages to the Error Console window
    log : function (message) {
        dump(message+"\n");
        if (this._currentWindow.keeFoxInst._keeFoxExtension.prefs.getValue("debugToConsole",false))
            this._logService.logStringMessage(message);
    },
    
    // Internal function for logging error messages to the Error Console window
    error : function (message) {
        Components.utils.reportError(message);
    },
    
    removeLogins: function() {

        // Get the toolbaritem "container" that we added to our XUL markup
        var container = this._currentWindow.document.getElementById("KeeFox_Main-Button");

        // Remove all of the existing buttons
        for (i = container.childNodes.length; i > 0; i--) {
            container.removeChild(container.childNodes[0]);
        }
        
        this.setupButton_ready(null,this._currentWindow);
    },
    
    setLogins: function(logins) {
this.log("setLogins");
        // Get the toolbaritem "container" that we added to our XUL markup
        var container = this._currentWindow.document.getElementById("KeeFox_Main-Button");
        
        // if the logins container is locked (becuase it's currently open) we don't
        // make any changes. In future, maybe we could delay the change rather than
        // completely ignore it but for now, the frequent "dynamic form polling"
        // feature will ensure a minimal wait for update once the lock is released.
        if (container.getAttribute('KFLock') == "enabled")
            return;

        // Remove all of the existing buttons
        for (i = container.childNodes.length; i > 0; i--) {
            container.removeChild(container.childNodes[0]);
        }

        if (logins == null || logins.length == 0)
        {
            this.setupButton_ready(null,this._currentWindow);
            return;
        }
       
        container.setAttribute("class", "login-found");
        container.setAttribute("type", "menu-button");
        container.setAttribute("disabled", "false");
        container.setAttribute("onpopupshowing", "this.setAttribute('KFLock','enabled');");
        container.setAttribute("onpopuphiding", "this.setAttribute('KFLock','disabled');");
                
        menupopup = this._currentWindow.document.createElement("menupopup");

        this.log("setting " + logins.length + " toolbar logins");

        for (var i = 0; i < logins.length; i++) {
            var login = logins[i];
            
            var userNameID = null;
            var passwordID = null;
            var custFields = login.customFields;
            //this.log(custFields);
            if (custFields != undefined)
            {
                this.log("found some custom fields");
                var enumerator = custFields.enumerate();
                var s = "";
                while (enumerator.hasMoreElements())
                {
                  var customField = enumerator.getNext().QueryInterface(Components.interfaces.kfILoginField);
                  
                  // for now we're only using custom fields to increase form selection accuracy
                  if (customField.name == 'Form field special_form_username_ID value')
                    userNameID = customField.value;
                   else if (customField.name == 'Form field special_form_password_ID value')
                    passwordID = customField.value;
                }
                //this.log(s);
            }
            
            if (i==0)
            {
                container.setAttribute("label", login.title);
                container.setAttribute("tooltiptext", login.username );
                container.setAttribute("oncommand", "keeFoxILM.fill('" +
                    login.usernameField + "','" + login.username + "','" + login.formActionURL + "','"+userNameID+"','"+passwordID+"','" + login.uniqueID + "'); event.stopPropagation();");
                  //  container.oncommand = keeFoxILM.fill(login.usernameField ,login.username , login.formSubmitURL ,userNameID,passwordID,login.uniqueID );
            
            }


            var tempButton = null;
            tempButton = this._currentWindow.document.createElement("menuitem");
            tempButton.setAttribute("label", login.title);
            tempButton.setAttribute("tooltiptext", login.username);
            tempButton.setAttribute("oncommand", "keeFoxILM.fill('" +
                login.usernameField + "','" + login.username + "','" + login.formActionURL + "','"+userNameID+"','"+passwordID+"','" + login.uniqueID + "');  event.stopPropagation();");
            menupopup.appendChild(tempButton);


        }
        
        container.appendChild(menupopup);
this.log("test2:"+container.getAttribute("oncommand"));
    },
    
    setAllLogins: function() {
        this.log("setAllLogins");
        
        if (keeFoxInst._keeFoxStorage.get("KeePassDatabaseOpen", false))
        {
            var rootGroup = this._currentWindow.keeFoxILM.getRootGroup();
            
            if (rootGroup != null && rootGroup != undefined && rootGroup.uniqueID)
                this.setOneLoginsMenu("KeeFox_Logins-Button-root", rootGroup.uniqueID);
            return;
        }// else
        //{
            // get the popup menu for this list of logins and subgroups
            var container = this._currentWindow.document.getElementById("KeeFox_Logins-Button-root");

            // Remove all of the existing buttons
            for (i = container.childNodes.length; i > 0; i--) {
                container.removeChild(container.childNodes[0]);
            }
        //}
        
       /*
        var foundGroups = this._currentWindow.keeFoxILM.getChildGroups({}, rootGroup.uniqueID);
        var foundLogins = this._currentWindow.keeFoxILM.getChildEntries({}, rootGroup.uniqueID);

        if (logins == null || logins.length == 0)
        {
            this.setupButton_ready(null,this._currentWindow);
            return;
        }
       
        container.setAttribute("class", "login-found");
        container.setAttribute("type", "menu-button");
        container.setAttribute("disabled", "false");
                
        menupopup = this._currentWindow.document.createElement("menupopup");

        this.log("setting " + logins.length + " toolbar logins");

        for (var i = 0; i < logins.length; i++) {
            var login = logins[i];
            
            var userNameID = null;
            var passwordID = null;
            var custFields = login.customFields;
            //this.log(custFields);
            if (custFields != undefined)
            {
                this.log("found some custom fields");
                var enumerator = custFields.enumerate();
                var s = "";
                while (enumerator.hasMoreElements())
                {
                  var customField = enumerator.getNext().QueryInterface(Components.interfaces.kfILoginField);
                  
                  // for now we're only using custom fields to increase form selection accuracy
                  if (customField.name == 'Form field special_form_username_ID value')
                    userNameID = customField.value;
                   else if (customField.name == 'Form field special_form_password_ID value')
                    passwordID = customField.value;
                }
                //this.log(s);
            }
            
            if (i==0)
            {
                container.setAttribute("label", login.title);
                container.setAttribute("tooltiptext", "Button " + i + ": " + login.username );
                container.setAttribute("oncommand", "keeFoxILM.fill('" +
                    login.usernameField + "','" + login.username + "','" + login.formSubmitURL + "','"+userNameID+"','"+passwordID+"','" + login.uniqueID + "'); event.stopPropagation();");
                  //  container.oncommand = keeFoxILM.fill(login.usernameField ,login.username , login.formSubmitURL ,userNameID,passwordID,login.uniqueID );
            
            }


            var tempButton = null;
            tempButton = this._currentWindow.document.createElement("menuitem");
            tempButton.setAttribute("label", login.title);
            tempButton.setAttribute("tooltiptext", "Button " + i + ": " + login.username);
            tempButton.setAttribute("oncommand", "keeFoxILM.fill('" +
                login.usernameField + "','" + login.username + "','" + login.formSubmitURL + "','"+userNameID+"','"+passwordID+"','" + login.uniqueID + "');  event.stopPropagation();");
            menupopup.appendChild(tempButton);


        }
        
        container.appendChild(menupopup);
this.log("test2:"+container.getAttribute("oncommand"));
*/
    },
    
    setOneLoginsMenu: function(containerID, groupUniqueID) {
        this.log("setOneLoginsMenu called for [" + containerID + "] with uniqueRef: " + groupUniqueID);

        // get the popup menu for this list of logins and subgroups
        var container = this._currentWindow.document.getElementById(containerID);

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
            noItemsButton.setAttribute("label", keeFoxInst.strbundle.getString("loginsButtonEmpty.label"));
            noItemsButton.setAttribute("disabled", "true");
            noItemsButton.setAttribute("tooltiptext", keeFoxInst.strbundle.getString("loginsButtonEmpty.tip"));
            container.appendChild(noItemsButton);
            return;
        }
       /*
        container.setAttribute("class", "login-found");
        container.setAttribute("type", "menu-button");
        container.setAttribute("disabled", "false");
                
        menupopup = this._currentWindow.document.createElement("menupopup");

        this.log("setting " + logins.length + " toolbar logins");
*/
        for (var i = 0; i < foundGroups.length; i++) {
            var group = foundGroups[i];
            
            /*
            
            if (i==0)
            {
                container.setAttribute("label", login.title);
                container.setAttribute("tooltiptext", "Button " + i + ": " + login.username );
                container.setAttribute("oncommand", "keeFoxILM.fill('" +
                    login.usernameField + "','" + login.username + "','" + login.formSubmitURL + "','"+userNameID+"','"+passwordID+"','" + login.uniqueID + "'); event.stopPropagation();");
                  //  container.oncommand = keeFoxILM.fill(login.usernameField ,login.username , login.formSubmitURL ,userNameID,passwordID,login.uniqueID );
            
            }
*/

            // maybe this duplicated oncommand, etc. is un-needed?
            var newMenu = null;
            newMenu = this._currentWindow.document.createElement("menu");
            newMenu.setAttribute("label", group.title);
            newMenu.setAttribute("tooltiptext", keeFoxInst.strbundle.getString("loginsButtonGroup.tip"));
            newMenu.setAttribute("onpopupshowing", "keeFoxToolbar.setOneLoginsMenu('KeeFox_Group-" +
                group.uniqueID + "','" + group.uniqueID + "'); event.stopPropagation();");
            newMenu.setAttribute("class", "menuitem-iconic");
            newMenu.setAttribute("value", group.uniqueID);
            newMenu.setAttribute("context", "KeeFox-group-context");
            newMenu.setAttribute("image", "chrome://mozapps/skin/passwordmgr/key.png");
            container.appendChild(newMenu);
            
            var newMenuPopup = null;
            newMenuPopup = this._currentWindow.document.createElement("menupopup");
            newMenuPopup.setAttribute("id", "KeeFox_Group-" + group.uniqueID);
            //newMenuPopup.setAttribute("label", group.title);
            //newMenuPopup.setAttribute("tooltiptext", keeFoxInst.strbundle.getString("loginsButtonGroup.tip"));
            //newMenuPopup.setAttribute("oncommand", "keeFoxToolbar.setOneLoginsMenu('KeeFox_Group-" +
            //    group.uniqueID + "','" + group.uniqueID + "');");
            newMenu.appendChild(newMenuPopup);


        }
        
        for (var i = 0; i < foundLogins.length; i++) {
            var login = foundLogins[i];
            
            /*
            
            if (i==0)
            {
                container.setAttribute("label", login.title);
                container.setAttribute("tooltiptext", "Button " + i + ": " + login.username );
                container.setAttribute("oncommand", "keeFoxILM.fill('" +
                    login.usernameField + "','" + login.username + "','" + login.formSubmitURL + "','"+userNameID+"','"+passwordID+"','" + login.uniqueID + "'); event.stopPropagation();");
                  //  container.oncommand = keeFoxILM.fill(login.usernameField ,login.username , login.formSubmitURL ,userNameID,passwordID,login.uniqueID );
            
            }
*/

            var tempButton = null;
            tempButton = this._currentWindow.document.createElement("menuitem");
            tempButton.setAttribute("label", login.title);
            tempButton.setAttribute("tooltiptext", keeFoxInst.strbundle.getString("loginsButtonLogin.tip"));
            tempButton.setAttribute("oncommand", "keeFoxILM.loadAndAutoSubmit('" +
                login.usernameField + "','" + login.username + "','" + login.URL + "',null,null,'" + login.uniqueID + "');  event.stopPropagation();");
            tempButton.setAttribute("class", "menuitem-iconic");
            tempButton.setAttribute("value", login.uniqueID);
            tempButton.setAttribute("context", "KeeFox-login-context");
            tempButton.setAttribute("image", "chrome://mozapps/skin/passwordmgr/key.png");

            container.appendChild(tempButton);


        }
        
    },

    setupButton_installListener: {
        _KFToolBar: null,
        QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIDOMEventListener, Components.interfaces.nsISupportsWeakReference]),

        handleEvent: function(event) {
            this.log("setupButton_installListener: got event " + event.type);

            var doc, inputElement;
            switch (event.type) {
                case "load":
                    doc = event.target;
                    this._KFToolBar.setupButton_install(doc.defaultView);
                    return;

                default:
                    this.log("This event was unexpected and has been ignored.");
                    return;
            }
        }

    },
    
    setupButton_readyListener: {
        _KFToolBar: null,
        QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIDOMEventListener, Components.interfaces.nsISupportsWeakReference]),

        handleEvent: function(event) {
            this.log("setupButton_readyListener: got event " + event.type);

            var doc, inputElement;
            switch (event.type) {
                case "load":
                    doc = event.target;
                    this._KFToolBar.setupButton_ready(doc.defaultView);
                    return;

                default:
                    this.log("This event was unexpected and has been ignored.");
                    return;
            }
        }

    },
    
    setupButton_loadKeePassListener: {
        _KFToolBar: null,
        QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIDOMEventListener, Components.interfaces.nsISupportsWeakReference]),

        handleEvent: function(event) {
            this.log("setupButton_loadKeePassListener: got event " + event.type);

            var doc, inputElement;
            switch (event.type) {
                case "load":
                    doc = event.target;
                    this._KFToolBar.setupButton_loadKeePass(doc.defaultView);
                    return;

                default:
                    this.log("This event was unexpected and has been ignored.");
                    return;
            }
        }

    },

    setupButton_install: function(targetWindow) {
        this.log("setupButton_install");
        var mainWindow = targetWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);

        mainButton = mainWindow.document.getElementById("KeeFox_Main-Button");
        
        // Remove all of the existing buttons
        for (i = mainButton.childNodes.length; i > 0; i--) {
            mainButton.removeChild(mainButton.childNodes[0]);
        }
        mainButton.setAttribute("class", "");
        //mainButton.setAttribute("type", "");
        mainButton.removeAttribute("type");
        mainButton.setAttribute("label", keeFoxInst.strbundle.getString("installKeeFox.label"));
        mainButton.setAttribute("disabled", "false");
        mainButton.setAttribute("tooltiptext", keeFoxInst.strbundle.getString("installKeeFox.tip"));
        mainButton.setAttribute("oncommand", "keeFoxInst.KeeFox_MainButtonClick_install()");
    },

// I think this will gradually become a generic "update toolbar status" method sicne it makes more sense to
// decide what state the toolbar needs to show when this function is executing rather than calling
// one of many different ones from other locations
    setupButton_ready: function(targetWindow, mainWindowIN) {
        this.log("setupButton_ready");
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
        mainButton.setAttribute("disabled", "false");
        // Remove all of the existing buttons
        for (i = mainButton.childNodes.length; i > 0; i--) {
            mainButton.removeChild(mainButton.childNodes[0]);
        }
        mainButton.setAttribute("class", "");
        //mainButton.setAttribute("type", "");
        mainButton.removeAttribute("type");
        
        if (keeFoxInst._keeFoxStorage.get("KeePassDatabaseOpen", false))
        {
            this.log("setupButton_ready1");
            var DBname = mainWindow.keeFoxInst.getDatabaseName();
            if (DBname == null || DBname == "")
                return; // KeeICE suddenly dissapeared - toolbar will have been updated from deeper in the stack
            mainButton.setAttribute("label", keeFoxInst.strbundle.getString("loggedIn.label"));
            mainButton.setAttribute("tooltiptext", keeFoxInst.strbundle.getFormattedString("loggedIn.tip",[DBname]) );
           // mainButton.setAttribute("oncommand", "alert('blah')");
            mainButton.setAttribute("disabled", "true");
            mainButton.removeAttribute("oncommand");
        this.log("setupButton_ready1end");
        } else if (!keeFoxInst._keeFoxStorage.get("KeeICEInstalled", false))
        {
            mainButton.setAttribute("label", keeFoxInst.strbundle.getString("installKeeFox.label"));
            mainButton.setAttribute("tooltiptext", keeFoxInst.strbundle.getString("installKeeFox.tip"));
            mainButton.setAttribute("oncommand", "keeFoxInst.KeeFox_MainButtonClick_install()");
        
        } else if (!keeFoxInst._keeFoxStorage.get("KeeICEActive", false))
        {
        this.log("setupButton_ready2");
            mainButton.setAttribute("label", keeFoxInst.strbundle.getString("launchKeePass.label"));
            mainButton.setAttribute("tooltiptext", keeFoxInst.strbundle.getString("launchKeePass.tip"));
            mainButton.setAttribute("oncommand", "keeFoxInst.launchKeePass('')");
        } else
        {
        this.log("setupButton_ready3");
            mainButton.setAttribute("label", keeFoxInst.strbundle.getString("loggedOut.label"));
            mainButton.setAttribute("tooltiptext", keeFoxInst.strbundle.getString("loggedOut.tip") );
            mainButton.setAttribute("oncommand", "keeFoxInst.loginToKeePass()");
        }

            
        
    },

    setupButton_loadKeePass: function(targetWindow) {
        this.log("setupButton_loadKeePass");
        var mainWindow = targetWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);

        mainButton = mainWindow.document.getElementById("KeeFox_Main-Button");
        mainButton.setAttribute("label", keeFoxInst.strbundle.getString("launchKeePass.label"));
        mainButton.setAttribute("disabled", "false");
        // Remove all of the existing buttons
        for (i = mainButton.childNodes.length; i > 0; i--) {
            mainButton.removeChild(mainButton.childNodes[0]);
        }
        mainButton.setAttribute("class", "");
       // mainButton.setAttribute("type", "");
       mainButton.removeAttribute("type");
        mainButton.setAttribute("tooltiptext", keeFoxInst.strbundle.getString("launchKeePass.tip"));
        mainButton.setAttribute("oncommand", "keeFoxInst.launchKeePass('')");
    },
    
    KeeFox_RunSelfTests: function(event, KFtester) {
        this._alert("Please load KeePass and create a new empty database (no sample data). Then click OK and wait for the tests to complete. Follow the test progress in the Firefox error console. WARNING: While running these tests do not load any KeePass database which contains data you want to keep.");
        try {
            KFtester._KeeFoxTestErrorOccurred = false;
            KFtester.do_tests();
        }
        catch (err) {
            this.error(err);
            this._alert("Tests failed. View the Firefox error console for further details. Summary follows:" + err);
            return;
        }

        this.log("Tests finished - everything worked!");
        this._alert("Tests finished - everything worked!");
    },
    
    flashItem: function (flashyItem, numberOfTimes, theWindow) {
    
        if (numberOfTimes < 1)
            return;
        
        if (numberOfTimes % 2 == 1)
            flashyItem.setAttribute("class", "");  
        else
            flashyItem.setAttribute("class", "highlight");
        
        theWindow.setTimeout(arguments.callee, 600 - (numberOfTimes * 40), flashyItem, numberOfTimes-1, theWindow);
    }


};