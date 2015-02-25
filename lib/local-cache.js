module.exports = (function() {
	"use strict";

	var pool = {};

	function init(cb) {
		cb && cb(null);
	}

	function set(key, value, cb) {
		pool[key] = value;
		cb && cb(null);
	}

	function get(key, value, cb) {
		cb && cb(null, pool[key]);
	}

	function del(key) {
		delete pool[key];
	}

	return {
		init: init,
		set: set,
		get: get,
		del: del
	}

})();