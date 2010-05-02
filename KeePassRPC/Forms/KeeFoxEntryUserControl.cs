using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Text;
using System.Windows.Forms;
using KeePassLib;

namespace KeePassRPC.Forms
{
    public partial class KeeFoxEntryUserControl : UserControl
    {
        private PwEntry _entry;
        KeePassRPCExt KeePassRPCPlugin;

        public KeeFoxEntryUserControl(KeePassRPCExt keePassRPCPlugin, PwEntry entry)
        {
            KeePassRPCPlugin = keePassRPCPlugin;
            _entry = entry;
            InitializeComponent();
        }

        private void checkBoxAlwaysAutoFill_CheckedChanged(object sender, EventArgs e)
        {
            //TODO: change entry string values
        }

        private void KeeFoxEntryUserControl_Load(object sender, EventArgs e)
        {
            //TODO: read entry string values
        }
    }
}
