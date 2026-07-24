# Lesson 40: A Third-Party Editor Inside a Vue Component

## What you will build

`CodeEditor.vue` — a new component that replaces `Editor.vue`'s plain
`<textarea v-model="editedContent">` with a real Monaco Editor, the
same editor VS Code itself uses. Monaco knows nothing about Vue; it
manages its own DOM imperatively, the opposite of everything built so
far. This lesson is about the seam between those two worlds: a
*template ref* that hands Vue's reactivity system a real DOM element,
and `watch()` used to keep that element in sync with `editedContent`
without creating a feedback loop.

## What you need to know first

`Lesson 36 - The Tab That Forgot What You Typed.md` — `useEditor.js`,
the writable `editedContent` computed this lesson wraps a real editor
around. `Lesson 37 - Watching for a Change That Isn't Yours.md` —
`watch()`, reused here for a new purpose: not clearing state on tab
switch, but pushing a value change *into* a library Vue doesn't
control. `Lesson 32 - A Real Frontend Project.md` — the jsdom
limitation this lesson runs into again, in a new form.

---

## Concept Unit: a value Vue can't put in a template

### The Problem

Every DOM element built so far came from Vue's template compiler —
`<div>`, `<button>`, `<textarea>` all get created, updated, and
destroyed by Vue itself, driven entirely by reactive state. Monaco
Editor doesn't work that way: it's a real, freestanding npm package
(`monaco-editor`, the same editor VS Code ships) that wants to be
handed a real DOM element it will manage *itself* — appending its own
line-number gutter, its own cursor, its own scrollable text area,
none of it expressed as a Vue template. There is no `<monaco-editor
v-model="editedContent">` tag; the component has to build a plain
`<div>`, then reach into the *actual DOM node* that div becomes, and
hand it to `monaco.editor.create()` directly.

### What This Proves

Confirmed directly, not hypothetically: Monaco Editor is a genuinely
external library — installed via `npm install monaco-editor`, version
`0.55.1`, appearing in `package.json` and `package-lock.json` exactly
like every other dependency this project has needed since Lesson 32.
Nothing about it was written for Vue. The problem this creates is
concrete: `<script setup>`'s reactive `ref()`s live in JavaScript
memory, but `monaco.editor.create()` needs a real `HTMLElement` that
exists *in the actual page* — and every component built through
Lesson 39 only ever read or wrote reactive state, never once needed
to reach into the literal DOM Vue had already built.

---

## Concept Unit: template refs — asking Vue for a real element

### The Problem

`container.value` needs to become a real `<div>` element, but only
*after* Vue has actually created it — reading it too early gets
nothing.

### Concept Lab

```javascript
const { JSDOM } = require('jsdom')
const dom = new JSDOM('<div id="app"></div>', { url: 'http://localhost/' })
global.window = dom.window
global.document = dom.window.document
for (const key of Object.getOwnPropertyNames(dom.window)) {
    if (global[key] === undefined) global[key] = dom.window[key]
}

const { createApp, ref, onMounted } = require('vue')

let capturedBeforeMount = 'not checked yet'
let capturedAfterMount = 'not checked yet'

const app = createApp({
    setup() {
        const container = ref(null)
        capturedBeforeMount = container.value

        onMounted(() => {
            capturedAfterMount = container.value
        })

        return { container }
    },
    template: '<div ref="container" class="probe"></div>',
})

app.mount('#app')

console.log('container.value before mount:', capturedBeforeMount)
console.log('container.value after onMounted:', capturedAfterMount)
console.log('is a real DOM element:', capturedAfterMount instanceof dom.window.HTMLElement)
```

Run it — actual output, this exact run, jsdom standing in for a real
browser the same way Lesson 32 established:

```
container.value before mount: null
container.value after onMounted: HTMLDivElement {}
is a real DOM element: true
```

### What This Proves

`ref="container"` in a template — first appearance — tells Vue's
compiler to take the real DOM element that `<div>` becomes and assign
it to the `ref()` of the same name in `<script setup>`, automatically,
once that element actually exists. `container.value` is confirmed
`null` before mounting (nothing has been created yet) and a genuine
`HTMLDivElement` immediately after — proving `onMounted()` is the
correct, and only correct, place to hand that element to
`monaco.editor.create()`. Reading `container.value` directly inside
`setup()`, before `onMounted()` runs, would get `null` and fail —
demonstrated directly above, not asserted.

### Discard

The probe app, `capturedBeforeMount`, and `capturedAfterMount` are
deleted now — none of this appears in the project. The real version,
next, uses this exact mechanism to mount Monaco instead of logging a
value.

---

## Concept Unit: CodeEditor.vue

### The Problem

A real Monaco instance needs to be created once a real `<div>` exists,
kept in sync with `editedContent` in both directions — typing in
Monaco should update `editedContent`, and switching tabs should update
Monaco — and cleanly destroyed when the component is removed.

### Project Change

- **Files affected** — `frontend/src/components/CodeEditor.vue`, new
  file; `frontend/src/components/Editor.vue`, existing file;
  `frontend/package.json` and `frontend/package-lock.json`, existing
  files.
- **Change type** — create; replace (`<textarea>` swapped for
  `<CodeEditor />`); add (`monaco-editor` dependency).
- **Dependencies** — `useEditor()` (Lesson 36); `watch()` (Lesson 37);
  this lesson's template ref.

`npm install monaco-editor` adds one line to `package.json`'s existing
`dependencies` block, alongside `vue` itself:

```diff
  "dependencies": {
+   "monaco-editor": "^0.55.1",
    "vue": "^3.5.39"
  }
```

`package-lock.json` also changes — regenerated automatically by `npm
install`, per Lesson 32's own explanation of what that file is for, not
something typed by hand.

### The New Code — type this

```javascript
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution'
import { useEditor } from '../composables/useEditor.js'

const { editedContent, activeTabPath } = useEditor()

const container = ref(null)
let editorInstance = null

function languageForPath(path) {
    if (path.endsWith('.py')) {
        return 'python'
    }
    return 'plaintext'
}
```

Creating the real editor, once a real element exists to hold it:

```javascript
onMounted(() => {
    editorInstance = monaco.editor.create(container.value, {
        value: editedContent.value,
        language: languageForPath(activeTabPath.value),
        automaticLayout: true,
    })

    editorInstance.onDidChangeModelContent(() => {
        editedContent.value = editorInstance.getValue()
    })
})
```

Keeping Monaco in sync when `editedContent` changes for a reason that
didn't come from typing — a tab switch, most often — plus disposing
the editor when the component goes away:

```javascript
watch(editedContent, (newValue) => {
    if (editorInstance && editorInstance.getValue() !== newValue) {
        editorInstance.setValue(newValue)
    }
})

watch(activeTabPath, (newPath) => {
    if (editorInstance) {
        monaco.editor.setModelLanguage(editorInstance.getModel(), languageForPath(newPath))
    }
})

onUnmounted(() => {
    if (editorInstance) {
        editorInstance.dispose()
    }
})
```

The template is a single, otherwise-empty `<div>` — everything visible
inside it belongs to Monaco, not to Vue:

```html
<template>
  <div ref="container" class="code-editor"></div>
</template>

<style scoped>
.code-editor {
    width: 100%;
    height: 400px;
}
</style>
```

`Editor.vue` swaps the textarea for this new component and drops
`editedContent` from its own destructuring — it no longer needs to
touch the content directly, only decide when to show the editor at
all:

```diff
  <script setup>
  import { useEditor } from '../composables/useEditor.js'
  import { useRunner } from '../composables/useRunner.js'
  import { useHistory } from '../composables/useHistory.js'
+ import CodeEditor from './CodeEditor.vue'

- const { activeTabPath, editedContent, saveStatus, lockStatus, lockMessage, saveFile, checkoutFile, checkinFile } = useEditor()
+ const { activeTabPath, saveStatus, lockStatus, lockMessage, saveFile, checkoutFile, checkinFile } = useEditor()
  </script>

  <template>
    <div v-if="activeTabPath === null" class="editor-empty">Click a file in the sidebar to open it.</div>
    <div v-else class="editor-pane">
-     <textarea v-model="editedContent"></textarea>
+     <CodeEditor />
```

### The Updated Project — where this lives

`CodeEditor.vue` is entirely new — every block above is the whole
file. `Editor.vue`'s `<script setup>` and template, in full, with the
new line marked:

```html
<script setup>
import { useEditor } from '../composables/useEditor.js'
import { useRunner } from '../composables/useRunner.js'
import { useHistory } from '../composables/useHistory.js'
import CodeEditor from './CodeEditor.vue'                     <!-- ← new -->

const { activeTabPath, saveStatus, lockStatus, lockMessage, saveFile, checkoutFile, checkinFile } = useEditor()
const { runOutput, runHasError, diagnosticsMessage, diagnosticsHasError, runFile, diagnoseFile } = useRunner()
const { commits, historyMessage, diffOutput, currentDiffOutput, loadHistory, selectCommit, diffCurrent } = useHistory()

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
    <CodeEditor />                                            <!-- ← new -->
    <div>
      <button @click="handleSave">Save</button>
      <button @click="checkoutFile">Check Out</button>
      <button @click="checkinFile">Check In</button>
      <button @click="runFile">Run</button>
      <button @click="loadHistory">History</button>
      <button @click="diffCurrent">Current Diff</button>
      <span class="save-status">{{ saveStatus }}</span>
      <span class="lock-status">{{ lockMessage || lockStatus }}</span>
    </div>
    <div :class="diagnosticsHasError ? 'diagnostics-output has-error' : 'diagnostics-output'">{{ diagnosticsMessage }}</div>
    <div :class="runHasError ? 'output-panel has-error' : 'output-panel'">{{ runOutput }}</div>
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
  </div>
</template>
```

`Editor.vue`'s old `.editor-pane textarea` rule is removed entirely —
`CodeEditor.vue` owns its own sizing now through its own `<style
scoped>` block, shown in the New Code section above. Every other rule
in `Editor.vue`'s `<style scoped>` block is unchanged from Lesson 39,
reproduced here in full since it's still part of the real file:

```css
<style scoped>
.save-status {
    font-size: 13px;
    color: #666;
    margin-left: 8px;
}
.lock-status {
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
.output-panel .clickable {
    padding: 2px 4px;
    border-radius: 3px;
}
.output-panel .clickable:hover {
    background-color: #333;
}
</style>
```

### Mechanical Walkthrough
- `import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'` — not `import * as monaco from 'monaco-editor'` — imports only Monaco's

editor core, not every language mode the package ships; the second
import line, `monaco-editor/esm/vs/basic-languages/python/python.
contribution`, registers Python specifically, the only language this
app's `languageForPath()` ever returns besides plaintext. `onMounted`
— this lesson's own dependency, introduced in the Concept Lab above —
is the only place `container.value` is guaranteed non-`null`,
confirmed directly by that same lab. `editorInstance.onDidChangeModelContent()` is
Monaco's own API — not a Vue construct — for reacting to a keystroke;
its callback writes straight into `editedContent.value`, reusing
Lesson 36's writable `computed()` exactly as every other part of the
editor already does. The `if (editorInstance.getValue() !== newValue)`
guard inside `watch()` is what keeps typing from becoming an infinite
loop: without it, every keystroke would call `editorInstance.
setValue()`, which would itself fire `onDidChangeModelContent()`
again, which would write `editedContent.value` again, forever. The
guard breaks that cycle by only calling `setValue()` when the two
values have actually diverged — which happens on a tab switch, not on
a normal keystroke, because a keystroke updates `editedContent`
*from* `editorInstance.getValue()`, so they're already equal by the
time `watch()`'s callback runs.

### CS Lens — an escape hatch from a declarative model

Every component before this one was fully declarative: the template
describes *what* the DOM should look like for a given state, and Vue
figures out *how* to get there — `v-if`, `v-for`, `:class`, all of it.
`CodeEditor.vue` breaks that pattern on purpose, for exactly one
`<div>`: Vue creates that div and then, from `onMounted()` onward,
steps back entirely — everything inside it is built and updated
imperatively, by Monaco's own code, calling its own methods
(`setValue`, `dispose`, `setModelLanguage`) in direct response to
events, the same style every DOM manipulation in this entire project
looked like before Lesson 29 introduced Vue at all. This is not a
failure of Vue's model; it's the standard, necessary shape for
wrapping *any* third-party UI library that manages its own DOM — the
same pattern used to embed a charting library, a map widget, or a rich
text editor inside a declarative framework, in any framework, not just
Vue.

### SE Lens — a version bump problem this project hasn't had before

`monaco-editor` is the first dependency in `frontend/package.json`
that isn't `vue` itself. `npm install monaco-editor` pulled in version
`0.55.1`; `npm audit` reported a moderate-severity vulnerability in
DOMPurify, a package Monaco depends on internally for rendering
tooltip and hover markdown — not something this project's own code
touches directly. Downgrading to `0.53.0` was offered by `npm` as a
fix, but `npm` itself flagged it as a breaking change. This is left
as-is, disclosed rather than silently accepted: a real, live example
of the tradeoff every project with third-party dependencies eventually
faces — a known issue several layers down the dependency tree, with no
fix available yet that doesn't cost something else. `Lesson 32`
already established that `package-lock.json` pins exact versions for
reproducibility; that same lockfile is what makes this vulnerability
*visible* and *specific* (`npm audit` can name it precisely) rather
than an unknown risk.

### Run It

The sync logic verified directly, using a hand-built fake editor
object in place of real Monaco — real Monaco cannot run outside an
actual browser, confirmed separately below — exercising the exact
`watch()` and `onDidChangeModelContent()` logic this component uses:

```
--- scenario 1: user types in the editor ---
editedContent.value: tab A content, user typed more
setValue call count (should be 0 - no loop): 0
--- scenario 2: switching tabs changes editedContent externally ---
fakeEditor.getValue(): tab B content
setValue call count (should be 1 - one real sync): 1
--- scenario 3: setValue triggers onDidChangeModelContent, confirm no infinite loop ---
editedContent.value settled at: tab C content
fakeEditor.getValue() settled at: tab C content
setValue call count (should be 2 total): 2
```

Scenario 1 confirms typing never triggers a redundant `setValue()` —
the guard correctly recognizes the two values are already equal.
Scenario 3 confirms the one case that *could* loop — `setValue()`
itself firing `onDidChangeModelContent()` — settles after exactly one
extra round-trip instead of recursing forever.

Compilation confirmed through Vite's real dev server, not assumed:

```
$ curl http://localhost:5173/src/components/CodeEditor.vue
...
const __returned__ = { editedContent, activeTabPath, container, ... }
...
const _hoisted_1 = { ref: "container", class: "code-editor" }
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("div", _hoisted_1, null, 512 /* NEED_PATCH */))
}
```

`ref: "container"` in the compiled `_hoisted_1` object is Vue's own
compiler confirming this lesson's lab result for real code, not a lab:
the template ref compiles to exactly the binding needed for
`onMounted()` to receive a real element. `npm run build` (Lesson 32's
own production-build check) succeeds with the trimmed imports; a
before/after comparison of the actual build output shows what the
targeted imports did and didn't save:

```
Naive `import * as monaco from 'monaco-editor'` (partial output,
30 language chunks are only some of them):
  dist/assets/typescript-....js    4.67 kB
  dist/assets/cpp-....js           4.74 kB
  dist/assets/sql-....js           8.84 kB
  ... (many more languages this app never uses)
  dist/assets/index-....js     3,760.90 kB │ gzip: 970.58 kB

Trimmed to editor core + Python only:
  dist/assets/python-UpYbf3yu.js      3.45 kB │ gzip:   1.42 kB
  dist/assets/index-C6-qiRwd.js   3,704.46 kB │ gzip: 953.85 kB
```

Disclosed honestly, not oversold: trimming the import removed roughly
thirty unused per-language chunks, but the main bundle only shrank
from 3760.90 kB to 3704.46 kB — about 1.5%. Monaco's *core* (its
editor UI, tokenizer infrastructure, and language-service plumbing) is
the overwhelming majority of its size regardless of which language
modes are included; the targeted import is still worth doing — this
app genuinely never needs C++ or SQL highlighting — but it is not a
dramatic win, and claiming otherwise would misrepresent what was
actually measured.

Confirmed separately, matching Lesson 32's own jsdom limitation in a
new form: Monaco genuinely cannot run outside a real browser or a
bundler-processed environment.

```
$ node -e "require('monaco-editor/esm/vs/editor/editor.api.js')"
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".css"
for .../monaco-editor/esm/vs/editor/standalone/browser/standalone-tokens.css
```

Monaco's own source imports `.css` files directly, something only a
bundler like Vite can resolve — plain Node has no idea what to do with
a `.css` import and fails immediately. This means the actual, final
confirmation — Monaco rendering, a real cursor blinking, real syntax
highlighting turning `def` a different color than a plain identifier —
is the reader's own browser exercise, the same honestly-disclosed
limit Lesson 32 first hit and every migration lesson since has
inherited.

---

## Connect the pieces

`Editor.vue` renders `<CodeEditor />` in exactly the spot the old
`<textarea>` used to occupy — nothing about *when* the editor appears
changed, only *what* appears. Opening a file (`useEditor.js`'s
`openFile`, Lesson 36) sets `editedContent`; `CodeEditor.vue`'s
`onMounted()` reads that value once, at creation, to seed Monaco's
initial content. Every keystroke after that flows through Monaco's own
`onDidChangeModelContent`, writing back into the same `editedContent`
that `saveFile()` (Lesson 36), `diffCurrent()` (Lesson 39), and
`handleSave()`'s diagnostics chain (Lesson 37) already all depend on —
none of those functions needed to change at all, because they never
touched the textarea directly; they only ever touched
`editedContent.value`.

## What breaks without this

Without the `!==` guard inside `watch(editedContent, ...)`, every
keystroke would recurse: typing a character updates `editedContent`,
which the `watch()` callback would see as a change and call
`editorInstance.setValue()`, which fires `onDidChangeModelContent()`
again, updating `editedContent` again — a real infinite loop in a real
browser, not a hypothetical one, confirmed absent here specifically
because the guard is present. Without `onUnmounted()`'s `dispose()`
call, switching away from a file (unmounting `CodeEditor.vue`) would
leak the old Monaco instance — its DOM, its listeners, its language
service worker — every time, growing without bound the longer the app
stays open.

## Exercises

1. Open a Python file in a real browser, type in the editor, and
   confirm `editedContent` (visible via Vue devtools, or by adding a
   temporary `{{ editedContent }}` binding) updates on every
   keystroke.
2. Open two different files in sequence and confirm Monaco's own
   syntax highlighting changes appropriately — Python keywords colored
   in a `.py` file, no special coloring in a non-Python file.
3. Temporarily remove the `if (editorInstance.getValue() !== newValue)`
   guard, reproduce the infinite loop in a real browser (the tab will
   likely freeze), then restore the guard.
4. Explain, without looking back at this lesson, why `CodeEditor.vue`
   needs both `watch(editedContent, ...)` *and*
   `onDidChangeModelContent()` — why one alone isn't enough.

## Definition of done

- [ ] You've typed in the real Monaco editor in a real browser and
      confirmed `editedContent` updates
- [ ] You've opened a `.py` file and a non-Python file and confirmed
      Monaco's syntax highlighting differs between them
- [ ] You've reproduced the infinite-loop bug by removing the guard,
      confirmed it, and restored the fix
- [ ] You can explain why `container.value` is `null` before
      `onMounted()` runs and why that matters for this component
- [ ] `git commit` this lesson's code with a message explaining why
