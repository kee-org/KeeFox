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

using System;
using System.Collections.Generic;
using System.Text;
using KeePassLib;

namespace KeePassRPC.DataExchangeModel
{
    public class AuthenticationResult
    {
       // private int _result;
        public int Result;// { get { return _result; } }
        //private string _name;
        public string Name;// { get { return _name; } }

        public AuthenticationResult() { }
        public AuthenticationResult(int res, string name)
        {
            Name = name;
            Result = res;
            //_name = name;
            //_result = res;
        }
    }

    public class Configuration
    {
		//bool allowUnencryptedMetaData; // doesn't affect encryption of passwords themselves
		//KPDatabaseList knownDatabases; // the MRU list (to expand this in v1+, maybe Firefox preferences can be used?)
		public string[] KnownDatabases;
		public bool AutoCommit; // whether KeePass should save the active database after every change

        public Configuration() {}
        public Configuration(string[] MRUList, bool autoCommit)
        {
            KnownDatabases = MRUList;
            AutoCommit = autoCommit;
        }
    }

    public enum LoginSearchType { LSTall, LSTnoForms, LSTnoRealms }
    public enum FormFieldType { FFTradio, FFTusername, FFTtext, FFTpassword, FFTselect, FFTcheckbox } // ..., HTML 5, etc.
    // FFTusername is special type because bultin FF supports with only username and password
    
    public class FormField
    {
		public string Name;
		public string DisplayName;
		public string Value;
		public FormFieldType @Type;
		public string Id;
		public int Page;

        public FormField() { }

        public FormField(string name,
        string displayName,
        string value,
        FormFieldType @type,
        string id,
        int page)
        {
            Name = name;
            DisplayName = displayName;
            Value = value;
            @Type = @type;
            Id = id;
            Page = page;
        }
    }
    
    public class Group
    {
		public string Title;
		public string UniqueID;
		public string IconImageData;
        public string Path;

        public Group[] ChildGroups;
        public Entry[] ChildEntries;
        public LightEntry[] ChildLightEntries;

        public Group () {}

        public Group (string title,
		string uniqueID,
		string iconImageData,
        string path)
        {
            Title = title;
            UniqueID = uniqueID;
            IconImageData = iconImageData;
            Path = path;
        }
    }
    
    public class Entry : LightEntry
    {
		public string[] URLs;
		public string FormActionURL;
		public string HTTPRealm;
		public string Title;
		public FormField[] FormFieldList;
		//bool exactMatch; // URLs match exactly *THIS MAY BE REMOVED IN THE NEXT VERSION* (should be up to consumer to decide what determines an exact match - it may differ between clients or vary based on specific use cases in the client)
		public string UniqueID;
		
		public bool AlwaysAutoFill;
		public bool NeverAutoFill;
		public bool AlwaysAutoSubmit;
		public bool NeverAutoSubmit;
		public int Priority; // "KeeFox priority" = 1 (1 = 30000 relevancy score, 2 = 29999 relevancy score)
		// long autoTypeWhen "KeeFox config: autoType after page 2" (after/before or > / <) (page # or # seconds or #ms)
		// bool autoTypeOnly "KeeFox config: only autoType" This is probably redundant considering feature request #19?

        public Group Parent;
		public string IconImageData;

        public Entry() { }

        public Entry(
            string[] urls,
            string formActionURL,
            string hTTPRealm,
            string title,
            FormField[] formFieldList,
            string uniqueID,
            bool alwaysAutoFill,
            bool neverAutoFill,
            bool alwaysAutoSubmit,
            bool neverAutoSubmit,
            int priority,
            Group parent,
            string iconImageData)
        {
            URLs = urls;
            FormActionURL = formActionURL;
            HTTPRealm = hTTPRealm;
            Title = title;
            FormFieldList = formFieldList;
            UniqueID = uniqueID;
            AlwaysAutoFill = alwaysAutoFill;
            NeverAutoFill = neverAutoFill;
            AlwaysAutoSubmit = alwaysAutoSubmit;
            NeverAutoSubmit = neverAutoSubmit;
            Priority = priority;
            Parent = parent;
            IconImageData = iconImageData;
        }
    }

    public class LightEntry
    {
        public string[] URLs;
        public string Title;
        public string UniqueID;
        public string UsernameValue;
        public string UsernameName;
        public string IconImageData;

        public LightEntry() { }

        public LightEntry(
            string[] urls,
            string title,
            string uniqueID,
            string iconImageData,
            string usernameName,
            string usernameValue)
        {
            URLs = urls;
            Title = title;
            UniqueID = uniqueID;
            IconImageData = iconImageData;
            UsernameName = usernameName;
            UsernameValue = usernameValue;
        }
    }

    public class Database
    {
        public string Name;
        public string FileName;
        public Group Root;
        public bool Active;

        public Database() { }

        public Database(string name,
        string fileName,
        Group root,
        bool active)
        {
            Name = name;
            Root = root;
            FileName = fileName;
            Active = active;
        }
    }

    public class IconCache
    {
        private static object iconCacheLock = new object();
        public static Dictionary<PwUuid, string> _icons = new Dictionary<PwUuid,string>();
       // public static Dictionary<PwUuid, string> Icons { get { } set { } }
        public static void AddIcon(PwUuid uuid, string base64representation)
        {
            lock (iconCacheLock) {
                if (!_icons.ContainsKey(uuid))
                    _icons.Add(uuid, base64representation);
            }
        }

        public static string GetIconEncoding(PwUuid uuid)
        {
            string base64representation = null;
            lock (iconCacheLock)
            {
                if (!_icons.TryGetValue(uuid, out base64representation))
                    return null;
                return base64representation;
            }
        }

    }

    public enum Signal
    {
        /// <summary>
        /// 
        /// </summary>
        PLEASE_AUTHENTICATE = 0,
        /// <summary>
        /// deprecated?
        /// </summary>
        JSCALLBACKS_SETUP = 1,
        /// <summary>
        /// deprecated?
        /// </summary>
        ICECALLBACKS_SETUP = 2,

        DATABASE_OPENING = 3,
        DATABASE_OPEN = 4,
        DATABASE_CLOSING = 5,
        DATABASE_CLOSED = 6,
        DATABASE_SAVING = 7,
        DATABASE_SAVED = 8,
        DATABASE_DELETING = 9,
        DATABASE_DELETED = 10,
        DATABASE_SELECTED = 11,
        EXITING = 12
    }    
}