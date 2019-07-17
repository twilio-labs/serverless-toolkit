import { ServerlessResourceConfig } from '@twilio-labs/serverless-api';
import boxen from 'boxen';
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import { StartCliConfig } from '../config/start';
import { getFunctionsAndAssets } from '../runtime/internal/runtime-paths';
import { shouldPrettyPrint, terminalLink } from './utils';

function printAsset(
  asset: ServerlessResourceConfig,
  config: StartCliConfig
): string {
  const prefix = config.legacyMode ? '/asset' : '';
  return chalk`{dim ${config.url}${prefix}}${asset.path}`;
}

function printFunction(
  fn: ServerlessResourceConfig,
  config: StartCliConfig
): string {
  return chalk`{dim ${config.url}}${fn.path}`;
}

function printPlainRouteInfo(
  functions: ServerlessResourceConfig[],
  assets: ServerlessResourceConfig[],
  config: StartCliConfig
): string {
  const functionHeading = 'Functions';
  let functionInfo;
  if (functions.length > 0) {
    functionInfo = functions.map(fn => printFunction(fn, config)).join('\n');
  } else {
    functionInfo = 'No functions found';
  }

  const assetHeading = 'Assets';
  let assetInfo;
  if (assets.length > 0) {
    assetInfo = assets.map(asset => printAsset(asset, config)).join('\n');
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
  config: StartCliConfig
): string {
  const prefix = config.legacyMode ? '/asset' : '';
  const assetPath = prefix + asset.path;
  const pathAccess =
    asset.access === 'public'
      ? config.url + assetPath
      : `Runtime.getAssets()['${asset.path}']`;
  const accessPrefix =
    asset.access === 'private' ? chalk.cyan.bold('[private] ') : '';
  const link = terminalLink(`${accessPrefix}${assetPath}`, pathAccess);
  return link;
}

function prettyPrintFunction(
  fn: ServerlessResourceConfig,
  config: StartCliConfig
) {
  const accessPrefix =
    fn.access === 'protected' ? chalk.cyan.bold('[protected] ') : '';
  const link = terminalLink(`${accessPrefix}${fn.path}`, config.url + fn.path);
  return link;
}

function printPrettyRouteInfo(
  functions: ServerlessResourceConfig[],
  assets: ServerlessResourceConfig[],
  config: StartCliConfig
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

  return boxen(output, { padding: 1 });
}

export async function printRouteInfo(config: StartCliConfig): Promise<void> {
  const { functions, assets } = await getFunctionsAndAssets(config.baseDir);

  let output;
  if (shouldPrettyPrint) {
    output = printPrettyRouteInfo(functions, assets, config);
  } else {
    output = printPlainRouteInfo(functions, assets, config);
  }

  console.log(output);
}
