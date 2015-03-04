module.exports = (function() {
	"use strict";

	var router = require('express').Router(),
		shooter = require('./shooter'),
		Task = require('./task'),
		taskman = shooter.taskman,
		logger = require('./logger').getLogger('normal');

	var send = function(code, data, res, next) {
			try{
				res.writeHead(code, {"Content-Type": "application/json"});  
			    res.write(JSON.stringify(data));
			    res.end();
			    next();
			} catch(err) {
				next(err);
			}
		};

		router.param('task_id', function(req, res, next, id) {
			taskman.fetch(id, function(err, task) {
				if(err) { 
					next(err);
				} else {
					req.task = task;
					next();
				}
			});
		});

		router.route('/').get(function(req, res, next) {
			res.redirect('html/index.html');
			next();
		});

		router.route('/shoots').post(function(req, res, next) {
			var handle = function(err, task) {
				if(err) {
					logger.error(err);
				} else {
					send(200, {code: 0, message: "", data: Task.getResult(task)}, res, next);
				}
			};
			var options = req.body;
			if(options.url) {
				shooter.shoot(options.url, options, handle);
			} else {
				send(200, {code: 1, message: "URL required", data: null}, res, next);
			}
		});

		router.route('/shoots/:task_id')
			.get(function(req, res, next) {
				var task = req.task;
				if(task) {
					if(task.status === Task.PENDDING) {
						var handle = function(task) {
							taskman.unlisten(task, handle);
							send(200, {code: 0, message: "", data: Task.getResult(task)}, res, next);
						};

						taskman.listen(task, handle);				
						req.on('timeout', function() {
							taskman.unlisten(task, handle);
						});
					} else {
						console.log(task.status);
						send(200, {code: 0, message: "", data: Task.getResult(task)}, res, next);
					}
				} else {
					send(200, {code: 1, message: "no task", data: null}, res, next);
				}
			})
			.delete(function(req, res, next) {			
				send(405, {code: 1, message: "", data: null}, res, next);
			});

	return router;
})();