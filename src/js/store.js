	var db;
	var max = 0;
	function init(){
		if(!db){
			createDB();
		}
	}

	async function isNotPresent(hostname){
		await getWebsitesDb();
		if (!(await db.websites.get(hostname))) {
      		return true;
    	}
    	return false;
	}

	function getMax(){
		return max;
	}

	async function getWebsite(hostname, callback){
		let website = await db.websites.get(hostname);
		if(website)
			callback(website);
		return website;
	}

	async function resetDb(){
		db.websites.clear();
		db.cookies.clear();
		db.links.clear();
		location.reload();
	}

	async function getrows(){
  	return db.websites.where('hostname').notEqual(' ').toArray();
	}

	async function getrowsLinks(){
		return db.links.where('link').notEqual(' ').toArray();
	}

	async function getrowsCookies(){
		return db.cookies.where('name').notEqual(' ').toArray();
	}

	async function getrowsShared(){
		return db.dataShared.where('date').notEqual(' ').toArray();
	}


	async function getLinksDb(){
			var prova = await getrowsLinks();

	    var output = {};
	    for (let link of	prova) {
	      output[link.link] = link;
	    }
    	return output;
  	}

		async function getSharedDb(){
				var prova = await getrowsShared();
				var output = {};
				for (let data of	prova) {
					output[data.date] = data;
				}
				return output;
			}


		async function getCookiesDb(){
				var prova = await getrowsCookies();

				var output = {};
				for (let link of	prova) {
					output[link.name] = link;
				}

				return output;
			}

		async function getWebsitesDb(){
				var prova = await getrows();
				prova = prova.filter((website) => {
					if(website.cookiesFirstParty)
						return website;
				});
		    var output = {};
		    for (let sito of	prova) {
		      output[sito.hostname] = sito;
		    }

	    	return output;
	  	}

	function createDB(){
		db = new Dexie('db_siti_cookie');
		db.version(2).stores({
			websites: "hostname",
			cookies: "name",
			links: "link",
			dataShared: "date"
		});
		db.open();
	}

	async function writeDb(row) {
    	for (const key in row) {
      		row[key] = convertBooleans(row[key]);
    	}
			if(row.type){
				if(row.type == 'cookies')
					return await db.cookies.put(row);
				else
					return await db.links.put(row);
			}else{
    		return await db.websites.put(row);

			}
			return;
  	}

  	function convertBooleans(element){
  		if (element === true) {
       		element = 1;
      	}
      	if (element === false) {
        	element = 0;
      	}
      	return element
  	}

  	async function updateDb(hostname,row){
  		for (const key in row) {
      		row[key] = convertBooleans(row[key]);
    	}
			if(row.type){
				if(row.type == 'cookies')
					await db.cookies.update(hostname,row);
				else
					await db.links.update(hostname,row);
			}else{
				await db.websites.update(hostname,row);
			}

			return;
  	}

  	async function isDuplicate(thirdParties,hostname){
		for(var i = 0; i<thirdParties.length; i++){
			if(thirdParties[i].hostname == hostname){
				return true;
			}
		}
		return false;
  	}

		async function isDuplicateDomain(thirdParties,party){
			let dom;
			let hostname = party.hostname;
			let host = hostname.substring(hostname.lastIndexOf(".", hostname.lastIndexOf(".") - 1) + 1);
			let diff = 0;
			for(var i = 0; i<thirdParties.length; i++){
				dom = thirdParties[i].hostname.substring(thirdParties[i].hostname.lastIndexOf(".", thirdParties[i].hostname.lastIndexOf(".") - 1) + 1);
				if(dom == host && thirdParties[i].cookies!=''){
					if(party.cookies.length>thirdParties[i].cookies.length){
						diff = party.cookies.length - thirdParties[i].cookies.length;
					}
					return {
						isDup : true,
						dif : diff
					};
				}
			}
			return {
				isDup : false,
				dif : diff
			};
		}




	async function cookiePresent(cookie, array){
		for(let c of array.slice()){
			if(cookie.name == c.name && cookie.domain == c.domain && cookie.firstParty == c.firstParty)
				return true;
		}
		return false;
	}

	async function isLink(cookie, array){
		let app = [];
		for(let c of array.slice()){
			if(cookie.name == c.name && cookie.domain == c.domain && cookie.firstParty !== c.firstParty){
				app.push({
					"website1": cookie.firstParty,
					"website2": c.firstParty
				});
			}
		}
		return app;
	}

	async function isNode(web1,web2){
		let website1 = await db.websites.get(web1);
		let website2 = await db.websites.get(web2);
		if(website1 && website2)
			return true;
		return false;
	}

	async function setLinks(link,cookie){
		var linkDB = {};
		for(let i = 0; i<link.length; i++){
			let indexColl = link[i].website1+'>'+link[i].website2;
			let nodePresent = await isNode(link[i].website1,link[i].website2);
			if(nodePresent){
				linkDB = await db.links.get(indexColl);
				if(linkDB && linkDB['cookies'].length>0){
					linkDB['cookies'].push(cookie);
					await updateDb(indexColl,linkDB);
				}else{
					linkDB = {};
					linkDB['link'] = indexColl;
					linkDB['type'] = 'links';
					linkDB['cookies'] = [];
					linkDB['cookies'].push(cookie);
					await writeDb(linkDB);

				}
			}
		}
		return;
	}

	async function setCookiesLinks(hostname,party){
		var cookieDB = {};
		let arrayCookies = [];
		if('cookiesFirstParty' in party)
			arrayCookies = party.cookiesFirstParty.slice();
		if('cookiesThirdParty' in party)
			arrayCookies = party.cookiesThirdParty.slice();
		if(arrayCookies && arrayCookies.length >0){
			for(let cookie of arrayCookies){
				cookieDB = await db.cookies.get(cookie.name);
				if(cookieDB && cookieDB['cookies'].length>0){
					var cookiePres = await cookiePresent(cookie, cookieDB['cookies']);
					if(!cookiePres && party.tabActive){
						let link = await isLink(cookie, cookieDB['cookies']);
						cookieDB['cookies'].push(cookie);
						if(link.length>0){
							await setLinks(link,cookie);
						}

						await updateDb(cookie.name,cookieDB);
					}
				}else{
					if(party.tabActive){
						cookieDB = {};
						cookieDB['name'] = cookie.name;
						cookieDB['type'] = 'cookies';
						cookieDB['cookies'] = [];
						cookieDB['cookies'].push(cookie);
						await writeDb(cookieDB);
					}
				}
			}
		}
		return;
	}

  async function storeThirdParty(hostname,party){
		var website = {};
		notPresent = await isNotPresent(hostname);
		await setCookiesLinks(hostname, party);

		if(!notPresent){
			website = await getWebsite(hostname, function(){});

		}
		if(notPresent){
			website['hostname'] = hostname;
			website['firstPartyInserted'] = 0;
			website['nPackets'] = 0;
			website['sizePackets'] = 0;
			website['dataShared'] = {};
			website['xhrPackets'] = [];


			await writeDb(website);
		}
		if(website){ //TODO SE IF IT WORKS LATER
			if(!('thirdPartySites' in website)){
				website['thirdPartySites'] = [];
				website['nThirdPartyCookies'] = 0;
			}
			let obj = {
				"hostname": party.target,
				"firstParty": hostname,
				"domain" : (party.cookiesThirdParty.length>0) ? party.cookiesThirdParty[0].domain : '',
				"cookies": (party.cookiesThirdParty.length>0) ? party.cookiesThirdParty : ''
			};
			if(!await isDuplicate(website['thirdPartySites'],party.target)){
				let dom = hostname.substring(hostname.lastIndexOf(".", hostname.lastIndexOf(".") - 1) + 1);
				let tphostname =party.target.substring(party.target.lastIndexOf(".", party.target.lastIndexOf(".") - 1) + 1);
				let is_duplicate = await isDuplicateDomain(website['thirdPartySites'],obj);
				if(dom != tphostname && !is_duplicate.isDup){
					website['nThirdPartyCookies'] += obj.cookies.length;
				}
				website['thirdPartySites'] = insert(obj, website['thirdPartySites']);
				website['nThirdPartyCookies'] += is_duplicate.dif;

				await updateDb(hostname,website);
			}
		}
		return website;
  }


		function insert(element, array) {
			array.push(element);
		  array.sort(function(a, b) {
	  	return b.cookies.length-a.cookies.length;
		 });
		 return array;
	 		}

	  async function storeFirstParty(hostname,party, _callback){
	  	var website = {};
			await setCookiesLinks(hostname, party);

			notPresent = await isNotPresent(hostname);
			if(!notPresent){
				website = await getWebsite(hostname, function(){});
			}
			if(notPresent || website['firstPartyInserted'] == 0){ // se non è presente oppure se è stato aggiunto da terze parti
				for(let key in party){
					if(key === 'cookiesFirstParty'){
						website['cookiesFirstParty'] = [];
						for(let cookie of party[key]){
							website['cookiesFirstParty'].push(cookie);
						}
					}
					website[key] = party[key];
				}
				if(notPresent){
					await writeDb(website);
				}
				if(website['firstPartyInserted'] == 0){
					website['firstPartyInserted'] = 1;
					await updateDb(hostname,website);
				}
			}else{
				let newDate = new Date(Date.now());
				db.websites.update(hostname, {requestTime: newDate}).then(function (updated) {
	  			if (updated)
				   	console.log ("Updated");
					else
					console.log ("date not updated");
				});
			}
			_callback(website);
			return;
	  	}


	async function updateGraph(args2, args) {
			const site = args2;
			const websites = args;
    	chrome.runtime.sendMessage({
      		type: 'updateGraph',
      		websites,
					site
    	});
			return;
  	}

	async function storeParty(hostname, party){
		var website = {};
		if(party !== undefined){
			switch(party.firstParty){
				case true:
						let row = await db.websites.get(hostname);
						if((row && !row.cookiesFirstParty) || !row){
							await storeFirstParty(hostname,party, async function (website){
								let prova = await getWebsitesDb();
								await updateGraph(website,prova);
								return;
							});
						}
				break;
				case false:
					website = await storeThirdParty(hostname,party);

				break;

			}
		}
		return;
	}

init();
