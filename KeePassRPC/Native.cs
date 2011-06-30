using System;
using System.Collections.Generic;
using System.Text;
//in progress...
using System.Diagnostics;
using System.Runtime.InteropServices;
using System;
using System.Windows.Forms;

namespace KeePassRPC
{


    class Native
    {
        //from: KeePass and http://stackoverflow.com/questions/46030/c-force-form-focus/46092#46092

        // Sets the window to be foreground
        [DllImport("User32")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool SetForegroundWindow(IntPtr hwnd);

        [DllImport("User32.dll")]
        private static extern void SwitchToThisWindow(
  IntPtr hWnd,
  int fAltTab
);

        // Activate or minimize a window
        [DllImportAttribute("User32.DLL")]
        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        private const int SW_SHOW = 5;
        private const int SW_MINIMIZE = 6;
        private const int SW_RESTORE = 9;

        [DllImport("User32.dll")]
        internal static extern IntPtr GetForegroundWindow();

        [DllImport("User32.dll")]
        internal static extern IntPtr GetWindow(IntPtr hWnd, uint wCmd);

        [DllImport("user32", CharSet = CharSet.Ansi, SetLastError = true, ExactSpelling = true)]
        internal static extern IntPtr SetFocus(IntPtr hwnd);

        //[DllImport("User32.dll")]
        //internal static extern uint GetWindowThreadProcessId(IntPtr hWnd, [Out] out uint lpdwProcessId);

        [DllImport("user32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)] 
        private static extern bool SetWindowPlacement(IntPtr hWnd,
           [In] ref WINDOWPLACEMENT lpwndpl);


        [DllImport("user32.dll")]
        private static extern
            IntPtr GetWindowThreadProcessId(IntPtr hWnd, IntPtr ProcessId);
        [DllImport("user32.dll")]
        private static extern
            IntPtr AttachThreadInput(IntPtr idAttach, IntPtr idAttachTo, int fAttach);

        [DllImport("Kernel32.dll")]
        internal static extern IntPtr GetCurrentThreadId();

        //[DllImport("User32.dll")]
        //internal static extern uint AttachThreadInput(uint idAttach, uint idAttachTo, uint fAttach);

        [DllImport("User32.dll")]
        internal static extern int BringWindowToTop(IntPtr hWnd);

        [DllImport("User32.dll", EntryPoint = "SetWindowPos")]
        public static extern bool SetWindowPos(
           int hWnd,               // window handle
           int hWndInsertAfter,    // placement-order handle
           int X,                  // horizontal position
           int Y,                  // vertical position
           int cx,                 // width
           int cy,                 // height
           uint uFlags);           // window positioning flags
        public const int HWND_BOTTOM = 0x1;
        public const int HWND_TOP = 0x0;
        public const int HWND_TOPMOST = -1;
        public const uint SWP_NOSIZE = 0x1;
        public const uint SWP_NOMOVE = 0x2;
        public const uint SWP_SHOWWINDOW = 0x40;

        [StructLayout(LayoutKind.Sequential)]
        private struct ANIMATIONINFO
        {

            public ANIMATIONINFO(bool iMinAnimate)
            {
                this.cbSize = GetSize();
                if (iMinAnimate) this.iMinAnimate = 1;
                else this.iMinAnimate = 0;
            }

            public uint cbSize;
            private int iMinAnimate;

            public bool IMinAnimate
            {
                get
                {
                    if (this.iMinAnimate == 0) return false;
                    else return true;
                }
                set
                {
                    if (value == true) this.iMinAnimate = 1;
                    else this.iMinAnimate = 0;
                }
            }

            public static uint GetSize()
            {
                return (uint)Marshal.SizeOf(typeof(ANIMATIONINFO));
            }
        }

        //http://www.codeproject.com/KB/cs/CapturingMinimizedWindow.aspx
        [DllImport("user32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool SystemParametersInfo(uint uiAction, uint uiParam,
         ref ANIMATIONINFO pvParam, SPIF fWinIni);

        [Flags]
           enum SPIF
           {
               None = 0x00,
               SPIF_UPDATEINIFILE = 0x01,  // Writes the new system-wide parameter setting to the user profile.
               SPIF_SENDCHANGE = 0x02,  // Broadcasts the WM_SETTINGCHANGE message after updating the user profile.
               SPIF_SENDWININICHANGE = 0x02   // Same as SPIF_SENDCHANGE.
           }
        public static void SetMinimizeMaximizeAnimation(bool status)
        {
            ANIMATIONINFO animationInfo = new ANIMATIONINFO(status);
            SystemParametersInfo(0x0048, ANIMATIONINFO.GetSize(),
             ref animationInfo, SPIF.None);

            if (animationInfo.IMinAnimate != status)
            {
                animationInfo.IMinAnimate = status;
                SystemParametersInfo(0x0049, ANIMATIONINFO.GetSize(),
                 ref animationInfo, SPIF.SPIF_SENDCHANGE);
            }
        }

        /// <summary>
           /// Gets or Sets MinAnimate Effect
           /// </summary>
           public static bool MinAnimate
           {
               get
               {
                   ANIMATIONINFO animationInfo = new ANIMATIONINFO(false);

                   SystemParametersInfo(0x0048, ANIMATIONINFO.GetSize(), ref animationInfo, SPIF.None);
                   return animationInfo.IMinAnimate;
               }
               set
               {
                   ANIMATIONINFO animationInfo = new ANIMATIONINFO(value);
                   SystemParametersInfo(0x0049, ANIMATIONINFO.GetSize(), ref animationInfo, SPIF.SPIF_SENDCHANGE);
               }
           }

        internal static void ActivateApplication(IntPtr hnd)
        {
            ShowWindow(hnd, SW_RESTORE);
            SetForegroundWindow(hnd);

        }

        internal static bool EnsureForegroundWindow(IntPtr hWnd)
        {
            //if (IsWindow(hWnd) == false) return false;

            if (SetForegroundWindow(hWnd) == false)
            {
                Debug.Assert(false);
                return false;
            }

            int nStartMS = Environment.TickCount;
            while ((Environment.TickCount - nStartMS) < 1000)
            {
                IntPtr h = GetForegroundWindow();
                if (h == hWnd) return true;

                Application.DoEvents();
            }

            return false;
        }

        public struct WINDOWPLACEMENT
        {
            public int length;
            public int flags;
            public int showCmd;
            public System.Drawing.Point ptMinPosition;
            public System.Drawing.Point ptMaxPosition;
            public System.Drawing.Rectangle rcNormalPosition;
        }


        internal static bool AttachToActiveAndBringToForeground(IntPtr hWnd)
        {
            //ShowWindow(hWnd, SW_MINIMIZE);
            //ShowWindow(hWnd, SW_RESTORE);

            //SetWindowPos((int)hWnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
            ////SwitchToThisWindow(hWnd, 0);
            //return true;
            // force window to have focus
            //uint foreThread;
            //uint uTargetThreadId = GetWindowThreadProcessId(GetForegroundWindow(),
            //    out foreThread);
            IntPtr appThread = GetCurrentThreadId();

            IntPtr foreThread = GetWindowThreadProcessId(GetForegroundWindow(),
                                                        IntPtr.Zero);
            //IntPtr appThread = GetWindowThreadProcessId(hWnd, IntPtr.Zero);
            
            //const int SW_SHOW = 5;
            if (foreThread != appThread)
            {
                AttachThreadInput(foreThread, appThread, 1);
                //SetWindowPos(hApp, HWND_TOPMOST, NULL, NULL, NULL, NULL, SWP_NOMOVE | SWP_NOSIZE);
                //SetWindowPos(hApp, HWND_NOTOPMOST, NULL, NULL, NULL, NULL, SWP_NOMOVE | SWP_NOSIZE);

                bool originalAnimate = MinAnimate;
                MinAnimate = false;

                // These cause a funny animation but that seems to be sufficient to work around windows annoying window activation limitations
                ShowWindow(hWnd, SW_MINIMIZE);
                ShowWindow(hWnd, SW_RESTORE);

                MinAnimate = originalAnimate;

                //WINDOWPLACEMENT param = new WINDOWPLACEMENT();
                //param.length = Marshal.SizeOf(typeof(WINDOWPLACEMENT));
                //param.showCmd = (int)SW_MINIMIZE;
                //bool lol = SetWindowPlacement(hWnd, ref param);

                //WINDOWPLACEMENT param2 = new WINDOWPLACEMENT();
                //param2.length = Marshal.SizeOf(typeof(WINDOWPLACEMENT));
                //param2.showCmd = (int)SW_RESTORE;
                //bool lol2 = SetWindowPlacement(hWnd, ref param2);

                SetForegroundWindow(hWnd);
                BringWindowToTop(hWnd);
                //ShowWindow(hWnd, SW_SHOW);

                //SetForegroundWindow(hApp);


                //SetActiveWindow(hApp);
                SetFocus(hWnd);


                //SetForegroundWindow(hWnd);
                //BringWindowToTop(hWnd);
                //ShowWindow(hWnd, SW_SHOW);
                //SetWindowPos((int)hWnd, HWND_TOP, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
                AttachThreadInput(foreThread, appThread, 0);
            }
            else
            {
                //MessageBox.Show("no");
                SetForegroundWindow(hWnd);
                BringWindowToTop(hWnd);
                ShowWindow(hWnd, SW_SHOW);
                //SetWindowPos((int)hWnd, HWND_TOP, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
            }
            //form.Activate();
            return true;
        }

        internal static void EnsureBackgroundWindow(IntPtr hWnd)
        {
            // all we really want to do is push it lower than whatever application called KeePassRPC but we don't the z-order to use
            //TODO: can we find out the z-order somehow before we prompt for the master key?
            SetWindowPos((int)hWnd, HWND_BOTTOM, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
        }
    }
}
