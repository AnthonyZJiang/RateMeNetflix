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

function addA(className, link, newTab) {
	var e = document.createElement('A');
	if (className !== ''){
		e.className = className;
	}
	e.href = link;
	if (newTab){
		e.target = '_blank'
	}
	return e;
}

function addLogoNode(className) {
	// span
	var s
	if (className) {
		s = addSpan(className);
		s.innerHTML = '<svg class="' + className + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.9 63.79"><defs><style>.cls-1{fill:#017712;}.cls-2{fill:#fcfdfc;}</style></defs><title>doubanLogo</title><g id="layer_1" data-name="layer 1"><path class="cls-1" d="M63.9,63.79H0V0H63.9Zm-8.21-15.1H43.34c2.16-4.4.66-10.32,7.34-10.29V20H12.89V38.48c5,.86,6.38,3,6.66,10.45H8.12v4.7H55.69Zm-.9-38.57h-46l.28,4.43H54.79Z"/><path class="cls-2" d="M55.69,48.69v4.93H8.12v-4.7H19.56c-.28-7.4-1.65-9.59-6.66-10.45V20H50.68V38.4c-6.68,0-5.18,5.89-7.34,10.29ZM20.09,33.47H43.67V25.06H20.09ZM24,39.05c2.4,10,2.4,10.06,9.8,9.77,6.74-.26,3.59-6.5,6.89-9.77Z"/><path class="cls-2" d="M54.79,10.12v4.43h-46V10.12Z"/><path class="cls-1" d="M20.09,33.47V25.06H43.67v8.42Z"/><path class="cls-1" d="M24,39.05H40.71c-3.3,3.27-.15,9.51-6.89,9.77C26.43,49.11,26.43,49.08,24,39.05Z"/></g></svg>';
	} else {
		s = addSpan('douban-logo')
		s.innerHTML = '<svg class="douban-logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.9 63.79"><defs><style>.cls-1{fill:#017712;}.cls-2{fill:#fcfdfc;}</style></defs><title>doubanLogo</title><g id="layer_1" data-name="layer 1"><path class="cls-1" d="M63.9,63.79H0V0H63.9Zm-8.21-15.1H43.34c2.16-4.4.66-10.32,7.34-10.29V20H12.89V38.48c5,.86,6.38,3,6.66,10.45H8.12v4.7H55.69Zm-.9-38.57h-46l.28,4.43H54.79Z"/><path class="cls-2" d="M55.69,48.69v4.93H8.12v-4.7H19.56c-.28-7.4-1.65-9.59-6.66-10.45V20H50.68V38.4c-6.68,0-5.18,5.89-7.34,10.29ZM20.09,33.47H43.67V25.06H20.09ZM24,39.05c2.4,10,2.4,10.06,9.8,9.77,6.74-.26,3.59-6.5,6.89-9.77Z"/><path class="cls-2" d="M54.79,10.12v4.43h-46V10.12Z"/><path class="cls-1" d="M20.09,33.47V25.06H43.67v8.42Z"/><path class="cls-1" d="M24,39.05H40.71c-3.3,3.27-.15,9.51-6.89,9.77C26.43,49.11,26.43,49.08,24,39.05Z"/></g></svg>';
	}
	// image
	
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
	if (doubanResult.queryStatus !== QUERY_WAITING && _currentMovieId !== doubanResult.movieId) {
		return;
	}

	if (node.className === 'bob-overlay') {
		injectBobOverlay(node, doubanResult);
	} else if (node.className === 'jawBone') {
		injectJawBone(node, doubanResult);
	}
}

function injectBobOverlay(node, doubanResult) {
	if (node) {
		let nodeBobPlayHitzone = node.getElementsByClassName('bob-play-hitzone')[0];

		// when waiting, add logo and waiting text
		if (doubanResult.queryStatus === QUERY_WAITING) {
			nodeBobPlayHitzone.appendChild(addLogoNode());
			var linkNode = nodeBobPlayHitzone.appendChild(addA('douban-info-link', '', true));
			linkNode.innerText = "稍候片刻...";
		}

		// only add the rest when query is successful (1) or fuzzy (0)
		if (doubanResult.queryStatus >= 0) {
			nodeBobPlayHitzone.getElementsByClassName('douban-info-link')[0].innerText = doubanResult.rating;
			nodeBobPlayHitzone.getElementsByClassName('douban-info-link')[0].href = doubanResult.url;
			nodeBobPlayHitzone.appendChild(addTextNode('douban-info', doubanResult.ratingNum));
			nodeBobPlayHitzone.appendChild(addTextNode('douban-info', doubanResult.isWatched ? '(已看)':''));

			// add douban title and meta info		
			let divNode = addDiv('');
			divNode.appendChild(addTextNode('douban-title',doubanResult.doubanTitle));
			divNode.appendChild(addTextNode('douban-meta','(' + doubanResult.meta + ')'));	
			// add original title and year if fuzzy
			if (doubanResult.queryStatus === 0) {
				divNode.appendChild(addTextNode('douban-fuzzy',doubanResult.originalTitle));
				divNode.appendChild(addTextNode('douban-fuzzy','(' + doubanResult.year + ')'));
			}				
			node.getElementsByClassName('bob-title')[0].insertAdjacentElement('afterend', divNode);
		}

		// if fail
		if (doubanResult.queryStatus === QUERY_FAILED) {
			nodeBobPlayHitzone.getElementsByClassName('douban-info')[0].innerText = '抱歉，未查到相关电影资料...';
		}
	}
}

function injectJawBone(node, doubanResult) {
	if (node) {
		nodeJawBoneMeta = node.getElementsByClassName('meta')[0];

		// when waiting, add logo and waiting text
		if (doubanResult.queryStatus === QUERY_WAITING) {
			nodeJawBoneMeta.appendChild(addLogoNode('douban-logo-jaw-bone'));
			var linkNode = nodeJawBoneMeta.appendChild(addA('douban-info-link-jaw-bone', '', true));
			linkNode.innerText = "稍候片刻...";
		}

		// only add the rest when query is successful (1) or fuzzy (0)
		if (doubanResult.queryStatus >= 0) {
			nodeJawBoneMeta.getElementsByClassName('douban-info-link-jaw-bone')[0].innerText = doubanResult.rating;
			nodeJawBoneMeta.getElementsByClassName('douban-info-link-jaw-bone')[0].href = doubanResult.url;
			nodeJawBoneMeta.appendChild(addTextNode('douban-info-jaw-bone', doubanResult.ratingNum));
			nodeJawBoneMeta.appendChild(addTextNode('douban-info-jaw-bone', doubanResult.isWatched ? '(已看)':''));
			node.getElementsByClassName('meta-lists')[0].appendChild(addTextNode('douban-meta-jaw-bone',doubanResult.meta));	

			// add douban title and meta info
			let divNode = addDiv('');
			divNode.appendChild(addTextNode('douban-title-jaw-bone',doubanResult.doubanTitle));
			// add original title and year if fuzzy
			if (doubanResult.queryStatus === 0) {
				divNode.appendChild(addTextNode('douban-fuzzy-jaw-bone',doubanResult.originalTitle));
				divNode.appendChild(addTextNode('douban-fuzzy-jaw-bone','(' + doubanResult.year + ')'));
			}				
			node.getElementsByClassName('jawbone-title-link')[0].firstChild.insertAdjacentElement('afterend', divNode);
		}

		// if fail
		if (doubanResult.queryStatus === QUERY_FAILED) {
			nodeJawBone.getElementsByClassName('douban-info-jaw-bone')[0].innerText = '抱歉，未查到相关电影资料...';
		}
	}
}