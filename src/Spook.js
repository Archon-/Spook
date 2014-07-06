/**
 *	Spook - JavaScript Spirite Canvas Game Framework
 *	@author Archon Shigeru
 *	@license MIT
 *	@version 0.0.1
 */

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

function Spook() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = {};
    this.downloadQueue = [];
    this.soundsQueue = [];
    this.content = null;
}

Spook.prototype.load = function(path) {
    this.downloadQueue.push(path);
}

Spook.prototype.loading = function(downloadCallback) {
	if (this.downloadQueue.length === 0) {
    	downloadCallback(true, 100);
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
	    if(that.progress() === 100)
	    	that.start();
    }, false);
    img.addEventListener("error", function() {
    	console.log('Can\'t load asset');
        that.errorCount += 1;

	    if (that.isDone()) {
	        downloadCallback(true, that.progress());
	    } else {
	    	downloadCallback(false, that.progress());
	    }

	    if(that.progress() === 100)
	    	that.start();
    }, false);
    img.src = path;
    this.cache[path] = img;
  }
}

Spook.prototype.isDone = function() {
	return (this.downloadQueue.length == this.successCount + this.errorCount);
}

Spook.prototype.getAsset = function(path) {
    return this.cache[path];
}

Spook.prototype.progress = function() {
	return (Math.round(((this.successCount + this.errorCount) / this.downloadQueue.length) * 100) / 100) * 100;
}

Spook.prototype.preload = function (fn) {
	fn();
}

Spook.prototype.ready = function (fn) {
	this.content = fn;
}

Spook.prototype.start = function () {
	if (this.content !== null) {
		this.content();
	}
}

var game = new Spook();

game.preload(function () {
	game.load('http://upload.wikimedia.org/wikipedia/commons/c/c8/USNS_Big_Horn_T-AO-198.jpg');
	game.load('../assets/image.jpg');
	game.load('../assets/image2.jpg');
	game.load('http://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg');
	game.load('http://upload.wikimedia.org/wikipedia/commons/6/6b/Big_Sur_June_2008.jpg');
});

game.loading(function(isLoaded, counter) {
    if (isLoaded === false) {
    	console.log('Donaloaded: ' + counter + '%');
    } else {
	    console.log('Assets loaded! All files: ' + counter + '%');
	    //console.log(game.getAsset('../assets/image2.jpg').src);
	}
});

game.ready(function () {
	console.log('Now its ready!');
	console.log('Gaaaame!');
});
