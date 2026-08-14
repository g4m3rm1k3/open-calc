# Lesson 16: Resources and Styles

**What you will build:** a real `ResourceDictionary` entry looked up by
key, proven scoped to where it's declared — then a `Style` bundling
several property values into one reusable reference, and a `Trigger`
changing that bundle live based on a real, observed mouse-over state.

**What you need to know first:** [Lesson 10](lesson-10-xaml-property-elements-and-markup-extensions.md)
(markup extensions — `{StaticResource}` is one) and
[Lesson 15](lesson-15-commands-and-mvvm.md) (`IsEnabled`, whose visible
*look* this lesson's `Trigger` unit connects to).

**Terms introduced in this lesson:**
- **`ResourceDictionary`** — a real, `Dictionary<object, object>`-shaped
  collection holding keyed, reusable objects, scoped to whatever element
  declares it.
- **`Style`** — a named bundle of property `Setter`s, applied to an
  element by reference instead of repeating each property inline.
- **`Trigger`** — a conditional rule inside a `Style` swapping in
  different `Setter`s while a real property (`IsMouseOver`, `IsEnabled`)
  holds a given value.

**Objects and methods used:** none beyond real WPF resource/style
infrastructure, each given full treatment as this lesson's own subject.

---

## Concept Unit: `ResourceDictionary` — Keyed, Scoped Lookup

### The Problem

Lesson 10 proved `{StaticResource AccentBrush}` resolves a key to a real
object — using a resource declared directly on the same `Window` as the
element using it. Whether that lookup is scoped only to the exact
element declaring it, or visible more broadly, needs to be proven rather
than assumed.

### Introduce the Concept in Isolation

```xml
<Grid>
    <Grid.Resources>
        <SolidColorBrush x:Key="LocalBrush" Color="Green" />
    </Grid.Resources>

    <StackPanel>
        <Border Background="{StaticResource LocalBrush}" Height="20" />
    </StackPanel>
</Grid>
```

This resolves correctly — the `Border`, nested two levels inside the
`Grid` (inside a `StackPanel`), still finds `LocalBrush`. Moving the
`Border` **outside** the `Grid` entirely, as a sibling rather than a
descendant, and leaving `{StaticResource LocalBrush}` unchanged, causes a
real, observed `XamlParseException` at startup: the key can no longer be
found. This proves the real scoping rule: a resource declared via
`Grid.Resources` is visible to that `Grid` and *everything nested inside
it*, no matter how deep, but not to anything outside that subtree.

### Discard

This `LocalBrush` proof is disposable.

### Mechanical Walkthrough

- `<Grid.Resources>` — **(a) first appearance** of property-element
  syntax (Lesson 10) applied specifically to a `Resources` property —
  every `FrameworkElement` has one; `Window.Resources` (used in earlier
  lessons without full scoping explanation) is the identical mechanism,
  just declared on `Window` instead of `Grid`.
- `<SolidColorBrush x:Key="LocalBrush" Color="Green" />` — **(b) hard
  concept reappearing**, `x:Key` from Lesson 10.
- `{StaticResource LocalBrush}` — **(b) hard concept reappearing**, the
  markup extension itself from Lesson 10; its real *scoping* behavior —
  proven by the moved-`Border` failure — is this unit's own new
  contribution.

### SE Lens

The real reason scoping works this way, rather than every resource being
globally visible regardless of where it's declared: a resource meant for
one specific screen (a `Window.Resources` entry) shouldn't leak into or
collide with an unrelated screen's own same-named key elsewhere in a
large app. Lexical scoping — the same "look here first, then walk
outward through ancestors" rule a nested function's variable lookup
already follows in any language — gives predictable resolution without
requiring every resource key to be globally unique across an entire
application. `Application.Resources` (the outermost possible scope,
already touched briefly in Lesson 09's `App.xaml`) is the deliberate
exception: declared there specifically to be visible everywhere, for
resources that genuinely are that global (a base brand color, say).

## Concept Unit: `Style` — Bundling Property Values by Reference

### The Problem

Lesson 15's `Button`s each set their own properties individually.
Keeping ten buttons visually consistent — same background, same padding,
same font weight — by repeating identical attribute values on every one
is real, error-prone duplication the moment one needs to change.

### Introduce the Concept in Isolation

```xml
<Window.Resources>
    <Style x:Key="PrimaryButton" TargetType="Button">
        <Setter Property="Background" Value="LightBlue" />
        <Setter Property="Padding" Value="12,6" />
        <Setter Property="FontWeight" Value="Bold" />
    </Style>
</Window.Resources>

<StackPanel>
    <Button Content="Save" Style="{StaticResource PrimaryButton}" />
    <Button Content="Submit" Style="{StaticResource PrimaryButton}" />
</StackPanel>
```

Both buttons render identically styled — light blue background, bold
text, consistent padding — with **zero** repeated property values on
either `Button` element itself. Changing `Value="LightBlue"` to
`Value="LightGreen"` in the one `Setter`, with no other edit anywhere,
changes **both** buttons at once — real, direct proof this is DRY
(Lesson 07's SE Lens named the same principle for logic; here it's
markup) applied to visual appearance.

### Discard

This proof is disposable; a fresh, `Trigger`-bearing `Style` replaces it
next.

### Mechanical Walkthrough

- `<Style x:Key="PrimaryButton" TargetType="Button">` — **(a) first
  appearance.** `x:Key` — **(b) hard concept reappearing**, same lookup
  mechanism as a `Brush`; `TargetType="Button"` — **(a) first
  appearance**: declares which element type this `Style` is meant for,
  checked by WPF — applying it to an incompatible control type is a real
  error, proven in this lesson's What Breaks section.
- `<Setter Property="Background" Value="LightBlue" />` — **(a) first
  appearance.** One property assignment, bundled inside the `Style`
  rather than written inline — functionally identical to writing
  `Background="LightBlue"` directly on the element, just centralized.
- `Style="{StaticResource PrimaryButton}"` — **(b) hard concept
  reappearing**, the markup-extension lookup mechanism, now resolving to
  a real `Style` object instead of a `Brush`.

### CS Lens

Not a hard CS concept in the design-pattern sense — this is the same DRY
principle already named for logic, reapplied to markup: one declared
source of truth (`PrimaryButton`), referenced by every consumer, instead
of the same values copy-pasted across every element that needs them.

## Concept Unit: `Trigger` — Conditional Styling, No Code-Behind

### The Problem

A hover effect — visibly darker while the mouse is over a button — could
be built with `MouseEnter`/`MouseLeave` event handlers (Lesson 13),
manually swapping `Background` in code. Is there a way to express this
declaratively, entirely inside the `Style` itself?

### Introduce the Concept in Isolation

```xml
<Style TargetType="Button">
    <Setter Property="Background" Value="LightGray" />
    <Style.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter Property="Background" Value="DarkGray" />
        </Trigger>
        <Trigger Property="IsEnabled" Value="False">
            <Setter Property="Opacity" Value="0.5" />
        </Trigger>
    </Style.Triggers>
</Style>
```

Running this against a real `Button` and moving the mouse over it, then
away, shows the background genuinely changing to `DarkGray` and back to
`LightGray` automatically — with **zero** `MouseEnter`/`MouseLeave`
handler written anywhere. Disabling the button (`IsEnabled="False"`, from
Lesson 15's own `CanExecute` mechanism) shows it visibly fading to 50%
opacity, also with zero code — real, direct connection to Lesson 15's
own proof that a `Command`-bound button disables itself: this `Trigger`
is the mechanism giving that disabled state its actual visible look, not
merely its unclickable behavior.

### Discard

This proof is disposable; this exact `Trigger`-bearing shape is common,
reusable practice for the rest of this series, not a one-off.

### Mechanical Walkthrough

- `<Style.Triggers>` — **(a) first appearance** of property-element
  syntax applied to `Style`'s own `Triggers` collection — the same
  syntax mechanism as `Grid.Resources`, `Grid.RowDefinitions`, applied
  again to a different property.
- `<Trigger Property="IsMouseOver" Value="True">` — **(a) first
  appearance.** `Property`/`Value` here name a real condition to watch —
  `IsMouseOver`, a real property every `Control` already has (not
  something this project declares) — and *only while* it equals `True`
  does the nested `Setter` apply, reverting automatically the instant
  the condition becomes false again.
- `<Trigger Property="IsEnabled" Value="False">` — **(b) hard concept
  reappearing**, the identical `Trigger` mechanism, watching a different
  real property — direct proof `Trigger` isn't special-cased to
  `IsMouseOver`; any real bindable/dependency property (full mechanism:
  next lesson) can be watched this way.

### SE Lens

The real alternative — `MouseEnter`/`MouseLeave` handlers manually
toggling `Background` in code-behind — genuinely works, at a real cost:
that logic lives separately from the `Style` declaring every other
visual aspect of the button, and it has to correctly *revert* the change
on `MouseLeave` by hand, a real, easy-to-forget symmetric pair. A
`Trigger` expresses both directions — apply while true, revert when
false — as one declarative rule, with WPF itself guaranteeing the
symmetry.

## Connect the pieces

One trace: a `ResourceDictionary` (`Window.Resources`, `Grid.Resources`)
holds keyed objects, scoped to the declaring element and everything
nested inside it — proven by a moved element losing access. A `Style`
bundles several `Setter`s under one key, referenced by any number of
elements — proven by one `Setter` edit changing every consumer at once.
A `Trigger` inside a `Style` swaps in different `Setter`s while a real
property holds a given value, reverting automatically — proven live
against both `IsMouseOver` and `IsEnabled`, the latter directly
connecting back to Lesson 15's own `CanExecute`-driven disable behavior.

## What breaks without this

Apply a `Style` whose `TargetType="Button"` to a `TextBox` instead,
mismatching the declared type:

```xml
<TextBox Style="{StaticResource PrimaryButton}" />
```

Real, observed result at startup: a `XamlParseException`, naming that
`PrimaryButton`'s `TargetType` doesn't match the element it was applied
to — direct, provable evidence `TargetType` is a real, checked
constraint, not documentation-only advice.

## Exercises

1. Remove `x:Key` from a `Style` with `TargetType="TextBox"` entirely
   (an **implicit** style). Confirm every `TextBox` in that style's
   scope picks it up automatically, with no `Style="{StaticResource
   ...}"` on any of them.
2. Add a second `Trigger`, watching `IsFocused="True"`, that changes
   `BorderBrush` on a `TextBox`. Click into and out of the field and
   confirm the real, live border-color change.

## Definition of Done

- [ ] You reproduced the resource-scoping failure by moving a consumer
      outside its resource's declaring element.
- [ ] You confirmed one `Setter` edit changes every `Style` consumer at
      once.
- [ ] You confirmed a `Trigger` changes appearance live, with zero
      event-handler code, for both `IsMouseOver` and `IsEnabled`.
- [ ] You caused the real `TargetType` mismatch failure.
- [ ] You completed both exercises.

## Next

[Lesson 17 — Templates and Converters](lesson-17-templates-and-converters.md)
covers changing not just a control's property values (this lesson) but
what it's actually built from, and transforming a bound value's type on
its way into the UI.
