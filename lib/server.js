var koa = require('koa'),
	logger = require('./logger').getLogger('normal'),
	config = require('../config');

function start() {
	logger.debug('Server prepare to start....');
}

function stop() {
	
}

module.exports = {
	start: start,
	stop: stop
}