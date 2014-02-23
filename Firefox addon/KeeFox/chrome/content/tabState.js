/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2014 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the KeeFox tab state javascript file. It helps us track the login
  state of tabs in the window to which it is attached.

  Initially we are just pulling out some existing functions from less appropriate
  files but in future versions of KeeFox we could use this as the basis
  for some improvements to login behaviour.

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

keefox_win.tabState = {

    construct : function (currentWindow) {
        this._currentWindow = currentWindow;
    },

    _currentWindow: null,

    // wipe any session data relating to saving login forms that we
    // have associated with the most recent tab.
    clearTabFormRecordingData: function () {
        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
            .getService(Components.interfaces.nsISessionStore);
        var currentGBrowser = this._currentWindow.gBrowser;
        var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];

        var currentPage = ss.getTabValue(currentTab, "KF_recordFormCurrentPage");

        if (currentPage != undefined && currentPage != null && currentPage != "") {
            ss.deleteTabValue(currentTab, "KF_recordFormCurrentPage");
        }

        var currentStateJSON = ss.getTabValue(currentTab, "KF_recordFormCurrentStateJSON");

        if (currentStateJSON != undefined && currentStateJSON != null && currentStateJSON != "") {
            ss.deleteTabValue(currentTab, "KF_recordFormCurrentStateJSON");
        }

    },

    // prepare the most recent tab for recording a login procedure
    // As of KeeFox 1.4 this is still not used - might be useful in 1.5+ though
//    setTabFormRecordingData: function () {

//        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
//            .getService(Components.interfaces.nsISessionStore);
//        var currentGBrowser = this._currentWindow.gBrowser;
//        var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];

//        //this.log(currentGBrowser.mTabs.selectedIndex);
//        var currentPage = ss.getTabValue(currentTab, "KF_recordFormCurrentPage");

//        if (currentPage == undefined || currentPage == null) {
//            currentPage = 0; // or 1?
//        }

//        ss.setTabValue(currentTab, "KF_recordFormCurrentPage", currentPage + 1);

//    },

    // wipe any session data relating to filling login forms that we
    // have associated with the most recent tab.
    clearTabFormFillData: function () {
        keefox_win.Logger.debug("clearTabFormFillData start");
        var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
            .getService(Components.interfaces.nsISessionStore);
        var currentGBrowser = this._currentWindow.gBrowser;
        var currentTab = currentGBrowser.mTabs[currentGBrowser.getBrowserIndexForDocument(currentGBrowser.selectedBrowser.contentDocument)];

        var autoSubmit = ss.getTabValue(currentTab, "KF_autoSubmit");

        if (autoSubmit != undefined && autoSubmit != null && autoSubmit != "") {
            ss.deleteTabValue(currentTab, "KF_autoSubmit");
        }

        var uniqueID = ss.getTabValue(currentTab, "KF_uniqueID");

        if (uniqueID != undefined && uniqueID != null && uniqueID != "") {
            ss.deleteTabValue(currentTab, "KF_uniqueID");
        }

        var dbFileName = ss.getTabValue(currentTab, "KF_dbFileName");

        if (dbFileName != undefined && dbFileName != null && dbFileName != "")
        {
            ss.deleteTabValue(currentTab, "KF_dbFileName");
        }
        
        var numberOfTabFillsTarget = ss.getTabValue(currentTab, "KF_numberOfTabFillsTarget");

        if (numberOfTabFillsTarget != undefined && numberOfTabFillsTarget != null && numberOfTabFillsTarget != "") {
            ss.deleteTabValue(currentTab, "KF_numberOfTabFillsTarget");
        }

        var numberOfTabFillsRemaining = ss.getTabValue(currentTab, "KF_numberOfTabFillsRemaining");

        if (numberOfTabFillsRemaining != undefined && numberOfTabFillsRemaining != null && numberOfTabFillsRemaining != "") {
            ss.deleteTabValue(currentTab, "KF_numberOfTabFillsRemaining");
        }


        keefox_win.Logger.debug("clearTabFormFillData end");
    }
}