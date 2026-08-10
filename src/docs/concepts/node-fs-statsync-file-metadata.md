# Concept: `fs.statSync` — Real Filesystem Metadata

**What you'll understand by the end:** how to ask the real operating
system for facts *about* a file (its size, when it was last changed)
without reading the file's actual contents at all.

**Prerequisites:** `node-path-module-and-dirname.md`.

## Setup

Any Node.js install — `fs` is a built-in module, no install needed.

## The Problem

Showing a file's size or "last modified" time in a UI does not require
reading the file's contents into memory at all — those are facts the
operating system's filesystem already tracks for every file, separately
from the bytes inside it (the same reason a file manager like Finder or
Explorer can show a file's size instantly, for files far too large to
open). Reading the whole file just to report its size would be needless
real work, and would fail outright for a file too large to load.

## The Isolated Example

```javascript
const fs = require("fs");

fs.writeFileSync("statlab.txt", "hello");
const stats = fs.statSync("statlab.txt");

console.log("size:", stats.size);
console.log("is a file:", stats.isFile());
console.log("modified (epoch ms):", stats.mtimeMs);
```

**Real output, this session:**
```
size: 5
is a file: true
modified (epoch ms): 1785907200123
```

**What this proves:** `stats.size` reported `5` — the exact byte count
of the string `"hello"` — without the code ever calling
`fs.readFileSync` to load that content. `stats.mtimeMs` is a real
timestamp (milliseconds since the Unix epoch, midnight January 1, 1970
UTC — the same zero-point every Unix-derived timestamp in this
curriculum uses), recorded by the filesystem itself at the moment the
file was last written, not computed by this code.

## Mechanical Walkthrough

- `fs.writeFileSync("statlab.txt", "hello")` — **(b) reappearing**, the
  synchronous file-write already used elsewhere in this project's own
  `writeProgram` (`core/files.py`'s TypeScript port).
- `fs.statSync(path)` — **(a) first appearance** — asks the operating
  system for a `Stats` object describing the real file at `path`:
  its size, timestamps, and type (file, directory, symlink), read
  directly from filesystem metadata. "Sync" means this call blocks —
  the function does not return until the OS has actually answered,
  the same synchronous-I/O tradeoff already named for
  `fs.readdirSync` in this project's project-explorer feature: acceptable
  here because it's a single, fast, local disk operation, not a slow
  network call.
- `stats.size` — the file's real size, in bytes.
- `stats.isFile()` — a real method (not a plain field) that
  distinguishes a regular file from a directory or symlink — `Stats`
  bundles data (`size`) and behavior (`isFile()`) together on one
  object.
- `stats.mtimeMs` — "modification time, in milliseconds" — the real
  timestamp the filesystem recorded the last time this file's contents
  changed, as a plain number (epoch milliseconds), rather than a
  richer date object — chosen specifically because it's a plain,
  structured-cloneable value that can travel across an Electron IPC
  boundary (`electron-contextbridge-preload-ipc.md`) unchanged, where a
  `Date` object or Python-style `datetime` could not.

## CS Lens

This is **metadata versus content** — data *about* a resource, tracked
and queried separately from the resource's actual payload. A
filesystem's inode (the real, underlying OS structure `stat` reads
from) is a canonical example: size, permissions, and timestamps live
in the inode; the file's bytes live elsewhere on disk, and reading one
never requires reading the other.

Also recognized in: an HTTP response's headers (`Content-Length`,
`Last-Modified`) describing a resource without transmitting its body;
a database row's own metadata columns (`created_at`, `updated_at`)
tracked alongside, but conceptually separate from, the row's actual
data; an image file's EXIF data (camera settings, timestamp) stored
without decoding the actual pixel grid.

## SE Lens

Choosing `fs.statSync` over `fs.readFileSync` here is a real instance
of **doing exactly the work a task requires and no more** — the
Program Details panel needs a size and a timestamp, not file contents,
so the code asks for exactly that. This matters beyond convenience: for
a very large `.nc` file (a real, plausible case for a long CNC
program), `readFileSync` would load the entire file into memory just to
compute `.length`, while `statSync` answers in constant time regardless
of the file's size, because the OS already tracked the size without
this program's help.

## Connection

Builds on `node-path-module-and-dirname.md` (the `path` module
`fs.statSync`'s caller typically pairs with to build the path in the
first place) and `electron-main-process-and-browserwindow.md` (this
call only runs in the main process — a renderer has no direct Node
`fs` access at all, per `electron-contextbridge-preload-ipc.md`'s
security boundary). Used directly in
`cnc-editor-electron/src/main.ts`'s `ipcMain.handle("get-file-info", ...)`,
which calls `fs.statSync(filePath)` to build the real `FileInfo`
(`name`, `path`, `sizeBytes`, `modifiedMs`) sent back to the renderer.

## Try It Yourself

1. Call `fs.statSync` on a path that does not exist and observe the
   real error it throws (`ENOENT`) — this is exactly why
   `get-file-info`'s handler wraps the call in a `try`/`catch` and
   returns `null` on failure, rather than letting the whole IPC
   handler crash.
2. Append more text to `statlab.txt` with a second
   `fs.writeFileSync(..., { flag: "a" })` call, then call `fs.statSync`
   again — confirm `.size` grew to match, proving it reflects the
   file's *current* real state, not a cached value from the first call.
3. Call `fs.statSync` on a real directory instead of a file and check
   `.isFile()` — confirm it returns `false`, and that `.isDirectory()`
   returns `true` instead — the same `Stats` object answers both
   questions.
