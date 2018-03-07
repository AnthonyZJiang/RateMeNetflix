function getRating() {
    var searchText = document.getElementsByClassName('inp')[0].getElementsByTagName('input')[0].value;
    var index = searchText.lastIndexOf('(');
    var movieTitle = searchText.substr(0, index).trim();
    var movieYear = searchText.substr(index, searchText.length-index).trim(); // with parenthesis.
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

    for (let i = 0; i < searchResults.length; i++){
        let title = searchResults[i].getElementsByClassName('title-text')[0].textContent;
        // first check for year, this can't be wrong
        if (title.indexOf(movieYear)){
            // next check for movie name
            // generate regex
            let m = movieTitle.replace(/\s/g,'\\W+');
            let matchedString = new RegExp(m, 'gi').exec(title);
            if (!matchedString) {
                continue;
            }
            result.rating = searchResults[i].getElementsByClassName('rating_nums')[0].textContent;
            result.isWatched = searchResults[i].getElementsByClassName('status-text').length == 0? false : true;
            result.url = searchResults[i].getElementsByTagName('a')[0].href;
            result.isQuerySuccessful = true;
            break;
        }
    }
    
    console.log('(doubanContent.js) Rating/watched/url:', result.rating, result.isWatched, result.url);
    // send rating back to background.js
    chrome.runtime.sendMessage({action: 'doubanRated', content: result});
}

var result = {
    rating: 0,
    isWatched: false,
    url: '',
    isQuerySuccessful: false
}

console.log('(doubanContent.js) Analysing douban.')
getRating();
