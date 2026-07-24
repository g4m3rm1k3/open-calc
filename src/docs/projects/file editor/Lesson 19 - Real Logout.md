# Lesson 19: Recognizing a Real Logout

## What you will build

`authenticatedFetch` — a single shared function every gated request in
this project now goes through — plus a real `logout()`, and a token that
survives a page refresh instead of vanishing the instant it happens. The
feature fixes exactly what was reported: running code (or doing almost
anything else) with a stale token silently produced garbage instead of
telling you plainly that you'd been logged out; refreshing the page
logged you out for real, every single time, whether you meant to or not.

## What you need to know first

`Lesson 8 - Authentication.md` — `valid_tokens`, and the fact that it
resets to empty on every server restart, named explicitly there as a
real, accepted limitation — reused unchanged all the way through
`Lesson 17 - Real Signup and Login.md`. `Lesson 14 - Checking the Right
Thing.md` — the exact same *shape* of bug (a response body silently
misread as success), found there in one route, found here in seven more.

---

## Concept Unit: a silent, misread failure — reproduced for real

### The Problem

Every gated route in this project returns a clean `401` for a bad or
expired token:

```
POST /run?path=src/main.py, Authorization: Bearer garbage-token → 401 {"detail":"Invalid or expired token"}
```

Confirmed directly, against the real running server. `runFile()`,
unchanged since Lesson 5, does this with whatever comes back:

```javascript
.then((response) => response.json())
.then((data) => {
    if (data.stderr) {
        outputElement.classList.add("has-error");
        outputElement.textContent = data.stderr;
    } else {
        outputElement.classList.remove("has-error");
        outputElement.textContent = data.stdout || "(no output)";
    }
})
```

### What This Proves

`response.json()` doesn't check the status code at all — it parses
whatever body arrived, success or not. Against a `401`, `data` is
`{"detail": "Invalid or expired token"}` — `data.stderr` and
`data.stdout` are both `undefined`, so this code falls into the `else`
branch and displays **`(no output)`**, indistinguishable from a program
that genuinely ran and printed nothing. This is the *exact* shape of bug
Lesson 14 found in `diagnoseFile` — a response body from the wrong case
silently misread as the right one. That lesson's fix prevented
`diagnoseFile` from ever being called against the wrong file type in the
first place, by fixing its *caller*, `saveFile` — it never touched
`diagnoseFile`'s own response-parsing code, which still misreads any
response shape it wasn't expecting, a stale-token `401` included. Checked
directly, the identical pattern exists in every other gated function
this project has: `loadFolder`, `openFile`, `saveFile`, `diagnoseFile`,
`tokenizeFile`, `parseFile`, `analyzeFile`. A stale token doesn't say
"you're logged out" anywhere — it just makes every feature look quietly
broken.

---

## Concept Unit: eight copies of the same header

### The Problem

Every one of those eight functions builds its own `Authorization` header
by hand:

```javascript
headers: {
    "Authorization": "Bearer " + authToken,
},
```

Confirmed directly — this exact fragment, or a close variant of it with
an extra `Content-Type` alongside it, appears eight separate times in
this project's `<script>` block. Fixing the silent-misread problem
inside all eight, separately, would mean writing the same `401` check
eight times too — and the ninth gated route this project ever adds would
need it copy-pasted a ninth time, with nothing flagging it if that copy
gets forgotten.

### What This Proves

This is the same shape of problem Lesson 2 named explicitly for the
traversal check, copy-pasted into every backend route that touches a
file: a repeated fragment is a repeated *risk* — the day one copy
diverges, silently, from the other seven, is the day a bug like this
lesson's opening one hides in exactly one function instead of being
visibly, obviously fixed everywhere at once.

---

## Concept Unit: a shared, authenticated fetch

### The Problem

Something needs to attach the `Authorization` header the same way every
time, *and* recognize a `401` specifically, in exactly one place — every
gated call routed through it instead of building its own request by
hand. Doing that means copying an options object a caller supplies, and
adding one more key without disturbing what's already there — a job
JavaScript has purpose-built syntax for.

### Concept Lab

```javascript
const base = { method: "GET", headers: { "X-Custom": "yes" } };

const merged = {
    ...base,
    headers: {
        ...base.headers,
        "Authorization": "Bearer abc123",
    },
};

console.log(JSON.stringify(merged));
```

Run it. Actual output:

```
{"method":"GET","headers":{"X-Custom":"yes","Authorization":"Bearer abc123"}}
```

### What This Proves

`...base` inside a `{ ... }` object literal is the **spread operator**
— it copies every key/value pair from `base` into the new object, as if
each one had been typed out by hand. `method` came through untouched;
`headers` was overwritten by the nested object below it, which itself
spreads `base.headers` first (`"X-Custom": "yes"` survives) before
adding `"Authorization"` as one more key alongside it — nothing already
there was lost, and the new key joined it. Order matters: a later
key with the same name would win over an earlier spread, the same rule
a Python dictionary literal already follows.

### Discard

`base` and `merged` are deleted now — neither appears in the project.
The real function spreads a caller's actual options and headers, not a
hardcoded example.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `authenticatedFetch` function, placed
  directly after `logout` (built in the next unit).
- **Dependencies** — `authToken`, `logout`.

### The New Code — type this

```javascript
function authenticatedFetch(url, options) {
    const fetchOptions = {
        ...options,
        headers: {
            ...(options && options.headers),
            "Authorization": "Bearer " + authToken,
        },
    };

    return fetch(url, fetchOptions).then((response) => {
        if (response.status === 401) {
            logout("Your session expired. Please log in again.");
            throw new Error("Session expired");
        }
        return response;
    });
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function — the block above is
everything there is to see. Every gated call in the next unit is
rewritten to call this instead of `fetch` directly.

### Mechanical Walkthrough
`function authenticatedFetch(url, options)` reuses ordinary function
declaration syntax, with a second parameter, `options`, that's allowed
to be omitted entirely by any caller that needs nothing beyond
authentication. `{ ...options, headers: { ...(options && options.headers),
"Authorization": "Bearer " + authToken } }` is the lab's spread operator,
real this time: `...options` copies every property from whatever
options object a caller passed (`method`, `body`, its own `headers`, if
any) into a new object; `...(options && options.headers)` does the same
for whatever headers that caller already wanted, *before* the
`Authorization` line beneath it adds one more, exactly the "spread,
then add one more key" shape just proven in the lab. `options &&
options.headers` is a **short-circuit** pattern: if
`options` is `undefined` (a caller passed nothing), the whole expression
evaluates to `undefined` without ever trying to read `.headers` off of
it, avoiding an error stat trying to read a property off of a value that
doesn't exist. `fetch(url, fetchOptions)` reuses ordinary `fetch`, wired
with the merged options built above. `.then((response) => { if
(response.status === 401) { ... } return response; })` reuses `.status`
directly, rather than the `!response.ok` shorthand `login()` already
- uses — deliberately: `!response.ok` is `true` for *any* failure code
(`400`, `404`, `401`, ...), and only `401` specifically means "this
token is no longer valid," as opposed to, say, a `400` for a wrong file
extension, which every calling function already handles correctly on
its own. `logout(...)` and `throw new Error("Session expired")` both run
only in that one specific case; otherwise the real `response` is
returned unchanged, exactly as `fetch` itself would have.

---

## Concept Unit: a real logout

### The Problem

Something has to actually clear a stale session and show the login
screen again, with a message that honestly says what happened — instead
of nothing at all recognizing it as a logout in the first place.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `logout` function, placed directly after
  `login`.
- **Dependencies** — none new.

### The New Code — type this

```javascript
function logout(message) {
    authToken = null;
    sessionStorage.removeItem("authToken");
    document.getElementById("app-layout").style.display = "none";
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("login-status").textContent = message;
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function — the block above is
everything there is to see. `sessionStorage.removeItem(...)` here
depends on the next unit's `sessionStorage.setItem(...)` call inside
`login`, built to work together even though this function is written
first.

### Mechanical Walkthrough
- `function logout(message)` takes one parameter — the exact text to show,
so a stale-token logout and (later, if this project ever adds one) a
deliberate "Log Out" button click could each supply their own honest
reason. `authToken = null;` reuses the exact reset already used
implicitly at declaration time, undoing a successful login. `sessionStorage.removeItem("authToken")`
is new — explained fully in this lesson's last unit, alongside the
`.setItem` call it undoes. `document.getElementById("app-layout").style.display
= "none"` and `document.getElementById("login-screen").style.display =
"flex"` reuse ordinary inline-style toggling, in the *opposite* direction
- from `login`'s own success handler — hiding the app, showing the login
screen, instead of the reverse. `document.getElementById("login-status").textContent
= message` reuses ordinary text assignment, displaying whatever specific
reason the caller supplied.

---

## Concept Unit: refactoring every gated call

### The Problem

All eight functions from this lesson's second unit need to actually use
`authenticatedFetch` instead of `fetch` — the fix this whole lesson has
been building toward.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace, the `fetch(...)` call and its manually-built
  `Authorization` header, inside `loadFolder`, `openFile`, `saveFile`,
  `diagnoseFile`, `runFile`, `tokenizeFile`, `parseFile`, and
  `analyzeFile`.
- **Dependencies** — `authenticatedFetch`, built two units ago.

### The New Code — type this

The identical change, applied to all eight — shown as a diff against
each one's existing `fetch` call, since every function's own body around
it, already fully shown in the lesson that built it (Lessons 2, 3, 9, 5,
10, 11, 13), is otherwise completely untouched:

```diff
  // loadFolder — no other options, nothing left to merge:
- fetch("http://127.0.0.1:8000/files?path=" + encodeURIComponent(path), {
-     headers: {
-         "Authorization": "Bearer " + authToken,
-     },
- })
+ authenticatedFetch("http://127.0.0.1:8000/files?path=" + encodeURIComponent(path))

  // openFile — identical shape to loadFolder:
- fetch("http://127.0.0.1:8000/file?path=" + encodeURIComponent(path), {
-     headers: {
-         "Authorization": "Bearer " + authToken,
-     },
- })
+ authenticatedFetch("http://127.0.0.1:8000/file?path=" + encodeURIComponent(path))

  // saveFile — Content-Type and body both survive, only the Authorization line leaves:
- fetch("http://127.0.0.1:8000/file?path=" + encodeURIComponent(activeTabPath), {
+ authenticatedFetch("http://127.0.0.1:8000/file?path=" + encodeURIComponent(activeTabPath), {
      method: "PUT",
      headers: {
          "Content-Type": "application/json",
-         "Authorization": "Bearer " + authToken,
      },
      body: JSON.stringify({ content: content }),
  })

  // diagnoseFile, runFile, tokenizeFile, parseFile, analyzeFile all get the identical change,
  // shown once per real route since only the URL differs between them:
- fetch("http://127.0.0.1:8000/diagnose?path=" + encodeURIComponent(activeTabPath), {
-     method: "POST",
-     headers: {
-         "Authorization": "Bearer " + authToken,
-     },
- })
+ authenticatedFetch("http://127.0.0.1:8000/diagnose?path=" + encodeURIComponent(activeTabPath), {
+     method: "POST",
+ })

- fetch("http://127.0.0.1:8000/run?path=" + encodeURIComponent(activeTabPath), {
-     method: "POST",
-     headers: {
-         "Authorization": "Bearer " + authToken,
-     },
- })
+ authenticatedFetch("http://127.0.0.1:8000/run?path=" + encodeURIComponent(activeTabPath), {
+     method: "POST",
+ })

- fetch("http://127.0.0.1:8000/tokens?path=" + encodeURIComponent(activeTabPath), {
-     method: "POST",
-     headers: {
-         "Authorization": "Bearer " + authToken,
-     },
- })
+ authenticatedFetch("http://127.0.0.1:8000/tokens?path=" + encodeURIComponent(activeTabPath), {
+     method: "POST",
+ })

- fetch("http://127.0.0.1:8000/parse?path=" + encodeURIComponent(activeTabPath), {
-     method: "POST",
-     headers: {
-         "Authorization": "Bearer " + authToken,
-     },
- })
+ authenticatedFetch("http://127.0.0.1:8000/parse?path=" + encodeURIComponent(activeTabPath), {
+     method: "POST",
+ })

- fetch("http://127.0.0.1:8000/analyze?path=" + encodeURIComponent(activeTabPath), {
-     method: "POST",
-     headers: {
-         "Authorization": "Bearer " + authToken,
-     },
- })
+ authenticatedFetch("http://127.0.0.1:8000/analyze?path=" + encodeURIComponent(activeTabPath), {
+     method: "POST",
+ })
```

### The Updated Project — where this lives

One complete, real example — `runFile`, in full, with the change
actually in place, not a diff this time:

```javascript
function runFile() {
    if (activeTabPath === null) {
        return;
    }

    const outputElement = document.getElementById("run-output");
    outputElement.classList.remove("has-error");
    outputElement.textContent = "Running...";

    authenticatedFetch("http://127.0.0.1:8000/run?path=" + encodeURIComponent(activeTabPath), {   // ← changed
        method: "POST",
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.stderr) {
                outputElement.classList.add("has-error");
                outputElement.textContent = data.stderr;
            } else {
                outputElement.classList.remove("has-error");
                outputElement.textContent = data.stdout || "(no output)";
            }
        })
        .catch((error) => {
            outputElement.classList.add("has-error");
            outputElement.textContent = "Could not reach backend.";
        });
}
```

The other seven functions follow the identical shape — only the URL,
and whether `method`/`body`/`Content-Type` are present, differ between
them, exactly as they always have.

### Mechanical Walkthrough
Every changed line reuses `authenticatedFetch`, built two units ago, in
- place of `fetch` plus a hand-written `Authorization` header — nothing
about *what* each function does with the response changes at all.
Worth naming directly: when `authenticatedFetch` detects a `401` and
- calls `logout(...)`, it also `throw`s — that rejection skips straight
past each function's own `.then((response) => response.json())` and
lands in that same function's existing `.catch()` block, which still
runs too, briefly setting its own panel's text (`"Could not reach
backend."`, or similar) *underneath* a login screen that's already back
on top, hiding it entirely. Harmless, and worth knowing rather than
being surprised by if it's ever traced through a debugger.

### Run It

```
Valid token, /run  → 200, real stdout shown, exactly as before this lesson
Invalid token, /run → 401 caught by authenticatedFetch → logout() runs → login screen reappears with "Your session expired. Please log in again."
```

The first case confirmed directly against the real running server,
unchanged from every earlier lesson's own verification. The second is a
frontend-only decision (which screen shows, and what text appears) that
a terminal request can't exercise on its own — confirmed by tracing
`authenticatedFetch`'s own code against the real `401` response shown in
this lesson's first unit, and left as this lesson's first exercise to
watch happen in a real browser, not claimed here as already witnessed.

---

## Concept Unit: surviving a refresh

### The Problem

`authToken` has been a plain JavaScript variable since Lesson 8 — it
lives only in this page's current memory. Reloading the page, for any
reason at all, resets every variable in the script back to its starting
value, `authToken` included — which means a refresh has always logged
this project's user out completely, every single time, independent of
tokens, expiration, or anything this lesson has fixed so far.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add. `login`'s success handler gains one line;
  `logout` gains one line (already shown, in the earlier unit); the
  bottom of the script, where `loadFolder("")` and `renderAuthMode()`
  used to run unconditionally, now checks for a stored token first.
- **Dependencies** — none new.

### The New Code — type this

```javascript
sessionStorage.setItem("authToken", data.token);
```

And, replacing the unconditional bootstrap call at the very bottom of
the script:

```javascript
const storedToken = sessionStorage.getItem("authToken");
if (storedToken) {
    authToken = storedToken;
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-layout").style.display = "flex";
    loadFolder("");
} else {
    renderAuthMode();
}
```

### The Updated Project — where this lives

`login`'s success handler, with the one new line in place:

```javascript
.then((data) => {
    authToken = data.token;
    sessionStorage.setItem("authToken", data.token);   // ← new
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-layout").style.display = "flex";
    loadFolder("");
})
```

And the bottom of the script, where `renderAuthMode()` used to run
unconditionally since Lesson 18:

```javascript
document.getElementById("auth-submit-button").addEventListener("click", submitAuth);
document.getElementById("auth-toggle-link").addEventListener("click", toggleAuthMode);

const storedToken = sessionStorage.getItem("authToken");   // ← new
if (storedToken) {                                          // ← new
    authToken = storedToken;                                // ← new
    document.getElementById("login-screen").style.display = "none";   // ← new
    document.getElementById("app-layout").style.display = "flex";     // ← new
    loadFolder("");                                          // ← new
} else {                                                      // ← new
    renderAuthMode();                                        // ← changed: was unconditional
}                                                              // ← new
```

### Mechanical Walkthrough
- `sessionStorage` is a browser-provided storage object — new to this
project — that persists small key/value pairs across a page reload
*within the same browser tab*, distinct from a plain JavaScript
variable, which does not; it's cleared when the tab itself closes,
unlike `localStorage`, a related API that would persist even across
closing and reopening the browser entirely. `.setItem("authToken",
data.token)` stores the token under that key, string to string.
`.getItem("authToken")` reads it back, returning the stored string or
- `null` if nothing was ever stored — the same `null`-for-nothing-found
convention `RUNNERS.get(...)` used in Lesson 6. `if (storedToken) {`
- reuses ordinary truthy testing — `null` is falsy, so this branch only
runs when a real stored token actually exists. Inside it, `authToken =
storedToken;` restores the in-memory variable from what was persisted,
and the three lines below it reuse `login`'s own success-handler shape
exactly, skipping the login screen entirely and loading the file browser
directly. `.removeItem("authToken")`, back in `logout`, reuses the same
API to clear the stored value — a logout has to remove it from
persistent storage too, or a page refresh immediately after would
silently restore the very session that just ended.

### SE Lens — a deliberate, bounded kind of persistence

`sessionStorage`, not `localStorage`, is the specific choice here, and
worth naming as one: closing the browser tab still ends the session, the
same real boundary a person would expect — only an *accidental* or
*intentional* page reload, while the tab stays open, is what this lesson
protects against. A permanent, cross-restart login, the way `localStorage`
would provide, is a different, stronger guarantee than this project
actually wants to make yet — the token itself is still only ever
checked against `valid_tokens`, an in-memory set that resets on every
server restart (Lesson 8) regardless of what the browser remembers, so
persisting it more permanently than that would only be storing a token
that's frequently already dead.

---

## Connect the pieces

Logging in, then reloading the page: `login`'s success handler now
stores the real token in `sessionStorage` alongside setting `authToken`
in memory. The page reloads — every JavaScript variable resets, `authToken`
included — but the bottom of the script now checks `sessionStorage`
*before* assuming a fresh login is needed, finds the real stored token,
restores it, and calls `loadFolder("")` directly, skipping the login
screen entirely. Later, if the backend restarts and `valid_tokens`
resets (a real, already-named limitation since Lesson 8), the *stored*
token is still there, still gets attached to every request by
`authenticatedFetch` — but the *server* no longer recognizes it, so the
very next gated request returns a real `401`. `authenticatedFetch`
catches it, calls `logout("Your session expired. Please log in
again.")`, which clears both the in-memory variable and the stored copy,
and shows the login screen with an honest reason — the exact moment this
lesson set out to fix, now recognized correctly instead of silently
misread as a working, empty output.

## What breaks without this

Already demonstrated concretely above, not hypothetically: a real `401`
response, run through `runFile`'s original code, produces `(no output)`
— indistinguishable from a program that ran and printed nothing,
confirmed directly in this lesson's first unit. And every reload of this
page, for any reason, has logged this project's user out completely
since Lesson 8, independent of anything about token validity — a plain
JavaScript variable holding the only copy of a session that a browser
refresh always destroys.

## Exercises

1. Log in through the real app, refresh the page, and confirm you're
   still logged in — the file browser should load directly, with no
   login screen in between.
2. Log in, then close the tab entirely and open the app again in a new
   one — confirm you're asked to log in again, and explain why, in terms
   of `sessionStorage` versus `localStorage`.
3. Log in, then edit `valid_tokens` on the backend directly (or restart
   the server) to invalidate your token without logging out through the
   app — click Run, and confirm the login screen reappears with "Your
   session expired. Please log in again." instead of a silently empty
   output panel.
4. Trace, on paper, what `authenticatedFetch` does differently for a
   `400` response versus a `401` — confirm a `400` (a `.py` file sent to
   `/tokens`, for instance) still reaches its own calling function's
   `.then()` block exactly as before this lesson.

## Definition of done

- [ ] You've confirmed a page refresh no longer logs you out
- [ ] You've caused a real `401` yourself and watched the app log you
      out cleanly, with an honest message, instead of showing broken
      output
- [ ] You can explain why `authenticatedFetch` checks `response.status
      === 401` specifically, instead of the more general `!response.ok`
- [ ] You can explain the difference between `sessionStorage` and
      `localStorage`, and why this lesson chose the former
- [ ] You can name every function this lesson refactored, and explain
      why the change was identical in each one
- [ ] `git commit` this lesson's code with a message explaining why
