# Lesson 6: Modeling a Thing Before You Touch the Screen

*(Fields, Classes, and `List<T>`)*

**User Story**
> As a user, I want to enter the basic details of an inventory item.

**What you will build**
Every lesson so far has been about the *shell* — windows, navigation,
styling — with nothing behind it that resembles real inventory data at
all. This lesson opens Epic 2, and with it, this project's actual reason
to exist: typing a name into a real text box and clicking "Add" will make
it appear in a real, growing list on screen. Underneath that single
sentence is the actual transferable problem this lesson is about: before
any of that can happen, "an inventory item" has to become a real C# type
— a `class` — so that the rest of the program has something concrete to
create, store, and pass around, instead of a loose string floating
through the code with no name of its own. Per this project's Epic 2
design (see `CURRICULUM_NOTES.md`), this lesson deliberately builds the
*smallest possible* item — a name, and nothing else — all the way through
to something visible, rather than modeling every field an inventory item
will eventually need before any of them can be seen on screen.

**What you need to know first**
Lesson 3: `Page`, `NavigationService.Navigate`, and specifically
`AddItemPage` — this lesson replaces that lesson's placeholder with the
real feature. Lesson 5: `{StaticResource ToolbarButtonStyle}`, reused on
this lesson's new button.

---

## Concept Unit: `class` — Grouping Data Under One Name

### The Problem

Right now, if this project needed to remember an item's name, the only
tool available is a bare `string` variable — fine for exactly one piece
of data, but an inventory item is a *thing*, and "a thing" deserves its
own name in the program, not just a string sitting in a variable that
happens to be used for that purpose this one time.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-class
cd lab-class
```

Replace `Program.cs`:

```csharp
class Dog
{
    public string name;
}

Dog dog = new Dog();
dog.name = "Rex";
Console.WriteLine(dog.name);
```

Run it:

```bash
dotnet run
```

Real output:

```text
Rex
```

*What this proves:* `class Dog { public string name; }` declares a new
**type** — a blueprint describing that every `Dog` has a `name`. `Dog dog
= new Dog();` does two separate things worth pulling apart: `Dog dog`
declares a variable of type `Dog`; `new Dog()` actually **constructs** a
real object in memory matching that blueprint, and `=` stores a reference
to it in `dog`. `dog.name = "Rex";` reaches into that specific object and
sets its `name` **field** — a named piece of storage every `Dog` object
carries. `Console.WriteLine(dog.name)` reads it back. Nothing here is
possible with a bare `string` alone — `Dog` is a real, new category of
thing this program now understands.

### Discard the Throwaway Example
Delete the `lab-class` folder. `Dog` never appears again — the real
project's type, `InventoryItem`, is built next, in the exact same shape.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  type this project has never needed until now.
- **Files affected:** New file `InventoryItem.cs`.
- **Change type:** Add.
- **Dependencies:** None beyond Lesson 0's project scaffold.

### The New Code

```csharp
namespace PocketInventory
{
    public class InventoryItem
    {
        public string Name;
    }
}
```

### The Updated Project

This is the whole new file — nothing surrounding it yet to show it
landing inside.

### Mechanical Walkthrough
1. `namespace PocketInventory { ... }` — (hard concept reappearing) the
   same namespace every other file in this project has declared since
   Lesson 0's `MainWindow.xaml.cs` — grouping every type this project
   defines under one shared name, so `InventoryItem` and, say, a
   completely unrelated library's own `InventoryItem` (if one existed)
   could never collide.
2. `public class InventoryItem` — (hard concept reappearing from the lab)
   the identical shape as `Dog`, `public` this time instead of left
   unspecified — (first appearance of `public` on a class specifically)
   `public` means any other file, in any other namespace, can see and use
   this type; leaving it off (as `Dog` did, implicitly `internal`, not
   covered further here) would restrict it to files inside the same
   project only — not yet a real constraint for this single-project
   curriculum, but the correct, explicit habit to build for when it
   eventually is.
3. `public string Name;` — (hard concept reappearing) a field, exactly
   like `Dog.name` — capitalized `Name` rather than lowercase `name`,
   following C#'s own naming convention (public members capitalized,
   distinct from Python's lowercase `snake_case` convention you already
   know) — worth naming directly since it's a real, visible difference
   from the language you already know, not an arbitrary style choice on
   this project's part.

### CS Lens

A `class` is the mechanism for **grouping related data under one type** —
the same underlying idea Python's own `class` keyword expresses, though
with real syntactic and behavioral differences this lesson has already
started surfacing (explicit field types, `public`, semicolons) and will
keep surfacing through the next several units. Modeling "an inventory
item" as its own type, before writing a single line of UI code for it, is
this lesson's named SE principle in action: **the data shape gets decided
first**, independent of how it will eventually be displayed.

### SE Lens

Why decide `InventoryItem`'s shape before writing any UI code at all,
instead of starting with the `TextBox` and figuring out the data model
afterward? Because a UI is one of potentially many ways to eventually
interact with this data — a form today, a `DataGrid` from Lesson 16, a
CSV export from Lesson 34, a JSON file from Lesson 36 — and every one of
those needs the *same* underlying `InventoryItem` type. Designing the
type first means every future feature that touches inventory data is
working with one stable, shared shape, rather than each screen inventing
its own slightly different local representation of "an item."

### Connection

`InventoryItem` exists but has never been constructed anywhere in the
real project yet. The next unit fixes a real problem with how it's
declared right now, before it's ever used for real.

---

## Concept Unit: Properties — `{ get; set; }` Instead of a Bare Field

### The Problem

`public string Name;` works, exactly as `Dog.name` did — but a bare
public field, once real code outside this class starts reading and
writing it, gives that outside code **direct, unmediated access** to the
object's internal storage, with zero opportunity for `InventoryItem`
itself to ever add a rule (reject an empty name, log a change, trigger a
UI refresh — the exact problem Lesson 7 is about) around what happens
when `Name` changes. C# has a dedicated language feature for exactly this
gap.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-property
cd lab-property
```

Replace `Program.cs`, first with the field version, to see the limitation
directly:

```csharp
class Cat
{
    public string name;
}

Cat cat = new Cat();
cat.name = "Whiskers";
Console.WriteLine(cat.name);
```

Run it — this behaves exactly like `Dog` did; nothing new yet. Now
rewrite `Cat` using a **property**, the long-hand form first, so every
piece is visible before the shorthand hides it:

```csharp
class Cat
{
    private string nameStorage;

    public string Name
    {
        get { return nameStorage; }
        set { nameStorage = value; }
    }
}

Cat cat = new Cat();
cat.Name = "Whiskers";
Console.WriteLine(cat.Name);
```

Run it:

```bash
dotnet run
```

Real output:

```text
Whiskers
```

*What this proves:* from the caller's point of view — `cat.Name = "Whiskers";`
then `Console.WriteLine(cat.Name);` — **nothing looks different at all**
from the field version. But `Name` is not storage itself anymore; it's
two methods, `get` and `set`, wrapped in syntax that *looks* like a
field from the outside. `set { nameStorage = value; }` runs every single
time `cat.Name = "Whiskers"` executes; `value` — (first appearance) — is
a special, automatically-available name inside a `set` block, holding
whatever was just assigned. Prove the actual point — that a property can
now *intercept* an assignment — by adding one line inside `set`:

```csharp
set
{
    Console.WriteLine($"Name is changing to: {value}");
    nameStorage = value;
}
```

Rerun — a new line prints every time `cat.Name` is assigned, something a
bare field could never do, because a field has no code that runs on
assignment at all; it's just a memory slot.

### Discard the Throwaway Example
Delete the `lab-property` folder. `Cat` never appears again — the real
project's `InventoryItem.Name` becomes a property next, using the
shorthand form this unit's final step introduces.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryItem.cs`.
- **Change type:** Replace.
- **Location:** The `Name` field declared in the previous unit.
- **Dependencies:** None new.

### The New Code

```csharp
public string Name { get; set; }
```

### The Updated Project

```csharp
namespace PocketInventory
{
    public class InventoryItem
    {
        public string Name { get; set; }  // ← changed (was: public string Name;)
    }
}
```

`InventoryItem` now exposes `Name` as a property instead of a bare field
— from any calling code's perspective, `item.Name = "Widget"` and
`item.Name` still read and write exactly as before; the difference is
entirely internal, and entirely about what this class is now *capable*
of doing later without breaking anyone who already uses `Name`.

### Mechanical Walkthrough
1. `public string Name { get; set; }` — (first appearance of the
   **auto-property** shorthand, hard concept reappearing underneath) this
   single line is compiler sugar for the long-hand version the lab wrote
   by hand — a hidden, compiler-generated backing field (playing the same
   role `nameStorage` did) plus a plain `get`/`set` pair that only reads
   and writes it, with no extra logic yet. Nothing is lost by using the
   shorthand today: because it's a genuine property under the hood, not a
   field, a future lesson (Lesson 7) can expand this exact line back into
   the long-hand form the moment real logic needs to run on assignment —
   without breaking any code that already uses `item.Name`.

### CS Lens

This is **encapsulation**: the object's internal representation (a
backing field) is hidden behind a controlled public interface (`get`/
`set`), even when — as here — that interface currently does nothing
beyond what direct field access would have. The value isn't in what it
does *today*; it's in what it makes possible *without breaking existing
callers* tomorrow.

Also recognized in: Java's near-universal getter/setter convention
(explicit, verbose methods doing exactly this by hand, since Java has no
auto-property shorthand); Python's `@property` decorator (the closest
direct equivalent — also lets a class start with plain attribute access
and later intercept it, without changing any calling code); and this
project's own sibling Android curriculum, which reaches encapsulation
independently, using Java's manual getter/setter methods for the
identical reason.

### SE Lens

Why pay for an auto-property's extra ceremony (`{ get; set; }`) over a
bare field, before there's any actual logic to add? This is the real,
honest tradeoff: a bare field is genuinely simpler to read, right now, for
`InventoryItem` exactly as it stands this lesson. The cost of choosing a
field instead would surface the moment a future lesson needs to react to
`Name` changing — Lesson 7's automatic list refresh specifically requires
a property, because only a property's `set` block can run code; a bare
field's assignment is a single CPU instruction with no way to intercept
it at all. Choosing the property now, before it's strictly needed, avoids
a breaking change later: every caller already written against
`item.Name = ...` keeps working, unmodified, the moment Lesson 7 adds
real logic inside `set`.

### Connection

`InventoryItem` is now a small, real, encapsulated type. The next unit
gives this project somewhere to actually keep more than one of them.

---

## Concept Unit: `List<T>` — a Growable Collection

### The Problem

Adding items one at a time means this project needs somewhere to keep
*all* of them, not just the most recent one — and the number of items a
user will eventually add is completely unknown ahead of time.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-list
cd lab-list
```

Replace `Program.cs`:

```csharp
List<string> names = new List<string>();
names.Add("Alpha");
names.Add("Bravo");
names.Add("Charlie");

Console.WriteLine(names.Count);
foreach (string name in names)
{
    Console.WriteLine(name);
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
3
Alpha
Bravo
Charlie
```

Three `.Add` calls build the list up front; the `foreach` afterward just
walks the result, in the same order it was built:

```
Iteration 1: names.Add("Alpha") → names = ["Alpha"]
Iteration 2: names.Add("Bravo") → names = ["Alpha", "Bravo"]
Iteration 3: names.Add("Charlie") → names = ["Alpha", "Bravo", "Charlie"]
```

```
Iteration 1: name = "Alpha" → printed
Iteration 2: name = "Bravo" → printed
Iteration 3: name = "Charlie" → printed
```

*What this proves:* `List<string>` is a built-in .NET collection type
that grows as needed; `.Add(...)` appends one more element, and nothing
about its size was decided up front the way a C# **array**
(`string[3]`, not used in this project, but worth naming as the
fixed-size alternative) would require. `.Count` reports how many
elements are currently stored, always accurate, updated automatically
by every `Add`. `foreach (string name in names)` visits every element
in order, once each; contrast this directly against Python's
`for name in names:`, which needs no declared type for `name` at all —
C#'s `foreach` requires stating `string` explicitly, checked by the
compiler against what `List<string>` actually holds.

### Discard the Throwaway Example
Delete the `lab-list` folder. `List<T>` itself is not discarded — the
real project uses it, for real, in the very next unit.

### Mechanical Walkthrough

- `List<string> names = new List<string>();` — **first appearance.**
  `List<T>` is the standard library's generic, growable collection —
  Lesson 6d's (Java track) `Box<T>` mechanism, already provided.
  `<string>` fills in what type this specific list holds.
- `.Add(...)` — **first appearance.** Appends one more element; the
  list's size grows automatically, with no upfront capacity to decide.
- `.Count` — **first appearance.** Reports how many elements are
  currently stored — always accurate, updated by every `Add`.
- `foreach (string name in names)` — **first appearance.** Visits every
  element in order, once each. Requires declaring `name`'s type
  (`string`) explicitly, checked against what `List<string>` actually
  holds — Python's `for name in names:` needs no such declaration.

### CS Lens

`List<T>` is a **generic type** — `T` is a placeholder the actual type
(`string`, or, in a moment, `InventoryItem`) fills in at the point you
declare one. `List<string>` and a future `List<InventoryItem>` are the
same underlying implementation, specialized differently, with the
compiler enforcing that a `List<string>` can never accidentally receive
an `InventoryItem` or vice versa — the identical static-typing guarantee
from Lesson 0, now applied to a collection instead of a single value.

Also recognized in: Java's `ArrayList<T>` (the direct equivalent);
TypeScript's `Array<T>`/`T[]`; and Python's own `list`, which is
dynamically typed and happily holds mixed types in one list — a real,
concrete contrast worth naming: `List<InventoryItem>` in C# structurally
cannot hold a `string` by accident, where a Python `list` could, silently,
until something tried to use it as an `InventoryItem` and failed at
exactly the wrong moment.

### SE Lens

Why `List<T>` instead of a plain C# array, which this project hasn't
used and, in fact, will likely never need to? An array's size is fixed
the moment it's created — adding a 51st item to a 50-element array
requires creating an entirely new, larger array and copying everything
over, by hand. `List<T>` does exactly that resizing internally,
automatically, the moment `.Add(...)` needs more room than currently
exists — the correct default for "an unknown, growing number of items,"
which describes literally every collection this entire project will ever
hold.

### Connection

The next unit constructs a real `List<InventoryItem>` inside the actual
Add Item screen, replacing Lesson 3's placeholder entirely.

---

## Concept Unit: `TextBox` and Wiring the Real Add Flow

### The Problem

Time to build the real screen: a `TextBox` for the user to type an item
name into, an "Add" button, and a list showing every item added so far —
replacing Lesson 3's `AddItemPage` placeholder text entirely.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `AddItemPage.xaml` (renamed conceptually to
  `InventoryPage.xaml` — see note below); `AddItemPage.xaml.cs`
  (likewise); `HomePage.xaml.cs`.
- **Change type:** Replace (the placeholder content), rename (the page
  itself, since it now does more than adding — it's this project's real
  working inventory screen, and will keep growing through the rest of
  Epic 2).
- **Location:** `HomePage.xaml.cs`'s `AddItemButton_Click`, currently
  navigating to `AddItemPage`.
- **Dependencies:** `InventoryItem`, `List<T>`, both from this lesson.

**A note on the rename, honestly stated:** Lesson 3 named this page
`AddItemPage` because, at the time, adding an item was its only job.
Starting this lesson, it also displays the growing list — and, from
Lesson 8 onward, item details too. Renaming it to `InventoryPage` now,
while it's still small, costs one clean rename; leaving the misleading
name and letting it compound for 15 more lessons would cost much more
later. Delete `AddItemPage.xaml` and `AddItemPage.xaml.cs`; create
`InventoryPage.xaml` and `InventoryPage.xaml.cs` in their place.

### The New Code — the Screen

```xml
<Page x:Class="PocketInventory.InventoryPage"
      xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
      xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <Grid Margin="24">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" />
            <RowDefinition Height="*" />
        </Grid.RowDefinitions>

        <StackPanel Grid.Row="0" Orientation="Horizontal">
            <TextBox x:Name="NameInput" Width="240" />
            <Button Content="Add"
                    Style="{StaticResource ToolbarButtonStyle}"
                    Margin="12,0,0,0"
                    Click="AddButton_Click" />
        </StackPanel>

        <ListBox x:Name="ItemListBox" Grid.Row="1" Margin="0,16,0,0" />
    </Grid>
</Page>
```

### The Updated Project

This is the whole new file — a two-row `Grid` (Lesson 2's exact pattern:
`Auto` for the input row, `*` for the growing list beneath it), the input
row itself a horizontal `StackPanel` (Lesson 1's control, `Orientation`
set for the first time to lay children left-to-right instead of its
default top-to-bottom) holding the `TextBox` and the styled Add button
side by side.

### Mechanical Walkthrough
1. `<StackPanel ... Orientation="Horizontal">` — (hard concept
   reappearing, new detail) `Orientation` — (first appearance) — an
   enum-backed property (Lesson 0's alignment properties, same category)
   whose default is `Vertical` (every `StackPanel` this project has used
   so far relied on that unstated default); `Horizontal` arranges
   children left to right instead.
2. `<TextBox x:Name="NameInput" Width="240" />` — (first appearance)
   instantiates `System.Windows.Controls.TextBox` — the control that
   actually accepts typed keyboard input, unlike `TextBlock` (Lesson 0),
   which only ever *displays* text and cannot be typed into at all.
   `x:Name="NameInput"` — (hard concept reappearing, Lesson 1) — the
   identical generated-field mechanism, needed here so code-behind can
   read whatever the user typed.
3. `<Button Content="Add" Style="{StaticResource ToolbarButtonStyle}" ... Click="AddButton_Click" />`
   — (hard concepts reappearing) Lesson 5's shared button style, applied
   for the first time to a button outside the header; `Click="..."`, the
   exact XAML event-wiring syntax from Lesson 3.
4. `<ListBox x:Name="ItemListBox" Grid.Row="1" .../>` — (first
   appearance) instantiates `System.Windows.Controls.ListBox` — a control
   that displays a scrollable, selectable list of items; empty for now,
   populated entirely from code-behind, starting in the next block.

### The New Code — the Click Handler

```csharp
private List<InventoryItem> items = new List<InventoryItem>();

private void AddButton_Click(object sender, RoutedEventArgs e)
{
    InventoryItem newItem = new InventoryItem { Name = NameInput.Text };
    items.Add(newItem);

    ItemListBox.Items.Clear();
    foreach (InventoryItem item in items)
    {
        ItemListBox.Items.Add(item.Name);
    }

    NameInput.Text = "";
}
```

### The Updated Project

`InventoryPage.xaml.cs`:

```csharp
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;

namespace PocketInventory
{
    public partial class InventoryPage : Page
    {
        private List<InventoryItem> items = new List<InventoryItem>();  // ← new

        public InventoryPage()
        {
            InitializeComponent();
        }

        private void AddButton_Click(object sender, RoutedEventArgs e)          // ← new
        {                                                                        // ← new
            InventoryItem newItem = new InventoryItem { Name = NameInput.Text }; // ← new
            items.Add(newItem);                                                  // ← new

            ItemListBox.Items.Clear();                                          // ← new
            foreach (InventoryItem item in items)                               // ← new
            {                                                                    // ← new
                ItemListBox.Items.Add(item.Name);                               // ← new
            }                                                                    // ← new

            NameInput.Text = "";                                                // ← new
        }                                                                        // ← new
    }
}
```

`InventoryPage` now owns its own `List<InventoryItem>`, growing by one
every time "Add" is clicked, with the entire `ListBox` manually cleared
and rebuilt from scratch after every single addition.

And `HomePage.xaml.cs`'s existing handler now targets the renamed page:

```csharp
private void AddItemButton_Click(object sender, RoutedEventArgs e)
{
    NavigationService.Navigate(new InventoryPage());  // ← changed (was AddItemPage)
}
```

### Mechanical Walkthrough
1. `private List<InventoryItem> items = new List<InventoryItem>();` —
   (hard concept reappearing) this lesson's `List<T>` unit, specialized
   to the real type this project just modeled — declared as a field on
   `InventoryPage` (not a local variable inside the click handler) so its
   contents survive between separate clicks; a local variable would be
   recreated, empty, every single time `AddButton_Click` ran.
2. `new InventoryItem { Name = NameInput.Text }` — (first appearance of
   **object initializer syntax**) constructs an `InventoryItem` and sets
   its `Name` property in one expression, without a separate constructor
   parameter list — equivalent to `InventoryItem newItem = new InventoryItem();
   newItem.Name = NameInput.Text;` written as two lines, expressed here as
   one. `NameInput.Text` — (hard concept reappearing, Lesson 1's
   `.Text` property, now read instead of written) — reads whatever the
   user currently has typed into the `TextBox`.
3. `items.Add(newItem);` — (hard concept reappearing, this lesson's lab)
   appends the new item to the growing list.
4. `ItemListBox.Items.Clear();` — (first appearance) `ListBox.Items` is
   itself a collection — every `ListBox` maintains its own internal list
   of what it's currently displaying; `.Clear()` empties it completely,
   the deliberately blunt first half of "wipe everything and rebuild it"
   — the manual refresh this lesson's User Story asked for, and exactly
   the repeated, wasteful pattern Lesson 7 exists to delete.
5. `foreach (InventoryItem item in items) { ItemListBox.Items.Add(item.Name); }`
   — (hard concept reappearing, this lesson's lab, new detail) — walks
   every item currently in the `items` list — not just the one just
   added — and re-adds each one's `Name` to the now-empty `ListBox`,
   from scratch, every single time.
6. `NameInput.Text = "";` — (hard concept reappearing) clears the input
   box after a successful add, ready for the next entry.

### Execution trace

```
User types "Hex Bolts", clicks Add:
    items = [ InventoryItem{Name="Hex Bolts"} ]
    ItemListBox.Items cleared, then rebuilt: [ "Hex Bolts" ]

User types "Shop Rags", clicks Add:
    items = [ InventoryItem{Name="Hex Bolts"}, InventoryItem{Name="Shop Rags"} ]
    ItemListBox.Items cleared, then rebuilt: [ "Hex Bolts", "Shop Rags" ]
```

Notice, concretely, what happens on the *second* click: `"Hex Bolts"` did
not need to change at all, and yet it was still removed from `ItemListBox`
and re-added, purely as a side effect of rebuilding the entire list to
correctly show the one genuinely new entry. This is the real, felt cost
Lesson 7's motivation names directly.

### CS Lens

Rebuilding the entire displayed list from the full underlying collection,
on every single change, is the simplest possible strategy for keeping a
view in sync with data — and also the least efficient one, doing
`O(n)` work (Lesson 48 names this notation properly) to reflect a change
that only ever added exactly one element. It works completely correctly
today, at this project's current, tiny scale — which is exactly why it's
the honest place to start, not a mistake.

### SE Lens

**Why write it this deliberately unoptimized way, when a better mechanism
(covered next lesson) already exists in WPF?** Because the "pain of
manual refresh" is this lesson's own named CS/SE motivation, per this
project's roadmap — and pain that's only described in prose, never
actually felt by writing and running the clunky version, doesn't teach
the same lesson a felt inconvenience does. Lesson 7 deletes
`ItemListBox.Items.Clear()` and the `foreach` rebuild entirely, replacing
both with a data-bound collection that updates itself — and that
deletion will mean far more, concretely, having first written the code
being deleted.

### Commands needed

```bash
dotnet run
```

### Run it

On your Windows machine: click "Add Item" from the home screen, type a
name, click "Add" — it appears in the list below. Add a second, a third —
each appears, and the previous ones remain, exactly as this unit's
execution trace predicted.

### Connection

This is Epic 2's first real, visible vertical slice: a genuine
`InventoryItem` type, a growing `List<T>` of them, and a working — if
manually-refreshed — way to see them on screen. Lesson 7 is entirely
about removing the one deliberately awkward part of what was just built.

---

## Closing

### Connect the Pieces
One concrete trace: `InventoryItem` (Concept Unit 1) started as a bare
field, exactly like the lab's `Dog`, then became a real property
(Concept Unit 2) — a change invisible to any caller, but one that makes
Lesson 7 possible without breaking this lesson's code. `InventoryPage`
(Concept Unit 4, replacing Lesson 3's `AddItemPage`) holds a real
`List<InventoryItem>` (Concept Unit 3), growing by one every time
`AddButton_Click` runs — reading the typed name from a real `TextBox`,
constructing a new `InventoryItem` with object-initializer syntax,
appending it to the list, and then rebuilding `ItemListBox` completely
from scratch to reflect it, a working but deliberately naive approach
whose cost was made visible, concretely, by this lesson's own execution
trace.

### What Breaks Without This
Temporarily remove just the `ItemListBox.Items.Clear();` line, leaving
the `foreach` loop that re-adds every item. Run the app and add two
items. Real, representative failure: `ItemListBox` now shows **four**
entries — `"Hex Bolts"`, then `"Hex Bolts"`, `"Shop Rags"` again after
the second click appended without ever clearing first, since the
`foreach` re-adds every item in `items` on top of whatever was already
sitting in `ItemListBox`, never removing the stale entries. Restore the
`Clear()` call and the list shows the correct two entries again. This is
a concrete, hands-on demonstration of exactly why "clear, then rebuild
completely" — not "just append what's new" — was this lesson's actual
strategy: the naive alternative (skip clearing) is a real, easy mistake
with a genuinely different, wrong-looking failure.

### Exercises

- Add a second field to the throwaway `lab-property` shape (recreate it
  temporarily) — give `Cat` an `Age` property using the auto-property
  shorthand directly, with no long-hand version first, and confirm it
  behaves identically to a value you set and read from the caller.
- Change `InventoryItem`'s `Name` property back to a bare public field
  temporarily, rerun the whole app, and confirm it still works exactly
  the same from `InventoryPage`'s point of view — direct, hands-on proof
  that today, before Lesson 7, the property and the field are genuinely
  interchangeable from any caller's perspective. Restore the property
  afterward.
- Add a `Console.WriteLine($"List now has {items.Count} items")` line
  inside `AddButton_Click`, add three items, and confirm the printed
  count matches this lesson's execution trace exactly.

### Definition of Done
- [ ] `InventoryItem.cs` exists with a `Name` property using auto-property
      syntax.
- [ ] `AddItemPage` has been fully renamed to `InventoryPage`, including
      `HomePage`'s navigation target.
- [ ] Typing a name and clicking Add appears in the on-screen list;
      adding a second item shows both, correctly, not duplicated.
- [ ] You reproduced the "stale duplicate entries" failure by removing
      `Items.Clear()`, and restored it.
- [ ] You can explain, in your own words, why `Name` is a property and
      not a bare field, even though nothing currently uses that
      difference.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Model InventoryItem as a real type and wire a working, manually-refreshed Add flow, opening Epic 2's end-to-end item"`.
