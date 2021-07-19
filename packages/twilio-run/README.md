<h1 align="center">twilio-run</h1>
<p align="center">CLI tool to locally develop and deploy to the <a href="https://www.twilio.com/runtime">Twilio Runtime</a>. Part of the <a href="https://github.com/twilio-labs/serverless-toolkit">Serverless Toolkit</a></p>
<p align="center">
<a href="https://www.npmjs.com/package/twilio-run"><img alt="npm (scoped)" src="https://img.shields.io/npm/v/twilio-run.svg?style=flat-square"></a> <a href="https://www.npmjs.com/package/twilio-run"><img alt="npm" src="https://img.shields.io/npm/dt/twilio-run.svg?style=flat-square"></a> <a href="https://github.com/twilio-labs/serverless-toolkit/blob/main/LICENSE"><img alt="GitHub" src="https://img.shields.io/github/license/twilio-labs/twilio-run.svg?style=flat-square"></a> <a href="#contributors"><img alt="All Contributors" src="https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square" /></a> <a href="https://github.com/twilio-labs/serverless-toolkit/blob/main/CODE_OF_CONDUCT.md"><img alt="Code of Conduct" src="https://img.shields.io/badge/%F0%9F%92%96-Code%20of%20Conduct-blueviolet.svg?style=flat-square"></a> <a href="https://github.com/twilio-labs/serverless-toolkit/blob/main/docs/CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
<hr>

- [About](#about)
- [Installation](#installation)
- [Usage](#usage)
  - [Create a new project](#create-a-new-project)
  - [Project conventions](#project-conventions)
  - [Function templates](#function-templates)
  - [Deploy a project](#deploy-a-project)
- [Commands](#commands)
  - [`twilio-run start [dir]`](#twilio-run-start-dir)
    - [Examples](#examples)
  - [`twilio-run deploy`](#twilio-run-deploy)
    - [Examples](#examples-1)
  - [`twilio-run list-templates`](#twilio-run-list-templates)
    - [Examples](#examples-2)
  - [`twilio-run new [namespace]`](#twilio-run-new-namespace)
    - [Examples](#examples-3)
  - [`twilio-run list [types]`](#twilio-run-list-types)
    - [Examples](#examples-4)
  - [`twilio-run activate`](#twilio-run-activate)
    - [Examples](#examples-5)
  - [`twilio-run logs`](#twilio-run-logs)
    - [Examples](#examples-6)
- [API](#api)
  - [`runDevServer(port: number, baseDir: string): Promise<Express.Application>`](#rundevserverport-number-basedir-string-promiseexpressapplication)
  - [`handleToExpressRoute(handler: TwilioHandlerFunction): Express.RequestHandler`](#handletoexpressroutehandler-twiliohandlerfunction-expressrequesthandler)
- [Error Handling in Dev Server](#error-handling-in-dev-server)
- [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
- [Contributors](#contributors)
- [License](#license)

## About

This project is part of the [Serverless Toolkit](https://github.com/twilio-labs/serverless-toolkit). For a more extended documentation, check out the [Twilio Docs](https://www.twilio.com/docs/labs/serverless-toolkit).

## Installation

You can install the CLI tool via `npm` or another package manager. Ideally install it as a dev dependency instead of global:

```bash
# Install it as a dev dependency
npm install twilio-run --save-dev

# Afterwards you can use by using:
node_modules/.bin/twilio-run

npx twilio-run

# Or inside your package.json scripts section as "twilio-run"
```

## Usage

Check out the [commands](#commands) for in depth usage, but here are some things you will want to know:

### Create a new project

To create a new project with the Twilio Serverless Toolkit you can use [`create-twilio-function`](https://github.com/twilio-labs/serverless-toolkit/tree/main/packages/create-twilio-function) which will scaffold a new project that is ready to be used with `twilio-run`.

```bash
# Create a valid project, for example:
npm init twilio-function my-project

# Navigate into project
cd my-project
```

You can then use `twilio-run` to run a local development server to serve your functions and assets.

```bash
npx twilio-run start
```

### Project conventions

By default JavaScript Functions should be placed in the `functions` directory and assets, which can be JavaScript, images, CSS, or any static asset, should be placed in the `assets` directory. You can choose other directories by providing a `--functions-folder` or `--assets-folder` option to `twilio-run` commands.

Twilio Functions and Assets can be public, protected or private. The differences are:

* **Public**: Any one with the URL can visit the Function or Asset
* **Protected**: Twilio signs webhook requests, making a Twilio Function protected means that the Function will validate the webhook signature and reject any incoming requests that don't match
* **Private**: The Function or Asset doesn't a URL, it can only be required within another Function or Asset

Within `twilio-run` you can make your Functions or Assets public, protected or private by adding to the function filename. Functions and Assets are public by default. To make a Function or Asset protected or private, add `.protected` or `.private` to the filename before the extension. For example: `functions/secret.protected.js` or `assets/hidden.private.jpg`.

### Function templates

There are a number of pre-written Function templates that you can add to your project. The [templates are available on GitHub](https://github.com/twilio-labs/function-templates) and you can also propose your own via pull request.

To list the available templates you can run:

```bash
npx twilio-run list-templates
```

To add a new function into your project from a template you can run:

```bash
npx twilio-run new namespace
```

The command will walk you through choosing the template.

### Deploy a project

To deploy a project to the Twilio infrastructure you can run the command:

```bash
npx twilio-run deploy
```

This will deploy your project to the "dev" environment by default. You can then promote the project from "dev" to other environments with the command:

```bash
npx twilio-run promote --from=dev --to=stage
```

## Commands

The CLI exposes a variety of commands. The best way to find out about the flags and commands available is to run `twilio-run --help` or `twilio-run [command] --help`

### `twilio-run start [dir]`
- Aliases: `twilio-run dev`, `twilio-run`

Starts a local development server for testing and debugging of your environment. By default only variables in the `.env` file will be available via `process.env` or through the `context` argument inside Twilio Functions.

#### Examples

```bash
# Serves all functions in current functions sub directory
twilio-run

# Serves all functions in demo/functions
twilio-run demo

# Serves functions on port 9000
PORT=9000 twilio-run

# Serves functions on port 4200
twilio-run --port=4200

# Starts up the inspector mode for the node process
twilio-run --inspect

# Exposes the Twilio functions via ngrok to share them
twilio-run --ngrok

# Exposes the Twilio functions via ngrok using a custom subdomain (requires a paid-for ngrok account)
twilio-run --ngrok=subdomain
```

### `twilio-run deploy`

Deploys your project to Twilio. It will read dependencies automatically from your `package.json`'s `dependencies` field and install them. It will also upload and set the variables that are specified in your `.env` file. You can point it against a different `.env` file via command-line flags.

#### Examples

```bash
# Deploys all functions and assets in the current working directory
twilio-run deploy

# Creates an environment with the domain suffix "prod"
twilio-run deploy --environment=prod
```

### `twilio-run list-templates`

Lists the [available templates](https://github.com/twilio-labs/function-templates) that you can use to generate new functions and/or assets inside your current project with the [`twilio-run new` command](#twilio-run-new-namespace) below.

#### Examples

```bash
# List available templates
twilio-run list-templates
```

### `twilio-run new [namespace]`

Creates a new set of functions and/or assets inside your current project based on a [template](https://github.com/twilio-labs/function-templates).

#### Examples

```bash
# Create a new function using the blank template
# in a subfolder (namespace) demo
twilio-run new demo --template=blank
```

### `twilio-run list [types]`

Lists a set of available resources for different types related to your Account. Available resources that can be listed:
- Services
- Environments or Builds (requires to pass a Service)
- Functions, Assets or Variables (requires to pass a Service and Environment)


#### Examples

```bash
# Lists all existing services/projects associated with your Twilio Account
twilio-run list services
# Lists all existing functions & assets associated with the `dev` environment of this service/project
twilio-run ls functions,assets --environment=dev --service-name=demo
# Outputs all environments for a specific service with extended output for better parsing
twilio-run ls environments --service-sid=ZSxxxxx --extended-output
# Only lists the SIDs and dates of last update for assets, variables and functions
twilio-run ls assets,variables,functions --properties=sid,date_updated
```

### `twilio-run activate`
- Aliases: `twilio-run promote`

Promotes an existing deployment to a new environment. It can also create a new environment if it doesn't exist.

#### Examples

```bash
# Promotes the same build that is on the "dev" environment to the "prod" environment
twilio-run activate --environment=prod --source-environment=dev
# Duplicates an existing build to a new environment called `demo`
twilio-run activate --environment=demo --create-environment --build-sid=ZB1234xxxxxxxxxx
```

### `twilio-run logs`

Print logs from your Twilio Serverless project

#### Examples

```bash
# Gets the latest logs for the current project in the dev environment
twilio-run logs
# Continuously streams the latest logs for the current project in the dev environment
twilio-run logs --tail
# Gets the latest logs for the function sid in the production environment
twilio-run logs --function-sid ZFXXX --environment production
```

## API

The module also exposes two functions that you can use outside of the CLI tool to spin up local development.

If you want to interact with the Runtime API instead, [check out the `@twilio-labs/serverless-api` package](https://github.com/twilio-labs/serverless-api).

### `runDevServer(port: number, baseDir: string): Promise<Express.Application>`

This allows you to trigger running an express server that will expose all functions and assets. Example:

```js
const { runDevServer } = require('twilio-run');

runDevServer(9000)
  .then(app => {
    console.log(`Server is running on port ${app.get('port')})`);
  })
  .catch(err => {
    console.error('Something failed');
  });
```

### `handleToExpressRoute(handler: TwilioHandlerFunction): Express.RequestHandler`

You can take the `handler` function of a Twilio Function file and expose it in an existing Express server. Example:

```js
const express = require('express');
const bodyParser = require('body-parser');
const { handlerToExpressRoute } = require('twilio-run');

const { handler } = require('./path/to/function.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.all(handlerToExpressRoute(handler));

app.listen(3000, () => console.log('Server running on port 3000'));
```

## Error Handling in Dev Server

If your local Twilio Function throws an unhandled error or returns an `Error` instance via the `callback` method, we will return an HTTP status code of `500` and return the error object as JSON.

By default we will clean up the stack trace for you to remove internal code of the dev server and add it as `at [Twilio Dev Server internals]` into the stack trace.

An example would look like this:

```
Error: What?
    at format (/Users/dkundel/dev/twilio-run/examples/basic/functions/hello.js:5:9)
    at exports.handler (/Users/dkundel/dev/twilio-run/examples/basic/functions/hello.js:13:3)
    at [Twilio Dev Server internals]
```

If you want to have the full un-modified stack trace instead, set the following environment variable, either in your Twilio Function or via `.env`:

```
TWILIO_SERVERLESS_FULL_ERRORS=true
```

This will result into a stack trace like this:

```
Error: What?
    at format (/Users/dkundel/dev/twilio-run/examples/basic/functions/hello.js:5:9)
    at exports.handler (/Users/dkundel/dev/twilio-run/examples/basic/functions/hello.js:13:3)
    at twilioFunctionHandler (/Users/dkundel/dev/twilio-run/dist/runtime/route.js:125:13)
    at app.all (/Users/dkundel/dev/twilio-run/dist/runtime/server.js:122:82)
    at Layer.handle [as handle_request] (/Users/dkundel/dev/twilio-run/node_modules/express/lib/router/layer.js:95:5)
    at next (/Users/dkundel/dev/twilio-run/node_modules/express/lib/router/route.js:137:13)
    at next (/Users/dkundel/dev/twilio-run/node_modules/express/lib/router/route.js:131:14)
    at next (/Users/dkundel/dev/twilio-run/node_modules/express/lib/router/route.js:131:14)
    at next (/Users/dkundel/dev/twilio-run/node_modules/express/lib/router/route.js:131:14)
    at next (/Users/dkundel/dev/twilio-run/node_modules/express/lib/router/route.js:131:14)
```

In general you'll want to use the cleaned-up stack trace since the internals might change throughout time.



## Contributing

This project welcomes contributions from the community. Please see the [`CONTRIBUTING.md`](https://github.com/twilio-labs/serverless-toolkit/blob/main/docs/CONTRIBUTING.md) file for more details.

### Code of Conduct

Please be aware that this project has a [Code of Conduct](CODE_OF_CONDUCT.md). The tldr; is to just be excellent to each other ❤️

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars3.githubusercontent.com/u/1505101?v=4" width="100px;" alt="Dominik Kundel"/><br /><sub><b>Dominik Kundel</b></sub>](https://dkundel.com)<br />[💻](https://github.com/dkundel/twilio-run/commits?author=dkundel "Code") | [<img src="https://avatars1.githubusercontent.com/u/41997517?v=4" width="100px;" alt="dbbidclips"/><br /><sub><b>dbbidclips</b></sub>](https://github.com/dbbidclips)<br />[💻](https://github.com/dkundel/twilio-run/commits?author=dbbidclips "Code") [🐛](https://github.com/dkundel/twilio-run/issues?q=author%3Adbbidclips "Bug reports") | [<img src="https://avatars0.githubusercontent.com/u/1033099?v=4" width="100px;" alt="Shelby Hagman"/><br /><sub><b>Shelby Hagman</b></sub>](https://shagman.codes)<br />[🐛](https://github.com/dkundel/twilio-run/issues?q=author%3AShelbyZ "Bug reports") [💻](https://github.com/dkundel/twilio-run/commits?author=ShelbyZ "Code") | [<img src="https://avatars3.githubusercontent.com/u/3806031?v=4" width="100px;" alt="JavaScript Joe"/><br /><sub><b>JavaScript Joe</b></sub>](https://joeprevite.com/)<br />[🐛](https://github.com/dkundel/twilio-run/issues?q=author%3Ajsjoeio "Bug reports") | [<img src="https://avatars3.githubusercontent.com/u/962099?v=4" width="100px;" alt="Stefan Judis"/><br /><sub><b>Stefan Judis</b></sub>](https://www.stefanjudis.com/)<br />[🐛](https://github.com/dkundel/twilio-run/issues?q=author%3Astefanjudis "Bug reports") [💻](https://github.com/dkundel/twilio-run/commits?author=stefanjudis "Code") | [<img src="https://avatars3.githubusercontent.com/u/31462?v=4" width="100px;" alt="Phil Nash"/><br /><sub><b>Phil Nash</b></sub>](https://philna.sh)<br />[🐛](https://github.com/dkundel/twilio-run/issues?q=author%3Aphilnash "Bug reports") [💻](https://github.com/dkundel/twilio-run/commits?author=philnash "Code") [👀](#review-philnash "Reviewed Pull Requests") |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## License

[MIT](LICENSE)
