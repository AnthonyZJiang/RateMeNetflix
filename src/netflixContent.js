var _prevDOM = null;
var _currentSearchText = '';
var _bobOverlay = null;

const QUERY_SUCCESSFUL = 1;
const QUERY_WAITING = -99;
const QUERY_FUZZY = 0;
const QUERY_FAILED = -1;

// observer for bob- elements
var bobObserver = new MutationObserver(function(mutations, observer) {
    console.log(mutations);
    console.log(observer);
    if (mutations[0].addedNodes.length) {
        let node = mutations[0].addedNodes[0].getElementsByClassName('bob-overlay');
        if (node.length) {
            getMovieInfo(node[0])
        }
    }
   });

function getMovieInfo(node) {
    // find elements contain movie title and publication year
    var movieTitle = node.getElementsByClassName('bob-title');
    var movieYear = node.getElementsByClassName('year');
    
    // get title
    if (movieTitle.length != 1){
        console.log('Movie title not found.', node);
        return;
    }
    movieTitle = movieTitle[0].textContent;
    // return if title is empty
    if (movieTitle == '')
        return;

    // get year
    if (movieYear.length != 1){
        movieYear = '';
        console.log('Movie year not found.', node);
    } else {
        movieYear = movieYear[0].textContent.trim();
    }
    
    // if movie year isn't empty, add parenthesis.
    if (movieYear != '')
        movieYear = '(' + movieYear + ')';

    console.log('Movie found:', movieTitle, movieYear);
    // replace special characters with space.
    movieTitle = movieTitle.replace(/[^\w\s]/g, ' ').trim();
    console.log('Movie found (special characters removed) :', movieTitle, movieYear);

    // now let's send the message and start searching!
    chrome.runtime.sendMessage({action: 'doubanSearch', title: movieTitle, year: movieYear});
    
    // insert texts to tell user that we are trying hard to get the results from Douban.
    _currentSearchText = (movieTitle + ' '+ movieYear).trim();
    _bobOverlay = node;
    injectRatings(node, {queryStatus: QUERY_WAITING});
}

function browseParser(e) {
    var srcElement = e.srcElement; 
    if (srcElement == null)
        return;

    if (_prevDOM != srcElement){
        _prevDOM = srcElement;
    } else {
        return;
    }

    if (srcElement.className == 'video-artwork is-loaded lazy-background-image'){
        // get the span node
        let span = srcElement.parentElement.parentElement.parentElement.getElementsByTagName('span');
        // observe it
        if (span.length){
            addObserver(bobObserver, span[0], { childList: true });
        }
    }
    if (srcElement.className == "bob-outline")
        console.log('2');
    if (srcElement.className == 'bob-overlay')
        console.log('3');
    if (srcElement.className == 'bob-play-hitzone')
        console.log('4');
}

function addObserver(observer, node, opt) {
    // if observed, return
    if (node.hasAttribute('observed')){
        return;
    } 
    // otherwise, add observer
    observer.observe(node, opt);
    node.setAttribute('observed','');    
    console.log(node, 'observed!')
}

// Mouse listener for any move event on the current document.
document.addEventListener('mousemove', function (e) {
    if (document.URL.includes('browse')) {
        browseParser(e);
    } else if (document.URL.includes('watch')) {

    }

}, false);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('(netflixContent.js) Message received: ', request.action);
        if (request.action == "doubanRated"){
            console.log('(netflixContent.js) Query successful?', request.content.queryStatus);
            if (request.content.queryStatus === QUERY_FUZZY) {
                // add a question mark next to rating
                request.content.rating = request.content.rating.toString() + '?';
            }
            if (_currentSearchText == request.content.searchTitle) {
                injectRatings(_bobOverlay, request.content);
            }
        }
    }
);