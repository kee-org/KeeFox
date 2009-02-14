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

#include <Ice/Identity.ice>

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
    
    struct KPEntry
    {
		string hostName;
		string formURL;
		string HTTPRealm;
		string title;
		KPFormFieldList formFieldList;
		bool default; // for this hostname
		bool exactMatch; // URLs match exactly
		string uniqueID;
    };
    
    sequence<KPEntry> KPEntryList;
    
    exception KeeICEException
    {
        string reason;
    };
    
    interface KPGroup
    {
        void Touch(bool isModified);
    };
    
    
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
        void AddLogin(KPEntry login) throws KeeICEException;
        void ModifyLogin(KPEntry oldLogin, KPEntry newLogin) throws KeeICEException;
        int getAllLogins(out KPEntryList logins) throws KeeICEException;
        int findLogins(string hostname, string actionURL, string httpRealm, loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KPEntryList logins) throws KeeICEException;
        int countLogins(string hostname, string actionURL, string httpRealm, loginSearchType lst, bool requireFullURLMatches) throws KeeICEException;
        //bool getDirty();
        void addClient(Ice::Identity ident);
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
