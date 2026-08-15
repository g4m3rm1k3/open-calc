# Lesson 23: Version History

**What you will build:** a real, working way to list every real,
permanent version of a file, and to retrieve any one of them, exactly
as it existed at that real, past commit — nothing this project ever
commits is truly gone.

**What you need to know first:** [Lesson 22](lesson-22-check-in-a-real-gitpython-commit.md)
— the real `versions` table this lesson reads from, and the real
commits behind each of its own rows.

**Terms introduced in this lesson:** none new — **version** already has
full, real treatment in this project's own README.

**Objects and methods used:**

**`Repo.git.show()`**
- *What it is:* GitPython's own real, direct proxy (Lesson 13) for the
  real, standard `git show` command.
- *Implementation:* `repo.git.show(f"{commit_sha}:{path}")` returns a
  real file's own exact content, exactly as it existed at that specific,
  real, past commit — without checking anything out into the real,
  live working directory at all.
- *Its use:* retrieving any real, past version's own real content, on
  demand.

---

## Concept Unit: Listing Every Real, Past Version

### The Problem

`versions` (Lesson 22) already holds a real, permanent row per commit.
Nothing yet lets a real user see them.

### Introduce the Concept in Isolation

```python
# src/data/versions_repository.py (extended)
def list_versions(conn, file_id: int):
    return conn.execute(
        """
        SELECT versions.*, users.username
        FROM versions
        JOIN users ON users.id = versions.user_id
        WHERE file_id = ?
        ORDER BY created_at DESC
        """,
        (file_id,),
    ).fetchall()
```

```python
@router.get("/api/files/{file_id}/versions")
def get_versions(file_id: int, db=Depends(get_db)):
    versions = list_versions(db, file_id)
    return [dict(v) for v in versions]
```

```
$ curl http://127.0.0.1:8000/api/files/2/versions
[{"id":3,"file_id":2,"commit_hash":"d4e5f6a...","message":"Confirm bracket tolerances","username":"alice","created_at":"..."}]
```

A real, ordinary `JOIN` (`sqlite-mastery` Lesson 09, unchanged), listing
every real, permanent version of one, specific file, newest first.

### Discard

Nothing throwaway — every real piece here is permanent.

### Mechanical Walkthrough

- `JOIN users ON users.id = versions.user_id` — **(b) hard concept
  reappearing**, `sqlite-mastery` Lesson 09's own real shape.
- `ORDER BY created_at DESC` — **(b) hard concept reappearing**,
  `sqlite-mastery` Lesson 04's own real clause.

### CS Lens

Not applicable beyond already-cited, reused concepts — this unit
combines two, real, already-explained ideas, introducing nothing new
in isolation.

### SE Lens

The real, deliberate reason `versions` joins `users` here, rather than
storing a real, redundant `username` column directly on `versions`
itself: the identical, real, already-proven principle Lesson 20 already
applied to lock status — a real, derived value, read fresh, can never
drift out of sync with a real, renamed or changed user account.

## Concept Unit: Retrieving a Real, Past Version's Content

### The Problem

Knowing a real version exists is not the same as being able to read
what it actually contained.

### Introduce the Concept in Isolation

```python
# src/data/git_repo.py (extended)
def get_file_content_at_commit(repo: Repo, commit_sha: str, path: str) -> str:
    return repo.git.show(f"{commit_sha}:{path}")
```

```python
@router.get("/api/files/{file_id}/versions/{version_id}/content")
def get_version_content(file_id: int, version_id: int, db=Depends(get_db)):
    version = get_version_by_id(db, version_id)
    if version is None or version["file_id"] != file_id:
        raise HTTPException(status_code=404, detail="version not found")
    repo = get_repo()
    file = get_file_by_id(db, file_id)
    content = get_file_content_at_commit(repo, version["commit_hash"], file["path"])
    return {"content": content}
```

```
$ curl http://127.0.0.1:8000/api/files/2/versions/1/content
{"content":"Tolerance updated to +/-0.005."}
```

Alice's own, real, original content — the exact, real state of this
file the moment that specific, real, past commit was made — retrieved
directly, without ever touching or altering the real, live, current
file at all.

### Discard

Nothing throwaway — every real piece here is permanent.

### Mechanical Walkthrough

- `repo.git.show(f"{commit_sha}:{path}")` — **(a) first appearance**,
  full treatment above.
- `if version is None or version["file_id"] != file_id:` — **(a) first
  appearance** of this specific, real, deliberate cross-check: not
  merely "does this version ID exist," but "does it genuinely belong
  to the file named in this exact request" — a real, easy-to-miss
  mistake this lesson closes on purpose, before it's ever made.

### CS Lens

The real, deliberate `version["file_id"] != file_id` check is a direct,
concrete instance of validating a real, compound assumption explicitly
— the identical underlying discipline `sqlite-mastery`'s own Lesson 45
already proved directly, when a real, assumed join (`tbl_person` to
`tbl_fine`, skipping `tbl_loan`) turned out to not structurally exist
at all; here, the real, structural relationship does exist, but nothing
enforces a real caller can't request a genuinely mismatched pair.

### SE Lens

The real, honest reason this cross-check matters, concretely: without
it, a real, valid `version_id` belonging to an entirely different real
file would still return real, genuine content — technically correct
git history, served under the real, wrong file's own URL, a real,
confusing, and genuinely avoidable mistake.

## Connect the pieces

`list_versions`, a real, ordinary join, gave every real, past version
of a file a real, visible list. `get_file_content_at_commit`, using
GitPython's own real `git show` proxy, then retrieved any one of them
exactly as it existed at that real, specific commit — with a real,
deliberate cross-check confirming the requested version genuinely
belongs to the requested file, closing a real, easy mistake before it
could ever occur.

## What breaks without this

Request a real version ID that genuinely exists, but belongs to a
different, real file than the one named in the URL:

```
$ curl -i http://127.0.0.1:8000/api/files/999/versions/1/content
HTTP/1.1 404 Not Found

{"detail":"version not found"}
```

A real, honest `404` — not a real, silent, cross-file content leak.
Removing this lesson's own real `version["file_id"] != file_id` check
entirely would instead return version `1`'s own real, genuine content
under file `999`'s own URL — real, correct git data, served for the
real, wrong, unrelated file, exactly the mistake this lesson's own
cross-check exists to prevent.

## Exercises

1. Request a real version's content for a real `commit_sha` that
   genuinely predates the file's own real creation at that path, and
   read the real, resulting git error directly — research what `git
   show` itself reports for a real, nonexistent path at a given commit.
2. Add a real, small UI panel listing a file's own version history,
   with a real, clickable link per version calling this lesson's own
   real content endpoint and displaying the result.

## Definition of Done

- [ ] You listed every real, permanent version of a file, newest first.
- [ ] You retrieved a real, past version's own exact content using
      `repo.git.show`.
- [ ] You caused the real, honest `404` from a mismatched
      file/version pair, and understand exactly what it prevents.
- [ ] You completed both exercises.

## Next

[Lesson 24 — Phase 4 Review: the Bug, Revisited](lesson-24-phase-4-review-the-bug-revisited.md)
closes this phase by reproducing Lesson 12's own exact, original bug
one final time — now structurally impossible.
