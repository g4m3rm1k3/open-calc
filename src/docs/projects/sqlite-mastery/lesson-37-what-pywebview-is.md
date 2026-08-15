# Lesson 37: What `pywebview` Is

**What you will build:** a real, genuine native window — not a browser
tab — showing a real, local HTML page, launched from five lines of
Python.

**What you need to know first:** [Lesson 36](lesson-36-cors.md) — this
arc's own real backend, already running and correctly configured; this
lesson's own window doesn't call it yet, but exists specifically to
host the real page that will, starting Lesson 39.

**Terms introduced in this lesson:**
- **`pywebview`** — a real, third-party Python library
  (`pip install pywebview`) that opens a genuine native OS window and
  renders real HTML/CSS/JavaScript inside it, using the operating
  system's own real, built-in web-rendering engine — not a bundled
  browser, and not a web server the user has to separately navigate to.
- **Desktop shell** — this lesson's own real window, considered as a
  wrapper around a real web page: the "shell" providing a real, native
  window frame, title bar, and process, around content that is
  genuinely ordinary HTML.

**Objects and methods used:**

**`webview.create_window()`**
- *What it is:* a real, top-level function in the `pywebview` package.
- *Implementation:* `webview.create_window(title, url_or_path)` —
  registers a real, new native window with the given title, to load the
  given real local file path or URL once shown; does not itself display
  anything yet.
- *Its use:* defining this lesson's own real, first window.

**`webview.start()`**
- *What it is:* a real, top-level function in the `pywebview` package.
- *Implementation:* `webview.start()` — actually opens every window
  registered with `create_window` and blocks, running the real, native
  event loop, until every window is closed.
- *Its use:* the real call that makes this lesson's own window actually
  appear and stay open.

---

## Concept Unit: A Real Native Window, Not a Browser Tab

### The Problem

Lesson 27 already proved a real browser can load and query
`pocket_hardware.db`'s own data, through a real backend — but Arc 5's
own real goal is a genuine **desktop application**, with its own real
window, icon, and process, not a page a user has to separately open a
browser and navigate to.

### Introduce the Concept in Isolation

A real, throwaway local HTML file:

```html
<!-- hello.html -->
<!DOCTYPE html>
<html>
<head><title>Hello</title></head>
<body>
    <h1>Pocket Hardware</h1>
    <p>This is a real native window, not a browser tab.</p>
</body>
</html>
```

A real, five-line Python script:

```python
import webview

webview.create_window("Pocket Hardware", "hello.html")
webview.start()
```

```
$ python hello_window.py
```

A real, genuine native window opens — with its own real title bar
reading "Pocket Hardware" (not a browser's own chrome, no address bar,
no browser tabs), showing `hello.html`'s own real, rendered content.
Checking a real, running process list (Task Manager on Windows,
`ps aux` on macOS/Linux) while this window is open shows the real
Python process itself, not a separate, independent browser process —
`pywebview` uses the operating system's own already-installed
rendering engine directly (Edge WebView2 on Windows, WebKit on macOS,
GTK WebKit on Linux), rather than bundling and launching a real,
separate browser application.

### Discard

`hello.html` and `hello_window.py` are real, disposable proof — Arc 5's
own real, permanent UI starts fresh in Lesson 39, built specifically to
call this arc's own real backend.

### Mechanical Walkthrough

- `import webview` — **(a) first appearance**, importing this lesson's
  own real library.
- `webview.create_window("Pocket Hardware", "hello.html")` — **(a)
  first appearance**, full treatment above.
- `webview.start()` — **(a) first appearance**, full treatment above.

### CS Lens

`pywebview` is a real instance of **wrapping a web view as a native
component** — the same underlying idea Electron (a real, much heavier,
much more common alternative) provides by bundling an entire real
Chromium browser inside every app; `pywebview`'s own real, deliberate
difference is using whatever web-rendering engine the operating system
already has installed, rather than shipping a redundant, separate copy
of one.

Also recognized in: a mobile app's own `WebView` component (Android)
or `WKWebView` (iOS), embedding real web content inside a genuinely
native mobile app shell; a real browser extension's own popup, which is
frequently just an ordinary HTML page rendered inside a small, native
window frame.

### SE Lens

The real, deliberate tradeoff against Electron, named directly: a
`pywebview` app's own real download size stays small (no bundled
browser engine, often single-digit megabytes once packaged, versus
Electron's own real, typically 100+ megabyte footprint) — at a real,
honest cost: the exact rendering engine, and therefore exact web-
platform feature support, genuinely differs across a user's own
operating system (Edge WebView2's own real feature set is not
identical to macOS's own WebKit), a real cross-platform consistency
concern Electron's own bundled-engine approach avoids by shipping the
identical browser everywhere. This project accepts that real tradeoff
deliberately, favoring `pywebview`'s own smaller footprint for a
genuinely simple UI (Lesson 39 onward) unlikely to depend on any
browser-specific edge-case behavior.

## Connect the pieces

One real, five-line Python script opened one real, genuine native
window, hosting one real, local HTML file — proven, by inspecting the
real running process list, to be a real Python process using the
operating system's own already-installed rendering engine directly,
not a separate, bundled browser. This is Arc 5's own real foundation:
every later lesson in this arc replaces `hello.html`'s own content with
a real UI that calls Arc 4's own backend.

## What breaks without this

Call `webview.create_window(...)` without ever calling
`webview.start()`:

```python
import webview

webview.create_window("Pocket Hardware", "hello.html")
```

```
$ python no_start.py
$
```

The real script runs to completion — and exits — with no real window
ever appearing at all. `create_window` only *registers* a real window's
own configuration; `webview.start()` is what actually opens it and runs
the real, native event loop keeping the whole process alive. This is
direct, provable proof the two calls have genuinely separate real jobs,
not one redundant with the other.

## Exercises

1. Create a real, second window with a second `create_window` call,
   before the single `webview.start()` — confirm both real windows open
   together, and that closing one leaves the other running until it,
   too, is closed.
2. Replace `hello.html`'s own content with a real, small piece of
   inline JavaScript (a `<script>` tag calling `alert("real JS runs
   here")`) — confirm it runs correctly inside the real native window,
   direct proof this is a genuine, JavaScript-capable web-rendering
   engine, not a static HTML-only viewer.

## Definition of Done

- [ ] You opened a real, native `pywebview` window showing real, local
      HTML content.
- [ ] You confirmed, via your operating system's own real process list,
      that no separate browser process was launched.
- [ ] You reproduced the real "window never appears" case from omitting
      `webview.start()` and understand the real division of labor
      between it and `create_window`.
- [ ] You completed both exercises.

## Next

[Lesson 38 — jQuery Fundamentals](lesson-38-jquery-fundamentals.md)
gives this lesson's own real window something genuinely useful to
show — starting with a new client-side library this series hasn't used
before.
