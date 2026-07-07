# Video Notes — Lesson 18 — From Functions to a Class

## What You Will Build

Nothing new appears on screen. Click **▶ Preview** at the end of this
lesson, and Video Notes behaves exactly as it did at the end of lesson 17 —
every feature, unchanged. What changes is underneath: every function that
reads or changes `videos` is gathered into one real `NoteLibrary` class,
replacing a pattern that has quietly repeated itself across at least four
separate functions by now. This is a **refactor** — restructuring working
code without changing what it does — and its definition of done is the
same application, built on cleaner foundations.

---

## What You Need to Know First

By lesson 17, `videos` is a plain array, loaded once by `loadVideos()` and
saved by `saveVideos()`, read directly by `renderPlayer`, `renderNotesPanel`,
`getSortedVideos`, `reorderVideos`, and lesson 17's `n` shortcut — five
different places, each independently writing `videos.find((v) => v.id ===
someId)` or something equivalent.

---

## Concept: Why Bundle Data and Behaviour Together?

Count the exact same lookup, written independently, across this project so
far: `renderPlayer` (lesson 04) finds the selected video to play it.
`renderNotesPanel` (lesson 05) finds it to show its notes. Lesson 17's `n`
shortcut finds it to add a note. Each of these is the identical idea —
"give me the video with this id" — typed out separately, four times, with
no single place responsible for knowing how that lookup actually works.

This is exactly the kind of repetition a **class** exists to remove. A
class is a blueprint — a named template describing what every **instance**
built from it will have: what data it holds, and what actions (**methods**)
it knows how to perform on that data. You have been creating instances of
classes *the browser already defines* since lesson 03 — `new URL(url)` and
lesson 16's `new Date(timestamp)` are both instances of classes JavaScript
ships with. `NoteLibrary` will be the first class *this project defines
itself*, using the exact same `new` mechanism to create one instance of it.

**SE lens — encapsulation, named directly.** Bundling `videos` together
with every function that reads or changes it, inside one class, is called
**encapsulation**: the rules for how a video is looked up, added, or
modified live in exactly one place, and every other part of this project
asks that one place to do it, rather than reimplementing the same logic
independently. This is the same "one function, one job" instinct lesson
02 first named, scaled up from a single function to a whole related group
of them.

---

## Step 1 — Define the Class, Move Persistence Inside It

**The problem:** `STORAGE_KEY`, `saveVideos`, `loadVideos`, and the
top-level `videos` variable are four separate, independent pieces that
happen to work together — nothing about their current shape groups them as
one thing.

Replace this, near the top of `script.js`:

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
    const parsed = JSON.parse(saved);
    return parsed.map((video) => ({
      ...video,
      notes: Array.isArray(video.notes)
        ? video.notes.map((note) => ({ ...note, tags: Array.isArray(note.tags) ? note.tags : [] }))
        : [],
      created: typeof video.created === 'number' ? video.created : video.id,
    }));
  } catch {
    return [];
  }
}

const videos = loadVideos();
```

With this:

```javascript
const STORAGE_KEY = 'video-notes-library';

class NoteLibrary {
  constructor() {
    this.videos = this.load();
  }

  load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }

    try {
      const parsed = JSON.parse(saved);
      return parsed.map((video) => ({
        ...video,
        notes: Array.isArray(video.notes)
          ? video.notes.map((note) => ({ ...note, tags: Array.isArray(note.tags) ? note.tags : [] }))
          : [],
        created: typeof video.created === 'number' ? video.created : video.id,
      }));
    } catch {
      return [];
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.videos));
  }
}

const library = new NoteLibrary();
```

Then replace every remaining bare `videos` in `script.js` with
`library.videos`. Two representative examples — `getSortedVideos` (lesson
12):

```javascript
function getSortedVideos() {
  const sortedVideos = [...library.videos];
  // ...unchanged below this line
}
```

and `renderPlayer` (lesson 04):

```javascript
function renderPlayer() {
  const container = document.querySelector('.player-area');
  container.textContent = '';

  const video = library.videos.find((v) => v.id === selectedVideoId);
  // ...unchanged below this line
}
```

Click **▶ Preview**. Every feature built so far — adding videos, playing
one, notes, tags, search, sort, drag-to-reorder, themes, shortcuts — works
exactly as it did before this lesson. Nothing should look or behave
differently yet.

**Walkthrough — `class`, `constructor`, and `new`.** `class NoteLibrary {
... }` defines the blueprint — it does not, by itself, create anything
real; nothing exists until `new NoteLibrary()` runs. `constructor()` is a
special method that runs *exactly once*, automatically, the instant `new`
creates an instance — it is where an instance sets up its own starting
data. `this.videos = this.load()` inside it means: the moment a
`NoteLibrary` is created, immediately load whatever was previously saved
and store it as *this specific instance's own* `videos` property.

**Walkthrough — `this`, the one truly new idea here.** Every function this
project has written until lesson 18 read `videos` as a single, fixed
variable, shared identically no matter which function touched it. Inside a
method, `this` instead refers to *the specific instance the method was
called on* — resolved automatically, at the moment the method is actually
invoked. `library.save()` runs `save()` with `this` bound to `library`, so
`this.videos` inside it means exactly `library.videos`. Nothing about this
project ever needs two different `NoteLibrary` instances at once — but the
mechanism is the same one every class in JavaScript uses, including every
built-in one already used since lesson 03.

`load()` and `save()` are **methods** — functions that live inside a class
and act on `this`. Unlike `constructor`, a method does not run
automatically; it runs only when something explicitly calls it by name,
`library.load()` or `library.save()`, exactly like calling any other
function — the difference is only where it lives and what `this` means
inside it.

---

## Step 2 — A Method for the Repeated Lookup

**The problem:** `library.videos.find((v) => v.id === selectedVideoId)`
(or an equivalent) is still typed out independently in `renderPlayer`,
`renderNotesPanel`, and lesson 17's `n` shortcut — the exact repetition
this lesson set out to remove has only moved, not disappeared.

Add a method to `NoteLibrary` in `script.js`:

```javascript
class NoteLibrary {
  constructor() {
    this.videos = this.load();
  }

  load() { /* unchanged from Step 1 */ }

  save() { /* unchanged from Step 1 */ }

  findVideo(id) {
    return this.videos.find((video) => video.id === id);
  }
}
```

Update every call site to use it. `renderPlayer`:

```javascript
const video = library.findVideo(selectedVideoId);
```

`renderNotesPanel`, and lesson 17's `n` shortcut, both change identically —
the same line, `library.findVideo(selectedVideoId)`, replacing whatever
independent `.find(...)` call was there before.

Click **▶ Preview** again. Behaviour is still identical — selecting a
video, viewing its notes, and pressing `n` to add one all still work.

**Walkthrough — the payoff.** Three separate, independent expressions —
each one correct on its own, each written by a different lesson, at a
different time — collapse into one method and three identical one-line
call sites. If this project ever changed how videos are looked up — by a
different key, with case-insensitive matching, whatever the reason — there
is now exactly one place, `findVideo`, that would need to change, instead
of three places a future edit could easily miss one of.

---

## Step 3 — Methods That Mutate, With Saving Built In

**The problem:** Adding a video or a note is still two separate steps every
caller has to remember, in order: mutate `library.videos` directly, then
call `library.save()` afterward. Forgetting the second step — an easy
mistake in a future feature — would silently lose data with no error at
all.

Add two more methods to `NoteLibrary`:

```javascript
class NoteLibrary {
  // ...load(), save(), findVideo() unchanged

  nextVideoId() {
    const maxId = this.videos.reduce((max, video) => Math.max(max, video.id), 0);
    return maxId + 1;
  }

  addVideo(title, youtubeId) {
    const video = {
      id: this.nextVideoId(),
      title,
      youtubeId,
      notes: [],
      created: Date.now(),
    };
    this.videos.push(video);
    this.save();
    return video;
  }

  addNote(videoId, text, timestamp, tags) {
    const video = this.findVideo(videoId);
    if (!video) {
      return null;
    }

    const note = { id: Date.now(), text, timestamp, tags };
    video.notes.push(note);
    this.save();
    return note;
  }
}
```

Update `handleAddVideo` in `script.js`:

```javascript
function handleAddVideo(event) {
  event.preventDefault();

  const titleInput = document.getElementById('video-title-input');
  const urlInput = document.getElementById('video-url-input');
  const youtubeId = extractYouTubeId(urlInput.value.trim());

  if (!youtubeId) {
    alert('That does not look like a valid YouTube URL.');
    return;
  }

  library.addVideo(titleInput.value.trim() || 'Untitled Video', youtubeId);

  titleInput.value = '';
  urlInput.value = '';
  renderVideoList();
}
```

Update `handleAddNote`:

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

  library.addNote(video.id, text, Math.floor(player.getCurrentTime()), parseTagsInput(tagsInput));
  renderNotesPanel();
}
```

Click **▶ Preview**. Adding a video and adding a note both still work
exactly as before — but neither `handleAddVideo` nor `handleAddNote` calls
`saveVideos()` (or anything like it) directly anymore.

**Walkthrough:** `addVideo` and `addNote` each perform their entire
mutation — building the right object, pushing it into `this.videos`, and
calling `this.save()` — as one atomic action neither caller can partially
get wrong. `handleAddVideo` no longer knows or cares that saving is even a
separate step; it simply calls `library.addVideo(...)` and trusts that
persisting the result is already handled.

**SE lens — what each side of this refactor is now responsible for, and
why that split matters.** `handleAddVideo` still owns everything specific
to *this one form*: reading the input elements, validating the URL,
showing an `alert()`, clearing the fields afterward. `NoteLibrary` owns
nothing about forms, DOM elements, or `alert()` at all — it only knows how
to safely store and organise video and note data, correctly, every time.
Neither side needs to know the details of the other: `NoteLibrary` would
work identically if some future version of this project added videos via
drag-and-drop file import instead of a form, and `handleAddVideo` would
work identically if `NoteLibrary` changed how it stores data internally.
This is **separation of concerns**, the same principle lesson 02 first
named for a single function, now applied to an entire class boundary.

`nextVideoId()`, moved into the class alongside `addVideo`, is no longer
something any other part of this project ever needs to think about at all
— it was always really a detail of *how a video gets added*, and now it
lives exactly there, reachable only through `addVideo`, exactly where it
belongs.

---

## Connect the Pieces

```
script.js    NoteLibrary — a class bundling videos together with load(),
             save(), findVideo(), nextVideoId(), addVideo(), and addNote()
             library — the one instance this project ever creates
             Every render function, and every handler, now reads and
             changes video data exclusively through library
```

`reorderVideos` (lesson 13) and the tag/note-editing code inside
`renderNotesPanel` (lessons 09, 10, 14) still reference `videos` and
`saveVideos()` directly — replacing those with `library.videos` and
`library.save()` is the exact same two mechanical edits Step 1 already
made everywhere else, with no new concept required. Converting
`reorderVideos` itself into a `library.reorder(draggedId, targetId)`
method, following Step 3's exact pattern, is a reasonable next exercise —
not required for this lesson to be complete, since the repetition that
motivated this refactor (the repeated lookup, the repeated save-after-mutate)
is already gone.

---

## What Breaks Without This

**This lesson has no new user-facing feature, so there is no new user-facing
failure mode to demonstrate — the honest risk here is entirely a
maintenance one.** Imagine a sixth place, added in some future version of
this project, that needs to look up a video by id, written independently
instead of calling `library.findVideo(id)`. Now a bug fix to the lookup
logic — say, guarding against a duplicate id that should never exist but
somehow does — has to be found and applied in every independent copy, and
missing even one leaves that one spot silently behaving differently from
every other. This is the actual, real cost repetition carries over time:
not that the duplicated code is wrong today, but that it can silently
drift from correct as the project keeps growing.

---

## Definition of Done

- [ ] Every feature from lesson 17 works identically after this refactor — nothing new, nothing broken
- [ ] `videos` no longer exists as a bare top-level variable — `library.videos` is the only place video data lives
- [ ] `findVideo`, `addVideo`, and `addNote` are real methods on `NoteLibrary`, each called from at least one place that used to do the equivalent work independently
- [ ] Neither `handleAddVideo` nor `handleAddNote` calls a save function directly anymore
- [ ] You can explain the difference between a class and an instance, using `NoteLibrary` and `library` as the example
- [ ] You can explain what `this` refers to inside a method, and why it is different from every plain function this project wrote before lesson 18
- [ ] You can explain what encapsulation means, using the four independent `.find()` lookups this lesson collapsed into one method as the concrete example
- [ ] You can explain why `nextVideoId` moved inside the class but `alert()` and reading form inputs stayed in `handleAddVideo`

---

*Next: Lesson 19 — Export, Import, and Monaco. A whole library can be
downloaded as one JSON file and loaded back in in a different browser
entirely — real file downloads, confirmed working in HTML Lab's sandboxed
preview back when this series began — and, for anyone who wants it, a real
Monaco editor, loaded from a CDN using the exact same dynamic-loading
pattern lesson 15 built for KaTeX.*
