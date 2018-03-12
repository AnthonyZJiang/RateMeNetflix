function doubanSearchXHR(searchStr, movieId, title, year, episodeText, sendToPopUp) {
    var xhr = new XMLHttpRequest();
    
    xhr.onload = function () {
        try {
            result = getRating(JSON.parse(this.responseText), movieId, title, year, episodeText);

            console.log('(netflixContent.js) Query successful?', result.queryStatus);

            // send list to background
            chrome.runtime.sendMessage({action:'updateMovieSearchResults', content: result});
            if (sendToPopUp) {
                chrome.runtime.sendMessage({action: 'watchMovieInfo', content: result});
            } else {
                injectRatings(_bobOverlay, result);
            }
        } catch (ex) {
            chrome.runtime.sendMessage({action:'caughtEx',message:'(doubanSearch.js) Error occurred in parsing douban search result.', exMessage: ex.message, exStack: ex.stack});
            throw ex;
        }
    };
    xhr.open('GET', 'https://api.douban.com/v2/movie/search?q=' + searchStr);
    xhr.send();
}

function getRating(js, movieId, title, year, episodeText) {    
    var result = {
        queryStatus: QUERY_FAILED
    }

    // go through search results
    var movieYearMatchList = new Array;
    for (var i in js.subjects) {
        // check year first. this can't be wrong
        if (year !== '' && year !== js.subjects[i].year.trim()) {
            // if don't match
            continue;
        }
        movieYearMatchList.push(i);
        // check movie title
        // generate regex
        let m = title.replace(/\s/g,'\\W+');
        let matchedString = new RegExp(m, 'gi').exec(js.subjects[i].original_title.trim());
        if (!matchedString) {
            continue;
        }

        // check episode text
        if (episodeText) {
            if (!js.subjects[i].title.includes(episodeText)) {
                continue;
            }
        }
        
        result.queryStatus = QUERY_SUCCESSFUL;
        break;
    }

    if (result.queryStatus !== QUERY_SUCCESSFUL) {
        // go through each movie's detail page and check for alt_title?
        // prioritise movie title and check js.subjects[i].subtype==='tv' if it is a tv series?
        // prioritise movie year in other cases?
        // if year does not exist, return the first result        
        result.queryStatus = QUERY_FUZZY;
        if (year === '') {
            i = 0;
        } else {
            if (movieYearMatchList.length) {
                i = movieYearMatchList[0];
            } else {
                i = 0;
            }
        }
    }

    if (result.queryStatus !== QUERY_FAILED) {        
        result.doubanTitle = js.subjects[i].title;
        result.imageUrl = js.subjects[i].images.small;
        // add a question mark next to rating
        result.rating = result.queryStatus === QUERY_FUZZY ? js.subjects[i].rating.average + '?' : js.subjects[i].rating.average;
        result.ratingNum = '(' + js.subjects[i].collect_count.toString() + '人看过)';
        result.meta = js.subjects[i].genres.join('/');
        result.isWatched = false;
        result.url = js.subjects[i].alt;
        result.originalTitle = js.subjects[i].original_title;
        result.year = js.subjects[i].year;
        // add search properties
        result.movieId = movieId;
        result.netflixTrimmedTitle = title;
    }
    return result;
}