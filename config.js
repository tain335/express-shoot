module.exports =
{
	"server": {
		"port": 3000
	},
	"logger": {
		"appenders": [
			{
				"type": "console",

			},
			{
			    "type": "dateFile",
			    "filename": __dirname + "/logs/",
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
	"phantomjs" {
		"maxTasks": 50,
		"clipRect": 0,
		"zoomFactor": 0,
		"javascriptEnabled": true,
		"savePath": __dirname + '/public/static/images/'
	}
}