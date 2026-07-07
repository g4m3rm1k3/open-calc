# Video Notes — Lesson 07 — Timestamped Notes

## What You Will Build

Notes stop being one big blob of text per video and become a real list:
click "+ Add Note at Current Time" while a video is playing, and a new note
is created, stamped with the exact second the video was on when you clicked.
This is the moment this project needs something a plain `<iframe>` embed
cannot provide — the video's real, current playback position — and switches
to YouTube's own **IFrame Player API** to get it.

---

## What You Need to Know First

Lesson 06 left every video as `{ id, title, youtubeId, notes }`, with
`notes` a single string, persisted to `localStorage` and rendered as one
big textarea.

---

## Concept: Why a Plain `<iframe>` Cannot Do This

The `<iframe src="youtube.com/embed/...">` from lesson 04 is, from this
page's JavaScript point of view, a sealed box: it shows a real, working
player, but nothing on this page can ask it "what second are you on right
now." That information exists entirely inside a different page — the one
YouTube's own servers sent into that iframe — and browsers do not allow one
page's JavaScript to freely inspect another's for a very good reason:
without that restriction, any website embedding any other page could read
its content, cookies, or user activity. This is the same **same-origin
policy** that governs `fetch` requests in every web project.

YouTube's own **IFrame Player API** is the sanctioned way around this: a
script YouTube provides that manages the iframe *for you*, and exposes a
real JavaScript object with methods like `.getCurrentTime()` — because the
request for "what second is this video on" is coming through YouTube's own,
deliberately-provided channel, not by reaching into the embedded page
directly.

---

## Step 1 — Change What a Note Is

**The problem:** A single string cannot represent "several separate notes,
each written at a different moment in the video."

Update `handleAddVideo` (from lesson 03) so new videos start with an empty
**list** of notes instead of an empty string:

```javascript
videos.push({
  id: nextVideoId(),
  title: titleInput.value.trim() || 'Untitled Video',
  youtubeId,
  notes: [],
});
```

Update `loadVideos` (from lesson 06) to handle videos saved under the old,
single-string format:

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
      notes: Array.isArray(video.notes) ? video.notes : [],
    }));
  } catch {
    return [];
  }
}
```

**Walkthrough:** `notes: []` — an empty array, not an empty string — is now
what a brand-new video starts with; each individual note, once added, will
be its own object with its own `text` and `timestamp`.

`Array.isArray(video.notes) ? video.notes : []` handles data saved by an
*earlier version* of this project honestly: if `video.notes` is already an
array (saved by this lesson's code, or any later one), keep it as-is; if it
is still the old single string (or anything else unexpected), replace it
with a fresh empty array rather than trying to guess how to convert old
free-text notes into timestamped ones. **This does lose old notes** — a
real, honest cost of changing a data format after real data already exists
in it. A production application facing this exact situation would need a
deliberate migration decision (what timestamp would an old, un-timestamped
note even get?), and there is no honest automatic answer to invent here,
so this project does not pretend to have one.

`{ ...video, notes: [...] }` uses the spread operator to copy every other
field of the video unchanged, replacing only `notes` — `title`,
`youtubeId`, and `id` are untouched by this normalization.

---

## Step 2 — Load the YouTube IFrame API

**The problem:** Nothing on this page has access to YouTube's real player
control API yet.

Add near the top of `script.js`:

```javascript
let player = null;
let youtubeApiReady = false;
let pendingVideoToLoad = null;

const youtubeApiScript = document.createElement('script');
youtubeApiScript.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(youtubeApiScript);

function onYouTubeIframeAPIReady() {
  youtubeApiReady = true;
  if (pendingVideoToLoad) {
    loadPlayer(pendingVideoToLoad);
    pendingVideoToLoad = null;
  }
}
```

**Walkthrough:** `document.createElement('script')` followed by setting its
`src` and appending it to `<head>` is how a page loads an external script
*from JavaScript itself*, rather than a hardcoded `<script>` tag in the
HTML — necessary here only because this is the first script this project
has needed to load this way; either approach loads the same file.

**Downloading a script and being able to use it immediately are two
different moments.** `youtubeApiScript.src = '...'` starts the download,
but the browser continues running the rest of this file immediately,
without waiting — the same non-blocking behaviour every network request in
JavaScript has. YouTube's API script is specifically designed to call a
**global function named exactly `onYouTubeIframeAPIReady`** — not a
callback you pass in, but a function it looks for by that literal name on
the global `window` object — the moment it has finished loading and
initializing. This project has no control over that name; matching it
exactly is the entire contract this library defines for "tell me when you
are ready."

`youtubeApiReady` and `pendingVideoToLoad` exist to handle a real timing
problem: a user could select a video *before* YouTube's script has finished
loading (a real network request, taking real, variable time). If that
happens, there is nothing to hand a video to yet — `pendingVideoToLoad`
remembers which video was requested, and `onYouTubeIframeAPIReady` checks
for it the moment the API actually becomes ready, loading it then instead
of losing the request entirely.

---

## Step 3 — Build a Real Player Instance

**The problem:** `renderPlayer` currently builds a plain `<iframe>` by
hand. It needs to hand control to the real API instead.

Replace `renderPlayer` in `script.js`:

```javascript
function loadPlayer(video) {
  const container = document.querySelector('.player-area');
  container.textContent = '';

  const playerMount = document.createElement('div');
  playerMount.id = 'youtube-player';
  container.appendChild(playerMount);

  player = new YT.Player('youtube-player', {
    videoId: video.youtubeId,
    width: '100%',
    height: '100%',
  });
}

function renderPlayer() {
  const video = videos.find((v) => v.id === selectedVideoId);

  if (!video) {
    const container = document.querySelector('.player-area');
    container.textContent = '';
    const placeholder = document.createElement('p');
    placeholder.className = 'player-placeholder';
    placeholder.textContent = 'Select a video to play it here.';
    container.appendChild(placeholder);
    player = null;
    return;
  }

  if (!youtubeApiReady) {
    pendingVideoToLoad = video;
    return;
  }

  loadPlayer(video);
}
```

Click **▶ Preview** and select a video. It plays exactly as it did with the
plain `<iframe>` — visually nothing has changed yet, which is the correct
result: this step only changes *how* the player is created, not what it
looks like.

**Walkthrough:** `new YT.Player('youtube-player', { videoId, width,
height })` is how the API creates and controls a player: given the `id` of
an existing, empty element already on the page, it builds its *own* real
`<iframe>` inside that element and returns a JavaScript object —
assigned here to `player` — with real methods for controlling it, including
the one Step 4 needs: `.getCurrentTime()`.

`player = null` inside the "nothing selected" branch of `renderPlayer`
matters: without it, `player` would keep referring to whichever video's
player object was created last, even after that player has been visually
removed from the page — Step 4's "Add Note" feature checks whether `player`
exists before using it specifically to guard against this.

---

## Step 4 — Add a Timestamped Note

**The problem:** Nothing yet reads the real current playback position or
creates a note from it.

Replace `renderNotesPanel` in `script.js`:

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

  const list = document.createElement('div');
  list.className = 'notes-list';
  for (const note of video.notes) {
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    noteItem.textContent = note.text;
    list.appendChild(noteItem);
  }
  container.appendChild(list);
}

function handleAddNote(video) {
  if (!player || typeof player.getCurrentTime !== 'function') {
    alert('The video player is not ready yet.');
    return;
  }

  const text = prompt('Note text:');
  if (!text) {
    return;
  }

  video.notes.push({
    id: Date.now(),
    text,
    timestamp: Math.floor(player.getCurrentTime()),
  });

  saveVideos();
  renderNotesPanel();
}
```

Add to the CSS tab:

```css
.add-note-button {
  width: 100%;
  padding: var(--space-sm);
  margin-bottom: var(--space-md);
  border-radius: var(--radius);
  border: none;
  background-color: var(--colour-accent);
  color: white;
  cursor: pointer;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.note-item {
  padding: var(--space-sm);
  border-radius: var(--radius);
  background-color: var(--colour-page-bg);
  border: 1px solid var(--colour-border);
  font-size: 0.875rem;
}
```

Click **▶ Preview**, play a video, let it run a few seconds, then click
"+ Add Note at Current Time" and type something. A new note appears in the
list.

**Walkthrough:** `player.getCurrentTime()` is a real method the API's
player object provides — it returns the video's current playback position,
in seconds, as a decimal number (for example, `47.328`). `Math.floor(...)`
rounds it down to a whole number of seconds, which is precise enough for
"jump back to around this moment" — lesson 08's job.

`if (!player || typeof player.getCurrentTime !== 'function')` guards
against two real situations at once: no video selected at all (`player` is
`null`), or a video selected so recently that the API has not finished
constructing the player object yet. `typeof player.getCurrentTime ===
'function'` confirms the object is actually a real, ready player, not a
partially-initialized one.

`Date.now()` — milliseconds elapsed since a fixed reference point — is used
here purely as a unique identifier for each note object, distinct from the
video's own `timestamp` field: `Date.now()` says *when this note was
created, in real-world time*, while `timestamp` says *what second of the
video the note is about*. These are two genuinely different pieces of
information a note needs, not the same value serving double duty.

**SE lens — the request/ready pattern, named.** Loading a third-party
library, then waiting for its own signal that it is ready before using it,
is not unique to YouTube's API — it is a common shape any sufficiently
complex third-party library follows, because "the file has downloaded" and
"the library has finished initializing itself" are genuinely different
moments. Lesson 15's math library follows a much simpler version of the
same idea; recognising the pattern here means lesson 15 will not feel like
new territory, only a smaller instance of something already understood.

---

## Connect the Pieces

```
script.js    player, youtubeApiReady, pendingVideoToLoad — a small state
             machine tracking the third-party player's real readiness
             loadPlayer() — creates a real YT.Player instance
             handleAddNote() — reads the real current time and creates a
             genuinely new kind of data: one note, timestamped
```

`saveVideos()`, written in lesson 06 to persist the entire `videos` array
regardless of its contents, needed no changes — a video's `notes` field
being an array of objects instead of a string is invisible to
`JSON.stringify`, which serializes either shape correctly without being
told which one it is.

---

## What Breaks Without This

**Without the `pendingVideoToLoad` handling:** Select a video within the
first instant of the page loading, before YouTube's script has finished
initializing. `youtubeApiReady` is still `false`, and without capturing the
request, `renderPlayer` would simply do nothing — no player, no error, no
indication that anything was even attempted, until the user tries clicking
again later by coincidence.

**Without checking `typeof player.getCurrentTime === 'function'` (checking
only `if (!player)`):** Click "Add Note" in the small window of time after
a new `YT.Player(...)` call has started but before the API has fully
constructed it. `player` is already a real, non-null object at that point,
so `!player` is `false` — but `player.getCurrentTime` may not exist as a
callable method yet, and calling it throws, crashing `handleAddNote` before
it can even show the "player is not ready" message the guard was supposed
to provide.

---

## Definition of Done

- [ ] Playing a video and clicking "+ Add Note at Current Time" creates a real note with a real captured timestamp
- [ ] Each video's notes render as a list, not a single textarea
- [ ] Saved data from before this lesson (a single notes string) loads without crashing, starting with an empty notes list
- [ ] You can explain why a plain `<iframe>` cannot expose the video's current playback time, and what same-origin policy has to do with it
- [ ] You can explain the difference between "the script has downloaded" and "the library is ready," using `onYouTubeIframeAPIReady` as the example
- [ ] You can explain why `Date.now()` and a note's `timestamp` field represent two different pieces of information
- [ ] You can explain what data was lost by this lesson's migration, and why no automatic fix was possible

---

*Next: Lesson 08 — Jumping to a Timestamp. Click any note in the list, and
the video seeks to the exact second it was written about — the payoff for
building the real player API integration in this lesson, not a plain
embed.*
