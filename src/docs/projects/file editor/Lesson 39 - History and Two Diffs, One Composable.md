# Lesson 39: History and Two Diffs, One Composable

## What you will build

`useHistory.js` — the fifth composable — reaching parity with
Lessons 20, 21, and 22 at once: a History button listing real commits,
clicking one to see its real diff, and a Current Diff button comparing
unsaved edits against the last save. No new Vue syntax appears in this
lesson — every directive, every pattern, was isolated in an earlier
lesson. This one is entirely about recognizing that a fifth composable
doesn't need a fifth new trick; it needs the same four tricks, applied
correctly, one more time.

## What you need to know first

`Lesson 37 - Watching for a Change That Isn't Yours.md` — `watch()`,
composables calling composables, why `useRunner.js` couldn't depend on
`useEditor.js` in both directions. `Lesson 20`, `Lesson 21`, and
`Lesson 22` — `historyFile`, `diffCommit`, `diffCurrent`, all ported
here nearly unchanged. `Lesson 31`'s `v-for`/`:key`, reused for the
commit list.

---

## Concept Unit: useHistory.js

### The Problem

Three real features — commit history, diffing a past commit, and
diffing unsaved changes — all need `activeTabPath` from `useEditor.js`,
and the last one needs `editedContent` too. All three need to reset
when the active file changes, the same gap Lesson 37 found and fixed
for run output and diagnostics.

### Project Change

- **Files affected** — `frontend/src/composables/useHistory.js`, new
  file; `frontend/src/components/Editor.vue`, existing file.
- **Change type** — create; add (three new buttons, a commit list, and
  two diff panels).
- **Dependencies** — `useAuth()`, `useEditor()`; `watch()` (Lesson 37);
  `v-for`/`:key` (Lesson 31).

### The New Code — type this

```javascript
import { ref, watch } from 'vue'
import { useAuth } from './useAuth.js'
import { useEditor } from './useEditor.js'

const { authenticatedFetch } = useAuth()
const { activeTabPath, editedContent } = useEditor()

const commits = ref([])
const historyMessage = ref('')
const diffOutput = ref('')
const currentDiffOutput = ref('')

watch(activeTabPath, () => {
    commits.value = []
    historyMessage.value = ''
    diffOutput.value = ''
    currentDiffOutput.value = ''
})
```

`loadHistory`, `selectCommit`, and `diffCurrent` are direct ports of
Lessons 20, 21, and 22 — `.value` added throughout, otherwise
unchanged:

```javascript
function loadHistory() {
    if (activeTabPath.value === null) {
        return
    }

    historyMessage.value = 'Loading history...'

    authenticatedFetch('http://127.0.0.1:8000/history?path=' + encodeURIComponent(activeTabPath.value))
        .then((response) => response.json())
        .then((data) => {
            if (data.commits.length === 0) {
                historyMessage.value = 'No history found.'
                commits.value = []
                return
            }
            historyMessage.value = ''
            commits.value = data.commits
        })
        .catch(() => {
            historyMessage.value = 'Could not load history.'
            commits.value = []
        })
}

function selectCommit(hash) {
    if (activeTabPath.value === null) {
        return
    }

    diffOutput.value = 'Loading diff...'

    authenticatedFetch('http://127.0.0.1:8000/diff?path=' + encodeURIComponent(activeTabPath.value) + '&commit=' + encodeURIComponent(hash))
        .then((response) => response.json())
        .then((data) => {
            diffOutput.value = data.diff
        })
        .catch(() => {
            diffOutput.value = 'Could not load diff.'
        })
}

function diffCurrent() {
    if (activeTabPath.value === null) {
        return
    }

    currentDiffOutput.value = 'Comparing...'

    authenticatedFetch('http://127.0.0.1:8000/diff-current?path=' + encodeURIComponent(activeTabPath.value), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editedContent.value }),
    })
        .then((response) => response.json())
        .then((data) => {
            currentDiffOutput.value = data.diff || 'No unsaved changes.'
        })
        .catch(() => {
            currentDiffOutput.value = 'Could not compare.'
        })
}

export function useHistory() {
    return { commits, historyMessage, diffOutput, currentDiffOutput, loadHistory, selectCommit, diffCurrent }
}
```

`Editor.vue` adds three buttons, a clickable commit list, and two more
output panels:

```html
<button @click="loadHistory">History</button>
<button @click="diffCurrent">Current Diff</button>
```

The commit list and the two diff panels these buttons populate:

```html
<div class="output-panel">
  <span v-if="historyMessage !== ''">{{ historyMessage }}</span>
  <div
    v-for="commit in commits"
    :key="commit.hash"
    class="clickable"
    @click="selectCommit(commit.hash)"
  >{{ commit.hash.slice(0, 7) }}  {{ commit.timestamp }}  {{ commit.message }}</div>
</div>
<div class="output-panel">{{ diffOutput }}</div>
<div class="output-panel">{{ currentDiffOutput }}</div>
```

### The Updated Project — where this lives

`useHistory.js` is entirely new — the block above is the whole file.
`Editor.vue`'s button row and output panels, in full, with the new
lines marked:

```html
<div>
  <button @click="handleSave">Save</button>
  <button @click="checkoutFile">Check Out</button>
  <button @click="checkinFile">Check In</button>
  <button @click="runFile">Run</button>
  <button @click="loadHistory">History</button>              <!-- ← new -->
  <button @click="diffCurrent">Current Diff</button>          <!-- ← new -->
  <span class="save-status">{{ saveStatus }}</span>
  <span class="lock-status">{{ lockMessage || lockStatus }}</span>
</div>
<div :class="diagnosticsHasError ? 'diagnostics-output has-error' : 'diagnostics-output'">{{ diagnosticsMessage }}</div>
<div :class="runHasError ? 'output-panel has-error' : 'output-panel'">{{ runOutput }}</div>
<div class="output-panel">                                     <!-- ← new -->
  <span v-if="historyMessage !== ''">{{ historyMessage }}</span>  <!-- ← new -->
  <div                                                             <!-- ← new -->
    v-for="commit in commits"                                       <!-- ← new -->
    :key="commit.hash"                                               <!-- ← new -->
    class="clickable"                                                  <!-- ← new -->
    @click="selectCommit(commit.hash)"                                 <!-- ← new -->
  >{{ commit.hash.slice(0, 7) }}  {{ commit.timestamp }}  {{ commit.message }}</div>  <!-- ← new -->
</div>                                                                    <!-- ← new -->
<div class="output-panel">{{ diffOutput }}</div>                          <!-- ← new -->
<div class="output-panel">{{ currentDiffOutput }}</div>                    <!-- ← new -->
```

A small addition to the `<style scoped>` block, reusing
`.output-panel .clickable` — the exact selector Lesson 21 already
established for this same styling need, reused here without needing
to change at all:

```css
.output-panel .clickable {
    padding: 2px 4px;
    border-radius: 3px;
}
.output-panel .clickable:hover {
    background-color: #333;
}
```

### Mechanical Walkthrough

Every construct here — `ref()`, `watch()`, `v-for`/`:key`, `@click`,
`v-if`, string concatenation in a template expression — was isolated
and explained in an earlier lesson; nothing in this unit introduces a
new one. `commit.hash.slice(0, 7)` reuses `.slice()` from Lesson 20's
own original short-hash logic, now written inside a template
expression instead of a JavaScript function body — Vue's `{{ }}`
accepts any valid JavaScript expression, already implicitly relied on
by every ternary shown since Lesson 30.

### CS Lens — the fifth composable proves the pattern, not a new one

`useAuth.js` calling nothing, `useFileSystem.js` calling `useAuth`,
`useEditor.js` calling `useAuth`, `useRunner.js` calling both
`useAuth` and `useEditor`, and now `useHistory.js` calling both
`useAuth` and `useEditor` too — five composables, and the *shape* of
how they connect has not changed once since Lesson 35 first
established it. This is what a genuinely reusable pattern looks like:
the fifth application is exactly as unremarkable as the second one
was, and that unremarkableness is the actual sign the pattern was
right.

### SE Lens — three features, one file, on purpose

`loadHistory`, `selectCommit`, and `diffCurrent` all live in the same
composable, rather than three separate ones. They're grouped here
because they share the same reset behavior (Lesson 37's `watch()`
pattern) and conceptually answer one question — "what has this file's
history looked like, and how does it compare to now" — from three
angles. The alternative, one composable per function, would mean three
separate `watch(activeTabPath, ...)` registrations doing nearly
identical work, and three files to open instead of one to understand
this entire feature area. Grouping by *shared concern*, not by
mechanically one-function-per-file, is the same judgment call already
made for `useEditor.js` (open, close, save, checkout, and checkin all
live together) — not a rule, a repeated decision that's kept paying
off.

### Run It

Confirmed against a real backend, using the actual composable logic —
real commit history, a real diff from an actual past commit, and a
real diff against a live, unsaved edit:

```
1) commits found: true | first message: Restore src/main.py after locking-feature verification test edit
   historyMessage: ""
2) diff for the oldest commit touching this file (real, non-empty expected for the initial add):
commit 7a0495a1867b3969ac368c8cb0c7981615e3fe3c
Author: g4m3rm1k3 <g4m3rm1k3@hotmail.com>
Date:   Thu Jul 16 07:07:21 2026 -0400

3) diffCurrent with no changes: "No unsaved changes."
4) diffCurrent with a real unsaved change:
--- saved
+++ current
@@ -4,3 +4,5 @@
 
 if __name__ == "__main__":
     main()
+
+# a real unsaved change

5) after a real save, history includes a new commit: 4
```

Every one of these five real backend routes — `/history`, `/diff`,
`/diff-current`, plus the `/checkout`/`PUT /file` this test used to
create a real new commit — responded exactly as their original
lessons proved they would, unchanged by living inside a composable
instead of a global function.

---

## Connect the pieces

Clicking History calls `loadHistory`, populating `commits` from a real
`git log`; `v-for`/`:key` (Lesson 31) renders each one, clickable.
Clicking a commit calls `selectCommit`, fetching that exact commit's
diff through the same `git show`-backed route Lesson 21 built and
secured against argument injection. Clicking Current Diff calls
`diffCurrent`, sending whatever's currently in `editedContent` — live,
unsaved, possibly never seen by `git` at all — to the `difflib`-backed
route Lesson 22 built specifically because `/diff` has no way to
represent content that was never committed. Switching tabs clears all
three, the same `watch()` pattern Lesson 37 established, applied here
without needing to be reinvented.

## What breaks without this

Already demonstrated by direct analogy, not a new failure mode:
without `watch(activeTabPath, ...)`, this composable would reproduce
the exact bug Lesson 37 found and fixed for run output and
diagnostics — switching from one file's commit history to a different
file would leave the *previous* file's commits and diffs on screen,
describing the wrong file entirely.

## Exercises

1. Open a file with real history, click History, click a real commit,
   and confirm its actual diff appears — in a real browser.
2. Make an edit without saving, click Current Diff, confirm the real
   change appears; save, click Current Diff again, confirm it now
   reports no unsaved changes.
3. Switch tabs after loading history and confirm the commit list and
   both diff panels clear, matching Lesson 37's own established
   pattern.
4. Explain, without looking back at this lesson, why `loadHistory`,
   `selectCommit`, and `diffCurrent` live in one composable instead of
   three separate ones.

## Definition of done

- [ ] You've viewed real commit history and a real commit's diff
      through the actual running app
- [ ] You've compared unsaved changes against the last save, both with
      and without a real pending edit
- [ ] You've confirmed switching tabs clears all three panels
- [ ] You can explain why this lesson introduced zero new Vue concepts,
      and why that's the actual sign of a healthy pattern, not a sign
      nothing was learned
- [ ] `git commit` this lesson's code with a message explaining why
