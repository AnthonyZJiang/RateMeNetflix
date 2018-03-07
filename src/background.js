var _netflixTabId;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('(background.js) Message received: ', request.action)
        if (request.action == "doubanSearch") {
            injectIFrame(request.title, request.year);
            _netflixTabId = sender.tab.id;
        }
        if (request.action == "doubanRated"){
            chrome.tabs.sendMessage(_netflixTabId, {action: 'doubanRated', content: request.content});
        }
    }
);

function injectIFrame(title, year){
    var frame = document.createElement('iframe');
    frame.src = 'https://movie.douban.com/subject_search?cat=1002&search_text=' + title + ' '+ year;
    frame.sandbox = 'allow-scripts allow-same-origin';
    document.body.appendChild(frame);
  }