/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeeICE KeePass-plugin)
  Copyright 2008 Chris Tomlinson <keefox@christomlinson.name>

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

#if _MSC_VER
#pragma warning( push, 1 )
#pragma warning( disable : 4512 )
#pragma warning( disable : 4100 )
#pragma warning( disable : 4702 )
#endif

#include "nsIGenericFactory.h"
#include "comp-impl.h"
#include "nsICategoryManager.h"
#include "nsComponentManagerUtils.h"
#include "nsServiceManagerUtils.h"

#if _MSC_VER
#pragma warning( pop ) 
#endif

NS_GENERIC_FACTORY_CONSTRUCTOR(CKeeFox)

static nsModuleComponentInfo components[] =
{
    {
       KEEFOX_CLASSNAME, 
       KEEFOX_CID,
       KEEFOX_CONTRACTID,
       CKeeFoxConstructor
    }
};

NS_IMPL_NSGETMODULE("KeeFoxModule", components) 