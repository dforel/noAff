 
// 是否拦截aff
var isInterceptAff;
var isNotifyAff;


function sendMessageToContentScript(message, callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response)
        {
            if(callback) callback(response);
        });
    });
}

// 监听storge改变，实时获取设置
chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (key in changes) {
          var storageChange = changes[key];
          
					  
			  if(key === "isInterceptAff"){
				
			  } else if(key === "isInterceptAff"){
				isInterceptAff = storageChange.newValue;
			  }
			switch(key)
			{
				case "isInterceptAff":
				  isInterceptAff = storageChange.newValue;
				  break;
				case "isNotifyAff":
				  isNotifyAff = storageChange.newValue;
				  break;
				default:
				   console.log('Storage key "%s" in namespace "%s" changed. ' +
						  'Old value was "%s", new value is "%s".',
						  key,
						  namespace,
						  storageChange.oldValue,
						  storageChange.newValue);
			}
        }
}); 
 
chrome.storage.sync.get({isInterceptAff: true}, function(items) {
    isInterceptAff = items.isInterceptAff;
});
chrome.storage.sync.get({isInterceptAff: true,isNotifyAff: true}, function(items) {  
	isInterceptAff = items.isInterceptAff;
	isNotifyAff = items.isNotifyAff;
});

// web请求监听，最后一个参数表示阻塞式，需单独声明权限：webRequestBlocking
chrome.webRequest.onBeforeRequest.addListener(details => {
	// console.log(details); 
	var isAff = details.url.indexOf("aff=")>-1 || details.url.indexOf("cpskey=")>-1 || details.url.indexOf("ursecode=")>-1 ;
	if(isNotifyAff && isAff ){ 
		chrome.notifications.create(null, {
			type: 'basic', 
            iconUrl: 'img/icon.jpg',
			title: '发现一个aff请求，已经帮你拦截',
			message: '来源：'+details.initiator+'\n请求地址：'+details.url //+"\n 打开F12可以再console框中手动复制链接！"
		});
		
		sendMessageToContentScript({cmd:'msg', value:'发现一个aff请求，已经帮你拦截,来源：'+details.initiator+'\n请求地址：'+details.url}, function(response)
		{
			// console.log('来自content的回复：'+response);
		}); 
	}
	
	if(isInterceptAff && isAff ){ 
		 // cancel 表示取消本次请求
		
		// 保存数据
		chrome.storage.sync.set({lastInterceptAffURL: details.url}, function() {
			console.log('保存isInterceptAff成功！');
		});
		return {cancel: true}
	}
	
	 
}, {urls: ["<all_urls>"]}, ["blocking"]);
