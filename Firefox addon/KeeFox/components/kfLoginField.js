///*
//  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
//  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
//  
//  This represents a form field
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

//function kfLoginField() {}

//kfLoginField.prototype = {
//    // "name" attribute on the HTML form element
//    name      : null,
//    
//    // "value" attribute on the HTML form element
//    value : null,
//    
//    // "id" attribute on the HTML form element
//    fieldId : null,
//    
//    // The HTML form element DOM objects - transient (not sent to KeePass)
//    DOMInputElement : null,
//    DOMSelectElement : null,
//    
//    // "type" attribute on the HTML form element
//    type : null,
//    
//    // on which page of a login procedure this field can be found
//    formFieldPage : -1,
//    
//    // assists with deserialisation of this object to a string
//    // (for attachment to the current tab session)
//    toSource : function ()
//    {
//        var fieldIdParam = (this.fieldId == null) ? "null" : ("'"+this.fieldId+"'");
//        var fieldNameParam = (this.name == null) ? "null" : ("'"+this.name.replace("'","\\'")+"'"); // replace("\\","\\\\")
//  var fieldValueParam = (this.value == null) ? "null" : ("'"+this.value.replace("'","\\'")+"'"); // replace("\\","\\\\")
//        
//        return "( "+fieldNameParam+", "+fieldValueParam+" , "+fieldIdParam+" , '"+this.type+"' , "+this.formFieldPage+" )";
//    },
//    
//    init : function ( aName, aValue, aID, aType, aFormFieldPage )
//    {
//        var logService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
//        //logService.logStringMessage("Initialising kfLoginField [name: " + aName + ", value: " + aValue + ", ID: " + aID + ", type: " + aType + ", page: " + aFormFieldPage + "]");
//        
//        //dump("Initialising kfLoginField [name: " + aName + ", value: " + aValue + ", ID: " + aID + ", type: " + aType + ", page: " + aFormFieldPage + "]\n");
//        
//        this.name = aName;
//        this.value = aValue;
//        if (aID == null || aID == undefined)
//            this.fieldId = "";
//        else
//            this.fieldId = aID;
//        this.type = aType;
//        this.formFieldPage = aFormFieldPage; //parseInt(aFormFieldPage);
//    }
//  
//};
