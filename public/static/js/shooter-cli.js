var ShooterCli;
(function(global) {
	"use strict";

	ShooterCli = Client;

	var PENDDING = 1,
		ERROR = 2,
		FINISHED = 4;

	function Client(path) {
		this.path = path;
	}

	Client.prototype.shoot = function(url, callback, options) {
		var self = this, data, handle;
		if(!url || typeof url !=== 'string') {
			return;
		}
		data = options || {};
		data.url = url;
		handle = function(result) {
			if(result.code === 0) {
				if(result.data.status !== PENDDING) {
					callback(result.data);
				} else {
					check(result.data.uid, handle);
				}
			}
		}
		$.post(path, data).done(handle);
	};

	Client.prototype.check = function(uid, callback) {
		$.get(path + '/' + uid).done(callback);
	}

	Client.prototype.delete = function(uid, callback) {

	}
})(this);
