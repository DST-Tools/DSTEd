module.exports = (function Application() {
	this.init = function init() {
		this.createSidebar();
	};
	
	this.createSidebar = function createSidebar() {
		/* Resizing */
		var _sidebar			= document.body.querySelector('ui-content ui-workspace');
		
		if(_sidebar == null) {
			return;
		}
		
		var _handler		= document.createElement('resize-handler');
		var width			= _sidebar.getBoundingClientRect().width;
		var start			= 5;
		_sidebar.appendChild(_handler);
		_handler.style.left		= (width + start) + 'px';
		
		_handler.addEventListener('mousedown', function onMouseDown(event) {
			event.preventDefault();
			
			width			= _sidebar.getBoundingClientRect().width;
			var startDrag	= event.clientX;
			
			var onMouseMove = function onMouseMove(event) {
				var size					= width + -startDrag + event.clientX;
				_sidebar.style.width		= size + 'px';
				
				if(parseInt(_sidebar.style.width, 10) > 0) {
					_handler.style.left		= (size + start) + 'px';
				} else {
					event.stopPropagation();
				}
			};
			
			var onMouseUp = function onMouseUp(event) {
				var size						= 0;
				
				if(parseInt(_handler.style.left, 10) < size) {
					_handler.style.left		= (size + start) + 'px';
				}
				
				window.removeEventListener('mousemove', onMouseMove);
				window.removeEventListener('mouseup', onMouseUp);
			};
			
			window.addEventListener('mousemove', onMouseMove);
			window.addEventListener('mouseup', onMouseUp);
		});
	};
});