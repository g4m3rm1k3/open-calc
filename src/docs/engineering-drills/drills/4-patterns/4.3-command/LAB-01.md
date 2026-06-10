# Drill 4.3 — Command Pattern: Encapsulating Actions

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Pattern category:** GoF Behavioral
**Official name:** Command
**What you will build:** A terminal text editor with unlimited undo/redo — every edit is a Command object on a history stack
**What you will understand:** Why the Command pattern exists, what makes an action undoable, and where this pattern appears in git, databases, and UI frameworks

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. You want to add undo to your text editor. Without the Command pattern, you call `buffer.insert(pos, text)` directly. What information would you need to store to undo that operation? Where would you store it?

2. A Command has `execute()` and `undo()`. The `undo()` method reverses the effect of `execute()`. If `execute()` inserted "hello" at position 5, what does `undo()` need to know?

3. `git commit` records a snapshot of your files. `git revert` creates a new commit that undoes a previous one — it does NOT pop a stack. Why is this different from a traditional Command pattern undo?

4. Task queues (Redis, Celery) serialize commands and execute them later, possibly on a different machine. What property must a Command have for this to work?

*(Answers at the bottom.)*

---

## The Concept: Command Pattern

### Concept: Command

**What it is:**
The Command pattern encapsulates a request as an object. Instead of calling a method directly, you create an object that represents the action (with all the data needed to perform and reverse it), and pass that object to an executor. The executor calls `execute()`, and can later call `undo()`.

**The problem before — direct invocation:**

```python
# Direct calls — no history, no undo
buffer = ["H", "e", "l", "l", "o"]

def insert(pos, text):
    buffer.insert(pos, text)   # modifies buffer directly

def delete(pos, length):
    del buffer[pos:pos+length]  # modifies buffer directly

insert(5, ", World")   # no record that this happened
# How do you undo it? You don't know what was inserted, where, or when.
# You'd need to re-implement the editor from scratch as a log.
```

To add undo, you'd have to rebuild the history mechanism into every single function. Every mutating operation becomes responsible for its own undo logic — scattered, inconsistent, hard to test.

**The solution:**

```python
class InsertCommand:
    def __init__(self, buffer, pos, text):
        self.buffer = buffer
        self.pos    = pos
        self.text   = text   # stored so undo knows what to remove

    def execute(self):
        self.buffer.insert(self.pos, self.text)

    def undo(self):
        # Remove exactly what was inserted
        del self.buffer[self.pos:self.pos + len(self.text)]

# The caller creates the command and hands it to a history tracker
cmd = InsertCommand(buffer, 5, ", World")
history.execute(cmd)   # history calls cmd.execute() and pushes it
history.undo()         # history pops cmd and calls cmd.undo()
```

**Pattern category:** GoF Behavioral — about how objects communicate.

**Tradeoff:** More classes — every distinct action type becomes a class. For simple apps this can feel heavyweight. The payoff appears when undo, redo, history, logging, or queuing is required — the pattern gives you all of these "for free" once the Command infrastructure is in place.

**What it hides:**
The decision of WHEN to execute, HOW to undo, and WHERE to store history. The invariant: each Command is self-contained — it knows everything needed to execute and undo itself. The caller does not need to know the implementation details of any operation.

**Canonical example:**
A restaurant kitchen. A waiter takes orders on slips of paper (Commands). The slip contains everything the chef needs — table number, dish, modifications. The waiter doesn't cook the dish (execute). The kitchen can de-prioritize the slip (defer) or cancel it before cooking starts (undo at queue level). The slip is the Command.

**Constraints:**
- Commands must store all state needed to undo — if the buffer changes between execute and undo, the stored state must reflect the state AT THE TIME of execution
- Undo/redo stacks grow without bound unless you limit them
- Commands that have side effects outside the application (sending an email, writing to a database) cannot be simply "undone" — you need compensating Commands (like a Saga pattern)
- Thread safety: if multiple threads execute commands, the history stack needs locking

**Failure modes:**
- Shallow copy of mutable state: `self.data = buffer` stores a reference — when the buffer changes, the stored state changes too. Always store a deep copy of data needed for undo.
- Missing redo: after undo, the redo stack must be cleared when a new command is executed — otherwise redo would lead to a branching timeline
- Cumulative drift: floating-point operations applied repeatedly may not perfectly undo — use exact arithmetic where precision matters

**Operational reality:**
Git uses a variant — commits are immutable snapshots (like executed Commands), and `git revert` creates a new compensating commit rather than popping a stack. This makes the history append-only, which is safer for distributed systems. Database transactions are Commands with `COMMIT` (execute) and `ROLLBACK` (undo). Redux in React stores a history of dispatched actions — time-travel debugging replays them. Photoshop's history panel, Word's undo, every text editor with Ctrl+Z — all use this pattern.

**You will see this again in:**
Redux (dispatched actions are Commands), git (commits), database transactions, task queues (Celery), game replay systems, macro recorders, UI action history.

**Watch for:**
Deep copy vs shallow copy when capturing state for undo. If `self.old_data = buffer` and `buffer` is later mutated, your undo will use the wrong data. Use `copy.deepcopy()` for mutable state.

---

## Step 1 — Build the Command Infrastructure

Create `commands.py`:

```python
# commands.py — the Command interface and all concrete command types
from abc import ABC, abstractmethod
import copy

class Command(ABC):
    """
    Abstract base class for all commands.
    Every command must implement execute() and undo().
    The command stores all state needed to reverse its action.
    """

    @abstractmethod
    def execute(self) -> None:
        """Perform the action."""
        ...

    @abstractmethod
    def undo(self) -> None:
        """Reverse the action — exactly as if execute() had not been called."""
        ...

    @property
    def description(self) -> str:
        """Human-readable description for the history log. Override in subclasses."""
        return self.__class__.__name__


class InsertCommand(Command):
    """Insert text at a given position in the buffer."""

    def __init__(self, buffer: list, pos: int, text: str):
        self._buffer = buffer   # reference to the shared buffer — same object as the editor's
        self._pos    = pos      # where to insert
        self._text   = text     # what to insert — stored for undo

    def execute(self) -> None:
        self._buffer.insert(self._pos, self._text)
        # list.insert(pos, item): inserts 'item' at index 'pos', shifting others right

    def undo(self) -> None:
        # Remove exactly what was inserted: from _pos to _pos+len(_text)
        del self._buffer[self._pos:self._pos + len(self._text)]
        # list slice deletion: removes items from start (inclusive) to stop (exclusive)

    @property
    def description(self) -> str:
        preview = self._text[:20] + "..." if len(self._text) > 20 else self._text
        return f"Insert '{preview}' at position {self._pos}"


class DeleteCommand(Command):
    """Delete a range of characters from the buffer."""

    def __init__(self, buffer: list, pos: int, length: int):
        self._buffer  = buffer
        self._pos     = pos
        self._length  = length
        # Capture the characters being deleted BEFORE execute() removes them
        # Without this, undo() would not know what to restore
        self._deleted = copy.copy(buffer[pos:pos + length])
        # copy.copy: shallow copy of the slice — safe for strings/chars

    def execute(self) -> None:
        del self._buffer[self._pos:self._pos + self._length]

    def undo(self) -> None:
        # Re-insert the deleted characters at the same position
        for i, char in enumerate(self._deleted):
            self._buffer.insert(self._pos + i, char)
            # Insert each character back in order

    @property
    def description(self) -> str:
        preview = "".join(self._deleted[:20])
        if len(self._deleted) > 20:
            preview += "..."
        return f"Delete '{preview}' at position {self._pos}"


class ReplaceCommand(Command):
    """Replace a range of characters with new text. Implemented as Delete + Insert."""

    def __init__(self, buffer: list, pos: int, length: int, new_text: str):
        # Compose two atomic operations — this is the Composite Command pattern
        self._delete = DeleteCommand(buffer, pos, length)
        self._insert = InsertCommand(buffer, pos, new_text)

    def execute(self) -> None:
        self._delete.execute()   # remove old text
        self._insert.execute()   # insert new text at same position

    def undo(self) -> None:
        self._insert.undo()    # remove new text
        self._delete.undo()    # restore old text
        # Note: reverse order — undo is always the mirror of execute

    @property
    def description(self) -> str:
        return f"Replace: {self._delete.description} → {self._insert.description}"
```

### SAVE AND TRY

```bash
python -c "
from commands import InsertCommand, DeleteCommand
buf = list('Hello')
cmd = InsertCommand(buf, 5, ', World')
cmd.execute()
print('After insert:', ''.join(buf))
cmd.undo()
print('After undo:', ''.join(buf))
"
```

**Expected output:**
```
After insert: Hello, World
After undo: Hello
```

---

## Step 2 — Build the Command History

Create `history.py`:

```python
# history.py — the command executor and undo/redo stack

from commands import Command

class CommandHistory:
    """
    Manages a stack of executed commands.
    Supports unlimited undo and redo.

    Invariant: the redo stack is cleared whenever a new command is executed.
    This prevents the timeline from branching — no "future" that is now invalid.
    """

    def __init__(self):
        self._undo_stack: list[Command] = []   # commands that have been executed
        self._redo_stack: list[Command] = []   # commands that have been undone

    def execute(self, command: Command) -> None:
        """Execute a command and push it onto the undo stack."""
        command.execute()
        self._undo_stack.append(command)
        self._redo_stack.clear()
        # Clear redo: once you take a new action after undoing, the undone future is gone
        # This is the same behavior as every text editor: redo disappears on new input

    def undo(self) -> bool:
        """Undo the most recent command. Returns True if successful."""
        if not self._undo_stack:
            return False   # nothing to undo
        command = self._undo_stack.pop()
        command.undo()
        self._redo_stack.append(command)   # save for potential redo
        return True

    def redo(self) -> bool:
        """Redo the most recently undone command. Returns True if successful."""
        if not self._redo_stack:
            return False   # nothing to redo
        command = self._redo_stack.pop()
        command.execute()
        self._undo_stack.append(command)
        return True

    def print_history(self) -> None:
        """Display the current undo/redo stacks."""
        print(f"  Undo stack ({len(self._undo_stack)} items):")
        for i, cmd in enumerate(reversed(self._undo_stack)):
            marker = "→" if i == 0 else " "
            print(f"    {marker} {cmd.description}")
        if self._redo_stack:
            print(f"  Redo stack ({len(self._redo_stack)} items):")
            for cmd in reversed(self._redo_stack):
                print(f"      {cmd.description}")

    @property
    def can_undo(self) -> bool:
        return len(self._undo_stack) > 0

    @property
    def can_redo(self) -> bool:
        return len(self._redo_stack) > 0
```

### SAVE AND TRY

```bash
python -c "
from commands import InsertCommand, DeleteCommand
from history import CommandHistory

buf = list('Hello')
h = CommandHistory()

h.execute(InsertCommand(buf, 5, ', World'))
print('After insert:', ''.join(buf))

h.execute(DeleteCommand(buf, 0, 5))
print('After delete Hello:', ''.join(buf))

h.print_history()

h.undo()
print('After undo:', ''.join(buf))
h.undo()
print('After undo:', ''.join(buf))
"
```

**Expected output:**
```
After insert: Hello, World
After delete Hello: , World
  Undo stack (2 items):
    → Delete ', World' at position 0
       Insert ', World' at position 5
After undo: Hello, World
After undo: Hello
```

---

## Step 3 — Build the Text Editor

Create `editor.py`:

```python
# editor.py — a simple terminal text editor using Command pattern

from commands import InsertCommand, DeleteCommand, ReplaceCommand
from history import CommandHistory

class TextEditor:
    """
    A text editor backed by a Command history.
    Every mutation goes through a Command — making unlimited undo/redo available.
    """

    def __init__(self, initial_text: str = ""):
        self._buffer  = list(initial_text)   # list of characters — mutable
        self._history = CommandHistory()

    def insert(self, pos: int, text: str) -> None:
        """Insert text at position and record it as an undoable command."""
        self._history.execute(InsertCommand(self._buffer, pos, text))

    def delete(self, pos: int, length: int) -> None:
        """Delete characters at position and record it."""
        self._history.execute(DeleteCommand(self._buffer, pos, length))

    def replace(self, pos: int, length: int, new_text: str) -> None:
        """Replace characters at position with new text."""
        self._history.execute(ReplaceCommand(self._buffer, pos, length, new_text))

    def undo(self) -> bool:
        """Undo the last action. Returns False if nothing to undo."""
        return self._history.undo()

    def redo(self) -> bool:
        """Redo the last undone action. Returns False if nothing to redo."""
        return self._history.redo()

    @property
    def text(self) -> str:
        return "".join(self._buffer)

    @property
    def can_undo(self) -> bool:
        return self._history.can_undo

    @property
    def can_redo(self) -> bool:
        return self._history.can_redo

    def show_history(self) -> None:
        self._history.print_history()


# --- run a demo ---
if __name__ == "__main__":
    editor = TextEditor("Hello")
    print(f"Initial:      '{editor.text}'")

    editor.insert(5, ", World")
    print(f"After insert: '{editor.text}'")

    editor.insert(12, "!")
    print(f"After insert: '{editor.text}'")

    editor.replace(0, 5, "Goodbye")
    print(f"After replace: '{editor.text}'")

    print("\nHistory:")
    editor.show_history()

    print("\n--- Undoing ---")
    while editor.can_undo:
        editor.undo()
        print(f"  Undo → '{editor.text}'")

    print("\n--- Redoing ---")
    while editor.can_redo:
        editor.redo()
        print(f"  Redo → '{editor.text}'")
```

### SAVE AND TRY

```bash
python editor.py
```

**Expected output:**
```
Initial:      'Hello'
After insert: 'Hello, World'
After insert: 'Hello, World!'
After replace: 'Goodbye, World!'

History:
  Undo stack (3 items):
    → Replace: Delete 'Hello' at position 0 → Insert 'Goodbye' at position 0
       Insert '!' at position 12
       Insert ', World' at position 5

--- Undoing ---
  Undo → 'Hello, World!'
  Undo → 'Hello, World'
  Undo → 'Hello'

--- Redoing ---
  Redo → 'Hello, World'
  Redo → 'Hello, World!'
  Redo → 'Goodbye, World!'
```

**Change something:** Add `editor.insert(0, "Dear ")` after the undos. Then try `editor.redo()` — it returns `False`. The redo stack was cleared when you inserted new text. A new action always clears the "future."

---

## Challenge

**No solution provided. Requirements checklist only.**

Add a `TransactionCommand` that groups multiple commands into one undoable unit. A user's "format paragraph" action — which inserts a blank line, capitalises the first letter, and removes trailing spaces — should undo as a single action, not three.

**Requirements checklist:**

- [ ] `TransactionCommand` takes a list of `Command` objects at construction
- [ ] `execute()` runs all commands in order
- [ ] `undo()` reverses them in reverse order (last-in, first-undone)
- [ ] `TransactionCommand` is itself a `Command` — it can be pushed onto `CommandHistory` like any other
- [ ] `description` property returns a summary like `"Transaction (3 commands)"`
- [ ] A single `history.undo()` call undoes all three operations atomically
- [ ] Nesting works: a `TransactionCommand` can contain another `TransactionCommand`

**Starter:**
```python
# In commands.py — add this class:
class TransactionCommand(Command):
    def __init__(self, commands: list[Command]):
        self._commands = commands   # list of commands to run as one unit

    def execute(self) -> None:
        # TODO: run all commands in order

    def undo(self) -> None:
        # TODO: reverse all commands in reverse order

    @property
    def description(self) -> str:
        return f"Transaction ({len(self._commands)} commands)"
```

**When you're done:** Creating a `TransactionCommand([insert_cmd, delete_cmd, replace_cmd])`, executing it, then calling `history.undo()` once restores the buffer to its pre-transaction state. The undo stack shows one entry for the entire transaction, not three.

**Stuck?** Ask AI: "In the Command pattern, my TransactionCommand.undo() needs to reverse a list of commands in reverse order. If `self._commands = [A, B, C]` and A was executed first, should I undo C first or A first? Why?"

---

## Quick Check Answers

**1. What do you need to store to undo an insert without Command pattern?**
You need: the position of the insert, the exact text that was inserted, and the time/order relative to other operations. Without a dedicated object, you'd typically maintain a parallel stack of tuples somewhere — and every new type of operation (delete, replace, format) would need its own undo tuple format. The application code that calls `buffer.insert()` would also be responsible for maintaining this stack, mixing concerns. The Command pattern packages these responsibilities into one object that knows how to undo itself.

**2. What does `undo()` need to know if `execute()` inserted "hello" at position 5?**
Exactly what was inserted ("hello"), exactly where (position 5), and a reference to the buffer that was modified. With that information, `undo()` deletes from position 5 to position 10 (5 + length of "hello"). This is precisely what `InsertCommand` stores: `self._pos`, `self._text`, and `self._buffer`. Nothing more is needed.

**3. Why is `git revert` different from traditional Command pattern undo?**
Git's history is append-only and distributed — multiple people may have already based work on the commit you want to undo. "Popping" a commit from the shared history would rewrite history that others have built on, causing conflicts. `git revert` creates a new compensating commit (a new Command that reverses the effect) rather than removing the original. This is the Saga pattern for distributed systems: you never rollback completed transactions; you create compensating transactions. Traditional undo (pop-the-stack) only works when the history is local and linear — a single user's editor session.

**4. What property must a Command have for task queue serialization?**
Serializability — the Command must be expressible as data (JSON, pickle, protobuf) that can be transmitted over a network and reconstructed on another machine. This means: no references to in-memory objects, no open file handles, no database connections stored in the Command. The Command carries only the data needed to execute the operation (table name, record ID, field values) — not live resources. When the worker receives the serialized Command, it reconstructs a fresh Command object and calls `execute()`. This is why Celery tasks accept only simple argument types: they must be serializable.
