/*
  KeeICE - Uses ICE to provide IPC facilities to KeePass. (http://www.zeroc.com)
  Example usage includes the KeeFox firefox extension.
  
  Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>

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

using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;

// General assembly properties
[assembly: AssemblyTitle("KeeICE")]
[assembly: AssemblyDescription("Provides Inter Process Communication (IPC) facilities to KeePass. Used by the KeeFox Firefox add-on.")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("Chris Tomlinson")]
[assembly: AssemblyProduct("KeePass Plugin")]
[assembly: AssemblyCopyright("Copyright © 2009 Chris Tomlinson")]
[assembly: AssemblyTrademark("")]
[assembly: AssemblyCulture("")]

// COM settings
[assembly: ComVisible(false)]

// Assembly GUID
[assembly: Guid("D36DD08D-2080-448a-8509-BF3D8D95B106")]

// Assembly version information
[assembly: AssemblyVersion("2.0.7.*")]
[assembly: AssemblyFileVersion("0.5.0.0")]
