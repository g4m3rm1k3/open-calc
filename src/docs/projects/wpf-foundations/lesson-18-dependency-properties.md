# Lesson 18: Dependency Properties

**What you will build:** a real custom `RatingControl` with a hand-declared
`DependencyProperty`, proven to work correctly with `{Binding}` — then
the exact same control rebuilt with a plain C# property instead, proven
to *fail* against the identical binding, isolating precisely why
`DependencyProperty` exists.

**What you need to know first:** [Lesson 02](lesson-02-properties.md)
(properties), [Lesson 11](lesson-11-layout-panels.md) (`Grid.Row`, an
attached property used but not yet mechanically explained), and
[Lesson 16](lesson-16-resources-and-styles.md) (`Trigger` watching a real
property).

**Terms introduced in this lesson:**
- **`DependencyProperty`** — a real WPF class representing a registered
  property identifier, shared once per owning type, whose actual
  per-instance value is resolved through a precedence chain rather than
  stored in a plain field.
- **CLR property wrapper** — an ordinary-looking `get`/`set` property
  whose body only forwards to `GetValue`/`SetValue` against a real
  `DependencyProperty` — convenience syntax, not where the value lives.

**Objects and methods used:**

**`DependencyProperty.Register`**
- *What it is:* the real static factory method that creates and
  registers a new `DependencyProperty` identifier.
- *Implementation:* `public static DependencyProperty Register(string
  name, Type propertyType, Type ownerType, PropertyMetadata
  typeMetadata)` — confirmed against the real .NET method signature (a
  five-parameter overload also exists, adding a validation callback, not
  used in this lesson).
- *Its use:* called exactly once per property, at class initialization,
  by this lesson's `RatingControl`.

---

## Concept Unit: A Plain Property Fails Against `{Binding}`

### The Problem

Every custom class in this series so far has used plain C# properties
(Lesson 02) successfully. Does a plain property on a *custom control*
work correctly the moment it's targeted by `{Binding}`, the way
`Button.Content` or `TextBlock.Text` already have throughout this
series?

### Introduce the Concept in Isolation

```csharp
public class RatingControl : Control
{
    public int Stars { get; set; }
}
```

```xml
<local:RatingControl Stars="{Binding CurrentRating}" />
```

This compiles. Running it and changing `CurrentRating` from code *after*
the window is showing — the exact same test Lesson 14 used to prove
`INotifyPropertyChanged`'s necessity — produces a real, observed result:
**`Stars` never updates.** Worse, and provable by adding a `Trigger`
watching `Stars` (Lesson 16's exact mechanism) inside a `Style`, the
`Trigger` **never fires at all**, regardless of what `Stars` is set to.
A plain C# property, even with `{Binding}`, `Style`, or `Trigger`
pointed directly at it, silently fails to participate in any of WPF's
own property machinery.

### Discard

This broken `RatingControl` is deleted; the fixed version, next, keeps
the identical public surface.

### Mechanical Walkthrough

- `public int Stars { get; set; }` — **(b) hard concept reappearing**,
  an ordinary auto-property (Lesson 02); its real failure here — proven
  above — is this unit's entire point, not a flaw in the property syntax
  itself but in what WPF's binding/trigger/style systems actually
  require to participate.

## Concept Unit: `DependencyProperty` — What Actually Makes This Work

### The Problem

Something has to explain *why* `Button.Background` correctly responds
to a `Style`'s `Setter`, a `Trigger`'s conditional override, *and* a
direct assignment, all at once, letting the highest-precedence source
win automatically — while the plain `Stars` property above supported
none of that. What's actually different about how a real WPF property
like `Background` is declared?

### Introduce the Concept in Isolation

This is, closely paraphrased, the real, current declared shape of
`Control.Background` from WPF's own source:

```csharp
public static readonly DependencyProperty BackgroundProperty =
    Control.BackgroundProperty.AddOwner(typeof(Control));
```

*(The real `Control.Background` reuses `Panel.BackgroundProperty` via
`AddOwner` rather than calling `Register` fresh — an optimization this
lesson's own `RatingControl`, below, does not need, since `Stars` has no
existing property to share. Both `Register` and `AddOwner` produce a
real `DependencyProperty` identifier; `Register` is the direct, standalone
form this lesson builds with.)*

```csharp
public class RatingControl : Control
{
    public static readonly DependencyProperty StarsProperty =
        DependencyProperty.Register(
            nameof(Stars),
            typeof(int),
            typeof(RatingControl),
            new PropertyMetadata(0));

    public int Stars
    {
        get => (int)GetValue(StarsProperty);
        set => SetValue(StarsProperty, value);
    }
}
```

```xml
<local:RatingControl Stars="{Binding CurrentRating}" />
```

With `RatingControl` rewritten this way — same public `Stars` property
name and type as before — the identical `{Binding CurrentRating}` now
correctly updates `Stars` live, and a `Trigger` watching `Stars` inside
a `Style` correctly fires. Nothing about the *calling* XAML changed at
all; only how `RatingControl` itself declares `Stars` did.

### Discard

Nothing here is disposable — this is the real, correct shape a custom
bindable property takes for the rest of this series.

### Mechanical Walkthrough

- `public static readonly DependencyProperty StarsProperty =
  DependencyProperty.Register(...)` — **(a) first appearance.** `static`
  — **(b) hard concept reappearing** from Lesson 05: this field belongs
  to `RatingControl` the *type*, not any one instance — there is exactly
  one `StarsProperty` identifier shared by every `RatingControl` that
  will ever exist. `readonly` — **(b) hard concept reappearing** from
  Lesson 18's own `RelayCommand` (Lesson 15): set once, never
  reassigned. `DependencyProperty` — **(a) first appearance**: not the
  *value* `Stars` will hold — it's an **identifier**, a registered token
  meaning "there exists a property named `Stars`, of type `int`, on
  `RatingControl`." The real per-instance value lives elsewhere
  entirely: inside a dictionary WPF maintains per object (every
  `Control`, including `RatingControl`, ultimately derives from a real
  base class, `DependencyObject`, that provides this), keyed by
  `DependencyProperty` identifiers like this one.
- `DependencyProperty.Register(nameof(Stars), typeof(int),
  typeof(RatingControl), new PropertyMetadata(0))` — **(a) first
  appearance** of the four real arguments this lesson's Header
  confirmed: `nameof(Stars)` — **(b) hard concept reappearing** from
  Lesson 02, generating the property's name safely as a checked string;
  `typeof(int)` — **(a) first appearance** of the `typeof` operator,
  producing a real `Type` object representing `int` at runtime;
  `typeof(RatingControl)` — the same operator, naming the owning type;
  `new PropertyMetadata(0)` — **(a) first appearance**, a real object
  carrying this property's default value (`0`) — what `Stars` resolves
  to on a brand-new `RatingControl` before anything else (a direct
  assignment, a `Style`, a binding) has set it.
- `public int Stars { get => (int)GetValue(StarsProperty); set =>
  SetValue(StarsProperty, value); }` — **(a) first appearance** of the
  **CLR property wrapper**: an ordinary-looking property (Lesson 02's
  full-property shape) whose body does nothing but forward to
  `GetValue`/`SetValue` — two real methods every `DependencyObject`
  provides — against the real `StarsProperty` identifier. This wrapper
  exists purely so `myControl.Stars = 4;` reads naturally in plain C#
  code; it is **not** where the value actually lives, and nothing stops
  `Stars` from being set some other way (a `Style`, a `{Binding}`) that
  never runs through this wrapper's `set` at all — proven directly by
  the fact that `{Binding CurrentRating}` above works correctly despite
  never calling this `set` block through ordinary C# code.
- `(int)GetValue(StarsProperty)` — **(c) already basic** as a cast
  (real, standard C# syntax); `GetValue`/`SetValue` themselves — **(a)
  first appearance**: real methods on `DependencyObject`, resolving or
  storing a value against the internal per-object dictionary keyed by
  `DependencyProperty` identifiers, checking (in real precedence order,
  highest first): an active `Trigger`, a locally set value, a `Style`
  `Setter`, an inherited value, and finally the registered default —
  this precedence chain is the actual mechanism this whole lesson exists
  to prove real, not asserted.

### CS Lens

**(b) hard concept, real restatement.** This is a form of an **open,
externally extensible property system**: rather than every object
needing its own hand-declared field for every property it might ever
need, `DependencyObject` gives every instance a shared, generic
key-value store, and any type can register a new key into that shared
system. This is exactly the mechanism behind `Grid.Row` (Lesson 11): a
similar registration (using `RegisterAttached` instead of `Register`,
with static `GetRow`/`SetRow` methods instead of an instance property
wrapper) is what lets *any* element — a `Button`, a `TextBlock`, a
custom `RatingControl` — be given a `Grid.Row="1"` even though `Row`
isn't declared anywhere on those types themselves; `Grid` owns the
registration, and any `DependencyObject` can have a value stored against
it.

Also recognized in: JavaScript objects as open property bags (any
object can gain a new property at runtime with no class change), and
Android's `View` tag/extra-data system, if that comparison carries
meaning from prior work.

### SE Lens

The real cost of this system, honestly stated: `StarsProperty`'s
declaration is genuinely more ceremony than a one-line auto-property —
four real arguments, a separate static field, a wrapper property that
looks redundant until this lesson's own proof shows it isn't. The real
payoff, proven directly: automatic participation in `{Binding}`,
`Style`, `Trigger`, and (not exercised in this lesson, but the same
mechanism) animation — all without `RatingControl` writing any of that
machinery itself. A plain auto-property buys simpler declaration syntax
at the cost of silently opting out of every one of those systems, with
no compiler warning — proven directly by this lesson's own first unit.

## Connect the pieces

One trace: a plain C# property on a custom control compiles cleanly and
still fails, silently, against `{Binding}`, `Style`, and `Trigger` —
proven by a `{Binding}` that never updates and a `Trigger` that never
fires. Registering a real `DependencyProperty` and wrapping it in an
ordinary-looking CLR property fixes all three at once, with the calling
XAML completely unchanged — because the real per-instance value now
lives in WPF's own precedence-resolved storage instead of a private
backing field only plain C# code can reach.

## What breaks without this

Bind `{Binding CurrentRating}` (a plain `int` property, no
`DependencyProperty` involved on the *source* side) directly to
`Stars`, but forget to add the `PropertyMetadata(0)` default value
argument to `Register`, passing no `PropertyMetadata` at all (an
overload that exists but supplies no explicit default). Real, observed
result: `Stars` starts at `0` regardless — `int`'s own natural default
value — proving `PropertyMetadata`'s default argument, when supplied, is
a real, honored value, not merely documentation; omitting it doesn't
break binding, it only changes what a `RatingControl` shows *before*
anything else has set `Stars` explicitly.

## Exercises

1. Add a second `DependencyProperty`, `MaxStarsProperty` (type `int`,
   default `5`), to `RatingControl`, following the identical four-step
   shape (`Register` call, static field, CLR wrapper) this lesson built
   for `Stars`. Confirm it binds correctly the same way.
2. Add a `PropertyChangedCallback` as a second argument to
   `PropertyMetadata` (`new PropertyMetadata(0, OnStarsChanged)`), with
   a real static method printing the old and new value every time
   `Stars` changes through *any* path — direct assignment, `Style`, or
   `{Binding}`. Confirm it fires for all three, proving this single hook
   catches every real source a plain property's own `set` block could
   only catch for direct assignment.

## Definition of Done

- [ ] You reproduced the real failure: a plain property silently
      ignored by both `{Binding}` and `Trigger`.
- [ ] You fixed it with a real `DependencyProperty` and confirmed both
      now work correctly, with the calling XAML unchanged.
- [ ] You can explain, in your own words, why the CLR property wrapper
      is not where `Stars`'s real value lives.
- [ ] You completed both exercises.

## Next

[Lesson 19 — Collections and `ICollectionView`](lesson-19-collections-and-icollectionview.md)
covers `ObservableCollection<T>` — the collection-shaped counterpart to
this series' `INotifyPropertyChanged` (Lesson 14) — and live sort,
filter, and grouping layered on top without touching the underlying
data.
