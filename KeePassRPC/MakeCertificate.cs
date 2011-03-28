/*
  KeePassRPC - Uses JSON-RPC to provide RPC facilities to KeePass.
  Example usage includes the KeeFox firefox extension.
  
  Copyright 2010 Chris Tomlinson <keefox@christomlinson.name>

  This program is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 2 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
//
// From the Mono project (tools section), used under GPL license
// Original copyright information below.
//
// makecert.cs: makecert clone tool
//
// Author:
//	Sebastien Pouliot <sebastien@ximian.com>
//
// (C) 2003 Motus Technologies Inc. (http://www.motus.com)
// Copyright (C) 2004-2005 Novell, Inc (http://www.novell.com)
//

using System;
using System.Collections;
using System.Security.Cryptography;
using Mono.Security.X509;
using System.IO;
using KeePassRPC;

namespace Mono.Tools
{
    public class MakeCertKPRPC
    {
        /// <summary>
        /// Generates an X509 certificate using the Mono.Security assembly.
        /// Potentially could prise out the relevant classes from the Mono
        /// source code in order to reduce plgx size and complexity... one day
        /// </summary>
        /// <param name="subject">The subject.</param>
        /// <param name="issuer">The issuer.</param>
        /// <returns></returns>
        public static byte[] Generate(string subject, string issuer, KeePassRPCExt KeePassRPCPlugin)
        {
            byte[] sn = Guid.NewGuid().ToByteArray();
            DateTime notBefore = DateTime.Now;
            DateTime notAfter = new DateTime(643445675990000000); // 12/31/2039 23:59:59Z
            subject = "CN=" + subject;
            issuer = "CN=" + issuer;
            RSA subjectKey = (RSA)RSA.Create();
            RSA issuerKey = (RSA)RSA.Create();

            string hashName = "SHA1";

            CspParameters subjectParams = new CspParameters();
            CspParameters issuerParams = new CspParameters();

            // serial number MUST be positive
            if ((sn[0] & 0x80) == 0x80)
                sn[0] -= 0x80;

            //issuer = subject;
            //RSA issuerKey = subjectKey;

            if (subject == null)
                throw new Exception("Missing Subject Name");

            X509CertificateBuilder cb = new X509CertificateBuilder(3);
            cb.SerialNumber = sn;
            cb.IssuerName = issuer;
            cb.NotBefore = notBefore;
            cb.NotAfter = notAfter;
            cb.SubjectName = subject;
            cb.SubjectPublicKey = subjectKey;
            cb.Hash = hashName;
            byte[] rawcert = cb.Sign(issuerKey);

            PKCS12 p12 = new PKCS12();

            ArrayList list = new ArrayList();
            // we use a fixed array to avoid endianess issues 
            // (in case some tools requires the ID to be 1).
            list.Add(new byte[4] { 1, 0, 0, 0 });
            Hashtable attributes = new Hashtable(1);
            attributes.Add(PKCS9.localKeyId, list);

            p12.AddCertificate(new X509Certificate(rawcert), attributes);
            p12.AddPkcs8ShroudedKeyBag(subjectKey, attributes);

            if (Type.GetType("Mono.Runtime") != null)
            {
                string fileName = Path.Combine(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "KeePassRPC"), "cert.p12");
                if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine(fileName);
                try
                {
                    p12.SaveToFile(fileName);
                }
                catch (Exception)
                {
                    if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine("Could not write to " + fileName + " security between KPRPC and clients may not be established.");
                }
            }

            return p12.GetBytes();
        }
    }
}