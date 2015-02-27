module.exports = (function() {
 	"use strict";

 	var WebsocketServer = require('ws').Server,
 		wm = require('./worker-manager'),
		tm = require('./task-manager'),
		logger = require('./logger').getLogger('normal'),
		Task = require('./task');

	function init() {
		var wserver = new WebsocketServer({port: 3001});
		tm.init(wserver);
		wm.createWorkers();
	};

	function shoot(url, options, callback) {
		var task = new Task(url, options);
		tm.add(task, function(err) {
			if(err) {
				callback(err);
			} else {
				//tm.listen(task, callback);
				callback(null, task);
			}
		});
	}
	
	return {
		init: init,
		shoot: shoot,
		workerman: wm,
		taskman: tm
	}

})()
