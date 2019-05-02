

# `@twilio-labs/serverless-api`

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

- Dominik Kundel <dkundel@twilio.com>