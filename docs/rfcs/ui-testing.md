# UI Testing Library & Patterns (Request for Comment/RFC)

## Background

The apps in Code Exchange, especially those hosted in the [function-templates] repository, are becoming increasingly reliant on browser-based user interfaces for post-deployment Function configuration, interaction, and documentation. Each new app UI can increase the burden on reviewers by quite a bit, since UI code must be tested by hand, in a browser.

Currently, no existing framework for browser-based UI testing exists in the [function-templates] or any other Code Exchange repository. Additionally, there are no automaticlaly enforced standards for UI structure or style, making consistency between various app UIs and implementation of standards like Paste much more difficult for reviewers to guarantee.

This RFC intends to propose an automated system that will massively reduce the burden on reviewers handling UI code, increase consistency, and guarantee that various aspects of Twilio's design language are being followed.

## Proposal

One of the capabilities afforded to us by the new `runtime-helpers` library is the possibility to significantly reduce duplication of code and effort between various otherwise unrelated Runtime and Function projects. One benefit of this deduplication is that we are able to strongly influence the patterns utilized in code that takes advantage of `runtime-helpers`. UI testing is one area that can massively benefit from enforcement of a set of patterns from a centralized authority. Because there are many frameworks and paradigms for UI testing, enforcing one set of patterns will reduce the amount of effort required to review these tests, and also guarantee more uniformity between various apps' interfaces.

Because these testing pattern utilities will be consumed by many unrelated apps across the Twilio Runtime and Functions ecosystem, this RFC suggests that all impacted apps use one browser-oriented test runner, and that properly written tests should start with an import from a library namespace at `@twilio-labs/runtime-helpers/test/ui` established to house the utilities.

## Considerations / Problems

Historically, there have been several concerns around our current manual process for UI testing, and difficulties in implementing an automated solution.

### Choice of Test Runner

The typical test runner for Twilio Runtime ecosystem projects is `jest`. While it has excellent support for testing typical Node code, its ability to mimic a browser environment is limited and sometimes extremely buggy, making the test environment untrustworthy.

### Separation of Apps in Monorepos

Monorepos like `function-templates` only support hosting each app separately; a typical development environment hosts all assets and Functions at `/`. This makes testing multiple apps in a browser at the same time much more difficult, as each test would have to coordinate launching and killing a separate server process for each app.

### Lack of Overall Design Consistency

Many app UIs either do not follow Twilio's Paste design language, or follow it very loosely. Since it does not support React, `function-templates` features a static re-implementation of some of the aspects of Paste, which reviewers strongly encourage apps to adopt. Currently, this happens during code review, which is frequently too late to influence the design of the app's interface.

### Inability to Automatically Verify UI Structure

For reviewers, verifying the UI's structure to ensure it is valid HTML that uses styles and scripts properly is a big, manual job. Other than launching the app's UI in a browser, which takes time and may not expose the UI's functionality fully if it cannot run without a complex backend, there are very few techniques or automations currently available to help reduce this burden.

## Principles

The following principles helped shape the solution to our challenges around UI testing:

1. The testing environment should be universal, realistic, and familiar to developers.
2. Whenever possible, page structure and design elements should be checked automatically.
3. Where automated testing is not possible, the cognitive load on reviewers should be reduced due to the adoption of these testing methodologies.

## Design

The following proposed design is based on prior research done into UI testing for [function-templates], but should apply to any Code Exchange or Runtime repo that can support a Node environment. Some implementation details are omitted on purpose, to allow developers some latitude in how these techniques are applied to different codebases.

### Test Runner

The test runner this library will target is [Cypress](https://www.cypress.io/). It was chosen because it has the following features:

- Tests are run in a set of web browsers, perfectly imitating the environment that our UIs will target in almost every regard.
- The testing environment supports establishing a backend server for end-to-end testing.
- Cypress' suite of built-in test utilities are intentionally very similar to those provided with `jest`, which decreases the amount of time our existing developers will need to learn the new testing paradigm, and reduces confusion when developers switch between writing UI and backend tests.
- Cypress allows for a lot of flexibility in how tests are written.
- Tests written for the Cypress API are reliable; features like [retries](https://docs.cypress.io/guides/core-concepts/retry-ability) help ensure that the majority of common UI code can receive tests with a minimum of effort.

It is recommended that Cypress be imported into `@twilio-labs/runtime-helpers/test/ui` via its [Node module API](https://docs.cypress.io/guides/guides/module-api), and a pre-configured interface to run Cypress with all of our custom testing utilities available be exported.

### App Hosting for Monorepos

To operate inside Cypress, monorepos like [function-templates] need to host all of their apps' static content on the same local server. [function-templates#153](https://github.com/twilio-labs/function-templates/pull/153/files#diff-bfe9874d239014961b1ae4e89875a6155667db834a410aaaa2ebe3cf89820556) provides an example of how to host static content for multiple apps as subdirectories of a local development server using Twilio Runtime mechanisms. This server can work hand-in-hand with [Cypress network request interception](https://docs.cypress.io/guides/guides/network-requests) to mock various backend APIs and third-party integrations that a UI might need for thorough testing.

### Structural Testing

Since we will be exporting an entry point for running Cypress tests, we have an opportunity to test for certain invariants that the UI should possess even before the user-defined test suite runs. It is recommended that we use Cypress to validate various aspects of the HTML structure of the UI automatically:

- The HTML and CSS composing the UI should parse without errors; we can also use this opportunity to check for conformity to W3C standards, as well as accessibility checking using a tool like [ta11y](https://www.npmjs.com/package/@ta11y/core).
- For [function-templates] apps, the UI should include the `ce-paste-theme.css` style.
- The UI should be checked for adherence to a fairly uniform structure; for [function-templates] apps, this is a composition of tags like `<header>`, `<main>`, `<section>`, and specifically styled `<div>` tags that guarantee the `ce-paste-theme.css` file applies correctly.

### Cypress Testing Library

To encourage specific testing methologies, I recommend that our utility adopt and re-export the functions provided by the [Cypress Testing Library](https://testing-library.com/docs/cypress-testing-library/intro), which is part of the same family of tools as the [React Testing Library](https://testing-library.com/docs/react-testing-library/intro). As much as possible, the functionality we expose from the Cypress Testing Library should encourage the following best practices around UI testing:

- Whenever possible, handles to specific UI elements should be selected by their role on the page and their expected content; that is, tests should resemble the way users will interact with the UI as much as possible.
- If the above is not possible, the HTML tag for the UI element under test should include a `data-testid` attribute used to select the element during testing.

Ideally, our testing utility library should provide enough functionality that for common cases, developers will either write code that is idiomatic with the above two guidelines, or will call one of our testing functions to test for a given property that falls outside of what can be covered by content-oriented or `data-testid` tests.

[function-templates]: https://github.com/twilio-labs/function-templates
