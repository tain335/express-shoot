module.exports = (function() {
	"use strict";

	var log4js = require('log4js'),
	config = require('../config').logger;

	log4js.configure(config);

	return {
		getLogger: log4js.getLogger
	}
})()