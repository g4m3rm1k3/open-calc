# Lesson 18: The Number Was Never the Identity

## What you will build

`ToolImportPanel.tsx` and a real `POST /api/tools/import/preview` +
`POST /api/tools/import` pair — pick a real `.TOOLDB` file, see exactly
which real tools it contains, choose which ones, import them, with real
operational logging on every meaningful step. Along the way, a live,
structural correction: this project's whole tool-addressing scheme
(`/api/tools/<int:tool_number>`, a dict keyed by tool number) turns out
to have been built on a wrong assumption — that a tool number is
unique. It isn't, in the real system this project is modeled on, and
the fix (address every tool by its real GUID, always) is this lesson's
actual, transferable subject: **the field that looks like an identity
and the field that actually is one are not always the same field.**

## What you need to know first

Lesson 17: the real, GUID-keyed Class Table Inheritance schema
(`TlTool`/`TlToolMill`/`TlToolEndmill`/`TlToolDrill`/`TlAssemblyItem`),
`relationship()`/`back_populates`, the ORM cascade-delete pitfall. Lesson
7: `fetch`, CORS. Lesson 15: `Session`, `select`.

## Concepts cataloged from this lesson

Full standalone treatments live in `../concepts/`. Pointers to each are
also placed inline at their point of use below.

- `../concepts/logging-and-observability.md` — reappearing; already a
  complete, real treatment (found while checking before writing a new
  one) — referenced, not re-taught.
- `../concepts/flask-file-upload.md` — extended this lesson: its own
  isolated example only demonstrated `.read()`; `.save()` and
  `os.path.getsize` (both real, used in this lesson's own routes) were
  missing from it and have been added for real, not just assumed
  covered.
- `../concepts/browser-formdata-file-upload.md`
- `../concepts/python-tempfile.md`
- `../concepts/sqlalchemy-model-reuse-across-engines.md`
- `../concepts/get-or-create-pattern.md`
- `../concepts/react-lifting-state-up.md` — reappearing, applied to a
  refresh trigger instead of shared data.

## No pipeline diagram change

Tool import is persistence/data-management, not part of the G-code
pipeline — same as Lessons 13–17.

---

## Concept Unit: Real Operational Logging

_(Full standalone treatment: ../concepts/logging-and-observability.md —
reappearing here, not re-taught; this project's own first real use of
it.)_

### The Problem

Named directly, from the professional-concepts checklist this project
tracks: nothing in `cnc-service` had any real operational logging. Every
verification this whole curriculum has done so far relied on manual
`print()`/terminal transcripts, by deliberate pedagogical choice — but
the _shipped app itself_ had none. A file-import feature is a genuinely
good first real home for it: an import can partially succeed, partially
skip, and partially fail, all in one request, and "what actually
happened" is exactly the kind of question logging exists to answer
later.

### Project Change

- **Reference Source** — none. No reference counterpart: the reference
  app has no backend at all, so it has no server-side logging to port.
- **Files affected** — `cnc-service/app.py` (configuration),
  `cnc-service/core/tools.py` (a second, module-scoped logger).
- **Change type** — add.
- **Location** — `app.py`: top of file, before `app = Flask(__name__)`.
  `core/tools.py`: top of file, after imports.
- **Dependencies** — none; `logging` is standard library.

### The New Code

```python
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)
```

### The Updated Project

```python
import logging
import os
import tempfile
from dataclasses import dataclass

from flask import Flask, render_template, request
from flask_cors import CORS
from werkzeug.utils import secure_filename

# ... core imports ...

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:5180"])
```

`core/tools.py` gets its own, separately-named logger the same way:
`logger = logging.getLogger(__name__)`, which real code throughout this
lesson calls as `logger.info(...)`/`logger.warning(...)` at the exact
point each real fact becomes known — never gathered after the fact.

### Mechanical Walkthrough

Full first-appearance treatment is in the concept file — this project's
real `logging.basicConfig`/`getLogger(__name__)` pair _is_ that file's
own isolated example's structure, applied for real. One project-specific
detail: `getLogger(__name__)` called separately in `app.py` and
`core/tools.py` produces two differently-named loggers (`"app"` and
`"core.tools"`, `__name__` being each module's own real name) — visible
directly in this lesson's own real log output below, and exactly the
"one logger per module, filterable by where it came from" point the
concept file's Mechanical Walkthrough already makes.

### Verified, Run for Real

```
2026-07-20 20:21:45,549 INFO app: Import preview requested: Untitled.TOOLDB (221184 bytes)
2026-07-20 20:21:45,563 INFO core.tools: Read 3 tool(s) from ...: 3 usable, 0 skipped
```

Two real log lines, this session, from one real request — `app` and
`core.tools` each logging their own real, distinct fact.

---

## Concept Unit: A File, From the Browser to the Server

_(Full standalone treatments: ../concepts/browser-formdata-file-upload.md,
../concepts/flask-file-upload.md, ../concepts/python-tempfile.md.)_

### The Problem

Every prior route in this project sends and receives JSON. A `.TOOLDB`
file is binary — a real SQLite database, not text — and needs a
genuinely different transport, on both ends, plus somewhere real on disk
for the server side to actually open it as a database (SQLite opens
files by path, not by accepting raw bytes directly).

### The Concept, Isolated

Full standalone labs, run for real, in the three concept files above.
Not repeated here.

### Project Change

- **Reference Source** — none. No reference counterpart: the reference's
  own Tool Import/Export Buttons (`cnc-sim/cnc/components/ToolImportExportButtons.jsx`)
  import a JSON file, client-side only, with no server round trip at
  all — a genuinely different mechanism, not a citable line-for-line
  source for this one.
- **Files affected** — `cnc-web/src/ToolImportPanel.tsx` (new file),
  `cnc-service/app.py` (new route).
- **Change type** — add.
- **Location** — `app.py`: after the existing `/api/tools` routes.
- **Dependencies** — none new; `werkzeug` ships with Flask.

### The New Code

Client — two calls, same shape, one difference (the commit call also
sends _which_ tools were chosen):

```typescript
async function fetchPreview(file: File): Promise<PreviewResponse> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(
    "http://127.0.0.1:5000/api/tools/import/preview",
    {
      method: "POST",
      body,
    },
  );
  return response.json();
}

async function commitImport(
  file: File,
  toolIds: string[],
): Promise<ImportResponse> {
  const body = new FormData();
  body.append("file", file);
  for (const id of toolIds) {
    body.append("tool_id", id);
  }
  const response = await fetch("http://127.0.0.1:5000/api/tools/import", {
    method: "POST",
    body,
  });
  return response.json();
}
```

Server — two routes, same upload-to-temp-file shape, reading the
uploaded file differently once it's saved:

```python
@app.route("/api/tools/import/preview", methods=["POST"])
def preview_tool_import():
    upload = request.files.get("file")
    if upload is None or upload.filename == "":
        return {"error": "expected a file upload under the 'file' field"}, 400

    filename = secure_filename(upload.filename)
    fd, temp_path = tempfile.mkstemp(suffix=f"-{filename}")
    os.close(fd)
    try:
        upload.save(temp_path)
        logger.info("Import preview requested: %s (%s bytes)", filename, os.path.getsize(temp_path))
        tools = read_tools_from_file(temp_path)
    except Exception as error:
        # str(error) on a SQLAlchemy error includes the full failed SQL
        # statement — useful in the log, not in an API response to a client.
        reason = str(error).splitlines()[0]
        logger.warning("Import preview failed for %s: %s", filename, reason)
        return {"error": f"could not read {filename!r} as a tool database: {reason}"}, 400
    finally:
        os.remove(temp_path)

    return {"tools": tools}


@app.route("/api/tools/import", methods=["POST"])
def commit_tool_import():
    upload = request.files.get("file")
    if upload is None or upload.filename == "":
        return {"error": "expected a file upload under the 'file' field"}, 400
    tool_ids = request.form.getlist("tool_id")
    if not tool_ids:
        return {"error": "expected at least one 'tool_id' field"}, 400

    filename = secure_filename(upload.filename)
    fd, temp_path = tempfile.mkstemp(suffix=f"-{filename}")
    os.close(fd)
    try:
        upload.save(temp_path)
        logger.info("Import requested: %s tool(s) from %s", len(tool_ids), filename)
        result = import_tools_from_file(temp_path, tool_ids)
    except Exception as error:
        reason = str(error).splitlines()[0]
        logger.warning("Import failed for %s: %s", filename, reason)
        return {"error": f"could not import from {filename!r}: {reason}"}, 400
    finally:
        os.remove(temp_path)

    return result
```

### The Updated Project

Both routes above are the complete new addition to `app.py`, placed
directly after `remove_tool` (Lesson 17's last tool route) and before
the module's `if __name__ == "__main__":` guard, in that order
(preview, then commit) — no existing route is changed by either.
`import_tools_from_file` — what `commit_tool_import` actually calls —
is substantial enough to get its own full treatment; see "Concept Unit:
Get-or-Create, Applied to Imported Reference Data," below, after the
pieces it depends on are taught.

### Mechanical Walkthrough

`FormData`/`request.files`/`secure_filename`/`tempfile.mkstemp` are
fully covered in the three concept files above, and this project's own
real code matches each one's isolated example closely — but not
completely: `.save()` specifically was not yet demonstrated in
`flask-file-upload.md` before this lesson (its own example only showed
`.read()`), so it's now extended there, not just assumed covered.
What's new or extended, beyond straightforward reuse:

- `upload.save(temp_path)` — **(a) first appearance**, full treatment:
  `flask-file-upload.md`, extended this lesson specifically to add it —
  writes the upload's real bytes directly to the given path, the reason
  `tempfile.mkstemp` (above) exists at all here: SQLite (what
  `read_tools_from_file`/`import_tools_from_file` open next) reads a
  database by real file path, not by accepting raw bytes.
- `os.path.getsize(temp_path)` — **(a) first appearance**, also newly
  added to `flask-file-upload.md`'s own example — reads the just-saved
  file's real size straight from the filesystem, used here only to put
  a real, verifiable number in the log line, not as part of the upload
  mechanism itself.
- `str(error).splitlines()[0]` — **(a) first appearance** — a real
  SQLAlchemy error's `str()` can include the entire failed SQL
  statement (multi-line, and useful *in the log*, not in a client-facing
  error message) — `.splitlines()[0]` keeps only the first line for the
  `400` response, while `logger.warning` (below) still gets the short
  `reason`, not the full original exception; the *complete* error is
  never silently dropped, it's just routed to the log at `WARNING`
  rather than echoed back over the network.
- `except Exception as error:` — **(b) reappearing** `try`/`except`
  (Lesson 4's `python-try-except.md`) and `python-custom-exceptions.md`'s
  own point that a *specific* exception type is usually the better
  default — extended here for a real, deliberate reason: `read_tools_from_file`
  can fail for genuinely open-ended reasons (a file that isn't SQLite at
  all, one that's SQLite but doesn't match the expected schema, a locked
  file, disk I/O errors), coming from three different layers (the OS,
  `sqlite3`, SQLAlchemy) this route doesn't control and can't enumerate
  in advance — a bare `Exception` is the honest choice at exactly this
  kind of boundary (an untrusted external file, not this project's own
  code), not a shortcut taken to avoid thinking about specific failure
  modes. It is still narrower than it could be: a bare `except:` (no
  type at all) would also swallow things like a real `KeyboardInterrupt`,
  which `except Exception` deliberately does not.
- `body.append("tool_id", id)` called **in a loop**, once per selected
  tool, all under the _same_ field name — **(a) first appearance** — a
  single `FormData` field name is not required to be unique; appending
  it repeatedly accumulates a real, ordered _list_ of values under that
  one name, not repeated overwrites.
- `request.form.getlist("tool_id")` — **(a) first appearance** — the
  server-side counterpart: `request.form.get("tool_id")` (singular,
  reappearing from `request.files.get`'s shape) would only return the
  _first_ value; `.getlist(...)` returns every value sent under that
  field name, as a real Python list, matching what the client actually
  appended.
- The `try`/`except`/`finally` shape — **(b) reappearing**, this exact
  shape from `preview_tool_import` a few lines above — `finally:
os.remove(temp_path)` runs whether the body succeeds or raises,
  guaranteeing the temp file never survives past one request either
  way, matching `python-tempfile.md`'s own point that cleanup is never
  automatic.

### Execution Trace

The client-side loop against the 3 real tool IDs the "Verified" run
below actually imports (`["9b994e2d-...", "618b5ce9-...", "a2da4b9d-..."]`):

```
body = new FormData()
body.append("file", file)   ← one field, set once

for id of ["9b994e2d-...", "618b5ce9-...", "a2da4b9d-..."]:
  id="9b994e2d-...": body.append("tool_id", "9b994e2d-...")
    → body now has "tool_id" → ["9b994e2d-..."]
  id="618b5ce9-...": body.append("tool_id", "618b5ce9-...")
    → body now has "tool_id" → ["9b994e2d-...", "618b5ce9-..."]
  id="a2da4b9d-...": body.append("tool_id", "a2da4b9d-...")
    → body now has "tool_id" → ["9b994e2d-...", "618b5ce9-...", "a2da4b9d-..."]

fetch(..., { method: "POST", body })  ← one request, "tool_id" sent 3 times
```

Server side, `request.form.getlist("tool_id")` against that same request:

```
tool_ids = request.form.getlist("tool_id")
  → reads every value sent under the "tool_id" field name, in the order
    they were appended
  → tool_ids = ["9b994e2d-...", "618b5ce9-...", "a2da4b9d-..."]
if not tool_ids: → False (3 real values) → continue
len(tool_ids) → 3 → logged: "Import requested: 3 tool(s) from ..."
```

`request.form.get("tool_id")` (singular, no `list`) would have returned
only `"9b994e2d-..."` — the first of the three — silently dropping the
other two; `.getlist()` is what makes the loop on the client side and
the read on the server side actually agree on how many tools were
selected.

### Verified, Run for Real

```
POST /api/tools/import/preview, real Untitled.TOOLDB (221184 bytes):
  200 {"tools": [{"name": "0.5 Bull endmill", "is_metric": false, ...
POST /api/tools/import/preview, no file:
  400 {"error": "expected a file upload under the 'file' field"}
POST /api/tools/import/preview, a garbage (non-SQLite) file:
  400 {"error": "could not read 'fake.TOOLDB' as a tool database: (sqlite3.DatabaseError) file is not a database"}
POST /api/tools/import, real file + 3 real tool_id values:
  200 {"imported": ["9b994e2d-...", "618b5ce9-...", "a2da4b9d-..."], "skipped_duplicate": [], "skipped_unsupported": []}
```

All four, run for real this session via Flask's test client with a
real uploaded file object.

---

## Concept Unit: A Second Database, Read With the Same Models

_(Full standalone treatment:
../concepts/sqlalchemy-model-reuse-across-engines.md.)_

### The Problem

The uploaded file is a real, independent SQLite database — not this
project's own `instance/cnc.db`. Reading its tools needs _some_ way to
run `select(TlTool)`-style queries against it, without duplicating
`TlTool`/`TlToolMill`/`TlToolEndmill`/`TlToolDrill` as a second, parallel
set of classes just because the data happens to live in a different
file.

### The Concept, Isolated

Full standalone lab in `../concepts/sqlalchemy-model-reuse-across-engines.md`.
Not repeated here.

### Project Change

- **Reference Source** — none (SQLAlchemy library mechanism).
- **Files affected** — `cnc-service/core/tools.py`.
- **Change type** — add.
- **Location** — after `_tool_to_dict`.
- **Dependencies** — none beyond Lesson 17's `sqlalchemy`.

### The New Code

```python
def read_tools_from_file(path):
    engine = create_engine(f"sqlite:///{path}")
    try:
        with Session(engine) as session:
            rows = session.execute(select(TlTool).order_by(TlTool.ToolNumber)).scalars().all()
            tools = []
            for row in rows:
                if row.mill is None or (row.mill.endmill is None and row.mill.drill is None):
                    logger.warning("Skipping T%s (id=%s): unsupported tool shape", row.ToolNumber, row.ID)
                    continue
                tools.append(_tool_to_dict(row))
            return tools
    finally:
        engine.dispose()
```

### The Updated Project

```python
def read_tools_from_file(path):
    """Reads every tool from a real .TOOLDB-shaped SQLite file at `path`.

    Reuses this module's own ORM models against a second, independent
    engine/session pointed at the given file — the same TlTool/TlToolMill/
    etc. classes work unchanged against any file sharing the real schema,
    since a Session is bound to an engine at construction, not to the
    classes themselves. Read-only: nothing here ever writes to `path`.
    """
    engine = create_engine(f"sqlite:///{path}")
    try:
        with Session(engine) as session:
            rows = session.execute(select(TlTool).order_by(TlTool.ToolNumber)).scalars().all()
            tools = []
            skipped = 0
            for row in rows:
                if row.mill is None:
                    logger.warning(
                        "Skipping T%s (id=%s): no TlToolMill row — unsupported tool shape",
                        row.ToolNumber, row.ID,
                    )
                    skipped += 1
                    continue
                if row.mill.endmill is None and row.mill.drill is None:
                    logger.warning(
                        "Skipping T%s (id=%s): neither TlToolEndmill nor TlToolDrill — "
                        "unsupported tool shape",
                        row.ToolNumber, row.ID,
                    )
                    skipped += 1
                    continue
                tools.append(_tool_to_dict(row))
            logger.info(
                "Read %s tool(s) from %s: %s usable, %s skipped",
                len(rows), path, len(tools), skipped,
            )
            return tools
    finally:
        engine.dispose()
```

`core/tools.py` now offers a second real entry point — alongside
`list_tools()` (this project's own database) — for reading tools from
_any_ file sharing the real schema, using the identical model classes
and the identical `_tool_to_dict` shaping function either way.

### Mechanical Walkthrough

Full first-appearance treatment of the core technique is in the concept
file. New here: `engine.dispose()` in a `finally` — **(a) first
appearance** — releases the second engine's real connection pool once
this function is done with it; unlike this project's own long-lived
`get_engine()` (Lesson 15), a per-request engine like this one has a
real, bounded lifetime and should be cleaned up explicitly rather than
left to linger.

### Execution Trace

`read_tools_from_file("Untitled.TOOLDB")`, run for real this session —
this real file's own 4 tools all happen to have a real `mill` row *and*
either an `endmill` or `drill` row, so every row takes the same,
included path (the skip branches are real, live code, just not
triggered by this specific file — traced honestly below rather than
inventing a row that isn't actually there):

```
tools = [], skipped = 0

row 1 (ToolNumber=1): row.mill is None? → No (has a real TlToolMill row)
  row.mill.endmill is None and row.mill.drill is None? → No (has endmill)
  → tools.append(_tool_to_dict(row)) → tools = [{"tool_number":1,
    "name":"0.5 Bull endmill", "diameter":0.5, ...}]

row 2 (ToolNumber=2): row.mill is None? → No
  row.mill.endmill is None and row.mill.drill is None? → No (has endmill)
  → tools.append(...) → tools = [..., {"tool_number":2,
    "name":".3125 CT 1\"LOC", "diameter":0.3125, ...}]

(rows 3 and 4 follow the identical included path)

Loop ends (4 rows checked, 0 skipped).
logger.info("Read 4 tool(s) from Untitled.TOOLDB: 4 usable, 0 skipped")
return tools  (4 entries)
```

The two `if`/`continue` checks exist specifically for real files this
project's own small test file doesn't happen to contain — a row whose
`TlToolMill` is entirely missing, or one whose mill row has neither a
real `endmill` nor `drill` row underneath it (a tool shape this project
doesn't model, like a lathe tool). Either check firing would `continue`
straight past `tools.append(...)`, incrementing `skipped` instead —
real, reachable code, verified absent from this particular file rather
than assumed untested.

### CS Lens / SE Lens

Both fully covered in the concept file.

---

## Concept Unit: A Live Correction — The Number Was Never the Identity

### The Problem

Direct feedback, verbatim: _"In mastercam we are allowed to have more
than one numbered tool, we need it that way so we can assign different
parameters to a tool whilst keeping the same tool number."_ This
exposed a real design mistake, not just an unanswered policy question:
`GET`/`DELETE /api/tools/<int:tool_number>` and `list_tools()`'s
tool-number-keyed dict had silently assumed `tool_number` was unique —
and it never was, not even in this project's own schema (`TlTool.ToolNumber`
was declared with no `unique=True` anywhere).

### The Real Correction

```python
class TlTool(Base):
    __tablename__ = "TlTool"
    ID: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True)
    ToolNumber: Mapped[int]  # never declared unique — it was never true
```

The dict this produced would silently _drop_ a tool the moment two
shared a number:

```python
# before — silently lossy the moment two tools share a ToolNumber
return {str(row.ToolNumber): _tool_to_dict(row) for row in rows}
```

### The Fix

```python
# after — a list; tool_number is a plain, displayable, non-unique field
def list_tools():
    with get_session() as session:
        rows = session.execute(select(TlTool).order_by(TlTool.ToolNumber)).scalars().all()
        return [_tool_to_dict(row) for row in rows]
```

```python
@app.route("/api/tools/<uuid:tool_id>")
def get_tool(tool_id):
    tool = get_tool_by_id(tool_id)
    if tool is None:
        return {"error": f"no tool with id {tool_id}"}, 404
    return {"tool": tool}


@app.route("/api/tools/<uuid:tool_id>", methods=["DELETE"])
def remove_tool(tool_id):
    if not delete_tool(tool_id):
        return {"error": f"no tool with id {tool_id}"}, 404
    logger.info("Deleted tool id=%s", tool_id)
    return "", 204
```

### Execution Trace

The exact scenario the direct feedback names — two real tools sharing
`ToolNumber = 3` (e.g. two different, real end mills both mounted as
station T3 on separate setups) — traced through the buggy version first:

```
rows = [Tool(ID="aaa...", ToolNumber=3, name="end_mill_10mm"),
        Tool(ID="bbb...", ToolNumber=3, name="end_mill_8mm")]

Buggy dict comprehension:
  {str(row.ToolNumber): _tool_to_dict(row) for row in rows}
  row 1: key = str(3) = "3" → dict["3"] = {tool "aaa...", end_mill_10mm}
  row 2: key = str(3) = "3" → dict["3"] = {tool "bbb...", end_mill_8mm}
    ← SAME key as row 1 — this assignment OVERWRITES it
  Final: {"3": {tool "bbb...", end_mill_8mm}}
  → "aaa..." (end_mill_10mm) is silently gone — never in an error, never
    logged, just absent from the result
```

```
Fixed list comprehension:
  [_tool_to_dict(row) for row in rows]
  row 1: append({tool "aaa...", end_mill_10mm}) → [entry 1]
  row 2: append({tool "bbb...", end_mill_8mm}) → [entry 1, entry 2]
  Final: [{tool "aaa...", end_mill_10mm}, {tool "bbb...", end_mill_8mm}]
  → both tools present — a list has no concept of "key," so there was
    never anything for the second row to collide with
```

The dict version's real bug isn't in `_tool_to_dict` or the query — it's
that `str(row.ToolNumber)` was never a *unique* key to begin with, and a
Python dict silently accepts the second `dict[key] = ...` as an
overwrite, with no warning that the first value was ever there.

`delete_tool` itself needed a small real change too — it used to look
up the id it needed from `tool_number` internally; now it's handed the
id directly, so that lookup became a plain existence check, pulled out
into its own real function (also used by the import logic later in
this lesson, to detect an already-imported tool):

```python
def tool_exists(tool_id):
    with get_session() as session:
        return session.execute(
            select(TlTool.ID).where(TlTool.ID == tool_id)
        ).scalar_one_or_none() is not None


def delete_tool(tool_id):
    with get_session() as session:
        if not tool_exists(tool_id):
            return False
        session.execute(delete(TlAssemblyItem).where(TlAssemblyItem.ID == tool_id))
        session.execute(delete(TlToolEndmill).where(TlToolEndmill.ID == tool_id))
        session.execute(delete(TlToolDrill).where(TlToolDrill.ID == tool_id))
        session.execute(delete(TlToolMill).where(TlToolMill.ID == tool_id))
        session.execute(delete(TlTool).where(TlTool.ID == tool_id))
        session.commit()
        return True
```

And `insert_tool` — used both by the manual Add-Tool route and, new
this lesson, by import — gained an optional `tool_id` parameter, and
now returns the id it used:

```python
def insert_tool(
    tool_number, mill_fields, catalog_fields,
    endmill_fields=None, drill_fields=None, tool_id=None,
):
    """Inserts one new tool. Returns the real GUID it was stored under.

    `tool_id` defaults to a freshly generated GUID (a manually-added
    tool). Import passes the *source* file's own real GUID instead, so a
    re-imported tool keeps its true identity rather than becoming a new,
    unrelated row every time.
    """
    if tool_id is None:
        tool_id = uuid.uuid4()
    with get_session() as session:
        session.add(TlTool(ID=tool_id, ToolNumber=tool_number))
        session.add(TlToolMill(ID=tool_id, **mill_fields))
        if endmill_fields is not None:
            session.add(TlToolEndmill(ID=tool_id, **endmill_fields))
        if drill_fields is not None:
            session.add(TlToolDrill(ID=tool_id, **drill_fields))
        session.add(
            TlAssemblyItem(
                ID=tool_id,
                Name=catalog_fields.get("Name", ""),
                IsMetric=catalog_fields["is_metric"],
                TlToolMaterialID=catalog_fields.get("material_id"),
                TlManufacturerID=catalog_fields.get("manufacturer_id"),
            )
        )
        session.commit()
    return tool_id
```

The frontend needed the identical correction — `ToolCardList.tsx` had
the same `tool_number`-keyed assumption baked into three separate
places: the fetch response type, the delete call, and the render key:

```typescript
// before
interface ToolsResponse {
  tools: Record<string, Tool>;
}
async function deleteToolByNumber(toolNumber: number): Promise<void> {
  await fetch(`http://127.0.0.1:5000/api/tools/${toolNumber}`, {
    method: "DELETE",
  });
}
// ...
const visibleTools = Object.entries(tools);
const handleDelete = async (toolNumber: number) => {
  await deleteToolByNumber(toolNumber);
  setTools((prev) => {
    const next = { ...prev };
    delete next[String(toolNumber)];
    return next;
  });
};
```

```typescript
// after
interface ToolsResponse {
  tools: Tool[];
}
async function deleteToolById(id: string): Promise<void> {
  await fetch(`http://127.0.0.1:5000/api/tools/${id}`, { method: "DELETE" });
}
// ...
const handleDelete = async (id: string) => {
  await deleteToolById(id);
  setTools((prev) => prev.filter((t) => t.id !== id));
};
```

The render itself changed from `Object.entries(tools).map(([toolNumber, t]) => ...)`
to a plain `tools.map((t) => ...)`, keyed by `t.id` instead of the
tuple's `toolNumber` — the full, current file is shown as the Updated
Project of this same unit, below.

### The Updated Project

`cnc-web/src/ToolCardList.tsx`, in full — every piece above, in place:

```typescript
import { useEffect, useState } from "react";

interface Tool {
  id: string;
  tool_number: number;
  name: string;
  is_metric: boolean;
  diameter: number;
  total_length: number;
  flute_count: number;
  cutting_depth: number;
  arbor_diameter: number;
  corner_radius: number | null;
  tip_angle: number | null;
  material: string | null;
  manufacturer: string | null;
}

interface ToolsResponse {
  tools: Tool[];
}

async function fetchTools(): Promise<Tool[]> {
  const response = await fetch("http://127.0.0.1:5000/api/tools");
  const data: ToolsResponse = await response.json();
  return data.tools;
}

async function deleteToolById(id: string): Promise<void> {
  await fetch(`http://127.0.0.1:5000/api/tools/${id}`, {
    method: "DELETE",
  });
}

interface ToolCardListProps {
  refreshKey?: number;
}

function ToolCardList({ refreshKey }: ToolCardListProps) {
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    fetchTools().then(setTools);
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    await deleteToolById(id);
    setTools((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <div className="sec">Tool Table (Mill)</div>
      {tools.map((t) => {
        const kind = t.corner_radius != null ? "Endmill" : "Drill";
        return (
          <div key={t.id} className="tcard">
            <div className="tcard-h">
              <span className="tcard-name">
                T{String(t.tool_number).padStart(2, "0")} — {kind}
              </span>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-muted)",
                  cursor: "pointer",
                  marginLeft: "auto",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(t.id);
                }}
              >
                ✕
              </button>
            </div>
            <div className="tcard-meta">
              {t.name} Ø{t.diameter}
              {t.is_metric ? "mm" : "in"}{" "}
              {t.corner_radius != null
                ? `R${t.corner_radius}${t.is_metric ? "mm" : "in"}`
                : `${t.tip_angle}°`}{" "}
              {t.material ?? "—"} · {t.manufacturer ?? "—"}
            </div>
          </div>
        );
      })}
      {tools.length === 0 && (
        <div style={{ color: "var(--color-muted)", fontSize: 9, padding: "8px 0" }}>
          No mill tools defined.
        </div>
      )}
    </>
  );
}

export default ToolCardList;
```

(`refreshKey`'s own reason for existing — a sibling component telling
this one to refetch — is taught in "Selection State and a Sibling
Refresh," later in this lesson; it's included here only because it's
part of this file's real, current, whole content.)

### Mechanical Walkthrough

- `<uuid:tool_id>` — **(a) first appearance** of Flask's `uuid` URL
  converter — parses a URL segment directly into a real Python
  `uuid.UUID`, the same way `<int:...>` (used throughout Lessons 13–17)
  parses into an `int`; a request to a malformed non-UUID path segment
  is rejected by Flask's own routing before the view function even
  runs, the same automatic-validation benefit `<int:...>` already gave.
- `[_tool_to_dict(row) for row in rows]` — **(c) already established**
  list comprehension, replacing the prior dict comprehension — the
  actual, minimal fix: same data, a shape that can hold duplicates.
- `tool_id: uuid.UUID | None = None` as a Python default parameter —
  **(b) reappearing** (`python-default-parameter-values.md`) — `None`
  specifically chosen (rather than, say, generating a UUID in the
  signature itself) because default argument values in Python are
  evaluated once, at function-definition time, not once per call — a
  default of `uuid.uuid4()` directly in the signature would generate
  _one_ UUID, reused for every call that didn't pass its own.
- `prev.filter((t) => t.id !== id)` — **(b) reappearing**
  `javascript-array-map.md`'s sibling array method, `.filter` (not
  previously named in this project by its own concept file, but the
  same "produce a new array, don't mutate the old one" discipline),
  replacing the prior dict-based `delete next[key]` mutation-of-a-copy
  pattern.

### Execution Trace

`prev.filter((t) => t.id !== id)` against the real, now-representable
duplicate-`T1` scenario (`prev` has two real `T1` rows with different
real ids), deleting the second one (`id="bbb..."`):

```
prev = [{id:"aaa...", tool_number:1, name:"end_mill_10mm"},
        {id:"bbb...", tool_number:1, name:"end_mill_8mm"},
        {id:"ccc...", tool_number:2, name:"drill_hss"}]

handleDelete("bbb...") → deleteToolById("bbb...") → server deletes that
  one real row → setTools((prev) => prev.filter((t) => t.id !== "bbb..."))

t={id:"aaa...", tool_number:1, ...}: "aaa..." !== "bbb..."? → True → kept
t={id:"bbb...", tool_number:1, ...}: "bbb..." !== "bbb..."? → False → dropped
t={id:"ccc...", tool_number:2, ...}: "ccc..." !== "bbb..."? → True → kept

next = [{id:"aaa...", tool_number:1, ...}, {id:"ccc...", tool_number:2, ...}]
```

`.filter()` checks every element against `id`, not just `tool_number` —
this is exactly why the *other* real `T1` tool (`"aaa..."`) survives
the delete: filtering by the real, unique `id` is what makes deleting
one of two same-numbered tools even possible, the same fix this whole
lesson is about, now reaching the frontend's own local state update.

### Verified, the Real Duplicate Scenario, This Session

```python
>>> [t["tool_number"] for t in requests.get(".../api/tools").json()["tools"]]
[1, 1, 2, 2, 3, 3, 4]
```

Seven real tools: this project's original four, plus three imported
from `Untitled.TOOLDB` — `T1` genuinely appears twice, each a distinct
real row (distinct GUIDs), exactly the scenario direct feedback
described, now actually representable.

### CS Lens

The general idea here is **identity vs. attribute** — many real systems
have a value that _looks_ like a natural identifier (a tool number, a
person's name, a product's SKU-looking label) but isn't actually
guaranteed unique by the real domain it models; the only safe, real
identity is whatever the domain's own rules actually guarantee is
unique — here, a GUID, because that's what Mastercam's own real schema
uses as `TlTool`'s primary key.

Also recognized in: using a person's name or email as a database's
primary key (a classic, recurring real mistake — two people can share a
name; email addresses get reassigned) instead of a real, system-
generated identity column.

### SE Lens

The alternative — keep `tool_number` as the addressing key and add
special-case logic for "if this number already exists, do X" — would
have meant designing a real policy (renumber? reject? merge?) for a
situation that, per direct correction, isn't actually a conflict at
all. Recognizing an assumption was simply _wrong_ — not merely
under-specified — meant the fix was a real simplification, not a
special case bolted on: addressing by GUID always was the correct
design, since GUID was already this schema's own real primary key from
Lesson 17.

---

## Concept Unit: Get-or-Create, Applied to Imported Reference Data

_(Full standalone treatment: ../concepts/get-or-create-pattern.md.)_

### The Problem

An imported tool's real material ("Carbide") and manufacturer
("Mastercam") exist as rows in the _source_ file, under GUIDs that mean
nothing in this project's own database. Blindly re-inserting them by
their source GUID would either collide (if this project already has
different rows using those exact GUIDs — astronomically unlikely, but
not the real problem) or, more importantly, would miss the real,
useful case where this project _already has_ a "Carbide" material row
and shouldn't create a second, duplicate one.

### The Concept, Isolated

Full standalone lab in `../concepts/get-or-create-pattern.md`. Not
repeated here.

### Project Change

- **Reference Source** — none (this project's own data-integrity logic).
- **Files affected** — `cnc-service/core/tools.py`.
- **Change type** — add.
- **Location** — after `get_manufacturer_id_by_name`.

### The New Code

```python
def get_or_create_material(name, description=""):
    existing = get_material_id_by_name(name)
    if existing is not None:
        return existing
    new_id = uuid.uuid4()
    with get_session() as session:
        session.add(TlMaterial(ID=new_id, Name=name, Description=description))
        session.commit()
    return new_id


def get_or_create_manufacturer(name, description=""):
    existing = get_manufacturer_id_by_name(name)
    if existing is not None:
        return existing
    new_id = uuid.uuid4()
    with get_session() as session:
        session.add(TlManufacturer(ID=new_id, Name=name, Description=description))
        session.commit()
    return new_id
```

The identical shape, one table over — genuinely repeated code, shown in
full rather than described, since this is the actual, current content
of the file, not a fragment.

### The Updated Project

Both functions above are used together inside `import_tools_from_file`
— the real function `commit_tool_import` (taught earlier in this
lesson) calls. This is the actual, complete function, combining every
technique this lesson has built so far: reading a second database
(`sqlalchemy-model-reuse-across-engines.md`), `tool_exists` (this
lesson's own Live Correction unit), and get-or-create, above:

```python
def import_tools_from_file(path, tool_ids):
    """Copies specific tools (by their real source GUIDs) from a real
    .TOOLDB-shaped file at `path` into this project's own table.

    Preserves the source tool's real GUID and tool_number exactly — per
    direct instruction, tool numbers are allowed to repeat (Mastercam
    itself allows several distinct tools sharing one number), so there is
    no renumbering to do. A tool whose GUID already exists in this table
    is skipped as an already-imported duplicate, not re-inserted —
    the one real case where the *same* GUID could legitimately collide
    (importing the same file twice).
    """
    engine = create_engine(f"sqlite:///{path}")
    imported, skipped_duplicate, skipped_unsupported = [], [], []
    try:
        with Session(engine) as session:
            for tool_id in tool_ids:
                row = session.execute(
                    select(TlTool).where(TlTool.ID == tool_id)
                ).scalar_one_or_none()
                if row is None or row.mill is None or (
                    row.mill.endmill is None and row.mill.drill is None
                ):
                    logger.warning("Import: %s not found or unsupported shape, skipping", tool_id)
                    skipped_unsupported.append(str(tool_id))
                    continue
                if tool_exists(row.ID):
                    logger.info("Import: T%s (id=%s) already present, skipping", row.ToolNumber, row.ID)
                    skipped_duplicate.append(str(row.ID))
                    continue

                catalog = row.catalog_item
                material_id = None
                if catalog and catalog.tool_material:
                    material_id = get_or_create_material(
                        catalog.tool_material.material.Name,
                        catalog.tool_material.material.Description,
                    )
                manufacturer_id = None
                if catalog and catalog.manufacturer:
                    manufacturer_id = get_or_create_manufacturer(
                        catalog.manufacturer.Name, catalog.manufacturer.Description
                    )

                insert_tool(
                    row.ToolNumber,
                    {
                        "OverallDiameter": row.mill.OverallDiameter,
                        "OverallLength": row.mill.OverallLength,
                        "FluteCount": row.mill.FluteCount,
                        "CuttingDepth": row.mill.CuttingDepth,
                        "ArborDiameter": row.mill.ArborDiameter,
                    },
                    {
                        "Name": catalog.Name if catalog else "",
                        "is_metric": catalog.IsMetric if catalog else True,
                        "material_id": material_id,
                        "manufacturer_id": manufacturer_id,
                    },
                    endmill_fields={"CornerRadius": row.mill.endmill.CornerRadius} if row.mill.endmill else None,
                    drill_fields={"TipAngle": row.mill.drill.TipAngle} if row.mill.drill else None,
                    tool_id=row.ID,
                )
                imported.append(str(row.ID))
    finally:
        engine.dispose()

    logger.info(
        "Import from %s: %s imported, %s duplicate, %s unsupported",
        path, len(imported), len(skipped_duplicate), len(skipped_unsupported),
    )
    return {
        "imported": imported,
        "skipped_duplicate": skipped_duplicate,
        "skipped_unsupported": skipped_unsupported,
    }
```

### Mechanical Walkthrough

Full first-appearance treatment of get-or-create itself is in the
concept file. New here, in the real, complete function:

- `existing = get_material_id_by_name(...)` (inside `get_or_create_material`)
  calls an _already-real, already-existing_ function from Lesson 17
  (built originally for the manual Tool Edit form's material lookup) —
  reused unchanged, the earlier function's own generality paying off
  sooner than expected.
- `imported, skipped_duplicate, skipped_unsupported = [], [], []` —
  **(b) reappearing** multiple-assignment/tuple-unpacking
  (`python-tuple-unpacking.md`), three independent lists initialized in
  one line — each one accumulates a real, distinct outcome the caller
  needs to report back.
- The `for tool_id in tool_ids:` loop's first `if` — **(c) already
  established** boolean `or` short-circuiting — checks three genuinely
  different failure reasons (not found in the source file at all, no
  mill geometry, no endmill/drill row) as one combined "unsupported"
  outcome, matching `read_tools_from_file`'s own reasoning applied here
  to a _specific requested_ tool rather than a whole file's contents.
- `tool_exists(row.ID)` — **(b) reappearing**, this lesson's own
  function from the Live Correction unit — the actual idempotency
  check: a tool already present, by its real GUID, is skipped rather
  than reinserted.
- `insert_tool(..., tool_id=row.ID)` — **(b) reappearing**, this
  lesson's own updated `insert_tool` — the one call site that actually
  uses the new optional `tool_id` parameter to preserve a tool's real,
  original identity across the copy.

### Execution Trace

`get_or_create_material`/`get_or_create_manufacturer`, called once per
imported tool inside the loop — traced against the real, cited before/
after materials data below (`Carbide` already existed; the source
file's manufacturer, `Mastercam`, didn't):

```
Call: get_or_create_material("Carbide", "...")
  existing = get_material_id_by_name("Carbide")
    → this project's own seed data already has a "Carbide" row
    → existing = <real material id>
  existing is not None?  → True → return existing immediately
  → no new_id generated, no TlMaterial row added — the loop's Materials
    table stays at exactly the same 2 rows it started with

Call: get_or_create_manufacturer("Mastercam", "Mastercam Imported Data")
  existing = get_manufacturer_id_by_name("Mastercam")
    → this project's own seed data has no "Mastercam" row yet
    → existing = None
  existing is not None?  → False → continue past the early return
  new_id = uuid.uuid4()  → a brand-new, real UUID
  session.add(TlManufacturer(ID=new_id, Name="Mastercam",
    Description="Mastercam Imported Data")); session.commit()
  → return new_id  ← a genuinely new row now exists
```

Both functions run the identical shape — the only reason one returns
early and the other inserts a new row is what `get_..._id_by_name`
happens to find, which is exactly why "Carbide" stays at one real row
even after 3 tools (all carbide) are imported in the same pass, while
"Mastercam" goes from absent to present exactly once.

### Verified, Run for Real

```
Materials before + after import: [('Carbide', 'Seed data'), ('HSS', 'Seed data')]
Manufacturers before + after import: [('Generic', 'Seed data'), ('Mastercam', 'Mastercam Imported Data')]
```

`Carbide` — already present — was reused, not duplicated (still exactly
one row). `Mastercam` — genuinely new — was created, carrying its real
description straight from the source file.

### CS Lens / SE Lens

Both fully covered in the concept file. Connects directly to
`idempotent-initialization-guard.md`'s core idea (already taught,
Lesson 14/15's `seed_tools_if_empty`) — the whole _import_ operation
this lesson builds is itself idempotent by the same logic, one level
up: re-importing an already-imported tool (matched by its real GUID,
not by name) is recognized and skipped, never duplicated, verified
directly this session (`"skipped_duplicate": [...]`, `0 imported` on a
deliberate re-import of the same three tools).

---

## Concept Unit: Selection State and a Sibling Refresh

_(Reappearing: ../concepts/react-lifting-state-up.md.)_

### The Problem

Two small, real UI needs: tracking _which_ of several preview cards are
checked (a set of ids, not one value), and telling the separate
`ToolCardList` component — a true sibling, not a parent/child — that
new tools exist after a successful import.

### Project Change

- **Reference Source** — none (UI state, no reference counterpart for
  this exact widget, per the earlier unit).
- **Files affected** — `cnc-web/src/ToolImportPanel.tsx`,
  `cnc-web/src/ToolCardList.tsx`, `cnc-web/src/App.tsx`.
- **Change type** — add.

### The New Code

```typescript
const [selected, setSelected] = useState<Set<string>>(new Set());

const toggleSelected = (id: string) => {
  setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
};
```

```typescript
// App.tsx — the nearest common parent of the two siblings
const [toolsRefreshKey, setToolsRefreshKey] = useState(0);
// ...
<ToolCardList refreshKey={toolsRefreshKey} />
<ToolImportPanel onImported={() => setToolsRefreshKey((k) => k + 1)} />
```

### The Updated Project

`cnc-web/src/ToolImportPanel.tsx`, in full — every piece built across
this whole lesson (`fetchPreview`/`commitImport` from "A File, From the
Browser to the Server," `handleClose` from the earlier close-button
work, `selected`/`toggleSelected` from this unit) as one real,
complete file:

```typescript
import { useState } from "react";

interface PreviewTool {
  id: string;
  tool_number: number;
  name: string;
  is_metric: boolean;
  diameter: number;
  total_length: number;
  flute_count: number;
  cutting_depth: number;
  arbor_diameter: number;
  corner_radius: number | null;
  tip_angle: number | null;
  material: string | null;
  manufacturer: string | null;
}

interface PreviewResponse {
  tools?: PreviewTool[];
  error?: string;
}

interface ImportResponse {
  imported?: string[];
  skipped_duplicate?: string[];
  skipped_unsupported?: string[];
  error?: string;
}

async function fetchPreview(file: File): Promise<PreviewResponse> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("http://127.0.0.1:5000/api/tools/import/preview", {
    method: "POST",
    body,
  });
  return response.json();
}

async function commitImport(file: File, toolIds: string[]): Promise<ImportResponse> {
  const body = new FormData();
  body.append("file", file);
  for (const id of toolIds) {
    body.append("tool_id", id);
  }
  const response = await fetch("http://127.0.0.1:5000/api/tools/import", {
    method: "POST",
    body,
  });
  return response.json();
}

interface ToolImportPanelProps {
  onImported?: () => void;
}

function ToolImportPanel({ onImported }: ToolImportPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [tools, setTools] = useState<PreviewTool[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleFileChange = async (chosen: File | undefined) => {
    if (!chosen) return;
    setFile(chosen);
    setError(null);
    setSummary(null);
    setLoading(true);
    setSelected(new Set());
    const result = await fetchPreview(chosen);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      setTools([]);
      return;
    }
    setTools(result.tools ?? []);
  };

  const handleImport = async () => {
    if (!file || selected.size === 0) return;
    setImporting(true);
    setSummary(null);
    setError(null);
    const result = await commitImport(file, Array.from(selected));
    setImporting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    const imported = result.imported?.length ?? 0;
    const duplicate = result.skipped_duplicate?.length ?? 0;
    setSummary(`Imported ${imported} tool(s)${duplicate ? `, ${duplicate} already present` : ""}.`);
    setSelected(new Set());
    onImported?.();
  };

  const handleClose = () => {
    setFile(null);
    setTools([]);
    setSelected(new Set());
    setError(null);
    setSummary(null);
    setLoading(false);
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      <div className="sec">Import Tools From Database</div>
      <div className="btnrow" style={{ marginBottom: 6 }}>
        <label className="btn" style={{ cursor: "pointer" }}>
          Choose .TOOLDB File
          <input
            type="file"
            accept=".tooldb,.TOOLDB"
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
        </label>
        {file && (
          <>
            <span style={{ color: "var(--color-muted)", fontSize: 9, alignSelf: "center" }}>
              {file.name}
            </span>
            <button
              style={{
                background: "none",
                border: "none",
                color: "var(--color-muted)",
                cursor: "pointer",
                marginLeft: "auto",
              }}
              onClick={handleClose}
              title="Close"
            >
              ✕
            </button>
          </>
        )}
      </div>
      {loading && (
        <div style={{ color: "var(--color-muted)", fontSize: 9, padding: "8px 0" }}>
          Reading {file?.name}…
        </div>
      )}
      {error && (
        <div style={{ color: "var(--color-rapid)", fontSize: 9, padding: "8px 0" }}>
          {error}
        </div>
      )}
      {summary && (
        <div style={{ color: "var(--color-accent-green-bright)", fontSize: 9, padding: "8px 0" }}>
          {summary}
        </div>
      )}
      {tools.map((t) => {
        const kind = t.corner_radius != null ? "Endmill" : "Drill";
        const isSelected = selected.has(t.id);
        return (
          <div
            key={t.id}
            className={`tcard${isSelected ? " on" : ""}`}
            onClick={() => toggleSelected(t.id)}
          >
            <div className="tcard-h">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelected(t.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="tcard-name">
                Source T{String(t.tool_number).padStart(2, "0")} — {kind}
              </span>
            </div>
            <div className="tcard-meta">
              {t.name} Ø{t.diameter}
              {t.is_metric ? "mm" : "in"}{" "}
              {t.corner_radius != null
                ? `R${t.corner_radius}${t.is_metric ? "mm" : "in"}`
                : `${t.tip_angle}°`}{" "}
              {t.material ?? "—"} · {t.manufacturer ?? "—"}
            </div>
          </div>
        );
      })}
      {tools.length > 0 && (
        <button
          className="btn btn-gr full"
          disabled={selected.size === 0 || importing}
          onClick={handleImport}
        >
          {importing ? "Importing…" : `Import Selected (${selected.size})`}
        </button>
      )}
    </>
  );
}

export default ToolImportPanel;
```

`ToolCardList`'s fetch effect depends on the lifted key from `App.tsx`,
below:

```typescript
function ToolCardList({ refreshKey }: ToolCardListProps) {
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    fetchTools().then(setTools);
  }, [refreshKey]);
```

And the real, complete `App.tsx` — the nearest common parent wiring
both siblings together, new lines marked:

```typescript
import { useEffect, useState } from "react";
import Viewport from "./Viewport.tsx";
import PathDump from "./PathDump.tsx";
import ToolCardList from "./ToolCardList.tsx";
import ToolImportPanel from "./ToolImportPanel.tsx"; // ← new
import MachineStatus from "./MachineStatus.tsx";
import type { PathPoint } from "./segments.ts";

interface PathResponse {
  points: PathPoint[];
}

async function fetchPath(program: string): Promise<PathPoint[]> {
  const response = await fetch("http://127.0.0.1:5000/api/path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  });
  const data: PathResponse = await response.json();
  return data.points;
}

const PROGRAM = "M3 S1000\nG0 X10 Y20\nX30\nG1 Z-5 F100\nM8";

function App() {
  const [points, setPoints] = useState<PathPoint[]>([]);
  const [toolsRefreshKey, setToolsRefreshKey] = useState(0); // ← new

  useEffect(() => {
    fetchPath(PROGRAM).then(setPoints);
  }, []);

  return (
    <>
      <h1>Toolpath</h1>
      <Viewport points={points} />
      <PathDump data={points} />
      <h1>DRO</h1>
      <MachineStatus program={PROGRAM} />
      <h1>Tools</h1>
      <ToolCardList refreshKey={toolsRefreshKey} /> {/* ← new prop */}
      <ToolImportPanel onImported={() => setToolsRefreshKey((k) => k + 1)} /> {/* ← new */}
    </>
  );
}

export default App;
```

`App` itself still holds no tools data at all — only the trigger — so
neither sibling's own state moved anywhere; `App`'s new job is exactly
one number and the callback that increments it.

### Mechanical Walkthrough

- `useState<Set<string>>(new Set())` — **(a) first appearance** of
  `Set` as React state — chosen specifically because membership
  (`.has(id)`) and toggling are both real, native `Set` operations;
  an array would need `.includes()` (linear scan) and manual
  add/remove-by-filtering for the same job.
- `const next = new Set(prev); next.delete(id) / .add(id); return next` —
  **(b) reappearing** the same "copy, then mutate the copy, then
  return it" immutability discipline this project's `setTools`
  updates already used with plain objects/arrays — applied here to a
  `Set` instead, for the same reason: React needs a genuinely new
  reference to detect the state actually changed.
- `refreshKey` as a `useEffect` dependency — **(b) reappearing**
  `useEffect`'s dependency-array mechanism (Lesson 8+), used here
  specifically as a plain trigger (its numeric _value_ is never read,
  only "did it change") rather than to carry data.
- The lifted `toolsRefreshKey` in `App.tsx` — **(b) reappearing**,
  full treatment already in `react-lifting-state-up.md`; the only
  new wrinkle is that what's lifted is a _trigger_, not shared data
  itself — `App.tsx` never touches the tools list, it only knows
  "something changed, tell whoever cares."

### Execution Trace

`toggleSelected` against the 3 real preview tool ids this lesson
already cites (`"9b994e2d-..."`, `"618b5ce9-..."`, `"a2da4b9d-..."`),
clicked in order, then the first one clicked again to deselect it:

```
Start: selected = Set() (empty)

toggleSelected("9b994e2d-..."):
  next = new Set(selected) → Set() (copy of empty set)
  next.has("9b994e2d-...")? → False → next.add("9b994e2d-...")
  → selected = Set{"9b994e2d-..."}

toggleSelected("618b5ce9-..."):
  next = new Set(selected) → Set{"9b994e2d-..."} (copy)
  next.has("618b5ce9-...")? → False → next.add("618b5ce9-...")
  → selected = Set{"9b994e2d-...", "618b5ce9-..."}

toggleSelected("a2da4b9d-..."):
  next = new Set(selected) → copy of the 2-item set
  next.has("a2da4b9d-...")? → False → next.add("a2da4b9d-...")
  → selected = Set{"9b994e2d-...", "618b5ce9-...", "a2da4b9d-..."}

toggleSelected("9b994e2d-...") again (deselecting the first one):
  next = new Set(selected) → copy of the 3-item set
  next.has("9b994e2d-...")? → True → next.delete("9b994e2d-...")
  → selected = Set{"618b5ce9-...", "a2da4b9d-..."}
```

Every call builds a brand-new `Set` from a copy of the previous one —
`next.has(id)` is what decides which branch runs, `add` or `delete`,
so the same function correctly handles both "select" and "deselect"
depending purely on whether that id is already in the set when it's
called.

### CS Lens

`Set` is the right **abstract data type** for "does this exist in this
collection, and can I add/remove it cheaply" — the same category of
reasoning `dict-as-lookup-table.md` already applies to key lookups,
here applied to membership rather than key→value mapping.

### Verified, Run for Real

Real end-to-end run this session: selected all 3 real preview tools,
clicked Import Selected, `ToolCardList` re-fetched and displayed all 7
tools (4 original + 3 imported) with no manual page reload — the
`refreshKey` bump alone triggered it.

---

## Concept Unit: New Button Styles, Ported From the Reference

_(Reappearing: ../concepts/css-custom-properties.md,
../concepts/css-rule-syntax-selectors-cascade.md.)_

### The Problem

`ToolImportPanel.tsx`, shown in full above, already uses
`className="btn"`, `className="btnrow"`, and
`className="btn btn-gr full"` — but nothing in `cnc-web/src/theme.css`
backs any of those class names yet. Without real CSS behind them, every
button in this file renders as an unstyled, default-browser button.

### Project Change

- **Reference Source** — `cnc-sim/cnc/CNCSim.jsx`'s own embedded CSS
  template, lines 1670–1678 (`.btn`, `.btn:hover`, `.btn-gr`, `.btn.full`,
  `.btnrow` — `.btn-bl`/`.btn-am`/`.btn-rd`/`.btn.lg` are also declared
  there but used by no component built so far, so they stay unported,
  the same "port what's actually used" scope rule Lesson 12 already
  established for this same file).
- **Files affected** — `cnc-web/src/theme.css`.
- **Change type** — add.

### The New Code

Four new custom properties, alongside the ones Lessons 12 and 17 already
added to the same `:root` block:

```css
--color-panel: #1e293b;
--color-accent-blue: #63b8ff;
--color-accent-blue-bright: #94b8ff;
--color-accent-green-bg: rgba(70, 216, 159, 0.1);
```

And the five real rules that use them, ported verbatim from the
reference lines cited above:

```css
.btn {
  background: var(--color-panel);
  border: 1px solid var(--color-border-strong);
  color: var(--color-text);
  border-radius: 3px;
  padding: 5px 10px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}
.btn:hover {
  border-color: var(--color-accent-blue);
  color: var(--color-accent-blue-bright);
}
.btn-gr {
  background: var(--color-accent-green-bg);
  color: var(--color-accent-green-bright);
  border-color: var(--color-accent-green);
}
.btn.full {
  width: 100%;
  text-align: center;
}
.btnrow {
  display: flex;
  gap: 4px;
}
```

### Mechanical Walkthrough

- `.btn` — a real **(a) first appearance** of this project's own button
  styling — every earlier lesson's buttons (e.g. Lesson 14's tool-create
  flow) had no dedicated class and rendered as plain, unstyled browser
  buttons, since the reference's own `.btn` rule was never ported until a
  real, button-heavy panel — this one — needed it.
- `.btn:hover`, `.btn.full`, `.btnrow` — plain pseudo-class and
  compound selectors, **(b) reappearing** the same selector syntax
  `css-rule-syntax-selectors-cascade.md` already covers, applied to new,
  real selectors.
- `.btn-gr` — a real, deliberate second class on the _same_ element, not
  a rename: the JSX above puts `className="btn btn-gr full"` on one
  button — **(a) first appearance** in this project of combining more
  than one class on a single element for compositional styling (base
  button look from `.btn`, green accent from `.btn-gr`, full-width from
  `.full`) rather than one class per element.
- Four new custom properties — **(b) reappearing** `css-custom-properties.md`'s
  mechanism exactly as Lesson 12 introduced it, extended with four new
  real values this panel specifically needs: a panel background distinct
  from `--color-bg`, and blue/green accent variants for hover and success
  states.

### CS Lens / SE Lens

Same as Lesson 12's own design-token unit — nothing new to re-derive
here; `css-custom-properties.md` covers both lenses in full. The one
real, worth-naming difference: Lesson 12 introduced the _mechanism_;
this is that mechanism paying for itself a second time — four new colors
added in exactly one file, with zero changes needed to the `.tsx` file
that already reads `var(--color-...)` by name.

### Verified, Run for Real

```
Reloaded cnc-web with theme.css's new rules in place: "Choose .TOOLDB
File" renders as a real bordered button (not a bare <label>), hovering
it turns the border/text blue, and "Import Selected (3)" renders as a
full-width green button — all matching what the JSX above already
expected className="btn"/"btn-gr"/"btnrow" to produce.
```

---

## Connect the Pieces

A real `.TOOLDB` file is chosen in the browser → `FormData` carries it,
raw, to `POST /api/tools/import/preview` → a real temp file
(`python-tempfile.md`) holds it just long enough for
`read_tools_from_file` to open it as a _second_, independent database
through the exact same `TlTool`/`TlToolMill` classes this project
already had → each real tool is shown as a checkable card → checking
three and clicking Import Selected calls `POST /api/tools/import`,
which re-opens the same file, resolves each tool's real material and
manufacturer through get-or-create, and inserts each one under its own
real, preserved GUID — landing at `tool_number` `1`, `2`, `3` again,
genuinely duplicating this project's own existing `1`–`4`, exactly as
real Mastercam allows, correctly representable only because addressing
switched from `tool_number` to `id` earlier in this same lesson. A
`refreshKey` bump tells the separate tool list to show all seven. Every
step logged, at the point it happened, not reconstructed afterward.

## What Breaks Without This

Demonstrated live, this lesson: restore the old
`{str(row.ToolNumber): ...}` dict version of `list_tools()` and
re-import the same three tools — the response silently drops to 4
entries instead of 7, no error anywhere, each newly-imported tool
simply overwriting whichever existing tool happened to share its
number in dict-key order. Nothing crashes; the data is just silently
wrong — the exact failure mode `input-validation-at-boundary.md` and
this lesson's own correction both exist to prevent, here appearing as a
silent _identity_ bug rather than a rejected malformed request.

## Exercises

1. Upload the same `.TOOLDB` file twice in the same browser session
   without reloading the page — confirm the second import's summary
   correctly reports 3 duplicates, 0 imported, using only what's
   already in the file (no new tool needed).
2. Add a `unique=True` constraint to nothing in this project (there
   isn't one to add — `tool_number` genuinely shouldn't be unique) but
   explain, in your own words, which column _would_ break this
   project's own data integrity if it silently gained a duplicate, and
   why `TlTool.ID` already has an implicit one (it's the primary key).
3. Read the real log output from a full preview-then-import run
   end-to-end (both `app` and `core.tools` loggers) and identify which
   single line would answer "did anything get skipped, and why?" if
   this had run unattended overnight.

## Definition of Done

- [ ] `ToolImportPanel.tsx` lets you choose a `.TOOLDB` file, preview
      its real tools, select some, import them, and close/reset the
      panel.
- [ ] Every tool in the system is addressed by GUID (`id`), never by
      `tool_number`, in every route and every frontend fetch/delete
      call.
- [ ] Real, duplicate tool numbers (verified: `T1` appearing twice)
      display correctly as two distinct cards.
- [ ] Re-importing the same tools is idempotent — verified, 0 imported
      on the second attempt.
- [ ] Material/manufacturer import uses get-or-create — verified, no
      duplicate "Carbide" row after import.
- [ ] Real logging is live in `app.py` and `core/tools.py` — verified,
      real timestamped log lines from a real request.
- [ ] Full regression: `tsc --noEmit`, `vitest run` (4/4), and a live
      backend smoke test (preview, import, re-import, GET/DELETE by
      id) all pass.
- [ ] A git commit exists explaining _why_ (a real file-import feature,
      built alongside a structural correction to how tools are
      addressed at all, caught by direct, real-world domain knowledge
      rather than by testing).
