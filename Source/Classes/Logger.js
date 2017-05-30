exports = module.exports = (function Logger() {
	const path			= require('path');
	const electron		= require('electron');
	const App			= electron.app;
	const _logger		= require('electron-log');
	
	this.init = function init() {
		var directory = path.dirname(App.getPath('exe'));
		
		if(new RegExp('node_modules', 'gi').test(directory)) {
			directory = App.getAppPath();
		}
		
		_logger.transports.file.file	= directory + '/Output.log';
		_logger.transports.file.level	= 'info';
		_logger.transports.console		= function Console(message) {
			console.log('[' + message.date.toLocaleTimeString() + '] [' + message.level + '] ' + message.data);
		};
	};
	
	this.info = function info() {
		_logger.info(arguments);
	};
	
	this.error = function error() {
		_logger.error(arguments);
	};
	
	this.warn = function warn() {
		_logger.warn(arguments);
	};
	
	this.verbose = function verbose() {
		_logger.verbose(arguments);
	};
	
	this.debug = function debug() {
		_logger.debug(arguments);
	};
	
	this.silly = function silly() {
		_logger.silly(arguments);
	};
	
	this.init();
	
	return this;
});