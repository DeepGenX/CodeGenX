"use strict";
exports.__esModule = true;
exports.fetchPageTextContent = void 0;
const axios = require("axios");
const cheerio = require("cheerio");
function fetchPageTextContent(url) {
    return new Promise(function (resolve, reject) {
        return axios.get(url)
        .then((response) => {
            const html = response.data;
            const $ = cheerio.load(html);
            return $.text();
        }).then(function (textContent) { return resolve({ textContent: textContent, url: url }); })["catch"](reject);
    });
}
exports.fetchPageTextContent = fetchPageTextContent;