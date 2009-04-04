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

#include <KeeICE.h>
#include <Ice/LocalException.h>
#include <Ice/ObjectFactory.h>
#include <Ice/BasicStream.h>
#include <IceUtil/Iterator.h>
#include <IceUtil/ScopedArray.h>

#ifndef ICE_IGNORE_VERSION
#   if ICE_INT_VERSION / 100 != 303
#       error Ice version mismatch!
#   endif
#   if ICE_INT_VERSION % 100 > 50
#       error Beta header file detected
#   endif
#   if ICE_INT_VERSION % 100 < 0
#       error Ice patch level mismatch!
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
    return false;
}

void
KeeICE::KFlib::KPFormField::__write(::IceInternal::BasicStream* __os) const
{
    __os->write(name);
    __os->write(displayName);
    __os->write(value);
    ::KeeICE::KFlib::__write(__os, type);
}

void
KeeICE::KFlib::KPFormField::__read(::IceInternal::BasicStream* __is)
{
    __is->read(name);
    __is->read(displayName);
    __is->read(value);
    ::KeeICE::KFlib::__read(__is, type);
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
    __is->startSeq(sz, 4);
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
    if(hostName != __rhs.hostName)
    {
        return false;
    }
    if(formURL != __rhs.formURL)
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
    if(hostName < __rhs.hostName)
    {
        return true;
    }
    else if(__rhs.hostName < hostName)
    {
        return false;
    }
    if(formURL < __rhs.formURL)
    {
        return true;
    }
    else if(__rhs.formURL < formURL)
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
    __os->write(hostName);
    __os->write(formURL);
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
    __is->read(hostName);
    __is->read(formURL);
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
#if defined(_MSC_VER) && (_MSC_VER < 1300) // VC++ 6 compiler bug
    UserException(),
#else
    ::Ice::UserException(),
#endif
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

void
KeeICE::KFlib::KeeICEException::__write(const ::Ice::OutputStreamPtr&) const
{
    Ice::MarshalException ex(__FILE__, __LINE__);
    ex.reason = "exception KeeICE::KFlib::KeeICEException was not generated with stream support";
    throw ex;
}

void
KeeICE::KFlib::KeeICEException::__read(const ::Ice::InputStreamPtr&, bool)
{
    Ice::MarshalException ex(__FILE__, __LINE__);
    ex.reason = "exception KeeICE::KFlib::KeeICEException was not generated with stream support";
    throw ex;
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
KeeICE::KFlib::KPDatabase::operator==(const KPDatabase& __rhs) const
{
    if(this == &__rhs)
    {
        return true;
    }
    if(DBname != __rhs.DBname)
    {
        return false;
    }
    if(fileName != __rhs.fileName)
    {
        return false;
    }
    if(_cpp_default != __rhs._cpp_default)
    {
        return false;
    }
    if(rootGroupUID != __rhs.rootGroupUID)
    {
        return false;
    }
    if(useILM != __rhs.useILM)
    {
        return false;
    }
    return true;
}

bool
KeeICE::KFlib::KPDatabase::operator<(const KPDatabase& __rhs) const
{
    if(this == &__rhs)
    {
        return false;
    }
    if(DBname < __rhs.DBname)
    {
        return true;
    }
    else if(__rhs.DBname < DBname)
    {
        return false;
    }
    if(fileName < __rhs.fileName)
    {
        return true;
    }
    else if(__rhs.fileName < fileName)
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
    if(rootGroupUID < __rhs.rootGroupUID)
    {
        return true;
    }
    else if(__rhs.rootGroupUID < rootGroupUID)
    {
        return false;
    }
    if(useILM < __rhs.useILM)
    {
        return true;
    }
    else if(__rhs.useILM < useILM)
    {
        return false;
    }
    return false;
}

void
KeeICE::KFlib::KPDatabase::__write(::IceInternal::BasicStream* __os) const
{
    __os->write(DBname);
    __os->write(fileName);
    __os->write(_cpp_default);
    __os->write(rootGroupUID);
    __os->write(useILM);
}

void
KeeICE::KFlib::KPDatabase::__read(::IceInternal::BasicStream* __is)
{
    __is->read(DBname);
    __is->read(fileName);
    __is->read(_cpp_default);
    __is->read(rootGroupUID);
    __is->read(useILM);
}

void
KeeICE::KFlib::__writeKPDatabaseList(::IceInternal::BasicStream* __os, const ::KeeICE::KFlib::KPDatabase* begin, const ::KeeICE::KFlib::KPDatabase* end)
{
    ::Ice::Int size = static_cast< ::Ice::Int>(end - begin);
    __os->writeSize(size);
    for(int i = 0; i < size; ++i)
    {
        begin[i].__write(__os);
    }
}

void
KeeICE::KFlib::__readKPDatabaseList(::IceInternal::BasicStream* __is, ::KeeICE::KFlib::KPDatabaseList& v)
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
KeeICE::KFlib::KFConfiguration::operator==(const KFConfiguration& __rhs) const
{
    if(this == &__rhs)
    {
        return true;
    }
    if(allowUnencryptedMetaData != __rhs.allowUnencryptedMetaData)
    {
        return false;
    }
    if(knownDatabases != __rhs.knownDatabases)
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
    if(allowUnencryptedMetaData < __rhs.allowUnencryptedMetaData)
    {
        return true;
    }
    else if(__rhs.allowUnencryptedMetaData < allowUnencryptedMetaData)
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
    return false;
}

void
KeeICE::KFlib::KFConfiguration::__write(::IceInternal::BasicStream* __os) const
{
    __os->write(allowUnencryptedMetaData);
    if(knownDatabases.size() == 0)
    {
        __os->writeSize(0);
    }
    else
    {
        ::KeeICE::KFlib::__writeKPDatabaseList(__os, &knownDatabases[0], &knownDatabases[0] + knownDatabases.size());
    }
}

void
KeeICE::KFlib::KFConfiguration::__read(::IceInternal::BasicStream* __is)
{
    __is->read(allowUnencryptedMetaData);
    ::KeeICE::KFlib::__readKPDatabaseList(__is, knownDatabases);
}

bool
IceProxy::KeeICE::KFlib::KP::checkVersion(::Ice::Float keeFoxVersion, ::Ice::Float keeICEVersion, ::Ice::Int& result, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__checkVersion_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->checkVersion(keeFoxVersion, keeICEVersion, result, __ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

::std::string
IceProxy::KeeICE::KFlib::KP::getDatabaseName(const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getDatabaseName_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->getDatabaseName(__ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

::std::string
IceProxy::KeeICE::KFlib::KP::getDatabaseFileName(const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getDatabaseFileName_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->getDatabaseFileName(__ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

void
IceProxy::KeeICE::KFlib::KP::changeDatabase(const ::std::string& fileName, bool closeCurrent, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            __del->changeDatabase(fileName, closeCurrent, __ctx);
            return;
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

::KeeICE::KFlib::KPEntry
IceProxy::KeeICE::KFlib::KP::AddLogin(const ::KeeICE::KFlib::KPEntry& login, const ::std::string& parentUUID, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__AddLogin_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->AddLogin(login, parentUUID, __ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

void
IceProxy::KeeICE::KFlib::KP::ModifyLogin(const ::KeeICE::KFlib::KPEntry& oldLogin, const ::KeeICE::KFlib::KPEntry& newLogin, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__ModifyLogin_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            __del->ModifyLogin(oldLogin, newLogin, __ctx);
            return;
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

::Ice::Int
IceProxy::KeeICE::KFlib::KP::getAllLogins(::KeeICE::KFlib::KPEntryList& logins, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getAllLogins_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->getAllLogins(logins, __ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

::Ice::Int
IceProxy::KeeICE::KFlib::KP::findLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches, const ::std::string& uniqueID, ::KeeICE::KFlib::KPEntryList& logins, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__findLogins_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, uniqueID, logins, __ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

::Ice::Int
IceProxy::KeeICE::KFlib::KP::countLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__countLogins_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->countLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, __ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

void
IceProxy::KeeICE::KFlib::KP::addClient(const ::Ice::Identity& ident, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            __del->addClient(ident, __ctx);
            return;
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

::Ice::Int
IceProxy::KeeICE::KFlib::KP::findGroups(const ::std::string& name, const ::std::string& uuid, ::KeeICE::KFlib::KPGroupList& groups, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__findGroups_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->findGroups(name, uuid, groups, __ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

::KeeICE::KFlib::KPGroup
IceProxy::KeeICE::KFlib::KP::getRoot(const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getRoot_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->getRoot(__ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

::KeeICE::KFlib::KPGroup
IceProxy::KeeICE::KFlib::KP::getParent(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getParent_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->getParent(uuid, __ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

::KeeICE::KFlib::KPGroupList
IceProxy::KeeICE::KFlib::KP::getChildGroups(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getChildGroups_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->getChildGroups(uuid, __ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

::KeeICE::KFlib::KPEntryList
IceProxy::KeeICE::KFlib::KP::getChildEntries(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__getChildEntries_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->getChildEntries(uuid, __ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

::KeeICE::KFlib::KPGroup
IceProxy::KeeICE::KFlib::KP::addGroup(const ::std::string& name, const ::std::string& parentUuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__addGroup_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->addGroup(name, parentUuid, __ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

bool
IceProxy::KeeICE::KFlib::KP::removeGroup(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__removeGroup_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->removeGroup(uuid, __ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

bool
IceProxy::KeeICE::KFlib::KP::removeEntry(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __checkTwowayOnly(__KeeICE__KFlib__KP__removeEntry_name);
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            return __del->removeEntry(uuid, __ctx);
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

void
IceProxy::KeeICE::KFlib::KP::LaunchGroupEditor(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            __del->LaunchGroupEditor(uuid, __ctx);
            return;
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

void
IceProxy::KeeICE::KFlib::KP::LaunchLoginEditor(const ::std::string& uuid, const ::Ice::Context* __ctx)
{
    int __cnt = 0;
    while(true)
    {
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::KP* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::KP*>(__delBase.get());
            __del->LaunchLoginEditor(uuid, __ctx);
            return;
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

const ::std::string&
IceProxy::KeeICE::KFlib::KP::ice_staticId()
{
    return ::KeeICE::KFlib::KP::ice_staticId();
}

::IceInternal::Handle< ::IceDelegateM::Ice::Object>
IceProxy::KeeICE::KFlib::KP::__createDelegateM()
{
    return ::IceInternal::Handle< ::IceDelegateM::Ice::Object>(new ::IceDelegateM::KeeICE::KFlib::KP);
}

::IceInternal::Handle< ::IceDelegateD::Ice::Object>
IceProxy::KeeICE::KFlib::KP::__createDelegateD()
{
    return ::IceInternal::Handle< ::IceDelegateD::Ice::Object>(new ::IceDelegateD::KeeICE::KFlib::KP);
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
        ::IceInternal::Handle< ::IceDelegate::Ice::Object> __delBase;
        try
        {
            __delBase = __getDelegate(false);
            ::IceDelegate::KeeICE::KFlib::CallbackReceiver* __del = dynamic_cast< ::IceDelegate::KeeICE::KFlib::CallbackReceiver*>(__delBase.get());
            __del->callback(num, __ctx);
            return;
        }
        catch(const ::IceInternal::LocalExceptionWrapper& __ex)
        {
            __handleExceptionWrapper(__delBase, __ex, 0);
        }
        catch(const ::Ice::LocalException& __ex)
        {
            __handleException(__delBase, __ex, 0, __cnt);
        }
    }
}

const ::std::string&
IceProxy::KeeICE::KFlib::CallbackReceiver::ice_staticId()
{
    return ::KeeICE::KFlib::CallbackReceiver::ice_staticId();
}

::IceInternal::Handle< ::IceDelegateM::Ice::Object>
IceProxy::KeeICE::KFlib::CallbackReceiver::__createDelegateM()
{
    return ::IceInternal::Handle< ::IceDelegateM::Ice::Object>(new ::IceDelegateM::KeeICE::KFlib::CallbackReceiver);
}

::IceInternal::Handle< ::IceDelegateD::Ice::Object>
IceProxy::KeeICE::KFlib::CallbackReceiver::__createDelegateD()
{
    return ::IceInternal::Handle< ::IceDelegateD::Ice::Object>(new ::IceDelegateD::KeeICE::KFlib::CallbackReceiver);
}

::IceProxy::Ice::Object*
IceProxy::KeeICE::KFlib::CallbackReceiver::__newInstance() const
{
    return new CallbackReceiver;
}

bool
IceDelegateM::KeeICE::KFlib::KP::checkVersion(::Ice::Float keeFoxVersion, ::Ice::Float keeICEVersion, ::Ice::Int& result, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__checkVersion_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(keeFoxVersion);
        __os->write(keeICEVersion);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        bool __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        __is->read(result);
        __is->read(__ret);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

::std::string
IceDelegateM::KeeICE::KFlib::KP::getDatabaseName(const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__getDatabaseName_name, ::Ice::Normal, __context);
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        ::std::string __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        __is->read(__ret);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

::std::string
IceDelegateM::KeeICE::KFlib::KP::getDatabaseFileName(const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__getDatabaseFileName_name, ::Ice::Normal, __context);
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        ::std::string __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        __is->read(__ret);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

void
IceDelegateM::KeeICE::KFlib::KP::changeDatabase(const ::std::string& fileName, bool closeCurrent, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__changeDatabase_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(fileName);
        __os->write(closeCurrent);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    if(!__og.is()->b.empty())
    {
        try
        {
            if(!__ok)
            {
                try
                {
                    __og.throwUserException();
                }
                catch(const ::Ice::UserException& __ex)
                {
                    ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                    throw __uue;
                }
            }
            __og.is()->skipEmptyEncaps();
        }
        catch(const ::Ice::LocalException& __ex)
        {
            throw ::IceInternal::LocalExceptionWrapper(__ex, false);
        }
    }
}

::KeeICE::KFlib::KPEntry
IceDelegateM::KeeICE::KFlib::KP::AddLogin(const ::KeeICE::KFlib::KPEntry& login, const ::std::string& parentUUID, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__AddLogin_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        login.__write(__os);
        __os->write(parentUUID);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::KeeICE::KFlib::KeeICEException&)
            {
                throw;
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        ::KeeICE::KFlib::KPEntry __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        __ret.__read(__is);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

void
IceDelegateM::KeeICE::KFlib::KP::ModifyLogin(const ::KeeICE::KFlib::KPEntry& oldLogin, const ::KeeICE::KFlib::KPEntry& newLogin, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__ModifyLogin_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        oldLogin.__write(__os);
        newLogin.__write(__os);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::KeeICE::KFlib::KeeICEException&)
            {
                throw;
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        __is->endReadEncaps();
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

::Ice::Int
IceDelegateM::KeeICE::KFlib::KP::getAllLogins(::KeeICE::KFlib::KPEntryList& logins, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__getAllLogins_name, ::Ice::Normal, __context);
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::KeeICE::KFlib::KeeICEException&)
            {
                throw;
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        ::Ice::Int __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        ::KeeICE::KFlib::__readKPEntryList(__is, logins);
        __is->read(__ret);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

::Ice::Int
IceDelegateM::KeeICE::KFlib::KP::findLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches, const ::std::string& uniqueID, ::KeeICE::KFlib::KPEntryList& logins, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__findLogins_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(hostname);
        __os->write(actionURL);
        __os->write(httpRealm);
        ::KeeICE::KFlib::__write(__os, lst);
        __os->write(requireFullURLMatches);
        __os->write(uniqueID);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::KeeICE::KFlib::KeeICEException&)
            {
                throw;
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        ::Ice::Int __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        ::KeeICE::KFlib::__readKPEntryList(__is, logins);
        __is->read(__ret);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

::Ice::Int
IceDelegateM::KeeICE::KFlib::KP::countLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__countLogins_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(hostname);
        __os->write(actionURL);
        __os->write(httpRealm);
        ::KeeICE::KFlib::__write(__os, lst);
        __os->write(requireFullURLMatches);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::KeeICE::KFlib::KeeICEException&)
            {
                throw;
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        ::Ice::Int __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        __is->read(__ret);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

void
IceDelegateM::KeeICE::KFlib::KP::addClient(const ::Ice::Identity& ident, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__addClient_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        ident.__write(__os);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    if(!__og.is()->b.empty())
    {
        try
        {
            if(!__ok)
            {
                try
                {
                    __og.throwUserException();
                }
                catch(const ::Ice::UserException& __ex)
                {
                    ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                    throw __uue;
                }
            }
            __og.is()->skipEmptyEncaps();
        }
        catch(const ::Ice::LocalException& __ex)
        {
            throw ::IceInternal::LocalExceptionWrapper(__ex, false);
        }
    }
}

::Ice::Int
IceDelegateM::KeeICE::KFlib::KP::findGroups(const ::std::string& name, const ::std::string& uuid, ::KeeICE::KFlib::KPGroupList& groups, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__findGroups_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(name);
        __os->write(uuid);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        ::Ice::Int __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        ::KeeICE::KFlib::__readKPGroupList(__is, groups);
        __is->read(__ret);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

::KeeICE::KFlib::KPGroup
IceDelegateM::KeeICE::KFlib::KP::getRoot(const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__getRoot_name, ::Ice::Normal, __context);
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        ::KeeICE::KFlib::KPGroup __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        __ret.__read(__is);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

::KeeICE::KFlib::KPGroup
IceDelegateM::KeeICE::KFlib::KP::getParent(const ::std::string& uuid, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__getParent_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(uuid);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        ::KeeICE::KFlib::KPGroup __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        __ret.__read(__is);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

::KeeICE::KFlib::KPGroupList
IceDelegateM::KeeICE::KFlib::KP::getChildGroups(const ::std::string& uuid, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__getChildGroups_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(uuid);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        ::KeeICE::KFlib::KPGroupList __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        ::KeeICE::KFlib::__readKPGroupList(__is, __ret);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

::KeeICE::KFlib::KPEntryList
IceDelegateM::KeeICE::KFlib::KP::getChildEntries(const ::std::string& uuid, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__getChildEntries_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(uuid);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        ::KeeICE::KFlib::KPEntryList __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        ::KeeICE::KFlib::__readKPEntryList(__is, __ret);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

::KeeICE::KFlib::KPGroup
IceDelegateM::KeeICE::KFlib::KP::addGroup(const ::std::string& name, const ::std::string& parentUuid, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__addGroup_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(name);
        __os->write(parentUuid);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        ::KeeICE::KFlib::KPGroup __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        __ret.__read(__is);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

bool
IceDelegateM::KeeICE::KFlib::KP::removeGroup(const ::std::string& uuid, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__removeGroup_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(uuid);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        bool __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        __is->read(__ret);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

bool
IceDelegateM::KeeICE::KFlib::KP::removeEntry(const ::std::string& uuid, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__removeEntry_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(uuid);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    try
    {
        if(!__ok)
        {
            try
            {
                __og.throwUserException();
            }
            catch(const ::Ice::UserException& __ex)
            {
                ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                throw __uue;
            }
        }
        bool __ret;
        ::IceInternal::BasicStream* __is = __og.is();
        __is->startReadEncaps();
        __is->read(__ret);
        __is->endReadEncaps();
        return __ret;
    }
    catch(const ::Ice::LocalException& __ex)
    {
        throw ::IceInternal::LocalExceptionWrapper(__ex, false);
    }
}

void
IceDelegateM::KeeICE::KFlib::KP::LaunchGroupEditor(const ::std::string& uuid, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__LaunchGroupEditor_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(uuid);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    if(!__og.is()->b.empty())
    {
        try
        {
            if(!__ok)
            {
                try
                {
                    __og.throwUserException();
                }
                catch(const ::Ice::UserException& __ex)
                {
                    ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                    throw __uue;
                }
            }
            __og.is()->skipEmptyEncaps();
        }
        catch(const ::Ice::LocalException& __ex)
        {
            throw ::IceInternal::LocalExceptionWrapper(__ex, false);
        }
    }
}

void
IceDelegateM::KeeICE::KFlib::KP::LaunchLoginEditor(const ::std::string& uuid, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__KP__LaunchLoginEditor_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(uuid);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    if(!__og.is()->b.empty())
    {
        try
        {
            if(!__ok)
            {
                try
                {
                    __og.throwUserException();
                }
                catch(const ::Ice::UserException& __ex)
                {
                    ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                    throw __uue;
                }
            }
            __og.is()->skipEmptyEncaps();
        }
        catch(const ::Ice::LocalException& __ex)
        {
            throw ::IceInternal::LocalExceptionWrapper(__ex, false);
        }
    }
}

void
IceDelegateM::KeeICE::KFlib::CallbackReceiver::callback(::Ice::Int num, const ::Ice::Context* __context)
{
    ::IceInternal::Outgoing __og(__handler.get(), __KeeICE__KFlib__CallbackReceiver__callback_name, ::Ice::Normal, __context);
    try
    {
        ::IceInternal::BasicStream* __os = __og.os();
        __os->write(num);
    }
    catch(const ::Ice::LocalException& __ex)
    {
        __og.abort(__ex);
    }
    bool __ok = __og.invoke();
    if(!__og.is()->b.empty())
    {
        try
        {
            if(!__ok)
            {
                try
                {
                    __og.throwUserException();
                }
                catch(const ::Ice::UserException& __ex)
                {
                    ::Ice::UnknownUserException __uue(__FILE__, __LINE__, __ex.ice_name());
                    throw __uue;
                }
            }
            __og.is()->skipEmptyEncaps();
        }
        catch(const ::Ice::LocalException& __ex)
        {
            throw ::IceInternal::LocalExceptionWrapper(__ex, false);
        }
    }
}

bool
IceDelegateD::KeeICE::KFlib::KP::checkVersion(::Ice::Float keeFoxVersion, ::Ice::Float keeICEVersion, ::Ice::Int& result, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(bool& __result, ::Ice::Float keeFoxVersion, ::Ice::Float keeICEVersion, ::Ice::Int& result, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result),
            _m_keeFoxVersion(keeFoxVersion),
            _m_keeICEVersion(keeICEVersion),
            _m_result(result)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            _result = servant->checkVersion(_m_keeFoxVersion, _m_keeICEVersion, _m_result, _current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        bool& _result;
        ::Ice::Float _m_keeFoxVersion;
        ::Ice::Float _m_keeICEVersion;
        ::Ice::Int& _m_result;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__checkVersion_name, ::Ice::Normal, __context);
    bool __result;
    try
    {
        _DirectI __direct(__result, keeFoxVersion, keeICEVersion, result, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

::std::string
IceDelegateD::KeeICE::KFlib::KP::getDatabaseName(const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(::std::string& __result, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            _result = servant->getDatabaseName(_current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        ::std::string& _result;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__getDatabaseName_name, ::Ice::Normal, __context);
    ::std::string __result;
    try
    {
        _DirectI __direct(__result, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

::std::string
IceDelegateD::KeeICE::KFlib::KP::getDatabaseFileName(const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(::std::string& __result, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            _result = servant->getDatabaseFileName(_current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        ::std::string& _result;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__getDatabaseFileName_name, ::Ice::Normal, __context);
    ::std::string __result;
    try
    {
        _DirectI __direct(__result, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

void
IceDelegateD::KeeICE::KFlib::KP::changeDatabase(const ::std::string& fileName, bool closeCurrent, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(const ::std::string& fileName, bool closeCurrent, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _m_fileName(fileName),
            _m_closeCurrent(closeCurrent)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            servant->changeDatabase(_m_fileName, _m_closeCurrent, _current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        const ::std::string& _m_fileName;
        bool _m_closeCurrent;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__changeDatabase_name, ::Ice::Normal, __context);
    try
    {
        _DirectI __direct(fileName, closeCurrent, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
}

::KeeICE::KFlib::KPEntry
IceDelegateD::KeeICE::KFlib::KP::AddLogin(const ::KeeICE::KFlib::KPEntry& login, const ::std::string& parentUUID, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(::KeeICE::KFlib::KPEntry& __result, const ::KeeICE::KFlib::KPEntry& login, const ::std::string& parentUUID, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result),
            _m_login(login),
            _m_parentUUID(parentUUID)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            try
            {
                _result = servant->AddLogin(_m_login, _m_parentUUID, _current);
                return ::Ice::DispatchOK;
            }
            catch(const ::Ice::UserException& __ex)
            {
                setUserException(__ex);
                return ::Ice::DispatchUserException;
            }
        }
        
    private:
        
        ::KeeICE::KFlib::KPEntry& _result;
        const ::KeeICE::KFlib::KPEntry& _m_login;
        const ::std::string& _m_parentUUID;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__AddLogin_name, ::Ice::Normal, __context);
    ::KeeICE::KFlib::KPEntry __result;
    try
    {
        _DirectI __direct(__result, login, parentUUID, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::KeeICE::KFlib::KeeICEException&)
    {
        throw;
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

void
IceDelegateD::KeeICE::KFlib::KP::ModifyLogin(const ::KeeICE::KFlib::KPEntry& oldLogin, const ::KeeICE::KFlib::KPEntry& newLogin, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(const ::KeeICE::KFlib::KPEntry& oldLogin, const ::KeeICE::KFlib::KPEntry& newLogin, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _m_oldLogin(oldLogin),
            _m_newLogin(newLogin)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            try
            {
                servant->ModifyLogin(_m_oldLogin, _m_newLogin, _current);
                return ::Ice::DispatchOK;
            }
            catch(const ::Ice::UserException& __ex)
            {
                setUserException(__ex);
                return ::Ice::DispatchUserException;
            }
        }
        
    private:
        
        const ::KeeICE::KFlib::KPEntry& _m_oldLogin;
        const ::KeeICE::KFlib::KPEntry& _m_newLogin;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__ModifyLogin_name, ::Ice::Normal, __context);
    try
    {
        _DirectI __direct(oldLogin, newLogin, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::KeeICE::KFlib::KeeICEException&)
    {
        throw;
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
}

::Ice::Int
IceDelegateD::KeeICE::KFlib::KP::getAllLogins(::KeeICE::KFlib::KPEntryList& logins, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(::Ice::Int& __result, ::KeeICE::KFlib::KPEntryList& logins, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result),
            _m_logins(logins)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            try
            {
                _result = servant->getAllLogins(_m_logins, _current);
                return ::Ice::DispatchOK;
            }
            catch(const ::Ice::UserException& __ex)
            {
                setUserException(__ex);
                return ::Ice::DispatchUserException;
            }
        }
        
    private:
        
        ::Ice::Int& _result;
        ::KeeICE::KFlib::KPEntryList& _m_logins;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__getAllLogins_name, ::Ice::Normal, __context);
    ::Ice::Int __result;
    try
    {
        _DirectI __direct(__result, logins, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::KeeICE::KFlib::KeeICEException&)
    {
        throw;
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

::Ice::Int
IceDelegateD::KeeICE::KFlib::KP::findLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches, const ::std::string& uniqueID, ::KeeICE::KFlib::KPEntryList& logins, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(::Ice::Int& __result, const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches, const ::std::string& uniqueID, ::KeeICE::KFlib::KPEntryList& logins, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result),
            _m_hostname(hostname),
            _m_actionURL(actionURL),
            _m_httpRealm(httpRealm),
            _m_lst(lst),
            _m_requireFullURLMatches(requireFullURLMatches),
            _m_uniqueID(uniqueID),
            _m_logins(logins)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            try
            {
                _result = servant->findLogins(_m_hostname, _m_actionURL, _m_httpRealm, _m_lst, _m_requireFullURLMatches, _m_uniqueID, _m_logins, _current);
                return ::Ice::DispatchOK;
            }
            catch(const ::Ice::UserException& __ex)
            {
                setUserException(__ex);
                return ::Ice::DispatchUserException;
            }
        }
        
    private:
        
        ::Ice::Int& _result;
        const ::std::string& _m_hostname;
        const ::std::string& _m_actionURL;
        const ::std::string& _m_httpRealm;
        ::KeeICE::KFlib::loginSearchType _m_lst;
        bool _m_requireFullURLMatches;
        const ::std::string& _m_uniqueID;
        ::KeeICE::KFlib::KPEntryList& _m_logins;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__findLogins_name, ::Ice::Normal, __context);
    ::Ice::Int __result;
    try
    {
        _DirectI __direct(__result, hostname, actionURL, httpRealm, lst, requireFullURLMatches, uniqueID, logins, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::KeeICE::KFlib::KeeICEException&)
    {
        throw;
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

::Ice::Int
IceDelegateD::KeeICE::KFlib::KP::countLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(::Ice::Int& __result, const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result),
            _m_hostname(hostname),
            _m_actionURL(actionURL),
            _m_httpRealm(httpRealm),
            _m_lst(lst),
            _m_requireFullURLMatches(requireFullURLMatches)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            try
            {
                _result = servant->countLogins(_m_hostname, _m_actionURL, _m_httpRealm, _m_lst, _m_requireFullURLMatches, _current);
                return ::Ice::DispatchOK;
            }
            catch(const ::Ice::UserException& __ex)
            {
                setUserException(__ex);
                return ::Ice::DispatchUserException;
            }
        }
        
    private:
        
        ::Ice::Int& _result;
        const ::std::string& _m_hostname;
        const ::std::string& _m_actionURL;
        const ::std::string& _m_httpRealm;
        ::KeeICE::KFlib::loginSearchType _m_lst;
        bool _m_requireFullURLMatches;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__countLogins_name, ::Ice::Normal, __context);
    ::Ice::Int __result;
    try
    {
        _DirectI __direct(__result, hostname, actionURL, httpRealm, lst, requireFullURLMatches, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::KeeICE::KFlib::KeeICEException&)
    {
        throw;
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

void
IceDelegateD::KeeICE::KFlib::KP::addClient(const ::Ice::Identity& ident, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(const ::Ice::Identity& ident, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _m_ident(ident)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            servant->addClient(_m_ident, _current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        const ::Ice::Identity& _m_ident;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__addClient_name, ::Ice::Normal, __context);
    try
    {
        _DirectI __direct(ident, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
}

::Ice::Int
IceDelegateD::KeeICE::KFlib::KP::findGroups(const ::std::string& name, const ::std::string& uuid, ::KeeICE::KFlib::KPGroupList& groups, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(::Ice::Int& __result, const ::std::string& name, const ::std::string& uuid, ::KeeICE::KFlib::KPGroupList& groups, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result),
            _m_name(name),
            _m_uuid(uuid),
            _m_groups(groups)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            _result = servant->findGroups(_m_name, _m_uuid, _m_groups, _current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        ::Ice::Int& _result;
        const ::std::string& _m_name;
        const ::std::string& _m_uuid;
        ::KeeICE::KFlib::KPGroupList& _m_groups;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__findGroups_name, ::Ice::Normal, __context);
    ::Ice::Int __result;
    try
    {
        _DirectI __direct(__result, name, uuid, groups, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

::KeeICE::KFlib::KPGroup
IceDelegateD::KeeICE::KFlib::KP::getRoot(const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(::KeeICE::KFlib::KPGroup& __result, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            _result = servant->getRoot(_current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        ::KeeICE::KFlib::KPGroup& _result;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__getRoot_name, ::Ice::Normal, __context);
    ::KeeICE::KFlib::KPGroup __result;
    try
    {
        _DirectI __direct(__result, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

::KeeICE::KFlib::KPGroup
IceDelegateD::KeeICE::KFlib::KP::getParent(const ::std::string& uuid, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(::KeeICE::KFlib::KPGroup& __result, const ::std::string& uuid, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result),
            _m_uuid(uuid)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            _result = servant->getParent(_m_uuid, _current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        ::KeeICE::KFlib::KPGroup& _result;
        const ::std::string& _m_uuid;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__getParent_name, ::Ice::Normal, __context);
    ::KeeICE::KFlib::KPGroup __result;
    try
    {
        _DirectI __direct(__result, uuid, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

::KeeICE::KFlib::KPGroupList
IceDelegateD::KeeICE::KFlib::KP::getChildGroups(const ::std::string& uuid, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(::KeeICE::KFlib::KPGroupList& __result, const ::std::string& uuid, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result),
            _m_uuid(uuid)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            _result = servant->getChildGroups(_m_uuid, _current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        ::KeeICE::KFlib::KPGroupList& _result;
        const ::std::string& _m_uuid;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__getChildGroups_name, ::Ice::Normal, __context);
    ::KeeICE::KFlib::KPGroupList __result;
    try
    {
        _DirectI __direct(__result, uuid, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

::KeeICE::KFlib::KPEntryList
IceDelegateD::KeeICE::KFlib::KP::getChildEntries(const ::std::string& uuid, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(::KeeICE::KFlib::KPEntryList& __result, const ::std::string& uuid, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result),
            _m_uuid(uuid)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            _result = servant->getChildEntries(_m_uuid, _current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        ::KeeICE::KFlib::KPEntryList& _result;
        const ::std::string& _m_uuid;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__getChildEntries_name, ::Ice::Normal, __context);
    ::KeeICE::KFlib::KPEntryList __result;
    try
    {
        _DirectI __direct(__result, uuid, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

::KeeICE::KFlib::KPGroup
IceDelegateD::KeeICE::KFlib::KP::addGroup(const ::std::string& name, const ::std::string& parentUuid, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(::KeeICE::KFlib::KPGroup& __result, const ::std::string& name, const ::std::string& parentUuid, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result),
            _m_name(name),
            _m_parentUuid(parentUuid)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            _result = servant->addGroup(_m_name, _m_parentUuid, _current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        ::KeeICE::KFlib::KPGroup& _result;
        const ::std::string& _m_name;
        const ::std::string& _m_parentUuid;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__addGroup_name, ::Ice::Normal, __context);
    ::KeeICE::KFlib::KPGroup __result;
    try
    {
        _DirectI __direct(__result, name, parentUuid, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

bool
IceDelegateD::KeeICE::KFlib::KP::removeGroup(const ::std::string& uuid, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(bool& __result, const ::std::string& uuid, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result),
            _m_uuid(uuid)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            _result = servant->removeGroup(_m_uuid, _current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        bool& _result;
        const ::std::string& _m_uuid;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__removeGroup_name, ::Ice::Normal, __context);
    bool __result;
    try
    {
        _DirectI __direct(__result, uuid, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

bool
IceDelegateD::KeeICE::KFlib::KP::removeEntry(const ::std::string& uuid, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(bool& __result, const ::std::string& uuid, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _result(__result),
            _m_uuid(uuid)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            _result = servant->removeEntry(_m_uuid, _current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        bool& _result;
        const ::std::string& _m_uuid;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__removeEntry_name, ::Ice::Normal, __context);
    bool __result;
    try
    {
        _DirectI __direct(__result, uuid, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
    return __result;
}

void
IceDelegateD::KeeICE::KFlib::KP::LaunchGroupEditor(const ::std::string& uuid, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(const ::std::string& uuid, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _m_uuid(uuid)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            servant->LaunchGroupEditor(_m_uuid, _current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        const ::std::string& _m_uuid;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__LaunchGroupEditor_name, ::Ice::Normal, __context);
    try
    {
        _DirectI __direct(uuid, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
}

void
IceDelegateD::KeeICE::KFlib::KP::LaunchLoginEditor(const ::std::string& uuid, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(const ::std::string& uuid, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _m_uuid(uuid)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::KP* servant = dynamic_cast< ::KeeICE::KFlib::KP*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            servant->LaunchLoginEditor(_m_uuid, _current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        const ::std::string& _m_uuid;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__KP__LaunchLoginEditor_name, ::Ice::Normal, __context);
    try
    {
        _DirectI __direct(uuid, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
}

void
IceDelegateD::KeeICE::KFlib::CallbackReceiver::callback(::Ice::Int num, const ::Ice::Context* __context)
{
    class _DirectI : public ::IceInternal::Direct
    {
    public:

        _DirectI(::Ice::Int num, const ::Ice::Current& __current) : 
            ::IceInternal::Direct(__current),
            _m_num(num)
        {
        }
        
        virtual ::Ice::DispatchStatus
        run(::Ice::Object* object)
        {
            ::KeeICE::KFlib::CallbackReceiver* servant = dynamic_cast< ::KeeICE::KFlib::CallbackReceiver*>(object);
            if(!servant)
            {
                throw ::Ice::OperationNotExistException(__FILE__, __LINE__, _current.id, _current.facet, _current.operation);
            }
            servant->callback(_m_num, _current);
            return ::Ice::DispatchOK;
        }
        
    private:
        
        ::Ice::Int _m_num;
    };
    
    ::Ice::Current __current;
    __initCurrent(__current, __KeeICE__KFlib__CallbackReceiver__callback_name, ::Ice::Normal, __context);
    try
    {
        _DirectI __direct(num, __current);
        try
        {
            __direct.servant()->__collocDispatch(__direct);
        }
        catch(...)
        {
            __direct.destroy();
            throw;
        }
        __direct.destroy();
    }
    catch(const ::Ice::SystemException&)
    {
        throw;
    }
    catch(const ::IceInternal::LocalExceptionWrapper&)
    {
        throw;
    }
    catch(const ::std::exception& __ex)
    {
        ::IceInternal::LocalExceptionWrapper::throwWrapper(__ex);
    }
    catch(...)
    {
        throw ::IceInternal::LocalExceptionWrapper(::Ice::UnknownException(__FILE__, __LINE__, "unknown c++ exception"), false);
    }
}

::Ice::ObjectPtr
KeeICE::KFlib::KP::ice_clone() const
{
    throw ::Ice::CloneNotImplementedException(__FILE__, __LINE__);
    return 0; // to avoid a warning with some compilers
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

::Ice::DispatchStatus
KeeICE::KFlib::KP::___checkVersion(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::Ice::Float keeFoxVersion;
    ::Ice::Float keeICEVersion;
    __is->read(keeFoxVersion);
    __is->read(keeICEVersion);
    __is->endReadEncaps();
    ::IceInternal::BasicStream* __os = __inS.os();
    ::Ice::Int result;
    bool __ret = checkVersion(keeFoxVersion, keeICEVersion, result, __current);
    __os->write(result);
    __os->write(__ret);
    return ::Ice::DispatchOK;
}

::Ice::DispatchStatus
KeeICE::KFlib::KP::___getDatabaseName(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    __inS.is()->skipEmptyEncaps();
    ::IceInternal::BasicStream* __os = __inS.os();
    ::std::string __ret = getDatabaseName(__current);
    __os->write(__ret);
    return ::Ice::DispatchOK;
}

::Ice::DispatchStatus
KeeICE::KFlib::KP::___getDatabaseFileName(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    __inS.is()->skipEmptyEncaps();
    ::IceInternal::BasicStream* __os = __inS.os();
    ::std::string __ret = getDatabaseFileName(__current);
    __os->write(__ret);
    return ::Ice::DispatchOK;
}

::Ice::DispatchStatus
KeeICE::KFlib::KP::___changeDatabase(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::std::string fileName;
    bool closeCurrent;
    __is->read(fileName);
    __is->read(closeCurrent);
    __is->endReadEncaps();
    changeDatabase(fileName, closeCurrent, __current);
    return ::Ice::DispatchOK;
}

::Ice::DispatchStatus
KeeICE::KFlib::KP::___AddLogin(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::KeeICE::KFlib::KPEntry login;
    ::std::string parentUUID;
    login.__read(__is);
    __is->read(parentUUID);
    __is->endReadEncaps();
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

::Ice::DispatchStatus
KeeICE::KFlib::KP::___ModifyLogin(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::KeeICE::KFlib::KPEntry oldLogin;
    ::KeeICE::KFlib::KPEntry newLogin;
    oldLogin.__read(__is);
    newLogin.__read(__is);
    __is->endReadEncaps();
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

::Ice::DispatchStatus
KeeICE::KFlib::KP::___getAllLogins(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    __inS.is()->skipEmptyEncaps();
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

::Ice::DispatchStatus
KeeICE::KFlib::KP::___findLogins(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
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
    __is->endReadEncaps();
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

::Ice::DispatchStatus
KeeICE::KFlib::KP::___countLogins(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
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
    __is->endReadEncaps();
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

::Ice::DispatchStatus
KeeICE::KFlib::KP::___addClient(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::Ice::Identity ident;
    ident.__read(__is);
    __is->endReadEncaps();
    addClient(ident, __current);
    return ::Ice::DispatchOK;
}

::Ice::DispatchStatus
KeeICE::KFlib::KP::___findGroups(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::std::string name;
    ::std::string uuid;
    __is->read(name);
    __is->read(uuid);
    __is->endReadEncaps();
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

::Ice::DispatchStatus
KeeICE::KFlib::KP::___getRoot(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    __inS.is()->skipEmptyEncaps();
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KFlib::KPGroup __ret = getRoot(__current);
    __ret.__write(__os);
    return ::Ice::DispatchOK;
}

::Ice::DispatchStatus
KeeICE::KFlib::KP::___getParent(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::std::string uuid;
    __is->read(uuid);
    __is->endReadEncaps();
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KFlib::KPGroup __ret = getParent(uuid, __current);
    __ret.__write(__os);
    return ::Ice::DispatchOK;
}

::Ice::DispatchStatus
KeeICE::KFlib::KP::___getChildGroups(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::std::string uuid;
    __is->read(uuid);
    __is->endReadEncaps();
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

::Ice::DispatchStatus
KeeICE::KFlib::KP::___getChildEntries(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::std::string uuid;
    __is->read(uuid);
    __is->endReadEncaps();
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

::Ice::DispatchStatus
KeeICE::KFlib::KP::___addGroup(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::std::string name;
    ::std::string parentUuid;
    __is->read(name);
    __is->read(parentUuid);
    __is->endReadEncaps();
    ::IceInternal::BasicStream* __os = __inS.os();
    ::KeeICE::KFlib::KPGroup __ret = addGroup(name, parentUuid, __current);
    __ret.__write(__os);
    return ::Ice::DispatchOK;
}

::Ice::DispatchStatus
KeeICE::KFlib::KP::___removeGroup(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::std::string uuid;
    __is->read(uuid);
    __is->endReadEncaps();
    ::IceInternal::BasicStream* __os = __inS.os();
    bool __ret = removeGroup(uuid, __current);
    __os->write(__ret);
    return ::Ice::DispatchOK;
}

::Ice::DispatchStatus
KeeICE::KFlib::KP::___removeEntry(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::std::string uuid;
    __is->read(uuid);
    __is->endReadEncaps();
    ::IceInternal::BasicStream* __os = __inS.os();
    bool __ret = removeEntry(uuid, __current);
    __os->write(__ret);
    return ::Ice::DispatchOK;
}

::Ice::DispatchStatus
KeeICE::KFlib::KP::___LaunchGroupEditor(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::std::string uuid;
    __is->read(uuid);
    __is->endReadEncaps();
    LaunchGroupEditor(uuid, __current);
    return ::Ice::DispatchOK;
}

::Ice::DispatchStatus
KeeICE::KFlib::KP::___LaunchLoginEditor(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::std::string uuid;
    __is->read(uuid);
    __is->endReadEncaps();
    LaunchLoginEditor(uuid, __current);
    return ::Ice::DispatchOK;
}

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

::Ice::DispatchStatus
KeeICE::KFlib::KP::__dispatch(::IceInternal::Incoming& in, const ::Ice::Current& current)
{
    ::std::pair< ::std::string*, ::std::string*> r = ::std::equal_range(__KeeICE__KFlib__KP_all, __KeeICE__KFlib__KP_all + 24, current.operation);
    if(r.first == r.second)
    {
        throw ::Ice::OperationNotExistException(__FILE__, __LINE__, current.id, current.facet, current.operation);
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
            return ___getDatabaseFileName(in, current);
        }
        case 15:
        {
            return ___getDatabaseName(in, current);
        }
        case 16:
        {
            return ___getParent(in, current);
        }
        case 17:
        {
            return ___getRoot(in, current);
        }
        case 18:
        {
            return ___ice_id(in, current);
        }
        case 19:
        {
            return ___ice_ids(in, current);
        }
        case 20:
        {
            return ___ice_isA(in, current);
        }
        case 21:
        {
            return ___ice_ping(in, current);
        }
        case 22:
        {
            return ___removeEntry(in, current);
        }
        case 23:
        {
            return ___removeGroup(in, current);
        }
    }

    assert(false);
    throw ::Ice::OperationNotExistException(__FILE__, __LINE__, current.id, current.facet, current.operation);
}

void
KeeICE::KFlib::KP::__write(::IceInternal::BasicStream* __os) const
{
    __os->writeTypeId(ice_staticId());
    __os->startWriteSlice();
    __os->endWriteSlice();
#if defined(_MSC_VER) && (_MSC_VER < 1300) // VC++ 6 compiler bug
    Object::__write(__os);
#else
    ::Ice::Object::__write(__os);
#endif
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
#if defined(_MSC_VER) && (_MSC_VER < 1300) // VC++ 6 compiler bug
    Object::__read(__is, true);
#else
    ::Ice::Object::__read(__is, true);
#endif
}

void
KeeICE::KFlib::KP::__write(const ::Ice::OutputStreamPtr&) const
{
    Ice::MarshalException ex(__FILE__, __LINE__);
    ex.reason = "type KeeICE::KFlib::KP was not generated with stream support";
    throw ex;
}

void
KeeICE::KFlib::KP::__read(const ::Ice::InputStreamPtr&, bool)
{
    Ice::MarshalException ex(__FILE__, __LINE__);
    ex.reason = "type KeeICE::KFlib::KP was not generated with stream support";
    throw ex;
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

::Ice::ObjectPtr
KeeICE::KFlib::CallbackReceiver::ice_clone() const
{
    throw ::Ice::CloneNotImplementedException(__FILE__, __LINE__);
    return 0; // to avoid a warning with some compilers
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

::Ice::DispatchStatus
KeeICE::KFlib::CallbackReceiver::___callback(::IceInternal::Incoming& __inS, const ::Ice::Current& __current)
{
    __checkMode(::Ice::Normal, __current.mode);
    ::IceInternal::BasicStream* __is = __inS.is();
    __is->startReadEncaps();
    ::Ice::Int num;
    __is->read(num);
    __is->endReadEncaps();
    callback(num, __current);
    return ::Ice::DispatchOK;
}

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
        throw ::Ice::OperationNotExistException(__FILE__, __LINE__, current.id, current.facet, current.operation);
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
    throw ::Ice::OperationNotExistException(__FILE__, __LINE__, current.id, current.facet, current.operation);
}

void
KeeICE::KFlib::CallbackReceiver::__write(::IceInternal::BasicStream* __os) const
{
    __os->writeTypeId(ice_staticId());
    __os->startWriteSlice();
    __os->endWriteSlice();
#if defined(_MSC_VER) && (_MSC_VER < 1300) // VC++ 6 compiler bug
    Object::__write(__os);
#else
    ::Ice::Object::__write(__os);
#endif
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
#if defined(_MSC_VER) && (_MSC_VER < 1300) // VC++ 6 compiler bug
    Object::__read(__is, true);
#else
    ::Ice::Object::__read(__is, true);
#endif
}

void
KeeICE::KFlib::CallbackReceiver::__write(const ::Ice::OutputStreamPtr&) const
{
    Ice::MarshalException ex(__FILE__, __LINE__);
    ex.reason = "type KeeICE::KFlib::CallbackReceiver was not generated with stream support";
    throw ex;
}

void
KeeICE::KFlib::CallbackReceiver::__read(const ::Ice::InputStreamPtr&, bool)
{
    Ice::MarshalException ex(__FILE__, __LINE__);
    ex.reason = "type KeeICE::KFlib::CallbackReceiver was not generated with stream support";
    throw ex;
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
KeeICE::KFlib::operator==(const ::KeeICE::KFlib::CallbackReceiver& l, const ::KeeICE::KFlib::CallbackReceiver& r)
{
    return static_cast<const ::Ice::Object&>(l) == static_cast<const ::Ice::Object&>(r);
}

bool
KeeICE::KFlib::operator<(const ::KeeICE::KFlib::CallbackReceiver& l, const ::KeeICE::KFlib::CallbackReceiver& r)
{
    return static_cast<const ::Ice::Object&>(l) < static_cast<const ::Ice::Object&>(r);
}
