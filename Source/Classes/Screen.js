const electron		= require('electron');
const Window		= electron.BrowserWindow;
const Remote		= electron.remote;
const Session		= electron.session;
const url			= require('url');
const path			= require('path');
const IPC			= require('electron').ipcMain;
const OS			= require('os');
const Logger		= require('../Classes/Logger')();
const Steam			= require('../Classes/Steam')();
	
module.exports = (function Screen(name, size, callback_backend, callback_frontend) {
	var _name			= '';
	var _width			= 0;
	var _height			= 0;
	var _max_width		= null;
	var _min_width		= null;
	var _min_height		= null;
	var _window			= null;
	var _debug			= false;
	var _resizable		= false;
	var _menu			= null;
	var _post_data		= null;
	var _callbacks		= {
		onStart:	function onStart() { /* Override Me */ },
		onLoad:		function onLoad() { /* Override Me */ }
	};
	
	this.init = function init(name) {
		_name	= name;
	};
	
	this.setPostData = function setPostData(data) {
		_post_data = data;
		return this;
	};
	
	this.getPostData = function getPostData() {
		return _post_data;
	};
	
	this.setMaxWidth = function setMaxWidth(width) {
		_max_width = width;
		return this;
	};
	
	this.setDebug = function setDebug(state) {
		_debug = state;
		return this;
	};
	
	this.setResizeable = function setResizeable(state) {
		_resizable = state;
		return this;
	};
	
	this.setSize = function setSize(width, height) {
		_width	= width;
		_height	= height;
		return this;
	};
	
	this.setMinSize = function setMinSize(width, height) {
		_min_width	= width;
		_min_height	= height;
		
		if(_width < _min_width) {
			this.setWidth(_min_width);
		}
		
		if(_height < _min_height) {
			this.setHeight(_min_height);
		}
		
		return this;
	};
	
	this.setOnStart = function setOnStart(callback) {
		_callbacks.onStart = callback;
		return this;
	};
	
	this.setOnLoad = function setOnLoad(callback) {
		_callbacks.onLoad = callback;
		return this;
	};
	
	this.send = function send(name, data) {
		if(_window == null || _window.webContents == null) {
			return this;
		}
		
		_window.webContents.send(name, data);
		
		return this;
	};
	
	this.setMenu = function setMenu(menu) {
		_menu = menu;
		_window.setMenu(_menu.getMenu());
		return this;
	};
	
	this.setWidth = function setWidth(width) {
		_width = width;
		return this;
	};
	
	this.setHeight = function setHeight(height) {
		_height = height;
		return this;
	};
	
	this.setSize = function setSize(width, height) {
		_width = width;
		_height = height;
		return this;
	};
	
	this.open = function open() {
		_window = new Window({
			width:				_width,
			height:				_height,
			frame:				false,
			show:				false,
			maxWidth:			_max_width,
			minWidth:			(_min_width == null ? 0 : _min_width),
			minHeight:			(_min_height == null ? 0 : _min_height),
			resizable:			_resizable,
			backgroundColor:	'#2D2D30',
			vibrancy:			'popover',
			icon:				'Resources/window_icon.png'
		});
				
		_window.loadURL(url.format({
			pathname:	path.join(__dirname, '..', 'Window', _name + '.html'),
			protocol:	'file:',
			slashes:	true
		}), {
			userAgent:	'DSTEd v' + global.DSTEd.version + '/' + OS.platform() + ' ' + OS.release() +  ' (' + OS.arch() + ', ' + OS.type() + ')'
		});
		
		Session.defaultSession.cookies.set({
			url:	'https://api.DSTEd.org/',
			name:	'STEAM_AUTH',
			value:	Steam.getAuthID(),
		}, function onCallback(error) {
			if(error) {
				console.error(error);
			}
		});

		_window.webContents.session.webRequest.onBeforeSendHeaders({
			
		}, function onHeader(details, callback) {
			details.requestHeaders['User-Agent'] = 'DSTEd v' + global.DSTEd.version + '/' + OS.platform() + ' ' + OS.release() +  ' (' + OS.arch() + ', ' + OS.type() + ')';
			
			callback({
				cancel:			false,
				requestHeaders:	details.requestHeaders
			});
		});
		
		_window.webContents.session.webRequest.onHeadersReceived({
			
		}, function onHeader(details, callback) {
			if(details.responseHeaders['X-Frame-Options']){
				delete details.responseHeaders['X-Frame-Options'];
			}
			
			callback({
				cancel:				false,
				responseHeaders:	details.responseHeaders
			});
		});
		
		if(_debug) {
			_window.webContents.openDevTools();
		}
		
		if(_menu != null) {
			_window.setMenu(_menu.getMenu());
		} else {
			_window.setMenu(null);
		}
		
		_window.on('closed', function onClosed() {
			_window = null;
		});
		
		_window.once('ready-to-show', function() {
			_window.show();
		});
		
		_window.once('show', function() {
			_callbacks.onStart();
		});
		
		IPC.on('window:init', function(event, args) {
			if(typeof(_window) == 'undefined' || _window == null) {
				return;
			}
			
			if(!event.sender.isDestroyed() && _window.id === event.sender.id) {
			/* Other usage, but not excellent: */
			// if(_window == Window.getFocusedWindow()) {
				_callbacks.onLoad();
			}
		}.bind(this));
	};
	
	this.close = function close() {
		if(_window != null) {
			_window.close();
		}
	};
	
	this.init(name);
});