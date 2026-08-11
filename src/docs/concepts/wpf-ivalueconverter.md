# Concept: `IValueConverter`

**What you'll understand by the end:** why a binding sometimes needs a seam between "the value the source property actually holds" and "the value the UI should display or receive," and how `IValueConverter`'s `Convert`/`ConvertBack` pair, plus the `CultureInfo` parameter each one receives, fill that seam.

**Prerequisites:** `wpf-data-binding-and-datacontext.md`.

## Setup

```
dotnet new wpf -o lab-converter
cd lab-converter
```

Edit the generated `MainWindow.xaml` and `MainWindow.xaml.cs` to match the example below.

## The Problem

A plain `{Binding SomeProperty}` connects a UI element's property directly to a source property's *actual* value, unchanged. That's often exactly right — but not always: a source might hold a `double` that needs to *display* as a formatted, culture-correct string; a `bool` that needs to *display* as `Visibility.Collapsed`/`Visibility.Visible`; a raw number that needs to *display* grouped into a category label. None of these are the source's job to know about — a `double` property shouldn't have to format itself for one specific `TextBlock`'s benefit, especially if a second `TextBlock` elsewhere needs the same value shown a different way. Binding needs a way to transform a value on its way *out* to the UI, and, when the UI can also write back, transform it in reverse on the way *in*.

## The Isolated Example

Replace `MainWindow.xaml`'s contents:

```xml
<Window x:Class="lab_converter.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:local="clr-namespace:lab_converter"
        Title="MainWindow" Height="450" Width="800">
    <Window.Resources>
        <local:NumberConverter x:Key="NumberConverter" />
    </Window.Resources>
    <StackPanel x:Name="Root" Loaded="Root_Loaded">
        <TextBlock x:Name="RawValue" Text="{Binding Amount}" />
        <TextBlock x:Name="UsFormatted" Text="{Binding Amount, Converter={StaticResource NumberConverter}, ConverterCulture=en-US}" />
        <TextBlock x:Name="DeFormatted" Text="{Binding Amount, Converter={StaticResource NumberConverter}, ConverterCulture=de-DE}" />
    </StackPanel>
</Window>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Globalization;
using System.Windows;
using System.Windows.Data;

namespace lab_converter;

public partial class MainWindow : Window
{
    public double Amount { get; set; } = 1234.5;

    public MainWindow()
    {
        InitializeComponent();
        DataContext = this;
    }

    private void Root_Loaded(object sender, RoutedEventArgs e)
    {
        Console.WriteLine($"RawValue.Text (no converter): {RawValue.Text}");
        Console.WriteLine($"UsFormatted.Text (en-US): {UsFormatted.Text}");
        Console.WriteLine($"DeFormatted.Text (de-DE): {DeFormatted.Text}");

        NumberConverter converter = new NumberConverter();

        object backFromUs = converter.ConvertBack(UsFormatted.Text, typeof(double), null, CultureInfo.GetCultureInfo("en-US"));
        Console.WriteLine($"ConvertBack('{UsFormatted.Text}', en-US): {backFromUs}");

        object backFromDe = converter.ConvertBack(DeFormatted.Text, typeof(double), null, CultureInfo.GetCultureInfo("de-DE"));
        Console.WriteLine($"ConvertBack('{DeFormatted.Text}', de-DE): {backFromDe}");

        try
        {
            converter.ConvertBack(DeFormatted.Text, typeof(double), null, CultureInfo.GetCultureInfo("en-US"));
        }
        catch (FormatException ex)
        {
            Console.WriteLine($"ConvertBack('{DeFormatted.Text}', WRONG culture en-US) threw: {ex.GetType().Name}");
        }

        Application.Current.Shutdown();
    }
}

public class NumberConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        return ((double)value).ToString("N2", culture);
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
    {
        return double.Parse((string)value, NumberStyles.Number, culture);
    }
}
```

Run it on a Windows machine:

```
dotnet run
```

**Real output:**
```
RawValue.Text (no converter): 1234.5
UsFormatted.Text (en-US): 1,234.50
DeFormatted.Text (de-DE): 1.234,50
ConvertBack('1,234.50', en-US): 1234.5
ConvertBack('1.234,50', de-DE): 1234.5
ConvertBack('1.234,50', WRONG culture en-US) threw: FormatException
```

**What this proves:** the same source value, `Amount = 1234.5`, produced three genuinely different displayed strings — `RawValue` shows `.ToString()`'s own plain default, while the two converted `TextBlock`s each ran `Convert` automatically as part of binding, formatting the identical number differently purely based on which `CultureInfo` the binding was told to use (a comma-decimal, period-thousands en-US format versus a period-decimal, comma-thousands de-DE format). Calling `ConvertBack` directly, by hand, with the *matching* culture correctly recovers `1234.5` both times — proof the transformation genuinely round-trips. Calling it with the *wrong* culture on de-DE-formatted text throws a real `FormatException`, because `"1.234,50"` parsed as if it were en-US-formatted reads as the number `1.234` with stray trailing characters, not `1234.5` — a real, honest failure, not a hypothetical one.

## Mechanical Walkthrough

- `class NumberConverter : IValueConverter` — **first appearance.** `IValueConverter` is a plain, two-method interface from `System.Windows.Data`; implementing it is what makes a class usable as a binding converter at all — nothing here inherits from any WPF control.
- `Convert(object value, Type targetType, object parameter, CultureInfo culture)` — called automatically by the binding engine, once, every time the binding reads the source value to display it. `value` is the raw source value (`Amount`, a real `double`); `targetType` is the type the binding is ultimately assigning into (`string`, since `Text` is a `string` property); `parameter` is an optional, fixed extra value a binding can supply via `ConverterParameter` (unused here — always `null`); `culture` is whatever the binding's own `ConverterCulture` was set to.
- `ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)` — the reverse direction: called automatically only for a `TwoWay` binding, when the UI writes a new value back toward the source, to turn the UI's raw value (typically a `string` typed into a `TextBox`) back into the source property's real type. This lab's bindings are all one-way (`Text` display only), so `ConvertBack` is called directly, by hand, instead — the same honest substitute this project's own drag-and-drop material uses for interaction that can't be driven headlessly: proving the method's real behavior without needing a live, two-way-bound control actually being typed into.
- `Converter={StaticResource NumberConverter}` — a binding property pointing the binding at a converter instance declared once, in `Window.Resources`, and shared by every binding that references it — the same `StaticResource` lookup mechanism used for any other shared resource.
- `ConverterCulture=en-US` / `ConverterCulture=de-DE` — sets exactly what `Convert`/`ConvertBack`'s own `culture` parameter receives. Left unset, a binding defaults to the current thread's own culture — explicit here specifically so the same source value can be shown two genuinely different, real ways side by side, deterministically, regardless of what culture the machine running this lab happens to be set to.
- `((double)value).ToString("N2", culture)` — reappearing shape (a culture-aware numeric format string, the same idea any culture-sensitive formatting call relies on), `"N2"` meaning "a number, grouped, two decimal places" — the actual grouping/decimal characters used come entirely from `culture`, not from the format string itself.
- `double.Parse((string)value, NumberStyles.Number, culture)` — the literal reverse of the line above: given a string and a culture, recovers the real `double` that string represents *in that culture's own number format* — which is exactly why supplying the wrong culture at this call site is what produced the real `FormatException` above.

## CS Lens

`IValueConverter` is the seam in WPF's data-binding pipeline: source property → (optional) `Convert` → target property, and, for two-way bindings, target → (optional) `ConvertBack` → source. It exists because "the value stored" and "the value displayed" are frequently, legitimately different shapes, and hardcoding that transformation into the source property itself would mean the source could only ever be displayed one way, everywhere it's bound.

Also recognized in: any serialization boundary where the stored representation and the in-memory representation genuinely differ (a database `TypeDecorator`/custom column converter, a JSON (de)serializer's custom `JsonConverter`); a web form library's own "parse the typed string back into a real value, format the real value back into a displayed string" pair; any MV* framework's own binding-converter concept under a different name (Android Data Binding's `@BindingAdapter`-plus-converter functions, for instance) — the shared shape is always "two matched functions, one each direction, sitting between a stored value and a displayed one."

## SE Lens

Why does `Convert` take a `CultureInfo` at all, rather than the converter just picking one culture and always using it? Because a converter is meant to be reusable across every binding that might ever use it, and "how should this number look" is genuinely different depending on who's looking at it — a converter that hardcoded `en-US` formatting would silently mis-format data for a user whose machine, or whose binding, specifies a different culture. Threading `culture` through every call keeps that decision at the *binding* site, where the actual display context is known, rather than baked into the converter, which has no way to know who's using it. The real cost: a converter's author has to remember to actually *use* the passed-in `culture` for anything locale-sensitive — nothing forces it, and a converter that quietly ignores its own `culture` parameter (formatting with a hardcoded culture internally instead) fails exactly as silently as the wrong-culture `ConvertBack` call above, just baked in instead of caused by a caller's mistake.

## Connection

Frequently used together with `wpf-itemscontrol-and-datatemplate.md` — a `DataTemplate`'s own bindings are exactly where a converter is commonly needed, whenever an item's raw bound value isn't already the shape the template wants to display directly.

## Try It Yourself

1. Add a `ConverterParameter="C"` to one binding and change `Convert` to use `parameter as string ?? "N2"` as its format string instead of a hardcoded `"N2"` — confirm, with real output, that the same converter now produces currency-formatted output for that one binding without needing a second converter class.
2. Remove `ConverterCulture` from one of the two `TextBlock`s entirely and rerun — read what culture the binding actually falls back to when none is specified (this is worth seeing directly rather than assumed).
3. Implement `ConvertBack` to throw `NotSupportedException` instead of actually parsing, and confirm — by calling it directly, the same way this lab already does — that the exception is real and immediate, the correct choice for a converter genuinely meant to be one-way only.
