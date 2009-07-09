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
using KeePassLib.Serialization;

namespace KeeICE
{
    public class KPI : KPlib.KPDisp_
    {

#region Class variables, constructor and destructor

        const float minClientVersion = 0.6F; // lowest version of client we're prepared to communicate with
        const float keeICEVersion = 0.6F; // version of this build

        IPluginHost host;
        bool isDirty = false;
        bool permitUnencryptedURLs = false;
        internal static EventWaitHandle ensureDBisOpenEWH = new AutoResetEvent(false);

        private Ice.Communicator _communicator;
        private bool _destroy;
        private ArrayList _clients;

        Queue q = new Queue();
        TimerCallback timerCallBack;
        System.Threading.Timer timer;

        public KPI(IPluginHost host, Ice.Communicator communicator)
        {
            this.host = host;
            _communicator = communicator;
            _destroy = false;
            _clients = new ArrayList();


            // TODO: can probably come up with something that doesn't need to poll
            // every second but it'll get the job done with relatively little cost
            // so it'll do for now.
            
            //create timer with callback
            timerCallBack =
                new TimerCallback(this.issueICEClientCallbacksReal);
            timer = new System.Threading.Timer(timerCallBack, null,
                TimeSpan.Zero, TimeSpan.FromSeconds(1));
        }

        public void cancelCallbackTimer()
        {
            timer.Dispose();
        }

        public void destroy()
        {
            lock (this)
            {
                System.Console.Out.WriteLine("destroying callback sender");
                _destroy = true;

                System.Threading.Monitor.Pulse(this);
            }
        }
#endregion


#region ICE client management
        public void issueICEClientCallbacks(int num)
        {
            lock (q.SyncRoot)
            {
                q.Enqueue(num);
                if (num == 12)
                {
                    cancelCallbackTimer();
                    issueICEClientCallbacksReal(null);

                }
            }
            

        }

        public void issueICEClientCallbacksReal(Object state)
        {
            //int nextCallbackNum = -1;
            ArrayList callBacks = null;
                    
            lock (q.SyncRoot)
            {
                if (q.Count > 0)
                {
                    callBacks = new ArrayList(q.ToArray());
                    q.Clear();                    
                }
            }

            if (callBacks != null)
            {
                int previousCB = -1;

                foreach (int cb in callBacks)
                {
                    // No point in doing the same thing twice in a row
                    // (although we can't generally make too many assumptions
                    // about the ICE client's requirments, it's pretty safe 
                    // to say that the quantity of callbacks has no relevance)
                    // Maybe one day we can allow specific optimisations
                    // but it's probably best implemented in an ICE client
                    if (cb == previousCB)
                        continue;
                    previousCB = cb;

                    ArrayList clients;
                    lock (this)
                    {
                        clients = new ArrayList(_clients);
                    }

                    if (clients.Count > 0)
                    {
                        foreach (KeeICE.KPlib.CallbackReceiverPrx c in clients)
                        {
                            try
                            {
                                c.callback(cb);
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
            }
           
        }

        public override void addClient(Ice.Identity ident, Ice.Current current)
        {
            lock (this)
            {
                System.Console.Out.WriteLine("adding client `" + _communicator.identityToString(ident) + "'");

                Ice.ObjectPrx @base = current.con.createProxy(ident);
                KeeICE.KPlib.CallbackReceiverPrx client = KeeICE.KPlib.CallbackReceiverPrxHelper.uncheckedCast(@base);
                _clients.Add(client);
            }
        }

#endregion


#region KeePass GUI routines

        /// <summary>
        /// Halts thread until a DB is open in the KeePass application
        /// </summary>
        /// <remarks>This simple thread sync may not work if more than one ICE client gets involved.</remarks>
        private bool ensureDBisOpen() {
        
            if (!host.Database.IsOpen)
            {
                ensureDBisOpenEWH.Reset(); // ensures we will wait even if DB has been opened previously.
                // maybe tiny opportunity for deadlock if user opens DB exactly between DB.IsOpen and this statement?
                // TODO: consider moving above statement to top of method - shouldn't do any harm and could rule out rare deadlock?
                host.MainWindow.BeginInvoke(new MethodInvoker(promptUserToOpenDB)); 
                ensureDBisOpenEWH.WaitOne(15000,false); // wait until DB has been opened

                if (!host.Database.IsOpen)
                    return false;
            }
            return true;
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

            KeePass.Program.MainForm.OpenDatabase(KeePass.Program.Config.Application.LastUsedFile, null, false);

            if (!host.Database.IsOpen)
                KPI.ensureDBisOpenEWH.Set(); // signal that any waiting ICE thread can go ahead
        }

        void saveDB()
        {
            if (host.CustomConfig.GetBool("KeeICE.KeeFox.autoCommit", true))
            {
                //KeePassLib.Interfaces.IStatusLogger logger = new Log();
                //host.Database.Save(logger);
                //host.MainWindow.UpdateUI(false, null, true, null, true, null, false);
                if (host.MainWindow.UIFileSave(true))
                    host.MainWindow.UpdateUI(false, null, true, null, true, null, false);
            }
        }

        void openGroupEditorWindow(PwGroup pg)
        {
            GroupForm gf = new GroupForm();
            gf.InitEx(pg, host.MainWindow.ClientIcons, host.Database);

            gf.BringToFront();
            gf.ShowInTaskbar = true;

            host.MainWindow.Focus();
            gf.TopMost = true;
            gf.Focus();
            gf.Activate();
            if (gf.ShowDialog() == DialogResult.OK)
                saveDB();
                 
        }

        private delegate void dlgOpenGroupEditorWindow(PwGroup pg);

        public override void LaunchGroupEditor(string uuid, Ice.Current current__)
        {
            // Make sure there is an active database
            if (!ensureDBisOpen()) return;

            if (uuid != null && uuid.Length > 0)
            {
                PwUuid pwuuid = new PwUuid(KeePassLib.Utility.MemUtil.HexStringToByteArray(uuid));

                PwGroup matchedGroup = host.Database.RootGroup.FindGroup(pwuuid, true);

                if (matchedGroup == null)
                    throw new Exception("Could not find requested entry.");

                host.MainWindow.Invoke(new dlgOpenGroupEditorWindow(openGroupEditorWindow), matchedGroup );
            }

        }

        void openLoginEditorWindow(PwEntry pe)
        {
            //TODO: focus existing editor window for this login if there is one. Maybe use host.MainWindow.OwnedForms or keep our own list of open forms in this plugin (and destroy them when plugin is destroyed) + same for Group editor
            PwEntryForm ef = new PwEntryForm();
            ef.InitEx(pe, PwEditMode.EditExistingEntry, host.Database, host.MainWindow.ClientIcons, false, false);

            ef.BringToFront();
            ef.ShowInTaskbar = true;
            
            host.MainWindow.Focus();
            ef.TopMost = true;
            ef.Focus();
            ef.Activate();

            if (ef.ShowDialog() == DialogResult.OK)
                saveDB();
        }

        private delegate void dlgOpenLoginEditorWindow(PwEntry pg);

        public override void LaunchLoginEditor(string uuid, Ice.Current current__)
        {
            // Make sure there is an active database
            if (!ensureDBisOpen()) return;

            if (uuid != null && uuid.Length > 0)
            {
                PwUuid pwuuid = new PwUuid(KeePassLib.Utility.MemUtil.HexStringToByteArray(uuid));

                PwEntry matchedLogin = host.Database.RootGroup.FindEntry(pwuuid, true);

                if (matchedLogin == null)
                    throw new Exception("Could not find requested entry.");

                host.MainWindow.Invoke(new dlgOpenLoginEditorWindow(openLoginEditorWindow), matchedLogin);
            }

        }

#endregion


#region Utility functions to convert between KeeICE object schema and KeePass schema

        //TODO: extend this so that PwEntries which lack any username and password can still be used.
        // e.g. if no username custom entry but there is a username in the entry, cerate
        // the custom string field and return the username as normal. similar for password
        private KPlib.KPEntry getKPEntryFromPwEntry(PwEntry pwe, bool isExactMatch)
        {
            ArrayList formFieldList = new ArrayList();
            ArrayList URLs = new ArrayList();
            URLs.Add(pwe.Strings.ReadSafe("URL"));

            foreach (System.Collections.Generic.KeyValuePair
                <string, KeePassLib.Security.ProtectedString> pwestring in pwe.Strings)
            {
                string pweKey = pwestring.Key;
                string pweValue = pwestring.Value.ReadString();

                if (pweKey.StartsWith("Form field ") && pweKey.EndsWith(" type") && pweKey.Length > 16)
                {
                    string fieldName = pweKey.Substring(11).Substring(0, pweKey.Length - 11 - 5);
                    string fieldId = "";
                    int fieldPage = 1;

                    if (pwe.Strings.Exists("Form field " + fieldName + " page"))
                    {
                        try {
                            fieldPage = int.Parse(pwe.Strings.ReadSafe("Form field " + fieldName + " page"));
                        } catch (Exception)
                        {
                            fieldPage = 1;
                        }
                    }


                    if (pwe.Strings.Exists("Form field " + fieldName + " id"))
                        fieldId = pwe.Strings.ReadSafe("Form field " + fieldName + " id");

                    if (pweValue == "password")
                    {
                        // If there is a matching custom string for this password, use that but if not
                        // we can just use the standard entry password.
                        if (pwe.Strings.Exists("Form field " + fieldName + " value"))
                            formFieldList.Add(new KPlib.KPFormField(fieldName,
                "Password", pwe.Strings.ReadSafe("Form field " + fieldName + " value"), KPlib.formFieldType.FFTpassword, fieldId, fieldPage));
                        else
                            formFieldList.Add(new KPlib.KPFormField(fieldName,
                "Password", pwe.Strings.ReadSafe("Password"), KPlib.formFieldType.FFTpassword, fieldId, fieldPage));
                    }
                    else if (pweValue == "username")
                    {
                        formFieldList.Add(new KPlib.KPFormField(fieldName,
                "User name", pwe.Strings.ReadSafe("UserName"), KPlib.formFieldType.FFTusername, fieldId, fieldPage));
                    }
                    else if (pweValue == "text")
                    {
                        formFieldList.Add(new KPlib.KPFormField(fieldName,
                fieldName, pwe.Strings.ReadSafe("Form field " + fieldName + " value"), KPlib.formFieldType.FFTtext, fieldId, fieldPage));
                    }
                    else if (pweValue == "radio")
                    {
                        formFieldList.Add(new KPlib.KPFormField(fieldName,
                fieldName, pwe.Strings.ReadSafe("Form field " + fieldName + " value"), KPlib.formFieldType.FFTradio, fieldId, fieldPage));
                    }
                    else if (pweValue == "select")
                    {
                        formFieldList.Add(new KPlib.KPFormField(fieldName,
                fieldName, pwe.Strings.ReadSafe("Form field " + fieldName + " value"), KPlib.formFieldType.FFTselect, fieldId, fieldPage));
                    }
                    else if (pweValue == "checkbox")
                    {
                        formFieldList.Add(new KPlib.KPFormField(fieldName,
                fieldName, pwe.Strings.ReadSafe("Form field " + fieldName + " value"), KPlib.formFieldType.FFTcheckbox, fieldId, fieldPage));
                    }
                } else if (pweKey == "Alternative URLs")
                {
                    string[] urlsArray = pweValue.Split( new char[' ']);
                    foreach (string altURL in urlsArray)
                        URLs.Add(altURL);

                    //pwe.Strings.ReadSafe("Alternative URLs")

//                    KPAlternativeURLs 

                }

            }

            KPlib.KPFormField[] temp = (KPlib.KPFormField[])formFieldList.ToArray(typeof(KPlib.KPFormField));
            KPlib.KPEntry kpe = new KPlib.KPEntry((string[])URLs.ToArray(typeof(string)), pwe.Strings.ReadSafe("Form match URL"), pwe.Strings.ReadSafe("Form HTTP realm"), pwe.Strings.ReadSafe(PwDefs.TitleField), temp, false, isExactMatch, KeePassLib.Utility.MemUtil.ByteArrayToHexString(pwe.Uuid.UuidBytes));
            return kpe;
        }

        private KPlib.KPGroup getKPGroupFromPwGroup(PwGroup pwg, bool isExactMatch)
        {
            ArrayList formFieldList = new ArrayList();
          
            KPlib.KPGroup kpg = new KPlib.KPGroup(pwg.Name, KeePassLib.Utility.MemUtil.ByteArrayToHexString(pwg.Uuid.UuidBytes));
            return kpg;
        }

        private void setPwEntryFromKPEntry(PwEntry pwe, KPlib.KPEntry login)
        {
            bool firstPasswordFound = false;

            foreach (KPlib.KPFormField kpff in login.formFieldList)
            {
                if (kpff.type == KeeICE.KPlib.formFieldType.FFTpassword && !firstPasswordFound)
                {
                    pwe.Strings.Set("Password", new ProtectedString(host.Database.MemoryProtection.ProtectPassword, kpff.value));
                    pwe.Strings.Set("Form field " + kpff.name + " type", new ProtectedString(false, "password"));
                    firstPasswordFound = true;
                }
                else if (kpff.type == KeeICE.KPlib.formFieldType.FFTpassword)
                {
                    pwe.Strings.Set("Form field " + kpff.name + " value", new ProtectedString(host.Database.MemoryProtection.ProtectPassword, kpff.value)); // we protect this string if user has asked to protect passwords
                    pwe.Strings.Set("Form field " + kpff.name + " type", new ProtectedString(false, "password"));
                }
                else if (kpff.type == KeeICE.KPlib.formFieldType.FFTusername)
                {
                    pwe.Strings.Set("UserName", new ProtectedString(host.Database.MemoryProtection.ProtectUserName, kpff.value));
                    pwe.Strings.Set("Form field " + kpff.name + " type", new ProtectedString(false, "username"));
                }
                else if (kpff.type == KeeICE.KPlib.formFieldType.FFTtext)
                {
                    pwe.Strings.Set("Form field " + kpff.name + " value", new ProtectedString(false, kpff.value));
                    pwe.Strings.Set("Form field " + kpff.name + " type", new ProtectedString(false, "text"));
                }
                else if (kpff.type == KeeICE.KPlib.formFieldType.FFTcheckbox)
                {
                    pwe.Strings.Set("Form field " + kpff.name + " value", new ProtectedString(false, kpff.value));
                    pwe.Strings.Set("Form field " + kpff.name + " type", new ProtectedString(false, "checkbox"));
                }
                else if (kpff.type == KeeICE.KPlib.formFieldType.FFTradio)
                {
                    pwe.Strings.Set("Form field " + kpff.name + " value", new ProtectedString(false, kpff.value));
                    pwe.Strings.Set("Form field " + kpff.name + " type", new ProtectedString(false, "radio"));
                }
                else if (kpff.type == KeeICE.KPlib.formFieldType.FFTselect)
                {
                    pwe.Strings.Set("Form field " + kpff.name + " value", new ProtectedString(false, kpff.value));
                    pwe.Strings.Set("Form field " + kpff.name + " type", new ProtectedString(false, "select"));
                }

                pwe.Strings.Set("Form field " + kpff.name + " page", new ProtectedString(false, kpff.page.ToString()));

                if (kpff.id != null && kpff.id.Length > 0)
                    pwe.Strings.Set("Form field " + kpff.name + " id", new ProtectedString(false, kpff.id));
            }

            string altURLs = "";

            for (int i=0; i < login.URLs.Length; i++)
            {
                string url = login.URLs[i];
                if (i == 0)
                    pwe.Strings.Set("URL", new ProtectedString(host.Database.MemoryProtection.ProtectUrl,url));
                else if (i == 1)
                    altURLs += url;
                else
                    altURLs += " " + url;
            }
            if (altURLs.Length > 0)
                pwe.Strings.Set("Alternative URLs", new ProtectedString(host.Database.MemoryProtection.ProtectUrl, altURLs));

            pwe.Strings.Set("Form match URL", new ProtectedString(host.Database.MemoryProtection.ProtectUrl, login.formActionURL));
            pwe.Strings.Set("Form HTTP realm", new ProtectedString(host.Database.MemoryProtection.ProtectUrl, login.HTTPRealm));

            // Set some of the string fields
            pwe.Strings.Set(PwDefs.TitleField, new ProtectedString(host.Database.MemoryProtection.ProtectTitle, login.title));
        }

#endregion

#region Implementation of KeeICE.ice functions relating to configuration of KeePass/KeeFox and databases

        public override KPlib.KFConfiguration getCurrentKFConfig(Ice.Current current__)
        {
            bool autoCommit = host.CustomConfig.GetBool("KeeICE.KeeFox.autoCommit",true);
            string[] MRUList = new string[host.MainWindow.FileMruList.ItemCount];
            for (uint i = 0; i < host.MainWindow.FileMruList.ItemCount; i++)
                MRUList[i] = ((IOConnectionInfo)host.MainWindow.FileMruList.GetItem(i).Value).Path;

            var currentConfig = new KPlib.KFConfiguration(MRUList, autoCommit);
            return currentConfig;
        }

        public override bool setCurrentKFConfig(KPlib.KFConfiguration config, Ice.Current current__)
        {
            host.CustomConfig.SetBool("KeeICE.KeeFox.autoCommit", config.autoCommit);
            host.MainWindow.SaveConfig();
            
            return true;
        }

        public override bool setCurrentDBRootGroup(string uuid, Ice.Current current__)
        {
            if (!host.Database.IsOpen)
                return false;

            host.Database.CustomData.Set("KeeICE.KeeFox.rootUUID",uuid);
            saveDB();

            return true;
        }


#endregion

#region Implementation of KeeICE.ice functions relating to retrival and manipulation of databases and the KeePass app

        public override string getDatabaseName(Ice.Current current__)
        {
            if (!host.Database.IsOpen)
                return "";
            return (host.Database.Name.Length > 0 ? host.Database.Name : "no name");
        }

        public override string getDatabaseFileName(Ice.Current current__)
        {
            return host.Database.IOConnectionInfo.Path;
        }

        /// <summary>
        /// changes current active database
        /// </summary>
        /// <param name="fileName">Path to database to open. If empty, user is prompted to choose a file</param>
        /// <param name="closeCurrent">if true, currently active database is closed first. if false,
        /// both stay open with fileName DB active</param>
        public override void changeDatabase(string fileName, bool closeCurrent, Ice.Current current__)
        {
            if (closeCurrent && host.MainWindow.DocumentManager.ActiveDatabase != null)
            {
                host.MainWindow.DocumentManager.CloseDatabase(host.MainWindow.DocumentManager.ActiveDatabase);
            }

            KeePassLib.Serialization.IOConnectionInfo ioci = null;

            if (fileName != null && fileName.Length > 0)
            {
                ioci = new KeePassLib.Serialization.IOConnectionInfo();
                ioci.Path = fileName;
            }

            host.MainWindow.Invoke((MethodInvoker)delegate { host.MainWindow.OpenDatabase(ioci, null, false); });
            return;
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

#endregion


#region Implementation of KeeICE.ice functions relating to retrival and manipulation of entries and groups

        /// <summary>
        /// removes a single entry from the database
        /// </summary>
        /// <param name="uuid">The unique indentifier of the entry we want to remove</param>
        /// <returns>true if entry removed successfully, false if it failed</returns>
        public override bool removeEntry(string uuid, Ice.Current current__)
        {
            // Make sure there is an active database
            if (!ensureDBisOpen()) return false;

            if (uuid != null && uuid.Length > 0)
            {
                PwUuid pwuuid = new PwUuid(KeePassLib.Utility.MemUtil.HexStringToByteArray(uuid));

                PwEntry matchedLogin = host.Database.RootGroup.FindEntry(pwuuid, true);

                if (matchedLogin == null)
                    throw new Exception("Could not find requested entry.");
                    
			    PwGroup recycleBin = host.Database.RootGroup.FindGroup(host.Database.RecycleBinUuid, true);
    			
			    if(host.Database.RecycleBinEnabled == false) 
                { 
                    //TODO: enable a warning
                    //if(!host.MainWindow.MessageService.AskYesNo(KPRes.DeleteEntriesQuestionSingle, KPRes.DeleteEntriesTitleSingle))
					//    return false;

                    PwDeletedObject pdo = new PwDeletedObject();
				    pdo.Uuid = matchedLogin.Uuid;
				    pdo.DeletionTime = DateTime.Now;
				    host.Database.DeletedObjects.Add(pdo);
                }
			    else
			    {
                    if(recycleBin == null)
			        {
				        recycleBin = new PwGroup(true, true, KPRes.RecycleBin, PwIcon.TrashBin);
				        recycleBin.EnableAutoType = false;
				        recycleBin.EnableSearching = false;
				        host.Database.RootGroup.AddGroup(recycleBin, true);

				        host.Database.RecycleBinUuid = recycleBin.Uuid;
			        }

				    recycleBin.AddEntry(matchedLogin, true);
				    matchedLogin.Touch(false);
			    }

                    //matchedLogin.ParentGroup.Entries.Remove(matchedLogin);
                host.MainWindow.BeginInvoke(new MethodInvoker(saveDB));

                return true;
            }
            return false;
        }

        /// <summary>
        /// removes a single group and its contents from the database
        /// </summary>
        /// <param name="uuid">The unique indentifier of the group we want to remove</param>
        /// <returns>true if group removed successfully, false if it failed</returns>
        public override bool removeGroup(string uuid, Ice.Current current__)
        {
            // Make sure there is an active database
            if (!ensureDBisOpen()) return false;

            if (uuid != null && uuid.Length > 0)
            {
                PwUuid pwuuid = new PwUuid(KeePassLib.Utility.MemUtil.HexStringToByteArray(uuid));

                PwGroup matchedGroup = host.Database.RootGroup.FindGroup(pwuuid, true);

                if (matchedGroup == null)
                    throw new Exception("Could not find requested entry.");

                matchedGroup.ParentGroup.Groups.Remove(matchedGroup);

                PwGroup recycleBin = host.Database.RootGroup.FindGroup(host.Database.RecycleBinUuid, true);

                if (host.Database.RecycleBinEnabled == false)
                {
                    //TODO: enable a warning
                    //if(!host.MainWindow.MessageService.AskYesNo(KPRes.DeleteGroupsQuestionSingle, KPRes.DeleteGroupsTitleSingle))
                    //    return false;

                    PwDeletedObject pdo = new PwDeletedObject();
                    pdo.Uuid = matchedGroup.Uuid;
                    pdo.DeletionTime = DateTime.Now;
                    host.Database.DeletedObjects.Add(pdo);
                }
                else
                {
                    if (recycleBin == null)
                    {
                        recycleBin = new PwGroup(true, true, KPRes.RecycleBin, PwIcon.TrashBin);
                        recycleBin.EnableAutoType = false;
                        recycleBin.EnableSearching = false;
                        host.Database.RootGroup.AddGroup(recycleBin, true);

                        host.Database.RecycleBinUuid = recycleBin.Uuid;
                    }

                    recycleBin.AddGroup(matchedGroup, true);
                    matchedGroup.Touch(false);
                }

                host.MainWindow.BeginInvoke(new MethodInvoker(saveDB));

                return true;
            }
            return false;
        }

        /// <summary>
        /// Add a new password/login to the active KeePass database
        /// </summary>
        /// <param name="login">The KeeICE representation of the login to be added</param>
        /// <param name="parentUUID">The UUID of the parent group for the new login. If null, the root group will be used.</param>
        /// <param name="current__"></param>
        public override KPlib.KPEntry AddLogin(KPlib.KPEntry login, string parentUUID, Ice.Current current__)
        {
            // Make sure there is an active database
            if (!ensureDBisOpen()) return null;

            PwEntry newLogin = new PwEntry(true,true);

            setPwEntryFromKPEntry(newLogin, login);

            PwGroup parentGroup = host.Database.RootGroup; // if in doubt we'll stick it in the root folder

            if (parentUUID != null && parentUUID.Length > 0)
            {
                PwUuid pwuuid = new PwUuid(KeePassLib.Utility.MemUtil.HexStringToByteArray(parentUUID));

                PwGroup matchedGroup = host.Database.RootGroup.FindGroup(pwuuid, true);

                if (matchedGroup != null)
                    parentGroup = matchedGroup;
            }

            parentGroup.AddEntry(newLogin, true);

            host.MainWindow.BeginInvoke(new MethodInvoker(saveDB));

            KPlib.KPEntry output = getKPEntryFromPwEntry(newLogin, true);

            return output;
        }

        /// <summary>
        /// Add a new group/folder to the active KeePass database
        /// </summary>
        /// <param name="name">The name of the group to be added</param>
        /// <param name="parentUUID">The UUID of the parent group for the new group. If null, the root group will be used.</param>
        /// <param name="current__"></param>
        public override KPlib.KPGroup addGroup(string name, string parentUUID, Ice.Current current__)
        {
            // Make sure there is an active database
            if (!ensureDBisOpen()) return null;

            PwGroup newGroup = new PwGroup(true, true);
            newGroup.Name = name;

            PwGroup parentGroup = host.Database.RootGroup; // if in doubt we'll stick it in the root folder

            if (parentUUID != null && parentUUID.Length > 0)
            {
                PwUuid pwuuid = new PwUuid(KeePassLib.Utility.MemUtil.HexStringToByteArray(parentUUID));

                PwGroup matchedGroup = host.Database.RootGroup.Uuid == pwuuid ? host.Database.RootGroup : host.Database.RootGroup.FindGroup(pwuuid, true);

                if (matchedGroup != null)
                    parentGroup = matchedGroup;
            }

            parentGroup.AddGroup(newGroup, true);

            host.MainWindow.BeginInvoke(new MethodInvoker(saveDB));

            KPlib.KPGroup output = getKPGroupFromPwGroup(newGroup, true);

            return output;
        }

        /// <summary>
        /// Modify an existing login
        /// </summary>
        /// <param name="oldLogin">The old login that will be replaced. In fact only the UUID contained within it will be used for now.</param>
        /// <param name="newLogin">The login object that will replace the old one.</param>
        /// <param name="current__"></param>
        public override void ModifyLogin(KPlib.KPEntry oldLogin, KPlib.KPEntry newLogin, Ice.Current current__)
        {
            if (oldLogin == null)
                throw new Exception("old login must be passed to the ModifyLogin function. It wasn't");
            if (newLogin == null)
                throw new Exception("new login must be passed to the ModifyLogin function. It wasn't");
            if (oldLogin.uniqueID == null || oldLogin.uniqueID == "")
                throw new Exception("old login doesn't contain a uniqueID");

            // Make sure there is an active database
            if (!ensureDBisOpen()) return;

            PwUuid pwuuid = new PwUuid(KeePassLib.Utility.MemUtil.HexStringToByteArray(oldLogin.uniqueID)); 
            
            PwEntry modificationTarget = host.Database.RootGroup.FindEntry(pwuuid, true);

            if (modificationTarget == null)
                throw new Exception("Could not find correct entry to modify. No changes made to KeePass database.");

            setPwEntryFromKPEntry(modificationTarget, newLogin);

            host.MainWindow.BeginInvoke(new MethodInvoker(saveDB));
        }

        /// <summary>
        /// Return the parent group of the object with the supplied UUID
        /// </summary>
        /// <param name="uuid">the UUID of the object we want to find the parent of</param>
        /// <param name="current__"></param>
        /// <returns>the parent group</returns>
        public override KPlib.KPGroup getParent(string uuid, Ice.Current current__)
        {
            KPlib.KPGroup output;

            // Make sure there is an active database
            if (!ensureDBisOpen()) return null;

            PwUuid pwuuid = new PwUuid(KeePassLib.Utility.MemUtil.HexStringToByteArray(uuid));

            try
            {

                PwEntry thisEntry = host.Database.RootGroup.FindEntry(pwuuid, true);
                if (thisEntry != null && thisEntry.ParentGroup != null)
                {
                    output = getKPGroupFromPwGroup(thisEntry.ParentGroup, true);
                    return output;
                }

                PwGroup thisGroup = host.Database.RootGroup.FindGroup(pwuuid, true);
                if (thisGroup != null && thisGroup.ParentGroup != null)
                {
                    output = getKPGroupFromPwGroup(thisGroup.ParentGroup, true);
                    return output;
                }
            }
            catch (Exception)
            {
                return null;
            }
            output = getKPGroupFromPwGroup(host.Database.RootGroup, true);
            return output;
        }

        /// <summary>
        /// Return the root group of the active database
        /// </summary>
        /// <param name="current__"></param>
        /// <returns>the root group</returns>
        public override KPlib.KPGroup getRoot(Ice.Current current__)
        {
            // Make sure there is an active database
            if (!ensureDBisOpen()) { return null; }

            if (host.Database.CustomData.Exists("KeeICE.KeeFox.rootUUID") && host.Database.CustomData.Get("KeeICE.KeeFox.rootUUID").Length >= 30) //TODO: tighten
            {
                var uuid = host.Database.CustomData.Get("KeeICE.KeeFox.rootUUID");

                PwUuid pwuuid = new PwUuid(KeePassLib.Utility.MemUtil.HexStringToByteArray(uuid));

                PwGroup matchedGroup = host.Database.RootGroup.Uuid == pwuuid ? host.Database.RootGroup : host.Database.RootGroup.FindGroup(pwuuid, true);

                if (matchedGroup == null)
                    throw new Exception("Could not find requested group.");

                return getKPGroupFromPwGroup(matchedGroup, true);
            }
            else
            {
                return getKPGroupFromPwGroup(host.Database.RootGroup, true);
            }
        }

        /// <summary>
        /// Return a list of every login in the database
        /// </summary>
        /// <param name="logins">the list of all logins</param>
        /// <param name="current__"></param>
        /// <returns>the number of logins in the list</returns>
        public override int getAllLogins(out KPlib.KPEntry[] logins, Ice.Current current__)
        {
            int count = 0;
            ArrayList allEntries = new ArrayList();

            // Make sure there is an active database
            if (!ensureDBisOpen()) { logins = null; return -1; }

            KeePassLib.Collections.PwObjectList<PwEntry> output;
            output = host.Database.RootGroup.GetEntries(true);
            //host.Database.RootGroup.
            foreach (PwEntry pwe in output)
            {
                KPlib.KPEntry kpe = getKPEntryFromPwEntry(pwe, false);
                allEntries.Add(kpe);
                count++;

            }

            logins = (KPlib.KPEntry[])allEntries.ToArray(typeof(KPlib.KPEntry));

            return count;
        }

        /// <summary>
        /// Returns a list of every entry contained within a group (not recursive)
        /// </summary>
        /// <param name="uuid">the unique ID of the group we're interested in.</param>
        /// <param name="current__"></param>
        /// <returns>the list of every entry directly inside the group.</returns>
        public override KPlib.KPEntry[] getChildEntries(string uuid, Ice.Current current__)
        {
            KPlib.KPEntry[] entries = null;
            ArrayList allEntries = new ArrayList();

            if (uuid != null && uuid.Length > 0)
            {
                // Make sure there is an active database
                if (!ensureDBisOpen()) { return null; } 
                
                PwUuid pwuuid = new PwUuid(KeePassLib.Utility.MemUtil.HexStringToByteArray(uuid));

                PwGroup matchedGroup = host.Database.RootGroup.Uuid == pwuuid ? host.Database.RootGroup : host.Database.RootGroup.FindGroup(pwuuid, true);

                if (matchedGroup == null)
                    throw new Exception("Could not find requested group.");

                KeePassLib.Collections.PwObjectList<PwEntry> output;
                output = matchedGroup.GetEntries(false);

                foreach (PwEntry pwe in output)
                {
                    KPlib.KPEntry kpe = getKPEntryFromPwEntry(pwe, false);
                    allEntries.Add(kpe);
                }

                entries = (KPlib.KPEntry[])allEntries.ToArray(typeof(KPlib.KPEntry));
            }

            return entries;
        }

        /// <summary>
        /// Returns a list of every group contained within a group (not recursive)
        /// </summary>
        /// <param name="uuid">the unique ID of the group we're interested in.</param>
        /// <param name="current__"></param>
        /// <returns>the list of every group directly inside the group.</returns>
        public override KPlib.KPGroup[] getChildGroups(string uuid, Ice.Current current__)
        {
            KPlib.KPGroup[] entries = null;
            ArrayList allGroups = new ArrayList();

            PwGroup matchedGroup;
            
            // Make sure there is an active database
            if (!ensureDBisOpen()) { return null; }

            if (uuid != null && uuid.Length > 0)
            {
                PwUuid pwuuid = new PwUuid(KeePassLib.Utility.MemUtil.HexStringToByteArray(uuid));

                matchedGroup = host.Database.RootGroup.Uuid == pwuuid ? host.Database.RootGroup : host.Database.RootGroup.FindGroup(pwuuid, true);
            } else
            {
                matchedGroup = host.Database.RootGroup;
            }

            if (matchedGroup == null)
                throw new Exception("Could not find requested group.");

            KeePassLib.Collections.PwObjectList<PwGroup> output;
            output = matchedGroup.Groups;

            foreach (PwGroup pwg in output)
            {
                KPlib.KPGroup kpg = getKPGroupFromPwGroup(pwg, false);
                allGroups.Add(kpg);
            }

            entries = (KPlib.KPGroup[])allGroups.ToArray(typeof(KPlib.KPGroup));
            return entries;
        }

        /// <summary>
        /// Return a list of groups. If uuid is supplied, the list will have a maximum of one entry. Otherwise it could have any number. If name and uuid are null, all groups will be returned. TODO: KeePass doesn't have an easy way to search groups by name so postponing that functionality until really needed (or implemented by KeePass API anyway) - for now, name IS COMPLETELY IGNORED
        /// </summary>
        /// <param name="name">The name of a groups we are looking for. Must be an exact match.</param>
        /// <param name="uuid">The UUID of the group we are looking for.</param>
        /// <param name="groups">The output result (a list of KPGroups)</param>
        /// <param name="current__"></param>
        /// <returns>The number of items in the list of groups.</returns>
        public override int findGroups(string name, string uuid, out KPlib.KPGroup[] groups, Ice.Current current__)
        {
            // if uniqueID is supplied, match just that one group. if not found, move on to search the content of the logins...
            if (uuid != null && uuid.Length > 0)
            {
                // Make sure there is an active database
                if (!ensureDBisOpen()) { groups = null; return -1; }

                PwUuid pwuuid = new PwUuid(KeePassLib.Utility.MemUtil.HexStringToByteArray(uuid));

                PwGroup matchedGroup = host.Database.RootGroup.Uuid == pwuuid ? host.Database.RootGroup : host.Database.RootGroup.FindGroup(pwuuid, true);

                if (matchedGroup == null)
                    throw new Exception("Could not find requested group.");

                groups = new KPlib.KPGroup[1];
                groups[0] = getKPGroupFromPwGroup(matchedGroup, true);
                if (groups[0] != null)
                    return 1;
            }


            groups = null;

            return 0;
        }

        private bool matchesAnyURL (PwEntry pwe, string url)
        {
            if (pwe.Strings.Exists("URL") && pwe.Strings.ReadSafe("URL").Length > 0
                    && (url == "" || pwe.Strings.ReadSafe("URL").Contains(url))
               )
                return true;

            string urls = pwe.Strings.ReadSafe("Alternative URLs");
            string[] urlsArray = urls.Split( new char[' ']);
            foreach (string altURL in urlsArray)
                if (altURL.Contains(url))
                    return true;
            
            return false;

        }

        public override int findLogins(string URL, string actionURL, string httpRealm, KPlib.loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KPlib.KPEntry[] logins, Ice.Current current__)
        {
            //string fullURL = URL;
            string hostname = URL;
            string actionHost = actionURL;
            //string fullActionURL = actionURL;

            // Make sure there is an active database
            if (!ensureDBisOpen()) { logins = null; return -1; }

            // if uniqueID is supplied, match just that one login. if not found, move on to search the content of the logins...
            if (uniqueID != null && uniqueID.Length > 0)
            {
                PwUuid pwuuid = new PwUuid(KeePassLib.Utility.MemUtil.HexStringToByteArray(uniqueID));

                PwEntry matchedLogin = host.Database.RootGroup.FindEntry(pwuuid, true);

                if (matchedLogin == null)
                    throw new Exception("Could not find requested entry.");

                logins = new KPlib.KPEntry[1];
                logins[0] = getKPEntryFromPwEntry(matchedLogin, true);
                if (logins[0] != null)
                    return 1;
            }

            // make sure that hostname and actionURL always represent only the hostname portion
            // of the URL
            // It's tempting to demand that the protocol must match too (e.g. http forms won't
            // match a stored https login) but best not to define such a restriction in KeeICE
            // - the ICE client (e.g. KeeFox) can decide to penalise protocol mismatches, 
            // potentially dependant on user configuration options in the client.
            int protocolIndex = URL.IndexOf("://");
            if (URL.IndexOf("file://") > -1)
            {
                // the "host and port" of a file is the actual file name (i.e. just not the query string)

                int qsIndex = URL.IndexOf("?");
                if (qsIndex > -1)
                    hostname = URL.Substring(8, qsIndex - 8);
                else
                    hostname = URL.Substring(8);
            }
            else if (protocolIndex > -1)
            {
                string hostAndPort = URL.Substring(protocolIndex + 3);
                int pathStart = hostAndPort.IndexOf("/", 0);
                if (pathStart > -1 && hostAndPort.Length > pathStart)
                {
                    hostname = URL.Substring(0, pathStart + protocolIndex + 3);
                }
            }
            else
            {
                // we havn't received a protocol but may still have a query string 
                // we'd like to remove from the URL (e.g. especially if we're dealing with an unknown file:///)
                int qsIndex = URL.IndexOf("?");
                if (qsIndex > -1)
                    hostname = URL.Substring(1, qsIndex-1);
            }


            protocolIndex = actionURL.IndexOf("://");
            if (protocolIndex > -1)
            {
                string actionURLAndPort = actionURL.Substring(protocolIndex + 3);
                int pathStart = actionURLAndPort.IndexOf("/", 0);
                if (pathStart > -1 && actionURLAndPort.Length > pathStart)
                {
                    actionHost = actionURL.Substring(0, pathStart + protocolIndex + 3);
                }
            }


            int count = 0;
            ArrayList allEntries = new ArrayList();

            
            // Narrow down the possible matches by doing a KeePass search
            // (We could match on an irrelevant string field but chances are that any matches are suitable)
            SearchParameters sp = new SearchParameters();
            sp.SearchInUrls = true;
            sp.SearchInOther = true;
            sp.RegularExpression = true;
            if (hostname.Length == 0)
                sp.SearchString = ".*";
            else if (requireFullURLMatches)
                sp.SearchString = System.Text.RegularExpressions.Regex.Escape(URL);
            else
                sp.SearchString = System.Text.RegularExpressions.Regex.Escape(hostname);

            KeePassLib.Collections.PwObjectList<PwEntry> output;
            output = new KeePassLib.Collections.PwObjectList<PwEntry>();
            host.Database.RootGroup.SearchEntries(sp, output, false);
            foreach (PwEntry pwe in output)
            {
                bool entryIsAMatch = false;
                bool entryIsAnExactMatch = false;

                if ( lst != KPlib.loginSearchType.LSTnoForms && matchesAnyURL(pwe,hostname))
                {
                    if (pwe.Strings.Exists("Form match URL") && pwe.Strings.ReadSafe("Form match URL") == actionURL && pwe.Strings.ReadSafe("URL") == URL)
                    {
                        entryIsAnExactMatch = true;
                        entryIsAMatch = true;
                    }
                    else if (!requireFullURLMatches)
                        entryIsAMatch = true;
                }

                if (lst != KPlib.loginSearchType.LSTnoRealms && matchesAnyURL(pwe,hostname))
                {
                    if (pwe.Strings.Exists("Form HTTP realm") && pwe.Strings.ReadSafe("Form HTTP realm").Length > 0
                    && (httpRealm == "" || pwe.Strings.ReadSafe("Form HTTP realm") == httpRealm) 
                    && pwe.Strings.ReadSafe("URL") == URL)
                    {
                        entryIsAnExactMatch = true;
                        entryIsAMatch = true;
                    }
                    else if (!requireFullURLMatches)
                        entryIsAMatch = true;
                }

                if (entryIsAMatch)
                {
                    KPlib.KPEntry kpe = getKPEntryFromPwEntry(pwe,entryIsAnExactMatch);
                    allEntries.Add(kpe);
                    count++;
                }

            }

            logins = (KPlib.KPEntry[])allEntries.ToArray(typeof(KPlib.KPEntry));

            return count;
        }


        public override int countLogins(string URL, string actionURL, string httpRealm, KPlib.loginSearchType lst, bool requireFullURLMatches, Ice.Current current__)
        {
            //string fullURL = hostname;
            //string fullActionURL = actionURL;
            string hostname = URL;
            string actionHost = actionURL;

            // make sure that hostname and actionURL always represent only the hostname portion
            // of the URL

            int protocolIndex = URL.IndexOf("://");
            if (URL.IndexOf("file://") > -1)
            {
                // the "host and port" of a file is the actual file name (i.e. just not the query string)

                int qsIndex = URL.IndexOf("?");
                if (qsIndex > -1)
                    hostname = URL.Substring(8, qsIndex - 8);
                else
                    hostname = URL.Substring(8);
            }
            else if (protocolIndex > -1)
            {
                string hostAndPort = URL.Substring(protocolIndex + 3);
                int pathStart = hostAndPort.IndexOf("/", 0);
                if (pathStart > -1 && hostAndPort.Length > pathStart)
                {
                    hostname = URL.Substring(0, pathStart + protocolIndex + 3);
                }
            }
            else
            {
                // we havn't received a protocol but may still have a query string 
                // we'd like to remove from the URL (e.g. especially if we're dealing with a file:///
                int qsIndex = URL.IndexOf("?");
                if (qsIndex > -1)
                    hostname = URL.Substring(1, qsIndex-1);
            }

            protocolIndex = actionURL.IndexOf("://");
            if (protocolIndex > -1)
            {
                string actionURLAndPort = actionURL.Substring(protocolIndex + 3);
                int pathStart = actionURLAndPort.IndexOf("/", 0);
                if (pathStart > -1 && actionURLAndPort.Length > pathStart)
                {
                    actionHost = actionURL.Substring(0, pathStart + protocolIndex + 3);
                }
            }

            int count = 0;
            ArrayList allEntries = new ArrayList();

            if (permitUnencryptedURLs)
            {
/*
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
                        if (entry[1] != null && entry[1].Length > 0 && lst == KPlib.loginSearchType.LSTnoForms)
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

                        if (entry[2] != null && entry[2].Length > 0 && lst == KPlib.loginSearchType.LSTnoRealms)
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

                }*/
            }
            else
            {
                // Make sure there is an active database
                if (!ensureDBisOpen()) return -1;



                // Narrow down the possible matches by doing a KeePass search
                // (We could match on an irrelevant string field but chances are that any matches are suitable)
                SearchParameters sp = new SearchParameters();
                sp.SearchInUrls = true;
                sp.SearchInOther = true;
                sp.RegularExpression = true;
                if (URL.Length == 0)
                    sp.SearchString = ".*";
                else if (requireFullURLMatches)
                    sp.SearchString = System.Text.RegularExpressions.Regex.Escape(URL);
                else
                    sp.SearchString = System.Text.RegularExpressions.Regex.Escape(hostname);

                KeePassLib.Collections.PwObjectList<PwEntry> output;
                output = new KeePassLib.Collections.PwObjectList<PwEntry>();
                host.Database.RootGroup.SearchEntries(sp, output, false);
                foreach (PwEntry pwe in output)
                {
                    bool entryIsAMatch = false;
                    bool entryIsAnExactMatch = false;

                    if ( lst != KPlib.loginSearchType.LSTnoForms && matchesAnyURL(pwe,hostname))
                    {
                        if (pwe.Strings.Exists("Form match URL") && pwe.Strings.ReadSafe("Form match URL") == actionURL && pwe.Strings.ReadSafe("URL") == URL)
                        {
                            entryIsAnExactMatch = true;
                            entryIsAMatch = true;
                        }
                        else if (!requireFullURLMatches)
                            entryIsAMatch = true;
                    }

                    if (lst != KPlib.loginSearchType.LSTnoRealms && matchesAnyURL(pwe,hostname))
                    {
                        if (pwe.Strings.Exists("Form HTTP realm") && pwe.Strings.ReadSafe("Form HTTP realm").Length > 0
                        && (httpRealm == "" || pwe.Strings.ReadSafe("Form HTTP realm") == httpRealm) 
                        && pwe.Strings.ReadSafe("URL") == URL)
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

#endregion

    }
}
















    