# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.0.0-alpha.17](https://github.com/twilio-labs/serverless-api/compare/v1.0.0-alpha.16...v1.0.0-alpha.17) (2019-07-19)



## [1.0.0-alpha.16](https://github.com/twilio-labs/serverless-api/compare/v1.0.0-alpha.15...v1.0.0-alpha.16) (2019-07-18)


### Bug Fixes

* **logs:** fix typo in debug logs ([e558e79](https://github.com/twilio-labs/serverless-api/commit/e558e79))


### Features

* expose createFunctionResource - fix [#3](https://github.com/twilio-labs/serverless-api/issues/3) ([#4](https://github.com/twilio-labs/serverless-api/issues/4)) ([5279169](https://github.com/twilio-labs/serverless-api/commit/5279169))



## [1.0.0-alpha.15](https://github.com/twilio-labs/serverless-api/compare/v1.0.0-alpha.14...v1.0.0-alpha.15) (2019-07-10)


### Build System

* **npm:** setup git hooks and linters ([d0e404c](https://github.com/twilio-labs/serverless-api/commit/d0e404c))


### Features

* replace projectName with serviceName for consistency ([c4f955a](https://github.com/twilio-labs/serverless-api/commit/c4f955a)), closes [twilio-labs/twilio-run#17](https://github.com/twilio-labs/serverless-api/issues/17)


### BREAKING CHANGES

* projectName is no longer valid and serviceName has to be used instead
