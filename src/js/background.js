console.log("background partito");

chrome.browserAction.onClicked.addListener(apri);

async function apri() {
    var finestre = [];
    var boolean;
    //console.log(fullUrl);
    let prova = await chrome.tabs.query({}, function(tabb){
        let pos = 0;
        const fullUrl = chrome.extension.getURL('index.html');
    	for (var i = 0; i < tabb.length; i++) {
    		finestre[i] = (tabb[i].url == fullUrl);
            if(tabb[i].url == fullUrl){
                pos = i;
            }
    	}
    	var bool = finestre[pos];
        apriTab(bool);
    });
    function apriTab(bool){
    	console.log(bool);
	  const tabprova = bool;
	  if (!tabprova) {
	    chrome.tabs.create({ url: 'index.html' });
	  } else if (!tabprova.active) {
	    chrome.tabs.update(tabprova.id, {active: true});
	  }
    }
    
    return boolean || false
  }


