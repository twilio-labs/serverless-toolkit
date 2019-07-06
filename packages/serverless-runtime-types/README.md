<h1 align="center">@twilio-labs/serverless-runtime-types</h1>
<p align="center">A module to interact with the <a href="https://www.twilio.com/functions">Twilio Serverless</a> API. For example to deploy projects. <br>Full reference documentation at <a href="https://serverless-api.twilio-labs.com">serverless-api.twilio-labs.com</a></p>
<p align="center">
<img alt="npm (scoped)" src="https://img.shields.io/npm/v/@twilio-labs/serverless-api.svg?style=flat-square"> <img alt="npm" src="https://img.shields.io/npm/dt/@twilio-labs/serverless-api.svg?style=flat-square"> <img alt="GitHub" src="https://img.shields.io/github/license/twilio-labs/serverless-api.svg?style=flat-square"> <a href="#contributors"><img alt="All Contributors" src="https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square" /></a> <a href="https://github.com/twilio-labs/.github/blob/master/CODE_OF_CONDUCT.md"><img alt="Code of Conduct" src="https://img.shields.io/badge/%F0%9F%92%96-Code%20of%20Conduct-blueviolet.svg?style=flat-square"></a> <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a> </<a>
<hr>

- [⚠️ **IMPORTANT**](#%E2%9A%A0%EF%B8%8F-IMPORTANT)
- [Installation](#Installation)
- [Example](#Example)
- [API](#API)
  - [`client.activateBuild(activateConfig: ActivateConfig): Promise<ActivateResult>`](#clientactivateBuildactivateConfig-ActivateConfig-PromiseActivateResult)
  - [`client.deployLocalProject(deployConfig: DeployLocalProjectConfig): Promise<DeployResult>`](#clientdeployLocalProjectdeployConfig-DeployLocalProjectConfig-PromiseDeployResult)
  - [`client.deployProject(deployConfig: DeployProjectConfig): Promise<DeployResult>`](#clientdeployProjectdeployConfig-DeployProjectConfig-PromiseDeployResult)
  - [`client.getClient(): GotClient`](#clientgetClient-GotClient)
  - [`client.list(listConfig: ListConfig): Promise<ListResult>`](#clientlistlistConfig-ListConfig-PromiseListResult)
  - [`api` and `fsHelpers`](#api-and-fsHelpers)
- [Contributing](#Contributing)
  - [Code of Conduct](#Code-of-Conduct)
  - [Contributors](#Contributors)
- [License](#License)

## Installation

```bash
npm install @twilio-labs/serverless-runtime-types
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

##  Contributing

This project welcomes contributions from the community. Please see the [`CONTRIBUTING.md`](https://github.com/twilio-labs/.github/blob/master/CONTRIBUTING.md) file for more details.

### Code of Conduct

Please be aware that this project has a [Code of Conduct](https://github.com/twilio-labs/.github/blob/master/CODE_OF_CONDUCT.md). The tldr; is to just be excellent to each other ❤️

### Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="https://dkundel.com"><img src="https://avatars3.githubusercontent.com/u/1505101?v=4" width="100px;" alt="Dominik Kundel"/><br /><sub><b>Dominik Kundel</b></sub></a><br /><a href="https://github.com/twilio-labs/serverless-runtime-types/commits?author=dkundel" title="Code">💻</a> <a href="https://github.com/twilio-labs/serverless-runtime-types/commits?author=dkundel" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

MIT
## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!