# Lesson 2: How the OS Finds a Program At All
### (Environment Variables & PATH)

**What you will build.** A `which()` function — a small version of the
real `which` (Unix) / `where` (Windows) command — that takes a program
name like `"python3"` and finds the exact file the OS would run if you
typed that name at a prompt. The working feature is small. The
transferable problem underneath: **typing a bare command name like
`python3` or `git` is not magic** — something has to search a specific,
ordered list of folders, checking each one, until it finds a file with
that name that's actually executable. Every shell, every IDE "run"
button, and every script that shells out to another program relies on
this exact mechanism. Once you've built it yourself, "command not
found" stops being mysterious.

**What you need to know first.** From Lesson 1 (sockets): `import`, the
`with` statement (not reused directly here, but the general shape of
"open a resource" carries over conceptually). From Lesson 61 (hex dump):
nothing directly reused, but the same "raw bytes on disk aren't magic"
attitude applies here to "environment variables aren't magic" — both
lessons are about the OS exposing something plain once you look at it
directly. New in this lesson: the `os` module, dictionaries as a concept
if you haven't used them before, `os.environ`, string `.split()`, and
`os.path` functions for checking files. I'm assuming your stated Python
basics include dictionaries (`{}`, key lookup) — if that turns out
shaky, say so and I'll insert a dedicated dict lab before continuing.

No pipeline diagram — not part of an established multi-stage pipeline.

---

## Concept Unit: `os.environ`

### The Problem

When you type `python3` at a terminal, or a script calls another
program by name, *something* has a list of folders to search — but
where does that list come from, and how does Python (or any program) get
access to it? The answer is the **environment**: a set of key/value
settings the OS hands to every process when it starts, inherited from
whatever launched it (your shell, in most cases). We need a way to read
that environment from inside a running Python program.

### Introduce the Concept in Isolation

```python
import os
print(type(os.environ))
print(os.environ["HOME"])
```

Run it:

```
<class 'os._Environ'>
/root
```

This proves `os.environ` is a real object you can look values up in by
name, the same way you'd look a value up in a dictionary (`os.environ`
behaves like a `dict` even though its exact type has its own name) —
and that it already contains real values the OS set before your program
even started (`HOME`, here, without you setting it). This throwaway
example is discarded; the real code below reads `PATH`, not `HOME`.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `which.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** none beyond the standard library

### The New Code

```python
import os
```

### The Updated Project

```python
import os
```

Just the import — nothing surrounding it yet, per the schema's carve-out
for a brand-new file.

### Mechanical Walkthrough

`import os` — the `import` concept from Lesson 1, reapplied to a
different module — a reminder, not a re-explanation. `os` — first
appearance of this specific module: Python's interface to
operating-system-level functionality (environment variables, file paths,
process info — we'll use several corners of it this lesson).

### CS Lens

Environment variables are **inherited process state** — when your shell
starts Python, it doesn't hand Python a blank slate; it copies its own
environment into the new process, which can read it (and set its own,
inherited by anything *it* launches). Also recognized in: Docker
containers inheriting/overriding env vars from their host, CI/CD
pipelines injecting secrets as environment variables, `.env` files in
web frameworks — this exact mechanism, over and over.

### SE Lens

The alternative to environment variables would be every program reading
its configuration from a file it has to know the location of in advance.
Environment variables solve a specific problem that approach doesn't:
passing configuration *down* through a chain of programs that launch each
other, without each one needing to know or agree on a file format or
path. The cost: environment variables are invisible unless you know to
look — a whole class of "works on my machine" bugs comes from one
environment having a variable set that another doesn't.

### Commands Needed

None yet.

### Run It

Not runnable for meaningful output — a single `import` line produces
nothing visible.

### Connection

We can now reach the environment at all. The next unit is reading a
specific variable safely, without assuming it exists.

---

## Concept Unit: `.get()` With a Default

### The Problem

`os.environ["PATH"]` works — *if* `PATH` exists. But looking something
up by a bracketed key, the way you saw `os.environ["HOME"]` above, raises
an error if the key is missing. For a tool that's about to search `PATH`,
crashing outright if `PATH` happens to be unset (rare, but possible) is
worse than just treating it as empty and reporting "not found" normally.

### Introduce the Concept in Isolation

```python
import os
value = os.environ.get("HOME", "not set")
print(value)
value = os.environ.get("THIS_DOES_NOT_EXIST", "not set")
print(value)
```

Run it:

```
/root
not set
```

This proves `.get(key, default)` — a method available on `os.environ`
because it behaves like a dictionary — returns the real value when the
key exists, and quietly returns your fallback instead of crashing when
it doesn't. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `which.py`
- **Change type:** add — a new function
- **Location:** after the `import os` line
- **Dependencies:** `os` import

### The New Code

```python
def which(program):
    path_value = os.environ.get("PATH", "")
```

### The Updated Project

```python
import os

def which(program):                              # ← new
    path_value = os.environ.get("PATH", "")        # ← new
```

The function now safely reads `PATH` into `path_value`, falling back to
an empty string if it's somehow unset, instead of the whole program
crashing on that edge case. Nothing is searched yet — `path_value` is
currently just one long string.

### Mechanical Walkthrough

`def which(program):` — assuming function definitions as basic, from
your stated background. `os.environ.get("PATH", "")` — the exact `.get`
concept from this unit's lab, reused for real: `"PATH"` is the specific
variable holding the search list; `""` is the fallback if it's missing.

### CS Lens

Not a hard concept beyond the dict-lookup idea already covered — skipped
per the Stopping Rule.

### SE Lens

Choosing `""` (empty string) as the fallback, rather than, say, `None`,
is deliberate: the very next unit calls `.split()` on `path_value`, and
`"".split(os.pathsep)` produces an empty list — the search loop below
just finds nothing and returns `None`, cleanly, with no special case
needed. `None.split(...)` would crash instead. Picking a fallback that
keeps the *rest* of the code path uniform is a small but real design
choice.

### Commands Needed

None.

### Run It

Not runnable for output — `path_value` is computed but unused so far.

### Connection

We now safely hold the raw `PATH` string. The next unit turns it from
one long string into the actual list of folders it represents.

---

## Concept Unit: Splitting a String, and `os.pathsep`

### The Problem

`PATH` isn't one folder — it's many, joined into a single string with a
separator character between them. We need to turn that one string back
into a list of individual folder paths we can check one at a time. And
that separator character isn't the same on every OS.

### Introduce the Concept in Isolation

```python
import os
text = "a:b:c"
print(text.split(":"))
print(os.pathsep)
print(os.environ["PATH"].split(os.pathsep))
```

Run it:

```
['a', 'b', 'c']
:
['/home/claude/.npm-global/bin', '/home/claude/.local/bin', '/root/.local/bin', '/usr/local/sbin', '/usr/local/bin', '/usr/sbin', '/usr/bin', '/sbin', '/bin']
```

This proves two things at once: `.split(separator)` turns a string into
a list of pieces wherever that separator occurs, and `os.pathsep` is a
constant that already holds the *correct* separator for whatever OS
you're running on (`:` here, on Linux/macOS — it's `;` on Windows) — so
this code works on either without you writing an `if` for it. This
throwaway example is discarded; the real `text` in the project comes
from `os.environ`, not a literal.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `which.py`
- **Change type:** add
- **Location:** inside `which`, after `path_value = ...`
- **Dependencies:** `path_value`

### The New Code

```python
directories = path_value.split(os.pathsep)
```

### The Updated Project

```python
import os

def which(program):
    path_value = os.environ.get("PATH", "")
    directories = path_value.split(os.pathsep)  # ← new
```

`directories` now holds a real Python list — one string per folder on
`PATH` — ready to loop over, instead of one unbroken string.

### Mechanical Walkthrough

`path_value.split(os.pathsep)` — `.split()` and `os.pathsep`, both from
this unit's lab, reused directly: `path_value` (the whole `PATH` string)
split wherever `os.pathsep` (the OS-correct separator) occurs.

### CS Lens

This is **serialization/deserialization** in miniature — many values
packed into one string using an agreed-upon delimiter, and unpacked back
into a list on the other end by any program that knows the convention.
Also recognized in: CSV files (comma as delimiter), HTTP cookie headers
(`;`-separated key/value pairs), your shell's own `$PATH` handling
internally.

### SE Lens

`os.pathsep` instead of a hardcoded `":"` is the actual point of this
unit: hardcoding `":"` would make this function silently wrong on
Windows, without any error — it would just never find anything, because
Windows `PATH` uses `;`. Using the constant instead of the literal
character is what makes one function correct on every OS Python
supports, at zero extra runtime cost.

### Commands Needed

None.

### Run It

Not runnable for output — `directories` exists but isn't used yet.

### Connection

We now have the real list of folders to search. The next unit checks
each one for the program we're looking for.

---

## Concept Unit: Checking a File's Existence and Permissions

### The Problem

For each folder on `PATH`, we need to answer: "does a file named
`program` exist directly inside this folder, and — critically — is it
actually *executable*, not just present?" A file can exist without being
runnable (permissions matter on Unix-like systems); we need both checks,
not just one.

### Introduce the Concept in Isolation

```python
import os
p = os.path.join("/usr/bin", "python3")
print(p)
print(os.path.isfile(p))
print(os.access(p, os.X_OK))

p2 = os.path.join("/usr/bin", "not_a_real_program")
print(os.path.isfile(p2))
```

Run it:

```
/usr/bin/python3
True
True
False
```

This proves three things: `os.path.join` builds a full path from a
folder and a filename correctly (handling the slash between them for
you), `os.path.isfile` tells you whether something exists there and is a
regular file, and `os.access(path, os.X_OK)` tells you whether the
*current user* is allowed to execute it — a real, existing file
(`python3`) passes both checks; a made-up name fails the first one. This
throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `which.py`
- **Change type:** add — the search loop and its `return` statements
- **Location:** inside `which`, after `directories = ...`
- **Dependencies:** `directories`, `program` parameter

### The New Code

```python
for directory in directories:
    candidate = os.path.join(directory, program)
    if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
        return candidate

return None
```

### The Updated Project

```python
import os

def which(program):
    path_value = os.environ.get("PATH", "")
    directories = path_value.split(os.pathsep)

    for directory in directories:                                    # ← new
        candidate = os.path.join(directory, program)                   # ← new
        if os.path.isfile(candidate) and os.access(candidate, os.X_OK):  # ← new
            return candidate                                             # ← new

    return None                                                        # ← new
```

`which()` is now complete: it walks every folder on `PATH`, in order,
building the full candidate path in each one, and returns the first
match that both exists and is executable — or `None` if it checks every
folder and finds nothing.

### Mechanical Walkthrough

`for directory in directories:` — basic `for` loop, already established.
`os.path.join(directory, program)` — the `os.path.join` concept from
this unit's lab, reused for real. `if os.path.isfile(candidate) and
os.access(candidate, os.X_OK):` — both checks from the lab, combined
with `and` (assuming boolean `and` as basic); both must be true for the
`if` to pass. `return candidate` — assuming `return` inside a function as
basic, but worth naming explicitly: returning *inside* a loop exits the
function immediately, stopping the search at the *first* match, which
mirrors exactly how a real shell searches `PATH` — first match wins, not
best match. `return None` — sits outside the loop, only reached if the
loop finishes without ever hitting the `return` above it.

### CS Lens

This is a **linear search with early exit** — checking candidates one at
a time, in a fixed priority order, stopping the instant you find an
acceptable answer instead of checking everything and picking the best
one afterward. Also recognized in: DNS resolution order, CSS rule
cascading (later, more specific rules override earlier ones — a
different order-matters idea, but the same "position determines
outcome" theme), your shell's actual `PATH` search, load-balancer
failover ("try server 1, then server 2, ...").

### SE Lens

Returning `None` for "not found," instead of raising an exception, is a
deliberate choice about what "not found" *means* here: it's an expected,
routine outcome (you'll often check for a program that isn't installed),
not an exceptional one — the caller is expected to check the result
(`if result:`), not wrap the call in `try`/`except`. The real `which`
command makes the same choice at the process level: it exits with a
non-zero status instead of crashing. The tradeoff: a caller who forgets
to check for `None` and immediately uses the result as if it were always
a valid path will get a confusing error somewhere *else* in their code,
further from the actual cause.

### Commands Needed

`python3 which.py` — runs the script.

### Run It — Real Output

```python
result = which("python3")
print(result)

result = which("definitely_not_a_real_program")
print(result)
```

```
$ python3 which.py
/usr/bin/python3
None
```

Both real runs: `python3` was found on the third folder actually checked
(`/usr/bin`, per this machine's real `PATH`); the made-up name correctly
produced `None` after checking every folder.

### Connection

The full search — safely reading `PATH`, splitting it, checking each
folder — is now one working function.

---

## Closing

### Connect the Pieces

Trace `which("python3")` end to end: `os.environ.get("PATH", "")` pulled
the real `PATH` string set by whatever launched this Python process.
`.split(os.pathsep)` turned it into 9 real folder paths on this machine.
The loop checked each in order — `/home/claude/.npm-global/bin` first,
no match, then `/home/claude/.local/bin`, no match, then
`/root/.local/bin`, no match, then `/usr/local/sbin`, no match, then
`/usr/local/bin`, no match, then `/usr/sbin`, no match, then `/usr/bin` —
`os.path.join` built `/usr/bin/python3`, `os.path.isfile` and
`os.access` both passed, and `return candidate` stopped the search
immediately, without ever checking `/sbin` or `/bin`.

### What Breaks Without This

Skip the `.split()` step — treat the whole `PATH` string as if it were
one folder:

```python
def which_broken(program):
    path_value = os.environ.get("PATH", "")
    directory = path_value  # forgot to split
    candidate = os.path.join(directory, program)
    if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
        return candidate
    return None
```

Running `which_broken("python3")`:

```
None
```

No crash — worse, in a way: `os.path.join` happily treats the entire
colon-joined `PATH` string as one (nonexistent) folder name, so
`os.path.isfile` correctly says "no," and the function silently returns
`None` even though `python3` genuinely exists on this machine. This is
why testing with a program you *know* exists matters — a bug here
doesn't crash, it just quietly lies. Restore `.split(os.pathsep)` and it
works again.

### Exercises

1. Run `which("git")` and `which("bash")` — predict which folder each
   will be found in before you run it, based on what you saw `PATH`
   contain in this lesson.
2. Print `directories` (the full list) before the loop runs, and count
   how many folders get checked before a match is found for a program
   near the *end* of `PATH` versus one near the start — this is the real
   cost of `PATH` order.
3. Add a check: if the exact same program name exists in *two* different
   folders on `PATH`, which one does your `which()` return? Confirm it
   matches what typing that command in your actual terminal runs (hint:
   `type -a programname` on bash, or `Get-Command -All programname` on
   PowerShell, shows you every match your real shell can see).

### Definition of Done

- [ ] `which.py` runs and correctly finds a program you know is
      installed
- [ ] You can explain why `os.pathsep` matters instead of hardcoding `:`
- [ ] You can explain why the function returns `None` instead of raising
      an error for "not found"
- [ ] You ran the "what breaks" experiment and saw it fail silently, not
      loudly — and understand why that's worse
- [ ] Commit:

```
git add which.py
git commit -m "Add a mini which(): prove that running a bare command name is really an ordered search over PATH, checking each folder for an executable match"
```
