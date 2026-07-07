# Video Notes — Lesson 12 — Sorting

## What You Will Build

A dropdown above the video list reorders it — newest first, oldest first,
or alphabetically by title — without ever changing which video is actually
selected or touching the underlying data. Separately, notes inside a video
are now always shown in chronological order by their timestamp, regardless
of the order they happened to be typed in. Both features are the same
underlying tool, `Array.prototype.sort`, applied to two different lists for
two different reasons.

---

## What You Need to Know First

Lesson 11 left `video.notes` filtered by `activeTagFilter` and `searchQuery`
together inside `renderNotesPanel`, and `videos` as a plain array grown by
`handleAddVideo`, rendered by `renderVideoList`.

---

## Step 1 — Record When Each Video Was Added

**The problem:** Sorting videos by "when they were added" needs something
to actually sort *by* — right now, a video object has no field that records
when it was created at all.

Update `handleAddVideo` in `script.js`:

```javascript
videos.push({
  id: nextVideoId(),
  title: titleInput.value.trim() || 'Untitled Video',
  youtubeId,
  notes: [],
  created: Date.now(),
});
```

Update `loadVideos` to give every video saved before this lesson a real
`created` value too, extending the same normalization pattern lesson 07
introduced for `notes` and lesson 09 extended for each note's `tags`:

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
      created: typeof video.created === 'number' ? video.created : video.id,
    }));
  } catch {
    return [];
  }
}
```

**Walkthrough:** `Date.now()` is a built-in JavaScript function that returns
the current moment as a number — specifically, the count of milliseconds
since January 1, 1970 (a fixed reference point every computer agrees on,
called the **Unix epoch**). It takes no arguments and never fails. Two
calls to `Date.now()` a moment apart return two different, always-increasing
numbers — exactly the property sorting "by when it was created" depends on.

`typeof video.created === 'number' ? video.created : video.id` is the
migration: a video saved *before* this lesson existed has no `created`
field at all, so `video.created` is `undefined`, and `typeof undefined` is
the string `'undefined'`, not `'number'` — the condition is `false`, and the
fallback runs. The fallback used here is `video.id`, not `0` or
`Date.now()` — and this choice is deliberate, explained below.

**SE lens — an honest migration, not a fabricated one.** There is no way to
know the *real* moment a video saved before this lesson was actually added
— that information was simply never recorded, and no code can recover data
that was never captured. Two dishonest options exist: invent a fake
timestamp (implying a precision the data does not have), or crash. Both are
worse than the choice made here. `video.id` is not a real timestamp, but it
has the one property that actually matters for sorting: because lesson 06's
`nextVideoId()` always returns a number higher than every `id` already in
use, ids were assigned in the exact order videos were created — a video
with `id: 2` was added before a video with `id: 5`, guaranteed. Using `id`
as a stand-in preserves the *relative order* of old videos correctly, even
though it is not a real millisecond timestamp. And because `Date.now()`
returns numbers in the billions while old ids are small numbers like `1`,
`2`, `3`, every old video's `created` value is still guaranteed to sort
before every newly-added video's real timestamp — which is also the
truthful order: the old ones really were created first.

---

## Step 2 — Sort the Video List

**The problem:** `videos` is currently always shown in the order it happens
to be stored in — the order videos were added, with no way to view it any
other way.

Update `.video-list` in the HTML tab, adding a dropdown above the list:

```html
<aside class="video-list">
  <h2>My Videos</h2>
  <select id="video-sort-select" class="video-sort-select">
    <option value="recent">Recently Added</option>
    <option value="oldest">Oldest First</option>
    <option value="title">Title (A–Z)</option>
  </select>
  <form id="add-video-form" class="add-video-form">
    <input type="text" id="video-title-input" placeholder="Video title" required />
    <input type="text" id="video-url-input" placeholder="Paste a YouTube URL" required />
    <button type="submit">Add</button>
  </form>
  <div id="video-list-items"></div>
</aside>
```

Add to the CSS tab:

```css
.video-sort-select {
  width: 100%;
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
  border-radius: var(--radius);
  border: 1px solid var(--colour-border);
  background-color: var(--colour-page-bg);
  color: var(--colour-text);
}
```

**Walkthrough:** `<select>` is an HTML element that shows a small,
built-in dropdown menu — clicking it reveals every `<option>` inside it,
and picking one closes the menu and shows that option's text in its place.
Each `<option>` has a `value` attribute — the string the page's JavaScript
actually receives when that option is selected — which does not have to
match its visible text; here they are kept similar on purpose, so the HTML
itself documents what each choice means. A `<select>` is the right choice
specifically when there are several options but only one can be active at
once and screen space is limited — the same job a group of radio buttons
does, in less space, at the cost of the options not all being visible
simultaneously.

Add to `script.js`:

```javascript
let videoSortOrder = 'recent';

function getSortedVideos() {
  const sortedVideos = [...videos];

  if (videoSortOrder === 'recent') {
    sortedVideos.sort((a, b) => b.created - a.created);
  } else if (videoSortOrder === 'oldest') {
    sortedVideos.sort((a, b) => a.created - b.created);
  } else if (videoSortOrder === 'title') {
    sortedVideos.sort((a, b) => a.title.localeCompare(b.title));
  }

  return sortedVideos;
}

document.getElementById('video-sort-select').addEventListener('change', (event) => {
  videoSortOrder = event.target.value;
  renderVideoList();
});
```

Update `renderVideoList` in `script.js` to render the sorted list instead of
`videos` directly:

```javascript
function renderVideoList() {
  const container = document.getElementById('video-list-items');
  container.textContent = '';

  for (const video of getSortedVideos()) {
    const item = document.createElement('div');
    item.className = video.id === selectedVideoId
      ? 'video-item video-item-active'
      : 'video-item';
    item.textContent = video.title;
    item.addEventListener('click', () => selectVideo(video.id));
    container.appendChild(item);
  }
}
```

Click **▶ Preview**, add a few videos with different titles, then change the
dropdown: the list reorders instantly, and clicking a video still selects
and plays the correct one no matter where it now sits in the list.

**Walkthrough — `[...videos]`, the spread operator, copying an array.**
`Array.prototype.sort` does not return a new, separately-sorted array — it
**mutates the array it is called on**, rearranging its elements in place,
and also returns that same array as a convenience. Calling `videos.sort(...)`
directly would permanently reorder the real, stored `videos` array itself,
just because of a temporary display preference — the next time a video is
added, or the page reloads, the *actual* creation order recorded in
`localStorage` would already be lost. `[...videos]` — the **spread
operator** inside an array literal — copies every element of `videos` into
a brand-new array, in the same order. `sortedVideos.sort(...)` then mutates
*that copy*, leaving the original `videos` array, and the true order videos
were actually added in, completely untouched.

`(a, b) => b.created - a.created` is a **comparator function** — the
argument `.sort()` uses to decide the order of any two elements, `a` and
`b`. A comparator's return value has three meaningful cases: a negative
number means "`a` comes first," a positive number means "`b` comes first,"
and `0` means "their order relative to each other does not matter."
`b.created - a.created` is negative exactly when `b.created` is larger than
`a.created` — meaning `b` (the more recently created video) should come
first. This produces **descending** order — newest first. Flipping the
subtraction, `a.created - b.created`, produces **ascending** order instead
— oldest first — which is exactly the difference between the "Recently
Added" and "Oldest First" branches above.

`a.title.localeCompare(b.title)` is a built-in string method that compares
two strings the way a human alphabetically would, returning a negative
number, positive number, or `0` in exactly the same three-way shape a
comparator needs — which is precisely why it can be dropped directly into
`.sort()`'s comparator position with no extra work. It exists as a
dedicated method (rather than just using `<` and `>` on strings) because it
correctly handles things simple character comparison gets wrong across
languages and accents — for plain English titles the difference is rarely
visible, but reaching for `.localeCompare()` by habit means the code
already works correctly the day a title contains an accented character.

**CS lens — sorting by a derived comparator, not a fixed rule.** All three
sort options run through the exact same `.sort()` method — only the
comparator function passed to it changes. This is a small, concrete example
of **passing behaviour as data**: `.sort()` does not know or care what
"newest first" means: it only knows how to call whatever comparator
function it is given, for any two elements, and trust the number that comes
back. The actual meaning of "newest first" lives entirely in the comparator
lesson 12 chose to write, not in `.sort()` itself, which is why the same one
method serves three completely different orderings here just by swapping
which comparator gets passed to it.

**SE lens — a derived view of the video list, the same idea as filtering.**
`getSortedVideos()` never stores its result anywhere — like `visibleNotes`
in lesson 10, it is recomputed, from `videos` and `videoSortOrder` together,
every time `renderVideoList()` runs. There is exactly one real list of
videos, `videos`, and exactly one variable describing how it should
currently be displayed, `videoSortOrder` — `getSortedVideos()` is the one
place those two combine into what actually appears on screen, and nothing
else needs to know how that combination works.

---

## Step 3 — Always Show Notes in Chronological Order

**The problem:** A note's position in `video.notes` is currently just the
order it happened to be added in — but a person can pause a video, scrub
backward to an earlier point to add a note about something they missed,
then continue watching. That note's timestamp would be *earlier* than notes
already in the list, but it would still display *after* them, out of order.

Update the `visibleNotes` calculation inside `renderNotesPanel` in
`script.js`:

```javascript
const visibleNotes = video.notes
  .filter((note) => {
    const matchesTag = !activeTagFilter || note.tags.includes(activeTagFilter);
    const matchesSearch = !searchQuery || note.text.toLowerCase().includes(searchQuery);
    return matchesTag && matchesSearch;
  })
  .sort((a, b) => a.timestamp - b.timestamp);
```

Click **▶ Preview**, select a video, add a note, then use the player's own
scrubber to jump backward and add a second note at an earlier point in the
video: the notes list shows the earlier timestamp first, regardless of
which note was actually typed first.

**Walkthrough — chaining `.filter()` directly into `.sort()`, with no
spread operator this time.** `video.notes.filter(...)` already returns a
**brand-new array** — filtering never mutates the array it is called on; it
builds a fresh one containing only the elements that passed. Calling
`.sort()` directly on that result is safe, with no `[...copy]` step needed
first, because there was never a shared original array for `.sort()`'s
in-place mutation to damage — the array being sorted here only exists
because `.filter()` just created it. This is different from Step 2's
`getSortedVideos()`, which had to copy first specifically because `videos`
itself, the real stored array, would otherwise be the thing `.sort()`
mutated directly.

`a.timestamp - b.timestamp` is the same ascending-order comparator shape as
"Oldest First" in Step 2, applied here to a different field entirely —
`timestamp`, the second a note was captured within the video, rather than
`created`, the moment a whole video was added to the library.

**CS lens — the same tool, recognised in a second context.** This is the
core reason `.sort()` takes a comparator function instead of a fixed rule
like "always ascending" or "always by this one field": the exact same
method, `Array.prototype.sort`, correctly orders videos by creation time,
videos by title, and notes by timestamp — three unrelated fields on two
unrelated kinds of object — because the comparator, not `.sort()` itself,
is where the actual meaning of "in order" lives.

---

## Connect the Pieces

```
index.html    #video-sort-select — a new dropdown, above the video list
script.js     created — a new field on every video, real going forward,
              honestly reconstructed for videos saved before this lesson
              videoSortOrder, getSortedVideos() — the video list's display
              order, derived fresh from `videos` on every render
              renderNotesPanel()'s visibleNotes now always sorts by
              timestamp, after filtering, before rendering
```

---

## What Breaks Without This

**Sorting `videos` directly instead of a copy (`videos.sort(...)` instead of
`[...videos].sort(...)`):** Select "Title (A–Z)" from the dropdown, then
reload the page. The videos are now permanently stored in alphabetical
order in `localStorage` — the real history of which video was actually
added first has been silently and irreversibly overwritten, just because of
a temporary display choice that should never have touched the underlying
data at all.

**Using `0` as the fallback for old videos' `created` field instead of
`video.id`:** Every video saved before this lesson would share the exact
same `created` value, `0`. "Recently Added" and "Oldest First" would then
show every pre-existing video in whatever order `.sort()` happens to leave
equal elements in — not necessarily the order they were really added —
while only correctly ordering videos added after this lesson shipped.

---

## Definition of Done

- [ ] A dropdown above the video list offers Recently Added, Oldest First, and Title (A–Z)
- [ ] Changing the dropdown reorders the visible list without changing which video is selected or playing
- [ ] Reloading the page never changes the real, underlying order videos were actually added in
- [ ] Notes always display in chronological order by timestamp, even if a note with an earlier timestamp was typed after a later one
- [ ] Videos saved before this lesson load with a `created` value that preserves their real relative order
- [ ] You can explain what a comparator function is and what its three possible return-value cases mean
- [ ] You can explain why `getSortedVideos()` copies `videos` with `[...videos]` before sorting, but `visibleNotes` does not need to copy before sorting
- [ ] You can explain why `video.id` was chosen as the fallback for missing `created` values instead of `0` or a fabricated timestamp

---

*Next: Lesson 13 — Reordering. Dragging a note by hand to a new position
introduces the HTML5 Drag and Drop API — a different way of changing order
than sorting: one a person controls directly, rather than one a comparator
function decides automatically.*
