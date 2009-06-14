// **********************************************************************
//
// Copyright (c) 2003-2008 ZeroC, Inc. All rights reserved.
//
// This copy of Ice is licensed to you under the terms described in the
// ICE_LICENSE file included in this distribution.
//
// **********************************************************************

// Ice version 3.3.0
// Generated from file `KeeICE.ice'

#if __MonoCS__

using _System = System;
using _Microsoft = Microsoft;
#else

using _System = global::System;
using _Microsoft = global::Microsoft;
#endif

namespace KeeICE
{
    namespace KFlib
    {
        public enum loginSearchType
        {
            LSTall,
            LSTnoForms,
            LSTnoRealms
        }

        public enum formFieldType
        {
            FFTradio,
            FFTusername,
            FFTtext,
            FFTpassword,
            FFTselect,
            FFTcheckbox
        }

        public class KPFormField : _System.ICloneable
        {
            #region Slice data members

            public string name;

            public string displayName;

            public string value;

            public KeeICE.KFlib.formFieldType type;

            public string id;

            #endregion

            #region Constructors

            public KPFormField()
            {
            }

            public KPFormField(string name, string displayName, string value, KeeICE.KFlib.formFieldType type, string id)
            {
                this.name = name;
                this.displayName = displayName;
                this.value = value;
                this.type = type;
                this.id = id;
            }

            #endregion

            #region ICloneable members

            public object Clone()
            {
                return MemberwiseClone();
            }

            #endregion

            #region Object members

            public override int GetHashCode()
            {
                int h__ = 0;
                if(name != null)
                {
                    h__ = 5 * h__ + name.GetHashCode();
                }
                if(displayName != null)
                {
                    h__ = 5 * h__ + displayName.GetHashCode();
                }
                if(value != null)
                {
                    h__ = 5 * h__ + value.GetHashCode();
                }
                h__ = 5 * h__ + type.GetHashCode();
                if(id != null)
                {
                    h__ = 5 * h__ + id.GetHashCode();
                }
                return h__;
            }

            public override bool Equals(object other__)
            {
                if(object.ReferenceEquals(this, other__))
                {
                    return true;
                }
                if(other__ == null)
                {
                    return false;
                }
                if(GetType() != other__.GetType())
                {
                    return false;
                }
                KPFormField o__ = (KPFormField)other__;
                if(name == null)
                {
                    if(o__.name != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!name.Equals(o__.name))
                    {
                        return false;
                    }
                }
                if(displayName == null)
                {
                    if(o__.displayName != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!displayName.Equals(o__.displayName))
                    {
                        return false;
                    }
                }
                if(value == null)
                {
                    if(o__.value != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!value.Equals(o__.value))
                    {
                        return false;
                    }
                }
                if(!type.Equals(o__.type))
                {
                    return false;
                }
                if(id == null)
                {
                    if(o__.id != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!id.Equals(o__.id))
                    {
                        return false;
                    }
                }
                return true;
            }

            #endregion

            #region Comparison members

            public static bool operator==(KPFormField lhs__, KPFormField rhs__)
            {
                return Equals(lhs__, rhs__);
            }

            public static bool operator!=(KPFormField lhs__, KPFormField rhs__)
            {
                return !Equals(lhs__, rhs__);
            }

            #endregion

            #region Marshalling support

            public void write__(IceInternal.BasicStream os__)
            {
                os__.writeString(name);
                os__.writeString(displayName);
                os__.writeString(value);
                os__.writeByte((byte)type, 6);
                os__.writeString(id);
            }

            public void read__(IceInternal.BasicStream is__)
            {
                name = is__.readString();
                displayName = is__.readString();
                value = is__.readString();
                type = (KeeICE.KFlib.formFieldType)is__.readByte(6);
                id = is__.readString();
            }

            #endregion
        }

        public class KPGroup : _System.ICloneable
        {
            #region Slice data members

            public string title;

            public string uniqueID;

            #endregion

            #region Constructors

            public KPGroup()
            {
            }

            public KPGroup(string title, string uniqueID)
            {
                this.title = title;
                this.uniqueID = uniqueID;
            }

            #endregion

            #region ICloneable members

            public object Clone()
            {
                return MemberwiseClone();
            }

            #endregion

            #region Object members

            public override int GetHashCode()
            {
                int h__ = 0;
                if(title != null)
                {
                    h__ = 5 * h__ + title.GetHashCode();
                }
                if(uniqueID != null)
                {
                    h__ = 5 * h__ + uniqueID.GetHashCode();
                }
                return h__;
            }

            public override bool Equals(object other__)
            {
                if(object.ReferenceEquals(this, other__))
                {
                    return true;
                }
                if(other__ == null)
                {
                    return false;
                }
                if(GetType() != other__.GetType())
                {
                    return false;
                }
                KPGroup o__ = (KPGroup)other__;
                if(title == null)
                {
                    if(o__.title != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!title.Equals(o__.title))
                    {
                        return false;
                    }
                }
                if(uniqueID == null)
                {
                    if(o__.uniqueID != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!uniqueID.Equals(o__.uniqueID))
                    {
                        return false;
                    }
                }
                return true;
            }

            #endregion

            #region Comparison members

            public static bool operator==(KPGroup lhs__, KPGroup rhs__)
            {
                return Equals(lhs__, rhs__);
            }

            public static bool operator!=(KPGroup lhs__, KPGroup rhs__)
            {
                return !Equals(lhs__, rhs__);
            }

            #endregion

            #region Marshalling support

            public void write__(IceInternal.BasicStream os__)
            {
                os__.writeString(title);
                os__.writeString(uniqueID);
            }

            public void read__(IceInternal.BasicStream is__)
            {
                title = is__.readString();
                uniqueID = is__.readString();
            }

            #endregion
        }

        public class KPEntry : _System.ICloneable
        {
            #region Slice data members

            public string URL;

            public string formActionURL;

            public string HTTPRealm;

            public string title;

            public KeeICE.KFlib.KPFormField[] formFieldList;

            public bool @default;

            public bool exactMatch;

            public string uniqueID;

            #endregion

            #region Constructors

            public KPEntry()
            {
            }

            public KPEntry(string URL, string formActionURL, string HTTPRealm, string title, KeeICE.KFlib.KPFormField[] formFieldList, bool @default, bool exactMatch, string uniqueID)
            {
                this.URL = URL;
                this.formActionURL = formActionURL;
                this.HTTPRealm = HTTPRealm;
                this.title = title;
                this.formFieldList = formFieldList;
                this.@default = @default;
                this.exactMatch = exactMatch;
                this.uniqueID = uniqueID;
            }

            #endregion

            #region ICloneable members

            public object Clone()
            {
                return MemberwiseClone();
            }

            #endregion

            #region Object members

            public override int GetHashCode()
            {
                int h__ = 0;
                if(URL != null)
                {
                    h__ = 5 * h__ + URL.GetHashCode();
                }
                if(formActionURL != null)
                {
                    h__ = 5 * h__ + formActionURL.GetHashCode();
                }
                if(HTTPRealm != null)
                {
                    h__ = 5 * h__ + HTTPRealm.GetHashCode();
                }
                if(title != null)
                {
                    h__ = 5 * h__ + title.GetHashCode();
                }
                if(formFieldList != null)
                {
                    h__ = 5 * h__ + IceUtilInternal.Arrays.GetHashCode(formFieldList);
                }
                h__ = 5 * h__ + @default.GetHashCode();
                h__ = 5 * h__ + exactMatch.GetHashCode();
                if(uniqueID != null)
                {
                    h__ = 5 * h__ + uniqueID.GetHashCode();
                }
                return h__;
            }

            public override bool Equals(object other__)
            {
                if(object.ReferenceEquals(this, other__))
                {
                    return true;
                }
                if(other__ == null)
                {
                    return false;
                }
                if(GetType() != other__.GetType())
                {
                    return false;
                }
                KPEntry o__ = (KPEntry)other__;
                if(URL == null)
                {
                    if(o__.URL != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!URL.Equals(o__.URL))
                    {
                        return false;
                    }
                }
                if(formActionURL == null)
                {
                    if(o__.formActionURL != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!formActionURL.Equals(o__.formActionURL))
                    {
                        return false;
                    }
                }
                if(HTTPRealm == null)
                {
                    if(o__.HTTPRealm != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!HTTPRealm.Equals(o__.HTTPRealm))
                    {
                        return false;
                    }
                }
                if(title == null)
                {
                    if(o__.title != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!title.Equals(o__.title))
                    {
                        return false;
                    }
                }
                if(formFieldList == null)
                {
                    if(o__.formFieldList != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!IceUtilInternal.Arrays.Equals(formFieldList, o__.formFieldList))
                    {
                        return false;
                    }
                }
                if(!@default.Equals(o__.@default))
                {
                    return false;
                }
                if(!exactMatch.Equals(o__.exactMatch))
                {
                    return false;
                }
                if(uniqueID == null)
                {
                    if(o__.uniqueID != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!uniqueID.Equals(o__.uniqueID))
                    {
                        return false;
                    }
                }
                return true;
            }

            #endregion

            #region Comparison members

            public static bool operator==(KPEntry lhs__, KPEntry rhs__)
            {
                return Equals(lhs__, rhs__);
            }

            public static bool operator!=(KPEntry lhs__, KPEntry rhs__)
            {
                return !Equals(lhs__, rhs__);
            }

            #endregion

            #region Marshalling support

            public void write__(IceInternal.BasicStream os__)
            {
                os__.writeString(URL);
                os__.writeString(formActionURL);
                os__.writeString(HTTPRealm);
                os__.writeString(title);
                if(formFieldList == null)
                {
                    os__.writeSize(0);
                }
                else
                {
                    os__.writeSize(formFieldList.Length);
                    for(int ix__ = 0; ix__ < formFieldList.Length; ++ix__)
                    {
                        (formFieldList == null ? new KeeICE.KFlib.KPFormField() : formFieldList[ix__]).write__(os__);
                    }
                }
                os__.writeBool(@default);
                os__.writeBool(exactMatch);
                os__.writeString(uniqueID);
            }

            public void read__(IceInternal.BasicStream is__)
            {
                URL = is__.readString();
                formActionURL = is__.readString();
                HTTPRealm = is__.readString();
                title = is__.readString();
                {
                    int szx__ = is__.readSize();
                    is__.startSeq(szx__, 5);
                    formFieldList = new KeeICE.KFlib.KPFormField[szx__];
                    for(int ix__ = 0; ix__ < szx__; ++ix__)
                    {
                        formFieldList[ix__] = new KeeICE.KFlib.KPFormField();
                        formFieldList[ix__].read__(is__);
                        is__.checkSeq();
                        is__.endElement();
                    }
                    is__.endSeq(szx__);
                }
                @default = is__.readBool();
                exactMatch = is__.readBool();
                uniqueID = is__.readString();
            }

            #endregion
        }

        public class KeeICEException : Ice.UserException
        {
            #region Slice data members

            public string reason;

            #endregion

            #region Constructors

            public KeeICEException()
            {
            }

            public KeeICEException(_System.Exception ex__) : base(ex__)
            {
            }

            private void initDM__(string reason)
            {
                this.reason = reason;
            }

            public KeeICEException(string reason)
            {
                initDM__(reason);
            }

            public KeeICEException(string reason, _System.Exception ex__) : base(ex__)
            {
                initDM__(reason);
            }

            #endregion

            public override string ice_name()
            {
                return "KeeICE::KFlib::KeeICEException";
            }

            #region Object members

            public override int GetHashCode()
            {
                int h__ = 0;
                if(reason != null)
                {
                    h__ = 5 * h__ + reason.GetHashCode();
                }
                return h__;
            }

            public override bool Equals(object other__)
            {
                if(other__ == null)
                {
                    return false;
                }
                if(object.ReferenceEquals(this, other__))
                {
                    return true;
                }
                if(!(other__ is KeeICEException))
                {
                    return false;
                }
                KeeICEException o__ = (KeeICEException)other__;
                if(reason == null)
                {
                    if(o__.reason != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!reason.Equals(o__.reason))
                    {
                        return false;
                    }
                }
                return true;
            }

            #endregion

            #region Comparison members

            public static bool operator==(KeeICEException lhs__, KeeICEException rhs__)
            {
                return Equals(lhs__, rhs__);
            }

            public static bool operator!=(KeeICEException lhs__, KeeICEException rhs__)
            {
                return !Equals(lhs__, rhs__);
            }

            #endregion

            #region Marshaling support

            public override void write__(IceInternal.BasicStream os__)
            {
                os__.writeString("::KeeICE::KFlib::KeeICEException");
                os__.startWriteSlice();
                os__.writeString(reason);
                os__.endWriteSlice();
            }

            public override void read__(IceInternal.BasicStream is__, bool rid__)
            {
                if(rid__)
                {
                    /* string myId = */ is__.readString();
                }
                is__.startReadSlice();
                reason = is__.readString();
                is__.endReadSlice();
            }

            public override void write__(Ice.OutputStream outS__)
            {
                Ice.MarshalException ex = new Ice.MarshalException();
                ex.reason = "exception KeeICE::KFlib::KeeICEException was not generated with stream support";
                throw ex;
            }

            public override void read__(Ice.InputStream inS__, bool rid__)
            {
                Ice.MarshalException ex = new Ice.MarshalException();
                ex.reason = "exception KeeICE::KFlib::KeeICEException was not generated with stream support";
                throw ex;
            }

            public override bool usesClasses__()
            {
                return true;
            }

            #endregion
        }

        public interface KP : Ice.Object, KPOperations_, KPOperationsNC_
        {
        }

        public class KPDatabase : _System.ICloneable
        {
            #region Slice data members

            public string DBname;

            public string fileName;

            public bool @default;

            public string rootGroupUID;

            public bool useILM;

            #endregion

            #region Constructors

            public KPDatabase()
            {
            }

            public KPDatabase(string DBname, string fileName, bool @default, string rootGroupUID, bool useILM)
            {
                this.DBname = DBname;
                this.fileName = fileName;
                this.@default = @default;
                this.rootGroupUID = rootGroupUID;
                this.useILM = useILM;
            }

            #endregion

            #region ICloneable members

            public object Clone()
            {
                return MemberwiseClone();
            }

            #endregion

            #region Object members

            public override int GetHashCode()
            {
                int h__ = 0;
                if(DBname != null)
                {
                    h__ = 5 * h__ + DBname.GetHashCode();
                }
                if(fileName != null)
                {
                    h__ = 5 * h__ + fileName.GetHashCode();
                }
                h__ = 5 * h__ + @default.GetHashCode();
                if(rootGroupUID != null)
                {
                    h__ = 5 * h__ + rootGroupUID.GetHashCode();
                }
                h__ = 5 * h__ + useILM.GetHashCode();
                return h__;
            }

            public override bool Equals(object other__)
            {
                if(object.ReferenceEquals(this, other__))
                {
                    return true;
                }
                if(other__ == null)
                {
                    return false;
                }
                if(GetType() != other__.GetType())
                {
                    return false;
                }
                KPDatabase o__ = (KPDatabase)other__;
                if(DBname == null)
                {
                    if(o__.DBname != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!DBname.Equals(o__.DBname))
                    {
                        return false;
                    }
                }
                if(fileName == null)
                {
                    if(o__.fileName != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!fileName.Equals(o__.fileName))
                    {
                        return false;
                    }
                }
                if(!@default.Equals(o__.@default))
                {
                    return false;
                }
                if(rootGroupUID == null)
                {
                    if(o__.rootGroupUID != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!rootGroupUID.Equals(o__.rootGroupUID))
                    {
                        return false;
                    }
                }
                if(!useILM.Equals(o__.useILM))
                {
                    return false;
                }
                return true;
            }

            #endregion

            #region Comparison members

            public static bool operator==(KPDatabase lhs__, KPDatabase rhs__)
            {
                return Equals(lhs__, rhs__);
            }

            public static bool operator!=(KPDatabase lhs__, KPDatabase rhs__)
            {
                return !Equals(lhs__, rhs__);
            }

            #endregion

            #region Marshalling support

            public void write__(IceInternal.BasicStream os__)
            {
                os__.writeString(DBname);
                os__.writeString(fileName);
                os__.writeBool(@default);
                os__.writeString(rootGroupUID);
                os__.writeBool(useILM);
            }

            public void read__(IceInternal.BasicStream is__)
            {
                DBname = is__.readString();
                fileName = is__.readString();
                @default = is__.readBool();
                rootGroupUID = is__.readString();
                useILM = is__.readBool();
            }

            #endregion
        }

        public class KFConfiguration : _System.ICloneable
        {
            #region Slice data members

            public bool allowUnencryptedMetaData;

            public KeeICE.KFlib.KPDatabase[] knownDatabases;

            #endregion

            #region Constructors

            public KFConfiguration()
            {
            }

            public KFConfiguration(bool allowUnencryptedMetaData, KeeICE.KFlib.KPDatabase[] knownDatabases)
            {
                this.allowUnencryptedMetaData = allowUnencryptedMetaData;
                this.knownDatabases = knownDatabases;
            }

            #endregion

            #region ICloneable members

            public object Clone()
            {
                return MemberwiseClone();
            }

            #endregion

            #region Object members

            public override int GetHashCode()
            {
                int h__ = 0;
                h__ = 5 * h__ + allowUnencryptedMetaData.GetHashCode();
                if(knownDatabases != null)
                {
                    h__ = 5 * h__ + IceUtilInternal.Arrays.GetHashCode(knownDatabases);
                }
                return h__;
            }

            public override bool Equals(object other__)
            {
                if(object.ReferenceEquals(this, other__))
                {
                    return true;
                }
                if(other__ == null)
                {
                    return false;
                }
                if(GetType() != other__.GetType())
                {
                    return false;
                }
                KFConfiguration o__ = (KFConfiguration)other__;
                if(!allowUnencryptedMetaData.Equals(o__.allowUnencryptedMetaData))
                {
                    return false;
                }
                if(knownDatabases == null)
                {
                    if(o__.knownDatabases != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!IceUtilInternal.Arrays.Equals(knownDatabases, o__.knownDatabases))
                    {
                        return false;
                    }
                }
                return true;
            }

            #endregion

            #region Comparison members

            public static bool operator==(KFConfiguration lhs__, KFConfiguration rhs__)
            {
                return Equals(lhs__, rhs__);
            }

            public static bool operator!=(KFConfiguration lhs__, KFConfiguration rhs__)
            {
                return !Equals(lhs__, rhs__);
            }

            #endregion

            #region Marshalling support

            public void write__(IceInternal.BasicStream os__)
            {
                os__.writeBool(allowUnencryptedMetaData);
                if(knownDatabases == null)
                {
                    os__.writeSize(0);
                }
                else
                {
                    os__.writeSize(knownDatabases.Length);
                    for(int ix__ = 0; ix__ < knownDatabases.Length; ++ix__)
                    {
                        (knownDatabases == null ? new KeeICE.KFlib.KPDatabase() : knownDatabases[ix__]).write__(os__);
                    }
                }
            }

            public void read__(IceInternal.BasicStream is__)
            {
                allowUnencryptedMetaData = is__.readBool();
                {
                    int szx__ = is__.readSize();
                    is__.startSeq(szx__, 5);
                    knownDatabases = new KeeICE.KFlib.KPDatabase[szx__];
                    for(int ix__ = 0; ix__ < szx__; ++ix__)
                    {
                        knownDatabases[ix__] = new KeeICE.KFlib.KPDatabase();
                        knownDatabases[ix__].read__(is__);
                        is__.checkSeq();
                        is__.endElement();
                    }
                    is__.endSeq(szx__);
                }
            }

            #endregion
        }

        public interface CallbackReceiver : Ice.Object, CallbackReceiverOperations_, CallbackReceiverOperationsNC_
        {
        }
    }
}

namespace KeeICE
{
    namespace KFlib
    {
        public interface KPPrx : Ice.ObjectPrx
        {
            bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result);
            bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result, _System.Collections.Generic.Dictionary<string, string> context__);

            string getDatabaseName();
            string getDatabaseName(_System.Collections.Generic.Dictionary<string, string> context__);

            string getDatabaseFileName();
            string getDatabaseFileName(_System.Collections.Generic.Dictionary<string, string> context__);

            void changeDatabase(string fileName, bool closeCurrent);
            void changeDatabase(string fileName, bool closeCurrent, _System.Collections.Generic.Dictionary<string, string> context__);

            KeeICE.KFlib.KPEntry AddLogin(KeeICE.KFlib.KPEntry login, string parentUUID);
            KeeICE.KFlib.KPEntry AddLogin(KeeICE.KFlib.KPEntry login, string parentUUID, _System.Collections.Generic.Dictionary<string, string> context__);

            void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin);
            void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin, _System.Collections.Generic.Dictionary<string, string> context__);

            int getAllLogins(out KeeICE.KFlib.KPEntry[] logins);
            int getAllLogins(out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__);

            int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KeeICE.KFlib.KPEntry[] logins);
            int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__);

            int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches);
            int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, _System.Collections.Generic.Dictionary<string, string> context__);

            void addClient(Ice.Identity ident);
            void addClient(Ice.Identity ident, _System.Collections.Generic.Dictionary<string, string> context__);

            int findGroups(string name, string uuid, out KeeICE.KFlib.KPGroup[] groups);
            int findGroups(string name, string uuid, out KeeICE.KFlib.KPGroup[] groups, _System.Collections.Generic.Dictionary<string, string> context__);

            KeeICE.KFlib.KPGroup getRoot();
            KeeICE.KFlib.KPGroup getRoot(_System.Collections.Generic.Dictionary<string, string> context__);

            KeeICE.KFlib.KPGroup getParent(string uuid);
            KeeICE.KFlib.KPGroup getParent(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);

            KeeICE.KFlib.KPGroup[] getChildGroups(string uuid);
            KeeICE.KFlib.KPGroup[] getChildGroups(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);

            KeeICE.KFlib.KPEntry[] getChildEntries(string uuid);
            KeeICE.KFlib.KPEntry[] getChildEntries(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);

            KeeICE.KFlib.KPGroup addGroup(string name, string parentUuid);
            KeeICE.KFlib.KPGroup addGroup(string name, string parentUuid, _System.Collections.Generic.Dictionary<string, string> context__);

            bool removeGroup(string uuid);
            bool removeGroup(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);

            bool removeEntry(string uuid);
            bool removeEntry(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);

            void LaunchGroupEditor(string uuid);
            void LaunchGroupEditor(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);

            void LaunchLoginEditor(string uuid);
            void LaunchLoginEditor(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);
        }

        public interface CallbackReceiverPrx : Ice.ObjectPrx
        {
            void callback(int num);
            void callback(int num, _System.Collections.Generic.Dictionary<string, string> context__);
        }
    }
}

namespace KeeICE
{
    namespace KFlib
    {
        public interface KPOperations_
        {
            bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result, Ice.Current current__);

            string getDatabaseName(Ice.Current current__);

            string getDatabaseFileName(Ice.Current current__);

            void changeDatabase(string fileName, bool closeCurrent, Ice.Current current__);

            KeeICE.KFlib.KPEntry AddLogin(KeeICE.KFlib.KPEntry login, string parentUUID, Ice.Current current__);

            void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin, Ice.Current current__);

            int getAllLogins(out KeeICE.KFlib.KPEntry[] logins, Ice.Current current__);

            int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KeeICE.KFlib.KPEntry[] logins, Ice.Current current__);

            int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, Ice.Current current__);

            void addClient(Ice.Identity ident, Ice.Current current__);

            int findGroups(string name, string uuid, out KeeICE.KFlib.KPGroup[] groups, Ice.Current current__);

            KeeICE.KFlib.KPGroup getRoot(Ice.Current current__);

            KeeICE.KFlib.KPGroup getParent(string uuid, Ice.Current current__);

            KeeICE.KFlib.KPGroup[] getChildGroups(string uuid, Ice.Current current__);

            KeeICE.KFlib.KPEntry[] getChildEntries(string uuid, Ice.Current current__);

            KeeICE.KFlib.KPGroup addGroup(string name, string parentUuid, Ice.Current current__);

            bool removeGroup(string uuid, Ice.Current current__);

            bool removeEntry(string uuid, Ice.Current current__);

            void LaunchGroupEditor(string uuid, Ice.Current current__);

            void LaunchLoginEditor(string uuid, Ice.Current current__);
        }

        public interface KPOperationsNC_
        {
            bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result);

            string getDatabaseName();

            string getDatabaseFileName();

            void changeDatabase(string fileName, bool closeCurrent);

            KeeICE.KFlib.KPEntry AddLogin(KeeICE.KFlib.KPEntry login, string parentUUID);

            void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin);

            int getAllLogins(out KeeICE.KFlib.KPEntry[] logins);

            int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KeeICE.KFlib.KPEntry[] logins);

            int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches);

            void addClient(Ice.Identity ident);

            int findGroups(string name, string uuid, out KeeICE.KFlib.KPGroup[] groups);

            KeeICE.KFlib.KPGroup getRoot();

            KeeICE.KFlib.KPGroup getParent(string uuid);

            KeeICE.KFlib.KPGroup[] getChildGroups(string uuid);

            KeeICE.KFlib.KPEntry[] getChildEntries(string uuid);

            KeeICE.KFlib.KPGroup addGroup(string name, string parentUuid);

            bool removeGroup(string uuid);

            bool removeEntry(string uuid);

            void LaunchGroupEditor(string uuid);

            void LaunchLoginEditor(string uuid);
        }

        public interface CallbackReceiverOperations_
        {
            void callback(int num, Ice.Current current__);
        }

        public interface CallbackReceiverOperationsNC_
        {
            void callback(int num);
        }
    }
}

namespace KeeICE
{
    namespace KFlib
    {
        public sealed class KPFormFieldListHelper
        {
            public static void write(IceInternal.BasicStream os__, KeeICE.KFlib.KPFormField[] v__)
            {
                if(v__ == null)
                {
                    os__.writeSize(0);
                }
                else
                {
                    os__.writeSize(v__.Length);
                    for(int ix__ = 0; ix__ < v__.Length; ++ix__)
                    {
                        (v__ == null ? new KeeICE.KFlib.KPFormField() : v__[ix__]).write__(os__);
                    }
                }
            }

            public static KeeICE.KFlib.KPFormField[] read(IceInternal.BasicStream is__)
            {
                KeeICE.KFlib.KPFormField[] v__;
                {
                    int szx__ = is__.readSize();
                    is__.startSeq(szx__, 5);
                    v__ = new KeeICE.KFlib.KPFormField[szx__];
                    for(int ix__ = 0; ix__ < szx__; ++ix__)
                    {
                        v__[ix__] = new KeeICE.KFlib.KPFormField();
                        v__[ix__].read__(is__);
                        is__.checkSeq();
                        is__.endElement();
                    }
                    is__.endSeq(szx__);
                }
                return v__;
            }
        }

        public sealed class KPGroupListHelper
        {
            public static void write(IceInternal.BasicStream os__, KeeICE.KFlib.KPGroup[] v__)
            {
                if(v__ == null)
                {
                    os__.writeSize(0);
                }
                else
                {
                    os__.writeSize(v__.Length);
                    for(int ix__ = 0; ix__ < v__.Length; ++ix__)
                    {
                        (v__ == null ? new KeeICE.KFlib.KPGroup() : v__[ix__]).write__(os__);
                    }
                }
            }

            public static KeeICE.KFlib.KPGroup[] read(IceInternal.BasicStream is__)
            {
                KeeICE.KFlib.KPGroup[] v__;
                {
                    int szx__ = is__.readSize();
                    is__.startSeq(szx__, 2);
                    v__ = new KeeICE.KFlib.KPGroup[szx__];
                    for(int ix__ = 0; ix__ < szx__; ++ix__)
                    {
                        v__[ix__] = new KeeICE.KFlib.KPGroup();
                        v__[ix__].read__(is__);
                        is__.checkSeq();
                        is__.endElement();
                    }
                    is__.endSeq(szx__);
                }
                return v__;
            }
        }

        public sealed class KPEntryListHelper
        {
            public static void write(IceInternal.BasicStream os__, KeeICE.KFlib.KPEntry[] v__)
            {
                if(v__ == null)
                {
                    os__.writeSize(0);
                }
                else
                {
                    os__.writeSize(v__.Length);
                    for(int ix__ = 0; ix__ < v__.Length; ++ix__)
                    {
                        (v__ == null ? new KeeICE.KFlib.KPEntry() : v__[ix__]).write__(os__);
                    }
                }
            }

            public static KeeICE.KFlib.KPEntry[] read(IceInternal.BasicStream is__)
            {
                KeeICE.KFlib.KPEntry[] v__;
                {
                    int szx__ = is__.readSize();
                    is__.startSeq(szx__, 8);
                    v__ = new KeeICE.KFlib.KPEntry[szx__];
                    for(int ix__ = 0; ix__ < szx__; ++ix__)
                    {
                        v__[ix__] = new KeeICE.KFlib.KPEntry();
                        v__[ix__].read__(is__);
                        is__.checkSeq();
                        is__.endElement();
                    }
                    is__.endSeq(szx__);
                }
                return v__;
            }
        }

        public sealed class KPPrxHelper : Ice.ObjectPrxHelperBase, KPPrx
        {
            #region Synchronous operations

            public KeeICE.KFlib.KPEntry AddLogin(KeeICE.KFlib.KPEntry login, string parentUUID)
            {
                return AddLogin(login, parentUUID, null, false);
            }

            public KeeICE.KFlib.KPEntry AddLogin(KeeICE.KFlib.KPEntry login, string parentUUID, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                return AddLogin(login, parentUUID, context__, true);
            }

            private KeeICE.KFlib.KPEntry AddLogin(KeeICE.KFlib.KPEntry login, string parentUUID, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("AddLogin");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.AddLogin(login, parentUUID, context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public void LaunchGroupEditor(string uuid)
            {
                LaunchGroupEditor(uuid, null, false);
            }

            public void LaunchGroupEditor(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                LaunchGroupEditor(uuid, context__, true);
            }

            private void LaunchGroupEditor(string uuid, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        del__.LaunchGroupEditor(uuid, context__);
                        return;
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public void LaunchLoginEditor(string uuid)
            {
                LaunchLoginEditor(uuid, null, false);
            }

            public void LaunchLoginEditor(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                LaunchLoginEditor(uuid, context__, true);
            }

            private void LaunchLoginEditor(string uuid, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        del__.LaunchLoginEditor(uuid, context__);
                        return;
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin)
            {
                ModifyLogin(oldLogin, newLogin, null, false);
            }

            public void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                ModifyLogin(oldLogin, newLogin, context__, true);
            }

            private void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("ModifyLogin");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        del__.ModifyLogin(oldLogin, newLogin, context__);
                        return;
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public void addClient(Ice.Identity ident)
            {
                addClient(ident, null, false);
            }

            public void addClient(Ice.Identity ident, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                addClient(ident, context__, true);
            }

            private void addClient(Ice.Identity ident, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        del__.addClient(ident, context__);
                        return;
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public KeeICE.KFlib.KPGroup addGroup(string name, string parentUuid)
            {
                return addGroup(name, parentUuid, null, false);
            }

            public KeeICE.KFlib.KPGroup addGroup(string name, string parentUuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                return addGroup(name, parentUuid, context__, true);
            }

            private KeeICE.KFlib.KPGroup addGroup(string name, string parentUuid, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("addGroup");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.addGroup(name, parentUuid, context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public void changeDatabase(string fileName, bool closeCurrent)
            {
                changeDatabase(fileName, closeCurrent, null, false);
            }

            public void changeDatabase(string fileName, bool closeCurrent, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                changeDatabase(fileName, closeCurrent, context__, true);
            }

            private void changeDatabase(string fileName, bool closeCurrent, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        del__.changeDatabase(fileName, closeCurrent, context__);
                        return;
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result)
            {
                return checkVersion(keeFoxVersion, keeICEVersion, out result, null, false);
            }

            public bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                return checkVersion(keeFoxVersion, keeICEVersion, out result, context__, true);
            }

            private bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("checkVersion");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.checkVersion(keeFoxVersion, keeICEVersion, out result, context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches)
            {
                return countLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, null, false);
            }

            public int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                return countLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, context__, true);
            }

            private int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("countLogins");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.countLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public int findGroups(string name, string uuid, out KeeICE.KFlib.KPGroup[] groups)
            {
                return findGroups(name, uuid, out groups, null, false);
            }

            public int findGroups(string name, string uuid, out KeeICE.KFlib.KPGroup[] groups, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                return findGroups(name, uuid, out groups, context__, true);
            }

            private int findGroups(string name, string uuid, out KeeICE.KFlib.KPGroup[] groups, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("findGroups");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.findGroups(name, uuid, out groups, context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KeeICE.KFlib.KPEntry[] logins)
            {
                return findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, uniqueID, out logins, null, false);
            }

            public int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                return findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, uniqueID, out logins, context__, true);
            }

            private int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("findLogins");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, uniqueID, out logins, context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public int getAllLogins(out KeeICE.KFlib.KPEntry[] logins)
            {
                return getAllLogins(out logins, null, false);
            }

            public int getAllLogins(out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                return getAllLogins(out logins, context__, true);
            }

            private int getAllLogins(out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("getAllLogins");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.getAllLogins(out logins, context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public KeeICE.KFlib.KPEntry[] getChildEntries(string uuid)
            {
                return getChildEntries(uuid, null, false);
            }

            public KeeICE.KFlib.KPEntry[] getChildEntries(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                return getChildEntries(uuid, context__, true);
            }

            private KeeICE.KFlib.KPEntry[] getChildEntries(string uuid, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("getChildEntries");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.getChildEntries(uuid, context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public KeeICE.KFlib.KPGroup[] getChildGroups(string uuid)
            {
                return getChildGroups(uuid, null, false);
            }

            public KeeICE.KFlib.KPGroup[] getChildGroups(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                return getChildGroups(uuid, context__, true);
            }

            private KeeICE.KFlib.KPGroup[] getChildGroups(string uuid, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("getChildGroups");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.getChildGroups(uuid, context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public string getDatabaseFileName()
            {
                return getDatabaseFileName(null, false);
            }

            public string getDatabaseFileName(_System.Collections.Generic.Dictionary<string, string> context__)
            {
                return getDatabaseFileName(context__, true);
            }

            private string getDatabaseFileName(_System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("getDatabaseFileName");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.getDatabaseFileName(context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public string getDatabaseName()
            {
                return getDatabaseName(null, false);
            }

            public string getDatabaseName(_System.Collections.Generic.Dictionary<string, string> context__)
            {
                return getDatabaseName(context__, true);
            }

            private string getDatabaseName(_System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("getDatabaseName");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.getDatabaseName(context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public KeeICE.KFlib.KPGroup getParent(string uuid)
            {
                return getParent(uuid, null, false);
            }

            public KeeICE.KFlib.KPGroup getParent(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                return getParent(uuid, context__, true);
            }

            private KeeICE.KFlib.KPGroup getParent(string uuid, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("getParent");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.getParent(uuid, context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public KeeICE.KFlib.KPGroup getRoot()
            {
                return getRoot(null, false);
            }

            public KeeICE.KFlib.KPGroup getRoot(_System.Collections.Generic.Dictionary<string, string> context__)
            {
                return getRoot(context__, true);
            }

            private KeeICE.KFlib.KPGroup getRoot(_System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("getRoot");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.getRoot(context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public bool removeEntry(string uuid)
            {
                return removeEntry(uuid, null, false);
            }

            public bool removeEntry(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                return removeEntry(uuid, context__, true);
            }

            private bool removeEntry(string uuid, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("removeEntry");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.removeEntry(uuid, context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            public bool removeGroup(string uuid)
            {
                return removeGroup(uuid, null, false);
            }

            public bool removeGroup(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                return removeGroup(uuid, context__, true);
            }

            private bool removeGroup(string uuid, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        checkTwowayOnly__("removeGroup");
                        delBase__ = getDelegate__(false);
                        KPDel_ del__ = (KPDel_)delBase__;
                        return del__.removeGroup(uuid, context__);
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            #endregion

            #region Checked and unchecked cast operations

            public static KPPrx checkedCast(Ice.ObjectPrx b)
            {
                if(b == null)
                {
                    return null;
                }
                KPPrx r = b as KPPrx;
                if((r == null) && b.ice_isA("::KeeICE::KFlib::KP"))
                {
                    KPPrxHelper h = new KPPrxHelper();
                    h.copyFrom__(b);
                    r = h;
                }
                return r;
            }

            public static KPPrx checkedCast(Ice.ObjectPrx b, _System.Collections.Generic.Dictionary<string, string> ctx)
            {
                if(b == null)
                {
                    return null;
                }
                KPPrx r = b as KPPrx;
                if((r == null) && b.ice_isA("::KeeICE::KFlib::KP", ctx))
                {
                    KPPrxHelper h = new KPPrxHelper();
                    h.copyFrom__(b);
                    r = h;
                }
                return r;
            }

            public static KPPrx checkedCast(Ice.ObjectPrx b, string f)
            {
                if(b == null)
                {
                    return null;
                }
                Ice.ObjectPrx bb = b.ice_facet(f);
                try
                {
                    if(bb.ice_isA("::KeeICE::KFlib::KP"))
                    {
                        KPPrxHelper h = new KPPrxHelper();
                        h.copyFrom__(bb);
                        return h;
                    }
                }
                catch(Ice.FacetNotExistException)
                {
                }
                return null;
            }

            public static KPPrx checkedCast(Ice.ObjectPrx b, string f, _System.Collections.Generic.Dictionary<string, string> ctx)
            {
                if(b == null)
                {
                    return null;
                }
                Ice.ObjectPrx bb = b.ice_facet(f);
                try
                {
                    if(bb.ice_isA("::KeeICE::KFlib::KP", ctx))
                    {
                        KPPrxHelper h = new KPPrxHelper();
                        h.copyFrom__(bb);
                        return h;
                    }
                }
                catch(Ice.FacetNotExistException)
                {
                }
                return null;
            }

            public static KPPrx uncheckedCast(Ice.ObjectPrx b)
            {
                if(b == null)
                {
                    return null;
                }
                KPPrx r = b as KPPrx;
                if(r == null)
                {
                    KPPrxHelper h = new KPPrxHelper();
                    h.copyFrom__(b);
                    r = h;
                }
                return r;
            }

            public static KPPrx uncheckedCast(Ice.ObjectPrx b, string f)
            {
                if(b == null)
                {
                    return null;
                }
                Ice.ObjectPrx bb = b.ice_facet(f);
                KPPrxHelper h = new KPPrxHelper();
                h.copyFrom__(bb);
                return h;
            }

            #endregion

            #region Marshaling support

            protected override Ice.ObjectDelM_ createDelegateM__()
            {
                return new KPDelM_();
            }

            protected override Ice.ObjectDelD_ createDelegateD__()
            {
                return new KPDelD_();
            }

            public static void write__(IceInternal.BasicStream os__, KPPrx v__)
            {
                os__.writeProxy(v__);
            }

            public static KPPrx read__(IceInternal.BasicStream is__)
            {
                Ice.ObjectPrx proxy = is__.readProxy();
                if(proxy != null)
                {
                    KPPrxHelper result = new KPPrxHelper();
                    result.copyFrom__(proxy);
                    return result;
                }
                return null;
            }

            #endregion
        }

        public sealed class KPDatabaseListHelper
        {
            public static void write(IceInternal.BasicStream os__, KeeICE.KFlib.KPDatabase[] v__)
            {
                if(v__ == null)
                {
                    os__.writeSize(0);
                }
                else
                {
                    os__.writeSize(v__.Length);
                    for(int ix__ = 0; ix__ < v__.Length; ++ix__)
                    {
                        (v__ == null ? new KeeICE.KFlib.KPDatabase() : v__[ix__]).write__(os__);
                    }
                }
            }

            public static KeeICE.KFlib.KPDatabase[] read(IceInternal.BasicStream is__)
            {
                KeeICE.KFlib.KPDatabase[] v__;
                {
                    int szx__ = is__.readSize();
                    is__.startSeq(szx__, 5);
                    v__ = new KeeICE.KFlib.KPDatabase[szx__];
                    for(int ix__ = 0; ix__ < szx__; ++ix__)
                    {
                        v__[ix__] = new KeeICE.KFlib.KPDatabase();
                        v__[ix__].read__(is__);
                        is__.checkSeq();
                        is__.endElement();
                    }
                    is__.endSeq(szx__);
                }
                return v__;
            }
        }

        public sealed class CallbackReceiverPrxHelper : Ice.ObjectPrxHelperBase, CallbackReceiverPrx
        {
            #region Synchronous operations

            public void callback(int num)
            {
                callback(num, null, false);
            }

            public void callback(int num, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                callback(num, context__, true);
            }

            private void callback(int num, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
            {
                if(explicitContext__ && context__ == null)
                {
                    context__ = emptyContext_;
                }
                int cnt__ = 0;
                while(true)
                {
                    Ice.ObjectDel_ delBase__ = null;
                    try
                    {
                        delBase__ = getDelegate__(false);
                        CallbackReceiverDel_ del__ = (CallbackReceiverDel_)delBase__;
                        del__.callback(num, context__);
                        return;
                    }
                    catch(IceInternal.LocalExceptionWrapper ex__)
                    {
                        handleExceptionWrapper__(delBase__, ex__, null);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        handleException__(delBase__, ex__, null, ref cnt__);
                    }
                }
            }

            #endregion

            #region Checked and unchecked cast operations

            public static CallbackReceiverPrx checkedCast(Ice.ObjectPrx b)
            {
                if(b == null)
                {
                    return null;
                }
                CallbackReceiverPrx r = b as CallbackReceiverPrx;
                if((r == null) && b.ice_isA("::KeeICE::KFlib::CallbackReceiver"))
                {
                    CallbackReceiverPrxHelper h = new CallbackReceiverPrxHelper();
                    h.copyFrom__(b);
                    r = h;
                }
                return r;
            }

            public static CallbackReceiverPrx checkedCast(Ice.ObjectPrx b, _System.Collections.Generic.Dictionary<string, string> ctx)
            {
                if(b == null)
                {
                    return null;
                }
                CallbackReceiverPrx r = b as CallbackReceiverPrx;
                if((r == null) && b.ice_isA("::KeeICE::KFlib::CallbackReceiver", ctx))
                {
                    CallbackReceiverPrxHelper h = new CallbackReceiverPrxHelper();
                    h.copyFrom__(b);
                    r = h;
                }
                return r;
            }

            public static CallbackReceiverPrx checkedCast(Ice.ObjectPrx b, string f)
            {
                if(b == null)
                {
                    return null;
                }
                Ice.ObjectPrx bb = b.ice_facet(f);
                try
                {
                    if(bb.ice_isA("::KeeICE::KFlib::CallbackReceiver"))
                    {
                        CallbackReceiverPrxHelper h = new CallbackReceiverPrxHelper();
                        h.copyFrom__(bb);
                        return h;
                    }
                }
                catch(Ice.FacetNotExistException)
                {
                }
                return null;
            }

            public static CallbackReceiverPrx checkedCast(Ice.ObjectPrx b, string f, _System.Collections.Generic.Dictionary<string, string> ctx)
            {
                if(b == null)
                {
                    return null;
                }
                Ice.ObjectPrx bb = b.ice_facet(f);
                try
                {
                    if(bb.ice_isA("::KeeICE::KFlib::CallbackReceiver", ctx))
                    {
                        CallbackReceiverPrxHelper h = new CallbackReceiverPrxHelper();
                        h.copyFrom__(bb);
                        return h;
                    }
                }
                catch(Ice.FacetNotExistException)
                {
                }
                return null;
            }

            public static CallbackReceiverPrx uncheckedCast(Ice.ObjectPrx b)
            {
                if(b == null)
                {
                    return null;
                }
                CallbackReceiverPrx r = b as CallbackReceiverPrx;
                if(r == null)
                {
                    CallbackReceiverPrxHelper h = new CallbackReceiverPrxHelper();
                    h.copyFrom__(b);
                    r = h;
                }
                return r;
            }

            public static CallbackReceiverPrx uncheckedCast(Ice.ObjectPrx b, string f)
            {
                if(b == null)
                {
                    return null;
                }
                Ice.ObjectPrx bb = b.ice_facet(f);
                CallbackReceiverPrxHelper h = new CallbackReceiverPrxHelper();
                h.copyFrom__(bb);
                return h;
            }

            #endregion

            #region Marshaling support

            protected override Ice.ObjectDelM_ createDelegateM__()
            {
                return new CallbackReceiverDelM_();
            }

            protected override Ice.ObjectDelD_ createDelegateD__()
            {
                return new CallbackReceiverDelD_();
            }

            public static void write__(IceInternal.BasicStream os__, CallbackReceiverPrx v__)
            {
                os__.writeProxy(v__);
            }

            public static CallbackReceiverPrx read__(IceInternal.BasicStream is__)
            {
                Ice.ObjectPrx proxy = is__.readProxy();
                if(proxy != null)
                {
                    CallbackReceiverPrxHelper result = new CallbackReceiverPrxHelper();
                    result.copyFrom__(proxy);
                    return result;
                }
                return null;
            }

            #endregion
        }
    }
}

namespace KeeICE
{
    namespace KFlib
    {
        public interface KPDel_ : Ice.ObjectDel_
        {
            bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result, _System.Collections.Generic.Dictionary<string, string> context__);

            string getDatabaseName(_System.Collections.Generic.Dictionary<string, string> context__);

            string getDatabaseFileName(_System.Collections.Generic.Dictionary<string, string> context__);

            void changeDatabase(string fileName, bool closeCurrent, _System.Collections.Generic.Dictionary<string, string> context__);

            KeeICE.KFlib.KPEntry AddLogin(KeeICE.KFlib.KPEntry login, string parentUUID, _System.Collections.Generic.Dictionary<string, string> context__);

            void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin, _System.Collections.Generic.Dictionary<string, string> context__);

            int getAllLogins(out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__);

            int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__);

            int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, _System.Collections.Generic.Dictionary<string, string> context__);

            void addClient(Ice.Identity ident, _System.Collections.Generic.Dictionary<string, string> context__);

            int findGroups(string name, string uuid, out KeeICE.KFlib.KPGroup[] groups, _System.Collections.Generic.Dictionary<string, string> context__);

            KeeICE.KFlib.KPGroup getRoot(_System.Collections.Generic.Dictionary<string, string> context__);

            KeeICE.KFlib.KPGroup getParent(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);

            KeeICE.KFlib.KPGroup[] getChildGroups(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);

            KeeICE.KFlib.KPEntry[] getChildEntries(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);

            KeeICE.KFlib.KPGroup addGroup(string name, string parentUuid, _System.Collections.Generic.Dictionary<string, string> context__);

            bool removeGroup(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);

            bool removeEntry(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);

            void LaunchGroupEditor(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);

            void LaunchLoginEditor(string uuid, _System.Collections.Generic.Dictionary<string, string> context__);
        }

        public interface CallbackReceiverDel_ : Ice.ObjectDel_
        {
            void callback(int num, _System.Collections.Generic.Dictionary<string, string> context__);
        }
    }
}

namespace KeeICE
{
    namespace KFlib
    {
        public sealed class KPDelM_ : Ice.ObjectDelM_, KPDel_
        {
            public KeeICE.KFlib.KPEntry AddLogin(KeeICE.KFlib.KPEntry login, string parentUUID, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("AddLogin", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        if(login == null)
                        {
                            KeeICE.KFlib.KPEntry tmp__ = new KeeICE.KFlib.KPEntry();
                            tmp__.write__(os__);
                        }
                        else
                        {
                            login.write__(os__);
                        }
                        os__.writeString(parentUUID);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(KeeICE.KFlib.KeeICEException)
                            {
                                throw;
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        KeeICE.KFlib.KPEntry ret__;
                        ret__ = null;
                        if(ret__ == null)
                        {
                            ret__ = new KeeICE.KFlib.KPEntry();
                        }
                        ret__.read__(is__);
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public void LaunchGroupEditor(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("LaunchGroupEditor", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeString(uuid);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    if(!og__.istr().isEmpty())
                    {
                        try
                        {
                            if(!ok__)
                            {
                                try
                                {
                                    og__.throwUserException();
                                }
                                catch(Ice.UserException ex)
                                {
                                    throw new Ice.UnknownUserException(ex.ice_name(), ex);
                                }
                            }
                            og__.istr().skipEmptyEncaps();
                        }
                        catch(Ice.LocalException ex__)
                        {
                            throw new IceInternal.LocalExceptionWrapper(ex__, false);
                        }
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public void LaunchLoginEditor(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("LaunchLoginEditor", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeString(uuid);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    if(!og__.istr().isEmpty())
                    {
                        try
                        {
                            if(!ok__)
                            {
                                try
                                {
                                    og__.throwUserException();
                                }
                                catch(Ice.UserException ex)
                                {
                                    throw new Ice.UnknownUserException(ex.ice_name(), ex);
                                }
                            }
                            og__.istr().skipEmptyEncaps();
                        }
                        catch(Ice.LocalException ex__)
                        {
                            throw new IceInternal.LocalExceptionWrapper(ex__, false);
                        }
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("ModifyLogin", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        if(oldLogin == null)
                        {
                            KeeICE.KFlib.KPEntry tmp__ = new KeeICE.KFlib.KPEntry();
                            tmp__.write__(os__);
                        }
                        else
                        {
                            oldLogin.write__(os__);
                        }
                        if(newLogin == null)
                        {
                            KeeICE.KFlib.KPEntry tmp__ = new KeeICE.KFlib.KPEntry();
                            tmp__.write__(os__);
                        }
                        else
                        {
                            newLogin.write__(os__);
                        }
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(KeeICE.KFlib.KeeICEException)
                            {
                                throw;
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        is__.endReadEncaps();
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public void addClient(Ice.Identity ident, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("addClient", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        if(ident == null)
                        {
                            Ice.Identity tmp__ = new Ice.Identity();
                            tmp__.write__(os__);
                        }
                        else
                        {
                            ident.write__(os__);
                        }
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    if(!og__.istr().isEmpty())
                    {
                        try
                        {
                            if(!ok__)
                            {
                                try
                                {
                                    og__.throwUserException();
                                }
                                catch(Ice.UserException ex)
                                {
                                    throw new Ice.UnknownUserException(ex.ice_name(), ex);
                                }
                            }
                            og__.istr().skipEmptyEncaps();
                        }
                        catch(Ice.LocalException ex__)
                        {
                            throw new IceInternal.LocalExceptionWrapper(ex__, false);
                        }
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public KeeICE.KFlib.KPGroup addGroup(string name, string parentUuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("addGroup", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeString(name);
                        os__.writeString(parentUuid);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        KeeICE.KFlib.KPGroup ret__;
                        ret__ = null;
                        if(ret__ == null)
                        {
                            ret__ = new KeeICE.KFlib.KPGroup();
                        }
                        ret__.read__(is__);
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public void changeDatabase(string fileName, bool closeCurrent, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("changeDatabase", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeString(fileName);
                        os__.writeBool(closeCurrent);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    if(!og__.istr().isEmpty())
                    {
                        try
                        {
                            if(!ok__)
                            {
                                try
                                {
                                    og__.throwUserException();
                                }
                                catch(Ice.UserException ex)
                                {
                                    throw new Ice.UnknownUserException(ex.ice_name(), ex);
                                }
                            }
                            og__.istr().skipEmptyEncaps();
                        }
                        catch(Ice.LocalException ex__)
                        {
                            throw new IceInternal.LocalExceptionWrapper(ex__, false);
                        }
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("checkVersion", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeFloat(keeFoxVersion);
                        os__.writeFloat(keeICEVersion);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        result = is__.readInt();
                        bool ret__;
                        ret__ = is__.readBool();
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("countLogins", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeString(hostname);
                        os__.writeString(actionURL);
                        os__.writeString(httpRealm);
                        os__.writeByte((byte)lst, 3);
                        os__.writeBool(requireFullURLMatches);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(KeeICE.KFlib.KeeICEException)
                            {
                                throw;
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        int ret__;
                        ret__ = is__.readInt();
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public int findGroups(string name, string uuid, out KeeICE.KFlib.KPGroup[] groups, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("findGroups", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeString(name);
                        os__.writeString(uuid);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        {
                            int szx__ = is__.readSize();
                            is__.startSeq(szx__, 2);
                            groups = new KeeICE.KFlib.KPGroup[szx__];
                            for(int ix__ = 0; ix__ < szx__; ++ix__)
                            {
                                groups[ix__] = new KeeICE.KFlib.KPGroup();
                                groups[ix__].read__(is__);
                                is__.checkSeq();
                                is__.endElement();
                            }
                            is__.endSeq(szx__);
                        }
                        int ret__;
                        ret__ = is__.readInt();
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("findLogins", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeString(hostname);
                        os__.writeString(actionURL);
                        os__.writeString(httpRealm);
                        os__.writeByte((byte)lst, 3);
                        os__.writeBool(requireFullURLMatches);
                        os__.writeString(uniqueID);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(KeeICE.KFlib.KeeICEException)
                            {
                                throw;
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        {
                            int szx__ = is__.readSize();
                            is__.startSeq(szx__, 8);
                            logins = new KeeICE.KFlib.KPEntry[szx__];
                            for(int ix__ = 0; ix__ < szx__; ++ix__)
                            {
                                logins[ix__] = new KeeICE.KFlib.KPEntry();
                                logins[ix__].read__(is__);
                                is__.checkSeq();
                                is__.endElement();
                            }
                            is__.endSeq(szx__);
                        }
                        int ret__;
                        ret__ = is__.readInt();
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public int getAllLogins(out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("getAllLogins", Ice.OperationMode.Normal, context__);
                try
                {
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(KeeICE.KFlib.KeeICEException)
                            {
                                throw;
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        {
                            int szx__ = is__.readSize();
                            is__.startSeq(szx__, 8);
                            logins = new KeeICE.KFlib.KPEntry[szx__];
                            for(int ix__ = 0; ix__ < szx__; ++ix__)
                            {
                                logins[ix__] = new KeeICE.KFlib.KPEntry();
                                logins[ix__].read__(is__);
                                is__.checkSeq();
                                is__.endElement();
                            }
                            is__.endSeq(szx__);
                        }
                        int ret__;
                        ret__ = is__.readInt();
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public KeeICE.KFlib.KPEntry[] getChildEntries(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("getChildEntries", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeString(uuid);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        KeeICE.KFlib.KPEntry[] ret__;
                        {
                            int szx__ = is__.readSize();
                            is__.startSeq(szx__, 8);
                            ret__ = new KeeICE.KFlib.KPEntry[szx__];
                            for(int ix__ = 0; ix__ < szx__; ++ix__)
                            {
                                ret__[ix__] = new KeeICE.KFlib.KPEntry();
                                ret__[ix__].read__(is__);
                                is__.checkSeq();
                                is__.endElement();
                            }
                            is__.endSeq(szx__);
                        }
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public KeeICE.KFlib.KPGroup[] getChildGroups(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("getChildGroups", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeString(uuid);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        KeeICE.KFlib.KPGroup[] ret__;
                        {
                            int szx__ = is__.readSize();
                            is__.startSeq(szx__, 2);
                            ret__ = new KeeICE.KFlib.KPGroup[szx__];
                            for(int ix__ = 0; ix__ < szx__; ++ix__)
                            {
                                ret__[ix__] = new KeeICE.KFlib.KPGroup();
                                ret__[ix__].read__(is__);
                                is__.checkSeq();
                                is__.endElement();
                            }
                            is__.endSeq(szx__);
                        }
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public string getDatabaseFileName(_System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("getDatabaseFileName", Ice.OperationMode.Normal, context__);
                try
                {
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        string ret__;
                        ret__ = is__.readString();
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public string getDatabaseName(_System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("getDatabaseName", Ice.OperationMode.Normal, context__);
                try
                {
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        string ret__;
                        ret__ = is__.readString();
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public KeeICE.KFlib.KPGroup getParent(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("getParent", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeString(uuid);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        KeeICE.KFlib.KPGroup ret__;
                        ret__ = null;
                        if(ret__ == null)
                        {
                            ret__ = new KeeICE.KFlib.KPGroup();
                        }
                        ret__.read__(is__);
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public KeeICE.KFlib.KPGroup getRoot(_System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("getRoot", Ice.OperationMode.Normal, context__);
                try
                {
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        KeeICE.KFlib.KPGroup ret__;
                        ret__ = null;
                        if(ret__ == null)
                        {
                            ret__ = new KeeICE.KFlib.KPGroup();
                        }
                        ret__.read__(is__);
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public bool removeEntry(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("removeEntry", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeString(uuid);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        bool ret__;
                        ret__ = is__.readBool();
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }

            public bool removeGroup(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("removeGroup", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeString(uuid);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    try
                    {
                        if(!ok__)
                        {
                            try
                            {
                                og__.throwUserException();
                            }
                            catch(Ice.UserException ex)
                            {
                                throw new Ice.UnknownUserException(ex.ice_name(), ex);
                            }
                        }
                        IceInternal.BasicStream is__ = og__.istr();
                        is__.startReadEncaps();
                        bool ret__;
                        ret__ = is__.readBool();
                        is__.endReadEncaps();
                        return ret__;
                    }
                    catch(Ice.LocalException ex__)
                    {
                        throw new IceInternal.LocalExceptionWrapper(ex__, false);
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }
        }

        public sealed class CallbackReceiverDelM_ : Ice.ObjectDelM_, CallbackReceiverDel_
        {
            public void callback(int num, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("callback", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeInt(num);
                    }
                    catch(Ice.LocalException ex__)
                    {
                        og__.abort(ex__);
                    }
                    bool ok__ = og__.invoke();
                    if(!og__.istr().isEmpty())
                    {
                        try
                        {
                            if(!ok__)
                            {
                                try
                                {
                                    og__.throwUserException();
                                }
                                catch(Ice.UserException ex)
                                {
                                    throw new Ice.UnknownUserException(ex.ice_name(), ex);
                                }
                            }
                            og__.istr().skipEmptyEncaps();
                        }
                        catch(Ice.LocalException ex__)
                        {
                            throw new IceInternal.LocalExceptionWrapper(ex__, false);
                        }
                    }
                }
                finally
                {
                    handler__.reclaimOutgoing(og__);
                }
            }
        }
    }
}

namespace KeeICE
{
    namespace KFlib
    {
        public sealed class KPDelD_ : Ice.ObjectDelD_, KPDel_
        {
            public KeeICE.KFlib.KPEntry AddLogin(KeeICE.KFlib.KPEntry login, string parentUUID, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "AddLogin", Ice.OperationMode.Normal, context__);
                KeeICE.KFlib.KPEntry result__ = new KeeICE.KFlib.KPEntry();
                Ice.UserException userException__ = null;
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    try
                    {
                        result__ = servant__.AddLogin(login, parentUUID, current__);
                        return Ice.DispatchStatus.DispatchOK;
                    }
                    catch(Ice.UserException ex__)
                    {
                        userException__ = ex__;
                        return Ice.DispatchStatus.DispatchUserException;
                    }
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        if(status__ == Ice.DispatchStatus.DispatchUserException)
                        {
                            throw userException__;
                        }
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(KeeICE.KFlib.KeeICEException)
                {
                    throw;
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                return result__;
            }

            public void LaunchGroupEditor(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "LaunchGroupEditor", Ice.OperationMode.Normal, context__);
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    servant__.LaunchGroupEditor(uuid, current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
            }

            public void LaunchLoginEditor(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "LaunchLoginEditor", Ice.OperationMode.Normal, context__);
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    servant__.LaunchLoginEditor(uuid, current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
            }

            public void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "ModifyLogin", Ice.OperationMode.Normal, context__);
                Ice.UserException userException__ = null;
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    try
                    {
                        servant__.ModifyLogin(oldLogin, newLogin, current__);
                        return Ice.DispatchStatus.DispatchOK;
                    }
                    catch(Ice.UserException ex__)
                    {
                        userException__ = ex__;
                        return Ice.DispatchStatus.DispatchUserException;
                    }
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        if(status__ == Ice.DispatchStatus.DispatchUserException)
                        {
                            throw userException__;
                        }
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(KeeICE.KFlib.KeeICEException)
                {
                    throw;
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
            }

            public void addClient(Ice.Identity ident, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "addClient", Ice.OperationMode.Normal, context__);
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    servant__.addClient(ident, current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
            }

            public KeeICE.KFlib.KPGroup addGroup(string name, string parentUuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "addGroup", Ice.OperationMode.Normal, context__);
                KeeICE.KFlib.KPGroup result__ = new KeeICE.KFlib.KPGroup();
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    result__ = servant__.addGroup(name, parentUuid, current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                return result__;
            }

            public void changeDatabase(string fileName, bool closeCurrent, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "changeDatabase", Ice.OperationMode.Normal, context__);
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    servant__.changeDatabase(fileName, closeCurrent, current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
            }

            public bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "checkVersion", Ice.OperationMode.Normal, context__);
                int resultHolder__ = 0;
                bool result__ = false;
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    result__ = servant__.checkVersion(keeFoxVersion, keeICEVersion, out resultHolder__, current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                result = resultHolder__;
                return result__;
            }

            public int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "countLogins", Ice.OperationMode.Normal, context__);
                int result__ = 0;
                Ice.UserException userException__ = null;
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    try
                    {
                        result__ = servant__.countLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, current__);
                        return Ice.DispatchStatus.DispatchOK;
                    }
                    catch(Ice.UserException ex__)
                    {
                        userException__ = ex__;
                        return Ice.DispatchStatus.DispatchUserException;
                    }
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        if(status__ == Ice.DispatchStatus.DispatchUserException)
                        {
                            throw userException__;
                        }
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(KeeICE.KFlib.KeeICEException)
                {
                    throw;
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                return result__;
            }

            public int findGroups(string name, string uuid, out KeeICE.KFlib.KPGroup[] groups, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "findGroups", Ice.OperationMode.Normal, context__);
                KeeICE.KFlib.KPGroup[] groupsHolder__ = null;
                int result__ = 0;
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    result__ = servant__.findGroups(name, uuid, out groupsHolder__, current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                groups = groupsHolder__;
                return result__;
            }

            public int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "findLogins", Ice.OperationMode.Normal, context__);
                KeeICE.KFlib.KPEntry[] loginsHolder__ = null;
                int result__ = 0;
                Ice.UserException userException__ = null;
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    try
                    {
                        result__ = servant__.findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, uniqueID, out loginsHolder__, current__);
                        return Ice.DispatchStatus.DispatchOK;
                    }
                    catch(Ice.UserException ex__)
                    {
                        userException__ = ex__;
                        return Ice.DispatchStatus.DispatchUserException;
                    }
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        if(status__ == Ice.DispatchStatus.DispatchUserException)
                        {
                            throw userException__;
                        }
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(KeeICE.KFlib.KeeICEException)
                {
                    throw;
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                logins = loginsHolder__;
                return result__;
            }

            public int getAllLogins(out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "getAllLogins", Ice.OperationMode.Normal, context__);
                KeeICE.KFlib.KPEntry[] loginsHolder__ = null;
                int result__ = 0;
                Ice.UserException userException__ = null;
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    try
                    {
                        result__ = servant__.getAllLogins(out loginsHolder__, current__);
                        return Ice.DispatchStatus.DispatchOK;
                    }
                    catch(Ice.UserException ex__)
                    {
                        userException__ = ex__;
                        return Ice.DispatchStatus.DispatchUserException;
                    }
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        if(status__ == Ice.DispatchStatus.DispatchUserException)
                        {
                            throw userException__;
                        }
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(KeeICE.KFlib.KeeICEException)
                {
                    throw;
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                logins = loginsHolder__;
                return result__;
            }

            public KeeICE.KFlib.KPEntry[] getChildEntries(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "getChildEntries", Ice.OperationMode.Normal, context__);
                KeeICE.KFlib.KPEntry[] result__ = null;
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    result__ = servant__.getChildEntries(uuid, current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                return result__;
            }

            public KeeICE.KFlib.KPGroup[] getChildGroups(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "getChildGroups", Ice.OperationMode.Normal, context__);
                KeeICE.KFlib.KPGroup[] result__ = null;
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    result__ = servant__.getChildGroups(uuid, current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                return result__;
            }

            public string getDatabaseFileName(_System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "getDatabaseFileName", Ice.OperationMode.Normal, context__);
                string result__ = null;
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    result__ = servant__.getDatabaseFileName(current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                return result__;
            }

            public string getDatabaseName(_System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "getDatabaseName", Ice.OperationMode.Normal, context__);
                string result__ = null;
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    result__ = servant__.getDatabaseName(current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                return result__;
            }

            public KeeICE.KFlib.KPGroup getParent(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "getParent", Ice.OperationMode.Normal, context__);
                KeeICE.KFlib.KPGroup result__ = new KeeICE.KFlib.KPGroup();
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    result__ = servant__.getParent(uuid, current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                return result__;
            }

            public KeeICE.KFlib.KPGroup getRoot(_System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "getRoot", Ice.OperationMode.Normal, context__);
                KeeICE.KFlib.KPGroup result__ = new KeeICE.KFlib.KPGroup();
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    result__ = servant__.getRoot(current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                return result__;
            }

            public bool removeEntry(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "removeEntry", Ice.OperationMode.Normal, context__);
                bool result__ = false;
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    result__ = servant__.removeEntry(uuid, current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                return result__;
            }

            public bool removeGroup(string uuid, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "removeGroup", Ice.OperationMode.Normal, context__);
                bool result__ = false;
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KP servant__ = null;
                    try
                    {
                        servant__ = (KP)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    result__ = servant__.removeGroup(uuid, current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
                return result__;
            }
        }

        public sealed class CallbackReceiverDelD_ : Ice.ObjectDelD_, CallbackReceiverDel_
        {
            public void callback(int num, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "callback", Ice.OperationMode.Normal, context__);
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    CallbackReceiver servant__ = null;
                    try
                    {
                        servant__ = (CallbackReceiver)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    servant__.callback(num, current__);
                    return Ice.DispatchStatus.DispatchOK;
                };
                IceInternal.Direct direct__ = null;
                try
                {
                    direct__ = new IceInternal.Direct(current__, run__);
                    try
                    {
                        Ice.DispatchStatus status__ = direct__.servant().collocDispatch__(direct__);
                        _System.Diagnostics.Debug.Assert(status__ == Ice.DispatchStatus.DispatchOK);
                    }
                    finally
                    {
                        direct__.destroy();
                    }
                }
                catch(Ice.SystemException)
                {
                    throw;
                }
                catch(System.Exception ex__)
                {
                    IceInternal.LocalExceptionWrapper.throwWrapper(ex__);
                }
            }
        }
    }
}

namespace KeeICE
{
    namespace KFlib
    {
        public abstract class KPDisp_ : Ice.ObjectImpl, KP
        {
            #region Slice operations

            public bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result)
            {
                return checkVersion(keeFoxVersion, keeICEVersion, out result, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result, Ice.Current current__);

            public string getDatabaseName()
            {
                return getDatabaseName(Ice.ObjectImpl.defaultCurrent);
            }

            public abstract string getDatabaseName(Ice.Current current__);

            public string getDatabaseFileName()
            {
                return getDatabaseFileName(Ice.ObjectImpl.defaultCurrent);
            }

            public abstract string getDatabaseFileName(Ice.Current current__);

            public void changeDatabase(string fileName, bool closeCurrent)
            {
                changeDatabase(fileName, closeCurrent, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract void changeDatabase(string fileName, bool closeCurrent, Ice.Current current__);

            public KeeICE.KFlib.KPEntry AddLogin(KeeICE.KFlib.KPEntry login, string parentUUID)
            {
                return AddLogin(login, parentUUID, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract KeeICE.KFlib.KPEntry AddLogin(KeeICE.KFlib.KPEntry login, string parentUUID, Ice.Current current__);

            public void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin)
            {
                ModifyLogin(oldLogin, newLogin, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin, Ice.Current current__);

            public int getAllLogins(out KeeICE.KFlib.KPEntry[] logins)
            {
                return getAllLogins(out logins, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract int getAllLogins(out KeeICE.KFlib.KPEntry[] logins, Ice.Current current__);

            public int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KeeICE.KFlib.KPEntry[] logins)
            {
                return findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, uniqueID, out logins, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, string uniqueID, out KeeICE.KFlib.KPEntry[] logins, Ice.Current current__);

            public int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches)
            {
                return countLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, Ice.Current current__);

            public void addClient(Ice.Identity ident)
            {
                addClient(ident, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract void addClient(Ice.Identity ident, Ice.Current current__);

            public int findGroups(string name, string uuid, out KeeICE.KFlib.KPGroup[] groups)
            {
                return findGroups(name, uuid, out groups, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract int findGroups(string name, string uuid, out KeeICE.KFlib.KPGroup[] groups, Ice.Current current__);

            public KeeICE.KFlib.KPGroup getRoot()
            {
                return getRoot(Ice.ObjectImpl.defaultCurrent);
            }

            public abstract KeeICE.KFlib.KPGroup getRoot(Ice.Current current__);

            public KeeICE.KFlib.KPGroup getParent(string uuid)
            {
                return getParent(uuid, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract KeeICE.KFlib.KPGroup getParent(string uuid, Ice.Current current__);

            public KeeICE.KFlib.KPGroup[] getChildGroups(string uuid)
            {
                return getChildGroups(uuid, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract KeeICE.KFlib.KPGroup[] getChildGroups(string uuid, Ice.Current current__);

            public KeeICE.KFlib.KPEntry[] getChildEntries(string uuid)
            {
                return getChildEntries(uuid, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract KeeICE.KFlib.KPEntry[] getChildEntries(string uuid, Ice.Current current__);

            public KeeICE.KFlib.KPGroup addGroup(string name, string parentUuid)
            {
                return addGroup(name, parentUuid, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract KeeICE.KFlib.KPGroup addGroup(string name, string parentUuid, Ice.Current current__);

            public bool removeGroup(string uuid)
            {
                return removeGroup(uuid, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract bool removeGroup(string uuid, Ice.Current current__);

            public bool removeEntry(string uuid)
            {
                return removeEntry(uuid, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract bool removeEntry(string uuid, Ice.Current current__);

            public void LaunchGroupEditor(string uuid)
            {
                LaunchGroupEditor(uuid, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract void LaunchGroupEditor(string uuid, Ice.Current current__);

            public void LaunchLoginEditor(string uuid)
            {
                LaunchLoginEditor(uuid, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract void LaunchLoginEditor(string uuid, Ice.Current current__);

            #endregion

            #region Slice type-related members

            public static new string[] ids__ = 
            {
                "::Ice::Object",
                "::KeeICE::KFlib::KP"
            };

            public override bool ice_isA(string s)
            {
                return _System.Array.BinarySearch(ids__, s, IceUtilInternal.StringUtil.OrdinalStringComparer) >= 0;
            }

            public override bool ice_isA(string s, Ice.Current current__)
            {
                return _System.Array.BinarySearch(ids__, s, IceUtilInternal.StringUtil.OrdinalStringComparer) >= 0;
            }

            public override string[] ice_ids()
            {
                return ids__;
            }

            public override string[] ice_ids(Ice.Current current__)
            {
                return ids__;
            }

            public override string ice_id()
            {
                return ids__[1];
            }

            public override string ice_id(Ice.Current current__)
            {
                return ids__[1];
            }

            public static new string ice_staticId()
            {
                return ids__[1];
            }

            #endregion

            #region Operation dispatch

            public static Ice.DispatchStatus checkVersion___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                float keeFoxVersion;
                keeFoxVersion = is__.readFloat();
                float keeICEVersion;
                keeICEVersion = is__.readFloat();
                is__.endReadEncaps();
                int result;
                IceInternal.BasicStream os__ = inS__.ostr();
                bool ret__ = obj__.checkVersion(keeFoxVersion, keeICEVersion, out result, current__);
                os__.writeInt(result);
                os__.writeBool(ret__);
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus getDatabaseName___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                inS__.istr().skipEmptyEncaps();
                IceInternal.BasicStream os__ = inS__.ostr();
                string ret__ = obj__.getDatabaseName(current__);
                os__.writeString(ret__);
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus getDatabaseFileName___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                inS__.istr().skipEmptyEncaps();
                IceInternal.BasicStream os__ = inS__.ostr();
                string ret__ = obj__.getDatabaseFileName(current__);
                os__.writeString(ret__);
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus changeDatabase___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                string fileName;
                fileName = is__.readString();
                bool closeCurrent;
                closeCurrent = is__.readBool();
                is__.endReadEncaps();
                obj__.changeDatabase(fileName, closeCurrent, current__);
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus AddLogin___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                KeeICE.KFlib.KPEntry login;
                login = null;
                if(login == null)
                {
                    login = new KeeICE.KFlib.KPEntry();
                }
                login.read__(is__);
                string parentUUID;
                parentUUID = is__.readString();
                is__.endReadEncaps();
                IceInternal.BasicStream os__ = inS__.ostr();
                try
                {
                    KeeICE.KFlib.KPEntry ret__ = obj__.AddLogin(login, parentUUID, current__);
                    if(ret__ == null)
                    {
                        KeeICE.KFlib.KPEntry tmp__ = new KeeICE.KFlib.KPEntry();
                        tmp__.write__(os__);
                    }
                    else
                    {
                        ret__.write__(os__);
                    }
                    return Ice.DispatchStatus.DispatchOK;
                }
                catch(KeeICE.KFlib.KeeICEException ex)
                {
                    os__.writeUserException(ex);
                    return Ice.DispatchStatus.DispatchUserException;
                }
            }

            public static Ice.DispatchStatus ModifyLogin___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                KeeICE.KFlib.KPEntry oldLogin;
                oldLogin = null;
                if(oldLogin == null)
                {
                    oldLogin = new KeeICE.KFlib.KPEntry();
                }
                oldLogin.read__(is__);
                KeeICE.KFlib.KPEntry newLogin;
                newLogin = null;
                if(newLogin == null)
                {
                    newLogin = new KeeICE.KFlib.KPEntry();
                }
                newLogin.read__(is__);
                is__.endReadEncaps();
                IceInternal.BasicStream os__ = inS__.ostr();
                try
                {
                    obj__.ModifyLogin(oldLogin, newLogin, current__);
                    return Ice.DispatchStatus.DispatchOK;
                }
                catch(KeeICE.KFlib.KeeICEException ex)
                {
                    os__.writeUserException(ex);
                    return Ice.DispatchStatus.DispatchUserException;
                }
            }

            public static Ice.DispatchStatus getAllLogins___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                inS__.istr().skipEmptyEncaps();
                KeeICE.KFlib.KPEntry[] logins;
                IceInternal.BasicStream os__ = inS__.ostr();
                try
                {
                    int ret__ = obj__.getAllLogins(out logins, current__);
                    if(logins == null)
                    {
                        os__.writeSize(0);
                    }
                    else
                    {
                        os__.writeSize(logins.Length);
                        for(int ix__ = 0; ix__ < logins.Length; ++ix__)
                        {
                            (logins == null ? new KeeICE.KFlib.KPEntry() : logins[ix__]).write__(os__);
                        }
                    }
                    os__.writeInt(ret__);
                    return Ice.DispatchStatus.DispatchOK;
                }
                catch(KeeICE.KFlib.KeeICEException ex)
                {
                    os__.writeUserException(ex);
                    return Ice.DispatchStatus.DispatchUserException;
                }
            }

            public static Ice.DispatchStatus findLogins___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                string hostname;
                hostname = is__.readString();
                string actionURL;
                actionURL = is__.readString();
                string httpRealm;
                httpRealm = is__.readString();
                KeeICE.KFlib.loginSearchType lst;
                lst = (KeeICE.KFlib.loginSearchType)is__.readByte(3);
                bool requireFullURLMatches;
                requireFullURLMatches = is__.readBool();
                string uniqueID;
                uniqueID = is__.readString();
                is__.endReadEncaps();
                KeeICE.KFlib.KPEntry[] logins;
                IceInternal.BasicStream os__ = inS__.ostr();
                try
                {
                    int ret__ = obj__.findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, uniqueID, out logins, current__);
                    if(logins == null)
                    {
                        os__.writeSize(0);
                    }
                    else
                    {
                        os__.writeSize(logins.Length);
                        for(int ix__ = 0; ix__ < logins.Length; ++ix__)
                        {
                            (logins == null ? new KeeICE.KFlib.KPEntry() : logins[ix__]).write__(os__);
                        }
                    }
                    os__.writeInt(ret__);
                    return Ice.DispatchStatus.DispatchOK;
                }
                catch(KeeICE.KFlib.KeeICEException ex)
                {
                    os__.writeUserException(ex);
                    return Ice.DispatchStatus.DispatchUserException;
                }
            }

            public static Ice.DispatchStatus countLogins___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                string hostname;
                hostname = is__.readString();
                string actionURL;
                actionURL = is__.readString();
                string httpRealm;
                httpRealm = is__.readString();
                KeeICE.KFlib.loginSearchType lst;
                lst = (KeeICE.KFlib.loginSearchType)is__.readByte(3);
                bool requireFullURLMatches;
                requireFullURLMatches = is__.readBool();
                is__.endReadEncaps();
                IceInternal.BasicStream os__ = inS__.ostr();
                try
                {
                    int ret__ = obj__.countLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, current__);
                    os__.writeInt(ret__);
                    return Ice.DispatchStatus.DispatchOK;
                }
                catch(KeeICE.KFlib.KeeICEException ex)
                {
                    os__.writeUserException(ex);
                    return Ice.DispatchStatus.DispatchUserException;
                }
            }

            public static Ice.DispatchStatus addClient___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                Ice.Identity ident;
                ident = null;
                if(ident == null)
                {
                    ident = new Ice.Identity();
                }
                ident.read__(is__);
                is__.endReadEncaps();
                obj__.addClient(ident, current__);
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus findGroups___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                string name;
                name = is__.readString();
                string uuid;
                uuid = is__.readString();
                is__.endReadEncaps();
                KeeICE.KFlib.KPGroup[] groups;
                IceInternal.BasicStream os__ = inS__.ostr();
                int ret__ = obj__.findGroups(name, uuid, out groups, current__);
                if(groups == null)
                {
                    os__.writeSize(0);
                }
                else
                {
                    os__.writeSize(groups.Length);
                    for(int ix__ = 0; ix__ < groups.Length; ++ix__)
                    {
                        (groups == null ? new KeeICE.KFlib.KPGroup() : groups[ix__]).write__(os__);
                    }
                }
                os__.writeInt(ret__);
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus getRoot___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                inS__.istr().skipEmptyEncaps();
                IceInternal.BasicStream os__ = inS__.ostr();
                KeeICE.KFlib.KPGroup ret__ = obj__.getRoot(current__);
                if(ret__ == null)
                {
                    KeeICE.KFlib.KPGroup tmp__ = new KeeICE.KFlib.KPGroup();
                    tmp__.write__(os__);
                }
                else
                {
                    ret__.write__(os__);
                }
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus getParent___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                string uuid;
                uuid = is__.readString();
                is__.endReadEncaps();
                IceInternal.BasicStream os__ = inS__.ostr();
                KeeICE.KFlib.KPGroup ret__ = obj__.getParent(uuid, current__);
                if(ret__ == null)
                {
                    KeeICE.KFlib.KPGroup tmp__ = new KeeICE.KFlib.KPGroup();
                    tmp__.write__(os__);
                }
                else
                {
                    ret__.write__(os__);
                }
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus getChildGroups___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                string uuid;
                uuid = is__.readString();
                is__.endReadEncaps();
                IceInternal.BasicStream os__ = inS__.ostr();
                KeeICE.KFlib.KPGroup[] ret__ = obj__.getChildGroups(uuid, current__);
                if(ret__ == null)
                {
                    os__.writeSize(0);
                }
                else
                {
                    os__.writeSize(ret__.Length);
                    for(int ix__ = 0; ix__ < ret__.Length; ++ix__)
                    {
                        (ret__ == null ? new KeeICE.KFlib.KPGroup() : ret__[ix__]).write__(os__);
                    }
                }
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus getChildEntries___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                string uuid;
                uuid = is__.readString();
                is__.endReadEncaps();
                IceInternal.BasicStream os__ = inS__.ostr();
                KeeICE.KFlib.KPEntry[] ret__ = obj__.getChildEntries(uuid, current__);
                if(ret__ == null)
                {
                    os__.writeSize(0);
                }
                else
                {
                    os__.writeSize(ret__.Length);
                    for(int ix__ = 0; ix__ < ret__.Length; ++ix__)
                    {
                        (ret__ == null ? new KeeICE.KFlib.KPEntry() : ret__[ix__]).write__(os__);
                    }
                }
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus addGroup___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                string name;
                name = is__.readString();
                string parentUuid;
                parentUuid = is__.readString();
                is__.endReadEncaps();
                IceInternal.BasicStream os__ = inS__.ostr();
                KeeICE.KFlib.KPGroup ret__ = obj__.addGroup(name, parentUuid, current__);
                if(ret__ == null)
                {
                    KeeICE.KFlib.KPGroup tmp__ = new KeeICE.KFlib.KPGroup();
                    tmp__.write__(os__);
                }
                else
                {
                    ret__.write__(os__);
                }
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus removeGroup___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                string uuid;
                uuid = is__.readString();
                is__.endReadEncaps();
                IceInternal.BasicStream os__ = inS__.ostr();
                bool ret__ = obj__.removeGroup(uuid, current__);
                os__.writeBool(ret__);
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus removeEntry___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                string uuid;
                uuid = is__.readString();
                is__.endReadEncaps();
                IceInternal.BasicStream os__ = inS__.ostr();
                bool ret__ = obj__.removeEntry(uuid, current__);
                os__.writeBool(ret__);
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus LaunchGroupEditor___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                string uuid;
                uuid = is__.readString();
                is__.endReadEncaps();
                obj__.LaunchGroupEditor(uuid, current__);
                return Ice.DispatchStatus.DispatchOK;
            }

            public static Ice.DispatchStatus LaunchLoginEditor___(KP obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                string uuid;
                uuid = is__.readString();
                is__.endReadEncaps();
                obj__.LaunchLoginEditor(uuid, current__);
                return Ice.DispatchStatus.DispatchOK;
            }

            private static string[] all__ =
            {
                "AddLogin",
                "LaunchGroupEditor",
                "LaunchLoginEditor",
                "ModifyLogin",
                "addClient",
                "addGroup",
                "changeDatabase",
                "checkVersion",
                "countLogins",
                "findGroups",
                "findLogins",
                "getAllLogins",
                "getChildEntries",
                "getChildGroups",
                "getDatabaseFileName",
                "getDatabaseName",
                "getParent",
                "getRoot",
                "ice_id",
                "ice_ids",
                "ice_isA",
                "ice_ping",
                "removeEntry",
                "removeGroup"
            };

            public override Ice.DispatchStatus dispatch__(IceInternal.Incoming inS__, Ice.Current current__)
            {
                int pos = _System.Array.BinarySearch(all__, current__.operation, IceUtilInternal.StringUtil.OrdinalStringComparer);
                if(pos < 0)
                {
                    throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                }

                switch(pos)
                {
                    case 0:
                    {
                        return AddLogin___(this, inS__, current__);
                    }
                    case 1:
                    {
                        return LaunchGroupEditor___(this, inS__, current__);
                    }
                    case 2:
                    {
                        return LaunchLoginEditor___(this, inS__, current__);
                    }
                    case 3:
                    {
                        return ModifyLogin___(this, inS__, current__);
                    }
                    case 4:
                    {
                        return addClient___(this, inS__, current__);
                    }
                    case 5:
                    {
                        return addGroup___(this, inS__, current__);
                    }
                    case 6:
                    {
                        return changeDatabase___(this, inS__, current__);
                    }
                    case 7:
                    {
                        return checkVersion___(this, inS__, current__);
                    }
                    case 8:
                    {
                        return countLogins___(this, inS__, current__);
                    }
                    case 9:
                    {
                        return findGroups___(this, inS__, current__);
                    }
                    case 10:
                    {
                        return findLogins___(this, inS__, current__);
                    }
                    case 11:
                    {
                        return getAllLogins___(this, inS__, current__);
                    }
                    case 12:
                    {
                        return getChildEntries___(this, inS__, current__);
                    }
                    case 13:
                    {
                        return getChildGroups___(this, inS__, current__);
                    }
                    case 14:
                    {
                        return getDatabaseFileName___(this, inS__, current__);
                    }
                    case 15:
                    {
                        return getDatabaseName___(this, inS__, current__);
                    }
                    case 16:
                    {
                        return getParent___(this, inS__, current__);
                    }
                    case 17:
                    {
                        return getRoot___(this, inS__, current__);
                    }
                    case 18:
                    {
                        return ice_id___(this, inS__, current__);
                    }
                    case 19:
                    {
                        return ice_ids___(this, inS__, current__);
                    }
                    case 20:
                    {
                        return ice_isA___(this, inS__, current__);
                    }
                    case 21:
                    {
                        return ice_ping___(this, inS__, current__);
                    }
                    case 22:
                    {
                        return removeEntry___(this, inS__, current__);
                    }
                    case 23:
                    {
                        return removeGroup___(this, inS__, current__);
                    }
                }

                _System.Diagnostics.Debug.Assert(false);
                throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
            }

            #endregion

            #region Marshaling support

            public override void write__(IceInternal.BasicStream os__)
            {
                os__.writeTypeId(ice_staticId());
                os__.startWriteSlice();
                os__.endWriteSlice();
                base.write__(os__);
            }

            public override void read__(IceInternal.BasicStream is__, bool rid__)
            {
                if(rid__)
                {
                    /* string myId = */ is__.readTypeId();
                }
                is__.startReadSlice();
                is__.endReadSlice();
                base.read__(is__, true);
            }

            public override void write__(Ice.OutputStream outS__)
            {
                Ice.MarshalException ex = new Ice.MarshalException();
                ex.reason = "type KeeICE::KFlib::KP was not generated with stream support";
                throw ex;
            }

            public override void read__(Ice.InputStream inS__, bool rid__)
            {
                Ice.MarshalException ex = new Ice.MarshalException();
                ex.reason = "type KeeICE::KFlib::KP was not generated with stream support";
                throw ex;
            }

            #endregion
        }

        public abstract class CallbackReceiverDisp_ : Ice.ObjectImpl, CallbackReceiver
        {
            #region Slice operations

            public void callback(int num)
            {
                callback(num, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract void callback(int num, Ice.Current current__);

            #endregion

            #region Slice type-related members

            public static new string[] ids__ = 
            {
                "::Ice::Object",
                "::KeeICE::KFlib::CallbackReceiver"
            };

            public override bool ice_isA(string s)
            {
                return _System.Array.BinarySearch(ids__, s, IceUtilInternal.StringUtil.OrdinalStringComparer) >= 0;
            }

            public override bool ice_isA(string s, Ice.Current current__)
            {
                return _System.Array.BinarySearch(ids__, s, IceUtilInternal.StringUtil.OrdinalStringComparer) >= 0;
            }

            public override string[] ice_ids()
            {
                return ids__;
            }

            public override string[] ice_ids(Ice.Current current__)
            {
                return ids__;
            }

            public override string ice_id()
            {
                return ids__[1];
            }

            public override string ice_id(Ice.Current current__)
            {
                return ids__[1];
            }

            public static new string ice_staticId()
            {
                return ids__[1];
            }

            #endregion

            #region Operation dispatch

            public static Ice.DispatchStatus callback___(CallbackReceiver obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                int num;
                num = is__.readInt();
                is__.endReadEncaps();
                obj__.callback(num, current__);
                return Ice.DispatchStatus.DispatchOK;
            }

            private static string[] all__ =
            {
                "callback",
                "ice_id",
                "ice_ids",
                "ice_isA",
                "ice_ping"
            };

            public override Ice.DispatchStatus dispatch__(IceInternal.Incoming inS__, Ice.Current current__)
            {
                int pos = _System.Array.BinarySearch(all__, current__.operation, IceUtilInternal.StringUtil.OrdinalStringComparer);
                if(pos < 0)
                {
                    throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                }

                switch(pos)
                {
                    case 0:
                    {
                        return callback___(this, inS__, current__);
                    }
                    case 1:
                    {
                        return ice_id___(this, inS__, current__);
                    }
                    case 2:
                    {
                        return ice_ids___(this, inS__, current__);
                    }
                    case 3:
                    {
                        return ice_isA___(this, inS__, current__);
                    }
                    case 4:
                    {
                        return ice_ping___(this, inS__, current__);
                    }
                }

                _System.Diagnostics.Debug.Assert(false);
                throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
            }

            #endregion

            #region Marshaling support

            public override void write__(IceInternal.BasicStream os__)
            {
                os__.writeTypeId(ice_staticId());
                os__.startWriteSlice();
                os__.endWriteSlice();
                base.write__(os__);
            }

            public override void read__(IceInternal.BasicStream is__, bool rid__)
            {
                if(rid__)
                {
                    /* string myId = */ is__.readTypeId();
                }
                is__.startReadSlice();
                is__.endReadSlice();
                base.read__(is__, true);
            }

            public override void write__(Ice.OutputStream outS__)
            {
                Ice.MarshalException ex = new Ice.MarshalException();
                ex.reason = "type KeeICE::KFlib::CallbackReceiver was not generated with stream support";
                throw ex;
            }

            public override void read__(Ice.InputStream inS__, bool rid__)
            {
                Ice.MarshalException ex = new Ice.MarshalException();
                ex.reason = "type KeeICE::KFlib::CallbackReceiver was not generated with stream support";
                throw ex;
            }

            #endregion
        }
    }
}
