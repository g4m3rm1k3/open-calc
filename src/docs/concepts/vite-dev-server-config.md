# Concept: Vite Dev Server Configuration and `strictPort`

**What you'll understand by the end:** how to pin a dev tool's server to a specific, fixed port instead of letting it silently pick a different one, and why that matters for anything else configured to expect it at a known address.

**Prerequisites:** `npm-project-scaffolding.md`.

## Setup

A Vite-scaffolded project (`npm create vite@latest`), with `vite` installed as a dev dependency.

## The Problem

A dev server needs *some* port to listen on. Most dev tools, by default, try a preferred port and — if it's already in use by something else — silently fall back to the next available one, printing the actual port to the terminal. That fallback is convenient in isolation, but breaks the moment anything *else* has been configured to expect the server at a specific, fixed address — a CORS allowlist (see `cors-same-origin-policy.md`), a bookmark, a hardcoded URL in another config file — because the fallback happens silently, with no error, only a different number quietly printed to a terminal output that's easy not to reread.

## The Isolated Example

`vite.config.ts` without `strictPort`:
```typescript
import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: 5180,
    },
});
```

**Real behavior, port 5180 already in use:**
```
Port 5180 is in use, trying another one...

  VITE ready in 312 ms

  ➜  Local:   http://localhost:5181/
```

The server started successfully — on a different port than configured, with only a terminal message noting the change.

`vite.config.ts` with `strictPort: true`:
```typescript
import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: 5180,
        strictPort: true,
    },
});
```

**Real behavior, port 5180 already in use:**
```
error when starting dev server:
Error: Port 5180 is already in use
```

**What this proves:** the identical situation (port already occupied) produces two very different outcomes depending on one config flag — a silent fallback to a working-but-wrong port, versus a loud, immediate failure that stops before anything runs on the wrong address.

## Mechanical Walkthrough

- `server.port` sets Vite's *preferred* port — without `strictPort`, this is only a starting suggestion, not a guarantee.
- `strictPort: true` changes that suggestion into a hard requirement: Vite exits with a real, non-zero-status error rather than falling back to any other port.
- The failure happens at server startup, immediately and visibly in the terminal — before any request is ever made, and long before a mismatch could surface later as a confusing, unrelated-looking error somewhere else (like a CORS rejection whose real cause is a silently-different port).

## CS Lens

This is the identical **fail-fast** instinct `fail-fast-validation.md` and `python-custom-exceptions.md` describe applied to process/network startup instead of function input — surface a violated assumption immediately, at the exact point it's first detected, rather than allowing execution to continue on a false premise and fail later, further from the actual cause. `strictPort: true` trades convenience (a server that "always starts, somewhere") for correctness (a server that only starts exactly where every other piece of configuration expects it).

## SE Lens

The silent-fallback default is genuinely reasonable for casual, single-developer, nothing-else-depends-on-this use — most of the time, a dev server run in isolation, no other config caring which exact port it lands on. It stops being reasonable the moment a *second* piece of configuration (a CORS allowlist, a proxy rule, another service's hardcoded URL) is written assuming a specific port — at that point, a silent fallback doesn't just "still work slightly differently," it produces a real, confusing failure (a CORS rejection, in this project's real case) whose actual cause — a port silently changed — is nowhere near the error message describing it.

## Connection

Directly enables `cors-same-origin-policy.md` to work reliably — a CORS allowlist naming one specific origin is only meaningful if the dev server is guaranteed to actually be running at that exact origin every time, which `strictPort: true` is what guarantees.

## Try It Yourself

1. Start two instances of the same Vite project at once (a second terminal, same `npm run dev`) with `strictPort: true` set — confirm the second instance fails loudly with the port-in-use error, rather than silently starting on a different port.
2. Remove `strictPort` and repeat the same test — confirm the second instance now starts successfully on a different port, and manually check whether anything in the project (a CORS config, a hardcoded fetch URL) would now silently be pointed at the wrong instance.
3. Look up Vite's `server.host` and `server.open` options in its documentation, and add one to `vite.config.ts` — reasoning about which of Vite's config options are, like `strictPort`, about correctness/reliability versus which are purely about developer convenience.
