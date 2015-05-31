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
            ['id', 'KeeFox-'+prefix+'-searchfilter']
        ]);
        let searchFilterOptionAll = this.createUIElement(doc, 'option', [
            ['class', 'KeeFox-Search-Filter'],
            ['value', ''],
            ['id', 'KeeFox-'+prefix+'-searchfilter-all']
        ]);
        searchFilterOptionAll.textContent = keefox_org.locale.$STR('all-websites');
        let searchFilterOptionCurrent = this.createUIElement(doc, 'option', [
            ['class', 'KeeFox-Search-Filter'],
            ['value', 'keefox.org'],
            ['id', 'KeeFox-'+prefix+'-searchfilter-current']
        ]);
        searchFilterOptionCurrent.textContent = keefox_org.locale.$STR('current-website');

        if (inMainPanel)
            searchFilterOptionAll.setAttribute("selected", "true");
        else
            searchFilterOptionCurrent.setAttribute("selected", "true");

        if (!inMainPanel)
            this.updateSearchFilter(searchFilter, searchFilterOptionCurrent, currentURIs[0]);

        searchFilter.appendChild(searchFilterOptionAll);
        searchFilter.appendChild(searchFilterOptionCurrent);
        let searchFilterChangeHandler = function (e) {
            keefox_org.search.execute(e.target.ownerDocument.getElementById('KeeFox-'+prefix+'-searchbox').value,
                searchRequestor.onSearchComplete.bind(searchRequestor),
                e.target.selectedOptions[0].value.split(','));
        };
        searchFilter.addEventListener("change", searchFilterChangeHandler.bind(this), false);

        let searchFields = this.createUIElement(doc, 'hbox', [
            ['class', 'keefox-searchFields']
        ], true);
        searchFields.appendChild(searchBox);
        searchFields.appendChild(searchFilter);

        return searchFields;
    },


    updateSearchFilter: function (searchFilter, current, currentURL) {
        //TODO:1.5: Inspect URLs from subframes too (+ deduplicate domains)
        let doc = searchFilter.ownerDocument;

        searchFilter.removeAttribute("disabled");
        searchFilter.selectedIndex = 0;
        currentURL = currentURL || gBrowser.currentURI;

        try {
            let eTLDService = Cc["@mozilla.org/network/effective-tld-service;1"].
                                getService(Ci.nsIEffectiveTLDService);
            let basedomain = eTLDService.getBaseDomain(currentURL);
            let currentUrls = [basedomain];
            current.setAttribute("value", currentUrls);
        } catch (e) {
            if (e.name == "NS_ERROR_HOST_IS_IP_ADDRESS")
                current.setAttribute("value", currentURL.hostPort);
            else
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
    }
};
