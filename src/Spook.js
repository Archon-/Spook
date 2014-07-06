/**
 *	Spook - JavaScript Spirite Canvas Game Framework
 *	@author Archon Shigeru
 *	@license MIT
 *	@version 0.0.1
 */
var Spook = function(CanvasWidth, CanvasHeight, CanvasId){
	return true;
}

window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
})();

function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = {};
    this.downloadQueue = [];
    this.soundsQueue = [];
}

AssetManager.prototype.queueDownload = function(path) {
    this.downloadQueue.push(path);
}

AssetManager.prototype.downloadAll = function(downloadCallback) {
	if (this.downloadQueue.length === 0) {
    	downloadCallback(true, 0);
	}

  for (var i = 0; i < this.downloadQueue.length; i++) {
    var path = this.downloadQueue[i];
    var img = new Image();
    var that = this;
    img.addEventListener("load", function() {
    	that.successCount += 1;
        if (that.isDone()) {
	        downloadCallback(true, that.progress());
	    } else {
	    	downloadCallback(false, that.progress());
	    }
    }, false);
    img.addEventListener("error", function() {
    	console.log('Can\'t load'	);
        that.errorCount += 1;
	    if (that.isDone()) {
	        downloadCallback(true, that.progress());
	    } else {
	    	downloadCallback(false, that.progress());
	    }
    }, false);
    img.src = path;
    this.cache[path] = img;
  }
}

AssetManager.prototype.isDone = function() {
    return (this.downloadQueue.length == this.successCount + this.errorCount);
}

AssetManager.prototype.getAsset = function(path) {
    return this.cache[path];
}

AssetManager.prototype.progress = function() {
	return (this.successCount + this.errorCount) / this.downloadQueue.length;
}

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload('http://upload.wikimedia.org/wikipedia/commons/c/c8/USNS_Big_Horn_T-AO-198.jpg');
ASSET_MANAGER.queueDownload('../assets/image.jpg');
ASSET_MANAGER.queueDownload('../assets/image2.jpg');
ASSET_MANAGER.queueDownload('http://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg');
ASSET_MANAGER.queueDownload('http://upload.wikimedia.org/wikipedia/commons/6/6b/Big_Sur_June_2008.jpg');
// ASSET_MANAGER.queueSound('alien-boom', 'audio/alien_boom.mp3');
// ASSET_MANAGER.queueSound('bullet-boom', 'audio/bullet_boom.mp3');
// ASSET_MANAGER.queueSound('bullet', 'audio/bullet.mp3');

ASSET_MANAGER.downloadAll(function(isLoaded, counter) {
    // game.init(ctx);
    // game.start();
    if (isLoaded === false) {
    	console.log('Donaloaded: ' + counter);
    } else {
    	console.clear();
	    console.log('Assets loaded! All files: ' + counter);
	    console.log(ASSET_MANAGER.getAsset('../assets/image2.jpg').src);
	}
});

//window['spook'] = spook;
