var zimukuSubtitleType = Object.freeze({
    "Eng": 1,
    "Chs": 2,
    "Cht": 3,
    "Dual": 4,
});

var zimukuSubtitleTypeName = Object.freeze({
    "Eng": "English字幕",
    "Chs": "简体中文字幕",
    "Cht": "繁體中文字幕",
    "Dual": "双语字幕",
});

var zimukuDownloadSite = 'http://www.subku.net/dld/';

class ZimukuSubtitle {
    constructor(tdNode) {
        this.tdNode = tdNode;
        this.parse();
    }

    parse() {
        this._parseUrl();
        this._parseTitle();
        this._parseTypes();
    }

    async download() {
        if (!this.downloadUrls) {
            await fetchDownloadUrls();
        }
        chrome.runtime.sendMessage({action:'createZimukuIframe', content: this.downloadUrls[0]})
        //await this._tryDownloadUntilSuccessful(urls);
    }    

    async fetchDownloadUrls() {        
        await this._fetchDownloadDocument();
        this.downloadUrls = new Array();
        var dlNodes = this._getAllDownloadNodes();
        for (var i = 0; i<dlNodes.length; i++) {
            this.downloadUrls.push(this._getDownloadUrlFromNodes(dlNodes[i]));
        }
    }

    async _fetchDownloadDocument() {
        this.document = (await Xhr.fetchDocument(this.queryUrl)).document;
    }

    _getAllDownloadNodes() {
        return this.document.querySelectorAll('.btn-sm');
    }

    _getDownloadUrlFromNodes(node) {
        return node.href;
    }

    async _tryDownloadUntilSuccessful(urls) {
        for (var i = 0; i < urls.length; i++) {
            this.downloadId = await this._downloadFileFromUrl(urls[i]);
            if (this.downloadId) {
                break;
            }
        }
    }

    _downloadFileFromUrl(url) {
        return new Promise((resolve, reject) => {
            chrome.downloads.download({url: url}, (id) => {
                if (!id) {
                    reject();
                    return;
                }
                resolve(id);
            });
        });
    }

    _parseUrl() {
        this.url = zimukuDownloadSite + this._getIdFromHref();
    }

    _parseTitle() {
        this.title = this.aNode.title;
    }

    _getIdFromHref() {
        return this.aNode.getAttribute('href').split('/').pop();
    }

    _parseTypes() {
        this.types = new Array();
        this.typeBits = [0, 0, 0, 0];
        this._splitTypes().forEach((type) => {
            if (type) {
                this.types.push(type);
                this._setTypeBit(type);
            }
        })
    }

    _splitTypes() {
        return this.imgNode.alt.split(/\s/);
    }

    _setTypeBit(type) {
        switch (type) {
            case zimukuSubtitleTypeName.Eng:
                this.typeBits[zimukuSubtitleType.Eng] = 1;
            case zimukuSubtitleTypeName.Chs:
                this.typeBits[zimukuSubtitleType.Chs] = 1;
            case zimukuSubtitleTypeName.Cht:
                this.typeBits[zimukuSubtitleType.Cht] = 1;
            case zimukuSubtitleTypeName.Dual:
                this.typeBits[zimukuSubtitleType.Dual] = 1;
        }
    }

    get aNode() {
        return this.tdNode.querySelector('a');
    }

    get imgNode() {
        return this.tdNode.querySelector('img');
    }

    get queryUrl() {
        return _corsApi + this.url;
    }
}