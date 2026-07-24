# Lesson 24: Two Different Ways to Stop an Event

## What you will build

`Ctrl+S` (`Cmd+S` on macOS) now saves the currently open file, the same
shortcut every real text editor supports — without also triggering the
browser's own "Save Page" dialog underneath it. The actual subject is a
real distinction between two methods that both sound like "stop this
event" but stop two completely different things: `stopPropagation()`,
already used since Lesson 4, and `preventDefault()`, this lesson's own.

## What you need to know first

`Lesson 4 - Multiple Tabs.md` — `event.stopPropagation()`, and the
bubbling behavior it stops. `Lesson 3`'s `saveFile`, called here from a
second, new trigger. `Lesson 9`'s guard-clause pattern, reused inside
the new handler.

---

## Concept Unit: a shortcut everyone expects

### The Problem

Saving currently requires clicking the Save button — a real, small
friction every actual text editor removes with a keyboard shortcut.
Nothing in this project listens for a keypress at all yet; every event
handler built so far has responded to a click or typed input inside one
specific element.

### What This Proves

Nothing to prove yet — this unit exists to state the gap plainly before
building the fix.

---

## Concept Unit: listening for a key combination

### The Problem

Something needs to notice when `Ctrl` and `S` are held down together,
anywhere on the page — not inside one specific input, since a person
saving a file could have their cursor in the editor, the sidebar, or
nowhere in particular.

### Concept Lab

```javascript
document.addEventListener("keydown", (event) => {
    console.log("key:", event.key, "ctrlKey:", event.ctrlKey);
});
```

Typing `a` prints `key: a ctrlKey: false`. Holding `Ctrl` and pressing
`s` prints `key: s ctrlKey: true`. Holding `Ctrl` and pressing `Shift`
prints `key: Shift ctrlKey: true` — `ctrlKey` reports whether `Ctrl` is
*currently held*, entirely independent of which other key was actually
pressed.

### What This Proves

`document.addEventListener("keydown", ...)` reuses `addEventListener`
from Lesson 2, attached to `document` itself rather than one specific
element — `"keydown"` is a new **event type**, alongside `"click"`
(Lesson 2) and `"input"` (Lesson 4), fired once every time any key is
pressed down, anywhere on the page, regardless of what currently has
focus. `event.key` is a string naming exactly which key was pressed —
`"a"`, `"s"`, `"Shift"`, `"Enter"`, whatever the actual key is.
`event.ctrlKey` is a boolean, `true` for as long as `Ctrl` is physically
held down, checked independently of `event.key` — a key combination is
detected by reading *both* properties on the same event, not by
listening for some special "combo" event that doesn't exist.

### Discard

This lab's `console.log` listener is deleted now — it never appears in
the project. The real listener checks the same two properties and calls
`saveFile()` instead of printing them.

---

## Concept Unit: stopping the browser's own behavior

### The Problem

`Ctrl+S`, in every browser, already means something *before* this
project ever sees the keypress: "open the Save Page dialog," the
browser's own built-in way of saving the current page's HTML to disk.
Calling `saveFile()` without addressing this leaves both things
happening — this project's real save, and the browser's own dialog,
popping up on top of it.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `keydown` listener, placed at the very
  end of the `<script>` block, after the existing `"input"` listener.
- **Dependencies** — `saveFile` (Lesson 3).

### The New Code — type this

```javascript
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        saveFile();
    }
});
```

### The Updated Project — where this lives

This is a complete, freestanding new listener, added at the very bottom
of the script, directly after the existing `"input"` listener on
`#file-content` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see.

### Mechanical Walkthrough
`event.ctrlKey && event.key === "s"` reuses `&&` from Lesson 1's
- `require_auth` — both conditions must hold: `Ctrl` currently held down,
*and* the key that triggered this exact event is `"s"`. Checking `event.key
- === "s"` specifically, rather than just `event.ctrlKey` alone, matters —
without it, this handler would fire on *every* `Ctrl`-anything
combination, including `Ctrl+C`, `Ctrl+V`, and every other browser
shortcut a person still needs to work. `event.preventDefault()` is new:
it tells the browser "do not perform whatever this event would normally
trigger" — here, specifically, the browser's own Save Page dialog, which
would otherwise still open even after this code runs.

### CS Lens — two methods on the same object, two different jobs

`event.stopPropagation()`, used since Lesson 4, stops an event from
*bubbling* — an ancestor element's own listener never finding out a
click happened, the exact mechanism Lesson 4's close button needed.
`event.preventDefault()` does something unrelated: it stops the
*browser's own built-in behavior* for that event — the Save Page dialog
here, a link's own navigation on a click elsewhere, a form's own
submission elsewhere still. Both live on every event object; both are
easy to reach for interchangeably by name alone. They solve two
genuinely different problems, and calling one when the other is needed
silently fails to fix anything — `stopPropagation()` here would do
nothing at all to stop the Save Page dialog, since no bubbling is
involved in a browser's own default keyboard shortcut.

### SE Lens — a global listener, used narrowly

Attaching this listener to `document` — not to `#file-content`, not to
any specific button — means it fires no matter what currently has
focus, which is exactly the point: a real save shortcut needs to work
everywhere, not just while the cursor happens to be inside the textarea.
The real cost of that breadth: this handler now runs on *every*
keystroke typed anywhere on the page, checking two cheap property
comparisons each time — a negligible, real cost, worth naming rather
than assuming a global listener is free just because it's convenient to
write.

### Run It

Standard, specified browser behavior, not something a terminal request
can exercise: pressing `Ctrl+S` while `#file-content` has real unsaved
text calls `saveFile()` exactly as clicking the Save button already
does, and the browser's own Save Page dialog never appears. Confirmed by
tracing `event.preventDefault()`'s well-defined, standard effect against
this exact key combination — actually pressing it in a real browser and
watching neither dialog appear is this lesson's first exercise, not
claimed here as already witnessed.

---

## Connect the pieces

Pressing `Ctrl+S` with a file open: the browser fires a `"keydown"`
event on whatever currently has focus, which bubbles up to `document`,
where this lesson's listener is attached. `event.ctrlKey` is `true`,
`event.key` is `"s"` — both conditions hold, so `event.preventDefault()`
runs first, telling the browser to skip its own Save Page dialog
entirely, and `saveFile()` runs immediately after — the exact same
function the Save button has always called, sending the exact same `PUT
/file` request, triggering the exact same `diagnoseFile()`/`analyzeFile()`
dispatch from Lesson 14. Nothing about *how* a file gets saved changed
at all; only how many ways there are to trigger it.

## What breaks without this

Already demonstrated through the browser's own well-known, standard
behavior, not this project's own code: without `event.preventDefault()`,
`Ctrl+S` still calls `saveFile()` — that part works — but the browser's
own Save Page dialog also opens on top of it, since nothing told the
browser to skip its own default handling for that exact key combination.

## Exercises

1. Open a file through the running app, make a real edit, and press
   `Ctrl+S` (or `Cmd+S` on macOS) — confirm it saves and no browser
   dialog appears.
2. Temporarily remove `event.preventDefault()`, repeat the same test,
   and confirm the browser's own Save dialog now appears alongside the
   real save — then restore it.
3. In the concept lab, add a check for `event.key === "Escape"` printing
   a different message, and confirm both key combinations can be
   distinguished correctly by the same listener.
4. Explain, without looking back at this lesson, why `stopPropagation()`
   would not have fixed the Save Page dialog problem.

## Definition of done

- [ ] You've saved a file with `Ctrl+S` through the real running app and
      confirmed no browser dialog appeared
- [ ] You've caused the browser's Save dialog to reappear by temporarily
      removing `preventDefault()`, then restored the fix
- [ ] You can explain the difference between `stopPropagation()` and
      `preventDefault()` — what each one actually stops
- [ ] You can explain why this listener checks `event.key === "s"` in
      addition to `event.ctrlKey`, not `event.ctrlKey` alone
- [ ] `git commit` this lesson's code with a message explaining why
