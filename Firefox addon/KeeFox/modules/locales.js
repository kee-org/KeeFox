// The KeeFox locale module is loosly based on the Firebug locale code, used under a BSD-style license.
// In fact there are really just a few similarities in style since most of the extra features I wanted
// to implement required greater changes to the basic firebug code than I first thought
// Modifications to the original Firebug code are copyright Chris Tomlinson.
// The resulting combined code is released under the same GPL license as the rest of KeeFox:
/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2012 Chris Tomlinson <keefox@christomlinson.name>
  
  A locale handler to attempt to work around limiations of Firefox localisations. Most
  noteably this will support dynamically loaded translations from outside of the
  standard locale structure that gets bundled with the current addon version and will
  support falling back to the default en-US locale if a string is missing.

  Use registerStringBundleJSON and registerStringBundleChromeURI as many times as needed
  to register all disperate sources of translation data. Note the following priority order:

  JSON bundles of active locale
  JSON bundles of default locale
  chrome bundles of active locale
  chrome bundles of default locale
  
  Priority within each group of bundles is based on registration order (FIFO)

  Limitations:
  Locales are initialised straight away. Most of the time that will make sense but
  I guess it's possible for this to be an unnecessarilly eager load in some circumstances
  No support for changing the locale without add-on (Firefox) restart

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
"use non-strict";

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

var EXPORTED_SYMBOLS = ["KFandFAMSLocalisation"];

//TODO1.3: we need to work out how to log problems with this module? Can't use KeeFox logger because
// it doesn't exist yet and might never if we're using the module outside of KeeFox

// This module is named conservatively to protect other addon
// namespaces but maybe should be made more generic in future.

function KFandFAMSLocalisation(chromeURIs, jsonLocales)
{
    if (chromeURIs != undefined && chromeURIs != null)
    {
        for (let i=0; i<chromeURIs.length; i++)
        {
            this._log("registering: " + chromeURIs[i]);
            this.registerStringBundleChromeURI(chromeURIs[i]);
        }
    }
    if (jsonLocales != undefined && jsonLocales != null)
    {
        for (let i=0; i<jsonLocales.length; i++)
        {
            this._log("registering: " + jsonLocales[i]);
            this.registerStringBundleJSON(jsonLocales[i]);
        }
    }
};

KFandFAMSLocalisation.prototype = {
_log: function (message) {
    //    var _logService = Components.classes["@mozilla.org/consoleservice;1"].
    //    getService(Ci.nsIConsoleService); _logService.logStringMessage("Locale: " + message);
    //}, // stub logger logs everything to console
    }, // stub logger logs nothing

stringBundleService: Services.strings,
stringBundles: [],
jsonBundles: [],
defaultStringBundles: [],
defaultJsonBundles: [],
registerStringBundleChromeURI: function(uri)
{
    var newBundle = this.stringBundleService.createBundle(uri);
    if (newBundle) this.stringBundles.push(newBundle);
    this.defaultStringBundles.push(this.stringBundleService.createBundle(this.getDefaultStringBundleURI(uri)));
},
registerStringBundleJSON: function(json)
{
    var newBundle = this.getJSONForCurrentLocale(json);
    if (newBundle) this.jsonBundles.push(newBundle);
    this.defaultJsonBundles.push(this.getJSONForDefaultLocale(json));
},

getJSONForCurrentLocale: function(json)
{
    // determine current locale
    var appLocale = this.getCurrentLocale();

    // JSON is optional. If it's not supplied we assume that there is a suitable JSON file in the standard add-on location
    if (json == null)
    {
        //TODO: get JSON from the right place
        json = null;
    }

    var singleLocale = null;

    // The JSON may contain multiple localisations
    if (json["schemaVersion"] === 1)
    {
        json = json["locales"];
     
        // Holds the best matching localized resource
        var bestmatch = null;
        // The number of locale parts it matched with
        var bestmatchcount = 0;
        // The number of locale parts in the match
        var bestpartcount = 0;
 
        var lparts = appLocale.split("-");
        for (var locale in json)
        {
            let found = locale.toLowerCase();

            // Exact match is returned immediately
            if (appLocale == found)
            {
                singleLocale = json[locale];
                break;
            }
 
            var fparts = found.split("-");

            // If we have found a possible match and this one isn't any longer
            // then we dont need to check further.
            if (bestmatch && fparts.length < bestmatchcount)
                continue;
 
            // Count the number of parts that match
            var maxmatchcount = Math.min(fparts.length, lparts.length);
            var matchcount = 0;
            while (matchcount < maxmatchcount &&
                    fparts[matchcount] == lparts[matchcount])
                matchcount++;
 
            // If we matched more than the last best match or matched the same and
            // this locale is less specific than the last best match.
            if (matchcount > bestmatchcount ||
                (matchcount == bestmatchcount && fparts.length < bestpartcount))
            {
                bestmatch = locale;
                bestmatchcount = matchcount;
                bestpartcount = fparts.length;
            }
         }
         if (singleLocale === null)
            singleLocale = json[bestmatch];
    } else
    {
        // else we assume the JSON is for the current locale only
        singleLocale = json;
    }

    // We now have a single object that represents the current locale

    // We check each name and convert from Google Chrome JSON format if required
    for (var name in singleLocale)
        if (typeof singleLocale[name] != 'string' && !(singleLocale[name] instanceof String))
            singleLocale[name] = singleLocale[name]["message"]; //TODO: Hook in some conversion of Chrome parameters

    return singleLocale;    
},

getJSONForDefaultLocale: function(json)
{
    return json["en"];
},

/*
 * $STR - intended for localization of a static string.
 * $STRF - intended for localization of a string with dynamically inserted values.
 */
$STR: function(name, bundle)
{
    try
    {
        if (bundle)
            return bundle.getString(name);
        else
            return this.GetStringFromName(name);
    }
    catch (err)
    {
        //info("getting string failed: '" + name + "'", err);
    }

    // return the key if it all went wrong
    name = name.replace("_", " ", "g");
    return name;
},

$STRF: function(name, args, bundle)
{
    try
    {
        if (bundle)
            return bundle.getFormattedString(name, args);
        else
            return this.FormatStringFromName(name, args, args.length);
    }
    catch (err)
    {
        //info("getting string failed: '" + name + "'", err);
    }
    
    // return the key if it all went wrong
    return name;
},

GetStringFromName: function(name)
{
    for (let i=0; i<this.jsonBundles.length; i++)
    {
        if (this.jsonBundles[i][name] != null)
            return this.jsonBundles[i][name];
    }
    for (let i=0; i<this.defaultJsonBundles.length; i++)
    {
        if (this.defaultJsonBundles[i][name] != null)
            return this.defaultJsonBundles[i][name];
    }
    for (let i=0; i<this.stringBundles.length; i++)
    {
        try
        {
            let translation = this.stringBundles[i].GetStringFromName(name);
            return translation;
        }
        catch (ex) { }
    }
    for (let i=0; i<this.defaultStringBundles.length; i++)
    {
        try
        {
            let translation = this.defaultStringBundles[i].GetStringFromName(name);
            return translation;
        }
        catch (ex) { }
    }

    // No match found
    return name;
},

printf: function(text, args) {
    var arg;
    return msg.replace(/(%s)/g, function(a,val) {
        arg = args.shift();
        if (arg !== undefined) {
            return String(arg);
        }
        return val;
    });
},

FormatStringFromName: function(name, args)
{
    for (let i=0; i<this.jsonBundles.length; i++)
    {
        if (this.jsonBundles[i][name] != null)
            return this.printf(this.jsonBundles[i][name], args);
    }
    for (let i=0; i<this.defaultJsonBundles.length; i++)
    {
        if (this.defaultJsonBundles[i][name] != null)
            return this.printf(this.defaultJsonBundles[i][name], args);
    }
    for (let i=0; i<this.stringBundles.length; i++)
    {
        try
        {
            let translation = this.stringBundles[i].formatStringFromName(name, args, args.length);
            return translation;
        }
        catch (ex) { }
    }
    for (let i=0; i<this.defaultStringBundles.length; i++)
    {
        try
        {
            let translation = this.defaultStringBundles[i].formatStringFromName(name, args, args.length);
            return translation;
        }
        catch (ex) { }
    }

    // No match found
    return name;
},

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
        //error("Failed to internationalise element with attr "+attr+" args:"+args);
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

internationaliseString: function(orig, args)
{
    // replace callback
    var that = this;

    if (orig === undefined || orig === null)
        return orig;

    function substituteText  (str, p1, offset, s)
    {
        return that.args ? that.$STRF(p1, that.args) : that.$STR(p1);
    }

    return orig.replace(/%-(.+?)-%/g,substituteText);
},

getDefaultStringBundleURI: function(bundleURI)
{
    var chromeRegistry = Cc["@mozilla.org/chrome/chrome-registry;1"].
        getService(Ci.nsIChromeRegistry);

    var uri = Services.io.newURI(bundleURI, "UTF-8", null);
    var fileURI = chromeRegistry.convertChromeURL(uri).spec;
    var parts = fileURI.split("/");
    parts[parts.length - 2] = "en-US";

    return parts.join("/");
},

getCurrentLocale: function()
{
    var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
    var prefBranchRoot = prefService.getBranch("");
    return prefBranchRoot.getComplexValue("general.useragent.locale", Ci.nsISupportsString).data.toLowerCase();
}

};
