/*
  KeeICE - Uses ICE to provide IPC facilities to KeePass. (http://www.zeroc.com)
  Example usage includes the KeeFox firefox extension.
  
  Copyright 2008 Chris Tomlinson <keefox@christomlinson.name>

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

#ifndef SIMPLE_ICE
#define SIMPLE_ICE

#include <IceE/Identity.ice>

module KeeICE {
module KFlib {
    
    enum loginSearchType { LSTall, LSTnoForms, LSTnoRealms };
    enum formFieldType { FFTradio, FFTusername, FFTtext, FFTpassword, FFTselect, FFTcheckbox }; // ..., HTML 5, etc.
    // FFTusername is special type because bultin FF supports with only username and password
    
    struct KPFormField
    {
		string name;
		string displayName;
		string value;
		formFieldType type;
		//compulsory, multiple selections,useful javascript functions?
    };
    
    sequence<KPFormField> KPFormFieldList;
    
    struct KPGroup
    {
		string title;
		string uniqueID;
    };
    
    sequence<KPGroup> KPGroupList;
    
    struct KPEntry
    {
		string URL;
		string formActionURL;
		string HTTPRealm;
		string title;
		KPFormFieldList formFieldList;
		bool default; // for this hostname
		bool exactMatch; // URLs match exactly *THIS MAY BE REMOVED IN THE NEXT VERSION* (should be up to consumer to decide what determines an exact match - it may differ between KeeICE clients or vary based on specific use cases in the client)
		string uniqueID;
    };
    
    sequence<KPEntry> KPEntryList;
    
    exception KeeICEException
    {
        string reason;
    };
    
    //interface KPGroup
    //{
    //    void Touch(bool isModified);
    //};
    
    
    //interface KPDatabase
    //{
    //    string getName();
        //KPGroup getRootGroup();
        //bool getDirty();
    //};
    
    interface KP
    {
        //KPDatabase getDatabase();
        bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result); 
        string getDatabaseName();
        string getDatabaseFileName();
        void changeDatabase(string fileName, bool closeCurrent);
        KPEntry AddLogin(KPEntry login, string parentUUID) throws KeeICEException;
        void ModifyLogin(KPEntry oldLogin, KPEntry newLogin) throws KeeICEException;
        int getAllLogins(out KPEntryList logins) throws KeeICEException;
        int findLogins(string hostname, string actionURL, string httpRealm, loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KPEntryList logins) throws KeeICEException;
        int countLogins(string hostname, string actionURL, string httpRealm, loginSearchType lst, bool requireFullURLMatches) throws KeeICEException;
        //bool getDirty();
        void addClient(Ice::Identity ident);
        
        int findGroups(string name, string uuid, out KPGroupList groups); // if both null, returns root group
        
        KPGroup getRoot();
        KPGroup getParent(string uuid);
		KPGroupList getChildGroups(string uuid);
		KPEntryList getChildEntries(string uuid);
		KPGroup addGroup(string name, string parentUuid); // returns the new group
		
		bool removeGroup(string uuid); //host.Database.RootGroup.Groups.Remove();
		bool removeEntry(string uuid); //host.Database.RootGroup.Groups.Remove();

		void LaunchGroupEditor(string uuid);
		void LaunchLoginEditor(string uuid);

		//KPGroup getParentOfGroup(KPGroup group);
		//KPGroupList getChildGroups(KPGroup group);
		//KPEntryList getChildEntries(KPGroup group);
		//KPGroup addGroup(string name, KPGroup parentGroup); 
		
		//KPGroup getParentOfEntry(KPEntry entry);
    };
    
    struct KPDatabase
    {
		string DBname;
		string fileName;
		bool default; // default database?
		string rootGroupUID; // we only integrate entries in this group and below
		bool useILM; // use improved login manager
		
	};
	
    sequence<KPDatabase> KPDatabaseList;
    
    struct KFConfiguration
    {
		bool allowUnencryptedMetaData; // doesn't affect encryption of passwords themselves
		KPDatabaseList knownDatabases;
		
    
    };
    
    interface CallbackReceiver
	{
		void callback(int num);
	};

	//interface CallbackSender
	//{
	//	void addClient(Ice::Identity ident);
	//};

};
};

#endif
