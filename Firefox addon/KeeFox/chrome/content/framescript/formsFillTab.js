/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  There are lots of functions in here that could potentially be refactored further
  to work in Chrome context using JSON representations of data supplied by simpler
  functions in this file. I doubt I'll ever have time for such a large task though
  and I question the efficiency of so much cross-process communication.
  
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

Cu.import("resource://kfmod/kfDataModel.js");

var _calculateFieldMatchScore = function (formField, dataField, currentPage, overWriteFieldsAutomatically)
{
    // Default score is 1 so that bad matches which are at least the correct type
    // have a chance of being selected if no good matches are found
    let score = 1;

    // If field is already filled in and can't be overwritten we make the score 0
    if ((this.isATextFormFieldType(formField.type) || formField.type == "password") && 
        (formField.value.length > 0 && !overWriteFieldsAutomatically)
    )
        return 0;

    // Do not allow any match if field types are significantly mismatched (e.g. checkbox vs text field)
    if ( !( this.isATextFormFieldType(formField.type) && (dataField.type == "username" || dataField.type == "text") ) 
        && !(formField.type == "password" && dataField.type == "password")
        && !(formField.type == "radio" && dataField.type == "radio")
        && !(formField.type == "checkbox" && dataField.type == "checkbox")
        && !(formField.type == "select-one" && dataField.type == "select-one")
        )
        return 0;

    // If field IDs match +++++
    if (formField.fieldId != null && formField.fieldId != undefined 
        && formField.fieldId != "" && formField.fieldId == dataField.fieldId
        )
        score += 50;

    // If field names match ++++
    // (We do not treat ID and NAME as mutually exclusive because some badly written
    // websites might have duplicate IDs but different names so this combined approach 
    // might allow them to work correctly)
    if (formField.name != null && formField.name != undefined 
             && formField.name != "" && formField.name == dataField.name
            )
        score += 40;

    // Although there is a formField.formFieldPage property, it is not accurate
    // so we just compare against the supplied currentPage
    // If page # matches exactly ++
    if (currentPage > 0 && dataField.formFieldPage == currentPage)
        score += 20;

    // If page # is wrong --
    else if (currentPage > 0 && dataField.formFieldPage != currentPage)
        score -= 19; // 20 would cause a tie for an otherwise good name match

    // If page # is unestablished (<=0)
    //else do nothing

    return score;
}

var _fillMatchedFields = function (fields, dataFields, formFields)
{
    // We want to make sure each data field is matched to only one form field but we
    // don't know which field will be the best match and we don't want to ignore
    // less accurate matches just becuase they happen to appear later.

    // We have a list of objects representing each possible combination of data field
    // and form field and the score for that match.
    // We choose what to fill by sorting that list by score.
    // After filling a field we remove all objects from the list which are for the
    // data field we just filled in and the form field we filled in.

    // This means we always fill each form field only once, with the best match
    // selected from all data fields that haven't already been selected for another form field

    // The above algorithm could maybe be tweaked slightly in order to auto-fill
    // a "change password" form if we ever manage to make that automated

    // (score is reduced by one for each position we find in the form - this gives
    // a slight priority to fields at the top of a form which can be useful occassionaly)

    fields.sort(function (a, b) {
        return b.score - a.score;
    });

    // Remember what we've filled in so we can make more accurate decisions when
    // the form is submitted later. We resist the urge the index by element ID or
    // the DOMelement itself because some websites do not specify an ID and some
    // may remove the DOMelement before we submit the form (sometimes under user
    // direction but ocasionally automaticaly too)
    let submittedFields = [];

    // Keep filling in fields until we find no more with a positive score
    while (fields.length > 0 && fields[0].score > 0)
    {
        let ffi = fields[0].formFieldIndex;
        let dfi = fields[0].dataFieldIndex;
        let DOMelement;

        if (formFields[ffi].type == "select-one")
            DOMelement = formFields[ffi].DOMSelectElement;
        else
            DOMelement = formFields[ffi].DOMInputElement;

        Logger.info("We will populate field " + ffi + " (id:" + formFields[ffi].fieldId + ")", " with: " + dataFields[dfi].value);

        this._fillASingleField(DOMelement,formFields[ffi].type,dataFields[dfi].value);

        submittedFields.push({
            id: formFields[ffi].fieldId,
            DOMelement: DOMelement,
            name: formFields[ffi].name,
            value: dataFields[dfi].value
        });

        fields = fields.filter(function (element, index, array) {
            return (element.dataFieldIndex != dfi && element.formFieldIndex != ffi);
        });
        
        fields.sort(function (a, b) {
            return b.score - a.score;
        });
    }
    return submittedFields;
}

var _fillASingleField = function (domElement, fieldType, value)
{  
    if (fieldType == "select-one")
    {
        domElement.value = value; 
    } else if (fieldType == "checkbox")
    {
        if (value == "KEEFOX_CHECKED_FLAG_TRUE")
            domElement.checked = true;
        else
            domElement.checked = false;
    } else if (fieldType == "radio")
    {
        domElement.checked = true;
    } else
    {    
        domElement.value = value; 
    }
}

var _fillManyFormFields = function 
    (formFields, dataFields, currentPage, overWriteFieldsAutomatically)
{
    Logger.debug("_fillManyFormFields started");
    
    if (formFields == null || formFields == undefined || dataFields == null || dataFields == undefined)
        return;
    
    Logger.debug("We've received the data we need");
    
    Logger.info("Filling form fields for page "+currentPage);
    
    if (overWriteFieldsAutomatically)
        Logger.info("Auto-overwriting fields");
    else
        Logger.info("Not auto-overwriting fields");
    
    // we try to fill every form field. We try to match by id first and then name before just guessing.
    // Generally we'll only fill if the matched field is of the same type as the form field but
    // we are flexible RE text and username fields because that's an artificial difference
    // for the sake of the KeeFox password management software. However, usernames will be chosen above
    // text fields if all else is equal
    var fields = [];

    for (var i = 0; i < formFields.length; i++)
    {
        for (var j = 0; j < dataFields.length; j++)
        {
            let score = this._calculateFieldMatchScore(
                formFields[i],dataFields[j],currentPage,overWriteFieldsAutomatically);
            Logger.debug("Suitablility of putting data field "+j+" into form field "+i
                +" (id: "+formFields[i].fieldId + ") is " + score);
            fields.push({'score': score,'dataFieldIndex': j,'formFieldIndex': i});
        }
    }

    return this._fillMatchedFields (fields, dataFields, formFields);
};

/* Expects this data object:
{
    autofillOnSuccess: true, // This won't override other configuration options if true but if false it will.
    autosubmitOnSuccess: true, // This won't override other configuration options if true but if false it will.
    notifyUserOnSuccess: true, // e.g. used when periodic form polling finds a form after the page has loaded.
    stateOverride: {} // Allows requesting context to demand that some aspects of this tab's state are overriden
                      //before decisions regarding form detection and filling are taken
}
*/
// Likely to be called from chrome context in response to user interaction (e.g. tab selection or detect-forms request)
var FindMatchesRequestHandler = function (message) {
    
    if (tabState.frameResponseCount === undefined)
    {
        Logger.debug("FindMatchesRequestHandler ignored a request (too soon - we're still waiting for the tab to init).");
        return;
    } else
    {
        Logger.debug("FindMatchesRequestHandler accepted a request.");
    }

    if (message.data.stateOverride)
    {
        if (message.data.stateOverride.UUID && message.data.stateOverride.UUID.length > 0)
            tabState.UUID = message.data.stateOverride.UUID;
        if (message.data.stateOverride.dbFileName && message.data.stateOverride.dbFileName.length > 0)
            tabState.dbFileName = message.data.stateOverride.dbFileName;
        if (message.data.stateOverride.autoSubmit === true)
            tabState.forceAutoSubmit = true;
        else
            tabState.forceAutoSubmit = false;
    }

    if (tabState.findMatchesUnderway && message.data.notifyUserOnSuccess)
    {
        sendAsyncMessage("keefox:growl",{
            "title": "KeeFox is already searching for logins to fill on this page", 
            "text": "Maybe try again in a few seconds", 
            "clickToShowPanel": false});
    } else
    {
        findMatchesInAllFrames(
            message.data.autofillOnSuccess, 
            message.data.autosubmitOnSuccess, 
            message.data.notifyUserOnSuccess);
    }

};

var PrepareForOneClickLoginHandler = function (message) {

    Logger.debug("PrepareForOneClickLoginHandler accepted a request.");

    resetFormFillSession();

    if (message.data.stateOverride)
    {
        if (message.data.stateOverride.UUID && message.data.stateOverride.UUID.length > 0)
            tabState.UUID = message.data.stateOverride.UUID;

        if (message.data.stateOverride.dbFileName && message.data.stateOverride.dbFileName.length > 0)
            tabState.dbFileName = message.data.stateOverride.dbFileName;

        if (message.data.stateOverride.autoSubmit === true)
        {
            tabState.userRecentlyDemandedAutoSubmit = true;
            tabState.forceAutoSubmit = true;
        }
        else
        {
            tabState.forceAutoSubmit = false;
        }
    } else
    {
        Logger.warn("PrepareForOneClickLoginHandler found no data.");
    }

};


/*
 * findMatchesInAllFrames
 *
 * Find every form in every frame of the document, including a pseudo form for
 * fields that are not contained within a form. Then send appropriate requests
 * to KeePass to find matching entries.
 */
/* WARNING: CONCURRENCY: More-or-less the entire page load handling algorithm relies
on the hope that no more than one thread can be attempting entry to this function
at any given time. I think the standard JS engine means this is a pretty safe
assumption but future changes to add-on code to use background threads or
significant changes to Firefox JS execution engine should be a flag to revalidate
this assumption. (tabState.findMatchesUnderway is conceptually a mutex, but JS
has no way to enforce that... and hopefully no need!)... multi-process e10s Firefox is fun!
*/
var findMatchesInAllFrames = function (autofillOnSuccess, autosubmitOnSuccess, notifyUserOnSuccess)
{
    // This is called every time a frame in this tab loads a new document.

    // Make sure we don't accidentally run this concurrently (e.g. another DOMContentLoaded
    // event being fired on a different frame while we are waiting to hear back from
    // KeePassRPC). Should already be handled upstack but just in case... (e.g. 
    // for user-interactions we can't / don't want to control?)
    if (tabState.findMatchesUnderway)
    {
        Logger.debug("search for matches already underway.");
        tabState.findMatchesASAP = true;
        return;
    }
    else
    {
        tabState.findMatchesUnderway = true;
        /* We might not know the total number of frames we are expecting because the
        subframes could themselves contain more frames once the DOM is ready. We'll
        fudge around that issue later but for now, we just need to make sure that
        this search algorithm doesn't break if it tries to access the DOM of an
        as-yet non-ready subframe (not sure how to do that yet - will probably
        just work anyway). */

        // If there is a search timeout already in progress, delete it
        if (searchCompleteTimeout !== null)
        {
            clearTimeout(searchCompleteTimeout);
            searchCompleteTimeout = null;
        }
        
        // We do it even when KeePass is closed/locked if the user has asked to be
        // prompted to open a KeePass database when a form is found

        // We only use one pref now so it has a slightly different meaning, but
        // since "logged out" is technically true even when KeePassRPC is unavailable,
        // I think this is close enough and better than using the old
        // notifyBarWhenKeePassRPCInactive pref instead.
        let notifyWhenLoggedOut = KFExtension.prefs.getValue("notifyWhenLoggedOut",false);

        // Prevent notification if we were prepared to notify the user when a form
        // match was found because that indicates that the user either already knows
        // or can easily find out that the database is not open (e.g. another frame
        // has just been dynamically loaded)
        notifyWhenLoggedOut = notifyWhenLoggedOut & !notifyUserOnSuccess;

        let isKeePassDatabaseOpen = sendSyncMessage("keefox:isKeePassDatabaseOpen")[0];

        if (!isKeePassDatabaseOpen && !notifyWhenLoggedOut)
        {
            // I'm not sure if other frames could execute in parallel so reducing risk
            // of bugs by wrapping logged-in check in findMatchesUnderway lock so need
            // to undo it here and restart if anything did trigger another attempt
            // during this process
            findMatchesNoLongerUnderway();
            return;
        }

        // Find the top frame
        var topDoc = content.document;
        while (topDoc.defaultView.frameElement)
            topDoc=topDoc.defaultView.frameElement.ownerDocument;
        var topWin = topDoc.defaultView;

        // Record how many frames we are expecting to get async results for so
        // we will know when we're ready to auto-fill/submit or update the UI
        tabState.frameCount = countAllDocuments(topWin);
        Logger.debug("search for matches expects results from " + tabState.frameCount + " frames.");

        let behaviour = {
            autofillOnSuccess: autofillOnSuccess,
            autosubmitOnSuccess: autosubmitOnSuccess,
            notifyUserOnSuccess: notifyUserOnSuccess
        };

        if (tabState.UUID != undefined && tabState.UUID != null && tabState.UUID != "")
        {
            Logger.info("Found this KeePass uniqueID in the tab: " + tabState.UUID);
            Logger.debug("Found this KeePass DB file name in the tab: " + tabState.dbFileName);
        
            // Keep a record of the specific entry we are going to search for (we delete
            // the tabstate below and re-create it during form fill)
            behaviour.UUID = tabState.UUID;
            behaviour.dbFileName = tabState.dbFileName;
                
            if (tabState.forceAutoSubmit === true && tabState.userRecentlyDemandedAutoSubmit)
            {
                Logger.debug("We must auto-submit this form.");
                behaviour.mustAutoSubmitForm = true;
            }

            // Deleting these bits of info no matter what, so future uses of this tab are unaffected by previous uses.
            // (if we actually go ahead with the form fill we will add them back in then)
            tabState.forceAutoSubmit = null;
            tabState.dbFileName = null;
            tabState.UUID = null;
            Logger.debug("deleted some tab values");
        }

        // Recursively look for matches in all frames
        findMatchesInManyFrames(topWin, behaviour);
    }
};

var findMatchesInManyFrames = function (win, behaviour)
{
    Logger.debug("findMatchesInManyFrames start");
    this.findMatchesInSingleFrame(win.document, behaviour);
    
    if (win.frames.length > 0)
    {
        Logger.debug("Filling " + win.frames.length + " sub frames");
        var frames = win.frames;
        for (var i = 0; i < frames.length; i++)
            this.findMatchesInManyFrames (frames[i], behaviour);
    }    
};

var findMatchesInSingleFrame = function (doc, behaviour)
{
    let autofillOnSuccess = behaviour.autofillOnSuccess;
    let autosubmitOnSuccess = behaviour.autosubmitOnSuccess;
    let notifyUserOnSuccess = behaviour.notifyUserOnSuccess;
    let UUID = behaviour.UUID;
    let dbFileName = behaviour.dbFileName;
    let mustAutoSubmitForm = behaviour.mustAutoSubmitForm;

    Logger.info("Finding matches in a document. readyState: " + doc.readyState 
        + ", autofillOnSuccess: " + autofillOnSuccess + ", autosubmitOnSuccess: " 
        + autosubmitOnSuccess + ", notifyUserOnSuccess: " + notifyUserOnSuccess
        , "docURI: " + doc.documentURI);
    
    let useCachedResults = true;

    var matchResult = {};
    
    matchResult.UUID = "";
    matchResult.logins = [];
    
    // auto fill the form by default unless a preference or tab variable tells us otherwise
    matchResult.wantToAutoFillForm = KFExtension.prefs.getValue("autoFillForms",true);
    matchResult.mustAutoFillForm = false;
    matchResult.cannotAutoFillForm = false;

    // do not auto submit the form by default unless a preference or tab variable tells us otherwise
    matchResult.wantToAutoSubmitForm = KFExtension.prefs.getValue("autoSubmitForms",false);
    matchResult.mustAutoSubmitForm = false;
    matchResult.cannotAutoSubmitForm = false;

    // Allow user to override automatic behaviour if multiple logins match this URL
    matchResult.wantToAutoFillFormWithMultipleMatches = 
        KFExtension.prefs.getValue("autoFillFormsWithMultipleMatches",true);
    matchResult.wantToAutoSubmitFormWithMultipleMatches = 
        KFExtension.prefs.getValue("autoSubmitFormsWithMultipleMatches",true);
    
    // overwrite existing username by default unless a preference or tab variable tells us otherwise
    matchResult.overWriteFieldsAutomatically = KFExtension.prefs.getValue("overWriteFieldsAutomatically",true);

    //let doc = content.document;
    var topDoc = doc;
    while (topDoc.defaultView.frameElement)
        topDoc=topDoc.defaultView.frameElement.ownerDocument;
    matchResult.topDoc = topDoc;
   
    matchResult.tabState = tabState;
    
    if (UUID != undefined && UUID != null && UUID != "")
    {
        // Keep a record of the specific entry we are going to search for (we delete
        // the tabstate below and re-create it during form fill)
        matchResult.UUID = UUID;
        matchResult.dbFileName = dbFileName;
        
        // we want to fill the form with this data
        matchResult.mustAutoFillForm = true;
        matchResult.overWriteFieldsAutomatically = true;
                
        if (mustAutoSubmitForm)
            matchResult.mustAutoSubmitForm = true;
    }
    
    // Work out whether there is anything suitable in the cache
    let cacheResults;

    // Some debugging might benefit from being able to disable the results cache
    useCachedResults = KFExtension.prefs.getValue("tabResultsCacheEnabled", true);
    if (!useCachedResults)
        Logger.warn("The results cache is disabled. Set extensions.keefox@chris.tomlinson.tabResultsCacheEnabled=true to re-enable in order to increase performance.");
    
    // We disable the cache at the moment. I'm not convinced it's vital for the initial
    // e10s release and it needs a lot more work. E.g. make sure it can be invalidated
    // when anything happens which might alter the previous results (KeePass DB change, KeeFox
    // settings change)
    useCachedResults = false;

    if (useCachedResults)
    {
        // Look up the cache entry
        cacheResults = tabState.latestFindMatchesResultsByURI[doc.documentURI];

        if (typeof(cacheResults) === "undefined" || cacheResults === null)
            useCachedResults = false;
        else if (typeof(cacheResults.results) === "undefined" || cacheResults.results === null)
            useCachedResults = false;
            
        // maybe check cache expiry times?
        //if (cacheResults.createdOn >)
    }

    let fak = getFrameArrayKey(doc);
    var forms = doc.forms;

    if (useCachedResults)
    {
        // Whenever possible we'll use previously cached results but there are a
        // variety of circumstances which cause us to need to ask KeePassRPC what 
        // the answer is (including the obvious of the results not being available in cache)

        Logger.info("Matching KeePass login entries found in cache.");
        tabState.frameResponseCount++;
        findLoginsCacheHandler(convertedResult, findLoginOp, matchResult);
        return;
    } else
    {
        matchResult.forms = forms;
        matchResult.doc = doc;
    
        var conf = config.getConfigForURL(doc.documentURI);

        if (conf.scanForOrphanedFields)
            forms.push(scanForOrphanedFields());

        if (!forms || forms.length == 0)
        {
            Logger.info("No forms found on this page." + (conf.scanForOrphanedFields 
                ? "" : " If you think there should be a form detected, try enabling 'Scan for orphaned fields' in site-specific settings."));

            tabState.frameResponseCount++;
            if (tabState.latestFindMatchesResults[fak] !== undefined)
                delete tabState.latestFindMatchesResults[fak];
            aSearchComplete(fak); 
            return;
        }

        // We found a form so either we go ahead or just notify the user if we've
        // previously decided KeePass is closed/locked (we'd never get to here if
        // it's closed/locked and user is uninterested in being notified)
        if (!sendSyncMessage("keefox:isKeePassDatabaseOpen")[0])
        {
            Logger.debug("findMatches notifying user of logged-out state");
            sendAsyncMessage("keefox:showMainKeeFoxPanel");

            tabState.frameResponseCount++;
            if (tabState.latestFindMatchesResults[fak] !== undefined)
                delete tabState.latestFindMatchesResults[fak];
            aSearchComplete(fak); 
            return;
        }

        Logger.debug("findMatches processing " + forms.length + " forms", " on " + doc.documentURI);

        matchResult.formReadyForSubmit = false; // tracks whether we actually auto-fill on this page
        matchResult.autofillOnSuccess = autofillOnSuccess;
        matchResult.autosubmitOnSuccess = autosubmitOnSuccess;
        matchResult.notifyUserOnSuccess = notifyUserOnSuccess;
        matchResult.formOrigin = doc.documentURI;
        matchResult.wrappers = [];
        matchResult.allMatchingLogins = [];
        matchResult.formRelevanceScores = [];
        matchResult.usernameIndexArray = [];
        matchResult.passwordFieldsArray = [];
        matchResult.otherFieldsArray = [];
        matchResult.requestCount = 0;
        matchResult.responseCount = 0;
        matchResult.requestIds = []; // the JSONRPC request Ids that reference this matchResult object (to allow deletion after async callback processing)
    
        var previousRequestId = 0;

        // For every form, including any pseudo forms we created earlier
        for (var i = 0; i < forms.length; i++)
        {
            var form = forms[i];
            matchResult.logins[i] = [];
        
            // the overall relevance of this form is the maximum of it's
            // matching entries (so we fill the most relevant form)
            matchResult.formRelevanceScores[i] = 0;

            Logger.debug("about to get form fields");
            var [usernameIndex, passwordFields, otherFields] =
                this._getFormFields(form, false);
            
            // We want to fill in this form if we find a password field but first
            // we check whether any whitelist or blacklist entries must override that behaviour
            var interestingForm = null;

            interestingForm = config.valueAllowed(form.id,conf.interestingForms.id_w,conf.interestingForms.id_b,interestingForm);
            interestingForm = config.valueAllowed(form.name,conf.interestingForms.name_w,conf.interestingForms.name_b,interestingForm);
        
            if (interestingForm === false)
            {
                Logger.debug("Lost interest in this form after inspecting form name and ID");
                continue;
            }

            for (var f in otherFields)
            {
                interestingForm = config.valueAllowed(otherFields[f].id,conf.interestingForms.f_id_w,conf.interestingForms.f_id_b,interestingForm);
                interestingForm = config.valueAllowed(otherFields[f].name,conf.interestingForms.f_name_w,conf.interestingForms.f_name_b,interestingForm);
            }

            //TODO:1.6: #444 interestingForm = keefox_org.config.cssSelectorAllowed(document,conf.interestingForms.f_css_w,conf.interestingForms.f_css_b,interestingForm);
        
            if (interestingForm === false)
            {
                Logger.debug("Lost interest in this form after inspecting field names and IDs");
                continue;
            }
        
            if (passwordFields == null || passwordFields.length <= 0 || passwordFields[0] == null)
            {
                Logger.debug("no password field found in this form");
                // so we now only want to fill in the form if it has been whitelisted
                if (interestingForm !== true)
                    continue;
            }

            matchResult.usernameIndexArray[i] = usernameIndex;
            matchResult.passwordFieldsArray[i] = passwordFields;
            matchResult.otherFieldsArray[i] = otherFields;
        
            // The logins returned from KeePass for every form will be identical (based on tab/frame URL)
            if (previousRequestId == 0)
            {
                var findLoginOp = {};
                findLoginOp.forms = forms;
                findLoginOp.formIndexes = [i];
                findLoginOp.wrappedBy = matchResult;
                matchResult.wrappers[i] = findLoginOp;
                matchResult.requestCount++;
                findLoginOp.frameArrayKey = getFrameArrayKey(doc);
                
                // Search KeePass for matching logins. This request is synchronous to
                // the KeeFox chrome layer but the upstream request to KeePass is asynchronous.
                let res = sendSyncMessage("keefox:findLogins", { "url": matchResult.formOrigin });
                var requestId = res[0];
            
                matchResult.requestIds.push(requestId);
                findLoginOps[requestId] = findLoginOp;
                matchResults[requestId] = matchResult;
                previousRequestId = requestId;
            } else {
                Logger.debug("form[" + i + "]: reusing logins from last form.");
                findLoginOps[previousRequestId].formIndexes.push(i);
            }

        }  // end of form for loop

        // If we didn't find a form we want to search, mark this frame as complete immediately
        if (previousRequestId == 0)
            aSearchComplete(fak);

    } // end of non-cached behaviour
};

var findLoginsCacheHandler = function (convertedResult, findLoginOp, matchResult)
{
    matchResult = getRelevanceOfLoginMatchesAgainstAllForms(convertedResult, findLoginOp, matchResult);

    // record the form data associated with this frame
    tabState.latestFindMatchesResults[findLoginOp.frameArrayKey] = matchResult;
    
    // see if we're ready to do the next stage of form processing...
    aSearchComplete(findLoginOp.frameArrayKey); 
};

var findLoginsResultHandler = function (message)
{
    var resultWrapper = message.data.resultWrapper;
    var foundLogins = null;
    var convertedResult = [];
    let isError = false;

    try
    {
        if ("result" in resultWrapper && resultWrapper.result !== false && resultWrapper.result != null)
        {
            foundLogins = resultWrapper.result; 
                    
            for (var i in foundLogins)
            {
                var kfl = keeFoxLoginInfo();
                kfl.initFromEntry(foundLogins[i]);

                // Only consider logins that have some kind of form data to fill in
                if ((kfl.passwords != null && kfl.passwords.length > 0)
                    || (kfl.otherFields != null && kfl.otherFields.length > 0))
                    convertedResult.push(kfl);
            }
        } else
        {
            isError = true;
        }
    } catch (e) {
        isError = true;
    }
    
    // Without a resultWrapper.id we are screwed (form filling probably won't work
    // again in this tab). I can't see how that could happen but am mentioning it
    // just in case.

    var findLoginOp = null;
    var matchResult = null;

    try {
        findLoginOp = findLoginOps[resultWrapper.id];
        matchResult = matchResults[resultWrapper.id];
    } finally
    {
        if (!matchResult || !findLoginOp)
        {
            Logger.error("Received a very slow response from KeePassRPC for one of the frames we were searching for. This situation is poorly tested - try searching for logins again, refreshing the page or using a smaller KeePass database. Please report any experience you have regarding this error message to the support forum or github. http://keefox.org/help");
            return; // must be a very slow response (searchComplete has already run)
            //TODO:1.6: trigger a new search if this ever happens for unrepeatable reasons
        }
    }

    if (isError)
    {
        // Probably an error occurred but we need to poke the next part of the
        // search results handling process so that we know we're no longer waiting
        // for this frame
        tabState.frameResponseCount++;
        if (tabState.latestFindMatchesResults[findLoginOp.frameArrayKey] !== undefined)
            delete tabState.latestFindMatchesResults[findLoginOp.frameArrayKey];
        aSearchComplete(findLoginOp.frameArrayKey); 
        return;
    }
                    
    matchResult = getRelevanceOfLoginMatchesAgainstAllForms(convertedResult, findLoginOp, matchResult);
    tabState.frameResponseCount++;

    // record the form data associated with this frame
    tabState.latestFindMatchesResults[findLoginOp.frameArrayKey] = matchResult;

    // Add the results to our cache for faster access next time
    // The results contain objects that can't be sent cross-process so we limit our
    // cache to each tab at the moment. Maybe we could add another global level cache
    // in future but we'd have to weigh up the performance hit of the cross-process
    // comms and mapping to/from JSON against the memory saving and performance benefit
    // of a higher hit ratio.
    //tabState.latestFindMatchesResultsByURI[matchResult.formOrigin] = { 
    //    postLoad: !tabState.pageLoadExpected, 
    //    createdOn: Date(),
    //    results: convertedResult };
    // Not actually doing this until we have a use for the cache data

    // see if we're ready to do the next stage of form processing...
    aSearchComplete(findLoginOp.frameArrayKey); 
};

var getRelevanceOfLoginMatchesAgainstAllForms = function (convertedResult, findLoginOp, matchResult)
{
    let crString = JSON.stringify(convertedResult);

    for (var i=0; i < findLoginOp.forms.length; i++)
    {
        // Skip any form that we don't want to match against this set of logins
        if (findLoginOp.formIndexes.indexOf(i) == -1)
            continue;
        
        // if there is more than one form, we have to work with clones of the login result so
        // that we can manipulate the relevancy scores, etc. independently for each 
        // form and login combination. We could be more efficient for the common case of 1 form 
        // by avoiding the clone then but keeping the same behaviour gives us a higher chance 
        // of noticing bugs.
        matchResult.logins[i] = JSON.parse(crString); //TODO:2: faster clone? https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm ?

        // Nothing to do if we have no matching logins available.
        if (matchResult.logins[i].length == 0)
            continue;
                    
        Logger.info("match found!");
        
        // determine the relevance of each login entry to this form
        // we could skip this when autofilling based on uniqueID but we would have to check for
        // matches first or else we risk no match and no alternative matching logins on the mainUI
        for (var v = 0; v < matchResult.logins[i].length; v++)
        {
            matchResult.logins[i][v].relevanceScore = calculateRelevanceScore(matchResult.logins[i][v],
                    findLoginOp.forms[i],matchResult.usernameIndexArray[i],
                    matchResult.passwordFieldsArray[i], matchResult.currentPage,
                    matchResult.otherFieldsArray[i]);
            
            // also set the form ID and login ID on the internal login object so
            // it will persist when later passed to the UI and we can ultimately 
            // find the same login object when processing a matched login
            matchResult.logins[i][v].formIndex = i;
            matchResult.logins[i][v].loginIndex = v;
            matchResult.logins[i][v].frameKey = findLoginOp.frameArrayKey;
            
            // Remember the best form for each login
            if (i == 0 || matchResult.logins[i][v].relevanceScore > matchResult.allMatchingLogins[v].relevanceScore)
            {
                Logger.debug("Higher relevance score found for login " + v + " with formIndex " 
                    + matchResult.logins[i][v].formIndex + " (" + findLoginOp.forms[i].id + ")");
                matchResult.allMatchingLogins[v] = matchResult.logins[i][v];
            }
        }
        
        matchResult.logins[i].forEach(function(c) {
            if (c.relevanceScore > matchResult.formRelevanceScores[i])
                matchResult.formRelevanceScores[i] = c.relevanceScore;
        } );

        Logger.debug("Relevance of form " + i + " (" + findLoginOp.forms[i].id + ") is " + matchResult.formRelevanceScores[i]);
    }
    return matchResult;
};


// We never start the "search for forms has completed" process immediately because it
// is impossible to accurately know if we are considering all possible forms that
// make up the page seen by the user because we may still find new frame documents
// are loaded after this first one. This mainly matters when considering which match
// to put into which form for auto-fill and auto-submit but by making any change to
// the KeeFox UI (i.e. adding a matched login to the panel) we imply to the user
// that KeeFox is finished so we still want to wait a while to discourage itchy
// trigger fingers unnecessarilly interrupting the auto-fill/submit process.
// This var allows us track and manipulate the current timeout operation as further
// frames appear.
var searchCompleteTimeout = null;

// The number of ms we will always wait once we think we have finished searching
// for forms in all frames of this tab. This allows some time for dynamically
// loaded frames to be inserted to the DOM after initial page load. We're starting
// at a difficult-to-percieve level but can consider increasing it in future (or
// making it user/site configurable) based on user feedback.
var minimumSearchCompletionDelay = 150;

// This happens after each findLogins call has run its callback so we can see if
// we have received all the answers we need to fill the form now.
// We know a search is underway when this is called because:
// 1) New frames to search will not be accepted during a search
// 2) Any slow response from KPRPC will fail to find the corresponding data for 
// that request ID so not be able to call this function
var aSearchComplete = function (frameArrayKey)
{
    // If there is a timeout already in progress, delete it
    if (searchCompleteTimeout !== null)
    {
        clearTimeout(searchCompleteTimeout);
        searchCompleteTimeout = null;
    }

    // ensure we only assess the best matching form once all async callbacks have
    // been received
    if (tabState.frameResponseCount < tabState.frameCount)
        return;

    // Delay for a short time in case new frames are added to the DOM as part of the site's onDOMReady behaviour
    searchCompleteTimeout = setTimeout(allSearchesComplete, minimumSearchCompletionDelay);
};

// we have all the answers we need (or can be bothered to wait for) so lets go
// ahead with the form fill and submit process.
var allSearchesComplete = function ()
{ 
    // Fill and submit
    fillAndSubmit(true);

    // Once we've done the filling and submitting, we can get ready for the next time...

    /* Delete the references to data that we kept around until we heard back from
    KeePassRPC. Note that it is not expected that these delete operations will
    cause immediate release of memory but without this step they would be
    gauranteed to remain for the entire tab session. The most likely outcome is
    that the findLoginOps will be GCed pretty quickly but the matchResults will
    likely remain around for much longer due to the simplified matched logins
    implementation and the new performance cache. This cache will be purged of
    old data occasionally (although the implementation of that is not a top priority).
    */

    Logger.debug("Deleting any references to login data for recently completed async find logins call.");
    
    for (var prop in tabState.latestFindMatchesResults)
    {
        if (!prop.startsWith("top"))
            continue;

        var rids = tabState.latestFindMatchesResults[prop].requestIds.slice(0);
        for (var ridc = 0, l = rids.length; ridc < l; ridc++)
        {
            Logger.debug("Deleting for request #" + ridc + " (id: " + rids[ridc] + ")");
            delete findLoginOps[rids[ridc]];
            delete matchResults[rids[ridc]];
        }
    }
    // Note that we hang on to the tabState.latestFindMatchesResults array contents
    // because we want to use it again when/if the user interacts with the matched logins menu

    findMatchesNoLongerUnderway();
}

var findMatchesNoLongerUnderway = function()
{
    tabState.pageLoadExpected = false;
    tabState.findMatchesUnderway = false;

    // Sometimes a frame may be added to the DOM after the initial page load.
    // This flag allows us to notify the user if new results were found after page load.
    tabState.initialSearchComplete = true;

    // Go again if we have been told another document load has occurred while we
    // were busy handling the last one(s)
    if (tabState.findMatchesASAP)
    {
        tabState.findMatchesASAP = false;
        findMatchesInAllFrames(false, false, true);
    } else
    {
        // When we know we've handled all onLoad related searches for matches we can
        // start paying attention to any notifications that specific DOM elements
        // were added to the page
        tabState.respondDirectlyToNewDOMElements = true;
    }
}

// Handles requests from Chrome to fill and submit a specific form/login combination
var fillAndSubmitHandler = function (message)
{
    tabState.userRecentlyDemandedAutoSubmit = true;
    fillAndSubmit(message.data.automated, message.data.frameKey, message.data.formIndex, message.data.loginIndex);
}

var getMostRelevantFormForFrame = function (frame, formIndex)
{
    //TODO:2: One day could probably make this more efficient for searches across
    //many frames by calculating the frameKey as we recurse through to this point.
    let frameKey = getFrameArrayKey(frame.document);
    let findMatchesResult = tabState.latestFindMatchesResults[frameKey];

    // There may be no results for this frame (e.g. no forms found, search failed, etc.)
    if (!findMatchesResult)
        return {
            "bestFormIndex": 0,
            "bestRelevanceScore": 0,
            "bestFindMatchesResult": undefined
        };

    var mostRelevantFormIndex = 0;

    if (formIndex >= 0)
        mostRelevantFormIndex = formIndex;
    else
        findMatchesResult.formRelevanceScores.forEach(function(c, index) { 
            Logger.debug("Relevance of form is " + c);
            if (c > findMatchesResult.formRelevanceScores[mostRelevantFormIndex])
                mostRelevantFormIndex = index;
        } );
    
    Logger.debug("The most relevant form is #" + mostRelevantFormIndex);
    return {
        "bestFormIndex": mostRelevantFormIndex,
        "bestRelevanceScore": findMatchesResult.formRelevanceScores[mostRelevantFormIndex],
        "bestFindMatchesResult": findMatchesResult
    };
};

var getBestMatchForFrames = function (frame)
{
    // Find the best match for this frame
    let thisFrameMatch = getMostRelevantFormForFrame(frame);
    let currentBestRelevanceScore = thisFrameMatch.bestRelevanceScore;
    let currentBestFrameMatch = frame;
    let currentBestFormIndex = thisFrameMatch.bestFormIndex;
    let currentBestFindMatchesResult = thisFrameMatch.bestFindMatchesResult;

    // Find the best match from any subframes
    for (let i=0; i < frame.frames.length; i++)
    {
        let frameMatch = getBestMatchForFrames(frame.frames[i])

        if (frameMatch.bestRelevanceScore > currentBestRelevanceScore)
        {
            currentBestRelevanceScore = frameMatch.bestRelevanceScore;
            currentBestFrameMatch = frameMatch.bestFrameMatch;
            currentBestFormIndex = frameMatch.bestFormIndex;
            currentBestFindMatchesResult = frameMatch.bestFindMatchesResult;
        }
    }
    
    // Return the best match from either the subframes or this frame
    return {
        "bestRelevanceScore": currentBestRelevanceScore,
        "bestFrameMatch": currentBestFrameMatch,
        "bestFormIndex": currentBestFormIndex,
        "bestFindMatchesResult": currentBestFindMatchesResult
    };
};

// automated could be on page load or resulting from other non-user-interaction.
// It's still possible to fill and submit a login with a specific uniqueID but
// that process is now centered on the findMatches function. This function just
// takes the results of that (which may include a triple defining a
// specific login to fill and submit to a specific form in a specific frame)
var fillAndSubmit = function (automated, frameKey, formIndex, loginIndex)
{
    Logger.debug("fillAndSubmit started. automated: " + automated + ", frameKey: " + frameKey 
        + ", formIndex: " + formIndex + ", loginIndex: " + loginIndex);
    
    // We do some things differently if we're being manually asked to fill and
    // submit a specific matched login
    let isMatchedLoginRequest = !automated 
        && typeof(frameKey) != "undefined" 
        && typeof(formIndex) != "undefined" 
        && typeof(loginIndex) != "undefined";

    // If there is only one frame in this tab, we'll just use that
    let selectedFrame;
    let bestMatches;
    let matchResult;
    let mostRelevantFormIndex;

    if (content.frames.length == 0)
    {
        selectedFrame = content;
        frameKey = getFrameArrayKey(selectedFrame.document);
        matchResult = tabState.latestFindMatchesResults[frameKey];
        // Give up if we have no results for this frame (i.e. there were no forms to fill)
        if (!matchResult)
            return;
        mostRelevantFormIndex = getMostRelevantFormForFrame(selectedFrame).bestFormIndex;
    }

    // Check if we've been told to fill in a specific frame
    if (!selectedFrame && frameKey && frameKey.length > 0)
    {
        matchResult = tabState.latestFindMatchesResults[frameKey];
        // Give up if we have no results for this frame (i.e. there were no forms to fill)
        if (!matchResult)
            return;
        selectedFrame = getWindowFromFrameArrayKey(frameKey);
        mostRelevantFormIndex = getMostRelevantFormForFrame(selectedFrame).bestFormIndex;
    }

    // Do this for every frame until we find the best match (if any).
    if (!selectedFrame)
    {
        let bestMatch = getBestMatchForFrames(content);
        selectedFrame = bestMatch.bestFrameMatch;
        frameKey = getFrameArrayKey(selectedFrame.document);
        mostRelevantFormIndex = bestMatch.bestFormIndex;
        matchResult = bestMatch.bestFindMatchesResult;

        // Give up if we have no results for this frame (i.e. there were no forms to fill)
        if (!matchResult)
            return;
    }

    // Supplied formID overrides any that we just automatically calculated above
    if (formIndex >= 0)
        mostRelevantFormIndex = formIndex;

    // from now on we concentrate on just the most relevant form and the fields we found earlier
    var form = matchResult.forms[mostRelevantFormIndex];
    var passwordFields = matchResult.passwordFieldsArray[mostRelevantFormIndex];
    var usernameIndex = matchResult.usernameIndexArray[mostRelevantFormIndex];
    var otherFields = matchResult.otherFieldsArray[mostRelevantFormIndex];
    
    // this records the login that we eventually choose as the one to fill the chosen form with
    var matchingLogin = null;

    // If we started this fill/submit attempt from certain contexts, we will have
    // been told to ensure we do not perform auto-fill or submit and we'll instead
    // just tell the UI to notify the user about any matches we found. Although
    // we ignore this rule if the user initiated the fill/submit.
    matchResult.cannotAutoFillForm = false;
    matchResult.cannotAutoSubmitForm = false;

    if (automated && matchResult.autofillOnSuccess === false)
        matchResult.cannotAutoFillForm = true;
    if (automated && matchResult.autosubmitOnSuccess === false)
        matchResult.cannotAutoSubmitForm = true;

    // No point looking at login specific preferences if we are not allowed to auto-fill
    if (!matchResult.cannotAutoFillForm)
    {
        Logger.debug("We are allowed to auto-fill this form.");
        
        // If we've been instructed to fill a specific login, we need to select that
        // login and clear any previously set information about an auto-filled login
        // so it can be set correctly later
        if (loginIndex >= 0)
        {
            matchingLogin = matchResult.logins[mostRelevantFormIndex][loginIndex];
            matchResult.UUID = null;
            matchResult.dbFileName = null;
        }
        
        let checkMatchingLoginRelevanceThreshold = false;
        if (matchingLogin == null && matchResult.logins[mostRelevantFormIndex].length == 1) {
            matchingLogin = matchResult.logins[mostRelevantFormIndex][0];
            checkMatchingLoginRelevanceThreshold = true;
        } else if (matchResult.UUID != undefined && matchResult.UUID != null && matchResult.UUID != "") {
            // Skip the relevance tests if we have been told to use a specific UUID
            Logger.debug("We've been told to use a login with this UUID: " + matchResult.UUID);
            for (var count = 0; count < matchResult.logins[mostRelevantFormIndex].length; count++)
                if (matchResult.logins[mostRelevantFormIndex][count].uniqueID == matchResult.UUID)
                {
                    matchingLogin = matchResult.logins[mostRelevantFormIndex][count];
                    break;
                }
            if (matchingLogin == null)
                Logger.warn("Could not find the required KeePass entry. Maybe the website redirected you to a different domain or hostname?");
           
        } else if (matchingLogin == null) {
            Logger.debug("Multiple logins for form, so estimating most relevant.");
            var mostRelevantLoginIndex = 0;
            
            for (var count = 0; count < matchResult.logins[mostRelevantFormIndex].length; count++)
                if (matchResult.logins[mostRelevantFormIndex][count].relevanceScore > matchResult.logins[mostRelevantFormIndex][mostRelevantLoginIndex].relevanceScore)
                    mostRelevantLoginIndex = count;
                
            Logger.debug("We think login " + mostRelevantLoginIndex + " is most relevant.");
            matchingLogin = matchResult.logins[mostRelevantFormIndex][mostRelevantLoginIndex];
            
            // If user has specified, prevent automatic fill / submit due to multiple matches
            if (automated && !matchResult.wantToAutoFillFormWithMultipleMatches)
                matchResult.wantToAutoFillForm = false; //false by default
            //if (!matchResult.wantToAutoSubmitFormWithMultipleMatches)
            //    matchResult.wantToAutoSubmitForm = false; // wanttosubmtiforms will always be false for multiple matched entries

            checkMatchingLoginRelevanceThreshold = true;
        }

        if (checkMatchingLoginRelevanceThreshold && matchingLogin != null 
            && matchingLogin.relevanceScore < 1)
        {
            Logger.info("Our selected login is not relevant enough to exceed our threshold.");
            matchingLogin = null;
        }

        if (matchingLogin != null)
        {
            // record / update the info attached to this tab regarding
            // the number of pages of forms we want to fill in
            // NB: we do this even if we know this is a single form
            // submission becauase then if the user gets dumped
            // back to the form (password error?) then we know not
            // to auto-submit again (to avoid getting stuck in a loop)

            if (tabState.currentPage > tabState.maximumPage)
            {
                // I don't think this should ever happen because it's reset onFormSubmit
                // before this page has loaded.

                tabState.currentPage = 0;
                tabState.maximumPage = 0;
                tabState.forceAutoSubmit = null;
                matchResult.cannotAutoSubmitForm = true;
                Logger.info("Exceeded expected number of pages during this form-filling session. Not auto-submiting this form.");
            }
        
            // If the user manually requested this to be filled in or the current page is unknown
            if (!automated || tabState.currentPage <= 0)
            {
                var maximumPageCount = 1;
                for (var i = 0; i < matchingLogin.passwords.length; i++)
                {
                    var passField = matchingLogin.passwords[i];
                    if (passField.formFieldPage > maximumPageCount)
                        maximumPageCount = passField.formFieldPage;
                }
                for (var i = 0; i < matchingLogin.otherFields.length; i++)
                {
                    var otherField = matchingLogin.otherFields[i];
                    if (otherField.formFieldPage > maximumPageCount)
                        maximumPageCount = otherField.formFieldPage;
                }
                // always assume page 1 (very rare cases will go wrong - see github for relevant enhancement request) //TODO:1.6: #411
                // Possible regression since v1.4: We used to ignore currentPage entirely for the first
                // page of a submission, now we might try to give preference to page 1 fields (though total
                // relevance score shouldn't be shifted by enough to affect otherwise well-matched fields)
                tabState.currentPage = 1;
                tabState.maximumPage = maximumPageCount;
                Logger.debug("currentPage is: " + tabState.currentPage);
                Logger.debug("maximumPage is: " + tabState.maximumPage);
            }

            // Make sure that the state of this tab is reset after a short time ready 
            // for the next website's login form
            if (resetFormFillTimer)
                clearTimeout(resetFormFillTimer);
            resetFormFillTimer = setTimeout(resetFormFillSession, KFExtension.prefs.getValue("resetFormFillTimeout", 60) * 1000);

            // update fill and submit preferences from per-entry configuration options
            if (matchingLogin.alwaysAutoFill)
                matchResult.wantToAutoFillForm = true;
            if (matchingLogin.neverAutoFill)
                matchResult.wantToAutoFillForm = false;
            if (matchingLogin.alwaysAutoSubmit)
                matchResult.wantToAutoSubmitForm = true;
            if (matchingLogin.neverAutoSubmit)
                matchResult.wantToAutoSubmitForm = false;

            // If this is a matched login request from the user, we ignore the per-entry
            // configuration options...
            if (isMatchedLoginRequest)
            {
                matchResult.wantToAutoFillForm = true;
                //... but we only autosubmit if this is the first time we've been through this
                // process (i.e. don't autosubmit if we've hit this page later in our tab's
                // lifetime or via history navigation)
                if (tabState.userRecentlyDemandedAutoSubmit)
                    matchResult.wantToAutoSubmitForm = KFExtension.prefs.getValue("autoSubmitMatchedForms", true);
            }
            
            if (matchResult.wantToAutoFillForm || matchResult.mustAutoFillForm)
            {
                Logger.debug("Going to auto-fill a form");
                let lastFilledPasswords = _fillManyFormFields(passwordFields, matchingLogin.passwords,
                    tabState.currentPage, matchResult.overWriteFieldsAutomatically || !automated);
                let lastFilledOther = _fillManyFormFields(otherFields, matchingLogin.otherFields,
                    tabState.currentPage, matchResult.overWriteFieldsAutomatically || !automated);
                tabState.lastFilledFields = lastFilledPasswords.concat(lastFilledOther);
                matchResult.formReadyForSubmit = true;
            }            
        }
    }

    // We only do this if any forms were auto-filled successfully
    if (matchResult.formReadyForSubmit)
    {
        // if we didn't already define a uniqueID, we set it up now
        if (matchResult.UUID == undefined || matchResult.UUID == null || matchResult.UUID == "")
        {
            Logger.debug("Syncing UUID to: " + matchingLogin.uniqueID);
            matchResult.UUID = matchingLogin.uniqueID;
            matchResult.dbFileName = matchingLogin.database.fileName;
        }
    }
    
    // If this form fill is the non-final page of a multi-page login process we record the
    // UUID and dbFilename. We also enable auto-submit in some circumstances
    if (matchResult.UUID != undefined && matchResult.UUID != null && matchResult.UUID != "")
    {
        if (tabState.currentPage > 0 && tabState.currentPage < tabState.maximumPage)
        {
            if (matchResult.UUID)
            {
                Logger.debug("Setting UUID to: " + matchResult.UUID);
                tabState.UUID = matchResult.UUID;
            }
            if (matchResult.dbFileName)
            {
                Logger.debug("Setting dbFileName to: " + matchResult.dbFileName);
                tabState.dbFileName = matchResult.dbFileName;
            }

            // We force auto submit for all multi-page logins that have been triggered
            // by a one-click or matched login user selection, provided that operation
            // has not already been marked complete by the onFormSubmitHandler in formsSaveTab.js
            if (tabState.userRecentlyDemandedAutoSubmit)
            {
                tabState.forceAutoSubmit = true;
                Logger.debug("Set forceAutoSubmit to: true");
            }
        }
    }
    
    if (!matchResult.cannotAutoSubmitForm && (matchResult.wantToAutoSubmitForm || matchResult.mustAutoSubmitForm)
        && matchResult.formReadyForSubmit)
    {
        Logger.info("Auto-submitting form...");
        if (automated)
            metricsManager.pushEvent ("feature", "AutoSubmit");
        else
            metricsManager.pushEvent ("feature", "ManualSubmit"); // Called "MatchedFill" previously (yes, I'm an idiot)
        submitForm(form);
    } else if (isMatchedLoginRequest)
    {
        Logger.debug("Matched login request is not being auto-submitted.");
    } else 
    {
        Logger.debug("Combining login results from all frames.");

        // We could consider deduplicating the results of the search here so we can
        // deal with situations where the same login could be submitted to forms 
        // in more than one frame. The code below might be useful if we want to do 
        // this but I think we need to wait for real-world requirements before deciding 
        // if this is the right approach. Another alternative is to somehow label 
        // the logins with the frame information so the user can choose which one 
        // they want to fill in. Or we could just do nothing if this kind of scenario 
        // comes up only very rarely.
        //var newUniqueLogins = matchResult.logins[i].filter(function(d) {
        //    return (matchResult.allMatchingLogins.every(function(e) {
        //        return (d.uniqueid != e.uniqueid);
        //    }));
        //});

        let matchingLoginsFromAllFrames = [];

        for (var prop in tabState.latestFindMatchesResults)
        {
            if (!prop.startsWith("top"))
                continue;
            let nextLogins = tabState.latestFindMatchesResults[prop].allMatchingLogins;
            matchingLoginsFromAllFrames = matchingLoginsFromAllFrames.concat(nextLogins);
        }

        if (matchingLoginsFromAllFrames.length > 0)
        {
            if (automated)
            {
                Logger.info("Using mainUI password fill.");
                // Notify all parts of the UI that might need to be updated with new matched logins data
                sendAsyncMessage("keefox:matchedLoginsChanged", { 
                    "logins": matchingLoginsFromAllFrames, 
                    "notifyUserOnSuccess": matchResult.notifyUserOnSuccess
                });
                metricsManager.pushEvent ("feature", "AutoFill");
            } else
            {
                metricsManager.pushEvent ("feature", "ManualFill"); // Called "MatchedSubmit" previously (yes, I'm an idiot)
            }
        } else 
        {
            Logger.info("Nothing to fill.");
        }
    }
};

var _fillAllFrames = function (window, initialPageLoad)
{
    Logger.debug("_fillAllFrames start");
    this._fillDocument(window.document,false);
    
    if (window.frames.length > 0)
    {
        Logger.debug("Filling " + window.frames.length + " sub frames");
        var frames = window.frames;
        for (var i = 0; i < frames.length; i++)
          this._fillAllFrames (frames[i], initialPageLoad);
    }    
};

var _findDocumentByURI = function (window, URI)
{
    if (window.frames.length > 0)
    {
        Logger.debug("Searching through " + window.frames.length + " sub frames");
        var frames = window.frames;
        for (var i = 0; i < frames.length; i++)
        { 
            var subResult = this._findDocumentByURI (frames[i], URI);
            if ( subResult != null)
                return subResult;
        }
    }
    
    if (window.document.documentURI == URI)
        return window.document;
    else
        return null;
};

// Submit a form
var submitForm = function (form)
{
    // Priority 1: button within form provided: @type != reset
    // Priority 1: button outside form with @form attribute provided: @type != reset
    // Priority 2: input @type=submit within form
    // Priority 3: input @type=image within form
    // Priority 4: <any element>@role=button within form provided: there is only 1 match
    // Priority 5: <any element>@role=button outside form provided: there is only 1 match

    // Priority 1-3 can all be prioritised over each other if the element in question matches
    // a goodWord or deprioritised if it matches a badWord (images can only be affected
    // indirectly due to deprioritisation of other possibilities) but all things equal, they will
    // follow the stated priority.
    
    var goodWords = ["submit","login","enter","log in","signin","sign in"]; //TODO:2: other languages
    var badWords = ["reset","cancel","back","abort","undo","exit","empty","clear"]; //TODO:2: other languages

    let buttonElements = form.ownerDocument.getElementsByTagName("button");
    var inputElements = form.getElementsByTagName("input");
    let roleElementsForm = form.querySelectorAll("[role=button]");
    let roleElementsDoc = form.ownerDocument.querySelectorAll("[role=button]");
    var submitElement = null;
    var submitElements = [];
    
    // Rank the buttons
    for(let i = 0; i < buttonElements.length; i++)
    {
        if(!buttonElements[i].type || buttonElements[i].type != "reset")
        {
            var score = 0;
            if (buttonElements[i].form && buttonElements[i].form == form)
                score = 6;
            else
                continue;

            if (buttonElements[i].name !== undefined && buttonElements[i].name !== null)
            {
                for (let gw in goodWords)
                    if(buttonElements[i].name.toLowerCase().indexOf(goodWords[gw]) >= 0)
                        score += 5;
                for (let bw in badWords)
                    if(buttonElements[i].name.toLowerCase().indexOf(badWords[bw]) >= 0)
                        score -= 5;
            }

            //TODO:2: compare values and/or textcontent?

            submitElements.push({'score':score, 'el': buttonElements[i]});
        }
    }

    // Rank the input buttons
    for(let i = 0; i < inputElements.length; i++)
	{
		if(inputElements[i].type != null && inputElements[i].type == "submit")
		{
            var score = 4;
            if (inputElements[i].name !== undefined && inputElements[i].name !== null)
            {
                for (let gw in goodWords)
                    if(inputElements[i].name.toLowerCase().indexOf(goodWords[gw]) >= 0)
                        score += 5;
                for (let bw in badWords)
                    if(inputElements[i].name.toLowerCase().indexOf(badWords[bw]) >= 0)
                        score -= 5;
            }

            // Names are more important but sometimes they don't exist or are random
            // so check what is actually displayed to the user
            if (inputElements[i].value !== undefined && inputElements[i].value !== null)
            {
                for (let gw in goodWords)
                    if(inputElements[i].value.toLowerCase().indexOf(goodWords[gw]) >= 0)
                        score += 4;
                for (let bw in badWords)
                    if(inputElements[i].value.toLowerCase().indexOf(badWords[bw]) >= 0)
                        score -= 4;
            }
			submitElements.push({'score':score, 'el': inputElements[i]});
		} else if(inputElements[i].type != null && inputElements[i].type == "image")
		{
		    submitElements.push({'score': 3, 'el': inputElements[i]});
		}
    }

    if (roleElementsForm.length == 1)
        submitElements.push({'score': 2, 'el': roleElementsForm[0]});
    if (roleElementsDoc.length == 1)
        submitElements.push({'score': 1, 'el': roleElementsDoc[0]});

    // Find the best submit button   
    var largestScore = 0; 
    for(let j = 0; j < submitElements.length; j++)
	{
		if(submitElements[j].score > largestScore)
		{
			submitElement = submitElements[j].el;
			largestScore = submitElements[j].score;
	    }
	}
    //TODO:2: more accurate searching of submit buttons, etc. to avoid password resets if possible
    // maybe special cases for common HTML output patterns (e.g. javascript-only ASP.NET forms)
        
    // Remember that it was KeeFox which initiated this form submission so we can
    // avoid searching for matching passwords upon submission
    tabState.KeeFoxTriggeredThePendingFormSubmission = true;

    // If we've found a button to click, use that; if not, just submit the form.  
    if(submitElement != null)
    {
        Logger.debug("Submiting using element: " + submitElement.name + ": " + submitElement.id);
		submitElement.click();
    }
    else
    {
        Logger.debug("Submiting using form");
		form.submit();
    }
		
		//TODO:2: maybe something like this might be useful? Dunno why a click()
		// above wouldn't be sufficient but maybe some custom event raising might be handy...
		/*
		function simulateClick() {
  var evt = document.createEvent("MouseEvents");
  evt.initMouseEvent("click", true, true, window,
    0, 0, 0, 0, 0, false, false, false, false, 0, null);
  var cb = document.getElementById("checkbox"); 
  var canceled = !cb.dispatchEvent(evt);
  if(canceled) {
    // A handler called preventDefault
    alert("canceled");
  } else {
    // None of the handlers called preventDefault
    alert("not canceled");
  }
}
*/
};

var calculateRelevanceScore = function (login, form,
    usernameIndex, passwordFields, currentPage, otherFields) {
    
    let score = 0;

    // entry priorities provide a large score such that no other combination of relevance
    // can override them but there will still be differences in relevance for the same
    // entry when compared against different forms
    if (login.priority > 0)
        score = 1000000000 - login.priority * 1000;

    // KeeFox 1.5+ no longer considers action URLs in relevance weighting. Since the only
    // login entries of interest are already pre-matched by KeePass, this should have been
    // adding negligable accuracy to the form matching.
    
    // New values will be a little different (e.g. 50 vs 42 for an exact URL
    // match) but that shouldn't be a problem.
    score += login.matchAccuracy;
    
    // This is similar to _fillManyFormFields so might be able to reuse the results in future
    // (but need to watch for changes that invalidate the earlier calculations).
    let totalRelevanceScore = 0;

    for (var i = 0; i < otherFields.length; i++)
    {
        let mostRelevantScore = 0;
        for (var j = 0; j < login.otherFields.length; j++)
        {
            let score = this._calculateFieldMatchScore(
                otherFields[i],login.otherFields[j],currentPage,true);
            Logger.debug("Suitablility of putting other field "+j+" into form field "+i
                +" (id: "+otherFields[i].fieldId + ") is " + score);
            if (score > mostRelevantScore)
                mostRelevantScore = score;
        }
        totalRelevanceScore += mostRelevantScore;
    }
    for (var i = 0; i < passwordFields.length; i++)
    {
        let mostRelevantScore = 0;
        for (var j = 0; j < login.passwords.length; j++)
        {
            let score = this._calculateFieldMatchScore(
                passwordFields[i],login.passwords[j],currentPage,true);
            Logger.debug("Suitablility of putting password field "+j+" into form field "+i
                +" (id: "+passwordFields[i].fieldId + ") is " + score);
            if (score > mostRelevantScore)
                mostRelevantScore = score;
        }
        totalRelevanceScore += mostRelevantScore;
    }

    let formFieldCount = passwordFields.length + otherFields.length;
    let loginFieldCount = login.passwords.length + login.otherFields.length;
    let averageFieldRelevance = totalRelevanceScore / Math.max(formFieldCount, loginFieldCount);
    let adjustedRelevance = averageFieldRelevance / (Math.abs(formFieldCount - loginFieldCount) + 1);

    score += adjustedRelevance;

    Logger.info("Relevance for " + login.uniqueID + " is: " + score);
    return score;
};

// Return a property/array key of form top_x_y_z which describes where in the window
// hierachy a particular window/document sits
var getFrameArrayKey = function (doc)
{
    let parentWin = doc.defaultView.parent;
    
    // Stop at the top level
    if (parentWin === doc.defaultView)
        return "top";

    // Find the index of this doc in the parent window and recurse further towards 
    // top of the hierachy
    for (let i=0; i<parentWin.frames.length; i++)
    {
        if (parentWin.frames[i].document === doc)
            return getFrameArrayKey(parentWin.document) + "_" + i;
    }
};

var getWindowFromFrameArrayKey = function (fak)
{
    if (fak == "top")
        return content;

    let indexes = fak.split('_');
    let win = content;
    let i = 1; // skip "top"

    while (typeof(indexes[i]) !== 'undefined')
    {
        win = win.frames[indexes[i]];
        i++;
    }
    return win;
};
