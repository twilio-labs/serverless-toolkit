---
'twilio-run': patch
'create-twilio-function': patch
'@twilio-labs/plugin-serverless': patch
'@twilio-labs/plugin-assets': patch
---

feat: declare Node.js 24 support in `engines`

`node24` was added as a deploy runtime and made the default in #555, and the local version check already accepts Node 24, but the `engines.node` range was left at `^20.x || ^22.x`. That made the toolkit default to deploying to node24 while refusing to declare support for running on Node 24, so users on Node 24 saw engine warnings. Widening the range to `^20.x || ^22.x || ^24.x` across the four published packages resolves the inconsistency. Fixes #563.
