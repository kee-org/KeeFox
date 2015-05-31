/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This contains code related to the management and display of KeeFox notifications.

  It runs in a window scope so does not have direct access to the DOM of any given site.

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



keefox_win.notificationManager = {

    // priorities (subset of old Firefox notification priorities to ease transition
    // and maybe support Thunderbird but the actual values are probably different)
    PRIORITY_WARNING_HIGH: 3,
    PRIORITY_INFO_LOW: 2,
    PRIORITY_INFO_MEDIUM: 1,

    // For tracking which notifications belong to which tab
    tabNotificationMap: new Map(),

    // All window notifications
    windowNotifications: [],

    // We don't support global notifications across multiple windows (never have) but should be able
    // to add a 3rd category here if needed in future.

    add: function (notification) {
        
        // We refresh all notifications in the same category after one is added because priorities
        // might mean the display order is not obvious. No doubt this could be made much more
        // efficient in future but for the handful of notifications expected we can safely take this shortcut
        if (notification.thisTabOnly)
        {
            let selectedTab = window.gBrowser.selectedTab;
            let notificationList = this.tabNotificationMap.get(selectedTab);
            if (!notificationList)
                notificationList = [];
            
            // delete any item with a matching notification.name
            notificationList = notificationList.filter(function(existingNotification)
            {
                return existingNotification.name!==notification.name
            });

            notificationList.push(notification);
            this.tabNotificationMap.set(selectedTab, notificationList);
            this.refreshTabView();
        } else
        {
            // delete any item with a matching notification.name
            this.windowNotifications = this.windowNotifications.filter(function(existingNotification)
            {
                return existingNotification.name!==notification.name
            });
            this.windowNotifications.push(notification);
            this.refreshWindowView();
        }
        if (notification.persist)
        {
            keefox_win.persistentPanel.showNotifications();
        } else
        {
            keefox_win.panel.displayPanel();
            keefox_win.panel.hideSubSections();
        }
    },
    remove: function (name) {
        // All notifications with the supplied name are removed from the current tab and window lists
        let selectedTab = window.gBrowser.selectedTab;
        let notificationList = this.tabNotificationMap.get(selectedTab);
        if (notificationList && notificationList.length > 0)
        {   
            notificationList = notificationList.filter(function(existingNotification)
            {
                let keep = existingNotification.name!==name;

                // if the notification we're removing was set to persist, try closing the
                // persistent panel now (sometimes this won't be necessary but it won't do any harm)
                if (!keep && existingNotification.persist)
                    keefox_win.persistentPanel.thePanel.hidePopup();
                return keep;
            });
            this.tabNotificationMap.set(selectedTab, notificationList);
            this.refreshTabView();
        }

        if (this.windowNotifications && this.windowNotifications.length > 0)
        {
            this.windowNotifications = this.windowNotifications.filter(function(existingNotification)
            {
                return existingNotification.name!==name
            });
            this.refreshWindowView();
        }
    },
    tabClosing: function (event) {
        // Delete notifications that were associated with this tab
        keefox_win.notificationManager.tabNotificationMap.set(event.target, []);
        keefox_win.notificationManager.refreshTabView()
    },
    tabSelected: function () {
        keefox_win.notificationManager.refreshTabView();
    },
    getPriorityClass: function(notification) {
        if (notification.priority == keefox_win.notificationManager.PRIORITY_WARNING_HIGH)
            return "keeFoxPriorityHigh";
        else if (notification.priority == keefox_win.notificationManager.PRIORITY_INFO_LOW)
            return "keeFoxPriorityLow";
        else return "keeFoxPriorityMedium";
    },
    renderNotification: function (notification) {

        var bx = document.createElement('vbox');
        bx.classList.add('keeFoxNotification');
        bx.classList.add(this.getPriorityClass(notification));
        

        var topbx = document.createElement('hbox');
        var hackbx = document.createElement('vbox'); // Needed cos of Firefox bug #394738
        var close = document.createElement('button');
        close.setAttribute('label', 'X');
        close.setAttribute('tooltiptext', keefox_org.locale.$STR('dismiss-notification'));
        close.setAttribute('class', 'KeeFox-Close-Notification');
        close.addEventListener("command", function() {
            if (typeof(notification.onClose) === "function")
                notification.onClose(window.gBrowser.selectedBrowser);
            keefox_win.notificationManager.remove(notification.name);
        }, false);
        
        hackbx.appendChild(close);
        topbx.appendChild(hackbx);
        bx.appendChild(topbx);

        let contents = notification.render(bx);
        return contents;
    },

    renderButtons: function (buttons, doc, notifyBox, name, container) {
        
        var buttonContainer = null;
        buttonContainer = doc.createElement("hbox");
        buttonContainer.classList.add("keefox-button-actions");
        
        for(var bi=0; bi < buttons.length; bi++)
        {
            var butDef = buttons[bi];
            var newButton = null;
            newButton = doc.createElement('button');
            newButton = this._prepareNotificationButton(newButton, butDef, notifyBox, name, container);
            
            buttonContainer.appendChild(newButton);
        }
        container.appendChild(buttonContainer);
        return container;
    },

    renderStandardMessage: function (container, notificationText) {
        var doc = container.ownerDocument;
        let vb = doc.createElement('vbox');
        vb.setAttribute("flex","1");
        let space = doc.createElement('spacer');
        let text = doc.createElement('label');
        text.textContent = notificationText;
        text.setAttribute('class', 'KeeFox-message');
        vb.appendChild(text);
        container.firstChild.insertBefore(space, container.firstChild.firstChild);
        container.firstChild.insertBefore(vb, container.firstChild.firstChild);
        return container;
    },

    refreshView: function () {
        this.refreshTabView();
        this.refreshWindowView();
    },
    refreshWindowView: function () {
        let container = document.getElementById('KeeFox-PanelSection-notifications-window');
        while (container.firstChild)
            container.removeChild(container.firstChild);
        let notificationList = this.windowNotifications;
        if (notificationList)
            //TODO:1.6: order by priority
            for (var notification of notificationList) {
                let notificationDOM = this.renderNotification(notification);
                container.appendChild(notificationDOM);
                if (notification.onAttached)
                    notification.onAttached(window.gBrowser.selectedBrowser,document);
            }
    },
    refreshTabView: function () {
        let container = document.getElementById('KeeFox-PanelSection-notifications-tab');
        while (container.firstChild)
            container.removeChild(container.firstChild);
        let selectedTab = window.gBrowser.selectedTab;
        let notificationList = this.tabNotificationMap.get(selectedTab);
        if (notificationList)
            //TODO:1.6: order by priority
            for (var notification of notificationList) {
                let notificationDOM = this.renderNotification(notification);
                container.appendChild(notificationDOM);
                if (notification.onAttached)
                    notification.onAttached(window.gBrowser.selectedBrowser,document);
        }
},

_prepareNotificationButton : function (but, itemDef, notifyBox, name)
{
    but.setAttribute("label", itemDef.label);
    if (itemDef.tooltip != undefined) but.setAttribute("tooltiptext", itemDef.tooltip);

    var callbackWrapper = function(fn, name){
        return function() {
            try
            {
                var returnValue = 0;
                if (fn != null)
                    returnValue = fn.apply(this, arguments);
                    
                notifyBox.remove(name);
            } catch(ex)
            {
                keefox_win.Logger.error("Exception occurred in menu item callback: " + ex);
            }
        };
    };

    var callback = callbackWrapper(itemDef.callback, name);
    but.addEventListener('command', callback, false);
    if (itemDef.id != null)
        but.setAttribute("id", itemDef.id);
    if (itemDef.values != null)
    {
        for(var pi=0; pi < itemDef.values.length; pi++)
        {
            var key = itemDef.values[pi].key;
            var val = itemDef.values[pi].value;
            but.setUserData(key, val, null);
        }                  
    }
    return but;
},
    
};
