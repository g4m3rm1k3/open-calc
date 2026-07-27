# Concept: XAML — Declarative UI Markup That Compiles Into Code

**What you'll understand by the end:** what XAML actually is, how `x:Class` links a markup file to a real C# class, and what `InitializeComponent()` — a method with no visible body — actually comes from.

**Prerequisites:** `csharp-partial-classes.md` (XAML's own generated code depends directly on `partial`); basic XML/HTML tag syntax (elements, attributes, nesting, self-closing tags).

## Setup

.NET SDK with the `wpf` template available (`dotnet new list` shows it) — Windows only, WPF has no cross-platform build.

## The Problem

WPF wants one half of a window's definition (its visual layout — what's on screen) authored in a format suited to describing trees of visual elements, and the other half (behavior — what happens on a click) authored in a general-purpose language. Something has to actually connect the two into one real, running object.

## The Isolated Example

`dotnet new wpf -n ConceptDemo` generates `MainWindow.xaml`:
```xml
<Window x:Class="ConceptDemo.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:ConceptDemo"
        mc:Ignorable="d"
        Title="MainWindow" Height="450" Width="800">
    <Grid>

    </Grid>
</Window>
```
and `MainWindow.xaml.cs`:
```csharp
namespace ConceptDemo;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }
}
```

Building and running:
```
dotnet build
```
**Real output:**
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```
A real window process confirmed running:
```
dotnet run
tasklist /FI "IMAGENAME eq ConceptDemo.exe"

Image Name                     PID Session Name        Session#    Mem Usage
========================= ======== ================ =========== ============
ConceptDemo.exe              37584 Console                    1    104,736 K
```

**What this proves:** `InitializeComponent()` has no body anywhere in `MainWindow.xaml.cs`, and yet the project builds with zero errors and a real window process actually runs — proof that *something* generates a real implementation of that method from `MainWindow.xaml` at build time, not that the call is somehow optional or stubbed out.

Renaming `x:Class="ConceptDemo.MainWindow"` to a name that doesn't match the real class and rebuilding:
```
error CS0103: The name 'InitializeComponent' does not exist in the current context
```
The error points at `MainWindow.xaml.cs`, not the `.xaml` file where the actual mistake is — confirming `x:Class` is the *only* thing linking the markup to the real class; nothing about file location or naming convention does this.

## Mechanical Walkthrough

- `<Window ...>` — XAML (**eXtensible Application Markup Language**) is XML; the root element's name is a real WPF class (`Window`, from `System.Windows`) — writing `<Window>...</Window>` declaratively constructs a `Window` object, the same real operation as `new Window()` in C#.
- `x:Class="ConceptDemo.MainWindow"` — the single load-bearing attribute: tells the build system which real `partial class` this markup's generated half belongs to.
- `xmlns="..."` / `xmlns:x="..."` — **XML namespace** declarations; not URLs that are fetched, just unique strings identifying which vocabulary of element names (`Window`, `Grid`, ...) this file uses, and (the `x:`-prefixed one) which attributes are XAML's own language-level ones (like `x:Class`) rather than an ordinary WPF property.
- `Title="MainWindow" Height="450" Width="800"` — ordinary XML attributes setting real properties on the constructed `Window` object; identical in effect to writing `this.Title = "MainWindow";` in C#.
- `<Grid></Grid>` — a child element; empty here, so the window renders as a blank rectangle.
- `public partial class MainWindow : Window` — the hand-written half: `partial` merges this with the generated half; `: Window` is inheritance, giving `MainWindow` every capability `Window` already has.
- `InitializeComponent();` — a call with no visible definition in this file. It is real: the build process compiles `MainWindow.xaml` into a *third*, generated `partial class MainWindow` piece containing a real `InitializeComponent()` method that constructs the object tree the markup described — proven directly above, both by the running process and by the specific compiler error produced when `x:Class` is broken on purpose.

## CS Lens

This is **declarative vs. imperative** construction: XAML states *what* the object tree should look like; the generated code it compiles into is the *how* — a real sequence of `new Grid(); this.Content = grid; ...` calls, the same relationship a SQL query (what rows to return) has to a query planner (how to actually get them).

Also recognized in: HTML (declaring a document tree the browser constructs into real DOM objects), any UI framework with a markup/logic split (Android's XML layouts + Kotlin/Java code-behind), React's JSX (declaring a component tree compiled into real function calls).

## SE Lens

The real alternative WPF could have chosen — building the entire visual tree by hand in C# (`new Grid(); grid.Children.Add(new TextBlock { Text = "..." }); ...`, which is genuinely what `InitializeComponent()` itself does, generated) — is valid, real WPF with no XAML at all. The cost of *not* splitting into markup + code-behind: a window with any real layout complexity becomes a wall of imperative calls with no visual shape matching what actually renders, where XAML's nested-element syntax visually mirrors the nested tree it produces. The cost this split pays instead: two files per window to keep mentally associated, and a generated third piece a reader can't `Ctrl+click` into by reading source alone.

## Connection

Depends directly on `csharp-partial-classes.md` — the exact mechanism letting the generated half and the hand-written half merge into one real class. `wpf-layout-panels-and-controls.md` covers what actually goes *inside* the `<Grid>` shown empty here.

## Try It Yourself

1. Change `Title="MainWindow"` to a different string, rebuild, and run — confirm the window's real title bar reflects it, proof `Title` really is a settable property, not just descriptive text.
2. Delete the `InitializeComponent();` call from `MainWindow.xaml.cs` entirely (there's nothing to delete on the generated side — it's produced separately) and rebuild. Predict whether it compiles before running the command, then compare — reason about why removing a call to a method that still exists produces the result it does.
3. Open the actual generated code the build produces (`obj/Debug/net10.0-windows/MainWindow.g.cs`, created automatically, never hand-edited) and read `InitializeComponent()`'s real body — confirm it's really a sequence of `new Grid()`/`this.Content = ...`-style calls, not magic.
