# Video Notes — Lesson 06 — Saving with localStorage

## What You Will Build

Reload the page. Every video, every YouTube link, every note — all of it is
still there. This lesson fixes the loss lesson 05 deliberately left
unfixed, using `localStorage`: a real, permanent (until explicitly cleared)
storage area every browser gives every website, built for exactly this
problem.

---

## What You Need to Know First

Lesson 05 left every video as `{ id, title, youtubeId, notes }`, held only
in the `videos` array in memory — recreated empty every time the page
loads.

---

## Concept: What `localStorage` Actually Is

**`localStorage`** is a simple key-value store built into every browser,
available to any web page through the global `localStorage` object. Unlike
a plain JavaScript variable — which exists only in memory and disappears
the instant the page reloads or closes — anything written to `localStorage`
persists on the user's own device, survives a reload, a browser restart,
and even the computer being turned off, until something explicitly removes
it. It is scoped to the page's **origin** (protocol, domain, and port
together) — a page at one website cannot read another website's
`localStorage`, and neither can two different projects opened in HTML Lab
read each other's.

**The one real limitation that matters here:** `localStorage` can only
store strings. It cannot store a real JavaScript array of objects directly
— that has to be converted to a string first, and converted back when read.

---

## Step 1 — Serialize and Save

**The problem:** The `videos` array needs to become a string before
`localStorage` can hold it, and needs to become a real array again when
read back.

Add to the top of `script.js`:

```javascript
const STORAGE_KEY = 'video-notes-library';

function saveVideos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
}

function loadVideos() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}
```

**Walkthrough:** `localStorage.setItem(key, value)` writes a string `value`
under a string `key` — both arguments must be strings, which is exactly why
`JSON.stringify(videos)` runs first: it converts the real `videos` array
(and every object and string field inside it) into one long JSON-formatted
text string. `localStorage.getItem(key)` reads it back — returning `null`
if nothing has ever been saved under that key, which is exactly the case
the very first time this project ever runs on a given browser.

`JSON.parse(saved)` reverses `JSON.stringify` — text back into a real
array of real objects. The `try`/`catch` around it guards against a
genuinely possible failure: if `localStorage` somehow contains text that is
not valid JSON — corrupted by a browser extension, hand-edited in DevTools,
or left over from an earlier, incompatible version of this project — `JSON.
parse` throws, and without this guard, the entire application would fail to
start from that one bad string. Falling back to an empty array means a
corrupted save degrades to "start fresh," never a crash.

**`STORAGE_KEY` as its own named constant, rather than typing the string
`'video-notes-library'` in two places:** the same single-source-of-truth
reasoning lesson 01 applied to colours and lesson 03 applied to text values
— one place defines the exact key both functions agree on, so a typo in
one of two hand-typed copies can never make `saveVideos` and `loadVideos`
silently disagree about where the data lives.

---

## Step 2 — Load on Startup, Save on Every Change

**The problem:** `videos` currently always starts as `const videos = [];`
— it needs to start from whatever was saved instead, and everything that
changes it needs to save the result afterward.

Change the top of `script.js`:

```javascript
const videos = loadVideos();
```

Update `handleAddVideo` (from lesson 03) to save after adding:

```javascript
videos.push({
  id: nextVideoId(),
  title: titleInput.value.trim() || 'Untitled Video',
  youtubeId,
  notes: '',
});
saveVideos();
```

And update the notes textarea's listener (from lesson 05) to save after
every edit:

```javascript
textarea.addEventListener('input', () => {
  video.notes = textarea.value;
  saveVideos();
});
```

Click **▶ Preview**. Add a video, write some notes, then reload the page
entirely (not just click Preview again — actually reload the browser tab).
Everything is exactly as you left it.

**Walkthrough:** `const videos = loadVideos()` runs once, the moment
`script.js` first executes, replacing what used to be a hardcoded empty
array with whatever `loadVideos()` actually finds — an empty array on the
very first visit, or a real, previously-saved library on every visit after
that.

**SE lens — save on every change, not on a separate "Save" button.** Every
mutation to `videos` — adding one, editing its notes — is immediately
followed by `saveVideos()`. This is the same pattern real applications you
already use every day rely on: a document editor that saves as you type,
rather than making you remember to click Save and risking losing work the
one time you forget. The cost is one extra line at each mutation point; the
benefit is that "did I remember to save" is never a question this
application's users have to ask.

---

## Step 3 — Fix How New IDs Are Generated

**The problem:** Lesson 03's `nextVideoId` was a simple counter,
incremented once per session — `videos.length + 1`. Now that videos persist
*across* sessions, and a future version of this project might delete a
video, `.length` can no longer be trusted to reliably predict the next safe
id: if a video were ever removed, the array's length would no longer match
the highest id already used, and reusing an id that still belongs to
another video would silently corrupt the connection between a video and
its own notes.

Replace the `nextVideoId` counter with a function:

```javascript
function nextVideoId() {
  const maxId = videos.reduce((max, video) => Math.max(max, video.id), 0);
  return maxId + 1;
}
```

Remove the old `let nextVideoId = videos.length + 1;` line entirely — the
function above replaces it, and every call site (`id: nextVideoId++` in
`handleAddVideo`) becomes `id: nextVideoId()` — a function call, not a
property read followed by an increment.

**Walkthrough:** `Array.prototype.reduce` builds up a single value by
visiting every element of an array in turn. `videos.reduce((max, video) =>
Math.max(max, video.id), 0)` starts with `0` (the third argument — the
**initial value** — matters here specifically for an empty library: without
it, calling `.reduce` on an empty array with no initial value throws an
error, since there would be nothing to start from) and, for every video,
keeps whichever is larger: the running maximum so far, or this video's own
`id`. The final result is the highest `id` currently in use, anywhere in
the array — and adding `1` to it guarantees a new id that has never been
used, regardless of how many videos have ever been added or removed.

**CS lens — computing a value from data, instead of tracking it
separately.** The old counter *duplicated* information: `videos` already
implicitly contains the highest id ever used, and a separate `nextVideoId`
variable was a second, independent claim about the same fact — a claim that
could drift out of sync with reality the moment videos could be removed.
Deriving the next id fresh, every time, directly from the data that already
exists, removes the possibility of those two ever disagreeing, because
there is only one place the answer can come from now.

---

## Connect the Pieces

```
script.js    STORAGE_KEY, saveVideos(), loadVideos() — the whole
             persistence layer, in one small, focused place
             videos now starts from loadVideos(), not an empty array
             nextVideoId() computes a safe new id from real data, not a
             separately-tracked counter that could drift out of sync
```

Every render function — `renderVideoList`, `renderPlayer`,
`renderNotesPanel` — needed zero changes. They have always rendered
whatever `videos` currently contains; where that data originally came from
was never something they needed to know.

---

## What Breaks Without This

**Without the `try`/`catch` in `loadVideos`:** Open the browser's DevTools
console and run `localStorage.setItem('video-notes-library', 'not valid
json')`, then reload the page. Without the guard, `JSON.parse` throws,
uncaught, the instant `script.js` runs — the entire application fails to
even start, from one malformed string this project itself is responsible
for having written at some earlier point.

**Keeping the old `videos.length + 1` id generator:** Imagine a future
version of this project that lets you delete a video (a natural next
feature, not built in this series). Add three videos (ids `1`, `2`, `3`),
delete the second one (now `length` is `2`, but the highest id in use is
still `3`), then add a new video: `videos.length + 1` produces `3` — an id
that already belongs to the third video. The new video's notes and the
existing video's notes would now be impossible to tell apart by id alone.

---

## Definition of Done

- [ ] Reloading the browser tab preserves every video, its YouTube link, and its notes exactly
- [ ] Adding a video and editing notes each immediately update `localStorage`, with no separate save action
- [ ] Manually corrupting the saved value (via DevTools) results in a fresh, empty, working library on reload — not a crash
- [ ] New videos always receive an id that has never been used before, computed from the data itself
- [ ] You can explain why `localStorage` can only store strings, and what `JSON.stringify`/`JSON.parse` do about that
- [ ] You can explain what an origin is and why one website's `localStorage` is invisible to another
- [ ] You can explain why `nextVideoId` changed from a counter to a function that reads `videos` itself
- [ ] There is nothing to commit — reloading the page is now the actual test of whether your save logic works

---

*Next: Lesson 07 — Timestamped Notes. A single blob of text per video
becomes a real list of individual notes, each stamped with the exact moment
in the video it was written about — and the moment a plain `<iframe>` stops
being enough, because nothing about it can tell you what second the video
is currently on.*
