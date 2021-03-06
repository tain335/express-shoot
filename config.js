var path = require('path');

module.exports =
{
	"server": {
		"port": 3000,
		"imagePath": '/images/'
	},
	"redis": {
		"host": "127.0.0.1",
		"port": "6379",
		"auth": "",
		"options": {}
	},
	"logger": {
		"appenders": [
			{
				"type": "console",

			},
			{
			    "type": "dateFile",
			    "filename": path.join(__dirname, "/logs/"),
			    "pattern": "yyyy-MM-dd.log",
			    // "maxLogSize": 1,
			    // "backups": 3,
			    "alwaysIncludePattern": true,
			    "category": "normal",
		  	}
	  	],
	  	"replaceConsole": true,
	  	"levels": {
	        "[all]": "DEBUG",
	        "normal": "DEBUG"
	    }
	},
	"workerManager": {
		"workerNums": 2
	},
	"phantomjs": {
		"maxTasks": 50,
		"format": "png",
		"viewportSize": {
			"width": 1024,
			"height": 1024
		},
		"clipRect": {
			"top": 0,
			"left": 0
		},
		"quality": "100",
		"zoomFactor": 0,
		"javascriptEnabled": true,
		"savePath": path.join(__dirname , '/public/static/images/')
	}
}