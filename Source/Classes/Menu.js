module.exports = (function Menu() {
	var Menu		= require('electron').Menu;
	var _menu		= null;
	var _template	= null;
	
	this.init = function init() {
		_menu		= new Menu();
		this.setTemplate(require('../Resources/Menu.json'));
	};
	
	this.setTemplate = function setTemplate(template) {
		_template	= template;
		_menu		= Menu.buildFromTemplate(_template);
		Menu.setApplicationMenu(_menu);
	};
	
	this.getMenu = function getMenu() {
		return _menu;
	};
	
	this.init();
});