'use strict'

var _sendPopupMessage = false;
var _movieList = new Array();
var _subtitle;
var _subtitleInfo;
var _subtitleSettings;

resetLoadedSubtitle();

function resetLoadedSubtitle() {
    _subtitle = null;
    _subtitleInfo = {
        movieId: '',
        fileName: ''
    };
    _subtitleSettings = null;
}

function clone(obj) {
    if (obj === null || typeof (obj) !== 'object')
        return obj;
    return JSON.parse(JSON.stringify(obj));
}

chrome.tabs.onUpdated.addListener(function(_tabId, changeInfo, _tab) {
	if (/netflix\.com/.test(changeInfo.url)) {
		chrome.tabs.executeScript(null, { file: "js/listContents.js" });
	}
});