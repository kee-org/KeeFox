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
            this.checkBoxAlwaysAutoFill = new System.Windows.Forms.CheckBox();
            this.SuspendLayout();
            // 
            // checkBoxAlwaysAutoFill
            // 
            this.checkBoxAlwaysAutoFill.AutoSize = true;
            this.checkBoxAlwaysAutoFill.Location = new System.Drawing.Point(24, 209);
            this.checkBoxAlwaysAutoFill.Name = "checkBoxAlwaysAutoFill";
            this.checkBoxAlwaysAutoFill.Size = new System.Drawing.Size(95, 17);
            this.checkBoxAlwaysAutoFill.TabIndex = 0;
            this.checkBoxAlwaysAutoFill.Text = "Always auto-fill";
            this.checkBoxAlwaysAutoFill.UseVisualStyleBackColor = true;
            this.checkBoxAlwaysAutoFill.CheckedChanged += new System.EventHandler(this.checkBoxAlwaysAutoFill_CheckedChanged);
            // 
            // KeeFoxEntryUserControl
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.SystemColors.Window;
            this.Controls.Add(this.checkBoxAlwaysAutoFill);
            this.Name = "KeeFoxEntryUserControl";
            this.Size = new System.Drawing.Size(419, 442);
            this.Load += new System.EventHandler(this.KeeFoxEntryUserControl_Load);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.CheckBox checkBoxAlwaysAutoFill;
    }
}
