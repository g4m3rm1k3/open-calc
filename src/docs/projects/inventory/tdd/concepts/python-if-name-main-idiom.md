# Concept: The `if __name__ == "__main__":` Idiom

**What you'll understand by the end:** how to make a file's top-level code run only when executed directly, never when imported.

**Prerequisites:** `python-dunder-name.md`.

## Setup

Python 3, no packages needed. Two files in the same folder.

## The Problem

Code sitting at a file's top level (not inside a function) runs the instant that file loads — whether it was run directly or merely imported by something else. Sometimes that's wanted (defining functions, setting up constants); sometimes it isn't (starting a server, running a full program) — a way to distinguish the two cases is needed.

## The Isolated Example

`worker.py`:
```python
def do_work():
    print("doing the actual work")

if __name__ == "__main__":
    do_work()
```

`caller.py`, same folder:
```python
import worker
print("caller.py finished importing worker — nothing above printed")
```

**Real output, `python worker.py`:**
```
doing the actual work
```

**Real output, `python caller.py`:**
```
caller.py finished importing worker — nothing above printed
```

**What this proves:** `do_work()` ran when `worker.py` was executed directly, but merely *importing* `worker` from `caller.py` did not run it — the `if` guard suppressed it, because `worker`'s `__name__` was `"worker"`, not `"__main__"`, in that second case.

## Mechanical Walkthrough

- `if __name__ == "__main__":` is an ordinary `if` comparing `__name__` (see `python-dunder-name.md`) against the literal string `"__main__"`.
- The indented block underneath only executes when that comparison is true — i.e. only when this exact file was the one run directly.

## CS Lens

This is a **module entry-point guard** — separating "code that defines what this module offers" from "code that only makes sense when this module is the one being executed," using the language's own reflective self-knowledge (`__name__`) rather than a separate configuration mechanism.

Also recognized in: every language with an import system that also allows direct execution of the same file — the same underlying need "am I the entry point" recurs anywhere a file can serve both roles.

## SE Lens

Without this guard, any top-level code (e.g. starting a server, running a full computation) executes the instant the file is imported, with no way to reuse that file's functions/classes without triggering that side effect. This matters concretely the moment a test suite needs to `import` a module purely to test its functions without accidentally starting a live process as a side effect of the import alone — a very common, real testing requirement.

## Connection

Builds directly on `python-dunder-name.md`. Commonly the very last lines of a runnable Python script — everything the file defines goes above it, and the one line that actually *does* something (as opposed to defining) goes inside the guard.

## Try It Yourself

1. Remove the `if __name__ == "__main__":` guard entirely from `worker.py` (call `do_work()` unconditionally at the top level). Run `python caller.py` again — confirm `"doing the actual work"` now prints during the import, unwanted.
2. Add a second top-level `print(__name__)` at the very start of `worker.py`, before the function definition. Run both files and observe when each value prints relative to everything else.
3. Write a third file that imports `worker` inside a function body (not at the top of the file) and calls that function twice. Does `worker`'s top-level code run once or twice? What does that tell you about how Python caches imports?
