const Yeoman = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const createNames = require('../../shared-helpers/create-names');
const isValidJSON = require('../../shared-helpers/is-valid-json');

const yoemanHook = hook => `/* =- yoemanHook:${hook} -= */`;
const ACTION_PREFIXES = [ 'get', 'set' ];

module.exports = class extends Yeoman {
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    this.option('babel'); // This method adds support for a `--babel` flag
  }

  async prompting() {
		// Have Yeoman greet the user.
    this.log(yosay(`${chalk.red('React Native')} Action / Reducer generator`));

    let stripPrefix = false;
    let reducerValue;

    const { actionName } = await this.prompt({
      type: 'input',
      name: 'actionName',
      message: 'Name this action:',
    });

    const { asyncAction, createReducer } = await this.prompt([{
      type: 'confirm',
      name: 'asyncAction',
      message: 'Will it be an async action, i.e. making http requests?',
      default: false,
    }, {
      type: 'confirm',
      name: 'createReducer',
      message: 'Do you want a reducer for this action?',
      default: true,
    }]);

    if (createReducer) {
      // if the action starts with get or set the search will return an index of 0 other wise it'll be -1 or > 0.
      if (!actionName.search(RegExp(ACTION_PREFIXES.join('|'), 'i'))) {
        const stripPrefixPrompt = await this.prompt({
          type: 'confirm',
          name: 'stripPrefix',
          message: `Strip prefixes ${chalk.gray(`(${ACTION_PREFIXES.join('|')})`)} from reducer name:`,
          default: true,
        });
        stripPrefix = stripPrefixPrompt.stripPrefix;
      }

      const reducerValuePrompt = await this.prompt({
        type: 'input',
        name: 'reducerValue',
        message: `Default value for this reducer\n${chalk.gray(`  (usually ${chalk.white(`''`)}, ${chalk.white(`false`)}, ${chalk.white(`[]`)}, or ${chalk.white(`{}`)})`)}\n:`,
        filter: value => isValidJSON(value) ? value : `'${value}'`,
        default: false,
      });
      reducerValue = reducerValuePrompt.reducerValue;
    }

		this.props = {
			actionName: createNames(ACTION_PREFIXES)(actionName, stripPrefix),
      asyncAction,
			createReducer,
      reducerValue: reducerValue || null,
		};
	}

	echo() {
		this.log(JSON.stringify(this.props));
  }

  write() {
    const { actionName, asyncAction, createReducer } = this.props;

    // Add the action constant to constants/index.js
    this._updateConstantsIndexFile(actionName);

    // Add the action to actions/index.js
    this._updateActionsIndexFile(actionName);

    // Copy Action Template
    this._copyActionTemplateFiles(asyncAction, this.props);

    if (createReducer) {
      // Add the reducer to reducers/index.js
      this._updateReducersIndexFile(actionName);

      // Copy Reducer Template
      this._copyReducerTemplateFiles(asyncAction, this.props);
    }
  }

  _updateConstantsIndexFile (actionName) {
    this._updateDestinationFile(
      './src/constants/index.js',
      {
        hook: yoemanHook('constantExport'),
        content: `export const ${actionName.const} = '${actionName.const}';`,
      },
    );
  }

  _updateActionsIndexFile(actionName){
    this._updateDestinationFile(
      './src/actions/index.js',
      {
        hook: yoemanHook('actionsExport'),
        content: `export ${actionName.camelCase} from './${actionName.kebabCase}';`,
      },
    );
  }

  _updateReducersIndexFile(actionName){
    // Add the reducer import
    this._updateDestinationFile(
      './src/reducers/index.js',
      {
        hook: yoemanHook('reducerImport'),
        content: `import ${actionName.reducerName} from './${actionName.kebabCase}';`,
      },
    );

    // Register the reducer
    this._updateDestinationFile(
      './src/reducers/index.js',
      {
        hook: yoemanHook('reducerExport'),
        content: `\t${actionName.reducerName},`,
      },
    );
  }

  _copyActionTemplateFiles(asyncAction = false, props = {}){
    // Copy the correct template and populate with data
    this.fs.copyTpl(
      this.templatePath(asyncAction ? 'action-async.js' : 'action.js'),
      this.destinationPath('./src/actions/' + props.actionName.kebabCase + '.js'),
      props
    );
  }

  _copyReducerTemplateFiles(asyncAction = false, props = {}){
    // Copy the correct template and populate with data
    this.fs.copyTpl(
      this.templatePath(asyncAction ? 'reducer-async.js' : 'reducer.js'),
      this.destinationPath('./src/reducers/' + props.actionName.kebabCase + '.js'),
      props
    );
  }

  _updateDestinationFile(filePath, options){
    // Set the default options
    const {hook, placement, content} = {
      hook: '',
      placement: 'after',
      content: '',
      ...options
    };
    const destinationFilePath = this.destinationPath(filePath);
    const file = this.fs.read(destinationFilePath);
    const updatedFile = file.replace(hook,
      placement === 'before'
        ? `${content}\n${hook}`
        : `${hook}\n${content}`
    );
    this.fs.write(destinationFilePath, updatedFile);
  }

  _writing() {
		let packagePath = this.destinationPath('./package.json');
		let packageData = require(packagePath);
		let constantPrefix = packageData.constantPrefix;
		let actionsIndexFilePath = this.destinationPath('./src/actions/index.js');
		let actionsIndexFile = this.fs.read(actionsIndexFilePath);
		let constFilePath = this.destinationPath('./src/constants/index.js');
		let constFile = this.fs.read(constFilePath);
		let yeomanConstantListHook = '/* =- yoemanHook:constantList -= */';

		const { asyncAction, actionName } = this.props;

		// Verify this const name is unique
		if (constFile.indexOf(actionName.const) !== -1 ||
			constFile.indexOf(actionName.const + '_ERROR') !== -1 ||
			constFile.indexOf(actionName.const + '_STATUS') !== -1) {
			throw('Sorry, the const "' + actionName.const + '" already exists.');
		}

		// Add this action to the const file.
		constFile = updateConstFile(constFile, actionName.const, constantPrefix);

		// If this is an asyn action
		if (asyncAction) {
			constFile = updateConstFile(constFile, actionName.const + '_ERROR', constantPrefix);
			constFile = updateConstFile(constFile, actionName.const + '_STATUS', constantPrefix);

			// if this service doesn't have ASYNC_STATUSES add them
			if (constFile.indexOf('ASYNC_STATUSES') === -1) {
				constFile = 'export const ASYNC_STATUSES = { DEFAULT: \'DEFAULT\', ERROR: \'ERROR\', SUCCESS: \'SUCCESS\', IN_PROGRESS: \'IN_PROGRESS\' };\n' + constFile;
			}
		}

		// Save the new const
		this.fs.write(constFilePath, constFile);

		let template = (asyncAction) ? 'action-async.js' : 'action.js';
		let templateData = {
			...this.props,
			actionName,
			constantPrefix,
			constantName: constantPrefix.substr(0, constantPrefix.length - 1),
		};

		// Copy over the correct action template
		this.fs.copyTpl(
			this.templatePath(template),
			this.destinationPath('./src/actions/' + actionName.kebabCase + '.js'),
			templateData
		);

		// Write the action into the actions index file as an export so it can be consumed.
		actionsIndexFile = `export ${templateData.actionName.camelCase} from './${templateData.actionName.kebabCase}';\n${actionsIndexFile}`;
		this.fs.write(actionsIndexFilePath, actionsIndexFile);

		// Copy the reducer if that's needed
		if (this.props.createReducer) {
			let createReducerFilePath = this.destinationPath('./src/reducers/index.js');
			let createReducerFile = this.fs.read(createReducerFilePath);

			// Copy the reducer file
			this.fs.copyTpl(
				this.templatePath('./reducer.js'),
				this.destinationPath('./src/reducers/' + actionName.kebabCase + '.js'),
				templateData
			);

			// Adds the reducer import statement
			createReducerFile = updateReducerFile(createReducerFile, actionName, constantPrefix);

			if (asyncAction) {
				// Copy the reducer status file
				let statusActionName = createNames(actionName.camelCase + 'Status');
				this.fs.copyTpl(
					this.templatePath('./reducer-status.js'),
					this.destinationPath('./src/reducers/' + actionName.kebabCase + '-status.js'),
					Object.assign({}, templateData, { actionName: statusActionName })
				);
				createReducerFile = updateReducerFile(createReducerFile, statusActionName, constantPrefix);

				let errorActionName = createNames(actionName.camelCase + 'Error');
				// Create and error reducer file when needed
				this.fs.copyTpl(
					this.templatePath('./reducer.js'),
					this.destinationPath('./src/reducers/' + actionName.kebabCase + '-error.js'),
					Object.assign({}, templateData, { actionName: errorActionName, reducerValue: "''" })
				);

				// Adds the reducer import statement
				createReducerFile = updateReducerFile(createReducerFile, errorActionName, constantPrefix);
			}

			this.fs.write(createReducerFilePath, createReducerFile);
		}

	}

};
