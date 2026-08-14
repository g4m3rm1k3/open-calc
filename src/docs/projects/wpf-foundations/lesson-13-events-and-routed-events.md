# Lesson 13: Events and Routed Events

**What you will build:** a real `Click` handler, proven to be Lesson 07's
`event` mechanism underneath — then a nested-panel proof of **routed
events**, WPF's own extension with no equivalent in a plain C# `event`,
observed by real, ordered output as one click fires handlers on multiple
elements.

**What you need to know first:** [Lesson 07](lesson-07-the-event-keyword.md)
(`event`, subscribing via `+=`) and [Lesson 12](lesson-12-core-controls-tour.md).

**Terms introduced in this lesson:**
- **Routed event** — a WPF event that travels through the visual tree
  (bubbling or tunneling), rather than firing only on the exact object it
  was raised on.
- **Bubbling** — a routed event travels from the exact element it
  occurred on, upward through every ancestor.
- **Tunneling** — a `Preview`-prefixed routed event travels from the
  root window downward to the exact element, before the bubbling version
  fires.
- **`e.Handled`** — set inside a handler to stop a routed event's
  further travel along its route.

**Objects and methods used:**

**`Button.Click`**
- *What it is:* a real, declared event on `System.Windows.Controls.Button`
  (inherited from `ButtonBase`).
- *Implementation:* `public event RoutedEventHandler Click;` in real
  shape — `RoutedEventHandler` is `(object sender, RoutedEventArgs e)`.
- *Its use:* the concrete event this lesson's first unit wires up, proven
  to be Lesson 07's own `event` mechanism, not a new one.

---

## Concept Unit: `Click` Is `event` — Not a New Mechanism

### The Problem

`Click="ShowButton_Click"` appeared, unexplained, in Lesson 12. Whether
this XAML attribute is a new, WPF-specific wiring mechanism, or simply
Lesson 07's already-known `event` subscription written in a different
syntax, needs to be proven, not assumed.

### Introduce the Concept in Isolation

```xml
<Button Content="Click me" Click="MyButton_Click" />
```

```csharp
private void MyButton_Click(object sender, RoutedEventArgs e)
{
    Console.WriteLine("Clicked via XAML attribute");
}
```

```csharp
public MainWindow()
{
    InitializeComponent();
    MyButton.Click += (s, e) => Console.WriteLine("Clicked via += in code");
}
```

Clicking the button once prints **both** lines:
```
Clicked via XAML attribute
Clicked via += in code
```

`Click="MyButton_Click"` in XAML and `MyButton.Click += (s, e) => ...;`
in code-behind are **both real subscriptions to the same event**, proven
by both handlers firing from one single click, in the order they were
subscribed — the identical `+=`-adds-without-replacing behavior Lesson
07's `Doorbell` proved directly. `Click="..."` in XAML is compiler
sugar: it generates the equivalent `MyButton.Click += MyButton_Click;`
call inside `InitializeComponent()` (Lesson 09) automatically — not a
separate mechanism, the same one, spelled two ways.

### Discard

This proof is disposable; real event handlers throughout the rest of
this series use the more common `Click="..."` XAML form without
re-proving this equivalence each time.

### Mechanical Walkthrough

- `Click="MyButton_Click"` — **(a) first appearance** of the XAML
  attribute wiring form, proven equivalent to plain `+=` above.
- `private void MyButton_Click(object sender, RoutedEventArgs e)` — **(a)
  first appearance** of the required handler shape: `object sender` —
  the element the event actually fired on (useful when one handler
  serves several controls); `RoutedEventArgs e` — the real parameter
  type `Click`'s delegate (`RoutedEventHandler`) requires, its own class
  and members given full treatment in this lesson's next unit.
- `MyButton.Click += (s, e) => ...;` — **(b) hard concept reappearing**,
  Lesson 07's exact subscription syntax, now against a real WPF event
  instead of the throwaway `Doorbell.Pressed`.

## Concept Unit: Routed Events — Travelling Through the Visual Tree

### The Problem

A plain C# `event` (Lesson 07) only ever calls handlers subscribed
directly on the exact object that raised it. Does a WPF UI event behave
the same way, or does it do something a hand-rolled `event` field
cannot?

### Introduce the Concept in Isolation

```xml
<StackPanel MouseDown="Panel_MouseDown">
    <Button Content="Click me" MouseDown="Button_MouseDown" />
</StackPanel>
```

```csharp
private void Button_MouseDown(object sender, MouseButtonEventArgs e)
{
    Console.WriteLine("Button_MouseDown");
}

private void Panel_MouseDown(object sender, MouseButtonEventArgs e)
{
    Console.WriteLine("Panel_MouseDown");
}
```

Clicking directly on the `Button` — not the empty space around it, the
button itself — prints **both** lines, in this order:
```
Button_MouseDown
Panel_MouseDown
```

Nothing subscribed `Panel_MouseDown` to the `Button`'s own click — it's
subscribed to the `StackPanel`'s `MouseDown`, and the click physically
happened on the `Button`, a descendant, not directly on the panel's own
background. Yet it fired anyway, and specifically **after** the button's
own handler. This is called **bubbling**: the event starts at the exact
element the interaction happened on, then travels *upward* through every
ancestor in the visual tree, giving each one a chance to react — a real
behavior a plain C# `event` field, per Lesson 07, has no equivalent
mechanism for at all; `Doorbell.Pressed` only ever notified its own
direct subscribers, with no concept of "ancestors" to travel through.

### Discard

This proof is disposable; the `e.Handled` mechanism, next, modifies this
exact shape rather than replacing it.

### Mechanical Walkthrough

- `MouseDown="Panel_MouseDown"` on `<StackPanel>` — **(b) hard concept
  reappearing**, the same XAML event-wiring syntax as `Click`, applied
  to a different event (`MouseDown` instead of `Click`) and a different
  element type (`StackPanel` instead of `Button` — proof this wiring
  mechanism isn't specific to `Button`).
- `MouseDown="Button_MouseDown"` on the nested `<Button>` — **(c) already
  basic**, same mechanism, different target.
- `MouseButtonEventArgs e` — **(a) first appearance** of this specific
  `RoutedEventArgs` subclass, carrying mouse-specific details
  (button pressed, click count — not exercised further in this lesson);
  the base `RoutedEventArgs` shape from the previous unit still applies.
- The real, observed *order* — button's handler first, panel's second —
  is this unit's entire proof, explained above.

### Execution Trace

1. User clicks on the visible `Button`. WPF determines the exact element
   under the cursor: the `Button` itself.
2. `MouseDown` begins its bubble route at that exact element. `Button`
   has a subscribed handler, `Button_MouseDown` — it runs, printing
   `Button_MouseDown`.
3. Nothing stopped the route (the next unit's `e.Handled` was not set),
   so the event continues traveling upward to `Button`'s parent,
   `StackPanel`.
4. `StackPanel` has a subscribed handler, `Panel_MouseDown` — it runs,
   printing `Panel_MouseDown`.
5. `StackPanel` has no further ancestor with a subscribed `MouseDown`
   handler in this example, so the route ends.

### CS Lens

**(b) hard concept reappearing.** This is still the Observer pattern
(Lesson 07's real restatement applies unchanged) — extended with a real,
WPF-specific mechanism: one event, multiple independent observers,
positioned at different levels of a tree, all notified from a single
real occurrence, without the element that raised the event needing to
know or care how many ancestors are listening.

Also recognized in: the browser DOM's own event bubbling
(`addEventListener` with its bubble phase — nearly identical shape,
different framework), and Android's touch-event dispatch through a
`ViewGroup` hierarchy, if that comparison carries meaning from prior
work.

## Concept Unit: `e.Handled` — Stopping the Route

### The Problem

Bubbling means a parent's handler fires for *every* descendant's
interaction by default, whether that's wanted or not. Something needs to
let a handler say "this specific occurrence is fully dealt with — don't
let it keep traveling."

### Introduce the Concept in Isolation

```csharp
private void Button_MouseDown(object sender, MouseButtonEventArgs e)
{
    Console.WriteLine("Button_MouseDown");
    e.Handled = true;
}
```

With this one line added to the previous unit's `Button_MouseDown`,
clicking the button now prints **only**:
```
Button_MouseDown
```

`Panel_MouseDown` never runs — proof `e.Handled = true;` genuinely
stopped the route from continuing past the element that set it, rather
than merely being a hint or a convention.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `e.Handled = true;` — **(a) first appearance.** A real, settable
  `bool` property on `RoutedEventArgs` itself (inherited by
  `MouseButtonEventArgs`); once set, WPF's own routing logic checks it
  before continuing to the next stop on the route and simply doesn't
  proceed if it's `true`.

### SE Lens

The real reason WPF chose bubbling as the default over a plain,
non-routed `event`: a visual tree nests arbitrarily deep, and a
container frequently needs to react to "something happened to any of my
descendants" without wiring an individual handler onto every single one
by hand, present or added later — bubbling gives that for free. The real
cost, honestly stated: a handler on a container can fire for a
descendant's interaction the author never anticipated, which is exactly
what `e.Handled` and careful `sender`-checking inside a shared handler
exist to manage — proven directly by this unit, not asserted.

## Connect the pieces

One trace: `Click="..."` (or any XAML event attribute) is compiler sugar
for Lesson 07's own `+=` subscription — proven by both wiring forms
firing together from one click. WPF's own UI events add a real mechanism
plain `event` fields don't have: **bubbling**, travelling from the exact
element upward through every ancestor, proven by a click on a nested
`Button` also firing its container's handler. `e.Handled = true;`
inside any handler along that route stops it from travelling any
further — the real, provable mechanism behind "why did my inner
control's click also trigger my outer container's handler," and its
fix.

## What breaks without this

Set `e.Handled = true;` inside `Panel_MouseDown` instead of
`Button_MouseDown` (the *last* stop on the route, not the first), and
click the button again. Real, observed result: **both** lines still
print, in the same order as the unmodified version. `Panel_MouseDown`
setting `e.Handled` has no effect on `Button_MouseDown`, because the
route had already passed through and completed that stop *before*
reaching `Panel_MouseDown` — `e.Handled` can only prevent stops that
haven't happened *yet*, never undo one that already ran. Direct,
provable evidence the route travels in one real direction, and stopping
it is a one-way gate, not a retroactive cancellation.

## Exercises

1. Add a third, outer `<Grid MouseDown="Grid_MouseDown">` wrapping the
   entire `StackPanel` from this lesson's examples, with its own
   `Console.WriteLine`-printing handler. Confirm the real three-line
   output order with no `e.Handled` set anywhere, then confirm setting
   `e.Handled = true;` inside `Panel_MouseDown` specifically stops the
   route before it ever reaches `Grid_MouseDown`.
2. Add a `PreviewMouseDown="Button_PreviewMouseDown"` handler (a
   tunneling event, `Preview`-prefixed) alongside this lesson's existing
   `MouseDown` handlers, and confirm, from the real print order, that it
   fires **before** any bubbling `MouseDown` handler at all.

## Definition of Done

- [ ] You proved `Click="..."` and `+=` subscribe to the identical
      event by observing both handlers fire from one click.
- [ ] You reproduced real bubbling: a nested `Button`'s click also
      firing its container's handler.
- [ ] You reproduced `e.Handled` stopping the route, and the
      "already-passed stops can't be undone" behavior from the What
      Breaks section.
- [ ] You completed both exercises.

## Next

[Lesson 14 — Data Binding Fundamentals](lesson-14-data-binding-fundamentals.md)
covers `{Binding}`, used without full explanation in Lesson 12's
`ComboBox` unit — `DataContext`, binding modes, and
`INotifyPropertyChanged`, the single most load-bearing mechanism in the
rest of this series.
