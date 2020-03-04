# `create-twilio-function`

A command line tool to setup a new [Twilio Function](https://www.twilio.com/docs/api/runtime/functions) with local testing using [`twilio-run`](https://github.com/twilio-labs/twilio-run).

[![Build Status](https://travis-ci.com/twilio-labs/create-twilio-function.svg?branch=master)](https://travis-ci.com/twilio-labs/create-twilio-function) [![Maintainability](https://api.codeclimate.com/v1/badges/e6f9eb67589927df5d72/maintainability)](https://codeclimate.com/github/twilio-labs/create-twilio-function/maintainability)

Read more about this tool in the post [start a new Twilio Functions project the easy way](https://www.twilio.com/blog/start-a-new-twilio-functions-project-the-easy-way)

## Usage

### `npm init`

There are a number of ways to use this tool. The quickest and easiest is with `npm init`:

```bash
npm init twilio-function function-name
cd function-name
npm start
```

This will create a new directory named "function-name" and include all the files you need to write and run a Twilio Function locally. Starting the application will host the example function at localhost:3000/example.

### Twilio CLI

Make sure you have the [Twilio CLI installed](https://www.twilio.com/docs/twilio-cli/quickstart) with either:

```bash
npm install twilio-cli -g
```

or

```bash
brew tap twilio/brew && brew install twilio
```

Install the [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit) plugin:

```bash
twilio plugins:install @twilio-labs/plugin-serverless
```

Then initialise a new Functions project with:

```bash
twilio serverless:init function-name
```

### `npx`

You can also use `npx` to run `create-twilio-function`:

```bash
npx create-twilio-function function-name
```

### Global installation

Or you can install the module globally:

```bash
npm install create-twilio-function -g
create-twilio-function function-name
```

## Command line arguments

```
create-twilio-function <name>

Creates a new Twilio Function project

Commands:
  create-twilio-function <name>          Creates a new Twilio Function
                                         project                    [default]
  create-twilio-function list-templates  List the available templates you can
                                         create a project with.

Positionals:
  name  Name of your project.                                        [string]

Options:
  --account-sid, -a     The Account SID for your Twilio account      [string]
  --auth-token, -t      Your Twilio account Auth Token               [string]
  --skip-credentials    Don't ask for Twilio account credentials or import
                        them from the environment  [boolean] [default: false]
  --import-credentials  Import credentials from the environment variables
                        TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
                                                   [boolean] [default: false]
  --template            Initialize your new project with a template from
                        github.com/twilio-labs/function-templates    [string]
  -h, --help            Show help                                   [boolean]
  -v, --version         Show version number                         [boolean]
  --path                                                     [default: (cwd)]
```

## Contributing

Any help contributing to this project is welcomed. Make sure you read and agree with the [code of conduct](CODE_OF_CONDUCT.md).

1. Fork the project
2. Clone the fork like so:

```bash
git clone git@github.com:YOUR_USERNAME/create-twilio-function.git
```

3. Install the dependencies

```bash
cd create-twilio-function
npm install
```

4. Make your changes
5. Test your changes with

```bash
npm test
```

6. Commit your changes and open a pull request

## LICENSE

MIT
