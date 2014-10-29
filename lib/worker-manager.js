module.exports = (function() {
	"use strict";

	var spawn = require('child_process').spawn,
		path = require('path'),
		emitter = new (require('events').EventEmitter)(),
		logger = require('./logger').getLogger('normal'),
		cpus = require('os').cpus().length,
		config = require('../config').workerManager,
		workers = {};

	function createWorkers() {
		logger.info('init worker manager....');
		var count = config.workerNums || cpus;
		while(count--) {
			_createWorker();		
		}
	}

	function _createWorker() {
		var worker = spawn('phantomjs', [path.join(__dirname, 'worker.js'), '--disk-cache=true']);
		worker.on('close', function(code, signal) {
			delete workers[worker.pid];
			emitter.emit('kill', worker);
			logger.warn('phantomjs worker %s is closed', worker.pid);
			if(!signal) {
				logger.info('phantomjs worker restart....');
				createWorker();
			}
		});
		worker.stderr.on('data', function() {
			logger.error('phantomjs worker %s occur errors', worker.pid);
		});
		workers[worker.pid] = worker;
		emitter.emit('worker', worker);
		logger.info('create phantomjs worker %s', worker.pid);
	}

	function killWorkers() {
		var ids = Object.keys(workers);
		for(var i = 0; i < ids.length; i++) {
			var id = ids[i];
			workers[id].kill('SIGINT'); // windows donot support SIGHUP but SIGINT
			delete workers[id];
		}
	}

	return {
		createWorkers: createWorkers,
		killWorkers: killWorkers,
		on: emitter.on.bind(emitter),
		off: emitter.removeListener.bind(emitter)
	}
})()