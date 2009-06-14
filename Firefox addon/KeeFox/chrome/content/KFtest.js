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

// maybe one day...
//  _toolbar: null,
//    _kfui: null,

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
    
    __logService : null, // Console logging service, used for debugging.
    get _logService() {
        if (!this.__logService)
            this.__logService = Cc["@mozilla.org/consoleservice;1"].
                                getService(Ci.nsIConsoleService);
        return this.__logService;
    },
    
    // Internal function for logging debug messages to the Error Console window
    log : function (message) {
        this._logService.logStringMessage(message);
    },
    
    /*
     * error
     *
     * Internal function for logging error messages to the Error Console window
     */
    error : function (message) {
        Components.utils.reportError(message);
    },
    
    
    _KeeFoxAssert: function(testResult, successMsg, failMsg, abortOnFail) {
        if (testResult) {
            this.log(successMsg);
            return;
        } else {
            this._KeeFoxTestErrorOccurred = true;
            this.error(failMsg);
        }

        if (abortOnFail)
            throw new Error("Serious error. Test procedure aborted because: " + failMsg);
    },
    
    
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    // This is the core test procedure
    
    // TODO: pass in other window specific objects so we can run some further, more UI orientated, tests.
    // to more effectively represent real world situations
    
    //TODO: improved test system. eg: temporary html pages created by javascript, loaded in new tabs and auto-submitted through a GET form submission.
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
        
        loader.loadSubScript("resource://kfscripts/KFtestDefinitions.js"); 
    
    /*
        this.log("Constructing kfIGroupInfo interface");

        var kfIGroupInfo = new Components.Constructor(
                      "@christomlinson.name/kfGroupInfo;1",
                      Components.interfaces.kfIGroupInfo);

        if (kfIGroupInfo == null) { this.log("Could not construct kfIGroupInfo. KeeFox may need to be re-installed."); throw "noGroupInfo"; }

        this.log("Creating test groups");

        var testgroups = [];*/

        //this.log("Initialising test users");

        //var testusers = [];
        
        var testusers = KFgetTestUsers();
        var testgroups = [];
/*
        testusers[testusers.length] = new kfLoginInfo;
        testusers[testusers.length-1].init("https://oyster.tfl.gov.uk", "https://oyster.tfl.gov.uk", null,
      0, keeFoxInst.kfLoginFieldsConstructor("password name 1","password value 1","password id 1"), null, "One username and password 1",
      keeFoxInst.kfLoginFieldsConstructor("user name 1","user value 1","user id 1"));

        testusers[testusers.length] = new kfLoginInfo;
        testusers[testusers.length-1].init("https://oyster.tfl.gov.uk/oyster/entry.do", "https://third.party.form.submit.url/including/path/and/file.cgi", null,
      -1, keeFoxInst.kfLoginFieldsConstructor("password name 1","password value 1","password id 1"), null, "No username 1", null);

        testusers[testusers.length] = new kfLoginInfo;
        testusers[testusers.length-1].init("http://dummyhost.mozilla.org", null, "Test REALM3",
      0, keeFoxInst.kfLoginFieldsConstructor("password name 1","password value 1","password id 1"), null, "one username and password with realm 1", keeFoxInst.kfLoginFieldsConstructor("user name 1","user value 1","user id 1"));
*/ /*
        testusers[testusers.length] = new kfLoginInfo;
        testusers[testusers.length-1].init("http://dummyhost.mozilla.org/full/url.php", "https://third.party.form.submit.url/including/path/and/file.cgi", null,
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!\"£$%^&*()-_=+{}~@:[]#';/.,?><|\¬`¦u4", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!\"£$%^&*()-_=+{}~@:[]#';/.,?><|\¬`¦p4", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!\"£$%^&*()-_=+{}~@:[]#';/.,?><|\¬`¦uf4", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!\"£$%^&*()-_=+{}~@:[]#';/.,?><|\¬`¦pf4", null, "Test title 4");

        testusers[testusers.length] = new kfLoginInfo;
        testusers[testusers.length-1].initCustom("http://dummyhost.mozilla.org/full/url.php", "https://third.party.form.submit.url/including/path/and/file.cgi", null,
      "abcdefghijklmnopqr", "abcdefghijklmnopqr", "abcdefghijklmnopqr", "abcdefghijklmnopqr", null, "Test title 5",keeFoxInst.kfLoginFieldsConstructor("custom1","cvalue1","custom2","cvalue2"));

        testusers[testusers.length] = new kfLoginInfo;
        testusers[testusers.length-1].initCustom("http://dummyhost.mozilla.org/full/url.php", "https://third.party.form.submit.url/including/path/and/file.cgi", null,
      "abcdefghijklmnopqr", "abcdefghijklmnopqr", "abcdefghijklmnopqr", "abcdefghijklmnopqr", null, "Test title 6",keeFoxInst.kfLoginFieldsConstructor("custom1","cvalue1","custom2","cvalue2"));

        testusers[testusers.length] = new kfLoginInfo;
        testusers[testusers.length-1].initCustom("http://dummyhost.mozilla.org/full/url.php", "https://third.party.form.submit.url/including/path/and/file.cgi", null,
      "abcdefghijklmnopqr7", "abcdefghijklmnopqr7", "abcdefghijklmnopqr7", "abcdefghijklmnopqr7", null, "Test title 7",keeFoxInst.kfLoginFieldsConstructor("custom1","cvalue1","custom2","cvalue2"));
*/
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

var rootGroup; // global because it will not change during testing

var defaultKeePassGroupCount = 6; // The number of "default" groups in KeePass

// The batch id of tests you want to apply to an empty database
//(e.g. to permit further interactive testing. Note that you will
// need to manually delete the contents or use a new empty database
// before you can run this test script again. 
   var makePermanentChanges = false;
   var executeBatches = [ true, true, true, true, true ];
    
    var testbatch = getTestBatches(defaultKeePassGroupCount);
  

        var loginsTemp = this._kfilm.getAllLogins({});
        var groupsTemp = this._kfilm.getChildGroups({},null);
        this._KeeFoxAssert((loginsTemp.length == 0 && groupsTemp.length == defaultKeePassGroupCount), "Using empty database - good", "KeePass is not loaded with an empty database. Please fix this before re-running the tests", true);


// Execute every batch of tests.
// Some tests can cause the entire batch to instantly fail but this
// will not prevent the next batch from running.
for (var i = 0; i < testbatch.length; i++)
{
    testbatch[i].status = "PASS";
    
    // if we haven't configured this batch to run or if it is the last batch and we want to skip the delete process, just move on...
    if (executeBatches[i] != true || (testbatch.length-1 == i && makePermanentChanges))
        continue;

    for (var j = 0; j < testbatch[i].tests.length; j++)
    {
        var test = testbatch[i].tests[j];
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
        
        // determine the result
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
                testbatch[i].status = "FAIL";
            test.status = "FAIL";
            resultText += test.failureMessage + " (Could not execute the test) : ";
        }
        else
        {
            if (test.abortEntireBatchOnFail)
                testbatch[i].status = "FAIL";
            test.status = "FAIL";
            resultText += test.failureMessage + " (" + test.result + " was found but expected " + test.expectedValue + ") : ";
        }
        
            
        if (testbatch[i].status == "FAIL")
        {
            resultText += "Entire test batch ("+i+") FAILED. : ";
            break;
        }
        
            
    }

}

for (var i = 0; i < testbatch.length; i++)
{
    if (testbatch[i].status == "FAIL")
    {
        resultText = "One or more major failures occurred. KeeFox will not function correctly (please CTRL-C this message box and send it to the developers for advice). Summary diagnostic messages follow: " + resultText;
        return resultText;
    }
    
    for (var j = 0; j < testbatch[i].tests.length; j++)
    {
        var test = testbatch[i].tests[j];
        if (testbatch[i].tests[j] == "FAIL")
        {
            resultText = "One or more minor failures occurred. KeeFox may not function correctly (please CTRL-C this message box and send it to the developers if you experience any problems with KeeFox). Summary diagnostic messages follow: " + resultText;
            return resultText;
        }
    }        
        
}

this.log("Advanced diagnostic summary of the successful test run: " + resultText);
resultText = "The tests appear to have worked as expected. If you still have trouble, please use teh support centre on the KeEFox website (http://keefox.info) Summary diagnostic messages can be found in the Firefox errors log (if you have enabled logging in the advanced KeeFox options panel)";
return resultText;
/*
        var testuser1login = this._kfilm.addLogin(testuser1, testgroup1.uniqueID);
        logins = this._kfilm.getAllLogins({});
        this._KeeFoxAssert((logins.length == 1), "1st test login added successfully", "1st test login couldn't be added to KeePass", true);
        this._kfilm.addLogin(testuser2, testgroup1.uniqueID);
        logins = this._kfilm.getAllLogins({});
        this._KeeFoxAssert((logins.length == 2), "2nd test login added successfully", "2nd test login couldn't be added to KeePass", true);
        this._kfilm.addLogin(testuser3, testgroup1.uniqueID);
        logins = this._kfilm.getAllLogins({});
        this._KeeFoxAssert((logins.length == 3), "3rd test login added successfully", "3rd test login couldn't be added to KeePass", true);
        this._kfilm.addLogin(testuser4, null);
        logins = this._kfilm.getAllLogins({});
        this._KeeFoxAssert((logins.length == 4), "4th test login added successfully", "4th test login couldn't be added to KeePass", true);
        this._kfilm.addLogin(testuser5, null);
        logins = this._kfilm.getAllLogins({});
        this._KeeFoxAssert((logins.length == 5), "5th test login added successfully", "5th test login couldn't be added to KeePass", true);
        this._kfilm.addLogin(testuser6, null);
        logins = this._kfilm.getAllLogins({});
        this._KeeFoxAssert((logins.length == 6), "6th test login added successfully", "6th test login couldn't be added to KeePass", true);

        var countResult = this._kfilm.countLogins("https://oyster.tfl.gov.uk", "", null);
        this._KeeFoxAssert((countResult == 2), "Login count correct.", "Login count failed: https://oyster.tfl.gov.uk + all formURLs + no HTTP realm = " + countResult + ". Should be 2", false);
*/
/* These tests need updating but I will wait until this side of the system is complete in 0.7

        countResult = this._kfilm.countLogins("https://oyster.tfl.gov.uk", "https://oyster.tfl.gov.uk", null);
        this._KeeFoxAssert((countResult == 1), "Login count correct.", "Login count failed: https://oyster.tfl.gov.uk + https://oyster.tfl.gov.uk + no HTTP realm = " + countResult + ". Should be 1", false);//2

        countResult = this._kfilm.countLogins("https://oyster.tfl.gov.uk", "https://third.party.form.submit.url", null);
        this._KeeFoxAssert((countResult == 1), "Login count correct.", "Login count failed: https://oyster.tfl.gov.uk + https://third.party.form.submit.url + no HTTP realm = " + countResult + ". Should be 1", false);//2

        countResult = this._kfilm.countLogins("", "https://third.party.form.submit.url", null);
        this._KeeFoxAssert((countResult == 4), "Login count correct.", "Login count failed: any host + https://third.party.form.submit.url + no HTTP realm = " + countResult + ". Should be 4", false);//6

        countResult = this._kfilm.countLogins("https://oyster.tfl.gov.uk", null, "some incorrect realm");
        this._KeeFoxAssert((countResult == 0), "Login count correct.", "Login count failed: https://oyster.tfl.gov.uk + no forms + invalid HTTP realm = " + countResult + ". Should be 0", false);//2

        countResult = this._kfilm.countLogins("", null, "some incorrect realm");
        this._KeeFoxAssert((countResult == 0), "Login count correct.", "Login count failed: any host + no forms + invalid HTTP realm = " + countResult + ". Should be 0", false);//6

        countResult = this._kfilm.countLogins("", null, "Test REALM3");
        this._KeeFoxAssert((countResult == 1), "Login count correct.", "Login count failed: any host + no forms + Test REALM3 = " + countResult + ". Should be 1", false); //6

        countResult = this._kfilm.countLogins("http://dummyhost.mozilla.org", "https://third.party.form.submit.url", null);
        this._KeeFoxAssert((countResult == 3), "Login count correct.", "Login count failed: http://dummyhost.mozilla.org + https://third.party.form.submit.url + no HTTP realm = " + countResult + ". Should be 3", false); //4

        countResult = this._kfilm.countLogins("http://dummyhost.mozilla.org", "", null);
        this._KeeFoxAssert((countResult == 3), "Login count correct.", "Login count failed: http://dummyhost.mozilla.org + any form + no HTTP realm = " + countResult + ". Should be 3", false); //4

        countResult = this._kfilm.countLogins("http://dummyhost.mozilla.org", null, "Test REALM3");
        this._KeeFoxAssert((countResult == 1), "Login count correct.", "Login count failed: http://dummyhost.mozilla.org + no forms + Test REALM3 = " + countResult + ". Should be 1", false); //4
*/

var rootGroup = this._kfilm.getRootGroup();
this._KeeFoxAssert((rootGroup.uniqueID != null), "root group found.", "root group could not be found.", false);

//TODO: find the uniqueID of user 1! make addLogin return new login object?

//alert(testuser1login.uniqueID);
//alert(rootGroup.uniqueID);

var parentTest = this._kfilm.getParentGroup(testuser1login.uniqueID);
this._KeeFoxAssert((parentTest.uniqueID == testgroup1.uniqueID), "testuser1 parent group is correct.", "testuser1 parent group is wrong", false);

parentTest = this._kfilm.getParentGroup(testgroup1.uniqueID);
this._KeeFoxAssert((parentTest.uniqueID == rootGroup.uniqueID), "testgroup1 parent group is correct.", "testgroup1 parent group is wrong", false);


var foundGroups = this._kfilm.getChildGroups({}, rootGroup.uniqueID);
this._KeeFoxAssert((foundGroups.length == 7), "root group has correct number of child groups", "Number of groups directly under root group is wrong. It is " + foundGroups.length + " but should be 7.", false);

foundGroups = this._kfilm.getChildGroups({}, testgroup1.uniqueID);
this._KeeFoxAssert((foundGroups.length == 0), "testgroup1 has correct number of child groups", "Number of groups directly under testgroup1 is wrong. It is " + foundGroups.length + " but should be 0.", false);

var foundLogins = this._kfilm.getChildEntries({}, rootGroup.uniqueID);
this._KeeFoxAssert((foundLogins.length == 3), "root group has correct number of child entries", "Number of entries directly under root group is wrong. It is " + foundLogins.length + " but should be 3.", false);

foundLogins = this._kfilm.getChildEntries({}, testgroup1.uniqueID);
this._KeeFoxAssert((foundLogins.length == 3), "testgroup1 has correct number of child entries", "Number of entries directly under testgroup1 is wrong. It is " + foundLogins.length + " but should be 3.", false);

this._kfilm.removeLogin(testuser1login.uniqueID);
countResult = this._kfilm.countLogins("https://oyster.tfl.gov.uk", "", null);
        this._KeeFoxAssert((countResult == 1), "Login count correct.", "Login count failed: https://oyster.tfl.gov.uk after testuser1 deleted = " + countResult + ". Should be 1", false);

this._kfilm.removeGroup(testgroup1.uniqueID);

logins = this._kfilm.getAllLogins({});
        this._KeeFoxAssert((logins.length == 3), "Group deleted OK", "Something went wrong with the removal of testgroup1. Found " + logins.length + " logins but expected 3.", true);
 


        if (this._KeeFoxTestErrorOccurred)
        {
            this.error("Some tests failed.");
            throw new Error("Some assertions failed.");
        }
    }
  }
