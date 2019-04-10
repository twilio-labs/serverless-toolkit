import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { FileInfo } from '../types';

export const access = promisify(fs.access);
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const readdir = promisify(fs.readdir);
export const stat = promisify(fs.stat);

export async function fileExists(filePath: string) {
  try {
    await access(filePath, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export async function getDirContent(
  dir: string,
  ext?: string
): Promise<FileInfo[]> {
  const rawFiles = await readdir(dir);
  const unfilteredFiles: (FileInfo | undefined)[] = await Promise.all(
    rawFiles.map(async (file: string) => {
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
  );

  return unfilteredFiles.filter(
    entry => typeof entry !== 'undefined'
  ) as FileInfo[];
}

module.exports = {
  fileExists,
  readFile,
  writeFile,
  readdir,
  getDirContent,
};
