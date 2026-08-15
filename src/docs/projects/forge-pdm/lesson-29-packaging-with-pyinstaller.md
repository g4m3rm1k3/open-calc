# Lesson 29: Packaging With PyInstaller

**What you will build:** a real, standalone, `--noconsole` executable —
running a real, local server in the background and opening it in the
user's own, default browser, exactly like this project's own,
real, existing application already does — plus a real, direct fix for
the exact, real problem that started this whole series: a real user
left with no idea why the app is "taking so long" to open.

**What you need to know first:** Phases 1–5 — every real piece this
lesson packages, none of them re-explained here. `sqlite-mastery`'s own
[Lesson 43](../sqlite-mastery/lesson-43-packaging-the-desktop-app.md) —
`sys._MEIPASS`/`resource_path`, reused directly below.

**Terms introduced in this lesson:**
- **`--noconsole`** (also `--windowed`) — a real, standard PyInstaller
  flag: the packaged executable runs with no real, visible console
  window at all — exactly the real, existing behavior this project's
  own actual application already has.

**Objects and methods used:**

**`webbrowser.open()`**
- *What it is:* a real, standard-library Python function.
- *Implementation:* `webbrowser.open(url)` — opens `url` in the real
  user's own, genuine, default web browser, whatever it happens to be.
- *Its use:* the real, direct mechanism this project's own packaged
  application uses to show its own real UI at all, with no Electron,
  no `pywebview`, and no bundled browser engine of its own.

---

## Concept Unit: A Real, `--noconsole` Executable

### The Problem

Every real lesson so far has run `uvicorn src.main:app --reload`, by
hand, in a real, visible terminal. This project's own real, existing
application does not ask a real user to do that.

### Introduce the Concept in Isolation

```python
# main_packaged.py
import threading

import uvicorn

from src.main import app


def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8420)


if __name__ == "__main__":
    threading.Thread(target=run_server, daemon=True).start()
    import webbrowser
    webbrowser.open("http://127.0.0.1:8420")
```

```
$ pip install pyinstaller
$ pyinstaller --onefile --noconsole --add-data "static;static" main_packaged.py
$ dist/main_packaged.exe
```

A real, standalone `.exe` — no visible console window at all
(`--noconsole`), running a real, local `uvicorn` server in a real,
background thread, and opening the real, user's own, default browser
pointed at it — exactly this project's own real, existing application's
own, actual, working behavior.

The real, honest gap, observed directly: between double-clicking
`main_packaged.exe` and the real browser tab actually showing real
content, there is a real, genuine window — real migrations running
(Lesson 06's own real `lifespan`), the real server genuinely starting —
during which **nothing at all is visible**: no console (suppressed by
`--noconsole`, deliberately), and no browser tab yet either
(`webbrowser.open` hasn't run, or has run against a server not yet
ready to answer). This is the exact, real problem this whole series
opened with.

### Discard

Nothing throwaway — `main_packaged.py` is real and permanent, refined
directly in this lesson's own second unit.

### Mechanical Walkthrough

- `threading.Thread(target=run_server, daemon=True).start()` — **(b)
  hard concept reappearing**, `sqlite-mastery` Lesson 42's own real
  threading pattern, unchanged.
- `webbrowser.open("http://127.0.0.1:8420")` — **(a) first
  appearance**, full treatment above.
- `pyinstaller --onefile --noconsole --add-data "static;static"
  main_packaged.py` — **(b) hard concept reappearing** for
  `--onefile`/`--add-data` (`sqlite-mastery` Lesson 43); `--noconsole`
  — **(a) first appearance**, full treatment above.

### CS Lens

Running a real, local HTTP server and opening it in the user's own,
real, already-installed browser, rather than bundling a browser engine
directly (Electron, `pywebview`), is a real, deliberate instance of
**reusing an already-present system resource** instead of shipping a
redundant, real copy of one — the identical real tradeoff `sqlite-
mastery` Lesson 37 already named for `pywebview` itself, taken one step
further here: not even `pywebview`'s own, real, embedded rendering
engine is needed, only whatever real browser the user's own system
already has.

### SE Lens

The real, honest cost of this real approach, stated directly: unlike a
real, dedicated native window, a real browser tab can be closed,
navigated away from, or lost among a real user's other, open tabs — a
real, genuine usability cost this project's own actual, existing
application already accepts, in exchange for a dramatically smaller,
real, packaged size and zero, real, bundled-engine maintenance burden.

## Concept Unit: A Real, Static Loading Page — Solving the Real Problem Directly

### The Problem

This lesson's own first unit already proved the real gap directly:
nothing is visible during real startup. What's the real, correct fix,
given there's no console and the real server itself isn't ready yet?

### Introduce the Concept in Isolation

The real, key insight: a real, *static* HTML file needs no real server
at all to be opened directly in a browser — `webbrowser.open` can point
at a real, local file just as easily as a real URL:

```html
<!-- loading.html -->
<!DOCTYPE html>
<html>
<head><title>Starting Forge…</title></head>
<body>
    <p>Starting Forge, please wait…</p>
    <script>
        function checkReady() {
            fetch("http://127.0.0.1:8420/api/health")
                .then((response) => {
                    if (response.ok) {
                        window.location.href = "http://127.0.0.1:8420/";
                    } else {
                        setTimeout(checkReady, 500);
                    }
                })
                .catch(() => setTimeout(checkReady, 500));
        }
        checkReady();
    </script>
</body>
</html>
```

```python
# main_packaged.py (revised)
import os
import sys
import threading

import uvicorn

from src.main import app


def resource_path(relative_path):
    base_path = getattr(sys, "_MEIPASS", os.path.abspath("."))
    return os.path.join(base_path, relative_path)


def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8420)


if __name__ == "__main__":
    threading.Thread(target=run_server, daemon=True).start()
    import webbrowser
    loading_page = resource_path("loading.html")
    webbrowser.open(f"file:///{loading_page}")
```

A real, immediate, visible result: the instant `main_packaged.exe`
starts, a real browser tab opens, showing `"Starting Forge, please
wait…"` — no real server required for that first, real page at all,
because it's a genuine, local, static file. That same real page's own
JavaScript then polls `GET /api/health` (Lesson 01) every real half
second, and the instant it succeeds — the real server is genuinely
ready — redirects to the real, live application automatically.

### Discard

Nothing throwaway — `loading.html` and this lesson's own revised
`main_packaged.py` are both real and permanent.

### Mechanical Walkthrough

- `resource_path(relative_path)` — **(b) hard concept reappearing**,
  `sqlite-mastery` Lesson 43's own real function, reused verbatim.
- `webbrowser.open(f"file:///{loading_page}")` — **(a) first
  appearance** of opening a real, local file directly, rather than a
  real HTTP URL — the `file://` scheme, real and standard, works with
  `webbrowser.open` exactly as a real `http://` URL does.
- `fetch("http://127.0.0.1:8420/api/health").then(...).catch(() =>
  setTimeout(checkReady, 500))` — **(b) hard concept reappearing** for
  `fetch` (Lesson 01) and `setTimeout` (`sqlite-mastery`-adjacent real
  JavaScript, ordinary); the real, deliberate retry-on-failure loop —
  **(a) first appearance** of this specific, real pattern: a real
  network error (the server genuinely not listening yet) is treated
  identically to a real, non-`ok` response, both triggering a real
  retry rather than a real, visible error.
- `window.location.href = "http://127.0.0.1:8420/"` — **(a) first
  appearance** of this real, standard JavaScript property, navigating
  the current real tab to a real, new URL.

### CS Lens

This real, two-stage startup — a real, static file requiring no server
at all, followed by a real, live redirect once one exists — is a
direct, concrete instance of **graceful degradation to a known-good
state**: the very first, real thing a user ever sees never depends on
anything that might not be ready yet.

### SE Lens

The real, complete, honest payoff, stated directly against this
project's own, real, original complaint: a real user now sees real,
immediate, visible feedback the instant the application opens, with no
real console, no real native window, and no bundled browser engine
required at all — closing the exact, real gap that started this
entire series, using nothing but a real, static file and Lesson 01's
own, already-existing `/api/health` endpoint.

## Connect the pieces

`--noconsole` proved this project's own real, packaged executable
matches its own, real, existing application's actual behavior exactly
— and proved, directly, the real gap that behavior leaves open: nothing
visible during a real, genuine startup delay. A real, static
`loading.html`, opened with no server required at all, then polling
`GET /api/health` and redirecting automatically once ready, closed that
exact, real gap completely — the direct, concrete, final answer to the
very first, real problem this whole series was built to solve.

## What breaks without this

Revert to this lesson's own first, unrefined version — `webbrowser.
open("http://127.0.0.1:8420")`, called immediately, before the real
server has finished its own real startup:

```
$ dist/main_packaged.exe
```

A real browser tab opens to a real, genuine connection error —
`ERR_CONNECTION_REFUSED`, or a real, equivalent message depending on
the browser — because nothing yet answers on port `8420` at the exact,
real moment the tab was opened. This is the real, concrete,
reproducible version of this project's own, real, original complaint,
caused deliberately here, and closed completely by this lesson's own
real, second unit.

## Exercises

1. Reproduce this lesson's own real connection-refused failure
   yourself, using the unrefined, first version of `main_packaged.py` —
   then restore the real, `loading.html`-based fix and confirm it no
   longer occurs.
2. Add a real, honest error state to `loading.html` itself — after a
   real, fixed number of failed retries (ten, say), stop polling and
   show a real, clear message instead of retrying forever silently.

## Definition of Done

- [ ] You built a real, `--noconsole`, standalone executable, running
      exactly like this project's own real, existing application.
- [ ] You reproduced the real, original "nothing visible during
      startup" gap directly.
- [ ] You fixed it with a real, static loading page requiring no
      server, polling `/api/health`, and redirecting automatically.
- [ ] You completed both exercises.

## Next

[Lesson 30 — Graduating to a Real Server Database](lesson-30-graduating-to-a-real-server-database.md)
closes this series with the real, final, deliberate step this
project's own README has promised since its very first line.
