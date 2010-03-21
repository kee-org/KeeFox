#region License, Terms and Conditions
//
// Jayrock - A JSON-RPC implementation for the Microsoft .NET Framework
// Written by Atif Aziz (www.raboof.com)
// Copyright (c) Atif Aziz. All rights reserved.
//
// This library is free software; you can redistribute it and/or modify it under
// the terms of the GNU Lesser General Public License as published by the Free
// Software Foundation; either version 2.1 of the License, or (at your option)
// any later version.
//
// This library is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
// details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this library; if not, write to the Free Software Foundation, Inc.,
// 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
//
#endregion

namespace Jayrock.Json
{
    #region Imports

    using NUnit.Framework;

    #endregion

    [ TestFixture ]
    public class TestJsonString
    {
        [ Test ]
        public void NullInputYieldsQuotedEmpty()
        {
            Assert.AreEqual("\"\"", JsonString.Enquote(null));
        }

        [ Test ]
        public void EmptyInputYieldsQuotedEmpty()
        {
            Assert.AreEqual("\"\"", JsonString.Enquote(string.Empty));
        }

        [ Test ]
        public void BackslasheEscaping()
        {
            Assert.AreEqual(@"""c:\\foo\\bar""", JsonString.Enquote(@"c:\foo\bar"));
        }

        [ Test ]
        public void QuoteEscaping()
        {
            Assert.AreEqual("\"foo \\\"quoted\\\" bar\"", JsonString.Enquote("foo \"quoted\" bar"));
        }

        [ Test ]
        public void GreaterThanEscaping()
        {
            Assert.AreEqual("\"foo <b>bold<\\/b> bar\"", JsonString.Enquote("foo <b>bold</b> bar"));
        }

        [ Test ]
        public void NonPrintablesAsHex()
        {
            Assert.AreEqual("\"\\u0000\"", JsonString.Enquote(((char) 00).ToString()));
            Assert.AreEqual("\"\\u0001\"", JsonString.Enquote(((char) 01).ToString()));
            Assert.AreEqual("\"\\u0002\"", JsonString.Enquote(((char) 02).ToString()));
            Assert.AreEqual("\"\\u0003\"", JsonString.Enquote(((char) 03).ToString()));
            Assert.AreEqual("\"\\u0004\"", JsonString.Enquote(((char) 04).ToString()));
            Assert.AreEqual("\"\\u0005\"", JsonString.Enquote(((char) 05).ToString()));
            Assert.AreEqual("\"\\u0006\"", JsonString.Enquote(((char) 06).ToString()));
            Assert.AreEqual("\"\\u0007\"", JsonString.Enquote(((char) 07).ToString()));
            //  8...10
            Assert.AreEqual("\"\\u000b\"", JsonString.Enquote(((char) 11).ToString()));
            // 12...13
            Assert.AreEqual("\"\\u000e\"", JsonString.Enquote(((char) 14).ToString()));
            Assert.AreEqual("\"\\u000f\"", JsonString.Enquote(((char) 15).ToString()));
            Assert.AreEqual("\"\\u0010\"", JsonString.Enquote(((char) 16).ToString()));
            Assert.AreEqual("\"\\u0011\"", JsonString.Enquote(((char) 17).ToString()));
            Assert.AreEqual("\"\\u0012\"", JsonString.Enquote(((char) 18).ToString()));
            Assert.AreEqual("\"\\u0013\"", JsonString.Enquote(((char) 19).ToString()));
            Assert.AreEqual("\"\\u0014\"", JsonString.Enquote(((char) 20).ToString()));
            Assert.AreEqual("\"\\u0015\"", JsonString.Enquote(((char) 21).ToString()));
            Assert.AreEqual("\"\\u0016\"", JsonString.Enquote(((char) 22).ToString()));
            Assert.AreEqual("\"\\u0017\"", JsonString.Enquote(((char) 23).ToString()));
            Assert.AreEqual("\"\\u0018\"", JsonString.Enquote(((char) 24).ToString()));
            Assert.AreEqual("\"\\u0019\"", JsonString.Enquote(((char) 25).ToString()));
            Assert.AreEqual("\"\\u001a\"", JsonString.Enquote(((char) 26).ToString()));
            Assert.AreEqual("\"\\u001b\"", JsonString.Enquote(((char) 27).ToString()));
            Assert.AreEqual("\"\\u001c\"", JsonString.Enquote(((char) 28).ToString()));
            Assert.AreEqual("\"\\u001d\"", JsonString.Enquote(((char) 29).ToString()));
            Assert.AreEqual("\"\\u001e\"", JsonString.Enquote(((char) 30).ToString()));
            Assert.AreEqual("\"\\u001f\"", JsonString.Enquote(((char) 31).ToString()));
        }

        [ Test ]
        public void BackspaceEscaping()
        {
            Assert.AreEqual("\"\\b\"", JsonString.Enquote(((char) 08).ToString()));
        }

        [ Test ]
        public void TabEscaping()
        {
            Assert.AreEqual("\"\\t\"", JsonString.Enquote(((char) 09).ToString()));
        }

        [ Test ]
        public void LineFeedEscaping()
        {
            Assert.AreEqual("\"\\n\"", JsonString.Enquote(((char) 10).ToString()));
        }

        [ Test ]
        public void FormFeedEscaping()
        {
            Assert.AreEqual("\"\\f\"", JsonString.Enquote(((char) 12).ToString()));
        }

        [ Test ]
        public void CarriageReturnEscaping()
        {
            Assert.AreEqual("\"\\r\"", JsonString.Enquote(((char) 13).ToString()));
        }

        [ Test ]
        public void NullStringBuilderCreatesOne()
        {
            Assert.IsNotNull(JsonString.Enquote(string.Empty, null));
        }

        [ Test ]
        public void NullStringWithNullStringBuilderYieldsQuotedEmpty()
        {
            Assert.AreEqual("\"\"", JsonString.Enquote(null, null).ToString());
        }
    }
}