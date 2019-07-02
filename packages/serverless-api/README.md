<h1 align="center">@twilio-labs/serverless-api</h1>
<p align="center">A module to interact with the <a href="https://www.twilio.com/functions">Twilio Serverless</a> API. For example to deploy projects.</p>
<p align="center">
<img alt="npm (scoped)" src="https://img.shields.io/npm/v/@twilio-labs/serverless-api.svg?style=flat-square"> <img alt="npm" src="https://img.shields.io/npm/dt/@twilio-labs/serverless-api.svg?style=flat-square"> <img alt="GitHub" src="https://img.shields.io/github/license/twilio-labs/serverless-api.svg?style=flat-square"> <a href="#contributors"><img alt="All Contributors" src="https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square" /></a> <a href="https://github.com/twilio-labs/.github/blob/master/CODE_OF_CONDUCT.md"><img alt="Code of Conduct" src="https://img.shields.io/badge/%F0%9F%92%96-Code%20of%20Conduct-blueviolet.svg?style=flat-square"></a> <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a> </<a>
<hr>

##  ⚠️ **IMPORTANT**

This is a module for an experimental API that is still in preview mode. 

You won't be able to use this library unless you have been granted prior access to the underlying API.

## Installation

```bash
npm install @twilio-labs/serverless-api
```

## Example

If you want to deploy a local project you can do this using:

```js
const TwilioServerlessApiClient = require('@twilio-labs/serverless-api');

const client = new TwilioServerlessApiClient({
  accountSid: '...',
  authToken: '...'
});

client.on('status-update', evt => {
  console.log(evt.message);
});

const result = await client.deployLocalProject({
  cwd: '...',
  envPath: '...',
  accountSid: '...',
  authToken: '...',
  env: {  },
  pkgJson: {},
  projectName: 'serverless-example',
  functionsEnv: 'dev',
  assetsFolderName: 'static',
  functionsFolderName: 'src'
});
```

## API

You can find the full reference documentation of everything at: https://serverless-api.twilio-labs.com

Some functions you might want to check out is:

### `client.activateBuild(activateConfig: ActivateConfig): Promise<ActivateResult>`

"Activates" a build by taking a specified build SID or a "source environment" and activating the same build in the specified environment.

[More in the Docs](https://serverless-api.twilio-labs.com/classes/_twilio_labs_serverless_api.twilioserverlessapiclient.html#activatebuild)

### `client.deployLocalProject(deployConfig: DeployLocalProjectConfig): Promise<DeployResult>`

Deploys a local project by reading existing functions and assets from deployConfig.cwd and calling this.deployProject with it.

Functions have to be placed in a functions or src directory to be found. Assets have to be placed into an assets or static directory.

Nested folder structures will result in nested routes.

[More in the Docs](https://serverless-api.twilio-labs.com/classes/_twilio_labs_serverless_api.twilioserverlessapiclient.html#deploylocalproject)

### `client.deployProject(deployConfig: DeployProjectConfig): Promise<DeployResult>`

Deploys a set of functions, assets, variables and dependencies specified in deployConfig. Functions & assets can either be paths to the local filesystem or Buffer instances allowing you to dynamically upload even without a file system.

Unless a deployConfig. serviceSid is specified, it will try to create one. If a service with the name deployConfig.projectName already exists, it will throw an error. You can make it use the existing service by setting overrideExistingService to true.

Updates to the deployment will be emitted as events to status-update. 

[More in the Docs](https://serverless-api.twilio-labs.com/classes/_twilio_labs_serverless_api.twilioserverlessapiclient.html#deployproject)

### `client.getClient(): GotClient`

Returns the internally used GotClient instance used to make API requests

[More in the Docs](https://serverless-api.twilio-labs.com/classes/_twilio_labs_serverless_api.twilioserverlessapiclient.html#getclient)

### `client.list(listConfig: ListConfig): Promise<ListResult>`

Returns an object containing lists of services, environments, variables functions or assets, depending on which have beeen requested in listConfig

[More in the Docs](https://serverless-api.twilio-labs.com/classes/_twilio_labs_serverless_api.twilioserverlessapiclient.html#list)

### `api` and `fsHelpers`

There's also a variety of small helper libraries that you can find more details on https://serverless-api.twilio-labs.com.

You can consume them in two ways:

```js
const { fsHelpers, api, utils } = require('@twilio-labs/serverless-api');
// or
const fsHelpers = require('@twilio-labs/serverless-api/dist/utils/fs');
const api = require('@twilio-labs/serverless-api/dist/api');
const utils = require('@twilio-labs/serverless-api/dist/utils');
```

## License

MIT

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="https://dkundel.com"><img src="https://avatars3.githubusercontent.com/u/1505101?v=4" width="100px;" alt="Dominik Kundel"/><br /><sub><b>Dominik Kundel</b></sub></a><br /><a href="https://github.com/twilio-labs/serverless-api/commits?author=dkundel" title="Code">💻</a> <a href="https://github.com/twilio-labs/serverless-api/commits?author=dkundel" title="Documentation">📖</a> <a href="#ideas-dkundel" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->