# Lesson 5: A Boundary Between Two Programs That Don't Trust Each Other

## What you will build

A `POST /run` route that executes a `.py` file and returns what it
printed. The feature is "click Run, see output" — the actual subject is
what it means to let one program execute code chosen by another, and the
whole spectrum of engineering techniques — from "do nothing" to
containers to virtual machines — that exists because that trust problem
never fully goes away, only gets narrowed.

## What you need to know first

`Lesson 3 - Viewing, Editing, and Saving a File.md` — `try`/`except`,
`HTTPException`, `@app.put`. `Lesson 2`'s traversal check, reused
unchanged here.

**This lesson was built under explicit review.** Code execution is the
single highest-risk feature in this project — running arbitrary code is
never a small decision — and it was scoped deliberately narrow (localhost
only, one language, process-isolated, time-limited) and verified against
a real runaway-loop test before being confirmed, not shipped first and
questioned later.

---

## Concept Unit: running one program from inside another

### The Problem

`read_file` can show you what's *in* a `.py` file. Nothing so far can
*execute* it. Python has no built-in way to safely run another program
and get its output back as a value — this is a genuinely new kind of
operation, not a variation on file I/O.

### Concept Lab

```python
import subprocess

result = subprocess.run(
    ["python", "-c", "print('hello from a child process')"],
    capture_output=True,
    text=True,
)
print(result.stdout)
print(result.returncode)
```

Run it. It prints:

```
hello from a child process

0
```

### What This Proves

`subprocess.run(...)` starts a genuinely separate operating-system
process — not a function call, not a thread, a whole new program with
its own memory — runs it to completion, and returns a `CompletedProcess`
object once it's done. The list `["python", "-c", "..."]` is the command
line to run, broken into separate arguments exactly the way a shell would
split them. `capture_output=True` redirects the child process's output
into that returned object instead of letting it print directly to this
program's own terminal; `text=True` decodes it as a string instead of
raw bytes. `result.stdout` holds what the child printed;
`result.returncode` holds its exit code — `0` here, the conventional
"succeeded" value.

Now vary it — a script that never finishes on its own:

```python
import subprocess

try:
    subprocess.run(["python", "-c", "while True: pass"], timeout=2)
except subprocess.TimeoutExpired:
    print("caught the timeout")
```

Run it. After roughly two seconds: `caught the timeout`.

`timeout=2` tells `subprocess.run` to stop waiting after two seconds and
forcibly end the child process if it hasn't finished — raising
`subprocess.TimeoutExpired` instead of hanging forever. Without it, the
infinite loop above would never return control to this program at all.

### Discard

This code is deleted now — it never appears in the project. The real
route below runs a file already saved to disk instead of an inline `-c`
string, and turns a caught timeout into an HTTP response instead of a
`print`.

---

## Concept Unit: a route that performs an action instead of returning a resource

### The Problem

Every route so far either reads something (`GET`) or replaces something
(`PUT`). Running a file doesn't fit either — it's not fetching a
resource's current state, and calling it twice doesn't produce the same
*state*, it produces the program running twice.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — `import subprocess` added at the very top, above the
  existing `from pathlib import Path`; a new `@app.post("/run")` route
  added after `write_file`.
- **Dependencies** — `subprocess` is part of Python's standard library —
  nothing to install.

### The New Code — type this

```python
@app.post("/run")
def run_file(path: str = ""):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    if target_file.suffix != ".py":
        raise HTTPException(status_code=400, detail="Only .py files can be run")
```

### The Updated Project — where this lives

The new import lands at the top; `run_file` lands at the bottom, after
`write_file`. Here is the complete file as it exists after this unit,
every line, nothing skipped:

```python
import subprocess          # ← new
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()


class FileEdit(BaseModel):
    content: str

CONTENT_DIR = (Path(__file__).parent / "content").resolve()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/files")
def list_files(path: str = ""):
    target_dir = (CONTENT_DIR / path).resolve()

    if not target_dir.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_dir.is_dir():
        raise HTTPException(status_code=404, detail="Folder not found")

    entries = []
    for entry in sorted(target_dir.iterdir()):
        entries.append({
            "name": entry.name,
            "is_directory": entry.is_dir(),
        })
    return {"path": path, "entries": entries}


@app.get("/file")
def read_file(path: str = ""):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    try:
        content = target_file.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File is not readable as text")

    return {"path": path, "content": content}


@app.put("/file")
def write_file(path: str, edit: FileEdit):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    target_file.write_text(edit.content, encoding="utf-8")
    return {"path": path, "saved": True}


@app.post("/run")                                                    # ← new
def run_file(path: str = ""):                                        # ← new
    target_file = (CONTENT_DIR / path).resolve()                     # ← new

    if not target_file.is_relative_to(CONTENT_DIR):                  # ← new
        raise HTTPException(status_code=400, detail="Invalid path")   # ← new

    if not target_file.is_file():                                    # ← new
        raise HTTPException(status_code=404, detail="File not found")  # ← new

    if target_file.suffix != ".py":                                   # ← new
        raise HTTPException(status_code=400, detail="Only .py files can be run")  # ← new
```

`FileEdit`, `CONTENT_DIR`, `app.add_middleware`, `health_check`,
`list_files`, `read_file`, and `write_file` are exactly what Lessons 1
through 3 already left in place — shown here in full because this is
the real state of the file, not because any of it changed again. This
is a new route, but the first three checks inside it are not new
*logic* —
they're the identical traversal and existence checks from `read_file` and
`write_file`, copy-pasted again (a cost already named honestly back in
Lesson 2). The one genuinely new check, `target_file.suffix != ".py"`,
narrows this specific route further than any before it: not just "a real
file inside the sandbox," but "a Python file specifically" — this route
doesn't yet actually run anything; that's the next unit.

### Mechanical Walkthrough

`@app.post("/run")` is the first route in this project using `POST`.
`target_file.suffix` is a `Path` property giving the file's extension
including the dot (`".py"`), comparable directly as a string.

### CS Lens — why POST, specifically

`GET` (read-only, no side effects) and `PUT` (replace, idempotent —
Lesson 3) both describe *state*. `POST`, by long-standing HTTP
convention, means "perform an action" — and actions are not generally
idempotent: calling this route twice doesn't leave the same state behind
the way `PUT`-ing the same content twice does, it runs the program twice,
with whatever side effects that has. Choosing `POST` here is a direct,
correct application of what these methods are conventionally understood
to mean, not an arbitrary pick.

---

## Concept Unit: actually running it, and getting output back safely

### The Problem

The checks above only confirm a `.py` file exists and is safe to *touch*
— nothing yet executes it or bounds how long that's allowed to take.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — continues directly inside `run_file`, after the
  extension check from the previous unit.
- **Dependencies** — the concept lab above.

### The New Code — type this

```python
try:
    result = subprocess.run(
        ["python", str(target_file)],
        capture_output=True,
        text=True,
        timeout=5,
        cwd=CONTENT_DIR,
    )
except subprocess.TimeoutExpired:
    raise HTTPException(status_code=408, detail="Execution timed out")

return {
    "stdout": result.stdout,
    "stderr": result.stderr,
    "exit_code": result.returncode,
}
```

### The Updated Project — where this lives

Now see it in place:

```python
@app.post("/run")
def run_file(path: str = ""):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    if target_file.suffix != ".py":
        raise HTTPException(status_code=400, detail="Only .py files can be run")

    try:                                                              # ← new
        result = subprocess.run(                                      # ← new
            ["python", str(target_file)],                              # ← new
            capture_output=True,                                       # ← new
            text=True,                                                 # ← new
            timeout=5,                                                 # ← new
            cwd=CONTENT_DIR,                                           # ← new
        )                                                               # ← new
    except subprocess.TimeoutExpired:                                  # ← new
        raise HTTPException(status_code=408, detail="Execution timed out")  # ← new

    return {                                                           # ← new
        "stdout": result.stdout,                                       # ← new
        "stderr": result.stderr,                                       # ← new
        "exit_code": result.returncode,                                # ← new
    }                                                                   # ← new
```

`run_file` is now complete: refuse anything unsafe or non-Python, run
what's left as an isolated child process capped at five real seconds,
and return exactly what it printed, what errors it raised, and how it
exited.

### Mechanical Walkthrough
- `["python", str(target_file)]` — this is the same shape as the concept
lab, except running a real file path instead of an inline `-c` string.
`str(target_file)` converts the `Path` object built at the top of this
- function back into a plain string — `subprocess.run`'s argument list
needs actual strings to hand to the operating system, not `Path`
objects, which exist purely for this project's own path manipulation.
- `timeout=5` is the concept lab's timeout, real this time — long enough
for a genuine short script, short enough that a runaway loop can't hang
the request indefinitely. `cwd=CONTENT_DIR` sets the child process's
working directory, so a script using relative paths of its own resolves
them against the content folder, not wherever the server happened to be
started from. The `try`/`except` around it is the exact shape from
- Lesson 3's `read_file` — `except TimeoutExpired` in place of
`UnicodeDecodeError`, `raise HTTPException(status_code=408, ...)` in
- place of `400`.
- `408` is the HTTP status for "the client took too long" —
a distinct, correct code for a distinct failure, the same way `400` and
`404` were kept distinct back in Lesson 2.

### CS Lens — process isolation as a trust boundary

Running code with Python's `exec()` **inside this same process** was a
real alternative, and a meaningfully worse one: `exec()` runs in the
*same* memory space as the server itself, meaning executed code could
read or corrupt the server's own variables, and an infinite loop inside
`exec()` would freeze request-handling for every other user of this
server, permanently. `subprocess.run` starts a **separate operating-system
process** — its own memory, its own crash domain. A bug or an infinite
loop in the executed code can, at worst, hang *that one process*, which
the `timeout` then forcibly ends; it cannot directly corrupt this
server's own memory or freeze it from responding to other requests.

### SE Lens — this is a boundary, not a solved problem

Stated honestly, not overclaimed: this route is meaningfully safer than
running code in-process, and it is **not** a sandbox. The child process
still runs as this project's own operating-system user — it can read or
write anywhere that user account can reach, and nothing here restricts
network access. The `timeout` bounds wall-clock time only; nothing here
limits memory or CPU usage within those five seconds. This is one narrow
point on a real, much larger spectrum of isolation techniques used in
production systems, roughly increasing in strength and cost: no isolation
(the `exec()` alternative just rejected) → a separate OS process (this
lesson) → a restricted OS user account with reduced filesystem/network
permissions → a container (Docker — process *and* filesystem *and*
network isolation, still sharing the host's kernel) → a full virtual
machine (the strongest common isolation, an entire separate operating
system). This project deliberately stops at "separate process, time-limited,
localhost only" for now — real, useful, honestly incomplete — and the
BRD names authentication and stronger sandboxing as required *before*
this route is ever reachable from anywhere but this machine.

### Run It

```
POST /run?path=src/main.py         → 200 {"stdout":"Hello from the sample project.\n","stderr":"","exit_code":0}
POST /run?path=../main.py          → 400 {"detail":"Invalid path"}
POST /run?path=README.md           → 400 {"detail":"Only .py files can be run"}
POST /run?path=src/infinite_loop.py → 408 {"detail":"Execution timed out"}, confirmed at 5.03 real seconds elapsed
```

All four confirmed directly, including timing the fourth one with a
stopwatch — the server itself stayed responsive to the other three
requests throughout, proof the timeout and process isolation both
actually work, not just that the code compiles.

---

## Concept Unit: a button that triggers an action, not a fetch

### The Problem

The frontend needs a way to trigger this route and show whatever comes
back, styled differently depending on whether it succeeded.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add. A new Run button and `#run-output` element in
  the editor pane; two new CSS rules; a new `runFile` function and its
  `click` listener; two new lines inside `renderEditor` (Lesson 4),
  which — like every earlier tab — needs to clear the *previous* tab's
  run output when switching, or a stale result from one file would
  still be showing after opening a different one.
- **Location** — the Run button sits next to Save; `#run-output` sits
  directly below that row; `runFile` is added near `saveFile`; the two
  new lines inside `renderEditor` go alongside its existing
  `save-status` clearing.
- **Dependencies** — the `/run` route above, `activeTabPath` and
  `renderEditor` from Lesson 4.

### The New Code — type this

The button and its output panel:

```html
<button id="run-button">Run</button>
<div id="run-output"></div>
```

Styled the same way `#file-content` was in Lesson 3 — monospace, sized,
padded — plus a distinct error color:

```css
#run-output {
    width: 100%;
    height: 120px;
    box-sizing: border-box;
    font-family: monospace;
    font-size: 13px;
    padding: 8px;
    background-color: #111;
    color: #ddd;
    white-space: pre-wrap;
    overflow: auto;
}
#run-output.has-error {
    color: #f88;
}
```

`renderEditor` (Lesson 4) needs two more lines, clearing this new panel
exactly the way it already clears `save-status`:

```javascript
document.getElementById("run-output").textContent = "";
document.getElementById("run-output").className = "";
```

And the fetch itself:

```javascript
fetch("http://127.0.0.1:8000/run?path=" + encodeURIComponent(activeTabPath), {
    method: "POST",
})
    .then((response) => response.json())
    .then((data) => {
        if (data.stderr) {
            outputElement.className = "has-error";
            outputElement.textContent = data.stderr;
        } else {
            outputElement.className = "";
            outputElement.textContent = data.stdout || "(no output)";
        }
    });
```

### The Updated Project — where this lives

The button and output panel join Lesson 4's Save button row inside
`#editor-pane`:

```html
<div id="editor-pane" style="display: none;">
    <textarea id="file-content"></textarea>
    <div>
        <button id="save-button">Save</button>
        <button id="run-button">Run</button>            <!-- ← new -->
        <span id="save-status"></span>
    </div>
    <div id="run-output"></div>                          <!-- ← new -->
</div>
```

`renderEditor` (Lesson 4) gains two lines, clearing the new panel the
same moment it already clears `save-status`:

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
    document.getElementById("run-output").textContent = "";  // ← new
    document.getElementById("run-output").className = "";    // ← new
}
```

Without these two lines, switching from a file that just printed a
real error to a brand-new tab would still show that error — `runFile`
only ever writes to `#run-output`, so nothing else would clear it.

`runFile` is a complete, freestanding new function — none of it existed
before this unit. The `← new` markers below are narrower than that,
though: they flag only the `fetch` chain, since the guard clause, the
`outputElement` setup, and the `.catch()` block are typed here for the
first time but aren't *conceptually* new — each line reuses a shape
`saveFile` (Lesson 3/4) already established, called out below the code.
Now see the whole function in place:

```javascript
function runFile() {
    if (activeTabPath === null) {
        return;
    }

    const outputElement = document.getElementById("run-output");
    outputElement.className = "";
    outputElement.textContent = "Running...";

    fetch("http://127.0.0.1:8000/run?path=" + encodeURIComponent(activeTabPath), {  // ← new
        method: "POST",                                                              // ← new
    })                                                                                 // ← new
        .then((response) => response.json())                                          // ← new
        .then((data) => {                                                              // ← new
            if (data.stderr) {                                                          // ← new
                outputElement.className = "has-error";                                  // ← new
                outputElement.textContent = data.stderr;                                 // ← new
            } else {                                                                      // ← new
                outputElement.className = "";                                             // ← new
                outputElement.textContent = data.stdout || "(no output)";                 // ← new
            }                                                                              // ← new
        })                                                                                 // ← new
        .catch((error) => {
            outputElement.className = "has-error";
            outputElement.textContent = "Could not reach backend.";
        });
}

document.getElementById("run-button").addEventListener("click", runFile);
```

`runFile` mirrors `saveFile`'s overall shape — guard on `activeTabPath`,
`fetch` with a `method` override, handle the result — but this `fetch`
has no `body` and no `Content-Type` header, because there's nothing to
send; `path` in the URL's query string is the entire request.

### Mechanical Walkthrough
`data.stdout || "(no output)"` uses `||` ("or") to fall back to a literal
- string when `data.stdout` is falsy — an empty string counts as falsy in
JavaScript, so a script that printed nothing shows `"(no output)"`
instead of a blank panel that looks broken. `outputElement.className =
"has-error"` toggles the CSS class from Lesson 2's className-based
approach, switching the panel's text color when `stderr` isn't empty.

---

## Connect the pieces

Click Run on the currently open `src/main.py` tab: `runFile()` reads
`activeTabPath`, sets the output panel to `"Running..."`, and sends
`POST /run?path=src/main.py`. On the backend, `run_file` resolves and
verifies the path with the same checks every file route in this project
- shares, confirms the `.py` extension, then calls `subprocess.run` — a
genuinely separate operating-system process starts, runs
`src/main.py` to completion (or is killed at the five-second mark),
and its stdout, stderr, and exit code are captured back into this
process. `{"stdout": "...", "stderr": "", "exit_code": 0}` returns; the
frontend sees an empty `stderr` and displays `stdout` in the normal
(non-error) style.

## What breaks without this

Already demonstrated concretely, not hypothetically: without the
- `timeout`, `src/infinite_loop.py` would never return at all — the
request would hang indefinitely, and (without process isolation on top
of that) could take the entire server down with it. With process
isolation but no timeout, the request still hangs forever even though the
server itself survives. Only both together — the actual code shipped
here, confirmed at 5.03 real seconds — produce the correct outcome:
a bounded failure, reported cleanly.

## Exercises

1. Run `src/infinite_loop.py` yourself through the running app and watch
   the output panel go from "Running..." to a timeout message after five
   seconds.
2. Write a `.py` file that raises an uncaught exception (e.g.
- `raise ValueError("test")`) and run it — confirm `stderr` is non-empty
   and the output panel switches to the error style.
3. In the concept lab, change the timeout to `0.001` seconds against a
   script that just prints one line with no delay — predict whether it
   still times out before running it.

## Definition of done

- [ ] You've run a real script through the app and seen its actual output
- [ ] You've triggered the timeout yourself and watched it resolve in
      close to five real seconds, not instantly and not never
- [ ] You can explain why `subprocess.run` is meaningfully safer than
      `exec()`, in terms of what a bug in the executed code can and
      cannot reach
- [ ] You can name at least two isolation techniques stronger than what
      this lesson built, and roughly where a container sits among them
- [ ] You can explain why this route uses `POST`, not `GET` or `PUT`
- [ ] `git commit` this lesson's code with a message explaining why
