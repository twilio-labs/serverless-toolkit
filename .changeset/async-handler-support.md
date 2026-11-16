---
'@twilio/runtime-handler': patch
---

Support async handlers that return a value or Promise instead of calling `callback`, and ignore duplicate callback invocations, matching the Node.js 24 runtime handler 2.1.2
