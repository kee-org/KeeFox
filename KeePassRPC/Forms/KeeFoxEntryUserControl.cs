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

        Dictionary<string, FormField> fields = new Dictionary<string, FormField>();

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

            if (protect && value != null && value.Length > 0) li.SubItems.Add("********");
            else li.SubItems.Add(value);

            UIUtil.SetTopVisibleItem(_advancedListView, iTopVisible);

            _strings.Set(name, new ProtectedString(protect, value));
        }

        private void checkBoxHideFromKeeFox_CheckedChanged(object sender, EventArgs e)
        {
            if (checkBoxHideFromKeeFox.Checked)
            {
                changeAdvancedString("Hide from KPRPC", "", false);
                textBoxKeeFoxPriority.Enabled = false;
                label1.Enabled = false;
                groupBox1.Enabled = false;
                groupBox2.Enabled = false;
                groupBox3.Enabled = false;
                labelRealm.Enabled = false;
                textBoxKeeFoxRealm.Enabled = false;
            }
            else
            {
                removeAdvancedString("Hide from KPRPC");
                textBoxKeeFoxPriority.Enabled = true;
                label1.Enabled = true;
                groupBox1.Enabled = true;
                groupBox2.Enabled = true;
                groupBox3.Enabled = true;
                labelRealm.Enabled = true;
                textBoxKeeFoxRealm.Enabled = true;
            }
        }

        private void KeeFoxEntryUserControl_Load(object sender, EventArgs e)
        {
            bool kfNeverAutoFill = false;
            bool kfAlwaysAutoFill = false;
            bool kfNeverAutoSubmit = false;
            bool kfAlwaysAutoSubmit = false;

            this.checkBoxHideFromKeeFox.CheckedChanged += new System.EventHandler(this.checkBoxHideFromKeeFox_CheckedChanged);

            foreach (ListViewItem existingLi in _advancedListView.Items)
            {
                if (existingLi.Text == "Hide from KeeFox" || existingLi.Text == "Hide from KPRPC") { removeAdvancedString("Hide from KeeFox"); checkBoxHideFromKeeFox.Checked = true; }
                else if (existingLi.Text == "KeeFox Never Auto Fill" || existingLi.Text == "KPRPC Never Auto Fill") { kfNeverAutoFill = true; }
                else if (existingLi.Text == "KeeFox Always Auto Fill" || existingLi.Text == "KPRPC Always Auto Fill") { kfAlwaysAutoFill = true; }
                else if (existingLi.Text == "KeeFox Never Auto Submit" || existingLi.Text == "KPRPC Never Auto Submit") { kfNeverAutoSubmit = true; }
                else if (existingLi.Text == "KeeFox Always Auto Submit" || existingLi.Text == "KPRPC Always Auto Submit") { kfAlwaysAutoSubmit = true; }
                else if ((existingLi.Text.StartsWith("Form field ") || existingLi.Text.StartsWith("KPRPC Form field ")) && existingLi.Text.EndsWith("type"))
                {
                    string name = null;
                    // extract name
                    if (existingLi.Text.StartsWith("Form field "))
                        name = existingLi.Text.Substring(11,existingLi.Text.Length-16);
                    else if (existingLi.Text.StartsWith("KPRPC Form field "))
                        name = existingLi.Text.Substring(17, existingLi.Text.Length - 22);
                    string displayName = name;

                    string type = existingLi.SubItems[1].Text;
                    FormFieldType fft = Utilities.FormFieldTypeFromDisplay(type);

                    string value = null;
                    string id = null;
                    int page = 1;

                    // Grrrrr... can't find any way to request specific list item!
                    //TODO2: cache a better data structure than .NET provides to speed up handling of many form fields
                    foreach (ListViewItem internalLi in _advancedListView.Items)
                    {
                        if (internalLi.Text == "KPRPC Form field " + name + " value")
                            value = internalLi.SubItems[1].Text;
                        if (value == null && internalLi.Text == "Form field " + name + " value")
                            value = internalLi.SubItems[1].Text;

                        if (internalLi.Text == "KPRPC Form field " + name + " id")
                            id = internalLi.SubItems[1].Text;
                        if (id == null && internalLi.Text == "Form field " + name + " id")
                            id = internalLi.SubItems[1].Text;

                        if (internalLi.Text == "KPRPC Form field " + name + " page")
                            page = int.Parse(internalLi.SubItems[1].Text);
                        if (internalLi.Text == "Form field " + name + " page")
                            page = int.Parse(internalLi.SubItems[1].Text);
                    }
                    
                    // if value not found it's probably a standard KeePass data field
                    if (value == null && fft == FormFieldType.FFTusername)
                        displayName = "KeePass username";
                    else if (value == null && fft == FormFieldType.FFTpassword)
                        displayName = "KeePass password";
                    
                    fields.Add(name, new FormField(name, displayName, value, fft, id, page));
                }
                else if (existingLi.Text == "KeeFox Priority" || existingLi.Text == "KPRPC Priority")
                {
                    if (existingLi.Text == "KeeFox Priority")
                    {
                        changeAdvancedString("KPRPC Priority", existingLi.SubItems[1].Text, false);
                        removeAdvancedString("KeeFox Priority");
                    }
                    textBoxKeeFoxPriority.Text = existingLi.SubItems[1].Text;
                }
                else if (existingLi.Text == "KPRPC Alternative URLs" || existingLi.Text == "Alternative URLs")
                {
                    foreach (string url in existingLi.SubItems[1].Text.Split(' '))
                        listNormalURLs.Add(url);
                    if (existingLi.Text == "Alternative URLs")
                    {
                        changeAdvancedString("KPRPC Alternative URLs", existingLi.SubItems[1].Text, false);
                        removeAdvancedString("Alternative URLs");
                    }
                }
                else if (existingLi.Text == "KPRPC Blocked URLs")
                {
                    foreach (string url in existingLi.SubItems[1].Text.Split(' '))
                        listNormalBlockedURLs.Add(url);
                }
                else if (existingLi.Text == "KPRPC URL Regex match")
                {
                    foreach (string url in existingLi.SubItems[1].Text.Split(' '))
                        listRegExURLs.Add(url);
                }
                else if (existingLi.Text == "KPRPC URL Regex block")
                {
                    foreach (string url in existingLi.SubItems[1].Text.Split(' '))
                        listRegExBlockedURLs.Add(url);
                }
                else if (existingLi.Text == "Form HTTP realm" || existingLi.Text == "KPRPC HTTP realm" || existingLi.Text == "KPRPC form HTTP realm")
                {
                    if (existingLi.Text == "Form HTTP realm")
                    {
                        changeAdvancedString("KPRPC HTTP realm", existingLi.SubItems[1].Text, false);
                        removeAdvancedString("Form HTTP realm");
                    }
                    if (existingLi.Text == "KPRPC form HTTP realm")
                    {
                        changeAdvancedString("KPRPC HTTP realm", existingLi.SubItems[1].Text, false);
                        removeAdvancedString("KPRPC form HTTP realm");
                    }
                    textBoxKeeFoxRealm.Text = existingLi.SubItems[1].Text;
                }

                
            }

            // find password... how? have to look through all fields again for ones with no value? likewise for username though could use FFTPusername type for that...
            bool standardPasswordFound = false;
            bool standardUsernameFound = false;

            foreach (FormField f in fields.Values)
            {
                string type = Utilities.FormFieldTypeToDisplay(f.Type, false);

                string value = f.Value;
                if (f.DisplayName == "KeePass username")
                {
                    standardUsernameFound = true;
                    value = f.DisplayName;
                }
                if (f.DisplayName == "KeePass password")
                {
                    standardPasswordFound = true;
                    value = f.DisplayName;
                }
                ListViewItem lvi = new ListViewItem(new string[] { f.Name, value, f.Id, type, f.Page.ToString() });
                AddFieldListItem(lvi);
            }

            // if we didn't find specific details about the username and
            // password, we'll pre-populate the standard KeePass ones so
            // users can easily change thigns like page number and ID

            // we don't add them to the list of actual fields though - just the display list.
            
            if (!standardPasswordFound)
            {
                ListViewItem lvi = new ListViewItem(new string[] { "UNSPECIFIED password", "KeePass password", "UNSPECIFIED password id", "password", "1" });
                AddFieldListItem(lvi);
            }
            if (!standardUsernameFound)
            {
                ListViewItem lvi = new ListViewItem(new string[] { "UNSPECIFIED username", "KeePass username", "UNSPECIFIED username id", "username", "1" });
                AddFieldListItem(lvi);
            }

            ReadURLStrings();

            comboBoxAutoSubmit.Text = "Use KeeFox setting";
            comboBoxAutoFill.Text = "Use KeeFox setting";

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
            this.textBoxKeeFoxPriority.TextChanged += new System.EventHandler(this.textBoxKeeFoxPriority_TextChanged);

            string realmTooltip = "Set this to the realm (what the \"site says\") in the HTTP authentication popup dialog box for a more accurate match";
            toolTipRealm.SetToolTip(this.textBoxKeeFoxRealm, realmTooltip);
            toolTipRealm.SetToolTip(this.labelRealm, realmTooltip);
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

        private void textBoxKeeFoxRealm_TextChanged(object sender, EventArgs e)
        {
            string realm = ((System.Windows.Forms.TextBoxBase)sender).Text;

            if (!string.IsNullOrEmpty(realm))
                changeAdvancedString("KPRPC HTTP realm", realm, false);
            else
                removeAdvancedString("KPRPC HTTP realm");
            return;
        }

        private void comboBoxAutoFill_SelectedIndexChanged(object sender, EventArgs e)
        {
            switch (comboBoxAutoFill.Text)
            {
                case "Use KeeFox setting":
                    if (comboBoxAutoSubmit.Text == "Never")
                        changeBehaviourState(EntryBehaviour.NeverAutoSubmit);
                    else
                        changeBehaviourState(EntryBehaviour.Default);
                    break;
                case "Never":
                    if (comboBoxAutoSubmit.Text == "Never")
                        changeBehaviourState(EntryBehaviour.NeverAutoSubmit);
                    else
                        changeBehaviourState(EntryBehaviour.NeverAutoFillNeverAutoSubmit);
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
                case "Use KeeFox setting": 
                    if (comboBoxAutoFill.Text == "Always") 
                        changeBehaviourState(EntryBehaviour.AlwaysAutoFill); 
                    else
                        changeBehaviourState(EntryBehaviour.Default);
                    break;
                case "Never":
                    if (comboBoxAutoFill.Text == "Always")
                        changeBehaviourState(EntryBehaviour.AlwaysAutoFillNeverAutoSubmit);
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
                    comboBoxAutoSubmit.Text = "Use KeeFox setting";
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
                    comboBoxAutoFill.Text = "Use KeeFox setting";
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
                    comboBoxAutoFill.Text = "Use KeeFox setting";
                    comboBoxAutoSubmit.Text = "Use KeeFox setting";
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
            List<string> all = new List<string>();
            for (int i = 0; i < listView1.Items.Count; ++i)
                all.Add(listView1.Items[i].Text);

            KeeFoxURLForm kfurlf = new KeeFoxURLForm(false,false,null,null,all);

            if (kfurlf.ShowDialog() == DialogResult.OK)
            {
                //UpdateEntryStrings(false, false);
                //ResizeColumnHeaders();

                if (kfurlf.Match && !kfurlf.RegEx)
                {
                    listNormalURLs.Add(kfurlf.URL);
                    ListViewItem lvi = new ListViewItem(new string[] { kfurlf.URL, "Normal", "Match" });
                    AddURLListItem(lvi);
                }
                if (kfurlf.Block && !kfurlf.RegEx)
                {
                    listNormalBlockedURLs.Add(kfurlf.URL);
                    ListViewItem lvi = new ListViewItem(new string[] { kfurlf.URL, "Normal", "Block" });
                    AddURLListItem(lvi);
                }
                if (kfurlf.Match && kfurlf.RegEx)
                {
                    listRegExURLs.Add(kfurlf.URL);
                    ListViewItem lvi = new ListViewItem(new string[] { kfurlf.URL, "RegEx", "Match" });
                    AddURLListItem(lvi);
                }
                if (kfurlf.Block && kfurlf.RegEx)
                {
                    listRegExBlockedURLs.Add(kfurlf.URL);
                    ListViewItem lvi = new ListViewItem(new string[] { kfurlf.URL, "RegEx", "Block" });
                    AddURLListItem(lvi);
                }
                UpdateURLStrings();
            }
        }

        private void buttonURLEdit_Click(object sender, EventArgs e)
        {
            ListView.SelectedListViewItemCollection lvsicSel = listView1.SelectedItems;

            List<string> all = new List<string>();
            for (int i = 0; i < listView1.Items.Count; ++i)
                all.Add(listView1.Items[i].Text);
            
            for (int i = 0; i < lvsicSel.Count; ++i)
            {
                List<string> others = all.GetRange(0, all.Count);
                others.Remove(lvsicSel[i].Text);

                // find the current data
                KeeFoxURLForm kfurlf = null;
                if (lvsicSel[i].SubItems[1].Text == "Normal" && lvsicSel[i].SubItems[2].Text == "Match")
                    kfurlf = new KeeFoxURLForm(true, false, null, lvsicSel[i].Text, others);
                else if (lvsicSel[i].SubItems[1].Text == "Normal" && lvsicSel[i].SubItems[2].Text == "Block")
                    kfurlf = new KeeFoxURLForm(false, true, null, lvsicSel[i].Text, others);
                else if (lvsicSel[i].SubItems[1].Text == "RegEx" && lvsicSel[i].SubItems[2].Text == "Match")
                    kfurlf = new KeeFoxURLForm(true, false, lvsicSel[i].Text, null, others);
                else if (lvsicSel[i].SubItems[1].Text == "RegEx" && lvsicSel[i].SubItems[2].Text == "Block")
                    kfurlf = new KeeFoxURLForm(false, true, lvsicSel[i].Text, null, others);

                if (kfurlf.ShowDialog() == DialogResult.OK)
                {
                    // remove the old URL data
                    if (lvsicSel[i].SubItems[1].Text == "Normal" && lvsicSel[i].SubItems[2].Text == "Match")
                        listNormalURLs.Remove(lvsicSel[i].Text);
                    else if (lvsicSel[i].SubItems[1].Text == "Normal" && lvsicSel[i].SubItems[2].Text == "Block")
                        listNormalBlockedURLs.Remove(lvsicSel[i].Text);
                    else if (lvsicSel[i].SubItems[1].Text == "RegEx" && lvsicSel[i].SubItems[2].Text == "Match")
                        listRegExURLs.Remove(lvsicSel[i].Text);
                    else if (lvsicSel[i].SubItems[1].Text == "RegEx" && lvsicSel[i].SubItems[2].Text == "Block")
                        listRegExBlockedURLs.Remove(lvsicSel[i].Text);
                    RemoveURLListItem(lvsicSel[i]);

                    //UpdateEntryStrings(false, false);
                    //ResizeColumnHeaders();

                    if (kfurlf.Match && !kfurlf.RegEx)
                    {
                        listNormalURLs.Add(kfurlf.URL);
                        ListViewItem lvi = new ListViewItem(new string[] { kfurlf.URL, "Normal", "Match" });
                        AddURLListItem(lvi);
                    }
                    if (kfurlf.Block && !kfurlf.RegEx)
                    {
                        listNormalBlockedURLs.Add(kfurlf.URL);
                        ListViewItem lvi = new ListViewItem(new string[] { kfurlf.URL, "Normal", "Block" });
                        AddURLListItem(lvi);
                    }
                    if (kfurlf.Match && kfurlf.RegEx)
                    {
                        listRegExURLs.Add(kfurlf.URL);
                        ListViewItem lvi = new ListViewItem(new string[] { kfurlf.URL, "RegEx", "Match" });
                        AddURLListItem(lvi);
                    }
                    if (kfurlf.Block && kfurlf.RegEx)
                    {
                        listRegExBlockedURLs.Add(kfurlf.URL);
                        ListViewItem lvi = new ListViewItem(new string[] { kfurlf.URL, "RegEx", "Block" });
                        AddURLListItem(lvi);
                    }
                    UpdateURLStrings();

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
                RemoveURLListItem(lvsicSel[i]);
            }

            UpdateURLStrings();
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


        private void UpdateFieldStrings()
        {
            foreach (ListViewItem existingLi in _advancedListView.Items)
            {
                if (existingLi.Text.StartsWith("KPRPC Form field ") || existingLi.Text.StartsWith("Form field "))
                {
                    _advancedListView.Items.Remove(existingLi);
                    _strings.Remove(existingLi.Text);
                }
            }
        
            foreach (FormField field in fields.Values)
            {
                string type = Utilities.FormFieldTypeToDisplay(field.Type,false);

                if (field.DisplayName != "KeePass username" && field.DisplayName != "KeePass password")
                {
                    if (field.Type == FormFieldType.FFTpassword)
                        changeAdvancedString("KPRPC Form field " + field.Name + " value", field.Value, KeePassRPCPlugin._host.Database.MemoryProtection.ProtectPassword);
                    else
                        changeAdvancedString("KPRPC Form field " + field.Name + " value", field.Value, false);
                }

                changeAdvancedString("KPRPC Form field " + field.Name + " type", type, false);
                if (!string.IsNullOrEmpty(field.Id))
                    changeAdvancedString("KPRPC Form field " + field.Name + " id", field.Id, false);
                else
                    changeAdvancedString("KPRPC Form field " + field.Name + " id", "", false);
                if (field.Page >= 0)
                    changeAdvancedString("KPRPC Form field " + field.Name + " page", field.Page.ToString(), false);
            }
        }
        

        private void ReadURLStrings()
        {
            foreach (string url in listNormalURLs)
            {
                ListViewItem lvi = new ListViewItem(new string[] { url, "Normal", "Match" });
                AddURLListItem(lvi);
            }
            foreach (string url in listNormalBlockedURLs)
            {
                ListViewItem lvi = new ListViewItem(new string[] { url, "Normal", "Block" });
                AddURLListItem(lvi);
            }
            foreach (string url in listRegExURLs)
            {
                ListViewItem lvi = new ListViewItem(new string[] { url, "RegEx", "Match" });
                AddURLListItem(lvi);
            }
            foreach (string url in listRegExBlockedURLs)
            {
                ListViewItem lvi = new ListViewItem(new string[] { url, "RegEx", "Block" });
                AddURLListItem(lvi);
            }
        }

        private void AddURLListItem(ListViewItem lvi)
        {
            listView1.Items.Add(lvi);
            //buttonURLEdit.Enabled = true;
            //buttonURLDelete.Enabled = true;
        }

        private void RemoveURLListItem(ListViewItem lvi)
        {
            listView1.Items.Remove(lvi);
            if (listView1.Items.Count == 0)
            {
                buttonURLEdit.Enabled = false;
                buttonURLDelete.Enabled = false;
            }
        }

        private void listView1_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (listView1.SelectedItems.Count > 0)
            {
                buttonURLEdit.Enabled = true;
                buttonURLDelete.Enabled = true;
            } else
            {
                buttonURLEdit.Enabled = false;
                buttonURLDelete.Enabled = false;
            }
        }

        private void buttonFieldAdd_Click(object sender, EventArgs e)
        {
            List<string> all = new List<string>();
            for (int i = 0; i < listView2.Items.Count; ++i)
                all.Add(listView2.Items[i].Text);

            KeeFoxFieldForm kfff = new KeeFoxFieldForm(null, null, null, FormFieldType.FFTtext, 1, all);

            if (kfff.ShowDialog() == DialogResult.OK)
            {
                fields.Add(kfff.Name,new FormField(kfff.Name, kfff.Name, kfff.Value, kfff.Type, kfff.Id, kfff.Page));

                string type = Utilities.FormFieldTypeToDisplay(kfff.Type,false);
                int page = kfff.Page;

                // We know any new passwords are not the main Entry password
                ListViewItem lvi = new ListViewItem(new string[] { kfff.Name, kfff.Type == FormFieldType.FFTpassword ? "********" : kfff.Value, kfff.Id, type, page.ToString() });
                AddFieldListItem(lvi);

                //////if (kfff.Type != FormFieldType.FFTusername

                //UpdateEntryStrings(false, false);
                //ResizeColumnHeaders();

                //if (kfff.Match && !kfff.RegEx)
                //{
                //    listNormalURLs.Add(kfff.URL);
                //    ListViewItem lvi = new ListViewItem(new string[] { kfurlf.URL, "Normal", "Match" });
                //    AddURLListItem(lvi);
                //}
                
                
                UpdateFieldStrings();

                //fiel
            }
        }

        private void buttonFieldEdit_Click(object sender, EventArgs e)
        {
            ListView.SelectedListViewItemCollection lvsicSel = listView2.SelectedItems;
            List<string> all = new List<string>();
            for (int i = 0; i < listView2.Items.Count; ++i)
                all.Add(listView2.Items[i].Text);

            List<string> others = all.GetRange(0, all.Count);
            others.Remove(lvsicSel[0].Text);

            FormFieldType fft = Utilities.FormFieldTypeFromDisplay(lvsicSel[0].SubItems[3].Text);
            string existingValue = "";
            if (lvsicSel[0].SubItems[1].Text == "KeePass password" || lvsicSel[0].SubItems[1].Text == "KeePass username")
                existingValue = lvsicSel[0].SubItems[1].Text;
            else
                existingValue = _strings.Get("KPRPC Form field " + lvsicSel[0].SubItems[0].Text + " value").ReadString();

            KeeFoxFieldForm kfff = new KeeFoxFieldForm(lvsicSel[0].SubItems[0].Text, existingValue, lvsicSel[0].SubItems[2].Text, fft, int.Parse(lvsicSel[0].SubItems[4].Text), others);

            if (kfff.ShowDialog() == DialogResult.OK)
            {
                // remove the old field data
                fields.Remove(lvsicSel[0].Text);
                RemoveFieldListItem(lvsicSel[0]);

                string displayName = kfff.Name;
                if (kfff.Value == "KeePass password" || kfff.Value == "KeePass username")
                    displayName = kfff.Value;

                string type = Utilities.FormFieldTypeToDisplay(kfff.Type, false);
                int page = kfff.Page;

                ListViewItem lvi = new ListViewItem(new string[] { kfff.Name, kfff.Type == FormFieldType.FFTpassword ? "********" : kfff.Value, kfff.Id, type, page.ToString() });
                AddFieldListItem(lvi);
                fields.Add(kfff.Name, new FormField(kfff.Name, displayName, kfff.Value, kfff.Type, kfff.Id, page));


                UpdateFieldStrings();
            }

        }

        private void buttonFieldDelete_Click(object sender, EventArgs e)
        {
            ListView.SelectedListViewItemCollection lvsicSel = listView2.SelectedItems;
            // remove the old field data
            fields.Remove(lvsicSel[0].Text);
            RemoveFieldListItem(lvsicSel[0]);
            UpdateFieldStrings();
        }

        //ReadFields function????

        private void AddFieldListItem(ListViewItem lvi)
        {
            listView2.Items.Add(lvi);
        }

        private void RemoveFieldListItem(ListViewItem lvi)
        {
            listView2.Items.Remove(lvi);
            if (listView2.Items.Count == 0)
            {
                buttonFieldEdit.Enabled = false;
                buttonFieldDelete.Enabled = false;
            }
        }

        private void listView2_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (listView2.SelectedItems.Count > 0)
            {
                buttonFieldEdit.Enabled = true;
                if (listView2.SelectedItems[0].SubItems[1].Text != "KeePass username" 
                    && listView2.SelectedItems[0].SubItems[1].Text != "KeePass password")
                    buttonFieldDelete.Enabled = true;
            }
            else
            {
                buttonFieldEdit.Enabled = false;
                buttonFieldDelete.Enabled = false;
            }
        }

        private void listView1_MouseDoubleClick(object sender, MouseEventArgs e)
        {
            if (listView1.SelectedItems.Count > 0)
            {
                buttonURLEdit_Click(sender, e);
            }
        }

        private void listView2_MouseDoubleClick(object sender, MouseEventArgs e)
        {
            if (listView2.SelectedItems.Count > 0)
            {
                buttonFieldEdit_Click(sender, e);
            }
        }

    }
}
