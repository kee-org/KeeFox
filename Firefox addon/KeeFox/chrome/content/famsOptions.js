/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2008-2011 Chris Tomlinson <keefox@christomlinson.name>

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

Components.utils.import("resource://kfmod/FAMS.js");

var FAMS = null;
var config = null;

var prefService =  
        Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
var prefBranch = prefService.getBranch("extensions.fams@chris.tomlinson.");

function stop() {
    var container = window.document.getElementById("msgGroupContainer");
    while(container.hasChildNodes()){
        container.removeChild(container.firstChild);
      }
}

function getQS () {
    var a = window.location.href.split("?")[1].split("&");
    var o = {};
    a.forEach(function(e) {
      o[e.split("=")[0]] = e.split("=")[1];
    });
    return o;
}

function onLoad()
{
    var o = getQS();
    var id = o['famsConfigId'];
    FAMS = keeFoxGetFamsInst(id,
    FirefoxAddonMessageService.defaultConfiguration, null); // this shouldn't be the first instance of this singleton becuase this is in an options window

    //FAMS.initConfig(id,FAMS.defaultConfiguration); // for now, the default FAMS config is the default KeeFox config, in future need to pass it in to this function
    // we don't init this time cos we just want to use some of the utility methods
    //FAMS.configuration = FAMS.getConfiguration();
    config = JSON.parse(JSON.stringify(FAMS.configuration)); //TODO: less hacky clone
    window.title = FAMS.getLocalisedString("Options.title");
    go();
}

function go() {
    var container = window.document.getElementById("msgGroupContainer");

    renderAllMessageGroups();

    // Create the reset config button
    var resetConfigButton = window.document.createElement("button");
    resetConfigButton.setAttribute("label",FAMS.getLocalisedString("Reset-Configuration.label"));
    var resetConfigWarningMessage = FAMS.getLocalisedString("Reset-Configuration.confirm", config.name, config.name);
    resetConfigButton.addEventListener("command", function (event) { if (window.confirm(resetConfigWarningMessage)) { resetConfiguration(config.name); } }, false);    
    resetConfigButton.setAttribute("style", "width: 200px;");
    resetConfigButton.setAttribute("width","200px");
    resetConfigButton.setAttribute("class","resetConfigButton");
    resetConfigButton.setAttribute("icon","clear");
    container.appendChild(resetConfigButton);
    
    // set the correct size for the dialog now that it's fully populated
    window.sizeToContent();
    var newHeight = Math.min(Math.floor(screen.availHeight-100),container.boxObject.height);
    container.height = newHeight;
    //window.alert(newHeight);
    window.sizeToContent();
}

function renderAllMessageGroups()
{
    var msgGroupContainer = window.document.getElementById("msgGroupContainer");
    var famsDescription = window.document.createElement("description");    
    famsDescription.textContent = config.description;    
    msgGroupContainer.appendChild(famsDescription);
    
    //TODO2: Enable downloads for urgent security notifications
    //renderDownloadOptions();

    for (var i=0; i<config.messageGroups.length; i++)
    {
        renderMessageGroup(i);
    }
}


function renderDownloadOptions()
{
    var msgGroupContainer = window.document.getElementById("msgGroupContainer");
    var downloadSliderComplete = window.document.createElement("hbox");
    var downloadLabelExplanation = window.document.createElement("label");
    var downloadLabelNote = window.document.createElement("description");
    var downloadSlider = window.document.createElement("scale");
    var downloadLabel = window.document.createElement("label");

    downloadLabelExplanation.setAttribute("value", FAMS.getLocalisedString("Options-Download-Freq.label"));
    downloadLabelNote.textContent = FAMS.getLocalisedString("Options-Download-Freq.desc", config.name);

    downloadLabel.setAttribute("value", config.timeBetweenDownloadingMessages / FAMS.timeFactorDownload); //TODO2: be clever RE the time units we display to the user
    downloadLabel.setAttribute("id","downloadSliderLabel");   
    
    downloadSlider.setAttribute("min", config.minTimeBetweenDownloadingMessages / FAMS.timeFactorDownload);
    downloadSlider.setAttribute("max", config.maxTimeBetweenDownloadingMessages / FAMS.timeFactorDownload);
    downloadSlider.setAttribute("value", config.timeBetweenDownloadingMessages / FAMS.timeFactorDownload);
    downloadSlider.setAttribute("style","width:250px;");     
    downloadSlider.addEventListener("change", function (event) { onDownloadFreqChange(this.value, 'downloadSliderLabel'); }, false);   

    downloadLabelNote.setAttribute("class","FAMSnote");
    downloadLabelExplanation.setAttribute("class","FAMStitle");

    downloadSliderComplete.appendChild(downloadSlider);
    downloadSliderComplete.appendChild(downloadLabel);
    
    msgGroupContainer.appendChild(downloadLabelExplanation);
    msgGroupContainer.appendChild(downloadLabelNote);
    msgGroupContainer.appendChild(downloadSliderComplete);    
}

function renderMessageGroup(msgGroupIndex)
{
    var msgGroup = config.messageGroups[msgGroupIndex];
    var msgGroupContainer = window.document.getElementById("msgGroupContainer");

    var singleMsgGroupContainer = window.document.createElement("vbox");
    var desc = window.document.createElement("description");
    var appearanceLabelNote = window.document.createElement("description");
    var enabledCheckbox = window.document.createElement("checkbox");
    var appearanceSliderComplete = window.document.createElement("hbox");
    var appearanceLabelExplanation = window.document.createElement("label");
    var appearanceSlider = window.document.createElement("scale");
    var appearanceLabel = window.document.createElement("label");
    //var seeAllButton = window.document.createElement("button");
    desc.textContent = msgGroup.description;

    var disabled = !msgGroup.userEditable;
    enabledCheckbox.setAttribute("disabled",disabled);
    desc.setAttribute("disabled",disabled);
    appearanceSlider.setAttribute("disabled",disabled);
    //seeAllButton.setAttribute("disabled",disabled);

    // set style information
    if (disabled)
    {
        desc.setAttribute("class","FAMSdisabled FAMSnote");
        appearanceLabel.setAttribute("class","FAMSdisabled");
        appearanceLabelExplanation.setAttribute("class","FAMSdisabled FAMStitle");
        singleMsgGroupContainer.setAttribute("class","FAMSdisabled FAMSmessageGroup");
        appearanceLabelNote.setAttribute("class","FAMSdisabled FAMSnote");
    } else
    {
        desc.setAttribute("class","FAMSnote");
        appearanceLabelExplanation.setAttribute("class","FAMStitle");
        singleMsgGroupContainer.setAttribute("class","FAMSmessageGroup");
        appearanceLabelNote.setAttribute("class","FAMSnote");
    }
    enabledCheckbox.setAttribute("class","FAMScheckLabelControl");

    if (config.knownMessageGroups.indexOf(msgGroup.id) >= 0)
        enabledCheckbox.setAttribute("checked",true);

    enabledCheckbox.setAttribute("label", FAMS.getLocalisedString("Options-Show-Message-Group", config.name, msgGroup.name));
    enabledCheckbox.addEventListener("command", function (event) { onMessageGroupEnableChange(this.id.substr(31, 1), this.checked); }, false);
    enabledCheckbox.setAttribute("id", "enabledCheckboxForMessageGroup_" + msgGroupIndex);




    appearanceLabelExplanation.setAttribute("value", FAMS.getLocalisedString("Options-Max-Message-Group-Freq"));
    appearanceLabelNote.textContent = FAMS.getLocalisedString("Options-Max-Message-Group-Freq-Explanation", config.name);

    appearanceSlider.setAttribute("min", msgGroup.minTimeBetweenMessages / FAMS.timeFactorDisplay);
    appearanceSlider.setAttribute("max", msgGroup.maxTimeBetweenMessages / FAMS.timeFactorDisplay);
    appearanceSlider.setAttribute("value", msgGroup.timeBetweenMessages / FAMS.timeFactorDisplay);
    appearanceSlider.setAttribute("id","appearanceSliderForMessageGroup_" + msgGroupIndex);
    appearanceSlider.addEventListener("change", function (event) { onMessageGroupAppearanceFreqChange(this.id.substr(32, 1), this.value); }, false); //TODO2: Support more than 10 message groups... but surely this UI won't be useable with that number anyway?!
    appearanceSlider.setAttribute("style", "width:250px;");

    appearanceLabel.setAttribute("value", msgGroup.timeBetweenMessages / FAMS.timeFactorDisplay);
    appearanceLabel.setAttribute("id","appearanceLabelForMessageGroup_" + msgGroupIndex);

    appearanceSliderComplete.appendChild(appearanceSlider);
    appearanceSliderComplete.appendChild(appearanceLabel);

    //TODO2: support viewing all messages
    //seeAllButton.setAttribute("style","width:100px;");
    //seeAllButton.setAttribute("value","See all");


    singleMsgGroupContainer.appendChild(enabledCheckbox);
    singleMsgGroupContainer.appendChild(desc);
    singleMsgGroupContainer.appendChild(appearanceLabelExplanation);
    singleMsgGroupContainer.appendChild(appearanceLabelNote);
    singleMsgGroupContainer.appendChild(appearanceSliderComplete);
    //singleMsgGroupContainer.appendChild(seeAllButton);

    msgGroupContainer.setAttribute("style","width:300px;");
    msgGroupContainer.appendChild(singleMsgGroupContainer);
}

function onDownloadFreqChange(freq, id)
{
    config.timeBetweenDownloadingMessages = freq * FAMS.timeFactorDownload;
    var container = window.document.getElementById(id);
    container.setAttribute("value",freq);
}

function onMessageGroupAppearanceFreqChange(msgGroupIndex, freq)
{
    config.messageGroups[msgGroupIndex].timeBetweenMessages = freq * FAMS.timeFactorDisplay;
    var container = window.document.getElementById('appearanceLabelForMessageGroup_'+msgGroupIndex);
    container.setAttribute("value",freq);
}

function onMessageGroupEnableChange(msgGroupIndex, enabled)
{
    var kgs = config.knownMessageGroups;//.split(',');
    for (var i = 0; i < kgs.length; i++)
    {
        if (kgs[i] == config.messageGroups[msgGroupIndex].id)
        {
            if (enabled)
            {
                return; // already enabled, nothing to do
            } else
            {
                kgs.splice(i,1);
                break; // found what we were looking for and it's gone now
            }
        }            
    }
    if (enabled)
        kgs.splice(kgs.length,0,config.messageGroups[msgGroupIndex].id);

    config.knownMessageGroups = kgs;//.join();
}

function resetConfiguration()
{
    config = FAMS.defaultConfiguration;
    stop();
    go();
}