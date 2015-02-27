var ShooterCli;
(function(global) {
	"use strict";

	ShooterCli = Client;
	
	var PENDDING = 1,
		ERROR = 2,
		FINISHED = 4;

	var mixin = function(obj, src) {
		for(var key in src) {
			obj[key] = src[key];
		}
		return obj;
	}

	function MaxRetryError(count) {
		this.toString = function() {
			return 'Max Retry Count:' + count;
		}
	}

	function Client(path) {
		this.path = path;
	}

	Client.prototype.shoot = function(url, options, done, fail) {
		var self = this, data, handle;
		if(!url || typeof url !== 'string') {
			return;
		}
		options = options || {};
		options = mixin({checkRetry: -1}, options);
		options.url = url;
		handle = function(result) {
			if(result.code === 0) {
				if(result.data.status !== PENDDING) {
					done && done(result.data);
				} else {
					var checkRetry = options.checkRetry;
					if(checkRetry) {
						var originRetryCount = checkRetry;
						var checkHandle = function() {
							self.check(result.data.uid, handle, function(err) {
								if(checkRetry < 0) {
									checkHandle();
								} else if(checkRetry === 0) {
									fail(new MaxRetryError(originRetryCount));
								} else {
									while(checkRetry--) {
										checkHandle();
									}
								}
							});
						}
						checkHandle();
					}
				}
			} else {
				fail(result.data);
			}
		}
		$.ajax({
			type: "post",
			url: this.path,
			contentType: "application/json",
			data: JSON.stringify(options)
		}).done(function(result) {
			handle(result);
		}).fail(fail);
	};

	Client.prototype.check = function(uid, done, fail) {
		$.get(this.path + '/' + uid).done(done).fail(fail);
	}

	Client.prototype.delete = function(uid, callback) {

	}
})(this);
