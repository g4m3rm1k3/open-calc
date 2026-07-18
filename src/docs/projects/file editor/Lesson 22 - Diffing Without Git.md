# Lesson 22: A Diff Between Two Things That Aren't Commits

## What you will build

`POST /diff-current` — comparing whatever is currently typed in the
editor, unsaved, against what's actually on disk — and a "Current Diff"
button showing the result. The feature completes the pairing this
project's history work has been building toward: Lesson 21 diffs two
*saved* versions; this lesson diffs the *unsaved* one against the last
saved one. The actual subject is recognizing when yesterday's tool
doesn't fit today's problem, even when the two problems look almost
identical.

## What you need to know first

`Lesson 21 - A Real Diff View.md` — `/diff`, unified diff format, and
specifically *why* it reused `git show` rather than writing a differ.
`Lesson 3`'s `FileEdit` model. `Lesson 9`'s pattern of a check that runs
against content the user hasn't saved yet.

---

## Concept Unit: a diff between two commits isn't enough

### The Problem

`/diff`, built last lesson, compares two real `git` commits — it needs
both sides of the comparison to already exist in `git`'s own history.
The text currently sitting in `#file-content`, before Save is clicked,
has no commit at all — it's not `git diff`'s problem to solve, because
`git` was never told about it, and won't be until `saveFile()` runs.

### What This Proves

Reusing `git show` for Lesson 21 was the right call specifically because
both sides being compared were already real commits. That reasoning
doesn't transfer here: one side of *this* comparison is a plain string
sitting in browser memory, not a file `git` has ever seen. The right
tool changed because the actual shape of the problem changed, even
though "show me a diff" sounds like the same request both times.

---

## Concept Unit: computing a diff without git

### The Problem

Something needs to compare two blocks of text — line by line — and
produce the same kind of readable output `git diff` already produces,
without either side needing to be a real commit.

### Concept Lab

```python
import difflib

saved = "def add(a, b):\n    return a + b\n"
current = "def add(a, b):\n    return a + b + 1\n"

diff = difflib.unified_diff(
    saved.splitlines(keepends=True),
    current.splitlines(keepends=True),
    fromfile="saved",
    tofile="current",
)
print("".join(diff))
```

Run it. Actual output:

```
--- saved
+++ current
@@ -1,2 +1,2 @@
 def add(a, b):
-    return a + b
+    return a + b + 1
```

Now the same two strings, identical:

```python
diff = difflib.unified_diff(
    saved.splitlines(keepends=True),
    saved.splitlines(keepends=True),
    fromfile="saved",
    tofile="current",
)
print(list(diff))
```

Run it. Actual output:

```
[]
```

### What This Proves

`difflib` is part of Python's own standard library — nothing to
install, the same category as `ast`, `re`, and `sqlite3` already used in
this project. `difflib.unified_diff(a, b, fromfile=..., tofile=...)`
takes two sequences of lines and produces a **generator** of the exact
same textual format `git diff`/`git show` already produce: `---`/`+++`
headers naming each side, `@@` markers giving line numbers, `-`/`+`
prefixed lines showing what changed, unprefixed context lines showing
what didn't. `.splitlines(keepends=True)` — new here — splits text into
a list of lines *keeping* each line's trailing `\n`, since
`difflib.unified_diff` needs the newlines present to reconstruct exact
output; ordinary `.splitlines()` (no argument), already used in Lesson
7, strips them. Identical input produces an empty result — no `git`
commit exists on either side, and none is needed for that answer to be
correct.

### Recognition

Also recognized in: `diff -u` on any Unix system (this exact format's
namesake), every `.patch`/`.diff` file ever emailed as a code change
before pull requests existed, GitHub's and GitLab's own pull-request
diff views, `git show` itself — this exact project's own Lesson 21 —
which produces the identical format from an entirely different
mechanism. Recognizing that `git`'s diff and `difflib`'s diff produce the
*same shape of answer* through *completely different implementations* is
worth more than either implementation alone: unified diff is a format,
not a `git`-specific feature.

### Discard

`saved` and `current`, the two throwaway strings, are deleted now — they
never appear in the project. The real route reads one real side from
disk and receives the other in a real request body.

---

## Concept Unit: reusing a shape that already fits

### The Problem

The new route needs a request body carrying the editor's current
content — a single required string field.

### What This Proves

`FileEdit`, already defined since Lesson 3 — `class FileEdit(BaseModel):
content: str` — is *exactly* that shape. Nothing about it is specific to
saving a file; it was named for the route it was first built alongside,
but its actual shape is simply "a request carrying one string field
called `content`," which this new route needs identically. Building a
second, near-duplicate model instead of reusing this one would be the
same mistake Lesson 7 named for version control itself: solving an
already-solved problem again, from scratch, for no reason beyond not
having looked for what already existed.

---

## Concept Unit: the /diff-current route

### The Problem

Something has to expose this comparison over the network, gated and
sandboxed exactly like every other file-touching route in this project.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add. `import difflib` added among the existing
  imports; a new `@app.post("/diff-current")` route, added after `/diff`.
- **Dependencies** — `difflib` (standard library), `FileEdit` (Lesson 3).

### The New Code — type this

```python
@app.post("/diff-current", dependencies=[Depends(require_auth)])
def diff_current(path: str, edit: FileEdit):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    saved_content = target_file.read_text(encoding="utf-8")

    diff_lines = difflib.unified_diff(
        saved_content.splitlines(keepends=True),
        edit.content.splitlines(keepends=True),
        fromfile="saved",
        tofile="current",
    )

    return {"path": path, "diff": "".join(diff_lines)}
```

### The Updated Project — where this lives

The import lands among the existing ones:

```python
import ast
import difflib   # ← new
import re
import secrets
import subprocess
```

`diff_current` itself is a complete, freestanding new function, added
after `diff_file` — nothing existing is modified, so there's no
enclosing structure to show it inside of; the block above is everything
there is to see.

### Mechanical Walkthrough

`def diff_current(path: str, edit: FileEdit):` reuses the exact
two-parameter shape `write_file` has used since Lesson 3 — `path` from
the query string, `edit` parsed from the JSON request body because its
type is a `BaseModel` subclass, not a plain type. The first two checks
reuse the identical traversal and existence pattern from every route in
this file. `saved_content = target_file.read_text(encoding="utf-8")`
reuses the pinned-encoding read from Lesson 3 — this is the "saved" side
of the comparison, read fresh from disk on every request, never cached.
`difflib.unified_diff(...)` reuses this lesson's own concept lab exactly,
with `saved_content` as one side and `edit.content` — whatever the
frontend actually sent, unsaved or not — as the other.
`"".join(diff_lines)` reuses `.join()` from Lesson 2's Python side,
flattening the generator's individual lines back into one string for the
JSON response.

### Run It

```
POST /diff-current?path=src/utils.py  body={"content":"def add(a, b):\n    return a + b + 99\n"} →
{"path":"src/utils.py","diff":"--- saved\n+++ current\n@@ -1,2 +1,2 @@\n def add(a, b):\n-    return a + b\n+    return a + b + 99\n"}

POST /diff-current?path=src/utils.py  body={"content":"<the file's real, unchanged saved content>"} →
{"path":"src/utils.py","diff":""}
```

Both confirmed directly against the real running server — a real edit
produces a real diff, and sending the file's own unchanged content back
produces an empty one.

---

## Concept Unit: a Current Diff button

### The Problem

Something on the frontend needs to send the textarea's live value —
whatever's typed, saved or not — to the new route, and show what comes
back.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `diffCurrent` function, placed directly
  after `diffCommit`; a new button and panel.
- **Dependencies** — the `/diff-current` route above.

### The New Code — type this

```javascript
function diffCurrent() {
    if (activeTabPath === null) {
        return;
    }

    const outputElement = document.getElementById("current-diff-output");
    const content = document.getElementById("file-content").value;
    outputElement.textContent = "Comparing...";

    authenticatedFetch("http://127.0.0.1:8000/diff-current?path=" + encodeURIComponent(activeTabPath), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content }),
    })
        .then((response) => response.json())
        .then((data) => {
            outputElement.textContent = data.diff || "No unsaved changes.";
        })
        .catch((error) => {
            outputElement.textContent = "Could not compare.";
        });
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function, placed directly after
`diffCommit` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see. The button and panel it targets:

```html
<button id="history-button">History</button>
<button id="current-diff-button">Current Diff</button>   <!-- ← new -->
<span id="save-status"></span>
```

And the panel it writes into, sitting after `#diff-output`:

```html
<div id="diff-output" class="output-panel"></div>
<div id="current-diff-output" class="output-panel"></div>   <!-- ← new -->
```

`#current-diff-output` is this project's *seventh* element using
`.output-panel`. And the listener, alongside the existing ones:

```javascript
document.getElementById("history-button").addEventListener("click", historyFile);
document.getElementById("current-diff-button").addEventListener("click", diffCurrent);   // ← new
```

### Mechanical Walkthrough

`document.getElementById("file-content").value` reuses reading a
`<textarea>`'s live value, the same property `saveFile` already reads —
the entire point of this function is reading it *without* saving it
first. `JSON.stringify({ content: content })` reuses serialization from
Lesson 3, the identical shape `saveFile` already sends, since both
routes now share `FileEdit`'s exact request body on the backend.
`data.diff || "No unsaved changes."` reuses the `||`-fallback idiom from
Lesson 5 — an empty string is falsy, so a genuinely unchanged file
displays a real, readable message instead of a blank panel that looks
broken, exactly the reasoning already used for `"(no output)"`.

---

## Connect the pieces

Editing `src/utils.py` without saving, then clicking Current Diff:
`diffCurrent()` reads `#file-content`'s live value — the unsaved edit,
still only in browser memory — and sends it as `POST /diff-current`'s
body. On the backend, `diff_current` reads the *actual* saved content
fresh off disk and runs `difflib.unified_diff` against the two,
producing the same unified-diff format `/diff` already produces from
`git`, through a completely different mechanism. The frontend displays
it in `#current-diff-output`. Clicking Save afterward runs `saveFile`,
which writes that same unsaved content to disk and commits it — the
moment that happens, a second click of Current Diff against the
identical content now returns an empty diff, because there's nothing
left to compare.

## What breaks without this

Already demonstrated concretely above, not hypothetically: `/diff`
(Lesson 21) has no way to represent content that was never committed —
it can only compare two points already in `git`'s history. Confirmed
directly: `difflib.unified_diff` against two identical strings returns
`[]`, an empty result, and against two different ones returns the exact
same real, readable diff shown in this lesson's own concept lab.

## Exercises

1. Open a file, type a real change without saving, click Current Diff,
   and confirm the real unsaved change appears.
2. Save that change, click Current Diff again, and confirm the panel now
   reports "No unsaved changes."
3. Compare `/diff`'s and `/diff-current`'s real JSON responses side by
   side for the same edit, once saved — confirm the `diff` text itself
   is close in shape (`---`/`+++`/`@@`) even though one came from `git`
   and the other from `difflib`.

## Definition of done

- [ ] You've made a real unsaved edit, seen Current Diff report it, saved,
      and confirmed it clears
- [ ] You can explain why `/diff` (Lesson 21) can't answer this lesson's
      question, even though both routes are named "diff"
- [ ] You can explain why `FileEdit` was reused here instead of a new
      model being created
- [ ] You can name at least three other places the unified diff format
      this lesson produces already appears in real software
- [ ] `git commit` this lesson's code with a message explaining why
