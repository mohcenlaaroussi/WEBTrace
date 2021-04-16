chrome.runtime.onMessage.addListener(update);

var isLink;
var links = {};

async function init(){
	isLink = [];
	var websites = {};
	var app = await getWebsitesDb();
	console.log('LINKSSSSSSSSSSSSSSSS------------------');
	console.log(links);
	for(let web in app)
		websites[web] = app[web];
		await drawOnIndex(websites, website = null);
}

async function update(message, sender, sendResponse){
	var websites = message.websites;
	var website = message.site;
	if(message.type == 'updateGraph'){
		/*console.log('UPDATEEEEEE');
		console.log('website aggiornati');
		console.log(websites);*/
		await drawOnIndex(websites,website);
	}
}

async function getNodesLinks(websites){
	let nodes = [];
	let links = [];
	let thirdPartiesWithCookies = new Map();
	let cookiesParty = [];
	var cookiesFirstParty;
	var cookiesThirdParty;
	var partyCookies;
	var partiesVisited = [];
 	var site = [];
	var filteredCookies;
	var flag = false;
	isLink = [];
	for(let website in websites){
// 			console.log('SITI');
// 			console.log(websites);
//
//
// 			//console.log('arriva');
// //			console.log(db.websites.get(hostname));
// 			site = await getWebsite(website);
// 			console.log('---------SITO WEB CORRENTE---------');
// 			console.log(site);
//
//
// 			cookiesFirstParty = [];
// 			cookiesThirdParty = [];
// 			partyCookies = [];
// 			for(let g of site.cookiesFirstParty){
// 				cookiesFirstParty.push(g);
// 			}
// 			if(site.thirdPartySites){
// 				for(let g of site.thirdPartySites){
// 					cookiesThirdParty.push(g);
// 				}
// 			}
// 			let url = site.hostname.split(/\./).slice(-2).join('.');
// 			let obj = {
// 				"hostname": site.hostname,
// 				"firstParty": site.hostname,
// 				"domain" : url,
// 				"cookies": cookiesFirstParty
// 			};
// 			var present = false;
// 			cookiesParty.push(obj);
//
// 			cookiesParty.push(...cookiesThirdParty.slice());
// 			/*cookiesParty.forEach((element) => {
// 				if(element.domain == obj.domain)
// 					present = true;
// 			});*/
// 			//if(!present)
//
// 	    //let thirdParties = site.thirdPartySites;
// 	    if (cookiesParty){
// 				partiesVisited = [];
// 	    	for(let party of cookiesParty){
// 					console.log('PARTY:  ');
// 					console.log(party);
// 	    		//for(let i=0; i<site.thirdPartySites.length; i++)
// 					partyCookies = party.cookies.slice();
// 	    		if(partyCookies.length>0){
// 	    			partyCookies .forEach(element => {element.firstParty = website;}); //DA TROVARE MODO PIù EFFICIENTE
// 						url = party.hostname.split(/\./).slice(-2).join('.');
//
// 	    			if(!thirdPartiesWithCookies.has(url)){
// 							let app = (party.cookies.slice()) ? party.cookies.slice() : [];
//
// 	    				thirdPartiesWithCookies.set(url,app); //TODO: CONSIDERARE CASO NEL QUALE COOKIE VENGONO AGGIUNTI DOPO (ES. DOPO AVER ACCETTARO LE POLICY)
// 	    			}else{
// 							partiesVisited.push(url);
// 							console.log(partiesVisited);
// 							let count = partiesVisited.filter(item => item == url).length;
// 							console.log('prendiii');
// 							console.log(url);
// 	    				let cookies = thirdPartiesWithCookies.get(url);
// 							var current1;
// 							var current2;
// 							flag = false;
// 	    				let isPresent = party.cookies.slice();
// 							var unique;
// 							var uniq = [];
// 							var objLinkUnique = {};
//
// 							unique = true;
//
// 							for(let element of cookies){
// 	    				//const isLink = cookies.map((element) => {
// 								flag = false;
// 	    					//for(let cookie of thirdParty.cookies){
// 								//console.log('cookies');
// 								//console.log(cookies);
// 								//if(party.firstParty == site.hostname)
// 								partyCookies = partyCookies.filter((item) => (item.name !== element.name && item.domain == element.domain &&  item.firstParty == element.firstParty) || (item.firstParty !== element.firstParty));
// 								let cookiesParty = party.cookies.slice();
// 								console.log('ooo');
// 								console.log(partyCookies.length);
// 								console.log(cookiesParty.length);
// 								/*if(partyCookies.length >0){
// 									console.log('DENTRO');
// 									cookiesParty = partyCookies;
// 								}*/
// 								console.log('party.hostname: '+party.hostname);
// 								console.log('site.hostname: '+site.hostname);
// 								if(partyCookies.slice().length <= cookiesParty.length && count < 2){
// 									console.log('SSSS');
// 	    					for(let i = 0; i<partyCookies.length; i++){
// 	    						let cookie = partyCookies[i];
// 									//console.log(party.cookies.slice());
// 									//console.log(cookie);
// 									//console.log(element);
// 									objLinkUnique = {};
//
// 		    						if(cookie.name == element.name && cookie.path == element.path && cookie.domain == element.domain && cookie.firstParty != element.firstParty){
// 											console.log('lunghezza');
// 											console.log(partyCookies);
// 											console.log(partyCookies);
//
// 											isPresent.splice(i,1);
// 											flag = true;
// 												if(unique){
// 													unique = false;
// 												objLinkUnique =  {
// 													'website1' : cookie.firstParty,
// 													'website2' : element.firstParty
// 												};
// 												let clone = {...objLinkUnique};
// 												console.log('COLLEGATO'+objLinkUnique);
// 												console.log(objLinkUnique);
//
// 												//uniq.push(objLinkUnique);
// 												console.log(links.slice());
//
// 												links.push(clone);
// 												console.log(links.slice());
// 												//inserisci in Array
//
// 											}
// 											current1 = cookie.firstParty;
// 											current2 = element.firstParty;
// 		    						}
// 										if(flag){
// 											flag = false;
// 											let objLink =  {
// 												'cookie' : cookie,
// 												'website1' : cookie.firstParty,
// 												'website2' : element.firstParty
// 											};
// 											isLink.push(objLink);
// 										}
// 								//	}
// 								//break;
//
// 	    					}
//
// }
//
//
// 							}
// 	        			//});
//
//
//
//
// 	        			Array.prototype.push.apply(cookies, partyCookies);
// 								console.log('provaa');
// 								console.log(cookies);
// 								console.log(thirdPartiesWithCookies);
// 	        			thirdPartiesWithCookies.set(url,cookies);
// 								console.log(thirdPartiesWithCookies);
// 								var coll = isLink.filter(function (el) {
//   								return el != null;
// 								});
// 								/*uniq = coll.filter(function(item, pos) {
//     							return coll.indexOf(item) == pos;
// 								});*/
// 								console.log('vettore unique');
// 								console.log(coll.slice());
// 	        			//links.push(...uniq);
// 								console.log(links.slice());
//
// 	    			}
// 	    		}
// 	    	}
//
// 	      }
//
//
// 	    links = links.slice().filter(function (el) {
//   				if(el)
//   					return true;
//   				else
//   					return false;
// 		});

		// console.log('stampa FINALE');
		// console.log(links.slice());
		// cookiesParty = [];
		nodes.push(websites[website]);


	}
	 let linksApp = await getLinksDb();
	for(let key in linksApp){
		let str = key.split(">");
		let objLinkUnique =  {
			'website1' : str[0],
			'website2' : str[1]
		};
		let obj={
			'website1' : str[0],
			'website2' : str[1],
			'cookies': linksApp[key].cookies
		};
		console.log('MOSSIN');
		console.log(objLinkUnique);
		links.push(objLinkUnique);
		isLink.push(obj);
	}

	return {
      nodes,
      links,
			isLink
    };

}

async function getLinks(){
	console.log('stampaaaa');
	console.log(isLink.slice());
	return isLink.slice();
}

async function drawOnIndex(websites, website){
	//disegna tramite p5.js
	let site;
	const nodesLinks = await getNodesLinks(websites);
	if(website){
		site = website;
		initSketch(nodesLinks.nodes,nodesLinks.links,site);
	}else{
		initSketch(nodesLinks.nodes,nodesLinks.links);
	}
}

window.onload = () => {
	if (window.location.href.match('index.html') != null) {
		init();

 	}else{
	console.log('PAGINA CARICATA');
	console.log(window.location.href);
}
	//getCSV();
};
