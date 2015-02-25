module.exports = (function() {
 	"use strict";

 	var ws = require('node-websocket-server'),
 		wm = require('./worker-manager'),
		tm = require('./task-manager'),
		logger = require('./logger').getLogger('normal'),
		Task = require('./task');

	function init() {
		var wserver = ws.createServer();
		tm.init(wserver);
		wserver.listen(3001, function() {
			logger.debug('websocket server has listened at port %d', 3001);
		});
		wm.createWorkers();
	};

	function shoot(url, handle, options) {
		var task = new Task(url, options);
		tm.add(task, function(err) {
			if(err) {
				handle(err);
			} else {
				tm.listen(task, handle);
			}
		});
		return task;
	}
	
	return {
		init: init,
		shoot: shoot,
		workerman: wm,
		taskman: tm
	}

})()
