exports = module.exports = (function I18N() {
	const electron		= require('electron');
	const Remote		= electron.remote;
	const App			= (typeof(electron.app) == 'undefined' ? Remote.app : electron.app);
	const path			= require('path');
	const fs			= require('fs');
	
	var _language		= 'en_US';
	var _directory		= null;
	var _table			= null;
	
	this.init = function init() {
		var _directory = path.dirname(App.getPath('exe'));
		
		if(new RegExp('node_modules', 'gi').test(_directory)) {
			_directory = App.getAppPath();
		}
		
		_directory += path.sep + 'Languages' + path.sep;
		
		var _watcher = setInterval(function Wait() {
			var language = null;
			
			if(typeof(window) == 'undefined') {
				language = global.DSTEd.language;
			} else {
				language = Remote.getGlobal('DSTEd').language;
			}
			
			if(typeof(language) != 'undefined') {
				_language = language;
				
				if(fs.existsSync(_directory + _language + '.json')) {
					_table = require(_directory + _language + '.json');
				}
				
				clearInterval(_watcher);
			}
		}.bind(this), 10);
	};
	
	this.getLanguage = function getLanguage(name) {
		var original = this.__('INFO.name');
		
		if(original == 'INFO.name') {
			return name;
		}
		
		return original;
	};
	
	this.__ = function __(name) {
		var temp = _table;
		
		name.split('.').forEach(function(key) {
			try {
				if(typeof(temp[key]) != 'undefined') {
					temp = temp[key];
				}
			} catch(e) {
				/* Do Nothing */
			}
		});
		
		if(typeof(temp) == 'string') {
			return temp;
		}
		
		return name;
	};
	
	this.renderHTML = function renderHTML() {
		var _watcher = setInterval(function() {
			if(_table != null) {
				/* Default Text */
				[].forEach.call(document.querySelectorAll('[data-lang]'), function(element) {
					element.innerHTML = this.__(element.dataset.lang);
				}.bind(this));
				
				/* Placeholders */
				[].forEach.call(document.querySelectorAll('[data-langplaceholder]'), function(element) {
					element.placeholder = this.__(element.dataset.langplaceholder);
				}.bind(this));
				
				/* Before */
				[].forEach.call(document.querySelectorAll('[data-langbefore]'), function(element) {
					element.dataset.before = this.__(element.dataset.langbefore);
				}.bind(this));
				
				/* After */
				[].forEach.call(document.querySelectorAll('[data-langafter]'), function(element) {
					element.dataset.after = this.__(element.dataset.langafter);
				}.bind(this));
				
				/* Alt */
				[].forEach.call(document.querySelectorAll('[data-langalt]'), function(element) {
					element.alt = this.__(element.dataset.langalt);
				}.bind(this));
				clearInterval(_watcher);
			}
		}.bind(this), 10);
	};
	
	this.init();
	
	return this;
});