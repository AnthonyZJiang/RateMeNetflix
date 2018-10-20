class ZimukuSubtitleFinder {
    constructor (title, year) {
        this.title = title;
        if (year) {
            this.year = year;
        } else {
            this.year = '';
        }

    }

    async findSubtitle() {
        // It is obvious that title must be defined; otherwise, what are we looking for??
        if (!this.title) {
            throw new InvalidOperationException(this.exceptionSource, 'The operation is invalid. the field "title" is undefined or invalid.')
        }

        await this.fetchSubtitleQueryDocument();
        this.getSrtSubtitle();
    }

    async fetchSubtitleQueryDocument() {
        try {
            this.response = await fetch(this.queryUrl, {headers: ZimukuSubtitleFinder.getCorsFriendlyHeaders()});
        }
        catch (ex) {
            throw new FetchFailedException(this.exceptionSource, ex);
        }
        this.checkResponseStatus();     
        this.getDocumentFromHtmlText(this.getHtmlTextFromResponse());
    }

    checkResponseStatus() {
        if (this.response.status != 200) {
            throw new FetchResponseAnomalousException(this.exceptionSource);
        }
    }

    getHtmlTextFromResponse() {
        this.response.text();
    }

    getDocumentFromHtmlText(htmlText) {
        this.document = new DOMParser().parseFromString(htmlText);
    }

    getSrtSubtitle() {
        this.subtitles = new Array();
        this.getLabelNodes().forEach((node) => {
            if (node.textContent.includes('SRT')) {
                this.subtitles.push(new ZimukuSubtitle(node.parentNode));
            }
        })
    }

    getLabelNodes() {
        return this.document.querySelectorAll(this.querySelectorLabelNodePattern);
    }

    static getCorsFriendlyHeaders() {
        var headers = new Headers();
        headers.append('Allow-Control-Allow-Origin', '*');
        return headers;
    }

    get exceptionSource() {
        return 'subtitleFinder';
    }

    get querySelectorLabelNodePattern() {
        return 'span.label.label-info';
    }

    get queryUrl() {
        return 'https://www.zimuku.cn/search?q=' + this.queryText;
    }

    get queryText() {
        return this.queryFriendlyTitle + '+' + this.year;
    }

    get queryFriendlyTitle() {
        return this.title.replace(/[^\w\d]/g, '+');
    }
}