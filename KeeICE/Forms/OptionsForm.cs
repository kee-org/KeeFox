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

namespace KeeICE
{
    public partial class OptionsForm : Form
    {
        private IPluginHost _host;

        public OptionsForm(IPluginHost host)
        {
            _host = host;

            InitializeComponent();
            this.checkBox1.Text = "Automatically save KeePass database when KeeFox makes changes";
            if (host.CustomConfig.GetBool("KeeICE.KeeFox.autoCommit", true))
                this.checkBox1.Checked = true;
            else
                this.checkBox1.Checked = false;

            m_bannerImage.Image = BannerFactory.CreateBanner(m_bannerImage.Width,
                m_bannerImage.Height, BannerStyle.Default,
                null, "KeeFox (KeeICE) Options",
                "Change the settings of the KeeFox / KeeICE plugin");
        }

        private void m_btnOK_Click(object sender, EventArgs e)
        {
            _host.CustomConfig.SetBool("KeeICE.KeeFox.autoCommit", this.checkBox1.Checked);

            _host.MainWindow.Invoke((MethodInvoker)delegate { _host.MainWindow.SaveConfig(); });
        }

        private void OnFormLoad(object sender, EventArgs e)
        {
            GlobalWindowManager.AddWindow(this);
            m_bannerImage.Image = BannerFactory.CreateBanner(m_bannerImage.Width,
                m_bannerImage.Height, BannerStyle.Default,
                null, "KeeFox (KeeICE) Options",
                "Change the settings of the KeeFox / KeeICE plugin");
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
