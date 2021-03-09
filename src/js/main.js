
chrome.runtime.onMessage.addListener(update);

async function init(){
	var websites = {};
	var app = await getWebsitesDb();
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
 	var site = [];
	var flag = false;
	for(let website in websites){
			console.log('SITI');
			console.log(websites);


			//console.log('arriva');
//			console.log(db.websites.get(hostname));
			site = await getWebsite(website);
			console.log('---------SITO WEB CORRENTE---------');
			console.log(site);


			cookiesFirstParty = [];
			cookiesThirdParty = [];
			partyCookies = [];
			for(let g of site.cookiesFirstParty){
				cookiesFirstParty.push(g);
			}

			for(let g of site.thirdPartySites){
				cookiesThirdParty.push(g);
			}

			let obj = {
				"hostname": site.hostname,
				"domain" : site.hostname,
				"cookies": cookiesFirstParty
			};
			cookiesParty.push(...cookiesThirdParty.slice());
			cookiesParty.push(obj);

	    //let thirdParties = site.thirdPartySites;
	    if (cookiesParty){

	    	for(let party of cookiesParty){
	    		//for(let i=0; i<site.thirdPartySites.length; i++)
					partyCookies = party.cookies.slice();
	    		if(party.cookies.length>0){
	    			party.cookies.slice().forEach(element => {element.firstParty = website;}); //DA TROVARE MODO PIù EFFICIENTE
	    			if(!thirdPartiesWithCookies.has(party.hostname)){
	    				thirdPartiesWithCookies.set(party.hostname,party.cookies.slice()); //TODO: CONSIDERARE CASO NEL QUALE COOKIE VENGONO AGGIUNTI DOPO (ES. DOPO AVER ACCETTARO LE POLICY)
	    			}else{
	    				let cookies = thirdPartiesWithCookies.get(party.hostname);
							var current1;
							var current2;
							flag = false;
	    				let isPresent = party.cookies.slice();
	    				const isLink = cookies.map((element) => {
								flag = false;
	    					//for(let cookie of thirdParty.cookies){
	    					for(let i = 0; i<party.cookies.slice().length; i++){
	    						let cookie = party.cookies.slice()[i];
		    						if(cookie.name == element.name && cookie.path == element.path && cookie.domain == element.domain && cookie.firstParty != element.firstParty){
		    							isPresent.splice(i,1);
											flag = true;
											current1 = cookie.firstParty;
											current2 = element.firstParty;

		    						}
										if(flag){
											return {
												//'cookie' : cookie,
												'website1' : cookie.firstParty,
												'website2' : element.firstParty
											};
										}else {
											return null;
										}
								//	}
	    					}

	        			});
	        			Array.prototype.push.apply(cookies, party.cookies.slice());
	        			thirdPartiesWithCookies.set(party.hostname,cookies);
								var coll = isLink.filter(function (el) {
  								return el != null;
								});
								var uniq = [];
								uniq = coll.filter(function(item, pos) {
    							return coll.indexOf(item) == pos;
								});
	        			links.push(...coll);
	    			}
	    		}
	    	}

	      }


	    nodes.push(websites[website]);
	    links = links.filter(function (el) {
  				if(el)
  					return true;
  				else
  					return false;
		});
		console.log('stampa FINALE');
		console.log(links);
		cookiesParty = [];


	}
	return {
      nodes,
      links
    };
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
  init();
	//getCSV();
};
