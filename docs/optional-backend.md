# Optional backend companion

This companion keeps `open-calc` updateable while still allowing per-machine customization.

## What problem it solves

Editing files in `src/content/` directly works for development, but it creates two long-term problems for users:

- app updates overwrite local edits or create merge conflicts
- there is no stable place for a user's machine to act as a local host for their customized version

The optional backend fixes that by separating three concerns:

1. The shipped app remains the canonical, updateable frontend.
2. User changes live in the machine's app-data folder as override files.
3. A local companion service serves those overrides and can optionally host the built frontend.

## Current storage model

On Windows the default data folder is:

```text
%APPDATA%/open-calc
```

Important paths:

```text
config.json
overrides/lessons/<chapterId>/<lessonSlug>.json
cache/update-manifest.json
```

You can override the root with `OPEN_CALC_DATA_DIR`.

## Current API

`GET /api/health`
- backend status and resolved directories

`GET /api/config`
- effective config and host metadata

`GET /api/overrides`
- list stored lesson override keys

`GET /api/lesson-override?key=<chapterId>/<lessonSlug>`
- returns a stored partial lesson override if present

`PUT /api/lesson-override?key=<chapterId>/<lessonSlug>`
- writes a JSON object as the local override for that lesson

`DELETE /api/lesson-override?key=<chapterId>/<lessonSlug>`
- removes the local override

`POST /api/update/check`
- fetches and caches the configured update manifest if `config.json` contains `updateManifestUrl`

## Frontend behavior

Lesson pages now try the optional backend automatically. If the backend is reachable and an override exists, the app deep-merges the local override on top of the built-in lesson object.

That means:

- official updates still change the built-in lesson
- local machines can replace only the fields they care about
- users do not need to fork the whole lesson file to customize a title, hook, prose block, quiz, or metadata

Arrays are replaced wholesale. Plain objects are merged recursively.

## Hosting model

`npm run backend`
- binds to `127.0.0.1:4318`
- safest default for personal machine use

`npm run backend:lan`
- binds to `0.0.0.0:4318`
- allows other devices on the local network to connect

If a production `dist/` folder exists, the backend can also serve that frontend directly.

## Important peer-to-peer note

This is not full distributed peer-to-peer replication yet.

Right now it supports:

- a user's PC acting as a host node
- LAN or port-forwarded access to that host
- local override persistence outside the shipped app
- a clean update channel for the main app

Future work for true peer-to-peer collaboration would likely add:

- signed identity for hosts
- NAT traversal or relay support
- conflict resolution for concurrent lesson edits
- trusted update signing for the executable itself
- optional sync/export of overrides between machines

## Packaging direction

This backend is intentionally plain Node so it is easy to iterate on. The next packaging step can go one of two ways:

- embed it in an Electron desktop shell alongside the frontend
- package it as a standalone executable with a Node packager once the API stabilizes

The important architectural decision is already in place: user data is separate from shipped app code.
