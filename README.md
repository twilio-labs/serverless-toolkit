<p align="center"><img src="images/squared-serverless-logo-small.png" height="150" alt="Seagull with a French Fry"><a href="#disclaimer">*</a></p>
<h1 align="center">Serverless Toolkit</h1>
<p align="center"><a href="https://github.com/twilio-labs/about"><img src="https://img.shields.io/static/v1?label=&message=Twilio-Labs&color=F22F46&labelColor=0D122B&logo=twilio&style=for-the-badge" alt="Part of Twilio Labs Banner"></a></p>

## What is the Serverless Toolkit?

The [Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit) is CLI tooling to help you develop locally and deploy to the [Twilio Functions & Assets](https://www.twilio.com/serverless/functions).

There are two ways you can use the toolkit. If you are already using the [Twilio CLI](https://www.twilio.com/docs/twilio-cli), you can install it via a plugin. Alternatively, you can use the toolkit as a standalone using [twilio-run](https://npm.im/twilio-run) via npm or another Node.js package manager.

Throughout the [docs](https://www.twilio.com/docs/labs/serverless-toolkit), you can switch in the code snippets between Twilio-CLI and Bash Session to get the commands for both versions.

## Let's work together

Everything in this toolkit is released under [Twilio Labs](https://www.twilio.com/docs/labs) and fully open-source. If you find any problems with this, [please file an issue](https://github.com/twilio-labs/serverless-toolkit/issues) or even create a pull request to work together with us on the toolkit. We would love to hear your ideas and feedback!

## Project Structure & Contributing

This project is a monorepo, meaning it contains multiple packages in one repository. It consists out of the following packages:

- [`twilio-run`](packages/twilio-run) - The underlying CLI tool
- [`plugin-serverless`](packages/plugin-serverless) - Exposes the `twilio-run` CLI into the [Twilio CLI](https://www.twilio.com/docs/twilio-cli)
- [`create-twilio-function`](packages/create-twilio-function) - Handles templating and bootstrapping of new projects and Functions
- [`serverless-api`](packages/serverless-api) - The module used to interact with the actual [Twilio Functions and Assets API](https://www.twilio.com/docs/runtime/functions-assets-api)
- [`runtime-handler`](packages/runtime-handler) - A version of the [Twilio Functions Runtime Handler](https://www.twilio.com/docs/runtime/runtime-handler) to be used in local development
- [`plugin-assets`](packages/plugin-assets) - A plugin for the Twilio CLI to easily upload assets to a Twilio Assets service
- [`serverless-runtime-types`](packages/serverless-runtime-types) - TypeScript definitions to define globals for the Twilio Serverless runtime

Also part of the Serverless toolkit, but in another repository:

- [`function-templates`](https://github.com/twilio-labs/function-templates) - The templates used by the toolkit to create new Functions

To understand more about the structure and the design of the Toolkit check out the [design documentation](docs/DESIGN.md).

## Setup & Development

This project uses [`npm` workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) as a tool to manage the monorepo. If you are unfamiliar with the tool, start by checking out the the [`npm` docs](https://docs.npmjs.com/cli/v7/using-npm/workspaces) and make sure you use at least npm version 8 or newer (`npm install -g npm@8`).

```bash
git clone git@github.com:twilio-labs/serverless-toolkit.git
cd serverless-toolkit
npm install
npm run build
```

## License

MIT

## Disclaimer

Unofficial logo. Not a Twilio logo.
