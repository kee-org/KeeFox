/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
Copyright 2008-2009 Chris Tomlinson <keefox@christomlinson.name>
  
The KeeICECopier.exe creates the KeePass plugins folder (if required) and then
copies KeeICE into the plugins folder.

It should be run as an administrator (and with UAC elevated for Vista / Windows 7)

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

#include <windows.h>
#include <shellapi.h>
#include <tchar.h>
#include <strsafe.h>

#define BUFFERSIZE 4096
#define INDIVIDUALBUFFERSIZE 1024

bool fileExists(const TCHAR *fileName)
{
	DWORD fileAttributes;

	fileAttributes = GetFileAttributesW(fileName);
	if (fileAttributes == 0xFFFFFFFF)
		return false;
	return true;
}

int main ()
{
	int argc;
	TCHAR charBuf[BUFFERSIZE];
    LPTSTR KeeICESource;
	LPTSTR KeeICEDest;
	/*LPTSTR IceSource;
	LPTSTR IceDest;*/

	// extract the command line parameters and check there is the right quantity
	LPTSTR *argv = ::CommandLineToArgvW(GetCommandLineW(),&argc);
	if (argc != 3)
	{
		LocalFree(argv);
		return 1;
	}

	// define 1KB buffers for each file path (should be more than enough for any path length for forseeable future and is already longer than current MAX_PATH windows constant)
    KeeICESource = (LPTSTR) charBuf;
	KeeICEDest = (LPTSTR) charBuf+(INDIVIDUALBUFFERSIZE);
	/*IceSource = (LPTSTR) charBuf+(2*INDIVIDUALBUFFERSIZE);
	IceDest = (LPTSTR) charBuf+(3*INDIVIDUALBUFFERSIZE);*/

	// populate the string buffers with the directory path to each file we're interested in
    if (FAILED(StringCchCopy(
		KeeICESource,
		INDIVIDUALBUFFERSIZE-(sizeof(TCHAR)*lstrlen(L"\\KeeICE.plgx")),
		argv[1])))
    {
        LocalFree(argv);
        return 1;
    }

	/*if (FAILED(StringCchCopy(
		IceDest,
		INDIVIDUALBUFFERSIZE-(sizeof(TCHAR)*lstrlen(L"\\Ice.dll")),
		argv[2])))
    {
		LocalFree(argv);
        return 1;
    }*/

	if (FAILED(StringCchCopy(
		KeeICEDest,
		INDIVIDUALBUFFERSIZE-(sizeof(TCHAR)*lstrlen(L"\\KeeICE.plgx")),
		argv[2])))
    {
        LocalFree(argv);
        return 1;
    }

	/*if (FAILED(StringCchCopy(
		IceSource,
		INDIVIDUALBUFFERSIZE-(sizeof(TCHAR)*lstrlen(L"\\Ice.dll")),
		argv[1])))
    {
        LocalFree(argv);
        return 1;
    }*/

	// create the plugins directory if required
	if (!fileExists(argv[2]))
		CreateDirectoryW(argv[2],NULL);
		
	LocalFree(argv);

	// append the name of each file so we end up with full paths to the files we need
	if (FAILED(StringCchCat(KeeICESource,INDIVIDUALBUFFERSIZE,L"\\KeeICE.plgx")))
		return 1;
	if (FAILED(StringCchCat(KeeICEDest,INDIVIDUALBUFFERSIZE,L"\\KeeICE.plgx")))
		return 1;
	/*if (FAILED(StringCchCat(IceSource,INDIVIDUALBUFFERSIZE,L"\\Ice.dll")))
		return 1;
	if (FAILED(StringCchCat(IceDest,INDIVIDUALBUFFERSIZE,L"\\Ice.dll")))
		return 1;*/

	// copy the two files to their new home
	if (::CopyFileW (KeeICESource, KeeICEDest, false))
		//if (::CopyFileW (IceSource, IceDest, false))
			return 0; // everything worked

    return 1; // files couldn't be copied (most likely = permission denied but we can't be certain about that)
}


int APIENTRY windowsMainEntry(HINSTANCE, HINSTANCE, LPSTR, int)
{
    int ret;
    ret = main();
    return ret;
}
