function doubanSpan() {
	var e = document.createElement('SPAN');
	e.className = 'doubanRating';
	return e;
}

function doubanLogoNode(url) {
	// span
	var s = doubanSpan();
	// image
	var im = document.createElement('IMG');
	im.src = chrome.extension.getURL('img/doubanLogo16x16.png');
	im.onclick = function() { window.location.href = url };
	im.className = 'doubanLogo';
	// append
	s.appendChild(im);
	return s
}

function doubanTextNode(text) {
	//span
	var s = doubanSpan();
	// text and append
	s.appendChild(document.createTextNode(text));
	return s;
}

function injectRatings(node, doubanResult) {
	removePreviousNodes(node);
	if (node) {
		node.appendChild(doubanLogoNode(doubanResult.url));
		node.appendChild(doubanTextNode(doubanResult.rating));
		node.appendChild(doubanTextNode(doubanResult.isWatched ? '(Watched)':''));
	}
}

function removePreviousNodes(node){
	var n = node.getElementsByClassName('doubanRating');
	if (n) {
		for (let i = 0, l = n.length; i < l; i++){
			node.removeChild(n[0]);
		}
	}
}