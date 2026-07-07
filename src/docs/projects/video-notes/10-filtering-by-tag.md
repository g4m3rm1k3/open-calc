# Video Notes — Lesson 10 — Filtering by Tag

## What You Will Build

Click any tag pill, and the notes panel narrows to show only notes carrying
that tag, with a banner confirming the filter and a way to clear it. This
is the first time what this project displays is derived from more than
just "which video is selected" — it now depends on selection *and* an
active filter together.

---

## What You Need to Know First

Lesson 09 left every note with a real `tags: string[]`, rendered as pills
via `createTagPills(tags)`.

---

## Step 1 — Track the Active Filter

**The problem:** Nothing currently remembers that a tag has been clicked,
or reacts to it.

Add near the top of `script.js`:

```javascript
let activeTagFilter = null;
```

**Walkthrough:** `null` means "no filter — show everything," the same
meaningful-`null` pattern `selectedVideoId` has used since lesson 04. When
it holds a real string instead, that string is the one tag currently
narrowing what is visible.

---

## Step 2 — Make Tags Clickable

**The problem:** Tag pills are currently inert text.

Update `createTagPills` in `script.js`:

```javascript
function createTagPills(tags) {
  const container = document.createElement('div');
  container.className = 'tag-pills';

  for (const tag of tags) {
    const pill = document.createElement('span');
    pill.className = tag === activeTagFilter ? 'tag-pill tag-pill-active' : 'tag-pill';
    pill.textContent = tag;
    pill.addEventListener('click', () => handleTagClick(tag));
    container.appendChild(pill);
  }

  return container;
}

function handleTagClick(tag) {
  activeTagFilter = activeTagFilter === tag ? null : tag;
  renderNotesPanel();
}
```

**Walkthrough:** `activeTagFilter === tag ? null : tag` makes clicking an
*already-active* tag turn the filter back off, rather than requiring a
separate "clear" action for the single most common case — clicking the
exact tag you just filtered by, because you are done looking at it.
Clicking a *different* tag simply replaces the filter with the new one.

`tag === activeTagFilter ? 'tag-pill tag-pill-active' : 'tag-pill'`
recomputes, for every pill, on every render, whether it should show as the
active one — the identical "derive it fresh from one source of truth every
time" approach `renderVideoList`'s active-video highlight has used since
lesson 04.

---

## Step 3 — Filter the Notes List

**The problem:** Clicking a tag currently changes nothing about which
notes are actually shown.

Update `renderNotesPanel` in `script.js`:

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

  const addButton = document.createElement('button');
  addButton.className = 'add-note-button';
  addButton.textContent = '+ Add Note at Current Time';
  addButton.addEventListener('click', () => handleAddNote(video));
  container.appendChild(addButton);

  if (activeTagFilter) {
    const filterBanner = document.createElement('div');
    filterBanner.className = 'filter-banner';
    filterBanner.textContent = `Showing notes tagged "${activeTagFilter}" `;

    const clearButton = document.createElement('button');
    clearButton.className = 'clear-filter-button';
    clearButton.textContent = '× Clear';
    clearButton.addEventListener('click', () => {
      activeTagFilter = null;
      renderNotesPanel();
    });

    filterBanner.appendChild(clearButton);
    container.appendChild(filterBanner);
  }

  const visibleNotes = activeTagFilter
    ? video.notes.filter((note) => note.tags.includes(activeTagFilter))
    : video.notes;

  const list = document.createElement('div');
  list.className = 'notes-list';

  for (const note of visibleNotes) {
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';

    const header = document.createElement('div');
    header.className = 'note-header';

    const timeLabel = document.createElement('span');
    timeLabel.className = 'note-timestamp';
    timeLabel.textContent = formatTimestamp(note.timestamp);
    timeLabel.addEventListener('click', () => handleSeek(note.timestamp));

    const textLabel = document.createElement('span');
    textLabel.className = 'note-text';
    textLabel.textContent = note.text;

    header.appendChild(timeLabel);
    header.appendChild(textLabel);
    noteItem.appendChild(header);
    noteItem.appendChild(createTagPills(note.tags));

    list.appendChild(noteItem);
  }

  container.appendChild(list);
}
```

Add to the CSS tab:

```css
.tag-pill-active {
  background-color: white;
  color: var(--colour-accent);
  border: 1px solid var(--colour-accent);
}

.filter-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
  border-radius: var(--radius);
  background-color: var(--colour-page-bg);
  font-size: 0.8rem;
  color: var(--colour-muted);
}

.clear-filter-button {
  background: none;
  border: none;
  color: var(--colour-accent);
  cursor: pointer;
  font-size: 0.8rem;
}
```

Click **▶ Preview**, add a few notes with overlapping and distinct tags,
then click one tag: only notes carrying it remain, a banner confirms the
active filter, and clicking the same tag again (or "× Clear") restores the
full list.

**Walkthrough:** `video.notes.filter((note) => note.tags.includes
(activeTagFilter))` builds a *new* array containing only the notes whose
own `tags` array includes the active filter string — `Array.prototype.
includes` checks whether a value exists anywhere in an array, returning
`true` or `false`. `visibleNotes` is never stored anywhere — it is
recomputed, from `video.notes` and `activeTagFilter` together, every single
time `renderNotesPanel` runs.

**CS lens — a derived view, not a second copy of the data.** There is
exactly one real list of notes: `video.notes`. `visibleNotes` is not a
second, separately-maintained list that could ever drift out of sync with
it — it is *computed fresh* from the real data and the current filter,
every time anything changes. This is the same principle behind every
"active" flag in this project so far, applied to an entire list instead of
a single boolean: rather than maintaining "the filtered list" as its own
piece of state that has to be kept correct by hand, it is derived, on
demand, from the two pieces of state that actually matter —
`video.notes` and `activeTagFilter`.

---

## Connect the Pieces

```
script.js    activeTagFilter — the one new piece of state this lesson adds
             handleTagClick() — the only place it ever changes
             renderNotesPanel() — now derives which notes to show, instead
             of always showing all of them
```

---

## What Breaks Without This

**Storing a separate `filteredNotes` array instead of deriving it fresh
each render:** Add a new note while a filter is active. If `filteredNotes`
were its own array, updated only when the filter itself changes, the newly
added note — which may or may not match the current filter — would not
appear or disappear correctly until the filter happened to be toggled
again, because nothing would have told that separate array to recompute
itself.

**Without `activeTagFilter === tag ? null : tag` (always setting the
filter to the clicked tag, never toggling it off):** Clicking an
already-active tag pill would do nothing visible at all — no way exists to
return to the full list except via the separate "Clear" button, a real,
avoidable extra step for what should be the single most common action:
"I am done looking at this filter."

---

## Definition of Done

- [ ] Clicking a tag filters the notes panel to only notes carrying that tag
- [ ] The active tag pill visually differs from inactive ones
- [ ] Clicking the active tag again, or the Clear button, restores the full list
- [ ] Adding a new note while filtered correctly shows or hides it based on its own tags
- [ ] You can explain why `visibleNotes` is recomputed every render instead of stored as its own persistent array
- [ ] You can explain what `.includes()` checks and how it is used here

---

*Next: Lesson 11 — Search. A live text search box narrows the notes panel
further still, filtering by content instead of an exact tag match — and
introduces the one real performance safeguard a live-as-you-type feature
needs: debouncing.*
