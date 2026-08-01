# Lesson 3: A Real Terminal Interface, and Swappable Behavior
### (Project 1 — Personal Notes, Python)

**What you will build.** `note.py` and `repository.py` stop being things
you only run by editing their `__main__` blocks by hand — this lesson
gives the project a real command-line interface: `python3 cli.py add
"title" "body"` and `python3 cli.py list`, with an optional `--sort`
flag. The transferable problems this lesson is actually about: turning
raw text typed at a terminal into structured, validated arguments your
code can trust, and — once "list" needs more than one fixed behavior —
making a behavior itself swappable, chosen at runtime instead of baked
into an `if`/`elif` chain.

**What you need to know first.** Lesson 2 — `Note`, and
`NoteRepository`'s `add`, `save`, and `load`.

---

## Concept Unit: Reading Arguments From the Command Line

### The Problem

Every note so far has been hardcoded inside a Python file's
`if __name__ == "__main__":` block. To actually *use* a notes app, you
need to type a new note's title and body at the terminal and have the
program read them — without editing source code every single time.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `cli.py`.
- **Change type** — add.
- **Location** — new file, same directory as `note.py` and
  `repository.py`.
- **Dependencies** — `argparse`, part of Python's standard library — no
  installation needed.

### The New Code

```python
import argparse
from note import Note
from repository import NoteRepository


def load_repo():
    repo = NoteRepository("notes.json")
    try:
        repo.load()
    except FileNotFoundError:
        pass
    return repo


def run_add(args):
    repo = load_repo()
    repo.add(Note(args.title, args.body))
    repo.save()


def run_list(args):
    repo = load_repo()
    for note in repo.notes:
        print(note.summary())


parser = argparse.ArgumentParser()
subparsers = parser.add_subparsers(dest="command", required=True)

add_parser = subparsers.add_parser("add")
add_parser.add_argument("title")
add_parser.add_argument("body")

list_parser = subparsers.add_parser("list")

args = parser.parse_args()

if args.command == "add":
    run_add(args)
elif args.command == "list":
    run_list(args)
```

### The Updated Project

`cli.py` is a brand-new file, so the block above is the whole file —
there's no larger enclosing structure to show it inside of yet.

### Introduce the concept in isolation

The piece worth isolating here is the smallest thing `argparse` can do —
reading two plain positional values — separated from subcommands
entirely, which the next unit adds:

```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("title")
parser.add_argument("body")

args = parser.parse_args()
print(args.title)
print(args.body)
```

Run for real, with two arguments typed at the terminal exactly the way a
user would:

```
$ python3 argparse_lab.py "Groceries" "Milk, eggs, bread"
Groceries
Milk, eggs, bread
```

And run again with no arguments at all:

```
$ python3 argparse_lab.py
usage: argparse_lab.py [-h] title body
argparse_lab.py: error: the following arguments are required: title, body
```

The first run proves `parser.add_argument("title")` and
`parser.add_argument("body")` genuinely captured whatever was typed
after the script name, in order, and made them reachable as
`args.title` / `args.body`. The second run proves something just as
important: `argparse` — this is called **argument parsing** — validates
what was typed *before* your own code ever runs, refusing to proceed and
printing a usage message on its own when required arguments are
missing, rather than your code crashing later with a confusing error
about a missing variable.

This is exactly what `add_parser.add_argument("title")` and
`add_parser.add_argument("body")` are doing inside `cli.py`'s real `add`
subcommand above, just nested one level deeper — under `add_parser`
instead of directly under `parser` — which the next unit explains.

### Discard the throwaway example

`argparse_lab.py` is deleted — it only existed to prove positional
arguments and argparse's own validation work, in isolation from
subcommands. `cli.py`'s real parser is the permanent version.

### Mechanical walkthrough

- `import argparse` — **(b) hard concept reappearing**, the same
  `import` mechanics from Lesson 2, pulling in a different
  standard-library module.
- `parser = argparse.ArgumentParser()` — **(a) first appearance.**
  Constructs a new, empty parser object — nothing about its arguments
  has been described yet.
- `add_parser.add_argument("title")` (and `"body"` below it) — **(a)
  first appearance.** Registers one expected positional argument by
  name; `argparse` uses that name both to know *how many* values it
  needs to collect and as the attribute name it'll appear under
  afterward.
- `args = parser.parse_args()` — **(a) first appearance.** Reads the
  program's actual command-line input, checks it against everything
  registered with `add_argument`, and — only if everything required is
  present — returns an object holding the parsed values.
- `args.title` / `args.body` — **(a) first appearance.** Attribute
  access on the object `parse_args()` returned, named to match the
  strings passed to `add_argument` earlier.

### CS lens

This is **input validation at a boundary**: checking that data crossing
from an untrusted source (a human typing at a terminal) into your
program matches the shape your code expects, *before* any of your own
logic runs on it. Also recognized in: a web framework validating a form
submission before it reaches your handler, a compiler's parser rejecting
malformed syntax before semantic analysis ever sees it, a function's
type hints checked by a tool like `mypy` before the function runs at
all.

### SE lens

The alternative is reading `sys.argv` directly — Python's raw list of
whatever was typed on the command line — and manually checking its
length, converting types, and writing your own error messages by hand.
That's not hypothetical extra work avoided; it's real complexity
`argparse` is quietly handling for you already, visible in the second
run above: a missing-argument message, an exit code signaling failure,
and a `usage:` line, all generated without writing a single `if`
statement for it. The cost is depending on a specific library's API
rather than raw language primitives — a fair trade this early, since
`argparse` ships with Python itself.

### Commands needed

`python3 argparse_lab.py "Groceries" "Milk, eggs, bread"` — runs the
script, with everything after the filename becoming the arguments
`argparse` parses. Quoting `"Milk, eggs, bread"` matters here: without
quotes, the shell would split it into three separate arguments at the
spaces, not one.

### Run it

Shown above, both the successful run and the validation error.

### Connecting sentence

Two plain positional arguments now reach Python code safely — the next
unit turns this into something with more than one *kind* of command,
which is what the real project actually needs.

---

## Concept Unit: Subcommands

### The Problem

A notes CLI needs to do more than one thing: add a note, and list
existing ones — soon, probably delete one too. `add_argument("title")`
alone can't express "these two arguments only apply when the user typed
`add`, and this different, empty set applies when they typed `list`."
We need the CLI itself to branch on *which command* was requested, the
same way `git add` and `git log` are both `git`, but each expects
completely different arguments afterward.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — `cli.py` (already created in the previous unit;
  no changes needed here — the subparser code shown in that unit's real
  project code *is* this unit's subject, explained now).
- **Change type** — n/a, already in place.
- **Location** — n/a.
- **Dependencies** — none beyond the previous unit.

### The New Code

Already shown in full in the previous unit's Project Change. The
specific lines this unit explains:

```python
subparsers = parser.add_subparsers(dest="command", required=True)

add_parser = subparsers.add_parser("add")
add_parser.add_argument("title")
add_parser.add_argument("body")

list_parser = subparsers.add_parser("list")
```

### The Updated Project

Already shown in full as `cli.py` in the previous unit — nothing new to
add to the file here, only to explain.

### Introduce the concept in isolation

The real code above is small enough, and specific enough to argparse's
own API, that a separate throwaway version would just be the same six
lines with different names — so this unit explains the real code
directly instead of rehearsing it first.

### Discard the throwaway example

Not applicable — there was no separate throwaway example this time.

### Mechanical walkthrough

- `parser.add_subparsers(dest="command", required=True)` — **(a) first
  appearance.** Turns `parser` from "expects a flat list of arguments"
  into "expects one of several named sub-commands, each with its own
  arguments." `dest="command"` means whichever subcommand name the user
  typed will show up afterward as `args.command`. `required=True` means
  typing no subcommand at all is itself an error, the same way a missing
  positional argument was in the previous unit.
- `subparsers.add_parser("add")` — **(a) first appearance.** Registers
  `"add"` as a valid subcommand name and returns a brand-new parser —
  `add_parser` — that only applies when the user actually typed `add`.
- `add_parser.add_argument("title")` / `"body"` — **(b) hard concept
  reappearing**, exactly `add_argument` from the previous unit, just
  registered on `add_parser` instead of `parser` directly — so `title`
  and `body` are only required when the command is `add`.
- `subparsers.add_parser("list")` — **(b) hard concept reappearing**,
  same call, registering a second, independent subcommand with zero
  arguments of its own so far.

### CS lens

This is a **dispatch table** expressed through argparse's own API rather
than hand-written: one input (the first word typed) selects which of
several independent argument schemas — and, shortly, which of several
independent functions — applies. Also recognized in: `git <command>`,
`docker <command>`, `npm <command>` — nearly every real CLI tool with
more than one verb works exactly this way.

### SE lens

The alternative is one flat parser with every possible argument
optional, and a pile of manual checks inside your own code — "if `title`
was given but not `body`, that's an error; if neither was given, treat
it as list mode" — logic that argparse's subparsers express declaratively
instead. The real tradeoff: subparsers commit you to a fixed structure
(one required command name up front); a tool that genuinely needs
free-form, order-independent flags might not fit this shape as
cleanly. For a notes app with a small, fixed set of verbs, that's not a
real constraint.

### Commands needed

None new — same `python3 cli.py ...` invocation pattern.

### Run it

Deferred to the next unit, where `run_add`/`run_list` actually get
called — this unit's code by itself has nothing to execute yet, since
`args.command` isn't being *used* until then.

### Connecting sentence

The CLI can now tell `add` and `list` apart and validate each one's own
arguments separately — the next unit connects that decision to the
actual `NoteRepository` behavior from Lesson 2.

---

## Concept Unit: Wiring the CLI to the Repository

### The Problem

Parsing arguments correctly doesn't yet *do* anything — `args.title` and
`args.command` are just data sitting in memory until something acts on
them by calling into the `NoteRepository` from Lesson 2. And the very
first time this CLI runs for a brand-new user, there's no `notes.json`
file yet at all — Lesson 2 already showed `repo.load()` raising
`FileNotFoundError` in exactly that situation, and a CLI can't crash on
its very first use.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — `cli.py`, already created; the functions below
  are the parts of that same file not yet explained.
- **Change type** — n/a, already shown; explained now.
- **Location** — n/a.
- **Dependencies** — `note.py` and `repository.py` from Lessons 1–2.

### The New Code

```python
def load_repo():
    repo = NoteRepository("notes.json")
    try:
        repo.load()
    except FileNotFoundError:
        pass
    return repo


def run_add(args):
    repo = load_repo()
    repo.add(Note(args.title, args.body))
    repo.save()


def run_list(args):
    repo = load_repo()
    for note in repo.notes:
        print(note.summary())
```

and, at the bottom of the file:

```python
if args.command == "add":
    run_add(args)
elif args.command == "list":
    run_list(args)
```

### The Updated Project

Already shown in full as `cli.py` two units ago — this unit is explaining
the remaining, previously-unexplained lines of that same file.

### Introduce the concept in isolation

```python
def risky():
    raise ValueError("something went wrong")

try:
    risky()
    print("this line never runs")
except ValueError:
    print("caught it — the program keeps going")

print("still here")
```

Real output:

```
caught it — the program keeps going
still here
```

`risky()` raises an error partway through — proven by `"this line never
runs"` never printing — but instead of the whole program crashing the
way `repo_broken.py` did back in Lesson 2, the `except ValueError:`
block catches it and execution continues normally afterward, all the way
to `"still here"`. This is called a **try/except block**: `try` marks
code that might fail, and `except <ErrorType>:` marks what to do
*instead of crashing* if that specific kind of error happens. This is
exactly what `load_repo()`'s `try: repo.load() except
FileNotFoundError: pass` is doing with the real project's
`FileNotFoundError` from Lesson 2 — `pass` here just means "do nothing,
deliberately" — leaving `repo.notes` at its already-empty default
instead of crashing on a brand-new user's very first run.

### Discard the throwaway example

`risky()` is deleted — its only job was proving `try`/`except` actually
prevents a crash and lets execution continue, isolated from
`FileNotFoundError` and file I/O entirely.

### Mechanical walkthrough

- `def load_repo():` — **(c) already basic**, a plain function
  definition.
- `repo = NoteRepository("notes.json")` — **(c) already basic**, the
  same constructor call from Lesson 2, with a fixed path.
- `try:` / `except FileNotFoundError:` / `pass` — **(a) first
  appearance**, covered above.
- `def run_add(args):` — **(c) already basic.** `args` here is the
  object `parser.parse_args()` returned — the same object type isolated
  two units ago, just passed in as a parameter instead of used as a
  global.
- `repo.add(Note(args.title, args.body))` — **(b) hard concept
  reappearing**: `Note(...)` from Lesson 1, `repo.add(...)` from
  Lesson 2, now fed by real parsed CLI input instead of hardcoded
  strings.
- `repo.save()` — **(b) hard concept reappearing**, Lesson 2's method,
  unchanged.
- `def run_list(args):` / `for note in repo.notes: print(note.summary())`
  — **(b) hard concept reappearing**, the same loop-and-summarize
  pattern from Lesson 2's own `__main__` block.
- `if args.command == "add": run_add(args) elif args.command == "list":
  run_list(args)` — **(a) first appearance** of `elif`: a second
  condition checked only if the first one was false — here, dispatching
  to exactly one of the two functions based on which subcommand
  `args.command` actually holds.

### CS lens

Together, `load_repo`/`run_add`/`run_list` form the **application
layer** in a layered design: a thin layer whose only job is translating
between the outside world (parsed CLI arguments) and the domain objects
underneath (`Note`, `NoteRepository`) — it contains no storage logic and
no argument-parsing logic of its own, only coordination between the two.
Also recognized in: a web framework's "view" or "controller" functions,
which translate an HTTP request into calls against the same kind of
domain objects a CLI or a test would also call directly.

### SE lens

The alternative is putting `NoteRepository` calls directly inside the
`if args.command == "add":` block at the bottom of the file, with no
`run_add`/`run_list` functions at all. That would work for exactly two
commands — but every future subcommand this project adds (delete,
search, edit) would keep growing that one `if`/`elif` chain instead of
adding one clearly-named function each. The functions cost a small
amount of indirection now, in exchange for a CLI that can keep growing
without its dispatch logic turning into a wall of nested conditionals.

### Commands needed

None new — same invocation pattern, now doing real work.

### Run it

```
$ python3 cli.py add "Groceries" "Milk, eggs, bread"
$ python3 cli.py add "Gym" "Leg day tomorrow"
$ python3 cli.py list
Groceries: Milk, eggs, bread
Gym: Leg day tomorrow
```

And, confirming an unrecognized command is rejected by `argparse` itself
— before `run_add`/`run_list` are ever reached:

```
$ python3 cli.py delete "Groceries"
usage: cli.py [-h] {add,list} ...
cli.py: error: argument command: invalid choice: 'delete' (choose from 'add', 'list')
```

### Connecting sentence

Every piece from Lessons 1 and 2 — `Note`, `NoteRepository`, JSON
persistence — is now reachable from an actual terminal command, typed by
hand, exactly the way a real user would use this program.

---

## Concept Unit: Swappable Sort Behavior — the Strategy Pattern

### The Problem

`run_list` always prints notes in whatever order they happen to sit in
`repo.notes` — insertion order, with no way to ask for anything else.
The moment there are more than a handful of notes, "in the order I
happened to add them" stops being useful; a user will want them
alphabetically, or by which is longest, or some other ordering entirely
— and hardcoding one specific order into `run_list` would mean every new
ordering needs its own new function, or another `if`/`elif` chain
growing inside `run_list` itself.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `cli.py`.
- **Change type** — add (new functions and a `--sort` flag).
- **Location** — new functions above `load_repo`; `--sort` added to
  `list_parser`; `run_list` modified to use it.
- **Dependencies** — none new.

### The New Code

```python
def by_title(note):
    return note.title


def by_length(note):
    return len(note.body)


SORT_STRATEGIES = {
    "title": by_title,
    "length": by_length,
}
```

and `run_list` changes to:

```python
def run_list(args):
    repo = load_repo()
    notes = repo.notes
    if args.sort:
        strategy = SORT_STRATEGIES[args.sort]
        notes = sorted(notes, key=strategy)
    for note in notes:
        print(note.summary())
```

and the `list` subparser gains one line:

```python
list_parser.add_argument("--sort", choices=SORT_STRATEGIES.keys(), default=None)
```

### The Updated Project

```python
def by_title(note):                     # ← new
    return note.title                   # ← new


def by_length(note):                    # ← new
    return len(note.body)               # ← new


SORT_STRATEGIES = {                     # ← new
    "title": by_title,                  # ← new
    "length": by_length,                # ← new
}


def load_repo():
    repo = NoteRepository("notes.json")
    try:
        repo.load()
    except FileNotFoundError:
        pass
    return repo


def run_add(args):
    repo = load_repo()
    repo.add(Note(args.title, args.body))
    repo.save()


def run_list(args):
    repo = load_repo()
    notes = repo.notes
    if args.sort:                                    # ← new
        strategy = SORT_STRATEGIES[args.sort]         # ← new
        notes = sorted(notes, key=strategy)           # ← new
    for note in notes:
        print(note.summary())


parser = argparse.ArgumentParser()
subparsers = parser.add_subparsers(dest="command", required=True)

add_parser = subparsers.add_parser("add")
add_parser.add_argument("title")
add_parser.add_argument("body")

list_parser = subparsers.add_parser("list")
list_parser.add_argument(                                            # ← new
    "--sort", choices=SORT_STRATEGIES.keys(), default=None            # ← new
)                                                                      # ← new

args = parser.parse_args()

if args.command == "add":
    run_add(args)
elif args.command == "list":
    run_list(args)
```

`run_list` no longer contains any ordering logic of its own — it just
looks up whichever function the user asked for by name and hands it to
`sorted()`. Adding a third ordering later means adding one small
function and one dictionary entry; `run_list` itself never changes
again.

### Introduce the concept in isolation

```python
words = ["banana", "fig", "cherry"]

by_alphabet = sorted(words)
by_length = sorted(words, key=len)

print(by_alphabet)
print(by_length)
```

Real output:

```
['banana', 'cherry', 'fig']
['fig', 'banana', 'cherry']
```

Same list, two completely different orderings — proving `sorted()`'s
`key` argument genuinely changes *what's compared* to decide order.
Passing `len` — Python's own built-in length function — as `key` works
because in Python, a function is itself a value, the same way a number
or a string is: it can be stored in a variable, passed as an argument,
and called later through whatever name holds it. This is called a
**higher-order function**: `sorted()` takes another function as one of
its own arguments, and decides *when* to call it, rather than the caller
calling it directly. `SORT_STRATEGIES = {"title": by_title, "length":
by_length}` in the real code above is the exact same idea, one level up:
a dictionary whose *values* are functions, picked by name at runtime
instead of being called directly by a hardcoded line of code.

### Discard the throwaway example

`words`, `by_alphabet`, and `by_length` above are deleted — they existed
only to prove `sorted(..., key=...)` accepts a function as a value,
isolated from `Note`, argparse, and the strategy dictionary entirely.

### Mechanical walkthrough

- `def by_title(note): return note.title` / `def by_length(note): return
  len(note.body)` — **(c) already basic**: two plain functions, each
  one line, using attribute access already taught in Lesson 1 and the
  built-in `len()` from the isolated lab just above.
- `SORT_STRATEGIES = {...}` — **(b) hard concept reappearing**: the
  same dict-literal syntax from `to_dict()` in Lesson 2, except this
  dict's values are functions themselves, not strings — a direct
  application of what the isolated lab just proved.
- `if args.sort:` — **(c) already basic**, a plain conditional; true
  only when `--sort` was actually given, since its `default=None` from
  the CLI update makes a falsy value the default otherwise.
- `strategy = SORT_STRATEGIES[args.sort]` — **(b) hard concept
  reappearing**: the same `[]` dict-indexing from `from_dict()` in
  Lesson 2 — here it looks up a *function*, not a string, by the name
  the user typed (`"title"` or `"length"`).
- `notes = sorted(notes, key=strategy)` — **(b) hard concept
  reappearing**, the exact `sorted(..., key=...)` call from the isolated
  lab, now with `strategy` — whichever function was just looked up —
  standing in for the hardcoded `len` used there.
- `list_parser.add_argument("--sort", choices=SORT_STRATEGIES.keys(),
  default=None)` — **(a) first appearance** of an *optional* argument:
  the leading `--` is what makes it optional rather than positional (no
  `--`, as with `title`/`body` earlier). `choices=...` — **(a) first
  appearance** — tells `argparse` to reject any value that isn't a key
  already present in `SORT_STRATEGIES`, automatically, the same way it
  already rejected a missing `title` back in the first unit.

### CS lens

This is the **Strategy pattern**: a family of interchangeable behaviors
(here, two different ways to order a list), each satisfying the same
shape — a function that takes one `Note` and returns something
comparable — selected at runtime instead of hardcoded into the code that
uses them. Also recognized in: a compression library letting you choose
`gzip` vs `zstd` at call time, a payment system swapping between credit
card and PayPal processors behind one interface, a game AI swapping
between "aggressive" and "defensive" behavior functions each turn.

### SE lens

The alternative — the thing this unit's Problem section rejected — is an
`if`/`elif` chain inside `run_list` itself: `if args.sort == "title":
notes = sorted(notes, key=lambda n: n.title) elif args.sort ==
"length": ...`. That scales badly: every new ordering adds another
branch to the same function, and `run_list` keeps growing forever. The
dictionary-of-functions version costs slightly more indirection to read
for someone seeing it the first time, and in exchange, adding a third
ordering — say, `by_word_count` — means writing one new function and
adding one new dictionary entry, with `run_list` itself never touched
again. Worth naming honestly: **this is Python's idiomatic shape for
Strategy** — a plain function is enough, because functions are already
values here. Later, in Phase 3 (Java), the same pattern will need an
actual interface and separate classes implementing it, because Java
doesn't let you pass a bare function around the same way — the *pattern*
is identical, but the language shapes how much ceremony it takes to
express it.

### Commands needed

None new.

### Run it

```
$ python3 cli.py list
Groceries: Milk, eggs, bread
Gym: Leg day tomorrow
Ants: Get rid of the ants

$ python3 cli.py list --sort title
Ants: Get rid of the ants
Groceries: Milk, eggs, bread
Gym: Leg day tomorrow

$ python3 cli.py list --sort length
Gym: Leg day tomorrow
Groceries: Milk, eggs, bread
Ants: Get rid of the ants
```

And an invalid `--sort` value, rejected by `argparse`'s `choices=` before
`run_list` ever runs:

```
$ python3 cli.py list --sort banana
usage: cli.py list [-h] [--sort {title,length}]
cli.py list: error: argument --sort: invalid choice: 'banana' (choose from 'title', 'length')
```

### Connecting sentence

`run_list` now supports as many orderings as `SORT_STRATEGIES` has
entries for, chosen by the user at the terminal, without a single `if`
inside `run_list` caring which one was picked.

---

## Closing

**Connect the pieces.** One typed command, start to finish: running
`python3 cli.py list --sort title` causes `argparse` to parse `"list"`
into `args.command` and `"title"` into `args.sort`; the bottom-of-file
`elif` dispatches to `run_list(args)`; `load_repo()` builds a
`NoteRepository`, `try`s to `load()` it, and succeeds because
`notes.json` already exists from earlier `add` commands; `args.sort`
being truthy triggers `SORT_STRATEGIES["title"]`, which resolves to the
`by_title` function; `sorted(notes, key=by_title)` reorders the list
using that function without `run_list` ever knowing what "by_title"
actually means internally; and the loop at the end calls `.summary()` —
from Lesson 1 — on each note, in that new order.

**What breaks without this.** Delete the `try`/`except` around
`repo.load()` inside `load_repo()`, then run the CLI's `add` command
against a fresh directory with no `notes.json` yet:

```
Traceback (most recent call last):
  File "cli.py", line 34, in <module>
    run_add(args)
  File "cli.py", line 12, in run_add
    repo = load_repo()
  File "cli.py", line 8, in load_repo
    repo.load()
  File "repository.py", line 18, in load
    with open(self.path, "r") as f:
FileNotFoundError: [Errno 2] No such file or directory: 'notes.json'
```

That's the exact same `FileNotFoundError` from Lesson 2's closing
section, now surfacing at the CLI layer instead of a test script — proof
that `try`/`except` in `load_repo()` was doing real, load-bearing work,
not decoration. Restore it and the first `add` on a brand-new machine
works again.

**Exercises.**
1. Add a `delete` subcommand: a new subparser taking a `title` argument,
   a `run_delete(args)` function that removes the first matching note
   from `repo.notes` and saves, wired into the `elif` chain.
2. Add a third sort strategy, `by_body_length_desc`, that sorts longest
   body first (look at `sorted()`'s `reverse=` argument), and register
   it in `SORT_STRATEGIES` — confirm `run_list` needed zero changes.
3. Right now, typing the exact same title twice with `add` silently
   creates two separate notes. Add a check in `run_add` that refuses to
   add a note whose title already exists in `repo.notes`, printing a
   clear message instead.

**Definition of done.**
- [ ] `cli.py` exists, with working `add` and `list` subcommands, both
      run for real from an actual terminal, not just described.
- [ ] `--sort title` and `--sort length` both produce genuinely
      different, correct orderings, confirmed by real output.
- [ ] You've seen `argparse`'s own validation errors fire for real: a
      missing argument, an unknown subcommand, and an invalid `--sort`
      choice.
- [ ] You've deliberately removed the `try`/`except` in `load_repo()`,
      seen the real `FileNotFoundError` crash the CLI, and restored it.
- [ ] Commit with a message explaining why — e.g. `"Make note ordering
      pluggable via a Strategy dict instead of branching in run_list"`
      — not `"add sorting"`.

**Next lesson** moves to real automated tests — no more confirming
behavior by eyeballing terminal output — and introduces the `Factory`
pattern once creating a `Note` stops being as simple as one constructor
call.
