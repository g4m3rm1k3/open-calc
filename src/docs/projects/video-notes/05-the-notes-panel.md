# Video Notes — Lesson 05 — The Notes Panel

## What You Will Build

A real textarea in the right-hand panel, holding notes for whichever video
is currently selected. Switch videos, and the notes switch with it — each
video remembers its own. This is the first time this project's data models
something more than a title: a video's notes are part of *what a video is*,
not a separate thing bolted on beside it.

---

## What You Need to Know First

Lesson 04 left `selectVideo(id)` as the one function that updates
`selectedVideoId` and re-renders both the list and the player.

---

## Step 1 — Add a Home for Notes on Every Video

**The problem:** A video object currently has nowhere to hold its notes.

Update `videos` at the top of `script.js` (it should currently be an empty
array — add `notes: ''` wherever a video object is created from here on):

```javascript
const videos = [];
```

Update `handleAddVideo` from lesson 03 so every new video starts with an
empty notes field:

```javascript
videos.push({
  id: nextVideoId++,
  title: titleInput.value.trim() || 'Untitled Video',
  youtubeId,
  notes: '',
});
```

**Walkthrough:** `notes: ''` — an empty string, not `null` or leaving the
field out entirely — means "this video has notes; they happen to be empty
right now," which is a meaningfully different, more useful claim than "this
video might or might not have a notes field at all." Every video object
from this point on has exactly the same shape — `id`, `title`, `youtubeId`,
`notes` — which is what lets every function that reads a video's notes
assume the field is always there, with no separate check for whether it
exists first.

---

## Step 2 — Give the Notes Panel a Real Container

**The problem:** The notes panel currently shows a single hardcoded
placeholder paragraph, with nowhere for a real textarea to go.

Update `.notes-panel` in the HTML tab:

```html
<aside class="notes-panel">
  <h2>Notes</h2>
  <div id="notes-container">
    <p class="notes-placeholder">Notes for the selected video will appear here.</p>
  </div>
</aside>
```

---

## Step 3 — Render the Right Notes for the Selected Video

**The problem:** Nothing yet shows a real textarea, or knows whose notes it
should contain.

Add to `script.js`:

```javascript
function renderNotesPanel() {
  const container = document.getElementById('notes-container');
  container.textContent = '';

  const video = videos.find((v) => v.id === selectedVideoId);

  if (!video) {
    const placeholder = document.createElement('p');
    placeholder.className = 'notes-placeholder';
    placeholder.textContent = 'Notes for the selected video will appear here.';
    container.appendChild(placeholder);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.className = 'notes-textarea';
  textarea.value = video.notes;
  textarea.placeholder = 'Write notes about this video…';
  textarea.addEventListener('input', () => {
    video.notes = textarea.value;
  });
  container.appendChild(textarea);
}
```

Call it wherever selection changes — update `selectVideo` in `script.js`:

```javascript
function selectVideo(id) {
  selectedVideoId = id;
  renderVideoList();
  renderPlayer();
  renderNotesPanel();
}
```

And call it once at the bottom, alongside the other initial render calls:

```javascript
renderNotesPanel();
```

Add to the CSS tab:

```css
.notes-textarea {
  width: 100%;
  height: calc(100% - 3rem);
  resize: none;
  padding: var(--space-sm);
  border-radius: var(--radius);
  border: 1px solid var(--colour-border);
  background-color: var(--colour-page-bg);
  color: var(--colour-text);
  font-family: inherit;
  font-size: 0.9rem;
}
```

Click **▶ Preview**. Select a video, type some notes, then click a
different video: the second video shows its own, empty notes field. Click
back to the first: your typed notes are still exactly there.

**Walkthrough:** `textarea.value = video.notes` sets the textarea's initial
content directly from the selected video's own data — a fresh textarea is
created every time `renderNotesPanel` runs (matching the same
clear-and-rebuild pattern the video list and player already use), so each
one starts out correctly showing whichever video is currently selected.

`textarea.addEventListener('input', () => { video.notes = textarea.value;
})` is the entire mechanism that makes notes "stick" per video: the
**`input` event** fires on every single keystroke inside the field — not
just when it loses focus (that is the separate `change` event) — and the
handler immediately writes whatever was just typed back onto the `video`
object it belongs to. Because `video` here is the exact same object stored
inside the `videos` array (not a copy of it), updating `video.notes`
*is* updating the real, shared data — no separate "save" step exists yet,
because none is needed yet: the notes already live correctly in memory the
whole time you are on this page.

**CS lens — `<textarea>` vs `<input type="text">`.** A `<textarea>` is the
correct element specifically because notes are expected to span multiple
lines — `<input>` is a single-line field by definition, and forcing
multi-line content into one would mean either losing line breaks entirely
or fighting the element's basic design. `resize: none` in the CSS disables
the browser's own default drag-to-resize handle on textareas, since this
one should simply fill its container instead.

**SE lens — a genuine, felt gap, on purpose.** Reload the page right now.
Every note you wrote is gone — `videos` is rebuilt from scratch, empty,
every time the page loads, because nothing persists it anywhere yet. This
is not an oversight left for you to notice and complain about; it is lesson
06's entire reason for existing, and it will be far more obvious *why*
`localStorage` matters, and *what* it actually needs to save, having felt
this loss firsthand first.

---

## Connect the Pieces

```
script.js    Every video object now includes notes: ''
             renderNotesPanel() shows the selected video's own notes,
             and writes typed changes straight back onto that video object
```

`selectVideo()` now calls three render functions instead of two — list,
player, and notes — all three kept correct by the same one variable,
`selectedVideoId`, changing.

---

## What Breaks Without This

**Without giving every new video a `notes: ''` field:** Add a video via the
lesson 03 form, then select it. `video.notes` is `undefined`, and
`textarea.value = undefined` displays the literal text `"undefined"` inside
the textarea — a small, confusing bug with a very specific, traceable
cause: a field that was assumed to always exist, but was not actually set
for videos created through this one particular path.

**Without the `input` event listener:** Typing into the textarea changes
what is visibly displayed (the browser handles that on its own, for free)
but never touches `video.notes` at all. Switch away and back: the notes are
gone, not because they were never saved to disk (that is a separate,
later problem) but because they were never even written back to the one
in-memory object responsible for remembering them in the first place.

---

## Definition of Done

- [ ] Each video has its own independent notes, editable in a textarea
- [ ] Switching between videos shows each one's own notes, never mixed up with another's
- [ ] Reloading the page loses all notes — confirmed, understood, and expected for now
- [ ] Every new video added via the form starts with a real (empty) `notes` field
- [ ] You can explain the difference between the `input` and `change` events, and why this feature needs the former
- [ ] You can explain why `video.notes = textarea.value` updates the real data and not a copy of it
- [ ] You can explain, precisely, why reloading the page currently loses everything

---

*Next: Lesson 06 — Saving with localStorage. The entire video library —
titles, YouTube IDs, and every note — survives a real page reload for the
first time, using the one browser feature built specifically for exactly
this problem.*
