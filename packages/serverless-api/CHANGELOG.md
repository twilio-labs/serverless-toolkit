# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://github.com/twilio-labs/serverless-api/compare/v1.0.3...v1.1.0) (2020-02-25)


### Features

* **logs:** add logs fetching and streaming ([#23](https://github.com/twilio-labs/serverless-api/issues/23)) ([f4f21b4](https://github.com/twilio-labs/serverless-api/commit/f4f21b4))



### [1.0.3](https://github.com/twilio-labs/serverless-api/compare/v1.0.2...v1.0.3) (2019-09-25)


### Bug Fixes

* **build:** reject promise on failed build ([47e03e0](https://github.com/twilio-labs/serverless-api/commit/47e03e0)), closes [#15](https://github.com/twilio-labs/serverless-api/issues/15)
* **environments:** fix deploying to production ([#16](https://github.com/twilio-labs/serverless-api/issues/16)) ([9585237](https://github.com/twilio-labs/serverless-api/commit/9585237))



### [1.0.2](https://github.com/twilio-labs/serverless-api/compare/v1.0.1...v1.0.2) (2019-08-05)



### [1.0.1](https://github.com/twilio-labs/serverless-api/compare/v1.0.0...v1.0.1) (2019-08-05)


### Bug Fixes

* add pagination to list requests ([#1](https://github.com/twilio-labs/serverless-api/issues/1)) ([#13](https://github.com/twilio-labs/serverless-api/issues/13)) ([a57f997](https://github.com/twilio-labs/serverless-api/commit/a57f997))



## [1.0.0](https://github.com/twilio-labs/serverless-api/compare/v1.0.0-rc.5...v1.0.0) (2019-08-05)


### Features

* **logs:** implements fetch and list of logs ([#12](https://github.com/twilio-labs/serverless-api/issues/12)) ([87695cd](https://github.com/twilio-labs/serverless-api/commit/87695cd))



## [1.0.0-rc.5](https://github.com/twilio-labs/serverless-api/compare/v1.0.0-rc.4...v1.0.0-rc.5) (2019-08-01)


### Bug Fixes

* change resource paths for nested Windows directories ([#11](https://github.com/twilio-labs/serverless-api/issues/11)) ([9c74b44](https://github.com/twilio-labs/serverless-api/commit/9c74b44))



## [1.0.0-rc.4](https://github.com/twilio-labs/serverless-api/compare/v1.0.0-rc.3...v1.0.0-rc.4) (2019-07-30)


### Bug Fixes

* detect DEBUG flag on client creation ([2477d2e](https://github.com/twilio-labs/serverless-api/commit/2477d2e)), closes [twilio-labs/twilio-run#50](https://github.com/twilio-labs/serverless-api/issues/50)



## [1.0.0-rc.3](https://github.com/twilio-labs/serverless-api/compare/v1.0.0-rc.2...v1.0.0-rc.3) (2019-07-30)


### Bug Fixes

* **assets:** enable protected asset upload ([87db602](https://github.com/twilio-labs/serverless-api/commit/87db602))



## [1.0.0-rc.2](https://github.com/twilio-labs/serverless-api/compare/v1.0.0-rc.1...v1.0.0-rc.2) (2019-07-25)


### Bug Fixes

* **client:** fix client service error information ([#10](https://github.com/twilio-labs/serverless-api/issues/10)) ([00ba21a](https://github.com/twilio-labs/serverless-api/commit/00ba21a))



## [1.0.0-rc.1](https://github.com/twilio-labs/serverless-api/compare/v1.0.0-rc.0...v1.0.0-rc.1) (2019-07-25)


### Bug Fixes

* **api:** update form field names to work with serverless-api ([2282def](https://github.com/twilio-labs/serverless-api/commit/2282def))



## [1.0.0-rc.0](https://github.com/twilio-labs/serverless-api/compare/v1.0.0-alpha.19...v1.0.0-rc.0) (2019-07-24)


### Bug Fixes

* **api:** use new uploads API ([#9](https://github.com/twilio-labs/serverless-api/issues/9)) ([b349a1e](https://github.com/twilio-labs/serverless-api/commit/b349a1e))
* **types:** expose friendly_name on environments ([df4cc28](https://github.com/twilio-labs/serverless-api/commit/df4cc28))


### Features

* **environments:** make naming of environments predictable ([68c51eb](https://github.com/twilio-labs/serverless-api/commit/68c51eb)), closes [#6](https://github.com/twilio-labs/serverless-api/issues/6)


### BREAKING CHANGES

* **api:** Removes uploadToAws as a function



## [1.0.0-alpha.19](https://github.com/twilio-labs/serverless-api/compare/v1.0.0-alpha.18...v1.0.0-alpha.19) (2019-07-20)


### Bug Fixes

* **logs:** redact tokens/passwords/env vars from logs ([8ca6e3d](https://github.com/twilio-labs/serverless-api/commit/8ca6e3d))



## [1.0.0-alpha.18](https://github.com/twilio-labs/serverless-api/compare/v1.0.0-alpha.17...v1.0.0-alpha.18) (2019-07-19)


### Features

* **client:** expose domain in activate command ([8283662](https://github.com/twilio-labs/serverless-api/commit/8283662)), closes [twilio-labs/twilio-run#37](https://github.com/twilio-labs/serverless-api/issues/37)



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
