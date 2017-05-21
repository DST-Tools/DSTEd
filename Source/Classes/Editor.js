module.exports = (function Editor(IDE) {
	const _IDE		= IDE;
	const IPC		= require('electron').ipcRenderer;
	const _path		= require('path');
	const Klei		= require('../Classes/Klei/Texture.js');
	var _element	= null;
	var _editor		= null;
	var _editors	= null;
	var _tab		= null;
	var _tabs		= null;
	var _file		= null;
	var _close		= null;
	var _type		= null;
	var _changed	= false;
	
	this.init = function init(file, language) {
		_file					= file;
		_editors				= document.querySelector('code-editors');
		_tabs					= document.querySelector('editor-tabs');
		_element				= document.createElement('code-editor');
		_tab					= document.createElement('editor-tab');
		_close					= document.createElement('tab-close');
		_element.id				= _file.file;
		_type					= _file.type;
		
		this.setTitle(_path.basename(_file.file), false);
		document.querySelector('ui-menu button[data-command="close"]').removeAttribute('disabled');
		document.querySelector('ui-menu button[data-command="close_all"]').removeAttribute('disabled');
		
		_close.addEventListener('click', function onClick(event) {
			_IDE.closeEditor(_file.file);
		});
		
		_tab.addEventListener('click', function onClick(event) {
			_IDE.openEditor(_file.file);
		});
		
		_tabs.appendChild(_tab);
		_editors.appendChild(_element);
		
		switch(_type) {
			case 'jpg':
			case 'jpeg':
			case 'bmp':
			case 'png':
				var image		= new Image();
				image.src		= file.file;
				image.onload	= function onLoad() {
					_element.appendChild(image);
				};
				
				_element.classList.add('image');
			break;
			case 'tex':
				var tex = new Klei();
				tex.parse(file.content);
			break;
			default:
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
					language:				_type,
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
					document.querySelector('ui-menu button[data-command="save"]').removeAttribute('disabled');
					document.querySelector('ui-menu button[data-command="save_all"]').removeAttribute('disabled');
					this.setTitle(_path.basename(_file.file), true);
				}.bind(this));
				
				_editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function onSave() {
					this.save();
				}.bind(this));
			break;
		}
	};
	
	this.getFileName = function getFileName() {
		return _path.basename(_file.file);
	};
	
	this.save = function save() {
		if(_editor == null) {
			return;
		};
		
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
	
	this.hasChanged = function hasChanged() {
		return _changed;
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
		if(_editor != null) {
			_editor.dispose();
		};
		
		_tabs.removeChild(_tab);
		_editors.removeChild(_element);
	};
	
	this.hide = function hide() {
		_element.style.display	= 'none';
	};
});