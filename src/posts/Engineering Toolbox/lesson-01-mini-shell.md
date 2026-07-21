# Lesson 1: A Shell Is Just a Loop
### (Mini Shell)

**What you will build.** `mini_shell()` — a genuinely working, if
minimal, command-line shell: it prompts for a command, runs it as a
real separate program, waits, and prompts again, until you type `exit`.
The working feature is small and deliberately demystifying — you've
used a real shell your entire time at a computer without ever seeing
what it fundamentally *is*. The transferable problem underneath: a
shell is not a mysterious, privileged piece of the operating system —
it's an ordinary program, running an ordinary loop, that launches other
programs on your behalf. This lesson also directly closes a real gap
flagged back in Lesson 4: `os.system()` was shown there to be genuinely
vulnerable to shell injection, with a promise that `subprocess.run()`
avoids it — this lesson proves that, for real.

**What you need to know first.** From Lesson 4: `os.system()`, and its
flagged shell-injection weakness. New in this lesson: `input()` and the
`subprocess` module.

No pipeline diagram — not part of an established multi-stage pipeline.
This is Track 1, Lesson 1 — built out of order relative to when it
appears in the curriculum map, since Lessons 2–17 (and 18, 61) were
already built by the time this gap was caught.

---

## Concept Unit: `input()`

### The Problem

Every earlier lesson either hardcoded its data or read it from
`sys.argv`/`sys.stdin` (Lesson 10) — set once, before the program runs.
A shell is different: it needs to ask for one command, wait for a
human to type something, react, and then ask again — a genuine,
repeated back-and-forth.

### Introduce the Concept in Isolation

```python
line = input()
print("got:", repr(line))
```
run with a real piped line of input standing in for someone typing:
```bash
printf "echo hello\n" | python3 -c "..."
```

Run it:

```
got: 'echo hello'
```

This proves `input()` pauses execution and waits for one line of text
— from a real person typing at a real prompt, ordinarily, but equally
happy to read from anything else connected to standard input, including
a pipe, exactly as `sys.stdin` iteration did in Lesson 10. The line
comes back with its trailing newline already stripped, unlike
`sys.stdin` iteration, which kept it. This throwaway example is
discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `mini_shell.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `subprocess` module

### The New Code

```python
def mini_shell():
    while True:
        command = input("$ ")
        if command == "exit":
            break
```

### The Updated Project

```python
def mini_shell():                  # ← new
    while True:                       # ← new
        command = input("$ ")            # ← new
        if command == "exit":               # ← new
            break                              # ← new
```

The function now prompts (`"$ "`, the same prompt real shells use by
convention) and reads real input, forever, until someone types exactly
`exit` — but does nothing with any other input yet.

### Mechanical Walkthrough

`def mini_shell():` — basic. `while True:` — Lesson 10's intentional
infinite loop shape, reminder, here relying on the `break` below rather
than an empty-read sentinel. `command = input("$ ")` — the concept from
this unit's lab, reused for real; `input()` accepts an optional prompt
string, printed before waiting — first appearance of that specific
argument, small enough not to need its own lab. `if command == "exit":
break` — basic string comparison and loop control, already established.

### CS Lens

This loop — read one command, act on it, repeat — is called a **REPL**
(Read-Eval-Print Loop) when it also prints a result, and it's the exact
shape behind every interactive prompt you've ever used: a real shell,
the Python interpreter itself when run with no arguments, a database's
`psql`/`mysql` prompt, a debugger's interactive console. Also recognized
in: any chat-based interface, this very conversation's turn-by-turn
structure is architecturally the same read-respond-repeat shape.

### SE Lens

Checking for `"exit"` with a plain `==` means the *only* way out of
this loop is typing exactly that word — no `Ctrl+C` handling, no `quit`
as a synonym, no graceful handling of end-of-input if piped input runs
out entirely (a real, unhandled edge case: `input()` raises
`EOFError` when there's nothing left to read and no more will ever
come, not caught here). A real shell handles several of these paths;
this lesson's version handles exactly one, on purpose, to keep the
core loop visible.

### Commands Needed

None.

### Run It

Not runnable for a complete demonstration yet — the loop reads and can
exit, but running an actual command is the next unit.

### Connection

We can now read commands in a loop. The next unit is what makes reading
them useful: actually running them.

---

## Concept Unit: `subprocess.run()`

### The Problem

We have a typed command as one string, like `"echo hello world"`. We
need to actually launch that as a real, separate program — Lesson 4
already used `os.system()` for something similar (spawning a test
process), but flagged it there as genuinely vulnerable to shell
injection. A real shell needs a safer way to do this.

### Introduce the Concept in Isolation

```python
import subprocess
result = subprocess.run(["echo", "hello", "world"])
print("exit code:", result.returncode)
```

Run it:

```
hello world
exit code: 0
```

This proves `subprocess.run()` launches a real separate process (the
same process-creation idea Lesson 1's socket lesson and Lesson 4's
process manager already established, from a different angle) — but
takes its command as a **list** of separate strings (the program name,
then each argument, individually) rather than one combined string. It
returns a result object; `.returncode` is the process's real exit
status — `0` here, meaning success, the same convention Lesson 3's bash
half already relied on. This throwaway example is discarded.

Now the real, load-bearing proof — the exact gap Lesson 4 flagged and
left open:

```python
import subprocess
import os

dangerous = "harmless.txt; echo INJECTED"

print("--- os.system (Lesson 4, vulnerable) ---")
os.system("ls " + dangerous)

print("--- subprocess.run with a list (safe) ---")
subprocess.run(["ls", dangerous])
```

Real output:

```
--- os.system (Lesson 4, vulnerable) ---
INJECTED
--- subprocess.run with a list (safe) ---
ls: cannot access 'harmless.txt': No such file or directory
ls: cannot access 'harmless.txt; echo INJECTED': No such file or directory
```

This is real, direct proof of Lesson 4's flagged weakness: `os.system()`
handed the whole combined string to a shell, which interpreted the `;`
as "run a second, completely separate command" — `echo INJECTED`
genuinely executed, printing `INJECTED`, even though nothing in the
code explicitly asked for that. `subprocess.run()`, given the identical
dangerous string as *one list element*, never let a shell see it as
anything but a single, literal filename — `ls` correctly failed to find
a file with that exact (strange) name, and the injected `echo` never
ran at all.

### Discard the Throwaway Example

Discarded — both real, kept only as evidence in this writeup, not as
part of `mini_shell.py`.

### Project Change

- **Files affected:** `mini_shell.py`
- **Change type:** add — completes `mini_shell()`
- **Location:** inside the `while True:` loop, after the `exit` check
- **Dependencies:** `subprocess`, `command`

### The New Code

```python
parts = command.split()
if not parts:
    continue
subprocess.run(parts)
```

### The Updated Project

```python
import subprocess

def mini_shell():
    while True:
        command = input("$ ")
        if command == "exit":
            break
        parts = command.split()          # ← new
        if not parts:                       # ← new
            continue                           # ← new
        subprocess.run(parts)                    # ← new

mini_shell()
```

`mini_shell.py` is now complete: a real, if minimal, working shell —
typing a command actually runs it as a separate process, safely, and
the loop continues until `exit`.

### Mechanical Walkthrough

`parts = command.split()` — `.split()` with no arguments (Lesson 5,
reminder), turning the typed line into a list of words — exactly the
list shape `subprocess.run()` expects. `if not parts: continue` —
`continue` (Lesson 4, reminder) — skips straight to the next prompt on
an empty line (just pressing Enter), rather than trying to run "nothing"
as a command. `subprocess.run(parts)` — the concept from this unit's
lab, reused for real: whatever the person typed, split into words,
launched directly.

### CS Lens

This *is* the core of what a real shell does, stripped to its essence:
read a line, split it into a program name and arguments, launch that
program as a child process, wait for it to finish, repeat. Real shells
add enormous amounts of additional behavior on top of this — variable
expansion, pipes, globbing (Lesson 3's `*`), job control — but the
absolute core loop is exactly this small.

### SE Lens

`subprocess.run(parts)`, by default, does **not** invoke a shell at
all — the list of strings goes directly to the operating system to
launch as a new process, with no intermediate shell ever parsing or
reinterpreting any of it. That's precisely why the injection attempt
failed: there was no shell in the loop to notice the `;` and treat it
specially. `subprocess.run()` *can* be told to use a shell (a
`shell=True` argument, not used here) — doing so would reintroduce
the exact vulnerability just demonstrated, which is why the safer,
no-shell, list-based form is the right default to reach for.

### Commands Needed

`python3 mini_shell.py` — runs it; type commands, `exit` to quit.

### Run It — Real Output

Using piped input to simulate a real interactive session:

```
$ printf "echo first command\necho second one\nexit\n" | python3 mini_shell.py
$ first command
$ second one
$
```

Real output — each `"$ "` prompt immediately followed by that command's
own real output on the same line, exactly the visual rhythm of an
actual terminal session.

### Connection

`mini_shell.py` is a real, working, safe shell — and it directly proves
the fix Lesson 4 promised but didn't build.

---

## Closing

### Connect the Pieces

Trace one real command through the whole loop: `input("$ ")` printed
the prompt and waited; a real line, `"echo first command"`, arrived.
It wasn't `"exit"`, so the loop continued. `.split()` turned it into
`["echo", "first", "command"]`. `subprocess.run()` launched `echo` as a
genuine separate process (Lesson 4's process-creation idea, reused)
with `"first"` and `"command"` as its two arguments, waited for it to
finish, and the loop returned to `input()` for the next prompt —
exactly the read-run-repeat cycle a real shell runs constantly,
between every command you type all day.

### What Breaks Without This

Type a command that doesn't exist — an extremely common, everyday
mistake, not a contrived edge case:

```
$ printf "not_a_real_command\nexit\n" | python3 mini_shell.py
```

Real output:

```
$
Traceback (most recent call last):
  ...
FileNotFoundError: [Errno 2] No such file or directory: 'not_a_real_command'
```

Real crash, on a real typo. A genuine shell handles this gracefully —
prints something like `command not found` and shows the next prompt,
never crashing the whole shell over one bad command. `mini_shell()`
currently has no `try`/`except` (Lesson 4's pattern) around the
`subprocess.run()` call, so this exact everyday mistake takes the whole
program down with it — a real, honestly-flagged gap between "the core
loop is right" and "this is actually pleasant to use."

### Exercises

1. Fix the crash: wrap `subprocess.run(parts)` in a
   `try`/`except FileNotFoundError`, printing something like
   `f"{parts[0]}: command not found"` instead of crashing — confirm the
   loop continues to the next prompt afterward.
2. Add a `cd` built-in: real shells handle changing directory specially
   (not as a subprocess — a child process's working-directory change
   can't affect its parent shell, the same process-isolation idea from
   Lesson 6's running-vs-sourcing unit) — check if `parts[0] == "cd"`
   and call `os.chdir(parts[1])` directly instead of spawning a
   subprocess.
3. Deliberately add `shell=True` to `subprocess.run()` and re-run the
   real injection test from this lesson's second unit — confirm the
   vulnerability comes back, and you can see exactly why `shell=True`
   is the setting to avoid by default.

### Definition of Done

- [ ] `mini_shell.py` runs and correctly executes real commands you
      type, exiting cleanly on `exit`
- [ ] You ran the real injection comparison yourself and saw `os.system`
      execute an injected command while `subprocess.run` with a list
      didn't
- [ ] You triggered the real crash from an invalid command and
      understand why it happens
- [ ] You can explain, without looking back, why `subprocess.run(parts)`
      (a list) is safer than building one command string by hand
- [ ] Commit:

```
git add mini_shell.py
git commit -m "Add a mini shell: prove a shell is just a read-run-repeat loop, and that subprocess.run() with an argument list closes the shell-injection gap os.system() left open in Lesson 4"
```
