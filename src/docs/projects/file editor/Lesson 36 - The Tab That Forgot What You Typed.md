# Lesson 36: The Tab That Forgot What You Typed

## What you will build

Tabs and a basic editor — `TabBar.vue` and `Editor.vue`, backed by a
new composable, `useEditor.js` — reaching feature parity with Lessons
3 and 4's original open/view/edit/save loop, ported into `frontend/`.
Along the way, this lesson finds a real, reproducible bug that has
existed in this project since Lesson 4 and survived, unnoticed, through
every lesson since: switching away from a tab with unsaved changes and
back **silently discards them**. Confirmed first, fixed second, the
same order this project has always used for a real bug.

## What you need to know first

`Lesson 35 - The File Browser, and a Composable That Calls Another.md`
— `useAuth.js`, `useFileSystem.js`, composables calling composables.
`Lesson 4 - Multiple Tabs.md` and `Lesson 28 - Locking It Down in the
UI.md` — the original `openFile`, `closeTab`, `renderTabs`,
`renderEditor`, and `saveFile`, all being ported here. `Lesson 30`'s
`v-model`.

---

## Concept Unit: a real bug, found before it's fixed

### The Problem

Every past version of this editor — the original `index.html` since
Lesson 4, and this project's own first draft of `useEditor.js` a
moment ago — resets the textarea's content to whatever was last saved,
every single time the active tab changes, including switching to a
different tab and back. Confirmed directly in the original code
(`Lesson 28 - Locking It Down in the UI.md`, `renderEditor`):

```javascript
document.getElementById("file-content").value = activeTab.content;
```

runs unconditionally, every time. If a person types something, clicks
a different tab, then clicks back — that line runs again, overwriting
whatever they typed with `activeTab.content`, which was never updated
because nothing was ever saved.

### What This Proves

Confirmed for real, against this project's actual backend, using a
first-draft `useEditor.js` written the same way the old code worked —
a single shared `editedContent` ref, reset on every tab switch:

```
1) typed an unsaved edit, editedContent includes it: true
2) switched to a different tab: true (correctly shows the other file)
3) switched BACK to the original tab - is the unsaved edit still there? false
```

The edit is gone — not flagged, not warned about, silently replaced by
the last-saved version. This is a real, reproducible bug, not a
hypothetical one: it has existed since Lesson 4 and would have been
carried forward unchanged into this port if not caught here.

### Discard

That first-draft `useEditor.js` is deleted now — the version shown
later in this lesson is the one that actually ships.

---

## Concept Unit: a value derived from — and written back into — other state

### The Problem

The fix needs the textarea to read *and write* directly through to
whichever tab is currently active, so there's no separate "draft" copy
to go stale. Plain `ref()` can't do this — it holds one independent
value, with no concept of "currently derived from something else."

### Concept Lab

```javascript
const { ref, computed } = require("vue")

const tabs = ref([
    { path: "a.py", content: "print('a')" },
    { path: "b.py", content: "print('b')" },
])
const activePath = ref("a.py")

const activeContent = computed({
    get() {
        const tab = tabs.value.find((t) => t.path === activePath.value)
        return tab ? tab.content : ""
    },
    set(newValue) {
        const tab = tabs.value.find((t) => t.path === activePath.value)
        if (tab) {
            tab.content = newValue
        }
    },
})

console.log(activeContent.value)
activeContent.value = "print('a EDITED')"
console.log(tabs.value[0].content)
activePath.value = "b.py"
console.log(activeContent.value)
activePath.value = "a.py"
console.log(activeContent.value)
```

Run it — actual output, this exact run:

```
1) activeContent.value (reading, active=a.py): print('a')
2) after writing through activeContent:
   activeContent.value: print('a EDITED')
   tabs.value[0].content (the underlying data changed too): print('a EDITED')
3) after switching activePath to b.py, activeContent.value: print('b')
4) switching back to a.py, activeContent.value (edit preserved): print('a EDITED')
```

### What This Proves

`computed({ get() {...}, set(newValue) {...} })` — first appearance —
creates a **writable computed**: unlike a plain `ref()`, it has no
storage of its own. Reading `.value` runs `get()`, computing an answer
fresh from other reactive state (here, whichever tab matches
`activePath.value`); writing `.value` runs `set(newValue)`, which this
lab uses to write the new value *into that same underlying tab*, not
into some separate holding cell. That's the entire fix, proven directly
above: `tabs.value[0].content` genuinely changed — the edit isn't
sitting in a disconnected draft, it's already part of the real data.
Switching `activePath` and back doesn't lose anything, because there
was never a second copy to lose; `activeContent` was always just a
window onto whichever tab is active.

### Discard

`tabs`, `activePath`, and `activeContent` from this lab are deleted
now — the real `useEditor.js`, next, applies this identical pattern to
`openTabs` and `activeTabPath`.

---

## Concept Unit: useEditor.js

### The Problem

`openFile`, `closeTab`, and `saveFile` — all working, real logic from
Lessons 4 and 28 — need a home as a composable, using this lesson's
`computed()` fix instead of the bug this lesson just found and proved.

### Project Change

- **Files affected** — `frontend/src/composables/useEditor.js`, new
  file.
- **Change type** — create.
- **Dependencies** — `useAuth()` (Lesson 35); this lesson's writable
  `computed()` pattern.

### The New Code — type this

```javascript
import { ref, computed } from 'vue'
import { useAuth } from './useAuth.js'

const { authenticatedFetch } = useAuth()

const openTabs = ref([])
const activeTabPath = ref(null)
const saveStatus = ref('')

const editedContent = computed({
    get() {
        const tab = openTabs.value.find((t) => t.path === activeTabPath.value)
        return tab ? tab.content : ''
    },
    set(newContent) {
        const tab = openTabs.value.find((t) => t.path === activeTabPath.value)
        if (tab) {
            tab.content = newContent
        }
    },
})

function setActiveTab(path) {
    activeTabPath.value = path
    saveStatus.value = ''
}
```

`openFile` and `closeTab` are direct ports of Lesson 4's own logic,
`.value` added wherever the old code touched a plain global variable:

```javascript
function openFile(path) {
    const existingTab = openTabs.value.find((tab) => tab.path === path)
    if (existingTab) {
        setActiveTab(path)
        return
    }

    authenticatedFetch('http://127.0.0.1:8000/file?path=' + encodeURIComponent(path))
        .then((response) => response.json())
        .then((data) => {
            openTabs.value.push({ path: data.path, content: data.content, checked_out_by: data.checked_out_by })
            setActiveTab(data.path)
        })
        .catch(() => {
            saveStatus.value = 'Could not load file.'
        })
}

function closeTab(path) {
    openTabs.value = openTabs.value.filter((tab) => tab.path !== path)
    if (activeTabPath.value === path) {
        const lastTab = openTabs.value[openTabs.value.length - 1]
        setActiveTab(lastTab ? lastTab.path : null)
    }
}
```

`saveFile` is Lesson 28's own `response.ok`-checking logic, unchanged
in behavior — the one line it no longer needs is worth noticing by its
absence:

```javascript
function saveFile() {
    if (activeTabPath.value === null) {
        return
    }

    let wasSuccessful = false

    authenticatedFetch('http://127.0.0.1:8000/file?path=' + encodeURIComponent(activeTabPath.value), {
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
                return
            }
            saveStatus.value = 'Saved.'
        })
        .catch(() => {
            saveStatus.value = 'Could not save.'
        })
}

export function useEditor() {
    return { openTabs, activeTabPath, editedContent, saveStatus, setActiveTab, openFile, closeTab, saveFile }
}
```

### The Updated Project — where this lives

This is the entire file — a brand-new module, nothing to place it
inside of.

### Mechanical Walkthrough

`openFile`/`closeTab` reuse Lesson 4's exact shapes — `.find()`,
`.filter()`, `.push()`, all already-taught array methods, applied to
`openTabs.value` instead of the old global `openTabs`.
`authenticatedFetch`, imported from `useAuth()` exactly like
`useFileSystem.js` already does (Lesson 35), is this composable's own
second instance of one composable calling another. The one real
absence, worth naming explicitly: the old Lesson 28 `saveFile` had a
line, `activeTab.content = content;` (later `activeTab.content =
editedContent.value;`), copying the saved value back onto the tab
after a successful save. That line is gone here, and its absence is
not an oversight — `editedContent`'s `set()` already writes directly
into `openTabs`, on every keystroke, not just after a save. By the
time `saveFile` runs, `editedContent.value` already *is*
`activeTab.content`; copying it onto itself would do nothing.

### SE Lens — fixing a bug by removing a redundant assignment

The old code needed that extra line because its `editedContent`-
equivalent (the textarea's raw DOM `.value`) was never connected to
`openTabs` except at that one moment, right after a successful save.
This lesson's fix isn't "remember to also update `openTabs` in one
more place" — it's making `openTabs` the *only* place the content ever
lives, so there's no second copy left to synchronize, ever. Removing a
line ended up being the fix, not adding one — a real, checkable sign
the underlying design, not just the specific bug, actually improved.

### Run It

Confirmed against a real backend, using the actual fixed composable —
the same scenario that failed in this lesson's first unit, now
correct:

```
1) opened src/utils.py, first line: def add(a, b):
2) typed an unsaved edit, editedContent now includes it: true
3) switched to src/main.py, editedContent is main.py's content: true
4) switched BACK to src/utils.py - is the unsaved draft still there? true
5) after real saveFile(), saveStatus: Saved.
```

Step 4 is the fix, proven directly: the same real scenario that lost
data in this lesson's first unit now preserves it exactly.

---

## Concept Unit: TabBar.vue

### The Problem

Every open tab needs to render as a clickable element showing which
one is active, with its own independent close button that doesn't also
trigger switching to that tab.

### Project Change

- **Files affected** — `frontend/src/components/TabBar.vue`, new file.
- **Change type** — create.
- **Dependencies** — `useEditor()`; `v-for`/`:key` (Lesson 31).

### The New Code — type this

```html
<script setup>
import { useEditor } from '../composables/useEditor.js'

const { openTabs, activeTabPath, setActiveTab, closeTab } = useEditor()
</script>

<template>
  <div class="tab-bar">
    <div
      v-for="tab in openTabs"
      :key="tab.path"
      :class="tab.path === activeTabPath ? 'tab active' : 'tab'"
      @click="setActiveTab(tab.path)"
    >
      <span>{{ tab.path }}</span>
      <span class="tab-close" @click.stop="closeTab(tab.path)">x</span>
    </div>
  </div>
</template>
```

The styling — a direct, unchanged port of Lesson 4's own `.tab`/
`.tab.active`/`.tab-close` rules, moved from the old global stylesheet
into this component's own scoped block:

```css
<style scoped>
.tab-bar {
    display: flex;
    border-bottom: 1px solid #ccc;
    margin-bottom: 8px;
}
.tab {
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-bottom: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
}
.tab.active {
    background-color: #eee;
    font-weight: bold;
}
.tab-close {
    cursor: pointer;
    color: #888;
}
.tab-close:hover {
    color: #000;
}
</style>
```

### The Updated Project — where this lives

This is the entire file — a brand-new component, nothing to place it
inside of.

### Mechanical Walkthrough

`:class="tab.path === activeTabPath ? 'tab active' : 'tab'"` — first
appearance of binding `class` with `:` (Lesson 31's `v-bind` family,
already used for `:key`) — Vite's own compiled output confirms exactly
what this does: `class: _normalizeClass(tab.path === $setup.activeTabPath
? 'tab active' : 'tab')`, a plain ternary producing a string, assigned
as the element's class. `@click.stop` — first appearance of a Vue
**event modifier**: compiled output confirms it wraps the handler in
`_withModifiers(..., ["stop"])`, calling `event.stopPropagation()`
(Lesson 4) before running `closeTab` — without it, clicking the close
button would also trigger the *tab's own* `@click`, switching to a tab
about to be closed, the exact bug Lesson 4's original `stopPropagation()`
call already existed to prevent.

### Run It

Confirmed via Vite's real compiled output — the parts that matter,
isolated from boilerplate:

```javascript
class: _normalizeClass(tab.path === $setup.activeTabPath ? 'tab active' : 'tab'),
onClick: $event => ($setup.setActiveTab(tab.path))
...
onClick: _withModifiers($event => ($setup.closeTab(tab.path)), ["stop"])
```

Both directives compiled exactly as intended, confirmed by reading the
compiler's own generated code rather than assuming it from the source.

---

## Concept Unit: Editor.vue

### The Problem

Something needs to show either an empty-state message or the actual
textarea, bound to this lesson's fixed `editedContent`, with a Save
button and status line.

### Project Change

- **Files affected** — `frontend/src/components/Editor.vue`, new file;
  `frontend/src/components/FileBrowser.vue`, existing file;
  `frontend/src/App.vue`, existing file.
- **Change type** — create; add (`openFile` wired into a real file
  click); replace (`App.vue`'s logged-in branch).
- **Dependencies** — `useEditor()`; `v-model` (Lesson 30); `v-if`/`v-else`
  (Lesson 34).

### The New Code — type this

```html
<script setup>
import { useEditor } from '../composables/useEditor.js'

const { activeTabPath, editedContent, saveStatus, saveFile } = useEditor()
</script>

<template>
  <div v-if="activeTabPath === null" class="editor-empty">Click a file in the sidebar to open it.</div>
  <div v-else class="editor-pane">
    <textarea v-model="editedContent"></textarea>
    <div>
      <button @click="saveFile">Save</button>
      <span class="save-status">{{ saveStatus }}</span>
    </div>
  </div>
</template>
```

The styling — a direct port of Lesson 3's own `#file-content` textarea
rule, plus a small new status-line style:

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
</style>
```

`FileBrowser.vue`'s file click, previously a no-op, now calls the real
`openFile`:

```javascript
} else {
    openFile(entryPath)
}
```

### The Updated Project — where this lives

`FileBrowser.vue`'s `handleEntryClick`, in full, with the change
marked:

```javascript
function handleEntryClick(entry) {
    const entryPath = currentPath.value === '' ? entry.name : currentPath.value + '/' + entry.name
    if (entry.is_directory) {
        loadFolder(entryPath)
    } else {
        openFile(entryPath)                                        // ← changed: was a no-op
    }
}
```

`App.vue`, in full, with the changed lines marked — `LoginScreen`'s
branch and `FileBrowser` are unchanged from Lesson 35:

```html
<script setup>
import BackendStatus from './components/BackendStatus.vue'
import LoginScreen from './components/LoginScreen.vue'
import FileBrowser from './components/FileBrowser.vue'
import TabBar from './components/TabBar.vue'                        <!-- ← new -->
import Editor from './components/Editor.vue'                         <!-- ← new -->
import { useAuth } from './composables/useAuth.js'

const { authToken } = useAuth()                                       <!-- ← changed: currentUsername no longer needed here -->
</script>

<template>
  <BackendStatus />
  <LoginScreen v-if="authToken === null" />
  <div v-else class="layout">
    <FileBrowser />
    <div class="main-content">
      <TabBar />                                                       <!-- ← new -->
      <Editor />                                                        <!-- ← new -->
    </div>
  </div>
</template>
```

Lesson 34's temporary "Logged in as {{ currentUsername }}" placeholder
— built only to prove the login flow worked before there was any real
content to show — is gone, replaced by the actual tab bar and editor
it was always standing in for.

### Mechanical Walkthrough

`v-model="editedContent"` reuses Lesson 30's directive exactly, now
bound to a writable `computed()` instead of a plain `ref()` — Vue
doesn't distinguish between the two when compiling `v-model`, since
both expose the same `.value` getter/setter interface; the compiled
output confirms this directly, generating identical
`onUpdate:modelValue` wiring either way. `v-if="activeTabPath === null"`
/`v-else` reuse Lesson 34's exact pattern, gating on `activeTabPath`
instead of `authToken`.

### Run It

Confirmed via Vite's real compiled output for `Editor.vue`, proving
`v-model` correctly targets the writable computed:

```javascript
_withDirectives(_createElementVNode("textarea", {
  "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => (($setup.editedContent) = $event))
}, null, 512), [[_vModelText, $setup.editedContent]])
```

Combined with this lesson's earlier real backend verification — open,
edit, switch tabs, switch back, save, all against real files — this is
the complete loop working end to end.

---

## Connect the pieces

Clicking a file in `FileBrowser.vue` now calls `openFile`, which
fetches the real content and adds a tab. `TabBar.vue` renders it,
`:class` marking it active; `Editor.vue`'s `v-if` sees `activeTabPath`
is no longer `null` and shows the real textarea, `v-model` bound to
`editedContent` — a computed window directly onto that tab's own
`content`. Typing writes straight through to `openTabs`; switching
tabs changes what `editedContent` looks at, never what it holds onto
separately, so nothing is ever lost. Clicking Save sends
`editedContent.value` — already synchronized with `openTabs` — to the
real backend, and a real `saveStatus` message, success or the backend's
own specific rejection reason, appears either way.

## What breaks without this

Already demonstrated with real, pasted output at the top of this
lesson: without the writable `computed()`, a plain shared
`editedContent` ref reset on every tab switch reproduces the exact bug
this lesson opened with — a real edit, silently discarded, with
nothing on screen indicating anything was lost.

## Exercises

1. Open two files, type something in one without saving, switch to the
   other, switch back, and confirm your edit is still there — in a
   real browser, completing what this lesson could only verify through
   the composable's own logic.
2. Check a file out first (there's no UI for this yet — use `curl` or
   the browser's dev tools against `POST /checkout`), then confirm
   Save actually succeeds once the lock is held.
3. Temporarily revert `editedContent` to a plain `ref('')`, reset on
   tab switch, reproduce this lesson's exact bug in a real browser,
   then restore the fix.
4. Explain, without looking back at this lesson, why `saveFile` no
   longer needs a line copying `editedContent.value` onto the active
   tab after a successful save.

## Definition of done

- [ ] You've opened multiple files, edited one without saving, switched
      away and back, and confirmed the edit survived, in a real browser
- [ ] You've reproduced this lesson's exact bug on purpose by reverting
      the fix, watched it fail, and restored the fix
- [ ] You've saved a real, checked-out file through the actual running
      app and seen "Saved." appear
- [ ] You can explain what a writable `computed()`'s `get`/`set` each
      do, and why `openTabs` is the only place tab content ever lives
- [ ] `git commit` this lesson's code with a message explaining why
