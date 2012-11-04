
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
// Strings should contain %-localisation-placeholders-% if possible. Define the strings themselves in FAMS-strings.js

FirefoxAddonMessageService.prototype.defaultConfiguration = {

    // The uniqueID of the add-on or application using this messaging service (alphanum only)
    id: "KeeFox",

    // The name of the add-on or application using this messaging service
    name: "%-name-%",

    // The description of the add-on or application using this messaging service
    description: "%-description-%",

    // Version number of this configuration. If you add new messages to existing groups, increment this value
    // In future, more complex migration from older versions may
    // be possible (e.g. to enable addition of new messageGroups, modified descriptions, etc.)
    version: 2,

    //TODO2: This message service will not function before this time
    startTime: "8 Jul, 2005 23:34:54 UTC",

    //TODO2: This message service will cease functioning at this time
    endTime: "8 Jul, 2111 23:34:54 UTC",

    // A minimum amount of time to wait after application startup
    // before any message can be displayed
    minTimeAfterStartup: 45000, // 45 seconds

    // Time (ms) between considering whether we should display a message from any group
    timeBetweenMessages: 600000, // 10 minutes

    // Time (ms) between contacting the remote server to find new messages
    //NB: Total time between new message being posted on server and
    // appearing to user could be up to timeBetweenDownloadingMessages+timeBetweenMessages [U]
    timeBetweenDownloadingMessages: 21600000, // 6 hours

    // Minimum time user is allowed to seelct in the UI for the
    // timeBetweenDownloadingMessages variable
    minTimeBetweenDownloadingMessages: 3600000, // 1 hour

    // Maximum time user is allowed to seelct in the UI for the
    // timeBetweenDownloadingMessages variable
    maxTimeBetweenDownloadingMessages: 604800000, // 168 hours (1 week)

    //TODO2:  Where to connect to in order to find out if there are any new messages that the user might need to see
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
            // browser may never see the messages (this situation may be
            // improved in a future version)
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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000a",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000a-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000a-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000c",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000c-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000c-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000d",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000d-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000d-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000e",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000e-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000e-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000f",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000f-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000f-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000g",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000g-body%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000g-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000h",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000h-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000h-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000i",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000i-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000i-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000j",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000j-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000j-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000k",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000k-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000k-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000l",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000l-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000l-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000m",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000m-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000m-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000n",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000n-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000n-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000o",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000o-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-tips201201040000o-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201201040000p",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201201040000p-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                mmoreInfoLink: "%-tips201201040000p-link-%",

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "tips201211040000a",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-tips-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-tips201211040000a-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                mmoreInfoLink: "%-tips201211040000a-link-%",

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
                priority: 2,

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

            }]

        },
        {
            // The unique ID for this message group.
            id: "security",

            // The name of the group as displayed to the end-user
            name: "%-security-name-%",

            // What this group is used for (helps end user decide if they
            // want to disable it or not)
            description: "%-security-description-%",

            // The priority of messages within this group compared to those in other groups (higher = more important)
            priority: 3,

            // The minimum time (ms) after first install that must have elapsed before displaying messages in this group to the end-user
            minTimeAfterInstall: 30000, // 30 seconds

            // A minimum amount of time to wait after application startup
            // before the message group can have its messages displayed
            // Set to any number higher than configuration.minTimeAfterStartup
            // to delay messages from just this group
            // note that with high values, users that frequently restart their
            // browser may never see the messages (this situation may be
            // improved in a future version)
            minTimeAfterStartup: 30000, // 30 seconds

            // Time (ms) between considering whether we should display a message from this group [U]
            timeBetweenMessages: 3600000, // 1 hour

            // Maximum time (ms) between considering whether we should
            // display a message from this group (for end user UI)
            maxTimeBetweenMessages: 14400000, // 4 hours

            // Minimum time (ms) between considering whether we should
            // display a message from this group (for end user UI)
            minTimeBetweenMessages: 3600000, // 1 hour

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
            userEditable: false,

            // The full set of preset messages within this group
            messages: [
            {
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "security201201040000a",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-security-default-title-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-security201201040000a-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-security201201040000a-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "VisitSite",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jan, 2015 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 10,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 0,

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "high",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 20,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 36000000, // 10 hours

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            }]
        },
        {
            // The unique ID for this message group.
            id: "messages",

            // The name of the group as displayed to the end-user
            name: "%-messages-name-%",

            // What this group is used for (helps end user decide if they
            // want to disable it or not)
            description: "%-messages-description-%",

            // The priority of messages within this group compared to those in other groups (higher = more important)
            priority: 2,

            // The minimum time (ms) after first install that must have elapsed before displaying messages in this group to the end-user
            minTimeAfterInstall: 30000, // 30 seconds

            // A minimum amount of time to wait after application startup
            // before the message group can have its messages displayed
            // Set to any number higher than configuration.minTimeAfterStartup
            // to delay messages from just this group
            // note that with high values, users that frequently restart their
            // browser may never see the messages (this situation may be
            // improved in a future version)
            minTimeAfterStartup: 30000, // 30 seconds

            // Time (ms) between considering whether we should display a message from this group [U]
            timeBetweenMessages: 86400000, // 1 day

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
                // A unique ID for the message. Not sure what this will be used for yet
                // although logging errors and warnings is a likely candidate
                id: "messages201201040000a",

                // The title of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                title: "%-messages-help-keefox-%",

                // The main content of the message. Should be text only.
                // Perhaps basic formatting codes can be supported in future.
                body: "%-messages201201040000a-body-%",

                // The more info link can be different for different languages
                // but in many cases a single link in the default language
                // will suffice
                moreInfoLink: "%-messages201201040000a-link-%",

                // The name (id) of the action button to be displayed to the user
                // - localisation of these strings is done in the main
                // application localisation files
                // LearnMore, VisitSite, Donate or Rate
                actionButtonName: "Rate",

                // The earliest time that this message will be displayed to the user
                earliestDisplayTime: "8 Jul, 2005 23:34:54 UTC",

                // The latest time that this message will be displayed to the user
                latestDisplayTime: "8 Jul, 2111 23:34:54 UTC",

                // The priority of this message above others in its group
                priority: 0,

                // The maximum number of times that this message can be displayed to the end-user
                maxDisplayTimes: 5,

                // The number of times this message has been displayed to the user [A]
                displayCount: 0,

                // The minimum time (ms) after first install that must have elapsed before displaying this message to the end-user
                minTimeAfterInstall: 1209600000, // 2 weeks

                // The priority of this message compared to all others that Firefox needs to display
                displayPriorityName: "medium",

                // Higher numbers increase the time that Firefox displays the
                // message for (it's not feasible to convert the number into
                // a number of seconds)
                displayPersistence: 10,

                // The minimum time (ms) that must elapse between displaying this message
                minTimeBetweenDisplay: 2419200000, // 4 weeks

                // The time that this message was last displayed [A]
                lastDisplayedTime: "8 Jul, 2005 23:34:54 UTC"

            }]
        }]

};