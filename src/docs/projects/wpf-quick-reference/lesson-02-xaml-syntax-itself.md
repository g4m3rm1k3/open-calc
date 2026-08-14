# Lesson 02: XAML Syntax Itself

**What this covers:** what every piece of a `.xaml` file actually means —
an element is a real class, an attribute is a real property, `xmlns` is
namespace resolution, and `{Binding ...}`/`{StaticResource ...}` are a
distinct, third syntax worth recognizing on sight. Once this lesson is
done, no XAML file looks like unfamiliar markup — it looks like C# object
construction wearing an XML costume.

**What you need to know first:** [Lesson 01](lesson-01-anatomy-of-a-wpf-project.md).

## An element is a class; nesting is object construction

```xml
<StackPanel>
    <TextBlock Text="Hello" />
    <Button Content="Click me" />
</StackPanel>
```

This is not a special UI description language distinct from C# — it's a
declarative way of writing this, with `InitializeComponent()` doing
exactly this on your behalf:

```csharp
var stackPanel = new StackPanel();
var textBlock = new TextBlock { Text = "Hello" };
var button = new Button { Content = "Click me" };
stackPanel.Children.Add(textBlock);
stackPanel.Children.Add(button);
```

`<StackPanel>` is a real class (`System.Windows.Controls.StackPanel`).
Writing `<TextBlock />` nested inside it constructs a `TextBlock` and adds
it to `StackPanel`'s `Children` collection — nesting in the markup *is*
the parent/child object relationship, not a visual convention layered on
top of something else. Every WPF element you'll ever see in a `.xaml`
file resolves to a real class you could `Ctrl+click` into if it were
written in C# instead.

## Attribute syntax — the common case, and its limit

```xml
<TextBlock Text="Hello, WPF" FontSize="24" HorizontalAlignment="Center" />
```

`Text="Hello, WPF"` sets the real `Text` property on the constructed
`TextBlock` — same idea as an HTML tag's attributes, new only in that
these specific names correspond to real C# properties on the `TextBlock`
class, settable in code too (`myTextBlock.Text = "Hello, WPF";`). XAML
attributes and C# property assignment are two syntaxes for the identical
operation.

**The limit:** an XML attribute value is always a plain string. Setting a
property to something that *isn't* a simple string — a `Brush` with
multiple stops, a `DataTemplate`, another whole element — can't fit in
`Property="..."`. XAML's answer is **property-element syntax**:

```xml
<Button Content="Click me" />

<Button>
    <Button.Content>
        <StackPanel Orientation="Horizontal">
            <TextBlock Text="⭐" />
            <TextBlock Text="Click me" />
        </StackPanel>
    </Button.Content>
</Button>
```

`<Button.Content>` — a **property element**: `TypeName.PropertyName` as
its own tag, opened and closed, with the actual value nested inside as
real child markup instead of a quoted string. Both `Button`s above set
the same `Content` property; the first uses attribute syntax because a
plain string fits; the second uses property-element syntax because the
real value is a whole `StackPanel` with two `TextBlock`s inside it, which
cannot be written as `Content="..."`. Recognize `<X.Y>` on sight as "this
is setting property `Y` on the enclosing `X`," not a new kind of element.

## `xmlns` — resolving which vocabulary a tag name comes from

```xml
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
```

Two different namespace declarations, doing two different jobs:

- **The default namespace** (`xmlns="..."`, no prefix) — every unprefixed
  element name in this file (`Window`, `Grid`, `TextBlock`, `Button`) is
  looked up against this vocabulary: WPF's own presentation framework
  classes. This is *not* a URL that gets fetched over the network — it's
  a unique string identifying which set of class names is in play, the
  same reason two unrelated libraries can each have a class named
  `Border` without colliding, as long as each lives in its own namespace.
- **`xmlns:x="..."`** — a *second*, separately prefixed namespace,
  specifically for XAML's own language-level attributes, not WPF's UI
  classes. `x:Class` (Lesson 01), `x:Name` (below), `x:Key` (Lesson 08)
  all use this prefix because they're instructions to the XAML compiler
  itself, distinct from properties on the UI object being built.

A generated file also carries `xmlns:d="..."` (design-time-only values a
visual designer reads, never compiled into the running app) and
`mc:Ignorable="d"` (tells any tool that doesn't understand `d:` it's safe
to skip) — real, but not load-bearing for anything this reference covers.

## `x:Name` — naming an element so C# code can reach it

```xml
<TextBlock x:Name="StatusText" Text="Ready" />
```

```csharp
StatusText.Text = "Saving...";
```

`x:Name="StatusText"` does two things: it's a compiler instruction (`x:`
prefix, XAML-language-level, same family as `x:Class`) that generates a
real, strongly-typed field named `StatusText` inside the invisible
generated `partial class` piece from Lesson 01 — which is *why*
`StatusText.Text = ...` compiles in your code-behind with no `FindName`
call or cast required, unlike Android's `findViewById` if you've seen
that pattern. Only elements you'll actually reference from C# need an
`x:Name` — most elements in a real layout have none.

## Markup extensions — `{Binding}` and `{StaticResource}` are their own syntax

```xml
<TextBlock Text="{Binding ItemName}" />
<Border Background="{StaticResource AccentBrush}" />
```

Curly braces in an attribute value are a **third** distinct syntax,
neither a plain string nor property-element XML — a **markup extension**:
a shorthand that expands into a real object at parse time, evaluated
before the property is actually set. `{Binding ItemName}` doesn't set
`Text` to the literal string `"ItemName"` — it constructs a real
`Binding` object pointing at a property named `ItemName` on whatever this
element's `DataContext` turns out to be, and *that* object is what gets
attached to `Text` (full treatment: [Lesson 06](lesson-06-data-binding-fundamentals.md)).
`{StaticResource AccentBrush}` similarly looks up a resource named
`AccentBrush` declared elsewhere and substitutes the real object
(full treatment: [Lesson 08](lesson-08-resources-and-styles.md)). The
tell that you're looking at a markup extension rather than a plain
string: `{` immediately after the `="`.

## Comments — not the same as C#'s

```xml
<!-- This is a XAML comment -->
<TextBlock Text="Hello" /> <!-- inline works too -->
```

XML/XAML comments use `<!-- -->`, not C#'s `//` or `/* */` — an easy slip
if you're switching between a `.xaml` file and its `.xaml.cs` pair in the
same sitting, since `//` inside a `.xaml` file is not a comment at all,
just invalid content.

## Mechanical walkthrough, one real element, everything named

```xml
<Button x:Name="SaveButton"
        Content="Save"
        Width="100"
        Click="SaveButton_Click"
        Background="{StaticResource AccentBrush}" />
```

- `<Button ... />` — constructs a real `Button` object; self-closing
  because it has no children here.
- `x:Name="SaveButton"` — generates a real field, reachable from
  code-behind as `SaveButton`.
- `Content="Save"` — attribute syntax, sets the real `Content` property
  to the plain string `"Save"`.
- `Width="100"` — attribute syntax, a numeric property parsed from the
  string `"100"`.
- `Click="SaveButton_Click"` — attribute syntax, but the value names a
  **method**, not a property value — wiring this button's `Click` event
  (the exact `event`/delegate mechanism from Lesson 00b) to a method of
  that name expected in the code-behind. Full treatment:
  [Lesson 05](lesson-05-events-and-routed-events.md).
- `Background="{StaticResource AccentBrush}"` — a markup extension, not a
  plain string; resolves to a real `Brush` object looked up by resource
  key.

Four different value syntaxes on one element, all real and all common:
a plain string, a numeric string, an event-handler method name, and a
markup extension. Telling them apart on sight is the actual skill this
lesson exists to build.

## What to check first in your assigned project

- Any attribute value starting with `{` — that's a markup extension, not
  literal text; go find what it resolves to (a resource, a binding path)
  rather than reading it as a string.
- Any `TypeName.PropertyName` tag (`<Button.Content>`,
  `<Grid.RowDefinitions>`) — that's property-element syntax setting one
  property on its enclosing element, not a new UI element in its own
  right.
- Every `x:Name` in the XAML should have a matching, real use in the
  paired `.xaml.cs` file — if it doesn't, that's dead naming, safe to
  leave but worth noticing.

## Next

[Lesson 03 — Layout Panels](lesson-03-layout-panels.md) covers the actual
containers (`Grid`, `StackPanel`, and others) that decide where each
child element ends up on screen.
