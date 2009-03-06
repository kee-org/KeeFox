/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2009 Chris Tomlinson <keefox@christomlinson.name>

  This sets the environment path and then manaully loads the KeeFox DLL into the
  Firefox executable

  The Initial Developer of the Original Code is
  The Bioengineering Institute, University of Auckland. (Zinc extension)
  contact: Andrew Miller <ak.miller@auckland.ac.nz>

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

#include <nsISupports.h>
#include <nsCOMPtr.h>
#include <nsIFile.h>
#include <nsILocalFile.h>
#include <nsModule.h>
#include <nsDirectoryServiceDefs.h>
#include <nsAppDirectoryServiceDefs.h>
#include <nsIVersionComparator.h>
#include <nsServiceManagerUtils.h>
#include <nsIXULAppInfo.h>
#if defined MOZILLA_INTERNAL_API
#include <nsString.h>
#else
#include <nsStringAPI.h>
#endif
#include <nsDirectoryServiceUtils.h>
#include "nspr/prlink.h"
#ifdef XP_WIN
#include <nspr/prenv.h>
#include <nspr/plstr.h>
#else
#include <dlfcn.h>
#endif
//#include <stdio.h>

class KeeFoxLoader
  : public nsISupports
{
public:
  KeeFoxLoader();
  NS_DECL_ISUPPORTS
protected:
  virtual ~KeeFoxLoader() {}
};

NS_IMPL_ISUPPORTS0(KeeFoxLoader)

static void
DoPreparations(nsIFile* pdir)
{
#ifdef XP_WIN
  nsCOMPtr<nsIFile> src;
  char* envstr;
  nsString path;
  nsCString cpath;
  PRBool bool_result;

  pdir->Clone(getter_AddRefs(src));
  src->Append(NS_LITERAL_STRING("keefox-libraries"));
  if ((NS_OK != src->IsDirectory(&bool_result)) || (false == bool_result))
  {
    printf("Can't find keefox-libraries directory.\n");
    return;    
  }

  src->GetPath(path);


  NS_UTF16ToCString(path, NS_CSTRING_ENCODING_UTF8, cpath);
  envstr = PR_GetEnv("PATH");
  
  nsCString cpt(NS_LITERAL_CSTRING("PATH="));
  if (envstr == nsnull)
  {
    cpt += cpath;
  }
  else
  {
    cpt += cpath;
    cpt += NS_LITERAL_CSTRING(";");
    cpt += envstr;
  }
#if defined (ZINC_DEBUG)
  printf ("zincPreparer::DoPreparations: Setting %s\n",
    cpt.get());
#endif // defined (ZINC_DEBUG)
  PR_SetEnv(PL_strdup(cpt.get()));

#else

  const nsString filenames[] =
    {
      NS_LITERAL_STRING("libcmgui_pass_through.so"),
      NS_LITERAL_STRING("libcmgui_general.so"),
      NS_LITERAL_STRING("libcmgui_core_fields.so"),
      NS_LITERAL_STRING("libcmgui.so")
    };
  PRUint32 i;
  for (i = 0; i < sizeof(filenames)/sizeof(filenames[0]); i++)
  {
    nsCOMPtr<nsIFile> src;
    nsString file;
    nsCString cfile;
    PRBool bool_result;
    
    pdir->Clone(getter_AddRefs(src));
    src->Append(NS_LITERAL_STRING("cmgui_libraries"));

    if ((NS_OK != src->IsDirectory(&bool_result)) || (false == bool_result))
    {
      printf("Can't find cmgui_libraries directory.\n");
      return;    
    }

    src->Append(filenames[i]);
    src->GetPath(file);
    NS_UTF16ToCString(file, NS_CSTRING_ENCODING_UTF8, cfile);
    if (!dlopen(cfile.get(), RTLD_LAZY | RTLD_GLOBAL))
    {
      printf("Unable to open library required for zinc extension : %s : %s\n",
        cfile.get(), dlerror());
    }
  }
#endif
}

nsresult NSGetModule(nsIComponentManager *component_manager,
  nsIFile *file_location, nsIModule **loaded_module)
{
  nsresult return_code;
  nsCOMPtr<nsIFile> tdir, pdir;
  PRBool bool_result;

  file_location->Clone(getter_AddRefs(pdir));
  pdir->GetParent(getter_AddRefs(tdir));
  tdir->GetParent(getter_AddRefs(pdir));
  DoPreparations(pdir);

  pdir->Clone(getter_AddRefs(tdir));

  /* Check for a non mangled name first as this is simplest */
  pdir->Append(NS_LITERAL_STRING("keefox-libraries"));
  //if (NS_FAILED(pdir->IsDirectory(&bool_result)) || (false == bool_result))
  if (false)
  {
    /* Try version dependent directories */
    /* Reset the pdir */
    tdir->Clone(getter_AddRefs(pdir));

    nsCOMPtr<nsIXULAppInfo> appInfo; 
    appInfo = do_GetService("@mozilla.org/xre/app-info;1");
    
    nsCOMPtr<nsIVersionComparator> versionComparator; 
    versionComparator = do_GetService("@mozilla.org/xpcom/version-comparator;1");

    nsCString appVersion;
    appInfo->GetVersion(appVersion);

    /* Assume firefox as we don't use the preparer for XULrunner */
    PRInt32 compare_result;
    versionComparator->Compare(appVersion, NS_LITERAL_CSTRING("1.5"),
      &compare_result);
    if (0 <= compare_result)
    {
      versionComparator->Compare(appVersion, NS_LITERAL_CSTRING("3.0a1"),
        &compare_result);
      if (0 <= compare_result)
      {
#if defined (ZINC_DEBUG)
        printf("Version 3.0 or newer\n");
#endif /* defined (ZINC_DEBUG) */
        pdir->Append(NS_LITERAL_STRING("zinc_components_1_9"));
      }
      else
      {
#if defined (ZINC_DEBUG)
        printf("Version 1.5 or 2.0\n");
#endif /* defined (ZINC_DEBUG) */
        pdir->Append(NS_LITERAL_STRING("zinc_components_1_8"));
      }
    }
    if ((NS_OK != pdir->IsDirectory(&bool_result)) || (false == bool_result))
    {
      printf("Can't find version specific components directory.\n");
      return NS_ERROR_UNEXPECTED;
    }
  }

#ifdef XP_WIN
  pdir->Append(NS_LITERAL_STRING("KeeFox.dll"));
#else
  pdir->Append(NS_LITERAL_STRING("KeeFox.so"));
#endif

  PRLibrary *loaded_library;
  
  nsCOMPtr<nsILocalFile> library_file(do_QueryInterface(pdir));

  if (!library_file)
  {
    printf("Could not get local file for KeeFox library.\n");
    return NS_ERROR_UNEXPECTED;
  }

  return_code = library_file->Load(&loaded_library);
  if (NS_FAILED(return_code))
  {
    printf("Could not load KeeFox library.\n");
    return return_code;
  }

  nsGetModuleProc module_function = (nsGetModuleProc)
    PR_FindFunctionSymbol(loaded_library, NS_GET_MODULE_SYMBOL);

  if (!module_function)
  {
    printf("Could not find module proc in real library.\n");
    return NS_ERROR_FAILURE;
  }

  return_code = module_function(component_manager, file_location,
    loaded_module);

  return (return_code);
}
