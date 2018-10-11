// modified from the original work by assafey available at https://goo.gl/ENUXrS; no license at the time of modification (11/10/2018).

var _subtitleSettings = {
    fontSize: 0,
    fontColour: '#fff',
    timeOffset1: 0,
    timeOffset2: 0,
    subHeight: 75,
    disabled: true
}

var _textSizeBase = 40;
var _started = false;
var _subsContainer = null;
var _currentIdx = -1;
var _timeoutToken = null;

chrome.runtime.onMessage.addListener(
    function(request) {
        // get watched status douban
        if (request.action == 'playSubtitle') {
            if (_started === false)
            {
                _started = true;
                _currentIdx = -1;
                waitForVideoElement(request.content)
            }
        }

        if (request.action == 'updateSubSettings'){
            _subtitleSettings = request.subtitleSettings;
            _currentIdx = -1;
            if (_subsContainer != null){
                if (request.settingContent === 'subHeight' || request.settingContent === 'all')
                {
                    _subsContainer.style.top = _subtitleSettings.subHeight.toString() + '%';
                    _subsContainer.style.height = (100 - _subtitleSettings.subHeight).toString() + '%';
                }
                if (request.settingContent === 'fontSize' || request.settingContent === 'all')
                {
                    _subsContainer.style.fontSize = (_textSizeBase + _subtitleSettings.fontSize).toString() + 'px';
                }
                if (request.settingContent === 'fontColour' || request.settingContent === 'all')
                {
                    _subsContainer.style.color = _subtitleSettings.fontColour;
                }
            }
        }
    }
);

function waitForVideoElement(subtitles) {
    var videos = document.getElementsByTagName("video");
    if (videos.length > 0) {
        var video = videos[0];
        
        appendSubtitlesContainer(video);                
        video.addEventListener("timeupdate", onTimeUpdate);
        video.addEventListener("abort", function() {
            console.log("%cPlayer closed");
            //clearSubtitleSettings();
            video.removeEventListener("timeupdate", onTimeUpdate);
        });
        video.addEventListener("pause", function() {
            console.log("%cPlayer paused.", 'color: red; background: black', _timeoutToken==null, _timeoutToken)
            if (_timeoutToken!=null){
                _timeoutToken.pause();
            }
        })
        video.addEventListener("play", function() {
            console.log("%cplayer started.", 'color: red; background: black', _timeoutToken==null, _timeoutToken)
            if (_timeoutToken!=null){
                _timeoutToken.resume();
            }
        })
        
        function onTimeUpdate() {        
            if (!_subtitleSettings.disabled) {
                var subsContainer = document.querySelector(".dbnf-subs-container");                    
                renderSubtitles(subsContainer, video.currentTime*1000, subtitles);
            }
        }

    } else {
        setTimeout(function() {
            waitForVideoElement(subtitles);
        }, 100);
    }
}

function appendSubtitlesContainer(video) {
    if (typeof video !== "undefined") {
        var videoContainer = video.parentNode;
        var subsContainer = document.createElement("DIV");
        subsContainer.className = 'dbr dbnf-subs-container';
        subsContainer.style.fontSize = (_textSizeBase + _subtitleSettings.fontSize).toString() + 'px';
        subsContainer.style.color = _subtitleSettings.fontColour;
        subsContainer.style.height = (1-_subtitleSettings.subHeight).toString() + '%';
        subsContainer.style.top = _subtitleSettings.subHeight.toString() + '%';
        videoContainer.appendChild(subsContainer);
        _subsContainer = subsContainer;
        //alwaysCheckThatSubtitlesContainerIsAppended();
    }
}

function alwaysCheckThatSubtitlesContainerIsAppended() {    
    if (document.querySelector(".dbnf-subs-container") === null) {        
        appendSubtitlesContainer();
    }

    var videos = document.getElementsByTagName("video");
    if (videos.length > 0) {
        setTimeout(alwaysCheckThatSubtitlesContainerIsAppended, 100);
    }
}

function renderSubtitles(subsContainer, currentTime, subtitles) {          
    var result = findSubtitleNaively(currentTime, subtitles);
    //console.log('result returned --> currentIdx:',_currentIdx, ';offset:',_subtitleSettings.timeOffset, ';result:', result);
    //console.log()
    if (result !== null && result.id !== _currentIdx) { 
        console.log('%cSub added -->', 'color: white; background: black', 't:', currentTime, result.subtitle); 
        _currentIdx = result.id;     
        var texts = result.subtitle.text.split('\n');
        var textToDisplay ='';
        texts.forEach(t => {
            textToDisplay += t + "<br>";
        }) 
        subsContainer.innerHTML = "<b>" + textToDisplay + "</b>";
        clearSubtitle(subsContainer, result.subtitle.endTime - currentTime, textToDisplay);
    }
}

function clearSubtitle(subsContainer, ms, text) {
    if (typeof ms === "undefined" && typeof text === "undefined") {
        subsContainer.innerHTML = "";
    }
    console.log('timeout', ms)
    _timeoutToken = new setTimeoutExtended(function() {
        console.log('clear sub',subsContainer.innerHTML.indexOf(text),text,subsContainer.innerHTML);
        if (subsContainer.innerHTML.indexOf(text) >= 0) {
            subsContainer.innerHTML = "";
            _timeoutToken = null;
        }
    }, ms);
}

function findSubtitleNaively(currentTime, subtitles) {
    for (var idx = 0; idx < subtitles.length; idx++) {
        var text = subtitles[idx].text;
        var start = subtitles[idx].startTime + parseInt(getTotalTimeOffsetMs(), 10);
        var end = subtitles[idx].endTime + parseInt(getTotalTimeOffsetMs(), 10);
        if (currentTime >= start && currentTime <= end) {
            return {subtitle: subtitles[idx], id: idx};
        }
    }

    return null;
}

function getTotalTimeOffsetMs() {
    return (_subtitleSettings.timeOffset1+_subtitleSettings.timeOffset2) * 1000
}

function clearSubtitleSettings(){
    chrome.runtime.sendMessage({action:'clearSubtitle'});
}

// class setTimeoutExtended {
//     constructor(callback, delay) {
//         var timerId, start, remaining = delay;
//         this.pause = function () {
//             console.log('timeout paused', remaining)
//             window.clearTimeout(timerId);
//             remaining -= new Date() - start;
//         };
//         this.resume = function () {
//             console.log('timeout started', remaining)
//             start = new Date();
//             window.clearTimeout(timerId);
//             timerId = window.setTimeout(callback, remaining);
//         };
//         this.resume();
//     }
// }

function setTimeoutExtended(callback, delay) {
    var timerId, start, remaining = delay;

    this.pause = function() {
        console.log('timeout paused', remaining)
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
    };

    this.resume = function() {
        console.log('timeout started', remaining)
        start = new Date();
        window.clearTimeout(timerId);
        timerId = window.setTimeout(callback, remaining);
    };

    this.resume();
}
