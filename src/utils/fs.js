const got = require('got');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const access = promisify(fs.access);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function fileExists(filePath) {
  try {
    await access(filePath, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function downloadFile(contentUrl, targetPath) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(targetPath);
    got
      .stream(contentUrl)
      .on('response', resolve)
      .on('error', reject)
      .pipe(writeStream);
  });
}

async function getDirContent(dir, ext) {
  const rawFiles = await readdir(dir);
  return (await Promise.all(
    rawFiles.map(async file => {
      const filePath = path.join(dir, file);
      const entry = await stat(filePath);
      if (!entry.isFile()) {
        return undefined;
      }

      if (ext && path.extname(file) !== ext) {
        return undefined;
      }

      return {
        name: file,
        path: filePath,
      };
    })
  )).filter(Boolean);
}

module.exports = {
  downloadFile,
  fileExists,
  readFile,
  writeFile,
  readdir,
  getDirContent,
};
