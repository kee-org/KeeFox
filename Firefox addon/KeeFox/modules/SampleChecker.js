/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  The SampleChecker allows us to identify if any accessible database contains
  the required sample entries for use by the KeeFox tutorial

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

var EXPORTED_SYMBOLS = ["sampleChecker"];

var SampleChecker = function() {
    
};
SampleChecker.prototype = {
    //TODO:1.5: Might need to be more refined RE multiple databases but at least 
    // this works for 99.9% of new users and the ones that need assistence the most
    databasesContainsSamples: function(dbs) {
        for (let db of dbs)
            if (this.databaseContainsSamples(db))
                return true;
        return false;
    },

    isMatched: function(item) {
        if (item.uniqueID == "E99FF2ED05124747B63EAFA515A30424"
            || item.uniqueID == "E89FF2ED05124747B63EAFA515A30425"
            || item.uniqueID == "E79FF2ED05124747B63EAFA515A30426"
            || item.uniqueID == "E59FF2ED05124747B63EAFA515A30428")
            return true;
        return false;
    },

    treeTraversal: function(branch, currentResultCount) {
        let totalResultCount = currentResultCount;
        for (var leaf of branch.childLightEntries)
            if (this.isMatched(leaf))
                totalResultCount++;
        for (var subBranch of branch.childGroups)
            totalResultCount = this.treeTraversal(subBranch, totalResultCount);
        return totalResultCount;
    },

    databaseContainsSamples: function(db) {
        let count = this.treeTraversal(db.root, 0);
        if (count >= 4)
            return true;
        return false;
    }
};

var sampleChecker = new SampleChecker();