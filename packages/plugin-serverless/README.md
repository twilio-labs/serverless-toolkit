@twilio-labs/plugin-serverless
========================

Access and stream your Twilio debugger logs.

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
```sh-session
$ npm install -g twilio-cli
$ twilio plugins:install @twilio-labs/plugin-serverless
$ twilio dev
running dev command...
$ twilio --help serverless
USAGE
  $ twilio serverless
...
```
# Commands
<!-- commands -->
* [`twilio serverless:new [FILENAME]`](#twilio-serverlessnew-filename)
* [`twilio serverless:start [DIR]`](#twilio-serverlessstart-dir)

## `twilio serverless:new [FILENAME]`

Creates a new Twilio Function based on an existing template

```
USAGE
  $ twilio serverless:new [FILENAME]

ARGUMENTS
  FILENAME  Name for the function to be created

OPTIONS
  -l, --list           List available templates. Will not create a new function
  --template=template
```

_See code: [src/commands/serverless/new.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-alpha.3/src/commands/serverless/new.js)_

## `twilio serverless:start [DIR]`

Starts local Twilio Functions development server

```
USAGE
  $ twilio serverless:start [DIR]

ARGUMENTS
  DIR  Root directory to serve local Functions/Assets from

OPTIONS
  -e, --env=env              Loads .env file, overrides local env variables
  -f, --load-local-env       Includes the local environment variables
  -p, --port=port            (required) [default: 3000] Override default port of 3000
  --detailed-logs            Toggles detailed request logging by showing request body and query params
  --inspect=inspect          Enables Node.js debugging protocol
  --inspect-brk=inspect-brk  Enables Node.js debugging protocol, stops executioin until debugger is attached
  --legacy-mode              Enables legacy mode, it will prefix your asset paths with /assets
  --live                     Always serve from the current functions (no caching)
  --logs                     Toggles request logging
  --ngrok=ngrok              Uses ngrok to create and outfacing url

ALIASES
  $ twilio serverless:dev
  $ twilio dev
```

_See code: [src/commands/serverless/start.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-alpha.3/src/commands/serverless/start.js)_
<!-- commandsstop -->
