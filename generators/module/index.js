const Yeoman = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const mkdirp = require('mkdirp');
const createNames = require('../../shared-helpers/create-names');
const isValidJSON = require('../../shared-helpers/is-valid-json');

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
    this.log(yosay(`${chalk.red('React Native')} Module generator`));

    const { moduleName, persistValue } = await this.prompt([{
      type: 'input',
      name: 'moduleName',
      message: 'Name this module:',
    }, {
      type: 'confirm',
      name: 'persistValue',
      message: 'Persist module data between sessions on device?',
      default: false,
    }]);

    this.props = {
      moduleName: createNames(ACTION_PREFIXES)(moduleName),
      persistValue,
    };
  }

  write () {
    const { moduleName } = this.props;

    // Copy Template files
    this._copyTemplateFiles(this.props);

    // Add the module constants/index.js
    this._updateConstantsIndexFile(moduleName);

    // Add the module to modules/index.js
    this._updateActionsIndexFile(moduleName);

    // Add the reducer to reducers/index.js
    this._updateReducersIndexFile(this.props);
  }

  _copyTemplateFiles (props) {
    const destination = this.destinationPath(`./src/modules/${props.moduleName.kebabCase}/`);

    // Copy the template files
    this.fs.copyTpl(
      this.templatePath('./*'),
      destination,
      props,
    );

    // Make the components directory
    mkdirp(`${destination}components`);
  }

  _updateConstantsIndexFile (moduleName) {
    this._updateDestinationFile(
      './src/constants/index.js',
      {
        hook: yoemanHook('constantExport'),
        content: `export { ${moduleName.const}_CONSTANTS } from 'modules/${moduleName.kebabCase}';`,
      },
    );
  }

  _updateActionsIndexFile (moduleName) {
    this._updateDestinationFile(
      './src/actions/index.js',
      {
        hook: yoemanHook('actionsExport'),
        content: `export { ${moduleName.camelCase}Actions } from 'modules/${moduleName.kebabCase}';`,
      },
    );
  }

  _updateReducersIndexFile ({ moduleName, persistValue }) {
    // Add the reducer import
    this._updateDestinationFile(
      './src/reducers/index.js',
      {
        hook: yoemanHook('reducerImport'),
        content: `import { ${moduleName.camelCase}Reducers } from 'modules/${moduleName.kebabCase}';`,
      },
    );

    // Register the reducer
    this._updateDestinationFile(
      './src/reducers/index.js',
      {
        hook: yoemanHook('reducerList'),
        content: `\t${moduleName.camelCase}: ${moduleName.camelCase}Reducers,`,
      },
    );

    // Register the reducer
    this._updateDestinationFile(
      './src/reducers/index.js',
      {
        hook: yoemanHook('reducerPersist'),
        content: `\t${moduleName.camelCase}: ${String(persistValue)},`,
      },
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
};
