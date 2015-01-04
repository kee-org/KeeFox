/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This is the main KeeFox javascript file for each content tab.
  It is injected by the window-scope ../keefoxWindow.js

  This script runs once for each tab regardless of how many frames or
  iframes are included in the page.
  
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

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cu = Components.utils;

var keefox_tab = {};
keefox_tab.tabState = {};

keefox_tab.scriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                       .getService(Components.interfaces.mozIJSSubScriptLoader);

// While it is possible to include JSMs here, they will be run with framescript
// priveledges and will be an instance independent from that which runs in the
// main Chrome code so their usefulness is generally limited to reusing simple
// algorithms and data structures.

/* There is a bug/feature with e10s which makes it impossible to access the protected/sandboxed
part of the global scope of this script from within a subscript so we work around
this by passing in our main keefox_tab object for direct manipulation within the
subscript. */

// Load our logging, config and metrics subsystem proxies
keefox_tab.scriptLoader.loadSubScript("chrome://keefox/content/framescript/proxies/logger.js", keefox_tab);
keefox_tab.scriptLoader.loadSubScript("chrome://keefox/content/framescript/proxies/config.js", keefox_tab);
keefox_tab.scriptLoader.loadSubScript("chrome://keefox/content/framescript/proxies/metrics.js", keefox_tab);

// Load our other javascript
keefox_tab.scriptLoader.loadSubScript("chrome://keefox/content/shared/uriUtils.js", keefox_tab);
Cu.import("resource://gre/modules/Timer.jsm");
Cu.import("resource://kfmod/kfDataModel.js");
Cu.import("resource://kfmod/KFExtension.js");
keefox_tab.scriptLoader.loadSubScript("chrome://keefox/content/framescript/formsTab.js", keefox_tab);
keefox_tab.scriptLoader.loadSubScript("chrome://keefox/content/framescript/formsFillTab.js", keefox_tab);
keefox_tab.scriptLoader.loadSubScript("chrome://keefox/content/framescript/formsSaveTab.js", keefox_tab);

// Timer that allows us to delay the start of a search for logins under certain circumstances
keefox_tab.tabState.searchStartTimeout = null;

// Time delay in ms for above timer. We don't wait for too long because the only
// downside of firing too early is that we'll present the user with an unnecessary
// popup notification about any successful find logins results.
keefox_tab.tabState.searchStartTimeoutDelay = 500;

// This fires for every page, frame and iframe loaded within this tab
keefox_tab.onDOMContentLoaded = function (event) {
    keefox_tab.Logger.debug("onDOMContentLoaded fired.");

    // WARNING: e10s HACK
    // This code could be executed before locationChangedHandler has been executed
    // because that function is called via the messageManager queue from the main
    // Chrome process while onDOMContentLoaded is fired from the local process.
    // This hack of sending messages back and forth is the only practical way to
    // resolve this until Firefox fixes the bugs preventing the Chrome process
    // listening for the onDOMContentLoaded event. (including the one that
    // deletes all browser event handlers at random with no warning).
    // We send it sync to minimise impact of processing delays of this horrible hack.
    sendSyncMessage("keefox:DOMContentLoadedHack");
};

keefox_tab.DOMContentLoadedHandler = function (message) {
    keefox_tab.Logger.debug("DOMContentLoadedHandler fired.");

    /* Every time this is called we will initiate a search for matching logins
    across every document in this tab. This sounds inefficient but avoids all
    complications relating to dynamically adding and removing sub-documents and
    will actually be faster overall due to the use of cached results in many cases
    (saving cross-process comms, network and CPU time). */

    /* Only trigger a search in all frames if one is not already underway. If one
    is underway, we'll do a fresh search as soon as the current one has ended.
    This means that an average page load with more than one document will result
    in an extra search but it will either be all from cached results or will
    allow us to detect previously undetectable dynamically added documents/frames
    so it's all good. */

    keefox_tab.tabState.loadCount++;

    if (keefox_tab.tabState.findMatchesUnderway) {
        // We ignore any load events we were already expecting from our initial
        // page load. This keeps standard multi-frame pages limited to a single
        // search for matches while allowing dynamically added frames to be filled 
        // once the initial page load search has completed.
        // Might be a buggy edge-case here for sites that are session restored
        // shortly before dynamically installing new frames to their DOM while
        // an existing search is underway but the session restore code might prevent that.

        keefox_tab.tabState.findMatchesASAP = true;
    }
    else {
        if (keefox_tab.tabState.frameResponseCount === undefined) {
            keefox_tab.Logger.debug("onDOMContentLoaded ignored a request (too soon - we're still waiting for the tab to init).");
            return;
        } else {
            keefox_tab.Logger.debug("onDOMContentLoaded accepted a request.");
        }

        // We have to block the content process in order to find out if we are
        // the foreground tab without interrupting the normal page load progress order
        let isForegroundTab = sendSyncMessage("keefox:isForegroundTab")[0];

        // Don't do anything if this is a background tab
        if (isForegroundTab) {
            // Find the top frame
            var topDoc = content.document;
            while (topDoc.defaultView.frameElement)
                topDoc = topDoc.defaultView.frameElement.ownerDocument;
            var topWin = topDoc.defaultView;

            // If we're waiting for a timeout before starting a search, we'll reset
            // that timer now (and either restart it later or just do the find logins
            // search now if all expected frames have now loaded)
            if (keefox_tab.tabState.searchStartTimeout !== null)
            {
                clearTimeout(keefox_tab.tabState.searchStartTimeout);
                keefox_tab.tabState.searchStartTimeout = null;
            }

            // Record how many frames we are expecting to get async results for so
            // we will know when we're ready to auto-fill/submit or update the UI
            // This gets updated for each frame that is loaded. This allows for
            // extra frames being added by page Javascript during page load
            keefox_tab.tabState.frameCount = keefox_tab.countAllDocuments(topWin);

            if (keefox_tab.tabState.initialSearchComplete
                || keefox_tab.tabState.loadCount >= keefox_tab.tabState.frameCount) {
                keefox_tab.findMatchesInAllFrames(
                    true, true, keefox_tab.tabState.initialSearchComplete);
            } else {
                // We've not recieved enough DOMContentLoaded events so we will
                // ignore this one and wait for a later one
                keefox_tab.Logger.debug("onDOMContentLoaded delayed a request.");

                // We don't want to wait forever though so we attempt a search within 2 seconds of the
                // last DOMReady event to be fired from any frame on the page, even if some frames
                // are yet to reach readyState interactive. If those frames subsequently load, are
                // searched and new forms are found, the user will be told that logins
                // were found via a notification popup.

                keefox_tab.tabState.searchStartTimeout = setTimeout(
                    keefox_tab.findMatchesInAllFrames,
                    keefox_tab.tabState.searchStartTimeoutDelay, true, true, false);
            }
        }
    }
};

keefox_tab.locationChanged = function (uri) {
    keefox_tab.Logger.debug(
        "Location changed. A tab is expecting a page load to occur very soon. "
        , " New location: " + uri);

    // We always pretend to expect a page load so that the form search algorithms know this
    // is part of an automatic process that appears to the user to be a new page load, even
    // if technically we're just navigating to an existing page.
    keefox_tab.tabState.pageLoadExpected = true;

    // This would normally be reset immediately after form submission but we also do it here in
    // case the site has custom form submission javascript which bypasses the normal form 
    // submission process (such a site would be incompatible with KeeFox's password saving feature 
    // but at least resetting it will avoid knock-on effects later in the liftetime of this tab)
    keefox_tab.tabState.KeeFoxTriggeredThePendingFormSubmission = false;

    // Reset all our other tracking data
    keefox_tab.tabState.latestFindMatchesResults = [];
    keefox_tab.tabState.frameResponseCount = 0;
    keefox_tab.tabState.frameCount = 0;
    keefox_tab.tabState.loadCount = 0;
    keefox_tab.tabState.initialSearchComplete = false;

    // shouldn't be necessary but just in case, this allows user to fix bugs by refreshing the page
    keefox_tab.tabState.findMatchesUnderway = false;
    keefox_tab.tabState.findMatchesASAP = false;
};

addMessageListener("keefox:findMatches", keefox_tab.FindMatchesRequestHandler);
addMessageListener("keefox:prepareForOneClickLogin", keefox_tab.PrepareForOneClickLoginHandler);
addMessageListener("keefox:findLoginsResult", keefox_tab.findLoginsResultHandler);
addMessageListener("keefox:fillAndSubmit", keefox_tab.fillAndSubmitHandler);
addMessageListener("keefox:DOMContentLoaded", keefox_tab.DOMContentLoadedHandler);
addMessageListener("keefox:findLoginsForSubmittedFormResult", keefox_tab.findLoginsForSubmittedFormResultHandler);
addMessageListener("keefox:cancelFormRecording", keefox_tab.cancelFormRecordingHandler);

addEventListener("DOMContentLoaded", keefox_tab.onDOMContentLoaded, false);

keefox_tab.progressListener = {
    onLocationChange: function (aWebProgress, aReq, aLoc, aFlags) {
        keefox_tab.Logger.debug("onLocationChange keefox_tab: " + aFlags);

        if (aLoc.spec.startsWith("about:") || aLoc.spec.startsWith("chrome:"))
            return;

        keefox_tab.locationChanged(aLoc.spec);

        if (aFlags == 1) {
            // we've stayed on the same page so need to trigger a logins search
            // now since there will be no future statechange raised by Firefox

            /* Only trigger a search in all frames if one is not already underway. If one
    is underway, we do nothing */
            if (keefox_tab.tabState.findMatchesUnderway)
                keefox_tab.Logger.info("onLocationChange found a search for matching entries is already underway. This probably should not happen.");
            else {
                if (keefox_tab.tabState.frameResponseCount === undefined) {
                    keefox_tab.Logger.debug("onLocationChange ignored a request (too soon - we're still waiting for the tab to init).");
                    return;
                } else {
                    keefox_tab.Logger.debug("onLocationChange accepted a request.");
                }

                // We have to block the content process in order to find out if we are
                // the foreground tab without interrupting the normal page load progress order
                let isForegroundTab = sendSyncMessage("keefox:isForegroundTab")[0];

                // Don't do anything if this is a background tab
                if (isForegroundTab) {
                    // We do not allow auto-submition from same page navigation - probably
                    // nothing can go wrong but it's a safety net just in case we get
                    // ourselves into an infinite loop in some particular SPA site designs
                    keefox_tab.findMatchesInAllFrames(true, false, false);
                }
            }
        }
    },
    onStateChange: function (aWebProgress, aReq, aFlags, aStatus) {
        keefox_tab.Logger.debug("onStateChange keefox_tab: " + aFlags);
        // Fastback doesn't fire DOMContentLoaded, so process forms now.
        if (aFlags & Ci.nsIWebProgressListener.STATE_RESTORING
            && aFlags & Ci.nsIWebProgressListener.STATE_IS_DOCUMENT
            && aFlags & Ci.nsIWebProgressListener.STATE_TRANSFERRING) {
            keefox_tab.Logger.debug("We are restoring a document so DOMContentLoaded will not fire");

            if (keefox_tab.tabState.findMatchesUnderway) {
                // This might/will be the situation when a page containing more than one frame is
                // restored.
                keefox_tab.Logger.debug("onStateChange found a search for matching entries is already underway.");
                keefox_tab.tabState.findMatchesASAP = true;
            } else {
                if (keefox_tab.tabState.frameResponseCount === undefined) {
                    keefox_tab.Logger.debug("onStateChange ignored a request (too soon - we're still waiting for the tab to init).");
                    return;
                } else {
                    keefox_tab.Logger.debug("onStateChange accepted a request.");
                }

                // We have to block the content process in order to find out if we are
                // the foreground tab without interrupting the normal page load progress order
                let isForegroundTab = sendSyncMessage("keefox:isForegroundTab")[0];

                // Don't do anything if this is a background tab
                if (isForegroundTab) {
                    // We do not allow auto-submition from state restoration - probably
                    // nothing can go wrong but it's a safety net just in case bugs
                    // or 3rd party addon conflicts cause crashes during submission
                    keefox_tab.findMatchesInAllFrames(true, false, false);
                }
            }
        }
    },

    // stubs for the nsIWebProgressListener interfaces which we don't use.
    onProgressChange: function () { throw "Unexpected onProgressChange"; },
    onStatusChange: function () { throw "Unexpected onStatusChange"; },
    onSecurityChange: function () { throw "Unexpected onSecurityChange"; },

    QueryInterface: XPCOMUtils.generateQI([Ci.nsIWebProgressListener,
                                            Ci.nsISupportsWeakReference])
};

try {
    let webProgress = docShell.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebProgress);
    webProgress.addProgressListener(keefox_tab.progressListener,
      Ci.nsIWebProgress.NOTIFY_STATE_DOCUMENT | Ci.nsIWebProgress.NOTIFY_LOCATION);
} catch (e) {
    keefox_tab.Logger.error("couldn't add nsIWebProgress listener: " + e);
}

keefox_tab.formSubmitObserver.register();

// set up some initial state
keefox_tab.tabState.currentPage = 0;
keefox_tab.tabState.maximumPage = 0;
keefox_tab.tabState.userRecentlyDemandedAutoSubmit = false;

keefox_tab.Logger.debug("KeeFox loaded into a frame/tab/browser");