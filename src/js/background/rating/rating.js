'use strict'

var _movieRatingHist = [];
const QUERY_FAILED = -1;
const QUERY_FUZZY = 0;
const QUERY_SUCCESSFUL = 1;

const MOVIE_TEMPLATE = {
    id: '',
    title: '',
    episodeInfo: {},
    year: '',
    queryInProgress: false,
    doubanRating: {}
};

const RATING_RESULT_TEMPLATE = {  
    queryState: QUERY_FAILED,
    rating: '',
    ratingNum: 0,
    url: '',
    title: '',
    oriTitle: '',
    year: '',
    genres: '',
    image: ''
}

async function getRatings(movie) {
    if (!movie.id){
        error('Movie id is missing.');
    }

    for (var i in _movieRatingHist) {
        if (_movieRatingHist[i].id === movie.id) {
            return  _movieRatingHist[i];
        }
    }

    if (!movie.title) {
        error('Movie title is missing.');
    }

    _movieRatingHist.push(movie);
    movie.queryInProgress = true;
    await getDoubanRating(movie);
    movie.queryInProgress = false;
    return(movie);     
}

function getTitleTextOnly(text) {
    return text.replace(/[^\w\s]/g, ' ').trim();
}

function fuzzyTitleMatch(title, titleFromDB) {
    // only ignores symbols attached right after any words.
    return new RegExp(title.replace(/\s/g,'\\W+'), 'gi').exec(titleFromDB.trim());
}