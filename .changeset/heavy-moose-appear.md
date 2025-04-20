---
'@twilio-labs/serverless-runtime-types': major
'twilio-run': major
'create-twilio-function': minor
'@twilio/runtime-handler': minor
---

feat: Upgrade Twilio SDK to v5 and use peer dependency

**WHAT:**
- Upgraded the core `twilio` Node.js helper library to v5.5.2 across the toolkit.
- Changed `@twilio-labs/serverless-runtime-types` and `@twilio-labs/twilio-run` to require `twilio` as a `peerDependency` instead of a direct dependency.
- Updated type definitions (`ClientOpts`) for compatibility with `twilio@5.x`.
- Updated default dependencies (`twilio`, `typescript`, `serverlessRuntimeTypes`) used by `@twilio-labs/create-twilio-function`.

**WHY:**
- Aligns the toolkit with the latest Twilio SDK features, improvements, and security updates.
- Resolves potential type conflicts (e.g., `TS2322`/`TS2352`) by ensuring a single `twilio` instance, managed by the user's project.

**HOW:**
**BREAKING CHANGE:** Users of `@twilio-labs/twilio-run` or projects importing types from `@twilio-labs/serverless-runtime-types` **must** now add `twilio` as a direct dependency to their project:
```bash
npm install twilio@^5.5.2
# or
yarn add twilio@^5.5.2
```
After updating toolkit packages and adding `twilio`, perform a clean install (delete `node_modules` and lock file, then run `npm install` or `yarn install`).
