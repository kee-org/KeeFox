/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  The TutorialHelper object keeps a record of the current user's progress through
   the KeeFox tutorial. This can/will be used to:
  1) help guide new users through any difficulties they are having, including a
     last-chance bit of advice once they have disabled or uninstalled the add-on
  2) add vital context to uninstallation event tracking to understand what needs to be improved
  3) provide a higher quality tutorial experience by offering precise advice rather
     than a list of many possible problems

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

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cu = Components.utils;

var EXPORTED_SYMBOLS = ["tutorialHelper"];

Cu.import("resource://kfmod/KFExtension.js");

let tutorialProgress = function () {
    this._state = JSON.parse(KFExtension.prefs.getValue("tutorialProgress",
        '{"_started":false,"_part1error":false,"_part1":false,"_saved":false,"_part2":false,"_part3":false,"_part4":false}'));
};

tutorialProgress.prototype = {
    _state: null,
    set started(val) { this._state._started = val; this.save(); },
    get started() { return this._state._started; },
    set part1error(val) { this._state._part1error = val; this.save(); },
    get part1error() { return this._state._part1error; },
    set part1(val) { this._state._part1 = val; this.save(); },
    get part1() { return this._state._part1; },
    set saved(val) { this._state._saved = val; this.save(); },
    get saved() { return this._state._saved; },
    set part2(val) { this._state._part2 = val; this.save(); },
    get part2() { return this._state._part2; },
    set part3(val) { this._state._part3 = val; this.save(); },
    get part3() { return this._state._part3; },
    set part4(val) { this._state._part4 = val; this.save(); },
    get part4() { return this._state._part4; },

    save: function () {
        KFExtension.prefs.setValue("tutorialProgress", JSON.stringify(this._state));
    },

    toJSON: function () {
        return { started: this.started, part1error: this.part1error, part1: this.part1, 
            saved: this.saved, part2: this.part2, part3: this.part3, part4: this.part4 };
    },

    get isFinished() { return this._state._part3 || this._state._part4; }
};

let TutorialHelper = function()
{
    this.progress = new tutorialProgress();

    this.tutorialProgressStartedHandler = function (message) {
        message.target.ownerGlobal.keefox_org.tutorialHelper.progress.started = true;
        message.target.ownerGlobal.keefox_org.tutorialHelper.sendSetupStateToTutorial(message.target);
    };

    this.tutorialProgressPart1errorHandler = function (message) {
        message.target.ownerGlobal.keefox_org.tutorialHelper.progress.part1error = true;
        message.target.ownerGlobal.keefox_org.tutorialHelper.sendSetupStateToTutorial(message.target);
    };

    this.tutorialProgressPart1Handler = function (message) {
        message.target.ownerGlobal.keefox_org.tutorialHelper.progress.part1 = true;
        message.target.ownerGlobal.keefox_org.tutorialHelper.sendSetupStateToTutorial(message.target);
    };

    this.tutorialProgressSaved = function () {
        this.progress.saved = true;
    };

    this.tutorialProgressPart2Handler = function (message) {
        message.target.ownerGlobal.keefox_org.tutorialHelper.progress.part2 = true;
        message.target.ownerGlobal.keefox_org.tutorialHelper.sendSetupStateToTutorial(message.target);
    };

    this.tutorialProgressPart3Handler = function (message) {
        message.target.ownerGlobal.keefox_org.tutorialHelper.progress.part3 = true;
        message.target.ownerGlobal.keefox_org.tutorialHelper.sendSetupStateToTutorial(message.target);
    };

    this.tutorialProgressPart4Handler = function (message) {
        message.target.ownerGlobal.keefox_org.tutorialHelper.progress.part4 = true;
        message.target.ownerGlobal.keefox_org.tutorialHelper.sendSetupStateToTutorial(message.target);
    };

    this.sendSetupStateToTutorial = function (browser) {
        let [ connectState, setupState, setupActive, notUsed, dbState ] = browser.ownerGlobal.keefox_org.getAddonState();

        Components.utils.import("resource://gre/modules/AddonManager.jsm");
        AddonManager.getAddonByID("keefox@chris.tomlinson", function(addon) {
            browser.messageManager.sendAsyncMessage("keefox:sendStatusToTutorialPage", {
                "connectState": connectState, "setupState": setupState, "setupActive": setupActive,
                "version": addon.version,
                "dbState": dbState });
        });
    };
    
    this.mm = Cc["@mozilla.org/globalmessagemanager;1"].getService(Ci.nsIMessageListenerManager);
    this.mm.addMessageListener("keefox:tutorialProgressStarted", this.tutorialProgressStartedHandler);
    this.mm.addMessageListener("keefox:tutorialProgressPart1error", this.tutorialProgressPart1errorHandler);
    this.mm.addMessageListener("keefox:tutorialProgressPart1", this.tutorialProgressPart1Handler);
    this.mm.addMessageListener("keefox:tutorialProgressPart2", this.tutorialProgressPart2Handler);
    this.mm.addMessageListener("keefox:tutorialProgressPart3", this.tutorialProgressPart3Handler);
    this.mm.addMessageListener("keefox:tutorialProgressPart4", this.tutorialProgressPart4Handler);


};

var tutorialHelper = new TutorialHelper();
