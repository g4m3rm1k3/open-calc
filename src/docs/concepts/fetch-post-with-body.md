# Concept: `fetch` with a Method, Headers, and Body

**What you'll understand by the end:** how to send data to a server with `fetch`, not just request it — the options-object form, distinct from the GET-only call taught alongside the base `fetch` concept.

**Prerequisites:** `fetch-api.md`, `json-stringify.md`, `http-methods-get-post.md`.

## Setup

Any modern browser. Needs a real HTTP server to send to that echoes JSON bodies back — a minimal Flask example is enough (see `flask-request-object.md`'s Setup).

## The Problem

`fetch(url)` alone always sends a `GET` request with no body — there's no way to send data to the server with that one-argument form. Sending data (the whole point of a `POST` request) needs a way to specify the method, describe what format the body is in, and provide the body itself.

## The Isolated Example

Against a locally running server with a `POST /echo` route that returns whatever JSON it receives:
```javascript
fetch("http://127.0.0.1:5000/echo", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Ada" }),
})
  .then((response) => response.json())
  .then((data) => console.log("server echoed back:", data));
```

**Real output (browser console):**
```
server echoed back: {name: 'Ada'}
```

**What this proves:** the object passed as `fetch`'s second argument controlled every aspect of what was actually sent — without `method: "POST"`, this would default to `GET` and the server-side route (registered for `POST` only) would reject it with a `405`; without the `Content-Type` header, the server might not know to parse the body as JSON at all.

## Mechanical Walkthrough

- `fetch(url, options)` — the second argument is a plain object describing everything about the request beyond the URL.
- `method: "POST"` overrides the default `GET`.
- `headers: { "Content-Type": "application/json" }` tells the receiving server how to interpret the body's bytes — without this, a server-side `request.get_json()` call may not recognize the body as JSON even if it's textually valid JSON.
- `body: JSON.stringify({ name: "Ada" })` — the request body must be a string (or certain other raw formats) — a JavaScript object cannot be sent directly; `JSON.stringify` converts it into the JSON text that actually travels over the network.

## CS Lens

This is the client-side half of the exact request/response cycle described in `http-request-response.md` and `http-methods-get-post.md` — everything specified in the options object becomes real bytes on the wire: the method on the request line, the header as a header line, the stringified body as the message body, separated by the same blank line every HTTP message uses.

Also recognized in: every HTTP client library's equivalent "send data" call — Python's `requests.post(url, json={...})` performs the identical operation, just handling the `JSON.stringify` equivalent and the `Content-Type` header automatically as a convenience.

## SE Lens

Forgetting the `Content-Type` header is a real, common mistake — the body might still be syntactically valid JSON text, but without the server being told that's what it is, it may be treated as plain, unparsed text instead, and a route expecting `request.get_json()` to work would silently receive `None`. This is exactly why the header and the body-serialization step are treated as one inseparable unit here, not two independent choices — sending one without the other produces a request that looks almost right and doesn't work.

## Connection

Builds on `fetch-api.md` (the base function), `json-stringify.md` (serializing the body), and `http-methods-get-post.md` (why the method matters). The server-side counterpart that receives and interprets exactly what this sends is `flask-request-object.md`.

## Try It Yourself

1. Remove the `Content-Type` header from the options object and resend. Depending on the server's exact validation, observe either a `400` (correctly rejecting the malformed-looking request) or an unexpected result — proof of the "looks right, doesn't work" failure mode named above.
2. Change `method: "POST"` to `method: "GET"` while keeping the body, against a route registered for `POST` only. Confirm you get a real `405`, and reason about why a body was still allowed to be specified even though `GET` requests aren't supposed to carry one.
3. Send a body that is *not* run through `JSON.stringify` — pass the raw JavaScript object directly as `body: { name: "Ada" }`. Observe what actually gets sent (hint: JavaScript will coerce it to the string `"[object Object]"`) and confirm the server-side JSON parsing fails as a result — a concrete demonstration of why the explicit stringify step is required, not optional.
