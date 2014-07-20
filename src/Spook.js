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
function Spook(Id, Width, Height, Options) {
	var _canvas,
		startTime = new Date().getTime();

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
	this._requestId; // rAF id
	this.canvas = {};

	this.i = 0;

	this.running = false; // Is game running at this moment?

	this.canvas.id = Id;

	this.canvas.width = (typeof Width === 'undefined') ? 800 : Width;
	this.canvas.height = (typeof Height === 'undefined') ? 600 : Height;

	if (document.getElementById(Id) === null) {
		_canvas = document.createElement('canvas');
		_canvas.id = Id;

		_canvas.width = this.canvas.width;
		_canvas.height = this.canvas.height;

	    this.context = _canvas.getContext('2d');

	    document.body.appendChild(_canvas);

		console.log('canvas' + Id);
	} else {
		_canvas = document.getElementById(Id);
		_canvas.width = this.canvas.width;
		_canvas.height = this.canvas.height;

		this.context = _canvas.getContext('2d');
	}

	this._FPS = {
		value: 0,
		lastTime: 0,
		lastTimeCounterUpdate: 0,
		history: []
	}

    this._FPS.lastTime = startTime;
    this._FPS.lastTimeCounterUpdate = startTime;
}

Spook.prototype.gameLoop = function () {
	var that = this;

	this.FPSCounterUpdate();
	this.preCycles();
	this._FPSRender();
	this._requestId = window.requestAnimationFrame( function() { that.gameLoop(); } );
}

Spook.prototype.render = function () {
	this.context.fillStyle = "rgb(255,0,0)";
	this.context.fillRect(this.i, this.i, 50, 50);

	this.i++;
}

Spook.prototype.stop = function () {
	if (this._requestId) {
       window.cancelAnimationFrame(this._requestId);
       this._requestId = undefined;
    }
}

Spook.prototype.play = function () {
	if (typeof this._requestId === 'undefined') {
		this.gameLoop();
	}
}

Spook.prototype.pause = function () {
	if (typeof this._requestId === 'undefined') {
		this.play();
	} else {
		this.stop();
	}
}

Spook.prototype.FPSCounterUpdate = function(){
	var now = new Date().getTime();

	this._FPS.history.push(~~(1000/(now - this._FPS.lastTime)));
	this._FPS.lastTime = now;

	if(this._FPS.history.length === 51){
		this._FPS.history.shift();
		if(now - this._FPS.lastTimeCounterUpdate >= 1000){
			this._FPS.value = ~~(this._FPS.history.reduce(function(pv, cv) { return pv + cv; }, 0)/50);
			this._FPS.lastTimeCounterUpdate = now;
		}
	}
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
	if (this.downloadQueue.length === 0) {
		return 100;
	}

	return (Math.round(((this.successCount + this.errorCount) / this.downloadQueue.length) * 100) / 100) * 100;
}

Spook.prototype.preload = function (fn) {
	fn();
}

Spook.prototype.ready = function (fn) {
	this.content = fn;
	console.log('loading progress: ' + this.progress());
}

Spook.prototype.start = function () {
	if (this.content !== null) {
		this.content();
		this.gameLoop();
	}
}

Spook.prototype.preCycles = function () {  // shoud be private
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

/**
 * Game cycles
 */
Spook.prototype.cycleQueue = function (next) {
    if(this._cycles.length == 0) return;
    var fnc = this._cycles.pop();
    fnc();
    if(next) {
        this.cycleQueue(true);
    }
}

Spook.prototype.clear = function () {
	this.context.fillStyle = "rgb(255,255,255)";
	this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
}

Spook.prototype._FPSRender = function () {
	this.context.fillStyle = '#000';
	this.context.font = 'bold 14px sans-serif';
	this.context.textBaseline = 'bottom';
	this.context.fillText('FPS: ' + this._FPS.value + '!', 10, 24);
}

/**
 * Sprite Manager
 */
 Spook.prototype.sprite = function(width, height, name) {
 	this.width = width;
 	this.height = height;
 	this.name = name.name;
 }