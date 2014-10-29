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

		router.route('/shoots').post(function(req, res, next) {
			var handle, send, timer, task;
			send = function(data) {
				res.writeHead(200, {"Content-Type": "application/json"});  
			    res.write(JSON.stringify(data));
			    res.end();
				next();
			};

			handle = function(task) {
				send({code: 0, message: "", data: {uid: task.uid, status: task.status}});
				clearTimeout(timer);
			};

			task = shooter.shoot(req.body.url, handle);

			var timer = setTimeout(function() {
				send({code: 0, message: "", data: {uid: task.uid, status: task.status}});
				taskman.unlisten(task, handle);
			}, 30000)

		});

		router.route('/shoots/:task_id')
			.get(function(req, res, next) {
				next();
			}).delete(function(req, res, next) {
				next();
			});

	return router;
})();