//import Dexie from dexie

//import Dexie from 'dexie';
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



	createDB(){
		this.db = new Dexie('db_siti_cookie');
		this.db.version(1).stores({
			websites: "hostname"
		});
		this.db.open();
	},

	async setWebsite(hostname, party){

	},

	async storeParty(hostname, party){

		notPresent = await this.isNotPresent(hostname);
		var website = {};

		if(party !== undefined){
			switch(party.firstParty){
				case true:
					if(notPresent){
						//let firstParty = await setWebsite(hostname, party);

						for(let key in party){
							if(key === 'cookiesFirstParty'){
								for(let cookie of party[key]){
									website['cookiesFirstParty'].push(cookie);
								}
							}
							website[key] = party[key];
						}
						

					}
					//TODO ELSE
					document.getElementById('pp').innerHTML+=website;

				break;
				case false: 


				break;
			}
		}
	}

};

store.init();