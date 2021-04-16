	var db=null;
	function init(){
		if(!db){
			createDB();
		}
	}

	async function isNotPresent(hostname){
		if (!(await db.websites.get(hostname))) {
      		return true;
    	}
    	return false;
	}

	async function getWebsite(hostname){
		return await db.websites.get(hostname);
	}

	async function getrows(){
  	return db.websites.where('hostname').notEqual(' ').toArray();
	}

	async function getrowsLinks(){
		return db.links.where('link').notEqual(' ').toArray();
	}

	async function getLinksDb(){
			var prova = await getrowsLinks();

			// prova = prova.filter((website) => {
			// 	if(website.cookiesFirstParty)
			// 		return website;
			// });
	    var output = {};
	    for (let link of	prova) {
				console.log(link);
	      output[link.link] = link;
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
					console.log(sito);
		      output[sito.hostname] = sito;
		    }

	    	return output;
	  	}

	function createDB(){
		db = new Dexie('db_siti_cookie');
		db.version(1).stores({
			websites: "hostname",
			cookies: "name",
			links: "link"
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
			}else
    		return await db.websites.put(row);
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
			console.log('SITO DA UPDATARE: ---->');
			console.log(row);
			if(row.type){
				if(row.type == 'cookies')
					return await db.cookies.update(hostname,row);
				else
					return await db.links.update(hostname,row);
			}else{
				return await db.websites.update(hostname,row);
			}
  	}

  	async function isDuplicate(thirdParties,hostname){
		for(var i = 0; i<thirdParties.length; i++){
			if(thirdParties[i].hostname == hostname){
				return true;
			}
		}
		return false;
  	}




	async function cookiePresent(cookie, array){
		for(let c of array.slice()){
			if(cookie.name == c.name && cookie.domain == c.domain && cookie.firstParty == c.firstParty)
				return true;
		}
		return false;
	}

	async function isLink(cookie, array){
		for(let c of array.slice()){
			if(cookie.name == c.name && cookie.domain == c.domain){
				//cookieDB['cookies'].push(cookie);
				console.log('vediamo se funziona: '+c.firstParty);
				return {
					found : true,
					website1: cookie.firstParty,
					website2: c.firstParty
				};
			}
		}
		return{
			found: false
		};
	}

	async function setCookiesLinks(hostname,party){
		var cookieDB = {};
		var linkDB = {};
		let arrayCookies = [];
		if(!('cookiesThirdParty' in party))
			arrayCookies = party.cookiesFirstParty.slice();
		else
			arrayCookies = party.cookiesThirdParty.slice();

		if(arrayCookies && arrayCookies.length >0){
			arrayCookies.forEach(element => {element.firstParty = hostname;});
			for(let cookie of arrayCookies){
				console.log('cooookie');
				console.log(cookie);
				console.log(party);
				cookieDB = await db.cookies.get(cookie.name);
				if(cookieDB && cookieDB['cookies'].length>0){
					console.log(cookieDB);

					var cookiePres = await cookiePresent(cookie, cookieDB['cookies']);

					if(!cookiePres && party.firstParty){
						 //
						let link = await isLink(cookie, cookieDB['cookies']);
						cookieDB['cookies'].push(cookie);
						if(link.found){
							console.log('COLLEGAMENTO: ');
							console.log(link.website1);
							console.log(link.website2);
							let indexColl = link.website1+'>'+link.website2;
							linkDB = await db.links.get(indexColl);
							if(linkDB && linkDB['cookies'].length>0){
								console.log('LINKWEB');
								console.log(linkDB);
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
						await updateDb(cookie.name,cookieDB);
					}
				}else{
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

  async function storeThirdParty(hostname,party){
		var website = {};
		notPresent = await isNotPresent(hostname);
		console.log('PROVA DI STAMPA PARTY THIRD------------------------');
		console.log(party);
		console.log(hostname);
		await setCookiesLinks(hostname, party);

		if(!notPresent){
			website = await getWebsite(hostname);
			//if(website['firstPartyInserted'] == 1)


		}
		if(notPresent){ //se presente
			website['hostname'] = hostname;
			website['firstPartyInserted'] = 0;
			await writeDb(website);
		}
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
			website['nThirdPartyCookies'] += obj.cookies.length;
			website['thirdPartySites'] = insert(obj, website['thirdPartySites']);
			//website['thirdPartySites'].push(obj);
			await updateDb(hostname,website);
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

	  async function storeFirstParty(hostname,party){
	  	var website = {};
			await setCookiesLinks(hostname, party);
			console.log('PROVA DI STAMPA PARTY FIRST------------------------');
			console.log(party);
			console.log(hostname);


			notPresent = await isNotPresent(hostname);
			if(!notPresent){
				website = await getWebsite(hostname);
			}
			console.log('PROVA NOTPRESENT: -->'+ notPresent);
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
			console.log('DB AGGIORNATO: --->');
			console.log(db.websites.get(hostname));
			return website;
	  	}


	async function updateGraph(args2, args) {
			const site = args2;
			const websites = args;
    	chrome.runtime.sendMessage({
      		type: 'updateGraph',
      		websites,
					site
    	});
  	}

	async function storeParty(hostname, party){
		var website = {};
		//console.log('party: '+party.firstParty);
		if(party !== undefined){
			switch(party.firstParty){
				case true:
					website = await storeFirstParty(hostname,party);
					let prova = await getWebsitesDb();
					await updateGraph(website,prova);
					//updateGraph(website);
				break;
				case false:
					website = await storeThirdParty(hostname,party);

				break;

			}
		}
		//console.log(website);
		return;
	}

init();
