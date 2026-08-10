# Concept: Reading a File's Real Contents in the Browser (`File.text()`)

**What you'll understand by the end:** how to get an uploaded file's
actual text content into JavaScript, entirely client-side, with no
server round trip — a different real need than uploading a file *to* a
server.

**Prerequisites:** `javascript-promises-async.md`.

## Setup

Any modern browser, or Node.js 20+ (`File` is a global in both). No
install needed.

## The Problem

An `<input type="file">`'s `FileList` hands back real `File` objects —
but a `File` is metadata plus a reference to the underlying bytes, not
the content itself sitting in a string already. This project's own
`ToolImportPanel.tsx` (Lesson 18) already handles file upload, but it
only ever sends the whole `File` to the *backend* via `FormData`,
letting the server do the actual reading — a genuinely different need
from wanting the real text content available in the browser itself, right
now, with nothing to send anywhere.

## The Concept, Isolated

```javascript
const file = new File(["G0 X1 Y1\nM5"], "part.nc", { type: "text/plain" });

console.log("file.name:", file.name);
console.log("file.size:", file.size);

file.text().then((contents) => {
  console.log("contents:", JSON.stringify(contents));
});
```

**Real output, run this session:**
```
file.name: part.nc
file.size: 11
contents: "G0 X1 Y1\nM5"
```

**What this proves:** `file.text()` returned a real Promise that resolved
with the file's actual real content, as a plain JavaScript string —
`"G0 X1 Y1\nM5"`, exactly the bytes the `File` was built from, ready to be
used directly (rendered, parsed, stored in state) with nothing sent over
a network.

## Mechanical Walkthrough

- `new File([...], name, options)` — **(c) already basic** for this
  lab's purposes (constructing a fake file only to prove the API; a real
  `File` normally comes from a `FileList`, not this constructor).
- `file.name` / `file.size` — **(b) reappearing** — `ToolImportPanel.tsx`
  already reads `file.name` (Lesson 18); `.size` is the same kind of
  plain metadata property.
- `file.text()` — **(a) first appearance** — a method on `File` (which
  extends the more general `Blob`) that asynchronously reads the file's
  entire real content and resolves with it as a UTF-8-decoded string.
  Returns a real Promise — **(b) reappearing**,
  `javascript-promises-async.md` — resolved once the browser has actually
  finished reading the underlying bytes, which can take real time for a
  large file.

## CS Lens

This is the same **asynchronous I/O** idea `javascript-promises-async.md`
already covers for `fetch` — reading a file's bytes from disk (or from
browser-internal storage for a just-selected file) is not instantaneous,
so the browser hands back a Promise instead of blocking. The underlying
mechanism (`FileReader`, which `File.text()` wraps) predates Promises in
browser history; `.text()` is the modern, Promise-based interface to the
identical real operation.

Also recognized in: Node's own `fs.readFile` (async, callback/Promise-based,
the identical "reading bytes takes real time" reasoning applied to a
server's local disk instead of a browser's file picker), and Python's
`open(path).read()` when wrapped in an async framework rather than
blocking a whole thread.

## SE Lens

The real, concrete choice this makes: `.text()` decodes the whole file as
UTF-8 text in one step, which is exactly right for a real G-code
program (always plain text) and exactly wrong for a binary format (an
image, a compiled binary) — `.arrayBuffer()` (already used elsewhere in
this project, per `COMPONENT_MAP.md`'s note on `FixturesSection.jsx`'s
model uploads) is the right sibling method when a file's real bytes
matter, not its text. Picking `.text()` here is a deliberate, correct fit
for this project's own real input shape, not a default reached for
without considering what the file actually contains.

## Connection

Builds on `javascript-promises-async.md`. Directly relevant to this
project's own `App.tsx`: `handleUploadFile` calls `file.text()` to get a
real program string into React state, the client-side sibling to
`ToolImportPanel.tsx`'s server-side file handling (Lesson 18) — same
input mechanism (`<input type="file">`), two genuinely different real
destinations for the bytes.

## Try It Yourself

1. Call `.arrayBuffer()` instead of `.text()` on the same `File` and log
   the result's `byteLength` — confirm it's the same real byte count as
   `.size`, just in a different, non-text-decoded form.
2. Construct a `File` with genuinely non-UTF-8 bytes (or a real binary
   file, if testing in an actual browser) and call `.text()` on it —
   observe what real (possibly garbled) string comes back, reasoning
   about why `.text()` assumes UTF-8 and doesn't validate that
   assumption.
3. Time how long `.text()` takes to resolve for a real, large file (a few
   MB) versus a tiny one — confirming this is real asynchronous work, not
   an instant operation disguised as a Promise.
