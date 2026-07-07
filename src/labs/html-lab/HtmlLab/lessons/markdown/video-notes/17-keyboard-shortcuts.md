# Video Notes — Lesson 17 — Keyboard Shortcuts

## What You Will Build

Press `/` anywhere on the page, and the search box gains focus, ready to
type into immediately. Press `n`, and a new note starts for whichever video
is currently selected — the same action as clicking "+ Add Note at Current
Time," without reaching for the mouse. Both work no matter which element on
the page happens to have focus at the time, with one deliberate exception
this lesson spends most of its time on: neither shortcut fires while a
person is actively typing into a field, where `/` and `n` obviously need to
type themselves instead.

---

## What You Need to Know First

Lesson 11 left `#notes-search-input` as a real, permanent input element.
Lesson 07 left `handleAddNote(video)` as the function that prompts for a
note's text and tags and adds it to that video.

---

## Step 1 — Listen for Keys Anywhere on the Page

**The problem:** Every event listener this project has written so far is
attached to one specific element — a button, an input, a video item — and
only fires when *that* element is the one interacted with. A keyboard
shortcut needs to work regardless of what currently has focus, which means
no single element is the right place to listen.

Add to `script.js`:

```javascript
document.addEventListener('keydown', (event) => {
  console.log('key pressed:', event.key);
});
```

Click **▶ Preview**, open the browser console, and press a few keys
anywhere on the page: every keystroke logs, no matter where you clicked
first.

**Walkthrough — event bubbling, and why `document` hears everything.**
When a key is pressed, the browser does not only notify listeners attached
to the exact element that had focus — it fires the event on that element
*first*, then fires it again on that element's parent, then that parent's
parent, and so on, all the way up to `document` itself. This upward chain
is called **event bubbling**. A listener attached directly to `document`
receives every `keydown` event that happens anywhere on the page, precisely
*because* of bubbling — there is no need to attach a separate listener to
every button, input, and div individually.

`event.key` is a property every keyboard event carries: a string naming
exactly which key was pressed — `'a'`, `'Enter'`, `'Escape'`, `'/'` — read
directly, with no lookup table or numeric code required. Remove the
`console.log` line before continuing; it was only here to prove the
listener fires at all.

---

## Step 2 — Focus Search on `/`

**The problem:** Nothing yet actually does anything useful with a
keystroke.

Update the listener in `script.js`:

```javascript
document.addEventListener('keydown', (event) => {
  if (event.key === '/') {
    event.preventDefault();
    document.getElementById('notes-search-input').focus();
  }
});
```

Click **▶ Preview**, click anywhere on the page to make sure nothing is
focused inside a text field, then press `/`: the search box gains focus
immediately, its cursor blinking, ready to type into.

**Walkthrough:** `event.preventDefault()` — the same method lesson 03 used
to stop a form from reloading the page, and lesson 13 used to allow a
drop target — means something different again here: some browsers (Firefox,
notably) treat `/` as a built-in shortcut for their own "quick find"
feature. Calling `preventDefault()` stops that browser-native behaviour
from also triggering, so only this project's own search box responds.
`.focus()` is a method every focusable element has — it moves the
browser's keyboard focus to that element programmatically, the same state
an element enters when a person clicks directly into it.

---

## Step 3 — The Trap: Don't Hijack Keys While Someone Is Typing

**The problem:** Try typing the word `"can't stop won't stop"` into a
note's text — the search box steals focus the instant you type the `/` in
`can't`... except this note has no `/` in it. Try a word that does contain
one, or simply try typing a literal `/` into any note's text right now: the
shortcut fires and yanks focus away from the note you were writing, to the
search box, mid-sentence.

Update the listener in `script.js`:

```javascript
document.addEventListener('keydown', (event) => {
  const isTypingInField = event.target instanceof HTMLInputElement
    || event.target instanceof HTMLTextAreaElement;

  if (isTypingInField) {
    return;
  }

  if (event.key === '/') {
    event.preventDefault();
    document.getElementById('notes-search-input').focus();
  }
});
```

Click **▶ Preview**, open a note's editor, and type a sentence containing a
literal `/` character into it: the character types normally, and focus
stays exactly where it was.

**Walkthrough — `event.target`, and which element actually received the
keystroke.** `event.target` is the specific element the event originated
from — for a `keydown` event, whichever element currently has focus at the
moment the key is pressed. This is the same property `event.target.value`
has quietly relied on since lesson 11's search input and lesson 16's date
format `<select>` — here it is used directly, to identify *what kind* of
element it is, not to read a value out of it.

**Walkthrough — `instanceof`, and why every DOM element has a real,
checkable type.** Every element the browser creates is a genuine
JavaScript object built from a specific class matching its tag: an
`<input>` is an instance of `HTMLInputElement`; a `<textarea>` is an
instance of `HTMLTextAreaElement`; a plain `<div>` — like every note
item's outer container — is an instance of `HTMLDivElement`. This is the
same idea lesson 02's `document.createElement('div')` quietly relied on
without naming it: creating an element by tag name constructs a real
instance of that tag's own specific class. `event.target instanceof
HTMLInputElement` asks, directly, "is the element that received this
keystroke actually an `<input>`?" — `true` or `false`, with no guessing
based on class names or attributes.

`isTypingInField` is `true` whenever focus is inside any `<input>` or
`<textarea>` on the page — the note editor's raw-text box from lesson 14,
the video title and URL fields from lesson 03, the search box itself. `if
(isTypingInField) { return; }` stops the entire function immediately in
every one of those cases, before either shortcut gets a chance to check
`event.key` at all — the keystroke reaches its field completely normally,
exactly as if this listener did not exist.

**SE lens — a guard clause protecting every shortcut this project will
ever add, in one place.** `isTypingInField` is computed once, at the very
top of the listener, and the `return` beneath it applies to *everything*
below — both the `/` shortcut already written and Step 4's `n` shortcut,
still to come. Any future shortcut added to this same listener
automatically inherits the same protection, for free, simply by being
written below this one check, rather than needing its own repeated
"unless someone is typing" condition copied into every new `if` block.

---

## Step 4 — Start a New Note on `n`

**The problem:** Adding a note still requires reaching for the mouse to
click "+ Add Note at Current Time."

Update the listener in `script.js`:

```javascript
document.addEventListener('keydown', (event) => {
  const isTypingInField = event.target instanceof HTMLInputElement
    || event.target instanceof HTMLTextAreaElement;

  if (isTypingInField) {
    return;
  }

  if (event.key === '/') {
    event.preventDefault();
    document.getElementById('notes-search-input').focus();
    return;
  }

  if (event.key === 'n') {
    const video = videos.find((v) => v.id === selectedVideoId);
    if (video) {
      handleAddNote(video);
    }
  }
});
```

Add a small, visible hint so this is discoverable without reading the
source code. Update `.app-header` in the HTML tab:

```html
<div class="app-header">
  <h1>Video Notes</h1>
  <p class="shortcut-hint">Press <kbd>/</kbd> to search, <kbd>n</kbd> for a new note</p>
  <button id="settings-toggle-button" class="settings-toggle-button">⚙️ Settings</button>
</div>
```

Add to the CSS tab:

```css
.shortcut-hint {
  font-size: 0.75rem;
  color: var(--colour-muted);
}

.shortcut-hint kbd {
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid var(--colour-border);
  background-color: var(--colour-page-bg);
  font-family: monospace;
}
```

Click **▶ Preview**, select a video, click somewhere outside any text
field, and press `n`: the same prompt sequence `handleAddNote` has always
shown appears immediately.

**Walkthrough:** `videos.find((v) => v.id === selectedVideoId)` is the
exact same lookup `renderPlayer` has used since lesson 04, reused here for
a new reason — the keyboard shortcut needs the actual selected video
object, not just its id, since `handleAddNote` expects one. `if (video) {
handleAddNote(video); }` guards against pressing `n` with no video selected
at all, in which case `video` is `undefined` and nothing happens — silently
correct, since there is no video to add a note to.

`return;` added after the `/` branch stops the function there, so pressing
`/` never falls through to also check `event.key === 'n'` — harmless in
this specific case since `/` and `'n'` can never both be true for the same
keystroke, but a habit worth keeping as more shortcuts are added: each
branch handles its own key and gets out, rather than letting every
remaining check run for no reason.

**Concept — `<kbd>`, another semantic element.** Lesson 01 introduced
`<aside>` and `<main>` as elements describing *meaning*, not just
appearance. `<kbd>` continues that idea: it marks text that specifically
represents keyboard input, and browsers typically render it in a
monospace font by default — communicating "this names a key you press,"
correctly, even to a screen reader, not just to a sighted reader who
happens to recognise the visual convention.

---

## Connect the Pieces

```
index.html    .shortcut-hint — a small, visible reminder these shortcuts exist
script.js     One document-level keydown listener, guarding against
              isTypingInField first, then dispatching to the / and n
              shortcuts — reusing #notes-search-input (lesson 11),
              handleAddNote() (lesson 07), and the videos.find() lookup
              pattern (lesson 04), with no changes needed to any of them
```

---

## What Breaks Without This

**Without the `isTypingInField` guard:** Select a video, open its note
editor, and type any sentence containing the letter "n" — nearly any
sentence in English. Every single "n" you type triggers `handleAddNote`,
popping up a real `prompt()` dialog asking for a brand-new note's text,
interrupting your typing entirely, potentially dozens of times in one
sentence.

**Without `event.preventDefault()` in the `/` branch, specifically in
Firefox:** Press `/`. Firefox's own built-in "quick find" bar appears at
the bottom of the browser window *at the same time* this project's search
box gains focus — two different search interfaces responding to the same
keystroke, confusing regardless of which one a person actually meant to
use.

---

## Definition of Done

- [ ] Pressing `/` anywhere outside a text field focuses the search box
- [ ] Pressing `n` anywhere outside a text field starts a new note for the selected video
- [ ] Typing a literal `/` or `n` inside any note, title, or URL field types the character normally, with no shortcut firing
- [ ] A visible hint on the page shows both shortcuts exist
- [ ] You can explain what event bubbling is and why a single listener on `document` receives every keystroke on the page
- [ ] You can explain what `instanceof` checks, using `event.target instanceof HTMLInputElement` as the example
- [ ] You can explain, concretely, what would happen while typing a note if the `isTypingInField` guard were removed

---

*Next: Lesson 18 — From Functions to a Class. Every function in `script.js`
so far has operated on the same `videos` array through plain, independent
functions — this lesson gathers them into a real `NoteLibrary` class,
motivated by repetition that has become impossible to ignore, with the
application's behaviour completely unchanged.*
