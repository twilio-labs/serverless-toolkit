# Migration Guides

## Migrating from Serverless Toolkit V2 to V3

What changed? The main changes are the following:

### 1. No more `.twilio-functions` file.

The `.twilio-functions` file is being replaced by a `.twilioserverlessrc` file for any configuration you want to do and a `.twiliodeployinfo` file. 

The `.twilioserverlessrc` file can be checked into your project and helps especially with more complex applications. Check out the [Configuration documentation](CONFIGURATION.md) for more information.

The `.twiliodeployinfo` file can be commited to your project but is primarily intended to make commands more convenient for you. This file gets updated as part of deployments.

To transition your `.twilio-functions` file we provide a convenience script that takes care of some of the work. You can run it by running:

```bash
npx -p twilio-run@next twilio-upgrade-config
```

### 2. Changed credential handling

**If you are using the [Twilio CLI](https://twil.io/cli)** the credentials in your `.env` file are no longer used for anything other than local development. Instead we'll default to the credentials your Twilio CLI is using unless you explicitly change them using either the `-p` flag or `--username` and `--password`.

**If you are using `twilio-run` directly**: The `--accountSid` and `--authToken` flags are no longer valid. Use `--username` and `--password` instead.

### 3. Forked Processes for Function Executions

The local development feature of the Serverless Toolkit is not an identical implementation of the Twilio Functions runtime, however, we try to mimic it as close as possible while helping to adhere to best practices. 

In the latest version we have enabled process forking for Function executions. What this means is that every invocation of your Function locally will be executed in a standalone matter. That means state between two executions is no longer shared. This effectively simulates a "cold" start of your Functions. While you can share state between deployed Function invokations while the Function is considered "hot", you should ideally not rely on it.

If you are relying on said behavior and need to revert to sharing state during local development, you can use the `--no-fork-process` flag: `twilio serverless:start --no-fork-process` or by adding the following to your `.twilioserverlessrc` file:

```json
{
  "forkProcess": false
}
```

## FAQ

### How do I know which version I'm using?

There are two ways you can consume the Serverless Toolkit and the ways to determine your version are different.

**Scenario 1**: If you are using the Twilio CLI and `@twilio-labs/plugin-serverless` run the following command:

```bash
twilio plugins
```

Your output should contain something like: `@twilio-labs/plugin-serverless 1.9.0`. In this case your version of `@twilio-labs/plugin-serverless` is version 1.9.0 and to get your Serverless Toolkit version increment the first number by one. So in this case you have Serverless Toolkit V2.

**Scenario 2**: If you are using `twilio-run` directly.

Run the following command. The first number will be your Serverless Toolkit version:

```bash
npx twilio-run --version
```
