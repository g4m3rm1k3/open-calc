# Concept: `tempfile` — Real, Safe Temporary Files

**What you'll understand by the end:** why a server that needs to briefly hold uploaded data on disk shouldn't invent its own "temporary" filename, and what `tempfile.mkstemp` actually guarantees that a hand-built path doesn't.

**Prerequisites:** `python-import-statement.md`.

## The Problem

Processing an uploaded file sometimes genuinely needs it as a real file on disk (a library that only accepts a file path, not raw bytes — SQLite is exactly this case: it opens files by path, not by handing it a blob of bytes directly). A tempting shortcut is building a path by hand (`f"/tmp/upload-{filename}"`) — but that reuses the *client's own filename* (already known untrustworthy, `flask-file-upload.md`), and offers no real guarantee the resulting path doesn't already exist or won't collide with a concurrent request doing the same thing at the same moment.

## The Isolated Example

```python
import os
import tempfile

fd, path = tempfile.mkstemp(suffix="-upload.txt")
print("path:", path)
os.close(fd)

with open(path, "w") as f:
    f.write("real uploaded content")

with open(path) as f:
    print("read back:", f.read())

os.remove(path)
print("exists after remove:", os.path.exists(path))
```

**Real output:**
```
path: C:\Users\g4m3r\AppData\Local\Temp\tmpxdwitgq1-upload.txt
read back: real uploaded content
exists after remove: False
```

**What this proves:** `mkstemp` produced a real, unique path in the operating system's own designated temp directory — never specified by this code at all — and the file it created could be written to, read back, and cleanly removed, leaving nothing behind.

## Mechanical Walkthrough

- `tempfile.mkstemp(suffix="-upload.txt")` — **(a) first appearance** — atomically creates a brand-new, guaranteed-unique file (the operating system itself checks for collisions, not application code guessing at a "probably free" name) and returns both a low-level file descriptor (`fd`) and its real path (`path`). `suffix` only affects the human-readable tail of the generated name, not its uniqueness.
- `os.close(fd)` — **(a) first appearance** of a raw file descriptor being closed directly, without ever wrapping it in a normal Python file object — `mkstemp` opens the file itself (as part of guaranteeing it didn't already exist) and hands back the low-level descriptor; closing it here and reopening normally with `open(path, "w")` right after is the standard, documented pattern, since most code wants a normal file object, not a raw descriptor.
- `open(path, "w")` / `open(path)` — **(c) already established** file I/O.
- `os.remove(path)` — **(a) first appearance** — deletes the file; `tempfile.mkstemp` (unlike some of its siblings, e.g. `TemporaryDirectory`) does **not** clean up after itself automatically — that responsibility stays with the caller.

## CS Lens

This is the operating system providing a **guaranteed-unique resource allocation** primitive — the same underlying need `uuid-byte-order.md` addresses for identifiers in general (a value guaranteed not to collide), here specialized to filenames within one specific directory, checked atomically by the OS itself rather than raced by application-level "does this path exist yet?" logic.

Also recognized in: any system generating temporary work files (compilers, build tools, video transcoders) — reaching for the OS's own temp-file facility rather than inventing a naming scheme is close to universal practice for exactly this reason.

## SE Lens

The alternative — a hand-built path using the current timestamp or the uploaded filename — is real, working code for the overwhelmingly common case, and a real, exploitable bug the moment two requests happen to arrive in the same instant (a timestamp collision) or a filename is deliberately reused to overwrite another user's in-flight temp file. `mkstemp`'s real cost is one more `import` and remembering the manual `os.remove` step it doesn't do for you — a small, worthwhile trade for a real correctness and security guarantee an application would otherwise have to reimplement itself, badly.

## Connection

Builds on nothing new beyond basic file I/O. Used in this project's `/api/tools/import/preview` and `/api/tools/import` routes: an uploaded `.TOOLDB` file is saved to a real `mkstemp`-generated path (never the client's own filename) so `sqlalchemy-model-reuse-across-engines.md`'s technique can open it as a real SQLite database, then removed in a `finally` block once the request finishes, success or failure.

## Try It Yourself

1. Call `tempfile.mkstemp()` twice in a row with no arguments and print both paths — confirm they're genuinely different, generated without you specifying anything about *how* to make them unique.
2. Remove the `os.remove(path)` call and rerun the script twice — use your operating system's temp directory listing to confirm both leftover files are still there afterward, real proof that cleanup is the caller's own responsibility.
3. Look up `tempfile.NamedTemporaryFile` (a related, higher-level function) and compare its usage to `mkstemp` — in particular, its `delete=True` default, and reason about which one of the two is the better fit for a file that needs to stay on disk long enough for a *different* library (like SQLite, opening by path) to read it.
