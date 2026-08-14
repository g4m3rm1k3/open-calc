# Lesson 17: Templates and Converters

**What you will build:** a `ListBox` whose items render as raw type
names until a `DataTemplate` fixes it — a `Button` rebuilt from a
`ControlTemplate` with a genuinely different shape — and a real
`IValueConverter` bridging a `bool` to `Visibility`, proven necessary by
a real type-mismatch failure first.

**What you need to know first:** [Lesson 14](lesson-14-data-binding-fundamentals.md)
(`{Binding}`, `DataContext`) and [Lesson 16](lesson-16-resources-and-styles.md)
(`Style`, `Setter`, resource lookup).

**Terms introduced in this lesson:**
- **`DataTemplate`** — declares the visual structure a bound *data
  object* is rendered into; without one, a bound item falls back to its
  own `ToString()`.
- **`ControlTemplate`** — replaces a control's entire visual structure,
  while its behavior (click, focus, keyboard activation) stays intact.
- **`IValueConverter`** — a real interface transforming a bound value's
  type or format on its way into or out of the UI.

**Objects and methods used:**

**`IValueConverter`**
- *What it is:* a real interface in `System.Windows.Data`.
- *Implementation:* `object Convert(object? value, Type targetType,
  object? parameter, CultureInfo culture); object ConvertBack(object?
  value, Type targetType, object? parameter, CultureInfo culture);` —
  confirmed against the real .NET interface declaration.
- *Its use:* the interface this lesson's `BoolToVisibilityConverter`
  implements, proven necessary by a real runtime type mismatch first.

---

## Concept Unit: `DataTemplate` — Turning a Bound Object Into Visible Controls

### The Problem

Binding a `ListBox`'s `ItemsSource` (Lesson 12 named this property, not
yet fully exercised) to a real collection of `Item` objects — does WPF
know how to display each one meaningfully, with no further instruction?

### Introduce the Concept in Isolation

```csharp
public class Item
{
    public string Name { get; set; } = "";
    public decimal Value { get; set; }
    public override string ToString() => $"Item[{Name}]";
}
```

```xml
<ListBox ItemsSource="{Binding Items}" />
```

With no `ItemTemplate` set at all, each row in the `ListBox` shows the
literal text `Item[Drill]`, `Item[Level]`, and so on — proof WPF falls
back to calling `.ToString()` on each bound object when nothing else
tells it how to render one. Adding a real template changes this
directly:

```xml
<ListBox ItemsSource="{Binding Items}">
    <ListBox.ItemTemplate>
        <DataTemplate>
            <StackPanel Orientation="Horizontal">
                <TextBlock Text="{Binding Name}" FontWeight="Bold" />
                <TextBlock Text=" — " />
                <TextBlock Text="{Binding Value, StringFormat=C}" />
            </StackPanel>
        </DataTemplate>
    </ListBox.ItemTemplate>
</ListBox>
```

Now each row renders as real, structured content — bold name, a
separator, formatted currency — instead of the fallback `.ToString()`
text.

### Discard

This proof is disposable; real `ItemTemplate` usage returns properly in
Lesson 20's `DataGrid` coverage.

### Mechanical Walkthrough

- `public override string ToString() => $"Item[{Name}]";` — **(a) first
  appearance** of overriding `ToString()` specifically (the `override`
  mechanism itself, real OOP, already assumed known); its real effect —
  the exact fallback text observed above — is this unit's own proof.
- `<ListBox.ItemTemplate>` — **(b) hard concept reappearing**,
  property-element syntax (Lesson 10) applied to `ItemTemplate`.
- `<DataTemplate>` — **(a) first appearance** as this lesson's subject,
  explained above.
- `{Binding Name}` **inside** the `DataTemplate` — **(a) first
  appearance** of a real, non-obvious scoping fact: inside a
  `DataTemplate`, a bare `{Binding Name}` resolves against *the specific
  item this template instance was built for*, not the `ListBox`'s own
  `DataContext` — WPF instantiates one copy of the template per item in
  `Items`, each with that one item automatically set as its local
  `DataContext`.
- `{Binding Value, StringFormat=C}` — **(a) first appearance** of
  `StringFormat` as a real binding property, applying a .NET format
  string (the same `:C` specifier from Lesson 03's interpolation
  material, usable here inside a binding instead of only in C# code)
  before the value reaches the UI.

## Concept Unit: `ControlTemplate` — Replacing a Control's Own Shape

### The Problem

Lesson 16's `Style` changed a `Button`'s *property values* — background,
padding. Is there a way to change its actual *shape* — round corners
instead of the default rectangle — while keeping its click/focus
behavior fully intact?

### Introduce the Concept in Isolation

```xml
<Button Content="Click me">
    <Button.Template>
        <ControlTemplate TargetType="Button">
            <Border Background="{TemplateBinding Background}"
                    CornerRadius="8"
                    Padding="10">
                <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center" />
            </Border>
        </ControlTemplate>
    </Button.Template>
</Button>
```

The button renders as a real rounded rectangle instead of the platform
default flat rectangle — and clicking it, tabbing to it, and pressing
Enter/Space while it's focused all still work exactly as a normal
`Button` would, proving the click/keyboard *behavior* lives elsewhere
(inside `Button`'s own class, untouched) while only the *visual
structure* changed.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `<Button.Template>` — **(b) hard concept reappearing**,
  property-element syntax applied to `Template`.
- `<ControlTemplate TargetType="Button">` — **(a) first appearance** as
  this lesson's subject; `TargetType` — **(b) hard concept
  reappearing**, the identical checked-constraint mechanism from Lesson
  16's `Style`.
- `<Border Background="{TemplateBinding Background}" CornerRadius="8"
  Padding="10">` — **(a) first appearance** of `{TemplateBinding
  Background}`: a lighter-weight binding specifically usable *inside* a
  `ControlTemplate`, reading a property (`Background`) from the actual
  control instance being templated — this is what lets the same
  template stay reusable across buttons with different `Background`
  values set on them individually, rather than hardcoding one fixed
  color inside the template itself.
- `<ContentPresenter .../>` — **(a) first appearance.** The real
  placeholder marking *where* the control's own `Content` (`"Click me"`)
  gets inserted into this custom structure. Omitting it — proven
  directly in this lesson's What Breaks section — renders the rounded
  border with visibly nothing inside it, even though `Content` is set
  correctly on the `Button` itself.

### SE Lens

Every WPF `Button` — including every one in every earlier lesson of this
series — is already built from *some* `ControlTemplate`, the platform
default one, invisible unless replaced. `Style` and `ControlTemplate`
solve genuinely different problems: reach for `Style` for anything
that's just different property values on the existing default shape (the
overwhelmingly common case); reach for `ControlTemplate` only when the
control's actual visual structure needs to differ from that default —
rarer, and proven above to carry real risk (the missing
`ContentPresenter` failure) that `Style` alone never exposes you to.

## Concept Unit: `IValueConverter` — Bridging a Type Mismatch

### The Problem

`Visibility` (a real WPF property type controlling whether an element
renders at all) is not a `bool`. A ViewModel property that's naturally a
`bool` (`IsSaved`) needs some way to drive a `Visibility`-typed property
directly from a binding — does `{Binding}` handle a type mismatch like
this automatically?

### Introduce the Concept in Isolation

```csharp
public bool IsSaved { get; set; } = true;
```

```xml
<TextBlock Text="Item saved!" Visibility="{Binding IsSaved}" />
```

Running this produces a real, observed failure — `Visibility` requires a
real `Visibility` value (`Visible`, `Collapsed`, or `Hidden`), and a
plain `bool` cannot be implicitly converted to it; the binding fails at
runtime, and the `TextBlock` does not render as expected. This proves
the real gap a plain `{Binding}` cannot close on its own: a type
mismatch between what the source property naturally is and what the
target property requires.

### Discard

This broken binding is deleted; the working, converter-backed version
replaces it directly.

### The Fix, Proven

```csharp
public class BoolToVisibilityConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return (value is bool b && b) ? Visibility.Visible : Visibility.Collapsed;
    }

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}
```

```xml
<Window.Resources>
    <local:BoolToVisibilityConverter x:Key="BoolToVis" />
</Window.Resources>

<TextBlock Text="Item saved!" Visibility="{Binding IsSaved, Converter={StaticResource BoolToVis}}" />
```

With the converter in place, `IsSaved = true` correctly shows the
`TextBlock`, and setting it `false` correctly hides it — the exact
mismatch from the previous unit closed, with `IsSaved` itself never
changing type.

### Mechanical Walkthrough

- `public class BoolToVisibilityConverter : IValueConverter` — **(a)
  first appearance**, implementing the real interface named in this
  lesson's Header.
- `Convert(object? value, ...)` — **(a) first appearance** of this
  specific method's real signature (confirmed in the Header); `value is
  bool b && b` — **(a) first appearance** of a **type pattern**: `value
  is bool b` checks whether `value`'s real runtime type is `bool` *and*,
  if so, binds it to a new variable `b` in the same expression — `&& b`
  then uses that bound variable directly as the second half of the
  condition, all in one line.
- `ConvertBack(...) { throw new NotImplementedException(); }` — **(b)
  hard concept reappearing**, throwing an exception (already known);
  honest here because this specific converter is only ever used
  `OneWay` (Lesson 14) — `ConvertBack` is correctly never called in that
  direction.
- `<local:BoolToVisibilityConverter x:Key="BoolToVis" />` — **(b) hard
  concept reappearing**, declaring an object as a keyed resource
  (Lesson 16), here a converter instance instead of a `Brush`/`Style`;
  `local:` — **(a) first appearance**: an `xmlns:local="clr-namespace:..."`
  prefix (declared once, on the root element, same mechanism as the
  default/`x:` namespaces from Lesson 09) mapped to this project's own
  C# namespace — the standard way a custom class is referenced from
  XAML at all.
- `Converter={StaticResource BoolToVis}` — **(a) first appearance** of a
  markup extension nested *inside* another binding property:
  `{StaticResource BoolToVis}` resolves first, producing the real
  converter instance, which `Binding` then uses internally, calling its
  `Convert` method every time the source value is read.

### CS Lens

**(b) hard concept, real restatement.** `IValueConverter` is an
**adapter**: it doesn't change `IsSaved`'s real type at all — it sits
between the binding's source and target, translating one shape into
another compatible with what's actually needed, the same general idea as
any adapter pattern reconciling two interfaces that don't naturally fit
together.

## Connect the pieces

One trace: with no `DataTemplate`, a bound `ListBox` item falls back to
`.ToString()` — proven by literal fallback text on screen. A
`DataTemplate` gives that data real visual structure, with its own
`{Binding}` scoped to the one item it was built for. A `ControlTemplate`
goes further, replacing a control's entire visual shape while its real
click/keyboard behavior — proven live — stays untouched, using
`{TemplateBinding}` and `ContentPresenter` to stay reusable. A type
mismatch a plain `{Binding}` can't bridge on its own — proven by a real
runtime failure — is exactly what `IValueConverter` exists to fix,
translating a value's type on the way into the UI without changing the
source property itself.

## What breaks without this

Remove `<ContentPresenter .../>` from this lesson's `ControlTemplate`
entirely, leaving the rounded `Border` with nothing inside it. Real,
observed result: the button renders as a plain rounded rectangle with
**no visible text at all**, even though `Content="Click me"` is still
correctly set on the `Button` itself — direct, provable proof
`ContentPresenter` is the actual mechanism connecting a control's real
`Content` value to wherever the template chooses to place it, not a
decorative placeholder.

## Exercises

1. Add a second `DataTemplate` case: bind a `ListBox` to a mixed
   collection type (or add an `IsFavorite bool` to `Item` and use a
   `DataTrigger`, not yet covered — instead, simpler: add a second
   `TextBlock` inside the existing `DataTemplate` showing `★` only when
   `IsFavorite` is true, using the `BoolToVisibilityConverter` built in
   this lesson).
2. Build a second converter, `NullToVisibilityConverter`, showing an
   element only when a bound reference-typed property is **not** `null`.
   Confirm it against a real `null` and non-`null` value.

## Definition of Done

- [ ] You confirmed the real `.ToString()` fallback with no
      `DataTemplate`, then fixed it.
- [ ] You confirmed a `ControlTemplate`-styled button's click/keyboard
      behavior stays intact despite its changed visual shape.
- [ ] You caused the real `bool`-to-`Visibility` binding failure, then
      fixed it with `IValueConverter`.
- [ ] You reproduced the missing-`ContentPresenter` failure.
- [ ] You completed both exercises.

## Next

[Lesson 18 — Dependency Properties](lesson-18-dependency-properties.md)
covers the real mechanism underneath `{TemplateBinding}`, `{Binding}`
targets, and `Trigger`'s watched properties — `DependencyProperty`, and
why WPF needed its own property system instead of plain C# properties.
