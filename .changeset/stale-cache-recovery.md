---
"twilio-run": patch
---

Automatically recover from stale `.twiliodeployinfo` cache entries during deploy. When a cached service SID references a service that was deleted externally (via Console or API), the deploy now detects the 20404 error, clears the stale cache entry, and retries the deployment instead of failing with a confusing error message.
