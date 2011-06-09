//using System;
//using System.Collections.Generic;
//using System.Text;
//in progress...
//using System.Diagnostics;
//using System.Runtime.InteropServices;
//using System;
//using System.Windows.Forms;

//namespace KeePassRPC
//{


//    class Native
//    {
//        //from: KeePass and http://stackoverflow.com/questions/46030/c-force-form-focus/46092#46092

//        // Sets the window to be foreground
//        [DllImport("User32")]
//        [return: MarshalAs(UnmanagedType.Bool)]
//        private static extern bool SetForegroundWindow(IntPtr hwnd);

//        // Activate or minimize a window
//        [DllImportAttribute("User32.DLL")]
//        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
//        private const int SW_SHOW = 5;
//        private const int SW_MINIMIZE = 6;
//        private const int SW_RESTORE = 9;

//        [DllImport("User32.dll")]
//        internal static extern IntPtr GetForegroundWindow();

//        internal static void ActivateApplication(IntPtr hnd)
//        {
//            ShowWindow(hnd, SW_RESTORE);
//            SetForegroundWindow(hnd);

//        }

//        internal static bool EnsureForegroundWindow(IntPtr hWnd)
//        {
//            //if (IsWindow(hWnd) == false) return false;

//            if (SetForegroundWindow(hWnd) == false)
//            {
//                Debug.Assert(false);
//                return false;
//            }

//            int nStartMS = Environment.TickCount;
//            while ((Environment.TickCount - nStartMS) < 1000)
//            {
//                IntPtr h = GetForegroundWindow();
//                if (h == hWnd) return true;

//                Application.DoEvents();
//            }

//            return false;
//        }
//    }
//}