// CheckForAdminRights.cpp : Defines the entry point for the console application.
//
#include "windows.h"
#include "shellapi.h"
#include "shlobj.h"

#include "stdafx.h"
#define IMPLEMENT_VISTA_TOOLS
#include "VistaTools.cxx"

int _tmain(int argc, _TCHAR* argv[])
{
	if (IsVista())
	{
		TOKEN_ELEVATION_TYPE ptet;
		HRESULT res = GetElevationType(&ptet);
		if (res == S_OK && ptet != TokenElevationTypeDefault) 
		{
			// user has a split token so must be administrator
			return 1;
		}
	}

	if (::IsUserAnAdmin())
			return 1;
		else
			return 0;

	return 0;
}