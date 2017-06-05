exports = module.exports = (function LUA() {
	const _file_system = require('fs');
	
	this.parseFile = function parseFile(file, options) {
		console.info('[LUA] Parse File: ', file);
		
		return this.parseContent(_file_system.readFileSync(file, 'utf8'), options);
	};
	
	this.parseContent = function parseContent(content, options) {
		console.info('[LUA] Parse Content');
		
		return (new function Context(content) {
			let _content	= content;
			let _variables	= [];
			var _lines		= _content.replace(/\r\n/gi, '\n').split('\n');
			let _data		= [];
			let _position	= 0;
			let _size		= _lines.length;
			let _options	= options || {
				strings:	true,
				comments:	true,
				integers:	true,
				floats:		true,
				booleans:	true
			};
			
			this.parse = function parse() {
				let data		= [];
				
				do {
					let line	= _lines[_position];
					let parts	= line.split('=');
					
					parts[0] = parts[0].trim();
					
					if(typeof(parts[1]) != 'undefined') {
						parts[1] = parts[1].trim();
					}
					
					/* Parse Comments */
					if(parts[0].substr(0, 3) == '-- ') {
						if(_options.comments) {
							data.push({
								type:	'Comment',
								line:	_position,
								value:	parts[0].substr(3)
							});
						}
						
						++_position;
						continue;
					}
					
					/* Opened Bracked */
					/*if(parts[0].substr(0, 1) == '{') {
						++_position;
						continue;
					}*/
					
					/* Closed Bracked */
					/*if(parts[0].substr(0, 1) == '}') {
						++_position;
						continue;
					}*/
					
					/* Continue empty lines */
					if(parts[0].length == 0) {
						++_position;
						continue;
					}
					
					if(typeof(parts[1]) != 'undefined') {
						/* Is String */
						if(parts[1].charAt(0) == '"' && parts[1].charAt(parts[1].length - 1) == '"') {
							if(_options.strings) {
								data.push({
									type:	'String',
									line:	_position,
									name:	parts[0],
									value:	parts[1].substr(1, parts[1].length - 2)
								});
							}
							
							++_position;
							continue;
							
						/* Is Boolean */
						} else if([ 'true', 'false' ].indexOf(parts[1].toLowerCase()) > -1) {
							if(_options.booleans) {
								data.push({
									type:	'Boolean',
									line:	_position,
									name:	parts[0],
									value:	(parts[1] === 'true')
								});
							}
							
							++_position;
							continue;
							
						/* Is Integer */
						} else if(this._isInteger(parts[1])) {
							if(_options.integers) {
								data.push({
									type:	'Integer',
									line:	_position,
									name:	parts[0],
									value:	parseInt(parts[1], 10)
								});
							}
							
							++_position;
							continue;
							
						/* Is Float */
						} else if(this._isFloat(parts[1])) {
							if(_options.floats) {
								data.push({
									type:	'Float',
									line:	_position,
									name:	parts[0],
									value:	parseFloat(parts[1], 10)
								});
							}
							
							++_position;
							continue;
						
						/* Has Brackets */
						} else if(parts[1].charAt(0) == '{') {
							let has_end = false;
							
							/*
							if(parts[1].charAt(parts[1].length - 1) == '}') {
								has_end	= true;
								parts[1]	= parts[1].substr(0, parts[1].length - 1);
							}
							
							this._parseBrackets(parts[1].substr(1, parts[1].length), has_end);*/
							++_position;
							continue;
							
						}
					}
					
					++_position;
				} while(_position < _size);
				
				return data;
			};
			
			this._isInteger = function _isInteger(number) {
				return /^-?[0-9]+$/.test(number);
			};

			this._isFloat = function _isFloat(number){
				return /^[\d.]+$/.test(number);
			};
			
			this._parseBrackets = function _parseBrackets(content, has_end) {
				if(has_end) {
					this._parseBracketsContent(content);
					return;
				}
				
				/* Parse the End */
				do {
					if(content.indexOf('}') > -1) {
						break;
					}
					
					++_position;
				} while(_position < _size);
			};
			
			this._parseBracketsContent = function _parseBracketsContent(content) {
				
			};
			
			this.getVariables = function getVariables() {
				return _data;
			};
			
			_data = this.parse();
		}(content));
	};
	
	return this;
});