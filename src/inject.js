function addSpan(className) {
	var e = document.createElement('SPAN');
	if (className !== '') {
		e.className = className;
	}
	return e;
}

function addDiv(className) {
	var e = document.createElement('DIV');
	if (className !== '') {
		e.className = className;
	}
	return e;
}

function addLogoNode() {
	// span
	var s = addSpan('douban-logo');
	// image
	s.innerHTML = '<svg class="douban-logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.9 63.79"><defs><style>.cls-1{fill:#017712;}.cls-2{fill:#fcfdfc;}</style></defs><title>doubanLogo</title><g id="layer_1" data-name="layer 1"><path class="cls-1" d="M63.9,63.79H0V0H63.9Zm-8.21-15.1H43.34c2.16-4.4.66-10.32,7.34-10.29V20H12.89V38.48c5,.86,6.38,3,6.66,10.45H8.12v4.7H55.69Zm-.9-38.57h-46l.28,4.43H54.79Z"/><path class="cls-2" d="M55.69,48.69v4.93H8.12v-4.7H19.56c-.28-7.4-1.65-9.59-6.66-10.45V20H50.68V38.4c-6.68,0-5.18,5.89-7.34,10.29ZM20.09,33.47H43.67V25.06H20.09ZM24,39.05c2.4,10,2.4,10.06,9.8,9.77,6.74-.26,3.59-6.5,6.89-9.77Z"/><path class="cls-2" d="M54.79,10.12v4.43h-46V10.12Z"/><path class="cls-1" d="M20.09,33.47V25.06H43.67v8.42Z"/><path class="cls-1" d="M24,39.05H40.71c-3.3,3.27-.15,9.51-6.89,9.77C26.43,49.11,26.43,49.08,24,39.05Z"/></g></svg>';
	// var im = document.createElement('IMG');
	// im.src = chrome.extension.getURL('img/doubanLogo16x16.png');
	// // append
	// s.appendChild(im);
	return s
}

function addTextNode(className, text) {
	//span
	var s = addSpan(className);
	// text and append
	s.appendChild(document.createTextNode(text));
	return s;
}

function addDivTextNode(className, text){
	//div
	var s = addDiv(className);
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
				nodeBobPlayHitzone[0].appendChild(addLogoNode());
				nodeBobPlayHitzone[0].appendChild(addTextNode('douban-info', "稍候片刻..."));
			}

			// only add the rest when query is successful (1) or fuzzy (0)
			if (doubanResult.queryStatus >= 0) {

				nodeBobPlayHitzone[0].getElementsByClassName('douban-info')[0].innerText = doubanResult.rating;
				nodeBobPlayHitzone[0].appendChild(addTextNode('douban-info', doubanResult.ratingNum));
				nodeBobPlayHitzone[0].appendChild(addTextNode('douban-info', doubanResult.isWatched ? '(已看)':''));

				// add douban title and meta info		
				if (nodeTitle.length) {
					let divNode = addDiv('');
					divNode.appendChild(addTextNode('douban-title',doubanResult.doubanTitle));
					divNode.appendChild(addTextNode('douban-meta','(' + doubanResult.meta + ')'));	
					// add original title and year if fuzzy
					if (doubanResult.queryStatus === 0) {
						divNode.appendChild(addTextNode('douban-fuzzy',doubanResult.originalTitle));
						divNode.appendChild(addTextNode('douban-fuzzy','(' + doubanResult.year + ')'));
					}				
					nodeTitle[0].insertAdjacentElement('afterend', divNode);
				}
			}

			// if fail
			if (doubanResult.queryStatus === QUERY_FAILED) {
				nodeBobPlayHitzone[0].getElementsByClassName('douban-info')[0].innerText = '抱歉，未查到相关电影资料...';
			}
		}
	}
}