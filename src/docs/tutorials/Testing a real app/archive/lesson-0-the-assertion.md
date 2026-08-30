# Lesson 0: The Assertion — Checking a Claim Instead of Trusting It

> **What "this project" means in this lesson.** This series lives in
> `open-calc`'s own docs tree, but it does not test `open-calc`. Every
> real file this lesson names — `backend/app/models/part.py`,
> `backend/tests/`, `REFACTORING_FINAL_SUMMARY.md`, and so on — is a
> real path inside a separate, real application: **`manufacturing-platform`**,
> a Flask + React manufacturing-tracking app living in its own sibling
> repository, not inside `open-calc` at all. "This project" and "this
> app," everywhere below, mean `manufacturing-platform`. Commands given
> as `cd backend` assume a terminal already open at
> `manufacturing-platform`'s own repository root, not `open-calc`'s.

## What you will build

A real, permanent automated test — the first one this project has ever
had for `Part.to_dict()`, a plain method already sitting in
`backend/app/models/part.py` — added to the real `backend/tests/`
folder and run for real with `pytest`. Today's real subject isn't
`pytest` itself, and it isn't `Part`. It's the **assertion**: the one
mechanical idea every automated test, in every language, in every
framework this curriculum will ever touch, is built on top of. Once
this idea is real, "pytest," "Vitest," "JUnit," and every other test
framework's own ceremony are just different packaging around the exact
same core act — stating a claim, and having the machine, not your own
eyes, decide whether it's true.

This matters for a specific, real reason, not a hypothetical one: this
app's own frontend went through a real, weeks-long refactor
(`REFACTORING_FINAL_SUMMARY.md`, January 2026) that was declared
"100% complete" on the strength of "0 TypeScript errors" and a
successful build — nothing else. Its own Testing Checklist, written
into that same document, has every box unchecked. Two weeks later, new
feature work on top of that "complete" refactor was already prompting a
document proposing to abandon the stack entirely
(`GRAND_ARCHITECTURE_PIVOT.md`). Nothing in between those two documents
ever ran the code and checked a claim about it. This lesson is the
first step in that never happening again.

## What you need to know first

Nothing — this is the first lesson of this series.

## Terms introduced

- **Manual verification** — running code once, reading its output, and
  deciding by eye whether it looks right. Proves correctness exactly
  once, at that moment, for whoever was watching — it leaves nothing
  behind that can be re-checked later, by anyone, without a person
  doing the exact same manual work over again.
- **Regression** — code that used to behave correctly, and now doesn't,
  because of some later, usually unrelated change. The specific failure
  manual verification is structurally unable to catch: nobody re-checks
  something they already verified once, weeks or months ago, when
  touching a different part of the codebase.
- **Assertion** — a statement, written directly in code, of a claim
  that must be true at that exact point in the program's execution — not
  a comment describing what *should* be true, a real, checked statement
  that the program itself evaluates every time it runs. If the claim is
  false, the program stops immediately and says so, loudly, at the exact
  line where reality diverged from the claim; if it's true, execution
  continues as if the assertion weren't there at all.
- **Automated test** — a real, saved, independently-runnable piece of
  code whose entire job is to make one or more assertions about some
  other, real piece of code — and to be rerun, unchanged, as many times
  as anyone wants, forever, at essentially zero marginal cost per run.
  The word "automated" is doing real work here: it's what separates
  this from manual verification — nobody has to remember to re-check
  anything, or redo the check by hand; the exact same check just runs
  again.
- **Test runner** — a real program (`pytest`, for this lesson) whose job
  is to find every automated test in a project, run each one, and report
  which passed and which failed, with enough detail to say *why* — so
  that "did anything break" becomes one real command, not a person
  manually re-deriving what to check.
- **Test discovery** — the specific, mechanical rule a test runner uses
  to decide which functions in a project are tests it should run, versus
  ordinary code it should leave alone. `pytest`'s own rule — covered in
  full, real detail below — is a naming convention, not a registration
  list a person has to maintain by hand.

## Objects and methods used

- **`create_app`**
  - *What it is:* a real, already-existing function in this project's
    own `backend/app/__init__.py`, at module scope — not new code this
    lesson adds.
  - *Implementation:* `def create_app(config_name: str = None) -> Flask:`
    (`backend/app/__init__.py:172`). Builds a real `Flask` application
    object, loads a named configuration onto it, wires up SQLAlchemy,
    registers every real route blueprint this project has, creates every
    database table declared by every model currently imported
    (`db.create_all()`), and seeds a real set of default users if none
    already exist — then returns the fully-configured `Flask` object.
  - *Its use:* this lesson's test calls `create_app('testing')` to get a
    real, working instance of the actual application to test against —
    not a stripped-down stand-in, the same factory function
    `backend/run.py` itself calls to start the real server.
  - *Type:* a free function (module-level, not a method on any class),
    returning a `Flask` instance.
  - *Responsibility:* fully assembling one real, ready-to-run
    application object — configuration, database wiring, every route,
    every table, seed data — from nothing but a config name string, so
    that nothing calling it has to know or repeat any of those assembly
    steps itself.
  - *Depends on:* the real `config` dictionary in `backend/config.py`
    (to resolve `'testing'` to a real configuration class), every model
    module already imported at the point it runs (`db.create_all()` only
    creates tables for models Python has actually loaded), and every
    route module under `backend/app/routes/`.
  - *Connects to:* called by `backend/run.py` to start the real
    development server, and, starting with this lesson, called directly
    by real tests that need a genuinely working application to run
    assertions against.
  - *Shape:* the real, single composition root for this entire backend —
    the one place "what does a fully assembled application actually
    consist of" is decided, for both real production use and every test
    this series will ever write.

- **`Flask.app_context()`**
  - *What it is:* a real method on Flask's own `Flask` class, part of
    Flask's public API, not this project's code.
  - *Implementation:* returns a real `AppContext` object — a Python
    **context manager**, meant to be used with Python's `with`
    statement, which runs real setup code on entry and real teardown
    code on exit, guaranteed, even if an exception happens in between.
    Checked directly against Flask's own official documentation this
    session: entering it ("pushing" it) makes `current_app` available —
    a way for any code to reach the active `Flask` object without it
    being passed in as an argument everywhere — and exiting it ("popping"
    it) runs every function registered with `@app.teardown_appcontext()`
    before `current_app` stops being available again. Flask-SQLAlchemy,
    a separate package this project also depends on, builds its own
    `db.session` on top of this same active-app mechanism — real, true,
    and worth knowing, but that specific detail comes from
    Flask-SQLAlchemy's own documentation, not Flask's.
  - *Its use:* this lesson's test wraps every `Part(...)` construction
    and `to_dict()` call in `with app.app_context():` — required
    because this project's real models, `Part` included, only work
    correctly once a real application context is active; verified for
    real, the hard way, while preparing this lesson (see the CS Lens
    below for exactly what happens without it).
  - *Type:* an instance method on `Flask`, called on a real `app` object,
    returning a context manager.
  - *Responsibility:* making one specific `Flask` application "the
    active one" for the duration of a `with` block, so that any code
    running inside — this project's own models included — can reach it
    without an explicit reference being threaded through every function
    call.
  - *Depends on:* a real, already-constructed `Flask` instance to
    activate.
  - *Connects to:* every one of this project's real model files (`Part`
    among them) that calls `db.session` or relies on `db.Model`'s own
    registry — none of that works correctly with no application context
    active.
  - *Shape:* a real Flask framework boundary — the seam between "an
    application object exists" and "code can actually use it" — not
    project-specific, the same real mechanism every Flask app depends
    on.

- **`Part`**
  - *What it is:* a real, already-existing class in this project's own
    `backend/app/models/part.py` — a SQLAlchemy model representing one
    row of the real `parts` database table.
  - *Implementation:* `class Part(db.Model):` (`backend/app/models/part.py:134`),
    with `id`, `part_number`, `description`, `material`,
    `current_revision`, `status`, and more declared as `db.Column(...)`
    class attributes — real, already-existing project code, not
    anything this lesson adds.
  - *Its use:* this lesson constructs a real `Part` instance directly —
    `Part(id=..., part_number=..., description=...)` — the exact object
    `to_dict()`, below, is tested against.
  - *Type:* a class, inheriting from `db.Model` (SQLAlchemy's own
    declarative base, itself provided by the `flask_sqlalchemy` package
    already imported in `backend/app/__init__.py`).
  - *Responsibility:* representing one real part record — every real
    field a part has, and the mapping between those fields and the real
    `parts` database table's real columns.
  - *Depends on:* the shared `db` object from `backend/app/__init__.py`
    (`from app import db`) for its base class and column types, and,
    per this lesson's own real discovery below, every other model in
    this project's registry being importable before any single model —
    `Part` included — can actually be constructed.
  - *Connects to:* this lesson's new test constructs it directly;
    elsewhere in the real project, `backend/app/routes/parts.py` queries
    and constructs it in response to real HTTP requests.
  - *Shape:* a real data-model boundary — the layer this project uses to
    represent "a part" everywhere: in the database, in Python code, and,
    via `to_dict()`, in the JSON this project's real API sends to its
    real frontend.

- **`Part.to_dict()`**
  - *What it is:* a real, already-existing method on `Part`, converting
    one real `Part` instance into a plain Python `dict`.
  - *Implementation:* `def to_dict(self) -> dict:` (`backend/app/models/part.py:353`),
    returning a dict literal built entirely from `self.<field>` reads —
    `self.id`, `self.description`, `self.part_number` renamed to the key
    `'partNumber'`, and so on for every real field `Part` declares — plus
    `self.tags.split(',') if self.tags else []` and
    `self.created_at.isoformat() if self.created_at else None`.
  - *Its use:* this is the exact method this lesson's test calls and
    makes real assertions about — the smallest real, already-existing,
    side-effect-free piece of this project's own code available to test
    first.
  - *Type:* an instance method on `Part`, taking no arguments beyond
    `self`, returning `dict`.
  - *Responsibility:* producing a plain, JSON-ready dictionary version of
    one `Part`'s current field values, with Python's `snake_case` field
    names translated to the `camelCase` this project's real React
    frontend expects.
  - *Depends on:* nothing beyond the `Part` instance's own current
    attribute values — no database query, no network call, no other
    object. This is exactly why it's this lesson's first real target;
    see `pure-functions-testability.md` below.
  - *Connects to:* called by this project's real Flask routes
    (`backend/app/routes/parts.py`) to build the JSON body of real HTTP
    responses; from this lesson onward, also called directly by a real
    test with no HTTP request involved at all.
  - *Shape:* a real serialization boundary — the one place this
    project's Python-side field names and JSON-side field names are
    translated into each other.

---

## Concept Unit: The Assertion Itself

### The Problem

`Part.to_dict()` already exists, already runs, and — reading it —
looks correct: it reads real fields off `self` and builds a dict.
"Reading code and confirming it looks right" is exactly the manual
verification this lesson's opening already named — and it's exactly
what already happened, once, to the 50+ components
`REFACTORING_FINAL_SUMMARY.md` split out of this same project's
frontend, verified only by "0 TypeScript errors," with nothing left
behind to catch what broke two weeks later. The real question this unit
answers: what does an automated, rerunnable check of a claim like "this
returns the right value" actually look like, mechanically, at its very
smallest?

> **Before reading on:** `Part.to_dict()`'s real code is quoted in full
> in the Header above, under `Part.to_dict()`'s *Implementation* bullet.
> Looking only at that — no test framework, no `pytest`, nothing else —
> what is the smallest possible piece of *code* (not prose, not a
> comment) you could write that would make Python itself complain, loudly,
> if `to_dict()` ever stopped returning the real `id` a `Part` was given?
> What Python keyword do you already know that can make a program stop
> and say something is wrong?

### Concepts reused, 100% match — not re-taught here

- `concepts/automated-testing-unit-test-basics.md` — the full treatment,
  in two real, run-for-real forms: JavaScript's `describe`/`it`/`expect`
  shape, and — the one this lesson actually uses — Python's own
  `pytest`, where a plain function named `test_something`, containing a
  bare `assert`, is a complete, independently-runnable test with no
  runner API imported at all. Its own real, captured output there
  already proves every part of test discovery and pass/fail reporting
  this unit depends on.
- `concepts/pure-functions-testability.md` — the full treatment of why a
  function depending only on its own inputs (or, here, an object's own
  current field values) — with no database call, no network request, no
  file write — can be tested directly, with no setup beyond constructing
  a plain object, and why that's not a coincidence: `to_dict()` was
  deliberately chosen as this project's first real test target because
  it already has this shape.

### What this means for what's coming

Both files above already proved, in full, with real executed output,
that `pytest` needs nothing but a `test_`-prefixed function and a bare
`assert` to run a real, independent, pass/fail-reported check. The rest
of this lesson does not re-derive that mechanism — it applies it
directly to `Part.to_dict()`, this project's own real code, for the
first time this project has ever had a test at all.

---

## Concept Unit: Writing This Project's First Real Test

### The Problem

`automated-testing-unit-test-basics.md`'s own pytest example tests
`double(n)` — a free function, called with no setup beyond passing it a
number. `Part.to_dict()` is a method, called on a real object this
project's own model class has to construct first. The real question
this unit answers: what does it actually take, concretely, in *this*
project, to get from "nothing" to a real `Part` object whose
`to_dict()` can be called and checked?

### Project Change

- **Reference Source** — no reference counterpart. This series tests
  the real, already-existing application directly, in place; there is
  no separate implementation being ported or compared against.
- **Files affected** — created: `backend/tests/test_part_model.py`.
  `backend/tests/` already exists as a real directory in this project
  (it currently holds one existing test, `test_operation_manager.py`,
  written before this series and not itself covered by it).
- **Change type** — add (new file).
- **Location** — new file, directly inside the existing
  `backend/tests/` folder.
- **Dependencies** — `pytest` itself. Checked for real this session:
  not present in this project's `backend/.venv`, and not listed in
  `backend/requirements.txt`. Install it into the same virtual
  environment every other real backend dependency already lives in:

  ```
  cd backend
  .venv\Scripts\python -m pip install pytest
  ```

  `cd backend` moves into this project's real backend folder, where
  `.venv` — this project's own isolated Python environment, already
  used for Flask, SQLAlchemy, and everything else the real backend
  depends on — already lives. `.venv\Scripts\python -m pip install
  pytest` runs that specific virtual environment's own `python`,
  telling it to run its bundled `pip` (Python's package installer) as a
  module (`-m`), installing the real, published `pytest` package into
  this project's environment specifically — not whatever Python happens
  to be first on the system's own `PATH`, which could easily be a
  different, unrelated Python installation entirely. Add `pytest` to
  `backend/requirements.txt` too, the same file every other real backend
  dependency is already listed in, so a fresh clone of this project
  installs it automatically.

### The New Code

The smallest real piece worth typing first — one construction, one
call, one claim:

```python
from app import create_app
from app.models import Part


def test_to_dict_reflects_the_fields_i_actually_set():
    app = create_app('testing')
    with app.app_context():
        part = Part(
            id='P-TEST',
            part_number='1234567',
            description='Test Bracket',
        )
        data = part.to_dict()
        assert data['id'] == 'P-TEST'
```

### The Updated Project

`backend/tests/test_part_model.py`, in full — this file is brand new,
so this *is* the whole file, not an excerpt of something larger:

```python
 1  from app import create_app
 2  from app.models import Part
 3
 4
 5  def test_to_dict_reflects_the_fields_i_actually_set():
 6      app = create_app('testing')
 7      with app.app_context():
 8          part = Part(
 9              id='P-TEST',
10              part_number='1234567',
11              description='Test Bracket',
12          )
13          data = part.to_dict()
14          assert data['id'] == 'P-TEST'
```

One real test function, making exactly one real claim about exactly one
real field.

### Mechanical Walkthrough

- **Line 1, `from app import create_app`** — imports the real,
  already-existing application factory function this lesson's Header
  already gave full treatment to, from this project's real
  `backend/app/__init__.py`.
- **Line 2, `from app.models import Part`** — imports the real `Part`
  class from this project's real `backend/app/models/` package, the
  same class this lesson's Header already gave full treatment to.
  Importing from `app.models` (the package) rather than
  `app.models.part` (the specific file `Part` is defined in) matters
  here for a real, verified reason covered fully in this lesson's next
  unit, below.
- **Line 5, `def test_to_dict_reflects_the_fields_i_actually_set():`** —
  an ordinary Python function definition, made into a real, independently
  runnable test purely by its name starting with `test_` — the exact
  **test discovery** convention `automated-testing-unit-test-basics.md`
  already proved for real: no decorator, no registration call, no import
  of any test-specific base class. The name itself is intentionally long
  and specific — a good test name states, in plain English, exactly what
  would have to be true for it to pass, so that a failure report is
  legible without opening the test's own body first.
- **Line 6, `app = create_app('testing')`** — calls this lesson's
  Header's `create_app`, passing the string `'testing'` as its
  `config_name` argument, and keeps the real, fully-assembled `Flask`
  object it returns in a local variable named `app`.
- **Line 7, `with app.app_context():`** — this lesson's Header's
  `Flask.app_context()`, used exactly as Python's `with` statement is
  built for: everything indented underneath runs with this specific
  `app` active as `current_app`, and Flask guarantees the context is
  torn down again once the block ends, whether it finishes normally or
  raises.
- **Lines 8–12, `part = Part(id=..., part_number=..., description=...)`**
  — constructs one real, in-memory `Part` object, this lesson's Header's
  `Part`, passing three of its real fields as keyword arguments. This is
  plain Python object construction — nothing is written to any database
  by this line alone; `Part` inherits this three-keyword-argument
  constructor automatically from `db.Model`, SQLAlchemy's own declarative
  base class, which builds a real `__init__` accepting any of a model's
  declared columns as keyword arguments, setting each one as a real
  instance attribute.
- **Line 13, `data = part.to_dict()`** — calls this lesson's Header's
  `Part.to_dict()` on the real object just constructed, keeping its
  real, returned `dict` in a local variable named `data`.
- **Line 14, `assert data['id'] == 'P-TEST'`** — the actual claim this
  entire test exists to check: this lesson's own **Assertion**, applied
  for the first time to this project's own real code. `data['id']` reads
  the real value at the `'id'` key of the real dict `to_dict()` returned;
  `== 'P-TEST'` compares it, by real value, against the exact string this
  same test passed in on line 9. If they match, the `assert` does
  nothing observable at all and the test passes; if they don't, Python
  raises a real `AssertionError` at this exact line, and `pytest` — per
  `automated-testing-unit-test-basics.md`'s own already-proven mechanism
  — reports it, with the real, computed value shown alongside the
  expected one.

### CS Lens

Real, verified this session — not predicted, not assumed. Running
`from app.models.part import Part` alone, with nothing else imported
first, and then constructing a `Part`, fails immediately:

```
sqlalchemy.exc.InvalidRequestError: When initializing mapper
Mapper[UserFavorite(user_favorites)], expression 'User' failed to
locate a name ('User'). If this is a class name, consider adding this
relationship() to the <class 'app.models.user_favorite.UserFavorite'>
class after both dependent classes have been defined.
```

This is a real, existing property of this project's own model
registry, proven the hard way while preparing this exact lesson, not a
generic SQLAlchemy fact stated from memory: SQLAlchemy's declarative
`db.Model` base keeps one shared **registry** of every model class ever
defined, and a `db.relationship(...)` naming another model by a plain
string (`UserFavorite`'s own relationship to `'User'`, elsewhere in this
project) is only resolved the *first time any model anywhere in that
registry is actually constructed* — not when the file defining it is
merely imported. Constructing the very first `Part` in a fresh Python
process is what triggers SQLAlchemy to resolve *every* pending
string-named relationship across the *entire* registry at once,
`UserFavorite`'s included — and if `User` hasn't been imported yet
anywhere in that same process, that resolution fails, even though
nothing about `Part` itself, or this test, mentions `User` at all.
Importing `app.models` (the package) rather than `app.models.part`
(one file) sidesteps this specific failure only because, elsewhere in
this project's own `backend/app/models/__init__.py`, every model
already gets imported together — but the *real* trigger avoiding it
here is `create_app('testing')` on line 6, which — per this lesson's
Header — registers every real route blueprint, transitively importing
every model any of them touches, before this test ever reaches line 8's
`Part(...)` construction. A `Part` constructed with no `create_app()`
call anywhere in the same process first is a real, live way to
reproduce the exact failure quoted above.

Also recognized in: any object-relational mapper using deferred,
string-based cross-references between classes (not unique to
SQLAlchemy), and more generally, any system where one part's
correctness silently depends on a specific, non-obvious initialization
order — precisely the kind of hidden coupling a comment can assert
away ("this works, trust me") but only a real, executed run can
actually prove.

### SE Lens

The design principle this test leans on is the one
`pure-functions-testability.md` already named in full:
`Part.to_dict()` was chosen as this project's first real test target
specifically *because* it has no side effects of its own — but this
unit's own real discovery, above, shows that "no side effects" is a
claim about the method, not a guarantee about the whole system it lives
in. `Part` as a class still depends on this project's global model
registry being fully populated before it can be constructed at all —
a real, current architectural cost this project is carrying, not
something this lesson invented to make a point. The honest engineering
tradeoff: a fully isolated unit test — one requiring nothing but the
one file under test — is not achievable here without first either
restructuring how this project's models declare relationships to each
other, or accepting `create_app()`'s heavier, real setup as this
project's actual, current cost of entry for testing *any* single model.
This lesson accepts that real cost rather than hide it behind a
lighter-weight test that would silently stop working the moment a
second, real model test runs first in the same process and changes
what's already been imported.

### Commands needed

```
cd backend
.venv\Scripts\python -m pytest tests/test_part_model.py -v
```

`cd backend` — moves into this project's real backend folder, where
both `.venv` (this project's real virtual environment) and `tests/`
(where the new file was just created) live. `.venv\Scripts\python -m
pytest` — runs this specific environment's own `python`, telling it to
run `pytest` as a module, the same real mechanism already explained
under `pip install`, above; running plain `pytest` (with no `python -m`
in front) risks silently picking up a different, system-wide `pytest`
installation instead of this project's own. `tests/test_part_model.py`
— the specific real file to run, rather than every test in the project
at once; useful while a test is still being written, before it's ready
to run alongside everything else. `-v` — "verbose": tells `pytest` to
print each individual test's name and real pass/fail status, rather
than only a final summary count.

### Run it, per the Verification Rule

Real output, this session:

```
backend/tests/test_part_model.py::test_to_dict_reflects_the_fields_i_actually_set PASSED [100%]

1 passed in ...s
```

(The real, full saved run — including two further real assertions
against `partNumber` and `description`, added the same way as the one
above, one real claim at a time — lives in
`lesson-0-verification/test_part_to_dict.py` and
`lesson-0-verification/real-output.txt`, this lesson's own real
verification record.) This proves exactly one thing, honestly: that
`Part.to_dict()`, run for real, right now, on this real machine, returns
`'P-TEST'` at key `'id'` when a `Part` is constructed with `id='P-TEST'`.
Not "should," not "looks like it would" — actually does, checked by the
machine, not by a person's eyes.

### Connecting this unit to what came before

The Assertion this lesson opened with — one claim, checked by the
machine instead of trusted by eye — is no longer an idea demonstrated
only on a throwaway `double()` function. It just ran, for the first
time, against this real project's own real code, and passed.

---

## Concept Unit: What Running It For Real Actually Caught

### The Problem

`to_dict()`'s own real code, quoted in this lesson's Header, builds
`'status': self.status` directly from the real `Part` object's own
`status` attribute. `Part`'s real column declaration in
`backend/app/models/part.py` reads `status = db.Column(db.String(20),
default='draft')`. Reading only those two lines, it's reasonable to
expect a freshly constructed `Part` — with no `status` explicitly
passed in — to already have `status` equal to `'draft'`, the declared
default, the moment it's constructed. This unit is what happens when
that reasonable-sounding expectation is turned into a real assertion
and actually run.

> **Before reading on:** if you have a moment, actually try this
> yourself against this project's real code — construct a `Part` the
> same way the test above did, but leave out `status` entirely, then
> check what `part.status` (not `to_dict()`, the raw attribute) actually
> is. Does it match what `default='draft'` suggests it should be?

### The New Code

```python
def test_to_dict_status_before_any_database_write():
    app = create_app('testing')
    with app.app_context():
        part = Part(
            id='P-TEST-2',
            part_number='7654321',
            description='Another Bracket',
        )
        data = part.to_dict()
        assert data['status'] == 'draft'
```

### Run it, per the Verification Rule

Real output, this session — the exact command from the previous unit,
run again after adding this second test function to the same file:

```
backend/tests/test_part_model.py::test_to_dict_reflects_the_fields_i_actually_set PASSED [ 50%]
backend/tests/test_part_model.py::test_to_dict_status_before_any_database_write FAILED [100%]

================================== FAILURES ===================================
________________ test_to_dict_status_before_any_database_write ________________

    def test_to_dict_status_before_any_database_write():
        app = create_app('testing')
        with app.app_context():
            part = Part(
                id='P-TEST-2',
                part_number='7654321',
                description='Another Bracket',
            )
            data = part.to_dict()
>           assert data['status'] == 'draft'
E           AssertionError: assert None == 'draft'

1 failed, 1 passed in 1.63s
```

(Full real capture: `lesson-0-verification/real-output.txt`, "RUN
1.") A real, honest failure — the reasonable-sounding expectation from
this unit's Problem section was wrong, and this is the exact mechanism
that caught it: not a person re-reading `to_dict()` a second time more
carefully, an assertion, run for real, refusing to agree with a false
claim.

### Mechanical Walkthrough

The only new line versus the previous unit's test is
`assert data['status'] == 'draft'` — same real `assert` keyword, same
`==` comparison, applied to a different key. The real, load-bearing
difference is what `data['status']` actually *is*: not `'draft'`, but
Python's own `None` — the same `None` a variable has before anything is
assigned to it. `db.Column(..., default='draft')`'s real `default=`
argument is not a Python-level default the way a function parameter's
`def f(x=1)` is — it's an instruction to *SQLAlchemy*, applied only at
the moment a row is actually written to the database (an `INSERT`,
triggered by `db.session.add(...)` followed by `db.session.commit()` or
`db.session.flush()`). This test's `Part(...)` call constructs a real
Python object and stops there — it's never added to a session, never
committed, so SQLAlchemy has never had the moment it needs to apply
that default. `self.status`, at the point `to_dict()` reads it, is
exactly what it was left as by `Part`'s own inherited constructor: not
set at all, which Python represents as `None`.

### CS Lens

This is a real, concrete instance of the difference between a
**declared default** and an **applied default** — a distinction that
recurs anywhere a system separates *describing* a rule from
*enforcing* it at a specific, later moment, rather than immediately.

Also recognized in: HTML form fields with a `value` attribute that only
becomes the field's real, submitted value if the user never types
anything themselves (declared, not yet applied); a class's constructor
parameter with a default argument, which is only substituted in at the
actual moment of a call with that argument omitted, not the moment the
function is defined; database `DEFAULT` clauses in raw SQL, which
behave exactly like this project's `db.Column(default=...)` because
SQLAlchemy's version is a thin wrapper around the identical real
concept.

### SE Lens

The real, honest reason this matters beyond one surprising test result:
any code elsewhere in this project that constructs a `Part` and reads
its `status` — or calls `to_dict()` on it — *before* that `Part` is
committed to the database will see `None`, not `'draft'`, no matter how
reasonable `default='draft'` makes the opposite look from just reading
the model file. A test that had assumed the "obviously correct" answer
instead of running it would have shipped that same wrong assumption
silently — not as a bug in `to_dict()` itself, which is doing exactly
what its own real code says, but as a false belief about what `Part`
guarantees, left uncaught until something else in this project actually
depended on it being wrong. This is the real, concrete version of the
Verification Rule this whole lesson series is built on: "can you state,
right now, what this will produce" was answered wrong here, confidently,
before it was actually run — which is exactly why it was run, and
exactly the failure mode that made this project's own past refactor
look complete when it wasn't.

### Fixing the assertion to match reality

```python
def test_to_dict_status_before_any_database_write():
    app = create_app('testing')
    with app.app_context():
        part = Part(
            id='P-TEST-2',
            part_number='7654321',
            description='Another Bracket',
        )
        data = part.to_dict()
        assert data['status'] is None
```

One real change: `== 'draft'` becomes `is None`. (`is`, not `==`, for a
`None` check — a first-appearing operator worth naming plainly: `is`
compares real object identity, and Python guarantees there is ever only
one `None` object in a whole running program, which is exactly why
checking "is this the one-and-only `None`" is the idiomatic real Python
way to check for it, rather than `==`, which asks a different, looser
question — "does this compare equal" — that happens to also work for
`None` but isn't what a reader should expect this check to be doing.)

Real output, this session, after the fix:

```
backend/tests/test_part_model.py::test_to_dict_reflects_the_fields_i_actually_set PASSED [ 50%]
backend/tests/test_part_model.py::test_to_dict_status_before_any_database_write PASSED [100%]

2 passed in 1.31s
```

(Full real capture: `lesson-0-verification/real-output.txt`, "RUN
2.") Both real claims now hold — one about a field this test explicitly
set, one about a field it deliberately didn't, with the test itself now
stating, correctly, which of those two situations `status` is actually
in before anything is written to a database.

### Connecting this unit to what came before

The previous unit's single passing assertion proved the mechanism
works. This unit proves something sharper: the mechanism doesn't just
confirm what you already believed — run for real, it corrected a
specific, reasonable, wrong belief about this project's own code before
that belief could go anywhere else.

---

## Concept Unit: Proving the Test Would Actually Catch a Real Bug

### The Problem

Two real, passing tests now exist. A fair, skeptical question: how do
we know either one is actually checking anything — rather than, say,
`to_dict()` always returning something that happens to satisfy a
too-loose assertion, the same real trap
`automated-testing-unit-test-basics.md`'s own Try It Yourself names for
an accidentally empty test body? The only real way to answer that is to
break the real code on purpose and confirm the test actually notices.

### The New Code

Not a change to `Part.to_dict()` itself — this project's real source is
never actually broken to prove this. Instead, a real, temporary
substitution, verified this session and saved in full at
`lesson-0-verification/test_part_to_dict_deliberately_broken.py`:

```python
def _broken_to_dict(self):
    return {'id': self.id + '-OOPS', 'partNumber': self.part_number,
            'description': self.description}


def test_to_dict_reflects_the_fields_i_actually_set():
    PartClass.to_dict = _broken_to_dict
    app = create_app('testing')
    with app.app_context():
        part = Part(id='P-TEST', part_number='1234567', description='Test Bracket')
        data = part.to_dict()
        assert data['id'] == 'P-TEST'
```

`PartClass.to_dict = _broken_to_dict` reassigns, at runtime, which real
function `Part.to_dict()` actually calls — Python classes and their
methods are real, ordinary objects that can be reassigned like any
other variable; this is not special test-framework magic, it's a real,
general property of the language, aimed here at one specific method for
one deliberately broken run.

### Run it, per the Verification Rule

Real output, this session:

```
test_to_dict_deliberately_broken.py::test_to_dict_reflects_the_fields_i_actually_set FAILED [100%]

================================== FAILURES ===================================
_______________ test_to_dict_reflects_the_fields_i_actually_set _______________

    def test_to_dict_reflects_the_fields_i_actually_set():
        ...
        data = part.to_dict()
>       assert data['id'] == 'P-TEST'
E       AssertionError: assert 'P-TEST-OOPS' == 'P-TEST'
E
E         - P-TEST
E         + P-TEST-OOPS

1 failed, 5 warnings in 1.02s
```

(Full real capture: `lesson-0-verification/real-output.txt`, "RUN
3.") The `-`/`+` lines are `pytest`'s own real diff of the two
compared strings — `-` for the expected value, `+` for what was
actually produced — the same real reporting mechanism, applied here to
a deliberately introduced, real bug.

### CS Lens

This is the real, concrete version of a **mutation test** — deliberately
introducing a real fault into working code specifically to confirm a
test suite notices, rather than trusting that a suite of passing tests
means the code is actually being checked.

Also recognized in: real mutation-testing tools (`mutmut` for Python,
`Stryker` for JavaScript) that automate exactly this — generating many
small, real code mutations automatically and reporting which ones no
test caught, as a real measure of test quality that a raw "percent of
lines executed" coverage number cannot provide on its own.

### SE Lens

A test suite with 100% of its lines executed but zero real assertions
would report exactly the same "all green" result this project's own
`test_schema.py` and `test_xml_import()`-style scripts already do —
real code that runs, prints things, and exits successfully, without a
single automated, machine-checked claim anywhere in it. This unit is
the real, concrete difference between "this ran with no errors" and
"this was actually checked" — the exact gap `REFACTORING_FINAL_SUMMARY.md`
fell into by equating "the build succeeds" with "the refactor is
correct."

### Connecting this unit to what came before

Both of this lesson's real tests are now proven, not assumed, to
actually notice when `Part.to_dict()` stops doing what it's supposed
to — the same real protection this project's own frontend refactor
never had, and the exact reason it looked finished for two weeks before
new feature work proved otherwise.

---

## Connect the pieces

One concrete value, `'P-TEST'`, moved through every unit this lesson
built: constructed as `Part(id='P-TEST', ...)`, read back out of a real
`to_dict()` call, and checked with a real `assert` — the exact
mechanism `automated-testing-unit-test-basics.md` already proved in
isolation, now applied, for the first time, to this project's own real
code. Along the way, running instead of assuming caught two real,
honest things a plain reading of the code would have missed: that
constructing *any* single model in this project requires the rest of
its model registry to already be resolvable, and that `status`'s
declared `'draft'` default doesn't exist yet on a `Part` that's never
been written to a database. Both tests, run one final time, still pass;
deliberately breaking the real method they test proved, for real, that
they'd notice if it stopped being true.

---

**Next lesson:** a real test against a real Flask *route* — this
lesson's `Part` was tested in complete isolation from any actual HTTP
request; the next real question is what changes, and what stays
exactly the same, once a real request and a real response are involved.
