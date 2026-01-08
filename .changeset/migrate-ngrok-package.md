---
"twilio-run": patch
---

Migrate from `ngrok` to `@ngrok/ngrok` package for improved reliability and Apple Silicon support. This fixes spawn error -88 on Apple Silicon (M1/M2) Macs by using a pure JavaScript implementation that eliminates architecture-specific binary issues. The package now automatically reads authtoken from ngrok config file (`~/.ngrok2/ngrok.yml` or `~/Library/Application Support/ngrok/ngrok.yml`). Backward compatible: `--ngrok=myapp` automatically converts to `myapp.ngrok.io`. Supports full domain format: `--ngrok=myapp.ngrok.io`. Enhanced error messages for ngrok failures with troubleshooting guidance.
