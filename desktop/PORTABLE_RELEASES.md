# Portable desktop release plan

This is the recommended distribution model for `open-calc`.

## Chosen direction

- publish a **portable desktop build** on GitHub Releases
- do **not** require a Windows installer
- keep user data in `%APPDATA%/open-calc`, not beside the executable
- update from **release assets + manifest**, not by pulling git/source diffs
- keep the browser-hosted build available separately on GitHub Pages or other static hosting

## Why not update from source diffs?

Using repo diffs as the updater input sounds attractive because the project is open source, but it is the wrong layer for an installed app:

- installed users run built assets, not source files
- a source diff does not guarantee a valid runtime bundle
- applying git-like patches to end-user installs is brittle
- desktop updates should replace versioned build artifacts, not mutate a working install in place from repo text changes

Source diffs are still useful for contributors. They are not the primary update format for end-user executables.

## What the user downloads

For Windows, the target artifact should be something like:

- `open-calc 0.1.0.exe`

The current packaging flow now produces a single portable executable via Electron Builder. It bundles the frontend assets and optional backend runtime internally, while user content still lives in `%APPDATA%/open-calc`.

## How updates should work

The portable app should check a GitHub-hosted update manifest on launch or on demand.

The manifest points to release assets such as:

- full portable zip for the latest version
- optional patch package later if we add binary diff support

The update flow should be:

1. App reads current version.
2. App fetches `latest.json` from GitHub Releases or GitHub Pages.
3. If a newer version exists, app downloads the new portable executable or release package.
4. App swaps binaries on restart.
5. User content survives because it is stored outside the app folder.

## Important split: app updates vs user edits

This repo now already separates user-edited data from shipped app code:

- lesson overrides live in app-data
- user docs live in app-data
- bundled docs can be overridden in app-data

That is what makes portable updates safe.

## Peer sharing

Peer-to-peer content sharing should work at the **content layer**, not the binary updater layer.

- app binary updates come from GitHub Releases
- user docs/overrides can be shared peer-to-peer or by export/import packs

Those are separate systems on purpose.
