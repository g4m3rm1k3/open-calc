# Lesson 16: A Table Built From What Already Exists

*(`DataGrid`, `DataGridTextColumn`, auto-generated vs. explicit columns)*

**User Story**
> As a user, I want my inventory displayed in a professional, sortable
> table instead of a plain list of names.

**What you will build**
Epic 3 finished with six real fields on every item, but `ItemListBox`
(Lesson 6) still shows only `Name` — every other field lives in
`DetailPanel`, one item at a time. This lesson replaces that plain
`ListBox` with a real `DataGrid`, showing several fields per row at once,
without changing `InventoryItem`, `Items`, or a single line of SQLite
code. This is Epic 4's opening move, and its whole point: **swap the
control, not the data.**

**What you need to know first:** Lesson 6/7: `ObservableCollection<T>`,
`{Binding Items}`, `DisplayMemberPath`. Lesson 8: `SelectionChanged`,
`SelectedItem`, `DetailPanel.DataContext`. Lesson 12–15: `Category`,
`Value`, `PurchaseDate` and their `StringFormat`/`TargetNullValue`
display patterns, already proven in `DetailPanel`.

**Terms introduced in this lesson:**
- **`DataGrid`** — a WPF control for displaying a bound collection as a
  real table: rows, columns, sortable headers, resizable widths, built
  in.
- **`AutoGenerateColumns`** — a `DataGrid` property; when `true` (the
  default), it inspects the bound item type's public properties via
  reflection and builds one column per property automatically.
- **`DataGridTextColumn`** — an explicitly declared column, naming its own
  header text and its own `{Binding}` path, used instead of relying on
  auto-generation.
- **`IsReadOnly`** (on `DataGrid`) — controls whether a user can
  double-click a cell and edit it directly; `false` by default, unlike
  `ListBox`, which has no concept of editable cells at all.

**Objects and methods used**
- `ObservableCollection<T>`/`{Binding}` (Lesson 7) reappear here,
  already given full treatment — brief reminder only, per the
  Repetition Rule. `DataGrid` and its columns are this lesson's own
  subject, given full treatment below.

---

## Concept Unit: `DataGrid` — Auto-Generated vs. Explicit Columns

### The Problem

`ItemListBox` only ever shows `Name`. A `DataGrid` bound to the same
`ObservableCollection<InventoryItem>` could show every field at once — but
first, worth knowing precisely: where do a `DataGrid`'s columns actually
come from, and who controls what they look like?

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-datagrid
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel Loaded="StackPanel_Loaded">
    <DataGrid x:Name="AutoGrid" AutoGenerateColumns="True" ItemsSource="{Binding Cats}" />
    <DataGrid x:Name="ExplicitGrid" AutoGenerateColumns="False" ItemsSource="{Binding Cats}">
        <DataGrid.Columns>
            <DataGridTextColumn Header="Cat Name" Binding="{Binding Name}" />
        </DataGrid.Columns>
    </DataGrid>
</StackPanel>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Collections.ObjectModel;
using System.Windows;

namespace lab_datagrid
{
    public class Cat
    {
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
    }

    public partial class MainWindow : Window
    {
        public ObservableCollection<Cat> Cats { get; } = new ObservableCollection<Cat>
        {
            new Cat { Name = "Whiskers", Age = 3 },
            new Cat { Name = "Mittens", Age = 5 }
        };

        public MainWindow()
        {
            InitializeComponent();
            DataContext = this;
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            Console.WriteLine($"AutoGrid column count: {AutoGrid.Columns.Count}");
            foreach (var column in AutoGrid.Columns)
            {
                Console.WriteLine($"  AutoGrid column header: {column.Header}");
            }

            Console.WriteLine($"ExplicitGrid column count: {ExplicitGrid.Columns.Count}");
            foreach (var column in ExplicitGrid.Columns)
            {
                Console.WriteLine($"  ExplicitGrid column header: {column.Header}");
            }
        }
    }
}
```

Run it on your Windows machine:

```bash
dotnet run
```

Real output:

```text
AutoGrid column count: 2
  AutoGrid column header: Name
  AutoGrid column header: Age
ExplicitGrid column count: 1
  ExplicitGrid column header: Cat Name
```

#### Execution Trace

Two independent `foreach` loops, each walking a different `DataGrid`'s
own `Columns` collection:

1. `AutoGrid.Columns.Count` prints `2` — reflection already ran during
   layout, before this line, building one column per `Cat` property.
2. The first `foreach` visits `AutoGrid.Columns` in the same order
   `Cat`'s properties are declared — `Name` first, printing
   `"AutoGrid column header: Name"`.
3. The loop advances to the second and last column, `Age`, printing
   `"AutoGrid column header: Age"`, then stops — two properties, two
   columns, nothing more to visit.
4. `ExplicitGrid.Columns.Count` prints `1` — exactly the one
   `<DataGridTextColumn>` this lab's XAML declared, regardless of how
   many properties `Cat` actually has.
5. The second `foreach` visits `ExplicitGrid.Columns`' single entry,
   printing `"ExplicitGrid column header: Cat Name"` — the custom
   `Header` text from XAML, not the property name `"Name"` reflection
   would have used.

Also worth seeing directly: `AutoGrid` really does show two real,
sortable, resizable columns, `Name` and `Age`, without a single
`<DataGridTextColumn>` written anywhere for it.

*What this proves:* `AutoGenerateColumns="True"` (the default) inspects
`Cat`'s public properties via reflection — the same mechanism Lesson 6's
backing-field proof already used — and builds one column per property,
named after the property itself; `AutoGrid` never named `Name` or `Age`
anywhere in XAML, and got both columns anyway. `ExplicitGrid`, with
`AutoGenerateColumns="False"`, shows exactly the one column this lesson's
XAML actually declared — `Cat.Age` exists on the bound type but never
appears, because nothing asked for it — and that one column's header text,
`"Cat Name"`, is something reflection could never have produced on its
own (it would have shown the raw property name, `"Name"`).

### Discard the Throwaway Example
Delete the `lab-datagrid` folder. `DataGrid` and `DataGridTextColumn` are
not discarded — the real project's item list uses exactly this next.

### Mechanical Walkthrough

- `<DataGrid x:Name="AutoGrid" AutoGenerateColumns="True" .../>` —
  **first appearance of `DataGrid`.** `AutoGenerateColumns="True"` is
  actually `DataGrid`'s own default — writing it explicitly here only for
  contrast with the next line.
- `AutoGrid.Columns.Count` / `.Header` — read directly, purely to prove
  reflection genuinely built these columns, not something this project
  reads in real, non-lab code.
- `<DataGrid x:Name="ExplicitGrid" AutoGenerateColumns="False">` —
  **first appearance of explicit columns.** Turning generation off makes
  `<DataGrid.Columns>` — otherwise ignored — the only source of columns.
- `<DataGridTextColumn Header="Cat Name" Binding="{Binding Name}" />` —
  **first appearance of `DataGridTextColumn`.** `Header` is the column's
  own display text, entirely independent of the bound property's real
  name; `Binding` is the familiar `{Binding}` syntax, here scoped to one
  column instead of one whole control.

### CS Lens

`AutoGenerateColumns="True"` is **reflection-driven UI generation** — the
same underlying mechanism (inspecting a type's own members at runtime)
Lesson 6's `System.Reflection` proof used directly in C#, here built into
a WPF control so thoroughly that no `System.Reflection` code is ever
written by hand. Explicit columns trade that automatic convenience for
direct control — the same **convention vs. configuration** tradeoff
`AutoGenerateColumns`'s own name suggests.

### SE Lens

Why does this project choose explicit columns over the auto-generated
default, given `AutoGrid` already worked with zero extra code? Because
auto-generation shows *every* public property, in declaration order, with
raw property names as headers — `InventoryItem` would show `Id` (an
internal database key, meaningless to a user) alongside six real fields,
with headers like `"PurchaseDate"` instead of something readable. Explicit
columns are more to type, once, in exchange for choosing exactly which
fields appear, in what order, under what label — control this project's
actual users need and auto-generation has no way to express.

### Connection

The real `ItemsGrid` — replacing `ItemListBox` — uses explicit
`DataGridTextColumn`s next.

---

## Concept Unit: Replacing `ItemListBox` With a Real `DataGrid`

### The Problem

`ItemListBox` only shows `Name`; `DetailPanel` requires selecting one item
first to see anything else. A `DataGrid` can show `Name`, `Category`,
`Location`, `Value`, and `PurchaseDate` for every item, all at once, with
no selection required.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryPage.xaml.cs`.
- **Change type:** Replace.
- **Location:** The content `Grid`'s `Grid.Column="0"`, currently holding
  `ItemListBox`.
- **Dependencies:** `DataGrid`/`DataGridTextColumn`, previous unit; the
  `StringFormat`/`TargetNullValue` display patterns already proven in
  `DetailPanel` (Lessons 13, 14).

### The New Code

```xml
<DataGrid x:Name="ItemsGrid"
          Grid.Column="0"
          AutoGenerateColumns="False"
          IsReadOnly="True"
          ItemsSource="{Binding Items}"
          SelectionChanged="ItemsGrid_SelectionChanged">
    <DataGrid.Columns>
        <DataGridTextColumn Header="Name" Binding="{Binding Name}" />
        <DataGridTextColumn Header="Category" Binding="{Binding Category}" />
        <DataGridTextColumn Header="Location" Binding="{Binding Location}" />
        <DataGridTextColumn Header="Value" Binding="{Binding Value, StringFormat={}{0:C}}" />
        <DataGridTextColumn Header="Purchased" Binding="{Binding PurchaseDate, StringFormat={}{0:d}, TargetNullValue='(no date)'}" />
    </DataGrid.Columns>
</DataGrid>
```

### The Updated Project

```xml
<Grid Grid.Row="2" Margin="0,16,0,0">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="240" />
    </Grid.ColumnDefinitions>

    <DataGrid x:Name="ItemsGrid"                                                                  <!-- ← changed (was ListBox x:Name="ItemListBox") -->
              Grid.Column="0"
              AutoGenerateColumns="False"                                                          <!-- ← new -->
              IsReadOnly="True"                                                                     <!-- ← new -->
              ItemsSource="{Binding Items}"
              SelectionChanged="ItemsGrid_SelectionChanged">                                        <!-- ← changed -->
        <DataGrid.Columns>                                                                          <!-- ← new -->
            <DataGridTextColumn Header="Name" Binding="{Binding Name}" />                           <!-- ← new -->
            <DataGridTextColumn Header="Category" Binding="{Binding Category}" />                   <!-- ← new -->
            <DataGridTextColumn Header="Location" Binding="{Binding Location}" />                   <!-- ← new -->
            <DataGridTextColumn Header="Value" Binding="{Binding Value, StringFormat={}{0:C}}" />   <!-- ← new -->
            <DataGridTextColumn Header="Purchased" Binding="{Binding PurchaseDate, StringFormat={}{0:d}, TargetNullValue='(no date)'}" /> <!-- ← new -->
        </DataGrid.Columns>                                                                          <!-- ← new -->
    </DataGrid>

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
    </StackPanel>
</Grid>
```

`DetailPanel` itself is unchanged — every one of its bindings already
resolves against "whichever item is selected," and that mechanism doesn't
care whether the control that set it was a `ListBox` or a `DataGrid`.

### The New Code — the Selection Handler

```csharp
private void ItemsGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
{
    DetailPanel.DataContext = ItemsGrid.SelectedItem;
}
```

### The Updated Project — the Code-Behind Change

```csharp
private void ItemsGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)   // ← changed (was ItemListBox_SelectionChanged)
{
    DetailPanel.DataContext = ItemsGrid.SelectedItem;                                  // ← changed (was ItemListBox.SelectedItem)
}
```

### Mechanical Walkthrough

- `AutoGenerateColumns="False"` — reappearing (this lesson's first
  unit), chosen for the exact reason already named there: control over
  which fields appear and what their headers say.
- `IsReadOnly="True"` — **first appearance in real project code.**
  `DataGrid` cells are editable by default (double-click to type directly
  into a cell) — a real behavioral difference from `ListBox`, which has
  no concept of an editable cell at all. Left at its default here, a user
  could double-click `Name` in the grid and type a change that updates
  the in-memory `InventoryItem` (the same object `DetailPanel` is bound
  to) but never reaches `SaveItemToDatabase` — exactly the
  looks-editable-but-doesn't-persist trap this project has avoided since
  Lesson 12's `Category` decision. `IsReadOnly="True"` closes it directly
  for the whole grid.
- Five `<DataGridTextColumn>`s, each `Binding` identical to the matching
  `DetailPanel` binding already proven — reappearing exactly, including
  `Value`'s `StringFormat={}{0:C}` and `PurchaseDate`'s
  `TargetNullValue='(no date)'`, both real, tested behavior from Lessons
  13 and 14, now reused in a second location with zero new proof needed.
- `ItemsGrid_SelectionChanged` / `ItemsGrid.SelectedItem` — reappearing
  exactly (Lesson 8's `SelectionChanged`/`SelectedItem` pattern), renamed
  to match the control, otherwise unchanged — `DataGrid.SelectedItem` is
  the identical shape `ListBox.SelectedItem` already was, both ultimately
  implementing the same underlying selection contract WPF's selectable
  controls share.

### CS Lens

This unit is direct proof of the SE principle named in this project's own
roadmap: **swapping a control without touching the underlying data** —
`InventoryItem`, `Items`, `SaveItemToDatabase`, `LoadItemsFromDatabase`,
every binding path string — none of it changed. Only the control
generating the visual rows, and the two identifiers naming it, did. This
is Lesson 7's Observer-pattern payoff, one control substitution later:
the view was never tightly coupled to being a `ListBox` in the first
place.

### SE Lens

Why rename `ItemListBox` to `ItemsGrid` at all, instead of keeping the old
name on the new control to minimize the diff? Because a name that no
longer describes what it names is a real, ongoing cost to every future
reader — `ItemListBox` referring to a `DataGrid` would be actively
misleading the first time anyone searched the codebase for "the list box"
or "the grid" and got the wrong file, or the right file under the wrong
mental model. A rename costs one clean, one-time change (this unit);
keeping a stale name costs a small confusion, repeatedly, forever.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: the item area now shows a real, sortable table —
`Name`, `Category`, `Location`, `Value`, `Purchased` — for every item at
once, no selection required. Click a column header; the grid re-sorts
by that column (built-in `DataGrid` behavior, no code written for it —
Lesson 18 gives this same behavior a name and deliberate control).
Double-click any cell — nothing happens, confirming `IsReadOnly="True"` is
really in effect. Selecting a row still populates `DetailPanel` exactly as
before.

### Connection

`InventoryItem`'s six fields are now visible at a glance, across every
item, not just the selected one. The next unit gives this same data a
second, different view — grouped by category — without duplicating it
anywhere.

---

## Closing

### Connect the Pieces

`Items`, the same `ObservableCollection<InventoryItem>` `AddButton_Click`
has populated since Lesson 7, is now read by `ItemsGrid.ItemsSource`
instead of `ItemListBox.ItemsSource` — the collection itself never knew
or cared which control was watching it. Each `DataGridTextColumn`'s
`Binding` resolves per row exactly the way `DetailPanel`'s bindings
already resolve per selection, reusing the identical `StringFormat`/
`TargetNullValue` proof from Lessons 13 and 14 with no new behavior to
verify. Selecting a row fires `ItemsGrid_SelectionChanged`, structurally
identical to Lesson 8's original handler, which still just points
`DetailPanel.DataContext` at whatever's selected — the rename is the only
real change contact point between the old control and the new one.

### What Breaks Without This

Temporarily remove `IsReadOnly="True"` from `ItemsGrid` and rerun. Double
click the `Name` cell of any row and type a different value, then press
Enter (committing the edit) without touching the Add form at all. Real,
representative failure: the grid genuinely shows the new name — the
in-memory `InventoryItem` really changed, because `DataGridTextColumn`'s
binding is two-way by default, the same as every other binding in this
project — but fully quit and reopen the app: the old name is back,
because nothing about this edit ever called `SaveItemToDatabase`. This is
a real, silent data-loss trap, not a hypothetical one — exactly why this
unit turns `IsReadOnly` on deliberately rather than leaving the default in
place. Restore `IsReadOnly="True"` afterward.

### Exercises

- In the `lab-datagrid` throwaway pattern, add a third `Cat` field (for
  example `bool IsIndoor`) and rerun `AutoGrid` — confirm, with real
  output, that the auto-generated column count grows to match, with no
  XAML changes to `AutoGrid` itself.
- Click every column header in the real, running app and confirm the grid
  re-sorts — then predict, in your own words, what happens if you click
  the same header twice in a row, before trying it.
- Add a sixth `DataGridTextColumn` for `Notes` to the real project,
  bound the same way `DetailPanel`'s `Notes` `TextBlock` already is —
  confirm long notes either wrap or get clipped, and compare that
  behavior to `TextWrapping`'s effect from Lesson 15.

### Definition of Done

- [ ] `ItemListBox` is fully replaced by `ItemsGrid`, a `DataGrid` with
      explicit `AutoGenerateColumns="False"` columns for `Name`,
      `Category`, `Location`, `Value`, and `Purchased`.
- [ ] `ItemsGrid.IsReadOnly` is `True` — double-clicking a cell does not
      allow editing it.
- [ ] Selecting a row in `ItemsGrid` still populates `DetailPanel`
      exactly as `ItemListBox` did before this lesson.
- [ ] Clicking a column header re-sorts the grid, with no code written
      for it.
- [ ] You reproduced the silent in-memory-only edit (`IsReadOnly`
      temporarily removed), confirmed it doesn't survive a restart, and
      restored `IsReadOnly="True"`.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Replace ItemListBox with a real, explicit-column DataGrid"`.
