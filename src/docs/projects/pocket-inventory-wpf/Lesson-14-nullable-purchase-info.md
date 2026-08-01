# Lesson 14: A Fact That Might Not Exist Yet

*(`Nullable<T>`/`DateTime?` and `DatePicker`)*

**User Story**
> As a user, I want to record when I purchased an item — but only if I
> actually know the date.

**What you will build**
`InventoryItem` grows a fourth field: **PurchaseDate**. The transferable
problem underneath this lesson: not every item's purchase date is known —
older items, hand-me-downs, things that have been in a drawer for years.
Picking some fake placeholder date (`DateTime.MinValue`, or today's date)
to stand in for "unknown" would be a lie sitting silently in the database,
indistinguishable from a real, deliberately-chosen date. C# has a real,
built-in way to model "this value might genuinely not exist" instead of
faking one — this lesson uses it, and WPF's `DatePicker` control, which
already speaks that exact same "might not exist" language natively.

**What you need to know first:** Lesson 6: `class`, properties,
`InventoryItem`. Lesson 7: the `INotifyPropertyChanged`
get/set/`PropertyChanged?.Invoke(...)` shape every property on this class
already follows — and specifically the `?` on
`public event PropertyChangedEventHandler? PropertyChanged;`, a
**nullable reference type** annotation, which this lesson explicitly
contrasts against a different, unrelated use of `?` it introduces here.
Lesson 9/10: `EnsureDatabaseCreated`, `SaveItemToDatabase`,
`LoadItemsFromDatabase`. Lesson 13: the exact pattern of growing
`InventoryItem` with a new property, then extending the Add row, the
detail panel, and the SQLite table shape together.

**Terms introduced in this lesson:**
- **`Nullable<T>`** — a generic wrapper type that lets a **value type**
  (like `DateTime`, `int`, `decimal`) hold `null`, something no plain
  value type can do on its own.
- **`DateTime?`** — shorthand for `Nullable<DateTime>`; the `?` here is a
  **nullable value type** annotation, a different mechanism from Lesson
  7's nullable *reference* type `?`, explained side by side in this
  lesson's first unit.
- **`.HasValue`** — a `bool` property on any `Nullable<T>`, `true` if it
  currently holds a real value, `false` if it's `null`.
- **`.Value`** — the actual wrapped value; throws if accessed while
  `HasValue` is `false`.
- **`DatePicker`** — a WPF control for picking a calendar date, whose own
  `SelectedDate` property is itself `DateTime?` — genuinely, natively
  representing "no date chosen" as `null`, not a fake sentinel date.

---

## Concept Unit: `Nullable<T>` — Two Different `?`s

### The Problem

`DateTime` is a **value type** — like `int` or `decimal`, a `DateTime`
variable always holds a real, concrete date; it can never be `null` on its
own. But "I don't know this item's purchase date" is a real, valid state
this project needs to represent, not an error to work around.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-nullable
cd lab-nullable
```

Replace `Program.cs`:

```csharp
DateTime purchased = new DateTime(2026, 3, 15);
Console.WriteLine(purchased);

DateTime? maybePurchased = null;
Console.WriteLine(maybePurchased);
Console.WriteLine(maybePurchased.HasValue);

maybePurchased = new DateTime(2026, 3, 15);
Console.WriteLine(maybePurchased.HasValue);
Console.WriteLine(maybePurchased.Value);
```

Run it:

```bash
dotnet run
```

Real output:

```text
3/15/2026 12:00:00 AM

False
True
3/15/2026 12:00:00 AM
```

#### Execution Trace

Two independent `DateTime`-family values, each constructed once and then
inspected, not a loop building up shared state:

1. `purchased = new DateTime(2026, 3, 15);` — a plain `DateTime`,
   constructed once; printing it shows the real date immediately —
   nothing about this line involves `Nullable<T>` at all yet.
2. `maybePurchased = null;` — a `DateTime?` starts out holding `null`;
   printing it prints an empty line (not the word `null`), and
   `.HasValue` correctly reports `False`.
3. `maybePurchased = new DateTime(2026, 3, 15);` — the same variable is
   reassigned to a real date; `.HasValue` now reports `True`, and
   `.Value` returns the real, wrapped `DateTime` — proving the same
   `DateTime?` variable genuinely holds two different kinds of state
   across these three lines, not two separate variables coincidentally
   printed together.

Now prove the actual restriction this lesson exists to solve. Replace
`Program.cs` with just:

```csharp
DateTime purchased = null;
Console.WriteLine(purchased);
```

Run it:

```bash
dotnet run
```

Real error:

```text
Program.cs(1,22): error CS0037: Cannot convert null to 'DateTime' because it is a non-nullable value type
```

*What this proves:* a plain `DateTime` genuinely cannot hold `null` — the
compiler rejects the program before it ever runs, `CS0037`, a real,
concrete wall, not a runtime surprise. `DateTime?` — (the `Nullable<T>`
shorthand) — is a different type entirely, one specifically built to wrap
a value type and add exactly one more possible state: `null`, meaning "no
value at all." `Console.WriteLine(maybePurchased)` on a `null` value
printed a blank line, not the word `null` — string interpolation and
`ToString()` on a `null` `Nullable<T>` produce an empty string rather than
throwing, a small, deliberate convenience. `.HasValue` reports which state
it's currently in; `.Value` — accessed only after confirming `HasValue`
is `true`, here — retrieves the real, wrapped `DateTime`.

### Discard the Throwaway Example
Delete the `lab-nullable` folder. `DateTime?` itself is not discarded —
`InventoryItem`'s new `PurchaseDate` property uses it, for real, in the
very next unit.

### Mechanical Walkthrough

- `DateTime purchased = new DateTime(2026, 3, 15);` — reappearing
  (`DateTime`, a value type), included only to contrast against what
  follows.
- `DateTime? maybePurchased = null;` — **first appearance of
  `Nullable<T>`/the nullable-value-type `?`.** A `DateTime?` variable can
  hold either a real `DateTime` or `null` — two states a plain `DateTime`
  can never have.
- `DateTime purchased = null;` failing with `CS0037` — real,
  compiler-enforced proof that the restriction this unit describes is
  genuine, not just documentation.
- `maybePurchased.HasValue` / `maybePurchased.Value` — **first
  appearance.** The two members every `Nullable<T>` has: which state it's
  in, and (only when `HasValue` is `true`) the real value itself.

### CS Lens

This is C#'s answer to the general **option/optional type** idea — a
container that's either "a real value" or "nothing," made a first-class,
compiler-checked concept instead of a convention (like Python's `None`,
usable for *any* variable, with no compiler distinction between "this
could be `None`" and "this is guaranteed to have a value"). `DateTime?`
carries that distinction directly in its type: code that expects a plain
`DateTime` cannot accidentally receive one that might be `null` without
the compiler noticing.

Two different `?`s, side by side, worth naming precisely: Lesson 7's
`PropertyChangedEventHandler? PropertyChanged` is a **nullable reference
type** annotation — `PropertyChangedEventHandler` is already a reference
type, always capable of being `null` at the runtime level; the `?` there
is a compile-time-only warning system layered on top (`<Nullable>enable</Nullable>`
in the `.csproj`, Lesson 0). `DateTime?` here is a **nullable value type**
— `DateTime` genuinely *cannot* be `null` without `Nullable<T>` wrapping
it; the `?` here isn't a warning annotation, it's the thing that makes
`null` possible at all, a real, different mechanism that happens to share
the same `?` character.

### SE Lens

Why not just use `DateTime.MinValue` (`0001-01-01`) to mean "no purchase
date," avoiding `Nullable<T>` entirely? Because that value is a **lie**:
nothing about `DateTime.MinValue` distinguishes "the user genuinely
purchased this on January 1st, year 1" (impossible, but the type system
can't tell) from "nobody entered a date." Every future piece of code that
reads `PurchaseDate` — sorting by date, displaying it, filtering by date
range — has to separately remember and re-check "oh, and treat this one
specific value as meaning absent" everywhere it's used, forever, with no
compiler help. `DateTime?` makes "absent" a real, distinct,
compiler-visible state instead of an unwritten convention every future
reader has to already know.

### Connection

`InventoryItem`'s new `PurchaseDate` property is exactly this kind of
value — the next unit adds it.

---

## Concept Unit: Growing `InventoryItem` — PurchaseDate

### The Problem

`InventoryItem` currently models `Name`, `Category`, `Location`, and
`Value`. Time to add the fact this lesson's user story asks for.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryItem.cs`.
- **Change type:** Add.
- **Dependencies:** `DateTime?`, this lesson's first unit; the
  `INotifyPropertyChanged` get/set pattern already established, reused
  identically.

### The New Code

```csharp
private DateTime? purchaseDate;

public DateTime? PurchaseDate
{
    get { return purchaseDate; }
    set
    {
        purchaseDate = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(PurchaseDate)));
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

        private decimal value;

        public decimal Value
        {
            get { return value; }
            set
            {
                this.value = value;
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Value)));
            }
        }

        private DateTime? purchaseDate;                                          // ← new

        public DateTime? PurchaseDate                                            // ← new
        {                                                                        // ← new
            get { return purchaseDate; }                                        // ← new
            set                                                                  // ← new
            {                                                                    // ← new
                purchaseDate = value;                                            // ← new
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(PurchaseDate))); // ← new
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

### Mechanical Walkthrough

- `private DateTime? purchaseDate;` / `public DateTime? PurchaseDate { get; set; ... }`
  — reappearing (the exact property shape already used for every other
  field), no naming collision this time (`value` was `Value`'s own
  problem, specific to that property's field name) — the only new detail
  is the type itself, `DateTime?`, carried through unchanged from
  declaration to backing field to public property.

### CS Lens

`PurchaseDate` defaults to `null` the moment a new `InventoryItem` is
constructed — no explicit initializer needed, unlike `Location`'s
`= string.Empty;` — because `Nullable<T>`'s own default value *is*
`null`, the same way `int`'s default is `0` and `bool`'s is `false`.
"Unknown until entered" is this property's natural starting state, not
something this lesson has to arrange.

### SE Lens

Why does `PurchaseDate` skip the explicit `= null` initializer that
`Location`'s `= string.Empty` uses? Because writing `DateTime? purchaseDate = null;`
would be redundant — `null` is already every `Nullable<T>` field's default
value with no initializer at all. `Location`'s `string.Empty` initializer
exists specifically to *avoid* `string`'s own default (`null`, since
`string` is a reference type) for a property this project doesn't want to
ever hold `null` — the opposite goal from `PurchaseDate`, which wants
`null` to be its unset state.

### Connection

`PurchaseDate` now exists on `InventoryItem`, defaulting correctly to "not
yet known." The next unit adds the control built specifically to edit a
value like this.

---

## Concept Unit: `DatePicker` and Its Nullable `SelectedDate`

### The Problem

`PurchaseDate` exists, but nothing on screen can set or clear it yet — and
a plain `TextBox` would reopen the exact free-text problem `enum`/`ComboBox`
(Lesson 12) already solved for `Category`, now for dates specifically: a
user could type `"next tuesday"` or `"03/15/2026"` or `"15-03-2026"`,
three different formats meaning three different things depending on
locale.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-datepicker
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel Loaded="StackPanel_Loaded">
    <DatePicker x:Name="PurchaseDatePicker" SelectedDate="{Binding PurchaseDate}" />
</StackPanel>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Windows;

namespace lab_datepicker
{
    public partial class MainWindow : Window
    {
        public DateTime? PurchaseDate { get; set; }

        public MainWindow()
        {
            InitializeComponent();
            DataContext = this;
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            Console.WriteLine($"Before picking a date: {PurchaseDate}");

            PurchaseDatePicker.SelectedDate = new DateTime(2026, 3, 15);
            Console.WriteLine($"After picking a date: {PurchaseDate}");

            PurchaseDatePicker.SelectedDate = null;
            Console.WriteLine($"After clearing it: {PurchaseDate}");

            Application.Current.Shutdown();
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
Before picking a date:
After picking a date: 3/15/2026 12:00:00 AM
After clearing it:
```

*What this proves:* `DatePicker.SelectedDate` is itself typed `DateTime?`
— WPF's own control chose exactly the type the previous unit just
introduced, not by coincidence: a date picker with nothing selected
genuinely has no date, the same "might not exist" state `Nullable<T>`
exists to represent. Binding `SelectedDate="{Binding PurchaseDate}"` needs
no implicit conversion at all (unlike Lesson 13's `TextBox.Text` → `decimal`
conversion) — both sides are already the identical type, `DateTime?`.
Clearing the picker's selection (via its own UI, in real use — simulated
here by setting `SelectedDate = null` directly) writes `null` straight
back into `PurchaseDate`, proving the binding is genuinely two-way and
genuinely nullable in both directions, not just on the way in.

### Discard the Throwaway Example
Delete the `lab-datepicker` folder. `DatePicker` and its `DateTime?`
`SelectedDate` are not discarded — the real Add row uses exactly this
next.

### Mechanical Walkthrough

- `<DatePicker x:Name="PurchaseDatePicker" SelectedDate="{Binding PurchaseDate}" />`
  — **first appearance of `DatePicker`.** A calendar-popup control for
  picking one date; its `SelectedDate` property is `DateTime?`, matching
  `PurchaseDate`'s own type exactly.
- `PurchaseDatePicker.SelectedDate = new DateTime(2026, 3, 15);` /
  `= null;` — reappearing (direct property assignment, used since Lesson
  1), here simulating what a real user click and a real "clear" action
  would each do.

### CS Lens

A WPF control whose own property is typed `Nullable<T>` is direct,
built-in evidence that "this value might not exist" isn't a workaround
this project invented — it's a real, common enough scenario that the
.NET Framework team modeled `DatePicker` around it from the start.

### SE Lens

Why does `DatePicker` bother supporting "no date selected" at all, instead
of always defaulting to today's date the way some calendar widgets do?
Because a default of "today" is exactly the same lie `DateTime.MinValue`
would have been, dressed differently — a plausible-looking value with no
way to distinguish "the user picked today, deliberately" from "the user
never touched this control." `SelectedDate`'s `null` default keeps that
distinction real and queryable, the same design decision `PurchaseDate`
itself just made.

### Connection

The real Add row wires exactly this `DatePicker` next.

---

## Concept Unit: Wiring `PurchaseDate` Into the Add Form and Detail Panel

### The Problem

`PurchaseDate` and `DatePicker` both exist independently; nothing connects
them to the real project yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`.
- **Change type:** Add.
- **Location:** The Add row's `StackPanel` (already built); `DetailPanel`
  (already built).
- **Dependencies:** `PurchaseDate`, previous unit; `DatePicker`, previous
  unit.

### The New Code — the Add Row

```xml
<DatePicker Width="130"
            Margin="12,0,0,0"
            SelectedDate="{Binding NewItemDraft.PurchaseDate}" />
```

### The New Code — the Detail Panel

```xml
<TextBlock Text="{Binding PurchaseDate, StringFormat={}{0:d}, TargetNullValue='(no date)'}"
           Margin="0,8,0,0" />
```

### The Updated Project — the Add Row

```xml
<StackPanel Grid.Row="0" Orientation="Horizontal">
    <TextBox x:Name="NameInput"
             Width="240"
             Text="{Binding NewItemDraft.Name, ValidatesOnDataErrors=True, UpdateSourceTrigger=PropertyChanged}" />
    <ComboBox Width="140"
              Margin="12,0,0,0"
              ItemsSource="{Binding CategoryValues}"
              SelectedItem="{Binding NewItemDraft.Category}" />
    <TextBox Width="160"
             Margin="12,0,0,0"
             Text="{Binding NewItemDraft.Location, UpdateSourceTrigger=PropertyChanged}" />
    <TextBox Width="100"
             Margin="12,0,0,0"
             Text="{Binding NewItemDraft.Value, UpdateSourceTrigger=PropertyChanged}" />
    <DatePicker Width="130"                                                                      <!-- ← new -->
                Margin="12,0,0,0"                                                                 <!-- ← new -->
                SelectedDate="{Binding NewItemDraft.PurchaseDate}" />                              <!-- ← new -->
    <Button Content="Add"
            Style="{StaticResource ToolbarButtonStyle}"
            Margin="12,0,0,0"
            Click="AddButton_Click" />
</StackPanel>
```

### The Updated Project — the Detail Panel

```xml
<StackPanel x:Name="DetailPanel" Grid.Column="1" Margin="16,0,0,0">
    <TextBlock Text="Details" FontWeight="Bold" Margin="0,0,0,8" />
    <TextBox Text="{Binding Name, UpdateSourceTrigger=PropertyChanged}" />
    <TextBlock Text="{Binding Category}" FontWeight="SemiBold" Margin="0,8,0,0" />
    <TextBox Text="{Binding Location, UpdateSourceTrigger=PropertyChanged}"
             Margin="0,8,0,0" />
    <TextBlock Text="{Binding Value, StringFormat={}{0:C}}"
               FontWeight="SemiBold"
               Margin="0,8,0,0" />
    <TextBlock Text="{Binding PurchaseDate, StringFormat={}{0:d}, TargetNullValue='(no date)'}"    <!-- ← new -->
               Margin="0,8,0,0" />                                                                 <!-- ← new -->
</StackPanel>
```

`PurchaseDate` is shown read-only in `DetailPanel`, the same choice
already made for `Category` and `Value`, and for the identical reason: a
control that looks editable but isn't wired to persist an edit yet
(Lesson 21) would mislead.

### Mechanical Walkthrough

- `SelectedDate="{Binding NewItemDraft.PurchaseDate}"` — reappearing (the
  Add row's existing binding pattern, now on `DatePicker`), no implicit
  conversion needed — both sides are `DateTime?`, exactly as the previous
  unit's lab proved.
- `TargetNullValue='(no date)'` — (first appearance) — a binding property
  that supplies literal text to display *specifically when the bound
  value is `null`*, instead of the plain empty string a `StringFormat`
  alone produces on `null` (proven directly in this lesson's third unit's
  isolated lab). Without it, an item with no purchase date would show a
  blank line in `DetailPanel` — technically correct, but indistinguishable
  from a rendering bug; `TargetNullValue` makes the "no date" state
  visibly, deliberately explained.

### CS Lens

`TargetNullValue` is WPF's binding-level version of the exact "handle the
absent case explicitly, don't let it silently look like a bug" idea this
lesson's very first unit named as `Nullable<T>`'s whole reason for
existing — the same principle, expressed once in C# (`HasValue`) and once
more here in XAML.

### SE Lens

Why format `TargetNullValue` as `'(no date)'` — parentheses, lowercase —
rather than something more alarming like `"MISSING"` or leaving it blank?
Because an item genuinely having no recorded purchase date is a normal,
expected state for this project (older items, hand-me-downs — this
lesson's own opening problem), not an error condition. The visual
treatment should say "this is fine, nothing to enter" rather than
"something is wrong" — a small, deliberate wording choice with real
effect on how a user reads their own data.

### Connection

`InventoryItem` now carries five real facts. The next unit makes
`PurchaseDate` persist through a full quit and reopen — including the
`null` case — the way the other four already do.

---

## Concept Unit: Persisting a Nullable `DateTime` in SQLite

### The Problem

`PurchaseDate` exists in memory and displays correctly, including when
`null`, but quitting the app still loses it — and unlike every column
added so far, this one has to correctly round-trip *no value at all*, not
just a different value.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml.cs` — `EnsureDatabaseCreated`,
  `SaveItemToDatabase`, `LoadItemsFromDatabase`.
- **Change type:** Modify.
- **Dependencies:** The existing `CREATE TABLE`/`INSERT`/`SELECT`
  established across Lessons 9, 10, 12, and 13.

### The New Code — the Table Shape

```csharp
command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Category TEXT NOT NULL, Location TEXT NOT NULL, Value TEXT NOT NULL, PurchaseDate TEXT NULL)";
```

### The New Code — Saving

```csharp
command.CommandText = "INSERT INTO Items (Name, Category, Location, Value, PurchaseDate) VALUES (@name, @category, @location, @value, @purchaseDate)";
command.Parameters.AddWithValue("@name", item.Name);
command.Parameters.AddWithValue("@category", item.Category.ToString());
command.Parameters.AddWithValue("@location", item.Location);
command.Parameters.AddWithValue("@value", item.Value.ToString(CultureInfo.InvariantCulture));
command.Parameters.AddWithValue("@purchaseDate", (object?)item.PurchaseDate?.ToString("O") ?? DBNull.Value);
```

### The New Code — Loading

```csharp
command.CommandText = "SELECT Id, Name, Category, Location, Value, PurchaseDate FROM Items";

using SqliteDataReader reader = command.ExecuteReader();
while (reader.Read())
{
    InventoryItem item = new InventoryItem
    {
        Id = reader.GetInt32(0),
        Name = reader.GetString(1),
        Category = Enum.Parse<Category>(reader.GetString(2)),
        Location = reader.GetString(3),
        Value = decimal.Parse(reader.GetString(4), CultureInfo.InvariantCulture),
        PurchaseDate = reader.IsDBNull(5) ? null : DateTime.Parse(reader.GetString(5))
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
using System.Globalization;
using System.Windows;
using System.Windows.Controls;

namespace PocketInventory
{
    public partial class InventoryPage : Page, INotifyPropertyChanged
    {
        private const string ConnectionString = "Data Source=pocketinventory.db";

        public ObservableCollection<InventoryItem> Items { get; } = new ObservableCollection<InventoryItem>();

        public Array CategoryValues => Enum.GetValues(typeof(Category));

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
            command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Category TEXT NOT NULL, Location TEXT NOT NULL, Value TEXT NOT NULL, PurchaseDate TEXT NULL)";  // ← changed
            command.ExecuteNonQuery();
        }

        private List<InventoryItem> LoadItemsFromDatabase()
        {
            List<InventoryItem> loadedItems = new List<InventoryItem>();

            using SqliteConnection connection = new SqliteConnection(ConnectionString);
            connection.Open();
            using SqliteCommand command = connection.CreateCommand();
            command.CommandText = "SELECT Id, Name, Category, Location, Value, PurchaseDate FROM Items";  // ← changed

            using SqliteDataReader reader = command.ExecuteReader();
            while (reader.Read())
            {
                InventoryItem item = new InventoryItem
                {
                    Id = reader.GetInt32(0),
                    Name = reader.GetString(1),
                    Category = Enum.Parse<Category>(reader.GetString(2)),
                    Location = reader.GetString(3),
                    Value = decimal.Parse(reader.GetString(4), CultureInfo.InvariantCulture),
                    PurchaseDate = reader.IsDBNull(5) ? null : DateTime.Parse(reader.GetString(5))  // ← new
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
            command.CommandText = "INSERT INTO Items (Name, Category, Location, Value, PurchaseDate) VALUES (@name, @category, @location, @value, @purchaseDate)";  // ← changed
            command.Parameters.AddWithValue("@name", item.Name);
            command.Parameters.AddWithValue("@category", item.Category.ToString());
            command.Parameters.AddWithValue("@location", item.Location);
            command.Parameters.AddWithValue("@value", item.Value.ToString(CultureInfo.InvariantCulture));
            command.Parameters.AddWithValue("@purchaseDate", (object?)item.PurchaseDate?.ToString("O") ?? DBNull.Value);  // ← new
            command.ExecuteNonQuery();
        }

        private void ItemListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            DetailPanel.DataContext = ItemListBox.SelectedItem;
        }
    }
}
```

### Mechanical Walkthrough

- `PurchaseDate TEXT NULL` — (first appearance of an explicitly nullable
  SQLite column) — every other column so far declared `NOT NULL`; this
  one deliberately omits that constraint, because `null` is this column's
  own genuinely valid state, not an oversight to prevent.
- `(object?)item.PurchaseDate?.ToString("O") ?? DBNull.Value` — (first
  appearance of `DBNull.Value`, and of `?.` combined with `??`) —
  `item.PurchaseDate?.ToString("O")` uses the **null-conditional operator**
  (`?.`, first given full treatment back in Lesson 7): if `PurchaseDate`
  is `null`, the whole expression short-circuits to `null` without
  calling `.ToString("O")` at all (which would throw on a genuinely
  absent value); `?? DBNull.Value` — (first appearance of `??`, the
  **null-coalescing operator**) — then replaces that `null` with
  `DBNull.Value` specifically, because ADO.NET (Lesson 9) has its own,
  separate representation for "this database cell is empty," distinct
  from C#'s `null` — passing a plain C# `null` here would throw at
  runtime; `DBNull.Value` is what `Microsoft.Data.Sqlite` actually
  expects. `"O"` — (first appearance) — the **round-trip format
  specifier**, chosen deliberately over `"O"`'s more human-readable
  cousins because it preserves every part of a `DateTime` exactly,
  guaranteeing `DateTime.Parse` reconstructs the identical value later —
  the same display-vs-storage distinction Lesson 13 already drew between
  `ToString("C")` and `ToString(CultureInfo.InvariantCulture)`.
- `reader.IsDBNull(5) ? null : DateTime.Parse(reader.GetString(5))` —
  (first appearance of `IsDBNull`) — the reverse operation: check whether
  this specific cell is actually empty *before* trying to read it as
  text, because calling `reader.GetString(5)` directly on a `DBNull` cell
  throws; only call `DateTime.Parse` once `IsDBNull` has confirmed there's
  real text to parse.

### CS Lens

This unit is the same **serialization** pattern named in Lesson 12 and
reused in Lesson 13, now handling a genuinely new wrinkle: the value being
serialized might not exist at all. `?.` and `??`, chained together, are
C#'s concise way of expressing "if this is absent, use this other thing
instead" — the identical logic a longer `if (item.PurchaseDate.HasValue) { ... } else { ... }`
would express, compressed into one line once the reader already
understands both operators individually.

### SE Lens

Why not just store `DateTime.MinValue`'s `"O"`-formatted text
(`"0001-01-01T00:00:00.0000000"`) instead of a real SQL `NULL`, avoiding
`DBNull.Value`/`IsDBNull` entirely? Because that's exactly the sentinel-value
lie this lesson's very first unit already rejected — a `NULL` cell is a
real, distinct, queryable database concept (`WHERE PurchaseDate IS NULL`
finds every item with no recorded date directly, something Lesson 32's
"items missing a category" query already relies on this same pattern
for); a fake minimum date would be indistinguishable from real data to
any query that didn't already know to specifically exclude it.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: add one item with a purchase date picked from the
`DatePicker`, and a second item leaving the date picker blank. Select
each in turn — the first shows a real formatted date in `DetailPanel`; the
second shows `(no date)`, not a blank line. Fully quit and reopen the
app: both items are back exactly as entered, including which one has no
date. Open `pocketinventory.db` in a SQLite browser if you have one — the
second item's `PurchaseDate` cell is genuinely `NULL`, not an empty
string or a placeholder date.

### Connection

`InventoryItem` now carries five real facts, the first one genuinely
optional — and every layer this project has built (the model, the
binding, the detail panel, SQLite persistence) absorbed a `null`-capable
field using the same patterns already established, extended rather than
special-cased. Lesson 15 adds two more fields — one always present
(`Notes`), one a plain `bool` — closing out Epic 3's item-growing pattern
before Epic 4 turns to searching and filtering everything built so far.

---

## Closing

### Connect the Pieces

A user opens the new `DatePicker` (third unit) and either picks a date or
leaves it blank — either way, `SelectedDate="{Binding NewItemDraft.PurchaseDate}"`
(fourth unit) writes the result, `DateTime?` on both sides with no
conversion needed, straight into the draft item. Clicking Add hands that
draft to `SaveItemToDatabase`, where `item.PurchaseDate?.ToString("O") ?? DBNull.Value`
(fifth unit) becomes either a real timestamp string or a genuine SQL
`NULL`. Selecting the item back in the list drives `DetailPanel`'s
`{Binding PurchaseDate, StringFormat={}{0:d}, TargetNullValue='(no date)'}`
(fourth unit), which — proven directly in the third unit's isolated lab —
renders a real value formatted, or `(no date)` for the null case, never a
confusing blank line.

### What Breaks Without This

Temporarily change the loading code's
`reader.IsDBNull(5) ? null : DateTime.Parse(reader.GetString(5))` to just
`DateTime.Parse(reader.GetString(5))`, removing the `IsDBNull` check. Add
one item with no purchase date, then fully quit and reopen the app. Real,
representative failure: the app crashes on startup with an unhandled
exception the moment `LoadItemsFromDatabase` reaches that row — reading a
`NULL` SQLite cell as a `string` doesn't produce `null` gracefully, it
throws. This is concrete proof of this unit's whole point: a nullable
column genuinely needs an explicit check before reading it, every time,
the same way `Nullable<T>.Value` needs `HasValue` checked first — skipping
either one turns "no value" into a crash instead of a handled case.
Restore the real `IsDBNull` check afterward.

### Exercises

- In a throwaway console app, write a method
  `string DescribeDate(DateTime? date)` that returns `"No date recorded"`
  when `date` is `null` and the date's short string form otherwise, using
  `HasValue` and `Value` explicitly (not `?.`/`??`) — then rewrite it
  using `?.` and `??` instead, and confirm both versions produce identical
  real output for both a real date and `null`.
- Add a second `DatePicker`-backed nullable field of your own design to a
  throwaway `dotnet new wpf` project (for example, a "warranty expires"
  date) — bind it, run it, and confirm its default state really is `null`
  with no code initializing it that way.
- Predict, in your own words, what `reader.GetString(5)` alone (no
  `IsDBNull` check) does when the underlying SQLite cell is genuinely
  `NULL`, before running "What Breaks Without This" above — then compare
  your prediction to the real exception.

### Definition of Done

- [ ] `PurchaseDate` (`DateTime?`) exists on `InventoryItem`, following
      the same `INotifyPropertyChanged` shape as every other property.
- [ ] The Add row includes a working `DatePicker` alongside the existing
      fields, and leaving it blank is a genuinely valid choice.
- [ ] `DetailPanel` shows the selected item's purchase date formatted, or
      `(no date)` for an item with none — never a blank line.
- [ ] Adding one item with a date and one without, fully quitting, and
      reopening the app preserves both correctly, including which one has
      no date.
- [ ] You reproduced the missing-`IsDBNull`-check crash on purpose, read
      the real exception, and restored the correct code.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add PurchaseDate (DateTime?) with DatePicker and nullable SQLite persistence"`.
