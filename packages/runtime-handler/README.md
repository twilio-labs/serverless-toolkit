# `@twilio/runtime-handler`

## How to use

Define the version of the `@twilio/runtime-handler` inside your `dependencies` section of the `package.json`. For example:

```json
{
  "dependencies": {
    "@twilio/runtime-handler": "1.1.0"
  }
}
```

**Important:** You need to specify the exact version you want to use. Semver ranges are at the moment not supported.

## Local Development Feature

The following features are primarily designed to be used by `twilio-run` and the Serverless Toolkit. This part of the package emulates Twilio Functions for local development and **is NOT available when deployed to Twilio Functions**.

If for some reason you are trying to set up your own local development environment outside of the Serverless Toolkit you can do so through

```js
const { LocalDevelopmentServer } = require('@twilio/runtime-handler/dev');

const server = new LocalDevelopmentServer(port, config);
server.getApp().listen(port);
```

## Contributing

This project welcomes contributions from the community. Please see the [`CONTRIBUTING.md`](https://github.com/twilio-labs/serverless-toolkit/blob/main/docs/CONTRIBUTING.md) file for more details.

## License

MIT
