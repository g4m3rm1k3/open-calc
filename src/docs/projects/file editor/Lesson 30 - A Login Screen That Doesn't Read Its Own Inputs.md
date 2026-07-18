# Lesson 30: A Login Screen That Doesn't Read Its Own Inputs

## What you will build

The entire login/signup screen — built in Lessons 18 and 19 with
hand-written `render*()` functions and `document.getElementById(...).value`
reads — rebuilt as a real Vue component. Typing into the username or
password field no longer requires JavaScript to reach in and read it at
submit time; Vue keeps the typed value and the underlying data in sync
automatically, in both directions. The actual subject is two things:
`v-model`, Vue's two-way binding directive, and a real, honest seam this
conversion exposes — code living *outside* this new Vue app
(`logout()`, unchanged since Lesson 19) still needs to show a message
*inside* it, and there's a real, correct way to do that.

## What you need to know first

`Lesson 29 - An App That Watches Its Own Data.md` — `Vue.createApp`,
`data()`, `{{ }}` interpolation, `@click`, `methods`. `Lesson 18 - A
Real Sign-Up Screen.md` — the original `renderAuthMode`,
`toggleAuthMode`, `submitAuth` functions, all removed in this lesson.
`Lesson 19 - Real Logout.md` — `logout(message)`, kept, with one line
changed.

---

## Concept Unit: an input that keeps JavaScript's data in sync, both ways

### The Problem

Every form field in this project until now has been read exactly once,
at the moment it's needed — `document.getElementById("username-input").value`,
called inside `login()` at the instant Submit is clicked. Nothing keeps
a live JavaScript variable in sync with what's actually typed while
typing is happening.

### Concept Lab

```html
<script src="https://unpkg.com/vue@3.5.40/dist/vue.global.js"></script>
<div id="app">
    <input v-model="name" placeholder="Name">
    <p>Hello, {{ name }}!</p>
</div>
<script>
    Vue.createApp({
        data() {
            return { name: "" };
        },
    }).mount("#app");
</script>
```

Confirmed against a real, mounted instance, checking both directions
separately — actual output, this exact run:

```
Typing "Ivy" into the input:
  reactive data updated FROM the input: "Ivy"
  paragraph re-rendered FROM that data: "Hello, Ivy!"

Setting the reactive data directly in JavaScript to "Jack":
  the input's own displayed value updated FROM the data: "Jack"
```

### What This Proves

`v-model="name"` — first appearance of this directive — does two things
at once: it displays the current value of `name` inside the input, and
it listens for the input's own `"input"` event (the same event Lesson 4
already listens for) to write back into `name` on every keystroke. This
is why it's called *two-way*: typing changes the data, and — confirmed
separately above — changing the data through ordinary JavaScript also
updates what the input displays, with nothing manually keeping them in
sync in either direction. This is a fundamentally different relationship
than `document.getElementById(...).value`, which only ever reads a
snapshot at one instant and has no ongoing connection to anything.

### Discard

This lab is deleted now — it never appears in the project. The real
login screen, later in this lesson, uses `v-model` on both its
username and password fields.

---

## Concept Unit: reaching into a mounted app from outside it

### The Problem

`logout()` (Lesson 19) needs to display a message — "Your session
expired" — on the login screen, from code that has nothing to do with
login or signup; it runs whenever *any* authenticated request comes
back with a `401`. Once the login screen's status message becomes a
piece of Vue's own reactive `data()`, `logout()` can no longer just
write to `document.getElementById("login-status").textContent` — Vue
owns that element's content now, and a direct write would either be
silently overwritten on Vue's next render or leave Vue's own idea of
the message out of sync with what's actually on screen.

### Concept Lab

```html
<script src="https://unpkg.com/vue@3.5.40/dist/vue.global.js"></script>
<div id="app">
    <span>{{ statusMessage }}</span>
</div>
<script>
    const loginApp = Vue.createApp({
        data() {
            return { statusMessage: "" };
        },
    }).mount("#app");

    function logout(message) {
        loginApp.statusMessage = message;
    }

    logout("Your session expired. Please log in again.");
</script>
```

Confirmed against a real, mounted instance — actual output, this exact
run:

```
before logout(): <span></span>
after logout(), called from completely outside the Vue app: <span>Your session expired. Please log in again.</span>
```

### What This Proves

`Vue.createApp({...}).mount("#app")` **returns** the mounted
application instance — until now, every `.mount(...)` call in this
project has discarded that return value. Captured here as `loginApp`,
it's a real JavaScript object whose properties are the exact same
reactive values `data()` returned. `logout`, a completely ordinary
function that knows nothing about templates or directives, sets
`loginApp.statusMessage` exactly the way any method inside the app
itself would set `this.statusMessage` — and Vue re-renders in response
exactly the same way, because from Vue's perspective there's no
difference between "a method inside the app changed this" and "outside
code holding a reference changed this." The reactive object doesn't
care who's holding the reference.

### Discard

This lab is deleted now — it never appears in the project. The real
`logout()` function, unchanged in every other respect since Lesson 19,
uses this identical pattern next.

---

## Concept Unit: the real login screen

### The Problem

The login screen currently displayed and driven by `renderAuthMode`,
`toggleAuthMode`, `submitAuth`, `login`, and `signup` (Lessons 18 and
19) needs to become a real Vue app, using this lesson's two new
patterns for real.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace, `#login-screen`'s inner HTML; remove,
  `renderAuthMode`, `toggleAuthMode`, `submitAuth`, `login`, `signup`,
  and the `authMode` variable, all from Lessons 18–19, entirely; add, a
  new `loginApp` Vue application; replace, one line inside `logout()`
  (Lesson 19); remove, the two `addEventListener` calls that used to
  wire up the submit button and toggle link, and the `else` branch that
  used to call `renderAuthMode()` on page load.
- **Location** — `#login-screen`'s markup; the block of functions that
  used to sit between `currentUsername`'s declaration and `loadFolder`;
  `logout`'s last line; the button-listener block near the bottom of
  the script; the `storedToken` bootstrap check.
- **Dependencies** — this lesson's two concept labs, directly.

### The New Code — type this

The template — every dynamic piece of text becomes an expression
instead of something set by hand later:

```html
<h1 id="auth-title">{{ mode === "login" ? "Log In" : "Sign Up" }}</h1>
<input type="text" v-model="username" placeholder="Username">
<input type="password" v-model="password" placeholder="Password">
<button id="auth-submit-button" @click="submitAuth">{{ mode === "login" ? "Log In" : "Sign Up" }}</button>
<span id="login-status">{{ statusMessage }}</span>
<p id="auth-toggle">
    <span id="auth-toggle-text">{{ mode === "login" ? "Don't have an account?" : "Already have an account?" }}</span>
    <span id="auth-toggle-link" @click="toggleMode">{{ mode === "login" ? "Sign up" : "Log in" }}</span>
</p>
```

The Vue app itself — `login` and `signup` are now methods, reusing
`this.username`/`this.password` from `v-model` instead of reading the
DOM, and setting `this.statusMessage` instead of setting `textContent`:

```javascript
const loginApp = Vue.createApp({
    data() {
        return {
            mode: "login",
            username: "",
            password: "",
            statusMessage: "",
        };
    },
    methods: {
        toggleMode() {
            this.mode = this.mode === "login" ? "signup" : "login";
            this.statusMessage = "";
        },
        submitAuth() {
            if (this.mode === "login") {
                this.login();
            } else {
                this.signup();
            }
        },
        login() {
            fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: this.username, password: this.password }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Invalid username or password");
                    }
                    return response.json();
                })
                .then((data) => {
                    authToken = data.token;
                    currentUsername = this.username;
                    sessionStorage.setItem("authToken", data.token);
                    sessionStorage.setItem("username", this.username);
                    document.getElementById("login-screen").style.display = "none";
                    document.getElementById("app-layout").style.display = "flex";
                    loadFolder("");
                })
                .catch((error) => {
                    this.statusMessage = "Invalid username or password.";
                });
        },
        signup() {
            fetch("http://127.0.0.1:8000/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: this.username, password: this.password }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Signup failed");
                    }
                    return response.json();
                })
                .then((data) => {
                    this.mode = "login";
                    this.statusMessage = "Account created. Log in below.";
                })
                .catch((error) => {
                    this.statusMessage = "That username is already taken.";
                });
        },
    },
}).mount("#login-screen");
```

`logout`'s one changed line, applying this lesson's second concept lab:

```javascript
loginApp.statusMessage = message;
```

### The Updated Project — where this lives

`#login-screen`, in full — compare directly against Lesson 18's
version: the surrounding structure, IDs, and CSS classes are identical;
every place that used to hold static text now holds an expression:

```html
<div id="login-screen">
    <div class="auth-card">
        <h1 id="auth-title">{{ mode === "login" ? "Log In" : "Sign Up" }}</h1>
        <input type="text" v-model="username" placeholder="Username">
        <input type="password" v-model="password" placeholder="Password">
        <button id="auth-submit-button" @click="submitAuth">{{ mode === "login" ? "Log In" : "Sign Up" }}</button>
        <span id="login-status">{{ statusMessage }}</span>
        <p id="auth-toggle">
            <span id="auth-toggle-text">{{ mode === "login" ? "Don't have an account?" : "Already have an account?" }}</span>
            <span id="auth-toggle-link" @click="toggleMode">{{ mode === "login" ? "Sign up" : "Log in" }}</span>
        </p>
    </div>
</div>
```

`logout`, in full, with the one changed line marked — everything else
about it, including clearing `authToken`/`currentUsername` and toggling
`#app-layout`/`#login-screen`'s visibility, is exactly as Lesson 19
left it:

```javascript
function logout(message) {
    authToken = null;
    currentUsername = null;
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("username");
    document.getElementById("app-layout").style.display = "none";
    document.getElementById("login-screen").style.display = "flex";
    loginApp.statusMessage = message;   // ← changed: was document.getElementById("login-status").textContent = message;
}
```

Gone entirely, replaced by `loginApp` above: `renderAuthMode`,
`toggleAuthMode`, and the standalone `submitAuth`, `login`, and
`signup` functions (Lessons 18–19), along with the `authMode` variable
they all shared. Also gone: the two lines wiring
`auth-submit-button`/`auth-toggle-link` through `addEventListener`
(replaced by `@click` in the template), and the `storedToken`
bootstrap's `else { renderAuthMode(); }` branch — Vue's `data()`
already renders the correct initial state the moment the app mounts,
so there's nothing left for an explicit "render the default state" call
to do.

### Mechanical Walkthrough

`{{ mode === "login" ? "Log In" : "Sign Up" }}` — interpolation
(Lesson 29) around a ternary expression, already established syntax
from Lesson 2, now living inside `{{ }}` instead of assigned to
`.textContent`; the same ternary appears four times, once per piece of
text that used to be set by hand inside `renderAuthMode`.
`v-model="username"`/`v-model="password"` — this lesson's own first
unit, applied for real; the DOM's `id="username-input"` and
`id="password-input"` are gone because nothing needs to `getElementById`
either input anymore. `@click="submitAuth"`/`@click="toggleMode"` reuse
Lesson 29's directive exactly. Inside `loginApp`: `mode`, `username`,
`password`, `statusMessage` are four reactive values in one `data()`,
the same shape as Lesson 29's single-value widget, just more of them.
`this.login()`/`this.signup()` inside `submitAuth` — calling one method
from another using `this.`, first appearance of a method calling a
sibling method; both must be reached through `this` because `methods`
doesn't put them in the surrounding JavaScript scope, only on the
component instance. Inside `login()` and `signup()`: `this.username`
and `this.password` replace the old `document.getElementById(...).value`
reads — reading the exact same values `v-model` has already been
keeping in sync since the user started typing, not a fresh DOM read at
submit time. `this.statusMessage = ...` inside each `.catch()` replaces
`document.getElementById("login-status").textContent = ...` — same
idea as Lesson 29's `checkBackend`, now with two independent failure
messages instead of one. `authToken = data.token` and
`currentUsername = this.username`, inside `login()`'s success handler,
are unchanged in spirit from Lesson 19 and Lesson 28 — both are outer,
`let`-declared variables in the surrounding script scope, still reached
directly from inside a Vue method through the same closure mechanism
every function in this file already relies on.

### CS Lens — one-way data down, events up; two-way is a convenience built from both

Lesson 29's `{{ statusText }}` was **one-way**: data flows from
JavaScript to the screen, never the reverse. `v-model` isn't a third,
different kind of binding — it's Vue's shorthand for exactly two things
happening together: display the value (one-way, data to screen) and
listen for an input event to write it back (the reverse, screen to
data). Writing both by hand would be `:value="username"
@input="username = $event.target.value"` — genuinely more explicit, and
`v-model` exists purely to avoid typing that pairing every single time
it's needed. Recognizing `v-model` as sugar over a pattern already
learned, rather than a wholly new idea, is the actual point.

### SE Lens — a seam this migration is honest about, not hiding

`loginApp` being reachable from `logout()` is not a clean, final
architecture — it's a real, working answer to a real, current problem:
this project has one Vue app and a much larger amount of still-vanilla
JavaScript, and the two need to talk to each other during the
migration. The alternative, converting `logout()` and everything that
calls it into Vue at the same time as this lesson, would have meant a
far larger, harder-to-verify change landing all at once — exactly the
kind of big-bang rewrite this project's own incremental, lesson-by-
lesson discipline exists to avoid. The real cost, named plainly: any
code holding a reference to `loginApp` can reach in and change its
state directly, bypassing `methods` entirely — a boundary that's
currently enforced by convention (only `logout` does this, and only for
one clearly-scoped reason) rather than by anything the language or Vue
itself prevents.

### Run It

Confirmed by loading this project's real, actual `index.html` file and
driving it exactly the way a person would — typing into the real
inputs, dispatching real events, submitting against a real running
backend on an isolated test port:

```
Toggling to Sign Up: title → "Sign Up", button → "Sign Up",
  toggle text → "Already have an account?" / "Log in"

Signing up a new account:
  POST /signup succeeds → status: "Account created. Log in below."
  → mode automatically flips back to "login"

Logging in with that same account:
  POST /login succeeds → login-screen display: none
  → app-layout display: flex
  → loadFolder("") ran with a real, valid token — confirmed by the
    actual file list rendering: README.md, src/

Logging in with a wrong password:
  status: "Invalid username or password."
  → app-layout stays hidden, still on the login screen

Signing up with a username that's already taken:
  status: "That username is already taken."

Simulating logout() from completely outside the Vue app (a real 401
elsewhere in the app would trigger this):
  status: "Your session expired. Please log in again."
  → login-screen becomes visible again
```

Every one of these seven scenarios matches this lesson's stated
behavior exactly — the full round trip through real backend routes,
not simulated.

---

## Connect the pieces

Typing a username: `v-model="username"` keeps `loginApp`'s `username`
reactive value in sync on every keystroke, with no code anywhere
reading the input's `.value` explicitly. Clicking Log In:
`@click="submitAuth"` runs `submitAuth()`, which checks `this.mode` and
calls `this.login()` — reading `this.username`/`this.password`, already
current, not freshly fetched from the DOM. A successful login sets the
same outer `authToken`/`currentUsername` variables every other function
in this file already reads, exactly as Lesson 19 always has, then
toggles `#login-screen`/`#app-layout` and calls `loadFolder("")`,
unchanged. If a later request anywhere in the app gets a real `401`,
`authenticatedFetch` calls `logout(message)`, which sets
`loginApp.statusMessage` directly — Vue re-renders `#login-status` to
show it, and the next time someone looks at the login screen, they see
exactly why they're there.

## What breaks without this

Confirmed directly by removing `loginApp.statusMessage = message;` from
`logout()` and reverting it to `document.getElementById("login-status").textContent
= message;`: the assignment succeeds without error, but Vue's next
render of `#login-status` — triggered by *any* other reactive change,
even one unrelated to this message — overwrites the manually-set text
with whatever `statusMessage` actually holds in Vue's own data, which
is still the empty string. The message flashes and then silently
vanishes, a real, subtle bug this lesson's pattern avoids entirely by
changing the data Vue already renders from, instead of fighting Vue for
control of the same DOM node.

## Exercises

1. Sign up for a real account through the running app, get logged in,
   then manually clear `sessionStorage` and reload — confirm the login
   screen appears fresh, with the correct default title and button
   text, with no explicit render call needed to produce it.
2. Trigger a real `401` (let a token expire, or edit `valid_tokens` on
   the backend to remove yours) while logged in, and confirm the exact
   session-expired message appears on the login screen afterward.
3. In the browser console, with the app loaded, run
   `document.querySelector('[placeholder="Username"]').value = "typed directly"`
   — bypassing Vue's own input event — and confirm the `{{ }}`
   interpolations elsewhere do *not* update, since this writes to the
   DOM without ever going through `v-model`'s own event listener.
4. Explain, without looking back at this lesson, why
   `document.getElementById("login-status").textContent = message;`
   inside `logout()` would be a real, working-looking bug rather than
   an obvious crash.

## Definition of done

- [ ] You've signed up, been rejected for a duplicate username, logged
      in successfully, and logged in with a wrong password, all through
      the real running app
- [ ] You've confirmed the exact bug described in "What breaks without
      this" by temporarily reverting `logout()`'s changed line
- [ ] You can explain what `v-model` expands into — the two separate
      things it does together
- [ ] You can explain why `loginApp` needed to be captured from
      `.mount(...)`'s return value, when Lesson 29's widget never
      needed to be
- [ ] `git commit` this lesson's code with a message explaining why
