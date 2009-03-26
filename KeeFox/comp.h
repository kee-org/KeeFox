/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM comp.idl
 */

#ifndef __gen_comp_h__
#define __gen_comp_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

#ifndef __gen_nsIMutableArray_h__
#include "nsIMutableArray.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    kfILoginField */
#define KFILOGINFIELD_IID_STR "7ed5ba34-1375-4887-86fd-0682ddfaa873"

#define KFILOGINFIELD_IID \
  {0x7ed5ba34, 0x1375, 0x4887, \
    { 0x86, 0xfd, 0x06, 0x82, 0xdd, 0xfa, 0xa8, 0x73 }}

class NS_NO_VTABLE NS_SCRIPTABLE kfILoginField : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(KFILOGINFIELD_IID)

  /* attribute AString name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) = 0;

  /* attribute AString value; */
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) = 0;

  /* void init (in AString aName, in AString aValue); */
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & aName, const nsAString & aValue) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(kfILoginField, KFILOGINFIELD_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_KFILOGINFIELD \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue); \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue); \
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & aName, const nsAString & aValue); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_KFILOGINFIELD(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) { return _to GetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) { return _to SetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & aName, const nsAString & aValue) { return _to Init(aName, aValue); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_KFILOGINFIELD(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & aName, const nsAString & aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->Init(aName, aValue); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class kfLoginField : public kfILoginField
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_KFILOGINFIELD

  kfLoginField();

private:
  ~kfLoginField();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(kfLoginField, kfILoginField)

kfLoginField::kfLoginField()
{
  /* member initializers and constructor code */
}

kfLoginField::~kfLoginField()
{
  /* destructor code */
}

/* attribute AString name; */
NS_IMETHODIMP kfLoginField::GetName(nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginField::SetName(const nsAString & aName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString value; */
NS_IMETHODIMP kfLoginField::GetValue(nsAString & aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginField::SetValue(const nsAString & aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void init (in AString aName, in AString aValue); */
NS_IMETHODIMP kfLoginField::Init(const nsAString & aName, const nsAString & aValue)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    kfILoginInfo */
#define KFILOGININFO_IID_STR "7ed5ba34-1375-4887-86fd-0682ddfaa870"

#define KFILOGININFO_IID \
  {0x7ed5ba34, 0x1375, 0x4887, \
    { 0x86, 0xfd, 0x06, 0x82, 0xdd, 0xfa, 0xa8, 0x70 }}

class NS_NO_VTABLE NS_SCRIPTABLE kfILoginInfo : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(KFILOGININFO_IID)

  /**
     * The hostname the login applies to.
     *
     * The hostname should be formatted as an URL. For example,
     * "https://site.com", "http://site.com:1234", "ftp://ftp.site.com".
     */
  /* attribute AString hostname; */
  NS_SCRIPTABLE NS_IMETHOD GetHostname(nsAString & aHostname) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHostname(const nsAString & aHostname) = 0;

  /**
     * The URL a form-based login was submitted to.
     *
     * For logins obtained from HTML forms, this field is the |action|
     * attribute from the |form| element, with the path removed. For
     * example "http://www.site.com". [Forms with no |action| attribute
     * default to submitting to their origin URL, so we store that.]
     *
     * For logins obtained from a HTTP or FTP protocol authentication,
     * this field is NULL.
     */
  /* attribute AString formSubmitURL; */
  NS_SCRIPTABLE NS_IMETHOD GetFormSubmitURL(nsAString & aFormSubmitURL) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFormSubmitURL(const nsAString & aFormSubmitURL) = 0;

  /**
     * The HTTP Realm a login was requested for.
     *
     * When an HTTP server sends a 401 result, the WWW-Authenticate
     * header includes a realm to identify the "protection space." See
     * RFC2617. If the response sent has a missing or blank realm, the
     * hostname is used instead.
     *
     * For logins obtained from HTML forms, this field is NULL.
     */
  /* attribute AString httpRealm; */
  NS_SCRIPTABLE NS_IMETHOD GetHttpRealm(nsAString & aHttpRealm) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetHttpRealm(const nsAString & aHttpRealm) = 0;

  /**
     * The username for the login.
     */
  /* attribute AString username; */
  NS_SCRIPTABLE NS_IMETHOD GetUsername(nsAString & aUsername) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetUsername(const nsAString & aUsername) = 0;

  /**
     * The |name| attribute for the username input field.
     *
     * For logins obtained from a HTTP or FTP protocol authentication,
     * this field is NULL.
     */
  /* attribute AString usernameField; */
  NS_SCRIPTABLE NS_IMETHOD GetUsernameField(nsAString & aUsernameField) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetUsernameField(const nsAString & aUsernameField) = 0;

  /**
     * The password for the login.
     */
  /* attribute AString password; */
  NS_SCRIPTABLE NS_IMETHOD GetPassword(nsAString & aPassword) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetPassword(const nsAString & aPassword) = 0;

  /**
     * The |name| attribute for the password input field.
     *
     * For logins obtained from a HTTP or FTP protocol authentication,
     * this field is NULL.
     */
  /* attribute AString passwordField; */
  NS_SCRIPTABLE NS_IMETHOD GetPasswordField(nsAString & aPasswordField) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetPasswordField(const nsAString & aPasswordField) = 0;

  /* attribute nsIMutableArray customFields; */
  NS_SCRIPTABLE NS_IMETHOD GetCustomFields(nsIMutableArray * *aCustomFields) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetCustomFields(nsIMutableArray * aCustomFields) = 0;

  /* attribute AString uniqueID; */
  NS_SCRIPTABLE NS_IMETHOD GetUniqueID(nsAString & aUniqueID) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetUniqueID(const nsAString & aUniqueID) = 0;

  /* attribute AString title; */
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) = 0;

  /**
     * Initialize a newly created nsLoginInfo object.
     *
     * The arguments are the fields for the new object.
     */
  /* void init (in AString aHostname, in AString aFormSubmitURL, in AString aHttpRealm, in AString aUsername, in AString aPassword, in AString aUsernameField, in AString aPasswordField, in AString uniqueID, in AString aTitle); */
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & aHostname, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, const nsAString & aUsername, const nsAString & aPassword, const nsAString & aUsernameField, const nsAString & aPasswordField, const nsAString & uniqueID, const nsAString & aTitle) = 0;

  /**
     * Test for strict equality with another nsILoginInfo object.
     *
     * @param aLoginInfo
     *        The other object to test.
     */
  /* boolean equals (in kfILoginInfo aLoginInfo); */
  NS_SCRIPTABLE NS_IMETHOD Equals(kfILoginInfo *aLoginInfo, PRBool *_retval) = 0;

  /**
     * Test for loose equivalency with another nsILoginInfo object. The
     * passwordField and usernameField values are ignored, and the password
     * values may be optionally ignored. If one login's formSubmitURL is an
     * empty string (but not null), it will be treated as a wildcard. [The
     * blank value indicates the login was stored before bug 360493 was fixed.]
     *
     * @param aLoginInfo
     *        The other object to test.
     * @param ignorePassword
     *        If true, ignore the password when checking for match.
     */
  /* boolean matches (in kfILoginInfo aLoginInfo, in boolean ignorePassword); */
  NS_SCRIPTABLE NS_IMETHOD Matches(kfILoginInfo *aLoginInfo, PRBool ignorePassword, PRBool *_retval) = 0;

  /* void initCustom (in AString aHostname, in AString aFormSubmitURL, in AString aHttpRealm, in AString aUsername, in AString aPassword, in AString aUsernameField, in AString aPasswordField, in AString uniqueID, in AString aTitle, in nsIMutableArray someCustomFields); */
  NS_SCRIPTABLE NS_IMETHOD InitCustom(const nsAString & aHostname, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, const nsAString & aUsername, const nsAString & aPassword, const nsAString & aUsernameField, const nsAString & aPasswordField, const nsAString & uniqueID, const nsAString & aTitle, nsIMutableArray *someCustomFields) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(kfILoginInfo, KFILOGININFO_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_KFILOGININFO \
  NS_SCRIPTABLE NS_IMETHOD GetHostname(nsAString & aHostname); \
  NS_SCRIPTABLE NS_IMETHOD SetHostname(const nsAString & aHostname); \
  NS_SCRIPTABLE NS_IMETHOD GetFormSubmitURL(nsAString & aFormSubmitURL); \
  NS_SCRIPTABLE NS_IMETHOD SetFormSubmitURL(const nsAString & aFormSubmitURL); \
  NS_SCRIPTABLE NS_IMETHOD GetHttpRealm(nsAString & aHttpRealm); \
  NS_SCRIPTABLE NS_IMETHOD SetHttpRealm(const nsAString & aHttpRealm); \
  NS_SCRIPTABLE NS_IMETHOD GetUsername(nsAString & aUsername); \
  NS_SCRIPTABLE NS_IMETHOD SetUsername(const nsAString & aUsername); \
  NS_SCRIPTABLE NS_IMETHOD GetUsernameField(nsAString & aUsernameField); \
  NS_SCRIPTABLE NS_IMETHOD SetUsernameField(const nsAString & aUsernameField); \
  NS_SCRIPTABLE NS_IMETHOD GetPassword(nsAString & aPassword); \
  NS_SCRIPTABLE NS_IMETHOD SetPassword(const nsAString & aPassword); \
  NS_SCRIPTABLE NS_IMETHOD GetPasswordField(nsAString & aPasswordField); \
  NS_SCRIPTABLE NS_IMETHOD SetPasswordField(const nsAString & aPasswordField); \
  NS_SCRIPTABLE NS_IMETHOD GetCustomFields(nsIMutableArray * *aCustomFields); \
  NS_SCRIPTABLE NS_IMETHOD SetCustomFields(nsIMutableArray * aCustomFields); \
  NS_SCRIPTABLE NS_IMETHOD GetUniqueID(nsAString & aUniqueID); \
  NS_SCRIPTABLE NS_IMETHOD SetUniqueID(const nsAString & aUniqueID); \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle); \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle); \
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & aHostname, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, const nsAString & aUsername, const nsAString & aPassword, const nsAString & aUsernameField, const nsAString & aPasswordField, const nsAString & uniqueID, const nsAString & aTitle); \
  NS_SCRIPTABLE NS_IMETHOD Equals(kfILoginInfo *aLoginInfo, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD Matches(kfILoginInfo *aLoginInfo, PRBool ignorePassword, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD InitCustom(const nsAString & aHostname, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, const nsAString & aUsername, const nsAString & aPassword, const nsAString & aUsernameField, const nsAString & aPasswordField, const nsAString & uniqueID, const nsAString & aTitle, nsIMutableArray *someCustomFields); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_KFILOGININFO(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetHostname(nsAString & aHostname) { return _to GetHostname(aHostname); } \
  NS_SCRIPTABLE NS_IMETHOD SetHostname(const nsAString & aHostname) { return _to SetHostname(aHostname); } \
  NS_SCRIPTABLE NS_IMETHOD GetFormSubmitURL(nsAString & aFormSubmitURL) { return _to GetFormSubmitURL(aFormSubmitURL); } \
  NS_SCRIPTABLE NS_IMETHOD SetFormSubmitURL(const nsAString & aFormSubmitURL) { return _to SetFormSubmitURL(aFormSubmitURL); } \
  NS_SCRIPTABLE NS_IMETHOD GetHttpRealm(nsAString & aHttpRealm) { return _to GetHttpRealm(aHttpRealm); } \
  NS_SCRIPTABLE NS_IMETHOD SetHttpRealm(const nsAString & aHttpRealm) { return _to SetHttpRealm(aHttpRealm); } \
  NS_SCRIPTABLE NS_IMETHOD GetUsername(nsAString & aUsername) { return _to GetUsername(aUsername); } \
  NS_SCRIPTABLE NS_IMETHOD SetUsername(const nsAString & aUsername) { return _to SetUsername(aUsername); } \
  NS_SCRIPTABLE NS_IMETHOD GetUsernameField(nsAString & aUsernameField) { return _to GetUsernameField(aUsernameField); } \
  NS_SCRIPTABLE NS_IMETHOD SetUsernameField(const nsAString & aUsernameField) { return _to SetUsernameField(aUsernameField); } \
  NS_SCRIPTABLE NS_IMETHOD GetPassword(nsAString & aPassword) { return _to GetPassword(aPassword); } \
  NS_SCRIPTABLE NS_IMETHOD SetPassword(const nsAString & aPassword) { return _to SetPassword(aPassword); } \
  NS_SCRIPTABLE NS_IMETHOD GetPasswordField(nsAString & aPasswordField) { return _to GetPasswordField(aPasswordField); } \
  NS_SCRIPTABLE NS_IMETHOD SetPasswordField(const nsAString & aPasswordField) { return _to SetPasswordField(aPasswordField); } \
  NS_SCRIPTABLE NS_IMETHOD GetCustomFields(nsIMutableArray * *aCustomFields) { return _to GetCustomFields(aCustomFields); } \
  NS_SCRIPTABLE NS_IMETHOD SetCustomFields(nsIMutableArray * aCustomFields) { return _to SetCustomFields(aCustomFields); } \
  NS_SCRIPTABLE NS_IMETHOD GetUniqueID(nsAString & aUniqueID) { return _to GetUniqueID(aUniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD SetUniqueID(const nsAString & aUniqueID) { return _to SetUniqueID(aUniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) { return _to GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) { return _to SetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & aHostname, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, const nsAString & aUsername, const nsAString & aPassword, const nsAString & aUsernameField, const nsAString & aPasswordField, const nsAString & uniqueID, const nsAString & aTitle) { return _to Init(aHostname, aFormSubmitURL, aHttpRealm, aUsername, aPassword, aUsernameField, aPasswordField, uniqueID, aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD Equals(kfILoginInfo *aLoginInfo, PRBool *_retval) { return _to Equals(aLoginInfo, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Matches(kfILoginInfo *aLoginInfo, PRBool ignorePassword, PRBool *_retval) { return _to Matches(aLoginInfo, ignorePassword, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD InitCustom(const nsAString & aHostname, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, const nsAString & aUsername, const nsAString & aPassword, const nsAString & aUsernameField, const nsAString & aPasswordField, const nsAString & uniqueID, const nsAString & aTitle, nsIMutableArray *someCustomFields) { return _to InitCustom(aHostname, aFormSubmitURL, aHttpRealm, aUsername, aPassword, aUsernameField, aPasswordField, uniqueID, aTitle, someCustomFields); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_KFILOGININFO(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetHostname(nsAString & aHostname) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHostname(aHostname); } \
  NS_SCRIPTABLE NS_IMETHOD SetHostname(const nsAString & aHostname) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHostname(aHostname); } \
  NS_SCRIPTABLE NS_IMETHOD GetFormSubmitURL(nsAString & aFormSubmitURL) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFormSubmitURL(aFormSubmitURL); } \
  NS_SCRIPTABLE NS_IMETHOD SetFormSubmitURL(const nsAString & aFormSubmitURL) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFormSubmitURL(aFormSubmitURL); } \
  NS_SCRIPTABLE NS_IMETHOD GetHttpRealm(nsAString & aHttpRealm) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHttpRealm(aHttpRealm); } \
  NS_SCRIPTABLE NS_IMETHOD SetHttpRealm(const nsAString & aHttpRealm) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHttpRealm(aHttpRealm); } \
  NS_SCRIPTABLE NS_IMETHOD GetUsername(nsAString & aUsername) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetUsername(aUsername); } \
  NS_SCRIPTABLE NS_IMETHOD SetUsername(const nsAString & aUsername) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetUsername(aUsername); } \
  NS_SCRIPTABLE NS_IMETHOD GetUsernameField(nsAString & aUsernameField) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetUsernameField(aUsernameField); } \
  NS_SCRIPTABLE NS_IMETHOD SetUsernameField(const nsAString & aUsernameField) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetUsernameField(aUsernameField); } \
  NS_SCRIPTABLE NS_IMETHOD GetPassword(nsAString & aPassword) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPassword(aPassword); } \
  NS_SCRIPTABLE NS_IMETHOD SetPassword(const nsAString & aPassword) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPassword(aPassword); } \
  NS_SCRIPTABLE NS_IMETHOD GetPasswordField(nsAString & aPasswordField) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPasswordField(aPasswordField); } \
  NS_SCRIPTABLE NS_IMETHOD SetPasswordField(const nsAString & aPasswordField) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPasswordField(aPasswordField); } \
  NS_SCRIPTABLE NS_IMETHOD GetCustomFields(nsIMutableArray * *aCustomFields) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetCustomFields(aCustomFields); } \
  NS_SCRIPTABLE NS_IMETHOD SetCustomFields(nsIMutableArray * aCustomFields) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCustomFields(aCustomFields); } \
  NS_SCRIPTABLE NS_IMETHOD GetUniqueID(nsAString & aUniqueID) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetUniqueID(aUniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD SetUniqueID(const nsAString & aUniqueID) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetUniqueID(aUniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & aHostname, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, const nsAString & aUsername, const nsAString & aPassword, const nsAString & aUsernameField, const nsAString & aPasswordField, const nsAString & uniqueID, const nsAString & aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->Init(aHostname, aFormSubmitURL, aHttpRealm, aUsername, aPassword, aUsernameField, aPasswordField, uniqueID, aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD Equals(kfILoginInfo *aLoginInfo, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Equals(aLoginInfo, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Matches(kfILoginInfo *aLoginInfo, PRBool ignorePassword, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Matches(aLoginInfo, ignorePassword, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD InitCustom(const nsAString & aHostname, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, const nsAString & aUsername, const nsAString & aPassword, const nsAString & aUsernameField, const nsAString & aPasswordField, const nsAString & uniqueID, const nsAString & aTitle, nsIMutableArray *someCustomFields) { return !_to ? NS_ERROR_NULL_POINTER : _to->InitCustom(aHostname, aFormSubmitURL, aHttpRealm, aUsername, aPassword, aUsernameField, aPasswordField, uniqueID, aTitle, someCustomFields); } 

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

/* attribute AString hostname; */
NS_IMETHODIMP kfLoginInfo::GetHostname(nsAString & aHostname)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetHostname(const nsAString & aHostname)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString formSubmitURL; */
NS_IMETHODIMP kfLoginInfo::GetFormSubmitURL(nsAString & aFormSubmitURL)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetFormSubmitURL(const nsAString & aFormSubmitURL)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString httpRealm; */
NS_IMETHODIMP kfLoginInfo::GetHttpRealm(nsAString & aHttpRealm)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetHttpRealm(const nsAString & aHttpRealm)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString username; */
NS_IMETHODIMP kfLoginInfo::GetUsername(nsAString & aUsername)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetUsername(const nsAString & aUsername)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString usernameField; */
NS_IMETHODIMP kfLoginInfo::GetUsernameField(nsAString & aUsernameField)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetUsernameField(const nsAString & aUsernameField)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString password; */
NS_IMETHODIMP kfLoginInfo::GetPassword(nsAString & aPassword)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetPassword(const nsAString & aPassword)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString passwordField; */
NS_IMETHODIMP kfLoginInfo::GetPasswordField(nsAString & aPasswordField)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetPasswordField(const nsAString & aPasswordField)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIMutableArray customFields; */
NS_IMETHODIMP kfLoginInfo::GetCustomFields(nsIMutableArray * *aCustomFields)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetCustomFields(nsIMutableArray * aCustomFields)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString uniqueID; */
NS_IMETHODIMP kfLoginInfo::GetUniqueID(nsAString & aUniqueID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetUniqueID(const nsAString & aUniqueID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString title; */
NS_IMETHODIMP kfLoginInfo::GetTitle(nsAString & aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetTitle(const nsAString & aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void init (in AString aHostname, in AString aFormSubmitURL, in AString aHttpRealm, in AString aUsername, in AString aPassword, in AString aUsernameField, in AString aPasswordField, in AString uniqueID, in AString aTitle); */
NS_IMETHODIMP kfLoginInfo::Init(const nsAString & aHostname, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, const nsAString & aUsername, const nsAString & aPassword, const nsAString & aUsernameField, const nsAString & aPasswordField, const nsAString & uniqueID, const nsAString & aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean equals (in kfILoginInfo aLoginInfo); */
NS_IMETHODIMP kfLoginInfo::Equals(kfILoginInfo *aLoginInfo, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean matches (in kfILoginInfo aLoginInfo, in boolean ignorePassword); */
NS_IMETHODIMP kfLoginInfo::Matches(kfILoginInfo *aLoginInfo, PRBool ignorePassword, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void initCustom (in AString aHostname, in AString aFormSubmitURL, in AString aHttpRealm, in AString aUsername, in AString aPassword, in AString aUsernameField, in AString aPasswordField, in AString uniqueID, in AString aTitle, in nsIMutableArray someCustomFields); */
NS_IMETHODIMP kfLoginInfo::InitCustom(const nsAString & aHostname, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, const nsAString & aUsername, const nsAString & aPassword, const nsAString & aUsernameField, const nsAString & aPasswordField, const nsAString & uniqueID, const nsAString & aTitle, nsIMutableArray *someCustomFields)
{
    return NS_ERROR_NOT_IMPLEMENTED;
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

  /* AString getDBFileName (); */
  NS_SCRIPTABLE NS_IMETHOD GetDBFileName(nsAString & _retval) = 0;

  /* void ChangeDB (in AString fileName, in boolean closeCurrent); */
  NS_SCRIPTABLE NS_IMETHOD ChangeDB(const nsAString & fileName, PRBool closeCurrent) = 0;

  /* attribute AString name; */
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) = 0;

  /* void RunAnInstaller (in AString fileName, in AString params); */
  NS_SCRIPTABLE NS_IMETHOD RunAnInstaller(const nsAString & fileName, const nsAString & params) = 0;

  /* void LaunchKeePass (in AString fileName, in AString DBFile); */
  NS_SCRIPTABLE NS_IMETHOD LaunchKeePass(const nsAString & fileName, const nsAString & DBFile) = 0;

  /* void shutdownICE (); */
  NS_SCRIPTABLE NS_IMETHOD ShutdownICE(void) = 0;

  /* boolean IsUserAdministrator (); */
  NS_SCRIPTABLE NS_IMETHOD IsUserAdministrator(PRBool *_retval) = 0;

  /**
     * Store a new login.
     *
     * @param aLogin
     *        The login to be added.
     */
  /* void addLogin (in kfILoginInfo aLogin, in AString parentUUID); */
  NS_SCRIPTABLE NS_IMETHOD AddLogin(kfILoginInfo *aLogin, const nsAString & parentUUID) = 0;

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
  /* void findLogins (out unsigned long count, in AString aHostname, in AString aActionURL, in AString aHttpRealm, in AString aUniqueID, [array, size_is (count), retval] out kfILoginInfo logins); */
  NS_SCRIPTABLE NS_IMETHOD FindLogins(PRUint32 *count, const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, const nsAString & aUniqueID, kfILoginInfo ***logins) = 0;

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
  NS_SCRIPTABLE NS_IMETHOD GetDBFileName(nsAString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD ChangeDB(const nsAString & fileName, PRBool closeCurrent); \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD RunAnInstaller(const nsAString & fileName, const nsAString & params); \
  NS_SCRIPTABLE NS_IMETHOD LaunchKeePass(const nsAString & fileName, const nsAString & DBFile); \
  NS_SCRIPTABLE NS_IMETHOD ShutdownICE(void); \
  NS_SCRIPTABLE NS_IMETHOD IsUserAdministrator(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD AddLogin(kfILoginInfo *aLogin, const nsAString & parentUUID); \
  NS_SCRIPTABLE NS_IMETHOD RemoveLogin(kfILoginInfo *aLogin); \
  NS_SCRIPTABLE NS_IMETHOD ModifyLogin(kfILoginInfo *oldLogin, kfILoginInfo *newLogin); \
  NS_SCRIPTABLE NS_IMETHOD GetAllLogins(PRUint32 *count, kfILoginInfo ***logins); \
  NS_SCRIPTABLE NS_IMETHOD FindLogins(PRUint32 *count, const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, const nsAString & aUniqueID, kfILoginInfo ***logins); \
  NS_SCRIPTABLE NS_IMETHOD CountLogins(const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, PRUint32 *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_IKEEFOX(_to) \
  NS_SCRIPTABLE NS_IMETHOD CheckVersion(float keeFoxVersion, float keeICEVersion, PRInt32 *result, PRBool *_retval) { return _to CheckVersion(keeFoxVersion, keeICEVersion, result, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD AddObserver(KeeFoxObserver *observer) { return _to AddObserver(observer); } \
  NS_SCRIPTABLE NS_IMETHOD Add(PRInt32 a, PRInt32 b, PRInt32 *_retval) { return _to Add(a, b, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetDBName(nsAString & _retval) { return _to GetDBName(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetDBFileName(nsAString & _retval) { return _to GetDBFileName(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD ChangeDB(const nsAString & fileName, PRBool closeCurrent) { return _to ChangeDB(fileName, closeCurrent); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD RunAnInstaller(const nsAString & fileName, const nsAString & params) { return _to RunAnInstaller(fileName, params); } \
  NS_SCRIPTABLE NS_IMETHOD LaunchKeePass(const nsAString & fileName, const nsAString & DBFile) { return _to LaunchKeePass(fileName, DBFile); } \
  NS_SCRIPTABLE NS_IMETHOD ShutdownICE(void) { return _to ShutdownICE(); } \
  NS_SCRIPTABLE NS_IMETHOD IsUserAdministrator(PRBool *_retval) { return _to IsUserAdministrator(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD AddLogin(kfILoginInfo *aLogin, const nsAString & parentUUID) { return _to AddLogin(aLogin, parentUUID); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveLogin(kfILoginInfo *aLogin) { return _to RemoveLogin(aLogin); } \
  NS_SCRIPTABLE NS_IMETHOD ModifyLogin(kfILoginInfo *oldLogin, kfILoginInfo *newLogin) { return _to ModifyLogin(oldLogin, newLogin); } \
  NS_SCRIPTABLE NS_IMETHOD GetAllLogins(PRUint32 *count, kfILoginInfo ***logins) { return _to GetAllLogins(count, logins); } \
  NS_SCRIPTABLE NS_IMETHOD FindLogins(PRUint32 *count, const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, const nsAString & aUniqueID, kfILoginInfo ***logins) { return _to FindLogins(count, aHostname, aActionURL, aHttpRealm, aUniqueID, logins); } \
  NS_SCRIPTABLE NS_IMETHOD CountLogins(const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, PRUint32 *_retval) { return _to CountLogins(aHostname, aActionURL, aHttpRealm, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_IKEEFOX(_to) \
  NS_SCRIPTABLE NS_IMETHOD CheckVersion(float keeFoxVersion, float keeICEVersion, PRInt32 *result, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CheckVersion(keeFoxVersion, keeICEVersion, result, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD AddObserver(KeeFoxObserver *observer) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddObserver(observer); } \
  NS_SCRIPTABLE NS_IMETHOD Add(PRInt32 a, PRInt32 b, PRInt32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Add(a, b, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetDBName(nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDBName(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetDBFileName(nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDBFileName(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD ChangeDB(const nsAString & fileName, PRBool closeCurrent) { return !_to ? NS_ERROR_NULL_POINTER : _to->ChangeDB(fileName, closeCurrent); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD RunAnInstaller(const nsAString & fileName, const nsAString & params) { return !_to ? NS_ERROR_NULL_POINTER : _to->RunAnInstaller(fileName, params); } \
  NS_SCRIPTABLE NS_IMETHOD LaunchKeePass(const nsAString & fileName, const nsAString & DBFile) { return !_to ? NS_ERROR_NULL_POINTER : _to->LaunchKeePass(fileName, DBFile); } \
  NS_SCRIPTABLE NS_IMETHOD ShutdownICE(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->ShutdownICE(); } \
  NS_SCRIPTABLE NS_IMETHOD IsUserAdministrator(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsUserAdministrator(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD AddLogin(kfILoginInfo *aLogin, const nsAString & parentUUID) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddLogin(aLogin, parentUUID); } \
  NS_SCRIPTABLE NS_IMETHOD RemoveLogin(kfILoginInfo *aLogin) { return !_to ? NS_ERROR_NULL_POINTER : _to->RemoveLogin(aLogin); } \
  NS_SCRIPTABLE NS_IMETHOD ModifyLogin(kfILoginInfo *oldLogin, kfILoginInfo *newLogin) { return !_to ? NS_ERROR_NULL_POINTER : _to->ModifyLogin(oldLogin, newLogin); } \
  NS_SCRIPTABLE NS_IMETHOD GetAllLogins(PRUint32 *count, kfILoginInfo ***logins) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAllLogins(count, logins); } \
  NS_SCRIPTABLE NS_IMETHOD FindLogins(PRUint32 *count, const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, const nsAString & aUniqueID, kfILoginInfo ***logins) { return !_to ? NS_ERROR_NULL_POINTER : _to->FindLogins(count, aHostname, aActionURL, aHttpRealm, aUniqueID, logins); } \
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

/* AString getDBFileName (); */
NS_IMETHODIMP _MYCLASS_::GetDBFileName(nsAString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void ChangeDB (in AString fileName, in boolean closeCurrent); */
NS_IMETHODIMP _MYCLASS_::ChangeDB(const nsAString & fileName, PRBool closeCurrent)
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

/* void RunAnInstaller (in AString fileName, in AString params); */
NS_IMETHODIMP _MYCLASS_::RunAnInstaller(const nsAString & fileName, const nsAString & params)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void LaunchKeePass (in AString fileName, in AString DBFile); */
NS_IMETHODIMP _MYCLASS_::LaunchKeePass(const nsAString & fileName, const nsAString & DBFile)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void shutdownICE (); */
NS_IMETHODIMP _MYCLASS_::ShutdownICE()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean IsUserAdministrator (); */
NS_IMETHODIMP _MYCLASS_::IsUserAdministrator(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void addLogin (in kfILoginInfo aLogin, in AString parentUUID); */
NS_IMETHODIMP _MYCLASS_::AddLogin(kfILoginInfo *aLogin, const nsAString & parentUUID)
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

/* void findLogins (out unsigned long count, in AString aHostname, in AString aActionURL, in AString aHttpRealm, in AString aUniqueID, [array, size_is (count), retval] out kfILoginInfo logins); */
NS_IMETHODIMP _MYCLASS_::FindLogins(PRUint32 *count, const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, const nsAString & aUniqueID, kfILoginInfo ***logins)
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
