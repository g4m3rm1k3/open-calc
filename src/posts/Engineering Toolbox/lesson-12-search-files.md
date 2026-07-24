# Lesson 12: Producing Results as You Find Them
### (Search Every File in a Folder)

**What you will build.** `find_files(root, pattern)` — a function that
recursively searches a folder for filenames matching a wildcard pattern
like `"*.txt"` — and `search_contents()`, which uses it to also search
*inside* matching files for a piece of text, the way `grep -r` does. The
working feature is small. The transferable problem underneath has two
parts: first, the standard library already has a proper, robust
recursive folder walker (`os.walk()`), so Lesson 7's manually-written
recursion isn't how this is normally done in real code; second, a
search function that finds things one at a time doesn't need to collect
everything into a list before it can report the first result — it can
**yield** results as it finds them, which is a genuinely different way
of writing a function than anything used so far.

**What you need to know first.** From Lesson 7: recursion, the general
idea of walking a folder tree (though `os.walk()` replaces the manual
version). From Lesson 4: `try`/`except`. New in this lesson:
`os.walk()`, the `fnmatch` module, and generator functions (`yield`).

No pipeline diagram — not part of an established multi-stage pipeline.

---

## Concept Unit: `os.walk()`

### The Problem

Lesson 7 built a recursive folder walker by hand — `os.listdir()`,
check `isdir()`, call itself. That was worth building once, to
understand recursion concretely. For everyday code, Python's standard
library already provides a robust, well-tested version of exactly that
walk, with a genuinely more convenient shape.

### Introduce the Concept in Isolation

```python
import os
for dirpath, dirnames, filenames in os.walk("demo_dir"):
    print("dirpath:", dirpath)
    print("  dirnames:", dirnames)
    print("  filenames:", filenames)
```

Run it, against Lesson 7's real `demo_dir/` (containing `a.txt`,
`b.bin`, `b_copy.bin`, and `subdir/c.txt`):

```
dirpath: demo_dir
  dirnames: ['subdir']
  filenames: ['b.bin', 'b_copy.bin', 'a.txt']
dirpath: demo_dir/subdir
  dirnames: []
  filenames: ['c.txt']
```

This proves `os.walk()` visits every folder in the tree — including
nested ones — and for each one, hands back **three** things at once:
the current folder's path, the names of the sub-folders directly inside
it, and the names of the plain files directly inside it, already
separated for you. No manual `isdir()` check is needed anywhere — the
separation into `dirnames` versus `filenames` already happened. This
throwaway example is discarded; the real project searches by pattern,
not just prints everything.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `file_search.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `os` module

### The New Code

```python
import os

def find_files(root, pattern):
    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            pass
```

### The Updated Project

```python
import os

def find_files(root, pattern):                        # ← new
    for dirpath, dirnames, filenames in os.walk(root):    # ← new
        for filename in filenames:                            # ← new
            pass                                                # ← new, temporary placeholder
```

The function now visits every file in the entire tree, one at a time,
across every folder — but does nothing with `pattern` or each
`filename` yet.

### Mechanical Walkthrough
- `import os` — reminder.
- `def find_files(root, pattern):` — basic.
- `for dirpath, dirnames, filenames in os.walk(root):` — the concept from

this unit's lab, reused for real; this is tuple unpacking (Lesson 1,
reminder) across *three* values instead of two, applied to each step
- `os.walk` produces.
- `for filename in filenames:` — basic iteration over the list `os.walk` already handed us.
- `pass` — reminder placeholder.

### CS Lens

Not new — skipped per the Stopping Rule; the recursive-traversal idea
itself was fully covered in Lesson 7.

### SE Lens

`os.walk()`, versus Lesson 7's hand-built version, already handles real
edge cases that version didn't: it has its own internal protection
against symlink loops (off by default, opt-in via a parameter not used
here), and it separates files from folders for you instead of requiring
a separate `os.path.isdir()` check per entry. This is a genuinely common
pattern in real engineering: build something by hand once, to actually
understand it — then reach for the standard library's more complete
version for real use, because it's already solved problems your first
version didn't even know to worry about.

### Commands Needed

None.

### Run It

Not runnable for meaningful output — `pass` does nothing observable.

### Connection

We can now see every file in the tree, files and folders already
separated. The next unit filters by name pattern.

---

## Concept Unit: `fnmatch.fnmatch()`

### The Problem

We want to match filenames against patterns like `"*.txt"` — the same
wildcard syntax your shell understands, not a full regular expression.
Python's string methods have no built-in wildcard matching; we need a
dedicated tool for it.

### Introduce the Concept in Isolation

```python
import fnmatch
names = ["a.txt", "b.bin", "c.py", "notes.txt", "README"]
for name in names:
    print(name, fnmatch.fnmatch(name, "*.txt"))
```

Run it:

```
a.txt True
b.bin False
c.py False
notes.txt True
README False
```

This proves `fnmatch.fnmatch(name, pattern)` matches shell-style
wildcards — `*` meaning "any number of any characters" — the same
pattern language Lesson 3's bash `for file in *` used, now available as
a real Python function instead of something only the shell understands.
This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `file_search.py`
- **Change type:** replace — the `pass` placeholder
- **Location:** inside the `for filename in filenames:` loop
- **Dependencies:** `filename`, `pattern`

### The New Code

```python
import fnmatch

if fnmatch.fnmatch(filename, pattern):
    print(os.path.join(dirpath, filename))
```

### The Updated Project

```python
import os
import fnmatch                                          # ← new

def find_files(root, pattern):
    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            if fnmatch.fnmatch(filename, pattern):         # ← new
                print(os.path.join(dirpath, filename))        # ← new
```

`find_files()` now prints the full path of every file, anywhere in the
tree, whose name matches the given pattern — genuinely working, though
the next unit changes *how* it delivers results.

### Mechanical Walkthrough
- `import fnmatch` — first appearance of this module.
- `if fnmatch.fnmatch(filename, pattern):` — the concept from this unit's lab, reused for real.
- `os.path.join(dirpath, filename)` — Lesson 2,

reminder — building the full path from the current folder and the
matched filename.

### CS Lens

Not new beyond pattern matching itself, already covered by this unit's
lab — skipped per the Stopping Rule.

### SE Lens

`fnmatch` deliberately supports only a small pattern language (`*`,
`?`, character ranges) — genuinely less powerful than full regular
expressions. That's a real, intentional tradeoff: shell-style wildcards
are what most people already know from typing at a prompt, and they're
sufficient for "match files by name shape." Track 7's later regex-based
lessons (search-and-replace, log analysis) reach for `re` instead,
specifically when a pattern needs more expressive power than `fnmatch`
offers — different tools for genuinely different-sized problems, not
one obsoleting the other.

### Commands Needed

None new.

### Run It

Runnable and correct as-is. The next unit changes the mechanism from
printing directly to *yielding* results — a real, meaningful
restructuring, not just a cosmetic one.

### Connection

`find_files()` already works, printing matches as it finds them. The
next unit is about *how* a function like this should hand results back
to whoever's using it.

---

## Concept Unit: Generator Functions (`yield`)

### The Problem

`find_files()` currently prints its own results directly — meaning it's
only ever useful for printing, never for anything else, like counting
matches, searching *inside* them, or collecting them into a report.
Returning a full list instead would work, but building the *entire*
list before returning means waiting for the whole tree to be walked
before the caller sees a single result — a real cost on a large folder
tree, and a step backward from Lesson 10's streaming philosophy.

### Introduce the Concept in Isolation

```python
def count_up_to(n):
    i = 1
    while i <= n:
        yield i
        i += 1

result = count_up_to(3)
print(result)
print(type(result))
for value in result:
    print("got:", value)
```

Run it:

```
<generator object count_up_to at 0x7fc243934b80>
<class 'generator'>
got: 1
got: 2
got: 3
```

This proves `yield`, used anywhere inside a function, turns that
function into something fundamentally different from an ordinary one:
calling `count_up_to(3)` doesn't run the function's body at all yet — it
returns a **generator** object, a paused, ready-to-resume computation.
Only the `for` loop, actually asking for values one at a time, causes
the function's body to run — and it runs just enough to produce the
next `yield`ed value, then pauses again exactly there. A second,
explicit run proves the "doesn't run yet" part directly:

```python
def talkative_count(n):
    i = 1
    while i <= n:
        print(f"about to yield {i}")
        yield i
        i += 1

print("calling the function...")
gen = talkative_count(3)
print("called it. anything printed above this line?")
print("now iterating:")
for value in gen:
    print("received", value, "in the loop")
```

```
calling the function...
called it. anything printed above this line?
now iterating:
about to yield 1
received 1 in the loop
about to yield 2
received 2 in the loop
about to yield 3
received 3 in the loop
```

Real, traced proof: nothing printed between "calling the function..."
and "called it" — the function's body genuinely hadn't run yet, even
though it was "called." Only the `for` loop actually drove execution,
one paused step at a time. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `file_search.py`
- **Change type:** refactor — replace the `print()` with `yield`
- **Location:** inside `find_files()`'s `if fnmatch.fnmatch(...)` block
- **Dependencies:** everything already in `find_files()`

### The New Code

```python
yield os.path.join(dirpath, filename)
```

### The Updated Project

```python
import os
import fnmatch

def find_files(root, pattern):
    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            if fnmatch.fnmatch(filename, pattern):
                yield os.path.join(dirpath, filename)   # ← new
```

`find_files()` is now a generator function: calling it doesn't search
anything yet — it hands back a paused, ready-to-resume search that
produces one matching path at a time, only as something actually asks
for the next one.

### Mechanical Walkthrough
- `yield os.path.join(dirpath, filename)` — the concept from this unit's
lab, reused for real, replacing the earlier `print(...)` directly.

### CS Lens

This is **lazy evaluation** — computing each result only at the moment
it's actually needed, rather than eagerly computing everything up
front. Also recognized in: Python's own `range()` (doesn't build a full
list of numbers — Lesson 5's `range(0, len(data), width)` already
relied on this, without it being named yet), infinite sequences (a
generator can `yield` forever, since nothing forces it to finish — not
possible with a plain list), database query cursors that fetch rows on
demand instead of loading an entire result set into memory at once.

### SE Lens

The alternative — building a full list of every match and returning it
— would mean a search of a genuinely huge folder tree has to finish
completely, holding every match in memory, before the caller sees
*any* result, even the very first one. A generator hands back the
first match the instant it's found, and a caller free to stop early
(say, only wanting the first 3 matches) never pays the cost of finding
the rest at all. The cost: a generator can only be iterated once —
unlike a list, you can't loop over the same generator object twice and
expect results the second time, a real, sometimes-surprising limitation
worth knowing about.

### Commands Needed

`python3 file_search.py` — runs the script.

### Run It — Real Output

Against a clean, purpose-built folder (`search_demo/`, containing text
files at various depths and a genuinely binary file):

```python
for path in find_files("search_demo", "*.txt"):
    print(path)
```

```
$ python3 file_search.py
search_demo/docs/todo.txt
search_demo/docs/notes.txt
search_demo/docs/archive/old_notes.txt
```

Real output — every `.txt` file found, regardless of depth, printed as
the generator produces each one.

### Connection

`find_files()` is now a real, reusable generator. The closing section
uses it to build a second tool — content search — reusing it directly
rather than duplicating its logic.

---

## Building `search_contents()` (One New Idea: Handling Bad Data)

`search_contents()` reuses `find_files()` completely unchanged — it
just does something with each path instead of printing it directly,
which is exactly the payoff of having made `find_files()` a generator
instead of a print-everything function.

```python
def search_contents(root, pattern, text):
    for path in find_files(root, pattern):
        try:
            with open(path) as f:
                content = f.read()
        except UnicodeDecodeError:
            continue
        if text in content:
            print(path)
```

`try`/`except UnicodeDecodeError` is Lesson 4's pattern, reused for
real: not every file matching a pattern is necessarily readable as
text — `search_demo/src/data.bin` genuinely contains bytes that aren't
valid text, and without this `try`, reading it would crash the whole
search. `if text in content:` is the one genuinely new-here idea: the
`in` operator, already familiar for checking list/dict membership,
works identically for checking whether one string appears anywhere
inside another.

### Commands Needed

None new.

### Run It — Real Output

```python
search_contents("search_demo", "*.txt", "notes")
```

```
search_demo/docs/notes.txt
search_demo/docs/archive/old_notes.txt
```

And searching *all* files (`"*"`), including the real binary file,
safely:

```python
search_contents("search_demo", "*", "def")
```

```
search_demo/src/utils.py
```

Real output — `data.bin` was silently, safely skipped by the `try`, and
never crashed the search or appeared in the results.

---

## Closing

### Connect the Pieces

Trace `search_contents("search_demo", "*", "def")` end to end:
`find_files()` began walking `search_demo` via `os.walk()`, yielding
each matching path (`"*"` matches everything) one at a time, pausing
between each. `search_contents()` pulled the first one, tried to open
and read it as text; when it reached `data.bin`, `f.read()` raised a
real `UnicodeDecodeError`, caught by the `try`, and the loop moved on
to `find_files()`'s *next* yielded value rather than crashing — a
direct, visible consequence of `find_files()` being a generator: the
search could resume exactly where it left off, one file later, instead
of everything having already been computed and gone stale.

### What Breaks Without This

Remove the `try`/`except` from `search_contents()` and run the identical
search:

```python
def search_contents_broken(root, pattern, text):
    for path in find_files(root, pattern):
        with open(path) as f:
            content = f.read()
        if text in content:
            print(path)

search_contents_broken("search_demo", "*", "def")
```

Real output:

```
Traceback (most recent call last):
  ...
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xff in position 0: invalid start byte
```

Real crash, on the real binary file — the exact same failure shape
Lesson 4 first introduced: a completely reasonable-looking search
crashes the instant it meets one file that doesn't fit its assumption
(here, "every file matching this pattern is readable as text"). A
`"*.py"` or `"*.txt"` pattern happens to sidestep this specific failure
by accident, since those extensions are conventionally text — but
`"*"` (search everything) exposes it immediately, which is exactly why
the real project includes the `try` from the start rather than adding
it only after hitting the crash.

### Exercises

1. Modify `find_files()` to also accept a `max_depth` parameter,
   stopping recursion beyond a certain folder depth — you'll need to
   count how many `os.sep`-separated parts `dirpath` has, relative to
   `root`.
2. Make `search_contents()` case-insensitive (searching for `"NOTES"`
   should still match `"notes"` in a file) — hint: `.lower()` both
   sides of the `in` check.
3. Rewrite `find_files()` to *not* use `yield` — build and return a full
   list instead — and add a `print()` at the very top of the function
   body. Call it and compare when that `print()` fires relative to the
   generator version's `talkative_count`-style timing from this
   lesson's lab.

### Definition of Done

- [ ] `file_search.py` runs and `find_files()` correctly locates every
      matching file in a real nested folder you built yourself
- [ ] `search_contents()` runs against a folder containing at least one
      genuinely non-text file, without crashing
- [ ] You can explain, without looking back, what specifically makes
      `find_files()` a generator rather than an ordinary function, and
      why that mattered for `search_contents()`
- [ ] You triggered the real `UnicodeDecodeError` and understand why a
      `"*"` pattern surfaces it while `"*.txt"` likely wouldn't
- [ ] Commit:

```
git add file_search.py
git commit -m "Add a recursive file search: prove os.walk() replaces manual recursion for real use, and that yield lets a search produce results incrementally instead of computing everything before returning anything"
```
