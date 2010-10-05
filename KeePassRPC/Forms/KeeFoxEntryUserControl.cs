using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Text;
using System.Windows.Forms;
using KeePassLib;
using KeePassLib.Security;
using KeePass.UI;
using KeePassRPC.DataExchangeModel;
using KeePass.Forms;
using KeePassLib.Collections;

namespace KeePassRPC.Forms
{
    /// <summary>
    /// We read and write to the GUI in the Advanced tab of the standard entry editing dialog. This allows us to cancel and commit changes when the user presses OK or cancel.
    /// </summary>
    public partial class KeeFoxEntryUserControl : UserControl
    {
        private PwEntry _entry;
        KeePassRPCExt KeePassRPCPlugin;
        CustomListViewEx _advancedListView;
        PwEntryForm _pwEntryForm;
        ProtectedStringDictionary _strings;

        List<FormField> fields = new List<FormField>();

        public KeeFoxEntryUserControl(KeePassRPCExt keePassRPCPlugin, PwEntry entry,
            CustomListViewEx advancedListView, PwEntryForm pwEntryForm, ProtectedStringDictionary strings)
        {
            KeePassRPCPlugin = keePassRPCPlugin;
            _entry = entry;
            InitializeComponent();
            _advancedListView = advancedListView;
            _pwEntryForm = pwEntryForm;
            _strings = strings;
        }

        private void removeAdvancedString(string name)
        {
            ListViewItem li = null;
            foreach (ListViewItem existingLi in _advancedListView.Items)
            {
                if (existingLi.Text == name)
                {
                    li = existingLi;
                    break;
                }
            }

            if (li != null)
                _advancedListView.Items.Remove(li);

            _strings.Remove(name);
        }

        private void changeAdvancedString(string name, string value, bool protect)
        {
            ListViewItem li = null;
            int iTopVisible = UIUtil.GetTopVisibleItem(_advancedListView);

            foreach (ListViewItem existingLi in _advancedListView.Items)
            {
                if (existingLi.Text == name)
                {
                    li = existingLi;
                    li.SubItems.RemoveAt(1);
                    break;
                }
            }
            
            if (li == null)
            {
                li = _advancedListView.Items.Add(name, (int)PwIcon.PaperNew);
                
            }

            //TODO: only add if string not null or empty?
            //li.SubItems.Clear();
            if (protect) li.SubItems.Add("********");
            else li.SubItems.Add(value);

            UIUtil.SetTopVisibleItem(_advancedListView, iTopVisible);

            _strings.Set(name, new ProtectedString(false, value));
        }

        private void checkBoxHideFromKeeFox_CheckedChanged(object sender, EventArgs e)
        {
            if (checkBoxHideFromKeeFox.Checked)
                changeAdvancedString("Hide from KPRPC", "", false);
            else
            {                
                removeAdvancedString("Hide from KPRPC");
            }
        }

        private void KeeFoxEntryUserControl_Load(object sender, EventArgs e)
        {
            //TODO: what about if user directly edits the strings in the other tab? will this Load function be called every time the KeeFox tab is displayed?
            
            bool kfNeverAutoFill = false;
            bool kfAlwaysAutoFill = false;
            bool kfNeverAutoSubmit = false;
            bool kfAlwaysAutoSubmit = false;

            foreach (ListViewItem existingLi in _advancedListView.Items)
            {
                if (existingLi.Text == "Hide from KeeFox" || existingLi.Text == "Hide from KPRPC") { removeAdvancedString("Hide from KeeFox"); checkBoxHideFromKeeFox.Checked = true; }
                else if (existingLi.Text == "KeeFox Never Auto Fill" || existingLi.Text == "KPRPC Never Auto Fill") { kfNeverAutoFill = true; }
                else if (existingLi.Text == "KeeFox Always Auto Fill" || existingLi.Text == "KPRPC Always Auto Fill") { kfAlwaysAutoFill = true; }
                else if (existingLi.Text == "KeeFox Never Auto Submit" || existingLi.Text == "KPRPC Never Auto Submit") { kfNeverAutoSubmit = true; }
                else if (existingLi.Text == "KeeFox Always Auto Submit" || existingLi.Text == "KPRPC Always Auto Submit") { kfAlwaysAutoSubmit = true; }
                else if ((existingLi.Text.StartsWith("Form field ") || existingLi.Text.StartsWith("KPRPC Form field ")) && existingLi.Text.EndsWith("value"))
                {
                    string name = null;
                    // extract name
                    if (existingLi.Text.StartsWith("Form field "))
                        name = existingLi.Text.Substring(11,existingLi.Text.Length-16);
                    else if (existingLi.Text.StartsWith("KPRPC Form field "))
                        name = existingLi.Text.Substring(17, existingLi.Text.Length - 22);

                    string value = existingLi.SubItems[0].Text;

                    FormFieldType fft = FormFieldType.FFTusername;
                    string type = null;
                    if (_advancedListView.Items.ContainsKey("KPRPC Form field " + name + " type"))
                        type = _advancedListView.Items["KPRPC Form field " + name + " type"].Text;
                    if (type == null && _advancedListView.Items.ContainsKey("Form field " + name + " type"))
                        type = _advancedListView.Items["Form field " + name + " type"].Text;
                    if (type == "password")
                        fft = FormFieldType.FFTpassword;
                    else if (type == "select")
                        fft = FormFieldType.FFTselect;
                    else if (type == "radio")
                        fft = FormFieldType.FFTradio;
                    else if (type == "text")
                        fft = FormFieldType.FFTtext;
                    else if (type == "username")
                        fft = FormFieldType.FFTusername;
                    else if (type == "checkbox")
                        fft = FormFieldType.FFTcheckbox;

                    string id = null;
                    if (_advancedListView.Items.ContainsKey("KPRPC Form field " + name + " id"))
                        id = _advancedListView.Items["KPRPC Form field " + name + " id"].Text;
                    if (id == null && _advancedListView.Items.ContainsKey("Form field " + name + " id"))
                        id = _advancedListView.Items["Form field " + name + " id"].Text;

                    int page = 1;
                    if (_advancedListView.Items.ContainsKey("KPRPC Form field " + name + " page"))
                        page = int.Parse(_advancedListView.Items["KPRPC Form field " + name + " page"].Text);
                    if (_advancedListView.Items.ContainsKey("Form field " + name + " page"))
                        page = int.Parse(_advancedListView.Items["Form field " + name + " page"].Text);

                    fields.Add(new FormField(name, name, value, fft, id, page));
                }
                else if (existingLi.Text == "KeeFox Priority" || existingLi.Text == "KPRPC Priority")
                { 
                    removeAdvancedString("KeeFox Priority");
                    textBoxKeeFoxPriority.Text = existingLi.SubItems[1].Text;
                }
            }
            ReadURLStrings();

            comboBoxAutoSubmit.Text = "Default";
            comboBoxAutoFill.Text = "Default";

            // doesn't make sense for some of these values to co-exist so we'll tidy up while working out what we should default the GUI options to.
            // There are also implicit behaviours based on single option choices so we'll make them explicit now so that the GUI accurately reflects the 
            // strings stored in the advanced tab
            if (kfNeverAutoFill)
            {
                currentBehaviour = EntryBehaviour.NeverAutoFillNeverAutoSubmit;
            }
            else if (kfAlwaysAutoSubmit)
            {
                currentBehaviour = EntryBehaviour.AlwaysAutoFillAlwaysAutoSubmit;
            } else if (kfAlwaysAutoFill && kfNeverAutoSubmit)
            {
                currentBehaviour = EntryBehaviour.AlwaysAutoFillNeverAutoSubmit;
            } else if (kfNeverAutoSubmit)
            {
                currentBehaviour = EntryBehaviour.NeverAutoSubmit;
            }
             else if (kfAlwaysAutoFill)
            {
                currentBehaviour = EntryBehaviour.AlwaysAutoFill;
            } else
            {
                currentBehaviour = EntryBehaviour.Default;
            }
            changeBehaviourState(currentBehaviour);

            this.comboBoxAutoSubmit.SelectedIndexChanged += new System.EventHandler(this.comboBoxAutoSubmit_SelectedIndexChanged);
            this.comboBoxAutoFill.SelectedIndexChanged += new System.EventHandler(this.comboBoxAutoFill_SelectedIndexChanged);
            this.checkBoxHideFromKeeFox.CheckedChanged += new System.EventHandler(this.checkBoxHideFromKeeFox_CheckedChanged);
            this.textBoxKeeFoxPriority.TextChanged += new System.EventHandler(this.textBoxKeeFoxPriority_TextChanged);
        }

        private void textBoxKeeFoxPriority_TextChanged(object sender, EventArgs e)
        {
            string priority = ((System.Windows.Forms.TextBoxBase)sender).Text;

            if (!string.IsNullOrEmpty(priority))
            {
                try
                {
                    int.Parse(priority);
                    changeAdvancedString("KPRPC Priority", priority, false);
                    return;
                }
                catch (Exception)
                {
                }
            }
            removeAdvancedString("KPRPC Priority");
            return;
        }

        private void comboBoxAutoFill_SelectedIndexChanged(object sender, EventArgs e)
        {
            switch (comboBoxAutoFill.Text)
            {
                case "Default":
                    if (comboBoxAutoSubmit.Text == "Never")
                        changeBehaviourState(EntryBehaviour.NeverAutoSubmit);
                    else
                        changeBehaviourState(EntryBehaviour.Default);
                    break;
                case "Never":
                        changeBehaviourState(EntryBehaviour.NeverAutoSubmit);
                    break;
                case "Always":
                    if (comboBoxAutoSubmit.Text == "Never")
                        changeBehaviourState(EntryBehaviour.AlwaysAutoFillNeverAutoSubmit);
                    else if (comboBoxAutoSubmit.Text == "Always")
                        changeBehaviourState(EntryBehaviour.AlwaysAutoFillAlwaysAutoSubmit);
                    else
                        changeBehaviourState(EntryBehaviour.AlwaysAutoFill);
                    break;
            }
        }

        private void comboBoxAutoSubmit_SelectedIndexChanged(object sender, EventArgs e)
        {
            switch (comboBoxAutoSubmit.Text)
            {
                case "Default": 
                    if (comboBoxAutoFill.Text == "Always") 
                        changeBehaviourState(EntryBehaviour.AlwaysAutoFill); 
                    else
                        changeBehaviourState(EntryBehaviour.Default);
                    break;
                case "Never":
                    if (comboBoxAutoFill.Text == "Always")
                        changeBehaviourState(EntryBehaviour.AlwaysAutoFillAlwaysAutoSubmit);
                    else if (comboBoxAutoFill.Text == "Never")
                        changeBehaviourState(EntryBehaviour.NeverAutoFillNeverAutoSubmit);
                    else
                        changeBehaviourState(EntryBehaviour.NeverAutoSubmit);
                    break;
                case "Always":
                    changeBehaviourState(EntryBehaviour.AlwaysAutoFillAlwaysAutoSubmit);
                    break;
            }
        }

        enum EntryBehaviour
        {
            Default,
            NeverAutoFillNeverAutoSubmit,
            NeverAutoSubmit,
            AlwaysAutoFillAlwaysAutoSubmit,
            AlwaysAutoFill,
            AlwaysAutoFillNeverAutoSubmit
        }

        EntryBehaviour currentBehaviour = EntryBehaviour.Default;

        private void changeBehaviourState(EntryBehaviour behav)
        {
            switch (behav)
            {
                case EntryBehaviour.AlwaysAutoFill:
                    changeAdvancedString("KPRPC Always Auto Fill", "", false);
                    removeAdvancedString("KPRPC Never Auto Fill");
                    removeAdvancedString("KPRPC Always Auto Submit");
                    removeAdvancedString("KPRPC Never Auto Submit");
                    removeAdvancedString("KeeFox Never Auto Fill");
                    removeAdvancedString("KeeFox Always Auto Submit");
                    removeAdvancedString("KeeFox Never Auto Submit");
                    comboBoxAutoFill.Text = "Always";
                    comboBoxAutoSubmit.Text = "Default";
                    comboBoxAutoFill.Enabled = true;
                    comboBoxAutoSubmit.Enabled = true;
                    break;
                case EntryBehaviour.NeverAutoSubmit:
                    changeAdvancedString("KPRPC Never Auto Submit", "", false);
                    removeAdvancedString("KPRPC Always Auto Submit");
                    removeAdvancedString("KPRPC Always Auto Fill");
                    removeAdvancedString("KPRPC Never Auto Fill");
                    removeAdvancedString("KeeFox Always Auto Submit");
                    removeAdvancedString("KeeFox Always Auto Fill");
                    removeAdvancedString("KeeFox Never Auto Fill");
                    comboBoxAutoFill.Text = "Default";
                    comboBoxAutoSubmit.Text = "Never";
                    comboBoxAutoFill.Enabled = true;
                    comboBoxAutoSubmit.Enabled = true;
                    break;
                case EntryBehaviour.AlwaysAutoFillAlwaysAutoSubmit:
                    changeAdvancedString("KPRPC Always Auto Fill", "", false);
                    changeAdvancedString("KPRPC Always Auto Submit", "", false);
                    removeAdvancedString("KPRPC Never Auto Fill");
                    removeAdvancedString("KPRPC Never Auto Submit");
                    removeAdvancedString("KeeFox Never Auto Fill");
                    removeAdvancedString("KeeFox Never Auto Submit");
                    comboBoxAutoSubmit.Text = "Always";
                    comboBoxAutoFill.Text = "Always";
                    comboBoxAutoFill.Enabled = false;
                    comboBoxAutoSubmit.Enabled = true;
                    break;
                case EntryBehaviour.NeverAutoFillNeverAutoSubmit:
                    changeAdvancedString("KPRPC Never Auto Fill", "", false);
                    changeAdvancedString("KPRPC Never Auto Submit", "", false);
                    removeAdvancedString("KPRPC Always Auto Fill");
                    removeAdvancedString("KPRPC Always Auto Submit");
                    removeAdvancedString("KeeFox Always Auto Fill");
                    removeAdvancedString("KeeFox Always Auto Submit");
                    comboBoxAutoFill.Text = "Never";
                    comboBoxAutoSubmit.Text = "Never";
                    comboBoxAutoSubmit.Enabled = false;
                    comboBoxAutoFill.Enabled = true;
                    break;
                case EntryBehaviour.AlwaysAutoFillNeverAutoSubmit:
                    changeAdvancedString("KPRPC Always Auto Fill", "", false);
                    changeAdvancedString("KPRPC Never Auto Submit", "", false);
                    removeAdvancedString("KPRPC Never Auto Fill");
                    removeAdvancedString("KPRPC Always Auto Submit");
                    removeAdvancedString("KeeFox Never Auto Fill");
                    removeAdvancedString("KeeFox Always Auto Submit");
                    comboBoxAutoFill.Text = "Always";
                    comboBoxAutoSubmit.Text = "Never";
                    comboBoxAutoSubmit.Enabled = true;
                    comboBoxAutoFill.Enabled = true;
                    break;
                case EntryBehaviour.Default:
                    removeAdvancedString("KeeFox Never Auto Fill");
                    removeAdvancedString("KeeFox Always Auto Fill");
                    removeAdvancedString("KeeFox Never Auto Submit");
                    removeAdvancedString("KeeFox Always Auto Submit");
                    removeAdvancedString("KPRPC Never Auto Fill");
                    removeAdvancedString("KPRPC Always Auto Fill");
                    removeAdvancedString("KPRPC Never Auto Submit");
                    removeAdvancedString("KPRPC Always Auto Submit");
                    comboBoxAutoFill.Text = "Default";
                    comboBoxAutoSubmit.Text = "Default";
                    comboBoxAutoSubmit.Enabled = true;
                    comboBoxAutoFill.Enabled = true;
                    break;
            }
            currentBehaviour = behav;
        }

        List<string> listNormalURLs = new List<string>();
        List<string> listRegExURLs = new List<string>();
        List<string> listNormalBlockedURLs = new List<string>();
        List<string> listRegExBlockedURLs = new List<string>();

        private void buttonURLAdd_Click(object sender, EventArgs e)
        {
            KeeFoxURLForm kfurlf = new KeeFoxURLForm(false,false,null,null);

            if (kfurlf.ShowDialog() == DialogResult.OK)
            {
                //UpdateEntryStrings(false, false);
                //ResizeColumnHeaders();

                if (kfurlf.Match && !kfurlf.RegEx)
                {
                    listNormalURLs.Add(kfurlf.URL);
                    ListViewItem lvi = new ListViewItem(new string[] { "Normal", "Match" });
                    lvi.Text = kfurlf.URL;
                    listView1.Items.Add(lvi);
                }
                if (kfurlf.Block && !kfurlf.RegEx)
                {
                    listNormalBlockedURLs.Add(kfurlf.URL);
                    ListViewItem lvi = new ListViewItem(new string[] { "Normal", "Block" });
                    lvi.Text = kfurlf.URL;
                    listView1.Items.Add(lvi);
                }
                if (kfurlf.Match && kfurlf.RegEx)
                {
                    listRegExURLs.Add(kfurlf.URL);
                    ListViewItem lvi = new ListViewItem(new string[] { "RegEx", "Match" });
                    lvi.Text = kfurlf.URL;
                    listView1.Items.Add(lvi);
                }
                if (kfurlf.Block && kfurlf.RegEx)
                {
                    listRegExBlockedURLs.Add(kfurlf.URL);
                    ListViewItem lvi = new ListViewItem(new string[] { "RegEx", "Block" });
                    lvi.Text = kfurlf.URL;
                    listView1.Items.Add(lvi);
                }

            }
        }

        private void buttonURLEdit_Click(object sender, EventArgs e)
        {
            //TODO: Find current selected item and subitems and pass into editor constructor
            KeeFoxURLForm kfurlf = new KeeFoxURLForm(false, false, null, null);

            if (kfurlf.ShowDialog() == DialogResult.OK)
            {
                //UpdateEntryStrings(false, false);
                //ResizeColumnHeaders();

                if (kfurlf.Match && !kfurlf.RegEx)
                {
                    listNormalURLs.Add(kfurlf.URL);
                    ListViewItem lvi = new ListViewItem(new string[] { "Normal", "Match" });
                    lvi.Text = kfurlf.URL;
                    listView1.Items.Add(lvi);
                }
                if (kfurlf.Block && !kfurlf.RegEx)
                {
                    listNormalBlockedURLs.Add(kfurlf.URL);
                    ListViewItem lvi = new ListViewItem(new string[] { "Normal", "Block" });
                    lvi.Text = kfurlf.URL;
                    listView1.Items.Add(lvi);
                }
                if (kfurlf.Match && kfurlf.RegEx)
                {
                    listRegExURLs.Add(kfurlf.URL);
                    ListViewItem lvi = new ListViewItem(new string[] { "RegEx", "Match" });
                    lvi.Text = kfurlf.URL;
                    listView1.Items.Add(lvi);
                }
                if (kfurlf.Block && kfurlf.RegEx)
                {
                    listRegExBlockedURLs.Add(kfurlf.URL);
                    ListViewItem lvi = new ListViewItem(new string[] { "RegEx", "Block" });
                    lvi.Text = kfurlf.URL;
                    listView1.Items.Add(lvi);
                }

            }
        }

        private void buttonURLDelete_Click(object sender, EventArgs e)
        {
            ListView.SelectedListViewItemCollection lvsicSel = listView1.SelectedItems;
            for (int i = 0; i < lvsicSel.Count; ++i)
            {
                if (lvsicSel[i].SubItems[1].Text == "Normal" && lvsicSel[i].SubItems[2].Text == "Match")
                    listNormalURLs.Remove(lvsicSel[i].Text);
                else if (lvsicSel[i].SubItems[1].Text == "Normal" && lvsicSel[i].SubItems[2].Text == "Block")
                    listNormalBlockedURLs.Remove(lvsicSel[i].Text);
                else if (lvsicSel[i].SubItems[1].Text == "RegEx" && lvsicSel[i].SubItems[2].Text == "Match")
                    listRegExURLs.Remove(lvsicSel[i].Text);
                else if (lvsicSel[i].SubItems[1].Text == "RegEx" && lvsicSel[i].SubItems[2].Text == "Block")
                    listRegExBlockedURLs.Remove(lvsicSel[i].Text);
                listView1.Items.Remove(lvsicSel[i]);
            }

            if (lvsicSel.Count > 0)
            {
                UpdateURLStrings();
            }
            
        }

        private void UpdateURLStrings()
        {
            string alternativeURLs = "";
            foreach (string url in listNormalURLs)
            {
                alternativeURLs += url + " ";
            }
            alternativeURLs = alternativeURLs.TrimEnd();

            string alternativeBlockedURLs = "";
            foreach (string url in listNormalBlockedURLs)
            {
                alternativeBlockedURLs += url + " ";
            }
            alternativeBlockedURLs = alternativeBlockedURLs.TrimEnd();

            string regexURLs = "";
            foreach (string url in listRegExURLs)
            {
                regexURLs += url + " ";
            }
            regexURLs = regexURLs.TrimEnd();

            string regexBlockedURLs = "";
            foreach (string url in listRegExBlockedURLs)
            {
                regexBlockedURLs += url + " ";
            }
            regexBlockedURLs = regexBlockedURLs.TrimEnd();

            if (string.IsNullOrEmpty(alternativeURLs))
                removeAdvancedString("KPRPC Alternative URLs");
            else
                changeAdvancedString("KPRPC Alternative URLs", alternativeURLs, false);

            if (string.IsNullOrEmpty(alternativeBlockedURLs))
                removeAdvancedString("KPRPC Blocked URLs");
            else
                changeAdvancedString("KPRPC Blocked URLs", alternativeBlockedURLs, false);

            if (string.IsNullOrEmpty(regexURLs))
                removeAdvancedString("KPRPC URL Regex match");
            else
                changeAdvancedString("KPRPC URL Regex match", regexURLs, false);

            if (string.IsNullOrEmpty(regexBlockedURLs))
                removeAdvancedString("KPRPC URL Regex block");
            else
                changeAdvancedString("KPRPC URL Regex block", regexBlockedURLs, false);
        }

        private void ReadURLStrings()
        {
            if (_advancedListView.Items.ContainsKey("KPRPC Alternative URLs"))
            {
                string alternativeURLs = _advancedListView.Items["KPRPC Alternative URLs"].Text;
                foreach (string url in alternativeURLs.Split(' '))
                {
                    listNormalURLs.Add(url);
                }
            }
            if (_advancedListView.Items.ContainsKey("KPRPC Blocked URLs"))
            {
                string alternativeBlockedURLs = _advancedListView.Items["KPRPC Blocked URLs"].Text;
                foreach (string url in alternativeBlockedURLs.Split(' '))
                {
                    listNormalBlockedURLs.Add(url);
                }
            }
            if (_advancedListView.Items.ContainsKey("KPRPC URL Regex match"))
            {
                string regexURLs = _advancedListView.Items["KPRPC URL Regex match"].Text;
                foreach (string url in regexURLs.Split(' '))
                {
                    listRegExURLs.Add(url);
                }
            }
            if (_advancedListView.Items.ContainsKey("KPRPC URL Regex block"))
            {
                string regexBlockedURLs = _advancedListView.Items["KPRPC URL Regex block"].Text;
                foreach (string url in regexBlockedURLs.Split(' '))
                {
                    listRegExBlockedURLs.Add(url);
                }
            }

            foreach (string url in listNormalURLs)
            {
                ListViewItem lvi = new ListViewItem(new string[] { "Normal", "Match" });
                lvi.Text = url;
                listView1.Items.Add(lvi);
            }
            foreach (string url in listNormalBlockedURLs)
            {
                ListViewItem lvi = new ListViewItem(new string[] { "Normal", "Block" });
                lvi.Text = url;
                listView1.Items.Add(lvi);
            }
            foreach (string url in listRegExURLs)
            {
                ListViewItem lvi = new ListViewItem(new string[] { "RegEx", "Match" });
                lvi.Text = url;
                listView1.Items.Add(lvi);
            }
            foreach (string url in listRegExBlockedURLs)
            {
                ListViewItem lvi = new ListViewItem(new string[] { "RegEx", "Block" });
                lvi.Text = url;
                listView1.Items.Add(lvi);
            }
        }
    }
}
