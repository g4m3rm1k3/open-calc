# Video Notes — Lesson 03 — Adding a Video

## What You Will Build

A real form above the video list: a title, a YouTube URL, and an "Add"
button. Submit it, and a new video joins the list immediately, no page
reload. This is the first time this project's data changes because of
something a person using the page did, rather than because you edited
`script.js` yourself.

---

## What You Need to Know First

Lesson 02 left `videos` as an array of `{ id, title }` objects in
`script.js`, rendered into `#video-list-items` by `renderVideoList()`.

---

## Step 1 — Build the Form

**The problem:** Nothing on the page can currently create a new video.

Update `.video-list` in the HTML tab:

```html
<aside class="video-list">
  <h2>My Videos</h2>
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
.add-video-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.add-video-form input {
  padding: var(--space-sm);
  border-radius: var(--radius);
  border: 1px solid var(--colour-border);
  background-color: var(--colour-page-bg);
  color: var(--colour-text);
}

.add-video-form button {
  padding: var(--space-sm);
  border-radius: var(--radius);
  border: none;
  background-color: var(--colour-accent);
  color: white;
  cursor: pointer;
}
```

Click **▶ Preview**. A form now appears above the video list. Clicking "Add"
does nothing meaningful yet — Step 3 wires it up.

**Walkthrough:** `<form>` is the element that groups related inputs together
and defines what happens when they are submitted — by pressing its button,
or pressing Enter inside one of its fields. `type="text"` is the plain,
single-line text input type — the default kind of input if none is
specified, made explicit here for clarity. `required` is a built-in HTML5
validation attribute: the browser refuses to submit the form at all if a
required field is empty, showing its own small validation message. This is
**client-side validation** — instant feedback, no code of yours involved yet
— and it is a courtesy for honest mistakes, not a security boundary; nothing
stops a field from containing text that passes `required` but is still not
a real YouTube URL, which Step 2 has to check for separately.

`<button type="submit">` — inside a `<form>`, a button defaults to
`type="submit"` even without this attribute, but writing it explicitly says
directly what will happen when it is clicked, rather than leaving a reader
to infer it from context.

---

## Step 2 — Parse a YouTube URL

**The problem:** A YouTube URL like `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
or `https://youtu.be/dQw4w9WgXcQ` needs to become just the video's
identifier — `dQw4w9WgXcQ` — the only part actually needed to embed it later.

Add to `script.js`:

```javascript
function extractYouTubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }

    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v');
    }

    return null;
  } catch {
    return null;
  }
}
```

**Walkthrough:** `new URL(url)` is a browser API that parses a URL string
into its real components — protocol, hostname, path, and query parameters —
throwing an error if the string is not a well-formed URL at all, which is
exactly why this runs inside a `try`/`catch`: an invalid string (or an
empty one, which `required` alone would not have caught if bypassed) should
produce a clear `null` result, not an uncaught crash.

`parsed.hostname` is the domain — `youtu.be` or `www.youtube.com`, depending
on which of YouTube's two common URL shapes was pasted. For a `youtu.be`
link, the video ID is the entire path after the leading slash:
`parsed.pathname` for `https://youtu.be/dQw4w9WgXcQ` is `/dQw4w9WgXcQ`, and
`.slice(1)` removes that one leading character, returning `dQw4w9WgXcQ`. For
a full `youtube.com` link, the ID instead lives in the `v` **query
parameter** — everything after `?` in the URL, structured as `key=value`
pairs — which `parsed.searchParams.get('v')` reads directly, without you
needing to manually split the string on `?` and `&` yourself.

**CS lens — this function is a pure parser.** Given the same URL string, it
always returns the same result, with no side effects — it does not touch
the DOM, the `videos` array, or anything outside itself. This is deliberate:
a function whose only job is "turn this string into that string" is trivial
to reason about and, if this project ever added tests, trivial to test in
isolation, entirely separately from whatever calls it.

---

## Step 3 — Handle the Submission

**The problem:** Submitting the form needs to validate the URL, build a new
video object, add it to the data, and re-render — without reloading the
page, which is a real `<form>`'s default behaviour.

Add to `script.js`:

```javascript
let nextVideoId = videos.length + 1;

function handleAddVideo(event) {
  event.preventDefault();

  const titleInput = document.getElementById('video-title-input');
  const urlInput = document.getElementById('video-url-input');
  const youtubeId = extractYouTubeId(urlInput.value.trim());

  if (!youtubeId) {
    alert('That does not look like a valid YouTube URL.');
    return;
  }

  videos.push({
    id: nextVideoId++,
    title: titleInput.value.trim() || 'Untitled Video',
    youtubeId,
  });

  titleInput.value = '';
  urlInput.value = '';
  renderVideoList();
}

document.getElementById('add-video-form').addEventListener('submit', handleAddVideo);
```

Click **▶ Preview**. Paste a real YouTube URL (for example, `https://www.
youtube.com/watch?v=dQw4w9WgXcQ`) and a title, click Add: a fourth video
appears in the list immediately, and the form clears.

**Walkthrough — `event.preventDefault()`, the single most important line
here.** A `<form>`'s default behaviour, the moment it is submitted, is to
navigate the browser to a new page — reloading everything, discarding every
variable this project holds in memory, since nothing is saved anywhere yet
(that is lesson 06). `event.preventDefault()` stops exactly that default
action, while still letting the rest of this function run normally. Every
form this project ever adds needs this line.

`urlInput.value.trim()` reads the input's current text and removes leading
and trailing whitespace — `.trim()` guards against a URL accidentally pasted
with a stray leading space, which would otherwise make `new URL(...)` see
an invalid string.

`if (!youtubeId) { ...; return; }` stops the function early if parsing
failed — `!youtubeId` is `true` when `youtubeId` is `null` (or an empty
string, which is also **falsy** — treated as `false` in a boolean context).
`alert(...)` shows a simple built-in browser popup; a nicer, in-page error
message is a reasonable improvement, and not required for this lesson to be
complete.

`videos.push({...})` adds the new object to the *end* of the array,
**mutating it in place** — changing the existing array directly, rather
than building an entirely new array with the addition included.

**SE lens — why mutating here is fine, unlike in the React series.** If you
have seen React code (this project's own [React Studio](../react-studio/README.md)
series builds an almost identical feature), you may know that React
specifically requires *never* mutating an array in state directly — but
that rule exists because React decides whether to re-render by comparing
object references, and a mutated array keeps the same reference. This
project has no such mechanism: `renderVideoList()` is a plain function,
called explicitly, that always rebuilds the sidebar from whatever `videos`
currently contains. There is no reference comparison anywhere to fool.
Mutating the array here is not a shortcut or an oversight — it is the
correct, simplest choice for how this specific project actually works.

`nextVideoId++` is the **postfix increment operator** — it uses the
variable's *current* value first (as the new video's `id`), then increases
it by one, guaranteeing the next video added gets a different, higher `id`.

`document.getElementById('add-video-form').addEventListener('submit',
handleAddVideo)` connects the function to the form's real `submit` event —
without this line, `handleAddVideo` is defined but never actually called by
anything.

---

## Connect the Pieces

```
index.html    #add-video-form — a real form, above the rendered list
script.js     extractYouTubeId() — a pure URL parser
              handleAddVideo() — validates, builds a new video, re-renders
              videos now grows over time instead of being fixed at three
```

`renderVideoList()`, written in lesson 02 to rebuild the sidebar from
whatever `videos` currently holds, needed no changes at all — it already
did not care how many videos existed or how they got there.

---

## What Breaks Without This

**Without `event.preventDefault()`:** Submit the form. The entire page
reloads — every video you have added during this session disappears,
reverting to the original three hardcoded ones, because nothing has been
saved anywhere and the whole in-memory `videos` array is recreated fresh on
reload.

**Without the `try`/`catch` around `new URL(url)`:** Submit the form with the
URL field containing plain text that is not a URL at all, like `hello`.
`new URL('hello')` throws an uncaught `TypeError`, and — because nothing
caught it — `handleAddVideo` stops executing at that exact line, silently,
with no `alert` shown and the sidebar never updated, leaving no indication
of what went wrong.

---

## Definition of Done

- [ ] A form above the video list accepts a title and a YouTube URL
- [ ] Submitting it with a valid URL adds a new video to the list immediately, with no page reload
- [ ] Submitting it with an invalid URL shows a clear message and adds nothing
- [ ] The form's fields clear after a successful add
- [ ] You can explain what `event.preventDefault()` prevents here, specifically, and what would happen without it
- [ ] You can explain the two YouTube URL shapes this project handles and how `extractYouTubeId` tells them apart
- [ ] You can explain why mutating the `videos` array with `.push()` is correct here, and why the same approach would be wrong in a React-based project
- [ ] Run ▶ Preview once more and confirm your added videos are exactly as you typed them

---

*Next: Lesson 04 — Playing a Video. Clicking any video in the list loads it
into a real embedded player — the first time this project shows content it
did not build itself, borrowed from another website entirely.*
