/*
  KeePassRPC - Uses JSON-RPC to provide RPC facilities to KeePass.
  Example usage includes the KeeFox firefox extension.
  
  Copyright 2010-2015 Chris Tomlinson <keefox@christomlinson.name>

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

using DomainPublicSuffix;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeePassRPC
{
    class URLSummary
    {
        public string HostnameAndPort;
        public DomainName Domain;

        public URLSummary(string hostnameAndPort, DomainName domain)
        {
            HostnameAndPort = hostnameAndPort;
            Domain = domain;
        }
    }
}
