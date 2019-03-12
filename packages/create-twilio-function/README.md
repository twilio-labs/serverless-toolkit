# `create-twilio-function`

A command line tool to setup a new [Twilio Function](https://www.twilio.com/docs/api/runtime/functions) with local testing using [`twilio-run`](https://github.com/dkundel/twilio-run).

## Usage

There are a number of ways to use this tool. The quickest and easiest is with `npm init`:

```bash
npm init twilio-function function-name
cd function-name
npm start
```

This will create a new directory named "function-name" and include all the files you need to write and run a Twilio Function locally. Starting the application will host the example function at localhost:3000/example.

### Alternatives

You can also use `npx` to run `create-twilio-function`:

```bash
npx create-twilio-function function-name
```

Or you can install the module globally:

```bash
npm install create-twilio-function -g
create-twilio-function function-name
```

## Command line arguments

```bash
create-twilio-function <name>

Creates a new Twilio Function project

Positionals:
  name  The name of your project directory.                             [string]

Options:
  --accountSid, -a  The Account SID for your Twilio account             [string]
  --authToken, -a   The Auth Token for your Twilio account              [string]
  -h, --help        Show help                                          [boolean]
  -v, --version     Show version number                                [boolean]
```

## Contributing

Any help contributing to this project is welcomed. Make sure you read and agree with the [code of conduct](CODE_OF_CONDUCT.md).

1. Fork the project
2. Clone the fork like so:

```bash
git clone git@github.com:YOUR_USERNAME/create-twilio-function.git
```

3. Install the dependencies

```bash
cd create-twilio-function
npm install
```

4. Make your changes
5. Test your changes with

```bash
npm test
```

6. Commit your changes and open a pull request

## LICENSE

MIT
