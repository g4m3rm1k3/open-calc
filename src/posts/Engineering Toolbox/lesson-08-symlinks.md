# Lesson 8: A Path That Points to Another Path
### (Symbolic Link Explorer)

**What you will build.** A recursive tool — reusing Lesson 7's exact
recursion shape — that walks a folder and reports every symbolic link it
finds: what it points to, whether that target actually exists, and
where it *really* resolves to after following every hop. The working
feature is small. The transferable problem underneath picks up directly
from Lesson 7's closing section: a symlink is not a copy, not a
shortcut in the Windows sense, and not guaranteed to point anywhere real
at all — it's a path that says "go look somewhere else," and nothing
checks that "somewhere else" is valid until something actually tries to
follow it.

**What you need to know first.** From Lesson 7: recursion,
`os.listdir()`, `os.path.join()`, `os.path.isdir()`, the base
case/recursive case shape. From Lesson 2: `os.path.isfile()`. New in
this lesson: `os.path.islink()`, `os.readlink()`, `os.path.exists()`,
and `os.path.realpath()`.

No pipeline diagram — not part of an established multi-stage pipeline.

---

## Concept Unit: `os.path.islink()`

### The Problem

Lesson 7's `directory_size` only ever asked "is this a file, or a
folder?" — a symlink is neither of those, exactly; it's a third kind of
thing, and Lesson 7's closing section showed what happens when code
doesn't account for that (infinite recursion through a symlink loop).
Before doing anything else, we need a way to recognize a symlink as a
symlink.

### Introduce the Concept in Isolation

```python
import os
for name in ["real_file.txt", "link_to_real", "broken_link"]:
    print(name, os.path.islink(name))
```

Run it, against a real plain file, a real working symlink, and a real
symlink pointing at something that doesn't exist:

```
real_file.txt False
link_to_real True
broken_link True
```

This proves `os.path.islink()` answers "is this path itself a symlink"
— and notice `broken_link` still reads `True`, even though what it
points to doesn't exist. Being a symlink and pointing somewhere real
are two completely separate facts, which is exactly the distinction the
rest of this lesson is built around. This throwaway example is
discarded; the real project checks every entry in a real folder, not a
hardcoded list of three names.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `symlink_explorer.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `os` module; a real folder containing at least one
  symlink to explore

### The New Code

```python
import os

def explore(path, depth=0):
    for entry in os.listdir(path):
        full_path = os.path.join(path, entry)
        if os.path.islink(full_path):
            pass
```

### The Updated Project

```python
import os

def explore(path, depth=0):                          # ← new
    for entry in os.listdir(path):                      # ← new
        full_path = os.path.join(path, entry)               # ← new
        if os.path.islink(full_path):                          # ← new
            pass                                                 # ← new, temporary placeholder
```

The function now walks a folder — the exact recursive shape from Lesson
7, reused directly — and can tell symlinks apart from everything else,
but does nothing with that information yet.

### Mechanical Walkthrough
`import os`, `def explore(path, depth=0):`, `for entry in
- os.listdir(path):`, `full_path = os.path.join(path, entry)` — all
direct reminders of Lesson 7's `directory_size`/`print_tree` structure,
- reused here unchanged.
- `if os.path.islink(full_path):` — the concept from this unit's lab, reused for real.
- `pass` — placeholder, reminder.

### CS Lens

Not new — skipped per the Stopping Rule; the recursive shape itself was
already fully covered in Lesson 7.

### SE Lens

Checking `islink()` *before* anything else in this function (rather
than after checking `isdir()` or `isfile()`) matters for a reason
Lesson 7's closing section already demonstrated: `os.path.isdir()` on a
symlink pointing at a folder returns `True` — meaning if this function
checked `isdir()` first, it would recurse straight into the symlink's
target as if it were an ordinary folder, with no idea a symlink was
even involved. Checking `islink()` first intercepts that case
deliberately, before it can happen.

### Commands Needed

None.

### Run It

Not runnable for meaningful output — `pass` does nothing observable.

### Connection

We can now tell a symlink apart from everything else. The next unit is
finding out what it actually points to.

---

## Concept Unit: `os.readlink()`

### The Problem

Knowing something *is* a symlink isn't the same as knowing where it
points. We need the actual target — exactly as the symlink itself
stores it, which (as the next unit shows) is not necessarily the same
as where it ultimately, really leads.

### Introduce the Concept in Isolation

```python
import os
print(os.readlink("link_to_real"))
print(os.readlink("link_chain"))
print(os.readlink("broken_link"))
```

Run it, against `link_to_real` (points directly at a real file),
`link_chain` (points at *another symlink*, not the real file directly),
and `broken_link` (points at something that doesn't exist):

```
real_file.txt
link_to_real
/nonexistent/path
```

This proves `os.readlink()` returns exactly what the symlink itself
contains — no verification, no following further hops. `link_chain`
returning `"link_to_real"`, not `"real_file.txt"`, is the important
detail here: `readlink` shows you *one hop*, not the final destination.
`broken_link` returns its stored target with no complaint at all —
`readlink` never checks whether that target exists. This throwaway
example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `symlink_explorer.py`
- **Change type:** replace — the `pass` placeholder
- **Location:** inside `if os.path.islink(full_path):`
- **Dependencies:** `full_path`

### The New Code

```python
target = os.readlink(full_path)
print("  " * depth + f"{entry} -> {target}")
```

### The Updated Project

```python
import os

def explore(path, depth=0):
    for entry in os.listdir(path):
        full_path = os.path.join(path, entry)
        if os.path.islink(full_path):
            target = os.readlink(full_path)                       # ← new
            print("  " * depth + f"{entry} -> {target}")             # ← new
```

The function now prints each symlink's name alongside exactly what it
points to, one hop, as stored — not yet whether that target is real or
where it ultimately leads.

### Mechanical Walkthrough
- `target = os.readlink(full_path)` — the concept from this unit's lab, reused for real.
- `print("  " * depth + f"{entry} -> {target}")` —

string repetition for indentation (Lesson 7, reminder), string
concatenation and an f-string, both already basic.

### CS Lens

This is the difference between a **reference** and the **value it
refers to** — `readlink` gives you the reference itself (a stored path,
possibly to another reference), not the thing it ultimately resolves
to. Also recognized in: a pointer in C holding a memory address versus
the value at that address, a URL shortener's stored destination
(possibly *another* shortened URL) versus the page it eventually lands
on, DNS's `CNAME` records (a name pointing to another name, not
directly to an IP).

### SE Lens

A symlink storing *a path*, rather than storing a direct, permanent
reference to a specific file's actual data, is what makes symlinks
cheap and flexible — you can retarget one by just rewriting a short
string — but it's also exactly why `link_chain -> link_to_real` and
`broken_link -> /nonexistent/path` are both perfectly valid, storable
symlinks: nothing about creating or storing a symlink ever required its
target to exist or make sense at that moment.

### Commands Needed

None new.

### Run It

Runnable now, but incomplete — it'll correctly print each symlink and
its immediate target, but not yet whether that target is real, which is
the whole reason `broken_link` needs its own check.

### Connection

We can now see exactly what each symlink claims to point to. The next
unit checks whether that claim is actually true.

---

## Concept Unit: `os.path.exists()`

### The Problem

`broken_link -> /nonexistent/path` prints just fine — `readlink` never
complained. We need a separate, explicit check for whether a symlink's
target is real, since nothing else so far tells us that.

### Introduce the Concept in Isolation

```python
import os
print("link_to_real exists:", os.path.exists("link_to_real"))
print("broken_link exists:", os.path.exists("broken_link"))
print("link_chain exists:", os.path.exists("link_chain"))
```

Run it:

```
link_to_real exists: True
broken_link exists: False
link_chain exists: True
```

This proves `os.path.exists()`, called on a symlink, **follows** it (and
any further hops, as `link_chain` shows) and asks whether the *final*
destination is real — the opposite of `readlink`'s "just show me the
stored path, no questions asked" behavior. This throwaway example is
discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `symlink_explorer.py`
- **Change type:** add
- **Location:** inside `if os.path.islink(full_path):`, after `target =
  ...`
- **Dependencies:** `full_path`

### The New Code

```python
exists = os.path.exists(full_path)
status = "OK" if exists else "BROKEN"
```

### The Updated Project

```python
import os

def explore(path, depth=0):
    for entry in os.listdir(path):
        full_path = os.path.join(path, entry)
        if os.path.islink(full_path):
            target = os.readlink(full_path)
            exists = os.path.exists(full_path)                    # ← new
            status = "OK" if exists else "BROKEN"                    # ← new
            print("  " * depth + f"{entry} -> {target} [{status}]")
```

Each symlink now reports a real status alongside its target — `OK` if
following it actually leads somewhere, `BROKEN` if it doesn't.

### Mechanical Walkthrough
- `exists = os.path.exists(full_path)` — the concept from this unit's lab, reused for real.
- `status = "OK" if exists else "BROKEN"` — first

appearance of the conditional (ternary) expression: a single-line
`if`/`else` that produces a *value* rather than running a statement
block — deliberately compact for a case this simple; equivalent to a
full four-line `if`/`else` block, chosen here because there's nothing
- more to the logic than picking one of two strings.
- `print(...)` — an
added `[{status}]` in the f-string, already-basic formatting.

### CS Lens

Not new beyond the value-producing conditional itself — worth noting
this is the same *concept* the lesson schema's own worked example
mentions (a first-appearing ternary is a real concept, not punctuation)
but it's small enough that a dedicated lab would be overkill for
something this self-evident once named — judged here as sufficiently
explained inline rather than warranting its own throwaway example.

### SE Lens

`os.path.exists()` silently returning `False` for a broken symlink —
rather than raising an error — is a deliberate, forgiving design choice
on Python's part: checking existence is expected to be a routine, no-
big-deal question, not an exceptional situation, the same reasoning
Lesson 4's `.get()` unit already covered for dictionaries. The cost:
code that *assumes* "not a file" and "doesn't exist" mean the same
thing can silently skip broken symlinks entirely without ever
mentioning them — precisely the failure this lesson's closing section
triggers on purpose.

### Commands Needed

None new.

### Run It

Runnable and informative now — each symlink shows a real, correct
status. One piece remains: where a working symlink actually,
*finally* leads.

### Connection

We can now tell working symlinks from broken ones. The last unit
resolves a working symlink all the way to its real, final destination.

---

## Concept Unit: `os.path.realpath()`

### The Problem

`link_chain -> link_to_real [OK]` is technically correct but not very
satisfying — `link_to_real` is *itself* a symlink, not the real file.
We want the actual, final file `link_chain` leads to, after following
every hop, however many there are.

### Introduce the Concept in Isolation

```python
import os
print(os.path.realpath("link_to_real"))
print(os.path.realpath("link_chain"))
print(os.path.realpath("broken_link"))
```

Run it:

```
/home/claude/symlink_demo/real_file.txt
/home/claude/symlink_demo/real_file.txt
/nonexistent/path
```

This proves `os.path.realpath()` follows *every* hop, however many
there are, and returns one final, absolute, fully-resolved path —
`link_chain` (which `readlink` showed pointing at `link_to_real`, itself
a symlink) resolves all the way to `real_file.txt`, the actual file,
in one call. For the broken link, it still returns a real, absolute
version of the target path — even though nothing exists there — since
resolving *where a path points* and confirming *that it exists* remain
two separate questions, exactly as the previous unit already
established. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `symlink_explorer.py`
- **Change type:** add — completes the symlink-reporting branch; also
  add the two remaining branches (folders, plain files) to complete
  the recursion
- **Location:** inside `if os.path.islink(full_path):`, and two new
  `elif`/`else` branches after it
- **Dependencies:** everything built so far

### The New Code

```python
real = os.path.realpath(full_path)
print("  " * depth + f"{entry} -> {target} [{status}] (resolves to {real})")
```

### The Updated Project

```python
import os

def explore(path, depth=0):
    for entry in os.listdir(path):
        full_path = os.path.join(path, entry)
        if os.path.islink(full_path):
            target = os.readlink(full_path)
            exists = os.path.exists(full_path)
            real = os.path.realpath(full_path)                                   # ← new
            status = "OK" if exists else "BROKEN"
            print("  " * depth + f"{entry} -> {target} [{status}] (resolves to {real})")  # ← new
        elif os.path.isdir(full_path):                                             # ← new
            print("  " * depth + entry + "/")                                        # ← new
            explore(full_path, depth + 1)                                              # ← new
        else:                                                                        # ← new
            print("  " * depth + entry)                                               # ← new
```

`symlink_explorer.py` is now complete: symlinks report their immediate
target, their status, and their fully-resolved real destination;
folders recurse (the exact Lesson 7 pattern); plain files just print.

### Mechanical Walkthrough
- `real = os.path.realpath(full_path)` — the concept from this unit's lab, reused for real. The updated `print(...)` — an added `(resolves to

{real})`, already-basic f-string formatting. `elif os.path.isdir(...)`
- and the recursive `explore(full_path, depth + 1)` call — Lesson 7's
recursion, reminder, now sitting alongside the symlink branch rather
than being the only case, exactly matching this lesson's earlier SE
- Lens about checking `islink()` before `isdir()`.
- `else: print(...)` —
the plain-file case, unchanged from Lesson 7's `print_tree`.

### CS Lens

Not new beyond what earlier units in this lesson already covered —
skipped per the Stopping Rule.

### SE Lens

`realpath()` doing the "follow every hop" work internally, rather than
this code manually looping "call `readlink`, check if the result is
*itself* a symlink, repeat," is a real convenience — Python already
handles the loop-following logic (including its own internal protection
against symlink loops, which is exactly what surfaced as an `OSError`
in Lesson 7's closing section) so this lesson's code doesn't have to
reimplement it.

### Commands Needed

`python3 symlink_explorer.py` — runs the script.

### Run It — Real Output

Against a real folder containing a plain file, a direct symlink, a
two-hop symlink chain, a broken symlink, and a nested folder with its
own symlink inside:

```python
explore(".")
```

```
$ python3 symlink_explorer.py
broken_link -> /nonexistent/path [BROKEN] (resolves to /nonexistent/path)
subdir/
  nested_link -> ../real_file.txt [OK] (resolves to /home/claude/symlink_demo/real_file.txt)
link_to_real -> real_file.txt [OK] (resolves to /home/claude/symlink_demo/real_file.txt)
real_file.txt
link_chain -> link_to_real [OK] (resolves to /home/claude/symlink_demo/real_file.txt)
```

Real output, all five cases distinguishable at a glance: a broken
target, a nested working link, a direct working link, a plain file with
no special marking at all, and a chained link correctly resolved past
its intermediate hop to the same real file as the direct link.

### Connection

Every case this lesson set out to distinguish — plain file, folder,
working symlink, chained symlink, broken symlink — is now visibly
different in the output.

---

## Closing

### Connect the Pieces

Trace `link_chain` through the whole function: `os.path.islink()`
caught it as a symlink, not a folder or file, before anything else
could misclassify it. `os.readlink()` showed its immediate, one-hop
target: `"link_to_real"` — itself another symlink, not the real file.
`os.path.exists()` followed however many hops were necessary and
confirmed something real sits at the end — `True`. `os.path.realpath()`
did that same following-through-every-hop work, but returned the actual
final destination instead of just a yes/no — landing on the same
`real_file.txt` that `link_to_real` (one hop closer) also resolves to,
proving both paths genuinely lead to the identical file.

### What Breaks Without This

Go back to a Lesson-2-style check — `os.path.isfile()` alone, with no
awareness of symlinks or their broken/working distinction at all:

```python
for entry in os.listdir("."):
    if os.path.isfile(entry):
        with open(entry) as f:
            print(entry, len(f.read()), "bytes")
```

Real output, run against the same folder used throughout this lesson:

```
link_to_real 13 bytes
real_file.txt 13 bytes
link_chain 13 bytes
```

No crash — and that's exactly the problem, the same shape of failure
Lesson 2 and Lesson 4 both already showed: `broken_link` is completely,
silently absent from this output. `os.path.isfile()` on a broken
symlink returns `False` — not because it isn't a symlink, but because
following it leads nowhere — so this version can't tell the difference
between "this folder has no broken links" and "this folder has a broken
link I never noticed." A real backup tool, deployment script, or file
scanner built this way would silently skip broken links forever,
never surfacing the problem to anyone.

### Exercises

1. Create a symlink pointing to a folder (not a file) and confirm
   `explore()` correctly reports it as a symlink rather than recursing
   into it as if it were an ordinary folder.
2. Create a genuine symlink loop (`ln -s . self_loop` inside a test
   folder) and add loop protection to `explore()` using
   `os.path.realpath()` and a `set` of already-seen real paths — confirm
   it no longer crashes the way Lesson 7's unprotected recursion did.
3. Modify `explore()` to *only* print broken links, suppressing
   everything else — a genuinely useful "find every broken symlink in
   this folder" tool in its own right.

### Definition of Done

- [ ] `symlink_explorer.py` runs and correctly distinguishes plain
      files, folders, working symlinks, and broken symlinks on a real
      folder you built yourself
- [ ] You can explain, without looking back, the difference between
      what `readlink()` returns and what `realpath()` returns
- [ ] You ran the "what breaks" experiment and saw a broken symlink
      silently vanish from a naive `isfile()`-only listing
- [ ] Commit:

```
git add symlink_explorer.py
git commit -m "Add a symlink explorer: prove a symlink is a path pointing at another path, not a copy, and that 'points to something' and 'that something exists' are separate, checkable facts"
```
