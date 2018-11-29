function createTestNetflixPlayer(callback) {
    chrome.tabs.create({url:getTestFileUrl('NetflixTestPlayer.html')}, callback);
}

function getTestFileUrl(file) {
    return chrome.runtime.getURL('test/' + file);
}