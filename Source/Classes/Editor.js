module.exports = (function Editor() {
	var _path		= require('path');
	var _require	= {
		node:	null,
		amd:	null
	};
	
	this.init = function init() {
		_require.node = global.require;
		document.write('<script src="../node_modules/monaco-editor/min/vs/loader.js"></script>');
		
		setTimeout(function(){
			_require.amd	= global.require;
			global.require	= _require.node;
			
			_require.amd.config({
				paths: {
					'vs':	this.uriFromPath(_path.join(__dirname, '..', 'node_modules/monaco-editor/min/vs'))
				}
			});

			self.module				= undefined;
			self.process.browser	= true;
			
			_require.amd([ 'vs/editor/editor.main' ], function() {
				var code = document.querySelector('code-editor');
				
				if(typeof(code) != 'undefined') {
					var editor = monaco.editor.create(code, {
						value:		'Your Code...',
						language:	'lua'
					});
				}
			});
		}.bind(this), 1000);
	};
	
	this.uriFromPath = function uriFromPath(path) {
		var name = _path.resolve(path).replace(/\\/g, '/');
		
		if(name.length > 0 && name.charAt(0) !== '/') {
			name = '/' + name;
		}
		
		return encodeURI('file://' + name);
	};
});