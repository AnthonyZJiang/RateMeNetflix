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