const { createWriteStream } = require('fs');
const { join } = require('path');
const gitignore = require('gitignore');

const ADDITIONAL_CONTENT = '# Twilio Serverless\n.twiliodeployinfo\n\n';

function createGitignore(dirPath) {
  return new Promise((resolve, reject) => {
    const fullPath = join(dirPath, '.gitignore');
    const stream = createWriteStream(fullPath, { flags: 'wx' });
    stream.on('error', reject);
    stream.write(ADDITIONAL_CONTENT, 'utf-8', (error) => {
      if (error) {
        reject(error);
      }
      gitignore.writeFile(
        {
          type: 'Node',
          file: stream,
        },
        (error) => {
          if (error) {
            reject(error);
          }
          resolve();
        }
      );
    });
  });
}

module.exports = createGitignore;
