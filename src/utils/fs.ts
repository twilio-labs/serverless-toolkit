import got from 'got';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const access = promisify(fs.access);
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export async function fileExists(filePath) {
  try {
    await access(filePath, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export function downloadFile(contentUrl, targetPath) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(targetPath);
    got
      .stream(contentUrl)
      .on('response', resolve)
      .on('error', reject)
      .pipe(writeStream);
  });
}

export async function getDirContent(dir, ext) {
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
