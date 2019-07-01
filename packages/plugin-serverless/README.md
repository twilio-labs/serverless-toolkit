@twilio-labs/plugin-serverless
========================

This plugin adds functionality to the [Twilio CLI](https://github.com/twilio/twilio-cli) to locally develop,
debug and deploy to Twilio Serverless. It's a wrapper around [twilio-run](https://github.com/twilio-labs/twilio-run) and [create-twilio-function](https://github.com/philnash/create-twilio-function).

<!-- toc -->
* [Requirements](#requirements)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Requirements

## Install the Twilio CLI

Via `npm` or `yarn`:

```sh-session
$ npm install -g twilio-cli
$ yarn global add twilio-cli
```

Via `homebrew`:

```sh-session
$ brew tap twilio/brew && brew install twilio
```

# Usage

```sh-session
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
- [@twilio-labs/plugin-serverless](#twilio-labsplugin-serverless)
- [Requirements](#Requirements)
  - [Install the Twilio CLI](#Install-the-Twilio-CLI)
- [Usage](#Usage)
- [Commands](#Commands)
  - [`twilio serverless:activate`](#twilio-serverlessactivate)
  - [`twilio serverless:deploy`](#twilio-serverlessdeploy)
  - [`twilio serverless:init NAME`](#twilio-serverlessinit-NAME)
  - [`twilio serverless:list [TYPES]`](#twilio-serverlesslist-TYPES)
  - [`twilio serverless:new [FILENAME]`](#twilio-serverlessnew-FILENAME)
  - [`twilio serverless:start [DIR]`](#twilio-serverlessstart-DIR)

## `twilio serverless:activate`

Promotes an existing deployment to a new environment

```
USAGE
  $ twilio serverless:activate

OPTIONS
  -p, --project=project                    Shorthand identifier for your Twilio project.

  -u, --account-sid=account-sid            A specific account SID to be used for deployment. Uses fields in .env
                                           otherwise

  --auth-token=auth-token                  Use a specific auth token for deployment. Uses fields from .env otherwise

  --build-sid=build-sid                    An existing Build SID to deploy to the new environment

  --create-environment                     Creates environment if it couldn't find it.

  --cwd=cwd                                Sets the directory of your existing Functions project. Defaults to current
                                           directory

  --environment=environment                The environment suffix or SID to deploy to.

  --force                                  Will run deployment in force mode. Can be dangerous.

  --source-environment=source-environment  SID or suffix of an existing environment you want to deploy from.
```

_See code: [src/commands/serverless/activate.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-alpha.5/src/commands/serverless/activate.js)_

## `twilio serverless:deploy`

Deploys existing functions and assets to Twilio

```
USAGE
  $ twilio serverless:deploy

OPTIONS
  -n, --project-name=project-name      Overrides the name of the project. Default: the name field in your package.json
  -p, --project=project                Shorthand identifier for your Twilio project.
  -u, --account-sid=account-sid        A specific account SID to be used for deployment. Uses fields in .env otherwise
  --assets                             Upload assets. Can be turned off with --no-assets
  --assets-folder=assets-folder        Specific folder name to be used for static assets
  --auth-token=auth-token              Use a specific auth token for deployment. Uses fields from .env otherwise
  --cwd=cwd                            Sets the directory from which to deploy

  --env=env                            Path to .env file. If none, the local .env in the current working directory is
                                       used.

  --force                              Will run deployment in force mode. Can be dangerous.

  --functions                          Upload functions. Can be turned off with --no-functions

  --functions-env=functions-env        [default: dev] The environment name you want to use

  --functions-folder=functions-folder  Specific folder name to be used for static functions

  --override-existing-project          Deploys project to existing service if a naming conflict has been found.
```

_See code: [src/commands/serverless/deploy.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-alpha.5/src/commands/serverless/deploy.js)_

## `twilio serverless:init NAME`

Creates a new Twilio Serverless project

```
USAGE
  $ twilio serverless:init NAME

ARGUMENTS
  NAME  Name of Serverless project and directory that will be created

OPTIONS
  -p, --project=project      Shorthand identifier for your Twilio project.
  --account-sid=account-sid  An account SID or API key to be used for your project
  --auth-token=auth-token    An auth token or API secret to be used for your project
```

_See code: [src/commands/serverless/init.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-alpha.5/src/commands/serverless/init.js)_

## `twilio serverless:list [TYPES]`

List existing services, environments, variables, deployments for your Twilio Serverless Account

```
USAGE
  $ twilio serverless:list [TYPES]

ARGUMENTS
  TYPES  [default: environments,builds] Comma seperated list of things to list
         (services,environments,functions,assets,variables)

OPTIONS
  -p, --project=project          Shorthand identifier for your Twilio project.
  -u, --account-sid=account-sid  A specific account SID to be used for deployment. Uses fields in .env otherwise
  --auth-token=auth-token        Use a specific auth token for deployment. Uses fields from .env otherwise
  --cwd=cwd                      Sets the directory of your existing Functions project. Defaults to current directory
  --environment=environment      The environment to list variables for
  --extended-output              Show an extended set of properties on the output
  --properties=properties        Specify the output properties you want to see. Works best on single types
  --service-sid=service-sid      Specific Serverless Service SID to run list for
```

_See code: [src/commands/serverless/list.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-alpha.5/src/commands/serverless/list.js)_

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

_See code: [src/commands/serverless/new.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-alpha.5/src/commands/serverless/new.js)_

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
  $ twilio serverless:run
```

_See code: [src/commands/serverless/start.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-alpha.5/src/commands/serverless/start.js)_
<!-- commandsstop -->
