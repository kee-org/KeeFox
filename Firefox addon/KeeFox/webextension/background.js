browser.storage.local.get("keefoxConfigPage0")
  .then(results => {
      if (!results["keefoxConfigPage0"]) {
          console.log("KeeFox configuration not converted yet. If you continue seeing this message, seek help or you may lose your settings when KeeFox 2.0 is released towards the end of 2017. http://keefox.org/help")
      }
  });

var port = browser.runtime.connect({ name: "connection-to-legacy" });

port.onMessage.addListener(function (message) {
    configManager.set(message);
});

/*
  We'll just save the whole config object on the rare occassions something interesting changes.
  If that is too slow we can spend time developing something more complex.
*/

var Config = (function () {
    function Config() {
    }
    return Config;
}());
var ConfigManager = (function () {
    function ConfigManager() {
        this.maxCharsPerPage = 10000;
    }
    ConfigManager.prototype.set = function (fullConfig) {
        this.current = fullConfig;
        this.save();
    };
    ConfigManager.prototype.splitStringToPages = function (str) {
        var numPages = Math.ceil(str.length / this.maxCharsPerPage);
        var pages = new Array(numPages);
        for (var i = 0, o = 0; i < numPages; ++i, o += this.maxCharsPerPage) {
            pages[i] = str.substr(o, this.maxCharsPerPage);
        }
        return pages;
    };
    ConfigManager.prototype.save = function () {
        var configString = JSON.stringify(this.current);
        var pages = this.splitStringToPages(configString);
        browser.storage.local.set({ "keefoxConfigPageCount": pages.length });
        for (var i = 0; i < pages.length; i++) {
            browser.storage.local.set((_a = {}, _a["keefoxConfigPage" + i] = pages[i], _a));
        }
        var _a;
    };
    return ConfigManager;
}());
// initialise the configuration
var configManager = new ConfigManager();
