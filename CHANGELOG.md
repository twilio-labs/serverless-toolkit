# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
