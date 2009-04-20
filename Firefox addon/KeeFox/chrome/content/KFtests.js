/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
  This is a set of KeeFox javascript tests.
  It will mainly be used for development but may also be useful for end user
  debugging guidance

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
    
    // TODO: pass in other window specific objects so we can run some further, more UI orientated, tests.
    // to more effectively represent real world situations
    do_tests: function() {

      //  keeFoxInst._keeFoxExtension.prefs.setValue("notifyBarWhenLoggedOut",!keeFoxInst._keeFoxExtension.prefs.getValue("notifyBarWhenLoggedOut",true));
       // keeFoxInst._keeFoxExtension.prefs.setValue("notifyBarWhenKeeICEInactive",!keeFoxInst._keeFoxExtension.prefs.getValue("notifyBarWhenKeeICEInactive",true));
        
 //       keeFoxInst._keeFoxExtension.prefs.setValue("notifyBarWhenLoggedOut",true);
 //       keeFoxInst._keeFoxExtension.prefs.setValue("notifyBarWhenKeeICEInactive",true);

//keeFoxToolbar._currentWindow.setTimeout(keeFoxToolbar.flashItem, 10, keeFoxToolbar._currentWindow.document.getElementById('KeeFox_RunSelfTests-Button'), 12, keeFoxToolbar._currentWindow);
//return;

        this.log("Constructing kfILoginInfo interface");

        var kfLoginInfo = new Components.Constructor(
                      "@christomlinson.name/kfLoginInfo;1",
                      Components.interfaces.kfILoginInfo);

        if (kfLoginInfo == null) { this.log("Could not construct kfILoginInfo. KeeFox may need to be re-installed."); throw "noLoginInfo"; }

        this.log("Constructing kfIGroupInfo interface");

        var kfIGroupInfo = new Components.Constructor(
                      "@christomlinson.name/kfGroupInfo;1",
                      Components.interfaces.kfIGroupInfo);

        if (kfIGroupInfo == null) { this.log("Could not construct kfIGroupInfo. KeeFox may need to be re-installed."); throw "noGroupInfo"; }

        this.log("Preparing test groups");

       // var testgroup1 = {};// = new kfGroupInfo;
        //testgroup1.init("Test Group", null);
        var testgroup1 = this._kfilm.addGroup("Test Group", null);
//alert("test");
//alert(testgroup1.uniqueID);
//return;
        this.log("Preparing test users");

        var testuser1 = new kfLoginInfo;
        testuser1.initCustom("https://oyster.tfl.gov.uk", "https://oyster.tfl.gov.uk", null,
      "abcdefghijklmnopqrstuvwxy", "abcdefghijklmnopqrstuvwxy", "j_username", "j_password", null, "Test title 1",
      keeFoxInst.kfLoginInfoCustomFieldsWrapper("username id","cvalue1","password id","cvalue2")); // https://oyster.tfl.gov.uk/oyster/entry.do/ku

        var testuser2 = new kfLoginInfo;
        testuser2.init("https://oyster.tfl.gov.uk/oyster/entry.do", "https://third.party.form.submit.url/including/path/and/file.cgi", null,
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "put_user2_here", "put_pw2_here", null, "Test title 2");

        var testuser3 = new kfLoginInfo;
        testuser3.init("http://dummyhost.mozilla.org", null, "Test REALM3",
      "dummydude2", "itsasecret2", "uf3", "pf3", null, "Test title 3");

        var testuser4 = new kfLoginInfo;
        testuser4.init("http://dummyhost.mozilla.org/full/url.php", "https://third.party.form.submit.url/including/path/and/file.cgi", null,
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!\"£$%^&*()-_=+{}~@:[]#';/.,?><|\¬`¦u4", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!\"£$%^&*()-_=+{}~@:[]#';/.,?><|\¬`¦p4", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!\"£$%^&*()-_=+{}~@:[]#';/.,?><|\¬`¦uf4", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!\"£$%^&*()-_=+{}~@:[]#';/.,?><|\¬`¦pf4", null, "Test title 4");

        var testuser5 = new kfLoginInfo;
        testuser5.initCustom("http://dummyhost.mozilla.org/full/url.php", "https://third.party.form.submit.url/including/path/and/file.cgi", null,
      "abcdefghijklmnopqr", "abcdefghijklmnopqr", "abcdefghijklmnopqr", "abcdefghijklmnopqr", null, "Test title 5",keeFoxInst.kfLoginInfoCustomFieldsWrapper("custom1","cvalue1","custom2","cvalue2"));

        var testuser6 = new kfLoginInfo;
        testuser6.initCustom("http://dummyhost.mozilla.org/full/url.php", "https://third.party.form.submit.url/including/path/and/file.cgi", null,
      "abcdefghijklmnopqr", "abcdefghijklmnopqr", "abcdefghijklmnopqr", "abcdefghijklmnopqr", null, "Test title 6",keeFoxInst.kfLoginInfoCustomFieldsWrapper("custom1","cvalue1","custom2","cvalue2"));

        var testuser7 = new kfLoginInfo;
        testuser7.initCustom("http://dummyhost.mozilla.org/full/url.php", "https://third.party.form.submit.url/including/path/and/file.cgi", null,
      "abcdefghijklmnopqr7", "abcdefghijklmnopqr7", "abcdefghijklmnopqr7", "abcdefghijklmnopqr7", null, "Test title 7",keeFoxInst.kfLoginInfoCustomFieldsWrapper("custom1","cvalue1","custom2","cvalue2"));

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



        var logins = this._kfilm.getAllLogins({});
        this._KeeFoxAssert((logins.length == 0), "Using empty database - good", "KeePass is not loaded with an empty database. Please fix this before re-running the tests", true);

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

        countResult = this._kfilm.countLogins("https://oyster.tfl.gov.uk", "https://oyster.tfl.gov.uk", null);
        this._KeeFoxAssert((countResult == 1), "Login count correct.", "Login count failed: https://oyster.tfl.gov.uk + https://oyster.tfl.gov.uk + no HTTP realm = " + countResult + ". Should be 1", false);

        countResult = this._kfilm.countLogins("https://oyster.tfl.gov.uk", "https://third.party.form.submit.url", null);
        this._KeeFoxAssert((countResult == 1), "Login count correct.", "Login count failed: https://oyster.tfl.gov.uk + https://third.party.form.submit.url + no HTTP realm = " + countResult + ". Should be 1", false);

        countResult = this._kfilm.countLogins("", "https://third.party.form.submit.url", null);
        this._KeeFoxAssert((countResult == 4), "Login count correct.", "Login count failed: any host + https://third.party.form.submit.url + no HTTP realm = " + countResult + ". Should be 4", false);

        countResult = this._kfilm.countLogins("https://oyster.tfl.gov.uk", null, "some incorrect realm");
        this._KeeFoxAssert((countResult == 0), "Login count correct.", "Login count failed: https://oyster.tfl.gov.uk + no forms + invalid HTTP realm = " + countResult + ". Should be 0", false);

        countResult = this._kfilm.countLogins("", null, "some incorrect realm");
        this._KeeFoxAssert((countResult == 0), "Login count correct.", "Login count failed: any host + no forms + invalid HTTP realm = " + countResult + ". Should be 0", false);

        countResult = this._kfilm.countLogins("", null, "Test REALM3");
        this._KeeFoxAssert((countResult == 1), "Login count correct.", "Login count failed: any host + no forms + Test REALM3 = " + countResult + ". Should be 1", false);

        countResult = this._kfilm.countLogins("http://dummyhost.mozilla.org", "https://third.party.form.submit.url", null);
        this._KeeFoxAssert((countResult == 3), "Login count correct.", "Login count failed: http://dummyhost.mozilla.org + https://third.party.form.submit.url + no HTTP realm = " + countResult + ". Should be 3", false);

        countResult = this._kfilm.countLogins("http://dummyhost.mozilla.org", "", null);
        this._KeeFoxAssert((countResult == 3), "Login count correct.", "Login count failed: http://dummyhost.mozilla.org + any form + no HTTP realm = " + countResult + ". Should be 3", false);

        countResult = this._kfilm.countLogins("http://dummyhost.mozilla.org", null, "Test REALM3");
        this._KeeFoxAssert((countResult == 1), "Login count correct.", "Login count failed: http://dummyhost.mozilla.org + no forms + Test REALM3 = " + countResult + ". Should be 1", false);


var rootGroup = this._kfilm.getRootGroup();
this._KeeFoxAssert((rootGroup.uniqueID != null), "root group found.", "root group could not be found.", false);

//TODO: find the uniqueID of user 1! make addLogin return new login object?

alert(testuser1login.uniqueID);
alert(rootGroup.uniqueID);

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