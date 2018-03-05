let yeoman = require('yeoman-generator');
let chalk = require('chalk');
let yosay = require('yosay');
let camelCase = require('lodash.camelcase');
let snakeCase = require('lodash.snakecase');
let kebabCase = require('lodash.kebabcase');
let upperFirst = require('lodash.upperfirst');

module.exports = yeoman.Base.extend({
	prompting: async function () {
		// Have Yeoman greet the user.
		this.log(yosay(
			chalk.red('generator-web-component') + ' react component generator',
		));

		let prompts = [ {
			type: 'input',
			name: 'componentName',
			message: 'Name this component:',
		}, {
			type: 'confirm',
			name: 'statelessComponent',
			message: 'Will this be a stateless component?',
			default: true,
		}, {
			type: 'confirm',
			name: 'connectToRedux',
			message: 'Connect this component to redux?',
			default: false,
		} ];

		const props = await this.prompt(prompts);

		// To access props later use this.props.someAnswer;
		return this.props = {
			...props,
			componentName: createNames(props.componentName),
		}
	},

	writing: function () {
		const { statelessComponent, componentName: {kebabCase} } = this.props;
		const templateData = this.props;
		const template = statelessComponent
			? './.component.stateless.js'
			: './.component.js';

		// Make sure a component with that name doesn't exist
		if (this.fs.exists(this.destinationPath('./src/components/' + kebabCase + '/package.json'))) {
			throw('A component named "' + kebabCase + '" already exists.');
		}

		// Copy over the correct component template
		this.fs.copyTpl(
			this.templatePath(template),
			this.destinationPath('./src/components/' + kebabCase + '/' + kebabCase + '.js'),
			templateData,
		);

		// Copy the component test file
		this.fs.copyTpl(
			this.templatePath('./.test.js'),
			this.destinationPath('./src/components/' + kebabCase + '/' + kebabCase + '.test.js'),
			templateData,
		);

		// Copy the package and css files
		this.fs.copyTpl(
			this.templatePath('./**/*.{js,json,css}'),
			this.destinationPath('./src/components/' + kebabCase + '/'),
			templateData,
		);
	},
});

function createNames (name) {
	name = name.trim();
	return {
		camelCase: setCase(name, 'camelCase'),
		kebabCase: setCase(name, 'kebabCase'),
		kebabCapCase: setCase(name, 'kebabCapCase'),
		pascalCase: setCase(name, 'pascalCase'),
	}
}

function setCase (input, userCase) {
	switch (userCase) {
		case 'const' :
			return snakeCase(input).toUpperCase();
		case 'camelCase' :
			return camelCase(input);
		case 'kebabCase' :
			return kebabCase(input);
		case 'kebabCapCase' :
			return upperFirst(kebabCase(input));
		case 'pascalCase' :
			return upperFirst(camelCase(input));
	}
}
