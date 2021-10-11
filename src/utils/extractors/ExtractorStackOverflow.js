"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var ExtractorAbstract_1 = require("./ExtractorAbstract");
var linkedom_1 = require("linkedom");
var utils_1 = require("./utils");
var ExtractorStackOverflow = /** @class */ (function (_super) {
    __extends(ExtractorStackOverflow, _super);
    function ExtractorStackOverflow() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "Stackoverflow";
        _this.URL = "stackoverflow.com";
        _this.extractSnippets = function (options) {
            var target = (0, linkedom_1.parseHTML)(options.textContent);
            var answersWithCodeBlock = Array.from(target.window.document.querySelectorAll(".answer"))
                .filter(function (item) { return item.querySelector("code") != null; });
            var results = answersWithCodeBlock
                .map(function (item) { return ({
                textContent: item.textContent,
                votes: parseInt(item.querySelector(".js-vote-count").textContent),
                // TODO: Handle answers with more than one code block
                // p/s: they often about explaining the something
                code: item.querySelector("code").textContent,
                sourceURL: "https://" + _this.URL + item.querySelector(".js-share-link").href,
                hasCheckMark: item.querySelector("iconCheckmarkLg") != null
            }); })
                .filter(function (item) { return (0, utils_1.isCodeValid)(item.code); });
            results.sort(sortSnippetResultFn);
            return results;
        };
        return _this;
    }
    return ExtractorStackOverflow;
}(ExtractorAbstract_1["default"]));
exports["default"] = ExtractorStackOverflow;
function sortSnippetResultFn(a, b) {
    if (a.hasCheckMark != b.hasCheckMark) {
        return a.hasCheckMark ? 1 : -1;
    }
    var result = b.votes - a.votes;
    return result === 0 ? b.code.length - a.code.length : result;
}
