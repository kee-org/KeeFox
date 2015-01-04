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
    onpopuphidden: function () {
        let pv = document.getElementById('keefox-panelview');
        pv.insertBefore(document.getElementById('KeeFox-PanelSection-notifications-tab'), pv.firstChild);
    },
    init: function () {
        this.thePanel = document.createElement('panel');
        this.thePanel.id = 'keefox-persistent-panel';
        this.thePanel.setAttribute('noautohide', 'true');
        this.thePanel.setAttribute('type', 'arrow');
        document.getElementById('main-window').appendChild(this.thePanel);
        this.thePanel.addEventListener('popuphidden', this.onpopuphidden, false);
    },
    showNotifications: function () {
        this.thePanel.appendChild(document.getElementById('KeeFox-PanelSection-notifications-tab'));
        this.thePanel.openPopup(document.getElementById('keefox-button'), "bottomcenter topleft", 0, 0, false, false);
    }
};