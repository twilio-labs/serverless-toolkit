# Contributing to Twilio Serverless Toolkit

## About the Project

This project is a "monorepo" meaning it contains several Node.js packages in one repository. The code for all packages are in the [`packages/`](../packages) directory. We are using a tool called [Lerna](https://lerna.js.org) to manage those multiple packages.

## Before you contribute

We welcome everyone to contribute to this project. If you don't know what to work on, [check our open Issues](https://github.com/twilio-labs/serverless-toolkit/issues) and specifically for the `Help Wanted` and `Good First Issue` labels.

If you want to work on one of those open issues, please comment on the issue to let us know that you are working on it. Similarly if you can't work on it anymore, please let us know.

If you are planning to contribute something that does not have an open issue yet, please open an issue for it before you start working on it. This way we can help you find a good solution.

## Requirements

Make sure you have Node.js 10 or newer installed. Due to compatibility with Twilio
Functions this project has to support at least Node.js 10.0.0.

We are using the npm CLI to manage our project. You should be able to use yarn but you might hit some issues.

## Setup your local project

1. Clone project and install dependencies

```bash
git clone https://github.com/twilio-labs/serverless-toolkit.git
cd serverless-toolkit
npm install
npm run bootstrap
```

## Contributing

1. Perform changes. Check out [Working with Lerna](#working-with-lerna) for more info
2. Make sure tests pass by running `npm test`
3. Stage the files you changed by running `git add` with the files you changed.
4. Run `git commit` to kick off validation and enter your commit message. We are using [conventional commits](https://www.conventionalcommits.org/en/) for this project. When you run `npm run cm` it will trigger [`commitizen`](https://npm.im/commitizen) to assist you with your commit message.
5. Submit a Pull Request

**Working on your first Pull Request?** You can learn how from this _free_ series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

## For Maintainers: Releasing

This project uses [`lerna version`](https://www.npmjs.com/package/@lerna/version) to create new releases for any package needed, create the respective git tag and update the necessary `CHANGELOG.md` files. We always pass certain flags, so please use it via `npm run release`. Here are the steps you need to run to release a new version:

### Pre-release version (from `main` or any `features/*` branch):

For example to release a new pre-release version containing `beta` and releasing it as `next`:

```bash
npm run release -- --conventional-prerelease --preid beta
git push origin main --follow-tags
npm run publish -- --otp=<OTP> --dist-tag next
```

If you want to turn a prerelease into a permanent version you can use:

```bash
npm run release -- --conventional-commits --conventional-graduate
git push origin main --follow-tags
npm run publish -- --otp=<OTP>
```

### Normal release (from `main` branch):

For a normal release `standard-version` will detect the version increment automatically. Run:

```bash
npm run release
git push origin main --follow-tags
npm run publish -- --otp=<OTP>
```

To ship a specific version instead (like a forced minor bump) you can run:

```bash
npm run release -- minor
git push origin master --follow-tags
npm run publish -- --otp=<OTP>
```

## Working with Lerna

### Linking Packages

Lerna will automatically link together the different dependencies that are part of the project. You can run `npm run bootstrap` to create the links.

### Installing Dependencies

Dev dependencies should ideally be installed at the top level using `npm install --save-dev`. If you want to execute a binary from a dependency in a particular package you should install it in that particular package instead.

Installing dependencies for packages can be done in two ways. You can either use the [`lerna add` command](https://github.com/lerna/lerna/tree/master/commands/add) or using `npm install` inside the respective package.

The later might be the more intuitive one but it might cause some bootstraping issues.

### Running Scripts

Scripts that are on the top level can be run via `npm run <script>`.

If you want to run a script in every individual package where it is defined you can run: [`lerna run <script>`](https://github.com/lerna/lerna/tree/master/commands/run).

To execute any bash command inside every package you can use [`lerna exec`](https://github.com/lerna/lerna/tree/master/commands/exec).

### Resetting dependencies

You can run `lerna clean` to delete all `node_modules` folder. To reinstall them run `npm run bootstrap`

## Code of Conduct

Please be aware that this project has a [Code of Conduct](https://github.com/twilio-labs/.github/blob/master/CODE_OF_CONDUCT.md). The tldr; is to just be excellent to each other ❤️

## Licensing

All third party contributors acknowledge that any contributions they provide will be made under the same open source license that the open source project is provided under.
