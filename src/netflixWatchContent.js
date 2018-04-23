function getCurrentlyWatchingMovie(){
    // get movie id
    var movieId = document.getElementsByClassName('VideoContainer')[0].firstChild.id;
    // check if we have something in search hist already
    try {
        for (var i in _doubanMovieSearchHist) {
            if (_doubanMovieSearchHist[i].movieId === movieId) {
                console.log('(watchContent.js): match found in search history list.')
                chrome.runtime.sendMessage({action: 'watchMovieInfo', content: _doubanMovieSearchHist[i]});
                return;
            }
        }
    } catch (ex){ 
        chrome.runtime.sendMessage({action:'caughtEx',message:'(netflixWatchContent.js) Error occurred in finding movie in search result list.', exMessage: ex.message, exStack: ex.stack}); 
    }

    // if it is not in the search hist
    var movieTitle;
    var node;
    var episodeText = null;
    if ((node = this.document.getElementsByClassName('ellipsize-text')).length) {   
        // while playing or paused
        if ((node = node[0]).childElementCount > 0){
            // tv series
            movieTitle = node.getElementsByTagName('h4')[0].innerText;
            if ((node = node.getElementsByTagName('span')).length) {
                episodeText = getEpisode(node[0].innerText);
            }
        } else {
            // movie
            movieTitle = node.innerText;
        }
    } else if ((node = this.document.getElementsByClassName('pp-rating-title')).length){ 
        // at the end
        movieTitle = node[0].innerText;
    } else {
        var ex = new Error('cannot get movie title.');
        chrome.runtime.sendMessage({action:'caughtEx',message:'(netflixWatchContent.js) Error occurred in getting movie title.', exMessage: ex.message, exStack: ex.stack});
    }
    movieTitle = movieTitle.replace(/[^\w\s]/g, ' ').trim();

    _currentSearchStr = episodeText ? movieTitle + ' ' + episodeText : movieTitle;
    doubanSearchXHR(movieTitle, movieId, movieTitle, '', episodeText, true);
}

function getEpisode(text) {
    var episode = text.split(':')[0];
    var number = /\d+/.exec(episode);
    if (!number) {
        return '';
    } 
    number = number[0];    
    if (parseInt(number) < 1) {
        return '';
    } else {
        return '第' + getChineseNumber(number) + '季';
    }
}

// only works from 1 to 99
function getChineseNumber(number) {   
    switch (number) {
        case '0':
            return "十"
        case '1':
            return "一";
        case '2':
            return "二";
        case '3':
            return "三";
        case '4':
            return "四";
        case '5':
            return "五";
        case '6':
            return "六";
        case '7':
            return "七";
        case '8':
            return "八";
        case '9':
            return "九";
        case '10':
            return "十";
        default:
            if (number.substr(0,1) == '1') {
                return '十' + getChineseNumber(number.substr(1,1));
            } else if (number.substr(1,1) == '0') {
                return getChineseNumber(number.substr(0,1)) + '十';
            } else {
                return getChineseNumber(number.substr(0,1)) + '十' + getChineseNumber(number.substr(1,1));
            }

    } 
}

if (document.URL.includes('watch')) {
    getCurrentlyWatchingMovie();
} else {
    chrome.runtime.sendMessage({action: 'watchContent', content: null})
}