<h1 align="center">@twilio-labs/serverless-runtime-types</h1>
<p align="center">TypeScript definitions to define globals for the Twilio Serverless runtime.</p>
<p align="center">
<img alt="npm (scoped)" src="https://img.shields.io/npm/v/@twilio-labs/serverless-runtime-types.svg?style=flat-square"> <img alt="npm" src="https://img.shields.io/npm/dt/@twilio-labs/serverless-runtime-types.svg?style=flat-square"> <img alt="GitHub" src="https://img.shields.io/github/license/twilio-labs/serverless-runtime-types.svg?style=flat-square"> <a href="#contributors"><img alt="All Contributors" src="https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square" /></a> <a href="https://github.com/twilio-labs/.github/blob/main/CODE_OF_CONDUCT.md"><img alt="Code of Conduct" src="https://img.shields.io/badge/%F0%9F%92%96-Code%20of%20Conduct-blueviolet.svg?style=flat-square"></a> <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a> </<a>
<hr>

- [Installation](#Installation)
- [Example](#Example)
  - [In JavaScript](#In-JavaScript)
  - [In TypeScript](#In-TypeScript)
    - [Option 1: Modify your `tsconfig.json`](#Option-1-Modify-your-tsconfigjson)
    - [Option 2: Import the file](#Option-2-Import-the-file)
- [Alternative Usage](#Alternative-Usage)
- [Contributing](#Contributing)
  - [Code of Conduct](#Code-of-Conduct)
  - [Contributors](#Contributors)
- [License](#License)

## Installation

```bash
npm install @twilio-labs/serverless-runtime-types
```

## Example

### In JavaScript

If you want to use the types in JavaScript to get autocomplete in VS Code and
other editors using the TypeScript language server:

```js
/// <reference path="../../node_modules/@twilio-labs/serverless-runtime-types/index.d.ts"/>

/**
 * @param {import('@twilio-labs/serverless-runtime-types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types').ServerlessCallback} callback
 */
exports.handler = function(context, event, callback) {
  let twiml = new Twilio.twiml.MessagingResponse();
  twiml.message("Hello World");
  callback(null, twiml);
};
```

### In TypeScript

For TypeScript you can use the same technique if you want to limit the global
types to that file. Alternatively, you can use one of the following two options
to use the definitions.

#### Option 1: Modify your `tsconfig.json`

```json
{
  "compilerOptions": {
    "types": ["node_modules/@twilio-labs/serverless-runtime-types/index.d.ts"]
  }
}
```

#### Option 2: Import the file

```ts
import "@twilio-labs/serverless-runtime-types";

export function handler(context, event, callback) {
  let twiml = new Twilio.twiml.MessagingResponse();
  twiml.message("Hello World");
  callback(null, twiml);
}
```

## Alternative Usage

You can also import the specific types without setting the global types:

```ts
import { RuntimeInstance } from "@twilio-labs/serverless-runtime-types/types";

function listSyncDocuments(runtime: RuntimeInstance) {
  return runtime.getSync().documents.list();
}
```

## Contributing 

This project welcomes contributions from the community. Please see the [`CONTRIBUTING.md`](https://github.com/twilio-labs/serverless-toolkit/blob/main/docs/CONTRIBUTING.md) file for more details.

### Code of Conduct

Please be aware that this project has a [Code of Conduct](https://github.com/twilio-labs/.github/blob/main/CODE_OF_CONDUCT.md). The tldr; is to just be excellent to each other ❤️

### Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="https://dkundel.com"><img src="https://avatars3.githubusercontent.com/u/1505101?v=4" width="100px;" alt="Dominik Kundel"/><br /><sub><b>Dominik Kundel</b></sub></a><br /><a href="https://github.com/twilio-labs/plugin-serverless/commits?author=dkundel" title="Code">💻</a> <a href="https://github.com/twilio-labs/plugin-serverless/commits?author=dkundel" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

MIT
