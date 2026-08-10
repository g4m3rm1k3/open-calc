# Concept: Application-Wide Resources and `StaticResource` Lookup

**What you'll understand by the end:** where to put a resource meant for
the *whole application* rather than one screen, how `{StaticResource ...}`
actually resolves a reference, and what really happens when that
resolution fails.

**Prerequisites:** `wpf-styles-and-setters.md`.

## Setup

```
dotnet new wpf -o ConceptDemo
cd ConceptDemo
```
`dotnet new wpf` generates `App.xaml` with an already-present, empty
`<Application.Resources>` element — edit that directly, and
`MainWindow.xaml`, to match the example below.

## The Problem

A resource declared on one `Grid`'s own `Grid.Resources` (per
`wpf-styles-and-setters.md`) is only reachable from inside that `Grid`'s
subtree. A real application has more than one window, and needs some
resources — a brand color, a shared button style — reachable from *any*
of them, including windows that don't exist yet. Something has to hold
resources at a scope broader than any single screen.

## The Isolated Example

`App.xaml`:
```xml
<Application x:Class="ConceptDemo.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             StartupUri="MainWindow.xaml">
    <Application.Resources>
        <SolidColorBrush x:Key="BrandColorBrush" Color="#2E5945" />
        <Style x:Key="HeaderTitleStyle" TargetType="TextBlock">
            <Setter Property="FontSize" Value="24" />
            <Setter Property="FontWeight" Value="Bold" />
        </Style>
    </Application.Resources>
</Application>
```

`MainWindow.xaml`'s `Grid`:
```xml
<Grid>
    <StackPanel>
        <Border Background="{StaticResource BrandColorBrush}" Width="32" Height="32" Margin="8" />
        <TextBlock Text="Concept demo" Style="{StaticResource HeaderTitleStyle}" Margin="8" />
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

Run it: the `Border` renders in the declared brand color, and the
`TextBlock` renders large and bold — both resolved from `App.xaml`, a
completely different file than the one referencing them. Change
`BrandColorBrush`'s `Color` in `App.xaml` and rerun — the square updates,
with zero changes to `MainWindow.xaml`.

**What this proves:** a resource declared at the `Application` level, in
`App.xaml`, is reachable from any window in the application, resolved by
name (`x:Key`) alone — not by file path, not by any explicit import.

## Mechanical Walkthrough

- `<Application.Resources>` — a property-element on `Application` itself
  (present, empty, in every project `dotnet new wpf` scaffolds) holding
  resources available application-wide, the broadest scope WPF's
  resource system has.
- `<SolidColorBrush x:Key="BrandColorBrush" Color="#2E5945" />` — a real,
  named `Brush` object. A plain hex string set directly on a `Background`
  is silently converted into an equivalent, anonymous `SolidColorBrush`
  by XAML's own type conversion — giving one an explicit `x:Key` here is
  what makes that same brush *object* referenceable and reusable by
  name, rather than a fresh, equivalent-but-separate one being created
  at every place the color is used.
- `{StaticResource BrandColorBrush}` / `{StaticResource HeaderTitleStyle}`
  — each a **markup extension** that resolves once, at the moment the
  XAML loads: WPF checks the referencing element's own resources first,
  then its parent's, then *that* parent's, continuing outward until it
  reaches `Application` — the first matching `x:Key` found anywhere
  along that chain wins. "Static" specifically means this lookup happens
  once; if the resource's own value changed after this element already
  loaded, an already-resolved reference does not automatically pick up
  the change.

## CS Lens

The outward-searching lookup chain — check here, then the parent, then
the parent's parent, up to the root — is the same shape as **lexical
scoping** in a programming language: a variable reference resolves by
searching outward through enclosing scopes until a match is found,
stopping at the first one. An element deeply nested inside several
layers finding a resource declared all the way up at `Application` is
doing exactly what a nested function accessing a variable from an outer
scope does in any language with closures.

## SE Lens

Why does WPF search outward through a whole chain of scopes instead of
requiring every resource to live directly on `Application`, regardless
of how narrowly it's actually used? Because a resource meant for one
specific screen shouldn't have to pollute an application-wide namespace
and risk colliding with something else entirely unrelated. The lookup
chain lets each resource live at the narrowest scope that's actually
correct for it, while still letting genuinely global ones be found from
anywhere — the same principle that governs where a variable or constant
should be declared in any language: as narrowly as correctness allows,
no narrower.

`StaticResource` resolving once, at load time, instead of continuously
re-checking, is also a deliberate default: most resources — colors,
fonts, styles — are fixed for the life of the application, so
re-checking them constantly would be wasted work. `DynamicResource` (a
separate, related markup extension, covered where a real project first
needs a resource that changes at runtime — a live theme switch, for
instance) is the explicit, deliberate opt-in for that rarer case.

## Connection

Builds directly on `wpf-styles-and-setters.md` — the same `Style`
mechanism, now declared at a broader scope and resolved through a real
lookup chain instead of a single `Grid`'s own resources.

## Try It Yourself

1. Misspell the reference — change `{StaticResource BrandColorBrush}` to
   `{StaticResource BrndColorBrush}` — and run. WPF does not silently
   fall back to a default or leave the property unset: it throws a
   `XamlParseException` at startup, naming the resource key it couldn't
   resolve, and the window never opens at all. Restore the correct key
   and confirm it opens again.
2. Move `HeaderTitleStyle`'s declaration from `App.xaml` down into
   `MainWindow.xaml`'s own `<Window.Resources>` instead. Confirm it still
   resolves for a `TextBlock` inside that same window, then add a second
   window to the project and confirm the *same* reference now fails
   there — direct, hands-on proof of what "scope" actually restricts.
3. Add a second `Style`, `x:Key="BrandBorderStyle" TargetType="Border"`,
   with a `Setter Property="Width" Value="48"` and a second `Setter
   Property="Height" Value="48"`. Apply it to the `Border` alongside its
   existing `Background="{StaticResource BrandColorBrush}"` and confirm
   both a `Brush` resource and a `Style` resource resolve independently,
   on the same element, through the same lookup chain.
