namespace KeePassRPC.Forms
{
    partial class KeeFoxEntryUserControl
    {
        /// <summary> 
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary> 
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Component Designer generated code

        /// <summary> 
        /// Required method for Designer support - do not modify 
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.comboBoxAutoFill = new System.Windows.Forms.ComboBox();
            this.comboBoxAutoSubmit = new System.Windows.Forms.ComboBox();
            this.label4 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.label1 = new System.Windows.Forms.Label();
            this.textBoxKeeFoxPriority = new System.Windows.Forms.TextBox();
            this.checkBoxHideFromKeeFox = new System.Windows.Forms.CheckBox();
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.buttonFieldEdit = new System.Windows.Forms.Button();
            this.buttonFieldDelete = new System.Windows.Forms.Button();
            this.listView2 = new System.Windows.Forms.ListView();
            this.columnHeaderFName = new System.Windows.Forms.ColumnHeader();
            this.columnHeaderFValue = new System.Windows.Forms.ColumnHeader();
            this.columnHeaderFId = new System.Windows.Forms.ColumnHeader();
            this.columnHeaderFType = new System.Windows.Forms.ColumnHeader();
            this.columnHeaderFPage = new System.Windows.Forms.ColumnHeader();
            this.buttonFieldAdd = new System.Windows.Forms.Button();
            this.groupBox3 = new System.Windows.Forms.GroupBox();
            this.buttonURLEdit = new System.Windows.Forms.Button();
            this.buttonURLDelete = new System.Windows.Forms.Button();
            this.buttonURLAdd = new System.Windows.Forms.Button();
            this.listView1 = new System.Windows.Forms.ListView();
            this.columnHeaderValue = new System.Windows.Forms.ColumnHeader();
            this.columnHeaderMethod = new System.Windows.Forms.ColumnHeader();
            this.columnHeaderType = new System.Windows.Forms.ColumnHeader();
            this.groupBox1.SuspendLayout();
            this.groupBox2.SuspendLayout();
            this.groupBox3.SuspendLayout();
            this.SuspendLayout();
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.comboBoxAutoFill);
            this.groupBox1.Controls.Add(this.comboBoxAutoSubmit);
            this.groupBox1.Controls.Add(this.label4);
            this.groupBox1.Controls.Add(this.label3);
            this.groupBox1.Location = new System.Drawing.Point(3, 165);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(462, 50);
            this.groupBox1.TabIndex = 0;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "Entry behaviour";
            // 
            // comboBoxAutoFill
            // 
            this.comboBoxAutoFill.FormattingEnabled = true;
            this.comboBoxAutoFill.Items.AddRange(new object[] {
            "Use KeeFox setting",
            "Never",
            "Always"});
            this.comboBoxAutoFill.Location = new System.Drawing.Point(56, 20);
            this.comboBoxAutoFill.Name = "comboBoxAutoFill";
            this.comboBoxAutoFill.Size = new System.Drawing.Size(121, 21);
            this.comboBoxAutoFill.TabIndex = 7;
            // 
            // comboBoxAutoSubmit
            // 
            this.comboBoxAutoSubmit.FormattingEnabled = true;
            this.comboBoxAutoSubmit.Items.AddRange(new object[] {
            "Use KeeFox setting",
            "Never",
            "Always"});
            this.comboBoxAutoSubmit.Location = new System.Drawing.Point(326, 20);
            this.comboBoxAutoSubmit.Name = "comboBoxAutoSubmit";
            this.comboBoxAutoSubmit.Size = new System.Drawing.Size(121, 21);
            this.comboBoxAutoSubmit.TabIndex = 8;
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(257, 23);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(65, 13);
            this.label4.TabIndex = 1;
            this.label4.Text = "Auto-submit:";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(6, 23);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(44, 13);
            this.label3.TabIndex = 0;
            this.label3.Text = "Auto-fill:";
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(317, 11);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(142, 13);
            this.label1.TabIndex = 0;
            this.label1.Text = "Priority override (e.g. 1 - 100)";
            // 
            // textBoxKeeFoxPriority
            // 
            this.textBoxKeeFoxPriority.Location = new System.Drawing.Point(272, 7);
            this.textBoxKeeFoxPriority.Name = "textBoxKeeFoxPriority";
            this.textBoxKeeFoxPriority.Size = new System.Drawing.Size(39, 20);
            this.textBoxKeeFoxPriority.TabIndex = 2;
            // 
            // checkBoxHideFromKeeFox
            // 
            this.checkBoxHideFromKeeFox.AutoSize = true;
            this.checkBoxHideFromKeeFox.Location = new System.Drawing.Point(12, 7);
            this.checkBoxHideFromKeeFox.Name = "checkBoxHideFromKeeFox";
            this.checkBoxHideFromKeeFox.Size = new System.Drawing.Size(155, 17);
            this.checkBoxHideFromKeeFox.TabIndex = 1;
            this.checkBoxHideFromKeeFox.Text = "Hide this entry from KeeFox";
            this.checkBoxHideFromKeeFox.UseVisualStyleBackColor = true;
            // 
            // groupBox2
            // 
            this.groupBox2.Controls.Add(this.buttonFieldEdit);
            this.groupBox2.Controls.Add(this.buttonFieldDelete);
            this.groupBox2.Controls.Add(this.listView2);
            this.groupBox2.Controls.Add(this.buttonFieldAdd);
            this.groupBox2.Location = new System.Drawing.Point(3, 221);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Size = new System.Drawing.Size(462, 127);
            this.groupBox2.TabIndex = 0;
            this.groupBox2.TabStop = false;
            this.groupBox2.Text = "Form fields";
            // 
            // buttonFieldEdit
            // 
            this.buttonFieldEdit.Enabled = false;
            this.buttonFieldEdit.Location = new System.Drawing.Point(396, 57);
            this.buttonFieldEdit.Name = "buttonFieldEdit";
            this.buttonFieldEdit.Size = new System.Drawing.Size(60, 24);
            this.buttonFieldEdit.TabIndex = 11;
            this.buttonFieldEdit.Text = "Edit";
            this.buttonFieldEdit.UseVisualStyleBackColor = true;
            this.buttonFieldEdit.Click += new System.EventHandler(this.buttonFieldEdit_Click);
            // 
            // buttonFieldDelete
            // 
            this.buttonFieldDelete.Enabled = false;
            this.buttonFieldDelete.Location = new System.Drawing.Point(396, 91);
            this.buttonFieldDelete.Name = "buttonFieldDelete";
            this.buttonFieldDelete.Size = new System.Drawing.Size(60, 25);
            this.buttonFieldDelete.TabIndex = 12;
            this.buttonFieldDelete.Text = "Delete";
            this.buttonFieldDelete.UseVisualStyleBackColor = true;
            this.buttonFieldDelete.Click += new System.EventHandler(this.buttonFieldDelete_Click);
            // 
            // listView2
            // 
            this.listView2.Columns.AddRange(new System.Windows.Forms.ColumnHeader[] {
            this.columnHeaderFName,
            this.columnHeaderFValue,
            this.columnHeaderFId,
            this.columnHeaderFType,
            this.columnHeaderFPage});
            this.listView2.FullRowSelect = true;
            this.listView2.HeaderStyle = System.Windows.Forms.ColumnHeaderStyle.Nonclickable;
            this.listView2.HideSelection = false;
            this.listView2.Location = new System.Drawing.Point(10, 19);
            this.listView2.MultiSelect = false;
            this.listView2.Name = "listView2";
            this.listView2.ShowItemToolTips = true;
            this.listView2.Size = new System.Drawing.Size(380, 97);
            this.listView2.TabIndex = 9;
            this.listView2.UseCompatibleStateImageBehavior = false;
            this.listView2.View = System.Windows.Forms.View.Details;
            this.listView2.SelectedIndexChanged += new System.EventHandler(this.listView2_SelectedIndexChanged);
            // 
            // columnHeaderFName
            // 
            this.columnHeaderFName.Text = "Name";
            this.columnHeaderFName.Width = 76;
            // 
            // columnHeaderFValue
            // 
            this.columnHeaderFValue.Text = "Value";
            this.columnHeaderFValue.Width = 115;
            // 
            // columnHeaderFId
            // 
            this.columnHeaderFId.Text = "Id";
            this.columnHeaderFId.Width = 85;
            // 
            // columnHeaderFType
            // 
            this.columnHeaderFType.Text = "Type";
            // 
            // columnHeaderFPage
            // 
            this.columnHeaderFPage.Text = "Page";
            // 
            // buttonFieldAdd
            // 
            this.buttonFieldAdd.Location = new System.Drawing.Point(396, 19);
            this.buttonFieldAdd.Name = "buttonFieldAdd";
            this.buttonFieldAdd.Size = new System.Drawing.Size(60, 26);
            this.buttonFieldAdd.TabIndex = 10;
            this.buttonFieldAdd.Text = "Add";
            this.buttonFieldAdd.UseVisualStyleBackColor = true;
            this.buttonFieldAdd.Click += new System.EventHandler(this.buttonFieldAdd_Click);
            // 
            // groupBox3
            // 
            this.groupBox3.Controls.Add(this.buttonURLEdit);
            this.groupBox3.Controls.Add(this.buttonURLDelete);
            this.groupBox3.Controls.Add(this.buttonURLAdd);
            this.groupBox3.Controls.Add(this.listView1);
            this.groupBox3.Location = new System.Drawing.Point(3, 30);
            this.groupBox3.Name = "groupBox3";
            this.groupBox3.Size = new System.Drawing.Size(462, 133);
            this.groupBox3.TabIndex = 0;
            this.groupBox3.TabStop = false;
            this.groupBox3.Text = "Additional URLs";
            // 
            // buttonURLEdit
            // 
            this.buttonURLEdit.Enabled = false;
            this.buttonURLEdit.Location = new System.Drawing.Point(396, 61);
            this.buttonURLEdit.Name = "buttonURLEdit";
            this.buttonURLEdit.Size = new System.Drawing.Size(60, 24);
            this.buttonURLEdit.TabIndex = 5;
            this.buttonURLEdit.Text = "Edit";
            this.buttonURLEdit.UseVisualStyleBackColor = true;
            this.buttonURLEdit.Click += new System.EventHandler(this.buttonURLEdit_Click);
            // 
            // buttonURLDelete
            // 
            this.buttonURLDelete.Enabled = false;
            this.buttonURLDelete.Location = new System.Drawing.Point(396, 102);
            this.buttonURLDelete.Name = "buttonURLDelete";
            this.buttonURLDelete.Size = new System.Drawing.Size(60, 25);
            this.buttonURLDelete.TabIndex = 6;
            this.buttonURLDelete.Text = "Delete";
            this.buttonURLDelete.UseVisualStyleBackColor = true;
            this.buttonURLDelete.Click += new System.EventHandler(this.buttonURLDelete_Click);
            // 
            // buttonURLAdd
            // 
            this.buttonURLAdd.Location = new System.Drawing.Point(396, 19);
            this.buttonURLAdd.Name = "buttonURLAdd";
            this.buttonURLAdd.Size = new System.Drawing.Size(60, 26);
            this.buttonURLAdd.TabIndex = 4;
            this.buttonURLAdd.Text = "Add";
            this.buttonURLAdd.UseVisualStyleBackColor = true;
            this.buttonURLAdd.Click += new System.EventHandler(this.buttonURLAdd_Click);
            // 
            // listView1
            // 
            this.listView1.Columns.AddRange(new System.Windows.Forms.ColumnHeader[] {
            this.columnHeaderValue,
            this.columnHeaderMethod,
            this.columnHeaderType});
            this.listView1.FullRowSelect = true;
            this.listView1.HeaderStyle = System.Windows.Forms.ColumnHeaderStyle.Nonclickable;
            this.listView1.HideSelection = false;
            this.listView1.Location = new System.Drawing.Point(10, 19);
            this.listView1.MultiSelect = false;
            this.listView1.Name = "listView1";
            this.listView1.ShowItemToolTips = true;
            this.listView1.Size = new System.Drawing.Size(380, 108);
            this.listView1.TabIndex = 3;
            this.listView1.UseCompatibleStateImageBehavior = false;
            this.listView1.View = System.Windows.Forms.View.Details;
            this.listView1.SelectedIndexChanged += new System.EventHandler(this.listView1_SelectedIndexChanged);
            // 
            // columnHeaderValue
            // 
            this.columnHeaderValue.Text = "URL / pattern";
            this.columnHeaderValue.Width = 226;
            // 
            // columnHeaderMethod
            // 
            this.columnHeaderMethod.Text = "Method";
            // 
            // columnHeaderType
            // 
            this.columnHeaderType.Text = "Type";
            // 
            // KeeFoxEntryUserControl
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.SystemColors.Window;
            this.Controls.Add(this.groupBox1);
            this.Controls.Add(this.checkBoxHideFromKeeFox);
            this.Controls.Add(this.groupBox3);
            this.Controls.Add(this.groupBox2);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.textBoxKeeFoxPriority);
            this.Name = "KeeFoxEntryUserControl";
            this.Size = new System.Drawing.Size(472, 353);
            this.Load += new System.EventHandler(this.KeeFoxEntryUserControl_Load);
            this.groupBox1.ResumeLayout(false);
            this.groupBox1.PerformLayout();
            this.groupBox2.ResumeLayout(false);
            this.groupBox3.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.CheckBox checkBoxHideFromKeeFox;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TextBox textBoxKeeFoxPriority;
        private System.Windows.Forms.GroupBox groupBox2;
        private System.Windows.Forms.GroupBox groupBox3;
        private System.Windows.Forms.ComboBox comboBoxAutoSubmit;
        private System.Windows.Forms.ComboBox comboBoxAutoFill;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.ListView listView1;
        private System.Windows.Forms.Button buttonURLDelete;
        private System.Windows.Forms.Button buttonURLEdit;
        private System.Windows.Forms.Button buttonURLAdd;
        private System.Windows.Forms.ColumnHeader columnHeaderValue;
        private System.Windows.Forms.ColumnHeader columnHeaderType;
        private System.Windows.Forms.ColumnHeader columnHeaderMethod;
        private System.Windows.Forms.Button buttonFieldEdit;
        private System.Windows.Forms.Button buttonFieldDelete;
        private System.Windows.Forms.ListView listView2;
        private System.Windows.Forms.Button buttonFieldAdd;
        private System.Windows.Forms.ColumnHeader columnHeaderFName;
        private System.Windows.Forms.ColumnHeader columnHeaderFValue;
        private System.Windows.Forms.ColumnHeader columnHeaderFId;
        private System.Windows.Forms.ColumnHeader columnHeaderFType;
        private System.Windows.Forms.ColumnHeader columnHeaderFPage;
    }
}
