// observer for bob- elements
var bobObserver = new MutationObserver(function(mutations, observer) {
    if (mutations[0].addedNodes.length) {
        let node = mutations[0].addedNodes[0].getElementsByClassName('bob-overlay');
        if (node.length) {
            getMovieInfo(node[0]);
        }
    }
});

// observer for jawBoneContent
var jawBoneObserver = new MutationObserver(function(mutations, observer) {
    if (mutations[0].addedNodes.length) {
        console.log(mutations);
        let node = mutations[0].addedNodes[0].getElementsByClassName('jawBone');
        // add observer to open container
        addObserver(jawBoneTitleObserver, mutations[0].addedNodes[0], { childList: true })
        if (node.length) {
            getMovieInfo(node[0]); 
        }
    }
});

var jawBoneTitleObserver = new MutationObserver(function(mutations, observer) {
    if (mutations[0].addedNodes.length) {
        console.log(mutations);
        let node = mutations[0].addedNodes[0].getElementsByClassName('jawBone');
        if (node.length) {
            getMovieInfo(node[0]); 
        }
    }
});

function addObserver(observer, node, opt) {
    // if observed, return
    if (node.hasAttribute('observed')){
        return;
    } 
    // otherwise, add observer
    observer.observe(node, opt);
    node.setAttribute('observed','true');    
    console.log('(netflixBrowseContent.js): ', node, 'observed!')
}
