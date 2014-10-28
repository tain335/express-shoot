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
		page.open(task.url, function(status) {
			if(status === 'fail') {
				sum--
				page.close()
			} else {
				setTimeout(function() {
					page.render(path, {format: task.format, quality: '100'});
					sum--
					page.close()
				}, 2000);
			}
		});
	}

	function connect() {
		socket = new WebSocket('ws://localhost:3000/');
		socket.onmessage = function(msg) {
			var tasks = msg.data;
			if(data.method === 'PUSH') {
				tasks.forEach(function(task) {
					sum++;
					shoot(task);
				});
			} else if(data.method === 'CLOSE') {
				phantom.exit(0);
			}
		};
		socket.onclose = function() {
			phantom.exit(0);
		}
	};

	function loop() {
		setInterval(function() {
			if(socket && socket.readyState === 1 && sum < 50) {
				socket.send({method: 'PULL'});
			}
		}, 0);
	}

	connect();
	loop();
})();