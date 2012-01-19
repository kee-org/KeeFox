/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
Copyright 2008-2011 Chris Tomlinson <keefox@christomlinson.name>
  
This install_mono.js file helps manage the installation under Mono.

See install_mono.xul for a description of each of the ICs (Install Cases)

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

var mainWin = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIWebNavigation)
.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
.rootTreeItem
.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
.getInterface(Components.interfaces.nsIDOMWindow);

var mainWindow = mainWin.keefox_org.ILM._currentWindow;

// localisation string bundle
var strbundle = mainWin.document.getElementById("KeeFox-strings");
  
function prepareMonoInstallPage()
{

  /*
   * Show the user the path to the 'deps' folder of their keefox extension
   */
  var directoryService = Components.classes["@mozilla.org/file/directory_service;1"].  
    getService(Components.interfaces.nsIProperties);
  var dir = directoryService.get("ProfD", Components.interfaces.nsIFile);
  dir.append("extensions");
  dir.append("keefox@chris.tomlinson");
  dir.append("deps");
  document.getElementById('monoManualStep5a_description').textContent = dir.path;

  var directoryService = Components.classes["@mozilla.org/file/directory_service;1"].  
    getService(Components.interfaces.nsIProperties);
  var dir = directoryService.get("Home", Components.interfaces.nsIFile);
  dir.append("KeePass");
  document.getElementById('monoManualTest1a_description').textContent = dir.path;
  
  var qs = "";
  var args = new Object();
  var query = location.search.substring(1);
  var pairs = query.split("&");
  for(var i = 0; i < pairs.length; i++)
  {
    var pos = pairs[i].indexOf('=');
    if (pos == -1) continue;
    var argname = pairs[i].substring(0,pos);
    var value = pairs[i].substring(pos+1);
    args[argname] = unescape(value); 
  }
  if (args.upgrade == "1")
  {
    KFupgradeMode = true;
    mainWindow.keeFoxInst._KFLog.debug("Install system starting in upgrade mode");
  }
  else
  {
    mainWindow.keeFoxInst._KFLog.debug("Install system starting in install mode");
  }
        
  // prevent reinstallation if KeeFox is already working
  if (mainWindow.keeFoxInst._keeFoxStorage.get("KeePassRPCActive", false))
  {
    document.getElementById('KFInstallNotRequired').setAttribute('hidden', false);
    resetInstallation();
    return;
  }
    
  // only let this install script run once per firefox session unless user cancels it
  if (mainWindow.keeFoxInst._keeFoxStorage.get("KFinstallProcessStarted", false))
  {
    document.getElementById('KFInstallAlreadyInProgress').setAttribute('hidden', false);
    showSection('restartInstallationOption');
    return;
  }

}





