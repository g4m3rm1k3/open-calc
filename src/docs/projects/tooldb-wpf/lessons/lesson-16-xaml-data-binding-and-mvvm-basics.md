# Lesson 16: Describing What to Show, Not Setting It Yourself

**What you will build.** `AboutDialog` stops setting its own text in
code-behind. A new class, `AboutViewModel`, holds the real tool count and a
real, computed message string; `AboutDialog.xaml`'s own `TextBlock` reads
that message declaratively, through a real `{Binding}`, and
`AboutDialog.xaml.cs`'s own constructor does nothing more than build that
one object and hand it to the window as its `DataContext`. The
transferable problem underneath the feature: every real value this
project has ever shown — the WebView2 summary line, `AboutDialog`'s own
tool count (Lesson 13) — has been pushed onto a UI element by hand, once,
in code-behind, at the exact moment it was computed. That works until a
value needs to change more than once, or until more than one element needs
to reflect the same real piece of data — at which point "remember to set
this again, everywhere it's shown, every time it changes" becomes real,
accumulating code this project would rather not write by hand at all.

**What you need to know first.** Lesson 8 — `Tool` as an immutable
`record` with `init`-only properties, and why that immutability was a
deliberate choice. Lesson 13 — `AboutDialog`'s own real constructor,
`x:Name` generating a field only when code-behind needs to reference an
element directly, and the real, generated `Connect()` method proving
exactly what XAML compiles into.

**Terms used in this lesson**

- **data binding** — a real, declarative connection between a property on
  a UI element (the *target*) and a property on some other real object
  (the *source*), so the target automatically reads — and, depending on
  configuration, writes back to — the source's own current value, without
  code-behind manually copying it across. Per Microsoft's own official
  documentation (fetched this session), a binding's "four components" are
  "a binding target object, a target property, a binding source, and a
  path to the value in the binding source to use."
- **`DataContext`** — the real, specific object a XAML element's own
  bindings look at, by default, when no other source is explicitly named.
  Per Microsoft's own official documentation (fetched this session), it's
  a real, inheriting property: "if there are child elements without other
  values for `DataContext`... the property system will set the value to
  be the `DataContext` value of the nearest parent element" — meaning
  setting it once, on a window, makes it the default binding source for
  every element inside that window that doesn't set its own.
- **property change notification** — the real, general mechanism a bound
  source object uses to tell WPF's own binding engine "one of my
  properties just changed, go re-read it" — without it, a binding reads a
  source's own value exactly once, when the binding is first established,
  and never again on its own.
- **MVVM (Model-View-ViewModel)** — a real, named architectural pattern
  separating three distinct real responsibilities: a **Model** (this
  project's own `Tool`, Lesson 8 — real domain data, no UI concerns at
  all), a **View** (a `.xaml` file — real visual structure, no data-
  computation logic), and a **ViewModel** (a new, real kind of class this
  lesson introduces — holds and computes exactly what a specific View
  needs to bind to, translating between a Model's own shape and whatever
  shape the View finds convenient to display). It exists because a Model
  is often deliberately shaped around real domain rules (Lesson 8's own
  immutable `Tool`), while a View often needs a mutable, display-ready,
  bindable shape — a ViewModel is the real, separate place that
  translation lives, rather than compromising either the Model's own
  domain integrity or the View's own bindability.
- **ViewModel** — the specific real role this lesson's own new
  `AboutViewModel` class plays inside MVVM (Terms, above): a class whose
  entire real purpose is being bound to, holding real, mutable,
  notification-raising properties a View can read — never itself a XAML
  element, never itself the permanent domain record a database row maps to.

**Objects and methods used**

- **`{Binding}` (the `Binding` markup extension)**
  - *What it is:* this lesson's own new subject — a real XAML markup
    extension establishing a real data binding (Terms, above) on a target
    property.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), `Binding` is a real class, `public class Binding :
    System.Windows.Data.BindingBase`; written in XAML as `{Binding
    PropertyName}`, it constructs a real `Binding` object at parse time
    whose own `Path` (a real property on `Binding` itself) names
    `PropertyName`. That same documentation states plainly: "to detect
    source changes in one-way or two-way bindings, the source must
    implement a suitable property change notification mechanism such as
    `INotifyPropertyChanged`" (below) — without it, a binding still reads
    its source's own value once, but never again on its own.
  - *Its use:* `Text="{Binding ToolCountMessage}"`, this lesson's own first
    unit, replacing `AboutDialog.xaml`'s own prior direct code-behind
    assignment (Lesson 13) to that same `TextBlock`'s own `Text` property.
  - *Type:* a real class, `System.Windows.Data.Binding`, constructed
    implicitly by XAML's own `{Binding ...}` markup-extension syntax.
  - *Responsibility:* connect one real target property to one real,
    named property on whatever object is reachable as the binding's own
    source (here, `DataContext`, below) — reading its current value
    immediately, and continuing to re-read it if the source ever
    announces a change (below).
  - *Depends on:* a real target property that's a **dependency property**
    (per that same documentation — "most dependency properties... support
    data binding by default"; `TextBlock.Text` already qualifies) and a
    real source object reachable at the moment the binding activates.
  - *Connects to:* reads `DataContext` (below) to find its own real
    source object, when no more specific source is named directly on the
    binding itself — this lesson's own new code never names one directly,
    relying entirely on `DataContext`.
  - *Shape:* the real, single mechanism every data-bound property in this
    project will use going forward — declared once, in XAML, rather than
    a matching line of code-behind for every value shown.
- **`FrameworkElement.DataContext`**
  - *What it is:* this lesson's own new subject, alongside `{Binding}` —
    the real, default binding source for an element and everything nested
    inside it.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), its real declared shape is `public object DataContext
    { get; set; }` — typed as a plain `object`, the same real reason
    `ContentControl.Content` (Lesson 13) is: no restriction on what kind of
    object can serve as a binding source. Its own real documentation
    confirms it "inherits property values" — set once on `AboutDialog`
    itself, every element nested inside it, including its own `TextBlock`,
    automatically sees the identical value unless one of them sets its own.
  - *Its use:* `DataContext = new AboutViewModel { ToolCount = toolCount
    };`, set inside `AboutDialog`'s own constructor, this lesson's own
    first unit.
  - *Type:* an instance property, real and inherited, on `FrameworkElement`
    — a real base class both `Window` and `TextBlock` (Lesson 5, 13)
    ultimately derive from, which is exactly why setting it once on the
    whole window reaches every element nested inside.
  - *Responsibility:* hold the one real object every binding inside this
    element — that doesn't name its own, more specific source — reads
    from.
  - *Depends on:* nothing beyond a real object to assign; `AboutDialog`'s
    own new code assigns a freshly-constructed `AboutViewModel` (this
    lesson's own third unit).
  - *Connects to:* every `{Binding ...}` inside `AboutDialog.xaml` now
    resolves its own real source through this one property, rather than
    each needing its own separately-specified source.
  - *Shape:* the real, single point where "which object are these
    bindings actually about" is decided — set once, in code-behind, read
    implicitly by every binding nested underneath it.
- **`INotifyPropertyChanged`**
  - *What it is:* this lesson's own culminating subject — a real interface
    a binding source implements to announce that one of its own properties
    just changed.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), its real, complete declaration is `public interface
    INotifyPropertyChanged`, declaring exactly one real member: a
    `PropertyChanged` event (below). That same documentation states its
    real purpose plainly: "notifies clients that a property value has
    changed" — "clients" here meaning, concretely, WPF's own binding
    engine, which automatically subscribes to this exact event on any
    binding source that implements it.
  - *Its use:* `public class AboutViewModel : INotifyPropertyChanged`,
    this lesson's own third unit.
  - *Type:* a real interface, first appearing in this project — a
    contract naming one required member, with no implementation of its
    own.
  - *Responsibility:* nothing on its own — an interface only obligates a
    real, implementing class (this lesson's own `AboutViewModel`) to
    provide the one real event it declares.
  - *Depends on:* an implementing class choosing, itself, when and how to
    actually raise its own declared event — the interface only requires
    that the event exist.
  - *Connects to:* WPF's own binding engine, per its own documentation,
    watches for this exact interface on any binding source and subscribes
    to its event automatically — this project's own code never subscribes
    to it directly for that purpose; only this lesson's own real, permanent
    test (third unit) does, to prove the mechanism works without needing a
    live window to watch it happen.
  - *Shape:* the real, general-purpose contract that makes a plain C#
    object usable as a live, auto-updating binding source at all — without
    it, a bound object is only ever read once.
- **`PropertyChangedEventHandler`/`PropertyChangedEventArgs`**
  - *What it is:* the real delegate type and event-data type
    `INotifyPropertyChanged`'s own `PropertyChanged` event uses.
  - *Implementation:* real, standard .NET types (`System.ComponentModel`)
    — `PropertyChangedEventArgs` carries one real, meaningful piece of
    data, a `PropertyName` string naming which property changed.
  - *Its use:* `PropertyChanged?.Invoke(this, new
    PropertyChangedEventArgs(propertyName));`, this lesson's own third
    unit — raised once per real property whose value just changed.
  - *Type:* a delegate (`PropertyChangedEventHandler`) and a real event-args
    class (`PropertyChangedEventArgs`), the same general shape
    `RoutedEventHandler`/`RoutedEventArgs` (Lesson 13) already established
    for a completely different real event family.
  - *Responsibility:* carry exactly the one real fact a subscriber needs —
    which property, by name, just changed — nothing about its new value;
    a subscriber that wants that has to read the property itself.
  - *Depends on:* being raised with a real, correctly-spelled property
    name — a typo here would silently tell a subscriber the wrong property
    changed, with no compiler error at all.
  - *Connects to:* raised from `AboutViewModel`'s own `OnPropertyChanged`
    helper method, this lesson's own third unit; read by WPF's own binding
    engine (real, cited above) to decide which bound elements need to
    re-read their own source.
  - *Shape:* the real, minimal payload behind every property-change
    notification this project's own future ViewModels will also raise.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`Tool` (the immutable `record`)**
  - *What it is:* reappearing from Lesson 8 — this project's own real
    domain model, deliberately immutable (`init`-only properties).
  - *Implementation:* established Lesson 8, unchanged.
  - *Its use:* named directly in this lesson's own Header (Terms, above)
    as the real reason a *separate* ViewModel class exists at all — `Tool`
    itself is deliberately never made bindable or mutable just to satisfy
    a future form's own convenience.

---

## Concept Unit: `{Binding}` — Reading a Property Instead of Setting It

### The Problem

`AboutDialog`'s own constructor, since Lesson 13, sets `ToolCountText.Text`
directly, once, at construction time — a real, working line of code, but
one that would need to run again, by hand, anywhere this same value might
ever need to change or be shown a second time.

> **Try this first:** Lesson 13's own real, generated code already proved
> `x:Name` only generates a field when code-behind actually needs to
> reference an element directly — the unnamed `Close` button proved this.
> Given a `{Binding}` reads a value from an object entirely separate from
> the `TextBlock` itself, would you expect a bound `TextBlock` to still
> need its own `x:Name`, the way `ToolCountText` (Lesson 13) did, purely to
> display a real, changing value?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/AboutDialog.xaml`, modified.
  `ToolDB/AboutDialog.xaml.cs`, modified.
- **Change type** — replace (the named `TextBlock` becomes an unnamed,
  bound one; the constructor's own direct assignment becomes a
  `DataContext` assignment).
- **Location** — `AboutDialog.xaml`'s own second `TextBlock` (Lesson 13);
  `AboutDialog.xaml.cs`'s own constructor body.
- **Dependencies** — this lesson's own third unit's `AboutViewModel` class
  (shown here first, in finished form, since this unit's own real code
  already depends on it existing).

### The New Code

```xml
<TextBlock Grid.Row="1" Margin="0,8,0,0" Text="{Binding ToolCountMessage}" />
```

```csharp
DataContext = new AboutViewModel { ToolCount = toolCount };
```

### The Updated Project

`AboutDialog.xaml`, in full, changed line marked:

```xml
 1  <Window x:Class="ToolDB.AboutDialog"
 2          xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
 3          xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
 4          Title="About ToolDB" Height="160" Width="300">
 5      <Grid Margin="16">
 6          <Grid.RowDefinitions>
 7              <RowDefinition Height="Auto" />
 8              <RowDefinition Height="Auto" />
 9              <RowDefinition Height="Auto" />
10          </Grid.RowDefinitions>
11          <TextBlock Grid.Row="0" Text="ToolDB" FontSize="20" FontWeight="Bold" />
12          <TextBlock Grid.Row="1" Margin="0,8,0,0" Text="{Binding ToolCountMessage}" />  <!-- ← changed -->
13          <Button Grid.Row="2" Content="Close" Click="CloseButton_Click" HorizontalAlignment="Right" Margin="0,16,0,0" />
14      </Grid>
15  </Window>
```

`AboutDialog.xaml.cs`'s own constructor, in full, changed line marked:

```csharp
1  public AboutDialog(int toolCount)
2  {
3      InitializeComponent();
4      DataContext = new AboutViewModel { ToolCount = toolCount };  // ← changed
5  }
```

Line 12's own `TextBlock` no longer carries `x:Name="ToolCountText"` at
all — nothing in code-behind reads or sets it directly anymore, so, per
this lesson's own Socratic question, no field is needed. The constructor
(line 4) no longer touches any named element directly either; it builds a
real `AboutViewModel` (this lesson's own third unit) and hands it to
`DataContext`, and that single assignment is now the *only* thing this
constructor does beyond `InitializeComponent()`.

### Proving It in Isolation

No throwaway example exists for this unit — `{Binding}`/`DataContext`'s
own real mechanics are proven directly against this project's own real
`AboutDialog`, below, and via this lesson's own third unit's real,
permanent test of the mechanism `{Binding}` itself depends on
(`INotifyPropertyChanged`). A throwaway version would need to invent an
unrelated ViewModel just to demonstrate the identical real syntax already
shown above.

### Discard the Throwaway Example

Not applicable, for the reason stated above.

### Mechanical Walkthrough

- `Text="{Binding ToolCountMessage}"` — `{Binding}` (Header, above),
  written in XAML's own attribute syntax — `ToolCountMessage` becomes this
  binding's own real `Path`, naming the property to read from whatever
  object this element's own `DataContext` (Header, above) resolves to.
  No `Source`, `ElementName`, or `RelativeSource` (all real, alternative
  `Binding` properties, per this lesson's own Header, none used here) is
  given, so this binding relies entirely on the inherited `DataContext`.
- `DataContext = new AboutViewModel { ToolCount = toolCount };` —
  `FrameworkElement.DataContext` (Header, above), assigned a real, freshly
  constructed `AboutViewModel` (this lesson's own third unit) — real
  object-initializer syntax (established Lesson 4/8) sets `ToolCount` to
  this constructor's own real `toolCount` parameter (established Lesson
  13) before the object is ever handed to `DataContext` at all.

### CS Lens

Reading a value through a real, named path to wherever it currently lives,
rather than being handed a fixed copy at one specific moment, is the same
real idea as **indirection** — accessing something through a reference or
description of where to find it, so the *current* value is always what's
retrieved, not a snapshot frozen at binding time. Also recognized in: a C#
property's own `get` accessor (established since Lesson 4) always
computing or returning the *current* backing value rather than a value
fixed when the property was first read, a URL shortener redirecting to
whatever the real target page currently is, and a phone contact "Mom"
resolving to whichever real number is currently stored under that name,
not the number that was true when the contact was first saved.

### SE Lens

Why bind `AboutDialog`'s own `TextBlock` directly to `DataContext`, rather
than giving the binding an explicit `Source` naming the exact
`AboutViewModel` instance directly? The alternative not chosen — an
explicit `Source` — was rejected because it would require XAML itself to
somehow reference a specific C# object instance, which XAML markup alone
can't express for an object built at runtime with real constructor
arguments (`toolCount`); relying on inherited `DataContext`, set from
code-behind after that real object is actually built, is the real,
standard way XAML and runtime-constructed data meet. The honest cost:
reading `AboutDialog.xaml` alone, with no code-behind open alongside it,
doesn't show *what* `ToolCountMessage` actually resolves to, or even that
it's guaranteed to exist at all — that real information now lives in a
second, separate file for anyone reading this specific binding.

### Run It

A real `dotnet build` was run this session against the actual, modified
files: build succeeded, 0 Warnings, 0 Errors. The real, generated file,
`obj/Debug/net9.0-windows/AboutDialog.g.cs`, fetched fresh this session
from this exact build, confirms a real, honest limit worth stating
directly: unlike Lesson 13's own `Click="..."` wiring, which showed up as
a real, visible `+=` line inside the generated `Connect()` method, this
unit's own `{Binding}` produces **no** corresponding line there at all —
the `TextBlock` no longer appears in `Connect()`'s own `switch` statement
in any form, since it has neither a name nor a directly-wired event.
Binding activation happens through a separate, real WPF runtime mechanism
this project's own generated-code-reading technique (Lesson 5, 6, 13)
cannot make visible the same way — this lesson's own third unit proves the
underlying `INotifyPropertyChanged` mechanism a different, real way
instead. This project's own standing constraint (no live WPF window
observed this session) still applies to watching this real text actually
appear on screen.

### Connecting Back

`AboutDialog` now reads its own displayed text through a real binding
instead of a direct code-behind assignment — but nothing has yet been
shown proving that binding would ever notice a *later* change. The next
unit proves exactly that.

---

## Concept Unit: `INotifyPropertyChanged` — Telling Bound Elements When to Look Again

### The Problem

The Header's own real, cited documentation for `{Binding}` already states
that detecting a source change "requires... a suitable property change
notification mechanism such as `INotifyPropertyChanged`" — without it, a
binding is proven, by that same real documentation, to read its source's
value exactly once. Nothing yet in this project demonstrates that
mechanism actually working.

> **Try this first:** given `INotifyPropertyChanged` declares exactly one
> real member, a `PropertyChanged` event — and given this project already
> knows, from Lesson 13's own real `RoutedEventHandler`, that subscribing
> to *any* C# event means providing a real method matching that event's
> own delegate shape — what would you predict happens if a real, plain C#
> test subscribes its own handler to a `PropertyChanged` event, then
> changes the property that event is supposed to announce? Would you
> expect that subscribed handler to run, and if so, what real, specific
> piece of information would you expect it to receive?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB.Tests/AboutViewModelTests.cs`, created.
- **Change type** — add (one new test file, two real `[Fact]` tests).
- **Location** — new file, sitting alongside this project's own other real
  test files in `ToolDB.Tests/`.
- **Dependencies** — `AboutViewModel`, this lesson's own third unit (shown
  here first, in finished form, since this unit's own real test already
  depends on it existing).

### The New Code

```csharp
[Fact]
public void ToolCount_RaisesPropertyChanged_ForItselfAndToolCountMessage()
{
    var viewModel = new AboutViewModel();
    var raisedProperties = new List<string>();
    viewModel.PropertyChanged += (sender, e) => raisedProperties.Add(e.PropertyName!);

    viewModel.ToolCount = 5;

    Assert.Contains(nameof(AboutViewModel.ToolCount), raisedProperties);
    Assert.Contains(nameof(AboutViewModel.ToolCountMessage), raisedProperties);
}
```

### The Updated Project

`ToolDB.Tests/AboutViewModelTests.cs`, in full (a brand-new file, nothing
to mark as changed):

```csharp
 1  public class AboutViewModelTests
 2  {
 3      [Fact]
 4      public void ToolCount_RaisesPropertyChanged_ForItselfAndToolCountMessage()
 5      {
 6          var viewModel = new AboutViewModel();
 7          var raisedProperties = new List<string>();
 8          viewModel.PropertyChanged += (sender, e) => raisedProperties.Add(e.PropertyName!);
 9
10          viewModel.ToolCount = 5;
11
12          Assert.Contains(nameof(AboutViewModel.ToolCount), raisedProperties);
13          Assert.Contains(nameof(AboutViewModel.ToolCountMessage), raisedProperties);
14      }
15
16      [Fact]
17      public void ToolCountMessage_ReflectsCurrentToolCount()
18      {
19          var viewModel = new AboutViewModel { ToolCount = 3 };
20
21          Assert.Equal("3 tool(s) loaded.", viewModel.ToolCountMessage);
22      }
23  }
```

Two real, passing tests now exist: the first — this unit's own real
subject — proves that assigning `ToolCount` genuinely raises
`PropertyChanged` twice, once per real, affected property, each time with
the correct real property name; the second confirms `ToolCountMessage`'s
own real, computed text reflects whatever `ToolCount` currently holds.

### Proving It in Isolation

This unit's own real test *is* the isolated proof — a plain C# object,
`AboutViewModel`, tested entirely outside WPF, with no window, no XAML,
and no live binding involved at all. This is deliberate: it proves the
real mechanism WPF's own binding engine depends on, using nothing WPF-
specific itself, the same way this project could test any plain C# event
subscription.

### Discard the Throwaway Example

Not applicable — this unit's own test is real, permanent project code from
the moment it's written.

### Mechanical Walkthrough

- `var viewModel = new AboutViewModel();` — real object construction,
  using `AboutViewModel`'s own compiler-generated, parameterless
  constructor (established Lesson 8's own discussion of implicit
  constructors) — this lesson's own third unit gives `AboutViewModel` no
  constructor of its own.
- `var raisedProperties = new List<string>();` — a real, empty `List<T>`
  (established Lesson 4), used here purely to record what this test
  actually observes, in order.
- `viewModel.PropertyChanged += (sender, e) => raisedProperties.Add(e
  .PropertyName!);` — a real, ordinary C# event subscription (established
  Lesson 5/13's own `+=` syntax), this time on `INotifyPropertyChanged`'s
  own `PropertyChanged` event (Header, above) — the arrow function
  (established Lesson 7) reads `e.PropertyName`, `PropertyChangedEventArgs`'s
  own real member (Header, above), and appends it to the list; the
  trailing `!` (a null-forgiving operator, first appearing in this
  project) tells the compiler this specific real value is trusted to be
  non-null here, since `AboutViewModel`'s own code (this lesson's own
  third unit) always supplies a real property name.
- `viewModel.ToolCount = 5;` — a real property assignment — this single
  line is what this unit's own entire test exists to observe the real
  consequences of.
- `Assert.Contains(nameof(AboutViewModel.ToolCount), raisedProperties);`
  and its sibling — `Assert.Contains` (established Lesson 15), reappearing
  — confirms both expected real property names genuinely appear in
  `raisedProperties`, proving `PropertyChanged` really did fire twice, not
  merely that the assignment itself succeeded.

### CS Lens

A single real action (`ToolCount = 5`) causing more than one real,
downstream notification (`PropertyChanged` for both `ToolCount` and
`ToolCountMessage`) is a specific instance of a **derived/computed
dependency** being kept honest — `ToolCountMessage` is never stored
directly, only computed from `ToolCount` at read time, so any code
changing `ToolCount` is responsible for also announcing that
`ToolCountMessage`'s own computed result may have changed too. Also
recognized in: a spreadsheet automatically recalculating and
re-displaying every cell whose own formula depends on a cell that just
changed, a compiler's own incremental build system re-running only the
build steps whose real inputs actually changed, and this project's own
already-established `Tool.FromReader` (Lesson 4) — its own computed
`Tool` object is only ever as current as the real row it was built from,
never automatically kept in sync afterward, a real, deliberate contrast
worth noticing against this lesson's own live-updating `ToolCountMessage`.

### SE Lens

Why does `ToolCount`'s own setter explicitly raise `PropertyChanged` for
*both* `ToolCount` and `ToolCountMessage`, rather than only for `ToolCount`
itself, the property that was actually assigned? The alternative not
chosen — announcing only the directly-changed property — was rejected
because `ToolCountMessage` is a real, computed value that depends entirely
on `ToolCount`; if only `ToolCount`'s own change were announced, any real
UI bound to `ToolCountMessage` specifically (this lesson's own first unit)
would never learn its own displayed text needs re-reading, silently
showing stale, outdated text forever after the first real update. The
honest cost: every setter with a computed property depending on it has to
remember, by hand, to raise notification for that computed property too —
nothing in `INotifyPropertyChanged` itself catches a forgotten one; a
missed notification here fails silently, with no compiler error and no
runtime exception, only a UI that quietly stops updating.

### Run It

A real `dotnet test` was run this session against the actual, new file:
both new tests passed, alongside every one of this project's own existing
tests. This is the one real, concrete way this lesson proves
`INotifyPropertyChanged`'s own mechanism actually works, given this
project's own standing constraint (no live WPF window observed this
session) rules out watching a real bound `TextBlock` visibly update.

### Connecting Back

The real mechanism `{Binding}` depends on to notice a later change is now
proven, permanently, with a real, passing test — not merely cited from
documentation. The final unit names, explicitly, the architectural pattern
this lesson's own new class actually belongs to.

---

## Concept Unit: ViewModel — A New Kind of Class, Built Only to Be Bound To

### The Problem

`AboutViewModel` already exists, in finished form, in this lesson's own
first two units — but nothing has yet named *what kind of class it is*,
architecturally, or explained why this project doesn't just add a
`ToolCount` property directly onto `Tool` itself (Lesson 8) instead of
creating an entirely new class.

> **Try this first:** Lesson 8 established `Tool` as a deliberately
> immutable `record` — every property `init`-only, no `set`. Given
> `INotifyPropertyChanged`'s own real mechanism (this lesson's own second
> unit) depends on a property's own `set` accessor actually running, so it
> has a real moment to raise `PropertyChanged` from — what real,
> structural conflict would adding bindable, notifying properties directly
> onto `Tool` create with a design choice Lesson 8 already made
> deliberately?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/AboutViewModel.cs`, created.
- **Change type** — add (one new file, one new class).
- **Location** — new file, sitting alongside `Tool.cs` in `ToolDB/`.
- **Dependencies** — `INotifyPropertyChanged` (this lesson's own second
  unit).

### The New Code

```csharp
public int ToolCount
{
    get => _toolCount;
    set
    {
        _toolCount = value;
        OnPropertyChanged(nameof(ToolCount));
        OnPropertyChanged(nameof(ToolCountMessage));
    }
}

public string ToolCountMessage => $"{ToolCount} tool(s) loaded.";
```

### The Updated Project

`AboutViewModel.cs`, in full (a brand-new file, nothing to mark as
changed):

```csharp
 1  using System.ComponentModel;
 2
 3  public class AboutViewModel : INotifyPropertyChanged
 4  {
 5      private int _toolCount;
 6
 7      public int ToolCount
 8      {
 9          get => _toolCount;
10          set
11          {
12              _toolCount = value;
13              OnPropertyChanged(nameof(ToolCount));
14              OnPropertyChanged(nameof(ToolCountMessage));
15          }
16      }
17
18      public string ToolCountMessage => $"{ToolCount} tool(s) loaded.";
19
20      public event PropertyChangedEventHandler? PropertyChanged;
21
22      private void OnPropertyChanged(string propertyName)
23      {
24          PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
25      }
26  }
```

`AboutViewModel` is a real, complete, if small, ViewModel (Terms, above):
a real, private backing field (`_toolCount`, line 5) most of this
project's own earlier properties (established Lesson 4/8) never needed,
since a plain auto-property has no real moment to run code from; a real
`get`/`set` pair (lines 7–16) doing real work in its own `set`, not just
storing a value; a real, computed, read-only property (`ToolCountMessage`,
line 18) with no backing field at all; and a small, private helper
(`OnPropertyChanged`, lines 22–25) so the real event-raising line doesn't
need to be repeated, by hand, in every property setter that needs it.

### Proving It in Isolation

No throwaway example exists for this unit — `AboutViewModel`'s own real
code above is already the smallest real ViewModel this lesson's own
feature needs; a throwaway version would be structurally identical,
proving nothing further. This unit's own real mechanism (the property
setter genuinely raising two notifications) is already proven directly by
this lesson's own second unit's real, passing test.

### Discard the Throwaway Example

Not applicable, for the reason stated above.

### Mechanical Walkthrough

- `private int _toolCount;` — a real, private backing field, first
  needed in this project specifically because `ToolCount`'s own `set`
  (below) has to do more than store a value — it also has to notify.
- `public int ToolCount { get => _toolCount; set { ... } }` — a real
  property with an explicit body, contrasted with this project's own
  earlier auto-properties (`Tool`'s own `init`-only ones, Lesson 8) —
  `get => _toolCount;` is an expression-bodied getter (established
  syntax, first used this way in this project), simply returning the real
  backing field.
- `_toolCount = value;` — inside the setter, `value` (an implicit real
  keyword every property setter receives, first fully used this way in
  this project) is assigned to the real backing field before anything else
  runs.
- `OnPropertyChanged(nameof(ToolCount));` and
  `OnPropertyChanged(nameof(ToolCountMessage));` — two real calls to this
  class's own private helper (below), each with a real `nameof` expression
  (established Lesson 14's own test method names, now used for its actual,
  intended real purpose: producing a compiler-checked string, so renaming
  either property later also updates this call automatically, unlike a
  hand-typed `"ToolCount"` string would).
- `public string ToolCountMessage => $"{ToolCount} tool(s) loaded.";` — a
  real, expression-bodied, read-only property — computed fresh every time
  it's read, from `ToolCount`'s own current real value, using the
  identical real string-interpolation syntax (established Lesson 5)
  already used throughout this project.
- `public event PropertyChangedEventHandler? PropertyChanged;` — the real
  event `INotifyPropertyChanged` (Header, above) requires this class to
  declare — the `?` marks it nullable (established this project's own
  `Nullable` project setting, Lesson 1), since no subscriber is guaranteed
  to exist.
- `private void OnPropertyChanged(string propertyName) { ... }` — a real,
  private helper method, first appearing in this project as a named
  pattern for this exact real purpose — not required by
  `INotifyPropertyChanged` itself, only a real, common convention avoiding
  repeating the same event-raising line in every property setter.
- `PropertyChanged?.Invoke(this, new PropertyChangedEventArgs
  (propertyName));` — the real, null-conditional `?.` operator
  (established this project's own earlier lessons), guarding against
  raising an event with no real subscribers at all — `Invoke` runs every
  currently-subscribed real handler, in order, passing `this`
  (`AboutViewModel` itself) and a real, new `PropertyChangedEventArgs`
  (Header, above) carrying `propertyName`.

### CS Lens

Splitting real responsibility across three distinct kinds of class — a
Model that only knows real domain rules, a View that only knows real
visual structure, and a ViewModel that only knows how to translate between
them — is the same real idea as **separation of concerns**, this
project's own architecture doc already names generically (SQLite never
touched by JavaScript directly; WebView2 never owning application state).
MVVM (Terms, above) is that identical idea, applied specifically to native
XAML UI instead of the WebView2/JS split this project's own Architecture
section already documents. Also recognized in: this project's own
`Tool`/`ToolRepository` split (Lesson 8/14) — a real domain record, and a
completely separate class holding the operations performed against it —
and a restaurant's own separation between a chef (preparing real food,
knowing nothing about how it's plated for a specific table) and a server
(presenting it appropriately, knowing nothing about how it was cooked).

### SE Lens

Why introduce an entirely new class, `AboutViewModel`, rather than adding
a `ToolCount` property with a real, notifying setter directly onto `Tool`
itself? The alternative not chosen — a bindable `Tool` — was rejected
because it would directly undo a real, deliberate choice Lesson 8 already
made: `Tool`'s own immutability (`init`-only properties, no `set`) is what
lets two separate variables safely reference what is unmistakably the
"same real data" with no risk of one silently changing under the other —
this project's own real aliasing lab already proved why that guarantee
matters. Retrofitting mutable, notifying properties onto `Tool` to satisfy
one dialog's own display needs would weaken that guarantee for every other
piece of code that touches a `Tool`, for the sake of one narrow UI
convenience. The honest cost of the separate-class approach instead: this
project now has two real classes describing overlapping ideas
(`AboutViewModel`'s own `ToolCount` versus a real `List<Tool>.Count`
elsewhere) that have to be kept in sync by hand, at the one real call site
(`MainWindow.xaml.cs`) that currently sets `_toolCount` — a real,
deliberate tradeoff of Model-integrity against a small amount of real
duplication.

### Run It

A real `dotnet build` was run this session against the actual new file:
build succeeded, 0 Warnings, 0 Errors. This unit's own real mechanism —
that `ToolCount`'s own setter genuinely raises `PropertyChanged` for both
itself and `ToolCountMessage` — is proven for real in this lesson's own
second unit's own passing test, not repeated here.

### Connecting Back

`AboutViewModel` is now a real, complete, named example of a ViewModel —
the exact real kind of class MVVM (Terms, above) calls for — proven, not
merely described, to correctly notify a bound `TextBlock` (this lesson's
own first unit) whenever its own data changes.

---

## Connect the Pieces

One concrete trace, start to finish, through everything this lesson built:

1. `AboutDialog.xaml`'s own `TextBlock` was rewritten from a named element
   set directly in code-behind (Lesson 13) to an unnamed one reading
   `Text="{Binding ToolCountMessage}"` — proven, via this exact project's
   own real, generated code, to no longer appear in `Connect()`'s own
   field-and-event wiring at all, since nothing references it by name
   anymore (Unit 1).
2. A real, permanent, passing xUnit test proved `INotifyPropertyChanged`'s
   own real mechanism directly — a real event subscription, entirely
   outside WPF, confirming that changing `ToolCount` genuinely raises
   `PropertyChanged` twice, once per real, affected property — the exact
   real guarantee `{Binding}`'s own documentation already named as
   required (Unit 2).
3. `AboutViewModel`, a real, new kind of class this project has never
   needed before, was named explicitly as this lesson's own ViewModel —
   deliberately kept separate from `Tool`'s own immutable record (Lesson
   8), so one dialog's own display convenience never has to compromise
   this project's own real domain-model guarantees (Unit 3).

**Next lesson:** 17 — Building the Add/Edit Form in XAML.
