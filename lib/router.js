module.exports = (function() {
	"use strict";

	var express = require('express'),
		router = express.Router(),
		logger = require('./logger').getLogger('normal');

		router.param('task_id', function(req, res, next, id) {
			next();
		});

		router.route('/snapshoots/:task_id')
			.post(function(req, res, next) {
				next();
			}).get(function(req, res, next) {
				next();
			}).delete(function(req, res, next) {
				next();
			});

	return router;
})();