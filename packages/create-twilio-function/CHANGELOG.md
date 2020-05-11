# Changelog for `create-twilio-function`

## Ongoing [☰](https://github.com/twilio-labs/create-twilio-function/compare/v2.2.0...master)

## 2.2.0 (May 11, 2020) [☰](https://github.com/twilio-labs/create-twilio-function/compare/v2.1.0...v2.2.0)

- minor updates
  - Loosen the Node version to 10
  - Updates twilio-run to 2.5.0
  - Adds `--empty` option to create empty template

## 2.1.0 (January 14, 2020) [☰](https://github.com/twilio-labs/create-twilio-function/compare/v2.0.0...v2.1.0)

- minor updates
  - Validates project names. Names can only include letters, numbers and hyphens
  - Adds `npm run deploy` command to generated project which will run `twilio-run deploy`
  - Updates Node version output for new functions to 10.17 to match Twilio Functions environment
  - Adds a link to the Twilio console to the output asking for credentials
  - Lints the code according to eslint-config-twilio
  - Improves getting the size of the terminal for setting the output

## 2.0.0 (August 4, 2019) [☰](https://github.com/twilio-labs/create-twilio-function/compare/v1.0.2...v2.0.0)

- Exports details about the cli command so that other projects can consume it. Fixes #12
- Generates new project from the ./templates directory in this project
- Can generate projects based on a template from twilio-labs/function-templates

## 1.0.2 (July 10, 2019) [☰](https://github.com/twilio-labs/create-twilio-function/compare/v1.0.1...v1.0.2)

- Minor updates
  - Better error messages if the cli fails to create a directory. Fixes #14

## 1.0.1 (May 4, 2019) [☰](https://github.com/twilio-labs/create-twilio-function/compare/v1.0.0...v1.0.1)

- Minor updates
  - Corrected order of arguments in generated example function. Fixes #10

## 1.0.0 (April 9, 2019) [☰](https://github.com/twilio-labs/create-twilio-function/commits/v1.0.0)

Initial release. Includes basic features for creating a new Twilio Functions project setup to use [`twilio-run`](https://github.com/twilio-labs/twilio-run) to run locally.
