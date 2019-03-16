// 读取数据，第一个参数是指定要读取的key以及设置默认值
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

$(function(){
	// 初始化时候设置是否拒绝aff 
	chrome.storage.sync.get({isInterceptAff: true,isNotifyAff: true,lastInterceptAffURL:"",user: "",pass:"",zone:"1500200"}, function(items) {  
		console.log(items);
		$("#isInterceptAff").attr("checked", items.isInterceptAff); 
		$("#isNotifyAff").attr("checked", items.isNotifyAff);  
		$("#lastInterceptAffURL").val(items.lastInterceptAffURL); 

		
		$("#user").val(items.user); 
		$("#pass").val(items.pass); 
		$("#zone").val(items.zone);  

	});
	
	
	// 监听配置项
	$("#isInterceptAff").change(function(e){ 
		isInterceptAff = $(this).is(':checked');
		
		// 保存数据
		chrome.storage.sync.set({isInterceptAff: isInterceptAff}, function() {
			console.log('保存isInterceptAff成功！');
		});
	});
	
	$("#isNotifyAff").change(function(e){ 
		isNotifyAff = $(this).is(':checked');
		
		// 保存数据
		chrome.storage.sync.set({isNotifyAff: isNotifyAff}, function() {
			console.log('保存isNotifyAff成功！');
		});
	}); 

	$("#pass").change(function(e){ 
		pass = $(this).val();  
		chrome.storage.sync.set({pass: pass}, function() { 
		});
	}); 

	$("#user").change(function(e){ 
		user = $(this).val(); 
		chrome.storage.sync.set({user: user}, function() { 
		});
	}); 

	$("#zone").change(function(e){  
		var options=$("#zone option:selected").val();
		chrome.storage.sync.set({zone: options}, function() { 
		});
	}); 

	$("#isAutoWrite").click(function(e){ 
		sendMessageToContentScript({cmd:'tank', value:''}, function(response)
		{
			// console.log('来自content的回复：'+response);
		}); 
 
	}); 
 
});



function clear(){
	(function(){
	if(document.cookie.indexOf('WHMCSAffiliateID')==-1 && document.cookie.indexOf('HBAffiliate')==-1){alert('未能读取AFF信息，\r\n请按F12手动删除：\r\nStorage - Cookies - WHMCSAffiliateID | HBAffiliate');}
	var path=window.location.href.substring(0,window.location.href.lastIndexOf('/'))+'/';
	var w=new XMLHttpRequest();
	w.open('GET',path+'aff.php?aff=-1',true);
	w.onreadystatechange=function(e){
	document.cookie='WHMCSAffiliateID=;path=/;domain='+document.domain;
	document.cookie='WHMCSAffiliateID=;path=/;domain=.'+document.domain;
	};
	w.send();
	document.cookie='HBAffiliate=;path=/;domain='+document.domain;
	document.cookie='HBAffiliate=;path=/;domain=.'+document.domain;
	})()
}


