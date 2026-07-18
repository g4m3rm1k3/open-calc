# Lesson 37: Watching for a Change That Isn't Yours

## What you will build

Run and diagnostics — `useRunner.js`, a fourth composable, wired into
`Editor.vue` alongside a Run button and two new output areas, reaching
parity with the original Lessons 5 and 9. The actual subject is
`watch()`: a way for one composable to react to a change happening
inside a *different* composable, without either one importing the
other in both directions — solving a real problem this lesson's own
first draft got wrong.

## What you need to know first

`Lesson 36 - The Tab That Forgot What You Typed.md` — `useEditor.js`,
`activeTabPath`, the writable `editedContent` computed. `Lesson 5 -
Running Code.md` and `Lesson 9 - Basic Diagnostics.md` — the original
`runFile`/`diagnoseFile` logic, ported here almost unchanged.
`Lesson 35`'s composable-calling-composable pattern (`useFileSystem`
calling `useAuth`), reused again here in a new direction.

---

## Concept Unit: a gap this lesson's own first draft had

### The Problem

`renderEditor()`, unchanged since Lesson 4, clears *every* output
panel — run output, diagnostics, tokens, blocks, and more — on every
single tab switch:

```javascript
document.getElementById("run-output").textContent = "";
document.getElementById("run-output").classList.remove("has-error");
document.getElementById("diagnostics-output").textContent = "";
document.getElementById("diagnostics-output").className = "";
```

`useRunner.js` needs `activeTabPath` from `useEditor.js` to know which
file to run or diagnose — but `useEditor.js` cannot import
`useRunner.js` back, because `useRunner.js` already imports
`useEditor.js`; a circular `import` between two modules is a real
structural problem, not just an awkward one. This lesson's own first
draft of `useRunner.js` left this gap entirely: nothing cleared
`runOutput` or `diagnosticsMessage` when a different tab became active,
confirmed directly by tracing the code — switching from a file with
real run output to a brand-new file would leave the *previous* file's
output on screen, silently describing the wrong thing.

### What This Proves

No throwaway lab needed to demonstrate the gap itself — it's a direct,
traceable consequence of `useRunner.js` reading `activeTabPath.value`
only *inside* `runFile`/`diagnoseFile`, never in response to it
changing on its own. The fix, next, needs a way to run code *whenever*
a specific reactive value changes — not just when a function that
happens to read it is called.

---

## Concept Unit: watch() — reacting to a change you don't own

### The Problem

`useRunner.js` needs to notice `activeTabPath` changing and clear its
own state in response — without `useEditor.js` needing to know
`useRunner.js` exists at all, and without polling or checking on some
timer.

### Concept Lab

```javascript
const { ref, watch } = require("vue")

const count = ref(0)
const log = []

watch(count, (newValue, oldValue) => {
    log.push(`count changed from ${oldValue} to ${newValue}`)
})

count.value = 1
count.value = 2
console.log(log)
```

Run it — actual output, this exact run:

```
[
  'count changed from 0 to 1',
  'count changed from 1 to 2'
]
```

### What This Proves

`watch(count, callback)` — first appearance — registers `callback` to
run automatically every time `count`'s value actually changes; nothing
calls it directly, confirmed by the fact that `count.value = 1` and
`count.value = 2` are the *only* two statements in this lab besides the
`watch()` registration itself, yet the callback ran exactly twice, with
the correct before/after values each time. This is a fundamentally
different relationship than every function call in this project so
far: `runFile()` and `diagnoseFile()` are triggered by something
calling them; a `watch()` callback is triggered by a *value changing*,
regardless of what caused that change or which piece of code owns it.

### Discard

`count` and `log` are deleted now — neither appears in the project.
The real fix, next, watches `activeTabPath` instead of a lab counter.

---

## Concept Unit: useRunner.js

### The Problem

`runFile`, `diagnoseFile`, and the state they manage need a real home,
using `watch()` to close the gap this lesson's first unit found.

### Project Change

- **Files affected** — `frontend/src/composables/useRunner.js`, new
  file; `frontend/src/composables/useEditor.js`, existing file;
  `frontend/src/components/Editor.vue`, existing file.
- **Change type** — create; replace (`saveFile`'s return behavior);
  replace (`Editor.vue`'s template and script).
- **Dependencies** — `useAuth()`, `useEditor()`; this lesson's
  `watch()`.

### The New Code — type this

```javascript
import { ref, watch } from 'vue'
import { useAuth } from './useAuth.js'
import { useEditor } from './useEditor.js'

const { authenticatedFetch } = useAuth()
const { activeTabPath } = useEditor()

const runOutput = ref('')
const runHasError = ref(false)
const diagnosticsMessage = ref('')
const diagnosticsHasError = ref(false)

watch(activeTabPath, () => {
    runOutput.value = ''
    runHasError.value = false
    diagnosticsMessage.value = ''
    diagnosticsHasError.value = false
})
```

`runFile` is Lesson 5's own function, ported — and it sets a real
"Running..." loading state before the request even starts, clearing
whatever error styling a *previous* run left behind so a stale red
panel doesn't sit there while a new run is in flight:

```javascript
function runFile() {
    if (activeTabPath.value === null) {
        return
    }

    runHasError.value = false
    runOutput.value = 'Running...'

    authenticatedFetch('http://127.0.0.1:8000/run?path=' + encodeURIComponent(activeTabPath.value), {
        method: 'POST',
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.stderr) {
                runHasError.value = true
                runOutput.value = data.stderr
            } else {
                runHasError.value = false
                runOutput.value = data.stdout || '(no output)'
            }
        })
        .catch(() => {
            runHasError.value = true
            runOutput.value = 'Could not reach backend.'
        })
}
```

`diagnoseFile` is Lesson 9's, and it deliberately skips that loading
state — worth noticing, not just assuming it was forgotten. `/run` can
take up to five real seconds (Lesson 5's own timeout); `/diagnose` runs
`ast.parse`, measured in Lesson 9 at a fraction of a millisecond. A
"Checking..." message here would flash and vanish before a person
could read it, so there's nothing to set before the request — the
result simply appears:

```javascript
function diagnoseFile() {
    if (activeTabPath.value === null) {
        return
    }

    authenticatedFetch('http://127.0.0.1:8000/diagnose?path=' + encodeURIComponent(activeTabPath.value), {
        method: 'POST',
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.ok) {
                diagnosticsHasError.value = false
                diagnosticsMessage.value = 'No problems found.'
            } else {
                diagnosticsHasError.value = true
                diagnosticsMessage.value = 'Line ' + data.line + ': ' + data.message
            }
        })
        .catch(() => {
            diagnosticsHasError.value = false
            diagnosticsMessage.value = 'Could not check file.'
        })
}

export function useRunner() {
    return { runOutput, runHasError, diagnosticsMessage, diagnosticsHasError, runFile, diagnoseFile }
}
```

`useEditor.js`'s `saveFile` gains a return value, so a caller can react
to whether the save actually succeeded:

```diff
  function saveFile() {
      if (activeTabPath.value === null) {
-         return
+         return Promise.resolve(false)
      }

      let wasSuccessful = false

-     authenticatedFetch('http://127.0.0.1:8000/file?path=' + encodeURIComponent(activeTabPath.value), {
+     return authenticatedFetch('http://127.0.0.1:8000/file?path=' + encodeURIComponent(activeTabPath.value), {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: editedContent.value }),
      })
          .then((response) => {
              wasSuccessful = response.ok
              return response.json()
          })
          .then((data) => {
              if (!wasSuccessful) {
                  saveStatus.value = data.detail
-                 return
+                 return false
              }
              saveStatus.value = 'Saved.'
+             return true
          })
          .catch(() => {
              saveStatus.value = 'Could not save.'
+             return false
          })
  }
```

`Editor.vue` coordinates both composables — calling `diagnoseFile()`
only after a real, successful `.py` save:

```html
<script setup>
import { useEditor } from '../composables/useEditor.js'
import { useRunner } from '../composables/useRunner.js'

const { activeTabPath, editedContent, saveStatus, saveFile } = useEditor()
const { runOutput, runHasError, diagnosticsMessage, diagnosticsHasError, runFile, diagnoseFile } = useRunner()

function handleSave() {
    saveFile().then((wasSuccessful) => {
        if (wasSuccessful && activeTabPath.value.endsWith('.py')) {
            diagnoseFile()
        }
    })
}
</script>

<template>
  <div v-if="activeTabPath === null" class="editor-empty">Click a file in the sidebar to open it.</div>
  <div v-else class="editor-pane">
    <textarea v-model="editedContent"></textarea>
    <div>
      <button @click="handleSave">Save</button>
      <button @click="runFile">Run</button>
      <span class="save-status">{{ saveStatus }}</span>
    </div>
    <div :class="diagnosticsHasError ? 'diagnostics-output has-error' : 'diagnostics-output'">{{ diagnosticsMessage }}</div>
    <div :class="runHasError ? 'output-panel has-error' : 'output-panel'">{{ runOutput }}</div>
  </div>
</template>
```

### The Updated Project — where this lives

`useRunner.js` is entirely new — the block above is the whole file.
`saveFile`'s change is shown in full above as a diff against Lesson
36's version. `Editor.vue`, in full, with the styling for the two new
output areas added directly below what Lesson 36 already had:

```css
<style scoped>
.editor-pane textarea {
    width: 100%;
    height: 400px;
    box-sizing: border-box;
    font-family: monospace;
    font-size: 14px;
    padding: 8px;
}
.save-status {
    font-size: 13px;
    color: #666;
    margin-left: 8px;
}
.diagnostics-output {
    font-family: monospace;
    font-size: 13px;
    padding: 4px 0;
    color: #666;
}
.diagnostics-output.has-error {
    color: #c00;
}
.output-panel {
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
.output-panel.has-error {
    color: #f88;
}
</style>
```

### Mechanical Walkthrough

`watch(activeTabPath, () => {...})` — this lesson's own lab pattern,
applied for real: no second argument beyond the callback is used here
(the lab's `(newValue, oldValue)` parameters aren't needed — this
callback doesn't care *what* the new path is, only that it changed).
`runFile` and `diagnoseFile` both call `authenticatedFetch` (Lesson
35) with `method: 'POST'`, and both branch on their response inside a
`.then()` — that much is genuinely shared. What isn't shared, named
above: `runFile` sets a real loading message and pre-clears its error
flag; `diagnoseFile` does neither, for the real, measured reason
already given. Each one's success branch reads its own backend route's
actual field names — `data.stderr`/`data.stdout` for `runFile`,
matching Lesson 5's `/run` response exactly; `data.ok`/`data.line`/
`data.message` for `diagnoseFile`, matching Lesson 9's `/diagnose`
response exactly — confirmed directly against the real backend routes
before writing a line of this composable, not assumed from memory of
what they used to return. `saveFile`'s `return`
keyword, added in three places, is the entire fix: JavaScript
functions that don't explicitly `return` a value inside a `.then()`
callback return `undefined`, which `.then()` on the *calling* side
would receive as `wasSuccessful` — explicitly returning `true`/`false`
makes that value real and checkable. `handleSave` in `Editor.vue` —
`saveFile().then((wasSuccessful) => {...})` — is where the two
composables actually meet: not through either one importing the other,
but through this component calling both and passing information
between them itself.

### CS Lens — three ways to react to something happening

This project now has three genuinely different mechanisms for
"something happened, now do something else": a direct function call
(`saveFile()` calling nothing further on its own), a `.then()` chain
reacting to a Promise resolving (`handleSave` reacting to `saveFile()`
finishing), and now `watch()` reacting to a *value changing*,
independent of whichever code changed it. `activeTabPath` can be
changed by `setActiveTab` (a click), by `openFile` (opening a new
tab), or by `closeTab` (closing one) — `useRunner.js`'s `watch()`
doesn't need to know which; it fires the same way regardless, because
it's watching the *value*, not any particular caller.

Also recognized in: a spreadsheet cell recalculating when a cell it
references changes, regardless of which formula or user edit caused
that change; a database trigger firing on any `UPDATE` to a row,
independent of which query performed it; a filesystem watcher
(`inotify`, Windows' own file-change notifications) reacting to a file
changing, not to the specific program that changed it.

### SE Lens — coordination lives in the component, not the composables

`useRunner.js` and `useEditor.js` never import each other in both
directions — the only two-way relationship exists inside `Editor.vue`,
which imports both and decides how they interact (`handleSave` calling
into both). This is a deliberate choice, the same one already visible
in `FileBrowser.vue` calling both `useFileSystem` and `useEditor`
(Lesson 36): composables stay narrowly focused on their own state, and
*components* — which are already allowed to know about multiple
composables — are where cross-cutting coordination belongs. The
alternative, letting composables reach into each other more freely,
would have avoided writing `handleSave` here, at the cost of a real
circular-import problem the moment two composables need each other's
current values, not just their functions.

### Run It

Confirmed against a real backend, using the actual composable logic —
real Python execution, a real syntax error introduced and caught, and
`watch()`'s clearing behavior confirmed directly:

```
1) run src/main.py, runOutput: "Hello from the sample project.\n" | runHasError: false
2) switched to infinite_loop.py, runOutput cleared by watch(): true
3) opened src/utils.py, diagnosticsMessage cleared by watch(): true
4) after saving valid Python, saveStatus: Saved. | diagnosticsMessage: No problems found.
5) after saving broken Python, saveStatus: Saved.
   diagnosticsMessage: Line 1: expected ':' | diagnosticsHasError: true
6) restored, saveStatus: Saved. | diagnosticsMessage: No problems found.
```

Step 5 used a real, deliberately broken file —
`def add(a, b)\n    return a + b\n`, missing its colon — saved through
the real `PUT /file` route, then diagnosed through the real
`ast.parse`-backed `/diagnose` route (Lesson 9), catching the exact
real syntax error rather than a scripted response.

---

## Connect the pieces

Clicking Run calls `runFile`, which fetches `/run` and updates
`runOutput`/`runHasError` — `Editor.vue`'s `:class` bindings (Lesson
36's own pattern) reflect the error state immediately. Clicking Save
calls `handleSave`, which calls `useEditor`'s `saveFile` and — only if
it resolves `true` and the file is Python — calls `useRunner`'s
`diagnoseFile`, the exact conditional chain Lesson 9 originally built
inline inside one function, now split across two composables and
recombined in the component that needs both. Switching tabs, from any
of the three places that can trigger it, changes `activeTabPath`;
`useRunner.js`'s `watch()` notices and clears its own state, without
`useEditor.js` ever needing to call it or know it exists.

## What breaks without this

Already demonstrated directly, not hypothetically: this lesson's own
first-draft `useRunner.js`, without the `watch()` call, left stale
`runOutput`/`diagnosticsMessage` on screen after switching to a
different file — traced directly from the code, the same real gap
`renderEditor()`'s unconditional clearing (Lesson 4 onward) was always
quietly covering for in the original vanilla version.

## Exercises

1. Run a real `.py` file through the actual app, switch to a different
   tab, and confirm the run output disappears — completing the visual
   check this lesson's own verification could only do through the
   composable's logic directly.
2. Save a Python file with a deliberate syntax error through the real
   app and confirm the diagnostics line reports the real error,
   matching Lesson 9's original behavior.
3. Temporarily remove the `watch()` call from `useRunner.js`,
   reproduce the stale-output bug in a real browser, then restore it.
4. Explain, without looking back at this lesson, why `useRunner.js`
   can import `useEditor.js`, but `useEditor.js` cannot import
   `useRunner.js`.

## Definition of done

- [ ] You've run a real file and watched the output clear on tab switch,
      in a real browser
- [ ] You've saved a file with a real syntax error and seen the actual
      diagnostic message
- [ ] You've reproduced the stale-output bug by removing `watch()`,
      confirmed it, and restored the fix
- [ ] You can explain what `watch()` does that a plain function call
      cannot
- [ ] `git commit` this lesson's code with a message explaining why
