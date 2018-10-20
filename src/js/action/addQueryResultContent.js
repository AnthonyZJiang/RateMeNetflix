'use strict'

var QUERY_FAILED = -1;
var QUERY_SUCCESSFUL = 1;

function addQueryResultToDocument(movieObject) {
    if (movieObject.doubanRating.queryState == QUERY_FAILED) {
        addQueryFailedContent();
        return;
    } else {
        console.assert(movieObject.doubanRating.queryState == QUERY_SUCCESSFUL)
        addMovieContent(movieObject);
    }
}

function addQueryFailedContent() {
    var e = createDivNode('no-movie', '');
    var p = createPNode('未搜索到电影');
    document.getElementById("movie-content").appendChild(e.appendChild(p));
}

function addMovieContent(movieObject) {
    var dbr = movieObject.doubanRating;
    _movieId = movieObject.id;

    // add contents
    addMoviePoster(dbr.image);
    addMovieTitleYear(dbr.title, dbr.year);
    addMovieRatingAndRatingNumber(dbr.rating, dbr.ratingNum);
    addMovieGenres(dbr.genres);
    addGoToMoviePageButton(dbr.url);
    addSubQueryUrl(getSubQueryUrl(dbr.oriTitle, dbr.year));
    unHideMovieContentTableElement();
    unHideSubtitleElement();
    hideDoubanQueryNode();
}

function addMoviePoster(source) {
    getTableElementByIdAndSetHeight('td-movie-poster')
        .appendChild(createMoviePosterElement(source));
}

function createMoviePosterElement(source) {
    var e = document.createElement('IMG');
    e.className = 'movie-poster';
    e.src = source;
    return e;
}

function addMovieTitleYear(title, year) {
    getTableElementByIdAndSetHeight('td-movie-title')
        .appendChild(createDivNode('movie-title', title + '(' + year + ')'));
}

function addMovieRatingAndRatingNumber(rating, ratingNumber) {
    var node = getTableElementByIdAndSetHeight('td-movie-rating');
    node.appendChild(createSpanNode('movie-rating', rating));
    node.appendChild(createSpanNode('movie-rating-num', ` (${ratingNumber}人看过)`));
}

function addMovieGenres(genres) {
    getTableElementByIdAndSetHeight('td-movie-meta')
        .appendChild(createDivNode('movie-meta', genres));
}

function addGoToMoviePageButton(url) {
    document.getElementById('td-movie-link')
        .appendChild(createGoToMoviePageButtonElement(url));
}

function createGoToMoviePageButtonElement(url) {
    var e = document.createElement('INPUT');
    e.value = "电影页面";
    e.type = "button";
    e.class = "movie-link";
    e.onclick = function () {
        chrome.tabs.create({
            url
        })
    }
    return e;
}

function addSubQueryUrl(url) {
    document.getElementById('subtitle-subquery-link').href = url;
}

function getSubQueryUrl(title, year) {
    return "https://www.zimuku.cn/search?q=" + getSubQueryText(title, year);
}

function getSubQueryText(title, year) {
    return title.replace(/[^\w\d]/g, '+') + '+' + year;
}

function unHideMovieContentTableElement() {
    document.getElementById("movie-content-table").style = "display: initial";
}

function unHideSubtitleElement() {
    document.getElementById("subtitle-panel").style = "display: block";
}

function getTableElementByIdAndSetHeight(elementId) {
    var node = document.getElementById(elementId);
    node.height = '28px';
    return node;
}

function hideDoubanQueryNode() {
    document.getElementById('db-query-wrapper').style = "display: none;";
}

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