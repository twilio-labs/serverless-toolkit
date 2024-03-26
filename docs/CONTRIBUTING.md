# Contributing to Twilio Serverless Toolkit

## About the Project

This project is a "monorepo" meaning it contains several Node.js packages in one repository. The code for all packages are in the [`packages/`](../packages) directory. We are using a concept called [`npm` workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) to manage those multiple packages and a tool called [`changesets`](https://github.com/changesets/changesets) to handle the versioning and releasing.

## Before you contribute

We welcome everyone to contribute to this project. If you don't know what to work on, [check our open Issues](https://github.com/twilio-labs/serverless-toolkit/issues) and specifically for the `Help Wanted` and `Good First Issue` labels.

If you want to work on one of those open issues, please comment on the issue to let us know that you are working on it. Similarly if you can't work on it anymore, please let us know.

If you are planning to contribute something that does not have an open issue yet, please open an issue for it before you start working on it. This way we can help you find a good solution.

## Requirements

Make sure you have Node.js 18 or newer installed. Due to compatibility with Twilio
Functions this project has to support at least Node.js 18.0.0.

We are using the npm CLI to manage our project. You'll need at least `npm` version 8 or newer.

## Setup your local project

1. Clone project and install dependencies

```bash
git clone https://github.com/twilio-labs/serverless-toolkit.git
cd serverless-toolkit
npm install
npm run bootstrap
```

## Contributing

1. Perform changes. Check out [Working with Workspaces](#working-with-workspaces) for more info
2. If you changed packages/plugins, run `twilio plugins:link <PATH_TO_THE_CHANGED_PACKAGE>` and then test the plugin locally by running `twilio <PLUGIN_NAME> <COMMAND>`
2. Make sure tests pass by running `npm test`
3. Stage the files you changed by running `git add` with the files you changed.
4. If you have a customer facing change make sure to run `npm run changeset` at the root of the project, select what type of version change it is and which packages are impacted and describe the change. Check out ["How we version"](#how-we-version) for more details.
5. Run `git commit` to kick off validation and enter your commit message. We are using [conventional commits](https://www.conventionalcommits.org/en/) for this project. When you run `npm run cm` it will trigger [`commitizen`](https://npm.im/commitizen) to assist you with your commit message.
6. Push your changes and submit a Pull Request

**Working on your first Pull Request?** You can learn how from this _free_ series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

## For Maintainers: Releasing

Version bumps are handled automatically by [this GitHub Action](../.github/workflows/on-merge-main.yml) whenever changes have been merged to `main`. If the automation will detect any changeset files inside the `.changeset` directory it will either open a new Pull Request to bump the version or force-push to the currently open Pull Request. In order to release to `npm` you'll have to merge that Pull Request which will automatically kick off the release.

If the release fails, the issue might be in the NPM token expiring for twilio-labs-ci account. (For example a generic 404 not found response from NPM is usually token expiring) Current expiration is set for January 2026. Internal Slack channel for OSS support can help with the renewal.

## How we version

All packages that are part of this project follow the [SemVer convention](https://semver.org/). Specifically this means the following version changes apply for the following changes:
- `no change` (no changeset) - Changes in `devDependencies`, changes at the root of the project that don't result in a compilation output change, test changes, documentation changes, etc.
- `patch` - Any changes that do not add new features such as bug fixes that are not altering the behavior
- `minor` - New features that are additive and are not breaking current behavior
- `major` - Any changes that are breaking changes incl. dropping support for features or arguments or drastic changes in behavior

## Working with Workspaces

### Linking Packages

npm will automatically link together the different dependencies that are part of the project when you run `npm install` at the root.

### Installing Dependencies

Dev dependencies should ideally be installed at the top level using `npm install --save-dev`. If you want to execute a binary from a dependency in a particular package you should install it in that particular package instead.

Installing dependencies for packages can be done in two ways. You can either use the `npm install <package-name> -w <package-to-install-dependency-in>` command (ex. `npm install lodash -w @twilio-labs/serverless-api`) or using `npm install` inside the respective package.

The later might be the more intuitive one but it might cause some bootstraping issues.

### Running Scripts

Scripts that are on the top level can be run via `npm run <script>`.

If you want to run a script in every individual package where it is defined you can run: [`npm run <script> --workspaces --if-present`](https://docs.npmjs.com/cli/v8/using-npm/workspaces?v=true#running-commands-in-the-context-of-workspaces).

To execute any bash command inside every package you can use [`npm exec`](https://docs.npmjs.com/cli/v8/commands/npm-exec).

### Resetting dependencies

You can run `npm run reset` to delete all `node_modules` folder. To reinstall them run `npm install`

## Code of Conduct

Please be aware that this project has a [Code of Conduct](https://github.com/twilio-labs/.github/blob/main/CODE_OF_CONDUCT.md). The tldr; is to just be excellent to each other ❤️

## Licensing

All third party contributors acknowledge that any contributions they provide will be made under the same open source license that the open source project is provided under.
