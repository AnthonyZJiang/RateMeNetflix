var NO_MOVIE = -99;
var QUERY_FAILED = -1;
var QUERY_SUCCESSFUL = 1;
var _movieId;
var _subtitleSettings;

window.addEventListener('click',function(e){
    if(e.target.href!==undefined){
        chrome.tabs.create({url:e.target.href})
    }
})

chrome.runtime.onMessage.addListener(
    function(request) {
        console.log('(popup.js) Message received: ', request.action)
        if (request.action === 'playingMovieInfo') {
            // if content is null - not on watch page
            // else check queryStatus
            if (!request.content) {
                addContents({status: NO_MOVIE});
            } else if (!request.content.queryInProgress) {
                addContents({status: QUERY_SUCCESSFUL, content: request.content});
                getLoadedSubtitleInfo(request.content.id);
            }
            
        }
    }
);

addSubtitleUploaderListener();
resetSubtitleSettings();

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
    if (query.status == NO_MOVIE) {
        let e = createDivNode('no-movie', '');
        let p = document.createElement('P');
        p.innerText = '没有播放任何电影';
        document.getElementById("movie-content").appendChild(e.appendChild(p));
        return;
    } else if (query.content.doubanRating.queryState == -1) {
        let e = createDivNode('no-movie', '');
        let p = createPNode('未搜索到电影');
        document.getElementById("movie-content").appendChild(e.appendChild(p));
        return;
    } else {
        c = query.content;
        dbr = c.doubanRating;
        console.log('query successful:',c);
        console.log('movieId:',c.id)
        _movieId = c.id;

        // add poster
        let e = document.createElement('IMG');
        e.className = 'movie-poster';
        e.src = dbr.image;
        let node = document.getElementById('td-movie-poster');
        node.height = '28px';
        node.appendChild(e);
        // add title
        e = createDivNode('movie-title', dbr.title + '(' + c.year + ')');
        node = document.getElementById('td-movie-title');
        node.height = '28px';
        node.appendChild(e);
        // add rating and rating number
        e = createSpanNode('movie-rating', dbr.rating);
        node = document.getElementById('td-movie-rating');
        node.height = '28px';
        node.appendChild(e);
        e = createSpanNode('movie-rating-num', ` (${dbr.ratingNum}人看过)`);
        node.appendChild(e);
        // add title
        e = createDivNode('movie-meta', dbr.genres);
        node = document.getElementById('td-movie-meta');
        node.height = '28px';
        node.appendChild(e);
        // add button
        e = document.createElement('INPUT');
        e.value = "电影页面";
        e.type = "button";
        e.class = "movie-link";
        e.onclick = function () {chrome.tabs.create({url:dbr.url})}
        node = document.getElementById('td-movie-link');
        node.appendChild(e);
        // subhd link
        e = document.getElementById('subtitle-subhd-link');
        e.href = "http://subhd.com/search0/" + dbr.oriTitle.replace(/[!"%$£^&*()@\':;#~,.?><|\\//]+/g,' ') + '%20' + c.year;
        // un-hide table
        document.getElementById("movie-content-table").style = "display: initial";
        // un-hide subtitle
        document.getElementById("subtitle-panel").style = "display: block";
    }
}

function getLoadedSubtitleInfo(movieId){
    chrome.runtime.sendMessage({action:"getLoadedSubtitle"}, function (response) {
        if (response != null)
        {
            console.log('settings received', response);
            if (response.subtitleInfo.movieId == movieId)
            {    
                _subtitleSettings = response.subtitleSettings;
                //subtitle name label
                document.getElementById("subtitle-uploader").nextElementSibling.innerHTML = response.subtitleInfo.fileName;
                document.getElementById("subtitle-settings-panel").style = "display: initial";
                //time offset slider
                _timeOffsetSlider.value = getTimeOffsetSliderVal();
                //time offset text box
                _timeOffsetTextBox.value = _subtitleSettings.timeOffset1.toString();
                //subtitle height slider
                _subHeightSlider.value = getSubHeightSliderVal();
                //font colour check box
                _fontColourNodes[getSelectedFontColorBoxIdx()].checked = true;
                //font size label
                _fontSizeValNode.innerHTML = getFinalFontSizeString();
                //subtitle switch
                document.getElementById('subtitle-switch').checked = !_subtitleSettings.disabled;
                //subtitle panel
                document.getElementById('subtitle-collapse').className = _subtitleSettings.disabled?'collapse':'collapse in';
                chrome.runtime.sendMessage({action:"replaySubtitle"})
                updateSettings('all');
            }
        }
        initialiseSubtitleAdjustments();
    })
}

function addSubtitleUploaderListener(){
    var input = document.getElementById("subtitle-uploader");
    var label = input.nextElementSibling,
        labelVal = label.innerHTML;
    input.addEventListener('change', function(event)
    {   
        let fileName = '';        
        let fileExt = event.target.value.split('.').pop();

        if (this.files)
            fileName = event.target.value.split('\\').pop();

        if (fileName && fileExt!='srt'){
            alert('抱歉，暂时只支持SRT格式的字幕文件。');
            fileName = '';
        }
        
        if (fileName){
            setSubtitleFile(label, fileName, event.target.files[0])
        }
        else
            label.innerHTML = labelVal;
    });
}

function setSubtitleFile(subtitleNameLabel, fileName, targetFile) {
    subtitleNameLabel.childNodes[3].innerHTML = fileName;
    let reader = new FileReader();
    reader.onloadend = function (){
        resetSubtitleSettings();
        updateSettings({subtitleSettings:_subtitleSettings});
        chrome.runtime.sendMessage({action: 'loadSubtitle', content: {
            subtitleObj: reader.result,
            subtitleInfo: {
                fileName: fileName,
                movieId: _movieId}
            }});
        document.getElementById("subtitle-settings-panel").style = "display: initial";
    }

    reader.readAsText(targetFile,'chinese');
}

function updateSettings(settingContent) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       chrome.tabs.sendMessage(tabs[0].id, {action: 'updateSubSettings', subtitleSettings:_subtitleSettings, settingContent: settingContent});
    });
    chrome.runtime.sendMessage({action: 'updateSubSettings', content: _subtitleSettings})
  }

function resetSubtitleSettings(){
    _subtitleSettings = {
        fontSize: 0,
        fontColour: '#fff',
        timeOffset1: 0,
        timeOffset2: 0,
        subHeight: 75,
        disabled: false
    }
}

chrome.tabs.getSelected(null, function(tab) {
    if (/.*\.netflix\.com\/watch.*/.test(tab.url)) {
        chrome.tabs.executeScript(null, { file: "js/playerContents.js" });
    }
})