/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  The SearchFilter allows adding filtering functionality (e.g. by URL) to a search box.

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

keefox_win.SearchFilter = {
    attachFilterToSearchBox: function (searchBox, searchRequestor, currentURIs) {
        let inMainPanel = false;
        if (searchBox.getAttribute("id") == "KeeFox-PanelSection-searchbox")
            inMainPanel = true;

        let doc = searchBox.ownerDocument;
        let prefix = "SaveLogin";
        if (inMainPanel)
            prefix = "PanelSection";

        let searchFilter = this.createUIElement(doc, 'select', [
            ['class', 'KeeFox-Search-Filter'],
            ['id', 'KeeFox-' + prefix + '-searchfilter'],
            ['disabled', 'true']
        ]);
        let searchFilterOptionAll = this.createUIElement(doc, 'option', [
            ['class', 'KeeFox-Search-Filter'],
            ['value', ''],
            ['id', 'KeeFox-'+prefix+'-searchfilter-all']
        ]);
        searchFilterOptionAll.textContent = keefox_org.locale.$STR('all-websites');
        let searchFilterOptionCurrent = this.createUIElement(doc, 'option', [
            ['class', 'KeeFox-Search-Filter'],
            ['value', ''],
            ['id', 'KeeFox-'+prefix+'-searchfilter-current']
        ]);
        searchFilterOptionCurrent.textContent = keefox_org.locale.$STR('current-website');

        if (inMainPanel)
            searchFilterOptionAll.setAttribute("selected", "true");
        else
            searchFilterOptionCurrent.setAttribute("selected", "true");

        if (!inMainPanel)
            this.updateSearchFilterStart(searchFilter, searchFilterOptionCurrent, currentURIs[0]);

        searchFilter.appendChild(searchFilterOptionAll);
        searchFilter.appendChild(searchFilterOptionCurrent);
        let searchFilterChangeHandler = function (e) {
            keefox_org.search.execute(e.target.ownerDocument.getElementById('KeeFox-'+prefix+'-searchbox').value,
                searchRequestor.onSearchComplete.bind(searchRequestor),
                e.target.selectedOptions[0].value.split(','));
            e.target.ownerDocument.getElementById('KeeFox-'+prefix+'-searchbox').focus();
        };
        searchFilter.addEventListener("change", searchFilterChangeHandler.bind(this), false);

        let searchFields = this.createUIElement(doc, 'hbox', [
            ['class', 'keefox-searchFields']
        ], true);
        searchFields.appendChild(searchBox);
        searchFields.appendChild(searchFilter);

        return searchFields;
    },


    updateSearchFilterStart: function (searchFilter, current, currentURL) {
        let doc = searchFilter.ownerDocument;

        // If we've been given a URI we use only that one, otherwise we ask the content
        // document to provide a list of all URLs at some future time
        if (currentURL) {
            try {
                let eTLDService = Cc["@mozilla.org/network/effective-tld-service;1"].
                                    getService(Ci.nsIEffectiveTLDService);
                let basedomain = eTLDService.getBaseDomain(currentURL);
                let domains = [basedomain];
                this.updateSearchFilterFinish(searchFilter, current, domains);
            } catch (e) {
                if (e.name == "NS_ERROR_HOST_IS_IP_ADDRESS")
                    this.updateSearchFilterFinish(searchFilter, current, [currentURL.hostPort]);
                else
                    searchFilter.setAttribute("disabled", "true");
            }
        } else {
            let callbackName = "keefox:";
            try {
                let uuidGenerator = Cc["@mozilla.org/uuid-generator;1"]
                    .getService(Ci.nsIUUIDGenerator);
                let uuid = uuidGenerator.generateUUID();
                callbackName += uuid.toString();
            } catch (e) {
                // Fall back to something a little less unique
                callbackName += Math.random();
            }
            let messageManager = gBrowser.selectedBrowser.messageManager;
            let myCallback = function (message) {
                messageManager.removeMessageListener(callbackName, myCallback);
                this.updateSearchFilterFinish(searchFilter, current, message.data.domains);
            }.bind(this);
            messageManager.addMessageListener(callbackName, myCallback);
            messageManager.sendAsyncMessage("keefox:getAllFrameDomains", { callbackName: callbackName });
        }
    },

    updateSearchFilterFinish: function (searchFilter, current, domains) {

        if (domains && domains.length > 0) {
            searchFilter.removeAttribute("disabled");
            searchFilter.selectedIndex = 0;
            let currentUrls = domains.join(',');

            current.setAttribute("value", currentUrls);
        } else {
            searchFilter.setAttribute("disabled", "true");
        }
    },

    createUIElement: function (doc, tag, attrs, xul)
    {
        let elem;
        if (xul)
            elem = doc.createElement(tag);
        else
            elem = doc.createElementNS('http://www.w3.org/1999/xhtml', tag);
        for (let i=0; i<attrs.length; i++)
            elem.setAttribute(attrs[i][0], attrs[i][1]);
        return elem;
    },

    getFilterState: function (doc, prefix)
    {
        if (doc.getElementById('KeeFox-' + prefix + '-searchfilter').selectedOptions[0].id == "KeeFox-"+prefix+"-searchfilter-all")
            return "all";
        else
            return "current";
    }
};
