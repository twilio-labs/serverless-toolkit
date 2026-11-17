# RFC runtime-helpers Test & Lint Utilities

This RFC is an extension of [the Better Testing Support RFC (serverless-toolkit#282)](https://github.com/twilio-labs/serverless-toolkit/pull/282).

## Background

The new [runtime-helpers] library is a collection of useful Twilio Runtime and Functions utilities that are either generic enough that they can be used by many unrelated apps, or delicate enough (IE security-related code) that want only one canonical implementation of that functionality to be in use, in order to make vulnerability management and thorough testing possible.

This brief RFC proposes expanding the [runtime-helpers] API to cover one more case where we have frequently seen generic code copy-pasted and reused throughout multiple Runtime apps.

## Proposal

[runtime-helpers] is uniquely positioned to house testing utilities for Twilio Runtime and Functions code. It is a versioned NPM package that exists independently of any other Runtime project, and its development cycle is intended to allow us to both expose a stable set of generic functionality for Runtime apps and projects, as well as evaluate more experimental APIs before they can be "graduated" into one of our more mature Runtime ecosystem packages.

Because we can pin to a specific set of `runtime-helpers` functionality on a per-app basis, it is an ideal dependency for our `jest` tests, because tight control over our test dependencies allows us to prevent breakage due to updates.

For defining the initial testing API, a similar approach to the one used to define the `runtime-helpers` API is recommended, and is detailed below.

## Design

### Pattern Extraction

To form the foundation of the testing API, a similar approach to that taken in starting the `runtime-helpers` API is recommended. This involves finding codebases whose tests use patterns we want to extract (`function-templates` and parts of `serverless-toolkit`, for example), run duplicate code analysis with [jscpd](https://github.com/kucherenko/jscpd) across all chosen repoistories simultaneously, and note the largest chunks of duplicated code among tests that can sensibly be extracted into an independent API. This method does not provide new testing functionality, but exposes cases in real code where duplication has occurred due to a lack of library support.

### Proper Usage of Assets and Paths

In PRs that have gone through the `function-templates` review process, one of the biggest areas where developers have trouble is related to assets and filesystem paths; in Functions, direct filesystem paths will usually not work as the developer expects, and Asset paths should be used instead. Compounding this problem, local development via `twilio-cli` will not show incorrect results for erroneous usage of filesystem paths.

The recommended fix for the above is either a test stub for common Node filesystem operations that flags an error on usage, established automatically in tests as part of `jest.config.js`, or a custom Twilio Function lint that lexically guarantees that raw filesystem paths are not present in any Function code. Each approach has its advantages and blind spots, so completeness may require implementing both.

### Lints for Function Handler and Callback Usage

A custom lint for Twilio Functions to check Function handler signatures and ensure that callbacks are being used properly would provide immediate feedback to the user of a properly configured editor as to the basic structural validity of their code.

Suggested features for this lint are:

- Guarantee that there is exactly one `exports.handler`.
- Ensure that `exports.handler` is a function with arguments `(context, event, callback)`; allow omitting arguments so long as they do not appear in the body of the handler.
- Ensure that all branches of the handler eventually end in `return callback(...)`; that is, `callback(...)` alone should be insufficent to terminate a handler.

### Better .env File Valididity Checking

If a relatively efficient implementation is found, the `context` object in test code should be replaced with a version that parses the Function's `.env` file and guarantees that all environment variables accessed actually exist in `.env`, throwing an error if they do not.

[runtime-helpers]: https://github.com/twilio-labs/runtime-helpers
