const capture = {

	init(){
		this.listener();
	},

	listener(){
		var myself = this;
		chrome.webRequest.onResponseStarted.addListener(function(response){
    	const responseDetails = {
    		"type" : 'firstParty',
    		"response" : response,
    		"url" : response.originUrl
    	};
    	if(response.tabId >=0){
    		var cookieList = document.getElementById('cookie-list');
    		let urlResponse = response.url;
    		console.log("ciaoooo" +response.initiator);
    		const messaggio = {
    			"testo": "iniziatore",
    			"msg": response.url,
    		};
    		chrome.tabs.get(response.tabId, (tab) =>{
    			if(tab.url !== urlResponse){ //escludo il sito di prima parte considerato in seguito
	    			chrome.cookies.getAll({url: urlResponse}, function(cookies){	
		    		const details = {
		    			"type" : 'thirdParty',
		    			"data" : response,
		   				"cookies" : (cookies.length>0) ? cookies : ''
		   			};
		      		myself.setParty(details);
	    			});
    			}
    		});
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
};

capture.init();
