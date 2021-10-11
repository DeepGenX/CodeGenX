"use strict";
exports.__esModule = true;
exports.getConfig = exports.getSearchURL = void 0;
var vscode = require("vscode");
var CSConfig = {
    SEARCH_PATTERN: /(\/\/|#|--|<!--)\s?find\s?(.+)\s?(\.|-->)/
};
function getSearchURL(site, keyword) {
    return "https://www.google.com/search?q=site%3A" + site + "+" + keyword.replace(/\s/g, "+");
}
exports.getSearchURL = getSearchURL;
function getConfig() {
    var sites = {
        "stackoverflow.com": true,
        "gist.github.com": true
    };
    return {
        settings: {
            sites: sites,
            maxResults: 6
        }
    };
}
exports.getConfig = getConfig;
exports["default"] = CSConfig;
