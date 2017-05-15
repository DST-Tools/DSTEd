module.exports = (function Editor() {
	var _element	= null;
	
	this.init = function init(code, language) {
		var editors			= document.querySelector('code-editors');
		_element			= document.createElement('code-editor');
		_element.id			= 'test';
		_element.innerHTML	= '';
		
		editors.appendChild(_element);
		
		

		var editor = monaco.editor.create(_element, {
			value:		code,
			language:	language,
			lineNumbers: true,
			automaticLayout: true,
			roundedSelection: true,
			scrollBeyondLastLine: false,
			readOnly: false,
			theme: "vs-dark",
		});
	};
});