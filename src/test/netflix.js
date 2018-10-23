function createTestNetflixPlayer() {
    var htmlText = '<html><body><div class="VideoContainer"><div id="12345"></div></div><div class="video-title"><h4>La La Land</h4></div></body></html>';
    document = new DOMParser.parseFromString(htmlText)
}