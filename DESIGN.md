# Design of the Serverless Toolkit

The Serverless Toolkit is broken up into a variety of sub-projects that serve
different purposes. In order to guide contributors for any contributions to the
Serverless Toolkit, we wrote a set of guidelines that should be taken into
consideration.

- [Design of the Serverless Toolkit](#design-of-the-serverless-toolkit)
  - [1. Modularity](#1-modularity)
  - [2. Designed for Twilio Functions development first](#2-designed-for-twilio-functions-development-first)
  - [3. From Node.js Developers for Node.js Developers](#3-from-nodejs-developers-for-nodejs-developers)
  - [4. The Toolkit should work standalone](#4-the-toolkit-should-work-standalone)
  - [5. Convention over configuration](#5-convention-over-configuration)
  - [6. Convenience over scriptability](#6-convenience-over-scriptability)

## 1. Modularity

While all modules together form the Serverless Toolkit, we offer with the
different modules a way for people to use different parts of the project.

For example the [Serverless Framework Integration](https://github.com/twilio-labs/serverless-framework-integration) makes use of [`@twilio-labs/serverless-api`] but not of any of the CLI functionality.

Right now the project breaks down into the following modules:

| Project                                    | Content                                                                                                                                                                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`twilio-run`]                             | Core CLI logic of the Serverless Toolkit                                                                                                                                                                                      |
| [`create-twilio-function`]                 | CLI logic for creating a new project. This can be called with `npm init twilio-function` and therefore should stay separate                                                                                                   |
| [`@twilio-labs/plugin-serverless`]         | A thin wrapper exposing the commands of [`twilio-run`] and [`create-twilio-function`] to the [Twilio CLI]                                                                                                                     |
| [`@twilio-labs/serverless-api`]            | The core logic that interacts with the REST API. This should not include any CLI-related code. It should instead expose [EventEmitter](https://nodejs.org/api/events.html) or [Streams](https://nodejs.org/api/streams.html). |
| [`function-templates`]                     | The repository hosting all Twilio Function templates exposed by the CLI toolings                                                                                                                                              |
| [`@twilio-labs/serverless-twilio-runtime`] | Twilio Runtime integration for the [Serverless Framework](https://serverless.com/)                                                                                                                                            |
| [`@twilio-labs/serverless-runtime-types`]  | TypeScript definitions for the Twilio Runtime environment                                                                                                                                                                     |

## 2. Designed for Twilio Functions development first

The tooling has some inconsistencies with other tooling of the [Twilio CLI].

For example this tooling uses `ACCOUNT_SID` and `AUTH_TOKEN` in the `.env` file
but the [Twilio CLI] and other tools use `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`.

This is by design because the Twilio Runtime will expose `ACCOUNT_SID` and
`AUTH_TOKEN` to the user instead.

## 3. From Node.js Developers for Node.js Developers

Whenever possible the tooling should not introduce unnecessary configuration but
make it intuitive for any Node.js developer to use it. Some examples:

- `npm install <dep>` should just install a dependency
- Adding an environment variable to the `.env` file should expose it to `process.env`

## 4. The Toolkit should work standalone

This goes inline with #3. A project should be able to be used by anyone who didn't use
Twilio before. As a result setup instructions of any Serverless project should be as
easy as:

```
git clone ... project
cd project
npm install
npm start
```

Therefore, you should be able to install the Toolkit as a developer dependency
using:

```
npm install --save-dev twilio-run
```

## 5. Convention over configuration

Whenever we can avoid the developers having to learn and create configuration, we should.

For example we should prefer the filesystem to infer information rather than
having an explicit configuration file.

## 6. Convenience over scriptability

While scriptability is important, the CLI part of the Toolkit should not be a thin-wrapper
of the REST API to allow Shell scripting. This is a good use case for the [Twilio CLI].

Instead it should focus on creating usable and convenient commands with as little configuration as possible.

[`twilio-run`]: https://npm.im/twilio-run
[`create-twilio-function`]: https://npm.im/create-twilio-function
[`@twilio-labs/plugin-serverless`]: https://npm.im/@twilio-labs/plugin-serverless
[`@twilio-labs/serverless-api`]: https://npm.im/@twilio-labs/serverless-api
[`@twilio-labs/serverless-runtime-types`]: https://npm.im/@twilio-labs/serverless-runtime-types
[`@twilio-labs/serverless-twilio-runtime`]: https://npm.im/@twilio-labs/serverless-twilio-runtime
[`function-templates`]: https://github.com/twilio-labs/function-templates
[twilio cli]: https://twilio.com/docs/cli
