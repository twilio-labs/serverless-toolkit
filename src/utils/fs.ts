import { FileInfo } from '@twilio-labs/serverless-api';
import fs from 'fs';
import got from 'got';
import path from 'path';
import { promisify } from 'util';
const access = promisify(fs.access);
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const readdir = promisify(fs.readdir);
export const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const open = promisify(fs.open);

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export function downloadFile(
  contentUrl: string,
  targetPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    return open(targetPath, 'wx')
      .then(fd => {
        const writeStream = fs.createWriteStream('', { fd });
        got
          .stream(contentUrl)
          .on('response', resolve)
          .on('error', reject)
          .pipe(writeStream);
      })
      .catch(err => reject(err));
  });
}

export async function getDirContent(
  dir: string,
  ext: string
): Promise<FileInfo[]> {
  const rawFiles = await readdir(dir);
  return (await Promise.all(
    rawFiles.map<Promise<FileInfo | undefined>>(async (file: string) => {
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
  )).filter(Boolean) as FileInfo[];
}
