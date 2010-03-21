#region License, Terms and Conditions
//
// Jayrock - JSON and JSON-RPC for Microsoft .NET Framework and Mono
// Written by Atif Aziz (www.raboof.com)
// Copyright (c) 2005 Atif Aziz. All rights reserved.
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
    using System.ComponentModel;
    using System.Diagnostics;
    using System.Globalization;

    #endregion

    [ Serializable ]
    public enum NamingConvention
    {
        None,
        Camel,      // worldWideWeb
        Pascal,     // WorldWideWeb
        Upper,      // WORLDWIDEWEB
        Lower       // worldwideweb
    }

    [ Serializable ]
    [ AttributeUsage(AttributeTargets.Property | AttributeTargets.Field) ]
    public sealed class JsonMemberNamingConventionAttribute : Attribute, IPropertyDescriptorCustomization
    {
        private NamingConvention _convention;

        public JsonMemberNamingConventionAttribute() {}

        public JsonMemberNamingConventionAttribute(NamingConvention convention)
        {
            _convention = convention;
        }

        public NamingConvention Convention
        {
            get { return _convention; }
            set { _convention = value; }
        }

        void IPropertyDescriptorCustomization.Apply(PropertyDescriptor property)
        {
            if (property == null) 
                throw new ArgumentNullException("property");

            string name = property.Name;

            switch (Convention)
            {
                case NamingConvention.Pascal:
                    SetName(property, char.ToUpper(name[0], CultureInfo.InvariantCulture) + name.Substring(1)); break;
                case NamingConvention.Camel:
                    SetName(property, char.ToLower(name[0], CultureInfo.InvariantCulture) + name.Substring(1)); break;
                case NamingConvention.Upper:
                    SetName(property, name.ToUpper(CultureInfo.InvariantCulture)); break;
                case NamingConvention.Lower:
                    SetName(property, name.ToLower(CultureInfo.InvariantCulture)); break;
            }
        }

        private static void SetName(PropertyDescriptor property, string name)
        {
            Debug.Assert(property != null);
            Debug.Assert(name != null);
            Debug.Assert(name.Length > 0);

            IPropertyCustomization customization = (IPropertyCustomization) property;
            customization.SetName(name);
        }
    }
}