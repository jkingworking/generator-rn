const fs = require('fs');

module.exports = async function findModules() {
  const files = await fs.readdirSync(this.destinationPath('./src/modules'));
  return files.filter(item => item.substr(0, 1) !== '.');
};
