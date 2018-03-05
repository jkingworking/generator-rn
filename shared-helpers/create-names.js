const {
  camelCase,
  snakeCase,
  kebabCase,
  upperFirst,
  startCase
} = require('lodash');

module.exports = function createNames(ACTION_PREFIXES) {
  return function createNamesConfigured(name, removePrefix) {
    const nameCleaned = name.trim();
    const camelCaseName = camelCase(nameCleaned);
    const kebabCaseName = kebabCase(nameCleaned);

    return {
      camelCase: camelCaseName,
      const: snakeCase(nameCleaned).toUpperCase(),
      default: name,
      dirPath: upperFirst(kebabCaseName),
      fileName: camelCaseName,
      kebabCapCase: upperFirst(kebabCaseName),
      kebabCase: kebabCaseName,
      lowercase: snakeCase(nameCleaned),
      pascalCase: upperFirst(camelCaseName),
      reducerName: camelCase(removePrefix
        ? name.replace(RegExp(ACTION_PREFIXES.join('|'), 'i'), '')
        : name),
      words: startCase(nameCleaned),
    }
  }
}