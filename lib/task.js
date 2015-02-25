module.exports = (function() {
	"use strict";
	var uuid = require('uuid'),
		config = require('../config').phantomjs;

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

	function Task(url, options) {
		options = options || config;
		this.uid = uuid.v4();
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