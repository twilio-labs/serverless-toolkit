const fs = require('fs');
const { promisify } = require('util');
const writeGitignore = promisify(require('gitignore').writeFile);
const open = promisify(fs.open);
const path = require('path');

function createGitignore(dirPath) {
  const fullPath = path.join(dirPath, '.gitignore');
  return open(fullPath, 'wx').then(fd => {
    const stream = fs.createWriteStream(null, { fd: fd });
    return writeGitignore({ type: 'Node', file: stream });
  });
}

module.exports = createGitignore;
