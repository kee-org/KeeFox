/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the main KeeFox javascript file. It is executed once for each firefox
  window (with a different scope each time). javascript files included using 
  Components.utils.import() are shared across all scopes (windows) while those
  included using loadSubScript() are not. The overall aim is to keep data and
  functions relating to KeePass and other global settings in a single shared
  object (KF.js) while those objects which interact with specific windows are
  loaded and initialised in each scope.

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

// Load our other javascript
var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                       .getService(Components.interfaces.mozIJSSubScriptLoader); 
loader.loadSubScript("resource://kfscripts/KFToolBar.js"); 
loader.loadSubScript("resource://kfscripts/KFILM.js"); 
loader.loadSubScript("resource://kfscripts/KFUI.js"); 
Components.utils.import("resource://kfmod/KF.js");
loader.loadSubScript("resource://kfscripts/KFUtils.js"); 
loader.loadSubScript("resource://kfscripts/KFtest.js"); 

// These variables are accessible from (and specific to) the current
// window scope. (although occasionally I can't get them to work...)
var keeFoxToolbar, keeFoxILM, keeFoxUI, KFtester;

// This object listens for the "window loaded" event, fired after
// Firefox finishes loading a window
var keeFoxInitStartupListener = {

        // a reference to this scope's KF object
        _kf: null,
        
        // the window we are interested in (see below for performance improvement option)
        _assignedWindow : null,

        QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIDOMEventListener,   
                            Components.interfaces.nsISupportsWeakReference]),

        handleEvent: function(event) {
            this._kf.log("keeFoxInitStartupListener: got event " + event.type);

            var currentWindow, inputElement;
            currentWindow = event.target.defaultView;
            
            // proving we can get to the navigator for future use... this._kf.log(currentWindow.navigator.buildID);
            
            if (currentWindow != this._assignedWindow)
            {
                this._kf.log("not the right window");
                return;
            }
            this._kf.log("it's the right window");
            
            // we only care about "load" events for the moment at least
            switch (event.type) {
                case "load":
                
                    // our toolbar (+ a bit more, maybe needs renaming
                    // in future if I can think of something better)
                    keeFoxToolbar = new KFToolbar(currentWindow);
                    
                    // an event listener on the toolbar clears session data relating to
                    // the form filling process. ATOW only called in response to user
                    // editing form field contents.
                    document.addEventListener("KeeFoxClearTabFormFillData", function(e)
                        { keeFoxToolbar.clearTabFormFillData(e); }, false, true);
                        
                    // the improved login manager which acts (a bit) like a bridge
                    // between the user visible code and the KeeFox module / XPCOM DLL    
                    keeFoxILM = new KFILM(keeFoxInst,keeFoxToolbar,currentWindow);
                    
                    // the main UI code including things like
                    // the generation of notification boxes
                    keeFoxUI = new KFUI();

                    keeFoxUI.init(keeFoxInst, keeFoxILM);
                    keeFoxInst.init(keeFoxToolbar,currentWindow);

                    // Used to aid testing of various KeeFox features
                    // (arguably is not needed in version 1.0 but I may keep it
                    // just in case unless performance is noticably worse with it)
                    KFtester = new KFtests(keeFoxILM);

                    return;
                default:
                    this._kf.log("This event was unexpected and has been ignored.");
                    return;
            }
        }
    };

// keeFoxInst has been setup already (at the end of KF.js) but the window-specific
// setup has to wait until Firefox triggers an event listener to say that the
// window is ready to be used
    keeFoxInitStartupListener._kf = keeFoxInst;
    keeFoxInitStartupListener._assignedWindow = window;
    window.addEventListener("load", keeFoxInitStartupListener, false);
    
// TODO: we actually end up creating a new listener for each Firefox window and 
// just ignoring the notifications sent by unrelated windows. I think that removing
// the event listener after initial setup is finished will keep things more efficient