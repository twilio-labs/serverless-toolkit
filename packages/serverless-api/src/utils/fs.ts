import fs from 'fs';
import path from 'path';
import recursiveReadDir from 'recursive-readdir';
import { promisify } from 'util';
import { FileInfo } from '../types';

export const access = promisify(fs.access);
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const readDir = promisify(recursiveReadDir);
export const stat = promisify(fs.stat);

export async function fileExists(filePath: string) {
  try {
    await access(filePath, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export type AccessOptions = 'private' | 'protected' | 'public';
export type ResourcePathAndAccess = {
  path: string;
  access: AccessOptions;
};

export function getPathAndAccessFromFileInfo(
  file: FileInfo,
  ignoreExtension?: string
): ResourcePathAndAccess {
  const relativePath = path.dirname(file.name);

  let access: AccessOptions = 'public';
  const ext = path.extname(file.name);
  let baseName = path.basename(file.name, ext);
  if (file.name.includes(`.protected${ext}`)) {
    access = 'protected';
  } else if (file.name.includes(`.private${ext}`)) {
    access = 'private';
  }
  baseName = baseName.replace(`.${access}`, '');

  let resourcePath = `/` + path.join(relativePath, baseName);
  if (ext !== ignoreExtension) {
    resourcePath += ext;
  }
  resourcePath = resourcePath.replace(/\s/g, '-');

  return {
    path: resourcePath,
    access,
  };
}

export async function getDirContent(
  dir: string,
  ext?: string
): Promise<FileInfo[]> {
  const rawFiles: string[] = (await readDir(dir)) as string[];
  const unfilteredFiles: (FileInfo | undefined)[] = await Promise.all(
    rawFiles.map(async (filePath: string) => {
      if (!path.isAbsolute(filePath)) {
        filePath = path.join(dir, filePath);
      }

      const entry = await stat(filePath);
      if (!entry.isFile()) {
        return undefined;
      }

      if (ext && path.extname(filePath) !== ext) {
        return undefined;
      }

      const name = path.relative(dir, filePath);
      return {
        name: name,
        path: filePath,
      };
    })
  );

  return unfilteredFiles.filter(
    entry => typeof entry !== 'undefined'
  ) as FileInfo[];
}

export function getFirstMatchingDirectory(
  basePath: string,
  directories: string[]
): string {
  for (let dir of directories) {
    const fullPath = path.join(basePath, dir);

    try {
      const fStat = fs.statSync(fullPath);
      if (fStat.isDirectory()) {
        return fullPath;
      }
    } catch (err) {
      continue;
    }
  }

  throw new Error(
    `Could not find any of these directories "${directories.join('", "')}"`
  );
}

export async function getListOfFunctionsAndAssets(cwd: string) {
  let functionsDir;
  try {
    functionsDir = getFirstMatchingDirectory(cwd, ['functions', 'src']);
  } catch (err) {
    functionsDir = undefined;
  }

  let assetsDir;
  try {
    assetsDir = getFirstMatchingDirectory(cwd, ['assets', 'static']);
  } catch (err) {
    assetsDir = undefined;
  }

  const functions = functionsDir
    ? await getDirContent(functionsDir, '.js')
    : [];
  const assets = assetsDir ? await getDirContent(assetsDir) : [];
  return { functions, assets };
}
