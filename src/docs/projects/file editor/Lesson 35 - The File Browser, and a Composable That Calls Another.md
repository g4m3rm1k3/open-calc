# Lesson 35: The File Browser, and a Composable That Calls Another

## What you will build

The file browser sidebar, ported into `frontend/` as `FileBrowser.vue`,
backed by a new composable, `useFileSystem.js` — which itself calls
`useAuth.js` (Lesson 34) to make real, authenticated requests. Getting
there first requires finishing `useAuth.js`: `authenticatedFetch` and
real `401` handling, unbuilt until now because nothing in the new
project needed an authenticated request yet. No new Vue syntax appears
in this lesson at all — every directive and API was isolated in an
earlier lesson. What's new is entirely architectural: composables
calling other composables, and a component that loads its own data the
moment it's created, with nothing external telling it to.

## What you need to know first

`Lesson 34 - A Composable That Actually Shares State.md` — `useAuth.js`,
the module-scope-sharing pattern, `ref()`. `Lesson 31 - A List That
Renders Itself.md` — `v-for`/`:key`, the original `renderFileList`
this component replaces. `Lesson 19 - Real Logout.md` —
`authenticatedFetch`'s original shape, reused here nearly verbatim.

---

## Concept Unit: finishing useAuth.js

### The Problem

`loadFolder` needs to call `/files` with a real `Authorization` header
— nothing in `useAuth.js` does that yet, since `LoginScreen.vue`'s own
requests (`/login`, `/signup`) don't need a token at all. And once a
real authenticated request exists, it can fail with a real `401`,
which needs a real, correct response — the same problem Lesson 19
solved once already, now needing a home inside a composable instead of
a global function.

### Project Change

- **Files affected** — `frontend/src/composables/useAuth.js`, existing
  file; `frontend/src/components/LoginScreen.vue` (Lesson 34), existing
  file.
- **Change type** — add, `authMessage`, `clearAuth`, `authenticatedFetch`;
  replace, `setAuth` (one new line) and `useAuth`'s own return value;
  replace, `LoginScreen.vue`'s local `statusMessage` ref with the new
  shared `authMessage`, everywhere it was used.
- **Location** — `useAuth.js`, alongside `authToken`/`currentUsername`/
  `setAuth` (Lesson 34); `LoginScreen.vue`'s state declarations,
  `toggleMode`, `login`, `signup`, and its template.
- **Dependencies** — none new; `fetch`, unchanged since Lesson 1.

### The New Code — type this

A third piece of shared state, alongside the two Lesson 34 already
built:

```javascript
const authMessage = ref('')
```

`setAuth` gains one line, clearing any leftover message from a
previous failed attempt:

```javascript
authMessage.value = ''
```

`clearAuth` — first appearance — is `setAuth`'s mirror image, releasing
the session instead of establishing one:

```javascript
function clearAuth(message) {
    authToken.value = null
    currentUsername.value = null
    authMessage.value = message
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('username')
}
```

`authenticatedFetch` — Lesson 19's own logic, unchanged in behavior,
reading `authToken.value` instead of a plain global variable:

```javascript
function authenticatedFetch(url, options) {
    const fetchOptions = {
        ...options,
        headers: {
            ...(options && options.headers),
            Authorization: 'Bearer ' + authToken.value,
        },
    }

    return fetch(url, fetchOptions).then((response) => {
        if (response.status === 401) {
            clearAuth('Your session expired. Please log in again.')
            throw new Error('Session expired')
        }
        return response
    })
}
```

### The Updated Project — where this lives

`useAuth.js`, in full, with every new and changed line marked:

```javascript
import { ref } from 'vue'

const authToken = ref(sessionStorage.getItem('authToken'))
const currentUsername = ref(sessionStorage.getItem('username'))
const authMessage = ref('')                                            // ← new

function setAuth(token, username) {
    authToken.value = token
    currentUsername.value = username
    authMessage.value = ''                                             // ← new
    sessionStorage.setItem('authToken', token)
    sessionStorage.setItem('username', username)
}

function clearAuth(message) {                                          // ← new
    authToken.value = null                                             // ← new
    currentUsername.value = null                                       // ← new
    authMessage.value = message                                        // ← new
    sessionStorage.removeItem('authToken')                             // ← new
    sessionStorage.removeItem('username')                              // ← new
}                                                                        // ← new

function authenticatedFetch(url, options) {                            // ← new
    const fetchOptions = {                                              // ← new
        ...options,                                                     // ← new
        headers: {                                                      // ← new
            ...(options && options.headers),                            // ← new
            Authorization: 'Bearer ' + authToken.value,                 // ← new
        },                                                               // ← new
    }                                                                     // ← new

    return fetch(url, fetchOptions).then((response) => {                // ← new
        if (response.status === 401) {                                  // ← new
            clearAuth('Your session expired. Please log in again.')     // ← new
            throw new Error('Session expired')                          // ← new
        }                                                                 // ← new
        return response                                                  // ← new
    })                                                                     // ← new
}                                                                           // ← new

export function useAuth() {
    return { authToken, currentUsername, authMessage, setAuth, clearAuth, authenticatedFetch }  // ← changed
}
```

`LoginScreen.vue` (Lesson 34) switches from its own local
`statusMessage` ref to this shared `authMessage`, throughout — a small
but real simplification: what used to be two separate mechanisms (a
component-local error message, and Lesson 30's old CDN-era hack of
reaching into a mounted app instance from outside it) collapses into
one shared piece of state, since `clearAuth` and `LoginScreen.vue` both
just write to the same `authMessage` composables already hand out to
anyone who calls `useAuth()`. Every line that touched the old local ref
changes to the shared one:

```diff
- const { setAuth } = useAuth()
+ const { setAuth, authMessage } = useAuth()

  const mode = ref('login')
  const username = ref('')
  const password = ref('')
- const statusMessage = ref('')

  function toggleMode() {
      mode.value = mode.value === 'login' ? 'signup' : 'login'
-     statusMessage.value = ''
+     authMessage.value = ''
  }
```

The same rename repeats in `login`'s own `.catch()`:

```diff
      .catch(() => {
-         statusMessage.value = 'Invalid username or password.'
+         authMessage.value = 'Invalid username or password.'
      })
```

In `signup`'s success handler:

```diff
      .then(() => {
          mode.value = 'login'
-         statusMessage.value = 'Account created. Log in below.'
+         authMessage.value = 'Account created. Log in below.'
      })
```

And `signup`'s own `.catch()`:

```diff
      .catch(() => {
-         statusMessage.value = 'That username is already taken.'
+         authMessage.value = 'That username is already taken.'
      })
```

The message text itself never changes in any of the three — only which
ref each one writes to. Once more in the template:

```diff
-     <span class="login-status">{{ statusMessage }}</span>
+     <span class="login-status">{{ authMessage }}</span>
```

### Mechanical Walkthrough

`ref('')` — reused from Lesson 33, nothing new. `clearAuth(message)` —
a plain function taking a parameter, exactly like `setAuth`; nothing
about composables changes how ordinary JavaScript functions work.
`...options` and `...(options && options.headers)` — the spread
operator, already used in this exact shape in the old `index.html`'s
`authenticatedFetch` (Lesson 19), unchanged. `fetch(url, fetchOptions).then(...)`
reuses `fetch`/`.then()` verbatim; `response.status === 401` is Lesson
19's exact check. The only real difference from the old, CDN-era
version: `logout(message)` (a free-standing global function) becomes
`clearAuth(message)` (a composable's own function, closing over the
same module-scope `authToken`/`currentUsername`/`authMessage` every
other part of `useAuth.js` already shares).

### SE Lens — one seam closed, for good

Lesson 30's login screen needed a real workaround — capturing
`.mount()`'s return value just so `logout()`, defined completely
outside the Vue app, could reach in and set a message. That workaround
existed because the old CDN-era code had no composable, no shared
module-scope state — only one app instance and a lot of separate
global variables. Here, `clearAuth` and `LoginScreen.vue` are just two
different callers of the same `useAuth()`, both already holding
references to `authMessage` — there is no "outside" to reach into
anymore. The architecture itself removed a problem the old version had
to solve with a workaround.

### Run It

Confirmed via Vite's real compiled output for `useAuth.js` (a plain
module, not an SFC — Vite serves it with only a sourcemap appended,
confirming no syntax errors) and via this lesson's later units, which
exercise `authenticatedFetch` and `clearAuth` against a real backend as
part of verifying `loadFolder` itself.

---

## Concept Unit: useFileSystem.js

### The Problem

`currentPath`, `entries`, and `errorMessage` need to be shared,
module-scope state exactly like `useAuth.js`'s own values (Lesson 34)
— and `loadFolder` needs a real, authenticated request, which means
this new composable needs `useAuth.js`'s `authenticatedFetch`.

### Project Change

- **Files affected** — `frontend/src/composables/useFileSystem.js`,
  new file.
- **Change type** — create.
- **Dependencies** — `useAuth()`, this lesson's first unit; Lesson 34's
  module-scope-state pattern, applied a second time.

### The New Code — type this

```javascript
import { ref } from 'vue'
import { useAuth } from './useAuth.js'

const { authenticatedFetch } = useAuth()

const currentPath = ref('')
const entries = ref([])
const errorMessage = ref('')

function loadFolder(path) {
    authenticatedFetch('http://127.0.0.1:8000/files?path=' + encodeURIComponent(path))
        .then((response) => response.json())
        .then((data) => {
            currentPath.value = data.path
            entries.value = data.entries
            errorMessage.value = ''
        })
        .catch(() => {
            currentPath.value = ''
            entries.value = []
            errorMessage.value = 'Could not reach backend.'
        })
}

export function useFileSystem() {
    return { currentPath, entries, errorMessage, loadFolder }
}
```

### The Updated Project — where this lives

This is the entire file — a brand-new module, nothing to place it
inside of.

### Mechanical Walkthrough

`import { useAuth } from './useAuth.js'` reuses Lesson 32's `import`
exactly — the only difference from every other `import` in this
project is that the thing being imported is itself a composable, not a
component or a plain utility. `const { authenticatedFetch } =
useAuth()` — first appearance of one composable calling another, at
module scope, exactly once, when `useFileSystem.js` is first loaded —
`authenticatedFetch` here is a plain function reference, stable for
the lifetime of the module, that still reads the *live*
`authToken.value` every time it's actually called, because that's how
the function itself was written inside `useAuth.js`. `loadFolder`'s
body is a line-for-line port of Lesson 31's original — `.then()`/`.catch()`,
the same three-value state shape (`currentPath`, `entries`,
`errorMessage`) — reading and writing `.value` instead of touching
`sidebarApp.currentPath` the way the old CDN-mounted version did.

### CS Lens — composition, the same idea at a new layer

`FileBrowser.vue` will call `useFileSystem()`, which calls `useAuth()`
— a chain of composition exactly like function calls chaining inside
any program, except each link in this particular chain also happens to
carry its own shared reactive state. This is the same idea Vue's own
component tree already embodies (a component containing another
component, Lesson 33), applied one layer lower: composables can depend
on other composables the same unrestricted way any JavaScript module
can `import` any other.

### Run It

Not independently runnable yet — nothing calls `loadFolder` until
`FileBrowser.vue` exists. Verified together with it, next.

---

## Concept Unit: FileBrowser.vue

### The Problem

Something needs to actually render `entries`, handle folder navigation
and the up-button, and trigger the very first `loadFolder` call the
moment it exists — all logic already built and verified once, in
Lesson 31, against the old CDN-mounted version.

### Project Change

- **Files affected** — `frontend/src/components/FileBrowser.vue`, new
  file; `frontend/src/App.vue`, existing file.
- **Change type** — create; add (`FileBrowser` rendered inside
  `App.vue`'s logged-in branch).
- **Dependencies** — `useFileSystem()`, this lesson's second unit;
  `v-for`/`:key`/`v-if` (Lesson 31); the sidebar's CSS, ported from
  Lesson 2's `.sidebar`/`.sidebar ul`/`.sidebar li` rules.

### The New Code — type this

```html
<script setup>
import { useFileSystem } from '../composables/useFileSystem.js'

const { currentPath, entries, errorMessage, loadFolder } = useFileSystem()

function goUp() {
    const parentPath = currentPath.value.split('/').slice(0, -1).join('/')
    loadFolder(parentPath)
}

function handleEntryClick(entry) {
    const entryPath = currentPath.value === '' ? entry.name : currentPath.value + '/' + entry.name
    if (entry.is_directory) {
        loadFolder(entryPath)
    }
    // Opening a file is not yet built - that's the tabs/editor lesson.
}

loadFolder('')
</script>

<template>
  <div class="sidebar">
    <ul class="file-list">
      <li v-if="errorMessage !== ''">{{ errorMessage }}</li>
      <li v-if="currentPath !== ''" class="clickable" @click="goUp">.. (up)</li>
      <li v-for="entry in entries" :key="entry.name" class="clickable" @click="handleEntryClick(entry)">{{ entry.is_directory ? entry.name + '/' : entry.name }}</li>
    </ul>
  </div>
</template>

<style scoped>
.sidebar {
    width: 250px;
    min-width: 150px;
    max-width: 500px;
    resize: horizontal;
    overflow: auto;
    border-right: 1px solid #ccc;
    padding: 8px;
    box-sizing: border-box;
}
.file-list {
    list-style: none;
    margin: 0;
    padding: 0;
}
.file-list li {
    padding: 4px 6px;
    border-radius: 4px;
}
.clickable {
    cursor: pointer;
}
.file-list li.clickable:hover {
    background-color: #eee;
}
</style>
```

The sidebar's own CSS — Lesson 2's original `.sidebar`/`.sidebar ul`/
`.sidebar li` rules, ported with the same ID-to-class reasoning
Lesson 34 already used for the login card: `<style scoped>` already
guarantees these rules can only match elements this component
rendered, so the old page-wide `.sidebar li.clickable` selector
narrows to a plain `.clickable` class, scoped by the compiler instead
of by a shared ancestor selector.

### The Updated Project — where this lives

`App.vue`, in full, with the new lines marked — `LoginScreen`'s own
branch (Lesson 34) is unchanged:

```html
<script setup>
import BackendStatus from './components/BackendStatus.vue'
import LoginScreen from './components/LoginScreen.vue'
import FileBrowser from './components/FileBrowser.vue'                <!-- ← new -->
import { useAuth } from './composables/useAuth.js'

const { authToken, currentUsername } = useAuth()
</script>

<template>
  <BackendStatus />
  <LoginScreen v-if="authToken === null" />
  <div v-else class="layout">                                          <!-- ← changed -->
    <FileBrowser />                                                     <!-- ← new -->
    <div class="main-content">                                          <!-- ← new -->
      <h1>Engineering Workspace Platform</h1>
      <p>Logged in as {{ currentUsername }}.</p>
    </div>                                                                <!-- ← new -->
  </div>
</template>

<style scoped>
.layout {
    display: flex;
    height: 100vh;
}
.main-content {
    flex: 1;
    padding: 16px;
}
</style>
```

### Mechanical Walkthrough

Every directive in `FileBrowser.vue`'s template — `v-if`, `v-for`,
`:key`, `@click` — is a direct reuse of Lesson 31's already-taught
syntax, applied to `ref()`-backed values instead of `data()`-backed
ones. `goUp`/`handleEntryClick` are line-for-line ports of Lesson 31's
own methods, `.value` added wherever the old code read `this.currentPath`.
`loadFolder('')`, the very last line of `<script setup>` — first
appearance of a plain function call sitting at the top level of a
component's script, not inside a method, not behind a click. Every
line above it runs once, synchronously, when this component is
created — including this one. There's no separate "and now load the
initial data" step wired in from outside, the way the old vanilla
bootstrap had to explicitly call `loadFolder("")` after a successful
login; the component simply loads its own first screenful of data the
moment it exists.

### CS Lens — a component responsible for its own bootstrap

The old vanilla version needed external code — the login success
handler, and separately the page-load bootstrap check — to remember to
call `loadFolder("")` at the right moment. `FileBrowser.vue` needs
nothing external to remember anything: because `App.vue`'s `v-else`
branch only renders `FileBrowser` once `authToken` is no longer `null`,
and `FileBrowser` loads its own root folder the instant it's created,
"log in successfully" and "see the file list" are connected purely
through *when this component exists at all*, not through one piece of
code explicitly telling another "now go fetch." Removing that
explicit call was not an oversight — `setAuth` (Lesson 34) never
calls `loadFolder`, and it doesn't need to.

### Run It

Confirmed by extracting this component's real logic — the literal
`loadFolder`, `goUp`, `handleEntryClick` functions, plus the actual
`useAuth.js`/`useFileSystem.js` modules — and running it against a
real backend, not the compiled template (still outside jsdom's reach):

```
1) root entries: [ 'README.md', 'src' ]
   errorMessage:
   currentPath:

2) inside src/, currentPath: src
   entries: [ 'broken.rs', 'duplicate_axis.nc', 'hello.rs',
              'infinite_loop.py', 'main.py', 'motion_conflict.nc',
              'sample.nc', 'utils.py' ]

3) after goUp(), currentPath:
   entries: [ 'README.md', 'src' ]

4) after clearing auth and trying to load, errorMessage: Could not reach backend.
   entries cleared: true
```

Real navigation into a real folder, back up, and a real, correctly
handled failure when the session is no longer valid — all four
confirmed against the real backend's actual filesystem contents, not
assumed from reading the code.

---

## Connect the pieces

`App.vue` calls `useAuth()`; once `authToken` is set (Lesson 34's real
login flow), `v-else` renders `FileBrowser`. The instant it's created,
`FileBrowser.vue`'s top-level `loadFolder('')` runs, which calls
`useFileSystem()`'s own `loadFolder`, which calls `useAuth()`'s
`authenticatedFetch` — three composables, chained, each contributing
exactly the state and behavior it owns. Clicking a folder calls
`handleEntryClick`, computing the same path logic Lesson 31 already
verified and calling `loadFolder` again; clicking Up does the mirror
operation. If a request ever comes back `401` — a real, expired
session — `authenticatedFetch` calls `clearAuth`, which sets
`authToken` back to `null`; `App.vue`'s `v-if` reacts immediately,
`FileBrowser` is destroyed, `LoginScreen` reappears, already showing
`authMessage`'s real explanation for why.

## What breaks without this

Confirmed directly: without `loadFolder('')` at the top of
`<script setup>`, `FileBrowser.vue` would compile and mount correctly,
but `entries` would stay permanently empty — nothing would ever call
`loadFolder` for the first time, since no click has happened yet and
nothing else in this project calls it either. The sidebar would render
successfully and show nothing at all, silently, with no error — a real
difference from a crash, and arguably worse, since nothing would flag
that anything was wrong.

## Exercises

1. Run `npm run dev`, log in for real, and confirm the file browser
   shows the real project's actual folders and files.
2. Navigate into `src/`, back up, and confirm the listing is correct
   both times, in a real browser.
3. While logged in, manually corrupt the stored token
   (`sessionStorage.setItem('authToken', 'garbage')` in the browser
   console) and click a folder — confirm you're returned to the login
   screen with the real session-expired message.
4. Temporarily remove the `loadFolder('')` call from the bottom of
   `FileBrowser.vue`'s script, reload while logged in, and confirm the
   sidebar renders but stays empty — then restore it.
5. Explain, without looking back at this lesson, why
   `useFileSystem.js` imports `useAuth.js` instead of `FileBrowser.vue`
   importing both composables separately and passing `authenticatedFetch`
   through as a prop.

## Definition of done

- [ ] You've logged in and browsed real folders through the actual
      running app
- [ ] You've triggered a real session-expiry and watched the app
      correctly return to the login screen with the right message
- [ ] You've caused and observed the "silently empty sidebar" bug by
      removing the top-level `loadFolder('')` call, then restored it
- [ ] You can explain why `useFileSystem.js` calls `useAuth()` at
      module scope, once, rather than inside `loadFolder` itself
- [ ] `git commit` this lesson's code with a message explaining why
