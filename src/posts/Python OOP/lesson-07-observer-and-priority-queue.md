# Lesson 7: Who Needs to Know, and What's Next
### (Project 2 — Task Manager, Python)

**What you will build.** `TaskList` gains a way for other objects to
react automatically whenever a task is added or completed — a console
notifier and an activity log, both reacting to the exact same events
without `TaskList` or the `Command` classes knowing either one exists —
and, using that same mechanism, an urgency queue that always knows which
pending task is most important, without ever re-sorting the whole task
list to find out. The transferable problems this lesson is actually
about: decoupling "something happened" from "here's everyone who cares,"
and picking a data structure whose *shape* matches the actual question
being asked — "what's most urgent right now?" — instead of one that just
happens to hold the data.

**What you need to know first.** Lesson 5 — `Command` objects and
`TaskList.run()`. Lesson 6 — the `history`/`redo_stack` pair.

---

## Concept Unit: The Observer Pattern

### The Problem

Right now, `TaskList.run()` only does one thing per action: execute the
command and record it in history. If we wanted the console to print a
message every time a task is added — and, separately, keep a running log
of everything that's happened — the obvious first move is adding `print(...)`
calls directly inside `AddTaskCommand.execute()` and
`CompleteTaskCommand.execute()`. That works for exactly one kind of
reaction. The moment a second one is needed (the activity log), every
command class needs editing again, and a third need means editing them a
third time — the commands would end up doing double duty, both
performing the action *and* knowing about every single thing that might
want to hear about it.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `observers.py`; modified `tasklist.py`,
  `commands.py`.
- **Change type** — add (new file, new methods); refactor (`run()`).
- **Location** — `TaskList` gains `observers`, `add_observer`,
  `notify`; `run()` calls `notify` after executing; `Command` classes
  each gain an `event` name and a `target_task()` method.
- **Dependencies** — `commands.py`, Lessons 5–6.

### The New Code

```python
class ConsoleNotifier:
    def on_event(self, event, task):
        print(f"[notify] {event}: {task.title}")


class ActivityLog:
    def __init__(self):
        self.entries = []

    def on_event(self, event, task):
        self.entries.append(f"{event}: {task.title}")
```

and, inside `TaskList`:

```python
    def add_observer(self, observer):
        self.observers.append(observer)

    def notify(self, event, task):
        for observer in self.observers:
            observer.on_event(event, task)
```

and one added line inside `run()`:

```python
    def run(self, command):
        command.execute()
        self.history.append(command)
        self.redo_stack = []
        self.notify(command.event, command.target_task())
```

### The Updated Project

`tasklist.py`, in full:

```python
class TaskList:
    def __init__(self):
        self.tasks = []
        self.history = []
        self.redo_stack = []
        self.observers = []                              # ← new

    def add_observer(self, observer):                     # ← new
        self.observers.append(observer)                    # ← new

    def notify(self, event, task):                          # ← new
        for observer in self.observers:                     # ← new
            observer.on_event(event, task)                    # ← new

    def run(self, command):
        command.execute()
        self.history.append(command)
        self.redo_stack = []
        self.notify(command.event, command.target_task())    # ← new

    def undo_last(self):
        command = self.history.pop()
        command.undo()
        self.redo_stack.append(command)

    def redo_last(self):
        command = self.redo_stack.pop()
        command.execute()
        self.history.append(command)

    def find_by_title(self, title):
        for task in self.tasks:
            if task.title == title:
                return task
        return None
```

`AddTaskCommand`, updated so `notify()` has something to report:

```python
class AddTaskCommand:
    event = "added"                                        # ← new

    def __init__(self, task_list, title, priority=3):
        self.task_list = task_list
        self.title = title
        self.priority = priority

    def execute(self):
        self.task = Task(self.title, priority=self.priority)   # ← changed
        self.task_list.tasks.append(self.task)                 # ← changed

    def undo(self):
        self.task_list.tasks.pop()

    def target_task(self):                                  # ← new
        return self.task                                     # ← new
```

`CompleteTaskCommand` gains the matching pieces:

```python
class CompleteTaskCommand:
    event = "completed"                                     # ← new

    def __init__(self, task_list, index):
        self.task_list = task_list
        self.index = index

    def execute(self):
        self.previous = self.task_list.tasks[self.index].done
        self.task_list.tasks[self.index].done = True

    def undo(self):
        self.task_list.tasks[self.index].done = self.previous

    def target_task(self):                                   # ← new
        return self.task_list.tasks[self.index]               # ← new
```

Every `run()` now, after performing the action, tells every registered
observer exactly what happened and to which task — and neither `Command`
class needs to know or care who's listening, or how many observers
there are.

### Introduce the concept in isolation

```python
class NewsFeed:
    def __init__(self):
        self.subscribers = []

    def subscribe(self, subscriber):
        self.subscribers.append(subscriber)

    def publish(self, headline):
        for subscriber in self.subscribers:
            subscriber.on_headline(headline)


class PrintSubscriber:
    def on_headline(self, headline):
        print("Got headline:", headline)


feed = NewsFeed()
feed.subscribe(PrintSubscriber())
feed.subscribe(PrintSubscriber())
feed.publish("Local team wins championship")
```

Real output:

```
Got headline: Local team wins championship
Got headline: Local team wins championship
```

One `publish()` call, and the same headline reached *two* separate
subscriber objects — proving `NewsFeed` never needed to know how many
subscribers existed, or anything about what they'd do with a headline;
it only needed to loop over whatever list of subscribers happened to be
registered at the time. This is called the **Observer pattern**:
`NewsFeed` is the **subject**, `PrintSubscriber` is an **observer**, and
`subscribe()`/`publish()` here are exactly what `add_observer()`/`notify()`
do in the real code above — `TaskList` is the subject, `ConsoleNotifier`
and `ActivityLog` are two independent observers, each reacting to the
same events in its own way.

### Discard the throwaway example

`NewsFeed`/`PrintSubscriber` are deleted — they only existed to prove
one event reaching multiple independent listeners through one shared
list, isolated from `TaskList` and `Command` entirely.

### Mechanical walkthrough

- `self.observers = []` — **(b) hard concept reappearing**, an empty
  list used to hold registered listeners, same shape as
  `NewsFeed.subscribers` in the isolated lab.
- `def add_observer(self, observer): self.observers.append(observer)` —
  **(b) hard concept reappearing**, the same registration pattern as
  `subscribe()`.
- `def notify(self, event, task):` / `for observer in self.observers:
  observer.on_event(event, task)` — **(b) hard concept reappearing**,
  the same broadcast loop as `publish()`, just handing each observer two
  pieces of information (what happened, and to which task) instead of
  one headline string.
- `event = "added"` (class-level, on `AddTaskCommand`) — **(a) first
  appearance** of a **class attribute**: unlike `self.title` or
  `self.task`, which are set fresh on each individual instance inside
  `__init__`, `event = "added"` is written directly inside the class
  body and shared by every `AddTaskCommand` instance automatically —
  appropriate here because *every* `AddTaskCommand` really does
  represent the same kind of event, unlike `title`, which differs per
  instance.
- `self.task = Task(...)` inside `execute()` — **(a) first appearance**
  of storing a *result* on `self` for later retrieval: previously,
  `execute()` only ever changed something and returned nothing; now it
  also remembers what it created, specifically so `target_task()` can
  hand it back afterward.
- `def target_task(self): return self.task` — **(a) first appearance.**
  A small but real design decision: `notify()` needs an actual `Task`
  object to report on, and the two `Command` classes are the only
  things that know exactly which one is relevant to their own action —
  `AddTaskCommand`'s newly created one, `CompleteTaskCommand`'s
  indexed-into one — so each is given a uniform way to answer "which
  task was this about?"
- `self.notify(command.event, command.target_task())` inside `run()` —
  **(c) already basic**, calling two already-explained pieces together.

### CS lens

Observer is the pattern underneath almost every **event-driven**
system: a subject broadcasts that something happened, without needing
to know or care who — if anyone — is listening, or what they'll do
about it. Also recognized in: a DOM element's `addEventListener` in a
browser, a spreadsheet recalculating every dependent cell the instant
one cell changes, a stock ticker pushing price updates to every
connected client, Python's own `logging` module (handlers subscribe to
log events without the code doing the logging knowing they exist).

### SE lens

The alternative — hardcoded `print()` calls directly inside `execute()`
— was already rejected in this unit's Problem section, but it's worth
being precise about *why* it's worse, not just that it is: it couples
two things that have no real reason to know about each other — "how do I
add a task" and "who wants to be told a task was added." The Observer
version costs one extra layer of indirection (`notify()` calling
`on_event()` instead of a direct `print()`), and in exchange, adding a
third observer — an email notifier, say — means writing one new class
with an `on_event()` method and calling `add_observer()` once, with
zero changes to `Command` or `TaskList` itself. The real limit being
accepted: `notify()` is only called from `run()`, so `undo_last()` and
`redo_last()` currently happen silently, with no observer ever told
about them — a deliberate scope decision for this lesson, not an
oversight, and a natural next exercise.

### Commands needed

None new.

### Run it

```python
tl = TaskList()
log = ActivityLog()
tl.add_observer(ConsoleNotifier())
tl.add_observer(log)

tl.run(AddTaskCommand(tl, "Write lesson 7"))
tl.run(AddTaskCommand(tl, "Buy groceries"))
tl.run(CompleteTaskCommand(tl, 0))

print("--- activity log entries ---")
for entry in log.entries:
    print(entry)
```

Real output:

```
[notify] added: Write lesson 7
[notify] added: Buy groceries
[notify] completed: Write lesson 7
--- activity log entries ---
added: Write lesson 7
added: Buy groceries
completed: Write lesson 7
```

Two completely independent observers — one printing immediately, one
silently accumulating a list — both reacted to the exact same three
events, confirmed by the `ActivityLog`'s own `entries` matching what was
printed live.

### Connecting sentence

`TaskList` can now broadcast what happened to as many independent
listeners as needed — the next unit builds a third kind of listener,
one that doesn't just react to events, but uses them to maintain an
entirely different way of looking at the same tasks.

---

## Concept Unit: The Priority Queue

### The Problem

Every task so far has been treated as equally important — `next task to
work on` has never been a real question, because there hasn't been a
concept of urgency at all. Once tasks *do* have different priorities,
"what should I do next?" means "give me the single most urgent pending
task" — and answering that by sorting the entire task list every single
time it's asked would mean redoing that sort from scratch after every
new task, wasted work that grows every time the list does.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `task.py`; modified `observers.py`.
- **Change type** — add (`priority` field on `Task`; a new `UrgencyQueue`
  observer class).
- **Location** — `Task.__init__` gains `priority`; `observers.py` gains
  `UrgencyQueue`, alongside `ConsoleNotifier`/`ActivityLog` from the
  previous unit.
- **Dependencies** — `heapq`, part of the standard library.

### The New Code

```python
    def __init__(self, title, priority=3, done=False):
        self.title = title
        self.priority = priority
        self.done = done
```

```python
class UrgencyQueue:
    def __init__(self):
        self._heap = []
        self._counter = 0

    def on_event(self, event, task):
        if event == "added":
            self._counter += 1
            heapq.heappush(self._heap, (task.priority, self._counter, task))

    def next_task(self):
        priority, count, task = heapq.heappop(self._heap)
        return task
```

### The Updated Project

`task.py`, in full:

```python
class Task:
    def __init__(self, title, priority=3, done=False):    # ← changed
        self.title = title
        self.priority = priority                            # ← new
        self.done = done

    def summary(self):
        status = "x" if self.done else " "
        return f"[{status}] (p{self.priority}) {self.title}"  # ← changed
```

`observers.py`, in full:

```python
import heapq                                                # ← new


class ConsoleNotifier:
    def on_event(self, event, task):
        print(f"[notify] {event}: {task.title}")


class ActivityLog:
    def __init__(self):
        self.entries = []

    def on_event(self, event, task):
        self.entries.append(f"{event}: {task.title}")


class UrgencyQueue:                                          # ← new
    def __init__(self):                                       # ← new
        self._heap = []                                        # ← new
        self._counter = 0                                       # ← new

    def on_event(self, event, task):                            # ← new
        if event == "added":                                     # ← new
            self._counter += 1                                    # ← new
            heapq.heappush(self._heap, (task.priority, self._counter, task))  # ← new

    def next_task(self):                                          # ← new
        priority, count, task = heapq.heappop(self._heap)           # ← new
        return task                                                  # ← new
```

`UrgencyQueue` slots in exactly like `ConsoleNotifier` and `ActivityLog`
— registered the same way, notified through the exact same `notify()`
call — except instead of printing or logging, it maintains its own
private, always-correctly-ordered structure of pending tasks, ready to
hand back "the most urgent one" the instant it's asked, with no scanning
required at that moment.

### Introduce the concept in isolation

```python
import heapq

heap = []
heapq.heappush(heap, (3, "wash the car"))
heapq.heappush(heap, (1, "put out the kitchen fire"))
heapq.heappush(heap, (2, "reply to boss"))

print(heapq.heappop(heap))
print(heapq.heappop(heap))
print(heapq.heappop(heap))
```

Real output:

```
(1, 'put out the kitchen fire')
(2, 'reply to boss')
(3, 'wash the car')
```

Items were pushed in the order 3, 1, 2 — but popped back out in order 1,
2, 3, the *smallest* number first every time, regardless of the order
they were added. This is a **heap** (specifically, `heapq` implements a
**min-heap**): a structure that doesn't keep items in insertion order,
the way a list or the stacks from Lessons 5–6 do — it keeps them
organized so the smallest item is always instantly retrievable, no
matter how many items get added in between. This whole shape — "always
give me the most urgent thing next, cheaply, no matter how many things
are waiting" — is called a **priority queue**, and a heap is the
standard tool for building one.

But there's a real gap this simple lab hides: what if two tasks share
the *exact same* priority?

```python
import heapq
from task import Task

heap = []
heapq.heappush(heap, (2, Task("wash the car")))
heapq.heappush(heap, (2, Task("reply to boss")))
print(heapq.heappop(heap))
```

```
Traceback (most recent call last):
  File "tie_break_problem.py", line 6, in <module>
    heapq.heappush(heap, (2, Task("reply to boss")))
TypeError: '<' not supported between instances of 'Task' and 'Task'
```

When two priorities tie, `heapq` needs to compare the *next* item in the
tuple to decide order — and `Task` objects have no defined way to be
compared with `<`, so it crashes. The real `UrgencyQueue` code avoids
this on purpose: `(task.priority, self._counter, task)` puts an
always-increasing, always-unique `self._counter` *between* the priority
and the task, so any tie in priority gets broken by insertion order
(smaller counter, added earlier, wins) — and `heapq` never even reaches
the `task` itself to compare, because the counter already resolved the
tie first.

### Discard the throwaway example

Both `heap_lab.py` and `tie_break_problem.py` are deleted — the first
proved a heap pops smallest-first regardless of insertion order, the
second proved *why* the real code needs a tie-breaking counter, both
isolated from `TaskList` and `Command` entirely.

### Mechanical walkthrough

- `import heapq` — **(b) hard concept reappearing**, `import` from
  Lesson 2, a new standard-library module.
- `priority=3` in `Task.__init__` — **(b) hard concept reappearing**,
  a default argument, same mechanism as `done=False` from Lesson 5.
- `self._heap = []` — **(b) hard concept reappearing**, an empty list —
  used here specifically as the underlying storage `heapq`'s functions
  operate on.
- `self._counter = 0` — **(c) already basic.**
- `heapq.heappush(self._heap, (task.priority, self._counter, task))` —
  **(b) hard concept reappearing**: the exact call from the isolated
  lab, pushing a 3-item tuple instead of a 2-item one, for the
  tie-breaking reason just proven.
- `priority, count, task = heapq.heappop(self._heap)` — **(a) first
  appearance** of **tuple unpacking**: `heappop` returns one 3-item
  tuple, and writing three names separated by commas on the left of `=`
  assigns each position to its matching name in one line, instead of
  indexing into the tuple three separate times.
- `return task` — **(c) already basic** — note only `task` is returned;
  `priority` and `count` did their job inside the heap and aren't needed
  by the caller.

### CS lens

A binary heap gets both `heappush` and `heappop` done in time
proportional to the *logarithm* of the number of items — written
**O(log n)** — dramatically cheaper than sorting the whole list from
scratch (**O(n log n)**) every time a new task arrives or the next one
is requested. Also recognized in: an operating system's process
scheduler picking the next process to run, Dijkstra's shortest-path
algorithm always expanding the closest unvisited node next, an event
simulation always processing whichever scheduled event happens soonest.

### SE lens

The alternative — keeping `self._heap` as a plain list and calling
`sorted(...)` on it fresh every time `next_task()` is asked — would give
the exact same *answer*, but redo the entire ordering work from scratch
on every single call, even if nothing changed since the last call. A
heap keeps items *incrementally* organized as each one arrives, so
`next_task()` only ever has to do a small, bounded amount of work
regardless of how many tasks are waiting. The real cost being paid: a
heap only guarantees fast access to the *single smallest* item — asking
for "the top 5 most urgent tasks" or "all tasks sorted" isn't what a
heap is optimized for; that would call for actually sorting, on demand,
when that specific need arises.

### Commands needed

None new.

### Run it

```python
tl = TaskList()
urgent = UrgencyQueue()
tl.add_observer(urgent)

tl.run(AddTaskCommand(tl, "Wash the car", priority=3))
tl.run(AddTaskCommand(tl, "Put out the kitchen fire", priority=1))
tl.run(AddTaskCommand(tl, "Reply to boss", priority=2))
tl.run(AddTaskCommand(tl, "Water the plants", priority=3))

print(urgent.next_task().summary())
print(urgent.next_task().summary())
print(urgent.next_task().summary())
print(urgent.next_task().summary())
```

Real output:

```
[ ] (p1) Put out the kitchen fire
[ ] (p2) Reply to boss
[ ] (p3) Wash the car
[ ] (p3) Water the plants
```

Four tasks, added in an order that has nothing to do with urgency, come
back out lowest-priority-number-first — and the two tied-at-3 tasks,
"Wash the car" and "Water the plants," come back in the exact order they
were added, proving the counter tie-breaker is doing real, correct work,
not just avoiding a crash.

### Connecting sentence

`UrgencyQueue` never had to be told when a task was added — it's just
another observer, reacting to the same `"added"` event `ConsoleNotifier`
and `ActivityLog` already react to, and using that event to maintain a
completely different, purpose-built view of the same underlying tasks.

---

## Closing

**Connect the pieces.** One task, through this entire lesson: calling
`tl.run(AddTaskCommand(tl, "Put out the kitchen fire", priority=1))`
executes the command, which builds a `Task` and appends it to
`tl.tasks`; `run()` then calls `notify("added", that_task)`, which loops
over every registered observer — `ConsoleNotifier` prints it,
`ActivityLog` appends a string about it, and `UrgencyQueue` pushes
`(1, counter, that_task)` onto its own private heap. None of those three
observers know the other two exist; all three reacted to the exact same
single event, each doing something entirely different with it.

**What breaks without this.** Registering `UrgencyQueue` but never
calling `notify()` — comment out the `self.notify(...)` line inside
`run()` — and then call `next_task()`:

```
Traceback (most recent call last):
  File "urgency_demo.py", line 12, in <module>
    print(urgent.next_task().summary())
  File "observers.py", line 20, in next_task
    priority, count, task = heapq.heappop(self._heap)
IndexError: pop from empty list
```

That's `heapq.heappop` on a heap that was never fed anything — proof
that `UrgencyQueue` genuinely depends on `notify()` actually calling
`on_event()` for every add, not on some default population happening
automatically. Restore the `notify()` line and it works again.

**Exercises.**
1. Make `undo_last()` and `redo_last()` call `self.notify(...)` too
   (you'll need `"undone"`/`"redone"` event names) and update
   `ConsoleNotifier` to print something sensible for them.
2. Add a `remove_task(self, task)` method to `UrgencyQueue` that's
   correct even though a heap doesn't support efficiently removing an
   arbitrary item — the common real trick is marking the task "stale" in
   a set and skipping stale entries inside `next_task()` instead of
   trying to remove them from the heap directly.
3. Write a `pytest` test proving that four tasks added with priorities
   `[3, 1, 2, 3]` come back out of `next_task()` in the order
   `[1, 2, 3, 3]`, with the two priority-3 tasks in their original
   insertion order.

**Definition of done.**
- [ ] `TaskList` has working `add_observer`/`notify`, and `run()` calls
      `notify()` after every executed command.
- [ ] `ConsoleNotifier` and `ActivityLog` both react independently to
      the same events, confirmed with real output.
- [ ] `UrgencyQueue` is registered as an observer and `next_task()`
      returns tasks in true priority order, including a real tie
      resolved by insertion order, confirmed with real output.
- [ ] You've seen the real `TypeError` from comparing two `Task` objects
      directly, and can explain in one sentence why the counter fixes
      it.
- [ ] Commit with a message explaining why — e.g. `"Decouple task
      events from their listeners via Observer, and maintain urgency
      order incrementally via a heap instead of re-sorting"` — not
      `"add observers and priority queue"`.

**This closes Project 2.** Across Lessons 5–7, the task manager picked
up Command, a two-stack undo/redo, linear search (with its real,
measured limit named honestly), Observer, and a heap-backed priority
queue — five ideas, each one arriving because the previous lesson's
project genuinely needed it, not because a syllabus said "today: heaps."
**Project 3** moves to a Mini REST API — still Python — where routing,
request/response objects, and validation introduce Dependency
Injection and the Adapter pattern, and where "search through many
records" finally gets the hashing-based fix this lesson deliberately
deferred.
