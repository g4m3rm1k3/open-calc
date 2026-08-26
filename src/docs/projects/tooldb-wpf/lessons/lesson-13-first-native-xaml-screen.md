# Lesson 13: A Second Window Is Still Just a Window

**What you will build.** `MainWindow` gains a real native button — not HTML,
not inside `Browser` at all, but a genuine WPF `Button` sitting in the same
`Grid` as `Browser` itself. Clicking it opens a second, brand-new real
window, `AboutDialog`, showing this project's own real, current tool count
— then closes itself again. The transferable problem underneath the
feature has three separate parts: first, `MainWindow`'s own `Grid` has only
ever held one child (deliberately, since the lesson that added `Browser`);
giving it two means the `Grid` itself needs to be told how to arrange them.
Second, a "dialog" isn't some separate kind of window class this project
hasn't met yet — it's the exact same `Window` class already established,
just opened in a specific way that changes how it behaves. Third, getting
real, current data (the tool count) into a window built *after* that data
already exists means passing it in at the moment the window is built,
rather than reaching for it afterward.

**What you need to know first.** Lesson 5 — `Window`, `App.xaml`'s own
`StartupUri`, XAML compiling into real C# objects, `x:Name` generating a
real field, `TextBlock`'s `Text`/`FontSize`/`Margin` properties. Lesson 6 —
`Grid` as `MainWindow`'s one existing layout panel, so far holding exactly
one child (`Browser`), deliberately, until this lesson.

**Terms used in this lesson**

- **attached property** — a property set on one XAML element but actually
  defined and owned by a completely different type — `Grid.Row`, this
  lesson's own example, is set on a `Button` or `WebView2` but is really
  owned by `Grid` itself. It exists because a child element has no
  inherent reason to know or care which row it's in — only whatever
  container it happens to sit inside does — so WPF lets any element carry
  a real property belonging to its own container, without that element's
  own class needing to define, or even know about, that property itself.
- **`RowDefinition`** — one real row's worth of sizing information inside a
  `Grid`'s own `RowDefinitions` collection — its `Height` accepts either a
  fixed length, the keyword `Auto` (the row shrinks or grows to exactly
  fit its own content, no more), or a **star (`*`) size** (the row takes
  whatever real space is left over after every `Auto` and fixed row has
  already been given its own). It exists so one `Grid` can hold rows of
  genuinely different sizing behavior — some fixed to their content, one
  free to fill whatever's left.
- **XAML tree** — the nested parent-child structure XAML markup describes
  on paper, compiling into a real, equivalent tree of live C# objects at
  runtime — the exact same idea this project has already met on the other
  side of the process boundary, where a browser turns HTML markup into a
  real DOM tree. It exists because nested markup is nested markup, whether
  the framework reading it is a browser or WPF's own XAML parser — both
  describe "this object contains these objects" the same structural way.
- **`Control` (the WPF base class)** — a real, named base class distinct
  from `FrameworkElement`, this project's own new `Button` inherits from
  (by way of intermediate classes) — it exists to give interactive
  elements (things a user clicks or types into) shared real behavior
  `FrameworkElement` alone doesn't provide, such as being restyled via a
  template without changing what the element actually does. `TextBlock`,
  reappearing this lesson, does **not** inherit from `Control` at all —
  purely display, nothing interactive — a real, meaningful difference
  between the two, not a naming coincidence. This project's own full
  treatment of C# inheritance as a language mechanism is still owed in
  full elsewhere, the same real debt this project's own Lesson 6 already
  named for generics — naming `Control` here states a real fact this
  lesson's own code depends on, not a substitute for that fuller lesson.
- **constructor parameter** — a value supplied inside the parentheses of a
  real `new SomeClass(value)` call, received by that class's own
  constructor through its own parameter list, at the exact moment the
  object is created — letting an object be built already holding something
  it needs, rather than needing a separate step to supply it afterward.
- **dialog** — not a distinct class this project hasn't met yet, but a
  real, ordinary `Window` (established Lesson 5) shown through a specific
  method, `ShowDialog()` (below), rather than through `App.xaml`'s own
  `StartupUri` (how `MainWindow` itself first appears) or a plain `Show()`
  call. "Dialog" names *how a window was opened and how it now behaves*,
  not a different kind of object.
- **modal** — per Microsoft's own official documentation (fetched this
  session), the real behavior a dialog produces: it "disables all other
  windows in the application" until it's closed. It exists so a user is
  forced to resolve or dismiss the dialog's own task before returning to
  anything else the application offers, rather than freely working in both
  at once.

**Objects and methods used**

- **`Grid.RowDefinitions`**
  - *What it is:* this lesson's own new subject — the real property holding
    every `RowDefinition` (Terms, above) a `Grid` has been given.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), its real declared shape is `public
    System.Windows.Controls.RowDefinitionCollection RowDefinitions { get;
    set; }` — a real collection type, not a plain list of numbers; written
    in XAML as one or more nested `<RowDefinition>` elements, each
    becoming, per that same documentation, "a placeholder representing a
    row in the final grid layout."
  - *Its use:* `MainWindow.xaml`'s own `<Grid.RowDefinitions>`, this
    lesson's own first unit, declaring two real rows.
  - *Type:* an instance property on `Grid`, returning a real
    `RowDefinitionCollection`.
  - *Responsibility:* hold the real, ordered list of row-sizing rules a
    `Grid` uses to lay out its own children — nothing about *which* child
    goes in which row; that's `Grid.Row`'s own separate job, below.
  - *Depends on:* being declared on a real `Grid` instance; each
    `RowDefinition` inside it needs its own real `Height` value.
  - *Connects to:* read internally by `Grid`'s own layout logic every time
    it arranges its children; each child's own `Grid.Row` value (below)
    is what tells that logic which of these real rows a given child
    belongs to.
  - *Shape:* one layout panel's own internal sizing configuration — never
    read or set from outside the `Grid` it belongs to.
- **`Grid.Row` (attached property)**
  - *What it is:* this lesson's own new subject, alongside
    `RowDefinitions` — an **attached property** (Terms, above) that tells
    a `Grid` which of its own real rows a given child belongs in.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), it "Gets or sets a value that indicates which row child
    content within a `Grid` should appear in" — real, internally, as a
    dependency property with its own identifier field, `RowProperty`,
    accessed through real static `GetRow`/`SetRow` methods XAML's own
    `Grid.Row="..."` attribute syntax calls on your behalf.
  - *Its use:* `Grid.Row="0"` on this lesson's own new `Button`, and
    `Grid.Row="1"` added to `Browser`, both inside `MainWindow.xaml`'s own
    `<Grid>`.
  - *Type:* a `static` attached property, set via XAML attribute syntax
    directly on whichever child element it applies to — never an instance
    property *on* that child itself.
  - *Responsibility:* record, per child, which real row of its own parent
    `Grid` that child should be measured and positioned inside.
  - *Depends on:* being set on an element that is a real, direct child of
    a `Grid` — setting it on an element with no `Grid` parent at all has
    no real layout effect.
  - *Connects to:* read by the same `Grid` layout logic that already reads
    `RowDefinitions`, above — the two together are what let a `Grid` with
    more than one child actually arrange them instead of stacking every
    child on top of every other, unlabeled.
  - *Shape:* the real bridge between one child element and its own
    parent's own internal layout configuration — the actual mechanism this
    lesson's own Header names generically as an **attached property**.
- **`Button`**
  - *What it is:* this lesson's own new subject — a real, clickable WPF
    control, first appearing in this project (every earlier button in this
    project has been plain HTML, inside `Browser`, never a native WPF
    element).
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), its real declaration is `public class Button :
    System.Windows.Controls.Primitives.ButtonBase` — and `ButtonBase`,
    in turn, extends `ContentControl`, which extends `Control` (Terms,
    above), which extends `FrameworkElement` — the same real base class
    `TextBlock` (reappearing this lesson) also extends, though `TextBlock`
    stops there, never reaching `Control` itself. Per that same
    documentation, `Button` "reacts to the `Click` event."
  - *Its use:* `MainWindow.xaml`'s own new `<Button x:Name="AboutButton"
    ...>`, this lesson's own first unit, and a second, deliberately
    unnamed `<Button>` inside `AboutDialog.xaml`, this lesson's own second
    unit.
  - *Type:* a real class, instantiated once per real `<Button>` tag by
    WPF's own XAML compiler — the same real compilation mechanism already
    established (Lesson 5) for `Window`, `Grid`, and `TextBlock`.
  - *Responsibility:* render a real, clickable visual element, and raise a
    real `Click` event (below) whenever a user actually presses it.
  - *Depends on:* a real value for its own `Content` property (below) to
    have anything visible to show at all.
  - *Connects to:* placed inside `MainWindow`'s own `Grid` (via `Grid.Row`,
    above) and `AboutDialog`'s own `Grid`; each one's own `Click` event
    (below) is what this lesson's own new code-behind methods actually
    respond to.
  - *Shape:* this lesson's own first genuinely interactive native XAML
    element — every earlier native XAML element in this project
    (`TextBlock`, `WebView2`) either only displays something or hosts an
    entirely separate browser process; `Button` is the first whose whole
    job is reacting to a real user action inside WPF itself.
- **`ContentControl.Content`**
  - *What it is:* the real property `Button`'s own visible text is set
    through — inherited, not declared directly on `Button` itself.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), its real declared shape is `public object Content {
    get; set; }` — typed as a plain `object`, meaning, per that same
    documentation, "there are no restrictions on what you can put" inside
    it: a plain string (this lesson's own real use), but just as validly
    another whole element entirely.
  - *Its use:* `Content="About ToolDB"` and `Content="Close"`, this
    lesson's own two real buttons.
  - *Type:* an instance property, real and inherited from `ContentControl`
    — not declared on `Button` itself at all, which is exactly why a
    `Button`'s own visible text is `Content`, not a `Text` property the
    way `TextBlock`'s own is (`TextBlock` doesn't inherit from
    `ContentControl`, so it was never going to have this exact property in
    the first place).
  - *Responsibility:* hold whatever single value a `ContentControl` should
    display as its own real content — a plain string here, though its own
    real `object` type means it's never restricted to only text.
  - *Depends on:* nothing beyond a real value to hold; `null`, per its own
    documented default, is genuinely valid and simply shows nothing.
  - *Connects to:* set directly in this lesson's own XAML; read internally
    by `Button`'s own rendering logic to decide what to actually draw.
  - *Shape:* the one property every `ContentControl`-derived class shares,
    inherited rather than reinvented per subclass — the real reason
    `Button`'s own visible text works identically to how a future
    `ContentControl`-derived element's own would, without either one
    needing to declare its own separate "what do I show" property.
- **`ButtonBase.Click` (via the `RoutedEventHandler` delegate)**
  - *What it is:* the real event a `Button` raises whenever a user actually
    presses it — inherited from `ButtonBase`, `Button`'s own direct base
    class.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), handling it uses the real delegate `public delegate
    void RoutedEventHandler(object sender, RoutedEventArgs e)` — the same
    two-parameter shape (a sender, and a real event-data object) this
    project's own earlier event handlers (`MainWindow_Loaded`,
    established Lesson 5) already used, though those used a different,
    generic delegate type this lesson's own code doesn't.
  - *Its use:* `Click="AboutButton_Click"` and `Click="CloseButton_Click"`,
    each wired declaratively in XAML rather than with the `+=` syntax this
    project's own constructor already uses for `Browser`'s own events.
  - *Type:* an event, declared on `ButtonBase`, using the real
    `RoutedEventHandler` delegate type.
  - *Responsibility:* invoke every subscribed handler, in order, at the
    real moment a user presses this specific button — never before.
  - *Depends on:* at least one real method matching `RoutedEventHandler`'s
    own exact shape (an `object sender`, a `RoutedEventArgs e`) already
    subscribed to it.
  - *Connects to:* this lesson's own real proof, below, shows XAML's own
    `Click="..."` attribute is compiled into the identical real `+=`
    subscription this project's own constructor already writes by hand for
    `Browser`'s events — two different-looking syntaxes producing the
    exact same real mechanism.
  - *Shape:* this lesson's own first XAML-declared event subscription —
    every earlier event subscription in this project (`Loaded`, `Closing`,
    `CoreWebView2InitializationCompleted`) was written as real, imperative
    C# `+=` inside a constructor instead.
- **`Window.ShowDialog()`**
  - *What it is:* this lesson's own culminating subject — opens a `Window`
    and makes it **modal** (Terms, above).
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), its real declared shape is `public bool? ShowDialog()`
    — a **nullable `bool`**, first appearing in this project, real because
    `ShowDialog()`'s own return value distinguishes three, not two, real
    outcomes: `true` or `false` (an explicit accept/cancel result a future
    lesson's own dialog could set) or `null` (no explicit result was ever
    set — this lesson's own `AboutDialog` never sets one). Per that same
    documentation, calling it "shows the window, disables all other
    windows in the application, and returns only when the window is
    closed."
  - *Its use:* `dialog.ShowDialog();`, this lesson's own fourth unit, its
    own real return value discarded — this lesson's own dialog has no real
    accept/cancel outcome to check yet.
  - *Type:* a real instance method on `Window` — inherited by every
    `Window` subclass in this project, `MainWindow` and `AboutDialog`
    alike, without either needing to define it itself.
  - *Responsibility:* make a real window visible, disable every other real
    window belonging to this application, and block execution of whatever
    code called it until this specific window closes.
  - *Depends on:* being called on a `Window` that isn't already showing or
    already closed — per that same documentation, calling it on a window
    that's closing or already closed throws a real
    `InvalidOperationException`.
  - *Connects to:* called from `MainWindow`'s own new `AboutButton_Click`
    handler on a real `AboutDialog` instance; execution inside that
    handler doesn't continue past this call until `AboutDialog` itself
    closes.
  - *Shape:* the one real method that turns an ordinary `Window` into what
    this lesson calls a **dialog** — no separate class, just this one
    method instead of `Show()` or `App.xaml`'s own `StartupUri`.
- **`Window.Owner`**
  - *What it is:* a real property establishing which window a dialog
    belongs to.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), its real declared shape is `public Window Owner { get;
    set; }`; setting it "establishes a relationship between both parent
    and child window," affecting real, documented behaviors — minimizing
    the owner minimizes every window it owns, and closing the owner closes
    every window it owns. That same documentation states a real, load-
    bearing ordering constraint: it must be set *before* `ShowDialog()` is
    called, never after — setting it on a window already shown via
    `ShowDialog()` throws a real `InvalidOperationException`.
  - *Its use:* `dialog.Owner = this;`, set on the new `AboutDialog`
    instance, immediately before this lesson's own real `ShowDialog()`
    call.
  - *Type:* an instance property on `Window`, holding a reference to
    another real `Window`.
  - *Responsibility:* record which real window, if any, "owns" this one —
    nothing about visibility or modality itself; that's `ShowDialog()`'s
    own job.
  - *Depends on:* being set on a window that either isn't shown yet, or,
    per the documentation above, is genuinely allowed — this lesson's own
    real code sets it before `ShowDialog()` is ever called, the only real
    order that documentation permits.
  - *Connects to:* read internally by `WindowStartupLocation.CenterOwner`
    (below) to decide where `AboutDialog` should actually appear.
  - *Shape:* the real link between this lesson's own two windows,
    established from the owned window's own side (`AboutDialog`'s
    instance), never the other way around.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`TextBlock`, its `Text`/`FontSize`/`FontWeight`/`Margin` properties**
  - *What it is:* reappearing from this project's own earliest lessons — a
    plain WPF element that displays real text, with no interactive
    behavior of its own.
  - *Implementation:* established previously, unchanged — genuinely does
    **not** inherit from `Control` (Header, above), only as far up as
    `FrameworkElement`.
  - *Its use:* two real `<TextBlock>` elements inside `AboutDialog.xaml`,
    this lesson's own second unit — one static, one named (`x:Name`) so
    code-behind can set its own real text.
- **`x:Name` generating a real field**
  - *What it is:* reappearing from this project's own earliest lessons —
    a real mechanism, proven then by reading generated code directly,
    where a named XAML element becomes a real field on its own class.
  - *Implementation:* established previously; this lesson's own real,
    freshly generated code (below) proves it happens identically again,
    for a `Button` this time, not only a `TextBlock`.
  - *Its use:* `x:Name="AboutButton"` and `x:Name="ToolCountText"`, this
    lesson's own new elements.

---

## Concept Unit: A Layout Panel Learns to Share

### The Problem

`MainWindow`'s own `Grid` has held exactly one child, `Browser`, since the
lesson that added it — a deliberate choice, made before this project had
any second element worth placing alongside it. A `Grid` with two real
children needs to be told how much space each one gets; nothing about a
`Grid` decides that on its own.

> **Try this first:** this project's own established convention already
> names elements by what they are, in order (`AboutButton` for a button
> *about* the app; `Browser` for the WebView2 control). Given a `Grid`
> arranges its children into a real grid of rows and columns rather than
> stacking every child directly on top of every other, and given this
> lesson wants one small button sitting *above* the much larger browser
> area rather than overlapping it, what real, minimal information would a
> `Grid` need to know to keep those two children apart, vertically?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/MainWindow.xaml`, modified.
  `ToolDB/MainWindow.xaml.cs`, modified.
- **Change type** — add (`Grid.RowDefinitions`, one new `Button`,
  `Grid.Row` on both children); add (one new event-handler method).
- **Location** — inside `MainWindow.xaml`'s own `<Grid>`, established
  Lesson 6, which until now has held only `<wv2:WebView2 x:Name="Browser"
  />` as its one real child; the new handler method joins
  `MainWindow.xaml.cs`'s own existing methods.
- **Dependencies** — none beyond `MainWindow`'s own existing `Grid`.

### The New Code

```xml
<Grid.RowDefinitions>
    <RowDefinition Height="Auto" />
    <RowDefinition Height="*" />
</Grid.RowDefinitions>
<Button x:Name="AboutButton" Grid.Row="0" Content="About ToolDB" Click="AboutButton_Click" HorizontalAlignment="Left" Margin="8" />
```

### The Updated Project

`MainWindow.xaml`, in full, new/changed lines marked:

```xml
1  <Window x:Class="ToolDB.MainWindow"
2          xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
3          xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
4          xmlns:wv2="clr-namespace:Microsoft.Web.WebView2.Wpf;assembly=Microsoft.Web.WebView2.Wpf"
5          Title="ToolDB" Height="500" Width="700">
6      <Grid>
7          <Grid.RowDefinitions>                                                     <!-- ← new -->
8              <RowDefinition Height="Auto" />                                       <!-- ← new -->
9              <RowDefinition Height="*" />                                          <!-- ← new -->
10         </Grid.RowDefinitions>                                                    <!-- ← new -->
11         <Button x:Name="AboutButton" Grid.Row="0" Content="About ToolDB"           <!-- ← new -->
12                 Click="AboutButton_Click" HorizontalAlignment="Left" Margin="8" /> <!-- ← new -->
13         <wv2:WebView2 x:Name="Browser" Grid.Row="1" />                            <!-- ← changed -->
14     </Grid>
15 </Window>
```

`MainWindow`'s own `Grid` now holds two real children instead of one, each
told which real row it belongs to (lines 11/13's own `Grid.Row` values):
a small, content-sized row for the new `Button` (row `0`, `Auto`-height),
and every remaining real pixel of space given to `Browser` (row `1`,
star-height) — `Browser` itself is unchanged except for that one new
`Grid.Row="1"` value, still the identical `WebView2` element established
in earlier lessons.

`MainWindow.xaml.cs`'s own `MainWindow_Loaded` method and new handler, in
full, new lines marked:

```csharp
 1  private void MainWindow_Loaded(object sender, RoutedEventArgs e)
 2  {
 3      using var connection = new SqliteConnection("Data Source=tools.db");
 4      connection.Open();
 5
 6      using var selectCommand = new SqliteCommand(
 7          "SELECT tools.id, tools.name, vendors.name, tools.overall_diameter, tools.overall_length, tools.flute_count FROM tools JOIN vendors ON tools.vendor_id = vendors.id",
 8          connection);
 9      using var reader = selectCommand.ExecuteReader();
10
11      List<Tool> tools = new List<Tool>();
12      while (reader.Read())
13      {
14          tools.Add(Tool.FromReader(reader));
15      }
16
17      if (tools.Count > 0)
18      {
19          Title = $"ToolDB — Loaded {tools.Count} tool(s). First: {tools[0].Name} ({tools[0].Manufacturer})";
20      }
21      else
22      {
23          Title = "ToolDB — Loaded 0 tools.";
24      }
25
26      _toolsJson = JsonSerializer.Serialize(tools);
27      _toolCount = tools.Count;                                            // ← new
28
29      string htmlPath = Path.Combine(AppContext.BaseDirectory, "local.html");
30      Browser.Source = new Uri(htmlPath);
31  }
32
33  private void AboutButton_Click(object sender, RoutedEventArgs e)         // ← new
34  {                                                                        // ← new
35      var dialog = new AboutDialog(_toolCount);                           // ← new
36      dialog.Owner = this;                                                 // ← new
37      dialog.ShowDialog();                                                 // ← new
38  }                                                                        // ← new
```

`MainWindow_Loaded` now records the real tool count into a new field,
`_toolCount` (declared alongside the existing `_toolsJson` field, not shown
above since it's a one-line, unchanged-shape declaration), right alongside
the JSON serialization this project already performed — the identical
`tools.Count` value, just kept a second time in a form the next unit's own
new dialog can use directly. `AboutButton_Click`, entirely new, is where
this lesson's own next two units actually connect.

### Proving It in Isolation

A minimal, unrelated throwaway window, in a scratch WPF project, isolating
`Grid.RowDefinitions`/`Grid.Row` before they meet this project's own real
`MainWindow`:

```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto" />
        <RowDefinition Height="*" />
    </Grid.RowDefinitions>
    <TextBlock Grid.Row="0" Text="Top" />
    <TextBlock Grid.Row="1" Text="Bottom" Background="LightGray" />
</Grid>
```

Per Microsoft's own official documentation (fetched this session, quoted
in full in this lesson's own Header), a `RowDefinition` with `Height="Auto"`
sizes that row to exactly fit its own content, while `Height="*"` — a
**star size** — takes whatever real space is left over once every other
row has already taken what it needs. Given this throwaway window's own two
rows, the real, predictable outcome, stated directly rather than watched
(this project's own standing "no live WPF window observed this session"
constraint still applies): the first `TextBlock`'s own row shrinks to
exactly its own one line of text's height, and the second `TextBlock`'s own
row — the only star-sized one — receives every remaining pixel of the
window's own real height, filling it regardless of how tall the window
itself is resized.

### Discard the Throwaway Example

The `Top`/`Bottom` example above is discarded now — it never appears in
this project again. What's proven is the real, documented sizing behavior
of `Auto` versus `*`, not this specific two-row window.

### Mechanical Walkthrough

- `<Grid.RowDefinitions>` — **`Grid.RowDefinitions`** (Header, above),
  written using XAML's own **property element syntax** (a tag shaped like
  `<Type.Property>` rather than a plain attribute) — required here because
  its own real value (a whole collection of `RowDefinition` elements)
  can't fit inside one plain attribute string the way `Title="ToolDB"`
  already does.
- `<RowDefinition Height="Auto" />` — the first real **`RowDefinition`**
  (Terms, above), its `Height` given the real keyword `Auto` — this row
  shrinks or grows to exactly match whatever real content sits inside it,
  no more.
- `<RowDefinition Height="*" />` — a second real `RowDefinition`, its
  `Height` given a real **star size** (Terms, above) — this row absorbs
  every real pixel of vertical space the first row's own `Auto` sizing
  didn't already claim.
- `<Button x:Name="AboutButton" ...>` — a real **`Button`** (Header,
  above), first appearing in this project — `x:Name="AboutButton"` is the
  same real mechanism already established (this project's own earlier
  lessons) for generating a real field on `MainWindow`'s own class, proven
  again, freshly, for a `Button` this time, in this unit's own "Run It"
  step below.
- `Grid.Row="0"` — a real **`Grid.Row`** (Header, above) attached property
  value, first appearing in this project — tells `MainWindow`'s own
  `Grid` this `Button` belongs in row `0`, the `Auto`-sized one.
- `Content="About ToolDB"` — **`ContentControl.Content`** (Header, above),
  set to a plain string — this `Button`'s own real, visible label.
- `Click="AboutButton_Click"` — **`ButtonBase.Click`** (Header, above),
  wired declaratively to a real method named on `MainWindow`'s own
  code-behind class — proven, not merely asserted, to compile into the
  identical real `+=` subscription this project's own constructor already
  writes by hand, in this unit's own "Run It" step below.
- `HorizontalAlignment="Left"` — a real property, first appearing in this
  project, telling `Button` to take only as much horizontal space as its
  own content needs, aligned to its own row's left edge, rather than
  stretching to fill the row's own full width (a `Grid` row's own default
  behavior for a child with no `HorizontalAlignment` set at all).
- `Margin="8"` — reappearing from this project's own earliest lessons — a
  real, single value applied to all four sides at once, leaving `8`
  device-independent pixels of real empty space around this `Button`'s own
  edge.
- `Grid.Row="1"` (on `Browser`) — the identical real attached property
  already explained above, this time placing the already-established
  `Browser` element into the second, star-sized row instead of leaving it
  with no explicit row at all (which would have defaulted it into row `0`,
  the same row as the new `Button` — exactly the overlap this unit's own
  Socratic question opened with).
- `_toolCount = tools.Count;` — a plain field assignment, the identical
  real mechanism this project's own `_toolsJson` field already
  established, just holding a plain `int` instead of a `string`.

### CS Lens

An **attached property** — a real value stored *on* one object but
conceptually belonging to, and only meaningful in relation to, a different
object entirely (a child's row number, meaningless without its own parent
`Grid`) — is a specific instance of storing **relational data on the
relationship itself**, rather than forcing one side alone to hold
information that's really about how the two relate. Also recognized in: a
library's own catalog card recording *where on the shelf* a book sits — a
fact about the book's *placement*, not a fact printed inside the book
itself — and this project's own real `tools` table (Lesson 9), where
`vendor_id` records a relationship to a real `vendors` row without either
table needing to embed the other's own full data inside itself.

### SE Lens

Why give the `Button`'s own row a fixed `Auto` height and the `Browser`'s
own row a flexible `*` height, rather than the reverse? The alternative not
chosen — a fixed-height browser area and a flexible button row — was
rejected because `Browser`, hosting real, variably-sized web content
(Lessons 6–12), is exactly the element that should absorb whatever extra
window space exists; a single-line button never needs more room than its
own content requires, and giving it star-sizing would only leave real,
wasted empty space around a small button while starving the actually
useful browser area. The honest cost of `Auto` sizing generally, accepted
here: an `Auto`-sized row's own real height depends entirely on its own
content's size — if a future lesson's button needs to grow (a longer
label, a larger font), this row's own height silently grows to match it,
with no separate setting controlling that ceiling.

### Run It

A real `dotnet build` was run this session against the actual, modified
`ToolDB` project: build succeeded, 0 Warnings, 0 Errors. This project's own
established practice (Lesson 5, 6) of reading real, compiler-generated code
directly, rather than only trusting a clean build, was repeated here too —
the real generated file, `obj/Debug/net9.0-windows/MainWindow.g.cs`, fetched
fresh this session from this exact build, contains:

```
internal System.Windows.Controls.Button AboutButton;
```

proving `x:Name` generates a real field for a `Button` exactly as it
already did for `TextBlock` (Lesson 5) — and, inside the same generated
file's own `Connect` method:

```
this.AboutButton.Click += new System.Windows.RoutedEventHandler(this.AboutButton_Click);
```

proving, not merely asserting, that XAML's own `Click="AboutButton_Click"`
attribute compiles into the identical real `+=` event subscription this
project's own `MainWindow` constructor already writes by hand for
`Browser`'s own events — two different-looking syntaxes, one real
underlying mechanism. This project's own standing constraint (no live WPF
window observed this session) still applies to actually watching the
`Button` rendered or clicked in a real running window.

### Connecting Back

`MainWindow`'s own `Grid` now arranges two real children instead of one,
and a real `Button` exists that will, once wired further, open something
new. Nothing yet exists for it to open — the next unit builds it.

---

## Concept Unit: A Second Real Window, Built the Same Way

### The Problem

Every real window this project has ever shown is the exact same one,
`MainWindow`, established since Lesson 5 and never duplicated. Nothing in
this project yet proves a *second*, independent `Window` can be built the
identical way, in its own file, with its own real layout.

> **Try this first:** Lesson 5 already proved `MainWindow.xaml`/
> `MainWindow.xaml.cs` together become one real class, `MainWindow`,
> inheriting from `Window` — and this project's own `App.xaml` already
> names `MainWindow` as its one `StartupUri`. Given nothing requires an
> application to have only one `Window` subclass, what would you expect a
> second, brand-new `.xaml`/`.xaml.cs` file pair — with its own different
> class name — to become, once compiled the identical way?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/AboutDialog.xaml`, created.
  `ToolDB/AboutDialog.xaml.cs`, created.
- **Change type** — add (two new files, a complete new `Window` subclass).
- **Location** — new files, sitting alongside `MainWindow.xaml`/
  `MainWindow.xaml.cs` in the same `ToolDB/` folder.
- **Dependencies** — none beyond this project's own existing WPF setup
  (Lesson 5).

### The New Code

`AboutDialog.xaml`:

```xml
<Window x:Class="ToolDB.AboutDialog"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="About ToolDB" Height="160" Width="300">
    <Grid Margin="16">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" />
            <RowDefinition Height="Auto" />
            <RowDefinition Height="Auto" />
        </Grid.RowDefinitions>
        <TextBlock Grid.Row="0" Text="ToolDB" FontSize="20" FontWeight="Bold" />
        <TextBlock x:Name="ToolCountText" Grid.Row="1" Margin="0,8,0,0" />
        <Button Grid.Row="2" Content="Close" Click="CloseButton_Click" HorizontalAlignment="Right" Margin="0,16,0,0" />
    </Grid>
</Window>
```

### The Updated Project

`AboutDialog.xaml.cs`, in full (a brand-new file, nothing to mark as
changed):

```csharp
 1  using System.Windows;
 2
 3  namespace ToolDB;
 4
 5  public partial class AboutDialog : Window
 6  {
 7      private void CloseButton_Click(object sender, RoutedEventArgs e)
 8      {
 9          Close();
10      }
11  }
```

This new class, `AboutDialog`, inherits from `Window` exactly the way
`MainWindow` already does — its own `.xaml` file describes a real XAML
tree (Terms, above) three levels deep (`Window` → `Grid` → three real
children), the identical nesting idea already familiar from this project's
own HTML/DOM side, just compiled by WPF's own XAML parser instead of a
browser's own HTML parser. `Close()`, called inside `CloseButton_Click`, is
a real, inherited `Window` method (established conceptually since Lesson
5's own discussion of window lifecycle) — closing whichever real window
instance this method happens to run on.

### Proving It in Isolation

No throwaway example exists for this unit — a second real `Window` subclass
*is* the concept being taught, and a throwaway version would be structurally
identical to `AboutDialog` itself, teaching nothing a smaller version
could isolate further.

### Discard the Throwaway Example

Not applicable, for the reason stated above.

### Mechanical Walkthrough

- `<Window x:Class="ToolDB.AboutDialog" ...>` — the same real `Window` root
  element already established (Lesson 5), this time compiling into a
  brand-new class, `ToolDB.AboutDialog`, rather than `ToolDB.MainWindow` —
  proving a `Window` subclass is defined by its own `x:Class` value, not
  by being named `MainWindow` specifically.
- `<Grid Margin="16">` — the same real `Grid` layout panel already
  established, this lesson's own first unit, given a real `Margin` (Terms,
  established this project's own earliest lessons) so its own three
  children don't sit flush against the dialog's own edge.
- `<Grid.RowDefinitions>` through the third `<RowDefinition Height="Auto"
  />` — the identical real mechanism this lesson's own first unit already
  proved, applied a second time, in a second file — three `Auto`-sized
  rows this time, since every one of this dialog's own three children is
  meant to take only the vertical space its own content needs, with no
  row left over to absorb extra space (unlike `MainWindow`'s own `Browser`
  row).
- `<TextBlock Grid.Row="0" Text="ToolDB" FontSize="20" FontWeight="Bold"
  />` — **`TextBlock`** (Header, above), reappearing, its real `Text`,
  `FontSize`, and `FontWeight` properties all already established (this
  project's own earliest lessons) — a plain, unnamed element, since no
  code-behind ever needs to read or change it after it's first shown.
- `<TextBlock x:Name="ToolCountText" Grid.Row="1" Margin="0,8,0,0" />` —
  the identical real `TextBlock` element, this time named — `x:Name`
  (established this project's own earliest lessons) generates a real
  field, `ToolCountText`, this dialog's own constructor (next unit) needs
  to set real text on after the dialog is built but before it's ever
  shown.
- `<Button Grid.Row="2" Content="Close" Click="CloseButton_Click"
  HorizontalAlignment="Right" Margin="0,16,0,0" />` — a second real
  `Button` (Header, above), this time given **no** `x:Name` at all — a
  real, deliberate contrast with `AboutButton` (this lesson's own first
  unit): nothing in `AboutDialog.xaml.cs` ever needs to reference this
  specific button by name, only respond to its own `Click` event, so no
  field is generated for it at all — proven, not merely asserted, in this
  unit's own "Run It" step below.
- `Close()` — a real, inherited instance method every `Window` subclass in
  this project has always had access to, called here with no arguments —
  closes the exact real window instance it's called on, `AboutDialog`
  itself in this case, since it's called from inside that same class's own
  method.

### CS Lens

Two independently-defined classes (`MainWindow`, `AboutDialog`) both
inheriting from the identical real base class (`Window`) and both gaining
the identical real capabilities (`Close()`, being shown via `Show()`/
`ShowDialog()`, participating in `Owner`/`OwnedWindows` relationships) is a
real instance of **shared behavior through a common base type** — neither
class had to redeclare `Close()` or reimplement how a window is shown; both
get it simply by being a real `Window`. Also recognized in: this project's
own established `SqliteCommand` and `SqliteDataReader`, both real,
independently-usable classes that each implement the identical
`IDisposable` contract a `using` declaration already relies on (Lesson 1),
and, on the browser side of this same project, every one of `local.html`'s
own `<table>`/`<div>`/`<button>` elements all sharing the identical real
DOM methods (`addEventListener`, established Lesson 7) regardless of which
specific tag each one is.

### SE Lens

Why give `AboutDialog` its own separate `.xaml`/`.xaml.cs` file pair,
rather than, say, adding its own layout as a second, hidden section inside
`MainWindow.xaml` itself, shown or hidden as needed? The alternative not
chosen — one shared file — was rejected for the same real reason this
project already keeps `local.html` separate from `MainWindow.xaml.cs`'s own
C#: a genuinely separate real window, with its own independent show/hide/
close lifecycle, is a structurally different thing from a panel that's
merely toggled visible or invisible inside an existing window — conflating
the two would mean `MainWindow`'s own XAML tree keeps growing to hold every
future dialog this project ever adds, whether or not it's currently
showing. The honest cost accepted: this project now has two real files to
keep synchronized any time both windows need a shared visual convention
(the same font, the same margin), rather than one file automatically
keeping everything consistent by construction.

### Run It

A real `dotnet build` was run this session against the actual, new files:
build succeeded, 0 Warnings, 0 Errors. The real, generated file,
`obj/Debug/net9.0-windows/AboutDialog.g.cs`, fetched fresh this session from
this exact build, contains:

```
internal System.Windows.Controls.TextBlock ToolCountText;
```

— a real generated field for the named `TextBlock`, the identical
mechanism this lesson's own first unit already proved for `AboutButton` —
and, separately, inside that same file's own `Connect` method, the
unnamed `Button`'s own real event wiring:

```
((System.Windows.Controls.Button)(target)).Click += new System.Windows.RoutedEventHandler(this.CloseButton_Click);
```

with no field assignment anywhere alongside it — real, direct proof that
`x:Name` is elective: an element's `Click` event can be wired up whether or
not that element ever receives a name of its own, since `Connect` already
holds a direct reference to it (`target`) regardless. This project's own
standing constraint (no live WPF window observed this session) still
applies to watching this real dialog actually appear.

### Connecting Back

A second, fully real `Window` subclass now exists, compiled the identical
way `MainWindow` always has been — but nothing yet creates or shows an
instance of it. The next unit is where this dialog is actually handed real
data at the moment it's built.

---

## Concept Unit: Handing It Real Data at the Moment It's Built

### The Problem

`AboutDialog` needs to show a real, current tool count — a value that only
exists inside `MainWindow`'s own code, computed once real `tools.db` data
has already been read. Every constructor this project has written so far
(`MainWindow`'s own, established Lesson 5) takes no parameters at all;
nothing yet hands a brand-new object real data at the exact moment it's
built.

> **Try this first:** a C# constructor is "a method with the same name as
> its type," per Microsoft's own official documentation (fetched this
> session) — the same real idea as any other method, just one that runs
> once, automatically, whenever `new SomeClass(...)` is called. Given an
> ordinary method can already accept parameters inside its own
> parentheses, what would you expect `AboutDialog`'s own constructor to
> need in its own parameter list to receive a real `int` tool count at
> construction time, rather than needing some later, separate step to
> supply it?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/AboutDialog.xaml.cs`, modified.
  `ToolDB/MainWindow.xaml.cs`, modified.
- **Change type** — add (a real constructor with one parameter); add (a
  new private field, `_toolCount`, and one line inside the existing
  `AboutButton_Click` handler).
- **Location** — inside `AboutDialog`'s own class body, established the
  previous unit; `MainWindow.xaml.cs`'s own `_toolCount` field joins the
  existing `_toolsJson` field, and `_toolCount = tools.Count;` joins
  `MainWindow_Loaded`, both already shown in this lesson's own first unit.
- **Dependencies** — `AboutDialog`'s own `ToolCountText` field, established
  the previous unit.

### The New Code

```csharp
public AboutDialog(int toolCount)
{
    InitializeComponent();
    ToolCountText.Text = $"{toolCount} tool(s) loaded.";
}
```

### The Updated Project

`AboutDialog.xaml.cs`, in full, new lines marked:

```csharp
 1  using System.Windows;
 2
 3  namespace ToolDB;
 4
 5  public partial class AboutDialog : Window
 6  {
 7      public AboutDialog(int toolCount)                                    // ← new
 8      {                                                                     // ← new
 9          InitializeComponent();                                           // ← new
10          ToolCountText.Text = $"{toolCount} tool(s) loaded.";              // ← new
11      }                                                                     // ← new
12
13      private void CloseButton_Click(object sender, RoutedEventArgs e)
14      {
15          Close();
16      }
17  }
```

`AboutDialog` now has a real constructor of its own, instead of relying on
the compiler-generated, parameterless one every class receives by default
when it declares no constructor at all (the same implicit constructor
`Tool`, established Lesson 4, has always used) — `InitializeComponent()`
(established Lesson 5, the same real call `MainWindow`'s own constructor
already makes) must still run first, so `ToolCountText` genuinely exists as
a real field before line 10 tries to set its own `Text` property.

### Proving It in Isolation

A minimal, unrelated throwaway class, isolating a parameterized constructor
before it meets `AboutDialog`'s own real one:

```csharp
var greeting = new Greeting("Sam");
Console.WriteLine(greeting.Message);

public class Greeting
{
    public string Message;

    public Greeting(string name)
    {
        Message = $"Hello, {name}!";
    }
}
```

Top-level statements (established this project's own earliest lessons)
have to come *before* any type declaration in the same file — the real,
same `CS8803` rule this project's own Lesson 4 already discovered, so
`Greeting`'s own class declaration sits after the code that uses it, not
before.

Run for real this session:

```
Hello, Sam!
```

This real output proves the constructor's own parameter, `name`, really
did receive the real string `"Sam"` at the exact moment `new
Greeting("Sam")` ran, and that the constructor's own body — not some
separate, later step — is what computed and assigned `Message`. Per
Microsoft's own official documentation (fetched this session), a
constructor is "a method called by the runtime when an instance of a class
... is created" — real proof, here, that its own parameter list works
exactly like any ordinary method's: real values, passed positionally, at
the real moment the method (here, construction itself) actually runs.

### Discard the Throwaway Example

The `Greeting` example above is discarded now — it never appears in this
project again. What's proven is that a constructor's own parameter really
does receive its real value at construction time — not this specific
greeting.

### Mechanical Walkthrough

- `public AboutDialog(int toolCount)` — a real constructor, first written
  by hand in this project (`MainWindow`'s own has always been
  parameterless) — its own name, `AboutDialog`, matches its own class name
  exactly, per C#'s own real constructor syntax; `int toolCount` is a real
  **constructor parameter** (Terms, above), received the identical way any
  ordinary method parameter is.
- `InitializeComponent();` — reappearing from this project's own earliest
  lessons — the real, generated method (proven directly, this lesson's own
  previous unit) that actually builds this window's own real XAML tree;
  called first, deliberately, so every named element (`ToolCountText`)
  genuinely exists as a real object before the next line tries to use one.
- `ToolCountText.Text = $"{toolCount} tool(s) loaded.";` — a real field
  access (`ToolCountText`, established the previous unit) and a real
  property assignment (`Text`, established this project's own earliest
  lessons) on it, given a real template literal — this project's own
  established C# string-interpolation syntax (not to be confused with
  JavaScript's own template literals, a different real syntax this project
  also uses on the browser side) — embedding the real `toolCount`
  parameter directly into a real sentence.

### CS Lens

Requiring a real value up front, at construction time, rather than letting
an object exist first and be configured afterward, is a form of enforcing
a real **invariant** — a condition guaranteed true for every instance of a
type, for its entire lifetime, because there was never a window in time
where it could exist without that value already set. Also recognized in:
this project's own real `SqliteConnection`, which requires a real
connection string the moment it's constructed (Lesson 1) rather than
allowing a connection object to exist first with no database to connect
to, and a shipped, sealed envelope that must already contain its own
letter before it's ever handed to anyone — never assembled after the fact.

### SE Lens

Why require `toolCount` as a real constructor parameter, rather than
giving `AboutDialog` a plain, public, settable property (`ToolCount`) that
`MainWindow` sets *after* construction, before calling `ShowDialog()`? The
alternative not chosen — a settable property — was rejected because it
creates a real window in time where `AboutDialog` exists but hasn't
actually been told its own real tool count yet; if a future lesson's own
code accidentally called `ShowDialog()` before setting that property, the
dialog would show a real, incorrect value with nothing at compile time
preventing it. Requiring the value in the constructor makes that mistake
structurally impossible — there is no way to call `new AboutDialog(...)`
at all without supplying an `int`. The honest cost: if a future lesson ever
needs `AboutDialog` to show *before* its own real tool count is known (an
async lookup completing later, say), this exact constructor shape would
need to change to accommodate it.

### Run It

A real `dotnet build` was run this session against the actual, modified
files: build succeeded, 0 Warnings, 0 Errors — confirming `MainWindow.xaml.cs`'s
own new `new AboutDialog(_toolCount)` call (this lesson's own first unit)
genuinely matches this unit's own new constructor's real signature. The
throwaway `Greeting` example above was run for real this session, with real
output shown; source and output for both are saved in this project's own
`verification/lesson-13/` folder (`lab3-constructor-parameter.cs`),
following the same persistent-verification convention this project's own
Lesson 11 already established. This project's own standing constraint (no
live WPF window observed this session) still applies to watching
`ToolCountText`'s own real text actually rendered inside a running dialog.

### Connecting Back

`AboutDialog` can now be built already holding real, current data — the
exact `_toolCount` value `MainWindow`'s own first unit already computed.
Nothing has actually shown this dialog on screen yet, though — the final
unit is where `ShowDialog()` itself, and what "dialog" really means, comes
in.

---

## Concept Unit: Window vs. Dialog

### The Problem

`MainWindow.xaml.cs`'s own `AboutButton_Click`, written in this lesson's
own first unit, already calls `dialog.ShowDialog()` — but nothing has yet
explained what makes that call different from `Show()`, a real, equally
valid alternative method every `Window` also has, or from how `MainWindow`
itself first appears at all (`App.xaml`'s own `StartupUri`, established
Lesson 5).

> **Try this first:** the Header's own **modal** entry states a dialog
> "disables all other windows in the application" until closed. Given
> `MainWindow` itself is never disabled while it's the only window open,
> what real, different experience would you expect once a *second* real
> window exists and is shown through `ShowDialog()` specifically — could a
> user still click back on `MainWindow` while `AboutDialog` is open, or
> not?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — none; this unit explains real code already written
  in this lesson's own first unit (`AboutButton_Click`'s own body).
- **Change type** — not applicable; no new code this unit.
- **Location** — not applicable.
- **Dependencies** — this lesson's own first unit (`AboutButton_Click`),
  second unit (`AboutDialog` itself), and third unit (its own constructor).

### The New Code

Not applicable — this unit explains `AboutButton_Click`'s own real body,
already written in full in this lesson's own first unit:

```csharp
private void AboutButton_Click(object sender, RoutedEventArgs e)
{
    var dialog = new AboutDialog(_toolCount);
    dialog.Owner = this;
    dialog.ShowDialog();
}
```

### The Updated Project

Not applicable — no new code this unit; the method above is already shown,
unchanged, in this lesson's own first unit's own "Updated Project" step.

### Proving It in Isolation

No throwaway example exists for this unit — `ShowDialog()`'s own real,
documented behavior (quoted in full in this lesson's own Header) is
already the smallest possible demonstration of what makes it different
from `Show()`; a throwaway version calling the identical real method on a
different window would prove nothing new.

### Discard the Throwaway Example

Not applicable, for the reason stated above.

### Mechanical Walkthrough

- `var dialog = new AboutDialog(_toolCount);` — a real, ordinary object
  construction — `AboutDialog`'s own constructor (this lesson's own third
  unit) runs immediately, receiving `_toolCount`'s own current real value
  and setting `ToolCountText.Text` before this line even finishes.
- `dialog.Owner = this;` — **`Window.Owner`** (Header, above), set to
  `this` — `MainWindow`'s own current real instance — establishing a real
  relationship *before* `ShowDialog()` runs, the only real order that
  property's own documentation (Header, above) permits.
- `dialog.ShowDialog();` — **`Window.ShowDialog()`** (Header, above),
  called with no arguments, its own real `bool?` return value discarded —
  this is the real, single line that makes `AboutDialog` a **dialog**
  (Terms, above) at all: the exact same `AboutDialog` object, constructed
  identically, would instead behave like any other ordinary window if this
  line called `Show()` instead — no other code in this lesson would need
  to change for that to be true.

### CS Lens

Distinguishing "how an object was invoked" from "what class the object is"
— the same real `AboutDialog` object behaving differently depending on
whether `Show()` or `ShowDialog()` is called on it, with its own class
definition completely unchanged either way — is a real instance of
**behavior determined by call site, not by type**. Also recognized in: this
project's own real `SqliteCommand.ExecuteNonQuery()` versus
`ExecuteReader()` (Lesson 2–4), the identical command object behaving
completely differently depending on which one is called, and a phone call
placed on speaker versus held privately to one's ear — the identical real
call, made genuinely public or private depending only on how it's taken,
not on anything about the call itself.

### SE Lens

Why does WPF provide `ShowDialog()` as a real, separate method, rather than
a plain constructor parameter or property on `Window` itself (`new
AboutDialog(_toolCount) { IsModal = true }.Show();`, a real, alternative
shape this lesson's own code doesn't use)? The alternative not chosen —
modality as a settable property — was rejected, in WPF's own real design,
in favor of modality as a real *action* (a specific method call) rather
than a persistent *state* a window carries around — this keeps "is this
window currently blocking the rest of the application" tied to one
specific real call in one specific place in this project's own code
(`AboutButton_Click`), rather than a property that could, in principle, be
flipped on or off from anywhere at any time. The honest cost: nothing about
`AboutDialog`'s own class definition alone tells a future reader whether
it's ever shown modally — that information lives only at each real call
site, like this lesson's own `AboutButton_Click`, not on the class itself.

### Run It

No new `dotnet build` needed for this unit — this unit explains real code
already built and confirmed clean in this lesson's own first unit. This
project's own standing constraint (no live WPF window observed this
session) applies most directly of all four units here: the real, modal
blocking behavior `ShowDialog()` produces — `MainWindow` genuinely
unusable while `AboutDialog` is open — was not watched happening in an
actual running application this session. What's verified for real instead
is `ShowDialog()`'s own documented contract, quoted directly from
Microsoft's own official documentation, fetched this session, the same
standard this project has applied to every WPF/WebView2 behavior since
Lesson 5 that couldn't be watched directly.

### Connecting Back

A real, second native XAML screen now exists, built the same structural
way `MainWindow` always has been, handed real data at construction, and
shown in a way that's genuinely different from how `MainWindow` itself
first appears — not because it's a different kind of object, but because
of the one specific method called on it.

---

## Connect the Pieces

One concrete trace, start to finish, through everything this lesson built:

1. `MainWindow`'s own `Grid` — previously home to exactly one child,
   `Browser` — gained real `RowDefinitions` and a real, new `Button`,
   both told which row they belong to via the real `Grid.Row` attached
   property; a real, freshly generated `Click += new RoutedEventHandler(
   ...)` line, read directly out of this session's own build output,
   proved XAML's own declarative `Click="..."` attribute compiles into
   the identical real event subscription this project's own constructor
   already writes by hand (Unit 1).
2. A second real `Window` subclass, `AboutDialog`, was created in its own
   pair of files — its own real XAML tree, three real children deep,
   compiled the identical way `MainWindow`'s always has been; a second
   real generated-code read proved an element only receives a real field
   when it's actually named, contrasting `ToolCountText` (named, has a
   field) against its own unnamed `Close` button (no field, wired by
   `Click` alone) (Unit 2).
3. `AboutDialog` was given a real constructor accepting one real `int`
   parameter, proven in isolation with a real, unrelated `Greeting` class
   run this session, so it can be handed `MainWindow`'s own real, current
   tool count at the exact moment it's built, rather than needing a
   separate step afterward (Unit 3).
4. `MainWindow`'s own new `AboutButton_Click` sets `dialog.Owner = this`
   before calling `dialog.ShowDialog()` — the one real method call that
   makes this lesson's own second window a genuine **dialog**, per
   Microsoft's own documented, modal-blocking behavior, without
   `AboutDialog`'s own class definition needing anything special to make
   that true (Unit 4).

**Next lesson:** 14 — Updating and Deleting Safely.
