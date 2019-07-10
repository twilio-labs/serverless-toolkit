/** @module @twilio-labs/serverless-api/dist/utils/fs */

import debug from 'debug';
import fs from 'fs';
import path from 'path';
import recursiveReadDir from 'recursive-readdir';
import { promisify } from 'util';
import {
  AccessOptions,
  DirectoryContent,
  FileInfo,
  ResourcePathAndAccess,
} from '../types';

const log = debug('twilio-serverless-api:fs');

export const access = promisify(fs.access);
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const readDir = promisify(recursiveReadDir);
export const stat = promisify(fs.stat);

/**
 * Checks if a given file exists by checking if we have read & write access
 *
 * @export
 * @param {string} filePath full path of the file to check
 * @returns
 */
export async function fileExists(filePath: string) {
  try {
    await access(filePath, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Determines the access and Serverless path for a filesystem resource.
 * If it receives an ignore extension it will drop it from the final serverless path
 *
 * @export
 * @param {FileInfo} file the file to get the access and path for
 * @param {string} [ignoreExtension] file extension to drop for serverless path
 * @returns {ResourcePathAndAccess}
 */
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

/**
 * Retrieves all (nested) files from a given directory.
 *
 * If an extension is specified it will be used to filter the results.
 *
 * @export
 * @param {string} dir the directory to be checked
 * @param {string} [extensionn] extension to be ignored in the results
 * @returns {Promise<FileInfo[]>}
 */
export async function getDirContent(
  dir: string,
  extensionn?: string
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

      if (extensionn && path.extname(filePath) !== extensionn) {
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

/**
 * Given a list of directory names it will return the first one that exists in
 * the base path.
 *
 * **Important**: Performs synchronous file system reading
 *
 * @export
 * @param {string} basePath
 * @param {string[]} directories
 * @returns {string}
 */
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

export type SearchConfig = {
  /**
   * Ordered folder names to search for to find functions
   *
   * @type {string[]}
   */
  functionsFolderNames?: string[];
  /**
   * Ordered folder names to search for to find assets
   *
   * @type {string[]}
   */
  assetsFolderNames?: string[];
};

/**
 * Retrieves a list of functions and assets existing in a given base directory
 * Will check for both "functions" and "src" as directory for functions and
 * "assets" and "static" for assets
 *
 * @export
 * @param {string} cwd Directory
 * @param {SearchConfig} config lets you override the folders to use
 * @returns {Promise<DirectoryContent>}
 */
export async function getListOfFunctionsAndAssets(
  cwd: string,
  config: SearchConfig = {}
): Promise<DirectoryContent> {
  let functionsDir;
  try {
    const possibleFunctionDirs = config.functionsFolderNames || [
      'functions',
      'src',
    ];
    log('Search for directory. Options: "%s"', possibleFunctionDirs.join(','));
    functionsDir = getFirstMatchingDirectory(cwd, possibleFunctionDirs);
  } catch (err) {
    functionsDir = undefined;
  }

  log('Found Functions Directory "%s"', functionsDir);

  let assetsDir;
  try {
    const possibleAssetDirs = config.assetsFolderNames || ['assets', 'static'];
    log('Search for directory. Options: "%s"', possibleAssetDirs.join(','));
    assetsDir = getFirstMatchingDirectory(cwd, possibleAssetDirs);
  } catch (err) {
    assetsDir = undefined;
  }

  log('Found Assets Directory "%s"', assetsDir);

  const functions = functionsDir
    ? await getDirContent(functionsDir, '.js')
    : [];
  const assets = assetsDir ? await getDirContent(assetsDir) : [];
  return { functions, assets };
}
