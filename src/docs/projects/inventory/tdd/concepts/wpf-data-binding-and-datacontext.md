# Concept: Data Binding and `DataContext`

**What you'll understand by the end:** how `Text="{Binding Message}"` connects a UI element to a C# property without any code reading or writing that element directly — and the real limit of that connection on its own.

**Prerequisites:** `xaml-x-name-and-generated-fields.md` (binding is presented here as the alternative to that file's own reach-in-from-code-behind approach).

## Setup

*(Full walkthrough of these mechanics: `../wpf-lessons/HOW-TO-RUN-EXAMPLES.md`.)*

```
dotnet new wpf -n ConceptDemo -o ConceptDemo
cd ConceptDemo
```
Edit the generated `MainWindow.xaml` and `MainWindow.xaml.cs` to match
the example below.

## The Problem

`x:Name` plus direct assignment (`SomeText.Text = "...";`) works, but it means code-behind has to remember to update every element that shows a given piece of data, by hand, every time that data changes, anywhere it changes. A window with several elements all showing the same underlying value needs a way to describe that relationship once, declaratively, instead of writing a fresh assignment at every call site.

## The Isolated Example

```xml
<TextBlock x:Name="BoundText" Text="{Binding Message}" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center" />
```

```csharp
public string Message { get; set; } = "Hello";

public MainWindow()
{
    InitializeComponent();
    DataContext = this;
    Loaded += MainWindow_Loaded;
}

private void MainWindow_Loaded(object sender, RoutedEventArgs e)
{
    Console.WriteLine($"BoundText.Text once the window is actually live: '{BoundText.Text}'");

    Message = "Changed after binding";
    Console.WriteLine($"Message property is now: '{Message}'");
    Console.WriteLine($"BoundText.Text with NO change notification: '{BoundText.Text}'");
}
```

**Real output:**
```
BoundText.Text once the window is actually live: 'Hello'
Message property is now: 'Changed after binding'
BoundText.Text with NO change notification: 'Hello'
```

**What this proves:** `{Binding Message}` really did read `Message` — `BoundText.Text` shows the real initial value, `'Hello'`, with no assignment ever written to `BoundText.Text` directly. But after `Message` is changed in C#, `BoundText.Text` is still `'Hello'` — proof binding reads a property once and does *not*, on its own, notice a later plain assignment. (The fix — making it notice — is `csharp-inotifypropertychanged.md`, immediately next.)

## Mechanical Walkthrough

- `DataContext = this;` — sets the **data context**: the object a `{Binding}` expression, with no other source specified, looks on for the property it names. Setting it on the `Window` makes it the default source for every binding inside that window, unless a specific element overrides its own `DataContext`.
- `Text="{Binding Message}"` — a **markup extension** (curly-brace syntax, distinct from a plain string attribute like `Text="Hello"`): tells WPF "don't set `Text` to the literal string `Message` — instead, look up a property named `Message` on the current `DataContext`, and use *its* value." `Message` here is a **binding path** — the property name to read.
- `public string Message { get; set; } = "Hello";` — an ordinary C# **auto-property** (a property with a compiler-generated backing field, `{ get; set; }`, rather than a hand-written one) — nothing binding-specific about its declaration; what's missing (proven above) is any way for it to *announce* a change after the fact.

## CS Lens

This is **declarative data flow**: the relationship ("this element shows that property's value") is stated once, as data, rather than as a sequence of imperative assignment statements scattered across every place the value could change — the same declarative-over-imperative shift `xaml-declarative-ui-markup.md` already named for the object tree itself, now applied to *values* instead of *structure*.

Also recognized in: any MV* UI framework's own binding system (Android's Data Binding Library, SwiftUI's property wrappers, Vue's `v-bind`), spreadsheet formulas (a cell showing `=A1` updates when `A1` does, without the formula being re-typed).

## SE Lens

The real cost binding pays for this convenience, proven directly above: a binding is not automatically "live" just because a property changed — something has to actively notify it, or it silently goes stale. That's not a flaw unique to WPF; it's the honest tradeoff declarative data flow always makes somewhere — the notification mechanism has to exist *somewhere*, and `csharp-inotifypropertychanged.md` is where WPF puts it.

## Connection

Builds on `xaml-x-name-and-generated-fields.md` as the alternative it's replacing. `csharp-inotifypropertychanged.md` is the mechanism that closes the gap this file's own isolated example deliberately leaves open.

## Try It Yourself

1. Remove `DataContext = this;` entirely and rerun — read what `BoundText.Text` actually shows with no data context set at all (not an error; a specific, real, empty-ish result worth seeing directly).
2. Change the binding path to a property name that doesn't exist (`{Binding Nope}`) and rerun — confirm this does *not* produce a compile error or a crash; reason about why a typo'd binding path fails silently rather than loudly.
3. Set `DataContext` on the `TextBlock` itself, to a *different* object than the `Window`'s own `DataContext`, and confirm the binding now reads from that closer, more specific `DataContext` instead of the `Window`'s.
