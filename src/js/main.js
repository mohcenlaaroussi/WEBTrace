chrome.runtime.onMessage.addListener(update);

var isLink;

async function init(){
	isLink = [];
	var websites = {};
	var app = await getWebsitesDb();
	var app2 = await getCookiesDb();
	let newDate = new Date(Date.now());

	var yesterday = new Date(Date.now());
	yesterday.setDate(newDate.getDate() - 1);
	for(let web in app)
		websites[web] = app[web];
	await drawOnIndex(websites, website = null);
	return;
}

async function update(message, sender, sendResponse){
	var websites = message.websites;
	var website = message.site;
	if(message.type == 'updateGraph'){
		await drawOnIndex(websites,website);
	}
	return;
}

async function getNodesLinks(websites){
	var nodes = [];
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
		let objNode = {
			'hostname' : website,
			'website' : websites[website]
		};

		nodes.push(objNode);


	}
	let linksApp = await getLinksDb();
	var links = [];

	for(let key in linksApp){
		let str = key.split(">");
		const link = {
			'source' : str[0],
			'target' : str[1]
		};
		let obj={
			'source' : str[0],
			'target' : str[1],
			'cookies': linksApp[key].cookies
		};
		if(await isNodePresent(obj,nodes))
			links.push(obj);
		isLink.push(obj);

	}

	return {
      nodes,
      links
			//isLink
    };

}

async function isNodePresent(obj,nodes){
	let i = 0;
	for(let node of nodes){
		if(obj.source == node.hostname)
			i++;
		if(obj.target == node.hostname)
			i++;
	}
	if(i>=2)
		return true;
	return false;
}

async function getLinks(){
	return isLink.slice();
}

async function drawOnIndex(websites, website){
	let site;
	let nodesLinks = await getNodesLinks(websites);
	var path = window.location.pathname;
	var page = path.split("/").pop();
	if(page == 'index.html'){
		if(website){
			site = website;
			initSketch(nodesLinks.nodes,nodesLinks.links,site);
		}else{
			initSketch(nodesLinks.nodes,nodesLinks.links,false);
		}
	}
	return;
}

window.onload = () => {
	if (window.location.href.match('index.html') != null) {
		init();

 	}
	$(document).on("click", "#restart", async function(event) {
		await resetDb();

	});

};
