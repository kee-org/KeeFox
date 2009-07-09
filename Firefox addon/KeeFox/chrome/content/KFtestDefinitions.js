/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
  This are the KeeFox tests. You can add new tests to your local copy of this file
  and/or submit new tests to the central source code repository. More details
  about the format of the objects in this file and about testing in general can be found online... (eventually)

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

To add new tests:
Add any new data you want to use to the relevant section below
Add any new tests you want to run and the expected results

*/

function KFgetTestUsers()
{
    var logService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
        
    logService.logStringMessage("Constructing kfILoginInfo interface");

    var kfLoginInfo = new Components.Constructor(
                      "@christomlinson.name/kfLoginInfo;1",
                      Components.interfaces.kfILoginInfo);

    if (kfLoginInfo == null)
    { 
        logService.logStringMessage("Could not construct kfILoginInfo. KeeFox may need to be re-installed.");
        throw "noLoginInfo";
    }
    
    
    logService.logStringMessage("Initialising test users");

    var testusers = [];

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
/*
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

    return testusers;
}

function getTestGroups()
{



}


function getTestBatches(defaultKeePassGroupCount) {

    var testbatch = [];

    ////////////////////////////////////////////////////////
    // Configure a test batch:
    // (Find the KeePass root group)
    testbatch[testbatch.length] = {
        tests: null,
        expectedFinalCount: 0,
        status: "unknown",
        result: "unknown"
    };
    testbatch[testbatch.length - 1].tests = [];

    testbatch[testbatch.length - 1].tests[testbatch[testbatch.length - 1].tests.length] = {
        name: "Find the KeePass root group",
        action: "getRootGroup",
        subject1: null,
        subject2: null,
        test: "rootGroupUniqueIDExists",
        expectedValue: 32,
        successMessage: "KeePass root group found",
        failureMessage: "KeePass root group not found",
        abortEntireBatchOnFail: true,
        status: "unknown",
        result: "unknown"
    }


    ////////////////////////////////////////////////////////
    // Configure a test batch:
    // (Basic addition of groups to KeePass)
    testbatch[testbatch.length] = {
        tests: null,
        expectedFinalCount: 0,
        status: "unknown",
        result: "unknown"
    };
    testbatch[testbatch.length - 1].tests = [];

    testbatch[testbatch.length - 1].tests[testbatch[testbatch.length - 1].tests.length] = {
        name: "Add first test group to database",
        action: "addGroup",
        subject1: "Test Group 1", // The name of the group to add
        subject2: null, // The uniqueID of the group's parent group (null = root)
        test: "getChildGroups",
        expectedValue: defaultKeePassGroupCount + 1,
        successMessage: "1st test group added successfully",
        failureMessage: "1st test group couldn't be added to KeePass",
        abortEntireBatchOnFail: true,
        status: "unknown",
        result: "unknown"
    }
    testbatch[testbatch.length - 1].tests[testbatch[testbatch.length - 1].tests.length] = {
        name: "Add second test group to database",
        action: "addGroup",
        subject1: "Test Group 2", // The name of the group to add
        subject2: "EXEC:[[rootGroup.uniqueID]]", // The uniqueID of the group's parent group (null = root)
        test: "getChildGroups",
        expectedValue: defaultKeePassGroupCount + 2,
        successMessage: "2nd test group added successfully",
        failureMessage: "2nd test group couldn't be added to KeePass",
        abortEntireBatchOnFail: true,
        status: "unknown",
        result: "unknown"
    }

    /////////////////////////////////////////////////////
    // Configure a test batch:
    // (Basic addition of logins to KeePass)
    testbatch[testbatch.length] = {
        tests: null,
        expectedFinalCount: 1,
        status: "unknown",
        result: "unknown"
    };
    testbatch[testbatch.length - 1].tests = [];

    testbatch[testbatch.length - 1].tests[testbatch[testbatch.length - 1].tests.length] = {
        name: "Add first test user to database",
        action: "addLogin",
        subject1: "EXEC:[[testusers[0]]]", // The login to add
        subject2: "EXEC:[[testgroups[0].uniqueID]]", // The uniqueID of the login's parent group
        test: "getAllLogins",
        expectedValue: 1,
        successMessage: "1st test login added successfully",
        failureMessage: "1st test login couldn't be added to KeePass",
        abortEntireBatchOnFail: true,
        status: "unknown",
        result: "unknown"
    }

    return attachDatabaseEmptyingBatch(testbatch, defaultKeePassGroupCount);
}


function attachDatabaseEmptyingBatch(testbatch, defaultKeePassGroupCount) {


    //////////////////////////////////////////////////////////////////
    // Configure a test batch:
    // (Removal of all logins and groups from KeePass)
    // This should always be the last test batch so that the database
    // is empty at the end of the test run
    // (but note that there is no error recovery or guarantees that this
    // will be the case - it's just for convenience)
    // You may also want to make a copy of this to insert between batches so you
    // know where you are starting from (but it's possible to build up a string
    // of dependant test batches if you prefer)
    testbatch[testbatch.length] = {
        tests: null,
        expectedFinalCount: 0,
        status: "unknown",
        result: "unknown"
    };
    testbatch[testbatch.length - 1].tests = [];

    testbatch[testbatch.length - 1].tests[testbatch[testbatch.length - 1].tests.length] = {
        name: "Remove all groups from the database",
        action: "deleteAllGroups",
        subject1: null,
        subject2: null,
        test: "getChildGroups",
        expectedValue: defaultKeePassGroupCount, // The "default" groups in KeePass
        successMessage: "All groups removed successfully",
        failureMessage: "Some groups couldn't be removed from KeePass",
        abortEntireBatchOnFail: false,
        status: "unknown",
        result: "unknown"
    }
    testbatch[testbatch.length - 1].tests[testbatch[testbatch.length - 1].tests.length] = {
        name: "Remove all logins from the database",
        action: "deleteAllLogins",
        subject1: null,
        subject2: null,
        test: "getAllLogins",
        expectedValue: 0,
        successMessage: "All logins removed successfully",
        failureMessage: "Some logins couldn't be removed from KeePass",
        abortEntireBatchOnFail: false,
        status: "unknown",
        result: "unknown"
    }

    return testbatch;
}