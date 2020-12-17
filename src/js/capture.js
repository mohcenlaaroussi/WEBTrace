	const urlMetadata = require('url-metadata');
	var category = [];
	var prevTab = null;
	function init(){
		listener();
	}


	async function listener(){
		
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
		    	queue.push(responseDetails);
		    	processEvent(queue).then();
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
	    	processEvent(queue).then();
  			return true;
    });

	}

	async function processEvent(queue){
		
    	
		var p = await processHeader(queue);
		return p;
	}

	async function processHeader(queue,ignore = false){
		var processingQueue;
		if (processingQueue && !ignore) {
	      return;
	    }
	    if (queue.length >= 1) {

	    	try{
		        const nextEvent = queue.shift();

		        processingQueue = true;

		        switch (nextEvent.type) {
		          case 'firstParty':
			          if(prevTab){
			          	if(prevTab.id != nextEvent.data.tabId){
			          		prevTab = null;
			          	}
			          }
		            await setHeaderFirstParty(
		              nextEvent.data.tabId,
		              nextEvent.data.changeInfo,
		              nextEvent.data.tab
		            );
		          break;
		          case 'thirdParty':
		            await setHeaderThirdParty(nextEvent.response);
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

		    await processHeader(queue,true);
	    } else {
	      processingQueue = false;
	    }

	    return true;
	}

	async function setHeaderThirdParty(response){
		

  		let urlResponse = response.url;
    	chrome.tabs.get(response.tabId, (tab) =>{
			if(tab.url !== urlResponse && tab.active){ //escludo il sito di prima parte considerato in seguito
				chrome.cookies.getAll({url: urlResponse}, async function(cookies){	
   				const details = {
  					"type" : 'thirdParty',
 					"data" : response,
 					"cookies" : (cookies.length>0) ? cookies : ''
	 			};

	 			await saveParty(details,tab).then();
  				return true;
	 	
				});
			}
	 	});

	}

	async function saveParty(details,tab){
		var p = await setParty(details,tab);
		return p;
	}

	async function setHeaderFirstParty(tabId, changeInfo, tab){
		var prevUrl =(prevTab) ? new URL(prevTab.url) : new URL(tab.url);
		if((changeInfo.url || prevTab == null) && tab.active){
			var url =(changeInfo.url) ? new URL(changeInfo.url) : new URL('https://prova.com');
			if(url.hostname != prevUrl.hostname && tab.status === 'complete'){
				let urlTab = tab.url;
				chrome.cookies.getAll({url: urlTab}, async function(cookies){
					const details = {
				    	"type" : 'firstParty',
				    	"data" : {tabId, changeInfo, tab},
				    	"cookies" : (cookies.length>0) ? cookies : ''
			 	    };
					await saveParty(details,tab).then();

		  			return;

				});
				return;
			}
		}
	}

	async function setParty(event,tab){

		
		let data = event.data;
		let cookies = (event.cookies) ? event.cookies : '';
		let tabId = ((data.tabId) ? data.tabId : data.response.tabId);
		var party = {};


	
			let urlTab = '';
			switch(event.type){
				case 'thirdParty':

					await setThirdPartyToStore(tab, data,cookies);

				break;
				case 'firstParty':
					
					await setFirstPartyToStore(tab,cookies);

				break;

			}

			return true;


	}

	async function setThirdPartyToStore(tab, data, cookies){
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
			if(urlFirstparty.hostname!=party.origin){
				await storeParty(urlFirstparty.hostname,party);
			}else{
				await storeParty(party.origin,party);

			}
		}
	}

	async function getBaseUrl(url){
		var pathArray = url.split( '/' );
		var protocol = pathArray[0];
		var host = pathArray[2];
		var url = protocol + '//' + host;
		return url;
	}

	async function setCategory(obj){
		category.push(obj);
	}

	async function getCategory(title,description,keywords,baseUrl){
		var string = "empty";
		//TODO TRADUZIONE TESTO
		string += title +' '+description+' '+keywords.toString();
			var xhttp = new XMLHttpRequest();
		  	xhttp.onreadystatechange = async function() {
		  		var dati = null;
			    if (this.readyState == 4 && this.status == 200) {
			      var ris = this.responseText;
			      var obj = JSON.parse(ris);
			      var i = 0;
			      while(obj.categories[i].score>=0.1){
			      	var dati = obj.categories[i].name;
				    var score = obj.categories[i].score;
				    await setCategory(obj.categories[i]);
				    i++;
			      }

			    }
			      return;
		  	};
		  	string = string.replace(/\u2019/g,'');
			xhttp.open("GET", "https://api.dandelion.eu/datatxt/cl/v1/?text="+string+"&model=54cf2e1c-e48a-4c14-bb96-31dc11f84eac&token=5f4761a82e7b4a96a729fb9ae6dc7fc0", true);
	  		xhttp.send();
		//}
	  	return;
	}


	async function setFirstPartyToStore(tab,cookies){
		urlTab = new URL(tab.url);
		var baseUrl = await getBaseUrl(tab.url);
		console.log('url-base: '+baseUrl);
			urlMetadata(baseUrl).then(
  			async function (metadata) { // success handler
  				
    			let newDate = new Date(Date.now());
    			if(metadata.title || metadata.description || metadata.keywords){
	    			await getCategory(metadata.title,metadata.description,metadata.keywords,baseUrl);
	    		}
				if(urlTab.hostname){
					party = {
						"hostname": urlTab.hostname,
						"iconURL" : tab.favIconUrl,
						"firstParty" : true,
						"requestTime" : newDate,
						"category" : category,
						"cookiesFirstParty" : (cookies.length>0) ? cookies : ''
					};
					console.log('ARRIVA');
					await storeParty(party.hostname,party);
				}



  			},
  			function (error) { // failure handler
    			console.log(error)
  			});
		prevTab = tab;
		obj = [];
		return;
	}

init();
