const boxen = require('boxen');
const chalk = require('chalk');
const { stripIndent } = require('common-tags');
const wrapAnsi = require('wrap-ansi');
const size = require('window-size');
const logSymbols = require('log-symbols');
const {
  getFunctionsAndAssets,
} = require('../runtime/internal/runtime-paths.js');
const { shouldPrettyPrint, terminalLink } = require('./utils');

function printAsset(asset, config) {
  const prefix = config.legacyMode ? '/asset' : '';
  return chalk`{dim ${config.url}${prefix}}${asset.assetPath}`;
}

function printFunction(fn, config) {
  return chalk`{dim ${config.url}}${fn.functionPath}`;
}

function printPlainRouteInfo(functions, assets, config) {
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

function prettyPrintAsset(asset, config) {
  const prefix = config.legacyMode ? '/asset' : '';
  const assetPath = prefix + asset.assetPath;
  const link = terminalLink(assetPath, config.url + assetPath);
  return link;
}

function prettyPrintFunction(fn, config) {
  const link = terminalLink(fn.functionPath, config.url + fn.functionPath);
  return link;
}

function printPrettyRouteInfo(functions, assets, config) {
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

async function printRouteInfo(config) {
  const { functions, assets } = await getFunctionsAndAssets(config.baseDir);

  let output;
  if (shouldPrettyPrint) {
    output = printPrettyRouteInfo(functions, assets, config);
  } else {
    output = printPlainRouteInfo(functions, assets, config);
  }

  console.log(output);
}

function printVersionWarning(nodeVersion) {
  const msg = chalk`
      {underline.bold {yellow WARNING!} {bold Different Node.js version}}

      You are currently running ${nodeVersion} but the Twilio Runtime is runnning version 8.10.

      You might encounter differences between local development and production. 

      For a more accurate local development experience, please switch your Node.js version.
      A tool like nvm (https://github.com/creationix/nvm) can help.
      `;
  const wrappedMsg = wrapAnsi(msg, size.width - 20);
  console.error(
    boxen(stripIndent(wrappedMsg), {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      float: 'center',
    })
  );
}

module.exports = { printRouteInfo, printVersionWarning };
