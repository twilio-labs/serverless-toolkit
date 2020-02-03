# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.2.1](https://github.com/twilio-labs/twilio-run/compare/v2.2.0...v2.2.1) (2020-02-03)


### Bug Fixes

* **activate:** remove required to flag because of production option ([21c8309](https://github.com/twilio-labs/twilio-run/commit/21c830903b9559718574ce630eba0cb3d3b13d65))

## [2.2.0](https://github.com/twilio-labs/twilio-run/compare/v2.1.1...v2.2.0) (2020-01-27)


### Features

* **activate:** change activate to alias, promote to command ([#95](https://github.com/twilio-labs/twilio-run/issues/95)) ([9b2a981](https://github.com/twilio-labs/twilio-run/commit/9b2a9813928b504481cdb2f061b399a9196075ec)), closes [twilio-labs/serverless-toolkit#8](https://github.com/twilio-labs/serverless-toolkit/issues/8)
* allow the same namespace but different files ([#92](https://github.com/twilio-labs/twilio-run/issues/92)) ([b4fde66](https://github.com/twilio-labs/twilio-run/commit/b4fde660d2eded1daf6a1933fd6f0e536626b05a))
* **server:** expose function path to context ([95866a7](https://github.com/twilio-labs/twilio-run/commit/95866a75d96418777e22e40e084785e40aacc47c))
* support loading of new files automatically with `--live` ([#94](https://github.com/twilio-labs/twilio-run/issues/94)) ([955efbe](https://github.com/twilio-labs/twilio-run/commit/955efbed093e4fa8cd8a306100bba012f7bffd20))
* **server:** hide internals from stack trace ([#105](https://github.com/twilio-labs/twilio-run/issues/105)) ([f965275](https://github.com/twilio-labs/twilio-run/commit/f965275182e2749f0054993b156bf1e5370a345c))
* **templates:** report GitHub api error ([#86](https://github.com/twilio-labs/twilio-run/issues/86)) ([1de3853](https://github.com/twilio-labs/twilio-run/commit/1de3853275417638db8f0aa96555a5311fa3eaad))


### Bug Fixes

* **checks:** change the expected node version ([726d66f](https://github.com/twilio-labs/twilio-run/commit/726d66fc2e3a4097725c10c3d7d98285d23dd737))
* **examples:** remove unnecessary console.log ([c7c5b0a](https://github.com/twilio-labs/twilio-run/commit/c7c5b0a14e411adc4818b3001b18e39076e12aa7))
* **server:** avoid overriding env variables ([e2c75cb](https://github.com/twilio-labs/twilio-run/commit/e2c75cb9ec1b4c9e00c703af160d7e9a9379ee89))
* **server:** update request body size ([#102](https://github.com/twilio-labs/twilio-run/issues/102)) ([8689f00](https://github.com/twilio-labs/twilio-run/commit/8689f00d217151d5f7b21c325747c50fb1f60082)), closes [#98](https://github.com/twilio-labs/twilio-run/issues/98)

### [2.1.1](https://github.com/twilio-labs/twilio-run/compare/v2.1.0...v2.1.1) (2019-10-03)


### Bug Fixes

* use fixed windowSize when not available ([#83](https://github.com/twilio-labs/twilio-run/issues/83)) ([5130348](https://github.com/twilio-labs/twilio-run/commit/5130348)), closes [#82](https://github.com/twilio-labs/twilio-run/issues/82)



## [2.1.0](https://github.com/twilio-labs/twilio-run/compare/v2.0.0...v2.1.0) (2019-09-25)


### Bug Fixes

* **activate:** change environment flag from 'required' to 'requiresArg' ([#75](https://github.com/twilio-labs/twilio-run/issues/75)) ([a6367fa](https://github.com/twilio-labs/twilio-run/commit/a6367fa))
* **debug:** fix redaction of logger overwriting values ([#79](https://github.com/twilio-labs/twilio-run/issues/79)) ([c5c6081](https://github.com/twilio-labs/twilio-run/commit/c5c6081)), closes [#78](https://github.com/twilio-labs/twilio-run/issues/78)
* **server:** object Runtime not available before function run ([#80](https://github.com/twilio-labs/twilio-run/issues/80)) ([ce63952](https://github.com/twilio-labs/twilio-run/commit/ce63952))
* **tests:** update paths to support win32 ([#73](https://github.com/twilio-labs/twilio-run/issues/73)) ([f6ea72d](https://github.com/twilio-labs/twilio-run/commit/f6ea72d))


### Features

* add estimated execution time to function run ([#81](https://github.com/twilio-labs/twilio-run/issues/81)) ([cf8b21d](https://github.com/twilio-labs/twilio-run/commit/cf8b21d))
* add link to Twilio Console logs to deploy/activate ([#77](https://github.com/twilio-labs/twilio-run/issues/77)) ([7bd4f7c](https://github.com/twilio-labs/twilio-run/commit/7bd4f7c))
* **deploy,activate:** add flag to deploy/promote to production ([#76](https://github.com/twilio-labs/twilio-run/issues/76)) ([77c95e4](https://github.com/twilio-labs/twilio-run/commit/77c95e4))



## [2.0.0](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-rc.5...v2.0.0) (2019-08-05)


### Bug Fixes

* **runtime:** fix wrong service name in getSync ([#14](https://github.com/twilio-labs/twilio-run/issues/14)) ([bd2e04d](https://github.com/twilio-labs/twilio-run/commit/bd2e04d))


### Features

* **runtime:** support better error formatting ([#67](https://github.com/twilio-labs/twilio-run/issues/67)) ([e36594e](https://github.com/twilio-labs/twilio-run/commit/e36594e)), closes [#64](https://github.com/twilio-labs/twilio-run/issues/64) [#65](https://github.com/twilio-labs/twilio-run/issues/65)



### [1.1.2](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-beta.9...v1.1.2) (2019-07-09)


### Build System

* **npm:** update jest dependency ([30cade1](https://github.com/twilio-labs/twilio-run/commit/30cade1))



### [1.1.1](https://github.com/twilio-labs/twilio-run/compare/v1.1.0...v1.1.1) (2019-06-28)



## [1.1.0](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-beta.7...v1.1.0) (2019-06-28)



## [2.0.0-rc.5](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-rc.4...v2.0.0-rc.5) (2019-07-31)


### Bug Fixes

* **activate:** use logger for info printing ([dd14bd0](https://github.com/twilio-labs/twilio-run/commit/dd14bd0))



## [2.0.0-rc.4](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-rc.3...v2.0.0-rc.4) (2019-07-31)



## [2.0.0-rc.3](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-rc.2...v2.0.0-rc.3) (2019-07-30)


### Bug Fixes

* **server:** return better error for invalid function code ([#49](https://github.com/twilio-labs/twilio-run/issues/49)) ([7bc82c2](https://github.com/twilio-labs/twilio-run/commit/7bc82c2))
* **server:** set plain text content-type for string responses ([#52](https://github.com/twilio-labs/twilio-run/issues/52)) ([ca4f541](https://github.com/twilio-labs/twilio-run/commit/ca4f541))
* **start:** fix asset path for protected assets ([84dafcf](https://github.com/twilio-labs/twilio-run/commit/84dafcf))
* **start:** improve margin for text wrapping ([1d221e7](https://github.com/twilio-labs/twilio-run/commit/1d221e7))
* **start:** wrap output for smaller terminals ([#47](https://github.com/twilio-labs/twilio-run/issues/47)) ([e5ae37d](https://github.com/twilio-labs/twilio-run/commit/e5ae37d))
* removes console.error ([#48](https://github.com/twilio-labs/twilio-run/issues/48)) ([e2b374d](https://github.com/twilio-labs/twilio-run/commit/e2b374d))



## [2.0.0-rc.2](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-rc.1...v2.0.0-rc.2) (2019-07-26)


### Bug Fixes

* **activate:** print accountSid and token to stderr ([a79ea58](https://github.com/twilio-labs/twilio-run/commit/a79ea58))
* **activate:** redact printed auth token ([709acd3](https://github.com/twilio-labs/twilio-run/commit/709acd3))
* **deploy:** change deploy example to use environment flag ([dbed2a4](https://github.com/twilio-labs/twilio-run/commit/dbed2a4))
* **deploy:** improve deploy output of private assets ([486ae73](https://github.com/twilio-labs/twilio-run/commit/486ae73))
* **list:** print meta info to list command ([#32](https://github.com/twilio-labs/twilio-run/issues/32)) ([585176a](https://github.com/twilio-labs/twilio-run/commit/585176a))
* **templates:** switch template list endpoint to next branch ([5a5030e](https://github.com/twilio-labs/twilio-run/commit/5a5030e))


### Features

* introduce config file functionality ([#15](https://github.com/twilio-labs/twilio-run/issues/15)) ([#38](https://github.com/twilio-labs/twilio-run/issues/38)) ([a86f017](https://github.com/twilio-labs/twilio-run/commit/a86f017)), closes [#27](https://github.com/twilio-labs/twilio-run/issues/27) [#45](https://github.com/twilio-labs/twilio-run/issues/45) [#46](https://github.com/twilio-labs/twilio-run/issues/46) [twilio-labs/serverless-api#8](https://github.com/twilio-labs/twilio-run/issues/8) [#36](https://github.com/twilio-labs/twilio-run/issues/36) [#36](https://github.com/twilio-labs/twilio-run/issues/36) [#27](https://github.com/twilio-labs/twilio-run/issues/27)
* **new:** change from prompts to inquirer ([#36](https://github.com/twilio-labs/twilio-run/issues/36)) ([9745010](https://github.com/twilio-labs/twilio-run/commit/9745010))


### BREAKING CHANGES

* Deprecating --functions-env as an option
* Error page layout changed
* Deprecating --functions-env as an option



## [2.0.0-rc.1](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-rc.0...v2.0.0-rc.1) (2019-07-25)



## [2.0.0-rc.0](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-beta.13...v2.0.0-rc.0) (2019-07-24)


### Bug Fixes

* update code for new version of severless-api ([#46](https://github.com/twilio-labs/twilio-run/issues/46)) ([06e2b71](https://github.com/twilio-labs/twilio-run/commit/06e2b71)), closes [twilio-labs/serverless-api#8](https://github.com/twilio-labs/twilio-run/issues/8)



## [2.0.0-beta.13](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-beta.12...v2.0.0-beta.13) (2019-07-24)


### Bug Fixes

* **logs:** redact info in logs ([724455b](https://github.com/twilio-labs/twilio-run/commit/724455b))


### Features

* **runtime:** handle invalid account sid & new error page ([11a6ab2](https://github.com/twilio-labs/twilio-run/commit/11a6ab2)), closes [#45](https://github.com/twilio-labs/twilio-run/issues/45)


### BREAKING CHANGES

* **runtime:** Error page layout changed



## [2.0.0-beta.12](https://github.com/twilio-labs/twilio-run/compare/v2.0.0-beta.11...v2.0.0-beta.12) (2019-07-20)


### Bug Fixes

* **deploy:** fix conflicting-service error message ([b12ed02](https://github.com/twilio-labs/twilio-run/commit/b12ed02))
* **list:** improve error message ([#41](https://github.com/twilio-labs/twilio-run/issues/41)) ([ad2cf28](https://github.com/twilio-labs/twilio-run/commit/ad2cf28))
* **new:** fix random error when canceling ([#33](https://github.com/twilio-labs/twilio-run/issues/33)) ([f84da5e](https://github.com/twilio-labs/twilio-run/commit/f84da5e))
* **new:** improve experience of new command ([80fbd27](https://github.com/twilio-labs/twilio-run/commit/80fbd27)), closes [#20](https://github.com/twilio-labs/twilio-run/issues/20)
* **runtime:** do not serve private assets ([d49640e](https://github.com/twilio-labs/twilio-run/commit/d49640e))
* **runtime:** fix inconsistencies in local runtime ([93dcfc9](https://github.com/twilio-labs/twilio-run/commit/93dcfc9)), closes [#42](https://github.com/twilio-labs/twilio-run/issues/42) [#43](https://github.com/twilio-labs/twilio-run/issues/43)
* **server:** disable cache in live mode & fix missing function ([47fb82d](https://github.com/twilio-labs/twilio-run/commit/47fb82d)), closes [#35](https://github.com/twilio-labs/twilio-run/issues/35)
* **start:** improve listing of private assets ([e0ebc77](https://github.com/twilio-labs/twilio-run/commit/e0ebc77))


### Features

* **activate:** print deployment URL after activating ([085eb36](https://github.com/twilio-labs/twilio-run/commit/085eb36)), closes [#37](https://github.com/twilio-labs/twilio-run/issues/37)
* **list:** make services the default list type ([e6ba016](https://github.com/twilio-labs/twilio-run/commit/e6ba016)), closes [#44](https://github.com/twilio-labs/twilio-run/issues/44)
* **new:** updates new to download multiple file templates ([#39](https://github.com/twilio-labs/twilio-run/issues/39)) ([a9f3fd2](https://github.com/twilio-labs/twilio-run/commit/a9f3fd2)), closes [#20](https://github.com/twilio-labs/twilio-run/issues/20)
* **start:** turn live flag default to true ([9ff9a04](https://github.com/twilio-labs/twilio-run/commit/9ff9a04))


### BREAKING CHANGES

* **new:** This needs the functions-templates repo to be up to date. Currently it points to
the next branch, which is up to date.
* **list:** Default output of "twilio-run list" changed
* **start:** Caching of functions is now disabled in local dev mode by default
* **runtime:** The response of getFunctions() changed but is now consistent with the cloud
* **runtime:** Previously private assets would be served during local development. With this
change they'll return a 403 Forbidden instead



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
