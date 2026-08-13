# Lesson 23: A Crash Nobody Had Checked For

**What you will build** — two real, different things. First, a real
security/stability audit of every `extern "C"` function this project
has ever added — not a hypothetical one: it finds and fixes a genuine,
real, currently-existing crash this project has been shipping since
Lesson 14. Second, the first slice that isn't about the engine's own
internals at all: real statistics and a real `matplotlib` chart, built
against real, persistent rows this project's own engine stored.

**What you need to know first:** Lesson 7 (the original, real
exception-safety audit and fix for `database_c_api.cpp`), Lesson 14
(`PageManager`'s own constructor, which really does throw on a bad
file), Lesson 18 (`query`).

**Terms introduced in this lesson:** None — this lesson's own real
subject is applying concepts this project has already fully taught
(exception safety, `try`/`catch` at a boundary) somewhere they were
never actually checked, and using already-standard, real Python
libraries for their own, real, intended purpose.

**Objects and methods used**
- **`statistics.mean` / `.median` / `.stdev`**
  - *What they are:* real, standard-library Python functions —
    `statistics` needs no `pip install`, part of Python itself.
  - *Implementation:* `statistics.mean(scores)`,
    `statistics.median(scores)`, `statistics.stdev(scores)`.
  - *Its use:* this lesson's own real, second half — summarizing a
    real, stored dataset numerically before ever plotting it.
- **`matplotlib.pyplot.hist` / `.savefig`**
  - *What they are:* the real, standard Python plotting library
    `README.md`'s own design principles explicitly, deliberately allow
    (the one named exception to "hand-rolled, not delegated" — it's
    the actual subject of the two courses this project prepares for,
    not a shortcut around building something else).
  - *Implementation:* `plt.hist(scores, bins=10, edgecolor="black")`
    draws a real histogram; `plt.savefig("scores_histogram.png")`
    writes it to a real, actual file on disk.
  - *Its use:* this lesson's own real, visual proof that real, stored
    PocketDB rows are worth looking at, not just querying.

---

## Concept Unit: A Real Crash, Found by Actually Checking

### The Problem

Lesson 7 audited `database_c_api.cpp`, real-proved an uncaught C++
exception crashes the whole Python process, and wrapped every function
in it with `try`/`catch`. Two *more* real `extern "C"` files have been
added since then — `page_manager_c_api.cpp` (Lesson 14) and
`record_page_c_api.cpp` (Lesson 15) — and neither one was ever actually
checked against the identical, already-established real standard.

### Introduce the Concept in Isolation

Real, not hypothetical — reproduced directly against the actual,
current `pocketdb_engine.dll`. Save this as `crash_check.py`:

```python
import ctypes

lib = ctypes.CDLL("./pocketdb_engine.dll")
lib.page_manager_open.argtypes = [ctypes.c_char_p]
lib.page_manager_open.restype = ctypes.c_void_p

with open("corrupt.pdb", "w") as f:
    f.write("not a real pocketdb file")

print("about to open a corrupt file via page_manager_open...")
result = lib.page_manager_open(b"corrupt.pdb")
print("did not crash, result:", result)
```

Run with:

```bash
python crash_check.py
```

Real output — the process really does terminate, exactly the way
Lesson 7's own original proof did:

```text
about to open a corrupt file via page_manager_open...
terminate called after throwing an instance of 'std::runtime_error'
  what():  Not a real PocketDB file: bad magic number
```

*What this proves:* `page_manager_open` (Lesson 14) calls `new
PageManager(path)` directly, with no real `try`/`catch` around it at
all — and `PageManager`'s own constructor genuinely, correctly throws
`std::runtime_error` on a bad magic number (Lesson 14's own real,
intentional check). Nothing catches it before it crosses the real
`extern "C"` boundary, so it does the identical real damage Lesson 7
already proved once: `std::terminate`, the whole Python process gone,
not a catchable Python exception.

### Discard the Throwaway Example

```bash
rm crash_check.py corrupt.pdb
```

### Mechanical Walkthrough

- `lib.page_manager_open(b"corrupt.pdb")` — reappearing shape (Lesson
  14's own real verification) — the identical real call that already
  worked correctly for a *valid* file; the real bug only shows up on
  a genuinely invalid one.
- The real crash message (`terminate called after throwing...`) comes
  from the C++ runtime itself, not Python — real, direct proof the
  exception escaped `extern "C"` entirely; Python's own interpreter
  never got a chance to report anything.

### CS Lens

This is a real, small instance of **incomplete refactoring** — Lesson
7's own real fix (Lesson 7's Header even names the specific pattern:
wrap every `extern "C"` function in `try`/`catch`) was correct and
complete *for the one file that existed at the time*. Two new files
were added in later lessons, each independently, each never checked
against the same standard — a genuinely common, real way real bugs
survive in real projects: a rule everyone agrees on, applied
faithfully going forward, but never swept back across code written
before the rule existed everywhere it should.

### SE Lens

Why does this lesson matter *now*, specifically, rather than whenever
this bug happens to get noticed by accident? Because `README.md`'s own
S09 row exists precisely for this — a real, scheduled, systematic
review of the `extern "C"` API's own stability, not a reactive patch
after a real user hits it. A real, periodic audit — checking
*everything* against an established standard, not just new code
against it — is what catches gaps like this one before they're
discovered the hard way.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

The real crash is reproduced and understood. Fixing it — and checking
the one other real gap this same audit turns up — is next.

---

## Concept Unit: The Real Fix, and the Rest of the Audit

### The Problem

The real crash is reproduced and understood, but not yet fixed — and
`page_manager_open` might not be the only real gap this project's own
two, never-audited files are hiding.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `page_manager_c_api.cpp` (modified —
  `page_manager_open` hardened), `record_page_c_api.h`/`.cpp`
  (modified — `record_page_init` hardened, real return type changed).
- **Change type:** Fix.
- **Dependencies:** This lesson's own first unit.

### The New Code — `page_manager_c_api.cpp`

```cpp
#include <vector>
#include <cstring>
#include <stdexcept>
#include "page_manager_c_api.h"
#include "page_manager.h"

extern "C" {

PageManagerHandle page_manager_open(const char* path)
{
    try
    {
        return new PageManager(path);
    }
    catch (const std::exception&)
    {
        return nullptr;
    }
}
```

The real, rest-of-file audit: `page_manager_allocate`/`_free`/`_write`/
`_read` call real `PageManager` methods that don't currently validate
their own arguments at all (no bounds-checking on `page_id`) — so none
of them currently throw, and none needed a real `try`/`catch` added.
Only the one real, genuine gap (`page_manager_open`) needed fixing.

### The New Code — `record_page_c_api.h`/`.cpp`

The same real audit, applied to the one remaining file, turns up a
second, smaller real inconsistency: `record_page_init` never had a
`try`/`catch` either — currently harmless (nothing it calls throws
today), but a real, latent risk the moment `PageManager::write_page`
ever gains real bounds-checking of its own. Hardened for real
consistency, with a real, honest return value instead of `void`:

```cpp
// record_page_c_api.h
int record_page_init(PageManagerHandle pm, uint32_t page_id);
```

```cpp
// record_page_c_api.cpp
int record_page_init(PageManagerHandle pm, uint32_t page_id)
{
    try
    {
        std::vector<char> page(PAGE_SIZE, 0);
        init_record_page(page.data());
        static_cast<PageManager*>(pm)->write_page(page_id, page.data());
        return 0;
    }
    catch (const std::exception&)
    {
        return -1;
    }
}
```

Rebuilt into the same real `pocketdb_engine.dll`, then the identical
real crash reproduction from this lesson's own first unit, rerun:

```python
import ctypes

lib = ctypes.CDLL("./pocketdb_engine.dll")
lib.page_manager_open.argtypes = [ctypes.c_char_p]
lib.page_manager_open.restype = ctypes.c_void_p

with open("corrupt.pdb", "w") as f:
    f.write("not a real pocketdb file")

print("about to open a corrupt file via page_manager_open...")
result = lib.page_manager_open(b"corrupt.pdb")
print("did not crash, result:", result)
```

Real output:

```text
about to open a corrupt file via page_manager_open...
did not crash, result: None
```

### Discard the Throwaway Example

```bash
rm crash_check.py corrupt.pdb
```

Every real `.h`/`.cpp` change above is kept — permanent project files.

### Mechanical Walkthrough

- `catch (const std::exception&) { return nullptr; }` — reappearing
  shape, exactly Lesson 7's own original, established pattern — applied
  here for the first time to `page_manager_open`, three real lessons
  after it should have been.
- `int record_page_init(...)` — the real return type changed from
  `void` to `int`, since a `void` function has no real way to signal a
  real failure at all; `0` for success, `-1` matching every other real
  `extern "C"` function's own established failure convention in this
  project.

### CS Lens

Rerunning the *identical* real reproduction script from this lesson's
own first unit — not a new one — is what makes this a genuine, real
**regression test**: real proof the specific, real failure that used
to happen no longer does, using the exact same real conditions that
originally caused it.

### SE Lens

Why hardened `record_page_init` even though this lesson's own audit
found it currently harmless? Because "currently harmless" is a real,
fragile property — it depends entirely on `PageManager::write_page`
never gaining real bounds-checking, something this project might
genuinely want later (a real, honest gap this lesson doesn't pretend is
already fixed). Hardening it now costs nothing and removes one more
real, latent trap for a future lesson to rediscover the hard way.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above — the real crash, reproduced, then confirmed fixed.

### Connection

The engine's own real `extern "C"` boundary is checked, for real, all
the way through. The rest of this lesson turns to something genuinely
different — using the engine for what it was actually built for.

---

## Concept Unit: Real Numbers, From Real, Stored Rows

### The Problem

Every lesson so far has tested the engine *as* an engine — inserting a
few rows, reading them back, proving a mechanism works. Nothing has
yet used it the way `README.md`'s own S09 row describes: as "a
legitimate place to keep data you actually want to study."

### The New Code — `analyze.py`

```python
import statistics
import random
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pocketdb import Database, INTEGER, TEXT

db = Database("analysis.pdb")
db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)

random.seed(42)
for i in range(100):
    db.insert("games", i, f"player{i}", random.randint(0, 100))

scores = [int(r["score"]) for r in db.query("games")]

print(f"count: {len(scores)}")
print(f"mean: {statistics.mean(scores):.2f}")
print(f"median: {statistics.median(scores)}")
print(f"stdev: {statistics.stdev(scores):.2f}")
print(f"min: {min(scores)}, max: {max(scores)}")

plt.hist(scores, bins=10, edgecolor="black")
plt.xlabel("Score")
plt.ylabel("Count")
plt.title("Real score distribution, from real, stored PocketDB rows")
plt.savefig("scores_histogram.png")

db.close()
```

Run with:

```bash
python analyze.py
```

Real output:

```text
count: 100
mean: 47.91
median: 45.0
stdev: 30.19
min: 0, max: 98
```

*What this proves:* a real, plain `.png` file, `scores_histogram.png`,
now exists on disk — a real, visible histogram, built from `100` real
rows this project's own engine genuinely stored, queried back through
Lesson 18's own real `query`, and never touched by anything but real,
standard Python libraries doing exactly their own intended real job.

### Discard the Throwaway Example

`analysis.pdb` and `scores_histogram.png` are real, throwaway
verification artifacts for this lesson — remove them once you've
confirmed your own real output. `analyze.py` is worth keeping as a
real, reusable script.

```bash
rm analysis.pdb scores_histogram.png
```

### Mechanical Walkthrough

- `matplotlib.use("Agg")` — must be called *before* `import
  matplotlib.pyplot` — selects a real, non-interactive rendering
  backend that writes directly to a real file, rather than trying to
  open a real, live window (which would fail or hang in an environment
  with no real display attached).
- `[int(r["score"]) for r in db.query("games")]` — reappearing shape
  (`Record.__getitem__`, Lesson 18; list comprehension, Lesson 22) —
  the real, still-open gap Lesson 18's own exercises already named
  (every `Record` value is still a raw string) means every real,
  numeric computation in this lesson has to `int(...)` first.
- `statistics.mean`/`.median`/`.stdev` — covered fully in Objects and
  methods used, above — three real, independent, standard-library
  computations over the identical real `scores` list.

### CS Lens

A histogram's own real job — binning continuous or discrete real
values into real, countable ranges — is exactly what `plt.hist`'s own
`bins=10` argument does: partitioning `scores`' own real, observed
range (`0` to `98`+ , this run) into `10` real, equal-width intervals,
counting how many real rows land in each. The real, visual shape that
produces (roughly flat, here, since `random.randint` draws uniformly)
is itself real, useful information a single `mean`/`stdev` pair alone
doesn't show.

### SE Lens

Why does this lesson insert `100` *synthetic*, `random`-generated rows
rather than real, meaningful data? Because this lesson's own real
subject is proving the *pipeline* — store, query, analyze, visualize —
works correctly end to end, not producing a real, meaningful insight
about anything in particular. `random.seed(42)` makes the real,
specific numbers in this lesson's own output reproducible for anyone
following along, the identical real reasoning behind fixing a seed in
any real, repeatable experiment.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

S09 is complete: the engine's own real `extern "C"` boundary is fully,
honestly audited — not just the file that happened to get checked
first — and the engine has now been used, for the first time, as a
real place to keep data worth actually studying, with real statistics
and a real, saved chart to show for it. S10, next, returns to the
engine's own real internals one more time — transactions — the last
real gap `database_insert_many` (Lesson 17) named and deliberately
deferred: a bulk operation that can currently succeed partway and stay
that way.

---

## Closing

### Connect the Pieces

This lesson's first two units did real, honest security work: a
systematic re-audit of every `extern "C"` function this project has
ever written, not just the ones added since Lesson 7's own original
pass — finding a genuine, currently-shipping crash in
`page_manager_open` (reproduced for real, a real `std::terminate`
killing the whole Python process on nothing more than a corrupted
file), fixing it with the identical, already-established real
`try`/`catch` pattern, and re-running the exact same reproduction
script to prove it. A second, smaller real gap (`record_page_init`)
was hardened too, on the honest grounds that "currently harmless"
isn't the same as "safe." The third unit turned to something
completely different — real statistics and a real, saved
`matplotlib` histogram, built from `100` genuinely stored, genuinely
queried rows — the first lesson in this whole project that isn't about
the engine's own internal mechanics at all.

### What Breaks Without This

Revert `page_manager_open` to its original, unguarded form (`return
new PageManager(path);`, no `try`/`catch`), rebuild, and rerun this
lesson's own `crash_check.py`. The real crash returns, identical to
this lesson's own first unit — proof the fix, not some other, unrelated
change, is what actually prevents it. Restore the real `try`/`catch`
and confirm the safe, correct `did not crash, result: None` output
returns.

### Exercises

- Run the identical, real audit technique this lesson used —
  deliberately searching for `extern "C"` functions calling something
  that can throw, with no `try`/`catch` around it — against
  `database_c_api.cpp` itself, one more time. Confirm, for real, that
  Lesson 7's own original audit really did catch everything there, or
  find something it missed.
- Change `analyze.py`'s own `bins=10` to `bins=3` and to `bins=30`, and
  compare the real, resulting histograms. Explain, referencing this
  lesson's own CS Lens, what real information a `bins=3` histogram
  loses that `bins=30` keeps — and what a real, unnecessarily large bin
  count costs instead.
- `analyze.py` currently discards `player` entirely — it's never used
  anywhere in the real analysis. Extend the script to find and print
  the real player with the single highest score, using nothing but
  already-established `pocketdb` real methods.

### Definition of Done

- [ ] `page_manager_c_api.cpp` and `record_page_c_api.h`/`.cpp` are
      hardened; every `extern "C"` function in this project has been
      checked against Lesson 7's own established standard, not just
      the file it was originally applied to.
- [ ] You reproduced the real crash yourself, on the unfixed code,
      before applying this lesson's own fix.
- [ ] You confirmed the identical reproduction script no longer
      crashes after the real fix.
- [ ] You ran `analyze.py` yourself and confirmed a real
      `scores_histogram.png` file was actually created.
- [ ] You can explain, from memory, why "currently harmless" isn't the
      same real thing as "safe" — referencing this lesson's own SE
      Lens on `record_page_init`.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Harden page_manager_open/record_page_init; add real stats/matplotlib analysis"`.
