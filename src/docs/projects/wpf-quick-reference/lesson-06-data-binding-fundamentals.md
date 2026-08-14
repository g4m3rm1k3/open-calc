# Lesson 06: Data Binding Fundamentals

**What this covers:** what `{Binding ItemName}` actually does mechanically
— `DataContext`, binding modes, and `INotifyPropertyChanged`, the
interface that makes a bound UI update itself with zero manual refresh
code. This is the single most load-bearing WPF concept in this
reference — nearly every later lesson assumes it.

**What you need to know first:** [Lesson 00b](lesson-00b-delegates-events-and-lambdas.md)
(the `event` mechanism this lesson's core interface is built on) and
[Lesson 02](lesson-02-xaml-syntax-itself.md)'s markup-extension syntax.

## The problem this replaces

Without binding, keeping UI in sync with data means manual code
everywhere the data changes: `NameTextBlock.Text = item.Name;` after
every single place `item.Name` might change, by hand, forever. Binding
replaces that with a *declared relationship*: state once, in XAML, "this
property always shows whatever that property currently is," and never
write a manual refresh line for it again — the same problem Lesson 00b's
`Doorbell`/`event` example solves for "run code when something happens,"
now applied to "keep a value displayed correctly."

## `DataContext` — where a binding actually looks

```csharp
public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        DataContext = new Item { Name = "Drill", Value = 89.99m };
    }
}
```

```xml
<StackPanel>
    <TextBlock Text="{Binding Name}" />
    <TextBlock Text="{Binding Value}" />
</StackPanel>
```

`DataContext` is a real property every `FrameworkElement` has (so, every
control), and it's **inherited down the visual tree**: setting it once on
`Window` (or any container) means every descendant that doesn't set its
own `DataContext` uses that same object automatically. `{Binding Name}`
on the first `TextBlock` means "look up `Name` on whatever object is my
nearest `DataContext`" — here, the `Item` object assigned above — and
`Text` gets set to that `Item`'s `Name` property's current value. Change
`DataContext` to a different `Item`, and both `TextBlock`s update to that
new object's values with no other code written — the binding re-evaluates
against whatever `DataContext` currently is, not a one-time snapshot
taken at binding time.

**A binding path can go deeper than one property:**

```xml
<TextBlock Text="{Binding Owner.Name}" />
<TextBlock Text="{Binding Items.Count}" />
```

`Owner.Name` — dotted paths walk into nested objects, same as C# property
access; if `Owner` is currently `null`, the binding fails silently (shows
blank, no crash) rather than throwing — worth remembering when a bound
value is mysteriously empty and the object turns out to be `null`.

## Binding modes — which direction data actually flows

```xml
<TextBlock Text="{Binding Name, Mode=OneWay}" />
<TextBox Text="{Binding Name, Mode=TwoWay}" />
```

- **`OneWay`** — source (`DataContext`'s property) → UI, never the other
  direction. The default for most read-only-feeling properties.
- **`TwoWay`** — source → UI, *and* UI → source: typing in a bound
  `TextBox` actually writes back into the underlying object's property.
  The default for `TextBox.Text`, `CheckBox.IsChecked`,
  `ComboBox.SelectedItem` — anything the user directly edits — specifically
  because WPF picks a sensible default `Mode` per property, not per
  binding in general.
- **`OneWayToSource`** — UI → source only, rare, real for a handful of
  edge cases (a control whose displayed value should never reflect
  external changes, only report user input outward).
- **`OneTime`** — reads the value once, at binding creation, and never
  again — for data that's genuinely fixed after load (a window title set
  from a config value, say).

## `INotifyPropertyChanged` — how `OneWay`/`TwoWay` actually knows to refresh

A plain auto-property (Lesson 00) has no way to announce "I changed" —
nothing calls the binding back. This is the real interface that closes
that gap:

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

    public event PropertyChangedEventHandler? PropertyChanged;
}
```

`INotifyPropertyChanged` — a real interface with exactly one member: the
`PropertyChanged` event. `public event PropertyChangedEventHandler?
PropertyChanged;` — the identical `event` mechanism from Lesson 00b,
nothing new about the keyword itself; new only in that WPF's binding
system specifically subscribes to *this* event, by name, on any object
implementing this interface, the moment that object becomes a
`DataContext` (or a bound property's value). `set { ... }` here is a full
property (Lesson 00), not an auto-property, specifically because it needs
real logic: `if (_name == value) return;` skips firing the event when the
value didn't actually change (a real, worthwhile guard — firing on every
assignment even when nothing changed means every binding downstream
re-evaluates for no reason). `PropertyChanged?.Invoke(this, new
PropertyChangedEventArgs(nameof(Name)));` — the null-conditional
`?.Invoke` from Lesson 00b (skip if nobody's subscribed yet), firing the
event with `nameof(Name)` — a compiler-checked string ("Name" as text,
but verified at compile time that a member actually named `Name` exists,
catching typos a plain `"Name"` string literal wouldn't).

**Proof this is what actually drives the UI, not just a formality:**
delete the `PropertyChanged?.Invoke(...)` line, set `item.Name = "New
name";` from code somewhere after the window is already showing, and the
`TextBlock` **does not update** — the object's real value changed, but
nothing told the binding, so it never re-reads it. Restoring the line
fixes it. This is the single most common "why isn't my UI updating" bug
in real WPF code — a property that changed value but never announced it.

## Execution trace: typing one character into a `TwoWay`-bound `TextBox`

```xml
<TextBox Text="{Binding Name, UpdateSourceTrigger=PropertyChanged}" />
```

1. User types "D" into the `TextBox`. WPF's own internal `TextChanged`
   handling (not code you write) fires because `UpdateSourceTrigger`
   (Lesson 04) is set to `PropertyChanged`, not the `TextBox`-default
   `LostFocus`.
2. Because the binding is `TwoWay` (the default for `TextBox.Text`), WPF
   writes the new text into the bound `Item.Name` property's `set` —
   this runs the real `set` block shown above, including the
   `if (_name == value) return;` guard (skipped here, since "D" differs
   from the previous empty value).
3. `_name = "D";` — the backing field updates.
4. `PropertyChanged?.Invoke(...)` fires, naming `Name` as the changed
   property.
5. Any *other* binding also pointed at this same `Item`'s `Name` (a
   second `TextBlock` elsewhere showing the same value, say) receives
   that event and re-reads `Name`, updating itself — even though nothing
   in this specific `TextBox`'s own binding path touched that other
   control directly. This is the real payoff: one object, one event,
   every bound consumer of it stays correct with zero manual wiring
   between them.

## `ObservableCollection<T>` — the collection-shaped version of the same idea

`INotifyPropertyChanged` covers one object's own properties changing.
Adding or removing items from a `List<T>` a `ListBox`/`DataGrid` is bound
to needs a different, parallel mechanism — full treatment in
[Lesson 11](lesson-11-collections-and-icollectionview.md); named here
only so you don't confuse the two: `INotifyPropertyChanged` is "this
property's *value* changed," `ObservableCollection<T>` is "this
*collection* gained or lost an item."

## SE Lens

This is the **Observer pattern** again (Lesson 00b named it for
`Doorbell`/`event`) — here, WPF's binding engine is the subscriber, your
data object is the subject, and `PropertyChanged` is the notification
channel, with WPF itself doing the subscribing instead of you writing
`+=` by hand. The real alternative this replaces: polling (some timer
that re-checks every bound value on an interval and refreshes anything
that changed) — wasteful and laggy compared to a push notification fired
exactly once, exactly when something real changed.

## What to check first in your assigned project

- Find the class(es) implementing `INotifyPropertyChanged` — those are
  your real view models / bindable data, and every property on them that
  *doesn't* fire `PropertyChanged` in its `set` is a property that will
  silently fail to update the UI if changed from code after the window
  is already open.
- For any `TextBox` that "doesn't update live," check `UpdateSourceTrigger`
  before suspecting the binding path itself.
- `Mode=` explicitly written on a binding is worth reading closely — it
  usually means the default for that property wasn't what was wanted,
  which is a hint about a real design decision made earlier in the
  project.

## Next

[Lesson 07 — Commands and MVVM](lesson-07-commands-and-mvvm.md) — binding
covers *data*; this next lesson covers binding *actions* (`Button` clicks
routed through a bindable `ICommand` instead of a code-behind `Click`
handler), and the real reason MVVM exists at all.
