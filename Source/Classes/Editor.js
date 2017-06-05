module.exports = (function Editor(IDE) {
	const _IDE		= IDE;
	const IPC		= require('electron').ipcRenderer;
	const _path		= require('path');
	const Texture	= require('../Classes/Klei/Texture.js');
	const ModInfo	= require('../Classes/Klei/ModInfo.js');
	var _element	= null;
	var _editor		= null;
	var _editors	= null;
	var _tab		= null;
	var _tabs		= null;
	var _file		= null;
	var _close		= null;
	var _type		= null;
	var _sidebar	= null;
	var _is_core	= false;
	var _changed	= false;
	var _modinfo	= false;
	
	this.init = function init(file, language) {
		_file					= file;
		_editors				= document.querySelector('code-editors');
		_tabs					= document.querySelector('editor-tabs');
		_sidebar				= document.querySelector('editor-sidebar');
		_element				= document.createElement('code-editor');
		_tab					= document.createElement('editor-tab');
		_close					= document.createElement('tab-close');
		_element.id				= _file.file;
		_type					= _file.type;
		_modinfo				= (_path.basename(_file.file) == 'modinfo.lua');
		
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
		if(_modinfo) {			
			var tab_content	= document.createElement('tab-content');
			tab_content.id	= 'mod_editor';
			tab_content.classList.add('visible');
			_element.appendChild(tab_content);
			var mod_editor = new ModInfo();
			
			mod_editor.create(tab_content, file.modinfo);
			
			mod_editor.onChange(function(event) {
				_changed = true
				document.querySelector('ui-menu button[data-command="save"]').removeAttribute('disabled');
				document.querySelector('ui-menu button[data-command="save_all"]').removeAttribute('disabled');
				this.setTitle(_path.basename(_file.file), true);
			}.bind(this));
			
			var tab_content	= document.createElement('tab-content');
			tab_content.id	= 'source_code';
			_element.appendChild(tab_content);
		}
		
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
				var tex = new Texture();
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

				_editor = monaco.editor.create(_modinfo ? tab_content : _element, {
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
					wordWrap:				false, /* @ToDo Make as View-Settings */
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
				
				if(_modinfo) {
					var tabbed_editor = document.createElement('ui-tabs');
					tabbed_editor.innerHTML = '<ui-tab data-tab="mod_editor" class="active" data-lang="Mod-Editor">Mod-Editor</ui-tab>';
					tabbed_editor.innerHTML += '<ui-tab data-tab="source_code" data-lang="Source">Source</ui-tab>';
					_element.appendChild(tabbed_editor);
				}
			break;
		}
	};
	
	this.setIsCore = function setIsCore(state) {
		_is_core = state;
		
		if(_is_core) {
			this.setWarning('danger', I18N.__('This file is an Core file! If you modify this file, your Game can be crash.'));
		}
	};
	
	this.isCore = function isCore() {
		return _is_core;
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
	
	this.setWarning = function setWarning(type, message) {
		_element.dataset.warning = type;
		_element.dataset.message = message;
	};
	
	this.getTab = function getTab() {
		return _tab;
	};
	
	this.open = function open() {
		_element.style.display	= 'flex';
		
		switch(_type) {
			case 'jpg':
			case 'jpeg':
			case 'bmp':
			case 'png':
				_sidebar.dataset.visible = true;
			break;
			default:
				_sidebar.dataset.visible = false;			
			break;
		}
	};
	
	this.isOpened = function isOpened() {
		return (_element.style.display == 'flex');
	};
	
	this.close = function close() {
		if(_editor != null) {
			_editor.dispose();
		};
		
		_sidebar.dataset.visible	= false;
		_tabs.removeChild(_tab);
		_editors.removeChild(_element);
	};
	
	this.hide = function hide() {
		_sidebar.dataset.visible	= false;
		_element.style.display		= 'none';
	};
});