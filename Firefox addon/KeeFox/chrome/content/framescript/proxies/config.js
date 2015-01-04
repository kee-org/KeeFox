/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This implements a proxy/stub so we can continue to call the KFConfig from the 
  frame script environment despite the real KFConfig living in chrome scope.

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
var config = {
    valueAllowed: function (val, whitelist, blacklist, def) {
        let res = sendSyncMessage("keefox:config-valueAllowed", {
            "val": val,
            "whitelist": whitelist,
            "blacklist": blacklist,
            "def": def
        });
        return res[0];
    },

    getConfigForURL: function (url) {
        let res = sendSyncMessage("keefox:config-getConfigForURL", {
            "url": url
        });
        return res[0];
    }
};