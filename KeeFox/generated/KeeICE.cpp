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

static const ::std::string __KeeICE__KPlib__KP__checkVersion_name = "checkVersion";

static const ::std::string __KeeICE__KPlib__KP__getDatabaseName_name = "getDatabaseName";

static const ::std::string __KeeICE__KPlib__KP__getDatabaseFileName_name = "getDatabaseFileName";

static const ::std::string __KeeICE__KPlib__KP__changeDatabase_name = "changeDatabase";

static const ::std::string __KeeICE__KPlib__KP__AddLogin_name = "AddLogin";

static const ::std::string __KeeICE__KPlib__KP__ModifyLogin_name = "ModifyLogin";

static const ::std::string __KeeICE__KPlib__KP__getAllLogins_name = "getAllLogins";

static const ::std::string __KeeICE__KPlib__KP__findLogins_name = "findLogins";

static const ::std::string __KeeICE__KPlib__KP__countLogins_name = "countLogins";

static const ::std::string __KeeICE__KPlib__KP__addClient_name = "addClient";

static const ::std::string __KeeICE__KPlib__KP__findGroups_name = "findGroups";

static const ::std::string __KeeICE__KPlib__KP__getRoot_name = "getRoot";

static const ::std::string __KeeICE__KPlib__KP__getParent_name = "getParent";

static const ::std::string __KeeICE__KPlib__KP__getChildGroups_name = "getChildGroups";

static const ::std::string __KeeICE__KPlib__KP__getChildEntries_name = "getChildEntries";

static const ::std::string __KeeICE__KPlib__KP__addGroup_name = "addGroup";

static const ::std::string __KeeICE__KPlib__KP__removeGroup_name = "removeGroup";

static const ::std::string __KeeICE__KPlib__KP__removeEntry_name = "removeEntry";

static const ::std::string __KeeICE__KPlib__KP__LaunchGroupEditor_name = "LaunchGroupEditor";

static const ::std::string __KeeICE__KPlib__KP__LaunchLoginEditor_name = "LaunchLoginEditor";

static const ::std::string __KeeICE__KPlib__KP__getCurrentKFConfig_name = "getCurrentKFConfig";

static const ::std::string __KeeICE__KPlib__KP__setCurrentKFConfig_name = "setCurrentKFConfig";

static const ::std::string __KeeICE__KPlib__KP__setCurrentDBRootGroup_name = "setCurrentDBRootGroup";

static const ::std::string __KeeICE__KPlib__CallbackReceiver__callback_name = "callback";

::Ice::Object* IceInternal::upCast(::KeeICE::KPlib::KP* p) { return p; }
::IceProxy::Ice::Object* IceInternal::upCast(::IceProxy::KeeICE::KPlib::KP* p) { return p; }

::Ice::Object* IceInternal::upCast(::KeeICE::KPlib::CallbackReceiver* p) { return p; }
::IceProxy::Ice::Object* IceInternal::upCast(::IceProxy::KeeICE::KPlib::CallbackReceiver* p) { return p; }

void
KeeICE::KPlib::__read(::IceInternal::BasicStream* __is, ::KeeICE::KPlib::KPPrx& v)
{
    ::Ice::ObjectPrx proxy;
    __is->read(proxy);
    if(!proxy)
    {
        v = 0;
    }
    else
    {
        v = new ::IceProxy::KeeICE::KPlib::KP;
        v->__copyFrom(proxy);
    }
}

void
KeeICE::KPlib::__read(::IceInternal::BasicStream* __is, ::KeeICE::KPlib::CallbackReceiverPrx& v)
{
    ::Ice::ObjectPrx proxy;
    __is->read(proxy);
    if(!proxy)
    {
        v = 0;
    }
    else
    {
        v = new ::IceProxy::KeeICE::KPlib::CallbackReceiver;
        v->__copyFrom(proxy);
    }
}

void
KeeICE::KPlib::__write(::IceInternal::BasicStream* __os, ::KeeICE::KPlib::loginSearchType v)
{
    __os->write(static_cast< ::Ice::Byte>(v), 3);
}

void
KeeICE::KPlib::__read(::IceInternal::BasicStream* __is, ::KeeICE::KPlib::loginSearchType& v)
{
    ::Ice::Byte val;
    __is->read(val, 3);
    v = static_cast< ::KeeICE::KPlib::loginSearchType>(val);
}

void
KeeICE::KPlib::__write(::IceInternal::BasicStream* __os, ::KeeICE::KPlib::formFieldType v)
{
    __os->write(static_cast< ::Ice::Byte>(v), 6);
}

void
KeeICE::KPlib::__read(::IceInternal::BasicStream* __is, ::KeeICE::KPlib::formFieldType& v)
{
    ::Ice::Byte val;
    __is->read(val, 6);
    v = static_cast< ::KeeICE::KPlib::formFieldType>(val);
}

bool
KeeICE::KPlib::KPFormField::operator==(const KPFormField& __rhs) const
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
    if(page != __rhs.page)
    {
        return false;
    }
    return true;
}

bool
KeeICE::KPlib::KPFormField::operator<(const KPFormField& __rhs) const
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
    if(page < __rhs.page)
    {
        return true;
    }
    else if(__rhs.page < page)
    {
        return false;
    }
    return false;
}

void
KeeICE::KPlib::KPFormField::__write(::IceInternal::BasicStream* __os) const
{
    __os->write(name);
    __os->write(displayName);
    __os->write(value);
    ::KeeICE::KPlib::__write(__os, type);
    __os->write(id);
    __os->write(page);
}

void
KeeICE::KPlib::KPFormField::__read(::IceInternal::BasicStream* __is)
{
    __is->read(name);
    __is->read(displayName);
    __is->read(value);
    ::KeeICE::KPlib::__read(__is, type);
    __is->read(id);
    __is->read(page);
}

void
KeeICE::KPlib::__writeKPFormFieldList(::IceInternal::BasicStream* __os, const ::KeeICE::KPlib::KPFormField* begin, const ::KeeICE::KPlib::KPFormField* end)
{
    ::Ice::Int size = static_cast< ::Ice::Int>(end - begin);
    __os->writeSize(size);
    for(int i = 0; i < size; ++i)
    {
        begin[i].__write(__os);
    }
}

void
KeeICE::KPlib::__readKPFormFieldList(::IceInternal::BasicStream* __is, ::KeeICE::KPlib::KPFormFieldList& v)
{
    ::Ice::Int sz;
    __is->readSize(sz);
    __is->startSeq(sz, 9);
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
KeeICE::KPlib::KPGroup::operator==(const KPGroup& __rhs) const
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
KeeICE::KPlib::KPGroup::operator<(const KPGroup& __rhs) const
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
KeeICE::KPlib::KPGroup::__write(::IceInternal::BasicStream* __os) const
{
    __os->write(title);
    __os->write(uniqueID);
}

void
KeeICE::KPlib::KPGroup::__read(::IceInternal::BasicStream* __is)
{
    __is->read(title);
    __is->read(uniqueID);
}

void
KeeICE::KPlib::__writeKPGroupList(::IceInternal::BasicStream* __os, const ::KeeICE::KPlib::KPGroup* begin, const ::KeeICE::KPlib::KPGroup* end)
{
    ::Ice::Int size = static_cast< ::Ice::Int>(end - begin);
    __os->writeSize(size);
    for(int i = 0; i < size; ++i)
    {
        begin[i].__write(__os);
    }
}

void
KeeICE::KPlib::__readKPGroupList(::IceInternal::BasicStream* __is, ::KeeICE::KPlib::KPGroupList& v)
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
KeeICE::KPlib::KPEntry::operator==(const KPEntry& __rhs) const
{
    if(this == &__rhs)
    {
        return true;
    }
    if(URLs != __rhs.URLs)
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
KeeICE::KPlib::KPEntry::operator<(const KPEntry& __rhs) const
{
    if(this == &__rhs)
    {
        return false;
    }
    if(URLs < __rhs.URLs)
    {
        return true;
    }
    else if(__rhs.URLs < URLs)
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
KeeICE::KPlib::KPEntry::__write(::IceInternal::BasicStream* __os) const
{
    if(URLs.size() == 0)
    {
        __os->writeSize(0);
    }
    else
    {
        __os->write(&URLs[0], &URLs[0] + URLs.size());
    }
    __os->write(formActionURL);
    __os->write(HTTPRealm);
    __os->write(title);
    if(formFieldList.size() == 0)
    {
        __os->writeSize(0);
    }
    else
    {
        ::KeeICE::KPlib::__writeKPFormFieldList(__os, &formFieldList[0], &formFieldList[0] + formFieldList.size());
    }
    __os->write(_cpp_default);
    __os->write(exactMatch);
    __os->write(uniqueID);
}

void
KeeICE::KPlib::KPEntry::__read(::IceInternal::BasicStream* __is)
{
    __is->read(URLs);
    __is->read(formActionURL);
    __is->read(HTTPRealm);
    __is->read(title);
    ::KeeICE::KPlib::__readKPFormFieldList(__is, formFieldList);
    __is->read(_cpp_default);
    __is->read(exactMatch);
    __is->read(uniqueID);
}

void
KeeICE::KPlib::__writeKPEntryList(::IceInternal::BasicStream* __os, const ::KeeICE::KPlib::KPEntry* begin, const ::KeeICE::KPlib::KPEntry* end)
{
    ::Ice::Int size = static_cast< ::Ice::Int>(end - begin);
    __os->writeSize(size);
    for(int i = 0; i < size; ++i)
    {
        begin[i].__write(__os);
    }
}

void
KeeICE::KPlib::__readKPEntryList(::IceInternal::BasicStream* __is, ::KeeICE::KPlib::KPEntryList& v)
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

KeeICE::KPlib::KeeICEException::KeeICEException(const ::std::string& __ice_reason) :
    ::Ice::UserException(),
    reason(__ice_reason)
{
}

KeeICE::KPlib::KeeICEException::~KeeICEException() throw()
{
}

static const char* __KeeICE__KPlib__KeeICEException_name = "KeeICE::KPlib::KeeICEException";

::std::string
KeeICE::KPlib::KeeICEException::ice_name() const
{
    return __KeeICE__KPlib__KeeICEException_name;
}

::Ice::Exception*
KeeICE::KPlib::KeeICEException::ice_clone() const
{
    return new KeeICEException(*this);
}

void
KeeICE::KPlib::KeeICEException::ice_throw() const
{
    throw *this;
}

void
KeeICE::KPlib::KeeICEException::__write(::IceInternal::BasicStream* __os) const
{
    __os->write(::std::string("::KeeICE::KPlib::KeeICEException"), false);
    __os->startWriteSlice();
    __os->write(reason);
    __os->endWriteSlice();
}

void
KeeICE::KPlib::KeeICEException::__read(::IceInternal::BasicStream* __is, bool __rid)
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

struct __F__KeeICE__KPlib__KeeICEException : public ::IceInternal::UserExceptionFactory
{
    virtual void
    createAndThrow()
    {
        throw ::KeeICE::KPlib::KeeICEException();
    }
};

static ::IceInternal::UserExceptionFactoryPtr __F__KeeICE__KPlib__KeeICEException__Ptr = new __F__KeeICE__KPlib__KeeICEException;

const ::IceInternal::UserExceptionFactoryPtr&
KeeICE::KPlib::KeeICEException::ice_factory()
{
    return __F__KeeICE__KPlib__KeeICEException__Ptr;
}

class __F__KeeICE__KPlib__KeeICEException__Init
{
public:

    __F__KeeICE__KPlib__KeeICEException__Init()
    {
        ::IceInternal::factoryTable->addExceptionFactory("::KeeICE::KPlib::KeeICEException", ::KeeICE::KPlib::KeeICEException::ice_factory());
    }

    ~__F__KeeICE__KPlib__KeeICEException__Init()
    {
        ::IceInternal::factoryTable->removeExceptionFactory("::KeeICE::KPlib::KeeICEException");
    }
};

static __F__KeeICE__KPlib__KeeICEException__Init __F__KeeICE__KPlib__KeeICEException__i;

#ifdef __APPLE__
extern "C" { void __F__KeeICE__KPlib__KeeICEException__initializer() {} }
#endif

bool
KeeICE::KPlib::KFConfiguration::operator==(const KFConfiguration& __rhs) const
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
KeeICE::KPlib::KFConfiguration::operator<(const KFConfiguration& __rhs) const
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
KeeICE::KPlib::KFConfiguration::__write(::IceInternal::BasicStream* __os) const
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
KeeICE::KPlib::KFConfiguration::__read(::IceInternal::BasicStream* __is)
{
    __is->read(knownDatabases);
    __is->read(autoCommit);
}

static const ::std::string __KeeICE__KPlib__KP_ids[2] =
{
    "::Ice::Object",
    "::KeeICE::KPlib::KP"
};

bool
KeeICE::KPlib::KP::ice_isA(const ::std::string& _s, const ::Ice::Current&) const
{
    return ::std::binary_search(__KeeICE__KPlib__KP_ids, __KeeICE__KPlib__KP_ids + 2, _s);
}

::std::vector< ::std::string>
KeeICE::KPlib::KP::ice_ids(const ::Ice::Current&) const
{
    return ::std::vector< ::std::string>(&__KeeICE__KPlib__KP_ids[0], &__KeeICE__KPlib__KP_ids[2]);
}

const ::std::string&
KeeICE::KPlib::KP::ice_id(const ::Ice::Current&) const
{
    return __KeeICE__KPlib__KP_ids[1];
}

const ::std::string&
KeeICE::KPlib::KP::ice_staticId()
{
    return __KeeICE__KPlib__KP_ids[1];
}

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___checkVersion(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
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
KeeICE::KPlib::KP::___getDatabaseName(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
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
KeeICE::KPlib::KP::___getDatabaseFileName(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
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
KeeICE::KPlib::KP::___changeDatabase(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
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
KeeICE::KPlib::KP::___AddLogin(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::KeeICE::KPlib::KPEntry login;
    ::std::string parentUUID;
    login.__read(__is);
    __is->read(parentUUID);
    ::IceInternal::BasicStream* __os = __inS.os();
    try
    {
        ::KeeICE::KPlib::KPEntry __ret = AddLogin(login, parentUUID, __current);
        __ret.__write(__os);
    }
    catch(const ::KeeICE::KPlib::KeeICEException& __ex)
    {
        __os->write(__ex);
        return ::Ice::DispatchUserException;
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___ModifyLogin(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::KeeICE::KPlib::KPEntry oldLogin;
    ::KeeICE::KPlib::KPEntry newLogin;
    oldLogin.__read(__is);
    newLogin.__read(__is);
    ::IceInternal::BasicStream* __os = __inS.os();
    try
    {
        ModifyLogin(oldLogin, newLogin, __current);
    }
    catch(const ::KeeICE::KPlib::KeeICEException& __ex)
    {
        __os->write(__ex);
        return ::Ice::DispatchUserException;
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___getAllLogins(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KPlib::KPEntryList logins;
    try
    {
        ::Ice::Int __ret = getAllLogins(logins, __current);
        if(logins.size() == 0)
        {
            __os->writeSize(0);
        }
        else
        {
            ::KeeICE::KPlib::__writeKPEntryList(__os, &logins[0], &logins[0] + logins.size());
        }
        __os->write(__ret);
    }
    catch(const ::KeeICE::KPlib::KeeICEException& __ex)
    {
        __os->write(__ex);
        return ::Ice::DispatchUserException;
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___findLogins(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string hostname;
    ::std::string actionURL;
    ::std::string httpRealm;
    ::KeeICE::KPlib::loginSearchType lst;
    bool requireFullURLMatches;
    ::std::string uniqueID;
    __is->read(hostname);
    __is->read(actionURL);
    __is->read(httpRealm);
    ::KeeICE::KPlib::__read(__is, lst);
    __is->read(requireFullURLMatches);
    __is->read(uniqueID);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KPlib::KPEntryList logins;
    try
    {
        ::Ice::Int __ret = findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, uniqueID, logins, __current);
        if(logins.size() == 0)
        {
            __os->writeSize(0);
        }
        else
        {
            ::KeeICE::KPlib::__writeKPEntryList(__os, &logins[0], &logins[0] + logins.size());
        }
        __os->write(__ret);
    }
    catch(const ::KeeICE::KPlib::KeeICEException& __ex)
    {
        __os->write(__ex);
        return ::Ice::DispatchUserException;
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___countLogins(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string hostname;
    ::std::string actionURL;
    ::std::string httpRealm;
    ::KeeICE::KPlib::loginSearchType lst;
    bool requireFullURLMatches;
    __is->read(hostname);
    __is->read(actionURL);
    __is->read(httpRealm);
    ::KeeICE::KPlib::__read(__is, lst);
    __is->read(requireFullURLMatches);
    ::IceInternal::BasicStream* __os = __inS.os();
    try
    {
        ::Ice::Int __ret = countLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, __current);
        __os->write(__ret);
    }
    catch(const ::KeeICE::KPlib::KeeICEException& __ex)
    {
        __os->write(__ex);
        return ::Ice::DispatchUserException;
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___addClient(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
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
KeeICE::KPlib::KP::___findGroups(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string name;
    ::std::string uuid;
    __is->read(name);
    __is->read(uuid);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KPlib::KPGroupList groups;
    ::Ice::Int __ret = findGroups(name, uuid, groups, __current);
    if(groups.size() == 0)
    {
        __os->writeSize(0);
    }
    else
    {
        ::KeeICE::KPlib::__writeKPGroupList(__os, &groups[0], &groups[0] + groups.size());
    }
    __os->write(__ret);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___getRoot(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KPlib::KPGroup __ret = getRoot(__current);
    __ret.__write(__os);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___getParent(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string uuid;
    __is->read(uuid);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KPlib::KPGroup __ret = getParent(uuid, __current);
    __ret.__write(__os);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___getChildGroups(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string uuid;
    __is->read(uuid);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KPlib::KPGroupList __ret = getChildGroups(uuid, __current);
    if(__ret.size() == 0)
    {
        __os->writeSize(0);
    }
    else
    {
        ::KeeICE::KPlib::__writeKPGroupList(__os, &__ret[0], &__ret[0] + __ret.size());
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___getChildEntries(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string uuid;
    __is->read(uuid);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KPlib::KPEntryList __ret = getChildEntries(uuid, __current);
    if(__ret.size() == 0)
    {
        __os->writeSize(0);
    }
    else
    {
        ::KeeICE::KPlib::__writeKPEntryList(__os, &__ret[0], &__ret[0] + __ret.size());
    }
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___addGroup(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::std::string name;
    ::std::string parentUuid;
    __is->read(name);
    __is->read(parentUuid);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KPlib::KPGroup __ret = addGroup(name, parentUuid, __current);
    __ret.__write(__os);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___removeGroup(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
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
KeeICE::KPlib::KP::___removeEntry(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
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
KeeICE::KPlib::KP::___LaunchGroupEditor(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
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
KeeICE::KPlib::KP::___LaunchLoginEditor(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
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
KeeICE::KPlib::KP::___getCurrentKFConfig(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KPlib::KFConfiguration __ret = getCurrentKFConfig(__current);
    __ret.__write(__os);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___setCurrentKFConfig(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    ::KeeICE::KPlib::KFConfiguration config;
    config.__read(__is);
    ::IceInternal::BasicStream* __os = __inS.os();
    bool __ret = setCurrentKFConfig(config, __current);
    __os->write(__ret);
    return ::Ice::DispatchOK;
}
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::KP::___setCurrentDBRootGroup(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
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
static ::std::string __KeeICE__KPlib__KP_all[] =
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
KeeICE::KPlib::KP::__dispatch(::IceInternal::Incoming& in, const ::Ice::Current& current)
{
    ::std::pair< ::std::string*, ::std::string*> r = ::std::equal_range(__KeeICE__KPlib__KP_all, __KeeICE__KPlib__KP_all + 27, current.operation);
    if(r.first == r.second)
    {
        throw Ice::OperationNotExistException(__FILE__, __LINE__, current.id, current.facet, current.operation);
    }

    switch(r.first - __KeeICE__KPlib__KP_all)
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
KeeICE::KPlib::KP::__write(::IceInternal::BasicStream* __os) const
{
    __os->writeTypeId(ice_staticId());
    __os->startWriteSlice();
    __os->endWriteSlice();
    ::Ice::Object::__write(__os);
}

void
KeeICE::KPlib::KP::__read(::IceInternal::BasicStream* __is, bool __rid)
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
KeeICE::KPlib::operator==(const ::KeeICE::KPlib::KP& l, const ::KeeICE::KPlib::KP& r)
{
    return static_cast<const ::Ice::Object&>(l) == static_cast<const ::Ice::Object&>(r);
}

bool
KeeICE::KPlib::operator<(const ::KeeICE::KPlib::KP& l, const ::KeeICE::KPlib::KP& r)
{
    return static_cast<const ::Ice::Object&>(l) < static_cast<const ::Ice::Object&>(r);
}

void 
KeeICE::KPlib::__patch__KPPtr(void* __addr, ::Ice::ObjectPtr& v)
{
    ::KeeICE::KPlib::KPPtr* p = static_cast< ::KeeICE::KPlib::KPPtr*>(__addr);
    assert(p);
    *p = ::KeeICE::KPlib::KPPtr::dynamicCast(v);
    if(v && !*p)
    {
        IceInternal::Ex::throwUOE(::KeeICE::KPlib::KP::ice_staticId(), v->ice_id());
    }
}

static const ::std::string __KeeICE__KPlib__CallbackReceiver_ids[2] =
{
    "::Ice::Object",
    "::KeeICE::KPlib::CallbackReceiver"
};

bool
KeeICE::KPlib::CallbackReceiver::ice_isA(const ::std::string& _s, const ::Ice::Current&) const
{
    return ::std::binary_search(__KeeICE__KPlib__CallbackReceiver_ids, __KeeICE__KPlib__CallbackReceiver_ids + 2, _s);
}

::std::vector< ::std::string>
KeeICE::KPlib::CallbackReceiver::ice_ids(const ::Ice::Current&) const
{
    return ::std::vector< ::std::string>(&__KeeICE__KPlib__CallbackReceiver_ids[0], &__KeeICE__KPlib__CallbackReceiver_ids[2]);
}

const ::std::string&
KeeICE::KPlib::CallbackReceiver::ice_id(const ::Ice::Current&) const
{
    return __KeeICE__KPlib__CallbackReceiver_ids[1];
}

const ::std::string&
KeeICE::KPlib::CallbackReceiver::ice_staticId()
{
    return __KeeICE__KPlib__CallbackReceiver_ids[1];
}

#ifndef ICEE_PURE_CLIENT
::Ice::DispatchStatus
KeeICE::KPlib::CallbackReceiver::___callback(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
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
static ::std::string __KeeICE__KPlib__CallbackReceiver_all[] =
{
    "callback",
    "ice_id",
    "ice_ids",
    "ice_isA",
    "ice_ping"
};

::Ice::DispatchStatus
KeeICE::KPlib::CallbackReceiver::__dispatch(::IceInternal::Incoming& in, const ::Ice::Current& current)
{
    ::std::pair< ::std::string*, ::std::string*> r = ::std::equal_range(__KeeICE__KPlib__CallbackReceiver_all, __KeeICE__KPlib__CallbackReceiver_all + 5, current.operation);
    if(r.first == r.second)
    {
        throw Ice::OperationNotExistException(__FILE__, __LINE__, current.id, current.facet, current.operation);
    }

    switch(r.first - __KeeICE__KPlib__CallbackReceiver_all)
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
KeeICE::KPlib::CallbackReceiver::__write(::IceInternal::BasicStream* __os) const
{
    __os->writeTypeId(ice_staticId());
    __os->startWriteSlice();
    __os->endWriteSlice();
    ::Ice::Object::__write(__os);
}

void
KeeICE::KPlib::CallbackReceiver::__read(::IceInternal::BasicStream* __is, bool __rid)
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
KeeICE::KPlib::operator==(const ::KeeICE::KPlib::CallbackReceiver& l, const ::KeeICE::KPlib::CallbackReceiver& r)
{
    return static_cast<const ::Ice::Object&>(l) == static_cast<const ::Ice::Object&>(r);
}

bool
KeeICE::KPlib::operator<(const ::KeeICE::KPlib::CallbackReceiver& l, const ::KeeICE::KPlib::CallbackReceiver& r)
{
    return static_cast<const ::Ice::Object&>(l) < static_cast<const ::Ice::Object&>(r);
}

void 
KeeICE::KPlib::__patch__CallbackReceiverPtr(void* __addr, ::Ice::ObjectPtr& v)
{
    ::KeeICE::KPlib::CallbackReceiverPtr* p = static_cast< ::KeeICE::KPlib::CallbackReceiverPtr*>(__addr);
    assert(p);
    *p = ::KeeICE::KPlib::CallbackReceiverPtr::dynamicCast(v);
    if(v && !*p)
    {
        IceInternal::Ex::throwUOE(::KeeICE::KPlib::CallbackReceiver::ice_staticId(), v->ice_id());
    }
}

bool
IceProxy::KeeICE::KPlib::KP::checkVersion(::Ice::Float keeFoxVersion, ::Ice::Float keeICEVersion, ::Ice::Int& result, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__checkVersion_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__checkVersion_name, ::Ice::Normal, __ctx);
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
IceProxy::KeeICE::KPlib::KP::getDatabaseName(const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__getDatabaseName_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__getDatabaseName_name, ::Ice::Normal, __ctx);
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
IceProxy::KeeICE::KPlib::KP::getDatabaseFileName(const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__getDatabaseFileName_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__getDatabaseFileName_name, ::Ice::Normal, __ctx);
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
IceProxy::KeeICE::KPlib::KP::changeDatabase(const ::std::string& fileName, bool closeCurrent, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__changeDatabase_name, ::Ice::Normal, __ctx);
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

::KeeICE::KPlib::KPEntry
IceProxy::KeeICE::KPlib::KP::AddLogin(const ::KeeICE::KPlib::KPEntry& login, const ::std::string& parentUUID, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__AddLogin_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__AddLogin_name, ::Ice::Normal, __ctx);
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
                    catch(const ::KeeICE::KPlib::KeeICEException&)
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
                ::KeeICE::KPlib::KPEntry __ret;
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
IceProxy::KeeICE::KPlib::KP::ModifyLogin(const ::KeeICE::KPlib::KPEntry& oldLogin, const ::KeeICE::KPlib::KPEntry& newLogin, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__ModifyLogin_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__ModifyLogin_name, ::Ice::Normal, __ctx);
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
                    catch(const ::KeeICE::KPlib::KeeICEException&)
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
IceProxy::KeeICE::KPlib::KP::getAllLogins(::KeeICE::KPlib::KPEntryList& logins, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__getAllLogins_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__getAllLogins_name, ::Ice::Normal, __ctx);
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    try
                    {
                        __outS.is()->throwException();
                    }
                    catch(const ::KeeICE::KPlib::KeeICEException&)
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
                ::KeeICE::KPlib::__readKPEntryList(__is, logins);
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
IceProxy::KeeICE::KPlib::KP::findLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KPlib::loginSearchType lst, bool requireFullURLMatches, const ::std::string& uniqueID, ::KeeICE::KPlib::KPEntryList& logins, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__findLogins_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__findLogins_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(hostname);
                __os->write(actionURL);
                __os->write(httpRealm);
                ::KeeICE::KPlib::__write(__os, lst);
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
                    catch(const ::KeeICE::KPlib::KeeICEException&)
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
                ::KeeICE::KPlib::__readKPEntryList(__is, logins);
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
IceProxy::KeeICE::KPlib::KP::countLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KPlib::loginSearchType lst, bool requireFullURLMatches, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__countLogins_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__countLogins_name, ::Ice::Normal, __ctx);
            try
            {
                ::IceInternal::BasicStream* __os = __outS.os();
                __os->write(hostname);
                __os->write(actionURL);
                __os->write(httpRealm);
                ::KeeICE::KPlib::__write(__os, lst);
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
                    catch(const ::KeeICE::KPlib::KeeICEException&)
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
IceProxy::KeeICE::KPlib::KP::addClient(const ::Ice::Identity& ident, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__addClient_name, ::Ice::Normal, __ctx);
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
IceProxy::KeeICE::KPlib::KP::findGroups(const ::std::string& name, const ::std::string& uuid, ::KeeICE::KPlib::KPGroupList& groups, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__findGroups_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__findGroups_name, ::Ice::Normal, __ctx);
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
                ::KeeICE::KPlib::__readKPGroupList(__is, groups);
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

::KeeICE::KPlib::KPGroup
IceProxy::KeeICE::KPlib::KP::getRoot(const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__getRoot_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__getRoot_name, ::Ice::Normal, __ctx);
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                ::KeeICE::KPlib::KPGroup __ret;
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

::KeeICE::KPlib::KPGroup
IceProxy::KeeICE::KPlib::KP::getParent(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__getParent_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__getParent_name, ::Ice::Normal, __ctx);
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
                ::KeeICE::KPlib::KPGroup __ret;
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

::KeeICE::KPlib::KPGroupList
IceProxy::KeeICE::KPlib::KP::getChildGroups(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__getChildGroups_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__getChildGroups_name, ::Ice::Normal, __ctx);
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
                ::KeeICE::KPlib::KPGroupList __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                ::KeeICE::KPlib::__readKPGroupList(__is, __ret);
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

::KeeICE::KPlib::KPEntryList
IceProxy::KeeICE::KPlib::KP::getChildEntries(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__getChildEntries_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__getChildEntries_name, ::Ice::Normal, __ctx);
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
                ::KeeICE::KPlib::KPEntryList __ret;
                ::IceInternal::BasicStream* __is = __outS.is();
                ::KeeICE::KPlib::__readKPEntryList(__is, __ret);
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

::KeeICE::KPlib::KPGroup
IceProxy::KeeICE::KPlib::KP::addGroup(const ::std::string& name, const ::std::string& parentUuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__addGroup_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__addGroup_name, ::Ice::Normal, __ctx);
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
                ::KeeICE::KPlib::KPGroup __ret;
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
IceProxy::KeeICE::KPlib::KP::removeGroup(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__removeGroup_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__removeGroup_name, ::Ice::Normal, __ctx);
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
IceProxy::KeeICE::KPlib::KP::removeEntry(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__removeEntry_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__removeEntry_name, ::Ice::Normal, __ctx);
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
IceProxy::KeeICE::KPlib::KP::LaunchGroupEditor(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__LaunchGroupEditor_name, ::Ice::Normal, __ctx);
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
IceProxy::KeeICE::KPlib::KP::LaunchLoginEditor(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__LaunchLoginEditor_name, ::Ice::Normal, __ctx);
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

::KeeICE::KPlib::KFConfiguration
IceProxy::KeeICE::KPlib::KP::getCurrentKFConfig(const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__getCurrentKFConfig_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__getCurrentKFConfig_name, ::Ice::Normal, __ctx);
            bool __ok = __outS.invoke();
            try
            {
                if(!__ok)
                {
                    __outS.is()->throwUnknownUserException();
                }
                ::KeeICE::KPlib::KFConfiguration __ret;
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
IceProxy::KeeICE::KPlib::KP::setCurrentKFConfig(const ::KeeICE::KPlib::KFConfiguration& config, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__setCurrentKFConfig_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__setCurrentKFConfig_name, ::Ice::Normal, __ctx);
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
IceProxy::KeeICE::KPlib::KP::setCurrentDBRootGroup(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __checkTwowayOnly(__KeeICE__KPlib__KP__setCurrentDBRootGroup_name);
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__KP__setCurrentDBRootGroup_name, ::Ice::Normal, __ctx);
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
IceProxy::KeeICE::KPlib::KP::ice_staticId()
{
    return __KeeICE__KPlib__KP_ids[1];
}

::IceProxy::Ice::Object*
IceProxy::KeeICE::KPlib::KP::__newInstance() const
{
    return new KP;
}

void
IceProxy::KeeICE::KPlib::CallbackReceiver::callback(::Ice::Int num, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::RequestHandlerPtr __handler;
        try
        {
            __handler = __getRequestHandler();
            ::IceInternal::Outgoing __outS(__handler.get(), _reference.get(), __KeeICE__KPlib__CallbackReceiver__callback_name, ::Ice::Normal, __ctx);
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
IceProxy::KeeICE::KPlib::CallbackReceiver::ice_staticId()
{
    return __KeeICE__KPlib__CallbackReceiver_ids[1];
}

::IceProxy::Ice::Object*
IceProxy::KeeICE::KPlib::CallbackReceiver::__newInstance() const
{
    return new CallbackReceiver;
}
