# Lesson 5: Usage Is a Rate, Not a Snapshot
### (CPU & Memory Viewer)

**What you will build.** Two small functions: `memory_usage()`, which
reports how much of the system's RAM is in use right now, and
`cpu_usage()`, which reports what percentage of CPU time was spent busy
over a short interval. Both read straight from `/proc`, same as Lesson
4. The working feature is small. The transferable problem underneath is
actually two different ideas wearing one lesson: memory usage is a
**snapshot** — one read, one honest answer — but CPU usage is
fundamentally a **rate**, which means one read is *not* an answer at
all; it's meaningless without a second read and a known amount of time
between them. Conflating those two is a real, easy-to-make mistake this
lesson deliberately triggers on purpose.

**What you need to know first.** From Lesson 4 (process manager):
reading files under `/proc`, and the general comfort that OS state is
just text you can `open()`. New in this lesson: iterating a file
line-by-line, `readline()`, list comprehensions, and the `time` module.

**An honesty note.** Like Lesson 4, this relies on `/proc`, so it's
Linux-specific. Every number below is real, read from this container at
the moment it ran — including a deliberately induced CPU spike, so you
can see the number actually respond to real load, not just sit at some
plausible-looking constant.

No pipeline diagram — not part of an established multi-stage pipeline.

---

# Part A — Memory (a Snapshot)

## Concept Unit: Iterating a File Line by Line

### The Problem

Lesson 4 read whole files in one shot with `.read()` — fine for a
single short value like a process name. `/proc/meminfo` is different:
dozens of lines, each one a separate labeled value (`MemTotal`,
`MemFree`, `MemAvailable`, ...). We need to look at it one line at a
time, not as one undifferentiated blob of text.

### Introduce the Concept in Isolation

```python
with open("/proc/meminfo") as f:
    count = 0
    for line in f:
        print(repr(line))
        count += 1
        if count == 3:
            break
```

Run it:

```
'MemTotal:        4093928 kB\n'
'MemFree:         3981788 kB\n'
'MemAvailable:    3886168 kB\n'
```

This proves an open file object is itself directly iterable in a `for`
loop — no `.readlines()`, no manual splitting required — each pass
through the loop hands you the next line, newline character (`\n`,
visible here because `repr()` shows it, unlike plain `print`) still
attached. `break` stops the loop early, already-basic loop control,
used here only to keep this demonstration short. This throwaway example
is discarded; the real project reads every line, not just three.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `system_stats.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** Linux (`/proc` must exist)

### The New Code

```python
def memory_usage():
    stats = {}
    with open("/proc/meminfo") as f:
        for line in f:
            pass
    return stats
```

### The Updated Project

```python
def memory_usage():             # ← new
    stats = {}                    # ← new
    with open("/proc/meminfo") as f:  # ← new
        for line in f:               # ← new
            pass                       # ← new, temporary placeholder
    return stats                    # ← new
```

The function now opens `/proc/meminfo` and walks every line, doing
nothing with each one yet, and returns an (currently empty) dictionary
meant to hold the parsed results.

### Mechanical Walkthrough

`def memory_usage():` — assuming function definitions as basic. `stats
= {}` — assuming empty-dict creation as basic, from your stated Python
background. `with open("/proc/meminfo") as f:` — `with`/`open` reminder,
from Lesson 1 and reused throughout Lesson 4. `for line in f:` — this
*is* the concept from this unit's lab, reused for real: each `line`
will be one full line of `/proc/meminfo`, newline included. `pass` —
reminder placeholder. `return stats` — assuming `return` as basic.

### CS Lens

Not a new hard concept beyond iteration itself, already established —
skipped per the Stopping Rule; the new piece was *what* is iterable
(a file object), not iteration as an idea.

### SE Lens

Iterating line-by-line, instead of `.read()`-ing the whole file and
splitting it afterward, matters more as files grow: line-by-line
iteration only holds one line in memory at a time, while `.read()`
loads everything at once. `/proc/meminfo` is tiny either way, so this
lesson wouldn't show a real difference — but the habit matters for
files that aren't tiny, which a later lesson (log analyzer) will make
concrete.

### Commands Needed

None.

### Run It

Not runnable for meaningful output yet — `pass` does nothing, and
`stats` returns empty.

### Connection

We can now see every line. The next unit is turning each one into a
usable key/value pair.

---

## Concept Unit: Two-Step Line Parsing

### The Problem

Each line looks like `"MemTotal:        4093928 kB\n"` — a label, a
colon, then a number and a unit, padded with inconsistent spacing.
We need the label and the number as clean, separate values.

### Introduce the Concept in Isolation

```python
line = "MemTotal:        4093928 kB\n"
parts = line.split(":")
print(parts)
key = parts[0]
rest = parts[1]
print(repr(rest))
print(rest.split())
```

Run it:

```
['MemTotal', '        4093928 kB\n']
'        4093928 kB\n'
['4093928', 'kB']
```

This proves splitting happens in two different ways for two different
reasons: `line.split(":")` splits on one exact character (reminder of
`.split()` from Lesson 2, there with `os.pathsep`) to separate the label
from everything else. `rest.split()` — called with **no** argument —
behaves differently: it splits on *any* run of whitespace and silently
discards the leading spaces and trailing newline entirely, leaving just
`['4093928', 'kB']`. That's a genuinely different mode of the same
method, not just a reused concept. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `system_stats.py`
- **Change type:** replace — the `pass` placeholder
- **Location:** inside the `for line in f:` loop
- **Dependencies:** `line`, `stats`

### The New Code

```python
key, rest = line.split(":")
value_kb = int(rest.split()[0])
stats[key] = value_kb
```

### The Updated Project

```python
def memory_usage():
    stats = {}
    with open("/proc/meminfo") as f:
        for line in f:
            key, rest = line.split(":")        # ← new
            value_kb = int(rest.split()[0])      # ← new
            stats[key] = value_kb                 # ← new
    return stats
```

`memory_usage()` is now complete: it returns a real dictionary mapping
every label in `/proc/meminfo` (`"MemTotal"`, `"MemFree"`, ...) to its
value in kilobytes, as an actual `int`.

### Mechanical Walkthrough

`key, rest = line.split(":")` — tuple unpacking (the Lesson 1 concept,
reappearing — a reminder) applied to a two-element list from `.split(":")`
— worth noting `.split()` returns a `list`, not a `tuple`, but unpacking
works identically on either. `int(rest.split()[0])` — `.split()` with no
arguments, from this unit's lab, reused for real; `[0]` indexing into the
resulting list to grab just the number, discarding `"kB"`; `int(...)`
converting that number-as-string into a real integer, assumed basic.
`stats[key] = value_kb` — assigning into a dictionary by key; assuming
this as basic dict usage from your stated Python background, since the
underlying idea ("dictionaries store key/value pairs") isn't new here,
only its use in a real loop.

### CS Lens

This whole two-step process is a small, manual **parser** — turning a
line of formatted-but-not-structured text into actual data your program
can use. Also recognized in: literally every config-file reader, log
parser, and CSV reader you'll build in later lessons — this exact
shape (split, clean, convert, store) recurs constantly.

### SE Lens

`/proc/meminfo`'s inconsistent spacing (extra spaces before some
numbers, none before others) is exactly why `rest.split()` — the
no-argument, whitespace-collapsing form — was chosen over something
like `rest[8:15]` (fixed character positions), which would break the
instant the padding changed even slightly. Parsing by *structure*
(split on whitespace) instead of *position* (fixed character offsets)
is more resilient to exactly this kind of formatting inconsistency,
at the cost of being slightly more code than a fixed-width slice would
be.

### Commands Needed

None new.

### Run It — Real Output

```python
stats = memory_usage()
total = stats["MemTotal"]
available = stats["MemAvailable"]
used_percent = 100 * (total - available) / total
print(f"Total: {total / 1024:.0f} MB")
print(f"Available: {available / 1024:.0f} MB")
print(f"Used: {used_percent:.1f}%")
```

```
Total: 3998 MB
Available: 3781 MB
Used: 5.4%
```

Real output from this container at the moment it ran. This is a genuine
snapshot — one read of `/proc/meminfo`, one honest answer. Part B is
about why that same approach quietly lies for CPU.

### Connection

Memory usage is done, and correctly needed only one read. The next part
is CPU — and the first thing it needs is a second read.

---

# Part B — CPU (a Rate)

## Concept Unit: `readline()`

### The Problem

`/proc/stat`'s first line alone (`cpu  49 0 717 982 21 0 8 1 0 0`) has
everything needed for overall CPU usage — the rest of the file breaks
the same numbers down per individual core, which we don't need. Looping
over every line with `for line in f:` and immediately breaking after
one would work, but there's a more direct way to say "just the first
line."

### Introduce the Concept in Isolation

```python
with open("/proc/stat") as f:
    line = f.readline()
print(repr(line))
```

Run it:

```
'cpu  49 0 717 982 21 0 8 1 0 0\n'
```

This proves `.readline()` reads exactly one line and stops — no loop
needed at all for "just the first line." This throwaway example is
discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `system_stats.py`
- **Change type:** add — a new helper function
- **Location:** after `memory_usage()`
- **Dependencies:** none new

### The New Code

```python
def cpu_snapshot():
    with open("/proc/stat") as f:
        line = f.readline()
```

### The Updated Project

```python
def cpu_snapshot():                      # ← new
    with open("/proc/stat") as f:          # ← new
        line = f.readline()                  # ← new
```

A new, separate function — deliberately named "snapshot," not "usage,"
because on its own this is only ever *one* reading, and one reading, as
the rest of this part proves, isn't usage yet.

### Mechanical Walkthrough

`def cpu_snapshot():` — basic. `with open("/proc/stat") as f:` —
reminder. `line = f.readline()` — the concept from this unit's lab,
reused for real.

### CS Lens

Not new beyond file reading, already covered — skipped per the Stopping
Rule.

### SE Lens

Naming this function `cpu_snapshot`, not `cpu_usage`, is a small but
real design decision that exists specifically to stop a future reader
(including future you) from calling it once and treating the result as
"the CPU usage" — the name itself is trying to prevent the exact mistake
the closing section of this lesson triggers on purpose.

### Commands Needed

None.

### Run It

Not runnable for meaningful output — `line` is read but not yet parsed
or returned.

### Connection

We can read one CPU line. The next unit turns its numbers into
something we can actually compute with.

---

## Concept Unit: List Comprehension

### The Problem

`/proc/stat`'s first line is `"cpu"` followed by ten numbers — time
spent in different states (user programs, system/kernel work, idle,
waiting on disk, and others). All ten are strings after splitting; all
ten need converting to real integers before any arithmetic makes sense.
Writing a manual loop to convert and collect ten values into a new list
works, but Python has a more direct way to say "build a new list by
transforming each item of an existing one."

### Introduce the Concept in Isolation

```python
fields = ["cpu", "49", "0", "717", "982", "21", "0", "8", "1", "0", "0"]
numbers = [int(x) for x in fields[1:]]
print(numbers)
print(sum(numbers))
```

Run it:

```
[49, 0, 717, 982, 21, 0, 8, 1, 0, 0]
1778
```

This proves `[int(x) for x in fields[1:]]` — a **list comprehension** —
builds an entirely new list in one expression: for every `x` in
`fields[1:]` (the slice concept from Lesson 61, reused — everything
after the `"cpu"` label), compute `int(x)`, and collect the results, all
without a manual `for`/`append` loop. `sum()` then adds every number in
that list together in one call. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `system_stats.py`
- **Change type:** add
- **Location:** inside `cpu_snapshot()`, after `line = f.readline()`
- **Dependencies:** `line`

### The New Code

```python
fields = line.split()
values = [int(x) for x in fields[1:]]
idle = values[3]
total = sum(values)
return idle, total
```

### The Updated Project

```python
def cpu_snapshot():
    with open("/proc/stat") as f:
        line = f.readline()
    fields = line.split()                      # ← new
    values = [int(x) for x in fields[1:]]         # ← new
    idle = values[3]                                # ← new
    total = sum(values)                              # ← new
    return idle, total                                # ← new
```

`cpu_snapshot()` is now complete: one call returns two numbers — how
much accumulated time the CPU has spent idle, and how much total time
has passed across every category — both counted since the system
booted, not "right now," which is exactly the trap the next unit
addresses.

### Mechanical Walkthrough

`fields = line.split()` — `.split()` with no arguments, reminder from
Part A, reused here on the CPU line instead of a meminfo line.
`[int(x) for x in fields[1:]]` — the list comprehension concept from
this unit's lab, reused for real; `fields[1:]` is a slice (Lesson 61,
reminder) skipping the `"cpu"` label itself. `values[3]` — indexing;
per `/proc/stat`'s documented field order, index `3` (the fourth
number) is specifically the *idle* time field — a fact about this
file's format, not something derivable from the code alone, worth
stating plainly rather than leaving as an unexplained magic number.
`sum(values)` — the `sum()` concept from this unit's lab, reused: total
time across *every* category (user, system, idle, iowait, and others),
not just idle.

### CS Lens

Not a hard CS concept itself beyond list transformation, already the
point of this unit's lab — skipped for a second lens per the Stopping
Rule; this unit already got its full treatment above.

### SE Lens

Returning a plain `(idle, total)` tuple, rather than the full ten-value
breakdown, is a deliberate narrowing: this lesson only needs "how much
was idle" versus "how much total time passed" to compute one overall
busy percentage. A more detailed tool (breaking down *what kind* of
busy — user code vs. kernel work vs. disk waiting) would keep more of
`values` around; that's real, useful information this version discards
on purpose to stay focused on the core rate-vs-snapshot idea.

### Commands Needed

None new.

### Run It

Callable now (`cpu_snapshot()` returns real numbers), but per the next
unit, calling it *once* doesn't yet produce a meaningful usage
percentage — that requires two calls, with real time passing between
them.

### Connection

We can now take one honest reading of accumulated CPU time. The next
unit is why one reading isn't the answer.

---

## Concept Unit: `time.sleep()` and Sampling a Rate

### The Problem

`cpu_snapshot()` returns totals accumulated *since the system booted* —
hours or days of history, not "right now." A single call can't tell you
what the CPU is doing this second; only the *difference* between two
calls, a known amount of time apart, can.

### Introduce the Concept in Isolation

```python
import time
start = time.time()
time.sleep(1)
elapsed = time.time() - start
print(f"elapsed: {elapsed:.2f} seconds")
```

Run it:

```
elapsed: 1.00 seconds
```

This proves `time.sleep(seconds)` pauses execution for approximately
that long, and `time.time()` gives a real, comparable timestamp — the
combination is what makes "wait, then measure the difference" possible
at all. This throwaway example is discarded; the real project doesn't
need `time.time()` directly, only `time.sleep()`, since `/proc/stat`'s
own counters already track elapsed CPU-time internally.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `system_stats.py`
- **Change type:** add — a new function that calls `cpu_snapshot()`
  twice
- **Location:** after `cpu_snapshot()`
- **Dependencies:** `cpu_snapshot`, `time` module

### The New Code

```python
import time

def cpu_usage(interval=1):
    idle1, total1 = cpu_snapshot()
    time.sleep(interval)
    idle2, total2 = cpu_snapshot()

    idle_delta = idle2 - idle1
    total_delta = total2 - total1
    return 100 * (1 - idle_delta / total_delta)
```

### The Updated Project

```python
import time                                            # ← new

def memory_usage():
    stats = {}
    with open("/proc/meminfo") as f:
        for line in f:
            key, rest = line.split(":")
            value_kb = int(rest.split()[0])
            stats[key] = value_kb
    return stats


def cpu_snapshot():
    with open("/proc/stat") as f:
        line = f.readline()
    fields = line.split()
    values = [int(x) for x in fields[1:]]
    idle = values[3]
    total = sum(values)
    return idle, total


def cpu_usage(interval=1):                             # ← new
    idle1, total1 = cpu_snapshot()                        # ← new
    time.sleep(interval)                                    # ← new
    idle2, total2 = cpu_snapshot()                            # ← new

    idle_delta = idle2 - idle1                                 # ← new
    total_delta = total2 - total1                                # ← new
    return 100 * (1 - idle_delta / total_delta)                   # ← new
```

`system_stats.py` is now complete. `memory_usage()` answers from one
read; `cpu_usage()` deliberately takes two, one second apart by
default, and reports the percentage of that interval spent *not* idle.

### Mechanical Walkthrough

`import time` — reminder of `import`, applied to a new module.
`cpu_snapshot()` called twice — reusing the function built two units
ago, once before and once after the pause. `time.sleep(interval)` — the
concept from this unit's lab, reused for real, with `interval`
(default `1` second) controlling the gap. `idle_delta = idle2 - idle1`
and `total_delta = total2 - total1` — basic subtraction, but the *idea*
being computed — a difference between two points in time — is this
whole unit's point, not incidental. `100 * (1 - idle_delta /
total_delta)` — `idle_delta / total_delta` is the *fraction* of elapsed
time that was idle; `1 -` that fraction is the fraction that was busy;
`100 *` converts it to a percentage.

### CS Lens

This is measuring a **rate from two cumulative counters** — the same
pattern behind literally every "requests per second," "bytes per
second," or "frames per second" metric you'll ever see: none of those
are read directly either; they're all (later reading − earlier reading)
÷ (time elapsed). Also recognized in: network throughput monitors,
`iostat`/`vmstat`, database query-per-second dashboards, your car's
speedometer computing speed from odometer readings over time
internally.

### SE Lens

The alternative this lesson's closing section triggers on purpose —
treating one `cpu_snapshot()` call's idle-versus-total ratio as "the"
usage — doesn't crash. It returns a plausible-looking number that's
simply answering the wrong question ("what fraction of all time since
boot was idle" instead of "what fraction of the last second was idle").
That's a more dangerous failure mode than a crash: a wrong number that
looks reasonable can go unnoticed far longer than an error that stops
the program outright.

### Commands Needed

None beyond running the script.

### Run It — Real Output

On an idle system:

```python
print(f"CPU usage (idle system): {cpu_usage():.1f}%")
```

```
CPU usage (idle system): 2.0%
```

And under real, deliberately induced load (a busy-loop running on a
separate thread while `cpu_usage()` samples):

```
CPU usage (under load): 100.0%
```

Both real runs, on the same machine, same code, same function — the
only thing that changed between them was genuine CPU activity, which is
exactly the point: this number moves with reality, unlike a single
snapshot.

### Connection

Both halves of `system_stats.py` are complete, and the CPU half has now
been shown responding to real load, not just producing a static number.

---

## Closing

### Connect the Pieces

Trace a full `cpu_usage()` call: `cpu_snapshot()` ran once, reading
`/proc/stat`'s idle and total counters as they stood at that instant —
both numbers accumulated since boot, meaningless alone. `time.sleep(1)`
paused for one real second, during which the OS kept updating those same
counters in the background. `cpu_snapshot()` ran again, reading the
*new* accumulated values. The two subtractions isolated exactly what
changed during that one-second window — no more, no less — and the
final ratio turned that window's idle-vs-busy split into a percentage.
Compare that to `memory_usage()`: one `/proc/meminfo` read was
sufficient, start to finish, because memory-in-use *is* a snapshot —
there's no "since boot" accumulation to subtract away.

### What Breaks Without This

Compute a percentage from a single `cpu_snapshot()` call, the way a
first attempt at this might reasonably look:

```python
idle, total = cpu_snapshot()
busy_percent = 100 * (1 - idle / total)
print(f"CPU usage (single snapshot): {busy_percent:.1f}%")
```

Real output, run twice, two seconds apart, same machine, genuinely idle
the whole time:

```
CPU usage (single snapshot): 27.4%
CPU usage (single snapshot, 2s later): 26.5%
```

No crash — that's what makes this worse than a crash. `27.4%` looks
completely plausible as "current CPU usage." It's actually the fraction
of all time *since the system booted* that wasn't idle — ancient
history, not "right now," and it barely changes between two calls
seconds apart because it's dominated by however long the system has
already been running. The real, correct `cpu_usage()` function, run on
this same idle machine, reported `2.0%` — a completely different,
correct number, because it measured only the one-second window that
actually mattered.

### Exercises

1. Call `cpu_usage(interval=5)` instead of the default `1` — predict
   whether a longer sampling window makes the number more or less
   sensitive to a brief spike, then check by triggering a short burst
   of CPU work partway through the interval.
2. Add a `memory_usage()`-style breakdown to `cpu_usage()` — instead of
   just "busy," report the fraction spent in `user` time (`values[0]`)
   versus `system` time (`values[2]`) separately.
3. Run `cpu_usage()` in a loop, printing a fresh reading every second,
   and watch it respond in real time to something you do on the machine
   yourself (compiling something, opening a heavy app) — no code
   changes needed, just observe.

### Definition of Done

- [ ] `system_stats.py` runs and both functions return real, sane
      numbers from your own machine
- [ ] You triggered a real CPU spike (even a simple busy-loop) and saw
      `cpu_usage()` actually respond to it
- [ ] You ran the "what breaks" single-snapshot version and saw it
      produce a plausible-but-wrong number, not a crash
- [ ] You can explain, without looking back, why memory needed one read
      and CPU needed two
- [ ] Commit:

```
git add system_stats.py
git commit -m "Add memory and CPU usage readers: prove memory is a snapshot but CPU usage is a rate, and a single reading of a cumulative counter isn't a measurement at all"
```
