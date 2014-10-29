module.exports = (function() {
	"use strict";

	var router = require('express').Router(),
		shooter = require('./shooter'),
		logger = require('./logger').getLogger('normal');

		router.param('task_id', function(req, res, next, id) {
			req.task = shooter.taskman.fetch(id);
			next();
		});

		router.route('/shoots/:task_id')
			.post(function(req, res, next) {
				if(req.params.task_id) {
					res.end({code: 1, message: 'Error method!Please use GET method.'});
				}
				next();
			}).get(function(req, res, next) {
				next();
			}).delete(function(req, res, next) {
				next();
			});

	return router;
})();