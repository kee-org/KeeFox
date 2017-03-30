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
                DataMigration.exportAll();
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
    exportAll: function() {
        if (!webExtensionPort)
            return;

        let fullConfig = {};

        fullConfig.version = 1;
        fullConfig.autoFillDialogs = KFExtension.prefs.getValue("autoFillDialogs",true);
        fullConfig.autoFillForms = KFExtension.prefs.getValue("autoFillForms",true);
        fullConfig.autoSubmitForms = KFExtension.prefs.getValue("autoSubmitForms",false);
        fullConfig.autoFillFormsWithMultipleMatches = KFExtension.prefs.getValue("autoFillFormsWithMultipleMatches",true);
        fullConfig.logLevel = KFExtension.prefs.getValue("logLevel", 2);
        //TODO: All the other config

        webExtensionPort.postMessage(fullConfig);
    }
};
