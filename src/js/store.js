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


	async setWebsite(hostname, party){

	},

	async storeParty(hostname, party){

		notPresent = this.isNotPresent(hostname);
		var website = {};

		if(party !== undefined){
			switch(party.firstParty){
				case true:
					if(notPresent){
						let firstParty = await setWebsite(hostname, party);

						for(let key in party){
							if(key === 'cookiesFirstParty'){
								for(let cookie of party[key]){
									website['cookiesFirstParty'].push(cookie);
								}
							}
							website[key] = party[key];
						}
						

					}

				break;
				case false: 


				break;
			}
		}


		if(present){

		}
	},

	createDB(){
		this.db = new Dexie('db_siti_cookie');
		this.db.version(1).stores({
			websites: "hostname"
		});
		this.db.open();
	}
};

store.init();