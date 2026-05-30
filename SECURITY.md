# Security Policy

## Supported Versions

UpSkillOS is a client-side web application and Electron desktop app. There is no server that processes user data. All computation happens in the browser.

| Component | Support Status |
|---|---|
| Web app (latest) | ✅ Actively maintained |
| Desktop app (latest release) | ✅ Actively maintained |
| Older releases | ❌ Not supported |

## Scope

Security issues we care about:

- **XSS vulnerabilities** in lesson content rendering (KaTeX, prose parser, VizFrame)
- **Sandbox escapes** in the Python (Pyodide), JavaScript (sandboxed iframe), or C++ code environments
- **Privacy violations** — the app is designed to collect no data; anything that phones home is a bug
- **Electron security** — remote code execution, nodeIntegration exposure, insecure preload scripts
- **Dependency vulnerabilities** — critical CVEs in npm dependencies

Out of scope: Social engineering, spam, self-XSS, issues requiring physical access to the device.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities via GitHub's private vulnerability reporting:
1. Go to the [Security tab](https://github.com/g4m3rm1k3/upskillos/security) of the repository
2. Click **Report a vulnerability**
3. Fill in the form with as much detail as possible

Alternatively, open a GitHub Discussion marked as Private.

You will receive a response within 72 hours. If the vulnerability is confirmed, we will work to release a fix and will credit you in the release notes (unless you prefer to remain anonymous).

## Security Architecture Notes

- **No backend by default** — the web app runs entirely in the browser. No user data is sent to any server.
- **P2P chat (WebRTC)** — study chat uses Trystero over WebRTC. No messages pass through a central server.
- **Python sandbox** — Pyodide runs in a Web Worker with no network access by default.
- **JS sandbox** — the JavaScript playground runs in a cross-origin sandboxed `<iframe>` with `sandbox="allow-scripts"` only.
- **Electron** — `nodeIntegration` is disabled; `contextIsolation` is enabled. The renderer process cannot access Node.js APIs directly.
