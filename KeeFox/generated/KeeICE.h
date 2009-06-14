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

#ifndef __C__development_KeeFox_KeeFox_generated_KeeICE_h__
#define __C__development_KeeFox_KeeFox_generated_KeeICE_h__

#include <IceE/ProxyF.h>
#include <IceE/ObjectF.h>
#include <IceE/Exception.h>
#include <IceE/ScopedArray.h>
#include <IceE/Proxy.h>
#include <IceE/Object.h>
#ifndef ICEE_PURE_CLIENT
#  include <IceE/Incoming.h>
#endif
#include <IceE/Outgoing.h>
#include <IceE/UserExceptionFactory.h>
#include <IceE/FactoryTable.h>
#include <IceE/Identity.h>
#include <IceE/UndefSysMacros.h>

#ifndef ICEE_IGNORE_VERSION
#   if ICEE_INT_VERSION / 100 != 103
#       error IceE version mismatch!
#   endif
#   if ICEE_INT_VERSION % 100 < 0
#       error IceE patch level mismatch!
#   endif
#endif

namespace IceProxy
{

namespace KeeICE
{

namespace KFlib
{

class KP;

class CallbackReceiver;

}

}

}

namespace KeeICE
{

namespace KFlib
{

class KP;
bool operator==(const KP&, const KP&);
bool operator<(const KP&, const KP&);

class CallbackReceiver;
bool operator==(const CallbackReceiver&, const CallbackReceiver&);
bool operator<(const CallbackReceiver&, const CallbackReceiver&);

}

}

namespace IceInternal
{

::Ice::Object* upCast(::KeeICE::KFlib::KP*);
::IceProxy::Ice::Object* upCast(::IceProxy::KeeICE::KFlib::KP*);

::Ice::Object* upCast(::KeeICE::KFlib::CallbackReceiver*);
::IceProxy::Ice::Object* upCast(::IceProxy::KeeICE::KFlib::CallbackReceiver*);

}

namespace KeeICE
{

namespace KFlib
{

typedef ::IceInternal::Handle< ::KeeICE::KFlib::KP> KPPtr;
typedef ::IceInternal::ProxyHandle< ::IceProxy::KeeICE::KFlib::KP> KPPrx;

void __read(::IceInternal::BasicStream*, KPPrx&);
void __patch__KPPtr(void*, ::Ice::ObjectPtr&);

typedef ::IceInternal::Handle< ::KeeICE::KFlib::CallbackReceiver> CallbackReceiverPtr;
typedef ::IceInternal::ProxyHandle< ::IceProxy::KeeICE::KFlib::CallbackReceiver> CallbackReceiverPrx;

void __read(::IceInternal::BasicStream*, CallbackReceiverPrx&);
void __patch__CallbackReceiverPtr(void*, ::Ice::ObjectPtr&);

}

}

namespace KeeICE
{

namespace KFlib
{

enum loginSearchType
{
    LSTall,
    LSTnoForms,
    LSTnoRealms
};

void __write(::IceInternal::BasicStream*, loginSearchType);
void __read(::IceInternal::BasicStream*, loginSearchType&);

enum formFieldType
{
    FFTradio,
    FFTusername,
    FFTtext,
    FFTpassword,
    FFTselect,
    FFTcheckbox
};

void __write(::IceInternal::BasicStream*, formFieldType);
void __read(::IceInternal::BasicStream*, formFieldType&);

struct KPFormField
{
    ::std::string name;
    ::std::string displayName;
    ::std::string value;
    ::KeeICE::KFlib::formFieldType type;
    ::std::string id;

    bool operator==(const KPFormField&) const;
    bool operator<(const KPFormField&) const;
    bool operator!=(const KPFormField& __rhs) const
    {
        return !operator==(__rhs);
    }
    bool operator<=(const KPFormField& __rhs) const
    {
        return operator<(__rhs) || operator==(__rhs);
    }
    bool operator>(const KPFormField& __rhs) const
    {
        return !operator<(__rhs) && !operator==(__rhs);
    }
    bool operator>=(const KPFormField& __rhs) const
    {
        return !operator<(__rhs);
    }

    void __write(::IceInternal::BasicStream*) const;
    void __read(::IceInternal::BasicStream*);
};

typedef ::std::vector< ::KeeICE::KFlib::KPFormField> KPFormFieldList;
void __writeKPFormFieldList(::IceInternal::BasicStream*, const ::KeeICE::KFlib::KPFormField*, const ::KeeICE::KFlib::KPFormField*);
void __readKPFormFieldList(::IceInternal::BasicStream*, KPFormFieldList&);

struct KPGroup
{
    ::std::string title;
    ::std::string uniqueID;

    bool operator==(const KPGroup&) const;
    bool operator<(const KPGroup&) const;
    bool operator!=(const KPGroup& __rhs) const
    {
        return !operator==(__rhs);
    }
    bool operator<=(const KPGroup& __rhs) const
    {
        return operator<(__rhs) || operator==(__rhs);
    }
    bool operator>(const KPGroup& __rhs) const
    {
        return !operator<(__rhs) && !operator==(__rhs);
    }
    bool operator>=(const KPGroup& __rhs) const
    {
        return !operator<(__rhs);
    }

    void __write(::IceInternal::BasicStream*) const;
    void __read(::IceInternal::BasicStream*);
};

typedef ::std::vector< ::KeeICE::KFlib::KPGroup> KPGroupList;
void __writeKPGroupList(::IceInternal::BasicStream*, const ::KeeICE::KFlib::KPGroup*, const ::KeeICE::KFlib::KPGroup*);
void __readKPGroupList(::IceInternal::BasicStream*, KPGroupList&);

struct KPEntry
{
    ::std::string URL;
    ::std::string formActionURL;
    ::std::string HTTPRealm;
    ::std::string title;
    ::KeeICE::KFlib::KPFormFieldList formFieldList;
    bool _cpp_default;
    bool exactMatch;
    ::std::string uniqueID;

    bool operator==(const KPEntry&) const;
    bool operator<(const KPEntry&) const;
    bool operator!=(const KPEntry& __rhs) const
    {
        return !operator==(__rhs);
    }
    bool operator<=(const KPEntry& __rhs) const
    {
        return operator<(__rhs) || operator==(__rhs);
    }
    bool operator>(const KPEntry& __rhs) const
    {
        return !operator<(__rhs) && !operator==(__rhs);
    }
    bool operator>=(const KPEntry& __rhs) const
    {
        return !operator<(__rhs);
    }

    void __write(::IceInternal::BasicStream*) const;
    void __read(::IceInternal::BasicStream*);
};

typedef ::std::vector< ::KeeICE::KFlib::KPEntry> KPEntryList;
void __writeKPEntryList(::IceInternal::BasicStream*, const ::KeeICE::KFlib::KPEntry*, const ::KeeICE::KFlib::KPEntry*);
void __readKPEntryList(::IceInternal::BasicStream*, KPEntryList&);

class KeeICEException : public ::Ice::UserException
{
public:

    KeeICEException() {}
    explicit KeeICEException(const ::std::string&);
    virtual ~KeeICEException() throw();

    virtual ::std::string ice_name() const;
    virtual ::Ice::Exception* ice_clone() const;
    virtual void ice_throw() const;

    static const ::IceInternal::UserExceptionFactoryPtr& ice_factory();

    ::std::string reason;

    virtual void __write(::IceInternal::BasicStream*) const;
    virtual void __read(::IceInternal::BasicStream*, bool);
};

static KeeICEException __KeeICEException_init;

struct KPDatabase
{
    ::std::string DBname;
    ::std::string fileName;
    bool _cpp_default;
    ::std::string rootGroupUID;
    bool useILM;

    bool operator==(const KPDatabase&) const;
    bool operator<(const KPDatabase&) const;
    bool operator!=(const KPDatabase& __rhs) const
    {
        return !operator==(__rhs);
    }
    bool operator<=(const KPDatabase& __rhs) const
    {
        return operator<(__rhs) || operator==(__rhs);
    }
    bool operator>(const KPDatabase& __rhs) const
    {
        return !operator<(__rhs) && !operator==(__rhs);
    }
    bool operator>=(const KPDatabase& __rhs) const
    {
        return !operator<(__rhs);
    }

    void __write(::IceInternal::BasicStream*) const;
    void __read(::IceInternal::BasicStream*);
};

typedef ::std::vector< ::KeeICE::KFlib::KPDatabase> KPDatabaseList;
void __writeKPDatabaseList(::IceInternal::BasicStream*, const ::KeeICE::KFlib::KPDatabase*, const ::KeeICE::KFlib::KPDatabase*);
void __readKPDatabaseList(::IceInternal::BasicStream*, KPDatabaseList&);

struct KFConfiguration
{
    bool allowUnencryptedMetaData;
    ::KeeICE::KFlib::KPDatabaseList knownDatabases;

    bool operator==(const KFConfiguration&) const;
    bool operator<(const KFConfiguration&) const;
    bool operator!=(const KFConfiguration& __rhs) const
    {
        return !operator==(__rhs);
    }
    bool operator<=(const KFConfiguration& __rhs) const
    {
        return operator<(__rhs) || operator==(__rhs);
    }
    bool operator>(const KFConfiguration& __rhs) const
    {
        return !operator<(__rhs) && !operator==(__rhs);
    }
    bool operator>=(const KFConfiguration& __rhs) const
    {
        return !operator<(__rhs);
    }

    void __write(::IceInternal::BasicStream*) const;
    void __read(::IceInternal::BasicStream*);
};

}

}

namespace KeeICE
{

namespace KFlib
{

class KP : virtual public ::Ice::Object
{
public:

    typedef KPPrx ProxyType;
    typedef KPPtr PointerType;
    

    virtual bool ice_isA(const ::std::string&, const ::Ice::Current& = ::Ice::Current()) const;
    virtual ::std::vector< ::std::string> ice_ids(const ::Ice::Current& = ::Ice::Current()) const;
    virtual const ::std::string& ice_id(const ::Ice::Current& = ::Ice::Current()) const;
    static const ::std::string& ice_staticId();

    virtual bool checkVersion(::Ice::Float, ::Ice::Float, ::Ice::Int&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___checkVersion(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual ::std::string getDatabaseName(const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___getDatabaseName(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual ::std::string getDatabaseFileName(const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___getDatabaseFileName(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual void changeDatabase(const ::std::string&, bool, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___changeDatabase(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual ::KeeICE::KFlib::KPEntry AddLogin(const ::KeeICE::KFlib::KPEntry&, const ::std::string&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___AddLogin(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual void ModifyLogin(const ::KeeICE::KFlib::KPEntry&, const ::KeeICE::KFlib::KPEntry&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___ModifyLogin(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual ::Ice::Int getAllLogins(::KeeICE::KFlib::KPEntryList&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___getAllLogins(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual ::Ice::Int findLogins(const ::std::string&, const ::std::string&, const ::std::string&, ::KeeICE::KFlib::loginSearchType, bool, const ::std::string&, ::KeeICE::KFlib::KPEntryList&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___findLogins(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual ::Ice::Int countLogins(const ::std::string&, const ::std::string&, const ::std::string&, ::KeeICE::KFlib::loginSearchType, bool, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___countLogins(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual void addClient(const ::Ice::Identity&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___addClient(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual ::Ice::Int findGroups(const ::std::string&, const ::std::string&, ::KeeICE::KFlib::KPGroupList&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___findGroups(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual ::KeeICE::KFlib::KPGroup getRoot(const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___getRoot(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual ::KeeICE::KFlib::KPGroup getParent(const ::std::string&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___getParent(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual ::KeeICE::KFlib::KPGroupList getChildGroups(const ::std::string&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___getChildGroups(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual ::KeeICE::KFlib::KPEntryList getChildEntries(const ::std::string&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___getChildEntries(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual ::KeeICE::KFlib::KPGroup addGroup(const ::std::string&, const ::std::string&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___addGroup(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual bool removeGroup(const ::std::string&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___removeGroup(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual bool removeEntry(const ::std::string&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___removeEntry(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual void LaunchGroupEditor(const ::std::string&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___LaunchGroupEditor(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual void LaunchLoginEditor(const ::std::string&, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___LaunchLoginEditor(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
    virtual ::Ice::DispatchStatus __dispatch(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual void __write(::IceInternal::BasicStream*) const;
    virtual void __read(::IceInternal::BasicStream*, bool);
};

class CallbackReceiver : virtual public ::Ice::Object
{
public:

    typedef CallbackReceiverPrx ProxyType;
    typedef CallbackReceiverPtr PointerType;
    

    virtual bool ice_isA(const ::std::string&, const ::Ice::Current& = ::Ice::Current()) const;
    virtual ::std::vector< ::std::string> ice_ids(const ::Ice::Current& = ::Ice::Current()) const;
    virtual const ::std::string& ice_id(const ::Ice::Current& = ::Ice::Current()) const;
    static const ::std::string& ice_staticId();

    virtual void callback(::Ice::Int, const ::Ice::Current& = ::Ice::Current()) = 0;
#ifndef ICEE_PURE_CLIENT
    ::Ice::DispatchStatus ___callback(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

#ifndef ICEE_PURE_CLIENT
    virtual ::Ice::DispatchStatus __dispatch(::IceInternal::Incoming&, const ::Ice::Current&);
#endif // ICEE_PURE_CLIENT

    virtual void __write(::IceInternal::BasicStream*) const;
    virtual void __read(::IceInternal::BasicStream*, bool);
};

}

}

namespace IceProxy
{

namespace KeeICE
{

namespace KFlib
{

class KP : virtual public ::IceProxy::Ice::Object
{
public:

    bool checkVersion(::Ice::Float keeFoxVersion, ::Ice::Float keeICEVersion, ::Ice::Int& result)
    {
        return checkVersion(keeFoxVersion, keeICEVersion, result, 0);
    }
    bool checkVersion(::Ice::Float keeFoxVersion, ::Ice::Float keeICEVersion, ::Ice::Int& result, const ::Ice::Context& __ctx)
    {
        return checkVersion(keeFoxVersion, keeICEVersion, result, &__ctx);
    }
    
private:

    bool checkVersion(::Ice::Float, ::Ice::Float, ::Ice::Int&, const ::Ice::Context*);
    
public:

    ::std::string getDatabaseName()
    {
        return getDatabaseName(0);
    }
    ::std::string getDatabaseName(const ::Ice::Context& __ctx)
    {
        return getDatabaseName(&__ctx);
    }
    
private:

    ::std::string getDatabaseName(const ::Ice::Context*);
    
public:

    ::std::string getDatabaseFileName()
    {
        return getDatabaseFileName(0);
    }
    ::std::string getDatabaseFileName(const ::Ice::Context& __ctx)
    {
        return getDatabaseFileName(&__ctx);
    }
    
private:

    ::std::string getDatabaseFileName(const ::Ice::Context*);
    
public:

    void changeDatabase(const ::std::string& fileName, bool closeCurrent)
    {
        changeDatabase(fileName, closeCurrent, 0);
    }
    void changeDatabase(const ::std::string& fileName, bool closeCurrent, const ::Ice::Context& __ctx)
    {
        changeDatabase(fileName, closeCurrent, &__ctx);
    }
    
private:

    void changeDatabase(const ::std::string&, bool, const ::Ice::Context*);
    
public:

    ::KeeICE::KFlib::KPEntry AddLogin(const ::KeeICE::KFlib::KPEntry& login, const ::std::string& parentUUID)
    {
        return AddLogin(login, parentUUID, 0);
    }
    ::KeeICE::KFlib::KPEntry AddLogin(const ::KeeICE::KFlib::KPEntry& login, const ::std::string& parentUUID, const ::Ice::Context& __ctx)
    {
        return AddLogin(login, parentUUID, &__ctx);
    }
    
private:

    ::KeeICE::KFlib::KPEntry AddLogin(const ::KeeICE::KFlib::KPEntry&, const ::std::string&, const ::Ice::Context*);
    
public:

    void ModifyLogin(const ::KeeICE::KFlib::KPEntry& oldLogin, const ::KeeICE::KFlib::KPEntry& newLogin)
    {
        ModifyLogin(oldLogin, newLogin, 0);
    }
    void ModifyLogin(const ::KeeICE::KFlib::KPEntry& oldLogin, const ::KeeICE::KFlib::KPEntry& newLogin, const ::Ice::Context& __ctx)
    {
        ModifyLogin(oldLogin, newLogin, &__ctx);
    }
    
private:

    void ModifyLogin(const ::KeeICE::KFlib::KPEntry&, const ::KeeICE::KFlib::KPEntry&, const ::Ice::Context*);
    
public:

    ::Ice::Int getAllLogins(::KeeICE::KFlib::KPEntryList& logins)
    {
        return getAllLogins(logins, 0);
    }
    ::Ice::Int getAllLogins(::KeeICE::KFlib::KPEntryList& logins, const ::Ice::Context& __ctx)
    {
        return getAllLogins(logins, &__ctx);
    }
    
private:

    ::Ice::Int getAllLogins(::KeeICE::KFlib::KPEntryList&, const ::Ice::Context*);
    
public:

    ::Ice::Int findLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches, const ::std::string& uniqueID, ::KeeICE::KFlib::KPEntryList& logins)
    {
        return findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, uniqueID, logins, 0);
    }
    ::Ice::Int findLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches, const ::std::string& uniqueID, ::KeeICE::KFlib::KPEntryList& logins, const ::Ice::Context& __ctx)
    {
        return findLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, uniqueID, logins, &__ctx);
    }
    
private:

    ::Ice::Int findLogins(const ::std::string&, const ::std::string&, const ::std::string&, ::KeeICE::KFlib::loginSearchType, bool, const ::std::string&, ::KeeICE::KFlib::KPEntryList&, const ::Ice::Context*);
    
public:

    ::Ice::Int countLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches)
    {
        return countLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, 0);
    }
    ::Ice::Int countLogins(const ::std::string& hostname, const ::std::string& actionURL, const ::std::string& httpRealm, ::KeeICE::KFlib::loginSearchType lst, bool requireFullURLMatches, const ::Ice::Context& __ctx)
    {
        return countLogins(hostname, actionURL, httpRealm, lst, requireFullURLMatches, &__ctx);
    }
    
private:

    ::Ice::Int countLogins(const ::std::string&, const ::std::string&, const ::std::string&, ::KeeICE::KFlib::loginSearchType, bool, const ::Ice::Context*);
    
public:

    void addClient(const ::Ice::Identity& ident)
    {
        addClient(ident, 0);
    }
    void addClient(const ::Ice::Identity& ident, const ::Ice::Context& __ctx)
    {
        addClient(ident, &__ctx);
    }
    
private:

    void addClient(const ::Ice::Identity&, const ::Ice::Context*);
    
public:

    ::Ice::Int findGroups(const ::std::string& name, const ::std::string& uuid, ::KeeICE::KFlib::KPGroupList& groups)
    {
        return findGroups(name, uuid, groups, 0);
    }
    ::Ice::Int findGroups(const ::std::string& name, const ::std::string& uuid, ::KeeICE::KFlib::KPGroupList& groups, const ::Ice::Context& __ctx)
    {
        return findGroups(name, uuid, groups, &__ctx);
    }
    
private:

    ::Ice::Int findGroups(const ::std::string&, const ::std::string&, ::KeeICE::KFlib::KPGroupList&, const ::Ice::Context*);
    
public:

    ::KeeICE::KFlib::KPGroup getRoot()
    {
        return getRoot(0);
    }
    ::KeeICE::KFlib::KPGroup getRoot(const ::Ice::Context& __ctx)
    {
        return getRoot(&__ctx);
    }
    
private:

    ::KeeICE::KFlib::KPGroup getRoot(const ::Ice::Context*);
    
public:

    ::KeeICE::KFlib::KPGroup getParent(const ::std::string& uuid)
    {
        return getParent(uuid, 0);
    }
    ::KeeICE::KFlib::KPGroup getParent(const ::std::string& uuid, const ::Ice::Context& __ctx)
    {
        return getParent(uuid, &__ctx);
    }
    
private:

    ::KeeICE::KFlib::KPGroup getParent(const ::std::string&, const ::Ice::Context*);
    
public:

    ::KeeICE::KFlib::KPGroupList getChildGroups(const ::std::string& uuid)
    {
        return getChildGroups(uuid, 0);
    }
    ::KeeICE::KFlib::KPGroupList getChildGroups(const ::std::string& uuid, const ::Ice::Context& __ctx)
    {
        return getChildGroups(uuid, &__ctx);
    }
    
private:

    ::KeeICE::KFlib::KPGroupList getChildGroups(const ::std::string&, const ::Ice::Context*);
    
public:

    ::KeeICE::KFlib::KPEntryList getChildEntries(const ::std::string& uuid)
    {
        return getChildEntries(uuid, 0);
    }
    ::KeeICE::KFlib::KPEntryList getChildEntries(const ::std::string& uuid, const ::Ice::Context& __ctx)
    {
        return getChildEntries(uuid, &__ctx);
    }
    
private:

    ::KeeICE::KFlib::KPEntryList getChildEntries(const ::std::string&, const ::Ice::Context*);
    
public:

    ::KeeICE::KFlib::KPGroup addGroup(const ::std::string& name, const ::std::string& parentUuid)
    {
        return addGroup(name, parentUuid, 0);
    }
    ::KeeICE::KFlib::KPGroup addGroup(const ::std::string& name, const ::std::string& parentUuid, const ::Ice::Context& __ctx)
    {
        return addGroup(name, parentUuid, &__ctx);
    }
    
private:

    ::KeeICE::KFlib::KPGroup addGroup(const ::std::string&, const ::std::string&, const ::Ice::Context*);
    
public:

    bool removeGroup(const ::std::string& uuid)
    {
        return removeGroup(uuid, 0);
    }
    bool removeGroup(const ::std::string& uuid, const ::Ice::Context& __ctx)
    {
        return removeGroup(uuid, &__ctx);
    }
    
private:

    bool removeGroup(const ::std::string&, const ::Ice::Context*);
    
public:

    bool removeEntry(const ::std::string& uuid)
    {
        return removeEntry(uuid, 0);
    }
    bool removeEntry(const ::std::string& uuid, const ::Ice::Context& __ctx)
    {
        return removeEntry(uuid, &__ctx);
    }
    
private:

    bool removeEntry(const ::std::string&, const ::Ice::Context*);
    
public:

    void LaunchGroupEditor(const ::std::string& uuid)
    {
        LaunchGroupEditor(uuid, 0);
    }
    void LaunchGroupEditor(const ::std::string& uuid, const ::Ice::Context& __ctx)
    {
        LaunchGroupEditor(uuid, &__ctx);
    }
    
private:

    void LaunchGroupEditor(const ::std::string&, const ::Ice::Context*);
    
public:

    void LaunchLoginEditor(const ::std::string& uuid)
    {
        LaunchLoginEditor(uuid, 0);
    }
    void LaunchLoginEditor(const ::std::string& uuid, const ::Ice::Context& __ctx)
    {
        LaunchLoginEditor(uuid, &__ctx);
    }
    
private:

    void LaunchLoginEditor(const ::std::string&, const ::Ice::Context*);
    
public:
    
    ::IceInternal::ProxyHandle<KP> ice_context(const ::Ice::Context& __context) const
    {
        return dynamic_cast<KP*>(::IceProxy::Ice::Object::ice_context(__context).get());
    }
    
    ::IceInternal::ProxyHandle<KP> ice_secure(bool __secure) const
    {
        return dynamic_cast<KP*>(::IceProxy::Ice::Object::ice_secure(__secure).get());
    }
    
#ifdef ICEE_HAS_ROUTER
    ::IceInternal::ProxyHandle<KP> ice_router(const ::Ice::RouterPrx& __router) const
    {
        return dynamic_cast<KP*>(::IceProxy::Ice::Object::ice_router(__router).get());
    }
#endif // ICEE_HAS_ROUTER
    
#ifdef ICEE_HAS_LOCATOR
    ::IceInternal::ProxyHandle<KP> ice_locator(const ::Ice::LocatorPrx& __locator) const
    {
        return dynamic_cast<KP*>(::IceProxy::Ice::Object::ice_locator(__locator).get());
    }
    
    ::IceInternal::ProxyHandle<KP> ice_adapterId(const std::string& __id) const
    {
        return dynamic_cast<KP*>(::IceProxy::Ice::Object::ice_adapterId(__id).get());
    }
#endif // ICEE_HAS_LOCATOR
    
    ::IceInternal::ProxyHandle<KP> ice_twoway() const
    {
        return dynamic_cast<KP*>(::IceProxy::Ice::Object::ice_twoway().get());
    }
    
    ::IceInternal::ProxyHandle<KP> ice_oneway() const
    {
        return dynamic_cast<KP*>(::IceProxy::Ice::Object::ice_oneway().get());
    }
    
    ::IceInternal::ProxyHandle<KP> ice_batchOneway() const
    {
        return dynamic_cast<KP*>(::IceProxy::Ice::Object::ice_batchOneway().get());
    }
    
    ::IceInternal::ProxyHandle<KP> ice_datagram() const
    {
        return dynamic_cast<KP*>(::IceProxy::Ice::Object::ice_datagram().get());
    }
    
    ::IceInternal::ProxyHandle<KP> ice_batchDatagram() const
    {
        return dynamic_cast<KP*>(::IceProxy::Ice::Object::ice_batchDatagram().get());
    }
    
    ::IceInternal::ProxyHandle<KP> ice_timeout(int __timeout) const
    {
        return dynamic_cast<KP*>(::IceProxy::Ice::Object::ice_timeout(__timeout).get());
    }
    
    static const ::std::string& ice_staticId();
    
private:
    
    virtual ::IceProxy::Ice::Object* __newInstance() const;
};

class CallbackReceiver : virtual public ::IceProxy::Ice::Object
{
public:

    void callback(::Ice::Int num)
    {
        callback(num, 0);
    }
    void callback(::Ice::Int num, const ::Ice::Context& __ctx)
    {
        callback(num, &__ctx);
    }
    
private:

    void callback(::Ice::Int, const ::Ice::Context*);
    
public:
    
    ::IceInternal::ProxyHandle<CallbackReceiver> ice_context(const ::Ice::Context& __context) const
    {
        return dynamic_cast<CallbackReceiver*>(::IceProxy::Ice::Object::ice_context(__context).get());
    }
    
    ::IceInternal::ProxyHandle<CallbackReceiver> ice_secure(bool __secure) const
    {
        return dynamic_cast<CallbackReceiver*>(::IceProxy::Ice::Object::ice_secure(__secure).get());
    }
    
#ifdef ICEE_HAS_ROUTER
    ::IceInternal::ProxyHandle<CallbackReceiver> ice_router(const ::Ice::RouterPrx& __router) const
    {
        return dynamic_cast<CallbackReceiver*>(::IceProxy::Ice::Object::ice_router(__router).get());
    }
#endif // ICEE_HAS_ROUTER
    
#ifdef ICEE_HAS_LOCATOR
    ::IceInternal::ProxyHandle<CallbackReceiver> ice_locator(const ::Ice::LocatorPrx& __locator) const
    {
        return dynamic_cast<CallbackReceiver*>(::IceProxy::Ice::Object::ice_locator(__locator).get());
    }
    
    ::IceInternal::ProxyHandle<CallbackReceiver> ice_adapterId(const std::string& __id) const
    {
        return dynamic_cast<CallbackReceiver*>(::IceProxy::Ice::Object::ice_adapterId(__id).get());
    }
#endif // ICEE_HAS_LOCATOR
    
    ::IceInternal::ProxyHandle<CallbackReceiver> ice_twoway() const
    {
        return dynamic_cast<CallbackReceiver*>(::IceProxy::Ice::Object::ice_twoway().get());
    }
    
    ::IceInternal::ProxyHandle<CallbackReceiver> ice_oneway() const
    {
        return dynamic_cast<CallbackReceiver*>(::IceProxy::Ice::Object::ice_oneway().get());
    }
    
    ::IceInternal::ProxyHandle<CallbackReceiver> ice_batchOneway() const
    {
        return dynamic_cast<CallbackReceiver*>(::IceProxy::Ice::Object::ice_batchOneway().get());
    }
    
    ::IceInternal::ProxyHandle<CallbackReceiver> ice_datagram() const
    {
        return dynamic_cast<CallbackReceiver*>(::IceProxy::Ice::Object::ice_datagram().get());
    }
    
    ::IceInternal::ProxyHandle<CallbackReceiver> ice_batchDatagram() const
    {
        return dynamic_cast<CallbackReceiver*>(::IceProxy::Ice::Object::ice_batchDatagram().get());
    }
    
    ::IceInternal::ProxyHandle<CallbackReceiver> ice_timeout(int __timeout) const
    {
        return dynamic_cast<CallbackReceiver*>(::IceProxy::Ice::Object::ice_timeout(__timeout).get());
    }
    
    static const ::std::string& ice_staticId();
    
private:
    
    virtual ::IceProxy::Ice::Object* __newInstance() const;
};

}

}

}

#endif
