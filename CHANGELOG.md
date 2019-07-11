# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0-beta.11](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-beta.10...v2.0.0-beta.11) (2019-07-11)


### Bug Fixes

* move Node.js version warning to consistent look ([853956b](https://github.com/twilio-labs/twilio-run/commit/853956b))


### Features

* **types:** ship typescript definitions ([4821a29](https://github.com/twilio-labs/twilio-run/commit/4821a29))



## [2.0.0-beta.10](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-beta.9...v2.0.0-beta.10) (2019-07-11)


### Bug Fixes

* **activate:** rename Functions with Serverless ([36a9254](https://github.com/twilio-labs/twilio-run/commit/36a9254))
* **checks:** change exit codes for checks ([71321e8](https://github.com/twilio-labs/twilio-run/commit/71321e8))
* **new:** fix dep installation regression ([252c79e](https://github.com/twilio-labs/twilio-run/commit/252c79e))
* **start:** update messaging for different Node.js version ([#22](https://github.com/twilio-labs/twilio-run/issues/22)) ([33e822e](https://github.com/twilio-labs/twilio-run/commit/33e822e))


### Features

* improve output and checks for commands ([c84a85d](https://github.com/twilio-labs/twilio-run/commit/c84a85d)), closes [#26](https://github.com/twilio-labs/twilio-run/issues/26)
* **deploy:** improve output for failed deployments ([#24](https://github.com/twilio-labs/twilio-run/issues/24)) ([1102a98](https://github.com/twilio-labs/twilio-run/commit/1102a98))
* **list:** add default value for environment ([#25](https://github.com/twilio-labs/twilio-run/issues/25)) ([11409ad](https://github.com/twilio-labs/twilio-run/commit/11409ad))
* improve Service SID error messages ([#30](https://github.com/twilio-labs/twilio-run/issues/30)) ([0fd1f66](https://github.com/twilio-labs/twilio-run/commit/0fd1f66))
* replace projectName with serviceName ([c5c8ab2](https://github.com/twilio-labs/twilio-run/commit/c5c8ab2)), closes [#17](https://github.com/twilio-labs/twilio-run/issues/17)
* **list:** improve spacing of list command output ([#30](https://github.com/twilio-labs/twilio-run/issues/30)) ([0a88331](https://github.com/twilio-labs/twilio-run/commit/0a88331))
* **start:** add support for cwd flag & relative project paths ([#19](https://github.com/twilio-labs/twilio-run/issues/19)) ([6c45d55](https://github.com/twilio-labs/twilio-run/commit/6c45d55))


### Tests

* fix tests in travis ([b7b0d5c](https://github.com/twilio-labs/twilio-run/commit/b7b0d5c))


### BREAKING CHANGES

* --project-name is now deprecated and --service-name should be used instead
* **list:** Output will differ in list command



## [2.0.0-beta.9](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-beta.8...v2.0.0-beta.9) (2019-07-09)


### Build System

* **npm:** uninstall inquierer ([13965c0](https://github.com/twilio-labs/twilio-run/commit/13965c0))


### Features

* move project to TypeScript ([#23](https://github.com/twilio-labs/twilio-run/issues/23)) ([83b1a05](https://github.com/twilio-labs/twilio-run/commit/83b1a05))


### BREAKING CHANGES

* paths of files have changed which will break direct imports
