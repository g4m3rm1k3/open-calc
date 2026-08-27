# Lesson 12: A Class That Tells WPF When It Changes — Displaying Live Status

**What you will build.** A `WatcherStatus` class exposing three plain
properties — a watcher status message, the current file's name, and the
most recent event — bound directly into `MainWindow`'s own markup, plus a
new "Start Watching" button that constructs a real `LiveFileTracker` for
the currently selected folder and connects its new `StatusUpdated` event
to that same `WatcherStatus` object. What this lesson is actually about
goes past these three fields: every WPF display in this project so far
has been updated the same way — code-behind reaching directly for a named
control (`FolderPathText.Text = ...`) and assigning it, by hand, at the
exact moment something changes. This lesson introduces the opposite
shape: a plain C# object that knows nothing about `TextBlock`s or
`Window`s at all, simply announcing "one of my properties changed," with
WPF's own binding system doing the actual work of finding whatever
control cares and updating it. This lesson also, honestly, does not fully
work by the time it ends — its own closing section explains exactly why,
and exactly what a later lesson fixes.

**What you need to know first.** Lesson 8 — `ObservableCollection<T>`'s
`CollectionChanged` event, the first time this project let WPF watch an
object for changes rather than being told about them directly; this
lesson's own `INotifyPropertyChanged` is the identical idea, applied to a
single object's individual properties instead of a whole collection's
membership. Lesson 11 — `LiveFileTracker.CurrentFile` and its `private
set`, extended in this lesson with a new public event.

**Terms used in this lesson.**

- **expression-bodied member (`=>`)** — a C# syntax letting a member whose
  entire body is one single expression be written as `=> expression`
  instead of a full `{ return expression; }` block. Used here on a
  property's `get` accessor: `get => _watcherStatusText;` means exactly
  the same thing as `get { return _watcherStatusText; }`, just without the
  braces and the `return` keyword, both of which add nothing when a
  member's whole job is producing one value. It exists purely to reduce
  ceremony for the extremely common case of a member that does exactly
  one thing.
- **`nameof`** — a C# operator, written `nameof(SomeIdentifier)`, that
  produces the literal, exact string of that identifier's own name at
  compile time — `nameof(WatcherStatusText)` produces the string
  `"WatcherStatusText"`. It exists to avoid "magic strings" — a hand-typed
  `"WatcherStatusText"` would still compile even after the real property
  were renamed to something else, silently going stale; `nameof` is
  checked by the compiler against the real identifier, so renaming the
  property and forgetting to update a hand-typed string becomes an
  immediate compile error instead of a silent mismatch discovered only at
  runtime.
- **`DataContext`** — a property, inherited by every WPF element from
  `FrameworkElement`, naming the object that element's own (and, unless
  overridden, every descendant element's) `{Binding}` expressions read
  from by default. Set once, on `MainWindow` itself, it applies to every
  `TextBlock` nested inside it that doesn't set its own — the same kind
  of top-down inheritance a CSS style or an environment variable might
  apply, unless something more specific overrides it. It exists so a
  whole tree of bound controls doesn't need to repeat "and bind against
  this same object" individually, on every single one.
- **the `{Binding}` markup extension** — a XAML syntax, written inside
  curly braces as an attribute value (`Text="{Binding WatcherStatusText}"`),
  that connects a control's property to a named property on whatever
  object the element's own `DataContext` currently points to. Unlike
  every property value shown in this project's markup so far — a literal
  string, always fixed at compile time — a `{Binding}` expression's actual
  value is resolved later, at runtime, and re-resolved automatically every
  time the source property changes and reports it (via **`INotifyPropertyChanged`**,
  below). It exists as the declarative, markup-only way to connect a
  control to live data, without any code-behind line explicitly copying a
  value across.

**Objects and methods used.**

- **`WatcherStatus`**
  - *What it is:* this project's new class representing the live status
    this lesson's UI displays — a watcher status message, a current file
    name, and a description of the most recent event.
  - *Implementation:* `public class WatcherStatus : INotifyPropertyChanged`
    (below) in the `MastercamGenerator` namespace.
  - *Its use:* the one object `MainWindow`'s new UI elements bind against.
  - *Type:* a public class, instantiated once, with `new`.
  - *Responsibility:* holding this project's current status as three
    plain string properties, and announcing, through
    `INotifyPropertyChanged`, whenever any one of them changes.
  - *Depends on:* nothing beyond being constructed.
  - *Connects to:* assigned to `MainWindow.DataContext` (Header above)
    once, in the constructor; its three properties are written to from
    `BrowseButton_Click`'s new sibling methods, this lesson's third
    Concept Unit.
  - *Shape:* a seventh real dependency boundary in this project — a class
    that exists purely to be observed, with no behavior of its own beyond
    announcing its own changes.
- **`INotifyPropertyChanged`**
  - *What it is:* the .NET interface a class implements to announce,
    generically, that one of its own properties has changed — confirmed
    against the interface's own published definition.
  - *Implementation:* `public interface INotifyPropertyChanged`,
    declaring exactly one member: a `PropertyChanged` event of type
    `PropertyChangedEventHandler` (below).
  - *Its use:* the mechanism that makes `{Binding}` (Header above) able
    to react automatically, rather than showing a value only once, at the
    moment binding first happens, and never again.
  - *Type:* an interface.
  - *Responsibility:* declaring the one shared contract every WPF
    binding source can rely on: "when something changes, I'll say so,
    by name."
  - *Depends on:* nothing; it's a pure contract.
  - *Connects to:* implemented by `WatcherStatus`; WPF's own internal
    binding machinery subscribes to any bound object's `PropertyChanged`
    event automatically, the moment a `{Binding}` targeting it is
    resolved — no code in this project ever writes that subscription by
    hand.
  - *Shape:* the exact seam `ObservableCollection<T>`'s own
    `INotifyCollectionChanged` (an earlier lesson's own subject) already
    proved WPF knows how to watch — this lesson's version watches
    individual properties instead of collection membership.
- **`PropertyChangedEventHandler`**
  - *What it is:* the delegate type `INotifyPropertyChanged.PropertyChanged`
    requires.
  - *Implementation:* `public delegate void PropertyChangedEventHandler
    (object sender, PropertyChangedEventArgs e)` — the same
    two-parameter shape every event delegate in this project has used
    since an earlier lesson's `FileSystemEventHandler`.
  - *Its use:* the type of `WatcherStatus.PropertyChanged`.
  - *Type:* a delegate type.
  - *Responsibility:* defining the exact calling contract any
    `PropertyChanged` subscriber (here, WPF's own internal binding code)
    must satisfy.
  - *Depends on:* nothing; a pure type declaration.
  - *Connects to:* the type of `WatcherStatus`'s own `PropertyChanged`
    event.
  - *Shape:* the compiler-enforced contract standing between "a property
    changed" and whatever's listening for that fact.
- **`PropertyChangedEventArgs`**
  - *What it is:* the data object a `PropertyChanged` notification
    carries, naming exactly which property changed.
  - *Implementation:* a class in `System.ComponentModel` with a
    constructor taking one `string` — the changed property's name — and
    exposing it back through its own `PropertyName` property.
  - *Its use:* constructed fresh, once per property, every time that
    property's own setter runs, naming that exact property via `nameof`
    (Header above).
  - *Type:* a class, constructed with `new`.
  - *Responsibility:* telling a subscriber which one property actually
    changed, since a single shared `PropertyChanged` event covers every
    property on the class, not one event per property.
  - *Depends on:* the property name it's constructed with.
  - *Connects to:* constructed inside each property's `set` accessor;
    passed to `PropertyChanged?.Invoke(...)`.
  - *Shape:* the one piece of information WPF's own binding system reads
    to know *which* bound `{Binding}` expressions need to re-evaluate —
    without it, every binding on the whole object would have to
    re-check itself on every single change, regardless of which property
    actually moved.
- **`LiveFileTracker.StatusUpdated`**
  - *What it is:* a new event, added to an earlier lesson's
    `LiveFileTracker`, reporting a plain description of whatever just
    happened.
  - *Implementation:* `public event Action<string>? StatusUpdated;` — a
    **generic delegate type**, `Action<string>` (a built-in .NET delegate
    representing "a method taking one `string` and returning nothing," an
    alternative to declaring a whole new custom delegate type the way an
    earlier lesson's `FileSystemEventHandler` did), rather than the
    two-parameter `sender`/`e` shape every other event in this project has
    used until now.
  - *Its use:* raised once at the very start of `OnFileEvent` (an earlier
    lesson's own method, reporting every real event regardless of what
    happens next) and again once a file actually becomes current.
  - *Type:* an instance event.
  - *Responsibility:* giving outside code a plain, simple string
    description of watcher activity, without exposing any of
    `LiveFileTracker`'s own internal decision-making.
  - *Depends on:* `OnFileEvent` actually running.
  - *Connects to:* subscribed to from `MainWindow`'s new
    `StartWatchingButton_Click`.
  - *Shape:* a deliberately simpler event shape than this project's other
    events — a single string, not a whole custom arguments type — because
    nothing subscribing to it needs more than a plain message.

---

## Concept Unit: `INotifyPropertyChanged` — A Class Announces Its Own Property Changes

### The Problem

Every property this project's own WPF controls have ever shown — a
folder path, a files-found count, a newest file — has been written to
directly, from code-behind, the instant something changed:
`FolderPathText.Text = folder;`. That works, but it means the *display*
code has to already know exactly which control shows which value. This
lesson needs a plain data object that can be handed to WPF once, with WPF
itself figuring out which controls to update whenever that object's own
properties change — the identical relationship `ObservableCollection<T>`'s
own `CollectionChanged` already proved for a whole collection, needed
here for individual property values instead.

> `ObservableCollection<T>` announces changes to its own *membership* —
> items added, removed, cleared. If a *single object* needed to announce
> that one of its own *properties* changed value, rather than a whole
> collection changing shape, what would the analogous mechanism need to
> look like — one event, or one per property?

### Introduce the Concept in Isolation

A tiny, uninvolved class, its behavior predictable with full confidence
— `INotifyPropertyChanged`'s own contract is a stable, thoroughly
documented .NET interface, not a runtime quirk needing fresh proof:

```csharp
public class Thermostat : INotifyPropertyChanged
{
    private int _temperature;

    public event PropertyChangedEventHandler? PropertyChanged;

    public int Temperature
    {
        get => _temperature;
        set
        {
            _temperature = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Temperature)));
        }
    }
}
```

Any code holding a `Thermostat` and subscribed to `PropertyChanged` learns
the instant `Temperature` is assigned a new value — not by polling it
repeatedly, but by being told, directly, the moment it happens. This is
the identical **Observer pattern** (already fully explained, twice, in
earlier lessons) applied to a single property instead of a button click
or a collection's contents.

### Discard the Throwaway Example

`Thermostat` doesn't appear in the real project — it exists only to
isolate the `INotifyPropertyChanged` pattern itself before this lesson's
real class (below) does the same thing for real watcher status instead of
an imagined temperature. Discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — created: `WatcherStatus.cs`, in the
  `MastercamGenerator/` project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; the start of a new file.
- **Dependencies** — none beyond the project itself already existing.

### The New Code

```csharp
using System.ComponentModel;

namespace MastercamGenerator;

public class WatcherStatus : INotifyPropertyChanged
{
    private string _watcherStatusText = "Not Watching";

    public event PropertyChangedEventHandler? PropertyChanged;

    public string WatcherStatusText
    {
        get => _watcherStatusText;
        set
        {
            _watcherStatusText = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(WatcherStatusText)));
        }
    }
}
```

### The Updated Project

This *is* the whole new structure — a brand-new file with nothing
surrounding it yet — so there is nothing further to return to.

### Mechanical Walkthrough

1. `using System.ComponentModel;` — a **`using` directive** (already
   fully explained), bringing `INotifyPropertyChanged`, `PropertyChangedEventHandler`,
   and `PropertyChangedEventArgs` (all Header above) into scope.
2. `public class WatcherStatus : INotifyPropertyChanged` — **inheritance**
   syntax (already fully explained, though here naming an interface
   rather than a base class, the same distinction an earlier lesson's
   `Whistle : IDisposable` already made): `WatcherStatus` promises to
   satisfy `INotifyPropertyChanged`'s (Header above) one required member.
3. `private string _watcherStatusText = "Not Watching";` — an **instance
   field** (already fully explained), the real, backing storage this
   property's accessors actually read and write.
4. `public event PropertyChangedEventHandler? PropertyChanged;` — the
   **`event`** keyword (already fully explained, from the declaring side,
   in an earlier lesson), satisfying `INotifyPropertyChanged`'s one
   required member, of delegate type **`PropertyChangedEventHandler`**
   (Header above), marked **nullable** (already fully explained) since it
   starts with no subscribers.
5. `public string WatcherStatusText { get => _watcherStatusText; set {
   ... } }` — a property with two accessors: `get => _watcherStatusText;`
   uses an **expression-bodied member** (Header above) to simply return
   the backing field; the `set` accessor is a full block, because setting
   this property needs to do more than one thing.
6. `_watcherStatusText = value;` — inside `set`: assigns the field from
   `value`, the implicit parameter name every property setter receives,
   representing whatever was assigned to the property from outside.
7. `PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof
   (WatcherStatusText)));` — the **null-conditional operator** `?.`
   (already fully explained) invokes `PropertyChanged`, but only if
   something's subscribed; `new PropertyChangedEventArgs(...)` (Header
   above) is constructed with `nameof(WatcherStatusText)` (Header above)
   — the literal string `"WatcherStatusText"`, produced by the compiler,
   not typed by hand.

### CS Lens

`nameof` producing a checked, compiler-verified string instead of a
hand-typed literal is a small instance of a large idea: **eliminating a
class of bug by construction**, the same underlying motivation an earlier
lesson already named for `foreach` removing off-by-one index mistakes
structurally, rather than merely making them less likely. A hand-typed
`"WatcherStatusText"` and a real property named `WatcherStatusText` can
drift apart the moment either one is renamed without the other; `nameof`
makes that drift a compile error instead of a silent, runtime-only bug.
Also recognized in: a spreadsheet formula referencing a cell by its real
address, automatically updating if a row is inserted above it, rather
than a hard-coded value copied from what that cell used to contain; a
symbolic link pointing at a file by its real, current location rather
than a stale, hand-copied path.

### SE Lens

The alternative — writing the literal string `"WatcherStatusText"` by
hand, inside `PropertyChangedEventArgs`'s constructor — was available,
and is exactly how `INotifyPropertyChanged` was used for years before
`nameof` existed as a language feature. The real, permanent risk it
carries: renaming the `WatcherStatusText` property to something else
would leave that hand-typed string silently wrong, referring to a
property name that no longer exists — WPF's own binding system would
simply stop reacting to changes on the renamed property, with no error, no
warning, and no visible symptom beyond "the UI stopped updating," a
genuinely hard bug to trace back to its real cause. `nameof` converts that
entire failure mode into an immediate compile error the moment the rename
happens.

### Commands Needed

None yet beyond `dotnet build`, run once for this lesson's whole batch of
changes at the end.

### Run It

Predicted with full confidence, not executed standalone: `INotifyPropertyChanged`'s
contract, `nameof`, and expression-bodied members are all stable,
thoroughly documented C#/.NET features — this project's real, full build,
covering this exact class, is shown at this lesson's end.

### Connecting Back

`WatcherStatus` can now announce changes to one property. Nothing in this
project reads it yet — that's this lesson's next Concept Unit.

---

## Concept Unit: `DataContext` and `{Binding}` — WPF Reads From a Live Object

### The Problem

`WatcherStatus` exists and can announce changes, but nothing connects it
to any control in `MainWindow.xaml`. Every value this project's markup has
ever shown has been either a fixed literal (`Text="Folder: "`) or set
later, imperatively, from code-behind — nothing in this project's XAML
has ever pointed at a live object directly.

> If a `TextBlock`'s `Text` needed to come from a property on some other
> object entirely — not a literal string, not something code-behind sets
> after the fact — what would that XAML attribute's *value* need to look
> like, given every value shown in this project's markup so far has been
> a plain, literal string?

### Introduce the Concept in Isolation

No new isolated example — `{Binding}`'s own effect is best shown directly
in this project's real markup, immediately below, rather than in a
throwaway snippet that would need to invent its own placeholder object
and window just to demonstrate one attribute value.

### Discard the Throwaway Example

Not applicable — no throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `MainWindow.xaml` (a new bound
  `TextBlock`) and `MainWindow.xaml.cs` (setting `DataContext`).
- **Change type** — add.
- **Location** — `MainWindow.xaml`: a new element inside the outer
  vertical `StackPanel`. `MainWindow.xaml.cs`: the constructor, after the
  existing `ItemsSource` assignment.
- **Dependencies** — this lesson's `WatcherStatus` (previous Concept
  Unit).

### The New Code

`MainWindow.xaml`'s new element:

```xml
<TextBlock Text="{Binding WatcherStatusText}"/>
```

`MainWindow.xaml.cs`'s new line:

```csharp
DataContext = _watcherStatus;
```

(alongside a new field, `private readonly WatcherStatus _watcherStatus =
new WatcherStatus();`, the same `readonly` field pattern already
established for every other application dependency in this project).

### The Updated Project

The relevant part of `MainWindow.xaml.cs`'s constructor, with the new
lines marked:

```csharp
1  public MainWindow()
2  {
3      InitializeComponent();
4      DiscoveredFilesGrid.ItemsSource = _discoveredFiles;
5      DataContext = _watcherStatus;                        // ← new
6  }
```

### Mechanical Walkthrough

1. `Text="{Binding WatcherStatusText}"` (XAML) — the **`{Binding}` markup
   extension** (Header above): instead of a literal string, this
   attribute's value is a live connection to a property named
   `WatcherStatusText` on whatever object this element's own
   **`DataContext`** (Header above) currently points to.
2. `DataContext = _watcherStatus;` (C#) — assigns `MainWindow`'s own
   inherited `DataContext` property (Header above) to `_watcherStatus`.
   Because `DataContext` is inherited down the visual tree by every
   descendant that doesn't set its own, this one assignment, made once,
   on the outermost `Window`, is what every `{Binding}` expression inside
   any of its nested `StackPanel`s ultimately resolves against.

### CS Lens

Setting `DataContext` once, at the root, and letting it flow down to
every descendant is **inherited configuration** — the same shape a CSS
style sheet's cascading rules use, or an environment variable set once
for a whole process rather than passed explicitly into every function
that happens to need it. Also recognized in: a company-wide dress code
applying to every department without each one restating it; a router's
default gateway setting applying to every device on the network unless
one is individually configured otherwise; a legal system's constitution
applying to every subordinate law unless a more specific one overrides
it.

### SE Lens

The alternative — setting `DataContext` individually on each of this
lesson's three bound `TextBlock`s — was available, and would work
identically for this lesson's own small case. It's not chosen because it
would mean stating "bind against `_watcherStatus`" three separate times
instead of once, with a real, growing cost the more bound elements this
project eventually adds — and a real risk that a copy-pasted element
keeps a stale, individually-set `DataContext` behind, pointing at the
wrong object, rather than automatically inheriting whatever the correct
one currently is.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with real confidence, directly sourced from `DataContext` and
`{Binding}`'s own documented WPF contract, not from resemblance to
anything else in this project; this project's real, full build, covering
this exact markup and assignment, is shown at this lesson's end.

### Connecting Back

`WatcherStatus.WatcherStatusText` is now genuinely displayed, live, the
instant it changes — proven mechanically, not yet exercised by anything
real. The next Concept Unit adds the two remaining status fields and
actually starts a watcher for real.

---

## Concept Unit: The Remaining Status Fields and Wiring a Real Watcher

### The Problem

`WatcherStatus` can show one property; this lesson's own UI mockup needs
three. `LiveFileTracker`, from an earlier lesson, has no way to report
anything to the outside world at all — it only ever updates its own
private state.

### Introduce the Concept in Isolation

No new isolated example — `CurrentFileText` and `StatusMessage` are two
more properties following the identical pattern this lesson's own first
Concept Unit already isolated in full; a fourth demonstration of the same
pattern would teach nothing new.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `WatcherStatus.cs` (two more
  properties), `LiveFileTracker.cs` (a new event, raised twice),
  `MainWindow.xaml` (two more bound elements, a new button), and
  `MainWindow.xaml.cs` (two new fields and two new methods).
- **Change type** — add, throughout.
- **Location** — `WatcherStatus.cs`: alongside `WatcherStatusText`.
  `LiveFileTracker.cs`: a new event declaration, and two new calls to it
  inside the existing `OnFileEvent`. `MainWindow.xaml`: new elements
  inside the outer `StackPanel`. `MainWindow.xaml.cs`: new fields
  alongside the existing ones, and two new methods.
- **Dependencies** — this lesson's `WatcherStatus` and `DataContext`
  wiring (previous two Concept Units); an earlier lesson's complete
  `LiveFileTracker`.

### The New Code

`WatcherStatus.cs`'s two new properties, following the identical
`get`/`set`/`PropertyChanged` pattern this lesson's first Concept Unit
already isolated for `WatcherStatusText` — a bare auto-property would
compile but would never actually raise `PropertyChanged`, so both repeat
the full pattern rather than shortening it:

```csharp
private string _currentFileText = "(none)";
private string _statusMessage = "(none)";

public string CurrentFileText
{
    get => _currentFileText;
    set
    {
        _currentFileText = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(CurrentFileText)));
    }
}

public string StatusMessage
{
    get => _statusMessage;
    set
    {
        _statusMessage = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(StatusMessage)));
    }
}
```

`LiveFileTracker.cs`'s new event and its two call sites:

```csharp
public event Action<string>? StatusUpdated;
```

```csharp
StatusUpdated?.Invoke($"File event: {Path.GetFileName(e.FullPath)}");
```

```csharp
StatusUpdated?.Invoke($"Now current: {fileInfo.Name}");
```

`MainWindow.xaml`'s two new elements and new button:

```xml
<StackPanel Orientation="Horizontal">
    <TextBlock Text="Watcher Status: "/>
    <TextBlock Text="{Binding WatcherStatusText}"/>
    <Button Content="Start Watching" Click="StartWatchingButton_Click"/>
</StackPanel>
<StackPanel Orientation="Horizontal">
    <TextBlock Text="Current File: "/>
    <TextBlock Text="{Binding CurrentFileText}"/>
</StackPanel>
<StackPanel Orientation="Horizontal">
    <TextBlock Text="Last Event: "/>
    <TextBlock Text="{Binding StatusMessage}"/>
</StackPanel>
```

`MainWindow.xaml.cs`'s new fields and methods:

```csharp
private string? _selectedFolder;
private LiveFileTracker? _liveFileTracker;
```

```csharp
private void StartWatchingButton_Click(object sender, RoutedEventArgs e)
{
    if (_selectedFolder == null)
    {
        return;
    }

    _liveFileTracker = new LiveFileTracker(_selectedFolder);
    _liveFileTracker.StatusUpdated += OnWatcherStatusUpdated;
    _liveFileTracker.Start();
    _watcherStatus.WatcherStatusText = "Watching";
}

private void OnWatcherStatusUpdated(string message)
{
    _watcherStatus.StatusMessage = message;

    if (_liveFileTracker?.CurrentFile != null)
    {
        _watcherStatus.CurrentFileText = _liveFileTracker.CurrentFile.FileName;
    }
}
```

### The Updated Project

The full `WatcherStatus.cs`:

```csharp
1  using System.ComponentModel;
2  
3  namespace MastercamGenerator;
4  
5  public class WatcherStatus : INotifyPropertyChanged
6  {
7      private string _watcherStatusText = "Not Watching";
8      private string _currentFileText = "(none)";              // ← new
9      private string _statusMessage = "(none)";                // ← new
10 
11     public event PropertyChangedEventHandler? PropertyChanged;
12 
13     public string WatcherStatusText
14     {
15         get => _watcherStatusText;
16         set
17         {
18             _watcherStatusText = value;
19             PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(WatcherStatusText)));
20         }
21     }
22 
23     public string CurrentFileText                             // ← new
24     {                                                          // ← new
25         get => _currentFileText;                               // ← new
26         set                                                     // ← new
27         {                                                       // ← new
28             _currentFileText = value;                            // ← new
29             PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(CurrentFileText)));  // ← new
30         }                                                       // ← new
31     }                                                          // ← new
32 
33     public string StatusMessage                                // ← new
34     {                                                          // ← new
35         get => _statusMessage;                                  // ← new
36         set                                                     // ← new
37         {                                                       // ← new
38             _statusMessage = value;                              // ← new
39             PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(StatusMessage)));  // ← new
40         }                                                       // ← new
41     }                                                          // ← new
42 }
```

The full `LiveFileTracker.cs`, with the new lines marked:

```csharp
1  using System.IO;
2  
3  namespace MastercamGenerator;
4  
5  public class LiveFileTracker
6  {
7      private readonly FileDateParser _fileDateParser = new FileDateParser();
8      private readonly FileReadyWaiter _fileReadyWaiter = new FileReadyWaiter();
9      private readonly DirectoryWatcher _directoryWatcher;
10     private DateTime? _currentFileDate;
11 
12     public InputFile? CurrentFile { get; private set; }
13 
14     public event Action<string>? StatusUpdated;               // ← new
15 
16     public LiveFileTracker(string directoryPath)
17     {
18         _directoryWatcher = new DirectoryWatcher(directoryPath);
19         _directoryWatcher.Created += OnFileEvent;
20         _directoryWatcher.Changed += OnFileEvent;
21     }
22 
23     public void Start()
24     {
25         _directoryWatcher.StartWatching();
26     }
27 
28     private void OnFileEvent(object sender, FileSystemEventArgs e)
29     {
30         StatusUpdated?.Invoke($"File event: {Path.GetFileName(e.FullPath)}");  // ← new
31 
32         DateTime? parsedDate = _fileDateParser.TryParseDate(e.FullPath);
33         if (parsedDate == null)
34         {
35             return;
36         }
37 
38         if (_currentFileDate != null && parsedDate <= _currentFileDate)
39         {
40             return;
41         }
42 
43         bool ready = _fileReadyWaiter.WaitForFileReady(e.FullPath, maxAttempts: 10, delayMilliseconds: 200);
44         if (!ready)
45         {
46             return;
47         }
48 
49         var fileInfo = new FileInfo(e.FullPath);
50         CurrentFile = new InputFile(fileInfo.FullName, fileInfo.Name, fileInfo.LastWriteTime);
51         _currentFileDate = parsedDate;
52 
53         StatusUpdated?.Invoke($"Now current: {fileInfo.Name}");  // ← new
54     }
55 }
```

The full `MainWindow.xaml`, with the new elements marked:

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
14             <DataGrid x:Name="DiscoveredFilesGrid" AutoGenerateColumns="True" IsReadOnly="True"/>
15             <StackPanel Orientation="Horizontal">                            // ← new
16                 <TextBlock Text="Watcher Status: "/>                          // ← new
17                 <TextBlock Text="{Binding WatcherStatusText}"/>
18                 <Button Content="Start Watching" Click="StartWatchingButton_Click"/>  // ← new
19             </StackPanel>                                                    // ← new
20             <StackPanel Orientation="Horizontal">                            // ← new
21                 <TextBlock Text="Current File: "/>                           // ← new
22                 <TextBlock Text="{Binding CurrentFileText}"/>                 // ← new
23             </StackPanel>                                                    // ← new
24             <StackPanel Orientation="Horizontal">                            // ← new
25                 <TextBlock Text="Last Event: "/>                             // ← new
26                 <TextBlock Text="{Binding StatusMessage}"/>                   // ← new
27             </StackPanel>                                                    // ← new
28         </StackPanel>
29     </Grid>
30 </Window>
```

The full `MainWindow.xaml.cs`, with every new line marked:

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
21     private readonly WatcherStatus _watcherStatus = new WatcherStatus();     // ← new
22     private string? _selectedFolder;                                        // ← new
23     private LiveFileTracker? _liveFileTracker;                              // ← new
24 
25     public MainWindow()
26     {
27         InitializeComponent();
28         DiscoveredFilesGrid.ItemsSource = _discoveredFiles;
29         DataContext = _watcherStatus;
30     }
31 
32     private void BrowseButton_Click(object sender, RoutedEventArgs e)
33     {
34         string? folder = _fileSource.SelectDirectory();
35         if (folder != null)
36         {
37             _selectedFolder = folder;                                        // ← new
38             FolderPathText.Text = folder;
39 
40             List<InputFile> discoveredFiles = _directoryScanner.ScanDirectory(folder);
41             _discoveredFiles.Clear();
42             foreach (var file in discoveredFiles)
43             {
44                 _discoveredFiles.Add(file);
45             }
46             FilesFoundText.Text = $"Files Found: {discoveredFiles.Count}";
47 
48             InputFile? newestFile = _newestFileResolver.FindNewest(discoveredFiles);
49             if (newestFile != null)
50             {
51                 NewestFileText.Text = $"Newest file: {newestFile.FileName} (Modified: {newestFile.LastModified})";
52             }
53             else
54             {
55                 NewestFileText.Text = "Newest file: (none)";
56             }
57         }
58     }
59 
60     private void StartWatchingButton_Click(object sender, RoutedEventArgs e)  // ← new
61     {                                                                        // ← new
62         if (_selectedFolder == null)                                         // ← new
63         {                                                                    // ← new
64             return;                                                         // ← new
65         }                                                                    // ← new
66 
67         _liveFileTracker = new LiveFileTracker(_selectedFolder);              // ← new
68         _liveFileTracker.StatusUpdated += OnWatcherStatusUpdated;             // ← new
69         _liveFileTracker.Start();                                            // ← new
70         _watcherStatus.WatcherStatusText = "Watching";                       // ← new
71     }                                                                        // ← new
72 
73     private void OnWatcherStatusUpdated(string message)                      // ← new
74     {                                                                        // ← new
75         _watcherStatus.StatusMessage = message;                              // ← new
76 
77         if (_liveFileTracker?.CurrentFile != null)                           // ← new
78         {                                                                    // ← new
79             _watcherStatus.CurrentFileText = _liveFileTracker.CurrentFile.FileName;  // ← new
80         }                                                                    // ← new
81     }                                                                        // ← new
82 }
```

`MainWindow` now has a real "Start Watching" button that constructs a
`LiveFileTracker` for whatever folder was last selected, subscribes to
its status updates, and starts it — with three bound `TextBlock`s ready to
reflect whatever happens, live, with no code anywhere explicitly touching
`WatcherStatusText`, `CurrentFileText`, or `StatusMessage`'s controls
directly.

### Mechanical Walkthrough

1. `public event Action<string>? StatusUpdated;` (C#) — the **`event`**
   keyword again, this time of type `Action<string>` (Header above) — a
   built-in generic delegate, rather than a custom one this project
   declares itself, chosen because a single `string` message is all this
   event needs to carry.
2. `StatusUpdated?.Invoke($"File event: {Path.GetFileName(e.FullPath)}");`
   (C#) — the **null-conditional operator** (already fully explained)
   invokes `StatusUpdated`, passing a **string interpolation** (already
   fully explained) built from `Path.GetFileName(e.FullPath)` (already
   fully explained, this lesson's own use extracting just the file name
   for a readable message, distinct from the full-path processing
   `FileDateParser` performs internally).
3. `if (_selectedFolder == null) { return; }` (C#) — a **guard clause**
   (already fully explained): `Start Watching` does nothing at all if no
   folder was ever picked via `Browse` first.
4. `_liveFileTracker = new LiveFileTracker(_selectedFolder);` (C#) —
   constructs a real `LiveFileTracker` (an earlier lesson's own subject)
   for the selected folder, stored in a field so `OnWatcherStatusUpdated`
   (below) can later read its `CurrentFile`.
5. `_liveFileTracker.StatusUpdated += OnWatcherStatusUpdated;` (C#) — an
   ordinary `+=` **event subscription** (already fully explained),
   connecting this lesson's new event to a new handler method.
6. `_liveFileTracker.Start();` (C#) — calls an earlier lesson's own
   `LiveFileTracker.Start()`, actually beginning real filesystem watching.
7. `_watcherStatus.WatcherStatusText = "Watching";` (C#) — assigns this
   lesson's own bound property directly — since this line runs from
   inside `StartWatchingButton_Click`, itself running because a user
   clicked a real WPF button, it executes on the UI thread, the same
   thread `MainWindow` itself was created on.
8. `_watcherStatus.StatusMessage = message;` and the `if (_liveFileTracker?.
   CurrentFile != null) { _watcherStatus.CurrentFileText = ...; }` inside
   `OnWatcherStatusUpdated` (C#) — the **null-conditional operator** again,
   guarding a read of `CurrentFile` (an earlier lesson's own property)
   before trusting it's non-null.

### CS Lens

Extending `LiveFileTracker` with a new event, without touching any of its
existing three questions or its `CurrentFile` property, is a real,
concrete demonstration of the **Open/Closed Principle** — a class should
be open to extension (new capability can be added) but closed to
modification (existing, already-correct behavior doesn't have to be
touched, or re-verified, to add that capability). `OnFileEvent`'s own
three-question pipeline, proven correct in an earlier lesson, is entirely
unchanged here — this lesson only adds two new lines calling a new event,
never altering the logic that decides what counts as "newer" or "ready."
Also recognized in: adding a new accessory port to an existing appliance
without redesigning its internal wiring; adding a new observer to an
already-working alarm system without touching the sensor logic that
decides when to sound it.

### SE Lens

Choosing `Action<string>` over a custom, purpose-built delegate and
event-args type (the shape every other event in this project has used) is
a real, deliberate simplification: a custom `WatcherStatusEventArgs`
class, carrying a message plus perhaps a timestamp or severity, would be
more extensible later, at the cost of more code today for information
this lesson's own UI doesn't yet need beyond a plain string. Reaching for
the simplest shape that satisfies today's actual requirement — one
message, nothing else — mirrors this curriculum's own repeated preference
for the narrower tool over the more general one, revisited honestly if a
real future need for more structure ever appears.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Real, captured output from running `dotnet build` against this lesson's
complete, final `WatcherStatus.cs`, `LiveFileTracker.cs`, `MainWindow.xaml`,
and `MainWindow.xaml.cs` (.NET SDK 10.0.301), unedited:

```
Determining projects to restore...
All projects are up-to-date for restore.
MastercamGenerator -> <project>\bin\Debug\net10.0-windows\MastercamGenerator.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)
```

### Connecting Back

Every piece from this lesson's earlier Concept Units is now real and
wired: `WatcherStatus` (first unit), bound via `DataContext` (second
unit), now actually fed real data by a real, running `LiveFileTracker`.
This lesson's closing section explains exactly why that last connection
is not yet safe to rely on.

---

## Connect the Pieces — and the Problem This Lesson Doesn't Solve

Trace one real file event through this lesson's complete, newly-wired
chain, and confront the one honest gap this lesson leaves open.

1. A user clicks `Browse` (an earlier lesson), then `Start Watching`
   (this lesson's third Concept Unit) — both real WPF button clicks,
   both running on WPF's own UI thread, the same thread that constructed
   `MainWindow` itself. `_watcherStatus.WatcherStatusText = "Watching";`
   runs safely, right there, on that same thread.
2. A real file event fires. Per an earlier lesson's own `FileSystemWatcher`
   documentation, this callback does not run on the UI thread — it runs
   on a thread the operating system's own file-notification machinery
   provides, entirely separate from WPF's.
3. `OnFileEvent` (an earlier lesson) runs, on that separate thread, and
   calls `StatusUpdated?.Invoke(...)` (this lesson's own new event) —
   still on that same separate thread; nothing about raising a plain C#
   event moves execution onto a different thread by itself.
4. `MainWindow.OnWatcherStatusUpdated` (this lesson's third Concept Unit)
   runs — still on that same background thread — and assigns
   `_watcherStatus.StatusMessage = message;`.
5. That assignment raises `PropertyChanged` (this lesson's first Concept
   Unit) — and WPF's own binding system, having subscribed to it
   internally, attempts to push the new value into the real, bound
   `TextBlock` on screen.

Here is the real problem this lesson does not solve: WPF's own controls
are, per Microsoft's own documented threading model, instances of
`DispatcherObject` — objects that record which thread created them and
enforce, through a real method named `VerifyAccess`, that only that same
thread may touch them. A `TextBlock` created on the UI thread, being
updated as a direct result of step 5 above — from a background thread —
is exactly the situation that documented enforcement exists to catch. This
project's own code has no `Dispatcher`-aware call anywhere in this
chain; every one of the five steps above happens exactly on whatever
thread the step before it was already running on.

This lesson ends here, deliberately, without fixing it — matching the
same honest pattern an earlier lesson's `DirectoryWatcher` and
`FileReadyWaiter` already established, each naming a real gap rather than
quietly working around it. `WatcherStatus`, `DataContext`, `{Binding}`,
and `LiveFileTracker.StatusUpdated` are all real, correctly-built pieces —
the one piece still missing is the thread-safe bridge back to the UI
thread a background event needs to cross before it's safe to update
anything WPF owns. That bridge, and the real tool built specifically for
crossing it, is this curriculum's next lesson.
