import { ServerlessResourceConfig } from '@twilio-labs/serverless-api';
import { SearchConfig } from '@twilio-labs/serverless-api/dist/utils';
import boxen from 'boxen';
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import wrapAnsi from 'wrap-ansi';
import { ServerConfig } from '../../../runtime-handler/dist/dev-runtime/types';
import { StartCliConfig } from '../config/start';
import { getFunctionsAndAssets } from '../runtime/internal/runtime-paths';
import { logger } from '../utils/logger';
import { shouldPrettyPrint, terminalLink, windowSize } from './utils';

function printAsset(
  asset: ServerlessResourceConfig,
  config: StartCliConfig | ServerConfig
): string {
  const prefix = config.legacyMode ? '/asset' : '';
  return chalk`{dim ${config.url}${prefix}}${asset.path}`;
}

function printFunction(
  fn: ServerlessResourceConfig,
  config: StartCliConfig | ServerConfig
): string {
  return chalk`{dim ${config.url}}${fn.path}`;
}

function printPlainRouteInfo(
  functions: ServerlessResourceConfig[],
  assets: ServerlessResourceConfig[],
  config: StartCliConfig | ServerConfig
): string {
  const functionHeading = 'Functions';
  let functionInfo;
  if (functions.length > 0) {
    functionInfo = functions.map((fn) => printFunction(fn, config)).join('\n');
  } else {
    functionInfo = 'No functions found';
  }

  const assetHeading = 'Assets';
  let assetInfo;
  if (assets.length > 0) {
    assetInfo = assets.map((asset) => printAsset(asset, config)).join('\n');
  } else {
    assetInfo = 'No assets found';
  }

  let ngrokInfo = '';
  if (config.url.includes('ngrok.io')) {
    ngrokInfo = 'ngrok request inspector available: http://127.0.0.1:4040';
  }

  const output = [
    functionHeading,
    functionInfo,
    '',
    assetHeading,
    assetInfo,
    '',
    ngrokInfo,
  ]
    .join('\n')
    .trim();

  return output;
}

function prettyPrintAsset(
  asset: ServerlessResourceConfig,
  config: StartCliConfig | ServerConfig
): string {
  const prefix = config.legacyMode ? '/asset' : '';
  const assetPath = prefix + asset.path;
  const pathAccess =
    asset.access !== 'private'
      ? config.url + assetPath
      : `Runtime.getAssets()['${asset.path}']`;
  const accessPrefix =
    asset.access !== 'public' ? chalk.cyan.bold(`[${asset.access}] `) : '';
  const link = terminalLink(`${accessPrefix}${assetPath}`, pathAccess);
  return link;
}

function prettyPrintFunction(
  fn: ServerlessResourceConfig,
  config: StartCliConfig | ServerConfig
) {
  const accessPrefix =
    fn.access === 'protected' ? chalk.cyan.bold('[protected] ') : '';
  const link = terminalLink(`${accessPrefix}${fn.path}`, config.url + fn.path);
  return link;
}

function printPrettyRouteInfo(
  functions: ServerlessResourceConfig[],
  assets: ServerlessResourceConfig[],
  config: StartCliConfig | ServerConfig
): string {
  const functionHeading = chalk`{green.bold Twilio functions available:}`;
  let functionInfo;
  if (functions.length > 0) {
    functionInfo = functions
      .map((fn, idx) => {
        const symbol = idx + 1 === functions.length ? '└──' : '├──';
        return `${symbol} ${prettyPrintFunction(fn, config)}`;
      })
      .join('\n');
  } else {
    functionInfo = chalk`  {yellow ${logSymbols.warning}} No functions found`;
  }

  const assetHeading = chalk`{green.bold Twilio assets available:}`;
  let assetInfo;
  if (assets.length > 0) {
    assetInfo = assets
      .map((asset, idx) => {
        const symbol = idx + 1 === assets.length ? '└──' : '├──';
        return `${symbol} ${prettyPrintAsset(asset, config)}`;
      })
      .join('\n');
  } else {
    assetInfo = chalk`  {yellow ${logSymbols.warning}} No assets found`;
  }

  let ngrokInfo = '';
  if (config.url.includes('ngrok.io')) {
    ngrokInfo = chalk`{green.bold ngrok request inspector available:}\nhttp://127.0.0.1:4040`;
  }

  const output = [
    functionHeading,
    functionInfo,
    '',
    assetHeading,
    assetInfo,
    '',
    ngrokInfo,
  ]
    .join('\n')
    .trim();

  const wrappedOutput = wrapAnsi(output, windowSize.width - 8, {
    wordWrap: true,
  });

  return boxen(wrappedOutput, { padding: 1 });
}

// A magic function from https://fettblog.eu/typescript-hasownproperty/
// This narrows down a type based on the property that an object has. It is used
// below to distinguish between `StartCliConfig` and `ServerConfig` as the
// `ServerConfig` does not have functionsFolderName or assetsFolderName
// properties.
function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop);
}

export async function printRouteInfo(
  config: StartCliConfig | ServerConfig
): Promise<void> {
  const searchConfig: SearchConfig = {};
  if (
    hasOwnProperty(config, 'functionsFolderName') &&
    typeof config.functionsFolderName === 'string'
  ) {
    searchConfig.functionsFolderNames = [config.functionsFolderName];
  }
  if (
    hasOwnProperty(config, 'assetsFolderName') &&
    typeof config.assetsFolderName === 'string'
  ) {
    searchConfig.assetsFolderNames = [config.assetsFolderName];
  }

  const { functions, assets } = await getFunctionsAndAssets(
    config.baseDir,
    searchConfig
  );

  let output;
  if (shouldPrettyPrint) {
    output = printPrettyRouteInfo(functions, assets, config);
  } else {
    output = printPlainRouteInfo(functions, assets, config);
  }

  logger.info(output);
}
