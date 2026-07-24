# Lesson 18: One Form, Two Purposes

## What you will build

A real sign-up screen, a login screen that actually looks designed
instead of default-styled inputs stacked in the corner of the page, and
both sharing the exact same markup — one form that changes what it means
depending on a single piece of state, the same underlying idea this
project has used for its editor pane since Lesson 4, applied here to
authentication for the first time.

## What you need to know first

`Lesson 17 - Real Signup and Login.md` — the real `/signup` and
`/login` routes this lesson's frontend finally calls. `Lesson 2`'s "UI
as a function of state" CS Lens (`renderFileList`) and `Lesson 4`'s
`renderEditor` — both reused directly here, applied to a form instead of
a file list or an editor pane. `Lesson 14`'s `else if` dispatch.

---

## Concept Unit: one form, two purposes

### The Problem

Login and sign-up need nearly identical fields — a username, a password
— and nearly identical behavior: collect them, send them somewhere,
react to success or failure. Building two entirely separate `<form>`
elements would duplicate almost every line of markup and JavaScript for
two screens that differ only in which route gets called and a few words
of text.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace. The login screen's markup gains a
  `username` input and a mode-toggle link; a new `authMode` state
  variable drives which mode the one shared form is currently in.
- **Dependencies** — none new.

### The New Code — type this

```javascript
let authMode = "login";

function renderAuthMode() {
    const isLogin = authMode === "login";
    document.getElementById("auth-title").textContent = isLogin ? "Log In" : "Sign Up";
    document.getElementById("auth-submit-button").textContent = isLogin ? "Log In" : "Sign Up";
    document.getElementById("auth-toggle-text").textContent = isLogin ? "Don't have an account?" : "Already have an account?";
    document.getElementById("auth-toggle-link").textContent = isLogin ? "Sign up" : "Log in";
}

function toggleAuthMode() {
    authMode = authMode === "login" ? "signup" : "login";
    document.getElementById("login-status").textContent = "";
    renderAuthMode();
}
```

### The Updated Project — where this lives

`authMode` joins this project's other top-level state, from Lesson 4:

```javascript
let currentPath = "";
let openTabs = [];
let activeTabPath = null;
let authToken = null;
let authMode = "login";   // ← new
```

`renderAuthMode` and `toggleAuthMode` are both complete, freestanding
new functions, placed directly after that state — nothing existing is
modified, so there's no enclosing structure to show them inside of.

The markup they control replaces the entire old login screen:

```html
<div id="login-screen">
    <div class="auth-card">
        <h1 id="auth-title">Log In</h1>
        <input type="text" id="username-input" placeholder="Username">
        <input type="password" id="password-input" placeholder="Password">
        <button id="auth-submit-button">Log In</button>
        <span id="login-status"></span>
        <p id="auth-toggle">
            <span id="auth-toggle-text">Don't have an account?</span>
            <span id="auth-toggle-link">Sign up</span>
        </p>
    </div>
</div>
```

Lesson 1's original `<h1>Log In</h1>` and single `<button id="login-button">`
are both gone entirely — replaced with `id`-tagged elements
`renderAuthMode` can actually read and rewrite.

### Mechanical Walkthrough

`let authMode = "login";` reuses ordinary variable declaration, holding
one of exactly two string values this project treats as a small,
informal **state machine** — not enforced by the language, just by
convention, the same way `activeTabPath` being `null` versus a real path
means two different things by convention rather than by any type system
rule. `renderAuthMode` reuses the naming convention and shape of
`renderFileList`/`renderEditor` from Lessons 2 and 4 exactly:
`document.getElementById(...)` lookups, `.textContent` assignments,
driven entirely by current state, redrawing the relevant piece of the
page from scratch rather than patching it incrementally. Every line
inside it is a ternary, reused from Lesson 2, picking one of two strings
based on `isLogin`. `toggleAuthMode` flips `authMode` between its two
values with the same ternary shape, clears any stale error message left
over from the previous mode, and calls `renderAuthMode()` to make the
change actually visible — the same call-the-render-function-after-
changing-state discipline this project has followed since `renderTabs()`
was first called from inside `openFile` in Lesson 4.

### CS Lens — the same idea as the editor pane, a third time

`renderFileList` draws the sidebar from `currentPath`/entries.
`renderEditor` draws the main pane from `activeTabPath`/`openTabs`.
`renderAuthMode` draws one small form from a single string. All three
are the identical underlying pattern: **UI as a function of state**,
first named explicitly back in Lesson 2's own CS Lens — recognizing it a
third time, in a part of the page that has nothing to do with files or
tabs at all, is the actual payoff of having named it as a general
principle the first time, not a coincidence.

---

## Concept Unit: submitAuth — one button, two possible actions

### The Problem

The one shared submit button needs to call `login()` when `authMode` is
`"login"`, and `signup()` when it isn't — a decision, not a fixed
action.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `submitAuth` function, between
  `toggleAuthMode` and `login`.
- **Dependencies** — `authMode`, `login`, `signup` (built in the next
  unit).

### The New Code — type this

```javascript
function submitAuth() {
    if (authMode === "login") {
        login();
    } else {
        signup();
    }
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function — the block above is
everything there is to see. It's the function the submit button's click
listener actually calls, wired at the very bottom of the script,
alongside every other button listener since Lesson 4 — plus one more
new line, calling `renderAuthMode()` itself, immediately:

```javascript
document.getElementById("auth-submit-button").addEventListener("click", submitAuth);   // ← changed: was login-button / login
document.getElementById("auth-toggle-link").addEventListener("click", toggleAuthMode);  // ← new
renderAuthMode();                                                                        // ← new
```

Without that last line, the form's initial title, button text, and
toggle wording would only *happen* to be correct because the hardcoded
HTML text matches what `renderAuthMode()` would produce anyway — true
today, purely by coincidence, and not something future edits to either
the HTML or `renderAuthMode` could be trusted to keep matching on their
own. Calling it once, immediately, is the same reasoning behind
`loadFolder("")` running unconditionally at the bottom of the script
since Lesson 2 — state should drive what's on screen from the very
first paint, not be assumed to already agree with it.

### Mechanical Walkthrough

`if (authMode === "login") { login(); } else { signup(); }` reuses
`if`/`else` dispatch on a string value, the same shape `renderFileList`'s
own click handlers used back in Lesson 3 to choose between `loadFolder`
and `openFile` based on `entry.is_directory`. This function never
touches the DOM at all — it exists purely to decide *which* function
actually runs, the smallest possible dispatcher. `renderAuthMode();`,
called with no arguments, reuses ordinary function-call syntax — the
same bootstrap-call pattern as `loadFolder("")`, ensuring the page's
very first render is actually *produced* by state, not merely assumed to
match it.

---

## Concept Unit: login gains a username, and signup is built the same way

### The Problem

`login()`, unchanged since Lesson 9, only ever read `#password-input` —
Lesson 17's backend now expects a `username` too. And nothing yet calls
`/signup` at all.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace, `login`'s first two lines and its request
  body; add, a new `signup` function directly after it.
- **Dependencies** — `/signup` and the rewritten `/login` (Lesson 17).

### The New Code — type this

```javascript
const username = document.getElementById("username-input").value;
```

And `signup`, built as `login`'s direct counterpart:

```javascript
function signup() {
    const username = document.getElementById("username-input").value;
    const password = document.getElementById("password-input").value;

    fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Signup failed");
            }
            return response.json();
        })
        .then((data) => {
            authMode = "login";
            renderAuthMode();
            document.getElementById("login-status").textContent = "Account created. Log in below.";
        })
        .catch((error) => {
            document.getElementById("login-status").textContent = "That username is already taken.";
        });
}
```

### The Updated Project — where this lives

`login`, with the new line and request body in place:

```javascript
function login() {
    const username = document.getElementById("username-input").value;   // ← new
    const password = document.getElementById("password-input").value;

    fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),   // ← changed: was { password: password }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Invalid username or password");             // ← changed: message updated
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
            document.getElementById("login-status").textContent = "Invalid username or password.";   // ← changed
        });
}
```

`signup`, placed directly after it, is shown whole above — a complete,
freestanding new function.

### Mechanical Walkthrough
`document.getElementById("username-input").value` reuses `.value` from
- Lesson 3, reading a text `<input>` instead of a `<textarea>` this time —
the same property, meaning the same thing on both element types, exactly
as Lesson 3 already noted about `<textarea>` versus `<input>`.
`JSON.stringify({ username: username, password: password })` reuses
serialization from Lesson 3's `saveFile`, now with two fields instead of
one. Inside `signup`'s success handler, `authMode = "login";
- renderAuthMode();` reuses this lesson's own state-then-render pattern —
after a successful signup, the form switches itself back to login mode
automatically, rather than leaving a person on a screen that no longer
matches what they should do next. `document.getElementById("login-status").textContent
= "Account created. Log in below."` reuses ordinary text assignment,
- repurposing `#login-status` — until now only ever used for errors — to
carry a genuinely good-news message this time.

### Run It

```
POST /signup {"username":"bob","password":"hunter2xyz"} → 200 {"username":"bob"}
POST /login  {"username":"bob","password":"hunter2xyz"} → 200 {"token":"9OI-yNlupX9xXiGAGvwSV-tzm93hF_Z8o4XMcRFkwvo"}
POST /signup {"username":"bob","password":"anything"}   → 400
```

All three confirmed directly against the real running server, using the
exact request shapes `signup()` and `login()` now send — the backend
side of this lesson was already fully built and verified in Lesson 17;
this lesson is entirely about the frontend finally calling it correctly.

---

## Concept Unit: making it actually look designed

### The Problem

The original login screen was left-aligned in the corner of an
otherwise blank page, using nothing but default browser styling for
every input and button — functional, and, exactly as raised directly:
not designed at all.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace, `#login-screen`'s entire CSS rule; add, a
  new `.auth-card` rule and several related ones.
- **Dependencies** — none new.

### The New Code — type this

```css
#login-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f4f5f7;
}
.auth-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 320px;
    padding: 32px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.auth-card h1 {
    margin: 0 0 8px 0;
    font-size: 20px;
}
.auth-card input {
    padding: 10px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}
.auth-card button {
    padding: 10px 12px;
    border: none;
    border-radius: 4px;
    background-color: #2563eb;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
}
.auth-card button:hover {
    background-color: #1d4ed8;
}
#auth-toggle {
    margin: 0;
    font-size: 13px;
    color: #666;
}
#auth-toggle-link {
    color: #2563eb;
    cursor: pointer;
}
#login-status {
    font-size: 13px;
    color: #c00;
}
```

### The Updated Project — where this lives

This replaces `#login-screen`'s old rule entirely, and adds every rule
above directly after it — the file's other CSS, `.layout` through
`.tab-close:hover` and every output panel's styling, is untouched:

```css
#login-screen {                          /* ← changed: was flex-direction/align-items:flex-start/gap/padding */
    display: flex;
    align-items: center;                 /* ← new */
    justify-content: center;             /* ← new */
    height: 100vh;                       /* ← new */
    background-color: #f4f5f7;           /* ← new */
}
.auth-card {                              /* ← new */
    display: flex;                        /* ← new */
    flex-direction: column;               /* ← new */
    gap: 12px;                            /* ← new */
    width: 320px;                         /* ← new */
    padding: 32px;                        /* ← new */
    background-color: #fff;               /* ← new */
    border-radius: 8px;                   /* ← new */
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);   /* ← new */
}                                          /* ← new */
.auth-card h1 {                           /* ← new */
    margin: 0 0 8px 0;                    /* ← new */
    font-size: 20px;                      /* ← new */
}                                          /* ← new */
.auth-card input {                        /* ← new */
    padding: 10px 12px;                   /* ← new */
    border: 1px solid #ccc;               /* ← new */
    border-radius: 4px;                   /* ← new */
    font-size: 14px;                      /* ← new */
}                                          /* ← new */
.auth-card button {                       /* ← new */
    padding: 10px 12px;                   /* ← new */
    border: none;                         /* ← new */
    border-radius: 4px;                   /* ← new */
    background-color: #2563eb;            /* ← new */
    color: #fff;                          /* ← new */
    font-size: 14px;                      /* ← new */
    cursor: pointer;                      /* ← new */
}                                          /* ← new */
.auth-card button:hover {                 /* ← new */
    background-color: #1d4ed8;            /* ← new */
}                                          /* ← new */
#auth-toggle {                            /* ← new */
    margin: 0;                            /* ← new */
    font-size: 13px;                      /* ← new */
    color: #666;                          /* ← new */
}                                          /* ← new */
#auth-toggle-link {                       /* ← new */
    color: #2563eb;                       /* ← new */
    cursor: pointer;                      /* ← new */
}                                          /* ← new */
#login-status {                           /* ← new */
    font-size: 13px;                      /* ← new */
    color: #c00;                          /* ← new */
}                                          /* ← new */
```

### Mechanical Walkthrough
`display: flex` on `#login-screen` reuses the same property `.layout`
already uses in Lesson 2 — but for a genuinely different purpose:
`.layout` uses it to place two panes *side by side*; here,
- `align-items: center` and `justify-content: center` — both first
appearances — use flexbox's *centering* behavior instead, centering
`.auth-card` both vertically and horizontally within `#login-screen`.
`height: 100vh` reuses the viewport-height unit from `.layout`.
`background-color` on `#login-screen` reuses the property from
`.sidebar li.clickable:hover`, a light gray instead, giving the card
something to visually sit on top of. `.auth-card`'s `display: flex;
flex-direction: column; gap: 12px;` reuses the exact shape
`#editor-pane`'s implicit stacking already relies on, made explicit
- here — `gap: 12px` spaces every direct child evenly without needing
margin on each one individually. `width: 320px` and `padding: 32px`
reuse ordinary sizing properties already used throughout this project.
`border-radius: 8px` reuses the property already used on `.sidebar li`
since Lesson 2, a larger value for a more visible rounded corner.
- `box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1)` is new: four values —
horizontal offset (`0`), vertical offset (`2px`, pushing the shadow
slightly downward), blur radius (`12px`, how soft the shadow's edge is),
- and a color — `rgba(0, 0, 0, 0.1)`, new on its own: the same
red/green/blue channels `#000`-style hex colors already use throughout
this project, plus a fourth **alpha** channel, `0.1`, meaning "10%
opaque" — a shadow that barely darkens whatever is behind it, rather
than a hard black block. `.auth-card h1` reuses `margin`/`font-size`
to shrink the heading down from a browser default `<h1>`'s much larger
size, fitting a compact card instead of a full page. `.auth-card input`
reuses `padding`/`border`/`border-radius`/`font-size`, all already-taught
properties, giving both `<input>` elements the same visual treatment as
`.auth-card`'s own border-radius, rather than each browser's differing
default input appearance. `.auth-card button` reuses the identical
property set for the submit button, plus `background-color: #2563eb`
- and `color: #fff` — a blue button with white text, `border: none`
removing the browser's default button border entirely, and `cursor:
pointer` reused from `.sidebar li.clickable` since Lesson 2, signaling
it's clickable the same way a folder entry already does.
`.auth-card button:hover` reuses the `:hover` pseudo-class from Lesson
2's `.sidebar li.clickable:hover`, here darkening the button's
background slightly on mouse-over instead of the sidebar's
highlight-on-hover. `#auth-toggle`, `#auth-toggle-link`, and
`#login-status` all reuse `font-size`/`color`/`margin`/`cursor`,
already-taught properties, sized and colored to read as smaller,
secondary text beneath the main form rather than competing with it.

---

## Connect the pieces

Opening the page for the first time: `authMode` starts `"login"`, and
- the `renderAuthMode();` call at the bottom of the script — reached the
instant the page finishes loading, the same way `loadFolder("")` always
has been — has already set the form's title, button text, and toggle
link to match, genuinely produced by that call rather than merely
agreeing with hardcoded HTML by coincidence. Clicking "Sign up"
calls `toggleAuthMode()`, flipping `authMode` to `"signup"` and
re-rendering the same form in place — no new elements created, nothing
about `#username-input` or `#password-input` touched at all, only their
surrounding labels and button. Filling in a new username and password
and clicking the now-relabeled submit button calls `submitAuth()`,
- which — because `authMode` is `"signup"` — calls `signup()`, sending
`POST /signup`. On success, `authMode` flips back to `"login"`
automatically, the form re-renders itself back to its original labels,
and `"Account created. Log in below."` appears. Typing the same
- credentials and clicking the button again now calls `login()` instead —
the identical two input fields, read the identical way, sent to a
different route entirely, because one small piece of state changed what
the whole form means.

## What breaks without this

Already demonstrated concretely, not hypothetically: before this lesson,
- `login()` never read `#username-input` at all — Lesson 17's `/login`
route, requiring a `username` field, would have received a request body
missing it entirely, confirmed by inspecting `login()`'s own code before
this lesson's fix. And visually — described directly, not measured —
the original `#login-screen` styling left every input and button in
whatever the browser's own default appearance happened to be, unstyled,
unaligned, in the corner of an otherwise blank page.

## Exercises

1. Open the app, sign up as a new user through the real page, confirm
   the form switches back to login mode with the "Account created"
   message, then log in with the same credentials.
2. Try signing up with a username you've already used and confirm "That
   username is already taken." appears without the page reloading or
   losing what was typed.
3. Click "Sign up" and "Log in" back and forth several times without
   submitting anything, and confirm the title, button text, and toggle
   text always match the current mode correctly.
4. In `renderAuthMode`, add a third ternary controlling a new
- `placeholder` value for `#password-input` — `"Choose a password"` in signup mode, `"Password"` in login mode — and wire it in following

   this lesson's exact pattern.

## Definition of done

- [ ] You've signed up, logged in, and toggled between both modes
      through the real running app
- [ ] You can explain why one form with a mode variable was chosen over
      two separate forms
- [ ] You can name the two other places in this project that already
      used the same "UI as a function of state" pattern before this
      lesson
- [ ] You can explain what the fourth value in `rgba(0, 0, 0, 0.1)`
      controls, and what would visually change if it were `1` instead
- [ ] `git commit` this lesson's code with a message explaining why
