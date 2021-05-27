const urlMetadata = require('url-metadata');
//var category = [];
var prevTab = null;
var isAllowed = false;
var xhrpackets;
var sortable;
var sum;

var max = 0;
var summ = 0;

var cookies_db;

function init(){
	getCSV();
	listener();

}


async function getCSV(){
	const fileUrl = chrome.runtime.getURL("libs/Open-Cookie-Database/open-cookie-database.csv");
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
			let key = obj['Cookie / Data Key name'];
	  	result[key]= obj;
		}
  }
	cookies_db = result;
	return;
}


async function listener(){

	var queue = [];
	var content;
	var contentType;
	var headercontent;
	var type;
	chrome.webRequest.onResponseStarted.addListener(function(response){
	if(response.initiator){
		var protocol = response.initiator.split(":")[0];
		if(protocol != 'chrome' && protocol != 'chrome-extension'){
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
			if(response.type = 'xmlhttprequest' && contentType == 'application/json' && type != 'attachment' && response.method == 'GET'){ //filtro soltanto quelle di tipo XHR
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
									json = false;
								}
								if (!json) {
									obj = ris;
								}
						}
							return;
					};
					xhttp.open(method,urlRes, true);
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

	chrome.webRequest.onBeforeRequest.addListener(
    async function(details) {
				if(details.initiator){
					let urlIn = new URL(details.initiator);
	        if(details.method == "POST"){
					if(details.requestBody){
						var postedString;
						if(details.requestBody.raw){
	            postedString = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(encodeURI(details.requestBody.raw[0].bytes))));
						}else{
							if(details.requestBody.formData)
								postedString = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.formData.bytes)));
							else {
								postedString = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.bytes)));
							}
						}
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

						 if(urlIn.hostname){
							 await setXHR(urlIn,obj,details,async function(web,hostname){
								 if(web){
									 await updateDb(hostname,web);
								 }
							 });
							}
					 }
				 }

			 }
			 return;
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestBody"]
);

}

async function setXHR(urlIn,obj,details,_callback){
	await getWebsite(urlIn.hostname, async function(web){
		const size = new TextEncoder().encode(JSON.stringify(obj)).length;
		const kiloBytes = size / 1024;
		let urlDest = new URL(details.url);
		if(web){
			if(web['nPackets'] == 0){
				xhrpackets = {"app" : 0};
				sortable = [];
				sum = 0;
			}else{
				if(('xhrPackets' in web)){
					xhrpackets = {};
					for(let xhr of web['xhrPackets']){
						xhrpackets[xhr[0]] = xhr[1];
					}
				}
				sortable = [];
				sum = 0;
			}

		 if(('sizePackets' in web))
			 web['sizePackets'] += kiloBytes;
		 if(xhrpackets){
			 if (!(urlDest.hostname in xhrpackets)) {
				 xhrpackets[urlDest.hostname] = 1;
			 }else
			 	xhrpackets[urlDest.hostname]++;
			 for (var xhr in xhrpackets) {
				 if(xhr != "app"){
					 sum+= xhrpackets[xhr];
					 sortable.push([xhr, xhrpackets[xhr]]);
			 	}
			 }
			 if(('nPackets' in web))
			 	web['nPackets'] = sum;
			 	sortable.sort(function(a, b) {
					return b[1] - a[1];
			 	});
			 if(('xhrPackets' in web)){
				 web['xhrPackets'] = sortable.slice();
			 }
		 }
		 if(web.cookiesFirstParty && web.nThirdPartyCookies && web.nPackets){
			 let today = new Date(Date.now());
			 var yesterday = new Date(Date.now());
			 yesterday.setDate(today.getDate() - 1);
			 yesterday = yesterday.toLocaleDateString();
			 sum = web.cookiesFirstParty.length+web.nThirdPartyCookies + web.nPackets;
			 if(web['dataShared'][yesterday] && web['dataShared'][yesterday] > 0){
				let val = web['dataShared'][yesterday];
				sum = sum - val;
			 }

			 if(max <= sum)
			 	max = sum;

			 let newDate = new Date(Date.now()).toLocaleDateString();
			 if(!('dataShared' in web)){
			 	web['dataShared'] = {};
			 }


			 if(!web['dataShared'][newDate]){
			 		max = sum;
			 }
			 let obj = {
			 	"sum" : sum,
			 	"max" : max
			 };
			 db.websites.where('hostname').notEqual(' ').modify(function(value) {
			 		if(value.dataShared){
			 			value.dataShared[newDate].max=max;
			 		}
			 });

			 web['dataShared'][newDate] = obj;
	 		}
		}

		if(web)
			_callback(web,urlIn.hostname);
		else
			_callback(null,null);
	return;
	});

	return;
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
	if(tab.url && tab.id>0 && protocol != 'chrome' && protocol != 'chrome-extension'){
		let data = event.data;

		let urlTab = new URL(tab.url);

		let cookies = (event.cookies) ? event.cookies : '';
		if(cookies.length>0)
			cookies.forEach(element => {element.firstParty = urlTab.hostname;});

		let tabId = ((data.tabId) ? data.tabId : data.response.tabId);
		var party = {};
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
			"target" : urlTarget.hostname,
			"origin" : urlOrigin.hostname,
			"requestTime" : data.timeStamp,
			"firstParty" : false,
			"cookiesThirdParty" : (cookies.length>0) ? cookies : '',
			'tabActive' : tab.active
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

async function getCategory(baseUrl, _callback){
		var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = async function() {
				var dati = null;

				if (this.readyState == 4 && this.status == 200) {
					var ris = this.responseText;
					var obj = JSON.parse(ris);
					var categories = [];

					let categorie = obj.data[0];

					for(var cat of categorie.categories){
						if(cat.score>=0.1){
							categories.push(cat);
						}
					}
					_callback(categories);
					return;
				}
				if(this.status >= 400 & this.readyState == 4){
					let c = [];
					_callback(c);
					return;
				}
				return;

			};
			var key = config.access_key+':'+config.secret_key;
			var encoded_key = window.btoa(key);
			var url_encoded = window.btoa(baseUrl)
			xhttp.open("GET", "https://api.webshrinker.com/categories/v3/<"+url_encoded+">", true);
			xhttp.setRequestHeader("Authorization",'Basic '+ encoded_key);
			xhttp.send();
		return;
}

async function setFirstPartyToStore(tab,cookies){
	var typeWebsite = '';
	let urlTab = new URL(tab.url);
	let urlIcon = tab.favIconUrl;
	var baseUrl = await getBaseUrl(tab.url);
	let newDate = new Date(Date.now());
	await getCategory(baseUrl,async function(category){
		if(urlTab.hostname){
			party = {
				"hostname": urlTab.hostname,
				"iconURL" : (urlIcon) ? urlIcon : 'chrome://favicon',
				"firstParty" : true,
				"requestTime" : newDate,
				"category" : category,
				"cookiesFirstParty" : (cookies.length>0) ? cookies : '',
				'tabActive' : tab.active
			};
			await storeParty(party.hostname,party);
		}
	});
	prevTab = tab;
	category = [];
	obj = [];
	return;
}

init();
