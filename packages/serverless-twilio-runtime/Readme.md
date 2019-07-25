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
$ serverless deploy

sls deploy
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: twilio-runtime: Creating Service
Serverless: twilio-runtime: Configuring "final-test" environment
Serverless: twilio-runtime: Creating 2 Functions
Serverless: twilio-runtime: Uploading 2 Functions
Serverless: twilio-runtime: Creating 1 Assets
Serverless: twilio-runtime: Uploading 1 Assets
Serverless: twilio-runtime: Waiting for deployment.
Serverless: twilio-runtime: Waiting for deployment. Current status: building
Serverless: twilio-runtime: Setting environment variables
Serverless: twilio-runtime: Activating deployment
Serverless: twilio-runtime: Function available at: xxx-123-dev.twil.io/hello-world
Serverless: twilio-runtime: Asset available at: xxx-123-dev.twil.io/image.jpg

```

#### `serverless info`

Get information about the currently deployed runtime.

```
$ serverless info

Service information
*******

Service: xxx
Service Sid: ZS...

Environment: dev
Environment unique name: dev-environment
Environment Sid: ZE...
Environment domain name: xxx-123-dev.twil.io
Environment variables:
  FOO: BAR

Assets:
  access: public
  creation date: 2019-07-25T11:03:46Z
  path: /image.jpg
  sid: ZN...
  url: https://xxx-123-dev.twil.io/image.jpg

Functions:
  access: public
  creation date: 2019-07-25T11:03:31Z
  path: /hello-world
  sid: ZN...
  url: https://xxx-123-dev.twil.io/hello-world
```

#### `serverless invoke`

Invoke a deployed function and see the result. Define the function using `--function` or `-f` parameter.

```
$ serverless invoke --function hello-world

sls invoke -f hello-world

  ,--------------------------------------------------------------------------.
  |                                                                          |
  |    _____          _ _ _         ____              _   _                  |
  |   |_   _|_      _(_) (_) ___   |  _ \ _   _ _ __ | |_(_)_ __ ___   ___   |
  |     | | \ \ /\ / / | | |/ _ \  | |_) | | | | '_ \| __| | '_ ` _ \ / _ \  |
  |     | |  \ V  V /| | | | (_) | |  _ <| |_| | | | | |_| | | | | | |  __/  |
  |     |_|   \_/\_/ |_|_|_|\___/  |_| \_\\__,_|_| |_|\__|_|_| |_| |_|\___|  |
  |                                                                          |
  |                                                                          |
  |                                                           version 1.0.0  |
  |                                                                          |
  |                                                                          |
  `--------------------------------------------------------------------------'
```
