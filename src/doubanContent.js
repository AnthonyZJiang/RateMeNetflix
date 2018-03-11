const QUERY_SUCCESSFUL = 1;
const QUERY_FAILED = -1;
const QUERY_FUZZY = 0;

var result = {
    queryStatus: QUERY_FAILED
}

function getRating() {
    // parse search text
    var searchText = document.getElementsByClassName('inp')[0].getElementsByTagName('input')[0].value;
    var movieYear = /\(\d{4,}\)/.exec(searchText);
    if (movieYear == null) {
        movieYear = '';
        movieTitle = searchText;
    } else {
        movieTitle = searchText.substr(0, movieYear.index).trim();
        movieYear = movieYear[0];
    }

    var searchResults = document.getElementsByClassName('item-root');

    console.log('(doubanContent.js) Search Text:', searchText)
    console.log('(doubanContent.js) Title:', movieTitle)
    console.log('(doubanContent.js) Year:', movieYear);

    if (searchResults.length < 1) {
        console.log('(doubanContent.js) Cannot find a match for "' + searchText + '"');
        chrome.runtime.sendMessage({action: "searchOnDouban", content: null});
        return;
    }

    if (searchResults.length < 1) {
        console.log('Cannot find any result for "' + movieTitle + '".');
        chrome.runtime.sendMessage({action: "searchOnDouban", content: null});
    } else {
        console.log('Found',searchResults.length, 'results for "' + movieTitle + '".');
    }

    for (var i = 0; i < searchResults.length; i++){
        let title = searchResults[i].getElementsByClassName('title-text')[0].textContent;
        // first check for year, this can't be wrong, if year is available
        if (movieYear !== '') {
            if (title.indexOf(movieYear) === -1){
                continue;
            }
        }
        // check for movie name
        // generate regex
        let m = movieTitle.replace(/\s/g,'\\W+');
        let matchedString = new RegExp(m, 'gi').exec(title);
        if (!matchedString) {
            continue;
        }
        result.queryStatus = QUERY_SUCCESSFUL;
        break;
    }
    if (result.queryStatus !== QUERY_SUCCESSFUL) {
        // if no match has been found, take the first result that has a rating (because it could be an actor/actress, who does not have a rating.)
        i = 0;
        while (true) {            
            if (i>searchResults.length-1) {
                // no movie result at all
                result.queryStatus = QUERY_FAILED;
                break;
            }
            if ((result.rating = searchResults[i].getElementsByClassName('rating_nums').length) > 0) {
                result.queryStatus = QUERY_FUZZY;
                break;
            }
            i++;
        }
    }
    if (result.queryStatus !== QUERY_FAILED) {        
        result.doubanTitle = searchResults[i].getElementsByClassName('title-text')[0].textContent;
        result.imageUrl = searchResults[i].getElementsByClassName('cover')[0].src;
        result.rating = searchResults[i].getElementsByClassName('rating_nums')[0].textContent;
        result.ratingNum = searchResults[i].getElementsByClassName('pl')[0].textContent;
        result.meta = searchResults[i].getElementsByClassName('meta abstract')[0].textContent;
        // remove movie length info
        var metaStr = result.meta.split('/');
        if (metaStr[metaStr.length-1].includes('分钟')){
            result.meta = result.meta.substr(0, result.meta.indexOf(metaStr[metaStr.length-1]) - 1);
        }
        result.isWatched = searchResults[i].getElementsByClassName('status-text').length == 0? false : true;
        result.url = searchResults[i].getElementsByTagName('a')[0].href;
        result.searchText = searchText;
        result.netflixTitle = movieTitle;
    }
    
    console.log('(doubanContent.js) Rating/watched/url:', result.rating, result.isWatched, result.url);
    // send rating back to background.js
    chrome.runtime.sendMessage({action: 'doubanRated', content: result});
}

console.log('(doubanContent.js) Analysing douban.')
getRating();
