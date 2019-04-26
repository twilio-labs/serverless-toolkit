@twilio/plugin-debugger
========================

Access and stream your Twilio debugger logs.

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @twilio/cli @twilio-labs/plugin-serverless
$ twilio COMMAND
running command...
$ twilio (-v|--version|version)
@twilio-labs/plugin-serverless/0.0.1 darwin-x64 node-v8.10.0
$ twilio --help [COMMAND]
USAGE
  $ twilio COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
- [@twilio/plugin-debugger](#twilioplugin-debugger)
- [Usage](#usage)
- [Commands](#commands)
  - [`twilio functions:activate`](#twilio-functionsactivate)
  - [`twilio functions:deploy`](#twilio-functionsdeploy)
  - [`twilio functions:list [TYPES]`](#twilio-functionslist-types)
  - [`twilio functions:new [FILENAME]`](#twilio-functionsnew-filename)

## `twilio functions:activate`

Promotes an existing deployment to a new environment

```
USAGE
  $ twilio functions:activate

OPTIONS
  -p, --authToken=authToken                Use a specific auth token for deployment. Uses fields from .env otherwise
  -p, --project=project                    [default: default] Shorthand identifier for your Twilio project.

  -u, --accountSid=accountSid              A specific account SID to be used for deployment. Uses fields in .env
                                           otherwise

  --build-sid=build-sid                    An existing Build SID to deploy to the new environment

  --create-environment                     Creates environment if it couldn't find it.

  --cwd=cwd                                Sets the directory of your existing Functions project. Defaults to current
                                           directory

  --environment=environment                The environment suffix or SID to deploy to.

  --force                                  Will run deployment in force mode. Can be dangerous.

  --source-environment=source-environment  SID or suffix of an existing environment you want to deploy from.
```

_See code: [src/commands/functions/activate.js](https://github.com/twilio-labs/plugin-serverless/blob/v0.0.1/src/commands/functions/activate.js)_

## `twilio functions:deploy`

Deploys existing functions and assets to Twilio

```
USAGE
  $ twilio functions:deploy

OPTIONS
  -n, --project-name=project-name  Overrides the name of the project. Default: the name field in your package.json
  -p, --project=project            [default: default] Shorthand identifier for your Twilio project.
  -u, --account-sid=account-sid    A specific account SID to be used for deployment. Uses fields in .env otherwise
  --auth-token=auth-token          Use a specific auth token for deployment. Uses fields from .env otherwise
  --cwd=cwd                        Sets the directory from which to deploy
  --env=env                        Path to .env file. If none, the local .env in the current working directory is used.
  --force                          Will run deployment in force mode. Can be dangerous.
  --functions-env=functions-env    [default: dev] The environment name you want to use
  --override-existing-project      Deploys project to existing service if a naming conflict has been found.
```

_See code: [src/commands/functions/deploy.js](https://github.com/twilio-labs/plugin-serverless/blob/v0.0.1/src/commands/functions/deploy.js)_

## `twilio functions:list [TYPES]`

List existing services, environments, variables, deployments for your Twilio Serverless Account

```
USAGE
  $ twilio functions:list [TYPES]

ARGUMENTS
  TYPES  [default: environments,builds] Comma seperated list of things to list
         (services,environments,functions,assets,variables)

OPTIONS
  -p, --authToken=authToken    Use a specific auth token for deployment. Uses fields from .env otherwise
  -p, --project=project        [default: default] Shorthand identifier for your Twilio project.
  -u, --accountSid=accountSid  A specific account SID to be used for deployment. Uses fields in .env otherwise
  --cwd=cwd                    Sets the directory of your existing Functions project. Defaults to current directory
  --environment=environment    The environment to list variables for.
```

_See code: [src/commands/functions/list.js](https://github.com/twilio-labs/plugin-serverless/blob/v0.0.1/src/commands/functions/list.js)_

## `twilio functions:new [FILENAME]`

Creates a new Twilio Function based on an existing template

```
USAGE
  $ twilio functions:new [FILENAME]

ARGUMENTS
  FILENAME  Name for the function to be created

OPTIONS
  -l, --list           List available templates. Will not create a new function
  --template=template
```

_See code: [src/commands/functions/new.js](https://github.com/twilio-labs/plugin-serverless/blob/v0.0.1/src/commands/functions/new.js)_
<!-- commandsstop -->
