<h1 align="center">@twilio-labs/plugin-serverless</h1>
<p align="center">Plugin for the <a href="https://github.com/twilio/twilio-cli">Twilio CLI</a> to locally develop, debug and deploy to <a href="https://www.twilio.com/functions">Twilio Serverless</a>.</p>
<p align="center">
<img alt="npm (scoped)" src="https://img.shields.io/npm/v/@twilio-labs/plugin-serverless.svg?style=flat-square"> <img alt="npm" src="https://img.shields.io/npm/dt/@twilio-labs/plugin-serverless.svg?style=flat-square"> <img alt="GitHub" src="https://img.shields.io/github/license/twilio-labs/plugin-serverless.svg?style=flat-square"> <a href="#contributors"><img alt="All Contributors" src="https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square" /></a> <a href="https://github.com/twilio-labs/.github/blob/master/CODE_OF_CONDUCT.md"><img alt="Code of Conduct" src="https://img.shields.io/badge/%F0%9F%92%96-Code%20of%20Conduct-blueviolet.svg?style=flat-square"></a> <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a> </<a>
<hr>

This plugin adds functionality to the [Twilio CLI](https://github.com/twilio/twilio-cli) to locally develop,
debug and deploy to Twilio Serverless. It's a wrapper around [twilio-run](https://github.com/twilio-labs/twilio-run) and [create-twilio-function](https://github.com/philnash/create-twilio-function).

<!-- toc -->
* [Requirements](#requirements)
* [Usage](#usage)
* [Commands](#commands)
* [ Contributing](#contributing)
* [License](#license)
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
$ twilio --help serverless
USAGE
  $ twilio serverless
...
```

# Commands
<!-- commands -->
* [`twilio serverless:activate`](#twilio-serverlessactivate)
* [`twilio serverless:deploy`](#twilio-serverlessdeploy)
* [`twilio serverless:init NAME`](#twilio-serverlessinit-name)
* [`twilio serverless:list [TYPES]`](#twilio-serverlesslist-types)
* [`twilio serverless:new [NAMESPACE]`](#twilio-serverlessnew-namespace)
* [`twilio serverless:start [DIR]`](#twilio-serverlessstart-dir)

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

  --env=env                                Path to .env file for environment variables that should be installed

  --environment=environment                The environment suffix or SID to deploy to.

  --force                                  Will run deployment in force mode. Can be dangerous.

  --service-sid=service-sid                SID of the Twilio Serverless Service to deploy to

  --source-environment=source-environment  SID or suffix of an existing environment you want to deploy from.
```

_See code: [src/commands/serverless/activate.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-rc.0/src/commands/serverless/activate.js)_

## `twilio serverless:deploy`

Deploys existing functions and assets to Twilio

```
USAGE
  $ twilio serverless:deploy

OPTIONS
  -n, --service-name=service-name      Overrides the name of the Serverless project. Default: the name field in your
                                       package.json

  -p, --project=project                Shorthand identifier for your Twilio project.

  -u, --account-sid=account-sid        A specific account SID to be used for deployment. Uses fields in .env otherwise

  --[no-]assets                        Upload assets. Can be turned off with --no-assets

  --assets-folder=assets-folder        Specific folder name to be used for static assets

  --auth-token=auth-token              Use a specific auth token for deployment. Uses fields from .env otherwise

  --cwd=cwd                            Sets the directory from which to deploy

  --env=env                            Path to .env file. If none, the local .env in the current working directory is
                                       used.

  --force                              Will run deployment in force mode. Can be dangerous.

  --[no-]functions                     Upload functions. Can be turned off with --no-functions

  --functions-env=functions-env        [default: dev] The environment name you want to use

  --functions-folder=functions-folder  Specific folder name to be used for static functions

  --override-existing-project          Deploys Serverless project to existing service if a naming conflict has been
                                       found.
```

_See code: [src/commands/serverless/deploy.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-rc.0/src/commands/serverless/deploy.js)_

## `twilio serverless:init NAME`

Creates a new Twilio Function project

```
USAGE
  $ twilio serverless:init NAME

ARGUMENTS
  NAME  Name of Serverless project and directory that will be created

OPTIONS
  -a, --account-sid=account-sid  The Account SID for your Twilio account
  -p, --project=project          Shorthand identifier for your Twilio project.
  -t, --auth-token=auth-token    Your Twilio account Auth Token

  --import-credentials           Import credentials from the environment variables TWILIO_ACCOUNT_SID and
                                 TWILIO_AUTH_TOKEN

  --skip-credentials             Don't ask for Twilio account credentials or import them from the environment
```

_See code: [src/commands/serverless/init.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-rc.0/src/commands/serverless/init.js)_

## `twilio serverless:list [TYPES]`

List existing services, environments, variables, deployments for your Twilio Serverless Account

```
USAGE
  $ twilio serverless:list [TYPES]

ARGUMENTS
  TYPES  [default: services] Comma seperated list of things to list (services,environments,functions,assets,variables)

OPTIONS
  -n, --service-name=service-name  Overrides the name of the Serverless project. Default: the name field in your
                                   package.json

  -p, --project=project            Shorthand identifier for your Twilio project.

  -u, --account-sid=account-sid    A specific account SID to be used for deployment. Uses fields in .env otherwise

  --auth-token=auth-token          Use a specific auth token for deployment. Uses fields from .env otherwise

  --env=env                        Path to .env file for environment variables that should be installed

  --environment=environment        [default: dev] The environment to list variables for

  --extended-output                Show an extended set of properties on the output

  --service-sid=service-sid        Specific Serverless Service SID to run list for
```

_See code: [src/commands/serverless/list.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-rc.0/src/commands/serverless/list.js)_

## `twilio serverless:new [NAMESPACE]`

Creates a new Twilio Function based on an existing template

```
USAGE
  $ twilio serverless:new [NAMESPACE]

ARGUMENTS
  NAMESPACE  The namespace your assets/functions should be grouped under

OPTIONS
  -l, --list           List available templates. Will not create a new function
  --template=template
```

_See code: [src/commands/serverless/new.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-rc.0/src/commands/serverless/new.js)_

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

  --cwd=cwd                  Alternative way to define the directory to start the server in. Overrides the [dir]
                             argument passed.

  --detailed-logs            Toggles detailed request logging by showing request body and query params

  --inspect=inspect          Enables Node.js debugging protocol

  --inspect-brk=inspect-brk  Enables Node.js debugging protocol, stops executioin until debugger is attached

  --legacy-mode              Enables legacy mode, it will prefix your asset paths with /assets

  --[no-]live                Always serve from the current functions (no caching)

  --[no-]logs                Toggles request logging

  --ngrok=ngrok              Uses ngrok to create and outfacing url

ALIASES
  $ twilio serverless:dev
  $ twilio serverless:run
```

_See code: [src/commands/serverless/start.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.0-rc.0/src/commands/serverless/start.js)_
<!-- commandsstop -->
#  Contributing

This project welcomes contributions from the community. Please see the [`CONTRIBUTING.md`](CONTRIBUTING.md) file for more details.

## Code of Conduct

Please be aware that this project has a [Code of Conduct](https://github.com/twilio-labs/.github/blob/master/CODE_OF_CONDUCT.md). The tldr; is to just be excellent to each other ❤️

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="https://dkundel.com"><img src="https://avatars3.githubusercontent.com/u/1505101?v=4" width="100px;" alt="Dominik Kundel"/><br /><sub><b>Dominik Kundel</b></sub></a><br /><a href="https://github.com/twilio-labs/plugin-serverless/commits?author=dkundel" title="Code">💻</a> <a href="https://github.com/twilio-labs/plugin-serverless/commits?author=dkundel" title="Documentation">📖</a> <a href="#ideas-dkundel" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/childish-sambino"><img src="https://avatars0.githubusercontent.com/u/47228322?v=4" width="100px;" alt="childish-sambino"/><br /><sub><b>childish-sambino</b></sub></a><br /><a href="https://github.com/twilio-labs/plugin-serverless/commits?author=childish-sambino" title="Code">💻</a> <a href="https://github.com/twilio-labs/plugin-serverless/issues?q=author%3Achildish-sambino" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.ThinkingSerious.com"><img src="https://avatars0.githubusercontent.com/u/146695?v=4" width="100px;" alt="Elmer Thomas"/><br /><sub><b>Elmer Thomas</b></sub></a><br /><a href="https://github.com/twilio-labs/plugin-serverless/issues?q=author%3Athinkingserious" title="Bug reports">🐛</a> <a href="https://github.com/twilio-labs/plugin-serverless/commits?author=thinkingserious" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

# License

MIT
