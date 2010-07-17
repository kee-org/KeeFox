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

        public KeeFoxEntryUserControl(KeePassRPCExt keePassRPCPlugin, PwEntry entry, CustomListViewEx advancedListView)
        {
            KeePassRPCPlugin = keePassRPCPlugin;
            _entry = entry;
            InitializeComponent();
            _advancedListView = advancedListView;
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
        }

        private void checkBoxHideFromKeeFox_CheckedChanged(object sender, EventArgs e)
        {
            if (checkBoxHideFromKeeFox.Checked)
                changeAdvancedString("Hide from KeeFox", "", false);
            else
                removeAdvancedString("Hide from KeeFox");
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
                switch (existingLi.Text)
                {
                    case "Hide from KeeFox": checkBoxHideFromKeeFox.Checked = true; break;
                    case "KeeFox Never Auto Fill": kfNeverAutoFill = true; break;
                    case "KeeFox Always Auto Fill": kfAlwaysAutoFill = true; break;
                    case "KeeFox Never Auto Submit": kfNeverAutoSubmit = true; break;
                    case "KeeFox Always Auto Submit": kfAlwaysAutoSubmit = true; break;
                    default: break;
                }

                
                
            }

            comboBoxAutoSubmit.Text = "KeeFox setting";
            comboBoxAutoFill.Text = "KeeFox setting";

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

        }

        private void comboBoxAutoFill_SelectedIndexChanged(object sender, EventArgs e)
        {
            switch (comboBoxAutoFill.Text)
            {
                case "KeeFox setting":
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
                case "KeeFox setting": 
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
                    changeAdvancedString("KeeFox Always Auto Fill", "", false);
                    removeAdvancedString("KeeFox Never Auto Fill");
                    removeAdvancedString("KeeFox Always Auto Submit");
                    removeAdvancedString("KeeFox Never Auto Submit");
                    comboBoxAutoFill.Text = "Always";
                    comboBoxAutoSubmit.Text = "KeeFox setting";
                    comboBoxAutoFill.Enabled = true;
                    comboBoxAutoSubmit.Enabled = true;
                    break;
                case EntryBehaviour.NeverAutoSubmit:
                    changeAdvancedString("KeeFox Never Auto Submit", "", false);
                    removeAdvancedString("KeeFox Always Auto Submit");
                    removeAdvancedString("KeeFox Always Auto Fill");
                    removeAdvancedString("KeeFox Never Auto Fill");
                    comboBoxAutoFill.Text = "KeeFox setting";
                    comboBoxAutoSubmit.Text = "Never";
                    comboBoxAutoFill.Enabled = true;
                    comboBoxAutoSubmit.Enabled = true;
                    break;
                case EntryBehaviour.AlwaysAutoFillAlwaysAutoSubmit:
                    changeAdvancedString("KeeFox Always Auto Fill", "", false);
                    changeAdvancedString("KeeFox Always Auto Submit", "", false);
                    removeAdvancedString("KeeFox Never Auto Fill");
                    removeAdvancedString("KeeFox Never Auto Submit");
                    comboBoxAutoSubmit.Text = "Always";
                    comboBoxAutoFill.Text = "Always";
                    comboBoxAutoFill.Enabled = false;
                    comboBoxAutoSubmit.Enabled = true;
                    break;
                case EntryBehaviour.NeverAutoFillNeverAutoSubmit:
                    changeAdvancedString("KeeFox Never Auto Fill", "", false);
                    changeAdvancedString("KeeFox Never Auto Submit", "", false);
                    removeAdvancedString("KeeFox Always Auto Fill");
                    removeAdvancedString("KeeFox Always Auto Submit");
                    comboBoxAutoFill.Text = "Never";
                    comboBoxAutoSubmit.Text = "Never";
                    comboBoxAutoSubmit.Enabled = false;
                    comboBoxAutoFill.Enabled = true;
                    break;
                case EntryBehaviour.AlwaysAutoFillNeverAutoSubmit:
                    changeAdvancedString("KeeFox Always Auto Fill", "", false);
                    changeAdvancedString("KeeFox Never Auto Submit", "", false);
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
                    comboBoxAutoFill.Text = "KeeFox setting";
                    comboBoxAutoSubmit.Text = "KeeFox setting";
                    comboBoxAutoSubmit.Enabled = true;
                    comboBoxAutoFill.Enabled = true;
                    break;
            }
            currentBehaviour = behav;
        }

        List<string> listNormalURLs = new List<string>();
        List<string> listRegExURLs = new List<string>();

        private void buttonURLAdd_Click(object sender, EventArgs e)
        {

        }

        private void buttonURLEdit_Click(object sender, EventArgs e)
        {

        }

        private void buttonURLDelete_Click(object sender, EventArgs e)
        {
            ListView.SelectedListViewItemCollection lvsicSel = listView1.SelectedItems;
            for (int i = 0; i < lvsicSel.Count; ++i)
            {
                if (lvsicSel[i].SubItems[1].Text == "Normal")
                    listNormalURLs.Remove(lvsicSel[i].Text);
                else if (lvsicSel[i].SubItems[1].Text == "RegEx")
                    listRegExURLs.Remove(lvsicSel[i].Text);
            }

            if (lvsicSel.Count > 0)
            {
                UpdateURLStrings();
            }
            
        }

        private void UpdateURLStrings()
        {
            foreach (string url in listNormalURLs)
            {


            }
        }
    }
}
