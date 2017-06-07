const electron		= require('electron');
const Remote		= electron.remote;
const DSTEd			= Remote.getGlobal('DSTEd');
const Editor		= require('../Classes/Editor.js');
const IPC			= require('electron').ipcRenderer;
const I18N			= require('../Classes/I18N')();

(function IDE() {
	var _editors = {};
	
	this.init = function init() {
		this.createMenu();
		this.createSidebar('ui-content ui-workspace', 95);
		this.createSidebar('ui-content ui-container', 95);
		
		document.addEventListener('click', function onClick(event) {
			const win = Remote.getCurrentWindow();
			
			if(typeof(event.target.dataset) != 'undefined' && typeof(event.target.dataset.tab) != 'undefined') {
				/* @ToDo globalize, dont add the same code to other windows... (Spaghetti Code) */
				var tabs_container		= event.target.closest('ui-tabs');
				var tabs				= tabs_container.parentNode.querySelectorAll('ui-tab');
				var contents			= tabs_container.parentNode.querySelectorAll('tab-content');
				
				Array.prototype.forEach.call(contents, function onEntrie(node) {
					node.classList.remove('visible');
				});
				
				Array.prototype.forEach.call(tabs, function onEntrie(tab) {
					tab.classList.remove('active');
					
					if(tab.dataset.tab == event.target.dataset.tab) {
						tab.classList.add('active');
					}
				});
				
				tabs_container.parentNode.querySelector('tab-content#' + event.target.dataset.tab).classList.add('visible');
				return;
			}
			
			if(typeof(event.target.dataset) != 'undefined' && typeof(event.target.dataset.action) != 'undefined') {
				switch(event.target.dataset.action) {
					case 'window:close':
						this.executeCommand('exit');
					break
					case 'window:maximize':
						document.querySelector('button[data-action="window:maximize"]').dataset.action = 'window:restore';
						
						if(!win.isMaximized()) {
							win.maximize();
						} else {
							win.unmaximize();
						}
					break;
					case 'window:restore':
						win.restore();
						document.querySelector('button[data-action="window:restore"]').dataset.action = 'window:maximize';
					break;
					case 'window:minimize':
						if(!win.isMinimized()) {
							win.minimize();
						} else {
							win.unminimize();
						}
					break;
					case 'file:open':
						if(typeof(_editors[event.target.dataset.file]) == 'undefined') {
							IPC.send('file:open', event.target.dataset.file);
						} else {
							this.openEditor(event.target.dataset.file);
						}
					break;
				}
			}
		}.bind(this));
		
		var _projects = {};
		
		IPC.on('workspace:project:add', function(event, project) {
			_projects[project.name]		= project.project;
			var new_projects			= {};
			new_projects[project.name]	= project.project;
			this.renderWorkspace(new_projects, true);
			new_projects = null;
			delete new_projects;
		}.bind(this));
		
		IPC.on('workspace:project:remove', function(event, name) {
			console.log('Remove from Workspace: ', name);
			
			var project				= document.querySelector('input[type="checkbox"]#' + name);
			var workspace_projects	= document.querySelector('ui-projects');
			
			if(typeof(project) != 'undefined' && project != null) {
				project = project.closest('project-entry');
				workspace_projects.removeChild(project)
			}
			
			_projects[name] = null;
			delete _projects[name];
		}.bind(this));
		
		IPC.on('workspace:core', function(event, core) {
			this.renderCore(core);
		}.bind(this));
		
		IPC.on('workspace:projects', function(event, projects) {
			_projects = projects;
			this.renderWorkspace(_projects, false);
		}.bind(this));
		
		IPC.on('file:open', function(event, file) {
			var editor			= new Editor(this);
			editor.init(file, 'lua');
			editor.setIsCore(file.is_core);
			_editors[file.file] = editor;
			this.openEditor(file.file);
		}.bind(this));
		
		IPC.on('file:saved', function(event, file) {
			this.getEditor(file).saved();
		}.bind(this));
	};
	
	this.closeEditor = function closeEditor(file) {
		 var keys	= Object.keys(_editors);
		 var index	= keys.indexOf(file);
		 var next	= null;
		 var open	= null;
		 
		 if(index !== -1) {
			 var previous	= keys[index - 1];
			 var next		= keys[index + 1];
			 var editor		= null;
			 
			 if(typeof(previous) != 'undefined' && typeof(_editors[previous]) != 'undefined' && _editors[previous].length > 0) {
				 console.log('Open Previous Editor', previous);
				open = previous;
			 } else if(typeof(next) != 'undefined'&& typeof(_editors[next]) != 'undefined' && _editors[next].length > 0) {
				console.log('Open Next Editor', next);
				open = next;
			 }
		 }
		 
		_editors[file].close();
		_editors[file] = null;
		delete _editors[file];
		
		if(open == null) {
			keys	= Object.keys(_editors);
			open	= _editors[keys[0]];
		}
		
		this.openEditor(open);
	};
	
	this.getEditor = function getEditor(file) {
		var editor = null;
		
		if(typeof(_editors[file]) != 'undefined') {
			editor = _editors[file];
		}
		
		return editor;
	};
	
	this.openEditor = function openEditor(file) {
		Object.keys(_editors).map(function(editor, index) {
			_editors[editor].hide();
		});
		
		if(typeof(_editors[file]) != 'undefined' && typeof(_editors[file].open) != 'undefined') {
			_editors[file].open();
		}
		
		Object.keys(_editors).map(function(editor, index) {
			if(_editors[editor].isOpened()) {
				_editors[editor].getTab().classList.add('active');
			} else {
				_editors[editor].getTab().classList.remove('active');
			}
		});
	};
	
	this.createMenu = function createMenu() {
		const items	= Remote.Menu.getApplicationMenu().items;
		const menu	= document.querySelector('ui-menu');
		
		items.forEach(function(item) {
			var MenuItem			= document.createElement('ui-entry');
			var Button				= document.createElement('button');
			Button.innerHTML		= I18N.__(item.label);
			
			if(item.disabled) {
				Button.setAttribute('disabled', '');
			}
			
			MenuItem.appendChild(Button);
			
			if(typeof(item.submenu) != 'undefined' && item.submenu != null && typeof(item.submenu.items) != 'undefined' && item.submenu.items != null) {
				Button.classList.add('submenu');
				this.renderSubMenu(MenuItem, item.submenu.items);			
			}
			menu.appendChild(MenuItem);
		}.bind(this));
	};
	
	this.renderSubMenu = function renderSubMenu(target, items) {
		if(items.length > 0) {
			var Submenu			= document.createElement('ui-dropdown');
			
			items.forEach(function(submenu) {
				var SubmenuItem;
				
				/*console.log({
					accelerator:	submenu.accelerator,
					label:			submenu.label,
					checked:		submenu.checked,
					click:			submenu.click,
					commandId:		submenu.commandId,
					enabled:		submenu.enabled,
					icon:			submenu.icon,
					menu:			submenu.menu,
					role:			submenu.role,
					sublabel:		submenu.sublabel,
					type:			submenu.type,
					visible:		submenu.visible
				});*/
				
				switch(submenu.type) {
					case 'separator':
						SubmenuItem				= document.createElement('menu-seperator');
					break;
					default:
						var accelerator			= '';
						
						if(submenu.accelerator != null) {
							accelerator			= '<keyboard-shortcut>' + submenu.accelerator + '</keyboard-shortcut>';
						}
						
						SubmenuItem					= document.createElement('button');
						SubmenuItem.innerHTML		= I18N.__(submenu.label) + accelerator;
						
						if(submenu.disabled) {
							SubmenuItem.setAttribute('disabled', '');
						}
						
						var command					= null;
						var command_id				= submenu.commandId;
						
						if(
							typeof(submenu.menu) != 'undefined' && submenu.menu != null &&
							typeof(submenu.menu.commandsMap) != 'undefined' && submenu.menu.commandsMap != null &&
							typeof(submenu.menu.commandsMap[command_id]) != 'undefined' && submenu.menu.commandsMap[command_id] != null &&
							typeof(submenu.menu.commandsMap[command_id].command) != 'undefined' && submenu.menu.commandsMap[command_id].command != null							
						) {
							command = submenu.menu.commandsMap[command_id].command;
						}
						
						SubmenuItem.dataset.command = command;
						
						SubmenuItem.addEventListener('click', function onClick(event) {
							this.executeCommand(event.target.dataset.command);
						}.bind(this));
					break;
				}
								
				Submenu.appendChild(SubmenuItem);
				
				if(typeof(submenu.submenu) != 'undefined' && submenu.submenu != null && typeof(submenu.submenu.items) != 'undefined' && submenu.submenu.items != null) {
					this.renderSubMenu(Submenu, submenu.submenu.items);			
				}
			}.bind(this));
			
			target.appendChild(Submenu);
		}
	};
	
	this.executeCommand = function executeCommand(command) {
		switch(command) {
			case 'dst_run':
			case 'forum':
			case 'steam_workshop':
			case 'settings':
			case 'about':
				IPC.send('menu:command', command);
			break;
			case 'save':
				Object.keys(_editors).map(function(editor, index) {
					if(_editors[editor].isOpened()) {
						_editors[editor].save();
					}
				});
			break;
			case 'save_all':
				Object.keys(_editors).map(function(editor, index) {
					_editors[editor].save();
				});
			break;
			case 'close':
				Object.keys(_editors).map(function(editor, index) {
					if(_editors[editor].isOpened()) {
						this.closeEditor(editor);
					}
				}.bind(this));				
			break;
			case 'close_all':
				Object.keys(_editors).map(function(editor, index) {
					this.closeEditor(editor);
				}.bind(this));
			break;
			case 'exit':
				var changes = false;
				var files	= [];
				
				Object.keys(_editors).map(function(editor, index) {
					if(_editors[editor].hasChanged()) {
						changes = true;
						files.push(_editors[editor].getFileName());
					}
				});
				
				if(changes) {
					Remote.dialog.showMessageBox(Remote.getCurrentWindow(), {
						type:				'question',
						detail:				I18N.__('If you click "Don\'t Save", the recent files will be not changed:') + '\n\t- ' + files.join('\n\t- '),
						checkboxLabel:		I18N.__('Rember...'),
						message:			I18N.__('Save the changes before closing?'),
						checkboxChecked:	false,
						buttons:	[
							I18N.__('Save'),
							I18N.__('Don\'t Save'),
							I18N.__('Cancel')
						]
					}, function onCallback(button, save) {
						console.log(button);
						switch(button) {
							/* Save */
							case 0:
								Object.keys(_editors).map(function(editor, index) {
									_editors[editor].save();
								});
								
								IPC.send('menu:command', command);
							break;
							
							/* Don't Save */
							case 1:
								IPC.send('menu:command', command);
							break;
						}
					});
					return;
				}
				
				IPC.send('menu:command', command);
			break;
			default:
				console.warn('Command not implemented: ' + command);
			break;
		}
	};
	
	this.createSidebar = function createSidebar(selector, min_width) {
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
				var size = width + -startDrag + event.clientX;
				
				if(size < min_width) {
					event.stopPropagation();
				} else {
					_sidebar.style.width	= size + 'px';
					_handler.style.left		= (size + start) + 'px';
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
	
	var node				= 0;
	var subnode				= 0;
	
	this.postUpdateWorkspace = function postUpdateWorkspace(project) {
		
	};
	
	this.renderCore = function renderCore(core) {
		console.log('Render Core', core);
		var workspace_core	= document.querySelector('ui-core');
		
		workspace_core.innerHTML = '';
		
		Object.keys(core).map(function(key, index) {
			subnode = 0;
			var project			= core[key];
			var id				= 'node-' + ++node + '-' + subnode;
			var project_html	= '';
			var has_files		= !(project.files == null);
					
			if(has_files) {
				var tree	= this.renderDirectory(project.files, '', true);
				project_html += tree.html;
			}
			
			project_html += '';
			workspace_core.innerHTML += project_html;
		});
	};
	
	this.renderWorkspace = function renderWorkspace(projects, adding) {
		console.log('Render Workspace', adding);
		var workspace_projects	= document.querySelector('ui-projects');
		
		/* Get all checkboxes */
		var toggled_trees		= [];
		var toggled_checkboxes	= workspace_projects.querySelectorAll('input[type="checkbox"]');
		Array.prototype.forEach.call(toggled_checkboxes, function onEntrie(node) {
			if(node.checked) {
				toggled_trees.push({
					id:		node.id,
					opened: node.checked
				});
			}
		});
		
		if(!adding) {
			workspace_projects.innerHTML = '';
		}
		
		Object.keys(projects).map(function(key, index) {
			subnode = 0;
			var project			= projects[key];
			var id				= 'node-' + ++node + '-' + subnode;
			var tree			= this.renderDirectory(project.files, '', true);
			var project_html	= '<project-entry class="css-treeview">';
			
			if(key.length > 0) {
				project_html += '<input type="checkbox" id="' + key + '">';
				project_html += '<label data-project="true" data-contextmenu="true" data-type="' + (project.workshop.enabled ? 'steam' : 'local') + '" for="' + key + '">';
				
				/* Steam nice name */
				if(project.workshop.enabled) {
					project_html += project.info.name + ' <small>(' + project.workshop.id + ')</small>';
				} else {
					project_html += key;
				}
				
				project_html += '</label>';
			}
			
			project_html += '<project-files>';
			project_html += tree.html;
			project_html += '</project-files>';
			project_html += '</project-entry>';
			workspace_projects.innerHTML += project_html;
		});
		
		/* Restore toggled trees */
		toggled_trees.forEach(function(tree) {
			var checkbox		= workspace_projects.querySelector('input[type="checkbox"]#' + tree.id);
			
			if(typeof(checkbox) != 'undefined' && checkbox != null) {
				checkbox.checked	= tree.opened;
			}
		});
	};
	
	this.renderDirectory = function renderDirectory(files, html, first) {
		var id = 'node-' + node + '-' + ++subnode;
		var checkbox = '<input type="checkbox" id="' + id + '">';
		
		if(!first) {
			html += '<li>';
		}
		
		if(files != null && typeof(files.name) != 'undefined' && files.name.length > 0) {
			if(typeof(files.entries) != 'undefined' && files.entries.length > 0) {
				html += checkbox;
			}
			
			html += '<label for="' + id + '" data-type="' + files.type + '" data-directory="' + (files.directory ? 'true' : 'false') + '"' + (files.directory ? '' : ' data-action="file:open" data-file="' + files.path + files.name + '"') + '>' + files.name + '</label>';
		}
		
		if(files != null && typeof(files.entries) != 'undefined' && typeof(files.entries) != 'undefined' && files.entries.length > 0) {
			html += '<ul>';
			
			files.entries.forEach(function(entries) {
				var result = this.renderDirectory(entries, '', false);
				html += result.html;
			});
			
			html += '</ul>';
		}
		
		if(!first) {
			html += '</li>';
		}
		
		return {
			html: 		html,
			id:			id,
			checkbox:	checkbox
		};
	};
	
	this.init();
}());