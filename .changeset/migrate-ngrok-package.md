---
"twilio-run": patch
---

Migrate from `ngrok@^4.3.3` to `@ngrok/ngrok@^1.7.0` (official ngrok package) for improved reliability and Apple Silicon support. This fixes spawn error -88 on Apple Silicon Macs by using a pure JavaScript implementation that eliminates architecture-specific binary issues.

**Key improvements:**
- Updates to @ngrok/ngrok v1.7.0 (latest stable)
- Automatic authtoken detection from ngrok config files (now includes Windows support: `%USERPROFILE%\AppData\Local\ngrok\ngrok.yml`)
- Fixed domain detection to correctly handle subdomains like "my.app" (now uses `.includes('.ngrok.')` instead of `.includes('.')`)
- Fixed authtoken regex to ignore inline comments in config files
- Enhanced error messages with platform-specific troubleshooting guidance
- Backward compatible: `--ngrok=myapp` automatically converts to `myapp.ngrok.io`
- Supports multiple ngrok TLDs: `.ngrok.io`, `.ngrok.dev`, etc.
