#!/usr/bin/env node

const meow = require('meow');
const boxen = require('boxen');
const chalk = require('chalk');
const { runServer } = require('../src/server');
const Runtime = require('../src/internal/runtime');
const { resolve, basename } = require('path');
const { readFileSync } = require('fs');
const dotenv = require('dotenv');
const { stripIndent } = require('common-tags');
const logSymbols = require('log-symbols');
const debug = require('debug')('twilio-run:cli');

const cli = meow(
  chalk`
  {bold Usage}
    $ twilio-run [dir]

  {bold Options}
    --load-local-env, -f Includes the local environment variables
    --env, -e [/path/to/.env] Loads .env file, overrides local env variables
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
      loadLocalEnv: {
        type: 'boolean',
        alias: 'f'
      },
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
  let baseDir = undefined;
  if (cli.input[0]) {
    baseDir = cli.input[0];
    debug('Set base directory to "%s"', baseDir);
  }

  let env = {};
  if (cli.flags.loadLocalEnv) {
    debug('Loading local environment variables');
    env = { ...process.env };
  }

  if (typeof cli.flags.env !== 'undefined') {
    const envFilePath = cli.flags.env.length === 0 ? '.env' : cli.flags.env;
    try {
      const fullEnvPath = resolve(baseDir || process.cwd(), envFilePath);
      debug(`Read .env file at "%s"`, fullEnvPath);
      const envContent = readFileSync(fullEnvPath, 'utf8');
      const envValues = dotenv.parse(envContent);
      for (const [key, val] of Object.entries(envValues)) {
        env[key] = val;
      }
    } catch (err) {
      console.error(logSymbols.error, 'Failed to read .env file');
    }
  }

  let port = process.env.PORT || 3000;
  if (typeof cli.flags.port !== 'undefined') {
    port = parseInt(cli.flags.port, 10);
    debug('Overriding port via command-line flag to %d', port);
  }

  let url = `http://localhost:${port}`;
  if (typeof cli.flags.ngrok !== 'undefined') {
    debug('Starting ngrok tunnel');
    const ngrokConfig = { addr: port };
    if (cli.flags.ngrok.length > 0) {
      ngrokConfig.subdomain = cli.flags.ngrok;
    }

    url = await require('ngrok').connect(ngrokConfig);
    debug('ngrok tunnel URL: %s', url);
  }

  const app = await runServer(port, { baseDir, url, env });
  printInfo(url);
})().catch(err => {
  console.error(err);
});
