/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This implements a proxy/stub so we can continue to call the KeeFoxLog from the 
  frame script environment despite the real KeeFoxLog living in chrome scope.

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
var Logger = {
    debug: function (message, sensitiveMessage, replace) {
        sendAsyncMessage("keefox:log-debug", {
            "m": message,
            "sm": sensitiveMessage,
            "r": replace
        });
    },

    info: function (message, sensitiveMessage, replace) {
        sendAsyncMessage("keefox:log-info", {
            "m": message,
            "sm": sensitiveMessage,
            "r": replace
        });
    },

    warn: function (message, sensitiveMessage, replace) {
        sendAsyncMessage("keefox:log-warn", {
            "m": message,
            "sm": sensitiveMessage,
            "r": replace
        });
    },

    error: function (message, sensitiveMessage, replace) {
        sendAsyncMessage("keefox:log-error", {
            "m": message,
            "sm": sensitiveMessage,
            "r": replace
        });
    }
};