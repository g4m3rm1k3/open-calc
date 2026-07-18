# Lesson 28: Locking It Down in the UI

## What you will build

Check Out and Check In buttons, a status line naming exactly who holds
a file (or that nobody does), and — along the way — a real bug found
and fixed in `saveFile()` itself: the save button has, since Lesson 3,
silently reported "Saved." on every response, success or not. This
lesson closes the loop the last three lessons opened purely on the
backend: a person using this app can now actually see and act on the
lock a file might be under, and a rejected save finally says so.

## What you need to know first

`Lesson 26 - Check In, Check Out.md` and
`Lesson 27 - Two Requests, One Winner.md` — `/checkout`, `/checkin`,
and `write_file`'s `403`/`409` responses, all called from the browser
for the first time in this lesson. `Lesson 19 - Real Logout.md` —
`sessionStorage.setItem`/`.getItem`/`.removeItem`, reused here for a
second stored value. `Lesson 4`'s `.then()` chains and
`authenticatedFetch` (introduced alongside real logout handling).

---

## Concept Unit: a file's own status, returned with its content

### The Problem

`GET /file` (Lesson 3) returns a file's content but says nothing about
whether it's locked — the browser has no way to know, when a file is
first opened, whether someone already holds it.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — replace, `read_file`'s final `return` statement.
- **Location** — `read_file`, the `GET /file` route (Lesson 3), directly
  after the existing `UnicodeDecodeError` handling.
- **Dependencies** — `get_lock` (Lesson 26). No concept lab for this
  unit — `get_lock` and returning an extra dict key alongside existing
  ones are both already-taught constructs, reused here exactly as
  before.

### The New Code — type this

```python
relative_path = target_file.relative_to(CONTENT_DIR).as_posix()
lock = get_lock(relative_path)
checked_out_by = lock[1] if lock is not None else None

return {"path": path, "content": content, "checked_out_by": checked_out_by}
```

### The Updated Project — where this lives

`read_file`, in full, with the new lines marked:

```python
@app.get("/file", dependencies=[Depends(require_auth)])
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

    relative_path = target_file.relative_to(CONTENT_DIR).as_posix()          # ← new
    lock = get_lock(relative_path)                                          # ← new
    checked_out_by = lock[1] if lock is not None else None                  # ← new

    return {"path": path, "content": content, "checked_out_by": checked_out_by}  # ← changed
```

`read_file` now answers two questions at once — what's in the file, and
who (if anyone) currently holds it — in the same round trip that already
existed, rather than requiring a second request.

### Mechanical Walkthrough

`target_file.relative_to(CONTENT_DIR).as_posix()` — the identical
expression already used in `write_file`, `checkout`, and `checkin`
(Lesson 26), reapplied here for the first time inside `read_file`,
which never needed a path in this exact form before. `lock[1] if lock
is not None else None` — a conditional expression, Python's ternary,
already used elsewhere in this project (`Lesson 12`'s diagnostic
formatting); `lock[1]` reads the `username` position out of the tuple
`get_lock` returns (`path, username, checked_out_at`, per Lesson 26's
`SELECT` column order) — first use of positional tuple indexing in this
project rather than unpacking all three names, chosen here because only
the username is needed.

### SE Lens — extending a response instead of adding a second route

The alternative was a new route, `GET /lock-status?path=...`, called
separately whenever a file is opened. That would mean every `openFile`
call becomes two requests instead of one, and a real possibility of the
two answers disagreeing if the lock changes in the gap between them.
Folding `checked_out_by` into the response `GET /file` already returns
costs nothing extra over the wire — one query, `get_lock`, that was
already fast — and guarantees the content and the lock status a caller
sees came from the same instant.

### Run It

Not independently observable from the terminal in a way distinct from
Lesson 26's own `/checkout`/`/checkin` verification — this unit's real
proof is the frontend unit below, where `checked_out_by` is read and
displayed for the first time.

---

## Concept Unit: remembering who's logged in, not just that someone is

### The Problem

The status line this lesson builds needs to say "Checked out by you"
when the current user holds the lock, distinct from "Checked out by
dana" when someone else does — which means the browser needs to know
its own logged-in username, not just its `authToken`. Nothing in this
project currently stores that.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, one new variable; modify three existing
  functions.
- **Location** — `currentUsername`, declared beside `authToken` near
  the top of the `<script>` block; `login`, `logout`, and the
  `storedToken` bootstrap check at the bottom of the script — the same
  three places `authToken` itself is set, read, and cleared.
- **Dependencies** — `sessionStorage` (Lesson 19). No concept lab —
  `sessionStorage.setItem`/`.getItem`/`.removeItem` are reused exactly
  as already taught, applied to a second key.

### The New Code — type this

```javascript
let currentUsername = null;
```

`login` already has the `username` typed into the form; it now keeps a
copy of it, the same way it already keeps `authToken`:

```javascript
currentUsername = username;
sessionStorage.setItem("username", username);
```

### The Updated Project — where this lives

`login`'s success handler, with the new lines marked:

```javascript
.then((data) => {
    authToken = data.token;
    currentUsername = username;                              // ← new
    sessionStorage.setItem("authToken", data.token);
    sessionStorage.setItem("username", username);             // ← new
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-layout").style.display = "flex";
    loadFolder("");
})
```

`logout`, with the matching cleanup added:

```javascript
function logout(message) {
    authToken = null;
    currentUsername = null;                                   // ← new
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("username");                    // ← new
    document.getElementById("app-layout").style.display = "none";
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("login-status").textContent = message;
}
```

The page-reload bootstrap, which restores `authToken` from
`sessionStorage` on every fresh page load (Lesson 19), now restores
`currentUsername` alongside it:

```javascript
const storedToken = sessionStorage.getItem("authToken");
if (storedToken) {
    authToken = storedToken;
    currentUsername = sessionStorage.getItem("username");     // ← new
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-layout").style.display = "flex";
    loadFolder("");
}
```

`currentUsername` now tracks `authToken` through every place the token
itself is set, cleared, or restored — logging in stores it, logging out
clears it, and a page refresh recovers it from `sessionStorage` exactly
as the token already does.

### Mechanical Walkthrough

`let currentUsername = null;` — a `let` declaration, already used
throughout this project since Lesson 1, initialized to `null` the same
way `authToken` is. `currentUsername = username` — a plain assignment,
reusing the `username` value `login` already reads from the form input
one line above it in the existing, unmodified code. `sessionStorage.setItem("username",
username)` / `.getItem("username")` / `.removeItem("username")` — Lesson
19's exact `sessionStorage` API, applied to a second key, `"username"`,
alongside the existing `"authToken"` key; no new mechanic, a second
application of an already-taught one.

### CS Lens

No new CS concept in this unit — it's the direct extension of an
already-established persistence mechanism to a second value that needs
the same lifetime.

### SE Lens — two related values, kept in sync by touching every site together

`authToken` and `currentUsername` are logically one unit — "who is
currently logged in, and how do they prove it" — but stored as two
separate variables and two separate `sessionStorage` keys rather than
one combined object. The risk of two separate values: every place that
sets, clears, or restores one must remember to do the same for the
other, or they drift apart (a stale username surviving a logout, for
instance). This lesson's Project Change deliberately lists all three
sites — login, logout, bootstrap — precisely because that's the
complete set that must stay in sync; missing one would reintroduce this
exact drift.

### Run It

Not independently observable yet — nothing reads `currentUsername`
until the next unit's `renderLockStatus`.

---

## Concept Unit: a value passed between two `.then()` steps

### The Problem

`saveFile`, `checkoutFile`, and `checkinFile` all need to make a
decision based on `response.ok` — but the actual message to show comes
from the *parsed body*, `response.json()`'s result, which only becomes
available one `.then()` step later. `response` itself isn't available
inside that later step; only whatever the previous step returned is.

### Concept Lab

```javascript
function fakeFetch(succeed) {
    return Promise.resolve({
        ok: succeed,
        json: () => Promise.resolve({ detail: "the reason" }),
    });
}

let wasSuccessful = false;

fakeFetch(false)
    .then((response) => {
        wasSuccessful = response.ok;
        return response.json();
    })
    .then((data) => {
        console.log("wasSuccessful:", wasSuccessful, "data:", data);
    });
```

Run it — actual output, this exact run:

```
wasSuccessful: false data: { detail: 'the reason' }
```

### What This Proves

`wasSuccessful` is declared *outside* the `.then()` chain, with `let`
rather than `const`, because it needs to be reassigned. The first
`.then()` callback reads `response.ok` and assigns it to
`wasSuccessful` — this is possible because a `.then()` callback is a
regular JavaScript function, and a function can read and write any
variable declared in an enclosing scope, exactly the way every function
in this project already reads variables like `activeTabPath` or
`openTabs` without receiving them as parameters. The second `.then()`
callback runs *after* the first one, once `response.json()`'s own
promise resolves — by the time it runs, `wasSuccessful` already holds
the value the first callback assigned, so the second callback can read
it even though it was never passed in. `fakeFetch` itself is a stand-in
for the real `fetch`, returning an object shaped like a real `Response`
— `{ ok, json }` — without any real network call, so this lab runs
instantly and deterministically.

### Discard

`fakeFetch` is deleted now — it never appears in the project. The real
code below uses this same "assign in the first `.then()`, read in the
second" shape against real `fetch` responses.

---

## Concept Unit: two buttons that ask the server, not decide for themselves

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, two new buttons and a status `<span>`; add,
  three new functions (`renderLockStatus`, `checkoutFile`,
  `checkinFile`); modify, `openFile`, `renderEditor`, and the button
  event-listener block.
- **Location** — buttons placed directly after `#save-button` in the
  editor's button row; `#lock-status` placed directly after
  `#save-status`; the three new functions placed after `renderEditor`,
  before `saveFile`; `openFile`'s `openTabs.push(...)` call (Lesson 3);
  `renderEditor`'s body (Lesson 3), right after it clears
  `#save-status`; the existing `addEventListener` block near the bottom
  of the script.
- **Dependencies** — `authenticatedFetch` (Lesson 19); `/checkout`,
  `/checkin` (Lesson 26); `checked_out_by` on `GET /file`'s response
  (this lesson's first unit); `currentUsername` (this lesson's second
  unit); the closure pattern just lab'd above.

### The New Code — type this

Two buttons, next to Save:

```html
<button id="checkout-button">Check Out</button>
<button id="checkin-button">Check In</button>
```

A status line, next to the existing save status:

```html
<span id="lock-status"></span>
```

`openFile` now stores the lock status alongside a tab's content:

```javascript
openTabs.push({ path: data.path, content: data.content, checked_out_by: data.checked_out_by });
```

A function to render that status for whichever tab is currently active:

```javascript
function renderLockStatus() {
    const activeTab = openTabs.find((tab) => tab.path === activeTabPath);
    const statusElement = document.getElementById("lock-status");

    if (activeTab.checked_out_by === null) {
        statusElement.textContent = "Not checked out.";
    } else if (activeTab.checked_out_by === currentUsername) {
        statusElement.textContent = "Checked out by you.";
    } else {
        statusElement.textContent = "Checked out by " + activeTab.checked_out_by + ".";
    }
}
```

`checkoutFile`, applying this lesson's lab pattern against the real
`/checkout` route:

```javascript
function checkoutFile() {
    if (activeTabPath === null) {
        return;
    }

    let wasSuccessful = false;

    authenticatedFetch("http://127.0.0.1:8000/checkout?path=" + encodeURIComponent(activeTabPath), {
        method: "POST",
    })
        .then((response) => {
            wasSuccessful = response.ok;
            return response.json();
        })
        .then((data) => {
            if (!wasSuccessful) {
                document.getElementById("lock-status").textContent = data.detail;
                return;
            }
            const activeTab = openTabs.find((tab) => tab.path === activeTabPath);
            activeTab.checked_out_by = data.checked_out_by;
            renderLockStatus();
        })
        .catch((error) => {
            document.getElementById("lock-status").textContent = "Could not check out file.";
        });
}
```

`checkinFile` is the mirror image, releasing instead of claiming:

```javascript
function checkinFile() {
    if (activeTabPath === null) {
        return;
    }

    let wasSuccessful = false;

    authenticatedFetch("http://127.0.0.1:8000/checkin?path=" + encodeURIComponent(activeTabPath), {
        method: "POST",
    })
        .then((response) => {
            wasSuccessful = response.ok;
            return response.json();
        })
        .then((data) => {
            if (!wasSuccessful) {
                document.getElementById("lock-status").textContent = data.detail;
                return;
            }
            const activeTab = openTabs.find((tab) => tab.path === activeTabPath);
            activeTab.checked_out_by = null;
            renderLockStatus();
        })
        .catch((error) => {
            document.getElementById("lock-status").textContent = "Could not check in file.";
        });
}
```

### The Updated Project — where this lives

The editor's button row, in full, with the two new buttons and status
span marked:

```html
<div>
    <button id="save-button">Save</button>
    <button id="checkout-button">Check Out</button>          <!-- ← new -->
    <button id="checkin-button">Check In</button>             <!-- ← new -->
    <button id="run-button">Run</button>
    <button id="tokens-button">Tokens</button>
    <button id="blocks-button">Blocks</button>
    <button id="analyze-button">Analyze</button>
    <button id="history-button">History</button>
    <button id="current-diff-button">Current Diff</button>
    <button id="highlight-button">Highlight</button>
    <span id="save-status"></span>
    <span id="lock-status"></span>                             <!-- ← new -->
</div>
```

`renderEditor`, with the one new call marked — everything else in this
function is exactly as Lesson 3 through Lesson 24 left it:

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
    renderLockStatus();                                                  // ← new
    document.getElementById("run-output").textContent = "";
    document.getElementById("run-output").classList.remove("has-error");
    document.getElementById("diagnostics-output").textContent = "";
    document.getElementById("diagnostics-output").className = "";
    document.getElementById("tokens-output").textContent = "";
    document.getElementById("blocks-output").textContent = "";
    document.getElementById("analysis-output").textContent = "";
    document.getElementById("history-output").textContent = "";
    document.getElementById("diff-output").textContent = "";
    document.getElementById("current-diff-output").textContent = "";
    document.getElementById("highlight-output").textContent = "";
}
```

The event-listener block, with the two new lines marked:

```javascript
document.getElementById("save-button").addEventListener("click", saveFile);
document.getElementById("checkout-button").addEventListener("click", checkoutFile);  // ← new
document.getElementById("checkin-button").addEventListener("click", checkinFile);    // ← new
document.getElementById("run-button").addEventListener("click", runFile);
```

`renderEditor` now refreshes the lock-status line every time a tab
becomes active, exactly as it already refreshes every other output
panel — switching tabs, or opening a file for the first time, always
shows that file's own current lock state.

### Mechanical Walkthrough

`openTabs.find((tab) => tab.path === activeTabPath)` — Lesson 4's
existing `.find()` pattern, reapplied without change. `activeTab.checked_out_by === null` /
`=== currentUsername` — plain equality checks against a value stored on
the tab object and this lesson's own `currentUsername`; `if`/`else if`/`else`
is already-established control flow, no restatement needed.
`authenticatedFetch(...).then((response) => { wasSuccessful =
response.ok; return response.json(); })` — this lesson's own lab
pattern, applied for the first time against a real network response
rather than `fakeFetch`'s stand-in. `data.checked_out_by` inside
`checkoutFile`'s success branch — reading the real field this lesson's
first unit added to the backend response (`/checkout`'s response
already included `checked_out_by` since Lesson 26; this lesson is the
first time the frontend reads it).

### CS Lens

No new CS concept beyond the closure-across-callbacks idea already
lab'd in the previous unit, applied here for real.

### SE Lens — the buttons don't decide anything; the server does

`checkoutFile` and `checkinFile` never check, in JavaScript, whether the
current user is allowed to perform the action before sending the
request — no client-side "is this file already locked by someone else,
so disable the button" logic exists anywhere in this code. Every
decision about whether an action succeeds happens once, in the backend
(`/checkout`'s `409`, `/checkin`'s `403`), and the frontend's only job
is to display whatever the server actually decided. The alternative —
duplicating the lock rules in JavaScript to preemptively disable
buttons — would mean two separate places that must agree about who can
do what, and a real risk of the client-side copy drifting out of sync
with the server-side rule that actually matters. A disabled button that
doesn't match the server's own answer would be worse than no
disabling at all — it would tell a user they can't do something the
server would actually allow, or invite an attempt the server was always
going to reject anyway with a clear, honest message.

### Run It

Confirmed this session by running the exact function bodies shown
above — copied verbatim, not reimplemented — against a real running
server, using two independent logged-in users:

```
1) kim opens file, lock-status:        Not checked out.
2) kim checks out, lock-status:        Checked out by you.
3) kim saves (holds lock):             Saved.
4) liam opens file, lock-status:       Checked out by kim.
5) liam tries to save (no lock):       Checked out by kim
6) liam tries checkin (not holder):    Checked out by kim
7) kim checks in, lock-status:         Not checked out.
```

Every line matches this lesson's stated rules exactly — a lock is
visible the moment a file is opened, the status line names the real
holder, and a rejected action shows the server's own message instead of
a generic failure.

---

## Concept Unit: the save that used to lie

### The Problem

`saveFile` (Lesson 3) has never checked `response.ok`. Since Lesson 26,
`PUT /file` can return a real `403` when the caller doesn't hold the
lock — but `saveFile`'s existing code calls `response.json()`
unconditionally and treats whatever comes back as success, because a
`403` response still has a valid JSON body (`{"detail": "..."}`) that
`response.json()` parses without error.

### Concept Lab

None — this unit reuses the exact closure pattern already lab'd two
units ago, applied to `saveFile` specifically. What follows is that bug
demonstrated for real, not a new construct.

Running `saveFile`'s *exact, unmodified* pre-this-lesson code against
the real backend, as a logged-in user who has never checked the file
out:

```javascript
// index.html's saveFile(), copied verbatim, before this lesson's fix
let reportedStatus = null;

fetch("http://127.0.0.1:8001/file?path=src/main.py", {
    method: "PUT",
    headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ content: "print('unauthorized edit attempt')\n" }),
})
    .then((response) => response.json())
    .then((data) => { reportedStatus = "Saved."; })
    .catch((error) => { reportedStatus = "Could not save."; });
```

Run against a real server — actual output, this exact run:

```
UI would report: Saved.
Actual file content on disk: "def main():\n    print(\"Hello from the sample project.\")\n\n\nif __name__ == \"__main__\":\n    main()\n"
```

The request was rejected with a real `403`; the file on disk is
completely unchanged from before the attempt; the UI would have told a
real person it saved successfully anyway.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace, `saveFile`'s existing `.then()` chain.
- **Location** — `saveFile` (Lesson 3), the function this project has
  called on every Save-button click since its very first version.
- **Dependencies** — this lesson's closure pattern, already lab'd and
  already in use in `checkoutFile`/`checkinFile` above.

### The New Code — type this

`saveFile` declares the same tracking variable this lesson's earlier
unit already introduced for `checkoutFile`/`checkinFile`:

```javascript
let wasSuccessful = false;
```

Its `.then()` chain then adopts the identical shape:

```javascript
.then((response) => {
    wasSuccessful = response.ok;
    return response.json();
})
.then((data) => {
    if (!wasSuccessful) {
        document.getElementById("save-status").textContent = data.detail;
        return;
    }
    const activeTab = openTabs.find((tab) => tab.path === activeTabPath);
    activeTab.content = content;
    document.getElementById("save-status").textContent = "Saved.";
    if (activeTabPath.endsWith(".py")) {
        diagnoseFile();
    } else if (activeTabPath.endsWith(".nc")) {
        analyzeFile();
    }
})
```

### The Updated Project — where this lives

`saveFile`, in full, with the changed lines marked:

```javascript
function saveFile() {
    if (activeTabPath === null) {
        return;
    }

    const content = document.getElementById("file-content").value;
    let wasSuccessful = false;                                          // ← new

    authenticatedFetch("http://127.0.0.1:8000/file?path=" + encodeURIComponent(activeTabPath), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content }),
    })
        .then((response) => {                                          // ← changed
            wasSuccessful = response.ok;                                // ← new
            return response.json();                                    // ← changed
        })
        .then((data) => {
            if (!wasSuccessful) {                                       // ← new
                document.getElementById("save-status").textContent = data.detail;  // ← new
                return;                                                 // ← new
            }
            const activeTab = openTabs.find((tab) => tab.path === activeTabPath);
            activeTab.content = content;
            document.getElementById("save-status").textContent = "Saved.";
            if (activeTabPath.endsWith(".py")) {
                diagnoseFile();
            } else if (activeTabPath.endsWith(".nc")) {
                analyzeFile();
            }
        })
        .catch((error) => {
            document.getElementById("save-status").textContent = "Could not save.";
        });
}
```

`saveFile` now only reports "Saved." — and only updates the tab's local
`content` — when the server actually accepted the write. A rejected
save shows the server's own reason instead, and leaves the tab's stored
content untouched, so a later save attempt doesn't silently believe the
rejected edit was ever recorded.

### Mechanical Walkthrough

Every line here reuses either this lesson's own closure pattern
(`wasSuccessful`, assigned in the first `.then()`, read in the second)
or code already present in `saveFile` since Lesson 3 — no new construct
in this unit at all, only a rearrangement of already-known pieces to
close a gap that existed since this function's very first version.

### CS Lens

No new CS concept — this unit is a second, real-world application of
the same closure-across-callbacks idea, and belongs here specifically
because "the same bug shows up more than once" is itself the point:
`checkoutFile` and `checkinFile` never had this bug, because they were
*written* with the fix already in place; `saveFile` had it because it
predates the fix by twenty-five lessons.

### SE Lens — a silent misread, the same shape as two earlier bugs

This project has already found two other cases of a `.then()` chain
treating any parseable JSON response as success, regardless of HTTP
status — Lesson 14 and Lesson 19 both fixed instances of it elsewhere.
`saveFile` was the one place that pattern was never revisited, because
nothing had ever given it a reason to fail with a structured error
before `write_file` gained the lock check in Lesson 26. The general
lesson: adding a new failure mode to a backend route doesn't
automatically make every existing caller handle it correctly — each
caller has to be checked against the new possibility, not assumed safe
because it worked before the new failure mode existed.

### Run It

The previous unit's exact bug scenario, rerun against the fixed
`saveFile` — actual output, this exact run, using the real function
bodies from `index.html`:

```
4) liam opens file, lock-status:       Checked out by kim.
5) liam tries to save (no lock):       Checked out by kim
```

Compare directly to this unit's earlier "before" output — `"Saved."`
regardless of outcome — against this "after" output, where a rejected
save now shows `"Checked out by kim"`, the real reason, taken directly
from the server's own `403` response body.

---

## Connect the pieces

Kim opens `src/main.py`: `GET /file` now returns `checked_out_by:
null` alongside the content, `openFile` stores it on the tab, and
`renderEditor` calls `renderLockStatus`, showing "Not checked out."
Kim clicks Check Out: `checkoutFile` posts to `/checkout`, and — using
the closure pattern this lesson lab'd — reads `response.ok` in the
first `.then()` and the real JSON body in the second, updating the
tab's `checked_out_by` and re-rendering the status as "Checked out by
you." Kim saves an edit: `saveFile`'s own version of the same pattern
confirms `response.ok` was `true` before reporting "Saved." Liam, in a
different browser session, opens the same file: `GET /file` now returns
`checked_out_by: "kim"`, and Liam's status line reads "Checked out by
kim" from the moment the file opens — before Liam ever attempts
anything. If Liam tries to save anyway, the identical closure pattern
in `saveFile` reads the real `403` and displays kim's name as the
reason, instead of the false "Saved." this project reported for its
first twenty-seven lessons' worth of this exact function.

## What breaks without this

Already demonstrated with real, pasted output earlier in this
lesson, not hypothetical: without the `wasSuccessful` check,
`saveFile`'s existing code calls `response.json()` unconditionally,
succeeds at parsing the `403`'s own valid JSON body, and reports
"Saved." — confirmed by running the exact prior code against the real
backend and observing the file on disk was completely unchanged despite
the false success message.

## Exercises

1. Check a file out as one user, then — using a second browser or an
   incognito window — log in as a different user and confirm the lock
   status shows "Checked out by [first user]" the moment the file opens,
   before attempting anything.
2. Attempt to save as the non-holder and confirm the status line shows
   the real server message, not a generic failure.
3. Check the file back in and confirm the second user's status line
   updates to "Not checked out." only after clicking Check Out
   themselves — not automatically, since nothing currently pushes
   updates to a browser that already has the file open.
4. Temporarily revert `saveFile` to its pre-lesson form (remove
   `wasSuccessful` and the `if (!wasSuccessful)` branch), reproduce the
   false "Saved." message against a locked file, then restore the fix.
5. Explain, without looking back at this lesson, why `checkoutFile` and
   `checkinFile` never had the bug this lesson found in `saveFile`.

## Definition of done

- [ ] You've confirmed, through the real running app with two separate
      logged-in sessions, that opening a locked file immediately shows
      who holds it
- [ ] You've reproduced the real "Saved." bug by temporarily reverting
      `saveFile`, then restored the fix and confirmed it shows the real
      rejection reason instead
- [ ] You can explain, in your own words, why a variable declared
      outside a `.then()` chain and assigned inside one callback is
      readable inside a later callback
- [ ] You can explain why this project's lock rules live only in the
      backend, with no duplicate copy of them in JavaScript
- [ ] `git commit` this lesson's code with a message explaining why
