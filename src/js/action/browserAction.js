'use strict'

var _corsApi = 'https://corsanthony.herokuapp.com/';
var _currentMovieObject = null;

window.addEventListener('click', function (e) {
    if (e.target.href !== undefined) {
        if (isPauseVideoRequired(e.target)) {
            pauseVideo();
        }
        chrome.tabs.create({
            url: e.target.href
        })
    }
});

document.getElementById('db-query-button').addEventListener('click', function () {
    chrome.tabs.create({
        url: getDoubanMovieQueryLink()
    })
});

document.getElementById('db-query').addEventListener('keyup', function () {
    // Cancel the default action, if needed
    event.preventDefault();
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Trigger the button element with a click
        document.getElementById("db-query-button").click();
    }
});

chrome.runtime.onMessage.addListener(
    function (request) {
        console.log('(popup.js) Message received: ', request.action)
        if (request.action === 'playingMovieInfo') {
            // if content is null - not on watch page
            // else check queryStatus
            if (!request.content.queryInProgress) {
                _currentMovieObject = request.content;
                addQueryResultToDocument(request.content);
                sendGetLoadedSubtitleInfo(request.content.id);
            }
        }
    }
);

resetSubtitleSettings();

chrome.tabs.getSelected(null, function (tab) {
    if (isNetflixPlayerPage(tab.url)) {
        runPlayerContentScript()
    }
});

function isNetflixPlayerPage(url) {
    return /.*\.netflix\.com\/watch.*/.test(url)
}

function runPlayerContentScript() {
    chrome.tabs.executeScript(null, {
        file: "js/playerContents.js"
    });
}

function getDoubanMovieQueryLink() {
    return 'https://movie.douban.com/subject_search?search_text=' + document.getElementById('db-query').value + '&cat=1002';
}

function isPauseVideoRequired(node) {
    return node.className.includes('require-pause-vid');
}

function pauseVideo() {
    chrome.tabs.getCurrent( (tab) => {
        chrome.tabs.sendMessage(tab.id,{action:'pauseVideo'})
    });
}