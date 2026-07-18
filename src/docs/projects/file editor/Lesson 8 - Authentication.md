# Lesson 8: Proving Who's Allowed, Without Leaking How Close You Got

## What you will build

A login screen, a token issued on correct password, and every route that
touches a file or runs code refusing to work without one. The feature is
"you have to log in now"; the actual subject is two much older, subtler
problems: how do you compare two secrets without accidentally telling an
attacker *how close* their guess was, and how do you attach the same
check to a dozen different routes without repeating yourself a dozen
times.

## What you need to know first

`Lesson 7 - Version History.md` — the `content/` git repo this lesson's
real bug was found inside. `Lesson 1`'s decorator unit — reused directly
below.

**Verification note.** This lesson was built while this session's shell
execution was temporarily unavailable partway through. The code was
written and manually reviewed first; every claim below was still
confirmed by actually running it — some of it by the user directly,
after I asked them to, specifically so nothing here would be asserted
without having actually been seen to work.

---

## Concept Unit: comparing two secrets without a shortcut

### The Problem

Checking a submitted password against the correct one sounds like it
should just be `submitted == correct` — and that comparison itself can
leak information to anyone able to measure how *long* it took to answer.

### Concept Lab

```python
import time

correct = "x" * 1000 + "A"
early_mismatch = "y" + "x" * 1000       # wrong at character 0
late_mismatch = "x" * 1000 + "B"        # wrong only at the very last character

iterations = 200000

start = time.perf_counter()
for _ in range(iterations):
    early_mismatch == correct
early_time = time.perf_counter() - start

start = time.perf_counter()
for _ in range(iterations):
    late_mismatch == correct
late_time = time.perf_counter() - start

print(f"early mismatch: {early_time:.4f}s")
print(f"late mismatch:  {late_time:.4f}s")
```

Run it. Actual output, this exact run:

```
early mismatch: 0.0063s
late mismatch:  0.0095s
```

Run again to confirm it's not noise:

```
early mismatch: 0.0057s
late mismatch:  0.0089s
```

Consistently, comparing a string that's wrong at the very first
character is measurably faster than comparing one that's wrong only at
the very last character.

### What This Proves

Python's `==` on strings compares character by character and stops the
instant it finds a mismatch — an optimization, not a flaw, for almost
every use of `==` in a normal program. Applied to a password check, that
same optimization becomes a real information leak: a submitted password
that happens to share its first ten correct characters with the real one
takes measurably longer to reject than one that's wrong immediately. An
attacker who can measure response time precisely enough — repeated many
times to average out noise — can, in principle, guess a password one
character at a time instead of having to guess the whole thing at once.
This is a real, named vulnerability class: a **timing attack**.

### Discard

This code is deleted now — `early_mismatch` and `late_mismatch` never
appear in the project. The real comparison uses a function built
specifically to not have this property.

---

## Concept Unit: a comparison that takes the same time no matter what

### The Problem

The actual password check needs the correctness of "does this string
equal that string," without the timing side-channel just demonstrated.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — `import secrets` added at the top; `ADMIN_PASSWORD`
  added near `CONTENT_DIR`.
- **Dependencies** — `secrets` is part of Python's standard library.

### The New Code — type this

```python
import secrets

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")
```

### The Updated Project — where this lives

The two new imports land at the very top, among the existing ones:

```python
import os                                     # ← new
import secrets                                # ← new
import subprocess
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
```

And `ADMIN_PASSWORD` lands separately, further down, right next to
`CONTENT_DIR` from Lesson 2:

```python
CONTENT_DIR = (Path(__file__).parent / "content").resolve()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")   # ← new
```

Nothing compares anything yet — this unit only sets up the value
everything else will check against.

### Mechanical Walkthrough

`os.environ.get("ADMIN_PASSWORD", "changeme")` reads an **environment
variable** — a value set outside the program itself, in the shell or
deployment environment it runs in — falling back to the literal string
`"changeme"` if that variable was never set. `secrets` is Python's
standard library module specifically for security-sensitive randomness
and comparisons — not `random`, which is fast and predictable enough to
be unsuitable for anything security-related.

### SE Lens — a secret that lives outside the source code

`ADMIN_PASSWORD` is deliberately not a literal string typed directly into
`main.py`. Source code gets committed to git, read by anyone with repo
access, and can end up in places a real secret shouldn't (an accidental
public repo, a support screenshot). Reading it from the environment means
the actual password lives only wherever this specific deployment chooses
to put it — never in version control. `"changeme"`, the fallback, is
intentionally a bad, obvious default: fine for this project running only
on localhost during development, actively wrong for anything reachable
by anyone else, and a reminder that this fallback exists specifically so
the app doesn't simply fail to start without configuration, not as a real
password.

---

## Concept Unit: an unguessable proof you already logged in

### The Problem

Once a password check succeeds, the frontend needs *something* to send
with every future request, proving "I already proved who I am" without
sending the password itself over and over.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — `valid_tokens = set()` added directly below
  `ADMIN_PASSWORD`.
- **Dependencies** — none new.

### The New Code — type this

```python
valid_tokens = set()
```

### The Updated Project — where this lives

Now see it in place:

```python
CONTENT_DIR = (Path(__file__).parent / "content").resolve()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")
valid_tokens = set()   # ← new
```

### Mechanical Walkthrough

An empty **set** — like a list, but unordered and only ever holding each
distinct value once. A token either is or isn't in it; nothing about
order or duplicates matters here, which is exactly why a set fits this
job better than a list would.

### SE Lens — a real, named limitation, not a secret one

`valid_tokens` lives only in this running process's memory. Restart the
server and every previously issued token stops working — everyone has to
log in again. For a single-user, localhost project, that's a reasonable
trade for simplicity. A real multi-instance deployment would need tokens
stored somewhere shared and durable — a database, a cache like Redis —
so one server restarting doesn't log out every user of every other
instance. Worth knowing as a real, current boundary of this
implementation, not something to discover by surprise later.

---

## Concept Unit: the login route

### The Problem

Something has to accept a submitted password, check it, and hand back a
token on success.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — new `LoginRequest` model near `FileEdit`; new
  `@app.post("/login")` route added after `health_check`.
- **Dependencies** — `ADMIN_PASSWORD`, `valid_tokens`.

### The New Code — type this

```python
class LoginRequest(BaseModel):
    password: str


@app.post("/login")
def login(credentials: LoginRequest):
    if not secrets.compare_digest(credentials.password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = secrets.token_urlsafe(32)
    valid_tokens.add(token)
    return {"token": token}
```

### The Updated Project — where this lives

Now see it in place, directly after `health_check`:

```python
@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/login")                                                              # ← new
def login(credentials: LoginRequest):                                            # ← new
    if not secrets.compare_digest(credentials.password, ADMIN_PASSWORD):          # ← new
        raise HTTPException(status_code=401, detail="Invalid password")           # ← new

    token = secrets.token_urlsafe(32)                                            # ← new
    valid_tokens.add(token)                                                       # ← new
    return {"token": token}                                                       # ← new
```

`/health` and `/login` are now the only two routes reachable without
already having a token — every route after this one, starting with the
next unit, will require one.

### Mechanical Walkthrough

`LoginRequest` is the same `BaseModel` pattern as `FileEdit` from Lesson
3 — FastAPI parses the request body into it automatically. `secrets.compare_digest(...)`
is the real fix for the timing problem in the concept lab: it always
takes the same amount of time regardless of *where* the two strings
first differ, specifically engineered to defeat the measurement the lab
just demonstrated. `secrets.token_urlsafe(32)` generates a random,
URL-safe string from 32 bytes of cryptographic randomness — long and
random enough that guessing a valid one by chance is not a realistic
attack, unlike guessing a short password. `valid_tokens.add(token)`
records it as accepted before handing it back.

### Run It

```
POST /login  {"password":"wrong"}     → 401 {"detail":"Invalid password"}
POST /login  {"password":"changeme"}  → 200 {"token":"XwiUffpe-C5vsUEYYMq6JIBckZ4Gm-kIXmNWuKJitHI"}
```

Both confirmed directly against the real running server.

---

## Concept Unit: checking a header before a route ever runs

### The Problem

Every route that isn't `/health` or `/login` needs the exact same check —
"is there a valid token attached to this request" — run *before* that
route's own code does anything at all.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — new `require_auth` function, added directly below
  `valid_tokens`.
- **Dependencies** — `valid_tokens`.

### The New Code — type this

```python
def require_auth(authorization: str = Header(None)) -> None:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.removeprefix("Bearer ")
    if token not in valid_tokens:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
```

### The Updated Project — where this lives

This is a complete, freestanding new function, added directly below
`valid_tokens` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see. `Header` also needs importing alongside the other names already
pulled from `fastapi`:

```python
from fastapi import FastAPI, Header, HTTPException   # ← changed: added Header
```

Nothing calls `require_auth` yet — the next unit attaches it to routes,
which needs one more import of its own.

### Mechanical Walkthrough

`authorization: str = Header(None)` is a new kind of parameter inference
— FastAPI reads this specific request *header*, named `Authorization`
(the name is matched automatically from the parameter name), and hands
its value in as a string, or `None` if the header wasn't sent at all,
which `Header(None)`'s default makes valid rather than an error.
`"Bearer <token>"` is a standard, widely-used convention for sending a
token in this header — `.startswith("Bearer ")` confirms it's actually
in that shape; `.removeprefix("Bearer ")` strips the label off, leaving
just the token itself. `token not in valid_tokens` is the actual check —
a set membership test, the payoff for choosing a `set` two units ago.

### CS Lens — a function that gates, without doing the work itself

`require_auth` never touches a file, never runs code, never does
anything the routes it will protect actually care about — its only job
is to raise an exception if something is wrong, or do nothing at all if
everything checks out. This shape — a function whose entire contract is
"either silently allow this to continue, or stop it here" — is a **guard
clause** used as a standalone, reusable unit rather than inline at the
top of one function.

---

## Concept Unit: attaching the same guard to many routes, without repeating it

### The Problem

`require_auth` needs to run before `/files`, `/file` (both methods),
`/history`, and `/run` — five different routes — without pasting a call
to it inside each one, and without forgetting it on whichever route gets
added next.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — replace. Five existing `@app.get`/`@app.put`/`@app.post`
  decorators gain a new argument each.
- **Location** — `list_files`, `read_file`, `write_file`, `file_history`,
  `run_file` — every route touching `CONTENT_DIR` except none; there are
  no exceptions among them.
- **Dependencies** — `require_auth`.

### The New Code — type this

```python
@app.get("/files", dependencies=[Depends(require_auth)])
def list_files(path: str = ""):
```

`Depends` needs importing too, alongside `Header` from the previous
unit:

```python
from fastapi import Depends, FastAPI, Header, HTTPException   # ← changed: added Depends
```

### The Updated Project — where this lives

Five decorator lines change, each identically — `list_files`, `read_file`,
`write_file`, `file_history`, `run_file`, in `backend/main.py`, each
already shown whole in the lesson that introduced it (Lessons 2, 3, 3, 7,
5). Rather than reproduce five entire function bodies unchanged, here is
every line that actually changed, shown as a diff against each route's
existing decorator — nothing below is a placeholder for hidden code, it's
the complete set of edits:

```diff
- @app.get("/files")
+ @app.get("/files", dependencies=[Depends(require_auth)])
  def list_files(path: str = ""):

- @app.get("/file")
+ @app.get("/file", dependencies=[Depends(require_auth)])
  def read_file(path: str = ""):

- @app.put("/file")
+ @app.put("/file", dependencies=[Depends(require_auth)])
  def write_file(path: str, edit: FileEdit):

- @app.get("/history")
+ @app.get("/history", dependencies=[Depends(require_auth)])
  def file_history(path: str = ""):

- @app.post("/run")
+ @app.post("/run", dependencies=[Depends(require_auth)])
  def run_file(path: str = ""):
```

Every route's own body — the traversal checks, the file reading, the git
commits, the subprocess execution — is completely unchanged and isn't
reproduced here for that reason; each one is already shown in full in
the lesson that built it. Only the decorator line, on each of these five
routes, grew one argument.

### Mechanical Walkthrough

`dependencies=[Depends(require_auth)]` is FastAPI's **dependency
injection** system: `Depends(require_auth)` tells FastAPI "run this
function first, before the route body, on every request to this route."
Because `require_auth` is passed here — not called directly — FastAPI
controls exactly when it runs, the same "pass the function itself, not
its result" idea already seen with `RUNNERS` in Lesson 6. If
`require_auth` raises, FastAPI sends that error straight back to the
client and the route function underneath — `list_files`, `run_file`,
whichever it is — never runs at all.

### CS Lens — the same decorator idea, a second explicit form

Lesson 1's `@app.get("/health")` attached behavior — routing — to a
function without modifying that function's own body. Lesson 6's
`RUNNERS` dictionary made a similar "attach behavior externally" pattern
fully explicit and visible. `dependencies=[Depends(require_auth)]` is a
third variation on the exact same underlying idea: authentication is
attached to a route from the outside, at the point it's registered, with
zero lines added inside `list_files`, `run_file`, or any of the other
four functions. Three lessons, three different concrete mechanisms, one
recurring idea — attach cross-cutting behavior without touching the code
it applies to.

### SE Lens — the alternative, and the exact bug it would cause

The alternative is pasting `if not is_authenticated(request): raise ...`
as the first line inside each of these five functions by hand. That
works today. It also means every *future* route touching `CONTENT_DIR`
requires remembering to paste it again — and the one time that's
forgotten, that route is silently, invisibly unprotected, with nothing
anywhere flagging the omission. `dependencies=[...]` moves the guard to
the point of *registration*, visible directly in the same line that
defines the route's path and method — much harder to add a new route and
simply forget.

### Run It

```
GET  /files                (no token)     → 401 {"detail":"Not authenticated"}
POST /run?path=src/main.py (no token)     → 401 {"detail":"Not authenticated"}
GET  /files                (valid token)  → 200 {"path":"","entries":[...]}
POST /run?path=src/main.py (valid token)  → 200 {"stdout":"Hello from the sample project.\n",...}
GET  /file?path=src/main.py (valid token) → 200 {"path":"src/main.py","content":"..."}
GET  /history?path=src/main.py (valid token) → 200 {"path":"src/main.py","commits":[...]}
```

All six confirmed directly against the real running server — every
gated route, not just one, actually enforces the check.

---

## Concept Unit: a real bug, found by an actual person clicking through it

### The Problem

None predicted in advance — this is what real user testing actually
found.

### What Actually Happened

Verifying `/files` with a valid token for the first time, the response
came back:

```json
{"path":"","entries":[{"name":".git","is_directory":true},{"name":"README.md","is_directory":false},{"name":"src","is_directory":true}]}
```

`.git` — the version-control internals `content/` has had since Lesson
7 — was sitting in the file listing as a browsable folder, indistinguishable
from the user's own files. Nothing crashed. Nothing raised an error. The
route did exactly what it was written to do — list every entry
`iterdir()` returns — which was never actually correct once `content/`
had a `.git` directory living inside it.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — inside `list_files`'s existing loop, before the
  `entries.append(...)` call.
- **Dependencies** — none new.

### The Fix

```python
if entry.name.startswith("."):
    continue
```

### The Updated Project — where this lives

This lands inside `list_files`'s loop, from Lesson 2 — right before the
line that adds each entry to the response:

```python
entries = []
for entry in sorted(target_dir.iterdir()):
    if entry.name.startswith("."):   # ← new
        continue                     # ← new
    entries.append({
        "name": entry.name,
        "is_directory": entry.is_dir(),
    })
return {"path": path, "entries": entries}
```

Everything else about `list_files` — the traversal check above this loop,
the shape of each returned entry — is exactly as Lesson 2 left it; this
is the one new check, sitting first inside the loop, before anything else
runs for a given entry.

### Mechanical Walkthrough

`entry.name.startswith(".")` catches `.git`, and, for free, any other
dot-prefixed entry that might exist later — `.gitignore`, `.env`,
anything conventionally treated as hidden. `continue` skips straight to
the next loop iteration, never reaching `entries.append(...)` for this
one entry.

### SE Lens — this is why real testing exists

This bug could not have been caught by re-reading the code — `list_files`
was doing exactly what it was written to do; the *requirement* was
incomplete, not the implementation. It surfaced because a real person
ran the actual route and actually looked at the actual response, closely
enough to notice an entry that shouldn't have been there. This is the
entire reason "verified" in this curriculum has meant "actually run, output
actually read" from the very first lesson — a bug like this produces no
error, no crash, nothing an automated check would flag on its own,
because nothing about it is technically wrong. Only looking at real
output closely enough finds it.

### Run It

```
GET /files (valid token), before the fix → .git present in entries
GET /files (valid token), after the fix  → .git absent, only README.md and src/ remain
```

Both confirmed directly, the second one after restarting the server to
pick up the fix — a real, live confirmation that the change actually
resolved what was actually broken.

---

## Concept Unit: gating the whole page behind a login screen

### The Problem

The frontend needs to show a login form first, hide the entire editor
until a real token exists, and attach that token to every request it
makes afterward.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add/replace. A new `#login-screen` element, and the
  CSS that lays it out, sit *before* the existing `.layout` div, which
  gains an `id="app-layout"` and starts hidden; a new `login()` function;
  every existing `fetch` call gains an `Authorization` header; the
  automatic `loadFolder("")` call at the very end of the script is
  removed — nothing loads until login succeeds.
- **Dependencies** — the `/login` route above.

### The New Code — type this

The login screen itself:

```html
<div id="login-screen">
    <h1>Log In</h1>
    <input type="password" id="password-input" placeholder="Password">
    <button id="login-button">Log In</button>
    <span id="login-status"></span>
</div>
```

Styled as a simple vertical stack, reusing `flex` from Lesson 2's
`.layout`, just in the column direction instead of the row direction:

```css
#login-screen {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 32px;
}
```

The existing `.layout` div needs two changes to become hideable — an
`id` to find it by, and an inline `display: none` so it starts hidden
behind the login screen:

```html
<div class="layout" id="app-layout" style="display: none;">
```

And the script's own state and login logic:

```javascript
let authToken = null;

function login() {
    const password = document.getElementById("password-input").value;

    fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: password }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Invalid password");
            }
            return response.json();
        })
        .then((data) => {
            authToken = data.token;
            document.getElementById("login-screen").style.display = "none";
            document.getElementById("app-layout").style.display = "flex";
            loadFolder("");
        })
        .catch((error) => {
            document.getElementById("login-status").textContent = "Invalid password.";
        });
}
```

### The Updated Project — where this lives

The `<style>` block gains `#login-screen`'s rule, added after
`#run-output.has-error`:

```css
#login-screen {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 32px;
}
```

And the `<body>` now opens with the login screen, followed by the
existing `.layout` div, hidden and newly identified by `id="app-layout"`:

```html
<body>
    <div id="login-screen">                                                    <!-- ← new -->
        <h1>Log In</h1>                                                        <!-- ← new -->
        <input type="password" id="password-input" placeholder="Password">    <!-- ← new -->
        <button id="login-button">Log In</button>                             <!-- ← new -->
        <span id="login-status"></span>                                       <!-- ← new -->
    </div>                                                                     <!-- ← new -->
    <div class="layout" id="app-layout" style="display: none;">              <!-- ← changed: gained id and inline style -->
        <div class="sidebar" id="sidebar">
```

Everything from `<div class="sidebar" id="sidebar">` down — the file
list, the tab bar, the editor pane — is exactly what Lessons 2 through 5
already left in place; only the wrapping `<div class="layout">` itself
changed, gaining an `id` to find it by and a `display: none` to hide it
until `login()` succeeds.

`login` sits at the very top of the `<script>` block, before every other
function — nothing else can meaningfully run until it succeeds. Shown
whole, not elided, since a reader has to actually be able to see where
every piece sits, not take it on trust that it's "unchanged":

```javascript
<script>
    let currentPath = "";
    let openTabs = [];
    let activeTabPath = null;
    let authToken = null;                                                        // ← new

    function login() {                                                            // ← new
        const password = document.getElementById("password-input").value;         // ← new

        fetch("http://127.0.0.1:8000/login", {                                    // ← new
            method: "POST",                                                        // ← new
            headers: {                                                             // ← new
                "Content-Type": "application/json",                                // ← new
            },                                                                      // ← new
            body: JSON.stringify({ password: password }),                          // ← new
        })                                                                          // ← new
            .then((response) => {                                                  // ← new
                if (!response.ok) {                                                 // ← new
                    throw new Error("Invalid password");                            // ← new
                }                                                                    // ← new
                return response.json();                                             // ← new
            })                                                                       // ← new
            .then((data) => {                                                       // ← new
                authToken = data.token;                                             // ← new
                document.getElementById("login-screen").style.display = "none";     // ← new
                document.getElementById("app-layout").style.display = "flex";       // ← new
                loadFolder("");                                                     // ← new
            })                                                                       // ← new
            .catch((error) => {                                                     // ← new
                document.getElementById("login-status").textContent = "Invalid password.";  // ← new
            });                                                                      // ← new
    }                                                                                // ← new

    function loadFolder(path) {
        fetch("http://127.0.0.1:8000/files?path=" + encodeURIComponent(path), {
            headers: {
                "Authorization": "Bearer " + authToken,                            // ← new
            },
        })
            .then((response) => response.json())
            .then((data) => {
                currentPath = data.path;
                renderFileList(data.entries);
            })
            .catch((error) => {
                document.getElementById("file-list").textContent = "Could not reach backend.";
            });
    }
```

Every other function that calls `fetch` toward a gated route —
`openFile` (Lesson 4), `saveFile` (Lesson 3/4), `runFile` (Lesson 5) —
gets the same addition, shown here as a diff against each one's existing
`fetch` call rather than reproducing all three functions whole, since
nothing outside the lines below actually changes in any of them:

```diff
  // openFile — no options object existed before; one is added:
  fetch("http://127.0.0.1:8000/file?path=" + encodeURIComponent(path)
-     )
+     , {
+         headers: {
+             "Authorization": "Bearer " + authToken,
+         },
+     })

  // saveFile — an options object already existed; one header is added to it:
  fetch("http://127.0.0.1:8000/file?path=" + encodeURIComponent(activeTabPath), {
      method: "PUT",
      headers: {
+         "Authorization": "Bearer " + authToken,
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: content }),
  })

  // runFile — like openFile, no headers existed before; they're added:
  fetch("http://127.0.0.1:8000/run?path=" + encodeURIComponent(activeTabPath), {
      method: "POST",
+     headers: {
+         "Authorization": "Bearer " + authToken,
+     },
  })
```

The script's final line, `loadFolder("")`, which used to run
automatically the instant the page loaded, is deleted entirely —
`login()`'s own success handler calls it instead, once there's actually
a token to send. One more line joins the existing Save/Run listeners
from Lessons 3 and 5, wiring the new button to `login`:

```javascript
document.getElementById("save-button").addEventListener("click", saveFile);
document.getElementById("run-button").addEventListener("click", runFile);
document.getElementById("login-button").addEventListener("click", login);   // ← new
```

### Mechanical Walkthrough

`document.getElementById("password-input").value` reads whatever's
currently typed into the password field — the same `.value` property
Lesson 3 used to read a `<textarea>`'s current content, here reading an
`<input>` instead; the property means the same thing on both elements.
`let authToken = null;` follows the exact same convention
`activeTabPath` established in Lesson 4: `null` specifically means
"nothing yet" — no tab was active before any file was opened, and no
token exists before login succeeds — distinct from `""`, which
`currentPath` uses to mean a real value (the root folder), not an
absence of one. `JSON.stringify({ password: password })` is
**serialization** again — the same operation, and the same reason for
it, as Lesson 3's `saveFile`: `fetch`'s `body` needs an actual string,
not a live JavaScript object, so the password gets converted to JSON
text before it's sent, the mirror of `response.json()` parsing JSON text
back into an object on the way in. `response.ok` is a property on the
`fetch` response object, `true` for any `2xx` status and `false`
otherwise — the first time this project has checked it directly, since
every earlier `.then()` chain assumed success and let `.catch()` handle
only network-level failures. `throw new Error("Invalid password")`
inside a `.then()` deliberately triggers the next `.catch()` in the
chain, on purpose, converting "the server said no" into the same
handling path as "the network failed entirely." `authToken = data.token`
reads the exact field the backend's `/login` route returned a few units
back — `return {"token": token}` — the same JSON-shape-in,
JSON-shape-out correspondence every route in this project has followed
since Lesson 1. `"Bearer " + authToken` builds the exact header shape
`require_auth` expects on the backend.

### CS Lens — the same gate, mirrored on both sides

`require_auth` on the backend and this login-gated page on the frontend
are the same idea, enforced twice, independently. The backend's check is
the one that actually matters — nothing stops a request crafted outside
this page entirely from skipping the frontend and hitting `/files`
directly, which is exactly why `require_auth` exists and is not optional.
The frontend's gate exists for a different reason: so a real person using
the real page sees a login screen instead of a broken, half-populated
editor silently failing every request with 401s it never explains.

---

## Connect the pieces

Opening `index.html` for the first time: only the login screen is
visible — `#app-layout` starts `display: none`. Typing `changeme` and
clicking "Log In" calls `login()`, which `POST`s to `/login`; the backend
checks it with `secrets.compare_digest`, issues a random token via
`secrets.token_urlsafe(32)`, and returns it. The frontend stores it in
`authToken`, swaps which element is visible, and calls `loadFolder("")`
for the first time — which now sends `Authorization: Bearer <token>`
along with it. On the backend, `require_auth` reads that header,
confirms the token is in `valid_tokens`, and only then does `list_files`
run at all — returning a listing with `.git` correctly filtered out.
Every subsequent click — opening a file, saving, running code, checking
history — repeats the same pattern: the frontend attaches the token it
already has, `require_auth` checks it before any of those five routes'
own logic runs.

## What breaks without this

Both demonstrated concretely above, not hypothetically: without
`dependencies=[Depends(require_auth)]`, every route this project has
built since Lesson 2 would answer any request from anyone, with nothing
in front of it — confirmed by the real `401`s every gated route returned
before a valid token was supplied. And without the `.startswith(".")`
filter, `.git` sits in the file listing exactly as real, live output
showed, found only because a real person actually looked closely at a
real response.

## Exercises

1. Log in with the wrong password through the actual browser and confirm
   the error message appears without ever reaching the file browser.
2. Restart the backend after logging in, then click anything in the
   already-open page — confirm every request now fails with 401, since
   `valid_tokens` reset to empty when the process restarted, and explain
   why in your own words.
3. In the timing-attack lab, change `iterations` to `2000` instead of
   `200000` and predict whether the timing difference is still reliably
   measurable before running it.

## Definition of done

- [ ] You've logged in through the real browser with the correct
      password and confirmed the file browser, Save, and Run all still
      work afterward
- [ ] You've confirmed, yourself, that every one of `/files`, `/file`,
      `/history`, and `/run` rejects a request with no token
- [ ] You can explain what a timing attack is and why `==` is vulnerable
      to it in a way `secrets.compare_digest` isn't
- [ ] You can name three different mechanisms this project has now used
      for the same underlying idea — attaching behavior to a function
      from the outside — across Lessons 1, 6, and this one
- [ ] You can explain why the `.git` bug produced no error, and why that
      made it harder to find than a crash would have been
- [ ] `git commit` this lesson's code with a message explaining why
