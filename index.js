var cluster = require('cluster'),
	logger = require('./lib/logger').getLogger('normal'),
	server = require('./lib/server');

process.on('uncaughtException', function(err) {
	logger.error(err.message);
	logger.error(err.stack);
});

if(cluster.isMaster) {
	var worker = cluster.fork();
	logger.info('worker %s has started', worker.id);
	// cluster.on('disconnect', function(worker) {
	// 	logger.error('worker %s has disconnected. restarting....', worker.id);
	// 	cluster.fork();
	// 	logger.info('restart successfully.');
	// });
	cluster.on('exit', function(worker, code, signal) {
		logger.error('worker %s has exited (%s). restarting....', worker.id, code || signal);
		worker = cluster.fork();
		logger.info('worker %s restart successfully.', worker.id);
	});
} else {
	server.start();
}

