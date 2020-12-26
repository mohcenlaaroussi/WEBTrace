
var websites = {};


chrome.runtime.onMessage.addListener(update);


async function init(){
	websites = await getWebsitesDb();
	//console.log('eccoci');
	//console.log(websites);
	await drawOnIndex(null);
}



async function update(message, sender, sendResponse){
	if(message.type == 'updateGraph'){
		let website = message.args;
		websites = await getWebsitesDb();
		await drawOnIndex(website);
	}
}


function getNodesLinks(){
	let nodes = [];
	let links = [];
	let thirdPartiesWithCookies = new Map();
	//console.log(websites);

	for(let website in websites){
		//console.log('arriva');
		const site = websites[website];
	    if (site.thirdPartySites) {
	    	for(let thirdParty of site.thirdPartySites){
	    		if(thirdParty.cookies){
	    			thirdParty.cookies.forEach(element => {element.firstParty = website;}); //DA TROVARE MODO PIù EFFICIENTE
	    			if(!thirdPartiesWithCookies.has(thirdParty.hostname)){
	    				thirdPartiesWithCookies.set(thirdParty.hostname,thirdParty.cookies);
	    			}else{
	    				let cookies = thirdPartiesWithCookies.get(thirdParty.hostname);
	    				//console.log(cookies);
	    				thirdPartiesWithCookies.set(thirdParty.hostname,cookies);
	    				const isLink = cookies.map((element) => {
	    					for(let cookie of thirdParty.cookies) {
	    						if(cookie.name == element.name && cookie.value == element.value && cookie.expirationDate == element.expirationDate){
	    							return {
		            					'cookie': cookie,
		            					'website1' : cookie.firstParty,
		            					'website2' : element.firstParty 
		       				 		};
	    						}else{
	    							/*return {
		            					'cookie': cookie,
		            					'shared': false  
		       				 		};*/
	    						}
	    					}

	        			});
	        			links.push(...isLink);
	    			}
	    		}
	    	}

	      }
	      
	      
	    nodes.push(websites[website]);
	    links = links.filter(function (el) {
  				return el != null;
		});
	}
	return {
      nodes,
      links
    };
}


async function updateDraw(){
	console.log('UPDATEEEEE');

	websites = await getWebsitesDb();
	console.log(websites);
	await drawOnIndex();
}

async function drawOnIndex(website){
	//disegna tramite p5.js
	const nodesLinks = getNodesLinks();
	initSketch(nodesLinks.nodes,nodesLinks.links,website);
}

window.onload = () => {
  init();
};