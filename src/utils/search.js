"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.search = void 0;
var extractors_1 = require("./extractors");
var fetchPageContent_1 = require("./fetchPageContent");
var vscode = require("vscode");
var config_1 = require("../config");
/**
 * Cache results to avoid VSCode keep refetching
 */
var cachedResults = {};
// Send search query to google, get answers from stackoverflow
// then extract and return code results
function search(keyword) {
    return __awaiter(this, void 0, void 0, function () {
        var config, promise;
        var _this = this;
        return __generator(this, function (_a) {
            if (keyword in cachedResults) {
                return [2 /*return*/, Promise.resolve({ results: cachedResults[keyword] })];
            }
            config = (0, config_1.getConfig)();
            promise = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var results, fetchResult, _a, _b, _i, i, extractor, urls, _c, _d, _e, y, err_1;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            results = [];
                            _f.label = 1;
                        case 1:
                            _f.trys.push([1, 10, , 11]);
                            _a = [];
                            for (_b in extractors_1["default"])
                                _a.push(_b);
                            _i = 0;
                            _f.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 9];
                            i = _a[_i];
                            extractor = extractors_1["default"][i];
                            if (!extractor.isEnabled()) return [3 /*break*/, 8];
                            return [4 /*yield*/, extractor.extractURLFromKeyword(keyword)];
                        case 3:
                            urls = _f.sent();
                            _c = [];
                            for (_d in urls)
                                _c.push(_d);
                            _e = 0;
                            _f.label = 4;
                        case 4:
                            if (!(_e < _c.length)) return [3 /*break*/, 7];
                            y = _c[_e];
                            return [4 /*yield*/, (0, fetchPageContent_1.fetchPageTextContent)(urls[y])];
                        case 5:
                            fetchResult = _f.sent();
                            results = results.concat(extractor.extractSnippets(fetchResult));
                            vscode.window.setStatusBarMessage(extractor.name + " (" + y + "/" + urls.length + "): " + results.length + " results", 2000);
                            if (results.length >= config.settings.maxResults) {
                                return [3 /*break*/, 7];
                            }
                            _f.label = 6;
                        case 6:
                            _e++;
                            return [3 /*break*/, 4];
                        case 7:
                            if (results.length >= config.settings.maxResults) {
                                return [3 /*break*/, 9];
                            }
                            _f.label = 8;
                        case 8:
                            _i++;
                            return [3 /*break*/, 2];
                        case 9:
                            cachedResults[keyword] = results;
                            resolve({ results: results });
                            return [3 /*break*/, 11];
                        case 10:
                            err_1 = _f.sent();
                            reject(err_1);
                            return [3 /*break*/, 11];
                        case 11:
                            // When promise resolved, show finished loading for 5 seconds
                            vscode.window.setStatusBarMessage("CaptainStack: Finished loading " + results.length + " results");
                            return [2 /*return*/];
                    }
                });
            }); });
            vscode.window.setStatusBarMessage("CaptainStack: Start loading snippet results...", promise);
            return [2 /*return*/, promise];
        });
    });
}
exports.search = search;
