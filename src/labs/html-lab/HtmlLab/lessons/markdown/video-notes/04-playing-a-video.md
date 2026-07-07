# Video Notes — Lesson 04 — Playing a Video

## What You Will Build

Click any video in the list, and it loads into a real, playing embed in the
centre panel — the actual video, not a placeholder. The clicked item
highlights to show which one is selected. This is the first time this
project shows content it did not build itself, borrowed from another
website entirely.

---

## What You Need to Know First

Lesson 03 left `script.js` able to add real videos — each with `{ id,
title, youtubeId }` — to the `videos` array via a real form, calling
`renderVideoList()` afterward.

---

## Step 0 — Retire the Placeholder Seed Data

**The problem:** The three videos this project started with in lesson 02
only ever had a `title` — no real `youtubeId` — because nothing needed one
yet. Now that clicking a video needs to actually play something real, those
three placeholders have nothing real to play.

Change the top of `script.js` to:

```javascript
const videos = [];
```

Preview: the sidebar is now empty. That is correct and honest — this is
what a real, brand-new video library actually looks like before anyone adds
anything to it. Use the "Add Video" form from lesson 03 to add one or two
real YouTube videos now, so the rest of this lesson has something real to
click.

**SE lens — placeholder data has a shelf life.** The three hardcoded videos
did exactly the job they were built for: proving `renderVideoList()` worked,
back in lesson 02, before any way to add a real video existed. Now that a
real "Add Video" feature exists, keeping fake data around any longer would
only be confusing — every video from here on is one a real user (you) added
through the real feature the app provides for exactly that purpose.

---

## Step 1 — Track Which Video Is Selected

**The problem:** Something needs to remember which one video, if any, is
currently supposed to be playing.

Add to `script.js`:

```javascript
let selectedVideoId = null;
```

**Walkthrough:** `null` is a real, deliberate value here — "no video is
selected" is a genuine, valid state this application can be in (its very
first moment, and any time after the selected video is removed), not an
oversight. `selectedVideoId` holds only an `id` — a number — rather than an
entire video object, so there is exactly one place that "the currently
selected video" actually lives; everywhere else that needs the full video
object looks it up from `videos` by this one id, which is Step 3's job.

---

## Step 2 — Make Video Items Clickable

**The problem:** Clicking a video in the sidebar currently does nothing.

Update `renderVideoList` in `script.js`:

```javascript
function renderVideoList() {
  const container = document.getElementById('video-list-items');
  container.textContent = '';

  for (const video of videos) {
    const item = document.createElement('div');
    item.className = video.id === selectedVideoId
      ? 'video-item video-item-active'
      : 'video-item';
    item.textContent = video.title;
    item.addEventListener('click', () => selectVideo(video.id));
    container.appendChild(item);
  }
}

function selectVideo(id) {
  selectedVideoId = id;
  renderVideoList();
  renderPlayer();
}
```

**Walkthrough:** `video.id === selectedVideoId ? 'video-item video-item-active'
: 'video-item'` recomputes, for every single video, on every single render,
whether it should show as active — the same "derive it from one source of
truth, every time" approach lesson 03's [React Studio](../react-studio/README.md)
sibling series uses for its own selection feature. There is only one
variable that can ever be wrong, `selectedVideoId`, rather than a separate
"is this one active" flag on every video object that would need to be kept
correctly in sync by hand.

`item.addEventListener('click', () => selectVideo(video.id))` attaches a
**click handler** — a function that runs when this specific element is
clicked — to each item, individually, as it is created inside the loop.

**CS lens — why `const video` in this loop is what makes this work
correctly.** The arrow function `() => selectVideo(video.id)` is a
**closure**: it "remembers" the `video` variable from the scope it was
created in, even after that one pass through the loop has finished.
Because this loop declares `video` with `for (const video of videos)`,
**every single pass through the loop creates its own separate `video`
binding** — the closure created for the first video keeps referring to the
first video specifically, forever, entirely unaffected by later passes of
the same loop creating their own, independent `video` bindings for the
second and third videos. This is a deliberate, well-known behaviour of
`const` and `let` in a loop, and it is exactly what makes it safe to create
a closure inside one.

`selectVideo(id)` updates the one variable that matters, then calls both
`renderVideoList()` (to move the highlight) and `renderPlayer()` (Step 3,
to actually load the video) — every change to what is selected always goes
through this one function, so both halves of the UI that depend on
selection can never drift out of sync with each other.

---

## Step 3 — Render the Player

**The problem:** Nothing yet reads `selectedVideoId` to decide what the
centre panel should show.

Add to `script.js`:

```javascript
function renderPlayer() {
  const container = document.querySelector('.player-area');
  container.textContent = '';

  const video = videos.find((v) => v.id === selectedVideoId);

  if (!video) {
    const placeholder = document.createElement('p');
    placeholder.className = 'player-placeholder';
    placeholder.textContent = 'Select a video to play it here.';
    container.appendChild(placeholder);
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.className = 'player-iframe';
  iframe.src = `https://www.youtube.com/embed/${video.youtubeId}`;
  iframe.allow = 'autoplay; encrypted-media';
  iframe.allowFullscreen = true;
  container.appendChild(iframe);
}

renderPlayer();
```

Add to the CSS tab:

```css
.player-iframe {
  width: 100%;
  height: 100%;
  max-width: 800px;
  aspect-ratio: 16 / 9;
  border: none;
  border-radius: var(--radius);
}
```

Click **▶ Preview**, then click a video in the list: it loads and plays in
the centre panel, and the sidebar entry highlights.

**Walkthrough:** `videos.find((v) => v.id === selectedVideoId)` searches the
array for the one object whose `id` matches, returning `undefined` if none
does (which happens whenever `selectedVideoId` is `null` — nothing in the
array has an `id` of `null`, so `.find` correctly finds nothing).
`if (!video) { ...; return; }` handles that case explicitly, showing the
same placeholder message the page started with in lesson 01, restored here
in code instead of hardcoded HTML.

`` `https://www.youtube.com/embed/${video.youtubeId}` `` — YouTube's
`/embed/VIDEO_ID` URL path is specifically designed to be placed inside an
`<iframe>` and shows YouTube's real player, with its own play button,
progress bar, and fullscreen control — none of which this project has to
build itself. `iframe.allow = 'autoplay; encrypted-media'` grants the
embedded page two specific browser permissions it needs to function
normally: autoplaying video (subject to the browser's own autoplay policies)
and playing DRM-protected content. `allowFullscreen = true` lets the
viewer's fullscreen button inside the embed actually work.

`aspect-ratio: 16 / 9` keeps the player's proportions correct — the
standard widescreen video ratio — regardless of how much space is actually
available, rather than letting it stretch into a distorted shape.

`renderPlayer();` at the bottom, called once when the page first loads,
shows the placeholder message immediately, before anything is ever clicked.

**Concept — why a plain embed like this is enough for now, and why it
will not be enough later.** This `<iframe>` gives you a fully working
player with no code of your own controlling playback — you cannot ask it
"what second are you currently on," or tell it "jump to 1:23," from your
own JavaScript. That is fine for this lesson, which only needs the video to
play. Lesson 07 needs exactly the capability this embed does not have —
capturing the real, current playback position — and that is precisely the
moment this project switches to YouTube's fuller **IFrame Player API**
instead. That switch is not a correction of a mistake made here; a plain
embed is the right, simplest tool for "just play the video," and the API is
the right tool for "control the video from your own code," needed only once
a feature genuinely requires it.

---

## Connect the Pieces

```
script.js    selectedVideoId — the one variable describing what is playing
             selectVideo() — the only place that variable ever changes
             renderPlayer() — turns selectedVideoId into either a real
             embed or the original placeholder message
```

`renderVideoList()`'s active-highlight logic and `renderPlayer()`'s content
both read the exact same `selectedVideoId` — neither could disagree with
the other about what is currently selected, because there is only the one
variable for either of them to read.

---

## What Breaks Without This

**Using `var` instead of `const` for the loop variable (temporarily change
it to confirm):** `var video` is **function-scoped**, not block-scoped —
every iteration of the loop shares the *same* `video` variable, which holds
whichever video was processed *last* by the time any click handler actually
runs. Every video in the sidebar becomes clickable, but clicking any of
them selects the *last* video in the list — a real, classic JavaScript bug,
now reproduced on purpose. Change it back to `const` afterward.

**Without the `if (!video)` check in `renderPlayer`:** Set `selectedVideoId`
back to `null` (for instance, by deleting the selected video in a future
lesson) without this guard. `video` would be `undefined`, and
`` `https://www.youtube.com/embed/${video.youtubeId}` `` would throw
`Cannot read properties of undefined (reading 'youtubeId')` — a real crash,
instead of the intended, harmless placeholder message.

---

## Definition of Done

- [ ] The sidebar starts empty; videos added via the lesson 03 form appear and are clickable
- [ ] Clicking a video plays it in a real embed in the centre panel
- [ ] The clicked video's sidebar entry highlights; clicking a different one moves the highlight
- [ ] With nothing selected, the original placeholder message shows instead of a broken player
- [ ] You can explain what a closure is, using the click handlers in `renderVideoList` as the example
- [ ] You can reproduce the `var`-in-a-loop bug on purpose and explain exactly why every video ends up selecting the last one
- [ ] You can explain why a plain `<iframe>` embed is sufficient now but will not be once lesson 07 needs the real playback position

---

*Next: Lesson 05 — The Notes Panel. A textarea beside the player holds notes
for whichever video is selected — the first time this project's data models
something bigger than "small pieces of text a person types once," and the
first hint of the felt need lesson 06 exists to solve: right now, switching
videos or reloading the page loses every note instantly.*
