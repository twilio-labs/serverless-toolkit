<h1 align="center">@twilio-labs/plugin-assets</h1>
<p align="center">Plugin for the <a href="https://github.com/twilio/twilio-cli">Twilio CLI</a> to easily upload assets to a <a href="https://www.twilio.com/docs/runtime/assets">Twilio Assets</a> service. Part of the <a href="https://github.com/twilio-labs/serverless-toolkit">Serverless Toolkit</a></p>
<p align="center">
<img alt="npm (scoped)" src="https://img.shields.io/npm/v/@twilio-labs/plugin-assets.svg?style=flat-square"> <img alt="npm" src="https://img.shields.io/npm/dt/@twilio-labs/plugin-assets.svg?style=flat-square"> <img alt="GitHub" src="https://img.shields.io/github/license/twilio-labs/plugin-serverless.svg?style=flat-square"> <a href="https://github.com/twilio-labs/.github/blob/main/CODE_OF_CONDUCT.md"><img alt="Code of Conduct" src="https://img.shields.io/badge/%F0%9F%92%96-Code%20of%20Conduct-blueviolet.svg?style=flat-square"></a> <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
<hr>

This plugin adds functionality to the [Twilio CLI](https://github.com/twilio/twilio-cli) to upload and manage assets to a Twilio Assets service. It's a part of the [Serverless Toolkit](https://github.com/twilio-labs/serverless-toolkit) and uses the [Serverless API](https://github.com/twilio-labs/serverless-toolkit/tree/main/packages/serverless-api).

<!-- toc -->

<!-- tocstop -->

## Requirements

### Install the Twilio CLI

Via `npm` or `yarn`:

```sh-session
$ npm install -g twilio-cli
$ yarn global add twilio-cli
```

Via `homebrew`:

```sh-session
$ brew tap twilio/brew && brew install twilio
```

## Usage

```sh-session
$ twilio plugins:install @twilio-labs/plugin-assets
$ twilio --help assets
USAGE
  $ twilio assets
...
```

## Commands

<!-- commands -->

<!-- commandsstop -->

## Contributing

This project welcomes contributions from the community. Please see the [`CONTRIBUTING.md`](CONTRIBUTING.md) file for more details.

### Code of Conduct

Please be aware that this project has a [Code of Conduct](https://github.com/twilio-labs/.github/blob/main/CODE_OF_CONDUCT.md). The tldr; is to just be excellent to each other ❤️

## License

MIT
