const store = {

	db:null,
	init(){
		if(!this.db){
			this.createDB();
		}
	},

	async isNotPresent(hostname){
		if (!(await this.db.websites.get(hostname))) {
      		return true;
    	}
    	return false;
	},

	async getWebsite(hostname){
		return await this.db.websites.get(hostname);
	},


	createDB(){
		this.db = new Dexie('db_siti_cookie');
		this.db.version(1).stores({
			websites: "hostname"
		});
		this.db.open();
	},

	async setWebsite(hostname, party){

	},

	async writeDb(website) {
    	for (const key in website) {
      		website[key] = this.convertBooleans(key, website[key]);
    	}
    	return await this.db.websites.put(website);
  	},

  	convertBooleans(key,element){
  		if (element === true) {
       		element = 1;
      	}
      	if (element === false) {
        	element = 0;
      	}
      	return element
  	},

  	async updateDb(hostname,website){
  		for (const key in website) {
      		website[key] = this.convertBooleans(key, website[key]);
    	}
    	return await this.db.websites.update(hostname,website);
  	},

  	async isDuplicate(thirdParties,hostname){
		for(var i = 0; i<thirdParties.length; i++){
			if(thirdParties[i].hostname == hostname){
				return true;
			}
		}
		return false
  	},


  	async storeThirdParty(hostname,party){
  		var website = {};
		notPresent = await this.isNotPresent(hostname);
		if(!notPresent){
			website = await this.getWebsite(hostname);
		}
		if(notPresent){ //se presente
			website['hostname'] = hostname;
			website['firstPartyInserted'] = 0;
			await this.writeDb(website);
		}
		if(!('thirdPartySites' in website)){
			website['thirdPartySites'] = [];
		}
		let obj = {
			"hostname": party.target,
			"cookies": (party.cookiesThirdParty.length>0) ? party.cookiesThirdParty : ''
		};
		if(!await this.isDuplicate(website['thirdPartySites'],party.target)){
			website['thirdPartySites'].push(obj);
			await this.updateDb(hostname,website);
		}
		return website;
  	},

	  	async storeFirstParty(hostname,party){
	  		var website = {};
			notPresent = await this.isNotPresent(hostname);
			if(!notPresent){
				website = await this.getWebsite(hostname);
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
					await this.writeDb(website);
				}
				if(website['firstPartyInserted'] == 0){
					await this.updateDb(hostname,website);
				}
			}else{
				let newDate = new Date(Date.now());
				this.db.websites.update(hostname, {requestTime: newDate}).then(function (updated) {
	  			if (updated)
				   	console.log ("Updated");
				 else
					console.log ("date not updated");
				});
			}
			return website;
	  	},

	async storeParty(hostname, party){
		var website = {};
		console.log('party: '+party.target);
		if(party !== undefined){
			switch(party.firstParty){
				case true:
					website = await this.storeFirstParty(hostname,party);
				break;
				case false: 
					website = await this.storeThirdParty(hostname,party);

				break;
					
			}
		}
		console.log(website);
		return;
	}

};

store.init();