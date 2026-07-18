# Lesson 7: Don't Build What Already Exists, Correctly

## What you will build

Every save now creates a real, permanent version. The feature is "see
what changed and when"; the actual subject is a decision *not* to build
a versioning system for this project, and instead correctly wire up a
tool that already solves this problem better than a first attempt at one
ever would — plus a real bug, caught and fixed during verification, about
what "a path" actually means once two different operating systems are
both in the picture.

## What you need to know first

`Lesson 5`/`Lesson 6` — `subprocess.run`, the traversal/existence checks
reused unchanged again. `Lesson 1 - The Skeleton.md`'s git basics (init,
add, commit) — not retaught here, only extended.

---

## Concept Unit: two different histories that must never tangle

### The Problem

This project's own source code (`main.py`, `index.html`, these lesson
files) has been tracked in this workspace's git repo since Lesson 1.
`content/` — the folder the editor actually opens and edits — has been
sitting *inside* that same repo the whole time, as ordinary tracked
files. The moment saves start creating real commits, those commits would
land in the *same* history as this project's own source, permanently
tangling "a change to the code editor" with "a change the editor's user
made to their own file" — indistinguishable from each other forever
afterward.

### Project Change

- **Files affected** — `.gitignore` (existing file, modified);
  `backend/content/` (existing, tracked files — untracked from the outer
  repo); a brand-new, independent `.git` directory created inside
  `backend/content/`.
- **Change type** — configure, remove (from the outer repo's tracking),
  add (a new, separate repo).
- **Dependencies** — the outer repo already existing (Lesson 1).

### The Commands — type these

```powershell
git rm -r --cached backend/content
```

Add one line to `.gitignore`:

```
backend/content/
```

Commit that change to the outer repo, the same way every other lesson
in this curriculum has:

```powershell
git add .gitignore
git commit -m "Untrack backend/content/ - it gets its own independent history"
```

Then, inside `content/` specifically, start a second repo from scratch:

```powershell
cd backend/content
git init
git add -A
git commit -m "Initial commit: sample content folder"
```

### Mechanical Walkthrough

`git rm -r --cached backend/content` removes every file under
`backend/content/` from the outer repo's *tracking* — `--cached` is the
part that matters: without it, `git rm` deletes the actual files from
disk too, which is not what's wanted here; the files stay exactly where
they are, only git stops watching them. Adding `backend/content/` to
`.gitignore` tells the outer repo to never re-track anything under it
again, even automatically. `cd backend/content && git init` creates a
*second*, entirely separate `.git` directory, nested inside the first
repo's working tree but functioning as its own independent repository —
its own commit history, starting from its own first commit, with no
relationship to the outer repo's history at all.

### SE Lens — the same separation a real IDE already has

Opening a project folder in VS Code, IntelliJ, or any real editor never
tangles that project's git history with the editor application's own
source code history — they're maintained by completely different teams,
on completely different release schedules, and have nothing to do with
each other except that one happens to display the other. This project
now has the same shape: this repo's history is "how the editor was
built, lesson by lesson" (exactly what every commit in this curriculum
already *is*); `content/`'s new, separate history is "what the editor's
user actually did with their files" — and nothing forces those two
timelines to agree with each other, because they're not the same thing.

---

## Concept Unit: reusing a tool instead of inventing one

### The Problem

"Remember every version of a file" is a solved problem, solved
extremely well, by software specifically built for exactly that —
and this project already depends on it (every commit in this whole
curriculum has been made with it).

### SE Lens — the alternative, named honestly

A bespoke version-history feature could store, per save, a full copy of
the old content in a database row, or a computed diff against the
previous version, in a schema designed from scratch for this project.
That's real, buildable work — and it would need to solve, from zero,
problems git has already solved for decades: efficient storage of many
versions of mostly-similar text, generating a diff between any two
versions on demand, associating a message with each change, listing
history in order. Reaching for `git` itself instead isn't a shortcut
avoiding real engineering — recognizing when a well-solved problem
already has a well-built solution, and using it instead of re-deriving
it, *is* the engineering decision. `subprocess`, already taught in
Lesson 5, is what makes this possible: git is just another external
program, invoked exactly the same way `python` and `rustc` already were.

---

## Concept Unit: turning a save into a permanent version

### The Problem

Writing a file's new content to disk (`write_file`, since Lesson 3)
currently leaves no trace of what it replaced — the previous version is
simply gone the moment the new one is written.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — new function `commit_change`, added directly above
  `write_file`; two new lines added inside `write_file` itself, after
  `write_text`.
- **Dependencies** — the independent `content/` git repo from the first
  unit.

### The New Code — type this

```python
def commit_change(relative_path: str, message: str) -> None:
    subprocess.run(["git", "add", relative_path], cwd=CONTENT_DIR, capture_output=True, text=True)
    subprocess.run(["git", "commit", "-m", message], cwd=CONTENT_DIR, capture_output=True, text=True)
```

And inside `write_file` itself, calling it:

```python
relative_path = target_file.relative_to(CONTENT_DIR)
commit_change(relative_path, f"Edit {relative_path}")
```

### The Updated Project — where this lives

Now see it in place:

```python
def commit_change(relative_path: str, message: str) -> None:                                    # ← new
    subprocess.run(["git", "add", relative_path], cwd=CONTENT_DIR, capture_output=True, text=True)  # ← new
    subprocess.run(["git", "commit", "-m", message], cwd=CONTENT_DIR, capture_output=True, text=True)  # ← new


@app.put("/file")
def write_file(path: str, edit: FileEdit):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    target_file.write_text(edit.content, encoding="utf-8")

    relative_path = target_file.relative_to(CONTENT_DIR)   # ← new
    commit_change(relative_path, f"Edit {relative_path}")  # ← new

    return {"path": path, "saved": True}
```

`write_file` does exactly what it already did — validate, then write —
and now additionally records that write as a real commit before
returning. Nothing about the traversal or existence checks changed. This
is, in fact, the exact code first typed and run for this unit — including
a bug neither obvious nor caught yet, found only a couple of units from
now once its output can actually be read closely.

### Mechanical Walkthrough

`subprocess.run(["git", "add", relative_path], cwd=CONTENT_DIR, ...)`
runs `git add` the same way a terminal would, but with `cwd=CONTENT_DIR`
telling `subprocess` to run it *inside* `content/`'s own repo — critical,
since running it from anywhere else would either fail or, worse, operate
on the wrong repository entirely. `git commit -m message` records
everything just `add`ed as a new, permanent commit. `target_file.relative_to(CONTENT_DIR)`
converts the absolute resolved path back into one relative to the
content root — the form `git` itself expects, and the same relative form
already used in every response this API sends back to the frontend. It
returns a `Path` object, not a string — `f"Edit {relative_path}"` converts
it to one implicitly, the same way any value dropped into an f-string's
`{}` gets converted; exactly how that conversion happens is where this
lesson's real bug turns out to be hiding.

### CS Lens — "record every version, in order" is what a commit is

A git commit is, at its core, a snapshot of the tracked files at one
point in time, chained to the commit before it — the exact data
structure "remember every version, in order, and let me get back to any
of them" needs. `commit_change` is not building that structure; it's
triggering the one that already exists to record one more entry.

---

## Concept Unit: listing what happened to a file over time

### The Problem

Recording history is only useful if something can read it back —
nothing yet shows what versions of a file actually exist.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add, a new `@app.get("/history")` route.
- **Location** — added directly after `write_file`.
- **Dependencies** — `commit_change` having actually run at least once.

### The New Code — type this

```python
@app.get("/history")
def file_history(path: str = ""):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    relative_path = target_file.relative_to(CONTENT_DIR).as_posix()
    result = subprocess.run(
        ["git", "log", "--format=%H|%aI|%s", "--", relative_path],
        cwd=CONTENT_DIR,
        capture_output=True,
        text=True,
    )

    commits = []
    for line in result.stdout.strip().splitlines():
        commit_hash, timestamp, message = line.split("|", 2)
        commits.append({"hash": commit_hash, "timestamp": timestamp, "message": message})

    return {"path": path, "commits": commits}
```

### The Updated Project — where this lives

This is a complete, new, standalone route — there's no existing
structure to place it inside; it sits after `write_file`, using the same
traversal and existence checks every file-based route in this project
already shares.

### Mechanical Walkthrough

`git log --format=%H|%aI|%s -- relative_path` asks git for the commit
history of *one specific file*, not the whole repo. `--format=%H|%aI|%s`
is git's own template syntax — `%H` the full commit hash, `%aI` the
author date in a machine-parseable format, `%s` the commit's subject
line — joined with a literal `|` chosen specifically because it's a
character extremely unlikely to appear inside a real commit message
itself, unlike a comma or space. `result.stdout.strip().splitlines()`
splits the output into one string per commit, oldest formatting quirks
(a trailing blank line) removed by `.strip()` first. `line.split("|", 2)`
splits each line on `|`, but caps it at two splits — three pieces
total — so a commit message that itself happens to contain a `|`
character doesn't get incorrectly split into more than three pieces.
`commit_hash, timestamp, message = line.split("|", 2)` is this project's
first **unpacking assignment** — `.split(...)` returns a list of exactly
three strings here, and naming three variables, comma-separated, on the
left of a single `=` assigns each one positionally in one statement,
instead of indexing into the list by hand three separate times
(`result[0]`, `result[1]`, `result[2]`) — it fails loudly with a
`ValueError` if the list's length doesn't match the number of names,
which is exactly why capping `maxsplit` at `2` above matters: it
guarantees exactly three pieces, every time.

### SE Lens — the format string is a small, deliberate contract

Choosing `|` as a separator, and capping `.split()` at `maxsplit=2`, are
both small decisions defending against the same real failure: a commit
message containing the delimiter character breaking the parse. Neither
is bulletproof — a message containing `|` immediately followed by
another `|`-containing message could still misparse in principle — but
this is a real, working narrow solution for this project's own commit
messages, which are all generated by `commit_change` itself and
therefore fully under this project's control; it does not need to defend
against a delimiter collision it never actually produces.

### Run It

```
PUT /file?path=src/utils.py  (edit 1) → {"saved":true}
PUT /file?path=src/utils.py  (edit 2) → {"saved":true}
GET /history?path=src/utils.py →
  {"path":"src/utils.py","commits":[
    {"hash":"6a4be19...","timestamp":"2026-07-16T07:09:13-04:00","message":"Edit src/utils.py"},
    {"hash":"b740c62...","timestamp":"2026-07-16T07:08:10-04:00","message":"Edit src\\utils.py"},
    {"hash":"0b852f0...","timestamp":"2026-07-16T07:08:09-04:00","message":"Edit src\\utils.py"},
    {"hash":"7a0495a...","timestamp":"2026-07-16T07:07:21-04:00","message":"Initial commit: sample content folder"}
  ]}
```

Four real commits, newest first — two edits, made through this exact
route, on top of the initial commit from the first unit.

---

## Concept Unit: a path is spelled differently on different operating systems

### The Problem

Look closely at the real output just above: the two oldest edits say
`"Edit src\\utils.py"` — a backslash — while the newest says
`"Edit src/utils.py"` — a forward slash. Same file, same route,
different separator. This is a real bug, caught during verification, not
a hypothetical.

### What Actually Happened

The first version of `write_file`'s new lines read:

```python
relative_path = target_file.relative_to(CONTENT_DIR)
commit_change(relative_path, f"Edit {relative_path}")
```

`target_file.relative_to(CONTENT_DIR)` returns a `Path` object, and on
Windows, converting a `Path` to a string (which `f"Edit {relative_path}"`
does implicitly) uses `\`, the separator this operating system actually
uses — while every other path in this entire API, all the way back to
Lesson 2, has used `/` consistently, because that's the separator a URL
query string and this project's own frontend code both expect. Nothing
crashed. Nothing raised an error. The commit messages were simply
inconsistent with the rest of the system's convention — confirmed
directly in the real output above, not caught by any test, only by
actually reading what came back.

### The Fix

```python
relative_path = target_file.relative_to(CONTENT_DIR).as_posix()
```

### The Updated Project — where this lives

This replaces the one buggy line inside `write_file`, from the earlier
unit in this same lesson — everything else in the function, shown there
in full, is untouched:

```python
target_file.write_text(edit.content, encoding="utf-8")

relative_path = target_file.relative_to(CONTENT_DIR).as_posix()   # ← changed: added .as_posix()
commit_change(relative_path, f"Edit {relative_path}")

return {"path": path, "saved": True}
```

### Mechanical Walkthrough

`.as_posix()` is a `Path` method that returns the path as a string using
`/` specifically, regardless of which operating system produced the
`Path` object in the first place — the deliberate opposite of letting
the OS's own convention leak through implicitly.

### SE Lens — the actual lesson isn't the fix, it's where the bug hid

This is the same category of danger named back in Lesson 3's encoding
bug: a difference that produces no error, no crash, nothing a quick test
run would obviously catch — only a quiet inconsistency, sitting in output
a person has to actually read closely to notice. The fix here is one
method call. Finding it required treating "the code ran without error"
as a different, weaker claim than "the code is correct" — and actually
reading the real output character by character instead of just checking
the status code was `200`.

---

## Connect the pieces

Editing `src/utils.py` twice in a row through the running app: each
`PUT /file` writes the new content to disk, then `commit_change` runs
`git add` and `git commit` inside `content/`'s own independent repo —
untangled from this project's own history since the very first unit.
`GET /history?path=src/utils.py` afterward runs `git log` scoped to that
one file, parses the pipe-delimited output back into structured JSON,
and returns every version ever saved through this app, oldest commit
(the very first `git init` in this lesson) included.

## What breaks without this

Already demonstrated concretely: without `.as_posix()`, commit messages
generated on Windows use backslashes, inconsistent with the forward-slash
convention this entire API has followed since Lesson 2 — real, verified
output above shows exactly that inconsistency, from two commits made
before the fix, sitting right next to the corrected one made after.

## Exercises

1. Edit a file three times through the running app and confirm
   `/history` shows exactly three new commits, oldest to newest reversed.
2. Run `git log` directly inside `content/` from a terminal and confirm
   it matches what `/history` returns — the API isn't doing anything
   `git` itself couldn't already tell you.
3. Deliberately put a `|` character in a file's content (not the commit
   message) and confirm `/history` still parses correctly — then predict,
   without testing it, what would happen if `commit_change`'s `message`
   argument itself ever contained `|`.

## Definition of done

- [ ] You've verified `content/`'s git history is genuinely separate from
      this project's own, by running `git log` in both places
- [ ] You've made real edits through the app and confirmed `/history`
      reflects them accurately
- [ ] You can explain why this project uses `git` instead of building its
      own version-storage system
- [ ] You can explain what `.as_posix()` fixed, and why the bug produced
      no error or crash
- [ ] `git commit` this lesson's code, in the *outer* repo, with a
      message explaining why
