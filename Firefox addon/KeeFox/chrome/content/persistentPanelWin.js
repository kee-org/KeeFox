/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This contains code related to displaying a persistent panel that does not disappear
  when losing focus

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

keefox_win.persistentPanel = {
    thePanel: null,
    onTabSelected: function () {
        // If we're showing contents that should persist across multiple tabs, keep the panel open
        let winNotifications = document.getElementById('KeeFox-PanelSection-notifications-window');
        if (winNotifications.parentElement == keefox_win.persistentPanel.thePanel)
            return;

        // Close the persistent panel (Future improvement might allow it to be restored when
        // tab comes back into focus but I don't think it's that essential since a single 
        // click gets user back to where they want to be.)
        keefox_win.persistentPanel.thePanel.hidePopup();
    },
    onMainPanelShowing: function (evt) {
        // In case the user clicks on the KeeFox menu button while the persistent panel
        // is still visible, we will close the persistent panel provided it contains
        // no content that must remain across multiple tabs
        let winNotifications = document.getElementById('KeeFox-PanelSection-notifications-window');
        if (winNotifications.parentElement != keefox_win.persistentPanel.thePanel)
            keefox_win.persistentPanel.thePanel.hidePopup();
    },
    onpopuphidden: function () {
        let pv = document.getElementById('keefox-panelview');
        let tabNotifications = document.getElementById('KeeFox-PanelSection-notifications-tab');
        if (tabNotifications.parentElement == keefox_win.persistentPanel.thePanel)
            pv.insertBefore(tabNotifications, pv.firstChild);
        let winNotifications = document.getElementById('KeeFox-PanelSection-notifications-window');
        if (winNotifications.parentElement == keefox_win.persistentPanel.thePanel)
            pv.insertBefore(winNotifications, pv.firstChild);
    },
    init: function () {
        this.thePanel = document.createElement('panel');
        this.thePanel.id = 'keefox-persistent-panel';
        this.thePanel.setAttribute('tooltip', 'aHTMLTooltip');
        this.thePanel.setAttribute('noautohide', 'true');
        this.thePanel.setAttribute('type', 'arrow');
        document.getElementById('main-window').appendChild(this.thePanel);
        this.thePanel.addEventListener('popuphidden', this.onpopuphidden, false);
    },
    showNotifications: function () {
        this.thePanel.removeEventListener('popuphidden', this.showNotifications, false);
        if (this.thePanel.state == "open")
        {
            this.thePanel.addEventListener('popuphidden', this.showNotifications, false);
            this.thePanel.hidePopup();
            return;
        }
        this.thePanel.appendChild(document.getElementById('KeeFox-PanelSection-notifications-tab'));
        this.thePanel.openPopup(document.getElementById('keefox-button'), "bottomcenter topleft", 0, 0, false, false);
    },
    showWindowNotifications: function () {
        this.thePanel.removeEventListener('popuphidden', this.showWindowNotifications, false);
        if (this.thePanel.state == "open")
        {
            this.thePanel.addEventListener('popuphidden', this.showWindowNotifications, false);
            this.thePanel.hidePopup();
            return;
        }
        this.thePanel.appendChild(document.getElementById('KeeFox-PanelSection-notifications-window'));
        this.thePanel.openPopup(document.getElementById('keefox-button'), "bottomcenter topleft", 0, 0, false, false);
    }
};