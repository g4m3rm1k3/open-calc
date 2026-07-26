# Lesson 7: The View Reacts to the Model, Instead of Being Told About It

*(`INotifyPropertyChanged` and `ObservableCollection<T>`)*

**User Story**
> As a user, I want the list to update itself.

**What you will build**
The app currently has a working but honestly clunky mechanism: every single
click of "Add" wipes `ItemListBox` completely and rebuilds it from scratch,
just to reflect one new entry. This lesson deletes every line of that
manual rebuild — `ItemListBox.Items.Clear()`, the `foreach` loop, all of
it — and replaces it with a `ListBox` that keeps itself in sync
automatically. The transferable problem underneath "make the list update
itself" is a genuine shift in *who is responsible* for keeping the screen
correct: right now, `AddButton_Click` is responsible, explicitly, by
name, for touching `ItemListBox` directly. After this lesson, nothing in
`AddButton_Click` will mention `ItemListBox` at all — the list will react
to changes in the *data*, without the code that changes the data needing
to know a `ListBox` even exists.

**What you need to know first**
Lesson 6: `InventoryItem`, its `Name` property (this lesson changes its
implementation, not its public shape), `List<InventoryItem> items`, and
the exact manual-refresh code this lesson deletes. Lesson 4: `event`,
`+=` subscription — this lesson's `INotifyPropertyChanged` is a second,
different use of the same underlying `event` keyword.

**Terms introduced in this lesson:**
- **Model / View** — the "model" is a plain data object with no UI
  awareness (`InventoryItem`); the "view" is whatever's actually
  displayed on screen. `INotifyPropertyChanged` lets a model announce
  its own changes to any interested view, without knowing anything
  about what that view is.
- **Interface** (`: INotifyPropertyChanged`) — a contract with no
  implementation of its own; names required members any implementing
  class must provide.
- **`string.Empty`** — a built-in constant equal to `""`, preferred
  over a literal empty string in idiomatic C#.
- **Null-conditional operator** (`?.`) — calls a member only if the
  left-hand side isn't `null`; otherwise does nothing rather than
  throwing.
- **`PropertyChangedEventArgs`** — the event-argument object every
  `PropertyChanged` subscriber receives, carrying the name of which
  property changed.
- **`nameof`** — a compiler operator turning an identifier into its
  literal string name, checked at compile time against renames.
- **`PropertyChangedEventHandler`** — the delegate type
  `INotifyPropertyChanged`'s `PropertyChanged` event requires.
- **`ObservableCollection<T>`** — a `List<T>`-like collection that
  automatically raises a `CollectionChanged` event whenever its
  contents change.
- **`CollectionChanged` / `e.Action`** — the event an
  `ObservableCollection<T>` raises on mutation; `e.Action` describes
  what kind of change occurred (`Add`, `Remove`, etc.).
- **`DataContext`** — the object a WPF element's `{Binding ...}`
  expressions resolve against; inherited from a parent unless set
  explicitly.
- **Read-only auto-property** (`{ get; }`) — an auto-property with no
  `set`; can never be reassigned after construction, though a mutable
  collection's own contents can still change.
- **`DisplayMemberPath`** — tells a `ListBox` which property of each
  bound object to actually display.

---

## Concept Unit: `INotifyPropertyChanged` — an Object Announcing Its Own Changes

### The Problem

`InventoryItem.Name` is a property, deliberately, specifically
so a future lesson could add real logic to its `set` block without
breaking any existing caller — this is that lesson. Right now, nothing
outside `InventoryItem` has any way to know when `Name` changes; whatever
last read it could easily be showing stale, out-of-date information with
no way to notice.

### The Contract You're Implementing

`: INotifyPropertyChanged` below means fitting `Thermometer` (and soon
`InventoryItem`) into a shape .NET itself already declared — worth
reading that real shape first, rather than inferring it from how the
lab happens to implement it. From `System.ComponentModel`
itself, not this project's code (verified against the real interface,
this session):

```csharp
public interface INotifyPropertyChanged
{
    event PropertyChangedEventHandler? PropertyChanged;
}
```

One real fact this makes checkable instead of assumed: the entire
interface requires exactly one member — the `PropertyChanged` event
itself. Everything else in the lab below (the `Temperature` property,
its `set` block calling `PropertyChanged?.Invoke(...)`) is this
project's own design, not something the interface demands — the
interface's actual bar is this low, and knowing that precisely is what
makes "did I implement this correctly?" answerable by inspection
instead of guesswork.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-notify
cd lab-notify
```

Replace `Program.cs`:

```csharp
using System.ComponentModel;

class Thermometer : INotifyPropertyChanged
{
    private double temperature;

    public double Temperature
    {
        get { return temperature; }
        set
        {
            temperature = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Temperature)));
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;
}

Thermometer thermometer = new Thermometer();
thermometer.PropertyChanged += (sender, e) =>
    Console.WriteLine($"Something changed: {e.PropertyName}");

thermometer.Temperature = 72.5;
thermometer.Temperature = 68.0;
```

Run it:

```bash
dotnet run
```

Real output:

```text
Something changed: Temperature
Something changed: Temperature
```

*What this proves:* `Thermometer` announces every single change to
`Temperature`, to anyone who's subscribed, without ever needing to know
who that is or what they'll do about it — the exact same "notify without
knowing the listener" shape from the `Click` event and the `DoorOpened`
event before, now applied to a **property changing**, rather than a
button being clicked.

### Discard the Throwaway Example
Delete the `lab-notify` folder. `Thermometer` never appears again — the
real project applies this exact mechanism to `InventoryItem.Name` next.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryItem.cs`.
- **Change type:** Replace.
- **Location:** `Name`'s auto-property declaration from before.
- **Dependencies:** None new.

### The New Code

```csharp
using System.ComponentModel;

namespace PocketInventory
{
    public class InventoryItem : INotifyPropertyChanged
    {
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
    }
}
```

### The Updated Project

```csharp
namespace PocketInventory
{
    public class InventoryItem : INotifyPropertyChanged  // ← changed
    {
        private string name = string.Empty;                // ← changed (was auto-property)

        public string Name                                   // ← changed
        {                                                      // ← changed
            get { return name; }                               // ← changed
            set                                                  // ← changed
            {                                                     // ← changed
                name = value;                                      // ← changed
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Name))); // ← changed
            }                                                      // ← changed
        }                                                          // ← changed

        public event PropertyChangedEventHandler? PropertyChanged;  // ← new
    }
}
```

`InventoryItem` is now the whole file's only type, and this is exactly
the moment predicted earlier: `Name` expands from a one-line
auto-property into the long-hand form with real logic inside `set`, and
**nothing anywhere else in this project has to change** — every existing
`item.Name = "..."` call, including `InventoryPage`'s `AddButton_Click`,
keeps compiling and working exactly as before.

### Mechanical Walkthrough
1. `using System.ComponentModel;` — (hard concept reappearing — the
   `using System;` pattern already used) `INotifyPropertyChanged` and `PropertyChangedEventArgs`
   both live in this namespace.
2. `: INotifyPropertyChanged` — (first appearance of implementing an
   **interface**, distinct from `: Window`/`: Page`'s inheritance) an interface is a **contract with no implementation of its
   own** — it names required members (here, exactly one: the
   `PropertyChanged` event) that any class choosing to implement it must
   provide. Unlike `: Window`, `InventoryItem` doesn't *become a kind of*
   `INotifyPropertyChanged`-flavored thing the way `MainWindow` truly is a
   `Window` — it's making a narrower promise: "I will raise this specific
   event correctly, whenever any of my properties change."
3. `private string name = string.Empty;` — (first appearance of
   `string.Empty`) a built-in constant equal to `""` — preferred over a
   literal empty-string in idiomatic C# because it avoids allocating a
   new empty string object at every use (a genuinely minor detail, stated
   honestly as a convention, not a load-bearing correctness difference
   here). This field is the real backing storage the long-hand property
   below reads and writes — the exact role the earlier lab's `nameStorage`
   played, and the exact hidden field the auto-property shorthand
   was generating for you, invisibly, the whole time.
4. `set { name = value; PropertyChanged?.Invoke(...); }` — (hard concept
   reappearing from the earlier lab) `value`, reused exactly; the new second
   line is this unit's entire point.
5. `PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Name)));`
   — (hard concept reappearing from this lesson's own lab, several new
   pieces) `PropertyChanged` — the event itself, declared on the last
   line of the class; `?.` — (first appearance, full treatment) the
   **null-conditional operator**: `PropertyChanged?.Invoke(...)` means
   "call `Invoke` only if `PropertyChanged` is not `null`; otherwise, do
   nothing and don't crash" — necessary because if nothing has subscribed
   yet (nobody has written `item.PropertyChanged += ...`), the event
   itself is `null`, and calling `.Invoke()` directly on `null` would
   throw a `NullReferenceException`. `new PropertyChangedEventArgs(nameof(Name))`
   — (first appearance) constructs the event-argument object every
   subscriber receives, carrying the name of *which* property changed;
   `nameof(Name)` — (first appearance) — a compiler operator that turns
   the identifier `Name` into the literal string `"Name"`, checked at
   compile time: rename the `Name` property later, and `nameof(Name)`
   fails to compile until you also update this line — a real, concrete
   improvement over typing the literal string `"Name"` by hand, which the
   compiler could never catch drifting out of sync with a rename.
6. `public event PropertyChangedEventHandler? PropertyChanged;` — (hard
   concept reappearing — the `event Action? DoorOpened;` shape used
   before, one new
   piece explained properly for the first time) `PropertyChangedEventHandler`
   — (first appearance) — a specific delegate type (a type describing a
   method signature, the same underlying idea `RoutedEventArgs`-shaped
   handlers have used since the very first click handler, just named and reused here as
   .NET's own standard shape for exactly this kind of notification) — the
   required exact type `INotifyPropertyChanged`'s contract demands.
   **The trailing `?`** — first given full treatment here, though it
   quietly appeared once already, unexplained, on the earlier
   `Action? DoorOpened` — is a **nullable reference type annotation**.
   This project's `.csproj` has `<Nullable>enable</Nullable>`
   turned on, which means the C# compiler tracks, for every reference
   type, whether a given usage is allowed to be `null` — a plain
   `PropertyChangedEventHandler PropertyChanged` (no `?`) would be a
   compile-time *warning* the moment it's used in a way that assumes it's
   always non-null, since an event genuinely starts out `null` (nothing
   has subscribed yet) until something subscribes to it. The `?` is an
   explicit, honest declaration: "this can legitimately be `null`; every
   caller must account for that" — which is exactly what this unit's
   `?.Invoke(...)` null-conditional call already does.

### CS Lens

**The Observer pattern, reappearing — deepened.** The earlier
`Click` event was a *UI element* notifying *application code* that a
user interacted with it. This lesson runs the identical mechanism in the
opposite direction: a plain data object — `InventoryItem`, with no UI
awareness whatsoever — notifying *anything interested* that its own state
changed. The same pattern, the same `event`/`+=`/`?.Invoke(...)` shape,
now used to let a **model** announce itself to a **view**, rather than a
view announcing itself to application logic. This exact direction —
model notifies view — is the specific shape WPF's entire data-binding
system, built starting this lesson's third unit, depends on.

Also recognized in: JavaScript's `EventTarget`/`addEventListener` (the
same shape from the opposite side, an object announcing its own state
changes to arbitrary listeners); React's `useState` triggering a
re-render (conceptually the same notify-on-change idea, hidden behind a
different-looking API); spreadsheet software recalculating every
dependent cell the instant one cell's value changes; and this project's
own sibling Android curriculum, which reaches the identical idea
independently, at a different point in its own sequence, via `LiveData`.

### SE Lens

Why does `InventoryItem` have to explicitly implement
`INotifyPropertyChanged` and manually call `PropertyChanged?.Invoke(...)`
inside every property's `set`, instead of WPF just detecting property
changes automatically? Because C# has no built-in way to intercept "a
property was just assigned" generically, across any arbitrary class —
the language doesn't watch memory for changes the way, say, a reactive
framework's proxy objects sometimes do. `INotifyPropertyChanged` is the
explicit, opt-in contract that fills that gap: any class willing to do
the small, repetitive work of calling `PropertyChanged?.Invoke(...)`
inside its own setters gets to participate in WPF's automatic UI-refresh
system; a class that doesn't implement it simply won't have its property
changes reflected on screen automatically, which is a real, honest
limitation worth knowing rather than discovering by surprise later.

### Connection

`InventoryItem` now correctly announces changes to `Name` — but nothing
is listening to those announcements yet, and this lesson's actual visible
goal (the manual refresh, deleted) is about the *collection*
changing, not one item's property changing. The next unit builds the
collection-level equivalent of what this unit just built at the property
level.

---

## Concept Unit: `ObservableCollection<T>` — a List That Announces Its Own Changes

### The Problem

`INotifyPropertyChanged` solves "did *this specific item's* `Name`
change." It says nothing about "was an item *added to or removed from*
the list at all" — a completely different kind of change, and exactly
the one `AddButton_Click` currently handles by brute-force rebuilding
`ItemListBox` from scratch.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-observable
cd lab-observable
```

Replace `Program.cs`:

```csharp
using System.Collections.ObjectModel;
using System.Collections.Specialized;

ObservableCollection<string> names = new ObservableCollection<string>();
names.CollectionChanged += (sender, e) =>
    Console.WriteLine($"Collection changed: {e.Action}");

names.Add("Alpha");
names.Add("Bravo");
names.Remove("Alpha");
```

Run it:

```bash
dotnet run
```

Real output:

```text
Collection changed: Add
Collection changed: Add
Collection changed: Remove
```

#### Execution Trace

Three mutations, three separate events, each with a different `e.Action`:

1. `names.Add("Alpha")` — runs, appending `"Alpha"` — because
   `ObservableCollection<T>` raises `CollectionChanged` automatically
   on every mutation, the subscribed lambda fires immediately
   afterward — `names = ["Alpha"]`, `e.Action = Add`.
2. `names.Add("Bravo")` — runs the same way, triggering a second,
   independent `CollectionChanged` event for this specific addition —
   `names = ["Alpha", "Bravo"]`, `e.Action = Add`.
3. `names.Remove("Alpha")` — runs, and since removal is a different
   kind of mutation than addition, the event fires again but this time
   reports `e.Action = Remove` — `names = ["Bravo"]`.

*What this proves:* `ObservableCollection<T>` is a `List<T>`-like
collection (every method from `List<T>` before — `Add`, `Remove`,
`Count`, `foreach` — works identically) with one addition: it raises a
`CollectionChanged` event automatically, every single time its contents
actually change, with no code inside `Add`/`Remove` themselves needing
to remember to announce anything — the announcing is built into the
collection type itself, unlike `InventoryItem`, which had to be
hand-written to announce its own changes in the previous unit.

### Discard the Throwaway Example
Delete the `lab-observable` folder. `ObservableCollection<T>` itself is
not discarded — it replaces `List<InventoryItem>` in the real project,
in the next unit.

### Mechanical Walkthrough

- `ObservableCollection<string> names = new ObservableCollection<string>();`
  — **first appearance.** Same generic-collection shape as `List<T>`,
  plus automatic change notification.
- `names.CollectionChanged += (sender, e) => ...` — **reappearing**
  `+=` event subscription (the same mechanism as the `DoorOpened` lab), now
  subscribing to an event the .NET library itself raises, rather than
  one this project declared by hand.
- `e.Action` — **first appearance.** Describes *what kind* of change
  just happened (`Add`, `Remove`, and others not used in this lab) —
  passed automatically as part of the event.
- `.Add(...)` / `.Remove(...)` — **reappearing**, identical
  `List<T>` methods — the difference here is invisible at
  the call site: each one also triggers `CollectionChanged` internally.

### CS Lens

`ObservableCollection<T>` is `List<T>`'s data structure — a resizable,
ordered collection — composed with the Observer pattern this lesson has
now taught at two different granularities: `INotifyPropertyChanged` for
"one object's field changed"; `INotifyCollectionChanged` (the interface
`ObservableCollection<T>` implements for you, the source of
`CollectionChanged` — you never implement it by hand, unlike
`InventoryItem`, since `ObservableCollection<T>` already did) for "the
membership of a collection changed." Both exist because they answer
genuinely different questions, and a real application frequently needs
both simultaneously — exactly what this lesson's `InventoryPage` is about
to need.

### SE Lens

Why doesn't `List<T>` itself just raise these events, making a separate
`ObservableCollection<T>` type unnecessary? Because `List<T>` is used
constantly for plain, in-memory data processing — sorting a temporary
list, building one up inside a loop and throwing it away — where
constantly firing change notifications nobody is listening to would be
pure wasted overhead. `ObservableCollection<T>` exists as an explicit,
opt-in choice: reach for it specifically when something *does* need to
react live to a collection's membership changing, which is exactly a
UI-bound list's situation, and use plain `List<T>` everywhere else, which
is every other collection this project has used and will keep using for
purely internal bookkeeping.

### Connection

The next unit replaces `InventoryPage`'s `List<InventoryItem>` with an
`ObservableCollection<InventoryItem>`, and — for the first time in this
project — connects a collection's automatic change announcements
directly to the screen, with no code-behind rebuild logic in between at
all.

---

## Concept Unit: `{Binding}` — Connecting XAML Directly to Data

### The Problem

`ObservableCollection<T>` announces changes. `ListBox` still has no way
to hear them — right now, the only way anything has ever appeared inside
`ItemListBox` is `AddButton_Click` manually calling `ItemListBox.Items.Add(...)`.
Something has to connect the two, declaratively, so the connection itself
survives without any code-behind maintaining it by hand.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-binding
```

Replace `MainWindow.xaml.cs`:

```csharp
using System.Collections.ObjectModel;
using System.Windows;

namespace lab_binding
{
    public partial class MainWindow : Window
    {
        public ObservableCollection<string> Names { get; } = new ObservableCollection<string>();

        public MainWindow()
        {
            InitializeComponent();
            DataContext = this;
            Names.Add("Alpha");
        }
    }
}
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel>
    <ListBox ItemsSource="{Binding Names}" Height="100" />
    <Button Content="Add Bravo" Click="AddBravo_Click" />
</StackPanel>
```

Add the click handler:

```csharp
private void AddBravo_Click(object sender, RoutedEventArgs e)
{
    Names.Add("Bravo");
}
```

Run it on your Windows machine: the `ListBox` shows "Alpha" immediately.
Click the button — "Bravo" appears in the `ListBox`, and — this is the
entire point — **no code anywhere touches the `ListBox` directly**. The
only line that ran was `Names.Add("Bravo");`.

*What this proves:* `ItemsSource="{Binding Names}"` connects the
`ListBox` to the `Names` property, resolved against whatever object is
currently set as `DataContext` — (first appearance) — every WPF element
inherits a `DataContext` from its parent unless it sets its own; setting
`DataContext = this;` in the constructor makes `MainWindow`'s own public
properties (here, `Names`) the thing every `{Binding ...}` expression in
this window resolves against, by name. Once bound, the `ListBox`
subscribes to `Names.CollectionChanged` **internally, automatically** —
you never write that subscription yourself; it's part of what
`ItemsSource="{Binding ...}"` sets up on your behalf.

### Discard the Throwaway Example
Delete the `lab-binding` folder. `{Binding}`, `DataContext`, and
`ItemsSource` are not discarded — they connect the real project's
`ObservableCollection<InventoryItem>` to `InventoryPage`'s real `ListBox`
next.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`; `InventoryPage.xaml.cs`.
- **Change type:** Replace.
- **Location:** `InventoryPage`'s `items` field and `AddButton_Click`
  from before; the `ListBox` declaration in `InventoryPage.xaml`.
- **Dependencies:** `InventoryItem` (now implementing
  `INotifyPropertyChanged`, this lesson's first unit).

### The New Code

```xml
<ListBox x:Name="ItemListBox"
         Grid.Row="1"
         Margin="0,16,0,0"
         ItemsSource="{Binding Items}"
         DisplayMemberPath="Name" />
```

```csharp
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
```

### The Updated Project

`InventoryPage.xaml`:

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

        <ListBox x:Name="ItemListBox"
                 Grid.Row="1"
                 Margin="0,16,0,0"
                 ItemsSource="{Binding Items}"          <!-- ← new -->
                 DisplayMemberPath="Name" />              <!-- ← new -->
    </Grid>
</Page>
```

`InventoryPage.xaml.cs`:

```csharp
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;

namespace PocketInventory
{
    public partial class InventoryPage : Page
    {
        public ObservableCollection<InventoryItem> Items { get; } = new ObservableCollection<InventoryItem>();  // ← changed (was private List<InventoryItem>)

        public InventoryPage()
        {
            InitializeComponent();
            DataContext = this;                                                    // ← new
        }

        private void AddButton_Click(object sender, RoutedEventArgs e)
        {
            Items.Add(new InventoryItem { Name = NameInput.Text });                 // ← changed (was: items.Add(newItem); then manual rebuild)
            NameInput.Text = "";
        }
    }
}
```

Every line written before to manually clear and rebuild `ItemListBox` —
`ItemListBox.Items.Clear();`, the entire `foreach` loop — is gone.
`AddButton_Click` now does exactly two things: construct a new item, and
clear the input box. It never mentions `ItemListBox` at all.

### Mechanical Walkthrough
1. `public ObservableCollection<InventoryItem> Items { get; } = new ObservableCollection<InventoryItem>();`
   — (hard concept reappearing, new detail) a **read-only auto-property**
   — `{ get; }` with no `set` at all — (first appearance) — meaning
   `Items` itself can never be reassigned to point at a *different*
   `ObservableCollection` after construction, though its *contents* can
   still change freely via `.Add(...)`/`.Remove(...)`; `public`, this
   time necessary (not just good habit, as before) because XAML's
   `{Binding Items}` needs to reach this property from outside the class
   entirely.
2. `DataContext = this;` — (hard concept reappearing from the lab)
   identical mechanism, this time inside `InventoryPage`'s own
   constructor rather than `MainWindow`'s.
3. `ItemsSource="{Binding Items}"` — (hard concept reappearing from the
   lab) resolves `Items` against `InventoryPage`'s `DataContext` — itself
   — and subscribes to its `CollectionChanged` internally.
4. `DisplayMemberPath="Name"` — (first appearance) tells the `ListBox`
   exactly which property of each bound object to actually display —
   without it, a bound `ListBox` would show each item's default
   `ToString()` result (typically just the type name, `PocketInventory.InventoryItem`,
   not remotely useful) rather than its `Name`. This is the direct
   binding-based replacement for the earlier manual `ItemListBox.Items.Add(item.Name)` —
   the same underlying goal, "show this specific piece of each object,"
   now declared once in XAML instead of re-executed by hand on every
   change.
5. `Items.Add(new InventoryItem { Name = NameInput.Text });` — (hard
   concept reappearing — the object-initializer syntax and
   `.Add(...)` already used) the entire remaining body of the click handler —
   everything about actually displaying this new item is now handled
   automatically, upstream of this line, by the binding itself.

### Execution trace

```
App launches:
    Items = [ ]  (empty ObservableCollection)
    ItemListBox displays: (nothing)

User types "Hex Bolts", clicks Add:
    Items.Add(...) → Items = [ InventoryItem{Name="Hex Bolts"} ]
    Items.CollectionChanged fires automatically (Action: Add)
    ListBox, already subscribed via the binding, adds one row: "Hex Bolts"
    NameInput.Text = ""

User types "Shop Rags", clicks Add:
    Items.Add(...) → Items = [ ..., InventoryItem{Name="Shop Rags"} ]
    Items.CollectionChanged fires (Action: Add)
    ListBox adds exactly one new row: "Shop Rags" — "Hex Bolts" is never touched
```

Contrast this directly against the earlier execution trace: there, every
click cleared and rebuilt *every* row, including ones that hadn't
changed. Here, each click's `CollectionChanged` event carries enough
information (`Action: Add`, and which item) that the `ListBox` only ever
touches the one row that's actually new.

### CS Lens

This is the concrete, felt payoff of the Observer pattern this whole
lesson has been building toward: `AddButton_Click` and `ItemListBox` are
now **completely decoupled** — neither one holds a reference to the
other, or knows the other exists. `AddButton_Click` only ever talks to
`Items`, a plain collection; `ItemListBox` only ever talks to whatever
`{Binding Items}` resolves to. The connection between "data changed" and
"screen updates" lives entirely in the binding system itself, not in any
line of code either side had to write.

### SE Lens

**This lesson's named principle, made concrete.** The earlier click
handler had to know, explicitly, that a `ListBox` named `ItemListBox`
existed and needed manual rebuilding — a real coupling between "business
logic" (add an item) and "UI mechanics" (redraw a specific control). This
lesson's version could have its `ListBox` swapped for a completely
different control tomorrow — Lesson 16 does exactly this, replacing
`ListBox` with `DataGrid` — and `AddButton_Click` would need **zero
changes**, because it was never coupled to the specific control
displaying `Items` in the first place. This is the direct payoff already
previewed in the abstract earlier ("swapping a control
without touching the underlying data") — now real, working code, not a
forward promise.

### Commands needed

```bash
dotnet run
```

### Run it

On your Windows machine: adding items behaves identically to before,
from the user's point of view — but open `InventoryPage.xaml.cs` side by
side with the earlier version and confirm, directly, that
`ItemListBox.Items.Clear()` and the manual `foreach` rebuild are both
completely gone.

### Connection

`InventoryItem` now announces its own property changes (this lesson's
first unit), and `Items` announces its own membership changes (second
unit), both wired directly to the screen via `{Binding}` (third unit) —
but nothing in this project has a way to *select* one specific item and
look at, or change, its `Name` yet. That's Lesson 8, and it's exactly
where `INotifyPropertyChanged`'s payoff — built now, used later — finally
becomes visible on screen.

---

## Closing

### Connect the Pieces
One concrete trace: `InventoryItem` (Concept Unit 1) now implements
`INotifyPropertyChanged`, raising `PropertyChanged` inside `Name`'s
`set` — infrastructure this lesson builds but doesn't yet have a visible
trigger for, honestly, since nothing in this project edits an existing
item's `Name` yet. `ObservableCollection<InventoryItem>` (Concept Unit 2)
replaces the earlier plain `List<InventoryItem>`, raising
`CollectionChanged` automatically on every `Add`. `{Binding Items}` and
`DisplayMemberPath="Name"` (Concept Unit 3) connect that collection
directly to `ItemListBox`, with `DataContext = this` making `InventoryPage`'s
own `Items` property the thing every binding in the page resolves
against. The result: `AddButton_Click` shrank from the earlier eight-line
manual-rebuild version to two lines that never mention `ItemListBox` at
all, and the screen still updates correctly, every time, automatically.

### What Breaks Without This
Temporarily remove `DataContext = this;` from `InventoryPage`'s
constructor, leaving `ItemsSource="{Binding Items}"` in the XAML
untouched. Run the app and click Add. Real, representative failure:
nothing appears in the `ListBox` at all, and — worth noting directly —
**no error, no exception, no crash**. `{Binding Items}` silently resolves
to nothing, because there is no `DataContext` for it to look `Items` up
against; WPF's binding system fails silently by design (it logs a
binding error to Visual Studio's Output window, viewable but easy to
miss, rather than crashing the application over what might be a
temporary or intentional missing value). Restore `DataContext = this;`
and the list updates correctly again. This silent-failure behavior is
worth remembering precisely: a binding that "just doesn't show anything"
is one of the most common real WPF bugs, and the Output window's binding
errors are the actual place to look for it.

### Exercises

- Open Visual Studio's **Output** window while intentionally leaving
  `DataContext` unset (per the exercise above) and find the actual
  binding error WPF logs there — read it and connect its wording to what
  you already know is wrong.
- Temporarily change `DisplayMemberPath="Name"` to
  `DisplayMemberPath="Length"` (a real property `string` has, counting
  its characters) — wait, `InventoryItem` doesn't have a `Length`
  property directly; try it anyway, run the app, and read the exact
  binding error this specific mistake produces, then restore the correct
  value.
- In the `lab-binding` throwaway pattern, add a second button that calls
  `Names.Remove("Alpha")` instead of `Add`, confirm the `ListBox` removes
  exactly that row live, and connect this to `CollectionChanged`'s
  `Action: Remove` case from this lesson's second unit's lab output.

### Definition of Done
- [ ] `InventoryItem` implements `INotifyPropertyChanged` correctly.
- [ ] `InventoryPage` uses `ObservableCollection<InventoryItem>`, bound
      via `{Binding Items}`, with no manual `ItemListBox` manipulation
      anywhere in the code-behind.
- [ ] Adding items still works exactly as it did before, from the
      user's point of view.
- [ ] You reproduced the silent missing-`DataContext` failure and found
      the real binding error in Visual Studio's Output window.
- [ ] You can explain, in your own words, why `ObservableCollection<T>`
      and `INotifyPropertyChanged` solve two different problems, even
      though both use the same underlying `event` mechanism.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Replace manual ListBox rebuilding with ObservableCollection and data binding, so the view reacts to the model instead of being told about it"`.
