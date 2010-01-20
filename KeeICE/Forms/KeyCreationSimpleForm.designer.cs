namespace KeeICE
{
	partial class KeyCreationSimpleForm
	{
		/// <summary>
		/// Erforderliche Designervariable.
		/// </summary>
		private System.ComponentModel.IContainer components = null;

		/// <summary>
		/// Verwendete Ressourcen bereinigen.
		/// </summary>
		/// <param name="disposing">True, wenn verwaltete Ressourcen gelöscht werden sollen; andernfalls False.</param>
		protected override void Dispose(bool disposing)
		{
			if(disposing && (components != null))
			{
				components.Dispose();
			}
			base.Dispose(disposing);
		}

		#region Vom Windows Form-Designer generierter Code

		/// <summary>
		/// Erforderliche Methode für die Designerunterstützung.
		/// Der Inhalt der Methode darf nicht mit dem Code-Editor geändert werden.
		/// </summary>
		private void InitializeComponent()
		{
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(KeyCreationSimpleForm));
            this.m_lblIntro = new System.Windows.Forms.Label();
            this.m_lblMultiInfo = new System.Windows.Forms.Label();
            this.m_tbPassword = new System.Windows.Forms.TextBox();
            this.m_lblRepeatPassword = new System.Windows.Forms.Label();
            this.m_tbRepeatPassword = new System.Windows.Forms.TextBox();
            this.m_lblKeyFileInfo = new System.Windows.Forms.Label();
            this.m_btnCancel = new System.Windows.Forms.Button();
            this.m_btnCreate = new System.Windows.Forms.Button();
            this.m_ttRect = new System.Windows.Forms.ToolTip(this.components);
            this.m_cbHidePassword = new System.Windows.Forms.CheckBox();
            this.m_lblSeparator = new System.Windows.Forms.Label();
            this.m_pbPasswordQuality = new KeePass.UI.QualityProgressBar();
            this.m_lblEstimatedQuality = new System.Windows.Forms.Label();
            this.m_lblQualityBits = new System.Windows.Forms.Label();
            this.m_bannerImage = new System.Windows.Forms.PictureBox();
            this.dbNameTextBox = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.button1 = new System.Windows.Forms.Button();
            ((System.ComponentModel.ISupportInitialize)(this.m_bannerImage)).BeginInit();
            this.SuspendLayout();
            // 
            // m_lblIntro
            // 
            this.m_lblIntro.Location = new System.Drawing.Point(9, 72);
            this.m_lblIntro.Name = "m_lblIntro";
            this.m_lblIntro.Size = new System.Drawing.Size(498, 13);
            this.m_lblIntro.TabIndex = 19;
            this.m_lblIntro.Text = "Specify a master password, which will be used to encrypt the database.";
            // 
            // m_lblMultiInfo
            // 
            this.m_lblMultiInfo.Location = new System.Drawing.Point(9, 93);
            this.m_lblMultiInfo.Name = "m_lblMultiInfo";
            this.m_lblMultiInfo.Size = new System.Drawing.Size(498, 42);
            this.m_lblMultiInfo.TabIndex = 20;
            this.m_lblMultiInfo.Text = "If you forget your password, you will not be able to open the database. There are" +
                " NO ways to recover your password.";
            // 
            // m_tbPassword
            // 
            this.m_tbPassword.Location = new System.Drawing.Point(150, 145);
            this.m_tbPassword.Name = "m_tbPassword";
            this.m_tbPassword.Size = new System.Drawing.Size(316, 20);
            this.m_tbPassword.TabIndex = 0;
            this.m_tbPassword.UseSystemPasswordChar = true;
            // 
            // m_lblRepeatPassword
            // 
            this.m_lblRepeatPassword.AutoSize = true;
            this.m_lblRepeatPassword.Location = new System.Drawing.Point(28, 174);
            this.m_lblRepeatPassword.Name = "m_lblRepeatPassword";
            this.m_lblRepeatPassword.Size = new System.Drawing.Size(93, 13);
            this.m_lblRepeatPassword.TabIndex = 2;
            this.m_lblRepeatPassword.Text = "Repeat password:";
            // 
            // m_tbRepeatPassword
            // 
            this.m_tbRepeatPassword.Location = new System.Drawing.Point(150, 171);
            this.m_tbRepeatPassword.Name = "m_tbRepeatPassword";
            this.m_tbRepeatPassword.Size = new System.Drawing.Size(316, 20);
            this.m_tbRepeatPassword.TabIndex = 3;
            this.m_tbRepeatPassword.UseSystemPasswordChar = true;
            // 
            // m_lblKeyFileInfo
            // 
            this.m_lblKeyFileInfo.Location = new System.Drawing.Point(28, 263);
            this.m_lblKeyFileInfo.Name = "m_lblKeyFileInfo";
            this.m_lblKeyFileInfo.Size = new System.Drawing.Size(479, 48);
            this.m_lblKeyFileInfo.TabIndex = 11;
            this.m_lblKeyFileInfo.Text = resources.GetString("m_lblKeyFileInfo.Text");
            // 
            // m_btnCancel
            // 
            this.m_btnCancel.DialogResult = System.Windows.Forms.DialogResult.Cancel;
            this.m_btnCancel.Location = new System.Drawing.Point(432, 325);
            this.m_btnCancel.Name = "m_btnCancel";
            this.m_btnCancel.Size = new System.Drawing.Size(75, 23);
            this.m_btnCancel.TabIndex = 18;
            this.m_btnCancel.Text = "&Cancel";
            this.m_btnCancel.TextImageRelation = System.Windows.Forms.TextImageRelation.ImageBeforeText;
            this.m_btnCancel.UseVisualStyleBackColor = true;
            this.m_btnCancel.Click += new System.EventHandler(this.OnBtnCancel);
            // 
            // m_btnCreate
            // 
            this.m_btnCreate.DialogResult = System.Windows.Forms.DialogResult.OK;
            this.m_btnCreate.Location = new System.Drawing.Point(351, 324);
            this.m_btnCreate.Name = "m_btnCreate";
            this.m_btnCreate.Size = new System.Drawing.Size(75, 23);
            this.m_btnCreate.TabIndex = 17;
            this.m_btnCreate.Text = "&OK";
            this.m_btnCreate.TextImageRelation = System.Windows.Forms.TextImageRelation.ImageBeforeText;
            this.m_btnCreate.UseVisualStyleBackColor = true;
            this.m_btnCreate.Click += new System.EventHandler(this.OnBtnOK);
            // 
            // m_ttRect
            // 
            this.m_ttRect.AutomaticDelay = 250;
            this.m_ttRect.AutoPopDelay = 5000;
            this.m_ttRect.InitialDelay = 250;
            this.m_ttRect.ReshowDelay = 50;
            // 
            // m_cbHidePassword
            // 
            this.m_cbHidePassword.Appearance = System.Windows.Forms.Appearance.Button;
            this.m_cbHidePassword.Location = new System.Drawing.Point(475, 143);
            this.m_cbHidePassword.Name = "m_cbHidePassword";
            this.m_cbHidePassword.Size = new System.Drawing.Size(32, 23);
            this.m_cbHidePassword.TabIndex = 1;
            this.m_cbHidePassword.UseVisualStyleBackColor = true;
            this.m_cbHidePassword.CheckedChanged += new System.EventHandler(this.OnCheckedHidePassword);
            // 
            // m_lblSeparator
            // 
            this.m_lblSeparator.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.m_lblSeparator.Location = new System.Drawing.Point(0, 311);
            this.m_lblSeparator.Name = "m_lblSeparator";
            this.m_lblSeparator.Size = new System.Drawing.Size(519, 2);
            this.m_lblSeparator.TabIndex = 15;
            // 
            // m_pbPasswordQuality
            // 
            this.m_pbPasswordQuality.Location = new System.Drawing.Point(150, 197);
            this.m_pbPasswordQuality.Maximum = 100;
            this.m_pbPasswordQuality.Minimum = 0;
            this.m_pbPasswordQuality.Name = "m_pbPasswordQuality";
            this.m_pbPasswordQuality.Size = new System.Drawing.Size(260, 14);
            this.m_pbPasswordQuality.Style = System.Windows.Forms.ProgressBarStyle.Continuous;
            this.m_pbPasswordQuality.TabIndex = 5;
            this.m_pbPasswordQuality.TabStop = false;
            this.m_pbPasswordQuality.Value = 0;
            // 
            // m_lblEstimatedQuality
            // 
            this.m_lblEstimatedQuality.AutoSize = true;
            this.m_lblEstimatedQuality.Location = new System.Drawing.Point(28, 198);
            this.m_lblEstimatedQuality.Name = "m_lblEstimatedQuality";
            this.m_lblEstimatedQuality.Size = new System.Drawing.Size(89, 13);
            this.m_lblEstimatedQuality.TabIndex = 4;
            this.m_lblEstimatedQuality.Text = "Estimated quality:";
            // 
            // m_lblQualityBits
            // 
            this.m_lblQualityBits.Location = new System.Drawing.Point(413, 197);
            this.m_lblQualityBits.Name = "m_lblQualityBits";
            this.m_lblQualityBits.Size = new System.Drawing.Size(53, 13);
            this.m_lblQualityBits.TabIndex = 6;
            this.m_lblQualityBits.Text = "9999 bits";
            this.m_lblQualityBits.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // m_bannerImage
            // 
            this.m_bannerImage.Dock = System.Windows.Forms.DockStyle.Top;
            this.m_bannerImage.Location = new System.Drawing.Point(0, 0);
            this.m_bannerImage.Name = "m_bannerImage";
            this.m_bannerImage.Size = new System.Drawing.Size(519, 60);
            this.m_bannerImage.TabIndex = 15;
            this.m_bannerImage.TabStop = false;
            // 
            // dbNameTextBox
            // 
            this.dbNameTextBox.Location = new System.Drawing.Point(150, 225);
            this.dbNameTextBox.Name = "dbNameTextBox";
            this.dbNameTextBox.Size = new System.Drawing.Size(260, 20);
            this.dbNameTextBox.TabIndex = 22;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(28, 148);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(90, 13);
            this.label1.TabIndex = 23;
            this.label1.Text = "Master password:";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(31, 228);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(85, 13);
            this.label2.TabIndex = 24;
            this.label2.Text = "Database name:";
            // 
            // button1
            // 
            this.button1.DialogResult = System.Windows.Forms.DialogResult.No;
            this.button1.Location = new System.Drawing.Point(12, 325);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(214, 23);
            this.button1.TabIndex = 25;
            this.button1.Text = "Switch to advanced key creation mode";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // KeyCreationSimpleForm
            // 
            this.AcceptButton = this.m_btnCreate;
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.CancelButton = this.m_btnCancel;
            this.ClientSize = new System.Drawing.Size(519, 354);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.dbNameTextBox);
            this.Controls.Add(this.m_lblQualityBits);
            this.Controls.Add(this.m_lblEstimatedQuality);
            this.Controls.Add(this.m_pbPasswordQuality);
            this.Controls.Add(this.m_lblSeparator);
            this.Controls.Add(this.m_lblKeyFileInfo);
            this.Controls.Add(this.m_cbHidePassword);
            this.Controls.Add(this.m_bannerImage);
            this.Controls.Add(this.m_btnCancel);
            this.Controls.Add(this.m_btnCreate);
            this.Controls.Add(this.m_tbRepeatPassword);
            this.Controls.Add(this.m_lblRepeatPassword);
            this.Controls.Add(this.m_tbPassword);
            this.Controls.Add(this.m_lblMultiInfo);
            this.Controls.Add(this.m_lblIntro);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "KeyCreationSimpleForm";
            this.ShowInTaskbar = false;
            this.SizeGripStyle = System.Windows.Forms.SizeGripStyle.Hide;
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "<>";
            this.Load += new System.EventHandler(this.OnFormLoad);
            this.FormClosed += new System.Windows.Forms.FormClosedEventHandler(this.OnFormClosed);
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.OnFormClosing);
            ((System.ComponentModel.ISupportInitialize)(this.m_bannerImage)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

		}

		#endregion

		private System.Windows.Forms.Label m_lblIntro;
        private System.Windows.Forms.Label m_lblMultiInfo;
		private System.Windows.Forms.TextBox m_tbPassword;
		private System.Windows.Forms.Label m_lblRepeatPassword;
        private System.Windows.Forms.TextBox m_tbRepeatPassword;
		private System.Windows.Forms.Button m_btnCreate;
		private System.Windows.Forms.Button m_btnCancel;
		private System.Windows.Forms.PictureBox m_bannerImage;
        private System.Windows.Forms.CheckBox m_cbHidePassword;
		private System.Windows.Forms.Label m_lblKeyFileInfo;
        private System.Windows.Forms.ToolTip m_ttRect;
		private System.Windows.Forms.Label m_lblSeparator;
		private KeePass.UI.QualityProgressBar m_pbPasswordQuality;
		private System.Windows.Forms.Label m_lblEstimatedQuality;
        private System.Windows.Forms.Label m_lblQualityBits;
        private System.Windows.Forms.TextBox dbNameTextBox;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Button button1;
	}
}