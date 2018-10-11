function createSpan(className) {
	var e = document.createElement('SPAN');
	if (className !== '') {
		e.className = className;
	}
	return e;
}

function createDiv(className) {
	var e = document.createElement('DIV');
	if (className !== '') {
		e.className = className;
	}
	return e;
}

function createA(className, link, text, newTab) {
	var e = document.createElement('A');
	if (className !== ''){
		e.className = className;
	}
	e.href = link;
	e.innerText = text;
	if (newTab){
		e.target = '_blank'
	}
	return e;
}

function setLogo(span, className) {
	span.innerHTML = '<svg class="' + className + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.9 63.79"><defs><style>.cls-1{fill:#017712;}.cls-2{fill:#fcfdfc;}</style></defs><title>doubanLogo</title><g id="layer_1" data-name="layer 1"><path class="cls-1" d="M63.9,63.79H0V0H63.9Zm-8.21-15.1H43.34c2.16-4.4.66-10.32,7.34-10.29V20H12.89V38.48c5,.86,6.38,3,6.66,10.45H8.12v4.7H55.69Zm-.9-38.57h-46l.28,4.43H54.79Z"/><path class="cls-2" d="M55.69,48.69v4.93H8.12v-4.7H19.56c-.28-7.4-1.65-9.59-6.66-10.45V20H50.68V38.4c-6.68,0-5.18,5.89-7.34,10.29ZM20.09,33.47H43.67V25.06H20.09ZM24,39.05c2.4,10,2.4,10.06,9.8,9.77,6.74-.26,3.59-6.5,6.89-9.77Z"/><path class="cls-2" d="M54.79,10.12v4.43h-46V10.12Z"/><path class="cls-1" d="M20.09,33.47V25.06H43.67v8.42Z"/><path class="cls-1" d="M24,39.05H40.71c-3.3,3.27-.15,9.51-6.89,9.77C26.43,49.11,26.43,49.08,24,39.05Z"/></g></svg>';
}

function createTextSpan(className, text) {
	//span
	var s = createSpan(className);
	// text and append
	s.appendChild(document.createTextNode(text));
	return s;
}

function createTextDiv(className, text){
	//div
	var s = createDiv(className);
	// text and append
	s.appendChild(document.createTextNode(text));
	return s;
}

function injectDBR(node, doubanResult) {
	if (doubanResult.queryStatus !== QUERY_WAITING && _currentMovieId !== doubanResult.movieId) {
		return;
	}

	if (node.className === 'bob-overlay') {
		injectBobOverlay(node, doubanResult);
	} else if (node.className === 'jawBone') {
		injectJawBone(node, doubanResult);
	}
}

function injectTitleCardDouban(node, dbr) {
	if (!node || !dbr) {
		return
	}

	var nodeBobPlayHitzone = node.querySelector('.bob-play-hitzone');
	
	// if injected.
	if (nodeBobPlayHitzone.querySelector('.dbr-box')) {
		return;
	}

	// a wrapping box
	var doubanNode = createDiv('dbr dbr-title-card');
	// rating box
	var ratingNode = createDiv('dbr-box');
	// detail box		
	var detailNode = createDiv('dbr-box');

	// add logo first, always needed.
	var logoSpan = createSpan('dbr dbr-logo-box dbr-inline-block');
	setLogo(logoSpan, 'dbr-logo-svg')
	ratingNode.appendChild(logoSpan);
	
	if (dbr.queryState != -1) {
		ratingNode.appendChild(createA('dbr-inline-block', dbr.url, dbr.queryState == 1 ? dbr.rating : `? ${dbr.rating}`, true));
		ratingNode.appendChild(createTextSpan('dbr-inline-block', `(${dbr.ratingNum ? dbr.ratingNum : 0}人看过)`));

		// add douban title and meta info
		detailNode.appendChild(createTextSpan('dbr-inline-block',dbr.title));
		if (dbr.genres) {
			detailNode.appendChild(createTextSpan('dbr-inline-block','(' + dbr.genres + ')'));	
		}
		// add original title and year if fuzzy
		if (dbr.queryState == 0) {
			let fuzzyDetailNode = createDiv('dbr-box dbr-fuzzy')
			fuzzyDetailNode.appendChild(createTextSpan('dbr-inline-block',dbr.oriTitle));
			fuzzyDetailNode.appendChild(createTextSpan('dbr-inline-block','(' + dbr.year + ')'));
			detailNode.appendChild(fuzzyDetailNode);
		}				
	}
	// if fail
	else {
		ratingNode.appendChild(createTextSpan('dbr-inline-block', '抱歉，未查到相关电影资料...'));
	}
	
	doubanNode.appendChild(ratingNode);
	doubanNode.appendChild(detailNode);
	nodeBobPlayHitzone.appendChild(doubanNode);
}

function injectJawBone(node, dbr) {
	if (!node || !dbr) {
		return
	}
	var jawBoneOverviewNode = node.querySelector('.jawbone-overview-info');
	// if injected.
	if (jawBoneOverviewNode.querySelector('.dbr')) {
		return;
	}
	
	var metaNode = jawBoneOverviewNode.querySelector('.meta');
	var detailNode = createDiv('meta-lists dbr dbr-inline-block-jawbone');
	var ratingSpan = createSpan('');
	var logoSpan = createSpan('dbr dbr-logo-box-jawbone');
	setLogo(logoSpan, 'dbr-logo-svg-jawbone');

	metaNode.appendChild(logoSpan);
	metaNode.appendChild(ratingSpan);
	
	if (dbr.queryState != -1) {
		ratingSpan.appendChild(createA('dbr-link-jawbone', dbr.url, dbr.queryState == 1 ? dbr.rating : `? ${dbr.rating}`, true));
		
		// detail node
		var watchedNumNode = createDiv('inline-list');
		watchedNumNode.appendChild(createTextSpan('list-label', '看过人数：'));
		watchedNumNode.appendChild(createTextSpan('list-items',`${dbr.ratingNum ? dbr.ratingNum : '未知'}`));
		detailNode.appendChild(watchedNumNode);

		// add douban title
		var titleNode = createDiv('inline-list');
		titleNode.appendChild(createTextSpan('list-label', '中文名：'));
		titleNode.appendChild(createTextSpan('list-items', dbr.title));
		detailNode.appendChild(titleNode);

		// add genres
		if (dbr.genres) {
			var genreNode = createDiv('inline-list');
			genreNode.appendChild(createTextSpan('list-label', '题材：'));
			genreNode.appendChild(createTextSpan('list-items', dbr.genres));
			detailNode.appendChild(genreNode);
		}
		// add original title and year if fuzzy
		if (dbr.queryState == 0) {
			var oriTitleNode = createDiv('inline-list');
			genreNode.appendChild(createTextSpan('list-label', '原片名：'));
			genreNode.appendChild(createTextSpan('list-items', dbr.oriTitle));
			var yearNode = createDiv('inline-list');
			genreNode.appendChild(createTextSpan('list-label', '上映年份：'));
			genreNode.appendChild(createTextSpan('list-items', dbr.year));
			detailNode.appendChild(oriTitleNode);
			detailNode.appendChild(yearNode);
		}				
	}
	// if fail
	else {
		ratingSpan.appendChild(createTextSpan('dbr-inline-block-jawbone', '无结果'));	
	}
	
	jawBoneOverviewNode.appendChild(detailNode);
}