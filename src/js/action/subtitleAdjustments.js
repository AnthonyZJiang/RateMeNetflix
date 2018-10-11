var _timeOffsetTextBox = document.getElementById("subtitle-adjustment");
var _timeOffsetSlider = document.getElementById("subtitle-micro-adjustment-slider");
var _subHeightSlider = document.getElementById("subtitle-height-slider");
var _fontColourNodes = document.getElementsByName('colour-picker-radio');
var _fontSizeValNode = document.getElementById('subtitle-font-size-value');

function initialiseSubtitleAdjustments(){
    // switch
    document.getElementById("subtitle-switch").onchange = function (e) {
        _subtitleSettings.disabled = !e.srcElement.checked;
        updateSettings({action: 'updateSubSettings'});
    }

    // time
    initialiseTimeAdjustment();

    // subtitle height    
    initialiseSubHeightAdjustment();

    // font colour
    initialiseFontColorAdjustment();

    // font size
    initialiseFontSizeAdjustment();
    
}

function initialiseTimeAdjustment() {
    var timeValueNode = document.getElementById("subtitle-micro-adjustment-val");
    timeValueNode.innerHTML = getTotalTimeOffsetText();

    _timeOffsetTextBox.oninput = function() {
        var val = getTimeOffset1();

        if (val != _subtitleSettings.timeOffset1)
        {
            _subtitleSettings.timeOffset1 = val;
            timeValueNode.innerHTML = getTotalTimeOffsetText();
            updateSettings('');
        }
    };

    _timeOffsetSlider.oninput = function() {
        var val = getTimeOffset2();

        if (val != _subtitleSettings.timeOffset2)
        {
            _subtitleSettings.timeOffset2 = val;
            timeValueNode.innerHTML = getTotalTimeOffsetText();
            updateSettings('');
        }
    };
}

function getTimeOffset1() {
    var textVal = parseFloat(_timeOffsetTextBox.value);
    if (isNaN(textVal))
        textVal = 0;
    return isNaN(textVal) ? 0 : textVal;
}

function getTimeOffset2() {
    return parseInt(_timeOffsetSlider.value, 10) / 100;
}

function getTimeOffsetSliderVal() {
    return _subtitleSettings.timeOffset2 * 100;
}

function getTotalTimeOffsetText() {    
    var val = (_subtitleSettings.timeOffset1 + _subtitleSettings.timeOffset2);    
    var prefix = val>0?'，总计推后 ':'，总计提前 '
    return prefix + Math.abs(val).toFixed(2) + ' 秒';
}

function initialiseSubHeightAdjustment() {
    _subHeightSlider.oninput = function(){
        var height = parseInt(_subHeightSlider.value,10) + 80;

        if (height != _subtitleSettings.subHeight)
        {
            _subtitleSettings.subHeight = height;
            updateSettings('subHeight')
        }
    }
}

function getSubHeightSliderVal() {
    return _subtitleSettings.subHeight - 80;
}

function initialiseFontColorAdjustment() {
    for (let i in _fontColourNodes){
        _fontColourNodes[i].onchange = function(e) {
            var colour = e.srcElement.getAttribute('colourname');
            
            if (colour != _subtitleSettings.fontColour){
                _subtitleSettings.fontColour = colour;
                updateSettings('fontColour')
            }
        }
    }
}

function getSelectedFontColorBoxIdx() {
    for (var i in _fontColourNodes) {
        if (_fontColourNodes[i].getAttribute('colourname') == _subtitleSettings.fontColour) {
            return i;
        }
    }
}

function initialiseFontSizeAdjustment() {
    document.getElementById('subtitle-font-size-plus').onclick = function() {
        _subtitleSettings.fontSize += 2;        
        _fontSizeValNode.innerHTML = getFinalFontSizeString();
        updateSettings('fontSize')
    }
    document.getElementById('subtitle-font-size-minus').onclick = function() {
        _subtitleSettings.fontSize -= 2;      
        _fontSizeValNode.innerHTML = getFinalFontSizeString();
        updateSettings('fontSize')
    }
    
    _fontSizeValNode.innerHTML = getFinalFontSizeString();
}

function getFinalFontSizeString() {
    return 40 + _subtitleSettings.fontSize + 'px';
}
