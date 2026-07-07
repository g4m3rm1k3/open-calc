# Video Notes — Lesson 11 — Search

## What You Will Build

A search box above the notes list narrows what is visible as you type,
combined with any active tag filter from lesson 10. Along the way, this
lesson deliberately avoids a real, easy-to-make mistake — rebuilding the
search box itself on every keystroke — and introduces debouncing as the
standard fix for "this event fires far more often than the work behind it
should actually run."

---

## What You Need to Know First

Lesson 10 left `activeTagFilter` narrowing `video.notes` inside
`renderNotesPanel`, recomputed fresh on every render.

---

## Step 1 — Give the Search Box a Permanent Home

**The problem:** Every panel this project renders so far gets completely
cleared and rebuilt from scratch whenever anything changes. A search input
*cannot* live inside that rebuilt content — if it did, every single
keystroke would destroy the input element you are actively typing into and
create a brand-new one in its place, losing focus and cursor position
mid-word, making it unusable.

Update `.notes-panel` in the HTML tab:

```html
<aside class="notes-panel">
  <h2>Notes</h2>
  <input type="search" id="notes-search-input" class="notes-search-input" placeholder="Search notes…" />
  <div id="notes-container">
    <p class="notes-placeholder">Notes for the selected video will appear here.</p>
  </div>
</aside>
```

Add to the CSS tab:

```css
.notes-search-input {
  width: 100%;
  padding: var(--space-sm);
  margin-bottom: var(--space-md);
  border-radius: var(--radius);
  border: 1px solid var(--colour-border);
  background-color: var(--colour-page-bg);
  color: var(--colour-text);
}
```

**Walkthrough:** `type="search"` is a specialised text input — most
browsers give it a small built-in "clear" icon once it has content, at no
extra cost. Placing it *outside* `#notes-container` — as its own permanent
element, a direct sibling of the container `renderNotesPanel` clears and
rebuilds — is the entire fix for the problem above: `renderNotesPanel` will
only ever touch what is inside `#notes-container`, never this input, no
matter how many times it re-runs.

---

## Step 2 — Filter Live, With a Debounce

**The problem:** Typing needs to filter the visible notes, but firing a
full re-render on every single keystroke does more work than is actually
useful the moment typing is still in progress.

Add to `script.js`:

```javascript
let searchQuery = '';
let searchDebounceTimer = null;

document.getElementById('notes-search-input').addEventListener('input', (event) => {
  clearTimeout(searchDebounceTimer);
  const value = event.target.value;

  searchDebounceTimer = setTimeout(() => {
    searchQuery = value.trim().toLowerCase();
    renderNotesPanel();
  }, 200);
});
```

Update the note-filtering logic inside `renderNotesPanel` to check both the
tag filter and the search query together:

```javascript
const visibleNotes = video.notes.filter((note) => {
  const matchesTag = !activeTagFilter || note.tags.includes(activeTagFilter);
  const matchesSearch = !searchQuery || note.text.toLowerCase().includes(searchQuery);
  return matchesTag && matchesSearch;
});
```

Click **▶ Preview** and type into the search box: after a brief pause, the
notes list narrows to only notes whose text contains what you typed,
combined correctly with any active tag filter.

**Walkthrough — debouncing.** `clearTimeout(searchDebounceTimer)` cancels
whatever timer the *previous* keystroke scheduled, if it has not fired
yet; `setTimeout(..., 200)` then schedules a *new* one, 200 milliseconds in
the future. As long as keystrokes keep arriving faster than 200
milliseconds apart, every scheduled timer gets cancelled by the next one
before it ever runs — `searchQuery` only actually updates, and
`renderNotesPanel()` only actually runs, once 200 milliseconds pass with no
further typing. This pattern is called **debouncing**: delaying a reaction
until an event stops firing for a moment, rather than reacting to every
single occurrence.

**Honest performance note.** A single video's note list is short enough
that re-rendering it on every keystroke, undebounced, would not actually
be slow — this project is small enough that debouncing here does not fix a
real, measured problem. It is included anyway because it is the correct,
standard shape for *any* live-filtering feature, and the moment this
project (or a future one) filters something more expensive — a search that
hits a real server, or a list of thousands of items instead of a handful —
this exact same fix is what you would reach for. Learning the shape now,
while the stakes are low, means recognising instantly when it actually
matters later.

`value.trim().toLowerCase()` normalizes the query once, when it is stored,
rather than every time it is compared against a note — `.toLowerCase()`
makes the search case-insensitive (`"Array"` and `"array"` should match the
same notes), and storing the *already-lowercased* query means
`note.text.toLowerCase().includes(searchQuery)` only has to lowercase one
side fresh each time, not both.

**CS lens — combining two independent conditions.** `matchesTag &&
matchesSearch` is `true` only if *both* are `true` — a note passes the
filter only when it satisfies the active tag (or there is none) **and** the
search query (or there is none). This is exactly how a real search
interface with multiple simultaneous filters works: each filter is checked
independently, and a result must pass all of them together, not any one
alone.

---

## Connect the Pieces

```
index.html    #notes-search-input — a permanent element, never rebuilt
script.js     searchQuery, searchDebounceTimer — new state, changed only
              after a real pause in typing
              visibleNotes now combines the tag filter and the search
              query with a single `&&`
```

---

## What Breaks Without This

**Putting the search input inside `#notes-container`, rebuilt by
`renderNotesPanel` like everything else:** Try to type more than one
character quickly. Each keystroke's `input` event handler runs
`renderNotesPanel()`, which clears `#notes-container` and rebuilds a
*brand-new* `<input>` element — the old one, the one that had focus and
your cursor position, is gone. The browser moves focus to nothing, and the
next character you type goes nowhere.

**Without `clearTimeout(searchDebounceTimer)` before scheduling a new
timer:** Every keystroke schedules its own independent 200-millisecond
timer, and none of them are ever cancelled — typing five characters
quickly would eventually fire `renderNotesPanel()` five separate times in
a burst, once per keystroke's own timer, completely defeating the purpose
of waiting for typing to pause.

---

## Definition of Done

- [ ] Typing in the search box narrows the notes list after a brief pause, not on every keystroke
- [ ] The search box never loses focus while typing
- [ ] An active tag filter and a search query both apply together correctly
- [ ] Clearing the search box restores every note matching the current tag filter (or all notes, if none is active)
- [ ] You can explain why the search input had to live outside `#notes-container`
- [ ] You can explain what debouncing is and why `clearTimeout` runs on every keystroke, not just the last one
- [ ] You can explain, honestly, why this specific feature did not need debouncing to stay fast, and why the technique is still worth using

---

*Next: Lesson 12 — Sorting. Notes can be ordered by timestamp, and videos by
when they were added — the same `Array.prototype.sort` technique applied
to two different pieces of this project's data.*
