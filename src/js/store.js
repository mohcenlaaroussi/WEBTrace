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

	async function getWebsitesDb(){
		 const websites = await db.websites.filter((website) => {
	      	return website.firstParty;
	    }).toArray();
	    const output = {};
	    for (const website of websites) {
	      output[website.hostname]
	        = website;
	    }
    	return output;
  	}


	function createDB(){
		db = new Dexie('db_siti_cookie');
		db.version(1).stores({
			websites: "hostname"
		});
		db.open();
	}

	async function setWebsite(hostname, party){

	}

	async function writeDb(website) {
    	for (const key in website) {
      		website[key] = convertBooleans(key, website[key]);
    	}
    	return await db.websites.put(website);
  	}

  	function convertBooleans(key,element){
  		if (element === true) {
       		element = 1;
      	}
      	if (element === false) {
        	element = 0;
      	}
      	return element
  	}

  	async function updateDb(hostname,website){
  		for (const key in website) {
      		website[key] = convertBooleans(key, website[key]);
    	}
    	return await db.websites.update(hostname,website);
  	}

  	async function isDuplicate(thirdParties,hostname){
		for(var i = 0; i<thirdParties.length; i++){
			if(thirdParties[i].hostname == hostname){
				return true;
			}
		}
		return false
  	}


  	async function storeThirdParty(hostname,party){
  		var website = {};
		notPresent = await isNotPresent(hostname);
		if(!notPresent){
			website = await getWebsite(hostname);
		}
		if(notPresent){ //se presente
			website['hostname'] = hostname;
			website['firstPartyInserted'] = 0;
			await writeDb(website);
		}
		if(!('thirdPartySites' in website)){
			website['thirdPartySites'] = [];
		}
		let obj = {
			"hostname": party.target,
			"cookies": (party.cookiesThirdParty.length>0) ? party.cookiesThirdParty : ''
		};
		if(!await isDuplicate(website['thirdPartySites'],party.target)){
			website['thirdPartySites'].push(obj);
			await updateDb(hostname,website);
		}
		return website;
  	}

	  	async function storeFirstParty(hostname,party){
	  		var website = {};
			notPresent = await isNotPresent(hostname);
			if(!notPresent){
				website = await getWebsite(hostname);
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
			return website;
	  	}


	function updateGraph(...args) {
    	chrome.runtime.sendMessage({
      		type: 'updateGraph',
      		args
    	});
  	}

	async function storeParty(hostname, party){
		var website = {};
		console.log('party: '+party.firstParty);
		if(party !== undefined){
			switch(party.firstParty){
				case true:
					website = await storeFirstParty(hostname,party);
					console.log('ciaoooo');
					updateGraph(website);
					console.log('funziona qua');
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