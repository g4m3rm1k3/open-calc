# Video Notes — Lesson 09 — Tags

## What You Will Build

Notes can now carry tags — `javascript`, `arrays`, `review` — entered when
a note is created and shown as small pills underneath it. This is the
first step toward organizing a library that has grown past "a short list
you can just scan," and the foundation lesson 10's filtering is built on.

---

## What You Need to Know First

Lesson 08 left each note as `{ id, text, timestamp }`, rendered with a
clickable, formatted timestamp beside its text.

---

## Step 1 — Give Every Note a Place for Tags

**The problem:** A note has nowhere to record what it is about beyond its
own free-text content.

Update `handleAddNote` in `script.js` to also ask for tags:

```javascript
function handleAddNote(video) {
  if (!player || typeof player.getCurrentTime !== 'function') {
    alert('The video player is not ready yet.');
    return;
  }

  const text = prompt('Note text:');
  if (!text) {
    return;
  }

  const tagsInput = prompt('Tags (comma separated, optional):') || '';

  video.notes.push({
    id: Date.now(),
    text,
    timestamp: Math.floor(player.getCurrentTime()),
    tags: parseTagsInput(tagsInput),
  });

  saveVideos();
  renderNotesPanel();
}

function parseTagsInput(rawInput) {
  return rawInput
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}
```

Update `loadVideos` to give every existing note a real `tags` array too,
extending the same normalization lesson 07 introduced for `video.notes`
itself:

```javascript
function loadVideos() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return parsed.map((video) => ({
      ...video,
      notes: Array.isArray(video.notes)
        ? video.notes.map((note) => ({
            ...note,
            tags: Array.isArray(note.tags) ? note.tags : [],
          }))
        : [],
    }));
  } catch {
    return [];
  }
}
```

**Walkthrough:** `prompt('Tags (comma separated, optional):') || ''`
handles the case where a user clicks Cancel on the tags prompt — `prompt`
returns `null` in that case, and `null || ''` falls back to an empty
string, so `parseTagsInput` always receives a real string to work with,
never `null`.

`parseTagsInput` is the same three-step string-to-array pattern used
throughout real form-handling code: `.split(',')` breaks
`"javascript, arrays,  "` into `["javascript", " arrays", "  "]`;
`.map((tag) => tag.trim())` removes the stray leading and trailing spaces
from each piece; `.filter((tag) => tag.length > 0)` discards anything left
empty — the trailing comma's leftover blank entry, specifically. The result
is a clean array of real tags with nothing accidental in it.

**Note this is the same normalization idea from lesson 07, one level
deeper.** Lesson 07 handled videos saved before `notes` existed as an
array. This does the identical thing for notes saved before `tags` existed
at all — the outer `.map()` walks every video, and for each one whose
`notes` really is an array, an inner `.map()` walks every note inside it,
giving each one a real `tags` array if it does not already have one.

---

## Step 2 — Render Tags as Pills

**The problem:** Tags exist in the data now, but nothing displays them.

Add to `script.js`:

```javascript
function createTagPills(tags) {
  const container = document.createElement('div');
  container.className = 'tag-pills';

  for (const tag of tags) {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.textContent = tag;
    container.appendChild(pill);
  }

  return container;
}
```

Update the note-rendering loop inside `renderNotesPanel`:

```javascript
for (const note of video.notes) {
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
```

Add to the CSS tab:

```css
.note-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tag-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-pill {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: var(--colour-accent);
  color: white;
}
```

Click **▶ Preview** and add a note with a couple of tags, separated by
commas. The note now shows small, rounded pills beneath its text.

**Walkthrough:** `createTagPills` takes a plain `string[]` — nothing about
videos or notes specifically — because "render a list of tags as pills" has
no real connection to what the tags belong to; the same function would work
identically for tagging a video directly, if a later feature needed that.
`flex-wrap: wrap` on `.tag-pills` lets pills flow onto a second line rather
than being forced to fit on one, however many a note happens to have.

**SE lens — a function that only knows the smallest shape it needs.**
`createTagPills(tags)` cannot accidentally depend on anything about notes
or videos, because it was never given access to either — it only ever sees
an array of strings. This is the same discipline behind
`formatTimestamp(totalSeconds)` in lesson 08: a function's parameters
should be the narrowest thing that actually does the job, which is exactly
what makes a function reusable somewhere its author never anticipated.

---

## Connect the Pieces

```
script.js    parseTagsInput() — text to a clean array of tags
             createTagPills() — an array of tags to rendered pills
             loadVideos() — now normalizes both notes and each note's tags
```

---

## What Breaks Without This

**Without `.filter((tag) => tag.length > 0)` in `parseTagsInput`:** Type
`"javascript, arrays,"` (a trailing comma) into the tags prompt. Without
filtering, the resulting array includes one empty string as a "tag" — a
blank pill would render alongside the real ones, and lesson 10's filtering
would have a tag option that displays as nothing at all, confusing to click
and impossible to explain by looking at it.

**Without normalizing existing notes' `tags` field in `loadVideos`:** Load
data saved before this lesson. Every old note's `tags` is `undefined` —
`createTagPills(undefined)` fails immediately, since `for (const tag of
undefined)` cannot iterate over something that is not an array at all,
crashing the entire notes panel for any video with at least one
pre-existing note.

---

## Definition of Done

- [ ] Adding a note lets you optionally enter comma-separated tags
- [ ] Tags render as small, distinct pills beneath each note's text
- [ ] A trailing or doubled comma in the tags input never produces a blank pill
- [ ] Notes saved before this lesson load correctly, with an empty tag list
- [ ] You can explain why `createTagPills` accepts a plain array of strings instead of a whole note object
- [ ] You can explain why this lesson's data migration is the same pattern as lesson 07's, one level deeper

---

*Next: Lesson 10 — Filtering by Tag. Click a tag on any note, and only
notes sharing that tag remain visible — the first time this project derives
what is shown from more than just "the currently selected video."*
