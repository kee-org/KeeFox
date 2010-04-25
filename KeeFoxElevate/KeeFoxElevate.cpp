/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
Copyright 2008-2010 Chris Tomlinson <keefox@christomlinson.name>
  
The KeeFoxElevate.exe requests UAC elevation for a process. It is required for
installation of components in some circumstances.

It would normally be used only when Firefox is not already running with
administrative priveledges (probably all cases except admin user on XP)

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

/* The executable produced does NOT require the Windows CRT but it may 
have a CRT-enabled manifest forced upon it by visual studio. To avoid
deployment dependency on the Visual Studio C++ runtime library, embed
the following manifest:

<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<assembly xmlns='urn:schemas-microsoft-com:asm.v1' manifestVersion='1.0'>
  <trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
    <security>
      <requestedPrivileges>
        <requestedExecutionLevel level='asInvoker' uiAccess='false' />
      </requestedPrivileges>
    </security>
  </trustInfo>
</assembly>

*/
#include <intrin.h>
#pragma intrinsic( memset )

#include <windows.h>
#include <shellapi.h>
#include <tchar.h>
#include <strsafe.h>
//#include "shlobj.h"

//#define IMPLEMENT_VISTA_TOOLS
//#include "VistaTools.cxx"

//#define BUFFERSIZE 4096
//#define INDIVIDUALBUFFERSIZE 1024

//bool fileExists(const TCHAR *fileName)
//{
//	DWORD fileAttributes;
//
//	fileAttributes = GetFileAttributesW(fileName);
//	if (fileAttributes == 0xFFFFFFFF)
//		return false;
//	return true;
//}
int 
MyShellExec(	HWND hwnd, 
				LPCTSTR pszVerb, 
				LPCTSTR pszPath, 
				LPCTSTR pszParameters, // = NULL,
				LPCTSTR pszDirectory,  // = NULL,
				BOOL wait)
{
	SHELLEXECUTEINFO shex;
	DWORD dwRet;

	//memset( &shex, 0, sizeof( shex) );
	int size = sizeof(SHELLEXECUTEINFO);
    SecureZeroMemory(&shex, size);

	shex.cbSize			= sizeof( SHELLEXECUTEINFO ); 
	shex.hwnd			= hwnd;
	shex.lpVerb			= pszVerb; 
	shex.lpFile			= pszPath; 
	shex.lpParameters	= pszParameters; 
	shex.lpDirectory	= pszDirectory; 
	shex.nShow			= SW_NORMAL; 
	if (wait)
		shex.fMask		= SEE_MASK_NOCLOSEPROCESS; 
	else
		shex.fMask		= 0;

	// Returns Non-Zero on success
      if( ::ShellExecuteEx( &shex ) )
      {
            DWORD dwSignaled = ::WaitForSingleObject( shex.hProcess , INFINITE );
            // WAIT_OBJECT_0 is success for the event trigger
            if ( dwSignaled == WAIT_OBJECT_0 )
            {
                  // Returns Non-Zero on success
                  if( ::GetExitCodeProcess( shex.hProcess , &dwRet ) )
                  {
					  CloseHandle(shex.hProcess);
					  //dwRet = ::GetLastError( );
					 // printf("f");
                      return 0;
                  }
            }
      }
      //dwRet = ::GetLastError( );
	//  print("e");
      return 1;
}

BOOL IsVista()
{
	OSVERSIONINFO osver;

	osver.dwOSVersionInfoSize = sizeof( OSVERSIONINFO );
	
	if (	::GetVersionEx( &osver ) && 
			osver.dwPlatformId == VER_PLATFORM_WIN32_NT && 
			(osver.dwMajorVersion >= 6 ) )
		return TRUE;
//printf("d");
	return FALSE;
}

int main ()
{
	int argc;
	//TCHAR charBuf[BUFFERSIZE];
    LPTSTR KeePassRPCSource;
	LPTSTR KeePassRPCDest;
	LPWSTR commandLine = GetCommandLineW();
	int bufSize = lstrlen(commandLine); //TODO: a bit too cautious
	TCHAR charBuf[4096];// = L"";
	for (int j=0; j<4096; j++)
		charBuf[j] = '\0';
	LPTSTR cmdParams = (LPTSTR) charBuf;
//	SecureZeroMemory(&cmdParams, 4096);

	// extract the command line parameters and check there is the right quantity
	LPTSTR *argv = ::CommandLineToArgvW(commandLine,&argc);
	if (argc <= 1)
	{
		LocalFree(argv);
//		printf("a");
		return 1;
	}

	for (int i=2; i<argc; i++)
	{
		if (FAILED(StringCchCat(cmdParams,lstrlen(cmdParams)+lstrlen(argv[i])+1,argv[i])))
		{
			LocalFree(argv);
//			printf("b");
			return 1;
		}
	}

int result = 0;

	if (IsVista())
		result = MyShellExec( NULL, L"runas", argv[1], cmdParams,L"", TRUE );
	else
		result = MyShellExec( NULL, L"open", argv[1], cmdParams,L"", TRUE );
//printf("c");
		LocalFree(argv);
	return result;

	//// define 1KB buffers for each file path (should be more than enough
	////for any path length for forseeable future and is already longer
	////than current MAX_PATH windows constant)
 //   KeePassRPCSource = (LPTSTR) charBuf;
	//KeePassRPCDest = (LPTSTR) charBuf+(INDIVIDUALBUFFERSIZE);

	//// populate the string buffers with the directory path to each file we're interested in
 //   if (FAILED(StringCchCopy(
	//	KeePassRPCSource,
	//	INDIVIDUALBUFFERSIZE-(sizeof(TCHAR)*lstrlen(L"\\KeePassRPC.plgx")),
	//	argv[1])))
 //   {
 //       LocalFree(argv);
 //       return 1;
 //   }

	//if (FAILED(StringCchCopy(
	//	KeePassRPCDest,
	//	INDIVIDUALBUFFERSIZE-(sizeof(TCHAR)*lstrlen(L"\\KeePassRPC.plgx")),
	//	argv[2])))
 //   {
 //       LocalFree(argv);
 //       return 1;
 //   }

	//// create the plugins directory if required
	//if (!fileExists(argv[2]))
	//	CreateDirectoryW(argv[2],NULL);
	//	
	//LocalFree(argv);

	//// append the name of each file so we end up with full paths to the files we need
	//if (FAILED(StringCchCat(KeePassRPCSource,INDIVIDUALBUFFERSIZE,L"\\KeePassRPC.plgx")))
	//	return 1;
	//if (FAILED(StringCchCat(KeePassRPCDest,INDIVIDUALBUFFERSIZE,L"\\KeePassRPC.plgx")))
	//	return 1;

	//// copy the file to its new home
	//if (::CopyFileW (KeePassRPCSource, KeePassRPCDest, false))
	//	return 0; // everything worked

 //   return 1;	// files couldn't be copied (most likely = permission
	//			// denied but we can't be certain about that)
}


int APIENTRY WinMain(HINSTANCE, HINSTANCE, LPSTR, int)
{
    int ret;
    ret = main();
	ExitProcess(ret);
    //return ret;
}
