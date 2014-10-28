module.exports = (function() {
	"use strict";
	var uuid = require('uuid'),
		config = require('../config').phantomjs;

	Task.PENDDING = 1;
	Task.ERROR = 2;
	Task.FINISHED = 4;

	function Task(url, width, height, format) {
		this.uid = uuid.v2();
		this.url = url;
		this.viewportSize = {};
		this.format = format;
		this.viewportSize.width = width;
		this.viewportSize.height = height;
		this.savePath = config.savePath;
		this.javascriptEnabled = config.javascriptEnabled;
		this.status = Task.PENDDING;
	}

	return Task;
})();