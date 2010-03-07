/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the KeeFox javascript test system.
  It will mainly be used for development but may also be useful for end user
  debugging assistance.

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

/*

To run these tests:
Load Firefox
Click on the main KeeFox menu
Click on "KeeFox Options"
Click on the "advanced" tab
Click on the "test KeeFox" button
Follow the instructions on screen

To add new tests look at the KFtestDefinitions.js file

*/

function KFtests(KFILM) {
    this._kfilm = KFILM;
}

KFtests.prototype = {

    // The KeeFox Improved Login Manager
    _kfilm: null,

    _KeeFoxTestErrorOccurred: false,
    
    _alert : function (msg) {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser");

        // get a reference to the prompt service component.
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                            .getService(Components.interfaces.nsIPromptService);

        // show an alert. For the first argument, supply the parent window. The second
        // argument is the dialog title and the third argument is the message
        // to display.
        promptService.alert(window,"Alert",msg);
    },
    
    
    _KeeFoxAssert: function(testResult, successMsg, failMsg, abortOnFail) {
        if (testResult) {
            KFLog.info(successMsg);
            return;
        } else {
            this._KeeFoxTestErrorOccurred = true;
            KFLog.error(failMsg);
        }

        if (abortOnFail)
            throw new Error("Serious error. Test procedure aborted because: " + failMsg);
    },
    
    
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    // This is the core test procedure
    
    // TODO: pass in other window specific objects so we can run some further, more UI orientated, tests.
    // to more effectively represent real world situations
    
    //TODO: improved test system? eg: temporary html pages created by javascript, loaded in new tabs and auto-submitted through a GET form submission.
    // results read back by javascript querystring probe
    do_tests: function() {

      //  keeFoxInst._keeFoxExtension.prefs.setValue("notifyBarWhenLoggedOut",!keeFoxInst._keeFoxExtension.prefs.getValue("notifyBarWhenLoggedOut",true));
       // keeFoxInst._keeFoxExtension.prefs.setValue("notifyBarWhenKeeICEInactive",!keeFoxInst._keeFoxExtension.prefs.getValue("notifyBarWhenKeeICEInactive",true));
        
 //       keeFoxInst._keeFoxExtension.prefs.setValue("notifyBarWhenLoggedOut",true);
 //       keeFoxInst._keeFoxExtension.prefs.setValue("notifyBarWhenKeeICEInactive",true);

//keeFoxToolbar._currentWindow.setTimeout(keeFoxToolbar.flashItem, 10, keeFoxToolbar._currentWindow.document.getElementById('KeeFox_RunSelfTests-Button'), 12, keeFoxToolbar._currentWindow);
//return;

        // an inline function (for scope reasons) to eval test expressions at run time
        function evaluateSubject (subj)
        {
            var logService = Cc["@mozilla.org/consoleservice;1"].
                                    getService(Ci.nsIConsoleService);
                                    
            logService.logStringMessage("evaluating subject: "+subj);
            
            if (subj == null || subj == undefined)
                return subj;
            
            logService.logStringMessage("actually evaluating...");
            
            var re = new RegExp("EXEC\\:\\[\\[.+\\]\\]");
            if (re.test(subj)==true)
            {
                logService.logStringMessage("regex match:"+subj.substr(7,subj.length-9));
                var result = eval(subj.substr(7,subj.length-9));
                logService.logStringMessage("returning: "+result);
                return result;
            } else {
                logService.logStringMessage("returning it unmodified");
                return subj;
            }
        }
        
        // load the test definitions into this scope
        loader.loadSubScript("resource://kfscripts/KFtestDefinitions.js"); 
        
        var testusers = KFgetTestUsers();
        var testgroups = [];

// temp for debugging modification
//this._kfilm.modifyLogin(testuser5,testuser6);
//this._alert("test");
//this._kfilm.modifyLogin(testuser6,testuser7);
//this._alert("test");
//this._kfilm.modifyLogin(testuser5,testuser7);

// temp for debugging database change
 //       var originalDBFileName = keeFoxInst.getDatabaseFileName();
 //       keeFoxInst.changeDatabase("C:\\Documents and Settings\\Chris Tomlinson\\My Documents\\NewDatabase.kdbx", true);
//        this._alert("swapped");
  //      keeFoxInst.changeDatabase(originalDBFileName, false);
//        this._alert("added");
        
// temp for when we don't want to overwrite DB content
//return;

        var resultText = "";
        var rootGroup; // wide scope because it will not change during testing
        var defaultKeePassGroupCount = 6; // The number of "default" groups in KeePass

        // whether the changes should be rolled back at the end
        //(e.g. to permit further interactive testing). Note that you will
        // need to manually delete the contents or use a new empty database
        // before you can run this test script again. 
        var makePermanentChanges = false;

        // Which test batches you want to run
        var executeBatches = [ true, true, true, true, true ];
       
        // Get all of the test batches (maybe they won't all be executed: see above)
        var testbatches = getTestBatches(defaultKeePassGroupCount);
      

        var loginsTemp = this._kfilm.getAllLogins({});
        var groupsTemp = this._kfilm.getChildGroups({},null);
        this._KeeFoxAssert((loginsTemp.length == 0 && groupsTemp.length == defaultKeePassGroupCount), "Using empty database - good", "KeePass is not loaded with an empty database. Please fix this before re-running the tests", true);


        // Execute every batch of tests.
        // Some tests can cause the entire batch to instantly fail but this
        // will not prevent the next batch from running.
        for (var i = 0; i < testbatches.length; i++)
        {
            testbatches[i].status = "PASS";
            
            // if we haven't configured this batch to run or if it is the last
            // batch and we want to skip the delete process, just move on...
            if (executeBatches[i] != true || (testbatches.length-1 == i && makePermanentChanges))
                continue;
            
            // for every test in this batch
            for (var j = 0; j < testbatches[i].tests.length; j++)
            {
                var test = testbatches[i].tests[j];
                test.result = "FAILURE";
                
                // perform the action
                switch (test.action)
                {
                    case "getRootGroup": rootGroup = this._kfilm.getRootGroup(); break;
                    case "addGroup": testgroups[test.expectedValue-defaultKeePassGroupCount-1] = this._kfilm.addGroup(evaluateSubject(test.subject1), evaluateSubject(test.subject2)); break;
                    case "addLogin": this._kfilm.addLogin(evaluateSubject(test.subject1), evaluateSubject(test.subject2)); break;
                    case "deleteAllGroups": for (var tg = 0; tg < testgroups.length; tg++) this._kfilm.removeGroup(testgroups[tg].uniqueID); break;
                    case "deleteAllLogins": var logins = this._kfilm.getAllLogins({}); for (var tl = 0; tl < logins.length; tl++) this._kfilm.removeLogin(logins[tl].uniqueID); break;
                }
                
                // determine the resulting database state
                switch (test.test)
                {
                    case "getAllLogins": var logins = this._kfilm.getAllLogins({}); test.result = logins.length; break;
                    case "getChildGroups": var groups = this._kfilm.getChildGroups({},evaluateSubject(test.subject2)); test.result = groups.length; break;
                    case "rootGroupUniqueIDExists": test.result = rootGroup.uniqueID.length; break;
                }
                
                // examine the result
                if(test.result == test.expectedValue)
                {
                    test.status = "PASS";
                    resultText += test.successMessage + " : ";
                }
                else if (test.result == "FAILURE")
                {
                    if (test.abortEntireBatchOnFail)
                        testbatches[i].status = "FAIL";
                    test.status = "FAIL";
                    resultText += test.failureMessage + " (Could not execute the test) : ";
                }
                else
                {
                    if (test.abortEntireBatchOnFail)
                        testbatches[i].status = "FAIL";
                    test.status = "FAIL";
                    resultText += test.failureMessage + " (" + test.result + " was found but expected " + test.expectedValue + ") : ";
                }
                
                    
                if (testbatches[i].status == "FAIL")
                {
                    resultText += "Entire test batch ("+i+") FAILED. : ";
                    break;
                }
                
                    
            }

        }

        for (var i = 0; i < testbatches.length; i++)
        {
            if (testbatches[i].status == "FAIL")
            {
                resultText = "One or more major failures occurred. KeeFox will not function correctly (please CTRL-C this message box and send it to the developers for advice). Summary diagnostic messages follow: " + resultText;
                return resultText;
            }
            
            for (var j = 0; j < testbatches[i].tests.length; j++)
            {
                var test = testbatches[i].tests[j];
                if (testbatches[i].tests[j] == "FAIL")
                {
                    resultText = "One or more minor failures occurred. KeeFox may not function correctly (please CTRL-C this message box and send it to the developers if you experience any problems with KeeFox). Summary diagnostic messages follow: " + resultText;
                    return resultText;
                }
            }        
                
        }

        KFLog.info("Advanced diagnostic summary of the successful test run: " + resultText);
        resultText = "The tests appear to have worked as expected. If you still have trouble, please use the support centre on the KeeFox website (http://keefox.org) Summary diagnostic messages can be found in the Firefox errors log (if you have enabled logging in the advanced KeeFox options panel)";
        return resultText;
    }
}
