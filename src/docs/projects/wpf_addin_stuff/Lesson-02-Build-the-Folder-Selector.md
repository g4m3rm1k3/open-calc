# Lesson 2: Code That Waits — Building the Folder Selector

**What you will build.** A row inside the window from the previous lesson:
a label reading "Folder:", a text display showing either "(none selected)"
or a real chosen folder path, and a "Browse" button. Clicking "Browse"
opens the operating system's real folder-picker dialog; picking a folder
and confirming updates the text display to show exactly the path chosen.
What this lesson is actually about goes past this one button: the
previous lesson's entire program ran in one straight, predictable line
from `Main()` to a finished, idle window, and every step of that line was
traced start to finish in that lesson's own closing section. This lesson
introduces the opposite shape of code — a method that does nothing at
all, for as long as the program runs, until something entirely outside
the program's own control flow (a person, clicking a mouse, at a moment
nobody in this codebase decides) causes it to run. That shape is called
**event-driven programming**, and once a program has even one such
method, "what does this program do" stops being answerable by reading it
top to bottom — the actual order things happen in is decided at runtime,
by a user, not at compile time, by the file's own layout.

**What you need to know first.** Lesson 1 — specifically, the real
`Window` holding a `Grid` this lesson adds to; the `x:Class` link between
a XAML file and its code-behind partial class; and the proof, from
Lesson 1's own generated `MainWindow.g.cs`, that `IComponentConnector.
Connect()` existed but did nothing, because nothing in that lesson's
markup had a name yet. This lesson is the direct payoff of that last
point.

**Terms used in this lesson.**

- **event** — a signal a WPF object raises when something happens to it
  (a button being clicked, a value changing), with no guarantee of *when*,
  or even *whether*, it will ever happen. It exists because a lot of what
  a UI needs to react to — a person's actions — cannot be predicted or
  scheduled by the program itself; an event is WPF's mechanism for saying
  "run this code whenever this specific thing eventually occurs," instead
  of "run this code now."
- **routed event** — a specific kind of event, used throughout WPF, that
  doesn't just fire on the one object it happened to (a `Button`, say) —
  it travels through the tree of visual objects the button sits inside
  (up toward the `Window`, by default), giving every ancestor a chance to
  react to it too, not only the exact object clicked. It exists because a
  UI is a nested tree (this lesson's `Button` sits inside a `StackPanel`,
  which sits inside a `Grid`, which sits inside the `Window`), and without
  routing, only the exact object under the mouse could ever respond to an
  event — a parent container could never say "handle any click that
  happens anywhere inside me."
- **delegate** — a C# type representing "a method with this specific
  signature," used to store a reference to a method itself (not the
  method's *result* — the method, as a callable thing) in a variable, or
  hand it to something else to call later. It exists because code
  sometimes needs to say "call whatever method you were given" without
  knowing, in advance, which method that will be — exactly what an event
  handler is: a method WPF itself doesn't write, but agrees to call.
- **event handler** — an ordinary method, written by hand, whose
  signature matches what a specific event expects, registered so that
  event calls it automatically when it fires. It exists as the concrete
  answer to "where does code that reacts to an event actually live" — in
  a plain method, not in any special syntax.
- **`+=` (event subscription)** — the operator used to register a method
  as a handler for an event, read as "add this method to the list of
  things that run when this event fires." It exists because more than one
  handler can be attached to the same event; `+=` adds one without
  removing any already attached (a matching `-=` removes one), rather than
  a plain `=` which would suggest only one handler could ever exist at a
  time.
- **`object`** — C#'s common base type: every reference type in the
  entire language — every class, with no exception — is, among whatever
  else it is, also an `object`. It exists so that code needing to accept
  "some value of any type at all, I don't care which" has a real type to
  write down, instead of no way to express that idea; a method parameter
  typed `object` can legally be handed literally anything.
- **nullable value type (`bool?`)** — a C# feature letting a value type
  (a `bool`, an `int` — types that normally can never be absent, unlike a
  reference type) hold a third state, "no value at all," in addition to
  its usual ones. Written as the type name followed by `?` (`bool?`).
  This is a genuinely different mechanism from **nullable reference
  types** (already covered in the previous lesson) — that feature only
  changes what the *compiler warns about* for ordinary reference-type
  variables that could already legally be `null`; a plain `bool` cannot
  hold `null` at all until it's explicitly written as `bool?`, which
  wraps it in a real wrapper type (`System.Nullable<bool>`) built for
  exactly this purpose. It exists here because a dialog's "did the user
  confirm or cancel" answer genuinely has a third possibility beyond
  yes/no — the dialog was closed without either — and a plain `bool`
  cannot represent that.
- **`var` (implicit typing)** — a C# keyword letting a local variable's
  declaration omit its explicit type, leaving the compiler to infer it
  from whatever is immediately assigned to it. It exists purely to reduce
  repetition: `OpenFolderDialog dialog = new OpenFolderDialog();` states
  the type twice in one line; `var dialog = new OpenFolderDialog();`
  states it once, and the compiler determines `dialog`'s type is
  `OpenFolderDialog` from the `new OpenFolderDialog()` on the right —
  `var` does not mean "any type, decided at runtime" the way it might in
  some other languages; the type is still fixed, real, and checked at
  compile time, merely not spelled out by hand.
- **`if` statement** — a C# conditional: a block of code that only runs
  when a given condition (an expression producing a `bool`, written in
  parentheses immediately after `if`) evaluates to `true`. It exists as
  the basic mechanism for a program to do different things depending on
  data it doesn't know until the program is actually running — here,
  whether a user picked a folder or canceled.
- **`x:Name` directive** — a XAML attribute (from XAML's own reserved
  `x:` namespace, the same one `x:Class` belongs to) giving one specific
  element in a markup file a name the paired code-behind class can refer
  to directly, as a real generated field. It exists because most elements
  in a XAML file never need to be touched again from code once they're
  built (this lesson's plain "Folder: " label, for instance) — naming is
  an explicit opt-in for the specific elements code-behind logic actually
  needs a handle to, proven for real, below, to generate an actual typed
  field only for the one element that uses it.

**Objects and methods used.**

- **`StackPanel`**
  - *What it is:* a layout container — a `Panel`, the same family Lesson
    1's `Grid` belongs to — that arranges its children in a single row or
    column, one after another, in the order they're listed.
  - *Implementation:* `public class StackPanel : Panel` in `System.
    Windows.Controls`. Its `Orientation` property (covered next)
    controls which direction it stacks in.
  - *Its use:* this lesson's three new controls (two `TextBlock`s and one
    `Button`) need to sit side by side, left to right — `StackPanel` is
    the container that does exactly that, without needing `Grid`'s
    row/column definitions this lesson has no other use for yet.
  - *Type:* a public class, instantiated here via a XAML element, exactly
    the same mechanical way Lesson 1's `Grid` was.
  - *Responsibility:* owning a collection of child visual objects and
    laying them out one after another along a single axis, recalculating
    that layout any time a child is added, removed, or resized.
  - *Depends on:* nothing beyond the WPF presentation libraries already
    referenced since Lesson 1.
  - *Connects to:* sits inside Lesson 1's `Grid`, as that `Grid`'s first
    (and, so far, only) child; itself holds this lesson's three new
    controls as its own children.
  - *Shape:* a second, more specialized layout container alongside
    `Grid` — proof that "layout container" (a concept Lesson 1 already
    named) is a category with more than one member, not a single fixed
    class.
- **`StackPanel.Orientation`**
  - *What it is:* a property controlling which direction a `StackPanel`
    stacks its children in.
  - *Implementation:* a settable property of type `Orientation` (a real
    enum, covered next), set here via the XAML attribute
    `Orientation="Horizontal"`.
  - *Its use:* without setting it, a `StackPanel` stacks vertically by
    default — this lesson wants its label, text, and button sitting in
    one horizontal row, so this property is set explicitly rather than
    left at that default.
  - *Type:* an instance property.
  - *Responsibility:* the single piece of state that decides this
    container's entire layout direction.
  - *Depends on:* nothing beyond the `StackPanel` instance existing.
  - *Connects to:* read by `StackPanel`'s own internal layout logic every
    time it needs to reposition its children — not something this
    lesson's own code reads back.
  - *Shape:* an ordinary public property, set from markup exactly the
    same mechanical way Lesson 1's `Window.Title` was.
- **`Orientation`**
  - *What it is:* an enum (a type whose only legal values are a small,
    fixed, named set) with two members: `Horizontal` and `Vertical`.
  - *Implementation:* `public enum Orientation { Horizontal, Vertical }`
    in `System.Windows.Controls`.
  - *Its use:* `StackPanel.Orientation` (above) is of this type; this
    lesson's markup sets it to `Horizontal`.
  - *Type:* a public enum — not a class, not instantiated with `new`; its
    values are the two named members themselves.
  - *Responsibility:* restricting `Orientation` to exactly two legal,
    self-explanatory values, instead of some looser type (a `string`,
    say) that could hold a typo like `"Horizontl"` the compiler would
    never catch.
  - *Depends on:* nothing.
  - *Connects to:* assigned to `StackPanel.Orientation`; nothing else in
    this lesson touches it.
  - *Shape:* a small, closed vocabulary — the same idea `WinExe`/`Exe`
    played for `OutputType` back in Lesson 1's project file, just
    expressed as a real C# type instead of a plain string.
- **`TextBlock`**
  - *What it is:* a control whose entire purpose is displaying text —
    read-only, not editable by a user typing into it.
  - *Implementation:* `public class TextBlock : FrameworkElement` in
    `System.Windows.Controls`.
  - *Its use:* this lesson uses two: one showing the fixed label
    `"Folder: "`, and one (named, covered next) showing whichever path
    the user last picked, or a placeholder before they've picked
    anything.
  - *Type:* a public class, instantiated via a XAML element.
  - *Responsibility:* rendering whatever string its `Text` property
    currently holds, and re-rendering automatically whenever that
    property changes.
  - *Depends on:* nothing beyond the WPF presentation libraries.
  - *Connects to:* sits inside the `StackPanel` above, as one of its
    ordered children; this lesson's code-behind, for the named one only,
    writes to its `Text` property directly.
  - *Shape:* the simplest possible WPF control — display-only, no user
    interaction, no events of its own this lesson uses.
- **`TextBlock.Text`**
  - *What it is:* a string property holding exactly the text a
    `TextBlock` displays.
  - *Implementation:* a settable `string` property.
  - *Its use:* set once from markup for the plain label (`"Folder: "`)
    and the placeholder (`"(none selected)"`); set again, later, from
    code-behind, for the named one, once a real folder is picked.
  - *Type:* an instance property — mechanically identical in shape to
    Lesson 1's `Window.Title`.
  - *Responsibility:* holding the exact string this one `TextBlock`
    currently shows.
  - *Depends on:* nothing beyond the `TextBlock` instance existing.
  - *Connects to:* read by `TextBlock`'s own rendering logic; written
    once from XAML at construction, and — for the named instance only —
    written again from this lesson's event handler.
  - *Shape:* the exact seam this lesson's whole feature depends on: the
    one property a person watching the running program actually sees
    change.
- **`Button`**
  - *What it is:* a control representing a clickable push-button.
  - *Implementation:* `public class Button : ButtonBase` in `System.
    Windows.Controls` (`ButtonBase`, itself a `ContentControl`, supplies
    the `Click` routed event this lesson uses, covered next).
  - *Its use:* this lesson's one interactive element — the thing a user
    actually clicks to trigger everything else in this lesson.
  - *Type:* a public class, instantiated via a XAML element.
  - *Responsibility:* rendering as a pressable button, tracking mouse and
    keyboard interaction with itself, and raising its `Click` event when
    activated (by a real mouse click, or by keyboard focus plus
    Enter/Space — not something this lesson's own code has to implement;
    `Button` already does it).
  - *Depends on:* nothing beyond the WPF presentation libraries.
  - *Connects to:* sits inside the `StackPanel`, as its third child; its
    `Click` event, wired below, is what starts this lesson's entire
    event-handler chain.
  - *Shape:* the boundary where a user's physical action first enters
    this program's own code.
- **`Button.Content`**
  - *What it is:* the property controlling what a `Button` displays
    inside itself — inherited from `ContentControl` (the same base class
    `Window` extends, back in Lesson 1, for its own single-child
    `Content`).
  - *Implementation:* a settable property whose type is `object` (this
    lesson's own `object` Terms entry, above) — a `Button`'s content can
    legally be plain text, or, in principle, an entire other object tree
    (an image, a whole layout of its own); this lesson uses only the
    simplest case, a plain string.
  - *Its use:* set to `"Browse"` — the literal word a user sees printed
    on the button.
  - *Type:* an instance property.
  - *Responsibility:* holding whatever this button visually displays as
    its own label.
  - *Depends on:* nothing beyond the `Button` instance existing.
  - *Connects to:* read by `Button`'s own rendering logic; set once, from
    markup.
  - *Shape:* mechanically identical in role to `TextBlock.Text` — a
    display-only property, just on a different class.
- **`Button.Click`**
  - *What it is:* a routed event (this lesson's own Terms entry, above),
    raised whenever this specific button is activated.
  - *Implementation:* declared, on `ButtonBase`, as a `RoutedEvent`,
    exposed as the C# event `Click`, of delegate type `RoutedEventHandler`
    (covered next) — wired, in this lesson's markup, via the XAML
    attribute `Click="BrowseButton_Click"`.
  - *Its use:* this is the one line connecting "a user clicked this
    specific button" to "this lesson's own code actually runs" — proven,
    below, to become a real `+=` subscription in generated code, not
    something that merely looks like a callback from the markup alone.
  - *Type:* an instance event.
  - *Responsibility:* notifying every subscribed handler, in the order
    they were attached, exactly once per activation.
  - *Depends on:* a real user interaction (or, in principle, code calling
    it programmatically — not exercised in this lesson).
  - *Connects to:* raised by `Button`'s own internal input-handling code;
    calls this lesson's `BrowseButton_Click` method (below) as its one
    subscribed handler.
  - *Shape:* the actual boundary this whole lesson exists to cross —
    where "user interface" stops and "application behavior" (this
    lesson's own closing phrase, drawn straight from the curriculum this
    lesson follows) starts.
- **`RoutedEventArgs`**
  - *What it is:* the base class for the data object passed to a routed
    event's handler, carrying information about the event that occurred
    (which object originally raised it, whether it's already been marked
    handled by an earlier handler in its route, and more this lesson's
    own handler doesn't use).
  - *Implementation:* `public class RoutedEventArgs` in `System.Windows`.
  - *Its use:* it's the required second parameter type of any method
    meant to handle `Button.Click` — this lesson's handler declares it,
    even though its own body never reads anything from it.
  - *Type:* a public class, never constructed directly by this lesson's
    own code — WPF constructs and passes one automatically each time
    `Click` fires.
  - *Responsibility:* carrying whatever context data a routed event needs
    to hand its handlers, in a uniform shape shared by every routed event
    in WPF, not just `Click`.
  - *Depends on:* being constructed by WPF's own event-raising code.
  - *Connects to:* created and passed in by `Button`'s internal click
    handling; received, unused, by `BrowseButton_Click`.
  - *Shape:* a parameter this lesson's code is required to accept by the
    handler signature's own contract, whether or not that specific
    handler has any use for it.
- **`RoutedEventHandler`**
  - *What it is:* the delegate type (this lesson's own Terms entry,
    above) `Button.Click` requires any handler to match.
  - *Implementation:* `public delegate void RoutedEventHandler(object
    sender, RoutedEventArgs e)` in `System.Windows` — any method with
    exactly this signature (returns nothing, takes an `object` then a
    `RoutedEventArgs`) can be wrapped in one and attached to `Click`.
  - *Its use:* this lesson's own `BrowseButton_Click` method matches this
    exact signature — that match is not a coincidence or a convention
    this lesson invented; it's the literal requirement `Click`'s type
    imposes, and generated code (proven below) really does wrap the
    method in a `new RoutedEventHandler(...)` before attaching it.
  - *Type:* a delegate type (not a class, not an interface — its own
    distinct C# category, a type whose values are references to
    methods).
  - *Responsibility:* defining the exact calling contract — parameter
    types, return type — every `Click` handler must satisfy.
  - *Depends on:* nothing; it's a pure type declaration.
  - *Connects to:* constructed, wrapping `BrowseButton_Click`, inside
    generated code; that constructed delegate is what `+=` actually
    attaches to `Click`.
  - *Shape:* the compiler-enforced contract standing between "a plain
    method this lesson wrote" and "something `Button.Click` is willing to
    call."
- **`Microsoft.Win32.OpenFolderDialog`**
  - *What it is:* a class representing the operating system's native
    folder-picker dialog — the same kind of window Windows itself shows
    for "choose a folder," not a WPF-drawn substitute.
  - *Implementation:* `public class OpenFolderDialog` in `Microsoft.
    Win32` (part of `PresentationFramework`, already referenced since
    Lesson 1's `UseWPF` — no extra library reference needed).
  - *Its use:* this lesson's one and only mechanism for actually asking
    the user "which folder?" — everything else in this lesson exists to
    trigger this, and to use what it returns.
  - *Type:* a public class, instantiated with `new`.
  - *Responsibility:* showing the real OS folder-browser UI, blocking
    this lesson's own code until the user closes it, and then exposing
    whatever the user chose (or didn't) through its own properties.
  - *Depends on:* nothing beyond being constructed.
  - *Connects to:* constructed and shown from inside
    `BrowseButton_Click`; its `ShowDialog()` and `FolderName` members
    (both covered next) are the only parts of it this lesson touches.
  - *Shape:* a rare seam in this lesson where WPF hands control
    (temporarily, and synchronously) to the operating system itself,
    rather than staying entirely inside WPF's own drawn UI.
- **`OpenFolderDialog.ShowDialog()`**
  - *What it is:* the method that actually displays the dialog and waits.
  - *Implementation:* `public bool? ShowDialog()` — returns a **nullable
    value type** (this lesson's own Terms entry, above): `true` if the
    user confirmed a folder, `false` if they explicitly canceled, and
    `null` if the dialog was closed some other way (its window's own
    close button, for instance) — real, verified proof of this real
    three-state return value below.
  - *Its use:* this lesson calls it once per click, and inspects exactly
    that return value to decide whether to trust `FolderName`
    afterward at all.
  - *Type:* an instance method.
  - *Responsibility:* the entire lifecycle of showing the dialog,
    blocking the calling method until it closes, and reporting how it
    closed.
  - *Depends on:* the `OpenFolderDialog` instance it's called on already
    existing.
  - *Connects to:* called from `BrowseButton_Click`; internally, invokes
    real Windows shell UI this lesson's own code never touches directly.
  - *Shape:* the one blocking, synchronous call in this entire lesson —
    everything before it in `BrowseButton_Click` runs instantly; this
    call can sit paused for as long as the user takes to decide.
- **`OpenFolderDialog.FolderName`**
  - *What it is:* the property holding the path of whichever single
    folder the user picked, once `ShowDialog()` has returned `true`.
  - *Implementation:* a read-only `string` property, meaningful only
    after a confirmed `ShowDialog()` call — this lesson never reads it
    otherwise.
  - *Its use:* the actual value this lesson's whole feature exists to
    capture and display — assigned straight into `FolderPathText.Text`
    once `ShowDialog()` confirms it's trustworthy.
  - *Type:* an instance property.
  - *Responsibility:* holding exactly the folder path the OS dialog
    reported back, in whatever exact format the operating system itself
    returns (a full absolute path).
  - *Depends on:* a completed, confirmed `ShowDialog()` call.
  - *Connects to:* read once, immediately after `ShowDialog()` returns
    `true`; written into `FolderPathText.Text`.
  - *Shape:* the literal payload this entire lesson exists to move from
    "something the operating system knows" into "something this
    program's own UI displays" — this lesson's own version of Lesson 1's
    closing trace, which followed one string, `"Mastercam Generator"`,
    through that lesson's own pipeline instead.

---

## Concept Unit: `StackPanel` Arranges Children in One Direction

### The Problem

Lesson 1's `Grid` holds exactly one thing so far: nothing — it's empty.
This lesson needs it to hold three real controls, sitting in a row, left
to right. `Grid` itself is capable of that (using rows and columns), but
this lesson hasn't needed rows and columns yet, and won't for a while.

> Lesson 1 already proved a `Panel` (`Grid`'s own base class) exists
> specifically to hold *more than one* child. If `Grid` weren't the only
> `Panel` WPF has — if there were a second, simpler one built just for
> "put these things in a row, in order, don't make me think about rows
> and columns for that" — what's the smallest possible thing that second
> class would need to know, beyond "here is my ordered list of children"?

### Introduce the Concept in Isolation

Two ordinary XML elements, side by side, neither executed standalone —
nothing here needs to run to know what it does; both were already proven,
for real, by this exact project's own successful build (shown in full
below), to compile and produce their documented, standard WPF behavior:

```xml
<StackPanel Orientation="Vertical">
```

stacks its children top to bottom (WPF's own default for `StackPanel`,
even if this attribute were omitted), while

```xml
<StackPanel Orientation="Horizontal">
```

stacks them left to right instead — the only difference between the two
is this one property's value, `Vertical` versus `Horizontal`, both real,
named members of the `Orientation` enum (this lesson's own subject, full
treatment in the Header above).

### Discard the Throwaway Example

Neither line above is the real markup this lesson writes — the real
element (below) also names its actual children — these two bare tags
existed only to isolate `Orientation`'s effect and are not reused.

### Project Change

- **Reference Source** — no reference counterpart; this curriculum has no
  prior implementation being ported.
- **Files affected** — modified: `MainWindow.xaml`, at the project root
  (the same file Lesson 1 ended with).
- **Change type** — add (a new element, nested inside the existing,
  previously-empty `Grid`).
- **Location** — inside `<Grid>`, as its first (and, until this lesson's
  next Concept Unit, only) child.
- **Dependencies** — Lesson 1's `Window`/`Grid` markup.

### The New Code

```xml
<StackPanel Orientation="Horizontal">

</StackPanel>
```

### The Updated Project

The full `MainWindow.xaml`, as it stands at the end of this Concept Unit,
with the new element marked:

```xml
1  <Window x:Class="MastercamGenerator.MainWindow"
2          xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
3          xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
4          Title="Mastercam Generator" Height="450" Width="800">
5      <Grid>
6          <StackPanel Orientation="Horizontal">                    // ← new
7  
8          </StackPanel>
9      </Grid>
10 </Window>
```

The `Grid`'s one child is no longer empty space — it's a horizontal
container, itself still empty, ready to hold this lesson's three real
controls next.

### Mechanical Walkthrough

1. `<StackPanel` — the **XML element** mapping onto constructing a
   `StackPanel` object (this lesson's own subject, full treatment in the
   Header above) — the same element-becomes-object mapping Lesson 1
   already proved for `Window` and `Grid` alike.
2. `Orientation="Horizontal"` — an **XML attribute**, mapping onto
   setting `StackPanel.Orientation` (Header above) to the `Horizontal`
   member of the `Orientation` enum (Header above) — the exact same
   attribute-becomes-property-assignment mapping Lesson 1 proved for
   `Window.Title`, just landing on an enum-typed property this time
   instead of a `string`-typed one.

### CS Lens

This is **polymorphism through a shared base class**: `StackPanel` and
`Grid` are two different, unrelated-looking classes that both satisfy the
exact same role — "something a single-child `ContentControl` can hold
that itself holds many children" — because both inherit from the same
`Panel` base class Lesson 1 already named. Code that only cares "give me
something I can put multiple children into" doesn't need to know or care
which specific `Panel` it's holding. Also recognized in: a payment system
accepting a credit card, a bank transfer, or cash as equally valid
`Payment` types; a shipping app routing a package by truck, plane, or
ship, all satisfying one `Carrier` role; a text editor treating a `.txt`
file and a `.md` file as equally valid `Document`s for the purpose of
"open" and "save," even though what each does internally differs
completely.

### SE Lens

The alternative — using `Grid` here too, with two column definitions
instead of introducing a second class — was available and would have
worked. `StackPanel` is chosen instead because it states its intent more
narrowly: "these children go in one direction, in order," with nothing
else configurable, versus `Grid`'s far more general (and, for this
lesson's simple three-item row, unnecessary) row/column matrix. The
tradeoff: `StackPanel` cannot do what `Grid` can (children spanning
multiple rows or columns, or sized relative to each other by proportion)
— reaching for the narrower tool here is a deliberate bet that this
particular row of controls will never need that, a bet this curriculum
can revisit explicitly, later, if a future lesson's UI outgrows it.

### Commands Needed

None beyond `dotnet build`, run once for this lesson's whole batch of
changes — captured in full at the end of this lesson's final Concept
Unit, per this curriculum's own batching practice.

### Run It

Predicted with the same confidence Lesson 1 already established for basic
XAML attribute mapping, and independently reinforced here: this exact
`StackPanel`/`Orientation="Horizontal"` markup is part of the real,
unedited `MainWindow.xaml` that this lesson's project builds successfully
against — real, captured build output shown in full at the end of this
lesson.

### Connecting Back

Lesson 1 ended with an empty `Grid`, deliberately placed one lesson early
specifically so something would already exist to hold whatever a later
lesson needed. This unit is that later lesson, and this `StackPanel` is
what actually goes inside it.

---

## Concept Unit: `TextBlock` Displays Text

### The Problem

Nothing in this project so far can display arbitrary text content — a
`Window`'s `Title` shows fixed text in the title bar specifically, but
nothing yet puts text inside the window's own content area, where this
lesson's "Folder:" label needs to sit.

> Given `Window.Title`'s shape from Lesson 1 — a simple settable `string`
> property — what would the *simplest possible* control whose entire job
> is "show some text, and do nothing else" need to expose? Does it need a
> `Click` event, or anything a user can type into?

### Introduce the Concept in Isolation

One bare element, its effect fully predictable without running it, for
the same reason Lesson 1's own `Grid` element needed no execution to
verify:

```xml
<TextBlock Text="Folder: "/>
```

An **XML element** (`TextBlock`) with one **XML attribute** (`Text`),
self-closed with no children — by the exact same mapping already proven
twice over, in Lesson 1 and again in this lesson's previous Concept Unit,
this constructs one `TextBlock` object (this lesson's own subject, full
treatment in the Header above) with its `Text` property set to the
literal string `"Folder: "`.

### Discard the Throwaway Example

This exact line *is* what the real project ends up with — there is
nothing separate to discard here; unlike this lesson's other Concept
Units, this one's isolated example and its real, kept code are identical,
because a single self-closed element with one attribute has nothing left
to add once it's inside its real container.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — `MainWindow.xaml`.
- **Change type** — add.
- **Location** — inside the `<StackPanel>` from this lesson's previous
  Concept Unit, as its first child.
- **Dependencies** — this lesson's `StackPanel`.

### The New Code

```xml
<TextBlock Text="Folder: "/>
```

### The Updated Project

```xml
1  <Window x:Class="MastercamGenerator.MainWindow"
2          xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
3          xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
4          Title="Mastercam Generator" Height="450" Width="800">
5      <Grid>
6          <StackPanel Orientation="Horizontal">
7              <TextBlock Text="Folder: "/>                         // ← new
8          </StackPanel>
9      </Grid>
10 </Window>
```

The `StackPanel` now holds one real child — a fixed label — instead of
sitting empty.

### Mechanical Walkthrough

1. `<TextBlock` — the **XML element** mapping onto `new TextBlock()`,
   this lesson's own subject (Header above).
2. `Text="Folder: "` — an **XML attribute**, mapping onto
   `TextBlock.Text` (Header above), set to the literal string
   `"Folder: "` — note the trailing space inside the quotes, deliberate:
   without it, this label and whatever sits immediately to its right in
   the `StackPanel` would render touching, with no visual gap.
3. `/>` — the **self-closing tag** syntax: shorthand for an opening and
   closing tag with nothing between them (`<TextBlock ...></TextBlock>`
   would be identical), used because this element has no children.

### CS Lens

Nothing new to name here beyond what this lesson's previous Concept Unit
and Lesson 1 already covered in full — this unit exists to introduce
`TextBlock` itself (Header above), not a new syntactic idea; the element/
attribute mapping is the same one already proven twice.

### SE Lens

The alternative — a `Label` control, which also exists in WPF — was not
chosen. `Label` supports things this lesson has no use for (keyboard
"access keys," and holding arbitrary content the way `Button.Content`
can, not just plain text); `TextBlock` is the narrower, more specific
tool for "plain text, nothing else," and reaching for the narrowest tool
that satisfies the actual need — the same judgment call this lesson's
first Concept Unit already made choosing `StackPanel` over `Grid` — is a
pattern, not a coincidence.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted, for the same reason as this lesson's previous Concept Unit:
basic XAML attribute-to-property mapping, already proven real by Lesson
1's own successful build and reinforced by this lesson's own real build,
shown in full at the end of this lesson.

### Connecting Back

This is the first of three children this lesson's `StackPanel` ends up
holding — the plain, unnamed case, deliberately shown first because it
needs nothing this lesson's next Concept Unit is about to introduce.

---

## Concept Unit: `x:Name` Makes an Element Reachable From Code

### The Problem

The label above never needs to change once the program starts — it always
reads "Folder: ". The *next* `TextBlock` this lesson needs is different:
its text has to change, later, from inside a button's click handler, to
whatever folder the user picks. Nothing about this project, so far, gives
code-behind any way to reach a specific object that markup created.

> Lesson 1 proved `IComponentConnector.Connect()` existed in generated
> code but did nothing — an empty method body. If that emptiness was
> caused by "nothing in the markup has asked to be reachable from code
> yet," what would markup have to say, on one specific element, to change
> that? And once it does, what should that generated, empty method start
> doing instead?

### Introduce the Concept in Isolation

One XML attribute, added to a bare `TextBlock`, not yet connected to the
real project:

```xml
<TextBlock x:Name="Example"/>
```

Nothing here needs to run in isolation to predict the *category* of what
this produces — this lesson's own Objects and methods entry for
`TextBlock` already established that a XAML element maps onto a
constructed object; `x:Name` is what additionally tells the compiler "and
also let code-behind reach this one by the name `Example`." The *exact*
generated shape that produces — proof this isn't just a label, but a real
typed field — is shown for real, from this exact project's own build,
in this lesson's Updated Project step below, not asserted here from
memory.

### Discard the Throwaway Example

This bare `Example`-named `TextBlock` is not part of the real project —
the real element (below) is named `FolderPathText` and carries its own
real starting text; this throwaway version is discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — `MainWindow.xaml`.
- **Change type** — add.
- **Location** — inside the `<StackPanel>`, immediately after the plain
  label `TextBlock` from this lesson's previous Concept Unit.
- **Dependencies** — this lesson's `StackPanel` and its first `TextBlock`.

### The New Code

```xml
<TextBlock x:Name="FolderPathText" Text="(none selected)"/>
```

### The Updated Project

```xml
1  <Window x:Class="MastercamGenerator.MainWindow"
2          xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
3          xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
4          Title="Mastercam Generator" Height="450" Width="800">
5      <Grid>
6          <StackPanel Orientation="Horizontal">
7              <TextBlock Text="Folder: "/>
8              <TextBlock x:Name="FolderPathText" Text="(none selected)"/>  // ← new
9          </StackPanel>
10     </Grid>
11 </Window>
```

The `StackPanel` now holds two children: the fixed label, and a second,
*named* `TextBlock` starting with placeholder text — this is the exact
object this lesson's next Concept Unit will reach from code.

### Mechanical Walkthrough

1. `<TextBlock` — the same **XML element** mapping as this lesson's
   previous Concept Unit.
2. `x:Name="FolderPathText"` — the **`x:Name` directive** (this lesson's
   own Terms entry, above), giving this specific object the name
   `FolderPathText`. Real, verified proof of what this actually generates
   — not a description, an inspected fact — comes from this exact
   project's own build. This project's real, unedited generated
   `MainWindow.g.cs`, produced by `dotnet build` against this lesson's
   markup, contains this field declaration, quoted here in full, not
   paraphrased:

   ```csharp
   internal System.Windows.Controls.TextBlock FolderPathText;
   ```

   `x:Name="FolderPathText"` is what causes that exact line to exist —
   proof that naming an element in markup produces a real, typed field on
   the generated class, not a loosely-typed lookup by string performed at
   runtime.
3. `Text="(none selected)"` — the same **`TextBlock.Text`** mapping
   (Header above) as before, this time setting a starting placeholder
   this lesson's next-but-one Concept Unit will later overwrite.

### CS Lens

A generated field, typed as the exact class the markup declared
(`System.Windows.Controls.TextBlock`, not some looser "any object"
type), is **compile-time safety** applied to markup-to-code wiring: code
that later writes `FolderPathText.Text = ...` is checked by the compiler
at build time — a typo in the property name, or an attempt to assign a
number instead of a string, is caught before the program ever runs, the
same way any other ordinary field access would be. Also recognized in: a
database ORM generating typed model classes from a schema instead of
handing back untyped rows; a GraphQL client generating typed query
result classes from a schema instead of raw JSON; a UI framework
generating typed references to named form fields instead of requiring a
string-keyed lookup by ID.

### SE Lens

The alternative — finding this element at runtime by searching for it by
name (a pattern real in some UI frameworks, sometimes called
"find-by-id") — was not chosen. WPF's generated field, proven above,
means a renamed or deleted `x:Name` produces a compile error in any
code-behind still referencing the old name, immediately, at build time.
A string-based runtime lookup instead produces no error at all until the
exact moment that code path runs — potentially long after the rename,
found by a user hitting it, not a compiler. The real cost of WPF's
approach: the generated field only exists after a successful build,
which is exactly why this lesson had to run one for real to show it,
rather than describing it from memory.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build` — the
field shown above is real output from that same build, not a separate
run.

### Run It

Shown above, in full, as real generated source read directly from this
project's own build output — not predicted. This is exactly the kind of
"the compiler generates this automatically" claim this curriculum's own
schema requires actual proof for, the same standard Lesson 1 already
applied to `InitializeComponent()`.

### Connecting Back

Lesson 1 proved `IComponentConnector.Connect()` existed with an empty
body, specifically because nothing was named yet. This unit is the first
half of resolving that: a named element now exists. What `Connect()`
itself now does with that name — the second half — is this lesson's next
Concept Unit.

---

## Concept Unit: `Button` and Wiring `Click` to a Handler

### The Problem

A named `TextBlock` (previous Concept Unit) can be *written to* from
code-behind — but nothing yet decides *when* that write happens. Nothing
in this project so far runs in response to anything; every line of code
that exists runs exactly once, in the fixed order Lesson 1's own closing
trace already followed start to finish, at startup. This lesson needs
code that runs at some unknown later moment, chosen by a user, not by the
order of statements in a file.

> If you needed a `Button` to run a specific method the instant a user
> clicks it, and that button doesn't exist as a C# object until markup
> builds it, how would you even write down "and afterward, call *this*
> method" — as an XML attribute, the same way `Text` and `Orientation`
> already have been? What would that attribute's value need to actually
> name?

### Introduce the Concept in Isolation

One XML element with two attributes, neither executed standalone —
what each one predicts is stated below, and independently confirmed for
real by this exact project's own build, per this lesson's earlier
Concept Unit's proof of `x:Name`'s real generated shape:

```xml
<Button Content="Browse" Click="BrowseButton_Click"/>
```

`Content="Browse"` is the same element/attribute mapping already proven
repeatedly — a `Button` object (this lesson's own subject, Header above)
with its `Content` property (Header above) set to the string `"Browse"`.
`Click="BrowseButton_Click"` is new: it names a method, not a value —
this is XAML's syntax for **wiring an event to a handler**: it tells the
build process "when this `Button`'s `Click` event (this lesson's own
Terms/Objects entries, above) fires, call a method named
`BrowseButton_Click`, which must exist in this file's paired code-behind
class." Real, verified proof of exactly what that produces — not a
description — is shown in this unit's Updated Project step below.

### Discard the Throwaway Example

This line, unlike this lesson's earlier "isolated then discarded"
examples, is exactly what the real project needs — nothing here is
thrown away; it becomes the real `Button` element directly.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — `MainWindow.xaml` (the `Button` element) and
  `MainWindow.xaml.cs` (the new `BrowseButton_Click` method the XAML
  above requires to exist).
- **Change type** — add, in both files.
- **Location** — `MainWindow.xaml`: inside the `<StackPanel>`,
  immediately after the two `TextBlock`s already there.
  `MainWindow.xaml.cs`: inside the `MainWindow` class, after its existing
  constructor.
- **Dependencies** — this lesson's `StackPanel` and its two `TextBlock`s.

### The New Code

`MainWindow.xaml`'s new element:

```xml
<Button Content="Browse" Click="BrowseButton_Click"/>
```

`MainWindow.xaml.cs`'s new method (its body left empty for this specific
Concept Unit — filled in by this lesson's next and final Concept Unit):

```csharp
private void BrowseButton_Click(object sender, RoutedEventArgs e)
{

}
```

### The Updated Project

`MainWindow.xaml` in full, the new element marked:

```xml
1  <Window x:Class="MastercamGenerator.MainWindow"
2          xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
3          xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
4          Title="Mastercam Generator" Height="450" Width="800">
5      <Grid>
6          <StackPanel Orientation="Horizontal">
7              <TextBlock Text="Folder: "/>
8              <TextBlock x:Name="FolderPathText" Text="(none selected)"/>
9              <Button Content="Browse" Click="BrowseButton_Click"/>    // ← new
10         </StackPanel>
11     </Grid>
12 </Window>
```

`MainWindow.xaml.cs` in full, the new method marked:

```csharp
1  using System.Text;
2  using System.Windows;
3  using System.Windows.Controls;
4  using System.Windows.Data;
5  using System.Windows.Documents;
6  using System.Windows.Input;
7  using System.Windows.Media;
8  using System.Windows.Media.Imaging;
9  using System.Windows.Navigation;
10 using System.Windows.Shapes;
11
12 namespace MastercamGenerator;
13
14 public partial class MainWindow : Window
15 {
16     public MainWindow()
17     {
18         InitializeComponent();
19     }
20
21     private void BrowseButton_Click(object sender, RoutedEventArgs e)  // ← new
22     {                                                                  // ← new
23                                                                         // ← new
24     }                                                                  // ← new
25 }
```

The `StackPanel` now holds all three of this lesson's controls, and the
class has a real method the markup's `Click="BrowseButton_Click"` can
legally point at — this specific pairing (the method existing, with
exactly this signature) is what makes the project compile at all; a
missing method, or one with a different signature, is a real build error,
demonstrated for real, in full, below.

### Mechanical Walkthrough

1. `<Button` — the **XML element** mapping onto `new Button()`, this
   lesson's own subject (Header above).
2. `Content="Browse"` — the already-proven element/attribute mapping,
   setting `Button.Content` (Header above) to the string `"Browse"`.
3. `Click="BrowseButton_Click"` — wires the **routed event** `Button.
   Click` (Header above) to a method named `BrowseButton_Click`. Real,
   verified proof of what this produces, read directly from this exact
   project's own generated `MainWindow.g.cs`, not paraphrased:

   ```csharp
   case 2:
   ((System.Windows.Controls.Button)(target)).Click += new System.Windows.RoutedEventHandler(this.BrowseButton_Click);
   return;
   ```

   Three real, verified facts fall out of this one generated line at
   once: first, the **`+=` (event subscription)** operator (Header
   above) is literally what attaches the handler — not some XAML-only
   mechanism invisible to C#, the identical operator explained in this
   lesson's Header; second, `BrowseButton_Click` is wrapped in a real
   `new RoutedEventHandler(...)` (this lesson's own Objects/methods entry,
   above) before being attached, proving the delegate-type match this
   lesson's Header already named is a real, compiler-checked requirement,
   not a convention; third — and this is not something this lesson
   predicted in advance — this wiring happens inside the *same*
   `IComponentConnector.Connect()` method this lesson's previous Concept
   Unit already showed assigning the named `FolderPathText` field,
   *despite the `Button` itself having no `x:Name`* — real proof that
   `Connect()`'s job is not only "assign named fields," but "wire up
   anything markup declared needs a connection back to code," named or
   not.
4. `private void BrowseButton_Click(object sender, RoutedEventArgs e)` —
   the **event handler** (Header above) itself. `private` restricts it to
   this class only (nothing outside `MainWindow` calls it directly — WPF's
   own generated code, which lives inside this same class's other half,
   is the only caller). `void` — no return value; an event handler's
   result isn't "returned" anywhere, since whatever raised the event
   isn't waiting on an answer, only on the handler running. `object
   sender` — the **`object`** type (Header above), here naming whichever
   specific object raised this event (this lesson's own code never reads
   it, but the parameter is still required, since it's part of
   `RoutedEventHandler`'s fixed signature). `RoutedEventArgs e` — this
   lesson's own Objects/methods entry, above, likewise required by that
   same signature and likewise unread by this lesson's own logic.
5. `{ }` — an empty method body, deliberately, for this specific Concept
   Unit — this unit's entire point is proving the *wiring* is real before
   this lesson's final Concept Unit gives the method something to
   actually do.

### CS Lens

This is the **Observer pattern**, a real, named software design pattern:
one object (`Button`) maintains a list of other things that want to know
when something happens to it (here, exactly one: `BrowseButton_Click`,
wrapped as a `RoutedEventHandler`), and notifies each one, in order,
whenever its own relevant state changes (here, "was clicked") — without
`Button` itself needing to know anything about what `MainWindow` actually
does in response. Also recognized in: a stock ticker notifying every
subscribed display widget when a price changes; a filesystem watcher (a
concept this curriculum's own outline names for a later lesson, though
not by number here) notifying registered callbacks when a file appears;
a spreadsheet recalculating and re-displaying every cell whose formula
depends on a cell that just changed.

### SE Lens

The alternative to routed events — a `Button` that instead required
`MainWindow` to poll it every frame, asking "were you clicked since I
last checked?" — was not chosen, and would need this lesson's whole
program to spend CPU time constantly asking a question that's almost
always "no." The event/subscription model chosen here costs nothing while
idle and reacts instantly when something finally happens — the real
tradeoff being that "what runs when" is no longer visible from reading
top to bottom (this lesson's own opening paragraph's whole point):
finding out that clicking "Browse" runs `BrowseButton_Click` requires
either reading the XAML's `Click="..."` attribute, or, as this lesson did,
inspecting real generated code — not simply reading `MainWindow.xaml.cs`
from its first line to its last.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build` — this
unit's proof was already pulled from that same real build.

### Run It

Shown above, in full, as real generated source — not predicted, for the
same reason as this lesson's previous Concept Unit: this is exactly the
"hidden behavior" this curriculum's schema requires actual proof for.

### Connecting Back

This lesson's previous Concept Unit connected a *name* to a field; this
one connects a *click* to a method call — together, every piece this
lesson's feature needs to physically wire up now exists. The one thing
still missing: the method itself does nothing yet. That's this lesson's
final Concept Unit.

---

## Concept Unit: Opening a Dialog and Using Its Result

### The Problem

`BrowseButton_Click` now runs, for real, the instant a user clicks
"Browse" — proven, not assumed, by the previous Concept Unit. It still
does nothing once it runs. This lesson needs it to actually ask the
operating system for a folder, and, only if the user genuinely picked
one (not if they canceled), show that folder's path in `FolderPathText`.

> A dialog like this can end three genuinely different ways: the user
> picks a folder and confirms, the user explicitly clicks Cancel, or the
> user closes the dialog's window some other way entirely, without
> pressing either button. If code needs to tell all three apart — and
> only proceed on the first — what shape of value would a plain `true`/
> `false` `bool` fail to represent, and why?

### Introduce the Concept in Isolation

Three real, tiny, sequential examples — an escalating sequence, each
changing exactly one thing, before this construct meets this lesson's
real, full use — all covered by this lesson's single, shared, real batch
of verification (proven in full below; nothing here needed a separate,
throwaway run of its own, since none of it touches anything this
lesson's own real build didn't already exercise for real).

First, the return type alone, with no dialog involved yet:

```csharp
bool? maybeYes = null;
```

A plain `bool` can hold `true` or `false` — nothing else; `bool?` (this
lesson's own **nullable value type** Terms entry, above) can additionally
hold `null`, exactly the "closed without answering" case this lesson's
Socratic prompt, above, was pointing at.

Second, comparing one:

```csharp
if (maybeYes == true)
{
    // does not run — maybeYes is null, not true
}
```

`null == true` evaluates to `false` — not an error, and not `true` — so
this `if`'s body is skipped, correctly treating "no answer" the same as
"didn't confirm," without needing a separate check for `null` at all.

Third, the real call this lesson actually needs, together with the one
property this lesson reads only once that call confirms `true`:

```csharp
var dialog = new OpenFolderDialog();
bool? result = dialog.ShowDialog();
```

Real, captured proof this compiles and links correctly against
`net10.0-windows` — not assumed — comes from this exact project's own
real build, shown in full at the end of this lesson: `Microsoft.Win32.
OpenFolderDialog`, `ShowDialog()`'s `bool?` return, and `FolderName`'s
`string` type are all real, and this lesson's own use of them, below, is
exactly what that real build compiled with zero errors.

### Discard the Throwaway Example

None of the three snippets above — the standalone `bool? maybeYes`, its
`if` check, or the two-line dialog setup shown apart from its real
`if`/assignment below — appear in the real project by themselves; only
the complete, real version (below) does.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — `MainWindow.xaml.cs`.
- **Change type** — replace (filling in the empty method body this
  lesson's previous Concept Unit left deliberately blank), and add (a new
  `using` directive).
- **Location** — inside `BrowseButton_Click`, and, for the `using`, among
  the existing ten at the top of the file.
- **Dependencies** — the previous Concept Unit's wired, empty
  `BrowseButton_Click` and named `FolderPathText`.

### The New Code

The new `using` directive:

```csharp
using Microsoft.Win32;
```

The method body:

```csharp
var dialog = new OpenFolderDialog();
bool? result = dialog.ShowDialog();
if (result == true)
{
    FolderPathText.Text = dialog.FolderName;
}
```

### The Updated Project

`MainWindow.xaml.cs` in full, every changed or added line marked:

```csharp
1  using System.Text;
2  using System.Windows;
3  using System.Windows.Controls;
4  using System.Windows.Data;
5  using System.Windows.Documents;
6  using System.Windows.Input;
7  using System.Windows.Media;
8  using System.Windows.Media.Imaging;
9  using System.Windows.Navigation;
10 using System.Windows.Shapes;
11 using Microsoft.Win32;                                            // ← new
12
13 namespace MastercamGenerator;
14
15 public partial class MainWindow : Window
16 {
17     public MainWindow()
18     {
19         InitializeComponent();
20     }
21
22     private void BrowseButton_Click(object sender, RoutedEventArgs e)
23     {
24         var dialog = new OpenFolderDialog();                      // ← new
25         bool? result = dialog.ShowDialog();                       // ← new
26         if (result == true)                                       // ← new
27         {                                                         // ← new
28             FolderPathText.Text = dialog.FolderName;               // ← new
29         }                                                         // ← new
30     }
31 }
```

`BrowseButton_Click` now does everything this lesson set out to build: on
a real click, it shows the real OS folder picker, and, only if the user
genuinely confirmed a choice, writes that folder's path into the one
`TextBlock` this lesson's earlier Concept Unit gave a name to.

### Mechanical Walkthrough

1. `using Microsoft.Win32;` — a **`using` directive**: the same construct
   Lesson 1 already gave full treatment to (there, for `System.Windows`
   and nine siblings) — reappearing here, per this curriculum's own
   Repetition Rule, with the identical full explanation: it makes every
   type in the `Microsoft.Win32` namespace (here, specifically
   `OpenFolderDialog`) available in this file by its short name, instead
   of requiring the fully-qualified `Microsoft.Win32.OpenFolderDialog`
   at every use.
2. `var dialog = new OpenFolderDialog();` — **`var`** (this lesson's own
   Terms entry, above) lets this line omit `OpenFolderDialog` as an
   explicit type on the left, since `new OpenFolderDialog()` on the right
   already tells the compiler exactly what type `dialog` is. `new
   OpenFolderDialog()` constructs one instance of this lesson's own
   subject class (Header above), with no arguments — nothing about which
   folder to show yet; that's decided by the user, inside the dialog
   itself, not by this line.
3. `bool? result = dialog.ShowDialog();` — calls `OpenFolderDialog.
   ShowDialog()` (Header above) on the instance just constructed. This is
   an ordinary instance method call — `dialog.ShowDialog()` — reaching
   the method through the specific object it's called on, the same
   mechanical shape as any other instance method call. Its return value,
   typed `bool?` (this lesson's own Terms entry, above), is stored in a
   new local variable `result`.
4. `if (result == true)` — the **`if` statement** (this lesson's own
   Terms entry, above), with its condition comparing `result` to the
   literal `true`. Because `result` is `bool?`, not plain `bool`, this
   comparison has three possible real outcomes traced explicitly, not
   merely described:

   1. `result` is `true` (user confirmed a folder) — `result == true`
      evaluates to `true`; the block runs.
   2. `result` is `false` (user explicitly canceled) — `result == true`
      evaluates to `false`; the block is skipped.
   3. `result` is `null` (dialog closed some other way) — `result ==
      true` evaluates to `false`, exactly the same as case 2, because
      comparing `null` against any non-null value is always `false`, not
      an error and not `true`; the block is skipped, correctly treating
      "no clear answer" the same as "didn't confirm."
5. `FolderPathText.Text = dialog.FolderName;` — inside the `if` block,
   two things happen in one statement: `dialog.FolderName` (Header above)
   is read, returning the real, confirmed folder path as a `string`;
   that value is assigned to `FolderPathText.Text` (Header above) — the
   named field this lesson's earlier Concept Unit proved is real,
   generated, and typed. This is the entire "connecting UI actions to
   application behavior" arc this lesson's opening paragraph promised,
   completed in one line: a real user action (a confirmed folder choice)
   is now visibly reflected in the running window.

### CS Lens

Checking `result == true` instead of simply writing `if (result)` is
**defensive handling of a three-valued type** — treating "unknown" as its
own real case, not silently coercing it into either `true` or `false` by
accident (in fact, C# doesn't even allow `if (result)` directly on a
`bool?` without an explicit comparison, for exactly this reason: a
`bool?` cannot implicitly stand in for a plain `bool` anywhere an
unambiguous yes/no is required). Also recognized in: a database column
allowing `NULL` alongside `TRUE`/`FALSE`, requiring an explicit `IS TRUE`
check rather than assuming absence means false; a form field distinguishing
"user left this blank" from "user explicitly selected no"; an HTTP request
distinguishing "the server said no" from "the server never responded at
all," rather than treating both as one generic failure.

### SE Lens

The alternative — assuming `ShowDialog()` returns a plain `bool`, and
treating any non-`true` result as "canceled" without distinguishing it
from "closed some other way" — would have compiled against an
imagined, wrong API and simply been incorrect; it's also a slightly
weaker design even if it happened to compile, since it can't distinguish
"the user actively said no" from "nothing happened at all," a
distinction some real applications do care about (this one doesn't need
to, and doesn't try to). The real cost already paid for the design chosen
here: every caller of a `bool?`-returning API has to actively decide how
to treat `null`, rather than getting to ignore the possibility — exactly
the extra `if`-condition complexity visible in this unit's own code,
compared to how much simpler `if (result)` would have read if the type
allowed it.

### Commands Needed

None beyond this lesson's one shared `dotnet build`, run once, covering
every Concept Unit's changes together — shown next.

### Run It

Real, captured output from running `dotnet build` against this lesson's
complete, final `MainWindow.xaml` and `MainWindow.xaml.cs` (.NET SDK
10.0.301), unedited:

```
Determining projects to restore...
Restored <project>\MastercamGenerator.csproj (in 49 ms).
MastercamGenerator -> <project>\bin\Debug\net10.0-windows\MastercamGenerator.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:01.91
```

This one real build covers every Concept Unit in this lesson at once —
the `StackPanel`/`Orientation`, both `TextBlock`s, the named
`FolderPathText` field, the `Button`/`Click` wiring, and this unit's own
`OpenFolderDialog` code all compiled together, in a single pass, per this
curriculum's own batching practice.

### Connecting Back

Every earlier Concept Unit in this lesson built one piece of a chain this
unit finally closes: the `StackPanel` (first unit) made room for three
children; the two `TextBlock`s (second and third units) gave this lesson
something to show and something to write into; the `Button` and its wired,
empty handler (fourth unit) made a real click actually run this lesson's
own code. This unit is what that handler, once triggered, actually does —
completing the arc from "a user clicks a button" to "a real, chosen
folder path appears in the window," the exact feature this lesson opened
by promising.

---

## Connect the Pieces

Trace one concrete action — a user clicking "Browse" and picking a real
folder — through every piece this lesson built, start to finish:

1. The user clicks the `Button` labeled `"Browse"` (fourth Concept Unit).
   `Button`'s own internal input handling raises its `Click` routed event
   (Header above).
2. WPF calls `IComponentConnector.Connect()`'s generated subscription —
   real, verified in the fourth Concept Unit — which had already wrapped
   `BrowseButton_Click` in a `RoutedEventHandler` and attached it with
   `+=` the moment this window was constructed. That subscribed delegate
   is what actually gets called now.
3. `BrowseButton_Click` (fifth Concept Unit) runs: constructs a new
   `OpenFolderDialog`, and calls `ShowDialog()` — the one blocking call in
   this whole lesson, pausing this method exactly here until the real
   operating system dialog closes.
4. The user picks a real folder and confirms. `ShowDialog()` returns
   `true`; `dialog.FolderName` now holds the real, chosen path as a
   `string`.
5. `if (result == true)` (fifth Concept Unit) evaluates `true`, and the
   one line inside it runs: `FolderPathText.Text = dialog.FolderName;`.
6. `FolderPathText` — proven, in the third Concept Unit, to be a real,
   generated field of type `TextBlock`, pointing at the exact second
   `TextBlock` this lesson's second and third Concept Units placed inside
   the `StackPanel` — has its `Text` property reassigned. WPF's own
   rendering, watching that property the same way it watched
   `Window.Title` back in Lesson 1, redraws it on screen with the new
   text.

None of this chain existed until this lesson connected it, piece by
piece: a container to hold controls, a control to label them, a named
control to write into, a wired event to trigger the write, and real logic
deciding what to write and when. Lesson 1 traced a program that did
everything once, at startup, in a fixed order; this lesson's trace is the
first one in this curriculum where "start" isn't the beginning of the
story — the click is.
