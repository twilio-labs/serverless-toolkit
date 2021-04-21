<h1 align="center">@twilio-labs/serverless-api</h1>
<p align="center">A module to interact with the <a href="https://www.twilio.com/functions">Twilio Serverless</a> API. For example to deploy projects. 
Part of the <a href="https://github.com/twilio-labs/serverless-toolkit">Serverless Toolkit</a>.
<br>Full reference documentation at <a href="https://serverless-api.twilio-labs.com">serverless-api.twilio-labs.com</a></p>
<p align="center">
<img alt="npm" src="https://img.shields.io/npm/v/@twilio-labs/serverless-api.svg?style=flat-square"> <img alt="npm" src="https://img.shields.io/npm/dt/@twilio-labs/serverless-api.svg?style=flat-square"> <img alt="GitHub" src="https://img.shields.io/github/license/twilio-labs/serverless-api.svg?style=flat-square"> <a href="#contributors"><img alt="All Contributors" src="https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square" /></a> <a href="https://github.com/twilio-labs/.github/blob/main/CODE_OF_CONDUCT.md"><img alt="Code of Conduct" src="https://img.shields.io/badge/%F0%9F%92%96-Code%20of%20Conduct-blueviolet.svg?style=flat-square"></a> <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a> </<a>
<hr>

- [Installation](#installation)
- [Example](#example)
- [HTTP Client Configuration](#http-client-configuration)
- [API](#api)
  - [`client.activateBuild(activateConfig: ActivateConfig): Promise<ActivateResult>`](#clientactivatebuildactivateconfig-activateconfig-promiseactivateresult)
  - [`client.deployLocalProject(deployConfig: DeployLocalProjectConfig): Promise<DeployResult>`](#clientdeploylocalprojectdeployconfig-deploylocalprojectconfig-promisedeployresult)
  - [`client.deployProject(deployConfig: DeployProjectConfig): Promise<DeployResult>`](#clientdeployprojectdeployconfig-deployprojectconfig-promisedeployresult)
  - [`client.getClient(): GotClient`](#clientgetclient-gotclient)
  - [`client.list(listConfig: ListConfig): Promise<ListResult>`](#clientlistlistconfig-listconfig-promiselistresult)
  - [`api` and `fsHelpers`](#api-and-fshelpers)
- [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
  - [Contributors](#contributors)
- [License](#license)

## Installation

```bash
npm install @twilio-labs/serverless-api
```

## Example

If you want to deploy a local project you can do this using:

```js
const { TwilioServerlessApiClient } = require("@twilio-labs/serverless-api");

const client = new TwilioServerlessApiClient({
  accountSid: "...",
  authToken: "..."
});

client.on("status-update", evt => {
  console.log(evt.message);
});

const result = await client.deployLocalProject({
  cwd: "...",
  envPath: "...",
  accountSid: "...",
  authToken: "...",
  env: {},
  pkgJson: {},
  serviceName: "serverless-example",
  functionsEnv: "dev",
  assetsFolderName: "static",
  functionsFolderName: "src"
});
```

## HTTP Client Configuration

When deploying lots of Functions and Assets it is possible to run up against the enforced concurrency limits of the Twilio API. You can limit the concurrency and set how many times the library retries API requests either in the constructor for `TwilioServerlessApiClient` or using environment variables (useful when this is part of a CLI tool like `twilio-run`).

The default concurrency is 50 and the default number of retries is 10. You can change this in the config, the following would set concurrency to 1, only 1 live request at a time, and retries to 0, so if it fails it won't retry.

```js
const client = new TwilioServerlessApiClient({
  accountSid: '...',
  authToken: '...',
  concurrency: 1,
  retryLimit: 0
};);
```

You can also set these values with the following environment variables:

```bash
export TWILIO_SERVERLESS_API_CONCURRENCY=1
export TWILIO_SERVERLESS_API_RETRY_LIMIT=0
```

### Usage with proxy

 - `HTTP_PROXY`: If deploying behind a proxy, set the URL of the proxy in an environment variable called `HTTP_PROXY`.

## API

You can find the full reference documentation of everything at: https://serverless-api.twilio-labs.com

Some functions you might want to check out is:

### `client.activateBuild(activateConfig: ActivateConfig): Promise<ActivateResult>`

"Activates" a build by taking a specified build SID or a "source environment" and activating the same build in the specified environment.

[More in the Docs](https://serverless-api.twilio-labs.com/classes/_client_.twilioserverlessapiclient.html#activatebuild)

### `client.deployLocalProject(deployConfig: DeployLocalProjectConfig): Promise<DeployResult>`

Deploys a local project by reading existing functions and assets from deployConfig.cwd and calling this.deployProject with it.

Functions have to be placed in a functions or src directory to be found. Assets have to be placed into an assets or static directory.

Nested folder structures will result in nested routes.

[More in the Docs](https://serverless-api.twilio-labs.com/classes/_client_.twilioserverlessapiclient.html#deploylocalproject)

### `client.deployProject(deployConfig: DeployProjectConfig): Promise<DeployResult>`

Deploys a set of functions, assets, variables and dependencies specified in deployConfig. Functions & assets can either be paths to the local filesystem or Buffer instances allowing you to dynamically upload even without a file system.

Unless a deployConfig. serviceSid is specified, it will try to create one. If a service with the name deployConfig.serviceName already exists, it will throw an error. You can make it use the existing service by setting overrideExistingService to true.

Updates to the deployment will be emitted as events to status-update.

```js
const result = await client.deployProject({
  env: {},
  pkgJson: {},
  serviceName: "serverless-example",
  functionsEnv: "dev",
  functions: [
    {
      name: "hello-world",
      path: "/hello-world-path",
      content: await readFile(path.join(__dirname, "some-dir", "handler.js")),
      access: "public"
    }
  ],
  assets: [
    {
      name: "image",
      path: "/foo/image.jpg",
      access: "public",
      content: await readFile(path.join(__dirname, "another-dir", "image.jpg"))
    }
  ]
});
```

[More in the Docs](https://serverless-api.twilio-labs.com/classes/_client_.twilioserverlessapiclient.html#deployproject)

### `client.getClient(): GotClient`

Returns the internally used GotClient instance used to make API requests

[More in the Docs](https://serverless-api.twilio-labs.com/classes/_client_.twilioserverlessapiclient.html#getclient)

### `client.list(listConfig: ListConfig): Promise<ListResult>`

Returns an object containing lists of services, environments, variables functions or assets, depending on which have beeen requested in listConfig

[More in the Docs](https://serverless-api.twilio-labs.com/classes/_client_.twilioserverlessapiclient.html#list)

### `api` and `fsHelpers`

There's also a variety of small helper libraries that you can find more details on https://serverless-api.twilio-labs.com.

You can consume them in two ways:

```js
const { fsHelpers, api, utils } = require("@twilio-labs/serverless-api");
// or
const fsHelpers = require("@twilio-labs/serverless-api/dist/utils/fs");
const api = require("@twilio-labs/serverless-api/dist/api");
const utils = require("@twilio-labs/serverless-api/dist/utils");
```

## Contributing 

This project welcomes contributions from the community. Please see the [`CONTRIBUTING.md`](https://github.com/twilio-labs/serverless-toolkit/blob/main/docs/CONTRIBUTING.md) file for more details.

### Code of Conduct

Please be aware that this project has a [Code of Conduct](https://github.com/twilio-labs/.github/blob/main/CODE_OF_CONDUCT.md). The tldr; is to just be excellent to each other ❤️

### Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://dkundel.com"><img src="https://avatars3.githubusercontent.com/u/1505101?v=4" width="100px;" alt=""/><br /><sub><b>Dominik Kundel</b></sub></a><br /><a href="https://github.com/twilio-labs/serverless-api/commits?author=dkundel" title="Code">💻</a> <a href="https://github.com/twilio-labs/serverless-api/commits?author=dkundel" title="Documentation">📖</a> <a href="#ideas-dkundel" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://www.stefanjudis.com/"><img src="https://avatars3.githubusercontent.com/u/962099?v=4" width="100px;" alt=""/><br /><sub><b>Stefan Judis</b></sub></a><br /><a href="https://github.com/twilio-labs/serverless-api/commits?author=stefanjudis" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/vernig"><img src="https://avatars0.githubusercontent.com/u/54728384?v=4" width="100px;" alt=""/><br /><sub><b>G Verni</b></sub></a><br /><a href="https://github.com/twilio-labs/serverless-api/commits?author=vernig" title="Documentation">📖</a></td>
    <td align="center"><a href="http://linkedin.com/in/butuzov"><img src="https://avatars1.githubusercontent.com/u/651824?v=4" width="100px;" alt=""/><br /><sub><b>Oleg Butuzov</b></sub></a><br /><a href="https://github.com/twilio-labs/serverless-api/commits?author=butuzov" title="Documentation">📖</a></td>
    <td align="center"><a href="http://stevenbock.me"><img src="https://avatars3.githubusercontent.com/u/2431938?v=4" width="100px;" alt=""/><br /><sub><b>Steven Bock</b></sub></a><br /><a href="https://github.com/twilio-labs/serverless-api/commits?author=dabockster" title="Code">💻</a></td>
    <td align="center"><a href="https://philna.sh"><img src="https://avatars3.githubusercontent.com/u/31462?v=4" width="100px;" alt=""/><br /><sub><b>Phil Nash</b></sub></a><br /><a href="https://github.com/twilio-labs/serverless-api/commits?author=philnash" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

MIT
