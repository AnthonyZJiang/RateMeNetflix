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
        }
    }, callback);
}