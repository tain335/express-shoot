module.exports = (function() {
	"use strict";
	var uuid = require('uuid');

	Task.PENDDING = 1;
	Task.ERROR = 2;
	Task.FINISHED = 4;

	function Task(url, width, height, format) {
		this.uid = uuid.v2();
		this.url = url;
		this.viewport = {};
		this.format = format;
		this.viewport.width = width;
		this.viewport.height = height;
		this.status = Task.PENDDING;
	}

	return Task;
})();