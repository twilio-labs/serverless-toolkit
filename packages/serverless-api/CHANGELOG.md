# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.0.1](https://github.com/twilio-labs/serverless-api/compare/v4.0.0...v4.0.1) (2020-07-28)


### Bug Fixes

* upgrade type-fest from 0.15.1 to 0.16.0 ([bfbcdc9](https://github.com/twilio-labs/serverless-api/commit/bfbcdc9b281ea94477f8f2c88c0a9fc7a36a9214))

## [4.0.0](https://github.com/twilio-labs/serverless-api/compare/v3.0.0...v4.0.0) (2020-07-06)


### Features

* add tests for asset error ([#47](https://github.com/twilio-labs/serverless-api/issues/47)) ([581e4ce](https://github.com/twilio-labs/serverless-api/commit/581e4ce7bde33c06e394819f749dc09fee1fdd19))
* **client:** adds username and password support ([#51](https://github.com/twilio-labs/serverless-api/issues/51)) ([80ffe00](https://github.com/twilio-labs/serverless-api/commit/80ffe008a2db0b2d2aa294328a35e0d3c359a19a)), closes [#41](https://github.com/twilio-labs/serverless-api/issues/41)
* **functions:** list function versions & download content ([#52](https://github.com/twilio-labs/serverless-api/issues/52)) ([045a90a](https://github.com/twilio-labs/serverless-api/commit/045a90a536e850f84388cc5dcc06e6f2c0c7b9b5))


### Bug Fixes

* add file name on failing asset upload error ([#47](https://github.com/twilio-labs/serverless-api/issues/47)) ([13fedb2](https://github.com/twilio-labs/serverless-api/commit/13fedb2544acda4d38928fde035eb15783432485))
* **activate:** activating with environment variables ([#49](https://github.com/twilio-labs/serverless-api/issues/49)) ([62c2af6](https://github.com/twilio-labs/serverless-api/commit/62c2af664e56197034f263a309fd73b50d7f38a9))
* **deploy:** stop creating environments with domain suffix 'undefined' ([#50](https://github.com/twilio-labs/serverless-api/issues/50)) ([f5dde4c](https://github.com/twilio-labs/serverless-api/commit/f5dde4c55997d6214f8b930a2dc09a0f09c01e66))

### [3.1.1](https://github.com/twilio-labs/serverless-api/compare/v3.1.0...v3.1.1) (2020-06-25)


### Bug Fixes

* **deploy:** stop creating environments with domain suffix 'undefined' ([#50](https://github.com/twilio-labs/serverless-api/issues/50)) ([f5dde4c](https://github.com/twilio-labs/serverless-api/commit/f5dde4c55997d6214f8b930a2dc09a0f09c01e66))

## [3.1.0](https://github.com/twilio-labs/serverless-api/compare/v3.0.0...v3.1.0) (2020-06-16)


### Features

* add tests for asset error ([#47](https://github.com/twilio-labs/serverless-api/issues/47)) ([581e4ce](https://github.com/twilio-labs/serverless-api/commit/581e4ce7bde33c06e394819f749dc09fee1fdd19))


### Bug Fixes

* **activate:** activating with environment variables ([#49](https://github.com/twilio-labs/serverless-api/issues/49)) ([62c2af6](https://github.com/twilio-labs/serverless-api/commit/62c2af664e56197034f263a309fd73b50d7f38a9))
* add file name on failing asset upload error ([#47](https://github.com/twilio-labs/serverless-api/issues/47)) ([13fedb2](https://github.com/twilio-labs/serverless-api/commit/13fedb2544acda4d38928fde035eb15783432485))

## [3.0.0](https://github.com/twilio-labs/serverless-api/compare/v2.1.0...v3.0.0) (2020-05-21)


### ⚠ BREAKING CHANGES

* the function signature of the individual functions changed. If you only use the methods on the client, nothing should have changed.

### Features

* introduce rate limiting ([#42](https://github.com/twilio-labs/serverless-api/issues/42)) ([6dc1bc4](https://github.com/twilio-labs/serverless-api/commit/6dc1bc43e7516d816a976ea190e7fc4b35a12f3f)), closes [#37](https://github.com/twilio-labs/serverless-api/issues/37)

## [2.1.0](https://github.com/twilio-labs/serverless-api/compare/v1.1.0...v2.1.0) (2020-05-18)


### Features

* add region support ([#39](https://github.com/twilio-labs/serverless-api/issues/39)) ([afe4149](https://github.com/twilio-labs/serverless-api/commit/afe414915932074f64148d94a778d6be8ea22b16))
* unify error interface & upgrade got ([#29](https://github.com/twilio-labs/serverless-api/issues/29)) ([a94e86e](https://github.com/twilio-labs/serverless-api/commit/a94e86ec3f0aabaea9a5bb8d4572ef83c397b504))


### Bug Fixes

* **builds:** support  more than one fn/asset ([0461068](https://github.com/twilio-labs/serverless-api/commit/046106827592b33e66a693b5774402255625a749))
* **content-type:** change content type detection to take hint ([#34](https://github.com/twilio-labs/serverless-api/issues/34)) ([3d96bc0](https://github.com/twilio-labs/serverless-api/commit/3d96bc0520a5aa00d5ee18e2fcc865b4a71a2cd7))
* **functions:** support private functions ([#30](https://github.com/twilio-labs/serverless-api/issues/30)) ([b58eac0](https://github.com/twilio-labs/serverless-api/commit/b58eac0259419a447f8cb9054428f2fe469165f0))
* **paths:** add path verification ([#31](https://github.com/twilio-labs/serverless-api/issues/31)) ([ea1a660](https://github.com/twilio-labs/serverless-api/commit/ea1a6603f1e20a8245ed79a4890fe1110cbce41e))


### Build System

* **npm:** remove shrinkwrap ([#36](https://github.com/twilio-labs/serverless-api/issues/36)) ([2c6fc78](https://github.com/twilio-labs/serverless-api/commit/2c6fc78895f34d20012ad3a82e09d0d3de98064e))

### [2.0.1](https://github.com/twilio-labs/serverless-api/compare/v1.1.0...v2.0.1) (2020-04-28)


### Bug Fixes

* **builds:** support  more than one fn/asset ([0461068](https://github.com/twilio-labs/serverless-api/commit/046106827592b33e66a693b5774402255625a749))


## [2.0.0](https://github.com/twilio-labs/serverless-api/compare/v1.1.0...v2.0.0) (2020-04-28)


### Features

* **[BREAKING CHANGE]** unify error interface & upgrade got ([#29](https://github.com/twilio-labs/serverless-api/issues/29)) ([a94e86e](https://github.com/twilio-labs/serverless-api/commit/a94e86ec3f0aabaea9a5bb8d4572ef83c397b504))


### Bug Fixes

* **[BREAKING CHANGE]** **content-type:** change content type detection to take hint ([#34](https://github.com/twilio-labs/serverless-api/issues/34)) ([3d96bc0](https://github.com/twilio-labs/serverless-api/commit/3d96bc0520a5aa00d5ee18e2fcc865b4a71a2cd7))
* **functions:** support private functions ([#30](https://github.com/twilio-labs/serverless-api/issues/30)) ([b58eac0](https://github.com/twilio-labs/serverless-api/commit/b58eac0259419a447f8cb9054428f2fe469165f0))
* **paths:** add path verification ([#31](https://github.com/twilio-labs/serverless-api/issues/31)) ([ea1a660](https://github.com/twilio-labs/serverless-api/commit/ea1a6603f1e20a8245ed79a4890fe1110cbce41e))


### Build System

* **npm:** remove shrinkwrap ([#36](https://github.com/twilio-labs/serverless-api/issues/36)) ([2c6fc78](https://github.com/twilio-labs/serverless-api/commit/2c6fc78895f34d20012ad3a82e09d0d3de98064e))

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
