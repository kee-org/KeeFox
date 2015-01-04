/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  Attach this to keefox_tab or keefox_win to get access to these commonly used helper functions.
  
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

// IO service for string -> nsIURI conversion
var _ioService = Components.classes["@mozilla.org/network/io-service;1"].
                     getService(Components.interfaces.nsIIOService);

/*
 * getURIExcludingQS
 *
 * Get a string that includes all but a URI's query string
 */
var getURIExcludingQS = function (uriString) {
    var realm = "";
    try {
        var uri = this._ioService.newURI(uriString, null, null);

        if (uri.scheme == "file")
            realm = uri.scheme + "://";
        else {
            realm = uri.scheme + "://" + uri.host;

            // If the URI explicitly specified a port, only include it when
            // it's not the default. (We never want "http://foo.com:80")
            var port = uri.port;
            if (port != -1) {
                var handler = this._ioService.getProtocolHandler(uri.scheme);
                if (port != handler.defaultPort)
                    realm += ":" + port;
            }
        }

        var QSbreak = uri.path.indexOf('?');
        realm += uri.path.substring(1, QSbreak > 1 ? QSbreak : uri.path.length);
    } catch (e) {
        Logger.warn("Couldn't parse origin", " for " + uriString);
        realm = null;
    }
    return realm;
};

/*
 * getURIHostAndPort
 *
 * Get a string that includes only a URI's host and port.
 * EXCEPTION: For file protocol this returns the file path
 */
var getURIHostAndPort = function (uriString) {
    var uri;
    var realm = "";
    try {
        // if no protocol scheme included, we can still try to return the host and port
        if (uriString.indexOf("://") < 0)
            uri = this._ioService.newURI("http://" + uriString, null, null);
        else
            uri = this._ioService.newURI(uriString, null, null);

        if (uri.scheme == "file")
            realm = uri.path;
        else {
            realm = uri.host;

            // If the URI explicitly specified a port, only include it when
            // it's not the default. (We never want "http://foo.com:80")
            var port = uri.port;
            if (port != -1) {
                var handler = this._ioService.getProtocolHandler(uri.scheme);
                if (port != handler.defaultPort)
                    realm += ":" + port;
            }
        }
    } catch (e) {
        Logger.warn("Couldn't parse origin", " for " + uriString);
        realm = null;
    }
    return realm;
};

/*
 * getURISchemeHostAndPort
 *
 * Get a string that includes only a URI's scheme, host and port
 * EXCEPTION: For file protocol this returns the file scheme and path
 */
var getURISchemeHostAndPort = function (uriString) {
    var realm = "";
    try {
        var uri = this._ioService.newURI(uriString, null, null);

        if (uri.scheme == "file")
            realm = uri.scheme + "://" + uri.path;
        else {
            realm = uri.scheme + "://" + uri.host;

            // If the URI explicitly specified a port, only include it when
            // it's not the default. (We never want "http://foo.com:80")
            var port = uri.port;
            if (port != -1) {
                var handler = this._ioService.getProtocolHandler(uri.scheme);
                if (port != handler.defaultPort)
                    realm += ":" + port;
            }
        }

    } catch (e) {
        Logger.warn("Couldn't parse origin", " for " + uriString);
        realm = null;
    }
    Logger.debug("", "getURISchemeHostAndPort:" + realm);
    return realm;
};

/*
 * getURIScheme
 *
 * Get a string that includes only a URI's scheme
 */
var getURIScheme = function (uriString) {
    try {
        var uri = this._ioService.newURI(uriString, null, null);
        return uri.scheme;
    } catch (e) {
        Logger.warn("Couldn't parse scheme", " for " + uriString);
        return "unknown";
    }
};
