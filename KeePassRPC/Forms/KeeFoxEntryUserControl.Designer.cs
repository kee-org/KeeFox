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
            this.comboBoxAutoSubmit = new System.Windows.Forms.ComboBox();
            this.label4 = new System.Windows.Forms.Label();
            this.comboBoxAutoFill = new System.Windows.Forms.ComboBox();
            this.label3 = new System.Windows.Forms.Label();
            this.label1 = new System.Windows.Forms.Label();
            this.textBoxKeeFoxPriority = new System.Windows.Forms.TextBox();
            this.checkBoxHideFromKeeFox = new System.Windows.Forms.CheckBox();
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.groupBox3 = new System.Windows.Forms.GroupBox();
            this.buttonURLDelete = new System.Windows.Forms.Button();
            this.buttonURLEdit = new System.Windows.Forms.Button();
            this.buttonURLAdd = new System.Windows.Forms.Button();
            this.label5 = new System.Windows.Forms.Label();
            this.listView1 = new System.Windows.Forms.ListView();
            this.columnHeaderValue = new System.Windows.Forms.ColumnHeader();
            this.columnHeaderType = new System.Windows.Forms.ColumnHeader();
            this.groupBox1.SuspendLayout();
            this.groupBox3.SuspendLayout();
            this.SuspendLayout();
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.comboBoxAutoSubmit);
            this.groupBox1.Controls.Add(this.label4);
            this.groupBox1.Controls.Add(this.comboBoxAutoFill);
            this.groupBox1.Controls.Add(this.label3);
            this.groupBox1.Location = new System.Drawing.Point(3, 165);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(413, 50);
            this.groupBox1.TabIndex = 1;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "Entry behaviour";
            // 
            // comboBoxAutoSubmit
            // 
            this.comboBoxAutoSubmit.FormattingEnabled = true;
            this.comboBoxAutoSubmit.Items.AddRange(new object[] {
            "Use KeeFox setting",
            "Never",
            "Always"});
            this.comboBoxAutoSubmit.Location = new System.Drawing.Point(278, 20);
            this.comboBoxAutoSubmit.Name = "comboBoxAutoSubmit";
            this.comboBoxAutoSubmit.Size = new System.Drawing.Size(121, 21);
            this.comboBoxAutoSubmit.TabIndex = 1;
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(209, 23);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(65, 13);
            this.label4.TabIndex = 1;
            this.label4.Text = "Auto-submit:";
            // 
            // comboBoxAutoFill
            // 
            this.comboBoxAutoFill.FormattingEnabled = true;
            this.comboBoxAutoFill.Items.AddRange(new object[] {
            "Use KeeFox setting",
            "Never",
            "Always"});
            this.comboBoxAutoFill.Location = new System.Drawing.Point(56, 19);
            this.comboBoxAutoFill.Name = "comboBoxAutoFill";
            this.comboBoxAutoFill.Size = new System.Drawing.Size(97, 21);
            this.comboBoxAutoFill.TabIndex = 0;
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
            this.label1.Location = new System.Drawing.Point(257, 16);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(142, 13);
            this.label1.TabIndex = 6;
            this.label1.Text = "Priority override (e.g. 1 - 100)";
            // 
            // textBoxKeeFoxPriority
            // 
            this.textBoxKeeFoxPriority.Location = new System.Drawing.Point(212, 13);
            this.textBoxKeeFoxPriority.Name = "textBoxKeeFoxPriority";
            this.textBoxKeeFoxPriority.Size = new System.Drawing.Size(39, 20);
            this.textBoxKeeFoxPriority.TabIndex = 5;
            // 
            // checkBoxHideFromKeeFox
            // 
            this.checkBoxHideFromKeeFox.AutoSize = true;
            this.checkBoxHideFromKeeFox.Location = new System.Drawing.Point(9, 3);
            this.checkBoxHideFromKeeFox.Name = "checkBoxHideFromKeeFox";
            this.checkBoxHideFromKeeFox.Size = new System.Drawing.Size(155, 17);
            this.checkBoxHideFromKeeFox.TabIndex = 1;
            this.checkBoxHideFromKeeFox.Text = "Hide this entry from KeeFox";
            this.checkBoxHideFromKeeFox.UseVisualStyleBackColor = true;
            // 
            // groupBox2
            // 
            this.groupBox2.Location = new System.Drawing.Point(3, 221);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Size = new System.Drawing.Size(413, 139);
            this.groupBox2.TabIndex = 2;
            this.groupBox2.TabStop = false;
            this.groupBox2.Text = "Form fields";
            // 
            // groupBox3
            // 
            this.groupBox3.Controls.Add(this.buttonURLDelete);
            this.groupBox3.Controls.Add(this.buttonURLEdit);
            this.groupBox3.Controls.Add(this.buttonURLAdd);
            this.groupBox3.Controls.Add(this.label5);
            this.groupBox3.Controls.Add(this.listView1);
            this.groupBox3.Controls.Add(this.label1);
            this.groupBox3.Controls.Add(this.textBoxKeeFoxPriority);
            this.groupBox3.Location = new System.Drawing.Point(3, 26);
            this.groupBox3.Name = "groupBox3";
            this.groupBox3.Size = new System.Drawing.Size(413, 133);
            this.groupBox3.TabIndex = 3;
            this.groupBox3.TabStop = false;
            this.groupBox3.Text = "URL matching";
            // 
            // buttonURLDelete
            // 
            this.buttonURLDelete.Location = new System.Drawing.Point(347, 101);
            this.buttonURLDelete.Name = "buttonURLDelete";
            this.buttonURLDelete.Size = new System.Drawing.Size(60, 25);
            this.buttonURLDelete.TabIndex = 11;
            this.buttonURLDelete.Text = "Delete";
            this.buttonURLDelete.UseVisualStyleBackColor = true;
            this.buttonURLDelete.Click += new System.EventHandler(this.buttonURLDelete_Click);
            // 
            // buttonURLEdit
            // 
            this.buttonURLEdit.Location = new System.Drawing.Point(347, 71);
            this.buttonURLEdit.Name = "buttonURLEdit";
            this.buttonURLEdit.Size = new System.Drawing.Size(60, 24);
            this.buttonURLEdit.TabIndex = 10;
            this.buttonURLEdit.Text = "Edit";
            this.buttonURLEdit.UseVisualStyleBackColor = true;
            this.buttonURLEdit.Click += new System.EventHandler(this.buttonURLEdit_Click);
            // 
            // buttonURLAdd
            // 
            this.buttonURLAdd.Location = new System.Drawing.Point(347, 39);
            this.buttonURLAdd.Name = "buttonURLAdd";
            this.buttonURLAdd.Size = new System.Drawing.Size(60, 26);
            this.buttonURLAdd.TabIndex = 9;
            this.buttonURLAdd.Text = "Add";
            this.buttonURLAdd.UseVisualStyleBackColor = true;
            this.buttonURLAdd.Click += new System.EventHandler(this.buttonURLAdd_Click);
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(6, 23);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(86, 13);
            this.label5.TabIndex = 8;
            this.label5.Text = "Additional URLs:";
            // 
            // listView1
            // 
            this.listView1.Columns.AddRange(new System.Windows.Forms.ColumnHeader[] {
            this.columnHeaderValue,
            this.columnHeaderType});
            this.listView1.HeaderStyle = System.Windows.Forms.ColumnHeaderStyle.Nonclickable;
            this.listView1.HideSelection = false;
            this.listView1.Location = new System.Drawing.Point(9, 39);
            this.listView1.Name = "listView1";
            this.listView1.ShowItemToolTips = true;
            this.listView1.Size = new System.Drawing.Size(332, 87);
            this.listView1.TabIndex = 7;
            this.listView1.UseCompatibleStateImageBehavior = false;
            this.listView1.View = System.Windows.Forms.View.Details;
            // 
            // columnHeaderValue
            // 
            this.columnHeaderValue.Text = "URL / pattern";
            this.columnHeaderValue.Width = 338;
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
            this.Name = "KeeFoxEntryUserControl";
            this.Size = new System.Drawing.Size(419, 402);
            this.Load += new System.EventHandler(this.KeeFoxEntryUserControl_Load);
            this.groupBox1.ResumeLayout(false);
            this.groupBox1.PerformLayout();
            this.groupBox3.ResumeLayout(false);
            this.groupBox3.PerformLayout();
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
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.ColumnHeader columnHeaderValue;
        private System.Windows.Forms.ColumnHeader columnHeaderType;
    }
}
