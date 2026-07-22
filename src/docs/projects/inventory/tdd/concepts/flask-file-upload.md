# Concept: Flask File Uploads (`request.files`, `secure_filename`)

**What you'll understand by the end:** how a server receives an uploaded file (not a JSON body) from a request, and why the filename the client sends is untrusted input, exactly like every other value from `input-validation-at-boundary.md`.

**Prerequisites:** `flask-request-object.md`, `input-validation-at-boundary.md`.

## Setup

Python 3 with Flask installed:
```
pip install flask
```

## The Problem

`request.get_json()` reads a JSON body — but an uploaded file isn't JSON, and a browser sends it as a different kind of request body entirely (`multipart/form-data`, covered from the browser side in `browser-formdata-file-upload.md`). Something on the server side has to read that different format, and the filename the browser reports is exactly as untrustworthy as any other client-supplied string — including, concretely, a filename crafted to escape whatever directory the server meant to save it into (`../../etc/passwd` is a real, valid filename string as far as HTTP is concerned).

## The Isolated Example

```python
from flask import Flask, request
from werkzeug.utils import secure_filename

app = Flask(__name__)

@app.route("/upload", methods=["POST"])
def upload():
    f = request.files.get("file")
    if f is None or f.filename == "":
        return {"error": "no file"}, 400
    name = secure_filename(f.filename)
    data = f.read()
    return {"filename": name, "bytes": len(data)}

with app.test_client() as c:
    r = c.post("/upload", data={"file": (io.BytesIO(b"hello world"), "../../etc/passwd")},
               content_type="multipart/form-data")
    print(r.status_code, r.get_json())

    r = c.post("/upload", data={}, content_type="multipart/form-data")
    print(r.status_code, r.get_json())
```

**Real output:**
```
200 {'bytes': 11, 'filename': 'etc_passwd'}
400 {'error': 'no file'}
```

**What this proves:** a deliberately malicious filename (`../../etc/passwd`, a real path-traversal attempt) came back as the harmless, safe string `etc_passwd` — every path-separator and parent-directory reference stripped — without any manual string-cleaning code written here. A missing file is caught by the same kind of presence check `input-validation-at-boundary.md` already taught, applied to `request.files` instead of a JSON body.

`.read()` above pulls the whole upload into memory as bytes — fine for counting them, not what you want when a *different* library needs to open the result as a real file by path (SQLite is exactly this case: it opens a database file by path, it doesn't accept a blob of bytes handed to it directly). The same uploaded object has a second, real method for exactly that:

```python
import os
import tempfile

@app.route("/upload-to-disk", methods=["POST"])
def upload_to_disk():
    f = request.files.get("file")
    if f is None or f.filename == "":
        return {"error": "no file"}, 400
    name = secure_filename(f.filename)
    fd, path = tempfile.mkstemp(suffix=f"-{name}")
    os.close(fd)
    f.save(path)
    size = os.path.getsize(path)
    os.remove(path)
    return {"filename": name, "saved_bytes": size}

with app.test_client() as c:
    r = c.post("/upload-to-disk", data={"file": (io.BytesIO(b"hello world"), "notes.txt")},
               content_type="multipart/form-data")
    print(r.status_code, r.get_json())
```

**Real output:**
```
200 {'filename': 'notes.txt', 'saved_bytes': 11}
```

**What this proves:** `f.save(path)` wrote the upload's real bytes directly to the given real, `mkstemp`-generated path (`python-tempfile.md`) — `os.path.getsize(path)` reading back `11` (matching `len(b"hello world")`) confirms a real file was actually written to disk, not just held in memory the way `.read()` leaves it.

## Mechanical Walkthrough

- `request.files` — **(a) first appearance** — a dict-like object holding every uploaded file from a `multipart/form-data` request, keyed by the form field name the client used (`"file"` here) — the exact counterpart to `request.get_json()`'s role for JSON bodies, for this different body format.
- `request.files.get("file")` — **(b) reappearing** `.get(...)`-for-a-possibly-missing-key pattern (`python-dict-get-method.md`), returning `None` rather than raising if no file was sent under that field name.
- `f.filename` — **(a) first appearance** — the *client-reported* original filename, read from the upload's own metadata; genuinely untrusted, per the Problem above.
- `secure_filename(name)` — **(a) first appearance** — a real Werkzeug (Flask's own underlying library) function that strips path separators, parent-directory references, and other filesystem-unsafe characters, returning a plain, safe basename.
- `f.read()` — **(a) first appearance** — reads the actual uploaded file's bytes into memory, the same `.read()` interface a normal Python file object exposes.
- `f.save(path)` — **(a) first appearance** — a second, real method on the same uploaded-file object, distinct from `.read()`: writes the upload's bytes directly to a real path on disk, in one call, with no manual `open(...).write(...)` needed on either end. Requires a real path to write to first — paired here with `tempfile.mkstemp` (full treatment: `python-tempfile.md`), never a hand-built path, for the same untrusted-filename reason `secure_filename` exists at all.
- `os.path.getsize(path)` — **(a) first appearance** — a real stdlib call that reads a file's current size, in bytes, straight from the filesystem — used here only to prove `.save()` really wrote something, not as part of the upload mechanism itself.

## CS Lens

This is the same **trust boundary** concept `input-validation-at-boundary.md` already named, applied to a value (a filename) that's easy to forget is untrusted because it *looks* like harmless metadata rather than "user input" in the way a form field obviously is. A path-traversal attempt via a crafted filename is a real, common, historically exploited category of vulnerability — not a hypothetical.

Also recognized in: any system accepting a client-supplied filename for anything (email attachment handling, cloud storage upload APIs) — sanitizing or rejecting untrusted path components before touching a real filesystem path is a standing requirement, not specific to Flask.

## SE Lens

The alternative — trust `f.filename` and use it directly to build a save path — works for every well-behaved client and is a real, exploitable vulnerability for a malicious one. `secure_filename` is a small, real, already-solved piece of a bigger problem (Werkzeug maintains and tests it so individual applications don't each reinvent filename sanitization, and get it subtly wrong).

## Connection

Builds on `flask-request-object.md` and `input-validation-at-boundary.md`. Paired on the client side with `browser-formdata-file-upload.md` — together they're the full round trip an uploaded file actually takes.

## Try It Yourself

1. Upload a file with a filename containing only unusual-but-legal characters (`my file (draft).txt`) and confirm `secure_filename` preserves it reasonably, rather than mangling anything that isn't actually dangerous.
2. In `upload_to_disk` above, read the saved file's real content back with `open(path, "rb").read()` *before* `os.remove(path)` runs, and confirm it matches the original upload byte-for-byte — direct proof `.save()` wrote the real content, not just a file of the right size.
3. Try uploading with no `content_type="multipart/form-data"` at all (send `data=b"raw bytes"` instead) and observe that `request.files` comes back empty — confirming the *format* of the body, not just its presence, is what `request.files` depends on.
4. Remove the `os.remove(path)` call from `upload_to_disk`, upload twice, and confirm (via your OS's temp directory) that both real files are still there afterward — the same caller-owns-cleanup responsibility `python-tempfile.md` already names, now seen from the upload side specifically.
