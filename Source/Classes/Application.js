module.exports = (function Application() {
	const _path		= require('path');
	const IPC		= require('electron').ipcRenderer;
	const Monaco	= require('../Classes/Monaco.js');
	
	var _loaded = {
		editor: false,
		css:	{
			count: 	0,
			loaded:	0
		},
		js:	{
			count: 	0,
			loaded:	0
		}
	};

	this.init = function init() {
		new Monaco().init(function onLoad() {
			_loaded.editor	= true;
		});
		
		var _watcher = setInterval(function onWatching() {
			if(_loaded.editor && _loaded.css.loaded >= _loaded.css.count && _loaded.js.loaded >= _loaded.js.count) {
				console.log('INITED');
				IPC.send('window:init', true);
				clearInterval(_watcher);
				return;
			}
		}.bind(this), 100);
	};
	
	this.importCSS = function importCSS() {
		_loaded.css.count = arguments.length;
		
		[].forEach.call(arguments, function(file) {
			var link	= document.createElement('link');
			link.type	= 'text/css';
			link.rel	= 'stylesheet';
			link.href	= file;
			link.onload	= function onLoad() {
				console.log(file, 'loaded');
				++_loaded.css.loaded;
			};
			document.getElementsByTagName('head')[0].appendChild(link);
		});
	};
	
	this.importJS = function importJS() {
		_loaded.js.count = arguments.length;
		
		[].forEach.call(arguments, function(file) {
			var link	= document.createElement('script');
			link.type	= 'text/javascript';
			link.src	= file;
			link.onload	= function onLoad() {
				console.log(file, 'loaded');
				++_loaded.js.loaded;
			};
			document.getElementsByTagName('body')[0].appendChild(link);
		});
	};
		
	this.init();
});