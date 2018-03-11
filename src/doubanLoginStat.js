var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
        console.log('movie.douban.com responsed');

        if (this.responseText.includes('class="nav-login"')) {
            chrome.runtime.sendMessage({action: 'doubanLoginStat', loggedIn: false});
        } else {   
            chrome.runtime.sendMessage({action: 'doubanLoginStat', loggedIn: true});
        }     
    }
}
xhr.open('GET', 'https://movie.douban.com/', true);
xhr.send();