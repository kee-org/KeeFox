/*
  KeeICE - Uses ICE to provide IPC facilities to KeePass. (http://www.zeroc.com)
  Example usage includes the KeeFox firefox extension.
  
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

using System;
using System.Collections.Generic;
using System.Collections;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using System.Diagnostics;
using System.Threading;
using System.IO;


using KeePass.Plugins;
using KeePass.Forms;
using KeePass.Resources;

using KeePassLib;
using KeePassLib.Security;

namespace KeeICE
{
    public class KPI : KFlib.KPDisp_
    {
        const float minClientVersion = 0.4F; // lowest version of client we're prepared to communicate with
        const float keeICEVersion = 0.4F; // version of this build

        IPluginHost host;
        bool isDirty = false;
        bool permitUnencryptedURLs = false;
        internal static EventWaitHandle ensureDBisOpenEWH = new AutoResetEvent(false);

        private Ice.Communicator _communicator;
        private bool _destroy;
        private ArrayList _clients;

        public override string getDatabaseName(Ice.Current current__)
        {

            return host.Database.Name;
        }

        /// <summary>
        /// checks version of client and server are compatible. Currently just a basic old vs new check
        /// but could be expanded to add more complex ranges of allowed versions if required - e.g. if
        /// other clients apart from KeeFox start using KeeICE we my need to tweak things a bit to keep all
        /// versions of all clients working correctly.
        /// </summary>
        /// <param name="clientVersion">version of client making the request</param>
        /// <param name="minKeeICEVersion">lowest version of server that client is prepared to work with</param>
        /// <param name="result">0 if version check OK, 1 if client is too old, -1 if we (server) are too old</param>
        /// <param name="current__"></param>
        /// <returns>true unless something went wrong</returns>
        public override bool checkVersion(float clientVersion, float minKeeICEVersion, out int result, Ice.Current current__)
        {
            if (minClientVersion > clientVersion)
                result = 1;
            else if (minKeeICEVersion > keeICEVersion)
                result = -1;
            else
                result = 0;
            return true; // unless something went wrong
        }

        public KPI(IPluginHost host,Ice.Communicator communicator)
        {
            this.host = host;
            _communicator = communicator;
            _destroy = false;
            _clients = new ArrayList();
        }

        /*
        public void Run()
        {
            int num = 0;
            while(true)
            {
                ArrayList clients;
                lock(this)
                {
                    System.Threading.Monitor.Wait(this, 2000);
                    if(_destroy)
                    {
                        break;
                    }

                    clients = new ArrayList(_clients);
                }

                if(clients.Count > 0)
                {
                    ++num;
                    foreach (KeeICE.KFlib.CallbackReceiverPrx c in clients)
                    {
                        try
                        {
                            c.callback(num);
                        }
                        catch(Ice.LocalException ex)
                        {
                            Console.Error.WriteLine("removing client `" +
                                                    _communicator.identityToString(c.ice_getIdentity()) + "':\n" + ex);

                            lock(this)
                            {
                                _clients.Remove(c);
                            }
                        }
                    }
                }
            }
        }
         * 
         * */

        public void issueICEClientCallbacks(int num)
        {
            
            ArrayList clients;
            lock (this)
            {
                clients = new ArrayList(_clients);
            }

            if (clients.Count > 0)
            {
                foreach (KeeICE.KFlib.CallbackReceiverPrx c in clients)
                {
                    try
                    {
                        c.callback(num);
                    }
                    catch (Ice.LocalException ex)
                    {
                        Console.Error.WriteLine("removing client `" +
                                                _communicator.identityToString(c.ice_getIdentity()) + "':\n" + ex);

                        lock (this)
                        {
                            _clients.Remove(c);
                        }
                    }
                }
            }
           
        }

        public override void addClient(Ice.Identity ident, Ice.Current current)
        {
            lock (this)
            {
                System.Console.Out.WriteLine("adding client `" + _communicator.identityToString(ident) + "'");

                Ice.ObjectPrx @base = current.con.createProxy(ident);
                KeeICE.KFlib.CallbackReceiverPrx client = KeeICE.KFlib.CallbackReceiverPrxHelper.uncheckedCast(@base);
                _clients.Add(client);
            }
        }



        

        public void destroy()
        {
            lock(this)
            {
                System.Console.Out.WriteLine("destroying callback sender");
                _destroy = true;
                
                System.Threading.Monitor.Pulse(this);
            }
        }


        /// <summary>
        /// halts thread until a DB is open in the KeePass application
        /// </summary>
        private void ensureDBisOpen() {
        
            if (!host.Database.IsOpen)
            {    //TODO: this simple thread sync won't work if more than one ICE client gets invovled

                ensureDBisOpenEWH.Reset(); // ensures we will wait even if DB has been opened previously.
                // maybe tiny opportunity for deadlock if user opens DB exactly between DB.IsOpen and this statement?
                //MessageBox.Show("please open a DB [TODO: make this more useful than a simple error message]. KeeICE disabled until DB is opened.");
                host.MainWindow.Invoke(new MethodInvoker(promptUserToOpenDB)); 
                ensureDBisOpenEWH.WaitOne(); // wait until DB has been opened
                // double check above runs before Invoked method finishes...

                //TODO: messy when firefox makes request during keepass startup - UI not created yet but this thread locks it so it will never appear until user creates DB - catch 22 in most cases
                // really?

            
            }
        }

        void promptUserToOpenDB()
        {
            /*
             * I think this form would be used to choose a different file to open but haven't tried it.
             * At least for now, the MRU file is the only option we'll tightly integrate with KeeICE
             * If user is advanced enough to know about multiple databases, etc. they can quit this
             * function and open their database via usual KeePass methods
             * 
            KeePass.Forms.IOConnectionForm form1 = new IOConnectionForm();
            form1.InitEx();
            
            */
            
            // set to true whenever we're ready to relinquish control back to the main KeePass app
            bool promptAborted = false;

            while (!promptAborted)
            {
                KeePass.Forms.KeyPromptForm keyPromptForm = new KeyPromptForm();
                keyPromptForm.InitEx(KeePass.Program.Config.Application.LastUsedFile.Path, false);
                DialogResult res = keyPromptForm.ShowDialog(); // TODO: how to set the "currently active" window?

                if (res == DialogResult.OK)
                {
                    if (keyPromptForm.CompositeKey == null)
                        promptAborted = true;
                    else
                    {
                        KeePass.Program.MainForm.OpenDatabase(KeePass.Program.Config.Application.LastUsedFile, keyPromptForm.CompositeKey,false);
                        if (KeePass.Program.MainForm.IsAtLeastOneFileOpen())
                            promptAborted = true;
                    }
                    // do we need to do something like this at some point in this function?
                    //host.MainWindow.UpdateUI(false, null, true, null, true, null, true);
                } else if (res == DialogResult.Cancel)
                {
                    DialogResult openMRUresult = MessageBox.Show("Please open a database. Applications like KeeFox may remain paused until you do so. Would you like to try to open your most recently used password database?","Open a database",MessageBoxButtons.YesNo);
                   if (openMRUresult != DialogResult.Yes)
                       promptAborted = true;
               }
            }
        }

        public override void AddLogin(KFlib.KPEntry login, Ice.Current current__)
        {
            // Make sure there is an active database
            ensureDBisOpen();

            PwEntry newLogin = new PwEntry(true,true);

            foreach (KFlib.KPFormField kpff in login.formFieldList)
            {
                if (kpff.type == KeeICE.KFlib.formFieldType.FFTpassword)
                {
                    newLogin.Strings.Set("Password", new ProtectedString(host.Database.MemoryProtection.ProtectPassword, kpff.value));
                    newLogin.Strings.Set("Form field " + kpff.name + " type", new ProtectedString(false, "password"));
                }
                else if (kpff.type == KeeICE.KFlib.formFieldType.FFTusername)
                {
                    newLogin.Strings.Set("UserName", new ProtectedString(host.Database.MemoryProtection.ProtectUserName, kpff.value));
                    newLogin.Strings.Set("Form field " + kpff.name + " type", new ProtectedString(false, "username"));
                }
                //TODO: other field types
            }

            newLogin.Strings.Set("URL", new ProtectedString(host.Database.MemoryProtection.ProtectUrl, login.hostName));
            newLogin.Strings.Set("Form match URL", new ProtectedString(false, login.formURL));
            newLogin.Strings.Set("Form HTTP realm", new ProtectedString(false, login.HTTPRealm));

            // Set some of the string fields
            newLogin.Strings.Set(PwDefs.TitleField, new ProtectedString(false, login.title));

            host.Database.RootGroup.AddEntry(newLogin, true);

            

            //_app.Invoke;
            host.MainWindow.Invoke(new MethodInvoker(DoStuffOnUI));
            

            //host.Database.Save(KeePassLib.Interfaces.LogStatusType.AdditionalInfo);
        }


void DoStuffOnUI()
{
    KeePassLib.Interfaces.IStatusLogger logger = new Log();
    host.Database.Save(logger);
    host.MainWindow.UpdateUI(false, null, true, null, true, null, true);
}


        public override void ModifyLogin(KFlib.KPEntry oldLogin, KFlib.KPEntry newLogin, Ice.Current current__)
        {
            // Make sure there is an active database
            ensureDBisOpen();
        }

        public override int getAllLogins(out KFlib.KPEntry[] logins, Ice.Current current__)
        {
            int count = 0;
            ArrayList allEntries = new ArrayList();

            // Make sure there is an active database
            ensureDBisOpen();

            KeePassLib.Collections.PwObjectList<PwEntry> output;
            output = host.Database.RootGroup.GetEntries(true);
            //host.Database.RootGroup.
            foreach (PwEntry pwe in output)
            {
                //pwe.
                ArrayList formFieldList = new ArrayList(); // why 8?!!
                //host.Database.IOConnectionInfo.
                foreach (System.Collections.Generic.KeyValuePair
                    <string, KeePassLib.Security.ProtectedString> pwestring in pwe.Strings)
                {
                    string pweKey = pwestring.Key;
                    string pweValue = pwestring.Value.ReadString();

                    if (pweKey.StartsWith("Form field ") && pweKey.EndsWith(" type") && pweKey.Length > 16)
                    {
                        string fieldName = pweKey.Substring(11).Substring(0, pweKey.Length - 11 - 5);

                        if (pweValue == "password")
                        {
                            formFieldList.Add(new KFlib.KPFormField(fieldName,
                    "Password", pwe.Strings.ReadSafe("Password"), KFlib.formFieldType.FFTpassword));
                        }
                        else if (pweValue == "username")
                        {
                            formFieldList.Add(new KFlib.KPFormField(fieldName,
                    "User name", pwe.Strings.ReadSafe("UserName"), KFlib.formFieldType.FFTusername));
                        }
                        else if (pweValue == "text")
                        {
                            formFieldList.Add(new KFlib.KPFormField(fieldName,
                    "Unknown display (not supported yet)", pwe.Strings.ReadSafe("Form field " + fieldName + " value"), KFlib.formFieldType.FFTtext));
                        }
                        else if (pweValue == "radio")
                        {
                            formFieldList.Add(new KFlib.KPFormField(fieldName,
                    "Unknown display (not supported yet)", pwe.Strings.ReadSafe("Form field " + fieldName + " value"), KFlib.formFieldType.FFTradio));
                        }
                        else if (pweValue == "select")
                        {
                            formFieldList.Add(new KFlib.KPFormField(fieldName,
                    "Unknown display (not supported yet)", pwe.Strings.ReadSafe("Form field " + fieldName + " value"), KFlib.formFieldType.FFTselect));
                        }
                        else if (pweValue == "checkbox")
                        {
                            formFieldList.Add(new KFlib.KPFormField(fieldName,
                    "Unknown display (not supported yet)", pwe.Strings.ReadSafe("Form field " + fieldName + " value"), KFlib.formFieldType.FFTcheckbox));
                        }
                    }


                    
                }

                KFlib.KPFormField[] temp = (KFlib.KPFormField[])formFieldList.ToArray(typeof(KFlib.KPFormField));
                KFlib.KPEntry kpe = new KFlib.KPEntry(pwe.Strings.ReadSafe("URL"), pwe.Strings.ReadSafe("Form match URL"), pwe.Strings.ReadSafe("Form HTTP realm"), pwe.Strings.ReadSafe("title"), temp, false, false);
                allEntries.Add(kpe);
                count++;

            }

            logins = (KFlib.KPEntry[])allEntries.ToArray(typeof(KFlib.KPEntry));

            return count;
        }

        public override int findLogins(string hostname, string actionURL, string httpRealm, KFlib.loginSearchType lst, bool requireFullURLMatches, out KFlib.KPEntry[] logins, Ice.Current current__)
        {
            string fullURL = hostname;
            string fullActionURL = actionURL;

            // make sure that hostname and actionURL always represent only the hostname portion
            // of the URL
            int protocolIndex = hostname.IndexOf("://");
            if (protocolIndex > -1)
            {
                string hostAndPort = hostname.Substring(protocolIndex + 3);
                int pathStart = hostAndPort.IndexOf("/", 0);
                if (pathStart > -1 && hostAndPort.Length > pathStart)
                {
                    hostname = hostname.Substring(0, pathStart + protocolIndex + 3);
                }
            }

            protocolIndex = actionURL.IndexOf("://");
            if (protocolIndex > -1)
            {
                string actionURLAndPort = actionURL.Substring(protocolIndex + 3);
                int pathStart = actionURLAndPort.IndexOf("/", 0);
                if (pathStart > -1 && actionURLAndPort.Length > pathStart)
                {
                    actionURL = actionURL.Substring(0, pathStart + protocolIndex + 3);
                }
            }


            int count = 0;
            ArrayList allEntries = new ArrayList();

            // Make sure there is an active database
            ensureDBisOpen();

            SearchParameters sp = new SearchParameters();
            sp.SearchInUrls = true;
            sp.RegularExpression = true;
            if (hostname.Length == 0)
                sp.SearchString = ".*";
            else if (requireFullURLMatches)
                sp.SearchString = System.Text.RegularExpressions.Regex.Escape(fullURL);
            else
                sp.SearchString = System.Text.RegularExpressions.Regex.Escape(hostname);

            KeePassLib.Collections.PwObjectList<PwEntry> output;
            output = new KeePassLib.Collections.PwObjectList<PwEntry>();
            host.Database.RootGroup.SearchEntries(sp, output);
            foreach (PwEntry pwe in output)
            {
                bool entryIsAMatch = false;
                bool entryIsAnExactMatch = false;

                if (pwe.Strings.Exists("Form match URL") && pwe.Strings.ReadSafe("Form match URL").Length > 0
                        && lst != KFlib.loginSearchType.LSTnoForms
                        && (actionURL == "" || pwe.Strings.ReadSafe("Form match URL").Contains(actionURL)))
                {
                    if (pwe.Strings.ReadSafe("Form match URL") == fullActionURL && pwe.Strings.ReadSafe("URL") == fullURL)
                    {
                        entryIsAnExactMatch = true;
                        entryIsAMatch = true;
                    }
                    else if (!requireFullURLMatches)
                        entryIsAMatch = true;
                }

                if (pwe.Strings.Exists("Form HTTP realm") && pwe.Strings.ReadSafe("Form HTTP realm").Length > 0
                    && lst != KFlib.loginSearchType.LSTnoRealms
                    && (httpRealm == "" || pwe.Strings.ReadSafe("Form HTTP realm") == httpRealm))
                {
                    if (pwe.Strings.ReadSafe("URL") == fullURL)
                    {
                        entryIsAnExactMatch = true;
                        entryIsAMatch = true;
                    }
                    else if (!requireFullURLMatches)
                        entryIsAMatch = true;
                }

                if (entryIsAMatch)
                {
                    ArrayList formFieldList = new ArrayList();

                    foreach (System.Collections.Generic.KeyValuePair
                        <string, KeePassLib.Security.ProtectedString> pwestring in pwe.Strings)
                    {
                        string pweKey = pwestring.Key;
                        string pweValue = pwestring.Value.ReadString();

                        if (pweKey.StartsWith("Form field ") && pweKey.EndsWith(" type") && pweKey.Length > 16)
                        {
                            string fieldName = pweKey.Substring(11).Substring(0, pweKey.Length - 11 - 5);

                            if (pweValue == "password")
                            {
                                formFieldList.Add(new KFlib.KPFormField(fieldName,
                        "Password", pwe.Strings.ReadSafe("Password"), KFlib.formFieldType.FFTpassword));
                            }
                            else if (pweValue == "username")
                            {
                                formFieldList.Add(new KFlib.KPFormField(fieldName,
                        "User name", pwe.Strings.ReadSafe("UserName"), KFlib.formFieldType.FFTusername));
                            }
                            else if (pweValue == "text")
                            {
                                formFieldList.Add(new KFlib.KPFormField(fieldName,
                        "Unknown display (not supported yet)", pwe.Strings.ReadSafe("Form field " + fieldName + " value"), KFlib.formFieldType.FFTtext));
                            }
                            else if (pweValue == "radio")
                            {
                                formFieldList.Add(new KFlib.KPFormField(fieldName,
                        "Unknown display (not supported yet)", pwe.Strings.ReadSafe("Form field " + fieldName + " value"), KFlib.formFieldType.FFTradio));
                            }
                            else if (pweValue == "select")
                            {
                                formFieldList.Add(new KFlib.KPFormField(fieldName,
                        "Unknown display (not supported yet)", pwe.Strings.ReadSafe("Form field " + fieldName + " value"), KFlib.formFieldType.FFTselect));
                            }
                            else if (pweValue == "checkbox")
                            {
                                formFieldList.Add(new KFlib.KPFormField(fieldName,
                        "Unknown display (not supported yet)", pwe.Strings.ReadSafe("Form field " + fieldName + " value"), KFlib.formFieldType.FFTcheckbox));
                            }
                        }

                    }
                    KFlib.KPFormField[] temp = (KFlib.KPFormField[])formFieldList.ToArray(typeof(KFlib.KPFormField));
                    KFlib.KPEntry kpe = new KFlib.KPEntry(pwe.Strings.ReadSafe("URL"), pwe.Strings.ReadSafe("Form match URL"), pwe.Strings.ReadSafe("Form HTTP realm"), pwe.Strings.ReadSafe("title"), temp, false, entryIsAnExactMatch);
                    allEntries.Add(kpe);
                    count++;
                }

            }

            logins = (KFlib.KPEntry[])allEntries.ToArray(typeof(KFlib.KPEntry));

            return count;
        }


        public override int countLogins(string hostname, string actionURL, string httpRealm, KFlib.loginSearchType lst, bool requireFullURLMatches, Ice.Current current__)
        {
            string fullURL = hostname;
            string fullActionURL = actionURL;

            // make sure that hostname and actionURL always represent only the hostname portion
            // of the URL

            int protocolIndex = hostname.IndexOf("://");
            if (protocolIndex > -1)
            {
                string hostAndPort = hostname.Substring(protocolIndex + 3);
                int pathStart = hostAndPort.IndexOf("/", 0);
                if (pathStart > -1 && hostAndPort.Length > pathStart)
                {
                    hostname = hostname.Substring(0, pathStart + protocolIndex + 3);
                }
            }

            protocolIndex = actionURL.IndexOf("://");
            if (protocolIndex > -1)
            {
                string actionURLAndPort = actionURL.Substring(protocolIndex + 3);
                int pathStart = actionURLAndPort.IndexOf("/", 0);
                if (pathStart > -1 && actionURLAndPort.Length > pathStart)
                {
                    actionURL = actionURL.Substring(0, pathStart + protocolIndex + 3);
                }
            }

            int count = 0;
            ArrayList allEntries = new ArrayList();

            if (permitUnencryptedURLs)
            {

                //TODO: how to ensure text file and KP DB stay in sync? use an onSave event?
                // what about if plugin unregistered for a while? their own fault? do need a way to
                // reset though

                string fileName = @"c:\temp\firefoxKeePURLs.txt";

                // Open the text file
                using (StreamReader sr = new StreamReader(fileName))
                {
                    //string fileURL = "";

                    string line;

                    while ((line = sr.ReadLine()) != null)
                    {
                        //TODO: handle URLs containing commas
                        string[] lineContents = line.Split(',');//(",",3,System.StringSplitOptions.None);
                        if (lineContents.Length != 3) // ignore invalid line entry
                            continue;

                        allEntries.Add(lineContents);
                    }
                    sr.Close();
                }

                foreach (string[] entry in allEntries)
                {
                    if (hostname == "") // match every line entry
                    {
                        count++;
                        continue;
                    }

                    if (entry[0].Contains(hostname)) //TODO: regex for accuracy
                    {
                        if (entry[1] != null && entry[1].Length > 0 && lst == KFlib.loginSearchType.LSTnoForms)
                        {	// ignoring all form logins
                        }
                        else if (entry[1] != null && entry[1].Length > 0 && actionURL == "")
                        // match every form login
                        {
                            count++;
                            continue;
                        }
                        else if (entry[1] == actionURL)
                        {
                            count++;
                            continue;
                        }

                        if (entry[2] != null && entry[2].Length > 0 && lst == KFlib.loginSearchType.LSTnoRealms)
                        {	// ignoring all http realm logins
                        }
                        else if (entry[2] != null && entry[2].Length > 0 && httpRealm == "")
                        // match every http realm login
                        {
                            count++;
                            continue;
                        }
                        else if (entry[2] == httpRealm)
                        {
                            count++;
                            continue;
                        }
                    }

                }
            }
            else
            {
                // Make sure there is an active database
                ensureDBisOpen();

                SearchParameters sp = new SearchParameters();
                sp.SearchInUrls = true;
                sp.RegularExpression = true;
                if (hostname.Length == 0)
                    sp.SearchString = ".*";
                else if (requireFullURLMatches)
                    sp.SearchString = System.Text.RegularExpressions.Regex.Escape(fullURL);
                else
                    sp.SearchString = System.Text.RegularExpressions.Regex.Escape(hostname);

                KeePassLib.Collections.PwObjectList<PwEntry> output;
                output = new KeePassLib.Collections.PwObjectList<PwEntry>();
                host.Database.RootGroup.SearchEntries(sp, output);
                foreach (PwEntry pwe in output)
                {
                    bool entryIsAMatch = false;
                    bool entryIsAnExactMatch = false;

                    if (pwe.Strings.Exists("Form match URL") && pwe.Strings.ReadSafe("Form match URL").Length > 0
                        && lst != KFlib.loginSearchType.LSTnoForms
                        && (actionURL == "" || pwe.Strings.ReadSafe("Form match URL").Contains(actionURL)))
                    {
                        if (pwe.Strings.ReadSafe("Form match URL") == fullActionURL && pwe.Strings.ReadSafe("URL") == fullURL)
                        {
                            entryIsAnExactMatch = true;
                            entryIsAMatch = true;
                        }
                        else if (!requireFullURLMatches)
                            entryIsAMatch = true;
                    }

                    if (pwe.Strings.Exists("Form HTTP realm") && pwe.Strings.ReadSafe("Form HTTP realm").Length > 0
                        && lst != KFlib.loginSearchType.LSTnoRealms
                        && (httpRealm == "" || pwe.Strings.ReadSafe("Form HTTP realm") == httpRealm))
                    {
                        if (pwe.Strings.ReadSafe("URL") == fullURL)
                        {
                            entryIsAnExactMatch = true;
                            entryIsAMatch = true;
                        }
                        else if (!requireFullURLMatches)
                            entryIsAMatch = true;
                    }

                    if (entryIsAMatch)
                        count++;


                }
            }


            return count;
        }
    }
}
















    