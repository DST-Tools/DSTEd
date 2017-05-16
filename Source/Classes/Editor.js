module.exports = (function Editor(IDE) {
	const _IDE		= IDE;
	const IPC		= require('electron').ipcRenderer;
	const _path		= require('path');
	var _element	= null;
	var _editor		= null;
	var _editors	= null;
	var _tab		= null;
	var _tabs		= null;
	var _file		= null;
	var _close		= null;
	var _changed	= false;
	
	this.init = function init(file, language) {
		_file					= file;
		_editors				= document.querySelector('code-editors');
		_tabs					= document.querySelector('editor-tabs');
		_element				= document.createElement('code-editor');
		_tab					= document.createElement('editor-tab');
		_close					= document.createElement('tab-close');
		_element.id				= _file.file;
		
		this.setTitle(_path.basename(_file.file), false);
		
		_close.addEventListener('click', function onClick(event) {
			_IDE.closeEditor(_file.file);
		});
		
		_tab.addEventListener('click', function onClick(event) {
			_IDE.openEditor(_file.file);
		});
		
		_tabs.appendChild(_tab);
		_editors.appendChild(_element);
		
		monaco.languages.registerCompletionItemProvider('lua', {
			triggerCharacters:		["."],
			provideCompletionItems: function(model, position) {
				var textUntilPosition	= model.getValueInRange({
					startLineNumber: 1,
					startColumn: 1,
					endLineNumber: position.lineNumber,
					endColumn: position.column
				});
				
				return require('../Resources/DST-API.json');
			}
		});

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
		
		_editor.onDidChangeModelContent(function(event) {
			_changed = true;
			this.setTitle(_path.basename(_file.file), true);
		}.bind(this));
		
		_editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function onSave() {
			this.save();
		}.bind(this));
	};
	
	this.save = function save() {
		IPC.send('file:save', {
			file:		_file.file,
			content:	_editor.getValue({
				preserveBOM: true	
			})
		});
	};
	
	this.saved = function saved() {
		_changed = false;
		this.setTitle(_path.basename(_file.file), false);
	};
	
	this.setTitle = function setTitle(title, changed) {
		_tab.innerHTML = title + (changed ? '*' : '');
		_tab.appendChild(_close);
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