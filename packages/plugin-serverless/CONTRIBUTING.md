# Contributing to @twilio-labs/plugin-serverless

## About the Project

This plugin is a wrapper around other existing tools. When planning to submit a 
fix please consider submitting the fix to the respective project. When in doubt, 
create an issue and we are happy to point you into the right direction.

- [`plugin-serverless`](https://github.com/twilio-labs/plugin-serverless) - Wrapper code needed to interact between the [`twilio-run` CLI](https://github.com/twilio-labs/twilio-run) and the [Twilio CLI](https://github.com/twilio/twilio-cli)
- [`twilio-run`](https://github.com/twilio-labs/twilio-run) - The actual CLI code and the code necessary to do local development
- [`serverless-api`](https://github.com/twilio-labs/serverless-api) - Module used to interact with the Twilio Serverless API (handles the actual deployment)
- [`create-twilio-function`](https://github.com/philnash/create-twilio-function) - Code run when `twilio serverless:init` is called

## Requirements

Make sure you have Node.js 8.10 or newer installed

## Setup

1. Clone project and install dependencies_
```bash
git clone https://github.com/twilio-labs/plugin-serverless.git
cd plugin-serverless
npm install
```
2. [Install the Twilio CLI](https://github.com/twilio/twilio-cli)
3. Locally link your plugin
```bash
twilio plugins:link <path_to_your_project>
```

## Contributing
1. Perform changes
2. Test changes manually using `twilio serverless`
3. Make sure tests pass by running `npm test`
4. Submit a PR 

**Working on your first Pull Request?** You can learn how from this *free* series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github) 

## Code of Conduct

Please be aware that this project has a [Code of Conduct](https://github.com/twilio-labs/.github/blob/master/CODE_OF_CONDUCT.md). The tldr; is to just be excellent to each other ❤️

## Licensing 

All third party contributors acknowledge that any contributions they provide will be made under the same open source license that the open source project is provided under.
