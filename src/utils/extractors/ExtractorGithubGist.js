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
var ExtractorGithubGist = /** @class */ (function (_super) {
    __extends(ExtractorGithubGist, _super);
    function ExtractorGithubGist() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "Github Gist";
        _this.URL = "gist.github.com";
        _this.extractSnippets = function (options) {
            var _a, _b;
            var target = (0, linkedom_1.parseHTML)(options.textContent);
            var doc = target.window.document;
            var snippet = (_a = doc.querySelector("table.highlight")) === null || _a === void 0 ? void 0 : _a.textContent;
            if (!snippet)
                return [];
            var item = {
                votes: parseInt((_b = doc.querySelector(".social-count")) === null || _b === void 0 ? void 0 : _b.textContent),
                code: cleanContent(snippet),
                sourceURL: options.url,
                hasCheckMark: false
            };
            return [item];
        };
        return _this;
    }
    return ExtractorGithubGist;
}(ExtractorAbstract_1["default"]));
exports["default"] = ExtractorGithubGist;
/**
 * Github Gist use table to display code, which produces a bunch of unnecessary characters.
 * This feature is used to them clean up
 * @param input
 * @returns
 */
function cleanContent(input) {
    return input.replace(/\n {6}\n {8}\n {8}/g, "");
}
