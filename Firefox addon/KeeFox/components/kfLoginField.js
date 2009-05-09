/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008 Chris Tomlinson <keefox@christomlinson.name>
  

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

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function kfLoginField() {}

kfLoginField.prototype = {

    classDescription  : "KFLoginField",
    contractID : "@christomlinson.name/kfLoginField;1",
    classID : Components.ID("{7ed5ba34-1375-4887-86fd-0682ddfaa873}"),
    QueryInterface: XPCOMUtils.generateQI([Ci.kfILoginField]), 
    
    
    name      : null,
    value : null,
    
    init : function ( aName, aValue )
    {
        this.name = aName;
        this.value = aValue;
    }
  
};

var component = [kfLoginField];
function NSGetModule(compMgr, fileSpec) {
    return XPCOMUtils.generateModule(component);
}
