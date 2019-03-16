
var user=""
var pass=""
var zone=1500200

chrome.storage.sync.get({user: "",pass: "",zone: "1500200"}, function(items) {  
	user = items.user;
	pass = items.pass;
	zone = Number(items.zone) ;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{  
    // console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
	console.log('v');
    if(request.cmd == 'msg') 
	{ 
		console.log('%c '+request.value,'color:#bada55;font-size: 25px;');
	}
	if(request.cmd == 'tank') 
	{ 
		document.getElementById("zH").value=user;
		document.getElementById("mM").value=pass;
		document.getElementById("zone").value=zone; 
	}
    // sendResponse('我收到了你的消息！');
});