# Lesson 6: The Shell Remembers, and So Do You
### (Command History & `.bashrc` / `$PROFILE`)

**What you will build.** A small Python tool that reads your shell's
real command history file and reports your most-used commands, ranked
by frequency. Along the way, you'll see two things directly: that shell
history is just a plain text file — no different from any file you've
read in earlier lessons — and the real, load-bearing difference between
*running* a script and *sourcing* one, which is exactly what `.bashrc`
relies on to make your shell setup "stick."

**What you need to know first.** From Lesson 3 (bash vs. PowerShell):
the shebang line, running a script with `chmod +x`. From Lessons 2, 4,
and 5: `open()`, reading files, dictionaries. New in this lesson, bash
side: the distinction between running and sourcing a script, and why
aliases and `.bashrc` depend on it. New in this lesson, Python side:
`dict.items()`, `lambda`, and `sorted()` with a `key` function.

**An honesty note.** This container runs each command through a
non-interactive shell, not a normal interactive terminal session — so
some of what you'd see typing directly at a real prompt (like the
`history` command, or aliases working without extra setup) needed a bit
of coaxing to demonstrate honestly here. I've flagged each spot where
that matters. Everything shown was still actually run — nothing here is
simulated or predicted, unlike Lesson 3's PowerShell half.

No pipeline diagram — not part of an established multi-stage pipeline.

---

# Part A — Bash: History and Startup Files

## Concept Unit: `.bash_history` Is Just a File

### The Problem

Every command you type at a real bash prompt gets remembered — you can
press the up arrow and get it back, even in a new terminal window days
later. Where does that memory actually live?

### Introduce the Concept in Isolation

```bash
echo "ls -la" >> ~/.bash_history
echo "cd /tmp" >> ~/.bash_history
echo "python3 script.py" >> ~/.bash_history
cat ~/.bash_history
```

Run it:

```
ls -la
cd /tmp
python3 script.py
```

This proves `~/.bash_history` is a completely ordinary text file — one
line per remembered command — that you can append to, read, or edit
with the exact same tools you'd use on any other file. Bash's "memory"
isn't a hidden internal structure; it's this file, written to as you
type, and read back when a new interactive shell starts. This throwaway
example is discarded — the real project below builds a richer, more
realistic history file to analyze.

### Discard the Throwaway Example

Discarded.

### CS Lens

This is the same "everything is a file" idea from Lesson 4's
`/proc` — extended to *shell state*, not just kernel/process state.
Also recognized in: `.bash_history` itself being just one example of a
whole family (`.python_history`, `.mysql_history`, `.zsh_history` —
every REPL-like tool tends to keep one, the same way, for the same
reason).

### SE Lens

Keeping history as a plain, appendable text file — instead of, say, a
database — makes it trivially easy to back up, `grep` through, sync
across machines, or (as this lesson does) analyze with an ordinary
script. The cost: nothing stops two shell sessions writing to it at the
same time from interleaving oddly, and a single corrupted or truncated
line (shown later this lesson) can break a naive reader — a real,
simple-format tradeoff, not a hidden one.

### Connection

We know where history physically lives. The next unit is the mechanism
that makes `.bashrc` — which often *configures* history settings —
actually take effect.

---

## Concept Unit: Running vs. Sourcing a Script

### The Problem

`.bashrc` sets environment variables, defines aliases, and configures
things like history size — and somehow, once your shell starts, all of
that is just *available*, as if it had been typed directly at your
prompt. But Lesson 1 already established that a launched process can't
reach back and modify its parent's state. Something has to be different
about how `.bashrc` runs, or none of this would work at all.

### Introduce the Concept in Isolation

```bash
cat > set_var.sh << 'INNER'
#!/bin/bash
export FOO="set by script"
INNER
chmod +x set_var.sh

echo "--- running as a subprocess ---"
./set_var.sh
echo "FOO after running: '$FOO'"

echo "--- sourcing instead ---"
source set_var.sh
echo "FOO after sourcing: '$FOO'"
```

Run it:

```
--- running as a subprocess ---
FOO after running: ''
--- sourcing instead ---
FOO after sourcing: 'set by script'
```

This proves the exact distinction the whole rest of this lesson rests
on: `./set_var.sh` launches a **new, separate process** — exactly the
parent/child relationship from Lesson 1's CS lens — so anything it
`export`s dies with that process the instant it exits; `$FOO` in your
actual shell never changes. `source set_var.sh` (or the shorter `.
set_var.sh`) does something completely different: it runs the script's
commands *inside your current shell*, no new process at all — so
`export FOO=...` really does set `$FOO` in the shell you're sitting in.
This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### CS Lens

This is the difference between **process isolation** and **shared
execution context** — running spins up a fresh process with its own
memory and environment (the normal case, and usually what you want);
sourcing deliberately skips that isolation, executing commands as if
you'd typed them yourself. Also recognized in: Python's `exec()`
running code in the current namespace versus `subprocess.run()`
spawning a separate process (the same fork in the road, in a different
language), virtual environment activation scripts (`source venv/bin/
activate` — sourced on purpose, for exactly this reason, so the
`PATH` change survives in your actual shell).

### SE Lens

Bash could have made *all* scripts affect the calling shell by default
— it deliberately doesn't, because process isolation is almost always
the safer default: a script that unexpectedly changed your shell's
variables, current directory, or exit behavior out from under you would
be a constant source of surprising bugs. Sourcing exists as an explicit,
opt-in exception, specifically for the narrow case — like `.bashrc` —
where "modify my actual shell" is the whole point.

### Connection

We now know *why* `.bashrc` can configure your live shell at all. The
next unit is `.bashrc` itself — the file, sourced automatically, and
what depends on that.

---

## Concept Unit: `.bashrc` and Why Aliases Need It

### The Problem

`.bashrc` is a real file, already sitting in your home directory — but
having a file isn't the same as it doing anything. We need to see it
actually get sourced, and see something genuinely fail without that
sourcing having happened.

### Introduce the Concept in Isolation

```bash
alias ll='ls -la'
ll /home/claude/lesson3
```

Run it (in a non-interactive script, exactly as written):

```
bash: line 2: ll: command not found
```

That's a real failure, not a typo in this lesson — `alias`, by design,
is disabled outside interactive shells unless explicitly turned on
first:

```bash
shopt -s expand_aliases
alias ll='ls -la'
ll /home/claude/lesson3
```

Run it:

```
total 36
drwxr-xr-x 3 root root 4096 Jul 19 17:02 .
drwxr-xr-x 8 root root 4096 Jul 20 00:37 ..
```

This proves aliases are, on purpose, an interactive-shell-only feature —
which is exactly why they live in `.bashrc` (sourced only for
interactive shells) rather than a file sourced for every kind of shell
invocation. A real `.bashrc`, viewed directly on this machine, confirms
the pattern in practice:

```
HISTSIZE=1000
HISTFILESIZE=2000
...
alias ls='ls --color=auto'
alias ll='ls -alF'
alias la='ls -A'
```

Real lines from this container's actual `/root/.bashrc` — `HISTSIZE`
and `HISTFILESIZE` (how many commands to remember, in memory and on
disk) sit right next to the same `ll` alias just demonstrated, both
taking effect only because `.bashrc` gets sourced automatically the
moment an interactive bash shell starts. This throwaway example is
discarded — no changes to the project files result from it.

### Discard the Throwaway Example

Discarded.

### CS Lens

Not a new hard concept beyond sourcing itself, already covered this
lesson — skipped per the Stopping Rule; this unit's value was seeing a
real, live consequence of that concept, not a new idea.

### SE Lens

Bash actually maintains *several* different startup files
(`.bashrc`, `.bash_profile`, `.profile`, among others), sourced in
different situations (interactive vs. login vs. non-interactive) — a
real source of confusion this lesson deliberately doesn't fully unpack,
since the one distinction that matters for everything above (sourced
vs. run) is the load-bearing piece; the rest is real detail worth a
dedicated reference when you need it, not a concept to memorize now.
PowerShell's equivalent is a single file, `$PROFILE` — genuinely
simpler in this one specific respect, even though it's more complex in
others (multiple possible profile scopes: current user/host, all
users/hosts).

### Connection

The bash half is done — history is a file, `.bashrc` works because it's
sourced, and aliases prove that sourcing genuinely happened. The rest of
this lesson builds a real tool against real history data.

---

# Part B — Analyzing Real History Data (Python)

## Concept Unit: `dict.items()`

### The Problem

We want to count how often each command appears in a history file. To
report the results afterward, we'll need to walk through every
command/count pair we've collected — not just look one up by name, the
way `os.environ.get()` did in Lesson 2.

### Introduce the Concept in Isolation

```python
d = {"a": 1, "b": 2}
for key, value in d.items():
    print(key, value)
```

Run it:

```
a 1
b 2
```

This proves `.items()` gives you both the key and the value together,
as a pair, for every entry in a dictionary — combined here with tuple
unpacking (Lesson 1, reminder) to split each pair into two names in one
line. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `history_stats.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** a real `~/.bash_history` file with content (built
  during this lesson's Part A)

### The New Code

```python
def command_counts(path):
    counts = {}
    with open(path) as f:
        for line in f:
            command = line.split()[0]
            counts[command] = counts.get(command, 0) + 1
    return counts
```

### The Updated Project

This is the entire file so far — nothing to elide:

```python
def command_counts(path):
    counts = {}
    with open(path) as f:
        for line in f:
            command = line.split()[0]
            counts[command] = counts.get(command, 0) + 1
    return counts
```

`command_counts()` now reads a history file and returns a dictionary
mapping each distinct command name (`ls`, `cd`, `git`, ...) to how many
times it appeared — no `.items()` yet visible in this function, but this
is the data that unit's concept will walk through next.

### Mechanical Walkthrough
- `def command_counts(path):` — basic.
- `counts = {}` — assuming empty-dict creation as basic.
- `with open(path) as f: for line in f:` — reminders from Lessons 1 and 5.
- `command = line.split()[0]` — `.split()` with no

arguments (Lesson 5, reminder) taking just the first word — the command
- name — discarding its arguments; `[0]` indexing, already basic.
- `counts[command] = counts.get(command, 0) + 1` — `.get(key, default)`

(Lesson 2, reminder), reused here for a genuinely different purpose than
before: not just "read safely," but the actual **counting pattern** —
"give me the current count, or `0` if this is the first time we've seen
it, then add one" — worth naming as its own small idiom, since it
recurs constantly.

### CS Lens

Not new beyond dictionary usage already established — skipped per the
Stopping Rule.

### SE Lens

`counts.get(command, 0) + 1` versus an `if command in counts: ... else:
...` block that does the same thing more verbosely — both work; `.get()`
with a default collapses the "have I seen this before" check and the
"set it up if not" step into one line, at some cost to a first-time
reader's clarity if they don't already recognize the idiom (which is
exactly why it's called out explicitly here, and not left as an
unremarked "obviously basic" dict operation).

### Commands Needed

None yet.

### Run It

Not runnable for output yet — `command_counts()` exists but is never
called.

### Connection

We can now count commands. The next unit ranks them.

---

## Concept Unit: `lambda`

### The Problem

To find the *most-used* commands, we'll need to sort our counted data —
but by the count, not by the command name (which is what sorting a
dictionary's items would do by default). We need a way to tell Python
exactly what to sort *by*, as a small piece of custom logic passed in
rather than a fixed rule.

### Introduce the Concept in Isolation

```python
square = lambda x: x * x
print(square(5))
print((lambda x: x * x)(6))
```

Run it:

```
25
36
```

This proves `lambda` creates a genuine function — callable, taking
arguments, returning a value — written as a single expression with no
`def` and no name required. `square = lambda x: x * x` names one for
convenience here; the second line proves the name isn't required at
all — the whole `lambda x: x * x` expression can be built and called in
the same line. This throwaway example is discarded; the real project
never assigns a lambda to a name — it passes one directly as an
argument, shown next.

### Discard the Throwaway Example

Discarded.

### CS Lens

This is an **anonymous function** — a function value that exists only
where it's needed, without cluttering the surrounding code with a name
it'll never be called by elsewhere. Also recognized in: JavaScript's
arrow functions (`() => {}`, the exact concept Lesson 1's worked example
in the schema itself referenced), callback arguments in countless APIs,
`Where-Object { $_.Length -gt 1024 }` from Lesson 3's PowerShell half —
that script block *is* PowerShell's version of the same idea, worth
connecting back to now that you have a name for it.

### SE Lens

`lambda` bodies are restricted to a single expression — no statements,
no multiple lines, no `if`/`for` blocks inside them. That's a real,
deliberate limitation: anything more complex is expected to be a proper
`def`ed function instead, specifically so a reader skimming code never
has to mentally parse a sprawling multi-line lambda buried inline —
short and disposable is the whole design intent, not an accident of
syntax.

### Connection

We can now write small, throwaway sorting logic. The next unit is
handing it to `sorted()`.

---

## Concept Unit: `sorted()` With a `key`

### The Problem

We have counted commands and a way to write small custom logic. Now we
need to actually sort a list of (command, count) pairs by count,
highest first.

### Introduce the Concept in Isolation

```python
pairs = [("ls", 3), ("cd", 2), ("python3", 1)]
print(sorted(pairs))
print(sorted(pairs, key=lambda pair: pair[1]))
print(sorted(pairs, key=lambda pair: pair[1], reverse=True))
```

Run it:

```
[('cd', 2), ('ls', 3), ('python3', 1)]
[('python3', 1), ('cd', 2), ('ls', 3)]
[('ls', 3), ('cd', 2), ('python3', 1)]
```

This proves three things in sequence: `sorted()` with no extra
arguments sorts tuples by their *first* element by default (alphabetical
by command name here — not what we want); `key=lambda pair: pair[1]`
tells it to sort by each pair's *second* element (the count) instead —
now ascending, smallest count first; `reverse=True` flips that to
largest first, which is the actual ranking we want. This throwaway
example is discarded; the real project sorts real counted data, not a
hand-built list.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `history_stats.py`
- **Change type:** add — a new function
- **Location:** after `command_counts()`
- **Dependencies:** `command_counts`'s return value

### The New Code

```python
def top_commands(counts, n=5):
    ranked = sorted(counts.items(), key=lambda pair: pair[1], reverse=True)
    return ranked[:n]
```

### The Updated Project

```python
def command_counts(path):
    counts = {}
    with open(path) as f:
        for line in f:
            command = line.split()[0]
            counts[command] = counts.get(command, 0) + 1
    return counts


def top_commands(counts, n=5):                                          # ← new
    ranked = sorted(counts.items(), key=lambda pair: pair[1], reverse=True)  # ← new
    return ranked[:n]                                                        # ← new
```

`history_stats.py` is now complete: `command_counts()` builds the raw
frequency data; `top_commands()` ranks it, returning just the top `n`
(default 5) as a list of `(command, count)` pairs, highest first.

### Mechanical Walkthrough
- `def top_commands(counts, n=5):` — default argument, already-basic
pattern from Lesson 61's `hexdump(data, width=16)`, a reminder.
- `sorted(counts.items(), key=lambda pair: pair[1], reverse=True)` —
`.items()` from earlier this lesson, `lambda` from this unit's lab, and
`sorted(..., key=..., reverse=...)` all combined for real, exactly as
- proven piece by piece above.
- `ranked[:n]` — slicing (Lesson 61,
reminder), taking just the first `n` results.

### CS Lens

This is a **key function** — telling a general-purpose algorithm
(`sorted`, here) how to compare complex items without the algorithm
itself needing to know anything about what a "command count pair" is.
Also recognized in: JavaScript's `Array.sort(compareFn)`, SQL's `ORDER
BY` with a computed expression, `max()`/`min()` in Python also accepting
a `key=` argument for the identical reason.

### SE Lens

Writing this comparison as a `lambda` inline, rather than a separate
named `def get_count(pair): return pair[1]` function defined elsewhere,
keeps the sorting logic visible at its point of use — you don't have to
jump elsewhere in the file to understand what `top_commands` sorts by.
The tradeoff, per the previous unit's SE lens, is real: if this
comparison ever needed to grow more complex than one expression, it
would need to become a proper named function instead.

### Commands Needed

None new.

### Run It — Real Output

Against a real history file with 14 realistic commands, several
repeated:

```python
import os

history_path = os.path.expanduser("~/.bash_history")
counts = command_counts(history_path)
for command, count in top_commands(counts):
    print(f"{count:>3}  {command}")
```

```
  5  ls
  4  git
  2  cd
  2  python3
  1  vim
```

Real output — `os.path.expanduser("~")` (a small, self-explanatory
`os.path` function, same family as Lesson 2's `os.path.join`) resolved
to the real home directory; `ls` topped the list because both bare `ls`
and `ls -la` count as the same command (`line.split()[0]` keeps only the
first word), which is a real, deliberate simplification worth noticing.

### Connection

`history_stats.py` now genuinely ranks real command usage from a real
history file.

---

## Closing

### Connect the Pieces

Trace one full run: bash, over time, appended each typed command as its
own line to `~/.bash_history` — a plain file, per Part A's first unit.
`command_counts()` opened that file and walked it line by line,
`.split()[0]` pulling just the command name from each, `.get(cmd, 0) +
1` tallying repeats into a dictionary. `top_commands()` took that
dictionary's `.items()`, sorted them by count using a `lambda` as the
comparison key, reversed for highest-first, and sliced off just the top
5. None of this touched `.bashrc` or sourcing directly — but the reason
your *real* `.bash_history` accumulates real, meaningful data at all
depends on the exact mechanism Part A demonstrated: an interactive shell
sources its startup files and keeps writing to history as you actually
work in it, not as a disposable subprocess that vanishes after one
command.

### What Breaks Without This

A single blank line in a real history file — not contrived, this
happens in practice from a stray Enter keypress or interrupted write:

```
ls -la

cd /tmp
```

Running `command_counts()` against it:

```
IndexError: list index out of range
```

Real error, on a real blank line. `"".split()` returns an empty list —
no first word to grab, because there was no word at all — and `[0]` on
an empty list has nothing to index. Nothing in Part A "broke" to cause
this; blank lines in `.bash_history` are a normal, expected occurrence.
Handling it (with a simple `if not line.strip(): continue` skip, or the
`try`/`except` pattern from Lesson 4) is a natural next exercise, left
for you rather than fixed here.

### Exercises

1. Fix the blank-line crash yourself, using either an early
   `if`-`continue` skip or a `try`/`except` — both are legitimate;
   pick one and justify the choice in a comment.
2. Modify `command_counts()` to count the *full* command (`"ls -la"` and
   `"ls"` as different entries) instead of just the first word, and
   compare the resulting top 5 to this lesson's version.
3. In a real terminal (not this sandbox), run `history | head -20`
   directly, then open your real `~/.bash_history` in a text editor —
   confirm for yourself that what `history` shows and what the file
   contains genuinely match.

### Definition of Done

- [ ] `history_stats.py` runs and ranks commands from a real history
      file you built or already had
- [ ] You triggered the real "alias without `expand_aliases`" failure
      and understood why it's not a bug, but a deliberate
      interactive-only restriction
- [ ] You ran the running-vs-sourcing experiment and can explain, in
      your own words, why only one of the two actually changed `$FOO`
- [ ] You hit the real blank-line `IndexError` and fixed it yourself
- [ ] Commit:

```
git add history_stats.py
git commit -m "Add a command-history frequency ranker: prove shell history is just a file, and .bashrc works because sourcing shares the current shell instead of spawning an isolated one"
```
