# Concept: `ItemsControl` and `DataTemplate`

**What you'll understand by the end:** how `ItemsControl` renders an arbitrary bound collection by generating one real visual element per item, and how a `DataTemplate` describes exactly what each of those elements should look like — the general mechanism underneath any custom, non-`ListBox`/`DataGrid` list of items in WPF.

**Prerequisites:** `wpf-data-binding-and-datacontext.md`.

## Setup

```
dotnet new wpf -o lab-itemscontrol
cd lab-itemscontrol
```

Edit the generated `MainWindow.xaml` and `MainWindow.xaml.cs` to match the example below.

## The Problem

`ListBox` and `DataGrid` are both `ItemsControl`s with their own built-in, opinionated visual shape — a selectable row, or a grid of cells. Sometimes neither shape is what's actually needed: a list of colored tags, a grid of category buttons, a row of small cards — some arbitrary visual layout, repeated once per item in a collection, with no selection or tabular structure implied at all. Hand-building that visual layout once per item, and manually keeping it in sync every time the underlying collection changes, is exactly the kind of bookkeeping data binding already solves for a single value — the same problem, just repeated across a whole collection instead of one property.

## The Isolated Example

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel x:Name="Root" Loaded="Root_Loaded">
    <ItemsControl x:Name="ColorList" ItemsSource="{Binding Colors}">
        <ItemsControl.ItemTemplate>
            <DataTemplate>
                <Border Width="120" Height="30" Margin="0,2,0,0" Background="{Binding}">
                    <TextBlock Text="{Binding}" HorizontalAlignment="Center" VerticalAlignment="Center" />
                </Border>
            </DataTemplate>
        </ItemsControl.ItemTemplate>
    </ItemsControl>
</StackPanel>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace lab_itemscontrol;

public partial class MainWindow : Window
{
    public List<string> Colors { get; } = new() { "Red", "Green", "Blue" };

    public MainWindow()
    {
        InitializeComponent();
        DataContext = this;
    }

    private void Root_Loaded(object sender, RoutedEventArgs e)
    {
        List<Border> allBorders = new();
        CollectDescendants(ColorList, allBorders);
        List<Border> borders = allBorders.Where(b => b.Width == 120).ToList();

        Console.WriteLine($"Colors bound: {Colors.Count}");
        Console.WriteLine($"Border containers realized (our template only): {borders.Count}");
        foreach (Border border in borders)
        {
            TextBlock text = (TextBlock)border.Child;
            Console.WriteLine($"  Border.Background: {border.Background}, TextBlock.Text: {text.Text}");
        }

        Application.Current.Shutdown();
    }

    private static void CollectDescendants(DependencyObject parent, List<Border> found)
    {
        int childCount = VisualTreeHelper.GetChildrenCount(parent);
        for (int i = 0; i < childCount; i++)
        {
            DependencyObject child = VisualTreeHelper.GetChild(parent, i);
            if (child is Border border)
            {
                found.Add(border);
            }
            CollectDescendants(child, found);
        }
    }
}
```

Run it on a Windows machine:

```
dotnet run
```

**Real output:**
```
Colors bound: 3
Border containers realized (our template only): 3
  Border.Background: #FFFF0000, TextBlock.Text: Red
  Border.Background: #FF008000, TextBlock.Text: Green
  Border.Background: #FF0000FF, TextBlock.Text: Blue
```

**What this proves:** `ItemsControl` built exactly one real `Border` (wrapping one `TextBlock`) per string in `Colors` — not one shared, reused element, three genuinely separate visual objects, confirmed by walking the real, live visual tree and finding three. Each `Border`'s `Background` and its child `TextBlock`'s `Text` both resolved to the *same* item that particular copy of the template was generated for (`"Red"` colors the first border red and labels it "Red", not some other item's value) — proof each instantiated template is bound to its own item, independently of the others.

## Mechanical Walkthrough

- `ItemsSource="{Binding Colors}"` — an ordinary data binding (see `wpf-data-binding-and-datacontext.md`) whose target is `ItemsControl`'s own `ItemsSource` property: the collection to render, one visual element per element in it.
- `<ItemsControl.ItemTemplate><DataTemplate>...</DataTemplate></ItemsControl.ItemTemplate>` — a `DataTemplate` is not itself a visible element; it's a *template* — a blueprint `ItemsControl` instantiates once per item, producing a genuinely separate, real element tree each time, not a single shared element reused in place.
- `{Binding}` with no property name, inside the `DataTemplate` — a binding with an empty path. Each instantiated copy of the template gets its own `DataContext` set automatically to the specific item it was generated for; a bare `{Binding}` means "the whole item itself," not one of its properties — correct here because `Colors` holds plain `string`s with no properties to bind into. `Background="{Binding}"` binds a `string` like `"Red"` directly to a `Brush`-typed property, relying on WPF's built-in string-to-`Brush` conversion — the same kind of implicit conversion that lets `Background="Red"` work as a literal attribute elsewhere.
- `Width="120" Height="30"` on the `Border` — an ordinary fixed size, present here only to make the real output above filterable from any other `Border` the window might otherwise contain — not part of the mechanism itself.

## CS Lens

This is the same underlying mechanism `ListBox` and `DataGrid` are already built on — both are `ItemsControl` subclasses with their own default `ItemTemplate`/row style baked in. Overriding `ItemTemplate` directly, on a plain `ItemsControl`, is what removes every one of those built-in opinions (selection, keyboard navigation, row chrome) and leaves only "one arbitrary visual per item," which is exactly what's wanted when the goal is a custom layout rather than a selectable list or a table.

Also recognized in: any UI framework's own "repeat this template once per item" primitive — Android's `RecyclerView` pairing a layout XML file with an adapter, a React component rendered inside `.map()` over an array, a templating engine's `{{#each}}`/`{% for %}` block rendering one copy of a markup fragment per element of a passed-in list. Different syntax, identical shape: a template plus a collection produces one real instance per element, kept in sync as the collection changes.

## SE Lens

Why does `ItemsControl` exist as a separate, more primitive base class instead of every list-like control just being a `ListBox`? Because `ListBox`'s selection and keyboard-navigation behavior is a real cost, not a neutral default — a row of read-only status tags, or a grid of category buttons with their own click behavior, doesn't want an invisible "selected" state fighting with, or duplicating, logic the actual items already handle themselves. `ItemsControl` is the honest minimum: "render a collection," with every other behavior (selection, scrolling chrome, row layout) layered on top only by a more specific subclass that actually needs it. The real tradeoff: a plain `ItemsControl` gives up `DataGrid`'s free column layout and `ListBox`'s free selection entirely — anything beyond "one item, one template instance" has to be built by hand, same as any interaction the category `Border`s above would need (a click handler, a hover effect) if the collection this template renders isn't just decorative.

## Connection

Builds directly on `wpf-data-binding-and-datacontext.md` — the same `{Binding}` mechanism, applied once per generated item instead of once for a whole window. Commonly paired with `wpf-ivalueconverter.md` when an item's raw bound value isn't already in the shape a `DataTemplate` needs to display directly.

## Try It Yourself

1. Add a fourth string to `Colors` and rerun — confirm the realized-border count and per-item output both grow to match, with no other code change.
2. Replace `List<string> Colors` with a small class holding two properties (say, `Name` and `HexColor`), and change the template's bindings from bare `{Binding}` to `{Binding Name}`/`{Binding HexColor}` — confirm each generated `Border` now reads from its own item's specific properties instead of the whole item.
3. Remove the `ItemTemplate` entirely and rerun. Read what `ItemsControl` falls back to displaying for each item with no template supplied at all — a real, specific default worth seeing rather than assuming.
