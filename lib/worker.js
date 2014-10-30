(function() {
	"use strict";

	var webpage = require('webpage'),
		socket = null,
		sum = 0;

	function shoot(task) {
		var page = webpage.create();
		var	path = task.savePath + task.uid + '.' + task.format;	
		page.settings = {
			javascriptEnabled: task.javascriptEnabled,
			loadImages: true,
			userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.31 (KHTML, like Gecko) PhantomJS/1.9.0'
		};
		page.clipRect = task.clipRect;
		page.viewportSize = task.viewportSize;
		page.zoomFactor = task.zoomFactor;
		log('shoot url: ' + task.url);
		page.open(task.url, function(status) {
			if(status === 'fail') {
				sum--;
				send({method: 'DATA', data: {uid: task.uid, status: 2}});
				log('shoot url fail: ' + task.url);
				page.close();
			} else {
				log('shoot url success: ' + task.url);
				setTimeout(function() {
					page.render(path, {format: task.format, quality: task.quality});
					sum--;
					send({method: 'DATA', data: {uid: task.uid, status: 4}});
					page.close();
				}, 2000);
			}
		});
	}

	function connect() {
		socket = new WebSocket('ws://localhost:3001/');
		socket.onopen = function() {
		};
		socket.onmessage = function(msg) {
			msg = JSON.parse(msg.data);
			if(msg.method === 'PUSH') {
				msg.data.forEach(function(task) {
					sum++;
					shoot(task);
				});
			} else if(msg.method === 'CLOSE') {
				phantom.exit(0);
			}
		};
		socket.onclose = function() {
			//phantom.exit(0);
			connect();
		};
	};

	function loop() {
		var handle = function() {
			if(socket && socket.readyState === 1 && sum < 50) {
				send({method: 'PULL'})
			}
			setTimeout(handle, 0);
		};
		setTimeout(handle, 0);
	}

	function log(str) {
		send({method: 'LOG', data: str});
	}

	function send(obj) {
		socket.send(JSON.stringify(obj));
	}

	connect();
	loop();
})();