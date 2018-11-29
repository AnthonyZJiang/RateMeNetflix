async function getSubtitle() {
    subfinder = new ZimukuSubtitleFinder(_currentMovieObject.title, _currentMovieObject.year);
    await subfinder.findSubtitle();
    console.log(subfinder.subtitles);
}