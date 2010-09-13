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
    public partial class KeeFoxGroupUserControl : UserControl
    {
        KeePassRPCExt KeePassRPCPlugin;

        PwGroup _group;

        KeeFoxHomeStatus _status = KeeFoxHomeStatus.Unknown;

        KeeFoxHomeStatus Status { get {
            if (_status == KeeFoxHomeStatus.Unknown)
            {
                PwGroup _rootGroup = KeePassRPCPlugin.RPCService.GetRootPwGroup(KeePassRPCPlugin._host.Database);

                if (KeePassRPCPlugin._host.Database.RootGroup.Uuid.EqualsValue(_group.Uuid))
                    _status = KeeFoxHomeStatus.Home;
                else if (KeePassRPCPlugin._host.Database.RecycleBinUuid.EqualsValue(_group.Uuid))
                    _status = KeeFoxHomeStatus.Rubbish;
                else if (_group.IsContainedIn(_rootGroup)) // returns true when _group is main root and custom root group has been selected.
                    _status = KeeFoxHomeStatus.Inside;
                else
                    _status = KeeFoxHomeStatus.Outside;

            }
            return _status;
        
        } }

        public KeeFoxGroupUserControl(KeePassRPCExt keePassRPCPlugin, PwGroup group)
        {
            KeePassRPCPlugin = keePassRPCPlugin;
            _group = group;
            InitializeComponent();
        }

        private void KeeFoxGroupUserControl_Load(object sender, EventArgs e)
        {
            switch (Status)
            {
                case KeeFoxHomeStatus.Home:
                    l_status.Text = @"This is the KeeFox Home group. KeeFox can see and work with
this group and all groups and entries that are contained within.";
                    buttonMakeHome.Enabled = false;
                    break;
                case KeeFoxHomeStatus.Inside:
                    l_status.Text = @"KeeFox can see and work with this group.";
                    break;
                case KeeFoxHomeStatus.Outside:
                    l_status.Text = @"This group is hidden from KeeFox. You must change your Home
group if you want KeeFox to work with this group.";
                    break;
                case KeeFoxHomeStatus.Rubbish:
                    l_status.Text = @"This group is hidden from KeeFox. You must remove it from
the recycle bin if you want KeeFox to work with this group.";
                    break;
            }
            
            //buttonMakeHome.Text = @"Set as KeeFox Home group";

            l_homeExplanation.Text = @"KeeFox will only know about the groups
and entries that are inside your Home group";
        }
    }

    enum KeeFoxHomeStatus
    {
        Unknown,
        Rubbish,
        Home,
        Inside,
        Outside
    }
}
