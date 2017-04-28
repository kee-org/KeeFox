"use strict";

var EXPORTED_SYMBOLS = ["DataMigration"];

const { KeeFoxLog } = Components.utils.import("resource://kfmod/KFLogger.js");
Components.utils.import("resource://kfmod/KFExtension.js");

var webExtensionPort;

try
{
    const addonId = "keefox@chris.tomlinson";
    Components.utils.import("resource://gre/modules/AddonManager.jsm");
    const { LegacyExtensionsUtils } = Components.utils.import("resource://gre/modules/LegacyExtensionsUtils.jsm");

    AddonManager.getAddonByID(addonId, addon => {
        const baseURI = addon.getResourceURI("/");

        const embeddedWebExtension = LegacyExtensionsUtils.getEmbeddedExtensionFor({
            id: addonId, resourceURI: baseURI,
        });

        embeddedWebExtension.startup().then(api => {
            const {browser} = api;

            KeeFoxLog.debug("Embedded WebExtension started");

            browser.runtime.onConnect.addListener(port => {
                KeeFoxLog.debug("Embedded WebExtension connected");
                webExtensionPort = port;
            });

        }).catch(error => {
            KeeFoxLog.error("Embedded WebExtension failed. Data loss may occur. Details: " + error.message + " " + error.stack);
        });
    });
} catch (e)
{
    KeeFoxLog.error("Embedded WebExtension crashed. Data loss may occur. Details: " + e.message + " " + e.stack);
}

var DataMigration = {
    exportAll: function(siteConfig) {
        if (!webExtensionPort)
            return;

        let fullConfig = {};

        fullConfig.version = 1;
        fullConfig.autoFillDialogs = KFExtension.prefs.getValue("autoFillDialogs",true);
        fullConfig.autoFillForms = KFExtension.prefs.getValue("autoFillForms",true);
        fullConfig.autoSubmitForms = KFExtension.prefs.getValue("autoSubmitForms",false);
        fullConfig.autoFillFormsWithMultipleMatches = KFExtension.prefs.getValue("autoFillFormsWithMultipleMatches",true);
        fullConfig.logLevel = KFExtension.prefs.getValue("logLevel", 2);
        fullConfig.KeePassRPCWebSocketPort = KFExtension.prefs.getValue("KeePassRPC.webSocketPort",12546);
        fullConfig.autoSubmitDialogs = KFExtension.prefs.getValue("autoSubmitDialogs", false);
        fullConfig.autoSubmitMatchedForms = KFExtension.prefs.getValue("autoSubmitMatchedForms", false);
        fullConfig.connSLClient = KFExtension.prefs.getValue("connSLClient", 2);
        fullConfig.connSLServerMin = KFExtension.prefs.getValue("connSLServerMin", 2);
        fullConfig.keePassMRUDB = KFExtension.prefs.getValue("keePassMRUDB", "");
        fullConfig.lastConnectedToKeePass = KFExtension.prefs.getValue("lastConnectedToKeePass", "");
        fullConfig.listAllOpenDBs = KFExtension.prefs.getValue("listAllOpenDBs", true);
        fullConfig.logMethodConsole = KFExtension.prefs.getValue("logMethodConsole", false);
        fullConfig.logMethodFile = KFExtension.prefs.getValue("logMethodFile", false);
        fullConfig.logSensitiveData = KFExtension.prefs.getValue("logSensitiveData", false);
        fullConfig.metricsUsageDisabled = KFExtension.prefs.getValue("metricsUsageDisabled", false);
        fullConfig.metricsUserId = KFExtension.prefs.getValue("metricsUserId", "");
        fullConfig.notifyWhenEntryUpdated = KFExtension.prefs.getValue("notifyWhenEntryUpdated", true);
        fullConfig.notifyWhenLateDiscovery = KFExtension.prefs.getValue("notifyWhenLateDiscovery", true);
        fullConfig.notifyWhenLoggedOut = KFExtension.prefs.getValue("notifyWhenLoggedOut", false);
        fullConfig.rememberMRUDB = KFExtension.prefs.getValue("rememberMRUDB", true);
        fullConfig.rememberMRUGroup = KFExtension.prefs.getValue("rememberMRUGroup", true);
        fullConfig.saveFavicons = KFExtension.prefs.getValue("saveFavicons", true);
        fullConfig.searchAllOpenDBs = KFExtension.prefs.getValue("searchAllOpenDBs", true);
        fullConfig.tutorialProgress = KFExtension.prefs.getValue("tutorialProgress", "");
        fullConfig.triggerChangeInputEventAfterFill = KFExtension.prefs.getValue("triggerChangeInputEventAfterFill", false);
        fullConfig.config = siteConfig;

        webExtensionPort.postMessage(fullConfig);

        KFExtension.prefs.setValue("dataMigrationTimestamp", new Date().toISOString());
    }
};
