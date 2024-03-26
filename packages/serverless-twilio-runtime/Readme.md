# Twilio Runtime Plugin for Serverless Framework

![Npm Version](https://img.shields.io/npm/v/@twilio-labs/serverless-twilio-runtime.svg?style=flat-square)

Serverless Framework plugin to deploy to the Twilio Runtime.

## Getting started

### Pre-requisites

- Node.js v18.x (this is the runtime version supported by Twilio Functions)
- Serverless CLI v1.50.0+. You can run npm i -g serverless if you don't already have it.
- A Twilio account. If you don't have one you can [sign up quickly](https://www.twilio.com/try-twilio).

### Create a new Twilio service

- Run `serverless create -t twilio-nodejs -p my-twilio-project`
- `cd my-twilio-project`
- define `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` as [environment vars](https://www.twilio.com/blog/2017/01/how-to-set-environment-variables.html)
- run `serverless deploy` to deploy the service
- run `serverless invoke -f hello-world` to invoke the deployed `hello-world` function
- run `serverless info` to retrieve information about your Twilio Runtime service

#### Minimal `serverless.yml` configuration

```yaml
service: your-service # update this with your service name

provider:
  name: twilio

  # Twilio access credentials (mandatory)
  config:
    accountSid: ${env:TWILIO_ACCOUNT_SID}
    authToken: ${env:TWILIO_AUTH_TOKEN}

  # Twilio runtime supports several domains
  # your functions and assets will be available under
  # -> defaulting to 'dev'
  environment: ${env:TWILIO_RUNTIME_ENV, 'dev'}

# Twilio runtime has to be added as a plugin
plugins:
  - "@twilio-labs/serverless-twilio-runtime"

functions:
  # Function name
  hello-world:
    # Path to the JS handler function in the project (without file extension '.js')
    handler: functions/hello-world
    # URL path of the function after deployment
    path: /hello-world-path
    # visibility of the function (can be "public" or "protected")
    access: public
```

### Deploy, test, and diagnose your Twilio runtime

To deploy, you will need either some environment variables set or manually input the `accountSid` and `authToken` in the `provider.config` section of your `serverless.yml`. You can find the credentials in [the Twilio Console](https://www.twilio.com/console/).

```yaml
service: your-service # update this with your service name

provider:
  name: twilio

  # Twilio access credentials (mandatory)
  config:
    accountSid: ${env:TWILIO_ACCOUNT_SID}
    authToken: ${env:TWILIO_AUTH_TOKEN}
```

Note that you have to configure `provider.config` with a `accountSid` and `authToken` property.

### All supported configuration - `serverless.yml`

The Twilio runtime supports the following configuration options as of today:

```yaml
# serverless.yml

# Name of your service
service: your-service

# Provider definition
# all functions and assets
# share the same provider configuration
provider:
  # Twilio runtime as your preferred provider
  name: twilio

  # Auth credentials which you'll find at twilio.com/console
  config:
    accountSid: ${env:TWILIO_ACCOUNT_SID}
    authToken: ${env:TWILIO_AUTH_TOKEN}

  # Dependency definitions similar
  # to dependencies in a package.json
  # -> these dependencies will be available in the
  #    Twilio Node.js runtime
  dependencies:
    asciiart-logo: "*"

  # Twilio runtime supports several domains
  # your functions and assets will be available under
  # -> defaulting to 'dev'
  environment: ${env:TWILIO_RUNTIME_ENV, 'dev'}

  # Environment variables passed to your functions
  # available in the Twilio runtime via `context` function parameter
  environmentVars:
    MY_MESSAGE: "This is cool stuff"

# Twilio runtime has to be added as a plugin
plugins:
  - "@twilio-labs/serverless-twilio-runtime"

functions:
  # Function name
  hello-world:
    # Path to the JS handler function in the project (without file extension '.js')
    handler: functions/hello-world
    # URL path of the function after deployment
    path: /hello-world-path
    # visibility of the function (can be "public" or "protected")
    access: public

resources:
  assets:
    # Asset name
    asset-image:
      # path to the asset in the project
      filePath: assets/image.jpg
      # URL path to the asset after deployment
      path: /image.jpg
      # visibility of the asset
      access: public
```

### Supported commands

#### Deploy the service - `serverless deploy`

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

#### Get service information - `serverless info`

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

#### Invoke a deployed function - `serverless invoke`

Invoke a deployed function by referencing its name and see the response. Define the function using `--function` or `-f` parameter.

_Make sure that you deployed the service first._

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

## Contributing

This project welcomes contributions from the community. Please see the [`CONTRIBUTING.md`](https://github.com/twilio-labs/serverless-toolkit/blob/main/docs/CONTRIBUTING.md) file for more details.

### Code of conduct

Please note that this project is released with a [Contributor Code of Conduct](code-of-conduct.md). By participating in this project you agree to abide by its terms.

## License

[MIT](./LICENSE)
