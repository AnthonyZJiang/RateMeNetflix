'use strict'

var _subtitleSettings;
var _movieId;

document.getElementById("subtitle-uploader").addEventListener('change', function (event) {
    let fileName = getSubtitleFileName(event.target.value);
    if (!fileName) {
        return;
    }
    checkSubtitleExtension(fileName);

    setSubtitleLabelText(fileName);
    if (this.files) {
        setSubtitle(getSubtitleInfo(fileName), event.target.files[0])
    }
});

// File
function getSubtitleFileName(filePathAndName) {
    return filePathAndName.split('\\').pop();
}

function checkSubtitleExtension(fileName) {
    let fileExt = getSubtitleFileExtension(fileName);
    if (fileExt != 'srt') {
        alert('抱歉，暂时只支持SRT格式的字幕文件。');
        return;
    }
}

function getSubtitleFileExtension(fileName) {
    return fileName.split('.').pop();
}

function setSubtitleLabelText(text) {
    document.getElementById("subtitle-uploader").nextElementSibling.childNodes[3].innerHTML = text;
}

function setSubtitle(subtitleInfo, subtitleFile) {
    let reader = new FileReader();

    reader.onloadend = function () {
        resetSubtitleSettings();

        updateSettings({
            subtitleSettings: _subtitleSettings
        });

        sendLoadSubtitleMessage({
            subtitleObj: reader.result,
            subtitleInfo: subtitleInfo
        });

        unHideSubtitleSettingsPanel();
    }

    reader.readAsText(subtitleFile, 'chinese');
}

function getSubtitleInfo(fileName) {
    return {
        fileName: fileName,
        movieId: _movieId
    }
}

function updateSettings(settingContent) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateSubSettings',
            subtitleSettings: _subtitleSettings,
            settingContent: settingContent
        });
    });
    chrome.runtime.sendMessage({
        action: 'updateSubSettings',
        content: _subtitleSettings
    })
}

function resetSubtitleSettings() {
    _subtitleSettings = {
        fontSize: 0,
        fontColour: '#fff',
        timeOffsetFromTextBox: 0,
        timeOffsetFromSlider: 0,
        subHeight: 75,
        disabled: false
    }
}

function unHideSubtitleSettingsPanel() {
    document.getElementById("subtitle-settings-panel").style = "display: initial";
}

function sendLoadSubtitleMessage(subtitleContent) {
    chrome.runtime.sendMessage({
        action: 'loadSubtitle',
        content: subtitleContent
    });
}

function sendGetLoadedSubtitleInfo(movieId) {
    chrome.runtime.sendMessage({
        action: "getLoadedSubtitle"
    }, function (response) {
        if (response != null) {
            console.log('settings received', response);
            if (response.subtitleInfo.movieId == movieId) {
                setSubtitleSettingsFromLoadedSubtitle(response);
                chrome.runtime.sendMessage({
                    action: "replaySubtitle"
                });
                updateSettings('all');
            }
        }
        initialiseSubtitlePanelEvents();
    })
}

function setSubtitleSettingsFromLoadedSubtitle(loadedSubtitle) {
    _subtitleSettings = loadedSubtitle.subtitleSettings;
    //subtitle file name label
    document.getElementById("subtitle-uploader").nextElementSibling.innerHTML = loadedSubtitle.subtitleInfo.fileName;
    setSubtitleNodesFromSubtitleSettings();
    unHideSubtitleSettingsPanel();
}

function setSubtitleNodesFromSubtitleSettings() {
    //time offset slider
    _timeOffsetSlider.value = getTimeOffsetSliderVal();
    //time offset text box
    _timeOffsetTextBox.value = getTimeOffsetTextboxVal();
    //time offset final value label
    updateTimeOffsetLabelText();
    //subtitle height slider
    _subHeightSlider.value = getSubHeightSliderVal();
    //font colour check box
    _fontColourNodes[getSelectedFontColorBoxIdx()].checked = true;
    //font size label
    _fontSizeValNode.innerHTML = getFinalFontSizeString();
    //subtitle switch
    document.getElementById('subtitle-switch').checked = !_subtitleSettings.disabled;
    //subtitle panel
    document.getElementById('subtitle-collapse').className = getSubtitlePanelClassName();
}

function getTimeOffsetSliderVal() {
    return _subtitleSettings.timeOffsetFromSlider * 100;
}

function getTimeOffsetTextboxVal() {
    return _subtitleSettings.timeOffsetFromTextBox.toString();
}

function updateTimeOffsetLabelText() {
    document.getElementById("subtitle-micro-adjustment-val")
        .innerHTML = getTotalTimeOffsetText();
}

function getSubHeightSliderVal() {
    return _subtitleSettings.subHeight - 80;
}

function getSelectedFontColorBoxIdx() {
    for (var i in _fontColourNodes) {
        if (_fontColourNodes[i].getAttribute('colourname') == _subtitleSettings.fontColour) {
            return i;
        }
    }
}

function getFinalFontSizeString() {
    return 40 + _subtitleSettings.fontSize + 'px';
}

function getSubtitlePanelClassName() {
    return _subtitleSettings.disabled ? 'collapse' : 'collapse in';
}