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
			    const details = {
			    	"type" : 'firstParty',
			    	"data" : {tabId, changeInfo, tab},
			    	"cookies" : (cookies.length>0) ? cookies : ''
			    };
			myself.setParty(details);

		});

    });

	},

	async setParty(event){
		var myself = this;
		let data = event.data;
		let cookies = (event.cookies) ? event.cookies : '';
		let tabId = ((data.tabId) ? data.tabId : data.response.tabId);
		var party = {};


		chrome.tabs.get(tabId, (tab) =>{
			let urlTab = '';
			switch(event.type){
				case 'thirdParty':
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
						store.storeParty(party);

					}
				break;
				case 'firstParty':
					urlTab = new URL(tab.url);
					if(urlTab.hostname && tab.status === 'complete'){
						party = {
							"hostname": urlTab.hostname,
							"iconURL" : tab.favIconUrl,
							"firstParty" : true,
							"requestTime" : Date.now(),
							"cookiesFirstParty" : (cookies.length>0) ? cookies : ''
						};
						store.storeParty(party);

					}
				break;

			}
		});

	}
};

capture.init();
