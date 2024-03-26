/** @module @twilio-labs/serverless-api/dist/utils/fs */

import debug from 'debug';
import fs from 'fs';
import path, { extname } from 'path';
import { toUnix } from 'upath';
import recursiveReadDir from 'recursive-readdir';
import { promisify } from 'util';
import {
  AccessOptions,
  DirectoryContent,
  FileInfo,
  ResourcePathAndAccess,
  ServerlessResourceConfigWithFilePath,
} from '../types';

const log = debug('twilio-serverless-api:fs');

export const access = promisify(fs.access);
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const readDir = promisify(recursiveReadDir);
export const stat = promisify(fs.stat);

const READ_ONLY = fs.constants.R_OK;
const READ_WRITE = fs.constants.R_OK | fs.constants.W_OK;

/**
 * Checks if a given file exists by checking if we have read & write access
 *
 * @export
 * @param {string} filePath full path of the file to check
 * @returns
 */
export async function fileExists(
  filePath: string,
  hasWriteAccess: boolean = false
) {
  try {
    await access(filePath, hasWriteAccess ? READ_WRITE : READ_ONLY);
    return true;
  } catch (err) {
    return false;
  }
}

export type ValidPathResult =
  | {
      valid: true;
    }
  | { valid: false; message: string };

/**
 * Verifies a given path against the restrictions put up by the Twilio Runtime.
 *
 * @param path a potential absolute path for a Function or Asset
 */
export function checkForValidPath(path: string): ValidPathResult {
  if (!path.startsWith('/')) {
    return {
      valid: false,
      message: `Expected path to start with "/". Got: "${path}"`,
    };
  }

  if (path.includes('#')) {
    return {
      valid: false,
      message: `Path cannot contain a #. Got: "${path}"`,
    };
  }

  const invalidCharacters = /[;,\?:\@\+&\$\(\)' "]/g;
  if (invalidCharacters.test(path)) {
    return {
      valid: false,
      message: `Path cannot contain any of the following characters: ;,?:@+&$()' ". Got: "${path}"`,
    };
  }

  if (path.length >= 256) {
    return {
      valid: false,
      message: `Path length must be shorter than 256 characters. Got: ${path.length} characters.`,
    };
  }

  return { valid: true };
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
  resourcePath = toUnix(resourcePath);

  const validatedPath = checkForValidPath(resourcePath);
  if (!validatedPath.valid) {
    throw new Error(validatedPath.message);
  }

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
 * @param {string} [extension] extension to be ignored in the results
 * @returns {Promise<FileInfo[]>}
 */
export async function getDirContent(
  dir: string,
  extension?: string
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

      if (extension && path.extname(filePath) !== extension) {
        return undefined;
      }

      if (path.basename(filePath) === '.DS_Store') {
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
    (entry) => typeof entry !== 'undefined'
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

  const functionFiles = functionsDir
    ? await getDirContent(functionsDir, '.js')
    : [];
  const functionConfigs = await getServerlessConfigs(functionFiles, '.js');

  const assetFiles = assetsDir ? await getDirContent(assetsDir) : [];
  const assetConfigs = await getServerlessConfigs(assetFiles);

  return { functions: functionConfigs, assets: assetConfigs };
}

/**
 * Retrieve a files from a read directory
 * and create access and public path from the file name
 *
 * @param {FileInfo[]} dirContent read files from a directory
 * @param {string} [ignoreExtension] file extension to drop for serverless path
 * @returns {Promise<ServerlessResourceConfigWithFilePath[]>}
 */
async function getServerlessConfigs(
  dirContent: FileInfo[],
  ignoreExtension?: string
): Promise<ServerlessResourceConfigWithFilePath[]> {
  return Promise.all(
    dirContent.map(async (file) => {
      const { path, access } = getPathAndAccessFromFileInfo(
        file,
        ignoreExtension
      );
      const encoding = extname(file.path) === '.js' ? 'utf8' : undefined;
      const content = await readFile(file.path, encoding);

      return {
        name: path,
        path,
        access,
        content,
        filePath: file.path,
      };
    })
  );
}
