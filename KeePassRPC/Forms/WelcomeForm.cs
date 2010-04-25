using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using KeePassRPC;

namespace KeePassRPC.Forms
{
    public partial class WelcomeForm : Form
    {
        public WelcomeForm()
        {
            InitializeComponent();
        }

        private void linkLabel1_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            MessageBox.Show("Please visit the KeeFox website to find out where to get help. http://keefox.org");
        }

        private void checkBox1_CheckedChanged(object sender, EventArgs e)
        {
            button1.Enabled = checkBox1.Checked;
            button2.Enabled = checkBox1.Checked;

            if (checkBox1.Checked)
            {
                linkLabel2.Text = "Thank you. KeeFox will now be authorised to communicate with KeePass";
                linkLabel2.Enabled = false;
                linkLabel2.ForeColor = Color.Black;
                linkLabel2.LinkColor = Color.Black;
                linkLabel2.LinkClicked -= new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.linkLabel2_LinkClicked);
            }
            else
            {
                linkLabel2.Text = "Click for help if you are not sure why this window has appeared";
                linkLabel2.Enabled = true;
                linkLabel2.ForeColor = Color.Blue;
                linkLabel2.LinkColor = Color.Blue;
                linkLabel2.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.linkLabel2_LinkClicked);
            }
        }

        private void linkLabel2_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            MessageBox.Show("The 'Welcome to KeeFox' window is displayed by KeePass Password Safe 2 when an application claiming to be KeeFox (a Firefox add-on) attempts to connect to KeePass. To prevent malicious users accessing your passwords you should only proceed if you are installing KeeFox for the first time or have just upgraded KeeFox. If you think this window should not have been displayed you should click OK in this dialog box and then click the cross in the top right of the window to reject this connection from KeeFox. You can find out more with the resources available at http://keefox.org");
        }
    }
}
