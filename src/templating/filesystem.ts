import { fsHelpers } from '@twilio-labs/serverless-api';
import chalk from 'chalk';
import debug from 'debug';
import dotenv from 'dotenv';
import { mkdir as oldMkdir } from 'fs';
import got from 'got';
import Listr, { ListrTask } from 'listr';
import path from 'path';
import { install, InstallResult } from 'pkg-install';
import { promisify } from 'util';
import { downloadFile, fileExists, readFile, writeFile } from '../utils/fs';
import { TemplateFileInfo } from './data';
const mkdir = promisify(oldMkdir);

const log = debug('twilio-run:templating:filesystem');

async function writeEnvFile(
  contentUrl: string,
  targetDir: string,
  functionName: string
): Promise<{
  newEnvironmentVariableKeys: string[];
}> {
  const envFilePath = path.join(targetDir, '.env');
  const envFileExists = await fileExists(envFilePath);
  if (!envFileExists) {
    await downloadFile(contentUrl, envFilePath);
    return { newEnvironmentVariableKeys: [] };
  }

  const currentContent = await readFile(envFilePath, 'utf8');
  const currentFlags = dotenv.parse(currentContent);
  const newContent = (await got(contentUrl)).body;
  const newFlags = dotenv.parse(newContent);

  const functionKeys = Object.keys(newFlags);
  const existingKeys = functionKeys.filter(key =>
    currentFlags.hasOwnProperty(key)
  );
  const updatedContent = newContent
    .split('\n')
    .map(line => {
      const name = line.substr(0, line.indexOf('='));
      if (existingKeys.includes(name)) {
        return '# ' + line;
      }
      return line;
    })
    .join('\n');

  const separatorContent = `

# Variables for function "${functionName}"
# ---
`;

  const contentToWrite = currentContent + separatorContent + updatedContent;
  await writeFile(envFilePath, contentToWrite, 'utf8');
  return { newEnvironmentVariableKeys: functionKeys };
}

async function installDependencies(
  contentUrl: string,
  targetDir: string
): Promise<InstallResult | undefined> {
  const pkgContent = await got(contentUrl, { json: true });
  const dependencies = pkgContent.body.dependencies;
  if (dependencies && Object.keys(dependencies).length > 0) {
    return install(dependencies, {
      cwd: targetDir,
    });
  }
}

function hasFilesOfType(files: TemplateFileInfo[], type: string) {
  for (let file of files) {
    if (file.type === type) {
      return true;
    }
  }
  return false;
}

export async function writeFiles(
  files: TemplateFileInfo[],
  targetDir: string,
  bundleName: string
): Promise<void> {
  const functionsDir = fsHelpers.getFirstMatchingDirectory(targetDir, [
    'functions',
    'src',
  ]);
  const assetsDir = fsHelpers.getFirstMatchingDirectory(targetDir, [
    'assets',
    'static',
  ]);
  const functionsTargetDir = path.join(functionsDir, bundleName);
  const assetsTargetDir = path.join(assetsDir, bundleName);

  if (functionsTargetDir !== functionsDir) {
    if (hasFilesOfType(files, 'functions')) {
      try {
        await mkdir(functionsTargetDir);
      } catch (err) {
        log(err);
        throw new Error(
          `Bundle with name "${bundleName}" already exists in "${functionsDir}"`
        );
      }
    }

    if (hasFilesOfType(files, 'assets')) {
      try {
        await mkdir(assetsTargetDir);
      } catch (err) {
        log(err);
        throw new Error(
          `Bundle with name "${bundleName}" already exists in "${assetsDir}"`
        );
      }
    }
  }

  const tasks = files
    .map(file => {
      if (file.type === 'functions') {
        return {
          title: `Creating function: ${file.name}`,
          task: () =>
            downloadFile(
              file.content,
              path.join(functionsTargetDir, file.name)
            ),
        };
      } else if (file.type === 'assets') {
        return {
          title: `Creating asset: ${file.name}`,
          task: () =>
            downloadFile(file.content, path.join(assetsTargetDir, file.name)),
        };
      } else if (file.type === '.env') {
        return {
          title: 'Configuring Environment Variables in .env',
          task: async (ctx: any) => {
            const output = await writeEnvFile(
              file.content,
              targetDir,
              file.name
            );
            ctx.env = output;
          },
        };
      } else if (file.type === 'package.json') {
        return {
          title: 'Installing Dependencies',
          task: () => installDependencies(file.content, targetDir),
        };
      }
    })
    .filter(Boolean) as ListrTask[];
  const context = await new Listr(tasks, { concurrent: true }).run();

  const newKeys = context.env.newEnvironmentVariableKeys;
  if (newKeys.length > 0) {
    console.log(
      chalk`{cyan INFO} Make sure to configure ${newKeys.join(
        ','
      )} in the .env file`
    );
  }
}

export { fileExists } from '../utils/fs';
