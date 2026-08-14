# Lesson 09: Templates and Converters

**What this covers:** `DataTemplate` (how a bound object turns into
visible controls), `ControlTemplate` (how a control's own visual parts
are built), and `IValueConverter` (transforming a bound value on its way
into or out of the UI). Three distinct mechanisms, easy to blur together
— this lesson draws the line between them.

**What you need to know first:** [Lesson 06](lesson-06-data-binding-fundamentals.md)
and [Lesson 08](lesson-08-resources-and-styles.md).

## `DataTemplate` — how one bound object becomes visible controls

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

Without an explicit `ItemTemplate`, a `ListBox` bound to `Items` (a
collection of `Item` objects, Lesson 06) falls back to calling
`.ToString()` on each one — which is why an un-templated bound list often
shows the class's full type name instead of anything useful. A
`DataTemplate` fixes that by declaring exactly what visual structure each
item gets: here, one row is a `StackPanel` containing three `TextBlock`s,
each bound (`{Binding Name}`, `{Binding Value, ...}`) — and crucially,
**inside a `DataTemplate`, `{Binding}` with no source specified means
"bind to this specific item," not the `ListBox`'s own `DataContext`.**
The template is instantiated once per item in `Items`, each copy getting
that one item as its own local `DataContext` automatically — this is the
real mechanism, not a coincidence of naming.

`{Binding Value, StringFormat=C}` — first appearance: `StringFormat`
applies a .NET format string to the bound value before display, `C`
meaning currency (the same format specifier from Lesson 00's string
interpolation section, usable directly inside a binding instead of only
in C# code).

## `ControlTemplate` — replacing what a control is actually built from

A `Style` (Lesson 08) changes a control's *property values*
(`Background`, `FontSize`). A `ControlTemplate` replaces the control's
entire *visual structure* — what shapes and elements it's actually
rendered from underneath:

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

Every `Button` in WPF is, underneath, built from *some* `ControlTemplate`
— the default one (rounded/flat rectangle, platform-styled) is itself
just a `ControlTemplate` you never see unless you go looking. Replacing
it entirely — here, with a `Border` that has rounded corners — changes
the button's actual shape, not just its colors, while `Button` still
behaves exactly like a button (click, focus, keyboard activation all
keep working, because none of that logic lives in the template).

- `{TemplateBinding Background}` — first appearance: a lighter-weight
  binding specifically for use *inside* a `ControlTemplate`, reading a
  property (`Background`) from the control being templated (the `Button`
  itself, wherever `Background="..."` was set on it) into the template's
  own elements — this is how the template stays reusable across buttons
  with different `Background` values instead of hardcoding one color.
- `<ContentPresenter />` — first appearance: the real placeholder marking
  *where* the control's actual `Content` (`"Click me"`, Lesson 04) gets
  inserted into this custom visual structure. Omit it, and the template
  renders the rounded `Border` with nothing inside — `Content` is set on
  the `Button` but nothing in the template says where to put it.

**When to reach for this vs. a `Style`:** a `Style` for anything that's
just different property values on the existing default look; a
`ControlTemplate` only when the control's actual shape needs to differ
from the platform default — genuinely rarer in most real projects than
`Style`, and worth recognizing so you don't reach for it when a `Style`
would do.

## `IValueConverter` — transforming a value between the object and the UI

Binding (Lesson 06) shows a property's value directly. Sometimes the
*displayed* form needs to differ from the *stored* form — a `bool`
displayed as `Visibility`, a `DateTime?` displayed as "Never" when
`null`. `IValueConverter` is the real interface for this:

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

`IValueConverter` — a real interface, two methods: `Convert` (source
value → what the UI actually displays) and `ConvertBack` (UI value → what
gets written to the source, only needed for a `TwoWay` binding actually
writing back — `throw new NotImplementedException();` here is honest:
this specific converter is only ever used `OneWay`, so `ConvertBack` is
correctly never called). `<local:BoolToVisibilityConverter x:Key="BoolToVis"
/>` — the converter itself is declared as a resource (Lesson 08's exact
mechanism — `x:Key`, looked up by `StaticResource`), because a
`Converter=` on a binding needs a real *instance* of the class, and
resources are how XAML constructs and names object instances generally,
not something special to converters. `local:` — a prefixed namespace
mapped (via an `xmlns:local="clr-namespace:..."` declaration, Lesson 02)
to your own project's C# namespace, the standard way custom classes get
referenced from XAML at all.

`Visibility="{Binding IsSaved, Converter={StaticResource BoolToVis}}"` —
a `{StaticResource}` markup extension **nested inside** a `{Binding}`
markup extension — legal, and common: the `Converter=` property of a
`Binding` needs an object (an `IValueConverter` instance), and
`{StaticResource BoolToVis}` is exactly that lookup, evaluated first, its
result then handed to `Binding` as one of its own property values.

## `Visibility` — three states, not a `bool`

**Flagged in passing above, worth stating directly:** WPF's
`Visibility` enum has three values, not two — `Visible`, `Collapsed`
(invisible, and takes up **zero** layout space, as if it wasn't there),
and `Hidden` (invisible, but still occupies its layout space, leaving a
blank gap). This is why `BoolToVisibilityConverter` can't just be
`bool`-typed on the XAML side directly — `Visibility` is a distinct,
three-state type, and converting a plain `bool` into it is exactly the
kind of gap `IValueConverter` exists to bridge.

## SE Lens

`DataTemplate`/`ControlTemplate`/`IValueConverter` are three different
answers to "the direct binding isn't enough," each solving a genuinely
different mismatch: `DataTemplate` when the data has no inherent visual
form at all (a plain `Item` object isn't a picture of anything until
templated); `ControlTemplate` when an existing control's *behavior* is
right but its *shape* is wrong; `IValueConverter` when a value's *type*
or *format* doesn't match what a property expects, with the underlying
data otherwise unchanged. Reaching for the wrong one works around the
symptom without fixing the actual mismatch — a `Converter` that secretly
builds UI elements, or a `DataTemplate` used just to reformat a string,
are both signs of picking the wrong tool for the actual problem.

## What to check first in your assigned project

- Any `ListBox`/`ItemsControl`/`DataGrid` showing a raw type name instead
  of real content is missing (or has a broken) `ItemTemplate` — check
  there first.
- Search for classes implementing `IValueConverter` — each one names a
  real type mismatch someone already solved; understanding what each
  converts tells you a lot about what the underlying data actually looks
  like versus what's shown.
- A `ControlTemplate` is a bigger, riskier thing to modify than a
  `Style` — before changing one, confirm you understand which
  `ContentPresenter`/binding inside it is load-bearing for the control
  still functioning.

## Next

[Lesson 10 — Dependency Properties](lesson-10-dependency-properties.md)
covers the property system every `TemplateBinding`, `Style`, and
`{Binding}` in the last three lessons has quietly depended on —
`DependencyProperty`, and why WPF built its own instead of using plain
C# properties.
