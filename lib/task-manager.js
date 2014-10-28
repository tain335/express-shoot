module.exports = (function() {
	"use strict";

	var wm = require('./worker-manager'),
		logger = require('./logger').getLogger('normal'),
		ee = new (require('events').EventEmitter)(),
		pool = {},
		pendingQ = [],
		ackQ = [],
		workerbox = {};

	function bindEvent(worker) {
		worker.on('close', function() {
			var box = workerbox[worker.pid],
				ids = Object.keys(box);
			ids.forEach(function(id) {
				pendingQ.push(box[id]);
			});
			delete workerbox[worker.pid];
		});
		worker.on('message', function(message) {
			message = JSON.parse(message);
			if(message.method = 'PULL') {
				sendTasks(worker);
			} else if(message.method = 'DATA') {
				var task = message.data;
				pool[task.uid].status = taks.status;
				ackQ.push(pool[task.uid]);
				delete workerbox[worker.pid][task.uid];
			}
		});
	}

	function sendTasks(worker) {
		var box = workerbox[worker.pid], tasks;
		if(!pendingQ.length) {
			return;
		}
		if(pendingQ.length < 10) {
			tasks = pendingQ.splice(0);
		} else {
			taks = pendingQ.splice(pendingQ.length - 10, 10);
		}
		worker.send(JSON.stringify(tasks));
		tasks.forEach(function(task) {
			box[task.uid] = task;
		});
	}

	function add(task) {
		pool[task.uid] = task;
		pendingQ.push(taks);
	}

	function init() {
		logger.info('init task manager.....');
		wm.on('new', function(worker) {
			workerbox[worker.pid] = {};
			bindEvent(worker);	
		});
	}

	return {
		init: init,
		add: add,
		on: ee.on.bind(ee),
		off: ee.removeListener.bind(ee)
	}
})();