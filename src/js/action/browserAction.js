'use strict'

var QUERY_FAILED = -1;
var QUERY_SUCCESSFUL = 1;
var _movieId;
var _subtitleSettings;

window.addEventListener('click', function (e) {
    if (e.target.href !== undefined) {
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
                addQueryResultToDocument(request.content);
                sendGetLoadedSubtitleInfo(request.content.id);
            }
        }
    }
);

resetSubtitleSettings();

chrome.tabs.getSelected(null, function (tab) {
    if (/.*\.netflix\.com\/watch.*/.test(tab.url)) {
        chrome.tabs.executeScript(null, {
            file: "js/playerContents.js"
        });
    }
});

function getDoubanMovieQueryLink() {
    return 'https://movie.douban.com/subject_search?search_text=' + document.getElementById('db-query').value + '&cat=1002';
}

function createDivNode(className, content) {
    var e = document.createElement('DIV');
    e.className = className;
    e.innerText = content;
    return e;
}

function createSpanNode(className, content) {
    var e = document.createElement('SPAN');
    e.className = className;
    e.innerText = content;
    return e;
}