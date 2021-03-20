const urlMetadata = require('url-metadata');
var category = [];
var prevTab = null;
var isAllowed = false;
var cookies_db;

function init(){
	getCSV();
	listener();

}


async function getCSV(){
	const fileUrl = chrome.runtime.getURL("libs/open-cookie-database.csv");
	fetch(fileUrl)
	.then(response => response.text())
	.then(async function(text){
		await parseCSV(text).then();
		return;
	});
}

async function parseCSV(csv){

	//TODO DA OTTIMIZZARE PER EVITARE DI LEGGERE RIGHE SFASATE O ERRATE
	var csvJSON;
	var lines=csv.split("\n");

  var result = {};

  var headers=lines[0].split(",");

  for(var i=1;i<lines.length;i++){

	  var obj = {};
		let linea = lines[i].replace(/["']/g, "");
		if(lines[i] && lines[i] != ''){
		  var currentline=linea.split(",");
		  for(var j=0;j<headers.length;j++){
			  obj[headers[j]] = currentline[j];
		  }
		}
		if(obj){
			//console.log(obj['Cookie / Data Key name']);
			let key = obj['Cookie / Data Key name'];
	  	result[key]= obj;
		}
  }
	cookies_db = result;
	//csvJSON = JSON.stringify(result)
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
	//console.log('csv-----');
	//console.log(cookies_db);
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
						if(cookies.length>0){
							cookies.forEach(element => {
								element.category = (cookies_db[element.name]) ? cookies_db[element.name].Category : '';
								element.description = (cookies_db[element.name]) ? cookies_db[element.name].Description : '';
							});
						}
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
				if(cookies.length>0){
					cookies.forEach(element => {
						element.category = (cookies_db[element.name]) ? cookies_db[element.name].Category : '';
						element.description = (cookies_db[element.name]) ? cookies_db[element.name].Description : '';
					});
				}
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

async function getCategory(baseUrl){
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
				}
					return;
			};
			var key = config.access_key+':'+config.secret_key;
			var encoded_key = window.btoa(key);
			var url_encoded = window.btoa(baseUrl)
			xhttp.open("GET", "https://api.webshrinker.com/categories/v3/<"+url_encoded+">", true);
			xhttp.setRequestHeader("Authorization",'Basic '+ encoded_key);
		return;
}

async function setFirstPartyToStore(tab,cookies){
	var typeWebsite = '';
	let urlTab = new URL(tab.url);
	let urlIcon = tab.favIconUrl;
	var baseUrl = await getBaseUrl(tab.url);
		urlMetadata(baseUrl).then(
			async function (metadata) { // success handler
				let newDate = new Date(Date.now());
					await getCategory(baseUrl);
			if(urlTab.hostname){
				party = {
					"hostname": urlTab.hostname,
					"iconURL" : (urlIcon) ? urlIcon : 'chrome://favicon',
					"firstParty" : true,
					"requestTime" : newDate,
					"category" : category,
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
