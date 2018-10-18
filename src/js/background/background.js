'use strict'

var _netflixTabId;
var _frame;
var _sendPopupMessage = false;
var _movieList = new Array();
var _subtitle;
var _subtitleInfo;
var _subtitleSettings;

_frame = document.createElement('iframe');
document.body.appendChild(_frame);
resetLoadedSubtitle();

// on message
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request.action, request, sender)

        if (sender.tab) {
            if (_netflixTabId != sender.tab.id) {
                _netflixTabId = sender.tab.id;
            }
        }

        if (request.action === 'caughtEx') {
            console.log('%c' + request.message, 'color: white; background: black');
            console.log('%c' + request.exMessage, 'color: red');
            console.log('%c' + request.exStack, 'color: red');
            return;
        }

        if (request.action === 'getRatings') {
            console.log('request to get ratings for the movie', request.content);
            if (request.content) {
                let movie = clone(MOVIE_TEMPLATE);
                movie.id = request.content.id;
                movie.title = request.content.title;
                movie.episodeInfo = request.content.episodeInfo;
                movie.year = request.content.year;
                getRatings(movie).then(function (r) {
                    sendResponse(r);
                }).catch(function (r) {
                    sendResponse(r);
                });
                return true;
            }
            return false;
        }

        if (request.action === 'loadSubtitle') {
            _subtitle = parseSrt(request.content.subtitleObj);
            _subtitleInfo.movieId = request.content.subtitleInfo.movieId;
            _subtitleInfo.fileName = request.content.subtitleInfo.fileName;
            // reload script
            chrome.tabs.executeScript(null, {
                file: "js/injectSubtitle.js"
            });
            chrome.tabs.sendMessage(_netflixTabId, {
                action: 'playSubtitle',
                content: _subtitle
            });
            return;
        }

        if (request.action === 'replaySubtitle') {
            if (_subtitle != null) {
                chrome.tabs.sendMessage(_netflixTabId, {
                    action: 'playSubtitle',
                    content: _subtitle
                });
            }
            return;
        }

        if (request.action === 'clearSubtitle') {
            resetLoadedSubtitle();
            return;
        }

        if (request.action === 'getLoadedSubtitle') {
            sendResponse({
                subtitleInfo: _subtitleInfo,
                subtitleSettings: _subtitleSettings
            });
            return;
        }

        if (request.action === 'updateSubSettings') {
            _subtitleSettings = request.content;
            return;
        }

        console.log('(background.js) Unhandled message received: ', request.action)
    }
);

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
// 	if (/.*\.netflix\.com\/title/.test(changeInfo.url)) {
// 		chrome.tabs.executeScript(null, { file: "js/listContents.js" });
// 	}
// });

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