(function() {
	"use strict";

	var webpage = require('webpage'),
		config = require('./config').phantomjs;

	function shoot(task) {
		var page = webpage.create(),
			page.viewportSize = task.viewportSize,
			clipRect = task.clipRect || config.clipRect,
			zoomFactor = task.zoomFactor || config.zoomFactor,
			format = task.format || config.format,
			page.settings = {
				javascriptEnabled: task.javascriptEnabled || config.javascriptEnabled
				loadImages: true
				userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.31 (KHTML, like Gecko) PhantomJS/1.9.0'
			};
		page.open(task.url, function(status) {
			if(status === 'fail') {

			} else {
				page.render(config.savePath + task.uid + '.' + format, {format: format, quality: '100'});
			}
			page.close()
		});
	}

	function checker() {
		
	}
})();