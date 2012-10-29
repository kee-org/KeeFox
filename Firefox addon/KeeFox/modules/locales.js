// The KeeFox locale module is based on the Firebug locale code, used under the following BSD-style license:
/*
Software License Agreement (BSD License)

Copyright (c) 2009, Mozilla Foundation
All rights reserved.

Redistribution and use of this software in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above
  copyright notice, this list of conditions and the
  following disclaimer.

* Redistributions in binary form must reproduce the above
  copyright notice, this list of conditions and the
  following disclaimer in the documentation and/or other
  materials provided with the distribution.

* Neither the name of Mozilla Foundation nor the names of its
  contributors may be used to endorse or promote products
  derived from this software without specific prior
  written permission of Mozilla Foundation.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
// Modifications to the original Firebug code are copyright Chris Tomlinson.
// The resulting combined code is released under the same GPL license as the rest of KeeFox:
/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2012 Chris Tomlinson <keefox@christomlinson.name>
  
  A locale handler to attempt to work around limiations of Firefox localisations. Most
  noteably this will support dynamically loaded translations from outside of the
  standard locale structure that gets bundled with the current addon version and will
  support falling back to the default en-US locale if a string is missing.

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
"use strict";

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

const DEFAULT_LOCALE = "en-US";

Cu.import("resource://gre/modules/Services.jsm");

var EXPORTED_SYMBOLS = ["KFandFAMSLocalisation"];

// Import of PluralForm object.
//Cu.import("resource://gre/modules/PluralForm.jsm");

//TODO: we need to work out how to log problems with this module. Can't use KeeFox logger because
// it doesn't exist yet (and even then it would need to be passed in to this module so this
// module has no dependency on KF

//var consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);

//// Just workaround for this module.
//var FBTrace = {sysout: function(msg)
//{
//    consoleService.logStringMessage(msg);
//}};

// This module is named conservatively to protect other addon
// namespaces but maybe should be made more generic in future.

//TODO: constructor or init needs to take addon URIs so we can have dynamically loaded data for FAMS
function KFandFAMSLocalisation()
{
    this.stringBundleURI = "chrome://keefox/locale/keefox.properties";
};

KFandFAMSLocalisation.prototype = {
stringBundleService: Services.strings,

/*
 * $STR - intended for localization of a static string.
 * $STRF - intended for localization of a string with dynamically inserted values.
 * $STRP - intended for localization of a string with dynamically plural forms.
 *
 * Notes:
 * 1) Name with _ in place of spaces is the key in the firebug.properties file.
 * 2) If the specified key isn't localized for particular language, both methods use
 *    the part after the last dot (in the specified name) as the return value.
 *
 * Examples:
 * $STR("Label"); - search for key "Label" within the firebug.properties file
 *                 and returns its value. If the key doesn't exist returns "Label".
 *
 * $STR("Button Label"); - search for key "Button_Label" withing the firebug.properties
 *                        file. If the key doesn't exist returns "Button Label".
 *
 * $STR("net.Response Header"); - search for key "net.Response_Header". If the key doesn't
 *                               exist returns "Response Header".
 *
 * firebug.properties:
 * net.timing.Request_Time=Request Time: %S [%S]
 *
 * var param1 = 10;
 * var param2 = "ms";
 * $STRF("net.timing.Request Time", param1, param2);  -> "Request Time: 10 [ms]"
 *
 * - search for key "net.timing.Request_Time" within the firebug.properties file. Parameters
 *   are inserted at specified places (%S) in the same order as they are passed. If the
 *   key doesn't exist the method returns "Request Time".
 */
$STR: function(name, bundle)
{
    var strKey = name.replace(" ", "_", "g");

    //TODO: Nice idea but creates a cyclic dependency and not important enough to justify refactoring at the moment
    //if (!keefox_org.prefs.getValue("useEnglishLocale", false))
    //{
        try
        {
            if (bundle)
                return bundle.getString(strKey);
            else
                return this.getStringBundle().GetStringFromName(strKey);
        }
        catch (err)
        {
            //keefox_org._KFLog.info("getting string failed: '" + name + "'", err);
        }
    //}

    try
    {
        // The en-US string should be always available.
        var defaultBundle = this.getDefaultStringBundle();
        if (defaultBundle)
            return defaultBundle.GetStringFromName(strKey);
    }
    catch (err)
    {
        //keefox_org._KFLog.error("getting en-US default string failed: '" + name + "'", err);
    }

    //TODO: This doesn't work well for KeeFox
    // Don't panic now and use only the label after last dot.
    var index = name.lastIndexOf(".");
    if (index > 0 && name.charAt(index-1) != "\\")
        name = name.substr(index + 1);
    name = name.replace("_", " ", "g");
    return name;
},

$STRF: function(name, args, bundle)
{
    var strKey = name.replace(" ", "_", "g");

    //TODO: Nice idea but creates a cyclic dependency and not important enough to justify refactoring at the moment
    //if (!keefox_org.prefs.getValue("useEnglishLocale", false))
    //{
        try
        {
            if (bundle)
                return bundle.getFormattedString(strKey, args);
            else
                return this.getStringBundle().formatStringFromName(strKey, args, args.length);
        }
        catch (err)
        {
            //keefox_org._KFLog.info("getting string failed: '" + name + "'", err);
        }
    //}

    try
    {
        // The en-US string should be always available.
        var defaultBundle = this.getDefaultStringBundle();
        if (defaultBundle)
            return defaultBundle.formatStringFromName(strKey, args, args.length);
    }
    catch (err)
    {
        //keefox_org._KFLog.error("getting en-US default string failed: '" + name + "'", err);
    }

    // Don't panic now and use only the label after last dot.
    var index = name.lastIndexOf(".");
    if (index > 0)
        name = name.substr(index + 1);

    return name;
},

/*
Not concerned with plurals at the moment...
KFandFAMSLocalisation.$STRP = function(name, args, index, bundle)
{
    // xxxHonza:
    // pluralRule from chrome://global/locale/intl.properties for Chinese is 1,
    // which is wrong, it should be 0.

    var getPluralForm = PluralForm.get;
    var getNumForms = PluralForm.numForms;

    // Get custom plural rule; otherwise the rule from chrome://global/locale/intl.properties
    // (depends on the current locale) is used.
    var pluralRule = Locale.getPluralRule();
    if (!isNaN(parseInt(pluralRule, 10)))
        [getPluralForm, getNumForms] = PluralForm.makeGetter(pluralRule);

    // Index of the argument with plural form (there must be only one arg that needs plural form).
    if (!index)
        index = 0;

    // Get proper plural form from the string (depends on the current Firefox locale).
    var translatedString = Locale.$STRF(name, args, bundle);
    if (translatedString.search(";") > 0)
        return getPluralForm(args[index], translatedString);

    // translatedString contains no ";", either rule 0 or getString fails
    return translatedString;
}
*/

/*
 * Use the current value of the attribute as a key to look up the localized value.
 */
internationalise: function(element, attr, args)
{
    var xulString;
    // replace callback
    var that = this;
    function substituteText  (str, p1, offset, s)
    {
        return that.args ? that.$STRF(p1, that.args) : that.$STR(p1);
    }

    if (element)
    {
        xulString = undefined;
        if (attr)
            xulString = element.getAttribute(attr);
        else
            xulString = element.nodeValue;

        if (xulString)
        {
            var localised = xulString.replace(/%-(.+?)-%/g,substituteText);
            // Set localized value of the attribute only if it exists.
            if (localised)
            {
                if (attr)
                {
                    element.setAttribute(attr, localised);
                } else
                {
                    element.nodeValue = localised;
                }
            }

        }
    }
    else
    {
        //keefox_org._KFLog.error("Failed to internationalise element with attr "+attr+" args:"+args);
    }
},

// We will call this when each XUL document loads so that we can avoid using DTDs
// and ease any future transistion to a purely script based add-on
internationaliseElements: function(doc, elements, attributes)
{
    for (var i=0; i<elements.length; i++)
    {
        var element = elements[i];

        if (typeof(element) == "string")
            element = doc.getElementById(elements[i]);

        if (!element)
            continue;

        // Remove fbInternational class, so that the label is not translated again later.
        //CPT: Not sure why I'd want to do this
        //element.classList.remove("fbInternational");

        // Replace within text content too. Assumes there are no other subnodes. May need to be more clever here.
        if (element.childNodes != null && element.childNodes.length > 0)
            this.internationalise(element.childNodes[0]);

        for (var j=0; j<attributes.length; j++)
        {
            if (element.hasAttribute(attributes[j]))
                this.internationalise(element, attributes[j]);
        }
    }
},

getStringBundle: function()
{
    if (!this.stringBundle)
        this.stringBundle = this.stringBundleService.createBundle(this.stringBundleURI);
    return this.stringBundle;
},

getDefaultStringBundle: function()
{
    if (!this.defaultStringBundle)
    {
        var bundleURI = this.getDefaultStringBundleURI(this.stringBundleURI);
        this.defaultStringBundle = this.stringBundleService.createBundle(bundleURI);
    }
    return this.defaultStringBundle;
},

/*
KFandFAMSLocalisation.getPluralRule = function()
{
    try
    {
        return this.getStringBundle().GetStringFromName("pluralRule");
    }
    catch (err)
    {
    }
}
*/

getDefaultStringBundleURI: function(bundleURI)
{
    var chromeRegistry = Cc["@mozilla.org/chrome/chrome-registry;1"].
        getService(Ci.nsIChromeRegistry);

    var uri = Services.io.newURI(bundleURI, "UTF-8", null);
    var fileURI = chromeRegistry.convertChromeURL(uri).spec;
    var parts = fileURI.split("/");
    parts[parts.length - 2] = "en-US";

    return parts.join("/");
}
};

//TODO: should call this from somewhere else
//FAMS.locale = new KFandFAMSLocalisation();






