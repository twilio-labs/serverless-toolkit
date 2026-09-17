---
'@twilio-labs/serverless-twilio-runtime': major
'create-twilio-function': major
'@twilio-labs/plugin-serverless': major
'@twilio-labs/plugin-assets': major
'twilio-run': major
---

**WHAT**: Add Node.js 24 to supported versions and remove Node.js 20.

**ALSO**: `twilio-run deploy` now warns when a project is configured to deploy to an unsupported runtime such as `node20`, pointing at the `runtime` field in `.twilioserverlessrc`. It is a warning, not a failure — the deploy still proceeds and the platform has the final say.

**WHY**: `node24` was added as a deploy runtime and made the default in #555, but `engines.node` was never widened, so the toolkit defaulted to deploying to node24 while refusing to declare support for running on Node 24 (#563). Node.js 20 is deprecated on Twilio Serverless and can no longer be used for new builds, so it is removed at the same time.

**BREAKING CHANGE**: Projects using `create-twilio-function`, `@twilio-labs/plugin-assets`, `@twilio-labs/plugin-serverless`, `@twilio-labs/serverless-twilio-runtime` or `twilio-run` will have to migrate to Node.js 22 or 24.
