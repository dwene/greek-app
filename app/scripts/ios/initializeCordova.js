var CORDOVA_READY = false;

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
	CORDOVA_READY = true;
    window.open = cordova.InAppBrowser.open;
};