"use strict";
exports.__esModule = true;
var config_1 = require("../../config");
var fetchPageContent_1 = require("../fetchPageContent");
var ExtractorAbstract = /** @class */ (function () {
    function ExtractorAbstract() {
        var _this = this;
        /**
        * Return a list of Source URLs from Google Search's result
        */
        this.extractURLFromKeyword = function (keyword) {
            return new Promise(function (resolve, reject) {
                (0, fetchPageContent_1.fetchPageTextContent)((0, config_1.getSearchURL)(_this.URL, keyword))
                    .then(function (rs) {
                    var regex = new RegExp("(https://" + _this.URL + "/[a-z0-9-/]+)", "gi");
                    var urls = rs.textContent.match(regex);
                    urls && (urls = urls.filter(function (url, i, list) { return list.indexOf(url) === i; }));
                    resolve(urls || []);
                })["catch"](reject);
            });
        };
    }
    ExtractorAbstract.prototype.isEnabled = function () {
        var config = (0, config_1.getConfig)();
        return this.URL in config.settings.sites && config.settings.sites[this.URL];
    };
    return ExtractorAbstract;
}());
exports["default"] = ExtractorAbstract;
