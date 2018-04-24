var _netflixTabId;
var _frame;
var _sendPopupMessage = false;
var _movieList = new Array();
var _subtitle;
var _subtitleInfo;
var _subtitleSettings;

_frame = document.createElement('iframe');
document.body.appendChild(_frame);
resetLoadedSubtitle();

// on message
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request.action, request, sender)
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
            _netflixTabId = sender.tab.id;
            return;
        }

        if (request.action === 'loadSubtitle') {
            _subtitle = parseSrt(request.content.subtitleObj);
            _subtitleInfo.movieId = request.content.subtitleInfo.movieId;
            _subtitleInfo.fileName = request.content.subtitleInfo.fileName;
            // reload script
            chrome.tabs.executeScript(_netflixTabId, { file: "netflixSubtitle.js" });
            chrome.tabs.sendMessage(_netflixTabId, { action: 'playSubtitle', content: _subtitle });
            return;
        }

        if (request.action === 'replaySubtitle') {
            if (_subtitle != null)            
            {
                chrome.tabs.sendMessage(_netflixTabId, { action: 'playSubtitle', content: _subtitle });
            }
            return;
        }

        if (request.action === 'clearSubtitle') {
            resetLoadedSubtitle();
            return;
        }

        if (request.action === 'getLoadedSubtitle') {
            sendResponse({subtitleInfo: _subtitleInfo, subtitleSettings: _subtitleSettings});
            return;
        }

        if (request.action === 'updateSubSettings') {
            if (typeof(request.timeSliderVal)!='undefined')
                _subtitleInfo.timeSliderVal = request.timeSliderVal;
            if (typeof(request.timeTextBoxVal)!='undefined')
                _subtitleInfo.timeTextBoxVal = request.timeTextBoxVal;
            if (typeof(request.heightSliderVal)!='undefined')
                _subtitleInfo.heightSliderVal = request.heightSliderVal;
            if (typeof(request.colourPickerChecked)!='undefined')
                _subtitleInfo.colourPickerChecked = request.colourPickerChecked;
            if (typeof(request.textSize)!='undefined')
                _subtitleInfo.textSize = request.textSize;
            _subtitleSettings = request.subtitleSettings;
            return;
        }
        
        console.log('(background.js) Unhandled message received: ', request.action)
    }
);

// on page update
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     // douban login status
// 	if (changeInfo.status === 'complete' && (/douban\.com/.test(tab.url))) {
//         //check douban login status
//         chrome.tabs.executeScript(tab.id, { file: "doubanLoginStat.js" });
//         console.log('douban login status query requested.')
// 	}
// });

function injectIFrame(title, year){
    _frame.src = 'https://api.douban.com/v2/movie/search?q=' + title + ' '+ year;
    _frame.sandbox = 'allow-scripts allow-same-origin';
}

function resetLoadedSubtitle(){
    _subtitle = null;
    _subtitleInfo = {movieId:'', 
                    fileName:'', 
                    textZoom:1,
                    timeSliderVal:'0', 
                    timeTextBoxVal:'', 
                    heightSliderVal:'-5', 
                    colourPickerChecked:'colour-white-radio'};
    _subtitleSettings = null;
}