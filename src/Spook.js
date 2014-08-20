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
 * Namespace with constants
 */
var Spook = Spook || {

	VERSION: '0.0.1'
};

/**
 * Module system
 */
Spook.module = {
	
	/**
	 * @method Spook.module.add - adding new module
	 * @param {String} module - name of function with module
	 */
	add: function (module) {
		//TODO: Before add check is module exist
		Spook.Game.prototype[module] = Spook[module];
	},

	/**
	 * @method Spool.module.list - list all loaded modules
	 * @param {String} sort - mothod of sorting list
	 */
	list: function () {

	}
};

/**
 * Core
 */
Spook.Game = function (arg) {

	/*
	 * Private atributes
	 */
	var _canvas;

	this._lastTickTime = 0;
	this._frameCounter = 0;
	this._fps = 0;

	/*
	 * Public atributes
	 */
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = {};
    this.downloadQueue = [];
    this.soundsQueue = [];
    this.content = null;
    this.FPS = false;

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

	this.canvas.id = arg.id;

	/*
	 * Constructor
	 */

	this.canvas.width = (typeof arg.width === 'undefined') ? 800 : arg.width;
	this.canvas.height = (typeof arg.height === 'undefined') ? 600 : arg.height;

	if (document.getElementById(arg.id) === null) {
		_canvas = document.createElement('canvas');
		_canvas.id = arg.id;

		_canvas.width = this.canvas.width;
		_canvas.height = this.canvas.height;

	    this.context = _canvas.getContext('2d');

	    document.body.appendChild(_canvas);

		console.log('canvas' + arg.id);
	} else {
		_canvas = document.getElementById(arg.id);
		_canvas.width = this.canvas.width;
		_canvas.height = this.canvas.height;

		this.context = _canvas.getContext('2d');
	}

	// ------

	this.gameLoop = function () {
		var that = this;

		if (this.running) {
			this.FPSCounterUpdate();

			this.preCycles();
			this._FPSRender();
			this._requestId = window.requestAnimationFrame( function() { that.gameLoop(); } );
		}
	}

	this.render = function () {
		this.context.fillStyle = "rgb(255,0,0)";
		this.context.fillRect(this.i, this.i, 50, 50);

		this.i++;
	}

	this.stop = function () {
		if (this._requestId) {
	       window.cancelAnimationFrame(this._requestId);
	       this._requestId = undefined;
	       this.running = false;
	    }
	}

	this.play = function () {
		if (typeof this._requestId === 'undefined') {
			this.running = true;
			this._lastTickTime = new Date();
			this.gameLoop();
		}
	}

	this.pause = function () {
		if (typeof this._requestId === 'undefined' && !this.running) {
			this.play();
		} else {
			this.stop();
		}
	}

	this.FPSCounterUpdate = function(){
	    var currentTime = +(new Date()),
	        diffTime = ~~((currentTime - this._lastTickTime));

	    if (diffTime >= 1000) {
	        this._fps = this._frameCounter;
	        this._frameCounter = 0;
	        this._lastTickTime = currentTime;
	    }

	    this._frameCounter++;
	}

	/**
	 * Asset Manager
	 */
	this.load = function(name, src) {
		var asset = {
				name: name,
				src: src
			};

	    this.downloadQueue.push(asset);
	    return this;
	}

	this.loading = function(downloadCallback) {
		if (this.downloadQueue.length === 0) {
	    	downloadCallback(true, 100);
	        this.start();
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

	this.isDone = function() {
		return (this.downloadQueue.length == this.successCount + this.errorCount);
	}

	this.getAsset = function(name) {
		return this.cache[name];
	}

	this.progress = function() {
		if (this.downloadQueue.length === 0) {
			return 100;
		}

		return (Math.round(((this.successCount + this.errorCount) / this.downloadQueue.length) * 100) / 100) * 100;
	}

	this.preload = function (fn) {
		fn();
	}

	this.ready = function (fn) {
		this.content = fn;
		console.log('loading progress: ' + this.progress());
	}

	this.start = function () {
		if (this.content !== null) {
			this.content();
			this._lastTickTime = new Date();
			this.gameLoop();
		}
	}

	this.preCycles = function () {  // shoud be private
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
	this.cycleQueue = function (next) {
	    if(this._cycles.length == 0) return;
	    var fnc = this._cycles.pop();
	    fnc();
	    if(next) {
	        this.cycleQueue(true);
	    }
	}

	this.clear = function () {
		this.context.fillStyle = "rgb(255,255,255)";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	this.willUpdate = function (fn) {
		this._willUpdateContent = fn;
	}

	this.update = function (fn) {
		this._updateContent = fn;
	}

	this.didUpdate = function (fn) {
		this._didUpdateContent = fn;
	}

	this.willDraw = function (fn) {
		this._willDrawContent = fn;
	}

	this.draw = function (fn) {
		this._drawContent = fn;
	}

	this.didDraw = function (fn) {
		this._didDrawContent = fn;
	}

	this._addToQueue = function () {
		this._cycles.push(this._didDrawContent);
		this._cycles.push(this._drawContent);
		this._cycles.push(this._willDrawContent);
		this._cycles.push(this._didUpdateContent);
		this._cycles.push(this._updateContent);
		this._cycles.push(this._willUpdateContent);
	}

	this._FPSRender = function () {
		this.context.fillStyle = '#000';
		this.context.font = 'bold 14px sans-serif';
		this.context.textBaseline = 'bottom';
		this.context.fillText('FPS: ' + this._fps + '!', 10, 24);
	}

	//this.Sprite = Spook.sprite;
	Spook.module.add('Sprite');

	// -----
}

//Spook.module.add('sprite');

/**
 * Sprite Manager
 */
Spook.Sprite = function (obj) {
	this.width = obj.width;
	this.height = obj.height;
	this.name = obj.name;
	this.image = obj.image;

	this.animate = function () {
		console.log('Animate!!!!!! ' + this.image.width + ', h: ' + this.image.height);
	}
};
