# Lesson 27: Two Names for the Same Thing Is Not a Copy

*(Shallow copy vs. deep copy)*

**User Story**
> As a user, I want to duplicate an item — editing the copy should never
> change the original.

**What you will build**
A "Duplicate" button, producing a genuinely independent second item.
This lesson formalizes something already used informally, back in Lesson
21: copying an object's fields, one at a time, into a new object.
Lesson 21 worked because every field on `InventoryItem` happens to be
either a value type or an immutable `string`. This lesson proves — with a
real, reproducible bug — exactly when that same field-by-field approach
silently stops being safe, so the guarantee `InventoryItem`'s current
Duplicate feature relies on is something you've actually verified, not
just assumed.

**What you need to know first:** Lesson 21: field-by-field copying,
`draft.Name = selected.Name;`. Lesson 6: `class`, `new`.

**Terms introduced in this lesson:**
- **Reference semantics** — when a variable holds a *reference* to an
  object, and copying that variable copies the reference, not the
  object; two variables can end up pointing at the exact same object.
- **Value semantics** — when copying a variable copies the actual data;
  two variables are always independent afterward.
- **Shallow copy** — copying an object field by field, where any field
  that's itself a reference type copies the reference, not a new object.
- **Deep copy** — a copy where every reference-type field is itself
  recursively copied, so no mutable state is ever shared between
  original and copy.

**Objects and methods used**
- **`object.ReferenceEquals(object?, object?)`**
  - *What it is:* a check for whether two variables point at the
    literal same object in memory, as opposed to `==`, which some
    types override to compare contents instead.
  - *Implementation:* a `static` method on `System.Object`, inherited
    by every type. Never overridable — it always means exactly
    "are these the same object," regardless of what a type's own `==`
    does.
  - *Its use:* this lesson's own real, decisive proof — `ReferenceEquals(original.Tags,
    shallowCopy.Tags)` returning `True` is what actually demonstrates
    a shallow copy shares its reference-type fields, not just an
    assertion.
- **`string.Join(string, IEnumerable<string>)`**
  - *What it is:* combines a sequence of strings into one, with a
    given separator inserted between each.
  - *Implementation:* a `static` method on `System.String`.
  - *Its use:* `string.Join(", ", original.Tags)` — formats each lab's
    `List<string>` for readable `Console.WriteLine` output.

Shallow vs. deep copy, and the copy-constructor pattern used to achieve
it, are this lesson's own subject (a design pattern, not an external
class or method), given full treatment above in Terms Introduced and in
the Concept Units below.

**Everything else in the file, not this lesson's subject but still
explained**
- **`List<T>`**
  - *What it is:* .NET's standard growable collection.
  - *Implementation:* full treatment already given in
    `Lesson-06-fields-classes-and-list.md`.
  - *Its use:* `Cat.Tags`, this lesson's own example reference-type
    field, standing in for any mutable collection field on a real
    class.
- **`Console.WriteLine`**
  - *What it is:* .NET's way of printing a line of text to the running
    program's terminal.
  - *Implementation:* full treatment already given in
    `Lesson-00-a-classes-objects-and-inheritance.md`.
  - *Its use:* every real output shown in this lesson's two labs.

---

## Concept Unit: Where a Shallow Copy Silently Breaks

### The Problem

Copying an object field by field — exactly Lesson 21's `draft.Name = selected.Name;`
pattern — looks complete. Whether it actually *is* complete depends
entirely on what each field's type is, in a way that isn't obvious just
from reading the copy code itself.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-shallowcopy
cd lab-shallowcopy
```

Replace `Program.cs`:

```csharp
Cat original = new Cat { Name = "Whiskers", Tags = new List<string> { "orange", "friendly" } };

Cat shallowCopy = new Cat { Name = original.Name, Tags = original.Tags };

Console.WriteLine("Before mutating the copy's tags:");
Console.WriteLine($"  original.Tags: {string.Join(", ", original.Tags)}");
Console.WriteLine($"  shallowCopy.Tags: {string.Join(", ", shallowCopy.Tags)}");
Console.WriteLine($"  Same List<string> instance? {ReferenceEquals(original.Tags, shallowCopy.Tags)}");

shallowCopy.Tags.Add("mischievous");

Console.WriteLine("After adding 'mischievous' to shallowCopy.Tags only:");
Console.WriteLine($"  original.Tags: {string.Join(", ", original.Tags)}");
Console.WriteLine($"  shallowCopy.Tags: {string.Join(", ", shallowCopy.Tags)}");

class Cat
{
    public string Name { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new List<string>();
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Before mutating the copy's tags:
  original.Tags: orange, friendly
  shallowCopy.Tags: orange, friendly
  Same List<string> instance? True
After adding 'mischievous' to shallowCopy.Tags only:
  original.Tags: orange, friendly, mischievous
  shallowCopy.Tags: orange, friendly, mischievous
```

*What this proves:* `Tags = original.Tags` copies the *reference* to
one specific `List<string>` object, not a new list — `ReferenceEquals`
confirms it directly: `True`, the exact same object, reachable through
two different variables. Adding `"mischievous"` to `shallowCopy.Tags`
therefore changes the *one* list both objects are pointing at —
`original.Tags` shows the addition too, even though nothing ever wrote
to `original.Tags` directly. `Name`, copied the exact same way
(`Name = original.Name`), never has this problem, because `string` is
**immutable** (Lesson 6) — there's no way to "mutate" a `string` in
place the way `List<string>.Add` mutates a list, so sharing a reference
to one is harmless.

### Discard the Throwaway Example
Keep `lab-shallowcopy` — the fix, in the next unit, builds directly on
it.

### Mechanical Walkthrough

- `Tags = original.Tags` — reappearing (plain property assignment,
  familiar since Lesson 1), the specific consequence worth naming:
  `List<string>` is a **reference type** — assigning it copies the
  reference (an address, conceptually), not the list's actual contents.
- `ReferenceEquals(original.Tags, shallowCopy.Tags)` — (first appearance)
  — checks whether two references point at the literal same object in
  memory, as opposed to `==`/`.Equals()`, which for many types compares
  *contents* instead — the precise tool for proving "these are the same
  object," not just "these look the same."
- `shallowCopy.Tags.Add("mischievous")` — mutates the list *in place* —
  no new list is created, no property is reassigned; the one shared
  `List<string>` object itself changes, visible through both variables
  that reference it.

### CS Lens

This is **reference semantics**, the general C# rule this project has
relied on informally since `Items.Add(NewItemDraft)` first ran back in
Lesson 6: every `class` (unlike `struct`, which this project hasn't
used) is a reference type, and every variable of a `class` type holds a
reference, not the object itself. Copying that variable — a field
assignment, a method parameter, an `Items[index] = ...` — always copies
the reference. Whether that's a bug depends entirely on whether anything
afterward mutates the object through one reference while expecting the
other to stay unaffected. This is the identical, language-independent
idea `mutable-object-aliasing.md` covers in full, in Python instead of
C#: two names referring to the same underlying object, where a mutation
through either one is visible through both, purely because there was
never more than one real object to begin with.

### SE Lens

Why didn't this bug ever surface in Lesson 21's own `NewItemDraft`
copy, given it uses the exact same field-by-field pattern? Because every
field `InventoryItem` actually has — `Name`, `Location`, `Notes`,
`SerialNumber`, `PhotoPath` (all `string`, immutable); `Category`
(an `enum`, a value type); `Value` (`decimal`, a value type);
`PurchaseDate` (`DateTime?`, a value type); `IsFavorite`
(`bool`, a value type); `SupplierId` (`int`, a value type) — happens to
be either immutable or a value type. Lesson 21's copy was correct, but
*correct by luck of which types `InventoryItem` currently has*, not
because field-by-field copying is inherently safe. This lesson makes
that dependency explicit instead of leaving it an unexamined assumption.

### Connection

The next unit fixes `Cat`'s copy for real — a genuine deep copy.

---

## Concept Unit: A Genuine Deep Copy

### The Problem

`shallowCopy` and `original` need to be completely independent — editing
one's `Tags` should never affect the other's.

### Introduce the Concept in Isolation
Continuing in `lab-shallowcopy`, replace `Program.cs`:

```csharp
Cat original = new Cat { Name = "Whiskers", Tags = new List<string> { "orange", "friendly" } };

Cat deepCopy = new Cat { Name = original.Name, Tags = new List<string>(original.Tags) };

Console.WriteLine($"Same List<string> instance? {ReferenceEquals(original.Tags, deepCopy.Tags)}");

deepCopy.Tags.Add("mischievous");

Console.WriteLine("After adding 'mischievous' to deepCopy.Tags only:");
Console.WriteLine($"  original.Tags: {string.Join(", ", original.Tags)}");
Console.WriteLine($"  deepCopy.Tags: {string.Join(", ", deepCopy.Tags)}");

class Cat
{
    public string Name { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new List<string>();
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Same List<string> instance? False
After adding 'mischievous' to deepCopy.Tags only:
  original.Tags: orange, friendly
  deepCopy.Tags: orange, friendly, mischievous
```

*What this proves:* `new List<string>(original.Tags)` — (first
appearance of this specific constructor overload) — creates a genuinely
new `List<string>`, pre-populated by copying every element out of
`original.Tags`, not the same list. `ReferenceEquals` now correctly
reports `False`. Adding `"mischievous"` to `deepCopy.Tags` changes only
that new list — `original.Tags` stays exactly as it started, proving the
two objects are now fully independent.

### Discard the Throwaway Example
Delete the `lab-shallowcopy` folder. The `new List<string>(original.Tags)`
pattern is not discarded — worth remembering the general shape (a `new`
container, built from the old one's contents) any time a real reference
type field needs a genuine copy.

### Mechanical Walkthrough

- `Tags = new List<string>(original.Tags)` — **first appearance of a
  genuine deep copy.** `List<T>`'s own constructor, given an existing
  `IEnumerable<T>`, copies every element into a brand-new backing array —
  the new list shares no storage with the old one, even though every
  individual `string` element inside it is (harmlessly) still the same
  shared reference, since `string` is immutable.

### CS Lens

This is **value semantics achieved by hand** — `Cat` itself is still a
reference type, and `deepCopy` is still a genuinely different `Cat`
object from `original` (true even for the shallow version), but this
fix makes `deepCopy`'s own *state* — everything reachable by following
its fields — fully independent, the same guarantee a true value type
(`struct`) would give automatically. C# doesn't magically make this safe;
every reference-type field needs this treatment explicitly, one level at
a time, which is exactly why "deep" implies recursion — a field that's
itself a class with its own reference-type fields would need the same
fix applied one level deeper again.

### SE Lens

Why not just make `Cat` immutable instead — no `Tags.Add` method
reachable at all — sidestepping the whole shallow-copy question?
Because a genuinely append-only, ever-growing list of tags (or, in this
project's real case, nothing currently needs this) is a legitimate,
common shape; immutability is a real, valid design choice elsewhere in
this project (`string`'s own guarantee is exactly that), but it isn't
free — an immutable collection means "adding a tag" replaces the whole
collection instead of mutating it in place, a real tradeoff, not a
strictly superior alternative.

### Connection

`InventoryItem`'s own Duplicate feature, verified safe under exactly
this lens, is built next.

---

## Concept Unit: Duplicating an `InventoryItem`

### The Problem

Nothing in this project lets a user duplicate an item — a real,
practical need (a batch of near-identical items, one entered, the rest
duplicated and lightly adjusted) this project's user story asks for
directly.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** This lesson's proof that `InventoryItem`'s current
  fields are all safe to copy field by field.

### The New Code — the Button

```xml
<Button Content="Duplicate"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Command="{Binding DuplicateCommand}" />
```

### The New Code — the Command

```csharp
public RelayCommand DuplicateCommand { get; }

// In the constructor:
DuplicateCommand = new RelayCommand(
    execute: _ => Duplicate(),
    canExecute: _ => SelectedItem != null);

private void Duplicate()
{
    InventoryItem source = SelectedItem!;

    InventoryItem copy = new InventoryItem
    {
        Name = source.Name + " (Copy)",
        Category = source.Category,
        Location = source.Location,
        Value = source.Value,
        PurchaseDate = source.PurchaseDate,
        Notes = source.Notes,
        IsFavorite = source.IsFavorite,
        SupplierId = source.SupplierId,
        SupplierName = source.SupplierName,
        SerialNumber = source.SerialNumber,
        PhotoPath = string.Empty
    };

    Items.Add(copy);
    SaveItemToDatabase(copy);
}
```

### Mechanical Walkthrough

- Every field copied individually — reappearing exactly (Lesson 21's
  pattern, this lesson's own opening example), now with the explicit
  justification this lesson just proved: every one of these eleven
  fields is either an immutable `string`, or a value type
  (`Category`/`Value`/`PurchaseDate`/`IsFavorite`/`SupplierId`) — no
  field here can produce the shared-mutable-state bug this lesson's
  first unit demonstrated.
- `PhotoPath = string.Empty` — (first appearance of a field
  *deliberately* not copied) — worth naming directly: copying the
  original's `PhotoPath` string would technically be a safe, correct
  shallow copy (it's a `string`), but it would point the duplicate at
  the *exact same photo file* the original uses — deleting the
  duplicate later would delete that shared file out from under the
  original too (Lesson 26's own cleanup code would do exactly that,
  correctly, per its own logic — the bug here isn't in `RemoveItem`,
  it's in letting two items share one file's ownership in the first
  place). Starting the duplicate with no photo is the honest, safe
  choice; a more complete version could copy the photo file itself,
  genuinely deep-copying it, the same principle as this lesson's `Tags`
  fix, applied to a file instead of a list.
- `Name = source.Name + " (Copy)"` — reappearing (`string` concatenation,
  assumed known from this project's stated floor), giving the duplicate
  a visibly distinct name rather than an exact, confusing duplicate of
  the original's.

### CS Lens

This unit is the direct payoff of the lesson's first two units:
`InventoryItem`'s Duplicate feature is correct not because copying an
object field by field is generally safe, but because this specific
project verified, explicitly, that none of its fields are the kind of
reference type that breaks under that approach — and where one field
*would* need special handling (`PhotoPath`, if copied naively), it's
handled deliberately instead of silently.

### SE Lens

What would have to happen for this Duplicate feature to silently break
in the future? Adding any new mutable reference-type field to
`InventoryItem` — a `List<string> Tags`, a `List<string> AdditionalPhotoPaths`,
anything shaped like this lesson's own `Cat` example — without also
updating `Duplicate` to deep-copy it specifically. This is real, concrete
technical debt worth naming rather than hiding: this lesson's guarantee
is correct *today*, checked by hand, not enforced by the compiler in any
way that would catch a future violation automatically.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: select an item, click Duplicate — a new row
appears, name suffixed `" (Copy)"`, every other field matching the
original exactly, and no photo (even if the original had one). Edit the
duplicate's name; the original's name is completely unaffected —
`ReferenceEquals` would report `False` for the two `InventoryItem`
objects themselves, and (per this lesson's own proof) every field
between them is independent too.

### Connection

Duplication now works, verified safe by understanding *why*, not by
assuming field-by-field copying always is. The next lesson addresses
deletion again, from a different angle: the difference between removing
an item permanently (Lesson 22) and archiving it — recoverable, not gone.

---

## Closing

### Connect the Pieces

Clicking Duplicate copies `SelectedItem`'s eleven fields individually
into a brand-new `InventoryItem` — the exact field-by-field pattern
proven safe, specifically for `InventoryItem`'s own field types, by this
lesson's first two units' real, contrasting `ReferenceEquals` and mutation
proofs. `PhotoPath` is the one deliberate exception, reset to empty
rather than shared, avoiding the exact shared-mutable-reference bug
`Tags` demonstrated — here, a shared file instead of a shared list, the
identical underlying problem in a different shape.

### What Breaks Without This

Temporarily change `Duplicate`'s `PhotoPath = string.Empty` to
`PhotoPath = source.PhotoPath` (copying it directly, the naive shallow
approach). Attach a photo to an item, duplicate it, then delete the
*duplicate* using the normal Delete flow (Lesson 22/26). Real,
representative failure: `RemoveItem`'s cleanup code (Lesson 26) correctly
deletes the file at `PhotoPath` — except both items were pointing at the
exact same file, so the *original* item's photo silently disappears too,
its `DetailPanel` thumbnail now broken (the same
`File.Exists(SelectedItem.PhotoPath)` check from Lesson 25 catches this
gracefully, showing no image, rather than crashing — but the real photo
is still permanently gone). This is precisely the shared-mutable-reference
bug this lesson's `Tags` example demonstrated, now with real,
user-visible consequences instead of a console `WriteLine`. Restore
`PhotoPath = string.Empty` afterward.

### Exercises

- In the `lab-shallowcopy` throwaway pattern, add a second mutable field
  to `Cat` (for example, `List<string> FavoriteToys`) and confirm, with
  real output, that the deep-copy fix needs to be applied to *each*
  reference-type field independently — copying `Tags` correctly doesn't
  automatically make `FavoriteToys` safe too.
- Predict, in your own words, what `ReferenceEquals(copy, source)` would
  report for the real `Duplicate` method above (the two whole
  `InventoryItem` objects, not any one field) — then confirm by adding a
  temporary debug line.
- Write out, in your own words, what would need to change in `Duplicate`
  if this project ever added a `List<string> Tags` field to
  `InventoryItem` for real — name the exact line that would need to
  change and why, without writing the code.

### Definition of Done

- [ ] A "Duplicate" button exists, creating a real, independent copy of
      the selected item.
- [ ] Editing the duplicate never changes the original, for every field.
- [ ] The duplicate starts with no photo, never sharing the original's
      photo file.
- [ ] You reproduced the shared-photo-file bug on purpose (copying
      `PhotoPath` directly), confirmed deleting the duplicate destroys
      the original's photo too, and restored `PhotoPath = string.Empty`.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add item duplication, verified safe against shallow-copy bugs — Epic 7 begins"`.
