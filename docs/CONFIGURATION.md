# Configuration

## Examples

### Functions with Preprocessor like TypeScript or Babel

By default the Serverless Toolkit will be looking for Functions inside a `functions/` or `src/` directory and for assets for an `assets/` or `static/` directory.

If you are using a pre-processor such as TypeScript or Babel, your structure might look different. For example maybe you have a structure where `src/` contains all TypeScript files and `dist/` contains the output.

In which case you'd want a config that looks similar to this:

```json
{
  "functionsFolderName": "dist"
}
```

### Using different `.env` files for different environments

If you are deploying to different environments you might want different environment variables for your application.

You can specify environment specific configurations inside the config file by using the domain suffix of your environment.

If you are using the `--production` flag you'll need to use the environment: `*`.

For example:

```json
{
  "environments": {
    "dev": {
      "env": ".env"
    },
    "stage": {
      "env": ".env.stage"
    },
    "*": {
      "env": ".env.prod"
    }
  }
}
```

### Deploy to specific services on different accounts

There might be a scenario where you want to deploy the same project to different Twilio accounts or projects with different services.

Inside the config you can define which service the project should be deployed to depending on the Twilio Account SID.

```json
{
  "projects": {
    "AC11111111111111111111111111111111": {
      "serviceSid": "ZSaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    },
    "AC22222222222222222222222222222222": {
      "serviceSid": "ZSbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    }
  }
}
```
