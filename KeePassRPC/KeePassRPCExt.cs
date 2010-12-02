/*
  KeePassRPC - Uses JSON-RPC to provide RPC facilities to KeePass.
  Example usage includes the KeeFox firefox extension.
  
  Copyright 2010 Chris Tomlinson <keefox@christomlinson.name>

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
using System.Configuration.Install;

using KeePass.Plugins;
using KeePass.Forms;
using KeePass.Resources;

using KeePassLib;
using KeePassLib.Security;
using KeePass.App;
using KeePass.UI;
using Jayrock.JsonRpc;
using KeePassRPC.Forms;
using System.Reflection;
using KeePassLib.Collections;

namespace KeePassRPC
{
	/// <summary>
	/// The main class - starts the RPC service and server
	/// </summary>
	public sealed class KeePassRPCExt : Plugin
	{
        // version information
        public static readonly Version PluginVersion = new Version(0,8,5);
                
        private KeePassRPCServer _RPCServer;
        private KeePassRPCService _RPCService;

        /// <summary>
        /// Listens for requests from RPC clients such as KeeFox
        /// </summary>
        public KeePassRPCServer RPCServer
        {
            get { return _RPCServer; }
        }

        /// <summary>
        /// Provides an externally accessible API for common KeePass operations
        /// </summary>
        public KeePassRPCService RPCService
        {
            get { return _RPCService; }
        }

        internal IPluginHost _host;

        private ToolStripMenuItem _keePassRPCOptions = null;
        private ToolStripMenuItem _keeFoxSampleEntries = null;
        private ToolStripSeparator _tsSeparator1 = null;
        private ToolStripMenuItem _keeFoxRootMenu = null;

        private EventHandler<GwmWindowEventArgs> GwmWindowAddedHandler;

        private static object _lockRPCClientManagers = new object();
        private Dictionary<string, KeePassRPCClientManager> _RPCClientManagers = new Dictionary<string, KeePassRPCClientManager>(3);

        private int FindKeePassRPCPort(IPluginHost host)
        {
            bool allowCommandLineOverride = host.CustomConfig.GetBool("KeePassRPC.connection.allowCommandLineOverride", true);
            int KeePassRPCport = (int)host.CustomConfig.GetULong("KeePassRPC.connection.port", 12536);

            if (allowCommandLineOverride)
            {
                string KeePassRPCportStr = host.CommandLineArgs["KeePassRPCPort"];
                if (KeePassRPCportStr != null)
                {
                    try
                    {
                        KeePassRPCport = int.Parse(KeePassRPCportStr);
                    }
                    catch
                    {
                        // just stick with what we had already decided
                    }
                }
            }
            return KeePassRPCport;
        }

        private bool FindKeePassRPCSSLEnabled(IPluginHost host)
        {
            bool allowCommandLineOverride = host.CustomConfig.GetBool("KeePassRPC.connection.allowCommandLineOverride", true);
            bool sslEnabled = host.CustomConfig.GetBool("KeePassRPC.connection.SSLEnabled", true);
            
            if (allowCommandLineOverride)
            {
                string SSLEnabledStr = host.CommandLineArgs["SSLEnabled"];
                if (SSLEnabledStr != null)
                {
                    try
                    {
                        sslEnabled = bool.Parse(SSLEnabledStr);
                    }
                    catch
                    {
                        // just stick with what we had already decided
                    }
                }
            }
            return sslEnabled;
        }

		/// <summary>
		/// The <c>Initialize</c> function is called by KeePass when
		/// you should initialize your plugin (create menu items, etc.).
		/// </summary>
		/// <param name="host">Plugin host interface. By using this
		/// interface, you can access the KeePass main window and the
		/// currently opened database.</param>
		/// <returns>true if channel registered correctly, otherwise false</returns>
		public override bool Initialize(IPluginHost host)
		{
            Debug.Assert(host != null);
            if(host == null)
                return false;
            _host = host;

            CreateClientManagers();
            //TODO2: set up language services

            _RPCService = new KeePassRPCService(host, 
                getStandardIconsBase64(host.MainWindow.ClientIcons), this);
            _RPCServer = new KeePassRPCServer(FindKeePassRPCPort(host), RPCService, this, FindKeePassRPCSSLEnabled(host));

            // register to recieve events that we need to deal with

            _host.MainWindow.FileOpened += OnKPDBOpen;
            _host.MainWindow.FileClosed += OnKPDBClose;
            _host.MainWindow.FileCreated += OnKPDBOpen; // or need a specific handler here?
            
             //be nice to pick up when entries are edited and update the firefox URL cache imemdiately
             //for the time being we'll have to hook onto the Save function
             //ServerData.m_host.Database.RootGroup...
            _host.MainWindow.FileSaving += OnKPDBSaving;
            _host.MainWindow.FileSaved += OnKPDBSaved;

            _host.MainWindow.DocumentManager.ActiveDocumentSelected += OnKPDBSelected;

            // Get a reference to the 'Tools' menu item container
            ToolStripItemCollection tsMenu = _host.MainWindow.ToolsMenu.DropDownItems;

            // Add menu item for options
            _keePassRPCOptions = new ToolStripMenuItem();
            _keePassRPCOptions.Text = "KeePassRPC (KeeFox) Options...";
            _keePassRPCOptions.Click += OnToolsOptions;
            _keePassRPCOptions.Enabled = true;
            tsMenu.Add(_keePassRPCOptions);

            // Add menu item for KeeFox samples
            _keeFoxSampleEntries = new ToolStripMenuItem();
            _keeFoxSampleEntries.Text = "Insert KeeFox tutorial samples";
            _keeFoxSampleEntries.Click += OnToolsInstallKeeFoxSampleEntries;
            _keeFoxSampleEntries.Enabled = true;
            tsMenu.Add(_keeFoxSampleEntries);

            // Add a seperator and menu item to the group context menu
            ContextMenuStrip gcm = host.MainWindow.GroupContextMenu;
            _tsSeparator1 = new ToolStripSeparator();
            gcm.Items.Add(_tsSeparator1);
            _keeFoxRootMenu = new ToolStripMenuItem();
            _keeFoxRootMenu.Text = "Set as KeeFox start group";
            _keeFoxRootMenu.Click += OnMenuSetRootGroup;
            gcm.Items.Add(_keeFoxRootMenu);

            // not acting on upgrade info just yet but we need to track it for future proofing
            bool upgrading = refreshVersionInfo(host);            

            if (!_RPCServer.IsListening)
                MessageBox.Show("Could not start listening for RPC connections. KeePassRPC will not function and any services that rely on it will fail to connect to KeePass.");

            // for debug only:
            //WelcomeForm wf = new WelcomeForm();
            //DialogResult dr = wf.ShowDialog();
            //if (dr == DialogResult.Yes)
            //    CreateNewDatabase();

            GwmWindowAddedHandler = new EventHandler<GwmWindowEventArgs>(GlobalWindowManager_WindowAdded);
            GlobalWindowManager.WindowAdded += GwmWindowAddedHandler;
			
			return true; // Initialization successful
		}

		void GlobalWindowManager_WindowAdded(object sender, GwmWindowEventArgs e)
		{
            return; // not in 0.8 (soon after hopefully...)

			PwEntryForm ef = e.Form as PwEntryForm;
            if (ef != null)
            {
                ef.Shown += new EventHandler(editEntryFormShown);
                return;
            }

            GroupForm gf = e.Form as GroupForm;
            if (gf != null)
            {
                gf.Shown += new EventHandler(editGroupFormShown);
                return;
            }            
		}

		void editGroupFormShown(object sender, EventArgs e)
		{
            //TODO2: reflect (then cache) to find all custom controls that meet
            // KeePassRPC requirements and display them all, not just KeeFox
			GroupForm form = sender as GroupForm;
            PwGroup group = null;
            TabControl mainTabControl = null;
            //This might not work, especially in .NET 2.0 RTM, a shame but more
            //up to date users might as well use the feature if possible.
            try
            {
                FieldInfo fi = typeof(GroupForm).GetField("m_pwGroup", BindingFlags.NonPublic | BindingFlags.Instance);
                group = (PwGroup)fi.GetValue(form);

                Control[] cs = form.Controls.Find("m_tabMain", true);
                if (cs.Length == 0)
                    return;
                mainTabControl = cs[0] as TabControl;
            } catch
            {
                // that's life, just move on.
                return;
            }

            if (group == null)
                return;

			KeeFoxGroupUserControl groupControl = new KeeFoxGroupUserControl(this, group);
            TabPage keefoxTabPage = new TabPage("KeeFox");
            groupControl.Dock = DockStyle.Fill;
            keefoxTabPage.Controls.Add(groupControl);
            if (mainTabControl.ImageList == null)
                mainTabControl.ImageList = new ImageList();
            int imageIndex = mainTabControl.ImageList.Images.Add(global::KeePassRPC.Properties.Resources.KeeFox16, Color.Transparent);
            keefoxTabPage.ImageIndex = imageIndex;
            mainTabControl.TabPages.Add(keefoxTabPage);
		}

        void editEntryFormShown(object sender, EventArgs e)
        {
            //TODO2: reflect (then cache) to find all custom controls that meet
            // KeePassRPC requirements and display them all, not just KeeFox
            PwEntryForm form = sender as PwEntryForm;
            PwEntry entry = null;
            TabControl mainTabControl = null;
            CustomListViewEx advancedListView = null;
            ProtectedStringDictionary strings = null;

            //This might not work, but might as well use the feature if possible.
            try
            {
                // reflection doesn't seem to be needed for 2.10 and above
                entry = form.EntryRef;
                strings = form.EntryStrings;

                Control[] cs = form.Controls.Find("m_tabMain", true);
                if (cs.Length == 0)
                    return;
                mainTabControl = cs[0] as TabControl;

                Control[] cs2 = form.Controls.Find("m_lvStrings", true);
                if (cs2.Length == 0)
                    return;
                advancedListView = cs2[0] as CustomListViewEx;
            }
            catch
            {
                // that's life, just move on.
                return;
            }

            if (entry == null)
                return;

            KeeFoxEntryUserControl entryControl = new KeeFoxEntryUserControl(this, entry, advancedListView, form, strings);
            TabPage keefoxTabPage = new TabPage("KeeFox");
            entryControl.Dock = DockStyle.Fill;
            keefoxTabPage.Controls.Add(entryControl);
            if (mainTabControl.ImageList == null)
                mainTabControl.ImageList = new ImageList();
            int imageIndex = mainTabControl.ImageList.Images.Add(global::KeePassRPC.Properties.Resources.KeeFox16, Color.Transparent);
            keefoxTabPage.ImageIndex = imageIndex;
            mainTabControl.TabPages.Add(keefoxTabPage);
        }
		

        // still useful for tracking server versions I reckon...
        bool refreshVersionInfo(IPluginHost host)
        {
            bool upgrading = false;
            int majorOld = (int)host.CustomConfig.GetULong("KeePassRPC.version.major", 0);
            int minorOld = (int)host.CustomConfig.GetULong("KeePassRPC.version.minor", 0);
            int buildOld = (int)host.CustomConfig.GetULong("KeePassRPC.version.build", 0);
            Version versionCurrent = PluginVersion;

            if (majorOld != 0 || minorOld != 0 || buildOld != 0)
            {
                Version versionOld = new Version(majorOld, minorOld, buildOld);
                if (versionCurrent.CompareTo(versionOld) > 0)
                    upgrading = true;
            }

            host.CustomConfig.SetULong("KeePassRPC.version.major", (ulong)versionCurrent.Major);
            host.CustomConfig.SetULong("KeePassRPC.version.minor", (ulong)versionCurrent.Minor);
            host.CustomConfig.SetULong("KeePassRPC.version.build", (ulong)versionCurrent.Build);

            return upgrading;
        }

        void OnToolsOptions(object sender, EventArgs e)
        {
            KeePassRPC.Forms.OptionsForm ofDlg = new KeePassRPC.Forms.OptionsForm(_host);
            ofDlg.ShowDialog();
        }

        void OnToolsInstallKeeFoxSampleEntries(object sender, EventArgs e)
        {
            InstallKeeFoxSampleEntries(_host.Database);
            _host.MainWindow.UpdateUI(true, null, true, null, true, null, true);
        }

        void OnMenuSetRootGroup(object sender, EventArgs e)
        {
            PwGroup pg = _host.MainWindow.GetSelectedGroup();
            Debug.Assert(pg != null);
            if (pg == null || pg.Uuid == null || pg.Uuid == PwUuid.Zero)
                return;

            _host.Database.CustomData.Set("KeePassRPC.KeeFox.rootUUID",
                KeePassLib.Utility.MemUtil.ByteArrayToHexString(pg.Uuid.UuidBytes));

            _host.MainWindow.UpdateUI(false, null, true, null, true, null, true);
        }

        //void MainWindow_Shown_NewUser(object sender, EventArgs e)
        //{
        //    MessageBox.Show("Welcome to KeeFox! THE FOLLOWING DIALOGS ARE EXPERIMENTAL PROTOTYPES - hopefully functional, but FAR from pretty!");
        //    //keeICEServer.m_host.MainWindow.Shown -= MainWindow_Shown_NewUser;
        //    WelcomeKeeFoxUser();
        //}

        //void MainWindow_Shown_ExistingUser(object sender, EventArgs e)
        //{
        //    MessageBox.Show("UPGRADE DETECTED - Upgrade specific information is coming soon, in the meantime, please experiment with and report back on the following EXPERIMENTAL PROTOTYPE 'new user' dialogs - they are hopefully functional, but FAR from pretty!");
        //    //keeICEServer.m_host.MainWindow.Shown -= MainWindow_Shown_ExistingUser;
        //    WelcomeKeeFoxUser();
        //}

        private string[] getStandardIconsBase64(ImageList il)
        {
            string[] icons = new string[il.Images.Count];

            for (int i = 0; i < il.Images.Count; i++)
			{
			    Image image = il.Images[i];
                MemoryStream ms = new MemoryStream();
                image.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                icons[i] = Convert.ToBase64String(ms.ToArray());
            }
            return icons;
        }

        //public void RegisterKnownClient()
        //{
        //    WelcomeKeeFoxUser();
        //}

        public delegate object WelcomeKeeFoxUserDelegate(PendingRPCClient client);
        

        public object WelcomeKeeFoxUser(PendingRPCClient client)
        {
            WelcomeForm wf = new WelcomeForm();
            DialogResult dr = wf.ShowDialog(_host.MainWindow);

            if (dr == DialogResult.Yes || dr == DialogResult.No)
                RPCService.AddKnownRPCClient(client);
            if (dr == DialogResult.Yes)
                CreateNewDatabase();
            if (dr == DialogResult.Yes || dr == DialogResult.No)
                return 0;
            return 1;
        }

        public delegate object GetIconDelegate(int iconIndex);


        public Image GetIcon(int iconIndex)
        {
            return _host.MainWindow.ClientIcons.Images[(int)iconIndex];
        }

        /// <summary>
        /// Called when [file new]. TODO: Review whenever private KeePass.MainForm.OnFileNew method changes.
        /// </summary>
        /// <param name="sender">The sender.</param>
        /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        internal void CreateNewDatabase()
        {
            if (!AppPolicy.Try(AppPolicyId.SaveFile)) return;

            SaveFileDialog sfd = UIUtil.CreateSaveFileDialog(KPRes.CreateNewDatabase,
                KPRes.NewDatabaseFileName, UIUtil.CreateFileTypeFilter(
                AppDefs.FileExtension.FileExt, KPRes.KdbxFiles, true), 1,
                AppDefs.FileExtension.FileExt, false);

            GlobalWindowManager.AddDialog(sfd);
            DialogResult dr = sfd.ShowDialog(_host.MainWindow);
            GlobalWindowManager.RemoveDialog(sfd);

            string strPath = sfd.FileName;

            if (dr != DialogResult.OK) return;

            KeePassLib.Keys.CompositeKey key;
            KeyCreationSimpleForm kcsf = new KeyCreationSimpleForm();
            kcsf.InitEx(KeePassLib.Serialization.IOConnectionInfo.FromPath(strPath), true);
            dr = kcsf.ShowDialog(_host.MainWindow);
            if ((dr == DialogResult.Cancel) || (dr == DialogResult.Abort)) return;
            if (dr == DialogResult.No)
            {
                KeyCreationForm kcf = new KeyCreationForm();
                kcf.InitEx(KeePassLib.Serialization.IOConnectionInfo.FromPath(strPath), true);
                dr = kcf.ShowDialog(_host.MainWindow);
                if ((dr == DialogResult.Cancel) || (dr == DialogResult.Abort)) return;
                key = kcf.CompositeKey;
            } else
            {
                key = kcsf.CompositeKey;
            }

            PwDocument dsPrevActive = _host.MainWindow.DocumentManager.ActiveDocument;
            PwDatabase pd = _host.MainWindow.DocumentManager.CreateNewDocument(true).Database;
            pd.New(KeePassLib.Serialization.IOConnectionInfo.FromPath(strPath), key);

            if (!string.IsNullOrEmpty(kcsf.DatabaseName))
            {
                pd.Name = kcsf.DatabaseName;
                pd.NameChanged = DateTime.Now;
            }

            InsertStandardKeePassData(pd);

            

            InstallKeeFoxSampleEntries(pd);

            _host.MainWindow.UpdateUI(true, null, true, null, true, null, true);
        }

        private void InsertStandardKeePassData(PwDatabase pd)
        {
            PwGroup pg = new PwGroup(true, true, KPRes.General, PwIcon.Folder);
            pd.RootGroup.AddGroup(pg, true);

            pg = new PwGroup(true, true, KPRes.WindowsOS, PwIcon.DriveWindows);
            pd.RootGroup.AddGroup(pg, true);

            pg = new PwGroup(true, true, KPRes.Network, PwIcon.NetworkServer);
            pd.RootGroup.AddGroup(pg, true);

            pg = new PwGroup(true, true, KPRes.Internet, PwIcon.World);
            pd.RootGroup.AddGroup(pg, true);

            pg = new PwGroup(true, true, KPRes.EMail, PwIcon.EMail);
            pd.RootGroup.AddGroup(pg, true);

            pg = new PwGroup(true, true, KPRes.Homebanking, PwIcon.Homebanking);
            pd.RootGroup.AddGroup(pg, true);
        }

        private void InstallKeeFoxSampleEntries(PwDatabase pd)
        {
            PwUuid iconUuid = GetKeeFoxIcon();
            PwUuid groupUuid = new PwUuid(new byte[] {
                0xea, 0x9f, 0xf2, 0xed, 0x05, 0x12, 0x47, 0x47,
                0xb6, 0x3e, 0xaf, 0xa5, 0x15, 0xa3, 0x04, 0x23});
            PwUuid entry1Uuid = new PwUuid(new byte[] {
                0xe9, 0x9f, 0xf2, 0xed, 0x05, 0x12, 0x47, 0x47,
                0xb6, 0x3e, 0xaf, 0xa5, 0x15, 0xa3, 0x04, 0x24});
            PwUuid entry2Uuid = new PwUuid(new byte[] {
                0xe8, 0x9f, 0xf2, 0xed, 0x05, 0x12, 0x47, 0x47,
                0xb6, 0x3e, 0xaf, 0xa5, 0x15, 0xa3, 0x04, 0x25});
            PwUuid entry3Uuid = new PwUuid(new byte[] {
                0xe7, 0x9f, 0xf2, 0xed, 0x05, 0x12, 0x47, 0x47,
                0xb6, 0x3e, 0xaf, 0xa5, 0x15, 0xa3, 0x04, 0x26});
            PwUuid entry4Uuid = new PwUuid(new byte[] {
                0xe6, 0x9f, 0xf2, 0xed, 0x05, 0x12, 0x47, 0x47,
                0xb6, 0x3e, 0xaf, 0xa5, 0x15, 0xa3, 0x04, 0x27});
            PwUuid entry5Uuid = new PwUuid(new byte[] {
                0xe5, 0x9f, 0xf2, 0xed, 0x05, 0x12, 0x47, 0x47,
                0xb6, 0x3e, 0xaf, 0xa5, 0x15, 0xa3, 0x04, 0x28});

            PwGroup kfpg = RPCService.GetRootPwGroup(pd).FindGroup(groupUuid, false);
            if (kfpg == null)
            {
                kfpg = new PwGroup(false, true, "KeeFox", PwIcon.Folder);
                kfpg.Uuid = groupUuid;
                kfpg.CustomIconUuid = iconUuid;
                pd.RootGroup.AddGroup(kfpg, true);
            }

            if (kfpg.FindEntry(entry1Uuid, false) == null)
            {
                PwEntry pe = createKeeFoxSample(pd, entry1Uuid,
                    "Quick Start (double click on the URL to learn how to use KeeFox)",
                    "testU1", "testP1", @"http://tutorial.keefox.org/", null);
                kfpg.AddEntry(pe, true);
            }

            if (kfpg.FindEntry(entry2Uuid, false) == null)
            {
                PwEntry pe = createKeeFoxSample(pd, entry2Uuid,
                    "KeeFox sample entry with alternative URL",
                    "testU2", "testP2", @"http://does.not.exist/", @"This sample helps demonstrate the use of alternative URLs to control which websites each password entry should apply to.");
                pe.Strings.Set("KeeFox Priority", new ProtectedString(false, "5"));
                pe.Strings.Set("Alternative URLs", new ProtectedString(false, @"http://tutorial-section-c.keefox.org/part3"));
                kfpg.AddEntry(pe, true);
            }

            if (kfpg.FindEntry(entry3Uuid, false) == null)
            {
                PwEntry pe = createKeeFoxSample(pd, entry3Uuid,
                    "KeeFox sample entry with no auto-fill and no auto-submit",
                    "testU3", "testP3", @"http://tutorial-section-d.keefox.org/part4", @"This sample helps demonstrate the use of advanced settings that give you fine control over the behaviour of a password entry. In this specific example, the entry has been set to never automatically fill matching login forms when the web page loads and to never automatically submit, even when you have explicity told KeeFox to log in to this web page.");
                pe.Strings.Set("KeeFox Priority", new ProtectedString(false, "2"));
                pe.Strings.Set("KeeFox Never Auto Fill", new ProtectedString(false, ""));
                pe.Strings.Set("KeeFox Never Auto Submit", new ProtectedString(false, ""));
                kfpg.AddEntry(pe, true);
            }
            //TODO: demo of complex form with select drop downs, etc.

            if (kfpg.FindEntry(entry5Uuid, false) == null)
            {
                PwEntry pe = createKeeFoxSample(pd, entry5Uuid,
                    "KeeFox sample entry for HTTP authentication",
                    "testU4", "testP4", @"http://tutorial-section-d.keefox.org/part6", @"This sample helps demonstrate logging in to HTTP authenticated websites.");
                pe.Strings.Set("KeeFox Priority", new ProtectedString(false, "20"));
                pe.Strings.Set("Form HTTP realm", new ProtectedString(false, "KeeFox tutorial sample"));
                kfpg.AddEntry(pe, true);
            }

            //pwe.Strings.Set("Form field " + kpff.Name + " value", new ProtectedString(false, kpff.Value));
            //        pwe.Strings.Set("Form field " + kpff.Name + " type", new ProtectedString(false, "select"));
            //    }

            //    pwe.Strings.Set("Form field " + kpff.Name + " page", new ProtectedString(false, kpff.Page.ToString()));

            //    if (kpff.Id != null && kpff.Id.Length > 0)
            //        pwe.Strings.Set("Form field " + kpff.Name + " id", new ProtectedString(false, kpff.Id));

            //return whether change was made

        }

        private PwEntry createKeeFoxSample(PwDatabase pd, PwUuid uuid, string title, string username, string password, string url, string notes)
        {
            if (string.IsNullOrEmpty(title)) title = "KeeFox sample entry";
            if (string.IsNullOrEmpty(url)) url = @"http://tutorial.keefox.org/";
            notes = @"This password entry is part of the KeeFox tutorial. To start the tutorial, launch Firefox and load http://tutorial.keefox.org/.

Deleting it will not prevent KeeFox or KeePass from working correctly but you will not be able to use the tutorial at http://tutorial.keefox.org/.

You can recreate these entries by selecting Tools / Insert KeeFox tutorial samples." + (string.IsNullOrEmpty(notes) ? "" : (@"

" + notes));

            PwEntry pe = new PwEntry(false, true);
            pe.Uuid = uuid;
            pe.Strings.Set(PwDefs.TitleField, new ProtectedString(
                pd.MemoryProtection.ProtectTitle, title));
            pe.Strings.Set(PwDefs.UserNameField, new ProtectedString(
                pd.MemoryProtection.ProtectUserName, username));
            pe.Strings.Set(PwDefs.UrlField, new ProtectedString(
                pd.MemoryProtection.ProtectUrl, url));
            pe.Strings.Set(PwDefs.PasswordField, new ProtectedString(
                pd.MemoryProtection.ProtectPassword, password));
            pe.Strings.Set(PwDefs.NotesField, new ProtectedString(
                pd.MemoryProtection.ProtectNotes, notes));
            pe.AutoType.Set(KPRes.TargetWindow, 
                @"{USERNAME}{TAB}{PASSWORD}{TAB}{ENTER}");
            return pe;
        }

        private PwUuid GetKeeFoxIcon()
        {
            //return null;

            // {EB9FF2ED-0512-4747-B63E-AFA515A30422}
            PwUuid keeFoxIconUuid = new PwUuid(new byte[] {
                0xeb, 0x9f, 0xf2, 0xed, 0x05, 0x12, 0x47, 0x47,
                0xb6, 0x3e, 0xaf, 0xa5, 0x15, 0xa3, 0x04, 0x22});

            PwCustomIcon icon = null;

            foreach (PwCustomIcon testIcon in _host.Database.CustomIcons)
            {
                if (testIcon.Uuid == keeFoxIconUuid)
                {
                    icon = testIcon;
                    break;
                }
            }
            
            if (icon == null)
            {
                MemoryStream ms = new MemoryStream();
                global::KeePassRPC.Properties.Resources.KeeFox16.Save(ms, System.Drawing.Imaging.ImageFormat.Png);

                // Create a new custom icon for use with this entry
                icon = new PwCustomIcon(keeFoxIconUuid,
                    ms.ToArray());
                _host.Database.CustomIcons.Add(icon);
            }
            return keeFoxIconUuid;
            

            //string keeFoxIcon = @"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAFfKj/FAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAABpUExURf///wAAAAAAAFpaWl5eXm5ubnh4eICAgIeHh5GRkaCgoKOjo66urq+vr8jIyMnJycvLy9LS0uDg4Ovr6+zs7O3t7e7u7u/v7/X19fb29vf39/j4+Pn5+fr6+vv7+/z8/P39/f7+/v///5goWdMAAAADdFJOUwAxTTRG/kEAAACRSURBVBjTTY2JEoMgDESDaO0h9m5DUZT9/49sCDLtzpB5eQwLkSTkwb0cOBnJksYxiHqORHZG3gFc88WReTzvBFoOMbUCVkN/ATw3CnwHmwLjpYCfYoF5TQphAUztMfp5zsm5phY6MEsV+LapYRPAoC/ooOLxfL33RXQifJjjsnZFWPBniksCbBU+6F4FmV+IvtrgDOmaq+PeAAAAAElFTkSuQmCC";

            //byte[] msByteArray = ms.ToArray();

                //foreach (PwCustomIcon item in _host.Database.CustomIcons)
                //{
                //    var t = item.Image.[1][2];
                //    // re-use existing custom icon if it's already in the database
                //    // (This will probably fail if database is used on 
                //    // both 32 bit and 64 bit machines - not sure why...)
                //    if (KeePassLib.Utility.MemUtil.ArraysEqual(msByteArray, item.ImageDataPng))
                //    {
                //        pwe.CustomIconUuid = item.Uuid;
                //        m_host.Database.UINeedsIconUpdate = true;
                //        return;
                //    }
                //}

            //    // Create a new custom icon for use with this entry
            //    PwCustomIcon pwci = new PwCustomIcon(new PwUuid(true),
            //        ms.ToArray());
            //    m_host.Database.CustomIcons.Add(pwci);

            //    return pwci.Uuid;
        }

        private void CreateClientManagers()
        {
            lock (_lockRPCClientManagers)
            {
                _RPCClientManagers.Add("null", new NullRPCClientManager());

                //TODO2: load managers from plugins, etc.
                _RPCClientManagers.Add("KeeFox", new KeeFoxRPCClientManager());
            }
        }

        private void PromoteNullRPCClient(KeePassRPCClientConnection connection, KeePassRPCClientManager destination)
        {
            lock (_lockRPCClientManagers)
            {
                ((NullRPCClientManager)_RPCClientManagers["null"]).RemoveRPCClientConnection(connection);
                destination.AddRPCClientConnection(connection);
            }
        }

        internal void PromoteNullRPCClient(KeePassRPCClientConnection connection, string clientName)
        {
            string managerName = "null";
            switch (clientName)
            {
                case "KeeFox Firefox add-on": managerName = "KeeFox"; break;
            }

            PromoteNullRPCClient(connection,_RPCClientManagers[managerName]);
        }

		/// <summary>
		/// Free resources
		/// </summary>
        public override void Terminate()
        {
            RPCServer.Terminate();
            lock (_lockRPCClientManagers)
            {
                foreach (KeePassRPCClientManager manager in _RPCClientManagers.Values)
                    manager.Terminate();
                _RPCClientManagers.Clear();
            }

            // Tell any waiting RPC threads to just go ahead (and not wait for the user to finish interacting
            // with the KP UI.
            KeePassRPCService.ensureDBisOpenEWH.Set();

            // remove event listeners
            _host.MainWindow.FileOpened -= OnKPDBOpen;
            _host.MainWindow.FileClosed -= OnKPDBClose;
            _host.MainWindow.FileCreated -= OnKPDBOpen; // or need a specific handler here?
            _host.MainWindow.FileSaving -= OnKPDBSaving;
            _host.MainWindow.FileSaved -= OnKPDBSaved;
            _host.MainWindow.DocumentManager.ActiveDocumentSelected -= OnKPDBSelected;

            GlobalWindowManager.WindowAdded -= GwmWindowAddedHandler;

            // Remove 'Tools' menu items
            ToolStripItemCollection tsMenu = _host.MainWindow.ToolsMenu.DropDownItems;
            tsMenu.Remove(_keePassRPCOptions);

            // Remove group context menu items
            ContextMenuStrip gcm = _host.MainWindow.GroupContextMenu;
            gcm.Items.Remove(_tsSeparator1);
            gcm.Items.Remove(_keeFoxRootMenu);
        }

        private void OnKPDBSelected(object sender, EventArgs e)
        {
            SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_SELECTED);
        }

        private void OnKPDBOpen(object sender, FileCreatedEventArgs e)
        {
            KeePassRPCService.ensureDBisOpenEWH.Set(); // signal that DB is now open so any waiting ICE thread can go ahead
            SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_OPEN);
        }

        private void OnKPDBOpen(object sender, FileOpenedEventArgs e)
        {
            KeePassRPCService.ensureDBisOpenEWH.Set(); // signal that DB is now open so any waiting ICE thread can go ahead
            SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_OPEN);
        }

        private void OnKPDBClose(object sender, FileClosedEventArgs e)
        {
            KeePassRPCService.ensureDBisOpenEWH.Set(); // signal that DB is now open so any waiting ICE thread can go ahead
            SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_CLOSED);
        }

        private void OnKPDBSaving(object sender, FileSavingEventArgs e)
        {
            SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_SAVING);
        }

        private void OnKPDBSaved(object sender, FileSavedEventArgs e)
        {
            SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_SAVED);
        }

        private void SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal signal)
        {
            foreach (KeePassRPCClientManager manager in _RPCClientManagers.Values)
                manager.SignalAll(signal);
        }

        internal void AddRPCClientConnection(KeePassRPCClientConnection keePassRPCClient)
        {
            lock (_lockRPCClientManagers)
            {
                _RPCClientManagers["null"].AddRPCClientConnection(keePassRPCClient);
            }
        }

        internal void RemoveRPCClientConnection(KeePassRPCClientConnection keePassRPCClient)
        {
            lock (_lockRPCClientManagers)
            {
                // this generally only happens at conenction shutdown time so think we get away with a search like this
                foreach (KeePassRPCClientManager manager in _RPCClientManagers.Values)
                    foreach (KeePassRPCClientConnection connection in manager.CurrentRPCClientConnections)
                        if (connection == keePassRPCClient)
                            manager.RemoveRPCClientConnection(keePassRPCClient);
                //     _RPCClientManagers["null"]
                // RemoveRPCClientConnection(keePassRPCClient);
            }
        }
    }

    public class Log : KeePassLib.Interfaces.IStatusLogger
    {
        public bool ContinueWork()
        {
            return true;
        }

        public void EndLogging()
        {
            return;
        }

        public bool SetProgress(uint uPercent)
        {
            return true;
        }

        public bool SetText(string strNewText, KeePassLib.Interfaces.LogStatusType lsType)
        {
            return true;
        }

        public void StartLogging(string strOperation, bool bWriteOperationToLog)
        {
            throw new NotImplementedException();
        }
    }


}