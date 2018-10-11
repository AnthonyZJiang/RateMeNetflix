/*!
 * extractSeasonNumber and extractEpisodeInfo are the original work of Tanner Rutgers (https://github.com/tanner-rutgers/RateFlix/)
 * Copyright tanner-rutgers
 * Licensed under the Apache License
 * 
 * extractYear is a modified work from the original work of Tanner Rutgers (https://github.com/tanner-rutgers/RateFlix/)
 * Copyright tanner-rutgers, Copyright 2018 Zhengyi Jiang
 * Licensed under the Apache License
 */ 

function extractSeasonNumber(seasonText) {
    var regex = /(S|s)eason (\d+)/
    var match = regex.exec(seasonText);
    if (match) {
        return match[2];
    }
    return '';
}
  
function extractEpisodeInfo(episodeText) {
    var info = {};
    if (episodeText) {
        var regex = /\D*(\d+)\D*(\d+)/
        var match = regex.exec(episodeText);
        info["season"] = match[1];
        info["episode"] = match[2];
    }
    return info;
}

function extractYear(containerNode) {
    yearNode = containerNode.querySelector(".year");
    year = yearNode ? yearNode.textContent : '';

    // Try to guess first year of TV show (Netflix usually uses last season year)
    durationNode = containerNode.querySelector(".duration");
    if (durationNode) {
        if (match = /(\d+) Seasons?/.exec(durationNode.textContent)) {
            year = year - (match[1] - 1);
        }
    }

    return year < 1900 ? '' : year;
}

function extractID(containerNode) {
    idNode = containerNode.querySelector('a[href^="/title/"]');
    if (!idNode)
        return '';
    var linkTexts = idNode.href.split('/');
    
    return linkTexts[linkTexts.length - 1];
}