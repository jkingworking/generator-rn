<% if(componentType !== 'module') { %>
var wsPackage = require('../package.json');
var packageName = wsPackage.name.replace('@snapk/', '');
<% } %>
module.exports = {
	'input': 'src/css/styles.css',
	'output': 'lib/styles.css',
	'use': [
		'postcss-import',
		'postcss-mixins',
		'postcss-custom-properties',
		'postcss-nesting',
		<% if(componentType !== 'module') { %>
		'postcss-prefix-selector',
		<% } %>
	],
	'local-plugins': true,
	'postcss-mixins': {
		'mixinsDir': 'node_modules/@snapk/web-style-library/mixins/partials/'
	},
	<% if(componentType !== 'module') { %>
	'postcss-prefix-selector': {
		'prefix': '.' + packageName + ' ',
		'exclude': [new RegExp('.' + packageName + '(.*)')]
	}
	<% } %>
}