---
"twilio-run": patch
---

Migrate from `ngrok@^3.3.0` to `@ngrok/ngrok@^1.7.0` (official ngrok package) for improved reliability and Apple Silicon support. This fixes spawn error -88 on Apple Silicon Macs through better cross-platform binary management that eliminates architecture-specific binary issues.

**Key improvements:**
- Updates to @ngrok/ngrok v1.7.0 (latest stable)
- Automatic authtoken detection from ngrok config files (now includes Windows support: `%USERPROFILE%\AppData\Local\ngrok\ngrok.yml`)
- Fixed domain detection to correctly identify ngrok domains using precise TLD matching (uses `.endsWith('.ngrok.io')`, `.endsWith('.ngrok.dev')`, `.endsWith('.ngrok-free.app')` instead of substring matching)
- Prevents false positives like "company.ngrokit.com" being treated as ngrok domains
- Fixed authtoken regex to ignore inline comments in config files
- Enhanced error messages with platform-specific troubleshooting guidance
- Backward compatible: `--ngrok=myapp` automatically converts to `myapp.ngrok.io`
- Supports all official ngrok TLDs: `.ngrok.io`, `.ngrok.dev`, `.ngrok-free.app`
