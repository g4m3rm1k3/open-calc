# Lesson 05: Events and Routed Events

**What this covers:** what `Click="SaveButton_Click"` actually wires up,
the real signature every WPF event handler shares, and **routed
events** — the WPF-specific mechanism (bubbling and tunneling) with no
equivalent in a plain C# `event`.

**What you need to know first:** [Lesson 00b](lesson-00b-delegates-events-and-lambdas.md)
(the `event`/delegate mechanism this lesson builds directly on) and
[Lesson 04](lesson-04-core-controls-tour.md).

## Wiring a click, both halves

```xml
<Button Content="Save" Click="SaveButton_Click" />
```

```csharp
private void SaveButton_Click(object sender, RoutedEventArgs e)
{
    MessageBox.Show("Saved!");
}
```

`Click="SaveButton_Click"` in the XAML generates, inside the invisible
`InitializeComponent()` piece from Lesson 01, the equivalent of
`SaveButton.Click += SaveButton_Click;` — the exact `event += handler`
mechanism from Lesson 00b, just written as an XML attribute instead of a
C# statement. This is why the method name in `Click="..."` has to match a
real method in the code-behind exactly, and why that method's signature
can't be arbitrary — it has to match `Button.Click`'s own delegate type.

## The standard handler signature — always these two parameters

```csharp
private void SaveButton_Click(object sender, RoutedEventArgs e)
```

Every ordinary WPF event handler you'll write follows this same shape:

- `object sender` — the control the event actually fired on. Useful when
  one handler is reused across several controls
  (`Click="AnyButton_Click"` wired to five different buttons) and needs
  to know which one was actually clicked: `var clicked = (Button)sender;`.
- `RoutedEventArgs e` (or a subclass — `MouseButtonEventArgs`,
  `KeyEventArgs`, `TextChangedEventArgs`, depending on which event) —
  details about the event itself. `RoutedEventArgs` specifically carries
  `e.Source` (the original element the event started at, which can differ
  from `sender` — see routing, below) and `e.Handled` (settable to `true`
  to stop the event going any further — the real mechanism behind "this
  click shouldn't also trigger whatever's listening on the parent").

This shape is not arbitrary convention — it's dictated by the real
delegate type each event declares (`RoutedEventHandler` for `Click`,
which is `(object sender, RoutedEventArgs e)`, same idea as Lesson 00b's
`Operation` delegate defining a required shape). A handler with the wrong
parameter types is a compile error at the `+=`/XAML-attribute line, not a
runtime surprise.

## Routed events — the one thing with no Java/Kotlin equivalent

A plain C# `event` (Lesson 00b) only ever calls handlers subscribed
directly on that exact object. WPF's UI events are different: they
**route** through the visual tree.

```xml
<StackPanel MouseDown="Panel_MouseDown">
    <Button Content="Click me" MouseDown="Button_MouseDown" />
</StackPanel>
```

Clicking the `Button` fires **both** handlers, in this order:

1. `Button_MouseDown` — the element the click actually happened on.
2. `Panel_MouseDown` — the parent, even though the click wasn't
   literally "on" the `StackPanel`'s own background.

This is **bubbling**: the event starts at the exact element under the
mouse and travels upward through every ancestor in the visual tree,
giving each one a chance to react, unless something explicitly stops it.
`Click` itself is bubbling; so are `MouseDown`, `KeyDown`, `TextInput`,
and most events you'll actually wire up. A smaller set of **tunneling**
events (named with a `Preview` prefix — `PreviewMouseDown`,
`PreviewKeyDown`) run in the *opposite* direction first: from the root
window down to the exact element, before the bubbling version fires at
all. Real, complete order for a single click on that nested `Button`:

1. `PreviewMouseDown` on `StackPanel` (tunneling down)
2. `PreviewMouseDown` on `Button` (tunneling down, reached the target)
3. `MouseDown` on `Button` (bubbling up, starts at the target)
4. `MouseDown` on `StackPanel` (bubbling up, continues)

## Stopping the route: `e.Handled`

```csharp
private void Button_MouseDown(object sender, MouseButtonEventArgs e)
{
    e.Handled = true; // Panel_MouseDown will NOT run after this
}
```

Setting `e.Handled = true` inside a handler stops the event from
continuing to the next stop on its route. This is the real mechanism
behind "why did clicking this inner button also trigger my outer panel's
handler" (answer: nothing set `e.Handled`, so it bubbled through) and its
fix. Worth knowing before you go hunting for a bug that's actually
correct, undocumented-feeling routing behavior.

## `RoutedEvent` — why this exists instead of a plain `event`

**CS/SE Lens.** The real reason WPF didn't just use plain C# `event`s for
`MouseDown`/`Click`/etc.: a visual tree is nested arbitrarily deep (a
`Button` inside a `StackPanel` inside a `Grid` inside a `Window`), and a
parent frequently needs to react to something happening to *any* of its
descendants without that parent wiring a handler onto every single one
individually — a toolbar wanting to know "something inside me was
clicked" without enumerating every button it might ever contain. Bubbling
gives that for free: one handler on the container catches events from
everything inside it, present or added later, with zero extra wiring.
The cost: a handler on a container can fire for a descendant's event you
didn't expect, which is exactly what `e.Handled` and careful `sender`
checks exist to manage.

Also recognized in: the DOM's own event bubbling (`addEventListener`
with capture/bubble phases — the same tunneling/bubbling split, different
names), Android's touch event dispatch through a `ViewGroup` hierarchy.

## Attaching a handler in C# instead of XAML

```csharp
public MainWindow()
{
    InitializeComponent();
    SaveButton.Click += SaveButton_Click;
    SaveButton.Click += (s, e) => Console.WriteLine("Also runs");
}
```

Both `Click="..."` in XAML and `+=` in code-behind are the same real
subscription — nothing stops a control from having handlers wired both
ways, and both fire, in the order they were subscribed. The lambda form
(Lesson 00b) is common for small, throwaway handlers that don't need a
named method.

## What to check first in your assigned project

- For any control with strange double-firing behavior, check whether a
  parent has a handler on the same event name (bubbling) before assuming
  a bug in the control itself.
- `sender` inside a shared handler — confirm it's actually being cast and
  used, not ignored; a handler reused across several buttons that
  silently assumes which one fired is a real, common source of quiet
  bugs.
- Any `Preview`-prefixed event handler — that's tunneling, running before
  the non-`Preview` version, worth noting if two handlers for what looks
  like "the same interaction" exist on the same element.

## Next

[Lesson 06 — Data Binding Fundamentals](lesson-06-data-binding-fundamentals.md)
covers `{Binding}` for real — the mechanism `Content="{Binding ItemName}"`
throughout the earlier lessons has been relying on without full
explanation until now.
