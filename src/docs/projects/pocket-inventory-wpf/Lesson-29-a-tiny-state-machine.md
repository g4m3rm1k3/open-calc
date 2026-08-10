# Lesson 29: Not Every State Change Is Valid From Every State

*(A `BorrowStatus` enum, valid-transition logic)*

**User Story**
> As a user, I want to track which items are borrowed, by whom, and
> since when — and I don't want to accidentally mark something borrowed
> twice or "returned" when it was never checked out.

**What you will build**
A real status per item: `Available` or `Borrowed`, with who has it and
since when. The transferable problem underneath this lesson isn't the
`enum` itself — Lesson 12 already covered that — it's that `Available`
and `Borrowed` aren't just two independent labels; they form a real
sequence, and only some transitions between them make sense. Borrowing
an already-borrowed item, or returning one nobody borrowed, are
mistakes this lesson makes structurally difficult, not just
theoretically wrong.

**What you need to know first:** Lesson 12: `enum`. Lesson 23:
`RelayCommand`, `CanExecute`. Lesson 28: `IsArchived`'s own bool-flag
pattern, extended here to a real, multi-value status.

**Terms introduced in this lesson:**
- **Finite state machine** — a system with a fixed, named set of states
  and explicit rules for which transitions between them are allowed;
  "finite" because the set of states and the set of allowed transitions
  are both fixed and small, not computed or open-ended.
- **Valid transition** — a specific, named change from one state to
  another that the system's own rules permit; every other change is
  invalid by definition, not just unusual.

**Objects and methods used**
- `enum` (Lesson 5a) reappears here, already given full treatment —
  brief reminder only, per the Repetition Rule. The state machine
  itself is this lesson's own subject, given full treatment below.

---

## Concept Unit: Guarding Transitions, Not Just States

### The Problem

A plain `bool IsBorrowed` (the same shape `IsFavorite`/`IsArchived`
already use) can only ever be flipped — nothing about a bare `bool`
stops code from "borrowing" an item that's already borrowed, silently
overwriting who has it, or "returning" one that was never checked out in
the first place.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-statemachine
cd lab-statemachine
```

Replace `Program.cs`:

```csharp
BorrowStatus status = BorrowStatus.Available;
Console.WriteLine($"Initial status: {status}");

bool TryBorrow()
{
    if (status != BorrowStatus.Available)
    {
        return false;
    }
    status = BorrowStatus.Borrowed;
    return true;
}

bool TryReturn()
{
    if (status != BorrowStatus.Borrowed)
    {
        return false;
    }
    status = BorrowStatus.Available;
    return true;
}

Console.WriteLine($"TryBorrow() from Available: {TryBorrow()}, status now: {status}");
Console.WriteLine($"TryBorrow() again while already Borrowed: {TryBorrow()}, status still: {status}");
Console.WriteLine($"TryReturn() from Borrowed: {TryReturn()}, status now: {status}");
Console.WriteLine($"TryReturn() again while already Available: {TryReturn()}, status still: {status}");

enum BorrowStatus
{
    Available,
    Borrowed
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Initial status: Available
TryBorrow() from Available: True, status now: Borrowed
TryBorrow() again while already Borrowed: False, status still: Borrowed
TryReturn() from Borrowed: True, status now: Available
TryReturn() again while already Available: False, status still: Available
```

*What this proves:* `TryBorrow()` and `TryReturn()` each check the
*current* state before changing anything — `TryBorrow()` called a
second time, while already `Borrowed`, correctly returns `False` and
leaves `status` untouched, rather than silently "re-borrowing" (which
would make no sense — borrowed by whom, the second time?). `TryReturn()`
called while already `Available` is rejected the same way. Every
successful transition also moves to exactly one new state — there's no
third option, no way to end up somewhere `BorrowStatus` doesn't name.

### Discard the Throwaway Example
Delete the `lab-statemachine` folder. `BorrowStatus` and the
guard-before-transition pattern are not discarded — `InventoryItem`'s
real borrow tracking uses exactly this next.

### Mechanical Walkthrough

- `enum BorrowStatus { Available, Borrowed }` — reappearing (`enum`
  itself, Lesson 12), two members this time instead of five — the
  *number* of states isn't what makes this a state machine; the
  transition rules are.
- `if (status != BorrowStatus.Available) { return false; }` — **first
  appearance of a transition guard.** Checks the *current* state before
  permitting a change — the entire mechanism that makes some transitions
  valid and others not, expressed as a plain `if`, nothing more exotic.
- `TryBorrow()`/`TryReturn()` returning `bool` — (first appearance of
  this specific shape in this project, though `TryGetValue` back in
  Lesson 1a already established the general "Try-prefixed method
  reporting success as a `bool`" convention) — the caller gets a real,
  checkable answer instead of the guard failing silently or throwing.

### CS Lens

This is a **finite state machine**, named directly: two states
(`Available`, `Borrowed`), and exactly two allowed transitions
(`Available → Borrowed`, `Borrowed → Available`) — every other
combination (`Available → Available`, `Borrowed → Borrowed`) is
explicitly disallowed by the guards, not merely unusual. Real-world
systems built on exactly this shape: a traffic light (Red → Green →
Yellow → Red, never Red → Yellow directly); a vending machine (Idle →
Selecting → Dispensing → Idle); an HTTP connection (Closed →
Connecting → Open → Closing → Closed). This project's own `editingItemId`
(Lesson 21) was a small, informal instance of the identical idea, named
properly here for the first time.

### SE Lens

Why write `TryBorrow`/`TryReturn` as guarded methods at all, instead of
just letting any code set `item.BorrowStatus = BorrowStatus.Borrowed;`
directly, the same way `IsFavorite`/`IsArchived` are set freely? Because
a plain property setter has no way to say no — anything with a reference
to the item could set an invalid status by accident, and nothing would
catch it. A guarded method is the difference between "this fact happens
to usually be set correctly" and "this fact is structurally impossible to
set incorrectly through this path" — the same reasoning `AddCommand`'s
`CanExecute` already applied to *user-facing* actions, now applied to
the underlying data change itself.

### Connection

`InventoryItem`'s real `BorrowStatus`, `BorrowedBy`, and `BorrowedDate`
are built exactly this way next.

---

## Concept Unit: Growing the Schema — `BorrowStatus`, `BorrowedBy`, `BorrowedDate`

### The Problem

`InventoryItem` needs three new, related facts: whether it's currently
borrowed, by whom, and since when — the second and third only ever
meaningful while the first is `Borrowed`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryItem.cs`, `InventoryViewModel.cs`
  (schema/load/save methods).
- **Change type:** Add.
- **Dependencies:** `BorrowStatus`, previous unit; `DateTime?`, Lesson
  14 (reused for `BorrowedDate`, the identical "genuinely absent, not a
  fake sentinel" reasoning).

### The New Code — `InventoryItem` Growth

```csharp
public enum BorrowStatus
{
    Available,
    Borrowed
}
```

```csharp
private BorrowStatus borrowStatus = BorrowStatus.Available;

public BorrowStatus BorrowStatus
{
    get { return borrowStatus; }
    set
    {
        borrowStatus = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(BorrowStatus)));
    }
}

private string borrowedBy = string.Empty;

public string BorrowedBy
{
    get { return borrowedBy; }
    set
    {
        borrowedBy = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(BorrowedBy)));
    }
}

private DateTime? borrowedDate;

public DateTime? BorrowedDate
{
    get { return borrowedDate; }
    set
    {
        borrowedDate = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(BorrowedDate)));
    }
}
```

### The New Code — the Table Shape

```csharp
command.CommandText = "... IsArchived INTEGER NOT NULL DEFAULT 0, BorrowStatus TEXT NOT NULL DEFAULT 'Available', BorrowedBy TEXT NOT NULL DEFAULT '', BorrowedDate TEXT NULL, FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id))";
```

### Mechanical Walkthrough

- `public enum BorrowStatus { Available, Borrowed }` — reappearing
  exactly (this lesson's first unit), moved from the throwaway lab into
  real project code, unchanged.
- `private BorrowStatus borrowStatus = BorrowStatus.Available;` —
  explicit initializer this time, unlike `Category`'s own field (which
  relies on the implicit default, member `0`) — worth being explicit
  here specifically because `Available` being the correct starting state
  is a meaningful fact about this project's domain, not an accident of
  which member happens to be declared first.
- `BorrowStatus TEXT NOT NULL DEFAULT 'Available'` — reappearing
  (`enum`-as-`TEXT` storage, Lesson 12), the identical `ToString()`/
  `Enum.Parse` round-trip this project already knows.
- `BorrowedDate TEXT NULL` — reappearing (`PurchaseDate`'s own nullable
  column shape, Lesson 14) — genuinely absent until an item is actually
  borrowed.

### CS Lens

Three fields, added together, precisely because they only ever make
sense *together* — `BorrowedBy`/`BorrowedDate` are meaningless while
`BorrowStatus` is `Available`, and this project's own convention (an
empty `string`/`null` `DateTime?`) represents exactly that, the same
"absence is a real, first-class state" idea `Nullable<T>` has represented
since Lesson 14, now extended informally to a `string` too.

### SE Lens

Why not model this as three completely independent, uncoordinated
fields, each free to hold any value regardless of the other two —
`BorrowedBy` set while `BorrowStatus` is `Available`, for instance?
Because nothing about the database schema *forces* them to stay
consistent — SQLite has no idea `BorrowedBy` should be empty whenever
`BorrowStatus` is `Available`. That consistency is this project's own
responsibility entirely, which is exactly why the next unit's guarded
`TryBorrow`/`TryReturn` methods — not direct property assignment — are
the only path this project uses to change any of the three, ever.

### Connection

`BorrowStatus`'s valid transitions, guarded exactly like this lesson's
lab, are wired into real commands next.

---

## Concept Unit: `BorrowCommand` and `ReturnCommand`

### The Problem

The three new fields exist, but nothing enforces the valid-transition
rule this lesson's whole point depends on — without a guard, any code
could still set `BorrowStatus` directly and skip the rule entirely.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `RelayCommand`, Lesson 23; this lesson's guard
  pattern.

### The New Code — the Buttons

```xml
<TextBox x:Name="BorrowerNameBox" Width="140" Margin="12,0,0,0" />
<Button Content="Borrow"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Command="{Binding BorrowCommand}"
        CommandParameter="{Binding ElementName=BorrowerNameBox, Path=Text}" />
<Button Content="Return"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Command="{Binding ReturnCommand}" />
```

### The New Code — the Commands

```csharp
public RelayCommand BorrowCommand { get; }
public RelayCommand ReturnCommand { get; }

// In the constructor:
BorrowCommand = new RelayCommand(
    execute: parameter => TryBorrow(SelectedItem!, (string)parameter!),
    canExecute: _ => SelectedItem?.BorrowStatus == BorrowStatus.Available);

ReturnCommand = new RelayCommand(
    execute: _ => TryReturn(SelectedItem!),
    canExecute: _ => SelectedItem?.BorrowStatus == BorrowStatus.Borrowed);

private bool TryBorrow(InventoryItem item, string borrowerName)
{
    if (item.BorrowStatus != BorrowStatus.Available || string.IsNullOrWhiteSpace(borrowerName))
    {
        return false;
    }

    item.BorrowStatus = BorrowStatus.Borrowed;
    item.BorrowedBy = borrowerName;
    item.BorrowedDate = DateTime.Now;
    UpdateItemInDatabase(item);
    return true;
}

private bool TryReturn(InventoryItem item)
{
    if (item.BorrowStatus != BorrowStatus.Borrowed)
    {
        return false;
    }

    item.BorrowStatus = BorrowStatus.Available;
    item.BorrowedBy = string.Empty;
    item.BorrowedDate = null;
    UpdateItemInDatabase(item);
    return true;
}
```

### Mechanical Walkthrough

- `CommandParameter="{Binding ElementName=BorrowerNameBox, Path=Text}"`
  — (first appearance of `CommandParameter`) — passes an extra value
  along with a command's `Execute`/`CanExecute` calls — here, whatever's
  currently typed in `BorrowerNameBox`, read fresh at the moment Borrow
  is clicked, without needing a separate bound property just to carry it.
- `canExecute: _ => SelectedItem?.BorrowStatus == BorrowStatus.Available`
  — reappearing (`RelayCommand`'s `canExecute`, Lesson 23), this
  lesson's actual payoff: the Borrow button visibly disables itself for
  an already-borrowed item, and Return disables itself for an already-
  available one — the guard from this lesson's first unit, now enforced
  automatically at the UI level, not just inside the method body.
- `TryBorrow`/`TryReturn` — reappearing exactly (this lesson's first
  unit's own methods), moved into the real ViewModel, still returning
  `bool`, still checking state before changing it — belt-and-suspenders
  with the `CanExecute` check: the UI shouldn't ever let an invalid call
  through, but the guard inside the method is what makes that true
  structurally, not just because the UI currently happens to prevent it.

### CS Lens

Two independent layers enforce the identical rule: `CanExecute` stops an
invalid transition from being *attempted* through the UI; the guard
inside `TryBorrow`/`TryReturn` stops it from *succeeding* even if
something else called the method directly. This is **defense in depth**
— the same principle behind `IDataErrorInfo` (a UI-level validation hint)
existing alongside a database's own `NOT NULL`/`FOREIGN KEY` constraints
(Lessons 9, 24): two layers, checking the same rule for two different,
independent reasons, so a hole in one doesn't silently become a real bug.

### SE Lens

Why does `TryBorrow` still check `item.BorrowStatus != BorrowStatus.Available`
even though `CanExecute` already guarantees it, given the button
literally cannot be clicked otherwise? Because `CanExecute` is a UI-layer
guarantee — true for as long as nothing else changes the item's state
between the button becoming enabled and the moment it's actually
clicked. This project is single-user and single-threaded today, so that
gap is currently impossible to hit in practice — but the method's own
guard costs nothing to keep, and is what would still be correct if that
assumption ever stopped being true (a future networked or multi-window
version, for instance) rather than silently relying on a UI-layer
guarantee that stops being airtight the moment the surrounding
assumptions change.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: select an available item, type a borrower's
name, click Borrow — `BorrowStatus` becomes `Borrowed`, and the Borrow
button itself disables while Return enables. Select a different,
still-available item; Borrow is enabled again, Return disabled. Click
Return on the borrowed item: it becomes `Available` again, `BorrowedBy`
clears, and the buttons swap back. Try clicking Borrow with the name box
left empty: nothing happens — `TryBorrow`'s own guard (not `CanExecute`,
which only checks status) catches it.

### Connection

Epic 7 is complete: duplication is safe, deletion has a reversible
option, and borrowing is a real, guarded state machine instead of a bare
flag. Epic 8 turns to a different kind of correctness — letting the
database compute real totals and summaries, instead of looping over
every item in C# to do it by hand.

---

## Closing

### Connect the Pieces

Selecting an available item enables the Borrow button because
`BorrowCommand`'s `CanExecute` checks `SelectedItem?.BorrowStatus == BorrowStatus.Available`
— the identical guard condition this lesson's first unit proved with
real, contrasting output (`TryBorrow` succeeding once, failing on a
second attempt). Clicking Borrow, with a real name typed into
`BorrowerNameBox` and passed through as `CommandParameter`, calls
`TryBorrow`, which re-checks the same guard before actually changing
`BorrowStatus`, `BorrowedBy`, and `BorrowedDate` together and persisting
all three via `UpdateItemInDatabase`. Return mirrors the exact same
shape in the opposite direction — two independently enforced guards
(`CanExecute` and the method's own check) protecting the identical rule.

### What Breaks Without This

Temporarily remove `canExecute: _ => SelectedItem?.BorrowStatus == BorrowStatus.Available`
from `BorrowCommand` (replacing it with `canExecute: _ => true`, always
enabled) while leaving `TryBorrow`'s own internal guard in place. Rerun,
select an already-borrowed item, and click Borrow again. Real,
representative result: the button click does nothing — `TryBorrow`'s own
`if` still correctly rejects it — but the button itself stayed enabled
the whole time, visually promising an action that silently fails,
exactly the confusing, misleading state `CanExecute`-driven `IsEnabled`
has protected this project against since Lesson 23. Restore the real
`canExecute` check afterward.

### Exercises

- In the `lab-statemachine` throwaway pattern, add a third state,
  `Lost`, with your own chosen valid transitions (for example,
  `Borrowed → Lost`, but never `Available → Lost` directly) — write the
  guard methods and confirm, with real output, that every valid and
  invalid transition you defined behaves exactly as intended.
- Predict, in your own words, what `TryReturn`'s guard should check if
  this project later added a third status, `Reserved` (held, but not yet
  physically borrowed) — which specific status or statuses should
  legitimately allow a transition to `Available`?
- Draw (on paper, or in words) the complete state diagram this lesson's
  two-state, two-transition system represents — then compare it to a
  real state machine you interact with daily (a phone's lock screen, a
  washing machine, a traffic light) and name its own states and
  transitions.

### Definition of Done

- [ ] `BorrowStatus` (`enum`), `BorrowedBy` (`string`), and
      `BorrowedDate` (`DateTime?`) all exist on `InventoryItem` and
      persist correctly.
- [ ] Borrow and Return buttons exist, each disabling itself
      automatically when its transition isn't currently valid.
- [ ] Borrowing requires a real, non-blank borrower name.
- [ ] Returning clears `BorrowedBy` and `BorrowedDate` correctly.
- [ ] You reproduced the misleading-enabled-button regression on purpose,
      confirmed the button stays clickable but does nothing, and restored
      the real `CanExecute` check.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add guarded Borrow/Return state machine — Epic 7 complete"`.
