'use strict'

var _currentMovieId = '';

function getRatings(id, title, episodeInfo, year, callback) {
    if (_currentMovieId == id) {
        //return undefined;
    }
    
    _currentMovieId = id;
    chrome.runtime.sendMessage({
        action:'getRatings', 
        content: {
            id: id,
            title: title,
            episodeInfo: episodeInfo,
            year: year
        },
    }, callback);
}

chrome.runtime.onMessage.addListener(
    function(request) {
        // get watched status douban
        if (request.action == 'pauseVideo') {
            pauseVideo();
        }
    }
)

function pauseVideo() {
    var video = document.getElementsByTagName("video");
    if (video) {
        video.pause();
    }
}