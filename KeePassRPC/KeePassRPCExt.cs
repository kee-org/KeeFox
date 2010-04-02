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

namespace KeePassRPC
{
	/// <summary>
	/// The main class - starts the RPC service and server
	/// </summary>
	public sealed class KeePassRPCExt : Plugin
	{
        // version information
        public static readonly Version PluginVersion = new Version(0,7,6);
                
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

        IPluginHost _host;

        private ToolStripMenuItem _keePassRPCOptions = null;
        private ToolStripSeparator _tsSeparator1 = null;
        private ToolStripMenuItem _keeFoxRootMenu = null;

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

            _RPCService = new KeePassRPCService(host, 
                getStandardIconsBase64(host.MainWindow.ClientIcons), this);
            _RPCServer = new KeePassRPCServer(FindKeePassRPCPort(host), RPCService);

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
            _keePassRPCOptions.Text = "KeePassRPC (KeeFox) Options";
            _keePassRPCOptions.Click += OnToolsOptions;
            _keePassRPCOptions.Enabled = true;
            tsMenu.Add(_keePassRPCOptions);

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

			return true; // Initialization successful
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
            KeePassRPC.OptionsForm ofDlg = new KeePassRPC.OptionsForm(_host);
            ofDlg.ShowDialog();
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
            DialogResult dr = wf.ShowDialog(); //TODO: explain / warn on dialog and provide a Cancel button

            if (dr == DialogResult.Yes || dr == DialogResult.No)
                RPCService.AddKnownRPCClient(client);
            if (dr == DialogResult.Yes)
                CreateNewDatabase();
            if (dr == DialogResult.Yes || dr == DialogResult.No)
                return 0;
            return 1;
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
            DialogResult dr = sfd.ShowDialog();
            GlobalWindowManager.RemoveDialog(sfd);

            string strPath = sfd.FileName;

            if (dr != DialogResult.OK) return;

            KeePassLib.Keys.CompositeKey key;
            KeyCreationSimpleForm kcsf = new KeyCreationSimpleForm();
            kcsf.InitEx(KeePassLib.Serialization.IOConnectionInfo.FromPath(strPath), true);
            dr = kcsf.ShowDialog();
            if ((dr == DialogResult.Cancel) || (dr == DialogResult.Abort)) return;
            if (dr == DialogResult.No)
            {
                KeyCreationForm kcf = new KeyCreationForm();
                kcf.InitEx(KeePassLib.Serialization.IOConnectionInfo.FromPath(strPath), true);
                dr = kcf.ShowDialog();
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

            InstallKeeFoxSampleEntries(pd);

            _host.MainWindow.UpdateUI(true, null, true, null, true, null, true);

            // TODO: Can't raise FileCreated event from a plugin?
            //if (keeICEServer.m_host.MainWindow.FileCreated != null)
            //{
            //    FileCreatedEventArgs ea = new FileCreatedEventArgs(pd);
            //    keeICEServer.m_host.MainWindow.FileCreated(this, ea);
            //}
        }

        private void InstallKeeFoxSampleEntries(PwDatabase pd)
        {
            // TODO: add KeeFox icon to Database cache and use it
            PwGroup kfpg = new PwGroup(true, true, "KeeFox", PwIcon.Homebanking);
            pd.RootGroup.AddGroup(kfpg, true);

            //TODO: Set up a sample KeeFox friendly group and entry (maybe for http://practice.keefox.org and practice.keefox.org/advanced/etc/ inc. multi-page step throughs, etc.)
            PwEntry pe = new PwEntry(true, true);
            pe.Strings.Set(PwDefs.TitleField, new ProtectedString(pd.MemoryProtection.ProtectTitle,
                "Quick Start (double click on the URL to learn how to use KeeFox)"));
            pe.Strings.Set(PwDefs.UserNameField, new ProtectedString(pd.MemoryProtection.ProtectUserName,
                KPRes.UserName));
            pe.Strings.Set(PwDefs.UrlField, new ProtectedString(pd.MemoryProtection.ProtectUrl,
                @"http://www.somesite.com/"));
            pe.Strings.Set(PwDefs.PasswordField, new ProtectedString(pd.MemoryProtection.ProtectPassword,
                KPRes.Password));
            pe.Strings.Set(PwDefs.NotesField, new ProtectedString(pd.MemoryProtection.ProtectNotes,
                KPRes.Notes));
            pe.AutoType.Set(KPRes.TargetWindow, @"{USERNAME}{TAB}{PASSWORD}{TAB}{ENTER}");
            kfpg.AddEntry(pe, true);
        }

		/// <summary>
		/// Free resources
		/// </summary>
        public override void Terminate()
        {
            RPCServer.Terminate();

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
            RPCServer.SignalAllClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_SELECTED);
        }

        private void OnKPDBOpen(object sender, FileCreatedEventArgs e)
        {
            KeePassRPCService.ensureDBisOpenEWH.Set(); // signal that DB is now open so any waiting ICE thread can go ahead
            RPCServer.SignalAllClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_OPEN);
        }

        private void OnKPDBOpen(object sender, FileOpenedEventArgs e)
        {
            KeePassRPCService.ensureDBisOpenEWH.Set(); // signal that DB is now open so any waiting ICE thread can go ahead
            RPCServer.SignalAllClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_OPEN);
        }

        private void OnKPDBClose(object sender, FileClosedEventArgs e)
        {
            KeePassRPCService.ensureDBisOpenEWH.Set(); // signal that DB is now open so any waiting ICE thread can go ahead
            RPCServer.SignalAllClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_CLOSED);
        }

        private void OnKPDBSaving(object sender, FileSavingEventArgs e)
        {
            RPCServer.SignalAllClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_SAVING);
        }

        private void OnKPDBSaved(object sender, FileSavedEventArgs e)
        {
            RPCServer.SignalAllClients(KeePassRPC.DataExchangeModel.Signal.DATABASE_SAVED);
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