const chalk = require('chalk');

const usage = chalk`
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
`;

const config = {
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
    },
    inspect: {
      type: 'string'
    },
    inspectBrk: {
      type: 'string'
    }
  }
};

module.exports = { usage, config };
