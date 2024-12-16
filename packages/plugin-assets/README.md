<h1 align="center">@twilio-labs/plugin-assets</h1>
<p align="center">Plugin for the <a href="https://github.com/twilio/twilio-cli">Twilio CLI</a> to easily upload assets to a <a href="https://www.twilio.com/docs/runtime/assets">Twilio Assets</a> service. Part of the <a href="https://github.com/twilio-labs/serverless-toolkit">Serverless Toolkit</a></p>
<p align="center">
<img alt="npm (scoped)" src="https://img.shields.io/npm/v/@twilio-labs/plugin-assets.svg?style=flat-square"> <img alt="npm" src="https://img.shields.io/npm/dt/@twilio-labs/plugin-assets.svg?style=flat-square"> <img alt="GitHub" src="https://img.shields.io/github/license/twilio-labs/plugin-serverless.svg?style=flat-square"> <a href="https://github.com/twilio-labs/.github/blob/main/CODE_OF_CONDUCT.md"><img alt="Code of Conduct" src="https://img.shields.io/badge/%F0%9F%92%96-Code%20of%20Conduct-blueviolet.svg?style=flat-square"></a> <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
<hr>

This plugin adds functionality to the [Twilio CLI](https://github.com/twilio/twilio-cli) to upload and manage assets to a Twilio Assets service. It's a part of the [Serverless Toolkit](https://github.com/twilio-labs/serverless-toolkit) and uses the [Serverless API](https://github.com/twilio-labs/serverless-toolkit/tree/main/packages/serverless-api).

The plugin creates a new Runtime Service which it then uses as a bucket to which it upload assets. You can upload new files or list your available assets.

For more information see the blog post [announcing the the Assets Plugin](https://www.twilio.com/blog/assets-plugin-twilio-cli) and an example of [how to upload audio files for your Studio IVR with the Assets Plugin](https://www.twilio.com/blog/upload-audio-files-studio-ivr-twilio-cli-assets-plugin).

> **Important**: This version requires Twilio CLI version 3.0 or newer. For Twilio CLI version 2.x you have to use plugin-assets version 1.2.6.

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
* [`twilio assets:init`](#twilio-assetsinit)
* [`twilio assets:list`](#twilio-assetslist)
* [`twilio assets:upload FILE`](#twilio-assetsupload-file)

## `twilio assets:init`

Create a new assets service to use as a bucket

```
USAGE
  $ twilio assets:init [-l (debug|info|warn|error|none)] [-o (columns|json|tsv|none)] [--silent] [-p <value>]
    [--service-name <value>] [--properties <value>]

FLAGS
  -l=(debug|info|warn|error|none)  [default: info] Level of logging messages.
  -o=(columns|json|tsv|none)       [default: columns] Format of command output.
  -p, --profile=<value>            Shorthand identifier for your profile.
      --properties=<value>         [default: service_sid, sid, domain_name] The asset service environment properties you
                                   would like to display (JSON output always shows all properties).
      --service-name=<value>       A unique name for your asset service. May only contain alphanumeric characters and
                                   hyphens.
      --silent                     Suppress  output and logs. This is a shorthand for "-l none -o none".

DESCRIPTION
  Create a new assets service to use as a bucket
```

_See code: [src/commands/assets/init.js](https://github.com/twilio-labs/serverless-toolkit/blob/v2.0.6/src/commands/assets/init.js)_

## `twilio assets:list`

List all the assets in the service

```
USAGE
  $ twilio assets:list [-l (debug|info|warn|error|none)] [-o (columns|json|tsv|none)] [--silent] [-p <value>]
    [--properties <value>]

FLAGS
  -l=(debug|info|warn|error|none)  [default: info] Level of logging messages.
  -o=(columns|json|tsv|none)       [default: columns] Format of command output.
  -p, --profile=<value>            Shorthand identifier for your profile.
      --properties=<value>         [default: sid, path, url, visibility] The asset properties you would like to display
                                   (JSON output always shows all properties).
      --silent                     Suppress  output and logs. This is a shorthand for "-l none -o none".

DESCRIPTION
  List all the assets in the service
```

_See code: [src/commands/assets/list.js](https://github.com/twilio-labs/serverless-toolkit/blob/v2.0.6/src/commands/assets/list.js)_

## `twilio assets:upload FILE`

Upload a new asset to the Assets service

```
USAGE
  $ twilio assets:upload FILE [-l (debug|info|warn|error|none)] [-o (columns|json|tsv|none)] [--silent] [-p
    <value>] [--protected] [--properties <value>]

ARGUMENTS
  FILE  The path to the file you want to upload

FLAGS
  -l=(debug|info|warn|error|none)  [default: info] Level of logging messages.
  -o=(columns|json|tsv|none)       [default: columns] Format of command output.
  -p, --profile=<value>            Shorthand identifier for your profile.
      --properties=<value>         [default: sid, path, url, visibility] The asset properties you would like to display
                                   (JSON output always shows all properties).
      --protected                  Sets the uploaded asset's visibility to 'protected'
      --silent                     Suppress  output and logs. This is a shorthand for "-l none -o none".

DESCRIPTION
  Upload a new asset to the Assets service
```

_See code: [src/commands/assets/upload.js](https://github.com/twilio-labs/serverless-toolkit/blob/v2.0.6/src/commands/assets/upload.js)_
<!-- commandsstop -->

## Contributing

This project welcomes contributions from the community. Please see the [`CONTRIBUTING.md`](CONTRIBUTING.md) file for more details.

### Code of Conduct

Please be aware that this project has a [Code of Conduct](https://github.com/twilio-labs/.github/blob/main/CODE_OF_CONDUCT.md). The tldr; is to just be excellent to each other ❤️

## License

MIT
