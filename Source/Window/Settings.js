const electron		= require('electron');
const Remote		= electron.remote;
var _path			= require('path');
var IPC				= require('electron').ipcRenderer;
const DSTEd			= Remote.getGlobal('DSTEd');

(function Settings() {
	this.init = function init() {		
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
			
			if(typeof(event.target.dataset) != 'undefined' && typeof(event.target.dataset.subtab) != 'undefined') {
				var tabs_container		= event.target.closest('tab-content');
				var tabs				= tabs_container.parentNode.querySelectorAll('tab-sidebar tab-section');
				var contents			= tabs_container.querySelectorAll('tab-container subtab-container');
				
				Array.prototype.forEach.call(contents, function onEntrie(node) {
					node.classList.remove('visible');
				});
				
				Array.prototype.forEach.call(tabs, function onEntrie(tab) {
					tab.classList.remove('active');
					
					if(tab.dataset.subtab == event.target.dataset.subtab) {
						tab.classList.add('active');
					}
				});
				
				tabs_container.querySelector('subtab-container[data-name="' + event.target.dataset.subtab + '"]').classList.add('visible');
				return;
			}
				
			if(typeof(event.target.dataset) != 'undefined' && typeof(event.target.dataset.action) != 'undefined') {
				switch(event.target.dataset.action) {
					case 'window:close':
						win.close();
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
				}
			}
		});
	};
	
	this.init();
}());