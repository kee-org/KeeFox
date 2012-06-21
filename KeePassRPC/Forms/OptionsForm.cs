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
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

using KeePass;
using KeePass.UI;
using KeePass.Plugins;
using KeePass.Resources;
using KeePassRPC;

namespace KeePassRPC.Forms
{
    public partial class OptionsForm : Form
    {
        private IPluginHost _host;

        public OptionsForm(IPluginHost host)
        {
            _host = host;

            InitializeComponent();
            Icon = global::KeePassRPC.Properties.Resources.keefox;
            this.checkBox1.Text = "Automatically save KeePass database when KeeFox makes changes";
            if (host.CustomConfig.GetBool("KeePassRPC.KeeFox.autoCommit", true))
                this.checkBox1.Checked = true;
            else
                this.checkBox1.Checked = false;

            this.checkBox2.Text = "Immediately edit entries created by KeeFox";
            if (host.CustomConfig.GetBool("KeePassRPC.KeeFox.editNewEntries", false))
                this.checkBox2.Checked = true;
            else
                this.checkBox2.Checked = false;
        }

        private void m_btnOK_Click(object sender, EventArgs e)
        {
            _host.CustomConfig.SetBool("KeePassRPC.KeeFox.autoCommit", this.checkBox1.Checked);
            _host.CustomConfig.SetBool("KeePassRPC.KeeFox.editNewEntries", this.checkBox2.Checked);

            _host.MainWindow.Invoke((MethodInvoker)delegate { _host.MainWindow.SaveConfig(); });
        }

        private void OnFormLoad(object sender, EventArgs e)
        {
            GlobalWindowManager.AddWindow(this);
        }

        private void btnCancel_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void OnFormClosed(object sender, FormClosedEventArgs e)
        {
            GlobalWindowManager.RemoveWindow(this);
        }
    }
}
