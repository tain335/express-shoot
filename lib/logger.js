var log4js = require('log4js'),
	config = require('../config');

	log4js.configure(config.logger);

module.exports = {
	getLogger: log4js.getLogger
}