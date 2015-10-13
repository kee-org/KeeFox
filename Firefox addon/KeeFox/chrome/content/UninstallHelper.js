/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  The UninstallHelper object is used to present an interface to the user which will offer them
  advice on how to get KeeFox working and a suggested remedial action, based on current setup
   state and their feedback regarding the reason they are disabling/uninstalling

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

Cu.import("resource://gre/modules/Timer.jsm");

keefox_win.UninstallHelper = function()
{
    this.doc = window.document;
};

keefox_win.UninstallHelper.prototype = 
{
    localise: function(label) {
        return keefox_org.locale.$STR("troubleshooter." + label);
    },

    getReason: function(i) {
        let reason = this.doc.createElement('radio');
        reason.setAttribute("label", this.localise("reason" + i));
        reason.setAttribute("value", i);
        return reason;
    },

    createContainer: function (disabling, parentContainer, connectState, setupState, setupActive, tutorialProgress) {
        this.parentContainer = parentContainer;
        this.disabling = disabling;
        this.connectState = connectState;
        this.setupState = setupState;
        this.setupActive = setupActive;
        this.tutorialProgress = tutorialProgress;

        let container = this.doc.createElement("vbox");
        container.setAttribute("id","keefox-uninstall-helper-feedback-container");

        // 0 = N/A
        let varients = {
            feedbackInvitation: 0,
            reasonOrder: 0,
            successNotification: 0,
            whyLocation: 0,
            smallScreen: 0
        };

        let attachSuccessNotification = function(disabling) {
            let successNotification = this.doc.createElement('label');
            successNotification.textContent = disabling ? this.localise("successful-disable") : this.localise("successful-uninstall");
            container.appendChild(successNotification);
        };

        let attachFeedbackInvitaton = function(feedbackInvitation) {
            let feedbackNotification = this.doc.createElement('label');
            feedbackNotification.textContent = feedbackInvitation;
            container.appendChild(feedbackNotification);
        };

        let attachWhy = function() {
            let why = this.doc.createElement('label');
            why.textContent = this.localise("why-sorry");
            container.appendChild(why);
        };

        let avHeight = this.doc.defaultView.screen.availHeight;
        let anchorPos = this.doc.getElementById("keefox-button").boxObject.screenY;
        let availableHeightForPanel = Math.abs(anchorPos - (avHeight/2))+(avHeight/2);
        
        if (availableHeightForPanel < 650)
            varients.smallScreen = 1;        

        if (Math.random() > 0.5) {
            if (!varients.smallScreen)
                attachSuccessNotification.call(this,disabling);
            varients.successNotification = 1;
        } else {
            varients.successNotification = 2;
        }

        let rand = Math.random();
        if (rand >= 0 && rand < 0.1)
            varients.whyLocation = 1;
        else if (rand >= 0.1 && rand < 0.3)
            varients.whyLocation = 2;
        else if (rand >= 0.3 && rand < 0.4)
            varients.whyLocation = 3;
        else
            varients.whyLocation = 4; // Don't show

        let feedbackInvitation;
        rand = Math.random();
        if (connectState == "neverConnected") {
            if(rand > 0.8) {
                feedbackInvitation = disabling ? this.localise("feedback-invitation-1-disable") : this.localise("feedback-invitation-1-uninstall");
                varients.feedbackInvitation = 1;
            } else {
                feedbackInvitation = this.localise("feedback-invitation-2");
                varients.feedbackInvitation = 2;
            }
        } else
        {
            feedbackInvitation = this.localise("feedback-invitation-2");
        }

        if (!varients.smallScreen && varients.whyLocation == 1)
            attachWhy.call(this);

        attachFeedbackInvitaton.call(this,feedbackInvitation);

        let reasonLabel = this.doc.createElement('label');
        reasonLabel.setAttribute("value",(disabling ? this.localise("disable-reason") : this.localise("uninstall-reason")) + ":");
        reasonLabel.setAttribute("control", "keefox-uninstall-helper-feedback-reason");
        container.appendChild(reasonLabel);

        let reasonCount = 9;
        rand = Math.floor(Math.random()*reasonCount);
        varients.reasonOrder = rand+1;
        let reasons = [];
        reasons[(0 + rand) % reasonCount] = this.getReason.call(this,1);
        reasons[(1 + rand) % reasonCount] = this.getReason.call(this,2);
        reasons[(2 + rand) % reasonCount] = this.getReason.call(this,3);
        reasons[(3 + rand) % reasonCount] = this.getReason.call(this,4);
        reasons[(4 + rand) % reasonCount] = this.getReason.call(this,5);
        reasons[(5 + rand) % reasonCount] = this.getReason.call(this,6);
        reasons[(6 + rand) % reasonCount] = this.getReason.call(this,7);
        reasons[(7 + rand) % reasonCount] = this.getReason.call(this,8);
        reasons[(8 + rand) % reasonCount] = this.getReason.call(this,9);

        let reasonsRadios = this.doc.createElement('radiogroup');
        reasonsRadios.setAttribute("id","keefox-uninstall-helper-feedback-reason");

        //if (varients.smallScreen)
        //{
            let grid = this.doc.createElement('grid');
            let columns = this.doc.createElement('columns');
            let column1 = this.doc.createElement('column');
            let column2 = this.doc.createElement('column');
            let rows = this.doc.createElement('rows');
            columns.appendChild(column1);
            columns.appendChild(column2);
            grid.appendChild(columns);


            let row1 = this.doc.createElement('row');
            let row2 = this.doc.createElement('row');
            let row3 = this.doc.createElement('row');
            let row4 = this.doc.createElement('row');
            let row5 = this.doc.createElement('row');
            row1.appendChild(reasons[0]);
            row1.appendChild(reasons[1]);
            row2.appendChild(reasons[2]);
            row2.appendChild(reasons[3]);
            row3.appendChild(reasons[4]);
            row3.appendChild(reasons[5]);
            row4.appendChild(reasons[6]);
            row4.appendChild(reasons[7]);
            row5.appendChild(reasons[8]);
            //row5.appendChild(reasons[1]);
        
            rows.appendChild(row1);
            rows.appendChild(row2);
            rows.appendChild(row3);
            rows.appendChild(row4);
            rows.appendChild(row5);

            grid.appendChild(rows);

            reasonsRadios.appendChild(grid);
        //} else {
        
        //    for (let reason of reasons)
        //    {
        //        reasonsRadios.appendChild(reason);
        //    }
        //}
        
        reasonsRadios.selectedIndex = -1;
        container.appendChild(reasonsRadios);

        function pnCountNoteChars(evt) {
            //allow non character keys (delete, backspace and and etc.)
            if ((evt.charCode == 0) && (evt.keyCode != 13))
                return true;

            if (evt.target.value.length < 10000) {
                return true;
            } else {
                evt.preventDefault();
                evt.stopPropagation();
                return false;
            }
        }

        let extraLabel = this.doc.createElement('label');
        extraLabel.setAttribute("value",this.localise("extra-feedback") + ":");
        extraLabel.setAttribute("control", "keefox-uninstall-helper-feedback-extra");
        container.appendChild(extraLabel);

        let extra = this.doc.createElement('textbox');
        extra.setAttribute("id","keefox-uninstall-helper-feedback-extra");
        extra.setAttribute("multiline","true");
        extra.addEventListener("keypress", pnCountNoteChars, false);
        container.appendChild(extra);

        if (!varients.smallScreen && varients.whyLocation == 2)
            attachWhy.call(this);

        let button = this.doc.createElement('button');
        button.setAttribute("id","keefox-uninstall-helper-button");
        button.setAttribute("label",this.localise("submit-feedback"));
        button.addEventListener("command", this.submitFeedback.bind(this));

        container.appendChild(button);

        if (!varients.smallScreen && varients.whyLocation == 3)
            attachWhy.call(this);

        this.varients = varients;

        return container;
    },

    submitFeedback: function() {
        let reason = 0;
        let radioGroup = this.doc.getElementById("keefox-uninstall-helper-feedback-reason");
        if (radioGroup.selectedIndex !== null && radioGroup.selectedIndex !== -1)
            reason = parseInt(radioGroup.selectedItem.value);

        let extra = "";
        let extraText = this.doc.getElementById("keefox-uninstall-helper-feedback-extra");
        if (extraText.value.length > 0)
            extra = extraText.value.substr(0,15000);

        keefox_org.metricsManager.pushEvent("uninstall", "feedback", 
            { 
                "connectState": this.connectState, 
                "setupState": this.setupState, 
                "tutorialProgress": this.tutorialProgress, 
                "varients": this.varients,
                "reason": reason,
                "extra": extra,
                "disable": this.disabling
            }, true);

        let responseContainer = this.createResponseContainer(reason, this.connectState, this.setupState, this.tutorialProgress);
        responseContainer.classList.add("disabled");

        let feedbackContainer = this.doc.getElementById("keefox-uninstall-helper-feedback-container");

        // Create a loading spinner for 500ms to increase chance of network message
        // being sent in case user has an itchy restart trigger finger
        //TODO:1.6: Allow successful network delivery to cut the timer short
        let submitContainer = this.doc.createElement("vbox");
        submitContainer.setAttribute("id","keefox-uninstall-helper-submit-container");

        submitContainer.classList.add("enabled");
        feedbackContainer.classList.remove("enabled");
        feedbackContainer.classList.add("disabled");

        this.parentContainer.appendChild(submitContainer);
        this.parentContainer.appendChild(responseContainer);

        setTimeout(function(){
            let submit = this.doc.getElementById("keefox-uninstall-helper-submit-container");
            let response = this.doc.getElementById("keefox-uninstall-helper-response-container");
            submit.classList.add("disabled");
            submit.classList.remove("enabled");
            response.classList.add("enabled");
            response.classList.remove("disabled");
        }.bind(this),500);

    },

    createResponseContainer: function(reason, connectState, setupState, tutorialProgress)
    {
        let [message, message2, action] = this.getResponseStrings(reason, connectState, setupState, tutorialProgress, keefox_org.os);
        let container = this.doc.createElement("vbox");
        container.setAttribute("id","keefox-uninstall-helper-response-container");

        let messageContainer = this.doc.createElement("label");
        messageContainer.textContent = message;
        container.appendChild(messageContainer);

        if (message2)
        {
            let message2Container = this.doc.createElement("label");
            message2Container.textContent = message2;
            container.appendChild(message2Container);
        }

        let button = this.getResponseButton(action);
        container.appendChild(button);

        let thanks = this.doc.createElement("label");
        thanks.textContent = this.localise("thanks");
        container.appendChild(thanks);

        return container;
    },

    getResponseButton: function(action)
    {
        let button = this.doc.createElement('button');
        button.setAttribute("id","keefox-uninstall-helper-suggested-action-button");
        if (action == "forum")
        {
            button.setAttribute("label",this.localise("load-forum"));
            button.addEventListener("command", function () { 
                keefox_org.utils._openAndReuseOneTabPerURL('http://keefox.org/help/forum');
                keefox_win.notificationManager.remove("uninstall-helper"); });
        }
        else if (action == "tutorial")
        {
            button.setAttribute("label",this.localise("load-getting-started"));
            button.addEventListener("command", function () { 
                keefox_org.utils._openAndReuseOneTabPerURL('http://tutorial.keefox.org/part1?utm_source=firefoxAddon&amp;utm_medium=uninstallHelper');
                keefox_win.notificationManager.remove("uninstall-helper"); });
        }
        else if (action == "troubleshootConnection")
        {
            button.setAttribute("label",this.localise("load-troubleshooting-information"));
            button.addEventListener("command", function () { 
                keefox_org.utils._openAndReuseOneTabPerURL('https://github.com/luckyrat/KeeFox/wiki/en-%7C-Troubleshooting#keefox-toolbar-button-says-launch-keepass');
                keefox_win.notificationManager.remove("uninstall-helper"); });
        }
        else if (action == "troubleshootSites")
        {
            button.setAttribute("label",this.localise("load-troubleshooting-information"));
            button.addEventListener("command", function () { 
                keefox_org.utils._openAndReuseOneTabPerURL('https://github.com/luckyrat/KeeFox/wiki/en-%7C-Troubleshooting#troubleshooting-tips-when-a-particular-website-does-not-get-its-login-form-filled-in-automatically');
                keefox_win.notificationManager.remove("uninstall-helper"); });
        } else if (action == "setup")
        {
            button.setAttribute("label",keefox_org.locale.$STR("KeeFox_Install_Setup_KeeFox.label"));
            button.addEventListener("command", function () { 
                keefox_org.utils._openAndReuseOneTabPerURL(keefox_org.baseInstallURL);
                keefox_win.notificationManager.remove("uninstall-helper"); });
        } else if (action == "setupUpgrade")
        {
            // We don't differentiate upgrades from downgrades at the moment - probably won't be
            // useful very often but metrics data will allow us to review this decision in future
            button.setAttribute("label",keefox_org.locale.$STR("KeeFox_Install_Setup_KeeFox.label"));
            button.addEventListener("command", function () { 
                keefox_org.utils._openAndReuseOneTabPerURL(keefox_org.baseInstallURL+"?upgrade=1");
                keefox_win.notificationManager.remove("uninstall-helper"); });
        } else // if (action == "help") and fallback for any other actions
        {
            button.setAttribute("label",keefox_org.locale.$STR("KeeFox_Help-Centre-Button.tip"));
            button.addEventListener("command", function () { 
                keefox_org.utils._openAndReuseOneTabPerURL('http://keefox.org/help');
                keefox_win.notificationManager.remove("uninstall-helper"); });
        }

        return button;
    },

    getResponseStrings: function(reason, connectState, setupState, tutorialProgress, os)
    {
        let message, message2, action, mainResponse, customAction;

        let allOK = false;
        let tutorialIncomplete= false;
        let connectionBlocked = false;
        let kprpcMissingWindows = false;
        let kprpcMissingMono = false;
        let keepassMissing = false;
        let keepassMissingMono = false;
        let kprpcVersionMismatch = false;
        let kprpcVersionMismatchMono = false;
        let connectionError = false;

        if (setupState == "VERSION_CLIENT_TOO_HIGH" || setupState == "VERSION_CLIENT_TOO_LOW" && os == "WINNT")
            kprpcVersionMismatch = true;
        else if (setupState == "VERSION_CLIENT_TOO_HIGH" || setupState == "VERSION_CLIENT_TOO_LOW" && os != "WINNT")
            kprpcVersionMismatchMono = true;
        else if (setupState != "kprpc" && setupState != "keepass" && setupState != "none")
            connectionError = true;
        else if ((connectState == "connected" || connectState == "previouslyConnected") && tutorialProgress.isFinished)
            allOK = true;
        else if ((connectState == "connected" || connectState == "previouslyConnected") && !tutorialProgress.isFinished)
            tutorialIncomplete = true;
        else if (connectState == "neverConnected" && setupState == "kprpc")
            connectionBlocked = true;
        else if (connectState == "neverConnected" && setupState == "keepass" && os == "WINNT")
            kprpcMissingWindows = true;
        else if (connectState == "neverConnected" && setupState == "keepass" && os != "WINNT")
            kprpcMissingMono = true;
        else if (os == "WINNT")
            keepassMissing = true;
        else
            keepassMissingMono = true;

        switch (reason) {
            case 1:
                if (keepassMissing || keepassMissingMono)
                    mainResponse = this.localise("keepass-description");
                else
                    mainResponse = this.localise("you-were-close");

                if (allOK || connectionError)
                    customAction = "forum";
                break;
            case 2:
                mainResponse = this.localise("keefox-description");
                break;
            case 3:
                mainResponse = this.localise("sorry-to-hear-that") + " " + this.localise("website-failed");
                customAction = "troubleshootSites";
                break;
            case 4:
                mainResponse = this.localise("missing-feature");
                break;
            case 5:
                mainResponse = this.localise("sorry-to-hear-that") + " " + this.localise("not-trusted");
                if (allOK || connectionError)
                    customAction = "forum";
                break;
            case 6:
                mainResponse = this.localise("sorry-to-hear-that") + " " + this.localise("too-slow");
                if (allOK || connectionError)
                    customAction = "forum";
                break;
            case 7:
                mainResponse = this.localise("sorry-to-hear-that") + " " + this.localise("store-elsewhere");
                break;
            case 8:
                mainResponse = "";
                break;
            case 9:
                mainResponse = "";
                break;
            default:
                mainResponse = "";
                break;
        }

        if (allOK || connectionError)
        {
            // We don't currently offer any specific advice regarding error messages since the
            // user should have already seen useful advice when they first occurred but we can
            // monitor the data metrics in this area and start offering something extra in
            // future if it looks like it will be worthwhile.
            message = mainResponse;
            action = "help";
        }
        else if (tutorialIncomplete)
        {
            message = mainResponse + " " + this.localise("tutorial-incomplete");
            action = "tutorial";
        } else if (connectionBlocked)
        {
            message = mainResponse + " " + this.localise("other-security-problem");
            message2 = this.localise("visit-troubleshooting-guide-connection");
            action = "troubleshootConnection";
        } else if (kprpcMissingWindows)
        {
            message = mainResponse + " " + this.localise("setup-kprpc-missing") + " " + this.localise("setup-follow-instructions");
            action = "setup";
        }  else if (kprpcMissingMono)
        {
            message = mainResponse + " " + this.localise("setup-kprpc-missing-mono") + " " + this.localise("setup-follow-instructions");
            action = "setup";
        } else if (keepassMissing)
        {
            message = mainResponse + " " + this.localise("setup-keepass-missing");
            action = "setup";
        } else if (kprpcVersionMismatch)
        {
            message = mainResponse + " " + this.localise("setup-upgrade");
            action = "setupUpgrade";
        } else if (kprpcVersionMismatchMono)
        {
            message = mainResponse + " " + this.localise("setup-upgrade-mono");
            action = "setupUpgrade";
        } else
        {
            message = mainResponse + " " + this.localise("setup-keepass-missing-mono");
            action = "setup";
        }
        
        return [message, message2, customAction || action];
    }

};
