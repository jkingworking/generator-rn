const Yeoman = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const createNames = require('../../shared-helpers/create-names');
const fs = require('fs');
const { camelCase } = require('lodash');

module.exports = class extends Yeoman {
  constructor (args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    this.option('babel'); // This method adds support for a `--babel` flag
  }

  async prompting () {
    // Have Yeoman greet the user.
    this.log(yosay(`Welcome to the ${chalk.red('React Native')} generator.
    To get started run\n${chalk.yellow('yo rn:action')} \n or \n${chalk.yellow('yo rn:component')}
    `));
  }
}