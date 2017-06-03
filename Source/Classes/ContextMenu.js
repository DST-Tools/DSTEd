module.exports = (function ContextMenu() {
	const I18N		= require('../Classes/I18N')();
	var _element	= null;
	var _list		= [];
	var _x			= 0;
	var _y			= 0;
	
	this.init = function init() {
		_element = document.createElement('ui-contextmenu');
		document.querySelector('body').appendChild(_element);
		
		document.addEventListener('contextmenu', function onClick(event) {
			_list = [];
			this.setMousePosition(event.clientX, event.clientY);
			
			if(typeof(event.target.dataset) != 'undefined' && typeof(event.target.dataset.contextmenu) != 'undefined' && event.target.dataset.contextmenu) {
				/* Projects */
				if(typeof(event.target.dataset.project) != 'undefined' && event.target.dataset.project && typeof(event.target.dataset.type) != 'undefined') {
					switch(event.target.dataset.type) {
						case 'steam':
							this.addEntry(I18N.__('Details'));
							this.addEntry(I18N.__('Deinstall'));
							this.show(event.target);
						break;
						case 'local':
							this.show(event.target);
						break;
					}
				}
			}
		}.bind(this));
		
		document.addEventListener('click', function onClick(event) {
			if(this.isVisible()) {
				this.hide();
			}
		}.bind(this));
	};
	
	this.setMousePosition = function setMousePosition(x, y) {
		_x = x;
		_y = y;
	};
	
	this.isVisible = function isVisible() {
		return _element.classList.contains('show');
	}
	
	this.show = function show(target) {
		_element.style.top	= _y + 'px';
		_element.style.left	= _x + 'px';
		
		this.render();
		_element.classList.add('show');
	};
	
	this.hide = function hide() {
		_element.classList.remove('show');
	};
	
	this.addEntry = function addEntry(text) {
		_list.push(text);
	};
	
	this.render = function render() {
		_element.innerHTML	= '';
		var list			= document.createElement('ul');
		
		_list.forEach(function(entrie) {
			var e		= document.createElement('li');
			e.innerHTML	= entrie;
			list.appendChild(e);
		});
		
		_element.appendChild(list);
	};
	
	return this;
});