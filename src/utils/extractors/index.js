"use strict";
exports.__esModule = true;
var ExtractorGithubGist_1 = require("./ExtractorGithubGist");
var ExtractorStackOverflow_1 = require("./ExtractorStackOverflow");
var SnippetExtractors = [
    new ExtractorStackOverflow_1["default"](),
    new ExtractorGithubGist_1["default"]()
];
exports["default"] = SnippetExtractors;
