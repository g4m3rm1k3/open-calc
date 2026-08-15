# Lesson 28: Notifications

**What you will build:** a real way to ask Forge to tell you the moment
a currently checked-out file becomes available again — a real "watch"
request, resolved automatically the instant a real check-in releases
the lock, delivered through a real, simple polling endpoint.

**What you need to know first:** [Lesson 22](lesson-22-check-in-a-real-gitpython-commit.md)
— `release_lock`, extended directly here. [Lesson 27](lesson-27-the-audit-log.md)
— the real, bundled-transaction discipline this lesson reuses once
more, for a real, third time.

**Terms introduced in this lesson:** none new.

**Objects and methods used:** none new.

---

## Concept Unit: A Real Watch, Resolved on Real Check-In

### The Problem

Bob wants `bracket-notes.txt`, currently held by Alice. Nothing lets
him ask Forge to tell him the moment it's genuinely free, rather than
checking back by hand.

### Introduce the Concept in Isolation

```sql
-- real, new migrations
CREATE TABLE watch_requests (
    id INTEGER PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES files(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
)

CREATE TABLE notifications (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    read_flag INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```

`release_lock` (Lesson 22), extended following Lesson 27's own,
already-established, real discipline directly — bundling the real
release, the real notification, and clearing the real watch requests
into one, single, real, atomic transaction:

```python
def release_lock_and_notify(conn, file_id: int, file_name: str) -> None:
    conn.execute("BEGIN IMMEDIATE")
    try:
        conn.execute("DELETE FROM locks WHERE file_id = ?", (file_id,))
        watchers = conn.execute(
            "SELECT user_id FROM watch_requests WHERE file_id = ?", (file_id,)
        ).fetchall()
        for row in watchers:
            conn.execute(
                "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
                (row["user_id"], f"{file_name} is now available."),
            )
        conn.execute("DELETE FROM watch_requests WHERE file_id = ?", (file_id,))
        conn.commit()
    except Exception:
        conn.rollback()
        raise
```

```
$ curl -X POST --cookie "session_token=<bob>" http://127.0.0.1:8000/api/files/2/watch
{"file_id":2,"watching":true}
$ curl -X POST --cookie "session_token=<alice>" http://127.0.0.1:8000/api/files/2/checkin -d '...'
$ sqlite3 forge.db "SELECT * FROM notifications WHERE user_id = 2;"
1|2|bracket-notes.txt is now available.|0|2026-01-15 09:10:00
```

A real, permanent notification, created automatically, for Bob
specifically — the moment Alice's real check-in genuinely released the
lock, with no real, separate step required from either of them.

### Discard

Nothing throwaway — every real piece here is permanent.

### Mechanical Walkthrough

Every real line here — **(b) hard concept reappearing**: `BEGIN
IMMEDIATE`/`commit`/`rollback` (Lesson 19), the real, bundled-write
pattern (Lesson 27), and ordinary, real `INSERT`/`DELETE`/`SELECT`, all
unchanged; applied here to a real, third, new, related pair of tables.

### CS Lens

Not applicable beyond already-cited, reused concepts.

### SE Lens

The real, deliberate reason this lesson reuses Lesson 27's own,
already-established, bundled-transaction discipline a real, third
time, rather than treating it as a one-off: a real, general rule,
proven once, correctly, and applied consistently, is exactly the real
kind of discipline this project's own README names directly as the
opposite of its own, real, original failure mode.

## Concept Unit: Delivering a Real Notification

### The Problem

A real, permanent row in `notifications` is useless until a real user
actually sees it.

### Introduce the Concept in Isolation

```python
@router.get("/api/notifications")
def get_notifications(db=Depends(get_db), current_user=Depends(get_current_user)):
    rows = db.execute(
        "SELECT * FROM notifications WHERE user_id = ? AND read_flag = 0 ORDER BY created_at DESC",
        (current_user["id"],),
    ).fetchall()
    return [dict(r) for r in rows]
```

```js
// static/app.js (extended)
setInterval(async () => {
    const response = await fetch("/api/notifications");
    if (response.ok) {
        const notifications = await response.json();
        notifications.forEach((n) => alert(n.message));
    }
}, 30000);
```

A real, deliberate, thirty-second polling interval — the identical
real technique `sqlite-mastery`'s own Lesson 59 already established —
checking for real, new notifications automatically, without requiring
Bob to do anything at all.

### Discard

Nothing throwaway — every real piece here is permanent.

### Mechanical Walkthrough

- `setInterval(async () => {...}, 30000)` — **(a) first appearance**
  of JavaScript's own real, standard `setInterval` function, running
  the given real, async function every real `30000` milliseconds,
  indefinitely.

### CS Lens

Reused directly from `sqlite-mastery` Lesson 59: real **polling** —
the simplest, most portable form of real, ongoing change detection,
checking on a real, fixed interval rather than requiring a real,
pushed, immediate notification mechanism.

### SE Lens

The real, honest, remaining gap this lesson leaves open: notifications
here are never marked read, and accumulate indefinitely — a real,
deliberate, honest exercise below, not solved silently here.

## Connect the pieces

`watch_requests` and `notifications`, added following Lesson 27's own,
already-proven, bundled-transaction discipline a real, third time, gave
Bob a real, working way to ask for a file and be told, automatically,
the moment it's genuinely free — delivered through a real, simple,
thirty-second poll, reusing `sqlite-mastery`'s own already-proven
pattern directly.

## What breaks without this

Not applicable beyond this arc's own already-established, real
discipline — every real risk this lesson could have introduced was
already closed by reusing Lesson 27's own, real, bundled-transaction
pattern directly, rather than a real, separate, sequential call.

## Exercises

1. Add a real `POST /api/notifications/{id}/read` endpoint, setting
   `read_flag = 1`, and update `get_notifications`'s own real query to
   only ever return unread ones — closing this lesson's own, honestly-
   named gap.
2. Add a real `DELETE /api/files/{file_id}/watch` endpoint, letting a
   real user cancel a watch request they no longer want.

## Definition of Done — Phase 5 Complete

- [ ] You built `watch_requests`/`notifications`, and confirmed a real
      check-in correctly notifies every real, waiting user.
- [ ] You built a real, polling-based delivery mechanism, confirmed
      directly in a browser.
- [ ] You completed both exercises.

## Phase 5 complete

Four lessons, and Forge now handles this project's own real,
day-to-day needs beyond the core checkout fix: configurable file types
with no code change required (Lesson 25), fast, forgiving search
(Lesson 26), a real, permanent audit trail (Lesson 27), and real,
automatic notifications (Lesson 28). [Phase 6](lesson-29-packaging-with-pyinstaller.md)
closes this series with the real, final steps: a real, standalone
distributable, and the real, deliberate migration this project's own
README has promised since its very first line.
