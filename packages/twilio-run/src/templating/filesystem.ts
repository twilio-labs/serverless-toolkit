import { fsHelpers } from '@twilio-labs/serverless-api';
import chalk from 'chalk';
import dotenv from 'dotenv';
import got from 'got';
import { Listr, ListrTask } from 'listr2';
import path from 'path';
import { install, InstallResult } from 'pkg-install';
import semver from 'semver';
import { PackageJson } from 'type-fest';
import {
  downloadFile,
  fileExists,
  mkdir,
  readFile,
  writeFile,
} from '../utils/fs';
import { logger } from '../utils/logger';
import { TemplateFileInfo } from './data';

async function writeEnvFile(
  contentUrl: string,
  targetDir: string,
  functionName: string
): Promise<{
  newEnvironmentVariableKeys: string[];
}> {
  const envFilePath = path.join(targetDir, '.env');
  const envFileExists = await fileExists(envFilePath, true);
  if (!envFileExists) {
    await downloadFile(contentUrl, envFilePath);
    return { newEnvironmentVariableKeys: [] };
  }

  const currentContent = await readFile(envFilePath, 'utf8');
  const currentFlags = dotenv.parse(currentContent);
  const newContent = (await got(contentUrl)).body;
  const newFlags = dotenv.parse(newContent);

  const functionKeys = Object.keys(newFlags);
  const existingKeys = functionKeys.filter((key) =>
    currentFlags.hasOwnProperty(key)
  );
  const updatedContent = newContent
    .split('\n')
    .map((line) => {
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
  const pkgContent = await got(contentUrl, { responseType: 'json' });

  const dependencies: PackageJson.Dependency = {};
  const exactDependencies: PackageJson.Dependency = {};
  const pkgContentBody = pkgContent.body as PackageJson;

  Object.entries<string>(pkgContentBody.dependencies || []).forEach(
    ([name, version]) => {
      if (Boolean(semver.parse(version))) {
        exactDependencies[name] = version;
      } else {
        dependencies[name] = version;
      }
    }
  );
  if (exactDependencies && Object.keys(exactDependencies).length > 0) {
    await install(exactDependencies, {
      cwd: targetDir,
      exact: true,
    });
  }
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
  namespace: string,
  templateName: string
): Promise<void> {
  const functionsDir = fsHelpers.getFirstMatchingDirectory(targetDir, [
    'functions',
    'src',
  ]);
  const assetsDir = fsHelpers.getFirstMatchingDirectory(targetDir, [
    'assets',
    'static',
  ]);
  const functionsTargetDir = path.join(functionsDir, namespace);
  const assetsTargetDir = path.join(assetsDir, namespace);
  const readmesTargetDir = path.join(targetDir, 'readmes', namespace);

  if (functionsTargetDir !== functionsDir) {
    if (hasFilesOfType(files, 'functions')) {
      await mkdir(functionsTargetDir, { recursive: true });
    }

    if (hasFilesOfType(files, 'assets')) {
      await mkdir(assetsTargetDir, { recursive: true });
    }
  }

  if (hasFilesOfType(files, 'README.md')) {
    await mkdir(readmesTargetDir, { recursive: true });
  }

  for (let file of files) {
    if (file.type === 'functions') {
      let filepath = path.join(functionsTargetDir, file.directory, file.name);

      if (await fileExists(filepath)) {
        throw new Error(
          `Template with name "${namespace}" has duplicate file "${file.name}" in "${functionsDir}"`
        );
      }
    } else if (file.type === 'assets') {
      let filepath = path.join(assetsTargetDir, file.directory, file.name);

      if (await fileExists(filepath)) {
        throw new Error(
          `Template with name "${namespace}" has duplicate file "${file.name}" in "${assetsDir}"`
        );
      }
    }
  }

  const tasks = files
    .map((file) => {
      if (file.type === 'functions') {
        return {
          title: `Creating function: ${path.join(file.directory, file.name)}`,
          task: () =>
            downloadFile(
              file.content,
              path.join(functionsTargetDir, file.directory, file.name)
            ),
        };
      } else if (file.type === 'assets') {
        return {
          title: `Creating asset: ${file.name}`,
          task: () =>
            downloadFile(
              file.content,
              path.join(assetsTargetDir, file.directory, file.name)
            ),
        };
      } else if (file.type === '.env' || file.type === '.env.example') {
        return {
          title: 'Configuring Environment Variables in .env',
          task: async (ctx: any) => {
            const output = await writeEnvFile(
              file.content,
              targetDir,
              namespace
            );
            ctx.env = output;
          },
        };
      } else if (file.type === 'package.json') {
        return {
          title: 'Installing Dependencies',
          task: () => installDependencies(file.content, targetDir),
        };
      } else if (file.type === 'README.md') {
        const readmePath = path.join(readmesTargetDir, templateName + '.md');
        return {
          title: `Saving README to ${readmePath}`,
          task: async () => {
            if (await fileExists(readmePath)) {
              return;
            }
            return downloadFile(file.content, readmePath);
          },
        };
      }
    })
    .filter(Boolean) as ListrTask[];
  const context = await new Listr(tasks, { concurrent: true }).run();

  const newKeys = context.env.newEnvironmentVariableKeys;
  if (newKeys.length > 0) {
    logger.info(
      chalk`{cyan INFO} Make sure to configure ${newKeys.join(
        ','
      )} in the .env file`
    );
  }
}
