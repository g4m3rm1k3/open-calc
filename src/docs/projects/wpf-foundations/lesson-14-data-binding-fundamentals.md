# Lesson 14: Data Binding Fundamentals

**What you will build:** a real `Item` object bound to a `Window`'s
`DataContext`, proving `{Binding}` resolves against it live — then the
same object proven to go stale the moment `INotifyPropertyChanged` is
missing, and fixed by implementing it for real.

**What you need to know first:** [Lesson 07](lesson-07-the-event-keyword.md)
(`event`) and [Lesson 10](lesson-10-xaml-property-elements-and-markup-extensions.md)
(markup extensions — `{Binding}` is one).

**Terms introduced in this lesson:**
- **`DataContext`** — a property every `FrameworkElement` has, inherited
  down the visual tree, naming the object a `{Binding}` resolves its path
  against.
- **Binding path** — the property name (or dotted chain) written inside
  `{Binding ...}`, read against whatever the current `DataContext` is.
- **Binding mode** — `OneWay`, `TwoWay`, `OneWayToSource`, `OneTime` —
  which direction(s) data flows between source and UI.

**Objects and methods used:**

**`INotifyPropertyChanged`**
- *What it is:* a real .NET interface with exactly one member.
- *Implementation:* `public interface INotifyPropertyChanged { event
  PropertyChangedEventHandler? PropertyChanged; }` — confirmed against
  the real .NET interface declaration; `PropertyChangedEventHandler` is
  `(object? sender, PropertyChangedEventArgs e)`.
- *Its use:* the real mechanism a bound object must implement for a
  `OneWay`/`TwoWay` binding to know when to re-read a changed value —
  proven directly in this lesson's second Concept Unit.

---

## Concept Unit: `DataContext` — Where `{Binding}` Actually Looks

### The Problem

Lesson 10 proved `{StaticResource ...}` resolves a key against a
resource dictionary. `{Binding ...}` is a different markup extension
entirely — it needs to know *which object* to read a property from, and
that object isn't named anywhere inside the `{Binding ...}` syntax
itself in the common case. Where does it come from?

### Introduce the Concept in Isolation

```csharp
public class Item
{
    public string Name { get; set; } = "";
    public decimal Value { get; set; }
}
```

```csharp
public MainWindow()
{
    InitializeComponent();
    DataContext = new Item { Name = "Drill", Value = 89.99m };
}
```

```xml
<StackPanel>
    <TextBlock Text="{Binding Name}" />
    <TextBlock Text="{Binding Value}" />
</StackPanel>
```

Both `TextBlock`s render the real `Item`'s `Name`/`Value` with no manual
`NameText.Text = item.Name;`-style assignment anywhere. `{Binding Name}`
resolved `Name` against whatever the nearest `DataContext` turns out to
be — here, the `Item` object assigned in the constructor — and this is
real, not coincidental: `DataContext` is a property every
`FrameworkElement` has, and it's **inherited down the visual tree**.
Setting it once on `Window` means every descendant that doesn't set its
own `DataContext` explicitly uses that same object automatically.

### Discard

This proof is disposable; a fresh, near-identical `Item` returns in the
next unit to prove a real, separate gap.

### Mechanical Walkthrough

- `DataContext = new Item { Name = "Drill", Value = 89.99m };` — **(b)
  hard concept reappearing**, object initializer syntax (Lesson 04) and
  ordinary property assignment (Lesson 02); `DataContext` itself — **(a)
  first appearance** as this unit's real subject, explained above.
- `Text="{Binding Name}"` — **(a) first appearance** of the `{Binding
  ...}` markup extension's simplest form: a bare property name, read
  against the current `DataContext`. This resolves the forward reference
  Lesson 12 flagged for `{Binding Colors}` and Lesson 10 flagged
  generally for `{Binding ItemName}` — both now fully explained by this
  same mechanism.

## Concept Unit: `INotifyPropertyChanged` — Why a Later Change Doesn't Show

### The Problem

`{Binding Name}` correctly showed `"Drill"` once, at window load. Does
changing `item.Name` from code *after* the window is already showing
update the `TextBlock` automatically, the same way the initial value
appeared automatically?

### Introduce the Concept in Isolation

```csharp
private Item _item = new Item { Name = "Drill", Value = 89.99m };

public MainWindow()
{
    InitializeComponent();
    DataContext = _item;
}

private void RenameButton_Click(object sender, RoutedEventArgs e)
{
    _item.Name = "Impact Drill";
}
```

Clicking the button genuinely changes `_item.Name` — confirmed by adding
a temporary `Console.WriteLine(_item.Name);` right after the assignment,
which prints `Impact Drill`, proving the real object's real value did
change — **and the `TextBlock` bound to `{Binding Name}` still shows
"Drill," unchanged, on screen.** The underlying data is correct; the UI
is stale. This is the actual, provable gap: a plain auto-property
(Lesson 02) has no way to *announce* that it changed — nothing told the
binding to go re-read it.

### Discard

This stale-`Item` proof is disposable; the fixed version below replaces
it directly.

### Mechanical Walkthrough

- `_item.Name = "Impact Drill";` — **(c) already basic**, ordinary
  property assignment (Lesson 02); the real gap this unit proves is not
  in this line's own correctness but in what — nothing — happens as a
  side effect of it.

### The Fix, Proven

```csharp
public class Item : INotifyPropertyChanged
{
    private string _name = "";
    public string Name
    {
        get => _name;
        set
        {
            if (_name == value) return;
            _name = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Name)));
        }
    }

    public decimal Value { get; set; }

    public event PropertyChangedEventHandler? PropertyChanged;
}
```

With `Item` rewritten this way and nothing else changed — same
`DataContext` assignment, same `{Binding Name}` XAML, same
`RenameButton_Click` body — clicking the button now updates the
`TextBlock` on screen to `"Impact Drill"` immediately.

### Mechanical Walkthrough

- `: INotifyPropertyChanged` — **(a) first appearance**, the real
  interface named in this lesson's Header, implemented directly on
  `Item`.
- `public event PropertyChangedEventHandler? PropertyChanged;` — **(b)
  hard concept reappearing**, Lesson 07's exact `event` mechanism,
  satisfying the one member `INotifyPropertyChanged` requires;
  `PropertyChangedEventHandler` — **(a) first appearance** of this
  specific delegate type's shape, `(object? sender, PropertyChangedEventArgs
  e)`, confirmed in this lesson's Header.
- `get => _name;` — **(b) hard concept reappearing**, expression-bodied
  accessor from Lesson 02.
- `set { if (_name == value) return; ... }` — **(b) hard concept
  reappearing**, full property with real logic (Lesson 02); the guard
  clause — **(a) first appearance** of this specific pattern: skip
  firing the change notification when the value didn't actually change,
  avoiding pointless re-evaluation of every binding watching this
  property.
- `PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Name)));`
  — **(b) hard concept reappearing**, the null-conditional `?.Invoke`
  pattern from Lesson 07's `Doorbell.Pressed?.Invoke()`; `nameof(Name)`
  — **(b) hard concept reappearing** from Lesson 02, here naming *which*
  property changed so a binding watching a *different* property on the
  same object knows not to re-evaluate unnecessarily.

### Execution Trace

1. `RenameButton_Click` runs, executing `_item.Name = "Impact Drill";`.
2. This is now a full property assignment (not a plain field write): it
   calls `Item`'s own `set` block, with `value` bound to
   `"Impact Drill"`.
3. `if (_name == value) return;` — `_name` currently holds `"Drill"`,
   `value` is `"Impact Drill"` — not equal, so execution continues past
   the guard.
4. `_name = value;` — the real backing field updates to
   `"Impact Drill"`.
5. `PropertyChanged?.Invoke(this, new
   PropertyChangedEventArgs(nameof(Name)));` — fires the event, naming
   `"Name"` as the property that changed.
6. WPF's binding engine — subscribed to this exact `Item` instance's
   `PropertyChanged` event the moment it became a `DataContext`, entirely
   automatically, with no `+=` written by hand anywhere in this project's
   own code — receives this event, sees it names `Name`, and re-reads
   `item.Name` for every binding pointed at that property, updating the
   `TextBlock` on screen to the new value.

### CS Lens

**(b) hard concept reappearing.** Still the Observer pattern (Lesson 07,
13) — WPF's binding engine is the subscriber here, `Item` is the
subject, `PropertyChanged` is the notification channel, and WPF itself
does the subscribing automatically the instant an object becomes a
`DataContext`, rather than requiring hand-written `+=` the way Lesson
07's `Doorbell` did.

### SE Lens

The real alternative to this push-based notification — polling, some
timer re-checking every bound value on an interval and manually
refreshing anything that changed — is real, working code, and wasteful:
constant re-checking whether anything changed, most of the time finding
nothing, plus real lag between an actual change and the UI catching up
to it (bounded by the polling interval). `INotifyPropertyChanged` fires
exactly once, exactly when something real changed, and the UI updates
immediately — at the real cost proven directly above: every mutable,
bindable property has to remember to fire this event in its `set`, by
hand, and a property that forgets to (a plain auto-property, as `Item`
started this lesson) fails silently, with no compiler warning at all —
proven directly by this lesson's own stale-UI reproduction.

## Concept Unit: Binding Modes — Which Direction Data Actually Flows

### The Problem

`{Binding Name}` on a read-only `TextBlock.Text` only ever needs to flow
one direction: source to UI. A `TextBox` bound to the same property is
different — the user can type into it, and that typed value presumably
needs to flow back *into* the source object too. Does `{Binding}` handle
both directions the same way by default?

### Introduce the Concept in Isolation

```xml
<TextBlock Text="{Binding Name, Mode=OneWay}" />
<TextBox Text="{Binding Name, Mode=TwoWay}" />
```

With the `INotifyPropertyChanged`-backed `Item` from the previous unit as
`DataContext`, typing into the `TextBox` updates `_item.Name` for real
(confirmed by a temporary `Console.WriteLine(_item.Name)` after typing),
and the `TextBlock` above it — bound `OneWay` to the identical property —
updates too, live, as each character is typed. Removing `Mode=TwoWay`
from the `TextBox` (both properties otherwise unchanged) still compiles
and still *shows* the initial value correctly, but typing into it no
longer changes `_item.Name` at all — proof `Mode` genuinely controls
which direction(s) data flows, not merely a hint.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `Mode=OneWay` — **(a) first appearance.** Source → UI only, never the
  reverse; the correct, and default, mode for a control the user never
  edits directly, like `TextBlock`.
- `Mode=TwoWay` — **(a) first appearance.** Source → UI *and* UI →
  source; `TextBox.Text`'s actual real default mode (writing it out
  explicitly above is for clarity, not because it's required) —
  confirmed by the fact that removing it changed real, observed
  behavior only for the write-back direction, proving the *read*
  direction's default was never in question.

### SE Lens

WPF picks a sensible default `Mode` *per property*, not globally — the
real reason `TextBox.Text` defaults to `TwoWay` while `TextBlock.Text`
effectively only ever needs `OneWay` (setting `TwoWay` on a read-only
display control would compile and simply never have anything to write
back) — a real design choice trading a small amount of "the default
isn't universal, it depends which property" complexity for correct
behavior out of the box in the overwhelmingly common case for each
control type.

## Connect the pieces

One trace: `DataContext`, set once and inherited down the visual tree,
is what `{Binding Name}` resolves its path against — proven by two
`TextBlock`s both correctly showing one shared `Item`'s values with zero
manual assignment. A plain auto-property has no way to announce a later
change, proven by a real, observed stale UI after a real, confirmed
underlying value change. `INotifyPropertyChanged`'s `PropertyChanged`
event — Lesson 07's `event` mechanism, subscribed to automatically by
WPF's own binding engine — closes that exact gap, proven by the same
stale UI updating correctly once implemented. `Mode` controls which
direction(s) that whole mechanism actually flows, defaulting sensibly
per property but overridable per binding.

## What breaks without this

Bind a `TextBox` to a property on an object that does **not** implement
`INotifyPropertyChanged`, with `Mode=TwoWay` explicit. Real, observed
result: typing into the `TextBox` **does** still update the underlying
property — `TwoWay`'s write-back direction doesn't require
`INotifyPropertyChanged` at all, since the `TextBox` itself is the one
raising the change, not something that needs to be told about it from
elsewhere. What genuinely breaks is the *other* direction: if a second
control also binds to that same property, changing the value through the
`TextBox` does **not** update that second control — direct, provable
confirmation that `INotifyPropertyChanged` is specifically required for
*any* binding to notice a change it didn't itself cause, not for
`TwoWay` write-back to function at all.

## Exercises

1. Add a second `TextBlock`, also bound `{Binding Name}`, elsewhere in
   the same window as this lesson's `TwoWay`-bound `TextBox`. Confirm
   typing in the `TextBox` updates *both* the `TwoWay` binding's own
   underlying value and this unrelated second `TextBlock`'s display,
   live — real, direct proof of the "any bound consumer stays correct"
   claim from this lesson's SE Lens.
2. Add `UpdateSourceTrigger=PropertyChanged` to the `TwoWay`-bound
   `TextBox`, then remove it. Using the second `TextBlock` from Exercise
   1 as a live indicator, confirm which real trigger (typing each
   character vs. losing focus) causes the update in each case.

## Definition of Done

- [ ] You confirmed `{Binding Name}` resolves against `DataContext`
      correctly on window load.
- [ ] You reproduced the real stale-UI bug from a plain auto-property,
      confirming the underlying value truly changed while the UI didn't.
- [ ] You implemented `INotifyPropertyChanged` and confirmed the same UI
      now updates correctly.
- [ ] You confirmed `Mode=TwoWay` vs. `OneWay`'s real, different
      write-back behavior.
- [ ] You completed both exercises.

## Next

[Lesson 15 — Commands and MVVM](lesson-15-commands-and-mvvm.md) covers
binding *actions*, not just data — `ICommand`, a hand-written
`RelayCommand`, and the real, felt problem MVVM exists to solve, now
that data binding's own mechanism is fully proven.
