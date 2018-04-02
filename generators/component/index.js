const Yeoman = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const fs = require('fs');
const createNames = require('../../shared-helpers/create-names');
const findModules = require('../../shared-helpers/find-modules');
const { camelCase } = require('lodash');

module.exports = class extends Yeoman {
  constructor (args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    this.option('babel'); // This method adds support for a `--babel` flag
  }

  async prompting () {
    // Have Yeoman greet the user.
    this.log(yosay(`Welcome to the ${chalk.red('React Native')} component generator`));

    this.componentRoot = './src/components';

    // Prompt for the component name it's awaited because we need it in the next step
    const { componentNameRaw, putInModule } = await this.prompt([
      {
        type: 'input',
        name: 'componentNameRaw',
        message: 'Name this component:',
        validate: componentNameRaw => !!componentNameRaw,
      },
      {
        type: 'confirm',
        name: 'putInModule',
        message: 'Add this component to a module:',
        default: false
      },
    ]);

    if (putInModule) {
      const moduleList = await findModules.call(this);

      const { dirRoot } = await this.prompt([
        {
          type: 'list',
          name: 'dirRoot',
          message: `Which module:`,
          choices: moduleList
        }
      ]);

      this.componentRoot = `./src/modules/${dirRoot}/components`;
    }

    const componentName = createNames()(componentNameRaw);

    const hasCollision = this._doesComponentExist(componentName);

    if (hasCollision) {
      this.log(chalk.red(`\n*Error: a component named '${componentName.pascalCase}' already exists.\n`));
    }

    const promptAnswers = hasCollision
      ? {
        pureComponent: false,
        connectToRedux: false,
        componentProps: '',
      }
      : await this.prompt([ {
        type: 'confirm',
        name: 'pureComponent',
        message: 'Will this be a pure component?',
        default: true,
      }, {
        type: 'confirm',
        name: 'connectToRedux',
        message: 'Connect this component to redux?',
        default: false,
      }, {
        type: 'input',
        name: 'componentProps',
        message: `Initial component props (',' or ' ' separated) ${chalk.gray(`\nAll propTypes will be set as 'string'\n`)}:`,
      } ]);

    // To access props later use this.props;
    this.props = {
      ...promptAnswers,
      componentName,
      componentProps: promptAnswers.componentProps
      .replace(',', ' ')
      .split(' ')
      .filter(Boolean)
      .map(prop => camelCase(prop).trim()),
      hasCollision,
    };
  }

  writing () {
    const { componentName, hasCollision } = this.props;
    if (hasCollision) { return; }
    const folder = componentName.pascalCase;

    fs.readdir(this.templatePath('./'), (err, items) => err || items
    .filter(item => item.substr(0, 1) !== '.')
    .map(item => this.fs.copyTpl(
      this.templatePath(item),
      this.destinationPath(`${this.componentRoot}/${folder}/${item.replace('component', componentName.pascalCase)}`),
      this.props,
    )));
  }

  _doesComponentExist (componentName) {
    const componentFolder = this.destinationPath(`${this.componentRoot}/${componentName.dirPath}/package.json`);
    return this.fs.exists(componentFolder);
  }
};
