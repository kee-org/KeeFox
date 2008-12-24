using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration.Install;
using System.Windows.Forms;
using System.Text;
using Microsoft.Win32;
using System.Runtime.InteropServices;


namespace KeeICE
{
    [RunInstaller(true)]
    public partial class KeeICEInstaller : Installer
    {
        public KeeICEInstaller()
        {
            InitializeComponent();
        }


        public override void Install(System.Collections.IDictionary stateSaver)
        {

            //PrintMessage("The application is being installed::" + Context.Parameters["KeePassInstallDir"]);
            
            string path = Registry.LocalMachine.OpenSubKey
(@"SYSTEM\CurrentControlSet\Control\Session Manager\Environment", true).GetValue("Path",new string(new char[] {';'}),RegistryValueOptions.DoNotExpandEnvironmentNames).ToString();

            RegistryKey regkey = Registry.LocalMachine.OpenSubKey
(@"SYSTEM\CurrentControlSet\Control\Session Manager\Environment", true);
            regkey.SetValue("Path", path + ";" + Context.Parameters["TARGETDIR"],
           RegistryValueKind.ExpandString);

            stateSaver["TARGETDIR"] = Context.Parameters["TARGETDIR"];

            NotifyRunningAppsOfChange();

            base.Install(stateSaver);
        }

        public override void Uninstall(System.Collections.IDictionary savedState)
        {
            //PrintMessage("The application is being uninstalled." + savedState["KeePassInstallDir"] + ".....");
            
            string path = Registry.LocalMachine.OpenSubKey
(@"SYSTEM\CurrentControlSet\Control\Session Manager\Environment", true).GetValue("Path", new string(new char[] { ';' }), RegistryValueOptions.DoNotExpandEnvironmentNames).ToString();

            if (savedState["KeePassInstallDir"] != null)
            {
                RegistryKey regkey = Registry.LocalMachine.OpenSubKey
    (@"SYSTEM\CurrentControlSet\Control\Session Manager\Environment", true);
                regkey.SetValue("Path", path.Replace(";" + savedState["TARGETDIR"], ""),
               RegistryValueKind.ExpandString);

                NotifyRunningAppsOfChange();
            }
            
            base.Uninstall(savedState);
        }

        private void PrintMessage(string message)
        {
            MessageBox.Show(message, "Installer Custom Action Fired!", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        /* mostly from http://ghouston.blogspot.com/2005/08/how-to-create-and-change-environment.html */
        private static void NotifyRunningAppsOfChange()
        {
            int result;
            SendMessageTimeout((System.IntPtr)HWND_BROADCAST,
                WM_SETTINGCHANGE, 0, "Environment", SMTO_BLOCK | SMTO_ABORTIFHUNG |
                SMTO_NOTIMEOUTIFNOTHUNG, 5000, out result);
        }

        [DllImport("user32.dll",
             CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool
            SendMessageTimeout(
            IntPtr hWnd,
            int Msg,
            int wParam,
            string lParam,
            int fuFlags,
            int uTimeout,
            out int lpdwResult
            );

        public const int HWND_BROADCAST = 0xffff;
        public const int WM_SETTINGCHANGE = 0x001A;
        public const int SMTO_NORMAL = 0x0000;
        public const int SMTO_BLOCK = 0x0001;
        public const int SMTO_ABORTIFHUNG = 0x0002;
        public const int SMTO_NOTIMEOUTIFNOTHUNG = 0x0008;

    }
}
