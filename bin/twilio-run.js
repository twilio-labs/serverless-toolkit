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

const cli = meow(
  chalk`
  {bold Usage}
    $ twilio-run [dir]

  {bold Options}
    --env, -e [/path/to/.env] Loads .env file
    --port, -p <port> Override default port of 3000
  
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
      }
    }
  }
);

if (typeof cli.flags.env !== 'undefined') {
  const envFilePath = cli.flags.env.length === 0 ? '.env' : cli.flags.env;
  const envContent = readFileSync(resolve(process.cwd(), envFilePath), 'utf8');
  const envValues = dotenv.parse(envContent);
  setEnvironmentVariables(envValues, true);
}

let port = process.env.PORT;
if (typeof cli.flags.port !== 'undefined') {
  port = parseInt(cli.flags.port, 10);
}

let baseDir = undefined;
if (cli.input[0]) {
  baseDir = cli.input[0];
}

runServer(port, baseDir)
  .then(app => {
    const port = app.get('port');
    const url = `http://localhost:${port}`;

    const functions = Runtime.getFunctions();
    const fnInfo = Object.keys(functions)
      .map(name => {
        const fnName = basename(name, '.js');
        return `=> ${url}/${fnName}`;
      })
      .join('\n');
    const assets = Runtime.getAssets();
    const assetInfo = Object.keys(assets)
      .map(asset => `=> ${url}/${asset}`)
      .join('\n');
    const msg = chalk`
    {green Twilio functions available at:}
    ${fnInfo}

    {green Assets available:}
    ${assetInfo}
    `;
    console.log(boxen(stripIndent`${msg}`, { padding: 1 }));
  })
  .catch(err => {
    console.error(err);
  });
