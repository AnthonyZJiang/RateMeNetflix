var _iframe;

function createZimukuIframe() {
    if (_iframe) {
        deleteIframe();
    }
    createIframe();
    document.body.appendChild(_iframe);
}

function deleteIframe() {
    if (_iframe) {
        document.body.removeChild(_iframe);
    }
}

function createIframe() {
    _iframe = document.createElement('iframe');
    _iframe.src="https://www.zimuku.cn/User/login.html";
    _iframe.style="width: 0; height: 0; border: 0; border: none; position: absolute;";
    _iframe.sandbox="allow-scripts allow-same-origin";
}