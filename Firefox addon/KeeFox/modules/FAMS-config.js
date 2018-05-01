// The full configuration for this instance of FAMS.
//
// You should overwrite this default config with the default config for
// your application by calling configure before init. E.g.:
// var f = new FirefoxAddonMessageService();
// if (f.configure({ /* your config */ })) {
//      f.init(/* optional logger */);
// }
//
// Most variable state is stored within this configuration structure
// [U] = User can change this variable
// [A] = This variable can be changed automatically in some circumstances
// Other variables should remain the same as you define them here but note that this can't be guaranteed
//
// Dates must be strings entered in a format that the Date constructor can parse for Firefox 3.6+
//
// Strings should contain %-localisation-placeholders-% if possible.
"use strict";

var EXPORTED_SYMBOLS = ["FAMSDefaultConfig"];

var FAMSDefaultConfig = {

    // The uniqueID of the add-on or application using this messaging service (alphanum only)
    id: "KeeFox",

    // The name of the add-on or application using this messaging service
    name: "%-name-%",

    // The description of the add-on or application using this messaging service
    description: "%-description-%",

    // Version number of this configuration. Increment this value to replace the
    // user's message groups and messages with the ones defined here except for display
    // tracking data (number and date and message group frequency)
    version: 7,

    //TODO:2: This message service will not function before this time
    startTime: "8 Jul, 2005 23:34:54 UTC",

    //TODO:2: This message service will cease functioning at this time
    endTime: "8 Jul, 2111 23:34:54 UTC",

    // A minimum amount of time to wait after application startup
    // before any message can be displayed
    minTimeAfterStartup: 45000, // 45 seconds

    // Time (ms) between considering whether we should display a message from any group
    timeBetweenMessages: 300000, // 5 minutes

    // Time (ms) between contacting the remote server to find new messages
    //NB: Total time between new message being posted on server and
    // appearing to user could be up to timeBetweenDownloadingMessages+timeBetweenMessages [U]
    timeBetweenDownloadingMessages: 21600000, // 6 hours

    // Minimum time user is allowed to select in the UI for the
    // timeBetweenDownloadingMessages variable
    minTimeBetweenDownloadingMessages: 3600000, // 1 hour

    // Maximum time user is allowed to seelct in the UI for the
    // timeBetweenDownloadingMessages variable
    maxTimeBetweenDownloadingMessages: 604800000, // 168 hours (1 week)

    //TODO:2:  Where to connect to in order to find out if there are any new messages that the user might need to see
    urlForDownloadingMessages: "",

    // Every message title and body must be available in the default language
    defaultLang: "en",

    // list of all messageGroups defined below. Remove group IDs from this list to temporarilly disable particular groups
    // If no priorities are defined in individual groups (or they are of equal importance) the 
    // order defined in this list will be taken as the order of importance
    // but end users can inadvertantly change the order of this list [U]
    knownMessageGroups: ["tips", "messages", "security"],

    // All preset messages, grouped by category for ease of end-user configuration
    messageGroups: [
        {
            // The unique ID for this message group.
            id: "tips",

            // The name of the group as displayed to the end-user
            name: "%-tips-name-%",

            // What this group is used for (helps end user decide if they
            // want to disable it or not)
            description: "%-tips-description-%",

            // The priority of messages within this group compared to those in other groups (higher = more important)
            priority: 1,

            // The minimum time (ms) after first install that must have elapsed before displaying messages in this group to the end-user
            minTimeAfterInstall: 36000000, // 10 hours

            // A minimum amount of time to wait after application startup
            // before the message group can have its messages displayed
            // Set to any number higher than configuration.minTimeAfterStartup
            // to delay messages from just this group
            // note that with high values, users that frequently restart their
            // browser may never see the messages
            minTimeAfterStartup: 600000, // 10 minutes

            // Time (ms) between considering whether we should display a message from this group [U]
            timeBetweenMessages: 259200000, // 72 hours

            // Maximum time (ms) between considering whether we should
            // display a message from this group (for end user UI)
            maxTimeBetweenMessages: 2419200000, // 28 days

            // Minimum time (ms) between considering whether we should
            // display a message from this group (for end user UI)
            minTimeBetweenMessages: 86400000, // 1 day

            // The earliest time that this message group will be displayed to the user
            earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

            // The latest time that this message group will be displayed to the user
            latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

            // The time that a message from this group was last displayed [A]
            lastMessageDisplayedTime: "8 Jul, 2005 23:34:54 UTC",

            // Whether the user is permitted to modify some of these configuration
            // options (note, nothing prevents a user from manually editing the
            // stored configuration in their profile preferences so do not rely
            // on any of these configuration options being immutable)
            userEditable: true,

            // The full set of preset messages within this group
            messages: [
            {
                // A unique ID for the message. Used to match user settings from
                // old config version to the new one
                id: "tips201201040000b",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000b-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000b-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "LearnMore",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 3,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 3600000000, // 1000 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            },
            {
                id: "tips201201040000c",
                title: "%-tips-default-title-%",
                body: "%-tips201201040000c-body-%",
                moreInfoLink: "%-tips201201040000c-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 0,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            },
            {
                id: "tips201201040000e",
                title: "%-tips-default-title-%",
                body: "%-tips201201040000e-body-%",
                moreInfoLink: "%-tips201201040000e-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 0,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            },
            {
                id: "tips201201040000f",
                title: "%-tips-default-title-%",
                body: "%-tips201201040000f-body-%",
                moreInfoLink: "%-tips201201040000f-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 0,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            },
            {
                id: "tips201201040000g",
                title: "%-tips-default-title-%",
                body: "%-tips201201040000g-body-%",
                moreInfoLink: "%-tips201201040000g-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 0,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            },
            {
                id: "tips201201040000i",
                title: "%-tips-default-title-%",
                body: "%-tips201201040000i-body-%",
                moreInfoLink: "%-tips201201040000i-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 0,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            },
            {
                id: "tips201201040000j",
                title: "%-tips-default-title-%",
                body: "%-tips201201040000j-body-%",
                moreInfoLink: "%-tips201201040000j-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 0,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            },
            {
                id: "tips201201040000k",
                title: "%-tips-default-title-%",
                body: "%-tips201201040000k-body-%",
                moreInfoLink: "%-tips201201040000k-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 0,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            },
            {
                id: "tips201201040000m",
                title: "%-tips-default-title-%",
                body: "%-tips201201040000m-body-%",
                moreInfoLink: "%-tips201201040000m-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 0,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            },
            {
                id: "tips201201040000n",
                title: "%-tips-default-title-%",
                body: "%-tips201201040000n-body-%",
                moreInfoLink: "%-tips201201040000n-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 0,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            },
            {
                id: "tips201201040000o",
                title: "%-tips-default-title-%",
                body: "%-tips201201040000o-body-%",
                moreInfoLink: "%-tips201201040000o-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 0,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            },
            {
                id: "tips201201040000p",
                title: "%-tips-default-title-%",
                body: "%-tips201201040000p-body-%",
                moreInfoLink: "%-tips201201040000p-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 0,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            },
            {
                id: "tips201211040000a",
                title: "%-tips-default-title-%",
                body: "%-tips201211040000a-body-%",
                moreInfoLink: "%-tips201211040000a-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 2,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            },
            {
                id: "tips201312040000a",
                title: "%-tips-default-title-%",
                body: "%-tips201312040000a-body-%",
                moreInfoLink: "%-tips201312040000a-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 2,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            },
            {
                id: "tips201312040000b",
                title: "%-tips-default-title-%",
                body: "%-tips201312040000b-body-%",
                moreInfoLink: "%-tips201312040000b-link-%",
                actionButtonName: "LearnMore",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 2,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 3600000000, // 1000 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            }]
        },
        {
            id: "security",
            name: "%-security-name-%",
            description: "%-security-description-%",
            priority: 3,
            minTimeAfterInstall: 30000, // 30 seconds
            minTimeAfterStartup: 30000, // 30 seconds
            timeBetweenMessages: 3600000, // 1 hour
            maxTimeBetweenMessages: 14400000, // 4 hours
            minTimeBetweenMessages: 3600000, // 1 hour
            earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
            latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
            lastMessageDisplayedTime: "8 Jul, 2005 23:34:54 UTC",
            userEditable: false,
            messages: [
            {
                id: "security201201040000a",
                title: "%-security-default-title-%",
                body: "%-security201201040000a-body-%",
                moreInfoLink: "%-security201201040000a-link-%",
                actionButtonName: "VisitSite",
                earliestDisplayTime: "8 Jan, 2068 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 0,
                maxDisplayTimes: 10,
                displayCount: 0,
                minTimeAfterInstall: 0,
                displayPriorityName: "high",
                displayPersistence: 20,
                minTimeBetweenDisplay: 36000000, // 10 hours
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"
            }]
        },
        {
            id: "messages",
            name: "%-messages-name-%",
            description: "%-messages-description-%",
            priority: 2,
            minTimeAfterInstall: 30000, // 30 seconds
            minTimeAfterStartup: 30000, // 30 seconds
            timeBetweenMessages: 1800000, // 30 minutes (changed in v6 but no need to change old configs)
            maxTimeBetweenMessages: 2419200000, // 28 days
            minTimeBetweenMessages: 1800000, // 30 minutes
            earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
            latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
            lastMessageDisplayedTime: "8 Jul, 2005 23:34:54 UTC",
            userEditable: true,
            messages: [
            {
                id: "messages201506020000a",
                title: "%-messages-welcome-%",
                body: "%-messages201506020000a-body-%",
                moreInfoLink: "%-messages201506020000a-link-%",
                actionButtonName: "VisitSite",
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",
                priority: 0,
                maxDisplayTimes: 3,
                displayCount: 0,
                minTimeAfterInstall: 180000, // 3 minutes - Should be shown ~5mins after first startup
                displayPriorityName: "medium",
                displayPersistence: 10,
                minTimeBetweenDisplay: 2419200000, // 1 day
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC",
                onShow: function () {
                    
                    // If tutorial has been started we skip display of message the first time around
                    // but 2nd time (~1 day later) they need to have finished part1, part2 and
                    // have saved a password to avoid the message appearing; 3rd time - they need
                    // to have finished the main part of it to avoid the message appearing
                    let progress = keefox_org.tutorialHelper.progress;
                    
                    if (this.displayCount == 0 && progress.started)
                        return "pretend";
                    else if (this.displayCount == 1 && progress.part1 && progress.part2 && progress.saved)
                        return "pretend";
                    else if (this.displayCount > 1 && progress.isFinished)
                        return "pretend";
                    return "normal";
                    //return "notnow";
                }
            }]
        }]
};