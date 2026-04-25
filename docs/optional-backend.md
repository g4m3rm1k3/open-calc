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
docs/user/<docId>.json
docs/overrides/<encoded-doc-path>.json
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

The intended production use is a GitHub-hosted release manifest for portable desktop builds, not repository source diffs. See [../desktop/PORTABLE_RELEASES.md](../desktop/PORTABLE_RELEASES.md).

### Docs API

`GET /api/docs`
- returns user-created docs and local overrides for bundled markdown docs

`POST /api/docs/user`
- creates a new user markdown doc

`GET /api/docs/user?id=<docId>`
- returns one user doc

`PUT /api/docs/user?id=<docId>`
- updates a user doc

`DELETE /api/docs/user?id=<docId>`
- deletes a user doc

`GET /api/docs/override?path=/src/docs/...`
- returns the local override for a bundled markdown doc, if present

`PUT /api/docs/override?path=/src/docs/...`
- stores a local override for that bundled markdown doc

`DELETE /api/docs/override?path=/src/docs/...`
- removes the override and restores the built-in version

`GET /api/docs/share/export?...`
- exports a share pack for a user doc or bundled-doc override

`POST /api/docs/share/import`
- imports a share pack into the local machine

## Frontend behavior

Lesson pages now try the optional backend automatically. If the backend is reachable and an override exists, the app deep-merges the local override on top of the built-in lesson object.

That means:

- official updates still change the built-in lesson
- local machines can replace only the fields they care about
- users do not need to fork the whole lesson file to customize a title, hook, prose block, quiz, or metadata

Arrays are replaced wholesale. Plain objects are merged recursively.

## Docs behavior

The docs hub now supports three document types:

- bundled docs from `src/docs/`
- local overrides of bundled docs
- user-created markdown docs

Bundled docs stay in the app bundle. Local edits are stored separately in app-data, so app updates still work cleanly.

For sharing today, docs can be exported as portable JSON share packs and imported on another machine. If the backend is running in LAN mode, that host machine can also act as a simple peer-accessible node for docs and overrides on the same network.

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
- user-created docs and bundled-doc overrides
- portable doc share packs for manual peer exchange
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
