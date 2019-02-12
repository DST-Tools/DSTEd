exports = module.exports = (function Logger() {
	const path			= require('path');
	const util			= require('util');
	const electron		= require('electron');
	const App			= electron.app;
	const _logger		= require('electron-log');
	
	this.init = function init() {
		var directory = '';
		
		try {
			path = path.dirname(App.getPath('exe'));
		} catch(e) {
			/* Do Nothing */
		}
		
		if(new RegExp('node_modules', 'gi').test(directory)) {
			directory = App.getAppPath();
		}
		
		try {
			_logger.transports.file.file	= directory + '/Output.log';
			_logger.transports.file.level	= 'debug';
			_logger.transports.console		= function Console(event) {
				var message = '';
				
				[].forEach.call(event.data, function(a) {
					[].forEach.call(a, function(b) {
						message += b;
						//message += ' ';
					});
				});
				
				if(event.level == 'debug') {
					message += '\n';
					message += this.getStrackTrace();
				}
				
				console.log('[' + event.date.toLocaleTimeString() + '] [' + event.level + '] ' + message);
			}.bind(this);
			
			_logger.transports.file.format		= function Console(event) {
				var message = '';
				
				[].forEach.call(event.data, function(a) {
					[].forEach.call(a, function(b) {
						message += b;
						message += ' ';
					});
				});
				
				if(event.level == 'debug') {
					message += '\n';
					message += this.getStrackTrace();
				}
				
				return ('[' + event.date.toLocaleTimeString() + '] [' + event.level + '] ' + message);
			}.bind(this);
		} catch(e) {
			/* Do Nothing */
		}
	};
	
	this.getStrackTrace = function getStrackTrace() {
		try {
			null.toString();
		} catch(e) {
			return this.prettifyStackTrace(e.stack);
		}
		
		return '';
	};
	
	this.prettifyStackTrace = function prettifyStackTrace(stacktrace) {
		var lines	= stacktrace.replace(/\t/g, '     ').split('\n');
		var start	= 4;
		var output	= '';
		
		lines.forEach(function(line, index) {
			if(index <= start) {
				return;
			}
			
			output += line;
			output += '\n';
		});
		
		return output;
	};
	
	this.info = function info() {
		_logger.info.apply(this, arguments);
	};
	
	this.error = function error() {
		_logger.error.apply(this, arguments);
	};
	
	this.warn = function warn() {
		_logger.warn.apply(this, arguments);
	};
	
	this.verbose = function verbose() {
		_logger.verbose.apply(this, arguments);
	};
	
	this.debug = function debug() {
		_logger.debug.apply(this, arguments);
	};
	
	this.silly = function silly() {
		_logger.silly.apply(this, arguments);
	};
	
	this.init();
	
	return this;
});