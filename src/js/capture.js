//const capture = {

/*	chrome.webRequest.onResponseStarted.addListener(function(details){
    	chrome.tabs.query({currentWindow: true, active : true},function(tabArray){
    		let msg = {
    			"header" : details
    		};
    		//console.log(tabArray[0]);
    		//chrome.tabs.sendMessage(tabArray[0].id, msg);
    	});
	},
	{
 	urls: ["<all_urls>"]
	},
	["responseHeaders",chrome.webRequest.OnBeforeSendHeadersOptions.EXTRA_HEADERS].filter(Boolean)
	);
*/

//}

const capture = {

	init(){
		this.listener();
	},

	
	listener(){
		var myself = this;
		chrome.webRequest.onResponseStarted.addListener(function(response){
    	/*chrome.tabs.query({currentWindow: true, active : true},function(tabArray){
    		let msg = {
    			"header" : details
    		};
    		console.log(tabArray[0]);
    		chrome.tabs.sndMessage(tabArray[0].id, msg);
    	});*/
    	const responseDetails = {
    		"type" : 'firstParty',
    		"response" : response,
    		"url" : response.originUrl
    	};
    	if(response.tabId >=0){
    		var cookieList = document.getElementById('cookie-list');
    		//document.getElementById('pp').innerHTML='ciaooo';
    		let urlResponse = response.url;
    		console.log("ciaoooo" +response.initiator);
    		const messaggio = {
    			"testo": "iniziatore",
    			"msg": response.url,
    		};
    		//url = new URL(urlInitiator);
    		//chrome.tabs.sendMessage(response.tabId, messaggio);
    		chrome.tabs.get(response.tabId, (tab) =>{
    			if(tab.url !== urlResponse){ //escludo il sito di prima parte considerato in seguito
	    			chrome.cookies.getAll({url: urlResponse}, function(cookies){	
		    		//if(cookies.length > 0){
		    		const details = {
		    			"type" : 'thirdParty',
		    			"data" : response,
		   				"cookies" : (cookies.length>0) ? cookies : ''
		   			};

		    			/*let li = document.createElement("li");
		       			let content = document.createTextNode(url);
		     			li.appendChild(content);
		   				cookieList.appendChild(li);
		    		       for (let cookie of cookies) {
		    		        	document.getElementById('pp').innerHTML+=cookies.length;
		        				let li = document.createElement("li");
		        				let content = document.createTextNode(cookie.name + ": "+ cookie.value + "-" + cookie.session);
		        				li.appendChild(content);
		        				cookieList.appendChild(li);
		      				}*/	

		      		myself.setParty(details);
		    		//}
	    			});
    			}
    		});

    		//chrome.tabs.sendMessage(response.tabId, responseDetails);
    	}
	},
	{
 	urls: ["<all_urls>"]
	},
	["responseHeaders"]);

	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
		let urlTab = tab.url;
		chrome.cookies.getAll({url: urlTab}, function(cookies){
			//if(tab.url === response.url){
			    const details = {
			    	"type" : 'firstParty',
			    	"data" : {tabId, changeInfo, tab},
			    	"cookies" : (cookies.length>0) ? cookies : ''
			    };
			//}
		});
    });

	},

	async setParty(event){
		var myself = this;
		let data = event.data;
		let cookies = event.cookies;
		var party = {};
		chrome.tabs.get(data.tabId, (tab) =>{
			switch(event.type){
				case 'thirdParty':
					if(data.url && data.initiator){
						const urlTarget = new URL(data.url);
						const urlOrigin = new URL(data.initiator);
						const urlFirstparty = new URL(tab.url);
						const party = {
							"hostname": urlFirstparty.hostname,
							"target" : urlTarget,
							"origin" : urlOrigin,
							"requestTime" : data.timeStamp,
							"firstParty" : false,
							"cookies" : (cookies.length>0) ? cookies : ''
						};
					}
				break;
				case 'firstParty':
					//const tab = data.tab;
					const urlTab = new URL(tab.url);
					if(urlTab.hostname && tab.status === 'complete'){
						const party = {
							"hostname": urlTab.hostname,
							"iconURL" : tab.favIconUrl,
							"firstParty" : true,
							"requestTime" : Date.now(),
							"cookies" : cookies
						};
					}

				break;
			}
			store.storeParty(party.hostname,party);
		});

	}
}

capture.init();
