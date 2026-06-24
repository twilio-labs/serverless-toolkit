---
'twilio-run': patch
'@twilio-labs/serverless-twilio-runtime': patch
---

fix: correct supported Node.js version messaging

The local Node.js version warning rendered the supported versions as
`20.,22.x` because the version array was interpolated directly; it now
reads `20.x, 22.x`. Also updated the serverless-twilio-runtime README to
list both supported runtimes (v20.x and v22.x) instead of only v20.x.
