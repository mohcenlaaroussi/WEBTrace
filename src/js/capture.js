const capture = {
	init(){
		this.listener();
	},


	async listener(){
		var myself = this;
		var queue = [];
		chrome.webRequest.onResponseStarted.addListener(function(response){
		var initiator = new URL(response.initiator);
		var url = new URL(response.url);
		if(initiator.hostname !== url.hostname){
	    	const responseDetails = {
	    		"type" : 'thirdParty',
	    		"response" : response,
	    		"url" : response.originUrl
	    	};
	    	if(response.tabId >=0){
	    		var cookieList = document.getElementById('cookie-list');
	    	queue.push(responseDetails);
	    	myself.processEvent(queue).then();
  			return true;
	    	}
		}
	},
	{
 	urls: ["<all_urls>"]
	},
	["responseHeaders"]);

	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
		const eventDetails = {
    		"type" : 'firstParty',
    		"data" : {
    			tabId,
    			changeInfo,
    			tab
    		}
    	};
    	
	    	queue.push(eventDetails);
	    	myself.processEvent(queue).then();
  			return true;

    });

	},

	async processEvent(queue){
		var myself = this;
    	
		var p = await myself.processHeader(queue);
		return p;
	},

	async processHeader(queue,ignore = false){
		var myself = this;
		if (myself.processingQueue && !ignore) {
	      return;
	    }
	    if (queue.length >= 1) {

	    	try{
		        const nextEvent = queue.shift();

		        myself.processingQueue = true;

		        switch (nextEvent.type) {
		          case 'firstParty':

		            await myself.setHeaderFirstParty(
		              nextEvent.data.tabId,
		              nextEvent.data.changeInfo,
		              nextEvent.data.tab
		            );

		            break;
		          case 'thirdParty':
		            await myself.setHeaderThirdParty(nextEvent.response);
		          break;
		          default:
		            throw new Error(
		              'An event must be of type firstparty or thirdparty.'
		            );
		        }
			}catch (e) {
        		// eslint-disable-next-line no-console
        		console.warn('Exception found in queue process', e);
      		}

		    await myself.processHeader(queue,true);
	    } else {
		        console.log('ll');

	      myself.processingQueue = false;
	    }

	    return true;
	},

	async setHeaderThirdParty(response){
		var myself = this;

  		let urlResponse = response.url;
    	chrome.tabs.get(response.tabId, (tab) =>{
			if(tab.url !== urlResponse){ //escludo il sito di prima parte considerato in seguito
				chrome.cookies.getAll({url: urlResponse}, async function(cookies){	
   				const details = {
  					"type" : 'thirdParty',
 					"data" : response,
 					"cookies" : (cookies.length>0) ? cookies : ''
	 			};

	 			await myself.saveParty(details,tab).then();
  				return true;
	 	
				});
			}
	 	});

	},

	async saveParty(details,tab){
		var myself = this;
		var p = await myself.setParty(details,tab);
		return p;
	},

	async setHeaderFirstParty(tabId, changeInfo, tab){

		var myself = this;
		let urlTab = tab.url;
		chrome.cookies.getAll({url: urlTab}, async function(cookies){
			const details = {
		    	"type" : 'firstParty',
		    	"data" : {tabId, changeInfo, tab},
		    	"cookies" : (cookies.length>0) ? cookies : ''
	 	    };
			await myself.saveParty(details,tab).then();

  			return;

		});
		return;
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

			return true;


	},

	async setThirdPartyToStore(tab, data, cookies){
		urlTab = new URL(tab.url);
		const urlTarget = new URL(data.url);
		if(data.url && data.initiator && !(urlTarget.hostname.includes(urlTab.hostname))){
		console.log('SITO TERZE PARTI: -->'+urlTarget.hostname);

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

			await store.storeParty(party.origin,party);
		}
	},
	async setFirstPartyToStore(tab,cookies){

		urlTab = new URL(tab.url);
		let newDate = new Date(Date.now());

		if(urlTab.hostname && tab.status === 'complete'){
			party = {
				"hostname": urlTab.hostname,
				"iconURL" : tab.favIconUrl,
				"firstParty" : true,
				"requestTime" : newDate,
				"cookiesFirstParty" : (cookies.length>0) ? cookies : ''
			};

			await store.storeParty(party.hostname,party);
		}
		return;
	}
};

capture.init();
