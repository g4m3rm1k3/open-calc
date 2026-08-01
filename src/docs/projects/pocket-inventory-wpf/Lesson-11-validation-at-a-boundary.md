# Lesson 11: Never Trust Input, Even Your Own UI's

*(`string.IsNullOrWhiteSpace` and `IDataErrorInfo`)*

**User Story**
> As a user, I don't want the application to accept invalid data.

**What you will build**
Right now, `AddButton_Click` will happily save a blank row: click "Add"
with `NameInput` empty (or full of nothing but spaces), and a real,
useless, unnamed row lands in the list and in the database. This lesson
closes Epic 2 by rejecting that at the exact boundary where untrusted
input enters the program — the moment the user submits it — using WPF's
own real validation mechanism, `IDataErrorInfo`, rather than a
button-click `if` check alone. The transferable problem is a principle
worth carrying into every project you'll ever build: input is
untrustworthy specifically *because* it came from outside your code's
control, and that's true even when "outside" just means a `TextBox`
sitting a few lines above the code reading it — the UI showing a text
field doesn't obligate the user to have typed anything meaningful into
it.

**What you need to know first:** Lesson 8: `TwoWay` binding,
`INotifyPropertyChanged` on `InventoryItem`. Lesson 9: `AddButton_Click`,
`SaveItemToDatabase`. Lesson 6: `class`, properties.

**Terms introduced in this lesson:**
- **Boundary validation** — checking untrusted input at the exact
  point it crosses from outside your program's control into code that
  will act on it, rather than trusting it because it arrived through a
  UI element that merely looks like it constrains what can be typed.
- **Nullable array element type** (`string?[]`) — declares an array
  whose elements may be `null`, contrasted against `string[]`, which
  promises every element is non-null.
- **`string.IsNullOrWhiteSpace(input)`** — returns `true` for `null`,
  for `""`, and for a string containing only whitespace characters.
- **Indexer** — a member literally named `this`, taking a parameter in
  `[...]`, letting instances be indexed with square brackets like a
  `Dictionary` or array.
- **`Dictionary.TryGetValue(key, out value)`** — looks up a key,
  returning `true`/`false` for found/not-found while also handing back
  the value through an `out` parameter, in one call.
- **`IDataErrorInfo`** — a built-in .NET interface WPF's binding
  system checks for on any bound object, to surface per-property
  validation errors.
- **Expression-bodied member** (`=>` on a property) — shorthand for a
  `get`-only property body.
- **`ValidatesOnDataErrors`** — tells a binding to actually check
  `IDataErrorInfo` on its source object on every update.

---

## Concept Unit: `string.IsNullOrWhiteSpace`

### The Problem

`NameInput.Text` is never actually `null` — an empty `TextBox` reports
`""`, an empty string, not the absence of one. But `""` and
`"   "` (three spaces, visually indistinguishable from empty in a
`TextBox`) are both real strings a naive `if (name == "")` check would
miss.

### Introduce the Concept in Isolation

```bash
dotnet new console -o lab-whitespace
cd lab-whitespace
```

Replace `Program.cs`:

```csharp
string?[] inputs = { "Widget", "", "   ", null };

foreach (string? input in inputs)
{
    bool isBlank = string.IsNullOrWhiteSpace(input);
    Console.WriteLine($"'{input}' -> blank: {isBlank}");
}
```

`string?[]`, not `string[]` — **first appearance of a nullable array
element type.** The array holds `null` as one of its four elements, and
C#'s compiler checks that against the *declared* element type: `string[]`
means "every element is a real string, never `null`," so a `null`
literal inside the initializer would be a real compile-time warning
(`CS8625`) against that promise. `string?[]` states the actual truth —
"some elements might be `null`" — matching the `string? input` the
`foreach` below already declares for exactly the same reason.

Run it:

```bash
dotnet run
```

Real output — verified this session:

```text
'Widget' -> blank: False
'' -> blank: True
'   ' -> blank: True
'' -> blank: True
```

#### Execution Trace

Four iterations, one check per element, concrete values:

1. `input = "Widget"` — `IsNullOrWhiteSpace` returns `False`, because
   `"Widget"` is neither `null`, nor empty, nor all-whitespace, the
   only case this method treats as blank.
2. `input = ""` — returns `True`, since an empty string has zero
   characters, satisfying the "empty" case this method explicitly
   checks for.
3. `input = "   "` — returns `True`, because every character present
   is whitespace, which this method treats identically to an empty
   string.
4. `input = null` — returns `True`, since this method checks for
   `null` before ever touching the string's characters, which is
   exactly why it doesn't throw the way `input.Trim()` would.

*What this proves:* `string.IsNullOrWhiteSpace(input)` — (first
appearance) — a `static` method (meaning: called on the
`string` type itself, not on any specific string instance) that
returns `true` for `null`, for `""`, and for a string containing only
whitespace characters — three different "not really something" cases,
one check. Notice the fourth input, `null` itself, printed as an empty
pair of quotes in the interpolated string (`$"'{input}'"` — `null`
interpolates as empty text) rather than crashing — proof this method is
specifically safe to call even when `input` might be `null`, unlike
most string methods (`input.Trim()` on a `null` `input` would throw
immediately).

### Discard the Throwaway Example

Delete the `lab-whitespace` folder. `string.IsNullOrWhiteSpace` is the
real check `InventoryItem`'s validation logic uses next.

### Mechanical Walkthrough

- `string?[] inputs = { "Widget", "", "   ", null };` — **reappearing**
  nullable-array element type (this unit's own opening bullet, above).
- `string.IsNullOrWhiteSpace(input)` — **first appearance.** A
  `static` method (called on the `string` type
  itself) that returns `true` for `null`, `""`, or a
  whitespace-only string — three cases, one check.
- `$"'{input}'"` with `input = null` — **first appearance of this
  specific behavior.** `null` interpolates as empty text rather than
  crashing — contrast against `input.Trim()`, which would throw
  immediately on a `null` `input`.

### CS Lens

This is **boundary validation** — checking untrusted input at the exact
point it crosses from outside your program's control into code that
will act on it, rather than trusting it implicitly because it arrived
through a UI element that "looks like" it constrains what can be typed.
A `TextBox` places no real restriction on its contents at all; the
restriction has to be enforced in code, explicitly, the same way an
earlier lab already proved a text field can hold
anything regardless of what a form's *label* implies it should contain.

Also recognized in: web forms requiring server-side validation even
when the client-side form already has `required` attributes (a user can
disable JavaScript or call the API directly, bypassing the form
entirely); API request validation, regardless of what a client SDK
claims to guarantee; and this project's own sibling Android curriculum,
which names the identical principle — "never trust anything the UI
merely suggests" — at the same point in its own sequence.

### SE Lens

Why is this worth a whole named principle instead of just "check for
empty strings"? Because the temptation to skip it is strongest for
input that arrived through *your own* UI, built by *your own* code —
it feels safe in a way input from a network request or a file never
does. That feeling is misleading: a `TextBox` genuinely accepts
anything typeable, including nothing at all, and code reading it has to
treat that possibility as real, every time, regardless of how trustworthy
the source feels.

---

## Concept Unit: Indexers — `this[string key]`

### The Problem

WPF's real validation interface, built next, requires a class to expose
something that looks like array or dictionary access —
`someObject["Name"]` — but returning a validation message instead of a
stored value. Neither Python nor anything in this project so far has
shown you how a class defines *its own* `[...]` behavior.

### Introduce the Concept in Isolation

```bash
dotnet new console -o lab-indexer
cd lab-indexer
```

Replace `Program.cs`:

```csharp
class Cabinet
{
    private Dictionary<string, string> drawers = new();

    public string this[string drawerName]
    {
        get
        {
            return drawers.TryGetValue(drawerName, out string? contents) ? contents : "(empty)";
        }
        set
        {
            drawers[drawerName] = value;
        }
    }
}

Cabinet cabinet = new Cabinet();
Console.WriteLine(cabinet["top"]);
cabinet["top"] = "Screwdrivers";
Console.WriteLine(cabinet["top"]);
```

Run it:

```bash
dotnet run
```

Real output:

```text
(empty)
Screwdrivers
```

*What this proves:* `public string this[string drawerName] { get; set; }`
— (first appearance) — declares an **indexer**: a member named `this`,
taking a parameter in `[...]`, letting instances of `Cabinet` be indexed
with square brackets exactly like a `Dictionary` or an array, even
though `Cabinet` isn't either of those things — `cabinet["top"]` calls
the indexer's `get`; `cabinet["top"] = "Screwdrivers"` calls its `set`,
identical shape to the `Name` property's `get`/`set` from before,
just parameterized by whatever's inside the `[...]` instead of taking
no parameter at all.

### Discard the Throwaway Example

Delete the `lab-indexer` folder, `Cabinet`. The real validation
interface uses an indexer with this exact shape, read-only, next.

### Mechanical Walkthrough

- `public string this[string drawerName] { get; set; }` — **first
  appearance of an indexer.** A member literally named `this`, taking a
  parameter in `[...]`, letting instances be indexed with square
  brackets — the same `get`/`set` shape as an ordinary property,
  just parameterized.
- `drawers.TryGetValue(drawerName, out string? contents)` — **first
  appearance.** Looks up `drawerName` in the dictionary, returning
  `true`/`false` for found/not-found while also handing back the value
  (if any) through the `out` parameter — one call doing what a
  separate "does it exist" check plus a separate lookup would otherwise
  need two.
- `cabinet["top"]` (read) — **first appearance of calling an
  indexer's `get`.** `cabinet["top"] = "Screwdrivers"` (write) — **first
  appearance of calling an indexer's `set`.** Both use the exact
  `object[key]` syntax a `Dictionary` or array would, even though
  `Cabinet` is neither.

### CS Lens

An indexer is **operator overloading** — giving a language's built-in
`[...]` syntax new, class-specific meaning, the same underlying idea as
overloading `+` or `==` in languages that allow it (C++, and C# itself,
for operators beyond indexing — not covered further here). Also
recognized in: Python's `__getitem__`/`__setitem__` dunder methods
(the direct equivalent — `obj[key]` in Python is sugar for calling
those, exactly as `cabinet["top"]` here is sugar for calling the
indexer), and every built-in `Dictionary`/`List` type in any language
providing its own version of this exact mechanism.

### SE Lens

Why would a validation interface specifically want `[...]` syntax
instead of an ordinary method, like `GetError("Name")`? Because the
*caller* of this interface — WPF's own binding system, not your code —
was designed once, generically, to validate any bound property by name,
and `object["PropertyName"]` reads as "look up whatever's wrong with
this named thing," a natural fit for exactly that generic lookup, the
same way a `Dictionary<string, string>` naturally expresses "look up
this named thing" for its own, different purpose.

---

## Concept Unit: `IDataErrorInfo` — WPF's Real Validation Contract

### The Problem

Time to make `InventoryItem` genuinely validate itself, in a way WPF's
binding system understands automatically — showing a real, built-in red
error indicator on `NameInput` the moment its bound value becomes
invalid, with no custom drawing code written for it.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryItem.cs`.
- **Change type:** Add.
- **Dependencies:** the indexer shape from the previous unit;
  `string.IsNullOrWhiteSpace`, this lesson's first unit.

### The Contract You're Implementing

`IDataErrorInfo` is another **interface** — the same contract-with-no-
implementation-of-its-own idea `INotifyPropertyChanged` already proved
in Lesson 7 (a class implementing it makes a narrow promise about
specific required members, without *becoming a kind of* anything the
way `: Window`/`: Page` inheritance does). This one's real shape is
different, and worth reading before writing `InventoryItem`'s
implementation of it. From `System.ComponentModel` itself, not this
project's code (verified against the real interface, this session):

```csharp
public interface IDataErrorInfo
{
    string Error { get; }
    string this[string columnName] { get; }
}
```

Two real facts this makes checkable instead of assumed: the interface
requires exactly two members, both **read-only** (`get` only, no
`set`) — `Error`, one message for the whole object, and an indexer,
one message per named property. Nothing here requires the indexer's
parameter to be named `propertyName` specifically (this project's own
choice, for clarity) — the interface only cares about the `string`
type, not the parameter's name.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-idataerrorinfo
cd lab-idataerrorinfo
```

Replace `Program.cs`:

```csharp
using System.ComponentModel;

Cat cat = new Cat();
Console.WriteLine($"[\"Name\"] when empty: '{cat["Name"]}'");

cat.Name = "Whiskers";
Console.WriteLine($"[\"Name\"] when set: '{cat["Name"]}'");

class Cat : IDataErrorInfo
{
    public string Name { get; set; } = string.Empty;

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
```

Run it:

```bash
dotnet run
```

Real output:

```text
["Name"] when empty: 'Name is required.'
["Name"] when set: ''
```

*What this proves:* `cat["Name"]` — indexer syntax, reappearing from the
previous unit — calls straight into `IDataErrorInfo`'s own indexer, the
exact same call WPF's binding engine makes internally every time a bound
property changes; nothing WPF-specific is happening here, no window, no
binding, no XAML. When `Name` is still its default empty string, the
indexer returns the real message; the moment `Name` holds something
non-blank, the same call returns an empty string instead — the
empty-versus-non-empty convention that's this interface's entire
contract, proven with real output before `InventoryItem` ever implements
it for real.

### Discard the Throwaway Example
Delete the `lab-idataerrorinfo` folder. The indexer shape and the
empty-versus-non-empty convention are not discarded — `InventoryItem`
implements exactly this next.

### The New Code

```csharp
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
```

### The Updated Project

```csharp
using System.ComponentModel;

namespace PocketInventory
{
    public class InventoryItem : INotifyPropertyChanged, IDataErrorInfo   // ← changed
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

        public event PropertyChangedEventHandler? PropertyChanged;

        public string Error => string.Empty;                              // ← new

        public string this[string propertyName]                          // ← new
        {                                                                  // ← new
            get                                                            // ← new
            {                                                              // ← new
                if (propertyName == nameof(Name) && string.IsNullOrWhiteSpace(Name)) // ← new
                {                                                           // ← new
                    return "Name is required.";                             // ← new
                }                                                           // ← new
                return string.Empty;                                        // ← new
            }                                                               // ← new
        }                                                                   // ← new
    }
}
```

`InventoryItem` now implements two interfaces — `INotifyPropertyChanged`
(already implemented, announcing *that* something changed) and `IDataErrorInfo`
(this lesson, answering *whether* the current state is valid) — genuinely
different, complementary contracts, both satisfied by one class.

### Mechanical Walkthrough

- `IDataErrorInfo` — (first appearance) — a real, built-in .NET
  interface (`System.ComponentModel`, already `using` from before)
  WPF's binding system specifically checks for on any bound object.
- `public string Error => string.Empty;` — (first appearance of
  **expression-bodied member syntax**, `=>` used on a property instead
  of a lambda) — shorthand for
  `public string Error { get { return string.Empty; } }`; required by
  the interface (an object-level error, unused by this project — every
  real validation here is per-property, via the indexer below), always
  returning nothing wrong at the whole-object level.
- `public string this[string propertyName]` — reappearing (indexer,
  previous unit), the interface's actual per-property check: WPF calls
  this, automatically, passing the *name* of whichever bound property
  it wants validated, every time that property's value changes.
- `propertyName == nameof(Name)` — reappearing (`nameof`, mentioned
  earlier, first real use) — comparing the passed-in property name
  against `Name` specifically, safely: renaming the `Name` property
  later would fail to compile here until this line is updated too, the
  same compile-time-safety reasoning `nameof` always buys you.
- `string.IsNullOrWhiteSpace(Name)` — reappearing, this lesson's first
  unit, applied for real.
- `return "Name is required.";` / `return string.Empty;` — the indexer's
  actual contract: a non-empty string means "this property is currently
  invalid, and here's why"; an empty string means "this property is
  fine" — WPF interprets exactly this convention.

### CS Lens

`IDataErrorInfo` is the **Strategy pattern** again — reappearing from
the `Frame`/`Page` split before (there, arrangement strategy; here,
validation strategy): WPF's binding system doesn't know or care *how*
`InventoryItem` decides what's valid — it only knows to call this
specific indexer and interpret an empty-versus-non-empty string. A
completely different class, with completely different validation rules,
plugs into the exact same binding mechanism by implementing the same
interface.

### SE Lens

Why does WPF define a whole interface for this instead of, say, binding
directly to a `bool IsValid` property you'd write yourself? Because a
form typically has *several* independently-validatable fields (not this
lesson's `InventoryItem` yet, but Epic 3's growing item certainly will),
and a single `bool` can't say *which* field is wrong or *why* — the
indexer's `string propertyName` parameter is what lets one interface
answer "is `Name` OK," "is `Quantity` OK," and so on, each with its own
specific message, from one implementation.

---

## Concept Unit: Wiring Live Validation Into the Form

### The Problem

`NameInput` isn't bound to anything yet — the code so far read its `.Text`
imperatively, inside `AddButton_Click`, which is exactly why nothing
currently stops a blank submission. Real `IDataErrorInfo` validation
only fires through a real binding.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`; `InventoryPage.xaml.cs`.
- **Change type:** Add, modify.
- **Location:** The `TextBox` in `InventoryPage`'s Add row;
  `AddButton_Click`.
- **Dependencies:** `IDataErrorInfo`, previous unit.

### The New Code — the Binding

```xml
<TextBox x:Name="NameInput"
         Width="240"
         Text="{Binding NewItemDraft.Name, ValidatesOnDataErrors=True, UpdateSourceTrigger=PropertyChanged}" />
```

### The Updated Project

```xml
<StackPanel Grid.Row="0" Orientation="Horizontal">
    <TextBox x:Name="NameInput"                                             <!-- ← changed -->
             Width="240"                                                     <!-- ← changed -->
             Text="{Binding NewItemDraft.Name, ValidatesOnDataErrors=True, UpdateSourceTrigger=PropertyChanged}" /> <!-- ← changed (was no Text binding at all) -->
    <Button Content="Add"
            Style="{StaticResource ToolbarButtonStyle}"
            Margin="12,0,0,0"
            Click="AddButton_Click" />
</StackPanel>
```

### Mechanical Walkthrough
- `Text="{Binding NewItemDraft.Name, ...}"` — reappearing (`{Binding}`,
  already used), new path: `NewItemDraft.Name`, reading through a property
  on `InventoryPage` (built next) rather than directly off `InventoryPage`
- itself — the identical `Property.SubProperty` binding-path shape
  the `CurrentPerson.Nickname` lab already proved works.
- `ValidatesOnDataErrors=True` — (first appearance) — tells this
  specific binding to actually check `IDataErrorInfo` on its source
- object, on every update — without this, `InventoryItem`'s indexer
  exists but nothing ever calls it.
- `UpdateSourceTrigger=PropertyChanged` — reappearing, needed
  for exactly the reason it was needed before: live, per-keystroke
  updates, so the error indicator appears and disappears in real time
  rather than only on lost focus.

### The New Code — a Bindable Draft Item

```csharp
public InventoryItem NewItemDraft { get; set; } = new InventoryItem();
```

```csharp
private void AddButton_Click(object sender, RoutedEventArgs e)
{
    if (string.IsNullOrWhiteSpace(NewItemDraft.Name))
    {
        return;
    }

    Items.Add(NewItemDraft);
    SaveItemToDatabase(NewItemDraft);
    NewItemDraft = new InventoryItem();
    OnPropertyChanged();
}
```

Wait — `InventoryPage` itself has no `INotifyPropertyChanged` machinery
yet, and reassigning `NewItemDraft` needs to notify the binding, the
same problem already solved for `InventoryItem` earlier.
`InventoryPage` needs the identical treatment, applied to itself this
time:

```csharp
public partial class InventoryPage : Page, INotifyPropertyChanged
{
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

    // ...
}
```

### The Updated Project

```csharp
using Microsoft.Data.Sqlite;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Windows;
using System.Windows.Controls;

namespace PocketInventory
{
    public partial class InventoryPage : Page, INotifyPropertyChanged        // ← changed
    {
        private const string ConnectionString = "Data Source=pocketinventory.db";

        public ObservableCollection<InventoryItem> Items { get; } = new ObservableCollection<InventoryItem>();

        private InventoryItem newItemDraft = new InventoryItem();            // ← new

        public InventoryItem NewItemDraft                                    // ← new
        {                                                                     // ← new
            get { return newItemDraft; }                                     // ← new
            set                                                               // ← new
            {                                                                 // ← new
                newItemDraft = value;                                        // ← new
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(NewItemDraft))); // ← new
            }                                                                 // ← new
        }                                                                     // ← new

        public event PropertyChangedEventHandler? PropertyChanged;          // ← new

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
            command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)";
            command.ExecuteNonQuery();
        }

        private List<InventoryItem> LoadItemsFromDatabase()
        {
            List<InventoryItem> loadedItems = new List<InventoryItem>();

            using SqliteConnection connection = new SqliteConnection(ConnectionString);
            connection.Open();
            using SqliteCommand command = connection.CreateCommand();
            command.CommandText = "SELECT Id, Name FROM Items";

            using SqliteDataReader reader = command.ExecuteReader();
            while (reader.Read())
            {
                InventoryItem item = new InventoryItem
                {
                    Id = reader.GetInt32(0),
                    Name = reader.GetString(1)
                };
                loadedItems.Add(item);
            }

            return loadedItems;
        }

        private void AddButton_Click(object sender, RoutedEventArgs e)      // ← changed
        {
            if (string.IsNullOrWhiteSpace(NewItemDraft.Name))                // ← new
            {                                                                 // ← new
                return;                                                       // ← new
            }                                                                 // ← new

            Items.Add(NewItemDraft);                                         // ← changed
            SaveItemToDatabase(NewItemDraft);                                 // ← changed
            NewItemDraft = new InventoryItem();                               // ← new
        }

        private void SaveItemToDatabase(InventoryItem item)
        {
            using SqliteConnection connection = new SqliteConnection(ConnectionString);
            connection.Open();
            using SqliteCommand command = connection.CreateCommand();
            command.CommandText = "INSERT INTO Items (Name) VALUES (@name)";
            command.Parameters.AddWithValue("@name", item.Name);
            command.ExecuteNonQuery();
        }

        private void ItemListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            DetailPanel.DataContext = ItemListBox.SelectedItem;
        }
    }
}
```

`AddButton_Click` now checks validity itself before doing anything
destructive (adding, saving), *and* the `TextBox`'s own binding
independently shows a red error border the instant `NewItemDraft.Name`
becomes blank — two layers, deliberately: the visual indicator gives
immediate feedback; the `Click` handler's own check is what actually
guarantees invalid data never reaches `Items` or the database, even if
someone found a way to click "Add" without the visual check having run
(a real, defensive habit worth keeping, not redundant ceremony).

### Mechanical Walkthrough

- `public InventoryItem NewItemDraft { get; set; } = new InventoryItem();`
  → immediately replaced with the hand-written version — reappearing
  pattern from `Name`'s earlier treatment, applied to `InventoryPage` itself for
  the first time: a *page* implementing `INotifyPropertyChanged`, not
  just a data model, because `NewItemDraft` is a bound property whose
  *reassignment* (not just its internal `Name` changing) needs to be
  announced.
- `if (string.IsNullOrWhiteSpace(NewItemDraft.Name)) { return; }` —
  reappearing (this lesson's first unit; `return` as an early guard,
  the Android track's sibling lesson names this same fail-fast shape,
  worth recognizing here too).
- `NewItemDraft = new InventoryItem();` — reappearing (constructor
  call), replacing the entire draft object after a successful add —
  simpler than manually clearing `NewItemDraft.Name` back to empty, and
  correctly resets any future per-field draft state (Epic 3 will add
  more) all at once.

### SE Lens

**The `TextBox`'s binding already shows a red error border on blank
input — why does `AddButton_Click` also need its own
`IsNullOrWhiteSpace` check? Isn't the visual validation enough?** The
red border is real feedback, but it's purely visual: nothing about
`ValidatesOnDataErrors=True` stops a `Click` handler from running.
Nothing in WPF's binding system disables the `Button` itself just
because a bound `TextBox` is currently invalid (that's a real, separate
feature — `Binding.ValidatesOnDataErrors` plus a `MultiBinding`-driven
`IsEnabled`, not built here) — a user could still click "Add" between
keystrokes, or a future code path could call `AddButton_Click`
programmatically, bypassing the visual check entirely. The `Click`
handler's own guard is what *actually* guarantees invalid data never
reaches `Items` or the database — the visual border is UX, immediate
feedback with no guarantee attached; the handler's check is the real
boundary enforcement. This is the identical two-layer shape SQLite's
`NOT NULL` (already added) beneath this project's own C#-side checks:
a friendlier, earlier layer that catches most mistakes visibly, backed
by a stricter, later layer that cannot be bypassed, each doing a
genuinely different job.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: leave `NameInput` empty and click "Add" —
nothing is added, and the field shows a real, WPF-native red border
(WPF's default `Validation.ErrorTemplate`, applied automatically, no
styling code written for it) the moment the field's bound value is
empty. Type a real name — the red border disappears immediately, and
"Add" now works exactly as before.

### Connection

Epic 2 closes here: a real item, modeled as its own type,
observing its own changes, selectable and editable live,
saved to and loaded from a real database,
and now rejected at the door when it's invalid (this lesson) — the full
vertical slice this project's design notes promised, for the smallest
possible item. Epic 3 grows this exact item, one real field at a time.

---

## Closing

### Connect the Pieces

One concrete trace: `NameInput.Text` is bound, `TwoWay` by default
(as established before), to `NewItemDraft.Name` — reassigned freshly after every
successful add via `InventoryPage`'s own new `INotifyPropertyChanged`
implementation. `ValidatesOnDataErrors=True` (this lesson) makes that
binding also check `InventoryItem`'s `IDataErrorInfo` indexer on every
update, showing a real error border the instant `Name` is blank —
built from `string.IsNullOrWhiteSpace` (this lesson's first unit) and
an indexer (this lesson's second unit), the actual mechanism WPF
requires for that visual feedback to exist at all. `AddButton_Click`
independently re-checks the same condition before touching `Items` or
the database, so validity is never only a visual suggestion — it's
enforced at the one point that actually matters.

### What Breaks Without This

Temporarily remove just the `if (string.IsNullOrWhiteSpace(NewItemDraft.Name)) { return; }`
guard from `AddButton_Click`, leaving the `ValidatesOnDataErrors`
binding in place. Run the app, leave `NameInput` empty (still showing
its red error border), and click "Add" anyway. Real, representative
result: a genuinely blank row is added to `Items` and saved to the
database — the red border was only ever a *visual* signal, and nothing
about it actually prevented the click handler from proceeding. Restore
the guard and the blank submission is rejected for real. This is the
concrete, hands-on proof of this lesson's central claim: a UI hint
(the red border) and a real enforcement point (the `if` check) are two
different things, and only one of them is a guarantee.

### Exercises

- Change the indexer's message for a blank name to include the actual
  attempted value: `$"'{Name}' is not a valid name."` — confirm the
  message updates live as you type and delete characters.
- Add a second `IDataErrorInfo` rule (still just for `Name`, since it's
  the only field so far): reject a name longer than 50 characters,
  returning a different message. Confirm both rules correctly take
  turns being the active error as you type.
- In the `lab-indexer` throwaway pattern, add a *second* indexer
  parameter type — `public string this[int drawerNumber]` alongside the
  existing `string`-keyed one — and confirm C# correctly picks between
  them based on what type of value you index with
  (`cabinet[0]` versus `cabinet["top"]`) — a direct, hands-on preview of
  overload resolution applied to indexers specifically.

### Definition of Done

- [ ] Submitting a blank (or whitespace-only) name shows a real WPF
      error border and adds nothing.
- [ ] `InventoryItem` implements `IDataErrorInfo`, using an indexer to
      validate `Name` specifically.
- [ ] `InventoryPage` itself implements `INotifyPropertyChanged`, and
      you can explain, in your own words, why reassigning `NewItemDraft`
      needed that rather than `InventoryItem`'s own notification alone.
- [ ] You removed the `AddButton_Click` guard on purpose, saw a real
      blank row get saved despite the red border, and restored the
      guard.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Reject blank item names via IDataErrorInfo binding validation plus a defensive check in AddButton_Click, closing Epic 2's first end-to-end item"`.
