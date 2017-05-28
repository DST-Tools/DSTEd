const electron			= require('electron');
const Shell				= electron.shell;
const Remote			= electron.remote;
const _path				= require('path');
const _fs				= require('fs');
const IPC				= require('electron').ipcRenderer;
const Pagination		= require('../Classes/Pagination');
const DSTEd				= Remote.getGlobal('DSTEd');

(function SteamWorkshop() {
	var _pagination = null;
	var _body		= null;
	
	this.init = function init() {
		_body		= document.querySelector('body');
		_pagination	= new Pagination('footer', this.onClick.bind(this));
			
		document.addEventListener('click', function onClick(event) {
			const win = Remote.getCurrentWindow();
			
			if(event.target.nodeName == 'A') {
				event.preventDefault();
				Shell.openExternal(event.target.href);
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
					case 'steam:workshop:deinstall':
						IPC.send('steam:workshop:deinstall', {
							id:		event.target.value,
							button:	event.target
						});
					break;
					case 'steam:workshop:install':
						IPC.send('steam:workshop:install', {
							id:		event.target.value,
							button:	event.target
						});
					break;
					case 'steam:workshop:details':
						IPC.send('steam:workshop:details', event.target.value);
					break;
				}
			}
		});
		
		document.querySelector('input[name="query"]').addEventListener('change', function onClick(event) {
			document.querySelector('button[name="search"]').click();
		});
		
		document.querySelector('button[name="search"]').addEventListener('click', function onClick(event) {
			this.setLoadingIndicator(true);
		
			IPC.send('steam:workshop:search', {
				query: document.querySelector('input[name="query"]').value
			});
		}.bind(this));
		
		IPC.on('steam:workshop:event', function(event, data) {
			switch(data.action) {
				case 'progress':
					var mod				= document.querySelector('mod-entrie#MOD' + data.id);
					var button			= mod.querySelector('button[name="install"]');
					button.innerHTML	= parseInt(data.value, 10) + '%';
					button.classList.add('loading');
				break;
				case 'installed':
					var mod					= document.querySelector('mod-entrie#MOD' + data.id);
					var button				= mod.querySelector('button[name="install"]');
					button.innerHTML		= 'Deinstall';
					button.dataset.action	= 'steam:workshop:deinstall';
					button.classList.remove('loading');
					button.setAttribute('name', 'deinstall');
				break;
				case 'uninstalled':
					var mod					= document.querySelector('mod-entrie#MOD' + data.id);
					var button				= mod.querySelector('button[name="deinstall"]');
					button.innerHTML		= 'Install';
					button.dataset.action	= 'steam:workshop:install';
					button.classList.remove('loading');
					button.setAttribute('name', 'install');
				break;
			}
		});
		
		IPC.on('steam:workshop:list', function(event, data) {
			var content				= document.querySelector('section-content');
			content.innerHTML		= '';
			var pages	= data.pages;
			var total	= data.total;
			var page	= data.page;
			var entries	= data.entries;
			
			_pagination.setPage(page);
			_pagination.setPages(pages);
			_pagination.setTotal(total);
			_pagination.render();
			
			console.log(data);
			if(entries != null) {
				entries.forEach(function(entrie) {
					try {
						var html = document.createElement('mod-entrie');
					
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
						html.setAttribute('id',  'MOD' + entrie.publishedfileid);
						var left	= '<img src="' + entrie.preview_url + '" alt="Preview" /><mod-content><h1>' + entrie.title + '</h1><small>' + entrie.description.plain + '</small></mod-content>';
						var right	= '<mod-rating><rating-star style="width: ' + (entrie.vote_data.score * 10) + '%;"></rating-star></mod-rating>';
						
						right += '<button name="details" data-action="steam:workshop:details" value="' + entrie.publishedfileid + '">Details</button>';
						
						if(this.isInstalled(parseInt(entrie.publishedfileid, 10))) {
							right += '<button name="deinstall" data-action="steam:workshop:deinstall" value="' + entrie.publishedfileid + '">Deinstall</button>';
						} else {
							right += '<button name="install" data-action="steam:workshop:install" value="' + entrie.publishedfileid + '">Install</button>';
						}
						
						html.innerHTML = '<mod-left>' + left  + '</mod-left><mod-right>' + right + '</mod-right>';
						
						content.appendChild(html);
					} catch(e) {
						console.warn('Failed to load Workshop-Entrie', entrie, e);
						/* Do Nothing*/
					}
				}.bind(this));
			}
			
			this.setLoadingIndicator(false);
		}.bind(this));			
	};
	
	this.isInstalled = function isInstalled(id) {
		return (typeof(DSTEd.projects['workshop-' + id]) != 'undefined');
	};
	
	this.setLoadingIndicator = function setLoadingIndicator(state) {
		_body.dataset.loading = state;
	};
	
	this.onClick = function onClick(page) {
		this.setLoadingIndicator(true);
		IPC.send('steam:workshop:search', {
			query:	document.querySelector('input[name="query"]').value,
			page:	page
		});
	};
	
	this.init();
}());