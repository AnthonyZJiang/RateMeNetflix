function doubanSpan(className) {
	var e = document.createElement('SPAN');
	e.className = className;
	return e;
}

function doubanDiv(className) {
	var e = document.createElement('DIV');
	e.className = className;
	return e;
}

function doubanLogoNode() {
	// span
	var s = doubanSpan('douban-logo');
	// image
	var im = document.createElement('IMG');
	im.src = chrome.extension.getURL('img/doubanLogo16x16.png');
	// append
	s.appendChild(im);
	return s
}

function doubanTextNode(className, text) {
	//span
	var s = doubanSpan(className);
	// text and append
	s.appendChild(document.createTextNode(text));
	return s;
}

function doubanDivTextNode(className, text){
	//div
	var s = doubanDiv(className);
	// text and append
	s.appendChild(document.createTextNode(text));
	return s;
}

function injectRatings(node, doubanResult) {
	if (node) {
		nodeTitle = node.getElementsByClassName('bob-title');
		nodeBobPlayHitzone = node.getElementsByClassName('bob-play-hitzone');

		if (nodeTitle.length && nodeBobPlayHitzone.length) {
			// when waiting, add logo and waiting text
			if (doubanResult.queryStatus === QUERY_WAITING) {
				nodeBobPlayHitzone[0].appendChild(doubanLogoNode());
				nodeBobPlayHitzone[0].appendChild(doubanTextNode('douban-info', "waiting"));
			}

			// only add the rest when query is successful (1) or fuzzy (0)
			if (doubanResult.queryStatus >= 0) {

				nodeBobPlayHitzone[0].getElementsByClassName('douban-info')[0].innerText = doubanResult.rating;
				nodeBobPlayHitzone[0].appendChild(doubanTextNode('douban-info', doubanResult.ratingNum));
				nodeBobPlayHitzone[0].appendChild(doubanTextNode('douban-info', doubanResult.isWatched ? '(Watched)':''));

				// only add douban title and meta info when query is successful or fuzzy				
				if (nodeTitle.length) {
					nodeTitle[0].insertAdjacentElement('afterend', doubanDivTextNode('douban-title',doubanResult.meta));
					nodeTitle[0].insertAdjacentElement('afterend', doubanDivTextNode('douban-meta',doubanResult.doubanTitle))
				}
			}

			// if fail
			if (doubanResult.queryStatus === QUERY_FAILED) {
				nodeBobPlayHitzone[0].getElementsByClassName('douban-info')[0].innerText = 'failed';
			}
		}
	}
}