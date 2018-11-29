chrome.runtime.sendMessage({action:'zimukuIframeLoaded'}, (url) => {
    await fetchFinalDownloadUrl(getCorsUrl(url));
    
});

function sendFinalUrl(url){
    chrome.runtime.sendMessage({action:'finalUrlFetched', content: url})
}

function getFileName(headers) {
    return headers.get('Content-Disposition').match('"(.+)"')[1];
}

async function fetchFinalDownloadUrl(url) {
    var header = await fetchDownloadPageHeader(url);
    var finalUrl = header.get('X-Final-Url');
    if (!finalUrl) {
        throw new FetchResponseAnomalousException();
    }
    return finalUrl;
}

async function fetchDownloadPageHeader(url) {
    return (await Xhr.fetch(url)).header;
}

function getCorsUrl(url) {
    return 'https://corsanthony.herokuapp.com/' + url;
}