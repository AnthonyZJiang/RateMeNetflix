/*!
 * parseSrt and timeMs are modified work of the original work of Bazh (https://github.com/bazh/subtitles-parser)
 * Copyright (c) 2013 bazh <interesno@gmail.com>
 * Licensed under the MIT License
 */

function parseSrt(data)
{
    data = data.replace(/\r/g, '');
    var regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
    data = data.split(regex);
    data.shift();

    var items = [];
    for (var i = 0; i < data.length; i += 4) {
        items.push({
            id: data[i].trim(),
            startTime: timeMs(data[i + 1].trim()),
            endTime: timeMs(data[i + 2].trim()),
            text: data[i + 3].trim()
        });
    }
    return items;
}

function timeMs(val) {
    var regex = /(\d+):(\d{2}):(\d{2}),(\d{3})/;
    var parts = regex.exec(val);

    if (parts === null) {
        return 0;
    }

    for (var i = 1; i < 5; i++) {
        parts[i] = parseInt(parts[i], 10);
        if (isNaN(parts[i])) parts[i] = 0;
    }

    // hours + minutes + seconds + ms
    return parts[1] * 3600000 + parts[2] * 60000 + parts[3] * 1000 + parts[4];
};