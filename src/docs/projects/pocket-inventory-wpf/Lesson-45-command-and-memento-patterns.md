# Lesson 45: A Command That Remembers How to Undo Itself

*(An undo stack of reversible `Command` objects)*

**User Story**
> As a user, I want to undo — and redo — deleting items.

**What you will build**
Real `Ctrl+Z` undo, and `Ctrl+Y` redo, for deletion — this project's
single most destructive action, made genuinely reversible. This lesson
deepens the Command pattern (Lesson 23) with a second capability: a
command that doesn't just know how to *do* something, but how to
*undo* it — paired with the Memento pattern, capturing exactly enough
state, before the action runs, to reconstruct it afterward.

**What you need to know first:** Lesson 23: `ICommand`, the Command
pattern's first appearance. Lesson 4: a navigation *stack*, LIFO order
— the identical ordering discipline this lesson's undo stack reuses.

**Terms introduced in this lesson:**
- **Memento** — a small, saved snapshot of an object's state, captured
  specifically so it can be restored later; here, everything needed to
  recreate a deleted item exactly.
- **Undo stack** — a real `Stack<T>` of reversible commands; undoing
  pops the most recently executed one and reverses it — the same LIFO
  ordering Lesson 4's navigation stack already established.

**Objects and methods used**
- `ICommand`/`RelayCommand` (Lesson 23) reappear here, already given
  full treatment — brief reminder only, per the Repetition Rule.
  `Stack<T>`, used here for the first time as a literal C# type (Lesson
  4's own back stack is `Frame`'s internal mechanism, not an exposed
  `Stack<T>` object), and the Memento pattern are this lesson's own
  subject, given full treatment below.

---

## Concept Unit: A Reversible Command, Proven With Real LIFO Order

### The Problem

Deleting three items, then undoing three times, needs to bring them
back in the *correct* order — the most recently deleted item first,
exactly mirroring how a real undo stack should behave. Worth proving
directly with real, ordered output before trusting it in the real
project.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-undo
cd lab-undo
```

Replace `Program.cs`:

```csharp
List<string> items = new() { "Hammer", "Wrench", "Bolts" };
Stack<IUndoableCommand> undoStack = new();

void Delete(string item)
{
    DeleteCommand command = new DeleteCommand(items, item);
    command.Execute();
    undoStack.Push(command);
}

void Undo()
{
    if (undoStack.Count == 0) return;
    IUndoableCommand command = undoStack.Pop();
    command.Undo();
}

Console.WriteLine($"Before: {string.Join(", ", items)}");

Delete("Hammer");
Delete("Wrench");
Delete("Bolts");
Console.WriteLine($"After deleting all three: {string.Join(", ", items)}");

Undo();
Console.WriteLine($"After 1 undo: {string.Join(", ", items)}");
Undo();
Console.WriteLine($"After 2 undos: {string.Join(", ", items)}");
Undo();
Console.WriteLine($"After 3 undos: {string.Join(", ", items)}");

interface IUndoableCommand
{
    void Execute();
    void Undo();
}

class DeleteCommand : IUndoableCommand
{
    private readonly List<string> list;
    private readonly string item;
    private int removedFromIndex;

    public DeleteCommand(List<string> list, string item)
    {
        this.list = list;
        this.item = item;
    }

    public void Execute()
    {
        removedFromIndex = list.IndexOf(item);
        list.Remove(item);
    }

    public void Undo()
    {
        list.Insert(removedFromIndex, item);
    }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Before: Hammer, Wrench, Bolts
After deleting all three:
After 1 undo: Bolts
After 2 undos: Wrench, Bolts
After 3 undos: Hammer, Wrench, Bolts
```

*What this proves:* three deletes empty the list completely. Three
undos restore it — but in reverse order of deletion: `Bolts` (deleted
last) reappears first, then `Wrench`, then `Hammer` — because
`undoStack.Pop()` always returns the *most recently pushed* command,
the same LIFO discipline Lesson 4's navigation stack already proved.
After all three undos, the list reads exactly `Hammer, Wrench, Bolts`
— the identical original order, because each `DeleteCommand` remembered
its own `removedFromIndex` — a real, small Memento — and restored to
that exact position, not just appended at the end.

### Discard the Throwaway Example
Delete the `lab-undo` folder. `IUndoableCommand`/the undo-stack pattern
are not discarded — the real `DeleteItem` undo uses exactly this next.

### Mechanical Walkthrough

- `interface IUndoableCommand { void Execute(); void Undo(); }` —
  **first appearance.** The Command pattern (Lesson 23) deepened: a
  second method, `Undo`, alongside `Execute` — this project's own
  `RelayCommand` never needed one, because none of its actions were
  meant to be reversible until now.
- `private int removedFromIndex;` — this class's own **Memento**,
  first appearing here. Captured inside `Execute()`, before the
  deletion happens — exactly enough state (a position) to reverse the
  specific operation this command performed, no more.
- `Stack<IUndoableCommand> undoStack` — reappearing (`Stack<T>`'s own
  LIFO shape, the same underlying structure behind `Frame`'s navigation
  journal, Lesson 4), applied here to reversible actions instead of
  screen history.

### CS Lens

This is the **Memento pattern**, named directly: an object's state,
captured at a specific moment, held separately from the object itself,
specifically so it can be restored later without the object needing to
know how to undo anything on its own. `DeleteCommand` — not `string`
itself — is what remembers the position; the data being deleted stays
completely ordinary.

### SE Lens

Why capture `removedFromIndex` inside `Execute()` rather than in the
constructor, before `Execute` ever runs? Because the *constructor*
only knows what item is being deleted — its actual position in the list
could change between construction and execution if something else
modified the list first. Capturing the Memento at the last possible
moment, immediately before the destructive operation itself, is what
guarantees it reflects the real, true state right before that specific
change — not a stale guess from earlier.

### Connection

The real, database-backed `DeleteCommand`, undoing a real deletion, is
built next.

---

## Concept Unit: Real Undo/Redo for Delete

### The Problem

`RemoveItem` (Lessons 23, 26, 28) permanently deletes an item — no
memento, no way back. Making it reversible needs a real command
capturing the deleted item's full state before it's gone.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New `DeleteItemCommand.cs`, `InventoryViewModel.cs`,
  `InventoryPage.xaml`.
- **Change type:** Add.
- **Dependencies:** `IUndoableCommand`, previous unit;
  `SaveItemToDatabase`/`DeleteItemFromDatabase`, existing since Lessons
  9, 22.

### The New Code — `DeleteItemCommand.cs`

```csharp
namespace PocketInventory
{
    public interface IUndoableCommand
    {
        void Execute();
        void Undo();
    }

    public class DeleteItemCommand : IUndoableCommand
    {
        private readonly InventoryViewModel viewModel;
        private readonly InventoryItem item;

        public DeleteItemCommand(InventoryViewModel viewModel, InventoryItem item)
        {
            this.viewModel = viewModel;
            this.item = item;
        }

        public void Execute()
        {
            viewModel.RemoveItem(item);
        }

        public void Undo()
        {
            viewModel.RestoreDeletedItem(item);
        }
    }
}
```

### The New Code — Undo/Redo Stacks and Commands

```csharp
private readonly Stack<IUndoableCommand> undoStack = new();
private readonly Stack<IUndoableCommand> redoStack = new();

public RelayCommand UndoCommand { get; }
public RelayCommand RedoCommand { get; }

// In the constructor:
UndoCommand = new RelayCommand(
    execute: _ => Undo(),
    canExecute: _ => undoStack.Count > 0);

RedoCommand = new RelayCommand(
    execute: _ => Redo(),
    canExecute: _ => redoStack.Count > 0);

public void DeleteWithUndo(InventoryItem item)
{
    DeleteItemCommand command = new DeleteItemCommand(this, item);
    command.Execute();
    undoStack.Push(command);
    redoStack.Clear();
}

private void Undo()
{
    if (undoStack.Count == 0) return;
    IUndoableCommand command = undoStack.Pop();
    command.Undo();
    redoStack.Push(command);
}

private void Redo()
{
    if (redoStack.Count == 0) return;
    IUndoableCommand command = redoStack.Pop();
    command.Execute();
    undoStack.Push(command);
}

public void RestoreDeletedItem(InventoryItem item)
{
    Items.Add(item);
    SaveItemToDatabase(item);
}
```

### The New Code — Keyboard Shortcuts

```xml
<KeyBinding Key="Z" Modifiers="Control" Command="{Binding UndoCommand}" />
<KeyBinding Key="Y" Modifiers="Control" Command="{Binding RedoCommand}" />
```

### Mechanical Walkthrough

- `redoStack.Clear()` inside `DeleteWithUndo` — (first appearance of
  clearing the redo stack on a new action) — a brand-new delete
  invalidates any previously-undone actions waiting to be redone; the
  same rule every real application's undo/redo follows — redo only ever
  makes sense immediately after an undo, never after a fresh, different
  action.
- `RestoreDeletedItem` calling `SaveItemToDatabase`, not a literal
  database "undelete" — worth naming honestly: SQLite has no way to
  restore a deleted row with its original `Id`; `RestoreDeletedItem`
  genuinely re-inserts the item as a *new* row, with a new, real `Id`,
  identical in every other field. Undoing a delete restores the data
  faithfully; it does not restore the exact original database identity.
- `Undo()`/`Redo()` both push the popped command onto the *other*
  stack — reappearing (`Stack<T>.Push`/`Pop`, this lesson's first
  unit), what actually makes redo possible: an undone command isn't
  discarded, it moves to `redoStack`, ready to be re-executed.

### CS Lens

`DeleteItemCommand` wrapping `viewModel.RemoveItem`/`RestoreDeletedItem`
— rather than duplicating their logic — is the same **composition over
duplication** principle this project has followed since `AddOrUpdateItem`
first reused existing methods (Lesson 21): the command *orchestrates*
already-correct operations; it doesn't reimplement them.

### SE Lens

Why does `RestoreDeletedItem` get a real `Id` different from the
original, rather than this project going to greater lengths to somehow
preserve it? Because SQLite's own `AUTOINCREMENT` never reuses a
deleted `Id` by design (a real, deliberate SQLite guarantee, avoiding a
different, worse bug — a *new* row accidentally colliding with a
reference some *other* part of the system still held to the old,
deleted `Id`). Fighting that guarantee to preserve an exact `Id` would
trade one honest limitation for a much subtler, more dangerous one.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: select and delete five items in sequence
(each through the normal, confirmed Delete flow). Press `Ctrl+Z` five
times — the items reappear one at a time, in reverse order of deletion,
exactly this lesson's own lab's proof. Press `Ctrl+Y` (Redo) — they
disappear again, in the order they were undone. Delete a sixth,
different item after undoing; press `Ctrl+Y` — nothing happens,
`redoStack` was correctly cleared the moment a new action occurred.

### Connection

Epic 11's power-user features are complete with a real, correct
undo/redo. Epic 12 turns to finishing the product for real use —
automatic backups, starting with a real, scheduled file copy.

---

## Closing

### Connect the Pieces

Deleting an item calls `DeleteWithUndo`, which builds a real
`DeleteItemCommand`, executes it (running the exact, already-correct
`RemoveItem` from Lessons 23/26/28), and pushes it onto `undoStack` —
the identical `Stack<T>`/LIFO discipline proven with real, ordered
output in this lesson's own first unit. Pressing `Ctrl+Z` pops the most
recent command and calls its `Undo()`, which re-inserts the item via
`RestoreDeletedItem` — a real, new database row, honestly different
`Id`, identical data — and moves that same command onto `redoStack`,
ready to be re-executed if `Ctrl+Y` is pressed next.

### What Breaks Without This

Temporarily remove `redoStack.Clear();` from `DeleteWithUndo`. Delete
an item, undo it (moving its command onto `redoStack`), then delete a
*different* item (pushing a new command onto `undoStack`, but leaving
the stale one still sitting on `redoStack`). Press `Ctrl+Y`. Real,
representative failure: the *first* item — already correctly restored
by the earlier undo — gets re-deleted, resurrecting a stale command
that no longer reflects the app's real, current history. This is a
genuinely confusing bug: from the user's perspective, redo just
deleted something they never asked it to touch. Restore the real
`redoStack.Clear()` call afterward.

### Exercises

- In the `lab-undo` throwaway pattern, delete two items, undo one, then
  delete a third — add your own `redoStack`-clearing rule and confirm,
  with real output, that redo afterward doesn't resurrect the wrong
  command.
- Predict, in your own words, what `UndoCommand.CanExecute` should
  report immediately after the app first starts, before anything has
  been deleted — then confirm on the real, running app that the button/
  shortcut is genuinely disabled, not just visually similar to disabled.
- Extend this pattern to Archive (Lesson 28) — a second
  `IUndoableCommand` implementation whose `Undo` calls `RestoreItem`
  instead of re-inserting a fresh row (archiving never actually deletes
  the database row, so its own undo doesn't have this lesson's
  new-`Id` limitation at all).

### Definition of Done

- [ ] Deleting an item pushes a real, reversible command onto a real
      undo stack.
- [ ] `Ctrl+Z` undoes deletions in correct, reverse (LIFO) order.
- [ ] `Ctrl+Y` redoes an undone deletion.
- [ ] A new delete after an undo correctly clears any pending redo
      history.
- [ ] You reproduced the stale-redo bug on purpose, confirmed it
      resurrects the wrong item, and restored the real
      `redoStack.Clear()` call.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add undo/redo for delete via Command+Memento pattern — Epic 11 fully complete"`.
