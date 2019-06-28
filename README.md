[![npm](https://img.shields.io/npm/v/twilio-run.svg?style=flat-square)](https://npmjs.com/package/twilio-run) [![npm](https://img.shields.io/npm/dt/twilio-run.svg?style=flat-square)](https://npmjs.com/package/twilio-run) [![npm](https://img.shields.io/npm/l/twilio-run.svg?style=flat-square)](/LICENSE) [![Build Status](https://travis-ci.com/twilio-labs/twilio-run.svg?branch=master)](https://travis-ci.com/twilio-labs/twilio-run)
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors)

# ☁️ `twilio-run` ☁️

> CLI tool to run [Twilio Functions](https://twilio.com/functions) locally for development

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
    --load-local-env, -f Includes the local environment variables
    --env, -e [/path/to/.env] Loads .env file, overrides local env variables
    --port, -p <port> Override default port of 3000
    --ngrok [subdomain] Uses ngrok to create an outfacing url
    --no-logs Turns request logging off
    --detailed-logs Turns on detailed request logging
    --live Always serve from the current functions (no caching)
    --inspect [host:port] Enables Node.js debugging protocol
    --inspect-brk [host:port] Enables Node.js debugging protocol, stops execution until debugger is attached

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

    $ twilio-run --ngrok
    # Exposes the Twilio functions via ngrok to share them
```

## 🔬 API

The module also exposes two functions that you can use outside of the CLI tool:

#### `runDevServer(port: number, baseDir: string): Promise<Express.Application>`

This allows you to trigger running an express server that will expose all functions and assets. Example:

```js
const { runDevServer } = require('twilio-run');

runDevServer(9000)
  .then(app => {
    console.log(`Server is running on port ${app.get('port')})`);
  })
  .catch(err => {
    console.error('Something failed');
  });
```

##### `handleToExpressRoute(handler: TwilioHandlerFunction): Express.RequestHandler`

You can take the `handler` function of a Twilio Function file and expose it in an existing Express server. Example:

```js
const express = require('express');
const bodyParser = require('body-parser');
const { handlerToExpressRoute } = require('twilio-run');

const { handler } = require('./path/to/function.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.all(handlerToExpressRoute(handler));

app.listen(3000, () => console.log('Server running on port 3000'));
```

## 💞 Contributing

💖 Please be aware that this project has a [Code of Conduct](CODE_OF_CONDUCT.md) 💖

1.  Fork the project
2.  Clone your own fork like this:

```bash
$ git clone git@github.com:twilio-labs/twilio-run.git
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
| [<img src="https://avatars3.githubusercontent.com/u/1505101?v=4" width="100px;" alt="Dominik Kundel"/><br /><sub><b>Dominik Kundel</b></sub>](https://dkundel.com)<br />[💻](https://github.com/dkundel/twilio-run/commits?author=dkundel "Code") | [<img src="https://avatars1.githubusercontent.com/u/41997517?v=4" width="100px;" alt="dbbidclips"/><br /><sub><b>dbbidclips</b></sub>](https://github.com/dbbidclips)<br />[💻](https://github.com/dkundel/twilio-run/commits?author=dbbidclips "Code") [🐛](https://github.com/dkundel/twilio-run/issues?q=author%3Adbbidclips "Bug reports") | [<img src="https://avatars0.githubusercontent.com/u/1033099?v=4" width="100px;" alt="Shelby Hagman"/><br /><sub><b>Shelby Hagman</b></sub>](https://shagman.codes)<br />[🐛](https://github.com/dkundel/twilio-run/issues?q=author%3AShelbyZ "Bug reports") [💻](https://github.com/dkundel/twilio-run/commits?author=ShelbyZ "Code") | [<img src="https://avatars3.githubusercontent.com/u/3806031?v=4" width="100px;" alt="JavaScript Joe"/><br /><sub><b>JavaScript Joe</b></sub>](https://joeprevite.com/)<br />[🐛](https://github.com/dkundel/twilio-run/issues?q=author%3Ajsjoeio "Bug reports") | [<img src="https://avatars3.githubusercontent.com/u/962099?v=4" width="100px;" alt="Stefan Judis"/><br /><sub><b>Stefan Judis</b></sub>](https://www.stefanjudis.com/)<br />[🐛](https://github.com/dkundel/twilio-run/issues?q=author%3Astefanjudis "Bug reports") [💻](https://github.com/dkundel/twilio-run/commits?author=stefanjudis "Code") |
| :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## 📜 License

[MIT](LICENSE)
