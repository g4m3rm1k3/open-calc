# Lesson 6: Reversing the Reversal, and the Cost of Looking
### (Project 2 — Task Manager, Python)

**What you will build.** `TaskList` gains `redo` — a second stack that
mirrors the first — and `find_by_title`, a way to look a task up by
name instead of only by position. The transferable problems this lesson
is actually about: undo and redo are the same idea pointed in opposite
directions, and a search that works correctly can still be a real
performance problem waiting to happen — the two aren't the same
question, and this lesson deliberately answers the first without yet
answering the second.

**What you need to know first.** Lesson 5 — `Command` objects
(`execute`/`undo`), and `TaskList.history` as a stack driving
`undo_last()`.

---

## Concept Unit: Redo

### The Problem

`undo_last()` from Lesson 5 reverses the most recent action — but once
it's reversed, that's final. If a user undoes a completion by mistake,
there's currently no way to put it back except manually redoing the
same action from scratch, which isn't always possible (what if the
original command needed information — like a task's exact old title —
that's no longer sitting anywhere?). We need "undo the undo," and it
needs to work no matter how many times in a row it's used.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `tasklist.py`.
- **Change type** — add (new attribute, new method); modify
  `undo_last()`.
- **Location** — inside `class TaskList`.
- **Dependencies** — `commands.py`, Lesson 5.

### The New Code

```python
        self.redo_stack = []
```

```python
    def undo_last(self):
        command = self.history.pop()
        command.undo()
        self.redo_stack.append(command)

    def redo_last(self):
        command = self.redo_stack.pop()
        command.execute()
        self.history.append(command)
```

and one line added inside the existing `run()`:

```python
    def run(self, command):
        command.execute()
        self.history.append(command)
        self.redo_stack = []
```

### The Updated Project

```python
class TaskList:
    def __init__(self):
        self.tasks = []
        self.history = []
        self.redo_stack = []                    # ← new

    def run(self, command):
        command.execute()
        self.history.append(command)
        self.redo_stack = []                    # ← new

    def undo_last(self):
        command = self.history.pop()
        command.undo()
        self.redo_stack.append(command)          # ← new

    def redo_last(self):                          # ← new
        command = self.redo_stack.pop()           # ← new
        command.execute()                         # ← new
        self.history.append(command)               # ← new
```

`TaskList` now keeps two stacks instead of one: `history` holds
commands that are currently applied, `redo_stack` holds commands that
were undone and could be reapplied. `undo_last()` moves a command from
one to the other; `redo_last()` moves it back.

### Introduce the concept in isolation

No new lab needed — `.append`/`.pop` as a stack were already fully
proven in Lesson 5's `history` lab. What's new here isn't a data
structure; it's using *two* of them together, which the real code above
already shows directly.

### Discard the throwaway example

Not applicable.

### Mechanical walkthrough

- `self.redo_stack = []` — **(b) hard concept reappearing**: a second
  stack, same shape as `self.history`, starting empty.
- `self.redo_stack.append(command)` inside `undo_last()` — **(b) hard
  concept reappearing**: the same `append`-as-push from Lesson 5, now
  pushing the just-undone command onto the *other* stack instead of
  discarding it.
- `def redo_last(self):` / `command = self.redo_stack.pop()` — **(b)
  hard concept reappearing**, popping from `redo_stack` instead of
  `history`.
- `command.execute()` — **(b) hard concept reappearing**: the exact same
  method from Lesson 5's Command objects — redoing an action is
  literally re-running its `execute()`, nothing new needed on
  `AddTaskCommand`/`CompleteTaskCommand` at all.
- `self.history.append(command)` inside `redo_last()` — **(b) hard
  concept reappearing**: the redone command goes back onto `history`,
  making it eligible to be undone again later.
- `self.redo_stack = []` inside `run()` — **(a) first appearance,
  conceptually, though not syntactically**: this line doesn't introduce
  new syntax, but it encodes a real design decision worth calling out
  on its own — covered fully below, since it's easy to read as
  incidental cleanup when it's actually load-bearing correctness.

### CS lens

Two stacks working against each other like this is a common enough
shape to be worth naming on its own: it's sometimes called the **two
stack undo/redo** pattern. Also recognized in: every text editor's
Ctrl+Z/Ctrl+Y, a browser's back/forward buttons (two separate histories,
one for each direction), a version control system's stash — pop.

### SE lens

The subtle design decision here — the one thing this unit's Problem
section didn't ask for outright — is `run()` clearing `redo_stack`
every time a *new* action happens. Without that line, imagine: undo an
action, then take a completely different new action, then hit redo —
redo would reapply a command whose `undo()`/`execute()` assumptions
(like `CompleteTaskCommand`'s `self.index`) might no longer point at
what the user expects, since the task list has changed underneath it in
the meantime. Clearing `redo_stack` on any new action is the standard
choice nearly every real undo/redo system makes, for exactly this
reason: redo history is only trustworthy as long as nothing has
diverged from the state it was captured against. The alternative —
letting stale redo entries linger — is not a simpler version of the same
feature; it's a real correctness bug waiting for the right sequence of
actions to expose it.

### Commands needed

None new — same `python3 <file>.py` pattern.

### Run it

```python
tl = TaskList()
tl.run(AddTaskCommand(tl, "Write lesson 6"))
tl.run(AddTaskCommand(tl, "Buy groceries"))
tl.run(CompleteTaskCommand(tl, 0))

print("--- after two adds and one complete ---")
for t in tl.tasks:
    print(t.summary())

tl.undo_last()
print("--- after undoing the complete ---")
for t in tl.tasks:
    print(t.summary())

tl.redo_last()
print("--- after redoing the complete ---")
for t in tl.tasks:
    print(t.summary())

tl.undo_last()
tl.run(AddTaskCommand(tl, "Call the dentist"))
print("--- after undo, then a NEW action ---")
for t in tl.tasks:
    print(t.summary())

print("--- trying to redo after a new action ---")
try:
    tl.redo_last()
except IndexError as e:
    print("IndexError:", e)
```

Real output:

```
--- after two adds and one complete ---
[x] Write lesson 6
[ ] Buy groceries
--- after undoing the complete ---
[ ] Write lesson 6
[ ] Buy groceries
--- after redoing the complete ---
[x] Write lesson 6
[ ] Buy groceries
--- after undo, then a NEW action ---
[ ] Write lesson 6
[ ] Buy groceries
[ ] Call the dentist
--- trying to redo after a new action ---
IndexError: pop from empty list
```

That last block is the SE lens proven, not just asserted: after
undoing, then taking a *new* action, `redo_stack` is genuinely empty —
`run()`'s clearing line did its job — so `redo_last()` fails the same
honest way `undo_last()` did on an empty history in Lesson 5, rather
than silently reapplying a now-stale command.

### Connecting sentence

Undo and redo are now two mirror-image operations on two mirror-image
stacks, kept correctly in sync with each other by one small but
deliberate rule: any new action forfeits the chance to redo what came
before it.

---

## Concept Unit: Finding a Task by Name

### The Problem

Every task so far has been found by *position* —
`CompleteTaskCommand(tl, 0)` means "the task at index 0." That's fine
when you're looking right at a printed list and counting, but a real
interface (a search box, a CLI `find` command) needs to look a task up
by what a user actually knows: its title. Nothing on `TaskList` can do
that yet.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `tasklist.py`.
- **Change type** — add.
- **Location** — inside `class TaskList`, new method.
- **Dependencies** — none new.

### The New Code

```python
    def find_by_title(self, title):
        for task in self.tasks:
            if task.title == title:
                return task
        return None
```

### The Updated Project

```python
class TaskList:
    def __init__(self):
        self.tasks = []
        self.history = []
        self.redo_stack = []

    def run(self, command):
        command.execute()
        self.history.append(command)
        self.redo_stack = []

    def undo_last(self):
        command = self.history.pop()
        command.undo()
        self.redo_stack.append(command)

    def redo_last(self):
        command = self.redo_stack.pop()
        command.execute()
        self.history.append(command)

    def find_by_title(self, title):              # ← new
        for task in self.tasks:                   # ← new
            if task.title == title:                # ← new
                return task                         # ← new
        return None                                 # ← new
```

`TaskList` can now answer "is there a task called X, and if so, which
object is it?" — without the caller ever needing to know or care what
position it's sitting at.

### Introduce the concept in isolation

```python
names = ["Ravi", "Sam", "Priya", "Wei", "Ana"]

target = "Wei"
steps = 0
found = None

for name in names:
    steps += 1
    if name == target:
        found = name
        break

print(found, "found after", steps, "steps")
```

Real output:

```
Wei found after 4 steps
```

This is called **linear search**: checking items one at a time, in
order, until a match is found (or the list runs out). The instrumented
`steps` counter here proves something specific — finding `"Wei"` took
exactly 4 comparisons, because it happened to sit fourth in the list.
Had it been first, it would've taken 1; had it been missing entirely,
it would've taken all 5 and found nothing. `find_by_title` in the real
code does exactly this same one-at-a-time walk, via the `for` loop and
`==` comparison, just without an explicit counter — `break` there is
replaced by `return task`, which exits the method immediately the
moment a match is found, the same way `break` exits a loop immediately.

### Discard the throwaway example

`names`/`steps`/`found` above are deleted — they only existed to make
linear search's step-by-step nature countable and visible, isolated
from `Task`/`TaskList` entirely.

### Mechanical walkthrough

- `def find_by_title(self, title):` — **(c) already basic.**
- `for task in self.tasks:` — **(b) hard concept reappearing**, the
  same `for` loop over a list from Lesson 2.
- `if task.title == title:` — **(c) already basic**, attribute access
  and equality comparison, both already established.
- `return task` — **(a) first appearance** of `return` inside a loop:
  because `return` exits the *entire method* immediately, not just the
  loop, this stops checking further items the moment a match is found —
  the exact behavior `break` demonstrated in the isolated lab, just
  exiting a function instead of a loop.
- `return None` — **(a) first appearance** of `None` in this
  curriculum: Python's explicit "no value" — reached only if the loop
  finishes without ever hitting the `return task` line above it, meaning
  every task was checked and none matched.

### Execution trace

Given `tl.tasks` holding `["Write lesson 6", "Buy groceries", "Call
the dentist"]` (as titles) and `find_by_title("Buy groceries")`:

1. `for task in self.tasks:` binds `task` to the first task,
   `"Write lesson 6"` — its `if task.title == title:` compares
   `"Write lesson 6" == "Buy groceries"`, which is `False`, so the loop
   continues without returning.
2. `task` becomes the second task, `"Buy groceries"` — the comparison
   is now `"Buy groceries" == "Buy groceries"`, `True`, so `return task`
   fires immediately, handing back this exact task object without ever
   looking at the third.

### CS lens

Linear search's real cost scales directly with how many items exist: in
the worst case — the target is last, or missing entirely — every single
item gets checked. Measuring this for real, on a `TaskList` with
200,000 tasks, searching for the very last one:

```
Task 199999
4.30 ms to find the last task among 200,000
```

Four milliseconds isn't dramatic on its own — but it's four milliseconds
*per search*, and it scales linearly: a million tasks would take roughly
five times as long, ten million roughly fifty times as long, because
every added task means one more item that might need checking before
the target is found. This growth rate is called **O(n)** — proportional
to the number of items, `n`. Also recognized in: scanning an unindexed
database column, `Array.prototype.find` in JavaScript, `grep` reading a
file top to bottom.

### SE lens

For a personal task manager with a few dozen or a few hundred tasks,
`find_by_title`'s linear scan is genuinely fine — four milliseconds at
200,000 tasks is nowhere near that scale, and writing anything fancier
right now would be solving a problem this project doesn't actually have
yet. That's a real engineering call, not laziness: optimizing before a
cost is actually felt tends to add complexity for no real benefit. The
honest debt being named, on purpose, the same way Lesson 2 and Lesson 5
each named theirs: if this project's task list ever needs to hold
tens of thousands of tasks with search happening constantly — Project
3's own premise, "search through 50,000 users" — linear search's O(n)
cost becomes the actual bottleneck, and the fix is a **hash-based
index**: a `dict` mapping titles directly to tasks, turning "check every
item" into "look the key up directly." That's Project 3's problem to
solve, deliberately not this one's.

### Commands needed

`python3 find_demo.py` — same pattern.

### Run it

```python
tl = TaskList()
tl.run(AddTaskCommand(tl, "Write lesson 6"))
tl.run(AddTaskCommand(tl, "Buy groceries"))
tl.run(AddTaskCommand(tl, "Call the dentist"))

found = tl.find_by_title("Buy groceries")
print(found.summary())

missing = tl.find_by_title("Learn Rust")
print(missing)
```

```
[ ] Buy groceries
None
```

The second line proves `find_by_title` really does return `None` — not
crash, not return some placeholder — when nothing matches, exactly as
the code's last line promises.

### Connecting sentence

`TaskList` can now be searched by name, correctly, for exactly the scale
this project actually operates at — and the specific, measured reason
it won't stay correct-and-fast forever is now on the record, waiting for
the project that will actually need to fix it.

---

## Closing

**Connect the pieces.** One task, through everything built across
Lessons 5 and 6: `AddTaskCommand(tl, "Buy groceries")` is run, appending
a `Task` and pushing the command onto `history`; `find_by_title("Buy
groceries")` walks `tasks` linearly and returns that exact object;
`CompleteTaskCommand(tl, 1)` marks it done and is pushed onto `history`
too; `undo_last()` pops that completion off `history`, reverses it, and
pushes it onto `redo_stack`; `redo_last()` pops it back off
`redo_stack`, re-executes it, and returns it to `history` — the same
task, found by name, toggled, undone, and redone, using four different
methods that never once needed to know about each other's internals.

**What breaks without this.** The two-stack correctness rule from this
lesson's first unit, made concrete: comment out `self.redo_stack = []`
inside `run()`, then repeat the "undo, then a new action, then redo"
sequence from that unit's Run It section. Instead of the honest
`IndexError` shown there, `redo_last()` would silently succeed — popping
and re-executing a command whose assumptions about the task list's
current shape are no longer guaranteed to hold. Restore the clearing
line, and `redo_last()` goes back to failing loudly and correctly in
that situation instead of succeeding incorrectly. (This is deliberately
left as an exercise below rather than shown with real output here — the
danger is exactly that it *doesn't* crash, which is a case worth finding
yourself.)

**Exercises.**
1. Comment out `self.redo_stack = []` in `run()`, reproduce the "undo,
   new action, redo" sequence from this lesson, and observe — in your
   own words — what happens differently. Restore the line afterward.
2. Add a `pytest` test (Lesson 4) proving that `run()` then `undo_last()`
   then `redo_last()` leaves `tl.tasks` in exactly the same state as
   just `run()` alone.
3. `find_by_title` currently requires an exact match. Change it to a
   case-insensitive match (`"buy groceries"` should still find `"Buy
   groceries"`) — look up Python string methods for changing case.

**Definition of done.**
- [ ] `TaskList` has a working `redo_stack`, `redo_last()`, and a
      `run()` that clears it, all confirmed against the exact output
      sequence shown above.
- [ ] `find_by_title` exists, returns the right task when one matches,
      and returns `None` when nothing does — both confirmed with real
      output.
- [ ] You can state, from the measured 200,000-task run, why linear
      search's cost is proportional to the number of tasks, not fixed.
- [ ] Commit with a message explaining why — e.g. `"Add a redo stack
      that's invalidated by new actions, and a linear find_by_title
      accepted as fine at this project's scale"` — not `"add redo and
      search"`.

**Next lesson** finishes Project 2 with the **Observer** pattern — a
way for something to be notified automatically whenever a task changes,
without `TaskList` needing to know in advance who's listening — plus a
first look at a **priority queue**, once tasks need an urgency order
that isn't just insertion order.
