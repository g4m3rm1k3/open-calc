# Lesson 10: Dependency Properties

**What this covers:** what a `DependencyProperty` actually is, why WPF
built its own property system instead of using plain C# properties
everywhere, and how to write one — the real mechanism behind
`Grid.Row` (attached properties, Lesson 03), `{Binding}` targets,
`Style` `Setter`s, and animation, all at once.

**What you need to know first:** [Lesson 00](lesson-00-csharp-for-java-kotlin-developers.md)'s
properties section, [Lesson 03](lesson-03-layout-panels.md)'s attached
properties, [Lesson 06](lesson-06-data-binding-fundamentals.md).

## The problem a plain C# property can't solve

A normal auto-property (Lesson 00) has exactly one place its value can
come from: whatever last assigned it. But a real `Button`'s `Background`
can legitimately come from *several* competing sources at once — a
`Style`'s `Setter` (Lesson 08), a `Trigger` overriding it while
`IsMouseOver` is true, a direct `Background="..."` on the element itself,
or nothing at all (inheriting a default). Something has to decide, at any
given moment, which of those sources wins, and re-decide automatically
the instant any of them changes — a plain backing field with a getter and
setter has no way to express "several possible sources, ranked by
precedence" at all.

## What a `DependencyProperty` actually is

```csharp
public static readonly DependencyProperty BackgroundProperty =
    DependencyProperty.Register(
        name: "Background",
        propertyType: typeof(Brush),
        ownerType: typeof(Control),
        typeMetadata: new PropertyMetadata(Brushes.Transparent));
```

This is real, closely paraphrased from how WPF's own `Control.Background`
is actually declared. `public static readonly` — **(a) first
appearance.** `static` means this belongs to the *type* (`Control`
itself), not to any one instance — there is exactly one
`BackgroundProperty` object shared by every `Button`, `TextBox`, and
every other `Control` that ever exists, the same way a `static` field in
Java/Kotlin belongs to the class, not each object. `readonly` — set once,
at class initialization, never reassigned after. `DependencyProperty` — a
real WPF class; this field isn't the *value* `89.99m` or `"Drill"` the
way a normal field would hold — it's an **identifier**, a registered
token representing "there exists a property named Background, of type
`Brush`, on `Control`." `DependencyProperty.Register(...)` is the real
static factory method that creates and registers this identifier once,
globally, the moment the `Control` class is first loaded.

The actual per-instance value lives somewhere else entirely — inside a
dictionary WPF maintains per object (a `DependencyObject`, the real base
class `Button`/`TextBox`/every visual element ultimately inherits from),
keyed by these `DependencyProperty` identifiers. `myButton.Background`
isn't reading a field on `myButton` — it's calling `GetValue
(BackgroundProperty)`, which asks that internal dictionary/precedence
system, checking (in real, ordered precedence, highest first): an active
`Trigger`, a local value set directly on this instance, a `Style`
`Setter`, an inherited value from a parent, and finally the registered
default (`Brushes.Transparent` above) if nothing else applies. This
precedence chain — not a single backing field — is the real reason
`DependencyProperty` exists: it's the mechanism capable of resolving
"several possible sources, one winner, re-evaluated live" that a plain
property genuinely cannot express.

## Writing your own

```csharp
public class RatingControl : Control
{
    public static readonly DependencyProperty StarsProperty =
        DependencyProperty.Register(
            nameof(Stars),
            typeof(int),
            typeof(RatingControl),
            new PropertyMetadata(0, OnStarsChanged));

    public int Stars
    {
        get => (int)GetValue(StarsProperty);
        set => SetValue(StarsProperty, value);
    }

    private static void OnStarsChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        Console.WriteLine($"Stars changed from {e.OldValue} to {e.NewValue}");
    }
}
```

```xml
<local:RatingControl Stars="4" />
<local:RatingControl Stars="{Binding CurrentRating}" />
```

- `DependencyProperty.Register(nameof(Stars), typeof(int),
  typeof(RatingControl), new PropertyMetadata(0, OnStarsChanged))` —
  four real arguments: the property's name (as a string, generated
  safely via `nameof` — Lesson 06's exact reason for preferring it over a
  literal), its value type, the type that owns it, and metadata carrying
  a default value (`0`) plus an optional **callback** — a method
  reference (Lesson 00b's delegate mechanism again) run automatically
  every time this property's resolved value actually changes, for any
  reason — a direct assignment, a `Style`, or a `{Binding}` pushing a new
  value in.
- `public int Stars { get => (int)GetValue(StarsProperty); set =>
  SetValue(StarsProperty, value); }` — the **CLR property wrapper**: a
  completely ordinary-looking C# property (Lesson 00's `get`/`set`
  syntax) whose body does nothing but forward to `GetValue`/`SetValue`
  against the real `DependencyProperty`. This wrapper exists purely for
  convenience — `myControl.Stars = 4;` in plain C# code reads naturally —
  but it is not where the actual value lives, and nothing stops the
  underlying `DependencyProperty` from being set some other way (a
  `Style`, a `{Binding}`) that never goes through this wrapper's `set` at
  all, which is precisely why a plain `private set;` auto-property could
  never substitute for this.
- `OnStarsChanged` — fires with the actual old and new values whenever
  `Stars` changes through *any* path (direct set, style, binding,
  animation) — a single, reliable hook a plain property's `set` block
  could only catch for direct assignment, missing every other source.

**This is why `{Binding}` targeting a custom property just works, with
zero extra plumbing:** WPF's binding engine specifically targets
`DependencyProperty`s (it calls `SetValue` under the hood, same as
`Stars`'s own wrapper), which is why `Stars="{Binding CurrentRating}"`
above requires nothing beyond declaring `StarsProperty` correctly — no
`INotifyPropertyChanged` needed on `RatingControl` itself for this
direction to work, because the whole precedence/notification system
Dependency Properties provide already covers it.

## Attached properties — a `DependencyProperty` owned by one type, set on another

```csharp
public static readonly DependencyProperty RowProperty =
    DependencyProperty.RegisterAttached(
        "Row", typeof(int), typeof(Grid), new PropertyMetadata(0));

public static int GetRow(DependencyObject obj) => (int)obj.GetValue(RowProperty);
public static void SetRow(DependencyObject obj, int value) => obj.SetValue(RowProperty, value);
```

This is, closely paraphrased, the real mechanism behind `Grid.Row` from
Lesson 03. `RegisterAttached` instead of `Register`, and static
`GetRow`/`SetRow` methods instead of an instance property wrapper — this
is what lets *any* element (`Button`, `TextBlock`, anything) be given a
`Grid.Row="1"` in XAML even though `Row` isn't declared anywhere on
`Button` or `TextBlock` themselves. `Grid` owns and registers the
property; any `DependencyObject` can have a value stored against it,
because — as stated above — the real storage is a per-object dictionary
keyed by `DependencyProperty` identifiers, not a field the target type
has to declare itself.

## CS Lens

**(b) hard concept, real restatement.** This is a form of the
**Decorator**/external-property idea taken further than most languages
allow: rather than every object needing its own field for every property
it might ever need, `DependencyObject` gives every instance a shared,
generic key-value store, and any type can register a new key into that
shared system at any time — `Grid` didn't need `Button`'s source code
touched to give every `Button` a `Row`. Also recognized in: JavaScript
objects as open property bags (any object can gain a new property at
runtime with no class change), Android's own `View` tag/extra-data
system, and ECS (Entity-Component-System) game architectures where
"components" are attached to entities without the entity's own class
knowing about them ahead of time.

## What to check first in your assigned project

- Any custom control (a class inheriting `Control`, `UserControl`, or
  `FrameworkElement` written for this project, not a stock WPF control)
  — check whether its bindable properties are real `DependencyProperty`s
  or plain C# properties; a plain property on a custom control silently
  **cannot** be targeted by `{Binding}`, a `Style` `Setter`, or a
  `Trigger` — a real, common bug source if one was used by mistake.
- Attached-property usage (`Grid.Row`, `DockPanel.Dock`, and any
  `SomeType.SomeProperty="..."` syntax) — confirms which panel or type
  actually owns and interprets that value.

## Next

[Lesson 11 — Collections and ICollectionView](lesson-11-collections-and-icollectionview.md)
covers `ObservableCollection<T>` and live sorting/filtering/grouping —
the collection-shaped counterpart to this lesson's single-value system.
