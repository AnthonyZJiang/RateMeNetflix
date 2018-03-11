var _netflixTabId;
var _frame;
var _sendPopupMessage = false;
_frame = document.createElement('iframe');
document.body.appendChild(_frame);

// on message
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // douban search
        if (request.action == "doubanSearch") {
            _sendPopupMessage = request.sendPopupMessage;
            injectIFrame(request.title, request.year);
            _netflixTabId = sender.tab.id;
            return;
        }

        // douban rated
        if (request.action == "doubanRated"){
            if (_sendPopupMessage) {
                _sendPopupMessage = false;
                chrome.runtime.sendMessage({action: 'watchMovieInfo', content: request.content});
            } else {
                chrome.tabs.sendMessage(_netflixTabId, {action: 'doubanRated', content: request.content});
            }
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
    _frame.src = 'https://movie.douban.com/subject_search?cat=1002&search_text=' + title + ' '+ year;
    _frame.sandbox = 'allow-scripts allow-same-origin';
}