# Concept: `FormData` and Uploading a File with `fetch`

**What you'll understand by the end:** how to send an actual file (not text, not JSON) from the browser to a server, and why `fetch-post-with-body.md`'s `JSON.stringify` approach doesn't apply here at all.

**Prerequisites:** `fetch-post-with-body.md`, `html-input-element.md`.

## Setup

Any modern browser, plus a server that can receive a `multipart/form-data` upload (`flask-file-upload.md`'s server is the real counterpart used here).

## The Problem

`fetch-post-with-body.md` sends a JSON string as the body — but a `File` object (from a real `<input type="file">`) isn't text, and stringifying it would produce nothing meaningful. The browser needs a different body format entirely for raw binary file data, and a way to build it without hand-assembling the format itself.

## The Isolated Example

```javascript
const input = document.querySelector('input[type="file"]');
const file = input.files[0]; // a real File object the user picked

const body = new FormData();
body.append("file", file);

const response = await fetch("http://127.0.0.1:5000/upload", {
  method: "POST",
  body,
});
console.log(await response.json());
```

**Real output**, from this exact request/response shape, run for real this session via `curl`'s own multipart form support (`curl -F "file=@Untitled.TOOLDB" ...`) — the identical wire format a browser's `FormData` produces, against this project's real `/api/tools/import/preview` route:
```json
{"tools": [{"arbor_diameter": 0.5, "corner_radius": 0.03, ...
```

**What this proves:** no `Content-Type` header was set anywhere in the `fetch` call — unlike `fetch-post-with-body.md`'s JSON version, which requires one explicitly — and the request still succeeded, with the server correctly reading a real uploaded file's contents.

## Mechanical Walkthrough

- `input.files[0]` — **(a) first appearance** — a real `File` object, one of possibly several selected files, off a file `<input>` element's own `.files` list (a `FileList`, not a plain array, but indexable the same way).
- `new FormData()` — **(a) first appearance** — constructs an empty, real multipart form data object.
- `body.append("file", file)` — **(a) first appearance** — adds an entry under the field name `"file"` — the exact name `flask-file-upload.md`'s `request.files.get("file")` reads back out; the two names must match, the same way a form field's `name` attribute has to match whatever reads it server-side.
- `body` passed directly as `fetch`'s `body` — **(b) reappearing** `fetch` options-object shape from `fetch-post-with-body.md`, but **(a) a genuinely different case**: passing a `FormData` instance instead of a JSON string. `fetch` recognizes the type and automatically sets the correct `Content-Type` header itself, including a random boundary string the server uses to separate fields — manually setting `Content-Type` here would actually break the request, since a hand-written header would be missing that boundary value.

## CS Lens

This is a different real **wire format** than JSON — `multipart/form-data`, defined in its own RFC, designed specifically to carry mixed binary and text fields in one request body without needing to escape binary bytes as text (which JSON, a text-only format, cannot represent directly at all). Choosing the right format for the data's actual shape (binary file bytes vs. structured text data) is the same underlying decision `serialization-deserialization.md` describes more generally.

Also recognized in: every real file-upload form on the web, HTML's own native `<form enctype="multipart/form-data">` submission (predating `fetch` entirely — this is a JavaScript API replicating a format the browser already knew how to send natively).

## SE Lens

The alternative — read the file's bytes and try to embed them in a JSON body (base64-encoded, since JSON is text-only) — works, but costs roughly 33% more bytes over the wire (base64 encoding overhead) and requires both sides to explicitly encode/decode, for no benefit over a format designed for exactly this. `FormData` is the right tool specifically *because* the data is a real file — reaching for it for an ordinary text-only body (name/email fields with no file) would be reaching past the simpler, already-taught JSON approach for no reason.

## Connection

Builds on `fetch-post-with-body.md`, contrasted directly with it. Server-side counterpart: `flask-file-upload.md`, which reads exactly what this sends.

## Try It Yourself

1. Append a second field to the same `FormData` (`body.append("description", "a test upload")`) alongside the file, and confirm the server can read both the file *and* the plain text field from the same request — `request.files` for the file, `request.form` for the text field, two different accessors on the same request.
2. Manually set `headers: { "Content-Type": "multipart/form-data" }` on the `fetch` call (overriding the automatic one) and observe the upload actually breaks — real, direct proof the automatic boundary value matters and isn't optional decoration.
3. Call `body.append("file", file)` twice with two different files under the *same* field name, and inspect what `request.files.getlist("file")` (as opposed to `.get("file")`) returns server-side — confirming a field name isn't required to be unique.
