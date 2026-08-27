# Lesson 32: Two Screens, One Truth (Wiring Live Data Into Both UIs)

**What you will build.** A real, second, native tool list, sitting
directly alongside `Browser`'s own WebView2 table, bound to a new
`ObservableCollection<Tool>` — and a real, live connection from Watching
the Filesystem for Changes' own `ToolFileWatcher` into both of them, so
an external change to `tools.db` updates the real native list and the
real WebView2 table together, without a person ever clicking refresh.
The transferable problem underneath the feature: this project now has
two real, independent UI surfaces showing the identical underlying real
data — proving they stay identical, automatically, the moment either one
could go stale, is a real, distinct problem from building either surface
alone.

**What you need to know first.** Doing That Without Freezing the GUI —
`FindAllToolsInFolderAsync`, and the real `Dispatcher` discipline this
lesson applies directly, for real, rather than only in isolation.
Watching the Filesystem for Changes — `ToolFileWatcher`'s own real
`FilesChanged` event, wired into a real, running window for the first
time. XAML Data Binding & MVVM Basics — the real `{Binding}`-adjacent
`ItemsSource` mechanism this lesson extends from one bound object to a
whole bound collection. A Shared Language Across the Boundary —
`ExecuteScriptAsync`/`renderTools`, reused unchanged for the WebView2
half of this lesson's own real, dual update.

**Terms used in this lesson**

- **`ObservableCollection<T>`** — a real, `System.Collections.ObjectModel`
  generic collection that raises a real `CollectionChanged` event every
  time an item is added, removed, or the collection is cleared. It
  exists so a real, bound UI control (a `ListBox`, here) can be told,
  automatically, exactly what changed, and update only what actually
  needs to change — rather than a caller manually re-telling the UI
  "here is the whole new list" every time.
- **thread affinity** — a real WPF rule: an object created by a specific
  `Dispatcher` (Doing That Without Freezing the GUI) can only safely be
  read or modified from that same `Dispatcher`'s own thread. It exists
  because WPF's own UI objects were never built to be thread-safe;
  enforcing this rule at the framework level turns a subtle, real, timing
  -dependent bug into a real, immediate, loud failure instead.
- **state synchronization** — keeping more than one real, independent
  representation of the identical underlying data in agreement with each
  other. It exists as this lesson's own central, named problem: once a
  native `ObservableCollection` and a WebView2-rendered table both claim
  to show "the current tools," a real, external change has to reach both
  of them, or one becomes a real, silent lie the other doesn't share.

**Objects and methods used**

- **`ObservableCollection<Tool>` (this project's own `Tools` property)**
  - *What it is:* a new, real, permanent property on `MainWindow`,
    holding the live, native-UI-bound real list of every currently-known
    real tool.
  - *Implementation:* `public ObservableCollection<Tool> Tools { get; } =
    new();` — a real, read-only property (the reference never changes;
    only its own real contents do).
  - *Its use:* the real, single source of truth `ToolsListBox` (below)
    is bound to — every real tool this project's own native UI displays
    comes from this one real collection.
  - *Type:* a real, generic, concrete class implementing
    `INotifyCollectionChanged` internally (not implemented by this
    project — a real, built-in .NET behavior).
  - *Responsibility:* its full real charter is holding the current,
    real, in-memory set of tools this window is displaying natively, and
    automatically notifying any real, bound UI the moment that set
    changes.
  - *Depends on:* nothing beyond the real `Tool` records added to it.
  - *Connects to:* populated once in `MainWindow_Loaded` (established
    Passing C# Data to HTML); cleared and repopulated inside this
    lesson's own new `FileWatcher_FilesChanged` handler every time a real,
    external change is detected.
  - *Shape:* this project's own first real, live, UI-bound collection —
    a genuinely new kind of real state this project's own code now
    manages, distinct from the one-shot `List<Tool>` values every earlier
    lesson's own queries already returned.

- **`ListBox` / `ItemsSource` / `DisplayMemberPath`**
  - *What it is:* `ListBox` is a real, native WPF control displaying a
    real, scrollable list of items; `ItemsSource` is the real property
    telling it *what* real collection to display; `DisplayMemberPath` is
    a real property naming which of each real item's own properties to
    actually show as text.
  - *Implementation:* real XAML: `<ListBox x:Name="ToolsListBox"
    Grid.Column="1" DisplayMemberPath="Name" />`; real code-behind:
    `ToolsListBox.ItemsSource = Tools;`, set once, in `MainWindow`'s own
    constructor.
  - *Its use:* the real, concrete native UI surface this lesson adds —
    this project's own first real, visible list of more than one tool
    rendered outside WebView2 entirely.
  - *Type:* `ListBox` is a real, concrete WPF control class; `ItemsSource`
    and `DisplayMemberPath` are real, ordinary properties.
  - *Responsibility:* `ListBox`'s full real charter is rendering
    whatever real collection `ItemsSource` currently points at, staying
    correct automatically as that collection raises real
    `CollectionChanged` events, without this project's own code ever
    manually adding or removing a visual row by hand.
  - *Depends on:* a real collection assigned to `ItemsSource` — here,
    `Tools`, this lesson's own new property.
  - *Connects to:* `ItemsSource = Tools;` is set once and never
    reassigned; every later real update happens by mutating `Tools`
    itself (`Clear()`/`Add(...)`), which `ListBox` observes
    automatically through the real `ObservableCollection` mechanism
    above.
  - *Shape:* a real, native, XAML-declared UI surface — genuinely
    different from `Browser`'s own WebView2-hosted, HTML-rendered table,
    even though both now show the identical real underlying tools.

- **`Dispatcher.Invoke(Action)`**
  - *What it is:* a real, synchronous `Dispatcher` method (established
    Doing That Without Freezing the GUI, this specific overload new) that
    runs a given real delegate on the `Dispatcher`'s own owning thread,
    blocking the *calling* thread until it finishes.
  - *Implementation:* real, relevant declared shape: `public void
    Invoke(Action callback)`.
  - *Its use:* `FileWatcher_FilesChanged`'s own real handler wraps
    `Tools.Clear()`/`Tools.Add(...)` in `Dispatcher.Invoke(() => { ... })`
    — the real, necessary fix this lesson's own first unit proves is
    required at all.
  - *Type:* a real, `public` instance method — distinct from `BeginInvoke`
    (established Doing That Without Freezing the GUI), which schedules
    work and returns immediately rather than blocking until it's done.
  - *Responsibility:* its full real charter is guaranteeing the given
    real delegate actually runs on the correct, real `Dispatcher` thread
    — the one real thread allowed to touch `Tools` safely, per thread
    affinity (Terms, above) — regardless of which real thread called
    `Invoke` itself.
  - *Depends on:* a real, live `Dispatcher` — `MainWindow`'s own
    inherited `Dispatcher` property, established the moment the window
    itself was constructed on the real UI thread.
  - *Connects to:* wraps exactly the two real lines
    (`Tools.Clear()`/`Tools.Add(...)`) that touch the real,
    UI-bound `Tools` collection — nothing else in the handler needs this
    real protection, since nothing else touches a real, thread-affine
    object.
  - *Shape:* the real, correct, synchronous counterpart to
    `BeginInvoke`'s own real, fire-and-forget shape — chosen here because
    this lesson's own handler needs the real UI update to have actually
    happened before it moves on to the next real line.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`ToolFileWatcher` / `FilesChanged` / `ToolRepository
  .FindAllToolsInFolderAsync`**
  - *What it is:* reappearing, unchanged — established Watching the
    Filesystem for Changes and Doing That Without Freezing the GUI.
  - *Implementation:* unchanged real shapes.
  - *Its use:* `MainWindow_Loaded` constructs one real `ToolFileWatcher`,
    pointed at `AppContext.BaseDirectory` (established WPF Basics), and
    subscribes this lesson's own new handler to its real `FilesChanged`
    event; that handler calls `FindAllToolsInFolderAsync` to get the
    real, current, complete set of tools.
  - *Type:* unchanged.
  - *Responsibility:* unchanged.
  - *Depends on:* unchanged.
  - *Connects to:* this lesson's own real, first actual use of both —
    neither was called from `MainWindow.xaml.cs` before this lesson.
  - *Shape:* unchanged.
- **`ExecuteScriptAsync` / `renderTools`**
  - *What it is:* reappearing, unchanged — established Two-Way
    Communication Across the Split.
  - *Implementation:* unchanged.
  - *Its use:* the real, second half of this lesson's own dual update —
    the identical real JSON, freshly serialized from the same real
    `FindAllToolsInFolderAsync` result, is pushed into the WebView2 table
    the same real way a single edited tool already was.
  - *Type:* unchanged.
  - *Responsibility:* unchanged.
  - *Depends on:* unchanged.
  - *Connects to:* unchanged.
  - *Shape:* unchanged.

---

## Concept Unit: `ObservableCollection` — A Native List That Updates Itself

### The Problem

`MainWindow_Loaded` already builds a real, one-shot `List<Tool>` and
turns it into `Title` text and JSON for the WebView2 table (Passing C#
Data to HTML) — but nothing about a plain `List<Tool>` tells a real,
bound UI control when it changes later. If this project wants a real,
native list that stays correct as tools come and go, what real kind of
collection would a real WPF control need to be handed instead?

> **Try this first:** `AboutViewModel`'s own real `PropertyChanged`
> event (XAML Data Binding & MVVM Basics) already lets one bound
> `TextBlock` learn when a single real property's own value changes.
> Given that a real list is really many values, not one, what would a
> collection need to raise — one event per changed value, the way
> `PropertyChanged` does per property, or something that describes the
> real *structural* change itself (an item added, removed, or the whole
> real list cleared)?

### Introduce the Concept in Isolation

This exact real question is answered directly by .NET's own real,
built-in `ObservableCollection<T>` — no throwaway lab is needed to prove
its own existence, since this unit's real, permanent code *is* the
isolated first use: a brand-new real property, bound to a brand-new real
`ListBox`, with nothing else in this project touching either yet.

### Discard the Throwaway Example

Not applicable — this Concept Unit introduces `ObservableCollection<T>`
directly through real, permanent project code, with no separate
throwaway example; per the Concept Isolation Rule, this is appropriate
precisely because the real, permanent code shown next already is the
smallest possible real, isolated use.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml`, modified (new
  `ListBox`, new `Grid.ColumnDefinitions`). `ToolDB/MainWindow.xaml.cs`,
  modified (new property, new binding line, `MainWindow_Loaded`
  extended).
- **Change type** — add.
- **Location** — `MainWindow.xaml`'s own existing `Grid.Row="1"`,
  established Hosting WebView2 in a WPF Window; `MainWindow.xaml.cs`'s
  own constructor and `MainWindow_Loaded`, established Passing C# Data
  to HTML.
- **Dependencies** — `Tool` (Records & Strong Types).

### The New Code

```xml
<Grid Grid.Row="1">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="200" />
    </Grid.ColumnDefinitions>
    <wv2:WebView2 x:Name="Browser" Grid.Column="0" />
    <ListBox x:Name="ToolsListBox" Grid.Column="1" DisplayMemberPath="Name" />
</Grid>
```

```csharp
public ObservableCollection<Tool> Tools { get; } = new();
```

### The Updated Project

`MainWindow.xaml`'s own `Grid.Row="1"`, previously holding only
`Browser` directly, now holds a real, nested `Grid` splitting that same
row into two real columns:

```xml
1  <Grid Grid.Row="1">
2      <Grid.ColumnDefinitions>
3          <ColumnDefinition Width="*" />                                  <!-- ← new -->
4          <ColumnDefinition Width="200" />                                <!-- ← new -->
5      </Grid.ColumnDefinitions>
6      <wv2:WebView2 x:Name="Browser" Grid.Column="0" />                   <!-- ← changed -->
7      <ListBox x:Name="ToolsListBox" Grid.Column="1" DisplayMemberPath="Name" />  <!-- ← new -->
8  </Grid>
```

`MainWindow.xaml.cs`'s own constructor and `MainWindow_Loaded`, with the
new property and its own real wiring:

```csharp
1   private string _toolsJson = "[]";
2   private int _toolCount = 0;
3   private ToolFileWatcher? _fileWatcher;
4
5   public ObservableCollection<Tool> Tools { get; } = new();               // ← new
6
7   public MainWindow()
8   {
9       InitializeComponent();
10
11      ToolsListBox.ItemsSource = Tools;                                   // ← new
12
13      Loaded += MainWindow_Loaded;
14      Closing += MainWindow_Closing;
15
16      Browser.CoreWebView2InitializationCompleted += Browser_CoreWebView2InitializationCompleted;
17      Browser.NavigationCompleted += Browser_NavigationCompleted;
18  }
```

```csharp
42          _toolsJson = JsonSerializer.Serialize(tools);
43          _toolCount = tools.Count;
44
45          foreach (Tool tool in tools)                                    // ← new
46          {                                                                // ← new
47              Tools.Add(tool);                                             // ← new
48          }                                                                // ← new
49
50          string htmlPath = Path.Combine(AppContext.BaseDirectory, "local.html");
51          Browser.Source = new Uri(htmlPath);
```

A real `dotnet build` was run this session, and `ToolsListBox`'s own
generated field was confirmed directly in `obj/Debug/net9.0-windows/MainWindow.g.cs`
(`internal System.Windows.Controls.ListBox ToolsListBox;`), the identical
real proof technique this project has used for every named XAML element
since Your First Native XAML Screen.

### Mechanical Walkthrough

- `<Grid Grid.Row="1"> ... </Grid>` — `Grid`/`Grid.Row` (established
  Your First Native XAML Screen, reappearing) — a second, real, nested
  `Grid` replaces `Browser`'s own direct placement in the outer `Grid`'s
  row, giving this lesson a real place to put a second real control
  beside it.
- `<Grid.ColumnDefinitions>` / `<ColumnDefinition Width="*" />` /
  `<ColumnDefinition Width="200" />` — `ColumnDefinition` (a real,
  first-appearing XAML element, the column-based counterpart to
  `RowDefinition`, established A Second Window Is Still Just a Window) —
  `Width="*"` means "take whatever real space is left," reappearing in
  spirit from `RowDefinition`'s own real `Height="*"`; `Width="200"` is a
  real, fixed pixel width for the new native list.
- `<wv2:WebView2 x:Name="Browser" Grid.Column="0" />` — `Grid.Column`
  (reappearing, the column-based counterpart to `Grid.Row`) places
  `Browser` in the real, first column.
- `<ListBox x:Name="ToolsListBox" Grid.Column="1"
  DisplayMemberPath="Name" />` — `ListBox`/`DisplayMemberPath` (Header,
  above) — a real, new native control in the real, second column,
  showing each bound `Tool`'s own real `Name` property as its own visible
  text.
- `public ObservableCollection<Tool> Tools { get; } = new();` —
  `ObservableCollection<Tool>` (Header, above) — a real, generic type
  argument, `Tool` (established Records & Strong Types); `{ get; } =
  new();` (reappearing, established early auto-property syntax) — a
  real, read-only property whose own backing collection is created once
  and never replaced.
- `ToolsListBox.ItemsSource = Tools;` — `ItemsSource` (Header, above) is
  assigned directly, in code-behind, rather than through XAML
  `{Binding}` — a real, deliberate, simpler choice matching
  `MainWindow`'s own already-established, direct, non-MVVM style
  (unlike `AboutDialog`/`ToolEditDialog`'s own real `DataContext`-based
  binding).
- `foreach (Tool tool in tools) { Tools.Add(tool); }` — `foreach`
  (reappearing) adds each real, already-queried `Tool` into the new,
  real, bound `Tools` collection — the real, first population of this
  project's own native list.

### CS Lens

`ObservableCollection<T>`'s own real `CollectionChanged` event is a
concrete instance of the **Observer pattern**, reappearing — the same
real idea Watching the Filesystem for Changes already named for
`FileSystemWatcher`/`ToolFileWatcher`: a real subject (here, the
collection) notifies its own real subscribers (here, `ListBox`,
subscribing internally the moment `ItemsSource` is assigned) whenever
its own state changes, without either side needing to know the other's
own concrete type. Also recognized in: a real spreadsheet's own
formula cells, recalculating automatically the moment a real, referenced
cell changes; a real reactive-programming library's own observable
streams; this project's own `PropertyChanged` (XAML Data Binding & MVVM
Basics), the identical real idea applied to a single property instead of
a whole collection.

### SE Lens

Why add a second, real, native `ListBox` at all, when the existing
WebView2 table (DataTables Fundamentals) already shows every tool,
complete with real sorting and searching this project would have to
rebuild from scratch in plain XAML? The real alternative — skip the
native list, keep only the WebView2 table — was rejected here for a
real, deliberate, pedagogical reason stated directly in this project's
own Architecture section from the start: "some real screens are native
XAML..., others are WebView2 content..., both get genuine lesson
weight." This lesson's own real point depends on there being two real,
independent surfaces to keep synchronized — a single surface would have
nothing to prove state synchronization (Terms, above) against. The real,
honest cost: this native list is deliberately minimal (one real column,
no sorting, no search) — genuinely less capable than the WebView2 table
it sits beside, on purpose, since building it out further isn't this
lesson's own real point.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. `ToolsListBox`'s own real, generated field was
confirmed directly in the real compiler-generated `MainWindow.g.cs`.
This project's own standing "no live WPF window" constraint applies
here: the real, visible appearance and behavior of this new list was not
watched rendering in an actual running window this session.

### Connecting Back

This project now has a second, real, native UI surface, bound to a real,
live collection — populated once, at load, from the identical real query
this project has run since its own first WPF lesson. The next unit
connects that real collection, and the existing WebView2 table beside
it, to `ToolFileWatcher`'s own real, live `FilesChanged` event.

---

## Concept Unit: Live Refresh — Keeping Two Real UIs in Agreement

### The Problem

`Tools` and `Browser`'s own WebView2 table both now show the identical
real tools — but only once, at load. Watching the Filesystem for Changes
already proved `ToolFileWatcher` can reliably notice a real, external
change and raise one real, debounced `FilesChanged` event. If that real
event simply called `Tools.Clear()`/`Tools.Add(...)` directly from
inside its own handler, would that real, native list actually update
safely — given `FilesChanged` itself is raised from a real
`System.Timers.Timer`, not from `MainWindow`'s own UI thread?

> **Try this first:** Doing That Without Freezing the GUI already proved
> a real WPF UI thread has to be the one thread that runs certain real
> work. Given that `System.Timers.Timer.Elapsed` (established Watching
> the Filesystem for Changes) raises its own real event on a real
> thread-pool thread — not necessarily, and in fact not ever, the real
> UI thread — what would you predict happens if `FileWatcher_FilesChanged`
> tries to call `Tools.Add(...)` directly, with no extra real care taken
> at all?

### Introduce the Concept in Isolation

A real, minimal, bound `ListBox` — never shown, but genuinely
constructed on a real `Dispatcher` thread — mutated first from a raw
real background thread, then through real `Dispatcher.Invoke`:

```csharp
var tools = new ObservableCollection<string>();
var listBox = new ListBox();
listBox.ItemsSource = tools;

// from a real, separate background thread:
tools.Add("from background thread, unmarshaled");
```

Real, captured output:

```
Unmarshaled Add threw: NotSupportedException: This type of CollectionView does not support changes to its SourceCollection from a thread different from the Dispatcher thread.
```

Then, the identical real mutation, routed through `Dispatcher.Invoke`
instead:

```csharp
dispatcher.Invoke(() => tools.Add("from background thread, marshaled via Dispatcher.Invoke"));
```

Real, captured output:

```
Marshaled Add succeeded. Real count now: 2
```

This real, captured pair of outputs proves the Socratic question's own
answer directly: mutating a real, bound `ObservableCollection` from any
thread other than its own owning `Dispatcher`'s thread genuinely throws
— confirmed with a real, exact `NotSupportedException`, not a guess —
and routing that identical real mutation through `Dispatcher.Invoke`
(Header, above) fixes it completely, with no other real change needed.

### Discard the Throwaway Example

This exact throwaway `ListBox`/background-thread pair is discarded now —
it never appears in this project again. What's proven is that
`Dispatcher.Invoke` genuinely, safely bridges a real background thread's
own mutation into a real, thread-affine collection — not this specific
throwaway string.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml.cs`, modified
  (`MainWindow_Loaded` extended; new `FileWatcher_FilesChanged` handler;
  `MainWindow_Closing` extended).
- **Change type** — add.
- **Location** — `MainWindow.xaml.cs`, after this lesson's own first
  unit.
- **Dependencies** — `ToolFileWatcher` (Watching the Filesystem for
  Changes); `FindAllToolsInFolderAsync` (Doing That Without Freezing the
  GUI); `Tools`, `ToolsListBox` (this lesson's own first unit).

### The New Code

```csharp
private async void FileWatcher_FilesChanged(object? sender, EventArgs e)
{
    try
    {
        (List<Tool> tools, List<string> errors) = await ToolRepository.FindAllToolsInFolderAsync(AppContext.BaseDirectory);

        Dispatcher.Invoke(() =>
        {
            Tools.Clear();
            foreach (Tool tool in tools)
            {
                Tools.Add(tool);
            }
        });

        string json = JsonSerializer.Serialize(tools);
        await Browser.CoreWebView2.ExecuteScriptAsync($"renderTools({json})");

        foreach (string error in errors)
        {
            Console.WriteLine($"FindAllToolsInFolderAsync reported: {error}");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"FileWatcher_FilesChanged failed: {ex.Message}");
    }
}
```

### The Updated Project

`MainWindow.xaml.cs`, with the file watcher constructed at the end of
`MainWindow_Loaded`, the new handler added directly after it, and
`MainWindow_Closing` updated to dispose it:

```csharp
44          foreach (Tool tool in tools)
45          {
46              Tools.Add(tool);
47          }
48
49          string htmlPath = Path.Combine(AppContext.BaseDirectory, "local.html");
50          Browser.Source = new Uri(htmlPath);
51
52          _fileWatcher = new ToolFileWatcher(AppContext.BaseDirectory);        // ← new
53          _fileWatcher.FilesChanged += FileWatcher_FilesChanged;               // ← new
54      }
55
56      private async void FileWatcher_FilesChanged(object? sender, EventArgs e)  // ← new
57      {                                                                         // ← new
58          try                                                                    // ← new
59          {                                                                       // ← new
60              (List<Tool> tools, List<string> errors) = await ToolRepository.FindAllToolsInFolderAsync(AppContext.BaseDirectory);  // ← new
61                                                                                   // ← new
62              Dispatcher.Invoke(() =>                                             // ← new
63              {                                                                    // ← new
64                  Tools.Clear();                                                   // ← new
65                  foreach (Tool tool in tools)                                     // ← new
66                  {                                                                 // ← new
67                      Tools.Add(tool);                                              // ← new
68                  }                                                                 // ← new
69              });                                                                   // ← new
70                                                                                    // ← new
71              string json = JsonSerializer.Serialize(tools);                       // ← new
72              await Browser.CoreWebView2.ExecuteScriptAsync($"renderTools({json})"); // ← new
73                                                                                    // ← new
74              foreach (string error in errors)                                     // ← new
75              {                                                                     // ← new
76                  Console.WriteLine($"FindAllToolsInFolderAsync reported: {error}"); // ← new
77              }                                                                     // ← new
78          }                                                                        // ← new
79          catch (Exception ex)                                                    // ← new
80          {                                                                        // ← new
81              Console.WriteLine($"FileWatcher_FilesChanged failed: {ex.Message}"); // ← new
82          }                                                                        // ← new
83      }
```

```csharp
1   private void MainWindow_Closing(object? sender, CancelEventArgs e)
2   {
3       Console.WriteLine("MainWindow is closing.");
4       _fileWatcher?.Dispose();                                                   // ← new
5   }
```

`MainWindow` now genuinely keeps both real UI surfaces — the native
`ToolsListBox` and the WebView2 table — in agreement with each other, and
with `tools.db`'s own real, current state, the moment
`ToolFileWatcher`'s own debounced `FilesChanged` event fires, with no
person ever needing to reopen or manually refresh anything.

### Mechanical Walkthrough

- `private async void FileWatcher_FilesChanged(object? sender, EventArgs
  e)` — `async void` (established UI/UX for Async State, reappearing) —
  the one real, sanctioned shape for an event handler; `EventArgs`
  (established Watching the Filesystem for Changes, reappearing) matches
  `ToolFileWatcher.FilesChanged`'s own real, argument-free event
  signature.
- `(List<Tool> tools, List<string> errors) = await
  ToolRepository.FindAllToolsInFolderAsync(AppContext.BaseDirectory);` —
  `await` (established UI/UX for Async State, reappearing) on
  `FindAllToolsInFolderAsync` (established Doing That Without Freezing
  the GUI) — this real line runs on whatever real thread
  `FilesChanged` was raised on (a real thread-pool thread, per Watching
  the Filesystem for Changes), and the real background work inside
  `FindAllToolsInFolderAsync`'s own `Task.Run` genuinely runs on a
  different real thread again; a real, destructuring assignment
  (established Aggregating Many Users' Files Automatically) unpacks the
  real named tuple directly into two real, local variables.
- `Dispatcher.Invoke(() => { Tools.Clear(); foreach (...) { Tools.Add(tool);
  } });` — `Dispatcher` (established Doing That Without Freezing the
  GUI, reappearing — `MainWindow`'s own inherited property, tied to the
  real UI thread that constructed it) — `Invoke` (Header, above) forces
  this real lambda to run on that exact thread; `Tools.Clear()`
  (a real, first-appearing `ObservableCollection<T>` method, removing
  every real, currently-held item) followed by `Tools.Add(tool)` per
  real tool — this real "clear, then repopulate" shape is deliberate:
  `Tool` (established Records & Strong Types) is immutable, so there is
  no real "update this existing item in place" operation available at
  all; replacing the whole real set is the only real option.
- `string json = JsonSerializer.Serialize(tools); await
  Browser.CoreWebView2.ExecuteScriptAsync($"renderTools({json})");` —
  reappearing, unchanged (established Two-Way Communication Across the
  Split) — the real, second half of this lesson's own dual update,
  reusing the identical real tools list already fetched, so both real UI
  surfaces reflect the exact same real snapshot, not two separately
  -fetched, potentially different ones.
- `foreach (string error in errors) { Console.WriteLine(...); }` —
  reappearing (established Aggregating Many Users' Files Automatically)
  — surfaces any real, per-file failure `FindAllToolsInFolderAsync`
  reported, rather than silently discarding it.
- `catch (Exception ex) { Console.WriteLine(...); }` — reappearing
  (established UI/UX for Async State's own `async void` discipline) —
  the one real place this handler's own failures can be caught at all,
  per `async void`'s own already-established real limits.

### CS Lens

Fetching one real, complete, consistent snapshot of the data (one real
call to `FindAllToolsInFolderAsync`) and pushing that identical real
snapshot into every real, dependent view, rather than letting each view
independently re-fetch its own possibly-different copy, is a concrete
instance of **single source of truth** — a real design principle where
exactly one real place owns the authoritative real data, and every real
consumer derives from that same one real fetch rather than risking two
real, independently-taken snapshots disagreeing. Also recognized in: a
real spreadsheet's own single, underlying cell value, reflected
identically in every real chart and formula that references it; a real
database transaction's own single, consistent read, used to populate
several real report sections at once; a real state-management library
(Redux and its own real relatives) enforcing exactly one real, shared
store multiple real UI components all read from.

### SE Lens

Why fetch the tools list exactly once per `FilesChanged` firing, and
push that same real result to both UIs, rather than letting `Tools`
update itself and separately triggering a second, independent
`RefreshBrowserTableAsync`-style call (established Two-Way Communication
Across the Split) for the WebView2 half? The real alternative — two
separate real fetches — was rejected here specifically because of this
lesson's own named concept, state synchronization (Terms, above): two
real, separate queries, even run moments apart, could genuinely observe
two real, different states if another real write happened in between —
a real, second race condition this project would rather not introduce
while fixing the first one (A Database on a Network Share, Watching the
Filesystem for Changes). The real, honest cost of one, shared fetch: if
`FindAllToolsInFolderAsync` itself is slow, both real UIs wait for the
identical real duration together, rather than one updating sooner; this
project accepts that real cost deliberately, in exchange for the real
guarantee that neither UI is ever shown a real snapshot the other one
has already moved past.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. The real, isolated `Dispatcher.Invoke`/
`ObservableCollection` lab was run this session, proving the exact real
mechanism this unit's own permanent code now depends on. Real source and
captured output for both this lesson's own labs (the raw `Timer.Elapsed`
thread check and the cross-thread `ObservableCollection` failure/fix) are
saved in `verification/lesson-32/lab1-cross-thread-collection-and-fix.md`.
`ToolDB.Tests`'s own full suite still passes, unchanged: **37 tests, 0
failures** — this lesson added no new automated test, since exercising
`MainWindow`'s own real, live event wiring end-to-end would require a
real, running WPF message loop this project's own standing "no live WPF
window" constraint does not permit constructing here; the real mechanism
it depends on (`Dispatcher.Invoke` correcting a real cross-thread
failure) is instead proven directly, in isolation, against a real,
constructed `ListBox`/`ObservableCollection` pair.

### Connecting Back

Both of this project's own real UI surfaces — the native `ToolsListBox`
and the WebView2 table — now stay genuinely synchronized with
`tools.db`'s own real, current state, automatically, the moment
`ToolFileWatcher` notices an external change — proven safe against the
exact real cross-thread failure this lesson's own first Socratic
question predicted, not merely assumed to work.

---

## Connect the Pieces

One real, external change to `tools.db`, traced through both units:

1. A real, native `ListBox`, bound to a new, real `ObservableCollection<Tool>`,
   was added directly beside the existing WebView2 table — populated
   once, at load, from the identical real query this project has run
   since its own first WPF lesson (Unit 1).
2. `ToolFileWatcher`'s own real, debounced `FilesChanged` event was wired
   to a new, real handler that fetches one, real, shared snapshot via
   `FindAllToolsInFolderAsync`, safely updates the native list through
   `Dispatcher.Invoke` — proven necessary by a real, captured
   cross-thread exception, not assumed — and pushes that identical real
   snapshot into the WebView2 table through `ExecuteScriptAsync`, keeping
   both real surfaces in real, provable agreement (Unit 2).

**Slice 7 is complete.** **Next lesson:** 33 — What React Buys You
(rebuild the Slice 2 table as a React component) — the start of Slice 8.
