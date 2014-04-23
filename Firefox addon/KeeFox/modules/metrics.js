/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2014 Chris Tomlinson <keefox@christomlinson.name>
  
  The metrics module collects anonymous statistics about key metrics and
  behaviours so we can improve KeeFox.

  https://addons.mozilla.org/en-US/firefox/addon/keefox/privacy/

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

var EXPORTED_SYMBOLS = ["metricsManager"];
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/ISO8601DateUtils.jsm");
Cu.import("resource://kfmod/KFLogger.js");
Cu.import("resource://gre/modules/AddonManager.jsm");

// A struct to represent information that won't change for a given session.
// In most cases, we'll only want to send this data once but there are a few exceptions.
function ImmutableInformation()
{
    this.userId;
    this.sessionId;
    this.OSType;
    this.OSVersion;
    this.browserType;
    this.browserVersion;
    this.addonVersion;
    this.locale;
    this.sessionStart;
    this.screenWidth;
    this.screenHeight;
    this.keePassVersion;
    this.netRuntimeVersion;
}

function mm () {

    // where we'll POST the data to
    this.url = "https://anonymousstats.keefox.org/in";

    // Usual logging object
    this._KFLog = KFLog;

    // Timer to process queued messages at regular intervals
    this.metricsTimer = null;
    
    // Track metrics data submitted before the module has finished initialising
    this.messagesQueue = [];
    this.aggregatesQueue = [];
    this.messagesReady = false;
    this.aggregatesReady = false;

    this.init = function (locale, userId, sessionId)
    {
        this.ii = new ImmutableInformation();

        this.ii.locale = locale;
        this.ii.userId = userId;
        this.ii.sessionId = sessionId;
        this.ii.sessionStart = ISO8601DateUtils.create(new Date());

        this.ii.browserType = Services.appinfo.name;
        this.ii.browserVersion = Services.appinfo.version;

        // OS type
        this.ii.OSType = Services.appinfo.OS;

        // OS version string
        try {
            this.ii.OSversion = Components.classes["@mozilla.org/network/protocol;1?name=http"]
                .getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;
        } catch (ex)
        {
            this.ii.OSversion = "Unknown";
        }

        // We need a closure on this metrics module so we can manipulate it in
        // the many callbacks required to keep things nice and asynchronous
        var mm = this;

        // We can't start sending metrics data until Firefox has told us what
        // we need to know (so far that's just the addon version)
        // Other code may log events before we get to this callback so 
        // startSession will always make sure it is pushed to the front of the
        // queue before converting transient storage to persistent storage.
        // This might mean that the session start time is later than the first
        // events recorded in the session but if that becomes a problem it can
        // be resolved retrospectively during analysis becuase the session ID
        // is included with every message
        AddonManager.getAddonByID("keefox@chris.tomlinson", function(addon) {
            mm._KFLog.debug("KeeFox version: " + addon.version);
        
            mm.ii.addonVersion = addon.version;

            // Make sure indexedDB is available somewhere consistent regardless
            // of old Firefox differences.
            //
            // We can't assume that indexedDB and IDBKeyRange are accessed in the same 
            // way because there are definitely some non-release builds of Firefox
            // where they differ but it does appear that they are consistently available
            // if initWindowless() works.
            if (typeof indexedDB !== "undefined")
            {
                mm.indexedDB = indexedDB;
            }
            if (!mm.indexedDB) {
                try {
                    let idbManager = Cc["@mozilla.org/dom/indexeddb/manager;1"].
                                    getService(Ci.nsIIndexedDatabaseManager);
                    idbManager.initWindowless(mm);
                } catch (e)
                {
                    // May have just failed becuase the API changed again so that 
                    // calls to initWindowless now need to be replaced by...
                    try
                    {
                        Cu.importGlobalProperties(["indexedDB"]);
                        mm.indexedDB = indexedDB;
                    }
                    catch (ie)
                    {
                        // Still broken, we'll have to accept that the whole metrics
                        // system is fragile until Firefox settles on a stable API for IndexedDB...
                        mm._KFLog.info("KeeFox metrics system disabled due to exception: " + e + " and 2nd exception: " + ie);
                        return;
                    }
                }
            }

            if (!mm.IDBKeyRange) {
                mm.IDBKeyRange = IDBKeyRange;
            }
            if (!mm.IDBKeyRange) {
                try
                {
                    Cu.importGlobalProperties(["IDBKeyRange"]);
                    mm.IDBKeyRange = IDBKeyRange;
                }
                catch (e)
                {
                    // Still broken, we'll have to accept that the whole metrics
                    // system is fragile until Firefox settles on a stable API for IndexedDB...
                    mm._KFLog.info("KeeFox metrics system disabled because IDBKeyRange is not available in this Firefox build. Exception: " + e);
                    return;
                }
            }

            // Open a uniquely named database
            var request = mm.indexedDB.open("keefox@chris.tomlinson",4);

            // Not sure why this error could occur (no local disk space?) but
            // being able to track the failure might help us fix it in a
            // future KeeFox release
            request.onerror = function(event) {
                let errMsg = "";
                if (event.target.errorCode)
                    errMsg += event.target.errorCode + " - ";
                if (event.target.error && event.target.error.message)
                    errMsg += event.target.error.message;

                mm._KFLog.error("Metrics system could not open/create the indexedDB. " + errMsg);
                
                // Directly send single event to report the problem
                let msg = {
                    "type": "event",
                    "userId": mm.ii.userId,
                    "sessionId": mm.ii.sessionId,
                    "category": "error",
                    "name": "indexedDBOpen",
                    "params": { "message": errMsg },
                    "ts": ISO8601DateUtils.create(new Date())
                };
                mm.set("message",JSON.stringify(msg));
            };

            // This event handles the event whereby a new version of the database needs to be created
            // Either one has not been created before, or a new version number has been submitted via the
            // window.indexedDB.open line above
            request.onupgradeneeded = function(event) {
                mm._KFLog.debug("Metrics indexedDB version upgrade started");
                var db = event.target.result;
 
                db.onerror = function(event) {
                    let errMsg = "";
                    if (event.target.errorCode)
                        errMsg += event.target.errorCode + " - ";
                    if (event.target.error && event.target.error.message)
                        errMsg += event.target.error.message;
                    mm._KFLog.error("Metrics error: " + errMsg);
                };
                //db.deleteObjectStore("keefox@chris.tomlinson-metrics-data");

                // Create an objectStore for this database   
                var objectStore = db.createObjectStore("keefox@chris.tomlinson-metrics-messages", { keyPath:"id" });
                var objectStore2 = db.createObjectStore("keefox@chris.tomlinson-metrics-data", { keyPath:"key" });

                mm._KFLog.debug("Metrics indexedDB version upgrade finished");
            };
            request.onsuccess = function(event) {
                mm.db = request.result;
                mm.db.onerror = function(event) {
                    let errMsg = "";
                    if (event.target.errorCode)
                        errMsg += event.target.errorCode + " - ";
                    if (event.target.error && event.target.error.message)
                        errMsg += event.target.error.message;
                    mm._KFLog.error("Metrics error: " + errMsg);
                };

                // Find the highest id number we used in the last session, if it's
                // null, we'll just reset to 1 (this data is not sent to the metrics server)
                let objectStore = mm.db.transaction("keefox@chris.tomlinson-metrics-messages")
                                  .objectStore("keefox@chris.tomlinson-metrics-messages");
                objectStore.openCursor(null, "prev").onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        mm.nextId = cursor.key + 1;
                    } else
                    {
                        mm.nextId = 1;
                    }

                    // count how many entries we already have queued up. Should 
                    // usually be 0 or a small number but when the profile has
                    // been unable to send data for many months or years, the 
                    // number of queued events could start to eat into 
                    // available disk space so we put a limit on the total 
                    // number of entries.
                    let req = objectStore.count();
                    req.onsuccess = function(evt) {
                        if (evt.target.result >= 100000)
                        {
                            // Too many stored entries: 100000 = 25MB @ 0.25KB per message
                            mm._KFLog.error("Too many metrics messages. No new messages will be recorded.");

                            // overwrite last stored message to record this error state
                            mm.nextId--;
                            let msg = {
                                "type": "event",
                                "userId": mm.ii.userId,
                                "sessionId": mm.ii.sessionId,
                                "category": "error",
                                "name": "indexedDBFull",
                                "params": { "message": "Too many messages" },
                                "ts": ISO8601DateUtils.create(new Date())
                            };
                            mm.set("message",JSON.stringify(msg));

                            // Keep trying to clear the message queue backlog
                            mm._KFLog.debug("Creating a metrics timer.");
                            mm.metricsTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
         
                            mm.metricsTimer.initWithCallback(mm.metricsTimerHandler,
                                15000,
                                Components.interfaces.nsITimer.TYPE_ONE_SHOT);

                            // Don't do the usual session init. Therefore any
                            // messages created during this session will be logged
                            // into the temporary arrays but never get pushed
                            // into the main message database.
                            return;
                        }

                        // Get server versions (these are probably unknown to start with
                        // but following a successful KeePassRPC connection, they will
                        // be stored for use in the next session)
                        mm.getApplicationMetadata(function () {

                            // push initial session start message
                            mm.startSession(function () {
                                mm._KFLog.debug("Started a metrics session.");

                                // We know we've sent the startSession message now so
                                // we can push any events that were queued temporarilly
                                mm.messagesReady = true;

                                // If any messages have been sent to us while initialising, process them now
                                for (let i=0; i < mm.messagesQueue.length; i++)
                                    mm.set("message", mm.messagesQueue[i].message);
                                mm.messagesQueue = [];

                                // Remove the old session data now it has been sent
                                mm.resetAggregates(function () {
                                    mm.aggregatesReady = true;

                                    // If any aggregate values have been sent to us while initialising, evaluate them now
                                    for (let i=0; i < mm.aggregatesQueue.length; i++)
                                        mm.adjustAggregate(mm.aggregatesQueue[i].key, mm.aggregatesQueue[i].value);
                                    mm.aggregatesQueue = [];

                                    // Start a regular check for queued items that need pushing to the metrics server
                                    // For users that have disabled the user data component, this is technically
                                    // un-necessary unless they re-enable the collection during this session but
                                    // it's a very cheap operation so firing the timer for everyone makes things simpler
                                    mm._KFLog.debug("Creating a metrics timer.");
                                    mm.metricsTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
         
                                    mm.metricsTimer.initWithCallback(mm.metricsTimerHandler,
                                       15000,
                                       Components.interfaces.nsITimer.TYPE_ONE_SHOT);
                                });
                            });
                        });
                    };
                };
            };
        }
        );
    };

    this.startSession = function (callback)
    {
        var mm = this;
        var cb = callback;
        let oldMetrics = this.calculatePreviousSessionMetrics(function (event) {
            let msg = {
                "type": "sessionStart",
                "userId": mm.ii.userId,
                "sessionId": mm.ii.sessionId,
                "sessionStart": mm.ii.sessionStart,
                "previousSessionMetrics": mm.previousSessionMetrics,
                "browserType": mm.ii.browserType,
                "browserVersion": mm.ii.browserVersion,
                "OSType": mm.ii.OSType,
                "OSversion": mm.ii.OSversion,
                "locale": mm.ii.locale,
                "addonVersion": mm.ii.addonVersion,
                "netRuntimeVersion": mm.ii.netRuntimeVersion,
                "keePassVersion": mm.ii.keePassVersion
            };
            mm.set("message",JSON.stringify(msg),function () { cb(); });
        });
    };
    
    this.pushEvent = function(category, name, params) // string, string, object of keys/vals
    {
        if (Services.prefs.getBoolPref("extensions.keefox@chris.tomlinson.metricsUsageDisabled"))
            return;

        let msg = {
            "type": "event",
            "userId": this.ii.userId,
            "sessionId": this.ii.sessionId,
            "category": category,
            "name": name,
            "params": params,
            "ts": ISO8601DateUtils.create(new Date())
        };
        if (this.messagesReady)
            this.set("message",JSON.stringify(msg));
        else
            this.messagesQueue.push( { "message": JSON.stringify(msg) } );
    };

    this.calculatePreviousSessionMetrics = function (callback)
    {
        if (Services.prefs.getBoolPref("extensions.keefox@chris.tomlinson.metricsUsageDisabled"))
        {
            this.previousSessionMetrics = null;
            callback();
            return;
        }
        this.previousSessionMetrics = {};
        var mm = this;
        var cb = callback;
        this.get("databaseLoginCount", function (event) {
            if (event.target.result)
                mm.previousSessionMetrics.databaseLoginCount = event.target.result.value;
            mm.get("contextMenuItemsPressed", function (event) {
                if (event.target.result)
                    mm.previousSessionMetrics.contextMenuItemsPressed = event.target.result.value;
                mm.get("keyboardShortcutsPressed", function (event) {
                    if (event.target.result)
                        mm.previousSessionMetrics.keyboardShortcutsPressed = event.target.result.value;
                    mm.get("avgOpenDatabases", function (event) {
                        if (event.target.result)
                            mm.previousSessionMetrics.avgOpenDatabases = event.target.result.value; // when any are open (so >= 1)
                        //TODO: even more callbacks. yay!
                        mm._KFLog.debug("calculatePreviousSessionMetrics finished");
                        if (cb) cb();
                    });                             
                });
            });
        });
        // future: timing e.g. time logged in to database, time taken to decrypt messages, time from setup screen displayed to successful login , etc. - some of these might be more suited to specific event params
    }

    this.getApplicationMetadata = function (callback)
    {
        this.ii.keePassVersion = "unknown";
        this.ii.netRuntimeVersion = "unknown";

        var mm = this;
        var cb = callback;
        this.get("keePassVersion", function (event) {
            if (event.target.result)
                mm.ii.keePassVersion = event.target.result.value;
            mm.get("netRuntimeVersion", function (event) {
                if (event.target.result)
                    mm.ii.netRuntimeVersion = event.target.result.value;
                if (cb) cb();
            });
        });
    };

    this.setApplicationMetadata = function (keePassVersion, netRuntimeVersion)
    {
        this.set("keePassVersion", keePassVersion);
        this.set("netRuntimeVersion", netRuntimeVersion);
    };

    this.set = function (key, value, callback)
    {
        let cb = callback;
        let mm = this;

        if (key === "message")
        {
            var newMessage = { "id": mm.nextId++, "msg": value };
            var request = mm.db.transaction(["keefox@chris.tomlinson-metrics-messages"], "readwrite")
                        .objectStore("keefox@chris.tomlinson-metrics-messages").put(newMessage);
            request.onsuccess = function(e) {
                if (cb) cb();
            }
        }
        else
        {
            var newItem = { "key": key, "value": value };
            var request = mm.db.transaction(["keefox@chris.tomlinson-metrics-data"], "readwrite")
                        .objectStore("keefox@chris.tomlinson-metrics-data").put(newItem);
            request.onsuccess = function(e) {
                if (cb) cb();
            }
        }
    };

    // messages are always retrieved in batches from a cursor so this
    // only deals with specific data metrics
    this.get = function (key, callback)
    {
        return this.db.transaction(["keefox@chris.tomlinson-metrics-data"], "readonly")
                .objectStore("keefox@chris.tomlinson-metrics-data").get(key).onsuccess = callback;
    };

    // Grab the messages waiting to be sent to the remote server
    this.processQueue = function ()
    {
        let completeMessage = "";
        var objectStore = this.db.transaction("keefox@chris.tomlinson-metrics-messages")
                        .objectStore("keefox@chris.tomlinson-metrics-messages");
        let mm = this;

        objectStore.openCursor().onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
            // Don't append exceptionally large messages to the current message
            // string - we'll leave it for next time and send it on its own
            if (completeMessage !== "" && completeMessage.length + cursor.value.msg.length > 250000)
            {
                mm.deliverMessage(completeMessage);
                return;
            }

            mm.lastSentAttemptId = cursor.value.id;
            completeMessage += cursor.value.msg;
            cursor.continue();
          }
          else {
            // We've reached the end of the cursor, whether we 
            // found any results is another matter...
            if (completeMessage.length > 0)
                mm.deliverMessage(completeMessage);
            else
                mm.metricsTimerRespawn();
          }
        };

    };

    // Start the timer ready for the next queue processing operation
    this.metricsTimerRespawn = function (retry)
    {
        let DEFAULT_DELAY = 15;
        let secondsUntilNextProcess = DEFAULT_DELAY;
    
        // retry should have been set on failure but may also be set by server to manage load
        if (retry)
        {    //TODO: Don't just listen to the server - do something more useful
            secondsUntilNextProcess = retry;
            if (secondsUntilNextProcess < DEFAULT_DELAY)
                secondsUntilNextProcess = DEFAULT_DELAY;
        }

        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Ci.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
        var mm = window.keefox_org.metricsManager;

        mm.metricsTimer.initWithCallback(mm.metricsTimerHandler,
            secondsUntilNextProcess * 1000,
            Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    };

    // Just process the message queue when the timer fires
    this.metricsTimerHandler = {
      notify: function(timer) {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Ci.nsIWindowMediator);
        var window = wm.getMostRecentWindow("navigator:browser") ||
            wm.getMostRecentWindow("mail:3pane");
        var mm = window.keefox_org.metricsManager;
        mm.processQueue();
      }
    };

    // Send a message containing one or more metrics messages
    this.deliverMessage = function (msg) 
    {
        // No need to debug metric data in normal circumstances, only dev work
        //this._KFLog.debug("METRIC to be sent: " + msg);
        this._KFLog.debug("metrics being sent");
        
        function createXMLHttpRequest() {
            const { XMLHttpRequest } = Components.classes["@mozilla.org/appshell/appShellService;1"]
                                     .getService(Components.interfaces.nsIAppShellService)
                                     .hiddenDOMWindow;
            return new XMLHttpRequest();

            //TODO2: After FF15 support dropped, switch to this other implementation:
            //const XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1", "nsIXMLHttpRequest");
            // or this one:
            //return Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
            //   .createInstance(Components.interfaces.nsIXMLHttpRequest);    
        }

        try{
            var request = createXMLHttpRequest();
            request.open("POST", this.url, true);
            request.addEventListener("load", function(event) {
                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                             .getService(Ci.nsIWindowMediator);
                var window = wm.getMostRecentWindow("navigator:browser") ||
                    wm.getMostRecentWindow("mail:3pane");
                var mm = window.keefox_org.metricsManager;

                // Note our success position in the queue so we can remove the old ones
                mm.lastSentId = mm.lastSentAttemptId;
                
                // Remove the old messages
                var objectStore = mm.db.transaction("keefox@chris.tomlinson-metrics-messages","readwrite")
                                    .objectStore("keefox@chris.tomlinson-metrics-messages");

                objectStore.openCursor(mm.IDBKeyRange.upperBound(mm.lastSentId)).onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        objectStore.delete(cursor.primaryKey);
                        cursor.continue();
                    } else
                    {
                        mm.metricsTimerRespawn(15);
                    }
                };

            });
            request.addEventListener("error", function(event) {
                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                             .getService(Ci.nsIWindowMediator);
                var window = wm.getMostRecentWindow("navigator:browser") ||
                    wm.getMostRecentWindow("mail:3pane");
                var mm = window.keefox_org.metricsManager;

                mm._KFLog.debug("Metrics could not be sent.");
                mm.metricsTimerRespawn();
            });
            request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'); 

            // If supported, we'll set a timeout to prevent the metrics collection
            // hanging forever following a single dodgy connection.

            request.timeout = 60000; // 60 seconds
            //TODO2: Auto-adjust timeouts to allow us to be more strict initially?
            request.ontimeout = function(event) {
                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                .getService(Ci.nsIWindowMediator);
                var window = wm.getMostRecentWindow("navigator:browser") ||
                    wm.getMostRecentWindow("mail:3pane");
                var mm = window.keefox_org.metricsManager;
                mm.metricsTimerRespawn();
            };
            request.send(msg);
        } catch (ex)
        {
            mm._KFLog.error("Metrics error. Could not send because: " + ex);
        }
    };

    // all aggregate data will be reset at the start of each session. Aggregation
    // across longer periods of time can still be done in some post-processing
    // of the received data but this short aggregation period will allow us to
    // spot changes quickly.
    this.resetAggregates = function (callback)
    {
        // We do this even if aggregate data collection has been disabled by
        // the user because they might re-enable it during this session
        let cb = callback;
        let mm = this;
        this._KFLog.debug("resetAggregates started");
        this.set("databaseLoginCount",{ value: 0.0 }, function () { 
            mm.set("contextMenuItemsPressed",{ value: 0.0 }, function () { 
                mm.set("keyboardShortcutsPressed",{ value: 0.0 }, function () { 
                    mm.set("avgOpenDatabases",{ avg: 0.0, count: 0 }, function () { 
                        mm.aggregatesReady = true;
                        mm._KFLog.debug("resetAggregates finished");
                        if (cb) cb();
                    });
                });
            });
        });
    };

    this.adjustAggregate = function (key, value)
    {
        if (Services.prefs.getBoolPref("extensions.keefox@chris.tomlinson.metricsUsageDisabled"))
            return;

        var mm = this;
        if (this.aggregatesReady)
        {
            // We might log two new aggregate data points in a short period of time
            // and the async behaviour of indexedDB means that some of these data
            // points may be missed.
            // This might be particularly likely during startup since we have to just
            // fire all the queued events as quickly as possible to avoid race
            // conditions with newly created data points.
            // It should be possible to work around this with the co-operation of all
            // callers but I think it will be too complicated to be worthwhile now.
            this.get(key, function (event) 
                {
                    let result = event.target.result;
                    let agg = result.value;
                    if (agg.value != undefined)
                    {
                        if (agg.value > 0)
                            agg.value = agg.value + value;
                        else
                            agg.value = value;
                    } else if (agg.avg != undefined)
                    {
                        let newCount = agg.count + 1.0;
                        let total = agg.avg * agg.count + value;
                        agg.avg = total/newCount;
                        agg.count = newCount;
                    }
                    mm.set(key, agg);
                }
            );
        } else
        {
            this.aggregatesQueue.push( { "key": key, "value": value } );
        }
    };

}

var metricsManager = new mm;