# Lesson 8: A Collection That Announces Itself — Connecting Discovery to WPF

**What you will build.** Two real upgrades to how this project shows
discovered files: the plain `ListBox`, populated one string at a time by
hand, becomes a `DataGrid` showing each `InputFile`'s real fields as real
columns; and the imperative `Items.Clear()`/`Items.Add()` calls an earlier
lesson wrote get replaced by a live `ObservableCollection<InputFile>`,
bound once, that the `DataGrid` watches and redraws itself in response to
— without any code ever telling it to redraw. What this lesson is
actually about goes past these two specific controls: every UI update in
this project until now has been "push"-shaped — code decides something
changed, and code explicitly tells a control to update itself, one method
call at a time. This lesson introduces the opposite shape: a UI that
watches a collection and reacts on its own, the instant that collection
itself changes, with no method call anywhere telling it "now go redraw."
This curriculum's own outline calls this lesson's result the project's
"first real vertical slice" — genuine end-to-end proof that discovery
(finding files), decision-making (which one is newest), and presentation
(showing all of it) now work together as one real feature.

**What you need to know first.** Lesson 5 — `DiscoveredFilesListBox`'s
`Items.Clear()`/`Items.Add()` population, and that lesson's own SE Lens,
which named the more powerful, bound alternative this lesson actually
builds. Lesson 6 — `IEnumerable<InputFile>`, the interface this lesson's
new collection type also happens to implement, among others.

**Terms used in this lesson.**

- **data binding** — a general WPF mechanism connecting a control's
  property directly to a source of data, so that changes to the data are
  reflected in the control automatically, without any code explicitly
  copying values across each time something changes. This lesson uses its
  simplest possible form — assigning a live collection object directly to
  a control's `ItemsSource` property, from code, with no XAML `{Binding}`
  markup at all — deferring that more elaborate syntax to whichever later
  lesson in this curriculum actually needs it. It exists because manually
  keeping a UI control in sync with changing data — writing an explicit
  update call every single place that data could possibly change — is
  repetitive and easy to forget in exactly one spot, leaving the screen
  quietly wrong; binding moves that responsibility onto the framework
  itself, once, rather than onto every future piece of code that touches
  the data.

**Objects and methods used.**

- **`DataGrid`**
  - *What it is:* a WPF control that displays a collection of objects as
    a real table — one row per object, one column per property, by
    default.
  - *Implementation:* `public class DataGrid : MultiSelector` in
    `System.Windows.Controls`, and `MultiSelector` itself inherits from
    `Selector`, which inherits from `ItemsControl` — the identical
    `Selector`/`ItemsControl` ancestry an earlier lesson already proved
    for `ListBox`, confirmed here, for `DataGrid` specifically, against
    the class's own published definition, not assumed by resemblance
    alone.
  - *Its use:* replaces the plain `ListBox` an earlier lesson used,
    giving each `InputFile`'s several real fields their own visible
    column instead of one hand-built, concatenated string.
  - *Type:* a public class, instantiated here via a XAML element, the
    same mechanical way every other control in this project has been.
  - *Responsibility:* generating and rendering a full table of rows and
    columns from whatever collection it's given, keeping each column
    lined up with the matching property across every row.
  - *Depends on:* something to actually display — an `ItemsSource`
    (below) — and, per `AutoGenerateColumns` (below), a real .NET type
    whose public properties it can inspect to build columns from.
  - *Connects to:* sits inside this project's outer `StackPanel`, in the
    exact position `DiscoveredFilesListBox` used to occupy; its
    `ItemsSource` property (below) is set from `MainWindow`'s
    constructor.
  - *Shape:* a considerably more capable replacement for `ListBox` in the
    exact same structural slot — proof that swapping which specific
    `ItemsControl` a project uses doesn't require touching anything
    around it, the same lesson an earlier Concept Unit already drew
    between `StackPanel` and `Grid`.
- **`DataGrid.AutoGenerateColumns`**
  - *What it is:* the property controlling whether `DataGrid` builds its
    own columns automatically, one per public property of whatever type
    it's displaying.
  - *Implementation:* `public bool AutoGenerateColumns { get; set; }`,
    confirmed against the property's own published definition — its
    documented default is already `true`, meaning this lesson's explicit
    `AutoGenerateColumns="True"` restates the default rather than
    changing it, done here for clarity rather than necessity.
  - *Its use:* the reason this lesson needs to define zero columns by
    hand — every one of `InputFile`'s three properties (`Path`,
    `FileName`, `LastModified`) becomes its own column, with no markup
    naming any of them individually.
  - *Type:* an instance property.
  - *Responsibility:* deciding, once, at the moment a real `ItemsSource`
    is attached, whether to inspect that data's own shape and build
    matching columns, or to wait for columns to be defined by hand
    instead.
  - *Depends on:* a real `ItemsSource` actually being set — with nothing
    assigned yet, there's no type to inspect and nothing to generate
    columns from.
  - *Connects to:* read internally by `DataGrid`'s own column-generation
    logic, the moment `ItemsSource` (below) is assigned.
  - *Shape:* the one setting that makes this lesson's entire column
    layout free — no hand-written column definitions anywhere in this
    project's markup.
- **`DataGrid.IsReadOnly`**
  - *What it is:* the property controlling whether a user can edit cells
    directly in the grid.
  - *Implementation:* a settable `bool` property; `DataGrid`'s own
    default is editable (`false`) unless set otherwise.
  - *Its use:* set to `true` in this lesson's markup, since nothing in
    this project is prepared to handle a user editing a discovered file's
    name or timestamp directly in the grid — that was never a feature
    this project intended to offer.
  - *Type:* an instance property.
  - *Responsibility:* the single switch between "just display this data"
    and "let a user directly change cell values in place."
  - *Depends on:* nothing beyond the `DataGrid` instance existing.
  - *Connects to:* read internally by `DataGrid`'s own cell-editing
    logic.
  - *Shape:* a small but real correctness detail — without it, this
    project would silently let a user "edit" data that's actually
    read from the real filesystem and thrown away the instant a
    different folder is scanned.
- **`ObservableCollection<InputFile>`**
  - *What it is:* a growable, ordered collection — like `List<T>`,
    already fully explained in an earlier lesson — that additionally
    announces every change made to it, automatically.
  - *Implementation:* `public class ObservableCollection<T> :
    Collection<T>, INotifyCollectionChanged, INotifyPropertyChanged` in
    `System.Collections.ObjectModel` — confirmed against the class's own
    published definition. `INotifyCollectionChanged` declares one real
    member, a `CollectionChanged` event (below); a plain `List<T>` has no
    such event and no way to be extended to raise one after the fact.
  - *Its use:* this project's new, single, permanent home for whichever
    files are currently displayed — replacing the direct `Items.Add`/
    `Items.Clear()` calls an earlier lesson made straight against the
    `ListBox` itself.
  - *Type:* a public generic class, instantiated with `new
    ObservableCollection<InputFile>()`.
  - *Responsibility:* holding an ordered sequence of `InputFile`s, and
    raising a real, observable notification every single time that
    sequence is added to, removed from, or cleared.
  - *Depends on:* nothing beyond being constructed.
  - *Connects to:* constructed once, as a `readonly` field on
    `MainWindow`; assigned to `DiscoveredFilesGrid.ItemsSource` (below) in
    the constructor; mutated directly (via `Add` and `Clear`, both
    inherited from `Collection<T>`) inside `BrowseButton_Click`.
  - *Shape:* the actual mechanism underneath this lesson's entire "pull"
    model — a plain object with no idea any UI is watching it, that
    happens to announce its own changes to whoever's listening.
- **`ObservableCollection<T>.CollectionChanged`**
  - *What it is:* the event `ObservableCollection<T>` raises every time
    it's modified.
  - *Implementation:* `public event NotifyCollectionChangedEventHandler
    CollectionChanged`, declared to satisfy `INotifyCollectionChanged` —
    real, verified proof that it actually fires, with real details about
    what changed, comes from this lesson's own throwaway console check,
    below: adding an item raised it with `Action=Add`; clearing the whole
    collection raised it once more, with `Action=Reset`.
  - *Its use:* this lesson's own project code never subscribes to this
    event by hand — `DataGrid`, internally, is the one actually listening,
    the instant `ItemsSource` is assigned to something that raises it.
  - *Type:* an instance event.
  - *Responsibility:* notifying every subscriber, automatically, of
    exactly what changed and how, any time this collection's contents
    change at all.
  - *Depends on:* something actually calling `Add`, `Remove`, `Clear`, or
    another mutating member.
  - *Connects to:* raised internally, from inside `ObservableCollection
    <T>`'s own `Add`/`Clear` implementations; subscribed to internally by
    `DataGrid` once `ItemsSource` is set to this collection — not by any
    line of code this project itself writes.
  - *Shape:* the one real difference between this lesson's collection and
    an earlier lesson's plain `List<T>` — everything else about how it's
    used (`Add`, `Clear`, `foreach`) is identical.
- **`ItemsControl.ItemsSource`**
  - *What it is:* the property that connects an `ItemsControl` (including
    `DataGrid`) to a real, external collection it should display.
  - *Implementation:* `public System.Collections.IEnumerable ItemsSource
    { get; set; }`, declared on `ItemsControl` itself (inherited,
    unchanged, by every one of its subclasses, `DataGrid` included) —
    confirmed against the property's own published definition. Its
    declared type is the plain, **non-generic `System.Collections.
    IEnumerable`** — an older interface, predating generics, representing
    "a sequence of *something*," with no promise about what type each
    element actually is — not the generic `IEnumerable<T>` an earlier
    lesson's own `NewestFileResolver` uses. `ObservableCollection
    <InputFile>` legally satisfies both interfaces at once, which is
    exactly why assigning it here compiles with no cast or conversion
    needed.
  - *Its use:* the one line, in this lesson's rewritten constructor, that
    connects `DiscoveredFilesGrid` to `_discoveredFiles` for the entire
    lifetime of the window.
  - *Type:* a settable instance property.
  - *Responsibility:* remembering which real collection this control is
    currently displaying, and, per its documented contract, watching for
    `INotifyCollectionChanged` on whatever it's given, to redraw
    automatically when that collection changes.
  - *Depends on:* nothing to be assigned initially — an `ItemsControl`
    with no `ItemsSource` set simply shows nothing.
  - *Connects to:* set once, in `MainWindow`'s constructor, to
    `_discoveredFiles`; from that point on, every future change to
    `_discoveredFiles` is what actually drives what `DiscoveredFilesGrid`
    shows.
  - *Shape:* the actual seam this lesson's whole "pull" model runs
    through — one property assignment, made once, replacing every future
    manual "now update the UI" call an earlier lesson needed instead.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`ItemsControl.Items`**
  - *What it is:* the property an earlier lesson used directly, to add
    and clear rows by hand.
  - *Implementation:* unchanged from an earlier lesson's own full
    treatment — `public ItemCollection Items { get; }` — but its real,
    documented behavior once `ItemsSource` is also set changes
    completely: per `ItemsSource`'s own official documentation, "when the
    `ItemsSource` property is set, the `Items` collection is made
    read-only and fixed-size." This project's code no longer touches
    `Items` on `DiscoveredFilesGrid` at all, specifically because doing so
    would now be illegal.
  - *Its use:* not used anywhere in this lesson's new code — named here
    only to explain why the earlier lesson's own `Items.Add`/`Items.
    Clear()` pattern had to be fully replaced, not merely adapted, once
    `ItemsSource` entered the picture.
  - *Type:* an instance property.
  - *Responsibility:* unchanged in general, but functionally disabled for
    direct mutation the moment `ItemsSource` is in use.
  - *Depends on:* whether `ItemsSource` happens to be set — the same
    property, with two genuinely different real behaviors depending on
    that one fact.
  - *Connects to:* nothing, in this lesson's own code — its previous
    caller, `BrowseButton_Click`, is rewritten in this lesson's final
    Concept Unit to stop calling it entirely.
  - *Shape:* a real, documented trap for anyone who adds `ItemsSource`
    to an existing `ItemsControl` without also removing whatever code
    used to call `Items` directly — exactly the change this lesson makes
    deliberately, not by accident.

---

## Concept Unit: `DataGrid` — A Control That Draws Its Own Columns

### The Problem

`DiscoveredFilesListBox`, from an earlier lesson, shows exactly one
hand-built string per file — `$"{file.FileName} — {file.LastModified}"`
— meaning `InputFile.Path` is never shown anywhere at all, and the two
fields that are shown are permanently fused into one line of text a user
can't sort or scan independently. `InputFile` genuinely has three real
fields; the UI showing it should be able to show all three, as three real
columns, without this project hand-writing string formatting for each
row.

> `ListBox` shows one line of whatever content it's given per item — a
> string, in this project's case so far. If a WPF control existed whose
> entire job was showing a *whole object's* several properties, one per
> column, automatically, what would it need to know about that object
> that a plain string never could tell it?

### Introduce the Concept in Isolation

Two bare XAML elements, neither executed standalone — the same
element-becomes-object mapping already proven repeatedly since an early
lesson, applied here to a genuinely new control:

```xml
<ListBox/>
```

```xml
<DataGrid AutoGenerateColumns="True"/>
```

Both map onto constructing a real object — `new ListBox()` and `new
DataGrid()` respectively — the identical mapping already proven true for
every XAML element in this project. The genuine difference isn't
syntactic; it's what each class actually does with whatever it's later
given to display, confirmed for real, for `DataGrid` specifically,
against the class's own published definition (Header above): `DataGrid`
inherits, through `MultiSelector` and `Selector`, from the same
`ItemsControl` base `ListBox` already shares — meaning everything an
earlier lesson already proved about `ItemsControl.Items` and
`ItemsSource` (this lesson's own subject, next Concept Unit) applies to
`DataGrid` too, automatically, with no new plumbing needed.

### Discard the Throwaway Example

Neither bare element above is the real markup this lesson writes — the
real element (below) also sets `IsReadOnly` and carries a real
`x:Name`. These two lines existed only to isolate the comparison and are
discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `MainWindow.xaml`.
- **Change type** — replace (the `ListBox` element from an earlier lesson
  with a `DataGrid`).
- **Location** — inside the outer vertical `StackPanel`, in the exact
  position `DiscoveredFilesListBox` occupied.
- **Dependencies** — the vertical `StackPanel` structure an earlier
  lesson already established.

### The New Code

```xml
<DataGrid x:Name="DiscoveredFilesGrid" AutoGenerateColumns="True" IsReadOnly="True"/>
```

### The Updated Project

The full `MainWindow.xaml`, with the replaced element marked:

```xml
1  <Window x:Class="MastercamGenerator.MainWindow"
2          xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
3          xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
4          Title="Mastercam Generator" Height="450" Width="800">
5      <Grid>
6          <StackPanel Orientation="Vertical">
7              <StackPanel Orientation="Horizontal">
8                  <TextBlock Text="Folder: "/>
9                  <TextBlock x:Name="FolderPathText" Text="(none selected)"/>
10                 <Button Content="Browse" Click="BrowseButton_Click"/>
11             </StackPanel>
12             <TextBlock x:Name="FilesFoundText" Text="Files Found: 0"/>
13             <TextBlock x:Name="NewestFileText" Text="Newest file: (none)"/>
14             <DataGrid x:Name="DiscoveredFilesGrid" AutoGenerateColumns="True" IsReadOnly="True"/>  // ← changed (was <ListBox x:Name="DiscoveredFilesListBox"/>)
15         </StackPanel>
16     </Grid>
17 </Window>
```

The outer `StackPanel`'s fourth child is now a `DataGrid` instead of a
`ListBox` — nothing else in this file changed at all.

### Mechanical Walkthrough

1. `<DataGrid` — the **XML element** (already fully explained) mapping
   onto `new DataGrid()`, this lesson's own subject (Header above).
2. `x:Name="DiscoveredFilesGrid"` — the **`x:Name` directive** (already
   fully explained), generating a real, typed field this project's
   code-behind reaches in this lesson's later Concept Units — the exact
   same mechanism already proven for `FolderPathText` and every other
   named element in this project.
3. `AutoGenerateColumns="True"` — an **XML attribute** (already fully
   explained), setting **`DataGrid.AutoGenerateColumns`** (Header above)
   to its own documented default value, stated here explicitly for
   clarity rather than to change anything.
4. `IsReadOnly="True"` — sets **`DataGrid.IsReadOnly`** (Header above) to
   `true`, disabling in-grid editing for data this project only ever
   reads from the real filesystem.

### CS Lens

`DataGrid` inheriting the same `ItemsControl` ancestry `ListBox` already
has is **polymorphism through a shared base class** — the identical idea
an earlier lesson already named for `StackPanel` and `Grid` sharing
`Panel`: two classes that look and behave very differently on the
surface, satisfying the same underlying role — "something that can be
given a collection and shown to a user" — because both ultimately inherit
from the same ancestor. Also recognized in: a media player accepting an
MP3 file, a WAV file, or a streaming URL as equally valid `AudioSource`s,
despite each requiring entirely different internal handling; an e-commerce
checkout accepting a credit card, PayPal, or a gift card as equally valid
`PaymentMethod`s.

### SE Lens

The alternative — keeping `ListBox`, and manually formatting each
`InputFile`'s three fields into columns using nested `StackPanel`s and
multiple `TextBlock`s per row — was available, and would work, at the
cost of this project hand-building, and hand-maintaining, layout logic
that `DataGrid`'s own `AutoGenerateColumns` already provides for free, for
any type at all, not just `InputFile` specifically. The real tradeoff:
`AutoGenerateColumns` produces column headers directly from `InputFile`'s
own property names (`Path`, `FileName`, `LastModified`) — convenient, but
not something this project can restyle, reorder, or hide a column from
without turning `AutoGenerateColumns` off and defining columns by hand
instead, a real decision to make later if this project's own display
needs ever outgrow the free, automatic version.

### Commands Needed

None yet beyond `dotnet build`, run once for this lesson's whole batch of
changes at the end.

### Run It

Predicted with the same confidence already established for every other
XAML element/attribute mapping in this project — this project's real,
full build, covering this exact markup, is shown at this lesson's end.

### Connecting Back

`DiscoveredFilesGrid` now exists, real and named, in this project's
window — currently showing nothing, since nothing has told it what to
display yet. That's this lesson's next two Concept Units.

---

## Concept Unit: `ObservableCollection<T>` — A Collection That Announces Its Own Changes

### The Problem

An earlier lesson's `List<InputFile>`, `discoveredFiles`, is a perfectly
good collection — but nothing about a plain `List<T>` can tell anything
else, automatically, the instant it changes. Every UI update in this
project so far has had to be driven by hand: code explicitly calling
`Items.Add` once per file, immediately after building the list, because
nothing would happen otherwise. If this project ever wants a control to
simply *watch* a collection and stay in sync with it on its own, a plain
`List<T>` can't do that — it has no way to say anything happened at all.

> If a `List<T>` had no way to notify anything when an item was added to
> it, what would a collection type need to have *instead*, to make "a
> control watches this collection and redraws itself automatically" even
> possible in principle? Would every collection need this, or only ones
> meant to be watched by something else?

### Introduce the Concept in Isolation

A real, throwaway console project, scaffolded and run for real — because
whether a collection genuinely announces its own changes, and exactly
what it reports when it does, are real behavioral claims worth proving,
not asserting from a class's name alone:

```csharp
var observable = new ObservableCollection<string>();
observable.CollectionChanged += (sender, e) =>
{
    Console.WriteLine($"CollectionChanged fired: Action={e.Action}, NewItems count={e.NewItems?.Count}");
};

observable.Add("one.xml");
observable.Add("two.xml");
observable.Clear();
```

Real, captured output from running this exact code (.NET SDK 10.0.301):

```
CollectionChanged fired: Action=Add, NewItems count=1
CollectionChanged fired: Action=Add, NewItems count=1
CollectionChanged fired: Action=Reset, NewItems count=
```

This proves, for real, that `ObservableCollection<T>` genuinely raises a
real event on every mutation — `Add` reports `Action=Add` with exactly
one new item each time; `Clear()` reports `Action=Reset`, with no
specific new items to list (the entire collection was simply emptied, not
one item removed) — and that a plain `List<string>`, with no such event
at all, has nothing equivalent to subscribe to in the first place.

### Discard the Throwaway Example

`observable`, its lambda, and the console project it ran inside were all
deleted immediately after this real output was captured — this project's
own `_discoveredFiles` (below) is a real, permanent field, not a
throwaway.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `MainWindow.xaml.cs`.
- **Change type** — add (a new `using` directive and a new field).
- **Location** — the `using` block at the top of the file, and the field
  list, alongside `_fileSource`, `_directoryScanner`, and
  `_newestFileResolver`.
- **Dependencies** — `InputFile` (an earlier lesson's own record).

### The New Code

```csharp
using System.Collections.ObjectModel;
```

```csharp
private readonly ObservableCollection<InputFile> _discoveredFiles = new ObservableCollection<InputFile>();
```

### The Updated Project

The full `MainWindow.xaml.cs`, with the new lines marked:

```csharp
1  using System.Collections.ObjectModel;                                                   // ← new
2  using System.Text;
3  using System.Windows;
4  using System.Windows.Controls;
5  using System.Windows.Data;
6  using System.Windows.Documents;
7  using System.Windows.Input;
8  using System.Windows.Media;
9  using System.Windows.Media.Imaging;
10 using System.Windows.Navigation;
11 using System.Windows.Shapes;
12 
13 namespace MastercamGenerator;
14 
15 public partial class MainWindow : Window
16 {
17     private readonly FileSource _fileSource = new FileSource();
18     private readonly DirectoryScanner _directoryScanner = new DirectoryScanner();
19     private readonly NewestFileResolver _newestFileResolver = new NewestFileResolver();
20     private readonly ObservableCollection<InputFile> _discoveredFiles = new ObservableCollection<InputFile>();  // ← new
21 
22     public MainWindow()
23     {
24         InitializeComponent();
25     }
26 
27     private void BrowseButton_Click(object sender, RoutedEventArgs e)
28     {
29         string? folder = _fileSource.SelectDirectory();
30         if (folder != null)
31         {
32             FolderPathText.Text = folder;
33 
34             List<InputFile> discoveredFiles = _directoryScanner.ScanDirectory(folder);
35             DiscoveredFilesListBox.Items.Clear();
36             foreach (var file in discoveredFiles)
37             {
38                 DiscoveredFilesListBox.Items.Add($"{file.FileName} — {file.LastModified}");
39             }
40             FilesFoundText.Text = $"Files Found: {discoveredFiles.Count}";
41 
42             InputFile? newestFile = _newestFileResolver.FindNewest(discoveredFiles);
43             if (newestFile != null)
44             {
45                 NewestFileText.Text = $"Newest file: {newestFile.FileName} (Modified: {newestFile.LastModified})";
46             }
47             else
48             {
49                 NewestFileText.Text = "Newest file: (none)";
50             }
51         }
52     }
53 }
```

`MainWindow` now has a real, permanent `ObservableCollection<InputFile>`
— still empty, and still not connected to `DiscoveredFilesGrid` or used
anywhere in `BrowseButton_Click` yet. This file, shown whole above, does
not actually compile at this exact point: lines 35 and 38 still reference
`DiscoveredFilesListBox`, a field this lesson's first Concept Unit already
renamed out of existence in `MainWindow.xaml`. That's expected, and
temporary — this lesson's final Concept Unit replaces those exact lines;
only the complete, final version at the end of this lesson is meant to
build.

### Mechanical Walkthrough

1. `using System.Collections.ObjectModel;` — a **`using` directive**
   (already fully explained), bringing `ObservableCollection<T>` (Header
   above) into scope by its short name — needed because, unlike `System.
   Collections.Generic` (already proven, in an earlier lesson, to be one
   of this project's own implicit usings), `System.Collections.
   ObjectModel` is not.
2. `private readonly ObservableCollection<InputFile> _discoveredFiles =
   new ObservableCollection<InputFile>();` — the identical field pattern
   already established, in earlier lessons, for every other application
   dependency on `MainWindow`: an **access modifier**, the **`readonly`
   modifier**, a **generic type** (Header above's own subject this time,
   filled in with `InputFile`), and a field initializer — all already
   fully explained.

### CS Lens

`ObservableCollection<T>` raising `CollectionChanged` for anyone
subscribed is the **Observer pattern**, a real, named software design
pattern already proven once in this project, for a completely different
kind of subject: an earlier lesson's `Button.Click` — one object
maintaining a list of interested parties and notifying them, automatically,
whenever its own relevant state changes, without needing to know anything
about who's listening or why. There, the subject was a UI control and the
event was a user's click; here, the subject is a plain collection with no
UI of its own at all, and the event is its own contents changing — proof
that the same pattern recurs for reasons that have nothing to do with user
interfaces specifically. Also recognized, again, in: a stock ticker
notifying every subscribed display; a filesystem watcher (a concept this
curriculum's own outline names for a future lesson) notifying registered
callbacks when a file appears.

### SE Lens

The alternative — keeping a plain `List<InputFile>` and manually calling
some "please refresh yourself" method on `DiscoveredFilesGrid` every
single place the list changes — was available, and is exactly the shape
an earlier lesson's `Items.Add`/`Items.Clear()` calls already used. The
real cost of that approach, which only grows as a project grows: every
future piece of code that ever adds or removes a discovered file has to
remember to also call the matching UI update, in the same place, every
time, forever — one missed call anywhere is a real, silent bug where the
screen quietly stops matching reality. `ObservableCollection<T>` moves
that responsibility into the collection itself, once, so no future caller
of `Add` or `Clear` can ever forget it — the tradeoff being that "what
makes this row appear on screen" is no longer visible by reading
`BrowseButton_Click` alone; it now requires knowing that `ItemsSource`
(this lesson's next Concept Unit) was pointed at this exact collection
somewhere else in the file.

### Commands Needed

- `dotnet new console -n ScratchObservableCheck` — scaffolds this unit's
  own throwaway proof project.
- `dotnet run` — runs it, producing the real output quoted above.

### Run It

Shown above, in full, as real captured output — not predicted, since
whether an event genuinely fires, and with exactly what information, is
precisely the kind of "hidden behavior" this curriculum's own schema
requires proof for, not a confident description of what a class's name
suggests it probably does.

### Connecting Back

`_discoveredFiles` now exists as a real, permanent, change-announcing
collection. Nothing is watching it yet — that's this lesson's next
Concept Unit.

---

## Concept Unit: Binding `ItemsSource` — The Pull Model

### The Problem

`DiscoveredFilesGrid` (first Concept Unit) and `_discoveredFiles` (second
Concept Unit) both exist, fully built, with no connection between them at
all. Nothing yet tells the grid "watch this specific collection."

> `ItemsControl.Items`, from an earlier lesson, is a collection you add
> individual items *into*, directly, one at a time. If instead you wanted
> to hand an `ItemsControl` an entire, already-existing collection, and
> have the control display *that* collection directly — not a separate
> copy of it — what shape would the property for that even need: a
> collection you write items into, or something you assign a whole
> collection *to*, in one step?

### Introduce the Concept in Isolation

No new isolated example — assigning one property, once, in a constructor
is not a new mechanism this project hasn't already used repeatedly (every
`readonly` field's own initializer already does exactly this kind of
one-time assignment); the genuinely new fact here is `ItemsSource`'s own
real, documented contract, quoted directly, in this unit's own Mechanical
Walkthrough below, from the property's official published documentation
— not something a throwaway example could add anything to.

### Discard the Throwaway Example

Not applicable — no throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `MainWindow.xaml.cs`.
- **Change type** — add (one line inside the constructor).
- **Location** — inside `MainWindow`'s constructor, immediately after
  `InitializeComponent();`.
- **Dependencies** — this lesson's `DiscoveredFilesGrid` (first Concept
  Unit) and `_discoveredFiles` (second Concept Unit).

### The New Code

```csharp
DiscoveredFilesGrid.ItemsSource = _discoveredFiles;
```

### The Updated Project

The full `MainWindow.xaml.cs` constructor, with the new line marked:

```csharp
1  public MainWindow()
2  {
3      InitializeComponent();
4      DiscoveredFilesGrid.ItemsSource = _discoveredFiles;    // ← new
5  }
```

`MainWindow`'s constructor now permanently connects the grid to the
collection, once, for the entire lifetime of the window — nothing about
this line ever needs to run again, no matter how many times a folder gets
scanned afterward.

### Mechanical Walkthrough

1. `DiscoveredFilesGrid.ItemsSource = _discoveredFiles;` — assigns
   **`ItemsControl.ItemsSource`** (Header above) — a property `DataGrid`
   inherits, unchanged, from `ItemsControl` — to `_discoveredFiles`, the
   `ObservableCollection<InputFile>` field from this lesson's second
   Concept Unit. Because `ObservableCollection<T>` implements both the
   plain, non-generic `IEnumerable` `ItemsSource` actually requires and
   `INotifyCollectionChanged`, this one assignment does two things at
   once: it tells `DataGrid` what to display right now (nothing, since
   `_discoveredFiles` starts empty), and it makes `DataGrid` start
   watching `_discoveredFiles`'s own `CollectionChanged` event (this
   lesson's second Concept Unit) internally, for as long as this
   assignment holds.

### CS Lens

This one line is **data binding** (Header above) in its simplest possible
form — connecting a control directly to a live data source, from code,
with no intermediate markup. Also recognized in: a spreadsheet cell
displaying a formula's live result, updating automatically whenever any
cell that formula depends on changes; a car's speedometer needle
connected directly to the drivetrain's real rotational speed, moving on
its own as that speed changes, with no separate step reading a value and
manually repositioning the needle; a live sports scoreboard wired directly
to the official scoring system, updating the instant a real score changes,
with no operator manually typing each new number in.

### SE Lens

The alternative — WPF's more elaborate XAML `{Binding}` markup syntax,
typically paired with a separate `DataContext` — was available, and is
genuinely more powerful: among other things, it supports binding
declared entirely in markup, with no code-behind line needed at all. It's
not used here because it also typically expects the bound source to
already exist as a property on some object assigned to `DataContext` —
real, additional structure this project doesn't have yet, and doesn't
need yet, since this lesson has exactly one collection, built once, in
one specific class, with nothing about it that needs to be swappable or
markup-declared. Reaching for the simpler, code-behind assignment now,
and for the more general `{Binding}` markup only once a real need for it
appears, mirrors this lesson's own earlier tool choices — the narrower
tool, chosen deliberately, before the more general one is actually
required.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with real confidence for the assignment mechanics themselves,
directly sourced from `ItemsSource`'s own official published
documentation, not from memory or resemblance to `Items`; this project's
real, full build, covering this exact line, is shown at this lesson's
end.

### Connecting Back

`DiscoveredFilesGrid` now watches `_discoveredFiles` permanently. The
final Concept Unit is what actually puts real files into that collection,
replacing an earlier lesson's direct calls against the grid itself.

---

## Concept Unit: Replacing Imperative Population With Collection Mutations

### The Problem

`BrowseButton_Click`, as an earlier lesson left it, still calls
`DiscoveredFilesListBox.Items.Clear()` and `DiscoveredFilesListBox.Items.
Add(...)` directly — code that, as of this lesson's first Concept Unit,
refers to a control (`DiscoveredFilesListBox`) that no longer exists in
this project's markup at all. Even setting that aside, this lesson's own
"Everything else" Header entry already named the real reason this code
has to change, not merely be renamed: once `ItemsSource` is set, per its
own official documentation, `Items` becomes read-only and fixed-size —
calling `Items.Add` on `DiscoveredFilesGrid` now would be a real, illegal
operation, not simply outdated.

> If `DiscoveredFilesGrid` is now permanently watching `_discoveredFiles`
> (this lesson's third Concept Unit), and every change to that collection
> is what actually drives what the grid shows, what should
> `BrowseButton_Click` mutate now — the grid directly, the way it always
> has, or the collection the grid is watching?

### Introduce the Concept in Isolation

No new isolated example — `_discoveredFiles.Clear()` and `_discoveredFiles
.Add(...)` are mechanically identical to `List<T>`'s own `Add`/`Clear`
(both already fully explained, in an earlier lesson, for `List<
InputFile>` specifically) — `ObservableCollection<T>` inherits both from
`Collection<T>` without changing their basic shape at all; the only
difference, this lesson's own second Concept Unit already proved for
real, is that each call also raises `CollectionChanged` afterward.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `MainWindow.xaml.cs`.
- **Change type** — replace (the `DiscoveredFilesListBox.Items` calls
  with `_discoveredFiles` mutations).
- **Location** — inside `BrowseButton_Click`, the block already
  populating discovered files.
- **Dependencies** — this lesson's `_discoveredFiles` field (second
  Concept Unit) and its `ItemsSource` binding (third Concept Unit).

### The New Code

```csharp
_discoveredFiles.Clear();
foreach (var file in discoveredFiles)
{
    _discoveredFiles.Add(file);
}
```

### The Updated Project

The full `MainWindow.xaml.cs`, as it stands at the end of this lesson,
with every changed line marked:

```csharp
1  using System.Collections.ObjectModel;
2  using System.Text;
3  using System.Windows;
4  using System.Windows.Controls;
5  using System.Windows.Data;
6  using System.Windows.Documents;
7  using System.Windows.Input;
8  using System.Windows.Media;
9  using System.Windows.Media.Imaging;
10 using System.Windows.Navigation;
11 using System.Windows.Shapes;
12 
13 namespace MastercamGenerator;
14 
15 public partial class MainWindow : Window
16 {
17     private readonly FileSource _fileSource = new FileSource();
18     private readonly DirectoryScanner _directoryScanner = new DirectoryScanner();
19     private readonly NewestFileResolver _newestFileResolver = new NewestFileResolver();
20     private readonly ObservableCollection<InputFile> _discoveredFiles = new ObservableCollection<InputFile>();
21 
22     public MainWindow()
23     {
24         InitializeComponent();
25         DiscoveredFilesGrid.ItemsSource = _discoveredFiles;
26     }
27 
28     private void BrowseButton_Click(object sender, RoutedEventArgs e)
29     {
30         string? folder = _fileSource.SelectDirectory();
31         if (folder != null)
32         {
33             FolderPathText.Text = folder;
34 
35             List<InputFile> discoveredFiles = _directoryScanner.ScanDirectory(folder);
36             _discoveredFiles.Clear();                                                    // ← changed (was DiscoveredFilesListBox.Items.Clear())
37             foreach (var file in discoveredFiles)
38             {
39                 _discoveredFiles.Add(file);                                              // ← changed (was DiscoveredFilesListBox.Items.Add(...))
40             }
41             FilesFoundText.Text = $"Files Found: {discoveredFiles.Count}";
42 
43             InputFile? newestFile = _newestFileResolver.FindNewest(discoveredFiles);
44             if (newestFile != null)
45             {
46                 NewestFileText.Text = $"Newest file: {newestFile.FileName} (Modified: {newestFile.LastModified})";
47             }
48             else
49             {
50                 NewestFileText.Text = "Newest file: (none)";
51             }
52         }
53     }
54 }
```

`BrowseButton_Click` now touches `_discoveredFiles` directly and never
mentions `DiscoveredFilesGrid` at all — the grid updates purely as a
consequence of watching a collection this method mutates, the entire
point of this lesson's earlier Concept Units.

### Mechanical Walkthrough

1. `_discoveredFiles.Clear();` — calls `Clear()`, inherited by
   **`ObservableCollection<InputFile>`** (Header above) from `Collection
   <T>`, removing every element currently in the collection — and, per
   this lesson's second Concept Unit's own real proof, raising
   `CollectionChanged` with `Action=Reset` the instant it runs.
2. `foreach (var file in discoveredFiles)` — the same **`foreach` loop**
   (already fully explained) over `discoveredFiles`, the plain
   `List<InputFile>` `DirectoryScanner` produced — unchanged from an
   earlier lesson.
3. `_discoveredFiles.Add(file);` — calls `Add(T)`, also inherited from
   `Collection<T>`, appending one real `InputFile` to `_discoveredFiles`
   — and, per this lesson's second Concept Unit, raising
   `CollectionChanged` with `Action=Add` each time it runs, once per
   file.

### CS Lens

This unit is the concrete arrival of the **pull model**, already named as
a real architectural alternative in an earlier lesson's own SE Lens:
`BrowseButton_Click` no longer pushes anything at `DiscoveredFilesGrid`
directly — it only ever touches `_discoveredFiles`, and the grid pulls
its own updated contents by watching that collection change, entirely on
its own. Also recognized, again, in: a browser polling — or, in the push
model's own case, being pushed to — a server; here, specifically, the
pull side: a subscriber reading from a shared, published log at its own
pace, rather than the publisher pushing each entry to it directly. The
push/pull framing an earlier lesson introduced now has both of its real
halves demonstrated, inside the same project, on the same feature.

### SE Lens

A real, honest cost of this lesson's whole design: `BrowseButton_Click`
still builds a temporary `List<InputFile>`, `discoveredFiles`, from
`DirectoryScanner`, and then copies every element out of it into
`_discoveredFiles` — two collections briefly holding the same data,
rather than `DirectoryScanner` populating `_discoveredFiles` directly.
This is deliberate, not an oversight: `DirectoryScanner.ScanDirectory`
(an earlier lesson's own class) has no reason to know `MainWindow` even
has a displayed collection, let alone which one — keeping it returning a
plain `List<InputFile>` preserves the exact dependency boundary an
earlier lesson already established, at the real, small cost of one extra
loop copying data from one collection into another.

### Commands Needed

None beyond this lesson's one shared `dotnet build`, run once, covering
every Concept Unit's changes together — shown next.

### Run It

Real, captured output from running `dotnet build` against this lesson's
complete, final `MainWindow.xaml` and `MainWindow.xaml.cs` (.NET SDK
10.0.301), unedited:

```
Determining projects to restore...
All projects are up-to-date for restore.
MastercamGenerator -> <project>\bin\Debug\net10.0-windows\MastercamGenerator.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:00.96
```

This one real build covers every Concept Unit in this lesson at once —
the new `DataGrid`, the `ObservableCollection<InputFile>` field, the
`ItemsSource` binding, and this unit's own rewritten `BrowseButton_Click`
all compiled together, in a single pass, per this curriculum's own
batching practice.

### Connecting Back

Every earlier Concept Unit in this lesson built one piece of a chain this
unit finally exercises for real: a more capable display control (first
unit) replaced the plain `ListBox`; a change-announcing collection
(second unit) gave that control something real to watch; a one-line
binding (third unit) connected the two, permanently. This unit is what
actually feeds that collection real data on every scan — completing this
curriculum's own "first real vertical slice": discovery, decision, and
display, working together as one real, observable feature.

---

## Connect the Pieces

Trace one real folder scan, from click to a fully redrawn grid, through
every piece this lesson built:

1. `BrowseButton_Click` scans the folder (an earlier lesson's own logic),
   producing a real `List<InputFile>`, `discoveredFiles`.
2. `_discoveredFiles.Clear()` (this lesson's fourth Concept Unit) empties
   the collection `DiscoveredFilesGrid` has been watching since this
   lesson's third Concept Unit's `ItemsSource` assignment — raising
   `CollectionChanged` with `Action=Reset` (proven for real in this
   lesson's second Concept Unit), which `DataGrid` receives internally,
   with no code in this project telling it to.
3. A `foreach` loop calls `_discoveredFiles.Add(file)` once per
   discovered file (fourth Concept Unit) — each call raising
   `CollectionChanged` with `Action=Add`, each one received by
   `DataGrid` the same way, automatically.
4. `DiscoveredFilesGrid` (first Concept Unit), watching all of this
   through `ItemsSource` (third Concept Unit), rebuilds its own rows in
   response — one row per `InputFile`, with real columns for `Path`,
   `FileName`, and `LastModified`, generated automatically by
   `AutoGenerateColumns` (first Concept Unit), with `IsReadOnly`
   preventing any accidental in-grid edits.
5. `FilesFoundText` and `NewestFileText` (both earlier lessons' own
   logic) update exactly as before — this lesson changed nothing about
   either.

Not one line inside this trace explicitly tells `DiscoveredFilesGrid` to
redraw itself. Every visible change to the grid happens purely because
something else changed a collection it was already watching — the
complete, working shape of the "pull" model this lesson set out to build,
and, per this curriculum's own outline, the first point where discovering
files, deciding which one matters, and actually displaying the result
work together as a single, real, observable feature.
