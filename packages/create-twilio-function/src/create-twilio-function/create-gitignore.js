const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const writeGitignore = promisify(require('gitignore').writeFile);

const open = promisify(fs.open);

function createGitignore(dirPath) {
  const fullPath = path.join(dirPath, '.gitignore');
  return open(fullPath, 'wx').then(fd => {
    const stream = fs.createWriteStream(null, { fd });
    return writeGitignore({
      type: 'Node',
      file: stream,
    });
  });
}

module.exports = createGitignore;
