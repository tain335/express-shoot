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
			var handle, timer;

			handle = function(task) {
				clearTimeout(timer);
				taskman.unlisten(task, handle);
				send(200, {code: 0, message: "", data: Task.getResult(task)}, res, next);
			};
			
			if(req.body.url) {
				var task = shooter.shoot(req.body.url, handle, req.body);
				timer = setTimeout(function() {
					taskman.unlisten(task, handle);
					send(200, {code: 0, message: "", data: Task.getResult(task)}, res, next);
				}, 30000);
			} else {
				send(200, {code: 1, message: "URL required", data: null}, res, next);
			}
		});

		router.route('/shoots/:task_id')
			.get(function(req, res, next) {
				var timer, handle;	
				if(req.task) {
					console.log(req.task.status);
					if(req.task.status === Task.PENDDING) {
						timer = setTimeout(function() {
							taskman.unlisten(req.task);
							send(200, {code: 0, message: "", data: Task.getResult(req.task)}, res, next);
						}, 3000);
						taskman.listen(req.task, function(task) {
							clearTimeout(timer);
							send(200, {code: 0, message: "", data: Task.getResult(task)}, res, next);
						});
					} else {
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