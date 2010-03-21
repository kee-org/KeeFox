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

namespace Jayrock.Json.Conversion
{
    #region Imports

    using System;
    using System.Collections;
    using System.Collections.Specialized;
    using System.Threading;
    using Jayrock.Json.Conversion;
    using Jayrock.Json.Conversion.Converters;
    using NUnit.Framework;

    #endregion

    [ TestFixture ]
    public class TestImportContext
    {
        [ Test ]
        public void StockImporters()
        {
            AssertInStock(typeof(ByteImporter), typeof(byte));
            AssertInStock(typeof(Int16Importer), typeof(short));
            AssertInStock(typeof(Int32Importer), typeof(int));
            AssertInStock(typeof(Int64Importer), typeof(long));
            AssertInStock(typeof(SingleImporter), typeof(float));
            AssertInStock(typeof(DoubleImporter), typeof(double));
            AssertInStock(typeof(DecimalImporter), typeof(decimal));
            AssertInStock(typeof(DateTimeImporter), typeof(DateTime));
            AssertInStock(typeof(StringImporter), typeof(string));
            AssertInStock(typeof(BooleanImporter), typeof(bool));
            AssertInStock(typeof(AnyImporter), typeof(object));
            AssertInStock(typeof(ArrayImporter), typeof(object[]));
            AssertInStock(typeof(ByteArrayImporter), typeof(byte[]));
            AssertInStock(typeof(EnumImporter), typeof(System.Globalization.UnicodeCategory));
            AssertInStock(typeof(ImportAwareImporter), typeof(JsonObject));
            AssertInStock(typeof(ImportAwareImporter), typeof(IDictionary));
            AssertInStock(typeof(ImportAwareImporter), typeof(JsonArray));
            AssertInStock(typeof(ImportAwareImporter), typeof(IList));
            AssertInStock(typeof(ImportAwareImporter), typeof(ImportableThing));
            AssertInStock(typeof(GuidImporter), typeof(Guid));
            AssertInStock(typeof(NameValueCollectionImporter), typeof(NameValueCollection));
            AssertInStock(typeof(ComponentImporter), typeof(ValueThing));
            AssertInStock(typeof(UriImporter), typeof(Uri));
        }

        [ Test ]
        public void HasItems()
        {
            Assert.IsNotNull((new ImportContext()).Items);
        }

        [ Test ]
        public void Registration()
        {
            ImportContext context = new ImportContext();
            ThingImporter importer = new ThingImporter();
            context.Register(importer);
            Assert.AreSame(importer, context.FindImporter(typeof(Thing)));
        }

        [ Test ]
        public void RegistrationIsPerContext()
        {
            ImportContext context = new ImportContext();
            ThingImporter exporter = new ThingImporter();
            context.Register(exporter);
            context = new ImportContext();
            Assert.AreNotSame(exporter, context.FindImporter(typeof(Thing)));
        }

        private static void AssertInStock(Type expected, Type type)
        {
            ImportContext context = new ImportContext();
            IImporter importer = context.FindImporter(type);
            Assert.IsNotNull(importer, "No importer found for {0}", type.FullName);
            Assert.IsInstanceOfType(expected, importer, type.FullName);
        }
        
        private sealed class ImportableThing : IJsonImportable
        {
            public void Import(ImportContext context, JsonReader reader)
            {
                throw new NotImplementedException();
            }
        }

        private sealed class Thing {}

        private sealed class ThingImporter : IImporter
        {
            public Type OutputType
            {
                get { return typeof(Thing); }
            }

            public object Import(ImportContext context, JsonReader reader)
            {
                throw new NotImplementedException();
            }
        }
    
        public struct ValueThing
        {
            public int Field1;
            public int Field2;
        }
    }
}
