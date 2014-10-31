module.exports = (function() {
	"use strict";

	var cluster = require('cluster'),
		http = require('http'),
		path = require('path'),
		log4js = require('log4js'),
		express = require('express'),
		logger = require('./logger').getLogger('normal'),
		config = require('../config').server,
		router = require('./router'),
		session = require('express-session'),
		cookieParser = require('cookie-parser'),
		bodyParser = require('body-parser'),
		methodOverride = require('method-override'),
		favicon = require('serve-favicon'),
		domain = require('domain'),
		shooter = require('./shooter'),
		env = process.env.NODE_ENV,
		app = null;

	function setup() {
		logger.info('init server....');
		app = express();
		app.enable('verbose errors');
		if(env == 'production') app.disable('verbose errors');
		app.use(log4js.connectLogger(logger, {level: 'debug', format: ':method :status :url'}));
		app.use(express.static(path.join(__dirname, '../public/static')));
		app.use(favicon(path.join(__dirname, '../public/static/images/favicon.ico')))
		app.use(cookieParser("EXPRESS SECRET"));
		app.use(session({
			name: 'express-shoot',
			resave: true,
			saveUninitialized: true,
			cookie: { maxAge: 20 * 60 * 60 },
			secret: "EXPRESS SECRET" 
		}));
		app.use(bodyParser.urlencoded({extended: false}));
		app.use(bodyParser.json());
		app.use(methodOverride('_method'));
		app.use(function(req, res, next) {
			var d = domain.create();
			d.add(req);
			d.add(res);

			d.on('error', function(err) {
				next(err);
			});
			
			d.run(function() {
				next();
			});
		});
		app.use(router);
		app.use(function(err, req, res, next) {
			logger.error('Express caught you');
			logger.error(err);
			res.status(500).send({code: 2, message: "Internal Error!", data: null});
			next();
		});
	}

	function start() {
		setup();
		shooter.init();
		http.createServer(app).listen(config.port || 3000, function() {
			logger.info('server has listened at port %d', config.prot || 3000);
		});
	}

	return {
		start: start
	}
})();