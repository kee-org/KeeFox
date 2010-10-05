using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

namespace KeePassRPC.Forms
{
    public partial class KeeFoxURLForm : Form
    {
        public bool Match;
        public bool Block;
        public bool RegEx;
        public string URL;

        private bool _editing = false;

        public KeeFoxURLForm(bool match, bool block, string regExURL, string url)
        {
            Match = match;
            Block = block;

            if (Block && Match)
                throw new ArgumentException("Can't block and match the same URL");

            if (!string.IsNullOrEmpty(regExURL))
            {
                RegEx = true;
                _editing = true;
                URL = regExURL;
            }
            else if (!string.IsNullOrEmpty(url))
            {
                _editing = true;
                URL = url;
            }

            textBox1.Text = URL;
            if (!Block && !Match)
                radioButtonMatch.Checked = true;
            else
            {
                radioButtonBlock.Checked = Block;
                radioButtonMatch.Checked = Match;
            }
            checkBoxRegEx.Checked = RegEx;

            if (_editing)
                this.Text = "Edit URL";
            else
                this.Text = "Add URL";

            InitializeComponent();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            
        }

        private void buttonOK_Click(object sender, EventArgs e)
        {
            if (textBox1.Text.Length > 0)
                URL = textBox1.Text;
            else
                this.DialogResult = DialogResult.None;

            if (!Block && !Match)
                this.DialogResult = DialogResult.None;

            RegEx = checkBoxRegEx.Checked;
            Block = radioButtonBlock.Checked;
            Match = radioButtonMatch.Checked;

        }
    }
}
