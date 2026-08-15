# Lesson 26: Search

**What you will build:** a real, working `GET /api/files/search`
endpoint, reusing `sqlite-mastery`'s own real FTS5 knowledge directly
— a real, always-synchronized full-text index over `files`, kept
correct automatically by real triggers.

**What you need to know first:** `sqlite-mastery`'s own [Lesson 16](../sqlite-mastery/lesson-16-sqlite-specific-tour.md)
(FTS5, first introduced) and [Lesson 53](../sqlite-mastery/lesson-53-full-text-search-in-the-real-app.md)
(FTS5 wired into a real, live app with real, permanent sync triggers) —
both reused directly, applied to this project's own real `files` table.

**Terms introduced in this lesson:** none new — FTS5, inverted indexes,
and real, trigger-based synchronization all already have full, real
treatment in `sqlite-mastery`.

**Objects and methods used:** none new.

---

## Concept Unit: A Real, Self-Synchronizing Search Index

### The Problem

`GET /api/files` (Lesson 20) lists every real file. Finding one
specific, real file by name, among what this project's own real,
existing application already proves can be a genuinely large real
number of them, needs something faster and more forgiving than reading
the whole real list by eye.

### Introduce the Concept in Isolation

The identical, real pattern `sqlite-mastery` Lesson 53 already proved
correct — a real FTS5 index, kept synchronized automatically:

```sql
CREATE VIRTUAL TABLE files_fts USING fts5(name, path);

CREATE TRIGGER trg_files_fts_insert AFTER INSERT ON files
BEGIN
    INSERT INTO files_fts (rowid, name, path) VALUES (new.id, new.name, new.path);
END;

CREATE TRIGGER trg_files_fts_update AFTER UPDATE ON files
BEGIN
    UPDATE files_fts SET name = new.name, path = new.path WHERE rowid = new.id;
END;
```

```python
# src/data/files_repository.py (extended)
def search_files(conn, query: str):
    return conn.execute(
        """
        SELECT files.* FROM files
        JOIN files_fts ON files.id = files_fts.rowid
        WHERE files_fts MATCH ?
        ORDER BY rank
        """,
        (query + "*",),
    ).fetchall()
```

```python
@router.get("/api/files/search")
def search(q: str, db=Depends(get_db)):
    results = search_files(db, q)
    return [dict(row) for row in results]
```

```
$ curl "http://127.0.0.1:8000/api/files/search?q=brack"
[{"id":2,"path":"bracket-notes.txt","name":"bracket-notes.txt","file_type":"txt"}]
```

A real, deliberately incomplete search term — `brack` — correctly finds
`bracket-notes.txt`, the identical real, prefix-matching FTS5 behavior
`sqlite-mastery` Lesson 53 already proved directly; `rank`, FTS5's own
real, built-in relevance column, orders real, multiple matches by how
well each one genuinely matches, strongest first.

### Discard

Nothing throwaway — every real piece here is permanent.

### Mechanical Walkthrough

Every real line here is **(b) hard concept reappearing** — `sqlite-
mastery` Lessons 16 and 53 already gave `CREATE VIRTUAL TABLE ... USING
fts5`, the real sync-trigger pattern, `MATCH`, the real `*` prefix
operator, and `rank` full, first-appearance treatment; nothing here is
new syntax, only this project's own real, specific `files`/`files_fts`
application of it.

### CS Lens

Reused directly from `sqlite-mastery`: FTS5's own real **inverted
index**, the identical underlying structure behind every real,
general-purpose search engine, here applied at this project's own real,
much smaller scale.

### SE Lens

The real, deliberate reason this lesson doesn't re-derive FTS5 from
first principles: this project's own real search problem is exactly
the one `sqlite-mastery` already solved completely — re-teaching it
here would be real, wasted effort, and the identical real risk
`sqlite-mastery` Lesson 53 already named directly applies here
unchanged: a real, missing sync trigger means a real, newly-added file
becomes silently unfindable, exactly as proven there.

## Connect the pieces

`files_fts`, kept synchronized by two real triggers, gave this
project's own file tree a real, fast, forgiving search — proven
directly against a real, deliberately incomplete search term,
correctly finding its real, intended match, ordered by FTS5's own real,
built-in relevance ranking.

## What breaks without this

Reproduce the identical, real gap `sqlite-mastery` Lesson 53 already
proved directly — remove `trg_files_fts_insert`, add a real, new file,
and confirm it's genuinely unfindable through search despite existing
correctly in `files` itself, the identical, real, honest consequence of
a missing sync trigger, unchanged from its own original demonstration.

## Exercises

1. Reproduce this lesson's own real "missing trigger" failure yourself,
   then restore it and confirm search works correctly again.
2. Add a real `DELETE` sync trigger, following `sqlite-mastery`'s own
   exact pattern, so a real, removed file also disappears from search
   results.

## Definition of Done

- [ ] You built `files_fts` and its own real, permanent sync triggers.
- [ ] You confirmed a real, deliberately incomplete search term
      correctly finds its intended match.
- [ ] You completed both exercises.

## Next

[Lesson 27 — The Audit Log](lesson-27-the-audit-log.md) gives every
real, permission-sensitive action this project has built so far a
real, permanent, recorded trail.
