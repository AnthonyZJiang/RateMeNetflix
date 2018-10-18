function getPlayingMovieRating() {
    var titleContainerNode = document.querySelector(".video-title");
    if (titleContainerNode) {
        var id = getPlayerMovieId();
        var title = getPlayerMovieTitle(titleContainerNode);
        var episodeInfo = getPlayerEpisode(titleContainerNode);
        getRatings(id, title, episodeInfo, '', function (r) { sendRatingToPopUp(r); });
    }
}

function sendRatingToPopUp(rating) {
    if (rating && rating.doubanRating.rating > 0 && !rating.queryInProgress) {
        //rating ready
        console.log(rating);
        chrome.runtime.sendMessage({
            action:'playingMovieInfo',
            content: rating
        })
    }
}

function getPlayerMovieId() {
    return document.querySelector('.VideoContainer').firstChild.id;
}

function getPlayerMovieTitle(titleContainerNode) {
    return titleContainerNode.getElementsByTagName('h4')[0].textContent;
}

function getPlayerEpisode(titleContainerNode) {
    var episodeInfo = {};
    Array.prototype.some.call(titleContainerNode.getElementsByTagName('span'), function(span) {
        if (span.classList.length == 0) {
            episodeInfo = extractEpisodeInfo(span.textContent);
            return true;
        }
    }); 
    return episodeInfo
}

if (document.URL.includes('watch')) {
    var rating = getPlayingMovieRating();
}