var _playerTabId;
var _zimukuDownloadUrl;

// on message
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request.action, request, sender)

        updatePlayerTabId(sender, request);
        switch (request.action) {
            case 'caughtEx':
                return onCaughtException(request);
            case 'getRatings':
                return onGetRatting(request, sendResponse);
            case 'loadSubtitle':
                return onLoadSubtitle(request);
            case 'replaySubtitle':
                return onReplaySubtitle();
            case 'clearSubtitle':
                return resetLoadedSubtitle();
            case 'getLoadedSubtitle':
                sendResponse({
                    subtitleInfo: _subtitleInfo,
                    subtitleSettings: _subtitleSettings
                });
                return
            case 'updateSubSettings':
                _subtitleSettings = request.content;
                return;
            case 'zimukuIframeLoaded':
                return onZimukuIframeLoaded(sendResponse);
            case 'createZimukuIframe':
                return onCreateZimukuIframe(request);
        }
        console.log('(background.js) Unhandled message received: ', request)
    }
);

function updatePlayerTabId(sender, request) {
    if (sender.tab && request.updatePlayerTabId) {
        if (_playerTabId != sender.tab.id) {
            _playerTabId = sender.tab.id;
        }
    }
}

function onCaughtException(request) {
    console.log('%c' + request.message, 'color: white; background: black');
    console.log('%c' + request.exMessage, 'color: red');
    console.log('%c' + request.exStack, 'color: red');
}

function onGetRatting(request, sendResponse) {
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

function onLoadSubtitle(request) {
    _subtitle = parseSrt(request.content.subtitleObj);
    _subtitleInfo.movieId = request.content.subtitleInfo.movieId;
    _subtitleInfo.fileName = request.content.subtitleInfo.fileName;
    // reload script
    chrome.tabs.executeScript(null, {
        file: "js/injectSubtitle.js"
    });
    chrome.tabs.sendMessage(_playerTabId, {
        action: 'playSubtitle',
        content: _subtitle
    });
}

function onReplaySubtitle() {
    if (_subtitle != null) {
        chrome.tabs.sendMessage(_playerTabId, {
            action: 'playSubtitle',
            content: _subtitle
        });
    }
}

function onCreateZimukuIframe(request) {
    _zimukuDownloadUrl = request.url;
    createZimukuIframe();
}

function onZimukuIframeLoaded(sendResponse) {
    sendResponse({
        url: _zimukuDownloadUrl
    });
    return true;
}
