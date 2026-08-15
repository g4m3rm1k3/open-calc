# Lesson 20: The Checkout API and UI

**What you will build:** a real, complete, end-to-end checkout
experience — the file tree (Lesson 15) now showing real, live lock
status per file, and a real, working "Check Out" button wired to
Lesson 19's own now-safe `checkout_file`.

**What you need to know first:** [Lesson 19](lesson-19-atomic-locking-with-a-real-transaction.md)
— the real, safe `checkout_file` this lesson's own endpoint calls.
[Lesson 16](lesson-16-error-handling-and-loading-states.md) — the real,
four-state pattern this lesson's own frontend reuses directly.
`sqlite-mastery`'s own [Lesson 09](../sqlite-mastery/lesson-09-inner-and-left-joins.md)
— `LEFT JOIN`, reused directly to show lock status without excluding
unlocked files.

**Terms introduced in this lesson:** none new.

**Objects and methods used:** none new.

---

## Concept Unit: Real Lock Status, Joined Into the File List

### The Problem

`GET /api/files` (Lesson 15) lists real files. It says nothing about
whether any of them are currently, really checked out.

### Introduce the Concept in Isolation

```python
# src/data/files_repository.py (extended)
def list_files_with_lock_status(conn):
    return conn.execute("""
        SELECT files.id, files.path, files.name, files.file_type,
               users.username AS locked_by
        FROM files
        LEFT JOIN locks ON locks.file_id = files.id
        LEFT JOIN users ON users.id = locks.user_id
        ORDER BY files.path
    """).fetchall()
```

```
$ curl http://127.0.0.1:8000/api/files
[{"id":1,"path":"bracket-notes.txt","name":"bracket-notes.txt","file_type":"txt","locked_by":"alice"},
 {"id":2,"path":"housing.txt","name":"housing.txt","file_type":"txt","locked_by":null}]
```

`LEFT JOIN`, reused directly, exactly as `sqlite-mastery` Lesson 09
already proved — every real file appears, whether or not a real lock
exists for it, with `locked_by` correctly `null` for one and a real
username for the other.

### Discard

Nothing throwaway — `list_files_with_lock_status` replaces `list_files`
as this project's own real, permanent `GET /api/files` query.

### Mechanical Walkthrough

- `LEFT JOIN locks ON locks.file_id = files.id LEFT JOIN users ON
  users.id = locks.user_id` — **(b) hard concept reappearing**,
  `sqlite-mastery` Lesson 09's own real shape, unchanged.

### CS Lens

Deriving `locked_by` from a real, live join, rather than storing a
real, redundant "is this checked out" flag directly on `files`, is the
identical real principle `sqlite-mastery`'s own Lesson 47 already
proved the hard way: a real, computed value can never drift out of
sync with the real, underlying `locks` table, because it's never
stored independently at all.

### SE Lens

The real, deliberate reason `locks` remains the one, real, single
source of truth for lock status, rather than a real, cached column on
`files`: this project's own real, existing app already has a real
history of exactly this kind of drift — the identical, honest lesson
this project's own README already commits to avoiding from its very
first migration.

## Concept Unit: A Real, Working "Check Out" Button

### The Problem

Lock status is now real and visible. Nothing yet lets a real user
actually act on it.

### Introduce the Concept in Isolation

```python
# src/api/checkout.py (updated)
@router.post("/api/files/{file_id}/checkout")
def checkout(file_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    result = checkout_file(file_id, current_user["id"], checkout_atomic=partial(checkout_atomic, db))
    if not result.success:
        raise HTTPException(status_code=409, detail=result.error)
    return {"file_id": file_id, "checked_out_by": current_user["username"]}
```

```js
// static/app.js (extended)
function renderFileTree(files) {
    const container = document.getElementById("file-tree");
    if (files.length === 0) {
        container.textContent = "No files yet.";
        return;
    }
    container.innerHTML = "<ul>" + files.map((f) => {
        if (f.locked_by) {
            return `<li>${f.name} — checked out by ${f.locked_by}</li>`;
        }
        return `<li>${f.name} <button onclick="checkoutFile(${f.id})">Check Out</button></li>`;
    }).join("") + "</ul>";
}

async function checkoutFile(fileId) {
    try {
        const response = await fetch(`/api/files/${fileId}/checkout`, { method: "POST" });
        if (!response.ok) {
            const body = await response.json();
            throw new Error(body.detail || `Server responded with ${response.status}`);
        }
        await loadFileTree();
    } catch (error) {
        alert(`Could not check out file: ${error.message}`);
    }
}
```

A real, complete, working real flow: Alice sees `housing.txt` with a
real, live "Check Out" button, clicks it, and the real file tree
refreshes — via `loadFileTree()`, Lesson 16's own already-established
pattern — now showing "checked out by alice," with the real button
gone, replaced by real, honest status text.

### Discard

Nothing throwaway — every real piece here is permanent.

### Mechanical Walkthrough

- `fetch(\`/api/files/${fileId}/checkout\`, { method: "POST" })` —
  **(b) hard concept reappearing** for `fetch`/`response.ok` (Lesson
  16); a real, explicit `method: "POST"` option — **(a) first
  appearance** of this specific, real `fetch` configuration object key,
  needed since `fetch`'s own real default method is `GET`.
- `await loadFileTree();` inside `checkoutFile` — **(b) hard concept
  reappearing**, Lesson 16's own real function, called here to refresh
  the real UI after a real, successful state change — the identical
  real principle `sqlite-mastery` Lesson 41's own `ajax.reload()`
  already established.

### CS Lens

Calling `loadFileTree()` again after a real, successful checkout,
rather than manually patching the one, real, affected list item in
place, is the identical real principle `sqlite-mastery` Lesson 41
already chose deliberately: re-deriving the real, displayed view from
the real, current server state is simpler, and structurally cannot
drift out of sync, at this project's own real, current scale.

## Connect the pieces

`list_files_with_lock_status`, a real `LEFT JOIN`, gave every real file
a real, live, correctly-derived lock status. A real "Check Out" button,
wired to Lesson 19's own now-safe `checkout_file`, and Lesson 16's own
already-established `loadFileTree()` refresh pattern, closed the real,
complete, end-to-end loop: a real click, a real, safe backend decision,
and a real, immediately updated, honest UI.

## What breaks without this

Not applicable in the usual, negative sense — this lesson's own real
proof runs the other direction: click "Check Out" twice, in real, rapid
succession, on the identical file, before the first real request's own
`loadFileTree()` refresh has even completed:

```
$ (curl -s -X POST http://127.0.0.1:8000/api/files/2/checkout --cookie "session_token=<alice>" &
   curl -s -X POST http://127.0.0.1:8000/api/files/2/checkout --cookie "session_token=<alice>" &
   wait)
{"file_id":2,"checked_out_by":"alice"}
{"detail":"file is already checked out"}
```

A real, clean, correct `409` for the real, accidental second click —
not a crash, and not a real, duplicate lock. This is direct, provable
proof of a real, important architectural fact worth stating plainly:
this project's own real safety comes entirely from Lesson 19's own
real, atomic, server-side transaction — never from the client-side
button being disabled, debounced, or careful in any way. A real client
can misbehave in any real number of ways; the real backend, and only
the real backend, is what actually enforces this project's own central
promise.

## Exercises

1. Add a real "Check In" button, calling a real, new `POST /api/files/
   {file_id}/checkin` endpoint — following this lesson's own exact,
   real pattern — using the `checkin_atomic`/`checkin_file` pair you
   built as Lesson 17 and Lesson 19's own respective exercises.
2. Confirm, directly, that a real, existing lock's own `locked_by`
   correctly disappears from the file tree once a real check-in
   succeeds, using this lesson's own real `loadFileTree()` refresh
   pattern.

## Definition of Done

- [ ] You joined real lock status into `GET /api/files` using `LEFT
      JOIN`.
- [ ] You built a real, working "Check Out" button, end to end.
- [ ] You confirmed a real, rapid double-click is handled safely by the
      real backend, not the client.
- [ ] You completed both exercises.

## Next

[Lesson 21 — WIP Snapshots](lesson-21-wip-snapshots.md) gives a real,
checked-out file a real way to save progress without it ever becoming
a real, permanent version.
