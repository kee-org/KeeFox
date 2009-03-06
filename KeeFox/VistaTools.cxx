///////////////////////////////
/* VistaTools.cxx - version 2.1

THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
PARTICULAR PURPOSE.

Copyright (C) 2008.  WinAbility Software Corporation. All rights reserved.

Author: Andrei Belogortseff [ http://www.softblog.com ]

TERMS OF USE: You are free to use this file in any way you like, 
for both the commercial and non-commercial purposes, royalty-free,
AS LONG AS you agree with the warranty disclaimer above, 
EXCEPT that you may not remove or modify this or any of the 
preceeding paragraphs. If you make any changes, please document 
them in the MODIFICATIONS section below. If the changes are of general 
interest, please let us know and we will consider incorporating them in 
this file, as well.

If you use this file in your own project, an acknowledgment will be appreciated, 
although it's not required.

SUMMARY:

This file contains several Vista-specific functions helpful when dealing with the 
"elevation" features of Windows Vista. See the descriptions of the functions below
for information on what each function does and how to use it.

This file contains the Win32 stuff only, it can be used with or without other frameworks, 
such as MFC, ATL, etc.

HOW TO USE THIS FILE:

Make sure you have the latest Windows SDK (see msdn.microsoft.com for more information)
or this file may not compile!

This is a "combo" file that contains both the declarations (usually placed in the .h files) 
as well as the definitions (usually placed in the .cpp files) of the functions. 

To get the declarations only, include it as you would any .h file, for example:

#include "VistaTools.cxx"

To get both the declarations and definitions, define IMPLEMENT_VISTA_TOOLS before including the file:

#define IMPLEMENT_VISTA_TOOLS
#include "VistaTools.cxx"

(The above should be done once and only once per project).

To use the function RunNonElevated, this file must be compiled into a DLL.
In such a case, define DLL_EXPORTS when compiling the DLL, 
and do not define DLL_EXPORTS when compiling the projects linking to the DLL.

If you don't need to use RunNonElevated, then this file may be a part of an EXE 
project. In such a case, define DONTWANT_RunNonElevated and NO_DLL_IMPORTS to make 
this file compile properly. 

NOTE: The file VistaTools.cxx can be included in the VisualStudio projects, but it should be 
excluded from the build process (because its contents is compiled when it is included 
in another .cpp file with IMPLEMENT_VISTA_TOOLS defined, as shown above.)

MODIFICATIONS:
	v.1.0 (2006-Dec-16) created by Andrei Belogortseff.

	v.2.0 (2007-Feb-20) deprecated RunAsStdUser();
						implemented RunNonElevated() to replace RunAsStdUser(); 
						added function declarations for use in a DLL project

	v.2.1 (2008-Feb-24) removed RunAsStdUser();
*/

#include <strsafe.h>

#if ( NTDDI_VERSION < NTDDI_LONGHORN )
#	error NTDDI_VERSION must be defined as NTDDI_LONGHORN or later
#endif

//////////////////////////////////////////////////////////////////
// if ASSERT was not defined already, let's define our own version,
// to use the CRT assert() 

#ifndef ASSERT
#	ifdef _DEBUG
#		include <assert.h>
#		define ASSERT(x) assert( x )
#		define ASSERT_HERE assert( FALSE )
#	else// _DEBUG
#		define ASSERT(x) 
#		define ASSERT_HERE 
#	endif//_DEBUG
#endif//ASSERT

///////////////////////////////////////////////////////////////////
// a handy macro to get the number of characters (not bytes!) 
// a string buffer can hold

#ifndef _tsizeof 
#	define _tsizeof( s )  (sizeof(s)/sizeof(s[0]))
#endif//_tsizeof

///////////////////////////////////////////////////////////////
// macros to handle the functions implemented in a DLL properly

#ifdef DLL_EXPORTS
#	define DLL_API __declspec(dllexport)
#else
#	ifndef NO_DLL_IMPORTS
#		define DLL_API __declspec(dllimport)
#	else
#		define DLL_API 
#	endif
#endif

BOOL DLL_API 
IsVista();

/*
Use IsVista() to determine whether the current process is running under Windows Vista or 
(or a later version of Windows, whatever it will be)

Return Values:
	If the function succeeds, and the current version of Windows is Vista or later, 
		the return value is TRUE. 
	If the function fails, or if the current version of Windows is older than Vista 
		(that is, if it is Windows XP, Windows 2000, Windows Server 2003, Windows 98, etc.)
		the return value is FALSE.
*/

#ifndef WIN64

BOOL DLL_API
IsWow64();

/*
Use IsWow64() to determine whether the current 32-bit process is running under 64-bit Windows 
(Vista or XP)

Return Values:
	If the function succeeds, and the current version of Windows is x64, 
		the return value is TRUE. 
	If the function fails, or if the current version of Windows is 32-bit,
		the return value is FALSE.

While this function is not Vista specific (it works under XP as well), 
we include it here to be able to prevent execution of the 32-bit code under 64-bit Windows,
when required.
*/

#endif//WIN64


HRESULT DLL_API
GetElevationType( __out TOKEN_ELEVATION_TYPE * ptet );

/*
Use GetElevationType() to determine the elevation type of the current process.

Parameters:

ptet
	[out] Pointer to a variable that receives the elevation type of the current process.

	The possible values are:

	TokenElevationTypeDefault - User is not using a "split" token. 
		This value indicates that either UAC is disabled, or the process is started
		by a standard user (not a member of the Administrators group).

	The following two values can be returned only if both the UAC is enabled and
	the user is a member of the Administrator's group (that is, the user has a "split" token):

	TokenElevationTypeFull - the process is running elevated. 

	TokenElevationTypeLimited - the process is not running elevated.

Return Values:
	If the function succeeds, the return value is S_OK. 
	If the function fails, the return value is E_FAIL. To get extended error information, 
	call GetLastError().
*/

HRESULT DLL_API
IsElevated( __out_opt BOOL * pbElevated = NULL );

/*
Use IsElevated() to determine whether the current process is elevated or not.

Parameters:

pbElevated
	[out] [optional] Pointer to a BOOL variable that, if non-NULL, receives the result.

	The possible values are:

	TRUE - the current process is elevated.
		This value indicates that either UAC is enabled, and the process was elevated by 
		the administrator, or that UAC is disabled and the process was started by a user 
		who is a member of the Administrators group.

	FALSE - the current process is not elevated (limited).
		This value indicates that either UAC is enabled, and the process was started normally, 
		without the elevation, or that UAC is disabled and the process was started by a standard user. 

Return Values
	If the function succeeds, and the current process is elevated, the return value is S_OK. 
	If the function succeeds, and the current process is not elevated, the return value is S_FALSE. 
	If the function fails, the return value is E_FAIL. To get extended error information, 
	call GetLastError().
*/

BOOL DLL_API
RunElevated(
	__in		HWND	hwnd, 
	__in		LPCTSTR pszPath, 
	__in_opt	LPCTSTR pszParameters	= NULL, 
	__in_opt	LPCTSTR pszDirectory	= NULL );

/*
Use RunElevated() to start an elevated process. This function calls ShellExecEx() with the verb "runas" 
to start the elevated process.

Parameters:

hwnd
	[in] Window handle to any message boxes that the system might produce while executing this function.

pszPath
	[in] Address of a null-terminated string that specifies the name of the executable file that 
		should be used to start the process.

pszParameters
	[in] [optional] Address of a null-terminated string that contains the command-line parameters for the process. 
		If NULL, no parameters are passed to the process.

pszDirectory
	[in] [optional] Address of a null-terminated string that specifies the name of the working directory. 
		If NULL, the current directory is used as the working directory. .

Return Values
	If the function succeeds, the return value is TRUE. 
	If the function fails, the return value is FALSE. To get extended error information, 
	call GetLastError().

NOTE: This function will start a process elevated no matter which attribute (asInvoker, 
highestAvailable, or requireAdministrator) is specified in its manifest, and even if 
there is no such attribute at all.
*/

#ifndef DONTWANT_RunNonElevated

#ifdef NO_DLL_IMPORTS
#	error RunNonElevated must be used in a DLL project!
#endif//NO_DLL_IMPORTS


BOOL DLL_API
RunNonElevated(
	__in		HWND	hwnd, 
	__in		LPCTSTR pszPath, 
	__in_opt	LPCTSTR pszParameters	= NULL, 
	__in_opt	LPCTSTR pszDirectory	= NULL );

/*
Use RunNonElevated() to start a non-elevated process. If the current process is not elevated,
it calls ShellExecuteEx() to start the new process. If the current process is elevated,
it injects itself into the (non-elevated) shell process, and starts a non-elevated process from there.

Parameters:

hwnd
	[in] Window handle to any message boxes that the system might produce while executing this function.

pszPath
	[in] Address of a null-terminated string that specifies the executable file that 
		should be used to start the process.

pszParameters
	[in] [optional] Address of a null-terminated string that contains the command-line parameters for 
		the process. If NULL, no parameters are passed to the process.

pszDirectory
	[in] [optional] Address of a null-terminated string that specifies the name of the working directory. 
		If NULL, the current directory is used as the working directory. .

Return Values
	If the function succeeds, the return value is TRUE. 
	If the function fails, the return value is FALSE. To get extended error information, 
	call GetLastError().

NOTE: For this function to work, the application must be marked with the asInvoker or 
highestAvailable attributes in its manifest. If the executable to be started is marked 
as requireAdministrator, it will be started elevated! 
*/
#endif //DONTWANT_RunNonElevated

//////////////////////////////////////////////////////////
// MyShellExec is just a wrapper around a call to ShellExecuteEx, 
// to be able to specify the verb easily.

BOOL DLL_API
MyShellExec(	HWND hwnd, 
				LPCTSTR pszVerb, 
				LPCTSTR pszPath, 
				LPCTSTR pszParameters = NULL,
				LPCTSTR pszDirectory = NULL );


#ifdef IMPLEMENT_VISTA_TOOLS

//////////////////////////////////////////////////////////
// MyShellExec is just a wrapper around a call to ShellExecuteEx, 
// to be able to specify the verb easily.

BOOL 
MyShellExec(	HWND hwnd, 
				LPCTSTR pszVerb, 
				LPCTSTR pszPath, 
				LPCTSTR pszParameters, // = NULL,
				LPCTSTR pszDirectory ) // = NULL )
{
	SHELLEXECUTEINFO shex;

	memset( &shex, 0, sizeof( shex) );

	shex.cbSize			= sizeof( SHELLEXECUTEINFO ); 
	shex.fMask			= 0; 
	shex.hwnd			= hwnd;
	shex.lpVerb			= pszVerb; 
	shex.lpFile			= pszPath; 
	shex.lpParameters	= pszParameters; 
	shex.lpDirectory	= pszDirectory; 
	shex.nShow			= SW_NORMAL; 
 
	return ::ShellExecuteEx( &shex );
}

BOOL IsVista()
{
	OSVERSIONINFO osver;

	osver.dwOSVersionInfoSize = sizeof( OSVERSIONINFO );
	
	if (	::GetVersionEx( &osver ) && 
			osver.dwPlatformId == VER_PLATFORM_WIN32_NT && 
			(osver.dwMajorVersion >= 6 ) )
		return TRUE;

	return FALSE;
}

#ifndef WIN64 // we need this when compiling 32-bit code only

typedef BOOL (WINAPI *LPFN_ISWOW64PROCESS) (HANDLE hProcess,PBOOL Wow64Process);

LPFN_ISWOW64PROCESS fnIsWow64Process = 
	(LPFN_ISWOW64PROCESS)::GetProcAddress( ::GetModuleHandle(L"kernel32"),"IsWow64Process");

BOOL 
IsWow64()
{
    BOOL bIsWow64 = FALSE;
 
    if (NULL != fnIsWow64Process)
    {
		if ( !fnIsWow64Process( ::GetCurrentProcess(),&bIsWow64) )
        {
            ASSERT_HERE;
        }
    }

    return bIsWow64;
}

#endif//WIN64

HRESULT
GetElevationType( __out TOKEN_ELEVATION_TYPE * ptet )
{
	ASSERT( IsVista() );
	ASSERT( ptet );

	HRESULT hResult = E_FAIL; // assume an error occured
	HANDLE hToken	= NULL;

	if ( !::OpenProcessToken( 
				::GetCurrentProcess(), 
				TOKEN_QUERY, 
				&hToken ) )
	{
		ASSERT_HERE;
		return hResult;
	}

	DWORD dwReturnLength = 0;

	if ( !::GetTokenInformation(
				hToken,
				TokenElevationType,
				ptet,
				sizeof( *ptet ),
				&dwReturnLength ) )
	{
		ASSERT_HERE;
	}
	else
	{
		ASSERT( dwReturnLength == sizeof( *ptet ) );
		hResult = S_OK;
	}

	::CloseHandle( hToken );

	return hResult;
}

HRESULT 
IsElevated( __out_opt BOOL * pbElevated ) //= NULL )
{
	ASSERT( IsVista() );

	HRESULT hResult = E_FAIL; // assume an error occured
	HANDLE hToken	= NULL;

	if ( !::OpenProcessToken( 
				::GetCurrentProcess(), 
				TOKEN_QUERY, 
				&hToken ) )
	{
		ASSERT_HERE;
		return hResult;
	}

	TOKEN_ELEVATION te = { 0 };
	DWORD dwReturnLength = 0;

	if ( !::GetTokenInformation(
				hToken,
				TokenElevation,
				&te,
				sizeof( te ),
				&dwReturnLength ) )
	{
		ASSERT_HERE;
	}
	else
	{
		ASSERT( dwReturnLength == sizeof( te ) );

		hResult = te.TokenIsElevated ? S_OK : S_FALSE; 

		if ( pbElevated)
			*pbElevated = (te.TokenIsElevated != 0);
	}

	::CloseHandle( hToken );

	return hResult;
}

////////////////////////////////
// RunElevated simply calls ShellExecuteEx with the verb "runas" to start the elevated process.
// I wish there was a just as easy way to start a non-elevated process, as well.

BOOL 
RunElevated( 
	__in		HWND	hwnd, 
	__in		LPCTSTR pszPath, 
	__in_opt	LPCTSTR pszParameters, //	= NULL, 
	__in_opt	LPCTSTR pszDirectory ) //	= NULL );
{
	return MyShellExec( hwnd, L"runas", pszPath, pszParameters, pszDirectory );
}

#ifndef DONTWANT_RunNonElevated
///////////////////////////////////////
// RunNonElevated() implementation

///////////////////////////////////////////////////
//	The shared data, to be able to share 
//	data between ours and the shell proceses

#pragma section( "ve_shared", read, write, shared )

__declspec(allocate("ve_shared")) 
	HHOOK   hHook							= NULL;

__declspec(allocate("ve_shared")) 
	UINT	uVistaElevatorMsg				= 0;

__declspec(allocate("ve_shared")) 
	BOOL	bSuccess						= FALSE;

__declspec(allocate("ve_shared")) 
	TCHAR	szVE_Path[ MAX_PATH ]			= L"";

__declspec(allocate("ve_shared")) 
	TCHAR	szVE_Parameters[ MAX_PATH ]		= L"";

__declspec(allocate("ve_shared")) 
	TCHAR	szVE_Directory[ MAX_PATH ]		= L"";

//////////////////////////////////e
// the hook callback procedure, it is called in the context of th shell proces

LRESULT CALLBACK 
VistaEelevator_HookProc_MsgRet( int code, WPARAM wParam, LPARAM lParam )
{
    if ( code >= 0 && lParam )
    {
	    CWPRETSTRUCT * pwrs = (CWPRETSTRUCT *)lParam;

        if (pwrs->message == uVistaElevatorMsg )
		{
			bSuccess = ::MyShellExec( 
							pwrs->hwnd, 
							NULL, 
							szVE_Path, 
							szVE_Parameters, 
							szVE_Directory );
		}
    }

	return ::CallNextHookEx( hHook, code, wParam, lParam );
}

BOOL 
RunNonElevated(
	__in		HWND	hwnd, 
	__in		LPCTSTR pszPath, 
	__in_opt	LPCTSTR pszParameters, //	= NULL, 
	__in_opt	LPCTSTR pszDirectory ) //	= NULL );
{
	ASSERT( pszPath && *pszPath );	// other args are optional

	ASSERT( IsVista() );
	ASSERT( pszPath );

	if ( S_FALSE == IsElevated() ) 
	{
		// if the current process is not elevated, we can use ShellExecuteAs directly! 
	
		return MyShellExec( hwnd, 
							NULL, 
							pszPath, 
							pszParameters, 
							pszDirectory );
	}

	#ifndef WIN64

	// If 32-bit code is executing under x64 version of Windows, it will not work, because 
	// the shell is a 64-bit process, and to hook it successfully this code needs to be 64-bit as well

	if ( IsWow64() )
	{
		ASSERT_HERE;
		return FALSE;
	}

	#endif//WIN64


	//////////////////////////////////////////////
	//
	// How this code works:
	//
	// To start a non-elevated process, we need to inject our code into a non-elevated 
	// process already running on the target computer. Since Windows shell is non-elevated, 
	// and we can safely assume it to always run, (when was the last time you saw Windows 
	// running without its shell?), we will try to inject our code into the shell process.
	//
	// To inject the code, we will install a global hook, and send a message to 
	// a window created by the shell. This will cause our hook callback procedure to be executed
	// in the context of the shell proces. 
	//
	// Because this trick uses a global hook, the hook procedure must be in a DLL.
	// 

	/////////////////////
	// First, register a private message, to communicate with the (hooked) shell process

	if ( !uVistaElevatorMsg )
		uVistaElevatorMsg = ::RegisterWindowMessage( L"VistaElevatorMsg" );

	//////////////////////////////////////
	// Find the shell window (the desktop)

	HWND hwndShell = ::FindWindow( L"Progman", NULL);

	if ( !hwndShell )
	{
		ASSERT_HERE;
		return FALSE;
	}

	/////////////////////////////////////////
	// Install a global hook, to inject our code into the shell proces

	HMODULE hModule = NULL;	// we need to know hModule of the DLL to install a global hook

	if ( !::GetModuleHandleEx( 
				GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS | GET_MODULE_HANDLE_EX_FLAG_UNCHANGED_REFCOUNT,
				(LPCTSTR)VistaEelevator_HookProc_MsgRet,
				&hModule ) )
	{
		ASSERT_HERE;
		return FALSE;
	}

	ASSERT( hModule );

    hHook = ::SetWindowsHookEx( WH_CALLWNDPROCRET,	// hook called after SendMessage() !!!
				    (HOOKPROC)VistaEelevator_HookProc_MsgRet, hModule, 0);

	if ( !hHook )
	{
		ASSERT_HERE;
		return FALSE;
	}

	//////////////////////////////////
	// Prepare the parameters for launching the non-elevated process
	// from the hook callback procedure (they are placed into the shared data section)

    if ( FAILED( StringCchCopy( 
					szVE_Path,
					_tsizeof(szVE_Path),
					pszPath ) ) )
	{
		ASSERT_HERE;
		return FALSE;
	}

    if ( FAILED( StringCchCopy( 
					szVE_Parameters, 
					_tsizeof(szVE_Parameters),
					pszParameters ? pszParameters : L"" ) ) )
	{
		ASSERT_HERE;
		return FALSE;
	}

    if ( FAILED( StringCchCopy( 
					szVE_Directory,	
					_tsizeof(szVE_Directory),	
					pszDirectory ? pszDirectory : L"" ) ) )
	{
		ASSERT_HERE;
		return FALSE;
	}

	/////////////////////////////////////////
	// Activate our hook callback procedure: 

	bSuccess = FALSE; // assume failure

	::SendMessage( hwndShell, uVistaElevatorMsg, 0, 0 );

	////////////////////////////////////////////////////////
	// At this point our hook procedure has been executed!

	/////////////////////////////////////
	// The hook is no longer needed, remove it:

	::UnhookWindowsHookEx( hHook );
	hHook = NULL;

	//////////////////////
	// All done!

	return bSuccess;
}
#endif //DONTWANT_RunNonElevated


#endif// IMPLEMENT_VISTA_TOOLS