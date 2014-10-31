module.exports = (function() {
	"use strict";

	var router = require('express').Router(),
		shooter = require('./shooter'),
		taskman = shooter.taskman,
		logger = require('./logger').getLogger('normal');

		router.param('task_id', function(req, res, next, id) {
			req.task = taskman.fetch(id);
			next();
		});

		router.route('/').get(function(req, res, next) {
			res.redirect('html/index.html');
			next();
		});

		router.route('/shoots').post(function(req, res, next) {
			var handle, send, timer, task;
			
			send = function(data) {
				try{
					res.writeHead(200, {"Content-Type": "application/json"});  
				    res.write(JSON.stringify(data));
				    res.end();
				    next();
				} catch(err) {
					next(err);
				}
			};

			handle = function(task) {
				clearTimeout(timer);
				send({code: 0, message: "", data: task.result()});
			};
			
			if(req.body.url) {

				task = shooter.shoot(req.body.url, handle, req.body);

				timer = setTimeout(function() {
					taskman.unlisten(task, handle);
					send({code: 0, message: "", data: task.result()});
				}, 30000);
			} else {
				send({code: 1, message: "URL required", data: null});
			}
		});

		router.route('/shoots/:task_id')
			.get(function(req, res, next) {
				var timer, send, handle;	
				send = function(data) {
					try{
						res.writeHead(200, {"Content-Type": "application/json"});  
					    res.write(JSON.stringify(data));
					    res.end();
					    next();
					} catch(err) {
						next(err);
					}
				};
				if(req.task) {
					timer = setTimeout(function() {
						taskman.unlisten(req.task);
						send({code: 0, message: "", data: req.task.result()});
					}, 3000);
					taskman.listen(req.task, function(task) {
						clearTimeout(timer);
						send({code: 0, message: "", data: task.result()});
					});
				} else {
					send({code: 1, message: "no task", data: null});
				}
			}).delete(function(req, res, next) {
				res.writeHead(405, {"Content-Type": "application/json"});
				res.end({code: 1, message: "no task", data: null});
				next();
			});

	return router;
})();