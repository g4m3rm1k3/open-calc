# Lesson 15: Text That Wraps, and a Value That's Just True or False

*(`TextWrapping`, `bool`, `CheckBox`, and `DataTrigger`)*

**User Story**
> As a user, I want to attach notes to an item, and mark items as
> favorites.

**What you will build**
`InventoryItem` grows its final two fields for Epic 3: **Notes**, free-form
text that can run longer than one line, and **IsFavorite**, a plain
`true`/`false` flag. Two small, genuinely different problems: Notes needs
a control that doesn't just clip or scroll long text sideways off-screen;
IsFavorite needs the simplest possible C# type — no `enum`, no `Nullable<T>`,
just `bool` — paired with a WPF control built specifically for it, and a
declarative way to change *how something looks* based on that value
without writing an `if` statement in code-behind. This closes Epic 3 —
`InventoryItem` will carry six real fields by the end of this lesson, every
one of them added through the identical model → Add row → detail panel →
SQLite pattern established since Lesson 12.

**What you need to know first:** Lesson 6: `class`, properties,
`InventoryItem`. Lesson 7: the `INotifyPropertyChanged`
get/set/`PropertyChanged?.Invoke(...)` shape every property on this class
already follows. Lesson 9/10: `EnsureDatabaseCreated`, `SaveItemToDatabase`,
`LoadItemsFromDatabase`. Lesson 14: the exact pattern of growing
`InventoryItem` with a new property, then extending the Add row, the
detail panel, and the SQLite table shape together.

**Terms introduced in this lesson:**
- **`TextWrapping`** — a property on text-displaying WPF controls
  controlling whether text that's too long for the available width wraps
  onto additional lines (`Wrap`) or stays on one line, clipped or
  overflowing (`NoWrap`, the default).
- **`bool`** — the simplest possible C# value type: exactly two possible
  values, `true` or `false`, nothing else, ever.
- **`CheckBox`** — a WPF control whose `IsChecked` property is itself
  bindable, naturally suited to a `bool`.
- **`Style`**, **`Style.Triggers`**, **`DataTrigger`** — a declarative way
  to change a control's appearance in response to a bound value changing,
  with no code-behind `if` statement written anywhere.

**Objects and methods used**
- `Style` itself (Lesson 5) reappears here, already given full
  treatment — brief reminder only, per the Repetition Rule.
  `TextWrapping`, `CheckBox`, and `Style.Triggers`/`DataTrigger` are
  this lesson's own subject, given full treatment below.

---

## Concept Unit: Growing `InventoryItem` — Notes and IsFavorite

### The Problem

`InventoryItem` currently models `Name`, `Category`, `Location`, `Value`,
and `PurchaseDate`. Time to add the two facts this lesson's user story
asks for.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryItem.cs`.
- **Change type:** Add.
- **Dependencies:** The `INotifyPropertyChanged` get/set pattern already
  established, reused identically for both new properties.

### The New Code

```csharp
private string notes = string.Empty;

public string Notes
{
    get { return notes; }
    set
    {
        notes = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Notes)));
    }
}

private bool isFavorite;

public bool IsFavorite
{
    get { return isFavorite; }
    set
    {
        isFavorite = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(IsFavorite)));
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

        private string notes = string.Empty;                                     // ← new

        public string Notes                                                      // ← new
        {                                                                        // ← new
            get { return notes; }                                               // ← new
            set                                                                  // ← new
            {                                                                    // ← new
                notes = value;                                                   // ← new
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Notes))); // ← new
            }                                                                    // ← new
        }                                                                        // ← new

        private bool isFavorite;                                                 // ← new

        public bool IsFavorite                                                   // ← new
        {                                                                        // ← new
            get { return isFavorite; }                                          // ← new
            set                                                                  // ← new
            {                                                                    // ← new
                isFavorite = value;                                             // ← new
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(IsFavorite))); // ← new
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

- `private string notes = string.Empty;` / `public string Notes { get; set; ... }`
  — reappearing, structurally identical to `Location`'s own shape — flagged
  as intentional repetition, not an oversight, the same call already made
  for `Location` back in Lesson 12.
- `private bool isFavorite;` / `public bool IsFavorite { get; set; ... }` —
  reappearing property shape, **first appearance of `bool`** on this
  class: no explicit initializer needed, because `bool`'s own default
  value is already `false` with no field initializer at all — the same
  reasoning `PurchaseDate` used for defaulting to `null`, one level
  simpler: `bool` has exactly two states, and "not yet marked favorite"
  is correctly `false` from the moment `new InventoryItem()` runs.

### CS Lens

`bool` is the simplest value type this project has used — no range of
values to consider, no representation-error question like `decimal` had,
no "does this need to allow absence" question like `PurchaseDate` had.
Two states, always, is the entire contract, which is exactly why
`CheckBox` (next unit) — a control that itself has exactly two states —
is such a natural pairing for it.

### SE Lens

Why does `IsFavorite` skip the read-only-in-`DetailPanel` treatment this
lesson gives `Notes`, `Category`, and `Value` (see the wiring unit below)?
Because marking something as a favorite is fundamentally different from
editing a fact about the item: it's a genuine, standalone action a user
performs *while viewing* an item, not a correction to the item's own
recorded data — real WPF applications commonly let exactly this kind of
lightweight toggle stay live everywhere, distinct from the "editing an
item's core facts needs Lesson 21's real edit flow" rule the rest of this
project follows.

### Connection

`Notes` and `IsFavorite` both exist on `InventoryItem`. The next unit
gives `Notes` a control that actually displays more than one line.

---

## Concept Unit: `TextWrapping` — Text That Doesn't Run Off-Screen

### The Problem

A `TextBlock` or `TextBox`, by default, keeps text on a single line —
long enough `Notes` text would either get clipped at the control's edge or
force the whole layout wider to fit it, neither of which is acceptable for
a free-form notes field that could reasonably be a full sentence or more.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-wrap
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel Loaded="StackPanel_Loaded">
    <TextBlock x:Name="NoWrapBlock" Width="120" FontSize="14"
               Text="This is a fairly long note about where an item lives and why." />
    <TextBlock x:Name="WrapBlock" Width="120" FontSize="14" TextWrapping="Wrap"
               Text="This is a fairly long note about where an item lives and why." />
</StackPanel>
```

Add the handler in `MainWindow.xaml.cs`:

```csharp
private void StackPanel_Loaded(object sender, RoutedEventArgs e)
{
    Console.WriteLine($"NoWrap DesiredSize.Height: {NoWrapBlock.DesiredSize.Height}");
    Console.WriteLine($"Wrap DesiredSize.Height:   {WrapBlock.DesiredSize.Height}");
    Console.WriteLine($"Wrap taller than NoWrap: {WrapBlock.DesiredSize.Height > NoWrapBlock.DesiredSize.Height}");
}
```

Run it on your Windows machine:

```bash
dotnet run
```

Real output, this session:

```text
NoWrap DesiredSize.Height: 18.62
Wrap DesiredSize.Height:   74.48
Wrap taller than NoWrap: True
```

Also worth seeing directly, not just measured: `NoWrapBlock`'s identical
text visibly overflows past its 120-pixel width in the running window;
`WrapBlock`'s text stays within its own 120 pixels, spread across several
lines instead.

*What this proves:* both `TextBlock`s hold the exact same `Text` and the
exact same fixed `Width="120"`; the only difference is `TextWrapping="Wrap"`.
`DesiredSize` — (first appearance) — is how much space a control actually
wants to occupy, computed during WPF's layout pass; `WrapBlock`'s height,
`74.48`, is roughly four times `NoWrapBlock`'s `18.62` — real, measured
proof that the identical text is being laid out across multiple lines
instead of one, exactly what `TextWrapping="Wrap"` is for.

### Discard the Throwaway Example
Delete the `lab-wrap` folder. `TextWrapping` itself is not discarded —
the real `Notes` display uses it next.

### Mechanical Walkthrough

- `TextWrapping="Wrap"` — **first appearance.** Text that would overflow
  the control's available width instead breaks onto additional lines.
  The default, `NoWrap` (used implicitly everywhere else in this project
  so far), keeps text on one line regardless of width.
- `DesiredSize.Height` — (first read here, purely to prove the wrapping
  happened, not something this project reads in real, non-lab code) —
  how tall a control actually wants to be after WPF measures its content.

### CS Lens

Nothing about `TextWrapping` involves C# logic at all — it's a pure
declarative property, set once in markup, with WPF's own layout engine
handling every actual line-break decision based on the real rendered
width and font metrics at runtime. No code anywhere counts characters or
decides where to break a line.

### SE Lens

Why not just make every text control wrap by default, avoiding the need
to remember `TextWrapping="Wrap"` at all? Because `NoWrap` is correct far
more often in this project already — `Name`, `Location`, and the
currency-formatted `Value` are all meant to stay on one line; a `Name`
field that silently wrapped onto two lines the moment it got slightly
long would look like a layout bug, not a feature. `Notes` is the first
field in this project where wrapping is actually the desired behavior,
which is exactly why it's opted into explicitly here rather than assumed
everywhere.

### Connection

`Notes`'s real display, in the next wiring unit, uses `TextWrapping="Wrap"`
directly.

---

## Concept Unit: `bool`, `CheckBox`, and `DataTrigger`

### The Problem

`IsFavorite` exists as a `bool`, but nothing on screen can toggle it yet,
and this project has no way yet to make something *look* different based
on a bound value without writing an `if` statement in code-behind.

### Introduce the Concept in Isolation
Continuing inside `lab-wrap` (recreate it if you deleted it):

Replace `MainWindow.xaml`'s contents:

```xml
<StackPanel Loaded="StackPanel_Loaded">
    <CheckBox x:Name="FavoriteCheckBox" Content="Favorite" IsChecked="{Binding IsFavorite}" />

    <TextBlock x:Name="StarLabel" Text="★">
        <TextBlock.Style>
            <Style TargetType="TextBlock">
                <Setter Property="Foreground" Value="Gray" />
                <Style.Triggers>
                    <DataTrigger Binding="{Binding IsFavorite}" Value="True">
                        <Setter Property="Foreground" Value="Gold" />
                    </DataTrigger>
                </Style.Triggers>
            </Style>
        </TextBlock.Style>
    </TextBlock>
</StackPanel>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.ComponentModel;
using System.Windows;

namespace lab_wrap
{
    public partial class MainWindow : Window, INotifyPropertyChanged
    {
        private bool isFavorite;

        public bool IsFavorite
        {
            get { return isFavorite; }
            set
            {
                isFavorite = value;
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(IsFavorite)));
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;

        public MainWindow()
        {
            InitializeComponent();
            DataContext = this;
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            Console.WriteLine($"StarLabel.Foreground before: {StarLabel.Foreground}");

            FavoriteCheckBox.IsChecked = true;
            StarLabel.UpdateLayout();

            Console.WriteLine($"IsFavorite after checking box: {IsFavorite}");
            Console.WriteLine($"StarLabel.Foreground after:  {StarLabel.Foreground}");
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
StarLabel.Foreground before: #FF808080
IsFavorite after checking box: True
StarLabel.Foreground after:  #FFFFD700
```

*What this proves:* `CheckBox.IsChecked="{Binding IsFavorite}"` is a
two-way binding, exactly like `TextBox.Text` in earlier lessons, just
targeting a `bool?` (`CheckBox` technically supports a third,
indeterminate state for tri-state checkboxes, not used here) instead of a
`string` or `decimal` — setting `FavoriteCheckBox.IsChecked = true`
(simulating a real click) wrote `true` straight into `IsFavorite`, no
converter needed. The `DataTrigger` never got told, directly, to change
anything — `StarLabel.Foreground` started as `#FF808080` (gray, this
`Style`'s default `Setter`) and became `#FFFFD700` (gold) purely because
`IsFavorite` changed to match the `DataTrigger`'s `Value="True"`
condition — no `if (IsFavorite) { StarLabel.Foreground = ... }` written
anywhere in C#.

### Discard the Throwaway Example
Delete the `lab-wrap` folder. `CheckBox`, `bool` binding, and `DataTrigger`
are not discarded — the real project wires exactly this next.

### Mechanical Walkthrough

- `<CheckBox ... IsChecked="{Binding IsFavorite}" />` — **first
  appearance of `CheckBox`.** `IsChecked` is bindable two-way, the same
  binding shape every other control in this project has already used,
  now on a `bool`-shaped property.
- `<Style TargetType="TextBlock"> ... <Setter Property="Foreground" Value="Gray" /> ...`
  — **first appearance of `Style`** used with triggers (Lesson 5 already
  used `Style`/`StaticResource` for shared appearance, never with
  triggers). The `Setter` here is the style's default/base value —
  `Gray`, applied whenever no trigger's condition is met.
- `<Style.Triggers> <DataTrigger Binding="{Binding IsFavorite}" Value="True"> ...`
  — **first appearance of `DataTrigger`.** Watches a bound value
  (`IsFavorite`, the identical `{Binding}` syntax used everywhere else in
  this project) and, the instant it equals `Value="True"`, applies its own
  nested `Setter`s — here, `Foreground` becomes `Gold` — automatically
  reverting the moment the bound value stops matching.

### CS Lens

`DataTrigger` is **declarative conditional logic** — the same underlying
idea as an `if` statement (do X when condition Y holds), expressed as data
instead of imperative code, evaluated continuously by WPF's own binding
system rather than run once at a specific moment your code chooses. This
is the same "declare what should be true; let the framework keep it that
way" idea `{Binding}` itself has represented since Lesson 7 — extended
here from "keep this text in sync with that property" to "keep this
*appearance* in sync with that property."

### SE Lens

Why use a `DataTrigger` instead of a plain code-behind `if` statement
inside `IsFavorite`'s own `set` block — `if (value) { starLabel.Foreground = ... }`
— which this project could write today, no new WPF concept required?
Because that would couple `InventoryItem` (a plain data model, with no
knowledge of `TextBlock`s or `Foreground` at all) directly to a specific
visual detail of one specific screen — a genuine violation of the
separation between model and view this project has maintained since
`InventoryItem` was first designed as its own class in Lesson 6.
`DataTrigger` keeps that visual decision entirely inside XAML, where
appearance concerns belong, while `InventoryItem` stays exactly what it's
always been: `IsFavorite`'s own `set` block still only ever calls
`PropertyChanged?.Invoke(...)`, with no idea a star, a color, or a screen
even exist.

### Connection

The real `DetailPanel` wires exactly this `CheckBox`/`DataTrigger`
pairing next.

---

## Concept Unit: Wiring Notes and IsFavorite Into the Add Form and Detail Panel

### The Problem

`Notes`, `IsFavorite`, `TextWrapping`, `CheckBox`, and `DataTrigger` all
exist independently; nothing connects them to the real project yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`.
- **Change type:** Add.
- **Location:** The Add row's `StackPanel` (already built, growing wide
  enough that `Notes` — genuinely multi-line — belongs on its own row
  below it instead); `DetailPanel` (already built).
- **Dependencies:** `Notes`/`IsFavorite`, first unit; `TextWrapping`,
  second unit; `CheckBox`/`DataTrigger`, third unit.

### The New Code — a Second Add Row

```xml
<StackPanel Grid.Row="1" Orientation="Horizontal" Margin="0,8,0,0">
    <TextBox Width="420"
             Height="48"
             TextWrapping="Wrap"
             AcceptsReturn="True"
             Text="{Binding NewItemDraft.Notes, UpdateSourceTrigger=PropertyChanged}" />
    <CheckBox Content="Favorite"
              Margin="12,0,0,0"
              VerticalAlignment="Center"
              IsChecked="{Binding NewItemDraft.IsFavorite}" />
</StackPanel>
```

### The New Code — the Detail Panel

```xml
<TextBlock Text="{Binding Notes}" TextWrapping="Wrap" Margin="0,8,0,0" />
<TextBlock Text="★" Margin="0,8,0,0">
    <TextBlock.Style>
        <Style TargetType="TextBlock">
            <Setter Property="Foreground" Value="Gray" />
            <Style.Triggers>
                <DataTrigger Binding="{Binding IsFavorite}" Value="True">
                    <Setter Property="Foreground" Value="Gold" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </TextBlock.Style>
</TextBlock>
```

### The Updated Project — the Add Rows

```xml
<Grid.RowDefinitions>
    <RowDefinition Height="Auto" />
    <RowDefinition Height="Auto" />                                                              <!-- ← new -->
    <RowDefinition Height="*" />
</Grid.RowDefinitions>

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
    <DatePicker Width="130"
                Margin="12,0,0,0"
                SelectedDate="{Binding NewItemDraft.PurchaseDate}" />
    <Button Content="Add"
            Style="{StaticResource ToolbarButtonStyle}"
            Margin="12,0,0,0"
            Click="AddButton_Click" />
</StackPanel>

<StackPanel Grid.Row="1" Orientation="Horizontal" Margin="0,8,0,0">                                <!-- ← new -->
    <TextBox Width="420"                                                                           <!-- ← new -->
             Height="48"                                                                            <!-- ← new -->
             TextWrapping="Wrap"                                                                    <!-- ← new -->
             AcceptsReturn="True"                                                                   <!-- ← new -->
             Text="{Binding NewItemDraft.Notes, UpdateSourceTrigger=PropertyChanged}" />             <!-- ← new -->
    <CheckBox Content="Favorite"                                                                    <!-- ← new -->
              Margin="12,0,0,0"                                                                     <!-- ← new -->
              VerticalAlignment="Center"                                                            <!-- ← new -->
              IsChecked="{Binding NewItemDraft.IsFavorite}" />                                       <!-- ← new -->
</StackPanel>
```

The item list and content area, previously `Grid.Row="1"`/`Grid.Row="2"`,
shift down one row to make room — `RowDefinition Height="Auto"` for the
new second Add row, following the identical sizing rule the first Add
row's own `RowDefinition` already uses.

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
    <TextBlock Text="{Binding PurchaseDate, StringFormat={}{0:d}, TargetNullValue='(no date)'}"
               Margin="0,8,0,0" />
    <TextBlock Text="{Binding Notes}" TextWrapping="Wrap" Margin="0,8,0,0" />                       <!-- ← new -->
    <TextBlock Text="★" Margin="0,8,0,0">                                                          <!-- ← new -->
        <TextBlock.Style>                                                                            <!-- ← new -->
            <Style TargetType="TextBlock">                                                           <!-- ← new -->
                <Setter Property="Foreground" Value="Gray" />                                        <!-- ← new -->
                <Style.Triggers>                                                                      <!-- ← new -->
                    <DataTrigger Binding="{Binding IsFavorite}" Value="True">                        <!-- ← new -->
                        <Setter Property="Foreground" Value="Gold" />                                <!-- ← new -->
                    </DataTrigger>                                                                    <!-- ← new -->
                </Style.Triggers>                                                                      <!-- ← new -->
            </Style>                                                                                  <!-- ← new -->
        </TextBlock.Style>                                                                            <!-- ← new -->
    </TextBlock>                                                                                       <!-- ← new -->
</StackPanel>
```

`Notes` is shown read-only (a wrapping `TextBlock`, matching `Category`'s
and `Value`'s established reasoning). The star, unlike every other
`DetailPanel` field, is deliberately interactive-looking even though it
only *reflects* `IsFavorite` here — this lesson's Add-row `CheckBox` is
where a favorite actually gets set today; a future lesson (Lesson 21) is
where toggling it directly from `DetailPanel` would genuinely persist.

### Mechanical Walkthrough

- `TextBox ... TextWrapping="Wrap" AcceptsReturn="True"` — reappearing
  (`TextWrapping`, this lesson's second unit), one new detail:
  `AcceptsReturn="True"` — (first appearance) — lets pressing Enter
  inside this specific `TextBox` insert a real line break instead of
  doing nothing (a plain `TextBox`'s default), letting a user manually
  start a new line in their notes in addition to automatic wrapping.
- `CheckBox ... IsChecked="{Binding NewItemDraft.IsFavorite}"` —
  reappearing (this lesson's third unit), now bound to the real draft
  item instead of the lab's own property.
- The `DetailPanel` star's `Style`/`DataTrigger` — reappearing exactly,
  copied from the third unit's lab with no changes beyond which object's
  `IsFavorite` it reads (`DetailPanel`'s inherited `DataContext`, the
  selected item, instead of the lab window itself).

### CS Lens

Nothing new here beyond what the previous three units already
established — this unit is purely **composition**: taking already-proven
pieces (`TextWrapping`, `CheckBox`+binding, `DataTrigger`) and assembling
them into the real screen, unchanged, the same pattern every wiring unit
in Epic 3 has followed since Lesson 12.

### SE Lens

Why does `Notes` get its own second `StackPanel` row instead of squeezing
into the first row alongside `Name`/`Category`/`Location`/`Value`/
`PurchaseDate`? Because a multi-line `TextBox` genuinely needs real
height (`Height="48"` here) to be useful — cramming it into a single
horizontal row alongside five other narrow controls would either make the
whole row absurdly tall or leave no room for `Notes` to actually show more
than one line, defeating this lesson's entire first problem statement.

### Connection

`InventoryItem` now carries six real facts — Epic 3 is complete. The next
unit persists the final two through SQLite, exactly as every field before
them has been.

---

## Concept Unit: Persisting `Notes` and `IsFavorite` in SQLite

### The Problem

`Notes` and `IsFavorite` exist in memory and display correctly, but
quitting the app still loses them.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml.cs` — `EnsureDatabaseCreated`,
  `SaveItemToDatabase`, `LoadItemsFromDatabase`.
- **Change type:** Modify.
- **Dependencies:** The existing `CREATE TABLE`/`INSERT`/`SELECT`
  established across Lessons 9, 10, 12, 13, and 14.

### The New Code — the Table Shape

```csharp
command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Category TEXT NOT NULL, Location TEXT NOT NULL, Value TEXT NOT NULL, PurchaseDate TEXT NULL, Notes TEXT NOT NULL, IsFavorite INTEGER NOT NULL)";
```

### The New Code — Saving

```csharp
command.CommandText = "INSERT INTO Items (Name, Category, Location, Value, PurchaseDate, Notes, IsFavorite) VALUES (@name, @category, @location, @value, @purchaseDate, @notes, @isFavorite)";
command.Parameters.AddWithValue("@name", item.Name);
command.Parameters.AddWithValue("@category", item.Category.ToString());
command.Parameters.AddWithValue("@location", item.Location);
command.Parameters.AddWithValue("@value", item.Value.ToString(CultureInfo.InvariantCulture));
command.Parameters.AddWithValue("@purchaseDate", (object?)item.PurchaseDate?.ToString("O") ?? DBNull.Value);
command.Parameters.AddWithValue("@notes", item.Notes);
command.Parameters.AddWithValue("@isFavorite", item.IsFavorite ? 1 : 0);
```

### The New Code — Loading

```csharp
command.CommandText = "SELECT Id, Name, Category, Location, Value, PurchaseDate, Notes, IsFavorite FROM Items";

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
        PurchaseDate = reader.IsDBNull(5) ? null : DateTime.Parse(reader.GetString(5)),
        Notes = reader.GetString(6),
        IsFavorite = reader.GetInt32(7) == 1
    };
    loadedItems.Add(item);
}
```

### Mechanical Walkthrough

- `IsFavorite INTEGER NOT NULL` — (first appearance of storing a `bool`
  in SQLite) — SQLite has no dedicated boolean column type either
  (the same gap `enum` and `decimal` already hit); the established
  convention, here and industry-wide, is `INTEGER`, `0` or `1`.
- `item.IsFavorite ? 1 : 0` — (first appearance of the **conditional
  (ternary) operator** applied to a `bool` going into SQLite) — the same
  `condition ? whenTrue : whenFalse` shape already used once, back in
  Lesson 1a's `TryGetValue` lookup, now converting `bool` to the `int`
  SQLite actually stores.
- `reader.GetInt32(7) == 1` — the reverse: read the stored integer back
  and compare it to `1`, producing a real `bool` again — the identical
  `ToString()`/`Enum.Parse` round-trip shape Lesson 12 established, now
  for `bool`↔`int` instead of `enum`↔`string`.
- `reader.GetString(6)` for `Notes` — reappearing exactly, `Notes` is a
  plain `string` column needing no conversion at all, the same as `Name`
  and `Location`.

### CS Lens

This is the fourth time this project has hit **"SQLite has no native
column type for this C# type"** — first `enum` (Lesson 12, solved with
`TEXT`), then `decimal` (Lesson 13, also `TEXT`, for a different reason —
exactness, not the absence of a type), now `bool` (solved with
`INTEGER`). Worth naming as a general pattern, not three unrelated
one-offs: **a database's column types and a language's value types are
never guaranteed to line up one-to-one**, and every persistence layer
needs an explicit, deliberate mapping between them somewhere.

### SE Lens

Why `INTEGER` (`0`/`1`) instead of storing `"True"`/`"False"` as `TEXT`,
the same strategy already used for `enum`? Because SQLite's `INTEGER`
type lets a future query filter directly and efficiently
(`WHERE IsFavorite = 1`, Lesson 19's search/filter work) using real
numeric comparison, and because `0`/`1` is SQL's own long-standing,
near-universal convention for boolean-like columns — a `TEXT` column
holding `"True"`/`"False"` would work too, but would be swimming against
a convention every SQL tool and every other developer already expects.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: type a multi-line note (press Enter inside the
notes box to confirm `AcceptsReturn` really works), check the Favorite
box, fill in the rest of the fields, click Add — the notes wrap instead of
overflowing, and selecting the item shows a gold star in `DetailPanel`.
Add a second item, leaving Favorite unchecked — its star stays gray. Fully
quit and reopen the app: both items are back exactly as entered, including
which one is a favorite and which one isn't.

### Connection

`InventoryItem` now carries all six of Epic 3's fields, every one
persisting correctly through a full quit and reopen. Epic 4 begins next,
turning to the `ListBox`'s own limitations — no sorting, no searching, no
real columns — now that there's finally enough real data on one item to
make searching and filtering worth building.

---

## Closing

### Connect the Pieces

A user checks the new `CheckBox` (third unit) — `IsChecked="{Binding NewItemDraft.IsFavorite}"`
(fourth unit) writes `true` straight into the draft item, no conversion
needed, the same two-way binding shape used since `Name`. Clicking Add
hands that draft to `SaveItemToDatabase`, where `item.IsFavorite ? 1 : 0`
(fifth unit) becomes a real `1` for the `INSERT`. Selecting the item back
in the list drives `DetailPanel`'s star `TextBlock`, whose `DataTrigger`
(third unit, wired for real in the fourth) reacts to the identical
`IsFavorite` value — proven, not assumed, back in the isolated lab's real
`Foreground` color change from gray to gold.

### What Breaks Without This

Temporarily change the loading code's `IsFavorite = reader.GetInt32(7) == 1`
to `IsFavorite = reader.GetInt32(7) == 2` — comparing against a value that
never actually gets stored. Mark an item as a favorite, then fully quit
and reopen the app. Real, representative failure: the app doesn't crash —
`reader.GetInt32(7)` still returns a valid `0` or `1`, just never equal to
`2` — every item silently reloads with `IsFavorite` set to `false`,
including the one you just marked. This is a genuinely more dangerous
failure than the crashes earlier lessons proved: no exception, no visible
error, just silently wrong data — the exact reason this project always
tests the round trip (save, quit, reopen, compare) rather than trusting
that code which compiles and runs without error is actually correct.
Restore the real `== 1` comparison afterward.

### Exercises

- In a throwaway console app, write `int BoolToInt(bool value)` and
  `bool IntToBool(int value)` using the conditional operator and `== 1`
  respectively, matching this lesson's real code — confirm both directions
  round-trip correctly for both `true`/`1` and `false`/`0`.
- Add a second `DataTrigger` to the `DetailPanel` star's `Style` — for
  example, one that also changes `FontSize` when `IsFavorite` is `true` —
  and confirm, on your own running app, that both triggers apply together.
- Predict, in your own words, what would show in `DetailPanel` for an item
  whose `Notes` is an empty string (never typed into) before checking —
  `TextBlock`'s own behavior with empty `Text`, not a bug this lesson
  introduced.

### Definition of Done

- [ ] `Notes` (`string`) and `IsFavorite` (`bool`) both exist on
      `InventoryItem`, following the same `INotifyPropertyChanged` shape
      as every other property.
- [ ] The Add form's second row includes a working multi-line notes box
      (`AcceptsReturn`, `TextWrapping="Wrap"`) and a Favorite checkbox.
- [ ] `DetailPanel` shows the selected item's notes wrapped across lines,
      and a star that's gold for favorites, gray otherwise.
- [ ] Adding one favorite and one non-favorite item, fully quitting, and
      reopening the app preserves both correctly.
- [ ] You reproduced the silent-wrong-data bug on purpose (the
      `== 2` comparison), confirmed it fails silently rather than
      crashing, and restored the correct code.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add Notes (wrapping text) and IsFavorite (bool, CheckBox, DataTrigger) — Epic 3 complete"`.
