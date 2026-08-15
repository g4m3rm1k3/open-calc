# Lesson 42: Running the Backend and `pywebview` Together

**What you will build:** one real, single `python app.py` command that
starts both Arc 4's own backend and Arc 5's own window together — and
direct, honest proof of a real, genuine race condition this
combination creates, plus the real fix for it.

**What you need to know first:** [Lesson 37](lesson-37-what-pywebview-is.md)
— `webview.start()`'s own real, blocking behavior. [Lesson 29](lesson-29-fastapi-project-setup-and-the-first-endpoint.md)
— `uvicorn`, started here from inside a real Python script instead of a
separate terminal command for the first time.

**Terms introduced in this lesson:**
- **Race condition** — a real, genuine bug class: two or more real
  operations happen concurrently, and the correctness of the whole
  system depends on their real, relative timing — which is not
  guaranteed, and can differ from one real run to the next.

**Objects and methods used:**

**`threading.Thread`**
- *What it is:* a real, standard-library Python class.
- *Implementation:* `threading.Thread(target=function,
  daemon=True).start()` — runs `function` concurrently, in a real,
  separate thread of the same process; `daemon=True` means this real
  thread is automatically killed the instant the main program exits,
  rather than keeping the whole process alive on its own.
- *Its use:* running `uvicorn` (Arc 4's own backend) inside the same
  real process as `webview.start()`, without either one blocking the
  other.

**`uvicorn.run()`**
- *What it is:* a real, callable, in-process alternative to the
  `uvicorn main:app` CLI command (Lesson 29) used throughout Arc 4.
- *Implementation:* `uvicorn.run("main:app", host=..., port=...)` —
  starts the identical real server, from inside already-running Python
  code, rather than as a separate command-line invocation.
- *Its use:* letting one real script launch the backend itself, instead
  of requiring a user to open two separate terminals by hand.

---

## Concept Unit: One Script, Two Real Processes' Worth of Work

### The Problem

Every real lesson in Arc 5 so far has quietly assumed Arc 4's own
backend is already running, started by hand, in a separate real
terminal. A real, finished desktop application cannot ask its own user
to do that.

### Introduce the Concept in Isolation

```python
# app.py
import threading
import uvicorn
import webview


def run_backend():
    uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="warning")


if __name__ == "__main__":
    threading.Thread(target=run_backend, daemon=True).start()
    webview.create_window("Pocket Hardware", "index.html")
    webview.start()
```

```
$ python app.py
```

One real command, one real process, and both real halves of this
project start together: Arc 4's own backend, running inside a real,
separate thread, and Arc 5's own real, native window, opened by the
main thread's own `webview.start()` — the identical real UI Lesson
39–41 already built, now launched with no separate terminal required.

### Discard

Nothing throwaway — `app.py` is this project's own real, permanent
entry point from here on, replacing the two-terminal workflow every
earlier Arc 5 lesson has used.

### Mechanical Walkthrough

- `def run_backend(): uvicorn.run("main:app", host="127.0.0.1",
  port=8000, log_level="warning")` — **(a) first appearance** of
  `uvicorn.run()`, full treatment above; `log_level="warning"` — a
  real, deliberate reduction of `uvicorn`'s own default, verbose
  request-by-request logging, since this arc's own real, native window
  has no visible terminal for a real end user to read it in anyway.
- `threading.Thread(target=run_backend, daemon=True).start()` — **(a)
  first appearance**, full treatment above.
- `webview.create_window(...)` / `webview.start()` — **(b) hard
  concept reappearing**, Lesson 37's own real calls, unchanged.
- `if __name__ == "__main__":` — **(a) first appearance** of this real,
  standard Python idiom: the code inside only runs when `app.py` is
  executed directly, not if it were ever imported as a module elsewhere
  — genuinely new to this series, ordinary Python convention.

### CS Lens

Running `uvicorn` in a real, separate thread while `webview.start()`
blocks the main one is a real, direct instance of **concurrency within
a single process**: two real, independent pieces of work (serving HTTP
requests, running a native window's own event loop) progress at
seemingly the same real time, sharing the same real Python process and
memory space, without either one being rewritten to explicitly
cooperate with the other.

### SE Lens

The real alternative not chosen: `webview.start()` in the main thread
and a real, second `python -m uvicorn main:app` process, started
separately by the application itself (via Python's own `subprocess`
module) rather than a thread within the same process. Both are real,
valid designs; this lesson's own threading approach is simpler for a
project this size — one real process to package (Lesson 43's own
subject) and monitor, rather than two — at the real, honest cost this
lesson's own next unit proves directly: nothing about starting a thread
guarantees the work inside it has actually *finished* by the time the
next line of code runs.

## Concept Unit: A Real Race Condition, and the Real Fix

### The Problem

`threading.Thread(...).start()` returns *immediately* — it does not
wait for `run_backend` to actually finish starting `uvicorn` before the
next line, `webview.create_window(...)`, runs. Does that matter?

### Introduce the Concept in Isolation

Running `app.py`, exactly as written above, on a real machine where
`uvicorn`'s own real startup happens to take slightly longer than
`pywebview`'s own real window creation and first page load: the real
native window opens, `index.html` loads, and its own real `$.ajax`
call to `/parts/datatable` (Lesson 40) fails — the real browser console
shows a genuine connection error, because the backend thread hadn't
finished binding port `8000` yet at the exact real moment the page's
own JavaScript tried to reach it.

This is a genuine **race condition** — not a mistake in any single line
of code, but a real, timing-dependent bug: on a faster machine, or a
machine where the OS happens to schedule the backend thread slightly
earlier, this exact same code might work correctly every time,
making the bug genuinely easy to miss during casual testing and
genuinely frustrating to reproduce reliably.

The real, correct fix — wait, provably, until the backend is really
ready, before ever creating the window:

```python
import threading
import time
import urllib.request
import uvicorn
import webview


def run_backend():
    uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="warning")


def wait_for_backend(url, timeout=5):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=0.5)
            return True
        except Exception:
            time.sleep(0.1)
    return False


if __name__ == "__main__":
    threading.Thread(target=run_backend, daemon=True).start()
    if not wait_for_backend("http://127.0.0.1:8000/"):
        raise RuntimeError("Backend did not start in time")
    webview.create_window("Pocket Hardware", "index.html")
    webview.start()
```

`wait_for_backend` polls Lesson 29's own real, original `/` endpoint
directly, in a real, short loop, until it genuinely responds — proving,
not assuming, the backend is ready — before `webview.create_window` is
ever called.

### Discard

Nothing throwaway — `wait_for_backend` is a real, permanent, small
addition to `app.py`.

### Mechanical Walkthrough

- `def wait_for_backend(url, timeout=5): deadline = time.time() +
  timeout` — **(a) first appearance** of a real, standard Python
  polling-with-timeout pattern; `time.time()` — **(c) already basic**,
  standard-library timekeeping.
- `urllib.request.urlopen(url, timeout=0.5)` — **(a) first appearance**
  of Python's own real, standard-library HTTP client — deliberately
  used here instead of a third-party library, since this is a real,
  minimal readiness check, not application logic.
- `except Exception: time.sleep(0.1)` — **(a) first appearance** of
  real, deliberate exception suppression, appropriate specifically here
  because *any* real failure (connection refused, timeout) means only
  one honest thing — "not ready yet, try again shortly" — not a real
  error worth distinguishing further.
- `if not wait_for_backend(...): raise RuntimeError(...)` — **(c)
  already basic**, ordinary Python; a real, deliberate hard failure
  rather than silently proceeding to open a real window against a
  backend that may never actually start.

### CS Lens

`wait_for_backend`'s own real polling loop is a direct, minimal
instance of **synchronization**: making one real, concurrent operation
(opening the window) correctly wait for another (the backend becoming
ready) to reach a real, known state, rather than merely assuming
enough real time has passed — the same underlying problem real
operating systems solve with locks, semaphores, and condition
variables, solved here with the simplest real tool that correctly
fits this project's own genuinely small scale.

### SE Lens

The real alternative not chosen: `time.sleep(2)` — a real, fixed delay,
guessed to be "probably long enough." That alternative has a real,
honest flaw this lesson's own polling loop avoids entirely: it's either
wastefully slow on a real, fast machine where the backend was ready in
milliseconds, or still genuinely too short on a real, slow or heavily-
loaded one — a guess, not a proof. `wait_for_backend` instead asks the
real, actual question ("is the backend answering yet?") directly and
repeatedly, correct regardless of how long starting `uvicorn` actually
takes on any given real run.

## Connect the pieces

One real script, `app.py`, now starts this entire project with a
single real command — `uvicorn`, running in a real, separate daemon
thread, and `webview.start()`, blocking the main one. This lesson's own
second unit then proved that combination alone is not enough: a real,
genuine race condition can leave the real window open before the real
backend is ready, fixed correctly by `wait_for_backend`'s own real,
provable polling loop, rather than a real, unproven guess at timing.

## What breaks without this

Deliberately slow the backend's own real startup, to make the race
condition this lesson proved reproducible on demand — add a real,
artificial delay inside `run_backend`, before `uvicorn.run` itself:

```python
def run_backend():
    time.sleep(2)
    uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="warning")
```

Running `app.py` with this real, deliberate delay and *without*
`wait_for_backend` reproduces this lesson's own race condition
reliably, every time: the real window opens instantly, and the real
first `$.ajax` request genuinely fails, visible directly in the browser
console. Restoring `wait_for_backend` (with the artificial delay still
in place) makes the real window correctly wait the full two real
seconds before ever appearing — proof the fix works specifically
*because* it waits for a real, observed fact, not a fixed guess that
happened to be long enough by chance.

## Exercises

1. Reproduce this lesson's own real, deliberately-reproducible race
   condition using the artificial `time.sleep(2)` delay, first without
   `wait_for_backend`, then with it — confirm the real, different
   outcome each time.
2. Modify `wait_for_backend` to print a real, honest status message
   ("Waiting for backend...") to the console while polling, so a real
   user watching this project's own real terminal output (even though
   the native window itself shows nothing during this wait) has some
   real, visible sign the application is starting rather than frozen.

## Definition of Done

- [ ] You ran the entire project — backend and window both — from one
      real `python app.py` command.
- [ ] You reproduced the real race condition on demand, using a
      deliberate artificial delay.
- [ ] You fixed it with `wait_for_backend` and confirmed the real
      window now correctly waits for a genuine, observed ready state.
- [ ] You completed both exercises.

## Next

[Lesson 43 — Packaging the Desktop App](lesson-43-packaging-the-desktop-app.md)
closes this arc by turning `app.py` into a real, standalone executable
— something a real user can run without installing Python at all.
