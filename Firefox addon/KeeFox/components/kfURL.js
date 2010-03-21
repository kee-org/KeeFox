///*
//  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
//  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
//  
//  This is the XPCOM/Firefox view of a URL. It's just a wrapper for a string
//  but sadly required due to the limitations of XPIDL
//  
//  Defined in the KeeFox project / comp.idl
//  
//  This program is free software; you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation; either version 2 of the License, or
//  (at your option) any later version.

//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.

//  You should have received a copy of the GNU General Public License
//  along with this program; if not, write to the Free Software
//  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
//*/

//const Cc = Components.classes;
//const Ci = Components.interfaces;

//Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

//function kfURL() {}

//kfURL.prototype = {

//    classDescription  : "KFURL",
//    contractID : "@christomlinson.name/kfURL;1",
//    classID : Components.ID("{21e35ab1-d964-476f-ba73-c318cc1a1183}"),
//    QueryInterface: XPCOMUtils.generateQI([Ci.kfIURL]), 
//    
//    // if you can't guess what this is used for, you're in the wrong place ;-)
//    URL      : null
//  
//};

//var component = [kfURL];
//function NSGetModule(compMgr, fileSpec) {
//    return XPCOMUtils.generateModule(component);
//}
