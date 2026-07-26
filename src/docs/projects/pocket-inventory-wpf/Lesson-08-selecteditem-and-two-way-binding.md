# Lesson 8: The Detail Panel Has No State of Its Own

*(`SelectedItem` and Two-Way Binding)*

**User Story**
> As a user, I want to select an item to view its details.

**What you will build**
A detail panel appears beside the item list, showing the currently
selected item's name in an editable field — and, because `InventoryItem`
already announces its own changes, editing that name
updates the list row live, with no refresh code anywhere. The
transferable problem underneath "add a detail panel" is a design
temptation worth naming directly: it would be easy to give the detail
panel its own private copy of "the currently selected name," kept in
sync by hand. This lesson deliberately avoids that entirely — the detail
panel will hold **no data of its own at all**, only a live binding
directly to whichever `InventoryItem` the user last clicked.

**What you need to know first**
Lesson 7: `INotifyPropertyChanged` on `InventoryItem` (this lesson is
where its payoff finally becomes visible), `{Binding}`, `DataContext`.
Lesson 6: `InventoryPage`'s `ListBox`/`TextBox` layout, which this lesson
extends with a second column.

**Terms introduced in this lesson:**
- **`SelectedItem`** — a property, on a selection control like
  `ListBox`, holding whichever item is currently selected, or `null` if
  none is.
- **`OneWay` binding** — data flows source-to-target only; `TextBlock`
  defaults to this since it can't be edited.
- **`TwoWay` binding** — data flows both directions; `TextBox` defaults
  to this since it's editable.
- **`UpdateSourceTrigger`** — controls when a `TwoWay` binding pushes a
  UI edit back to its source; `PropertyChanged` fires on every
  keystroke, versus `TextBox`'s own default of `LostFocus`.

---

## Concept Unit: `SelectedItem` and `SelectionChanged`

### The Problem

`ItemListBox` displays every item, but nothing in this project currently
knows *which one*, if any, the user has clicked on. Before a detail panel
can show anything, this project needs a way to ask the `ListBox` that
exact question.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-selection
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel>
    <ListBox x:Name="ColorListBox" Height="80" SelectionChanged="ColorListBox_SelectionChanged">
        <ListBoxItem Content="Red" />
        <ListBoxItem Content="Green" />
        <ListBoxItem Content="Blue" />
    </ListBox>
    <TextBlock x:Name="SelectionLabel" Margin="0,12,0,0" />
</StackPanel>
```

Add the handler in `MainWindow.xaml.cs`:

```csharp
private void ColorListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
{
    SelectionLabel.Text = $"You selected: {ColorListBox.SelectedItem}";
}
```

Run it on your Windows machine, and click each color in turn. Expected
result, to verify yourself: `SelectionLabel` updates immediately to name
whichever `ListBoxItem` was just clicked.

*What this proves:* `SelectionChanged` is an event every
selection-capable control raises the instant the user's selection
changes. `SelectedItem` is a property holding whichever item is
currently selected, or `null` if nothing is. Reading
`ColorListBox.SelectedItem` from inside the handler is enough to know
exactly what the user just clicked, with no manual bookkeeping of
"which item was clicked" maintained separately anywhere.

### Discard the Throwaway Example
Delete the `lab-selection` folder. `SelectionChanged` and `SelectedItem`
are not discarded — they connect the real detail panel to real selections
next.

### Mechanical Walkthrough

- `SelectionChanged="ColorListBox_SelectionChanged"` — **first
  appearance.** XAML-attribute event wiring — reappearing shape from
  `Click="..."` before, now on a `ListBox` instead of a `Button`,
  firing on a different event.
- `private void ColorListBox_SelectionChanged(object sender,
  SelectionChangedEventArgs e)` — **reappearing** handler-method shape,
  with `SelectionChangedEventArgs` as the specific event's
  own argument type, in place of `RoutedEventArgs`.
- `ColorListBox.SelectedItem` — **first appearance.** A property
  holding whichever item is currently selected (or `null` if none is)
  — read directly, with no separate variable tracking "what's
  selected" maintained by hand.
- `SelectionLabel.Text = $"..."` — **reappearing**, direct property
  assignment plus string interpolation, now driven by the
  just-read `SelectedItem`.

### CS Lens

`SelectionChanged` is the **Observer pattern**, reappearing a third time
in this project (the `Click` event, `PropertyChanged`/
`CollectionChanged`, now user *selection* specifically) — the same
underlying shape, a different trigger. Worth naming what's constant
across all three: something happens, a control raises an event, and
whatever subscribed decides what to do — the control itself never knows
or cares what the subscriber does with the information.

### SE Lens

Why does `SelectedItem` return `object` (which is what `ColorListBox.SelectedItem`
actually is, here holding a `ListBoxItem`) rather than something more
specific? Because a `ListBox` is a general-purpose control with no
built-in knowledge of what kind of thing it's displaying — it could hold
strings, custom objects, anything. `SelectedItem`'s broad `object` type
is what lets the same `ListBox` type work for every one of those cases;
the real project's next unit will read it back out as a specific,
concrete `InventoryItem`, using a cast, the same mechanism you'd expect
from any general-purpose container handing back exactly what was put
into it.

### Connection

The next unit builds the actual detail panel — a second column in
`InventoryPage`'s layout, populated the moment `SelectionChanged` fires.

---

## Concept Unit: Binding Modes — `OneWay` Versus `TwoWay`

### The Problem

The existing `DisplayMemberPath="Name"` shows `Name`'s value on screen —
data flowing one direction, from the object to the UI. The detail panel
needs the *opposite capability too*: a `TextBox` the user can type into,
where typing flows data back **from** the UI **into** the underlying
`InventoryItem`. Nothing so far in this project has needed that reverse
direction.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-twoway
```

Replace `MainWindow.xaml.cs`:

```csharp
using System.ComponentModel;
using System.Windows;

namespace lab_twoway
{
    public class Person : INotifyPropertyChanged
    {
        private string nickname = "Alex";

        public string Nickname
        {
            get { return nickname; }
            set
            {
                nickname = value;
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Nickname)));
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;
    }

    public partial class MainWindow : Window
    {
        public Person CurrentPerson { get; } = new Person();

        public MainWindow()
        {
            InitializeComponent();
            DataContext = this;
        }
    }
}
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel>
    <TextBlock Text="{Binding CurrentPerson.Nickname}" FontSize="20" />
    <TextBox Text="{Binding CurrentPerson.Nickname, UpdateSourceTrigger=PropertyChanged}"
             Margin="0,12,0,0" />
</StackPanel>
```

Run it on your Windows machine, and type into the `TextBox`. Expected
result, to verify yourself: the `TextBlock` above it updates on every
single keystroke, live.

*What this proves:* a `TextBlock`'s `Text` binding is **`OneWay`** by
default — data flows only from the source (`CurrentPerson.Nickname`) to
the target (the `TextBlock`); `TextBlock` has no way to be typed into
at all, so a reverse direction would be meaningless for it, and WPF
correctly never attempts one. A `TextBox`'s `Text` binding defaults to
**`TwoWay`** specifically because a `TextBox` genuinely can be edited:
data flows both directions, source-to-target (showing the current value
when the page loads) and target-to-source (writing back whatever the
user types). `UpdateSourceTrigger=PropertyChanged` controls *when* the
target-to-source direction actually fires: `TextBox`'s real default,
without this, is `LostFocus` — the underlying property only updates
once the user clicks or tabs away from the field, not on every
keystroke. Setting it explicitly to `PropertyChanged` is what makes the
`TextBlock` above update live, character by character, rather than only
once focus leaves the `TextBox`.

### Discard the Throwaway Example
Delete the `lab-twoway` folder. `TwoWay`/`OneWay`, and
`UpdateSourceTrigger=PropertyChanged`, are not discarded — the real
project's detail panel uses exactly this configuration next.

### Mechanical Walkthrough

- `class Person : INotifyPropertyChanged` with a `Nickname` property
  and `PropertyChanged?.Invoke(...)` in its setter — **reappearing**,
  identical shape to `InventoryItem`.
- `Text="{Binding CurrentPerson.Nickname}"` on `TextBlock` — **first
  appearance of the `OneWay` default.** No `Mode=` stated explicitly —
  `TextBlock` can't be edited, so WPF defaults its bindings to
  source-to-target only.
- `Text="{Binding CurrentPerson.Nickname, UpdateSourceTrigger=PropertyChanged}"`
  on `TextBox` — **first appearance of the `TwoWay` default**, plus
  **first appearance of `UpdateSourceTrigger`.** `TextBox` bindings
  default to `TwoWay` (editable, so both directions make sense); the
  explicit `UpdateSourceTrigger=PropertyChanged` overrides `TextBox`'s
  own separate default (`LostFocus`) so the reverse direction fires on
  every keystroke instead of only when focus leaves the field.

### CS Lens

`OneWay` and `TwoWay` binding modes are a direct application of **data
flow direction** as a first-class design decision, not an incidental
detail — the same distinction a network protocol draws between a
one-directional broadcast and a full-duplex connection, or a plumbing
system draws between a one-way valve and open flow in both directions.
Choosing the wrong mode isn't a style issue; a `TwoWay` binding on a
read-only display value, or a `OneWay` binding on something meant to be
edited, are both genuine, functional bugs.

### SE Lens

Why doesn't every binding just default to `TwoWay`, covering both cases
unconditionally? Because a `TwoWay` binding on something that structurally
cannot be written back to (`TextBlock.Text`, which has no way to accept
keyboard input at all) would be a meaningless, wasted subscription — WPF
picks each control's default mode based on what actually makes sense for
that specific property, and lets you override it explicitly on the rare
occasion the default isn't what you need, exactly as this lab did to get
live, per-keystroke updates instead of the `TextBox`'s own default,
which would only display the change to the `TextBlock` after clicking
away from the field.

### Connection

The real detail panel, built next, binds its own `TextBox` exactly this
way — `TwoWay`, with `UpdateSourceTrigger=PropertyChanged` — so that
editing an item's name updates the list live, the actual payoff this
lesson's User Story asked for.

---

## Concept Unit: Wiring the Detail Panel

### The Problem

Time to combine both previous units: a second `Grid` column showing the
selected item's details, populated by `SelectionChanged`, with a `TextBox`
bound `TwoWay` back to that same `InventoryItem`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`; `InventoryPage.xaml.cs`.
- **Change type:** Add.
- **Location:** `InventoryPage`'s content row (`Grid.Row="1"` from
  before), currently holding only `ItemListBox` directly.
- **Dependencies:** `InventoryItem.Name`'s `INotifyPropertyChanged`
  implementation, already built.

### The New Code — the Layout

```xml
<Grid Grid.Row="1" Margin="0,16,0,0">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="240" />
    </Grid.ColumnDefinitions>

    <ListBox x:Name="ItemListBox"
             Grid.Column="0"
             ItemsSource="{Binding Items}"
             DisplayMemberPath="Name"
             SelectionChanged="ItemListBox_SelectionChanged" />

    <StackPanel x:Name="DetailPanel" Grid.Column="1" Margin="16,0,0,0">
        <TextBlock Text="Details" FontWeight="Bold" Margin="0,0,0,8" />
        <TextBox Text="{Binding Name, UpdateSourceTrigger=PropertyChanged}" />
    </StackPanel>
</Grid>
```

### The Updated Project

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

        <Grid Grid.Row="1" Margin="0,16,0,0">                                  <!-- ← changed (was ListBox directly in Grid.Row="1") -->
            <Grid.ColumnDefinitions>                                            <!-- ← new -->
                <ColumnDefinition Width="*" />                                    <!-- ← new -->
                <ColumnDefinition Width="240" />                                   <!-- ← new -->
            </Grid.ColumnDefinitions>                                              <!-- ← new -->

            <ListBox x:Name="ItemListBox"
                     Grid.Column="0"                                              <!-- ← new -->
                     ItemsSource="{Binding Items}"
                     DisplayMemberPath="Name"
                     SelectionChanged="ItemListBox_SelectionChanged" />            <!-- ← new -->

            <StackPanel x:Name="DetailPanel" Grid.Column="1" Margin="16,0,0,0">    <!-- ← new -->
                <TextBlock Text="Details" FontWeight="Bold" Margin="0,0,0,8" />     <!-- ← new -->
                <TextBox Text="{Binding Name, UpdateSourceTrigger=PropertyChanged}" /> <!-- ← new -->
            </StackPanel>                                                          <!-- ← new -->
        </Grid>
    </Grid>
</Page>
```

The content row is no longer a bare `ListBox` — it's a two-column `Grid`
(the exact pattern used before), the list on the left taking remaining space,
a fixed-width detail panel on the right.

### Mechanical Walkthrough
1. `<ColumnDefinition Width="*" />` / `<ColumnDefinition Width="240" />` —
   (hard concept reappearing) list column takes all remaining
   space; detail column is a fixed width.
2. `SelectionChanged="ItemListBox_SelectionChanged"` — (hard concept
   reappearing, this lesson's first unit) wired for real this time.
3. `<StackPanel x:Name="DetailPanel" ...>` — (hard concept reappearing)
   note this `StackPanel` has **no `{Binding}` on itself at
   all** — its own `DataContext` isn't set yet; the next code block is
   what supplies it, from code-behind, the moment a selection happens.
4. `<TextBox Text="{Binding Name, UpdateSourceTrigger=PropertyChanged}" />`
   — (hard concept reappearing, this lesson's second unit) binds to
   `Name` with no object name in front of it (unlike the lab's
   `CurrentPerson.Nickname`) — because this `TextBox` inherits
   `DetailPanel`'s `DataContext`, and — once wired next — that
   `DataContext` will *be* the selected `InventoryItem` directly, making
   `Name` resolve against it with no further path needed.

### The New Code — the Selection Handler

```csharp
private void ItemListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
{
    DetailPanel.DataContext = ItemListBox.SelectedItem;
}
```

### The Updated Project

```csharp
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;

namespace PocketInventory
{
    public partial class InventoryPage : Page
    {
        public ObservableCollection<InventoryItem> Items { get; } = new ObservableCollection<InventoryItem>();

        public InventoryPage()
        {
            InitializeComponent();
            DataContext = this;
        }

        private void AddButton_Click(object sender, RoutedEventArgs e)
        {
            Items.Add(new InventoryItem { Name = NameInput.Text });
            NameInput.Text = "";
        }

        private void ItemListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)  // ← new
        {                                                                                          // ← new
            DetailPanel.DataContext = ItemListBox.SelectedItem;                                    // ← new
        }                                                                                          // ← new
    }
}
```

`InventoryPage` now handles two independent events from user interaction
— `AddButton_Click` (built earlier) and `ItemListBox_SelectionChanged` (this
lesson) — neither aware of the other, each doing exactly one job.

### Mechanical Walkthrough
1. `DetailPanel.DataContext = ItemListBox.SelectedItem;` — (hard concept
   reappearing — `DataContext`, already used; `SelectedItem`, this lesson's
   first unit) sets `DetailPanel`'s own, local `DataContext` — distinct
   from `InventoryPage`'s own `DataContext = this` set in the
   constructor — to whichever `InventoryItem` was just clicked. WPF's
   `DataContext` inheritance (briefly noted earlier) means every
   child inside `DetailPanel`, including the `TextBox`, now resolves its
   own `{Binding Name}` against this specific `InventoryItem`, not
   against `InventoryPage` itself anymore — a `DataContext` set on any
   element overrides whatever it would otherwise have inherited from its
   parent, for everything beneath it.

### Execution trace

```
User clicks "Hex Bolts" in the list:
    SelectionChanged fires
    ItemListBox.SelectedItem = the InventoryItem with Name "Hex Bolts"
    DetailPanel.DataContext = that same InventoryItem
    TextBox.Text resolves {Binding Name} against it → shows "Hex Bolts"

User types an extra character, "Hex Bolts!", in the detail TextBox:
    TwoWay binding, UpdateSourceTrigger=PropertyChanged, writes back immediately
    InventoryItem.Name's setter runs: name = "Hex Bolts!"
    PropertyChanged?.Invoke(...) fires, naming "Name" as changed
    ItemListBox's own internal binding to this same object's Name (via
    DisplayMemberPath) is subscribed to that exact event
    ItemListBox's row updates to "Hex Bolts!" — live, with zero code
    written in this lesson to make that specific update happen
```

The final line is the entire point of this lesson, and of the
otherwise-unproven `INotifyPropertyChanged` work built earlier: nothing in
`ItemListBox_SelectionChanged` or anywhere else told the list to update
when the name changed. It updated because both the list row and the
detail `TextBox` are bound to the exact same `InventoryItem` object in
memory — not two separate copies — and that object announces its own
changes to anyone listening, exactly as designed.

### CS Lens

**Single source of truth, this lesson's named principle, made
concrete.** `DetailPanel` holds no independent copy of "the selected
item's name" anywhere — no `private string selectedName` field, nothing
manually kept in sync. It holds a reference to the *actual*
`InventoryItem` object living inside `Items`, the very same object the
`ListBox` is displaying. There is exactly one `Name` value in memory for
"Hex Bolts," and every part of the screen showing it is looking at that
one value, live, through a binding — not a snapshot, not a copy.

Also recognized in: a spreadsheet's linked cells (referencing the same
underlying value rather than a copied number), database foreign keys
(referencing a row rather than duplicating its data), and — a direct
contrast worth naming now, since Lesson 27 revisits it properly — the
opposite failure mode, reference aliasing causing *unwanted* shared
state, which is exactly what happens if this project's future
"Duplicate Item" feature copies an `InventoryItem` reference instead of
its values.

### SE Lens

Why not give `DetailPanel`'s `TextBox` its own `SelectedItemName`
property on `InventoryPage`, updated inside `SelectionChanged`, instead
of binding the panel directly to the `InventoryItem` object itself? A
separate property would mean *two* places holding "the current name" —
the real `InventoryItem.Name`, and a copy on `InventoryPage` — and every
future feature touching either one would need to remember to keep both
in sync by hand, exactly the manual-bookkeeping problem already
eliminated for the list itself. Binding directly to the shared object
means there is structurally nothing to keep in sync — there's only ever
one value.

### Commands needed

```bash
dotnet run
```

### Run it

On your Windows machine: add two or three items, click one in the list —
its name appears in the detail panel's `TextBox`. Edit it there, letter
by letter, and watch the list row update live, in real time, with no
lag, no click-away-to-refresh needed — direct, visible proof of every
concept this lesson (and the one before it) built.

### Connection

Selecting and editing now works entirely in memory — close the app and
every edit is gone, exactly like every item this project has ever added.
Epic 2's next lesson, SQLite, is where that finally stops being true.

---

## Closing

### Connect the Pieces
One concrete trace: clicking a row raises `SelectionChanged`
(Concept Unit 1), read via `ItemListBox.SelectedItem` inside the handler
— which sets `DetailPanel.DataContext` to that exact `InventoryItem`
object, not a copy. The detail `TextBox`'s `{Binding Name, UpdateSourceTrigger=PropertyChanged}`
(Concept Unit 2) resolves against that `DataContext`, `TwoWay` by
`TextBox`'s own default, updating live on every keystroke rather than
only on lost focus. Every keystroke writes through to the real
`InventoryItem.Name` property, whose `set` block — built earlier,
unused until this exact moment — fires `PropertyChanged`, which the list
row's own internal binding (from `DisplayMemberPath`, also built earlier) is
already subscribed to, updating the row live. No code anywhere in this
lesson explicitly told the list to refresh; it refreshed because both
panels share one real object, not two synchronized copies.

### What Breaks Without This
Temporarily remove `UpdateSourceTrigger=PropertyChanged` from the detail
`TextBox`'s binding, leaving `Text="{Binding Name}"` with `TextBox`'s
real default (`LostFocus`). Run the app, select an item, and type a
change into the detail panel — watch the list row *not* update while
you're still typing. Click anywhere else in the window to move focus
away from the `TextBox`, and the list row updates immediately at that
moment, all at once. This is not a bug — it's `TextBox`'s honest default
behavior, and this exercise makes the difference between the two triggers
concrete and felt rather than abstract. Restore
`UpdateSourceTrigger=PropertyChanged` for live, per-keystroke updates.

### Exercises

- Click a different item in the list while the detail panel already
  shows one — confirm the panel correctly swaps to the new selection,
  and connect this to `DataContext` simply being reassigned again, with
  no special "switching" logic needed anywhere.
- Click empty space in the `ListBox` below the last item (deselecting
  everything) and observe what happens to the detail panel — read the
  real error or behavior, and connect it to `SelectedItem` being able to
  return `null`.
- Add a second `TextBox`, temporarily, bound to
  `Text="{Binding Name, Mode=OneWay}"` explicitly, right next to the
  existing `TwoWay` one, inside `DetailPanel`. Type into the original,
  editable one and confirm the second, `OneWay`-bound one *also* updates
  (since both read the same live `Name`) but cannot itself be typed into
  in a way that writes back — confirming `OneWay` genuinely blocks the
  reverse direction even on a control, like `TextBox`, that could
  otherwise support it.

### Definition of Done
- [ ] Clicking an item in the list shows its name in an editable detail
      panel.
- [ ] Editing the detail panel's `TextBox` updates the corresponding list
      row live, with no click-away needed.
- [ ] You reproduced the `LostFocus` default behavior on purpose, saw the
      delayed update, and restored `UpdateSourceTrigger=PropertyChanged`.
- [ ] You can explain, in your own words, why the detail panel holds no
      state of its own, and what would break if it did.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a selection-driven detail panel bound TwoWay to the shared InventoryItem object, so edits propagate live with no manual refresh"`.
