# Lesson 21: A String That Looks Like Data Can Be a Command

## What you will build

A real diff view — clicking a commit in the History panel shows exactly
what that commit changed, reusing `git show` directly, the same
reuse-don't-reinvent instinct Lesson 7 already established for version
history itself. The feature is small. The actual subject is a real,
serious vulnerability this lesson's own first draft introduced and
caught before it ever shipped: a user-controlled string, handed to `git`
as if it could only ever mean "a commit," turned out to be able to write
an arbitrary file anywhere on disk.

## What you need to know first

`Lesson 7 - Version History.md` — `subprocess.run`, `git log`, reusing
`git` instead of building version control from scratch. `Lesson 2`'s
path traversal — the same *shape* of vulnerability this lesson finds
again, in a different part of the same command. `Lesson 20`'s History
panel — this lesson makes it interactive for the first time.

**This lesson was built under the same explicit-review discipline as
Lessons 5, 8, and 15.** A route that runs `git` with attacker-influenced
arguments is a real risk, treated as one from the first draft, not
patched in afterward.

---

## Concept Unit: reusing git's own diff, again

### The Problem

Lesson 20's History panel lists commits. Nothing yet shows what any one
of them actually *changed* — and reimplementing "compare two versions of
a text file" from scratch would mean rebuilding a real, hard problem
`git` has already solved, the exact reasoning Lesson 7 already used to
justify reusing `git` for history instead of a bespoke version-storage
system.

### What This Proves

`git show <commit> -- <path>` shows a specific commit's metadata and its
diff for one file, in one command. Confirmed directly, against a real
commit in this project's own history:

```
git show 6d69cdd -- src/utils.py
```

Actual output:

```
commit 6d69cdd20479b15e73006ffa5d5434e65835e33b
Author: g4m3rm1k3 <g4m3rm1k3@hotmail.com>
Date:   Thu Jul 16 17:37:50 2026 -0400

    Edit src/utils.py

diff --git a/src/utils.py b/src/utils.py
index 0dbb012..4693ad3 100644
--- a/src/utils.py
+++ b/src/utils.py
@@ -1,2 +1,2 @@
-def broken(:
-    pass
+def add(a, b):
+    return a + b
```

The same command against this project's very first commit — the one
with no parent to diff against — needs no special handling at all:

```
git show 7a0495a -- src/utils.py
```

Actual output:

```
commit 7a0495a1867b3969ac368c8cb0c7981615e3fe3c
Author: g4m3rm1k3 <g4m3rm1k3@hotmail.com>
Date:   Thu Jul 16 07:07:21 2026 -0400

    Initial commit: sample content folder

diff --git a/src/utils.py b/src/utils.py
new file mode 100644
index 0000000..3b474e9
--- /dev/null
+++ b/src/utils.py
@@ -0,0 +1,6 @@
+def add(a, b):
+    return a + b
+
+
+def subtract(a, b):
+    return a - b
```

`git` itself already knows a commit with no parent is a special case,
and represents it as a diff against nothing (`/dev/null`) — real,
correct output, with zero extra code written to detect or handle that
case specially. Reusing `git` doesn't just save the work of building a
differ; it inherits `git`'s own already-correct handling of edge cases a
hand-rolled version would have to rediscover one bug report at a time.

---

## Concept Unit: a string that looks like data can be a command

### The Problem

The route this lesson is building takes a `commit` value straight from
the URL and hands it to `git show` as one of its arguments. That value
comes from outside this project entirely — the same category of input
Lesson 2's path traversal check exists to distrust.

### Concept Lab

```python
import subprocess

result = subprocess.run(
    ["git", "show", "-1", "--", "README.md"],
    cwd=".",
    capture_output=True,
    text=True,
)
print(result.stdout[:80])
```

Run it, inside this project's own `content/` repo. Actual output — not
an error, not "invalid commit," a real, successful diff, for whichever
commit is actually the most recent one to have touched `README.md`
specifically:

```
commit 7a0495a1867b3969ac368c8cb0c7981615e3fe3c
Author: g4m3rm1k3 <g4m3rm1k3@hot
```

Now something far worse — a "commit" value shaped like a `git` flag
instead of a hash:

```python
result = subprocess.run(
    ["git", "show", "--output=injection_test.txt", "--", "src/utils.py"],
    cwd=".",
    capture_output=True,
    text=True,
)
```

Run it, and check the working directory afterward. Actual result: a new
file, `injection_test.txt`, sitting on disk — created by `git` itself,
from a value that was supposed to mean "which commit," not "where to
write a file."

### What This Proves

`"-1"` is not a valid `git` commit hash — but `git show` also accepts it
as a *flag*, meaning "show the single most recent commit," and silently
did that instead of failing. `"--output=injection_test.txt"` is not a
commit hash either — it's a real `git show` option that redirects the
command's output to a file of the caller's choosing. Neither value was
ever passed through a shell (`subprocess.run` with a list of arguments,
exactly as every earlier lesson has used it, never invokes one) — this
isn't shell injection, the vulnerability Lesson 2's traversal check and
every SQL-injection lesson already named. This is **argument injection**:
a value the code assumed could only ever be *data* was actually
interpreted by the program receiving it as a *command-line option*,
because nothing checked its shape before trusting it.

### Recognition

Also recognized in: `rm -- "$filename"` in shell scripts, defending
against a filename that begins with `-` being read as a flag instead of
a file to delete; `tar` and `zip` extraction tools historically
vulnerable to filenames inside an archive that resolve to command
options; any command-line tool a web application shells out to with
part of its argument list built from user input. The `--` this lesson's
own `git show` calls already include, separating options from filenames,
defends exactly one of these two arguments — `path` — and it has,
silently, ever since Lesson 5. `commit`, added fresh in this lesson,
never had that protection until now.

### Discard

This lab's own `injection_test.txt` is deleted immediately after being
observed — it never becomes part of this project, the same explicit
discard discipline as every other concept lab in this curriculum.

---

## Concept Unit: validating the shape, not blocking characters

### The Problem

The fix isn't a list of forbidden characters to reject — `-`, after all,
is a perfectly normal character to forbid, but `git`'s dangerous flags
are entire *words* (`--output=`), not single symbols, and a blocklist
approach means guessing every dangerous flag `git` might ever add.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add. `import re` added among the existing imports; a
  new `COMMIT_HASH_PATTERN` constant.
- **Dependencies** — `re` is part of Python's standard library.

### The New Code — type this

```python
import re
```

And the pattern itself, built once at module load rather than re-parsed
on every request:

```python
COMMIT_HASH_PATTERN = re.compile(r"^[0-9a-f]{4,40}$")
```

### The Updated Project — where this lives

The import lands among the existing ones:

```python
import ast
import re          # ← new
import secrets
import subprocess
from pathlib import Path
```

`COMMIT_HASH_PATTERN` is a new, freestanding module-level constant,
placed directly above the route that uses it, built in the next unit.

### Mechanical Walkthrough
`import re` reuses ordinary import syntax, pulling in Python's standard
library regular-expression module — this project's first use of it,
deliberately, since the G-code lexer chose hand-written scanning instead
of regex for parsing an open-ended grammar (Lesson 10). That reasoning
doesn't apply here: a `git` commit hash isn't a grammar to parse, it's a
single, fixed, already-known shape to check against — exactly the kind
of narrow, closed pattern regex is the right, standard tool for.
`re.compile(r"^[0-9a-f]{4,40}$")` builds a reusable pattern object once,
rather than re-parsing the pattern string on every request. `r"..."` is
- a **raw string** — the `r` prefix tells Python not to interpret
backslashes specially inside it, which matters here even though this
particular pattern has none, since regex patterns commonly do and
writing them as raw strings is the standard convention. `^` and `$`
anchor the match to the *entire* string — without them, a pattern
merely present somewhere inside a longer malicious string would still
- match.
- `[0-9a-f]` matches exactly one lowercase hexadecimal digit —
`git` hashes are hex, always lowercase in their canonical form. `{4,40}`
- requires between 4 and 40 of them in a row — 4 as the shortest `git`
itself will accept as an unambiguous abbreviation, 40 as a full SHA-1
hash's exact length.

### CS Lens — an allowlist, not a blocklist

This is a **allowlist** (also called a whitelist): define exactly what a
valid value looks like, and reject everything that doesn't match —
rather than a **blocklist**, enumerating specific bad values or
characters to reject and allowing everything else through by default.
`"--output=..."` would need to be specifically anticipated and blocked
by a blocklist; it needs nothing extra from an allowlist, because it was
never going to look like `[0-9a-f]{4,40}` in the first place. The same
principle already appeared, differently shaped, in Lesson 2: checking
that a *resolved* path stays inside `CONTENT_DIR` — an allowlist over
final, canonical locations — rather than blocklisting specific `".."`
patterns in the raw string, which URL-encoding and other tricks could
route around.

### SE Lens — the cost of getting this wrong is asymmetric

A blocklist that misses one dangerous `git` flag fails silently and
dangerously — exactly what this lesson's own concept lab demonstrated,
a real file written outside anywhere this project intended. An allowlist
that's *too strict* fails loudly and safely — a legitimate commit hash
gets rejected with a clear `400`, annoying, but never dangerous. When
the two failure directions aren't equally bad, the tool that fails safe
is worth choosing even when it takes a little more precision to write
correctly the first time.

---

## Concept Unit: the diff route

### The Problem

Something has to expose a validated, safe `git show` over the network,
gated and sandboxed exactly like every other file-touching route in this
project.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add, a new `@app.get("/diff")` route, added after
  `file_history`.
- **Dependencies** — `COMMIT_HASH_PATTERN` from the previous unit.

### The New Code — type this

```python
@app.get("/diff", dependencies=[Depends(require_auth)])
def diff_file(path: str = "", commit: str = ""):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    if not COMMIT_HASH_PATTERN.match(commit):
        raise HTTPException(status_code=400, detail="Invalid commit reference")

    relative_path = target_file.relative_to(CONTENT_DIR).as_posix()
    result = subprocess.run(
        ["git", "show", commit, "--", relative_path],
        cwd=CONTENT_DIR,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise HTTPException(status_code=400, detail="Invalid commit")

    return {"path": path, "commit": commit, "diff": result.stdout}
```

### The Updated Project — where this lives

This is a complete, freestanding new function, added after
`file_history` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see.

### Mechanical Walkthrough
The first two checks reuse the identical traversal and existence
pattern from every route in this file since Lesson 5.
`COMMIT_HASH_PATTERN.match(commit)` is new: `.match()` tests a string
against a compiled pattern from its very start, returning a match object
if it succeeds, `None` if it doesn't. `not COMMIT_HASH_PATTERN.match(commit)`
- is `True` exactly when that call returned `None` — a failed match — so
this `if` raises precisely when `commit` did *not* match the required
shape. `relative_to(CONTENT_DIR).as_posix()`
reuses the exact pattern from `file_history` right above it.
`["git", "show", commit, "--", relative_path]` reuses the argument-list
- form of `subprocess.run` from every earlier `git` call in this project —
`commit`, now guaranteed by the check above to be nothing but lowercase
hex digits, can no longer be mistaken for a flag no matter what `git`
itself might otherwise accept there. `result.returncode != 0` reuses the
same failure-detection pattern from Lesson 6's `run_rust`, here catching
a syntactically valid-looking hash that simply doesn't exist in this
repository. `return {"path": path, "commit": commit, "diff": result.stdout}`
reuses the plain-dictionary response shape every route in this project
has returned since Lesson 1.

### Run It

```
GET /diff?path=src/utils.py&commit=6d69cdd → 200, real diff shown above
GET /diff?path=src/utils.py&commit=7a0495a → 200, real root-commit diff shown above
GET /diff?path=src/utils.py&commit=-1              → 400 {"detail":"Invalid commit reference"}
GET /diff?path=src/utils.py&commit=--output=/tmp/x → 400 {"detail":"Invalid commit reference"}
GET /diff?path=../../../etc/passwd&commit=6d69cdd  → 400 {"detail":"Invalid path"}
```

All five confirmed directly against the real running server — both
malicious "commit" values from this lesson's own concept lab, replayed
against the actual route, correctly rejected.

---

## Concept Unit: making history clickable

### The Problem

`#history-output`, since Lesson 20, only ever displayed plain text —
nothing about it can be clicked. Showing a diff needs each commit entry
to become a real, interactive element.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace, `historyFile`'s display logic; refactor,
  `.clickable`'s CSS rule, generalized from sidebar-only to universal.
- **Location** — `historyFile`, from Lesson 20; the `.sidebar
  li.clickable` rule, from Lesson 2.
- **Dependencies** — none new.

### The New Code — type this

```css
.clickable {
    cursor: pointer;
}
.output-panel .clickable {
    padding: 2px 4px;
    border-radius: 3px;
}
.output-panel .clickable:hover {
    background-color: #333;
}
```

And `historyFile`'s new display logic:

```javascript
outputElement.textContent = "";
data.commits.forEach((commit) => {
    const shortHash = commit.hash.slice(0, 7);
    const entry = document.createElement("div");
    entry.className = "clickable";
    entry.textContent = shortHash + "  " + commit.timestamp + "  " + commit.message;
    entry.addEventListener("click", () => {
        diffCommit(commit.hash);
    });
    outputElement.appendChild(entry);
});
```

### The Updated Project — where this lives

The CSS block, `.sidebar li.clickable` generalized into a plain
`.clickable`, with two new rules scoped specifically to entries inside a
dark `.output-panel`:

```css
.clickable {                          /* ← changed: was ".sidebar li.clickable" */
    cursor: pointer;
}
.sidebar li.clickable:hover {
    background-color: #eee;
}
.output-panel .clickable {            /* ← new */
    padding: 2px 4px;                 /* ← new */
    border-radius: 3px;               /* ← new */
}                                       /* ← new */
.output-panel .clickable:hover {       /* ← new */
    background-color: #333;            /* ← new */
}                                       /* ← new */
```

And `historyFile`, complete, with its old `.map()`-and-join text
building replaced:

```javascript
function historyFile() {
    if (activeTabPath === null) {
        return;
    }

    const outputElement = document.getElementById("history-output");
    outputElement.textContent = "Loading history...";

    authenticatedFetch("http://127.0.0.1:8000/history?path=" + encodeURIComponent(activeTabPath))
        .then((response) => response.json())
        .then((data) => {
            if (data.commits.length === 0) {
                outputElement.textContent = "No history found.";
                return;
            }
            outputElement.textContent = "";                                          // ← changed
            data.commits.forEach((commit) => {                                       // ← changed: was .map()
                const shortHash = commit.hash.slice(0, 7);
                const entry = document.createElement("div");                          // ← new
                entry.className = "clickable";                                        // ← new
                entry.textContent = shortHash + "  " + commit.timestamp + "  " + commit.message;  // ← changed
                entry.addEventListener("click", () => {                               // ← new
                    diffCommit(commit.hash);                                          // ← new
                });                                                                    // ← new
                outputElement.appendChild(entry);                                     // ← new
            });
        })
        .catch((error) => {
            outputElement.textContent = "Could not load history.";
        });
}
```

### Mechanical Walkthrough
- `.clickable` loses its `.sidebar li` prefix — the same generalize-once-
a-second-real-instance-needs-it reasoning `.output-panel` already went
through in Lesson 10, `cursor: pointer` now meaningful on any element,
not only sidebar list items. `.output-panel .clickable` and
`.output-panel .clickable:hover` are **descendant selectors**, reused
- from `.sidebar li` itself — matching any `.clickable` element that sits
*inside* an `.output-panel`, giving history entries their own
appropriately dark-background hover color without touching the
sidebar's light-background one at all. In `historyFile`, `data.commits.forEach((commit)
- => { ... })` reuses `.forEach()` from Lesson 2 in place of `.map()` —
deliberately: `.map()` builds a new array of *return values*; this code
doesn't return anything from the callback, it performs a side effect
(building and inserting a real element) for each commit, exactly the
distinction Lesson 10 already drew between the two methods.
`document.createElement("div")`, `entry.className = "clickable"`, and
`entry.addEventListener("click", () => { diffCommit(commit.hash); })`
all reuse the exact construct-style-attach pattern `renderFileList` has
- used since Lesson 2 — a **closure** over `commit`, the same mechanism
Lesson 2's own CS Lens named for its click handlers, capturing this
specific commit's hash for this specific entry.
`outputElement.appendChild(entry)` reuses `.appendChild()` from the same
lesson.

---

## Concept Unit: showing the diff

### The Problem

Clicking a commit needs to actually call `/diff` and display what comes
back.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `diffCommit` function, placed directly
  after `historyFile`; a new `#diff-output` panel; one more clearing
  line inside `renderEditor` (Lesson 4/9/10/11/12/20), alongside its
  existing `#history-output` clearing.
- **Dependencies** — the `/diff` route above.

### The New Code — type this

```javascript
function diffCommit(commitHash) {
    if (activeTabPath === null) {
        return;
    }

    const outputElement = document.getElementById("diff-output");
    outputElement.textContent = "Loading diff...";

    authenticatedFetch("http://127.0.0.1:8000/diff?path=" + encodeURIComponent(activeTabPath) + "&commit=" + encodeURIComponent(commitHash))
        .then((response) => response.json())
        .then((data) => {
            outputElement.textContent = data.diff;
        })
        .catch((error) => {
            outputElement.textContent = "Could not load diff.";
        });
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function, placed directly after
`historyFile` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see. The panel it targets, sitting after `#history-output`:

```html
<div id="history-output" class="output-panel"></div>
<div id="diff-output" class="output-panel"></div>   <!-- ← new -->
```

`#diff-output` is this project's *sixth* element using `.output-panel`
— still no new box-styling CSS required. `renderEditor` needs one more
line, clearing this new panel the same moment it already clears
`#history-output`:

```javascript
document.getElementById("history-output").textContent = "";
document.getElementById("diff-output").textContent = "";   // ← new
```

The same reason as every panel before it: without this, switching tabs
would leave a previous file's diff on screen instead of a clean slate.

### Mechanical Walkthrough
`function diffCommit(commitHash)` reuses ordinary function-declaration
- syntax with a parameter — the value `historyFile`'s click handler closes
over and passes in. The guard clause reuses the standard shape.
`encodeURIComponent(activeTabPath) + "&commit=" + encodeURIComponent(commitHash)`
reuses URL-safety encoding from Lesson 2, applied to *two* query
- parameters chained with `&` — the same convention every multi-parameter
URL in this project's backend already expects, here built by hand for
the first time on the frontend, since every earlier route only ever
needed one. `outputElement.textContent = data.diff` reuses plain text
assignment, displaying the real diff text exactly as `git` produced it
- — `.output-panel`'s existing `white-space: pre-wrap` (Lesson 5) is what
keeps its line breaks and indentation intact rather than collapsing into
one run-on line.

---

## Connect the pieces

Clicking History on `src/utils.py`, then clicking one specific commit
entry: `historyFile()` builds one real, clickable `<div>` per commit,
each one's click handler closing over that exact commit's hash. Clicking
one calls `diffCommit(commit.hash)`, sending `GET /diff?path=src/utils.py&commit=...`.
On the backend, `diff_file` runs the shared traversal and existence
- checks, then — critically — validates `commit` against
`COMMIT_HASH_PATTERN` before it ever reaches `subprocess.run` at all;
only a value shaped like a real hash gets that far. `git show commit --
relative_path` runs, exactly as this lesson's first unit demonstrated by
hand, and its real stdout — commit metadata plus a unified diff — comes
back as JSON. `diffCommit`'s own success handler drops it straight into
`#diff-output`, `white-space: pre-wrap` preserving every line exactly as
`git` formatted it. The same attacker input this lesson's concept lab
proved could write an arbitrary file, sent through this exact real
route, now returns a clean `400` instead.

## What breaks without this

Already demonstrated concretely above, not hypothetically: a `commit`
value of `"--output=injection_test.txt"`, handed to `git show` without
the pattern check in place, wrote a real file to disk — confirmed by
finding it there afterward. With `COMMIT_HASH_PATTERN.match(commit)` in
place, checked directly against the real running route, the identical
input is rejected with a clean `400` before `subprocess.run` is ever
called at all.

## Exercises

1. Open a file with real history through the running app, click History,
   click a commit, and confirm its real diff appears.
2. Click the very first ("Initial commit") entry and confirm the diff
   shows the file being added, not a comparison against a previous
   version that doesn't exist.
3. Reproduce this lesson's argument-injection lab yourself, inside
- `content/`'s own repo, and read the real file it creates — then
   delete it and confirm `COMMIT_HASH_PATTERN` rejects the identical
   value through the real `/diff` route.
4. Predict, before checking, whether `COMMIT_HASH_PATTERN` accepts an
- uppercase hash like `"6D69CDD"` — then verify, and explain what real
   `git` hashes would ever look like in practice.

## Definition of done

- [ ] You've clicked through History to a real diff through the running
      app and seen real, correct `git` output
- [ ] You've reproduced the argument-injection vulnerability yourself and
      confirmed the fix closes it, against the real route
- [ ] You can explain the difference between argument injection and the
      shell injection / SQL injection this project has already named
- [ ] You can explain why an allowlist was chosen here instead of a
      blocklist of dangerous flags
- [ ] You can explain why `.forEach()` was the right choice over `.map()`
      in `historyFile`'s rewrite
- [ ] `git commit` this lesson's code with a message explaining why
