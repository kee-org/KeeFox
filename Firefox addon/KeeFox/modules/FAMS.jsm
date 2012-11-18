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
"use non-strict";

let Ci = Components.interfaces;
let Cu = Components.utils;
let Cc = Components.classes;

var EXPORTED_SYMBOLS = ["FirefoxAddonMessageService","keeFoxGetFamsInst"]; //TODO2: KeeFox specific (to meet Mozilla add-on review guidelines)
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://kfmod/locales.js");

_famsInst = null;
function keeFoxGetFamsInst(id, config, log) {
    if (!_famsInst) {
        _famsInst = new FirefoxAddonMessageService();
        _famsInst.initConfig(id, config);
        _famsInst.init(log);
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
    this.locale = new KFandFAMSLocalisation(["chrome://keefox/locale/keefox.properties"],[this.strings]); //TODO2: KeeFox specific

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
            var fams = window.keefox_win.FAMS; //TODO2: KeeFox specific
            fams.runMessageProcesses();
        }
    },

    downloadNewMessagesHandler: {
        notify: function (timer) {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Ci.nsIWindowMediator);
            var window = wm.getMostRecentWindow("navigator:browser") ||
                wm.getMostRecentWindow("mail:3pane");
            var fams = window.keefox_win.FAMS; //TODO2: KeeFox specific
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
            installTimeString = this.prefBranch.getCharPref("installTime." + this.configuration.id);
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

//TODO2: What about people that always close Firefox within an hour? Maybe have a maximum wait measured in days that forces a process run within 30 seconds of app start?
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
//TODO2: Actually load the data from the remote location (e.g. JSON?)
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
    if (item.minTimeAfterStartup > this.getTimeSinceStartup())
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

//TODO2: some bits of this may be similar enough with the group equivelent to consider combining them
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
//TODO2: actually verify the sig
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
    //TODO2: something like KF._openAndReuseOneTabPerURL?
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                               .getService(Ci.nsIWindowMediator);
    var newWindow = wm.getMostRecentWindow("navigator:browser") ||
        wm.getMostRecentWindow("mail:3pane");
    var b = newWindow.getBrowser();
    var newTab = b.loadOneTab( link, null, null, null, false, null );
};

FirefoxAddonMessageService.prototype.showMessageNotification = function (aName, aText, moreInfoLink, priorityName, persistence, actionName, completeMessage, groupId) {
    aNotifyBox = this.getNotifyBox();
    if (!aNotifyBox)
        return false;

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
                       "chrome://keefox/content/famsOptions.xul?famsConfigId=KeeFox", //TODO2: KeeFox specific
                       "",
                       "centerscreen,dialog=no,chrome,resizable,dependent,modal"
                      );
                }
            }
        ];

    var oldBar = aNotifyBox.getNotificationWithValue(aName);
    var priority;

    if (priorityName == "high")
        priority = aNotifyBox.PRIORITY_WARNING_HIGH;
    else if (priorityName == "low")
        priority = aNotifyBox.PRIORITY_INFO_LOW;
    else
        priority = aNotifyBox.PRIORITY_INFO_MEDIUM;


    this._log("Adding new " + aName + " notification bar");
    var newBar = aNotifyBox.appendNotification(
                                aText, aName,
                                "chrome://keefox/skin/KeeFox16.png", //TODO2: KeeFox specific
                                priority, buttons);

    if (!persistence)
        newBar.persistence = persistence;

    if (oldBar) {
        this._log("(...and removing old " + aName + " notification bar)");
        aNotifyBox.removeNotification(oldBar);
    }
    return newBar;
};

/*
* _getNotifyBox
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
            var newConf = JSON.parse(JSON.stringify(this.defaultConfiguration)); //TODO: faster clone?
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
        var conf = JSON.parse(JSON.stringify(this.defaultConfiguration)); //TODO: faster clone?
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
        //TODO2: ... etc. etc.
    } catch (ex)
    {
        return ex + "";
    }
    return ""; // All OK
};


//var famsInst = new FirefoxAddonMessageService;

//TODO2: Message config and seperate strings.json will need to be downloaded. could combine both into one JSON object and sign that.
// The full configuration for this instance of FAMS.
//
// You should overwrite this default config with the default config for
// your application by calling configure before init. E.g.:
// var f = new FirefoxAddonMessageService();
// if (f.configure({ /* your config */ })) {
//      f.init(/* optional logger */);
// }
//
// Most variable state is stored within this configuration structure
// [U] = User can change this variable
// [A] = This variable can be changed automatically in some circumstances
// Other variables should remain the same as you define them here but note that this can't be guaranteed
//
// Dates must be strings entered in a format that the Date constructor can parse for Firefox 3.6+
//
// Strings should contain %-localisation-placeholders-% if possible. Define the strings themselves in FAMS-strings.js

FirefoxAddonMessageService.prototype.defaultConfiguration = {

    // The uniqueID of the add-on or application using this messaging service (alphanum only)
    id: "KeeFox",

    // The name of the add-on or application using this messaging service
    name: "%-name-%",

    // The description of the add-on or application using this messaging service
    description: "%-description-%",

    // Version number of this configuration. If you add new messages to existing groups, increment this value
    // In future, more complex migration from older versions may
    // be possible (e.g. to enable addition of new messageGroups, modified descriptions, etc.)
    version: 2,

    //TODO2: This message service will not function before this time
    startTime: "8 Jul, 2005 23:34:54 UTC",

    //TODO2: This message service will cease functioning at this time
    endTime: "8 Jul, 2111 23:34:54 UTC",

    // A minimum amount of time to wait after application startup
    // before any message can be displayed
    minTimeAfterStartup: 45000, // 45 seconds

    // Time (ms) between considering whether we should display a message from any group
    timeBetweenMessages: 600000, // 10 minutes

    // Time (ms) between contacting the remote server to find new messages
    //NB: Total time between new message being posted on server and
    // appearing to user could be up to timeBetweenDownloadingMessages+timeBetweenMessages [U]
    timeBetweenDownloadingMessages: 21600000, // 6 hours

    // Minimum time user is allowed to seelct in the UI for the
    // timeBetweenDownloadingMessages variable
    minTimeBetweenDownloadingMessages: 3600000, // 1 hour

    // Maximum time user is allowed to seelct in the UI for the
    // timeBetweenDownloadingMessages variable
    maxTimeBetweenDownloadingMessages: 604800000, // 168 hours (1 week)

    //TODO2:  Where to connect to in order to find out if there are any new messages that the user might need to see
    urlForDownloadingMessages: "",

    // Every message title and body must be available in the default language
    defaultLang: "en",

    // list of all messageGroups defined below. Remove group IDs from this list to temporarilly disable particular groups
    // If no priorities are defined in individual groups (or they are of equal importance) the 
    // order defined in this list will be taken as the order of importance
    // but end users can inadvertantly change the order of this list [U]
    knownMessageGroups: ["tips", "messages", "security"],

    // All preset messages, grouped by category for ease of end-user configuration
    messageGroups: [
        {
            // The unique ID for this message group.
            id: "tips",

            // The name of the group as displayed to the end-user
            name: "%-tips-name-%",

            // What this group is used for (helps end user decide if they
            // want to disable it or not)
            description: "%-tips-description-%",

            // The priority of messages within this group compared to those in other groups (higher = more important)
            priority: 1,

            // The minimum time (ms) after first install that must have elapsed before displaying messages in this group to the end-user
            minTimeAfterInstall: 36000000, // 10 hours

            // A minimum amount of time to wait after application startup
            // before the message group can have its messages displayed
            // Set to any number higher than configuration.minTimeAfterStartup
            // to delay messages from just this group
            // note that with high values, users that frequently restart their
            // browser may never see the messages (this situation may be
            // improved in a future version)
            minTimeAfterStartup: 600000, // 10 minutes

            // Time (ms) between considering whether we should display a message from this group [U]
            timeBetweenMessages: 259200000, // 72 hours

            // Maximum time (ms) between considering whether we should
            // display a message from this group (for end user UI)
            maxTimeBetweenMessages: 2419200000, // 28 days

            // Minimum time (ms) between considering whether we should
            // display a message from this group (for end user UI)
            minTimeBetweenMessages: 86400000, // 1 day

            // The earliest time that this message group will be displayed to the user
            earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

            // The latest time that this message group will be displayed to the user
            latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

            // The time that a message from this group was last displayed [A]
            lastMessageDisplayedTime: "8 Jul, 2005 23:34:54 UTC",

            // Whether the user is permitted to modify some of these configuration
            // options (note, nothing prevents a user from manually editing the
            // stored configuration in their profile preferences so do not rely
            // on any of these configuration options being immutable)
            userEditable: true,

            // The full set of preset messages within this group
            messages: [
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000a",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000a-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000a-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000b",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000b-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000b-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000c",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000c-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000c-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000d",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000d-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000d-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000e",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000e-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000e-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000f",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000f-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000f-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000g",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000g-body%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000g-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000h",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000h-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000h-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000i",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000i-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000i-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000j",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000j-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000j-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000k",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000k-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000k-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000l",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000l-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000l-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000m",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000m-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000m-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000n",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000n-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000n-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000o",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000o-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000o-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000p",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000p-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                mmoreInfoLink: "%-tips201201040000p-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201211040000a",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201211040000a-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                mmoreInfoLink: "%-tips201211040000a-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 2,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            }]

        },
        {
            // The unique ID for this message group.
            id: "security",

            // The name of the group as displayed to the end-user
            name: "%-security-name-%",

            // What this group is used for (helps end user decide if they
            // want to disable it or not)
            description: "%-security-description-%",

            // The priority of messages within this group compared to those in other groups (higher = more important)
            priority: 3,

            // The minimum time (ms) after first install that must have elapsed before displaying messages in this group to the end-user
            minTimeAfterInstall: 30000, // 30 seconds

            // A minimum amount of time to wait after application startup
            // before the message group can have its messages displayed
            // Set to any number higher than configuration.minTimeAfterStartup
            // to delay messages from just this group
            // note that with high values, users that frequently restart their
            // browser may never see the messages (this situation may be
            // improved in a future version)
            minTimeAfterStartup: 30000, // 30 seconds

            // Time (ms) between considering whether we should display a message from this group [U]
            timeBetweenMessages: 3600000, // 1 hour

            // Maximum time (ms) between considering whether we should
            // display a message from this group (for end user UI)
            maxTimeBetweenMessages: 14400000, // 4 hours

            // Minimum time (ms) between considering whether we should
            // display a message from this group (for end user UI)
            minTimeBetweenMessages: 3600000, // 1 hour

            // The earliest time that this message group will be displayed to the user
            earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

            // The latest time that this message group will be displayed to the user
            latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

            // The time that a message from this group was last displayed [A]
            lastMessageDisplayedTime: "8 Jul, 2005 23:34:54 UTC",

            // Whether the user is permitted to modify some of these configuration
            // options (note, nothing prevents a user from manually editing the
            // stored configuration in their profile preferences so do not rely
            // on any of these configuration options being immutable)
            userEditable: false,

            // The full set of preset messages within this group
            messages: [
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "security201201040000a",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-security-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-security201201040000a-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-security201201040000a-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "VisitSite",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jan, 2015 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 10,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "high",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 20,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 36000000, // 10 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            }]
        },
        {
            // The unique ID for this message group.
            id: "messages",

            // The name of the group as displayed to the end-user
            name: "%-messages-name-%",

            // What this group is used for (helps end user decide if they
            // want to disable it or not)
            description: "%-messages-description-%",

            // The priority of messages within this group compared to those in other groups (higher = more important)
            priority: 2,

            // The minimum time (ms) after first install that must have elapsed before displaying messages in this group to the end-user
            minTimeAfterInstall: 30000, // 30 seconds

            // A minimum amount of time to wait after application startup
            // before the message group can have its messages displayed
            // Set to any number higher than configuration.minTimeAfterStartup
            // to delay messages from just this group
            // note that with high values, users that frequently restart their
            // browser may never see the messages (this situation may be
            // improved in a future version)
            minTimeAfterStartup: 30000, // 30 seconds

            // Time (ms) between considering whether we should display a message from this group [U]
            timeBetweenMessages: 86400000, // 1 day

            // Maximum time (ms) between considering whether we should
            // display a message from this group (for end user UI)
            maxTimeBetweenMessages: 2419200000, // 28 days

            // Minimum time (ms) between considering whether we should
            // display a message from this group (for end user UI)
            minTimeBetweenMessages: 86400000, // 1 day

            // The earliest time that this message group will be displayed to the user
            earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

            // The latest time that this message group will be displayed to the user
            latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

            // The time that a message from this group was last displayed [A]
            lastMessageDisplayedTime: "8 Jul, 2005 23:34:54 UTC",

            // Whether the user is permitted to modify some of these configuration
            // options (note, nothing prevents a user from manually editing the
            // stored configuration in their profile preferences so do not rely
            // on any of these configuration options being immutable)
            userEditable: true,

            // The full set of preset messages within this group
            messages: [
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "messages201201040000a",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-messages-help-keefox-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-messages201201040000a-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-messages201201040000a-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "Rate",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 5,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 1209600000, // 2 weeks

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 2419200000, // 4 weeks

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            }]
        }]

};FirefoxAddonMessageService.prototype.strings = {
    "en": {
        "name": "KeeFox",
        "description": "KeeFox adds free, secure and easy to use password management features to Firefox which save you time and keep your private data more secure.",
        "tips-name": "Tips",
        "tips-description": "Hints and tips that will be especially useful for people new to KeeFox, KeePass or password management software",
        "tips-default-title": "KeeFox tip",
        "tips201201040000a-body": 'You can "Customise" your Firefox toolbars (including KeeFox) to re-arrange buttons and save screen space.',
        "tips201201040000a-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/CustomiseToolbars",
        "tips201201040000b-body": "Middle-click or Ctrl-click on an entry in the logins list to open a new tab, load a web page and auto submit a login with just one click.",
        "tips201201040000b-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/LoginMenuMiddleClick",
        "tips201201040000c-body": "Be cautious of automatically submitting login forms - it is convenient but slightly more risky than manually clicking on the login button.",
        "tips201201040000c-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/AutoSubmitWarning",
        "tips201201040000d-body": 'The "logged out" and "logged in" statements on the KeeFox toolbar button refer to the state of your KeePass database (whether you have logged in with your composite master password yet).',
        "tips201201040000d-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/MeaningOfLoggedOut",
        "tips201201040000e-body": "You can force certain entries to have a higher priority than others.",
        "tips201201040000e-link": "http://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/Priority",
        "tips201201040000f-body": 'Get quick access to notes and other entry data by right clicking on a login entry and selecting "Edit entry".',
        "tips201201040000f-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/LoginEditEntry",
        "tips201201040000g-body": "You can have more than one KeePass database open at the same time.",
        "tips201201040000g-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/UseMultipleDatabases",
        "tips201201040000h-body": 'Some websites create their login form after the page has loaded, try the "detect forms" feature on the main button to search for matching logins.',
        "tips201201040000h-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/DetectForms",
        "tips201201040000i-body": "Generate secure passwords from the main KeeFox toolbar button - it will use the same settings that you most recently used on the KeePass password generator dialog.",
        "tips201201040000i-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/PasswordGenerator",
        "tips201201040000j-body": "Your KeePass entries can be used in other web browsers and applications.",
        "tips201201040000j-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/KeePass",
        "tips201201040000k-body": "Even well known websites have their data stolen occasionally; protect yourself by using different passwords for every website you visit.",
        "tips201201040000k-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/UseUniquePasswords",
        "tips201201040000l-body": "Left-click on an entry in the logins list to load a web page in the current tab and auto submit a login with just one click.",
        "tips201201040000l-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/LoginMenuLeftClick",
        "tips201201040000m-body": "Some websites are designed so that they will not work with automated form fillers like KeeFox. Read more about how best to work with these sites.",
        "tips201201040000m-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/TroubleshootAwkwardSites",
        "tips201201040000n-body": 'Long passwords are usually more secure than short but complicated ones ("aaaaaaaaaaaaaaaaaaa" is an exception to this rule!)',
        "tips201201040000n-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/LongPasswordsAreGood",
        "tips201201040000o-body": "Open source security software like KeePass and KeeFox is more secure than closed source alternatives.",
        "tips201201040000o-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/OpenSourceSafer",
        "tips201201040000p-body": "If you have old KeePass entries without website-specific icons (favicons) try the KeePass Favicon downloader plugin.",
        "tips201201040000p-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/FaviconDownloader",
        "tips201211040000a-body": "NEW: You can configure individual websites to work better with KeeFox.",
        "tips201211040000a-link": "https://sourceforge.net/apps/trac/keefox/wiki/Manual/Tips/SiteSpecific",
        "security-name": "Security notices",
        "security-description": "Important security notices that users should not ignore if they wish to remain protected",
        "security-default-title": "KeeFox security warning",
        "security201201040000a-body": "This version of KeeFox is very old. You should install a newer version if at all possible.",
        "security201201040000a-link": "http://keefox.org/download",
        "messages-name": "Important messages",
        "messages-description": "Important but rare notices that may be useful to KeeFox users",
        "messages-help-keefox": "Help KeeFox",
        "messages201201040000a-body": "You've been using KeeFox for a while now so please help others by adding a positive review to the Mozilla addons website.",
        "messages201201040000a-link": "https://addons.mozilla.org/en-US/firefox/addon/keefox/reviews/add"
        
    }/*,
    "en-GB": {
        "key": "translationg",
        "key2": "translation2g"
    },
    "en-US": {
        "key": "translationu",
        "key2": "translation2u"
    }*/
}