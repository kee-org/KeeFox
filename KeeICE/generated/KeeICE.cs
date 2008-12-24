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

            #endregion

            #region Constructors

            public KPFormField()
            {
            }

            public KPFormField(string name, string displayName, string value, KeeICE.KFlib.formFieldType type)
            {
                this.name = name;
                this.displayName = displayName;
                this.value = value;
                this.type = type;
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
            }

            public void read__(IceInternal.BasicStream is__)
            {
                name = is__.readString();
                displayName = is__.readString();
                value = is__.readString();
                type = (KeeICE.KFlib.formFieldType)is__.readByte(6);
            }

            #endregion
        }

        public class KPEntry : _System.ICloneable
        {
            #region Slice data members

            public string hostName;

            public string formURL;

            public string HTTPRealm;

            public string title;

            public KeeICE.KFlib.KPFormField[] formFieldList;

            public bool @default;

            public bool exactMatch;

            #endregion

            #region Constructors

            public KPEntry()
            {
            }

            public KPEntry(string hostName, string formURL, string HTTPRealm, string title, KeeICE.KFlib.KPFormField[] formFieldList, bool @default, bool exactMatch)
            {
                this.hostName = hostName;
                this.formURL = formURL;
                this.HTTPRealm = HTTPRealm;
                this.title = title;
                this.formFieldList = formFieldList;
                this.@default = @default;
                this.exactMatch = exactMatch;
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
                if(hostName != null)
                {
                    h__ = 5 * h__ + hostName.GetHashCode();
                }
                if(formURL != null)
                {
                    h__ = 5 * h__ + formURL.GetHashCode();
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
                if(hostName == null)
                {
                    if(o__.hostName != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!hostName.Equals(o__.hostName))
                    {
                        return false;
                    }
                }
                if(formURL == null)
                {
                    if(o__.formURL != null)
                    {
                        return false;
                    }
                }
                else
                {
                    if(!formURL.Equals(o__.formURL))
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
                os__.writeString(hostName);
                os__.writeString(formURL);
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
            }

            public void read__(IceInternal.BasicStream is__)
            {
                hostName = is__.readString();
                formURL = is__.readString();
                HTTPRealm = is__.readString();
                title = is__.readString();
                {
                    int szx__ = is__.readSize();
                    is__.startSeq(szx__, 4);
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

        public interface KPGroup : Ice.Object, KPGroupOperations_, KPGroupOperationsNC_
        {
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
        public interface KPGroupPrx : Ice.ObjectPrx
        {
            void Touch(bool isModified);
            void Touch(bool isModified, _System.Collections.Generic.Dictionary<string, string> context__);
        }

        public interface KPPrx : Ice.ObjectPrx
        {
            bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result);
            bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result, _System.Collections.Generic.Dictionary<string, string> context__);

            string getDatabaseName();
            string getDatabaseName(_System.Collections.Generic.Dictionary<string, string> context__);

            void AddLogin(KeeICE.KFlib.KPEntry login);
            void AddLogin(KeeICE.KFlib.KPEntry login, _System.Collections.Generic.Dictionary<string, string> context__);

            void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin);
            void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin, _System.Collections.Generic.Dictionary<string, string> context__);

            int getAllLogins(out KeeICE.KFlib.KPEntry[] logins);
            int getAllLogins(out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__);

            int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, out KeeICE.KFlib.KPEntry[] logins);
            int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__);

            int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches);
            int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, _System.Collections.Generic.Dictionary<string, string> context__);

            void addClient(Ice.Identity ident);
            void addClient(Ice.Identity ident, _System.Collections.Generic.Dictionary<string, string> context__);
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
        public interface KPGroupOperations_
        {
            void Touch(bool isModified, Ice.Current current__);
        }

        public interface KPGroupOperationsNC_
        {
            void Touch(bool isModified);
        }

        public interface KPOperations_
        {
            bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result, Ice.Current current__);

            string getDatabaseName(Ice.Current current__);

            void AddLogin(KeeICE.KFlib.KPEntry login, Ice.Current current__);

            void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin, Ice.Current current__);

            int getAllLogins(out KeeICE.KFlib.KPEntry[] logins, Ice.Current current__);

            int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, out KeeICE.KFlib.KPEntry[] logins, Ice.Current current__);

            int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, Ice.Current current__);

            void addClient(Ice.Identity ident, Ice.Current current__);
        }

        public interface KPOperationsNC_
        {
            bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result);

            string getDatabaseName();

            void AddLogin(KeeICE.KFlib.KPEntry login);

            void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin);

            int getAllLogins(out KeeICE.KFlib.KPEntry[] logins);

            int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, out KeeICE.KFlib.KPEntry[] logins);

            int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches);

            void addClient(Ice.Identity ident);
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
                    is__.startSeq(szx__, 4);
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
                    is__.startSeq(szx__, 7);
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

        public sealed class KPGroupPrxHelper : Ice.ObjectPrxHelperBase, KPGroupPrx
        {
            #region Synchronous operations

            public void Touch(bool isModified)
            {
                Touch(isModified, null, false);
            }

            public void Touch(bool isModified, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Touch(isModified, context__, true);
            }

            private void Touch(bool isModified, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
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
                        KPGroupDel_ del__ = (KPGroupDel_)delBase__;
                        del__.Touch(isModified, context__);
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

            public static KPGroupPrx checkedCast(Ice.ObjectPrx b)
            {
                if(b == null)
                {
                    return null;
                }
                KPGroupPrx r = b as KPGroupPrx;
                if((r == null) && b.ice_isA("::KeeICE::KFlib::KPGroup"))
                {
                    KPGroupPrxHelper h = new KPGroupPrxHelper();
                    h.copyFrom__(b);
                    r = h;
                }
                return r;
            }

            public static KPGroupPrx checkedCast(Ice.ObjectPrx b, _System.Collections.Generic.Dictionary<string, string> ctx)
            {
                if(b == null)
                {
                    return null;
                }
                KPGroupPrx r = b as KPGroupPrx;
                if((r == null) && b.ice_isA("::KeeICE::KFlib::KPGroup", ctx))
                {
                    KPGroupPrxHelper h = new KPGroupPrxHelper();
                    h.copyFrom__(b);
                    r = h;
                }
                return r;
            }

            public static KPGroupPrx checkedCast(Ice.ObjectPrx b, string f)
            {
                if(b == null)
                {
                    return null;
                }
                Ice.ObjectPrx bb = b.ice_facet(f);
                try
                {
                    if(bb.ice_isA("::KeeICE::KFlib::KPGroup"))
                    {
                        KPGroupPrxHelper h = new KPGroupPrxHelper();
                        h.copyFrom__(bb);
                        return h;
                    }
                }
                catch(Ice.FacetNotExistException)
                {
                }
                return null;
            }

            public static KPGroupPrx checkedCast(Ice.ObjectPrx b, string f, _System.Collections.Generic.Dictionary<string, string> ctx)
            {
                if(b == null)
                {
                    return null;
                }
                Ice.ObjectPrx bb = b.ice_facet(f);
                try
                {
                    if(bb.ice_isA("::KeeICE::KFlib::KPGroup", ctx))
                    {
                        KPGroupPrxHelper h = new KPGroupPrxHelper();
                        h.copyFrom__(bb);
                        return h;
                    }
                }
                catch(Ice.FacetNotExistException)
                {
                }
                return null;
            }

            public static KPGroupPrx uncheckedCast(Ice.ObjectPrx b)
            {
                if(b == null)
                {
                    return null;
                }
                KPGroupPrx r = b as KPGroupPrx;
                if(r == null)
                {
                    KPGroupPrxHelper h = new KPGroupPrxHelper();
                    h.copyFrom__(b);
                    r = h;
                }
                return r;
            }

            public static KPGroupPrx uncheckedCast(Ice.ObjectPrx b, string f)
            {
                if(b == null)
                {
                    return null;
                }
                Ice.ObjectPrx bb = b.ice_facet(f);
                KPGroupPrxHelper h = new KPGroupPrxHelper();
                h.copyFrom__(bb);
                return h;
            }

            #endregion

            #region Marshaling support

            protected override Ice.ObjectDelM_ createDelegateM__()
            {
                return new KPGroupDelM_();
            }

            protected override Ice.ObjectDelD_ createDelegateD__()
            {
                return new KPGroupDelD_();
            }

            public static void write__(IceInternal.BasicStream os__, KPGroupPrx v__)
            {
                os__.writeProxy(v__);
            }

            public static KPGroupPrx read__(IceInternal.BasicStream is__)
            {
                Ice.ObjectPrx proxy = is__.readProxy();
                if(proxy != null)
                {
                    KPGroupPrxHelper result = new KPGroupPrxHelper();
                    result.copyFrom__(proxy);
                    return result;
                }
                return null;
            }

            #endregion
        }

        public sealed class KPPrxHelper : Ice.ObjectPrxHelperBase, KPPrx
        {
            #region Synchronous operations

            public void AddLogin(KeeICE.KFlib.KPEntry login)
            {
                AddLogin(login, null, false);
            }

            public void AddLogin(KeeICE.KFlib.KPEntry login, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                AddLogin(login, context__, true);
            }

            private void AddLogin(KeeICE.KFlib.KPEntry login, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
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
                        del__.AddLogin(login, context__);
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

            public int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, out KeeICE.KFlib.KPEntry[] logins)
            {
                return findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, out logins, null, false);
            }

            public int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                return findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, out logins, context__, true);
            }

            private int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__, bool explicitContext__)
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
                        return del__.findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, out logins, context__);
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
        public interface KPGroupDel_ : Ice.ObjectDel_
        {
            void Touch(bool isModified, _System.Collections.Generic.Dictionary<string, string> context__);
        }

        public interface KPDel_ : Ice.ObjectDel_
        {
            bool checkVersion(float keeFoxVersion, float keeICEVersion, out int result, _System.Collections.Generic.Dictionary<string, string> context__);

            string getDatabaseName(_System.Collections.Generic.Dictionary<string, string> context__);

            void AddLogin(KeeICE.KFlib.KPEntry login, _System.Collections.Generic.Dictionary<string, string> context__);

            void ModifyLogin(KeeICE.KFlib.KPEntry oldLogin, KeeICE.KFlib.KPEntry newLogin, _System.Collections.Generic.Dictionary<string, string> context__);

            int getAllLogins(out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__);

            int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__);

            int countLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, _System.Collections.Generic.Dictionary<string, string> context__);

            void addClient(Ice.Identity ident, _System.Collections.Generic.Dictionary<string, string> context__);
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
        public sealed class KPGroupDelM_ : Ice.ObjectDelM_, KPGroupDel_
        {
            public void Touch(bool isModified, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                IceInternal.Outgoing og__ = handler__.getOutgoing("Touch", Ice.OperationMode.Normal, context__);
                try
                {
                    try
                    {
                        IceInternal.BasicStream os__ = og__.ostr();
                        os__.writeBool(isModified);
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

        public sealed class KPDelM_ : Ice.ObjectDelM_, KPDel_
        {
            public void AddLogin(KeeICE.KFlib.KPEntry login, _System.Collections.Generic.Dictionary<string, string> context__)
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

            public int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__)
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
                            is__.startSeq(szx__, 7);
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
                            is__.startSeq(szx__, 7);
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
        public sealed class KPGroupDelD_ : Ice.ObjectDelD_, KPGroupDel_
        {
            public void Touch(bool isModified, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "Touch", Ice.OperationMode.Normal, context__);
                IceInternal.Direct.RunDelegate run__ = delegate(Ice.Object obj__)
                {
                    KPGroup servant__ = null;
                    try
                    {
                        servant__ = (KPGroup)obj__;
                    }
                    catch(_System.InvalidCastException)
                    {
                        throw new Ice.OperationNotExistException(current__.id, current__.facet, current__.operation);
                    }
                    servant__.Touch(isModified, current__);
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

        public sealed class KPDelD_ : Ice.ObjectDelD_, KPDel_
        {
            public void AddLogin(KeeICE.KFlib.KPEntry login, _System.Collections.Generic.Dictionary<string, string> context__)
            {
                Ice.Current current__ = new Ice.Current();
                initCurrent__(ref current__, "AddLogin", Ice.OperationMode.Normal, context__);
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
                        servant__.AddLogin(login, current__);
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

            public int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, out KeeICE.KFlib.KPEntry[] logins, _System.Collections.Generic.Dictionary<string, string> context__)
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
                        result__ = servant__.findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, out loginsHolder__, current__);
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
        public abstract class KPGroupDisp_ : Ice.ObjectImpl, KPGroup
        {
            #region Slice operations

            public void Touch(bool isModified)
            {
                Touch(isModified, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract void Touch(bool isModified, Ice.Current current__);

            #endregion

            #region Slice type-related members

            public static new string[] ids__ = 
            {
                "::Ice::Object",
                "::KeeICE::KFlib::KPGroup"
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

            public static Ice.DispatchStatus Touch___(KPGroup obj__, IceInternal.Incoming inS__, Ice.Current current__)
            {
                checkMode__(Ice.OperationMode.Normal, current__.mode);
                IceInternal.BasicStream is__ = inS__.istr();
                is__.startReadEncaps();
                bool isModified;
                isModified = is__.readBool();
                is__.endReadEncaps();
                obj__.Touch(isModified, current__);
                return Ice.DispatchStatus.DispatchOK;
            }

            private static string[] all__ =
            {
                "Touch",
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
                        return Touch___(this, inS__, current__);
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
                ex.reason = "type KeeICE::KFlib::KPGroup was not generated with stream support";
                throw ex;
            }

            public override void read__(Ice.InputStream inS__, bool rid__)
            {
                Ice.MarshalException ex = new Ice.MarshalException();
                ex.reason = "type KeeICE::KFlib::KPGroup was not generated with stream support";
                throw ex;
            }

            #endregion
        }

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

            public void AddLogin(KeeICE.KFlib.KPEntry login)
            {
                AddLogin(login, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract void AddLogin(KeeICE.KFlib.KPEntry login, Ice.Current current__);

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

            public int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, out KeeICE.KFlib.KPEntry[] logins)
            {
                return findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, out logins, Ice.ObjectImpl.defaultCurrent);
            }

            public abstract int findLogins(string hostname, string actionURL, string httpRealm, KeeICE.KFlib.loginSearchType lst, bool requireFullURLMatches, out KeeICE.KFlib.KPEntry[] logins, Ice.Current current__);

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
                is__.endReadEncaps();
                IceInternal.BasicStream os__ = inS__.ostr();
                try
                {
                    obj__.AddLogin(login, current__);
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
                is__.endReadEncaps();
                KeeICE.KFlib.KPEntry[] logins;
                IceInternal.BasicStream os__ = inS__.ostr();
                try
                {
                    int ret__ = obj__.findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, out logins, current__);
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

            private static string[] all__ =
            {
                "AddLogin",
                "ModifyLogin",
                "addClient",
                "checkVersion",
                "countLogins",
                "findLogins",
                "getAllLogins",
                "getDatabaseName",
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
                        return AddLogin___(this, inS__, current__);
                    }
                    case 1:
                    {
                        return ModifyLogin___(this, inS__, current__);
                    }
                    case 2:
                    {
                        return addClient___(this, inS__, current__);
                    }
                    case 3:
                    {
                        return checkVersion___(this, inS__, current__);
                    }
                    case 4:
                    {
                        return countLogins___(this, inS__, current__);
                    }
                    case 5:
                    {
                        return findLogins___(this, inS__, current__);
                    }
                    case 6:
                    {
                        return getAllLogins___(this, inS__, current__);
                    }
                    case 7:
                    {
                        return getDatabaseName___(this, inS__, current__);
                    }
                    case 8:
                    {
                        return ice_id___(this, inS__, current__);
                    }
                    case 9:
                    {
                        return ice_ids___(this, inS__, current__);
                    }
                    case 10:
                    {
                        return ice_isA___(this, inS__, current__);
                    }
                    case 11:
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
