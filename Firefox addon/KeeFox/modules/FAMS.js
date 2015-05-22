/*
  FAMS: Firefox Add-on Messaging Service - Provides secure messaging services to
  Firefox add-ons.
  
  Version 1.5

  Changes since 1.0: Localisation overhaul to allow for multiple languages at
  both build time and later delivery through (hypothetical) remote service
  
  Messages can be configured at add-on build time
  or (in the hypothetical version 2) through a remote delivery service.
  
  Messages can be proven to be authentic providing that the Firefox installation
  is not compromised (this is trivial until the hypothetical version 2).
  
  Copyright 2012 Chris Tomlinson <fams@christomlinson.name>
  
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

let Ci = Components.interfaces;
let Cu = Components.utils;
let Cc = Components.classes;

var EXPORTED_SYMBOLS = ["FirefoxAddonMessageService","keeFoxGetFamsInst"]; //TODO:2: KeeFox specific (to meet Mozilla add-on review guidelines)
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://kfmod/locales.js");
Cu.import("resource://kfmod/FAMS-config.js");

var _famsInst = null;
function keeFoxGetFamsInst(id, config, log, notificationService) {
    if (!_famsInst) {
        _famsInst = new FirefoxAddonMessageService();
        _famsInst.initConfig(id, config);
        _famsInst.init(log);
        _famsInst.notificationService = notificationService;
    }
    return _famsInst;
};


// constructor
function FirefoxAddonMessageService()
{
    this._prefService =  
        Components.classes["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
    this.prefBranch = this._prefService.getBranch("extensions.fams@chris.tomlinson.");
    
    this._evaluationTimer = Components.classes["@mozilla.org/timer;1"]
                        .createInstance(Ci.nsITimer);
    this._downloadTimer = Components.classes["@mozilla.org/timer;1"]
                        .createInstance(Ci.nsITimer);
    this._initialEvaluationTimer = Components.classes["@mozilla.org/timer;1"]
                        .createInstance(Ci.nsITimer);
    
    // set up FAMS localisation
    this.locale = new Localisation(["chrome://keefox/locale/keefox.properties","chrome://keefox/locale/FAMS.keefox.properties"]); //TODO:2: KeeFox specific

    this._log("constructed at " + Date());
}

FirefoxAddonMessageService.prototype = {

    configuration: null,
    timeFactorDownload: 3600000, // download values displayed to user in hours
    timeFactorDisplay: 86400000, // display values displayed to user in days
    strbundle: null,

    _log: function (message) {
    //    var _logService = Components.classes["@mozilla.org/consoleservice;1"].
    //    getService(Ci.nsIConsoleService); _logService.logStringMessage("FirefoxAddonMessageService: " + message);
    //}, // stub logger logs everything to console
    }, // stub logger logs nothing

    runMessageProcessesHandler: {
        notify: function (timer) {
            // I hate this, it's a horrible hack but I can't find any other way to
            // get access to this module object through a nsITimer callback
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Ci.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            var fams = window.keefox_win.FAMS; //TODO:2: KeeFox specific
            fams.runMessageProcesses();
        }
    },

    downloadNewMessagesHandler: {
        notify: function (timer) {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Ci.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            var fams = window.keefox_win.FAMS; //TODO:2: KeeFox specific
            fams.downloadNewMessages();
        }
    },

    init: function (logger) {
        // Overriding the logging method doesn't work some reason.
        //this._log("startttttttt at " + Date());
        //    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
        //                           .getService(Ci.nsIWindowMediator);
        //        var window2 = wm.getMostRecentWindow("navigator:browser") ||
        //            wm.getMostRecentWindow("mail:3pane");

        //        // get a reference to the prompt service component.
        //        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
        //                            .getService(Ci.nsIPromptService);

        //        promptService.alert(window2,"Alert",logger);
        //        promptService.alert(window2,"Alert",typeof(logger));
        //    
        //    
        //    if (logger != undefined && typeof(logger) == "function")
        //this._log = logger;// function (msg) { logger.call(this, msg); };

        //this._log("init started at " + Date());



        this.configuration = this.getConfiguration();
        try {
            var startupInfo = Components.classes["@mozilla.org/toolkit/app-startup;1"]
                                  .getService(Ci.nsIAppStartup).getStartupInfo();
            this.startUpTime = startupInfo['main'];
        } catch (ex) {
            // Assume Firefox started 10 seconds ago
            this.startUpTime = (new Date()).getTime() - 10000;
        }

        // Record the first time this init function is run so we know when
        // the service was first installed
        try {
            var installTimeString = this.prefBranch.getCharPref("installTime." + this.configuration.id);
        } catch (ex) { this.prefBranch.setCharPref("installTime." + this.configuration.id, (new Date()).toUTCString()); }

        if (this.isEnabled()) {
            this._initialEvaluationTimer.initWithCallback(this.runMessageProcessesHandler, this.configuration.minTimeAfterStartup, Ci.nsITimer.TYPE_ONE_SHOT); // technically could trigger this a bit earlier to take account of time between app startup and this init being called but best to err on the side of caution
            this.setupRegularMessageProcesses();
        }
        this._log("init complete at " + Date());
    }
};

FirefoxAddonMessageService.prototype.isEnabled = function()
{
    // Might allow end-user to change this one day
    return true;
};


// Work out which message group we should display a message from
FirefoxAddonMessageService.prototype.runMessageProcesses = function () {
    var groupsToDisplay = [];

    //Debug: uncomment to force display of first message of security group found
//    var messageGroup = this.findMessageGroup("security");
//    var result = this.showMessageHandler(messageGroup.messages[0], "security");
//    if (result) {
//        this._log("message true");
//        messageGroup.lastMessageDisplayedTime = new Date().toUTCString();
//        this.setConfiguration(this.configuration);
//        return true;
//    }
//    return;

    //NB: Groups are disabled by removing them from the list of known Message Groups
    for (var i = 0; i < this.configuration.knownMessageGroups.length; i++) {
        var messageGroupId = this.configuration.knownMessageGroups[i];
        this._log("evaluating message group: " + messageGroupId);
        var messageGroup = this.findMessageGroup(messageGroupId);

        if (!messageGroup) {
            this._log("WARNING: known message group not found: " + messageGroupId);
            continue;
        }

        // Skip if this group should not be displayed at this time
        if (!this.canDisplayGroupNow(messageGroup))
            continue;

        groupsToDisplay.push(messageGroup);
    }

    // Make sure that high priority groups are considered first (but not exclusively)
    groupsToDisplay.sort(function (a, b) {
        return b.priority - a.priority;
    }
    );

    // Try every group until we have found a message to display
    for (var j = 0; j < groupsToDisplay.length; j++) {
        var result = this.displayNextMessage(groupsToDisplay[j]);
        if (result)
            break;
    }
    this._log("runMessageProcesses complete");
};

//TODO:2: What about people that always close Firefox within an hour? Maybe have a maximum wait measured in days that forces a process run within 30 seconds of app start?
FirefoxAddonMessageService.prototype.setupRegularMessageProcesses = function () {
    //Debug: force display frequency to 30 seconds
//    this.configuration.timeBetweenMessages = 30000;
    this._log("configuring runMessageProcessesHandler call every " + this.configuration.timeBetweenMessages + "ms");
    this._evaluationTimer.initWithCallback(this.runMessageProcessesHandler, this.configuration.timeBetweenMessages, Ci.nsITimer.TYPE_REPEATING_SLACK);
    //    this._log("configuring downloadNewMessagesHandler call every " + this.configuration.timeBetweenDownloadingMessages + "ms");
    //    this._downloadTimer.initWithCallback(this.downloadNewMessagesHandler, this.configuration.timeBetweenDownloadingMessages, Ci.nsITimer.TYPE_REPEATING_SLACK);
};

FirefoxAddonMessageService.prototype.downloadNewMessages = function()
{
//TODO:2: Actually load the data from the remote location (e.g. JSON?)
//urlForDownloadingMessages
};

// Criteria shared by messages and message groups when determining if
// they should be displayed now
FirefoxAddonMessageService.prototype.canDisplayNowShared = function(item)
{
    // If it's too recent since the first install
    if (item.minTimeAfterInstall > this.getTimeSinceInstall())
        return false;
        
    // If it's too recent since application startup
    if (typeof (item.minTimeAfterStartup) !== "undefined" && item.minTimeAfterStartup > this.getTimeSinceStartup())
        return false;
        
    // If it's too soon to display this item
    if (new Date(item.earliestDisplayTime).getTime() >= (new Date()).getTime())
        return false;
    
    // If it's too late to display this item
    if (new Date(item.latestDisplayTime).getTime() < (new Date()).getTime())
        return false;
    
    return true;
};

FirefoxAddonMessageService.prototype.canDisplayGroupNow = function(messageGroup)
{
    this._log("evaluating whether to display message group: " + messageGroup.id);
    var sharedResult = this.canDisplayNowShared(messageGroup);    
    if (!sharedResult)
        return false;

    // If it's too soon to display this messageGroup again
    if (new Date(messageGroup.lastMessageDisplayedTime).getTime() > (new Date()).getTime() - messageGroup.minTimeBetweenMessages)
        return false;
    
    // It's OK to display it if nothing above said otherwise
    return true;
};

FirefoxAddonMessageService.prototype.canDisplayMessageNow = function(message)
{
    this._log("evaluating whether to display message " + message.id);
    var sharedResult = this.canDisplayNowShared(message);    
    if (!sharedResult)
        return false;        
        
    // We've now shown this message too many times
    if (message.displayCount >= message.maxDisplayTimes)
        return false;
        
    // If it's too soon to display this message again
    if (new Date(message.lastDisplayedTime).getTime() > (new Date()).getTime() - message.minTimeBetweenDisplay)
        return false;
    
    // It's OK to display it if nothing above said otherwise
    return true;
};

FirefoxAddonMessageService.prototype.getTimeSinceStartup = function()
{
    var tss = (new Date()).getTime() - this.startUpTime;
    this._log(tss + "ms since startup");
    return tss;
};

// Considered using FF4+ Add-on code module but decided time since install of
// this code will do just fine provided it's based on the name of the
// currently supplied config file
FirefoxAddonMessageService.prototype.getTimeSinceInstall = function()
{
    var installTime = 0;
    try {
        var installTimeString = this.prefBranch.getCharPref("installTime." + this.configuration.id);
        installTime = new Date(installTimeString).getTime();
    } catch (ex) {  }
    if (installTime <= 0) // something went wrong so assume this code has just been installed
        installTime = (new Date()).getTime();
    
    this._log("install time: " + installTime + "ms since unix epoch");
    
    var timeSinceInstall = (new Date()).getTime() - installTime;
    this._log("time since install: " + timeSinceInstall + "ms");
    
    return timeSinceInstall;
};

//TODO:2: some bits of this may be similar enough with the group equivelent to consider combining them
FirefoxAddonMessageService.prototype.displayNextMessage = function(messageGroup)
{
    this._log("trying to display a message from group: " + messageGroup.id);
    // We know we are allowed to serve messages from this group by
    // now but we don't know if there are any valid messages within the group to send

    var messagesToDisplay = [];
    
    for (var i=0; i < messageGroup.messages.length; i++)
    {
        var message = messageGroup.messages[i];
        
        // Skip if this message should not be displayed at this time
        if (!this.canDisplayMessageNow(message))
            continue;
        
        messagesToDisplay.push(message);
    }
    
        // Make sure that high priority messages are considered first (but not exclusively)
        messagesToDisplay.sort(function (a,b)
        {
            var priorityDiff = b.priority - a.priority; // +ve = b is more important
            
            // If priorities are different, we don't need to investigate further
            if (priorityDiff != 0)
                return priorityDiff;
                
            return a.displayCount - b.displayCount; // +ve = b has been displayed less often
        }
    );
    
    // Try every message until we have found one to display (if one fails to validate we can try others)
    for (var j=0; j < messagesToDisplay.length; j++) {
        var result = this.showMessageHandler(messagesToDisplay[j],messageGroup.id);
        if (result) {
            this._log("message true");
            messageGroup.lastMessageDisplayedTime = new Date().toUTCString();
            this.setConfiguration(this.configuration);
            return true;
        }
    }
        
        
    return false;
};

FirefoxAddonMessageService.prototype.showMessageHandler = function(message, groupId)
{
    this._log("preparing to display a message");
    var lTitle = this.locale.internationaliseString(message.title);
    var lBody = this.locale.internationaliseString(message.body);
    var lMoreInfoLink = this.locale.internationaliseString(message.moreInfoLink);

    var result = this.showMessage(lTitle, lBody, lMoreInfoLink,
                message.displayPriorityName, message.displayPersistence, message.actionButtonName, message, groupId);
    this._log("message ended: " + message.displayCount);
    if (result)
    {
        message.lastDisplayedTime = new Date().toUTCString();
        message.displayCount++;
        this._log("message count: " + message.displayCount);
        //handled by next function up the stack: this.setConfiguration(this.configuration);
    }
    return result;
};

FirefoxAddonMessageService.prototype.showMessage = function (title, body, moreInfoLink, priorityName, persistence, actionButtonName, completeMessage, groupId)
{
    this.showMessageNotification("FAMS", title + ": " + body, moreInfoLink, priorityName, persistence, actionButtonName, completeMessage, groupId);
    return true;
};

FirefoxAddonMessageService.prototype.verifySignature = function (message, sig)
{
//TODO:2: actually verify the sig
return true;
};

FirefoxAddonMessageService.prototype.findMessageGroup = function (id) {
	var n = this.configuration.messageGroups.length;
	for (var i=0; i<n; i++) {
		if (this.configuration.messageGroups[i].id == id) {
			return this.configuration.messageGroups[i];
		}
	}
	return null;
};

FirefoxAddonMessageService.prototype.findMessage = function (id, groupId) {
    var mg = this.findMessageGroup(groupId);
    var n = mg.messages.length;
    for (var i = 0; i < n; i++) {
        if (mg.messages[i].id == id) {
            return mg.messages[i];
        }
    }
    return null;
};

FirefoxAddonMessageService.prototype.findMessageGroupIndex = function (id) {
    var n = this.configuration.messageGroups.length;
    for (var i = 0; i < n; i++) {
        if (this.configuration.messageGroups[i].id == id) {
            return i;
        }
    }
    return -1;
};

FirefoxAddonMessageService.prototype.findMessageIndex = function (id, groupIndex) {
    var mg = this.configuration.messageGroups[groupIndex];
    var n = mg.messages.length;
    for (var i = 0; i < n; i++) {
        if (mg.messages[i].id == id) {
            return i;
        }
    }
    return -1;
};



FirefoxAddonMessageService.prototype.getLocalisedString = function (key, formatArgs)
{
    var keyRequest = this.configuration.id + "-FAMS-" + key;
    this._log("requesting key: " + keyRequest);
    if (formatArgs)
    {
        formatArgs = Array.prototype.slice.call(arguments, 1);  
        return this.locale.internationaliseString(this.locale.FormatStringFromName(keyRequest,formatArgs,formatArgs.length));
    } else
    {
        return this.locale.internationaliseString(this.locale.GetStringFromName(keyRequest));
    }
};

FirefoxAddonMessageService.prototype.openActionLink = function (link)
{
    //TODO:2: something like KF._openAndReuseOneTabPerURL?
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                               .getService(Ci.nsIWindowMediator);
    var newWindow = wm.getMostRecentWindow("navigator:browser") ||
        wm.getMostRecentWindow("mail:3pane");
    var b = newWindow.getBrowser();
    var newTab = b.loadOneTab( link, null, null, null, false, null );
};

FirefoxAddonMessageService.prototype.showMessageNotification = function (name, aText, moreInfoLink, priorityName, persistence, actionName, completeMessage, groupId) {
    var notifyBox = this.notificationService();
    if (!notifyBox)
    {
        fams._log("Notification service not found");
        return false;
    }
    
    var actionButtonText =
              this.getLocalisedString("NotifyBar-A-" + actionName + "-Button.label");
    var actionButtonAccessKey =
              this.getLocalisedString("NotifyBar-A-" + actionName + "-Button.key");
    var optionsButtonText =
              this.getLocalisedString("NotifyBar-Options-Button.label");
    var optionsButtonAccessKey =
              this.getLocalisedString("NotifyBar-Options-Button.key");
    var banMessageButtonText =
              this.getLocalisedString("NotifyBar-DoNotShowAgain-Button.label");
    var banMessageButtonAccessKey =
              this.getLocalisedString("NotifyBar-DoNotShowAgain-Button.key");
    var fams = this;

    var buttons = [
            {
                label: actionButtonText,
                accessKey: actionButtonAccessKey,
                popup: null,
                callback: function (aNotificationBar, aButton) {
                    fams._log("loading action link: " + moreInfoLink);
                    fams.openActionLink(moreInfoLink);
                    fams._log("preventing this message from showing again");
                    // We have to find the same instance of the message that is associated with the main configuration of this FAMS instance
                    var message = fams.findMessage(completeMessage.id, groupId);
                    message.displayCount = message.maxDisplayTimes;
                    fams.setConfiguration(fams.configuration);
                }
            },
            {
                label: banMessageButtonText,
                accessKey: banMessageButtonAccessKey,
                popup: null,
                callback: function (aNotificationBar, aButton) {
                    fams._log("preventing this message from showing again");
                    // We have to find the same instance of the message that is associated with the main configuration of this FAMS instance
                    var message = fams.findMessage(completeMessage.id, groupId);
                    message.displayCount = message.maxDisplayTimes;
                    fams.setConfiguration(fams.configuration);
                }
            },
            {
                label: optionsButtonText,
                accessKey: optionsButtonAccessKey,
                popup: null,
                callback: function (aNotificationBar, aButton) {
                    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Ci.nsIWindowMediator);
                    var win = wm.getMostRecentWindow("navigator:browser") ||
                        wm.getMostRecentWindow("mail:3pane");
                    win.openDialog(
                       "chrome://keefox/content/famsOptions.xul?famsConfigId=KeeFox", //TODO:2: KeeFox specific
                       "",
                       "centerscreen,dialog=no,chrome,resizable,dependent,modal"
                      );
                }
            }
        ];

    var priority;

    if (priorityName == "high")
        priority = notifyBox.PRIORITY_WARNING_HIGH;
    else if (priorityName == "low")
        priority = notifyBox.PRIORITY_INFO_LOW;
    else
        priority = notifyBox.PRIORITY_INFO_MEDIUM;

    let notification = {
        name: name,
        render: function (container) {

            // We will append the rendered view of our own notification information to the
            // standard notification container that we have been supplied
            var doc = container.ownerDocument;
            container = doc.ownerGlobal.keefox_win.notificationManager
                .renderStandardMessage(container, aText);
            
            // We might customise other aspects of the notifications but when we want
            // to display buttons we can treat them all the same
            container = doc.ownerGlobal.keefox_win.notificationManager
                .renderButtons(buttons, doc, notifyBox, name, container);

            return container;
        },
        thisTabOnly: false,
        priority: priority
    };
    notifyBox.add(notification);
};

/*
* getNotifyBox
*
* Returns the notification box to this prompter, or null if there isn't
* a notification box available.
*/
FirefoxAddonMessageService.prototype.getNotifyBox = function ()
{
    try
    {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                    .getService(Ci.nsIWindowMediator);    
        var win = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
        return win.gBrowser.getNotificationBox(win.gBrowser.selectedBrowser);

    } catch (e) {
        // If any errors happen, just assume no notification box.
        this._log("No notification box available: " + e)
    }

    return null;
};
    
    


/* Configuration options and methods */

FirefoxAddonMessageService.prototype.setConfiguration = function (configuration)
{
    this._log(JSON.stringify(configuration));
    if (this.configId != configuration.id)
        throw new Exception("Trying to save a configuration with a different ID from the currently initialised config. Failed.");

    this.configuration = configuration;
    var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
    str.data = JSON.stringify(configuration);
    this.prefBranch.setComplexValue("config.utf8." + configuration.id, Ci.nsISupportsString, str);
};

// Use the current configuration stored in preferences unless it has not yet been defined
// or the version stored within preferences is older than the default configuration
FirefoxAddonMessageService.prototype.getConfiguration = function ()
{
    try
    {
        // Ensure config is stored somewhere that will understand UTF8
        var prefType = this.prefBranch.getPrefType("config." + this.configId);
        if (prefType == 32)
        {
            var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
            str.data = this.prefBranch.getCharPref("config." + this.configId);
            this.prefBranch.setComplexValue("config.utf8." + this.configId, Ci.nsISupportsString, str);
            this.prefBranch.clearUserPref("config." + this.configId);
        }

        var prefData = this.prefBranch.getComplexValue("config.utf8." + this.configId, Ci.nsISupportsString).data;
        var conf = JSON.parse(prefData);
        if (conf.version < this.defaultConfiguration.version)
        {
            var newConf = JSON.parse(JSON.stringify(this.defaultConfiguration)); //TODO:2: faster clone? https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm ?
            newConf.knownMessageGroups = conf.knownMessageGroups;

            for (var i=0; i < newConf.messageGroups.length; i++)
            {
                newConf.timeBetweenMessages = conf.timeBetweenMessages;
                newConf.lastMessageDisplayedTime = conf.lastMessageDisplayedTime;
                for (let msgIndex in newConf.messageGroups[i].messages)
                {
                    let msgId = newConf.messageGroups[i].messages[msgIndex].id;
                    for (let oldIndex in conf.messageGroups[i].messages)
                    {
                        if (conf.messageGroups[i].messages[oldIndex].id == msgId)
                        {
                            newConf.messageGroups[i].messages[msgIndex].displayCount = conf.messageGroups[i].messages[oldIndex].displayCount;
                            newConf.messageGroups[i].messages[msgIndex].lastDisplayedTime = conf.messageGroups[i].messages[oldIndex].lastDisplayedTime;
                            break;
                        }
                    }
                }
            }
            conf = newConf;
            this._log("Setting updated configuration");
            this.setConfiguration(conf);
        }
        return conf;
    } catch (ex) {
        this._log(ex);
        var conf = JSON.parse(JSON.stringify(this.defaultConfiguration)); //TODO:2: faster clone? https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm ?
        this.setConfiguration(conf);
        return conf;
    }
};

FirefoxAddonMessageService.prototype.initConfig = function (id, config)
{
    this.configId = id;
    
    var validConfigErrorMsg = this.validateConfig(config);
        
    if (validConfigErrorMsg)
    {
        this._log("config invalid for this reason: " + validConfigErrorMsg);
        return false;
    }    
    this.defaultConfiguration = config;
    return true;
};


FirefoxAddonMessageService.prototype.validateConfig = function(config)
{
    try
    {
        if (!config.name)
            return "No name";
        if (!config.id)
            return "No id";
        if (!config.description)
            return "No description";
        if (!config.timeBetweenMessages)
            return "No timeBetweenMessages";
        if (!config.timeBetweenDownloadingMessages)
            return "No timeBetweenDownloadingMessages";
        if (!config.defaultLang)
            return "No defaultLang";
        if (!config.knownMessageGroups)
            return "No knownMessageGroups";
        if (!config.messageGroups)
            return "No messageGroups";
    } catch (ex)
    {
        return ex + "";
    }
    return ""; // All OK
};

FirefoxAddonMessageService.prototype.defaultConfiguration = FAMSDefaultConfig;

//var famsInst = new FirefoxAddonMessageService;

//TODO:2: Message config and seperate strings.json will need to be downloaded. could combine both into one JSON object and sign that.
