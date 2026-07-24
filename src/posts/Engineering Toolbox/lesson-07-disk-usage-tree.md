# Lesson 7: A Folder Is a Tree, and Trees Want Recursion
### (Disk Usage Analyzer + Directory Tree Printer)

**What you will build.** Two small functions: `directory_size(path)`,
which reports a folder's total size including everything nested inside
it, and `print_tree(path)`, which prints a folder's full contents as an
indented tree. Both are small. The transferable problem underneath is
bigger: a folder that can contain other folders is a **tree** — a
structure that contains smaller versions of itself, arbitrarily deep —
and the natural way to process a tree is a function that calls
**itself** on each smaller piece. This is your first real look at
recursion, and a folder tree is about the most intuitive place to meet
it, because you already understand what "a folder inside a folder
inside a folder" looks like without any code at all.

**What you need to know first.** From Lesson 2: `os.path.join`,
`os.path.isfile`. From Lesson 4: `os.listdir()`. New in this lesson:
recursion itself, `os.path.isdir()`, `os.path.getsize()`, and string
repetition with `*`.

No pipeline diagram — not part of an established multi-stage pipeline.

---

## Concept Unit: Recursion

### The Problem

We want to add up every file's size inside a folder, including files
buried inside sub-folders, inside *their* sub-folders, arbitrarily deep
— we don't know in advance how many levels there are. A single `for`
loop only visits one level; it has no natural way to "go deeper" into a
folder it finds partway through.

### Introduce the Concept in Isolation

```python
def total(items):
    result = 0
    for item in items:
        if isinstance(item, list):
            result += total(item)
        else:
            result += item
    return result

print(total([1, 2, [3, 4, [5]], 6]))
```

Run it:

```
21
```

This proves a function can call **itself** — `total` calling `total` —
and that doing so correctly handles arbitrary nesting: `[1, 2, [3, 4,
[5]], 6]` has a list inside a list inside a list, and one function,
written without knowing how deep the nesting would go, handled all of
it. `isinstance(item, list)` checks whether `item` is itself a list (a
new but self-explanatory check — "is this value of this type"). This
throwaway example is discarded; the real project doesn't process nested
lists, but the exact same shape — "if this is a container, recurse into
it; if not, just use its value" — carries over directly to folders and
files.

Here's the same run with a print at each step, showing exactly what
happens and in what order:

```python
def total(items, depth=0):
    result = 0
    for item in items:
        if isinstance(item, list):
            print("  " * depth + f"entering nested list: {item}")
            result += total(item, depth + 1)
        else:
            result += item
            print("  " * depth + f"added {item}, running total {result}")
    print("  " * depth + f"returning {result} for {items}")
    return result

total([1, 2, [3, 4, [5]], 6])
```

```
added 1, running total 1
added 2, running total 3
entering nested list: [3, 4, [5]]
  added 3, running total 3
  added 4, running total 7
  entering nested list: [5]
    added 5, running total 5
    returning 5 for [5]
  returning 12 for [3, 4, [5]]
added 6, running total 21
returning 21 for [1, 2, [3, 4, [5]], 6]
```

Real, traced execution. Notice the order: `total` doesn't finish adding
`1` and `2` and then separately "go do the nested part" — it pauses
right where the nested list appears, calls itself, waits for *that*
call to fully finish and return `12`, and only then continues adding `6`
to the running total. Each indentation level above is a genuinely
separate, simultaneously-paused call to the same function, each with its
own `result` variable that doesn't interfere with any other call's
`result`.

### Discard the Throwaway Example

Discarded.

### CS Lens

This is **recursion**, defined by two required parts: a **base case**
(here, "the item isn't a list — just add it, no further recursion
needed") and a **recursive case** (here, "the item is a list — call
myself on it, and use whatever comes back"). Every recursive function
that works correctly has both; a base case is what eventually stops the
recursion instead of calling itself forever, which the closing section
of this lesson triggers on purpose. Also recognized in: parsing nested
data of any kind (JSON, HTML, this exact file's own folder-tree
structure), the "recursive descent" behind how many real parsers work,
divide-and-conquer algorithms like merge sort, and — directly relevant
to this lesson's second half — file-system trees on every OS.

### SE Lens

A loop-based (non-recursive) version of `total` could handle this too,
using a manually-managed stack of "lists still left to process" — but it
would need to build and manage that stack itself, explicitly, in code.
Recursion gets the same effect "for free," using the language's own
built-in call stack (each paused function call, waiting on the one below
it) instead of a structure you build by hand. The cost: every language
imposes a maximum recursion depth (Python's default is 1000 calls deep)
— a folder tree nested deeper than that would hit a real limit a manual
stack-based loop wouldn't, though that's an exceptionally rare depth for
real folders to reach.

### Commands Needed

None.

### Run It

Shown above — real, traced output.

### Connection

We now understand recursion in the abstract. The rest of this lesson
applies it to something concrete: a real folder on disk.

---

## Concept Unit: `os.path.getsize()`

### The Problem

To add up a folder's total size, we need each individual file's size in
bytes — the same kind of information Lesson 61's hex dump read a whole
file to inspect, but here we just want the *size*, not the contents.

### Introduce the Concept in Isolation

```python
import os
print(os.path.getsize("demo_dir/a.txt"))
print(os.path.getsize("demo_dir/b.bin"))
```

Run it, against two real files (one an 11-character line of text plus a
newline, one containing 5000 random bytes):

```
12
5000
```

This proves `os.path.getsize(path)` returns a file's size in bytes
directly — no need to open the file and read its contents just to find
out how big it is. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `disk_tools.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `os` module

### The New Code

```python
import os

def directory_size(path):
    total_bytes = 0
    for entry in os.listdir(path):
        full_path = os.path.join(path, entry)
```

### The Updated Project

```python
import os

def directory_size(path):                        # ← new
    total_bytes = 0                                 # ← new
    for entry in os.listdir(path):                    # ← new
        full_path = os.path.join(path, entry)            # ← new
```

The function now walks every entry directly inside `path` — but only
one level deep so far, and does nothing with each entry yet.

### Mechanical Walkthrough
- `import os` — reminder.
- `def directory_size(path):` — basic.
- `total_bytes = 0` — basic.
- `for entry in os.listdir(path):` — Lesson

4's `os.listdir()`, reminder, reused on an arbitrary path instead of
- hardcoded `/proc`.
- `full_path = os.path.join(path, entry)` — Lesson 2's
`os.path.join()`, reminder, reused for real.

### CS Lens

Not new — skipped per the Stopping Rule; this unit's new piece was
`getsize()`, not yet used in the project code above (next unit).

### SE Lens

Not a new tradeoff beyond what's already been covered for `os.path.join`
and `os.listdir` individually — skipped; this unit is assembly, not a
new design decision.

### Commands Needed

None.

### Run It

Not runnable for meaningful output — the loop currently does nothing
with each entry.

### Connection

We can now see every direct entry in a folder, as a full path. The next
unit is the recursive heart of the function: deciding what to do with
each one.

---

## Concept Unit: Recursive Directory Walk

### The Problem

Each `entry` might be a plain file (add its size and move on) or a
folder (which itself might contain more files and folders — exactly the
nested-list situation from this lesson's first unit, just with real
folders instead of lists).

### Project Change

- **Files affected:** `disk_tools.py`
- **Change type:** add — completes `directory_size`
- **Location:** inside the `for entry in os.listdir(path):` loop
- **Dependencies:** `full_path`, `directory_size` itself (recursively)

### The New Code

```python
if os.path.isdir(full_path):
    total_bytes += directory_size(full_path)
else:
    total_bytes += os.path.getsize(full_path)
```

### The Updated Project

```python
import os

def directory_size(path):
    total_bytes = 0
    for entry in os.listdir(path):
        full_path = os.path.join(path, entry)
        if os.path.isdir(full_path):                     # ← new
            total_bytes += directory_size(full_path)        # ← new
        else:                                                # ← new
            total_bytes += os.path.getsize(full_path)          # ← new
    return total_bytes                                          # ← new
```

`directory_size()` is now complete: for every entry, if it's a folder,
the function calls **itself** on that folder and adds whatever comes
back; if it's a plain file, it adds that file's real size directly —
exactly the base-case/recursive-case shape from this lesson's first
unit, now doing real work on a real folder tree.

### Mechanical Walkthrough
- `if os.path.isdir(full_path):` — first appearance of `os.path.isdir()`
specifically, though it's the same idea as Lesson 2's `os.path.isfile()`
— a reminder rather than full treatment, since the concept ("check what
kind of thing this path is") was already covered there, only the
- specific check differs.
- `total_bytes += directory_size(full_path)` —
this *is* the recursive case: calling `directory_size` again, on a
sub-folder, before the current call has finished — the exact pattern
- from the throwaway lab, now on real data.
- `os.path.getsize(full_path)` —
the concept from this unit's own earlier lab, reused for real. `return
- total_bytes` — assuming `return` as basic.

### CS Lens

This is the base-case/recursive-case structure from the first unit,
mapped directly onto a real filesystem: a plain file is the base case
(nothing further to recurse into — its size is just its size); a folder
is the recursive case. Every folder tree, no matter how deep, eventually
bottoms out at plain files, which is exactly what makes the recursion
guaranteed to finish — *unless* something breaks that guarantee, which
this lesson's closing section demonstrates for real.

### SE Lens

Every recursive call to `directory_size` re-walks its own subfolder
completely independently — there's no shared state between sibling
calls, no coordination needed. That independence is exactly what makes
the recursive version simple to write correctly; the cost is that a
folder visited by two different paths (via a symlink, for instance)
gets counted twice, with no built-in protection against that — a real
limitation, not fixed here, and closely related to the failure this
lesson's closing section triggers on purpose.

### Commands Needed

`python3 disk_tools.py` — runs the script, once it has a call at the
bottom.

### Run It — Real Output

Against a real folder (`demo_dir/`) containing `a.txt` (12 bytes),
`b.bin` (5000 bytes), and `subdir/c.txt` (2 bytes):

```python
print(directory_size("demo_dir"))
```

```
$ python3 disk_tools.py
5014
```

Real output — `12 + 5000 + 2 = 5014`, correctly including the file
nested inside `subdir`, one level deeper than `directory_size`'s
starting point.

### Connection

Disk usage is done and genuinely recursive. The rest of this lesson
builds the tree printer, reusing the exact same recursive shape for a
different purpose.

---

## Concept Unit: String Repetition and the Tree Printer

### The Problem

We want to print a folder's contents the way a file browser's tree view
looks — deeper items indented further right. We need a way to produce
"more spaces" as depth increases, without writing a separate
special-case for each possible depth.

### Introduce the Concept in Isolation

```python
print("  " * 0 + "top")
print("  " * 1 + "nested")
print("  " * 3 + "deep")
```

Run it:

```
top
  nested
      deep
```

This proves `*` between a string and a number **repeats** the string
that many times — `"  " * 3` is six spaces, not "multiplication" in the
arithmetic sense, but the same operator reused for a related idea:
"combine this value with itself, this many times." This throwaway
example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `disk_tools.py`
- **Change type:** add — a new function
- **Location:** after `directory_size`
- **Dependencies:** `os.listdir`, `os.path.join`, `os.path.isdir` —
  all already used above

### The New Code

```python
def print_tree(path, depth=0):
    for entry in os.listdir(path):
        full_path = os.path.join(path, entry)
        print("  " * depth + entry)
        if os.path.isdir(full_path):
            print_tree(full_path, depth + 1)
```

### The Updated Project

```python
import os

def directory_size(path):
    total_bytes = 0
    for entry in os.listdir(path):
        full_path = os.path.join(path, entry)
        if os.path.isdir(full_path):
            total_bytes += directory_size(full_path)
        else:
            total_bytes += os.path.getsize(full_path)
    return total_bytes


def print_tree(path, depth=0):                      # ← new
    for entry in os.listdir(path):                     # ← new
        full_path = os.path.join(path, entry)             # ← new
        print("  " * depth + entry)                          # ← new
        if os.path.isdir(full_path):                            # ← new
            print_tree(full_path, depth + 1)                       # ← new
```

`disk_tools.py` is now complete: `directory_size` recursively totals
bytes; `print_tree` recursively prints a visual, indented tree —
structurally the same recursion, applied to a different task.

### Mechanical Walkthrough
- `def print_tree(path, depth=0):` — default argument, reminder from Lesson 61.
- `print("  " * depth + entry)` — the string-repetition concept

from this unit's lab, reused for real, concatenated (`+`, already basic
string joining) with the entry's own name. `print_tree(full_path, depth
- + 1)` — the recursive call, passing `depth + 1` so each deeper level
prints with one more level of indentation than its parent — worth
noting explicitly: this is *how* the indentation actually tracks depth,
by passing the current depth down to each recursive call rather than
any global counter.

### CS Lens

Passing `depth` down through each recursive call, rather than tracking
it in some shared variable outside the function, is the same
independence noted in the previous unit's SE lens — each call knows
only its own depth, nothing about its siblings or ancestors beyond what
was explicitly handed to it.

### SE Lens

`print_tree` prints immediately, as it walks, rather than building a
big string or list and returning it all at once for the caller to print.
That's a real, deliberate choice: for a genuinely huge folder tree,
printing incrementally shows output right away rather than making you
wait for the entire (possibly very large) tree to finish being
collected first — the same "don't make the user wait to see anything"
principle behind streaming output in general.

### Commands Needed

None new.

### Run It — Real Output

```python
print_tree("demo_dir")
```

```
$ python3 disk_tools.py
b.bin
subdir
  c.txt
a.txt
```

Real output — `subdir` printed at depth 0, and `c.txt` inside it printed
at depth 1, one level indented, exactly matching the real folder
structure.

### Connection

Both functions are complete and genuinely recursive. The closing section
shows what happens when the base case that makes recursion safe stops
holding.

---

## Closing

### Connect the Pieces

Trace `directory_size("demo_dir")` end to end: the top-level call saw
`a.txt`, `b.bin`, and `subdir` via `os.listdir`. `a.txt` and `b.bin`
hit the base case — `os.path.isdir` was `False` for both — and their
real sizes (12 and 5000 bytes) were added directly. `subdir` hit the
recursive case: `directory_size("demo_dir/subdir")` was called, itself
walked *its* one entry (`c.txt`, 2 bytes, another base case), returned
`2`, and that `2` was added to the outer call's running total — for a
final `5014`. `print_tree` walks the identical structure, only
differing in what it does at each step: printing with indentation
instead of accumulating a sum.

### What Breaks Without This

A recursive function without a guaranteed-reachable base case doesn't
just produce a wrong answer — it can recurse forever. Folders are
normally guaranteed to bottom out at plain files eventually... unless a
symlink creates a loop back to a folder already being walked:

```bash
ln -s /home/claude/demo_dir demo_dir/loop
```

Running `directory_size("demo_dir")` against a folder now containing a
symlink pointing back to itself:

```
Traceback (most recent call last):
  ...
  File "disk_tools.py", line 8, in directory_size
  File "disk_tools.py", line 8, in directory_size
  File "disk_tools.py", line 8, in directory_size
  [Previous line repeated 37 more times]
  File "disk_tools.py", line 10, in directory_size
OSError: [Errno 40] Too many levels of symbolic links: 'demo_dir/loop/loop/loop/loop/...'
```

Real error, on a real symlink loop. Notice it wasn't even Python's own
recursion-depth limit (1000, mentioned earlier) that stopped this — the
operating system itself refuses to follow a symlink chain past a certain
depth and raised its own error first, at 40 levels. Either way, the
lesson is the same: `directory_size` implicitly assumed every folder
eventually bottoms out at plain files, and a symlink loop breaks that
assumption entirely. A correct version would track which real folders
it has already visited (using `os.path.realpath` to resolve symlinks to
their true target, and a set to remember what's been seen) and skip
anything already visited — a real fix, left as an exercise rather than
built here.

### Exercises

1. Fix the symlink-loop problem yourself: track visited real paths (via
   `os.path.realpath()` and a `set`) and skip any folder already seen.
2. Modify `print_tree` to also show each file's size next to its name,
   using `os.path.getsize` — you'll need to check `os.path.isdir`
   before deciding whether to print a size or recurse.
3. Rewrite `directory_size` *without* recursion, using a manually
   managed list as a stack of folders still left to process — confirm
   it produces the identical total, and notice how much more explicit
   bookkeeping it takes to do the same job recursion did for you.

### Definition of Done

- [ ] `disk_tools.py` runs and both functions produce correct results
      against a real folder you built yourself, with at least one level
      of nesting
- [ ] You can explain, without looking back, what a base case is and
      why `directory_size` needs one
- [ ] You triggered the real symlink-loop failure and understand why it
      breaks the recursion's core assumption
- [ ] Commit:

```
git add disk_tools.py
git commit -m "Add recursive directory size and tree printer: prove a folder tree is processed the same way any nested structure is, and that recursion needs a real, reachable base case to terminate"
```
