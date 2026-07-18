# Lesson 9: Parsing Is Not Running

## What you will build

A `/diagnose` route that checks whether a `.py` file's syntax is valid
without ever executing it, and a small "Problems" panel that checks
automatically, every time a file is saved. The feature is "tell me about
mistakes"; the actual subject is a real, measurable distinction between
two operations that sound similar — reading a program's structure, and
running it — and why a platform built around real code should never
answer a small question by paying the cost of a big one.

## What you need to know first

`Lesson 5 - Running Code.md` — `subprocess.run`, the real cost and risk
of starting a child process, the traversal/existence/suffix checks reused
unchanged again. `Lesson 6 - Multi-Language Execution.md` — compiled vs.
interpreted, and specifically that a syntax error is caught at *compile*
time, before anything runs. `Lesson 3`'s `saveFile`, extended here rather
than replaced.

---

## Concept Unit: parsing without executing

### The Problem

Right now, the only way this project can tell you a `.py` file has a
mistake is `/run` (Lesson 5): start a whole separate process, wait for
Python to either finish or hit the five-second timeout, and only then
read whatever landed in `stderr`. That's the right tool for "did my
program work" — but it's a wildly expensive way to answer a much smaller
question: "is this even valid Python?" Measured directly, on this
project's own `src/main.py`:

```
ast.parse:      0.062ms
subprocess.run: 33.308ms
```

Running is over 500 times slower than parsing, for a question parsing
alone can already answer.

### Concept Lab

```python
import ast

source = 'print("this should never print")'

print("Before ast.parse")
tree = ast.parse(source)
print("After ast.parse, nothing from inside the string printed above this line")
print(tree)
```

Run it. Actual output:

```
Before ast.parse
After ast.parse, nothing from inside the string printed above this line
<ast.Module object at 0x00000215C087BAD0>
```

`"this should never print"` never printed — even though it's sitting
directly inside a `print(...)` call, spelled out in the source string
`ast.parse` was just handed.

Now vary it — a string with a genuine mistake:

```python
import ast

source = "def greet(name):\n    print(\"hi\" + name\n"

try:
    ast.parse(source)
except SyntaxError as error:
    print("lineno:", error.lineno)
    print("offset:", error.offset)
    print("msg:", error.msg)
```

Run it. Actual output:

```
lineno: 2
offset: 10
msg: '(' was never closed
```

### What This Proves

`ast.parse(source)` reads a string of source code and builds an **AST**
— an Abstract Syntax Tree, a structured, in-memory representation of
what the code's grammar actually says — without ever running a single
statement inside it. That's the entire proof in the first block: a
`print(...)` call sitting right there in the source text never fired,
because `ast.parse` only ever asks "is this shaped like valid Python,"
never "what does this program do when executed." The second block shows
that a real mistake doesn't crash the whole process or return nothing
useful — `ast.parse` raises a `SyntaxError` object carrying exactly
where it happened: `.lineno` (the line), `.offset` (the column), and
`.msg` (a human-readable description) — everything needed to point at
the mistake, produced by the same operation that never executed anything
at all.

### Discard

This code is deleted now — `source`, the throwaway `greet` snippet, and
this exact `try`/`except` never appear in the project. The real route
below runs this same `ast.parse`/`except SyntaxError` shape against a
file already saved to disk, and turns the caught error into an HTTP
response instead of a `print`.

---

## Concept Unit: a route that answers a narrower question

### The Problem

Something has to expose this check over the network, the same way every
other capability in this project has been exposed since Lesson 1 — and
it needs the same sandbox guarantees every file-touching route already
has, not a fresh, unaudited copy of them.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — `import ast` added at the very top, above the existing
  imports; a new `@app.post("/diagnose")` route added after `run_file`.
- **Dependencies** — `ast` is part of Python's standard library; nothing
  to install.

### The New Code — type this

```python
@app.post("/diagnose", dependencies=[Depends(require_auth)])
def diagnose_file(path: str = ""):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    if target_file.suffix != ".py":
        raise HTTPException(status_code=400, detail="Only .py files can be diagnosed")

    content = target_file.read_text(encoding="utf-8")

    try:
        ast.parse(content, filename=target_file.name)
    except SyntaxError as error:
        return {
            "ok": False,
            "line": error.lineno,
            "column": error.offset,
            "message": error.msg,
        }

    return {"ok": True}
```

### The Updated Project — where this lives

The import needs to land among the existing ones; see it in place:

```python
import ast          # ← new
import os
import secrets
import subprocess
from pathlib import Path
```

`diagnose_file` itself is a complete, freestanding new function, added
after `run_file` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see.

### Mechanical Walkthrough

The first three checks — `is_relative_to`, `is_file`, `target_file.suffix
!= ".py"` — are not new logic; they're the identical traversal,
existence, and Python-only checks `run_file` already uses, copy-pasted
again, the same named cost from Lesson 2 and Lesson 5. `content =
target_file.read_text(encoding="utf-8")` reuses `read_file`'s exact
pattern from Lesson 3, encoding pinned for the same reason. `ast.parse(content,
filename=target_file.name)` is the concept lab's function, for real this
time — `filename=target_file.name` is new: it doesn't change what gets
parsed, only what a raised `SyntaxError` reports as its source, so an
error message names the actual file instead of `"<unknown>"`. `except
SyntaxError as error:` reuses the exact `try`/`except` shape from Lesson
3's `read_file` and Lesson 5's `run_file`, a different exception type
each time, the same underlying construct. `error.lineno`, `error.offset`,
and `error.msg` are the same three attributes just proven in the concept
lab, now placed into a returned dictionary instead of printed. `return
{"ok": True}` — reached only if `ast.parse` raised nothing at all — is
this route's success case, mirroring the shape of every JSON response
this API has returned since Lesson 1.

### CS Lens — this project's first real AST

`ast.parse` doesn't just check for mistakes as a side effect — it builds
a real Abstract Syntax Tree, the same idea named in this project's own
`BRD.md` as the architectural center of the *entire* platform: `Text →
Lexer → Parser → AST → Semantic Analysis → IR`, the pipeline every future
language plugin, including G-code, is meant to follow. This lesson
doesn't build that pipeline — `ast.parse` is Python's own parser, not
this project's — but it's the first time this curriculum has actually
produced and used a tree-shaped representation of source code instead of
only ever treating source as a flat string. Recognizing that "check the
syntax" and "build an AST" are the same operation, seen here in its
smallest possible form, is worth more than the specific route.

### SE Lens — a narrower tool, deliberately not a replacement

`/run` and `/diagnose` are not competing ways to do the same job. `/run`
answers "what does this program actually do" and necessarily pays for
that answer — a real process, real time, real side effects, a real
timeout budget. `/diagnose` answers a strictly smaller question — "is
this even valid Python" — and, because `ast.parse` never executes
anything, it can answer that question for code that would loop forever,
crash the interpreter, or take minutes to run, in a fraction of a
millisecond, every time. Reaching for the narrowest tool that actually
answers the question asked, instead of always reaching for the most
powerful one available, is the same engineering habit already named for
`git` back in Lesson 7 — recognizing when a smaller, already-correct
answer exists instead of defaulting to the biggest hammer in reach.

### Run It

```
POST /diagnose?path=src/main.py   → 200 {"ok":true}
```

Against a file deliberately saved with a real mistake first
(`def broken(:\n    pass\n`):

```
PUT  /file?path=src/utils.py  body={"content":"def broken(:\n    pass\n"} → {"saved":true}
POST /diagnose?path=src/utils.py → 200 {"ok":false,"line":1,"column":12,"message":"invalid syntax"}
```

Then saved back to something valid:

```
PUT  /file?path=src/utils.py  body={"content":"def add(a, b):\n    return a + b\n"} → {"saved":true}
POST /diagnose?path=src/utils.py → 200 {"ok":true}
```

All four confirmed directly against the real running server — the same
route correctly flips between reporting a real, specific mistake and
reporting none, tracking exactly what's actually saved to disk.

---

## Concept Unit: a place on screen for problems

### The Problem

The backend can now answer "is this file valid," but nothing on the page
has anywhere to show that answer.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add. A new `#diagnostics-output` element in the
  editor pane; a matching CSS rule in the existing `<style>` block.
- **Location** — the CSS rule joins the existing block, directly after
  `.tab-close:hover`; the element itself sits between the Save/Run button
  row and `#run-output`, inside `#editor-pane`.
- **Dependencies** — none.

### The New Code — type this

```css
#diagnostics-output {
    font-family: monospace;
    font-size: 13px;
    padding: 4px 0;
    color: #666;
}
#diagnostics-output.has-error {
    color: #c00;
}
```

That rule alone has nowhere to attach without a real element to match —
the element itself is the other half:

```html
<div id="diagnostics-output"></div>
```

### The Updated Project — where this lives

The CSS lands right after the existing `.tab-close:hover` rule from
Lesson 4:

```css
.tab-close:hover {
    color: #000;
}
#diagnostics-output {                     /* ← new */
    font-family: monospace;               /* ← new */
    font-size: 13px;                      /* ← new */
    padding: 4px 0;                       /* ← new */
    color: #666;                          /* ← new */
}                                          /* ← new */
#diagnostics-output.has-error {           /* ← new */
    color: #c00;                          /* ← new */
}                                          /* ← new */
```

And the element itself lands between the button row and `#run-output`,
both from Lesson 5:

```html
<div id="editor-pane" style="display: none;">
    <textarea id="file-content"></textarea>
    <div>
        <button id="save-button">Save</button>
        <button id="run-button">Run</button>
        <span id="save-status"></span>
    </div>
    <div id="diagnostics-output"></div>   <!-- ← new -->
    <div id="run-output"></div>
</div>
```

Nothing writes to `#diagnostics-output` yet — it exists, styled, empty,
waiting for the next unit.

### Mechanical Walkthrough

`font-family: monospace`, `font-size: 13px`, and `padding: 4px 0` all
reuse exactly the properties `#run-output` already established in Lesson
5, for the same reason — this is also a fixed-width status readout.
`color: #666` is new only in its specific value — a medium gray, chosen
for a default/neutral state sitting directly on this page's plain white
background, distinct from `#run-output`'s white-on-near-black scheme.
`#diagnostics-output.has-error` reuses the exact `.has-error` *naming*
convention `#run-output.has-error` established in Lesson 5 — the same
idea, "a class toggled on to signal an error state," applied a second
time — but with its own color, `#c00` (a dark red), chosen for
readability against this element's light background rather than
`#run-output.has-error`'s `#f88` against a dark one. Same pattern,
different concrete values, because the two elements sit on different
backgrounds. The bare `<div id="diagnostics-output"></div>` is the same
empty, ID-tagged container shape as `#run-output` itself — nothing
inside it yet; JavaScript fills it in, same as `#run-output` has been
filled in since Lesson 5.

---

## Concept Unit: a function that checks, on request

### The Problem

Something on the frontend needs to actually call `/diagnose` and put its
answer into `#diagnostics-output`.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `diagnoseFile` function inside the
  existing `<script>` block, placed directly after `saveFile`.
- **Dependencies** — the `/diagnose` route above, `activeTabPath` from
  Lesson 4.

### The New Code — type this

```javascript
function diagnoseFile() {
    if (activeTabPath === null) {
        return;
    }

    fetch("http://127.0.0.1:8000/diagnose?path=" + encodeURIComponent(activeTabPath), {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + authToken,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            const diagnosticsElement = document.getElementById("diagnostics-output");
            if (data.ok) {
                diagnosticsElement.className = "";
                diagnosticsElement.textContent = "No problems found.";
            } else {
                diagnosticsElement.className = "has-error";
                diagnosticsElement.textContent = "Line " + data.line + ": " + data.message;
            }
        })
        .catch((error) => {
            document.getElementById("diagnostics-output").textContent = "Could not check file.";
        });
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function, placed directly after
`saveFile` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see. Nothing calls it yet — the next unit does.

### Mechanical Walkthrough

`if (activeTabPath === null) { return; }` reuses the exact guard clause
`openFile`, `saveFile`, and `runFile` all already use — nothing to check
with no tab open. `fetch(...)` with `method: "POST"` and an
`Authorization` header reuses `runFile`'s exact shape from Lesson 5/8:
`POST`, because this route performs a check rather than fetching a
resource's current state, the same `POST`-means-action reasoning from
Lesson 5's CS Lens; `Authorization: "Bearer " + authToken` because
`/diagnose`, like every route since Lesson 8, is gated by `require_auth`.
`encodeURIComponent(activeTabPath)` reuses Lesson 2's URL-safety
encoding. `.then((response) => response.json())` reuses the standard
parse step from every fetch since Lesson 1. Inside the second `.then()`,
`document.getElementById("diagnostics-output")` reuses `getElementById`
from Lesson 1; `data.ok` reads the exact field name `diagnose_file`
returns on the backend, the same JSON-shape correspondence named back in
Lesson 8 for `data.token`. `diagnosticsElement.className = ""` /
`"has-error"` and `.textContent = ...` both reuse the exact
toggle-a-class/set-the-text pattern `runFile` already applies to
`#run-output` — the same two-property pairing, a new element. `"Line " +
data.line + ": " + data.message` reuses `+` string concatenation,
building a readable sentence from the two structured fields the backend
computed. `.catch((error) => { ... })` reuses the network-failure
fallback pattern from every `fetch` chain since Lesson 1.

---

## Concept Unit: chaining a dependent check after a successful save

### The Problem

A diagnostic panel nobody has to remember to check isn't much better
than none at all — it needs to run automatically, exactly when its
answer would actually matter: right after new content lands on disk.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace. One line is added inside `saveFile`'s
  existing success callback; two lines are added inside `renderEditor`,
  alongside its existing `#run-output` clearing.
- **Location** — `saveFile`, from Lesson 3/4; `renderEditor`, from
  Lesson 4.
- **Dependencies** — `diagnoseFile` from the previous unit.

### The New Code — type this

Inside `saveFile`'s success callback, right after the "Saved." message
is set:

```javascript
diagnoseFile();
```

And inside `renderEditor`, alongside the existing `#run-output`
clearing:

```javascript
document.getElementById("diagnostics-output").textContent = "";
document.getElementById("diagnostics-output").className = "";
```

### The Updated Project — where this lives

`saveFile`, with the one new line in place:

```javascript
function saveFile() {
    if (activeTabPath === null) {
        return;
    }

    const content = document.getElementById("file-content").value;

    fetch("http://127.0.0.1:8000/file?path=" + encodeURIComponent(activeTabPath), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + authToken,
        },
        body: JSON.stringify({ content: content }),
    })
        .then((response) => response.json())
        .then((data) => {
            const activeTab = openTabs.find((tab) => tab.path === activeTabPath);
            activeTab.content = content;
            document.getElementById("save-status").textContent = "Saved.";
            diagnoseFile();   // ← new
        })
        .catch((error) => {
            document.getElementById("save-status").textContent = "Could not save.";
        });
}
```

And `renderEditor`, with the two new lines in place:

```javascript
function renderEditor() {
    const emptyState = document.getElementById("editor-empty");
    const editorPane = document.getElementById("editor-pane");

    if (activeTabPath === null) {
        emptyState.style.display = "block";
        editorPane.style.display = "none";
        return;
    }

    const activeTab = openTabs.find((tab) => tab.path === activeTabPath);
    emptyState.style.display = "none";
    editorPane.style.display = "block";
    document.getElementById("file-content").value = activeTab.content;
    document.getElementById("save-status").textContent = "";
    document.getElementById("run-output").textContent = "";
    document.getElementById("run-output").className = "";
    document.getElementById("diagnostics-output").textContent = "";   // ← new
    document.getElementById("diagnostics-output").className = "";    // ← new
}
```

Every other line in both functions is exactly as Lesson 4/5 left it —
`saveFile` still validates, sends, and updates `activeTab.content`
precisely as before; `renderEditor` still switches between the empty
state and the editor pane precisely as before. Saving a file now always
triggers a check immediately afterward, and switching tabs always clears
the previous tab's stale answer before the new one's is known.

### Mechanical Walkthrough

`diagnoseFile();`, called with no arguments, reuses ordinary function-call
syntax already established since Lesson 1 — the only thing new here is
*where* it's called from: inside `saveFile`'s own success callback, after
a `fetch` that has nothing to do with `/diagnose` has already completed.
`document.getElementById("diagnostics-output").textContent = ""` and
`.className = ""` both reuse the exact clearing pattern the two lines
immediately above them already apply to `#run-output` — the same idea, a
second element.

### CS Lens — one async operation triggering another, not chaining the same one

Every `.then().then()` chain since Lesson 1 has processed *one* request's
own response in stages — parse the JSON, then use it. `diagnoseFile()`
here is different: it's a second, entirely independent `fetch` — its own
request, its own response, its own `.then()` chain — started from inside
the *first* request's success handler, deliberately, only once that first
one is known to have actually succeeded. This is a **dependent
operation**: "do B, but only after A has actually finished successfully,"
as opposed to "do A and B at the same time" or "do A, then read A's own
result." Nothing forces `diagnoseFile()` to wait for anything from
`saveFile`'s response — it doesn't use `data` at all — but it *does* need
`saveFile`'s write to have actually landed on disk first, since it
immediately re-reads that same file from the backend. Placing the call
inside the success callback, not right after the `fetch(...)` block, is
what guarantees that ordering.

### SE Lens — why not check on every keystroke instead

The obvious alternative is diagnosing on every `"input"` event, the same
listener Lesson 4 already attaches to `#file-content` for tracking
unsaved edits — instant feedback, no waiting for Save. That's a real,
common pattern in professional editors, and this project doesn't do it
yet for a concrete reason: `diagnoseFile()` sends a full network request
per call, and an `"input"` event can fire dozens of times a second while
someone is actively typing — without a mechanism to limit how often it
actually fires (a **debounce**, not yet built here), wiring it to
`"input"` today would mean a new HTTP request on every single keystroke.
Checking on save is the smaller, correct-for-now version of the same
idea — a live-as-you-type version is a real, named direction this
project could grow into later, not one this lesson claims to have
already solved.

---

## Connect the pieces

Editing `src/utils.py` to introduce a real mistake and clicking Save:
`saveFile()` sends `PUT /file`, the backend writes the new (broken)
content to disk and commits it exactly as it has since Lesson 7, and
returns `{"saved": true}`. `saveFile`'s success callback sets
`"Saved."`, then calls `diagnoseFile()` — a second, independent request.
On the backend, `diagnose_file` re-reads that same file fresh off disk,
runs `ast.parse` against it, and this time catches a `SyntaxError`,
returning `{"ok": false, "line": ..., "column": ..., "message": ...}`.
The frontend receives it, sets `#diagnostics-output`'s class to
`has-error`, and shows exactly which line is wrong — all without a
single `/run` request, a subprocess, or a five-second timeout window
anywhere in the sequence. Fixing the mistake and saving again repeats
the identical path, this time landing on `{"ok": true}` and clearing
back to `"No problems found."` Switching to a different tab in between
clears `#diagnostics-output` immediately, so a stale answer from the
previous file is never shown against the wrong one.

## What breaks without this

Already demonstrated concretely above, not hypothetically: measured
directly against this project's own `src/main.py`, `ast.parse` took
`0.062ms`; `subprocess.run`-ing the same file took `33.308ms` — over 500
times slower, for a question `ast.parse` alone can already answer. And
without `filename=target_file.name` specifically, a raised `SyntaxError`
would still report the correct `.lineno`/`.offset`/`.msg`, but its own
internal `.filename` would read as Python's generic placeholder instead
of naming the real file — harmless today, since this route's response
never actually surfaces that field, but a real gap the moment anything
downstream starts reading it.

## Exercises

1. Introduce a real syntax error into any `.py` file through the running
   app, save it, and confirm the Problems panel reports the correct line
   number before you've clicked Run at all.
2. Fix the mistake, save again, and confirm the panel returns to "No
   problems found."
3. In the concept lab, change the source string to something with valid
   syntax but a real runtime bug (e.g. `"1 / 0"`) and predict, before
   running it, whether `ast.parse` raises anything — then explain in your
   own words why `ast.parse` alone could never catch that class of
   mistake, no matter how it's used.
4. Time `/run` against `src/infinite_loop.py` from Lesson 5 versus
   `/diagnose` against the same file, and confirm `/diagnose` returns
   instantly regardless of what the file would actually do if executed.

## Definition of done

- [ ] You've triggered a real syntax error through the running app and
      seen the Problems panel report it immediately after Save, with no
      Run required
- [ ] You've fixed it and confirmed the panel clears back to "No problems
      found"
- [ ] You can explain, with the real measured numbers, why `/diagnose`
      is not just "a smaller `/run`" but a fundamentally cheaper kind of
      operation
- [ ] You can explain why `ast.parse` can catch a syntax error but could
      never catch `1 / 0`
- [ ] You can explain what makes `diagnoseFile()`'s call from inside
      `saveFile` a *dependent* operation, not just two unrelated fetches
- [ ] `git commit` this lesson's code with a message explaining why
