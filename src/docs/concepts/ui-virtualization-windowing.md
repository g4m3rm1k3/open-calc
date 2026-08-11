# Concept: UI Virtualization (Windowing) — Render Only What's Visible

**What you'll understand by the end:** the general pattern behind why a scrollable list of ten thousand items doesn't create ten thousand real on-screen elements — only real containers for whatever the viewport can actually show, plus a small buffer, regardless of how large the underlying collection grows.

**Prerequisites:** none.

## Setup

```
dotnet new wpf -o lab-windowing
cd lab-windowing
```

Edit the generated `MainWindow.xaml` and `MainWindow.xaml.cs` to match the example below. (This example uses WPF to produce real, measured numbers; the pattern itself is not WPF-specific — see CS Lens, below.)

## The Problem

A scrollable list backed by a large collection could, in principle, build one real visual element per item the moment the collection is bound — a real, laid-out row for every single one, whether the screen can show it or not. At small scale this is invisible; at real scale it isn't: building thousands of real UI elements up front, most of which the user will never actually see on screen at any given moment, spends real, measurable time and memory on work whose result is mostly invisible. The viewport — the actual visible region of the screen — can only ever show a small, roughly constant number of items no matter how large the bound collection grows; something has to keep the *realized* work tracking the viewport instead of the collection.

## The Isolated Example

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<ListBox x:Name="list" Loaded="List_Loaded" />
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Diagnostics;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Threading;

namespace lab_windowing;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void List_Loaded(object sender, RoutedEventArgs e)
    {
        List<int> items = new();
        for (int i = 0; i < 5000; i++)
        {
            items.Add(i);
        }

        Stopwatch stopwatch = Stopwatch.StartNew();
        list.ItemsSource = items;
        Pump();
        stopwatch.Stop();

        int realized = CountDescendants<ListBoxItem>(list);
        Console.WriteLine($"Items bound: {items.Count}");
        Console.WriteLine($"Containers realized: {realized}");
        Console.WriteLine($"Time to bind and lay out: {stopwatch.ElapsedMilliseconds}ms");

        Application.Current.Shutdown();
    }

    private void Pump()
    {
        list.UpdateLayout();
        for (int pump = 0; pump < 5; pump++)
        {
            Dispatcher.Invoke(() => { }, DispatcherPriority.Background);
        }
        list.UpdateLayout();
    }

    private static int CountDescendants<T>(DependencyObject parent) where T : DependencyObject
    {
        int count = 0;
        int childCount = VisualTreeHelper.GetChildrenCount(parent);
        for (int i = 0; i < childCount; i++)
        {
            DependencyObject child = VisualTreeHelper.GetChild(parent, i);
            if (child is T)
            {
                count++;
            }
            count += CountDescendants<T>(child);
        }
        return count;
    }
}
```

Run it on a Windows machine:

```
dotnet run
```

**Real output (virtualization on, the default):**
```
Items bound: 5000
Containers realized: 16
Time to bind and lay out: 58ms
```

Now add `VirtualizingPanel.IsVirtualizing="False"` to the `ListBox` and run again:

```xml
<ListBox x:Name="list" Loaded="List_Loaded" VirtualizingPanel.IsVirtualizing="False" />
```

**Real output (virtualization off):**
```
Items bound: 5000
Containers realized: 5000
Time to bind and lay out: 2520ms
```

**What this proves:** with virtualization on, only `16` real `ListBoxItem` containers exist after binding `5000` items — a number matched to how many rows the window can actually show, not to the collection's size — and building them took `58ms`. With virtualization forced off, all `5000` items each got a real container, whether visible or not, and building them took `2520ms` — over forty times longer, for the exact same data, to produce a result the user could see at most a few dozen rows of at any one time.

## Mechanical Walkthrough

- `list.ItemsSource = items` — binds the entire collection at once; nothing about this call, by itself, says how many *visual* elements should exist.
- `VirtualizingPanel.IsVirtualizing="False"` — an attached property, `true` by default on any items-rendering control in WPF, forcing every bound item to get a real container immediately regardless of visibility. Setting it explicitly to `false` here exists only to force the non-virtualized case into view for comparison.
- `CountDescendants<ListBoxItem>(list)` — walks the real, live visual tree and counts exactly how many container objects genuinely exist right now, as opposed to how many *should* exist for the item count — the direct, honest measurement this whole concept rests on, not an assumption about internal behavior.
- `16` vs `5000` — the core distinction this file exists to name: the realized container count tracks the *viewport*, not the *collection*. Growing the bound collection from `5000` to `5,000,000` would not change the `16` figure by a single container; only making the window taller, or the rows shorter, would.

## CS Lens

This is **UI virtualization**, also called **windowing**: rendering real work only for the currently-visible slice ("window") of a much larger logical collection, and discarding or recycling that work as the window moves. Framed in Big-O terms: realizing every item up front is **O(n)**, where `n` is the collection's own size — cost grows without bound as the collection grows. Virtualized realization is **O(v)**, where `v` is the number of items the viewport can show plus a small buffer — a number that depends on window size and item height, genuinely independent of `n`. The `2520ms`-vs-`58ms` gap measured above is that distinction made concrete, not abstract.

Also recognized in: Android's `RecyclerView`, whose entire design (and name) centers on reusing a small, bounded pool of row views instead of inflating one per data item; any modern JavaScript "virtualized list" library (`react-window`, `react-virtualized`, and similar) applying the identical idea to a browser DOM, where building thousands of real DOM nodes is exactly as costly, proportionally, as building thousands of real WPF containers; a database cursor or paginated API fetching only the current page of rows instead of the entire table at once — the same "don't materialize what nothing is currently looking at" instinct, one layer further back in the system, applied to data instead of visual elements.

## SE Lens

Why isn't virtualization something every list-rendering control has to opt into explicitly? Because the failure mode of *not* virtualizing scales with real user data, not with anything visible in a small test — a list that looks perfectly fine with fifty items during development can become the `2520ms`-class freeze measured above the first time it meets a real dataset an order of magnitude larger, often in production, often as a support ticket rather than a caught bug. Defaulting virtualization to on, and making it something a developer has to actively *disable* to reproduce the slow path, puts the safe behavior on the path of least resistance instead of relying on every consumer of an items-rendering control remembering to ask for it. The real, honest tradeoff virtualization accepts in exchange: a container can be constructed, destroyed, or reused multiple times over a scroll session, so any state a developer stores directly *on* one particular container instance (rather than on the underlying bound data) can vanish or get reassigned to a different item without warning — a real, common source of "why did my UI state randomly reset while scrolling" bugs when someone works against virtualization instead of with it.

## Connection

Commonly paired with recycling — reusing a small, fixed pool of already-built containers across a whole scroll session rather than constructing and discarding a fresh one every time a new item scrolls into view — a further optimization layered on top of virtualization itself, not a separate concept: virtualization bounds how many containers exist *at once*; recycling additionally bounds how many are ever *constructed* across a session that scrolls further than the viewport alone would suggest.

## Try It Yourself

1. Change the item count from `5000` to `50000` and rerun the virtualized case only — predict, before running, whether the realized-container count changes at all, then confirm with real output.
2. Resize the window taller before the items bind (or reduce each row's effective height) and rerun the virtualized case — confirm the realized-container count changes, and reason about why that number is tied to the viewport's pixel size rather than being some other fixed constant.
3. With virtualization back on, scroll the list programmatically (or by hand, if running interactively) and re-run the container count — confirm it stays roughly the same small number throughout a scroll session, rather than growing as more of the collection has, at some point, been shown.
