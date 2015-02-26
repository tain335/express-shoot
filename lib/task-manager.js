module.exports = (function() {
	"use strict";

	var uuid = require('uuid'),
		wm = require('./worker-manager'),
		redis = require('redis'),
		crc = require('crc'),
		logger = require('./logger').getLogger('normal'),
		emitter = new (require('events').EventEmitter)(),
		config = require('../config'),
		imagePath = config.server.imagePath,
		QNAME = 'PENDQ',
		boxes = {},
		idleConns = [],
		client = null;
		
	function bindEvent(conn) {

		conn.on('close', function() {
			var box = boxes[conn.id],
				ids = Object.keys(box),
				unFinishTasks = [];
			removeIdleConnection(conn);
			ids.forEach(function(id) {
				unFinishTasks.push(box[id]);
			});
			unFinishTasks.unshift(QNAME);
			client.lpush.apply(client, unFinishTasks);
			delete boxes[conn.id];
		});

		conn.on('message', function(message) {
			message = JSON.parse(message);
			switch (message.method) {
				case 'IDLE':
					idleConns.push(conn);
					break;
				case 'BUSY':
					removeIdleConnection(conn);
					break;
				case 'DATA':
					var result = message.data;
					client.get(result.uid, function(err, taskstr) {
						if(err) {
							logger.warn('cannot find task: %s from cache!', result.uid);
							return;
						}
						var task = JSON.parse(taskstr);
						task.status = result.status;
						task.src = imagePath + task.uid + '.' + task.format;
						emitter.emit('R-' + task.uid, task);
						delete boxes[conn.__id__][task.uid];
						client.set(task.uid, JSON.stringify(task));
					});
					break;
				case 'LOG':
					logger.debug('connection %s log: %s', conn.id, message.data);
					break;
			}
		});
	}

	function removeIdleConnection(conn) {
		idleConns.every(function(c, i) {
			if(conn === c) {
				idleConns.splice(i, 1);
				return false;
			}
		});
	}

	function sendTasks(conn, tasks) {
		var box = boxes[conn.__id__];
		conn.send(JSON.stringify({method: 'PUSH', data: tasks}));
		tasks.forEach(function(task) {
			box[task.uid] = task;
		});
	}

	function startTaskDispatcher() {
		function dispatcher() {
			if(idleConns.length) {
				var conn = idleConns[crc.crc32(task.uid) % idleConns.length];
				client.lpop(QNAME, function(err, result) {
				 	if(err) {
						logger.error('cannot send task for reason: %s', err);
						return;
					}
					if(result) {		
						sendTasks(conn, [JSON.stringify(result)]);
					}
				});
			}
			progress.nextTick(dispatcher);	
		}
		progress.nextTick(dispatcher);
	}

	function add(task, cb) {
		var taskstr = JSON.stringify(task);
		client.set(task.uid, taskstr, function(err) {
			if(err) {
				cb(err);
			} else {
				if(idleConns.length) {
					var conn = idleConns[crc.crc32(task.uid) % idleConns.length];
					sendTasks(conn, [task]);
					cb(null);
				} else {
					client.rpush(QNAME, taskstr, function(err) {
						err ? cb(err) : cb(null);
					});
				}
			}
		});
	}

	function fetch(uid, cb) {
		client.get(uid, cb);
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
		logger.debug('init task manager.....');

		client = redis.createClient(config.redis.port, config.redis.host, config.redis.options || {});

		client.on('error', function(err) {
			logger.error('Redis client happen a error: %s', err);
		});

		client.on('ready', function() {
			logger.debug('redis client connect server: %s:%s successfully!', config.redis.host, config.redis.port);
		});

		server.on('connection', function(conn) {
			conn.__id__ = uuid.v4();
			emitter.emit('conn', conn);
			idleConns.push(conn);
			logger.debug('new connection: %s', conn.__id__);
			boxes[conn.__id__] = {};
			bindEvent(conn);
			conn.on('close', function(){
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