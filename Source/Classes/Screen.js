const electron		= require('electron');
const Window		= electron.BrowserWindow;
const Remote		= electron.remote;
const url			= require('url');
const path			= require('path');
const IPC			= require('electron').ipcMain;
	
module.exports = (function Screen(name, size, callback_backend, callback_frontend) {
	var _name			= '';
	var _width			= 0;
	var _height			= 0;
	var _window			= null;
	var _debug			= false;
	var _resizable		= false;
	var _menu			= null;
	var _callbacks		= {
		onStart:	function onStart() { /* Override Me */ },
		onLoad:		function onLoad() { /* Override Me */ }
	};
	
	this.init = function init(name) {
		_name	= name;
	};
	
	this.setDebug = function setDebug(state) {
		_debug = state;
	};
	
	this.setResizeable = function setResizeable(state) {
		_resizable = state;
	};
	
	this.setSize = function setSize(width, height) {
		_width	= width;
		_height	= height;
	};
	
	this.setOnStart = function setOnStart(callback) {
		_callbacks.onStart = callback;
	};
	
	this.setOnLoad = function setOnLoad(callback) {
		_callbacks.onLoad = callback;
	};
	
	this.send = function send(name, data) {
		_window.webContents.send(name, data);
	};
	
	this.setMenu = function setMenu(menu) {
		_menu = menu;
		_window.setMenu(_menu.getMenu());
	};
	
	this.open = function open() {
		_window = new Window({
			width:				_width,
			height:				_height,
			frame:				false,
			show:				false,
			resizable:			_resizable,
			backgroundColor:	'#2D2D30',
			vibrancy:			'popover',
			icon:				'Resources/window_icon.png'
		});
		
		_window.loadURL(url.format({
			pathname:	path.join(__dirname, '..', 'Window', _name + '.html'),
			protocol:	'file:',
			slashes:	true
		}));
		
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
			_callbacks.onLoad();
		}.bind(this));
	};
	
	this.close = function close() {
		if(_window != null) {
			_window.close();
		}
	};
	
	this.init(name);
});