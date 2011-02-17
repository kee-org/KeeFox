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
        public List<string> OtherKeys;

        private bool _editing = false;

        public KeeFoxURLForm(bool match, bool block, string regExURL, string url, List<string> otherKeys)
        {
            InitializeComponent();

            Match = match;
            Block = block;
            OtherKeys = otherKeys;

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

            if (OtherKeys.Contains(URL))
            {
                MessageBox.Show(this, "A rule for '" + URL + "' has already been added.");
                this.DialogResult = DialogResult.None;
                return;
            }

            //TODO2: Check the URL follows an acceptable pattern

            if (!radioButtonBlock.Checked && !radioButtonMatch.Checked)
                this.DialogResult = DialogResult.None;

            RegEx = checkBoxRegEx.Checked;
            Block = radioButtonBlock.Checked;
            Match = radioButtonMatch.Checked;
        }
    }
}
