module.exports = (function() {
	"use strict";
	var uuid = require('uuid'),
	crypto = require('crypto'),
	config = require('../config').phantomjs,
	utils = require('./utils'),
	timestamp = Date.now(),
	keyUpdatePeriod = 1 * 60 * 1000; 

	Task.PENDDING = 1;
	Task.ERROR = 2;
	Task.FINISHED = 4;

	Task.getResult = function(task) {
		return {
			uid: task.uid,
			src: task.src,
			status: task.status
		}
	}

	Task.generateId = function(url) {
		if(Date.now() - timestamp > keyUpdatePeriod) {
			timestamp = Date.now();
		}
		return crypto.createHmac('sha1', 'express-shoot' + timestamp).update(url).digest('hex');
	}

	function Task(url, options) {
		utils.mixin(options, config);
		this.uid = options.nocache ? uuid.v4() : Task.generateId(url);
		this.url = url;
		console.log(options.viewportSize);
		this.viewportSize = options.viewportSize;
		this.zoomFactor = options.zoomFactor;
		this.quality = options.quality;
		this.clipRect = options.clipRect;
		this.format = options.format;
		this.savePath = options.savePath;
		this.javascriptEnabled = options.javascriptEnabled;
		this.status = Task.PENDDING;
		this.src = "";
	}

	return Task;
})();