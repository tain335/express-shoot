module.exports = (function() {
	"use strict";
	var uuid = require('uuid'),
	crypto = require('crypto'),
	config = require('../config').phantomjs,
	timestamp = Date.now(),
	keyUpdatePeriod = 6 * 60 * 1000; 

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
		return crypto.createHmac('sha1', "xxx").update(url).digest('hex');
	}

	function Task(url, options) {
		options = options || config;
		this.uid = Task.generateId(url);
		this.url = url;
		this.viewportSize = options.viewportSize || config.viewportSize;
		this.zoomFactor = options.zoomFactor || config.zoomFactor;
		this.quality = options.quality || config.quality;
		this.clipRect = options.clipRect || config.clipRect;
		this.format = options.format || config.format;
		this.savePath = config.savePath;
		this.javascriptEnabled = config.javascriptEnabled;
		this.status = Task.PENDDING;
		this.src = "";
	}

	return Task;
})();