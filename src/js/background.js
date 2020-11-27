console.log("background partito");

chrome.browserAction.onClicked.addListener(apri);

async function apri() {
  // Checks to see if Lightbeam is already open.
  // Returns true if it is, false if not.
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
	    // only open a new Lightbeam instance if one isn't already open.
	    chrome.tabs.create({ url: 'index.html' });
	  } else if (!tabprova.active) {
	     // re-focus Lightbeam if it is already open but lost focus
	    chrome.tabs.update(tabprova.id, {active: true});
	  }
    }
    
    return boolean || false
  }


