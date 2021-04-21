# `create-twilio-function`

A command line tool to setup a new [Twilio Function](https://www.twilio.com/docs/api/runtime/functions) with local testing using [`twilio-run`](https://github.com/twilio-labs/serverless-toolkit/tree/main/packages/twilio-run). Part of the [Twilio Serverless Toolkit](https://github.com/twilio-labs/serverless-toolkit).

Read more about this tool in the post [start a new Twilio Functions project the easy way](https://www.twilio.com/blog/start-a-new-twilio-functions-project-the-easy-way)

* [Usage](#usage)
  * [`npm init`](#npm-init)
  * [Twilio CLI](#twilio-cli)
  * [`npx`](#npx)
  * [Global installation](#global-installation)
* [Function Templates](#function-templates)
* [TypeScript](#typescript)
* [Command line arguments](#command-line-arguments)
* [Contributing](#contributing)
* [LICENSE](#license)

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

## Function Templates

`create-twilio-function` enables you to generate a new empty project or to build a project using any of the templates from [the Function Templates](https://github.com/twilio-labs/function-templates) repo. All you need to do is pass a `--template` option with the name of the template you want to download. Like this:

```bash
npm init twilio-function function-name --template blank
```

This works with any of the other ways of calling `create-twilio-function`. Check out the [ever expanding list of function templates here](https://github.com/twilio-labs/function-templates).

## TypeScript

If you want to [build your Twilio Functions project in TypeScript](https://www.twilio.com/docs/labs/serverless-toolkit/guides/typescript) you can. `create-twilio-function` supports generating a new project that is set up to use TypeScript too. To generate a TypeScript project, use the `--typescript` flag, like this:

```bash
npm init twilio-function function-name --typescript
```

Note: there are no Function templates written in TypeScript, so do not use the `--template` flag alongside the `--typescript` flag. The basic TypeScript project does come with some example files, but you can generate an empty project combining the `--typescript` and `--empty` flags.

## Command line arguments

```
Creates a new Twilio Function project

Commands:
  create-twilio-function <name>          Creates a new Twilio Function project
                                                                       [default]
  create-twilio-function list-templates  Lists the available Twilio Function
                                         templates

Positionals:
  name  Name of your project.                                           [string]

Options:
  --account-sid, -a     The Account SID for your Twilio account         [string]
  --auth-token, -t      Your Twilio account Auth Token                  [string]
  --skip-credentials    Don't ask for Twilio account credentials or import them
                        from the environment          [boolean] [default: false]
  --import-credentials  Import credentials from the environment variables
                        TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
                                                      [boolean] [default: false]
  --template            Initialize your new project with a template from
                        github.com/twilio-labs/function-templates       [string]
  --empty               Initialize your new project with empty functions and
                        assets directories            [boolean] [default: false]
  --typescript          Initialize your Serverless project with TypeScript
                                                      [boolean] [default: false]
  -h, --help            Show help                                      [boolean]
  -v, --version         Show version number                            [boolean]
  --path                                                        [default: (cwd)]
```

## Contributing

This project welcomes contributions from the community. Please see the [`CONTRIBUTING.md`](https://github.com/twilio-labs/serverless-toolkit/blob/main/docs/CONTRIBUTING.md) file for more details.

## LICENSE

MIT
