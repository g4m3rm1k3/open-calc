# Video Notes — Lesson 19 — Export, Import, and Monaco

## What You Will Build

A "↓ Export Library" button downloads every video and note as one real
`.json` file — the same kind of download confirmed working, back at the
very start of this series, in HTML Lab's sandboxed preview. An "↑ Import
Library" control reads that file back in, on a different browser or
computer entirely, merging it into whatever is already there. And as an
optional bonus, a small "🧪 Code Scratchpad" panel loads a real Monaco
editor — the same editor VS Code itself is built on — using the exact same
dynamic-loading technique lesson 15 built for KaTeX.

---

## What You Need to Know First

Lesson 18 left every video and note reachable through `library.videos`,
persisted by `library.save()`, added through `library.addVideo` and
`library.addNote`.

---

## Step 1 — Export the Library

**The problem:** `localStorage` keeps a video library on one browser, on
one device. There is currently no way to move it anywhere else.

Update `.app-header` in the HTML tab:

```html
<div class="app-header">
  <h1>Video Notes</h1>
  <p class="shortcut-hint">Press <kbd>/</kbd> to search, <kbd>n</kbd> for a new note</p>
  <div class="header-actions">
    <button id="export-library-button">↓ Export</button>
    <button id="settings-toggle-button" class="settings-toggle-button">⚙️ Settings</button>
  </div>
</div>
```

Add to the CSS tab:

```css
.header-actions {
  display: flex;
  gap: var(--space-sm);
}

#export-library-button {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius);
  border: 1px solid var(--colour-border);
  background-color: var(--colour-panel-bg);
  color: var(--colour-text);
  cursor: pointer;
}
```

Add to `script.js`:

```javascript
document.getElementById('export-library-button').addEventListener('click', () => {
  const json = JSON.stringify(library.videos, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'video-notes-export.json';
  link.click();

  URL.revokeObjectURL(url);
});
```

Click **▶ Preview**, add a video or two, and click "↓ Export": a real
`video-notes-export.json` file downloads, containing every video and note.

**Walkthrough — `Blob`, a file-shaped piece of data with no real file
behind it.** `new Blob([json], { type: 'application/json' })` builds a
**Blob** — Binary Large Object — an in-memory object the browser treats
exactly like a real file, without one ever touching the disk. Its first
argument is an array of the actual content (here, just the one JSON
string); its second is an options object naming the **MIME type** — the
same kind of label lesson 13's `dataTransfer.setData('text/plain', ...)`
used, here `'application/json'`, telling anything that later reads this
Blob what kind of data it contains.

`URL.createObjectURL(blob)` asks the browser to generate a special,
temporary URL — starting with `blob:` — that refers directly to this Blob,
for as long as the current page stays open. `link.href = url` and
`link.download = 'video-notes-export.json'` are the two pieces that turn a
plain `<a>` into a *download* link: `download`, set to a non-empty string,
tells the browser "save this, using this filename," instead of navigating
to it. `link.click()` triggers that download **programmatically** —
without a person's mouse ever touching this `<a>`, and without it ever
being inserted into the page at all; a link only needs to exist as a real
object in memory to be clicked this way, not to be visible or even present
in the DOM.

`URL.revokeObjectURL(url)`, called immediately after, releases the memory
the browser set aside for that temporary `blob:` URL — once the download
has started, the URL has done its one job, and holding onto it any longer
would be a small, avoidable memory leak, one this project would accumulate
a little more of every single time "Export" is clicked.

---

## Step 2 — Import a Library

**The problem:** A person with an exported `.json` file has no way to
bring its contents into a different browser's copy of this project.

Update `.header-actions` in the HTML tab:

```html
<div class="header-actions">
  <button id="export-library-button">↓ Export</button>
  <label class="import-library-label">
    ↑ Import
    <input type="file" id="import-file-input" accept="application/json" hidden />
  </label>
  <button id="settings-toggle-button" class="settings-toggle-button">⚙️ Settings</button>
</div>
```

Add to the CSS tab:

```css
.import-library-label {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius);
  border: 1px solid var(--colour-border);
  background-color: var(--colour-panel-bg);
  color: var(--colour-text);
  cursor: pointer;
}
```

Add a method to `NoteLibrary` in `script.js`:

```javascript
importVideos(importedVideos) {
  for (const video of importedVideos) {
    this.videos.push({ ...video, id: this.nextVideoId() });
  }
  this.save();
}
```

Add to `script.js`:

```javascript
document.getElementById('import-file-input').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const importedVideos = JSON.parse(reader.result);
      if (!Array.isArray(importedVideos)) {
        throw new Error('Not a valid export');
      }

      library.importVideos(importedVideos);
      renderVideoList();
    } catch {
      alert('That file does not look like a valid Video Notes export.');
    }
  };

  reader.readAsText(file);
});
```

Click **▶ Preview**, export the library, then click "↑ Import" and select
the very file you just downloaded: every video reappears a second time —
imported as *new* entries alongside the originals, not replacing them.

**Walkthrough — `<label>` wrapping a hidden `<input type="file">`.** A real
file input is difficult to style directly — every browser renders its own
version of the button and text. Wrapping it in a `<label>` and giving the
input the `hidden` attribute (a boolean HTML attribute that removes an
element from the page entirely, the same effect as `display: none` but
stated directly in the HTML rather than in CSS) hides the ugly native
control completely — clicking *anywhere on the label*, including its own
visible text, still opens the exact same file picker, because a `<label>`
wrapping a form control automatically forwards clicks to it. This is a
real, common pattern: the visible "↑ Import" button is the label; the
actual file input is invisible but still fully functional underneath it.

**Walkthrough — `event.target.files`, and `FileReader`.** `event.target.
files` is a special property every file input carries: a list of every
file selected — `files[0]` is the first (and, with no `multiple` attribute
present, only) one. `new FileReader()` creates an instance of a browser API
built specifically for reading a selected file's contents from
JavaScript. `reader.onload` is the exact same callback shape lesson 15's
dynamic `<script>` loading used — a function that runs once, the moment
the asynchronous operation it is watching finishes — except here, what
finished is reading the file's contents into memory, not downloading a
library over the network. `reader.result` holds those contents, as plain
text, because `reader.readAsText(file)` was the method chosen to start the
read; `FileReader` has other read methods for other purposes (reading
images as raw binary data, for instance) not needed here.

**Walkthrough — `importVideos`, and why every imported video gets a brand
new id.** An exported file's videos still carry whatever ids they had in
the library that exported them — ids that could easily collide with ids
already in *this* library (two libraries that both started from zero would
both have a video with `id: 1`). `{ ...video, id: this.nextVideoId() }`
copies every field from the imported video, then immediately overwrites
just `id` with a fresh one, guaranteed unique in *this* library — the exact
same `nextVideoId()` method `addVideo` already relies on, reused here for
a second, related reason: two different actions, "create a video from a
form" and "bring in a video from an import," both need the identical
guarantee, so both go through the identical method that provides it.

`try`/`catch` around the whole operation, with `if (!Array.isArray
(importedVideos)) { throw new Error(...); }` added deliberately, guards
against a file that parses as valid JSON but is not actually a Video Notes
export at all — a stray `.json` file containing, say, a single number or an
unrelated object. Both real failure modes — invalid JSON syntax, and valid
JSON that is the wrong *shape* — land in the same `catch`, showing one
clear message instead of crashing.

---

## Step 3 (Optional) — A Real Code Editor via Monaco

**The problem, and why this step is optional.** Nothing about this project
needs a professional code editor — its notes are short, tag-and-search-able
text, well served by lesson 14's plain textarea. This step exists because
loading a genuinely large, real third-party editor is a satisfying capstone
to the exact technique lesson 15 introduced, not because Video Notes is
missing something without it. What follows is a small, self-contained
scratchpad — deliberately kept separate from the note editor, so it can
never interfere with anything already built.

Add to the HTML tab, after the settings panel:

```html
<button id="scratchpad-toggle-button" class="settings-toggle-button">🧪 Code Scratchpad</button>
<div id="scratchpad-panel" class="scratchpad-panel scratchpad-panel-hidden">
  <div id="scratchpad-editor-container" class="scratchpad-editor-container"></div>
</div>
```

Add to the CSS tab:

```css
.scratchpad-panel-hidden {
  display: none;
}

.scratchpad-editor-container {
  height: 300px;
  border-top: 1px solid var(--colour-border);
}
```

Add to `script.js`:

```javascript
let scratchpadEditor = null;

document.getElementById('scratchpad-toggle-button').addEventListener('click', () => {
  const panel = document.getElementById('scratchpad-panel');
  panel.classList.toggle('scratchpad-panel-hidden');

  if (scratchpadEditor || panel.classList.contains('scratchpad-panel-hidden')) {
    return;
  }

  loadScript('https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js', () => {
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
    require(['vs/editor/editor.main'], () => {
      scratchpadEditor = monaco.editor.create(document.getElementById('scratchpad-editor-container'), {
        value: '// Jot code here while you take notes.\n// Nothing here is saved between reloads.',
        language: 'javascript',
        theme: 'vs-dark',
      });
    });
  });
});
```

Click **▶ Preview**, then click "🧪 Code Scratchpad": a real Monaco editor
appears, with syntax highlighting, bracket matching, and every editing
feature Monaco itself provides — genuinely the same editor this project's
own HTML Lab, and Visual Studio Code, are both built on.

**Walkthrough — reusing `loadScript` from lesson 15, unchanged.** This
project already has a general-purpose function for loading a script from a
CDN and running code once it finishes — lesson 15 wrote it for KaTeX, and
it required no changes at all to load a completely different library here.
This is the same payoff lesson 09's `createTagPills` and lesson 18's
`findVideo` both delivered: a function written to solve one specific
problem, general enough that a later, unrelated problem reuses it exactly
as it already was.

**Walkthrough — Monaco's own loader, a second, different loading
mechanism.** KaTeX, once its one `<script>` finished loading, defined a
single global `katex` object immediately. Monaco is larger and structured
differently: `loader.js` is a small bootstrap file that provides a
`require()` function — not JavaScript's `import`, but an older,
still-widely-used module-loading pattern called **AMD** (Asynchronous
Module Definition). `require.config({ paths: { vs: '...' } })` tells this
loader *where* to find Monaco's remaining files; `require(['vs/editor/
editor.main'], callback)` then asynchronously loads that specific module
and everything it depends on, calling the given function only once
everything is fully ready — `monaco.editor.create(...)`, inside it, is the
first moment the real `monaco` object exists at all. This nested loading —
a `<script>` that loads a loader, which loads the real library — is a
real, common shape for genuinely large third-party libraries, distinct
from KaTeX's simpler, single-file case.

**Walkthrough — `monaco.editor.create(container, options)`.** The first
argument is the real DOM element the editor will render itself into —
`scratchpad-editor-container`, an otherwise empty `<div>` this lesson gave
a fixed height so Monaco has real, visible space to fill. `value` is the
starting text; `language` enables syntax highlighting rules for that
specific language; `theme` selects one of Monaco's built-in colour schemes.

**SE lens — why this editor is created once, and never rebuilt.**
`if (scratchpadEditor || panel.classList.contains('scratchpad-panel-hidden'))
{ return; }` guards against creating a second Monaco instance every time
the button is clicked — `scratchpadEditor` starts `null`, becomes a real
instance the first time the panel opens, and stays that same instance for
the rest of the page's life. This matters because the scratchpad panel
lives entirely outside `#notes-container` and `#video-list-items` — the two
elements this project's render functions ever clear and rebuild — so
nothing in this project will ever tear down and recreate the DOM element
Monaco is attached to. Placing genuinely stateful, expensive-to-create
objects like this outside of anything a render function regularly rebuilds
is a real, deliberate architectural choice, not an accident of where the
HTML happened to be typed.

---

## Connect the Pieces

```
index.html    #export-library-button, #import-file-input,
              #scratchpad-panel — new, independent controls, none of them
              inside anything renderVideoList() or renderNotesPanel()
              ever clears
script.js     library.importVideos() — reuses nextVideoId(), the same
              method addVideo() already depends on
              loadScript() — reused, completely unchanged, from lesson 15
```

---

## What Breaks Without This

**Without reassigning ids in `importVideos`:** Export a library, then
import that same file back into itself without the `id: this.nextVideoId()`
override. Every imported video shares an id with an existing one —
`library.findVideo(id)` (lesson 18) can no longer reliably tell the two
apart, and clicking one in the sidebar may seek, play, or show notes for
the *other* video sharing that id, silently.

**Without the `Array.isArray` check in the import handler:** Select any
`.json` file that is not a Video Notes export — even one containing valid
JSON, like `{"hello": "world"}`. `JSON.parse` succeeds, `importedVideos`
becomes that unrelated object, and `for (const video of importedVideos)`
inside `importVideos` throws, since a plain object (not an array) cannot be
iterated with `for...of` — an unhelpful crash instead of the clear alert
message the `Array.isArray` check exists to produce instead.

---

## Definition of Done

- [ ] "↓ Export" downloads a real `.json` file containing every video and note
- [ ] "↑ Import" reads that file back in, adding its videos without overwriting or colliding with existing ones
- [ ] Selecting an unrelated or invalid file shows a clear message instead of crashing
- [ ] (Optional) "🧪 Code Scratchpad" opens a real, working Monaco editor, created only once no matter how many times the button is clicked
- [ ] You can explain what a `Blob` is and why `URL.revokeObjectURL` is called after triggering the download
- [ ] You can explain why every imported video receives a new id instead of keeping the one from its original file
- [ ] You can explain the difference between how KaTeX (lesson 15) and Monaco each became available after their `<script>` tags loaded
- [ ] (If completed) You can explain why the scratchpad's Monaco instance is created only once, and why its container never gets torn down by this project's other render functions

---

*This is the last lesson in this series. Video Notes plays real embedded
video, times and tags and searches and sorts and reorders notes by hand,
formats and safely renders user-typed text, typesets real mathematics,
switches themes, responds to keyboard shortcuts, is organised behind a real
class instead of a pile of independent functions, and can leave — and come
back to — the browser it was built in, as a real file. Every one of those
features started the same way: a felt need, the smallest real piece that
addressed it, a name for the concept behind it, and an honest look at what
would break without it. That process does not end here — a tagging system
for videos themselves, collaborative shared libraries, a proper undo
history for note edits, are all real, obvious next felt needs, each one
reachable with exactly the same process that built everything already
here.*
