class Xhr {
    constructor (url, option) {
        this.url = url;
        this.option = option;
    }

    static async fetchDocument(url, option) {
        var xhr = new Xhr(url, option);
        try {
            xhr.response = await fetch(url, option);
        }
        catch (ex) {
            throw new FetchFailedException(ex);
        }
        xhr._checkResponseStatus();     
        xhr._parseHtmlText(await xhr.response.text());
        return xhr
    }

    async fetchDocument() {
        try {
            this.response = await fetch(this.url, this.option);
        }
        catch (ex) {
            throw new FetchFailedException(ex);
        }
        this._checkResponseStatus();     
        this._parseHtmlText(await this.response.text());
    }

    static async fetch(url, option) {
        var xhr = new Xhr(url, option);
        try {
            xhr.response = await fetch(url, option);
        }
        catch (ex) {
            throw new FetchFailedException(ex);
        }
        xhr._checkResponseStatus();
        return xhr
    }


    async fetch() {
        try {
            this.response = await this.fetch(this.url, this.option);
        }
        catch (ex) {
            throw new FetchFailedException(ex);
        }
        this._checkResponseStatus(); 
    }

    _checkResponseStatus() {
        if (this.response.status != 200) {
            throw new FetchResponseAnomalousException();
        }
    }    

    parseHtmlText(htmlText) {
        this.document = new DOMParser().parseFromString(htmlText, 'text/html');
    }
}