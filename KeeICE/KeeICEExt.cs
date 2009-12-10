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
                props.setProperty("Ice.ThreadPool.Client.Size", "2");
                props.setProperty("Ice.ThreadPool.Server.Size", "2");
                props.setProperty("Ice.ThreadPool.Client.SizeMax", "50");
                props.setProperty("Ice.ThreadPool.Server.SizeMax", "50");

			    // Initialize a communicator with these properties.
			    //
			    Ice.InitializationData id = new Ice.InitializationData();
			    id.properties = props;

                ic = Ice.Util.initialize(id);
                Ice.ObjectAdapter adapter
                    = ic.createObjectAdapterWithEndpoints(
                        "KeeICEAdapter", "tcp -h localhost -p " + args[0]);
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

            keeICEServer.m_host.MainWindow.DocumentManager.ActiveDocumentSelected += OnKPDBSelected;

            if (keeICEServer.m_host.CommandLineArgs["welcomeToKeeFox"] != null)
                keeICEServer.m_host.MainWindow.Shown += new EventHandler(MainWindow_Shown);

			return true; // Initialization successful
		}

        void MainWindow_Shown(object sender, EventArgs e)
        {
            MessageBox.Show("Welcome to KeeFox! KeeFox stores your passwords securely using KeePass. Please setup a new KeePass database if required or load an existing one.");
            keeICEServer.m_host.MainWindow.Shown -= MainWindow_Shown;
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