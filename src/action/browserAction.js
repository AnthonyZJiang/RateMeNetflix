var NO_MOVIE = -99;
var QUERY_FAILED = -1;
var QUERY_SUCCESSFUL = 1;
var _movieId;
var _subtitleSettings;
var TEXT_ZOOM_MAX = 3;
var TEXT_ZOOM_MIN = 0.5;

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

subtitleUploader();
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
        console.log('query successful:',c);
        console.log('movieId:',_movieId)
        getLoadedSubtitleInfo(c.movieId);

        // add poster
        let e = document.createElement('IMG');
        e.className = 'movie-poster';
        e.src = c.imageUrl;
        let node = document.getElementById('td-movie-poster');
        node.height = '28px';
        node.appendChild(e);
        // add title
        e = createDivNode('movie-title', c.doubanTitle + '(' + c.year + ')');
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
        // subhd link
        e = document.getElementById('subtitle-subhd-link');
        e.href = "http://subhd.com/search0/" + c.originalTitle.replace(/[!"%$£^&*()@\':;#~,.?><|\\//]+/g,' ') + '%20' + c.year;
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
            if (response.subtitleInfo.movieId === movieId)
            {    
                console.log('settings sliderVal', response.subtitleInfo.sliderVal);
                console.log('settings textBoxVal', response.subtitleInfo.textBoxVal);
                document.getElementById("subtitle-uploader").nextElementSibling.innerHTML = response.subtitleInfo.fileName;
                document.getElementById("subtitle-settings-panel").style = "display: initial";
                document.getElementById("subtitle-micro-adjustment-slider").value = response.subtitleInfo.timeSliderVal;
                document.getElementById("subtitle-adjustment").value = response.subtitleInfo.timeTextBoxVal;
                document.getElementById("subtitle-height-slider").value = response.subtitleInfo.heightSliderVal;
                document.getElementById(response.subtitleInfo.colourPickerChecked).checked = true;
                document.getElementById('subtitle-font-size-value').innerHTML = (_subtitleSettings.textZoom * 100).toString() + '%';
                _subtitleSettings = response.subtitleSettings;
                document.getElementById('subtitle-switch').checked = !_subtitleSettings.disabled;
                document.getElementById('subtitle-collapse').className = _subtitleSettings.disabled?'collapse':'collapse in';
                chrome.runtime.sendMessage({action:"replaySubtitle"})
            }
        }
        subtitleAdjustments();
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

            reader.readAsText(e.target.files[0],'chinese');
        }
        else
            label.innerHTML = labelVal;
    });
}

function subtitleAdjustments(){
    // switch
    document.getElementById("subtitle-switch").onchange = function (e) {
        _subtitleSettings.disabled = !e.srcElement.checked;
        updateSettings({action: 'updateSubSettings'});
    }

    // time
    var timeTextBox = document.getElementById("subtitle-adjustment");
    var timeSlider = document.getElementById("subtitle-micro-adjustment-slider");
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

        if (val != _subtitleSettings.timeOffset)
        {
            _subtitleSettings.timeOffset = val*1000;
            updateSettings({action: 'updateSubSettings',
            timeSliderVal: timeSlider.value, 
            timeTextBoxVal: timeTextBox.value});
        }
    }    

    valueNode.innerHTML = getTimeAdjustmentText(getTimeAdjustmentVal());
    console.log('valueNode', getTimeAdjustmentText(getTimeAdjustmentVal()));
    timeTextBox.oninput = onTimeChangeFunc;
    timeSlider.oninput = onTimeChangeFunc;

    // height    
    var heightSlider = document.getElementById("subtitle-height-slider");
    heightSlider.oninput = function(){
        var height = parseInt(heightSlider.value,10) + 80;

        if (height != _subtitleSettings.subHeight)
        {
            _subtitleSettings.subHeight = height;
            updateSettings({action: 'updateSubSettings', 
            heightSliderVal: heightSlider.value}, 'height')
        }
    }

    // colour
    var colourNodes = document.getElementsByName('colour-picker-radio');
    for (let i = 0; i<colourNodes.length; i++){
        colourNodes[i].onchange = function(e) {
            var colour = e.srcElement.getAttribute('colourname');
            
            if (colour != _subtitleSettings.textColour){
                _subtitleSettings.textColour = colour;
                updateSettings({action: 'updateSubSettings',
                colourPickerChecked: e.srcElement.id}, 'colour')
            }
        }
    }

    // text size
    var sizeValNode = document.getElementById('subtitle-font-size-value');
    document.getElementById('subtitle-font-size-plus').onclick = function() {
        _subtitleSettings.textZoom += 0.1;        
        if (_subtitleSettings.textZoom > TEXT_ZOOM_MAX)
        _subtitleSettings.textZoom = TEXT_ZOOM_MAX;
        sizeValNode.innerHTML = (_subtitleSettings.textZoom * 100).toFixed(0) + '%';
        updateSettings({subtitleSettings: _subtitleSettings}, 'textZoom')
    }
    document.getElementById('subtitle-font-size-minus').onclick = function() {
        _subtitleSettings.textZoom -= 0.1;      
        if (_subtitleSettings.textZoom < TEXT_ZOOM_MIN)
            _subtitleSettings.textZoom = TEXT_ZOOM_MIN;
        sizeValNode.innerHTML = (_subtitleSettings.textZoom * 100).toFixed(0) + '%';
        updateSettings({subtitleSettings: _subtitleSettings}, 'textZoom')
    }
}

function updateSettings(settings, settingContent) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       chrome.tabs.sendMessage(tabs[0].id, {action: 'updateSubSettings', subtitleSettings:_subtitleSettings, settingContent: settingContent});
    });
    settings.subtitleSettings = _subtitleSettings;
    chrome.runtime.sendMessage(settings)
  }

function resetSubtitleSettings(){
    _subtitleSettings = {
        textZoom: 1,
        textColour: '#fff',
        timeOffset: 0,
        subHeight: 75,
        disabled: false
    }
}

chrome.tabs.executeScript(null, { file: "netflixWatchContent.js" });

