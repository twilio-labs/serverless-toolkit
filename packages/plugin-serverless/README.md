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
* [Contributing](#contributing)
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
* [`twilio serverless:list-templates`](#twilio-serverlesslist-templates)
* [`twilio serverless:new [NAMESPACE]`](#twilio-serverlessnew-namespace)
* [`twilio serverless:start [DIR]`](#twilio-serverlessstart-dir)

## `twilio serverless:list-templates`

Lists the available Twilio Function templates

```
USAGE
  $ twilio serverless:list-templates

OPTIONS
  -l, --logLevel=logLevel  [default: info] Level of logging messages.
```

_See code: [src/commands/serverless/list-templates.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.1/src/commands/serverless/list-templates.js)_

## `twilio serverless:new [NAMESPACE]`

Creates a new Twilio Function based on an existing template

```
USAGE
  $ twilio serverless:new [NAMESPACE]

ARGUMENTS
  NAMESPACE  The namespace your assets/functions should be grouped under

OPTIONS
  -l, --logLevel=logLevel  [default: info] Level of logging messages.
  --template=template
```

_See code: [src/commands/serverless/new.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.1/src/commands/serverless/new.js)_

## `twilio serverless:start [DIR]`

Starts local Twilio Functions development server

```
USAGE
  $ twilio serverless:start [DIR]

ARGUMENTS
  DIR  Root directory to serve local Functions/Assets from

OPTIONS
  -c, --config=config        [default: .twilio-functions] Location of the config file. Absolute path or relative to
                             current working directory (cwd)

  -e, --env=env              Loads .env file, overrides local env variables

  -f, --load-local-env       Includes the local environment variables

  -l, --logLevel=logLevel    [default: info] Level of logging messages.

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

_See code: [src/commands/serverless/start.js](https://github.com/twilio-labs/plugin-serverless/blob/v1.0.1/src/commands/serverless/start.js)_
<!-- commandsstop -->

# Contributing

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
