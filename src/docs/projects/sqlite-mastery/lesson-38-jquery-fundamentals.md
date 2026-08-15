# Lesson 38: jQuery Fundamentals

**What you will build:** a real, throwaway page proving jQuery's own
two core real capabilities this arc depends on directly — selecting and
changing real page content, and making a real HTTP request to Arc 4's
own backend — before Lesson 39 puts either to real, permanent use.

**What you need to know first:** [Lesson 37](lesson-37-what-pywebview-is.md)
— the real native window this lesson's own page runs inside.
[Lesson 36](lesson-36-cors.md) — this arc's own real, CORS-configured
backend, which this lesson's own second unit calls for the first time
from inside a real `pywebview` window.

**Terms introduced in this lesson:**
- **jQuery** — a real, long-standing, third-party JavaScript library
  (loaded via a real `<script>` tag, from a CDN or a local copy) that
  simplifies selecting page elements, changing them, and making HTTP
  requests — this series' first client-side JavaScript library, and
  the real foundation jQuery DataTables (Lesson 39) is itself built on.
- **DOM (Document Object Model)** — the real, live, in-memory tree
  structure a browser builds from an HTML page, which jQuery's own
  selectors search and JavaScript can read and change directly.
- **AJAX (Asynchronous JavaScript and XML)** — a real, general name for
  making an HTTP request from already-loaded JavaScript, without
  navigating to a new page — despite the real, historical name, this
  series' own real requests use JSON, not XML.

**Objects and methods used:**

**`$()` (the jQuery function)**
- *What it is:* jQuery's own real, single entry point — a function,
  conventionally aliased to the symbol `$`.
- *Implementation:* `$(cssSelector)` — real, returns a jQuery object
  wrapping every real DOM element matching the given CSS selector
  (`"#id"`, `".class"`, `"tag"`), ready for further real jQuery methods
  to act on.
- *Its use:* finding real elements on this lesson's own page to read or
  change.

**`.on()`**
- *What it is:* a real jQuery method for attaching a real event
  handler.
- *Implementation:* `$(selector).on("event", handlerFunction)` — runs
  `handlerFunction` for real, every time the named real DOM event
  (`"click"`, among many others) fires on a matched element.
- *Its use:* reacting to a real, user-triggered click in this lesson's
  own isolated lab.

**`$.ajax()`**
- *What it is:* a real jQuery function for making an HTTP request.
- *Implementation:* `$.ajax({ url, method, success, error })` — a
  real, single configuration object; `success` is called with the real,
  parsed response body if the request succeeds, `error` if it fails.
- *Its use:* this lesson's own first real request to Arc 4's own
  backend, from inside a genuine `pywebview` window.

---

## Concept Unit: `$()` and `.on()` — Selecting and Reacting

### The Problem

`hello.html` (Lesson 37) was real, but entirely static — nothing on the
page could change in response to anything a real user did.

### Introduce the Concept in Isolation

A real, throwaway page, loaded inside a real `pywebview` window
(Lesson 37's own `create_window` shape, reused unchanged):

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
</head>
<body>
    <button id="greet-button">Click me</button>
    <p id="output">Nothing clicked yet.</p>

    <script>
        $("#greet-button").on("click", function () {
            $("#output").text("Real jQuery changed this real text.");
        });
    </script>
</body>
</html>
```

Clicking the real, rendered button inside the real native window
changes `#output`'s own real, visible text immediately — `$("#greet-
button")` found the real `<button>` element by its real `id`;
`.on("click", ...)` attached a real handler; inside it, `$("#output")`
found the real `<p>` element, and `.text(...)` replaced its real,
visible content — all without a single real page reload, since nothing
here ever left the page or made a network request.

### Discard

This real, throwaway page is disposable proof of jQuery's own two most
basic real capabilities; Arc 5's own real, permanent UI starts fresh in
Lesson 39.

### Mechanical Walkthrough

- `<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>`
  — **(a) first appearance** of loading a real, third-party JavaScript
  library from a real CDN — a real `<script src="...">` tag, ordinary
  HTML, used here for the first time in this series to bring in code
  this project didn't write.
- `$("#greet-button")` — **(a) first appearance** of `$()`, full
  treatment above; `"#greet-button"` — a real CSS ID selector, matching
  the element whose real `id` attribute is `greet-button`.
- `.on("click", function () { ... })` — **(a) first appearance**, full
  treatment above; the anonymous function passed to it — **(c) already
  basic**, ordinary JavaScript, assumed familiar per this series' own
  README.
- `$("#output").text("...")` — **(a) first appearance** of jQuery's own
  real `.text()` method: reads or, given an argument, sets a matched
  real element's own text content.

### CS Lens

jQuery's own `$()` selector engine is a real, direct application of
**CSS selectors as a query language against a real, live tree** — the
identical real syntax a stylesheet uses to target elements, repurposed
here to *find and manipulate* them from JavaScript instead of only
styling them.

### SE Lens

The real alternative not chosen: plain, "vanilla" JavaScript
(`document.getElementById("greet-button").addEventListener("click",
...)`), genuinely equivalent and requiring no external library at all.
jQuery's own real, historical value — smoothing over genuine, real
cross-browser inconsistencies that existed when it was first written —
is largely less load-bearing today than it once was; this project
chooses it anyway for one real, direct reason named in this lesson's
own Header: jQuery DataTables, Lesson 39's own real subject, is itself
built directly on jQuery and requires it as a real dependency,
regardless of whether plain JavaScript alone would otherwise suffice
for everything else in this arc.

## Concept Unit: `$.ajax()` — Calling the Real Backend From Inside `pywebview`

### The Problem

Every real capability this arc's own backend offers (Lessons 28–36) is
useless to this lesson's own real window until something inside that
window can actually make an HTTP request to it.

### Introduce the Concept in Isolation

A real, small addition, with Arc 4's own real backend already running
in a separate real terminal:

```html
<button id="load-button">Load Parts</button>
<pre id="result"></pre>

<script>
    $("#load-button").on("click", function () {
        $.ajax({
            url: "http://127.0.0.1:8000/parts",
            method: "GET",
            success: function (data) {
                $("#result").text(JSON.stringify(data, null, 2));
            },
            error: function () {
                $("#result").text("Request failed.");
            },
        });
    });
</script>
```

Clicking the real button, inside the real native `pywebview` window,
produces real, live data from Arc 4's own backend, rendered directly
onto the page:

```
[
  {
    "id": 1,
    "name": "Hammer",
    ...
  },
  ...
]
```

This is the identical real request `curl` has made throughout Arc 4 —
now issued from real JavaScript, running inside a real native window,
and correctly succeeding specifically because Lesson 36's own
`CORSMiddleware` already granted this exact real origin permission (a
`pywebview`-hosted local file's own real origin, distinct from
`http://127.0.0.1:8000` itself, the identical real Same-Origin concern
Lesson 36 proved directly).

### Discard

Nothing throwaway conceptually — this real request shape (`$.ajax` to
Arc 4's own backend) is reused directly, and made permanent, starting
Lesson 39; this specific `#load-button`/`#result` page is disposable.

### Mechanical Walkthrough

- `$.ajax({ url: "...", method: "GET", success: ..., error: ... })` —
  **(a) first appearance**, full treatment above.
- `success: function (data) { $("#result").text(JSON.stringify(data,
  null, 2)); }` — **(b) hard concept reappearing** for `$("#result")`/
  `.text()`, both already explained; `JSON.stringify(data, null, 2)` —
  **(a) first appearance** of a real, standard JavaScript function
  converting a real object back into readable JSON text, `2` requesting
  real, human-readable indentation.
- `error: function () { $("#result").text("Request failed."); }` —
  **(b) hard concept reappearing**, the identical already-explained
  `.text()` call, run instead when the real request fails.

### CS Lens

`$.ajax`'s own real `success`/`error` callbacks are a real instance of
**asynchronous, callback-based control flow**: the browser's own
JavaScript keeps running (the page stays responsive) while the real
network request is in flight, and the supplied function only runs once
a real response — success or failure — actually arrives, rather than
the whole page freezing until it does.

### SE Lens

The real, deliberate choice to reuse Arc 4's own already-real backend,
called with the identical URL `curl` has used throughout this series,
rather than inventing any new, `pywebview`-specific way to reach the
data: this is the concrete, provable payoff of Lesson 28's own original
architectural case — a real backend, reachable over ordinary HTTP,
serves a real browser-based UI exactly the same way it already served
every other real client in this series, with zero special-casing
required for `pywebview` specifically.

## Connect the pieces

Two real jQuery capabilities, proven independently: `$()`/`.on()`
proved real page content can change in response to a real user action,
entirely inside the browser; `$.ajax()` then proved that same real
window can reach Arc 4's own backend over genuine HTTP, receiving the
identical real JSON data every earlier client in this series has
already confirmed. Lesson 39 combines both for real: a real button
click that loads real backend data and renders it, properly, as a real
table.

## What breaks without this

Stop Arc 4's own backend process, then click `#load-button` again:

```
Request failed.
```

The real `error` callback fired — not `success`, and not a frozen,
unresponsive page. This is direct, real proof `$.ajax`'s own two-
callback shape correctly distinguishes "the request itself could not
even complete" (no real server listening at all) from Lesson 35's own
already-proven real `404`/`500` cases (a real server that *did*
respond, just not successfully) — a genuinely different real failure
category this lesson's own `error` callback exists specifically to
catch.

## Exercises

1. Reproduce this lesson's own real `$.ajax` proof yourself, then
   deliberately request a real, nonexistent path (`/nonexistent`) and
   confirm which callback fires — `success` or `error` — given that
   Lesson 29 already proved a real, unmatched route still returns a
   real, valid HTTP response (a `404`), not a connection failure.
2. Add a real `$.ajax` call using `method: "POST"`, sending a real new
   part to `POST /parts` (Lesson 33) with a real JSON body via `$.ajax`'s
   own `data`/`contentType` options — confirm the real new row exists
   afterward, independently, at the CLI.

## Definition of Done

- [ ] You changed real page content in response to a real button click,
      using `$()` and `.on()`.
- [ ] You made a real `$.ajax` request to Arc 4's own backend from
      inside a genuine `pywebview` window and rendered the real result.
- [ ] You stopped the backend and confirmed the real `error` callback
      fires instead of `success`.
- [ ] You completed both exercises, including reasoning through
      Exercise 1's own real distinction between a `404` and a genuine
      connection failure.

## Next

[Lesson 39 — Rendering the Backend's Data as a DataTable](lesson-39-rendering-the-backends-data-as-a-datatable.md)
replaces this lesson's own raw `JSON.stringify` output with a real,
sortable, searchable HTML table — jQuery DataTables, this arc's own
real reason for choosing jQuery in the first place.
