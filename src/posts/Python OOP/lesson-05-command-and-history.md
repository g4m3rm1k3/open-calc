# Lesson 5: Actions You Can Take Back
### (Project 2 — Task Manager, Python)

**What you will build.** A new project — a `Task` object and a
`TaskList` — that starts, like Project 1's `Note`, by mutating its state
directly, then rebuilds that same behavior around actions represented as
objects, so that adding a task or completing one can be undone. The
transferable problems this lesson is actually about: why "just mutate
the object" quietly forecloses on undo before you've even noticed, and
how a stack — the simplest possible history — is exactly the right
shape for "undo the most recent thing" once actions stop being invisible
mutations and start being objects you can hold onto.

**What you need to know first.** Project 1, Lessons 1–4: defining a
class with `__init__` and instance methods (Lesson 1), storing many
objects in a list (Lesson 2), and automated testing with `pytest`
(Lesson 4) — this lesson's exercises will lean on that last one.
Project 1's `Repository`, CLI, and `Strategy` pattern aren't reused
directly here; Project 2 is a new, separate application.

---

## Concept Unit: The Task Object

### The Problem

Project 2 needs its own core object, the same way Project 1 needed
`Note`. A task is simpler than a note in one way — no body text needed
yet — but needs something `Note` never did: a way to track whether it's
been completed.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `task.py`.
- **Change type** — add.
- **Location** — new file, new project directory, separate from
  Project 1's files.
- **Dependencies** — none.

### The New Code

```python
class Task:
    def __init__(self, title, done=False):
        self.title = title
        self.done = done

    def summary(self):
        status = "x" if self.done else " "
        return f"[{status}] {self.title}"
```

### The Updated Project

Brand-new file, shown whole above — there's no larger enclosing
structure to place it inside yet.

### Introduce the concept in isolation

Every syntactic piece here was already isolated somewhere in Project
1 — `__init__` and instance methods in Lesson 1, default argument values
in Lesson 4's `make_note()`, f-strings in Lesson 1 — except one: the
`"x" if self.done else " "` expression. Isolated on its own:

```python
age = 15
label = "adult" if age >= 18 else "minor"
print(label)

age = 25
label = "adult" if age >= 18 else "minor"
print(label)
```

Real output:

```
minor
adult
```

Same line of code, two different ages, two different results — proving
`<value if condition else other_value>` evaluates the condition first
and picks one of the two values based on it, all as a single expression
with a result of its own, rather than a multi-line `if`/`else`
statement that just runs different code. This is called a **conditional
expression** (often called the **ternary operator**, from *ternary*
meaning "three parts": the condition, the true-case, and the
false-case). `"x" if self.done else " "` in `Task.summary()` above does
exactly this, picking between `"x"` and `" "` based on `self.done`, in
one line, as the value handed straight into the f-string.

### Discard the throwaway example

`age`/`label` above are deleted — they only existed to prove the
conditional expression picks between two values based on a condition,
isolated from `Task` entirely.

### Mechanical walkthrough

- `def __init__(self, title, done=False):` — **(b) hard concept
  reappearing**: the same constructor shape from Lesson 1, with a second
  parameter that has a default value, the same mechanism as
  `make_note()`'s defaults in Lesson 4.
- `done=False` — **(a) first appearance** of a boolean literal in this
  curriculum: `False` (and its counterpart `True`) is one of exactly two
  values of Python's boolean type, representing a yes/no, on/off state —
  here, "not completed yet" by default.
- `self.title = title` / `self.done = done` — **(c) already basic**,
  the same attribute-assignment pattern from Lesson 1.
- `def summary(self):` — **(c) already basic.**
- `status = "x" if self.done else " "` — **(a) first appearance**,
  covered above.
- `return f"[{status}] {self.title}"` — **(b) hard concept
  reappearing**, the same f-string mechanics from Lesson 1's `Note`.

### CS lens

Nothing beyond what Lesson 1 already covered for objects in general —
this unit is mostly assembling already-taught pieces into a second,
similarly-shaped class, which is worth naming plainly rather than
inventing a lens that isn't really there.

### SE lens

Notice `Task` deliberately doesn't reuse or inherit from `Note`, even
though both have a `title` and a `summary()` method. The alternative —
some shared `Item` base class both inherit from — would save a few lines
today, at the cost of coupling two genuinely different, independently-
evolving concepts (a note and a task) to a shared parent neither
actually needs yet. This project isn't choosing "no inheritance ever" as
a rule — it's choosing not to inherit *until* real, repeated duplication
actually shows up, which is a different, better-earned trigger than "two
classes happen to share one field."

### Commands needed

`python3 task.py`, same invocation pattern as every prior lesson.

### Run it

```python
if __name__ == "__main__":
    t = Task("Write lesson 5")
    print(t.summary())
    t.done = True
    print(t.summary())
```

```
[ ] Write lesson 5
[x] Write lesson 5
```

### Connecting sentence

`Task` can already represent "done" and "not done," and — as that last
line shows — flipping it is a one-line, direct mutation; the next unit
puts many of these in a list, and the unit after that is where that
directness stops being harmless.

---

## Concept Unit: A List of Tasks, Mutated Directly

### The Problem

One `Task` isn't a task manager — same gap as Lesson 2's very first
unit, one level up. We need somewhere to hold many tasks, and a way to
mark one of them complete by referring to it (by position, for now)
rather than holding onto the specific `Task` object by hand.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `tasklist.py`.
- **Change type** — add.
- **Location** — new file, alongside `task.py`.
- **Dependencies** — `task.py`, this lesson's first unit.

### The New Code

```python
from task import Task


class TaskList:
    def __init__(self):
        self.tasks = []

    def add_task(self, title):
        self.tasks.append(Task(title))

    def complete_task(self, index):
        self.tasks[index].done = True
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

No new syntax to isolate — every piece here (`[]`, `.append(...)`, `[]`
indexing, attribute assignment) was already proven in Project 1: the
list mechanics in Lesson 2's first unit, indexing in Lesson 4's
repository test. This unit is applying already-known pieces to a new
class, not introducing new ones — worth saying plainly rather than
manufacturing a lab for syntax that's already been earned.

### Discard the throwaway example

Not applicable.

### Mechanical walkthrough

- `from task import Task` — **(b) hard concept reappearing**, local
  import, Lesson 2.
- `def __init__(self): self.tasks = []` — **(b) hard concept
  reappearing**, the empty-list-as-starting-state pattern from
  `NoteRepository.__init__` in Lesson 2.
- `def add_task(self, title): self.tasks.append(Task(title))` — **(b)
  hard concept reappearing**, `append` from Lesson 2, `Task(...)` from
  this lesson's first unit.
- `def complete_task(self, index): self.tasks[index].done = True` —
  **(b) hard concept reappearing**: `[index]` indexing from Lesson 4,
  chained directly into `.done = True` — reaching *through* the list
  index straight into the specific `Task` object living there, and
  overwriting one of its attributes in place.

### CS lens

`self.tasks[index].done = True` is a direct, **in-place mutation**: the
`Task` object at that position is changed, permanently, the instant this
line runs, with nothing recorded about what it used to be. Also
recognized in: any `object.field = new_value` anywhere in any language —
this isn't exotic, it's the default way almost all object-oriented code
changes state.

### SE lens

There's no alternative being rejected yet — direct mutation is the
obvious, simplest way to change a task's status, and for a huge amount
of real code, it's exactly the right choice: not everything needs to be
undoable. The tradeoff only becomes real in the next unit, once "can the
user undo a mistake" becomes an actual requirement — worth naming here,
before it's solved, so the next unit's Problem section lands as a
genuine consequence of *this* choice, not an arbitrary new feature
request.

### Commands needed

`python3 tasklist.py`.

### Run it

```python
if __name__ == "__main__":
    tl = TaskList()
    tl.add_task("Write lesson 5")
    tl.add_task("Buy groceries")
    tl.complete_task(0)

    for t in tl.tasks:
        print(t.summary())
```

```
[x] Write lesson 5
[ ] Buy groceries
```

### Connecting sentence

`complete_task(0)` really did flip the first task's `done` flag,
permanently — and that permanence, which felt like a feature a moment
ago, is exactly the gap the next unit opens up.

---

## Concept Unit: The Command Pattern

### The Problem

`tl.complete_task(0)` from the last unit is a dead end the instant it
runs: `Task.done` becomes `True`, and nothing anywhere remembers what it
was *before*. If a user marks the wrong task complete by mistake — a
guaranteed, ordinary occurrence in any real task manager — there is
currently no way to undo it, because the action itself was never
recorded as anything; it was just a line of code that ran once and left
no trace of having run.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `commands.py`.
- **Change type** — add.
- **Location** — new file, alongside `task.py` and `tasklist.py`.
- **Dependencies** — `task.py`.

### The New Code

```python
from task import Task


class AddTaskCommand:
    def __init__(self, task_list, title):
        self.task_list = task_list
        self.title = title

    def execute(self):
        self.task_list.tasks.append(Task(self.title))

    def undo(self):
        self.task_list.tasks.pop()


class CompleteTaskCommand:
    def __init__(self, task_list, index):
        self.task_list = task_list
        self.index = index

    def execute(self):
        self.previous = self.task_list.tasks[self.index].done
        self.task_list.tasks[self.index].done = True

    def undo(self):
        self.task_list.tasks[self.index].done = self.previous
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

```python
class Light:
    def __init__(self):
        self.is_on = False


class TurnOnCommand:
    def __init__(self, light):
        self.light = light

    def execute(self):
        self.previous = self.light.is_on
        self.light.is_on = True

    def undo(self):
        self.light.is_on = self.previous


light = Light()
cmd = TurnOnCommand(light)

cmd.execute()
print(light.is_on)

cmd.undo()
print(light.is_on)
```

Real output:

```
True
False
```

`cmd.execute()` flips `light.is_on` to `True`, and `cmd.undo()` flips it
back to `False` — but the crucial detail is *how* `undo()` knows what to
flip it back to: `execute()` saved the old value into `self.previous`
*before* changing anything, so `undo()` has something real to restore,
rather than guessing or hardcoding `False`. This is called a **Command
object** (giving this whole approach its name, the **Command pattern**):
instead of a plain function call that changes state and leaves no
trace, the action itself becomes an object, capable of remembering
enough about what it did to reverse itself. `AddTaskCommand` and
`CompleteTaskCommand` in the real code above do exactly this — the
second one, especially, mirrors `TurnOnCommand` almost line for line:
`execute()` stashes the old `done` value in `self.previous` before
overwriting it, so `undo()` has the real prior state to restore, not a
guess.

### Discard the throwaway example

`Light`/`TurnOnCommand` are deleted — they only existed to prove a
Command object can reverse its own effect by remembering state before
changing it, isolated from `Task` and `TaskList` entirely.

### Mechanical walkthrough

- `class AddTaskCommand:` / `class CompleteTaskCommand:` — **(c)
  already basic**, plain class definitions.
- `def __init__(self, task_list, title):` (and the `index` version) —
  **(c) already basic** constructor shape — notably, these constructors
  don't perform the action; they only store what they'll need later.
- `def execute(self): self.task_list.tasks.append(Task(self.title))` —
  **(b) hard concept reappearing**: the actual mutation, identical to
  `TaskList.add_task` from the previous unit, just triggered by calling
  `execute()` instead of `add_task()` directly.
- `def undo(self): self.task_list.tasks.pop()` — **(a) first
  appearance** of `.pop()` with no argument: removes and discards the
  *last* item in the list — the exact task `execute()` just added,
  since nothing else has been appended since.
- `def execute(self):` (on `CompleteTaskCommand`) — `self.previous =
  self.task_list.tasks[self.index].done` — **(b) hard concept
  reappearing**, the same pattern proven in the isolated `Light` lab:
  save the old value before overwriting it.
- `self.task_list.tasks[self.index].done = True` — **(b) hard concept
  reappearing**, the exact mutation from `TaskList.complete_task`.
- `def undo(self): self.task_list.tasks[self.index].done =
  self.previous` — **(b) hard concept reappearing**, restoring the
  saved value, same as the `Light` lab's `undo()`.

### CS lens

The Command pattern's core idea is **reification**: turning something
that would otherwise just *happen* — a function call, an event, a
mutation — into a first-class object you can store, pass around, queue,
log, or reverse. Also recognized in: a game engine's input-remapping
system (each keypress maps to a Command object, not a hardcoded
function call), a database transaction log (each write is recorded as
an object before being applied, so it can be rolled back), a GUI
toolkit's menu actions, which are almost always Command objects under
the hood specifically so the same action can be triggered by a menu
click, a keyboard shortcut, and a toolbar button without three separate
implementations.

### SE lens

The alternative — this lesson's own previous unit — is calling
`tl.complete_task(0)` directly and moving on. That's simpler to read and
simpler to write, and for an action that never needs to be undone, it's
still the right choice; not every mutation deserves to become a Command
object. The cost of the Command version is real: two extra classes, and
every caller now constructs a command object and calls `.execute()`
instead of calling a method directly — more ceremony for the exact same
end result, `Task.done` becoming `True`. That ceremony only pays for
itself once something needs to *use* the fact that the action is now an
object instead of a vanished function call — which is precisely what
the next unit does.

### Commands needed

None new yet — these classes aren't wired to anything runnable on their
own until the next unit.

### Run it

Deferred to the next unit — a bare `AddTaskCommand` or
`CompleteTaskCommand`, executed alone with nothing tracking it
afterward, would behave identically to this lesson's previous unit and
wouldn't demonstrate anything this unit didn't already prove with
`Light`.

### Connecting sentence

Actions are now objects that remember how to reverse themselves — what's
still missing is something that remembers *which* actions happened, and
in what order, so undo can be automatic instead of the caller having to
hold onto the right command object by hand.

---

## Concept Unit: A Stack of Executed Commands

### The Problem

Even with `AddTaskCommand`/`CompleteTaskCommand` able to undo
themselves, nothing yet decides *which* command to undo when the user
asks. If several actions have happened in a row, "undo" should mean "undo
the most recent one" — and specifically, if that one is undone too, the
*next* undo should reverse the one before it, walking backward through
history in the exact reverse of the order things happened.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `tasklist.py`.
- **Change type** — replace.
- **Location** — `class TaskList`, entire class body.
- **Dependencies** — `commands.py`, this lesson's previous unit.

### The New Code

```python
class TaskList:
    def __init__(self):
        self.tasks = []
        self.history = []

    def run(self, command):
        command.execute()
        self.history.append(command)

    def undo_last(self):
        command = self.history.pop()
        command.undo()
```

### The Updated Project

```python
class TaskList:
    def __init__(self):
        self.tasks = []
        self.history = []                    # ← new

    def run(self, command):                  # ← new
        command.execute()                    # ← new
        self.history.append(command)         # ← new

    def undo_last(self):                     # ← new
        command = self.history.pop()         # ← new
        command.undo()                       # ← new
```

`add_task`/`complete_task` are gone entirely — `TaskList` no longer
mutates tasks itself at all. Every change now goes through `run(command)`,
which both performs the action and remembers it; `undo_last()` reverses
whatever was most recently remembered.

### Introduce the concept in isolation

```python
history = []

history.append("first")
history.append("second")
history.append("third")

print(history.pop())
print(history.pop())
print(history)
```

Real output:

```
third
second
['first']
```

`.pop()` — used here with no index, same as `AddTaskCommand.undo()` — 
always removes and returns the *last* item added, and each call in turn
peels off items in the exact reverse of the order they went in: third
first, then second, leaving only the first item behind. Adding always
happens at one end (`.append`), and removing always happens at that
*same* end (`.pop()`), which is what makes this a **stack**: a
Last-In-First-Out (LIFO) structure. `self.history.append(command)` in
`run()` and `self.history.pop()` in `undo_last()` are exactly this
`append`/`pop` pair, and that LIFO ordering is precisely "undo reverses
the most recent action first" — the property this unit's Problem section
needed, for free, just from picking the right data structure.

### Discard the throwaway example

The plain `history` list above is deleted — it only existed to prove
`append`/`pop` together behave as a LIFO stack, isolated from `Command`
objects entirely.

### Mechanical walkthrough

- `self.history = []` — **(b) hard concept reappearing**, an empty
  list, same as `self.tasks` — but conceptually different: this list is
  being used specifically *as a stack*, not as a general growable
  collection browsed in order.
- `def run(self, command):` — **(a) first appearance** of a method that
  takes another object — here, a `Command` — as an argument and calls
  methods on it, rather than acting on its own data directly.
- `command.execute()` — **(b) hard concept reappearing**, calling the
  method proven in the previous unit's isolated lab and real code.
- `self.history.append(command)` — **(b) hard concept reappearing**,
  the push half of the stack, proven in the isolated lab above.
- `def undo_last(self):` / `command = self.history.pop()` — **(b) hard
  concept reappearing**, the pop half, same lab.
- `command.undo()` — **(b) hard concept reappearing**, calling the
  reversal method the previous unit built.

### CS lens

This is a **stack**, used here for exactly the job stacks are famous
for: undo history. Also recognized in: a browser's back button (each
page visited is pushed; back pops the most recent), a function call
stack itself (each call pushes a frame; returning pops it), a text
editor's undo buffer, the `Ctrl+Z` behavior in nearly every piece of
creative software that has one.

### SE lens

The alternative — the previous unit's dead end — is a caller holding
onto whichever `Command` object it just created, itself, and calling
`.undo()` on it by hand whenever needed. That falls apart the moment
more than one action has happened: the caller would need its own list to
track them in order, which is exactly what `TaskList.history` now does,
centrally, once, instead of being reinvented by every caller. The real
limit being accepted here, worth stating honestly: this stack only
supports undoing the single most recent action — there's no "redo" yet
(that needs a second stack, holding undone commands), and no way to jump
back further than one step at a time without popping through everything
in between. Both are real, solvable gaps, not solved in this lesson.

### Commands needed

`python3 demo.py` (a small script wiring `TaskList` and the two command
classes together — shown below).

### Run it

```python
from tasklist import TaskList
from commands import AddTaskCommand, CompleteTaskCommand

tl = TaskList()
tl.run(AddTaskCommand(tl, "Write lesson 5"))
tl.run(AddTaskCommand(tl, "Buy groceries"))
tl.run(CompleteTaskCommand(tl, 0))

print("--- after two adds and one complete ---")
for t in tl.tasks:
    print(t.summary())

tl.undo_last()
print("--- after undoing the complete ---")
for t in tl.tasks:
    print(t.summary())

tl.undo_last()
print("--- after undoing the second add ---")
for t in tl.tasks:
    print(t.summary())
```

Real output:

```
--- after two adds and one complete ---
[x] Write lesson 5
[ ] Buy groceries
--- after undoing the complete ---
[ ] Write lesson 5
[ ] Buy groceries
--- after undoing the second add ---
[ ] Write lesson 5
```

Notice the second undo reversed *"Buy groceries" being added* — the
second action taken — not the completion again; the stack's LIFO order
is doing exactly the job it was chosen for.

### Connecting sentence

Every action run through `TaskList.run()` is now remembered in the exact
order it happened, and `undo_last()` walks backward through that order
one step at a time — Command objects gave actions a shape that *can* be
undone; the stack is what actually decides *which* one gets undone,
automatically, when the user asks.

---

## Closing

**Connect the pieces.** Follow one action all the way through: calling
`tl.run(CompleteTaskCommand(tl, 0))` builds a `CompleteTaskCommand`
holding a reference to `tl` and the index `0`; `run()` calls its
`execute()`, which saves the task's current `done` value into
`self.previous` and then sets it `True`; `run()` then appends that same
command object onto `tl.history`. Later, `tl.undo_last()` pops that
exact object back off `tl.history` and calls its `undo()`, which reads
`self.previous` — still sitting on that same object, untouched since
`execute()` ran — and writes it back onto the task. The command object
is the thread connecting the moment an action happened to the moment,
arbitrarily later, that it gets reversed.

**What breaks without this.** Call `undo_last()` on a `TaskList` that's
never had anything run through it:

```
Traceback (most recent call last):
  File "break_demo.py", line 4, in <module>
    tl.undo_last()
  File "tasklist.py", line 11, in undo_last
    command = self.history.pop()
              ^^^^^^^^^^^^^^^^^^
IndexError: pop from empty list
```

That's `.pop()` refusing to remove something from a stack that has
nothing on it — proof that `undo_last()` genuinely depends on
`self.history` actually holding a command, not on some default
no-op standing in for an empty stack. (Worth naming honestly, the same
way Lesson 2 named its own gap: a real task manager needs to handle
"nothing left to undo" gracefully, with a message, not a crash — that's
a real fix this lesson is leaving for the exercises, not silently
ignoring.)

**Exercises.**
1. Fix the crash above: make `undo_last()` do nothing (or print a
   message) instead of raising `IndexError` when `self.history` is
   empty — check its length before popping.
2. Add a `DeleteTaskCommand`, following the same `execute`/`undo` shape
   as `AddTaskCommand` — think carefully about what `undo()` needs to
   remember to bring a deleted task back in the same position.
3. Write a `pytest` test (Lesson 4) proving that running an
   `AddTaskCommand` followed by `undo_last()` leaves `tl.tasks` exactly
   as it was before — same length, same contents.

**Definition of done.**
- [ ] `task.py`, `tasklist.py`, and `commands.py` exist, and `demo.py`'s
      full add/complete/undo/undo sequence runs, producing the exact
      output shown above.
- [ ] You can explain, in one sentence, why `.append`/`.pop` together
      give "undo the most recent action" for free, without writing any
      ordering logic yourself.
- [ ] You've triggered the real `IndexError` from undoing with an empty
      history, and understand why it happens.
- [ ] Commit with a message explaining why — e.g. `"Represent task
      actions as Command objects with a history stack, so actions can
      be undone in the order they happened"` — not `"add undo"`.

**Next lesson** stays in Project 2 and adds `redo` — a second stack
holding undone commands — and search, where enough tasks accumulating
starts to make a plain list's linear scan worth replacing.
