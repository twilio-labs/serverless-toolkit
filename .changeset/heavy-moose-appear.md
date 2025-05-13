---
'@twilio-labs/serverless-runtime-types': major
'twilio-run': major
'create-twilio-function': minor
'@twilio/runtime-handler': minor
---

feat: Upgrade Twilio SDK to v5.6.0 & peer dependency

**IMPACT:**
- `@twilio-labs/serverless-runtime-types`: Major (peer dependency)
- `twilio-run`: Major (peer dependency)
- `create-twilio-function`: Minor (default SDK version)
- `@twilio/runtime-handler`: Minor (version upgrade)

**WHAT:**
- Twilio SDK upgraded to v5.6.0.
- `@twilio-labs/serverless-runtime-types` & `twilio-run` now require `twilio` as a `peerDependency`.
- Type definitions updated for Twilio v5.x compatibility.
- Default dependencies in `create-twilio-function` updated.

**WHY:**
- Latest Twilio SDK features and fixes.
- Prevents type conflicts by centralizing `twilio` dependency in user projects.

**ACTION:**
- **BREAKING:** Projects using `@twilio-labs/twilio-run` or `@twilio-labs/serverless-runtime-types` MUST add `twilio@^5.6.0` as a direct dependency (`npm install twilio@^5.6.0` or `yarn add twilio@^5.6.0`).
- Clean install (`node_modules` deletion and lock file removal) is required after updating toolkit packages and adding `twilio`.
