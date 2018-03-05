'use strict';
let yeoman = require('yeoman-generator');
let chalk = require('chalk');
let yosay = require('yosay');
let camelCase = require('lodash.camelcase');
let snakeCase = require('lodash.snakecase');
let kebabCase = require('lodash.kebabcase');
let upperFirst = require('lodash.upperfirst');
let exec = require('child_process').exec;

module.exports = yeoman.Base.extend({
	componentTypeValues: {
		'Javascript': 'js',
		'React': 'jsx',
		'React HOC': 'hoc',
		'Javascript & React Module': 'module'
	},
	componentPrefix: {
		'js': 'pkg ',
		'jsx': 'component ',
		'hoc': 'hoc ',
		'module': 'module '
	},
	prompting: function () {
// Have Yeoman greet the user.
		this.log(yosay(
			'Welcome to the premium ' + chalk.red('web component') + ' generator!'
		));

		let guessedComponentName = this.appname.replace(/snapk|web|pkg|component|hoc/g, '').trim();

		return this.prompt([ {
			type: 'list',
			name: 'componentType',
			message: 'What type of component will this be?',
			choices: Object.keys(this.componentTypeValues)
		} ]).then(function (props) {
			this.props = { componentType: this.componentTypeValues[ props.componentType ] };

			let prefix = 'web ' + (this.componentPrefix[ this.props.componentType ]);

			let prompts = [ {
				type: 'input',
				name: 'componentName',
				message: 'What would you like to call this component? ' + prefix.replace(/ /g, '-'),
				default: guessedComponentName
			}, {
				type: 'input',
				name: 'componentDescription',
				message: 'What is this component for?'
			}, {
				type: 'confirm',
				name: 's3Deploy',
				message: 'Should this dist auto deploy to S3?',
				default: false
			} ];

			return this.prompt(prompts).then(function (props) {
				let snakeCaseName = snakeCase(props.componentName);
// To access props later use this.props.someAnswer;
				this.props = Object.assign({}, this.props, props);
				this.props.componentRepoName = kebabCase(prefix + props.componentName);
				this.props.componentName = {
					packageName: kebabCase(this.componentPrefix[ this.props.componentType ] + props.componentName),
					constCase: snakeCaseName.toUpperCase(),
					snakeCase: snakeCaseName,
					camelCase: camelCase(props.componentName),
					pascalCase: upperFirst(camelCase(props.componentName)),
					kebabCase: kebabCase(props.componentName)
				}
			}.bind(this));
		}.bind(this));
	},

	writing: function () {
		let fileNamePartToReplace;
		let componentFiles;
		let tplVars = {
			componentType: this.props.componentType,
			componentRepoName: this.props.componentRepoName,
			componentName: this.props.componentName,
			componentNameForImport: this.props.componentName.camelCase,
			componentDescription: this.props.componentDescription,
			npmMain: './lib/' + (this.props.componentType === 'hoc' ? 'components/' : '') + this.props.componentName.kebabCase + '.js',
			babelPresets: [ '"es2015"', '"env"', '"stage-0"' ],
			babelPlugins: [],
			s3Deploy: this.props.s3Deploy
		};
		let npmDependencies = {};
		let npmDevDependencies = {
			'babel-cli': '^6.11.4',
			'babel-eslint': '^7.1.0',
			'babel-plugin-rewire': '^1.0.0-rc-6',
			'babel-preset-es2015': '^6.22.0',
			'babel-preset-env': '^1.1.8',
			'babel-preset-stage-0': '^6.5.0',
			'babel-register': '^6.11.6',
			'babel-types': '^6.9.0',
			chai: '^3.5.0',
			happiness: '^7.1.2',
			mocha: '^3.0.2',
			nyc: '^10.0.0',
			'pre-commit': '^1.1.3'
		};
		let npmScripts = {
			test: 'npm run lint; nyc mocha \'src/**/*.test.js\' --require tests/setup.js --compilers js:babel-register',
			lint: 'happiness src/**/*.js, src/**/*.jsx',
			'deploy-major': 'npm test; npm run build; git add -A; git commit -m \'Deploying Major\'; git push; npm version major; npm publish;',
			'deploy-minor': 'npm test; npm run build; git add -A; git commit -m \'Deploying Minor\'; git push; npm version minor; npm publish;',
			'deploy-patch': 'npm test; npm run build; git add -A; git commit -m \'Deploying Patch\'; git push; npm version patch; npm publish;',
			prepublish: 'npm test; npm run build;'
		};

		let postcssDevDeps = {
			'autoprefixer': '^6.5.1',
			'cssnano': '^3.8.0',
			'pixrem': '^3.0.2',
			'postcss': '^5.2.5',
			'postcss-calc': '^5.3.1',
			'postcss-cli': '^2.6.0',
			'postcss-custom-properties': '^5.0.1',
			'postcss-flexbugs-fixes': '^2.0.0',
			'postcss-import': '^9.0.0',
			'postcss-mixins': '^5.4.0',
			'postcss-nesting': '^2.3.1',
			'postcss-prefix-selector': '^1.4.0'
		};

// Things used in react components
		if (this.props.componentType === 'jsx' || this.props.componentType === 'hoc' || this.props.componentType === 'module') {
			tplVars.componentNameForImport = upperFirst(this.props.componentName.camelCase);

			tplVars.babelPresets = tplVars.babelPresets.concat([
				'"react"'
			]);

			tplVars.babelPlugins = tplVars.babelPlugins.concat([
				'"transform-react-jsx"',
				'"transform-runtime"'
			]);

			Object.assign(npmDependencies, {
				react: '^15.3.2',
				'react-dom': '^15.4.0',
				'prop-types': '^15.5.8'
			});

			Object.assign(npmDevDependencies, {
				'git-rev': '^0.2.1',
				'babel-preset-react': '^6.23.0',
				'babel-plugin-transform-react-jsx': '^6.8.0',
				'babel-plugin-transform-runtime': '^6.22.0',
				express: '^4.14.0',
				envify: '^4.0.0',
				babelify: '^7.3.0',
				browserify: '^13.1.0',
				uglifyify: '^3.0.4',
				watchify: '^3.8.0'
			});

			if (this.props.componentType === 'jsx') {
				Object.assign(npmScripts, {
					babel: 'babel src/components --out-dir lib --ignore *.test.js',
					build: 'rm -rf lib; npm run babel; npm run postcss; npm test',
					lint: 'happiness src/**/*.js, src/**/*.jsx',
					postcss: 'postcss -c tools/postcss-config.js',
					prepublish: 'npm test; npm run build;',
					start: 'npm run watch & npm run watchcss',
					'start-linked': 'npm link; npm start',
					test: 'npm run lint; nyc mocha \'src/**/*.test.js\' --require tests/setup.js --compilers js:babel-register',
					watch: 'npm run babel -- -w',
					watchcss: 'npm run postcss -- -w'
				});

				Object.assign(npmDependencies, {
					'@snapk/web-style-library': '^2.10.0'
				});

				Object.assign(npmDevDependencies, postcssDevDeps, {
					'open': '0.0.5'
				});

// React component files
				componentFiles = [
					'./src/components/react-component.tpl.jsx',
					'./src/components/react-component.tpl.test.js',
					'./src/css/index.css',
					'./src/css/styles.css',
					'./tools/postcss-config.js',
					// './src/index.jsx'
				];
				fileNamePartToReplace = 'react-component.tpl';

			} else if (this.props.componentType === 'hoc') {
				Object.assign(npmScripts, {
					start: 'npm run watch',
					'start-linked': 'npm link; npm start',
					babel: 'babel src --out-dir lib --ignore *.test.js --copy-files',
					watch: 'npm run babel -- --watch',
					build: 'rm -rf lib; npm run babel'
				});

// React hoc component files
				componentFiles = [
					'./src/components/react-hoc.tpl.jsx',
					'./src/components/react-hoc.tpl.test.js',
					// './src/index.jsx',
					'./src/constants/index.js',
					'./src/reducers/index.js',
					'./src/actions/index.js'
				];

				fileNamePartToReplace = 'react-hoc.tpl';

			} else if (this.props.componentType === 'module') {
				tplVars.npmMain = './lib/index.js';

				Object.assign(npmScripts, {
					start: 'npm run watch & npm run watchcss',
					'start-linked': 'npm link; npm start',
					watchcss: 'npm run postcss -- -w',
					postcss: 'postcss -c tools/postcss-config.js',
					babel: 'babel src --out-dir lib --ignore *.test.js --copy-files',
					watch: 'npm run babel -- --watch',
					build: 'rm -rf lib; npm run babel; npm run postcss'
				});

				delete npmScripts.dist;
				delete npmScripts.serveBuild;

				Object.assign(npmDependencies, {
					'@snapk/web-style-library': '^2.10.0',
					redux: '^3.4.0',
					'redux-cookie': '^0.5.8',
					'redux-thunk': '^2.1.0',
					'react-redux': '^4.4.5'
				});

				Object.assign(npmDevDependencies, postcssDevDeps, {
					'css-loader': '^0.26.1',
					'json-loader': '^0.5.4'
				});

// Module component files
				componentFiles = [
					'./src/index.js',
					'./src/components/index.js',
					'./src/constants',
					'./src/reducers',
					'./src/actions',
					'./src/css/styles.css',
					'./tools/postcss-config.js'
				];

				fileNamePartToReplace = 'module.tpl';
			}
		} else if (this.props.componentType === 'js') {
			Object.assign(npmScripts, {
				babel: 'babel src --out-dir lib --ignore *.test.js --copy-files',
				build: 'rm -rf lib; npm run babel',
				start: 'npm run watch',
				'start-linked': 'npm link; npm start',
				watch: 'npm run babel -- --watch'
			});

// Vanilla Javascript files
			componentFiles = [
				'./src/component.tpl.js',
				'./src/component.tpl.test.js'
			];

			fileNamePartToReplace = 'component.tpl';
		}

// Things needed for s3 deployment
		if (this.props.s3Deploy) {
			Object.assign(npmScripts, {
				postpublish: 'npm run deploy-s3',
				'deploy-s3': 'node tools/s3-deployer.js'
			});
			Object.assign(npmDevDependencies, {
				's3-deploy': '^0.6.1'
			});
		}

// Stringify the arrays
		for (let i in tplVars) {
			if (Array.isArray(tplVars[ i ])) {
				tplVars[ i ] = tplVars[ i ].join(',\n    ');
			}
		}

// Sort the objects by key
		npmDependencies = Object.keys(npmDependencies).sort().reduce(function (sorted, key) {
			sorted[ key ] = npmDependencies[ key ];
			return sorted;
		}, {});
		npmDevDependencies = Object.keys(npmDevDependencies).sort().reduce(function (sorted, key) {
			sorted[ key ] = npmDevDependencies[ key ];
			return sorted;
		}, {});
		npmScripts = Object.keys(npmScripts).sort().reduce(function (sorted, key) {
			sorted[ key ] = npmScripts[ key ];
			return sorted;
		}, {});

// Add all the modified objects back to the tplVars
		[
			{ name: 'npmDependencies', values: npmDependencies },
			{ name: 'npmDevDependencies', values: npmDevDependencies },
			{ name: 'npmScripts', values: npmScripts }
		].map((object) => {
			tplVars[ object.name ] = JSON.stringify(object.values).replace(/^\{/, '{\n\t').replace(/\}$/, '\n\t}').replace(/\"\,/g, '",\n\t');
		});

		/**
		 *
		 * Copy the template files
		 *
		 */
		componentFiles.map(function (fileLoc) {
			this.fs.copyTpl(
				this.templatePath(fileLoc),
				this.destinationPath(fileLoc.replace(fileNamePartToReplace, this.props.componentName.kebabCase)),
				tplVars
			);
		}.bind(this));

// Copy the S3 Deploy scripts
		if (this.props.s3Deploy) {
			let deployScript = './tools/s3-deployer.js';
			this.fs.copy(
				this.templatePath(deployScript),
				this.destinationPath(deployScript),
				tplVars
			);
		}

// Copying the json and md files
		this.fs.copyTpl(
			this.templatePath('./**/*.{json,md}'),
			this.destinationPath('./'),
			tplVars
		);

// Copying the test files
		this.fs.copy(
			this.templatePath('./tests/**/*'),
			this.destinationPath('./tests'),
			tplVars
		);

// All files that should start with a '.'
// Copy the .dot files
		let dotFiles = [
			'_gitignore.dot',
			'_npmignore.dot'
		];

		dotFiles.map(function (file) {
			this.fs.copy(
				this.templatePath(file),
				this.destinationPath(file.replace('_', '.').replace('.dot', ''))
			);
		}.bind(this));
	},

	install: function () {
// Set up the git repo
		exec('git init; git remote add origin git@github.com:Snapkitchen/' + this.props.componentRepoName + '.git; git add -A; git commit -m "initial commit";');

		this.installDependencies({
			bower: false
		});
	}
});
