# Lesson 14: Checking the Right Thing

## What you will build

A one-line bug fix, and the concept behind it: `saveFile()` has called
`diagnoseFile()` — a Python-only check — after *every* save since Lesson
9, including saves of `.nc` files, which was never correct and has been
silently wrong since Lesson 10 introduced G-code files at all. The
actual subject is choosing between more than two outcomes, and a bug
this project has been shipping without ever noticing, because nothing
crashed.

## What you need to know first

`Lesson 9 - Basic Diagnostics.md` — `diagnoseFile`, and `saveFile`'s
automatic call to it. `Lesson 12/13`'s `analyzeFile`. `Lesson 3`'s
`if`/`else` dispatch in `renderFileList` — this lesson adds a third
branch to that same underlying idea.

---

## Concept Unit: a real bug, hiding since Lesson 10

### The Problem

`saveFile()`, unchanged since Lesson 9, ends its success callback with a
single, unconditional line:

```javascript
diagnoseFile();
```

`diagnoseFile()` sends `POST /diagnose`, a route that only ever
understood `.py` files. Every `.nc` file this project has had since
Lesson 10 — `sample.nc`, `duplicate_axis.nc`, `motion_conflict.nc` — has
been silently mishandled every single time it was saved. Confirmed
directly, the real backend response for a `.nc` file:

```
POST /diagnose?path=src/sample.nc → 400 {"detail":"Only .py files can be diagnosed"}
```

`diagnoseFile()`'s own code, unchanged since Lesson 9:

```javascript
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
```

### What This Proves

`data`, here, is `{"detail": "Only .py files can be diagnosed"}` — the
error body, not the success shape `diagnoseFile` was written to expect.
`data.ok` is `undefined`, which is falsy, so the `else` branch runs.
`data.line` and `data.message` are also both `undefined` — `.nc` isn't
`.py`, so nothing about *this specific* error even mentions a line or a
message field. `"Line " + data.line + ": " + data.message` still runs,
because JavaScript's `+` never refuses to concatenate `undefined` — it
just converts it to the literal four-character string `"undefined"`.
The result, styled as a real error every single time: **`Line undefined:
undefined`**. Nothing crashed. No exception, no red console error — the
exact same category of silent failure named for the `.git` bug in Lesson
8 and the false-positive semantic check in Lesson 12: code that runs
successfully, producing a confidently wrong answer.

---

## Concept Unit: choosing between more than two outcomes

### The Problem

`saveFile()` needs to run a *different* check depending on what kind of
file was just saved — `diagnoseFile()` for `.py`, `analyzeFile()` for
`.nc`, and neither for anything else — three outcomes, not the two an
ordinary `if`/`else` can express.

### Concept Lab

```javascript
function describe(extension) {
    if (extension === ".py") {
        return "Python";
    } else if (extension === ".nc") {
        return "G-code";
    } else {
        return "unknown";
    }
}

console.log(describe(".py"));
console.log(describe(".nc"));
console.log(describe(".txt"));
```

Run it. Actual output:

```
Python
G-code
unknown
```

### What This Proves

`else if` chains any number of conditions together, tried in order:
`extension === ".py"` first; if that's `false`, `extension === ".nc"`
next; if that's also `false`, the final plain `else` runs, no condition
attached, catching everything else. This is JavaScript's version of an
idea already used constantly on the Python side of this project —
`if`/`elif`/`else`, first seen in Lesson 6's `run_python`/`run_rust`
dispatch, reused every lesson since — the identical underlying decision,
spelled `else if` (two words, no contraction) instead of Python's single
keyword `elif`.

### Discard

This code is deleted now — `describe` never appears in the project. The
real fix asks the identical three-way question about a file's actual
extension, and calls a real function instead of returning a string.

---

## Concept Unit: checking the right thing

### The Problem

`saveFile`'s single `diagnoseFile();` line needs to become a real
three-way choice: run `diagnoseFile()` only for `.py`, `analyzeFile()`
only for `.nc`, and do nothing for anything else — including, for now,
files this project doesn't know how to check at all.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace, inside `saveFile`'s existing success
  callback.
- **Location** — `saveFile`, from Lesson 3/4/9.
- **Dependencies** — `diagnoseFile` (Lesson 9), `analyzeFile` (Lesson
  12).

### The New Code — type this

```javascript
if (activeTabPath.endsWith(".py")) {
    diagnoseFile();
} else if (activeTabPath.endsWith(".nc")) {
    analyzeFile();
}
```

### The Updated Project — where this lives

Now see it in place, replacing the single unconditional call:

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
            if (activeTabPath.endsWith(".py")) {         // ← changed: was an unconditional diagnoseFile();
                diagnoseFile();                            // ← changed
            } else if (activeTabPath.endsWith(".nc")) {   // ← new
                analyzeFile();                              // ← new
            }                                                // ← new
        })
        .catch((error) => {
            document.getElementById("save-status").textContent = "Could not save.";
        });
}
```

Everything else in `saveFile` — the guard clause, the `fetch` itself, the
`activeTab.content` update, the `"Saved."` message, the `.catch` — is
exactly as Lesson 9 left it. Saving a `.py` file now still triggers
`diagnoseFile()`, saving a `.nc` file now correctly triggers
`analyzeFile()` instead, and saving anything else — `README.md`, for
instance — triggers neither, leaving both panels exactly as they already
were rather than reporting a confusing, meaningless error.

### Mechanical Walkthrough

`activeTabPath.endsWith(".py")` reuses `.endsWith()` from Lesson 10,
here checking the currently-active tab rather than gating a button
click. `else if (activeTabPath.endsWith(".nc"))` is this lesson's own
concept lab, for real: a second condition, tried only if the first one
was `false`. `diagnoseFile()` and `analyzeFile()` are both ordinary
function calls, reused unchanged from Lessons 9 and 12/13.

One detail worth naming directly: `saveFile` (defined near the top of
this project's `<script>` block, since Lesson 3) calls `analyzeFile`
(defined much further down, since Lesson 12) — a function this project's
source-code *order* hasn't even reached yet by the time `saveFile` is
written. This works because both are declared with `function name() {
... }` — a **function declaration** — and JavaScript makes every
function declaration in a script available throughout that entire
script before any of it runs, regardless of which line it's physically
written on. This is different from a value like `let authToken = null;`,
which genuinely isn't usable before its own line executes.

### CS Lens — the same silent-failure shape, a third time

This bug produced no crash, no exception, no automated test failure —
the exact same category as `.git` appearing in the file list (Lesson 8)
and the false-positive modal-group check (Lesson 12): code that runs
exactly as written, and is simply answering a question nobody actually
asked. `data.ok` being `undefined` instead of `true` or `false` is not a
type Python's `None`-checking conventions would let slip past quietly —
but JavaScript's `+` operator concatenating `undefined` into a string
without complaint is precisely the kind of permissive default that lets
a wrong answer look like a normal one, if nothing explicitly checks for
it first.

### Run It

The backend half of this was confirmed directly against the real running
server, in this lesson's very first unit and in Lessons 9/12: `/diagnose`
correctly rejects `.nc` files, `/analyze` correctly rejects `.py` files.
This lesson's fix is entirely about *which* of those two already-correct
routes the frontend now chooses to call — a decision made in the browser,
not something a terminal request can exercise on its own. Tracing the
logic rather than asserting it was watched happen: saving a `.py` file
makes `activeTabPath.endsWith(".py")` true, so `diagnoseFile()` runs and
`analyzeFile()` doesn't; saving a `.nc` file makes the first check false
and the second true, so only `analyzeFile()` runs; saving anything else
makes both false, so neither runs and both panels stay exactly as they
were. Actually clicking Save on a real `.py` tab and a real `.nc` tab and
watching only the matching panel update is this lesson's first exercise,
not something claimed here as already witnessed.

---

## Connect the pieces

Saving `src/sample.nc` through the running app: `saveFile()` sends `PUT
/file`, exactly as it has since Lesson 3, and its success callback now
asks a real three-way question instead of blindly calling
`diagnoseFile()`. `activeTabPath.endsWith(".py")` is `false` — this is a
`.nc` file — so the first branch is skipped entirely; `activeTabPath.endsWith(".nc")`
is `true`, so `analyzeFile()` runs instead, sending `POST /analyze`, the
correct route for this file, built in Lesson 12 specifically to
understand it. `#diagnostics-output`, meanwhile, is never touched at
all — no confusing `"Line undefined: undefined"` message, because the
one line of code capable of producing it never runs against a file it
was never meant to check.

## What breaks without this

Already demonstrated concretely above, not hypothetically: `POST
/diagnose` against any real `.nc` file returns `400 {"detail":"Only .py
files can be diagnosed"}`, confirmed directly — and `diagnoseFile`'s own
existing code, run against that exact response shape, produces the
literal text `"Line undefined: undefined"`, styled as a real error,
every time a G-code file was saved from Lesson 10 onward until this
lesson's fix.

## Exercises

1. Open `src/sample.nc` through the running app, edit it, and save —
   confirm the Analyze panel updates and the Problems panel stays blank,
   not `"Line undefined: undefined"`.
2. Open `src/main.py`, edit it, and save — confirm the reverse: the
   Problems panel updates and the Analyze panel stays untouched.
3. Open `content/README.md` (not `.py`, not `.nc`), save it, and confirm
   neither panel changes at all.
4. In the concept lab, add a fourth extension case, `.md`, returning
   `"Markdown"` — predict where in the chain it needs to go before
   running it.

## Definition of done

- [ ] You've reproduced the original bug's *cause* by reading
      `diagnoseFile`'s code against a `{"detail": ...}` response, without
      needing to see it happen live
- [ ] You've saved both a `.py` and a `.nc` file through the real app and
      confirmed each triggers only its own correct check
- [ ] You can explain why this bug never crashed, never appeared in a
      console error, and could easily have shipped unnoticed
- [ ] You can explain why `saveFile` calling `analyzeFile`, defined later
      in the same file, still works
- [ ] `git commit` this lesson's code with a message explaining why
