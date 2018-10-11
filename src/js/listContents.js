/*!
 * listContents.js contains modified work from the original work of Tanner Rutgers (https://github.com/tanner-rutgers/RateFlix/)
 * Copyright tanner-rutgers, Copyright 2018 Zhengyi Jiang
 * Licensed under the Apache License
 */ 

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observerOptions = {
	childList: true,
	subtree: true
}

var jawBoneContentObserver = new MutationObserver(function(mutations, observer) {
	var node = mutations.find(function(mutation) { return mutation.target.hasAttribute("observed_1") });
	if (node) {
		node = node.target;
		var headerNode = node.querySelector(".jawBone > h3");
		if (headerNode) {
			var titleNode = headerNode.querySelector(".title");
			var title = titleNode.querySelector("img") ? titleNode.querySelector("img").alt : titleNode.textContent;
			if (title) {
				getRatings(extractID(node), title, {}, extractYear(node), function (rating) {
					injectJawBone(node, rating.doubanRating)
				});
			}
		}
		// add open container observer
		var openContainerNode = node.querySelector(".jawBoneOpenContainer");
		if (openContainerNode) {
			if (!openContainerNode.hasAttribute("observed_1")) {
				openContainerNode.setAttribute("observed_1", "true");
			};
		}
	}	
});

var titleCardObserver = new MutationObserver(function(mutations, observer) {
	var node = mutations.find(function(mutation) { return mutation.target.hasAttribute("observed_1") });
	if (node) {
		node = node.target;
		var titleNode = node.querySelector(".bob-title");
		if (titleNode && (title = titleNode.textContent)) {
			getRatings(extractID(node), title, {}, extractYear(node), function (rating) {
				injectTitleCardDouban(node, rating.doubanRating)
			});
		}
	}
});

function addTitleObserver(node) {
	node.querySelectorAll(".jawBoneContent").forEach(function(node) {
		if (!node.hasAttribute("observed_1")) {
			node.setAttribute("observed_1", "true");
			jawBoneContentObserver.observe(node, observerOptions);
		};
	});
	node.querySelectorAll(".title-card-container > div > span").forEach(function(node) {
		if (!node.hasAttribute("observed_1")) {
			node.setAttribute("observed_1", "true");
			titleCardObserver.observe(node, observerOptions);
		};
	});
	node.querySelectorAll(".bob-container-tall-panel > span").forEach(function(node) {
		if (!node.hasAttribute("observed_1")) {
			node.setAttribute("observed_1", "true");
			titleCardObserver.observe(node, observerOptions);
		};
	});
}

var rowObserver = new MutationObserver(function(mutations, observer) {
	mutations.forEach(function(mutation) {
		if (mutation.addedNodes) {
			mutation.addedNodes.forEach(function(node) {
				if (node.nodeType === 1) {
					addTitleObserver(node);
				}
			});
		}
	});
});

var mainObserver = new MutationObserver(function(mutations, observer) {
	var mainView = document.querySelector(".mainView");
	if (mainView) {
		observer.disconnect();
		rowObserver.observe(mainView, observerOptions);
		addTitleObserver(mainView);
		addFeaturedRatings(mainView);
	}
});

function addFeaturedRatings(node) {
	var jawBoneNode = node.querySelector(".jawBoneContainer > .jawBone");
	if (jawBoneNode) {
		var titleNode = jawBoneNode.querySelector(".title");
		if (titleNode) {
			if (img = titleNode.querySelector("img")) {
				title = img.alt;
			} else {
				title = titleNode.textContent;
			}
			getRatings(extractID(node), title, {}, extractYear(node), function (rating) {
				injectJawBone(node, rating.doubanRating)
			});
		}
	}
}

if (mainView = document.querySelector(".mainView")) {
	rowObserver.observe(mainView, observerOptions);
	addTitleObserver(mainView);
	addFeaturedRatings(mainView);
}