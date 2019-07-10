import boxen from 'boxen';
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import { StartCliConfig } from '../runtime/cli/config';
import {
  AssetInfo,
  FunctionInfo,
  getFunctionsAndAssets,
} from '../runtime/internal/runtime-paths';
import { shouldPrettyPrint, terminalLink } from './utils';

function printAsset(asset: AssetInfo, config: StartCliConfig): string {
  const prefix = config.legacyMode ? '/asset' : '';
  return chalk`{dim ${config.url}${prefix}}${asset.assetPath}`;
}

function printFunction(fn: FunctionInfo, config: StartCliConfig): string {
  return chalk`{dim ${config.url}}${fn.functionPath}`;
}

function printPlainRouteInfo(
  functions: FunctionInfo[],
  assets: AssetInfo[],
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

function prettyPrintAsset(asset: AssetInfo, config: StartCliConfig): string {
  const prefix = config.legacyMode ? '/asset' : '';
  const assetPath = prefix + asset.assetPath;
  const link = terminalLink(assetPath, config.url + assetPath);
  return link;
}

function prettyPrintFunction(fn: FunctionInfo, config: StartCliConfig) {
  const link = terminalLink(fn.functionPath, config.url + fn.functionPath);
  return link;
}

function printPrettyRouteInfo(
  functions: FunctionInfo[],
  assets: AssetInfo[],
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
