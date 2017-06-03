module.exports = (function Pagination(selector, callback) {
	var _element	= null;
	var _buttons	= null;
	var _info		= null;
	var _callback	= null;
	var _total		= 0;
	var _page		= 0;
	var _pages		= 0;
	var _maximum	= 5;
	
	this.init = function init(selector, callback) {
		_callback	= callback;
		_element	= document.querySelector(selector);
		_buttons	= _element.querySelector('ui-pagination');
		_info		= _element.querySelector('ui-results');
	};
	
	this.setPage = function setPage(page) {
		_page = page;
	};
	
	this.setPages = function setPages(pages) {
		_pages = pages;
	};
	
	this.setTotal = function setTotal(total) {
		_total = total;
	};
	
	this.renderNextButton = function renderNextButton() {
		var page = _pages;
		
		if(_page + 1 < _pages) {
			page = _page + 1;
		}
		
		var button = document.createElement('button');
		button.innerHTML = '►';
		button.setAttribute('name', 'page');
		button.setAttribute('value', page);
		button.addEventListener('click', function onClick(event) {
			_callback(page);
		});
		_buttons.appendChild(button);
	};
	
	this.renderPreviousButton = function renderPreviousButton() {
		var page = 1;
		
		if(_page - 1 > 1) {
			page = _page - 1;
		}
		
		var button = document.createElement('button');
		button.innerHTML = '◄';
		
		button.setAttribute('name', 'page');
		button.setAttribute('value', page);
		button.addEventListener('click', function onClick(event) {
			_callback(page);
		});
		_buttons.appendChild(button);
	};
	
	this.renderPageButton = function renderPageButton(page) {
		var button = document.createElement('button');
		button.innerHTML = page;
		
		if(page == _page) {
			button.classList.add('active');
		}
		
		button.setAttribute('name', 'page');
		button.setAttribute('value', page);
		button.addEventListener('click', function onClick(event) {
			_callback(page);
		});
		_buttons.appendChild(button);
	};
	
	this.render = function render() {
		_buttons.innerHTML	= '';
		
		if(_total == 0) {
			_info.innerHTML		= I18N.__('No Items Available');
		} else {
			if(_pages > 0) {
				_info.innerHTML		= I18N.__('Page') + ' ' + _page + ' / ' + _pages + ' - ' + _total + ' ' + I18N.__('Items');
				
				this.renderPreviousButton();
			}
			
			if(_pages == 0) {
				_info.innerHTML		= _total + ' ' + I18N.__('Items');
			} else if(_page < _maximum) {
				if(_pages > _maximum) {
					for(var index = 1; index <= _maximum; ++index) {
						this.renderPageButton(index);
					}
				} else {
					for(var index = 1; index <= _pages; ++index) {
						this.renderPageButton(index);
					}	
				}
			} else if(_page > _pages - _maximum) {
				for(var index = _pages - _maximum; index <= _pages; ++index) {
					this.renderPageButton(index);
				}
			} else {
				for(var index = parseInt(_page - (_maximum / 2), 10); index <= _page; ++index) {
					this.renderPageButton(index);
				}
				
				for(var index = _page + 1; index <= parseInt(_page + (_maximum / 2) + 1, 10); ++index) {
					this.renderPageButton(index);
				}
			}
			
			if(_pages > 0) {
				this.renderNextButton();
			}
		}
	};
	
	this.init(selector, callback);
});