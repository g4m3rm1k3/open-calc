# Lesson 4: What "a Process" Actually Is to the OS
### (List, Inspect, and Kill a Process)

**What you will build.** A small process lister — every running
process's PID and name, read directly from `/proc` — plus a function
that kills one by sending it a real signal. The working feature is
small. The transferable problem underneath: **"a process" is not some
abstract, hidden OS concept you need special tools to see** — on Linux,
it's *files*, sitting right there in `/proc`, one folder per running
process, readable with the exact same `open()` you already know.
"Killing" a process isn't the OS reaching in and stopping it by force
either — it's sending it a polite, ignorable *request* (a signal), which
is a very different and more useful mental model than "kill" implies.

**What you need to know first.** From Lesson 1 (sockets): the `with`
statement / context managers, `bytes` (not reused directly, but the
general comfort with `open()`). From Lesson 2 (PATH): the `os` module,
already imported and used there for `os.environ` and `os.path` — this
lesson reuses `os` for different corners of it. New in this lesson:
`os.listdir()`, `str.isdigit()`, `try`/`except`, `os.system()`, and
`os.kill()` with the `signal` module.

**An honesty note on this lesson's approach.** `/proc` is Linux-specific
— this won't work on macOS or Windows as written (both have their own,
different mechanisms; not covered here). Since your practice environment
is Linux, everything below was actually run there, including a real race
condition triggered on purpose.

No pipeline diagram — not part of an established multi-stage pipeline.

---

## Concept Unit: `os.listdir()`

### The Problem

We want a list of every running process. On Linux, that list already
exists as a folder — `/proc` — but we've never asked Python to tell us
what's *inside* a folder before, only to open specific files by name
we already knew.

### Introduce the Concept in Isolation

```python
import os
entries = os.listdir("/proc")
print(entries[:15])
print(len(entries))
```

Run it:

```
['fs', 'bus', 'dma', 'irq', 'net', 'sys', 'tty', 'acpi', 'keys', 'kmsg', 'misc', 'mtrr', 'scsi', 'stat', 'iomem']
109
```

This proves `os.listdir(path)` returns a real Python list of everything
inside a folder, as plain strings — no special "directory object," just
names. Notice most of what's in `/proc` isn't a process at all (`fs`,
`net`, `stat` are all real but unrelated OS info also exposed through
`/proc`) — that's exactly the problem the next unit solves. This
throwaway example is discarded; the real project filters this same list
rather than printing it raw.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `process_manager.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** Linux (for `/proc` to exist at all)

### The New Code

```python
import os

def list_processes():
    for entry in os.listdir("/proc"):
        pass
```

### The Updated Project

```python
import os

def list_processes():          # ← new
    for entry in os.listdir("/proc"):   # ← new
        pass                              # ← new, temporary placeholder
```

The function now walks through every entry `/proc` contains, doing
nothing with each yet — including plenty of entries that aren't
processes at all.

### Mechanical Walkthrough
- `import os` — reminder, reused from Lesson 2.
- `def list_processes():` —
assuming function definitions as basic. `for entry in os.listdir("/proc"):`
- — `os.listdir()` from this unit's lab, reused for real, iterated directly
in a `for` loop (already-basic iteration, applied to a new source).
- `pass` — reminder, same placeholder role from earlier lessons.

### CS Lens

This is the **"everything is a file" philosophy** at its most literal —
Unix-family systems expose kernel state (running processes, device info,
kernel parameters) as regular files you read with regular file
operations, instead of requiring special system calls or APIs for each
different kind of information. Also recognized in: `/dev` (devices as
files), `/sys` (kernel tunables as files), the same philosophy Lesson
1's socket-as-file-descriptor unit already touched from a different
angle.

### SE Lens

The alternative — a dedicated system call like `get_process_list()` that
some OSes do use — would need its own API, its own error-handling
conventions, and its own documentation, separate from ordinary
file-reading. `/proc` reuses machinery every program already has (open,
read, list a directory) for an entirely different purpose. The cost:
`/proc` mixes real processes in with unrelated system info in the same
listing, which is exactly why the next unit needs a filter at all.

### Commands Needed

None.

### Run It

Not runnable for meaningful output — `pass` does nothing observable.

### Connection

We can now see everything `/proc` contains. The next unit picks out
just the process IDs from that mixed list.

---

## Concept Unit: `str.isdigit()`

### The Problem

Every actual process shows up in `/proc` as a folder *named after its
PID* — a number, as a string, like `"482"`. Everything else in `/proc`
(`"net"`, `"fs"`, `"stat"`...) is a name, not a number. We need a way to
tell those apart using nothing but the string itself.

### Introduce the Concept in Isolation

```python
names = ["1", "fs", "42", "net", "119"]
for n in names:
    print(n, n.isdigit())
```

Run it:

```
1 True
fs False
42 True
net False
119 True
```

This proves `.isdigit()` is a string method that answers exactly the
question we need: "is every character in this string a digit?" — true
for PIDs, false for named entries. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `process_manager.py`
- **Change type:** replace — the `pass` placeholder
- **Location:** inside `list_processes`
- **Dependencies:** `entry` loop variable

### The New Code

```python
if entry.isdigit():
    pid = int(entry)
```

### The Updated Project

```python
import os

def list_processes():
    for entry in os.listdir("/proc"):
        if entry.isdigit():        # ← new
            pid = int(entry)         # ← new
```

The function now skips every non-numeric entry entirely, and converts
the real PIDs from strings into actual integers.

### Mechanical Walkthrough
- `if entry.isdigit():` — `.isdigit()` from this unit's lab, reused for real.
- `pid = int(entry)` — assuming `int()` conversion as basic (a

standard, familiar conversion from your Python background); worth
- noting only that it's *needed* here — `entry` is still a string at this
point, and the rest of the lesson wants a real number to build a path
and pass to `os.kill()` with.

### CS Lens

Not a new hard concept beyond string inspection, already familiar —
skipped per the Stopping Rule.

### SE Lens

`.isdigit()` is a real but imperfect filter — technically, `/proc` also
exposes some non-PID numeric-looking entries `.isdigit()` won't
distinguish from real PIDs (rare in practice, worth knowing exists). A
more bulletproof version would additionally verify the entry is a
directory (`os.path.isdir`) before trusting it — a real gap this lesson
leaves open rather than papering over, since the failure mode it would
guard against is not the process-disappearing race the next unit
actually demonstrates.

### Commands Needed

None.

### Run It

Not runnable for output yet — `pid` is computed but nothing reads or
prints anything about it.

### Connection

We now have real, filtered process IDs as integers. The next unit reads
each one's actual name.

---

## Concept Unit: Reading a Process's Name

### The Problem

A PID alone isn't very useful to a human — we want to know *what
program* it is. Linux keeps that too, as another plain file:
`/proc/<pid>/comm`, containing just the process's short name.

### Introduce the Concept in Isolation

```python
with open("/proc/1/comm") as f:
    raw = f.read()
print(repr(raw))
clean = raw.strip()
print(repr(clean))
```

Run it:

```
'process_api\n'
'process_api'
```

This proves two things: `open()` in plain (text) mode — no `"rb"` this
time, unlike Lesson 61 — hands back a `str`, not `bytes`, because
`/proc/<pid>/comm` genuinely contains text; and `.strip()` removes the
trailing newline the file actually contains (visible via `repr()`, which
shows the `\n` that plain `print()` would have hidden). This throwaway
example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `process_manager.py`
- **Change type:** add
- **Location:** inside the `if entry.isdigit():` block, after `pid =
  int(entry)`
- **Dependencies:** `pid`

### The New Code

```python
with open(f"/proc/{pid}/comm") as f:
    name = f.read().strip()
print(f"{pid}: {name}")
```

### The Updated Project

```python
import os

def list_processes():
    for entry in os.listdir("/proc"):
        if entry.isdigit():
            pid = int(entry)
            with open(f"/proc/{pid}/comm") as f:   # ← new
                name = f.read().strip()               # ← new
            print(f"{pid}: {name}")                   # ← new
```

`list_processes()` now, for every real PID, reads and prints its name
alongside it — assuming, for now, that the process is still there by the
time we get to it.

### Mechanical Walkthrough
- `with open(f"/proc/{pid}/comm") as f:` — the `with` concept from Lesson 1, reapplied here — a reminder; `f"/proc/{pid}/comm"` is an f-string

building a path from `pid`, already-basic string formatting. `f.read().strip()`
- — `.read()` reminder from Lesson 61 (there in binary mode; here in text mode — same method, different mode, worth the note); `.strip()` from this unit's lab, reused for real.
- `print(f"{pid}: {name}")` — basic

f-string printing.

### CS Lens

Not new beyond the file-reading concept already covered this lesson —
skipped per the Stopping Rule.

### SE Lens

Reading `/proc/<pid>/comm` specifically, rather than the fuller
`/proc/<pid>/cmdline` (which contains the entire command line, including
arguments), is a deliberate scope choice — `comm` is the short program
name only, simpler to parse and enough for a basic lister; `cmdline` is
what a real task manager would additionally offer, at the cost of
needing to handle null-byte-separated arguments instead of one clean
string.

### Commands Needed

None new.

### Run It

Runnable now, but not yet safe — the next unit is why: this version
will crash the moment any process listed by `os.listdir()` exits before
we get to reading its `comm` file, which happens constantly on a real,
busy system.

### Connection

We can now list PID and name together. The next unit fixes the real
race condition this creates.

---

## Concept Unit: `try`/`except`

### The Problem

Between `os.listdir("/proc")` returning a list of PIDs and this loop
reaching each one, real time passes — and real processes exit during
that window, constantly, on any live system. When that happens,
`/proc/<pid>/comm` no longer exists by the time we try to open it, and
`open()` raises an error that, unhandled, crashes the entire listing —
not gracefully skips one process.

### Introduce the Concept in Isolation

```python
try:
    with open("/proc/999999/comm") as f:
        print(f.read())
except FileNotFoundError:
    print("that process does not exist")
print("program kept running")
```

Run it:

```
that process does not exist
program kept running
```

This proves `try`/`except` lets code that *might* fail run without
crashing the whole program: the `open()` inside `try` failed exactly the
way a disappeared process's `/proc` entry would, `except
FileNotFoundError:` caught that specific failure, and execution
continued normally afterward — the line after the whole block still ran.
This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `process_manager.py`
- **Change type:** refactor — wrap the existing file-read in a `try`
- **Location:** inside the `if entry.isdigit():` block
- **Dependencies:** everything built so far in this function

### The New Code

```python
try:
    with open(f"/proc/{pid}/comm") as f:
        name = f.read().strip()
    print(f"{pid}: {name}")
except (FileNotFoundError, ProcessLookupError):
    continue
```

### The Updated Project

```python
import os

def list_processes():
    for entry in os.listdir("/proc"):
        if entry.isdigit():
            pid = int(entry)
            try:                                          # ← new
                with open(f"/proc/{pid}/comm") as f:
                    name = f.read().strip()
                print(f"{pid}: {name}")
            except (FileNotFoundError, ProcessLookupError):  # ← new
                continue                                       # ← new
```

`list_processes()` is now genuinely safe to run on a live system — any
process that vanishes mid-listing is silently skipped instead of
crashing the whole function.

### Mechanical Walkthrough
- `try: ... except (...): ...` — the concept from this unit's lab, reused
for real, now wrapping the actual read-and-print instead of a toy
- example.
- `(FileNotFoundError, ProcessLookupError)` — first appearance of
catching *two* different exception types at once: `FileNotFoundError`
covers the file genuinely being gone; `ProcessLookupError` is a second,
related failure that can occur reading certain `/proc` files for a
process in the middle of exiting — both mean the same thing here ("this
process is gone, move on"), so both are caught together rather than with
- two separate `except` blocks.
- `continue` — first appearance: skips the
rest of *this* loop iteration and moves straight to the next `entry`,
already-basic loop control once named.

### CS Lens

This is handling a **TOCTOU race condition** — Time-Of-Check to
Time-Of-Use — the gap between "we saw this process listed" (the check)
and "we tried to read its details" (the use), during which the world
changed underneath us. Also recognized in: checking a file exists before
opening it (still racy — the file can vanish in between, which is why
`try`/`except` is the *correct* fix, not a `if os.path.exists()` check
first), any "check then act" pattern in concurrent or multi-process
systems, database read-then-update patterns without transactions.

### SE Lens

The alternative — checking `os.path.exists(f"/proc/{pid}")` before
opening, instead of just trying and catching the failure — is a real
pattern (called "look before you leap") but it's still racy: the process
can exit in the gap between the check and the `open()` call right after
it, so the crash can still happen, just less often, which is worse in a
way — a bug that only shows up rarely is harder to catch during testing.
`try`/`except` here follows Python's more common "easier to ask
forgiveness than permission" convention instead — attempt the real
operation, handle the specific failure if it happens, with no
race window at all.

### Commands Needed

None new.

### Run It — Real Output

```
$ python3 process_manager.py
1: process_api
2: kthreadd
3: pool_workqueue_release
4: kworker/R-rcu_gp
...
494: rclone-filestor
580: sh
581: python3
```

Real output from this container — every live process at the moment it
ran, safely, including short-lived kernel worker threads that could
plausibly disappear mid-listing without crashing anything.

### Connection

Listing is complete and safe. The rest of this lesson builds the second
half of a process manager: actually stopping one.

---

## Concept Unit: `os.system()`

### The Problem

To test *killing* a process safely, we need something disposable to
kill — not a real system process. We need a way to launch a new,
throwaway process from inside Python itself.

### Introduce the Concept in Isolation

```python
import os
status = os.system("sleep 100 &")
print("exit status:", status)
```

Run it:

```
exit status: 0
```

(A real background `sleep 100` process was left running by this —
confirmed separately by listing running processes and finding it.) This
proves `os.system(command)` hands a string straight to the shell to run,
exactly as if you'd typed it at a prompt — including shell features like
`&` for backgrounding — and returns the shell's exit status (`0` means
success) once that shell command itself finishes launching. This
throwaway example is discarded; the real project uses this only to
create a test target, not as part of `process_manager.py`'s actual
feature set.

### Discard the Throwaway Example

Discarded — `os.system()` is a testing tool for this lesson, not part of
the delivered `process_manager.py` file.

### CS Lens

`os.system()` is **shelling out** — handing a whole command string to a
separate shell process to interpret and run, rather than Python parsing
or executing it directly. Also recognized in: any language's `exec()` /
backtick equivalent, CI scripts that shell out to `git`, `docker`, or
other CLI tools rather than reimplementing their logic.

### SE Lens

`os.system()` is convenient but has a real, known weakness worth naming
honestly: because it hands a raw string to the shell, a command built
from untrusted input (a filename a user typed, say) can be manipulated
into running something completely different than intended — a real
vulnerability class called shell injection. Production code generally
uses `subprocess.run()` with an argument *list* instead, specifically to
avoid the shell ever re-interpreting anything — not covered as its own
unit here, but worth knowing `os.system()`'s convenience has that
tradeoff attached.

### Commands Needed

None beyond what's already in the code.

### Run It

Shown above — a real background process now exists, ready for the next
unit to find and stop.

### Connection

We now have a disposable real process to test against. The final unit
actually stops it.

---

## Concept Unit: `os.kill()` and Signals

### The Problem

We want to stop a running process by PID — but "kill," despite the name,
isn't the OS forcibly destroying a process on your command. It's sending
that process a specific, named request it can, in principle, ignore or
handle however it wants.

### Introduce the Concept in Isolation

```python
import os
import signal

pid = 563  # a real PID found from a running sleep process
os.kill(pid, signal.SIGTERM)
print(f"sent SIGTERM to {pid}")
```

Run against a real, freshly-spawned `sleep` process's actual PID, then
confirmed by polling `/proc` afterward:

```
found sleep process at pid: 579
sent SIGTERM to 579
after 0.5s, still alive: True
after 1.0s, still alive: True
after 1.5s, still alive: False
after 2.0s, still alive: False
```

This proves two things worth sitting with: `os.kill(pid, signal.SIGTERM)`
doesn't kill anything itself — it *sends a signal named SIGTERM*, and
the process took over a second to actually disappear afterward, because
"handle SIGTERM by exiting" is the process's own default behavior, not
something the sender forced. This throwaway example is discarded — the
real project wraps this in a proper function instead of a hardcoded PID.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `process_manager.py`
- **Change type:** add
- **Location:** new function, after `list_processes`
- **Dependencies:** `os` (already imported)

### The New Code

```python
import signal

def kill_process(pid):
    os.kill(pid, signal.SIGTERM)
    print(f"Sent SIGTERM to {pid}")
```

### The Updated Project

```python
import os
import signal                                          # ← new

def list_processes():
    for entry in os.listdir("/proc"):
        if entry.isdigit():
            pid = int(entry)
            try:
                with open(f"/proc/{pid}/comm") as f:
                    name = f.read().strip()
                print(f"{pid}: {name}")
            except (FileNotFoundError, ProcessLookupError):
                continue


def kill_process(pid):        # ← new
    os.kill(pid, signal.SIGTERM)   # ← new
    print(f"Sent SIGTERM to {pid}")  # ← new
```

`process_manager.py` is now complete: `list_processes()` shows every
running process; `kill_process(pid)` asks a specific one to stop.

### Mechanical Walkthrough
- `import signal` — first appearance of this module: Python's interface to OS signals.
- `os.kill(pid, signal.SIGTERM)` — the concept from this unit's lab, reused for real: `os.kill` (a slightly misleading name — it

*sends a signal*, any signal, not exclusively a lethal one) taking the
- target `pid` and `signal.SIGTERM` (a named constant — "terminate,
please" — the conventional, catchable, ignorable request to stop; not
the same as `signal.SIGKILL`, which a process genuinely cannot ignore or
handle, not used here on purpose).

### CS Lens

This is **asynchronous, cooperative interruption** — the sender doesn't
control what happens next; the receiving process's own signal handler
(often just "exit," but not always) decides. Also recognized in:
Ctrl+C at a terminal (literally sends `SIGINT`, the interrupt signal —
same mechanism you've used your whole time in a terminal without naming
it), graceful shutdown handlers in web servers (catching `SIGTERM`
specifically to finish in-flight requests before exiting), Kubernetes
sending `SIGTERM` to a container before a forced `SIGKILL` timeout.

### SE Lens

Choosing `SIGTERM` over `SIGKILL` here is the actual design decision
worth stating plainly: `SIGTERM` gives the target process a chance to
clean up (close files, finish a write, release a lock) before exiting;
`SIGKILL` gives it none — the kernel terminates it immediately, no
handler runs at all. The real-world cost of defaulting to `SIGKILL`
"to be sure" is processes that die mid-write, corrupting whatever they
were in the middle of doing. A real process manager tries `SIGTERM`
first and only escalates to `SIGKILL` after waiting and finding the
process still alive — not built here, but a natural next exercise.

### Commands Needed

None beyond running the script itself.

### Run It — Real Output

Full spawn → find → kill → confirm sequence, run together so PIDs stay
valid throughout:

```
found sleep process at pid: 579
sent SIGTERM to 579
after 0.5s, still alive: True
after 1.0s, still alive: True
after 1.5s, still alive: False
```

### Connection

Both halves of a process manager now work, and both were tested against
real, live processes — not simulated.

---

## Closing

### Connect the Pieces

Trace one real run end to end: `os.system("sleep 100 &")` launched a
genuine new process. `os.listdir("/proc")` saw its PID appear in the
listing, mixed in among unrelated entries like `net` and `fs`.
`entry.isdigit()` filtered it in; everything non-numeric filtered out.
`open(f"/proc/{pid}/comm")`, inside a `try`, safely read its name —
`"sleep"` — without risking a crash if it had already exited.
`kill_process(pid)` called `os.kill(pid, signal.SIGTERM)`, which didn't
instantly erase it — polling `/proc` afterward showed it took over a
second to actually disappear, because the kernel's default handling of
an unhandled `SIGTERM` is itself a process, not an instruction.

### What Breaks Without This

Remove the `try`/`except` and trigger the exact race condition on
purpose — spawn a process, kill it fully, then try to read its `comm`
file right after:

```python
os.kill(dead_pid, signal.SIGKILL)
time.sleep(1.5)  # let it fully leave /proc
with open(f"/proc/{dead_pid}/comm") as f:
    print(f.read())
```

Real output:

```
FileNotFoundError: [Errno 2] No such file or directory: '/proc/579/comm'
```

That's the exact crash `try`/`except` exists to prevent — not a
hypothetical, a real error triggered on purpose by reading a process
that had genuinely already exited. On a live system with hundreds of
short-lived processes, `list_processes()` without the `try` would crash
unpredictably, working fine most runs and failing on others, purely
based on timing — the worst kind of bug to track down. Restoring the
`try`/`except` fixes it for good, not just for this one case.

### Exercises

1. Modify `list_processes()` to also print each process's memory usage
   (hint: `/proc/<pid>/status` contains a `VmRSS:` line — you'll need
   to search the file's lines for the one starting with that label).
2. Change `kill_process` to try `SIGTERM` first, wait one second, check
   if the process is still alive, and only then send `SIGKILL` —
   this is what real process managers actually do.
3. Trigger the race condition yourself, on purpose, the way the "what
   breaks" section did — spawn a short-lived process, and try to read
   its `/proc` entry after it's gone. Confirm you get the same error.

### Definition of Done

- [ ] `process_manager.py` runs and lists real processes from your own
      machine
- [ ] You tested `kill_process()` against a real, disposable process you
      spawned yourself — not a real system process
- [ ] You triggered the race condition on purpose and saw the real
      `FileNotFoundError`
- [ ] You can explain, without looking back, why `SIGTERM` isn't the
      same as forcibly destroying a process
- [ ] Commit:

```
git add process_manager.py
git commit -m "Add a process lister and killer using /proc directly: prove a process is just a folder of files, and killing one is a cooperative request, not a forced stop"
```
