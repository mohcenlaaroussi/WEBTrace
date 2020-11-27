console.log("content partito");


chrome.runtime.onMessage.addListener(riceviMsg);

function riceviMsg(message, sender, sendResponse){
	console.log(message);
}