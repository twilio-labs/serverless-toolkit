# Change Log

## 4.0.0

### Major Changes

- [#565](https://github.com/twilio-labs/serverless-toolkit/pull/565) [`ee4cf89dc032bd795a127beba0a81c4afb824cd5`](https://github.com/twilio-labs/serverless-toolkit/commit/ee4cf89dc032bd795a127beba0a81c4afb824cd5) Thanks [@AndreLars](https://github.com/AndreLars)! - **WHAT**: Add Node.js 24 to supported versions and remove Node.js 20.

  **ALSO**: `twilio-run deploy` now warns when a project is configured to deploy to a deprecated runtime such as `node20`, pointing at the `runtime` field in `.twilioserverlessrc`. It is a warning, not a failure — the deploy still proceeds and Twilio Serverless has the final say. Both this check and the local Node.js version check use a deny list of deprecated versions rather than an allow list of supported ones, so an older release of the toolkit never claims a newer Node.js version is invalid. `printVersionWarning` drops its unused `expectedVersion` parameter as part of this.

  **WHY**: `node24` was added as a deploy runtime and made the default in #555, but `engines.node` was never widened, so the toolkit defaulted to deploying to node24 while refusing to declare support for running on Node 24 (#563). Node.js 20 is deprecated on Twilio Serverless and can no longer be used for new builds, so it is removed at the same time.

  **BREAKING CHANGE**: Projects using `create-twilio-function`, `@twilio-labs/plugin-assets`, `@twilio-labs/plugin-serverless`, `@twilio-labs/serverless-twilio-runtime` or `twilio-run` will have to migrate to Node.js 22 or 24.

## 3.0.0

### Major Changes

- [#544](https://github.com/twilio-labs/serverless-toolkit/pull/544) [`9f945cd79e89aaa00474c56a5ab3d6b41415b874`](https://github.com/twilio-labs/serverless-toolkit/commit/9f945cd79e89aaa00474c56a5ab3d6b41415b874) Thanks [@alfrol](https://github.com/alfrol)! - **WHAT**: Remove Node.js 18 from supported versions.

  **WHY**: Node.js 18 is EOL and will not receive bug fixes or security upgrades. Users should migrate to Node.js 20 or 22.

  **BREAKING CHANGE**: Projects using `create-twilio-function`, `@twilio-labs/plugin-asset`, `@twilio-labs/plugin-serverless`, `@twilio-labs/serverless-twilio-runtime` or `twilio-run` will have to migrate to Node.js 20 or 22.

## 2.0.2

### Patch Changes

- [#527](https://github.com/twilio-labs/serverless-toolkit/pull/527) [`255da3b99f3ae015b1f8c27670937c62a0d52771`](https://github.com/twilio-labs/serverless-toolkit/commit/255da3b99f3ae015b1f8c27670937c62a0d52771) Thanks [@AndreLars](https://github.com/AndreLars)! - fix(twilio-run): handle adding object as header correctly as an error

- Updated dependencies [[`13b9a2e5c41a960161467cf0290bb143672907ff`](https://github.com/twilio-labs/serverless-toolkit/commit/13b9a2e5c41a960161467cf0290bb143672907ff)]:
  - @twilio-labs/serverless-api@5.6.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.1](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-twilio-runtime@2.0.0...@twilio-labs/serverless-twilio-runtime@2.0.1) (2021-07-14)

**Note:** Version bump only for package @twilio-labs/serverless-twilio-runtime

# [2.0.0](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-twilio-runtime@2.0.0-beta.3...@twilio-labs/serverless-twilio-runtime@2.0.0) (2021-05-19)

**Note:** Version bump only for package @twilio-labs/serverless-twilio-runtime

# [2.0.0-beta.3](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-twilio-runtime@2.0.0-beta.2...@twilio-labs/serverless-twilio-runtime@2.0.0-beta.3) (2021-04-21)

**Note:** Version bump only for package @twilio-labs/serverless-twilio-runtime

# [2.0.0-beta.2](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-twilio-runtime@2.0.0-beta.1...@twilio-labs/serverless-twilio-runtime@2.0.0-beta.2) (2021-04-21)

**Note:** Version bump only for package @twilio-labs/serverless-twilio-runtime

# 2.0.0-beta.1 (2021-04-21)

**Note:** Version bump only for package @twilio-labs/serverless-twilio-runtime

# 2.0.0-beta.0 (2020-08-27)

**Note:** Version bump only for package @twilio-labs/serverless-twilio-runtime

# Changelog

All notable changes to this project will be documented in this file.

<a name="1.0.6"></a>

## 1.0.6 (2020-08-12)
