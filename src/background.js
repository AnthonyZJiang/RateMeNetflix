chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('Message received: ', request.action)
        if (request.action == "doubanSearch")
            test(request.title, request.year);
    }
);

function test(title, year){
    var frame = document.createElement('iframe');
    frame.src = 'https://movie.douban.com/subject_search?cat=1002&search_text=' + title + ' '+ year;
    document.body.appendChild(frame);
  
    // window.addEventListener('message',function(e){
    //   console.log("message received: " + JSON.stringify(e.data));
    // });
    // console.log('posting message to iframe');
    
    // frame.addEventListener('load',function(){
    //     frame.contentWindow.postMessage("TestMessage","*");
    // });
  }