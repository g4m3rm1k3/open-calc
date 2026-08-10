# Concept: `os.environ.get(key, default)`

**What you'll understand by the end:** what an environment variable is,
how Python reads one, and why `.get(key, default)` is used instead of
`os.environ[key]`.

**Prerequisites:** `python-dict-get-method.md`, if reading it in
isolation is useful — `os.environ` behaves like a real dict for exactly
this purpose.

## What it is

An environment variable is a named value set outside a running program
— by the operating system, a shell, a hosting platform, or a `.env`
file loaded before the program starts — rather than hardcoded into the
program's own source. `os.environ` is Python's read access to the
current process's own set of them.

## Implementation

From the `os` module in Python's standard library:

```python
import os

# os.environ behaves like a real Mapping (dict-like) object:
os.environ["SOME_KEY"]              # KeyError if SOME_KEY isn't set
os.environ.get("SOME_KEY")          # None if SOME_KEY isn't set
os.environ.get("SOME_KEY", "fallback")  # "fallback" if SOME_KEY isn't set
```

- `os.environ` — a dict-like object, populated once, automatically,
  when the Python process starts, from whatever environment variables
  the process was actually launched with.
- `os.environ["KEY"]` — a plain dict-style lookup: raises `KeyError`
  immediately if `"KEY"` was never set anywhere.
- `os.environ.get("KEY", default)` — the same `.get(key, default)`
  method every Python dict has: returns the value if `"KEY"` is set,
  or `default` — computed once, before the call — if it isn't. Never
  raises.

## Its use

`os.environ.get('FLASK_ENV', 'development')` reads a real environment
variable named `FLASK_ENV` if one exists — set, for example, by a
deployment platform choosing which configuration to run — and falls
back to the literal string `'development'` if nothing set one, which is
the normal case on a developer's own machine. This is what lets the
identical source code run correctly both locally (no `FLASK_ENV` set,
falls back to development config) and in a real deployment (`FLASK_ENV`
set to `production` by whatever's hosting it) with zero code changes
between the two — the difference lives entirely outside the source
file, in how each environment happens to be configured.

## Try It Yourself

1. In a terminal, run `python -c "import os; print(os.environ.get('NOT_SET_ANYWHERE', 'fallback-value'))"` and confirm it prints `fallback-value`.
2. Set a real environment variable first (`set NOT_SET_ANYWHERE=hi` on
   Windows, `export NOT_SET_ANYWHERE=hi` on macOS/Linux), then run the
   same command again in that same terminal session — confirm it now
   prints `hi` instead.
3. Change `.get(...)` to a plain `os.environ["NOT_SET_ANYWHERE"]` with
   the variable unset again, and read the real `KeyError` this raises —
   confirms `.get`'s fallback is doing real, load-bearing work, not
   just being a stylistic preference.
