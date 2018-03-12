const QUERY_SUCCESSFUL = 1;
const QUERY_FAILED = -1;
const QUERY_FUZZY = 0;

var result = {
    queryStatus: QUERY_FAILED
}

function getRating() {
    // get <pre>, this is where js texts can be found
    var node = document.getElementsByTagName('pre');
    // parse js text
    var js = JSON.parse(node[0].innerText);
    // get search string
    var searchStr = /(?=").*(?=")/.exec(js.title)[0];
    searchStr = searchStr.substr(1,searchStr.length-1);
    // get year and title
    var movieYear = /\(\d{4,}\)/.exec(searchStr);
    if (movieYear == null) {
        movieYear = '';
        movieTitle = searchStr;
    } else {
        movieTitle = searchStr.substr(0, movieYear.index).trim();
        movieYear = movieYear[0].substr(1, 4);
    }

    // go through search results
    var movieYearMatchList = new Array;
    for (var i in js.subjects) {
        // check year first. this can't be wrong
        if (movieYear !== '' && movieYear !== js.subjects[i].year.trim()) {
            // if don't match
            continue;
        }
        movieYearMatchList.push(i);
        // check movie title
        // generate regex
        let m = movieTitle.replace(/\s/g,'\\W+');
        let matchedString = new RegExp(m, 'gi').exec(js.subjects[i].original_title.trim());
        if (!matchedString) {
            continue;
        }
        result.queryStatus = QUERY_SUCCESSFUL;
        break;
    }

    if (result.queryStatus !== QUERY_SUCCESSFUL) {
        // go through each movie's detail page and check for alt_title?
        // prioritise movie title and check js.subjects[i].subtype==='tv' if it is a tv series?
        // prioritise movie year in other cases?
        // if year does not exist, return the first result
        if (movieYear === '') {
            result.queryStatus = QUERY_FUZZY;
            i = 0;
        } else {
            result.queryStatus = QUERY_FUZZY;
            i = movieYearMatchList[0];
        }
    }

    if (result.queryStatus !== QUERY_FAILED) {        
        result.doubanTitle = js.subjects[i].title;
        result.imageUrl = js.subjects[i].images.small;
        result.rating = js.subjects[i].rating.average;
        result.ratingNum = '(' + js.subjects[i].collect_count.toString() + '人看过)';
        result.meta = js.subjects[i].genres.join('/');
        result.isWatched = false;
        result.url = js.subjects[i].alt;
        result.originalTitle = js.subjects[i].original_title;
        result.year = js.subjects[i].year;
        result.searchText = searchStr;
    }

    console.log(result.queryStatus);
    // send rating back to background.js
    chrome.runtime.sendMessage({action: 'doubanRated', content: result});
}

console.log('(doubanContent.js) Analysing douban.')
try {
    getRating();
} catch (ex) {
    chrome.runtime.sendMessage({action:'caughtEx',message:'(doubanContent.js) Error occurred in parsing douban search result.', exMessage: ex.message, exStack: ex.stack});
}
