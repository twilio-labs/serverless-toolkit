const { basename } = require('path');
const chalk = require('chalk');
const { stripIndent } = require('common-tags');
const logSymbols = require('log-symbols');
const Runtime = require('../internal/runtime');

function getRouteInfo({ url }) {
  const info = [];

  const functions = Runtime.getFunctions();
  if (functions === null) {
    info.push(`
      ${logSymbols.warning} No functions directory found
    `);
  } else {
    const fnInfo = Object.keys(functions)
      .map(name => {
        const fnName = basename(name, '.js');
        return `=> ${url}/${fnName}`;
      })
      .join('\n');
    info.push(chalk`
      {green Twilio functions available at:}
      ${fnInfo}
    `);
  }

  const assets = Runtime.getAssets();
  if (assets === null) {
    info.push(`
      ${logSymbols.warning} No assets directory found
    `);
  } else {
    const assetInfo = Object.keys(assets)
      .map(asset => `=> ${url}/${asset}`)
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
