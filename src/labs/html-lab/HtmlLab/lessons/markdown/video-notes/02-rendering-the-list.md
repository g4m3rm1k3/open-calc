# Video Notes — Lesson 02 — Rendering the List

## What You Will Build

Three real videos appear in the sidebar, generated from a list of data
instead of typed into the HTML by hand. This is the first JavaScript this
project writes, and the first time this project's *data* (what videos
exist) and its *appearance* (what the sidebar shows) become two separate
things, kept in sync by code rather than by you manually editing HTML every
time a video is added.

---

## What You Need to Know First

Lesson 01 left `index.html`'s `.video-list` containing one hardcoded
`<div class="video-item video-item-active">JavaScript Basics</div>`, and a
CSS file with `.video-item` and `.video-item-active` already styled.

---

## Concept: Why Not Just Type Three `<div>`s?

You could add two more hardcoded `<div class="video-item">` elements right
now and have three videos in about ten seconds. That approach stops working
the moment videos can be *added* while the page is running (lesson 03) —
HTML written once, when the page loads, cannot add a fourth item to itself
later. Every feature this entire project builds — adding, removing,
reordering, filtering — needs the list to exist as **data** JavaScript can
change, with the HTML generated *from* that data, not typed once and
forgotten.

---

## Step 1 — Give the List a Real Container

**The problem:** The hardcoded video `<div>` needs to be replaced with an
empty container that JavaScript will fill.

Update `.video-list` in the HTML tab:

```html
<aside class="video-list">
  <h2>My Videos</h2>
  <div id="video-list-items"></div>
</aside>
```

**Walkthrough:** `id="video-list-items"` gives this specific element a
unique identifier — unlike `class`, which can label many elements the same
way, an `id` must be unique across the whole page, which is exactly what
lets JavaScript reliably find *this one element* in Step 2. The empty
`<div>` currently renders as nothing visible at all — expected, since
nothing has filled it yet.

---

## Step 2 — Model the Videos as Data

**The problem:** Before anything can be rendered, the videos need to exist
as real data somewhere.

Click the **JavaScript** tab. A file named `script.js` already exists — this
is where this project's behaviour will live from now on. Type:

```javascript
const videos = [
  { id: 1, title: 'JavaScript Basics' },
  { id: 2, title: 'CSS Flexbox Crash Course' },
  { id: 3, title: 'Arrays Explained' },
];
```

**Walkthrough:** `[...]` is an **array literal** — an ordered list of
values. `{ id: 1, title: 'JavaScript Basics' }` is an **object literal** —
a value made of named fields (called **properties**), here `id` (a number
that will uniquely identify this video, used from lesson 04 onward to find
which one was clicked) and `title` (the text shown in the sidebar).
`videos` is therefore an **array of objects** — the standard shape for "a
list of things, each with more than one piece of information about it,"
which is exactly what a video library is.

**CS lens — designing a data shape before writing the code that uses it.**
Deciding what fields an object needs, before writing a single line that
reads them, is a real design decision, not a formality. `id` and `title`
are the only two fields a video needs *right now* — no more, because
nothing yet needs anything else. Lesson 04 adds `youtubeId` (the real
video's identifier, needed to embed it) and lesson 05 adds `notes`, each
exactly when a feature is built that genuinely needs that field — not
before.

---

## Step 3 — Render the List

**The problem:** `videos` exists in memory, but nothing has put its content
on the actual page yet.

Add to `script.js`:

```javascript
function renderVideoList() {
  const container = document.getElementById('video-list-items');
  container.textContent = '';

  for (const video of videos) {
    const item = document.createElement('div');
    item.className = 'video-item';
    item.textContent = video.title;
    container.appendChild(item);
  }
}

renderVideoList();
```

Click **▶ Preview**. Three video titles now appear in the sidebar, none of
them highlighted — expected, since nothing marks any of them "active" yet.

**Walkthrough:** `document.getElementById('video-list-items')` searches the
**DOM** (Document Object Model — the browser's live, in-memory tree
representation of the page; every tag in your HTML becomes one node in this
tree) for the one element whose `id` matches, and returns it. `container.
textContent = ''` clears out anything already inside it — necessary because
`renderVideoList` will be called again in later lessons every time the data
changes, and without clearing first, old content would remain alongside new
content instead of being replaced by it.

`for (const video of videos)` is a **`for...of` loop** — it visits each
element of the array in order, binding it to `video` for the duration of
one pass through the loop body. Inside the loop, `document.createElement
('div')` creates a brand-new `<div>` element, entirely in memory — it does
not appear on the page until something attaches it to an element that is
already part of the page. `item.className = 'video-item'` sets its CSS
class — matching the class Lesson 01's stylesheet already styles, so this
new element picks up the same look with no new CSS needed. `item.
textContent = video.title` sets its visible text directly from the data.

`container.appendChild(item)` inserts `item` as the last child of
`container` — this is the moment the new element actually becomes part of
the visible page, once per pass through the loop, once per video.

**Security note, planted early on purpose.** `item.textContent = video.
title` sets the element's contents as plain text, no matter what characters
`video.title` contains — even if it contained something that looked like an
HTML tag, it would appear on the page exactly as typed, not interpreted as
markup. The alternative, `item.innerHTML = video.title`, would parse and
run any HTML the string contained. Right now, `title` is data you typed
yourself, so this makes no visible difference. It matters starting in the
very next lesson, the moment a video's title can be typed in by *whoever is
using the page* — using the safe pattern from the first line that ever
touches this data means nothing has to change later, once the data is no
longer fully trusted.

`renderVideoList();` — calling the function is what actually makes anything
happen; defining a function only describes what it *would* do when called.

**SE lens — one function, one job.** `renderVideoList` does exactly one
thing: given the current `videos` array, make the sidebar match it. It does
not decide when to run, what the data should be, or what happens when a
video is clicked — those are separate concerns, arriving in later lessons,
that this function will not need to change to accommodate.

---

## Connect the Pieces

```
index.html    #video-list-items — an empty container, filled by script.js
script.js     videos (data) and renderVideoList() (the function that keeps
              the sidebar in sync with it)
```

`.video-item`'s CSS, written in lesson 01 against one hardcoded element,
needed no changes at all — it styles any element with that class, however
many now exist and however they got there.

---

## What Breaks Without This

**Without clearing the container first (`container.textContent = ''`):**
Call `renderVideoList()` a second time, later, without that line (this
happens for real starting in lesson 03, the moment adding a video calls
this function again). Three more video items appear, duplicating the first
three, because the old ones were never removed before the new ones were
added.

**Without a `for...of` loop (writing three separate, copy-pasted blocks of
`createElement`/`appendChild` code instead):** Adding a fourth video to the
`videos` array does nothing — the sidebar still only ever shows exactly
three items, because nothing in the code actually depends on how many
videos exist; the number three was written by hand, not derived from the
data.

---

## Definition of Done

- [ ] The sidebar shows three video titles, none hardcoded directly into the HTML
- [ ] The titles come from an array of objects, each with an `id` and a `title`
- [ ] Adding a fourth object to the `videos` array (temporarily, to test) makes a fourth item appear with no other code changes
- [ ] You can explain the difference between an array and an object, and why a video needs to be modelled as the latter
- [ ] You can explain what `document.createElement` does differently from `document.getElementById`
- [ ] You can explain why `container.textContent = ''` runs before the loop, not after
- [ ] You can explain why `textContent`, not `innerHTML`, was used here even though the data is not yet user-typed

---

*Next: Lesson 03 — Adding a Video. A real form lets you paste a YouTube URL
and add it to the list while the page is running — the first time this
project's data changes because of something a user did, not because you
edited the code.*
