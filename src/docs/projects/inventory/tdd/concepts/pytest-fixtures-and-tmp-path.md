# Concept: pytest Fixtures, via `tmp_path`

**What you'll understand by the end:** what a pytest fixture actually
is (a parameter name pytest recognizes and supplies a value for
automatically), and how `tmp_path` — a real, unique, auto-cleaned
temporary directory per test — demonstrates the mechanism concretely.

**Prerequisites:** `automated-testing-unit-test-basics.md`.

## Setup

Python 3 with `pip install pytest`.

## The Problem

A real test that touches the filesystem (writes a file, reads it back)
needs a real, safe place to do that — not the developer's actual
working directory (real files would accumulate, or collide between
test runs), and not a hand-managed temp directory the test itself has
to create and clean up, remembering to do so even when the test fails
partway through.

## The Isolated Example

```python
def write_greeting(path):
    path.write_text("hello!")


def test_write_greeting_creates_a_real_file(tmp_path):
    target = tmp_path / "greeting.txt"
    write_greeting(target)
    assert target.read_text() == "hello!"
    print("real temp path used this run:", tmp_path)
```

Run with:
```
python -m pytest test_tmp_path.py -v -s
```

**Real output, run this session:**
```
test_tmp_path.py::test_write_greeting_creates_a_real_file real temp path used this run: C:\Users\...\pytest-of-...\pytest-0\test_write_greeting_creates_a_0
PASSED
```

**What this proves:** `tmp_path` was never imported, never assigned,
and never passed in by any calling code the test itself wrote — it
simply appeared as a real, ready-to-use `pathlib.Path` object the
moment it was named as a parameter. `pytest` itself recognized the name
and supplied a real, freshly-created, uniquely-named directory before
the test body ever ran.

## Mechanical Walkthrough

- A **fixture** is a specially-recognized parameter name `pytest`
  provides a real value for automatically — the test function never
  constructs it itself; naming it as a parameter is the entire request.
- `tmp_path` is one of `pytest`'s own real, built-in fixtures: each
  test that requests it gets a genuinely unique real directory
  (confirmed by the printed path's own unique-looking suffix,
  `test_write_greeting_creates_a_0`), created fresh before the test
  runs.
- `tmp_path` is a real `pathlib.Path` object — every method covered in
  `python-pathlib-file-reading.md` (`.write_text()`, `/` for joining
  paths) works on it directly, with no extra setup.
- `pytest` itself manages real cleanup of old temporary directories
  over time — the test author never writes teardown code for this.

## CS Lens

This is **dependency injection at the test-framework level**: rather
than a test constructing everything it needs itself, it *declares* what
it needs (by parameter name) and the framework supplies a real,
correctly-configured instance — the test's own code never has to know
*how* a temp directory gets created or cleaned up, only that one will
be there when it asks for it by name.

Also recognized in: JavaScript test frameworks' own setup/teardown
hooks, dependency-injection frameworks generally (`dependency-
injection.md`) — the same real idea (declare a need, let something
else satisfy it) recurring at a different real layer (a test runner,
rather than an application's own object graph).

## SE Lens

The real, practical payoff: every test using `tmp_path` gets a real,
isolated, automatically-cleaned directory with zero boilerplate and,
critically, no risk of two tests colliding over the same real file path
even when run in parallel — a real, common source of flaky tests when
temp-file handling is done by hand instead.

## Connection

Builds on `automated-testing-unit-test-basics.md`. Directly enables
`pytest-monkeypatch-fixture.md` (`monkeypatch` is a second, different
built-in fixture using the identical real declare-by-parameter-name
mechanism).

## Try It Yourself

1. Add a second test function that also requests `tmp_path` and prints
   it — confirm the two tests get two genuinely different real
   directories, never sharing one.
2. Create a subdirectory inside `tmp_path` (`(tmp_path / "sub").mkdir()`)
   and write a file into it — confirm real, ordinary `pathlib`
   operations work identically on a fixture-provided path as on any
   other `Path`.
3. Look up `tmp_path_factory` (a related, session-scoped real fixture)
   and explain, in your own words, when you'd reach for it instead of
   `tmp_path` — real per-test isolation vs. a real directory shared
   deliberately across multiple tests.
