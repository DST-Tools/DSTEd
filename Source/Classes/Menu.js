module.exports = (function Menu() {
	var Menu		= require('electron').Menu;
	var _menu		= null;
	var _template	= null;
	
	this.init = function init() {
		_menu		= new Menu();
		this.setTemplate(require('../Resources/Menu.json'));
	};
	
	this.setTemplate = function setTemplate(template) {
		/* @ToDo Test with non-Aero under Windows & loop for I18N */
		_template	= template;
		_menu		= Menu.buildFromTemplate(_template);
		Menu.setApplicationMenu(_menu);
	};
	
	this.getMenu = function getMenu() {
		return _menu;
	};
	
	this.init();
});