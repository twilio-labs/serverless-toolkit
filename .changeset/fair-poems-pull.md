---
'@twilio-labs/serverless-twilio-runtime': major
'create-twilio-function': major
'@twilio-labs/plugin-serverless': major
'@twilio-labs/plugin-assets': major
'twilio-run': major
---

**WHAT**: Remove Node.js 18 from supported versions.

**WHY**: Node.js 18 is EOL and will not receive bug fixes or security upgrades. Users should migrate to Node.js 20 or 22.

**BREAKING CHANGE**: Projects using `create-twilio-function`, `@twilio-labs/plugin-asset`, `@twilio-labs/plugin-serverless`, `@twilio-labs/serverless-twilio-runtime` or `twilio-run` will have to migrate to Node.js 20 or 22.
