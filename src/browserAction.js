var NO_MOVIE = -99;
var QUERY_FAILED = -1;
var QUERY_SUCCESSFUL = 1;
var _movieId;

subtitleUploader();

window.addEventListener('click',function(e){
    if(e.target.href!==undefined){
        chrome.tabs.create({url:e.target.href})
    }
})

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
        _movieId = c.movieId;
        getLoadedSubtitleInfo();

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
        // un-hide table
        document.getElementById("movie-content-table").style = "display: initial";
        // un-hide subtitle
        document.getElementById("subtitle-panel").style = "display: initial";
    }
}

function getLoadedSubtitleInfo(){
    chrome.runtime.sendMessage({action:"getLoadedSubtitle"}, function (response) {
        if (response != null)
        {
            if (response.movieId == _movieId)
            {    
                console.log('settings received', response);
                console.log('settings sliderVal', response.sliderVal);
                console.log('settings textBoxVal', response.textBoxVal);
                document.getElementById("subtitle-uploader").nextElementSibling.innerHTML = response.fileName;
                document.getElementById("subtitle-settings-panel").style = "display: initial";
                document.getElementById("subtitle-micro-adjustment-slider").value = response.timeSliderVal;
                document.getElementById("subtitle-adjustment").value = response.timeTextBoxVal;
                document.getElementById("subtitle-height-slider").value = response.heightSliderVal;
            }
        }
        subtitleAdjustmentOnChange();
    })
}

function subtitleUploader(){
    var input = document.getElementById("subtitle-uploader");
    var label = input.nextElementSibling,
        labelVal = label.innerHTML;
    input.addEventListener('change', function(e)
    {   
        let fileName = '';        
        let fileExt = e.target.value.split('.').pop();

        if (this.files)
            fileName = e.target.value.split('\\').pop();

        if (fileName && fileExt!='srt'){
            alert('抱歉，暂时只支持SRT格式的字幕文件。');
            fileName = '';
        }
        
        if (fileName){
            label.childNodes[3].innerHTML = fileName;
            let reader = new FileReader();
            reader.onloadend = function (){
                chrome.runtime.sendMessage({action: 'loadSubtitle', content: {
                    subtitleObj: reader.result,
                    subtitleInfo: {
                        fileName: fileName,
                        movieId: _movieId}
                    }});
                    
                document.getElementById("subtitle-settings-panel").style = "display: initial";
            }

            reader.readAsText(e.target.files[0],'chinese');
        }
        else
            label.innerHTML = labelVal;
    });
}

function subtitleAdjustmentOnChange(){
    var timeTextBox = document.getElementById("subtitle-adjustment");
    var timeSlider = document.getElementById("subtitle-micro-adjustment-slider");
    var heightSlider = document.getElementById("subtitle-height-slider");
    var valueNode = document.getElementById("subtitle-micro-adjustment-val");
   
    function getTimeAdjustmentVal() {
        var textVal = parseFloat(timeTextBox.value);
        if (isNaN(textVal))
            textVal = 0;
        var sliderVal = parseInt(timeSlider.value, 10)/100;
        return textVal + sliderVal;
    }

    function getTimeAdjustmentText(val) {        
        var prefix = val>0?'，总计推后 ':'，总计提前 '
        return prefix + Math.abs(val).toFixed(2) + ' 秒';
    }

    onTimeChangeFunc = function() {
        var val = getTimeAdjustmentVal()
        valueNode.innerHTML = getTimeAdjustmentText(val);

        if (val != 0)
        {
            updateSettings({action: 'adjSubSettings', 
            timeOffSet: val, 
            timeSliderVal: timeSlider.value, 
            timeTextBoxVal: timeTextBox.value, 
            heightSliderVal: heightSlider.value});
        }
    }    

    valueNode.innerHTML = getTimeAdjustmentText(getTimeAdjustmentVal());
    console.log('valueNode', getTimeAdjustmentText(getTimeAdjustmentVal()));
    timeTextBox.oninput = onTimeChangeFunc;
    timeSlider.oninput = onTimeChangeFunc;
    heightSlider.oninput = function(){
        updateSettings({action: 'adjSubSettings', 
        height: parseInt(heightSlider.value,10) + 80, 
        timeSliderVal: timeSlider.value, 
        timeTextBoxVal: timeTextBox.value, 
        heightSliderVal: heightSlider.value})
    }
}



function updateSettings(settings) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       chrome.tabs.sendMessage(tabs[0].id, settings);
    });
    chrome.runtime.sendMessage(settings)
  }

chrome.tabs.executeScript(null, { file: "netflixWatchContent.js" });

setTimeout(function () {
    doubanXHR();
}, 0000);