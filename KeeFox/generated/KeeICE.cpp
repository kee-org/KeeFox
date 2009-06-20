// **********************************************************************
//
// Copyright (c) 2003-2007 ZeroC, Inc. All rights reserved.
//
// This copy of Ice-E is licensed to you under the terms described in the
// ICEE_LICENSE file included in this distribution.
//
// **********************************************************************

// Ice-E version 1.3.0
// Generated from file `KeeICE.ice'

#include <KeeICE.h>
#include <IceE/LocalException.h>
#include <IceE/ObjectFactory.h>
#include <IceE/BasicStream.h>
#include <IceE/LocalException.h>
#include <IceE/Iterator.h>

#ifndef ICEE_IGNORE_VERSION
#   if ICEE_INT_VERSION / 100 != 103
#       error IceE version mismatch!
#   endif
#   if ICEE_INT_VERSION % 100 < 0
#       error IceE patch level mismatch!
#   endif
#endif

static const ::std::string __KeeICE__KFlib__KP__checkVersion_name = "checkVersion";

static const ::std::string __KeeICE__KFlib__KP__getDatabaseName_name = "getDatabaseName";

static const ::std::string __KeeICE__KFlib__KP__getDatabaseFileName_name = "getDatabaseFileName";

static const ::std::string __KeeICE__KFlib__KP__changeDatabase_name = "changeDatabase";

static const ::std::string __KeeICE__KFlib__KP__AddLogin_name = "AddLogin";

static const ::std::string __KeeICE__KFlib__KP__ModifyLogin_name = "ModifyLogin";

static const ::std::string __KeeICE__KFlib__KP__getAllLogins_name = "getAllLogins";

static const ::std::string __KeeICE__KFlib__KP__findLogins_name = "findLogins";

static const ::std::string __KeeICE__KFlib__KP__countLogins_name = "countLogins";

static const ::std::string __KeeICE__KFlib__KP__addClient_name = "addClient";

static const ::std::string __KeeICE__KFlib__KP__findGroups_name = "findGroups";

static const ::std::string __KeeICE__KFlib__KP__getRoot_name = "getRoot";

static const ::std::string __KeeICE__KFlib__KP__getParent_name = "getParent";

static const ::std::string __KeeICE__KFlib__KP__getChildGroups_name = "getChildGroups";

static const ::std::string __KeeICE__KFlib__KP__getChildEntries_name = "getChildEntries";

static const ::std::string __KeeICE__KFlib__KP__addGroup_name = "addGroup";

static const ::std::string __KeeICE__KFlib__KP__removeGroup_name = "removeGroup";

static const ::std::string __KeeICE__KFlib__KP__removeEntry_name = "removeEntry";

static const ::std::string __KeeICE__KFlib__KP__LaunchGroupEditor_name = "LaunchGroupEditor";

static const ::std::string __KeeICE__KFlib__KP__LaunchLoginEditor_name = "LaunchLoginEditor";

static const ::std::string __KeeICE__KFlib__KP__getCurrentKFConfig_name = "getCurrentKFConfig";

static const ::std::string __KeeICE__KFlib__KP__setCurrentKFConfig_name = "setCurrentKFConfig";

static const ::std::string __KeeICE__KFlib__KP__setCurrentDBRootGroup_name = "setCurrentDBRootGroup";

static const ::std::string __KeeICE__KFlib__CallbackReceiver__callback_name = "callback";

::Ice::Object* IceInternal::upCast(::KeeICE::KFlib::KP* p) { return p; }
::IceProxy::Ice::Object* IceInternal::upCast(::IceProxy::KeeICE::KFlib::KP* p) { return p; }

::Ice::Object* IceInternal::upCast(::KeeICE::KFlib::CallbackReceiver* p) { return p; }
::IceProxy::Ice::Object* IceInternal::upCast(::IceProxy::KeeICE::KFlib::CallbackReceiver* p) { return p; }

void
KeeICE::KFlib::__read(::IceInternal::BasicStream* __is, ::KeeICE::KFlib::KPPrx& v)
{
    ::Ice::ObjectPrx proxy;
    __is->read(proxy);
    if(!proxy)
    {
        v = 0;
    }
    else
    {
        v = new ::IceProxy::KeeICE::KFlib::KP;
        v->__copyFrom(proxy);
    }
}

void
KeeICE::KFlib::__read(::IceInternal::BasicStream* __is, ::KeeICE::KFlib::CallbackReceiverPrx& v)
{
    ::Ice::ObjectPrx proxy;
    __is->read(proxy);
    if(!proxy)
    {
        v = 0;
    }
    else
    {
        v = new ::IceProxy::KeeICE::KFlib::CallbackReceiver;
        v->__copyFrom(proxy);
    }
}

void
KeeICE::KFlib::__write(::IceInternal::BasicStream* __os, ::KeeICE::KFlib::loginSearchType v)
{
    __os->write(static_cast< ::Ice::Byte>(v), 3);
}

void
KeeICE::KFlib::__read(::IceInternal::BasicStream* __is, ::KeeICE::KFlib::loginSearchType& v)
{
    ::Ice::Byte val;
    __is->read(val, 3);
    v = static_cast< ::KeeICE::KFlib::loginSearchType>(val);
}

void
KeeICE::KFlib::__write(::IceInternal::BasicStream* __os, ::KeeICE::KFlib::formFieldType v)
{
    __os->write(static_cast< ::Ice::Byte>(v), 6);
}

void
KeeICE::KFlib::__read(::IceInternal::BasicStream* __is, ::KeeICE::KFlib::formFieldType& v)
{
    ::Ice::Byte val;
    __is->read(val, 6);
    v = static_cast< ::KeeICE::KFlib::formFieldType>(val);
}

bool
KeeICE::KFlib::KPFormField::operator==(const KPFormField& __rhs) const
{
    if(this == &__rhs)
    {
        return true;
    }
    if(name != __rhs.name)
    {
        return false;
    }
    if(displayName != __rhs.displayName)
    {
        return false;
    }
    if(value != __rhs.value)
    {
        return false;
    }
    if(type != __rhs.type)
    {
        return false;
    }
    if(id != __rhs.id)
    {
        return false;
    }
    return true;
}

bool
KeeICE::KFlib::KPFormField::operator<(const KPFormField& __rhs) const
{
    if(this == &__rhs)
    {
        return false;
    }
    if(name < __rhs.name)
    {
        return true;
    }
    else if(__rhs.name < name)
    {
        return false;
    }
    if(displayName < __rhs.displayName)
    {
        return true;
    }
    else if(__rhs.displayName < displayName)
    {
        return false;
    }
    if(value < __rhs.value)
    {
        return true;
    }
    else if(__rhs.value < value)
    {
        return false;
    }
    if(type < __rhs.type)
    {
        return true;
    }
    else if(__rhs.type < type)
    {
        return false;
    }
    if(id < __rhs.id)
    {
        return true;
    }
    else if(__rhs.id < id)
    {
        return false;
    }
    return false;
}

void
KeeICE::KFlib::KPFormField::__write(::IceInternal::BasicStream* __os) const
{
    __os->write(name);
    __os->write(displayName);
    __os->write(value);
    ::KeeICE::KFlib::__write(__os, type);
    __os->write(id);
}

void
KeeICE::KFlib::KPFormField::__read(::IceInternal::BasicStream* __is)
{
    __is->read(name);
    __is->read(displayName);
    __is->read(value);
    ::KeeICE::KFlib::__read(__is, type);
    __is->read(id);
}

void
KeeICE::KFlib::__writeKPFormFieldList(::IceInternal::BasicStream* __os, const ::KeeICE::KFlib::KPFormField* begin, const ::KeeICE::KFlib::KPFormField* end)
{
    ::Ice::Int size = static_cast< ::Ice::Int>(end - begin);
    __os->writeSize(size);
    for(int i = 0; i < size; ++i)
    {
        begin[i].__write(__os);
    }
}

void
KeeICE::KFlib::__readKPFormFieldList(::IceInternal::BasicStream* __is, ::KeeICE::KFlib::KPFormFieldList& v)
{
    ::Ice::Int sz;
    __is->readSize(sz);
    __is->startSeq(sz, 5);
    v.resize(sz);
    for(int i = 0; i < sz; ++i)
    {
        v[i].__read(__is);
        __is->checkSeq();
        __is->endElement();
    }
    __is->endSeq(sz);
}

bool
KeeICE::KFlib::KPGroup::operator==(const KPGroup& __rhs) const
{
    if(this == &__rhs)
    {
        return true;
    }
    if(title != __rhs.title)
    {
        return false;
    }
    if(uniqueID != __rhs.uniqueID)
    {
        return false;
    }
    return true;
}

bool
KeeICE::KFlib::KPGroup::operator<(const KPGroup& __rhs) const
{
    if(this == &__rhs)
    {
        return false;
    }
    if(title < __rhs.title)
    {
        return true;
    }
    else if(__rhs.title < title)
    {
        return false;
    }
    if(uniqueID < __rhs.uniqueID)
    {
        return true;
    }
    else if(__rhs.uniqueID < uniqueID)
    {
        return false;
    }
    return false;
}

void
KeeICE::KFlib::KPGroup::__write(::IceInternal::BasicStream* __os) const
{
    __os->write(title);
    __os->write(uniqueID);
}

void
KeeICE::KFlib::KPGroup::__read(::IceInternal::BasicStream* __is)
{
    __is->read(title);
    __is->read(uniqueID);
}

void
KeeICE::KFlib::__writeKPGroupList(::IceInternal::BasicStream* __os, const ::KeeICE::KFlib::KPGroup* begin, const ::KeeICE::KFlib::KPGroup* end)
{
    ::Ice::Int size = static_cast< ::Ice::Int>(end - begin);
    __os->writeSize(size);
    for(int i = 0; i < size; ++i)
    {
        begin[i].__write(__os);
    }
}

void
KeeICE::KFlib::__readKPGroupList(::IceInternal::BasicStream* __is, ::KeeICE::KFlib::KPGroupList& v)
{
    ::Ice::Int sz;
    __is->readSize(sz);
    __is->startSeq(sz, 2);
    v.resize(sz);
    for(int i = 0; i < sz; ++i)
    {
        v[i].__read(__is);
        __is->checkSeq();
        __is->endElement();
    }
    __is->endSeq(sz);
}

bool
KeeICE::KFlib::KPEntry::operator==(const KPEntry& __rhs) const
{
    if(this == &__rhs)
    {
        return true;
    }
    if(URL != __rhs.URL)
    {
        return false;
    }
    if(formActionURL != __rhs.formActionURL)
    {
        return false;
    }
    if(HTTPRealm != __rhs.HTTPRealm)
    {
        return false;
    }
    if(title != __rhs.title)
    {
        return false;
    }
    if(formFieldList != __rhs.formFieldList)
    {
        return false;
    }
    if(_cpp_default != __rhs._cpp_default)
    {
        return false;
    }
    if(exactMatch != __rhs.exactMatch)
    {
        return false;
    }
    if(uniqueID != __rhs.uniqueID)
    {
        return false;
    }
    return true;
}

bool
KeeICE::KFlib::KPEntry::operator<(const KPEntry& __rhs) const
{
    if(this == &__rhs)
    {
        return false;
    }
    if(URL < __rhs.URL)
    {
        return true;
    }
    else if(__rhs.URL < URL)
    {
        return false;
    }
    if(formActionURL < __rhs.formActionURL)
    {
        return true;
    }
    else if(__rhs.formActionURL < formActionURL)
    {
        return false;
    }
    if(HTTPRealm < __rhs.HTTPRealm)
    {
        return true;
    }
    else if(__rhs.HTTPRealm < HTTPRealm)
    {
        return false;
    }
    if(title < __rhs.title)
    {
        return true;
    }
    else if(__rhs.title < title)
    {
        return false;
    }
    if(formFieldList < __rhs.formFieldList)
    {
        return true;
    }
    else if(__rhs.formFieldList < formFieldList)
    {
        return false;
    }
    if(_cpp_default < __rhs._cpp_default)
    {
        return true;
    }
    else if(__rhs._cpp_default < _cpp_default)
    {
        return false;
    }
    if(exactMatch < __rhs.exactMatch)
    {
        return true;
    }
    else if(__rhs.exactMatch < exactMatch)
    {
        return false;
    }
    if(uniqueID < __rhs.uniqueID)
    {
        return true;
    }
    else if(__rhs.uniqueID < uniqueID)
    {
        return false;
    }
    return false;
}

void
KeeICE::KFlib::KPEntry::__write(::IceInternal::BasicStream* __os) const
{
    __os->write(URL);
    __os->write(formActionURL);
    __os->write(HTTPRealm);
    __os->write(title);
    if(formFieldList.size() == 0)
    {
        __os->writeSize(0);
    }
    else
    {
        ::KeeICE::KFlib::__writeKPFormFieldList(__os, &formFieldList[0], &formFieldList[0] + formFieldList.size());
    }
    __os->write(_cpp_default);
    __os->write(exactMatch);
    __os->write(uniqueID);
}

void
KeeICE::KFlib::KPEntry::__read(::IceInternal::BasicStream* __is)
{
    __is->read(URL);
    __is->read(formActionURL);
    __is->read(HTTPRealm);
    __is->read(title);
    ::KeeICE::KFlib::__readKPFormFieldList(__is, formFieldList);
    __is->read(_cpp_default);
    __is->read(exactMatch);
    __is->read(uniqueID);
}

void
KeeICE::KFlib::__writeKPEntryList(::IceInternal::BasicStream* __os, const ::KeeICE::KFlib::KPEntry* begin, const ::KeeICE::KFlib::KPEntry* end)
{
    ::Ice::Int size = static_cast< ::Ice::Int>(end - begin);
    __os->writeSize(size);
    for(int i = 0; i < size; ++i)
    {
        begin[i].__write(__os);
    }
}

void
KeeICE::KFlib::__readKPEntryList(::IceInternal::BasicStream* __is, ::KeeICE::KFlib::KPEntryList& v)
{
    ::Ice::Int sz;
    __is->readSize(sz);
    __is->startSeq(sz, 8);
    v.resize(sz);
    for(int i = 0; i < sz; ++i)
    {
        v[i].__read(__is);
        __is->checkSeq();
        __is->endElement();
    }
    __is->endSeq(sz);
}

KeeICE::KFlib::KeeICEException::KeeICEException(const ::std::string& __ice_reason) :
    ::Ice::UserException(),
    reason(__ice_reason)
{
}

KeeICE::KFlib::KeeICEException::~KeeICEException() throw()
{
}

static const char* __KeeICE__KFlib__KeeICEException_name = "KeeICE::KFlib::KeeICEException";

::std::string
KeeICE::KFlib::KeeICEException::ice_name() const
{
    return __KeeICE__KFlib__KeeICEException_name;
}

::Ice::Exception*
KeeICE::KFlib::KeeICEException::ice_clone() const
{
    return new KeeICEException(*this);
}

void
KeeICE::KFlib::KeeICEException::ice_throw() const
{
    throw *this;
}

void
KeeICE::KFlib::KeeICEException::__write(::IceInternal::BasicStream* __os) const
{
    __os->write(::std::string("::KeeICE::KFlib::KeeICEException"), false);
    __os->startWriteSlice();
    __os->write(reason);
    __os->endWriteSlice();
}

void
KeeICE::KFlib::KeeICEException::__read(::IceInternal::BasicStream* __is, bool __rid)
{
    if(__rid)
    {
        ::std::string myId;
        __is->read(myId, false);
    }
    __is->startReadSlice();
    __is->read(reason);
    __is->endReadSlice();
}

struct __F__KeeICE__KFlib__KeeICEException : public ::IceInternal::UserExceptionFactory
{
    virtual void
    createAndThrow()
    {
        throw ::KeeICE::KFlib::KeeICEException();
    }
};

static ::IceInternal::UserExceptionFactoryPtr __F__KeeICE__KFlib__KeeICEException__Ptr = new __F__KeeICE__KFlib__KeeICEException;

const ::IceInternal::UserExceptionFactoryPtr&
KeeICE::KFlib::KeeICEException::ice_factory()
{
    return __F__KeeICE__KFlib__KeeICEException__Ptr;
}

class __F__KeeICE__KFlib__KeeICEException__Init
{
public:

    __F__KeeICE__KFlib__KeeICEException__Init()
    {
        ::IceInternal::factoryTable->addExceptionFactory("::KeeICE::KFlib::KeeICEException", ::KeeICE::KFlib::KeeICEException::ice_factory());
    }

    ~__F__KeeICE__KFlib__KeeICEException__Init()
    {
        ::IceInternal::factoryTable->removeExceptionFactory("::KeeICE::KFlib::KeeICEException");
    }
};

static __F__KeeICE__KFlib__KeeICEException__Init __F__KeeICE__KFlib__KeeICEException__i;

#ifdef __APPLE__
extern "C" { void __F__KeeICE__KFlib__KeeICEException__initializer() {} }
#endif

bool
KeeICE::KFlib::KFConfiguration::operator==(const KFConfiguration& __rhs) const
{
    if(this == &__rhs)
    {
        return true;
    }
    if(knownDatabases != __rhs.knownDatabases)
    {
        return false;
    }
    if(autoCommit != __rhs.autoCommit)
    {
        return false;
    }
    return true;
}

bool
KeeICE::KFlib::KFConfiguration::operator<(const KFConfiguration& __rhs) const
{
    if(this == &__rhs)
    {
        return false;
    }
    if(knownDatabases < __rhs.knownDatabases)
    {
        return true;
    }
    else if(__rhs.knownDatabases < knownDatabases)
    {
        return false;
    }
    if(autoCommit < __rhs.autoCommit)
    {
        return true;
    }
    else if(__rhs.autoCommit < autoCommit)
    {
        return false;
    }
    return false;
}

void
KeeICE::KFlib::KFConfiguration::__write(::IceInternal::BasicStream* __os) const
{
    if(knownDatabases.size() == 0)
    {
        __os->writeSize(0);
    }
    else
    {
        __os->write(&knownDatabases[0], &knownDatabases[0] + knownDatabases.size());
    }
    __os->write(autoCommit);
}

void
KeeICE::KFlib::KFConfiguration::__read(::IceInternal::BasicStream* __is)
{
    __is->read(knownDatabases);
    __is->read(autoCommit);
}

static const ::std::string __KeeICE__KFlib__KP_ids[2] =
{
    "::Ice::Object",
    "::KeeICE::KFlib::KP"
};

bool
KeeICE::KFlib::KP::ice_isA(const ::std::string& _s, const ::Ice::Current&) const
{
    return ::std::binary_search(__KeeICE__KFlib__KP_ids, __KeeICE__KFlib__KP_ids + 2, _s);
}

::std::vector< ::std::string>
KeeICE::KFlib::KP::ice_ids(const ::Ice::Current&) const
{
    return ::std::vector< ::std::string>(&__KeeICE__KFlib__KP_ids[0], &__KeeICE__KFlib__KP_ids[2]);
}

const ::std::string&
KeeICE::KFlib::KP::ice_id(const ::Ice::Current&) const
{
    return __KeeICE__KFlib__KP_ids[1];
}

const ::std::string&
KeeICE::KFlib::KP::ice_staticId()
{
    return __KeeICE__KFlib__KP_ids[1];
}

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___checkVersion(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::Ice::Float keeFoxVersion;
    ::Ice::Float keeICEVersion;
    __is->read(keeFoxVersion);
    __is->read(keeICEVersion);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::Ice::Int result;
    bool __ret = checkVersion(keeFoxVersion, keeICEVersion, result, __current);
    __os->write(result);
    __os->write(__ret);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___getDatabaseName(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::std::string __ret = getDatabaseName(__current);
    __os->write(__ret);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___getDatabaseFileName(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::std::string __ret = getDatabaseFileName(__current);
    __os->write(__ret);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___changeDatabase(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string fileName;
    bool closeCurrent;
    __is->read(fileName);
    __is->read(closeCurrent);
    changeDatabase(fileName, closeCurrent, __current);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___AddLogin(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::KeeICE::KFlib::KPEntry login;
    ::std::string parentUUID;
    login.__read(__is);
    __is->read(parentUUID);
    ::IceInternal::BasicStream* __os = __inS.os();
    try
    {
        ::KeeICE::KFlib::KPEntry __ret = AddLogin(login, parentUUID, __current);
        __ret.__write(__os);
    }
    catch(const ::KeeICE::KFlib::KeeICEException& __ex)
    {
        __os->write(__ex);
        return ::Ice::DispatchUserException;
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___ModifyLogin(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::KeeICE::KFlib::KPEntry oldLogin;
    ::KeeICE::KFlib::KPEntry newLogin;
    oldLogin.__read(__is);
    newLogin.__read(__is);
    ::IceInternal::BasicStream* __os = __inS.os();
    try
    {
        ModifyLogin(oldLogin, newLogin, __current);
    }
    catch(const ::KeeICE::KFlib::KeeICEException& __ex)
    {
        __os->write(__ex);
        return ::Ice::DispatchUserException;
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___getAllLogins(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KFlib::KPEntryList logins;
    try
    {
        ::Ice::Int __ret = getAllLogins(logins, __current);
        if(logins.size() == 0)
        {
            __os->writeSize(0);
        }
        else
        {
            ::KeeICE::KFlib::__writeKPEntryList(__os, &logins[0], &logins[0] + logins.size());
        }
        __os->write(__ret);
    }
    catch(const ::KeeICE::KFlib::KeeICEException& __ex)
    {
        __os->write(__ex);
        return ::Ice::DispatchUserException;
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___findLogins(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string hostname;
    ::std::string actionURL;
    ::std::string httpRealm;
    ::KeeICE::KFlib::loginSearchType lst;
    bool requireFullURLMatches;
    ::std::string uniqueID;
    __is->read(hostname);
    __is->read(actionURL);
    __is->read(httpRealm);
    ::KeeICE::KFlib::__read(__is, lst);
    __is->read(requireFullURLMatches);
    __is->read(uniqueID);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KFlib::KPEntryList logins;
    try
    {
        ::Ice::Int __ret = findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, uniqueID, logins, __current);
        if(logins.size() == 0)
        {
            __os->writeSize(0);
        }
        else
        {
            ::KeeICE::KFlib::__writeKPEntryList(__os, &logins[0], &logins[0] + logins.size());
        }
        __os->write(__ret);
    }
    catch(const ::KeeICE::KFlib::KeeICEException& __ex)
    {
        __os->write(__ex);
        return ::Ice::DispatchUserException;
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___countLogins(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string hostname;
    ::std::string actionURL;
    ::std::string httpRealm;
    ::KeeICE::KFlib::loginSearchType lst;
    bool requireFullURLMatches;
    __is->read(hostname);
    __is->read(actionURL);
    __is->read(httpRealm);
    ::KeeICE::KFlib::__read(__is, lst);
    __is->read(requireFullURLMatches);
    ::IceInternal::BasicStream* __os = __inS.os();
    try
    {
        ::Ice::Int __ret = countLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, __current);
        __os->write(__ret);
    }
    catch(const ::KeeICE::KFlib::KeeICEException& __ex)
    {
        __os->write(__ex);
        return ::Ice::DispatchUserException;
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___addClient(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::Ice::Identity ident;
    ident.__read(__is);
    addClient(ident, __current);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___findGroups(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string name;
    ::std::string uuid;
    __is->read(name);
    __is->read(uuid);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KFlib::KPGroupList groups;
    ::Ice::Int __ret = findGroups(name, uuid, groups, __current);
    if(groups.size() == 0)
    {
        __os->writeSize(0);
    }
    else
    {
        ::KeeICE::KFlib::__writeKPGroupList(__os, &groups[0], &groups[0] + groups.size());
    }
    __os->write(__ret);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___getRoot(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KFlib::KPGroup __ret = getRoot(__current);
    __ret.__write(__os);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___getParent(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string uuid;
    __is->read(uuid);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KFlib::KPGroup __ret = getParent(uuid, __current);
    __ret.__write(__os);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___getChildGroups(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string uuid;
    __is->read(uuid);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KFlib::KPGroupList __ret = getChildGroups(uuid, __current);
    if(__ret.size() == 0)
    {
        __os->writeSize(0);
    }
    else
    {
        ::KeeICE::KFlib::__writeKPGroupList(__os, &__ret[0], &__ret[0] + __ret.size());
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___getChildEntries(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string uuid;
    __is->read(uuid);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KFlib::KPEntryList __ret = getChildEntries(uuid, __current);
    if(__ret.size() == 0)
    {
        __os->writeSize(0);
    }
    else
    {
        ::KeeICE::KFlib::__writeKPEntryList(__os, &__ret[0], &__ret[0] + __ret.size());
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___addGroup(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string name;
    ::std::string parentUuid;
    __is->read(name);
    __is->read(parentUuid);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KFlib::KPGroup __ret = addGroup(name, parentUuid, __current);
    __ret.__write(__os);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___removeGroup(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string uuid;
    __is->read(uuid);
    ::IceInternal::BasicStream* __os = __inS.os();
    bool __ret = removeGroup(uuid, __current);
    __os->write(__ret);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___removeEntry(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string uuid;
    __is->read(uuid);
    ::IceInternal::BasicStream* __os = __inS.os();
    bool __ret = removeEntry(uuid, __current);
    __os->write(__ret);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___LaunchGroupEditor(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string uuid;
    __is->read(uuid);
    LaunchGroupEditor(uuid, __current);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___LaunchLoginEditor(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string uuid;
    __is->read(uuid);
    LaunchLoginEditor(uuid, __current);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___getCurrentKFConfig(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KFlib::KFConfiguration __ret = getCurrentKFConfig(__current);
    __ret.__write(__os);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___setCurrentKFConfig(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::KeeICE::KFlib::KFConfiguration config;
    config.__read(__is);
    ::IceInternal::BasicStream* __os = __inS.os();
    bool __ret = setCurrentKFConfig(config, __current);
    __os->write(__ret);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::KP::___setCurrentDBRootGroup(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string uuid;
    __is->read(uuid);
    ::IceInternal::BasicStream* __os = __inS.os();
    bool __ret = setCurrentDBRootGroup(uuid, __current);
    __os->write(__ret);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
static ::std::string __KeeICE__KFlib__KP_all[] =
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
    "getCurrentKFConfig",
    "getDatabaseFileName",
    "getDatabaseName",
    "getParent",
    "getRoot",
    "ice_id",
    "ice_ids",
    "ice_isA",
    "ice_ping",
    "removeEntry",
    "removeGroup",
    "setCurrentDBRootGroup",
    "setCurrentKFConfig"
};

::Ice::DispatchStatus
KeeICE::KFlib::KP::__dispatch(::IceInternal::Incoming& in, const ::Ice::Current& current)
{
    ::std::pair< ::std::string*, ::std::string*> r = ::std::equal_range(__KeeICE__KFlib__KP_all, __KeeICE__KFlib__KP_all + 27, current.operation);
    if(r.first == r.second)
    {
        throw Ice::OperationNotExistException(__FILE__, __LINE__, current.id, current.facet, current.operation);
    }

    switch(r.first - __KeeICE__KFlib__KP_all)
    {
        case 0:
        {
            return ___AddLogin(in, current);
        }
        case 1:
        {
            return ___LaunchGroupEditor(in, current);
        }
        case 2:
        {
            return ___LaunchLoginEditor(in, current);
        }
        case 3:
        {
            return ___ModifyLogin(in, current);
        }
        case 4:
        {
            return ___addClient(in, current);
        }
        case 5:
        {
            return ___addGroup(in, current);
        }
        case 6:
        {
            return ___changeDatabase(in, current);
        }
        case 7:
        {
            return ___checkVersion(in, current);
        }
        case 8:
        {
            return ___countLogins(in, current);
        }
        case 9:
        {
            return ___findGroups(in, current);
        }
        case 10:
        {
            return ___findLogins(in, current);
        }
        case 11:
        {
            return ___getAllLogins(in, current);
        }
        case 12:
        {
            return ___getChildEntries(in, current);
        }
        case 13:
        {
            return ___getChildGroups(in, current);
        }
        case 14:
        {
            return ___getCurrentKFConfig(in, current);
        }
        case 15:
        {
            return ___getDatabaseFileName(in, current);
        }
        case 16:
        {
            return ___getDatabaseName(in, current);
        }
        case 17:
        {
            return ___getParent(in, current);
        }
        case 18:
        {
            return ___getRoot(in, current);
        }
        case 19:
        {
            return ___ice_id(in, current);
        }
        case 20:
        {
            return ___ice_ids(in, current);
        }
        case 21:
        {
            return ___ice_isA(in, current);
        }
        case 22:
        {
            return ___ice_ping(in, current);
        }
        case 23:
        {
            return ___removeEntry(in, current);
        }
        case 24:
        {
            return ___removeGroup(in, current);
        }
        case 25:
        {
            return ___setCurrentDBRootGroup(in, current);
        }
        case 26:
        {
            return ___setCurrentKFConfig(in, current);
        }
    }

    assert(false);
    throw Ice::OperationNotExistException(__FILE__, __LINE__, current.id, current.facet, current.operation);
}
#endif // ICEE_PURE_CLIENT

void
KeeICE::KFlib::KP::__write(::IceInternal::BasicStream* __os) const
{
    __os->writeTypeId(ice_staticId());
    __os->startWriteSlice();
    __os->endWriteSlice();
    ::Ice::Object::__write(__os);
}

void
KeeICE::KFlib::KP::__read(::IceInternal::BasicStream* __is, bool __rid)
{
    if(__rid)
    {
        ::std::string myId;
        __is->readTypeId(myId);
    }
    __is->startReadSlice();
    __is->endReadSlice();
    ::Ice::Object::__read(__is, true);
}


bool
KeeICE::KFlib::operator==(const ::KeeICE::KFlib::KP& l, const ::KeeICE::KFlib::KP& r)
{
    return static_cast<const ::Ice::Object&>(l) == static_cast<const ::Ice::Object&>(r);
}

bool
KeeICE::KFlib::operator<(const ::KeeICE::KFlib::KP& l, const ::KeeICE::KFlib::KP& r)
{
    return static_cast<const ::Ice::Object&>(l) < static_cast<const ::Ice::Object&>(r);
}

void 
KeeICE::KFlib::__patch__KPPtr(void* __addr, ::Ice::ObjectPtr& v)
{
    ::KeeICE::KFlib::KPPtr* p = static_cast< ::KeeICE::KFlib::KPPtr*>(__addr);
    assert(p);
    *p = ::KeeICE::KFlib::KPPtr::dynamicCast(v);
    if(v && !*p)
    {
        IceInternal::Ex::throwUOE(::KeeICE::KFlib::KP::ice_staticId(), v->ice_id());
    }
}

static const ::std::string __KeeICE__KFlib__CallbackReceiver_ids[2] =
{
    "::Ice::Object",
    "::KeeICE::KFlib::CallbackReceiver"
};

bool
KeeICE::KFlib::CallbackReceiver::ice_isA(const ::std::string& _s, const ::Ice::Current&) const
{
    return ::std::binary_search(__KeeICE__KFlib__CallbackReceiver_ids, __KeeICE__KFlib__CallbackReceiver_ids + 2, _s);
}

::std::vector< ::std::string>
KeeICE::KFlib::CallbackReceiver::ice_ids(const ::Ice::Current&) const
{
    return ::std::vector< ::std::string>(&__KeeICE__KFlib__CallbackReceiver_ids[0], &__KeeICE__KFlib__CallbackReceiver_ids[2]);
}

const ::std::string&
KeeICE::KFlib::CallbackReceiver::ice_id(const ::Ice::Current&) const
{
    return __KeeICE__KFlib__CallbackReceiver_ids[1];
}

const ::std::string&
KeeICE::KFlib::CallbackReceiver::ice_staticId()
{
    return __KeeICE__KFlib__CallbackReceiver_ids[1];
}

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KFlib::CallbackReceiver::___callback(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::Ice::Int num;
    __is->read(num);
    callback(num, __current);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
static ::std::string __KeeICE__KFlib__CallbackReceiver_all[] =
{
    "callback",
    "ice_id",
    "ice_ids",
    "ice_isA",
    "ice_ping"
};

::Ice::DispatchStatus
KeeICE::KFlib::CallbackReceiver::__dispatch(::IceInternal::Incoming& in, const ::Ice::Current& current)
{
    ::std::pair< ::std::string*, ::std::string*> r = ::std::equal_range(__KeeICE__KFlib__CallbackReceiver_all, __KeeICE__KFlib__CallbackReceiver_all + 5, current.operation);
    if(r.first == r.second)
    {
        throw Ice::OperationNotExistException(__FILE__, __LINE__, current.id, current.facet, current.operation);
    }

    switch(r.first - __KeeICE__KFlib__CallbackReceiver_all)
    {
        case 0:
        {
            return ___callback(in, current);
        }
        case 1:
        {
            return ___ice_id(in, current);
        }
        case 2:
        {
            return ___ice_ids(in, current);
        }
        case 3:
        {
            return ___ice_isA(in, current);
        }
        case 4:
        {
            return ___ice_ping(in, current);
        }
    }

    assert(false);
    throw Ice::OperationNotExistException(__FILE__, __LINE__, current.id, current.facet, current.operation);
}
#endif // ICEE_PURE_CLIENT

void
KeeICE::KFlib::CallbackReceiver::__write(::IceInternal::BasicStream* __os) const
{
    __os->writeTypeId(ice_staticId());
    __os->startWriteSlice();
    __os->endWriteSlice();
    ::Ice::Object::__write(__os);
}

void
KeeICE::KFlib::CallbackReceiver::__read(::IceInternal::BasicStream* __is, bool __rid)
{
    if(__rid)
    {
        ::std::string myId;
        __is->readTypeId(myId);
    }
    __is->startReadSlice();
    __is->endReadSlice();
    ::Ice::Object::__read(__is, true);
}


bool
KeeICE::KFlib::operator==(const ::KeeICE::KFlib::CallbackReceiver& l, const ::KeeICE::KFlib::CallbackReceiver& r)
{
    return static_cast<const ::Ice::Object&>(l) == static_cast<const ::Ice::Object&>(r);
}

bool
KeeICE::KFlib::operator<(const ::KeeICE::KFlib::CallbackReceiver& l, const ::KeeICE::KFlib::CallbackReceiver& r)
{
    return static_cast<const ::Ice::Object&>(l) < static_cast<const ::Ice::Object&>(r);
}

void 
KeeICE::KFlib::__patch__CallbackReceiverPtr(void* __addr, ::Ice::ObjectPtr& v)
{
    ::KeeICE::KFlib::CallbackReceiverPtr* p = static_cast< ::KeeICE::KFlib::CallbackReceiverPtr*>(__addr);
    assert(p);
    *p = ::KeeICE::KFlib::CallbackReceiverPtr::dynamicCast(v);
    if(v && !*p)
    {
        IceInternal::Ex::throwUOE(::KeeICE::KFlib::CallbackReceiver::ice_staticId(), v->ice_id());
    }
}

bool
IceProxy::KeeICE::KFlib::KP::checkVersion(::Ice::Float keeFoxVersion, ::Ice::Float keeICEVersion, ::Ice::Int& result, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__checkVersion_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__checkVersion_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(keeFoxVersion);
                __os->write(keeICEVersion);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                bool __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                __is->read(result);
                __is->read(__ret);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

::std::string
IceProxy::KeeICE::KFlib::KP::getDatabaseName(const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getDatabaseName_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__getDatabaseName_name, ::Ice::Normal, __ctx);
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                ::std::string __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                __is->read(__ret);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

::std::string
IceProxy::KeeICE::KFlib::KP::getDatabaseFileName(const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getDatabaseFileName_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__getDatabaseFileName_name, ::Ice::Normal, __ctx);
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                ::std::string __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                __is->read(__ret);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

void
IceProxy::KeeICE::KFlib::KP::changeDatabase(const ::std::string& fileName, bool closeCurrent, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__changeDatabase_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(fileName);
                __os->write(closeCurrent);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
            return;
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

::KeeICE::KFlib::KPEntry
IceProxy::KeeICE::KFlib::KP::AddLogin(const ::KeeICE::KFlib::KPEntry& login, const ::std::string& parentUUID, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__AddLogin_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__AddLogin_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                login.__write(__os);
                __os->write(parentUUID);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    try
                    {
                        __outS.is()->throwException();
                    }
                    catch(const ::KeeICE::KFlib::KeeICEException&)
                    {
                        throw;
                    }
                    catch(const ::Ice::UserException& __ex)
                    {
                        ::Ice::UnknownUserException __uex(__FILE__, __LINE__);
                        __uex.unknown = __ex.ice_name();
                        throw __uex;
                    }
                }
                ::KeeICE::KFlib::KPEntry __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                __ret.__read(__is);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

void
IceProxy::KeeICE::KFlib::KP::ModifyLogin(const ::KeeICE::KFlib::KPEntry& oldLogin, const ::KeeICE::KFlib::KPEntry& newLogin, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__ModifyLogin_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__ModifyLogin_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                oldLogin.__write(__os);
                newLogin.__write(__os);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    try
                    {
                        __outS.is()->throwException();
                    }
                    catch(const ::KeeICE::KFlib::KeeICEException&)
                    {
                        throw;
                    }
                    catch(const ::Ice::UserException& __ex)
                    {
                        ::Ice::UnknownUserException __uex(__FILE__, __LINE__);
                        __uex.unknown = __ex.ice_name();
                        throw __uex;
                    }
                }
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
            return;
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

::Ice::Int
IceProxy::KeeICE::KFlib::KP::getAllLogins(::KeeICE::KFlib::KPEntryList& logins, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getAllLogins_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__getAllLogins_name, ::Ice::Normal, __ctx);
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    try
                    {
                        __outS.is()->throwException();
                    }
                    catch(const ::KeeICE::KFlib::KeeICEException&)
                    {
                        throw;
                    }
                    catch(const ::Ice::UserException& __ex)
                    {
                        ::Ice::UnknownUserException __uex(__FILE__, __LINE__);
                        __uex.unknown = __ex.ice_name();
                        throw __uex;
                    }
                }
                ::Ice::Int __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                ::KeeICE::KFlib::__readKPEntryList(__is, logins);
                __is->read(__ret);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

::Ice::Int
IceProxy::KeeICE::KFlib::KP::findLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches, const ::std::string& uniqueID, ::KeeICE::KFlib::KPEntryList& logins, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__findLogins_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__findLogins_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(hostname);
                __os->write(actionURL);
                __os->write(httpRealm);
                ::KeeICE::KFlib::__write(__os, lst);
                __os->write(requireFullURLMatches);
                __os->write(uniqueID);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    try
                    {
                        __outS.is()->throwException();
                    }
                    catch(const ::KeeICE::KFlib::KeeICEException&)
                    {
                        throw;
                    }
                    catch(const ::Ice::UserException& __ex)
                    {
                        ::Ice::UnknownUserException __uex(__FILE__, __LINE__);
                        __uex.unknown = __ex.ice_name();
                        throw __uex;
                    }
                }
                ::Ice::Int __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                ::KeeICE::KFlib::__readKPEntryList(__is, logins);
                __is->read(__ret);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

::Ice::Int
IceProxy::KeeICE::KFlib::KP::countLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__countLogins_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__countLogins_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(hostname);
                __os->write(actionURL);
                __os->write(httpRealm);
                ::KeeICE::KFlib::__write(__os, lst);
                __os->write(requireFullURLMatches);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    try
                    {
                        __outS.is()->throwException();
                    }
                    catch(const ::KeeICE::KFlib::KeeICEException&)
                    {
                        throw;
                    }
                    catch(const ::Ice::UserException& __ex)
                    {
                        ::Ice::UnknownUserException __uex(__FILE__, __LINE__);
                        __uex.unknown = __ex.ice_name();
                        throw __uex;
                    }
                }
                ::Ice::Int __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                __is->read(__ret);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

void
IceProxy::KeeICE::KFlib::KP::addClient(const ::Ice::Identity& ident, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__addClient_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                ident.__write(__os);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
            return;
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

::Ice::Int
IceProxy::KeeICE::KFlib::KP::findGroups(const ::std::string& name, const ::std::string& uuid, ::KeeICE::KFlib::KPGroupList& groups, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__findGroups_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__findGroups_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(name);
                __os->write(uuid);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                ::Ice::Int __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                ::KeeICE::KFlib::__readKPGroupList(__is, groups);
                __is->read(__ret);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

::KeeICE::KFlib::KPGroup
IceProxy::KeeICE::KFlib::KP::getRoot(const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getRoot_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__getRoot_name, ::Ice::Normal, __ctx);
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                ::KeeICE::KFlib::KPGroup __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                __ret.__read(__is);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

::KeeICE::KFlib::KPGroup
IceProxy::KeeICE::KFlib::KP::getParent(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getParent_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__getParent_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(uuid);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                ::KeeICE::KFlib::KPGroup __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                __ret.__read(__is);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

::KeeICE::KFlib::KPGroupList
IceProxy::KeeICE::KFlib::KP::getChildGroups(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getChildGroups_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__getChildGroups_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(uuid);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                ::KeeICE::KFlib::KPGroupList __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                ::KeeICE::KFlib::__readKPGroupList(__is, __ret);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

::KeeICE::KFlib::KPEntryList
IceProxy::KeeICE::KFlib::KP::getChildEntries(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getChildEntries_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__getChildEntries_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(uuid);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                ::KeeICE::KFlib::KPEntryList __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                ::KeeICE::KFlib::__readKPEntryList(__is, __ret);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

::KeeICE::KFlib::KPGroup
IceProxy::KeeICE::KFlib::KP::addGroup(const ::std::string& name, const ::std::string& parentUuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__addGroup_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__addGroup_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(name);
                __os->write(parentUuid);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                ::KeeICE::KFlib::KPGroup __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                __ret.__read(__is);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

bool
IceProxy::KeeICE::KFlib::KP::removeGroup(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__removeGroup_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__removeGroup_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(uuid);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                bool __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                __is->read(__ret);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

bool
IceProxy::KeeICE::KFlib::KP::removeEntry(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__removeEntry_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__removeEntry_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(uuid);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                bool __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                __is->read(__ret);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

void
IceProxy::KeeICE::KFlib::KP::LaunchGroupEditor(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__LaunchGroupEditor_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(uuid);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
            return;
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

void
IceProxy::KeeICE::KFlib::KP::LaunchLoginEditor(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__LaunchLoginEditor_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(uuid);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
            return;
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

::KeeICE::KFlib::KFConfiguration
IceProxy::KeeICE::KFlib::KP::getCurrentKFConfig(const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getCurrentKFConfig_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__getCurrentKFConfig_name, ::Ice::Normal, __ctx);
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                ::KeeICE::KFlib::KFConfiguration __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                __ret.__read(__is);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

bool
IceProxy::KeeICE::KFlib::KP::setCurrentKFConfig(const ::KeeICE::KFlib::KFConfiguration& config, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__setCurrentKFConfig_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__setCurrentKFConfig_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                config.__write(__os);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                bool __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                __is->read(__ret);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

bool
IceProxy::KeeICE::KFlib::KP::setCurrentDBRootGroup(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__setCurrentDBRootGroup_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__KP__setCurrentDBRootGroup_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(uuid);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                bool __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                __is->read(__ret);
                return __ret;
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

const ::std::string&
IceProxy::KeeICE::KFlib::KP::ice_staticId()
{
    return __KeeICE__KFlib__KP_ids[1];
}

::IceProxy::Ice::Object*
IceProxy::KeeICE::KFlib::KP::__newInstance() const
{
    return new KP;
}

void
IceProxy::KeeICE::KFlib::CallbackReceiver::callback(::Ice::Int num, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KFlib__CallbackReceiver__callback_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(num);
            }
            catch(const ::Ice::LocalException& __ex)
            {
                __outS.abort(__ex);
            }
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
            }
            catch(const ::Ice::LocalException& __ex)
            {
                throw ::IceInternal::LocalExceptionWrapper(__ex, false);
            }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
            catch(...)
            {
                throw;
            }
#endif
            return;
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__handler, __ex);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__handler, __ex, __cnt);
        }
#if defined(_MSC_VER) && defined(_M_ARM) // ARM bug.
        catch(...)
        {
            throw;
        }
#endif
    }
}

const ::std::string&
IceProxy::KeeICE::KFlib::CallbackReceiver::ice_staticId()
{
    return __KeeICE__KFlib__CallbackReceiver_ids[1];
}

::IceProxy::Ice::Object*
IceProxy::KeeICE::KFlib::CallbackReceiver::__newInstance() const
{
    return new CallbackReceiver;
}
