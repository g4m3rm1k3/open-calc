# Lesson 33: The Loop That Lies About Its Own Timing

## What you will build

A function that runs a given task repeatedly, once every N seconds,
using nothing but a `while` loop and `time.sleep()` — no scheduling
library, no OS-level cron (that's next lesson's honest, real-scheduler
version). The transferable problem this lesson is actually about: the
obvious version of this loop is subtly wrong — it drifts further behind
schedule the longer it runs — and understanding *why* it drifts, by
measuring the drift directly, is what makes the fix make sense instead
of feeling like an arbitrary extra line of code.

## What you need to know first

- **Lesson 32** — `time.monotonic()` and why it's the right clock for
  measuring elapsed time rather than `time.time()`. Reused here
  unchanged, for the same reason.
- Nothing else — this lesson only needs a `while` loop and functions,
  both established since Lesson 1.

---

## The Problem, in prose, no code yet

"Run this task every 60 seconds" sounds like it has one obvious
implementation: do the task, sleep for 60 seconds, repeat forever. That
implementation is almost right, and the way it's wrong is easy to miss
entirely if the task itself is fast — which is exactly why this is worth
slowing down for: the bug is invisible in a two-line toy example and only
shows up once a real task takes real time to run, and once the loop has
been running long enough for that time to add up.

---

## Concept Unit: `time.sleep()`

### The Problem

Every loop this curriculum has written so far runs as fast as the
computer can execute it — a `while True:` reading input, a server
`accept()` loop waiting on the network. None of them have ever
deliberately done nothing for a period of time. Running a task on a
schedule needs exactly that: a way to pause execution for a chosen
duration.

### Reference Source

No reference counterpart — this lesson has no external reference
implementation it's building toward; `time.sleep()` is documented
standard-library behavior, not project-specific code.

### Introduce the concept in isolation

```python
import time

print("starting sleep at:", time.monotonic())
time.sleep(0.5)
print("woke up at:", time.monotonic())
```

Run it:

```
starting sleep at: 11.203834651
woke up at: 11.704080937
```

What this proves: `time.sleep(0.5)` (**first appearance**) pauses the
program's execution for approximately the given number of seconds — here,
the gap between the two `time.monotonic()` readings is `0.500246...`,
very close to but not exactly `0.5`, because `sleep()` only guarantees
*at least* the requested duration; the operating system can, and
sometimes does, wake the program up slightly late, never early. This
small, honest imprecision is worth noticing now, because it's the seed of
the larger drift problem the rest of this lesson measures and fixes.

This lab is deleted now; it never appears in the project. What survives
is the fact: `sleep()` pauses for approximately, not exactly, the
requested time.

### CS Lens

`time.sleep()` yields the CPU entirely for its duration — the operating
system's scheduler is free to run other programs during that time,
unlike a "busy loop" that would burn CPU cycles doing nothing just to
pass time. This is a **blocking** call: the single thread that calls it
does nothing else until it returns.

Also recognized in: `setTimeout` in JavaScript (though non-blocking,
since JavaScript's runtime model differs — a useful contrast, not an
equivalence), Unix's own `sleep` command (Lesson 3's territory),
`Thread.sleep()` in Java.

### SE Lens

Python could have offered only a busy-wait ("keep checking the clock in
a loop until enough time has passed") — simpler to implement internally,
but wasteful: it would peg a CPU core at 100% doing nothing useful.
`sleep()` trades a small amount of imprecision (the operating system's
own scheduling granularity) for near-zero CPU cost while waiting, which
is the right tradeoff for nearly every real use of "wait before doing
the next thing."

---

## Concept Unit: The Naive Loop Drifts

### The Problem

The obvious loop — do the task, then `sleep(interval_seconds)` — treats
the task as if it takes zero time. Real tasks don't. If a task takes 0.2
seconds to run and the loop then sleeps for a full 1.0 seconds afterward,
each full cycle actually takes 1.2 seconds, not 1.0 — and that extra 0.2
seconds keeps adding up, cycle after cycle, forever.

### Introduce the concept in isolation

```python
import time

def simulated_task():
    time.sleep(0.2)  # stands in for "real work that takes some time"

interval_seconds = 1.0
scheduled_times = []

loop_start = time.monotonic()
for iteration_number in range(4):
    scheduled_times.append(time.monotonic() - loop_start)
    simulated_task()
    time.sleep(interval_seconds)

for iteration_number, when in enumerate(scheduled_times):
    print(f"iteration {iteration_number}: task started at t={when:.3f}s (intended: {iteration_number * interval_seconds:.3f}s)")
```

Run it:

```
iteration 0: task started at t=0.000s (intended: 0.000s)
iteration 1: task started at t=1.200s (intended: 1.000s)
iteration 2: task started at t=2.400s (intended: 2.000s)
iteration 3: task started at t=3.601s (intended: 3.000s)
```

### Execution Trace

```
iteration 0: t=0.000 (task takes 0.2s, then sleep 1.0s → next start ≈ 1.200)
iteration 1: t=1.200 (0.200s late) (task 0.2s, sleep 1.0s → next ≈ 2.400)
iteration 2: t=2.400 (0.400s late) (task 0.2s, sleep 1.0s → next ≈ 3.600)
iteration 3: t=3.601 (0.601s late)
```

What this proves: the gap between "intended" and "actual" isn't constant
— it *grows* by roughly the task's own duration (`0.2s`) on every single
iteration, because `sleep(interval_seconds)` always sleeps a full
`interval_seconds` regardless of how much time the task itself already
consumed. After only 4 iterations, the schedule is already off by more
than half a second; over a real deployment running for hours, this drift
compounds without bound.

This lab is deleted now; it never appears in the project. The measured
drift is the problem the next unit fixes.

### CS Lens

This is an **unbounded accumulating error** — a small, per-iteration
inaccuracy that isn't corrected before the next iteration, so it stacks
on top of itself indefinitely rather than staying constant.

Also recognized in: floating-point rounding errors compounding across
many operations, clock drift between unsynchronized computers over time,
any simulation that advances state in fixed steps without correcting for
the real time each step actually took.

### SE Lens

The naive version isn't *wrong* in the sense of crashing or producing an
obviously bad result — it's wrong in a way that only shows up under
conditions the original programmer might never have tested: a slow task,
or a long-running process. This is exactly the kind of bug this
curriculum's `LessonContract.md` calls out by name in Lesson 32's own
`TokenBucket` unit — the version that looks right and passes a quick,
short test, but fails a longer or more demanding one. The fix is worth
building correctly from the start rather than discovering this the hard
way in production, hours into a real run.

---

## Concept Unit: Scheduling Against a Fixed Point, Not a Fixed Delay

### The Problem

The naive loop's mistake is asking "how long should I sleep *after* this
task finishes?" — a question whose answer never accounts for how long the
task itself took. The fix is asking a different question entirely: "what
absolute time should the *next* iteration start at, regardless of how
long this one took?" — and then sleeping only as long as necessary to
reach that specific point in time.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `scheduler.py`.
- **Change type:** add.
- **Dependencies:** `time`, standard library only.

### The New Code

```python
def run_every_n_seconds(task_function, interval_seconds, iteration_limit=None):
    iteration_number = 0
    loop_start_time = time.monotonic()
    next_run_time = loop_start_time
    try:
        while iteration_limit is None or iteration_number < iteration_limit:
            actual_start_time = time.monotonic()
            print(f"iteration {iteration_number}: started at t={actual_start_time - loop_start_time:.3f}s "
                  f"(intended: {next_run_time - loop_start_time:.3f}s)")
            task_function()

            iteration_number += 1
            next_run_time += interval_seconds
            sleep_duration = next_run_time - time.monotonic()
            if sleep_duration > 0:
                time.sleep(sleep_duration)
    except KeyboardInterrupt:
        print("Stopping — received Ctrl+C, shutting down cleanly.")
```

### The Updated Project

A new, freestanding function with nothing surrounding it yet — covered
by Project Change above.

### Mechanical Walkthrough

- `iteration_number = 0` — reused counter, tracks how many times the
  task has run so far.
- `loop_start_time = time.monotonic()` — a **hard concept reappearing**
  from Lesson 32: an anchor point for measuring elapsed time, not a
  meaningful absolute timestamp on its own.
- `next_run_time = loop_start_time` — the core new idea, stated as data:
  this variable holds the absolute (monotonic-clock) time the *next*
  iteration is supposed to begin, starting equal to right now, since the
  very first iteration should start immediately.
- `while iteration_limit is None or iteration_number < iteration_limit:`
  — reused boolean logic (`or`, comparison); `iteration_limit=None` (the
  default) means "run forever," while a real number caps how many times
  the loop runs — added specifically so this lesson's own demonstration
  run can terminate on its own rather than running until interrupted.
- `task_function()` — reused: calls whatever function was passed in,
  the same higher-order-function pattern already used for dispatch
  tables and callbacks in earlier lessons.
- `next_run_time += interval_seconds` — **the fix, stated in one line**:
  the next scheduled time is computed by adding the interval to the
  *previous scheduled time*, not to "now." This is what makes the
  schedule immune to how long any single task took — each scheduled time
  is a fixed point on the timeline, computed once, independent of
  execution speed.
- `sleep_duration = next_run_time - time.monotonic()` — computes exactly
  how much time is left until that fixed point, using *current* elapsed
  time, which already reflects however long the task actually took.
- `if sleep_duration > 0: time.sleep(sleep_duration)` — reused
  conditional; the guard matters because if a task ever takes *longer*
  than `interval_seconds`, `next_run_time` could already be in the past
  by the time this line runs, and `time.sleep()` given a negative number
  raises an error — skipping the sleep entirely in that case means the
  loop immediately starts the next (already-late) iteration instead of
  crashing.
- `try:` / `except KeyboardInterrupt:` — **first appearance.**
  `KeyboardInterrupt` is the exception Python raises when the user
  presses Ctrl+C while a program is running. Wrapping the loop in `try`
  and catching it specifically means the program can print a clean
  message and exit in an orderly way, instead of the default behavior —
  an unhandled `KeyboardInterrupt` prints a raw traceback to the
  terminal, which is confusing and looks like a crash even though the
  user did exactly what they meant to do.

### Run it

```python
run_every_n_seconds(simulated_task, interval_seconds=1.0, iteration_limit=4)
```

```
iteration 0: started at t=0.000s (intended: 0.000s)
iteration 1: started at t=1.000s (intended: 1.000s)
iteration 2: started at t=2.000s (intended: 2.000s)
iteration 3: started at t=3.000s (intended: 3.000s)
```

Every "started at" now matches its "intended" value almost exactly —
compare directly against the naive loop's `t=3.601s` at iteration 3
above, using the exact same `simulated_task` (a fixed, real 0.2-second
delay) and the exact same `interval_seconds=1.0`. The only change was
*what the loop schedules against*.

---

## Connect the pieces

One full run, traced start to finish: `loop_start_time` is recorded once.
Iteration 0 runs immediately (`next_run_time` already equals
`loop_start_time`), takes `0.2s`, then `next_run_time` becomes `1.0s` and
the loop sleeps the remaining `0.8s` to reach it exactly. Iteration 1
starts at `t=1.0s`, takes another `0.2s`, `next_run_time` becomes `2.0s`,
and the loop again sleeps only the remaining `0.8s`. Every iteration's
"debt" (the task's own duration) is paid back out of that iteration's
sleep, not carried forward — which is the entire fix, and the entire
reason the schedule never drifts.

## What breaks without this

Swap `run_every_n_seconds`'s corrected scheduling back to the naive
version — replace `next_run_time += interval_seconds` /
`sleep_duration = next_run_time - time.monotonic()` with a plain
`time.sleep(interval_seconds)` after the task call — and the earlier
naive-loop output reappears exactly: `t=1.200s`, `t=2.400s`, `t=3.601s`,
each further behind schedule than the last. Restoring the fixed-point
scheduling fixes it immediately, with no other change required.

## Definition of done

- [ ] `scheduler.py` runs and, with `simulated_task`'s fixed `0.2` second
      delay and `interval_seconds=1.0`, produces "started at" times that
      match "intended" times to within a few milliseconds — not the
      several-hundred-millisecond-per-iteration drift the naive version
      produces.
- [ ] Running `run_every_n_seconds` with `iteration_limit=None` and
      interrupting it with Ctrl+C prints the clean "Stopping" message,
      not a raw Python traceback.
- [ ] You can explain, without looking back at this lesson, why
      `next_run_time += interval_seconds` uses the *previous* scheduled
      time rather than `time.monotonic() + interval_seconds`.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add scheduler.py
  git commit -m "Add drift-corrected run-every-N-seconds loop — schedules against a fixed absolute time instead of a fixed delay-after-completion, so task duration never accumulates into schedule drift"
  ```

## What's next

This loop still runs inside one long-lived Python process — if that
process crashes, or the computer restarts, the schedule stops entirely
until someone notices and restarts it by hand. Lesson 34 replaces this
with the real, OS-native version (`cron` on Unix, Task Scheduler on
Windows) that survives exactly those situations, at the cost of losing
this lesson's easy in-process drift-correction logic — a tradeoff that
lesson will name directly once it's on the table.
