---
"@twilio/runtime-handler": minor
---

Export Response class from the package root for use in testing. Previously, the package's main entry was a placeholder that threw on import. Now `const { Response } = require('@twilio/runtime-handler')` provides the same Response class used by the local dev runtime, enabling proper unit testing of Twilio Functions without custom mocks.
