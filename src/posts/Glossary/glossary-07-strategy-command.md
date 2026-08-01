# Behavior Objects: Strategy, Command

## What you will build

Two runnable programs, in both Python and TypeScript, showing two
different ways to turn *behavior itself* into something you can store,
swap, queue, and pass around — rather than hard-coding which algorithm
runs or executing an action the instant it's requested. By the end you'll
recognize why a codebase has a class named `SortStrategy` or
`UndoableCommand`, and understand the specific flexibility each one buys
you.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and benefits from, but doesn't require, the Communication post
on callbacks earlier in this series — both patterns here are close
relatives of a callback, re-explained from scratch as needed. No
TypeScript knowledge is assumed.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

`tsc` compiles and type-checks; `node` runs the result. A type error stops
compilation before the program runs at all.

---

## Concept 1: Strategy

The **Strategy** pattern lets you select an algorithm at runtime by
swapping out one interchangeable object for another — all of them
implementing the same interface, each implementing a different way of
doing the same conceptual job.

### Problem first

Suppose you're sorting a list of numbers, but the "best" way to sort
depends on the data: a small, mostly-sorted list might be fastest with a
simple algorithm; a huge list needs something more efficient. Hard-coding
one specific algorithm means you can never adapt — and hard-coding the
*decision* of which algorithm to use, with an `if`/`elif` chain buried
inside the sorting function itself, means every new algorithm requires
editing that function directly (the same open/closed violation named in
this series' Factory post).

### Python

```python
def bubble_sort(items):
    items = items.copy()
    n = len(items)
    for i in range(n):
        for j in range(n - i - 1):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
    return items


def python_builtin_sort(items):
    return sorted(items)
```

**Walkthrough — new syntax.** `items.copy()` creates a shallow copy of the
list (recall from this series' Prototype post: a shallow copy is
sufficient here since the list contains only numbers, which are
immutable) — this avoids mutating the original list the caller passed in,
which would be a surprising side effect. `items[j], items[j + 1] =
items[j + 1], items[j]` is **tuple unpacking** used to swap two values in
a single line — the right side, `items[j + 1], items[j]`, builds a
temporary pair (a tuple) of the two values in swapped order, and the left
side assigns them simultaneously, avoiding the need for a separate
temporary variable that more verbose swap logic would require in other
languages. `bubble_sort` is a real, classic sorting algorithm: it
repeatedly steps through the list, comparing adjacent items and swapping
them if they're in the wrong order, until the whole list is sorted —
simple to understand, but inefficient for large lists. `sorted(items)` is
Python's built-in sort, using a much more efficient algorithm internally
(Timsort) — included here specifically to have a second, genuinely
different algorithm to swap between.

Without Strategy, code that needs to sort might hard-code its choice:

```python
def process_data(items):
    sorted_items = bubble_sort(items)
    print(f"Processed: {sorted_items}")


process_data([5, 2, 8, 1, 9])
```

```
Processed: [1, 2, 5, 8, 9]
```

This works, but `process_data` is now permanently committed to
`bubble_sort` specifically — using a different algorithm for different
situations means editing `process_data` itself, every time.

```python
class Sorter:
    def __init__(self, strategy):
        self._strategy = strategy

    def set_strategy(self, strategy):
        self._strategy = strategy

    def sort(self, items):
        return self._strategy(items)
```

**Walkthrough:** `Sorter` doesn't implement any sorting algorithm itself —
it holds a reference to a **strategy** (here, simply a function, since
Python functions are first-class values, as established in this series'
Communication post) and delegates the actual work to whichever strategy
is currently set. `set_strategy` allows changing the algorithm at any
point, even after the `Sorter` has already been created and used.

```python
sorter = Sorter(bubble_sort)
print(sorter.sort([5, 2, 8, 1, 9]))

sorter.set_strategy(python_builtin_sort)
print(sorter.sort([5, 2, 8, 1, 9]))
```

```
[1, 2, 5, 8, 9]
[1, 2, 5, 8, 9]
```

**Walkthrough:** Both calls produce the same sorted output, since both
algorithms are correct — what changed between the two calls is purely
*which algorithm did the work*, decided entirely by `set_strategy`, with
zero changes to `Sorter.sort` itself or to the code calling it.

**CS lens.** This is the same dispatch concept seen in the Dispatcher post
— a lookup that decides which code actually runs — but here the
"lookup" is as simple as a single variable holding the currently active
strategy, rather than a dictionary of many options. The defining trait of
Strategy specifically: all the interchangeable options conceptually do
*the same job* (here, "produce a sorted version of this list") through
*different means* — contrast this with Dispatcher, where the different
options typically do entirely different jobs depending on a routing key.

**SE lens.** Strategy is the textbook way to satisfy the open/closed
principle for algorithms specifically: adding a new sorting algorithm
(say, `quick_sort`) requires writing a new function with the matching
signature and passing it to `set_strategy` — `Sorter` itself never needs
modification. This pattern is everywhere in real libraries: a function
that accepts a `key=` argument for custom sorting, a validation library
that accepts pluggable validator functions, a compression library that
accepts different compression algorithms — all are Strategy in disguise,
usually without anyone calling it by that name.

**What breaks without this:** Hard-coding one specific algorithm inside a
function that uses it means every new use case (a faster algorithm for
large inputs, a different sort order, a completely different approach)
requires editing that function directly — and if that function is used in
many places throughout a codebase expecting its current behavior, changing
it risks breaking all of them at once.

### TypeScript

```typescript
type SortFunction = (items: number[]) => number[];

function bubbleSort(items: number[]): number[] {
  const copy = [...items];
  const n = copy.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (copy[j] > copy[j + 1]) {
        [copy[j], copy[j + 1]] = [copy[j + 1], copy[j]];
      }
    }
  }
  return copy;
}

function builtinSort(items: number[]): number[] {
  return [...items].sort((a, b) => a - b);
}
```

**Walkthrough — new syntax.** `type SortFunction = (items: number[]) =>
number[];` is a type alias (from this series' Communication post) for "a
function taking an array of numbers and returning an array of numbers."
`const copy = [...items];` uses the spread operator (from this series'
Prototype post) to create a shallow copy of the array, the TypeScript
equivalent of Python's `.copy()`. `for (let i = 0; i < n; i++)` is the
**classic C-style for loop** — new syntax not yet seen in this series'
TypeScript examples: `let i = 0` initializes a loop counter, `i < n` is
the condition checked before every iteration (the loop continues only
while this is `true`), and `i++` (increment by 1) runs after every
iteration. This is a different loop shape from TypeScript's `for...of`
(seen in earlier posts, iterating directly over a sequence's *values*) —
the C-style form is used here because the algorithm specifically needs
numeric indices to compare adjacent positions, not just the values
themselves. `[copy[j], copy[j + 1]] = [copy[j + 1], copy[j]];` is
TypeScript/JavaScript's version of tuple-unpacking swap — **array
destructuring** on the left side of an assignment, matched against a
newly built array literal on the right, swapping the two positions in one
statement. `[...items].sort((a, b) => a - b)` — JavaScript's built-in
`.sort()` method, by default, sorts elements as strings (which produces
wrong results for numbers, e.g., treating `"10"` as coming before `"9"`) —
passing a **comparator function**, `(a, b) => a - b`, tells `.sort()` how
to compare two elements: if the result is negative, `a` comes first; if
positive, `b` comes first; if zero, their order doesn't matter. This
comparator-function requirement is a genuine difference from Python's
`sorted()`, which sorts numbers correctly with no extra argument needed.

```typescript
class Sorter {
  constructor(private strategy: SortFunction) {}

  setStrategy(strategy: SortFunction): void {
    this.strategy = strategy;
  }

  sort(items: number[]): number[] {
    return this.strategy(items);
  }
}

const sorter = new Sorter(bubbleSort);
console.log(sorter.sort([5, 2, 8, 1, 9]));

sorter.setStrategy(builtinSort);
console.log(sorter.sort([5, 2, 8, 1, 9]));
```

```
[ 1, 2, 5, 8, 9 ]
[ 1, 2, 5, 8, 9 ]
```

**Walkthrough:** Structurally identical to the Python version. The
`SortFunction` type alias means the compiler verifies, at compile time,
that anything passed to the `Sorter` constructor or `setStrategy` actually
matches the required function shape — passing a function that took a
`string[]` instead of `number[]`, for instance, would be caught before the
program ever ran.

---

## Concept 2: Command

The **Command** pattern turns a request or action into a standalone
object — instead of directly calling a function to perform an action
immediately, you create an object that *represents* that action, which can
be stored, passed around, queued for later, logged, or — critically —
undone.

### Problem first

A direct function call executes immediately and leaves no trace:

```python
def turn_on_light():
    print("Light is ON")


def turn_off_light():
    print("Light is OFF")


turn_on_light()
```

```
Light is ON
```

This works for simple, immediate actions — but there's no way to undo it,
no way to queue it for later execution, and no way to log a history of
what actions were performed, without separately building all of that
machinery by hand around every function call.

### Python

```python
class Command:
    def execute(self):
        raise NotImplementedError

    def undo(self):
        raise NotImplementedError
```

**Walkthrough — new syntax.** `raise NotImplementedError` is a deliberate
pattern for defining a kind of contract using a plain class rather than
anything more formal: `Command` is meant to be a base for other classes to
build on, and any subclass that forgets to provide its own `execute` or
`undo` will get a clear, immediate error the moment that method is called,
rather than silently doing nothing. This is a lighter-weight alternative
to Python's more formal `abc` (abstract base class) module, sufficient
for this example.

```python
class Light:
    def __init__(self):
        self.is_on = False

    def turn_on(self):
        self.is_on = True
        print("Light is ON")

    def turn_off(self):
        self.is_on = False
        print("Light is OFF")


class TurnOnCommand(Command):
    def __init__(self, light):
        self._light = light

    def execute(self):
        self._light.turn_on()

    def undo(self):
        self._light.turn_off()


class TurnOffCommand(Command):
    def __init__(self, light):
        self._light = light

    def execute(self):
        self._light.turn_off()

    def undo(self):
        self._light.turn_on()
```

**Walkthrough:** `Light` is the actual object being controlled — it knows
nothing about commands or undo history; it just exposes `turn_on` and
`turn_off`. `TurnOnCommand` and `TurnOffCommand` each wrap a `Light` and
implement both `execute()` (the forward action) and `undo()` (the exact
reverse of that action) — notice `TurnOnCommand.undo()` calls
`turn_off()`, and `TurnOffCommand.undo()` calls `turn_on()`: each command
fully knows how to reverse itself, because the knowledge of "what reverses
this specific action" belongs naturally with the action itself, not with
whatever code happens to be invoking it.

```python
class RemoteControl:
    def __init__(self):
        self._history = []

    def execute_command(self, command):
        command.execute()
        self._history.append(command)

    def undo_last(self):
        if self._history:
            last_command = self._history.pop()
            last_command.undo()
        else:
            print("Nothing to undo.")
```

**Walkthrough:** `RemoteControl` holds a list, `_history`, that grows by
one every time a command is executed (the same accumulator pattern from
the loops post, here triggered by an event rather than a loop iteration).
`undo_last` uses `.pop()` (from this series' lists post: removes and
returns the *last* item) to retrieve the most recently executed command
and call its own `undo()` — `RemoteControl` itself has no idea what
"undo" means for any specific command; it only knows to call `.undo()` on
whatever the most recent command object happens to be.

```python
light = Light()
remote = RemoteControl()

remote.execute_command(TurnOnCommand(light))
remote.execute_command(TurnOffCommand(light))
remote.execute_command(TurnOnCommand(light))

print("\nUndoing last action:")
remote.undo_last()

print("\nUndoing again:")
remote.undo_last()
```

```
Light is ON
Light is OFF
Light is ON

Undoing last action:
Light is OFF

Undoing again:
Light is ON
```

**Walkthrough:** Three commands execute in sequence, each printed at the
moment it runs. `undo_last()` is called twice afterward: the first call
reverses the most recent command (`TurnOnCommand`, whose `undo()` calls
`turn_off()`), the second reverses the one before that (`TurnOffCommand`,
whose `undo()` calls `turn_on()`) — `RemoteControl` is correctly walking
backward through history one step at a time, exactly mirroring a real
"undo" feature in an application like a text editor.

**CS lens.** Wrapping an action in an object rather than calling a
function directly is a form of **reification** — making something
abstract (an action, a request) into a concrete object that can be
inspected, stored, passed around, and operated on like any other value.
The `_history` list is a literal record of everything that's happened,
in order — which is exactly the data structure that makes undo (and, with
small extension, redo) possible at all.

**SE lens.** Command is the foundation of undo/redo systems in any real
application (text editors, image editors, IDEs), of task queues (a
command object can be serialized, sent across a network, and executed on
a different machine entirely — the executing code doesn't need to know
anything about the action besides "call `.execute()` on it"), and of
macro/scripting systems (record a sequence of commands, replay them
later). The shared thread: once an action is an object rather than a bare
function call, it gains a *lifetime* — it can exist before being executed,
be logged, be retried, be undone — none of which a plain, immediate
function call can offer.

**What breaks without this:** Without commands as objects, implementing
undo requires the calling code to manually track, for every single action
it performs, what the exact reverse of that action would be — scattered
throughout the codebase wherever an action might be triggered, rather than
encapsulated once, correctly, alongside each action's own definition.

### TypeScript

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class Light {
  isOn: boolean = false;

  turnOn(): void {
    this.isOn = true;
    console.log("Light is ON");
  }

  turnOff(): void {
    this.isOn = false;
    console.log("Light is OFF");
  }
}

class TurnOnCommand implements Command {
  constructor(private light: Light) {}

  execute(): void {
    this.light.turnOn();
  }

  undo(): void {
    this.light.turnOff();
  }
}

class TurnOffCommand implements Command {
  constructor(private light: Light) {}

  execute(): void {
    this.light.turnOff();
  }

  undo(): void {
    this.light.turnOn();
  }
}
```

**Walkthrough:** `interface Command { execute(): void; undo(): void; }`
is the explicit, compiler-checked version of the Python base class's
informal contract — any class claiming `implements Command` is verified
by the compiler to actually provide both methods with the right
signatures, rather than discovering a missing method only when it's
called at runtime, as the Python version's `raise NotImplementedError`
would.

```typescript
class RemoteControl {
  private history: Command[] = [];

  executeCommand(command: Command): void {
    command.execute();
    this.history.push(command);
  }

  undoLast(): void {
    const lastCommand = this.history.pop();
    if (lastCommand) {
      lastCommand.undo();
    } else {
      console.log("Nothing to undo.");
    }
  }
}

const light = new Light();
const remote = new RemoteControl();

remote.executeCommand(new TurnOnCommand(light));
remote.executeCommand(new TurnOffCommand(light));
remote.executeCommand(new TurnOnCommand(light));

console.log("\nUndoing last action:");
remote.undoLast();

console.log("\nUndoing again:");
remote.undoLast();
```

```
Light is ON
Light is OFF
Light is ON

Undoing last action:
Light is OFF

Undoing again:
Light is ON
```

**Walkthrough — new syntax.** `this.history.pop()` — JavaScript's array
`.pop()` works the same as Python's list `.pop()`: removes and returns
the last element. The key difference worth noting: if the array is empty,
JavaScript's `.pop()` returns `undefined` rather than raising an error
(Python's list `.pop()` on an empty list raises `IndexError` instead) —
this is why `undoLast` checks `if (lastCommand)` afterward rather than
needing a `try`/`catch`: `undefined` is falsy (recall truthiness from the
Python-basics control flow post, which applies in TypeScript/JavaScript
too), so the `if` check safely catches the empty-history case without an
exception ever being involved.

---

## Connect the pieces

Strategy and Command are close relatives — both turn behavior into an
object or function value that can be passed around rather than hard-coded
— but they answer different questions. **Strategy** answers "which
algorithm should I use to do this job?" — all strategies are
interchangeable because they accomplish the *same* goal through different
means, and a `Sorter` doesn't care which one it's holding as long as it
sorts. **Command** answers "what is this specific action, and can it be
stored, queued, logged, or undone?" — each command represents a distinct,
concrete action with a beginning, an end, and (often) a defined reverse.

Both patterns are close relatives of the plain callback from this series'
Communication post — in fact, the Python Strategy example *is* just a
callback being swapped at runtime. What elevates Command beyond a plain
callback is the addition of state and a paired reverse operation
(`undo`), and what elevates Strategy beyond a single callback is the
formal expectation that multiple interchangeable implementations exist
and can be swapped freely, sharing one interface.

## What breaks without these patterns

Without Strategy, switching algorithms means editing the code that uses
them directly, every time, risking the correctness of every existing use.
Without Command, building features like undo, action queues, or action
logging requires bespoke, scattered tracking logic wherever actions are
triggered, rather than a single, reusable mechanism that works uniformly
for any action that's been wrapped as a command.

## Definition of done

- [ ] You can explain, in your own words, what distinguishes Strategy from
      Command — specifically, "interchangeable ways to do the same job"
      versus "a specific action that can be stored and undone."
- [ ] You've run both patterns in Python and TypeScript and confirmed
      matching output.
- [ ] You can explain why JavaScript's `.sort()` needs a comparator
      function for numbers, while Python's `sorted()` doesn't.
- [ ] You can explain why each Command class implements its own `undo()`
      rather than `RemoteControl` containing logic to figure out how to
      reverse an action.
- [ ] You can explain the difference in how Python's empty-list `.pop()`
      and JavaScript's empty-array `.pop()` behave, and how `undoLast()`'s
      `if (lastCommand)` check accounts for that difference.
