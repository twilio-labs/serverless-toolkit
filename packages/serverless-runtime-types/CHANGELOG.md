# Change Log

## 4.0.1

### Patch Changes

- [#524](https://github.com/twilio-labs/serverless-toolkit/pull/524) [`f30d928636267c170b75d2b7d6983739b2ca55e2`](https://github.com/twilio-labs/serverless-toolkit/commit/f30d928636267c170b75d2b7d6983739b2ca55e2) Thanks [@victoray](https://github.com/victoray)! - - update default version for new projects
  - bump dev dependencies @types/express and typedoc

## 4.0.0

### Major Changes

- [#509](https://github.com/twilio-labs/serverless-toolkit/pull/509) [`6d65bea828338a6dd44cb357c324d9b63e74e081`](https://github.com/twilio-labs/serverless-toolkit/commit/6d65bea828338a6dd44cb357c324d9b63e74e081) Thanks [@makserik](https://github.com/makserik)! - Twilio SDK from 3.x to 4.23.0. Required Node version bumped to 18 min.

## 3.0.0

### Major Changes

- [#502](https://github.com/twilio-labs/serverless-toolkit/pull/502) [`6ce8f69f05595bcdeac43387015f0f3bbf973b2e`](https://github.com/twilio-labs/serverless-toolkit/commit/6ce8f69f05595bcdeac43387015f0f3bbf973b2e) Thanks [@makserik](https://github.com/makserik)! - chore(@twilio-labs/serverless-runtime-types): node sdk and ts bump

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.2.3](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-runtime-types@2.2.3-beta.0...@twilio-labs/serverless-runtime-types@2.2.3) (2022-04-27)

**Note:** Version bump only for package @twilio-labs/serverless-runtime-types

## [2.2.3-beta.0](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-runtime-types@2.2.2...@twilio-labs/serverless-runtime-types@2.2.3-beta.0) (2022-04-27)

**Note:** Version bump only for package @twilio-labs/serverless-runtime-types

## [2.2.2](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-runtime-types@2.2.1...@twilio-labs/serverless-runtime-types@2.2.2) (2022-01-19)

**Note:** Version bump only for package @twilio-labs/serverless-runtime-types

# [2.2.1](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-runtime-types@2.2.0...@twilio-labs/serverless-runtime-types@2.2.1) (2021-11-03)

### Documentation

- **runtime-types** add sync alias comments, punctuation nitpicks ([41b3e15](https://github.com/twilio-labs/serverless-toolkit/commit/41b3e1584400db9039f6f941690e935dff26a9a6))
- **runtime-types** adds TSDoc comments to the Context object ([ceee356](https://github.com/twilio-labs/serverless-toolkit/commit/ceee356224d305ba2f7b45d05da0fb30d48fdf7b))
- **runtime-types** adds TSDoc comments to RuntimeInstance methods ([9b0fdb7](https://github.com/twilio-labs/serverless-toolkit/commit/9b0fdb7fd291b68a0792ddaff4f4a2c265645277))
- **runtime-types** adds TSDoc comments to TwilioResponse methods ([c5b3263](https://github.com/twilio-labs/serverless-toolkit/commit/c5b3263b6b86b8d66a67d73980388dad001fc2e4))

# [2.2.0](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-runtime-types@2.1.2...@twilio-labs/serverless-runtime-types@2.2.0) (2021-10-15)

### Features

- add support for request headers & cookies ([#373](https://github.com/twilio-labs/serverless-toolkit/issues/373)) ([989307d](https://github.com/twilio-labs/serverless-toolkit/commit/989307d0e73b06056ecb571958fbab39b38bfea2)), closes [#293](https://github.com/twilio-labs/serverless-toolkit/issues/293) [#296](https://github.com/twilio-labs/serverless-toolkit/issues/296) [#297](https://github.com/twilio-labs/serverless-toolkit/issues/297) [#314](https://github.com/twilio-labs/serverless-toolkit/issues/314) [#332](https://github.com/twilio-labs/serverless-toolkit/issues/332)

# [2.2.0-rc.0](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-runtime-types@2.1.0...@twilio-labs/serverless-runtime-types@2.2.0-rc.0) (2021-07-14)

### Features

- **runtime-types:** add cookie/header support for types ([#297](https://github.com/twilio-labs/serverless-toolkit/issues/297)) ([e04fbcb](https://github.com/twilio-labs/serverless-toolkit/commit/e04fbcbd89fdda2fe3c55928df5c630cd9989fa9))

## [2.1.1](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-runtime-types@2.1.0...@twilio-labs/serverless-runtime-types@2.1.1) (2021-07-19)

### Bug Fixes

- **runtime-handler:** add warning for optional context vars ([#317](https://github.com/twilio-labs/serverless-toolkit/issues/317)) ([47051de](https://github.com/twilio-labs/serverless-toolkit/commit/47051dec50ce477d22bc6be0f87d58950c4a1919))

# [2.1.0](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-runtime-types@2.0.0...@twilio-labs/serverless-runtime-types@2.1.0) (2021-06-21)

### Features

- extract runtime-handler and lazyLoading ([#252](https://github.com/twilio-labs/serverless-toolkit/issues/252)) ([#271](https://github.com/twilio-labs/serverless-toolkit/issues/271)) ([0dde2a5](https://github.com/twilio-labs/serverless-toolkit/commit/0dde2a5a74035700e4ef6cf4b1c1189c78e2ff59))

# [2.1.0-rc.0](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-runtime-types@2.0.0...@twilio-labs/serverless-runtime-types@2.1.0-rc.0) (2021-05-24)

### Features

- extract runtime-handler and lazyLoading ([#252](https://github.com/twilio-labs/serverless-toolkit/issues/252)) ([4b11e69](https://github.com/twilio-labs/serverless-toolkit/commit/4b11e693248e44a8c6db4a95cf90e79e00f7db08))

# [2.0.0](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-runtime-types@2.0.0-beta.3...@twilio-labs/serverless-runtime-types@2.0.0) (2021-05-19)

**Note:** Version bump only for package @twilio-labs/serverless-runtime-types

# [2.0.0-beta.3](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-runtime-types@2.0.0-beta.2...@twilio-labs/serverless-runtime-types@2.0.0-beta.3) (2021-04-21)

**Note:** Version bump only for package @twilio-labs/serverless-runtime-types

# [2.0.0-beta.2](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio-labs/serverless-runtime-types@2.0.0-beta.1...@twilio-labs/serverless-runtime-types@2.0.0-beta.2) (2021-04-21)

**Note:** Version bump only for package @twilio-labs/serverless-runtime-types

# 2.0.0-beta.1 (2021-04-21)

### Bug Fixes

- update to correct type import ([ea0994f](https://github.com/twilio-labs/serverless-toolkit/commit/ea0994f598a550188794d84554e1d11b5edbc198))
- **deps:** npm is not happy about @types/qs ([0d4e6a8](https://github.com/twilio-labs/serverless-toolkit/commit/0d4e6a894d154996470b9ab4bdd9b72095b7bd94))
- **types:** add extended sync service types ([e735e81](https://github.com/twilio-labs/serverless-toolkit/commit/e735e81a3872a723b8276506eb046f6d327166c6))
- **types:** add other values to callback signature ([d024032](https://github.com/twilio-labs/serverless-toolkit/commit/d024032b8200d8c8fba41f557752b5b5a1ba9cf6))
- **types:** improve types for Twilio Functions ([c7eb678](https://github.com/twilio-labs/serverless-toolkit/commit/c7eb678ff3e8d0fd27ec595945ab944679e54177))

### Features

- add initial release ([b8177f7](https://github.com/twilio-labs/serverless-toolkit/commit/b8177f777b03582d607173e96f1c778e703a90e4))
- **deploy:** adds runtime as a flag to the deploy command ([#218](https://github.com/twilio-labs/serverless-toolkit/issues/218)) ([789ec02](https://github.com/twilio-labs/serverless-toolkit/commit/789ec027f1151be156e1fb01b4e4110ca0de9c44))
- **twilio-run:** restructure configuration ([#198](https://github.com/twilio-labs/serverless-toolkit/issues/198)) ([f88d490](https://github.com/twilio-labs/serverless-toolkit/commit/f88d49027980ee4c4d7f630918f860a987f13887)), closes [#166](https://github.com/twilio-labs/serverless-toolkit/issues/166)
- **types:** add Context type ([ce2e171](https://github.com/twilio-labs/serverless-toolkit/commit/ce2e17151520f5722327692f5f3c55f7dbbceef0))
- **types:** add ServerlessFunctionSignature types ([3d258ba](https://github.com/twilio-labs/serverless-toolkit/commit/3d258ba126cc976d967aa16012960e5185b6e6d2))

### BREAKING CHANGES

- **twilio-run:** Drops support for .twilio-functions files and internally restructures activate
  files to promote

# 2.0.0-beta.0 (2020-08-27)

### Bug Fixes

- **types:** add extended sync service types ([e735e81](https://github.com/twilio-labs/serverless-toolkit/commit/e735e81a3872a723b8276506eb046f6d327166c6))
- update to correct type import ([ea0994f](https://github.com/twilio-labs/serverless-toolkit/commit/ea0994f598a550188794d84554e1d11b5edbc198))
- **types:** add other values to callback signature ([d024032](https://github.com/twilio-labs/serverless-toolkit/commit/d024032b8200d8c8fba41f557752b5b5a1ba9cf6))
- **types:** improve types for Twilio Functions ([c7eb678](https://github.com/twilio-labs/serverless-toolkit/commit/c7eb678ff3e8d0fd27ec595945ab944679e54177))

### Features

- add initial release ([b8177f7](https://github.com/twilio-labs/serverless-toolkit/commit/b8177f777b03582d607173e96f1c778e703a90e4))
- **types:** add Context type ([ce2e171](https://github.com/twilio-labs/serverless-toolkit/commit/ce2e17151520f5722327692f5f3c55f7dbbceef0))
- **types:** add ServerlessFunctionSignature types ([3d258ba](https://github.com/twilio-labs/serverless-toolkit/commit/3d258ba126cc976d967aa16012960e5185b6e6d2))

# Changelog

All notable changes to this project will be documented in this file.

<a name="1.1.8"></a>

## 1.1.8 (2020-08-12)

### Bug Fixes

- **types:** add extended sync service types ([e735e81](https://github.com/twilio-labs/twilio-runtime-types/commit/e735e81))
- update to correct type import ([ea0994f](https://github.com/twilio-labs/twilio-runtime-types/commit/ea0994f))
- **types:** add other values to callback signature ([d024032](https://github.com/twilio-labs/twilio-runtime-types/commit/d024032))
- **types:** improve types for Twilio Functions ([c7eb678](https://github.com/twilio-labs/twilio-runtime-types/commit/c7eb678))

### Features

- add initial release ([b8177f7](https://github.com/twilio-labs/twilio-runtime-types/commit/b8177f7))
- **types:** add Context type ([ce2e171](https://github.com/twilio-labs/twilio-runtime-types/commit/ce2e171))
- **types:** add ServerlessFunctionSignature types ([3d258ba](https://github.com/twilio-labs/twilio-runtime-types/commit/3d258ba))
