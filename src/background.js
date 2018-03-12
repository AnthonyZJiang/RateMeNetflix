var _netflixTabId;
var _frame;
var _sendPopupMessage = false;
var _movieList = new Array();
_frame = document.createElement('iframe');
document.body.appendChild(_frame);

// on message
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // get watched status douban
        if (request.action == "watchedStatus") {
            _sendPopupMessage = request.sendPopupMessage;
            injectIFrame(request.title, request.year);
            _netflixTabId = sender.tab.id;
            return;
        }

        // douban login status
        if (request.action === 'doubanLoginStat') {
            if (request.loggedIn){
                chrome.browserAction.setIcon({path:"img/logo@1.5x.png"});
            } else {
                chrome.browserAction.setIcon({path:"img/logo-douban-not-logged-in.png"});
            }
            return;
        }

        if (request.action === 'caughtEx') {
            console.log('%c'+request.message, 'color: white; background: black');
            console.log('%c'+request.exMessage, 'color: red');
            console.log('%c'+request.exStack, 'color: red');
            return;
        }

        if (request.action === 'updateMovieSearchResults') {
            console.log('request to update movie list');
            if (request.content) {
                console.log('new movie adds to the list');
                _movieList.push(request.content);
            }
            // send list to netflix content page
            chrome.tabs.sendMessage(sender.tab.id, { action: 'pushMovieSearchResults', content: _movieList })
        }
        
        console.log('(background.js) Unhandled message received: ', request.action)
    }
);

// on page update
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // douban login status
	if (changeInfo.status === 'complete' && (/netflix\.com/.test(tab.url) || /douban\.com/.test(tab.url))) {
        //check douban login status
        chrome.tabs.executeScript(tab.id, { file: "doubanLoginStat.js" });
        console.log('douban login status query requested.')
	}
});

function injectIFrame(title, year){
    _frame.src = 'https://api.douban.com/v2/movie/search?q=' + title + ' '+ year;
    _frame.sandbox = 'allow-scripts allow-same-origin';
}