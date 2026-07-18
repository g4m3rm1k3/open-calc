# Lesson 34: A Composable That Actually Shares State

## What you will build

The login screen, ported into `frontend/` as a real component,
`LoginScreen.vue` — and, underneath it, `useAuth.js`, the project's
first **composable**: a function multiple components call to reach the
exact same shared reactive state, replacing the plain global `let
authToken`/`let currentUsername` variables every function in the old
`index.html` could reach into just by sharing one script scope. Real
components don't share a scope that way, so this lesson builds the
real mechanism that takes its place — including a genuine, easy-to-fall-into
version of it that looks right and doesn't actually work, built and
run first, on purpose.

## What you need to know first

`Lesson 33 - The Same Reactivity, Different Syntax.md` — `ref()`,
`<script setup>`'s auto-exposure, verified through Vite's real compiled
output. `Lesson 30 - A Login Screen That Doesn't Read Its Own Inputs.md`
— `v-model`, the login/signup fetch logic itself, unchanged in behavior,
only in container. `Lesson 19 - Real Logout.md` — `sessionStorage`
persistence, reused identically.

---

## Concept Unit: a composable that forgot to share

### The Problem

`BackendStatus.vue`'s `ref()` (Lesson 33) lived entirely inside one
component — nothing else needed to see it. Auth state is different:
`LoginScreen.vue` needs to *set* `authToken` on a successful login, and
`App.vue` needs to *read* it to decide whether to show the login screen
at all. Two different components, one piece of state — and Vue
components don't automatically share anything just by both existing in
the same project.

### Concept Lab

```javascript
const { ref } = require("vue")

// The tempting, wrong version.
function useCounterWrong() {
    const count = ref(0)
    return { count }
}

const instanceA = useCounterWrong()
const instanceB = useCounterWrong()

instanceA.count.value = 5
console.log("instanceA.count.value:", instanceA.count.value)
console.log("instanceB.count.value:", instanceB.count.value)
```

Run it — actual output, this exact run:

```
instanceA.count.value: 5
instanceB.count.value: 0
```

### What This Proves

`useCounterWrong()` looks exactly like it should share state — it's a
function, it returns a `ref`, it has the `useXxx` name convention real
Vue composables use. It doesn't share anything. `ref(0)` is called
*inside* the function body, so every single call to
`useCounterWrong()` creates a brand-new, completely independent `ref`
— `instanceA` and `instanceB` each got their own `count`, confirmed
directly: changing one left the other completely untouched. This is
the exact shape `LoginScreen.vue` and `App.vue` would each end up with
if `useAuth()` were written this way — two disconnected copies of
"the current auth state," silently drifting apart the moment either
one changed.

### Discard

`useCounterWrong` is deleted now — it never appears in the project.

---

## Concept Unit: moving the state outside

### The Problem

The fix isn't a different kind of function — it's moving exactly one
line.

### Concept Lab

```javascript
const { ref } = require("vue")

const count = ref(0)

function useCounter() {
    return { count }
}

const instanceA = useCounter()
const instanceB = useCounter()

instanceA.count.value = 5
console.log("instanceA.count.value:", instanceA.count.value)
console.log("instanceB.count.value:", instanceB.count.value)
```

Run it — actual output, this exact run:

```
instanceA.count.value: 5
instanceB.count.value: 5
```

### What This Proves

`ref(0)` now runs exactly once — the moment this file is first
imported — at **module scope**, outside `useCounter()` entirely.
Every call to `useCounter()` still returns a fresh object literal
(`{ count }`), but `count` inside that object is the same `ref`
every time, because there's only ever one `ref` in existence to point
to. `instanceA` and `instanceB` are two separate return values sharing
one underlying reactive container — confirmed directly: changing it
through `instanceA` is visible through `instanceB` immediately, with
no explicit synchronization written anywhere. This is the entire
mechanism a **composable** relies on to share state across components:
state created once, at the top of the file, handed out by reference on
every call.

### Discard

`useCounter` is deleted now — it never appears in the project. The
real `useAuth.js`, next, uses this identical module-scope-state shape.

---

## Concept Unit: useAuth.js

### The Problem

`authToken` and `currentUsername` need to exist exactly once, shared
between whichever components need them, persisted across a page reload
— the same job `sessionStorage` already did for the plain global
variables in the old `index.html` (Lesson 19, Lesson 28).

### Project Change

- **Files affected** — `frontend/src/composables/useAuth.js`, new
  file.
- **Change type** — create.
- **Dependencies** — this lesson's own module-scope-state pattern;
  `sessionStorage`, unchanged since Lesson 19.

### The New Code — type this

```javascript
import { ref } from 'vue'

const authToken = ref(sessionStorage.getItem('authToken'))
const currentUsername = ref(sessionStorage.getItem('username'))

function setAuth(token, username) {
    authToken.value = token
    currentUsername.value = username
    sessionStorage.setItem('authToken', token)
    sessionStorage.setItem('username', username)
}

export function useAuth() {
    return { authToken, currentUsername, setAuth }
}
```

### The Updated Project — where this lives

This is the entire file — a brand-new module, nothing to place it
inside of.

### Mechanical Walkthrough

`ref(sessionStorage.getItem('authToken'))` — this lesson's
module-scope pattern, applied for real: `authToken`'s *starting* value
comes straight from `sessionStorage`, reusing Lesson 19's exact
persistence idea, so a page reload with a valid stored token starts
already logged in, with no separate bootstrap check needed the way the
old `index.html` required. `setAuth(token, username)` — first
appearance of a composable exposing a *function* alongside its state,
not just the state itself; every component that calls `useAuth()`
gets the identical `setAuth`, so the actual logic for "what does
logging in mean" lives in exactly one place, not copy-pasted into
every component that needs to trigger it. `export function useAuth()`
is what other files actually `import` (Lesson 32) — the two `const`
declarations above it are never exported directly, only reachable
through calling this function, the same encapsulation idea a Python
module achieves by simply not exposing a name.

### CS Lens — a singleton, reached through a function

`authToken` and `currentUsername`, existing exactly once no matter how
many components call `useAuth()`, is the **singleton** pattern — a
guarantee that only one instance of something exists, reached the same
way from anywhere that asks for it. `valid_tokens` on the backend
(a `set`, Lesson 8; a `dict`, Lesson 25) is a singleton in the same
sense: one collection, built once at module load, every route reaching
that same object rather than its own copy.

Also recognized in: a database connection pool (one pool, many
callers), Python's own module system (importing the same module twice
returns the same already-executed module object, not a fresh copy — the
exact mechanism this composable relies on), a logging configuration
object shared across an entire application.

### SE Lens — no encapsulation the language actually enforces

Nothing stops a component from calling `useAuth().authToken.value = "fake"`
directly, bypassing `setAuth` and its `sessionStorage` write entirely
— `authToken` is returned as a real, mutable `ref`, not a read-only
view. The alternative, actually enforcing that only `setAuth` can
change it, would need a different mechanism (a `readonly()`-wrapped
ref, still mutable through `setAuth`'s own closure) — not used here,
on purpose, matching this project's `write_file`/`checkout` pattern
(Lesson 26): the backend is the actual source of truth for whether a
change is *valid*; this composable's job is convenience and sharing, not
enforcement.

---

## Concept Unit: LoginScreen.vue

### The Problem

The login/signup screen, fully built and verified once already
(Lesson 30) against the old CDN/Options-API app, needs to exist for
real inside `frontend/`, using `useAuth()` for its shared state
instead of writing directly to global variables.

### Project Change

- **Files affected** — `frontend/src/components/LoginScreen.vue`, new
  file.
- **Change type** — create.
- **Dependencies** — `useAuth()`, this lesson's own composable;
  `v-model` (Lesson 30).

### The New Code — type this

The reactive state and the mode toggle — a direct port of Lesson 30's
own logic, `ref()` in place of `data()`:

```html
<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const { setAuth } = useAuth()

const mode = ref('login')
const username = ref('')
const password = ref('')
const statusMessage = ref('')

function toggleMode() {
    mode.value = mode.value === 'login' ? 'signup' : 'login'
    statusMessage.value = ''
}
</script>
```

`submitAuth` dispatches to one or the other, reading `mode.value`
instead of `this.mode`:

```javascript
function submitAuth() {
    if (mode.value === 'login') {
        login()
    } else {
        signup()
    }
}
```

`login`'s success path calls `setAuth` instead of touching global
variables directly — everything else about the request is unchanged
from Lesson 30:

```javascript
function login() {
    fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.value, password: password.value }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Invalid username or password')
            }
            return response.json()
        })
        .then((data) => {
            setAuth(data.token, username.value)
        })
        .catch(() => {
            statusMessage.value = 'Invalid username or password.'
        })
}
```

`signup` doesn't touch `useAuth()` at all — a new account still has to
log in separately afterward, unchanged from Lesson 30's own reasoning:

```javascript
function signup() {
    fetch('http://127.0.0.1:8000/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.value, password: password.value }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Signup failed')
            }
            return response.json()
        })
        .then(() => {
            mode.value = 'login'
            statusMessage.value = 'Account created. Log in below.'
        })
        .catch(() => {
            statusMessage.value = 'That username is already taken.'
        })
}
```

The template — `v-model` and the same ternary-in-interpolation shape
from Lesson 30, typed against `ref()`-backed values instead of
`data()`-backed ones:

```html
<template>
  <div class="login-screen">
    <div class="auth-card">
      <h1>{{ mode === 'login' ? 'Log In' : 'Sign Up' }}</h1>
      <input type="text" v-model="username" placeholder="Username">
      <input type="password" v-model="password" placeholder="Password">
      <button @click="submitAuth">{{ mode === 'login' ? 'Log In' : 'Sign Up' }}</button>
      <span class="login-status">{{ statusMessage }}</span>
      <p class="auth-toggle">
        <span>{{ mode === 'login' ? "Don't have an account?" : 'Already have an account?' }}</span>
        <span class="auth-toggle-link" @click="toggleMode">{{ mode === 'login' ? 'Sign up' : 'Log in' }}</span>
      </p>
    </div>
  </div>
</template>
```

### The Updated Project — where this lives

This is a brand-new component file — every piece shown above,
assembled in the order shown (state and `toggleMode` first, then
`submitAuth`, `login`, `signup`, then the template), is the entire
file, nothing left out.

### Mechanical Walkthrough

Nothing in this unit is new syntax — every construct (`ref()`,
`v-model`, `@click`, ternary-in-interpolation) was isolated and
explained in an earlier lesson. What changed, traced directly against
Lesson 30's version: `this.username`/`this.password` became
`username.value`/`password.value`; `document.getElementById("login-screen")`
and the manual `style.display` toggling are gone entirely — this
component doesn't decide whether it's visible, its *parent* does (the
next unit); `authToken = data.token; currentUsername = this.username`
— two separate assignments to global variables — became one call,
`setAuth(data.token, username.value)`, the composable's own function
doing both at once, plus the `sessionStorage` writes Lesson 30 wrote
inline every single time.

### Run It

Confirmed by extracting this exact `<script setup>` logic and running
it against a real backend, not the compiled template (still outside
jsdom's reach, per Lesson 32/33's own honest limit) — actual output,
this exact run:

```
1) initial mode: login
2) after toggleMode(): signup
3) after signup submit, statusMessage: Account created. Log in below. | mode: login
4) after login submit, authToken set: true
5) after login with wrong credentials, statusMessage: Invalid username or password.
6) after signup with a taken username, statusMessage: That username is already taken.
```

All six real scenarios from Lesson 30's own verification, reproduced
here against the ported component's actual logic — nothing about the
*behavior* changed in the port, confirmed rather than assumed.

---

## Concept Unit: App.vue decides who's showing

### The Problem

Something has to actually read `authToken` and decide whether to show
`LoginScreen` or the rest of the app — the old `index.html` did this by
directly toggling two elements' `style.display`; a real component tree
needs a different mechanism.

### Project Change

- **Files affected** — `frontend/src/App.vue`, existing file.
- **Change type** — replace.
- **Dependencies** — `useAuth()`, `LoginScreen.vue`.

### The New Code — type this

```html
<script setup>
import BackendStatus from './components/BackendStatus.vue'
import LoginScreen from './components/LoginScreen.vue'
import { useAuth } from './composables/useAuth.js'

const { authToken, currentUsername } = useAuth()
</script>

<template>
  <BackendStatus />
  <LoginScreen v-if="authToken === null" />
  <div v-else>
    <h1>Engineering Workspace Platform</h1>
    <p>Logged in as {{ currentUsername }}.</p>
  </div>
</template>
```

### The Updated Project — where this lives

This is the entire file — `App.vue` is small enough that "the new
code" and "the whole file" are the same thing.

### Mechanical Walkthrough

`const { authToken, currentUsername } = useAuth()` — calling this
lesson's composable from a *second* component; `authToken` here is the
identical `ref` `LoginScreen.vue` reads and writes through `setAuth`,
confirmed directly in this lesson's earlier `useAuth` verification
(two independent call sites, one shared `ref`). `v-if="authToken === null"`
reuses `v-if` (Lesson 31) — a `ref` is auto-unwrapped inside a
template expression exactly like inside `{{ }}` (Lesson 33), so this
reads `authToken.value === null` without needing `.value` written
explicitly. `<div v-else>` is `v-if`'s companion, first used together
this way in this project: exactly one of `LoginScreen` or the `<div>`
renders at any moment, never both, never neither.

### CS Lens — declarative visibility, not manual toggling

The old `document.getElementById("login-screen").style.display = "none"`
/ `"flex"` pairing (Lesson 19, Lesson 30) is an **imperative** instruction:
*do this specific DOM mutation, right now*. `v-if="authToken === null"`
is **declarative** (Lesson 29's own CS Lens, applied again): it states
the *condition* under which `LoginScreen` should exist at all, and
Vue keeps that true automatically, forever, as `authToken` changes —
including from a `setAuth` call happening inside a completely different
component. No code anywhere says "now hide the login screen"; it's
just no longer true that the login screen should exist, and Vue acts
on that.

### Run It

Confirmed via Vite's real compiled output for `App.vue`, proving the
conditional structure compiles exactly as written — the `key: 1`
marker is Vue's own internal bookkeeping for the `v-else` branch,
distinguishing it from the `v-if` branch it pairs with:

```javascript
_openBlock(), (authToken.value === null)
  ? _createBlock($setup["LoginScreen"], { key: 0 })
  : (_openBlock(), _createElementBlock("div", _hoisted_1, [
      _createElementVNode("h1", null, "Engineering Workspace Platform"),
      _createElementVNode("p", null, "Logged in as " + _toDisplayString($setup.currentUsername), 1)
    ]))
```

Combined with the previous unit's real login/signup verification —
`setAuth` genuinely mutating the shared `authToken` — this is real,
checkable proof that a successful login changes exactly the value this
compiled conditional is watching.

---

## Connect the pieces

`App.vue` and `LoginScreen.vue` both call `useAuth()`, receiving
references to the same two `ref`s — confirmed directly, not assumed,
in this lesson's own composable verification. On page load, with no
stored session, `authToken.value` is `null`, so `App.vue`'s
`v-if="authToken === null"` renders `LoginScreen`. Submitting valid
credentials runs `login()`, which calls `setAuth(data.token, username.value)`
— the *same* `authToken` `App.vue` is watching updates, `sessionStorage`
is written, and on the very next render, Vue re-evaluates
`authToken === null`, finds it false, and swaps `LoginScreen` out for
the logged-in view — all without `LoginScreen.vue` ever needing to
know `App.vue` exists, or vice versa. Both components only know about
`useAuth()`.

## What breaks without this

Confirmed directly by tracing `useCounterWrong` from this lesson's
first unit: had `useAuth`'s two `ref()` calls been written *inside*
`useAuth()` instead of at module scope, `LoginScreen.vue` and
`App.vue` would each receive their own independent `authToken` —
`setAuth` inside `LoginScreen` would update its own private copy, and
`App.vue`'s `v-if` would keep watching a `ref` that never changed,
permanently stuck showing the login screen even after a real,
successful login. This is not a hypothetical: it's the literal first
concept lab in this lesson, with real, pasted output showing exactly
that disconnect.

## Exercises

1. Run `npm run dev`, sign up, log in, and confirm the login screen is
   replaced by "Logged in as [your username]." — completing the visual
   confirmation Lesson 33 also deferred to a real browser.
2. Reload the page after logging in and confirm you're still logged
   in — `useAuth`'s `sessionStorage`-backed initial value doing its job
   without any separate bootstrap check.
3. In `useAuth.js`, temporarily move both `ref()` calls inside
   `useAuth()` itself (reproducing this lesson's first, wrong pattern)
   and confirm — in a real browser — that logging in no longer
   dismisses the login screen, even though the network request still
   visibly succeeds. Then restore the fix.
4. Explain, without looking back at this lesson, why `App.vue` never
   directly imports or reads anything from `LoginScreen.vue`, despite
   depending on the result of what happens inside it.

## Definition of done

- [ ] You've logged in through the real running app and watched the
      login screen get replaced by the logged-in view
- [ ] You've confirmed a page reload preserves the logged-in state
- [ ] You've reproduced this lesson's exact "forgot to share" bug in
      `useAuth.js` itself, watched it fail in a real browser, and
      restored the fix
- [ ] You can explain, in your own words, why moving one `ref()` call
      from inside a function to module scope is the entire difference
      between broken and working shared state
- [ ] `git commit` this lesson's code with a message explaining why
