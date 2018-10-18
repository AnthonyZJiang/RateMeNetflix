'use strict'

var _timeOffsetTextBox = document.getElementById("subtitle-adjustment");
var _timeOffsetSlider = document.getElementById("subtitle-micro-adjustment-slider");
var _subHeightSlider = document.getElementById("subtitle-height-slider");
var _fontColourNodes = document.getElementsByName('colour-picker-radio');
var _fontSizeValNode = document.getElementById('subtitle-font-size-value');

function initialiseSubtitlePanelEvents() {
    initialiseSubtitleSwitchEvent();
    initialiseTimeOffsetNodesEvents();
    initialiseSubHeightNodeEvent();
    initialiseFontColorNodesEvents();
    initialiseFontSizeNodesEvents();
}

// Subtitle switch
function initialiseSubtitleSwitchEvent() {
    document.getElementById("subtitle-switch").onchange = function (e) {
        _subtitleSettings.disabled = !e.srcElement.checked;
        updateSettings({
            action: 'updateSubSettings'
        });
    }
}

// Time offset
function initialiseTimeOffsetNodesEvents() {
    updateTimeOffsetLabelText()
    _timeOffsetTextBox.oninput = function () {
        var val = getTimeOffsetFromTextBox();

        if (val != _subtitleSettings.timeOffsetFromTextBox) {
            _subtitleSettings.timeOffsetFromTextBox = val;
            updateTimeOffsetLabelText()
            updateSettings('');
        }
    }

    _timeOffsetSlider.oninput = function () {
        var val = getTimeOffsetFromSlider();

        if (val != _subtitleSettings.timeOffsetFromSlider) {
            _subtitleSettings.timeOffsetFromSlider = val;
            updateTimeOffsetLabelText();
            updateSettings('');
        }
    }
}

function getTimeOffsetFromTextBox() {
    var textVal = parseFloat(_timeOffsetTextBox.value);
    if (isNaN(textVal))
        textVal = 0;
    return isNaN(textVal) ? 0 : textVal;
}

function getTimeOffsetFromSlider() {
    return parseInt(_timeOffsetSlider.value, 10) / 100;
}

function getTotalTimeOffsetText() {
    var val = (_subtitleSettings.timeOffsetFromTextBox + _subtitleSettings.timeOffsetFromSlider);
    var prefix = val > 0 ? '，总计推后 ' : '，总计提前 '
    return prefix + Math.abs(val).toFixed(2) + ' 秒';
}

// Subtitle height
function initialiseSubHeightNodeEvent() {
    _subHeightSlider.oninput = function () {
        var height = parseInt(_subHeightSlider.value, 10) + 80;

        if (height != _subtitleSettings.subHeight) {
            _subtitleSettings.subHeight = height;
            updateSettings('subHeight')
        }
    }
}

// Font colour
function initialiseFontColorNodesEvents() {
    for (let i = 0; i < _fontColourNodes.length; i++) {
        _fontColourNodes[i].onchange = function (e) {
            var colour = e.srcElement.getAttribute('colourname');

            if (colour != _subtitleSettings.fontColour) {
                _subtitleSettings.fontColour = colour;
                updateSettings('fontColour')
            }
        }
    }
}

// Font Size
function initialiseFontSizeNodesEvents() {
    document.getElementById('subtitle-font-size-plus').onclick = function () {
        _subtitleSettings.fontSize += 2;
        _fontSizeValNode.innerHTML = getFinalFontSizeString();
        updateSettings('fontSize')
    };

    document.getElementById('subtitle-font-size-minus').onclick = function () {
        _subtitleSettings.fontSize -= 2;
        _fontSizeValNode.innerHTML = getFinalFontSizeString();
        updateSettings('fontSize')
    }

    _fontSizeValNode.innerHTML = getFinalFontSizeString();
}