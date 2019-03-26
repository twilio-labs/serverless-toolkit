const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const open = promisify(fs.open);
const write = promisify(fs.write);

async function createGitignore(dirPath) {
  const fullPath = `${dirPath}/.gitignore`;
  const content = await readFile(`${__dirname}/../../templates/.gitignore`);
  return open(fullPath, 'wx').then(fd => {
    return write(fd, content);
  });
}

module.exports = createGitignore;
