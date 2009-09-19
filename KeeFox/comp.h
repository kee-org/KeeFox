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

#ifndef __gen_nsIDOMHTMLInputElement_h__
#include "nsIDOMHTMLInputElement.h"
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

  /* attribute AString fieldId; */
  NS_SCRIPTABLE NS_IMETHOD GetFieldId(nsAString & aFieldId) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFieldId(const nsAString & aFieldId) = 0;

  /* attribute nsIDOMHTMLInputElement DOMInputElement; */
  NS_SCRIPTABLE NS_IMETHOD GetDOMInputElement(nsIDOMHTMLInputElement * *aDOMInputElement) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetDOMInputElement(nsIDOMHTMLInputElement * aDOMInputElement) = 0;

  /* attribute nsIDOMHTMLInputElement DOMSelectElement; */
  NS_SCRIPTABLE NS_IMETHOD GetDOMSelectElement(nsIDOMHTMLInputElement * *aDOMSelectElement) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetDOMSelectElement(nsIDOMHTMLInputElement * aDOMSelectElement) = 0;

  /* attribute AString type; */
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetType(const nsAString & aType) = 0;

  /* attribute short formFieldPage; */
  NS_SCRIPTABLE NS_IMETHOD GetFormFieldPage(PRInt16 *aFormFieldPage) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFormFieldPage(PRInt16 aFormFieldPage) = 0;

  /* void init (in AString aName, in AString aValue, in AString aID, in AString aType, in short aFormFieldPage); */
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & aName, const nsAString & aValue, const nsAString & aID, const nsAString & aType, PRInt16 aFormFieldPage) = 0;

  /* AString toSource (); */
  NS_SCRIPTABLE NS_IMETHOD ToSource(nsAString & _retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(kfILoginField, KFILOGINFIELD_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_KFILOGINFIELD \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue); \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue); \
  NS_SCRIPTABLE NS_IMETHOD GetFieldId(nsAString & aFieldId); \
  NS_SCRIPTABLE NS_IMETHOD SetFieldId(const nsAString & aFieldId); \
  NS_SCRIPTABLE NS_IMETHOD GetDOMInputElement(nsIDOMHTMLInputElement * *aDOMInputElement); \
  NS_SCRIPTABLE NS_IMETHOD SetDOMInputElement(nsIDOMHTMLInputElement * aDOMInputElement); \
  NS_SCRIPTABLE NS_IMETHOD GetDOMSelectElement(nsIDOMHTMLInputElement * *aDOMSelectElement); \
  NS_SCRIPTABLE NS_IMETHOD SetDOMSelectElement(nsIDOMHTMLInputElement * aDOMSelectElement); \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType); \
  NS_SCRIPTABLE NS_IMETHOD SetType(const nsAString & aType); \
  NS_SCRIPTABLE NS_IMETHOD GetFormFieldPage(PRInt16 *aFormFieldPage); \
  NS_SCRIPTABLE NS_IMETHOD SetFormFieldPage(PRInt16 aFormFieldPage); \
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & aName, const nsAString & aValue, const nsAString & aID, const nsAString & aType, PRInt16 aFormFieldPage); \
  NS_SCRIPTABLE NS_IMETHOD ToSource(nsAString & _retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_KFILOGINFIELD(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) { return _to GetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) { return _to SetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetFieldId(nsAString & aFieldId) { return _to GetFieldId(aFieldId); } \
  NS_SCRIPTABLE NS_IMETHOD SetFieldId(const nsAString & aFieldId) { return _to SetFieldId(aFieldId); } \
  NS_SCRIPTABLE NS_IMETHOD GetDOMInputElement(nsIDOMHTMLInputElement * *aDOMInputElement) { return _to GetDOMInputElement(aDOMInputElement); } \
  NS_SCRIPTABLE NS_IMETHOD SetDOMInputElement(nsIDOMHTMLInputElement * aDOMInputElement) { return _to SetDOMInputElement(aDOMInputElement); } \
  NS_SCRIPTABLE NS_IMETHOD GetDOMSelectElement(nsIDOMHTMLInputElement * *aDOMSelectElement) { return _to GetDOMSelectElement(aDOMSelectElement); } \
  NS_SCRIPTABLE NS_IMETHOD SetDOMSelectElement(nsIDOMHTMLInputElement * aDOMSelectElement) { return _to SetDOMSelectElement(aDOMSelectElement); } \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) { return _to GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD SetType(const nsAString & aType) { return _to SetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD GetFormFieldPage(PRInt16 *aFormFieldPage) { return _to GetFormFieldPage(aFormFieldPage); } \
  NS_SCRIPTABLE NS_IMETHOD SetFormFieldPage(PRInt16 aFormFieldPage) { return _to SetFormFieldPage(aFormFieldPage); } \
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & aName, const nsAString & aValue, const nsAString & aID, const nsAString & aType, PRInt16 aFormFieldPage) { return _to Init(aName, aValue, aID, aType, aFormFieldPage); } \
  NS_SCRIPTABLE NS_IMETHOD ToSource(nsAString & _retval) { return _to ToSource(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_KFILOGINFIELD(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD GetValue(nsAString & aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD SetValue(const nsAString & aValue) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetValue(aValue); } \
  NS_SCRIPTABLE NS_IMETHOD GetFieldId(nsAString & aFieldId) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFieldId(aFieldId); } \
  NS_SCRIPTABLE NS_IMETHOD SetFieldId(const nsAString & aFieldId) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFieldId(aFieldId); } \
  NS_SCRIPTABLE NS_IMETHOD GetDOMInputElement(nsIDOMHTMLInputElement * *aDOMInputElement) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDOMInputElement(aDOMInputElement); } \
  NS_SCRIPTABLE NS_IMETHOD SetDOMInputElement(nsIDOMHTMLInputElement * aDOMInputElement) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDOMInputElement(aDOMInputElement); } \
  NS_SCRIPTABLE NS_IMETHOD GetDOMSelectElement(nsIDOMHTMLInputElement * *aDOMSelectElement) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDOMSelectElement(aDOMSelectElement); } \
  NS_SCRIPTABLE NS_IMETHOD SetDOMSelectElement(nsIDOMHTMLInputElement * aDOMSelectElement) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetDOMSelectElement(aDOMSelectElement); } \
  NS_SCRIPTABLE NS_IMETHOD GetType(nsAString & aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD SetType(const nsAString & aType) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetType(aType); } \
  NS_SCRIPTABLE NS_IMETHOD GetFormFieldPage(PRInt16 *aFormFieldPage) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFormFieldPage(aFormFieldPage); } \
  NS_SCRIPTABLE NS_IMETHOD SetFormFieldPage(PRInt16 aFormFieldPage) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFormFieldPage(aFormFieldPage); } \
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & aName, const nsAString & aValue, const nsAString & aID, const nsAString & aType, PRInt16 aFormFieldPage) { return !_to ? NS_ERROR_NULL_POINTER : _to->Init(aName, aValue, aID, aType, aFormFieldPage); } \
  NS_SCRIPTABLE NS_IMETHOD ToSource(nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToSource(_retval); } 

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

/* attribute AString fieldId; */
NS_IMETHODIMP kfLoginField::GetFieldId(nsAString & aFieldId)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginField::SetFieldId(const nsAString & aFieldId)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIDOMHTMLInputElement DOMInputElement; */
NS_IMETHODIMP kfLoginField::GetDOMInputElement(nsIDOMHTMLInputElement * *aDOMInputElement)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginField::SetDOMInputElement(nsIDOMHTMLInputElement * aDOMInputElement)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIDOMHTMLInputElement DOMSelectElement; */
NS_IMETHODIMP kfLoginField::GetDOMSelectElement(nsIDOMHTMLInputElement * *aDOMSelectElement)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginField::SetDOMSelectElement(nsIDOMHTMLInputElement * aDOMSelectElement)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString type; */
NS_IMETHODIMP kfLoginField::GetType(nsAString & aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginField::SetType(const nsAString & aType)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute short formFieldPage; */
NS_IMETHODIMP kfLoginField::GetFormFieldPage(PRInt16 *aFormFieldPage)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginField::SetFormFieldPage(PRInt16 aFormFieldPage)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void init (in AString aName, in AString aValue, in AString aID, in AString aType, in short aFormFieldPage); */
NS_IMETHODIMP kfLoginField::Init(const nsAString & aName, const nsAString & aValue, const nsAString & aID, const nsAString & aType, PRInt16 aFormFieldPage)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* AString toSource (); */
NS_IMETHODIMP kfLoginField::ToSource(nsAString & _retval)
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
  /* attribute nsIMutableArray URLs; */
  NS_SCRIPTABLE NS_IMETHOD GetURLs(nsIMutableArray * *aURLs) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetURLs(nsIMutableArray * aURLs) = 0;

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
  /* attribute AString formActionURL; */
  NS_SCRIPTABLE NS_IMETHOD GetFormActionURL(nsAString & aFormActionURL) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetFormActionURL(const nsAString & aFormActionURL) = 0;

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
     * The index of the otherField which represents the "main" username.
     */
  /* attribute long usernameIndex; */
  NS_SCRIPTABLE NS_IMETHOD GetUsernameIndex(PRInt32 *aUsernameIndex) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetUsernameIndex(PRInt32 aUsernameIndex) = 0;

  /**
     * The password for the login.
     */
  /* attribute nsIMutableArray passwords; */
  NS_SCRIPTABLE NS_IMETHOD GetPasswords(nsIMutableArray * *aPasswords) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetPasswords(nsIMutableArray * aPasswords) = 0;

  /* attribute nsIMutableArray otherFields; */
  NS_SCRIPTABLE NS_IMETHOD GetOtherFields(nsIMutableArray * *aOtherFields) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetOtherFields(nsIMutableArray * aOtherFields) = 0;

  /* attribute AString uniqueID; */
  NS_SCRIPTABLE NS_IMETHOD GetUniqueID(nsAString & aUniqueID) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetUniqueID(const nsAString & aUniqueID) = 0;

  /* attribute AString title; */
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) = 0;

  /* attribute long relevanceScore; */
  NS_SCRIPTABLE NS_IMETHOD GetRelevanceScore(PRInt32 *aRelevanceScore) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetRelevanceScore(PRInt32 aRelevanceScore) = 0;

  /* attribute long maximumPage; */
  NS_SCRIPTABLE NS_IMETHOD GetMaximumPage(PRInt32 *aMaximumPage) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetMaximumPage(PRInt32 aMaximumPage) = 0;

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
  /* boolean matches (in kfILoginInfo aLoginInfo, in boolean ignorePassword, in boolean ignoreURIPaths, in boolean ignoreURIPathsAndSchemes); */
  NS_SCRIPTABLE NS_IMETHOD Matches(kfILoginInfo *aLoginInfo, PRBool ignorePassword, PRBool ignoreURIPaths, PRBool ignoreURIPathsAndSchemes, PRBool *_retval) = 0;

  /* kfILoginInfo mergeWith (in kfILoginInfo aLoginInfo); */
  NS_SCRIPTABLE NS_IMETHOD MergeWith(kfILoginInfo *aLoginInfo, kfILoginInfo **_retval) = 0;

  /**
     * Initialize a newly created nsLoginInfo object.
     *
     * The arguments are the fields for the new object.
     */
  /* void init (in nsIMutableArray URLs, in AString aFormSubmitURL, in AString aHttpRealm, in long aUsernameIndex, in nsIMutableArray aPasswords, in AString uniqueID, in AString aTitle, in nsIMutableArray otherFieldsArray, in long aMaximumPage); */
  NS_SCRIPTABLE NS_IMETHOD Init(nsIMutableArray *URLs, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, PRInt32 aUsernameIndex, nsIMutableArray *aPasswords, const nsAString & uniqueID, const nsAString & aTitle, nsIMutableArray *otherFieldsArray, PRInt32 aMaximumPage) = 0;

  /* AString toSource (); */
  NS_SCRIPTABLE NS_IMETHOD ToSource(nsAString & _retval) = 0;

  /* attribute AString parentGroupName; */
  NS_SCRIPTABLE NS_IMETHOD GetParentGroupName(nsAString & aParentGroupName) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetParentGroupName(const nsAString & aParentGroupName) = 0;

  /* attribute AString parentGroupUUID; */
  NS_SCRIPTABLE NS_IMETHOD GetParentGroupUUID(nsAString & aParentGroupUUID) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetParentGroupUUID(const nsAString & aParentGroupUUID) = 0;

  /* attribute AString parentGroupPath; */
  NS_SCRIPTABLE NS_IMETHOD GetParentGroupPath(nsAString & aParentGroupPath) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetParentGroupPath(const nsAString & aParentGroupPath) = 0;

  /* attribute ACString iconImageData; */
  NS_SCRIPTABLE NS_IMETHOD GetIconImageData(nsACString & aIconImageData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetIconImageData(const nsACString & aIconImageData) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(kfILoginInfo, KFILOGININFO_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_KFILOGININFO \
  NS_SCRIPTABLE NS_IMETHOD GetURLs(nsIMutableArray * *aURLs); \
  NS_SCRIPTABLE NS_IMETHOD SetURLs(nsIMutableArray * aURLs); \
  NS_SCRIPTABLE NS_IMETHOD GetFormActionURL(nsAString & aFormActionURL); \
  NS_SCRIPTABLE NS_IMETHOD SetFormActionURL(const nsAString & aFormActionURL); \
  NS_SCRIPTABLE NS_IMETHOD GetHttpRealm(nsAString & aHttpRealm); \
  NS_SCRIPTABLE NS_IMETHOD SetHttpRealm(const nsAString & aHttpRealm); \
  NS_SCRIPTABLE NS_IMETHOD GetUsernameIndex(PRInt32 *aUsernameIndex); \
  NS_SCRIPTABLE NS_IMETHOD SetUsernameIndex(PRInt32 aUsernameIndex); \
  NS_SCRIPTABLE NS_IMETHOD GetPasswords(nsIMutableArray * *aPasswords); \
  NS_SCRIPTABLE NS_IMETHOD SetPasswords(nsIMutableArray * aPasswords); \
  NS_SCRIPTABLE NS_IMETHOD GetOtherFields(nsIMutableArray * *aOtherFields); \
  NS_SCRIPTABLE NS_IMETHOD SetOtherFields(nsIMutableArray * aOtherFields); \
  NS_SCRIPTABLE NS_IMETHOD GetUniqueID(nsAString & aUniqueID); \
  NS_SCRIPTABLE NS_IMETHOD SetUniqueID(const nsAString & aUniqueID); \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle); \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle); \
  NS_SCRIPTABLE NS_IMETHOD GetRelevanceScore(PRInt32 *aRelevanceScore); \
  NS_SCRIPTABLE NS_IMETHOD SetRelevanceScore(PRInt32 aRelevanceScore); \
  NS_SCRIPTABLE NS_IMETHOD GetMaximumPage(PRInt32 *aMaximumPage); \
  NS_SCRIPTABLE NS_IMETHOD SetMaximumPage(PRInt32 aMaximumPage); \
  NS_SCRIPTABLE NS_IMETHOD Equals(kfILoginInfo *aLoginInfo, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD Matches(kfILoginInfo *aLoginInfo, PRBool ignorePassword, PRBool ignoreURIPaths, PRBool ignoreURIPathsAndSchemes, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD MergeWith(kfILoginInfo *aLoginInfo, kfILoginInfo **_retval); \
  NS_SCRIPTABLE NS_IMETHOD Init(nsIMutableArray *URLs, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, PRInt32 aUsernameIndex, nsIMutableArray *aPasswords, const nsAString & uniqueID, const nsAString & aTitle, nsIMutableArray *otherFieldsArray, PRInt32 aMaximumPage); \
  NS_SCRIPTABLE NS_IMETHOD ToSource(nsAString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD GetParentGroupName(nsAString & aParentGroupName); \
  NS_SCRIPTABLE NS_IMETHOD SetParentGroupName(const nsAString & aParentGroupName); \
  NS_SCRIPTABLE NS_IMETHOD GetParentGroupUUID(nsAString & aParentGroupUUID); \
  NS_SCRIPTABLE NS_IMETHOD SetParentGroupUUID(const nsAString & aParentGroupUUID); \
  NS_SCRIPTABLE NS_IMETHOD GetParentGroupPath(nsAString & aParentGroupPath); \
  NS_SCRIPTABLE NS_IMETHOD SetParentGroupPath(const nsAString & aParentGroupPath); \
  NS_SCRIPTABLE NS_IMETHOD GetIconImageData(nsACString & aIconImageData); \
  NS_SCRIPTABLE NS_IMETHOD SetIconImageData(const nsACString & aIconImageData); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_KFILOGININFO(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetURLs(nsIMutableArray * *aURLs) { return _to GetURLs(aURLs); } \
  NS_SCRIPTABLE NS_IMETHOD SetURLs(nsIMutableArray * aURLs) { return _to SetURLs(aURLs); } \
  NS_SCRIPTABLE NS_IMETHOD GetFormActionURL(nsAString & aFormActionURL) { return _to GetFormActionURL(aFormActionURL); } \
  NS_SCRIPTABLE NS_IMETHOD SetFormActionURL(const nsAString & aFormActionURL) { return _to SetFormActionURL(aFormActionURL); } \
  NS_SCRIPTABLE NS_IMETHOD GetHttpRealm(nsAString & aHttpRealm) { return _to GetHttpRealm(aHttpRealm); } \
  NS_SCRIPTABLE NS_IMETHOD SetHttpRealm(const nsAString & aHttpRealm) { return _to SetHttpRealm(aHttpRealm); } \
  NS_SCRIPTABLE NS_IMETHOD GetUsernameIndex(PRInt32 *aUsernameIndex) { return _to GetUsernameIndex(aUsernameIndex); } \
  NS_SCRIPTABLE NS_IMETHOD SetUsernameIndex(PRInt32 aUsernameIndex) { return _to SetUsernameIndex(aUsernameIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetPasswords(nsIMutableArray * *aPasswords) { return _to GetPasswords(aPasswords); } \
  NS_SCRIPTABLE NS_IMETHOD SetPasswords(nsIMutableArray * aPasswords) { return _to SetPasswords(aPasswords); } \
  NS_SCRIPTABLE NS_IMETHOD GetOtherFields(nsIMutableArray * *aOtherFields) { return _to GetOtherFields(aOtherFields); } \
  NS_SCRIPTABLE NS_IMETHOD SetOtherFields(nsIMutableArray * aOtherFields) { return _to SetOtherFields(aOtherFields); } \
  NS_SCRIPTABLE NS_IMETHOD GetUniqueID(nsAString & aUniqueID) { return _to GetUniqueID(aUniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD SetUniqueID(const nsAString & aUniqueID) { return _to SetUniqueID(aUniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) { return _to GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) { return _to SetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetRelevanceScore(PRInt32 *aRelevanceScore) { return _to GetRelevanceScore(aRelevanceScore); } \
  NS_SCRIPTABLE NS_IMETHOD SetRelevanceScore(PRInt32 aRelevanceScore) { return _to SetRelevanceScore(aRelevanceScore); } \
  NS_SCRIPTABLE NS_IMETHOD GetMaximumPage(PRInt32 *aMaximumPage) { return _to GetMaximumPage(aMaximumPage); } \
  NS_SCRIPTABLE NS_IMETHOD SetMaximumPage(PRInt32 aMaximumPage) { return _to SetMaximumPage(aMaximumPage); } \
  NS_SCRIPTABLE NS_IMETHOD Equals(kfILoginInfo *aLoginInfo, PRBool *_retval) { return _to Equals(aLoginInfo, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Matches(kfILoginInfo *aLoginInfo, PRBool ignorePassword, PRBool ignoreURIPaths, PRBool ignoreURIPathsAndSchemes, PRBool *_retval) { return _to Matches(aLoginInfo, ignorePassword, ignoreURIPaths, ignoreURIPathsAndSchemes, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD MergeWith(kfILoginInfo *aLoginInfo, kfILoginInfo **_retval) { return _to MergeWith(aLoginInfo, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Init(nsIMutableArray *URLs, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, PRInt32 aUsernameIndex, nsIMutableArray *aPasswords, const nsAString & uniqueID, const nsAString & aTitle, nsIMutableArray *otherFieldsArray, PRInt32 aMaximumPage) { return _to Init(URLs, aFormSubmitURL, aHttpRealm, aUsernameIndex, aPasswords, uniqueID, aTitle, otherFieldsArray, aMaximumPage); } \
  NS_SCRIPTABLE NS_IMETHOD ToSource(nsAString & _retval) { return _to ToSource(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentGroupName(nsAString & aParentGroupName) { return _to GetParentGroupName(aParentGroupName); } \
  NS_SCRIPTABLE NS_IMETHOD SetParentGroupName(const nsAString & aParentGroupName) { return _to SetParentGroupName(aParentGroupName); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentGroupUUID(nsAString & aParentGroupUUID) { return _to GetParentGroupUUID(aParentGroupUUID); } \
  NS_SCRIPTABLE NS_IMETHOD SetParentGroupUUID(const nsAString & aParentGroupUUID) { return _to SetParentGroupUUID(aParentGroupUUID); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentGroupPath(nsAString & aParentGroupPath) { return _to GetParentGroupPath(aParentGroupPath); } \
  NS_SCRIPTABLE NS_IMETHOD SetParentGroupPath(const nsAString & aParentGroupPath) { return _to SetParentGroupPath(aParentGroupPath); } \
  NS_SCRIPTABLE NS_IMETHOD GetIconImageData(nsACString & aIconImageData) { return _to GetIconImageData(aIconImageData); } \
  NS_SCRIPTABLE NS_IMETHOD SetIconImageData(const nsACString & aIconImageData) { return _to SetIconImageData(aIconImageData); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_KFILOGININFO(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetURLs(nsIMutableArray * *aURLs) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetURLs(aURLs); } \
  NS_SCRIPTABLE NS_IMETHOD SetURLs(nsIMutableArray * aURLs) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetURLs(aURLs); } \
  NS_SCRIPTABLE NS_IMETHOD GetFormActionURL(nsAString & aFormActionURL) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetFormActionURL(aFormActionURL); } \
  NS_SCRIPTABLE NS_IMETHOD SetFormActionURL(const nsAString & aFormActionURL) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetFormActionURL(aFormActionURL); } \
  NS_SCRIPTABLE NS_IMETHOD GetHttpRealm(nsAString & aHttpRealm) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetHttpRealm(aHttpRealm); } \
  NS_SCRIPTABLE NS_IMETHOD SetHttpRealm(const nsAString & aHttpRealm) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetHttpRealm(aHttpRealm); } \
  NS_SCRIPTABLE NS_IMETHOD GetUsernameIndex(PRInt32 *aUsernameIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetUsernameIndex(aUsernameIndex); } \
  NS_SCRIPTABLE NS_IMETHOD SetUsernameIndex(PRInt32 aUsernameIndex) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetUsernameIndex(aUsernameIndex); } \
  NS_SCRIPTABLE NS_IMETHOD GetPasswords(nsIMutableArray * *aPasswords) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetPasswords(aPasswords); } \
  NS_SCRIPTABLE NS_IMETHOD SetPasswords(nsIMutableArray * aPasswords) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetPasswords(aPasswords); } \
  NS_SCRIPTABLE NS_IMETHOD GetOtherFields(nsIMutableArray * *aOtherFields) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetOtherFields(aOtherFields); } \
  NS_SCRIPTABLE NS_IMETHOD SetOtherFields(nsIMutableArray * aOtherFields) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetOtherFields(aOtherFields); } \
  NS_SCRIPTABLE NS_IMETHOD GetUniqueID(nsAString & aUniqueID) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetUniqueID(aUniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD SetUniqueID(const nsAString & aUniqueID) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetUniqueID(aUniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetRelevanceScore(PRInt32 *aRelevanceScore) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRelevanceScore(aRelevanceScore); } \
  NS_SCRIPTABLE NS_IMETHOD SetRelevanceScore(PRInt32 aRelevanceScore) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetRelevanceScore(aRelevanceScore); } \
  NS_SCRIPTABLE NS_IMETHOD GetMaximumPage(PRInt32 *aMaximumPage) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMaximumPage(aMaximumPage); } \
  NS_SCRIPTABLE NS_IMETHOD SetMaximumPage(PRInt32 aMaximumPage) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetMaximumPage(aMaximumPage); } \
  NS_SCRIPTABLE NS_IMETHOD Equals(kfILoginInfo *aLoginInfo, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Equals(aLoginInfo, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Matches(kfILoginInfo *aLoginInfo, PRBool ignorePassword, PRBool ignoreURIPaths, PRBool ignoreURIPathsAndSchemes, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Matches(aLoginInfo, ignorePassword, ignoreURIPaths, ignoreURIPathsAndSchemes, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD MergeWith(kfILoginInfo *aLoginInfo, kfILoginInfo **_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->MergeWith(aLoginInfo, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Init(nsIMutableArray *URLs, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, PRInt32 aUsernameIndex, nsIMutableArray *aPasswords, const nsAString & uniqueID, const nsAString & aTitle, nsIMutableArray *otherFieldsArray, PRInt32 aMaximumPage) { return !_to ? NS_ERROR_NULL_POINTER : _to->Init(URLs, aFormSubmitURL, aHttpRealm, aUsernameIndex, aPasswords, uniqueID, aTitle, otherFieldsArray, aMaximumPage); } \
  NS_SCRIPTABLE NS_IMETHOD ToSource(nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ToSource(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentGroupName(nsAString & aParentGroupName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetParentGroupName(aParentGroupName); } \
  NS_SCRIPTABLE NS_IMETHOD SetParentGroupName(const nsAString & aParentGroupName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetParentGroupName(aParentGroupName); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentGroupUUID(nsAString & aParentGroupUUID) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetParentGroupUUID(aParentGroupUUID); } \
  NS_SCRIPTABLE NS_IMETHOD SetParentGroupUUID(const nsAString & aParentGroupUUID) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetParentGroupUUID(aParentGroupUUID); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentGroupPath(nsAString & aParentGroupPath) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetParentGroupPath(aParentGroupPath); } \
  NS_SCRIPTABLE NS_IMETHOD SetParentGroupPath(const nsAString & aParentGroupPath) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetParentGroupPath(aParentGroupPath); } \
  NS_SCRIPTABLE NS_IMETHOD GetIconImageData(nsACString & aIconImageData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIconImageData(aIconImageData); } \
  NS_SCRIPTABLE NS_IMETHOD SetIconImageData(const nsACString & aIconImageData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetIconImageData(aIconImageData); } 

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

/* attribute nsIMutableArray URLs; */
NS_IMETHODIMP kfLoginInfo::GetURLs(nsIMutableArray * *aURLs)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetURLs(nsIMutableArray * aURLs)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString formActionURL; */
NS_IMETHODIMP kfLoginInfo::GetFormActionURL(nsAString & aFormActionURL)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetFormActionURL(const nsAString & aFormActionURL)
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

/* attribute long usernameIndex; */
NS_IMETHODIMP kfLoginInfo::GetUsernameIndex(PRInt32 *aUsernameIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetUsernameIndex(PRInt32 aUsernameIndex)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIMutableArray passwords; */
NS_IMETHODIMP kfLoginInfo::GetPasswords(nsIMutableArray * *aPasswords)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetPasswords(nsIMutableArray * aPasswords)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute nsIMutableArray otherFields; */
NS_IMETHODIMP kfLoginInfo::GetOtherFields(nsIMutableArray * *aOtherFields)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetOtherFields(nsIMutableArray * aOtherFields)
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

/* attribute long relevanceScore; */
NS_IMETHODIMP kfLoginInfo::GetRelevanceScore(PRInt32 *aRelevanceScore)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetRelevanceScore(PRInt32 aRelevanceScore)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute long maximumPage; */
NS_IMETHODIMP kfLoginInfo::GetMaximumPage(PRInt32 *aMaximumPage)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetMaximumPage(PRInt32 aMaximumPage)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean equals (in kfILoginInfo aLoginInfo); */
NS_IMETHODIMP kfLoginInfo::Equals(kfILoginInfo *aLoginInfo, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean matches (in kfILoginInfo aLoginInfo, in boolean ignorePassword, in boolean ignoreURIPaths, in boolean ignoreURIPathsAndSchemes); */
NS_IMETHODIMP kfLoginInfo::Matches(kfILoginInfo *aLoginInfo, PRBool ignorePassword, PRBool ignoreURIPaths, PRBool ignoreURIPathsAndSchemes, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* kfILoginInfo mergeWith (in kfILoginInfo aLoginInfo); */
NS_IMETHODIMP kfLoginInfo::MergeWith(kfILoginInfo *aLoginInfo, kfILoginInfo **_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void init (in nsIMutableArray URLs, in AString aFormSubmitURL, in AString aHttpRealm, in long aUsernameIndex, in nsIMutableArray aPasswords, in AString uniqueID, in AString aTitle, in nsIMutableArray otherFieldsArray, in long aMaximumPage); */
NS_IMETHODIMP kfLoginInfo::Init(nsIMutableArray *URLs, const nsAString & aFormSubmitURL, const nsAString & aHttpRealm, PRInt32 aUsernameIndex, nsIMutableArray *aPasswords, const nsAString & uniqueID, const nsAString & aTitle, nsIMutableArray *otherFieldsArray, PRInt32 aMaximumPage)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* AString toSource (); */
NS_IMETHODIMP kfLoginInfo::ToSource(nsAString & _retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString parentGroupName; */
NS_IMETHODIMP kfLoginInfo::GetParentGroupName(nsAString & aParentGroupName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetParentGroupName(const nsAString & aParentGroupName)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString parentGroupUUID; */
NS_IMETHODIMP kfLoginInfo::GetParentGroupUUID(nsAString & aParentGroupUUID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetParentGroupUUID(const nsAString & aParentGroupUUID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString parentGroupPath; */
NS_IMETHODIMP kfLoginInfo::GetParentGroupPath(nsAString & aParentGroupPath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetParentGroupPath(const nsAString & aParentGroupPath)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute ACString iconImageData; */
NS_IMETHODIMP kfLoginInfo::GetIconImageData(nsACString & aIconImageData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfLoginInfo::SetIconImageData(const nsACString & aIconImageData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    kfIURL */
#define KFIURL_IID_STR "21e35ab1-d964-476f-ba73-c318cc1a1183"

#define KFIURL_IID \
  {0x21e35ab1, 0xd964, 0x476f, \
    { 0xba, 0x73, 0xc3, 0x18, 0xcc, 0x1a, 0x11, 0x83 }}

class NS_NO_VTABLE NS_SCRIPTABLE kfIURL : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(KFIURL_IID)

  /* attribute AString URL; */
  NS_SCRIPTABLE NS_IMETHOD GetURL(nsAString & aURL) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetURL(const nsAString & aURL) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(kfIURL, KFIURL_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_KFIURL \
  NS_SCRIPTABLE NS_IMETHOD GetURL(nsAString & aURL); \
  NS_SCRIPTABLE NS_IMETHOD SetURL(const nsAString & aURL); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_KFIURL(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetURL(nsAString & aURL) { return _to GetURL(aURL); } \
  NS_SCRIPTABLE NS_IMETHOD SetURL(const nsAString & aURL) { return _to SetURL(aURL); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_KFIURL(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetURL(nsAString & aURL) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetURL(aURL); } \
  NS_SCRIPTABLE NS_IMETHOD SetURL(const nsAString & aURL) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetURL(aURL); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class kfURL : public kfIURL
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_KFIURL

  kfURL();

private:
  ~kfURL();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(kfURL, kfIURL)

kfURL::kfURL()
{
  /* member initializers and constructor code */
}

kfURL::~kfURL()
{
  /* destructor code */
}

/* attribute AString URL; */
NS_IMETHODIMP kfURL::GetURL(nsAString & aURL)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfURL::SetURL(const nsAString & aURL)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


/* starting interface:    kfIGroupInfo */
#define KFIGROUPINFO_IID_STR "21e05ab1-d964-476f-ba73-c318c51a118e"

#define KFIGROUPINFO_IID \
  {0x21e05ab1, 0xd964, 0x476f, \
    { 0xba, 0x73, 0xc3, 0x18, 0xc5, 0x1a, 0x11, 0x8e }}

class NS_NO_VTABLE NS_SCRIPTABLE kfIGroupInfo : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(KFIGROUPINFO_IID)

  /* attribute AString title; */
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) = 0;

  /* attribute AString uniqueID; */
  NS_SCRIPTABLE NS_IMETHOD GetUniqueID(nsAString & aUniqueID) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetUniqueID(const nsAString & aUniqueID) = 0;

  /* attribute ACString iconImageData; */
  NS_SCRIPTABLE NS_IMETHOD GetIconImageData(nsACString & aIconImageData) = 0;
  NS_SCRIPTABLE NS_IMETHOD SetIconImageData(const nsACString & aIconImageData) = 0;

  /* void init (in AString title, in AString uniqueID); */
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & title, const nsAString & uniqueID) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(kfIGroupInfo, KFIGROUPINFO_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_KFIGROUPINFO \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle); \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle); \
  NS_SCRIPTABLE NS_IMETHOD GetUniqueID(nsAString & aUniqueID); \
  NS_SCRIPTABLE NS_IMETHOD SetUniqueID(const nsAString & aUniqueID); \
  NS_SCRIPTABLE NS_IMETHOD GetIconImageData(nsACString & aIconImageData); \
  NS_SCRIPTABLE NS_IMETHOD SetIconImageData(const nsACString & aIconImageData); \
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & title, const nsAString & uniqueID); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_KFIGROUPINFO(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) { return _to GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) { return _to SetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetUniqueID(nsAString & aUniqueID) { return _to GetUniqueID(aUniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD SetUniqueID(const nsAString & aUniqueID) { return _to SetUniqueID(aUniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD GetIconImageData(nsACString & aIconImageData) { return _to GetIconImageData(aIconImageData); } \
  NS_SCRIPTABLE NS_IMETHOD SetIconImageData(const nsACString & aIconImageData) { return _to SetIconImageData(aIconImageData); } \
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & title, const nsAString & uniqueID) { return _to Init(title, uniqueID); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_KFIGROUPINFO(_to) \
  NS_SCRIPTABLE NS_IMETHOD GetTitle(nsAString & aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD SetTitle(const nsAString & aTitle) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetTitle(aTitle); } \
  NS_SCRIPTABLE NS_IMETHOD GetUniqueID(nsAString & aUniqueID) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetUniqueID(aUniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD SetUniqueID(const nsAString & aUniqueID) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetUniqueID(aUniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD GetIconImageData(nsACString & aIconImageData) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetIconImageData(aIconImageData); } \
  NS_SCRIPTABLE NS_IMETHOD SetIconImageData(const nsACString & aIconImageData) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetIconImageData(aIconImageData); } \
  NS_SCRIPTABLE NS_IMETHOD Init(const nsAString & title, const nsAString & uniqueID) { return !_to ? NS_ERROR_NULL_POINTER : _to->Init(title, uniqueID); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class kfGroupInfo : public kfIGroupInfo
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_KFIGROUPINFO

  kfGroupInfo();

private:
  ~kfGroupInfo();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(kfGroupInfo, kfIGroupInfo)

kfGroupInfo::kfGroupInfo()
{
  /* member initializers and constructor code */
}

kfGroupInfo::~kfGroupInfo()
{
  /* destructor code */
}

/* attribute AString title; */
NS_IMETHODIMP kfGroupInfo::GetTitle(nsAString & aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfGroupInfo::SetTitle(const nsAString & aTitle)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute AString uniqueID; */
NS_IMETHODIMP kfGroupInfo::GetUniqueID(nsAString & aUniqueID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfGroupInfo::SetUniqueID(const nsAString & aUniqueID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute ACString iconImageData; */
NS_IMETHODIMP kfGroupInfo::GetIconImageData(nsACString & aIconImageData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP kfGroupInfo::SetIconImageData(const nsACString & aIconImageData)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void init (in AString title, in AString uniqueID); */
NS_IMETHODIMP kfGroupInfo::Init(const nsAString & title, const nsAString & uniqueID)
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
	 * @param parentUUID
     *        The unique id of the parent group of this new login (if null, root group will be used).
     */
  /* void addLogin (in kfILoginInfo aLogin, in AString parentUUID, [retval] out kfILoginInfo newLogin); */
  NS_SCRIPTABLE NS_IMETHOD AddLogin(kfILoginInfo *aLogin, const nsAString & parentUUID, kfILoginInfo **newLogin) = 0;

  /**
     * Modify an existing login in the login manager.
     *
     * @param oldLogin
     *        The login to be modified.
	 * @param newLogin
     *        The new login data.
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

  /* void findGroups (out unsigned long count, in AString name, in AString aUniqueID, [array, size_is (count), retval] out kfIGroupInfo groups); */
  NS_SCRIPTABLE NS_IMETHOD FindGroups(PRUint32 *count, const nsAString & name, const nsAString & aUniqueID, kfIGroupInfo ***groups) = 0;

  /* void addGroup (in AString name, in AString parentUUID, [retval] out kfIGroupInfo newGroup); */
  NS_SCRIPTABLE NS_IMETHOD AddGroup(const nsAString & name, const nsAString & parentUUID, kfIGroupInfo **newGroup) = 0;

  /* boolean deleteLogin (in AString uniqueID); */
  NS_SCRIPTABLE NS_IMETHOD DeleteLogin(const nsAString & uniqueID, PRBool *_retval) = 0;

  /* boolean deleteGroup (in AString uniqueID); */
  NS_SCRIPTABLE NS_IMETHOD DeleteGroup(const nsAString & uniqueID, PRBool *_retval) = 0;

  /* void getParentGroup (in AString uniqueID, [retval] out kfIGroupInfo parentGroup); */
  NS_SCRIPTABLE NS_IMETHOD GetParentGroup(const nsAString & uniqueID, kfIGroupInfo **parentGroup) = 0;

  /* void getChildGroups (out unsigned long count, in AString uniqueID, [array, size_is (count), retval] out kfIGroupInfo groups); */
  NS_SCRIPTABLE NS_IMETHOD GetChildGroups(PRUint32 *count, const nsAString & uniqueID, kfIGroupInfo ***groups) = 0;

  /* void getChildEntries (out unsigned long count, in AString uniqueID, [array, size_is (count), retval] out kfILoginInfo logins); */
  NS_SCRIPTABLE NS_IMETHOD GetChildEntries(PRUint32 *count, const nsAString & uniqueID, kfILoginInfo ***logins) = 0;

  /* void getRootGroup ([retval] out kfIGroupInfo rootGroup); */
  NS_SCRIPTABLE NS_IMETHOD GetRootGroup(kfIGroupInfo **rootGroup) = 0;

  /* void launchLoginEditor (in AString uniqueID); */
  NS_SCRIPTABLE NS_IMETHOD LaunchLoginEditor(const nsAString & uniqueID) = 0;

  /* void launchGroupEditor (in AString uniqueID); */
  NS_SCRIPTABLE NS_IMETHOD LaunchGroupEditor(const nsAString & uniqueID) = 0;

  /* void getMRUdatabases (out unsigned long count, [array, size_is (count), retval] out string databases); */
  NS_SCRIPTABLE NS_IMETHOD GetMRUdatabases(PRUint32 *count, char ***databases) = 0;

  /* boolean getAutoCommit (); */
  NS_SCRIPTABLE NS_IMETHOD GetAutoCommit(PRBool *_retval) = 0;

  /* boolean setAutoCommit (in boolean autoCommit); */
  NS_SCRIPTABLE NS_IMETHOD SetAutoCommit(PRBool autoCommit, PRBool *_retval) = 0;

  /* boolean setCurrentDBRootGroup (in AString uniqueID); */
  NS_SCRIPTABLE NS_IMETHOD SetCurrentDBRootGroup(const nsAString & uniqueID, PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(IKeeFox, IKEEFOX_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_IKEEFOX \
  NS_SCRIPTABLE NS_IMETHOD CheckVersion(float keeFoxVersion, float keeICEVersion, PRInt32 *result, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD AddObserver(KeeFoxObserver *observer); \
  NS_SCRIPTABLE NS_IMETHOD GetDBName(nsAString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD GetDBFileName(nsAString & _retval); \
  NS_SCRIPTABLE NS_IMETHOD ChangeDB(const nsAString & fileName, PRBool closeCurrent); \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName); \
  NS_SCRIPTABLE NS_IMETHOD RunAnInstaller(const nsAString & fileName, const nsAString & params); \
  NS_SCRIPTABLE NS_IMETHOD LaunchKeePass(const nsAString & fileName, const nsAString & DBFile); \
  NS_SCRIPTABLE NS_IMETHOD ShutdownICE(void); \
  NS_SCRIPTABLE NS_IMETHOD IsUserAdministrator(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD AddLogin(kfILoginInfo *aLogin, const nsAString & parentUUID, kfILoginInfo **newLogin); \
  NS_SCRIPTABLE NS_IMETHOD ModifyLogin(kfILoginInfo *oldLogin, kfILoginInfo *newLogin); \
  NS_SCRIPTABLE NS_IMETHOD GetAllLogins(PRUint32 *count, kfILoginInfo ***logins); \
  NS_SCRIPTABLE NS_IMETHOD FindLogins(PRUint32 *count, const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, const nsAString & aUniqueID, kfILoginInfo ***logins); \
  NS_SCRIPTABLE NS_IMETHOD CountLogins(const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, PRUint32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD FindGroups(PRUint32 *count, const nsAString & name, const nsAString & aUniqueID, kfIGroupInfo ***groups); \
  NS_SCRIPTABLE NS_IMETHOD AddGroup(const nsAString & name, const nsAString & parentUUID, kfIGroupInfo **newGroup); \
  NS_SCRIPTABLE NS_IMETHOD DeleteLogin(const nsAString & uniqueID, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD DeleteGroup(const nsAString & uniqueID, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD GetParentGroup(const nsAString & uniqueID, kfIGroupInfo **parentGroup); \
  NS_SCRIPTABLE NS_IMETHOD GetChildGroups(PRUint32 *count, const nsAString & uniqueID, kfIGroupInfo ***groups); \
  NS_SCRIPTABLE NS_IMETHOD GetChildEntries(PRUint32 *count, const nsAString & uniqueID, kfILoginInfo ***logins); \
  NS_SCRIPTABLE NS_IMETHOD GetRootGroup(kfIGroupInfo **rootGroup); \
  NS_SCRIPTABLE NS_IMETHOD LaunchLoginEditor(const nsAString & uniqueID); \
  NS_SCRIPTABLE NS_IMETHOD LaunchGroupEditor(const nsAString & uniqueID); \
  NS_SCRIPTABLE NS_IMETHOD GetMRUdatabases(PRUint32 *count, char ***databases); \
  NS_SCRIPTABLE NS_IMETHOD GetAutoCommit(PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD SetAutoCommit(PRBool autoCommit, PRBool *_retval); \
  NS_SCRIPTABLE NS_IMETHOD SetCurrentDBRootGroup(const nsAString & uniqueID, PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_IKEEFOX(_to) \
  NS_SCRIPTABLE NS_IMETHOD CheckVersion(float keeFoxVersion, float keeICEVersion, PRInt32 *result, PRBool *_retval) { return _to CheckVersion(keeFoxVersion, keeICEVersion, result, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD AddObserver(KeeFoxObserver *observer) { return _to AddObserver(observer); } \
  NS_SCRIPTABLE NS_IMETHOD GetDBName(nsAString & _retval) { return _to GetDBName(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetDBFileName(nsAString & _retval) { return _to GetDBFileName(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD ChangeDB(const nsAString & fileName, PRBool closeCurrent) { return _to ChangeDB(fileName, closeCurrent); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return _to GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return _to SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD RunAnInstaller(const nsAString & fileName, const nsAString & params) { return _to RunAnInstaller(fileName, params); } \
  NS_SCRIPTABLE NS_IMETHOD LaunchKeePass(const nsAString & fileName, const nsAString & DBFile) { return _to LaunchKeePass(fileName, DBFile); } \
  NS_SCRIPTABLE NS_IMETHOD ShutdownICE(void) { return _to ShutdownICE(); } \
  NS_SCRIPTABLE NS_IMETHOD IsUserAdministrator(PRBool *_retval) { return _to IsUserAdministrator(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD AddLogin(kfILoginInfo *aLogin, const nsAString & parentUUID, kfILoginInfo **newLogin) { return _to AddLogin(aLogin, parentUUID, newLogin); } \
  NS_SCRIPTABLE NS_IMETHOD ModifyLogin(kfILoginInfo *oldLogin, kfILoginInfo *newLogin) { return _to ModifyLogin(oldLogin, newLogin); } \
  NS_SCRIPTABLE NS_IMETHOD GetAllLogins(PRUint32 *count, kfILoginInfo ***logins) { return _to GetAllLogins(count, logins); } \
  NS_SCRIPTABLE NS_IMETHOD FindLogins(PRUint32 *count, const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, const nsAString & aUniqueID, kfILoginInfo ***logins) { return _to FindLogins(count, aHostname, aActionURL, aHttpRealm, aUniqueID, logins); } \
  NS_SCRIPTABLE NS_IMETHOD CountLogins(const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, PRUint32 *_retval) { return _to CountLogins(aHostname, aActionURL, aHttpRealm, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD FindGroups(PRUint32 *count, const nsAString & name, const nsAString & aUniqueID, kfIGroupInfo ***groups) { return _to FindGroups(count, name, aUniqueID, groups); } \
  NS_SCRIPTABLE NS_IMETHOD AddGroup(const nsAString & name, const nsAString & parentUUID, kfIGroupInfo **newGroup) { return _to AddGroup(name, parentUUID, newGroup); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteLogin(const nsAString & uniqueID, PRBool *_retval) { return _to DeleteLogin(uniqueID, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteGroup(const nsAString & uniqueID, PRBool *_retval) { return _to DeleteGroup(uniqueID, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentGroup(const nsAString & uniqueID, kfIGroupInfo **parentGroup) { return _to GetParentGroup(uniqueID, parentGroup); } \
  NS_SCRIPTABLE NS_IMETHOD GetChildGroups(PRUint32 *count, const nsAString & uniqueID, kfIGroupInfo ***groups) { return _to GetChildGroups(count, uniqueID, groups); } \
  NS_SCRIPTABLE NS_IMETHOD GetChildEntries(PRUint32 *count, const nsAString & uniqueID, kfILoginInfo ***logins) { return _to GetChildEntries(count, uniqueID, logins); } \
  NS_SCRIPTABLE NS_IMETHOD GetRootGroup(kfIGroupInfo **rootGroup) { return _to GetRootGroup(rootGroup); } \
  NS_SCRIPTABLE NS_IMETHOD LaunchLoginEditor(const nsAString & uniqueID) { return _to LaunchLoginEditor(uniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD LaunchGroupEditor(const nsAString & uniqueID) { return _to LaunchGroupEditor(uniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD GetMRUdatabases(PRUint32 *count, char ***databases) { return _to GetMRUdatabases(count, databases); } \
  NS_SCRIPTABLE NS_IMETHOD GetAutoCommit(PRBool *_retval) { return _to GetAutoCommit(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetAutoCommit(PRBool autoCommit, PRBool *_retval) { return _to SetAutoCommit(autoCommit, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetCurrentDBRootGroup(const nsAString & uniqueID, PRBool *_retval) { return _to SetCurrentDBRootGroup(uniqueID, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_IKEEFOX(_to) \
  NS_SCRIPTABLE NS_IMETHOD CheckVersion(float keeFoxVersion, float keeICEVersion, PRInt32 *result, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CheckVersion(keeFoxVersion, keeICEVersion, result, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD AddObserver(KeeFoxObserver *observer) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddObserver(observer); } \
  NS_SCRIPTABLE NS_IMETHOD GetDBName(nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDBName(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetDBFileName(nsAString & _retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetDBFileName(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD ChangeDB(const nsAString & fileName, PRBool closeCurrent) { return !_to ? NS_ERROR_NULL_POINTER : _to->ChangeDB(fileName, closeCurrent); } \
  NS_SCRIPTABLE NS_IMETHOD GetName(nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD SetName(const nsAString & aName) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetName(aName); } \
  NS_SCRIPTABLE NS_IMETHOD RunAnInstaller(const nsAString & fileName, const nsAString & params) { return !_to ? NS_ERROR_NULL_POINTER : _to->RunAnInstaller(fileName, params); } \
  NS_SCRIPTABLE NS_IMETHOD LaunchKeePass(const nsAString & fileName, const nsAString & DBFile) { return !_to ? NS_ERROR_NULL_POINTER : _to->LaunchKeePass(fileName, DBFile); } \
  NS_SCRIPTABLE NS_IMETHOD ShutdownICE(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->ShutdownICE(); } \
  NS_SCRIPTABLE NS_IMETHOD IsUserAdministrator(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsUserAdministrator(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD AddLogin(kfILoginInfo *aLogin, const nsAString & parentUUID, kfILoginInfo **newLogin) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddLogin(aLogin, parentUUID, newLogin); } \
  NS_SCRIPTABLE NS_IMETHOD ModifyLogin(kfILoginInfo *oldLogin, kfILoginInfo *newLogin) { return !_to ? NS_ERROR_NULL_POINTER : _to->ModifyLogin(oldLogin, newLogin); } \
  NS_SCRIPTABLE NS_IMETHOD GetAllLogins(PRUint32 *count, kfILoginInfo ***logins) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAllLogins(count, logins); } \
  NS_SCRIPTABLE NS_IMETHOD FindLogins(PRUint32 *count, const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, const nsAString & aUniqueID, kfILoginInfo ***logins) { return !_to ? NS_ERROR_NULL_POINTER : _to->FindLogins(count, aHostname, aActionURL, aHttpRealm, aUniqueID, logins); } \
  NS_SCRIPTABLE NS_IMETHOD CountLogins(const nsAString & aHostname, const nsAString & aActionURL, const nsAString & aHttpRealm, PRUint32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->CountLogins(aHostname, aActionURL, aHttpRealm, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD FindGroups(PRUint32 *count, const nsAString & name, const nsAString & aUniqueID, kfIGroupInfo ***groups) { return !_to ? NS_ERROR_NULL_POINTER : _to->FindGroups(count, name, aUniqueID, groups); } \
  NS_SCRIPTABLE NS_IMETHOD AddGroup(const nsAString & name, const nsAString & parentUUID, kfIGroupInfo **newGroup) { return !_to ? NS_ERROR_NULL_POINTER : _to->AddGroup(name, parentUUID, newGroup); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteLogin(const nsAString & uniqueID, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->DeleteLogin(uniqueID, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD DeleteGroup(const nsAString & uniqueID, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->DeleteGroup(uniqueID, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD GetParentGroup(const nsAString & uniqueID, kfIGroupInfo **parentGroup) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetParentGroup(uniqueID, parentGroup); } \
  NS_SCRIPTABLE NS_IMETHOD GetChildGroups(PRUint32 *count, const nsAString & uniqueID, kfIGroupInfo ***groups) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetChildGroups(count, uniqueID, groups); } \
  NS_SCRIPTABLE NS_IMETHOD GetChildEntries(PRUint32 *count, const nsAString & uniqueID, kfILoginInfo ***logins) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetChildEntries(count, uniqueID, logins); } \
  NS_SCRIPTABLE NS_IMETHOD GetRootGroup(kfIGroupInfo **rootGroup) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetRootGroup(rootGroup); } \
  NS_SCRIPTABLE NS_IMETHOD LaunchLoginEditor(const nsAString & uniqueID) { return !_to ? NS_ERROR_NULL_POINTER : _to->LaunchLoginEditor(uniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD LaunchGroupEditor(const nsAString & uniqueID) { return !_to ? NS_ERROR_NULL_POINTER : _to->LaunchGroupEditor(uniqueID); } \
  NS_SCRIPTABLE NS_IMETHOD GetMRUdatabases(PRUint32 *count, char ***databases) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetMRUdatabases(count, databases); } \
  NS_SCRIPTABLE NS_IMETHOD GetAutoCommit(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetAutoCommit(_retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetAutoCommit(PRBool autoCommit, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetAutoCommit(autoCommit, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD SetCurrentDBRootGroup(const nsAString & uniqueID, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetCurrentDBRootGroup(uniqueID, _retval); } 

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

/* void addLogin (in kfILoginInfo aLogin, in AString parentUUID, [retval] out kfILoginInfo newLogin); */
NS_IMETHODIMP _MYCLASS_::AddLogin(kfILoginInfo *aLogin, const nsAString & parentUUID, kfILoginInfo **newLogin)
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

/* void findGroups (out unsigned long count, in AString name, in AString aUniqueID, [array, size_is (count), retval] out kfIGroupInfo groups); */
NS_IMETHODIMP _MYCLASS_::FindGroups(PRUint32 *count, const nsAString & name, const nsAString & aUniqueID, kfIGroupInfo ***groups)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void addGroup (in AString name, in AString parentUUID, [retval] out kfIGroupInfo newGroup); */
NS_IMETHODIMP _MYCLASS_::AddGroup(const nsAString & name, const nsAString & parentUUID, kfIGroupInfo **newGroup)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean deleteLogin (in AString uniqueID); */
NS_IMETHODIMP _MYCLASS_::DeleteLogin(const nsAString & uniqueID, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean deleteGroup (in AString uniqueID); */
NS_IMETHODIMP _MYCLASS_::DeleteGroup(const nsAString & uniqueID, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getParentGroup (in AString uniqueID, [retval] out kfIGroupInfo parentGroup); */
NS_IMETHODIMP _MYCLASS_::GetParentGroup(const nsAString & uniqueID, kfIGroupInfo **parentGroup)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getChildGroups (out unsigned long count, in AString uniqueID, [array, size_is (count), retval] out kfIGroupInfo groups); */
NS_IMETHODIMP _MYCLASS_::GetChildGroups(PRUint32 *count, const nsAString & uniqueID, kfIGroupInfo ***groups)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getChildEntries (out unsigned long count, in AString uniqueID, [array, size_is (count), retval] out kfILoginInfo logins); */
NS_IMETHODIMP _MYCLASS_::GetChildEntries(PRUint32 *count, const nsAString & uniqueID, kfILoginInfo ***logins)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getRootGroup ([retval] out kfIGroupInfo rootGroup); */
NS_IMETHODIMP _MYCLASS_::GetRootGroup(kfIGroupInfo **rootGroup)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void launchLoginEditor (in AString uniqueID); */
NS_IMETHODIMP _MYCLASS_::LaunchLoginEditor(const nsAString & uniqueID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void launchGroupEditor (in AString uniqueID); */
NS_IMETHODIMP _MYCLASS_::LaunchGroupEditor(const nsAString & uniqueID)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void getMRUdatabases (out unsigned long count, [array, size_is (count), retval] out string databases); */
NS_IMETHODIMP _MYCLASS_::GetMRUdatabases(PRUint32 *count, char ***databases)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean getAutoCommit (); */
NS_IMETHODIMP _MYCLASS_::GetAutoCommit(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean setAutoCommit (in boolean autoCommit); */
NS_IMETHODIMP _MYCLASS_::SetAutoCommit(PRBool autoCommit, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean setCurrentDBRootGroup (in AString uniqueID); */
NS_IMETHODIMP _MYCLASS_::SetCurrentDBRootGroup(const nsAString & uniqueID, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_comp_h__ */
