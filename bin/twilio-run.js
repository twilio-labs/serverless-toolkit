#!/usr/bin/env node

const meow = require('meow');
const boxen = require('boxen');
const chalk = require('chalk');
const { runServer } = require('../src/server');
const Runtime = require('../src/internal/runtime');
const { resolve, basename } = require('path');
const { setEnvironmentVariables } = require('node-env-run/dist/lib/utils');
const { readFileSync } = require('fs');
const dotenv = require('dotenv');
const { stripIndent } = require('common-tags');
const logSymbols = require('log-symbols');

const cli = meow(
  chalk`
  {bold Usage}
    $ twilio-run [dir]

  {bold Options}
    --env, -e [/path/to/.env] Loads .env file
    --port, -p <port> Override default port of 3000
    --ngrok [subdomain] Uses ngrok to create an outfacing url
  
  {bold Examples}
    $ {cyan twilio-run}
    # Serves all functions in current functions sub directory

    $ {cyan twilio-run} demo
    # Serves all functions in demo/functions

    $ PORT=9000 {cyan twilio-run}
    # Serves functions on port 9000

    $ {cyan twilio-run} --port=4200
    # Serves functions on port 4200

    $ {cyan twilio-run} --env
    # Loads environment variables from .env file

    $ {cyan twilio-run} --ngrok
    # Exposes the Twilio functions via ngrok to share them
`,
  {
    flags: {
      env: {
        type: 'string',
        alias: 'e'
      },
      port: {
        type: 'string',
        alias: 'p'
      },
      ngrok: {
        type: 'string'
      }
    }
  }
);

function printInfo(url) {
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
  console.log(boxen(stripIndent`${info.join('\n')}`, { padding: 1 }));
}

(async function() {
  if (typeof cli.flags.env !== 'undefined') {
    const envFilePath = cli.flags.env.length === 0 ? '.env' : cli.flags.env;
    const envContent = readFileSync(
      resolve(process.cwd(), envFilePath),
      'utf8'
    );
    const envValues = dotenv.parse(envContent);
    setEnvironmentVariables(envValues, true);
  }

  let port = process.env.PORT || 3000;
  if (typeof cli.flags.port !== 'undefined') {
    port = parseInt(cli.flags.port, 10);
  }

  let baseDir = undefined;
  if (cli.input[0]) {
    baseDir = cli.input[0];
  }

  let url = `http://localhost:${port}`;
  if (typeof cli.flags.ngrok !== 'undefined') {
    const ngrokConfig = { addr: port };
    if (cli.flags.ngrok.length > 0) {
      ngrokConfig.subdomain = cli.flags.ngrok;
    }

    url = await require('ngrok').connect(ngrokConfig);
  }

  const app = await runServer(port, { baseDir, url });
  printInfo(url);
})().catch(err => {
  console.error(err);
});
