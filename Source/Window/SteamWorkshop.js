const electron		= require('electron');
const Remote		= electron.remote;
var _path			= require('path');
var IPC				= require('electron').ipcRenderer;
const DSTEd			= Remote.getGlobal('DSTEd');

(function SteamWorkshop() {
	this.init = function init() {		
		document.addEventListener('click', function onClick(event) {
			const win = Remote.getCurrentWindow();
				
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
		
		document.querySelector('button[name="search"]').addEventListener('click', function onClick(event) {
			IPC.send('steam:workshop:search', {
				query: document.querySelector('input[name="query"]').value
			});
		});
		
		IPC.on('steam:workshop:list', function(event, data) {
			var content	= document.querySelector('section-content');
			content.innerHTML = '';
			var pages	= data.pages;
			var total	= data.total;
			var page	= data.page;
			var entries	= data.entries;
			
			console.log(data);
			entries.forEach(function(entrie) {
				var html = document.createElement('mod-entrie');
				var tags = '';
				
				/*
					num_comments_public
					subscriptions
					favorited
					views
					
					vote_data
						score
						votes_down
						votes_up
				*/
				
				
				entrie.tags.forEach(function(tag) {
					tags += '<mod-tag>' + tag.tag + '</mod-tag>';
				});
				
				var left = '<img src="' + entrie.preview_url + '" alt="Preview" /><h1>' + entrie.title + '</h1><small>' + entrie.short_description + '</small><mod-tags>' + tags + '</mod-tags>';
				var right = '';
				
				html.innerHTML = '<mod-left>' + left  + '</mod-left>' + right;
				
				content.appendChild(html);
			});
		});			
	};
	
	this.init();
}());