/*
  KeeICE - Uses ICE to provide IPC facilities to KeePass. (http://www.zeroc.com)
  Example usage includes the KeeFox firefox extension.
  
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>

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

namespace KeeICE
{

    class KeeICEServer : Ice.Application
    {
        public IPluginHost m_host = null;

        public Ice.Communicator ic = null;

        internal KPI kp;

        internal string[] standardIconsBase64 = null;

        public override int run(string[] args)
        {
            //Thread t;
            
                // Terminate cleanly on receipt of a signal
                //
                //shutdownOnInterrupt();

                Ice.Properties props = Ice.Util.createProperties();

			    // Make sure that network and protocol tracing are off.
			    //
			    props.setProperty("Ice.ACM.Client", "0");
                props.setProperty("Ice.ThreadPool.Client.Size", "6");
                props.setProperty("Ice.ThreadPool.Server.Size", "6");
                props.setProperty("Ice.ThreadPool.Client.SizeMax", "10");
                props.setProperty("Ice.ThreadPool.Server.SizeMax", "10");

			    // Initialize a communicator with these properties.
			    //
			    Ice.InitializationData id = new Ice.InitializationData();
			    id.properties = props;

                ic = Ice.Util.initialize(id);
                Ice.ObjectAdapter adapter
                    = ic.createObjectAdapterWithEndpoints(
                        "KeeICEAdapter", "tcp -h localhost -p " + args[0]);// + " -t 30000");
                kp = new KPI(m_host, standardIconsBase64, ic);
                adapter.add(
                        kp,
                        ic.stringToIdentity("KeeICE"));
                adapter.activate();
                //t = new Thread(new ThreadStart(obj.Run));
                //t.Start();

            try
            {
                ic.waitForShutdown();
               
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.ToString());
                return 1; // Initialization failed. TODO: more specific failure tests, etc.
            }
            finally
            {
                kp.destroy();
                //t.Join();
            }
            return 0;
        }

        public void ICEthread(object state)
        {
            main(new string[1] { ((int)state).ToString()});
            return;
        }
    }


	/// <summary>
	/// The main class - fires off a new thread to do the ICE management
	/// </summary>
	public sealed class KeeICEExt : Plugin
	{
 		// This will be used to run a seperate thread and listen for ICE requests from 
        // clients such as KeeFox
        KeeICEServer keeICEServer;

        // The thread to make it all happen
        Thread oThread;


        private ToolStripMenuItem m_ICEOptions = null;
        private ToolStripSeparator m_tsSeparator1 = null;
        private ToolStripMenuItem m_KeeFoxRootMenu = null;

        private void setupKeeICEServer(int ICEport)
        {

            try
            {
                oThread = new Thread(new ParameterizedThreadStart(keeICEServer.ICEthread));

                // Start the thread
                oThread.Start(ICEport);

                // wait for the started thread to become alive
                while (!oThread.IsAlive) ;

                // Put the Main thread to sleep for 1 millisecond to allow oThread
                // to do some work:
                Thread.Sleep(50);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.ToString());
                return; // Initialization failed. TODO: more specific failure tests, etc., find way to notify KeePass of failure after initialise was successful
            }

        }

        private void setupKeeICEServerListener(object sender, FileCreatedEventArgs e)
        {
            //setupKeeICEServer();
            keeICEServer.m_host.MainWindow.FileOpened -= setupKeeICEServerListener;
            keeICEServer.m_host.MainWindow.FileCreated -= setupKeeICEServerListener;
        }

        private void setupKeeICEServerListener(object sender, FileOpenedEventArgs e)
        {
            //setupKeeICEServer();
            keeICEServer.m_host.MainWindow.FileOpened -= setupKeeICEServerListener;
            keeICEServer.m_host.MainWindow.FileCreated -= setupKeeICEServerListener;
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
            string ICEportStr = host.CommandLineArgs["KeeICEPort"];
            int ICEport = 12535;
            
            
            if (ICEportStr != null)
            {
                try
                {
                    ICEport = int.Parse(ICEportStr);
                }
                catch
                {
                    ICEport = 12535;
                }
            }

            keeICEServer = new KeeICEServer();
            Debug.Assert(host != null);
            if(host == null) return false;
            keeICEServer.m_host = host;
            keeICEServer.standardIconsBase64 = getStandardIconsBase64(host.MainWindow.ClientIcons);

           // if (host.Database.IsOpen) // unlikely!
            setupKeeICEServer(ICEport);
          /*  else
            {
                keeICEServer.m_host.MainWindow.FileOpened += setupKeeICEServerListener;
                keeICEServer.m_host.MainWindow.FileCreated += setupKeeICEServerListener;
            }*/

            // register to recieve events that we need to deal with in order to update
            // firefox URL cache or KeeICE client status information

            keeICEServer.m_host.MainWindow.FileOpened += OnKPDBOpen;
            keeICEServer.m_host.MainWindow.FileClosed += OnKPDBClose;
            keeICEServer.m_host.MainWindow.FileCreated += OnKPDBOpen; // or need a specific handler here?
            
            // be nice to pick up when entries are edited and update the firefox URL cache imemdiately
            // for the time being we'll have to hook onto the Save function
            // ServerData.m_host.Database.RootGroup...
            keeICEServer.m_host.MainWindow.FileSaving += OnKPDBSaving;
            keeICEServer.m_host.MainWindow.FileSaved += OnKPDBSaved;

            // Get a reference to the 'Tools' menu item container
            ToolStripItemCollection tsMenu = keeICEServer.m_host.MainWindow.ToolsMenu.DropDownItems;

            // Add menu item for options
            m_ICEOptions = new ToolStripMenuItem();
            m_ICEOptions.Text = "KeeFox (KeeICE) Options";
            m_ICEOptions.Click += OnToolsOptions;
            m_ICEOptions.Enabled = true;
            tsMenu.Add(m_ICEOptions);

            // Add a seperator and menu item to the group context menu
            ContextMenuStrip gcm = keeICEServer.m_host.MainWindow.GroupContextMenu;
            m_tsSeparator1 = new ToolStripSeparator();
            gcm.Items.Add(m_tsSeparator1);
            m_KeeFoxRootMenu = new ToolStripMenuItem();
            m_KeeFoxRootMenu.Text = "Set as KeeFox start group";
            m_KeeFoxRootMenu.Click += OnMenuSetRootGroup;
            gcm.Items.Add(m_KeeFoxRootMenu);

            keeICEServer.m_host.MainWindow.DocumentManager.ActiveDocumentSelected += OnKPDBSelected;

            if (keeICEServer.m_host.CommandLineArgs["welcomeToKeeFox"] != null)
                keeICEServer.m_host.MainWindow.Shown += new EventHandler(MainWindow_Shown);

			return true; // Initialization successful
		}

        void OnToolsOptions(object sender, EventArgs e)
        {
            KeeICE.OptionsForm ofDlg = new KeeICE.OptionsForm(keeICEServer.m_host);
            ofDlg.ShowDialog();
        }

        void OnMenuSetRootGroup(object sender, EventArgs e)
        {
            PwGroup pg = keeICEServer.m_host.MainWindow.GetSelectedGroup();
            Debug.Assert(pg != null);
            if (pg == null || pg.Uuid == null || pg.Uuid == PwUuid.Zero)
                return;

            keeICEServer.m_host.Database.CustomData.Set("KeeICE.KeeFox.rootUUID", 
                KeePassLib.Utility.MemUtil.ByteArrayToHexString(pg.Uuid.UuidBytes));

            keeICEServer.m_host.MainWindow.UpdateUI(false, null, true, null, true, null, true);

        }

        void MainWindow_Shown(object sender, EventArgs e)
        {
            MessageBox.Show("Welcome to KeeFox! THE FOLLOWING DIALOGS ARE EXPERIMENTAL PROTOTYPES - hopefully functional, but FAR from pretty!");
            keeICEServer.m_host.MainWindow.Shown -= MainWindow_Shown;
            WelcomeKeeFoxUser();
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

        private void WelcomeKeeFoxUser()
        {
            WelcomeForm wf = new WelcomeForm();
            DialogResult dr = wf.ShowDialog();
            if (dr == DialogResult.Yes)
                CreateNewDatabase();
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

            PwDocument dsPrevActive = keeICEServer.m_host.MainWindow.DocumentManager.ActiveDocument;
            PwDatabase pd = keeICEServer.m_host.MainWindow.DocumentManager.CreateNewDocument(true).Database;
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

#if DEBUG
			Random r = Program.GlobalRandom;
			for(uint iSamples = 0; iSamples < 1500; ++iSamples)
			{
				pg = pd.RootGroup.Groups.GetAt(iSamples % 5);

				pe = new PwEntry(true, true);

				pe.Strings.Set(PwDefs.TitleField, new ProtectedString(pd.MemoryProtection.ProtectTitle,
					Guid.NewGuid().ToString()));
				pe.Strings.Set(PwDefs.UserNameField, new ProtectedString(pd.MemoryProtection.ProtectUserName,
					Guid.NewGuid().ToString()));
				pe.Strings.Set(PwDefs.UrlField, new ProtectedString(pd.MemoryProtection.ProtectUrl,
					Guid.NewGuid().ToString()));
				pe.Strings.Set(PwDefs.PasswordField, new ProtectedString(pd.MemoryProtection.ProtectPassword,
					Guid.NewGuid().ToString()));
				pe.Strings.Set(PwDefs.NotesField, new ProtectedString(pd.MemoryProtection.ProtectNotes,
					Guid.NewGuid().ToString()));

				pe.IconId = (PwIcon)r.Next(0, (int)PwIcon.Count);

				pg.AddEntry(pe, true);
			}

			pd.CustomData.Set("Sample Custom Data 1", "0123456789");
			pd.CustomData.Set("Sample Custom Data 2", @"µy data");
#endif

            keeICEServer.m_host.MainWindow.UpdateUI(true, null, true, null, true, null, true);

            // TODO: Can't raise FileCreated event from a plugin?
            //if (keeICEServer.m_host.MainWindow.FileCreated != null)
            //{
            //    FileCreatedEventArgs ea = new FileCreatedEventArgs(pd);
            //    keeICEServer.m_host.MainWindow.FileCreated(this, ea);
            //}
        }

		/// <summary>
		/// Free channel resources
		/// </summary>
        /// <remarks>what if an incoming KF request does a Reset on ensureDBisOpenEWH while ic is in shutdown procedures? could it deadlock the ICE thread?</remarks>
		public override void Terminate()
		{
            if (keeICEServer.kp != null)
                keeICEServer.kp.issueICEClientCallbacks(12); //KF_STATUS_EXITING
            
            // Tell any waiting ICE threads to just go ahead (and not wait for the user to finish interacting
            // with the KP UI.
            KPI.ensureDBisOpenEWH.Set();

            // cancel the ICE client callback timer
            //keeICEServer.kp.cancelCallbackTimer();
            // flush any remaining callback events to the ICE clients
            //keeICEServer.kp.issueICEClientCallbacksReal(null);
            
            //Thread.Sleep(1000);
            keeICEServer.ic.shutdown(); // no longer accept incoming connections from ICE clients



            //Thread.Sleep(1000);
            keeICEServer.ic.waitForShutdown(); // waits for current operations to complete
            //Thread.Sleep(1000);
            //if (keeICEServer.kp != null) 
            //    keeICEServer.kp.issueICEClientCallbacks(6); //KF_STATUS_DATABASE_CLOSED
            keeICEServer.ic.destroy();
            //Thread.Sleep(1000);

            // remove event listeners
            keeICEServer.m_host.MainWindow.FileOpened -= OnKPDBOpen;
            keeICEServer.m_host.MainWindow.FileClosed -= OnKPDBClose;
            keeICEServer.m_host.MainWindow.FileCreated -= OnKPDBOpen; // or need a specific handler here?
            keeICEServer.m_host.MainWindow.FileSaving -= OnKPDBSaving;
            keeICEServer.m_host.MainWindow.FileSaved -= OnKPDBSaved;

            // Remove 'Tools' menu items
            ToolStripItemCollection tsMenu = keeICEServer.m_host.MainWindow.ToolsMenu.DropDownItems;
            tsMenu.Remove(m_ICEOptions);

            // Remove group context menu items
            ContextMenuStrip gcm = keeICEServer.m_host.MainWindow.GroupContextMenu;
            gcm.Items.Remove(m_tsSeparator1);
            gcm.Items.Remove(m_KeeFoxRootMenu);
		}

        private void OnKPDBSelected(object sender, EventArgs e)
        {
            if (keeICEServer.kp != null)
                keeICEServer.kp.issueICEClientCallbacks(11); //KF_STATUS_DATABASE_SELECTED
        }

        private void OnKPDBOpen(object sender, FileCreatedEventArgs e)
        {
            KPI.ensureDBisOpenEWH.Set(); // signal that DB is now open so any waiting ICE thread can go ahead
            if (keeICEServer.kp != null) 
                keeICEServer.kp.issueICEClientCallbacks(4); //KF_STATUS_DATABASE_OPEN
        }

            //KF_STATUS_JSCALLBACKS_DISABLED 0
            //KF_STATUS_JSCALLBACKS_SETUP 1
            //KF_STATUS_ICECALLBACKS_SETUP 2
            //KF_STATUS_DATABASE_OPENING 3
            //KF_STATUS_DATABASE_OPEN 4
            //KF_STATUS_DATABASE_CLOSING 5
            //KF_STATUS_DATABASE_CLOSED 6
            //KF_STATUS_DATABASE_SAVING 7
            //KF_STATUS_DATABASE_SAVED 8
            //KF_STATUS_DATABASE_DELETING 9
            //KF_STATUS_DATABASE_DELETED 10
            //KF_STATUS_DATABASE_SELECTED 11
            //KF_STATUS_EXITING 12

        private void OnKPDBOpen(object sender, FileOpenedEventArgs e)
        {
            KPI.ensureDBisOpenEWH.Set(); // signal that DB is now open so any waiting ICE thread can go ahead
            if (keeICEServer.kp != null)
                keeICEServer.kp.issueICEClientCallbacks(4); //KF_STATUS_DATABASE_OPEN
            //TODO: does above work all the time? better off just waiting till ICE is setup completely? deadlock risk then?
        }

        private void OnKPDBClose(object sender, FileClosedEventArgs e)
        {
            KPI.ensureDBisOpenEWH.Set(); // signal that DB is now open so any waiting ICE thread can go ahead
            if (keeICEServer.kp != null) 
                keeICEServer.kp.issueICEClientCallbacks(6); //KF_STATUS_DATABASE_CLOSED
        }

        private void OnKPDBSaving(object sender, FileSavingEventArgs e)
        {
            if (keeICEServer.kp != null) 
                keeICEServer.kp.issueICEClientCallbacks(7); //KF_STATUS_DATABASE_SAVING
        }

        private void OnKPDBSaved(object sender, FileSavedEventArgs e)
        {
            if (keeICEServer.kp != null) 
                keeICEServer.kp.issueICEClientCallbacks(8); //KF_STATUS_DATABASE_SAVED
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