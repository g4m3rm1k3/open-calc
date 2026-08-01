# Lesson 13: A Number That Represents Money

*(`decimal` and culture-aware formatting)*

**User Story**
> As a user, I want to assign a monetary value to each item.

**What you will build**
`InventoryItem` grows a third real field: **Value**, the item's worth in
dollars and cents. The transferable problem underneath this lesson isn't
really about WPF at all — it's that the obvious choice for "a number with a
decimal point," `double`, is quietly wrong for money, in a way that doesn't
show up until real currency arithmetic runs and the totals stop adding up
exactly. This lesson proves that failure for real, then uses the type C#
actually built for money instead, and formats it as real currency
(`$1,299.00`) instead of a bare number.

**What you need to know first:** Lesson 6: `class`, properties,
`InventoryItem`. Lesson 7: the `INotifyPropertyChanged`
get/set/`PropertyChanged?.Invoke(...)` shape every property on this class
already follows. Lesson 9/10: `EnsureDatabaseCreated`, `SaveItemToDatabase`,
`LoadItemsFromDatabase`. Lesson 12: the exact pattern of growing
`InventoryItem` with a new property, then extending the Add row, the detail
panel, and the SQLite table shape together, in one lesson.

**Terms introduced in this lesson:**
- **`decimal`** — a 128-bit numeric type built specifically for money and
  other values where exact base-10 arithmetic matters, distinct from
  `double`/`float`.
- **Floating-point representation error** — the reason `double` (and
  `float`) cannot represent most decimal fractions exactly in binary,
  proven with real output in this lesson's first lab.
- **`ToString("C")`** — a **format string** telling a number to render
  itself as currency (symbol, thousands separator, two decimal places),
  instead of its bare digits.
- **`CultureInfo`** — a .NET type describing region-specific formatting
  rules (currency symbol, decimal separator, thousands separator); what
  `"C"` actually means is resolved against one.
- **Implicit binding conversion** — WPF's data-binding engine automatically
  converting a `TextBox`'s `string` text to and from a bound property's
  real type (here, `decimal`), with no converter code written by hand.

---

## Concept Unit: `decimal` vs. `double` — Proving the Representation Error

### The Problem

`double` is the obvious first choice for "a number that can have a decimal
point" — it's what Lesson 0 already used for ordinary arithmetic. Money
needs exact base-10 arithmetic (`$0.10 + $0.20` must equal exactly `$0.30`,
every time), and it's worth proving, not just asserting, that `double`
cannot guarantee that.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-decimal
cd lab-decimal
```

Replace `Program.cs`:

```csharp
double a = 0.1;
double b = 0.2;
Console.WriteLine(a + b);
Console.WriteLine(a + b == 0.3);

decimal c = 0.1m;
decimal d = 0.2m;
Console.WriteLine(c + d);
Console.WriteLine(c + d == 0.3m);
```

Run it:

```bash
dotnet run
```

Real output:

```text
0.30000000000000004
False
0.3
True
```

*What this proves:* `double` stores numbers in binary floating-point, and
`0.1` and `0.2` have no exact binary representation — the same way `1/3`
has no exact finite decimal representation in base 10. Adding the two
closest-possible binary approximations produces a result that's off by a
tiny amount, `0.30000000000000004`, not `0.3` — small enough to ignore for
graphics or physics, but never acceptable for money, where `a + b == 0.3`
silently returning `False` could mean a real financial total is wrong by a
fraction of a cent, compounding across thousands of transactions.
`decimal` — (first appearance) — the `m` suffix marks a literal as
`decimal` specifically, not `double` — stores numbers in base 10 internally
instead of binary, so `0.1m + 0.2m` is exactly `0.3m`, with no
representation error at all, because base-10 fractions are exactly what
base-10 arithmetic represents exactly.

### Discard the Throwaway Example
Delete the `lab-decimal` folder. `decimal` itself is not discarded —
`InventoryItem`'s new `Value` property uses it, for real, in the very next
unit.

### Mechanical Walkthrough

- `double a = 0.1; double b = 0.2;` — reappearing (`double`, used since
  Lesson 0), now specifically chosen to expose its own weakness.
- `a + b == 0.3` returning `False` — the first real proof, not just an
  assertion, of this lesson's **floating-point representation error**
  glossary entry: `double` cannot be trusted for exact decimal
  arithmetic.
- `decimal c = 0.1m;` — **first appearance of `decimal` and the `m`
  literal suffix.** Stores values in base 10 internally, avoiding the
  binary-fraction problem entirely for values that are exact in base 10
  (which every real currency amount is, by definition — dollars and whole
  cents).

### CS Lens

This is the general **fixed-point vs. floating-point representation**
distinction, made concrete instead of abstract: `double`/`float` trade
exactness for an enormous representable range (useful for scientific and
graphics work); `decimal` trades range for base-10 exactness (useful
anywhere the number represents a real-world quantity — money above all —
where "close enough" is a real bug, not a rounding curiosity).

Also recognized in: Python's `decimal.Decimal` (the direct equivalent,
opt-in rather than a distinct literal syntax); this exact `0.1 + 0.2`
example is a famous, language-independent floating-point demonstration —
Python's own `float` reproduces the identical `0.30000000000000004` result,
for the identical binary-representation reason.

### SE Lens

Why doesn't C# just make `decimal` the default numeric type, if `double`
is this easy to get wrong? Because `decimal` is slower — it does base-10
arithmetic in software, on top of hardware that's natively binary, while
`double` maps directly onto a CPU's floating-point unit. For the vast
majority of numbers a program handles (loop counters, pixel positions,
physics simulations), the representation error is irrelevant and the speed
matters; for the specific, narrower case of money, the tradeoff flips
completely, which is exactly why C# offers both instead of picking one
correct answer for every situation.

### Connection

`InventoryItem`'s new `Value` property is exactly the kind of value this
unit just proved needs `decimal` — the next unit adds it.

---

## Concept Unit: Growing `InventoryItem` — Value

### The Problem

`InventoryItem` currently models `Name`, `Category`, and `Location`. Time
to add the fact this lesson's user story asks for.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryItem.cs`.
- **Change type:** Add.
- **Dependencies:** `decimal`, this lesson's first unit; the
  `INotifyPropertyChanged` get/set pattern already established, reused
  identically.

### The New Code

```csharp
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

        private decimal value;                                                  // ← new

        public decimal Value                                                     // ← new
        {                                                                        // ← new
            get { return value; }                                               // ← new
            set                                                                  // ← new
            {                                                                    // ← new
                this.value = value;                                              // ← new
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Value))); // ← new
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

- `private decimal value;` / `public decimal Value { get; set; ... }` —
  reappearing (the exact property shape already used for `Name`,
  `Category`, `Location`), one genuinely new detail: the parameter WPF's
  binding system passes into `set` and this field share a naming
  collision — the built-in `value` keyword (available inside any `set`
  block) and this class's own private field, also named `value`, are the
  same five letters but different things. `this.value = value;` —
  (first appearance of `this.` used to disambiguate) — `this.value` means
  "the field on this specific object"; the bare `value` on the right
  means "whatever was just assigned," the `set` block's own keyword. C#
  resolves the naming collision by requiring `this.` for the field the
  moment a local name (here, the `set` block's `value`) would otherwise
  hide it — the same shadowing rule that would apply to any local
  variable named the same as a field.

### CS Lens

`this.value = value;` is a real, concrete instance of **variable
shadowing** — a narrower-scoped name (the `set` block's `value` parameter)
temporarily hiding a wider-scoped one (the field). Every other property on
this class avoided the collision by choosing a private field name that
doesn't match the built-in `value` keyword (`name`, `category`,
`location`) — this property is the first one where the field's most
natural name collides, making the general rule (`this.` always reaches the
field, unqualified names prefer the nearest scope) worth naming explicitly
instead of leaving it as something every other property happened to avoid.

### SE Lens

Why not just name the field something else, like `rawValue`, to sidestep
the collision entirely, the way `name`/`category`/`location` incidentally
did? Because `value` is the actually correct, honest name for what this
field holds — inventing an artificial name purely to dodge a language
keyword collision trades a small, well-understood disambiguation (`this.`)
for a permanently slightly-wrong name every future reader has to silently
translate.

### Connection

`Value` now exists on `InventoryItem`, using `decimal`. The next unit
formats it as real currency instead of a bare number.

---

## Concept Unit: `ToString("C")` and `CultureInfo`

### The Problem

`Console.WriteLine(someDecimal)` prints a bare number — `1299`, not
`$1,299.00`. Money needs to be *displayed* as currency, not just stored
correctly.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-currency
cd lab-currency
```

Replace `Program.cs`:

```csharp
using System.Globalization;

decimal price = 1299m;

Console.WriteLine(price.ToString("C"));
Console.WriteLine(price.ToString("C", CultureInfo.GetCultureInfo("en-US")));
Console.WriteLine(price.ToString("C", CultureInfo.GetCultureInfo("de-DE")));
Console.WriteLine(price);
```

Run it:

```bash
dotnet run
```

Real output, from this machine (its own current culture is `en-US`):

```text
$1,299.00
$1,299.00
1.299,00 €
1299
```

*What this proves:* `"C"` is a **format string** — a short code passed to
`ToString(...)` telling a number how to render itself; `"C"` specifically
means "currency." `price.ToString("C")`, called with no explicit culture,
uses `CultureInfo.CurrentCulture` — whatever region this machine's own
Windows settings are configured for — which is why the plain call and the
explicit `"en-US"` call above produced the identical `$1,299.00` on this
machine. Passing `CultureInfo.GetCultureInfo("de-DE")` explicitly proves
`"C"` isn't a fixed format at all: the identical `1299m` value renders as
`1.299,00 €` — a different symbol, a different decimal separator (`,`
instead of `.`), and a different thousands separator (`.` instead of `,`)
— every one of those rules coming from the culture, not from `"C"` itself.
Plain `price` with no format string at all still prints the bare `1299`,
exactly like `Console.WriteLine` always has — `ToString("C")` is
something you ask for, not something `decimal` does automatically.

### Discard the Throwaway Example
Delete the `lab-currency` folder. `ToString("C")` is not discarded — the
real project's detail panel formats `Value` with it next.

### Mechanical Walkthrough

- `price.ToString("C")` — **first appearance of a format string.**
  Renders `price` as currency using `CultureInfo.CurrentCulture` — this
  machine's own region settings — implicitly.
- `price.ToString("C", CultureInfo.GetCultureInfo("en-US"))` — **first
  appearance of `CultureInfo`.** Explicitly names which region's
  formatting rules to use, overriding whatever the running machine's own
  settings happen to be.
- `price.ToString("C", CultureInfo.GetCultureInfo("de-DE"))` — same
  method, a different culture — proof that `"C"`'s actual output (symbol,
  separators) is resolved against the culture argument, not hardcoded.

### CS Lens

This is **locale-aware formatting**: the same underlying value (`1299m`)
has more than one *correct* textual representation, depending on who's
reading it — not a bug to fix by picking one, but a real requirement any
software with users in more than one region has to account for
deliberately.

### SE Lens

Why does this project use the plain, no-explicit-culture
`price.ToString("C")` rather than hardcoding `CultureInfo.GetCultureInfo("en-US")`
everywhere, given the de-DE example just proved the two can differ? Because
Pocket Inventory is a single-user desktop app with no server involved —
respecting *this specific machine's* own Windows region settings is the
genuinely correct behavior here (a user in Germany running this same
`.exe` should see `1.299,00 €`, not a hardcoded `$1,299.00`). An explicit,
hardcoded culture is the right call only when consistency across every
viewer matters more than matching each viewer's own machine — a shared web
report, for instance, where "everyone sees the identical format" outranks
"each reader sees their own region's convention." This project's honest
answer is: let the machine decide.

### Connection

The real detail panel's `Value` display uses exactly this — `ToString("C")`
with no explicit culture — next.

---

## Concept Unit: Wiring `Value` Into the Add Form and Detail Panel

### The Problem

`Value` exists on `InventoryItem`, and it can be formatted as currency, but
nothing on screen can enter or see it yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryPage.xaml.cs`.
- **Change type:** Add.
- **Location:** The Add row's `StackPanel` (already built); `DetailPanel`
  (already built).
- **Dependencies:** `Value`, previous unit; `ToString("C")`, previous
  unit.

### The New Code — the Add Row

```xml
<TextBox Width="100"
         Margin="12,0,0,0"
         Text="{Binding NewItemDraft.Value, UpdateSourceTrigger=PropertyChanged}" />
```

### The New Code — the Detail Panel

```xml
<TextBlock Text="{Binding Value, StringFormat={}{0:C}}"
           FontWeight="SemiBold"
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
    <TextBox Width="100"                                                                        <!-- ← new -->
             Margin="12,0,0,0"                                                                   <!-- ← new -->
             Text="{Binding NewItemDraft.Value, UpdateSourceTrigger=PropertyChanged}" />          <!-- ← new -->
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
    <TextBlock Text="{Binding Value, StringFormat={}{0:C}}"                                       <!-- ← new -->
               FontWeight="SemiBold"                                                               <!-- ← new -->
               Margin="0,8,0,0" />                                                                 <!-- ← new -->
</StackPanel>
```

`Value` is shown read-only in `DetailPanel`, the same choice already made
for `Category` and for the same reason: a control that looks editable but
isn't wired to persist an edit yet (Lesson 21 is where that's built for
real) would mislead a user into believing a change stuck when it didn't.

### Mechanical Walkthrough

- `Text="{Binding NewItemDraft.Value, ...}"` on a plain `TextBox` bound
  directly to a `decimal` property — (first appearance of **implicit
  binding conversion** to a non-`string` type) — every binding on a
  `TextBox.Text` so far has targeted a `string` property (`Name`,
  `Location`), a same-type assignment needing no conversion at all.
  `Value` is `decimal`; WPF's binding engine converts the box's typed
  text into a `decimal` automatically, using .NET's built-in type
  conversion for the property's declared type — no converter class
  written anywhere in this project.
- `StringFormat={}{0:C}` — (first appearance) — a binding-specific way to
  apply a format string (`"C"`, exactly as proven in the previous unit)
  directly inside XAML, without writing any C# formatting code; the
  leading `{}` — (first appearance) — is required specifically because
  XAML's own syntax already treats a curly brace as the start of markup
  extension syntax (like `{Binding ...}` itself) — `{}` here means
  "the next character is a literal `{`, not markup," letting
  `{0:C}` (a plain .NET composite format string, `{0}` meaning "the
  bound value" and `:C` its format) sit safely inside an XAML attribute.

### CS Lens

WPF's implicit conversion here is the same underlying idea the isolated
lab already proved by hand — a source `string`, converted into a target
type using that type's own conversion rules — except WPF performs it
automatically as part of the binding pipeline, for any common type
(`int`, `double`, `decimal`, `bool`, and more), the same way `int.Parse`
or `decimal.Parse` would if you wrote the conversion by hand.

### SE Lens

What happens if a user types letters into the new `Value` box instead of a
number? Worth proving, not trusting — build a small throwaway
`dotnet new wpf` project with a `TextBox` bound `TwoWay` to a `decimal`
property, set its text to a valid number, read the property back (it
matches), then set the text to `"not a number"` and read the property
again: it silently keeps its *previous* valid value — no crash, no
visible error, the binding conversion simply fails and the source property
is left untouched. This project doesn't handle that case defensively yet
(no red border, no error message for a bad `Value` the way `Name`'s
`ValidatesOnDataErrors` already gives real-time feedback) — a real,
honest gap, worth naming rather than hiding: `IDataErrorInfo`'s indexer
(Lesson 11) only ever validates `Name` today, and extending it to reject
a non-numeric `Value` the same way is real, future work this lesson
doesn't claim to have done.

### Connection

`InventoryItem` now carries four real facts — `Name`, `Category`,
`Location`, `Value` — and the next unit makes `Value` persist through a
full quit and reopen, the way the other three already do.

---

## Concept Unit: Persisting `decimal` in SQLite

### The Problem

`Value` exists in memory and displays correctly, but quitting the app still
loses it — SQLite needs a column for it, and `SaveItemToDatabase`/
`LoadItemsFromDatabase` need to read and write that column.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml.cs` — `EnsureDatabaseCreated`,
  `SaveItemToDatabase`, `LoadItemsFromDatabase`.
- **Change type:** Modify.
- **Dependencies:** The existing `CREATE TABLE`/`INSERT`/`SELECT`
  established across Lessons 9, 10, and 12.

### The New Code — the Table Shape

```csharp
command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Category TEXT NOT NULL, Location TEXT NOT NULL, Value TEXT NOT NULL)";
```

### The New Code — Saving

```csharp
command.CommandText = "INSERT INTO Items (Name, Category, Location, Value) VALUES (@name, @category, @location, @value)";
command.Parameters.AddWithValue("@name", item.Name);
command.Parameters.AddWithValue("@category", item.Category.ToString());
command.Parameters.AddWithValue("@location", item.Location);
command.Parameters.AddWithValue("@value", item.Value.ToString(CultureInfo.InvariantCulture));
```

### The New Code — Loading

```csharp
command.CommandText = "SELECT Id, Name, Category, Location, Value FROM Items";

using SqliteDataReader reader = command.ExecuteReader();
while (reader.Read())
{
    InventoryItem item = new InventoryItem
    {
        Id = reader.GetInt32(0),
        Name = reader.GetString(1),
        Category = Enum.Parse<Category>(reader.GetString(2)),
        Location = reader.GetString(3),
        Value = decimal.Parse(reader.GetString(4), CultureInfo.InvariantCulture)
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
            command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Category TEXT NOT NULL, Location TEXT NOT NULL, Value TEXT NOT NULL)";  // ← changed
            command.ExecuteNonQuery();
        }

        private List<InventoryItem> LoadItemsFromDatabase()
        {
            List<InventoryItem> loadedItems = new List<InventoryItem>();

            using SqliteConnection connection = new SqliteConnection(ConnectionString);
            connection.Open();
            using SqliteCommand command = connection.CreateCommand();
            command.CommandText = "SELECT Id, Name, Category, Location, Value FROM Items";  // ← changed

            using SqliteDataReader reader = command.ExecuteReader();
            while (reader.Read())
            {
                InventoryItem item = new InventoryItem
                {
                    Id = reader.GetInt32(0),
                    Name = reader.GetString(1),
                    Category = Enum.Parse<Category>(reader.GetString(2)),
                    Location = reader.GetString(3),
                    Value = decimal.Parse(reader.GetString(4), CultureInfo.InvariantCulture)  // ← new
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
            command.CommandText = "INSERT INTO Items (Name, Category, Location, Value) VALUES (@name, @category, @location, @value)";  // ← changed
            command.Parameters.AddWithValue("@name", item.Name);
            command.Parameters.AddWithValue("@category", item.Category.ToString());
            command.Parameters.AddWithValue("@location", item.Location);
            command.Parameters.AddWithValue("@value", item.Value.ToString(CultureInfo.InvariantCulture));  // ← new
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

- `Value TEXT NOT NULL` — (first appearance of storing a `decimal` in
  SQLite) — SQLite has no `decimal` column type of its own (it has
  `REAL`, a binary floating-point type — exactly the representation
  problem this lesson's first unit proved is wrong for money), so this
  project stores `Value` as exact text instead, the identical strategy
  Lesson 12 already used for `Category`.
- `item.Value.ToString(CultureInfo.InvariantCulture)` — (first appearance
  of `CultureInfo.InvariantCulture`) — a fixed, non-regional culture that
  never changes no matter what machine runs this code, used here
  specifically *instead of* `"C"` or `CurrentCulture`: this string is
  never shown to a user, it's a database value that must parse back
  identically on any machine, including one with different regional
  settings than the one that saved it — `InvariantCulture` guarantees
  `"1299.99"` (a `.` decimal separator), never `"1299,99"` (what a
  German-culture `ToString()` would produce), regardless of which
  machine's Windows settings wrote it.
- `decimal.Parse(reader.GetString(4), CultureInfo.InvariantCulture)` —
  (first appearance of `decimal.Parse`) — the reverse operation, reading
  that same fixed-format text back into a real `decimal`, with the
  matching `InvariantCulture` argument required to parse it correctly
  regardless of which machine is doing the reading.

### CS Lens

This is the identical **serialization** pattern Lesson 12 already named
for `Category` — an explicit, matching pair of conversions at a
persistence boundary — applied to a new type. The one new wrinkle,
`InvariantCulture` specifically (rather than `CurrentCulture`, used for
on-screen display), is worth naming as its own small rule: **display
formatting and storage formatting are different problems with different
correct answers**, even when the same `ToString()`-family method handles
both — display should match the viewer's own machine; storage must be
identical no matter which machine reads or writes it.

### SE Lens

What would go wrong if `SaveItemToDatabase` used `item.Value.ToString("C")`
(the display-formatted version) instead of `InvariantCulture`? The saved
text would be `"$1,299.00"` — currency symbol, comma, all — and
`decimal.Parse` on load would throw a `FormatException` immediately,
because `"$1,299.00"` isn't a plain number in .NET's default parsing
rules. This is a real, concrete illustration of the CS Lens's point:
reusing a display-formatted string as a storage format is a common,
easy-to-make mistake, caught here only because `decimal.Parse` fails
loudly rather than silently misreading it.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: type a name, pick a category, type a location,
type a numeric value (for example `49.99`), click Add — the new item
appears; selecting it shows `Value` in the detail panel formatted as real
currency (`$49.99`, on an `en-US` machine). Fully quit and reopen the
app: every item, including its value, is back exactly as entered — open
`pocketinventory.db` in a SQLite browser if you have one, and confirm the
`Value` column holds plain text like `49.99`, never a currency symbol.

### Connection

`InventoryItem` now carries four real facts, every one of them surviving a
full quit-and-reopen through the identical load/save pattern, extended
one more time without changing its shape. The next lesson, `Nullable`
value types, is what a *missing* fact — a purchase date nobody entered —
needs, which `decimal`'s always-has-a-value nature doesn't have to solve.

---

## Closing

### Connect the Pieces

A user types `49.99` into the new `Value` box — WPF's binding engine
(third unit) converts that string into `decimal 49.99m` automatically,
writing it straight into `NewItemDraft.Value`, which announces the change
via the same `INotifyPropertyChanged` shape every property here uses.
Clicking Add hands that draft to `SaveItemToDatabase`, where
`item.Value.ToString(CultureInfo.InvariantCulture)` (fifth unit) turns it
into the fixed-format text `"49.99"` for the `INSERT`. Selecting the item
in the list sets `DetailPanel.DataContext`, and `{Binding Value,
StringFormat={}{0:C}}` (fourth unit) renders that same `49.99m` as
`$49.99` — the exact currency format the first `decimal`-vs-`double` lab
in this lesson proved `double` could never guarantee stayed exact through
arithmetic in the first place.

### What Breaks Without This

Temporarily change `InventoryItem`'s `Value` field back to `double` (leave
everything else, including the SQLite `TEXT` column and the
`InvariantCulture` parse/format calls, unchanged) and rebuild. Real,
representative failure: the project still compiles and runs — `double`
and `decimal` both support arithmetic and `ToString`, so nothing catches
this at compile time — but add several items whose values would sum to a
round number by hand (for example `0.10`, `0.20`, `0.30`), and any future
lesson that sums `Value` across items (Lesson 30, `SUM()`) would inherit
silent, tiny rounding error with no warning anywhere. This is exactly why
this lesson's first unit proved the failure before writing a single line
of the real project — the bug is invisible until arithmetic happens on
real data, which is precisely when it's hardest to trace back to "the
field is the wrong type." Restore `decimal` afterward.

### Exercises

- In a throwaway console app, compute `0.1m + 0.2m + 0.3m` versus
  `0.1 + 0.2 + 0.3` (no `m` suffix) and compare the two real outputs —
  confirm which one exactly equals `0.6`.
- Change the detail panel's `Value` display to use
  `CultureInfo.GetCultureInfo("de-DE")` explicitly instead of the
  machine's own current culture, and confirm the real, different output
  this lesson's `ToString("C")` lab already predicted.
- Predict, in your own words, what `decimal.Parse("$49.99")` (the
  currency-formatted string, not the plain number) would do before
  running it in a throwaway console app — then run it and compare your
  prediction to the real exception.

### Definition of Done

- [ ] `Value` (`decimal`) exists on `InventoryItem`, following the same
      `INotifyPropertyChanged` shape as `Name`, `Category`, and
      `Location`.
- [ ] The Add row includes a working `Value` text box alongside the
      existing fields.
- [ ] `DetailPanel` shows the selected item's value formatted as real
      currency (`$1,299.00`, not a bare number).
- [ ] Adding an item, fully quitting, and reopening the app preserves its
      value, not just its name/category/location.
- [ ] You reproduced the `double` rounding-error gap on purpose (in the
      throwaway lab or by temporarily changing the real field type),
      confirmed the difference against `decimal`'s exact result, and
      restored the correct type.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add Value (decimal) with culture-aware currency formatting"`.
