/**
 *	Spook - JavaScript Spirite Canvas Game Framework
 *	@author Archon Shigeru
 *	@license MIT
 *	@version 0.0.1
 */

/**
 * Polyfills
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

/**
 * Core
 */
function Spook(Canvas, Width, Height, Options) {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = {};
    this.downloadQueue = [];
    this.soundsQueue = [];
    this.content = null;

    this._cycles = [];
	this._willUpdateContent;
	this._updateContent;
	this._didUpdateContent;
	this._willDrawContent;
	this._drawContent;
	this._didDrawContent;
}

/**
 * Asset Manager
 */
Spook.prototype.load = function(name, src) {
	var asset = {
			name: name,
			src: src
		};

    this.downloadQueue.push(asset);
    return this;
}

Spook.prototype.loading = function(downloadCallback) {
	if (this.downloadQueue.length === 0) {
    	downloadCallback(true, 100);
	}

  for (var i = 0; i < this.downloadQueue.length; i++) {
    var path = this.downloadQueue[i].src;
    var name = this.downloadQueue[i].name;
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
    img.name = name;
    img.test = 'Just test';
    this.cache[name] = img;
  }
}

Spook.prototype.isDone = function() {
	return (this.downloadQueue.length == this.successCount + this.errorCount);
}

Spook.prototype.getAsset = function(name) {
	return this.cache[name];
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

		// Create empty cycle step if not created by user
		if (!this._willUpdateContent) { 
			this.willUpdate(function () {});
		}

		if (!this._updateContent) {
			this.update(function () {});
		}

		if (!this._didUpdateContent) {
			this.didUpdate(function () {});
		}

		if (!this._willDrawContent) {
			this.willDraw(function () {});
		}

		if (!this._drawContent) {
			this.draw(function () {});
		}

		if (!this._didDrawContent) {
			this.didDraw(function () {});
		}

		this._addToQueue();
		this.cycleQueue(true);
	}
}

/**
 * Game cycles
 */
Spook.prototype.cycleQueue = function (next) {
	debugger;
    if(this._cycles.length == 0) return;
    var fnc = this._cycles.pop();
    fnc();
    if(next) {
        this.cycleQueue(true);
    }
}

Spook.prototype.willUpdate = function (fn) {
	this._willUpdateContent = fn;
}

Spook.prototype.update = function (fn) {
	this._updateContent = fn;
}

Spook.prototype.didUpdate = function (fn) {
	this._didUpdateContent = fn;
}

Spook.prototype.willDraw = function (fn) {
	this._willDrawContent = fn;
}

Spook.prototype.draw = function (fn) {
	this._drawContent = fn;
}

Spook.prototype.didDraw = function (fn) {
	this._didDrawContent = fn;
}

Spook.prototype._addToQueue = function () {
	this._cycles.push(this._didDrawContent);
	this._cycles.push(this._drawContent);
	this._cycles.push(this._willDrawContent);
	this._cycles.push(this._didUpdateContent);
	this._cycles.push(this._updateContent);
	this._cycles.push(this._willUpdateContent);

	this.cycleQueue(true);
}

/**
 * Sprite Manager
 */
 Spook.prototype.sprite = function(width, height, name) {
 	this.width = width;
 	this.height = height;
 	this.name = name.name;
 }