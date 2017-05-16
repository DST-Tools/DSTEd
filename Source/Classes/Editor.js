module.exports = (function Editor(IDE) {
	var _IDE		= IDE;
	var _path		= require('path');
	var _element	= null;
	var _editor		= null;
	var _editors	= null;
	var _tab		= null;
	var _tabs		= null;
	var _file		= null;
	var _close		= null;
	
	this.init = function init(file, language) {
		_file					= file;
		_editors				= document.querySelector('code-editors');
		_tabs					= document.querySelector('editor-tabs');
		_element				= document.createElement('code-editor');
		_tab					= document.createElement('editor-tab');
		_close					= document.createElement('tab-close');
		_element.id				= _file.file;
		_tab.innerHTML			= _path.basename(_file.file);
		
		_tab.appendChild(_close);
		
		_close.addEventListener('click', function onClick(event) {
			_IDE.closeEditor(_file.file);
		});
		
		_tab.addEventListener('click', function onClick(event) {
			_IDE.openEditor(_file.file);
		});
		
		_tabs.appendChild(_tab);
		_editors.appendChild(_element);
		
		_editor = monaco.editor.create(_element, {
			value:					file.content,
			language:				language,
			lineNumbers:			true,
			automaticLayout:		true,
			roundedSelection:		true,
			scrollBeyondLastLine:	false,
			readOnly:				false,
			folding:				true,
			tabCompletion:			true,
			useTabStops:			true,
			wordWrap:				false, /* Make as View-Settings */
			theme:					'vs-dark',
			scrollbar: {
				useShadows:					false,
				verticalHasArrows:			true,
				horizontalHasArrows:		true,
				vertical:					'visible',
				horizontal:					'visible',
				verticalScrollbarSize:		18,
				horizontalScrollbarSize:	18,
				arrowSize:					21
			}
		});
	};
	
	this.getTab = function getTab() {
		return _tab;
	};
	
	this.open = function open() {
		_element.style.display	= 'flex';
	};
	
	this.isOpened = function isOpened() {
		return (_element.style.display == 'flex');
	};
	
	this.close = function close() {
		_editor.dispose();
		_tabs.removeChild(_tab);
		_editors.removeChild(_element);
	};
	
	this.hide = function hide() {
		_element.style.display	= 'none';
	};
});