'use strict'

const DOUBAN_URL = 'https://api.douban.com/v2/movie/';

function fetchDoubanRating(query) {
    return new Promise((resolve, reject) => {
        fetch(DOUBAN_URL + 'search?q=' + encodeURI(query), {cache: "force-cache"})
        .then (function (response) {
            return response.json();
        })
        .then (json => {resolve(json);})
        .catch (error => reject(error))
    })
}

async function getDoubanRating(movie) {
    var result = clone(RATING_RESULT_TEMPLATE);

    var title = getTitleTextOnly(movie.title);
    var season = getChineseEpisodeNumber(movie.episodeInfo["season"]);
    var year = movie.year;

    var js = await fetchDoubanRating(`${title} ${season} ${year}`);

    if (js.subjects.length === 0) {
        result.queryState = QUERY_FAILED;
        return;
    }

    // Chinese movie name could be slightly different from English ones.
    // Therefore, check year first.
    var yearMatchedMovies = js.subjects;
    if (year) {
        if (!(yearMatchedMovies = doubanMatchYear(year, js.subjects)).length) {
            result.queryState = QUERY_FAILED;
            return;
        }
    }
    var match = doubanMatchTitleSeason(title, season, yearMatchedMovies);

    if (!match) {
        // return the first one and set fuzzy
        result.queryState = QUERY_FUZZY;
        match = yearMatchedMovies[0];
    } else {
        result.queryState = QUERY_SUCCESSFUL;
    }
    extractDoubanMatchedData(result, match)
    movie.doubanRating = result;
}

function doubanMatchYear(year, subjects) {
    var yearMatchedMovies = [];
    for (let i in subjects) {
        if (year == subjects[i].year.trim()) {
            yearMatchedMovies.push(subjects[i]);
        }
    }

    return yearMatchedMovies;
}

function doubanMatchTitleSeason(title, season, subjects) {
    for (let i in subjects) {
        if (!subjects[i]) {
            continue;
        }
        // check title
        if (!fuzzyTitleMatch(title, subjects[i].original_title) && !fuzzyTitleMatch(title, subjects[i].title)) {
            continue;
        }

        // if no season text
        if (!season) {
            return subjects[i];
        }

        // check season
        if (subjects[i].title.includes(season) || subjects[i].original_title.includes(season)) {
            return subjects[i];
        }
    }
    return undefined;
}

function extractDoubanMatchedData(result, match) {
    result.rating = match.rating.average;
    result.ratingNum = match.collect_count;
    result.url = match.alt;
    result.title = match.title;
    result.oriTitle = match.original_title;
    result.year = match.year;
    result.genres = match.genres.join(', ');
    result.image = match.images.small;
}

function getChineseEpisodeNumber(numberText) {
    if (!numberText || isNaN(parseInt(numberText)) || parseInt(numberText) < 1) {
        return '';
    }
    return '第' + getChineseNumber(numberText) + '季';
}

// only works for numbers from 1 to 99.
function getChineseNumber(number) {   
    switch (number) {
        case '0':
            return "十"
        case '1':
            return "一";
        case '2':
            return "二";
        case '3':
            return "三";
        case '4':
            return "四";
        case '5':
            return "五";
        case '6':
            return "六";
        case '7':
            return "七";
        case '8':
            return "八";
        case '9':
            return "九";
        case '10':
            return "十";
        default:
            if (number.substr(0,1) == '1') {
                return '十' + getChineseNumber(number.substr(1,1));
            } else if (number.substr(1,1) == '0') {
                return getChineseNumber(number.substr(0,1)) + '十';
            } else {
                return getChineseNumber(number.substr(0,1)) + '十' + getChineseNumber(number.substr(1,1));
            }

    } 
}