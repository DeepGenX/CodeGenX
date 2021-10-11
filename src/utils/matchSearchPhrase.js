"use strict";
exports.__esModule = true;
exports.matchSearchPhrase = void 0;
var config_1 = require("../config");
/**
 * Match the giving string with search pattern
 * @param {string} input
 * @returns {SearchMatchResult | undefined} if found, return the search phrase, comment's opening and closing syntax
 */
function matchSearchPhrase(input) {
    var match = config_1["default"].SEARCH_PATTERN.exec(input);
    if (match && match.length > 2) {
        var _ = match[0], commentSyntax = match[1], searchPhrase = match[2], commentSyntaxEnd = match[3];
        return {
            commentSyntax: commentSyntax,
            commentSyntaxEnd: commentSyntaxEnd,
            searchPhrase: searchPhrase
        };
    }
    return undefined;
}
exports.matchSearchPhrase = matchSearchPhrase;
