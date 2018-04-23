// adopted from https://goo.gl/ENUXrS by assafey

var _textSize = "42px";
var _textColor = "white";
var _timeOffset = 0;
var _subHeight = '75';
var _disable = false;
var _started = false;
var _subtitleTimeOutToken = null;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // get watched status douban
        if (request.action == 'playSubtitle') {
            waitForVideoElement(request.content)
        }

        if (request.action == 'adjSubSettings'){
            if (typeof(request.timeOffSet)!='undefined')
                _timeOffset = request.timeOffSet * 1000;
            if (typeof(request.height)!='undefined')
            {
                _subHeight = request.height.toString();
                document.getElementById('netflix-subs-container').style.top = _subHeight + '%';
                document.getElementById('netflix-subs-container').style.height = (100 - request.height).toString + '%';
            }
            if (_subtitleTimeOutToken != null)
                clearTimeout(_subtitleTimeOutToken);
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
            console.log("Player closed");
            video.removeEventListener("timeupdate", onTimeUpdate);
            fetchSetting(start);
        });
        
        function onTimeUpdate() {        
            if (!_disable) {
                var subsContainer = document.getElementById("netflix-subs-container");                    
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
        subsContainer.id = "netflix-subs-container";
        subsContainer.style.width = "80%";
        subsContainer.style.height = "25%";
        subsContainer.style.top = _subHeight + '%';
        subsContainer.style.left = "10%";
        subsContainer.style.position = "inherit";    
        subsContainer.style.textAlign = "center";
        videoContainer.appendChild(subsContainer);
        
        //alwaysCheckThatSubtitlesContainerIsAppended();
    }
}

function alwaysCheckThatSubtitlesContainerIsAppended() {    
    if (document.getElementById("netflix-subs-container") === null) {        
        appendSubtitlesContainer();
    }

    var videos = document.getElementsByTagName("video");
    if (videos.length > 0) {
        setTimeout(alwaysCheckThatSubtitlesContainerIsAppended, 100);
    }
}

function renderSubtitles(subsContainer, currentTime, subtitles) {  
    subsContainer.style.fontSize = _textSize;
    subsContainer.style.color = _textColor;    
    var subtitle = findSubtitleNaively(currentTime, subtitles);
    if (subtitle !== null) {       
        var texts = subtitle.text.split('\n');
        var textToDisplay ='';
        texts.forEach(t => {
            textToDisplay += t + "<br>";
        }) 
        subsContainer.innerHTML = "<b>" + textToDisplay + "</b>";
        clearSubtitle(subsContainer, subtitle.endTime - subtitle.startTime, subtitle.text);
    }
}

function clearSubtitle(subsContainer, seconds, text) {
    if (typeof seconds === "undefined" && typeof text === "undefined") {
        subsContainer.innerHTML = "";
    }

    _subtitleTimeOutToken = setTimeout(function() {
        if (subsContainer.innerHTML.indexOf(text) >= 0) {
            subsContainer.innerHTML = "";
        }
    }, seconds);
}

function findSubtitleNaively(currentTime, subtitles) {
    for (var idx = 0; idx < subtitles.length; idx++) {
        var text = subtitles[idx].text;
        var start = subtitles[idx].startTime + parseInt(_timeOffset, 10);
        var end = subtitles[idx].endTime + parseInt(_timeOffset, 10);
        if (currentTime >= start && currentTime <= end) {
            return subtitles[idx];
        }
    }

    return null;
}