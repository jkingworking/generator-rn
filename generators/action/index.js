const Yeoman = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const ejs = require('ejs');
const createNames = require('../../shared-helpers/create-names');
const isValidJSON = require('../../shared-helpers/is-valid-json');
const findModules = require('../../shared-helpers/find-modules');

const yoemanHook = hook => `/* =- yoemanHook:${hook} -= */`;
const ACTION_PREFIXES = [ 'get', 'set' ];

module.exports = class extends Yeoman {
  constructor (args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    this.option('babel'); // This method adds support for a `--babel` flag
  }

  async prompting () {
    // Have Yeoman greet the user.
    this.log(yosay(`${chalk.red('React Native')} Action / Reducer generator`));
    this.dirRoot = './src/';
    let stripPrefix = false;
    let module;
    let reducerValue;
    let persistValue;

    const { actionName, putInModule } = await this.prompt([
      {
        type: 'input',
        name: 'actionName',
        message: 'Name this action:',
      },
      {
        type: 'confirm',
        name: 'putInModule',
        message: 'Add this action to a module:',
        default: false,
      },
    ]);

    if (putInModule) {
      const moduleList = await findModules.call(this);
      const modulePrompt = await this.prompt([
        {
          type: 'list',
          name: 'module',
          message: `Which module:`,
          choices: moduleList,
        },
      ]);
      module = modulePrompt.module;
      this.dirRoot = `./src/modules/${module}/`;
    }

    const { asyncAction, createReducer } = await this.prompt([
      {
        type: 'confirm',
        name: 'asyncAction',
        message: 'Will it be an async action, i.e. making http requests?',
        default: false,
      }, {
        type: 'confirm',
        name: 'createReducer',
        message: 'Do you want a reducer for this action?',
        default: true,
      },
    ]);

    if (createReducer) {
      if (!putInModule) {
        const persist = await this.prompt({
          type: 'confirm',
          name: 'persistValue',
          message: 'Persist value between sessions on device?',
          default: false,
        });
        persistValue = persist.persistValue;
      }

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
      putInModule,
      module,
      asyncAction,
      createReducer,
      persistValue: persistValue || false,
      reducerValue: reducerValue || null,
    };
  }

  write () {
    const { actionName, asyncAction, createReducer, putInModule } = this.props;

    // Add the action constant to constants/index.js
    this._updateConstantsIndexFile(actionName, asyncAction, putInModule
      ? 'constants.js'
      : 'constants/index.js',
    );

    // For actions going into modules we need a different create process
    if (putInModule) {
      // Add the action to actions.js
      this._updateModuleActionsFile(this.props);

      // Add the reducer to reducers.js
      if (createReducer) {
        this._updateModuleReducersFile(this.props);
      }

    } else {
      // Add the action to actions/index.js
      this._updateActionsIndexFile(actionName);

      // Copy Action Template
      this._copyActionTemplateFiles(asyncAction, this.props);

      if (createReducer) {
        // Add the reducer to reducers/index.js
        this._updateReducersIndexFile(actionName, this.props);

        // Copy Reducer Template
        this._copyReducerTemplateFiles(asyncAction, this.props);
      }
    }
  }

  _updateConstantsIndexFile (actionName, asyncAction, file) {
    const content = asyncAction
      ? `export const ${actionName.const} = {\n\tERROR: '${actionName.const}:ERROR',\n\tIN_PROGRESS: '${actionName.const}:IN_PROGRESS',\n\tSUCCESS: '${actionName.const}:SUCCESS'\n};`
      : `export const ${actionName.const} = '${actionName.const}';`;

    this._updateDestinationFile(
      this.dirRoot + file,
      {
        hook: yoemanHook('constantExport'),
        content,
      },
    );
  }

  _updateModuleActionsFile (props) {
    const destActionsFile = this.destinationPath(this.dirRoot + 'actions.js');

    // Updated the imports in the Actions file
    this._updateDestinationFileImports(destActionsFile, [
      {
        imports: [
          props.actionName.const,
          'ASYNC_STATUSES',
        ],
        from: './constants',
      },
      {
        imports: 'fetch',
        from: 'src/core/fetch',
      },
    ]);

    // Copy the new action
    const actionTemplateFile = this.templatePath('module-templates/' + (props.asyncAction
        ? 'action-async.js'
        : 'action.js'
    ));
    const actionsTmpl = this.fs.read(actionTemplateFile);
    const actionRendered = ejs.render(actionsTmpl, props);

    this.fs.append(
      destActionsFile,
      `${actionRendered}\n`,
    );
  }

  _updateModuleReducersFile (props) {
    const destActionsFile = this.destinationPath(this.dirRoot + 'reducers.js');

    // Updated the imports in the Actions file
    this._updateDestinationFileImports(destActionsFile, [
      {
        imports: [
          props.actionName.const,
        ],
        from: './constants',
      },
      {
        imports: props.asyncAction
          ? [ 'ASYNC_STATUSES', 'RESET_APP' ]
          : [ 'RESET_APP' ],
        from: 'src/constants/index',
      },
    ]);

    // Copy the new reduce into reducers file
    const actionTemplateFile = this.templatePath('module-templates/' + (props.asyncAction
        ? 'reducer-async.js'
        : 'reducer.js'
    ));
    const actionsTmpl = this.fs.read(actionTemplateFile);
    const actionRendered = ejs.render(actionsTmpl, props);

    const destFileData = this.fs.read(destActionsFile);
    const moduleExpStr = 'export default combineReducers';
    let updatedFile = destFileData.replace(moduleExpStr, `${actionRendered}\n${moduleExpStr}`);

    // update combined reducers
    const importPattern = /export default combineReducers\({([^}]+)}\)/i;
    const reducersParts = updatedFile.match(importPattern);
    if (reducersParts) {
      const reducersList = [
        ...reducersParts[ 1 ].split(',').map(r => r.trim()),
        props.actionName.reducerName,
      ];
      const list = new Set([ ...reducersList ]);
      updatedFile = updatedFile.replace(importPattern, `export default combineReducers({\n  ${[ ...list ].sort().join(',\n  ')}\n})`);
    }

    this.fs.write(
      destActionsFile,
      updatedFile,
    );
  }

  _updateActionsIndexFile (actionName) {
    this._updateDestinationFile(
      './src/actions/index.js',
      {
        hook: yoemanHook('actionsExport'),
        content: `export ${actionName.camelCase} from './${actionName.kebabCase}';`,
      },
    );
  }

  _updateReducersIndexFile (actionName, { persistValue }) {
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
        hook: yoemanHook('reducerList'),
        content: `\t${actionName.reducerName},`,
      },
    );

    // Register the reducer
    this._updateDestinationFile(
      './src/reducers/index.js',
      {
        hook: yoemanHook('reducerPersist'),
        content: `\t${actionName.reducerName}: ${String(persistValue)},`,
      },
    );

  }

  _copyActionTemplateFiles (asyncAction = false, props = {}) {
    // Copy the correct template and populate with data
    this.fs.copyTpl(
      this.templatePath(asyncAction ? 'action-async.js' : 'action.js'),
      this.destinationPath('./src/actions/' + props.actionName.kebabCase + '.js'),
      props,
    );
  }

  _copyReducerTemplateFiles (asyncAction = false, props = {}) {
    const { reducerName, actionName } = props;
    // Copy the correct template and populate with data
    this.fs.copyTpl(
      this.templatePath(asyncAction ? 'reducer-async.js' : 'reducer.js'),
      this.destinationPath('./src/reducers/' + (reducerName || actionName.kebabCase) + '.js'),
      props,
    );
  }

  _updateDestinationFile (filePath, options) {
    // Set the default options
    const { hook, placement, content } = {
      hook: '',
      placement: 'after',
      content: '',
      ...options,
    };
    const destinationFilePath = this.destinationPath(filePath);
    const file = this.fs.read(destinationFilePath);
    const updatedFile = file.replace(hook,
      placement === 'before'
        ? `${content}\n${hook}`
        : `${hook}\n${content}`,
    );
    this.fs.write(destinationFilePath, updatedFile);
  }

  _updateDestinationFileImports (filePath, imports = []) {
    let fileData = this.fs.read(filePath);

    imports.map(importItm => {
      if (Array.isArray(importItm.imports)) {
        // Update deconstructed imports
        const importPattern = new RegExp(`import[\\s]*{([^}]+)}[\\s]*from[\\s]*['|"]${importItm.from}['|"]`);
        const importResults = fileData.match(importPattern);

        // When there is already a destructured import
        if (importResults) {
          const importItems = importResults[ 1 ]
          .split(',')
          .map(imp => imp.trim());

          const importItemsUpdated = new Set([
            ...importItems,
            ...importItm.imports,
          ]);

          fileData = fileData.replace(importPattern, `import { ${[ ...importItemsUpdated ].sort().join(', ')} } from '${importItm.from}'`);
        } else {
          fileData = `import { ${importItm.imports.join(', ')} } from '${importItm.from}';\n${fileData}`;
        }

      } else {
        // Update simple import
        const importPattern = new RegExp(`import[\\s]*${importItm.imports}[\\s]*from[\\s]*['|"]${importItm.from}['|"]`);
        if (!fileData.match(importPattern)) {
          fileData = `import ${importItm.imports} from '${importItm.from}';\n${fileData}`;
        }
      }
    });

    this.fs.write(filePath, fileData);
  }
};
