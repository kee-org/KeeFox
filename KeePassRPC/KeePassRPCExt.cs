/*
  KeePassRPC - Uses JSON-RPC to provide RPC facilities to KeePass.
  Example usage includes the KeeFox firefox extension.
  
  Copyright 2011 Chris Tomlinson <keefox@christomlinson.name>

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

using System.Runtime.Remoting.Lifetime;
using KeePassRPC.DataExchangeModel;
//using System.Web;

namespace KeePassRPC
{
	/// <summary>
	/// The main class - starts the RPC service and server
	/// </summary>
	public sealed class KeePassRPCExt : Plugin
	{
        //private static LifetimeServices fakeHack = new LifetimeServices();

        // version information
        public static readonly Version PluginVersion = new Version(1,2,1);
                
        private KeePassRPCServer _RPCServer;
        private KeePassRPCService _RPCService;

        public TextWriter logger;

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
        public string CurrentConfigVersion = "1";

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
            try
            {

                Debug.Assert(host != null);
                if (host == null)
                    return false;
                _host = host;

                string debugFileName = host.CommandLineArgs["KPRPCDebug"];
                if (debugFileName != null)
                {
                    try
                    {
                        logger = new StreamWriter(debugFileName);
						((StreamWriter)logger).AutoFlush = true;
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show("KeePassRPC debug logger failed to initialise. No logging will be performed until KeePass is restarted with a valid debug log file location. Reason: " + ex.ToString());
                    }
                }
                if (logger != null) logger.WriteLine("Logger initialised.");

                //AppDomain.CurrentDomain.AssemblyResolve += 
                //new ResolveEventHandler(CurrentDomain_AssemblyResolve);
        


                CreateClientManagers();

                if (logger != null) logger.WriteLine("Client managers started.");
                //TODO2: set up language services

                _RPCService = new KeePassRPCService(host,
                    getStandardIconsBase64(host.MainWindow.ClientIcons), this);
                if (logger != null) logger.WriteLine("RPC service started.");
                _RPCServer = new KeePassRPCServer(FindKeePassRPCPort(host), RPCService, this, FindKeePassRPCSSLEnabled(host));
                if (logger != null) logger.WriteLine("RPC server started.");

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
            }
            catch (Exception ex)
            {
                if (logger != null) logger.WriteLine("KPRPC startup failed: " + ex.ToString());
                return false;
            }
            if (logger != null) logger.WriteLine("KPRPC startup succeeded.");
			return true; // Initialization successful
		}

        //Assembly CurrentDomain_AssemblyResolve(object sender, ResolveEventArgs args)
        //{
        //    MessageBox.Show("assembly: " + args.Name);
        //    AssemblyName name = new AssemblyName(args.Name);
        //    if (name.Name == "System.Web, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a")
        //    {
        //        return typeof(System.Web.HttpApplication).Assembly;
        //    }
        //    return null;
        //}
        
		void GlobalWindowManager_WindowAdded(object sender, GwmWindowEventArgs e)
		{
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

            lock (_lockRPCClientManagers)
            {
                //TODO2: Only consider managers of client types that have at least one valid client already authorised
                foreach (KeePassRPCClientManager manager in _RPCClientManagers.Values)
                    if (manager.Name != "Null")
                        manager.AttachToGroupDialog(this, group, mainTabControl);
            }
		}

        void editEntryFormShown(object sender, EventArgs e)
        {
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

            lock (_lockRPCClientManagers)
            {
                //TODO2: Only consider managers of client types that have at least one valid client already authorised
                foreach (KeePassRPCClientManager manager in _RPCClientManagers.Values)
                    if (manager.Name != "Null")
                        manager.AttachToEntryDialog(this, entry, mainTabControl, form, advancedListView, strings);
            }
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
            if (_host.Database != null && _host.Database.IsOpen)
            {
                InstallKeeFoxSampleEntries(_host.Database, false);
                _host.MainWindow.UpdateUI(true, null, true, null, true, null, true);
            }
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


        public delegate object GetCustomIconDelegate(PwUuid uuid);


        public Image GetCustomIcon(PwUuid uuid)
        {
            return _host.Database.GetCustomIcon(uuid);
        }

        private void EnsureDBIconIsInKPRPCIconCache()
        {
            string cachedBase64 = DataExchangeModel.IconCache<string>
                .GetIconEncoding(_host.Database.IOConnectionInfo.GetDisplayName());
            if (string.IsNullOrEmpty(cachedBase64))
            {
                // the icon wasn't in the cache so lets calculate its base64 encoding and then add it to the cache
                MemoryStream ms = new MemoryStream();
                Image imgNew = new Bitmap(_host.MainWindow.Icon.ToBitmap(), new Size(16, 16));
                imgNew.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                string imageData = Convert.ToBase64String(ms.ToArray());
                DataExchangeModel.IconCache<string>
                    .AddIcon(_host.Database.IOConnectionInfo.GetDisplayName(), imageData);
            }
         }

        /// <summary>
        /// Called when [file new].
        /// </summary>
        /// <remarks>Review whenever private KeePass.MainForm.OnFileNew method changes.</remarks>
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

            KeePassLib.Keys.CompositeKey key = null;
            KeyCreationSimpleForm kcsf = new KeyCreationSimpleForm();
            bool showUsualKeePassKeyCreationDialog = false;

            // Don't show the simple key creation form if the user has set
            // security policies that restrict the allowable composite key sources
            if (KeePass.Program.Config.UI.KeyCreationFlags == 0)
            {            
                kcsf.InitEx(KeePassLib.Serialization.IOConnectionInfo.FromPath(strPath), true);
                dr = kcsf.ShowDialog(_host.MainWindow);
                if ((dr == DialogResult.Cancel) || (dr == DialogResult.Abort)) return;
                if (dr == DialogResult.No)
                {
                    showUsualKeePassKeyCreationDialog = true;
                } else
                {
                    key = kcsf.CompositeKey;
                }
            } else
            {
                showUsualKeePassKeyCreationDialog = true;
            }

            if (showUsualKeePassKeyCreationDialog)
            {
                KeyCreationForm kcf = new KeyCreationForm();
                kcf.InitEx(KeePassLib.Serialization.IOConnectionInfo.FromPath(strPath), true);
                dr = kcf.ShowDialog(_host.MainWindow);
                if ((dr == DialogResult.Cancel) || (dr == DialogResult.Abort)) return;
                key = kcf.CompositeKey;
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

            InstallKeeFoxSampleEntries(pd, false);

            pd.CustomData.Set("KeePassRPC.KeeFox.configVersion", "1");

            // save the new database & update UI appearance
            pd.Save(_host.MainWindow.CreateStatusBarLogger());
            _host.MainWindow.UpdateUI(true, null, true, null, true, null, false);
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

        private void InstallKeeFoxSampleEntries(PwDatabase pd, bool skipGroupWarning)
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

            PwGroup kfpg = RPCService.GetRootPwGroup(pd,"").FindGroup(groupUuid, false);
            if (kfpg == null)
            {
                // check that the group doesn't exist outside of the visible home group
                PwGroup kfpgTestRoot = pd.RootGroup.FindGroup(groupUuid, false);
                if (kfpgTestRoot != null && !skipGroupWarning)
                {
                    MessageBox.Show("The KeeFox group already exists but your current home group setting is preventing KeeFox from seeing it. Please change your home group or move the 'KeeFox' group to a location inside your current home group.", "Warning", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }
                else
                {
                    kfpg = new PwGroup(false, true, "KeeFox", PwIcon.Folder);
                    kfpg.Uuid = groupUuid;
                    kfpg.CustomIconUuid = iconUuid;
                    pd.RootGroup.AddGroup(kfpg, true);
                }
            }

            if (pd.RootGroup.FindEntry(entry1Uuid, true) == null)
            {
                PwEntry pe = createKeeFoxSample(pd, entry1Uuid,
                    "Quick Start (double click on the URL to learn how to use KeeFox)",
                    "testU1", "testP1", @"http://tutorial.keefox.org/", null);
                kfpg.AddEntry(pe, true);
            }

            if (pd.RootGroup.FindEntry(entry2Uuid, false) == null)
            {
                PwEntry pe = createKeeFoxSample(pd, entry2Uuid,
                    "KeeFox sample entry with alternative URL",
                    "testU2", "testP2", @"http://does.not.exist/", @"This sample helps demonstrate the use of alternative URLs to control which websites each password entry should apply to.");
                KeePassRPC.DataExchangeModel.EntryConfig conf = new DataExchangeModel.EntryConfig();
                conf.Version = 1;
                conf.Priority = 5;
                conf.AltURLs = new string[] { @"http://tutorial-section-c.keefox.org/part3" };
                pe.Strings.Set("KPRPC JSON", new ProtectedString(true, Jayrock.Json.Conversion.JsonConvert.ExportToString(conf)));
                kfpg.AddEntry(pe, true);
            }

            if (pd.RootGroup.FindEntry(entry3Uuid, false) == null)
            {
                PwEntry pe = createKeeFoxSample(pd, entry3Uuid,
                    "KeeFox sample entry with no auto-fill and no auto-submit",
                    "testU3", "testP3", @"http://tutorial-section-d.keefox.org/part4", @"This sample helps demonstrate the use of advanced settings that give you fine control over the behaviour of a password entry. In this specific example, the entry has been set to never automatically fill matching login forms when the web page loads and to never automatically submit, even when you have explicity told KeeFox to log in to this web page.");
                KeePassRPC.DataExchangeModel.EntryConfig conf = new DataExchangeModel.EntryConfig();
                conf.Version = 1;
                conf.Priority = 2;
                conf.NeverAutoFill = true;
                conf.NeverAutoSubmit = true;
                pe.Strings.Set("KPRPC JSON", new ProtectedString(true, Jayrock.Json.Conversion.JsonConvert.ExportToString(conf)));
                kfpg.AddEntry(pe, true);
            }

            if (pd.RootGroup.FindEntry(entry5Uuid, false) == null)
            {
                PwEntry pe = createKeeFoxSample(pd, entry5Uuid,
                    "KeeFox sample entry for HTTP authentication",
                    "testU4", "testP4", @"http://tutorial-section-d.keefox.org/part6", @"This sample helps demonstrate logging in to HTTP authenticated websites.");
                KeePassRPC.DataExchangeModel.EntryConfig conf = new DataExchangeModel.EntryConfig();
                conf.Version = 1;
                conf.Priority = 20;
                conf.HTTPRealm = "KeeFox tutorial sample";
                pe.Strings.Set("KPRPC JSON", new ProtectedString(true, Jayrock.Json.Conversion.JsonConvert.ExportToString(conf)));
                kfpg.AddEntry(pe, true);
            }

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
            
            //TODO2: get autotype example working again following 2.17 API change?
            //pe.AutoType.Set(KPRes.TargetWindow, 
            //    @"{USERNAME}{TAB}{PASSWORD}{TAB}{ENTER}");
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
                //    *var* t = item.Image.[1][2];
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
            //KeePassRPCService.ensureDBisOpenEWH.Set();

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

            if (logger != null)
                logger.Close();
        }

        private void OnKPDBSelected(object sender, EventArgs e)
        {
            SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_SELECTED);
        }

        private void OnKPDBOpen(object sender, FileCreatedEventArgs e)
        {
            e.Database.CustomData.Set("KeePassRPC.KeeFox.configVersion", "1");
            EnsureDBIconIsInKPRPCIconCache();
            //KeePassRPCService.ensureDBisOpenEWH.Set(); // signal that DB is now open so any waiting JSONRPC thread can go ahead
            SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_OPEN);
        }

        private delegate void dlgSaveDB(PwDatabase databaseToSave);

        void saveDB(PwDatabase databaseToSave)
        {
            // save active database & update UI appearance
            if (_host.MainWindow.UIFileSave(true))
                _host.MainWindow.UpdateUI(false, null, true, null, true, null, false);

        }

        private void OnKPDBOpen(object sender, FileOpenedEventArgs e)
        {
            EnsureDBIconIsInKPRPCIconCache();

            // If we've not already upgraded the KPRPC data for this database...
            if (!e.Database.CustomData.Exists("KeePassRPC.KeeFox.configVersion")
                || e.Database.CustomData.Get("KeePassRPC.KeeFox.configVersion") != "1")
            {
                // We know that this upgrade path may contain duplicate KeeFox
                // sample entries due to an earlier bug so lets get rid of them
                // for good and replace them with a single instance of each. Not
                // a perfect solution but should only cause problems for KeeFox
                // developers and those with OCD and a short fuse.

                PwUuid pwuuid1 = new PwUuid(new byte[] {
                0xe9, 0x9f, 0xf2, 0xed, 0x05, 0x12, 0x47, 0x47,
                0xb6, 0x3e, 0xaf, 0xa5, 0x15, 0xa3, 0x04, 0x24});
                PwUuid pwuuid2 = new PwUuid(new byte[] {
                0xe8, 0x9f, 0xf2, 0xed, 0x05, 0x12, 0x47, 0x47,
                0xb6, 0x3e, 0xaf, 0xa5, 0x15, 0xa3, 0x04, 0x25});
                PwUuid pwuuid3 = new PwUuid(new byte[] {
                0xe7, 0x9f, 0xf2, 0xed, 0x05, 0x12, 0x47, 0x47,
                0xb6, 0x3e, 0xaf, 0xa5, 0x15, 0xa3, 0x04, 0x26});
                PwUuid pwuuid4 = new PwUuid(new byte[] {
                0xe6, 0x9f, 0xf2, 0xed, 0x05, 0x12, 0x47, 0x47,
                0xb6, 0x3e, 0xaf, 0xa5, 0x15, 0xa3, 0x04, 0x27});
                PwUuid pwuuid5 = new PwUuid(new byte[] {
                0xe5, 0x9f, 0xf2, 0xed, 0x05, 0x12, 0x47, 0x47,
                0xb6, 0x3e, 0xaf, 0xa5, 0x15, 0xa3, 0x04, 0x28});

                List<string> uuids = new List<string>(5);
                uuids.Add(pwuuid1.ToHexString());
                uuids.Add(pwuuid2.ToHexString());
                uuids.Add(pwuuid3.ToHexString());
                uuids.Add(pwuuid4.ToHexString());
                uuids.Add(pwuuid5.ToHexString());

                KeePassLib.Collections.PwObjectList<PwEntry> output = new KeePassLib.Collections.PwObjectList<PwEntry>();

                // Scan every entry for matching UUIDs and add them to the list for deletion
                KeePassLib.Delegates.EntryHandler ehdup = delegate(PwEntry pe)
                {
                    if (uuids.Contains(pe.Uuid.ToHexString()))
                    {
                        output.Add(pe);
                    }
                    return true;
                };
                e.Database.RootGroup.TraverseTree(TraversalMethod.PreOrder, null, ehdup);

                // Tidy up
                if (output.UCount > 0)
                {
                    foreach (PwEntry pwe in output)
                    {
                        pwe.ParentGroup.Entries.Remove(pwe);
                    }
                    InstallKeeFoxSampleEntries(e.Database, true);
                    _host.MainWindow.UpdateUI(false, null, true, null, true, null, true);
                }

                bool foundStringsToUpgrade = false;
                // Scan every string of every entry to find out whether we need to disturb the user
                KeePassLib.Delegates.EntryHandler eh = delegate(PwEntry pe)
                {
                    foreach (KeyValuePair<string, ProtectedString> kvp in pe.Strings)
                    {
                        if (StringIsFromKPRPCv1(kvp.Key))
                        {
                            foundStringsToUpgrade = true;
                            // Cancel our search, we have the answer (unfortunately we can only cancel the search in this group so more organised users will have to wait a little longer)
                            return false;
                        }
                    }
                    return true;
                };

                // If our search is aborted before the end it's becuase we found a string that needs upgrading
                e.Database.RootGroup.TraverseTree(TraversalMethod.PreOrder, null, eh);
                if (foundStringsToUpgrade)
                {
                    DialogResult dr = MessageBox.Show("KeePassRPC (KeeFox) needs to update your database. This process is safe but irreversible so it is strongly recommended that you ensure you have a recent backup of your password database before you continue." + Environment.NewLine + Environment.NewLine + "You can take a backup right now if you want: just find the database file on your system and copy (not move) it to a safe place. The database you are trying to open is located at " + e.Database.IOConnectionInfo.Path + "." + Environment.NewLine + Environment.NewLine + "You will not be able to use this database with older versions of KeeFox once you click OK. Make sure you hold onto your backup copy until you're happy that the upgrade process was successful." + Environment.NewLine + Environment.NewLine + "Press OK to perform the upgrade.", "KeeFox upgrade", MessageBoxButtons.OKCancel, MessageBoxIcon.Warning);
                    if (dr != DialogResult.OK)
                    {
                        // User aborted so we must shut down this database to prevent KeeFox from attempting communication with it
                        e.Database.Close();
                        _host.MainWindow.DocumentManager.CloseDatabase(e.Database);
                        _host.MainWindow.DocumentManager.ActiveDatabase.UINeedsIconUpdate = true;
                        _host.MainWindow.UpdateUI(true, null, true, null, true, null, false);
                        _host.MainWindow.ResetDefaultFocus(null);
                        DialogResult dr2 = MessageBox.Show("KeePassRPC has NOT upgraded your database. The database has been closed to protect it from damage." + Environment.NewLine + Environment.NewLine + "It is safe to use this database with older versions of KeeFox but you can not use it with this version until you re-open it and perform the upgrade.", "KeeFox upgrade cancelled", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        return;
                    }
                    else
                    {
                        // User has confirmed they have a recent backup so we start the upgrade

                        // Scan every string of every entry to find entries we will update
                        KeePassLib.Delegates.EntryHandler ehupgrade = delegate(PwEntry pe)
                        {
                            foreach (KeyValuePair<string, ProtectedString> kvp in pe.Strings)
                            {
                                if (StringIsFromKPRPCv1(kvp.Key))
                                {
                                    ConvertKPRPCSeperateStringsToJSON(pe, e.Database);
                                    return true;
                                }
                            }
                            return true;
                        };

                        // If our search is successful we know we've upgraded every entry and can save the DB
                        if (e.Database.RootGroup.TraverseTree(TraversalMethod.PreOrder, null, ehupgrade))
                        {
                            // Store what version of the KPRPC config this is (maybe generously calling
                            // it 1 when I should have included the "1st version" marker 4 years ago!)
                            // Better late than never
                            e.Database.CustomData.Set("KeePassRPC.KeeFox.configVersion", "1");

                            _host.MainWindow.BeginInvoke(new dlgSaveDB(saveDB), e.Database);

                            DialogResult drfinished = MessageBox.Show("KeePassRPC (KeeFox) information upgraded. Press OK to use your updated database.", "KeeFox upgrade", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        }
                    }
                }
                else
                {
                    // Nothing to upgrade in this DB but we'll bump up the config
                    // version count anyway to ensure that even DBs that contain no
                    // specific KPRPC information are able to be accessed 
                    // via KPRPC clients like KeeFox
                    e.Database.CustomData.Set("KeePassRPC.KeeFox.configVersion", "1");
                    _host.MainWindow.BeginInvoke(new dlgSaveDB(saveDB), e.Database);
                }
            }

            SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_OPEN);
        }

        public bool StringIsFromKPRPCv1(string p)
        {
            if (p == "KPRPC JSON") return false;
            if (p.StartsWith("KPRPC ") || p.StartsWith("KeeFox ") || p.StartsWith("Form field ")
                || p == "Alternative URLs" || p == "Form HTTP realm" || p == "Hide from KeeFox"
                || p == "Hide from KPRPC" || p == "Form match URL")
                return true;
            return false;
        }

        private void OnKPDBClose(object sender, FileClosedEventArgs e)
        {
            SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_CLOSED);
        }

        private void OnKPDBSaving(object sender, FileSavingEventArgs e)
        {
            SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_SAVING);
        }

        private void OnKPDBSaved(object sender, FileSavedEventArgs e)
        {
            EnsureDBIconIsInKPRPCIconCache();
            SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_SAVED);
        }

        internal void SignalAllManagedRPCClients(KeePassRPC.DataExchangeModel.Signal signal)
        {
            lock (_lockRPCClientManagers)
            {
                foreach (KeePassRPCClientManager manager in _RPCClientManagers.Values)
                    manager.SignalAll(signal);
            }
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
                // this generally only happens at connection shutdown time so think we get away with a search like this
                foreach (KeePassRPCClientManager manager in _RPCClientManagers.Values)
                    foreach (KeePassRPCClientConnection connection in manager.CurrentRPCClientConnections)
                        if (connection == keePassRPCClient)
                            manager.RemoveRPCClientConnection(keePassRPCClient);
                //     _RPCClientManagers["null"]
                // RemoveRPCClientConnection(keePassRPCClient);
            }
        }



        public string GetPwEntryString(PwEntry pwe, string name, PwDatabase db)
        {
            return pwe.Strings.ReadSafe(name);
        }

        public string GetPwEntryStringFromDereferencableValue(PwEntry pwe, string name, PwDatabase db)
        {
            return KeePass.Util.Spr.SprEngine.Compile(name, false, pwe, db, false, false);
        }

        // This is only called by legacy migration code now
        private string GetFormFieldValue(PwEntry pwe, string fieldName, PwDatabase db)
        {
            string value = "";
            try
            {
                value = GetPwEntryString(pwe, "Form field " + fieldName + " value", db);
            }
            catch (Exception) { value = ""; }
            if (string.IsNullOrEmpty(value))
            {
                try
                {
                    value = GetPwEntryString(pwe, "KPRPC Form field " + fieldName + " value", db);
                }
                catch (Exception) { value = ""; }
            }
            return value;
        }

        private void ConvertKPRPCSeperateStringsToJSON(PwEntry pwe, PwDatabase db)
        {
            //Sanity check to protect against duplicate updates
            if (pwe.Strings.Exists("KPRPC JSON"))
                return;

            ArrayList formFieldList = new ArrayList();
            ArrayList URLs = new ArrayList();
            //bool usernameFound = false;
            bool passwordFound = false;
            bool alwaysAutoFill = false;
            bool neverAutoFill = false;
            bool alwaysAutoSubmit = false;
            bool neverAutoSubmit = false;
            int priority = 0;
            string usernameName = "";
            string usernameValue = "";


            foreach (System.Collections.Generic.KeyValuePair
                <string, KeePassLib.Security.ProtectedString> pwestring in pwe.Strings)
            {
                string pweKey = pwestring.Key;
                string pweValue = pwestring.Value.ReadString();

                if ((pweKey.StartsWith("Form field ") || pweKey.StartsWith("KPRPC Form field ")) && pweKey.EndsWith(" type") && pweKey.Length > 16)
                {
                    string fieldName = "";
                    if (pweKey.StartsWith("Form field "))
                        fieldName = pweKey.Substring(11).Substring(0, pweKey.Length - 11 - 5);
                    else
                        fieldName = pweKey.Substring(17).Substring(0, pweKey.Length - 17 - 5);

                    string fieldId = "";
                    int fieldPage = 1;

                    if (pwe.Strings.Exists("Form field " + fieldName + " page"))
                    {
                        try
                        {
                            fieldPage = int.Parse(GetPwEntryString(pwe, "Form field " + fieldName + " page", db));
                        }
                        catch (Exception)
                        {
                            fieldPage = 1;
                        }
                    }
                    else if (pwe.Strings.Exists("KPRPC Form field " + fieldName + " page"))
                    {
                        try
                        {
                            fieldPage = int.Parse(GetPwEntryString(pwe, "KPRPC Form field " + fieldName + " page", db));
                        }
                        catch (Exception)
                        {
                            fieldPage = 1;
                        }
                    }

                    if (pwe.Strings.Exists("Form field " + fieldName + " id"))
                        fieldId = GetPwEntryString(pwe, "Form field " + fieldName + " id", db);
                    else if (pwe.Strings.Exists("KPRPC Form field " + fieldName + " id"))
                        fieldId = GetPwEntryString(pwe, "KPRPC Form field " + fieldName + " id", db);

                    //Not going to backfill missing passwords and usernames but we do need to convert from old value placeholder to new one
                    if (pweValue == "password")
                    {
                        if (pwe.Strings.Exists("Form field " + fieldName + " value"))
                            formFieldList.Add(new FormField(fieldName,
                                fieldName, GetPwEntryString(pwe, "Form field " + fieldName + " value", db), FormFieldType.FFTpassword, fieldId, fieldPage));
                        else if (pwe.Strings.Exists("KPRPC Form field " + fieldName + " value"))
                            formFieldList.Add(new FormField(fieldName,
                                fieldName, GetPwEntryString(pwe, "KPRPC Form field " + fieldName + " value", db), FormFieldType.FFTpassword, fieldId, fieldPage));
                        else if (!passwordFound) // it's the default password
                        {
                            formFieldList.Add(new FormField(fieldName,
                                "KeePass password", "{PASSWORD}", FormFieldType.FFTpassword, fieldId, fieldPage));
                            passwordFound = true;
                        }
                    }
                    else if (pweValue == "username")
                    {
                        string displayUser = "KeePass username";
                        //if (usernameFound)
                        //    displayUser = fieldName;
                        formFieldList.Add(new FormField(fieldName,
                            displayUser, "{USERNAME}", FormFieldType.FFTusername, fieldId, fieldPage));
                        usernameName = fieldName;
                        usernameValue = GetPwEntryString(pwe, "UserName", db);
                        //usernameFound = true;
                    }
                    else if (pweValue == "text")
                    {
                        formFieldList.Add(new FormField(fieldName,
                fieldName, GetFormFieldValue(pwe, fieldName, db), FormFieldType.FFTtext, fieldId, fieldPage));
                    }
                    else if (pweValue == "radio")
                    {
                        formFieldList.Add(new FormField(fieldName,
                fieldName, GetFormFieldValue(pwe, fieldName, db), FormFieldType.FFTradio, fieldId, fieldPage));
                    }
                    else if (pweValue == "select")
                    {
                        formFieldList.Add(new FormField(fieldName,
                fieldName, GetFormFieldValue(pwe, fieldName, db), FormFieldType.FFTselect, fieldId, fieldPage));
                    }
                    else if (pweValue == "checkbox")
                    {
                        formFieldList.Add(new FormField(fieldName,
                fieldName, GetFormFieldValue(pwe, fieldName, db), FormFieldType.FFTcheckbox, fieldId, fieldPage));
                    }
                }
                else if (pweKey == "Alternative URLs" || pweKey == "KPRPC Alternative URLs")
                {
                    string[] urlsArray = pweValue.Split(new char[] { ' ' });
                    foreach (string altURL in urlsArray)
                        if (!string.IsNullOrEmpty(altURL)) URLs.Add(altURL);

                }
            }

            if (pwe.Strings.Exists("KeeFox Always Auto Fill") || pwe.Strings.Exists("KPRPC Always Auto Fill"))
                alwaysAutoFill = true;
            if (pwe.Strings.Exists("KeeFox Always Auto Submit") || pwe.Strings.Exists("KPRPC Always Auto Submit"))
                alwaysAutoSubmit = true;
            if (pwe.Strings.Exists("KeeFox Never Auto Fill") || pwe.Strings.Exists("KPRPC Never Auto Fill"))
                neverAutoFill = true;
            if (pwe.Strings.Exists("KeeFox Never Auto Submit") || pwe.Strings.Exists("KPRPC Never Auto Submit"))
                neverAutoSubmit = true;

            if (pwe.Strings.Exists("KeeFox Priority"))
            {
                string priorityString = pwe.Strings.ReadSafe("KeeFox Priority");
                if (!string.IsNullOrEmpty(priorityString))
                {
                    try
                    {
                        priority = int.Parse(priorityString);
                    }
                    catch
                    { }

                    if (priority < 0 || priority > 100000)
                        priority = 0;
                }
            }
            if (pwe.Strings.Exists("KPRPC Priority"))
            {
                string priorityString = pwe.Strings.ReadSafe("KPRPC Priority");
                if (!string.IsNullOrEmpty(priorityString))
                {
                    try
                    {
                        priority = int.Parse(priorityString);
                    }
                    catch
                    { }

                    if (priority < 0 || priority > 100000)
                        priority = 0;
                }
            }

            string realm = "";
            try
            {
                realm = GetPwEntryString(pwe, "Form HTTP realm", db);
            }
            catch (Exception) { realm = ""; }
            if (string.IsNullOrEmpty(realm))
            {
                try
                {
                    realm = GetPwEntryString(pwe, "KPRPC Form HTTP realm", db);
                }
                catch (Exception) { realm = ""; }
            }
            if (string.IsNullOrEmpty(realm))
            {
                try
                {
                    realm = GetPwEntryString(pwe, "KPRPC HTTP realm", db);
                }
                catch (Exception) { realm = ""; }
            }


            EntryConfig conf = new EntryConfig();
            conf.Hide = false;
            string hide = "";
            try
            {
                hide = GetPwEntryString(pwe, "Hide from KeeFox", db);
                if (!string.IsNullOrEmpty(hide))
                    conf.Hide = true;
            }
            catch (Exception) { hide = ""; }
            if (string.IsNullOrEmpty(hide))
            {
                try
                {
                    hide = GetPwEntryString(pwe, "Hide from KPRPC", db);
                    if (!string.IsNullOrEmpty(hide))
                        conf.Hide = true;
                }
                catch (Exception) { hide = ""; }
            }

            conf.BlockHostnameOnlyMatch = false;
            string block = "";
            try
            {
                block = GetPwEntryString(pwe, "KPRPC Block hostname-only match", db);
                if (!string.IsNullOrEmpty(block))
                    conf.BlockHostnameOnlyMatch = true;
            }
            catch (Exception) { block = ""; }


            FormField[] temp = (FormField[])formFieldList.ToArray(typeof(FormField));

            conf.AltURLs = (string[])URLs.ToArray(typeof(string));

            try
            {
                List<string> listNormalBlockedURLs = new List<string>();
                string urls = GetPwEntryString(pwe, "KPRPC Blocked URLs", db);
                foreach (string url in urls.Split(' '))
                    if (!string.IsNullOrEmpty(url)) listNormalBlockedURLs.Add(url);
                conf.BlockedURLs = listNormalBlockedURLs.ToArray();
            }
            catch (Exception) { }

            try
            {
                List<string> listRegExURLs = new List<string>();
                string urls = GetPwEntryString(pwe, "KPRPC URL Regex match", db);
                foreach (string url in urls.Split(' '))
                    if (!string.IsNullOrEmpty(url)) listRegExURLs.Add(url);
                conf.RegExURLs = listRegExURLs.ToArray();
            }
            catch (Exception) { }

            try
            {
                List<string> listRegExBlockedURLs = new List<string>();
                string urls = GetPwEntryString(pwe, "KPRPC URL Regex block", db);
                foreach (string url in urls.Split(' '))
                    if (!string.IsNullOrEmpty(url)) listRegExBlockedURLs.Add(url);
                conf.RegExBlockedURLs = listRegExBlockedURLs.ToArray();
            }
            catch (Exception) { }


            conf.AlwaysAutoFill = alwaysAutoFill;
            conf.AlwaysAutoSubmit = alwaysAutoSubmit;
            conf.FormActionURL = GetPwEntryString(pwe, "Form match URL", db);
            conf.FormFieldList = temp;
            conf.HTTPRealm = realm;
            conf.NeverAutoFill = neverAutoFill;
            conf.NeverAutoSubmit = neverAutoSubmit;
            conf.Priority = priority;
            conf.Version = 1;

            // Store the new config info
            pwe.Strings.Set("KPRPC JSON", new ProtectedString(true, Jayrock.Json.Conversion.JsonConvert.ExportToString(conf)));

            // Delete all old advanced strings...

            List<string> advancedStringKeysToDelete = new List<string>();

            foreach (KeyValuePair<string, ProtectedString> kvp in pwe.Strings)
            {
                if (StringIsFromKPRPCv1(kvp.Key))
                {
                    // Not sure how kindly KeePass would take to DB changes while iterating so we'll store a list for later
                    advancedStringKeysToDelete.Add(kvp.Key);
                }
            }

            foreach (string item in advancedStringKeysToDelete)
            {
                pwe.Strings.Remove(item);
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