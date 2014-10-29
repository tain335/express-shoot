module.exports = (function() {
	"use strict";
	var uuid = require('uuid'),
		config = require('../config').phantomjs;

	Task.PENDDING = 1;
	Task.ERROR = 2;
	Task.FINISHED = 4;

	function Task(url, options) {
		options = options || config;
		this.uid = uuid.v4();
		this.url = url;
		this.viewportSize = {};
		this.format = options.format || config.format;
		this.viewportSize.width = options.width || config.viewportSize.width;
		this.viewportSize.height = options.height || config.viewportSize.height;
		this.savePath = config.savePath;
		this.javascriptEnabled = config.javascriptEnabled;
		this.status = Task.PENDDING;

		this.result = function() {
			return {
				uid: this.uid,
				path: this
			}
		}
	}

	return Task;
})();