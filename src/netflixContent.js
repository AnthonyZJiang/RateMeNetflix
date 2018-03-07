var _prevDOM = null;
var _prevMovieTitle = 'prevMovie';
var _bobOverlay = null;

const _waitRating = {
    rating: 'loading...',
    url: '',
    isWatched: false
}
const _failRating = {
    rating: 'no results',
    url: '',
    isWatched: false
}

// Mouse listener for any move event on the current document.
document.addEventListener('mousemove', function (e) {
    var srcElement = e.srcElement; 
    if (srcElement == null)
        return;

    if (_prevDOM != srcElement){
        _prevDOM = srcElement;
        return;
    }

    // find the bob-overlay class
    if (srcElement.parentElement != null && srcElement.parentElement.className.startsWith('bob')) {
        while (srcElement.className!="bob-overlay"){
            srcElement = srcElement.parentElement;
            // if srcElement is no longer a bob- class, we are out of luck here.
            if (srcElement == null || !srcElement.className.startsWith('bob'))
                return;
        }
    } 
    
    // the srcElement at this stage has to be bob-overlay class!
    if (srcElement == null || srcElement.className!="bob-overlay")
        return;

    // now we are in the right place
    // get movie title and publication year
    var movieTitle = srcElement.getElementsByClassName('bob-title');
    var movieYear = srcElement.getElementsByClassName('year');
    
    if (movieTitle.length != 1){
        console.log('Movie title not found.', srcElement);
        return;
    }
    if (movieYear.length != 1){
        console.log('Movie year not found.', srcElement);
        return;
    }

    // now get the title and year
    movieTitle = movieTitle[0].textContent;
    movieYear = movieYear[0].textContent.trim();

    // if the current movie is the same as the previous movie, we return.
    if (movieTitle == _prevMovieTitle)
        return;
    // return if title is empty
    if (movieTitle == '')
        return;
    // if movie year isn't empty, add parenthesis.
    if (movieYear != '')
        movieYear = '(' + movieYear + ')';

    _prevMovieTitle = movieTitle;
    console.log('Movie found:', movieTitle, movieYear);
    // replace special characters with space.
    movieTitle = movieTitle.replace(/[^\w\s]/g, ' ').trim();
    console.log('Movie found (special characters removed) :', movieTitle, movieYear);

    // now let's send the message and start searching!
    chrome.runtime.sendMessage({action: 'doubanSearch', title: movieTitle, year: movieYear});
    
    // insert texts to tell user that we are trying hard to get the results from Douban.
    _bobOverlay = srcElement;
    injectRatings(srcElement, _waitRating);

}, false);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('(netflixContent.js) Message received: ', request.action);
        if (request.action == "doubanRated"){
            console.log('(netflixContent.js) Query successful?', request.content.isQuerySuccessful);

            if (request.content.isQuerySuccessful)
                injectRatings(_bobOverlay, request.content);
            else
                injectRatings(_bobOverlay, _failRating);
        }
    }
);