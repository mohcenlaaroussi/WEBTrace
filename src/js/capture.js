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
    		chrome.tabs.get(response.tabId, (tab) =>{
				if(tab.url !== urlResponse){ //escludo il sito di prima parte considerato in seguito
					chrome.cookies.getAll({url: urlResponse}, async function(cookies){	
    					await myself.setHeaderFirstParty(response,cookies,tab);	
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
		chrome.cookies.getAll({url: urlTab}, async function(cookies){
			 await myself.setHeaderThirdParty(tabId, changeInfo, tab,cookies);

    	
		});
    });

	},

	async setHeaderFirstParty(response,cookies,tab){
		var myself = this;
    	const details = {
  			"type" : 'thirdParty',
 			"data" : response,
 			"cookies" : (cookies.length>0) ? cookies : ''
	 	};
	 	await myself.setParty(details,tab);
	 	
	},

	async setHeaderThirdParty(tabId, changeInfo, tab,cookies){
		var myself = this;

			    const details = {
			    	"type" : 'firstParty',
			    	"data" : {tabId, changeInfo, tab},
			    	"cookies" : (cookies.length>0) ? cookies : ''
			    };
			await myself.setParty(details,tab);
	},

	async setParty(event,tab){
		var myself = this;
		let data = event.data;
		let cookies = (event.cookies) ? event.cookies : '';
		let tabId = ((data.tabId) ? data.tabId : data.response.tabId);
		var party = {};


	
			let urlTab = '';
			switch(event.type){
				case 'thirdParty':

					await myself.setThirdPartyToStore(tab, data,cookies);

				break;
				case 'firstParty':
					
					await myself.setFirstPartyToStore(tab,cookies);

				break;

			}


	},

	async setThirdPartyToStore(tab, data, cookies){
		urlTab = new URL(tab.url);
		const urlTarget = new URL(data.url);
		if(data.url && data.initiator && !(urlTarget.hostname.includes(urlTab.hostname))){
			const urlOrigin = new URL(data.initiator);
			const urlFirstparty = new URL(tab.url);
			party = {
				//"hostname": urlFirstparty.hostname,
				"target" : urlTarget.hostname,
				"origin" : urlOrigin.hostname,
				"requestTime" : data.timeStamp,
				"firstParty" : false,
				"cookiesThirdParty" : (cookies.length>0) ? cookies : ''
			};
			await store.storeParty(party);
		}
	},
	async setFirstPartyToStore(tab,cookies){
		urlTab = new URL(tab.url);
		if(urlTab.hostname && tab.status === 'complete'){
			party = {
				"hostname": urlTab.hostname,
				"iconURL" : tab.favIconUrl,
				"firstParty" : true,
				"requestTime" : Date.now(),
				"cookiesFirstParty" : (cookies.length>0) ? cookies : ''
			};
						//await store.storeParty(party);
		}
	}
};

capture.init();
