'use strict'

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
    addSubHdUrl(getSubHdUrl(dbr.oriTitle, dbr.year));
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

function addSubHdUrl(url) {
    document.getElementById('subtitle-subhd-link').href = url;
}

function getSubHdUrl(title, year) {
    return "http://subhd.com/search0/" + title.replace(/[!"%$£^&*()@\':;#~,.?><|\\//]+/g, ' ') + '%20' + year
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