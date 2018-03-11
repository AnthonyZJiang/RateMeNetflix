var _netflixWatchContent_doubanMovieSearchResults;

function getCurrentlyWatchingMovie(){
    var movieTitle;
    var node;
    if ((node = this.document.getElementsByClassName('ellipsize-text')).length) {   
        // while playing or paused
        if ((node = node[0]).childElementCount > 0){
            // tv series
            movieTitle = node.getElementsByTagName('h4')[0].innerText;
            if ((node = node.getElementsByTagName('span')).length) {
                movieTitle += getEpisode(node[0].innerText);
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
    var isFound = false;
    // check if the movie has been queried before.
    try {
        for (var i in _doubanMovieSearchResults) {
            if (_doubanMovieSearchResults[i].searchText === movieTitle) {
                isFound = true;
                break;
            }
        }
    }
    catch (ex){ chrome.runtime.sendMessage({action:'caughtEx',message:'(netflixWatchContent.js) Error occurred in finding movie in search result list.', exMessage: ex.message, exStack: ex.stack}); }

    if (isFound) {
        chrome.runtime.sendMessage({action: 'watchMovieInfo', content: _doubanMovieSearchResults[i]});
    } else {
        chrome.runtime.sendMessage({action: 'doubanSearch', title: movieTitle, year: '', sendPopupMessage: true});
    }
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
        return ' 第' + getChineseNumber(number) + '季';
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
    // chrome.runtime.sendMessage({action: 'getDoubanMovieSearchResults'}, function(response) {
    //     _netflixWatchContent_doubanMovieSearchResults = response.content;
    // });
    getCurrentlyWatchingMovie();
} else {
    chrome.runtime.sendMessage({action: 'watchContent', content: null})
}