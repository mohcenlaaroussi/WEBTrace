const urlMetadata = require('url-metadata');
var category = [];
var prevTab = null;
var isAllowed = false;
function init(){
	listener();
}


async function listener(){

	var queue = [];
	var content;
	var contentType;
	var headercontent;
	var type;
	chrome.webRequest.onResponseStarted.addListener(function(response){
	//console.log(response.initiator);
	if(response.initiator){
		var protocol = response.initiator.split(":")[0];
		if(protocol != 'chrome' && protocol != 'chrome-extension'){
			//console.log(response);
			//console.log(response.url);
			for(var header of response.responseHeaders){
				if(header['name'] == 'content-type'){
					content = header['value'];
					contentType= content.split(';')[0];
				}
				if(header['name'] == 'content-disposition'){
					headercontent = header['value'];
					type = headercontent.split(';')[0];
				}
			}

			//console.log(response.type);
			//console.log(contentType);
			//console.log(type);
			if(response.type = 'xmlhttprequest' && contentType == 'application/json' && type != 'attachment' && response.method == 'GET'){ //filtro soltanto quelle di tipo XHR
				//console.log(response);
				//console.log('entra');
				let urlRes = response.url;
				let method = response.method;
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = async function() {
						var dati = null;
						if (this.readyState == 4 && this.status == 200) {
								var ris = this.responseText;
								var obj;
								var json = false;
								try {
									obj = JSON.parse(ris);
									json = true;
								} catch (e) {
									//obj = ris;
									json = false;
								}
								if (!json) {
									obj = ris;
								}
								console.log('pacchetto in entrata: ');
								console.log(response);
								console.log('contenuto');
								console.log(obj);
								//var i = 0;

						}
							return;
					};
					xhttp.open(method,urlRes, true);
					xhttp.send();
			}
			if(response.initiator){
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
			}
		}
	}
},
{
urls: ["<all_urls>"]
},
["responseHeaders"]);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	/*if(tab.protocol = 'chrome'){
		isAllowed = false;
	}else{
		isAllowed = true;
	}*/
	//console.log('inizio');
	//console.log(tab);
	var protocol = tab.url.split(":")[0];
	if(protocol != 'chrome' && protocol != 'chrome-extension'){
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
	}
	});

	/*chrome.webRequest.onBeforeRequest.addListener(
	    function(details)
	    {
					console.log('pacchetti uscenti');
	        console.log(details);
	    },
	    {urls: ["<all_urls>"]},
	    ['requestBody']
	);*/
	chrome.webRequest.onBeforeRequest.addListener(
    async function(details) {
        if(details.method == "POST"){
        // Use this to decode the body of your post
				if(details.requestBody){
					console.log('Pacchetto in uscita: ');
					console.log(details);
					var postedString;
					if(details.requestBody.raw){
            postedString = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes)));
					}else{
						if(details.requestBody.formData)
							postedString = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.formData.bytes)));
						else {
							postedString = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.bytes)));

						}
					}
					//console.log(postedString);

						//var json = JSON.parse(postedString);
						var obj;
						var json = false;
						try {
							obj = JSON.parse(postedString);
							json = true;
						} catch (e) {
							json = false;
						}
						if(!json){
							obj = postedString;

						}
						console.log('contenuto');
           console.log(obj);
					 if(obj){
						 let web;
						 let urlIn = new URL(details.initiator);
						 let notPresent = await isNotPresent(urlIn.hostname);
						 if(!notPresent){
							 web = await getWebsite(urlIn.hostname);
							if(!('xhrPackets' in web)){
								web['xhrPackets'] = [];
							}
							if(typeof obj == 'object' || typeof obj == 'array')
							 	web['xhrPackets'].push(obj);
								await updateDb(urlIn.hostname,web);
						 	}
						 console.log('non vuoto');
					 }
				 }
			 }
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestBody"]
);

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
							var protocol = nextEvent.data.tab.url.split(":")[0];
							if(protocol != 'chrome' && protocol != 'chrome-extension'){
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
							}
						break;
						case 'thirdParty':
							if(nextEvent.response)
								await setHeaderThirdParty(nextEvent.response);
						break;
						default:
							throw new Error(
								'An event must be of type firstparty or thirdparty.'
							);
					}
		}catch (e) {
					console.warn('Exception found in queue process', e);
				}

			await processHeader(queue,true);
		} else {
			processingQueue = false;
		}

		return true;
}

async function setHeaderThirdParty(response){
	if(response){
			let urlResponse = response.url;
			chrome.tabs.get(response.tabId, (tab) =>{
			if (chrome.runtime.lastError) {
				console.log(chrome.runtime.lastError.message);
			}else{
				if(tab.url !== urlResponse){ //&& tab.active){ //escludo il sito di prima parte considerato in seguito
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
			}
		});
	}
}
async function saveParty(details,tab){
	var p = await setParty(details,tab);
	return p;
}

async function setHeaderFirstParty(tabId, changeInfo, tab){
	var prevUrl =(prevTab) ? new URL(prevTab.url) : new URL(tab.url);
	if((changeInfo.url || prevTab == null)){ //&& tab.active){

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
	var protocol = tab.url.split(":")[0];
	if(tab.id>0 && protocol != 'chrome' && protocol != 'chrome-extension'){
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
		}else {
			return false;
		}

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

/*async function getCategory(title,description,keywords,baseUrl){
	//TODO TRADUZIONE TESTO
	var string = title +' '+description+' '+keywords.toString();
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
		return;
}*/
async function getCategory(baseUrl){
	//TODO TRADUZIONE TESTO
	//var string = title +' '+description+' '+keywords.toString();
		var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = async function() {
				var dati = null;
				if (this.readyState == 4 && this.status == 200) {
					var ris = this.responseText;
					var obj = JSON.parse(ris);
					var categories = obj.data[0];
					var i = 0;
					console.log(obj);
					for(var cat of categories.categories){
						if(cat.score>=0.1)
							await setCategory(cat);
					}
					/*while(obj.categories[i].score>=0.1){
						//var dati = obj.categories[i].name;
						//var score = obj.categories[i].score;
						await setCategory(obj.categories[i]);
						i++;
				}*/
				}
					return;
			};
			var key = config.access_key+':'+config.secret_key;
			//string = string.replace(/\u2019/g,'');
			var encoded_key = window.btoa(key);
			var url_encoded = window.btoa(baseUrl)
			//xhttp.open("GET", "https://api.dandelion.eu/datatxt/cl/v1/?text="+string+"&model=54cf2e1c-e48a-4c14-bb96-31dc11f84eac&token=5f4761a82e7b4a96a729fb9ae6dc7fc0", true);
			xhttp.open("GET", "https://api.webshrinker.com/categories/v3/<"+url_encoded+">", true);
			xhttp.setRequestHeader("Authorization",'Basic '+ encoded_key);
			//xhttp.send();
		return;
}


//TODO DA MODIFICARE ANCORA. IN FASE PRELIMINARE
async function getTypeWebsite(title,description,keywords){
	var typeWebsite;
	var string = title +' '+description+' '+keywords.toString();
		string = string.replace(/\u2019/g,' ').toLowerCase();
		//blog
		if(string.includes("blog")){
			typeWebsite = "Blog";
		}
		//news_media
		if(string.includes("news") && string.includes("media")){
			typeWebsite = "News";
		}
		//Streaming_video
		if(string.includes("streaming") || string.includes("film")){
			typeWebsite = "TV/Video streaming";
		}

		if(string.includes("wiki")){
			typeWebsite = "Wiki";
		}
		//Social media
		//TODO SOCIAL MEDIA
		/*if(string.includes("streaming") || string.includes("film")){
			typeWebsite = "TV/Video streaming";
		}*/

		//e-commerce
		//TODO TRADUZIONE INGLESE
		if(string.includes("shop")){
			typeWebsite = "E-commerce";
		}
		return typeWebsite;
}

async function setFirstPartyToStore(tab,cookies){
	var typeWebsite = '';
	let urlTab = new URL(tab.url);
	let urlIcon = tab.favIconUrl;
	var baseUrl = await getBaseUrl(tab.url);
	//console.log('url-base: '+baseUrl);
		urlMetadata(baseUrl).then(
			async function (metadata) { // success handler
				let newDate = new Date(Date.now());
				//if(metadata.title || metadata.description || metadata.keywords){

					await getCategory(baseUrl);
					typeWebsite = await getTypeWebsite(metadata.title,metadata.description,metadata.keywords);
				//}
			if(urlTab.hostname){
				party = {
					"hostname": urlTab.hostname,
					"iconURL" : (urlIcon) ? urlIcon : 'chrome://favicon',
					"firstParty" : true,
					"requestTime" : newDate,
					"category" : category,
					"type" : typeWebsite,
					"cookiesFirstParty" : (cookies.length>0) ? cookies : ''
				};
				await storeParty(party.hostname,party);
			}
			},
			function (error) { // failure handler
				console.log(error)
			});
	prevTab = tab;
	category = [];
	obj = [];
	return;
}

init();
