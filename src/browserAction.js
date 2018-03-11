var NO_MOVIE = -1;
var QUERY_FAILED = 0;
var QUERY_SUCCESSFUL = 1;

window.addEventListener('click',function(e){
    if(e.target.href!==undefined){
        chrome.tabs.create({url:e.target.href})
    }
})

function doubanXHR() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        console.log('Status changed');
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log('movie.douban.com responded');

            // add a link node
            var aNode = document.createElement('A');
            aNode.setAttribute('class','bd-nav-account');
            aNode.setAttribute('href','https://www.douban.com/');
            
            if (this.responseText.includes('class="nav-login"')) {
                // if not logged in
                aNode.innerText = '未登录豆瓣';
            } else {
                // if logged in
                try {
                    let doc = new DOMParser().parseFromString(this.responseText, 'text/html');	
                    aNode.innerText = doc.getElementsByClassName('nav-user-account')[0].getElementsByClassName('bn-more')[0].children[0].innerText;
                    aNode.href = 'https://movie.douban.com/mine';
                }
                catch (ex) {
                    chrome.runtime.sendMessage({action:'caughtEx',message:'(browserAction.js) Error occurred in querying douban login status.', exMessage: ex.message, exStack: ex.stack});
                    aNode.innerText = '已登录豆瓣';
                }
            }            
            document.getElementsByClassName('bd-nav-login-stat')[0].appendChild(aNode)
            // remove query text
            document.getElementsByClassName('bd-nav-login-query')[0].remove();
        }
    }
    xhr.open('GET', 'https://movie.douban.com/', true);
    xhr.send();
}

function createDivNode(className, content) {
    var e = document.createElement('DIV');
    e.className = className;
    e.innerText = content;
	return e;
}

function createSpanNode(className, content) {
    var e = document.createElement('SPAN');
    e.className = className;
    e.innerText = content;
	return e;
}

function addContents(query) {
    if (query.status === NO_MOVIE) {
        let e = createDivNode('no-movie', '');
        let p = document.createElement('P');
        p.innerText = '没有播放任何电影';
        document.getElementById("movie-content").appendChild(e.appendChild(p));
        return;
    } else if (query.status === QUERY_FAILED) {
        let e = createDivNode('no-movie', '');
        let p = createPNode('未搜索到电影');
        document.getElementById("movie-content").appendChild(e.appendChild(p));
        return;
    } else {
        c = query.content;
        // add poster
        let e = document.createElement('IMG');
        e.className = 'movie-poster';
        e.src = c.imageUrl;
        let node = document.getElementById('td-movie-poster');
        node.height = '28px';
        node.appendChild(e);
        // add title
        e = createDivNode('movie-title', c.doubanTitle);
        node = document.getElementById('td-movie-title');
        node.height = '28px';
        node.appendChild(e);
        // add rating and rating number
        e = createSpanNode('movie-rating', c.rating);
        node = document.getElementById('td-movie-rating');
        node.height = '28px';
        node.appendChild(e);
        e = createSpanNode('movie-rating-num', c.ratingNum);
        node.appendChild(e);
        // add title
        e = createDivNode('movie-meta', c.meta);
        node = document.getElementById('td-movie-meta');
        node.height = '28px';
        node.appendChild(e);
        // add button
        e = document.createElement('INPUT');
        e.value = "电影页面";
        e.type = "button";
        e.class = "movie-link";
        e.onclick = function () {chrome.tabs.create({url:c.url})}
        node = document.getElementById('td-movie-link');
        node.appendChild(e);
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('(popup.js) Message received: ', request.action)
        if (request.action === 'watchMovieInfo') {
            // if content is null - not on watch page
            // else check queryStatus
            if (request.content === null) {
                addContents({status: NO_MOVIE});
            } else if (request.content.queryStatus < 0) {
                addContents({status: QUERY_FAILED});
            } else if (request.content.queryStatus >= 0) {
                addContents({status: QUERY_SUCCESSFUL, content: request.content});
            }
            
        }
    }
);

chrome.tabs.executeScript(null, { file: "netflixWatchContent.js" });

    setTimeout(function () {
        doubanXHR();
    }, 0000);