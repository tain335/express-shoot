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
	"workerMan": {
		"sum": 2,
		"maxJob": 100,
		"clipRect": 0,
		"zoomFactor": 0,
		"javascriptEnabled": false 
	}
}