'use strict'

const DOUBAN_API_KEY = '0df993c66c0c636e29ecbb5344252a4a';
const DOUBAN_URL = 'https://api.douban.com/v2/movie/';
const GOODMOVIES_URL = 'https://goodmovies.io/rating';

function fetchDoubanDetailByImdbId(imdbId) {
    return new Promise((resolve, reject) => {
        fetch(DOUBAN_URL + 'imdb/' + imdbId + '?apikey=' + DOUBAN_API_KEY, {cache: "force-cache"})
        .then (function (response) {
            return response.json();
        })
        .then (json => {resolve(json);})
        .catch (error => reject(error))
    })
}

function fetchDoubanSubject(doubanId) {
    return new Promise((resolve, reject) => {
        fetch(DOUBAN_URL + 'subject/' + doubanId + '?apikey=' + DOUBAN_API_KEY, {cache: "force-cache"})
        .then (function (response) {
            return response.json();
        })
        .then (json => {resolve(json);})
        .catch (error => reject(error))
    })
}

function fetchImdbId(netflixId, title) {
    var data = {"version": "3", "queries": [{"netflixId": netflixId, "title": title}]}

    return new Promise((resolve, reject) => {
        fetch(GOODMOVIES_URL, {
            body: JSON.stringify(data),
            headers: {
              'content-type': 'application/json'
            },
            method: 'POST',
            cache: "force-cache"
        })
        .then (function (response) {
            return response.json();
        })
        .then (json => {resolve(json);})
        .catch (error => reject(error))
    })
}

async function getImdbId(netflixId, title) {
    var js = await fetchImdbId(netflixId, title);
    var linkSplit = js[0].link.split("/");
    var imdbId = linkSplit[linkSplit.length - 2];
    return imdbId;
}

async function getDoubanDetail(imdbId) {
    var js = await fetchDoubanDetailByImdbId(imdbId);
    return js;
}

async function getDoubanId(imdbId) {
    var js = await getDoubanDetail(imdbId);
    var idSplit = js.id.split("/");
    var doubanId = idSplit[idSplit.length - 1];
    return doubanId;
}

async function getDoubanRating(movie) {
    var result = clone(RATING_RESULT_TEMPLATE);
    var imdbId = await getImdbId(movie.id, movie.title);
    if (!imdbId) {
        result.queryState = QUERY_FAILED;
        return;
    }

    var doubanId = await getDoubanId(imdbId);
    if (!doubanId) {
        result.queryState = QUERY_FAILED;
        return;
    }
    
    var subject = await fetchDoubanSubject(doubanId);
    if (!subject) {
        result.queryState = QUERY_FAILED;
        return;
    }

    result.queryState = QUERY_SUCCESSFUL;
    extractDoubanMatchedData(result, subject)
    movie.doubanRating = result;
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