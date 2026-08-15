# Lesson 56: Loading States in `pywebview`

**What you will build:** a real, immediately-visible loading page,
shown the instant this project's own native window opens, swapped for
the real UI only once a real, deliberately slow startup task has
genuinely finished — closing a real, common `pywebview` gap: a window
that opens instantly but shows nothing useful while real work happens
behind it.

**What you need to know first:** [Lesson 37](lesson-37-what-pywebview-is.md)
— `create_window`/`webview.start()`'s own real, basic shape. [Lesson 42](lesson-42-running-the-backend-and-pywebview-together.md)
— its own real race condition and `wait_for_backend` fix, reused
directly here, now made *visible* to a real user instead of merely
correct.

**Terms introduced in this lesson:** none new — `Window.load_url()` and
`webview.start()`'s own real, optional callback argument are this
lesson's own subject, covered as Objects and methods below.

**Objects and methods used:**

**`webview.start(func, args)`**
- *What it is:* the identical real `webview.start()` from Lesson 37,
  given its own real, optional first argument full treatment for the
  first time.
- *Implementation:* `webview.start(func)` — once every real window is
  open and the native event loop is running, `func` is called
  automatically, in a real, separate thread, letting real, further
  setup work happen *after* a real window already exists on screen,
  rather than before one is created.
- *Its use:* running this lesson's own slow, real startup work only
  once there's already something real on screen for a user to look at.

**`Window.load_url()`**
- *What it is:* a real method on the `Window` object `create_window`
  returns (Lesson 37 discarded this return value; this lesson keeps
  it).
- *Implementation:* `window.load_url(path)` — replaces the real,
  currently-displayed page inside an already-open window with a
  genuinely different one, with no new window created and no flicker
  of a blank, unstyled page in between.
- *Its use:* swapping this lesson's own real loading page for the real,
  finished UI.

---

## Concept Unit: A Real Loading Page, Shown Immediately

### The Problem

Lesson 42's own `wait_for_backend` is real and correct — it stops the
window from opening *before* the backend is ready. It does not solve a
real, related, and genuinely more common problem: once real, further
work happens *after* the window is already open — building a real,
joined dataset from more than one source database, say — a `pywebview`
window shows nothing at all to explain the real delay, because nothing
in Lesson 42's own script ever gave it anything to show.

### Introduce the Concept in Isolation

A real, deliberately slow startup task, and a real, immediately-visible
page to cover it:

```html
<!-- loading.html -->
<!DOCTYPE html>
<html>
<body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
    <p>Loading your data — this can take a moment on a large database…</p>
</body>
</html>
```

```python
import time
import webview


def slow_startup(window):
    time.sleep(3)  # stands in for a real, slow join-and-build step
    window.load_url("index.html")


window = webview.create_window("Pocket Hardware", "loading.html")
webview.start(slow_startup, window)
```

```
$ python app.py
```

The real, native window opens **immediately**, showing `loading.html`'s
own real, visible message — not a blank, frozen window, and not a
delayed appearance while `slow_startup` runs. Only once the real,
three-second stand-in for slow work finishes does `window.load_url
("index.html")` swap the same, already-open window over to the real
UI, with no second window ever created and no visible flicker between
the two real pages.

### Discard

`loading.html`'s own exact three-second `time.sleep` is disposable —
real, permanent code replaces it with this project's own actual slow
step (Lesson 58's own live, multi-database join, say) in the very next
concept unit.

### Mechanical Walkthrough

- `window = webview.create_window("Pocket Hardware", "loading.html")` —
  **(b) hard concept reappearing**, Lesson 37's own real call, its
  return value — a real `Window` object — kept this time instead of
  discarded.
- `webview.start(slow_startup, window)` — **(a) first appearance** of
  `webview.start`'s own real, optional callback form, full treatment
  above; `window` passed as `slow_startup`'s own real argument — **(c)
  already basic**, ordinary Python argument-passing.
- `def slow_startup(window): time.sleep(3); window.load_url
  ("index.html")` — **(a) first appearance** of `Window.load_url`, full
  treatment above; `time.sleep(3)` — **(b) hard concept reappearing**,
  already-used standard-library timing.

### CS Lens

This is a real, direct instance of **perceived-performance design**: the
real, underlying work (Lesson 58's own multi-database join) takes
exactly as long either way — nothing here makes the real computation
itself faster. What changes is whether a real user has *any* real
feedback during that time, the same underlying principle behind a real
progress bar, a real "Loading…" spinner on any web page, or an
operating system's own real splash screen shown while the rest of a
program initializes.

Also recognized in: a video game's own loading screen masking real
asset-loading time, a real web app's own skeleton-screen placeholder
shown before real data arrives, an elevator's own real, deliberately
placed mirror — genuinely not making the wait shorter, only making it
feel less like nothing is happening.

### SE Lens

The real, deliberate reason this lesson runs `slow_startup` through
`webview.start`'s own real callback, rather than Lesson 42's own
original pattern (a background thread started *before*
`webview.create_window`): calling `window.load_url` requires a real,
already-existing, already-initialized `Window` object — attempting it
from a thread that might run before the native GUI toolkit has finished
its own real setup is a genuine, real source of platform-dependent
failures. `webview.start`'s own callback is guaranteed to run only
after the real window truly exists, making `window.load_url` safe to
call the moment `slow_startup` itself begins.

## Concept Unit: Swapping in the Real, Finished UI

### The Problem

A real, three-second `sleep` proved the mechanism. This project's own
actual slow step — building a real, joined dataset, or waiting on a
real backend exactly like Lesson 42 already did — needs to trigger the
identical real swap.

### Introduce the Concept in Isolation

Combining this lesson's own real mechanism with Lesson 42's own real
`wait_for_backend`:

```python
import threading
import uvicorn
import webview


def run_backend():
    uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="warning")


def wait_for_backend(url, timeout=5):
    import time
    import urllib.request

    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=0.5)
            return True
        except Exception:
            time.sleep(0.1)
    return False


def startup(window):
    threading.Thread(target=run_backend, daemon=True).start()
    if not wait_for_backend("http://127.0.0.1:8000/"):
        window.load_url("startup_failed.html")
        return
    window.load_url("index.html")


if __name__ == "__main__":
    window = webview.create_window("Pocket Hardware", "loading.html")
    webview.start(startup, window)
```

```
$ python app.py
```

The real, native window now opens instantly with a real, visible
loading message, starts the backend in a real, separate thread, waits
for it — the identical real, proven `wait_for_backend` loop from Lesson
42 — and only then swaps to the real, finished `index.html`. A real,
genuine backend failure (Lesson 42's own real, artificial-delay
exercise, reused here as a real test) now shows a real, honest
`startup_failed.html` instead of Lesson 42's own original, silent
`raise RuntimeError` — a real user sees *something*, either way,
rather than a window that either freezes or crashes with no visible
explanation at all.

### Discard

Nothing throwaway — `startup`, combining threading, `wait_for_backend`,
and `load_url`, is real, permanent, and replaces both Lesson 42's own
original `app.py` and this lesson's own first, disposable
`time.sleep`-based version.

### Mechanical Walkthrough

- `def startup(window): threading.Thread(...).start(); if not
  wait_for_backend(...): window.load_url("startup_failed.html");
  return; window.load_url("index.html")` — **(b) hard concept
  reappearing** throughout: `threading.Thread`/`wait_for_backend`
  (Lesson 42), `window.load_url` (this lesson's own first unit); the
  real, new fact is combining all three into one real, correct startup
  sequence, running entirely after the window already exists.

### CS Lens

`startup`'s own real, two-outcome branch — success loads `index.html`,
failure loads a real, different, honest page — is a real, minimal
instance of **explicit failure-path UI**: every real, anticipated
outcome (Lesson 35's own real `404`/`500` distinction, applied here to
a startup sequence instead of an HTTP endpoint) gets its own real,
visible result, rather than one real path being silently assumed to be
the only one that matters.

### SE Lens

The real, honest, remaining limit this lesson leaves open: `loading.
html`'s own real message is static — it cannot report real, granular
progress ("joining 3 of 7 databases…") without a real, further
mechanism to push updates into an already-loaded page. That real
capability — `Window.evaluate_js()`, calling real JavaScript inside the
currently-loaded page directly from Python — is exactly the tool
Lesson 59's own live-reload feature reaches for, later in this arc,
once real, granular, in-place updates (not just a one-time page swap)
are actually needed.

## Connect the pieces

One real, native window, opening instantly with a real, visible
loading message instead of showing nothing at all — `webview.start`'s
own real callback form ran Lesson 42's own already-proven backend
startup and `wait_for_backend` loop only after the window genuinely
existed, and `window.load_url` swapped in the real, finished UI (or a
real, honest failure page) the instant that real work resolved either
way.

## What breaks without this

Call `window.load_url` from a real, separate thread started *before*
`webview.start()`, reproducing Lesson 42's own original real pattern
directly:

```python
window = webview.create_window("Pocket Hardware", "loading.html")
threading.Thread(target=lambda: window.load_url("index.html")).start()
webview.start()
```

On at least some real platforms, this genuinely fails or behaves
unpredictably — `window.load_url` is called against a `Window` object
that exists as a real Python object, but whose underlying real, native
GUI handle may not be initialized yet, since `webview.start()` itself
is what performs that real, platform-specific setup. This is direct,
concrete proof of why this lesson's own callback form —
`webview.start(startup, window)` — isn't a stylistic preference: it's
the one real, guaranteed-safe place to call `Window` methods from.

## Exercises

1. Reproduce this lesson's own real `startup_failed.html` path by
   deliberately breaking `wait_for_backend`'s own URL (a real, wrong
   port), and confirm the real window shows an honest failure message
   instead of silently hanging or crashing.
2. Add a real, second `window.load_url` call partway through
   `startup`, loading a real, intermediate page ("Starting backend…")
   before the final swap to `loading.html`'s own successor — confirm a
   real user sees two distinct, real, sequential messages rather than
   one static one for the whole real wait.

## Definition of Done

- [ ] You confirmed the real window opens instantly with a visible
      loading message, not a blank or frozen one.
- [ ] You combined this lesson's own real swap mechanism with Lesson
      42's own `wait_for_backend`, confirming a real, successful swap
      to `index.html`.
- [ ] You reproduced a real backend-startup failure and confirmed a
      real, honest failure page renders instead of a silent hang.
- [ ] You completed both exercises.

## Next

[Lesson 57 — Why Your Data Looks Stale](lesson-57-why-your-data-looks-stale.md)
covers a real, different, and genuinely more common complaint about the
exact same kind of app: the real UI loads correctly, on time — but
shows old data anyway.
