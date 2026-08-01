# Lesson 4: Proving It Works Without Your Eyes
### (Project 1 — Personal Notes, Python)

**What you will build.** An automated test suite — `test_note.py`,
`test_repository.py` — that verifies `Note` and `NoteRepository` behave
correctly by running real assertions, not by you reading terminal output
and deciding "yep, looks right." Along the way, a small
`make_note(...)` helper emerges once test after test starts repeating
the same `Note(...)` construction — the project's first genuine use of
the **Factory** pattern. The transferable problem this lesson is
actually about: how do you know your code still works after you change
it, without re-running every command from Lessons 1–3 by hand, every
single time?

**What you need to know first.** Lessons 1–3 — `Note`, `NoteRepository`,
and the CLI. Lesson 3's own closing section already flagged this gap:
verifying behavior by eyeballing terminal output doesn't scale.

---

## Concept Unit: A First Automated Test

### The Problem

Every "run it" section in Lessons 1–3 followed the same pattern: run the
code, read the printed output, and decide by eye whether it looked
right. That's fine once. It stops being fine the moment this project has
five files and thirty behaviors to keep correct — nobody re-checks all
thirty by hand after every small change, which means regressions slip in
silently. We need the computer to check "does this still produce the
right answer?" itself, and tell us immediately if it doesn't.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `test_math_lab.py` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, project root.
- **Dependencies** — `pytest`, installed via `pip install pytest`; not
  part of the standard library, unlike everything used so far.

### The New Code

```python
def add(a, b):
    return a + b


def test_add():
    assert add(2, 3) == 5
```

### The Updated Project

Brand-new, throwaway file — nothing to show it nested inside.

### Introduce the concept in isolation

That code above *is* the isolated lab — there's no simpler version to
write first; this is already the smallest thing `pytest` can run. Run
it:

```
$ python3 -m pytest test_math_lab.py -v
============================= test session starts ==============================
collecting ... collected 1 item

test_math_lab.py::test_add PASSED                                        [100%]

============================== 1 passed in 0.01s ===============================
```

That `PASSED` proves two things at once, and it's worth being precise
about both: `pytest` found `test_add` on its own, with no code anywhere
telling it "here's a test, please run it" — and the `assert` statement
inside it genuinely ran and didn't raise anything. Now watch what a real
failure looks like, from a deliberately wrong assertion:

```python
def test_add_wrong():
    assert add(2, 3) == 6
```

```
$ python3 -m pytest test_math_lab_fail.py -v
test_math_lab_fail.py::test_add_wrong FAILED                             [100%]

=================================== FAILURES ===================================
________________________________ test_add_wrong ________________________________

    def test_add_wrong():
>       assert add(2, 3) == 6
E       assert 5 == 6
E        +  where 5 = add(2, 3)

test_math_lab_fail.py:6: AssertionError
```

`pytest` didn't just say "failed" — it printed the actual value
(`5`) next to the expected one (`6`) without being told to, by
inspecting the `assert` statement itself. That's the whole value
proposition: a wrong answer becomes an immediate, specific, readable
failure instead of something you'd have had to notice by eye.

### Discard the throwaway example

`test_math_lab.py` and `test_math_lab_fail.py` are deleted — `add(a, b)`
was never part of this project; it only existed to prove `pytest`
discovers and runs `assert`-based tests, and shows a real failure,
before pointing either at real project code.

### Mechanical walkthrough

- `def add(a, b): return a + b` — **(c) already basic**, a plain
  function.
- `def test_add():` — **(a) first appearance.** Naming a function
  starting with `test_` is what tells `pytest` — this is called **test
  discovery** — to find and run it automatically, with no import or
  registration needed anywhere.
- `assert add(2, 3) == 5` — **(a) first appearance.** `assert <expr>`
  does nothing at all if `<expr>` is true; if it's false, it raises an
  `AssertionError` immediately, which is exactly what `pytest` watches
  for to decide a test passed or failed.

### CS lens

This is **automated testing**, specifically a **unit test** — a small,
fast, isolated check of one specific behavior, run by machine instead of
by a human reading output. Also recognized in: CI pipelines that block a
pull request from merging if any test fails, a compiler's own test
suite run before every release, a spreadsheet's built-in formula
validation catching a broken reference the moment you type it.

### SE lens

The alternative is exactly what Lessons 1–3 did: manual verification,
by eye, every time. That doesn't just cost time — it's unreliable in a
specific, measurable way: a human re-running five terminal commands and
skimming the output *will*, eventually, miss a wrong value buried in the
middle of a long scroll of text. `pytest` costs one new dependency and a
naming convention (`test_*`); in exchange, checking correctness becomes
one command, and it never gets tired or skims.

### Commands needed

`pip install pytest --break-system-packages` — installs `pytest` from
PyPI (the `--break-system-packages` flag is only needed on systems that
otherwise refuse to let `pip` modify system Python packages; you likely
won't need it on a normal virtual environment). `python3 -m pytest
<file> -v` — runs `pytest` against a specific file; `-v` ("verbose")
prints one line per test instead of just a summary count.

### Run it

Both shown above — the pass and the failure.

### Connecting sentence

`pytest` now proves it can find and run a test on its own — the next
unit points it at the real project instead of a throwaway `add`
function.

---

## Concept Unit: Testing the Real Project

### The Problem

`Note.summary()` and the `to_dict()`/`from_dict()` round trip from
Lesson 2 have only ever been checked by printing their output and
reading it. If a future change to `summary()`'s formatting — like
Lesson 3's exercise about a third sort strategy, or any edit at all —
quietly breaks it, nothing will notice until a human happens to run
`cli.py` and spot wrong-looking output.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `test_note.py`.
- **Change type** — add.
- **Location** — new file, project root, alongside `note.py`.
- **Dependencies** — `pytest`, already installed; `note.py` from
  Lessons 1–2.

### The New Code

```python
from note import Note


def test_summary_combines_title_and_body():
    note = Note("Groceries", "Milk, eggs, bread")
    assert note.summary() == "Groceries: Milk, eggs, bread"


def test_to_dict_and_from_dict_round_trip():
    original = Note("Groceries", "Milk, eggs, bread")
    rebuilt = Note.from_dict(original.to_dict())
    assert rebuilt.title == original.title
    assert rebuilt.body == original.body
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

No new syntax here beyond what the previous unit and Lessons 1–2 already
proved — `from note import Note` is the same import mechanics from
Lesson 2, `Note(...)`, `.summary()`, `.to_dict()`, `.from_dict()` are all
already-taught methods, and `assert`/`test_` are this lesson's own
previous unit. This unit's point isn't new syntax; it's applying
everything already known to real project behavior instead of a
throwaway `add` function.

### Discard the throwaway example

Not applicable — nothing thrown away this time; the code above is
permanent.

### Mechanical walkthrough

- `from note import Note` — **(b) hard concept reappearing**, the same
  local import from Lesson 2.
- `def test_summary_combines_title_and_body():` — **(c) already basic**,
  same `test_` naming convention from the previous unit — note the name
  itself describes the behavior being checked, not just "test one."
- `Note("Groceries", "Milk, eggs, bread")` / `note.summary()` — **(c)
  already basic**, Lessons 1's constructor and method.
- `assert note.summary() == "Groceries: Milk, eggs, bread"` — **(c)
  already basic**, same `assert` from the previous unit, now checking a
  real project method's actual return value against the exact string it
  should produce.
- `Note.from_dict(original.to_dict())` — **(b) hard concept
  reappearing**, chaining the two methods from Lesson 2's Repository
  unit directly, without a file ever being involved — proving the
  object ↔ dict conversion round-trips correctly in isolation from
  storage entirely.
- `assert rebuilt.title == original.title` (and `.body`) — **(c)
  already basic.**

### CS lens

This is **regression testing**: once `test_summary_combines_title_and_body`
exists and passes, it keeps passing — or fails loudly — for every future
change to this project, forever, guarding against a working behavior
silently breaking later. Also recognized in: any library's test suite
that runs before every release, a database migration test suite that
re-verifies old queries still return the same results after a schema
change.

### SE lens

Notice `test_to_dict_and_from_dict_round_trip` never touches a file —
it calls `to_dict()` and `from_dict()` directly against each other, with
no `NoteRepository` involved at all. That's a deliberate choice, not an
oversight: testing `Note`'s own conversion logic separately from file
I/O means a failure here points precisely at `Note`, not at "something
in the save/load chain" — which could be the dict conversion, the file
write, or the file read. The next unit tests the file-touching part
separately, for exactly this reason.

### Commands needed

`python3 -m pytest test_note.py -v`, same pattern as before.

### Run it

```
$ python3 -m pytest test_note.py -v
test_note.py::test_summary_combines_title_and_body PASSED                [ 50%]
test_note.py::test_to_dict_and_from_dict_round_trip PASSED               [100%]

============================== 2 passed in 0.01s ===============================
```

### Connecting sentence

`Note`'s own behavior is now checked automatically — what's still
unverified is the part that actually touches a real file on disk, which
is riskier territory and the next unit's subject.

---

## Concept Unit: Testing Code That Touches the Filesystem

### The Problem

`NoteRepository.save()`/`load()` write to `notes.json` — the *same*
file `cli.py` uses for real notes. A test that calls `repo.save()`
against that literal path would silently overwrite your actual saved
notes every time the test suite runs, and running the test suite twice
in a row could even produce different results depending on what was
left over from the previous run. A test needs its own private,
throwaway file that no other test — and no real use of the CLI — can
ever collide with.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `test_repository.py`.
- **Change type** — add.
- **Location** — new file, project root.
- **Dependencies** — `pytest`, already installed; `note.py` and
  `repository.py` from Lessons 1–2.

### The New Code

```python
from note import Note
from repository import NoteRepository


def test_save_then_load_returns_equivalent_notes(tmp_path):
    path = tmp_path / "notes.json"
    repo = NoteRepository(path)
    repo.add(Note("Groceries", "Milk, eggs, bread"))
    repo.add(Note("Gym", "Leg day tomorrow"))
    repo.save()

    reloaded = NoteRepository(path)
    reloaded.load()

    assert len(reloaded.notes) == 2
    assert reloaded.notes[0].title == "Groceries"
    assert reloaded.notes[1].title == "Gym"
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

```python
def test_can_write_and_read_a_file(tmp_path):
    file_path = tmp_path / "greeting.txt"
    file_path.write_text("hello")

    assert file_path.read_text() == "hello"
    print(tmp_path)
```

Real output (`-s` here tells `pytest` to actually show `print()` output,
which it hides by default):

```
$ python3 -m pytest tmp_path_lab.py -v -s
tmp_path_lab.py::test_can_write_and_read_a_file /tmp/pytest-of-root/pytest-0/test_can_write_and_read_a_file0
PASSED
```

That printed path — a brand-new, freshly created directory under
`/tmp`, unique to this one test run — proves `tmp_path` handed us a
real, empty, disposable folder that exists only for this test, and
disappears afterward. This is called a **fixture**: `tmp_path` is a
name `pytest` recognizes automatically, and simply asking for it as a
parameter — the same way `test_save_then_load_returns_equivalent_notes`
does in the real code above — is enough for `pytest` to create one and
hand it in, no import or setup code required. `tmp_path / "notes.json"`
in the real test does exactly what `tmp_path / "greeting.txt"` just did
here: builds a path *inside* that private directory, guaranteeing it
can never collide with the real `notes.json` the CLI uses.

### Discard the throwaway example

`tmp_path_lab.py` is deleted — it only existed to prove `tmp_path`
really is a fresh, private directory per test, isolated from
`NoteRepository` entirely.

### Mechanical walkthrough

- `def test_save_then_load_returns_equivalent_notes(tmp_path):` — **(b)
  hard concept reappearing**: the `tmp_path` fixture just proven above,
  requested the same way — as a parameter `pytest` fills in
  automatically.
- `path = tmp_path / "notes.json"` — **(b) hard concept reappearing**,
  the same `/` path-joining from the isolated lab.
- `repo = NoteRepository(path)` — **(b) hard concept reappearing**,
  Lesson 2's constructor — note it's being passed a `pathlib.Path`
  object here, not a plain string like `"notes.json"` in earlier
  lessons; `open()`, which `save`/`load` use underneath, accepts both.
- `repo.add(...)` / `repo.save()` — **(c) already basic**, Lesson 2.
- `reloaded = NoteRepository(path)` — **(b) hard concept reappearing**:
  deliberately a *second*, separate `NoteRepository` instance, reused
  from the same check Lesson 2's own closing section already
  demonstrated — proving `load()` genuinely reconstructs state from the
  file, not from `repo`'s still-live Python object.
- `len(reloaded.notes)` — **(a) first appearance** of `len()` on a
  list specifically (it appeared on a string back in Lesson 1's
  `summary()`); returns the number of items currently in the list.
- `assert reloaded.notes[0].title == "Groceries"` — **(a) first
  appearance** of list indexing with `[0]`: reads the item at position
  zero — the first item — out of the list, the same ordering the `for`
  loop in Lesson 2 walked through implicitly.

### CS lens

Giving each test its own private filesystem sandbox is **test
isolation**: no test's outcome should depend on what another test (or a
previous run) left lying around. Also recognized in: a database test
suite that runs each test inside a transaction it rolls back afterward,
a CI system that runs each job in a fresh container, unit tests that
mock out shared global state instead of touching it directly.

### SE lens

The alternative — writing to the literal `"notes.json"` the CLI uses —
would work the first time you ran the test suite, and then quietly
corrupt your real saved notes, and quietly become flaky depending on
what state that file was left in by the last run or the last manual CLI
use. `tmp_path` costs nothing extra to use; it's a `pytest` fixture
built specifically for exactly this problem. The alternative isn't
"harder to write" — it's actively unsafe, and that's worth stating
plainly rather than softening.

### Commands needed

`python3 -m pytest test_repository.py -v`.

### Run it

```
$ python3 -m pytest test_repository.py -v
test_repository.py::test_save_then_load_returns_equivalent_notes PASSED  [100%]

============================== 1 passed in 0.02s ===============================
```

### Connecting sentence

The riskiest part of the project — the part that actually touches
disk — is now verified automatically too, and safely, without any
chance of colliding with real saved notes.

---

## Concept Unit: A Factory for Test Data

### The Problem

`test_note.py` and `test_repository.py` both now construct `Note`s the
same way: `Note("Groceries", "Milk, eggs, bread")`, `Note("Gym", "Leg
day tomorrow")`, spelled out fully at every single call site. That's
already three near-identical constructions across two files after just
one lesson of tests — and the moment `Note.__init__` changes (Lesson 2's
own third exercise suggested adding `created_at`), every one of those
call sites breaks and has to be found and fixed by hand, exactly the
duplication problem Lesson 2 already solved once for `to_dict()`, now
showing up again one layer up, in the tests themselves.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `factories.py`; modified `test_note.py`
  and `test_repository.py`.
- **Change type** — add (new file), refactor (existing tests to use it).
- **Location** — `factories.py` is new, project root; the two test files
  replace direct `Note(...)` calls with `make_note(...)`.
- **Dependencies** — `note.py`.

### The New Code

```python
from note import Note


def make_note(title="Untitled", body="Body text"):
    return Note(title, body)
```

### The Updated Project

`factories.py`, whole (brand-new file):

```python
from note import Note


def make_note(title="Untitled", body="Body text"):
    return Note(title, body)
```

`test_note.py`, updated:

```python
from note import Note
from factories import make_note                          # ← new


def test_summary_combines_title_and_body():
    note = make_note(title="Groceries", body="Milk, eggs, bread")  # ← changed
    assert note.summary() == "Groceries: Milk, eggs, bread"


def test_to_dict_and_from_dict_round_trip():
    original = make_note(title="Groceries", body="Milk, eggs, bread")  # ← changed
    rebuilt = Note.from_dict(original.to_dict())
    assert rebuilt.title == original.title
    assert rebuilt.body == original.body


def test_summary_works_with_defaults():                  # ← new
    note = make_note()                                    # ← new
    assert note.summary() == "Untitled: Body text"        # ← new
```

Every test that needs "a `Note`, I don't care about the exact content"
can now call `make_note()` with no arguments at all and get one for
free — and a test that *does* care about specific values, like
`test_summary_combines_title_and_body`, overrides only the fields that
matter to it, `title` and `body`, by name.

### Introduce the concept in isolation

No separate throwaway lab needed — `make_note()`'s own default-argument
mechanics (`title="Untitled"`, overridable by keyword) were already
fully covered by `add_argument(..., default=None)` in Lesson 3; this
unit is applying that same idea to a plain function instead of an
`argparse` argument, directly in the real code above.

### Discard the throwaway example

Not applicable.

### Mechanical walkthrough

- `def make_note(title="Untitled", body="Body text"):` — **(b) hard
  concept reappearing**: default argument values, the same mechanism
  behind `default=None` on `--sort` in Lesson 3, here on a plain
  function instead of an `argparse` argument — calling `make_note()`
  with nothing uses both defaults; `make_note(title="Groceries")` uses
  the given title and the default body.
- `return Note(title, body)` — **(c) already basic**, Lesson 1's
  constructor, just called from inside a helper function instead of
  directly.
- `from factories import make_note` — **(b) hard concept reappearing**,
  the same local import pattern as `from note import Note`.
- `test_summary_works_with_defaults` and its
  `assert note.summary() == "Untitled: Body text"` — **(c) already
  basic**, confirming the defaults themselves are exercised by at least
  one real test, not just assumed correct.

### CS lens

This is the **Factory pattern**, in its simplest real shape: a single
function whose job is constructing a "reasonable, valid instance" of
something, so callers who don't care about every field don't have to
specify all of them, and so the one place that knows how to build a
valid `Note` can be updated once instead of at every call site. Also
recognized in: `Faker`/`factory_boy` libraries used across large Python
test suites, a `UserFactory` or `Model.objects.create(...)` default
helper in a Django app's tests, a `TestBuilder` class in Java test
suites doing the exact same job with a different language's ceremony.

### SE lens

The alternative — every test spelling out `Note("some title", "some
body")` directly — was already the state of the project two units ago,
and it already produced duplication across two files after only three
tests. `make_note()` costs one small file and a habit ("use the
factory, not the constructor, in tests"); in exchange, when `Note`
eventually grows a new required field, exactly one function needs
updating — `make_note`'s own signature and body — and every existing
test that calls `make_note()` with no arguments for that field keeps
working unchanged. The honest tradeoff: production code (`cli.py`)
still calls `Note(...)` directly, on purpose — `make_note`'s defaults
("Untitled", "Body text") are convenient nonsense for tests, and would
be actively wrong to silently apply to a real user's actual note.

### Commands needed

`python3 -m pytest test_note.py test_repository.py -v` — running
`pytest` against multiple files at once, in one command.

### Run it

```
$ python3 -m pytest test_note.py test_repository.py -v
test_note.py::test_summary_combines_title_and_body PASSED                [ 25%]
test_note.py::test_to_dict_and_from_dict_round_trip PASSED               [ 50%]
test_note.py::test_summary_works_with_defaults PASSED                    [ 75%]
test_repository.py::test_save_then_load_returns_equivalent_notes PASSED  [100%]

============================== 4 passed in 0.03s ===============================
```

### Connecting sentence

Every test written in this lesson now builds its `Note` objects through
one shared factory function instead of repeating the constructor call —
closing the same duplication gap Lesson 2 closed for production code,
now inside the test suite itself.

---

## Closing

**Connect the pieces.** Running `python3 -m pytest -v` with no filename
at all discovers and runs *every* `test_*.py` file in the project at
once:

```
$ python3 -m pytest -v
test_note.py::test_summary_combines_title_and_body PASSED                [ 20%]
test_note.py::test_to_dict_and_from_dict_round_trip PASSED               [ 40%]
test_note.py::test_summary_works_with_defaults PASSED                    [ 60%]
test_repository.py::test_save_then_load_returns_equivalent_notes PASSED  [ 80%]
...
============================== 5 passed in 0.03s ===============================
```

Follow one value through the whole chain: `make_note()`'s default
`"Untitled"` flows into `Note.__init__` (Lesson 1), through
`note.summary()`'s f-string (Lesson 1), and the resulting string is
compared against a known-correct literal by `assert` (this lesson) —
the same construction, transformation, and verification pipeline as
every other test here, just with the specific values changed.

**What breaks without this.** Introduce a real bug on purpose — change
`self.body[:20]` to `self.body[:2]` inside `Note.summary()` — and
re-run the test suite:

```
$ python3 -m pytest test_note.py -v
test_note.py::test_summary_combines_title_and_body FAILED                [ 33%]
test_note.py::test_to_dict_and_from_dict_round_trip PASSED               [ 66%]
test_note.py::test_summary_works_with_defaults FAILED                    [100%]

=================================== FAILURES ===================================
_____________________ test_summary_combines_title_and_body _____________________

    def test_summary_combines_title_and_body():
        note = make_note(title="Groceries", body="Milk, eggs, bread")
>       assert note.summary() == "Groceries: Milk, eggs, bread"
E       AssertionError: assert 'Groceries: Mi' == 'Groceries: Milk, eggs, bread'
E
E         - Groceries: Milk, eggs, bread
E         + Groceries: Mi

FAILED test_note.py::test_summary_combines_title_and_body - AssertionError: a...
FAILED test_note.py::test_summary_works_with_defaults - AssertionError: asser...
========================= 2 failed, 1 passed in 0.03s ==========================
```

Two tests fail immediately, both pointing exactly at `summary()`, and
`test_to_dict_and_from_dict_round_trip` — which never calls `summary()`
at all — correctly keeps passing, proving the failure is genuinely
isolated to the one broken method, not a false alarm from something
else. Restore `[:20]` and both go back to passing.

**Exercises.**
1. Add a test confirming `NoteRepository.load()` on a repository that
   never had `save()` called against its path still raises
   `FileNotFoundError` — look up `pytest.raises` for asserting an
   exception happens, instead of a return value.
2. Extend `make_note()` with an optional third parameter for a future
   field of your choosing, and write one test proving the default value
   is used when it's omitted.
3. Write a test for the Strategy pattern from Lesson 3: call
   `sorted(notes, key=SORT_STRATEGIES["length"])` directly against a
   small list built with `make_note()`, and assert the resulting order
   is correct — no CLI or `subprocess` involved.

**Definition of done.**
- [ ] `pytest` is installed and `python3 -m pytest -v` runs the full
      suite, all passing, output actually captured.
- [ ] `test_note.py` and `test_repository.py` exist, covering
      `summary()`, the `to_dict`/`from_dict` round trip, and a real
      save-then-load cycle using `tmp_path`.
- [ ] `factories.py` exists with `make_note()`, and both test files use
      it instead of calling `Note(...)` directly.
- [ ] You've deliberately broken `summary()`, seen the real failing
      assertions with `pytest`'s diff-style output, and restored it.
- [ ] Commit with a message explaining why — e.g. `"Add automated tests
      for Note and NoteRepository so behavior is verified by pytest,
      not by reading terminal output"` — not `"add tests"`.

**Next lesson** starts Project 2 — a Task Manager — where undo/redo and
history push the project toward the **Command** and **Memento**
patterns, and a growing task list starts to need real data structures
beyond a plain list.
