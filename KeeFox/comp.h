/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM comp.idl
 */

#ifndef __gen_comp_h__
#define __gen_comp_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

#ifndef __gen_nsILoginInfo_h__
#include "nsILoginInfo.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    kfILoginInfo */
#define KFILOGININFO_IID_STR "7ed5ba34-1375-4887-86fd-0682ddfaa870"

#define KFILOGININFO_IID \
  {0x7ed5ba34, 0x1375, 0x4887, \
    { 0x86, 0xfd, 0x06, 0x82, 0xdd, 0xfa, 0xa8, 0x70 }}

class NS_NO_VTABLE NS_SCRIPTABLE kfILoginInfo : public nsILoginInfo {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(KFILOGININFO_IID)

};

  NS_DEFINE_STATIC_IID_ACCESSOR(kfILoginInfo, KFILOGININFO_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_KFILOGININFO \
  /* no methods! */

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_KFILOGININFO(_to) \
  /* no methods! */

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_KFILOGININFO(_to) \
  /* no methods! */

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class kfLoginInfo : public kfILoginInfo
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_KFILOGININFO

  kfLoginInfo();

private:
  ~kfLoginInfo();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(kfLoginInfo, kfILoginInfo)

kfLoginInfo::kfLoginInfo()
{
  /* member initializers and constructor code */
}

kfLoginInfo::~kfLoginInfo()
{
  /* destructor code */
}

/* End of implementation class template. */
#endif


/* starting interface:    KeeFoxObserver */
#define KEEFOXOBSERVER_IID_STR "7ed5ba34-1375-4887-86fd-0682ddfaa872"

#define KEEFOXOBSERVER_IID \
  {0x7ed5ba34, 0x1375, 0x4887, \
    { 0x86, 0xfd, 0x06, 0x82, 0xdd, 0xfa, 0xa8, 0x72 }}

class NS_NO_VTABLE NS_SCRIPTABLE KeeFoxObserver : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(KEEFOXOBSERVER_IID)

  /* void callBackToKeeFoxJS (in long word); */
  NS_SCRIPTABLE NS_IMETHOD CallBackToKeeFoxJS(PRInt32 word) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(KeeFoxObserver, KEEFOXOBSERVER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_KEEFOXOBSERVER \
  NS_SCRIPTABLE NS_IMETHOD CallBackToKeeFoxJS(PRInt32 word); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_KEEFOXOBSERVER(_to) \
  NS_SCRIPTABLE NS_IMETHOD CallBackToKeeFoxJS(PRInt32 word) { return _to CallBackToKeeFoxJS(word); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_KEEFOXOBSERVER(_to) \
  NS_SCRIPTABLE NS_IMETHOD CallBackToKeeFoxJS(PRInt32 word) { return !_to ? NS_ERROR_NULL_POINTER : _to->CallBackToKeeFoxJS(word); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class _MYCLASS_ : public KeeFoxObserver
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_KEEFOXOBSERVER

  _MYCLASS_();

private:
  ~_MYCLASS_();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(_MYCLASS_, KeeFoxObserver)

_MYCLASS_::_MYCLASS_()
{
  /* member initializers and constructor code */
}

_MYCLASS_::~_MYCLASS_()
{
  /* destructor code */
}

/* void callBackToKeeFoxJS (in long word); */
NS_IMETHODIMP _MYCLASS_::CallBackToKeeFoxJS(PRInt32 word)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    IKeeFox */
#define IKEEFOX_IID_STR "7ed5ba34-1375-4887-86fd-0682ddfaa871"

#define IKEEFOX_IID \
  {0x7ed5ba34, 0x1375, 0x4887, \
    { 0x86, 0xfd, 0x06, 0x82, 0xdd, 0xfa, 0xa8, 0x71 }}

class NS_NO_VTABLE NS_SCRIPTABLE IKeeFox : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(IKEEFOX_IID)

  /* boolean checkVersion (in float keeFoxVersion, in float keeICEVersion, out long result); */
  NS_SCRIPTABLE NS_IMETHOD CheckVersion(float keeFoxVersion, float keeICEVersion, PRInt32 *result, PRBool *_retval) = 0;

  /* void addObserver (in KeeFoxObserver observer); */
  NS_SCRIPTABLE NS_IMETHOD AddObserver(KeeFoxObserver *observer) = 0;

  /* long add (in long a, in long b); */
  NS_SCRIPTABLE NS_IMETHOD Add(PRInt32 a, PRInt32 b, PRInt32 *_retval) = 0;

  /* AString getDBName (); */
  NS_SCRIPTABLE NS_IMETHOD GetDBName(nsAString & _retval) = 0;

  /* attribute AString name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) = 0;

  /**
     * Store a new login.
     *
     * @param aLogin
     *        The login to be added.
     */
  /* void addLogin (in kfILoginInfo aLogin); */
  NS_SCRIPTABLE NS_IMETHOD AddLogin(kfILoginInfo *aLogin) = 0;

  /**
     * Remove a login from the login manager.
     *
     * @param aLogin
     *        The login to be removed.
     */
  /* void removeLogin (in kfILoginInfo aLogin); */
  NS_SCRIPTABLE NS_IMETHOD RemoveLogin(kfILoginInfo *aLogin) = 0;

  /**
     * Modify an existing login in the login manager.
     *
     * @param aLogin
     *        The login to be modified.
     */
  /* void modifyLogin (in kfILoginInfo oldLogin, in kfILoginInfo newLogin); */
  NS_SCRIPTABLE NS_IMETHOD ModifyLogin(kfILoginInfo *oldLogin, kfILoginInfo *newLogin) = 0;

  /**
     * Fetch all logins in the login manager. An array is always returned;
     * if there are no logins the array is empty.
     *
     * @param count
     *        The number of elements in the array. JS callers can simply use
     *        the array's .length property, and supply an dummy object for
     *        this out param. For example: |getAllLogins({})|
     * @param logins
     *        An array of nsILoginInfo objects. 
     *
     * NOTE: This can be called from JS as:
     *       var logins = pwmgr.getAllLogins({});
     *       (|logins| is an array).
     */
  /* void getAllLogins (out unsigned long count, [array, size_is (count), retval] out kfILoginInfo logins); */
  NS_SCRIPTABLE NS_IMETHOD GetAllLogins(PRUint32 *count, kfILoginInfo ***logins) = 0;

  /**
     * Search for logins matching the specified criteria. Called when looking
     * for logins that might be applicable to a form or authentication request.
     *
     * @param count
     *        The number of elements in the array. JS callers can simply use
     *        the array's .length property, and supply an dummy object for
     *        this out param. For example: |findLogins({}, hostname, ...)|
     * @param aHostname
     *        The hostname to restrict searches to, in URL format. For
     *        example: "http://www.site.com".
     * @param aActionURL
     *        For form logins, this argument should be the URL to which the
     *        form will be submitted. For protocol logins, specify null.
     * @param aHttpRealm
     *        For protocol logins, this argument should be the HTTP Realm
     *        for which the login applies. This is obtained from the
     *        WWW-Authenticate header. See RFC2617. For form logins,
     *        specify null.
     * @param logins
     *        An array of nsILoginInfo objects. 
     *
     * NOTE: This can be called from JS as:
     *       var logins = pwmgr.findLogins({}, hostname, ...);
     *
     */
  /* void findLogins (out unsigned long count, in AString aHostname, in AString aActionURL, in AString aHttpRealm, [array, size_is (count), retval] out kfILoginInfo logins); */
  NS_SCRIPTABLE NS_IMETHOD FindLogins(PRUint32 *count, const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, kfILoginInfo ***logins) = 0;

  /**
    * Search for logins matching the specified criteria, as with
    * findLogins(). This interface only returns the number of matching
    * logins (and not the logins themselves), which allows a caller to
    * check for logins without causing the user to be prompted for a master
    * password to decrypt the logins.
    *
    * @param aHostname
    *        The hostname to restrict searches to. Specify an empty string
    *        to match all hosts. A null value will not match any logins, and
    *        will thus always return a count of 0.
    * @param aActionURL
    *        The URL to which a form login will be submitted. To match any
    *        form login, specify an empty string. To not match any form
    *        login, specify null.
    * @param aHttpRealm
    *        The HTTP Realm for which the login applies. To match logins for
    *        any realm, specify an empty string. To not match logins for any
    *        realm, specify null.
    */
  /* unsigned long countLogins (in AString aHostname, in AString aActionURL, in AString aHttpRealm); */
  NS_SCRIPTABLE NS_IMETHOD CountLogins(const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, PRUint32 *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(IKeeFox, IKEEFOX_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_IKEEFOX \
  NS_SCRIPTABLE NS_IMETHOD CheckVersion(float keeFoxVersion, float keeICEVersion, PRInt32 *result, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD AddObserver(KeeFoxObserver *observer); \
  NS_SCRIPTABLE NS_IMETHOD Add(PRInt32 a, PRInt32 b, PRInt32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetDBName(nsAString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD AddLogin(kfILoginInfo *aLogin); \
  NS_SCRIPTABLE NS_IMETHOD RemoveLogin(kfILoginInfo *aLogin); \
  NS_SCRIPTABLE NS_IMETHOD ModifyLogin(kfILoginInfo *oldLogin, kfILoginInfo *newLogin); \
  NS_SCRIPTABLE NS_IMETHOD GetAllLogins(PRUint32 *count, kfILoginInfo ***logins); \
  NS_SCRIPTABLE NS_IMETHOD FindLogins(PRUint32 *count, const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, kfILoginInfo ***logins); \
  NS_SCRIPTABLE NS_IMETHOD CountLogins(const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, PRUint32 *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_IKEEFOX(_to) \
  NS_SCRIPTABLE NS_IMETHOD CheckVersion(float keeFoxVersion, float keeICEVersion, PRInt32 *result, PRBool *_retval) { return _to CheckVersion(keeFoxVersion, keeICEVersion, result, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD AddObserver(KeeFoxObserver *observer) { return _to AddObserver(observer); } \
  NS_SCRIPTABLE NS_IMETHOD Add(PRInt32 a, PRInt32 b, PRInt32 *_retval) { return _to Add(a, b, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetDBName(nsAString & _retval) { return _to GetDBName(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD AddLogin(kfILoginInfo *aLogin) { return _to AddLogin(aLogin); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveLogin(kfILoginInfo *aLogin) { return _to RemoveLogin(aLogin); } \
  NS_SCRIPTABLE NS_IMETHOD ModifyLogin(kfILoginInfo *oldLogin, kfILoginInfo *newLogin) { return _to ModifyLogin(oldLogin, newLogin); } \
  NS_SCRIPTABLE NS_IMETHOD GetAllLogins(PRUint32 *count, kfILoginInfo ***logins) { return _to GetAllLogins(count, logins); } \
  NS_SCRIPTABLE NS_IMETHOD FindLogins(PRUint32 *count, const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, kfILoginInfo ***logins) { return _to FindLogins(count, aHostname, aActionURL, aHttpRealm, logins); } \
  NS_SCRIPTABLE NS_IMETHOD CountLogins(const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, PRUint32 *_retval) { return _to CountLogins(aHostname, aActionURL, aHttpRealm, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_IKEEFOX(_to) \
  NS_SCRIPTABLE NS_IMETHOD CheckVersion(float keeFoxVersion, float keeICEVersion, PRInt32 *result, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CheckVersion(keeFoxVersion, keeICEVersion, result, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD AddObserver(KeeFoxObserver *observer) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddObserver(observer); } \
  NS_SCRIPTABLE NS_IMETHOD Add(PRInt32 a, PRInt32 b, PRInt32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Add(a, b, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetDBName(nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDBName(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD AddLogin(kfILoginInfo *aLogin) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddLogin(aLogin); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveLogin(kfILoginInfo *aLogin) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveLogin(aLogin); } \
  NS_SCRIPTABLE NS_IMETHOD ModifyLogin(kfILoginInfo *oldLogin, kfILoginInfo *newLogin) { return !_to ? NS_ERROR_NULL_POINTER : _to->ModifyLogin(oldLogin, newLogin); } \
  NS_SCRIPTABLE NS_IMETHOD GetAllLogins(PRUint32 *count, kfILoginInfo ***logins) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAllLogins(count, logins); } \
  NS_SCRIPTABLE NS_IMETHOD FindLogins(PRUint32 *count, const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, kfILoginInfo ***logins) { return !_to ? NS_ERROR_NULL_POINTER : _to->FindLogins(count, aHostname, aActionURL, aHttpRealm, logins); } \
  NS_SCRIPTABLE NS_IMETHOD CountLogins(const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CountLogins(aHostname, aActionURL, aHttpRealm, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class _MYCLASS_ : public IKeeFox
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_IKEEFOX

  _MYCLASS_();

private:
  ~_MYCLASS_();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(_MYCLASS_, IKeeFox)

_MYCLASS_::_MYCLASS_()
{
  /* member initializers and constructor code */
}

_MYCLASS_::~_MYCLASS_()
{
  /* destructor code */
}

/* boolean checkVersion (in float keeFoxVersion, in float keeICEVersion, out long result); */
NS_IMETHODIMP _MYCLASS_::CheckVersion(float keeFoxVersion, float keeICEVersion, PRInt32 *result, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void addObserver (in KeeFoxObserver observer); */
NS_IMETHODIMP _MYCLASS_::AddObserver(KeeFoxObserver *observer)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* long add (in long a, in long b); */
NS_IMETHODIMP _MYCLASS_::Add(PRInt32 a, PRInt32 b, PRInt32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* AString getDBName (); */
NS_IMETHODIMP _MYCLASS_::GetDBName(nsAString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString name; */
NS_IMETHODIMP _MYCLASS_::GetName(nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP _MYCLASS_::SetName(const nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void addLogin (in kfILoginInfo aLogin); */
NS_IMETHODIMP _MYCLASS_::AddLogin(kfILoginInfo *aLogin)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void removeLogin (in kfILoginInfo aLogin); */
NS_IMETHODIMP _MYCLASS_::RemoveLogin(kfILoginInfo *aLogin)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void modifyLogin (in kfILoginInfo oldLogin, in kfILoginInfo newLogin); */
NS_IMETHODIMP _MYCLASS_::ModifyLogin(kfILoginInfo *oldLogin, kfILoginInfo *newLogin)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getAllLogins (out unsigned long count, [array, size_is (count), retval] out kfILoginInfo logins); */
NS_IMETHODIMP _MYCLASS_::GetAllLogins(PRUint32 *count, kfILoginInfo ***logins)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void findLogins (out unsigned long count, in AString aHostname, in AString aActionURL, in AString aHttpRealm, [array, size_is (count), retval] out kfILoginInfo logins); */
NS_IMETHODIMP _MYCLASS_::FindLogins(PRUint32 *count, const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, kfILoginInfo ***logins)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* unsigned long countLogins (in AString aHostname, in AString aActionURL, in AString aHttpRealm); */
NS_IMETHODIMP _MYCLASS_::CountLogins(const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, PRUint32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_comp_h__ */
