(function() {
	"use strict";

	var webpage = require('webpage'),
		socket = null,
		sum = 0,
		MAX = 20;

	function shoot(task) {
		var page = webpage.create();
		var	path = task.savePath + task.uid + '.' + task.format;	
		page.settings = {
			javascriptEnabled: task.javascriptEnabled,
			loadImages: true,
			userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.31 (KHTML, like Gecko) PhantomJS/2.0.0',
			resourceTimeout: 2000
		};
		page.clipRect = task.clipRect;
		page.viewportSize = task.viewportSize;
		page.zoomFactor = task.zoomFactor;
		var d = new Date().getTime();
		log('shoot task: ' + task.uid);
		page.open(task.url, function(status) {
			log('shoot task: ' + task.uid + '<>' + status);
			if(status === 'fail') {
				sum--;
				send({method: 'DATA', data: {uid: task.uid, status: 2}});
				page.close();
				log('shoot url fail: ' + task.url);
			} else {
				setTimeout(function() {
					page.render(path, {format: task.format, quality: task.quality});
					log('time: ' + (new Date().getTime() - d));
					log('shoot task success: ' + task.uid);
					send({method: 'DATA', data: {uid: task.uid, status: 4}});
					if(--sum === MAX) {
						send({method: 'IDLE'});
					}
					page.close();
				}, 200);
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
				var tasks = msg.data;
				tasks.forEach(function(task) {
					++sum;
					shoot(task);
				});
				if(sum > MAX) {
					send({method: 'BUSY'});
				}
			} else if(msg.method === 'CLOSE') {
				phantom.exit(0);
			}
		};
		socket.onclose = function() {
			//phantom.exit(0);
			connect();
		};
	};

	function log(str) {
		send({method: 'LOG', data: str});
	}

	function send(obj) {
		socket.send(JSON.stringify(obj));
	}

	connect();
})();