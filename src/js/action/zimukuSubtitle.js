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

class ZimukuSubtitle {
    constructor (tdNode) {
        this.tdNode = tdNode;
        parse ();
    }

    parse () {
        this.getUrl();
        this.getTitle();
        this.getTypes();
    }

    getUrl() {
        this.url = this.aNode.href;
    }

    getTitle() {
        this.title = this.aNode.title;
    }

    splitTypes() {
        return this.imgNode.alt.split(/\s/);
    }

    getTypes() {
        this.types = new Array();
        this.typeBits = [0, 0, 0, 0];
        this.splitTypes().forEach((type) => {
            if (type) {
                this.types.push(type);
                this.setTypeBit(type);
            }
        })
    }

    setTypeBit(type) {
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
}