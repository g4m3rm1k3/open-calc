# Lesson 1: Before a Language Can Run, Something Has to Run It

### (Executable Project + REPL)

**What you will build.** By the end of this lesson, `clojupye` is a real,
installed command on this machine: typing it at a terminal starts a loop
that prints a `Clojupye REPL` banner, shows a `>` prompt, reads whatever you
type, and recognizes two real commands — `:help` and `:quit` — while
echoing anything else back. Nothing evaluates Lisp yet; there is no reader,
no AST, no evaluator until Lesson 2 onward. The transferable problem this
lesson is actually about is bigger than Clojupye specifically: every
language implementation, every CLI tool, every long-running interactive
program starts from the exact same two unglamorous questions this lesson
answers for real — *how does a folder of source files become something the
operating system can run by name*, and *how does a program keep reading
input from a user forever without a single bad keystroke crashing it*.
Every later lesson in this curriculum runs through the `clojupye` command
this lesson builds; nothing after this point starts from `python
some_file.py` again.

**What you need to know first:** Lesson 0
(`lessons/000-deciding-before-building.md`) — no code is reused from it,
since Lesson 0 produced only `LANGUAGE-SPEC.md` and never wrote a line of
Python. What *is* reused: the language's decided name, `Clojupye`, and its
decided file extension, `.clj` (`LANGUAGE-SPEC.md`, both stated in Lesson
0) — this lesson's project is literally named `clojupye`, and its REPL
banner prints that exact name.

## Terms used in this lesson

- **Virtual environment** — an isolated copy of Python's package-lookup
  machinery: its own `site-packages` folder, layered on top of a real,
  shared Python interpreter, so that packages installed for one project
  never leak into, or conflict with, another project's packages or the
  system-wide Python install. Exists because two unrelated projects on the
  same machine can legitimately need two different, incompatible versions
  of the same library, and a single shared package folder has no way to
  satisfy both at once.
- **Package (Python)** — a directory containing an `__init__.py` file,
  which is what makes Python treat that directory as one importable unit,
  itself capable of holding further modules and sub-packages. Exists so
  related code can be organized into a tree of names (`clojupye.repl`,
  later `clojupye.reader`, `clojupye.compiler`) instead of one flat pile of
  same-level files with no grouping at all.
- **Module (Python)** — a single `.py` file, imported as one unit; the
  smallest piece of code Python's `import` statement can name directly.
  Exists as the base unit of code reuse — every package is ultimately built
  out of modules, the same way a package is built out of sub-packages.
- **`src` layout** — a project convention where the installable package
  lives inside a `src/` folder (`src/clojupye/`) rather than sitting
  directly at the project's root (`clojupye/` next to `pyproject.toml`).
  Exists to prevent a specific, easy-to-miss mistake: without it, Python
  can accidentally import the *raw, on-disk, uninstalled* copy of your
  package just because it happens to share a folder with whatever script
  you ran — silently masking a real installation bug behind code that
  still happens to work by accident.
- **TOML** — a plain-text configuration-file format (the name expands to
  "Tom's Obvious, Minimal Language") built around bracketed tables
  (`[section]`) and `key = value` pairs, designed to be parsed
  unambiguously by a machine while still reading cleanly to a human.
  Exists as `pyproject.toml`'s format because Python's own packaging
  standards (PEP 518, PEP 621) needed one tool-agnostic file every
  installer, build tool, and linter could agree to read, instead of every
  tool inventing its own private config format.
- **Build backend** — the specific program responsible for turning a
  project's source files into an installable package, named inside
  `pyproject.toml`'s `[build-system]` table. Exists because "package up
  this Python project" is not one fixed, universal algorithm — different
  backends (`setuptools`, `hatchling`, `flit_core`, others) make different
  tradeoffs about configuration and discovery, so a project has to state
  which one it's actually using.
- **Editable install** — an install mode (`pip install -e .`) where the
  installed package is a live pointer back to the source files already on
  disk, instead of a frozen, copied snapshot of them. Exists so a project
  under active development can be run through its real, installed command
  after every edit, with no separate reinstall step between changing a
  file and rerunning it.
- **Console-script entry point** — a declared mapping, inside
  `pyproject.toml`'s `[project.scripts]` table, from a command name (typed
  at a terminal) to a specific Python function. Exists so "install this
  package" and "get a real, standalone command out of it" don't require a
  separate, hand-written wrapper script for every platform.
- **Dependency resolution** — the process a package manager runs to
  compute one concrete, mutually compatible set of package versions that
  satisfies every declared version constraint — including the constraints
  a dependency's *own* dependencies bring along, recursively. Exists
  because installing one package can quietly require several others, and
  working out by hand which versions of all of them actually work together
  does not scale past a handful of packages.
- **Optional dependency group ("extra")** — a named, separately installable
  subset of a project's dependencies (`[project.optional-dependencies]`),
  pulled in only when a caller explicitly opts in (`pip install ".[dev]"`).
  Exists so a package's dependency list, as seen by someone who just wants
  to *use* it, stays minimal, while tools only needed during development (a
  test runner) are still declared, versioned, and reproducible instead of
  "go install pytest yourself and hope the version doesn't matter."
- **Command dispatch** — the pattern of inspecting one piece of input and
  branching to a specific handler based on what it actually says, rather
  than treating every input identically. Exists as its own named idea
  because almost anything that reads interactive input at all — REPLs,
  command-line tools, chat commands, a game's debug console — reduces to
  some shape of this same pattern.
- **Fixture (pytest)** — a named, reusable piece of test setup that pytest
  automatically hands to a test function by matching the fixture's name to
  one of that function's parameter names. Exists so setup logic (patching a
  function, capturing output) gets written once, in one place, instead of
  copy-pasted at the top of every test that needs it.
- **Monkeypatching** — temporarily replacing a real object, function, or
  attribute with a stand-in for the duration of one test, with the original
  automatically restored afterward. Exists so a test can control something
  normally outside the test's control — like what a human "typed" — without
  changing a single line of the code actually being tested.

## Objects and methods used

- **`python -m venv`**
  - *What it is:* the standard library's own environment-creation tool,
    invoked by running Python with the `-m` flag against the `venv`
    module, rather than a separately installed program.
  - *Implementation:* `venv` is a real package inside CPython's own
    standard library; run as `python -m venv ENV_DIR`, its `__main__`
    submodule builds a new directory tree (`ENV_DIR/`) containing a link or
    copy of the interpreter plus a fresh, empty `site-packages`, and a
    `pyvenv.cfg` file recording which real Python it was built from.
  - *Its use:* creates `.venv/` for this project — Concept Unit 1.
- **`tomllib.load(fp)`**
  - *What it is:* the standard library's own TOML parser, added to Python
    in version 3.11.
  - *Implementation:* real signature — `tomllib.load(fp: BinaryIO) -> dict`
    — takes a file object opened in binary mode (`"rb"`), and returns
    nested Python `dict`s, lists, and strings mirroring the TOML file's own
    tables and keys.
  - *Its use:* proves `pyproject.toml` really is just structured data a
    real parser reads — Concept Unit 3's isolated lab.
- **`pip install -e .`** (and `pip install -e ".[dev]"`)
  - *What it is:* pip's editable-install mode, which builds and links a
    package using that project's own `pyproject.toml` instead of
    downloading one from a package index.
  - *Implementation:* reads `[build-system]` to know which backend to
    invoke, builds an "editable wheel" (a thin package that points back at
    the real source tree instead of copying it), and — separately —
    resolves and installs every dependency named under `[project]`
    (plus, when a bracketed suffix like `.[dev]` is given, the matching
    `[project.optional-dependencies]` group too).
  - *Its use:* makes `clojupye` a real, callable command — Concept Unit 4;
    later adds pytest as a declared dev dependency — Concept Unit 8.
- **`importlib.metadata.entry_points()`**
  - *What it is:* a standard-library function for querying, at runtime,
    the entry points every currently-installed package has declared.
  - *Implementation:* real signature — `entry_points(*, group=None,
    name=None) -> EntryPoints` — returns matching `EntryPoint` objects,
    each exposing `.name`, `.value` (the dotted `module:function` string),
    and `.load()` (imports and returns the actual referenced callable).
  - *Its use:* proves the `clojupye` → `clojupye.repl:main` mapping is
    real, inspectable installed metadata, not a hidden mechanism — Concept
    Unit 4's isolated lab.
- **`input(prompt)`**
  - *What it is:* a Python built-in function that writes a prompt to
    standard output and then blocks until a complete line has been typed
    and Enter pressed.
  - *Implementation:* real signature — `input(prompt='', /) -> str` —
    writes `prompt` with no trailing newline, reads one line from standard
    input, strips the trailing newline before returning it, and raises
    `EOFError` if the input stream ends before a line is completed.
  - *Its use:* the entire "read" half of the REPL's read loop — Concept
    Unit 5.
- **`print(*values, sep=' ', end='\n')`**
  - *What it is:* a Python built-in function that writes text to standard
    output.
  - *Implementation:* real signature — `print(*objects, sep=' ',
    end='\n', file=sys.stdout, flush=False)` — converts every positional
    argument to its string form, joins them with `sep`, and writes the
    result followed by `end`.
  - *Its use:* writes the startup banner, echoes ordinary input back, and
    prints the two `:help` lines — Concept Unit 5 onward.
- **`EOFError`**
  - *What it is:* a built-in exception class, raised specifically when a
    function reading from an input stream reaches the end of that stream
    with no more data left to read.
  - *Implementation:* a plain subclass of `Exception` in CPython's own
    exception hierarchy; carries no special payload beyond the ordinary
    exception message — `input()` raises it itself, internally, the moment
    it detects end-of-stream instead of a completed line.
  - *Its use:* the signal this REPL relies on to know the input source
    (a human at a keyboard, or a piped file) has genuinely run out —
    Concept Unit 6.
- **`KeyboardInterrupt`**
  - *What it is:* a built-in exception class, raised when the running
    process receives an interrupt request — on most platforms, the user
    pressing Ctrl+C.
  - *Implementation:* also a direct subclass of `BaseException` (not
    `Exception` — deliberately outside the hierarchy most `except
    Exception:` handlers catch, so an interrupt request isn't accidentally
    swallowed by generic error-handling code elsewhere in a larger
    program).
  - *Its use:* lets one accidental Ctrl+C cancel whatever's being typed on
    the current line without killing the whole REPL process — Concept Unit
    6.
- **`str.strip()`**
  - *What it is:* a method on Python's built-in `str` type.
  - *Implementation:* real signature — `str.strip(chars=None) -> str` —
    returns a *new* string with leading and trailing whitespace (or the
    given characters) removed; strings are immutable in Python, so this
    never modifies the original.
  - *Its use:* normalizes a typed line so `"  :help  "` and `":help"`
    dispatch identically, and so a line that's only whitespace becomes an
    empty string the dispatch logic can detect and skip — Concept Unit 7.
- **`monkeypatch.setattr(target, value)`**
  - *What it is:* a method on pytest's own built-in `monkeypatch` fixture
    object.
  - *Implementation:* real signature — `setattr(target: str, value) ->
    None` — given a dotted string path (`"builtins.input"`), replaces that
    attribute with `value` for the duration of the current test only;
    pytest itself restores the original automatically during teardown, no
    explicit cleanup code required.
  - *Its use:* replaces the real, terminal-blocking `input()` with a
    scripted stand-in that returns pre-written lines — Concept Unit 8.
- **`capsys.readouterr()`**
  - *What it is:* a method on pytest's own built-in `capsys` fixture
    object.
  - *Implementation:* real signature — `readouterr() -> CaptureResult` — a
    two-field result exposing `.out` and `.err`, holding everything written
    to standard output and standard error since the test started (or since
    the previous call to this same method).
  - *Its use:* lets a test assert on exactly what the REPL printed, without
    needing a real terminal to watch — Concept Unit 8.

---

## Concept Unit 1: Virtual Environments

### The Problem

Before a single line of Clojupye's own code can exist, a more basic
question needs an answer: when this project eventually depends on a real
package (it will — Section 20 of `Curriculum.md` names `requests`, `numpy`,
`PySide6` by name, and even this very lesson needs `setuptools` and
`pytest`), where do those packages actually get installed to? If the answer
is "wherever this machine's one shared Python already keeps its packages,"
every future Python project on this machine is now silently entangled with
every other one — a version bump for one project's sake can quietly break
a completely unrelated project that happened to need an older version of
the same library.

### Project Change

- **Reference Source:** `Curriculum.md`, Capability 1.1's own `Learn:`
  list — `virtual environments` — read this session.
- **Files affected:** `code/clojupye/.venv/`, created; nothing else exists
  in the project yet.
- **Change type:** create.
- **Location:** project root — `code/clojupye/`, a fresh, empty directory.
- **Dependencies:** a working Python install on the machine (this session:
  Python 3.14.3, confirmed via `python --version`); nothing else.

### The New Code — type it yourself

```text
python -m venv .venv
```

### The Updated Project

There is no existing structure to place this inside — this is the very
first thing created in a brand-new project directory, so Project Change's
own exception for a from-scratch addition applies here.

```text
code/clojupye/
└── .venv/
    ├── Include/
    ├── Lib/
    ├── Scripts/
    │   ├── python.exe
    │   ├── pythonw.exe
    │   ├── pip.exe
    │   ├── pip3.exe
    │   ├── pip3.14.exe
    │   ├── activate
    │   ├── activate.bat
    │   ├── Activate.ps1
    │   ├── activate.fish
    │   └── deactivate.bat
    └── pyvenv.cfg
```

Every command for the rest of this lesson runs through the interpreter
sitting inside this folder — `.venv/Scripts/python.exe` — never the
machine's own system-wide `python`.

### Introduce the Concept in Isolation

The command above already *is* the isolated case — there's no smaller
throwaway version of "create a virtual environment" than the real one. What
proves the isolation claim is reading the file it produced, real and
unedited, from this session:

```text
home = C:\Python314
include-system-site-packages = false
version = 3.14.3
executable = C:\Python314\python.exe
command = C:\Python314\python.exe -m venv C:\Users\g4m3r\Documents\open-calc\code\clojupye\.venv
```

This is `.venv/pyvenv.cfg`, and it proves three things at once, none of
them assumed: `home` and `executable` record exactly which real,
system-wide Python this environment was built from (`C:\Python314`);
`include-system-site-packages = false` is the actual, on-disk setting that
makes this environment's `site-packages` *not* see whatever's already
installed globally — the isolation is a literal config flag, not a vague
promise; and `command` records the exact invocation that produced this
file, for real, this session — not paraphrased.

### Discard

Not applicable — there's no throwaway version separate from the real one
here; the command above created the real, permanent `.venv/` this whole
lesson builds on.

### Mechanical Walkthrough

- `python` — the machine's real, already-installed interpreter (Python
  3.14.3, confirmed via `python --version` this session), invoked one
  final time to *build* the isolated environment — after this point, this
  particular `python` is never invoked directly again in this project.
- `-m venv` — the `-m` flag tells the interpreter "run the named module as
  a program" instead of "run a file at this path"; `venv` is that module's
  name, resolved through Python's own standard library, not a
  separately-installed third-party tool.
- `.venv` — the one positional argument `venv`'s own `__main__` reads:
  the directory to create. The leading dot is an ordinary filesystem
  convention (a "hidden" folder on Unix-likes; on Windows it carries no
  special meaning to the filesystem itself, but the same leading-dot name
  is used here anyway, matching the convention every other environment
  this project's tooling recognizes).

### CS Lens

This is **resource isolation**: giving one logical unit (this project) its
own private view of a shared resource (installed packages), so that
changes made through one view are invisible to every other view, even
though they ultimately sit on the same physical disk. Also recognized in:
Docker containers (an isolated filesystem view layered over a shared
kernel), a Unix `chroot` jail, a browser tab's own isolated JavaScript
heap, a Java `ClassLoader`'s own private namespace for loaded classes.

### SE Lens

The alternative not chosen: install everything — `setuptools`, `pytest`,
and later `requests`/`numpy`/`PySide6` — straight into this machine's one
global Python. The real tradeoff: for a single, isolated project that's
the only thing using Python on this machine today, the global install
would *work*, and it's one fewer folder to create. The cost shows up later,
not now: `Curriculum.md`'s own Section 20 explicitly plans to install
several unrelated third-party packages, on the same machine, at different
points — a version conflict between two of them, or between one of them
and some other unrelated project entirely, becomes a real, hard-to-diagnose
failure that surfaces at the worst possible time (mid-lesson, mid-checkpoint)
instead of being structurally impossible from the very first command.

### Commands Needed

- `python --version` — confirms the interpreter used to *build* the
  virtual environment; real output this session: `Python 3.14.3`.
- `python -m venv .venv` — as walked through above; produces no output on
  success, only the new `.venv/` directory tree.

### Run It

Real, executed output, this session, listing what `python -m venv .venv`
actually produced:

```text
$ python -m venv .venv
$ ls .venv
Include
Lib
Scripts
pyvenv.cfg
```

### Connection

There is nothing to connect this unit to yet — it's the first one. Every
remaining unit in this lesson runs its commands through
`.venv/Scripts/python.exe` (or the executables it installs alongside it),
never the bare `python` this unit started from.

---

## Concept Unit 2: Packages, Modules, and the `src` Layout

### The Problem

The project needs an actual place for Clojupye's own Python code to live —
and Python draws a real distinction between "one file" and "a named,
importable group of files" that has to be decided before the first line of
that code is written, not discovered by accident later.

### Project Change

- **Reference Source:** `Curriculum.md`, Capability 1.1's `Learn:` list —
  `Python project structure`, `packages`, `modules` — and its own `Build:`
  tree:

  ```text
  yourlang/
      pyproject.toml
      src/
          yourlang/
      tests/
  ```

  read this session; `yourlang` is `Curriculum.md`'s own placeholder name,
  filled in here as `clojupye` per Lesson 0's decision.
- **Files affected:** `code/clojupye/src/clojupye/__init__.py`, created,
  empty; `code/clojupye/src/clojupye/repl.py`, created.
- **Change type:** create.
- **Location:** a new `src/clojupye/` folder, inside the `.venv`-only
  project directory Concept Unit 1 created.
- **Dependencies:** none yet — this is plain Python files, nothing
  installed or imported from outside the standard library.

### The New Code — type it yourself

```python
def run_repl() -> None:
    print("Clojupye REPL")


def main() -> None:
    run_repl()
```

This is `src/clojupye/repl.py`'s starting content — not yet a loop, not
yet a REPL in any real sense; just enough real code to prove the
package/module mechanics actually work before building anything more
elaborate on top.

### The Updated Project

A brand-new file has nothing to locate a position within, so this *is* the
whole new structure — `src/clojupye/repl.py`, shown whole above, plus one
sibling file with no content of its own:

```text
code/clojupye/
├── .venv/                    (Concept Unit 1)
└── src/
    └── clojupye/
        ├── __init__.py        ← new, empty
        └── repl.py             ← new, shown above
```

`__init__.py` being present, even completely empty, is what turns
`src/clojupye/` from "a folder that happens to contain a `.py` file" into
a real, importable Python package named `clojupye` — proven next, not just
asserted.

### Introduce the Concept in Isolation

This is exactly the module-vs-package distinction the real project above
just used — isolated here with a tiny, disposable, unrelated pair of files
in a scratch directory, run for real this session:

```text
greet.py                (a bare file — a module)
greetpkg/
├── __init__.py         (from .core import shout)
└── core.py             (def shout(msg): return msg.upper() + "!")
```

```text
$ python -c "
import greet
import greetpkg
print('module file:', greet.__file__)
print('module result:', greet.shout('hi'))
print('package file:', greetpkg.__file__)
print('package result:', greetpkg.shout('hi'))
"
module file: ...\modvpkg\greet.py
module result: HI
package file: ...\modvpkg\greetpkg\__init__.py
package result: HI!
```

This proves two real, distinct things at once: `import greet` resolves
directly to one file (`greet.py` — a **module**), while `import greetpkg`
resolves to a *directory's* `__init__.py` (a **package**) — and that
`__init__.py`'s own `from .core import shout` line is why `greetpkg.shout`
works at all: the package's `__init__.py` is what decides which names from
its inner modules (`core.py`) get exposed directly on the package itself,
rather than requiring `greetpkg.core.shout`. This is exactly what
`src/clojupye/__init__.py` will do later, once there's more than one
module inside `clojupye/` worth re-exporting — for now it stays empty on
purpose, because `repl.py` is still the only module inside the package.

### Discard

`greet.py` and `greetpkg/` above are not part of Clojupye — they lived only
in this session's scratch directory, existed only to prove the
module/package distinction, and are deleted now that it's proven.

### Mechanical Walkthrough

- `def run_repl() -> None:` — a function definition; `-> None` is a
  type-annotation stating this function's return value carries no
  meaningful data (Python does not enforce this at runtime, but it's a
  real, checkable claim a type checker or a careful reader can rely on).
- `print("Clojupye REPL")` — calls the built-in `print` function (full
  treatment above, in this lesson's own Objects and methods section) with
  one string literal — the project's decided name, from Lesson 0's
  `LANGUAGE-SPEC.md`, not `"YourLang"` — `Curriculum.md`'s own placeholder.
- `def main() -> None:` — a second, separate function, whose entire body
  is one call to `run_repl()`. Two functions instead of one exists for a
  concrete reason revisited in Concept Unit 4: `main` is the specific name
  the console-script entry point will be told to call, while `run_repl` is
  the actual REPL logic — kept separate so the REPL's own behavior can
  later be called directly (from a test, from `python -m clojupye`, from
  anywhere) without going through packaging machinery at all.
- `src/clojupye/__init__.py`, empty — its mere *existence*, not its
  contents, is what makes Python treat `src/clojupye/` as a package
  (proven above, in isolation, by `greetpkg/__init__.py`); an empty file is
  a legitimate, common package `__init__.py` when a package has nothing yet
  worth re-exporting at its own top level.

### CS Lens

This is **hierarchical namespacing**: `clojupye.repl` names something
precisely by combining a package name and a module name, the same way a
fully-qualified path names one exact file inside a directory tree. Also
recognized in: DNS's dotted domain names (`docs.python.org` — each dot one
level of a real hierarchy), a filesystem's own directory structure, Java's
package-per-directory convention (`com.example.myapp`), a REST API's nested
URL paths.

### SE Lens

The alternative not chosen: a *flat* layout, with `clojupye/` sitting
directly at the project root (a sibling of `pyproject.toml`), instead of
nested one level deeper inside `src/`. The real tradeoff: with a flat
layout, `python -c "import clojupye"`, run from the project root, works
immediately — no install step required at all — which feels convenient
early on. The cost: it works *for the wrong reason*. Python's own import
system searches the current directory before it searches installed
packages, so a flat layout means the on-disk source and "the installed
package" can silently be two different things resolving to the same
import — if the editable install from Concept Unit 4 were ever broken or
skipped, a flat layout would hide that breakage completely, because
`import clojupye` would keep working anyway, just via the wrong path. The
`src/` layout removes that ambiguity structurally: there is no
`code/clojupye/clojupye/` for a bare `import clojupye`, run from the
project root, to accidentally find — every run has to go through the real
installed package, which is exactly what Concept Unit 4 sets up.

### Commands Needed

None new — this unit only creates plain `.py` files.

### Run It

Not independently runnable as `clojupye` yet — no `pyproject.toml`, no
console-script entry point exists until Concept Units 3 and 4. What *is*
real and runnable right now is calling the function directly, proving the
module itself is correct before packaging exists at all:

```text
$ python -c "
import sys
sys.path.insert(0, 'src')
from clojupye.repl import main
main()
"
Clojupye REPL
```

### Connection

Concept Unit 1 gave this project an isolated place to install things;
this unit gives it something real to eventually install — a genuine,
importable `clojupye` package, proven above to work as both a module
(`repl.py`) and a package (`clojupye/`'s own `__init__.py`), even before
any packaging metadata exists to make it a real command.

---

## Concept Unit 3: `pyproject.toml`

### The Problem

`main()` from the previous unit can already be called — but only by
someone who knows to write three lines of `sys.path` manipulation and an
`import` first. Nothing yet states, in one place, what this project even
*is* (its name, what Python versions it supports), what tool should build
it into an installable package, or that the command that should run it is
supposed to be called `clojupye`.

### Project Change

- **Reference Source:** `Curriculum.md`, Capability 1.1's `Learn:` list —
  `` `pyproject.toml` `` — and its own `Build:` tree's top-level
  `pyproject.toml` line, read this session.
- **Files affected:** `code/clojupye/pyproject.toml`, created.
- **Change type:** create.
- **Location:** project root, sibling of `.venv/` and `src/`.
- **Dependencies:** none new yet — this file only declares intent; nothing
  is installed until Concept Unit 4.

### The New Code — type it yourself

```toml
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "clojupye"
version = "0.1.0"
description = "A Clojure-inspired Lisp that compiles to Python"
requires-python = ">=3.10"

[project.scripts]
clojupye = "clojupye.repl:main"

[tool.setuptools.packages.find]
where = ["src"]
```

### The Updated Project

A brand-new file — nothing to locate a position within:

```text
code/clojupye/
├── .venv/                    (Concept Unit 1)
├── src/
│   └── clojupye/              (Concept Unit 2)
│       ├── __init__.py
│       └── repl.py
└── pyproject.toml              ← new, shown whole above
```

### Introduce the Concept in Isolation

The file just written above is real, structured data, not a magic
incantation only pip understands — proven by loading it with nothing but
the standard library, this session, against this exact file:

```text
$ .venv/Scripts/python.exe -c "
import tomllib
with open('pyproject.toml', 'rb') as f:
    data = tomllib.load(f)
print(type(data))
print('project name:', data['project']['name'])
print('scripts table:', data['project']['scripts'])
"
<class 'dict'>
project name: clojupye
scripts table: {'clojupye': 'clojupye.repl:main'}
```

**This is called declarative configuration.** What this proves: `[project]`
and its nested keys become an ordinary, nested Python `dict` — the exact
same `dict` any Python code, including pip's own internals, would get by
reading this file. `data['project']['scripts']` shows the entry-point
mapping from Concept Unit 4 already sitting there as plain data, ready to
be read by *some* tool — but reading it here, with `tomllib`, is not
enough to make `clojupye` a real command; that step is next.

### Discard

Not applicable — `pyproject.toml` is not a throwaway; it's real, permanent
project configuration. What was isolated here was *reading* it with a
minimal, standalone script, separately from pip's own much larger process
of acting on it.

### Mechanical Walkthrough

- `[build-system]` — a TOML table naming the tool responsible for turning
  this source tree into an installable package.
- `requires = ["setuptools>=68"]` — a list with one string; `>=68` is a
  version constraint, read by pip *before* anything else in this file, so
  pip knows which package (and which minimum version of it) it must fetch
  first just to be able to understand the rest of this file.
- `build-backend = "setuptools.build_meta"` — a dotted string naming the
  exact Python object (a module, `setuptools.build_meta`) that implements
  the actual build steps pip will call into.
- `[project]` — a second, separate table; everything under it describes
  the package itself, independent of which backend builds it.
- `name = "clojupye"` — the installed package's own name; this is the
  string `pip list` and `pip show` will later display.
- `version = "0.1.0"` — a plain string, not a special version type;
  packaging tools parse it according to Python's own version-number
  standard (PEP 440) but the file itself just stores text.
- `description = "..."` — free-text metadata, displayed by tools like
  `pip show clojupye`; has no effect on how the package builds or runs.
- `requires-python = ">=3.10"` — a constraint pip checks *before*
  installing at all; installing this package with an interpreter older
  than 3.10 fails immediately, with a clear message, rather than installing
  successfully and failing later at some unrelated line of code.
- `[project.scripts]` — a *nested* table (the dotted name is TOML's own
  syntax for nesting one table inside another) — specifically the table
  Concept Unit 4 reads to generate the real `clojupye` command.
- `clojupye = "clojupye.repl:main"` — one key/value pair inside that
  table: the key (`clojupye`) is the command name a user will type; the
  value is a dotted path — module, then a colon, then the function name
  inside that module — pointing at exactly the `main` function Concept
  Unit 2 wrote.
- `[tool.setuptools.packages.find]` — a table under the `tool.*` namespace,
  which TOML and the packaging standard both explicitly reserve for
  backend-specific settings that don't belong in the shared `[project]`
  table.
- `where = ["src"]` — tells `setuptools` specifically (no other backend
  reads this key) to look for importable packages starting inside `src/`,
  rather than the project root — this is the one line of configuration
  that makes the `src` layout from Concept Unit 2 actually work with this
  particular build backend.

### CS Lens

This whole file is an instance of **declarative configuration**: it states
*what* the project is and *what* it needs, and leaves *how* to build and
install it entirely up to the tool that reads the file. Also recognized
in: SQL (`SELECT` states what rows you want, not how the database finds
them), a Kubernetes YAML manifest (states the desired running state, not
the exact sequence of API calls to reach it), HTML (describes a document's
structure, not the steps a browser takes to paint it).

### SE Lens

The alternative not chosen: an older Python packaging mechanism,
`setup.py`, where a project's metadata is described by *running* an
arbitrary Python script rather than reading inert data. The real tradeoff:
`setup.py` can do absolutely anything a Python script can do (conditional
logic, network calls, arbitrary side effects) while it's merely being
*read* by pip — which is exactly the risk `pyproject.toml` exists to
remove. A tool that only needs to know a project's name and version (a
linter, a security scanner, an IDE) can read `pyproject.toml` with nothing
more than a TOML parser and zero risk of executing anything, where the
same operation against a `setup.py`-based project has historically meant
running someone else's arbitrary code just to ask it "what's your name."

### Commands Needed

None new in this unit — `pyproject.toml` only becomes actionable once
Concept Unit 4 runs `pip install` against it.

### Run It

Not independently runnable as a program — this file has no `main()` of its
own. What's real and shown above is `tomllib` successfully parsing this
exact file, this session, proving its shape is valid before trusting pip to
act on it.

### Connection

Concept Unit 2 built a real, importable `clojupye.repl:main` the hard way
— by hand, with `sys.path` surgery. This unit is the one place that states,
declaratively, that `clojupye` (the command) should mean exactly that
function — nothing runs differently yet, but everything Concept Unit 4
needs to act on now genuinely exists.

---

## Concept Unit 4: Editable Installs and Console-Script Entry Points

### The Problem

`pyproject.toml` now *states* that `clojupye` should be a command mapped to
`clojupye.repl:main` — but stating it changes nothing about what a
terminal will do if you actually type `clojupye` right now. Nothing has
turned that declared intent into a real, callable program on this
machine's `PATH`.

### Project Change

- **Reference Source:** `Curriculum.md`, Capability 1.1's `Learn:` list —
  `command-line entry points`, `dependency installation` — and its own
  Checkpoint:

  ```text
  Run:

  yourlang

  and receive:

  YourLang REPL
  >
  ```

  read this session; this unit reaches the "runs and prints the banner"
  half of that checkpoint — the trailing `>` prompt that actually *waits*
  for input arrives in Concept Unit 5.
- **Files affected:** none of this project's own source files change;
  `.venv/Scripts/clojupye.exe` (a generated wrapper) and
  `src/clojupye.egg-info/` (generated install metadata) are created by
  this step, not written by hand.
- **Change type:** configure/install — no new hand-written code.
- **Location:** run from the project root, `code/clojupye/`.
- **Dependencies:** the `.venv` from Concept Unit 1; the `pyproject.toml`
  from Concept Unit 3; internet access, so pip can fetch `setuptools`
  itself (declared under `[build-system]`, but not yet present in this
  fresh, empty virtual environment).

### The New Code — type it yourself

```text
.venv/Scripts/python.exe -m pip install -e .
```

### The Updated Project

This command doesn't add a line to an existing file — it generates new
artifacts pip itself is responsible for, inside folders already shown in
Concept Unit 1 and 3:

```text
code/clojupye/
├── .venv/
│   └── Scripts/
│       ├── clojupye.exe        ← new, generated wrapper
│       └── ... (unchanged)
├── src/
│   ├── clojupye/                (unchanged)
│   └── clojupye.egg-info/       ← new, generated install metadata
│       └── entry_points.txt
└── pyproject.toml               (unchanged)
```

### Introduce the Concept in Isolation

`entry_points.txt`, one of the files pip just generated, is small enough to
read in full, real and unedited, from this session:

```text
[console_scripts]
clojupye = clojupye.repl:main
```

That text file alone isn't what makes the `clojupye` command run — it's
metadata *about* the mapping, read by Python's own standard library at
runtime, proven here with a small, standalone script separate from pip's
own much larger install process:

```text
$ .venv/Scripts/python.exe -c "
from importlib.metadata import entry_points
eps = entry_points(group='console_scripts', name='clojupye')
for ep in eps:
    print(repr(ep))
    print('name:', ep.name)
    print('value:', ep.value)
    print('loaded callable:', ep.load())
"
EntryPoint(name='clojupye', value='clojupye.repl:main', group='console_scripts')
name: clojupye
value: clojupye.repl:main
loaded callable: <function main at 0x00000228D38F64B0>
```

**This is called an entry point.** What this proves: `ep.load()` returns
the literal `main` function from `src/clojupye/repl.py`, resolved entirely
through installed metadata (`entry_points.txt`) — the exact same lookup
Windows' generated `clojupye.exe` wrapper performs internally every time
it's launched. Nothing about "what `clojupye` runs" is hardcoded anywhere
outside this one declared mapping.

### Discard

Not applicable — `entry_points.txt` and the generated `.exe` wrapper are
real, permanent (if machine-generated) parts of this installed
environment, not a throwaway example. What's isolated here is *inspecting*
the mechanism with a small standalone script, separately from trusting it
to just work.

### Mechanical Walkthrough

- `.venv/Scripts/python.exe` — the isolated interpreter Concept Unit 1
  built, invoked directly by its real path rather than relying on a bare
  `python` that might resolve to the system-wide interpreter instead.
- `-m pip` — same `-m`-flag mechanism from Concept Unit 1, this time
  running `pip`'s own module instead of `venv`'s.
- `install` — pip's subcommand for resolving and installing a package.
- `-e` — short for `--editable`; tells pip to build an *editable* install
  (full definition above, in Terms) instead of the default, which copies
  a frozen snapshot of the source into `site-packages`.
- `.` — a plain filesystem path: "the project rooted in the current
  directory," i.e. wherever `pyproject.toml` (Concept Unit 3) lives; not a
  package name pip would look up on a package index.

### CS Lens

Looking up `ep.load()` by name, at runtime, through installed metadata
rather than a hardcoded function reference, is **indirection through a
lookup table**: a name (`"clojupye"`) maps to a value (a real callable)
through one level of stored data, so the mapping can be changed, inspected,
or listed without touching the code that eventually calls it. Also
recognized in: a compiled program's virtual method table (a method call
resolved through a table, not hardcoded to one function address), a web
framework's URL router (a path string mapped to a handler function), a DNS
record (a name mapped to an address, looked up, not hardcoded into every
program that needs it).

### SE Lens

The alternative not chosen: a hand-written wrapper script — a `.sh` file
on Unix, a `.bat` or `.ps1` file on Windows — that runs `python -m
clojupye.repl` and is manually placed somewhere on `PATH`. The real
tradeoff: a hand-written wrapper needs a *separate* implementation per
platform (this project's own environment is Windows; a teammate on Linux
would need a different file entirely) and has no connection to pip's own
bookkeeping — `pip uninstall clojupye` would have no way to know the
wrapper script exists, let alone remove it. The console-script mechanism
costs nothing extra to declare (it was already sitting in Concept Unit 3's
`pyproject.toml`) and is removed automatically, on every platform, the
moment the package itself is uninstalled.

### Commands Needed

- `.venv/Scripts/python.exe -m pip install -e .` — as walked through
  above.

### Run It

Real, executed output, this session:

```text
$ .venv/Scripts/python.exe -m pip install -e .
Obtaining file:///C:/Users/g4m3r/Documents/open-calc/code/clojupye
  Installing build dependencies: started
  Installing build dependencies: finished with status 'done'
  Checking if build backend supports build_editable: started
  Checking if build backend supports build_editable: finished with status 'done'
  Getting requirements to build editable: started
  Getting requirements to build editable: finished with status 'done'
  Preparing editable metadata (pyproject.toml): started
  Preparing editable metadata (pyproject.toml): finished with status 'done'
Building wheels for collected packages: clojupye
  Building editable for clojupye (pyproject.toml): started
  Building editable for clojupye (pyproject.toml): finished with status 'done'
  Created wheel for clojupye: filename=clojupye-0.1.0-0.editable-py3-none-any.whl size=1513 ...
Successfully built clojupye
Installing collected packages: clojupye
Successfully installed clojupye-0.1.0
```

"Installing build dependencies" is real, observable **dependency
installation** (`Curriculum.md`'s own `Learn:` term) — this fresh virtual
environment had nothing but `pip` itself in it (confirmed by `pip list`
right after Concept Unit 1 showed only `pip`); pip fetched `setuptools`
automatically here, because `pyproject.toml`'s own `[build-system]` table
said it was required.

And, finally, the checkpoint itself — the `clojupye` command genuinely
exists and runs:

```text
$ .venv/Scripts/clojupye.exe
Clojupye REPL
```

### Connection

Concept Unit 3 declared, in data, that `clojupye` should mean
`clojupye.repl:main`; this unit is what actually turns that declaration
into a real program this machine's shell can find and run by name — the
first half of this lesson's own opening promise, proven for real above.

---

## Concept Unit 5: Standard Input/Output and Looping Around User Input

### The Problem

`clojupye` runs now, but it prints one line and exits immediately — the
opposite of a REPL, which by definition has to keep reading input, one
line at a time, for as long as the user keeps typing.

### Project Change

- **Reference Source:** `Curriculum.md`, Capability 1.2's `Learn:` list —
  `standard input/output`, `loops around user input` — and its own
  `Build:` block:

  ```text
  >
  ```

  read this session.
- **Files affected:** `code/clojupye/src/clojupye/repl.py`, modified.
- **Change type:** replace.
- **Location:** inside `run_repl`, replacing the single `print` call from
  Concept Unit 2.
- **Dependencies:** none new — `input`/`print` are both built-ins, part of
  every Python install already present in `.venv`.

### The New Code — type it yourself

```python
while True:
    line = input("> ")
    print(line)
```

### The Updated Project

The full file, nothing elided — the new loop replacing Concept Unit 2's
single `print`:

```python
def run_repl() -> None:
    print("Clojupye REPL")
    while True:                 # ← new
        line = input("> ")      # ← new
        print(line)              # ← new


def main() -> None:
    run_repl()
```

`run_repl` now does what its name has claimed since Concept Unit 2 but
hasn't actually done until now: it repeatedly reads a line and echoes it
back, forever — or at least until something stops it, which turns out,
next, to be a real problem.

### Introduce the Concept in Isolation

The real project code above already *is* the isolated case for this
concept — there's no smaller throwaway version of "loop around `input()`"
that would teach something this exact code doesn't already show directly.
What's worth isolating instead is what happens at the *edge* of that loop
— proven next, for real, against this exact code, not a fabricated
example:

```text
$ printf '(+ 1 2)\nhello\n' | .venv/Scripts/clojupye.exe
Clojupye REPL
> (+ 1 2)
> hello
> Traceback (most recent call last):
  File "<frozen runpy>", line 198, in _run_module_as_main
  File "<frozen runpy>", line 88, in _run_code
  File "...\.venv\Scripts\clojupye.exe\__main__.py", line 6, in <module>
    sys.exit(main())
             ~~~~^^
  File "...\src\clojupye\repl.py", line 9, in main
    run_repl()
    ~~~~~~~~^^
  File "...\src\clojupye\repl.py", line 4, in run_repl
    line = input("> ")
EOFError: EOF when reading a line
```

This is a real crash, from this exact code, this session — not a
hypothetical. What it proves: `input()`'s prompt (`"> "`) and its read
both worked correctly for the two piped lines (`"(+ 1 2)"`, `"hello"`);
the crash happens on the *third* call to `input()`, once the piped input
stream has nothing left to give it — the same situation a real user
triggers by pressing Ctrl+D (Unix) or Ctrl+Z then Enter (Windows) at an
interactive prompt. **This is called an `EOFError`** — the exact exception
named in this lesson's own Objects and methods section above — and fixing
it, on purpose, is Concept Unit 6's entire job.

### Discard

Not applicable — this is the real project's own code, mid-lesson, not a
throwaway; the crash above is left unfixed on purpose for one more unit,
because seeing the real failure first is what makes Concept Unit 6's fix
mean something concrete instead of arriving as an unmotivated precaution.

### Mechanical Walkthrough

- `while True:` — an unconditional loop, chosen deliberately over a loop
  that runs a fixed number of times: a REPL has no way to know in advance
  how many lines a user will type, so the loop's *only* correct exit
  condition is something that happens *inside* it — which Concept Units 6
  and 7 both add, in two different ways.
- `line = input("> ")` — calls the built-in `input` function (full
  treatment in this lesson's own Objects and methods section above),
  passing the literal string `"> "` as the prompt; the returned string —
  whatever the user typed, with the trailing newline already stripped by
  `input` itself — is bound to the local name `line`.
- `print(line)` — calls the built-in `print` function (also given full
  treatment above) with that same string, writing it back out — the
  entire "produce a result" half of this lesson's checkpoint, for now
  nothing more sophisticated than an echo, since no reader or evaluator
  exists yet to do anything else with it.

### CS Lens

`while True: line = input(...); ...` is a **read loop** — more
specifically, the read-half of what's classically called a REPL
(read-eval-print loop), a program structured entirely around waiting for
one unit of input, acting on it, and waiting again, indefinitely. Also
recognized in: a GUI toolkit's own main event loop (wait for the next
click or keypress, handle it, wait again), a game engine's per-frame loop,
a network server's `accept()` loop (wait for the next connection, handle
it, wait again).

### SE Lens

The alternative not chosen: reading *all* of the input at once — the
entire contents of a file, say — and processing it in a single pass,
rather than one line at a time in a loop that waits between each one.
`Curriculum.md`'s own stated goals (`Initial goals`, in its Section 0)
include `source files` as well as a REPL — a batch, read-everything-at-once
mode is a real, eventually-needed shape for this project. The tradeoff,
right now: a REPL's entire value is the *interactive* feedback loop — type
one thing, see a result, type the next thing informed by that result —
which is exactly what this project needs most while Clojupye itself is
still being built, one language feature at a time, across dozens of future
lessons. Batch-file execution is deferred, deliberately, to whichever later
lesson actually needs it, rather than building it now and leaving it
unused.

### Commands Needed

None new — `input`/`print` need no separate install; they're always
available.

### Run It

Real output already shown above, including the real crash this unit
deliberately leaves unfixed. One more real run, showing the *working* half
of this loop before the crash — two lines read and echoed correctly:

```text
$ printf '(+ 1 2)\nhello\n' | .venv/Scripts/clojupye.exe
Clojupye REPL
> (+ 1 2)
> hello
> [crashes here — see above]
```

### Connection

Concept Unit 4 made `clojupye` a real, runnable command that printed one
line and stopped; this unit makes it loop — the correct shape for a REPL,
with one real, observed cost (the `EOFError` crash above) that the very
next unit exists specifically to fix.

---

## Concept Unit 6: Exceptions as REPL Control Flow

### The Problem

Concept Unit 5 ended with a real crash: the moment input runs out —
whether because a piped file ended, or because a real user pressed Ctrl+D
— `input()` raises `EOFError`, and nothing catches it, so the whole
program dies with a traceback instead of exiting the way a REPL should:
cleanly, on purpose, the instant input stops.

### Project Change

- **Reference Source:** `Curriculum.md`, Capability 1.2's `Learn:` list —
  `exceptions` — read this session.
- **Files affected:** `code/clojupye/src/clojupye/repl.py`, modified.
- **Change type:** replace.
- **Location:** inside `run_repl`, wrapping Concept Unit 5's own
  `line = input("> ")` call.
- **Dependencies:** none new — `EOFError` and `KeyboardInterrupt` are both
  built-in exception classes.

### The New Code — type it yourself

```python
try:
    line = input("> ")
except EOFError:
    print()
    break
except KeyboardInterrupt:
    print()
    continue
```

### The Updated Project

The full file, nothing elided — Concept Unit 5's own `line = input("> ")`
is now wrapped, not replaced; everything below it is unchanged:

```python
def run_repl() -> None:
    print("Clojupye REPL")
    while True:
        try:                          # ← new
            line = input("> ")
        except EOFError:              # ← new
            print()                   # ← new
            break                     # ← new
        except KeyboardInterrupt:     # ← new
            print()                   # ← new
            continue                  # ← new

        print(line)


def main() -> None:
    run_repl()
```

The loop now has two real, deliberate exits instead of one crash: input
genuinely running out (`EOFError`) stops the loop cleanly; an accidental
Ctrl+C on one line (`KeyboardInterrupt`) cancels only that line and lets
the loop keep going.

### Introduce the Concept in Isolation

Both exceptions, proven separately, in isolation, this session — first,
that `input()` really does raise a catchable `EOFError`, not just crash
unconditionally:

```text
$ printf '' | python -c "print(input())"
Traceback (most recent call last):
  File "<string>", line 1, in <module>
    print(input())
          ~~~~~^^
EOFError: EOF when reading a line
```

And that `KeyboardInterrupt` is an ordinary, catchable exception, the same
as any other — proven here by raising it directly, since a piped,
non-interactive session has no real keyboard to send a genuine Ctrl+C
from:

```text
$ python -c "
try:
    raise KeyboardInterrupt
except KeyboardInterrupt:
    print('caught KeyboardInterrupt, still running')
"
caught KeyboardInterrupt, still running
```

**This is called exception handling used for control flow**, not error
recovery — nothing here is "wrong" in the sense a bug is wrong; `EOFError`
and `KeyboardInterrupt` are both completely expected, routine ways for a
REPL's input source to change state, and `try`/`except` is the mechanism
Python gives a program to react to that state change exactly where it
happens.

### Discard

The two one-off scratch commands above (the empty-`printf` pipe, and the
manually-`raise`d `KeyboardInterrupt`) are not part of Clojupye — they
existed only to prove each exception's real behavior in isolation, and are
not reused anywhere in the project.

### Mechanical Walkthrough

- `try:` — opens a block Python will watch for exceptions raised by any
  statement inside it — here, just the one `line = input("> ")` call.
- `except EOFError:` — full treatment of `EOFError` itself already given
  above, in this lesson's own Objects and methods section; this clause
  matches only that specific exception type, letting any *other* kind of
  exception (were one to occur) pass through uncaught instead of being
  silently swallowed here.
- `print()` (inside the `EOFError` branch) — a call to `print` with zero
  arguments, which per its own real signature (given above) still writes
  its `end` default, a bare newline — this is what moves the terminal's
  cursor to a fresh line after a Ctrl+D, which itself produces no visible
  newline of its own.
- `break` — exits the enclosing `while True:` loop immediately; this is
  the loop's first real, intentional exit condition, chosen specifically
  because "the input source is gone" is not a state the loop should ever
  try to continue past.
- `except KeyboardInterrupt:` — a second, separate `except` clause on the
  same `try`; Python checks each `except` clause in order and runs the
  first one whose type matches the exception that was actually raised.
- `continue` (inside the `KeyboardInterrupt` branch) — skips the rest of
  the current loop iteration and jumps straight back to `while True:`'s
  own condition check, re-entering the loop and calling `input("> ")`
  again — deliberately *not* a `break`, since an accidental Ctrl+C while
  typing one line is not a signal the whole REPL should exit, only that
  this one line should be abandoned.

### CS Lens

Using an exception to signal "the input stream has ended," rather than
some special return value, is the same shape of problem as **sentinel
values versus explicit signaling** at a boundary between a program and the
outside world. Also recognized in: a C program's `read()` system call
returning `0` bytes at end-of-file (a sentinel, the opposite design choice
from Python's own `EOFError`), a Python iterator raising `StopIteration`
when exhausted (the same design as `EOFError`, applied to iteration
instead of input streams), a TCP connection's `FIN` packet signaling "no
more data is coming" at the network layer.

### SE Lens

The alternative not chosen: checking, *before* calling `input()`, whether
the input source still has data left (for example, via
`sys.stdin.isatty()` or peeking at the underlying file object), instead of
calling `input()` and reacting to what it raises. The real tradeoff: a
pre-check can never be fully reliable — the input source could still run
out in the gap between the check and the actual read, especially once this
REPL is driven by something other than a human at a keyboard (a test, a
script feeding it commands). Catching the exception at the exact call site
that can raise it is unconditionally correct regardless of *why* the input
ended, and costs nothing extra when it doesn't happen.

### Commands Needed

None new.

### Run It

Real, executed output, this session — the exact same input that crashed
Concept Unit 5's version now exits cleanly instead:

```text
$ printf '(+ 1 2)\nhello\n' | .venv/Scripts/clojupye.exe
Clojupye REPL
> (+ 1 2)
> hello
>
$ echo "exit code: $?"
exit code: 0
```

Compare directly against Concept Unit 5's own captured crash (`exit code:
1`, a full traceback) — same input, same two echoed lines, and now a
clean `exit code: 0` instead of a crash the instant input runs out.

### Connection

Concept Unit 5 built a loop that worked exactly until the moment input
ended, then crashed; this unit is the fix, turning that one real,
previously-observed crash into a clean, deliberate exit — the loop is now
genuinely correct, not just correct until someone presses Ctrl+D.

---

## Concept Unit 7: Command Dispatch and Interactive Program State

### The Problem

The loop reads a line and echoes it back — always the same action, no
matter what was typed. `Curriculum.md`'s own Capability 1.2 names two
specific commands, `:help` and `:quit`, that need to behave *differently*
from ordinary input: `:quit` should stop the loop outright (a third,
deliberate exit, alongside `EOFError` and `KeyboardInterrupt`), and
`:help` should print something useful instead of just echoing the text
`":help"` back.

### Project Change

- **Reference Source:** `Curriculum.md`, Capability 1.2's `Learn:` list —
  `command dispatch`, `interactive program state` — and its own `Build:`
  block:

  ```text
  :help
  :quit
  ```

  plus its own Checkpoint — "The REPL accepts input and produces
  results." — read this session.
- **Files affected:** `code/clojupye/src/clojupye/repl.py`, modified.
- **Change type:** replace.
- **Location:** inside `run_repl`, replacing Concept Unit 6's own trailing
  `print(line)`.
- **Dependencies:** none new — `str.strip()` is a method on the built-in
  `str` type, already present on every string this code touches.

### The New Code — type it yourself

```python
command = line.strip()

if command == "":
    continue
elif command == ":quit":
    break
elif command == ":help":
    print(":help  show this message")
    print(":quit  exit the REPL")
else:
    print(command)
```

### The Updated Project

The full file, nothing elided — Concept Unit 6's own trailing `print(line)`
is replaced by the dispatch block above:

```python
def run_repl() -> None:
    print("Clojupye REPL")
    while True:
        try:
            line = input("> ")
        except EOFError:
            print()
            break
        except KeyboardInterrupt:
            print()
            continue

        command = line.strip()                              # ← new

        if command == "":                                    # ← new
            continue                                          # ← new
        elif command == ":quit":                              # ← new
            break                                             # ← new
        elif command == ":help":                              # ← new
            print(":help  show this message")                 # ← new
            print(":quit  exit the REPL")                      # ← new
        else:                                                  # ← new
            print(command)                                     # ← new


def main() -> None:
    run_repl()
```

The loop's body is now a real, if small, dispatcher: every typed line is
inspected once, and exactly one of four branches decides what happens
next — skip it, quit, show help, or echo it back.

### Introduce the Concept in Isolation

The real project code above is already the isolated case here too — this
`if`/`elif` chain is small enough that a separate throwaway version would
teach nothing this exact code doesn't already show directly. What's worth
proving in isolation instead is the specific, real consequence of `:quit`
triggering `break` immediately, rather than merely being echoed like any
other text — shown next, against this exact code, this session:

```text
$ printf '  \n(+ 1 2)\n:help\n:quit\nafter-quit\n' | .venv/Scripts/clojupye.exe
Clojupye REPL
> > (+ 1 2)
> :help  show this message
:quit  exit the REPL
>
```

**This is called command dispatch.** What this proves, mechanically: the
first line (two blank spaces) hits the `command == ""` branch and is
skipped with `continue` — visible above as two `> ` prompts in a row, with
nothing echoed between them; `"(+ 1 2)"` doesn't match either special
command, so it falls to the final `else` and gets echoed, same as Concept
Unit 6; `":help"` matches its own branch and prints two lines instead of
echoing the literal text `":help"`; and — the actual point of this trace —
`"after-quit"`, the fifth line piped in, is **never read at all**: `:quit`
matched its branch and hit `break` on the fourth line, and the loop
stopped iterating before a fifth `input()` call ever happened. Compare
this against Concept Unit 6's version of the same code, which had no
`:quit` branch: piping the identical five lines through *that* version
reads and echoes `"after-quit"` too, since nothing in that version's `else`
branch treated `:quit` as anything other than ordinary text.

### Discard

Not applicable — this is the real project's own dispatch logic, not a
throwaway; the comparison above traces this exact code's real behavior
directly, with no separate scratch version needed.

### Mechanical Walkthrough

- `command = line.strip()` — calls `str.strip()` (full treatment above, in
  this lesson's own Objects and methods section) on whatever `input()`
  returned, binding the result to a new name, `command`; this is what lets
  `"  :quit  "` and `":quit"` both match the same branch below.
- `if command == "":` — an equality comparison against the empty string;
  true specifically when the typed line was empty or contained only
  whitespace (since `strip()` reduces either case to `""`).
- `continue` (here, in the blank-line branch) — same statement explained
  in Concept Unit 6, reused here for a different reason: skips straight
  back to the top of `while True:`, re-prompting without printing
  anything, so an accidental empty Enter press doesn't produce a stray
  blank line of "output" the way echoing it would.
- `elif command == ":quit":` — `elif` only runs its check if the preceding
  `if` (and every `elif` before it) already failed to match; this is the
  branch responsible for the real, observed difference in the trace above
  — `break` here exits `while True:` the instant `":quit"` is recognized,
  before any later input is ever read.
- `elif command == ":help":` — a third branch, checked only once the first
  two have both failed to match; its body calls `print` twice in a row,
  each call independently adding its own default trailing newline (full
  `print` signature given above), producing the two-line help text shown
  in the trace.
- `else:` — the fallback, reached only when none of the three named
  conditions matched; `print(command)` here is exactly Concept Unit 6's
  own trailing line, now reached conditionally instead of
  unconditionally.

The loop's own **interactive program state**, right now, is nothing more
than one implicit fact: *is the loop still running, or has it exited* —
tracked entirely by whether `while True:` is still executing, with no
separate variable needed to hold it. This is honestly the whole of this
lesson's "state" — no typed value is remembered between lines yet (`(def x
10)` followed by `x` still just echoes twice, independently); that kind of
real, carried state is `Curriculum.md` Section 5's own job (`Environment`,
`bindings`, `parent`), not this lesson's.

### CS Lens

Branching on a matched string to decide which of several handlers runs is
a small, literal instance of **command dispatch** — matching one piece of
input against a known set of cases and routing to the specific behavior
each one names. Also recognized in: an HTTP router matching a request path
to a handler function, a Unix shell distinguishing its own built-in
commands (`cd`, `exit`) from external programs before deciding how to run
either, a compiler's lexer checking a scanned identifier against a table of
reserved keywords before deciding it's just an ordinary name.

### SE Lens

The alternative not chosen: treating every line as if it might already be
real Clojupye code, and attempting to evaluate it right now. The real
tradeoff: no reader, no AST, and no evaluator exist yet — those are
`Curriculum.md` Sections 3 through 5, several lessons away — so "attempting
to evaluate it" could only mean either crashing on every single line, or
quietly faking a result that isn't real. Honest echo, plus exactly two real
special commands, keeps every claim this lesson makes about the REPL
actually true; the cost is that `(+ 1 2)` prints back as literally the
text `(+ 1 2)`, not `3` — a limitation this lesson states plainly rather
than working around, because Lesson 2 removing it for real is the entire
point of building the reader and evaluator next.

### Commands Needed

None new.

### Run It

Real, executed output, this session — the full trace already shown above,
repeated here as this unit's own checkpoint:

```text
$ printf '  \n(+ 1 2)\n:help\n:quit\nafter-quit\n' | .venv/Scripts/clojupye.exe
Clojupye REPL
> > (+ 1 2)
> :help  show this message
:quit  exit the REPL
>
```

And, matching `Curriculum.md`'s own Capability 1.1 checkpoint exactly —
the banner and a waiting prompt, with no input piped in at all, left
running until interrupted:

```text
$ .venv/Scripts/clojupye.exe
Clojupye REPL
>
```

### Connection

Concept Unit 6 made the loop survive input running out; this unit is what
finally makes it *respond* differently to different input — the second
half of `Curriculum.md`'s own Capability 1.2 checkpoint, "the REPL accepts
input and produces results," proven for real above, immediately before
this lesson's last unit locks this exact behavior into a real, automated
test.

---

## Concept Unit 8: Test Organization

### The Problem

Every checkpoint so far in this lesson has been verified by hand — running
`clojupye`, piping some input, and reading the output. That's real
verification, but it only proves the REPL worked *this one time, in this
one session*. Nothing stops a future lesson's edit to `repl.py` from
silently breaking `:help`'s output with no one noticing until they happen
to type `:help` again by hand.

### Project Change

- **Reference Source:** `Curriculum.md`, Capability 1.1's `Learn:` list —
  `test organization` — and its own `Build:` tree's `tests/` line, read
  this session.
- **Files affected:** `code/clojupye/pyproject.toml`, modified;
  `code/clojupye/tests/test_repl.py`, created.
- **Change type:** add (a new optional-dependency group), create (the
  test file).
- **Location:** `pyproject.toml`'s top level, a new table after
  `[project.scripts]`; a new `tests/` folder at the project root.
- **Dependencies:** `pytest`, declared and installed as part of this unit,
  not before.

### The New Code — type it yourself

```toml
[project.optional-dependencies]
dev = ["pytest>=8"]
```

```python
from clojupye.repl import run_repl


def test_help_command_lists_both_commands(monkeypatch, capsys):
    lines = iter([":help", ":quit"])
    monkeypatch.setattr("builtins.input", lambda prompt="": next(lines))

    run_repl()

    output = capsys.readouterr().out
    assert ":help  show this message" in output
    assert ":quit  exit the REPL" in output
```

### The Updated Project

`pyproject.toml`, in full, with the new table added after
`[project.scripts]` — nothing elided:

```toml
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "clojupye"
version = "0.1.0"
description = "A Clojure-inspired Lisp that compiles to Python"
requires-python = ">=3.10"

[project.scripts]
clojupye = "clojupye.repl:main"

[project.optional-dependencies]        # ← new
dev = ["pytest>=8"]                    # ← new

[tool.setuptools.packages.find]
where = ["src"]

[tool.pytest.ini_options]              # ← new
testpaths = ["tests"]                  # ← new
```

`[tool.pytest.ini_options]` is shown here too, added in the same edit —
`testpaths = ["tests"]` tells pytest where to look for tests without
needing a separate config file just for that one setting.

`tests/test_repl.py` is a brand-new file, so it has nothing to locate a
position within — shown whole above.

```text
code/clojupye/
├── .venv/
├── src/
│   ├── clojupye/
│   └── clojupye.egg-info/
├── tests/
│   └── test_repl.py    ← new, shown whole above
└── pyproject.toml       (updated, shown whole above)
```

### Introduce the Concept in Isolation

Both pytest mechanisms this real test depends on, `monkeypatch` and
`capsys`, proven separately, this session, against a tiny, disposable
function that has nothing to do with Clojupye:

```python
def ask_name():
    name = input("name? ")
    print(f"hello, {name}")


def test_ask_name_uses_patched_input(monkeypatch, capsys):
    monkeypatch.setattr("builtins.input", lambda prompt="": "Ada")

    ask_name()

    output = capsys.readouterr().out
    assert output == "hello, Ada\n"
```

```text
$ python -m pytest -v test_scratch.py
test_scratch.py::test_ask_name_uses_patched_input PASSED       [100%]
```

**This is called monkeypatching, and `monkeypatch`/`capsys` are called
pytest fixtures.** What this proves: `ask_name` calls the real,
unmodified built-in `input` in its own source — nothing about `ask_name`
itself was changed to make it testable — yet the test controlled exactly
what `input` returned, and captured exactly what `print` wrote, entirely
from *outside* `ask_name`. This is exactly the same pair of mechanisms
`test_repl.py`, shown above, uses against the real `run_repl` — just
proven first against code simple enough to hold in one glance.

### Discard

`ask_name` and its scratch test above are not part of Clojupye — they
existed only to prove `monkeypatch`/`capsys` in isolation, and are deleted
now that `tests/test_repl.py` proves the same mechanisms against the real
REPL.

### Mechanical Walkthrough

- `from clojupye.repl import run_repl` — imports the *editable-installed*
  package from Concept Unit 4, not a relative file path; this test only
  works because `pip install -e .` already made `clojupye` a real,
  importable package in this same virtual environment.
- `def test_help_command_lists_both_commands(monkeypatch, capsys):` — a
  plain function whose *name* (starting with `test_`) is what pytest uses
  to discover it automatically; its two parameters, `monkeypatch` and
  `capsys`, are both real pytest fixtures (full treatment above, in this
  lesson's own Objects and methods section) — pytest supplies both
  automatically, by matching these exact parameter names, with no import
  needed to bring them in.
- `lines = iter([":help", ":quit"])` — builds a Python iterator over a
  two-item list; calling `next()` on it returns `":help"` the first time
  and `":quit"` the second, then raises `StopIteration` on any further
  call — deliberately matching exactly two calls, since `run_repl`'s real
  `:quit` branch stops the loop after reading exactly that many lines,
  proven already in Concept Unit 7's own trace.
- `monkeypatch.setattr("builtins.input", lambda prompt="": next(lines))` —
  full treatment of `monkeypatch.setattr` given above; the replacement
  value is a `lambda` — an anonymous, one-line function — accepting a
  `prompt` parameter (matching `input`'s own real signature, so `run_repl`
  can still call it as `input("> ")` without a `TypeError`) and ignoring
  it, returning `next(lines)` instead of reading anything real.
- `run_repl()` — calls the real, completely unmodified function from
  `src/clojupye/repl.py`; every branch inside it (Concept Units 5 through
  7) runs exactly as written — the *only* thing different from a real,
  interactive session is where `input()`'s return value actually comes
  from.
- `output = capsys.readouterr().out` — full treatment of
  `capsys.readouterr` given above; `.out` specifically is the standard-out
  half of the returned result (`.err` — unused here — holds standard
  error).
- `assert ":help  show this message" in output` — Python's built-in
  `assert` statement; if the following expression is false, pytest reports
  this exact line as a failure, showing both sides of the comparison. The
  `in` operator here checks substring membership: this exact text has to
  appear *somewhere* inside the captured output, not that the output
  equals it exactly — deliberately looser than an exact match, so a future
  lesson adding a third help line wouldn't need to rewrite this assertion.
- The second `assert`, on `:quit  exit the REPL`, is the identical pattern,
  checked separately so a failure names precisely which of the two lines
  went missing.

### CS Lens

Substituting a controlled stand-in for a real dependency (`input`) for the
duration of one test is a **test double** — code standing in for a real
collaborator specifically so a test can control and observe an interaction
that would otherwise depend on something outside the test's control (a
real keyboard, in this case). Also recognized in: dependency-injection
frameworks (a fake database repository swapped in for a real one during
tests), stubbing a network call in any language so a test doesn't depend on
a real server being reachable, wrapping a hardware driver behind an
interface specifically so tests can run without the physical hardware
attached.

### SE Lens

The alternative not chosen: manually running `clojupye`, typing `:help`,
and eyeballing whether the output still looks right — exactly how every
earlier Concept Unit in this lesson was actually verified. The real
tradeoff: manual verification is real and was genuinely done, repeatedly,
throughout this lesson — but it produces no permanent record, and nothing
stops a future lesson's edit from silently changing `:help`'s exact output
with no one noticing until they happen to type `:help` again by hand. One
short, automated test, run in milliseconds, turns "does :help still say
the right thing" from a manual, easy-to-skip step into something that
fails loudly, on its own, the moment it stops being true — including
automatically, in Lesson 2, the moment ordinary input stops meaning "echo
it back" and starts meaning something real.

### Commands Needed

- `.venv/Scripts/python.exe -m pip install -e ".[dev]"` — reinstalls the
  project, this time also resolving and installing the `dev` extra
  (`pytest`) declared above.
- `.venv/Scripts/python.exe -m pytest -v` — runs every test pytest
  discovers under `tests/` (per `testpaths = ["tests"]`, set above), `-v`
  printing each test's own name and result instead of just a summary.

### Run It

Real, executed output, this session — reinstalling with the new `dev`
extra, showing real dependency resolution pulling in pytest's own
transitive dependencies, not just pytest itself:

```text
$ .venv/Scripts/python.exe -m pip install -e ".[dev]"
Collecting pytest>=8 (from clojupye==0.1.0)
Collecting colorama>=0.4 (from pytest>=8->clojupye==0.1.0)
Collecting iniconfig>=1.0.1 (from pytest>=8->clojupye==0.1.0)
Collecting packaging>=22 (from pytest>=8->clojupye==0.1.0)
Collecting pluggy<2,>=1.5 (from pytest>=8->clojupye==0.1.0)
Collecting pygments>=2.7.2 (from pytest>=8->clojupye==0.1.0)
Installing collected packages: pygments, pluggy, packaging, iniconfig, colorama, clojupye, pytest
Successfully installed clojupye-0.1.0 colorama-0.4.6 iniconfig-2.3.0 packaging-26.3 pluggy-1.6.0 pygments-2.21.0 pytest-9.1.1
```

Declaring `dev = ["pytest>=8"]` (one line) resulted in six packages
actually being installed — real, observed **dependency resolution**: pip
worked out, on its own, that `pytest` itself needs `colorama`, `iniconfig`,
`packaging`, `pluggy`, and `pygments`, and installed a compatible version
of each without those five ever being named anywhere in this project's own
`pyproject.toml`.

And the real test run itself:

```text
$ .venv/Scripts/python.exe -m pytest -v
tests/test_repl.py::test_help_command_lists_both_commands PASSED    [100%]

============================== 1 passed in 0.02s ==============================
```

### Connection

Every earlier Concept Unit in this lesson proved its own checkpoint by
hand, once, this session; this unit is what turns Concept Unit 7's
`:help`/`:quit` checkpoint specifically into something that keeps proving
itself, automatically, every single time it's run from here on — the last
piece this lesson's own closing trace, next, pulls all the way through.

---

## Closing

### Connect the Pieces

One concrete value, traced through every unit this lesson built, start to
finish: typing `clojupye` at a terminal → the shell finds
`.venv/Scripts/clojupye.exe` because that virtual environment (Concept
Unit 1) is active → that generated wrapper reads `entry_points.txt`
(Concept Unit 4) and calls `clojupye.repl:main` — the exact dotted path
declared in `pyproject.toml` (Concept Unit 3), pointing at the real
`clojupye` package `src/clojupye/`'s own `__init__.py` makes importable
(Concept Unit 2) → `main()` calls `run_repl()`, which prints the banner and
enters `while True:` (Concept Unit 5) → each `input("> ")` call is guarded
by `try`/`except EOFError`/`except KeyboardInterrupt` (Concept Unit 6), so
neither input running out nor an accidental Ctrl+C can crash it → the typed
line is stripped and dispatched (Concept Unit 7): type `:help`, and the
exact two lines Concept Unit 8's own test (`tests/test_repl.py`) asserts on
print back, automatically re-verified every time that test runs from now
on.

### What Breaks Without This

Concept Unit 7's own dispatch — specifically the `elif command == ":quit":
break` branch — removed on purpose, this session, real output both ways.
With dispatch removed, every line (including `":quit"` itself) falls
through to a bare echo, and the exact same five piped lines that correctly
stopped after four reads in Concept Unit 7 now all get read and echoed,
`"after-quit"` included:

```text
$ printf '  \n(+ 1 2)\n:help\n:quit\nafter-quit\n' | .venv/Scripts/clojupye.exe
Clojupye REPL
>
> (+ 1 2)
> :help
> :quit
> after-quit
>
```

Compare directly against Concept Unit 7's own real trace of the *working*
version, where the loop stopped the instant it read `":quit"` and never
issued a fifth `input()` call at all. Restoring the `elif`/`break` branch
(shown in full in Concept Unit 7's "The Updated Project") brings back the
real, correct behavior — confirmed afterward by rerunning
`.venv/Scripts/python.exe -m pytest -v` and seeing
`test_help_command_lists_both_commands PASSED` again.

### Exercises

- Add a third command, `:version`, that prints `0.1.0` (the exact string
  already sitting in `pyproject.toml`'s own `version` key) — then write a
  second `assert` inside `test_help_command_lists_both_commands`'s test
  file confirming it, following the same `monkeypatch`/`capsys` shape
  Concept Unit 8 already showed.
- Run `.venv/Scripts/python.exe -m clojupye` instead of
  `.venv/Scripts/clojupye.exe` — does it work? Compare the real error
  against what Concept Unit 2's Mechanical Walkthrough said `__init__.py`
  and `repl.py` do, and explain specifically what file would need to exist
  for `python -m clojupye` to work the same way `clojupye` already does.
- Open a brand-new terminal, do **not** activate `.venv`, and type
  `clojupye` directly. What happens, and why, in terms of Concept Unit 1's
  own claim that a virtual environment's programs aren't visible outside
  it?

### Definition of Done

- [ ] `code/clojupye/.venv/` exists; `.venv/Scripts/python.exe -m pip
      list` shows `clojupye` installed.
- [ ] Running `.venv/Scripts/clojupye.exe` with no piped input prints
      `Clojupye REPL` followed by a waiting `>` prompt (Concept Unit 7's
      own checkpoint, matching `Curriculum.md`'s Capability 1.1 checkpoint
      exactly).
- [ ] Piping `:help` prints both command lines; piping `:quit` exits
      cleanly with no traceback.
- [ ] `.venv/Scripts/python.exe -m pytest -v` reports
      `test_help_command_lists_both_commands PASSED`.
- [ ] `code/clojupye/` contains exactly `pyproject.toml`, `src/clojupye/`
      (`__init__.py`, `repl.py`), and `tests/` (`test_repl.py`) as
      version-controlled files — `.venv/`, `__pycache__/`, `*.egg-info/`,
      and `.pytest_cache/` all excluded by `.gitignore`.
- [ ] Commit, with a message stating *why* — e.g. "Give Clojupye an
      installed command and a REPL loop that survives EOF and Ctrl+C,
      before any language syntax exists to run inside it."
