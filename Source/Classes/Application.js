module.exports = (function Application(no_editor) {
	const _path			= require('path');
	const IPC			= require('electron').ipcRenderer;
	const Monaco		= require('../Classes/Monaco.js');
	const ContextMenu	= require('../Classes/ContextMenu.js')();
	
	this.Utils = {
		ByteSize:	function ByteSize(bytes) {
			var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
			
			if(bytes == 0) {
				return '0 Byte';
			}
			
			var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
			return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
		},
		zeroize:	function zeroize(number) {
			if(number < 9) {
				return '0' + number;
			}
			
			return number;
		},
		FormatDate:	function FormatDate(date) {
			return this.zeroize(date.getDate()) + '.' + this.zeroize(date.getMonth()) + '.' + date.getFullYear();
		},
		TimeAgo:	function TimeAgo(ts) {
			now = new Date();
			var delta = now.getTime() - ts.getTime();

			delta = delta / 1000;

			var ps, pm, ph, pd, min, hou, sec, days;

			if(delta <= 59){
				ps = (delta > 1) ? "s": "";
				return delta + " second" + ps
			}

			if(delta >= 60 && delta <= 3599){
				min = Math.floor(delta / 60);
				sec = delta - (min * 60);
				pm = (min > 1) ? "s": "";
				ps = (sec > 1) ? "s": "";
				return min + " minute" + pm + " " + sec + " second" + ps;
			}

			if(delta >= 3600 && delta <= 86399){
				hou = Math.floor(delta / 3600);
				min = Math.floor((delta - (hou * 3600)) / 60);
				ph = (hou > 1) ? "s": "";
				pm = (min > 1) ? "s": "";
				return hou + " hour" + ph + " " + min + " minute" + pm;
			} 

			if(delta >= 86400){
				days = Math.floor(delta / 86400);
				hou =  Math.floor((delta - (days * 86400)) / 60 / 60);
				pd = (days > 1) ? "s": "";
				ph = (hou > 1) ? "s": "";
				return days + " day" + pd + (hou > 0 ? " " + hou + " hour" + ph : '');
			}
		}
	};
	
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

	this.init = function init(no_editor) {
		ContextMenu.init();
		
		if(typeof(no_editor) == 'undefined') {
			no_editor = false;
		}
		
		if(no_editor) {
			_loaded.editor	= true;
		} else {
			new Monaco().init(function onLoad() {
				_loaded.editor	= true;
			});
		}
		
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
		
	this.init(no_editor);
});