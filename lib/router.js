module.exports = (function() {
	"use strict";

	var router = require('express').Router(),
		shooter = require('./shooter'),
		taskman = shooter.taskman,
		logger = require('./logger').getLogger('normal'),
		domain = require('domain');

		router.param('task_id', function(req, res, next, id) {
			req.task = taskman.fetch(id);
			next();
		});

		router.route('/').get(function(req, res, next) {
			res.redirect('html/index.html');
			next();
		});

		router.route('/shoots').post(function(req, res, next) {
			var handle, send, timer, task, d;

			d = domain.create();
			d.add(req);
			d.add(res);

			d.on('error', function(err) {
				logger.error(err, 'I caught you');
				try {
					res.status(500).send({code: 2, message: "Internal Error!", data: null});
					next();
				} catch(err) {
					logger.error(err, "Cannot Send 500");
				}
			});

			d.run(function() {
				send = function(data) {
					res.writeHead(200, {"Content-Type": "application/json"});  
				    res.write(JSON.stringify(data));
				    res.end();
				};

				handle = function(task) {
					send({code: 0, message: "", data: task.result()});
					clearTimeout(timer);
					next();
				};
				
				if(req.body.url) {

					task = shooter.shoot(req.body.url, handle, req.body);

					timer = setTimeout(function() {
						send({code: 0, message: "", data: task.result()});
						taskman.unlisten(task, handle);
						next();
					}, 30000);
				} else {
					send({code: 1, message: "URL required", data: null});
					next();
				}
			});
		});

		router.route('/shoots/:task_id')
			.get(function(req, res, next) {
				var timer, send, handle, d;

				d = domain.create();
				d.add(req);
				d.add(res);

				d.on('error', function(err) {
					logger.error(err);
					try {
						res.status(500).send({code: 2, message: "Internal Error!", data: null});
						next();
					} catch(err) {
						logger.error(err, "Cannot Send 500");
					}
				});

				d.run(function() {
					send = function(data) {
						res.writeHead(200, {"Content-Type": "application/json"});  
					    res.write(JSON.stringify(data));
					    res.end();
					}
					if(req.task) {
						timer = setTimeout(function() {
							send({code: 0, message: "", data: req.task.result()});
							taskman.unlisten(req.task);
							next();
						}, 3000);
						taskman.listen(req.task, function(task) {
							clearTimeout(timer);
							send({code: 0, message: "", data: task.result()});
							next();
						});
					} else {
						send({code: 1, message: "no task", data: null});
						next();
					}
				});
			}).delete(function(req, res, next) {
				res.writeHead(405, {"Content-Type": "application/json"});
				res.end({code: 1, message: "no task", data: null});
				next();
			});

	return router;
})();