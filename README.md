[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)

# `twilio-run`

☁️ CLI tool to run Twilio Functions locally for development

## 📦 Installation

You can install the CLI tool via `npm` or another package manager. Ideally install it as a dev dependency instead of global:

```bash
# Install it as a dev dependency
$ npm install twilio-run --save-dev

# Afterwards you can use by using:
$ node_modules/.bin/twilio-run

$ npx twilio-run

# Or inside your package.json scripts section as "twilio-run"
```

## 📖 Usage

```
CLI tool to run Twilio Functions locally for development

Usage
  $ twilio-run [dir]

Options
  --env, -e [/path/to/.env] Loads .env file
  --port, -p <port> Override default port of 3000

Examples
  $ twilio-run
  # Serves all functions in current functions sub directory

  $ twilio-run demo
  # Serves all functions in demo/functions

  $ PORT=9000 twilio-run
  # Serves functions on port 9000

  $ twilio-run --port=4200
  # Serves functions on port 4200

  $ twilio-run --env
  # Loads environment variables from .env file
```

## 💞 Contributing

💖 Please be aware that this project has a [Code of Conduct](CODE_OF_CONDUCT.md) 💖

1.  Fork the project
2.  Clone your own fork like this:

```bash
$ git clone git@github.com:dkundel/twilio-run.git
```

3.  Install the dependencies

```bash
$ cd twilio-run
$ npm install
```

4.  Make changes
5.  Test your changes by running

```bash
$ npm test
```

6.  Commit your changes and open a pull request

## ✨ Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars3.githubusercontent.com/u/1505101?v=4" width="100px;"/><br /><sub><b>Dominik Kundel</b></sub>](https://dkundel.com)<br />[💻](https://github.com/dkundel/twilio-run/commits?author=dkundel "Code") |
| :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## 📜 License

[MIT](LICENSE)
