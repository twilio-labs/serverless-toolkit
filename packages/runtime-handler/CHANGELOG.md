# Change Log

## 2.1.0

### Minor Changes

- [#526](https://github.com/twilio-labs/serverless-toolkit/pull/526) [`d43ab634435d7380dcb0baa8b1a0c26fd8b12e84`](https://github.com/twilio-labs/serverless-toolkit/commit/d43ab634435d7380dcb0baa8b1a0c26fd8b12e84) Thanks [@makserik](https://github.com/makserik)! - handle adding object as header correctly as an error

## 2.0.3

### Patch Changes

- [#524](https://github.com/twilio-labs/serverless-toolkit/pull/524) [`f30d928636267c170b75d2b7d6983739b2ca55e2`](https://github.com/twilio-labs/serverless-toolkit/commit/f30d928636267c170b75d2b7d6983739b2ca55e2) Thanks [@victoray](https://github.com/victoray)! - - update default version for new projects
  - bump dev dependencies @types/express and typedoc
- Updated dependencies [[`f30d928636267c170b75d2b7d6983739b2ca55e2`](https://github.com/twilio-labs/serverless-toolkit/commit/f30d928636267c170b75d2b7d6983739b2ca55e2)]:
  - @twilio-labs/serverless-runtime-types@4.0.1

## 2.0.2

### Patch Changes

- [#487](https://github.com/twilio-labs/serverless-toolkit/pull/487) [`cdf9e3a1fced910acc63cabb41920c96cd81670c`](https://github.com/twilio-labs/serverless-toolkit/commit/cdf9e3a1fced910acc63cabb41920c96cd81670c) Thanks [@stevennic-twilio](https://github.com/stevennic-twilio)! - Fix sync.services deprecation warning

## 2.0.1

### Patch Changes

- [#459](https://github.com/twilio-labs/serverless-toolkit/pull/459) [`7bebf6f370c7fbfab3f1431741a48a8cdaaf552c`](https://github.com/twilio-labs/serverless-toolkit/commit/7bebf6f370c7fbfab3f1431741a48a8cdaaf552c) Thanks [@dkundel](https://github.com/dkundel)! - Fix error messages in local development

- [#392](https://github.com/twilio-labs/serverless-toolkit/pull/392) [`34de0811d9a6980c69f01be9d03251c2f2496b4b`](https://github.com/twilio-labs/serverless-toolkit/commit/34de0811d9a6980c69f01be9d03251c2f2496b4b) Thanks [@philnash](https://github.com/philnash)! - Don't check for exact Content-Type matches

## 2.0.0

### Major Changes

- [#509](https://github.com/twilio-labs/serverless-toolkit/pull/509) [`6d65bea828338a6dd44cb357c324d9b63e74e081`](https://github.com/twilio-labs/serverless-toolkit/commit/6d65bea828338a6dd44cb357c324d9b63e74e081) Thanks [@makserik](https://github.com/makserik)! - Twilio SDK from 3.x to 4.23.0. Required Node version bumped to 18 min.

### Patch Changes

- Updated dependencies [[`6d65bea828338a6dd44cb357c324d9b63e74e081`](https://github.com/twilio-labs/serverless-toolkit/commit/6d65bea828338a6dd44cb357c324d9b63e74e081)]:
  - @twilio-labs/serverless-runtime-types@4.0.0

## 1.3.1

### Patch Changes

- Updated dependencies [[`6ce8f69f05595bcdeac43387015f0f3bbf973b2e`](https://github.com/twilio-labs/serverless-toolkit/commit/6ce8f69f05595bcdeac43387015f0f3bbf973b2e)]:
  - @twilio-labs/serverless-runtime-types@3.0.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.3.0](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.2.5...@twilio/runtime-handler@1.3.0) (2022-11-30)

### Features

- **packages/twilio-run:** regionalize toolkit config and api ([#433](https://github.com/twilio-labs/serverless-toolkit/issues/433)) ([30d5bdb](https://github.com/twilio-labs/serverless-toolkit/commit/30d5bdbe0e8a08b62406af3500ae8bd2d215df1e))

## [1.2.5](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.2.4...@twilio/runtime-handler@1.2.5) (2022-10-11)

**Note:** Version bump only for package @twilio/runtime-handler

## [1.2.4](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.2.3...@twilio/runtime-handler@1.2.4) (2022-08-08)

**Note:** Version bump only for package @twilio/runtime-handler

## [1.2.3](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.2.3-beta.0...@twilio/runtime-handler@1.2.3) (2022-04-27)

**Note:** Version bump only for package @twilio/runtime-handler

## [1.2.3-beta.0](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.2.2...@twilio/runtime-handler@1.2.3-beta.0) (2022-04-27)

**Note:** Version bump only for package @twilio/runtime-handler

## [1.2.2](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.2.1...@twilio/runtime-handler@1.2.2) (2022-01-19)

### Bug Fixes

- **runtime-handler:** corrects types ([024cad1](https://github.com/twilio-labs/serverless-toolkit/commit/024cad10481a08768cbfcfeddb826bb8954d1d28))

# [1.2.1](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.2.0...@twilio/runtime-handler@1.2.1) (2021-11-03)

**Note:** Version bump only for package @twilio/runtime-handler

# [1.2.0](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.1.3...@twilio/runtime-handler@1.2.0) (2021-10-15)

### Bug Fixes

- **runtime-handler:** fall back to assets/index.html for root path ([54bfeda](https://github.com/twilio-labs/serverless-toolkit/commit/54bfeda7a8bf3b196888f8d2b75c89a8c362afcb)), closes [#371](https://github.com/twilio-labs/serverless-toolkit/issues/371)

### Features

- add support for request headers & cookies ([#373](https://github.com/twilio-labs/serverless-toolkit/issues/373)) ([989307d](https://github.com/twilio-labs/serverless-toolkit/commit/989307d0e73b06056ecb571958fbab39b38bfea2)), closes [#293](https://github.com/twilio-labs/serverless-toolkit/issues/293) [#296](https://github.com/twilio-labs/serverless-toolkit/issues/296) [#297](https://github.com/twilio-labs/serverless-toolkit/issues/297) [#314](https://github.com/twilio-labs/serverless-toolkit/issues/314) [#332](https://github.com/twilio-labs/serverless-toolkit/issues/332)
- **twilio-run:** adds json output to twilio-run deploy ([9ae1478](https://github.com/twilio-labs/serverless-toolkit/commit/9ae147816af85a671ed37639e83d0fa105f8ecb2))

# [1.2.0-rc.3](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.2.0-rc.2...@twilio/runtime-handler@1.2.0-rc.3) (2021-08-03)

**Note:** Version bump only for package @twilio/runtime-handler

# [1.2.0-rc.2](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.2.0-rc.1...@twilio/runtime-handler@1.2.0-rc.2) (2021-07-28)

### Bug Fixes

- **runtime-handler:** using set-cookie now sets cookie header ([#332](https://github.com/twilio-labs/serverless-toolkit/issues/332)) ([6f65bc3](https://github.com/twilio-labs/serverless-toolkit/commit/6f65bc3bb692b8bd0b21d932f66ae394000e51a9))

# [1.2.0-beta.0](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.1.3...@twilio/runtime-handler@1.2.0-beta.0) (2021-09-25)

### Features

- **twilio-run:** adds json output to twilio-run deploy ([9ae1478](https://github.com/twilio-labs/serverless-toolkit/commit/9ae147816af85a671ed37639e83d0fa105f8ecb2))

## [1.1.3](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.1.2...@twilio/runtime-handler@1.1.3) (2021-07-28)

**Note:** Version bump only for package @twilio/runtime-handler

# [1.2.0-rc.1](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.1.1...@twilio/runtime-handler@1.2.0-rc.1) (2021-07-14)

### Features

- **handler:** update header and cookie support for Response ([#296](https://github.com/twilio-labs/serverless-toolkit/issues/296)) ([e9ef02e](https://github.com/twilio-labs/serverless-toolkit/commit/e9ef02ed9e10635623f462db6f53de3669ffaf0b))
- **runtime-handler:** handle incoming headers and cookies ([#293](https://github.com/twilio-labs/serverless-toolkit/issues/293)) ([62ff180](https://github.com/twilio-labs/serverless-toolkit/commit/62ff1801db6a121122fcd944a855ad7f038cafe4))

## [1.1.2](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.1.1...@twilio/runtime-handler@1.1.2) (2021-07-19)

### Bug Fixes

- **runtime-handler:** add warning for optional context vars ([#317](https://github.com/twilio-labs/serverless-toolkit/issues/317)) ([47051de](https://github.com/twilio-labs/serverless-toolkit/commit/47051dec50ce477d22bc6be0f87d58950c4a1919))

## [1.1.1](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.1.0...@twilio/runtime-handler@1.1.1) (2021-06-30)

### Bug Fixes

- **response:** brings Response object to parity with Functions ([#287](https://github.com/twilio-labs/serverless-toolkit/issues/287)) ([0c66d97](https://github.com/twilio-labs/serverless-toolkit/commit/0c66d97a344cf43b2e0c95a12e054fedecc1b027))

# [1.1.0](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.0.2...@twilio/runtime-handler@1.1.0) (2021-06-21)

### Bug Fixes

- **twilio-run:** correctly serialize JSON Responses ([#277](https://github.com/twilio-labs/serverless-toolkit/issues/277)) ([a40291d](https://github.com/twilio-labs/serverless-toolkit/commit/a40291dd63332542eed03144ffd7b5c1bd245357))

### Features

- extract runtime-handler and lazyLoading ([#252](https://github.com/twilio-labs/serverless-toolkit/issues/252)) ([#271](https://github.com/twilio-labs/serverless-toolkit/issues/271)) ([0dde2a5](https://github.com/twilio-labs/serverless-toolkit/commit/0dde2a5a74035700e4ef6cf4b1c1189c78e2ff59))

# [1.1.0-rc.3](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.0.2...@twilio/runtime-handler@1.1.0-rc.3) (2021-05-24)

### Features

- extract runtime-handler and lazyLoading ([#252](https://github.com/twilio-labs/serverless-toolkit/issues/252)) ([4b11e69](https://github.com/twilio-labs/serverless-toolkit/commit/4b11e693248e44a8c6db4a95cf90e79e00f7db08))

## [1.0.2](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.0.2-beta.3...@twilio/runtime-handler@1.0.2) (2021-05-19)

**Note:** Version bump only for package @twilio/runtime-handler

## [1.0.2-beta.3](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.0.2-beta.2...@twilio/runtime-handler@1.0.2-beta.3) (2021-04-21)

**Note:** Version bump only for package @twilio/runtime-handler

## [1.0.2-beta.2](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.0.2-beta.1...@twilio/runtime-handler@1.0.2-beta.2) (2021-04-21)

**Note:** Version bump only for package @twilio/runtime-handler

## [1.0.2-beta.1](https://github.com/twilio-labs/serverless-toolkit/compare/@twilio/runtime-handler@1.0.2-beta.0...@twilio/runtime-handler@1.0.2-beta.1) (2021-04-21)

**Note:** Version bump only for package @twilio/runtime-handler

## 1.0.2-beta.0 (2021-04-21)

**Note:** Version bump only for package @twilio/runtime-handler

<a name="1.0.1"></a>

## 1.0.1 (2021-04-16)
