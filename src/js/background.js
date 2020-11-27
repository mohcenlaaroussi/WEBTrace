console.log("background partito");

chrome.browserAction.onClicked.addListener(apri);

async function apri() {
    var finestre = [];
    var boolean;
    const fullUrl = chrome.extension.getURL('index.html');
    let prova = await chrome.tabs.query({}, function(tabb){
    	for (var i = 0; i < tabb.length; i++) {
    		finestre[i] = (tabb[i].url === fullUrl);
    	}
    	var bool = finestre[tabb.length-1];
    	apriTab(bool);
    });
    function apriTab(bool){
    	console.log(bool);
	  const tabprova = bool;
	  if (!tabprova) {
	  } else if (!tabprova.active) {
	    chrome.tabs.update(tabprova.id, {active: true});
	  }
    }
    return boolean || false
  }


