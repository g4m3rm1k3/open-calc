# Concept: `Style` and `Setter` — a Named Bundle of Property Values

**What you'll understand by the end:** what a `Style` actually is, how a
`Setter` inside it works, and why applying one is opt-in per element
rather than automatic.

**Prerequisites:** `wpf-layout-panels-and-controls.md` (assumes a `Button`
and a panel to hold it are already familiar).

## Setup

```
dotnet new wpf -o ConceptDemo
cd ConceptDemo
```
Open `MainWindow.xaml` and replace the generated `<Grid></Grid>` with the
example below.

## The Problem

Two buttons, styled by hand with the same two attribute values, are
correct today purely by accident — nothing stops the next button added
next to them from getting slightly different values, typed independently,
with no shared reference forcing them to agree. A real application needs
a way to define "what a button of this kind looks like" once, and have
every button of that kind actually derive from that one definition.

## The Isolated Example

```xml
<Grid>
    <Grid.Resources>
        <Style x:Key="RoundedButton" TargetType="Button">
            <Setter Property="Padding" Value="16,8" />
            <Setter Property="Background" Value="LightBlue" />
        </Style>
    </Grid.Resources>
    <StackPanel>
        <Button Content="First" Style="{StaticResource RoundedButton}" Margin="8" />
        <Button Content="Second" Style="{StaticResource RoundedButton}" Margin="8" />
        <Button Content="Unstyled" Margin="8" />
    </StackPanel>
</Grid>
```

```
dotnet build
```
**Real output:**
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Run it (`dotnet run`): "First" and "Second" show the same generous
padding and light-blue background; "Unstyled" keeps WPF's plain default
button look entirely untouched. Now change only the `Style`'s
`Value="16,8"` to `Value="24,12"` and rerun — both styled buttons grow
together, in one edit, while the unstyled one is completely unaffected.

**What this proves:** a `Style` is a named bundle of property-value
pairs (`Setter`s), applied to any element of the matching `TargetType`
that opts in via `Style="{StaticResource ...}"`. Changing the `Style`'s
own definition, once, changes every element referencing it — a guarantee
no number of independently-typed, per-element attributes can provide,
and applying a `Style` is never automatic just because one exists
somewhere in the file.

## Mechanical Walkthrough

- `<Grid.Resources>` — a property-element (XAML's syntax for a property
  value too complex for a plain attribute string) holding this `Grid`'s
  own resources — named values available to anything inside this
  `Grid`'s subtree, and nowhere outside it.
- `<Style x:Key="RoundedButton" TargetType="Button">` — `x:Key` is a
  required, unique name identifying this resource for lookup — distinct
  from `x:Name` (covered in `xaml-x-name-and-generated-fields.md`):
  `x:Name` generates a real C# field; `x:Key` only ever labels an entry
  in a resource lookup, with no code-behind field generated at all.
  `TargetType="Button"` restricts this `Style` to elements of exactly
  that type — a `Style` written for `Button` cannot be applied to a
  `TextBlock`.
- `<Setter Property="Padding" Value="16,8" />` — one property-value pair
  inside the `Style`. `Property` names which property to set (the plain
  property name, not a quoted string being parsed as arbitrary text);
  `Value` is what to set it to.
- `Style="{StaticResource RoundedButton}"` — applies the named `Style`
  to this specific `Button`. `{StaticResource ...}` is a **markup
  extension**: curly braces inside an attribute value tell the XAML
  parser "this isn't a literal string, resolve it as an expression" —
  here, "look up the resource named `RoundedButton`," detailed fully in
  `wpf-resourcedictionary-and-staticresource.md`.

## CS Lens

A `Style` is a form of **prototype-based configuration**: rather than
each element independently declaring its own full set of property
values, every styled element derives its appearance from one shared
definition, looked up by name at the moment the element is constructed.
Changing the shared definition changes every element that derives from
it, without touching any of them individually. Also recognized in:
CSS classes (`.btn { padding: ... }` applied via `class="btn"`), and
JavaScript's own prototype-based object model, where an object without
its own property falls back to its prototype's value.

## SE Lens

Accepting slightly different padding on different buttons looks like a
minor visual issue, not a bug — until a real application keeps adding
buttons over time, and each new one is a fresh, independent chance to
introduce a slightly different value, with nothing to catch the drift. A
`Style`, defined once, makes "every button of this kind looks the same"
a structural guarantee instead of a discipline every future addition has
to remember to uphold by hand. The cost is one extra level of indirection
(a name to look up) in exchange for that guarantee.

## Connection

Builds on `wpf-layout-panels-and-controls.md`'s `Button`. A `Style`
declared here (`Grid.Resources`) is only reachable from inside this
`Grid` — `wpf-resourcedictionary-and-staticresource.md` covers declaring
one at the application root instead, so every window in a real
multi-window application can reach it.

## Try It Yourself

1. Remove `TargetType="Button"` entirely and try applying
   `Style="{StaticResource RoundedButton}"` to a `TextBlock` instead of a
   `Button`. Read the real error WPF produces and connect it back to what
   `TargetType` actually restricts.
2. Add a third `Setter`, `Property="FontWeight" Value="Bold"`, to
   `RoundedButton` and confirm both styled buttons' text becomes bold
   with no other change.
3. Declare a second `Style` with the same `x:Key="RoundedButton"` inside
   the same `Grid.Resources` block. Predict, then verify, what WPF does —
   a compile error, a runtime error, or silently using one and ignoring
   the other.
