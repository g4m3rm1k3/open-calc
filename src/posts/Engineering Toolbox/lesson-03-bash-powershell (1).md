# Lesson 3: One Task, Two Shells
### (Listing Large Files — Bash vs. PowerShell)

**What you will build.** Two scripts that do the exact same thing —
list every file in a folder over 1KB, printing its name and size — one
written in bash, one in PowerShell. The working feature is small on
purpose. The transferable problem underneath is the actual point of this
lesson: **bash and PowerShell disagree, fundamentally, about what a
command's output *is***. Bash pipes and variables move plain text around
— you get strings, and you parse them yourself. PowerShell pipes move
real objects with real properties — you get a file's actual size as a
number, not text you have to convert. Same task, same result, genuinely
different model underneath. Once that distinction is visible, every
future "why does this bash trick not work in PowerShell" moment has an
actual explanation instead of just being a memorized exception.

**What you need to know first.** Nothing from earlier Python lessons
transfers directly — this is the first non-Python lesson in the
curriculum, and shell scripting is its own thing with its own rules.
I'm assuming your stated command-line comfort is "super basic," so
nothing about either shell is assumed here.

**An upfront honesty note.** This container is Linux-only — I have a
real bash to run code in, but no PowerShell. Everything in the bash half
of this lesson was actually run, with real output pasted in, same as
every previous lesson. The PowerShell half is correct code, but I could
not execute it myself — I've labeled its output as *predicted*, and I'm
asking you to actually run it and tell me what you got, so we can
correct anything that's wrong for your specific PowerShell version.

No pipeline diagram — not part of an established multi-stage pipeline.

---

# Part A — Bash

## Concept Unit: The Shebang Line and Running a Script

### The Problem

A Python file gets run by typing `python3 filename.py` — you tell the
interpreter which file to run. A shell script is usually run
differently: as `./filename.sh`, with no interpreter named on the
command line at all. Something has to tell the OS *which* program should
execute the file's contents.

### Introduce the Concept in Isolation

```bash
#!/bin/bash
name="Ada"
echo "Hello, $name"
```
saved as `demo.sh`, then:
```bash
chmod +x demo.sh
./demo.sh
```

Run it:

```
Hello, Ada
```

This proves the first line, `#!/bin/bash` (the "shebang"), tells the OS
exactly which program should interpret this file — here, `/bin/bash` —
so that running `./demo.sh` directly works without typing `bash` in
front of it. `chmod +x` is what makes the file executable at all; without
it, `./demo.sh` fails with a permissions error even though the shebang
is correct. This throwaway `demo.sh` is discarded now.

### Discard the Throwaway Example

Discarded — the real script below starts fresh.

### Project Change

- **Files affected:** `list_big_files.sh` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** a Unix-like shell (bash) — already present on
  Linux/macOS; Windows users would need WSL or Git Bash for this half

### The New Code

```bash
#!/bin/bash
```

### The Updated Project

```bash
#!/bin/bash
```

Just the shebang — the whole file so far, nothing to elide.

### Mechanical Walkthrough

`#!` — first appearance: not a comment (even though `#` alone *does*
start a comment in bash) — this exact two-character sequence at the very
start of a file is special-cased by the OS as "here's the interpreter."
`/bin/bash` — the path to the specific program that will run this
script's contents.

### CS Lens

This is **interpreter dispatch by convention** — the OS doesn't guess
what kind of file this is from its extension (`.sh` is just a naming
habit, not enforced); it reads the shebang and hands the file to
whatever program that line names. Also recognized in: Python scripts
using `#!/usr/bin/env python3`, Node scripts, any Unix executable text
file — the exact same mechanism, different interpreter named.

### SE Lens

The alternative — always typing `bash script.sh` explicitly — works
fine and sidesteps the shebang entirely. The shebang's value shows up
once a script gets installed somewhere on `PATH` (Lesson 2!) and called
by *other* programs, or by you, as a bare command name — at that point,
nothing is around to remember it's a bash script unless the file itself
says so.

### Commands Needed

`chmod +x list_big_files.sh` — `chmod` (change mode) sets file
permissions; `+x` adds the executable permission for the current user.
Success looks like no output at all — `chmod` is silent on success.

### Run It

Not runnable for meaningful output yet — an empty script with only a
shebang produces nothing.

### Connection

The file can now be run as `./list_big_files.sh` once it has real
content. The next unit gives it something to do.

---

## Concept Unit: Bash Variables

### The Problem

We'll need to hold onto a file's size once we look it up, so we can
compare it to a threshold. Bash needs its own way to store and reuse a
value — and it looks nothing like Python's `x = 5`.

### Introduce the Concept in Isolation

Already shown above (`name="Ada"` / `echo "Hello, $name"`) — reusing
that exact example rather than manufacturing a new one, since it already
isolated this concept cleanly on its own. Two things it proved: assignment
(`name="Ada"`) allows **no spaces** around the `=` — `name = "Ada"` is a
syntax error in bash, unlike Python — and reading a variable requires a
`$` prefix (`$name`), unlike setting it.

### Project Change

- **Files affected:** `list_big_files.sh`
- **Change type:** add
- **Location:** none yet — this unit is conceptual groundwork; the real
  variable assignment lands two units from now, once there's a real
  value worth storing

### CS Lens

Not a hard concept beyond "named storage," already familiar from Python
— skipped per the Stopping Rule; only the *syntax* differs, already
covered.

### SE Lens

Bash's no-spaces-around-`=` rule looks arbitrary but isn't: `name = "Ada"`
*with* spaces is parsed as "run a command called `name` with arguments
`=` and `"Ada"`" — because in bash, spaces separate command arguments
everywhere, including here. The strict no-space rule for assignment is
what lets the same parser tell "this is a variable assignment" from
"this is a command" without extra syntax.

### Connection

We now know how to name and store a value. The next two units are about
getting values worth storing — first, which files exist at all.

---

## Concept Unit: `for` Loop Over a Glob

### The Problem

We need to visit every item in the current folder, one at a time,
without knowing in advance what's there or how many items there are.

### Introduce the Concept in Isolation

```bash
touch small.txt medium.txt
mkdir -p subdir
for file in *; do
    echo "saw: $file"
done
```

Run it:

```
saw: demo.sh
saw: medium.txt
saw: small.txt
saw: subdir
```

This proves `*` isn't a variable or a special loop syntax — it's a
**glob**, expanded by bash itself, before the loop even runs, into the
literal list of everything in the current folder (files *and*
directories both — note `subdir` is in the list too). `for file in *` is
really "for file in `demo.sh medium.txt small.txt subdir`" — bash
substituted that list in first. This throwaway example is discarded; the
real project builds its own fresh test files.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `list_big_files.sh`
- **Change type:** add
- **Location:** after the shebang line
- **Dependencies:** none

### The New Code

```bash
for file in *; do
    :
done
```
*(`:` is bash's version of `pass` — a no-op placeholder, replaced next
unit.)*

### The Updated Project

```bash
#!/bin/bash

for file in *; do   # ← new
    :                  # ← new, temporary placeholder
done                 # ← new
```

The script now visits every item in whatever folder it's run from, doing
nothing with each one yet.

### Mechanical Walkthrough

`for file in *; do ... done` — the glob-expansion concept from this
unit's lab, reapplied for real. `:` — first appearance: bash's built-in
no-op command, used purely because `do`/`done` requires *something*
inside it, same role `pass` played in Python.

### CS Lens

Glob expansion is **pattern-based enumeration happening before
execution** — the shell resolves `*` into a concrete list in a separate
step *before* the loop logic ever runs, rather than the loop asking the
filesystem "what's next?" on each iteration. Also recognized in: SQL
wildcard matching (`LIKE 'file%'`), `.gitignore` patterns, URL routing
patterns (`/users/*`).

### SE Lens

Bash chose to expand `*` itself, rather than making every individual
command (`ls`, `for`, `rm`, ...) responsible for understanding wildcards
on its own. The tradeoff: it means `*` behaves *identically* everywhere
in bash, but it also means the loop body has no way to distinguish "a
file literally named `*`" (rare, but possible) from "no files matched" —
a real, documented bash gotcha (`nullglob`/`failglob` options exist
specifically to handle it, not covered here).

### Commands Needed

None new.

### Run It

Not runnable for meaningful output yet — `:` does nothing observable.

### Connection

We can now see every item in the folder. The next unit filters out the
ones that aren't actual files (like `subdir`, seen above).

---

## Concept Unit: The `[ -f ]` File Test

### The Problem

The glob loop visits directories too, not just files — `subdir` showed
up in the earlier output. Before checking a size, we need to skip
anything that isn't a regular file.

### Introduce the Concept in Isolation

```bash
for f in *; do
    if [ -f "$f" ]; then
        echo "$f is a regular file"
    else
        echo "$f is NOT a regular file"
    fi
done
```

Run it:

```
demo.sh is a regular file
medium.txt is a regular file
small.txt is a regular file
subdir is NOT a regular file
```

This proves `[ -f "$path" ]` is bash's file-type test — `-f` specifically
means "exists and is a regular file" (as opposed to a directory, a
symlink, etc.) — and that it correctly told `subdir` apart from the
actual files. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `list_big_files.sh`
- **Change type:** replace — the `:` placeholder
- **Location:** inside the `for` loop
- **Dependencies:** `file` loop variable

### The New Code

```bash
if [ -f "$file" ]; then
    :
fi
```

### The Updated Project

```bash
#!/bin/bash

for file in *; do
    if [ -f "$file" ]; then   # ← new
        :                        # ← new, temporary placeholder
    fi                         # ← new
done
```

The script now visits every item, but only enters the `if` body for
actual files, skipping directories entirely.

### Mechanical Walkthrough

`if [ -f "$file" ]; then ... fi` — `if`/`then`/`fi` (bash's block
delimiters, functionally like Python's `if:`/indentation but explicit
keywords instead); `[ ... ]` is itself a command (yes, brackets are a
program name in disguise — `[` is a real executable test utility) whose
`-f` flag is this unit's new concept. `"$file"` — reading the loop
variable, wrapped in quotes; quoting matters here and is worth watching
closely — the closing section of this lesson shows exactly what breaks
without it.

### CS Lens

Not a new hard concept beyond conditional branching, already familiar
from Python — skipped per the Stopping Rule; only the specific test flag
(`-f`) is new API surface.

### SE Lens

Bash's `[ -f ... ]` needing the file's *path as a string argument*,
rather than something more structured, is exactly the "everything is
text" model this whole lesson is building toward contrasting with
PowerShell's approach in Part B — worth remembering this specific moment
once you reach that comparison.

### Commands Needed

None new.

### Run It

Not runnable for meaningful output — placeholder still in place.

### Connection

We can now tell files from directories. The next unit gets each file's
actual size.

---

## Concept Unit: Command Substitution — `$( )`

### The Problem

`stat` is a real command that prints a file's size (among other things)
— but it prints *to the screen*, not into a variable we can compare
against a number. We need a way to capture a command's output and store
it, instead of just watching it scroll by.

### Introduce the Concept in Isolation

```bash
size=$(stat -c%s "medium.txt")
echo "the size is: $size"
echo "its type is just text, held in a variable"
```

Run it:

```
the size is: 2000
its type is just text, held in a variable
```

This proves `$( )` runs whatever command is inside it, captures
everything that command *would have printed*, and substitutes that
captured text right where the `$( )` sits — here, straight into a
variable assignment. `stat -c%s file` prints just the byte size, nothing
else, because of the `-c%s` format flag. This throwaway example is
discarded; the real project uses a fresh `size` variable inside the
loop, not this standalone line.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `list_big_files.sh`
- **Change type:** replace — the second `:` placeholder
- **Location:** inside the `if [ -f "$file" ]` block
- **Dependencies:** `file` loop variable

### The New Code

```bash
size=$(stat -c%s "$file")
```

### The Updated Project

```bash
#!/bin/bash

for file in *; do
    if [ -f "$file" ]; then
        size=$(stat -c%s "$file")   # ← new
    fi
done
```

Each real file's size is now captured into `size` on every loop
iteration — but nothing does anything with that number yet.

### Mechanical Walkthrough

`size=$(stat -c%s "$file")` — the `$( )` concept from this unit's lab,
reused for real, wrapping `stat -c%s "$file"` — `stat` (a real external
program, not a bash built-in) with `-c%s` (a format flag meaning "print
just the size in bytes") applied to `"$file"` (this iteration's file,
quoted).

### CS Lens

This is **capturing a subprocess's output as data**, the shell
equivalent of Lesson 1's socket `recv()` — a separate program ran,
produced output, and that output became a value your own code can use,
rather than just being displayed. Also recognized in: every CI pipeline
step that captures a build tool's version string, backticks in older
shell syntax (`` `stat -c%s file` `` — same idea, older notation),
Python's `subprocess.run(..., capture_output=True)`.

### SE Lens

`stat -c%s` (byte count only) was chosen over plain `stat "$file"`,
which prints many lines of metadata — deliberately asking the command
for exactly the one field needed, rather than capturing everything and
parsing it apart afterward. That's a real, recurring shell-scripting
tradeoff: narrow flags mean less string-parsing later, at the cost of
needing to know the right flag exists in the first place (`-c%s` is
GNU-`stat`-specific; macOS's built-in `stat` uses different flags
entirely — a real portability gap, not covered further here).

### Commands Needed

`stat` — already present on any standard Linux system; no install
needed.

### Run It

Not runnable for meaningful output yet — `size` is computed but unused.

### Connection

We now have each file's real size as data. The last unit compares it
against a threshold and prints a result.

---

## Concept Unit: Numeric Comparison — `-gt`

### The Problem

We have `size` as a number (well — as text that *looks* like a number;
more on that below). We need to decide, per file, whether it clears our
1024-byte threshold, and only print the ones that do.

### Introduce the Concept in Isolation

```bash
size=2000
if [ "$size" -gt 1024 ]; then
    echo "bigger than 1024"
fi
size=10
if [ "$size" -gt 1024 ]; then
    echo "bigger than 1024"
else
    echo "not bigger than 1024"
fi
```

Run it:

```
bigger than 1024
not bigger than 1024
```

This proves `-gt` ("greater than") is bash's *numeric* comparison
operator inside `[ ]` — deliberately not the plain `>` you might expect
from other languages, because inside `[ ]`, `>` is reserved for a
completely different meaning (file-output redirection). This throwaway
example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `list_big_files.sh`
- **Change type:** add
- **Location:** inside the `if [ -f "$file" ]` block, after `size=...`
- **Dependencies:** `size`

### The New Code

```bash
if [ "$size" -gt 1024 ]; then
    echo "$file: $size bytes"
fi
```

### The Updated Project

```bash
#!/bin/bash

for file in *; do
    if [ -f "$file" ]; then
        size=$(stat -c%s "$file")
        if [ "$size" -gt 1024 ]; then   # ← new
            echo "$file: $size bytes"     # ← new
        fi                                # ← new
    fi
done
```

`list_big_files.sh` is now complete: for every real file over 1024
bytes, it prints its name and size.

### Mechanical Walkthrough

`if [ "$size" -gt 1024 ]; then ... fi` — `-gt` from this unit's lab,
reused for real; a second, nested `if` inside the first — already-basic
nesting, no new concept there. `echo "$file: $size bytes"` — `echo`
printing a string with two variables expanded inside it, already-basic
from the very first throwaway lab of this lesson.

### CS Lens

Not new beyond comparison operators already established — skipped per
the Stopping Rule.

### SE Lens

The reason bash needs a *separate* `-gt` instead of overloading `>` the
way most languages do traces back to `[ ]` being a real external command
(mentioned two units ago) that receives its arguments as plain
**strings**, with no built-in sense of "these look like numbers, treat
them numerically." `-gt` is a flag this command interprets as "compare
these two strings as integers" — the comparison logic lives in the
command's own argument parsing, not in the shell's grammar. This is the
first concrete sign of the "everything is text" model Part B will
contrast directly.

### Commands Needed

`./list_big_files.sh` — runs it, per the shebang and executable
permission set earlier.

### Run It — Real Output

Against a real folder containing `demo.sh` (43 bytes), `small.txt` (3
bytes, contents `"hi\n"`), `medium.txt` (2000 random bytes), and
`subdir/` (empty directory):

```
$ ./list_big_files.sh
medium.txt: 2000 bytes
```

Real output — only `medium.txt` cleared the 1024-byte threshold;
`demo.sh` and `small.txt` were both real files but too small, and
`subdir` was correctly skipped by the `-f` test.

### Connection

The bash half is complete and genuinely working. Before moving to
PowerShell, the closing section below shows a real, live bash failure
mode worth seeing on purpose.

---

## Part A Closing — What Breaks Without Quoting

Bash's "everything is text" model has a sharp edge: forgetting to quote
`$file` breaks on filenames containing spaces, because bash splits
unquoted variable expansions on whitespace, the same way it splits
command arguments.

```bash
for file in *; do
    if [ -f $file ]; then      # unquoted — broken
        size=$(stat -c%s $file)
        echo "$file: $size"
    fi
done
```

Run against a folder that now also contains `"big file with spaces.txt"`:

```
demo.sh: 43
list_big_files.sh: 192
medium.txt: 2000
small.txt: 3
/bin/sh: 4: [: big: unexpected operator
```

Real output. `big file with spaces.txt` silently vanished from the
results entirely — worse, `[ -f $file ]` didn't even fail cleanly on it;
bash split it into three separate words (`big`, `file`, `with`, ...) and
handed `[` far more arguments than `-f` expects, producing the cryptic
`unexpected operator` error, on a *different* line than you'd expect, for
a file that was never actually the one causing trouble in an obvious way.
Restoring the quotes (`"$file"`, as in the real script above) fixes it —
quoting keeps the whole filename together as one value, spaces and all.

---

# Part B — PowerShell (Same Task)

**A reminder before this section:** I have not run this code myself —
no PowerShell available in this environment. Please run it and paste
back what you actually get; I'll correct anything below that doesn't
match your real output.

## Concept Unit: `Get-ChildItem` Returns Objects, Not Text

### The Problem

In bash, listing files and getting their sizes took two separate steps
— `for file in *` to enumerate, then a *separate command* (`stat`) to
ask for the size, because `*` only ever gives you filenames as plain
text. PowerShell's equivalent starting point works differently from the
ground up.

### The Real Code (Predicted Output — Please Verify)

```powershell
Get-ChildItem
```

**Predicted output**, run in a folder with the same four items as the
bash example:

```
    Directory: C:\Users\you\lesson3

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         7/19/2026   3:00 PM                subdir
-a----         7/19/2026   3:00 PM             43 demo.sh
-a----         7/19/2026   3:00 PM           2000 medium.txt
-a----         7/19/2026   3:00 PM              3 small.txt
```

That table isn't formatted text `Get-ChildItem` built for display and
handed you as a string — it's PowerShell's default *view* of real
objects, each one already carrying a `Length` (size in bytes, as an
actual number), a `Name`, and dozens of other real properties, whether
the table shows them or not. This is the core difference from bash's `*`:
nothing has been converted to text yet at this point at all.

### CS Lens

This is an **object pipeline** instead of a **text stream** — the
defining architectural difference between PowerShell and every
Unix-style shell (bash included). Also recognized in: any ORM handing
back real model objects instead of raw SQL rows, JSON APIs (structured
data, not delimited text), REST responses vs. old-school CSV exports —
PowerShell brought this "pipe real data structures, not text" idea to
the shell world specifically because .NET already worked that way
underneath it.

### SE Lens

Bash's text-pipe model means every tool has to agree, informally, on
text formats that get parsed back apart downstream (that's exactly what
`stat -c%s` was working around in Part A). PowerShell's object model
means a file's size is *already* a number the moment `Get-ChildItem`
returns it — no separate "ask for just the size" command is needed at
all. The tradeoff: PowerShell objects don't work over things bash text
streams work over trivially — piping `Get-ChildItem` output into a
plain-text tool built for a different ecosystem (like `grep`) requires
first converting objects back to text, an extra step bash never needs
because it started as text.

### Connection

We already have every file's real size — no separate size-lookup step,
unlike bash. The next unit filters by it.

---

## Concept Unit: `Where-Object` and `$_`

### The Problem

We need to keep only files over 1024 bytes, and only files (not
directories) — the same two filters as the bash version, but the *pieces
we're filtering on* are now real properties on real objects, not
strings we test with `-f`.

### The Real Code (Predicted Output — Please Verify)

```powershell
Get-ChildItem -File | Where-Object { $_.Length -gt 1024 }
```

**Predicted output:**

```
    Directory: C:\Users\you\lesson3

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         7/19/2026   3:00 PM           2000 medium.txt
```

### Mechanical Walkthrough

`Get-ChildItem -File` — first appearance of a cmdlet **parameter**:
`-File` tells `Get-ChildItem` to only return files, doing bash's `[ -f
]` job *before* anything even reaches the pipe, not as a separate check
afterward. `|` — the pipe — visually identical to bash's pipe, but
carrying real objects through it, not text, per the previous unit.
`Where-Object { ... }` — first appearance: a cmdlet that keeps only
objects for which the script block (in `{ }`) evaluates true. `$_` —
first appearance: PowerShell's automatic variable meaning "the current
object flowing through the pipeline," conceptually similar to bash's
loop variable `$file`, but supplied automatically rather than named by
you in a `for`. `$_.Length` — property access: reaching into the current
object to read its real `Length` value — the exact number `Get-ChildItem`
already attached, no `stat` equivalent needed. `-gt 1024` — same operator
name as bash's `-gt`, but here comparing a real integer property, not a
text value being interpreted as one.

### CS Lens

`Where-Object` is a **filter** in the classic functional-programming
sense — same idea as Python's `filter()` or a list comprehension's `if`
clause, expressed as a pipeline stage instead. Also recognized in: SQL's
`WHERE` clause (same word, same idea), LINQ in .NET, `Array.filter` in
JavaScript.

### SE Lens

`$_` being implicit, rather than a named loop variable like bash's
`$file`, keeps short pipelines terse — but it means nested
`Where-Object`/`ForEach-Object` blocks can shadow `$_` confusingly if
you're not careful, since every stage's block sees "the current item" by
the same implicit name. Bash's explicit loop variable name never has
that ambiguity, at the cost of needing to declare and quote it yourself
every time.

### Connection

We now have exactly the filtered set of file objects. The last unit
formats them into readable output.

---

## Concept Unit: String Interpolation and `ForEach-Object`

### The Problem

The default table view is fine, but to match bash's plain `"name: size
bytes"` output exactly, we want to build that string ourselves per
file.

### The Real Code (Predicted Output — Please Verify)

```powershell
Get-ChildItem -File | Where-Object { $_.Length -gt 1024 } | ForEach-Object {
    "$($_.Name): $($_.Length) bytes"
}
```

**Predicted output:**

```
medium.txt: 2000 bytes
```

### Mechanical Walkthrough

`ForEach-Object { ... }` — first appearance: runs its script block once
per object arriving from the pipe, same shape as `Where-Object` but for
"do something with each," not "keep or discard." `"$($_.Name): ...
bytes"` — first appearance of PowerShell string interpolation: `$( )`
inside a double-quoted string evaluates the expression inside and
substitutes the result — visually close to bash's `$( )` from Part A,
but there it captured a *command's* output; here it evaluates a plain
*expression* (a property access). Worth noticing that overlap in
notation across two otherwise different shells.

### SE Lens

PowerShell requires the `$( )` wrapper around `$_.Name` specifically
because `$_.Name` inside a plain `"$_.Name"` string would try to access
a property literally called `.Name` on the string `"$_"`, not what you
want — the extra parens disambiguate "evaluate this whole expression"
from "just insert this variable." Bash has no equivalent ambiguity here
since it has no property-access syntax at all.

### Connection

Both scripts now do the identical task. The difference that matters
isn't the output — it's everything happening *before* the final
`echo`/string, which Part A's `stat` call and Part B's `.Length`
property make visible side by side.

---

## Closing

### Connect the Pieces (Both Shells, Side by Side)

For the one file that actually qualifies, `medium.txt` at 2000 bytes:
bash's path was *enumerate as text* (`*`) → *ask a separate program for
the size* (`stat -c%s`) → *compare as a number, using a string-typed
comparison operator* (`-gt` inside `[ ]`) → *build an output string by
hand* (`echo`). PowerShell's path was *enumerate as objects, size
already attached* (`Get-ChildItem -File`) → *filter directly on the real
property* (`Where-Object { $_.Length -gt 1024 }`) → *build an output
string from the object's real properties* (`ForEach-Object`). Same
destination, and notice exactly where the extra step disappeared:
PowerShell never needed anything playing `stat`'s role at all.

### What Breaks Without This

Bash: shown above — unquoted `$file` silently mishandles filenames with
spaces (real, verified output).

PowerShell (**predicted — please verify**): the equivalent
PowerShell mistake is comparing `$_.Length` — already a number — as if
it were text, e.g. `$_.Length -gt "1024"`. This one is far more forgiving
than bash's failure: PowerShell will typically coerce `"1024"` back into
a number automatically for a numeric comparison operator like `-gt`, so
this particular mistake mostly *doesn't* break — which is itself worth
noticing as a direct consequence of the object model: PowerShell knows
`$_.Length`'s real type and adjusts, where bash's `[ ]` never knew `size`
was "supposed to be" a number in the first place.

### Exercises

1. Run the real PowerShell commands above yourself and paste the actual
   output back — I'll flag anything that differs from the prediction and
   we'll figure out why together.
2. In bash, change the threshold to `10240` (10KB) and predict the new
   output before running it.
3. In PowerShell, change `-File` to `-Directory` and predict what
   `$_.Length` will show for a folder (hint: it's meaningfully different
   from a file's size, and worth actually checking).

### Definition of Done

- [ ] `list_big_files.sh` runs and its real output matches what's shown
      above
- [ ] You ran the bash "what breaks" experiment and saw the real
      quoting failure
- [ ] You ran the PowerShell commands yourself and confirmed (or
      corrected) the predicted output
- [ ] You can state, in one sentence, the actual difference between a
      bash pipe and a PowerShell pipe — not just "PowerShell is fancier"
- [ ] Commit:

```
git add list_big_files.sh list_big_files.ps1
git commit -m "Add the same file-size filter in bash and PowerShell: prove the real difference is text streams vs. object pipelines, not just syntax"
```
