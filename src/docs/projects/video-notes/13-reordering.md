# Video Notes — Lesson 13 — Reordering

## What You Will Build

A fourth option, "My Order," joins the sort dropdown from lesson 12. Select
it, and every video becomes draggable — pick one up by its sidebar entry
and drop it anywhere else in the list, and it stays there, permanently,
across reloads. This is a genuinely different kind of ordering than lesson
12 built: not a rule a comparator applies automatically, but an order a
person chooses by hand, one drag at a time.

---

## What You Need to Know First

Lesson 12 left `videos` sorted for *display* by `getSortedVideos()`,
controlled by a `videoSortOrder` variable, without ever changing the real
order videos are stored in — that real, stored order was left alone
specifically so a temporary display choice could never overwrite it.

---

## Step 1 — Add a Fourth Sort Option

**The problem:** There is currently no way to view videos in an order a
person actually chose themselves, rather than one lesson 12's comparators
compute automatically.

Update the `#video-sort-select` dropdown in the HTML tab:

```html
<select id="video-sort-select" class="video-sort-select">
  <option value="recent">Recently Added</option>
  <option value="oldest">Oldest First</option>
  <option value="title">Title (A–Z)</option>
  <option value="custom">My Order</option>
</select>
```

Update `getSortedVideos` in `script.js` to leave `custom` order alone:

```javascript
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
```

**Walkthrough:** No new branch is needed for `'custom'` — the function
already starts with `const sortedVideos = [...videos]`, a plain copy of
`videos` in its current, real, stored order. When `videoSortOrder` matches
none of the three `if`/`else if` conditions, no `.sort()` call ever runs,
and the copy is returned exactly as it started: in whatever order `videos`
itself is actually stored in. This means "My Order" is not really a fourth
*sorting rule* at all — it is what you see when you deliberately apply *no*
rule, and simply trust the array's own real, stored order instead. Step 2
is what makes that real order something a person can actually control.

---

## Step 2 — Make Video Items Draggable

**The problem:** Nothing about a `.video-item` currently responds to being
picked up and dropped somewhere else.

Update `renderVideoList` in `script.js`:

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

    if (videoSortOrder === 'custom') {
      item.draggable = true;

      item.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', String(video.id));
      });

      item.addEventListener('dragover', (event) => {
        event.preventDefault();
      });

      item.addEventListener('drop', (event) => {
        event.preventDefault();
        const draggedId = Number(event.dataTransfer.getData('text/plain'));
        reorderVideos(draggedId, video.id);
      });
    }

    container.appendChild(item);
  }
}
```

Add to the CSS tab:

```css
.video-item[draggable="true"] {
  cursor: grab;
}
```

**Concept — the HTML5 Drag and Drop API.** Dragging an element and dropping
it somewhere else is a sequence of real, named browser events, not a single
action: `dragstart` fires once, on the element being picked up, the instant
the drag begins. `dragover` fires *repeatedly*, on whatever element the
dragged item is currently hovering above, for as long as the drag
continues. `drop` fires once, on whatever element the dragged item is
released over. All three must be handled together for dragging to do
anything meaningful — this lesson uses all three.

`item.draggable = true` is what makes an element participate in this system
at all. Most HTML elements are not draggable by default — text can be
selected, but a `<div>` cannot normally be picked up and moved. Setting
`draggable` to `true` opts this specific element into the browser's native
drag-and-drop behaviour. It is set only `if (videoSortOrder === 'custom')`
— dragging an item while "Recently Added" or "Title (A–Z)" is active would
have nowhere meaningful to put it, since Step 1 established those views
have no real, storable order of their own to change.

**Walkthrough — `event.dataTransfer`.** Every drag-and-drop event carries a
`dataTransfer` object — the mechanism the API provides for passing
information from the element where a drag *starts* to the element where it
*ends*, which are two different elements with two different event
listeners that otherwise have no way to talk to each other directly.
`event.dataTransfer.setData('text/plain', String(video.id))`, in the
`dragstart` handler, stores the dragged video's `id` as a string (the
`String(...)` call converts the number to text, because `setData` only
accepts strings) under the label `'text/plain'` — a **MIME type**, a
standard label describing what *kind* of data is being stored, here just
plain text. `event.dataTransfer.getData('text/plain')`, in the `drop`
handler, reads that same string back out, by asking for the same label it
was stored under. `Number(...)` converts it back to a real number, since
everything that travels through `dataTransfer` is text, regardless of what
it originally was.

**Walkthrough — `event.preventDefault()` in `dragover`, a new reason for a
method you have already used.** Lesson 03 used `event.preventDefault()` to
stop a form from reloading the page. Here, it means something entirely
different: a plain HTML element's *default* behaviour when something is
dragged over it is to **refuse** the drop entirely — the browser shows a
"not allowed" cursor, and no `drop` event fires at all. Calling
`event.preventDefault()` inside the `dragover` handler is specifically what
tells the browser "this element is a valid place to drop something,"
turning on the `drop` event that would otherwise never fire. The same
method, `preventDefault()`, always means "cancel this event's default
behaviour" — but what that default behaviour actually *is* depends
entirely on which event it is called on.

---

## Step 3 — Handle the Drop

**The problem:** `reorderVideos`, called from Step 2's `drop` handler,
does not exist yet — nothing currently changes `videos`' actual order.

Add to `script.js`:

```javascript
function reorderVideos(draggedId, targetId) {
  if (draggedId === targetId) {
    return;
  }

  const draggedIndex = videos.findIndex((video) => video.id === draggedId);
  const targetIndex = videos.findIndex((video) => video.id === targetId);

  const [draggedVideo] = videos.splice(draggedIndex, 1);
  videos.splice(targetIndex, 0, draggedVideo);

  saveVideos();
  renderVideoList();
}
```

Click **▶ Preview**, select "My Order" from the dropdown, then drag any
video onto another one: it moves to that position immediately. Reload the
page: the order you chose is still there.

**Walkthrough — `Array.prototype.findIndex`, a close relative of `.find()`
from lesson 04.** `videos.find((v) => v.id === selectedVideoId)` (lesson
04) searches an array and returns the *matching element itself*.
`videos.findIndex((video) => video.id === draggedId)` searches the same
way, with the same kind of matching function, but returns the matching
element's **position** in the array — a number — instead of the element.
`reorderVideos` needs the position, not the video object, because Step 2's
handlers already have direct access to `video`; what they are missing is
*where* it currently sits in the real array, which is exactly what
`.splice()` needs next.

**Walkthrough — `Array.prototype.splice`, a new method that both removes
and inserts.** `.splice(startIndex, deleteCount)` removes `deleteCount`
elements starting at `startIndex`, mutating the array in place, and
**returns a new array containing exactly the elements that were removed**.
`videos.splice(draggedIndex, 1)` removes exactly one element — the dragged
video — from wherever it currently sits, and returns a one-element array
containing just that video.

`const [draggedVideo] = videos.splice(draggedIndex, 1)` is **array
destructuring**: instead of writing `const removed = videos.splice(...)`
and then using `removed[0]` everywhere afterward, destructuring pulls the
first element of the returned array directly into its own named variable,
`draggedVideo`, in one step. The square brackets on the left mirror the
shape of the array on the right — position for position.

`.splice()` has a second job, used differently in the very next line:
`videos.splice(targetIndex, 0, draggedVideo)` passes `0` as the delete
count — remove nothing — and a third argument, `draggedVideo` — the item to
**insert** at `targetIndex`, without removing anything first. Together, the
two `.splice()` calls perform a real move: take the dragged video out of
wherever it was, then put that exact same object back in at the new
position — never creating a second copy, never losing track of which video
object it is.

`if (draggedId === targetId) { return; }` guards against the case where a
video is picked up and dropped back onto itself — without this check, the
two `.splice()` calls below would still run, removing and immediately
re-inserting the same video at the same position, which is harmless here
but wasteful, and calls `saveVideos()` and `renderVideoList()` for
genuinely nothing.

**CS lens — mutating in place, on purpose, for the first time by
choice.** Lesson 03 mutated `videos` with `.push()` because there was no
other reasonable way to add an item. Lesson 12 went out of its way to *copy*
`videos` before sorting, specifically to avoid mutating it. `reorderVideos`
mutates `videos` directly, deliberately, for a third reason: here, the
mutation *is* the actual, intended, permanent change — a person dragged a
video to a new position because they want that to be its new real position,
saved and kept, not a temporary view. Recognising which of these three
situations applies — "no other way," "must not mutate," "mutation is the
whole point" — is a real, ongoing judgment call in software, not a rule
that always points the same direction.

**SE lens — why this is the same `saveVideos()` from lesson 06.**
`reorderVideos` calls the exact same persistence function every other
mutation in this project already calls after changing `videos` — adding a
video, adding a note, editing tags. There is still only one function
responsible for writing `videos` to `localStorage`, and every new feature
that changes `videos` reuses it rather than inventing its own saving logic.
This is the same principle lesson 06 established: one place owns
persistence, and every mutation point calls it.

---

## Connect the Pieces

```
index.html    #video-sort-select — a fourth option, "My Order"
script.js     getSortedVideos() — the 'custom' case is really "apply no
              sort, trust the real array order"
              renderVideoList() — attaches drag-and-drop listeners only
              when videoSortOrder is 'custom'
              reorderVideos() — the only place videos' real, stored order
              is ever changed directly by a person's action
```

---

## What Breaks Without This

**Without `event.preventDefault()` in the `dragover` handler:** Try to drag
a video onto another one. The browser shows a "no drop allowed" cursor the
entire time, and releasing the mouse never fires a `drop` event at all —
`reorderVideos` is never called, and nothing moves, with no error anywhere
to explain why.

**Without the `if (draggedId === targetId) return;` guard:** This
particular case is harmless to skip, but calling `saveVideos()` on every
single drop — even a no-op drop onto the same item — means writing to
`localStorage` more often than anything actually changed, a small,
avoidable bit of needless work that the guard removes for free.

**Making items draggable regardless of `videoSortOrder`:** Drag a video
while "Recently Added" is selected. The drop handler would still call
`reorderVideos`, permanently changing `videos`' real stored order — but the
dropdown would still say "Recently Added," now silently lying about what
order is actually being shown, since `getSortedVideos()` would immediately
re-sort by creation time on the very next render anyway, making the drag
appear to do nothing at all.

---

## Definition of Done

- [ ] Selecting "My Order" makes every video in the sidebar draggable
- [ ] Dragging a video onto another position moves it there immediately
- [ ] The chosen order survives a full page reload
- [ ] Dragging is not available while "Recently Added," "Oldest First," or "Title (A–Z)" is selected
- [ ] You can explain what `dragstart`, `dragover`, and `drop` each fire on, and when
- [ ] You can explain what `dataTransfer` is for and why `dragstart` and `drop` need it
- [ ] You can explain why `event.preventDefault()` means something different in a `dragover` handler than it did in lesson 03's form handler
- [ ] You can explain the difference between `.find()` and `.findIndex()`
- [ ] You can explain what `.splice()` does in each of its two calls inside `reorderVideos`, and why the second call passes `0` as its second argument

---

*Next: Lesson 14 — Editor / Preview. A note gets a second, rendered view
alongside its raw text — the first time this project transforms what a
person typed into something visually different, rather than just storing
and displaying it as-is.*
