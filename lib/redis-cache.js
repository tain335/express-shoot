module.exports = (function() {
	"use strict";

	var pool = {},
		redis = require('redis'),
		logger = require('./logger').getLogger('normal'),
		conf = require('../config').redis,
		client = null;

	function init(cb) {
		client = redis.createClient(conf.port, conf.host, conf.options || {});
		client.on('error', function(err) {
			cb && cb(err);
			logger.error('Redis client happen a error: %s', err);
		});
		client.on('ready', function() {
			cb && cb(null);
			cb = undefined;
			logger.debug('redis client connect server: %s:%s successfully!', conf.host, conf.port);
		});
	}	
	//value must be obj
	function set(key, value, cb) {
		client.set(key, JSON.stringify(value), cb);
	}

	function get(key, cb) {
		client.get(key, function(err, reply) {
			cb(err, JSON.parse(reply.toString()));
		});
	}

	function del(key) {
		client.del(key);
	}

	return {
		init: init,
		set: set,
		get: get,
		del: del
	}

})();