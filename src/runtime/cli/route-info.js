const { basename } = require('path');
const chalk = require('chalk');
const { stripIndent } = require('common-tags');
const logSymbols = require('log-symbols');
const { getFunctionsAndAssets } = require('../internal/runtime-paths.js');

async function getRouteInfo(config) {
  const { url } = config;
  const info = [];

  const { functions, assets } = await getFunctionsAndAssets(config.baseDir);
  if (functions.length === 0) {
    info.push(`
      ${logSymbols.warning} No functions directory found
    `);
  } else {
    const fnInfo = functions
      .map(fn => {
        return `=> ${url}${fn.functionPath}`;
      })
      .join('\n');
    info.push(chalk`
      {green Twilio functions available at:}
      ${fnInfo}
    `);
  }

  if (assets.length === 0) {
    info.push(`
      ${logSymbols.warning} No assets directory found
    `);
  } else {
    const assetInfo = assets
      .map(asset => {
        const prefix = config.legacyMode ? '/asset' : '';
        return `=> ${url}${prefix}${asset.assetPath}`;
      })
      .join('\n');
    info.push(chalk`
      {green Assets available:}
      ${assetInfo}
    `);
  }

  if (url.includes('ngrok.io')) {
    info.push(chalk`
      {green ngrok request inspector available:}
      => http://127.0.0.1:4040/
    `);
  }

  return stripIndent`${info.join('\n')}`;
}

module.exports = { getRouteInfo };
