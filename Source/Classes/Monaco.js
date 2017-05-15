module.exports = (function Monaco() {
	const _path		= require('path');
	var _callback	= function() {};
	
	this.init = function init(callback) {
		_callback = callback;
		this.loadEditor();
	};
	
	this.loadEditor = function loadEditor() {
		if(typeof(_require) == 'undefined') {
			return;
		}
		
		_require.amd.config({
			baseUrl:	this.uriFromPath(_path.join(__dirname, '..', 'node_modules/monaco-editor/min'))
		});
		
		self.module				= undefined;
		self.process.browser	= true;
		
		_require.amd(['vs/editor/editor.main'], function() {
			_callback();
		});
	};
	
	this.uriFromPath = function uriFromPath(path) {
		var name = _path.resolve(path).replace(/\\/g, '/');
		
		if(name.length > 0 && name.charAt(0) !== '/') {
			name = '/' + name;
		}
		
		return encodeURI('file://' + name);
	};
});