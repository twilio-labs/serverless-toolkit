---
'twilio-run': patch
---

fix: align `@twilio/runtime-handler` dev dependency with the version scaffolded by `create-twilio-function`

`twilio-run` depended on `@twilio/runtime-handler@^2.1.0` while `create-twilio-function` pins `^2.0.3`. The two were inconsistent, and `2.1.0` — although published to npm as `latest` — is currently rejected by the Twilio Serverless platform at deploy time (`Error 20001: No matching version found for @twilio/runtime-handler@2.1.0`). Pinning `twilio-run` to `^2.0.3` keeps the monorepo internally consistent and avoids signalling a version that cannot be deployed. See #557.
