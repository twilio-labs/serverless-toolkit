# Twilio Runtime Serverless Plugin

This plugin enables Twilio Functions and Assets support within the Serverless Framework.

## Getting started

### Pre-requisites

- Node.js v8.10.0 (this is the runtime version supported by Azure Functions)
- Serverless CLI v1.48.0+. You can run npm i -g serverless if you don't already have it.
- A Twilio account. If you don't have one you can [sign up quickly](https://www.twilio.com/try-twilio).

### Create a new Twilio service

- Create a new service using the standard Node.js template, specifying a unique name for your app: `serverless create -t twilio-nodejs -p <appName>`
- `cd` into the generated app directory: `cd <appName>`
- Install the app's NPM dependencies, which includes this plugin: `npm install`

### Deploy, test, and diagnose your Twilio runtime

1. Now that you have the service on your local machine you can deploy your service using the credentials you find in [the Twilio Console](https://www.twilio.com/console/).

### Supported commands

#### `serverless deploy`

Deploy all functions and assets defined in your `serverless.yml`

```
serverless deploy
```

Deploying of a single function is also supported using the `--function` or `-f` parameter.

```
serverless deploy --function hello-world
```

#### `serverless info` (WIP)

Get information about the currently deployed runtime.

```
serverless info --types functions,assets
```

#### `serverless invoke` (WIP)

Invoke a deployed function and see the result. Define the function using `--function` or `-f` parameter.

```
serverless invoke --function hello-world
```
