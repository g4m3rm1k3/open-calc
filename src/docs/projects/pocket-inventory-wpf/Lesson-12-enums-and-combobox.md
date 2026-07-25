# Lesson 12: A Value That Can Only Be One of a Few Things

*(`enum` and `ComboBox`)*

**User Story**
> As a user, I want to organize items into categories and specify where
> they're stored.

**What you will build**
Epic 2 closed with the smallest possible item — a name, nothing else —
carried all the way through the real pipeline: form, list, detail panel,
SQLite, validation. Epic 3 starts here, growing that same item one real
field at a time, each one touching the model, the form, the detail
panel, and the database together, in one lesson, never split across
separate ones. This lesson adds two fields: **Category**, a dropdown of
fixed choices (Tools, Hardware, Electronics, Consumables, Safety — never
free text), and **Location**, a plain description of where the item
lives (a shelf, a drawer, a room). The transferable problem underneath
Category specifically: some data genuinely only makes sense as one of a
small, known, closed set of values, and a `TextBox` is the wrong tool
for that — nothing stops a user from typing `"tols"` or `"TOOLS!!"` or
leaving it blank, and every one of those becomes a distinct, ungroupable
string sitting in your database forever.

**What you need to know first:** Lesson 6: `class`, properties,
`InventoryItem`. Lesson 7: `INotifyPropertyChanged`, the exact
get/set/`PropertyChanged?.Invoke(...)` shape every property on this
class already follows. Lesson 9/10: `EnsureDatabaseCreated`,
`SaveItemToDatabase`, `LoadItemsFromDatabase`. Lesson 11:
`NewItemDraft`, the current `InventoryPage.xaml` Add row and
`DetailPanel`.

---

## Concept Unit: `enum` — Declaring a Closed Set of Named Values

### The Problem

`InventoryItem.Name` is a `string` because a name genuinely can be
almost anything. A category is different: this project only ever wants
to recognize a handful of specific categories, decided ahead of time —
storing that as a `string` would let the exact same real-world
category get spelled a dozen different, incompatible ways across a
growing inventory, with nothing in the type system stopping it.

### Introduce the Concept in Isolation

```bash
dotnet new console -o lab-enum
cd lab-enum
```

Replace `Program.cs`:

```csharp
Season current = Season.Fall;
Console.WriteLine(current);
Console.WriteLine((int)current);
Console.WriteLine(current == Season.Fall);

Console.WriteLine("---");

foreach (Season season in Enum.GetValues(typeof(Season)))
{
    Console.WriteLine(season);
}

enum Season
{
    Spring,
    Summer,
    Fall,
    Winter
}
```

(The `enum` declaration has to come *after* the executable statements
in this file, not before — Lesson 0's top-level-statements rule:
executable code always comes first, type declarations after, in a
top-level-statements `Program.cs`.)

Run it:

```bash
dotnet run
```

Real output:

```text
Fall
2
True
---
Spring
Summer
Fall
Winter
```

`Enum.GetValues` returns every member in declared order — the `foreach`
below `"---"` just walks that list, one member at a time:

```
Iteration 1: season = Spring → printed
Iteration 2: season = Summer → printed
Iteration 3: season = Fall → printed
Iteration 4: season = Winter → printed
```

*What this proves:* `enum Season { Spring, Summer, Fall, Winter }`
declares a brand-new **type**, `Season`, whose only legal values are
exactly those four named members — nothing else is a `Season`, ever,
and the compiler enforces this at every point a `Season` is used, the
identical static-typing guarantee from Lesson 0 now applied to "one of
a fixed list" instead of "a number" or "a string." `Season.Fall` refers
to one specific member, qualified by its enum's name, the same
`Type.Member` shape as `Math.PI` or any `static` member access already
familiar from earlier lessons. `Console.WriteLine(current)` printed
`Fall` — the literal member name — not a number, even though
`(int)current` proves every member secretly *is* an integer underneath
(`Spring`=0, `Summer`=1, `Fall`=2, `Winter`=3, assigned in declared
order, starting at 0, unless overridden — not needed in this project).
`current == Season.Fall` compares two enum values the same way any
value is compared, returning `True`. `Enum.GetValues(typeof(Season))`
is a `static` method that returns every member of a given enum type, in
declared order, as a collection you can loop over with `foreach`
(Lesson 6) — this exact call is what feeds a WPF dropdown every valid
choice automatically, in this lesson's next unit, instead of
hand-typing each option twice.

### Discard the Throwaway Example

Delete the `lab-enum` folder. `Season` never appears again — the real
project's enum, `Category`, is built next, in the exact same shape.

### Mechanical Walkthrough

- `enum Season { Spring, Summer, Fall, Winter }` — **first appearance.**
  Declares a brand-new type whose only legal values are exactly those
  four named members — enforced by the compiler everywhere `Season` is
  used.
- `Season.Fall` — **first appearance.** One specific member, qualified
  by its enum's name — the same `Type.Member` shape as `Math.PI`.
- `(int)current` — **first appearance of casting an enum.** Every
  member secretly *is* an integer underneath, assigned in declared
  order starting at `0`.
- `current == Season.Fall` — **reappearing** (`==`, already-basic),
  now comparing two enum values.
- `Enum.GetValues(typeof(Season))` — **first appearance.** A `static`
  method returning every member of a given enum type, in declared
  order, as a collection `foreach` (Lesson 6) can walk.

### CS Lens

An `enum` is a concrete instance of a **finite, named set** — the type
system expressing "exactly these values, nothing else" instead of
relying on a comment or a naming convention to say so. Also recognized
in: Python's `enum.Enum` class (the direct equivalent, though Python's
version is opt-in — nothing stops a Python programmer from using a
bare string instead, where C#'s `enum` is a real, separate type the
compiler checks); TypeScript's `enum` keyword; HTML's `<select>`
options, which are exactly this idea expressed as markup instead of
code; and this project's own sibling Android curriculum, which reaches
the identical "closed set enforced by the compiler" idea one lesson
later, there.

### SE Lens

Why not just validate a `string` category against an allowed list at
the point it's saved, the same way Lesson 11 validated `Name`? Because
that validation would have to be repeated, correctly, at every single
place a category is written — the Add form today, an Edit form later,
a CSV import in Lesson 35 — and any one of those call sites forgetting
the check reintroduces exactly the typo problem this lesson exists to
prevent. An `enum` moves the guarantee into the type itself: there is
no code path anywhere in this program, now or in any future lesson,
capable of producing an `InventoryItem` whose category isn't one of
the five real values — not because every call site remembered to
check, but because an invalid one literally cannot compile.

---

## Concept Unit: Growing `InventoryItem` — Category and Location

### The Problem

`InventoryItem` currently models exactly one fact about an item: its
`Name`. Time to add the two facts this lesson's user story asks for.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryItem.cs`.
- **Change type:** Add.
- **Dependencies:** The `enum` shape from the previous unit; Lesson 7's
  `INotifyPropertyChanged` get/set pattern, reused identically for both
  new properties.

### The New Code

```csharp
public enum Category
{
    Tools,
    Hardware,
    Electronics,
    Consumables,
    Safety
}
```

```csharp
private Category category;

public Category Category
{
    get { return category; }
    set
    {
        category = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Category)));
    }
}

private string location = string.Empty;

public string Location
{
    get { return location; }
    set
    {
        location = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Location)));
    }
}
```

### The Updated Project

```csharp
using System.ComponentModel;

namespace PocketInventory
{
    public class InventoryItem : INotifyPropertyChanged, IDataErrorInfo
    {
        public int Id { get; set; }
        private string name = string.Empty;

        public string Name
        {
            get { return name; }
            set
            {
                name = value;
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Name)));
            }
        }

        private Category category;                                              // ← new

        public Category Category                                                // ← new
        {                                                                        // ← new
            get { return category; }                                            // ← new
            set                                                                  // ← new
            {                                                                    // ← new
                category = value;                                                // ← new
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Category))); // ← new
            }                                                                    // ← new
        }                                                                        // ← new

        private string location = string.Empty;                                 // ← new

        public string Location                                                  // ← new
        {                                                                        // ← new
            get { return location; }                                            // ← new
            set                                                                  // ← new
            {                                                                    // ← new
                location = value;                                                // ← new
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Location))); // ← new
            }                                                                    // ← new
        }                                                                        // ← new

        public event PropertyChangedEventHandler? PropertyChanged;

        public string Error => string.Empty;

        public string this[string propertyName]
        {
            get
            {
                if (propertyName == nameof(Name) && string.IsNullOrWhiteSpace(Name))
                {
                    return "Name is required.";
                }
                return string.Empty;
            }
        }
    }
}
```

`InventoryItem` now carries three real facts instead of one — `Name`,
`Category`, and `Location` — every one of them announcing its own
changes through the identical `INotifyPropertyChanged` shape, so
anything already bound to any of them (this lesson's next unit) stays
correctly in sync with no special-casing per property.

### Mechanical Walkthrough

- `public enum Category { ... }` — reappearing (this lesson's own
  lab), `public` this time (first appearance of `public` on an
  `enum` specifically) so `InventoryPage`, in a different file, can
  reference it — the identical reasoning Lesson 6 gave for `public`
  on `InventoryItem` itself.
- `private Category category;` / `public Category Category { get; set... }`
  — reappearing (Lesson 7's exact property shape, applied to `Name`
  originally), new detail worth naming: this is the first property on
  `InventoryItem` whose type is neither `string` nor `int` — it's the
  `enum` this lesson just declared, and the property's `set` block is
  identical in shape regardless of what type it wraps, which is
  precisely the point: the `INotifyPropertyChanged` pattern doesn't
  care what kind of value changed, only that something did.
- `private string location = string.Empty;` / `public string Location { get; set... }`
  — reappearing, structurally identical to `Name`'s own shape — no new
  concept here at all; flagged specifically so it's clear this is
  intentional repetition, not an oversight, and not worth its own
  concept unit.

### CS Lens

Both new properties reuse the exact Observer-pattern shape (Lesson 7)
`Name` already established — a concrete demonstration that
`INotifyPropertyChanged` isn't a one-off trick tied to `string`
specifically; it's a general shape any property, of any type, can
follow to announce its own changes.

### SE Lens

Why does adding two fields touch only one file so far (`InventoryItem.cs`),
rather than needing to update several places just to introduce them?
Because Lesson 6's original decision to model "an inventory item" as
its own type, before any UI code existed, is paying off exactly as
that lesson's SE Lens predicted: `InventoryItem` is the one shared
shape every other part of this project — the form, the list, the
database — will be updated *against* next, but the fact itself lives
in exactly one place.

---

## Concept Unit: `ComboBox` and Feeding It an Enum's Values

### The Problem

`Category` now exists as a real, typed property, but nothing on screen
can set it yet — a `TextBox` would be the wrong control entirely (it
would just reopen the free-text problem this lesson's first unit
exists to close). WPF has a dedicated control for choosing one value
from a fixed list.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml.cs`.
- **Change type:** Add.
- **Dependencies:** `Category`, `Enum.GetValues`, both from earlier in
  this lesson.

### The New Code

```csharp
public Array CategoryValues => Enum.GetValues(typeof(Category));
```

### The Updated Project

Added as a new member on `InventoryPage`, alongside the existing
`Items` and `NewItemDraft` properties (full file shown in this
lesson's final unit, once every change is in):

```csharp
public ObservableCollection<InventoryItem> Items { get; } = new ObservableCollection<InventoryItem>();

public Array CategoryValues => Enum.GetValues(typeof(Category));    // ← new
```

### Mechanical Walkthrough

- `public Array CategoryValues => Enum.GetValues(typeof(Category));`
  — (first appearance of `=>` on a property reading live, non-constant
  data — Lesson 11's `Error => string.Empty` used this same
  expression-bodied shape, but always returned the same fixed value;
  this one re-evaluates `Enum.GetValues(...)` every time something
  reads `CategoryValues`) — reappearing (`Enum.GetValues`, this
  lesson's lab), now feeding a real property a `ComboBox` in XAML can
  bind against, instead of a `foreach` printing to a console. `Array`
  — (first appearance) — the general, non-generic collection type
  `Enum.GetValues` returns; not `List<Category>` specifically, because
  `Enum.GetValues` predates generics in .NET's history and was never
  updated — a real, small wart worth naming rather than hiding, since
  it's the honest reason this property's type looks slightly
  inconsistent with `Items`'s `ObservableCollection<InventoryItem>`
  just above it.

### CS Lens

Exposing `CategoryValues` as a property WPF's binding system can read
is the same **data binding as the single source of truth** idea
Lesson 7 established for `Items` — the `ComboBox`'s list of choices
isn't hand-typed into XAML (five `<ComboBoxItem>` elements, easy to
let drift out of sync with the real `enum`) or duplicated anywhere;
it's read, live, from the one place `Category`'s real values are
actually declared.

### SE Lens

Why expose a whole property for this instead of just hand-listing the
five categories directly in `InventoryPage.xaml`? Because a hand-typed
list has to be kept manually in sync with the `enum` forever — add a
sixth `Category` member next year, and a hand-typed `ComboBox` silently
stays at five, with no compiler error to catch the mismatch. Reading
from `Enum.GetValues` means the dropdown is *structurally* incapable of
falling out of sync with the type it represents.

---

## Concept Unit: Wiring the New Fields Into the Add Form and Detail Panel

### The Problem

`CategoryValues` exists, and `InventoryItem` can hold a `Category` and
a `Location`, but the Add row and `DetailPanel` still only show `Name`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`.
- **Change type:** Add.
- **Location:** The Add row's `StackPanel` (Lesson 6); `DetailPanel`
  (Lesson 8).
- **Dependencies:** `CategoryValues`, previous unit; `Category` and
  `Location`, two units back.

### The New Code — the Add Row

```xml
<ComboBox Width="140"
          Margin="12,0,0,0"
          ItemsSource="{Binding CategoryValues}"
          SelectedItem="{Binding NewItemDraft.Category}" />

<TextBox Width="160"
         Margin="12,0,0,0"
         Text="{Binding NewItemDraft.Location, UpdateSourceTrigger=PropertyChanged}" />
```

### The Updated Project

```xml
<StackPanel Grid.Row="0" Orientation="Horizontal">
    <TextBox x:Name="NameInput"
             Width="240"
             Text="{Binding NewItemDraft.Name, ValidatesOnDataErrors=True, UpdateSourceTrigger=PropertyChanged}" />
    <ComboBox Width="140"                                                        <!-- ← new -->
              Margin="12,0,0,0"                                                   <!-- ← new -->
              ItemsSource="{Binding CategoryValues}"                              <!-- ← new -->
              SelectedItem="{Binding NewItemDraft.Category}" />                   <!-- ← new -->
    <TextBox Width="160"                                                          <!-- ← new -->
             Margin="12,0,0,0"                                                    <!-- ← new -->
             Text="{Binding NewItemDraft.Location, UpdateSourceTrigger=PropertyChanged}" /> <!-- ← new -->
    <Button Content="Add"
            Style="{StaticResource ToolbarButtonStyle}"
            Margin="12,0,0,0"
            Click="AddButton_Click" />
</StackPanel>
```

The Add row now collects all three facts `InventoryItem` currently
models, side by side, before the Add button — the `ComboBox` and the
new `TextBox` following the identical `Margin="12,0,0,0"` spacing
rhythm the original `TextBox`/`Button` pair already established.

### Mechanical Walkthrough

- `<ComboBox ... />` — (first appearance) — instantiates
  `System.Windows.Controls.ComboBox`, a dropdown control restricted to
  choosing one item from whatever `ItemsSource` supplies — unlike
  `TextBox`, there is no way to type an arbitrary value into it at all.
- `ItemsSource="{Binding CategoryValues}"` — reappearing (`{Binding}`,
  Lesson 7; `ItemsSource`, Lesson 8's `ListBox`), same mechanism, new
  source: every value `CategoryValues` currently returns becomes one
  selectable row in the dropdown, automatically re-populated if that
  property's underlying data ever changed (it won't, here — `enum`
  members are fixed at compile time — but the mechanism is the same
  regardless).
- `SelectedItem="{Binding NewItemDraft.Category}"` — reappearing
  (`SelectedItem`, Lesson 8), same binding-path shape as
  `NewItemDraft.Name`, now on the enum-typed property instead of the
  string one — proof this binding mechanism genuinely doesn't care
  what type the bound property is.
- The new `<TextBox ... Text="{Binding NewItemDraft.Location, UpdateSourceTrigger=PropertyChanged}" />`
  — entirely reappearing (identical shape to `NameInput`, minus
  `ValidatesOnDataErrors` — `Location` has no validation rule yet, on
  purpose; nothing in this lesson's user story requires one).

### The New Code — the Detail Panel

```xml
<TextBlock Text="{Binding Category}" FontWeight="SemiBold" Margin="0,8,0,0" />
<TextBox Text="{Binding Location, UpdateSourceTrigger=PropertyChanged}" Margin="0,8,0,0" />
```

### The Updated Project

```xml
<StackPanel x:Name="DetailPanel" Grid.Column="1" Margin="16,0,0,0">
    <TextBlock Text="Details" FontWeight="Bold" Margin="0,0,0,8" />
    <TextBox Text="{Binding Name, UpdateSourceTrigger=PropertyChanged}" />
    <TextBlock Text="{Binding Category}" FontWeight="SemiBold" Margin="0,8,0,0" />   <!-- ← new -->
    <TextBox Text="{Binding Location, UpdateSourceTrigger=PropertyChanged}"           <!-- ← new -->
             Margin="0,8,0,0" />                                                       <!-- ← new -->
</StackPanel>
```

`DetailPanel` now shows all three facts about whichever item is
currently selected — `Name` and `Location` both editable inline, the
same live two-way binding Lesson 8 already proved for `Name`;
`Category` shown read-only here on purpose (a `TextBlock`, not a
second `ComboBox`) — editing an existing item's category isn't part of
this lesson's user story, and Lesson 21 (*Reusing a View for Create and
Update*) is where a genuine edit flow, this field included, actually
belongs.

### Mechanical Walkthrough

- `<TextBlock Text="{Binding Category}" .../>` — reappearing
  (`TextBlock`, Lesson 0; `{Binding}` with no explicit path prefix,
  Lesson 8 — resolves against `DetailPanel`'s inherited `DataContext`,
  the selected `InventoryItem`, exactly like the existing `Name`
  binding above it). Displaying an enum this way prints its member
  name directly (`"Tools"`, not `0`) — the same `ToString()` behavior
  this lesson's lab already proved for `Console.WriteLine(current)`.
- The new `Location` `TextBox` — entirely reappearing, identical shape
  to `DetailPanel`'s existing `Name` `TextBox`.

### CS Lens

Showing `Category` as read-only text while `Name` and `Location` stay
editable is **least privilege applied to a UI, not just a permissions
system** — the same underlying idea as a database role that can `SELECT`
but not `UPDATE`: give a piece of the interface exactly the capability
its current job requires, no more, until an actual requirement (Lesson
21) asks for more.

### SE Lens

Why not just make `Category`'s detail-panel control a second
`ComboBox`, identical to the Add row's, since the code to do so is
nearly free? Because a control that *looks* editable but isn't
genuinely wired to save that edit anywhere yet (this lesson never
writes an `UPDATE` statement) would silently mislead a user into
believing a change stuck when it didn't — a `TextBlock` here is
honest about what this lesson's slice actually supports; a `ComboBox`
would be a promise this lesson doesn't keep.

---

## Concept Unit: Persisting an Enum — `ToString()` Going In, `Enum.Parse` Coming Back

### The Problem

SQLite has no `enum` column type of its own — nothing in
`Microsoft.Data.Sqlite` knows what a C# `Category` is. Saving and
reloading `Category` needs an explicit, two-way conversion this
project hasn't needed for `Name` (already a plain string) at all.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml.cs` — `EnsureDatabaseCreated`,
  `SaveItemToDatabase`, `LoadItemsFromDatabase`.
- **Change type:** Modify.
- **Dependencies:** Lesson 9's `CREATE TABLE`/`INSERT`, Lesson 10's
  `SELECT`/row-mapping.

### The New Code — the Table Shape

```csharp
command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Category TEXT NOT NULL, Location TEXT NOT NULL)";
```

### The New Code — Saving

```csharp
command.CommandText = "INSERT INTO Items (Name, Category, Location) VALUES (@name, @category, @location)";
command.Parameters.AddWithValue("@name", item.Name);
command.Parameters.AddWithValue("@category", item.Category.ToString());
command.Parameters.AddWithValue("@location", item.Location);
```

### The New Code — Loading

```csharp
command.CommandText = "SELECT Id, Name, Category, Location FROM Items";

using SqliteDataReader reader = command.ExecuteReader();
while (reader.Read())
{
    InventoryItem item = new InventoryItem
    {
        Id = reader.GetInt32(0),
        Name = reader.GetString(1),
        Category = Enum.Parse<Category>(reader.GetString(2)),
        Location = reader.GetString(3)
    };
    loadedItems.Add(item);
}
```

### The Updated Project

```csharp
using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Windows;
using System.Windows.Controls;

namespace PocketInventory
{
    public partial class InventoryPage : Page, INotifyPropertyChanged
    {
        private const string ConnectionString = "Data Source=pocketinventory.db";

        public ObservableCollection<InventoryItem> Items { get; } = new ObservableCollection<InventoryItem>();

        public Array CategoryValues => Enum.GetValues(typeof(Category));         // ← new

        private InventoryItem newItemDraft = new InventoryItem();

        public InventoryItem NewItemDraft
        {
            get { return newItemDraft; }
            set
            {
                newItemDraft = value;
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(NewItemDraft)));
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;

        public InventoryPage()
        {
            InitializeComponent();
            DataContext = this;
            EnsureDatabaseCreated();

            foreach (InventoryItem item in LoadItemsFromDatabase())
            {
                Items.Add(item);
            }
        }

        private void EnsureDatabaseCreated()
        {
            using SqliteConnection connection = new SqliteConnection(ConnectionString);
            connection.Open();
            using SqliteCommand command = connection.CreateCommand();
            command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Category TEXT NOT NULL, Location TEXT NOT NULL)";  // ← changed
            command.ExecuteNonQuery();
        }

        private List<InventoryItem> LoadItemsFromDatabase()
        {
            List<InventoryItem> loadedItems = new List<InventoryItem>();

            using SqliteConnection connection = new SqliteConnection(ConnectionString);
            connection.Open();
            using SqliteCommand command = connection.CreateCommand();
            command.CommandText = "SELECT Id, Name, Category, Location FROM Items";        // ← changed

            using SqliteDataReader reader = command.ExecuteReader();
            while (reader.Read())
            {
                InventoryItem item = new InventoryItem
                {
                    Id = reader.GetInt32(0),
                    Name = reader.GetString(1),
                    Category = Enum.Parse<Category>(reader.GetString(2)),                   // ← new
                    Location = reader.GetString(3)                                           // ← new
                };
                loadedItems.Add(item);
            }

            return loadedItems;
        }

        private void AddButton_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrWhiteSpace(NewItemDraft.Name))
            {
                return;
            }

            Items.Add(NewItemDraft);
            SaveItemToDatabase(NewItemDraft);
            NewItemDraft = new InventoryItem();
        }

        private void SaveItemToDatabase(InventoryItem item)
        {
            using SqliteConnection connection = new SqliteConnection(ConnectionString);
            connection.Open();
            using SqliteCommand command = connection.CreateCommand();
            command.CommandText = "INSERT INTO Items (Name, Category, Location) VALUES (@name, @category, @location)";  // ← changed
            command.Parameters.AddWithValue("@name", item.Name);
            command.Parameters.AddWithValue("@category", item.Category.ToString());          // ← new
            command.Parameters.AddWithValue("@location", item.Location);                     // ← new
            command.ExecuteNonQuery();
        }

        private void ItemListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            DetailPanel.DataContext = ItemListBox.SelectedItem;
        }
    }
}
```

`EnsureDatabaseCreated`, `SaveItemToDatabase`, and `LoadItemsFromDatabase`
now agree on the same three-column shape — `Name`, `Category`,
`Location` — the load and save halves of one contract, exactly as
Lesson 10's Connection section named it, now covering two more facts
without changing that underlying shape at all.

### Mechanical Walkthrough

- `Category TEXT NOT NULL` — (first appearance of storing an enum in
  SQLite) — SQLite has no enum column type, so this project stores the
  member's *name* as plain text (`"Tools"`, not the underlying `0`) —
  a deliberate choice, named fully in this unit's SE Lens below.
- `item.Category.ToString()` — (first appearance) — every C# value,
  including every enum member, has a `ToString()` method; for an enum,
  it returns the member's declared name as a string — the exact
  `"Fall"` text this lesson's very first lab already printed via
  `Console.WriteLine(current)`, which was silently calling
  `ToString()` the whole time.
- `Enum.Parse<Category>(reader.GetString(2))` — (first appearance) —
  the reverse operation: given a string and an enum type, finds the
  member whose name matches exactly and returns it, throwing a real
  exception if no member matches (worth knowing, not handled
  defensively here — this project fully controls what strings ever
  reach this column, since `ToString()` is the only thing that ever
  writes to it).

### CS Lens

Storing `ToString()`'s output and reversing it with `Enum.Parse` is
**serialization** in miniature — converting an in-memory value into a
representation a different system (here, a SQLite column; elsewhere,
JSON in Lesson 36, CSV in Lesson 34) can hold, with an explicit,
matching rule for converting it back. Every persistence boundary this
project will ever cross needs exactly this pair of operations, in some
form, for every type that isn't already one of SQLite's native column
types.

### SE Lens

Why store the category's *name* (`"Tools"`) instead of its underlying
integer (`0`) — `int` being a real SQLite column type, requiring no
`ToString()`/`Parse` conversion at all? Because an integer column is
silently fragile to a change this project's own roadmap will make:
reordering `Category`'s members, or inserting a new one in the middle,
silently reassigns every existing member's underlying number —
`0` might mean `Tools` today and `Hardware` after a single innocent
reordering, corrupting every already-saved row with no error at all.
Storing the *name* is immune to that specific failure — renaming
`Tools` to something else would still need a real, deliberate data
migration, but simply reordering the `enum` declaration, a much easier
mistake to make by accident, costs nothing.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: pick a category from the new dropdown, type a
location, type a name, click Add — the new item appears with its
category and location both intact. Fully quit and reopen the app
(Lesson 10's promise, still holding): every item, including its
category and location, is back exactly as it was. Open
`pocketinventory.db` in a SQLite browser if you have one — the
`Category` column holds readable text like `Tools`, not a bare number.

### Connection

`InventoryItem` grew from one fact to three, and every layer this
project has already built — the model (Lesson 6), the observable
binding (Lesson 7), the detail panel (Lesson 8), and SQLite persistence
(Lessons 9–10) — absorbed that growth without any of those earlier
lessons' own code needing to change shape, only to be extended with
more of the same pattern. This is Epic 3's whole premise, proven for
real on its first lesson.

---

## Closing

### Connect the Pieces

One concrete trace: a user opens the new `ComboBox`, bound via
`ItemsSource="{Binding CategoryValues}"` (this lesson's third unit) to
`Enum.GetValues(typeof(Category))` (the lab), and picks "Safety" —
`SelectedItem="{Binding NewItemDraft.Category}"` writes
`Category.Safety` straight into the draft item's property (second
unit), which announces the change via the same `INotifyPropertyChanged`
shape `Name` has used since Lesson 7. Clicking Add hands that same
draft to `SaveItemToDatabase`, where `item.Category.ToString()` (fifth
unit) turns it into the text `"Safety"` for the `INSERT`. Reopening the
app calls `LoadItemsFromDatabase`, where `Enum.Parse<Category>(...)`
reverses that exact conversion, reconstructing the identical
`Category.Safety` value the user originally picked from a dropdown two
sessions ago.

### What Breaks Without This

Temporarily change `Enum.Parse<Category>(reader.GetString(2))` to
`Enum.Parse<Category>("NotARealCategory")`, hardcoding a value that
matches no real `Category` member. Run the app with at least one saved
item already in the database. Real, representative failure: the app
crashes on startup with an unhandled `ArgumentException` the moment
`LoadItemsFromDatabase` runs, its message naming the exact invalid
string it couldn't match to any `Category` member. This is concrete
proof of this unit's SE Lens: `Enum.Parse` trusts its input completely
and offers no graceful fallback — which is fine specifically because
this project is the only thing that ever writes to this column, using
`ToString()`, which can never produce a string `Enum.Parse` can't
reverse. Restore the real `reader.GetString(2)` call afterward.

### Exercises

- Add a sixth `Category` member, `Miscellaneous`, to the `enum`. Run
  the app with no other code changes — confirm it appears in the
  `ComboBox` automatically, direct, hands-on proof of this lesson's SE
  Lens about `Enum.GetValues` never drifting out of sync with the type
  it reflects.
- In the `lab-enum` throwaway pattern (recreate it temporarily), try
  `Enum.Parse<Season>("NotASeason")` and read the real exception
  message and type it throws — confirm it matches the category this
  lesson describes in "What Breaks Without This."
- `DetailPanel` currently shows `Category` as read-only `TextBlock`
  text. Predict, in your own words, what would have to change for it
  to become genuinely editable and have that edit actually persist —
  you don't need to write the code; Lesson 21 is where this is answered
  for real.

### Definition of Done

- [ ] `Category` (`enum`) and `Location` (`string`) both exist on
      `InventoryItem`, following the same `INotifyPropertyChanged`
      shape as `Name`.
- [ ] The Add row shows a working `ComboBox` populated from
      `CategoryValues`, plus a `Location` text box, alongside the
      existing name field.
- [ ] `DetailPanel` shows the selected item's category (read-only) and
      location (editable).
- [ ] Adding an item, fully quitting, and reopening the app preserves
      its category and location, not just its name.
- [ ] You reproduced the `Enum.Parse` crash on purpose, read the real
      exception, and restored the correct code.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add Category (enum, ComboBox) and Location (string) as InventoryItem's first grown fields, opening Epic 3"`.
