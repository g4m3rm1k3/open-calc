# Lesson 08: Resources and Styles

**What this covers:** `ResourceDictionary`, `Style`, `Setter`, `Trigger`,
and the real difference between `StaticResource` and `DynamicResource` —
how a WPF app keeps colors, fonts, and control appearance consistent and
DRY instead of repeated on every element.

**What you need to know first:** [Lesson 02](lesson-02-xaml-syntax-itself.md)
(property-element syntax, markup extensions).

## Resources — named values, looked up by key

```xml
<Window.Resources>
    <SolidColorBrush x:Key="AccentBrush" Color="#2D6CDF" />
    <system:Double x:Key="StandardFontSize" xmlns:system="clr-namespace:System;assembly=mscorlib">16</system:Double>
</Window.Resources>

<Button Background="{StaticResource AccentBrush}" FontSize="{StaticResource StandardFontSize}" />
```

`<Window.Resources>` — property-element syntax (Lesson 02) setting
`Window`'s `Resources` property, which holds a **`ResourceDictionary`** —
a real `Dictionary<object, object>`-shaped collection (the generic
dictionary type, same idea as Java/Kotlin's `Map`/`HashMap`), keyed by
`x:Key`. `x:Key="AccentBrush"` — the `x:` prefix from Lesson 02
(XAML-language-level, not a WPF property) names this entry so it can be
looked up later. `{StaticResource AccentBrush}` — the markup extension
(Lesson 02) that resolves to whatever object is stored under that key.

**Resources are scoped, the way a variable is scoped to its block.** A
resource declared on `Window.Resources` is visible to every element
inside that window. One declared on `Grid.Resources` is visible only to
that `Grid` and its children. `Application.Resources` (Lesson 01) is
visible to the *entire application*, every window — the right place for
anything meant to be truly global (a brand color, a base font size).
Lookup walks outward: an element asking for `{StaticResource X}` checks
its own resources first, then its parent's, then that parent's parent,
all the way up to `Application.Resources`, using the first match found —
the same lexical-scoping idea as a variable lookup walking outward
through nested function scopes in any language you already know.

## `ResourceDictionary` merging — sharing resources across files

```xml
<Application.Resources>
    <ResourceDictionary>
        <ResourceDictionary.MergedDictionaries>
            <ResourceDictionary Source="Themes/Colors.xaml" />
            <ResourceDictionary Source="Themes/Fonts.xaml" />
        </ResourceDictionary.MergedDictionaries>
    </ResourceDictionary>
</Application.Resources>
```

Splitting resources into separate `.xaml` files (no code-behind needed —
a `ResourceDictionary` file is markup only) and pulling them together via
`MergedDictionaries` is the standard way a real project keeps a "theme"
or "palette" organized instead of one enormous `App.xaml`. All keys from
every merged dictionary become available at whatever scope the merge
happened at, exactly as if they'd been declared inline.

## `Style` — a bundle of property values applied by type or by name

```xml
<Style x:Key="PrimaryButton" TargetType="Button">
    <Setter Property="Background" Value="{StaticResource AccentBrush}" />
    <Setter Property="Foreground" Value="White" />
    <Setter Property="Padding" Value="12,6" />
    <Setter Property="FontWeight" Value="Bold" />
</Style>

<Button Content="Save" Style="{StaticResource PrimaryButton}" />
```

`TargetType="Button"` — this `Style` only makes sense applied to `Button`
(or a subclass of it); WPF checks this. `<Setter Property="Background"
Value="..." />` — each `Setter` is one property assignment, the styled
equivalent of writing `Background="..."` directly on the element, bundled
so many elements can share the exact same set of property values by
referencing one `Style` instead of repeating every attribute. This is
literally DRY (Lesson 07's SE Lens named the same principle for logic;
here it's markup) — change one `Setter`'s `Value`, every `Button` using
`PrimaryButton` updates at once.

**A `Style` with no `x:Key`, applying to every matching element automatically:**

```xml
<Style TargetType="TextBox">
    <Setter Property="Padding" Value="4" />
    <Setter Property="BorderBrush" Value="Gray" />
</Style>
```

Dropping `x:Key` entirely makes this style **implicit** — it applies to
*every* `TextBox` in its scope automatically, with no `Style="{StaticResource
...}"` needed on any individual element. This is the real mechanism
behind "why do all my textboxes already look consistent" in a project
that never explicitly styled most of them one by one.

## `Trigger` — conditional styling, no code-behind required

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

A `Trigger` watches a real property on the styled element (`IsMouseOver`,
`IsEnabled`, `IsFocused` — all real properties every `Control` already
has) and swaps in different `Setter`s only while that condition is true,
reverting automatically the instant it becomes false — a hover effect or
a disabled-look, entirely declarative, no `MouseEnter`/`MouseLeave` event
handlers (Lesson 05) required. The second `Trigger` above is the real
mechanism behind Lesson 07's "the Add button visibly greys out when
`CanExecute` returns `false`" — `IsEnabled` becomes `false` automatically
when a bound `ICommand`'s `CanExecute` says no, and this kind of trigger
is what makes that state actually *look* different, not just technically
be unclickable.

## `StaticResource` vs. `DynamicResource` — resolved once, or resolved live

```xml
<Border Background="{StaticResource AccentBrush}" />   <!-- looked up once, at load -->
<Border Background="{DynamicResource AccentBrush}" />  <!-- re-resolved every time the resource changes -->
```

`StaticResource` looks the key up **once**, when the XAML is parsed, and
never checks again — cheaper, and the right default for anything that
genuinely never changes after the window loads. `DynamicResource` keeps
watching: if code later replaces what `AccentBrush` points to (swapping
in a whole new `ResourceDictionary` — the real mechanism behind runtime
theme/dark-mode switching), every element bound with `DynamicResource`
updates live; every element bound with `StaticResource` does **not** —
it's stuck showing whatever was resolved at load time. This is the one
concrete, provable reason to reach for `DynamicResource` specifically:
if a resource can change while the app is running and the UI needs to
reflect that change without a restart, `StaticResource` silently fails to
do it — not an error, just a UI that stops responding to a resource swap
that otherwise worked correctly in code.

## Mechanical walkthrough: `App.xaml` resources, real and complete

```xml
<Application.Resources>
    <SolidColorBrush x:Key="AccentBrush" Color="#2D6CDF" />
    <Style x:Key="PrimaryButton" TargetType="Button">
        <Setter Property="Background" Value="{StaticResource AccentBrush}" />
    </Style>
</Application.Resources>
```

- `<Application.Resources>` — global scope, visible to every window.
- `<SolidColorBrush x:Key="AccentBrush" ... />` — a real `Brush` object,
  keyed, reused by anything referencing `AccentBrush`.
- `<Style x:Key="PrimaryButton" ...>` referencing `{StaticResource
  AccentBrush}` **inside its own `Setter`** — resources can reference
  other resources, provided the referenced one is declared *earlier* in
  the same dictionary (XAML resource lookup within one file resolves
  top-to-bottom; a forward reference to a not-yet-declared key fails).

## SE Lens

The real alternative — repeating `Background="#2D6CDF"` as a literal hex
string on every `Button` across every window — works, until the brand
color needs to change: now it's a find-and-replace across every `.xaml`
file in the project, with real risk of missing one. One `Style`/resource,
referenced everywhere, turns that into a one-line change. The cost:
indirection — reading a XAML file with `Style="{StaticResource
PrimaryButton}"` doesn't show you what the button actually looks like
without also opening wherever that style is declared, unlike a plain
inline `Background="..."` that's fully self-contained at the point you're
reading it.

## What to check first in your assigned project

- Open `App.xaml` first — the global resource dictionary tells you the
  intended visual language (colors, base styles) before you read a
  single window.
- Repeated literal values (the same hex color, the same font size) typed
  on more than two or three elements is a real, demonstrable "make it
  better" candidate: factor it into a named resource once.
- Any `DynamicResource` in the project is a signal that something (a
  theme switch, likely) changes resources at runtime — worth finding
  where that swap happens before touching anything nearby.

## Next

[Lesson 09 — Templates and Converters](lesson-09-templates-and-converters.md)
covers changing not just *how* a control looks (this lesson) but *what
it's actually built out of* — `ControlTemplate`, `DataTemplate`, and
`IValueConverter`.
