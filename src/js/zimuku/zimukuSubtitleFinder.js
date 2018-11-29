class ZimukuSubtitleFinder {
    constructor (title, year) {
        this.title = title;
        if (year) {
            this.year = year;
        } else {
            this.year = '';
        }
        this.subtitles = null;
    }

    async findSubtitle() {
        // It is obvious that title must be defined; otherwise, what are we looking for??
        if (!this.title) {
            throw new InvalidOperationException('The operation is invalid. the field "title" is undefined or invalid.')
        }

        await this._fetchSubtitleQueryDocument();
        this._findAllSrtSubtitles();
    }

    async _fetchSubtitleQueryDocument() {
        this.document = (await Xhr.fetchDocument(this._queryUrl)).document;
    }

    _findAllSrtSubtitles() {
        this.subtitles = new Array();
        this._getLabelNodes().forEach((node) => {
            if (node.textContent.includes('SRT')) {
                this.subtitles.push(new ZimukuSubtitle(node.parentNode));
            }
        })
    }

    _getLabelNodes() {
        return this.document.querySelectorAll(this._querySelectorLabelNodePattern);
    }

    get _querySelectorLabelNodePattern() {
        return 'span.label.label-info';
    }

    get _queryUrl() {
        return _corsApi + 'https://www.zimuku.cn/search?q=' + this._queryText;
    }

    get _queryText() {
        return this._queryFriendlyTitle + '+' + this.year;
    }

    get _queryFriendlyTitle() {
        return this.title.replace(/[^\w\d]/g, '+');
    }
}