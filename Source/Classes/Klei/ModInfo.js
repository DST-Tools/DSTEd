module.exports = (function ModInfo() {
	var _change_callback	= null;
	var _sections			= [{
		name:		'api_version',
		label:		I18N.__('API-Version'),
		type:		'version',
		versions:	[{
			name:	'Don\'t Starve Together',
			value:	10
		}, {
			name:	'Don\'t Starve',
			value:	6
		}, {
			name:	'Unknown',
			value:	0
		}]
	}, {
		name:	'name',
		label:	I18N.__('Name'),
		type:	'string'
	}, {
		name:	'description',
		label:	I18N.__('Description'),
		type:	'text'
	}, {
		name:	'author',
		label:	I18N.__('Author'),
		type:	'string'
	}, {
		name:	'version',
		label:	I18N.__('Version'),
		type:	'string'
	}, {
		name:	'priority',
		label:	I18N.__('Priority'),
		type:	'number'
	}, {
		name:	'forumthread',
		label:	I18N.__('Forum (Thread)'),
		type:	'string'
	}, {
		name:	'compatiblity',
		label:	I18N.__('Compatiblity'),
		header:	true,
		type:	'list',
		values:	[{
			name:	'dont_starve_compatible',
			label:	I18N.__('Don\'t Starve'),
			type:	'boolean'
		}, {
			name:	'reign_of_giants_compatible',
			label:	I18N.__('Reign of Giants'),
			type:	'boolean'
		}, {
			name:	'dst_compatible',
			label:	I18N.__('Don\'t Starve Together'),
			type:	'boolean'
		}]
	}, {
		name:	'icon',
		label:	I18N.__('Icon'),
		header:	true,
		development: true,
		type:	'atlas'
	}, {
		name:	'all_clients_require_mod',
		label:	I18N.__('Clients required'),
		type:	'boolean'
	}, {
		name:	'client_only_mod',
		label:	I18N.__('Clients MOD'),
		type:	'boolean'
	}, {
		name:	'server_filter_tags',
		header:	true,
		development: true,
		label:	I18N.__('Tags'),
		type:	'string[]'
	}, {
		name:	'configuration_options',
		header:	true,
		development: true,
		label:	I18N.__('Configuration'),
		type:	'pair',
		fields: [{
			name:	'name',
			type:	'string'
		}, {
			name:	'label',
			type:	'string'
		}, {
			name:		'options',
			type:		'properties',
			properties: [{
				name:	'description',
				type:	'string'
			}, {
				name:	'data',
				type:	'string'			
			}]
		}, {
			name:	'default',
			type:	'propertie'
		}]
	}];
	
	this.create = function create(element, values) {
		element.innerHTML	= this.generateForm(values);
		var elements		= element.querySelectorAll('form-entry input, form-entry textarea, form-entry select');
		
		Array.prototype.forEach.call(elements, function onEntrie(entrie) {
			entrie.addEventListener('change', function onChange(event) {
				if(_change_callback != null) {
					_change_callback(event);
				}
			});
		});
	};
	
	this.onChange = function onChange(callback) {
		_change_callback = callback;
	};
	
	this.generateForm = function generateForm(values) {
		console.log(values);
		var html = '<form-table>';
		
		_sections.forEach(function(section) {
			var section_html	= '<form-entry>';
			var header			= (typeof(section.header) != 'undefined' ? section.header : false);
			var development		= (typeof(section.development) != 'undefined' ? section.development : false);
			
			section_html += '<form-label data-header="' + (header ? 'true' : 'false') + '" data-lang="' + section.name + (header ? '' : ':') + '">' + section.label + (header ? '' : ':') + '</form-label>';
			
			if(header && development) {
				section_html += '<form-label data-header="' + (header ? 'true' : 'false') + '" data-color="info" data-lang="This Section is currently under development.">' + I18N.__('This Section is currently under development.') + '</form-label>';
			}
			
			switch(section.type) {
				case 'text':
					section_html += '<form-input>';
					section_html += '<textarea name="modinfo[' + section.name + ']">' + (typeof(values[section.name]) != 'undefined' && values[section.name] != null ? values[section.name] : '') + '</textarea>';
					section_html += '</form-input>';
				break;
				case 'string':
					section_html += '<form-input>';
					section_html += '<input type="text" name="modinfo[' + section.name + ']" value="' + (typeof(values[section.name]) != 'undefined'  && values[section.name] != null ? values[section.name] : '') + '" />';
					section_html += '</form-input>';
				break;
				case 'number':
					section_html += '<form-input>';
					section_html += '<input type="number" name="modinfo[' + section.name + ']" value="' + (typeof(values[section.name]) != 'undefined' && values[section.name] != null ? values[section.name] : '') + '" />';
					section_html += '</form-input>';
				break;
				case 'boolean':
					var selected = (typeof(values[section.name]) != 'undefined' ? values[section.name] : false);
					
					section_html += '<form-input>';
					section_html += '<select name="modinfo[' + section.name + ']">';
					section_html += '<option value="true"' + (selected ? ' SELECTED' : '') + '>True</option>';
					section_html += '<option value="false"' + (selected ? '' : ' SELECTED') + '>False</option>';
					section_html += '</select>';
					section_html += '</form-input>';
				break;
				case 'list':
					section_html += '</form-entry>';
					section_html += '<form-entry class="indenting">';
					section.values.forEach(function(value) {
						section_html += '<form-entry>';
						section_html += '<form-label data-lang="' + value.label + ':">' + value.label + ':</form-label>';
						section_html += '<form-input>';
						
						switch(value.type) {
							case 'boolean':
								var selected = (typeof(values[value.name]) != 'undefined' ? values[value.name] : false);
								
								section_html += '<select name="modinfo[' + value.name + ']">';
								section_html += '<option value="true"' + (selected ? ' SELECTED' : '') + '>True</option>';
								section_html += '<option value="false"' + (selected ? '' : ' SELECTED') + '>False</option>';
								section_html += '</select>';
							break;
						}
						
						section_html += '</form-entry>';
					});			
				break;
				case 'string[]':
					var array = (typeof(values[section.name]) != 'undefined' && values[section.name] != null ? values[section.name] : []);
					
					section_html += '</form-entry>';
					section_html += '<form-entry class="indenting">';
					
					array.forEach(function(entrie) {
						section_html += '<form-entry>';
						section_html += '<form-label>' + entrie + '</form-label>';
						section_html += '</form-entry>';
					});
				break;
				case 'atlas':
				case 'texture':
				case 'pair':
				break;
				case 'version':
					var version = (typeof(values[section.name]) != 'undefined' && values[section.name] != null ? values[section.name] : 0);
					section_html += '<form-input>';
					section_html += '<select name="modinfo[' + section.name + ']">';
					
					section.versions.forEach(function(entrie) {
						section_html += '<option value="' + entrie.value + '"' + (version == entrie.value ? ' SELECTED' : '') + '>[' + entrie.value + '] ' + entrie.name + '</option>';
					});
					
					section_html += '</select>';
					section_html += '</form-input>';
				break;
			}
			
			section_html += '</form-entry>';
			html += section_html;
		});
		
		return html + '</form-table>';
	};
});