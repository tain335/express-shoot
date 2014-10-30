module.exports = (function() {
	"use strict";

	var wm = require('./worker-manager'),
		logger = require('./logger').getLogger('normal'),
		emitter = new (require('events').EventEmitter)(),
		config = require('../config').server,
		pool = {},
		pendingQ = [],
		ackQ = [],
		boxes = {};

	function bindEvent(conn) {
		conn.addListener('close', function() {
			var box = boxes[conn.id],
				ids = Object.keys(box);
			ids.forEach(function(id) {
				pendingQ.push(box[id]);
			});
			delete boxes[conn.id];
		});
		conn.addListener('message', function(message) {
			message = JSON.parse(message);
			switch (message.method) {
				case 'PULL':
					sendTasks(conn);
					break;
				case 'DATA':
					var result = message.data, task = pool[result.uid];
					if(task) {
						task.status = result.status;
						task.src = config.imagePath + task.uid + '.' + task.format;
						ackQ.push(pool[task.uid]);
						delete boxes[conn.id][task.uid];
						emitter.emit('R-' + task.uid, task);
					}
					break;
				case 'LOG':
					logger.info('connection %s log: %s', conn.id, message.data);
					break;
			}
		});
	}

	function sendTasks(conn) {
		var box = boxes[conn.id], tasks;
		if(!pendingQ.length) {
			return;
		}
		if(pendingQ.length < 10) {
			tasks = pendingQ.splice(0);
		} else {
			taks = pendingQ.splice(pendingQ.length - 10, 10);
		}
		conn.send(JSON.stringify({method: 'PUSH', data: tasks}));
		tasks.forEach(function(task) {
			box[task.uid] = task;
		});
	}

	function add(task) {
		pool[task.uid] = task;
		pendingQ.push(task);
	}

	function fetch(uid) {
		return pool[uid];
	}

	function listen(task, handle) {
		emitter.on('R-' + task.uid, handle);
	}

	function unlisten(task, handle) {
		if(handle) {
			emitter.removeListener('R-' + task.uid, handle);
		} else {
			emitter.removeAllListeners('R-' + task.uid);
		}
	}

	function init(server) {
		logger.info('init task manager.....');
		server.addListener('connection', function(conn) {
			emitter.emit('conn', conn)
			logger.info('new connection: %s', conn.id);
			boxes[conn.id] = {};
			bindEvent(conn);
			conn.addListener('close', function(){
				emitter.emit('close', conn);
				logger.error('close connection: %s', conn.id);
			});
		});
	}

	return {
		init: init,
		add: add,
		fetch: fetch,
		listen: listen,
		unlisten: unlisten,
		on: emitter.on.bind(emitter),
		off: emitter.removeListener.bind(emitter)
	}
})();